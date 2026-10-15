// games/tankity/test/camera.test.ts
// Where the battlefield camera looks (src/camera.ts): the live units framed,
// a volley's whole arc pulled into view up to the zoom floor with the ground
// kept on screen, and an ease that never drops a unit out of frame.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { H, airOf, flightTop } from '../src/sim.ts';
import {
  UNIT_FLOOR, ZOOM_FLOOR, SKY_PAD, cameraTarget, cloudWrap, easeCamera, skyMarks, stepHold, viewEdges, volleyTop,
} from '../src/camera.ts';
import type { Aloft, CamPose, SkyMark } from '../src/camera.ts';

const W = 1080;
const flat = [{ y: 330 }, { y: 340 }, { y: 320 }];
// a may be a volley top of null, which reads as 0 here as it always did.
const near = (a: number | null, b: number, eps = 1e-6) => Math.abs(Number(a) - b) <= eps;
/* A shell with no x: volleyTop reads x only when it is handed a Reach. */
const aloft = (s: Omit<Aloft, 'x'>) => s as Aloft;
/* The top of an arc in airless flight under g = 95: the caller's apex in most of these tests, so their numbers read plainly. */
const vacuum = (s: Aloft): number => (s.vy < 0 ? s.y - s.vy * s.vy / 190 : s.y);

test('with no volley the units are framed as before: level ground stays at full size', () => {
  const t = cameraTarget(W, H, flat, null);
  assert.equal(t.z, 1);
  assert.equal(t.cx, W / 2);
  const { bottom } = viewEdges(t, H);
  assert.ok(bottom <= H + 8, 'the ground stays pinned to the floor');
});

test('a tall spread of units alone pulls back no further than the unit floor', () => {
  const t = cameraTarget(W, H, [{ y: 60 }, { y: 450 }], null);
  assert.ok(t.z >= UNIT_FLOOR - 1e-9);
  assert.ok(t.z < 1);
});

test('no units: the whole field, its floor at the bottom', () => {
  const t = cameraTarget(W, H, [], null);
  assert.equal(t.z, 1);
  assert.equal(t.cx, W / 2);
  assert.equal(viewEdges(t, H).bottom, H + 8);
});

test('the bottom edge sits on the field floor, never above the deepest ground, units high or low, volley or not', () => {
  const highs = [[{ y: 150 }, { y: 170 }], [{ y: 250 }, { y: 260 }, { y: 280 }], [{ y: 150 }, { y: 280 }], flat, [{ y: 440 }]];
  for (const units of highs) {
    for (const sky of [null, 400, 100, -50, -300, -900, -5000]) {
      for (const extra of [0, 400]) {
        const t = cameraTarget(W, H, units, sky, extra);
        const { top, bottom } = viewEdges(t, H);
        assert.ok(near(bottom, H + 8, 1e-9), `units ${units.map(u => u.y)} sky ${sky}: bottom ${bottom}`);
        for (const u of units) assert.ok(u.y - 56 >= top - 1e-9, `unit ${u.y} under the top`);
      }
    }
  }
});

test('a volley top below the units changes nothing', () => {
  assert.deepEqual(cameraTarget(W, H, flat, 300), cameraTarget(W, H, flat, null));
});

test('a high volley pulls back so the top of the arc and every unit are in view', () => {
  for (const sky of [-50, -200, -400, -600]) {
    const t = cameraTarget(W, H, flat, sky);
    const { top, bottom } = viewEdges(t, H);
    assert.ok(t.z < 1 && t.z >= ZOOM_FLOOR - 1e-9, `z ${t.z}`);
    assert.ok(top <= sky - SKY_PAD + 1e-6, `sky ${sky}: top ${top} shows the arc`);
    for (const u of flat) assert.ok(u.y - 56 >= top && u.y <= bottom, `sky ${sky}: unit at ${u.y} in view`);
    assert.ok(bottom <= H + 8 + 1e-9, 'no void under the ground');
    assert.equal(t.cx, W / 2, 'always centred across');
  }
});

test('the higher the arc, the further back, never past the floor', () => {
  let last = 2;
  for (let sky = 100; sky >= -3000; sky -= 100) {
    const z = cameraTarget(W, H, flat, sky).z;
    assert.ok(z <= last + 1e-12, `monotone at ${sky}`);
    assert.ok(z >= ZOOM_FLOOR - 1e-12);
    last = z;
  }
  assert.equal(cameraTarget(W, H, flat, -3000).z, ZOOM_FLOOR);
});

test('past the floor the ground stays anchored: units in view, the sky gives', () => {
  const units = [{ y: 330 }, { y: 200 }];
  const t = cameraTarget(W, H, units, -5000);
  const { top, bottom } = viewEdges(t, H);
  assert.equal(t.z, ZOOM_FLOOR);
  for (const u of units) assert.ok(u.y - 56 >= top && u.y <= bottom);
  assert.ok(top > -5000, 'the shell is above the view: the marker shows it');
});

test('a tall canvas spends its own sky first: less pull-back, and the arc still fits', () => {
  for (const sky of [-100, -300, -700]) {
    const plain = cameraTarget(W, H, flat, sky), tall = cameraTarget(W, H, flat, sky, 400);
    assert.ok(tall.z >= plain.z, `sky ${sky}`);
    const canvasTop = tall.cy - (H / 2 + 400) / tall.z;
    if (tall.z > ZOOM_FLOOR) assert.ok(canvasTop <= sky - SKY_PAD + 1e-6, `sky ${sky}: arc on the tall canvas`);
    const { top, bottom } = viewEdges(tall, H);
    for (const u of flat) assert.ok(u.y - 56 >= top && u.y <= bottom);
  }
  assert.equal(cameraTarget(W, H, flat, -100, 600).z, 1, 'a short lob needs no zoom on a portrait screen');
});

test('flightTop flies a rising shell to the top of its arc through the air; a falling one is where it is', () => {
  const ground = new Array<number>(720).fill(330);
  const calm = airOf(720, 0, { drag: 1 });
  const top = flightTop({ x: 100, y: 300, vx: 0, vy: -190 }, calm);
  assert.ok(top > 300 - 190 * 190 / 190, `drag holds the climb under the airless apex: ${top}`);
  assert.ok(top < 300 - 100, `but it still climbs: ${top}`);
  assert.ok(flightTop({ x: 100, y: 300, vx: 0, vy: -190 }, airOf(720, 0, { drag: 0.4 })) < top, 'a slicker gun climbs higher');
  assert.equal(flightTop({ x: 100, y: 120, vx: 50, vy: 40 }, calm), 120);
  assert.equal(flightTop({ x: 100, y: 120, vx: 50, vy: 0 }, calm), 120);
});

test('volleyTop ratchets up while shells fly and clears once the volley has landed', () => {
  const g = vacuum;
  let top = volleyTop(null, [[]], g);
  assert.equal(top, null);
  top = volleyTop(top, [[aloft({ y: 300, vy: -100, wkey: 'shell' })]], g);
  assert.ok(near(top, 300 - 100 * 100 / 190));
  const peak = top;
  top = volleyTop(top, [[aloft({ y: 260, vy: 30, wkey: 'shell' })]], g); // past the apex, falling
  assert.equal(top, peak, 'the framing holds while the volley flies');
  top = volleyTop(top, [[aloft({ y: 400, vy: -300, wkey: 'shell' }), aloft({ y: 100, vy: 0, wkey: 'shell' })]], g);
  assert.ok(near(top, 400 - 300 * 300 / 190));
  assert.equal(volleyTop(top, [[], []], g), null, 'landed: back to the units');
  assert.equal(volleyTop(top, [[], [aloft({ y: 500, vy: -10, wkey: 'shell' })]], g), top, 'a shell flying on past the edge holds it while it climbs');
});

test('volleyTop: a shell past the edge holds only while it climbs within the floor\'s reach; a roller on the ground never', () => {
  const g = vacuum, reach = 2000;
  const top = volleyTop(null, [[{ x: 500, y: 300, vy: -100, wkey: 'shell' }]], g, { w: W, reach });
  assert.notEqual(top, null);
  // Live shells landed; a ghost falls on past the edge: the hold ends.
  assert.equal(volleyTop(top, [[], [{ x: W + 30, y: 200, vy: 50, wkey: 'shell' }]], g, { w: W, reach }), null);
  // A ghost still climbing within reach keeps it.
  assert.equal(volleyTop(top, [[], [{ x: W + 30, y: 200, vy: -50, wkey: 'shell' }]], g, { w: W, reach }) !== null, true);
  // A climbing ghost the floor view cannot reach sideways does not.
  assert.equal(volleyTop(top, [[], [{ x: W / 2 + reach + 1, y: 200, vy: -50, wkey: 'shell' }]], g, { w: W, reach }), null);
  // A roller on the ground lets the camera come home.
  assert.equal(volleyTop(top, [[{ x: 400, y: 330, vy: -2, wkey: 'roller', rolling: true }], []], g, { w: W, reach }), null);
  // So does a digger burrowing under it: the ground it cuts is in view already.
  assert.equal(volleyTop(top, [[{ x: 400, y: 420, vy: 200, wkey: 'digger', digging: true }], []], g, { w: W, reach }), null);
  // A live shell still in the air holds as before.
  assert.notEqual(volleyTop(top, [[{ x: 400, y: 330, vy: 20, wkey: 'shell' }], []], g, { w: W, reach }), null);
});

test('volleyTop asks the caller for each shell\'s top (each gun flies its own air)', () => {
  const top = volleyTop(null, [[aloft({ y: 300, vy: -90, wkey: 'slow' })]], s => (s.wkey === 'slow' ? 200 : 0));
  assert.equal(top, 200);
});

test('easeCamera reaches the target and stays there', () => {
  const cam = { z: 1, cx: W / 2, cy: H / 2 };
  const target = cameraTarget(W, H, flat, -500);
  for (let i = 0; i < 600; i++) easeCamera(cam, target, 1 / 60, false, H);
  assert.ok(near(cam.z, target.z, 1e-4) && near(cam.cy, target.cy, 0.05));
  const back = cameraTarget(W, H, flat, null);
  for (let i = 0; i < 900; i++) easeCamera(cam, back, 1 / 60, false, H);
  assert.ok(near(cam.z, back.z, 1e-4) && near(cam.cy, back.cy, 0.05));
});

test('easing out and back in keeps every unit in frame on every frame', () => {
  for (const reduced of [false, true]) {
    for (const units of [flat, [{ y: 120 }, { y: 440 }], [{ y: 420 }]]) {
      const cam = { ...cameraTarget(W, H, units, null) };
      const check = (label: string) => {
        const { top, bottom } = viewEdges(cam, H);
        for (const u of units) assert.ok(u.y - 56 >= top - 1e-6 && u.y <= bottom + 1e-6, `${label}: unit ${u.y} in [${top}, ${bottom}]`);
        assert.ok(bottom <= H + 8 + 1e-6, `${label}: ground pinned`);
      };
      const out = cameraTarget(W, H, units, -2000);
      for (let i = 0; i < 240; i++) { easeCamera(cam, out, 1 / 60, reduced, H); check('out ' + i); }
      const home = cameraTarget(W, H, units, null);
      for (let i = 0; i < 400; i++) { easeCamera(cam, home, 1 / 60, reduced, H); check('in ' + i); }
    }
  }
});

test('easing is smooth: no frame moves the view edges further than the last on a steady target', () => {
  const cam = { z: 1, cx: W / 2, cy: H / 2 };
  const target = cameraTarget(W, H, flat, -900);
  let lastStep = Infinity;
  let prev = viewEdges(cam, H).top;
  for (let i = 0; i < 300; i++) {
    easeCamera(cam, target, 1 / 60, false, H);
    const top = viewEdges(cam, H).top;
    const step = Math.abs(top - prev);
    assert.ok(step <= lastStep + 1e-9, `frame ${i} no jerk`);
    lastStep = step; prev = top;
  }
});

test('pulling back is quicker than coming home, and reduced motion is gentler both ways', () => {
  const run = (from: CamPose, to: CamPose, reduced: boolean) => {
    const cam = { ...from };
    easeCamera(cam, to, 1 / 60, reduced, H);
    return Math.abs(cam.z - from.z) / Math.abs(to.z - from.z);
  };
  const home = cameraTarget(W, H, flat, null), far = cameraTarget(W, H, flat, -900);
  assert.ok(run(home, far, false) > run(far, home, false));
  assert.ok(run(home, far, true) < run(home, far, false));
  assert.ok(run(far, home, true) < run(far, home, false));
});

test('a long frame never overshoots', () => {
  const cam = { z: 1, cx: W / 2, cy: H / 2 };
  const target = cameraTarget(W, H, flat, -900);
  easeCamera(cam, target, 5, false, H);
  assert.ok(cam.z >= target.z - 1e-9);
});

test('skyMarks: a shell above the view gets a mark at its x on the top edge, else none', () => {
  const cam = cameraTarget(W, H, flat, -5000);
  const { top } = viewEdges(cam, H);
  const marks: SkyMark[] = [];
  skyMarks([[{ x: 300, y: top - 200 }], [{ x: 500, y: top + 50 }]], top, marks);
  assert.equal(marks.length, 1);
  const mark = marks[0];
  assert.ok(mark, 'a mark');
  assert.equal(mark.x, 300);
  assert.ok(near(mark.above, 200, 1e-9));
  skyMarks([[], []], top, marks);
  assert.equal(marks.length, 0, 'the list is reused, not reallocated');
});

test('stepHold rides out the one frame a climbing shell hands over to its ghost, then lets go', () => {
  const g = vacuum, at = { w: W, reach: 2000 };
  const hold = { top: null, empty: 0 };
  stepHold(hold, [[{ x: W - 5, y: 100, vy: -200, wkey: 'shell' }], []], g, at);
  const top = hold.top;
  assert.notEqual(top, null);
  stepHold(hold, [[], []], g, at); // retired by the sim; its ghost shows up next frame
  assert.equal(hold.top, top, 'held through the hand-off');
  stepHold(hold, [[], [{ x: W + 25, y: 90, vy: -195, wkey: 'shell' }]], g, at);
  assert.equal(hold.top, top);
  stepHold(hold, [[], []], g, at);
  stepHold(hold, [[], []], g, at);
  assert.equal(hold.top, null, 'two empty frames: the volley is over');
});

test('a shell lying on the ground (a room replay\'s roller) holds nothing', () => {
  const g = vacuum;
  const ground = (x: number) => 330 + x * 0;
  const at = { w: W, reach: 2000, ground };
  assert.equal(volleyTop(-200, [[{ x: 400, y: 327, vy: -1, wkey: 'roller' }]], g, at), null);
  assert.notEqual(volleyTop(-200, [[{ x: 400, y: 300, vy: 40, wkey: 'shell' }]], g, at), null, 'still in the air: held');
});

test('cameraTarget can write into a pose it is handed (no allocation per frame)', () => {
  const out = { z: 0, cx: 0, cy: 0 };
  const r = cameraTarget(W, H, flat, -500, 0, out);
  assert.equal(r, out);
  assert.deepEqual({ ...out }, cameraTarget(W, H, flat, -500));
});

test('clouds wrap beyond what the floor view shows', () => {
  const reach = 1500;
  const r = cloudWrap(W, reach), lo = W / 2 - r, hi = W / 2 + r;
  assert.ok(lo < W / 2 - reach && hi > W / 2 + reach);
  const r0 = cloudWrap(W, 0), lo0 = W / 2 - r0, hi0 = W / 2 + r0;
  assert.ok(lo0 < W / 2 - W / 2 / ZOOM_FLOOR && hi0 > W / 2 + W / 2 / ZOOM_FLOOR, 'before the canvas is measured: the field at the floor');
});

test('a unit seen falling (drawn above where it will rest) is framed where it is drawn', () => {
  const t = cameraTarget(W, H, [{ y: 330 }, { y: 400, drawY: 40 }], null);
  const { top } = viewEdges(t, H);
  assert.ok(top <= 40 - 56, `top ${top} shows the falling unit at 40`);
  assert.ok(t.z < 1);
});
