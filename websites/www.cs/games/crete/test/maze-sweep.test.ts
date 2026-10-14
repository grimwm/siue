// Spec section 4's budgets over many seeds: the fallback is rare and
// generation is fast. Speed is bounded by candidates drawn, which is the same on
// every machine; wall time only guards against a runaway, since CI runners are
// slower and noisier than a laptop. 300 seeds per make test; nightly sweeps 10,000.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateRun, spawnDistance, MIN_SPAWN, EXIT } from '../src/engine.ts';

const SEEDS = Number(process.env.CRETE_SWEEP_SEEDS ?? (process.env.GITHUB_EVENT_NAME === 'schedule' ? 10_000 : 300));

test(`over ${SEEDS} seeds every maze starts the creature far, the fallback fires on at most 1% and a seed draws few candidates`, t => {
  const times: number[] = [];
  const attempts: number[] = [];
  const fellBack: string[] = [];
  const unfair: string[] = [];
  for (let i = 0; i < SEEDS; i++) {
    const seed = `sweep-${i}`;
    const t0 = performance.now();
    const pick = generateRun(seed);
    times.push(performance.now() - t0);
    attempts.push(pick.attempt);
    if (pick.fallback) fellBack.push(seed);
    const { foe, pickups } = pick.layout;
    if (spawnDistance(pick.layout) < MIN_SPAWN || pickups.size !== 8 || (foe.r === EXIT.r && foe.c === EXIT.c)) unfair.push(seed);
  }
  times.sort((a, b) => a - b);
  attempts.sort((a, b) => a - b);
  const p95 = times[Math.floor(SEEDS * 0.95)];
  const p95Attempt = attempts[Math.floor(SEEDS * 0.95)];
  assert.ok(p95 !== undefined && p95Attempt !== undefined);
  const meanAttempt = attempts.reduce((s, a) => s + a, 0) / SEEDS;
  t.diagnostic(`candidates: mean ${meanAttempt.toFixed(2)}, p95 ${p95Attempt}; time p95 ${p95.toFixed(1)} ms`);
  assert.deepEqual(unfair, [], 'seeds whose maze starts the creature near, or lacks loot');
  assert.ok(fellBack.length <= SEEDS * 0.01, `fallback on ${fellBack.length} of ${SEEDS}: ${fellBack.slice(0, 10).join(' ')}`);
  assert.ok(p95Attempt <= 20 && meanAttempt <= 6, `candidates drawn: mean ${meanAttempt.toFixed(2)}, p95 ${p95Attempt}`);
  assert.ok(p95 <= 100, `p95 ${p95.toFixed(2)} ms`);
});
