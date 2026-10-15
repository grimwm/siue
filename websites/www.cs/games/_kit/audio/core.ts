// websites/www.cs/games/_kit/audio/core.ts
// Each game's one Web Audio context behind a facade: made on first use,
// resumed and primed by a gesture, an sfx and a music bus whose gain and mute
// the game sets, and the two envelopes every voice is built from. Voices and
// music stay in the games. Without Web Audio it is silent and never throws.
export type BusName = 'sfx' | 'music';

export interface ToneSpec {
  freq: number;
  /** Seconds the gain takes to fall to silence. */
  dur: number;
  type?: OscillatorType;
  /** Peak gain. */
  vol?: number;
  /** An exponential pitch slide to this frequency over `slideDur` (default `dur`). */
  slideTo?: number | null;
  slideDur?: number;
  /** Seconds from now. */
  when?: number;
  /** Seconds of exponential rise from silence; without it the tone starts at full `vol`. */
  attack?: number;
}

export interface NoiseSpec {
  dur: number;
  vol: number;
  filterType?: BiquadFilterType;
  filterFreq?: number;
  /** An exponential filter sweep to this frequency over `dur`. */
  slideTo?: number | null;
  when?: number;
  /** 'loop': one shared second of white noise. 'fade': a fresh burst whose samples fade out. */
  source?: 'loop' | 'fade';
}

export interface AudioCore {
  /** The context, made on first call and resumed if suspended; null without Web Audio. */
  context(): AudioContext | null;
  /** The context if one was made, without making or resuming it. */
  peek(): AudioContext | null;
  bus(name: BusName): GainNode | null;
  /** Sets a bus's gain at once, cancelling any ramp; remembered for a bus not made yet. */
  setGain(name: BusName, gain: number): void;
  /** A muted bus is silent, and a tone or noise sent to it makes nothing, not even the context. */
  setMuted(name: BusName, muted: boolean): void;
  isMuted(name: BusName): boolean;
  /** For a gesture: makes and resumes the context; the first time it runs, a silent blip primes it and onReady is called. */
  unlock(onReady?: () => void): void;
  suspend(): void;
  /** Suspends the context and keeps it suspended: context() no longer resumes it until release(). */
  hold(): void;
  /** Ends a hold and resumes the context if one was made (never makes one). */
  release(): void;
  /** Resumes the context for one short sound while held; the caller suspends it again. */
  wake(): AudioContext | null;
  /** Closes the context for good; the next context() makes a fresh one. */
  close(): void;
  tone(spec: ToneSpec, to?: BusName | AudioNode): void;
  noise(spec: NoiseSpec, to?: BusName | AudioNode): void;
}

export interface AudioCoreOptions {
  /** Makes the context; the default uses AudioContext, or webkitAudioContext. */
  createContext?: () => AudioContext | null;
}

/** An exponential ramp cannot reach 0, so silence is this. */
const SILENT = 0.0001;
const BUSES: readonly BusName[] = ['sfx', 'music'];

function defaultContext(): AudioContext | null {
  const g = globalThis as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
  const Make = g.AudioContext || g.webkitAudioContext;
  return Make ? new Make() : null;
}

export function createAudioCore(opts: AudioCoreOptions = {}): AudioCore {
  const make = opts.createContext ?? defaultContext;
  let ctx: AudioContext | null = null;
  let primed = false;
  let held = false;
  let waiting: Array<() => void> = [];
  let loopNoise: AudioBuffer | null = null;
  const gains: Record<BusName, number> = { sfx: 1, music: 1 };
  const muted: Record<BusName, boolean> = { sfx: false, music: false };
  const buses: Partial<Record<BusName, GainNode>> = {};

  function applyGain(name: BusName): void {
    const node = buses[name];
    if (!node || !ctx) return;
    const v = muted[name] ? 0 : gains[name];
    try {
      // A hard set: a ramp still scheduled from before would override it.
      node.gain.cancelScheduledValues(ctx.currentTime);
      node.gain.setValueAtTime(v, ctx.currentTime);
    } catch {
      node.gain.value = v;
    }
  }

  // Some contexts return nothing or throw from resume() or suspend(); a promise either way keeps calls safe.
  function settle(call: () => Promise<void>): Promise<void> {
    try {
      return Promise.resolve(call());
    } catch (err) {
      return Promise.reject(err);
    }
  }

  function context(): AudioContext | null {
    if (!ctx) {
      // Asked again on every call: a page can gain Web Audio later (a test, a polyfill).
      // Built whole or not at all: a half-made context would play with no buses.
      let made: AudioContext | null = null;
      try {
        made = make();
        if (!made) return null;
        const built: Partial<Record<BusName, GainNode>> = {};
        for (const name of BUSES) {
          const g = made.createGain();
          g.connect(made.destination);
          built[name] = g;
        }
        ctx = made;
        Object.assign(buses, built);
        for (const name of BUSES) applyGain(name);
      } catch {
        ctx = null;
        // Made but not built: give the context back rather than leak it.
        const leaked = made;
        if (leaked) settle(() => leaked.close()).catch(() => {});
        return null;
      }
    }
    const c = ctx;
    if (c.state === 'suspended' && !held) settle(() => c.resume()).catch(() => {});
    return c;
  }

  function output(to: BusName | AudioNode | undefined): { c: AudioContext; node: AudioNode } | null {
    const name = to === undefined ? 'sfx' : typeof to === 'string' ? to : null;
    if (name && muted[name]) return null;
    const c = context();
    if (!c) return null;
    const node = name ? buses[name] : (to as AudioNode);
    return node ? { c, node } : null;
  }

  function tone(s: ToneSpec, to?: BusName | AudioNode): void {
    const out = output(to);
    if (!out) return;
    const { c, node } = out;
    try {
      const t = c.currentTime + (s.when ?? 0);
      const vol = s.vol ?? 0.05;
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = s.type ?? 'square';
      o.frequency.setValueAtTime(s.freq, t);
      if (s.slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(1, s.slideTo), t + (s.slideDur ?? s.dur));
      if (s.attack) {
        g.gain.setValueAtTime(SILENT, t);
        g.gain.exponentialRampToValueAtTime(vol, t + s.attack);
      } else {
        g.gain.setValueAtTime(vol, t);
      }
      g.gain.exponentialRampToValueAtTime(SILENT, t + s.dur);
      o.connect(g);
      g.connect(node);
      o.start(t);
      o.stop(t + s.dur + 0.02);
    } catch {
      // A closed or broken context: this voice stays silent.
    }
  }

  function noise(s: NoiseSpec, to?: BusName | AudioNode): void {
    const out = output(to);
    if (!out) return;
    const { c, node } = out;
    try {
      const t = c.currentTime + (s.when ?? 0);
      const src = c.createBufferSource();
      if (s.source === 'fade') {
        const len = Math.max(1, Math.floor(c.sampleRate * s.dur));
        const buf = c.createBuffer(1, len, c.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
        src.buffer = buf;
      } else {
        if (!loopNoise) {
          loopNoise = c.createBuffer(1, c.sampleRate, c.sampleRate);
          const data = loopNoise.getChannelData(0);
          for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
        }
        src.buffer = loopNoise;
        src.loop = true;
      }
      const f = c.createBiquadFilter();
      f.type = s.filterType ?? 'lowpass';
      f.frequency.setValueAtTime(s.filterFreq ?? 1200, t);
      if (s.slideTo) f.frequency.exponentialRampToValueAtTime(Math.max(1, s.slideTo), t + s.dur);
      const g = c.createGain();
      g.gain.setValueAtTime(s.vol, t);
      g.gain.exponentialRampToValueAtTime(SILENT, t + s.dur);
      src.connect(f);
      f.connect(g);
      g.connect(node);
      src.start(t);
      src.stop(t + s.dur + 0.02);
    } catch {
      // As for tone.
    }
  }

  function unlock(onReady?: () => void): void {
    const c = context();
    if (!c || primed) return;
    if (onReady) waiting.push(onReady);
    const prime = (): void => {
      if (primed || c.state !== 'running') return;
      primed = true;
      try {
        const g = c.createGain();
        g.gain.value = SILENT;
        const o = c.createOscillator();
        o.connect(g);
        g.connect(c.destination);
        o.start();
        o.stop(c.currentTime + 0.01);
      } catch {
        // Priming is a courtesy for iOS; a context that refuses it still plays.
      }
      const ready = waiting;
      waiting = [];
      for (const cb of ready) cb();
    };
    if (c.state === 'running') prime();
    else settle(() => c.resume()).then(prime, () => {});
  }

  return {
    context,
    peek: () => ctx,
    bus: name => buses[name] ?? null,
    setGain(name, gain) { gains[name] = gain; applyGain(name); },
    setMuted(name, m) { muted[name] = m; applyGain(name); },
    isMuted: name => muted[name],
    unlock,
    suspend() {
      const c = ctx;
      if (c) settle(() => c.suspend()).catch(() => {});
    },
    hold() {
      held = true;
      const c = ctx;
      if (c) settle(() => c.suspend()).catch(() => {});
    },
    release() {
      held = false;
      const c = ctx;
      if (c && c.state === 'suspended') settle(() => c.resume()).catch(() => {});
    },
    wake() {
      const c = context();
      if (c && c.state === 'suspended') settle(() => c.resume()).catch(() => {});
      return c;
    },
    close() {
      const c = ctx;
      ctx = null;
      for (const name of BUSES) delete buses[name];
      primed = false;
      waiting = [];
      loopNoise = null;
      if (c && c.state !== 'closed') settle(() => c.close()).catch(() => {});
    },
    tone,
    noise,
  };
}
