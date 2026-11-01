// Play Live and Step: a held key sets its note's length, keys pressed together are one chord, starts tidy to the beat
// unless Off, recording stops after a bar of quiet, and Step's cursor moves by the picked (or held) length.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createLiveTake } from '../src/compose/live.ts';
import { createChordGather, createStepCursor, stepBeats } from '../src/compose/step.ts';
import { gridBeats, snapHeld, snapStart } from '../src/compose/snap.ts';

const close = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≈ ${b}`);

test('the grids and the held lengths', () => {
  assert.deepEqual(['1/4', '1/8', '1/16', 'off'].map(g => gridBeats(g as never, 1)), [1, 0.5, 0.25, 0]);
  assert.equal(gridBeats('1/8', 2), 1, 'an eighth is one beat in 6/8');
  assert.equal(snapStart(1.3, '1/8', 1), 1.5);
  assert.equal(snapStart(1.2, '1/8', 1), 1);
  assert.equal(snapStart(-0.2, '1/4', 1), 0);
  assert.equal(snapStart(0.37, 'off', 1), 0.37);
  assert.deepEqual([0.1, 0.6, 1.2, 1.3, 2.4, 2.6, 9].map(snapHeld), [0.25, 0.5, 1, 1.5, 2, 3, 4]);
});

test('a key held one second at 60 BPM is one beat long; 0.6 seconds is half a beat', () => {
  const take = createLiveTake({ startBeat: 16, bpm: 60, beatsPerBar: 4 });
  take.down(60, 10);
  take.up(60, 11);
  take.down(62, 11.5);
  take.up(62, 12.1);
  const notes = take.notes('1/8', 1, 12.1);
  assert.deepEqual(notes.map(n => [n.start, n.length, n.pitch]), [[16, 1, 60], [17.5, 0.5, 62]]);
});

test('two keys pressed together are a chord with one start, even released apart and even with Off', () => {
  const take = createLiveTake({ startBeat: 0, bpm: 120, beatsPerBar: 4 });
  take.down(48, 5);
  take.down(55, 5.02);
  take.up(55, 5.4);
  take.up(48, 6);
  for (const tidy of ['1/8', 'off'] as const) {
    const notes = take.notes(tidy, 1, 6);
    assert.equal(notes.length, 2, tidy);
    assert.equal(notes[0]!.start, notes[1]!.start, `${tidy}: one start`);
  }
  const off = take.notes('off', 1, 6);
  close(off[0]!.length, 2);
  close(off[1]!.length, 0.76);
  assert.deepEqual(take.notes('1/8', 1, 6).map(n => n.length), [2, 0.75]);
});

test('Off keeps the timing exactly as played', () => {
  const take = createLiveTake({ startBeat: 4, bpm: 60, beatsPerBar: 4 });
  take.down(60, 0);
  take.up(60, 0.2);
  take.down(64, 0.37);
  take.up(64, 0.5);
  const notes = take.notes('off', 1, 1);
  close(notes[1]!.start, 4.37);
  close(notes[1]!.length, 0.13);
});

test('recording stops after one bar of quiet, never while a key is held', () => {
  const take = createLiveTake({ startBeat: 0, bpm: 120, beatsPerBar: 4 });
  assert.equal(take.quietEnough(100), false, 'not before the first note');
  take.down(60, 1);
  assert.equal(take.quietEnough(10), false, 'held');
  take.up(60, 2);
  assert.equal(take.quietEnough(3.9), false);
  assert.equal(take.quietEnough(4), true, 'a bar of 4/4 at 120 is two seconds');
  take.down(62, 4.5);
  assert.deepEqual(take.held(), [62]);
  assert.equal(take.notes('off', 1, 5)[1]!.length, 1, 'a key still held ends now');
});

test('step: the cursor moves by the length; a rest moves it without notes; Back One undoes the last step', () => {
  const step = createStepCursor(0);
  assert.equal(stepBeats('quarter', false, 1), 1);
  assert.equal(stepBeats('quarter', true, 1), 1.5, 'a dotted quarter');
  assert.equal(stepBeats('eighth', false, 2), 1, 'an eighth is one beat in 6/8');
  step.add(1, [1, 2, 3]);
  step.rest(1);
  step.add(2, [4]);
  assert.equal(step.cursor(), 4);
  assert.deepEqual(step.back(), { start: 2, length: 2, ids: [4] });
  assert.deepEqual(step.back(), { start: 1, length: 1, ids: [] });
  assert.equal(step.cursor(), 1);
  step.moveTo(8);
  assert.equal(step.back(), null);
});

test('step: keys down together are one chord; a tap keeps the picked length, a hold sets it', () => {
  const gather = createChordGather(() => 60);
  gather.down(60, 0);
  gather.down(64, 0.01);
  gather.down(67, 0.02);
  assert.equal(gather.up(64, 0.1), null, 'keys still down');
  assert.equal(gather.up(60, 0.15), null);
  assert.deepEqual(gather.up(67, 0.2), { pitches: [60, 64, 67], velocities: [90, 90, 90], held: null });
  gather.down(62, 1);
  assert.deepEqual(gather.up(62, 2.6), { pitches: [62], velocities: [90], held: 1.5 }, 'held 1.6 s at 60 BPM');
  gather.down(67, 3, 40);
  gather.down(60, 3.01, 110);
  assert.deepEqual(gather.up(60, 3.1), null);
  assert.deepEqual(gather.up(67, 3.1), { pitches: [60, 67], velocities: [110, 40], held: null }, 'each key keeps how hard it was played');
});

test('after a count-in the take starts on the downbeat, so a late first note lands late', () => {
  const take = createLiveTake({ startBeat: 0, bpm: 60, beatsPerBar: 4 });
  take.begin(10);
  take.down(60, 11);
  take.up(60, 12);
  assert.deepEqual(take.notes('1/4', 1, 12).map(n => [n.start, n.length]), [[1, 1]]);
  assert.equal(take.quietEnough(15.9), false);
});

test('Play Along: times are the piece\'s own seconds, laid on its beats through a tempo change', async () => {
  const { beatClock } = await import('../src/compose/beats.ts');
  // Bar 1 at 60 BPM (4 seconds), then 120 BPM.
  const clock = beatClock([{ bar: 1, bpm: 60, beats: 4, unit: 4 }, { bar: 2, bpm: 120, beats: 4, unit: 4 }]);
  const take = createLiveTake({ startBeat: 99, bpm: 60, beatsPerBar: 4, beatOf: t => clock.beat(t) });
  take.begin(0);
  take.down(64, 1);
  take.up(64, 2);
  take.down(60, 4.25);
  take.up(60, 4.75);
  const notes = take.notes('1/8', 1, 5);
  assert.deepEqual(notes.map(n => [n.start, n.length, n.pitch]).sort((a, b) => a[0]! - b[0]!), [[1, 1, 64], [4.5, 1, 60]]);
  const exact = take.notes('off', 1, 5);
  assert.deepEqual(exact.map(n => [n.start, n.length]).sort((a, b) => a[0]! - b[0]!), [[1, 1], [4.5, 1]]);
});
