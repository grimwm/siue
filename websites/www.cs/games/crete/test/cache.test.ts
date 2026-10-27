// The result cache: keys from the level text and the search kind, lines as move letters, a store in memory, and a
// store that fails, which reads as empty and never throws.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { memoryResults, safeResults, resultKey, lineText, lineOf, isCachedResult, evictions, RESULT_LIMIT } from '../src/puzzle/cache.ts';
import type { ResultStore, CachedResult } from '../src/puzzle/cache.ts';
import type { Action } from '../src/puzzle/step.ts';

const hit: CachedResult = { solved: true, line: 'uuwrz', explored: 812 };

test('a key is the SHA-256 of the exact text, with the search kind and the solver\'s version', async () => {
  const a = await resultKey('title: a\n\nPE\n', 'solve');
  assert.match(a, /^solve-[0-9a-f]{64}$/);
  const v1 = await resultKey('title: a\n\nPE\n', 'solve', 'abc123');
  assert.match(v1, /^solve-abc123-[0-9a-f]{64}$/);
  assert.notEqual(v1, await resultKey('title: a\n\nPE\n', 'solve', 'def456'), 'another build, another key');
  assert.notEqual(v1, a);
  assert.equal(a, await resultKey('title: a\n\nPE\n', 'solve'), 'the same text, the same key');
  assert.notEqual(a, await resultKey('title: a\n\nPE\n', 'measure'), 'another kind, another key');
  assert.notEqual(a, await resultKey('title: a\n\nPE\n\n', 'solve'), 'one more byte, another key');
  // SHA-256 of the empty string.
  assert.equal(await resultKey('', 'solve'), 'solve-e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
});

test('a line is kept as move letters and read back', () => {
  const line: Action[] = [
    { kind: 'move', dir: 'up' }, { kind: 'move', dir: 'down' }, { kind: 'move', dir: 'left' }, { kind: 'move', dir: 'right' },
    { kind: 'wait' }, { kind: 'tool', tool: 'mirror' }, { kind: 'tool', tool: 'cake' }, { kind: 'tool', tool: 'cow' },
  ];
  assert.equal(lineText(line), 'udlrwzxc');
  assert.deepEqual(lineOf('udlrwzxc'), line);
  assert.equal(lineOf('uq'), null, 'a letter that is no action');
});

test('the memory store: a miss, then what was put', async () => {
  const store = memoryResults();
  assert.equal(await store.get('solve-x'), null);
  await store.put('solve-x', hit);
  assert.deepEqual(await store.get('solve-x'), hit);
  assert.equal(await store.get('measure-x'), null);
});

test('only a well-formed result counts', () => {
  assert.ok(isCachedResult(hit));
  assert.ok(isCachedResult({ ...hit, difficulty: { shortest: 3 } }));
  for (const bad of [null, 3, 'x', {}, { ...hit, line: 7 }, { ...hit, explored: '1' }, { solved: 'yes', line: '', explored: 0 }]) {
    assert.equal(isCachedResult(bad), false, JSON.stringify(bad));
  }
});

test('a store that throws or rejects reads as a miss and never throws', async () => {
  const throwing: ResultStore = {
    get() { throw new Error('no storage'); },
    put() { throw new Error('quota'); },
  };
  const rejecting: ResultStore = {
    get: () => Promise.reject(new Error('SecurityError')),
    put: () => Promise.reject(new Error('QuotaExceededError')),
  };
  const garbage: ResultStore = { get: async () => ({ solved: 1 }) as unknown as CachedResult, put: async () => {} };
  for (const inner of [throwing, rejecting, garbage]) {
    const store = safeResults(inner);
    assert.equal(await store.get('solve-x'), null);
    await store.put('solve-x', hit);
  }
});

const SHA = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

test('evictions removes other versions first', () => {
  const entries = [
    { key: `solve-aaaa-${SHA}`, modified: 5 },
    { key: `solve-bbbb-${SHA}`, modified: 9 },
  ];
  assert.deepEqual(evictions(entries, 'aaaa'), [`solve-bbbb-${SHA}`]);
});

test('evictions keeps the newest RESULT_LIMIT', () => {
  assert.equal(RESULT_LIMIT, 256);
  const entries = Array.from({ length: 300 }, (_, i) => ({ key: `solve-aaaa-${i}${SHA}`, modified: i }));
  const gone = evictions([...entries].reverse(), 'aaaa');
  assert.deepEqual(new Set(gone), new Set(entries.slice(0, 44).map(e => e.key)));
  assert.equal(gone.length, 44);
});

test('a key with no version counts as another version', () => {
  assert.deepEqual(evictions([{ key: `measure-${SHA}`, modified: 1 }], 'aaaa'), [`measure-${SHA}`]);
});

test('evictions with an unknown version keeps only the newest by age', () => {
  const entries = [{ key: `solve-aaaa-${SHA}`, modified: 1 }, { key: `solve-bbbb-${SHA}`, modified: 2 }];
  assert.deepEqual(evictions(entries, null), []);
  assert.deepEqual(evictions(entries, null, 1), [`solve-aaaa-${SHA}`]);
});

test('safeResults trim swallows a throwing trim', async () => {
  const base = { get: async () => null, put: async () => {} };
  await safeResults({ ...base, trim() { throw new Error('gone'); } }).trim?.();
  await safeResults({ ...base, trim: () => Promise.reject(new Error('gone')) }).trim?.();
  await safeResults(base).trim?.();
});
