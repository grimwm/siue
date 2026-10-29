// The quality ladder only ever steps down, on a slow median.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nextQuality } from '../src/modern/quality.ts';

const rep = (ms: number, n = 20) => Array.from({ length: n }, () => ms);

test('twenty slow frames drop one step', () => {
  assert.equal(nextQuality(3, rep(50)), 2);
  assert.equal(nextQuality(2, rep(50)), 1);
  assert.equal(nextQuality(1, rep(50)), 0);
});

test('the lowest step stays, fast frames and short windows change nothing, and it never rises', () => {
  assert.equal(nextQuality(0, rep(50)), 0);
  assert.equal(nextQuality(3, rep(16)), 3);
  assert.equal(nextQuality(3, rep(50, 19)), 3);
  assert.equal(nextQuality(1, rep(5)), 1);
});

test('a median, not a mean: a few spikes do not drop it, and only the last twenty count', () => {
  assert.equal(nextQuality(3, [...rep(16, 15), ...rep(500, 5)]), 3);
  assert.equal(nextQuality(3, [...rep(500, 30), ...rep(16, 20)]), 3);
  assert.equal(nextQuality(3, [...rep(16, 30), ...rep(60, 20)]), 2);
});
