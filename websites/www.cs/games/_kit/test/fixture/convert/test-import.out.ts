import { test } from 'node:test';
import assert from 'node:assert';

test('plain', () => assert.ok(true));
await test('bridged', () => { assert.ok(1 + 1 === 2); });
