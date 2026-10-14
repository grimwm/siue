import { test } from 'node:test';
import assert from 'node:assert/strict';
import { recorder } from './record.ts';

test('a recorder keeps every call in order', () => {
  const r = recorder();
  r.fn('a', 1);
  r.fn('b', 2);
  assert.deepEqual(r.calls, [['a', 1], ['b', 2]]);
});
