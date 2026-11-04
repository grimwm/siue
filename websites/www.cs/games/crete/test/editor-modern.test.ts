// The level editor's Modern look, DOM-free: the cell under a pointer (a ray through it meets the floor), checked
// against three.js's own camera, and which pointers paint and which move the camera.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { OrthographicCamera, Vector3 } from 'three';
import { cameraDistance, cellUnder } from '../src/modern/camera.ts';
import type { Cam } from '../src/modern/camera.ts';
import { createPaintRouter } from '../src/modern/paint-route.ts';
import type { Route } from '../src/modern/paint-route.ts';
import type { Ptr } from '../src/modern/gestures.ts';
import { FY, cellX, cellZ } from '../src/modern/scene/floor.ts';

/** The modern board's camera for `c` on a canvas of `aspect`, as board3d.ts's applyCamera sets it. */
function camera(c: Cam, aspect: number): OrthographicCamera {
  const RAD = Math.PI / 180, y = c.yaw * RAD, p = c.pitch * RAD, hh = c.zoom / 2, D = cameraDistance(c.pitch, c.zoom);
  const cam = new OrthographicCamera(-hh * aspect, hh * aspect, hh, -hh, 0.1, D + 160);
  cam.position.set(c.tx + Math.sin(y) * Math.cos(p) * D, FY + Math.sin(p) * D, c.tz + Math.cos(y) * Math.cos(p) * D);
  cam.up.set(-Math.sin(y), 0, -Math.cos(y));
  cam.lookAt(c.tx, FY, c.tz);
  cam.updateProjectionMatrix();
  cam.updateMatrixWorld();
  return cam;
}

test('cellUnder: the cell whose floor three.js draws under a point is the cell found there, turned, tilted, panned and zoomed', () => {
  const cols = 9, rows = 7;
  const cams: Cam[] = [
    { yaw: 0, pitch: 75, tx: 0, tz: 0, zoom: 9 },
    { yaw: 0, pitch: 90, tx: 0, tz: 0, zoom: 8 },
    { yaw: 37, pitch: 45, tx: 1.2, tz: -0.7, zoom: 6 },
    { yaw: -140, pitch: 20, tx: -2, tz: 1, zoom: 12 },
    { yaw: 271, pitch: 10, tx: 0.3, tz: 0.3, zoom: 5 },
  ];
  const v = new Vector3();
  let checked = 0;
  for (const c of cams) {
    for (const aspect of [390 / 600, 1.6]) {
      const cam = camera(c, aspect);
      for (let r = 0; r < rows; r++) {
        for (let col = 0; col < cols; col++) {
          // A point a little off the cell's centre, still inside it.
          v.set(cellX(col, cols) + 0.3, FY, cellZ(r, rows) - 0.2).project(cam);
          if (Math.abs(v.x) > 1 || Math.abs(v.y) > 1) continue;
          assert.deepEqual(cellUnder(c, aspect, v.x / 2, v.y / 2, cols, rows), { r, c: col }, `yaw ${c.yaw} pitch ${c.pitch} cell ${r},${col}`);
          checked++;
        }
      }
    }
  }
  assert.ok(checked > 100, `only ${checked} cells were on screen`);
});

test('cellUnder: the opening view, north up, finds the corners, and null past the board\'s edge', () => {
  const c: Cam = { yaw: 0, pitch: 90, tx: 0, tz: 0, zoom: 4 };
  // Straight down on a 4 x 4 board four rows high on a square canvas: each cell is a quarter of the canvas.
  assert.deepEqual(cellUnder(c, 1, -0.4, 0.4, 4, 4), { r: 0, c: 0 }, 'top-left is north-west');
  assert.deepEqual(cellUnder(c, 1, 0.4, -0.4, 4, 4), { r: 3, c: 3 }, 'bottom-right is south-east');
  assert.equal(cellUnder({ ...c, zoom: 8 }, 1, 0.4, 0, 4, 4), null, 'off the east edge');
  assert.equal(cellUnder({ ...c, zoom: 8 }, 1, 0, 0.4, 4, 4), null, 'off the north edge');
});

const p = (id: number, x: number, y: number, type: Ptr['type'] = 'touch', button = 0): Ptr => ({ id, x, y, type, button });
const kinds = (rs: Route[]) => rs.map(r => (r.kind === 'cam' ? `cam-${r.op}` : r.kind));

test('one finger paints: its press starts the stroke, its moves carry it on and its lift ends it', () => {
  const r = createPaintRouter();
  assert.deepEqual(r.down(p(1, 10, 10)), [{ kind: 'paint', x: 10, y: 10, first: true }]);
  assert.deepEqual(r.move(p(1, 20, 12)), [{ kind: 'paint', x: 20, y: 12, first: false }]);
  assert.deepEqual(kinds(r.up(p(1, 20, 12))), ['end']);
  assert.deepEqual(kinds(r.down(p(2, 5, 5))), ['paint'], 'the next finger paints again');
});

test('a second finger drops the stroke and both fingers move the camera until every finger is up', () => {
  const r = createPaintRouter();
  r.down(p(1, 10, 10));
  r.move(p(1, 14, 10));
  const second = r.down(p(2, 60, 60));
  assert.deepEqual(kinds(second), ['drop', 'cam-down', 'cam-down']);
  const firstDown = second[1] as Extract<Route, { kind: 'cam' }>;
  assert.equal(firstDown.p.id, 1);
  assert.equal(firstDown.p.x, 14, 'the painting finger joins the camera where it has got to');
  assert.deepEqual(kinds(r.move(p(1, 18, 10))), ['cam-move']);
  assert.deepEqual(kinds(r.move(p(2, 64, 60))), ['cam-move']);
  assert.deepEqual(kinds(r.up(p(2, 64, 60))), ['cam-up']);
  assert.deepEqual(kinds(r.move(p(1, 30, 10))), ['cam-move'], 'the finger left behind never starts painting');
  assert.deepEqual(kinds(r.down(p(3, 50, 50))), ['cam-down'], 'a finger landing while one is still on the camera joins it');
  r.up(p(1, 30, 10));
  r.up(p(3, 50, 50));
  assert.deepEqual(kinds(r.down(p(4, 5, 5))), ['paint'], 'all up: one finger paints again');
});

test('the left button paints and hovers between presses; the right turns and tilts, the middle pans', () => {
  const r = createPaintRouter();
  assert.deepEqual(r.move(p(1, 3, 4, 'mouse')), [{ kind: 'hover', x: 3, y: 4 }]);
  assert.deepEqual(kinds(r.down(p(1, 3, 4, 'mouse', 0))), ['paint']);
  assert.deepEqual(kinds(r.up(p(1, 3, 4, 'mouse', 0))), ['end']);
  const right = r.down(p(1, 3, 4, 'mouse', 2));
  assert.deepEqual(kinds(right), ['cam-down']);
  assert.equal((right[0] as Extract<Route, { kind: 'cam' }>).p.button, 0, 'the right button drags as the left one does in play');
  r.up(p(1, 3, 4, 'mouse', 2));
  const middle = r.down(p(1, 3, 4, 'mouse', 1));
  assert.equal((middle[0] as Extract<Route, { kind: 'cam' }>).p.button, 1, 'the middle button pans');
});

test('a cancelled stroke ends as a lift does; a touch moving with nothing down does nothing', () => {
  const r = createPaintRouter();
  assert.deepEqual(r.move(p(1, 3, 4)), []);
  r.down(p(1, 3, 4, 'pen'));
  assert.deepEqual(kinds(r.cancel(1)), ['end']);
  assert.deepEqual(r.cancel(1), []);
});
