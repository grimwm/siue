// Speed and loudness in the editor: the tempo line written out as step tempo a bar at a time, a part's speed as a
// retime that keeps its rhythm, an own-BPM part staying where it sounds when the piece's speed changes, loudness lines
// kept valid, and a document saved as schema 1 until it uses a schema 2 field, then as a valid schema 2 score.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beatClock } from '../src/compose/beats.ts';
import { bendSeconds, docFromScore, scoreFromDoc, thinBend } from '../src/compose/doc.ts';
import { setDynamics } from '../src/compose/loudness.ts';
import { lineOf, partBeat, pieceBeat, setPartSpeed, setPieceSpeed, setTempoLine, stepTempo } from '../src/compose/speed.ts';
import { parseScore } from '../src/score.ts';
import type { Score } from '../src/score.ts';
import { ENTRIES, docWith } from './compose-fixture.ts';

const AT = { piece: { id: 'test-piece', title: 'Test' }, project: { id: 'crete', name: 'Crete' }, draft: 2, made: '2026-10-31T12:00:00Z' };
const close = (a: number, b: number, msg?: string) => assert.ok(Math.abs(a - b) < 1e-6, `${a} ≈ ${b} ${msg ?? ''}`);
const valid = (s: Score): Score => {
  const r = parseScore(JSON.parse(JSON.stringify(s)));
  assert.ok(r.ok, r.ok ? '' : r.error);
  return r.ok ? r.score : s;
};

test('a tempo line is written out a bar at a time, keeping the time signature', () => {
  const meter = [{ bar: 1, bpm: 92, beats: 4, unit: 4 as const }, { bar: 4, bpm: 92, beats: 3, unit: 4 as const }];
  const steps = stepTempo([{ bar: 1, bpm: 92, shape: 'speed_up' }, { bar: 5, bpm: 128, shape: 'steady' }], meter, 6);
  assert.deepEqual(steps.map(t => [t.bar, t.bpm, t.beats]), [[1, 92, 4], [2, 101, 4], [3, 110, 4], [4, 119, 3], [5, 128, 3]]);
});

test('a part at 2× keeps its rhythm twice as fast; back at Follow Piece it is where it was', () => {
  const doc = docWith([['cello', [[4, 2, 48], [8, 1, 50]]]]);
  const id = doc.parts[0]!.id;
  const fast = setPartSpeed(doc, id, { ratio: 2 });
  assert.deepEqual(fast.parts[0]!.notes.map(n => [n.start, n.length]), [[2, 1], [4, 0.5]]);
  const back = setPartSpeed(fast, id, 'follow');
  assert.deepEqual(back.parts[0]!.notes.map(n => [n.start, n.length]), [[4, 2], [8, 1]]);
  const clock = beatClock(doc.tempo);
  close(pieceBeat({ ratio: 0.5 }, clock, partBeat({ ratio: 0.5 }, clock, 3)), 3);
});

test('a part at its own BPM stays where it sounds when the piece\'s speed changes; a following part moves', () => {
  let doc = docWith([['cello', [[4, 4, 48]]], ['horn', [[4, 4, 60]]]]);
  const [follow, own] = doc.parts.map(p => p.id) as [string, string];
  doc = setPartSpeed(doc, own, { bpm: 92 });
  const before = beatClock(doc.tempo);
  const ownAt = before.seconds(doc.parts[1]!.notes[0]!.start);
  const followAt = before.seconds(doc.parts[0]!.notes[0]!.start);
  const quick = setPieceSpeed(doc, 128);
  const after = beatClock(quick.tempo);
  close(after.seconds(quick.parts[1]!.notes[0]!.start), ownAt, 'own BPM: same seconds');
  assert.ok(after.seconds(quick.parts[0]!.notes[0]!.start) < followAt - 0.1, 'follow: earlier at the quicker speed');
  assert.equal(quick.parts[0]!.notes[0]!.start, 4, 'follow: same beat');
  assert.equal(follow, quick.parts[0]!.id);
});

test('a document that uses nothing new is saved as schema 1, and a tempo line, speed, loudness and bend make schema 2', () => {
  const plain = docWith([['cello', [[0, 2, 48]]]]);
  assert.equal(valid(scoreFromDoc(plain, AT)).schema, 1);
  assert.equal(scoreFromDoc(setPieceSpeed(plain, 128), AT).schema, 1, 'a new starting speed alone stays schema 1');
  const id = plain.parts[0]!.id;
  let doc = setTempoLine(plain, [{ bar: 1, bpm: 92, shape: 'speed_up' }, { bar: 3, bpm: 120, shape: 'steady' }]);
  doc = setPartSpeed(doc, id, { ratio: 0.666667 });
  doc = setDynamics(doc, id, [{ bar: 1, level: 48, shape: 'louder' }, { bar: 2, level: 100, shape: 'louder' }]);
  doc = { ...doc, parts: doc.parts.map(p => ({ ...p, notes: p.notes.map(n => ({ ...n, bend: [[0, -50], [0.5, 20], [1, 0]] as [number, number][] })) })) };
  const s = valid(scoreFromDoc(doc, AT));
  assert.equal(s.schema, 2);
  assert.deepEqual(s.piece_tempo, [{ bar: 1, bpm: 92, shape: 'speed_up' }, { bar: 3, bpm: 120, shape: 'steady' }]);
  assert.deepEqual(s.tempo!.map(t => t.bpm), [92, 106, 120]);
  assert.deepEqual(s.lanes[0]!.speed, { ratio: 0.666667 });
  assert.deepEqual(s.lanes[0]!.dynamics, [{ bar: 1, level: 48, shape: 'louder' }, { bar: 2, level: 100, shape: 'steady' }], 'the last mark holds');
  const n = s.notes[0]!;
  assert.deepEqual(n.bend, [[0, -50], [n.length / 2, 20], [n.length, 0]].map(([t, c]) => [Math.round(t! * 1e6) / 1e6, c]));
});

test('a schema 2 score opens and saves back with its new fields', () => {
  const v = JSON.parse(readFileSync(join(import.meta.dirname, 'fixtures', 'schema2-vectors.json'), 'utf8')) as { score: Score };
  const doc = docFromScore(valid(v.score), ENTRIES);
  assert.deepEqual(lineOf(doc), v.score.piece_tempo);
  const s = valid(scoreFromDoc(doc, { ...AT, piece: v.score.piece, project: v.score.project }));
  assert.equal(s.schema, 2);
  assert.deepEqual(s.piece_tempo, v.score.piece_tempo);
  // Follow Piece is the default, so it is saved by leaving speed out.
  assert.deepEqual(s.lanes.map(l => [l.speed ?? 'follow', l.dynamics, l.fx, l.voice]), v.score.lanes.map(l => [l.speed, l.dynamics, l.fx, l.voice]));
  assert.deepEqual(s.mix, v.score.mix);
  const bent = s.notes.find(x => x.bend)!;
  assert.equal(bent.bend!.length, 4);
  close(bent.bend![3]![0], bent.length);
});

test('a bend is thinned to 64 points with its ends kept, and clipped to its note', () => {
  const long: [number, number][] = Array.from({ length: 300 }, (_, i) => [i / 299, Math.sin(i / 10) * 40]);
  const thin = thinBend(long);
  assert.equal(thin.length, 64);
  assert.deepEqual([thin[0], thin[63]], [long[0], long[299]]);
  assert.deepEqual(bendSeconds([[0.2, 10], [0.5, 0], [1.4, 5]], 2), [[0, 10], [0.4, 10], [1, 0], [2, 5]]);
  assert.equal(bendSeconds([[0, 10]], 2), undefined, 'one point is no bend');
});
