// Hum into notes: a pitch track cut into notes where the voice stops or settles on a new pitch (a vibrato or a glide
// stays one note), each snapped Friendly (the piece's key), to All 12 notes, or kept Exact with its bend, then laid on
// the piece's beats.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyseHum, humDemo, humNotes, keyScale, segmentHum, snapSegment } from '../src/compose/hum.ts';
import { trackPitch } from '../src/compose/pitch.ts';

const RATE = 44100;
/** A hummed tone: a few harmonics, a soft start and end, following `midi(t)`. */
function tone(seconds: number, midi: (t: number) => number, amp = 0.4): Float32Array {
  const out = new Float32Array(Math.round(RATE * seconds));
  let phase = 0;
  for (let i = 0; i < out.length; i++) {
    const t = i / RATE;
    phase += (2 * Math.PI * 440 * 2 ** ((midi(t) - 69) / 12)) / RATE;
    const env = Math.min(1, t / 0.02, (seconds - t) / 0.02);
    out[i] = amp * env * (Math.sin(phase) + 0.4 * Math.sin(2 * phase) + 0.2 * Math.sin(3 * phase));
  }
  return out;
}
const join = (...parts: Float32Array[]): Float32Array => {
  const out = new Float32Array(parts.reduce((n, p) => n + p.length, 0));
  let at = 0;
  for (const p of parts) { out.set(p, at); at += p.length; }
  return out;
};
const gap = (s: number): Float32Array => new Float32Array(Math.round(RATE * s));
const segsOf = (audio: Float32Array) => segmentHum(trackPitch(audio, RATE));

test('three held tones with gaps are three notes, each starting and ending where it was sung', () => {
  const segs = segsOf(join(gap(0.2), tone(0.5, () => 62), gap(0.15), tone(0.4, () => 64), gap(0.15), tone(0.6, () => 67)));
  assert.equal(segs.length, 3);
  const want = [[0.2, 0.7], [0.85, 1.25], [1.4, 2.0]];
  segs.forEach((s, i) => {
    assert.ok(Math.abs(s.start - want[i]![0]!) < 0.03, `start ${s.start} ≈ ${want[i]![0]}`);
    assert.ok(Math.abs(s.end - want[i]![1]!) < 0.03, `end ${s.end} ≈ ${want[i]![1]}`);
  });
  assert.deepEqual(segs.map(s => snapSegment(s, 'all12', []).pitch), [62, 64, 67]);
});

test('notes sung legato, without a breath between them, are still cut where the pitch settles', () => {
  const segs = segsOf(tone(1.2, t => (t < 0.4 ? 60 : t < 0.8 ? 62 : 64)));
  assert.deepEqual(segs.map(s => snapSegment(s, 'all12', []).pitch), [60, 62, 64]);
});

test('a vibrato and a glide stay one note each', () => {
  const vibrato = segsOf(tone(1, t => 69 + 0.45 * Math.sin(2 * Math.PI * 5.5 * t)));
  assert.equal(vibrato.length, 1);
  assert.equal(snapSegment(vibrato[0]!, 'all12', []).pitch, 69);
  const glide = segsOf(tone(0.8, t => 62 + (5 * t) / 0.8));
  assert.equal(glide.length, 1);
});

test('silence and noise make no notes, and a blip shorter than 80 ms is dropped', () => {
  assert.deepEqual(segsOf(gap(1)), []);
  let s = 7;
  const noise = new Float32Array(RATE).map(() => { s = (s * 1103515245 + 12345) & 0x7fffffff; return 0.3 * ((s / 0x7fffffff) * 2 - 1); });
  assert.deepEqual(segsOf(noise), []);
  assert.deepEqual(segsOf(join(gap(0.2), tone(0.05, () => 60), gap(0.2))), []);
});

test('the piece\'s key: C major with no notes, D major from D major notes', () => {
  assert.deepEqual(keyScale([]), { fifths: 0, name: 'C Major', classes: [0, 2, 4, 5, 7, 9, 11] });
  const d = keyScale([62, 64, 66, 67, 69, 71, 73, 74]);
  assert.equal(d.name, 'D Major');
  assert.deepEqual(d.classes, [1, 2, 4, 6, 7, 9, 11]);
  assert.equal(keyScale([65, 70, 69, 67]).name, 'F Major');
});

test('Friendly snaps to the key, All 12 to the nearest note, Exact keeps the bend', () => {
  const seg = { start: 0, end: 0.5, curve: [[0, 61.3], [0.1, 61.4], [0.2, 61.5], [0.3, 61.4]] as [number, number][] };
  assert.equal(snapSegment(seg, 'friendly', keyScale([]).classes).pitch, 62, 'C♯ is not in C major');
  assert.equal(snapSegment(seg, 'friendly', keyScale([62, 64, 66, 69, 71, 73]).classes).pitch, 61, 'it is in D major');
  assert.equal(snapSegment(seg, 'all12', []).pitch, 61);
  assert.equal(snapSegment(seg, 'all12', []).bend, null);
  const exact = snapSegment(seg, 'exact', []);
  assert.equal(exact.pitch, 61);
  assert.deepEqual(exact.bend!.map(([t, c]) => [t, Math.round(c)]), [[0, 30], [0.1, 40], [0.2, 50], [0.3, 40]]);
  const steady = snapSegment({ start: 0, end: 0.5, curve: [[0, 64.02], [0.2, 63.98]] }, 'exact', []);
  assert.equal(steady.bend, null, 'a bend of a few cents is no bend');
});

test('notes land on the beats: at 60 BPM a note sung 1.0 to 2.0 s after the first is one beat, one beat on', () => {
  const segs = [
    { start: 3, end: 3.5, curve: [[3, 60], [3.4, 60]] as [number, number][] },
    { start: 4, end: 5, curve: [[4, 62], [4.9, 62]] as [number, number][] },
  ];
  const off = humNotes(segs, { snap: 'all12', classes: [], startBeat: 8, bpm: 60, tidy: 'off', quarter: 1 });
  assert.deepEqual(off.map(n => [n.note.start, n.note.length, n.note.pitch, n.note.velocity]), [[8, 0.5, 60, 90], [9, 1, 62, 90]]);
  const tidy = humNotes([{ start: 0, end: 0.3, curve: [[0, 60]] }, { start: 0.62, end: 1.1, curve: [[0.62, 64]] }],
    { snap: 'all12', classes: [], startBeat: 0, bpm: 120, tidy: '1/8', quarter: 1 });
  assert.deepEqual(tidy.map(n => [n.note.start, n.note.length]), [[0, 0.5], [1, 1]], 'starts and lengths on the eighth grid, at least one step');
});

test('the demo hum is D, E, F♯ and A, the A scooped up to and sung with vibrato', () => {
  const segs = segsOf(humDemo(RATE));
  assert.deepEqual(segs.map(s => snapSegment(s, 'all12', []).pitch), [62, 64, 66, 69]);
  assert.ok(snapSegment(segs[3]!, 'exact', []).bend, 'the A has a bend to keep');
  const rate48 = segmentHum(trackPitch(humDemo(48000), 48000));
  assert.equal(rate48.length, 4);
});

test('a recording is read at about 22 kHz, with the same notes and times, and a minute in a few seconds at most', () => {
  for (const rate of [44100, 48000]) {
    const segs = analyseHum(humDemo(rate), rate);
    assert.deepEqual(segs.map(s => snapSegment(s, 'all12', []).pitch), [62, 64, 66, 69], `at ${rate}`);
    assert.ok(Math.abs(segs[0]!.start - 0.25) < 0.03 && Math.abs(segs[3]!.end - 2.8) < 0.04, `times at ${rate}`);
  }
  const minute = new Float32Array(44100 * 60);
  const demo = humDemo(44100);
  for (let i = 0; i < minute.length; i++) minute[i] = demo[i % demo.length]!;
  const t = performance.now();
  // 19 whole demos (3.1 s each), then the first 1.1 s of another: its D and the start of its E.
  assert.equal(analyseHum(minute, 44100).length, 4 * 19 + 2);
  assert.ok(performance.now() - t < 4000, `${Math.round(performance.now() - t)} ms`);
});
