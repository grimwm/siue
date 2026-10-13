// The solo war runs in fixed SOLO_STEP steps whatever the frame lengths, tank
// falls included, so the server's play of a round lands every shell and drops
// every tank exactly as the browser did.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runFixed, MAX_STEPS } from '../src/flow.ts';
import { SOLO_STEP } from '../src/solo.ts';
import { fallTanks, mulberry32 } from '../src/sim.ts';

function drive(frames) {
  const seen = [];
  let acc = 0;
  for (const dt of frames) acc = runFixed(acc, dt, SOLO_STEP, h => { seen.push(h); return true; });
  return seen;
}

test('every step is exactly SOLO_STEP whatever the frame lengths', () => {
  const r = mulberry32(7);
  const jitter = Array.from({ length: 600 }, () => 0.002 + r() * 0.048);
  for (const frames of [Array(300).fill(1 / 30), Array(1440).fill(1 / 144), jitter]) {
    const steps = drive(frames);
    assert.ok(steps.every(h => h === SOLO_STEP));
    const total = frames.reduce((a, b) => a + b, 0);
    // Within one step, plus float noise: 600 steps' worth of 1/60 can sum to 599.99999....
    assert.ok(Math.abs(steps.length - total / SOLO_STEP) <= 1 + 1e-6, `${steps.length} steps for ${total} s`);
  }
});

test('a tank over a crater falls through the same heights at any frame rate', () => {
  const fall = frames => {
    const world = { terrain: Array(720).fill(400), tanks: [{ x: 300, y: 300, hp: 50, vy: 0 }] };
    const ys = [];
    let acc = 0;
    for (const dt of frames) acc = runFixed(acc, dt, SOLO_STEP, h => { fallTanks(world, h); ys.push(world.tanks[0].y); return true; });
    return ys;
  };
  const steady = fall(Array(120).fill(1 / 60));
  const r = mulberry32(11);
  const jitter = fall(Array.from({ length: 400 }, () => 0.001 + r() * 0.03));
  const n = Math.min(steady.length, jitter.length);
  assert.ok(n > 30);
  assert.deepEqual(jitter.slice(0, n), steady.slice(0, n));
  assert.equal(steady.at(-1), 400, 'it lands on the ground');
});

test('a step that ends the war drops the rest of the frame', () => {
  let n = 0;
  const acc = runFixed(0, 0.1, SOLO_STEP, () => ++n < 2);
  assert.equal(n, 2);
  assert.equal(acc, 0);
});

test('a long stall runs at most MAX_STEPS in one frame', () => {
  let n = 0;
  runFixed(0, 10, SOLO_STEP, () => { n++; return true; });
  assert.equal(n, MAX_STEPS);
});
