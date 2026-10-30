import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SWIPE_MS, SWIPE_PX, swipeDir } from '../src/swipe.ts';

test('a swipe goes the way it moved most, with screen up as up', () => {
  assert.equal(swipeDir(40, 10, 100), 'right');
  assert.equal(swipeDir(-40, 30, 100), 'left');
  assert.equal(swipeDir(10, -40, 100), 'up');
  assert.equal(swipeDir(-30, 40, 100), 'down');
});

test('a stroke shorter than SWIPE_PX or slower than SWIPE_MS is not a swipe', () => {
  assert.equal(swipeDir(SWIPE_PX - 1, 0, 100), null);
  assert.equal(swipeDir(SWIPE_PX, 0, 100), 'right');
  assert.equal(swipeDir(100, 0, SWIPE_MS + 1), null);
});
