// Pointer gestures as camera operations: turning, tilting, panning, twisting, zooming and the double-tap reset; nothing squares the view up.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TILT_PER_PX, createGestures } from '../src/modern/gestures.ts';
import type { CamOp, Ptr } from '../src/modern/gestures.ts';

const p = (id: number, x: number, y: number, type: Ptr['type'] = 'touch', button = 0): Ptr => ({ id, x, y, type, button });
const sum = (ops: CamOp[], kind: 'turn' | 'pan'): [number, number] => {
  let a = 0, b = 0;
  for (const o of ops) {
    if (o.kind === 'turn' && kind === 'turn') a += o.deg;
    if (o.kind === 'pan' && kind === 'pan') { a += o.dx; b += o.dy; }
  }
  return [a, b];
};

test('the mouse dragging +100 px across turns -35 degrees; dragging up leans toward the lowest tilt as on a map app; letting go leaves the view where it is', () => {
  const g = createGestures(() => 0);
  g.down(p(1, 50, 50, 'mouse'));
  const ops: CamOp[] = [];
  for (let x = 60; x <= 150; x += 10) ops.push(...g.move(p(1, x, 50, 'mouse')));
  assert.ok(Math.abs(sum(ops, 'turn')[0] + 35) < 1e-9);
  assert.ok(ops.every(o => o.kind === 'turn'));
  assert.deepEqual(g.move(p(1, 150, 10, 'mouse')), [{ kind: 'tilt', deg: -40 * TILT_PER_PX }], 'up 40 px');
  assert.deepEqual(g.move(p(1, 150, 30, 'mouse')), [{ kind: 'tilt', deg: 20 * TILT_PER_PX }], 'and back down');
  assert.deepEqual(g.up(p(1, 150, 30, 'mouse')), [], 'no squaring up');
});

test('two fingers side by side sliding up together tilt, and nothing else; lifting them leaves the view', () => {
  const g = createGestures(() => 0);
  g.down(p(1, 100, 300));
  g.down(p(2, 200, 300));
  const ops: CamOp[] = [];
  for (let y = 296; y >= 240; y -= 4) ops.push(...g.move(p(1, 100, y)), ...g.move(p(2, 200, y)));
  assert.ok(ops.length > 0 && ops.every(o => o.kind === 'tilt'), JSON.stringify(ops.slice(0, 3)));
  const tilt = ops.reduce((a, o) => a + (o.kind === 'tilt' ? o.deg : 0), 0);
  assert.ok(tilt < 0 && tilt >= -60 * TILT_PER_PX - 1e-9, `up leans toward the lowest tilt: ${tilt}`);
  assert.deepEqual(g.up(p(1, 100, 240)), []);
  assert.deepEqual(g.up(p(2, 200, 240)), [], 'no squaring up');
});

test('two fingers one above the other sliding up pan, not tilt', () => {
  const g = createGestures(() => 0);
  g.down(p(1, 150, 200));
  g.down(p(2, 150, 300));
  const ops = [...g.move(p(1, 150, 180)), ...g.move(p(2, 150, 280)), ...g.move(p(1, 150, 170)), ...g.move(p(2, 150, 270))];
  assert.ok(!ops.some(o => o.kind === 'tilt'));
  assert.ok(ops.some(o => o.kind === 'pan'));
});

test('one finger never moves the camera; a quick stroke is a swipe the way it went most', () => {
  let t = 0;
  const g = createGestures(() => t);
  for (const [x, y, dir] of [[90, 52, 'right'], [10, 45, 'left'], [55, 10, 'up'], [48, 95, 'down']] as const) {
    g.down(p(1, 50, 50));
    assert.deepEqual(g.move(p(1, x, y)), [], 'no turn or pan under one finger');
    t += 200;
    assert.deepEqual(g.up(p(1, x, y)), [{ kind: 'swipe', dir }]);
    t += 1000;
  }
});

test('a short, slow or two-finger stroke is no swipe', () => {
  let t = 0;
  const g = createGestures(() => t);
  g.down(p(1, 50, 50));
  t += 100;
  assert.deepEqual(g.up(p(1, 60, 50)), [], 'too short');
  t += 1000;
  g.down(p(1, 50, 50));
  t += 900;
  assert.deepEqual(g.up(p(1, 150, 50)), [], 'too slow');
  t += 1000;
  g.down(p(1, 50, 50));
  g.down(p(2, 150, 50));
  g.move(p(1, 50, 150));
  t += 100;
  assert.deepEqual(g.up(p(2, 150, 50)), []);
  assert.deepEqual(g.up(p(1, 50, 150)), [], 'the last finger of a two-finger touch is no swipe');
  t += 1000;
  g.down(p(1, 50, 50, 'mouse'));
  g.move(p(1, 150, 50, 'mouse'));
  t += 100;
  assert.deepEqual(g.up(p(1, 150, 50, 'mouse')), [], 'a mouse drag turns, never swipes');
});

test('two fingers dragging in parallel pan by the midpoint motion and do not turn', () => {
  const g = createGestures(() => 0);
  g.down(p(1, 100, 100));
  g.down(p(2, 200, 100));
  const ops = [...g.move(p(1, 130, 120)), ...g.move(p(2, 230, 120))];
  const [dx, dy] = sum(ops, 'pan');
  assert.ok(Math.abs(dx - 30) < 1e-9 && Math.abs(dy - 20) < 1e-9);
  // the fingers move one event at a time, so single events twist a little; the net twist is nil
  assert.ok(Math.abs(sum(ops, 'turn')[0]) < 1e-9);
});

test('a clockwise twist of 0.3 rad turns +17.19 degrees', () => {
  const g = createGestures(() => 0);
  g.down(p(1, 100, 100));
  g.down(p(2, 200, 100));
  const r = 100, a = 0.3;
  // the second finger swings about the first: angle +0.3 in screen coordinates (y down)
  const ops = g.move(p(2, 100 + r * Math.cos(a), 100 + r * Math.sin(a)));
  assert.ok(Math.abs(sum(ops, 'turn')[0] - 17.19) < 0.01);
});

test('two quick taps reset; two taps 500 ms apart do not', () => {
  let t = 0;
  const g = createGestures(() => t);
  const tap = () => { g.down(p(1, 80, 80)); t += 100; return g.up(p(1, 80, 80)); };
  assert.deepEqual(tap(), []);
  t += 150;
  assert.deepEqual(tap(), [{ kind: 'reset' }]);
  t += 600;
  assert.deepEqual(tap(), []);
  t += 500;
  assert.deepEqual(tap(), [], 'too slow to pair');
});

test('a tap that moved, lingered or was far from the last one is not a double tap', () => {
  let t = 0;
  const g = createGestures(() => t);
  g.down(p(1, 80, 80)); t += 100; g.up(p(1, 80, 80));
  t += 100;
  g.down(p(1, 200, 80)); t += 100;
  assert.deepEqual(g.up(p(1, 200, 80)), [], 'more than 40 px away');
});

test('mouse button 2 and 1 drag pan; button 0 turns; a mouse click is never a tap', () => {
  const g = createGestures(() => 0);
  g.down(p(1, 10, 10, 'mouse', 2));
  assert.deepEqual(g.move(p(1, 25, 14, 'mouse', 2)), [{ kind: 'pan', dx: 15, dy: 4 }]);
  g.up(p(1, 25, 14, 'mouse', 2));
  g.down(p(2, 10, 10, 'mouse', 0));
  assert.deepEqual(g.move(p(2, 30, 10, 'mouse', 0)), [{ kind: 'turn', deg: -7 }]);
  assert.deepEqual(g.up(p(2, 30, 10, 'mouse', 0)), []);
  g.down(p(3, 10, 10, 'mouse', 1));
  assert.deepEqual(g.move(p(3, 11, 10, 'mouse', 1)), [{ kind: 'pan', dx: 1, dy: 0 }]);
});

test('cancel forgets a pointer', () => {
  const g = createGestures(() => 0);
  g.down(p(1, 0, 0));
  g.cancel(1);
  assert.deepEqual(g.move(p(1, 50, 0)), []);
});

const zooms = (ops: CamOp[]) => ops.flatMap(o => (o.kind === 'zoom' ? [o] : []));

test("pinching apart zooms in about the fingers' midpoint; pinching together zooms out", () => {
  const g = createGestures(() => 0);
  g.down(p(1, 100, 100));
  g.down(p(2, 200, 100));
  const apart = zooms(g.move(p(2, 300, 100)));
  assert.equal(apart.length, 1);
  assert.ok(Math.abs(apart[0]!.factor - 0.5) < 1e-9, 'twice as far apart shows half the height');
  assert.deepEqual([apart[0]!.x, apart[0]!.y], [200, 100]);
  const together = zooms(g.move(p(2, 150, 100)));
  assert.ok(together[0]!.factor > 1);
  assert.equal(zooms(g.move(p(1, 110, 100))).length, 1, 'parallel moves of one finger still pinch');
  const pan = g.move(p(1, 110, 140));
  assert.ok(pan.some(o => o.kind === 'pan') && pan.some(o => o.kind === 'zoom'), 'pan and pinch together');
});

test('fingers almost touching pinch as if 10 px apart', () => {
  const g = createGestures(() => 0);
  g.down(p(1, 100, 100));
  g.down(p(2, 101, 100));
  const z = zooms(g.move(p(2, 120, 100)));
  assert.ok(Math.abs(z[0]!.factor - 10 / 20) < 1e-9);
});

test('the wheel: down zooms out, up zooms in, by the same amount either way', () => {
  const g = createGestures(() => 0);
  const [out] = g.wheel(100, 40, 50);
  const [inn] = g.wheel(-100, 40, 50);
  assert.ok(out?.kind === 'zoom' && out.factor > 1 && out.x === 40 && out.y === 50);
  assert.ok(inn?.kind === 'zoom' && Math.abs(inn.factor * out.factor - 1) < 1e-9);
  assert.deepEqual(g.wheel(0, 0, 0), []);
});

test('one finger and mouse drags never zoom', () => {
  const g = createGestures(() => 0);
  g.down(p(1, 10, 10));
  assert.deepEqual(zooms(g.move(p(1, 60, 40))), []);
  g.up(p(1, 60, 40));
  g.down(p(2, 10, 10, 'mouse', 2));
  assert.deepEqual(zooms(g.move(p(2, 60, 40, 'mouse', 2))), []);
});
