// What a drone's aim costs: a fresh aim searches its lead planning arc coarse
// to fine (a 12-step grid of angle and power, then the 6-step neighbours of its
// best), every other arc but a roller's follows the lead's best angle and seeks
// only the power (12, 6, 3, 1 either side, then FOLLOW_ANGLE the same way when
// that is short), and a bracket correction searches coarse to fine around the
// last aim (6, then 3, then 1). Room drones aim on the server, so these are counts of planning
// flights, the whole of a turn's cost.
// test/ai-hitrate.test.ts holds the aim's quality; protocol/sim-vectors.json
// holds server/ai.php to the same search.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { buildArsenal, flightKey, mulberry32 } from '../src/sim.ts';
import { LOB_ANGLE, aiChoose, arcGuns, earthOps } from '../src/ai.ts';
import type { Ammo, Bracket, FallRules, Gear, Tank, Weapon, World } from '../src/sim.ts';
import { rackOf } from './rack.ts';

function must<T>(v: T | null | undefined, what: string): T {
  assert.ok(v !== null && v !== undefined, `${what} is missing`);
  return v;
}
function nth<T>(list: readonly T[], i: number): T {
  return must(list[i], `item ${i}`);
}

const GAME: { arsenal: { ammo: Weapon[]; gear?: Gear[]; fall?: Partial<FallRules> } } = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'game.json'), 'utf8'));
const arsenal = must(buildArsenal(GAME.arsenal), 'the arsenal');
const row = (k: string): Readonly<Weapon> => must(arsenal.weapons[k], `the ${k} row`);

// The grids: coarse angles 25, 37, ... 145 and powers 20, 32, ... 92; then the
// eight 6-step neighbours of the coarse best.
const COARSE = 11 * 7;
const FINE = 8;
/** A follower arc's most flights: its start and two either side per step, at two angles. */
const FOLLOW = 2 * (1 + 2 * 4);
/** The most ground predictions one drone turn may make (server/ai.php room_ai_earth_ops, test/php/AiArcsTest.php: the same). */
const GROUND_BUDGET = 240;
const BRACKET = 1 + 5 * 7 + 8 + 8; // the last shot measured, then 6-, 3- and 1-step grids

/* One drone turn on flat ground; how many planning flights each gun flew.
   A flight is simShot reading the wind (aiChoose never does) after looking
   its gun up, so how often aiChoose itself looks a gun up does not count. */
function turn({ s = 'hunter', ammo = {}, brk, targetX = 560, wind = 0 }: { s?: string; ammo?: Ammo; brk?: Bracket; targetX?: number; wind?: number } = {}) {
  const flown: Record<string, number> = {};
  let gun: string | null = null;
  const weapons = new Proxy(arsenal.weapons, {
    get(t, k) {
      if (typeof k === 'string' && k in t) gun = k;
      return Reflect.get(t, k);
    },
  });
  const drone: Tank = { id: 'D', isPlayer: false, x: 120, y: 400, hp: 100, angle: 45, power: 50, dirS: 1, fuel: 80, vy: 0, ammo, s, brk };
  const human: Tank = { id: 'P', isPlayer: true, x: targetX, y: 400, hp: 100, angle: 45, power: 50, dirS: -1, fuel: 80, vy: 0, ammo: {} };
  const G = new Proxy({ tanks: [drone, human], terrain: Array(720).fill(400), wind, round: 1, difficulty: 'normal', score: 0, jammer: 0,
    rng: mulberry32(7) } as World, { // a drone's turn reads none of the rest
    get(t, k) {
      if (k === 'wind' && gun !== null) {
        flown[gun] = (flown[gun] || 0) + 1;
        gun = null;
      }
      return Reflect.get(t, k);
    },
  });
  const choice = aiChoose(G, { ...arsenal, weapons }, drone);
  return { flown, choice };
}

test('a fresh aim flies a coarse grid and the fine neighbours of its best on its lead arc', () => {
  const { flown } = turn();
  assert.ok(Number(flown.shell) > COARSE && Number(flown.shell) <= COARSE + FINE, `shell ${flown.shell}`);
});

test('every other arc follows the lead\'s best angle, seeking only the power', () => {
  // Guns whose drag or speed gives them arcs of their own, and one that shares the shell's.
  const own = ['buck', 'heavy', 'needle', 'nuke'].filter(k => flightKey(row(k)) !== flightKey(row('shell')));
  const twin = GAME.arsenal.ammo.find(a => a.key !== 'shell' && flightKey(row(a.key)) === flightKey(row('shell')));
  assert.ok(own.length >= 3 && twin, 'the arsenal has guns with arcs of their own, and one that shares the shell\'s');
  const { flown } = turn({ ammo: Object.fromEntries([...own, twin.key].map(k => [k, 2])) });
  assert.ok(Number(flown.shell) > COARSE && Number(flown.shell) <= COARSE + FINE, `shell ${flown.shell}`);
  for (const k of own) assert.ok(Number(flown[k]) >= 5 && Number(flown[k]) <= FOLLOW, `${k} ${flown[k]}`);
  assert.equal(flown[twin.key], undefined, `${twin.key} flies the shell's arc`);
});

test('a full round-9 rack searches every arc, rollers on a coarser grid, inside a fixed budget', () => {
  const ammo = Object.fromEntries(Object.entries(rackOf(arsenal)).filter(([k]) => k !== 'shell'));
  const plan = arcGuns(arsenal, ['shell', ...Object.keys(ammo)]);
  const rollers = plan.filter(k => row(k).effect === 'roller');
  assert.ok(rollers.length >= 3, plan.join());
  for (const s of ['hunter', 'glory', 'sniper']) {
    const { flown, choice } = turn({ s, ammo });
    for (const k of plan) {
      const n = flown[k] || 0;
      // A roller arc: a 24-step grid (6 x 4), then two narrowing passes only when it beats the best so far.
      if (rollers.includes(k)) assert.ok(n >= 24 && n <= 24 + 2 * FINE, `${s} ${k}: ${n}`);
      else if (k === plan[0]) assert.ok(n >= COARSE && n <= COARSE + FINE, `${s} ${k}: ${n}`);
      else assert.ok(n >= 5 && n <= FOLLOW, `${s} ${k}: ${n}`);
    }
    const total = Object.values(flown).reduce((a, b) => a + b, 0);
    assert.ok(total <= 440, `${s}: ${total} flights, ${JSON.stringify(flown)} (test/php/AiArcsTest.php holds the server to the same 440)`);
    assert.ok(choice.wkey === 'shell' || Number(ammo[choice.wkey]) > 0, choice.wkey);
  }
  // Ground predictions (earthHarm) beside the flights: a digger is weighed only at aims within its burrow of the target.
  for (const s of ['hunter', 'glory', 'lobber', 'sniper']) {
    for (const targetX of [300, 560]) {
      const ops0 = earthOps();
      turn({ s, ammo, targetX });
      assert.ok(earthOps() - ops0 <= GROUND_BUDGET, `${s} at ${targetX}: ${earthOps() - ops0} ground predictions (test/php/AiArcsTest.php holds the server to the same ${GROUND_BUDGET})`);
    }
  }
});

test('a lobber searches the high arcs coarse to fine', () => {
  const { flown } = turn({ s: 'lobber', ammo: { cluster: 2 } });
  const high = Math.ceil((156 - (25 + 6 * Math.ceil((LOB_ANGLE + 1 - 25) / 6))) / 12);
  // area guns only (cluster); flat arcs only when no high one lands near
  assert.ok(Number(flown.cluster) <= high * 7 + FINE + 3 * 7 + FINE, `cluster flown ${flown.cluster}`);
  assert.ok(Number(flown.cluster) >= high * 7 + FINE - 3, `cluster flown ${flown.cluster}`); // fine neighbours past the grid's edge are skipped
  assert.deepEqual(Object.keys(flown), ['cluster']);
});

test('a bracket correction searches coarse to fine around the last aim', () => {
  const brk: Bracket = { t: 1, a: 50, p: 60, w: 'shell', n: 1, tx: 560, ox: 120, land: 540 };
  const { flown, choice } = turn({ brk, s: 'bully' });
  assert.equal(flown.shell, BRACKET);
  assert.equal(choice.wkey, 'shell');
});
