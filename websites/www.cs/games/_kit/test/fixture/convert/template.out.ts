import { test } from 'node:test';
import assert from 'node:assert/strict';

const f = (a, b) => a + b;
await test(`sum-${f(1, 2)}`, () => { assert.ok(f(1, 2) === 3, `got ${f(1, 2)}, ${`inner ${f(3, `x, ${4}`)}`}`); });
