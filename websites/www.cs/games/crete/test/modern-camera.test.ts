// The modern look's camera maths: easing, clamping, panning, zooming, yaw choice and view height.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_YAW, MAX_PITCH, MIN_PITCH, START_PITCH, WALL_H, ZOOM_MIN, cameraDistance, clampTilt, clampView, clampZoom, easeCam, footprint, fromMini, groundAt, miniCell, nearestYaw, panCam, toMini, wholeZoom, zoomAbout, zoomLimits } from '../src/modern/camera.ts';
import type { Cam } from '../src/modern/camera.ts';

test('easeCam closes on the goal, reports motion, and settles exactly', () => {
  const cur: Cam = { yaw: 0, pitch: 45, tx: 0, tz: 0, zoom: 8 };
  const goal: Cam = { yaw: 90, pitch: 45, tx: 3, tz: -2, zoom: 12 };
  let frames = 0;
  while (easeCam(cur, goal, 1 / 60, false)) assert.ok(++frames < 600);
  assert.deepEqual(cur, goal);
  assert.equal(easeCam(cur, goal, 1 / 60, false), false);
});

test('easeCam snaps at once under reduced motion', () => {
  const cur: Cam = { yaw: 0, pitch: 45, tx: 0, tz: 0, zoom: 8 };
  assert.equal(easeCam(cur, { yaw: 45, pitch: 45, tx: 2, tz: 2, zoom: 6 }, 1 / 60, true), false);
  assert.deepEqual(cur, { yaw: 45, pitch: 45, tx: 2, tz: 2, zoom: 6 });
});

const ASPECT = 1.6;
/** The walls' room on screen at `pitch` (camera.ts). */
const walls = (pitch: number) => 2 * WALL_H * Math.cos((pitch * Math.PI) / 180);
/** A view 7.5 rows tall. */
const V = 7.5;
const gap = (a: number, b: number, eps = 1e-9): void => assert.ok(Math.abs(a - b) < eps, `${a} is not ${b}`);

test('clampView centres a level that fits the default view, wherever the target is', () => {
  const c = clampView({ yaw: 15, pitch: 45, tx: 3, tz: -3, zoom: V }, 7, 7, ASPECT);
  gap(c.tx, 0);
  gap(c.tz, 0);
  assert.equal(c.yaw, 15);
  assert.equal(c.zoom, V);
});

test('clampView centres a small level zoomed fully out, at any turn', () => {
  const lim = zoomLimits(ASPECT, 9, 6, 45);
  for (const yaw of [0, 15, 105, 195]) {
    const c = clampView({ yaw, pitch: 45, tx: 4, tz: 3, zoom: lim.max }, 9, 6, ASPECT);
    gap(c.tx, 0);
    gap(c.tz, 0);
  }
});

test('clampView centres only the axis the level fits on', () => {
  const c = clampView({ yaw: 0, pitch: 45, tx: 40, tz: 40, zoom: V }, 9, 30, ASPECT);
  gap(c.tx, 0);
  // 30 rows: the view (7.5 rows tall, 10.6 ground deep) may reach one cell past the north and south walls.
  gap(c.tz, 15 + 1 - 7.5 / 2 / Math.sin(Math.PI / 4));
});

test('clampView lets a big level follow the target inside its bounds and keeps the view within one cell of it', () => {
  const cam = { yaw: 0, pitch: 45, tx: 2, tz: -3, zoom: V };
  assert.deepEqual(clampView(cam, 30, 20, ASPECT), cam);
  const far = clampView({ ...cam, tx: -99, tz: 99 }, 30, 20, ASPECT);
  gap(far.tx, -(15 + 1 - (V * ASPECT) / 2));
  gap(far.tz, 10 + 1 - V / 2 / Math.sin(Math.PI / 4));
});

test('clampView gives the same result at yaw 15 and 195', () => {
  const a = clampView({ yaw: 15, pitch: 45, tx: 99, tz: 99, zoom: 8 }, 30, 20, ASPECT);
  const b = clampView({ yaw: 195, pitch: 45, tx: -99, tz: -99, zoom: 8 }, 30, 20, ASPECT);
  gap(a.tx, -b.tx);
  gap(a.tz, -b.tz);
});

test('panCam: the board follows the finger, with depth foreshortened by sin 45 degrees', () => {
  const r = panCam({ yaw: 0, pitch: 45, tx: 0, tz: 0, zoom: 8 }, 10, 0, 0.1);
  assert.ok(Math.abs(r.tx + 1) < 1e-9 && Math.abs(r.tz) < 1e-9, 'a rightward drag moves the target toward -x');
  const d = panCam({ yaw: 0, pitch: 45, tx: 0, tz: 0, zoom: 8 }, 0, 10, 0.1);
  assert.ok(Math.abs(d.tz + 1 / Math.sin(Math.PI / 4)) < 1e-9);
  const t = panCam({ yaw: 90, pitch: 45, tx: 0, tz: 0, zoom: 8 }, 10, 0, 0.1);
  assert.ok(Math.abs(t.tx) < 1e-9 && Math.abs(t.tz - 1) < 1e-9, 'the drag follows the turned view');
});

test('nearestYaw picks the equivalent angle closest to the current one', () => {
  assert.equal(nearestYaw(15, 370), 375);
  assert.equal(nearestYaw(15, -400), -345);
  assert.equal(nearestYaw(15, 20), 15);
});

const near = (a: number, b: number) => Math.abs(a - b) < 1e-9;

test('groundAt: the view centre is the target, screen-up runs along the board forward, foreshortened by sin 45 degrees', () => {
  const c: Cam = { yaw: 0, pitch: 45, tx: 1, tz: 2, zoom: 8 };
  assert.deepEqual(groundAt(c, 0, 0), { x: 1, z: 2 });
  const up = groundAt(c, 0, 1);
  assert.ok(near(up.x, 1) && near(up.z, 2 - Math.SQRT2), 'screen-up at yaw 0 is -z, one view unit is √2 of ground');
  const right = groundAt(c, 1, 0);
  assert.ok(near(right.x, 2) && near(right.z, 2), 'screen-right at yaw 0 is +x');
  const turned = groundAt({ yaw: 90, pitch: 45, tx: 0, tz: 0, zoom: 8 }, 1, 0);
  assert.ok(near(turned.x, 0) && near(turned.z, -1), 'at yaw 90 screen-right is -z');
});

test('groundAt agrees with panCam: dragging a ground point under the finger keeps it there', () => {
  const c: Cam = { yaw: 37, pitch: 45, tx: 0.5, tz: -1, zoom: 8 };
  const upp = 0.02;
  const p = groundAt(c, 3, 4);
  // The finger moves 50 px right and 30 px down; the point it held is now 50 px right of where it was on screen.
  const moved = panCam(c, 50, 30, upp);
  const q = groundAt(moved, 3 + 50 * upp, 4 - 30 * upp);
  assert.ok(near(p.x, q.x) && near(p.z, q.z));
});

test('footprint: the four screen corners on the ground, and a tick from the centre toward screen-up', () => {
  const f = footprint({ yaw: 0, pitch: 45, tx: 0, tz: 0, zoom: V }, 2);
  const hh = V / 2, hw = hh * 2, d = hh * Math.SQRT2;
  const want = [[-hw, -d], [hw, -d], [hw, d], [-hw, d]];
  f.corners.forEach((p, i) => assert.ok(near(p.x, want[i]![0]!) && near(p.z, want[i]![1]!), `corner ${i}`));
  assert.deepEqual(f.tick[0], { x: 0, z: 0 });
  assert.ok(near(f.tick[1].x, 0) && f.tick[1].z < 0, 'the tick points up the screen, which at yaw 0 is -z');
});

test('footprint grows and shrinks with the zoom', () => {
  const near1 = footprint({ yaw: 0, pitch: 45, tx: 0, tz: 0, zoom: 6 }, 1.5).corners[1]!;
  const far1 = footprint({ yaw: 0, pitch: 45, tx: 0, tz: 0, zoom: 12 }, 1.5).corners[1]!;
  assert.ok(near(far1.x, near1.x * 2) && near(far1.z, near1.z * 2));
});

test('zoomLimits: in to five rows, out to the whole level turned any way, however big', () => {
  assert.deepEqual(zoomLimits(1.6, 1, 1, 45), { min: ZOOM_MIN, max: ZOOM_MIN }, 'a tiny level stops at five rows');
  const big = zoomLimits(1.6, 60, 60, 45);
  assert.ok(near(big.max, Math.hypot(62, 62) * Math.SQRT1_2 + walls(45)), 'a huge level fits too');
  const mid = zoomLimits(1.6, 20, 12, 45);
  const d = Math.hypot(22, 14);
  assert.ok(near(mid.max, d * Math.SQRT1_2 + walls(45)), 'a middling level fits its diagonal with a cell round it, foreshortened');
  assert.ok(near(zoomLimits(0.46, 20, 12, 45).max, d / 0.46), 'a phone in portrait fits its width');
  assert.equal(clampZoom(2, mid), ZOOM_MIN);
  assert.equal(clampZoom(99, mid), mid.max);
  assert.equal(clampZoom(9, mid), 9);
});

test('wholeZoom shows the whole level and a cell round it, centred, within the zoom limits', () => {
  // Top-down, square to the board: level 1 (6 × 5) on a wide screen is as tall as its rows and margin, foreshortened.
  const top = wholeZoom(1.6, 6, 5, 75, 0);
  assert.ok(near(top, Math.max(ZOOM_MIN, 7 * Math.sin((75 * Math.PI) / 180) + walls(75), 8 / 1.6)));
  // A phone in portrait fits the width: 8 columns and the margin across 0.46 of the height.
  assert.ok(near(wholeZoom(0.46, 6, 5, 75, 0), 8 / 0.46));
  for (const [aspect, cols, rows, pitch, yaw] of [[1.6, 21, 13, 45, 15], [0.46, 40, 30, 75, 0], [1, 9, 6, 45, 105]] as const) {
    const z = wholeZoom(aspect, cols, rows, pitch, yaw);
    assert.ok(z <= zoomLimits(aspect, cols, rows, pitch).max + 1e-9, 'never past the zoom-out limit');
    const c = clampView({ yaw, pitch, tx: 5, tz: -4, zoom: z }, cols, rows, aspect);
    gap(c.tx, 0);
    gap(c.tz, 0);
    // Every corner of the level, and a cell beyond, is inside the view.
    const inside = (x: number, zz: number) => {
      // On the screen's own axes: across, and deep along the ground, foreshortened by sin(pitch).
      const y = (yaw * Math.PI) / 180;
      const across = x * Math.cos(y) - zz * Math.sin(y), deep = -x * Math.sin(y) - zz * Math.cos(y);
      return Math.abs(across) <= (z * aspect) / 2 + 1e-9 && Math.abs(deep) <= z / 2 / Math.sin((pitch * Math.PI) / 180) + 1e-9;
    };
    // The far wall's top, a wall's height above the far edge, shows too.
    assert.ok(z / 2 >= ((cols + 2) * Math.abs(Math.sin((yaw * Math.PI) / 180)) + (rows + 2) * Math.abs(Math.cos((yaw * Math.PI) / 180))) * Math.sin((pitch * Math.PI) / 180) / 2 + WALL_H * Math.cos((pitch * Math.PI) / 180) - 1e-9, 'wall tops fit');
    for (const [x, zz] of [[-cols / 2 - 1, -rows / 2 - 1], [cols / 2 + 1, -rows / 2 - 1], [cols / 2 + 1, rows / 2 + 1], [-cols / 2 - 1, rows / 2 + 1]] as const) {
      assert.ok(inside(x, zz), `${cols}×${rows} corner ${x},${zz}`);
    }
  }
});

test('zoomAbout keeps the floor point under the pointer where it was on screen', () => {
  const lim = { min: 5, max: 22 };
  const c: Cam = { yaw: 37, pitch: 45, tx: 0.5, tz: -1, zoom: 10 };
  const u = 0.3, v = -0.2;
  const before = groundAt(c, u * c.zoom, v * c.zoom);
  const z = zoomAbout(c, 0.8, u, v, lim);
  assert.ok(near(z.zoom, 8));
  const after = groundAt(z, u * z.zoom, v * z.zoom);
  assert.ok(near(before.x, after.x) && near(before.z, after.z));
  const centre = zoomAbout(c, 1.5, 0, 0, lim);
  assert.ok(near(centre.tx, c.tx) && near(centre.tz, c.tz) && near(centre.zoom, 15), 'about the centre the target stays');
  const clamped = zoomAbout(c, 0.1, u, v, lim);
  assert.equal(clamped.zoom, 5, 'within the limits');
  const held = groundAt(clamped, u * 5, v * 5);
  assert.ok(near(held.x, before.x) && near(held.z, before.z), 'and the point still holds at the limit');
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

test('straight down (Top-down) the ground is not foreshortened: a screen drag moves the ground as far up as across', () => {
  const top = { yaw: 0, pitch: 90, tx: 0, tz: 0, zoom: 10 };
  const up = panCam(top, 0, 100, 0.01);
  const across = panCam(top, 100, 0, 0.01);
  assert.ok(Math.abs(Math.abs(up.tz) - Math.abs(across.tx)) < 1e-9);
  const angled = panCam({ ...top, pitch: 45 }, 0, 100, 0.01);
  assert.ok(Math.abs(angled.tz) > Math.abs(up.tz), 'at 45° the same drag reaches farther along the ground');
  assert.ok(zoomLimits(1.6, 20, 12, 90).max >= zoomLimits(1.6, 20, 12, 45).max, 'the whole level needs at least as many rows from above');
});

test('the camera eases its pitch like its other values, and lands on it with reduced motion', () => {
  const cur = { yaw: 0, pitch: 45, tx: 0, tz: 0, zoom: 10 };
  const goal = { ...cur, pitch: 90 };
  assert.equal(easeCam(cur, goal, 1 / 60, false), true);
  assert.ok(cur.pitch > 45 && cur.pitch < 90);
  easeCam(cur, goal, 1 / 60, true);
  assert.equal(cur.pitch, 90);
});

test('the view starts at 75° and north up; the tilt stays between 10° and straight down', () => {
  assert.equal(DEFAULT_YAW, 0);
  assert.equal(START_PITCH, 75);
  assert.equal(MIN_PITCH, 10);
  assert.equal(MAX_PITCH, 90);
  assert.equal(clampTilt(30), 30);
  assert.equal(clampTilt(5), 10);
  assert.equal(clampTilt(60), 60);
  assert.equal(clampTilt(85), 85);
  assert.equal(clampTilt(120), 90);
});

test('tilted low, the camera stands back far enough that the bottom of the view still starts above the ground', () => {
  for (const pitch of [75, 45, 20, 10]) {
    for (const zoom of [5, 12, 40]) {
      const p = (pitch * Math.PI) / 180, D = cameraDistance(pitch, zoom);
      assert.ok(D * Math.sin(p) - (zoom / 2) * Math.cos(p) > 0, `${pitch}° at zoom ${zoom}`);
      assert.ok(D >= 40);
    }
  }
  assert.equal(cameraDistance(75, 10), 40, 'steep, it keeps its usual distance');
});
