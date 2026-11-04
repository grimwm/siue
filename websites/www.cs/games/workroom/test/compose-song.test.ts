// The Song settings: the time signature redraws the bars while the music keeps sounding the same, tempo changes hold
// from their bar, bars go in and out with everything after them moving, and the metronome clicks every beat with the
// first of each bar accented.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { docWith } from './compose-fixture.ts';
import { beatClock } from '../src/compose/beats.ts';
import { barsNeeded, scoreFromDoc } from '../src/compose/doc.ts';
import type { EditDoc } from '../src/compose/doc.ts';
import { fitRegions } from '../src/compose/regions.ts';
import { addSection, insertBar, removeBar, sectionsOf } from '../src/compose/sections.ts';
import { clicksBetween, meterOf, setMeter, setTempoAt, tempoChanges } from '../src/compose/song.ts';
import { setTempoLine } from '../src/compose/speed.ts';
import { parseScore } from '../src/score.ts';

const AT = { piece: { id: 'test', title: 'Test' }, project: { id: 'mine', name: 'Mine' }, draft: 1, made: '2026-11-03T00:00:00Z' };
const saved = (d: EditDoc) => {
  const parsed = parseScore(JSON.parse(JSON.stringify(scoreFromDoc(d, AT))));
  if (!parsed.ok) throw new Error(parsed.error);
  return parsed.score;
};
const seconds = (d: EditDoc) => saved(d).notes.map(n => [n.start, n.length, n.pitch]);
const tune = (): EditDoc => fitRegions({ ...docWith([['piano', [[0, 1, 60], [3, 2, 64], [6, 1, 67], [12, 4, 72]]]]), bars: 4 });

test('a new piece is 4/4; an imported mix of meters is none of the three', () => {
  assert.equal(meterOf(tune()), '4/4');
  const mixed = { ...tune(), tempo: [{ bar: 1, bpm: 92, beats: 4, unit: 4 as const }, { bar: 3, bpm: 92, beats: 5, unit: 4 as const }] };
  assert.equal(meterOf(mixed), null);
});

test('3/4 keeps every note where it sounds and redraws the bars around them', () => {
  const d = tune();
  const waltz = setMeter(d, '3/4');
  assert.equal(meterOf(waltz), '3/4');
  assert.deepEqual(seconds(waltz), seconds(d));
  assert.equal(barsNeeded(waltz), Math.ceil(16 / 3));
  assert.equal(beatClock(waltz.tempo).barStartBeat(2), 3);
  const band = { ...tune(), bars: 8 };
  assert.equal(barsNeeded(setMeter(setMeter(fitRegions({ ...band, parts: band.parts.map(x => ({ ...x, notes: [...x.notes, { ...x.notes[0]!, id: 99, start: 31 }] })) }), '3/4'), '4/4')), 8, 'there and back keeps the bars');
  assert.equal(barsNeeded(setMeter({ ...docWith([['piano', []]]), bars: 4 }, '3/4')), 5, 'an empty song keeps about its length');
});

test('6/8 counts eighths: the beats and the tempo double, and the song sounds the same', () => {
  const d = tune();
  const jig = setMeter(d, '6/8');
  assert.equal(meterOf(jig), '6/8');
  assert.equal(jig.tempo[0]!.bpm, d.tempo[0]!.bpm * 2);
  assert.deepEqual(jig.parts[0]!.notes.map(n => [n.start, n.length]), [[0, 2], [6, 4], [12, 2], [24, 8]]);
  assert.deepEqual(seconds(jig), seconds(d));
  // and back again
  assert.deepEqual(seconds(setMeter(jig, '4/4')), seconds(d));
});

test('a meter change moves sections, markers and effect clips to the bars that hold the same moment', () => {
  let d = addSection({ ...tune(), bars: 6 }, 'Chorus', 4, 6).doc;
  d = { ...d, markers: [{ beat: 12, name: 'Top' }], fxClips: [{ effect: 'riser', lane: null, from_bar: 3, to_bar: 4 }] };
  const jig = setMeter(d, '6/8');
  // bar 4 of 4/4 starts at quarter 12, which is bar 3 of 6/8 (three quarters a bar)
  assert.deepEqual(sectionsOf(jig).map(s => [s.name, s.from]), [['The Whole Piece', 1], ['Chorus', 5]]);
  assert.equal(jig.markers![0]!.beat, 24);
  assert.deepEqual([jig.fxClips![0]!.from_bar, jig.fxClips![0]!.to_bar], [3.667, 5]);
  assert.ok(saved(jig));
});

test('a tempo change holds from its bar on, and taking it away gives the bars back the speed before', () => {
  const d = { ...tune(), bars: 8 };
  const faster = setTempoAt(d, 5, 120);
  assert.deepEqual(tempoChanges(faster), [{ bar: 5, bpm: 120 }]);
  assert.deepEqual(faster.tempo.map(t => [t.bar, t.bpm]), [[1, 92], [5, 120]]);
  assert.equal(faster.tempoLine, null, 'a piece without a tempo line stays at steps (schema 1)');
  const two = setTempoAt(faster, 3, 70);
  assert.deepEqual(two.tempo.map(t => [t.bar, t.bpm]), [[1, 92], [3, 70], [5, 120]]);
  assert.deepEqual(setTempoAt(two, 3, null).tempo.map(t => [t.bar, t.bpm]), [[1, 92], [5, 120]]);
  assert.ok(saved(two));
});

test('with a tempo line, a change is a steady mark on it', () => {
  const d = setTempoLine({ ...tune(), bars: 8 }, [{ bar: 1, bpm: 92, shape: 'speed_up' }, { bar: 3, bpm: 110, shape: 'steady' }]);
  const changed = setTempoAt(d, 6, 80);
  assert.deepEqual(changed.tempoLine!.map(m => [m.bar, m.bpm, m.shape]), [[1, 92, 'speed_up'], [3, 110, 'steady'], [6, 80, 'steady']]);
  assert.ok(saved(changed));
});

test('a bar put in before bar 2 is empty, and everything after it moves a bar on', () => {
  const d = { ...tune(), markers: [{ beat: 12, name: 'Top' }] };
  const more = insertBar(d, 2);
  assert.equal(barsNeeded(more), 5);
  assert.deepEqual(more.parts[0]!.notes.map(n => [n.start, n.pitch]), [[0, 60], [3, 64], [10, 67], [16, 72]]);
  assert.equal(more.markers![0]!.beat, 16);
  assert.ok(saved(more));
  assert.equal(barsNeeded(insertBar(d, 5)), 5, 'at the end it is one more bar');
});

test('a bar taken out goes with what starts in it; the rest close up; a piece keeps one bar', () => {
  const d = tune();
  const less = removeBar(d, 2);
  assert.equal(barsNeeded(less), 3);
  assert.deepEqual(less.parts[0]!.notes.map(n => [n.start, n.pitch]), [[0, 60], [3, 64], [8, 72]]);
  assert.ok(saved(less));
  const one = { ...docWith([['piano', []]]), bars: 1 };
  assert.equal(removeBar(one, 1), one);
});

test('the metronome clicks every beat, the first of each bar accented, in any meter', () => {
  const four = beatClock([{ bar: 1, bpm: 120, beats: 4, unit: 4 }]);
  assert.deepEqual(clicksBetween(four, 3, 6).map(c => [c.beat, c.accent]), [[3, false], [4, true], [5, false]]);
  const three = beatClock([{ bar: 1, bpm: 120, beats: 3, unit: 4 }]);
  assert.deepEqual(clicksBetween(three, 0, 7).filter(c => c.accent).map(c => c.beat), [0, 3, 6]);
  assert.deepEqual(clicksBetween(four, 0.5, 1).length, 0);
});
