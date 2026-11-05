// The arithmetic behind the embed's drawn letters (src/glyph-math.ts): the
// letters have to move, turn and fade the way world.css moved their elements.
// Run by `node --test` (games/cylon/test.sh).
import * as g from '../src/glyph-math.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const near = (a: number, b: number, eps = 1e-6): void => assert.ok(Math.abs(a - b) < eps, `${a} ≉ ${b}`);

test('matrices compose in CSS order and invert', () => {
  const t = { ...g.IDENTITY, e: 10, f: 20 };
  const r = g.translateRotate(0, 0, 90);
  // Rotate first, then translate: (1, 0) → (0, 1) → (10, 21).
  const p = g.apply(g.multiply(t, r), 1, 0);
  near(p.x, 10);
  near(p.y, 21);
  const m = g.multiply(t, g.multiply(r, { a: 2, b: 0, c: 0, d: 0.5, e: -3, f: 4 }));
  const back = g.apply(g.invert(m), g.apply(m, 7, -2).x, g.apply(m, 7, -2).y);
  near(back.x, 7);
  near(back.y, -2);
});

test('an element turns about its own centre, and its centre only moves by its translation', () => {
  const own = g.aboutOrigin(g.translateRotate(5, -8, 37), 100, 200);
  const c = g.apply(own, 100, 200);
  near(c.x, 105);
  near(c.y, 192);
  // A letter inside a turned block is carried around the block's centre.
  const block = g.aboutOrigin(g.translateRotate(0, 0, 180), 50, 50);
  const q = g.apply(block, 60, 50);
  near(q.x, 40);
  near(q.y, 50);
});

test('the timing curves match CSS: linear stays linear, ends are pinned, ease is ahead at the midpoint', () => {
  const linear = g.cubicBezier(0, 0, 1, 1);
  for (const t of [0, 0.1, 0.5, 0.9, 1]) near(linear(t), t, 1e-4);
  for (const ease of [g.EASE, g.EASE_KICK, g.EASE_BLOW]) {
    assert.equal(ease(0), 0);
    assert.equal(ease(1), 1);
    let last = 0;
    for (let t = 0.05; t < 1; t += 0.05) {
      const v = ease(t);
      assert.ok(v >= last, 'never goes back');
      last = v;
    }
  }
  // CSS `ease` at 50% progress is about 0.8024.
  near(g.EASE(0.5), 0.8024, 1e-3);
});

test('a tween restarted mid-flight starts from where it was, as a CSS transition does', () => {
  let tw = g.still(0);
  tw = g.retarget(tw, 100, 1000, 320, g.EASE_KICK);
  assert.ok(g.moving(tw, 1100));
  const mid = g.tweenAt(tw, 1160);
  assert.ok(mid > 0 && mid < 100);
  tw = g.retarget(tw, -50, 1160, 320, g.EASE_KICK);
  near(g.tweenAt(tw, 1160), mid);
  assert.equal(g.tweenAt(tw, 1480), -50);
  assert.equal(g.moving(tw, 1480), false);
});

test('colours: the canvas forms parse, and the ash mix is color-mix(in srgb, c 38%, #5a5854)', () => {
  assert.deepEqual(g.parseCanvasColor('#102030'), { r: 16, g: 32, b: 48, a: 1 });
  assert.deepEqual(g.parseCanvasColor('rgba(1, 2, 3, 0.5)'), { r: 1, g: 2, b: 3, a: 0.5 });
  assert.equal(g.parseCanvasColor('oklch(0.5 0.1 20)'), null);
  const ash = { r: 0x5a, g: 0x58, b: 0x54, a: 1 };
  assert.deepEqual(g.mixSrgb({ r: 255, g: 255, b: 255, a: 1 }, ash, 0.38), { r: 153, g: 151, b: 149, a: 1 });
  assert.equal(g.cssColor({ r: 1, g: 2, b: 3, a: 0.25 }), 'rgba(1, 2, 3, 0.25)');
  assert.equal(g.parseCssTime('2.85s', 0), 2850);
  assert.equal(g.parseCssTime(' 320ms', 0), 320);
  assert.equal(g.parseCssTime('', 1600), 1600);
});
