// Pointer gestures as camera operations: turning, panning, twisting and the double-tap reset.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createGestures } from '../src/modern/gestures.ts';
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

test('one finger dragging +100 px across turns -35 degrees; a vertical drag does nothing', () => {
  const g = createGestures(() => 0);
  g.down(p(1, 50, 50));
  const ops: CamOp[] = [];
  for (let x = 60; x <= 150; x += 10) ops.push(...g.move(p(1, x, 50)));
  assert.ok(Math.abs(sum(ops, 'turn')[0] + 35) < 1e-9);
  assert.deepEqual(g.move(p(1, 150, 90)), []);
  assert.ok(ops.every(o => o.kind === 'turn'));
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
