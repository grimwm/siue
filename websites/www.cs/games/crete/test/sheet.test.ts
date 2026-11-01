import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  AWAY, FOLLOW_CELLS, createSheetView, extent, faceQuarter, headroom, keepInView, panned, project, sheetCell, sheetTransform, unproject, wholeFrame,
} from '../src/sheet.ts';
import type { Frame } from '../src/sheet.ts';
import { DEFAULT_YAW, START_PITCH } from '../src/modern/camera.ts';
import { readFileSync } from 'node:fs';
import type { Atlas } from '../src/board-plan.ts';
import { CHAPTERS, levelById } from '../src/campaign/chapters.ts';

const atlas = JSON.parse(readFileSync(new URL('../fx/sprites/tiles.json', import.meta.url), 'utf8')) as Atlas;
const RISE = atlas.rise / atlas.cell;

const near = (a: number, b: number, eps = 1e-6) => assert.ok(Math.abs(a - b) < eps, `${a} ≈ ${b}`);
const frame = (over: Partial<Frame> = {}): Frame => ({ yaw: 0, pitch: 90, tx: 100, ty: 50, ox: 0, oy: 0, k: 1, d: 1000, vw: 400, vh: 300, ...over });

test('straight down and north up, the sheet is the flat board moved to the view', () => {
  const p = project(frame(), 130, 70);
  near(p.x, 200 + 30);
  near(p.y, 150 + 20);
});

test('a turn of 90° puts the board north on the screen to the right, and west away', () => {
  const f = frame({ yaw: 90 });
  const north = project(f, 100, 0); // 50 px north of the target
  near(north.x, 200 + 50);
  near(north.y, 150);
  const west = project(f, 50, 50);
  near(west.x, 200);
  near(west.y, 150 - 50);
  assert.deepEqual(AWAY[faceQuarter(90)], { x: -1, y: 0 });
});

test('tilted, the far side shrinks toward the horizon and the near side grows', () => {
  const f = frame({ pitch: 45 });
  const far = project(f, 100, 0), nearPt = project(f, 100, 100);
  assert.ok(150 - far.y < nearPt.y - 150, 'the far half is shorter on screen than the near half');
  assert.ok(far.y > 150 - 50, 'the far edge is foreshortened');
});

test('unproject undoes project at every heading and tilt', () => {
  for (const yaw of [0, 33, 90, 180, 271, -45]) {
    for (const pitch of [90, 75, 60, 45]) {
      const f = frame({ yaw, pitch, ox: 7, oy: -3, k: 1.2 });
      for (const [x, y] of [[0, 0], [100, 50], [220, 10], [37, 140]] as const) {
        const p = project(f, x, y);
        const g = unproject(f, p.x, p.y)!;
        near(g.x, x, 1e-6);
        near(g.y, y, 1e-6);
      }
    }
  }
});

test('the CSS transform names the same lens, tilt, turn and offsets', () => {
  const t = sheetTransform(frame({ yaw: 30, pitch: 60, ox: 5, k: 1.5 }), 9);
  assert.equal(t, 'translate(205.000px, 150.000px) scale(1.500) perspective(1000.000px) rotateX(30.000deg) rotateZ(30.000deg) translate(-109.000px, -59.000px)');
});

test('the whole-level frame fills the view and centres the board, figures\' headroom included', () => {
  for (const yaw of [0, 45, 90, 200]) {
    for (const pitch of [90, 75, 45]) {
      const f = wholeFrame({ yaw, pitch }, 20, 13, 16, RISE, 390, 600);
      const e = extent(f, 20, 13, 16, RISE);
      const w = e.right - e.left, h = e.bottom - e.top;
      assert.ok(w <= 390 + 1e-6 && h <= 600 + 1e-6, `fits at ${yaw}/${pitch}`);
      assert.ok(Math.abs(w - 390) < 1e-6 || Math.abs(h - 600) < 1e-6, `fills one side at ${yaw}/${pitch}`);
      near((e.left + e.right) / 2, 195, 1e-6);
      near((e.top + e.bottom) / 2, 300, 1e-6);
    }
  }
});

test('the whole-level cell is the largest that fits unscaled, and tilting a tall level lets it grow', () => {
  const v = { yaw: 0, pitch: 75 };
  const cell = sheetCell(v, 20, 13, RISE, 390, 600);
  const f = wholeFrame(v, 20, 13, cell, RISE, 390, 600);
  assert.ok(f.k >= 1, 'it fits unscaled');
  assert.ok(wholeFrame(v, 20, 13, cell + 1, RISE, 390, 600).k < 1, 'a cell more would not');
  // A tall level on a wide screen: foreshortened, its rows take less height, so its cell grows as it tilts.
  assert.ok(sheetCell({ yaw: 0, pitch: 45 }, 8, 20, RISE, 800, 400) > sheetCell({ yaw: 0, pitch: 90 }, 8, 20, RISE, 800, 400));
});

test('the figures\' headroom: the walls\' rise looking straight down, more as the view leans and their feet come down', () => {
  near(headroom(90, RISE), RISE);
  assert.ok(headroom(75, RISE) > RISE && headroom(75, RISE) < headroom(45, RISE));
  assert.ok(headroom(45, RISE) < 1);
});

/** The board's free space (its content box) on portrait phones, as the layout gives it with a level open. */
const PHONES: [name: string, w: number, h: number][] = [['360 x 740', 348, 493], ['390 x 844', 378, 597], ['320 x 568', 308, 321]];

test('every Chapter 1 and 2 level shows whole at the opening view on a portrait phone, at 15 px a cell or more', () => {
  const ids = CHAPTERS.filter((c) => c.n <= 2).flatMap((c) => c.levelIds);
  assert.equal(ids.length, 20);
  for (const [name, w, h] of PHONES) {
    for (const id of ids) {
      const level = levelById(id);
      const cell = sheetCell({ yaw: DEFAULT_YAW, pitch: START_PITCH }, level.cols, level.rows, RISE, w, h);
      const e = extent(wholeFrame({ yaw: DEFAULT_YAW, pitch: START_PITCH }, level.cols, level.rows, cell, RISE, w, h), level.cols, level.rows, cell, RISE);
      assert.ok(e.left >= -1e-6 && e.top >= -1e-6 && e.right <= w + 1e-6 && e.bottom <= h + 1e-6, `${id} on ${name}: cut off`);
      assert.ok(cell >= 15, `${id} on ${name}: ${cell} px cells`);
    }
  }
  // The biggest of them (20 x 13, Chapter 1 and 2's last levels) on 360 x 740.
  assert.equal(sheetCell({ yaw: DEFAULT_YAW, pitch: START_PITCH }, 20, 13, RISE, 348, 493), 16);
});

test('a drag pans the ground with the finger, whatever the heading', () => {
  for (const yaw of [0, 90, 135]) {
    const f = frame({ yaw, pitch: 70, tx: 160, ty: 100 });
    // Exactly into the view's middle; elsewhere as nearly as the lens allows.
    const mid = unproject(f, 185, 160)!, off = unproject(f, 230, 120)!;
    const after = panned(f, 15, -10, 20, 13, 16);
    const p = project(after, mid.x, mid.y), q = project(after, off.x, off.y);
    near(p.x, 200, 1e-6);
    near(p.y, 150, 1e-6);
    near(q.x, 245, 1);
    near(q.y, 110, 1);
  }
});

test('a pan stops at the board\'s edge', () => {
  const f = panned(frame({ tx: 5, ty: 5 }), 300, 300, 20, 13, 16);
  assert.equal(f.tx, 0);
  assert.equal(f.ty, 0);
});

test('following keeps Theseus two cells inside the view', () => {
  const cell = 32;
  const f = frame({ yaw: 60, pitch: 60, tx: 320, ty: 200, d: 3.5 * 20 * cell });
  const kept = keepInView(f, 20 * cell - cell / 2, 13 * cell - cell / 2, 20, 13, cell);
  const p = project(kept, 20 * cell - cell / 2, 13 * cell - cell / 2);
  const m = FOLLOW_CELLS * cell;
  assert.ok(p.x >= m - 1 && p.x <= 400 - m + 1 && p.y >= m - 1 && p.y <= 300 - m + 1, `${p.x}, ${p.y}`);
});

test('the view opens at 75° and north up, eases where it is sent, and home finds the nearest north', () => {
  const v = createSheetView();
  assert.deepEqual(v.cur, { yaw: DEFAULT_YAW, pitch: START_PITCH });
  v.turn(90, true);
  assert.equal(v.cur.yaw, 0);
  let moving = true;
  for (let i = 0; i < 200 && moving; i++) moving = v.step(1 / 60, false);
  assert.equal(v.cur.yaw, 90);
  v.tilt(-100, false);
  assert.equal(v.cur.pitch, 45, 'held at 45°');
  v.set(350, 80);
  v.home(false);
  assert.deepEqual(v.cur, { yaw: 360, pitch: START_PITCH });
});

test('a wall faces the viewer: the quarter nearest the heading', () => {
  assert.equal(faceQuarter(0), 0);
  assert.equal(faceQuarter(44), 0);
  assert.equal(faceQuarter(46), 1);
  assert.equal(faceQuarter(180), 2);
  assert.equal(faceQuarter(-90), 3);
  assert.equal(faceQuarter(450), 1);
});
