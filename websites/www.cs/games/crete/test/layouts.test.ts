// New layouts: no released level repeats another's layout, turned, flipped or lightly edited; players notice repeats.
// The measure and its threshold are src/puzzle/layouts.ts's, which Endless shares.
//
// Teaching levels may resemble one another: each is a small board, mostly one hall or two, built to show one piece
// alone, so two of them share halls by nature. A pair of teaching levels is not compared; a teaching level and a
// challenge level are.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CHAPTERS, levelById } from '../src/campaign/chapters.ts';
import type { Level } from '../src/puzzle/level.ts';
import { SAME, overlap } from '../src/puzzle/layouts.ts';

const all = CHAPTERS.filter(c => c.released).flatMap(c => c.levelIds.map((id, i) => ({ id, teaching: i < c.teaching })));

/** `lv` turned half a turn, with one wall inside the border taken out: a turned, lightly edited copy. */
function turnedCopy(lv: Level): Level {
  const n = lv.rows * lv.cols;
  const terrain = lv.terrain.map((_, i) => lv.terrain[n - 1 - i]!);
  const k = terrain.findIndex((t, i) => t === 'wall' && i > lv.cols && i % lv.cols > 0 && i % lv.cols < lv.cols - 1 && i < n - lv.cols);
  return { ...lv, terrain: terrain.map((t, i) => (i === k ? 'floor' : t)) };
}

test('the measure finds a turned, lightly edited copy of every level, and a level matches itself fully', () => {
  for (const { id } of all) {
    assert.ok(overlap(turnedCopy(levelById(id)), levelById(id)) >= SAME, id);
    assert.equal(overlap(levelById(id), levelById(id)), 1, id);
  }
});

test(`every released level is a new layout: its features overlap no other's by ${SAME} or more (pairs of teaching levels aside)`, () => {
  const alike: string[] = [];
  for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) {
    const a = all[i]!, b = all[j]!;
    if (a.teaching && b.teaching) continue;
    const x = overlap(levelById(a.id), levelById(b.id));
    if (x >= SAME) alike.push(`${a.id} and ${b.id} overlap by ${x.toFixed(2)}`);
  }
  assert.deepEqual(alike, []);
});
