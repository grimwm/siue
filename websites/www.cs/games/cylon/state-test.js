// The run's state: the schedule of due-at moments and the run's score and hull.
// Run here: `node state-test.js`. js/state.js (compiled from src/state.ts) is
// pure, so a fake clock (plain numbers) drives every case; no timer is used.
import * as st from './js/state.js';

let failed = 0;
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${ok ? '' : ` :: ${detail}`}`);
  if (!ok) failed++;
};
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const KEYS = Object.keys(st.createSchedule());

// A fresh schedule arms nothing.
check('schedule-starts-unarmed', KEYS.length === 6 && KEYS.every(k => st.createSchedule()[k] === 0), KEYS.join());

// Pausing for N ms shifts every moment still ahead of the pause by N.
{
  const pausedAt = 10_000;
  const N = 5_000;
  const s = {
    missileDueAt: 12_000, nukeDueAt: 25_000, healDueAt: 20_000,
    grenadeReadyAt: 14_000, raptorReadyAt: 70_000, eyeDisorientedUntil: 40_000,
  };
  const out = st.skewForPause(s, pausedAt, N);
  check('pause-shifts-every-due-at-by-N', KEYS.every(k => out[k] === s[k] + N), JSON.stringify(out));
  check('pause-leaves-the-input-alone', s.missileDueAt === 12_000, String(s.missileDueAt));
}
// Unarmed (0) and already-past moments are not pulled forward into the future.
{
  const s = { ...st.createSchedule(), missileDueAt: 9_000, nukeDueAt: 10_000, healDueAt: 10_001 };
  const out = st.skewForPause(s, 10_000, 3_000);
  check('pause-skips-unarmed', out.raptorReadyAt === 0 && out.grenadeReadyAt === 0 && out.eyeDisorientedUntil === 0, JSON.stringify(out));
  check('pause-skips-moments-already-past', out.missileDueAt === 9_000 && out.nukeDueAt === 10_000, JSON.stringify(out));
  check('pause-shifts-a-moment-just-ahead', out.healDueAt === 13_001, String(out.healDueAt));
}
// No pause, no change.
{
  const s = { ...st.createSchedule(), missileDueAt: 5_000 };
  check('zero-pause-changes-nothing', st.skewForPause(s, 1_000, 0) === s && st.skewForPause(s, 1_000, -5) === s, '');
}
// Two pauses add up: the same as one pause of the sum.
{
  const s = { ...st.createSchedule(), nukeDueAt: 30_000, raptorReadyAt: 61_000 };
  const twice = st.skewForPause(st.skewForPause(s, 10_000, 2_000), 20_000, 3_000);
  check('two-pauses-add-up', same(twice, st.skewForPause(s, 10_000, 5_000)), JSON.stringify(twice));
}
// Fake clock end to end: a missile due 4 s after the run's 20 s mark; pause at 21 s for 5 s.
{
  let now = 20_000;
  let s = { ...st.createSchedule(), missileDueAt: now + 4_000 };
  now = 21_000;
  const pausedAt = now;
  now = 26_000;
  s = st.skewForPause(s, pausedAt, now - pausedAt);
  check('resume-leaves-the-time-it-had-left', st.msUntil(s.missileDueAt, now) === 3_000, String(st.msUntil(s.missileDueAt, now)));
}
check('msUntil-never-negative', st.msUntil(100, 500) === 0 && st.msUntil(500, 100) === 400, '');
check('pending-is-strictly-ahead', st.pending(10, 9) && !st.pending(10, 10) && !st.pending(0, 5), '');

// Run: kills, hull, ending.
{
  let r = st.createRun();
  check('run-starts-clean', r.koScore === 0 && r.hitCount === 0 && !r.gameOver && r.pendingScore === null && r.runStartedAt === 0, JSON.stringify(r));
  r = st.beginRun(r, 1234);
  r = st.recordKill(st.recordKill(r));
  check('begin-and-kill', r.runStartedAt === 1234 && r.koScore === 2, JSON.stringify(r));

  const hit = st.takeHits(r, 3, 30);
  check('hits-land-on-hull-and-lifetime', hit.run.hitCount === 3 && hit.run.hitsTaken === 3 && hit.ends === null, JSON.stringify(hit));
  const healed = st.healOne(hit.run);
  check('heal-lowers-hull-not-lifetime', healed.hitCount === 2 && healed.hitsTaken === 3, JSON.stringify(healed));
  check('heal-at-zero-is-a-no-op', st.healOne(r) === r, '');
  check('junk-hit-counts-as-none', st.takeHits(r, -4, 30).run.hitCount === 0 && st.takeHits(r, NaN, 30).run.hitCount === 0, '');
  check('hull-full-ends-the-run', st.takeHits({ ...r, hitCount: 29 }, 1, 30).ends === 'hits', '');
  check('one-short-does-not', st.takeHits({ ...r, hitCount: 28 }, 1, 30).ends === null, '');
  check('a-nuke-ends-it-at-once', st.takeHits(r, 1, 30, true).ends === 'nuke', '');

  const over = st.endRun(hit.run, 'hits');
  check('end-locks-and-holds-the-score', over.gameOver && over.runStartedAt === 0
    && same(over.pendingScore, { score: 2, hits: 3, reason: 'hits' }), JSON.stringify(over));
  check('end-leaves-the-input-alone', !hit.run.gameOver && hit.run.pendingScore === null, '');

  const reset = st.resetScore(st.setEndReason(over, 'quit'));
  check('reset-zeroes-score-and-hull', reset.koScore === 0 && reset.hitCount === 0 && reset.hitsTaken === 0
    && !reset.gameOver && reset.pendingScore === null, JSON.stringify(reset));
  check('reset-keeps-the-panel-reason', reset.endReason === 'quit', '');
  check('clear-pending-and-game-over', st.clearPendingScore(over).pendingScore === null && !st.clearGameOver(over).gameOver, '');
  check('stop-clock', st.stopClock(st.beginRun(r, 9)).runStartedAt === 0, '');
}

console.log(failed ? `STATE-FAIL ${failed}` : 'STATE-OK');
process.exit(failed ? 1 : 0);
