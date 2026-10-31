// The modern look's compass: a drag turns and tilts the view, a tap resets it, and its face shows the view however
// it was moved.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ANGLED_PITCH, DEFAULT_YAW, TOP_PITCH, snapYaw } from '../src/modern/camera.ts';
import { COMPASS_TAP_PX, COMPASS_TILT_PER_PX, COMPASS_TURN_PER_PX, compassFace, createCompassDrag, steer } from '../src/modern/compass.ts';
import type { Heading } from '../src/modern/compass.ts';
import { createGestures } from '../src/modern/gestures.ts';
import type { CamOp } from '../src/modern/gestures.ts';

const near = (a: number, b: number, eps = 1e-9): void => assert.ok(Math.abs(a - b) < eps, `${a} is not ${b}`);

/** The view after `ops`, from top-down and north up; a reset goes back there, a settle squares the heading up. */
function play(ops: CamOp[], from: Heading = { yaw: DEFAULT_YAW, pitch: TOP_PITCH }): Heading {
  let v = from;
  for (const op of ops) {
    if (op.kind === 'reset') v = { yaw: DEFAULT_YAW, pitch: TOP_PITCH };
    else if (op.kind === 'settle') v = { ...v, yaw: snapYaw(v.yaw) };
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
  assert.equal(v.pitch, TOP_PITCH, 'across only turns');
});

test('a drag down the compass tilts the view from top-down toward angled, and no further than angled', () => {
  const d = createCompassDrag();
  d.down(1, 50, 50);
  const some = play(d.move(1, 50, 70));
  near(some.pitch, TOP_PITCH - 20 * COMPASS_TILT_PER_PX);
  assert.equal(some.yaw, 0, 'up and down only tilt');
  const all = play([...d.move(1, 50, 70), ...d.move(1, 50, 400)]);
  assert.equal(all.pitch, ANGLED_PITCH, 'held at the angled limit');
  const back = play(d.move(1, 50, -400), all);
  assert.equal(back.pitch, TOP_PITCH, 'and dragging up comes back no further than top-down');
});

test('a drag that lets go settles the heading on a quarter turn, not a reset', () => {
  const d = createCompassDrag();
  d.down(7, 0, 0);
  const ops = [...d.move(7, -120, 0), ...d.up(7, -120, 0)];
  assert.equal(ops.at(-1)!.kind, 'settle');
  assert.ok(!ops.some(o => o.kind === 'reset'));
  assert.equal(play(ops).yaw, 90, `-120 px is +${120 * COMPASS_TURN_PER_PX}°, settled on 90`);
});

test('a tap resets: a press that moves less than the threshold turns nothing and lifts to a reset', () => {
  const d = createCompassDrag();
  d.down(1, 10, 10);
  assert.deepEqual(d.move(1, 10 + COMPASS_TAP_PX - 1, 10), [], 'a small wobble is not a drag');
  assert.deepEqual(d.up(1, 10 + COMPASS_TAP_PX - 1, 10), [{ kind: 'reset' }]);
  const turned = play([{ kind: 'turn', deg: 137 }, { kind: 'tilt', deg: -22 }]);
  assert.deepEqual(play([{ kind: 'reset' }], turned), { yaw: 0, pitch: TOP_PITCH }, 'top-down and north up again');
});

test('a press that moves past the threshold is a drag, even if it comes back before it lifts', () => {
  const d = createCompassDrag();
  d.down(1, 0, 0);
  assert.notDeepEqual(d.move(1, COMPASS_TAP_PX, 0), []);
  const ops = d.up(1, 0, 0);
  assert.ok(!ops.some(o => o.kind === 'reset'), 'no reset after a drag');
  assert.equal(ops.at(-1)!.kind, 'settle');
});

test('one pointer steers at a time; a cancelled drag settles, a cancelled tap does nothing', () => {
  const d = createCompassDrag();
  d.down(1, 0, 0);
  assert.deepEqual(d.down(2, 5, 5), []);
  assert.deepEqual(d.move(2, 90, 90), [], 'a second finger is ignored');
  d.move(1, 30, 0);
  assert.deepEqual(d.cancel(1), [{ kind: 'settle' }]);
  d.down(3, 0, 0);
  assert.deepEqual(d.cancel(3), []);
  assert.deepEqual(d.up(3, 0, 0), [], 'nothing left to lift');
});

test('the face shows the view: the needle turns with the heading, the dial squashes and the ring fills as it tilts', () => {
  assert.deepEqual(compassFace({ yaw: 0, pitch: TOP_PITCH }), { needle: 0, squash: 1, tilt: 0 });
  const angled = compassFace({ yaw: -90, pitch: ANGLED_PITCH });
  assert.equal(angled.needle, -90);
  near(angled.tilt, 1);
  near(angled.squash, Math.sin(Math.PI / 4) / Math.sin((75 * Math.PI) / 180));
  const mid = compassFace({ yaw: 30, pitch: 60 });
  near(mid.tilt, 0.5);
  assert.ok(mid.squash < 1 && mid.squash > angled.squash, 'the squash grows as the view tilts');
});

test('the compass shows a view moved by the board\'s gestures too: two fingers twisting and sliding, a left-button drag', () => {
  let t = 0;
  const g = createGestures(() => t);
  const ops: CamOp[] = [];
  // Two fingers side by side slide down together: a tilt toward angled.
  ops.push(...g.down({ id: 1, x: 100, y: 300, type: 'touch', button: 0 }), ...g.down({ id: 2, x: 200, y: 300, type: 'touch', button: 0 }));
  for (let y = 300; y <= 360; y += 10) {
    t += 16;
    ops.push(...g.move({ id: 1, x: 100, y, type: 'touch', button: 0 }), ...g.move({ id: 2, x: 200, y, type: 'touch', button: 0 }));
  }
  ops.push(...g.up({ id: 1, x: 100, y: 360, type: 'touch', button: 0 }), ...g.up({ id: 2, x: 200, y: 360, type: 'touch', button: 0 }));
  const tilted = play(ops);
  assert.ok(tilted.pitch < TOP_PITCH, `two fingers tilted the view: ${tilted.pitch}`);
  const face = compassFace(tilted);
  assert.ok(face.tilt > 0 && face.squash < 1, 'and the compass leans with it');
  // A left-button drag across turns the view; the needle follows it.
  const turn = [...g.down({ id: 9, x: 0, y: 0, type: 'mouse', button: 0 }), ...g.move({ id: 9, x: -260, y: 0, type: 'mouse', button: 0 }),
    ...g.up({ id: 9, x: -260, y: 0, type: 'mouse', button: 0 })];
  const turned = play(turn, tilted);
  assert.equal(turned.yaw, 90, 'settled on a quarter turn');
  assert.equal(compassFace(turned).needle, 90);
  assert.equal(compassFace(turned).tilt, face.tilt, 'the tilt stays as it was');
});
