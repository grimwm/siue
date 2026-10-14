// The run's numbers: difficulty, caps, delays, waves, hull tint, volume curve.
// src/rules.ts is
// pure, so every value is checked against a hand-worked figure with a fixed
// random source; no browser is involved.
import * as rules from '../src/rules.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const near = (a: number, b: number, eps = 1e-9) => Math.abs(a - b) <= eps;
const fixed = (v: number) => () => v;
/** A random source that replays a list, then fails loudly if asked for more. */
const replay = (...vs: number[]) => () => {
  const v = vs.shift();
  if (v === undefined) throw new Error('rng asked for more values than the test gave');
  return v;
};

// Levels: one per BOT_CAP_PER_KOS kills.
await test('level-0-until-five', () => { assert.ok(rules.killLevel(0) === 0 && rules.killLevel(4) === 0, ''); });
await test('level-steps-every-five', () => { assert.ok(rules.killLevel(5) === 1 && rules.killLevel(14) === 2 && rules.killLevel(50) === 10, ''); });

// Drone cap climbs with kills and stops at the device's hard cap.
await test('bot-cap-starts-at-four', () => { assert.ok(rules.botCap(0, 30) === 4, String(rules.botCap(0, 30))); });
await test('bot-cap-adds-one-per-five-kos', () => { assert.ok(rules.botCap(5, 30) === 5 && rules.botCap(49, 30) === 13, ''); });
await test('bot-cap-stops-at-the-hard-cap', () => { assert.ok(rules.botCap(500, 30) === 30 && rules.botCap(500, 10) === 10, ''); });

// Missile caps: ground 1,1,2,2,3,3,4,4,5 and tracker 1,1,1,2,2,2,2,3.
const ground = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 20].map(l => rules.groundMissileCap(l * 5));
await test('ground-cap-ladder', () => { assert.ok(JSON.stringify(ground) === '[1,1,2,2,3,3,4,4,5,5,5]', JSON.stringify(ground)); });
const tracker = [0, 1, 2, 3, 4, 5, 6, 7, 8, 30].map(l => rules.trackerMissileCap(l * 5));
await test('tracker-cap-ladder', () => { assert.ok(JSON.stringify(tracker) === '[1,1,1,2,2,2,2,3,3,3]', JSON.stringify(tracker)); });
await test('tracker-chance-starts-at-base', () => { assert.ok(near(rules.trackerMissileChance(0), 0.14), String(rules.trackerMissileChance(0))); });
await test('tracker-chance-grows-and-caps', () => { assert.ok(near(rules.trackerMissileChance(25), 0.24) && near(rules.trackerMissileChance(500), 0.34), ''); });

// Difficulty: nothing before a run starts, then the kill ladder with time as a backstop.
await test('difficulty-is-zero-before-a-run', () => { assert.ok(rules.difficultyFactor(40, 0, 1e9) === 0, ''); });
await test('difficulty-time-alone', () => { assert.ok(near(rules.difficultyFactor(0, 1, 1 + 3.5 * 60000), 0.25), String(rules.difficultyFactor(0, 1, 1 + 3.5 * 60000))); });
await test('difficulty-level-alone', () => { assert.ok(near(rules.difficultyFactor(25, 1000, 1000), 0.375), String(rules.difficultyFactor(25, 1000, 1000))); });
await test('difficulty-never-passes-one', () => { assert.ok(rules.difficultyFactor(500, 1, 1e12) === 1, ''); });

// Delays: lerped windows around a fixed centre; the random value places the draw inside.
await test('missile-delay-at-level-0-mid', () => { assert.ok(near(rules.nextMissileDelayMs(0, fixed(0.5)), 8500), String(rules.nextMissileDelayMs(0, fixed(0.5)))); });
await test('missile-delay-at-level-0-low', () => { assert.ok(near(rules.nextMissileDelayMs(0, fixed(0)), 7100), ''); });
await test('missile-delay-at-level-10-mid', () => { assert.ok(near(rules.nextMissileDelayMs(50, fixed(0.5)), 3400), ''); });
await test('missile-delay-at-the-top-level-low', () => { assert.ok(near(rules.nextMissileDelayMs(100, fixed(0)), 2600), String(rules.nextMissileDelayMs(100, fixed(0)))); });
await test('nuke-delay-easy-and-hard', () => { assert.ok(near(rules.nextNukeDelayMs(0, fixed(0.5)), 32500) && near(rules.nextNukeDelayMs(1, fixed(0.5)), 24000), ''); });
await test('nuke-delay-spans-the-window', () => { assert.ok(near(rules.nextNukeDelayMs(0, fixed(0)), 25000) && near(rules.nextNukeDelayMs(0, fixed(1)), 40000), ''); });

// A wave: the first draw decides wave or lone drone, the second sizes the wave.
await test('lone-drone', () => { assert.ok(JSON.stringify(rules.planWave(4, 4, replay(0.9))) === '{"isWave":false,"count":1}', ''); });
await test('wave-of-two-when-the-draw-is-low', () => { assert.ok(JSON.stringify(rules.planWave(4, 4, replay(0.1, 0))) === '{"isWave":true,"count":2}', ''); });
await test('wave-never-exceeds-the-room', () => { assert.ok(rules.planWave(2, 30, replay(0, 0.99)).count === 2, ''); });
await test('wave-batch-caps-at-four', () => { assert.ok(rules.planWave(30, 30, replay(0, 0.999)).count === 4, String(rules.planWave(30, 30, replay(0, 0.999)).count)); });

// Hull points and tint.
await test('hp-counts-down-from-thirty', () => { assert.ok(rules.currentHp(0) === 30 && rules.currentHp(12) === 18 && rules.currentHp(99) === 0, ''); });
await test('tint-full-is-green', () => { assert.ok(rules.hpTint(30).color === 'rgb(125, 255, 154)', rules.hpTint(30).color); });
await test('tint-half-is-yellow', () => { assert.ok(rules.hpTint(15).color === 'rgb(255, 210, 74)', rules.hpTint(15).color); });
await test('tint-empty-is-red', () => { assert.ok(rules.hpTint(0).color === 'rgb(255, 72, 72)' && rules.hpTint(-5).color === 'rgb(255, 72, 72)', ''); });
await test('tint-glow-shares-the-colour', () => { assert.ok(rules.hpTint(0).glow === 'rgba(255, 72, 72, 0.55)', rules.hpTint(0).glow); });

// Volume curves.
await test('sfx-50-is-the-former-default', () => { assert.ok(near(rules.volumeToGain(50), 0.85 * 0.85), String(rules.volumeToGain(50))); });
await test('sfx-100-is-full', () => { assert.ok(near(rules.volumeToGain(100), 1) && rules.volumeToGain(0) === 0, ''); });
await test('music-50-is-1.25', () => { assert.ok(near(rules.volumeToGain(50, 'music'), 1.25) && near(rules.volumeToGain(100, 'music'), 2.5), ''); });
await test('volume-clamps-and-survives-garbage', () => {
  // @ts-expect-error a string volume is the garbage this test feeds in on purpose
  const garbage = rules.volumeToGain('x');
  assert.ok(rules.volumeToGain(250) === 1 && garbage === 0 && rules.volumeToGain(-4, 'music') === 0, '');
});
