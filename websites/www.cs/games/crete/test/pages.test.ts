// Found story pages in this browser: added once, kept across loads; blocked or corrupt storage reads as none.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createFoundPages, PAGES_KEY } from '../src/pages.ts';
import { PROGRESS_KEY } from '../src/progress.ts';
import type { StorageLike } from '../../_kit/ports.ts';

const memory = (init: Record<string, string> = {}): StorageLike & { data: Record<string, string> } => {
  const data = { ...init };
  return { data, getItem: k => data[k] ?? null, setItem: (k, v) => { data[k] = v; }, removeItem: k => { delete data[k]; } };
};

test('add returns only the new ids and the set survives a reload', () => {
  const st = memory();
  const p = createFoundPages(st);
  assert.deepEqual(p.add(['a', 'b']), ['a', 'b']);
  assert.deepEqual(p.add(['b', 'c']), ['c']);
  assert.deepEqual(p.all(), ['a', 'b', 'c']);
  assert.equal(p.has('b'), true);
  assert.equal(p.has('z'), false);
  assert.deepEqual(createFoundPages(st).all(), ['a', 'b', 'c']);
});

test('blocked or corrupt storage reads as none, and add still works in memory', () => {
  const throwing: StorageLike = { getItem() { throw new Error('denied'); }, setItem() { throw new Error('denied'); }, removeItem() {} };
  for (const st of [null, throwing, memory({ [PAGES_KEY]: '"x"' }), memory({ [PAGES_KEY]: '[1,2]' }), memory({ [PAGES_KEY]: '{}' }), memory({ [PAGES_KEY]: '["Bad Id"]' })]) {
    const p = createFoundPages(st);
    assert.deepEqual(p.all(), []);
    assert.deepEqual(p.add(['a']), ['a']);
    assert.deepEqual(p.all(), ['a']);
  }
});

test('adding pages leaves trial progress untouched', () => {
  const st = memory({ [PROGRESS_KEY]: '{"trial-1":{"cleared":true,"best":9}}' });
  createFoundPages(st).add(['a']);
  assert.equal(st.data[PROGRESS_KEY], '{"trial-1":{"cleared":true,"best":9}}');
});
