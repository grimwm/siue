// The Sound panel measured on real signals: each setting changes the sound the way its name says, and a setting left
// out changes nothing.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rms } from '../src/render/dsp.ts';
import { applyLaneFx, audible, limit, roomReverb } from '../src/render/fx.ts';
import type { LaneFx } from '../src/score.ts';

const RATE = 48000;
const sine = (hz: number, seconds: number, amp = 0.5): Float32Array =>
  Float32Array.from({ length: Math.round(seconds * RATE) }, (_, i) => amp * Math.sin((2 * Math.PI * hz * i) / RATE));
const stereo = (x: Float32Array): Float32Array[] => [Float32Array.from(x), Float32Array.from(x)];
const run = (x: Float32Array, fx: LaneFx, bpm = 120): Float32Array[] => { const ch = stereo(x); applyLaneFx(ch, fx, bpm, RATE); return ch; };
const tail = (c: Float32Array) => c.subarray(RATE / 2);

test('nothing set is no change', () => {
  const x = sine(440, 1);
  const [l, r] = run(x, {});
  assert.deepEqual([...l!], [...x]);
  assert.deepEqual([...r!], [...x]);
});

test('Bass, Middle and Treble lift and cut their own bands', () => {
  const gain = (hz: number, fx: LaneFx) => rms(tail(run(sine(hz, 1), fx)[0]!)) / rms(tail(sine(hz, 1)));
  assert.ok(gain(80, { eq: { bass: 9 } }) > 2.2 && gain(8000, { eq: { bass: 9 } }) < 1.1, 'bass');
  assert.ok(gain(1000, { eq: { middle: -9 } }) < 0.45 && gain(100, { eq: { middle: -9 } }) > 0.9, 'middle');
  assert.ok(gain(10000, { eq: { treble: 6 } }) > 1.8 && gain(100, { eq: { treble: 6 } }) < 1.1, 'treble');
});

test('Brightness takes the highs away; Sweep moves it over time', () => {
  const hi = (fx: LaneFx) => rms(tail(run(sine(6000, 1), fx)[0]!));
  assert.ok(hi({ brightness: { cutoff: 0.3 } }) < 0.05 * hi({}));
  assert.ok(rms(tail(run(sine(150, 1), { brightness: { cutoff: 0.3 } })[0]!)) > 0.3);
  const swept = run(sine(1000, 6), { brightness: { cutoff: 0.6, sweep: 'fast' } })[0]!;
  const levels = [1.5, 2, 2.5, 3].map(s => rms(swept.subarray(s * RATE - 2400, s * RATE + 2400)));
  assert.ok(Math.max(...levels) > 1.5 * Math.min(...levels), `swept levels ${levels.map(v => v.toFixed(3))}`);
});

test('Left / Right moves the sound across; Volume turns it up and down; Mute silences it and Solo picks who is heard', () => {
  const [l, r] = run(sine(440, 0.5), { pan: -1 });
  assert.ok(rms(l!) > 0.3 && rms(r!) < 1e-6);
  const loud = run(sine(440, 0.5), { volume_db: -6 })[0]!;
  assert.ok(Math.abs(rms(loud) / rms(sine(440, 0.5)) - 0.501) < 0.01);
  assert.equal(rms(run(sine(440, 0.5), { mute: true })[0]!), 0);
  assert.deepEqual([audible(undefined, false), audible({ solo: true }, true), audible({}, true), audible({ mute: true, solo: true }, true)], [true, true, false, false]);
});

test('Echo repeats a click a beat later, softer each time, about as many times as set', () => {
  const click = new Float32Array(RATE * 3);
  click[0] = 1;
  const out = run(click, { echo: { amount: 0.8, repeats: 3, beats: 1 } }, 120)[0]!;
  const at = (k: number) => out[Math.round(k * 0.5 * RATE)]!;
  assert.ok(at(1) > at(2) && at(2) > at(3) && at(3) > at(4) && at(1) > 0.5);
  assert.ok(at(3) / at(1) < 0.3, 'the third repeat is down to a faint one');
});

test('Warmth adds harmonics; Even Out brings loud and soft closer; Shimmer makes the sides differ', () => {
  const third = (x: Float32Array) => { let re = 0, im = 0; for (let i = 0; i < x.length; i++) { re += x[i]! * Math.cos((2 * Math.PI * 1320 * i) / RATE); im += x[i]! * Math.sin((2 * Math.PI * 1320 * i) / RATE); } return Math.hypot(re, im); };
  assert.ok(third(run(sine(440, 0.5), { warmth: 0.8 })[0]!) > 100 * third(sine(440, 0.5)));
  const steps = Float32Array.from({ length: RATE * 2 }, (_, i) => (i < RATE ? 0.05 : 0.8) * Math.sin((2 * Math.PI * 440 * i) / RATE));
  const ratio = (x: Float32Array) => rms(x.subarray(RATE + RATE / 2)) / rms(x.subarray(RATE / 2, RATE));
  assert.ok(ratio(run(steps, { even_out: 1 })[0]!) < 0.5 * ratio(steps), 'the gap between loud and soft shrinks');
  const [l, r] = run(sine(440, 1), { shimmer: 1 });
  let diff = 0;
  for (let i = RATE / 2; i < RATE; i++) diff += Math.abs(l![i]! - r![i]!);
  assert.ok(diff / (RATE / 2) > 0.01);
});

test('the Room\'s tail grows from Small Room to Cave, and Dry has none', () => {
  const click = new Float32Array(RATE * 9);
  click[0] = 1;
  const tailSeconds = (preset: 'dry' | 'small_room' | 'concert_hall' | 'cathedral' | 'cave') => {
    const wet = roomReverb([click, click], { preset, amount: 1 }, RATE)[0]!;
    const peak = wet.reduce((m, v) => Math.max(m, Math.abs(v)), 0);
    let last = 0;
    for (let i = 0; i < wet.length; i++) if (Math.abs(wet[i]!) > peak * 0.001) last = i;
    return last / RATE;
  };
  const t = (['dry', 'small_room', 'concert_hall', 'cathedral', 'cave'] as const).map(tailSeconds);
  assert.equal(t[0], 0);
  for (let i = 1; i < t.length; i++) assert.ok(t[i]! > t[i - 1]!, `tails ${t}`);
});

test('the limiter keeps every sample under its ceiling and leaves quiet music alone', () => {
  const x = sine(220, 1, 0.3);
  for (let i = RATE / 2; i < RATE / 2 + 400; i++) x[i] = x[i]! * 4;
  const ch = stereo(x);
  limit(ch, { on: true, ceiling_db: -1 }, RATE);
  const ceiling = 10 ** (-1 / 20);
  assert.ok(ch.every(c => c.every(v => Math.abs(v) <= ceiling + 1e-6)));
  assert.ok(Math.abs(ch[0]![1000]! - x[1000]!) < 1e-9, 'well before the peak: untouched');
  const off = stereo(x);
  limit(off, { on: false, ceiling_db: -1 }, RATE);
  assert.deepEqual([...off[0]!], [...x]);
});
