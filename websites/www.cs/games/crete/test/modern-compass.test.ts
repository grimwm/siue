// The modern look's compass: a drag turns and tilts the view and leaves it there, a tap resets it, and its face shows the view however
// it was moved.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_YAW, MAX_PITCH, MIN_PITCH, START_PITCH } from '../src/modern/camera.ts';
import { COMPASS_TAP_PX, COMPASS_TILT_PER_PX, COMPASS_TURN_PER_PX, compassFace, createCompassDrag, steer } from '../src/modern/compass.ts';
import type { Heading } from '../src/modern/compass.ts';
import { createGestures } from '../src/modern/gestures.ts';
import type { CamOp } from '../src/modern/gestures.ts';

const near = (a: number, b: number, eps = 1e-9): void => assert.ok(Math.abs(a - b) < eps, `${a} is not ${b}`);

/** The view after `ops`, from the opening view (75°, north up); a reset goes back there. */
function play(ops: CamOp[], from: Heading = { yaw: DEFAULT_YAW, pitch: START_PITCH }): Heading {
  let v = from;
  for (const op of ops) {
    if (op.kind === 'reset') v = { yaw: DEFAULT_YAW, pitch: START_PITCH };
    else v = steer(v, op);
  }
  return v;
}

test('a drag across the compass turns the view, the way a left-button drag on the board does', () => {
  const d = createCompassDrag();
  const ops = [...d.down(1, 100, 100), ...d.move(1, 140, 100)];
  assert.deepEqual(ops, [{ kind: 'turn', deg: -40 * COMPASS_TURN_PER_PX }]);
  const v = play(ops);
  near(v.yaw, -40 * COMPASS_TURN_PER_PX);
  assert.equal(v.pitch, START_PITCH, 'across only turns');
});

test('a drag up the compass leans the view toward 45°, and down toward straight down, and no further either way', () => {
  const d = createCompassDrag();
  d.down(1, 50, 50);
  const some = play(d.move(1, 50, 30));
  near(some.pitch, START_PITCH - 20 * COMPASS_TILT_PER_PX);
  assert.equal(some.yaw, 0, 'up and down only tilt');
  const all = play([...d.move(1, 50, 30), ...d.move(1, 50, -400)]);
  assert.equal(all.pitch, MIN_PITCH, 'held at 45°');
  const back = play(d.move(1, 50, 400), all);
  assert.equal(back.pitch, MAX_PITCH, 'and dragging down goes no further than straight down');
});

test('a drag that lets go leaves the view at whatever heading it reached: no squaring up, no reset', () => {
  const d = createCompassDrag();
  d.down(7, 0, 0);
  const ops = [...d.move(7, -50, 0), ...d.up(7, -50, 0)];
  assert.ok(ops.every(o => o.kind === 'turn'), JSON.stringify(ops));
  near(play(ops).yaw, 50 * COMPASS_TURN_PER_PX);
  assert.equal(play(ops).yaw, 30, '-50 px is +30°, and it stays at 30°');
});

test('a tap resets: a press that moves less than the finger-sized threshold turns nothing and lifts to a reset', () => {
  assert.ok(COMPASS_TAP_PX >= 10 && COMPASS_TAP_PX <= 12, 'finger-sized');
  const d = createCompassDrag();
  d.down(1, 10, 10);
  assert.deepEqual(d.move(1, 10 + 7, 10 + 7), [], 'a fingertip wobble (about 10 px) is not a drag');
  assert.deepEqual(d.up(1, 10 + COMPASS_TAP_PX - 1, 10), [{ kind: 'reset' }]);
  const turned = play([{ kind: 'turn', deg: 137 }, { kind: 'tilt', deg: -22 }]);
  assert.deepEqual(play([{ kind: 'reset' }], turned), { yaw: 0, pitch: START_PITCH }, '75° and north up again');
  d.down(2, 0, 0);
  assert.deepEqual(d.up(2, 0, 0), [{ kind: 'reset' }], 'a press held still lifts to a reset too, however long');
});

test('a press that moves past the threshold is a drag, even if it comes back before it lifts', () => {
  const d = createCompassDrag();
  d.down(1, 0, 0);
  assert.notDeepEqual(d.move(1, COMPASS_TAP_PX, 0), []);
  const ops = d.up(1, 0, 0);
  assert.ok(!ops.some(o => o.kind === 'reset'), 'no reset after a drag');
});

test('one pointer steers at a time; a cancelled press does nothing more', () => {
  const d = createCompassDrag();
  d.down(1, 0, 0);
  assert.deepEqual(d.down(2, 5, 5), []);
  assert.deepEqual(d.move(2, 90, 90), [], 'a second finger is ignored');
  d.move(1, 30, 0);
  assert.deepEqual(d.cancel(1), []);
  d.down(3, 0, 0);
  assert.deepEqual(d.cancel(3), []);
  assert.deepEqual(d.up(3, 0, 0), [], 'nothing left to lift');
});

test('the face shows the view: the needle turns with the heading, the dial squashes and the ring fills as it tilts', () => {
  assert.deepEqual(compassFace({ yaw: 0, pitch: MAX_PITCH }), { needle: 0, squash: 1, tilt: 0 });
  const start = compassFace({ yaw: 0, pitch: START_PITCH });
  near(start.tilt, 1 / 3);
  near(start.squash, Math.sin((75 * Math.PI) / 180));
  const low = compassFace({ yaw: -90, pitch: MIN_PITCH });
  assert.equal(low.needle, -90);
  near(low.tilt, 1);
  near(low.squash, Math.SQRT1_2);
  const free = compassFace({ yaw: 30, pitch: 60 });
  assert.equal(free.needle, 30, 'any heading, not only quarter turns');
  assert.ok(free.squash < start.squash && free.squash > low.squash, 'the squash grows as the view tilts');
});

test('the compass shows a view moved by the board\'s gestures too: two fingers twisting and sliding, a left-button drag', () => {
  let t = 0;
  const g = createGestures(() => t);
  const ops: CamOp[] = [];
  // Two fingers side by side slide up together: a tilt toward angled.
  ops.push(...g.down({ id: 1, x: 100, y: 300, type: 'touch', button: 0 }), ...g.down({ id: 2, x: 200, y: 300, type: 'touch', button: 0 }));
  for (let y = 300; y >= 240; y -= 10) {
    t += 16;
    ops.push(...g.move({ id: 1, x: 100, y, type: 'touch', button: 0 }), ...g.move({ id: 2, x: 200, y, type: 'touch', button: 0 }));
  }
  ops.push(...g.up({ id: 1, x: 100, y: 240, type: 'touch', button: 0 }), ...g.up({ id: 2, x: 200, y: 240, type: 'touch', button: 0 }));
  const tilted = play(ops);
  assert.ok(tilted.pitch < START_PITCH, `two fingers tilted the view: ${tilted.pitch}`);
  const face = compassFace(tilted);
  assert.ok(face.tilt > 1 / 3 && face.squash < Math.sin((75 * Math.PI) / 180), 'and the compass leans with it');
  // A left-button drag across turns the view; the needle follows it.
  const turn = [...g.down({ id: 9, x: 0, y: 0, type: 'mouse', button: 0 }), ...g.move({ id: 9, x: -100, y: 0, type: 'mouse', button: 0 }),
    ...g.up({ id: 9, x: -100, y: 0, type: 'mouse', button: 0 })];
  const turned = play(turn, tilted);
  near(turned.yaw, 35);
  assert.equal(compassFace(turned).needle, turned.yaw, 'left at 35°, and the needle shows it');
  assert.equal(compassFace(turned).tilt, face.tilt, 'the tilt stays as it was');
});
