import { test } from 'node:test';

test('parent', async t => {
  await t.test('first', () => {});
  await t.test('second', () => {});
});
