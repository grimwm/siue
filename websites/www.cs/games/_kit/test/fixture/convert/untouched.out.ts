import { test } from 'node:test';
import assert from 'node:assert/strict';

// check('in-a-comment', false);
/* check('in-a-block', false); */
const text = "check('in-a-string', false)";
const other = { check: (a, b) => a === b };
other.check('member', true);
await test('real', () => { assert.ok(text.length > 0 && other.check(1, 1)); });
