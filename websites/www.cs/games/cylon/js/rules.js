/* Cylon Defense: the numbers behind a run.
 *
 * How hard the game gets as the player scores: the kill level, how many
 * drones may be out at once, how many missiles of each kind, how long until
 * the next missile or nuke, how big a wave is, plus the hull-point tint and
 * the volume curve. Pure functions of the score, the clock and a random
 * source, so they compile in the DOM-free program and rules-test.js pins
 * them. cylon.js owns the state (the score, the timers) and passes it in. */
/** Hull points the player starts with. */
export const MAX_HITS = 30;
/** Drones allowed at the start, and one more for every this-many kills. */
export const BOT_CAP_START = 4;
export const BOT_CAP_PER_KOS = 5;
export const MISSILE_TRACKER_CHANCE_BASE = 0.14;
export const MISSILE_TRACKER_CAP_MAX = 3;
export const MISSILE_GROUND_CAP_MAX = 5;
export function lerp(a, b, t) {
    return a + (b - a) * Math.min(1, Math.max(0, t));
}
/** Same rung as bot capacity: every BOT_CAP_PER_KOS kills is a new level. */
export function killLevel(koScore) {
    return Math.floor(koScore / BOT_CAP_PER_KOS);
}
/**
 * 0 at the start of a run, 1 at full pressure. Prefers the 5-KO ladder; time
 * is a light backstop if KOs stall. 0 before a run has started.
 */
export function difficultyFactor(koScore, runStartedAt, now) {
    if (!runStartedAt)
        return 0;
    const elapsedMin = (now - runStartedAt) / 60000;
    const timePart = Math.min(1, elapsedMin / 3.5);
    const levelPart = Math.min(1, killLevel(koScore) / 10);
    return Math.min(1, levelPart * 0.75 + timePart * 0.25);
}
/** Milliseconds to the next small missile: a gentle cadence climb with kill level. */
export function nextMissileDelayMs(koScore, rng) {
    const t = Math.min(1, killLevel(koScore) / 10);
    const lo = lerp(8500, 3400, t);
    const span = lerp(2800, 1600, t);
    return Math.max(2400, lo - span / 2 + rng() * span);
}
/** Milliseconds to the next nuke, from the difficulty factor. */
export function nextNukeDelayMs(difficulty, rng) {
    const lo = lerp(32500, 24000, difficulty);
    const span = lerp(15000, 12000, difficulty);
    return lo - span / 2 + rng() * span;
}
/** L0-1: 1 - L2-3: 2 - L4-5: 3 - L6-7: 4 - L8+: 5 */
export function groundMissileCap(koScore) {
    return Math.min(MISSILE_GROUND_CAP_MAX, 1 + Math.floor(killLevel(koScore) / 2));
}
/** L0-2: 1 - L3-6: 2 - L7+: 3 */
export function trackerMissileCap(koScore) {
    const lvl = killLevel(koScore);
    if (lvl < 3)
        return 1;
    if (lvl < 7)
        return 2;
    return Math.min(MISSILE_TRACKER_CAP_MAX, 3);
}
export function trackerMissileChance(koScore) {
    return Math.min(0.34, MISSILE_TRACKER_CHANCE_BASE + killLevel(koScore) * 0.02);
}
/** How many drones may be out at once. */
export function botCap(koScore, hardCap) {
    return Math.min(hardCap, BOT_CAP_START + Math.floor(koScore / BOT_CAP_PER_KOS));
}
/** `room` is the cap minus the drones already out (positive); `cap` is the cap. */
export function planWave(room, cap, rng) {
    const isWave = rng() < 0.55;
    const maxBatch = Math.min(room, Math.max(2, Math.min(4, Math.floor(cap / 3))));
    const count = isWave
        ? Math.min(room, 2 + Math.floor(rng() * Math.max(1, maxBatch - 1)))
        : 1;
    return { isWave, count };
}
/** Hull points left after `hitCount` hits. */
export function currentHp(hitCount) {
    return Math.max(0, MAX_HITS - hitCount);
}
/**
 * Smooth HP tint: green at full, yellow at half, red at empty.
 * t = hp / MAX in [0,1]. Piecewise RGB lerp on either side of 0.5:
 *   t >= 0.5: mix(yellow, green, (t-0.5)/0.5)
 *   t <  0.5: mix(red,    yellow, t/0.5)
 */
export function hpTint(hp) {
    const mix = (a, b, u) => Math.round(a + (b - a) * u);
    const mixRgb = (c0, c1, u) => ({
        r: mix(c0.r, c1.r, u),
        g: mix(c0.g, c1.g, u),
        b: mix(c0.b, c1.b, u),
    });
    const green = { r: 125, g: 255, b: 154 };
    const yellow = { r: 255, g: 210, b: 74 };
    const red = { r: 255, g: 72, b: 72 };
    const t = Math.max(0, Math.min(1, hp / MAX_HITS));
    const c = t >= 0.5
        ? mixRgb(yellow, green, (t - 0.5) / 0.5)
        : mixRgb(red, yellow, t / 0.5);
    return {
        color: `rgb(${c.r}, ${c.g}, ${c.b})`,
        glow: `rgba(${c.r}, ${c.g}, ${c.b}, 0.55)`,
    };
}
/** A settings slider (0-100) as a gain. The music bus and the effects bus have different curves. */
export function volumeToGain(pct, bus = 'sfx') {
    const t = Math.max(0, Math.min(100, Number(pct) || 0)) / 100;
    if (bus === 'music') {
        // UI 50% is the former max * 1.25; the slider sits at 50 by default
        return Math.min(2.5, (t / 0.5) * 1.25);
    }
    // SFX: UI 50 is the former default at 85 (0.85 squared); 100 still reaches full gain
    const internalPct = t <= 0.5
        ? (t / 0.5) * 85
        : 85 + ((t - 0.5) / 0.5) * 15;
    const u = internalPct / 100;
    return u * u;
}
