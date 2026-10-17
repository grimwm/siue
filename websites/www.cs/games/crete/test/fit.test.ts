import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fitCell } from '../src/fit.ts';

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
