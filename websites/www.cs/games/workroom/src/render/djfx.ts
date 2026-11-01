// DJ & Effects in the renderer: each effect clip as a processor that works one stereo sample at a time and may read
// its target's dry sound anywhere (a scratch drags the record back, a stutter repeats a slice, a reverse plays a bar
// backwards, a hot cue jumps), so the same code makes a clip in the offline render and a held pad on DJ Mode's live
// deck. Outside its clip a processor leaves the sound alone; it fades in and out over a few milliseconds at its edges
// so nothing clicks, and a few (echoes, the impact) ring on past the end. DOM-free.
import type { FxClip, Tempo } from '../score.ts';
import { Biquad, convolve, seeded } from './dsp.ts';
import { reverbIR } from './master.ts';
import { applyVoice } from './voice.ts';
import type { KeyClasses } from './voice.ts';

/** Where bars fall, in samples, and their tempo: a bar position (12.5 is halfway through bar 12) and back. */
export interface BarMap {
  sample(bar: number): number;
  bar(sample: number): number;
  /** Seconds in one beat at a bar position. */
  beatSeconds(bar: number): number;
  /** Beats in the bar holding a bar position. */
  beats(bar: number): number;
}

/** A BarMap for a step tempo list at `rate`. */
export function barMap(tempo: readonly Tempo[], rate: number): BarMap {
  const segs: { bar: number; at: number; perBar: number; t: Tempo }[] = [];
  for (const t of tempo) {
    const prev = segs[segs.length - 1];
    const perBar = (t.beats * 60 * rate) / t.bpm;
    segs.push({ bar: t.bar, at: prev ? prev.at + (t.bar - prev.bar) * prev.perBar : 0, perBar, t });
  }
  const byBar = (b: number) => { let s = segs[0]!; for (const x of segs) if (x.bar <= b) s = x; return s; };
  const bySample = (i: number) => { let s = segs[0]!; for (const x of segs) if (x.at <= i) s = x; return s; };
  return {
    sample: b => { const s = byBar(b); return s.at + (b - s.bar) * s.perBar; },
    bar: i => { const s = bySample(i); return s.bar + (i - s.at) / s.perBar; },
    beatSeconds: b => 60 / byBar(b).t.bpm,
    beats: b => byBar(b).t.beats,
  };
}

/** What a clip's processor works with: the target's dry stereo sound, the bars, and what Pitch and Voice clips need. */
export interface ClipEnv {
  rate: number;
  src: readonly Float32Array[];
  bars: BarMap;
  /** Mono audio of each lane a vocoder clip may name as its carrier. */
  carriers?: ReadonlyMap<string, Float32Array>;
  key?: KeyClasses;
}

/**
 * A clip's processor over samples [start, end), ringing on `tail` samples more. `tick` turns the stereo pair `x` (the
 * sound so far at sample i) into the effect's, in place. Live, `end` is Infinity until the pad is let go.
 */
export interface ClipProc { start: number; end: number; tail: number; tick(i: number, x: number[]): void }

/** The settings a clip leaves out, by effect. */
export const FX_DEFAULTS: Record<FxClip['effect'], Record<string, unknown>> = {
  scratch: { style: 'baby' }, spinback: { throw: 'hard' }, tape_stop: { time: 'medium' }, tape_start: { time: 'medium' },
  vinyl: { age: 0.7 }, riser: { climb: 2 }, snare_roll: { level: 0.8 }, filter_sweep: { mode: 'highpass_up' },
  impact: { kind: 'impact' }, sidechain: { depth: 0.95 }, stutter: { slice: 16 }, trance_gate: { pattern: 'classic' },
  wobble: { rate: 2, depth: 0.8 }, tremolo: { rate: 8 }, auto_pan: { speed: 'half_bar' }, bitcrusher: { crunch: 0.6 },
  ring_mod: { tone: 330 }, phaser: { speed: 'medium' }, flanger: { speed: 'jet' }, auto_wah: { sensitivity: 0.5 },
  rotary: { speed: 'fast' }, echo_out: { time: 'dotted_eighth' }, ping_pong: { time: 'dotted_eighth' }, reverse: { length: 'bar' },
  reverse_reverb: { swell: 'long' }, granular_freeze: { mode: 'freeze' }, wide_8d: { circle: 'two_bars' }, doppler: {},
  filter: { cutoff: 0.5, resonance: 0.3 }, pitch_shift: { semitones: 12, formant: 0 }, harmonizer: { voices: ['third', 'fifth'], mix: 0.5 },
  vocoder: { bands: 16 }, autotune: { strength: 1, retune_ms: 20 }, crossfader: {}, hot_cue: {}, looper: { mute_deck: false },
};

/** A clip's settings with its defaults filled in. */
export const settingsOf = (clip: FxClip): Record<string, unknown> => ({ ...FX_DEFAULTS[clip.effect], ...(clip.settings ?? {}) });

const FADE_SECONDS = 0.005;
const TAU = 2 * Math.PI;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** `src[c]` at a fractional sample position, silence outside it. */
function reader(src: readonly Float32Array[]) {
  return (c: number, pos: number): number => {
    const ch = src[c] ?? src[0]!;
    const j = Math.floor(pos);
    if (j < 0 || j + 1 >= ch.length) return j >= 0 && j < ch.length ? ch[j]! : 0;
    const f = pos - j;
    return ch[j]! * (1 - f) + ch[j + 1]! * f;
  };
}

/** A recorded move's points as a function of the sample: each value moves linearly between points, holding at the ends. */
function moves(points: readonly number[][] | undefined, bars: BarMap): ((i: number, k: number) => number) | null {
  if (!points?.length) return null;
  const pts = points.map(p => [bars.sample(p[0]!), ...p.slice(1)]);
  return (i, k) => {
    if (i <= pts[0]![0]!) return pts[0]![k + 1]!;
    for (let j = 1; j < pts.length; j++) {
      const a = pts[j - 1]!;
      const b = pts[j]!;
      if (i <= b[0]!) return b[0]! === a[0]! ? b[k + 1]! : a[k + 1]! + ((b[k + 1]! - a[k + 1]!) * (i - a[0]!)) / (b[0]! - a[0]!);
    }
    return pts[pts.length - 1]![k + 1]!;
  };
}

/** A delay line of the last `n` samples of a channel, read a fractional number of samples back. */
class Line {
  private buf: Float32Array;
  private at = 0;
  constructor(n: number) { this.buf = new Float32Array(Math.max(2, Math.ceil(n) + 2)); }
  push(v: number): void { this.buf[this.at] = v; this.at = (this.at + 1) % this.buf.length; }
  back(d: number): number {
    const n = this.buf.length;
    const p = this.at - 1 - Math.min(n - 2, Math.max(0, d));
    const j = Math.floor(p);
    const f = p - j;
    const a = this.buf[((j % n) + n) % n]!;
    const b = this.buf[(((j + 1) % n) + n) % n]!;
    return a * (1 - f) + b * f;
  }
}

/** What an effect's own code gives back: the wet pair at sample i (dry in, wet out) and, for a ringing effect, its tail. */
type Wet = { wet(i: number, t: number, x: number[]): void; tailSeconds?: number; after?(i: number, x: number[]): void };

/** The processor for one clip; `end` may be Infinity (a live pad not yet let go). */
export function makeClip(clip: FxClip, env: ClipEnv, live?: { start: number; end: number }): ClipProc {
  const { rate, bars } = env;
  const start = live ? live.start : Math.round(bars.sample(clip.from_bar));
  const end = live ? live.end : Math.round(bars.sample(clip.to_bar));
  const s = settingsOf(clip);
  const read = reader(env.src);
  const bar0 = clip.from_bar;
  const beat = bars.beatSeconds(bar0) * rate;
  const barLen = beat * bars.beats(bar0);
  const mv = moves(clip.points, bars);
  const fade = FADE_SECONDS * rate;
  const fx = effect(clip, s, { ...env, start, end, beat, barLen, read, mv });
  const proc: ClipProc = {
    start, end, tail: Math.round((fx.tailSeconds ?? 0) * rate),
    tick(i, x) {
      if (i < proc.start) return;
      if (i >= proc.end) { fx.after?.(i, x); return; }
      const dry0 = x[0]!;
      const dry1 = x[1]!;
      fx.wet(i, (i - proc.start) / rate, x);
      const w = Math.min(clamp01((i - proc.start) / fade), clamp01((proc.end - i) / fade));
      if (w < 1) { x[0] = dry0 + (x[0]! - dry0) * w; x[1] = dry1 + (x[1]! - dry1) * w; }
    },
  };
  return proc;
}

interface Ctx extends ClipEnv { start: number; end: number; beat: number; barLen: number; read: (c: number, pos: number) => number; mv: ((i: number, k: number) => number) | null }

/** Plays the dry sound from a moving read position whose speed `rate(t)` sets (1 is normal, negative is backwards). */
function deck(c: Ctx, speed: (t: number, i: number) => number, from = c.start, gate?: (t: number, r: number) => number): Wet {
  let pos = from;
  return {
    wet(i, t, x) {
      const r = speed(t, i);
      const g = gate ? gate(t, r) : 1;
      x[0] = c.read(0, pos) * g;
      x[1] = c.read(1, pos) * g;
      pos += r;
    },
  };
}

/** A filter of each channel whose settings `set` changes every 32 samples. */
function filtered(c: Ctx, type: 'lowpass' | 'highpass' | 'bandpass', set: (t: number, i: number) => [number, number]): Wet {
  const f = [new Biquad(c.rate, type, 1000), new Biquad(c.rate, type, 1000)];
  let n = 0;
  return {
    wet(i, t, x) {
      if (n++ % 32 === 0) { const [hz, q] = set(t, i); for (const b of f) b.set(type, hz, q); }
      x[0] = f[0]!.step(x[0]!);
      x[1] = f[1]!.step(x[1]!);
    },
  };
}

/** A gain over time on both sides. */
const gain = (g: (t: number, i: number) => number): Wet => ({ wet(i, t, x) { const v = g(t, i); x[0] = x[0]! * v; x[1] = x[1]! * v; } });

/** A Pitch and Voice clip: the 4e voice effect run once over the clip's stretch of the dry sound (mono), as stereo. */
function voiced(c: Ctx, chain: Parameters<typeof applyVoice>[1]): Wet {
  const pad = Math.round(0.1 * c.rate);
  const from = Math.max(0, c.start - pad);
  const to = Math.min(c.src[0]!.length, Number.isFinite(c.end) ? c.end + pad : c.src[0]!.length);
  const mono = new Float32Array(Math.max(0, to - from));
  for (let k = 0; k < mono.length; k++) mono[k] = (c.src[0]![from + k]! + (c.src[1] ?? c.src[0]!)[from + k]!) / 2;
  const carriers = new Map<string, Float32Array>();
  for (const [id, a] of c.carriers ?? []) carriers.set(id, a.subarray(from, to));
  const out = applyVoice(mono, chain, c.rate, carriers, c.key);
  return { wet(i, _t, x) { const v = out[i - from] ?? 0; x[0] = v; x[1] = v; } };
}

function effect(clip: FxClip, s: Record<string, unknown>, c: Ctx): Wet {
  const { rate, beat, barLen } = c;
  const dur = (c.end - c.start) / rate;
  const num = (k: string) => s[k] as number;
  const str = (k: string) => s[k] as string;
  switch (clip.effect) {
    case 'scratch': {
      const style = str('style');
      let g = 1;
      const k = 1 - Math.exp(-1 / (0.004 * rate));
      return deck(c, (t, i) => (c.mv ? c.mv(i, 0) : 2.6 * Math.sin(TAU * 2.5 * t)), c.start, (t, r) => {
        const want = style === 'chirp' && !c.mv ? (r < 0 ? 0 : 1) : style === 'transformer' && !c.mv ? (((t * rate) % (beat / 4)) < beat / 8 ? 1 : 0) : 1;
        g += k * (want - g);
        return g;
      });
    }
    case 'spinback': {
      const th = str('throw') === 'gentle' ? 3 : 6;
      return deck(c, t => (t < 0.12 ? 1 + ((-th - 1) * t) / 0.12 : t < 1.6 ? -th * (0.02 / th) ** ((t - 0.12) / 1.48) : 0), c.start, t => (t < 1.6 ? 1 : 0));
    }
    case 'tape_stop': {
      const T = Math.max(0.05, Math.min({ fast: 0.5, medium: 1.2, slow: 2.5 }[str('time')] ?? 1.2, dur - 0.1));
      // The motor winds down: full speed at first, slowing ever faster to a standstill at T.
      return deck(c, t => (t < T ? (1 - t / T) ** 1.5 : 0), c.start, t => (t < T ? Math.min(1, (T - t) / (0.1 * T)) : 0));
    }
    case 'tape_start': {
      const T = Math.max(0.05, Math.min({ fast: 0.6, medium: 1.2, slow: 2 }[str('time')] ?? 1.2, dur));
      // A speed rising linearly over T reads T/2 seconds of sound, so it starts T/2 in and is back in time at T.
      return deck(c, t => (t < T ? Math.max(0.0001, t / T) : 1), c.start + (T * rate) / 2);
    }
    case 'vinyl': {
      const age = num('age');
      const rnd = seeded(29);
      const lines = [new Line(0.01 * rate), new Line(0.01 * rate)];
      const lp = [new Biquad(rate, 'lowpass', 12000 - 6000 * age), new Biquad(rate, 'lowpass', 12000 - 6000 * age)];
      let click = 0;
      return {
        wet(i, t, x) {
          const d = 0.0025 * rate * age * (1 + Math.sin(TAU * 0.55 * t));
          if (rnd() < 0.0005 * age) click = (rnd() < 0.5 ? -1 : 1) * (0.1 + 0.3 * rnd()) * age;
          const crackle = click + (rnd() - 0.5) * 0.012 * age;
          click *= 0.6;
          for (let ch = 0; ch < 2; ch++) { lines[ch]!.push(x[ch]!); x[ch] = lp[ch]!.step(lines[ch]!.back(d)) + crackle; }
        },
      };
    }
    case 'riser': {
      const climb = num('climb');
      const rnd = seeded(31);
      const bp = new Biquad(rate, 'bandpass', 400, 3);
      let ph = 0;
      let n = 0;
      return {
        wet(_i, t, x) {
          const p = clamp01(t / dur);
          if (n++ % 32 === 0) bp.set('bandpass', 400 * 2 ** (2 * climb * p), 3);
          const noise = bp.step(rnd() * 2 - 1) * 2;
          ph += (220 * 2 ** (climb * p)) / rate;
          const saw = 2 * (ph - Math.floor(ph)) - 1;
          const v = (noise + 0.25 * saw) * 0.4 * p * p;
          x[0] = x[0]! + v;
          x[1] = x[1]! + v;
        },
      };
    }
    case 'snare_roll': {
      const level = num('level');
      const rnd = seeded(37);
      const bp = new Biquad(rate, 'bandpass', 2200, 0.8);
      let last = -Infinity;
      return {
        wet(i, t, x) {
          const p = clamp01(t / dur);
          const step = p < 0.5 ? beat / 2 : p < 0.75 ? beat / 4 : beat / 8;
          const since = i - c.start;
          const hitAt = Math.floor(since / step) * step;
          if (hitAt !== last) last = hitAt;
          const h = (since - hitAt) / rate;
          const env = Math.exp(-h / 0.035);
          const v = (bp.step(rnd() * 2 - 1) * 3 + 0.4 * Math.sin(TAU * 185 * h)) * env * level * (0.3 + 0.7 * p) * 0.5;
          x[0] = x[0]! + v;
          x[1] = x[1]! + v;
        },
      };
    }
    case 'filter_sweep': {
      const up = str('mode') === 'highpass_up';
      return filtered(c, up ? 'highpass' : 'lowpass', t => {
        const p = clamp01(t / dur);
        return [up ? 30 * 100 ** p : 18000 * (300 / 18000) ** p, 0.9];
      });
    }
    case 'impact': {
      const down = str('kind') === 'downlifter';
      const rnd = seeded(41);
      const bp = new Biquad(rate, 'bandpass', 5000, 1.5);
      let ph = 0;
      let n = 0;
      const ring = (t: number): number => {
        if (down) {
          if (n++ % 32 === 0) bp.set('bandpass', 5000 * (200 / 5000) ** clamp01(t / 2), 1.5);
          return bp.step(rnd() * 2 - 1) * 1.5 * Math.exp(-t / 0.9);
        }
        ph += (30 + 25 * Math.exp(-t / 0.25)) / rate;
        return 0.8 * Math.sin(TAU * ph) * Math.exp(-t / 0.6) + (t < 0.05 ? (rnd() * 2 - 1) * 0.5 * (1 - t / 0.05) : 0);
      };
      const add = (t: number, x: number[]) => { const v = ring(t); x[0] = x[0]! + v; x[1] = x[1]! + v; };
      return { tailSeconds: 2, wet: (_i, t, x) => add(t, x), after: (i, x) => { const t = (i - c.start) / rate; if (t < 2.5) add(t, x); } };
    }
    case 'sidechain': {
      const depth = num('depth');
      return gain((_t, i) => {
        const ph = ((i - c.start) % beat) / beat;
        return 1 - depth * Math.max(0, 1 - ph / 0.6) ** 2;
      });
    }
    case 'stutter': {
      const slice = num('slice');
      let seg = c.start;
      let segLen = 0;
      return {
        wet(i, _t, x) {
          const beatsIn = (i - c.start) / beat;
          const want = slice === 0 ? beat / 2 ** Math.min(3, Math.floor(beatsIn)) : (4 / slice) * beat;
          if (want !== segLen) { segLen = want; seg = i; }
          const off = (i - seg) % segLen;
          const g = Math.min(1, off / (0.002 * rate), (segLen - off) / (0.002 * rate));
          x[0] = c.read(0, seg + off) * g;
          x[1] = c.read(1, seg + off) * g;
        },
      };
    }
    case 'trance_gate': {
      const pat = { classic: '1011101110111010', offbeat: '0110011001100110', choppy: '1100101011100110' }[str('pattern')] ?? '1011101110111010';
      let g = 1;
      const k = 1 - Math.exp(-1 / (0.002 * rate));
      return gain((_t, i) => {
        const pos = c.bars.bar(i);
        const step = Math.floor((pos - Math.floor(pos)) * 16) % 16;
        g += k * ((pat[step] === '1' ? 1 : 0) - g);
        return g;
      });
    }
    case 'wobble': {
      return filtered(c, 'lowpass', (_t, i) => {
        const r = c.mv ? 1 + 7 * c.mv(i, 0) : num('rate');
        const d = c.mv ? c.mv(i, 1) : num('depth');
        const lfo = 0.5 + 0.5 * Math.sin((TAU * r * (i - c.start)) / beat);
        return [150 + 6000 * (1 - d + d * lfo) ** 2, 4];
      });
    }
    case 'tremolo': {
      const r = num('rate');
      return gain((_t, i) => 1 - 0.8 * (0.5 + 0.5 * Math.sin((TAU * r * (i - c.start)) / barLen)));
    }
    case 'auto_pan': {
      const period = { bar: barLen, half_bar: barLen / 2, beat }[str('speed')] ?? barLen / 2;
      return {
        wet(i, _t, x) {
          const pan = Math.sin((TAU * (i - c.start)) / period);
          const a = ((pan + 1) * Math.PI) / 4;
          const m = (x[0]! + x[1]!) / 2;
          x[0] = m * Math.cos(a) * Math.SQRT2;
          x[1] = m * Math.sin(a) * Math.SQRT2;
        },
      };
    }
    case 'bitcrusher': {
      const held = [0, 0];
      let count = 0;
      return {
        wet(i, _t, x) {
          const crunch = c.mv ? 0.1 + 0.9 * c.mv(i, 0) : num('crunch');
          const hold = c.mv ? 1 + Math.round(31 * c.mv(i, 1)) : 1 + Math.round(crunch * 15);
          const q = 2 ** (12 - 9 * crunch - 1);
          if (count++ % hold === 0) { held[0] = Math.round(x[0]! * q) / q; held[1] = Math.round(x[1]! * q) / q; }
          x[0] = held[0]!;
          x[1] = held[1]!;
        },
      };
    }
    case 'ring_mod': {
      const hz = num('tone');
      return { wet(_i, t, x) { const m = 0.2 + 0.8 * Math.sin(TAU * hz * t); x[0] = x[0]! * m; x[1] = x[1]! * m; } };
    }
    case 'phaser': {
      const hz = { slow: 0.2, medium: 0.5, fast: 1.5 }[str('speed')] ?? 0.5;
      const st = [new Float64Array(4), new Float64Array(4)];
      const fb = [0, 0];
      return {
        wet(_i, t, x) {
          const f = 300 + 1700 * (0.5 + 0.5 * Math.sin(TAU * hz * t));
          const tn = Math.tan((Math.PI * f) / rate);
          const a = (1 - tn) / (1 + tn);
          for (let ch = 0; ch < 2; ch++) {
            let v = x[ch]! + 0.5 * fb[ch]!;
            for (let k = 0; k < 4; k++) { const y = -a * v + st[ch]![k]!; st[ch]![k] = v + a * y; v = y; }
            fb[ch] = v;
            x[ch] = 0.5 * x[ch]! + 0.5 * v;
          }
        },
      };
    }
    case 'flanger': {
      const hz0 = { slow: 0.1, jet: 0.25, fast: 1.2 }[str('speed')] ?? 0.25;
      const lines = [new Line(0.01 * rate), new Line(0.01 * rate)];
      let ph = 0;
      return {
        wet(i, _t, x) {
          const mix = c.mv ? c.mv(i, 0) : 0.5;
          ph += (c.mv ? 0.05 + 1.95 * c.mv(i, 1) : hz0) / rate;
          const d = (0.001 + 0.004 * (0.5 + 0.5 * Math.sin(TAU * ph))) * rate;
          for (let ch = 0; ch < 2; ch++) {
            const back = lines[ch]!.back(d);
            lines[ch]!.push(x[ch]! + 0.6 * back);
            x[ch] = x[ch]! * (1 - mix * 0.5) + back * mix;
          }
        },
      };
    }
    case 'auto_wah': {
      const sens = num('sensitivity');
      let env = 0;
      const att = 1 - Math.exp(-1 / (0.005 * rate));
      const rel = 1 - Math.exp(-1 / (0.08 * rate));
      const bp = [new Biquad(rate, 'bandpass', 500, 4), new Biquad(rate, 'bandpass', 500, 4)];
      let n = 0;
      return {
        wet(_i, _t, x) {
          const a = Math.max(Math.abs(x[0]!), Math.abs(x[1]!));
          env += (a > env ? att : rel) * (a - env);
          if (n++ % 32 === 0) for (const b of bp) b.set('bandpass', Math.min(6000, 350 + env * (2000 + 12000 * sens)), 4);
          x[0] = 0.3 * x[0]! + 1.5 * bp[0]!.step(x[0]!);
          x[1] = 0.3 * x[1]! + 1.5 * bp[1]!.step(x[1]!);
        },
      };
    }
    case 'rotary': {
      const hz = str('speed') === 'slow' ? 0.8 : 6.7;
      const lines = [new Line(0.003 * rate), new Line(0.003 * rate)];
      return {
        wet(_i, t, x) {
          const s0 = Math.sin(TAU * hz * t);
          const m = (x[0]! + x[1]!) / 2;
          for (let ch = 0; ch < 2; ch++) {
            const side = ch === 0 ? s0 : -s0;
            lines[ch]!.push(m);
            x[ch] = lines[ch]!.back((0.001 + 0.0006 * side) * rate) * (1 + 0.45 * side);
          }
        },
      };
    }
    case 'echo_out': {
      const d = ({ dotted_eighth: 0.75, quarter: 1, half: 2 }[str('time')] ?? 0.75) * beat;
      const lines = [new Line(d + 2), new Line(d + 2)];
      const step = (i: number, x: number[], live: boolean) => {
        const cut = live ? clamp01(1 - (i - c.start - d) / (0.02 * rate)) : 0;
        for (let ch = 0; ch < 2; ch++) {
          const e = lines[ch]!.back(d - 1);
          lines[ch]!.push(x[ch]! * cut + 0.65 * e);
          x[ch] = (live ? x[ch]! * cut : x[ch]!) + e;
        }
      };
      return { tailSeconds: 3, wet: (i, _t, x) => step(i, x, true), after: (i, x) => step(i, x, false) };
    }
    case 'ping_pong': {
      const d = ({ eighth: 0.5, dotted_eighth: 0.75, quarter: 1 }[str('time')] ?? 0.75) * beat;
      const L = new Line(d + 2);
      const R = new Line(d + 2);
      const step = (i: number, x: number[], feed: boolean) => {
        const mix = c.mv ? c.mv(i, 0) : 0.5;
        const fb = c.mv ? 0.9 * c.mv(i, 1) : 0.5;
        const l = L.back(d - 1);
        const r = R.back(d - 1);
        L.push((feed ? (x[0]! + x[1]!) / 2 : 0) + fb * r);
        R.push(fb * l);
        x[0] = x[0]! + mix * l;
        x[1] = x[1]! + mix * r;
      };
      return { tailSeconds: 3, wet: (i, _t, x) => step(i, x, true), after: (i, x) => step(i, x, false) };
    }
    case 'reverse': {
      const L = ({ beat: 1, two_beats: 2, bar: c.bars.beats(c.bars.bar(c.start)) }[str('length')] ?? 4) * beat;
      return {
        wet(i, _t, x) {
          const seg = c.start + Math.floor((i - c.start) / L) * L;
          const p = seg + L - 1 - (i - seg);
          x[0] = c.read(0, p);
          x[1] = c.read(1, p);
        },
      };
    }
    case 'reverse_reverb': {
      const S = Math.round(Math.min(str('swell') === 'short' ? 1.5 : 3, dur) * rate);
      const end = Number.isFinite(c.end) ? c.end : c.start + S;
      const hit = Math.round(0.25 * rate);
      const ir = reverbIR(2.5, rate, 13);
      const swell = [0, 1].map(ch => {
        const seed = new Float32Array(hit);
        for (let k = 0; k < hit; k++) seed[k] = c.read(ch, end + k);
        const wet = convolve(seed, ir[ch % ir.length]!).subarray(0, S);
        const out = new Float32Array(S);
        let peak = 1e-9;
        for (let k = 0; k < wet.length; k++) peak = Math.max(peak, Math.abs(wet[k]!));
        for (let k = 0; k < S; k++) out[k] = ((wet[S - 1 - k] ?? 0) / peak) * 0.6 * (k / S) ** 1.5;
        return out;
      });
      const from = end - S;
      return {
        wet(i, _t, x) {
          if (i < from) return;
          const p = (i - from) / S;
          x[0] = x[0]! * (1 - 0.6 * p) + swell[0]![i - from]!;
          x[1] = x[1]! * (1 - 0.6 * p) + swell[1]![i - from]!;
        },
      };
    }
    case 'granular_freeze': {
      const stretch = str('mode') === 'stretch';
      const gs = Math.round(0.06 * rate);
      const hop = gs / 4;
      const rnd = seeded(43);
      const jit = new Map<number, number>();
      const jitter = (g: number) => { let v = jit.get(g); if (v === undefined) { v = (rnd() - 0.5) * 0.03 * rate; jit.set(g, v); if (jit.size > 64) jit.delete(jit.keys().next().value!); } return v; };
      return {
        wet(i, _t, x) {
          const k = Math.floor((i - c.start) / hop);
          let l = 0;
          let r = 0;
          for (let g = k - 3; g <= k; g++) {
            if (g < 0) continue;
            const gStart = c.start + g * hop;
            const ph = i - gStart;
            if (ph < 0 || ph >= gs) continue;
            const w = 0.5 - 0.5 * Math.cos((TAU * ph) / gs);
            const at = c.start + (stretch ? 0.5 * g * hop : 0) + jitter(g) + ph;
            l += w * c.read(0, at);
            r += w * c.read(1, at);
          }
          x[0] = l / 2;
          x[1] = r / 2;
        },
      };
    }
    case 'wide_8d': {
      const period = ({ four_bars: 4, two_bars: 2, bar: 1 }[str('circle')] ?? 2) * barLen;
      const lp = [new Biquad(rate, 'lowpass', 2500), new Biquad(rate, 'lowpass', 2500)];
      return {
        wet(i, _t, x) {
          const th = (TAU * (i - c.start)) / period;
          const a = ((Math.sin(th) + 1) * Math.PI) / 4;
          const behind = Math.max(0, -Math.cos(th)) * 0.7;
          const m = (x[0]! + x[1]!) / 2;
          const g = [Math.cos(a) * Math.SQRT2, Math.sin(a) * Math.SQRT2];
          for (let ch = 0; ch < 2; ch++) { const dark = lp[ch]!.step(m); x[ch] = (m * (1 - behind) + dark * behind) * g[ch]!; }
        },
      };
    }
    case 'doppler': {
      const D = dur;
      const half = D / 2;
      const inner = deck(c, t => 1 + 0.06 * Math.tanh((half - t) / (D / 8)));
      return {
        wet(i, t, x) {
          inner.wet(i, t, x);
          const g = 0.3 + 0.7 * Math.exp(-(((t - half) / (D / 4)) ** 2));
          const a = ((-0.9 + 1.8 * clamp01(t / D) + 1) * Math.PI) / 4;
          const m = (x[0]! + x[1]!) / 2;
          x[0] = m * g * Math.cos(a) * Math.SQRT2;
          x[1] = m * g * Math.sin(a) * Math.SQRT2;
        },
      };
    }
    case 'filter':
      return filtered(c, 'lowpass', (_t, i) => {
        const cut = c.mv ? c.mv(i, 0) : num('cutoff');
        const res = c.mv ? c.mv(i, 1) : num('resonance');
        return [200 * 100 ** cut, 0.7 + 10 * res];
      });
    case 'pitch_shift': return voiced(c, [{ effect: 'pitch', semitones: num('semitones'), formant: num('formant') }]);
    case 'harmonizer': return voiced(c, [{ effect: 'harmonizer', voices: s['voices'] as ('third' | 'fifth' | 'octave_up' | 'octave_down')[], mix: num('mix') }]);
    case 'autotune': return voiced(c, [{ effect: 'autotune', strength: num('strength'), retune_ms: num('retune_ms') }]);
    case 'vocoder': return voiced(c, [{ effect: 'vocoder', carrier: str('carrier'), bands: num('bands') }]);
    case 'hot_cue': {
      const cue = Math.round(c.bars.sample(num('cue_bar')));
      return { wet(i, _t, x) { x[0] = c.read(0, cue + i - c.start); x[1] = c.read(1, cue + i - c.start); } };
    }
    case 'looper': {
      const loops = (s['bars'] as number[]).map(b => ({ at: Math.round(c.bars.sample(b)), len: Math.round(c.bars.sample(b + 1)) - Math.round(c.bars.sample(b)) }));
      const mute = s['mute_deck'] === true;
      return {
        wet(i, _t, x) {
          let l = 0;
          let r = 0;
          for (const lp of loops) { const at = lp.at + ((i - c.start) % lp.len); l += c.read(0, at); r += c.read(1, at); }
          x[0] = (mute ? 0 : x[0]!) + l;
          x[1] = (mute ? 0 : x[1]!) + r;
        },
      };
    }
    case 'crossfader':
      return { wet() {} };
  }
}

/**
 * Every clip over a stereo buffer, in place, in the order they start: each sample goes through the clips that hold it.
 * The clips read the buffer as it was before any of them.
 */
export function applyClips(ch: Float32Array[], clips: readonly FxClip[], env: Omit<ClipEnv, 'src'>): void {
  if (!clips.length) return;
  const src = ch.map(c => Float32Array.from(c));
  const procs = [...clips].sort((a, b) => a.from_bar - b.from_bar).map(c => makeClip(c, { ...env, src }));
  const n = ch[0]!.length;
  const from = Math.max(0, Math.min(...procs.map(p => p.start)));
  const to = Math.min(n, Math.max(...procs.map(p => p.end + p.tail)));
  const x = [0, 0];
  for (let i = from; i < to; i++) {
    x[0] = ch[0]![i]!;
    x[1] = ch[1]![i]!;
    for (const p of procs) if (i >= p.start && i < p.end + p.tail) p.tick(i, x);
    ch[0]![i] = x[0]!;
    ch[1]![i] = x[1]!;
  }
}

/**
 * A crossfader clip's gain for a lane at sample i: the fader's position moves A (0) to B (1); a lane on neither side
 * plays on; outside the clip every lane plays. A side is full up to the middle and fades out past it.
 */
export function crossfadeGain(clip: FxClip, lane: string, i: number, bars: BarMap): number {
  const s = settingsOf(clip);
  const side = (s['a'] as string[] | undefined)?.includes(lane) ? 'a' : (s['b'] as string[] | undefined)?.includes(lane) ? 'b' : null;
  if (!side) return 1;
  const start = bars.sample(clip.from_bar);
  const end = bars.sample(clip.to_bar);
  if (i < start || i >= end) return 1;
  const mv = moves(clip.points, bars);
  const pos = mv ? mv(i, 0) : 0.5;
  return side === 'a' ? clamp01(2 - 2 * pos) : clamp01(2 * pos);
}
