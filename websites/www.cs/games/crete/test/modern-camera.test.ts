// The modern look's camera maths: easing, clamping, panning, yaw choice and view height.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clampCam, easeCam, nearestYaw, panCam, viewRows } from '../src/modern/camera.ts';
import type { Cam } from '../src/modern/camera.ts';

test('easeCam closes on the goal, reports motion, and settles exactly', () => {
  const cur: Cam = { yaw: 0, tx: 0, tz: 0 };
  const goal: Cam = { yaw: 90, tx: 3, tz: -2 };
  let frames = 0;
  while (easeCam(cur, goal, 1 / 60, false)) assert.ok(++frames < 600);
  assert.deepEqual(cur, goal);
  assert.equal(easeCam(cur, goal, 1 / 60, false), false);
});

test('easeCam snaps at once under reduced motion', () => {
  const cur: Cam = { yaw: 0, tx: 0, tz: 0 };
  assert.equal(easeCam(cur, { yaw: 45, tx: 2, tz: 2 }, 1 / 60, true), false);
  assert.deepEqual(cur, { yaw: 45, tx: 2, tz: 2 });
});

test('clampCam pulls a far target back to one cell beyond the board and keeps a near one', () => {
  assert.deepEqual(clampCam({ yaw: 7, tx: 50, tz: -50 }, 5, 3), { yaw: 7, tx: 3, tz: -2 });
  assert.deepEqual(clampCam({ yaw: 0, tx: 1, tz: 0.5 }, 5, 3), { yaw: 0, tx: 1, tz: 0.5 });
});

test('panCam: the board follows the finger, with depth foreshortened by sin 45 degrees', () => {
  const r = panCam({ yaw: 0, tx: 0, tz: 0 }, 10, 0, 0.1);
  assert.ok(Math.abs(r.tx + 1) < 1e-9 && Math.abs(r.tz) < 1e-9, 'a rightward drag moves the target toward -x');
  const d = panCam({ yaw: 0, tx: 0, tz: 0 }, 0, 10, 0.1);
  assert.ok(Math.abs(d.tz + 1 / Math.sin(Math.PI / 4)) < 1e-9);
  const t = panCam({ yaw: 90, tx: 0, tz: 0 }, 10, 0, 0.1);
  assert.ok(Math.abs(t.tx) < 1e-9 && Math.abs(t.tz - 1) < 1e-9, 'the drag follows the turned view');
});

test('nearestYaw picks the equivalent angle closest to the current one', () => {
  assert.equal(nearestYaw(15, 370), 375);
  assert.equal(nearestYaw(15, -400), -345);
  assert.equal(nearestYaw(15, 20), 15);
});

test('viewRows grows on a narrow screen and stays within 7.5 and 14', () => {
  assert.equal(viewRows(2), 7.5);
  assert.equal(viewRows(1), 7.5);
  assert.equal(viewRows(0.5), 14);
  assert.equal(viewRows(0.1), 14);
  assert.equal(viewRows(0.75), 10);
});
