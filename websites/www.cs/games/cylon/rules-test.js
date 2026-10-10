// The run's numbers: difficulty, caps, delays, waves, hull tint, volume curve.
// Run here: `node rules-test.js`. js/rules.js (compiled from src/rules.ts) is
// pure, so every value is checked against a hand-worked figure with a fixed
// random source; no browser is involved.
import * as rules from './js/rules.js';

let failed = 0;
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${ok ? '' : ` :: ${detail}`}`);
  if (!ok) failed++;
};
const near = (a, b, eps = 1e-9) => Math.abs(a - b) <= eps;
const fixed = v => () => v;
/** A random source that replays a list, then fails loudly if asked for more. */
const replay = (...vs) => () => {
  if (!vs.length) throw new Error('rng asked for more values than the test gave');
  return vs.shift();
};

// Levels: one per BOT_CAP_PER_KOS kills.
check('level-0-until-five', rules.killLevel(0) === 0 && rules.killLevel(4) === 0, '');
check('level-steps-every-five', rules.killLevel(5) === 1 && rules.killLevel(14) === 2 && rules.killLevel(50) === 10, '');

// Drone cap climbs with kills and stops at the device's hard cap.
check('bot-cap-starts-at-four', rules.botCap(0, 30) === 4, rules.botCap(0, 30));
check('bot-cap-adds-one-per-five-kos', rules.botCap(5, 30) === 5 && rules.botCap(49, 30) === 13, '');
check('bot-cap-stops-at-the-hard-cap', rules.botCap(500, 30) === 30 && rules.botCap(500, 10) === 10, '');

// Missile caps: ground 1,1,2,2,3,3,4,4,5 and tracker 1,1,1,2,2,2,2,3.
const ground = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 20].map(l => rules.groundMissileCap(l * 5));
check('ground-cap-ladder', JSON.stringify(ground) === '[1,1,2,2,3,3,4,4,5,5,5]', JSON.stringify(ground));
const tracker = [0, 1, 2, 3, 4, 5, 6, 7, 8, 30].map(l => rules.trackerMissileCap(l * 5));
check('tracker-cap-ladder', JSON.stringify(tracker) === '[1,1,1,2,2,2,2,3,3,3]', JSON.stringify(tracker));
check('tracker-chance-starts-at-base', near(rules.trackerMissileChance(0), 0.14), rules.trackerMissileChance(0));
check('tracker-chance-grows-and-caps', near(rules.trackerMissileChance(25), 0.24) && near(rules.trackerMissileChance(500), 0.34), '');

// Difficulty: nothing before a run starts, then the kill ladder with time as a backstop.
check('difficulty-is-zero-before-a-run', rules.difficultyFactor(40, 0, 1e9) === 0, '');
check('difficulty-time-alone', near(rules.difficultyFactor(0, 1, 1 + 3.5 * 60000), 0.25), rules.difficultyFactor(0, 1, 1 + 3.5 * 60000));
check('difficulty-level-alone', near(rules.difficultyFactor(25, 1000, 1000), 0.375), rules.difficultyFactor(25, 1000, 1000));
check('difficulty-never-passes-one', rules.difficultyFactor(500, 1, 1e12) === 1, '');

// Delays: lerped windows around a fixed centre; the random value places the draw inside.
check('missile-delay-at-level-0-mid', near(rules.nextMissileDelayMs(0, fixed(0.5)), 8500), rules.nextMissileDelayMs(0, fixed(0.5)));
check('missile-delay-at-level-0-low', near(rules.nextMissileDelayMs(0, fixed(0)), 7100), '');
check('missile-delay-at-level-10-mid', near(rules.nextMissileDelayMs(50, fixed(0.5)), 3400), '');
check('missile-delay-at-the-top-level-low', near(rules.nextMissileDelayMs(100, fixed(0)), 2600), rules.nextMissileDelayMs(100, fixed(0)));
check('nuke-delay-easy-and-hard', near(rules.nextNukeDelayMs(0, fixed(0.5)), 32500) && near(rules.nextNukeDelayMs(1, fixed(0.5)), 24000), '');
check('nuke-delay-spans-the-window', near(rules.nextNukeDelayMs(0, fixed(0)), 25000) && near(rules.nextNukeDelayMs(0, fixed(1)), 40000), '');

// A wave: the first draw decides wave or lone drone, the second sizes the wave.
check('lone-drone', JSON.stringify(rules.planWave(4, 4, replay(0.9))) === '{"isWave":false,"count":1}', '');
check('wave-of-two-when-the-draw-is-low', JSON.stringify(rules.planWave(4, 4, replay(0.1, 0))) === '{"isWave":true,"count":2}', '');
check('wave-never-exceeds-the-room', rules.planWave(2, 30, replay(0, 0.99)).count === 2, '');
check('wave-batch-caps-at-four', rules.planWave(30, 30, replay(0, 0.999)).count === 4, rules.planWave(30, 30, replay(0, 0.999)).count);

// Hull points and tint.
check('hp-counts-down-from-thirty', rules.currentHp(0) === 30 && rules.currentHp(12) === 18 && rules.currentHp(99) === 0, '');
check('tint-full-is-green', rules.hpTint(30).color === 'rgb(125, 255, 154)', rules.hpTint(30).color);
check('tint-half-is-yellow', rules.hpTint(15).color === 'rgb(255, 210, 74)', rules.hpTint(15).color);
check('tint-empty-is-red', rules.hpTint(0).color === 'rgb(255, 72, 72)' && rules.hpTint(-5).color === 'rgb(255, 72, 72)', '');
check('tint-glow-shares-the-colour', rules.hpTint(0).glow === 'rgba(255, 72, 72, 0.55)', rules.hpTint(0).glow);

// Volume curves.
check('sfx-50-is-the-former-default', near(rules.volumeToGain(50), 0.85 * 0.85), rules.volumeToGain(50));
check('sfx-100-is-full', near(rules.volumeToGain(100), 1) && rules.volumeToGain(0) === 0, '');
check('music-50-is-1.25', near(rules.volumeToGain(50, 'music'), 1.25) && near(rules.volumeToGain(100, 'music'), 2.5), '');
check('volume-clamps-and-survives-garbage', rules.volumeToGain(250) === 1 && rules.volumeToGain('x') === 0 && rules.volumeToGain(-4, 'music') === 0, '');

console.log(failed ? `RULES-FAIL ${failed}` : 'RULES-OK');
process.exit(failed ? 1 : 0);
