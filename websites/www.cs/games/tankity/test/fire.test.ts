// Napalm's pools (src/fire.ts, src/earth.ts pourLevel with the gun's poolMin):
// burning liquid spreads only until it is poolMin deep, so on flat ground it
// lies as a puddle of finite width centred where it landed, and spills off
// only when that puddle reaches a field edge. In a dip it still collects at
// the bottom. server/fire.php is held to the same by the sim vectors.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { buildArsenal, fireWeapon, mulberry32, stepShells, volleyOn, settleVolley } from '../src/sim.ts';
import { firePool, inFlames } from '../src/fire.ts';
import { pourLevel } from '../src/earth.ts';
import type { FallRules, Gear, Tank, Weapon, World } from '../src/sim.ts';
import type { FirePool } from '../src/fire.ts';

function must<T>(v: T | null | undefined, what: string): T {
  assert.ok(v !== null && v !== undefined, `${what} is missing`);
  return v;
}
function nth<T>(list: readonly T[], i: number): T {
  return must(list[i], `item ${i}`);
}

const GAME: { arsenal: { ammo: Weapon[]; gear?: Gear[]; fall?: Partial<FallRules> } } = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'game.json'), 'utf8'));
const arsenal = must(buildArsenal(GAME.arsenal), 'the arsenal');
const gun = (k: string): Readonly<Weapon> => must(arsenal.weapons[k], `the ${k} row`);
/* A napalm row, with the fields a pool reads asserted present. */
function napalm(k: string) {
  const w = gun(k);
  const { volume, flame, poolMin, burn, tick } = w;
  assert.ok(volume !== undefined && flame !== undefined && poolMin !== undefined && burn !== undefined && tick !== undefined, `${k} is not a napalm row`);
  return { ...w, volume, flame, poolMin, burn, tick };
}
const NAPALMS = arsenal.order.filter(k => gun(k).effect === 'napalm');
const flat = (y = 400, n = 720): number[] => Array(n).fill(y);

test('every napalm row and the liquid dirt carry a poolMin', () => {
  for (const k of arsenal.order) {
    const w = gun(k);
    if (w.effect === 'napalm' || w.effect === 'pour') assert.ok(Number(w.poolMin) > 0, k);
  }
});

for (const wkey of NAPALMS) {
  test(`${wkey} on flat ground lies as a puddle about volume / poolMin wide, centred where it landed, poolMin deep`, () => {
    const w = napalm(wkey);
    const p = firePool(flat(), 300, w.volume, w.flame, w.poolMin);
    const width = p.x1 - p.x0 + 1, want = w.volume / w.poolMin;
    assert.ok(Math.abs(width - want) <= 2, `${width} columns, want about ${want}`);
    assert.ok(Math.abs((p.x0 + p.x1) / 2 - 300) <= 1, `${p.x0}..${p.x1}`);
    assert.equal(p.level, 400 - w.poolMin);
  });

  test(`${wkey} fired at a tank on flat ground burns it every tick`, () => {
    const w = napalm(wkey);
    const me: Tank = { id: 'P', isPlayer: true, x: 400, y: 400, hp: 100, angle: 45, power: 50, dirS: 1, fuel: 80, vy: 0, ammo: {} };
    const foe: Tank = { id: 'D', isPlayer: false, x: 100, y: 400, hp: 200, angle: 45, power: 50, dirS: -1, fuel: 80, vy: 0, ammo: { [wkey]: 1 } };
    const G: World = { tanks: [me, foe], terrain: flat(), wind: 0, round: 9, rng: mulberry32(1), shells: [], score: 0, cash: 0, ammo: {},
      selected: 'shell', shield: false, bunker: 0, laststand: false, jammer: 0, chutes: 0 };
    // The drone's shot comes straight down beside the tank.
    G.shells.push({ x: 400, y: 300, vx: 0, vy: 60, wkey, owner: foe, life: 9, age: 1, pierced: false, split: false, order: [0], clear: true });
    for (let f = 0; volleyOn(G) && f < 4000; f++) stepShells(G, arsenal, 1 / 60);
    settleVolley(G, arsenal);
    assert.equal(100 - me.hp, w.dmg * Math.floor(w.burn / w.tick + 1e-9));
    assert.equal(me.lastHitBy, 1);
    assert.deepEqual(G.terrain, flat(), 'the ground never changes');
  });

  test(`${wkey} landing by the field's edge keeps a puddle there and spills the overflow off it`, () => {
    const w = napalm(wkey);
    const p = firePool(flat(), 5, w.volume, w.flame, w.poolMin);
    assert.equal(p.x0, 0);
    assert.ok(p.x1 > 5 && p.x1 - p.x0 + 1 < w.volume / w.poolMin, `${p.x0}..${p.x1}`);
    assert.ok(inFlames(p, { cx: 10, cy: 390, rx: 20, ry: 13 }));
  });

  test(`${wkey} in a dip still collects at the bottom, as before`, () => {
    const w = napalm(wkey);
    const t = Array.from({ length: 720 }, (_, ix) => 330 + 90 * Math.max(0, 1 - Math.abs(ix - 360) / 150));
    assert.deepEqual(firePool(t, 330, w.volume, w.flame, w.poolMin), firePool(t, 330, w.volume, w.flame, 0));
  });
}

test('a poolMin of 0 pours as before: dead flat ground holds no pool', () => {
  const p = pourLevel(flat(), 300, 2200, 0);
  assert.ok(p.x0 > p.x1);
});

test('liquid dirt on flat ground sets about as wide as the biggest dirt mound, not a slab across the field', () => {
  const pour = must(arsenal.order.map(gun).find(w => w.effect === 'pour'), 'a pour gun');
  const mound = Math.max(...arsenal.order.map(gun).filter(w => w.effect === 'dirt').map(w => 2 * w.radius));
  const p = pourLevel(flat(), 300, must(pour.volume, 'its volume'), pour.poolMin);
  const width = p.x1 - p.x0 + 1;
  assert.ok(width <= mound * 1.1 && width >= mound * 0.8, `${width} columns against a ${mound} px mound`);
});

test('the flames never reach a tank buried under the dirt the pool lies on', () => {
  for (const wkey of NAPALMS) {
    const w = arsenal.weapons[wkey];
    const t = flat(400);
    for (let x = 380; x <= 420; x++) t[x] = 370; // a mound over the tank at 400
    const buriedTank: Tank = { id: 'P', isPlayer: true, x: 400, y: 400, hp: 100, angle: 45, power: 50, dirS: 1, fuel: 80, vy: 0, ammo: {} };
    const open: Tank = { id: 'Q', isPlayer: false, human: true, x: 445, y: 400, hp: 100, angle: 45, power: 50, dirS: 1, fuel: 80, vy: 0, ammo: {} };
    const foe: Tank = { id: 'D', isPlayer: false, x: 100, y: 400, hp: 200, angle: 45, power: 50, dirS: 1, fuel: 80, vy: 0, ammo: {} };
    const G: World = { tanks: [buriedTank, open, foe], terrain: t, wind: 0, round: 9, rng: mulberry32(1), shells: [], score: 0, cash: 0, ammo: {},
      selected: 'shell', shield: false, bunker: 0, laststand: false, jammer: 0, chutes: 0 };
    // Poured on the mound's crest, the puddle lies over the buried tank and runs on beside it.
    G.shells.push({ x: 400, y: 300, vx: 0, vy: 60, wkey, owner: foe, life: 9, age: 1, pierced: false, split: false, order: [0], clear: true });
    let pool: FirePool | null = null;
    for (let f = 0; volleyOn(G) && f < 4000; f++) for (const e of stepShells(G, arsenal, 1 / 60)) if (e.kind === 'fire') pool = e.fire.pool;
    assert.ok(pool && pool.x0 <= 400 && pool.x1 >= 430, `${wkey}: the pool spans both (${pool && pool.x0}..${pool && pool.x1})`);
    assert.equal(buriedTank.hp, 100, `${wkey}: the buried tank is not burned`);
    assert.ok(open.hp < 100, `${wkey}: the tank in the open is`);
  }
});

test('a room lights a pool for the seconds it burns at the replay\'s speed, and says when one ran off', async () => {
  const { burnSeconds, burnLine } = await import('../src/fire-fx.ts');
  const e = { t: 'burn', by: 1, w: 'napalm', x: 300, v: 2200, level: 380, x0: 245, x1: 354, flame: 18, at: 1.5, t1: 4.5 };
  assert.equal(burnSeconds(e, 1), 3);
  assert.equal(burnSeconds(e, 3), 1, 'a caught-up volley burns out three times as fast');
  assert.equal(burnLine({ ...e, x0: 300, x1: 299 }, 'Napalm', 'REAPER'), 'REAPER\'s Napalm runs off and burns out.');
  assert.equal(burnLine(e, 'Napalm', 'REAPER'), null);
});
