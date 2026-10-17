import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { layoutTimeline, TIMELINE } from '../src/timeline.ts';
import { tempoMap } from '../src/tempo.ts';
import { boundsFor, fitView, zoomAt } from '../src/zoom.ts';
import type { Score } from '../src/score.ts';

const read = (name: string): Score => JSON.parse(readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8')) as Score;
const score = read('score-v1.json');
const sound = read('score-sound-v1.json');
const tempo = tempoMap(score);
const close = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≈ ${b}`);

test('sections, lanes and ribbons in pixels at fit', () => {
  const l = layoutTimeline(score, tempo, fitView(16, 800));
  assert.deepEqual(l.sections.map(s => [s.id, s.rect]), [
    ['stirs', { x: 0, y: 48, w: 400, h: 28 }],
    ['thread', { x: 400, y: 48, w: 400, h: 28 }],
  ]);
  assert.deepEqual(l.lanes.map(x => [x.id, x.rect.y, x.rect.h]), [['strings-low', 76, 36], ['brass', 112, 36]]);
  assert.deepEqual(l.ribbons, [{ motif: 'ariadne', character: 'ariadne', color: '#d4a017', lane: 'brass', rect: { x: 400, y: 142, w: 400, h: TIMELINE.ribbonH } }]);
  assert.equal(l.height, 148);
  assert.deepEqual(l.ticks.map(t => t.x), [0, 100, 200, 300, 400, 500, 600, 700]);
  assert.deepEqual(l.ticks.map(t => t.label), ['1', '2', '3', '4', '5', '6', '7', '8']);
  const [p0, p1, p2] = l.energy.points;
  close(p0![0], 0); close(p0![1], 38.4);
  close(p1![0], 400); close(p1![1], 24);
  close(p2![0], 800); close(p2![1], 4.8);
});

test("a ribbon takes the colour of the score's own character", () => {
  const s: Score = { ...score, characters: score.characters.map(c => (c.id === 'ariadne' ? { ...c, color: '#112233' } : c)) };
  assert.equal(layoutTimeline(s, tempoMap(s), fitView(16, 800)).ribbons[0]!.color, '#112233');
});

test('zoomed in, layout follows the view', () => {
  const v = zoomAt(fitView(16, 800), 400, 4, boundsFor(16, 800)); // 200 px/s, start 6
  const l = layoutTimeline(score, tempo, v);
  assert.deepEqual(l.sections.map(s => [s.id, s.rect.x, s.rect.w]), [['stirs', -1200, 1600], ['thread', 400, 1600]]);
  assert.deepEqual(l.ticks.map(t => t.bar), [4, 5], 'only bar starts with 0 <= x < width (6 s and 8 s)');
});

test('a sound piece is laid out in seconds: moments for sections, layers for lanes, a seconds axis', () => {
  const l = layoutTimeline(sound, tempoMap(sound), fitView(sound.duration, 800)); // 2000 px/s
  assert.deepEqual(l.sections.map(s => s.id), ['blast', 'echo']);
  close(l.sections[0]!.rect.x, 0); close(l.sections[0]!.rect.w, 160);
  close(l.sections[1]!.rect.x, 160); close(l.sections[1]!.rect.w, 640);
  assert.deepEqual(l.lanes.map(x => [x.id, x.rect.y]), [['boom', 76], ['air', 112]]);
  assert.deepEqual(l.ribbons, [], 'no characters, no ribbons');
  assert.deepEqual(l.ticks.map(t => t.label), ['0 s', '50 ms', '100 ms', '150 ms', '200 ms', '250 ms', '300 ms', '350 ms']);
  assert.ok(l.ticks.every(t => t.bar === null));
});

test('a sound piece without sections still lays out its lanes', () => {
  const bare: Score = { ...sound, sections: [] };
  const l = layoutTimeline(bare, tempoMap(bare), fitView(bare.duration, 800));
  assert.deepEqual([l.sections, l.lanes.map(x => x.id)], [[], ['boom', 'air']]);
});
