import { test } from 'node:test';
import assert from 'node:assert/strict';
import { score } from '../src/rules.ts';

await test('zero-start', () => { assert.ok(score([]) === 0); });
