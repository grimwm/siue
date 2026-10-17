import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fullscreenNote } from '../src/notes.ts';

test('entering and leaving say nothing; a browser that cannot, or will not, says so', () => {
  assert.equal(fullscreenNote('entered'), null);
  assert.equal(fullscreenNote('left'), null);
  assert.equal(fullscreenNote('unsupported'), 'Full screen is not supported in this browser.');
  assert.equal(fullscreenNote('refused'), 'Full screen is not available right now.');
});
