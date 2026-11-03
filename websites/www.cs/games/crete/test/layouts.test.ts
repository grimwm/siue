// New layouts: from Chapter 8 on, no level's walls repeat an earlier released level's, turned, flipped or lightly
// edited. Two levels are compared by their walls inside the border, under all eight turns and flips, at every offset
// when their sizes differ by at most two rows and two columns: the overlap is the walls they share over the walls
// either has. Matching cells are not the measure: floor is most of every level, so unrelated released levels agree
// on 70 to 85 per cent of their cells, while their walls overlap by under 0.47 (the largest between levels of
// different chapters that were drawn apart). Chapter 7's levels grown from earlier ones by a half turn overlap them
// by 0.57 to 0.96.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CHAPTERS, levelById } from '../src/campaign/chapters.ts';
import type { Level } from '../src/puzzle/level.ts';

/** A level whose walls overlap a released level's this much or more is a copy of it. */
const SAME = 0.5;
/** The chapters held to new layouts: Chapter 8 and every one after it. */
const FIRST_NEW = 8;

type Grid = boolean[][];
const wallsOf = (lv: Level): Grid =>
  Array.from({ length: lv.rows - 2 }, (_, r) => Array.from({ length: lv.cols - 2 }, (_, c) => lv.terrain[(r + 1) * lv.cols + c + 1] === 'wall'));
const turn = (g: Grid): Grid => g[0]!.map((_, c) => g.map(row => row[c]!).reverse());
const flip = (g: Grid): Grid => g.map(r => [...r].reverse());
function eight(g: Grid): Grid[] {
  const out: Grid[] = [];
  for (let i = 0, x = g; i < 4; i++, x = turn(x)) out.push(x, flip(x));
  return out;
}

/** The most the walls of `a` and `b` overlap, over the eight turns and flips of `b` and the offsets that fit. */
function overlap(a: Level, b: Level): number {
  const A = wallsOf(a);
  let best = 0;
  for (const B of eight(wallsOf(b))) {
    const [small, big] = A.length * A[0]!.length <= B.length * B[0]!.length ? [A, B] : [B, A];
    const h = small.length, w = small[0]!.length, H = big.length, W = big[0]!.length;
    if (h > H || w > W || H - h > 2 || W - w > 2) continue;
    for (let dr = 0; dr <= H - h; dr++) for (let dc = 0; dc <= W - w; dc++) {
      let both = 0, either = 0;
      for (let r = 0; r < h; r++) for (let c = 0; c < w; c++) {
        const x = small[r]![c]!, y = big[r + dr]![c + dc]!;
        if (x && y) both++;
        if (x || y) either++;
      }
      best = Math.max(best, either ? both / either : 1);
    }
  }
  return best;
}

const released = CHAPTERS.filter(c => c.released);
const all = released.flatMap(c => c.levelIds.map(id => ({ id, n: c.n })));

test('the measure finds a turned copy: Chapter 7 level 5 grew from Chapter 6 level 5 by a half turn', () => {
  assert.ok(overlap(levelById('ch7-5'), levelById('ch6-5')) >= SAME);
  assert.ok(overlap(levelById('ch6-5'), levelById('ch6-5')) === 1);
});

test(`from Chapter ${FIRST_NEW} on, every level is a new layout: its walls overlap no other released level's by ${SAME} or more`, () => {
  const fresh = all.filter(l => l.n >= FIRST_NEW);
  assert.ok(fresh.length > 0 || !released.some(c => c.n >= FIRST_NEW));
  for (const l of fresh) {
    for (const o of all) {
      if (o.id === l.id) continue;
      const x = overlap(levelById(l.id), levelById(o.id));
      assert.ok(x < SAME, `${l.id}'s walls overlap ${o.id}'s by ${x.toFixed(2)}`);
    }
  }
});
