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

const GAME = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'game.json'), 'utf8'));
const arsenal = buildArsenal(GAME.arsenal);
const NAPALMS = arsenal.order.filter(k => arsenal.weapons[k].effect === 'napalm');
const flat = (y = 400, n = 720) => Array(n).fill(y);

test('every napalm row and the liquid dirt carry a poolMin', () => {
  for (const k of arsenal.order) {
    const w = arsenal.weapons[k];
    if (w.effect === 'napalm' || w.effect === 'pour') assert.ok(w.poolMin > 0, k);
  }
});

for (const wkey of NAPALMS) {
  const w = arsenal.weapons[wkey];
  test(`${wkey} on flat ground lies as a puddle about volume / poolMin wide, centred where it landed, poolMin deep`, () => {
    const p = firePool(flat(), 300, w.volume, w.flame, w.poolMin);
    const width = p.x1 - p.x0 + 1, want = w.volume / w.poolMin;
    assert.ok(Math.abs(width - want) <= 2, `${width} columns, want about ${want}`);
    assert.ok(Math.abs((p.x0 + p.x1) / 2 - 300) <= 1, `${p.x0}..${p.x1}`);
    assert.equal(p.level, 400 - w.poolMin);
  });

  test(`${wkey} fired at a tank on flat ground burns it every tick`, () => {
    const me = { id: 'P', isPlayer: true, x: 400, y: 400, hp: 100, angle: 45, power: 50, dirS: 1, fuel: 80, vy: 0, ammo: {} };
    const foe = { id: 'D', isPlayer: false, x: 100, y: 400, hp: 200, angle: 45, power: 50, dirS: -1, fuel: 80, vy: 0, ammo: { [wkey]: 1 } };
    const G = { tanks: [me, foe], terrain: flat(), wind: 0, round: 9, rng: mulberry32(1), shells: [], score: 0, cash: 0, ammo: {},
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
    const p = firePool(flat(), 5, w.volume, w.flame, w.poolMin);
    assert.equal(p.x0, 0);
    assert.ok(p.x1 > 5 && p.x1 - p.x0 + 1 < w.volume / w.poolMin, `${p.x0}..${p.x1}`);
    assert.ok(inFlames(p, { cx: 10, cy: 390, rx: 20, ry: 13 }));
  });

  test(`${wkey} in a dip still collects at the bottom, as before`, () => {
    const t = Array.from({ length: 720 }, (_, ix) => 330 + 90 * Math.max(0, 1 - Math.abs(ix - 360) / 150));
    assert.deepEqual(firePool(t, 330, w.volume, w.flame, w.poolMin), firePool(t, 330, w.volume, w.flame, 0));
  });
}

test('a poolMin of 0 pours as before: dead flat ground holds no pool', () => {
  const p = pourLevel(flat(), 300, 2200, 0);
  assert.ok(p.x0 > p.x1);
});
