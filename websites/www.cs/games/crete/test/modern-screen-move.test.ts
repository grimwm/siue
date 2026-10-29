// A direction on the screen becomes a grid direction at the view's nearest quarter turn.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { screenToGrid } from '../src/modern/screen-move.ts';

test('screen-up follows the quarter turn of the view', () => {
  assert.equal(screenToGrid('up', 15), 'up');
  assert.equal(screenToGrid('up', 44), 'up');
  assert.equal(screenToGrid('up', 90), 'left');
  assert.equal(screenToGrid('up', 180), 'down');
  assert.equal(screenToGrid('up', -90), 'right');
  assert.equal(screenToGrid('up', 270), 'right');
  assert.equal(screenToGrid('up', 720 + 15), 'up');
});

test('the other directions rotate with it', () => {
  assert.equal(screenToGrid('right', 90), 'up');
  assert.equal(screenToGrid('down', 90), 'right');
  assert.equal(screenToGrid('left', 90), 'down');
  assert.equal(screenToGrid('left', 0), 'left');
  assert.equal(screenToGrid('right', 0), 'right');
  assert.equal(screenToGrid('down', 180), 'up');
});
