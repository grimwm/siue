/* Cylon Defense: the run's state, as plain data and pure transitions.
 *
 * Two records. A Schedule holds every moment the game is waiting for (the next
 * missile, the next nuke, the next heal, the ability cooldowns, the end of the
 * eye's disorientation) as epoch milliseconds, 0 for "not armed". A RunState
 * holds the run itself: kills, hull hits, when it began, whether it is over.
 * Neither holds a timer handle or an element, so both compile in the DOM-free
 * program and state-test.js drives them with a fake clock. cylon.js owns the
 * setTimeout handles and the page; it keeps one of each record and replaces it
 * with what a transition here returns. A module in js/ imports nothing, so the
 * hull limit comes in as an argument. */
export function createSchedule() {
    return {
        missileDueAt: 0,
        nukeDueAt: 0,
        healDueAt: 0,
        grenadeReadyAt: 0,
        raptorReadyAt: 0,
        eyeDisorientedUntil: 0,
    };
}
/**
 * The schedule after the game sat paused for `pausedMs`, having paused at
 * `pausedAt`: every moment still ahead of the pause moves out by the pause, so
 * time spent paused is not spent waiting. Unarmed (0) and already-past moments
 * stay as they are.
 */
export function skewForPause(schedule, pausedAt, pausedMs) {
    if (pausedMs <= 0)
        return schedule;
    const shift = (at) => (at > pausedAt ? at + pausedMs : at);
    return {
        missileDueAt: shift(schedule.missileDueAt),
        nukeDueAt: shift(schedule.nukeDueAt),
        healDueAt: shift(schedule.healDueAt),
        grenadeReadyAt: shift(schedule.grenadeReadyAt),
        raptorReadyAt: shift(schedule.raptorReadyAt),
        eyeDisorientedUntil: shift(schedule.eyeDisorientedUntil),
    };
}
/** Milliseconds from `now` until `dueAt`, never negative: the delay to hand setTimeout. */
export function msUntil(dueAt, now) {
    return Math.max(0, dueAt - now);
}
/** True while the moment lies ahead of `now` (a cooldown or a disorientation still running). */
export function pending(dueAt, now) {
    return now < dueAt;
}
export function createRun() {
    return {
        koScore: 0,
        hitCount: 0,
        hitsTaken: 0,
        runStartedAt: 0,
        gameOver: false,
        endReason: null,
        pendingScore: null,
    };
}
/** Zero the kills and the hull for a new run; the clock and the panel's reason are left alone. */
export function resetScore(run) {
    return { ...run, koScore: 0, hitCount: 0, hitsTaken: 0, gameOver: false, pendingScore: null };
}
export function recordKill(run) {
    return { ...run, koScore: run.koScore + 1 };
}
export function beginRun(run, now) {
    return { ...run, runStartedAt: now };
}
export function stopClock(run) {
    return run.runStartedAt === 0 ? run : { ...run, runStartedAt: 0 };
}
/**
 * The hull takes `count` hits (junk and negatives count as none). A nuke ends
 * the run at once; otherwise it ends when the hull reaches `maxHits`.
 */
export function takeHits(run, count, maxHits, fromNuke = false) {
    const n = Math.max(0, Number(count) || 0);
    const next = { ...run, hitCount: run.hitCount + n, hitsTaken: run.hitsTaken + n };
    const ends = fromNuke ? 'nuke' : next.hitCount >= maxHits ? 'hits' : null;
    return { run: next, ends };
}
/** One hit comes off the hull. Unchanged when there is none to heal. */
export function healOne(run) {
    return run.hitCount > 0 ? { ...run, hitCount: run.hitCount - 1 } : run;
}
/** The run is over: lock it, stop its clock, and hold its score for the board. */
export function endRun(run, reason) {
    return {
        ...run,
        gameOver: true,
        runStartedAt: 0,
        pendingScore: { score: run.koScore, hits: run.hitsTaken, reason },
    };
}
export function setEndReason(run, reason) {
    return { ...run, endReason: reason };
}
export function clearPendingScore(run) {
    return run.pendingScore === null ? run : { ...run, pendingScore: null };
}
export function clearGameOver(run) {
    return run.gameOver ? { ...run, gameOver: false } : run;
}
