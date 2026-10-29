// The modern look's camera maths: easing, clamping, panning, yaw choice and view height.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clampCam, easeCam, footprint, fromMini, groundAt, miniCell, nearestYaw, panCam, toMini, viewRows } from '../src/modern/camera.ts';
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

const near = (a: number, b: number) => Math.abs(a - b) < 1e-9;

test('groundAt: the view centre is the target, screen-up runs along the board forward, foreshortened by sin 45 degrees', () => {
  const c: Cam = { yaw: 0, tx: 1, tz: 2 };
  assert.deepEqual(groundAt(c, 0, 0), { x: 1, z: 2 });
  const up = groundAt(c, 0, 1);
  assert.ok(near(up.x, 1) && near(up.z, 2 - Math.SQRT2), 'screen-up at yaw 0 is -z, one view unit is √2 of ground');
  const right = groundAt(c, 1, 0);
  assert.ok(near(right.x, 2) && near(right.z, 2), 'screen-right at yaw 0 is +x');
  const turned = groundAt({ yaw: 90, tx: 0, tz: 0 }, 1, 0);
  assert.ok(near(turned.x, 0) && near(turned.z, -1), 'at yaw 90 screen-right is -z');
});

test('groundAt agrees with panCam: dragging a ground point under the finger keeps it there', () => {
  const c: Cam = { yaw: 37, tx: 0.5, tz: -1 };
  const upp = 0.02;
  const p = groundAt(c, 3, 4);
  // The finger moves 50 px right and 30 px down; the point it held is now 50 px right of where it was on screen.
  const moved = panCam(c, 50, 30, upp);
  const q = groundAt(moved, 3 + 50 * upp, 4 - 30 * upp);
  assert.ok(near(p.x, q.x) && near(p.z, q.z));
});

test('footprint: the four screen corners on the ground, and a tick from the centre toward screen-up', () => {
  const f = footprint({ yaw: 0, tx: 0, tz: 0 }, 2);
  const hh = viewRows(2) / 2, hw = hh * 2, d = hh * Math.SQRT2;
  const want = [[-hw, -d], [hw, -d], [hw, d], [-hw, d]];
  f.corners.forEach((p, i) => assert.ok(near(p.x, want[i]![0]!) && near(p.z, want[i]![1]!), `corner ${i}`));
  assert.deepEqual(f.tick[0], { x: 0, z: 0 });
  assert.ok(near(f.tick[1].x, 0) && f.tick[1].z < 0, 'the tick points up the screen, which at yaw 0 is -z');
});

test('toMini and fromMini: cell centres land on mini-map cell centres below the rise, and back', () => {
  // A 5 × 3 board with 11 px cells and a 4 px rise: cell (r 1, c 2) is the board centre, at x 0, z 0.
  assert.deepEqual(toMini({ x: 0, z: 0 }, 5, 3, 11, 4), [27.5, 4 + 16.5]);
  assert.deepEqual(toMini({ x: -2, z: -1 }, 5, 3, 11, 4), [5.5, 4 + 5.5], 'the top-left cell');
  const back = fromMini(5.5, 9.5, 5, 3, 11, 4);
  assert.ok(near(back.x, -2) && near(back.z, -1));
  const p = { x: 1.3, z: -0.7 };
  const [px, py] = toMini(p, 9, 7, 8, 3);
  const q = fromMini(px, py, 9, 7, 8, 3);
  assert.ok(near(q.x, p.x) && near(q.z, p.z));
});

test('miniCell: 11 px cells, 8 under 520 px wide, smaller still when a big level would fill the corner', () => {
  assert.equal(miniCell(1280, 800, 12, 12), 11);
  assert.equal(miniCell(519, 800, 12, 12), 8);
  assert.equal(miniCell(390, 700, 12, 12), 8);
  // 40 columns at 8 px is 320 px, most of a 390 px board: shrink to fit under half its width.
  assert.equal(miniCell(390, 700, 40, 12), 4);
  assert.equal(miniCell(1280, 400, 12, 40), 4, 'and under 40% of its height');
  assert.equal(miniCell(100, 100, 200, 200), 2, 'never under 2 px');
});
