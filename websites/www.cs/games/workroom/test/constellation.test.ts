// Constellations: each motif span's notes as stars over its lane, placed by
// time and pitch, sized by velocity, joined in time order; a span with no
// notes in its lane keeps its ribbon.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { layoutConstellations, starSize } from '../src/constellation.ts';
import { layoutTimeline, TIMELINE } from '../src/timeline.ts';
import { tempoMap } from '../src/tempo.ts';
import { fitView } from '../src/zoom.ts';
import type { Score } from '../src/score.ts';

const read = (name: string): Score => JSON.parse(readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8')) as Score;
const crete = read('score-v1.json');
const close = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≈ ${b}`);
const at = (s: Score) => {
  const view = fitView(s.duration, 800);
  return layoutConstellations(s, layoutTimeline(s, tempoMap(s), view), view);
};

test("Ariadne's motif in Crete: three stars over the brass lane, rising, the last one loudest", () => {
  const [c, ...rest] = at(crete);
  assert.equal(rest.length, 0);
  assert.deepEqual([c!.motif, c!.character, c!.name, c!.color, c!.lane, c!.ribbon], ['ariadne', 'ariadne', 'Ariadne', '#d4a017', 'brass', null]);
  assert.deepEqual(c!.stars.map(s => [s.note, s.x, s.size]), [[3, 400, 1], [4, 500, 1], [5, 600, 2]]);
  // brass lane y 112; band 118..142; motif range 62..69.
  close(c!.stars[0]!.y, 142);
  close(c!.stars[1]!.y, 118 + (1 - 3 / 7) * 24);
  close(c!.stars[2]!.y, 118);
});

test('a span with no notes in its lane keeps its ribbon', () => {
  const s: Score = { ...crete, motifs: [{ id: 'ariadne', character: 'ariadne', spans: [{ lane: 'strings-low', from: 8, to: 16 }] }] };
  const [c] = at(s);
  assert.deepEqual(c!.stars, []);
  assert.deepEqual(c!.ribbon, { x: 400, y: 76 + TIMELINE.laneH - TIMELINE.ribbonH, w: 400, h: TIMELINE.ribbonH });
});

test("a single note sits in the middle of its lane's band", () => {
  const s: Score = { ...crete, motifs: [{ id: 'ariadne', character: 'ariadne', spans: [{ lane: 'brass', from: 12, to: 16 }] }] };
  const [c] = at(s);
  assert.deepEqual(c!.stars.map(x => x.note), [5]);
  close(c!.stars[0]!.y, 118 + 12);
});

test("another lane's notes inside the span's time are not stars", () => {
  const s: Score = { ...crete, motifs: [{ id: 'ariadne', character: 'ariadne', spans: [{ lane: 'brass', from: 0, to: 16 }] }] };
  assert.deepEqual(at(s)[0]!.stars.map(x => x.note), [3, 4, 5]);
});

test('star sizes by velocity: under 64 small, under 96 middle, else big', () => {
  assert.deepEqual([0, 63, 64, 95, 96, 127].map(starSize), [0, 0, 1, 1, 2, 2]);
});

test('a sound effect with no characters has no constellations', () => {
  assert.deepEqual(at(read('score-sound-v1.json')), []);
});
