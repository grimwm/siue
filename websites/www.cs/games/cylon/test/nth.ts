// Indexed lookups that fail the test, rather than read undefined, when the element is not there.
import assert from 'node:assert/strict';

/** The element at `i`, asserted present (the index is checked, not assumed). */
export function nth<T>(list: readonly T[], i: number): T {
  const v = list[i];
  assert.ok(v !== undefined, `no element at ${i} of ${list.length}`);
  return v;
}

export const last = <T>(list: readonly T[]): T => nth(list, list.length - 1);
