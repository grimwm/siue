// DJ & Effects' edits: a tapped effect lands for its usual length with what it needs, a clip moves and stretches inside
// the piece, a setting at its default is left out, a recorded performance lands as one step, and only clips the score
// can keep are saved (a removed part's clips go; a crossfader side left empty drops it).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { removePart } from '../src/compose/edit.ts';
import { addClips, moveClip, placeClip, removeClip, resizeClip, savedClips, setClipLane, setClipSetting, stepClip, clipsOf } from '../src/compose/djclips.ts';
import { docFromScore, newDoc, scoreFromDoc } from '../src/compose/doc.ts';
import type { EditDoc, Part } from '../src/compose/doc.ts';
import { parseScore } from '../src/score.ts';

const part = (id: string): Part => ({ id, name: id, color: '#123456', family: 'keys', icon: 'keys', instrument: 'piano', gain_db: 0, attack: 0.01, release: 0.3, notes: [{ id: 1, start: 0, length: 1, pitch: 60, velocity: 90, motif: null }], speed: 'follow', dynamics: null });
const doc = (): EditDoc => ({ ...newDoc('Test'), bars: 8, parts: [part('keys'), part('bass')] });
const AT = { piece: { id: 'test', title: 'Test' }, project: { id: 'mine', name: 'Mine' }, draft: 1, made: '2026-11-01T00:00:00Z' };

test('a tapped-in effect lands for its usual length, on its part or the whole piece', () => {
  let d = placeClip(doc(), 'riser', null, 5);
  assert.deepEqual(clipsOf(d)[0], { effect: 'riser', lane: null, from_bar: 5, to_bar: 7 });
  d = placeClip(d, 'stutter', 'keys', 3.5);
  assert.deepEqual(clipsOf(d)[1], { effect: 'stutter', lane: 'keys', from_bar: 3.5, to_bar: 3.75 });
  d = placeClip(d, 'looper', 'keys', 4);
  assert.equal(clipsOf(d)[2]!.lane, null, 'the Looper plays on the whole piece');
  assert.deepEqual(clipsOf(d)[2]!.settings, { bars: [3] }, 'and loops the bar before');
  assert.deepEqual(clipsOf(placeClip(doc(), 'vocoder', 'keys', 1))[0]!.settings, { carrier: 'bass' }, 'a vocoder gets another part to sing through');
  assert.deepEqual(clipsOf(placeClip(doc(), 'crossfader', null, 1))[0]!.settings, { a: ['keys'], b: ['bass'] });
});

test('a clip stays inside the piece when it is placed, moved or stretched', () => {
  let d = placeClip(doc(), 'riser', null, 8.5);
  assert.deepEqual([clipsOf(d)[0]!.from_bar, clipsOf(d)[0]!.to_bar], [7, 9], 'placed near the end it ends at the end');
  d = moveClip(d, 0, 2.25);
  assert.deepEqual([clipsOf(d)[0]!.from_bar, clipsOf(d)[0]!.to_bar], [2.25, 4.25]);
  d = resizeClip(d, 0, 20);
  assert.equal(clipsOf(d)[0]!.to_bar, 9);
  d = resizeClip(d, 0, 2);
  assert.ok(clipsOf(d)[0]!.to_bar > 2.25, 'never before its start');
  d = moveClip(placeClip(doc(), 'scratch', null, 2), 0, 3);
  d = addClips(doc(), [{ effect: 'scratch', lane: null, from_bar: 2, to_bar: 2.5, points: [[2, 1], [2.5, -1]] }]);
  d = moveClip(d, 0, 4);
  assert.deepEqual(clipsOf(d)[0]!.points, [[4, 1], [4.5, -1]], 'its recorded moves move with it');
});

test('Shorter and Longer step a clip\'s end a beat', () => {
  let d = placeClip(doc(), 'trance_gate', null, 2);
  d = stepClip(d, 0, 1);
  assert.equal(clipsOf(d)[0]!.to_bar, 3.25);
  d = stepClip(stepClip(d, 0, -1), 0, -1);
  assert.equal(clipsOf(d)[0]!.to_bar, 2.75);
});

test('a setting back at its default is left out; a clip can move to another part', () => {
  let d = setClipSetting(placeClip(doc(), 'tape_stop', null, 2), 0, 'time', 'slow');
  assert.deepEqual(clipsOf(d)[0]!.settings, { time: 'slow' });
  d = setClipSetting(d, 0, 'time', 'medium');
  assert.equal(clipsOf(d)[0]!.settings, undefined);
  d = setClipLane(d, 0, 'bass');
  assert.equal(clipsOf(d)[0]!.lane, 'bass');
  d = removeClip(d, 0);
  assert.deepEqual(clipsOf(d), []);
});

test('a performance lands as one step', () => {
  const d = addClips(doc(), [{ effect: 'stutter', lane: null, from_bar: 2, to_bar: 2.25 }, { effect: 'tape_stop', lane: null, from_bar: 3, to_bar: 4 }]);
  assert.equal(clipsOf(d).length, 2);
});

test('the score keeps only the clips it can: a removed part\'s go, a crossfader with an empty side goes', () => {
  const clips = [
    { effect: 'stutter' as const, lane: 'gone', from_bar: 1, to_bar: 1.25 },
    { effect: 'vocoder' as const, lane: 'keys', from_bar: 1, to_bar: 2, settings: { carrier: 'gone' } },
    { effect: 'crossfader' as const, lane: null, from_bar: 1, to_bar: 2, settings: { a: ['keys'], b: ['gone'] } },
    { effect: 'riser' as const, lane: null, from_bar: 7, to_bar: 12 },
  ];
  assert.deepEqual(savedClips(clips, new Set(['keys', 'bass']), 8), [{ effect: 'riser', lane: null, from_bar: 7, to_bar: 9 }]);
});

test('clips round-trip through the score, and a piece without them stays as it was', () => {
  const plain = scoreFromDoc(doc(), AT);
  assert.equal(plain.fx_clips, undefined);
  assert.equal(plain.schema, 1);
  const d = setClipSetting(placeClip(doc(), 'filter_sweep', 'keys', 2), 0, 'mode', 'lowpass_down');
  const s = scoreFromDoc(d, AT);
  assert.equal(s.schema, 2);
  const parsed = parseScore(JSON.parse(JSON.stringify(s)));
  assert.ok(parsed.ok, parsed.ok ? '' : parsed.error);
  const back = docFromScore(parsed.ok ? parsed.score : s, []);
  assert.deepEqual(clipsOf(back), clipsOf(d));
});

test('removing a part takes its clips, a vocoder it carried, and its place on a crossfader', () => {
  let d: EditDoc = { ...doc(), parts: [part('keys'), part('bass'), part('drums')] };
  d = placeClip(d, 'stutter', 'bass', 1);
  d = placeClip(d, 'vocoder', 'keys', 2);
  d = setClipSetting(d, 1, 'carrier', 'bass');
  d = placeClip(d, 'crossfader', null, 3);
  d = setClipSetting(setClipSetting(d, 2, 'a', ['keys']), 2, 'b', ['bass', 'drums']);
  d = placeClip(d, 'riser', null, 4);
  const after = clipsOf(removePart(d, 'bass'));
  assert.deepEqual(after.map(c => c.effect), ['crossfader', 'riser']);
  assert.deepEqual(after[0]!.settings, { a: ['keys'], b: ['drums'] });
});
