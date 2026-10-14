import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mulberry32 } from './rng.ts';

test('the same seed gives the same stream, in [0, 1)', () => {
  const a = mulberry32(42), b = mulberry32(42);
  const xs = Array.from({ length: 5 }, a);
  assert.deepEqual(xs, Array.from({ length: 5 }, b));
  assert.ok(xs.every(x => x >= 0 && x < 1));
  assert.notDeepEqual(xs, Array.from({ length: 5 }, mulberry32(43)));
});
