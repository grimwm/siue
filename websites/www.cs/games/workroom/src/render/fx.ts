// The Sound panel in the renderer: a part's chain (Warmth, Bass / Middle / Treble, Brightness with its Sweep, Even Out
// Loud And Soft, Shimmer, Echo, Volume, Left / Right) on its stereo audio, the Room (a reverb made from decaying noise,
// one size per preset) and the limiter that catches the loudest moments. Plain JS on buffers, the same in the page and
// under node:test. Every setting left out is no change. DOM-free.
import type { LaneFx, Limiter, Room } from '../score.ts';
import { Biquad, convolve } from './dsp.ts';
import { reverbIR } from './master.ts';

/** Seconds a Room preset's reverb takes to die away; Dry has none. */
export const ROOM_SECONDS: Record<Room['preset'], number> = { dry: 0, small_room: 0.5, concert_hall: 2, cathedral: 4.5, cave: 7 };
/** The Room send of a part that does not set its own, when the piece has a Room. */
export const DEFAULT_ROOM_SEND = 0.3;

const lfo = (hz: number, rate: number, i: number): number => Math.sin((2 * Math.PI * hz * i) / rate);

/** Warmth: a soft tanh drive, gentle at 0.1 and thick at 1, kept at the same peak level. */
function warmth(ch: Float32Array[], amount: number): void {
  const k = 1 + 9 * amount;
  const norm = 1 / Math.tanh(k);
  for (const c of ch) for (let i = 0; i < c.length; i++) c[i] = Math.tanh(k * c[i]!) * norm;
}

/** Brightness: a low-pass from 200 Hz (0) to 20 kHz (1); Sweep swings the cutoff below that, slowly or quickly, the sides opposite. */
function brightness(ch: Float32Array[], cutoff: number, sweep: 'off' | 'slow' | 'fast', rate: number): void {
  const hzAt = (c: number) => 200 * 100 ** Math.min(1, Math.max(0, c));
  const swing = sweep === 'off' ? 0 : 0.35;
  const speed = sweep === 'fast' ? 0.5 : 0.1;
  for (const [n, c] of ch.entries()) {
    const f = new Biquad(rate, 'lowpass', hzAt(cutoff));
    for (let i = 0; i < c.length; i++) {
      if (swing && i % 64 === 0) f.set('lowpass', hzAt(cutoff - swing + swing * lfo(speed, rate, i) * (n === 0 ? 1 : -1)));
      c[i] = f.step(c[i]!);
    }
  }
}

/** Even Out Loud And Soft: a compressor (threshold down to −30 dB, ratio up to 8:1) with a little make-up gain. */
function evenOut(ch: Float32Array[], amount: number, rate: number): void {
  const threshold = -30 * amount;
  const ratio = 1 + 7 * amount;
  const att = 1 - Math.exp(-1 / (0.01 * rate));
  const rel = 1 - Math.exp(-1 / (0.12 * rate));
  const makeup = 10 ** ((-threshold * (1 - 1 / ratio)) / 2 / 20);
  let env = 0;
  for (let i = 0; i < ch[0]!.length; i++) {
    const peak = Math.max(...ch.map(c => Math.abs(c[i]!)));
    env += (peak > env ? att : rel) * (peak - env);
    const db = 20 * Math.log10(env + 1e-9);
    const over = db - threshold;
    const g = (over > 0 ? 10 ** ((-over * (1 - 1 / ratio)) / 20) : 1) * makeup;
    for (const c of ch) c[i] = c[i]! * g;
  }
}

/** Shimmer: a chorus, a copy 15 ms late swinging ±5 ms, the two sides swinging opposite ways. */
function shimmer(ch: Float32Array[], amount: number, rate: number): void {
  const wet = 0.5 * amount;
  ch.forEach((c, n) => {
    const src = Float32Array.from(c);
    for (let i = 0; i < c.length; i++) {
      const d = (0.015 + 0.005 * lfo(0.8, rate, i) * (n === 0 ? 1 : -1)) * rate;
      const at = i - d;
      const j = Math.floor(at);
      const frac = at - j;
      const v = j >= 0 && j + 1 < src.length ? src[j]! * (1 - frac) + src[j + 1]! * frac : 0;
      c[i] = src[i]! * (1 - wet) + v * wet;
    }
  });
}

/** Echo: repeats `beats` apart, each softer, about `repeats` of them heard, mixed in at `amount`. */
function echo(ch: Float32Array[], amount: number, repeats: number, beats: number, bpm: number, rate: number): void {
  const d = Math.max(1, Math.round(((beats * 60) / bpm) * rate));
  const fb = 0.05 ** (1 / repeats);
  for (const c of ch) {
    const line = new Float32Array(c.length);
    for (let i = d; i < c.length; i++) line[i] = c[i - d]! + fb * line[i - d]!;
    for (let i = 0; i < c.length; i++) c[i] = c[i]! + amount * line[i]!;
  }
}

/**
 * A part's Sound settings on its stereo audio (two channels), in place. `bpm` sets the echo's beat; a muted part goes
 * silent (Solo is the mixer's: see `audible`).
 */
export function applyLaneFx(ch: Float32Array[], fx: LaneFx, bpm: number, rate: number): void {
  if (fx.mute) { for (const c of ch) c.fill(0); return; }
  if (fx.warmth) warmth(ch, fx.warmth);
  const eq = fx.eq ?? {};
  const bands: [number | undefined, ConstructorParameters<typeof Biquad>[1], number][] = [[eq.bass, 'lowshelf', 200], [eq.middle, 'peaking', 1000], [eq.treble, 'highshelf', 4000]];
  for (const [gain, type, hz] of bands) if (gain) for (const c of ch) new Biquad(rate, type, hz, Math.SQRT1_2, gain).run(c);
  const b = fx.brightness;
  if (b && ((b.cutoff ?? 1) < 1 || (b.sweep ?? 'off') !== 'off')) brightness(ch, b.cutoff ?? 1, b.sweep ?? 'off', rate);
  if (fx.even_out) evenOut(ch, fx.even_out, rate);
  if (fx.shimmer) shimmer(ch, fx.shimmer, rate);
  if (fx.echo?.amount) echo(ch, fx.echo.amount, fx.echo.repeats ?? 3, fx.echo.beats ?? 1, bpm, rate);
  const vol = 10 ** ((fx.volume_db ?? 0) / 20);
  const pan = fx.pan ?? 0;
  const gl = vol * (pan > 0 ? Math.cos((pan * Math.PI) / 2) : 1);
  const gr = vol * (pan < 0 ? Math.cos((-pan * Math.PI) / 2) : 1);
  if (gl !== 1) for (let i = 0; i < ch[0]!.length; i++) ch[0]![i] = ch[0]![i]! * gl;
  if (gr !== 1) for (let i = 0; i < ch[1]!.length; i++) ch[1]![i] = ch[1]![i]! * gr;
}

/** Whether a lane is heard: not muted, and either nothing is soloed or it is. */
export const audible = (fx: LaneFx | undefined, anySolo: boolean): boolean => !fx?.mute && (!anySolo || !!fx?.solo);

/** The Room's reverb of `send` (the parts' sends, summed), at `amount`, `length` samples long. Dry is silence. */
export function roomReverb(send: Float32Array[], room: Room, rate: number): Float32Array[] {
  const seconds = ROOM_SECONDS[room.preset];
  if (!seconds || !room.amount) return send.map(c => new Float32Array(c.length));
  const ir = reverbIR(seconds, rate, 11);
  return send.map((c, i) => {
    const wet = convolve(c, ir[i % ir.length]!);
    const out = new Float32Array(c.length);
    for (let j = 0; j < c.length; j++) out[j] = wet[j]! * room.amount;
    return out;
  });
}

/**
 * The limiter: a look-ahead peak limiter that keeps every sample at or under `ceiling_db`, letting go over 100 ms.
 * Works in place on the finished piece.
 */
export function limit(ch: Float32Array[], limiter: Limiter, rate: number): void {
  if (!limiter.on) return;
  const ceiling = 10 ** (limiter.ceiling_db / 20);
  const n = ch[0]!.length;
  const look = Math.round(0.005 * rate);
  const need = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    let p = 0;
    for (const c of ch) p = Math.max(p, Math.abs(c[i]!));
    need[i] = p > ceiling ? ceiling / p : 1;
  }
  // The smallest gain needed over the next `look` samples (a sliding minimum), so the gain is down before a peak lands.
  const ahead = new Float32Array(n);
  const q: number[] = [];
  let head = 0;
  for (let i = n - 1; i >= 0; i--) {
    while (q.length > head && need[q[q.length - 1]!]! >= need[i]!) q.pop();
    q.push(i);
    while (q[head]! > i + look) head++;
    ahead[i] = need[q[head]!]!;
  }
  const rel = 1 - Math.exp(-1 / (0.1 * rate));
  let g = 1;
  for (let i = 0; i < n; i++) {
    g = Math.min(ahead[i]!, g + rel * (1 - g));
    for (const c of ch) c[i] = c[i]! * g;
  }
}
