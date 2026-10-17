import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { hitRoll, layoutRoll, pitchName } from '../src/pianoroll.ts';
import { tempoMap } from '../src/tempo.ts';
import { fitView } from '../src/zoom.ts';
import type { Score } from '../src/score.ts';

const score = JSON.parse(readFileSync(new URL('./fixtures/score-v1.json', import.meta.url), 'utf8')) as Score;
const sound = JSON.parse(readFileSync(new URL('./fixtures/score-sound-v1.json', import.meta.url), 'utf8')) as Score;
const view = fitView(16, 800);
const close = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≈ ${b}`);

test('higher is higher, longer is longer, coloured by motif then lane', () => {
  const r = layoutRoll(score, view, 280);
  assert.deepEqual([r.low, r.high], [35, 70]);
  assert.equal(r.rowH, 280 / 36, '36 rows, inside 4..14 px');
  const byIndex = new Map(r.notes.map(n => [n.index, n]));
  assert.ok(byIndex.get(5)!.rect.y < byIndex.get(3)!.rect.y, 'pitch 69 above pitch 62');
  assert.equal(byIndex.get(2)!.rect.w, 200, 'four seconds at 50 px/s');
  assert.equal(byIndex.get(3)!.color, '#d4a017', 'motif colour');
  assert.equal(byIndex.get(0)!.color, '#7a9cc6', 'lane colour');
});

test('one lane at a time narrows the range', () => {
  const r = layoutRoll(score, view, 280, new Set(['brass']));
  assert.deepEqual([r.low, r.high, r.notes.length], [61, 70, 3]);
});

test('pitch names', () => {
  assert.deepEqual([60, 61, 38, 69].map(pitchName), ['C4', 'C#4', 'D2', 'A4']);
});

test('rows carry names and black keys, top row highest', () => {
  const r = layoutRoll(score, view, 280);
  assert.equal(r.rows[0]!.pitch, 70);
  assert.equal(r.rows[0]!.name, 'A#4');
  assert.equal(r.rows[0]!.black, true);
  assert.equal(r.rows[0]!.y, 0);
  assert.equal(r.rows[r.rows.length - 1]!.pitch, 35);
});

test('a tap on a note finds it', () => {
  const r = layoutRoll(score, view, 280);
  const n = r.notes.find(x => x.index === 4)!;
  const hit = hitRoll(r, view, tempoMap(score), score, n.rect.x + 2, n.rect.y + 1);
  assert.deepEqual([hit.noteIndex, hit.pitch, hit.laneId, hit.bar], [4, 65, 'brass', 6]);
});

test('a tap on empty space finds the row pitch and no note', () => {
  const r = layoutRoll(score, view, 280);
  const hit = hitRoll(r, view, tempoMap(score), score, 5, 1);
  assert.deepEqual([hit.noteIndex, hit.pitch], [null, 70]);
  const outside = hitRoll(r, view, tempoMap(score), score, 5, 500);
  assert.deepEqual([outside.noteIndex, outside.pitch], [null, null]);
});

test('a sound piece with no notes has an empty roll', () => {
  const r = layoutRoll(sound, fitView(sound.duration, 800), 280);
  assert.deepEqual([r.rows, r.notes, r.rowH], [[], [], 0]);
  const hit = hitRoll(r, fitView(sound.duration, 800), tempoMap(sound), sound, 10, 10);
  assert.deepEqual([hit.noteIndex, hit.pitch, hit.bar], [null, null, null]);
});

test('a sound piece with notes draws them in seconds and hits them with no bar', () => {
  const s: Score = { ...sound, notes: [
    { lane: 'boom', start: 0, length: 0.1, pitch: 36, velocity: 100, motif: null },
    { lane: 'air', start: 0.1, length: 0.2, pitch: 60, velocity: 90, motif: null },
  ] };
  const v = fitView(s.duration, 800); // 2000 px/s
  const r = layoutRoll(s, v, 280);
  close(r.notes[0]!.rect.w, 200);
  close(r.notes[1]!.rect.x, 200);
  assert.deepEqual(r.notes.map(n => n.color), ['#c0392b', '#7a9cc6'], 'lane colours: no motifs');
  const n = r.notes[0]!;
  const hit = hitRoll(r, v, tempoMap(s), s, n.rect.x + 2, n.rect.y + 1);
  assert.deepEqual([hit.noteIndex, hit.pitch, hit.laneId, hit.bar], [0, 36, 'boom', null]);
});
