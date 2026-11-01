// A Vocal Track's edits: a take lands as one clip of all of it, clips move, trim, split, get louder or softer and fade,
// never past their take; a saved score keeps the track in seconds and is schema 2; Undo goes through every edit.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { docFromScore, newDoc, scoreFromDoc, barsNeeded } from '../src/compose/doc.ts';
import type { EditDoc } from '../src/compose/doc.ts';
import { createHistory } from '../src/compose/history.ts';
import { addTake, moveClip, newVocalPart, pickTake, removeClip, removeTake, renameTake, setClipFades, setClipGain, splitClip, takesOf, trimClip } from '../src/compose/vocal.ts';
import { parseScore } from '../src/score.ts';
import { ENTRIES } from './compose-fixture.ts';

const A = 'local-0f8fad5b-d9cb-469f-a165-70867728950e';
const B = 'local-7c9e6679-7425-40de-944b-e07fc1f90ae7';
const SAVED = `vocal-${'d'.repeat(64)}.flac`;
const at = { piece: { id: 'song', title: 'Song' }, project: { id: 'p', name: 'P' }, draft: 1, made: '2026-11-01T00:00:00Z' };
const withVoice = (): EditDoc => {
  const d = newDoc('Song');
  return addTake({ ...d, parts: [newVocalPart('voice', 'My Voice', '#c0392b')] }, 'voice', { file: A, seconds: 4 }, 1.5);
};
const clips = (d: EditDoc) => d.parts[0]!.vocal!.clips;

test('a take lands as one clip of all of it, where it was recorded', () => {
  const d = withVoice();
  assert.deepEqual(d.parts[0]!.vocal!.takes, [{ file: A, seconds: 4 }]);
  assert.deepEqual(clips(d), [{ take: A, at: 1.5, from: 0, to: 4, gain_db: 0, fade_in: 0, fade_out: 0 }]);
  assert.equal(d.parts[0]!.instrument, 'vocal');
  assert.deepEqual(addTake(d, 'voice', { file: A, seconds: 4 }, 0), d, 'the same take twice is ignored');
});

test('moving never goes before the piece; trimming keeps what is heard in place and stays inside the take', () => {
  let d = moveClip(withVoice(), 'voice', 0, -3);
  assert.equal(clips(d)[0]!.at, 0);
  d = moveClip(d, 'voice', 0, 2);
  d = trimClip(d, 'voice', 0, 0.5, 9);
  assert.deepEqual([clips(d)[0]!.at, clips(d)[0]!.from, clips(d)[0]!.to], [2.5, 0.5, 4], 'the start moved by what was trimmed; the end held at the take');
  d = trimClip(d, 'voice', 0, 3.99, 1);
  assert.ok(clips(d)[0]!.to - clips(d)[0]!.from >= 0.05 - 1e-9, 'never shorter than 0.05 s');
});

test('a split makes two clips that play the same voice at the same times; a split at an edge does nothing', () => {
  const d = splitClip(withVoice(), 'voice', 0, 3);
  assert.deepEqual(clips(d).map(c => [c.at, c.from, c.to]), [[1.5, 0, 1.5], [3, 1.5, 4]]);
  assert.equal(clips(splitClip(withVoice(), 'voice', 0, 1.52)).length, 1);
});

test('volume is held to -24..12 dB and fades fit inside the clip', () => {
  let d = setClipGain(withVoice(), 'voice', 0, 40);
  assert.equal(clips(d)[0]!.gain_db, 12);
  d = setClipFades(d, 'voice', 0, 3, 3);
  const c = clips(d)[0]!;
  assert.ok(c.fade_in + c.fade_out <= c.to - c.from, `${c.fade_in} + ${c.fade_out}`);
  assert.equal(clips(setClipFades(d, 'voice', 0, 20, 0))[0]!.fade_in, 4 * 0.999);
});

test('a clip can play another take; removing a take removes its clips but the last take stays', () => {
  let d = addTake(withVoice(), 'voice', { file: B, seconds: 2 }, 6);
  d = pickTake(d, 'voice', 0, B);
  assert.deepEqual([clips(d)[0]!.take, clips(d)[0]!.to], [B, 2]);
  d = removeTake(d, 'voice', B);
  assert.equal(d.parts[0]!.vocal!.takes.length, 1);
  assert.equal(clips(d).length, 0);
  assert.equal(removeTake(d, 'voice', A).parts[0]!.vocal!.takes.length, 1, 'the last take stays');
  assert.equal(clips(removeClip(withVoice(), 'voice', 0)).length, 0);
});

test('a saved local take is renamed everywhere it is named', () => {
  const d = renameTake(withVoice(), A, SAVED, 4);
  assert.deepEqual(takesOf(d), [SAVED]);
  assert.equal(clips(d)[0]!.take, SAVED);
});

test('the score keeps the track in seconds, grows to hold the last clip, and parses as schema 2', () => {
  const d = moveClip(renameTake(withVoice(), A, SAVED, 4), 'voice', 0, 12);
  assert.ok(barsNeeded(d) >= 6, `16 s at 92 BPM in 4/4 needs six bars: ${barsNeeded(d)}`);
  const s = scoreFromDoc(d, at);
  assert.equal(s.schema, 2);
  assert.ok(s.duration >= 16);
  const r = parseScore(JSON.parse(JSON.stringify(s)));
  assert.ok(r.ok, r.ok ? '' : r.error);
  const back = docFromScore(r.score, ENTRIES);
  assert.deepEqual(back.parts[0]!.vocal, d.parts[0]!.vocal, 'and opens back to the same track');
});

test('Undo and Redo go through vocal edits', () => {
  const h = createHistory(withVoice());
  h.push(moveClip(h.now(), 'voice', 0, 5));
  h.push(setClipGain(h.now(), 'voice', 0, -6));
  assert.equal(clips(h.undo())[0]!.gain_db, 0);
  assert.equal(clips(h.undo())[0]!.at, 1.5);
  assert.equal(clips(h.redo())[0]!.at, 5);
});
