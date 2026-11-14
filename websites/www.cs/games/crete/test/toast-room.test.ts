import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toastRoom } from '../src/ui/toast-room.ts';

test('a shown toast takes its whole height, three lines and all; a hidden one takes none', () => {
  assert.equal(toastRoom({ className: 'toast show', offsetHeight: 32 }), 32);
  assert.equal(toastRoom({ className: 'toast show info', offsetHeight: 69 }), 69);
  assert.equal(toastRoom({ className: 'toast', offsetHeight: 69 }), 0);
  assert.equal(toastRoom({ className: 'toast showing', offsetHeight: 69 }), 0);
});
