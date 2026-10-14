// The run's state: the schedule of due-at moments and the run's score and hull.
// src/state.ts is
// pure, so a fake clock (plain numbers) drives every case; no timer is used.
import * as st from '../src/state.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
// Object.keys is string[] by design; these are exactly the Schedule's own keys.
const KEYS = Object.keys(st.createSchedule()) as (keyof st.Schedule)[];

// A fresh schedule arms nothing.
await test('schedule-starts-unarmed', () => { assert.ok(KEYS.length === 6 && KEYS.every(k => st.createSchedule()[k] === 0), KEYS.join()); });

// Pausing for N ms shifts every moment still ahead of the pause by N.
{
  const pausedAt = 10_000;
  const N = 5_000;
  const s = {
    missileDueAt: 12_000, nukeDueAt: 25_000, healDueAt: 20_000,
    grenadeReadyAt: 14_000, raptorReadyAt: 70_000, eyeDisorientedUntil: 40_000,
  };
  const out = st.skewForPause(s, pausedAt, N);
  await test('pause-shifts-every-due-at-by-N', () => { assert.ok(KEYS.every(k => out[k] === s[k] + N), JSON.stringify(out)); });
  await test('pause-leaves-the-input-alone', () => { assert.ok(s.missileDueAt === 12_000, String(s.missileDueAt)); });
}
// Unarmed (0) and already-past moments are not pulled forward into the future.
{
  const s = { ...st.createSchedule(), missileDueAt: 9_000, nukeDueAt: 10_000, healDueAt: 10_001 };
  const out = st.skewForPause(s, 10_000, 3_000);
  await test('pause-skips-unarmed', () => { assert.ok(out.raptorReadyAt === 0 && out.grenadeReadyAt === 0 && out.eyeDisorientedUntil === 0, JSON.stringify(out)); });
  await test('pause-skips-moments-already-past', () => { assert.ok(out.missileDueAt === 9_000 && out.nukeDueAt === 10_000, JSON.stringify(out)); });
  await test('pause-shifts-a-moment-just-ahead', () => { assert.ok(out.healDueAt === 13_001, String(out.healDueAt)); });
}
// No pause, no change.
{
  const s = { ...st.createSchedule(), missileDueAt: 5_000 };
  await test('zero-pause-changes-nothing', () => { assert.ok(st.skewForPause(s, 1_000, 0) === s && st.skewForPause(s, 1_000, -5) === s, ''); });
}
// Two pauses add up: the same as one pause of the sum.
{
  const s = { ...st.createSchedule(), nukeDueAt: 30_000, raptorReadyAt: 61_000 };
  const twice = st.skewForPause(st.skewForPause(s, 10_000, 2_000), 20_000, 3_000);
  await test('two-pauses-add-up', () => { assert.ok(same(twice, st.skewForPause(s, 10_000, 5_000)), JSON.stringify(twice)); });
}
// Fake clock end to end: a missile due 4 s after the run's 20 s mark; pause at 21 s for 5 s.
{
  let now = 20_000;
  let s = { ...st.createSchedule(), missileDueAt: now + 4_000 };
  now = 21_000;
  const pausedAt = now;
  now = 26_000;
  s = st.skewForPause(s, pausedAt, now - pausedAt);
  await test('resume-leaves-the-time-it-had-left', () => { assert.ok(st.msUntil(s.missileDueAt, now) === 3_000, String(st.msUntil(s.missileDueAt, now))); });
}
await test('msUntil-never-negative', () => { assert.ok(st.msUntil(100, 500) === 0 && st.msUntil(500, 100) === 400, ''); });
await test('pending-is-strictly-ahead', () => { assert.ok(st.pending(10, 9) && !st.pending(10, 10) && !st.pending(0, 5), ''); });

// Run: kills, hull, ending.
{
  let r = st.createRun();
  await test('run-starts-clean', () => { assert.ok(r.koScore === 0 && r.hitCount === 0 && !r.gameOver && r.pendingScore === null && r.runStartedAt === 0, JSON.stringify(r)); });
  r = st.beginRun(r, 1234);
  r = st.recordKill(st.recordKill(r));
  await test('begin-and-kill', () => { assert.ok(r.runStartedAt === 1234 && r.koScore === 2, JSON.stringify(r)); });

  const hit = st.takeHits(r, 3, 30);
  await test('hits-land-on-hull-and-lifetime', () => { assert.ok(hit.run.hitCount === 3 && hit.run.hitsTaken === 3 && hit.ends === null, JSON.stringify(hit)); });
  const healed = st.healOne(hit.run);
  await test('heal-lowers-hull-not-lifetime', () => { assert.ok(healed.hitCount === 2 && healed.hitsTaken === 3, JSON.stringify(healed)); });
  await test('heal-at-zero-is-a-no-op', () => { assert.ok(st.healOne(r) === r, ''); });
  await test('junk-hit-counts-as-none', () => { assert.ok(st.takeHits(r, -4, 30).run.hitCount === 0 && st.takeHits(r, NaN, 30).run.hitCount === 0, ''); });
  await test('hull-full-ends-the-run', () => { assert.ok(st.takeHits({ ...r, hitCount: 29 }, 1, 30).ends === 'hits', ''); });
  await test('one-short-does-not', () => { assert.ok(st.takeHits({ ...r, hitCount: 28 }, 1, 30).ends === null, ''); });
  await test('a-nuke-ends-it-at-once', () => { assert.ok(st.takeHits(r, 1, 30, true).ends === 'nuke', ''); });

  const over = st.endRun(hit.run, 'hits');
  await test('end-locks-and-holds-the-score', () => { assert.ok(over.gameOver && over.runStartedAt === 0
    && same(over.pendingScore, { score: 2, hits: 3, reason: 'hits' }), JSON.stringify(over)); });
  await test('end-leaves-the-input-alone', () => { assert.ok(!hit.run.gameOver && hit.run.pendingScore === null, ''); });

  const reset = st.resetScore(st.setEndReason(over, 'quit'));
  await test('reset-zeroes-score-and-hull', () => { assert.ok(reset.koScore === 0 && reset.hitCount === 0 && reset.hitsTaken === 0
    && !reset.gameOver && reset.pendingScore === null, JSON.stringify(reset)); });
  await test('reset-keeps-the-panel-reason', () => { assert.ok(reset.endReason === 'quit', ''); });
  await test('clear-pending-and-game-over', () => { assert.ok(st.clearPendingScore(over).pendingScore === null && !st.clearGameOver(over).gameOver, ''); });
  await test('stop-clock', () => { assert.ok(st.stopClock(st.beginRun(r, 9)).runStartedAt === 0, ''); });
}
