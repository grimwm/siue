// Constellations: each motif span's notes as stars over its lane, placed by
// time and pitch, sized by velocity, joined in time order; a span with no
// notes in its lane keeps its ribbon.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { layoutConstellations, nearestConstellation, starSize } from '../src/constellation.ts';
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

test("a single-note span's star sits on that note's place in the lane's scale", () => {
  const s: Score = { ...crete, motifs: [{ id: 'ariadne', character: 'ariadne', spans: [{ lane: 'brass', from: 12, to: 16 }] }] };
  const [c] = at(s);
  assert.deepEqual(c!.stars.map(x => x.note), [5]);
  close(c!.stars[0]!.y, 118); // the lane's highest note (69 of 62..69)
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

test("a star sits exactly on its note's bar in the lane", () => {
  const view = fitView(crete.duration, 800);
  const layout = layoutTimeline(crete, tempoMap(crete), view);
  for (const star of layoutConstellations(crete, layout, view)[0]!.stars) {
    const bar = layout.notes.find(n => n.index === star.note)!;
    close(star.y, bar.rect.y + TIMELINE.noteH / 2);
  }
});

test('a tune that repeats transposed keeps its shape, offset in y', () => {
  const note = (start: number, pitch: number) => ({ lane: 'brass', start, length: 1, pitch, velocity: 80, motif: 'ariadne' });
  const s: Score = {
    ...crete,
    notes: [note(0, 60), note(1, 64), note(2, 62), note(8, 67), note(9, 71), note(10, 69), note(11, 60)],
    motifs: [{ id: 'ariadne', character: 'ariadne', spans: [{ lane: 'brass', from: 0, to: 4 }, { lane: 'brass', from: 8, to: 11 }] }],
  };
  const [a, b] = at(s);
  const ys = (c: typeof a) => c!.stars.map(x => x.y);
  const dy = ys(b)[0]! - ys(a)[0]!;
  ys(a).forEach((y, i) => close(ys(b)[i]!, y + dy));
  assert.notEqual(dy, 0);
});

test('a lane with one pitch puts its stars in the middle of the band', () => {
  const s: Score = { ...crete, notes: crete.notes.map(n => (n.lane === 'brass' ? { ...n, pitch: 65 } : n)) };
  const ys = at(s)[0]!.stars.map(x => x.y);
  ys.forEach(y => assert.ok(Number.isFinite(y) && Math.abs(y - 130) < 1e-9, `${y}`));
});

// The lines between stars: calm by default. They trace the tune's top line
// (a note under a higher one still sounding is accompaniment, a star with no
// line), every link is a smooth curve that never bulges past its two stars,
// and a link that leaps more than an octave, follows a long silence, or would
// cross another star is a quiet one, drawn only while its constellation is
// hovered, tapped or focused.
const tune = (notes: [number, number, number][]): Score => ({
  ...crete,
  notes: notes.map(([start, length, pitch]) => ({ lane: 'brass', start, length, pitch, velocity: 80, motif: 'ariadne' })),
  motifs: [{ id: 'ariadne', character: 'ariadne', spans: [{ lane: 'brass', from: 0, to: 16 }] }],
});
const linked = (c: ReturnType<typeof at>[number]) => c.links.map(l => [c.stars[l.from]!.note, c.stars[l.to]!.note, l.strong]);

test("Ariadne's three rising notes are two strong links, star to star", () => {
  const [c] = at(crete);
  assert.deepEqual(linked(c!), [[3, 4, true], [4, 5, true]]);
});

test('the line follows the top of a chord and skips notes under a held higher note', () => {
  // A held 69 over a bass 45 that starts under it; then a chord 74 over 53; then 72.
  const [c] = at(tune([[0, 2, 69], [1, 3, 45], [2, 1, 53], [2, 1, 74], [3, 1, 72]]));
  assert.deepEqual(linked(c!), [[0, 3, true], [3, 4, true]], 'only 69 → 74 → 72 are joined');
  assert.equal(c!.stars.length, 5, 'every note is still a star');
});

test('a top-line note picks the line up again once the higher note has ended', () => {
  const [c] = at(tune([[0, 1, 72], [1, 1, 60], [2, 1, 62]]));
  assert.deepEqual(linked(c!).map(l => l.slice(0, 2)), [[0, 1], [1, 2]]);
});

test('a leap of more than an octave is a quiet link', () => {
  const [c] = at(tune([[0, 1, 60], [1, 1, 62], [2, 1, 76], [3, 1, 74]]));
  assert.deepEqual(linked(c!).map(l => l[2]), [true, false, true]);
});

test('a link across a long silence is a quiet one', () => {
  const [c] = at(tune([[0, 0.5, 60], [0.5, 0.5, 62], [1, 0.5, 64], [6, 0.5, 65], [6.5, 0.5, 64]]));
  assert.deepEqual(linked(c!).map(l => l[2]), [true, true, false, true]);
});

test('a link that would pass through another star is a quiet one', () => {
  // 72 held over 66, then 60: the line 72 → 60 runs straight through the star of 66 (pitch 66 at 1 s is halfway).
  const [c] = at(tune([[0, 1.5, 72], [1, 1, 66], [2, 1, 60], [3, 1, 62]]));
  assert.deepEqual(linked(c!), [[0, 2, false], [2, 3, true]]);
});

test("a star of another span in the same lane is in the way too", () => {
  const s: Score = { ...tune([[0, 1, 72], [1, 1, 66], [2, 1, 60]]), motifs: [{ id: 'ariadne', character: 'ariadne', spans: [{ lane: 'brass', from: 0, to: 1 }, { lane: 'brass', from: 1, to: 2 }, { lane: 'brass', from: 2, to: 3 }] }] };
  // Each span has one star: no links at all.
  assert.deepEqual(at(s).map(c => c.links.length), [0, 0, 0]);
  const over: Score = { ...s, motifs: [{ id: 'ariadne', character: 'ariadne', spans: [{ lane: 'brass', from: 0, to: 3 }] }, { id: 'echo', character: 'ariadne', spans: [{ lane: 'brass', from: 1, to: 2 }] }] };
  // The first span's top line is 72 → 66 → 60 (66 is its own), so nothing is crossed.
  assert.ok(at(over)[0]!.links.every(l => l.strong));
});

test('each link is a curve that stays between its two stars in height', () => {
  const [c] = at(tune([[0, 1, 60], [1, 1, 67], [2, 1, 62], [3, 1, 69], [4, 1, 64]]));
  for (const l of c!.links) {
    const a = c!.stars[l.from]!;
    const b = c!.stars[l.to]!;
    const nums = l.d.match(/-?\d+(?:\.\d+)?/g)!.map(Number);
    assert.equal(nums.length, 8, l.d);
    assert.deepEqual([nums[0], nums[1], nums[6], nums[7]], [a.x, a.y, b.x, b.y].map(v => Math.round(v * 100) / 100));
    for (const y of [nums[3]!, nums[5]!]) assert.ok(y >= Math.min(a.y, b.y) - 0.01 && y <= Math.max(a.y, b.y) + 0.01, `control ${y} within ${a.y}..${b.y}`);
    for (const x of [nums[2]!, nums[4]!]) assert.ok(x > a.x && x < b.x);
  }
});

test('a hover or a tap picks the constellation whose star is nearest, within reach', () => {
  const s: Score = { ...tune([[0, 1, 60], [1, 1, 62], [8, 1, 64], [9, 1, 65]]), motifs: [{ id: 'ariadne', character: 'ariadne', spans: [{ lane: 'brass', from: 0, to: 4 }, { lane: 'brass', from: 8, to: 12 }] }] };
  const cs = at(s);
  const [a, b] = [cs[0]!.stars[1]!, cs[1]!.stars[0]!];
  assert.equal(nearestConstellation(cs, a.x + 3, a.y - 2, 12), 0);
  assert.equal(nearestConstellation(cs, b.x - 5, b.y, 12), 1);
  assert.equal(nearestConstellation(cs, (a.x + b.x) / 2, a.y - 30, 12), null, 'nothing within reach');
});
