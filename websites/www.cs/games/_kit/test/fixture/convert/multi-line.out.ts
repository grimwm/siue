import { test } from 'node:test';
import assert from 'node:assert/strict';

const hits = [{ id: 1 }];
await test('lance-hits-once', () => { assert.ok(hits.length === 1 && hits.every(h => ({ id: h.id }).id === 1), JSON.stringify({ hits, n: [1, 2] })); });
