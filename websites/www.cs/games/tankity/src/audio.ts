/* Operation Tankity: sound.
 *
 * Synthesized voices and songs, optionally replaced by the files in game.json's
 * audio section, behind a small interface: game.js asks for an effect, a track
 * or a mute and never sees the context, the timers or the track cache. Uses
 * WebAudio, fetch and timers only: nothing here touches the page (a track
 * announcing itself is a callback, see music.onTrackStart). */

/* ---------- the public interface ---------- */

/** The names of the battlefield events that have a voice. */
export type SfxName =
  | 'move' | 'click' | 'launch' | 'boom' | 'clank' | 'thud'
  | 'warn' | 'cash' | 'bark' | 'win' | 'lose' | 'fanfare';

/** One entry of game.json's audio.music. */
export interface Track { file: string; title?: string; volume?: number; credit?: string }

/** game.json's audio section, as read (untrusted: every field is checked). */
export interface AudioConfig {
  sfx?: Record<string, { file?: unknown; volume?: unknown } | null | undefined>;
  music?: unknown;
}

/* ---------- audio context and voices ---------- */
let AC: AudioContext | null = null;
let soundMuted = false;
let musicMuted = false;
let musicOn = false;
let lastMusicTick = 0;
let musicTimer = 0;
let nextNoteT = 0;
let stepIdx = 0;

function ctx(): AudioContext | null {
  if (soundMuted) return null;
  return audioCtx();
}
function audioCtx(): AudioContext | null {
  try {
    const webkit = (globalThis as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    AC = AC || new (globalThis.AudioContext || webkit!)();
    if (AC.state === 'suspended') void AC.resume();
    return AC;
  } catch (_) { return null; }
}
function envGain(ac: AudioContext, t: number, vol: number, dur: number): GainNode {
  const g = ac.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  g.connect(ac.destination);
  return g;
}
function blip(freq: number, dur: number, type?: OscillatorType | null, vol?: number | null,
  slideTo?: number | null, when?: number | null, cx?: AudioContext | null): void {
  const ac = cx || ctx();
  if (!ac) return;
  try {
    const t = ac.currentTime + (when || 0);
    const o = ac.createOscillator();
    o.type = type || 'square';
    o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t + dur);
    o.connect(envGain(ac, t, vol || 0.05, dur));
    o.start(t);
    o.stop(t + dur + 0.02);
  } catch (_) { /* silent */ }
}
let noiseBuf: AudioBuffer | null = null;
function noise(dur: number, vol: number, filterFreq?: number | null, slideTo?: number | null,
  when?: number | null, cx?: AudioContext | null): void {
  const ac = cx || ctx();
  if (!ac) return;
  try {
    if (!noiseBuf) {
      noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    const t = ac.currentTime + (when || 0);
    const src = ac.createBufferSource();
    src.buffer = noiseBuf;
    src.loop = true;
    const f = ac.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.setValueAtTime(filterFreq || 1200, t);
    if (slideTo) f.frequency.exponentialRampToValueAtTime(Math.max(40, slideTo), t + dur);
    src.connect(f);
    f.connect(envGain(ac, t, vol || 0.08, dur));
    src.start(t);
    src.stop(t + dur + 0.02);
  } catch (_) { /* silent */ }
}
/* Synthesized SFX bank: every battlefield event gets a voice. A sound file
   from game.json's audio.sfx replaces a voice (see sfx below). */
const SYNTH: Record<SfxName, () => void> = {
  move() { blip(190, 0.03, 'square', 0.012); },
  click() { blip(700, 0.04, 'square', 0.03); },
  launch() { noise(0.3, 0.1, 900, 4200); blip(120, 0.28, 'sine', 0.09, 320); },
  boom() { noise(0.6, 0.16, 4000, 60); blip(110, 0.55, 'sine', 0.12, 28); },
  clank() { blip(880, 0.09, 'sawtooth', 0.04, 220); blip(440, 0.12, 'sawtooth', 0.04, 110, 0.08); },
  thud() { noise(0.12, 0.08, 900, 200); },
  warn() { blip(1150, 0.09, 'square', 0.05); blip(1150, 0.09, 'square', 0.05, null, 0.13); },
  cash() { [880, 1174, 1568].forEach((f, i) => blip(f, 0.08, 'triangle', 0.05, null, i * 0.06)); },
  bark() { blip(300, 0.06, 'square', 0.03, 420); blip(420, 0.06, 'square', 0.025, null, 0.07); },
  win() { [523, 659, 784, 1046, 1318].forEach((f, i) => blip(f, 0.14, 'triangle', 0.06, null, i * 0.11)); },
  lose() { [330, 262, 208, 156].forEach((f, i) => blip(f, 0.22, 'sawtooth', 0.05, null, i * 0.18)); },
  fanfare() {
    [262, 330, 392, 523, 659, 784].forEach((f, i) => blip(f, 0.12, 'triangle', 0.06, null, i * 0.09));
    noise(0.4, 0.08, 600, 3000, 0.5);
    blip(131, 0.4, 'sine', 0.08, 65, 0.55);
  },
};

/* ---------- audio files: game.json's audio section (optional) ---------- */
/* Nothing here is requested before the player's first tap or key press. Sound
   files load when the first effect plays with the Sound toggle on; music
   loads when it starts with the Music toggle on. Anything that fails to load
   leaves the synthesized sound in place. */
type SfxState = 'idle' | 'loading' | 'ready' | 'failed';
interface SfxFile { file: string; volume: number; state: SfxState; buf: AudioBuffer | null }
let gestured = false;
const SFX_FILES: Record<string, SfxFile> = {}; // event -> the file that voices it
let MUSIC_LIST: Track[] = [];
let trackIdx = 0;
let trackFails = 0;
let onTrackStart: ((track: Track) => void) | null = null;

/** Decodes audio file bytes (decodeAudioData has a callback and a promise form). */
function decode(ac: AudioContext, bytes: ArrayBuffer): Promise<AudioBuffer> {
  return new Promise<AudioBuffer>((res, rej) => {
    const p = ac.decodeAudioData(bytes, res, rej);
    if (p && p.then) p.then(res, rej);
  });
}

/** Installs game.json's audio section (none: the synth plays alone). */
export function initAudio(config?: AudioConfig | null): void {
  const a: AudioConfig = config || { sfx: {}, music: [] };
  for (const name of Object.keys(SFX_FILES)) delete SFX_FILES[name];
  for (const name of Object.keys(SYNTH)) {
    const e = a.sfx && a.sfx[name];
    if (e && typeof e.file === 'string') {
      SFX_FILES[name] = { file: e.file, volume: typeof e.volume === 'number' ? e.volume : 1, state: 'idle', buf: null };
    }
  }
  MUSIC_LIST = (Array.isArray(a.music) ? a.music as unknown[] : [])
    .filter((t): t is Track => !!t && typeof (t as Track).file === 'string');
  trackIdx = 0;
  trackFails = 0;
  // The list can arrive after the synth began: hand the music over.
  if (musicOn && trackMode()) { stopSynth(); playTrack(); }
}
function loadSfx(): void {
  if (!gestured || soundMuted) return;
  const ac = audioCtx();
  if (!ac || typeof fetch !== 'function') return;
  for (const s of Object.values(SFX_FILES)) {
    if (s.state !== 'idle') continue;
    s.state = 'loading';
    // Revalidate: a rebuilt effect keeps its name, so never trust a stale copy.
    fetch(s.file, { cache: 'no-cache' })
      .then(r => { if (!r.ok) throw new Error('missing'); return r.arrayBuffer(); })
      .then(b => decode(ac, b))
      .then(buf => { s.buf = buf; s.state = 'ready'; })
      .catch(() => { s.state = 'failed'; });
  }
}
/* True when a file voiced the event; false hands it to the synthesizer. */
function playSample(name: SfxName): boolean {
  const s = SFX_FILES[name];
  if (!s || soundMuted) return false;
  if (s.state === 'idle') loadSfx(); // this one plays synthesized; the rest wait for the files
  if (s.state !== 'ready') return false;
  const ac = audioCtx();
  if (!ac) return false;
  try {
    const src = ac.createBufferSource();
    src.buffer = s.buf;
    const g = ac.createGain();
    g.gain.setValueAtTime(s.volume, ac.currentTime);
    src.connect(g);
    g.connect(ac.destination);
    src.start();
    return true;
  } catch (_) { return false; }
}

/** Sound effects. */
export const sfx = {
  /** The event's file when game.json has one that loaded, else its synthesized voice. */
  play(name: SfxName): void { if (!playSample(name)) SYNTH[name](); },
  /** The two-note ping for a turn that comes up in a hidden tab. */
  turnPing(): void {
    if (!soundMuted) {
      const ac = audioCtx();
      if (ac) { blip(880, 0.12, 'sine', 0.08, null, 0); blip(1320, 0.18, 'sine', 0.07, null, 0.13); }
    }
  },
  /** Three beeps as the turn clock runs low. */
  clockWarn(): void {
    if (!soundMuted && audioCtx()) {
      for (let i = 0; i < 3; i++) blip(988, 0.09, 'square', 0.07, null, i * 0.16);
    }
  },
};

/* Punchy procedural war-grooves: four songs of 32 steps (two bars each),
 * four-on-the-floor kick with click, layered snare, driving saw bass, crash
 * every two bars. 142 BPM. The built-in music: it plays when game.json lists
 * no tracks or none can play, and the round picks the song so the soundtrack
 * turns over instead of looping one riff all match. */
interface Song { name: string; bass: number[]; lead: number[] }
const SONGS: Song[] = [
  { name: 'Rollout',
    bass: [55, 0, 55, 55, 0, 65.41, 0, 55, 0, 49, 0, 49, 0, 58.27, 0, 73.42,
           43.65, 0, 43.65, 43.65, 0, 52, 0, 43.65, 49, 0, 49, 49, 0, 58.27, 0, 73.42],
    lead: [440, 0, 0, 523.25, 0, 0, 587.33, 0, 0, 523.25, 0, 440, 0, 392, 587.33, 0,
           349.23, 0, 0, 392, 0, 0, 440, 0, 0, 523.25, 0, 587.33, 0, 659.25, 587.33, 0] },
  { name: 'High Ground',
    bass: [73.42, 0, 73.42, 73.42, 0, 87.31, 0, 73.42, 65.41, 0, 65.41, 65.41, 0, 77.78, 0, 65.41,
           55, 0, 55, 55, 0, 65.41, 0, 55, 49, 0, 49, 49, 0, 58.27, 49, 55],
    lead: [587.33, 0, 523.25, 0, 0, 440, 0, 0, 523.25, 0, 0, 440, 0, 392, 0, 0,
           440, 0, 0, 523.25, 0, 587.33, 0, 0, 659.25, 0, 587.33, 0, 523.25, 0, 440, 0] },
  { name: 'Crater Blues',
    bass: [82.41, 0, 0, 82.41, 0, 0, 98, 0, 0, 82.41, 0, 0, 110, 0, 98, 0,
           82.41, 0, 0, 82.41, 0, 0, 123.47, 0, 0, 110, 0, 98, 0, 82.41, 0, 0],
    lead: [329.63, 0, 0, 0, 392, 0, 0, 0, 440, 0, 493.88, 0, 0, 0, 440, 0,
           392, 0, 0, 0, 329.63, 0, 0, 0, 293.66, 0, 329.63, 0, 392, 0, 0, 0] },
  { name: 'Last Tank',
    bass: [49, 0, 0, 0, 49, 0, 0, 0, 46.25, 0, 0, 0, 46.25, 0, 0, 0,
           43.65, 0, 0, 0, 43.65, 0, 0, 0, 55, 0, 55, 0, 65.41, 0, 73.42, 0],
    lead: [293.66, 0, 0, 0, 0, 0, 349.23, 0, 0, 0, 0, 0, 392, 0, 0, 0,
           440, 0, 0, 0, 0, 0, 523.25, 0, 0, 0, 587.33, 0, 659.25, 0, 0, 0] },
];
let songIdx = 0;
function musicStep(): void {
  const ac = audioCtx();
  if (!ac || musicMuted || !musicOn) return;
  // Before any gesture the context is suspended with a frozen clock: idle
  // here instead of scheduling onto it, or the first real gesture resumes
  // into silence. The watchdog (music.watchdog) restarts a wedged scheduler.
  if (typeof ac.state === 'string' && ac.state !== 'running') return;
  lastMusicTick = Date.now();
  try {
    const stepDur = 60 / 142 / 2;
    // A hidden tab throttles timers, so nextNoteT falls far behind the clock.
    // Without this resync the loop below would schedule minutes of backlog
    // notes in a single tick and freeze the page on refocus. Clamp the other
    // way too: a clock ahead of the note cursor plays silence until it
    // catches up, which reads as music that never starts.
    if (nextNoteT < ac.currentTime - 0.25 || nextNoteT > ac.currentTime + 0.5) {
      nextNoteT = ac.currentTime + 0.05;
    }
    let guard = 0;
    while (nextNoteT < ac.currentTime + 0.18 && guard++ < 64) {
      const song = SONGS[songIdx % SONGS.length]!;
      const i = stepIdx % 32;
      const at = Math.max(0, nextNoteT - ac.currentTime);
      if (i % 4 === 0) {
        // Kick: sub drop plus a click transient so it cuts through.
        const t = ac.currentTime + at;
        const o = ac.createOscillator();
        o.type = 'sine';
        o.frequency.setValueAtTime(160, t);
        o.frequency.exponentialRampToValueAtTime(38, t + 0.13);
        o.connect(envGain(ac, t, 0.24, 0.15));
        o.start(t); o.stop(t + 0.17);
        blip(1100, 0.02, 'square', 0.05, null, at, ac);
      }
      if (i === 0 && (stepIdx >> 4) % 2 === 0) noise(0.5, 0.03, 9000, 4000, at, ac); // crash
      if (i === 4 || i === 12) {
        // Snare: noise crack plus a 190 Hz body.
        noise(0.1, 0.08, 6000, 1800, at, ac);
        blip(190, 0.09, 'triangle', 0.09, 120, at, ac);
      } else if (i % 2 === 1) noise(0.04, 0.035, 9000, 7000, at, ac); // hats
      const bass = song.bass[i];
      if (bass) blip(bass, 0.22, 'sawtooth', 0.075, null, at, ac);
      const lead = song.lead[i];
      if (lead && (stepIdx >> 4) % 2 === 1) {
        blip(lead, 0.16, 'square', 0.022, null, at, ac);
        blip(lead, 0.12, 'square', 0.012, null, at + stepDur * 3, ac);
      }
      nextNoteT += stepDur;
      stepIdx++;
    }
  } catch (_) { /* silent */ }
}
/* Tracks play through WebAudio so a track loops without a seam: each one is
   decoded once, its leading and trailing silence trimmed, and every pass
   cross-fades into the next over XFADE_S. A track change fades the old one
   out under the new one. The files themselves are untouched, so a single
   pass sounds exactly as recorded. The demo always plays the first track
   (the theme); each round picks the next of the others; the Next track
   button steps through them all. */
const XFADE_S = 2;
const SWITCH_S = 1.2;
interface TrackEntry { buf: AudioBuffer; start: number; end: number }
/* One track's playback. While it is still loading it holds `heard`, the play
   the listener can hear, so switching, failing over or stopping can always
   fade that one out. */
interface Play { idx: number; voices: { src: AudioBufferSourceNode; gain: GainNode }[]; timer: number; heard: Play | null }
const TRACK_CACHE: Record<string, Promise<TrackEntry | null>> = {}; // file -> decoded track
let musicBus: GainNode | null = null; // gain node every track runs through
let trackPlay: Play | null = null;
function trackMode(): boolean {
  return MUSIC_LIST.length > 0 && trackFails < MUSIC_LIST.length && typeof fetch === 'function';
}
/* Where sound starts and stops, so silence at either end never gaps a loop. */
export function trimSilence(buf: Pick<AudioBuffer, 'getChannelData' | 'sampleRate'>): { start: number; end: number } {
  const ch = buf.getChannelData(0);
  const floor = 0.004;
  let a = 0, b = ch.length - 1;
  while (a < b && Math.abs(ch[a]!) < floor) a++;
  while (b > a && Math.abs(ch[b]!) < floor) b--;
  return { start: a / buf.sampleRate, end: (b + 1) / buf.sampleRate };
}
/* The track for a level: 0 is the demo (always the theme, the first track);
   rounds walk through the rest in order. */
export function trackForLevel(level: number, count: number): number {
  return level <= 0 || count === 1 ? 0 : 1 + ((level - 1) % (count - 1));
}
function loadTrack(t: Track): Promise<TrackEntry | null> {
  const ac = audioCtx();
  if (!ac) return Promise.resolve(null);
  if (!TRACK_CACHE[t.file]) {
    TRACK_CACHE[t.file] = fetch(t.file, { cache: 'no-cache' })
      .then(r => { if (!r.ok) throw new Error('missing'); return r.arrayBuffer(); })
      .then(b => decode(ac, b))
      .then(buf => Object.assign({ buf }, trimSilence(buf)))
      .catch(() => null);
  }
  return TRACK_CACHE[t.file]!;
}
function bus(): GainNode | null {
  const ac = audioCtx();
  if (!ac) return null;
  if (!musicBus) { musicBus = ac.createGain(); musicBus.connect(ac.destination); }
  return musicBus;
}
/* One pass of a track from `when`, fading in over `fadeIn` seconds, with the
   next pass scheduled to overlap its last XFADE_S. */
function playPass(play: Play, entry: TrackEntry, vol: number, when: number, fadeIn: number): void {
  const ac = audioCtx();
  const out = bus();
  if (!ac || !out || trackPlay !== play) return;
  const len = entry.end - entry.start;
  const xf = Math.min(XFADE_S, len / 4);
  const src = ac.createBufferSource();
  src.buffer = entry.buf;
  const gain = ac.createGain();
  gain.gain.setValueAtTime(fadeIn > 0 ? 0.0001 : vol, when);
  if (fadeIn > 0) gain.gain.linearRampToValueAtTime(vol, when + fadeIn);
  // Fade out under the next pass; equal-time linear ramps keep the sum even.
  gain.gain.setValueAtTime(vol, when + len - xf);
  gain.gain.linearRampToValueAtTime(0.0001, when + len);
  src.connect(gain);
  gain.connect(out);
  src.start(when, entry.start, len);
  play.voices.push({ src, gain });
  src.onended = () => { play.voices = play.voices.filter(v => v.src !== src); };
  const next = when + len - xf;
  clearTimeout(play.timer);
  play.timer = setTimeout(() => playPass(play, entry, vol, next, xf), Math.max(0, (next - ac.currentTime - 1) * 1000));
}
function fadeOutPlay(play: Play | null, secs: number): void {
  const ac = audioCtx();
  if (!play || !ac) return;
  clearTimeout(play.timer);
  const t = ac.currentTime;
  for (const v of play.voices) {
    try {
      v.gain.gain.cancelScheduledValues(t);
      v.gain.gain.setValueAtTime(v.gain.gain.value, t);
      v.gain.gain.linearRampToValueAtTime(0.0001, t + secs);
      v.src.stop(t + secs + 0.05);
    } catch (_) { /* already stopped */ }
  }
}
function playTrack(): void {
  if (!musicOn || musicMuted || !gestured || !trackMode()) return;
  const idx = trackIdx % MUSIC_LIST.length;
  if (trackPlay && trackPlay.idx === idx) return;
  const play: Play = { idx, voices: [], timer: 0, heard: heardPlay() };
  trackPlay = play;
  const t = MUSIC_LIST[idx]!;
  loadTrack(t).then(entry => {
    if (trackPlay !== play) return;
    if (!entry) { trackFailed(); return; }
    trackFails = 0;
    const ac = audioCtx()!;
    const old = play.heard;
    play.heard = null;
    fadeOutPlay(old, old ? SWITCH_S : 0);
    playPass(play, entry, typeof t.volume === 'number' ? t.volume : 1, ac.currentTime + 0.05, old ? SWITCH_S : 0.4);
    if (onTrackStart) onTrackStart(t);
  });
}
/* The play the listener hears now: the current one once it has started,
   else whatever it is still waiting to replace. */
function heardPlay(): Play | null {
  if (!trackPlay) return null;
  return trackPlay.voices.length ? trackPlay : trackPlay.heard;
}
function musicForLevel(level: number): void {
  const n = MUSIC_LIST.length;
  if (!n) return;
  trackIdx = trackForLevel(level, n);
  if (musicOn && trackMode()) playTrack();
}
function nextTrack(): void {
  if (!MUSIC_LIST.length) { songIdx = (songIdx + 1) % SONGS.length; return; }
  trackIdx = ((trackPlay ? trackPlay.idx : trackIdx) + 1) % MUSIC_LIST.length;
  if (!musicOn && !musicMuted) startMusic();
  else playTrack();
}
function trackFailed(): void {
  trackFails++;
  const heard = heardPlay();
  if (trackMode()) { trackIdx = (trackIdx + 1) % MUSIC_LIST.length; trackPlay = heard; playTrack(); return; }
  // Every track failed: the built-in songs take over.
  fadeOutPlay(heard, SWITCH_S);
  trackPlay = null;
  if (musicOn && !musicMuted) startSynth();
}
function startSynth(): void {
  const ac = audioCtx();
  if (!ac) return;
  stepIdx = 0;
  nextNoteT = ac.currentTime + 0.06;
  if (!musicTimer) musicTimer = setInterval(musicStep, 60);
}
function stopSynth(): void {
  if (musicTimer) { clearInterval(musicTimer); musicTimer = 0; }
}
function startMusic(): void {
  if (musicMuted) return;
  const ac = audioCtx();
  if (!ac || musicOn) return;
  musicOn = true;
  if (trackMode()) playTrack();
  else startSynth();
}
function stopMusic(): void {
  musicOn = false;
  stopSynth();
  const heard = heardPlay();
  fadeOutPlay(heard, 0.3);
  if (trackPlay !== heard) fadeOutPlay(trackPlay, 0.3);
  trackPlay = null;
}

/** Music. */
export const music = {
  /** Starts the soundtrack if it is not playing (a no-op while muted). */
  start: startMusic,
  /** Stops it, fading the track out. */
  stop: stopMusic,
  /** The next track (or, with no tracks, the next built-in song). */
  next: nextTrack,
  /** The demo's theme: the first track, the first built-in song. */
  playTheme(): void { songIdx = 0; musicForLevel(0); },
  /** The track and built-in song for a round (1 is the first). */
  forRound(round: number): void { songIdx = (round - 1) % SONGS.length; musicForLevel(round); },
  /** Leaves the theme for round 1's track, leaving the built-in song as it is. */
  leaveTheme(): void { musicForLevel(1); },
  /** Re-pins a wedged scheduler to the clock; call it every frame. */
  watchdog(): void {
    if (musicOn && !musicMuted && Date.now() - lastMusicTick > 1500) {
      const ac = audioCtx();
      if (ac && ac.state === 'running') {
        nextNoteT = ac.currentTime + 0.05;
        lastMusicTick = Date.now();
      }
    }
  },
  /** Called once a track begins to play, with its game.json entry. */
  onTrackStart(callback: ((track: Track) => void) | null): void { onTrackStart = callback; },
};

/* ---------- gestures and mutes ---------- */

/** Wakes the audio context (a no-op while sound is muted). */
export function unlock(): void { ctx(); }
/* Any touch or keypress unlocks the speakers and (re)starts a non-muted
   song, so music never sits claiming to play while silent after a refresh.
   `musicToggle` is true when the gesture itself turns the music off: it must
   not fetch a track. Starting twice is a harmless no-op. */
export function noteGesture(musicToggle: boolean): void {
  gestured = true;
  ctx();
  if (musicMuted || musicToggle) return;
  if (!musicOn) startMusic();
  else if (trackMode()) playTrack(); // a play refused before the first gesture
}
export function isSoundMuted(): boolean { return soundMuted; }
export function setSoundMuted(muted: boolean): void {
  soundMuted = muted;
  if (!soundMuted) ctx();
}
export function isMusicMuted(): boolean { return musicMuted; }
export function setMusicMuted(muted: boolean): void {
  musicMuted = muted;
  if (musicMuted) stopMusic();
  else startMusic();
}
