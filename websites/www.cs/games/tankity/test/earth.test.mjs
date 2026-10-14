// The earth ops (src/earth.ts): what each does to the ground, beyond the
// parity the shared vectors pin.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FLOOR, TOP_Y, addDirt, carveCrater, digCarve, digHeading, fillPour, pourLevel, riotCarve, slumpGround } from '../src/earth.ts';

const flat = (y, w = 720) => Array(w).fill(y);
const sum = t => t.reduce((a, b) => a + b, 0);
const vee = (cx, half, top, bottom, w = 720) => Array.from({ length: w }, (_, ix) => top + (bottom - top) * Math.max(0, 1 - Math.abs(ix - cx) / half));

test('slumping keeps the volume and spreads a cliff into a slope', () => {
  const t = flat(420);
  for (let ix = 0; ix <= 300; ix++) t[ix] = 300;
  const before = sum(t);
  slumpGround(t, 300, 120, 1, 400);
  assert.ok(Math.abs(sum(t) - before) < 1e-9, `the total moved by ${sum(t) - before}`);
  let steepest = 0;
  for (let ix = 180; ix < 420; ix++) steepest = Math.max(steepest, Math.abs(t[ix + 1] - t[ix]));
  assert.ok(steepest < 5, `a ${steepest} px step is left of the 120 px cliff`);
  assert.equal(t[100], 300, 'outside its radius the ground stays');
});

test('a pool holds the volume poured (to a hair), is level, and raises the valley floor to it', () => {
  const t = vee(300, 120, 330, 420), before = t.slice();
  const p = pourLevel(t, 300, 4000);
  assert.ok(p.x0 <= 300 && p.x1 >= 300);
  let held = 0;
  for (let ix = p.x0; ix <= p.x1; ix++) held += Math.max(0, before[ix] - p.level);
  assert.ok(Math.abs(held - 4000) < 2, `held ${held}`);
  fillPour(t, p);
  for (let ix = p.x0; ix <= p.x1; ix++) assert.ok(t[ix] <= p.level + 1e-9 && t[ix] <= before[ix]);
  assert.equal(t[300], p.level);
});

test('liquid runs downhill to the bottom of the dip it lands in', () => {
  const t = vee(300, 120, 330, 420);
  const p = pourLevel(t, 250, 1500);
  assert.ok(p.x0 <= 300 && p.x1 >= 300, `pool ${p.x0}..${p.x1}`);
});

test('liquid poured on a slope down to an edge spills off, all of it', () => {
  const t = Array.from({ length: 720 }, (_, ix) => 300 + 120 * ix / 719);
  const p = pourLevel(t, 500, 4000);
  assert.ok(p.x0 > p.x1, 'no pool');
});

test('a pour of nothing makes no pool', () => {
  assert.ok(pourLevel(vee(300, 120, 330, 420), 300, 0).x0 > pourLevel(vee(300, 120, 330, 420), 300, 0).x1);
});

test('dirt piles up to the disc over each column, never lowers the ground, never above the sky line', () => {
  const t = flat(400);
  addDirt(t, 300, 400, 35);
  assert.equal(t[300], 365);
  assert.equal(t[250], 400);
  const deep = flat(400);
  addDirt(deep, 300, 450, 20);
  assert.deepEqual(deep, flat(400));
  const high = flat(120);
  addDirt(high, 300, 60, 60);
  assert.equal(Math.min(...high), TOP_Y);
});

test('a crater never cuts below the floor', () => {
  const t = flat(440);
  carveCrater(t, 300, 450, 40, FLOOR);
  assert.equal(Math.max(...t), FLOOR);
});

test('a riot charge digs the hull out of the dirt over it', () => {
  const t = flat(400);
  for (let ix = 270; ix <= 330; ix++) t[ix] = 350;
  riotCarve(t, 300, 390, -Math.PI / 2, 45, 1.2);
  assert.ok(t[300] > 400, `ground under the hull at ${t[300]}`);
});

test('a trench follows the heading, open to the sky', () => {
  const t = flat(400);
  const [ux, uy] = digHeading(120, 160);
  assert.ok(Math.abs(ux * ux + uy * uy - 1) < 1e-12);
  digCarve(t, 300, 401, ux, uy, 28, 11);
  const end = 300 + ux * 4 * 28;
  assert.ok(t[Math.round(end)] > 450, 'deep at the end');
  assert.ok(t[300] > 400 && t[300] < t[Math.round(end)], 'shallow at the start');
  assert.equal(t[200], 400);
});
