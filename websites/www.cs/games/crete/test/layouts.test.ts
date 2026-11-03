// New layouts: no released level repeats another's layout, turned, flipped or lightly edited; players notice repeats.
// Two levels are compared by their terrain inside the border, under all eight turns and flips of one, at every offset
// when their sizes differ by at most two rows and two columns. A cell is a feature when it is not plain floor: a wall
// (the exit and gate count as wall), ice, water, fire, gravel, a force floor (any way), a teleport, and so on. The
// overlap is the features the two share, cell for cell and kind for kind, over the cells where either has one. A wall
// buried in other walls is filler and no feature: small boards are walled out to their frame, and two blocks of
// solid rock look alike to the measure but not to a player.
// Matching cells are no measure: floor is most of every level, so unrelated levels agree on 70 to 85 per cent of their
// cells. Walls alone miss copies whose likeness is in their ice, gravel and force floors.
//
// The threshold sits in the gap between copies and levels drawn apart. Every level grown from another (turned or
// flipped, then tuned) overlapped its source by 0.44 to 0.96; pairs of levels drawn apart, a teaching and a challenge
// level or two challenge levels, overlap by at most 0.40.
//
// Teaching levels may resemble one another: each is a small board, mostly one hall or two, built to show one piece
// alone, so two of them share halls by nature. A pair of teaching levels is not compared; a teaching level and a
// challenge level are.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CHAPTERS, levelById } from '../src/campaign/chapters.ts';
import type { Level } from '../src/puzzle/level.ts';
import type { Terrain } from '../src/puzzle/tiles.ts';

/** Two levels whose features overlap this much or more repeat one layout. */
const SAME = 0.42;

/** Pairs released before this check that it finds alike; each is kept as it shipped. Every one still measures as a
 *  repeat, so the list never outlives a redraw. */
const EARLIER: readonly (readonly [string, string])[] = [
  ['ch4-4', 'ch5-5'],
  ['ch4-6', 'ch4-9'],
  ['ch4-10', 'ch5-10'],
];

type Grid = string[][];
const kindOf = (t: Terrain): string =>
  t === 'floor' ? '' : t.startsWith('force') ? 'force' : t.startsWith('toggle') ? 'toggle' : t === 'exit' || t === 'gate' ? 'wall' : t;
/** A wall with wall all round it, the eight cells next to it, is filler: solid rock that fills a small board out to
 *  its frame, with no shape a player sees. */
function filler(lv: Level, r: number, c: number): boolean {
  for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
    const R = r + dr, C = c + dc;
    if (R >= 0 && C >= 0 && R < lv.rows && C < lv.cols && kindOf(lv.terrain[R * lv.cols + C]!) !== 'wall') return false;
  }
  return true;
}
const featuresOf = (lv: Level): Grid =>
  Array.from({ length: lv.rows - 2 }, (_, r) => Array.from({ length: lv.cols - 2 }, (_, c) => {
    const k = kindOf(lv.terrain[(r + 1) * lv.cols + c + 1]!);
    return k === 'wall' && filler(lv, r + 1, c + 1) ? '' : k;
  }));
const turn = (g: Grid): Grid => g[0]!.map((_, c) => g.map(row => row[c]!).reverse());
const flip = (g: Grid): Grid => g.map(r => [...r].reverse());
function eight(g: Grid): Grid[] {
  const out: Grid[] = [];
  for (let i = 0, x = g; i < 4; i++, x = turn(x)) out.push(x, flip(x));
  return out;
}

/** The most the features of `a` and `b` overlap, over the eight turns and flips of `b` and the offsets that fit. */
function overlap(a: Level, b: Level): number {
  const A = featuresOf(a);
  let best = 0;
  for (const B of eight(featuresOf(b))) {
    const [small, big] = A.length * A[0]!.length <= B.length * B[0]!.length ? [A, B] : [B, A];
    const h = small.length, w = small[0]!.length, H = big.length, W = big[0]!.length;
    if (h > H || w > W || H - h > 2 || W - w > 2) continue;
    for (let dr = 0; dr <= H - h; dr++) for (let dc = 0; dc <= W - w; dc++) {
      let both = 0, either = 0;
      for (let r = 0; r < h; r++) for (let c = 0; c < w; c++) {
        const x = small[r]![c]!, y = big[r + dr]![c + dc]!;
        if (x && x === y) both++;
        if (x || y) either++;
      }
      best = Math.max(best, either ? both / either : 1);
    }
  }
  return best;
}

const all = CHAPTERS.filter(c => c.released).flatMap(c => c.levelIds.map((id, i) => ({ id, teaching: i < c.teaching })));
const earlier = (a: string, b: string) => EARLIER.some(([x, y]) => (x === a && y === b) || (x === b && y === a));

/** `lv` turned half a turn, with one wall inside the border taken out: a turned, lightly edited copy. */
function turnedCopy(lv: Level): Level {
  const n = lv.rows * lv.cols;
  const terrain = lv.terrain.map((_, i) => lv.terrain[n - 1 - i]!);
  const k = terrain.findIndex((t, i) => t === 'wall' && i > lv.cols && i % lv.cols > 0 && i % lv.cols < lv.cols - 1 && i < n - lv.cols);
  return { ...lv, terrain: terrain.map((t, i) => (i === k ? 'floor' : t)) };
}

test('the measure finds a turned, lightly edited copy of every level, a level matches itself fully, and the earlier repeats still measure as repeats', () => {
  for (const { id } of all) {
    assert.ok(overlap(turnedCopy(levelById(id)), levelById(id)) >= SAME, id);
    assert.equal(overlap(levelById(id), levelById(id)), 1, id);
  }
  for (const [a, b] of EARLIER) assert.ok(overlap(levelById(a), levelById(b)) >= SAME, `${a} and ${b} no longer alike: drop them from EARLIER`);
});

test(`every released level is a new layout: its features overlap no other's by ${SAME} or more (pairs of teaching levels aside)`, () => {
  const alike: string[] = [];
  for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) {
    const a = all[i]!, b = all[j]!;
    if ((a.teaching && b.teaching) || earlier(a.id, b.id)) continue;
    const x = overlap(levelById(a.id), levelById(b.id));
    if (x >= SAME) alike.push(`${a.id} and ${b.id} overlap by ${x.toFixed(2)}`);
  }
  assert.deepEqual(alike, []);
});
