// A shell the sim retires past the field's edge flies on, drawn only, until
// it is off the picture (src/ghosts.ts); one that burst inside never does.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createGhosts } from '../src/ghosts.ts';
import { GRAV, airOf } from '../src/sim.ts';
import type { Flier } from '../src/ghosts.ts';

function nth<T>(list: readonly T[], i: number): T {
  const v = list[i];
  assert.ok(v !== undefined, `item ${i} is missing`);
  return v;
}

/* Airless flight (drag 0, no wind): the ghost's path is the plain parabola these numbers read as. */
const air = () => airOf(720, 0, { drag: 0 });
const W = 720, dt = 1 / 60;

test('a shell that leaves the field keeps flying, on its ballistic path', () => {
  const g = createGhosts();
  let shell: Flier = { x: 700, y: 200, vx: 300, vy: -40, wkey: 'shell' };
  let drawn: readonly Flier[] = [];
  for (let f = 0; f < 3; f++) { // the sim moves it, then retires it 20 past the edge
    drawn = g.frame([shell], W, dt, air);
    shell = { ...shell, x: shell.x + shell.vx * dt, y: shell.y + shell.vy * dt, vy: shell.vy + GRAV * dt };
  }
  const out = { x: W + 22, y: 200, vx: 300, vy: -30, wkey: 'shell' };
  drawn = g.frame([out], W, dt, air);
  assert.equal(drawn.length, 0, 'still alive: not a ghost');
  drawn = g.frame([], W, dt, air);
  assert.equal(drawn.length, 1, 'retired outside the field: a ghost');
  const x0 = nth(drawn, 0).x, vy0 = nth(drawn, 0).vy;
  for (let f = 0; f < 60; f++) drawn = g.frame([], W, dt, air);
  assert.ok(nth(drawn, 0).x > x0 + 250, 'it kept going over the scenery');
  assert.ok(nth(drawn, 0).vy > vy0 + GRAV * 0.9, 'and fell as a shell falls');
});

test('a shell that bursts inside the field leaves no ghost', () => {
  const g = createGhosts();
  g.frame([{ x: 300, y: 300, vx: 100, vy: 50, wkey: 'shell' }], W, dt, air);
  assert.equal(g.frame([], W, dt, air).length, 0);
});

test("a replay's last point (no velocity) keeps the velocity it had", () => {
  const g = createGhosts();
  g.frame([{ x: 700, y: 100, vx: 240, vy: 10, wkey: 'shell' }], W, dt, air);
  g.frame([{ x: 742, y: 102, vx: 0, vy: 0, wkey: 'shell' }], W, dt, air);
  const out = g.frame([], W, dt, air);
  assert.equal(out.length, 1);
  assert.ok(nth(out, 0).vx > 200);
});

test('a ghost is dropped once it is far off the picture, and clear() forgets all', () => {
  const g = createGhosts();
  g.frame([{ x: W + 30, y: 100, vx: 900, vy: 0, wkey: 'shell' }], W, dt, air);
  g.frame([], W, dt, air);
  let out: readonly Flier[] = [];
  for (let f = 0; f < 600 && (out = g.frame([], W, dt, air)).length; f++);
  assert.equal(out.length, 0);
  g.frame([{ x: -30, y: 100, vx: -100, vy: 0, wkey: 'shell' }], W, dt, air);
  g.clear();
  assert.equal(g.frame([], W, dt, air).length, 0);
});
