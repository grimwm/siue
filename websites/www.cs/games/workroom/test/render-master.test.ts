// The lo-fi master's pieces that need no audio graph: the hall's impulse response, the loop fold, the hiss,
// the BS.1770 loudness, the one leveling gain and the WAV file.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fold, levelGain, loudnessLufs, pinkHiss, reverbIR, wav } from '../src/render/master.ts';

const RATE = 48000;
const sine = (seconds: number, peak: number, hz = 1000): Float32Array => Float32Array.from({ length: Math.round(seconds * RATE) }, (_, i) => peak * Math.sin((2 * Math.PI * hz * i) / RATE));
const rms = (x: Float32Array, from: number, to: number): number => {
  let s = 0;
  for (let i = from; i < to; i++) s += x[i]! ** 2;
  return Math.sqrt(s / (to - from));
};
const db = (v: number): number => 10 ** (v / 20);

test('fold cuts to the length and adds everything after it onto the start, as often as it wraps', () => {
  const ch = [Float32Array.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]), Float32Array.from([10, 20, 30, 40, 50, 60, 70, 80, 90, 100])];
  const out = fold(ch, 4);
  assert.deepEqual([...out[0]!], [1 + 5 + 9, 2 + 6 + 10, 3 + 7, 4 + 8]);
  assert.deepEqual([...out[1]!], [150, 180, 100, 120]);
  assert.deepEqual([...fold([Float32Array.from([1, 2])], 4)[0]!], [1, 2, 0, 0], 'a short input is padded with silence');
  assert.deepEqual([...ch[0]!], [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 'the input is left alone');
});

test('the hall IR is stereo, peaks at 0.5, fades in, decays and is the same for the same seed', () => {
  const ir = reverbIR(4.5, RATE, 7);
  assert.equal(ir.length, 2);
  assert.equal(ir[0]!.length, 4.5 * RATE);
  const peak = Math.max(...ir.map(c => c.reduce((m, v) => Math.max(m, Math.abs(v)), 0)));
  assert.ok(Math.abs(peak - 0.5) < 1e-6);
  assert.ok(ir[0]![0] === 0 && ir[1]![0] === 0, 'the 20 ms fade-in starts at silence');
  for (const c of ir) {
    const early = rms(c, Math.round(0.02 * RATE), Math.round(0.52 * RATE));
    const late = rms(c, c.length - RATE / 2, c.length);
    assert.ok(late < early * 0.01, `decays (early ${early}, late ${late})`);
  }
  assert.notDeepEqual(ir[0], ir[1], 'the two channels are different noise');
  assert.deepEqual(reverbIR(4.5, RATE, 7), ir);
  assert.notDeepEqual(reverbIR(4.5, RATE, 8)[0], ir[0]);
});

test('the hiss is quiet pink noise, the same in both channels, and the same for the same seed', () => {
  const h = pinkHiss(RATE * 2, RATE, 3);
  assert.equal(h.length, 2);
  assert.equal(h[0]!.length, RATE * 2);
  assert.deepEqual(h[0], h[1]);
  const top = h[0]!.reduce((m, v) => Math.max(m, Math.abs(v)), 0);
  assert.ok(top > 0 && top < 0.0015, `peak ${top}`);
  assert.deepEqual(pinkHiss(RATE * 2, RATE, 3), h);
  assert.notDeepEqual(pinkHiss(RATE * 2, RATE, 4)[0], h[0]);
});

// render.py makes the hiss in mono and upmixes it with ffmpeg's -ac 2, which puts a mono channel into each of left and
// right at 1/√2: its hiss.wav measures 0.000188 RMS per channel, against 0.000261 for the mono noise.
test('the hiss is upmixed as ffmpeg upmixes mono: 0.000188 RMS in each channel', () => {
  const h = pinkHiss(RATE * 10, RATE, 3);
  const level = rms(h[0]!, 0, h[0]!.length);
  assert.ok(Math.abs(level / 0.000188 - 1) < 0.05, `RMS ${level}`);
});

// BS.1770: K-weighting, -0.691 offset, both stereo channels weight 1.0. The -0.691 cancels the K-weighting's gain at 1 kHz,
// so a 1 kHz sine at -20 dBFS peak in one channel measures -23.0 LUFS and in both channels -20.0 LUFS
// (EBU Tech 3341 case 1: a stereo 1 kHz sine at -23 dBFS measures -23.0 LUFS).
test('the loudness of a 1 kHz sine at -20 dBFS: -20.0 LUFS in stereo, -23.0 LUFS in one channel', () => {
  const s = sine(10, db(-20));
  assert.ok(Math.abs(loudnessLufs([s, s], RATE) - -20) < 0.1, `stereo ${loudnessLufs([s, s], RATE)}`);
  assert.ok(Math.abs(loudnessLufs([s], RATE) - -23.01) < 0.1, `mono ${loudnessLufs([s], RATE)}`);
  const at441 = Float32Array.from({ length: 441000 }, (_, i) => db(-20) * Math.sin((2 * Math.PI * 1000 * i) / 44100));
  assert.ok(Math.abs(loudnessLufs([at441, at441], 44100) - -20) < 0.1, 'the K-weighting is designed for the rate');
});

test('the gates: silence does not lower the loudness, and too-quiet audio has none', () => {
  const tone = sine(10, db(-20));
  const withSilence = new Float32Array(tone.length * 2);
  withSilence.set(tone);
  assert.ok(Math.abs(loudnessLufs([withSilence, withSilence], RATE) - -20) < 0.1);
  // A loud stretch and a stretch 20 dB under it: the relative gate (-10 LU) leaves out the quiet one.
  const mixed = new Float32Array(tone.length * 2);
  mixed.set(tone);
  mixed.set(sine(10, db(-40)), tone.length);
  assert.ok(Math.abs(loudnessLufs([mixed, mixed], RATE) - -20) < 0.1);
  assert.equal(loudnessLufs([new Float32Array(RATE * 2)], RATE), -Infinity);
  assert.equal(loudnessLufs([sine(0.2, 0.5)], RATE), -Infinity, 'shorter than one 400 ms block');
});

test('the level gain reaches the loudness target unless the peak would pass its cap', () => {
  const s = sine(10, db(-20));
  assert.ok(Math.abs(levelGain([s, s], RATE, -20, -3) - 1) < 0.02);
  assert.ok(Math.abs(levelGain([s, s], RATE, -14, -3) - db(6)) < 0.02);
  assert.ok(Math.abs(levelGain([s, s], RATE, -1, -3) - db(-3) / db(-20)) < 1e-6, 'capped so the peak stays at -3 dBFS');
  assert.equal(levelGain([new Float32Array(RATE)], RATE, -20, -3), 1, 'silence is left as it is');
});

test('wav writes a 16-bit PCM file: a 44-byte header, then the interleaved, clipped samples', () => {
  const ch = [Float32Array.from([0, 1, -1, 2]), Float32Array.from([0.5, -0.5, -2, 0])];
  const bytes = wav(ch, 44100);
  assert.equal(bytes.length, 44 + 4 * 2 * 2);
  const v = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const str = (at: number): string => String.fromCharCode(...bytes.subarray(at, at + 4));
  assert.deepEqual([str(0), v.getUint32(4, true), str(8), str(12), v.getUint32(16, true)], ['RIFF', bytes.length - 8, 'WAVE', 'fmt ', 16]);
  assert.deepEqual([v.getUint16(20, true), v.getUint16(22, true), v.getUint32(24, true), v.getUint32(28, true), v.getUint16(32, true), v.getUint16(34, true)],
    [1, 2, 44100, 44100 * 4, 4, 16]);
  assert.deepEqual([str(36), v.getUint32(40, true)], ['data', 16]);
  const samples = Array.from({ length: 8 }, (_, i) => v.getInt16(44 + 2 * i, true));
  assert.deepEqual(samples, [0, 16384, 32767, -16384, -32767, -32767, 32767, 0]);
});
