/* Cylon Defense: sound.
 *
 * The WebAudio buses, the sound effects and the music bed, behind a small
 * interface: cylon.js asks for an effect by name, tells the module when a
 * setting changed or the session's state moved, and never sees the context, the
 * buses or the bed's timer. Nothing here touches the page: the settings, the
 * session state and the volume curve (rules.volumeToGain) are handed in, and a
 * browser without WebAudio gets a module that stays silent. */

/* ---------- the public interface ---------- */

/** The battlefield events that have a voice. */
export type SfxName =
  | 'projectile' | 'hit' | 'heal' | 'ko' | 'nuke' | 'raptor'
  | 'grenadeArm' | 'grenade' | 'missile' | 'trackerMissile'
  | 'introLaunch' | 'nukeLaunch';

/** The two gain buses; the volume curve differs per bus (rules.volumeToGain). */
export type Bus = 'sfx' | 'music';

/** The part of the player's settings that sound follows. Volumes run 0 to 100. */
export interface AudioSettings {
  soundEnabled: boolean;
  soundVolume: number;
  musicEnabled: boolean;
  musicVolume: number;
}

export interface AudioDeps {
  /** The live settings, read on every call (the object may be replaced). */
  settings: () => AudioSettings;
  /** The combat session is on and not paused: the music bed plays only then. */
  sessionActive: () => boolean;
  /** rules.volumeToGain: a 0 to 100 slider value to a gain. */
  volumeToGain: (pct: number, bus: Bus) => number;
  /** Makes the context; the default uses AudioContext (or webkitAudioContext) and gives null without one. */
  createContext?: () => AudioContext | null;
}

export interface CylonAudio {
  /** Plays one effect. Silent when sound is off, the volume is 0, or there is no WebAudio. */
  sfx(name: SfxName): void;
  /** Opens the context ahead of an effect when sound is on, so the first one is not late. */
  prime(): void;
  /** For pointerdown/keydown: resumes the context and primes it on the first real gesture. */
  unlock(): void;
  /** Starts or stops the music bed to match the settings and the session. */
  syncMusic(): void;
  /** The player changed the setting `key` (a settings-panel data-setting name). */
  settingChanged(key: string): void;
}

/* ---------- the voices ---------- */

interface ToneSpec {
  freq?: number; freqEnd?: number | null; type?: OscillatorType;
  duration?: number; gain?: number; delay?: number;
}
interface NoiseSpec {
  duration?: number; gain?: number; delay?: number;
  filterFreq?: number; filterType?: BiquadFilterType;
}
interface ExplosionProfile {
  thumpGain: number; thumpDur: number; crackGain: number; crackDur: number;
  debrisGain: number; debrisDur: number; rumbleGain: number; rumbleDur: number;
  thumpFreq: number; crackFreq: number;
}

const EXPLOSIONS: Record<'small' | 'medium' | 'large', ExplosionProfile> = {
  small: {
    thumpGain: 0.11, thumpDur: 0.28, crackGain: 0.08, crackDur: 0.12,
    debrisGain: 0.06, debrisDur: 0.22, rumbleGain: 0.05, rumbleDur: 0.35,
    thumpFreq: 70, crackFreq: 420
  },
  medium: {
    thumpGain: 0.16, thumpDur: 0.45, crackGain: 0.12, crackDur: 0.16,
    debrisGain: 0.1, debrisDur: 0.4, rumbleGain: 0.09, rumbleDur: 0.65,
    thumpFreq: 55, crackFreq: 380
  },
  large: {
    thumpGain: 0.2, thumpDur: 0.85, crackGain: 0.14, crackDur: 0.28,
    debrisGain: 0.12, debrisDur: 0.7, rumbleGain: 0.14, rumbleDur: 1.4,
    thumpFreq: 42, crackFreq: 300
  }
};

function defaultContext(): AudioContext | null {
  const g = globalThis as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
  const Ctx = g.AudioContext || g.webkitAudioContext;
  return Ctx ? new Ctx() : null;
}

function pulseTaiko(ctx: AudioContext, master: AudioNode, when: number, gain = 0.09): void {
  const osc = ctx.createOscillator();
  const thump = ctx.createOscillator();
  const g = ctx.createGain();
  const tg = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(200, when);
  filter.frequency.exponentialRampToValueAtTime(55, when + 0.45);
  osc.type = 'sine';
  thump.type = 'triangle';
  osc.frequency.setValueAtTime(85, when);
  osc.frequency.exponentialRampToValueAtTime(32, when + 0.5);
  thump.frequency.setValueAtTime(52, when);
  thump.frequency.exponentialRampToValueAtTime(24, when + 0.4);
  g.gain.setValueAtTime(0.0001, when);
  g.gain.exponentialRampToValueAtTime(gain, when + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, when + 0.85);
  tg.gain.setValueAtTime(0.0001, when);
  tg.gain.exponentialRampToValueAtTime(gain * 0.75, when + 0.02);
  tg.gain.exponentialRampToValueAtTime(0.0001, when + 0.55);
  osc.connect(filter);
  filter.connect(g);
  g.connect(master);
  thump.connect(tg);
  tg.connect(master);
  osc.start(when);
  thump.start(when);
  osc.stop(when + 0.9);
  thump.stop(when + 0.6);
}

function pulseRitualHit(ctx: AudioContext, master: AudioNode, when: number, gain = 0.035): void {
  const len = Math.floor(ctx.sampleRate * 0.18);
  const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 1.4);
  const src = ctx.createBufferSource();
  const g = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 380;
  filter.Q.value = 0.7;
  src.buffer = buffer;
  g.gain.setValueAtTime(gain, when);
  g.gain.exponentialRampToValueAtTime(0.0001, when + 0.18);
  src.connect(filter);
  filter.connect(g);
  g.connect(master);
  src.start(when);
  src.stop(when + 0.2);
}

function playDarkHorn(ctx: AudioContext, master: AudioNode, when: number, freq: number, dur = 3.2, gain = 0.04): void {
  const osc = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const osc3 = ctx.createOscillator();
  const g = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(480, when);
  filter.frequency.linearRampToValueAtTime(280, when + dur);
  osc.type = 'sawtooth';
  osc2.type = 'triangle';
  osc3.type = 'sine';
  osc.frequency.setValueAtTime(freq, when);
  osc2.frequency.setValueAtTime(freq * 1.498, when); // fifth
  osc3.frequency.setValueAtTime(freq * 0.5, when);
  const attack = Math.min(1.1, dur * 0.35);
  g.gain.setValueAtTime(0.0001, when);
  g.gain.linearRampToValueAtTime(gain, when + attack);
  g.gain.linearRampToValueAtTime(gain * 0.7, when + dur * 0.7);
  g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
  osc.connect(filter);
  osc2.connect(filter);
  osc3.connect(filter);
  filter.connect(g);
  g.connect(master);
  osc.start(when);
  osc2.start(when);
  osc3.start(when);
  osc.stop(when + dur + 0.05);
  osc2.stop(when + dur + 0.05);
  osc3.stop(when + dur + 0.05);
}

function playTensionStrand(ctx: AudioContext, master: AudioNode, when: number, freq: number, dur = 4, gain = 0.012): void {
  const osc = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = 'triangle';
  osc2.type = 'sine';
  // Slight beating dissonance
  osc.frequency.setValueAtTime(freq, when);
  osc2.frequency.setValueAtTime(freq * 1.02, when);
  g.gain.setValueAtTime(0.0001, when);
  g.gain.linearRampToValueAtTime(gain, when + 1.5);
  g.gain.linearRampToValueAtTime(gain * 0.5, when + dur * 0.8);
  g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
  osc.connect(g);
  osc2.connect(g);
  g.connect(master);
  osc.start(when);
  osc2.start(when);
  osc.stop(when + dur + 0.05);
  osc2.stop(when + dur + 0.05);
}

/* ---------- the module ---------- */

export function createAudio(deps: AudioDeps): CylonAudio {
  const makeContext = deps.createContext ?? defaultContext;
  const settings = deps.settings;

  let audioCtx: AudioContext | null = null;
  let sfxBus: GainNode | null = null;
  let musicBus: GainNode | null = null;
  let musicMaster: GainNode | null = null;
  let musicNodes: AudioNode[] = [];
  let musicTimer: ReturnType<typeof setInterval> | null = null;
  let musicPlaying = false;
  let primed = false;

  function ensureAudioContext(): AudioContext | null {
    if (!audioCtx) {
      const made = makeContext();
      if (!made) return null;
      audioCtx = made;
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    if (!sfxBus) {
      sfxBus = audioCtx.createGain();
      sfxBus.connect(audioCtx.destination);
    }
    if (!musicBus) {
      musicBus = audioCtx.createGain();
      musicBus.connect(audioCtx.destination);
    }
    applyBusVolumes();
    return audioCtx;
  }

  function applyBusVolumes(): void {
    const s = settings();
    if (sfxBus) {
      sfxBus.gain.value = s.soundEnabled ? deps.volumeToGain(s.soundVolume, 'sfx') : 0;
    }
    if (musicBus) {
      // Keep the bed going through game-over overlays (session still On)
      const on = s.musicEnabled && deps.sessionActive() && musicPlaying;
      const target = on ? deps.volumeToGain(s.musicVolume, 'music') : 0;
      if (audioCtx) {
        const now = audioCtx.currentTime;
        // Hard set: delayed automation can mute a just-started bed
        musicBus.gain.cancelScheduledValues(now);
        musicBus.gain.setValueAtTime(target, now);
      } else {
        musicBus.gain.value = target;
      }
    }
  }

  function ensureAudio(): AudioContext | null {
    const s = settings();
    if (!s.soundEnabled || s.soundVolume <= 0) return null;
    return ensureAudioContext();
  }

  function unlock(): void {
    const s = settings();
    if (!s.soundEnabled && !s.musicEnabled) return;
    const ctx = ensureAudioContext();
    if (!ctx || primed) return;

    const prime = (): void => {
      if (primed || ctx.state !== 'running') return;
      const g = ctx.createGain();
      g.gain.value = 0.0001;
      const osc = ctx.createOscillator();
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.01);
      primed = true;
      syncMusic();
    };

    if (ctx.state === 'running') {
      prime();
    } else {
      ctx.resume().then(prime).catch(() => {});
    }
  }

  function tearDown(nodes: AudioNode[], master: AudioNode): void {
    nodes.forEach((node) => {
      try {
        const stoppable = node as AudioNode & { stop?: () => void };
        if (typeof stoppable.stop === 'function') stoppable.stop();
      } catch { /* already stopped */ }
      try { node.disconnect(); } catch { /* ignore */ }
    });
    try { master.disconnect(); } catch { /* ignore */ }
  }

  function stopMusic(fade = true): void {
    if (musicTimer) {
      clearInterval(musicTimer);
      musicTimer = null;
    }
    const ctx = audioCtx;
    const master = musicMaster;
    const nodes = musicNodes;
    musicPlaying = false;
    musicMaster = null;
    musicNodes = [];
    applyBusVolumes();
    if (!ctx || !master) return;
    const now = ctx.currentTime;
    const teardown = (): void => tearDown(nodes, master);
    try {
      if (fade) {
        master.gain.cancelScheduledValues(now);
        master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), now);
        master.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
        setTimeout(teardown, 950);
      } else {
        master.gain.value = 0;
        teardown();
      }
    } catch {
      teardown();
    }
  }

  function startMusic(): void {
    const s0 = settings();
    if (musicPlaying || !s0.musicEnabled || s0.musicVolume <= 0 || !deps.sessionActive()) return;
    const ctx = ensureAudioContext();
    if (!ctx || !musicBus) return;
    const bus = musicBus;

    const begin = (): void => {
      if (musicPlaying || !settings().musicEnabled || !deps.sessionActive()) return;

      if (musicTimer) {
        clearInterval(musicTimer);
        musicTimer = null;
      }
      if (musicMaster) {
        const oldMaster = musicMaster;
        const oldNodes = musicNodes;
        musicMaster = null;
        musicNodes = [];
        tearDown(oldNodes, oldMaster);
      }

      const master = ctx.createGain();
      master.gain.value = 0.0001;
      master.connect(bus);

      // Dark, forboding bed: original synthesis in the spirit of slow McCreary
      // dread cues (not a recreation of any copyrighted track).
      const droneA = ctx.createOscillator();
      const droneB = ctx.createOscillator();
      const droneC = ctx.createOscillator();
      const droneGain = ctx.createGain();
      const droneFilter = ctx.createBiquadFilter();
      droneA.type = 'sawtooth';
      droneB.type = 'sine';
      droneC.type = 'triangle';
      droneA.frequency.value = 36.71; // D1
      droneB.frequency.value = 55.0; // A1
      droneC.frequency.value = 38.89; // Eb1, grinding against D
      droneFilter.type = 'lowpass';
      droneFilter.frequency.value = 160;
      droneFilter.Q.value = 0.6;
      droneGain.gain.value = 0.07;
      droneA.connect(droneFilter);
      droneB.connect(droneFilter);
      droneC.connect(droneFilter);
      droneFilter.connect(droneGain);
      droneGain.connect(master);

      const pad = ctx.createOscillator();
      const pad2 = ctx.createOscillator();
      const padGain = ctx.createGain();
      const padFilter = ctx.createBiquadFilter();
      pad.type = 'sawtooth';
      pad2.type = 'triangle';
      pad.frequency.value = 73.42; // D2
      pad2.frequency.value = 87.31; // F2
      padFilter.type = 'lowpass';
      padFilter.frequency.value = 320;
      padGain.gain.value = 0.028;
      pad.connect(padFilter);
      pad2.connect(padFilter);
      padFilter.connect(padGain);
      padGain.connect(master);

      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.type = 'sine';
      lfo.frequency.value = 0.04;
      lfoGain.gain.value = 30;
      lfo.connect(lfoGain);
      lfoGain.connect(droneFilter.frequency);

      const now = ctx.currentTime;
      droneA.start(now);
      droneB.start(now);
      droneC.start(now);
      pad.start(now);
      pad2.start(now);
      lfo.start(now);

      // Slow chord breath under the bed
      pad.frequency.setValueAtTime(73.42, now);
      pad2.frequency.setValueAtTime(87.31, now);
      pad.frequency.setValueAtTime(73.42, now + 8);
      pad2.frequency.linearRampToValueAtTime(92.5, now + 16); // F# tension
      pad.frequency.linearRampToValueAtTime(65.41, now + 24); // C
      pad2.frequency.linearRampToValueAtTime(98.0, now + 24); // G
      pad.frequency.linearRampToValueAtTime(73.42, now + 32);
      pad2.frequency.linearRampToValueAtTime(87.31, now + 32);

      master.gain.setValueAtTime(0.0001, now);
      master.gain.exponentialRampToValueAtTime(1, now + 1.2);

      musicMaster = master;
      musicNodes = [
        droneA, droneB, droneC, pad, pad2, lfo,
        droneGain, padGain, droneFilter, padFilter, lfoGain
      ];
      musicPlaying = true;
      applyBusVolumes();

      // Slow ritual pulse: doom, not chip-tune
      const bpm = 50;
      const beat = 60 / bpm;
      const hornNotes = [73.42, 69.3, 65.41, 87.31, 73.42, 55.0, 82.41, 73.42];
      const strands = [293.66, 311.13, 277.18, 349.23];
      let bar = 0;

      const scheduleWindow = (): void => {
        if (!musicPlaying || !audioCtx || !musicMaster) return;
        const t = audioCtx.currentTime + 0.05;
        // One 4-beat bar per call, sparse on purpose
        const when0 = t;
        const when2 = t + beat * 2;

        pulseTaiko(audioCtx, musicMaster, when0, bar % 2 === 0 ? 0.11 : 0.08);
        if (bar % 2 === 1) {
          pulseTaiko(audioCtx, musicMaster, when2, 0.06);
        } else {
          pulseRitualHit(audioCtx, musicMaster, when2, 0.03);
        }

        // Long dark horn every bar, changing pitch so it moves
        playDarkHorn(
          audioCtx,
          musicMaster,
          when0 + beat * 0.15,
          hornNotes[bar % hornNotes.length] ?? 73.42,
          beat * 3.4,
          0.038
        );

        // High tension strand every other bar
        if (bar % 2 === 0) {
          playTensionStrand(
            audioCtx,
            musicMaster,
            when0 + beat * 0.5,
            strands[(bar / 2) % strands.length] ?? 293.66,
            beat * 3.6,
            0.014
          );
        }

        // Heavier double-hit as intensity marker
        if (bar % 4 === 3) {
          pulseTaiko(audioCtx, musicMaster, when0 + beat * 0.75, 0.07);
          pulseRitualHit(audioCtx, musicMaster, when0 + beat * 1.1, 0.04);
        }

        bar += 1;
      };

      scheduleWindow();
      musicTimer = setInterval(scheduleWindow, 4 * beat * 1000 - 40);
    };

    if (ctx.state === 'suspended') {
      ctx.resume().then(begin).catch(() => {});
    } else {
      begin();
    }
  }

  function syncMusic(): void {
    const s = settings();
    const want = deps.sessionActive() && s.musicEnabled && s.musicVolume > 0;
    if (want) {
      if (!musicPlaying) startMusic();
      else applyBusVolumes();
    } else {
      stopMusic(true);
    }
  }

  /* ---------- sound effects ---------- */

  function playTone({ freq = 440, freqEnd = null, type = 'square', duration = 0.12, gain = 0.08, delay = 0 }: ToneSpec): void {
    const ctx = ensureAudio();
    if (!ctx) return;
    const t0 = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (freqEnd != null) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(freqEnd, 1), t0 + duration);
    }
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(g);
    g.connect(sfxBus || ctx.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.02);
  }

  function playNoiseBurst({ duration = 0.18, gain = 0.06, delay = 0, filterFreq = 900, filterType = 'bandpass' }: NoiseSpec = {}): void {
    const ctx = ensureAudio();
    if (!ctx) return;
    const t0 = ctx.currentTime + delay;
    const len = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    }
    const src = ctx.createBufferSource();
    const g = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.value = filterFreq;
    src.buffer = buffer;
    g.gain.setValueAtTime(gain, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    src.connect(filter);
    filter.connect(g);
    g.connect(sfxBus || ctx.destination);
    src.start(t0);
    src.stop(t0 + duration + 0.02);
  }

  function playExplosion(size: keyof typeof EXPLOSIONS, delay = 0): void {
    if (!ensureAudio()) return;
    const p = EXPLOSIONS[size];
    // 1) Sub thump
    playTone({
      freq: p.thumpFreq,
      freqEnd: Math.max(18, p.thumpFreq * 0.35),
      type: 'sine',
      duration: p.thumpDur,
      gain: p.thumpGain,
      delay
    });
    playTone({
      freq: p.thumpFreq * 1.4,
      freqEnd: 24,
      type: 'triangle',
      duration: p.thumpDur * 0.85,
      gain: p.thumpGain * 0.55,
      delay: delay + 0.02
    });
    // 2) Sharp crack
    playNoiseBurst({
      duration: p.crackDur,
      gain: p.crackGain,
      delay: delay + 0.03,
      filterFreq: p.crackFreq,
      filterType: 'bandpass'
    });
    playTone({
      freq: 900,
      freqEnd: 120,
      type: 'square',
      duration: p.crackDur * 0.7,
      gain: p.crackGain * 0.45,
      delay: delay + 0.03
    });
    // 3) Debris / hiss
    playNoiseBurst({
      duration: p.debrisDur,
      gain: p.debrisGain,
      delay: delay + 0.06,
      filterFreq: 1800,
      filterType: 'highpass'
    });
    playNoiseBurst({
      duration: p.debrisDur * 0.8,
      gain: p.debrisGain * 0.7,
      delay: delay + 0.08,
      filterFreq: 700,
      filterType: 'bandpass'
    });
    // 4) Rumble tail
    playTone({
      freq: 48,
      freqEnd: 20,
      type: 'sine',
      duration: p.rumbleDur,
      gain: p.rumbleGain,
      delay: delay + 0.1
    });
    playNoiseBurst({
      duration: p.rumbleDur * 0.9,
      gain: p.rumbleGain * 0.65,
      delay: delay + 0.12,
      filterFreq: 180,
      filterType: 'lowpass'
    });
  }

  const voices: Record<SfxName, () => void> = {
    projectile() {
      playTone({ freq: 980, freqEnd: 240, type: 'sawtooth', duration: 0.14, gain: 0.07 });
      playTone({ freq: 1400, freqEnd: 400, type: 'square', duration: 0.08, gain: 0.035, delay: 0.01 });
    },
    hit() {
      playTone({ freq: 160, freqEnd: 70, type: 'sawtooth', duration: 0.1, gain: 0.05 });
      playNoiseBurst({ duration: 0.08, gain: 0.04 });
    },
    heal() {
      playTone({ freq: 280, freqEnd: 540, type: 'sine', duration: 0.18, gain: 0.05 });
      playTone({ freq: 420, freqEnd: 660, type: 'triangle', duration: 0.14, gain: 0.03, delay: 0.04 });
    },
    ko() {
      playExplosion('small');
    },
    nuke() {
      playExplosion('large');
    },
    raptor() {
      // Incoming flyby
      playTone({ freq: 220, freqEnd: 70, type: 'sawtooth', duration: 0.7, gain: 0.09 });
      playTone({ freq: 140, freqEnd: 55, type: 'triangle', duration: 0.85, gain: 0.07, delay: 0.04 });
      playNoiseBurst({ duration: 0.55, gain: 0.08, filterFreq: 700, filterType: 'lowpass' });
      playNoiseBurst({ duration: 0.4, gain: 0.05, delay: 0.15, filterFreq: 2400, filterType: 'highpass' });
      // Cannon strafe
      [0.45, 0.58, 0.7, 0.82, 0.94, 1.06].forEach((d, i) => {
        playTone({
          freq: 980 - i * 40,
          freqEnd: 180,
          type: 'square',
          duration: 0.07,
          gain: 0.055,
          delay: d
        });
        playNoiseBurst({ duration: 0.08, gain: 0.045, delay: d, filterFreq: 1600 });
      });
      // Ground impacts, layered explosions
      playExplosion('medium', 0.72);
      playExplosion('medium', 1.0);
    },
    grenadeArm() {
      playTone({ freq: 640, freqEnd: 420, type: 'square', duration: 0.09, gain: 0.05 });
      playTone({ freq: 880, freqEnd: 660, type: 'triangle', duration: 0.07, gain: 0.035, delay: 0.04 });
      playNoiseBurst({ duration: 0.06, gain: 0.03, filterFreq: 2200 });
    },
    grenade() {
      // Throw whoosh
      playTone({ freq: 420, freqEnd: 140, type: 'sawtooth', duration: 0.14, gain: 0.05 });
      playNoiseBurst({ duration: 0.12, gain: 0.05, filterFreq: 1800, filterType: 'highpass' });
      // Detonation
      playExplosion('medium', 0.08);
    },
    missile() {
      playTone({ freq: 380, freqEnd: 110, type: 'sawtooth', duration: 0.22, gain: 0.055 });
      playNoiseBurst({ duration: 0.14, gain: 0.04, filterFreq: 1400, filterType: 'highpass' });
    },
    trackerMissile() {
      playTone({ freq: 520, freqEnd: 160, type: 'sawtooth', duration: 0.22, gain: 0.07 });
      playNoiseBurst({ duration: 0.14, gain: 0.04, filterFreq: 2200, filterType: 'highpass' });
    },
    introLaunch() {
      playTone({ freq: 160, freqEnd: 70, type: 'sawtooth', duration: 0.28, gain: 0.06 });
    },
    nukeLaunch() {
      playTone({ freq: 180, freqEnd: 90, type: 'sawtooth', duration: 0.2, gain: 0.05 });
    }
  };

  return {
    sfx(name) { voices[name](); },
    prime() { ensureAudio(); },
    unlock,
    syncMusic,
    settingChanged(key) {
      const s = settings();
      if (key === 'musicEnabled' || key === 'musicVolume') {
        syncMusic();
      }
      if (key === 'soundEnabled' || key === 'soundVolume') {
        ensureAudioContext();
        applyBusVolumes();
      }
      if (key === 'soundEnabled' && !s.soundEnabled && !s.musicEnabled && audioCtx) {
        audioCtx.suspend().catch(() => {});
      }
      if ((key === 'soundEnabled' || key === 'musicEnabled') && (s.soundEnabled || s.musicEnabled)) {
        ensureAudioContext();
      }
    }
  };
}
