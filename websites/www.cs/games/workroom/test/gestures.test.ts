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

test('three fingers: lifting one leaves the other two pinching', () => {
  const { g, apply, view } = setup();
  apply(g.down({ id: 1, x: 100, y: 50, t: 0 }));
  apply(g.down({ id: 2, x: 300, y: 50, t: 1 }));
  apply(g.down({ id: 3, x: 700, y: 50, t: 2 }));
  apply(g.up({ id: 1, x: 100, y: 50, t: 3 }));
  apply(g.move({ id: 2, x: 200, y: 50, t: 4 }));
  apply(g.move({ id: 3, x: 800, y: 50, t: 4 }));
  assert.ok(Math.abs(view().pxPerSec - 50 * 600 / 400) < 1e-9, `${view().pxPerSec}`);
});

test('pinch, lift one, then a second finger lands: the pair pinches again', () => {
  const { g, apply, view } = setup();
  apply(g.down({ id: 1, x: 100, y: 50, t: 0 }));
  apply(g.down({ id: 2, x: 300, y: 50, t: 1 }));
  apply(g.move({ id: 1, x: 0, y: 50, t: 2 }));
  apply(g.move({ id: 2, x: 400, y: 50, t: 2 }));
  apply(g.up({ id: 2, x: 400, y: 50, t: 3 }));
  apply(g.down({ id: 3, x: 500, y: 50, t: 4 }));
  const before = view().pxPerSec;
  apply(g.move({ id: 3, x: 700, y: 50, t: 5 }));
  assert.ok(view().pxPerSec > before, 'fingers moving apart zoom in');
});

test('a jittery tap emits only a tap and leaves the view alone', () => {
  const { g, apply, view } = setup();
  const v0 = view();
  assert.deepEqual(apply(g.down({ id: 1, x: 100, y: 50, t: 0 })), []);
  assert.deepEqual(apply(g.move({ id: 1, x: 105, y: 52, t: 30 })), []);
  assert.deepEqual(apply(g.up({ id: 1, x: 104, y: 51, t: 100 })), [{ kind: 'tap', x: 104, y: 51 }]);
  assert.deepEqual(view(), v0);
});

test('select mode: a press with no movement is a tap, not a select', () => {
  const { g } = setup('select');
  g.down({ id: 1, x: 100, y: 120, t: 0 });
  assert.deepEqual(g.up({ id: 1, x: 100, y: 120, t: 80 }), [{ kind: 'tap', x: 100, y: 120 }]);
});

test('select mode: a preview is closed when a second finger lands or the touch is cancelled', () => {
  const a = setup('select');
  a.g.down({ id: 1, x: 100, y: 120, t: 0 });
  a.g.move({ id: 1, x: 300, y: 120, t: 50 });
  assert.deepEqual(a.g.down({ id: 2, x: 500, y: 120, t: 60 }), [{ kind: 'select', x0: 100, x1: 300, y: 120, done: true, cancelled: true }]);
  const b = setup('select');
  b.g.down({ id: 1, x: 100, y: 120, t: 0 });
  b.g.move({ id: 1, x: 300, y: 120, t: 50 });
  assert.deepEqual(b.g.cancel(1), [{ kind: 'select', x0: 100, x1: 300, y: 120, done: true, cancelled: true }]);
  const c = setup('select');
  c.g.down({ id: 1, x: 100, y: 120, t: 0 });
  assert.deepEqual(c.g.cancel(1), [], 'nothing was shown, nothing to close');
});
