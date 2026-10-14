import { test } from 'node:test';
import assert from 'node:assert/strict';
import { score } from '../src/rules.ts';

const s = score([1, 2]);
await test('sums', () => { assert.ok(s === 3, `score=${s}`); });
await test('positive', () => { assert.ok(s > 0, 'score, ' + s); });
