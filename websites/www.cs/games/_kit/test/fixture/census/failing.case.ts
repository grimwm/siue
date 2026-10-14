import { test } from 'node:test';
import assert from 'node:assert/strict';

test('passes', () => {});
test('breaks', () => { assert.equal(1, 2); });
