// The kit's mulberry32 (_kit/rng.ts)
// against an independently written mulberry32, bit for bit. The reference
// below keeps the unsigned form, so this test shows the two agree for every
// seed a caller can hand over: a number (negative and above 2^31 included) comes
// in through ToInt32/ToUint32 and the streams are the same.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mulberry32, hashSeed } from '../rng.ts';

function referenceMulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function sameStream(seed: number, draws: number): void {
  const a = mulberry32(seed), b = referenceMulberry32(seed);
  for (let i = 0; i < draws; i++) {
    const x = a(), y = b();
    if (!Object.is(x, y)) assert.fail(`seed ${seed}, draw ${i}: ${x} vs ${y}`);
  }
}

test('the edge seeds give the same streams', () => {
  for (const seed of [0, 1, 2, 2 ** 31 - 1, 2 ** 31, 2 ** 31 + 1, 2 ** 32 - 1, 2 ** 32, -1, -2, -(2 ** 31), -(2 ** 31) - 1, 0.5, -0.5, 1e10, Number.MAX_SAFE_INTEGER, NaN, Infinity, -Infinity]) {
    sameStream(seed, 1000);
  }
});

test('10,000 consecutive seeds give the same first 1,000 draws', () => {
  for (let seed = 0; seed < 10_000; seed++) sameStream(seed, 1000);
});

test('10,000 seeds made by hashSeed of a string give the same first 1,000 draws', () => {
  for (let i = 0; i < 10_000; i++) {
    const seed = hashSeed(`island-${i}`);
    assert.ok(Number.isInteger(seed) && seed >= 0 && seed < 2 ** 32);
    sameStream(seed, 1000);
  }
});

test('10,000 negative and wide seeds give the same first 1,000 draws', () => {
  for (let i = 1; i <= 10_000; i++) {
    sameStream(-i, 1000);
    sameStream(-i * 2654435761, 50);
    sameStream(i * 4294967291, 50);
  }
});

test('pinned hashSeed and mulberry32 values', () => {
  // Fixed values, so the kit's generator cannot drift unnoticed.
  assert.equal(hashSeed('stefan-1984'), 1737770012);
  assert.equal(mulberry32(hashSeed('stefan-1984'))(), 0.33325220248661935);
});
