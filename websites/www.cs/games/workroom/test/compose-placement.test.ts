// Where an effect lands: own-sound effects on the Effects row over the whole piece, track effects on the track (or the
// whole song from the Effects row), a riser building into the nearest bar line, the rest on the beat, all inside the
// piece and said in words; effects that need a track refuse the Effects row; a crossfader on a track fades it out; and
// what the track rows and the Effects row draw.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { docWith } from './compose-fixture.ts';
import type { EditDoc } from '../src/compose/doc.ts';
import { clipsOf } from '../src/compose/djclips.ts';
import { clipsOnPart, fxRow, laneClips, placeTarget, targetFor } from '../src/compose/placement.ts';

const doc = (): EditDoc => {
  const d = docWith([['piano', [[0, 1, 60]]], ['bass', [[0, 1, 36]]]]);
  return { ...d, bars: 8, parts: d.parts.map((p, i) => ({ ...p, id: ['piano', 'bass'][i]!, name: ['Piano', 'Bass'][i]! })) };
};

test('own-sound effects belong on the Effects row; every other effect on a track', () => {
  assert.deepEqual((['riser', 'snare_roll', 'impact', 'vinyl'] as const).map(fxRow), ['lane', 'lane', 'lane', 'lane']);
  assert.deepEqual((['filter_sweep', 'stutter', 'crossfader', 'looper', 'vocoder'] as const).map(fxRow), ['track', 'track', 'track', 'track', 'track']);
});

test('a riser builds into the nearest bar line; other effects start on the beat; all say where in words', () => {
  const d = doc();
  const riser = targetFor(d, 'riser', 'lane', 15);
  assert.deepEqual(riser, { effect: 'riser', lane: null, from_bar: 3, to_bar: 5, label: 'Riser · Effects · builds into bar 5', bad: null });
  assert.equal(targetFor(d, 'riser', 'piano', 1).to_bar, 3, 'too near the start: it builds into the first bar it can');
  assert.equal(targetFor(d, 'riser', 'piano', 1).lane, null, 'dropped on a track it still sits on the Effects row');
  assert.deepEqual(targetFor(d, 'stutter', 'piano', 8.6), { effect: 'stutter', lane: 'piano', from_bar: 3, to_bar: 3.25, label: 'Stutter · Piano · bar 3', bad: null });
  assert.deepEqual(targetFor(d, 'filter_sweep', 'lane', 6.2), { effect: 'filter_sweep', lane: null, from_bar: 2.5, to_bar: 4.5, label: 'Filter Sweep · Whole Song · bar 2 beat 3', bad: null });
  const late = targetFor(d, 'wide_8d', 'bass', 31);
  assert.deepEqual([late.from_bar, late.to_bar], [5, 9], 'kept inside the piece');
  assert.equal(targetFor(d, 'looper', 'piano', 4).lane, null, 'the Looper plays the whole song');
  assert.equal(targetFor(d, 'looper', 'piano', 4).label, 'Looper · Whole Song · bar 2');
});

test('effects that need a track refuse the Effects row; a vocoder needs another track', () => {
  const d = doc();
  assert.equal(targetFor(d, 'crossfader', 'lane', 0).bad, 'A crossfade goes on the track that fades out');
  assert.equal(targetFor(d, 'vocoder', 'lane', 0).bad, 'A vocoder goes on the track that sings the words');
  assert.equal(placeTarget(d, targetFor(d, 'crossfader', 'lane', 0)), null);
  const solo: EditDoc = { ...d, parts: d.parts.slice(0, 1) };
  assert.equal(targetFor(solo, 'vocoder', 'piano', 0).bad, 'A vocoder needs another track to sing through');
  assert.equal(targetFor(d, 'stutter', 'gone', 0).bad, 'That track is no longer in the piece');
});

test('placed: a crossfader on a track fades it out; a vocoder sings through another part', () => {
  const d = doc();
  const fade = placeTarget(d, targetFor(d, 'crossfader', 'bass', 8))!;
  assert.deepEqual(clipsOf(fade.doc)[fade.index], { effect: 'crossfader', lane: null, from_bar: 3, to_bar: 5, settings: { a: ['bass'], b: [], fade: true, silent: true } });
  const voc = placeTarget(d, targetFor(d, 'vocoder', 'bass', 0))!;
  assert.deepEqual(clipsOf(voc.doc)[voc.index]!.settings, { carrier: 'piano' });
  assert.equal(clipsOf(voc.doc)[voc.index]!.lane, 'bass');
  const riser = placeTarget(d, targetFor(d, 'riser', 'lane', 15))!;
  assert.deepEqual(clipsOf(riser.doc)[riser.index], { effect: 'riser', lane: null, from_bar: 3, to_bar: 5 });
});

test('a track row draws its own clips, the whole song\'s and crossfaders; the Effects row stacks overlaps', () => {
  const d: EditDoc = { ...doc(), fxClips: [
    { effect: 'filter_sweep', lane: 'piano', from_bar: 1, to_bar: 3 },
    { effect: 'filter_sweep', lane: null, from_bar: 3, to_bar: 5, settings: { mode: 'lowpass_down' } },
    { effect: 'stutter', lane: 'bass', from_bar: 2, to_bar: 2.25 },
    { effect: 'crossfader', lane: null, from_bar: 5, to_bar: 6, settings: { a: ['piano'], b: ['bass'] } },
    { effect: 'riser', lane: null, from_bar: 1, to_bar: 3 },
    { effect: 'impact', lane: null, from_bar: 2, to_bar: 2.25 },
    { effect: 'vinyl', lane: null, from_bar: 3, to_bar: 5 },
  ] };
  assert.deepEqual(clipsOnPart(d, 'piano').map(x => [x.index, x.shape]), [[0, 'up'], [1, 'down'], [3, 'down']]);
  assert.deepEqual(clipsOnPart(d, 'bass').map(x => [x.index, x.shape]), [[1, 'down'], [2, 'block'], [3, 'up']]);
  assert.deepEqual(laneClips(d).map(x => [x.index, x.row]), [[4, 0], [5, 1], [6, 0]]);
});
