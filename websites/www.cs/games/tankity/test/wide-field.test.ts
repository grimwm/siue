// games/tankity/test/wide-field.test.ts
// The sim at any width (spec 6.6): a wide field is the 720 field's hills
// continued; the units spread over the whole width, never inside each other's
// blast; full power crosses the field and the wind bends a shot by the same
// share at any width; nothing at 720 draws or flies differently.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import * as sim from '../src/sim.ts';
import { FIELD_AIM, fieldAim } from '../src/ai.ts';
import type { FallRules, Gear, Shell, StepEvent, Tank, Weapon, World } from '../src/sim.ts';

function must<T>(v: T | null | undefined, what: string): T {
  assert.ok(v !== null && v !== undefined, `${what} is missing`);
  return v;
}
function nth<T>(list: readonly T[], i: number): T {
  return must(list[i], `item ${i}`);
}

const GAME: { arsenal: { ammo: Weapon[]; gear?: Gear[]; fall?: Partial<FallRules> } } = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'game.json'), 'utf8'));
const arsenal = must(sim.buildArsenal(GAME.arsenal), 'the arsenal');
const gun = (k: string): Readonly<Weapon> => must(arsenal.weapons[k], `the ${k} row`);
const WIDTHS = [720, 1080, 1440];
const flat = (w: number) => ({ terrain: Array(w).fill(400), wind: 0 });

test('a wider field is the same hills, continued', () => {
  for (const seed of ['scorch-01', 'tankity-riverbed', 'a']) {
    const narrow = sim.genTerrain(sim.mulberry32(sim.hashSeed(seed)), 720);
    for (const w of WIDTHS) {
      const g = sim.genTerrain(sim.mulberry32(sim.hashSeed(seed)), w);
      assert.equal(g.terrain.length, w);
      assert.deepEqual(g.terrain.slice(0, 720), narrow.terrain, `${seed} at ${w}`);
      assert.deepEqual(sim.hillsWire(g.hills), sim.hillsWire(narrow.hills));
      for (let x = 0; x < w; x += 37) assert.ok(Object.is(g.terrain[x], sim.hillY(g.hills, x)));
    }
  }
});

test('the units spread over the whole width, never inside each other\'s blast', () => {
  // The blasts that hurt: a harmless row's radius (a riot scoop, a slump's reach, a mound of dirt) touches no unit.
  const biggest = Math.max(...arsenal.order.filter(k => gun(k).dmg > 0).map(k => gun(k).radius));
  assert.ok(sim.SPAWN_GAP > biggest + 14, `SPAWN_GAP ${sim.SPAWN_GAP} clears the blast's real reach (radius + 14 from a hull's centre)`);
  assert.ok(sim.SPAWN_GAP >= biggest + 20, `SPAWN_GAP ${sim.SPAWN_GAP} vs blast ${biggest} + a hull's half-width`);
  const span = (w: number) => {
    let total = 0;
    for (let seed = 1; seed <= 400; seed++) {
      const xs = sim.spawnSpots(4, sim.mulberry32(seed), w).sort((a, b) => a - b);
      for (let i = 1; i < xs.length; i++) assert.ok(nth(xs, i) - nth(xs, i - 1) >= sim.SPAWN_GAP, `${w} seed ${seed}`);
      assert.ok(nth(xs, 0) >= 30 && nth(xs, 3) <= w - 30);
      total += nth(xs, 3) - nth(xs, 0);
    }
    return total / 400;
  };
  const s720 = span(720), s1440 = span(1440);
  assert.ok(s1440 > 1.7 * s720, `the group spans ${s1440.toFixed(0)} at 1440 vs ${s720.toFixed(0)} at 720`);
});

test('a 720 deal and a 720 shot are exactly what they always were', () => {
  assert.equal(sim.fieldReach(720), 1);
  for (const p of [0, 37, 100]) assert.ok(Object.is(sim.shotSpeed(p, 1, sim.fieldReach(720)), sim.shotSpeed(p, 1)));
  assert.deepEqual(fieldAim(720), { aim: 1, floor: 1 });
});

test('full power crosses the field at every width', () => {
  for (const w of WIDTHS) {
    const r = sim.simShot(flat(w), arsenal, 30, 386, 45, 100, 'shell', 1);
    assert.ok(r.oob || r.x >= w - 30, `${w}: lands at ${r.x.toFixed(0)}`);
  }
});

test('the wind bends a shot by the same share of its length at any width', () => {
  const share = (w: number) => {
    const still = sim.simShot(flat(w), arsenal, 30, 386, 45, 70, 'shell', 1);
    const blown = sim.simShot({ ...flat(w), wind: 8 }, arsenal, 30, 386, 45, 70, 'shell', 1);
    return (blown.x - still.x) / (still.x - 30);
  };
  for (const w of [1080, 1440]) assert.ok(Math.abs(share(w) / share(720) - 1) < 0.02, `${w}: ${share(w)} vs ${share(720)}`);
});

test('the aim table rises from 720 and interpolates between its points', () => {
  assert.deepEqual(FIELD_AIM.map(p => p.w), [720, 1080, 1440]);
  const mid = fieldAim(900), lo = fieldAim(720), hi = fieldAim(1080);
  assert.ok(Math.abs(mid.aim - (lo.aim + hi.aim) / 2) < 1e-12 && Math.abs(mid.floor - (lo.floor + hi.floor) / 2) < 1e-12);
  for (let w = 720; w < 1440; w += 24) assert.ok(fieldAim(w + 24).aim <= fieldAim(w).aim);
});

test('out of bounds is the field edge, and the scenery is not the sim', () => {
  for (const w of WIDTHS) {
    const r = sim.simShot(flat(w), arsenal, w - 100, 386, 40, 100, 'shell', 1);
    assert.ok(r.oob && r.x >= w, `${w}: ${JSON.stringify(r)}`);
    assert.equal(sim.surfY(Array.from({ length: w }, (_, i) => i), w + 50), w - 1);
    const terrain = Array(w).fill(400);
    const world: World = { tanks: [], terrain, wind: 0, round: 1, rng: sim.mulberry32(1), shells: [], score: 0, cash: 0, ammo: {},
      selected: 'shell', shield: false, bunker: 0, laststand: false, jammer: 0 };
    // A shell with no gunner, which Shell does not allow: stepShells never reads the owner of one off the field.
    world.shells.push({ x: w + 25, y: 440, vx: 120, vy: 10, wkey: 'shell', owner: null, life: 5, age: 1 } as unknown as Shell);
    const events = sim.stepShells(world, arsenal, 1 / 60);
    assert.equal(world.shells.filter(s => !s.dead).length, 0);
    assert.ok(!events.some(e => e.kind === 'blast'));
    assert.deepEqual(terrain, Array(w).fill(400));
  }
  const src = fs.readFileSync(path.join(import.meta.dirname, '..', 'src', 'sim.ts'), 'utf8');
  assert.ok(!/world\.hills|G\.hills/.test(src), 'the sim never reads the scenery\'s hills');
});

test('a steep needle shot (the fastest gun) at full power bursts on a wide field and does not expire in the air', () => {
  for (const w of WIDTHS) {
    const world: World = { tanks: [], terrain: Array(w).fill(400), wind: 0, round: 1, rng: sim.mulberry32(1), shells: [], score: 0, cash: 0, ammo: { needle: 9 },
      selected: 'needle', shield: false, bunker: 0, laststand: false, jammer: 0 };
    const t: Tank = { id: 'T', isPlayer: true, x: 200, y: 400, angle: 85, power: 100, hp: 100, fuel: 0, dirS: 1, ammo: { needle: 9 } };
    world.tanks.push(t);
    sim.fireWeapon(world, arsenal, t, 'needle');
    const blasts: StepEvent[] = [];
    for (let f = 0; world.shells.length && f < 5000; f++) blasts.push(...sim.stepShells(world, arsenal, 1 / 60).filter(e => e.kind === 'blast'));
    assert.ok(blasts.length > 0, `${w}: the needle shot burst`);
    const r = sim.simShot(world, arsenal, 200, 400, 85, 100, 'needle', 1);
    assert.ok(!r.oob, `${w}: the aim guide sees it land on the field`);
  }
});
