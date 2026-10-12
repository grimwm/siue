// Spec section 4's budgets over many seeds: the fallback is rare and
// generation is fast. 1,000 seeds per make test; the nightly run sweeps 10,000.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateRun } from '../src/engine.ts';

const SEEDS = Number(process.env.CRETE_SWEEP_SEEDS ?? (process.env.GITHUB_EVENT_NAME === 'schedule' ? 10_000 : 1_000));

test(`over ${SEEDS} seeds the fallback fires on at most 1% and generation takes at most 20 ms at p95`, () => {
  const times = [];
  const fellBack = [];
  for (let i = 0; i < SEEDS; i++) {
    const seed = `sweep-${i}`;
    const t0 = performance.now();
    const pick = generateRun(seed);
    times.push(performance.now() - t0);
    if (pick.fallback) fellBack.push(seed);
  }
  times.sort((a, b) => a - b);
  const p95 = times[Math.floor(SEEDS * 0.95)];
  assert.ok(fellBack.length <= SEEDS * 0.01, `fallback on ${fellBack.length} of ${SEEDS}: ${fellBack.slice(0, 10).join(' ')}`);
  assert.ok(p95 <= 20, `p95 ${p95.toFixed(2)} ms`);
});
