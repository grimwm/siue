// The ground as it is drawn while the earth moves (src/earth-show.ts): the
// rules move the ground at once; the picture follows over a moment.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EARTH_ANIM, createEarthShow } from '../src/earth-show.ts';

const flat = (y, w = 100) => Array(w).fill(y);

test('with nothing moving the shown ground is the ground itself', () => {
  const show = createEarthShow(), t = flat(400);
  assert.equal(show.shown(t), t);
  assert.ok(!show.busy());
});

test('a mound rises from the old ground to the new over its time, then the picture is the ground', () => {
  const show = createEarthShow(), before = flat(400), t = flat(400);
  for (let ix = 40; ix <= 60; ix++) t[ix] = 370;
  show.begin(before, 40, 60, 'dirt', 50);
  assert.equal(show.shown(t)[50], 400, 'drawn where it was at first');
  show.step(EARTH_ANIM.dirt / 2);
  const mid = show.shown(t)[50];
  assert.ok(mid < 400 && mid > 370, `halfway: ${mid}`);
  assert.equal(show.shown(t)[20], 400, 'columns it never touched are the ground');
  show.step(EARTH_ANIM.dirt);
  assert.ok(!show.busy());
  assert.equal(show.shown(t), t);
});

test('liquid dirt flows out from where it landed: the middle fills before the rims', () => {
  const show = createEarthShow(), before = flat(420), t = flat(420);
  for (let ix = 20; ix <= 80; ix++) t[ix] = 380;
  show.begin(before, 20, 80, 'pour', 50);
  show.step(EARTH_ANIM.pour * 0.3);
  const s = show.shown(t);
  assert.ok(s[50] < s[25], `the middle (${s[50]}) is higher than the rim (${s[25]})`);
  assert.ok(show.busy());
  show.step(EARTH_ANIM.pour);
  assert.ok(!show.busy());
});

test('clear drops every animation', () => {
  const show = createEarthShow();
  show.begin(flat(400), 0, 10, 'slump', 5);
  show.clear();
  assert.ok(!show.busy());
});
