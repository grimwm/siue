// The drones plan one arc per flight, not one per gun: guns whose planning
// flights (simShot) are the same share one search. Which guns share is read
// from each gun's own flight fields (sim.ts flightKey), so a gun that is given
// a different speed, gravity or roll is planned on its own. server/ai.php has
// the same rule, checked by test/php/AiArcsTest.php.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { buildArsenal, flightKey, mulberry32, simShot } from '../src/sim.ts';
import { dsin } from '../src/detmath.ts';
import { aiChoose, arcGuns } from '../src/ai.ts';

const GAME = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'game.json'), 'utf8'));
const AMMO = GAME.arsenal.ammo;
const arsenal = buildArsenal(GAME.arsenal);
const withRow = (key, change) => buildArsenal({ ...GAME.arsenal, ammo: AMMO.map(a => a.key === key ? { ...a, ...change } : a) });

// Hilly ground and a crosswind, so a shot can land, roll, or fly off the board.
const world = { terrain: Array.from({ length: 720 }, (_, x) => 380 + 40 * dsin(x * 2 * Math.PI / 260)), wind: 3 };
const SHOTS = [];
for (const a of [30, 52, 75, 104, 140]) for (const p of [34, 61, 92]) for (const dirS of [1, -1]) SHOTS.push([a, p, dirS]);
const flights = (ars, wkey) => SHOTS.map(([a, p, dirS]) => simShot(world, ars, 360, 380, a, p, wkey, dirS));

test('guns that share a flight key fly the same planning arcs', () => {
  const keys = Object.keys(arsenal.weapons);
  for (const a of keys) {
    for (const b of keys) {
      if (a < b && flightKey(arsenal.weapons[a]) === flightKey(arsenal.weapons[b])) {
        assert.deepEqual(flights(arsenal, a), flights(arsenal, b), `${a} and ${b}`);
      }
    }
  }
});

test('a change to any field that bends a planning flight changes the flight key', () => {
  // Every plain field any gun carries, set on every gun to another value it can take.
  const fields = new Set(AMMO.flatMap(a => Object.keys(a)).filter(f => !['key', 'name', 'gfx', 'note'].includes(f)));
  let bending = 0;
  for (const row of AMMO) {
    for (const f of fields) {
      const seen = new Set(AMMO.map(a => a[f]).filter(v => v !== undefined && typeof v !== 'object'));
      const tries = [...seen];
      if (typeof row[f] === 'number') tries.push(row[f] * 1.37 + 0.11, row[f] * 0.2);
      if (typeof row[f] === 'boolean' || row[f] === undefined) tries.push(true, false);
      // A fresh value: a string field the flight reads while every gun holds the same value.
      if (typeof row[f] === 'string') tries.push(`${row[f]}~`);
      for (const v of tries) {
        if (v === row[f]) continue;
        const ars = withRow(row.key, { [f]: v });
        if (JSON.stringify(flights(ars, row.key)) === JSON.stringify(flights(arsenal, row.key))) continue;
        bending++;
        assert.notEqual(flightKey(ars.weapons[row.key]), flightKey(arsenal.weapons[row.key]),
          `${row.key}.${f} = ${JSON.stringify(v)} bends the flight but keeps its flight key`);
      }
    }
  }
  assert.ok(bending > 10, `the check saw ${bending} bending changes`);
});

test('the flight key holds every gun field the planning flight reads', () => {
  // Read-traced, so a field simShot starts reading fails here at the code edit, before any gun in game.yaml sets it.
  const reads = run => {
    const seen = new Set();
    run(w => new Proxy(w, { get(t, k) { if (typeof k === 'string') seen.add(k); return t[k]; } }));
    return seen;
  };
  let checked = 0;
  for (const [k, w] of Object.entries(arsenal.weapons)) {
    for (const def of [w, { ...w, effect: 'roller' }]) {
      const keyed = reads(spy => flightKey(spy(def)));
      const flown = reads(spy => {
        const ars = { ...arsenal, weapons: { ...arsenal.weapons, [k]: spy(def) } };
        for (const [a, p, dirS] of SHOTS) simShot(world, ars, 360, 380, a, p, k, dirS);
      });
      assert.ok(flown.size > 0, `simShot read nothing of ${k}`);
      for (const f of flown) assert.ok(keyed.has(f), `simShot reads ${k}.${f}, which flightKey leaves out`);
      checked++;
    }
  }
  assert.ok(checked >= 2 * AMMO.length);
});

test('a gun plans once per distinct arc, the first gun of each in rack order', () => {
  const rack = AMMO.filter(a => a.ai).map(a => a.key);
  const plan = arcGuns(arsenal, rack);
  assert.equal(plan.length, new Set(rack.map(k => flightKey(arsenal.weapons[k]))).size);
  assert.equal(plan[0], 'shell');
  for (const k of rack) {
    const first = rack.find(o => flightKey(arsenal.weapons[o]) === flightKey(arsenal.weapons[k]));
    assert.equal(plan.includes(k), first === k, k);
  }
  assert.deepEqual(plan, [...plan].sort((a, b) => rack.indexOf(a) - rack.indexOf(b)));
});

test('a gun given its own arc is planned on its own; one with the same flight shares', () => {
  const rack = ['shell', 'buck', 'mortar'];
  assert.deepEqual(arcGuns(arsenal, rack), ['shell']);
  for (const change of [{ speed: 1.2 }, { flat: true }, { effect: 'roller', friction: 0.6, rollTime: 8 }]) {
    assert.deepEqual(arcGuns(withRow('buck', change), rack), ['shell', 'buck'], JSON.stringify(change));
  }
  // A gun that hurts differently but flies the same is still one plan.
  assert.deepEqual(arcGuns(withRow('buck', { dmg: 99, radius: 60, effect: 'cluster' }), rack), ['shell']);
});

/* How often each gun's planning flight is flown on one drone turn: every
   flight reads its gun's speed (weighing a gun's harm does not). */
function flownPerGun(ars) {
  const flown = {};
  const weapons = Object.fromEntries(Object.entries(ars.weapons).map(([key, row]) => [key, new Proxy(row, {
    get(t, f) {
      if (f === 'speed') flown[key] = (flown[key] || 0) + 1;
      return t[f];
    },
  })]));
  const drone = { id: 'D', isPlayer: false, x: 120, y: 400, hp: 100, angle: 45, power: 50, dirS: 1, fuel: 80, vy: 0,
    ammo: { buck: 2, mortar: 2 }, s: 'hunter' };
  const human = { id: 'P', isPlayer: true, x: 560, y: 400, hp: 100, angle: 45, power: 50, dirS: -1, fuel: 80, vy: 0, ammo: {} };
  const G = { tanks: [drone, human], terrain: Array(720).fill(400), wind: 0, round: 1, difficulty: 'normal', score: 0,
    jammer: 0, rng: mulberry32(7) };
  aiChoose(G, { ...ars, weapons }, drone);
  return flown;
}

test('a drone flies the planning search for a gun with its own arc, and not for one that shares the shell\'s', () => {
  const same = flownPerGun(arsenal);
  assert.ok(same.shell > 50, `shell flown ${same.shell}`);
  assert.ok((same.buck || 0) < 5, `buck flown ${same.buck}`);
  const own = flownPerGun(withRow('buck', { speed: 1.2 }));
  assert.ok(own.buck > 50, `buck with its own arc flown ${own.buck}`);
  assert.ok((own.mortar || 0) < 5, `mortar flown ${own.mortar}`);
});
