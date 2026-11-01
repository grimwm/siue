// The pitch tracker Hum (and Auto-Tune, later) listens with: synthesized tones within a few cents, a harmonic-rich voice
// not an octave off, silence and noise unvoiced, streaming the same as batch, and a vibrato followed.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createPitchTracker, detectPitch, midiOf, trackPitch } from '../src/compose/pitch.ts';

const cents = (a: number, b: number): number => 1200 * Math.log2(a / b);
const sine = (hz: number, rate: number, seconds: number, amp = 0.5): Float32Array => {
  const out = new Float32Array(Math.round(rate * seconds));
  for (let i = 0; i < out.length; i++) out[i] = amp * Math.sin((2 * Math.PI * hz * i) / rate);
  return out;
};
/** A seeded noise, so the test is the same every run. */
const noise = (n: number, amp = 0.3): Float32Array => {
  let s = 12345;
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) { s = (s * 1103515245 + 12345) & 0x7fffffff; out[i] = amp * ((s / 0x7fffffff) * 2 - 1); }
  return out;
};

test('midiOf: A4 is 69, middle C is 60', () => {
  assert.equal(midiOf(440), 69);
  assert.ok(Math.abs(midiOf(261.6256) - 60) < 1e-4);
  assert.ok(Math.abs(midiOf(466.1638) - 70) < 1e-4);
});

test('sines from 110 to 880 Hz, at 44.1 and 48 kHz, are within 5 cents', () => {
  for (const rate of [44100, 48000]) {
    for (const hz of [110, 220, 261.63, 440, 880]) {
      const got = detectPitch(sine(hz, rate, 0.05).subarray(0, 2048), rate);
      assert.ok(got, `${hz} Hz at ${rate}`);
      assert.ok(Math.abs(cents(got.hz, hz)) < 5, `${hz} Hz at ${rate}: got ${got.hz}`);
      assert.ok(got.clarity > 0.8);
    }
  }
});

test('a harmonic-rich tone is not an octave off', () => {
  const rate = 44100;
  const out = new Float32Array(2048);
  for (let k = 1; k <= 8; k++) {
    const part = sine(196 * k, rate, 0.05, 0.5 / k);
    for (let i = 0; i < out.length; i++) out[i]! += part[i]!;
  }
  const got = detectPitch(out, rate);
  assert.ok(got);
  assert.ok(Math.abs(cents(got.hz, 196)) < 5, `got ${got.hz}`);
});

test('silence and noise are unvoiced', () => {
  assert.equal(detectPitch(new Float32Array(2048), 44100), null);
  assert.equal(detectPitch(noise(2048), 44100), null);
  const frames = trackPitch(new Float32Array(44100), 44100);
  assert.ok(frames.length > 100);
  assert.ok(frames.every(f => f.hz === null));
  assert.ok(trackPitch(noise(44100), 44100).filter(f => f.hz !== null).length < frames.length * 0.05, 'noise is nearly all unvoiced');
});

test('a quiet frame is unvoiced even when it has a pitch', () => {
  const frames = trackPitch(sine(220, 44100, 0.5, 0.002), 44100);
  assert.ok(frames.every(f => f.hz === null));
});

test('the streaming tracker gives the frames the batch one does, in any chunk size', () => {
  const rate = 44100;
  const audio = new Float32Array([...sine(220, rate, 0.4), ...new Float32Array(4000), ...sine(330, rate, 0.4)]);
  const batch = trackPitch(audio, rate);
  const tracker = createPitchTracker(rate);
  const streamed = [];
  for (let i = 0; i < audio.length; i += 777) streamed.push(...tracker.push(audio.subarray(i, i + 777)));
  streamed.push(...tracker.end());
  assert.equal(streamed.length, batch.length);
  streamed.forEach((f, i) => {
    assert.equal(f.t, batch[i]!.t);
    assert.equal(f.hz, batch[i]!.hz);
  });
  assert.ok(Math.abs(batch[1]!.t - batch[0]!.t - 256 / rate) < 1e-12, 'a frame every hop');
});

test('a 5.5 Hz vibrato of ±40 cents on A4 is followed within 10 cents', () => {
  const rate = 44100;
  const n = rate;
  const out = new Float32Array(n);
  let phase = 0;
  const truth = (t: number): number => 440 * 2 ** ((40 * Math.sin(2 * Math.PI * 5.5 * t)) / 1200);
  for (let i = 0; i < n; i++) { phase += (2 * Math.PI * truth(i / rate)) / rate; out[i] = 0.5 * Math.sin(phase); }
  // A frame's time is its window's middle; the last few frames' windows run past the sudden end, which is not a voice.
  const frames = trackPitch(out, rate).filter(f => f.hz !== null && f.t < 0.95);
  assert.ok(frames.length > 150);
  const worst = Math.max(...frames.map(f => Math.abs(cents(f.hz!, truth(f.t)))));
  assert.ok(worst < 10, `worst ${worst} cents`);
});
