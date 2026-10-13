// What a drone's aim costs: a fresh aim searches each planning arc coarse to
// fine (a 12-step grid of angle and power, then the 6-step neighbours of its
// best), and a bracket correction does the same around the last aim (6, then
// 3, then 1). The server replays every drone turn of a solo round inside a CPU
// budget, so these are counts of planning flights, the whole of a turn's cost.
// test/ai-hitrate.test.mjs holds the aim's quality; protocol/sim-vectors.json
// holds server/ai.php to the same search.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { buildArsenal, mulberry32 } from '../src/sim.ts';
import { LOB_ANGLE, aiChoose } from '../src/ai.ts';

const GAME = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'game.json'), 'utf8'));
const arsenal = buildArsenal(GAME.arsenal);

// The grids: coarse angles 25, 37, ... 145 and powers 20, 32, ... 92; then the
// eight 6-step neighbours of the coarse best.
const COARSE = 11 * 7;
const FINE = 8;
const BRACKET = 1 + 5 * 7 + 8 + 8; // the last shot measured, then 6-, 3- and 1-step grids

/* One drone turn on flat ground; how many planning flights each gun flew.
   A flight is simShot reading the wind (aiChoose never does) after looking
   its gun up, so how often aiChoose itself looks a gun up does not count. */
function turn({ s = 'hunter', ammo = {}, brk, targetX = 560, wind = 0 } = {}) {
  const flown = {};
  let gun = null;
  const weapons = new Proxy(arsenal.weapons, {
    get(t, k) {
      if (typeof k === 'string' && k in t) gun = k;
      return t[k];
    },
  });
  const drone = { id: 'D', isPlayer: false, x: 120, y: 400, hp: 100, angle: 45, power: 50, dirS: 1, fuel: 80, vy: 0, ammo, s, brk };
  const human = { id: 'P', isPlayer: true, x: targetX, y: 400, hp: 100, angle: 45, power: 50, dirS: -1, fuel: 80, vy: 0, ammo: {} };
  const G = new Proxy({ tanks: [drone, human], terrain: Array(720).fill(400), wind, round: 1, difficulty: 'normal', score: 0, jammer: 0,
    rng: mulberry32(7) }, {
    get(t, k) {
      if (k === 'wind' && gun !== null) {
        flown[gun] = (flown[gun] || 0) + 1;
        gun = null;
      }
      return t[k];
    },
  });
  const choice = aiChoose(G, { ...arsenal, weapons }, drone);
  return { flown, choice };
}

test('a fresh aim flies a coarse grid and the fine neighbours of its best, per arc', () => {
  const { flown } = turn();
  assert.equal(flown.shell, COARSE + FINE);
});

test('a fresh aim searches each distinct arc the same way', () => {
  const { flown } = turn({ ammo: { buck: 2, heavy: 2, needle: 2 } });
  assert.equal(flown.shell, COARSE + FINE);
  assert.equal(flown.heavy, COARSE + FINE);
  assert.equal(flown.needle, COARSE + FINE);
  assert.equal(flown.buck, undefined, 'buck flies the shell\'s arc');
});

test('a lobber searches the high arcs coarse to fine', () => {
  const { flown } = turn({ s: 'lobber', ammo: { cluster: 2 } });
  const high = Math.ceil((156 - (25 + 6 * Math.ceil((LOB_ANGLE + 1 - 25) / 6))) / 12);
  // area guns only (cluster); flat arcs only when no high one lands near
  assert.ok(flown.cluster <= high * 7 + FINE + 3 * 7 + FINE, `cluster flown ${flown.cluster}`);
  assert.ok(flown.cluster >= high * 7 + FINE - 3, `cluster flown ${flown.cluster}`); // fine neighbours past the grid's edge are skipped
  assert.deepEqual(Object.keys(flown), ['cluster']);
});

test('a bracket correction searches coarse to fine around the last aim', () => {
  const brk = { t: 1, a: 50, p: 60, w: 'shell', n: 1, tx: 560, ox: 120, land: 540 };
  const { flown, choice } = turn({ brk, s: 'bully' });
  assert.equal(flown.shell, BRACKET);
  assert.equal(choice.wkey, 'shell');
});
