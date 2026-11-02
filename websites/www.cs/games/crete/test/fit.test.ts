import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { BIG, BIG_MIN_CELL, cellFor, fitCell } from '../src/fit.ts';
import { boardRows } from '../src/board-plan.ts';
import type { Atlas } from '../src/board-plan.ts';
import { CHAPTERS, levelById } from '../src/campaign/chapters.ts';

const atlas = JSON.parse(readFileSync(new URL('../fx/sprites/tiles.json', import.meta.url), 'utf8')) as Atlas;

test('the largest whole cell that fits both ways, gaps included', () => {
  assert.equal(fitCell(400, 400, 15, 15, 2), 24); // (400 - 14 * 2) / 15 = 24.8
  assert.equal(fitCell(800, 300, 15, 15, 2), 18); // the height binds: (300 - 28) / 15 = 18.1
  assert.equal(fitCell(300, 800, 15, 15, 2), 18); // the width binds
});

test('a space too small for the gaps gives 0, never a negative size', () => {
  assert.equal(fitCell(20, 20, 15, 15, 2), 0);
  assert.equal(fitCell(0, 0, 15, 15, 2), 0);
});

test('a drawn maze never exceeds the space', () => {
  for (let size = 60; size <= 900; size += 37) {
    const cell = fitCell(size, size, 15, 15, 2);
    assert.ok(cell * 15 + 28 <= size, String(size));
    assert.ok((cell + 1) * 15 + 28 > size || cell === 0, `${size}: one more px would still fit`);
  }
});

test('the editor: a level up to 12 x 12 never scrolls: its cell is the plain fit', () => {
  assert.deepEqual(cellFor(385, 500, 12, 10, 0), { cell: fitCell(385, 500, 12, 10, 0), scrolls: false });
  assert.deepEqual(cellFor(100, 100, 12, 12, 0), { cell: fitCell(100, 100, 12, 12, 0), scrolls: false });
});

test('the editor: a big level too tight for 32 px cells takes 32 px and scrolls', () => {
  assert.deepEqual(cellFor(385, 500, 14, 12, 0), { cell: BIG_MIN_CELL, scrolls: true });
  assert.equal(BIG_MIN_CELL, 32);
  assert.equal(BIG, 12);
});

test('the editor: a big level with room fits whole, without scrolling', () => {
  assert.deepEqual(cellFor(1000, 800, 14, 12, 0), { cell: fitCell(1000, 800, 14, 12, 0), scrolls: false });
});

test('the editor: a 12-row level never scrolls although the rise above it makes it 12.375 rows tall', () => {
  assert.deepEqual(cellFor(300, 300, 12, 12, 0, 12.375), { cell: 24, scrolls: false });
  assert.deepEqual(cellFor(385, 500, 14, 12, 0, 12.375), { cell: BIG_MIN_CELL, scrolls: true });
});
