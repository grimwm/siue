import { test } from 'node:test';
import assert from 'node:assert/strict';

await test('comma', () => { assert.ok([1, 2,].length === 2, 'two'); });
await test('comma-two', () => { assert.ok(true); });
