import { describe, it, test } from 'node:test';
import assert from 'node:assert/strict';

describe('d', () => { it('i', () => assert.ok(true)); });
await test('after', () => { assert.ok(true); });
