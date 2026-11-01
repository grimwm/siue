// Trial progress in this browser: cleared, assisted, best moves; blocked or corrupt storage is an empty record.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createProgress, PROGRESS_KEY, CH4_ORDER_KEY } from '../src/progress.ts';
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

test('a table stored for trial-1 to trial-8 in today\'s shape reads back the same statuses', () => {
  const table: Record<string, { cleared: boolean; best: number | null }> = {};
  for (let i = 1; i <= 8; i++) table[`trial-${i}`] = { cleared: true, best: 10 + i };
  table['trial-3'] = { cleared: true, best: null };
  const p = createProgress(memory({ [PROGRESS_KEY]: JSON.stringify(table) }));
  for (let i = 1; i <= 8; i++) {
    const want = i === 3 ? { cleared: true, assisted: true, best: null } : { cleared: true, assisted: false, best: 10 + i };
    assert.deepEqual(p.get(`trial-${i}`), want);
  }
  assert.deepEqual(p.get('trial-9'), { cleared: false, assisted: false, best: null });
});

test("Chapter 4's levels 4 to 8 keep their clears through the new order, once", () => {
  const old = { 'ch4-3': { cleared: true, best: 14 }, 'ch4-4': { cleared: true, best: 58 }, 'ch4-8': { cleared: true, best: 56 } };
  const st = memory({ [PROGRESS_KEY]: JSON.stringify(old) });
  const p = createProgress(st);
  assert.deepEqual(p.get('ch4-3'), { cleared: true, assisted: false, best: 14 }, 'a level that kept its place keeps its clear');
  assert.deepEqual(p.get('ch4-5'), { cleared: true, assisted: false, best: 58 }, 'the old level 4 is level 5 now');
  assert.deepEqual(p.get('ch4-6'), { cleared: true, assisted: false, best: 56 }, 'the old level 8 is level 6 now');
  assert.deepEqual(p.get('ch4-4'), { cleared: false, assisted: false, best: null }, 'the old level 5 was not cleared');
  assert.equal(st.data[CH4_ORDER_KEY], '1');
  p.record('ch4-4', 60, false);
  assert.deepEqual(createProgress(st).get('ch4-4'), { cleared: true, assisted: false, best: 60 }, 'a clear made since stays where it is');
  const fresh = memory();
  createProgress(fresh).record('ch4-4', 53, false);
  assert.deepEqual(createProgress(fresh).get('ch4-4'), { cleared: true, assisted: false, best: 53 }, 'a new browser is never reordered');
});
