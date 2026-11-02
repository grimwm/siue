// The move pad under a held finger: which arrow a point is over, and when a held arrow moves again.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HOLD_MS, REPEAT_MS, padDir, repeatDue } from '../src/pad.ts';

test('a point is over the arrow it lies furthest toward; the centre square is no arrow', () => {
  assert.equal(padDir(0, 0, 22), null);
  assert.equal(padDir(20, -21, 22), null, 'inside the centre square');
  assert.equal(padDir(30, 5, 22), 'right');
  assert.equal(padDir(-30, 10, 22), 'left');
  assert.equal(padDir(4, -40, 22), 'up');
  assert.equal(padDir(-10, 25, 22), 'down');
});

test('past the pad the nearest arrow still counts, so a slide can run off its edge', () => {
  assert.equal(padDir(400, 90, 22), 'right');
  assert.equal(padDir(-60, -300, 22), 'up');
});

test('a held arrow waits HOLD_MS before it moves again, then REPEAT_MS between moves, and never while a move plays', () => {
  assert.equal(repeatDue(HOLD_MS - 1, 0, false), false);
  assert.equal(repeatDue(HOLD_MS, 0, false), true);
  assert.equal(repeatDue(HOLD_MS + 500, 0, true), false, 'the last move is still playing');
  assert.equal(repeatDue(REPEAT_MS - 1, 3, false), false);
  assert.equal(repeatDue(REPEAT_MS, 3, false), true);
  assert.ok(REPEAT_MS < HOLD_MS);
});
