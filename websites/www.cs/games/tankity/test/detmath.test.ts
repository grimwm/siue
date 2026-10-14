// src/detmath.ts: the solo sim's sin, cos and atan2, built only from + - * /
// and floor so PHP computes the very same bits (the detmath sim vectors pin
// that). Here: they are accurate, and they keep the identities the sim leans on.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PI, dsin, dcos, datan, datan2 } from '../src/detmath.ts';

const grid: number[] = [];
for (let x = -40; x <= 40; x += 0.0137) grid.push(x);

test('sin and cos agree with Math to 1e-15 over the range the sim feeds them', () => {
  for (const x of grid) {
    assert.ok(Math.abs(dsin(x) - Math.sin(x)) <= 1e-15 * Math.max(1, Math.abs(x)), `sin ${x}`);
    assert.ok(Math.abs(dcos(x) - Math.cos(x)) <= 1e-15 * Math.max(1, Math.abs(x)), `cos ${x}`);
  }
});

test('atan and atan2 agree with Math to 1e-15, in every quadrant', () => {
  for (const x of grid) assert.ok(Math.abs(datan(x) - Math.atan(x)) <= 1e-15, `atan ${x}`);
  for (const [y, x] of [[1, 1], [1, -1], [-1, -1], [-1, 1], [0.3, 2e-9], [-5, 0.01], [7, -1e-6], [0, -3], [0, 3]] satisfies [number, number][]) {
    assert.ok(Math.abs(datan2(y, x) - Math.atan2(y, x)) <= 1e-15 * 4, `atan2 ${y} ${x}`);
  }
  assert.equal(datan2(1, 0), PI / 2);
  assert.equal(datan2(-1, 0), -PI / 2);
  assert.equal(datan2(0, 0), 0);
});

test('exact at the points the sim relies on', () => {
  assert.equal(dsin(0), 0);
  assert.equal(dcos(0), 1);
  assert.equal(datan(0), 0);
  assert.equal(datan(1), PI / 4);
});

test('sin and atan keep the sign of zero, as Math does', () => {
  assert.ok(Object.is(dsin(-0), -0));
  assert.ok(Object.is(datan(-0), -0));
  assert.ok(Object.is(dsin(0), 0));
});

test('non-finite input gives NaN, never a throw', () => {
  for (const x of [NaN, Infinity, -Infinity]) {
    assert.ok(Number.isNaN(dsin(x)), `sin ${x}`);
    assert.ok(Number.isNaN(dcos(x)), `cos ${x}`);
  }
  assert.equal(datan(Infinity), PI / 2);
  assert.equal(datan(-Infinity), -PI / 2);
});
