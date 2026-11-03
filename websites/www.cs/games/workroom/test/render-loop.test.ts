// A held note's loop: played the way an AudioBufferSourceNode plays it (up to the loop's end, then back to its start),
// the crossfaded sample runs across the jump with no step bigger than the waveform's own, and no jump in level, where
// the raw sample clicks and lurches every time the loop comes round.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crossfadeLoop, LOOP_CROSSFADE, loopedBuffer } from '../src/render/loop.ts';

const RATE = 48000;
/** A recorded-note stand-in: a 233 Hz tone that fades and drifts, so its loop's ends do not meet. */
const note = (seconds: number): Float32Array => Float32Array.from({ length: seconds * RATE }, (_, i) => {
  const t = i / RATE;
  return (0.6 - 0.04 * t) * Math.sin(2 * Math.PI * 233 * t + 0.3 * Math.sin(2 * Math.PI * 0.7 * t));
});

/** `seconds` of the sample as a looping source plays it from 0: through `end`, then back to `start`, again and again. */
function play(ch: Float32Array, start: number, end: number, seconds: number): Float32Array {
  const out = new Float32Array(seconds * RATE);
  let j = 0;
  for (let i = 0; i < out.length; i++) {
    out[i] = ch[j]!;
    j = j + 1 >= end ? start : j + 1;
  }
  return out;
}

const maxStep = (x: Float32Array, from: number, to: number): number => {
  let m = 0;
  for (let i = Math.max(1, from); i < Math.min(x.length, to); i++) m = Math.max(m, Math.abs(x[i]! - x[i - 1]!));
  return m;
};
const rms = (x: Float32Array, from: number, to: number): number => {
  let s = 0;
  for (let i = from; i < to; i++) s += x[i]! ** 2;
  return Math.sqrt(s / (to - from));
};

const START = Math.round(2.5 * RATE);
const END = Math.round(5.1 * RATE);

test('the raw loop has a seam: a click and a jump in level each time it comes round', () => {
  const raw = note(8);
  const heard = play(raw, START, END, 12);
  const toneStep = maxStep(raw, START, END - 1);
  assert.ok(maxStep(heard, END - 1, END + 1) > 3 * toneStep, 'the jump back is a click');
  const db = 20 * Math.log10(rms(heard, END, END + 480) / rms(heard, END - 480, END));
  assert.ok(Math.abs(db) > 1, `the level lurches by ${db.toFixed(2)} dB`);
});

test('the crossfaded loop comes round without a click or a jump in level, every time', () => {
  const raw = note(8);
  const looped = crossfadeLoop(raw, START, END, LOOP_CROSSFADE * RATE);
  const heard = play(looped, START, END, 12);
  const toneStep = maxStep(raw, 1, raw.length);
  const period = END - START;
  // The tone's own change in level from just before the loop's start to just after it: the most a seamless loop may show.
  const own = 20 * Math.log10(rms(raw, START, START + 480) / rms(raw, START - 480, START));
  for (let wrap = END; wrap < heard.length; wrap += period) {
    assert.ok(maxStep(heard, wrap - 2, wrap + 2) <= 1.05 * toneStep, `no click at ${(wrap / RATE).toFixed(2)} s`);
    const db = 20 * Math.log10(rms(heard, wrap, wrap + 480) / rms(heard, wrap - 480, wrap));
    assert.ok(Math.abs(db - own) < 0.1, `no jump in level at ${(wrap / RATE).toFixed(2)} s (${db.toFixed(2)} dB, the tone's own ${own.toFixed(2)} dB)`);
  }
  // The fade itself is smooth, and the sample before it is untouched.
  assert.ok(maxStep(looped, END - LOOP_CROSSFADE * RATE - 2, END) <= 1.05 * toneStep, 'the crossfade has no step of its own');
  assert.deepEqual(looped.subarray(0, END - LOOP_CROSSFADE * RATE), raw.subarray(0, END - LOOP_CROSSFADE * RATE));
});

test('the fade is cut to what fits before the loop starts, and a loop with no room keeps the sample as it is', () => {
  const raw = note(4);
  const start = Math.round(0.4 * RATE);
  const looped = crossfadeLoop(raw, start, 3 * RATE, RATE);
  assert.equal(looped[3 * RATE - 1], raw[start - 1], 'the last sample of the loop is the one before its start');
  assert.deepEqual(looped.subarray(0, 3 * RATE - start), raw.subarray(0, 3 * RATE - start));
  assert.deepEqual(crossfadeLoop(raw, 0, 3 * RATE, RATE), raw);
  assert.notEqual(crossfadeLoop(raw, 0, 3 * RATE, RATE), raw, 'always a copy, never the decoded sample itself');
});

test('loopedBuffer makes each buffer and loop once, every channel crossfaded', () => {
  const made: { data: Float32Array[] }[] = [];
  const buf = (channels: number, length: number, rate: number) => {
    const data = Array.from({ length: channels }, () => new Float32Array(length));
    const b = { numberOfChannels: channels, length, sampleRate: rate, data, getChannelData: (c: number) => data[c]!, copyToChannel: (s: Float32Array, c: number) => data[c]!.set(s) };
    made.push(b);
    return b as unknown as AudioBuffer;
  };
  const src = buf(2, 8 * RATE, RATE) as unknown as { data: Float32Array[] } & AudioBuffer;
  src.data[0]!.set(note(8));
  src.data[1]!.set(note(8).map(v => -v));
  made.length = 0;
  const a = loopedBuffer(src, [2.5, 5.1], buf);
  assert.equal(loopedBuffer(src, [2.5, 5.1], buf), a, 'made once');
  assert.notEqual(loopedBuffer(src, [1, 5], buf), a, 'another loop is another buffer');
  assert.equal(made.length, 2);
  for (let c = 0; c < 2; c++) assert.equal(a.getChannelData(c)[END - 1], src.getChannelData(c)[START - 1]);
});
