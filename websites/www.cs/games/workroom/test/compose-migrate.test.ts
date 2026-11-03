// Old scores in the new editor, and the new fields in the score: a schema 1 score and a schema 2 score with effect clips
// open with regions over their notes and play the same notes; a new piece with regions (one looped), markers, a key
// and sections comes back from its score exactly, through a meter change; a loop whose repeats were edited opens
// unlooped with every note kept; and the validator reads the vectors the Python validator shares.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ENTRIES, docWith } from './compose-fixture.ts';
import { docFromScore, scoreFromDoc } from '../src/compose/doc.ts';
import type { EditDoc } from '../src/compose/doc.ts';
import { expandLoops, fitRegions, loopRegion, splitRegion } from '../src/compose/regions.ts';
import { parseScore } from '../src/score.ts';
import type { Score } from '../src/score.ts';

const fixture = (name: string): Score => JSON.parse(readFileSync(join(import.meta.dirname, 'fixtures', name), 'utf8')) as Score;
interface Case { name: string; set: string; value: unknown; error: string }
interface Vectors { score: Score; invalid: Case[]; schema1: Case[] }
const vectors = (): Vectors => JSON.parse(readFileSync(join(import.meta.dirname, 'fixtures', 'composer-vectors.json'), 'utf8')) as Vectors;
const AT = { piece: { id: 'test-piece', title: 'Test piece: the Labyrinth wakes' }, project: { id: 'crete', name: 'Crete' }, draft: 2, made: '2026-11-03T12:00:00Z' };
const LIB = new Set(ENTRIES.map(e => e.id));
const noteKey = (n: Score['notes'][number]): string => `${n.lane} ${n.start} ${n.length} ${n.pitch} ${n.velocity} ${n.motif}`;
/** A document's parts without the ids the editor gives them. */
const shape = (d: EditDoc) => d.parts.map(p => ({
  id: p.id, notes: p.notes.map(({ id: _, ...n }) => n), regions: (p.regions ?? []).map(({ id: _, ...r }) => r),
}));

function setPath(root: unknown, path: string, value: unknown): void {
  const keys = path.split('.');
  let at = root as Record<string, unknown>;
  for (const k of keys.slice(0, -1)) at = at[k] as Record<string, unknown>;
  const last = keys[keys.length - 1]!;
  if (value === '__delete__') delete at[last];
  else at[last] = value;
}

test('an old schema 1 score opens with a region over each run of bars with notes, and saves as it was', () => {
  const score = fixture('score-renderable-v1.json');
  const doc = docFromScore(score, ENTRIES);
  for (const p of doc.parts) {
    assert.ok(p.regions?.length, `${p.id} has regions`);
    for (const n of p.notes) assert.equal(p.regions!.filter(r => n.start >= r.start && n.start < r.start + r.length).length, 1, 'each note in exactly one region');
  }
  assert.equal(doc.markers, undefined);
  assert.equal(doc.key, undefined);
  const saved = scoreFromDoc(doc, AT);
  assert.equal(saved.schema, 1, 'regions its notes make are not written');
  assert.ok(saved.lanes.every(l => l.regions === undefined));
  assert.deepEqual(saved.notes.map(noteKey).sort(), score.notes.map(noteKey).sort());
});

test('an old schema 2 score with effect clips opens with regions, plays the same notes and keeps its crossfader', () => {
  const score = vectors().score;
  for (const l of score.lanes) delete l.regions;
  delete score.markers;
  delete score.key;
  score.fx_clips = score.fx_clips!.slice(0, 36);
  assert.ok(parseScore(score).ok);
  const doc = docFromScore(score, ENTRIES);
  assert.ok(doc.parts.filter(p => !p.vocal).every(p => p.regions?.length));
  assert.equal(doc.parts.find(p => p.vocal)!.regions, undefined);
  const fader = doc.fxClips!.find(c => c.effect === 'crossfader')!;
  assert.deepEqual(fader.settings, { a: ['strings-low'], b: ['brass', 'voice'] }, 'no fade: the old meaning');
  const saved = scoreFromDoc(doc, AT);
  const parsed = parseScore(JSON.parse(JSON.stringify(saved)), LIB);
  assert.ok(parsed.ok, parsed.ok ? '' : parsed.error);
  assert.deepEqual(saved.notes.map(noteKey).sort(), score.notes.map(noteKey).sort());
  assert.ok(saved.lanes.every(l => l.regions === undefined));
  assert.deepEqual(saved.fx_clips!.find(c => c.effect === 'crossfader')!.settings, fader.settings);
});

/** A new piece through a change to 3/4: split, looped and empty regions, markers, a key and sections. */
function newPiece(): EditDoc {
  let d = fitRegions(docWith([
    ['piano', [[0, 1, 60], [1, 1, 64], [5, 1, 67], [8, 1, 72], [9.5, 0.5, 71]]],
    ['cello', [[0, 4, 36], [12, 2, 43]]],
  ], [{ bar: 1, bpm: 92, beats: 4, unit: 4 }, { bar: 3, bpm: 92, beats: 3, unit: 4 }]));
  const piano = d.parts[0]!;
  d = splitRegion(d, piano.id, piano.regions![0]!.id, 2)!.doc;
  d = splitRegion(d, piano.id, d.parts[0]!.regions!.find(r => r.start === 2)!.id, 8)!.doc;
  d = splitRegion(d, piano.id, d.parts[0]!.regions!.find(r => r.start === 8)!.id, 9)!.doc;
  const tail = d.parts[0]!.regions!.find(r => r.start === 9)!;
  d = loopRegion(d, piano.id, tail.id, 15);
  d = { ...d, nextId: d.nextId + 1, parts: d.parts.map((p, i) => (i === 1 ? { ...p, regions: [...p.regions!, { id: d.nextId, start: 17, length: 3 }] } : p)) };
  return {
    ...d, markers: [{ beat: 0, name: 'Start' }, { beat: 9, name: 'Waltz' }, { beat: 14, name: 'Cello Again' }], key: { tonic: 9, minor: true },
    sections: [{ id: 'intro', name: 'Intro', color: '#6b8fb3', from: 1, to: 2 }, { id: 'verse', name: 'Verse', color: '#7a9a5a', from: 3, to: 6 }],
  };
}

test('a new piece with regions, a loop, markers, a key and sections comes back from its score exactly', () => {
  const doc = newPiece();
  assert.deepEqual(doc.parts[0]!.regions!.find(r => r.loop)!, { ...doc.parts[0]!.regions!.find(r => r.loop)!, start: 9, length: 6, loop: 2 });
  const saved = scoreFromDoc(doc, AT);
  assert.equal(saved.schema, 2);
  const parsed = parseScore(JSON.parse(JSON.stringify(saved)), LIB);
  assert.ok(parsed.ok, parsed.ok ? '' : parsed.error);
  assert.deepEqual(saved.lanes[0]!.regions, [{ from_bar: 1, to_bar: 1.5 }, { from_bar: 1.5, to_bar: 3 }, { from_bar: 3, to_bar: 3.333 }, { from_bar: 3.333, to_bar: 5.333, loop_bars: 0.667 }]);
  assert.deepEqual(saved.markers, [{ bar: 1, name: 'Start' }, { bar: 3.333, name: 'Waltz' }, { bar: 5, name: 'Cello Again' }]);
  assert.deepEqual(saved.key, { tonic: 9, mode: 'minor' });
  assert.equal(saved.notes.filter(n => n.lane === 'piano').length, 5 + 2, 'the loop\'s two repeats are notes in the score');
  const back = docFromScore(parsed.ok ? parsed.score : saved, ENTRIES);
  assert.deepEqual(shape(back), shape(doc));
  assert.deepEqual(back.markers, doc.markers);
  assert.deepEqual(back.key, doc.key);
  assert.deepEqual(back.sections, [{ id: 'intro', name: 'Intro', color: '#6b8fb3', from: 1, to: 2 }, { id: 'verse', name: 'Verse', color: '#7a9a5a', from: 3, to: 6 }]);
  assert.deepEqual(expandLoops(back.parts[0]!).map(n => n.start), expandLoops(doc.parts[0]!).map(n => n.start));
});

test('a loop whose repeats were edited in the score opens unlooped, every note kept', () => {
  const saved = JSON.parse(JSON.stringify(scoreFromDoc(newPiece(), AT))) as Score;
  const repeats = saved.notes.filter(n => n.lane === 'piano').sort((a, b) => a.start - b.start).slice(-2);
  repeats[1]!.pitch = 74;
  assert.ok(parseScore(saved).ok);
  const back = docFromScore(saved, ENTRIES);
  const piano = back.parts[0]!;
  assert.equal(piano.regions!.some(r => r.loop), false);
  assert.equal(piano.notes.length, 7);
  assert.deepEqual(piano.notes.map(n => n.pitch).slice(-2), [71, 74]);
});

test('the shared vectors: regions, markers, a key and a fade-out crossfader parse; each broken field names its path', () => {
  const r = parseScore(vectors().score);
  assert.ok(r.ok, r.ok ? '' : r.error);
  assert.deepEqual(r.score.lanes[0]!.regions, [{ from_bar: 1, to_bar: 3 }, { from_bar: 3, to_bar: 5, loop_bars: 1 }]);
  assert.deepEqual(r.score.key, { tonic: 9, mode: 'minor' });
  assert.equal(r.score.markers!.length, 2);
  assert.deepEqual(r.score.fx_clips!.at(-1)!.settings, { a: ['brass'], b: [], fade: true, silent: true });
  for (const c of vectors().invalid) {
    const v = vectors();
    setPath(v.score, c.set, c.value);
    const p = parseScore(v.score);
    assert.equal(p.ok, false, c.name);
    if (!p.ok) assert.ok(p.error.startsWith(c.error + ':'), `${c.name}: ${p.error}`);
  }
  for (const c of vectors().schema1) {
    const one = fixture('score-renderable-v1.json');
    setPath(one, c.set, c.value);
    const p = parseScore(one);
    assert.equal(p.ok, false, c.name);
    if (!p.ok) assert.ok(p.error.startsWith(c.error + ':'), `${c.name}: ${p.error}`);
  }
});
