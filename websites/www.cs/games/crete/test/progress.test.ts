// Trial progress in this browser: cleared, assisted, best moves; blocked or corrupt storage is an empty record.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createProgress, PROGRESS_KEY } from '../src/progress.ts';
import type { StorageLike } from '../../_kit/ports.ts';

const memory = (init: Record<string, string> = {}): StorageLike & { data: Record<string, string> } => {
  const data = { ...init };
  return { data, getItem: k => data[k] ?? null, setItem: (k, v) => { data[k] = v; }, removeItem: k => { delete data[k]; } };
};

test('an unplayed trial is not cleared', () => {
  assert.deepEqual(createProgress(memory()).get('trial-1'), { cleared: false, assisted: false, best: null });
});

test('best keeps the fewest unassisted moves; assisted clears alone mark the trial assisted', () => {
  const st = memory();
  const p = createProgress(st);
  assert.deepEqual(p.record('trial-2', 30, true), { cleared: true, assisted: true, best: null });
  assert.deepEqual(p.record('trial-2', 25, false), { cleared: true, assisted: false, best: 25 });
  assert.deepEqual(p.record('trial-2', 28, false), { cleared: true, assisted: false, best: 25 });
  assert.deepEqual(p.record('trial-2', 20, true), { cleared: true, assisted: false, best: 25 }, 'an assisted clear never costs a best');
  assert.deepEqual(createProgress(st).get('trial-2'), { cleared: true, assisted: false, best: 25 }, 'kept in storage');
});

test('blocked or corrupt storage is an empty record and never throws', () => {
  const throwing: StorageLike = { getItem() { throw new Error('denied'); }, setItem() { throw new Error('denied'); }, removeItem() {} };
  for (const st of [null, throwing, memory({ [PROGRESS_KEY]: '{not json' }), memory({ [PROGRESS_KEY]: '{"trial-1":{"best":"x"}}' })]) {
    const p = createProgress(st);
    assert.deepEqual(p.get('trial-1'), { cleared: false, assisted: false, best: null });
    assert.doesNotThrow(() => p.record('trial-1', 9, false));
  }
});
