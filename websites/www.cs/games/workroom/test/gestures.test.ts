import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createGestures, TAP_MS, type GestureOut } from '../src/gestures.ts';
import { boundsFor, fitView, type View } from '../src/zoom.ts';

const setup = (mode: 'pan' | 'select' = 'pan') => {
  let v: View = fitView(16, 800);
  const g = createGestures(() => v, () => boundsFor(16, 800), () => mode);
  const apply = (outs: GestureOut[]) => { for (const o of outs) if (o.kind === 'view') v = o.view; return outs; };
  return { g, apply, view: () => v };
};

test('a short still touch is a tap', () => {
  const { g } = setup();
  g.down({ id: 1, x: 100, y: 50, t: 0 });
  assert.deepEqual(g.up({ id: 1, x: 103, y: 52, t: 120 }), [{ kind: 'tap', x: 103, y: 52 }]);
});

test('a slow or moved touch is not a tap', () => {
  const { g } = setup();
  g.down({ id: 1, x: 100, y: 50, t: 0 });
  assert.deepEqual(g.up({ id: 1, x: 100, y: 50, t: TAP_MS + 1 }), []);
  g.down({ id: 2, x: 100, y: 50, t: 1000 });
  assert.deepEqual(g.up({ id: 2, x: 130, y: 50, t: 1100 }), []);
});

test('two fingers pinch and one drags (zoomed in)', () => {
  const { g, apply, view } = setup();
  apply(g.down({ id: 1, x: 100, y: 50, t: 0 }));
  apply(g.down({ id: 2, x: 300, y: 50, t: 5 }));
  apply(g.move({ id: 1, x: 0, y: 50, t: 20 }));
  apply(g.move({ id: 2, x: 400, y: 50, t: 20 }));
  assert.deepEqual(view(), { start: 2, pxPerSec: 100, width: 800 });
  apply(g.up({ id: 2, x: 400, y: 50, t: 40 }));
  apply(g.move({ id: 1, x: 100, y: 50, t: 60 }));
  assert.equal(view().start, 1, 'a 100 px drag right at 100 px/s moves one second back');
});

test('select mode: one finger selects a span', () => {
  const { g } = setup('select');
  g.down({ id: 1, x: 100, y: 120, t: 0 });
  assert.deepEqual(g.move({ id: 1, x: 300, y: 120, t: 50 }), [{ kind: 'select', x0: 100, x1: 300, y: 120, done: false }]);
  assert.deepEqual(g.up({ id: 1, x: 300, y: 120, t: 400 }), [{ kind: 'select', x0: 100, x1: 300, y: 120, done: true }]);
});

test('a cancelled touch ends quietly and a later touch starts fresh', () => {
  const { g } = setup();
  g.down({ id: 1, x: 100, y: 50, t: 0 });
  assert.deepEqual(g.cancel(1), []);
  assert.deepEqual(g.up({ id: 1, x: 100, y: 50, t: 10 }), []);
});

test('ctrl+wheel zooms about the pointer, wheel pans', () => {
  const { g, apply, view } = setup();
  apply(g.wheel(200, 0, -200 * Math.log(2), true));
  assert.ok(Math.abs(view().pxPerSec - 100) < 1e-9);
  apply(g.wheel(200, 100, 0, false));
  assert.ok(Math.abs(view().start - 3) < 1e-9);
});
