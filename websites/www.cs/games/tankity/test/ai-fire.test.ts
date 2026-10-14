// Drones and napalm (src/ai.ts fireHarm): a pool's burns on every rival in
// its flames count as harm, and a gun whose pool could burn the drone itself
// (its own dip, or a near miss running into it) is never chosen. These fire
// what the drone chose and look at what happened.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { buildArsenal, fireWeapon, mulberry32, settleFalls, stepShells, volleyOn } from '../src/sim.ts';
import { aiChoose } from '../src/ai.ts';
import type { AimChoice, Difficulty } from '../src/ai.ts';
import type { FallRules, Gear, Tank, Weapon, World } from '../src/sim.ts';

function must<T>(v: T | null | undefined, what: string): T {
  assert.ok(v !== null && v !== undefined, `${what} is missing`);
  return v;
}
function nth<T>(list: readonly T[], i: number): T {
  return must(list[i], `item ${i}`);
}

const GAME: { arsenal: { ammo: Weapon[]; gear?: Gear[]; fall?: Partial<FallRules> } } = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'game.json'), 'utf8'));
const arsenal = must(buildArsenal(GAME.arsenal), 'the arsenal');
const NAPALMS = arsenal.order.filter(k => must(arsenal.weapons[k], k).effect === 'napalm');

const drone = (x: number, y: number, extra: Partial<Tank> = {}): Tank => ({ id: 'D' + x, isPlayer: false, x, y, hp: 200, angle: 45, power: 50, dirS: 1, fuel: 80, vy: 0, ammo: {}, s: 'hunter', ...extra });
const human = (x: number, y: number, hp = 100, extra: Partial<Tank> = {}): Tank => ({ id: 'P', isPlayer: true, x, y, hp, angle: 60, power: 50, dirS: -1, fuel: 80, vy: 0, ammo: {}, ...extra });
const world = (tanks: Tank[], terrain: number[], extra: Partial<World> = {}): World => ({ tanks, terrain, wind: 0, round: 9, difficulty: 'hard', score: 0, cash: 0, jammer: 0, chutes: 0,
  rng: mulberry32(3), shells: [], ammo: {}, selected: 'shell', shield: false, bunker: 0, laststand: false, ...extra });
/* A V valley centred on cx: rim y 330, its floor 90 px down, half as wide as half. */
const vale = (cx = 360, half = 150) => Array.from({ length: 720 }, (_, ix) => 330 + 90 * Math.max(0, 1 - Math.abs(ix - cx) / half));
function fire(G: World, t: Tank, c: AimChoice) {
  t.angle = c.angle;
  t.power = c.power;
  must(t.isPlayer ? G.ammo : t.ammo, 'the gunner\'s ammo')[c.wkey] = 9;
  fireWeapon(G, arsenal, t, c.wkey);
  for (let f = 0; volleyOn(G) && f < 6000; f++) stepShells(G, arsenal, 1 / 60);
  settleFalls(G, arsenal);
}

test('the fire guns exist', () => {
  assert.ok(NAPALMS.length >= 2, NAPALMS.join());
});

for (const wkey of NAPALMS) {
  test(`${wkey} is chosen against two rivals sharing a valley, and burns both`, () => {
    for (const seed of [1, 2, 3, 4]) {
      const t = vale();
      const a = human(340, nth(t, 340)), b = drone(385, nth(t, 385), { id: 'B', hp: 100 }), self = drone(110, nth(t, 110), { ammo: { [wkey]: 1, mortar: 1 } });
      const G = world([a, b, self], t, { rng: mulberry32(seed) });
      const c = aiChoose(G, arsenal, self);
      assert.equal(c.wkey, wkey, `seed ${seed}`);
      fire(G, self, c);
      assert.ok(a.hp < 100 && b.hp < 100, `seed ${seed}: ${a.hp}, ${b.hp}`);
      assert.equal(self.hp, 200);
    }
  });

  test(`${wkey} is refused when the drone's own column is in the predicted pool`, () => {
    for (const seed of [1, 2, 3, 4]) {
      const t = vale();
      const self = drone(320, nth(t, 320), { ammo: { [wkey]: 2 } }), target = human(400, nth(t, 400));
      const G = world([target, self], t, { rng: mulberry32(seed) });
      assert.notEqual(aiChoose(G, arsenal, self).wkey, wkey, `seed ${seed}`);
    }
  });
}

test('a drone never burns itself with the napalm it chose, across hills, places, winds, skills and seeds', t => {
  let fired = 0;
  for (const [period, amp] of [[200, 40], [150, 30], [300, 50], [120, 25], [720, 0]] satisfies [number, number][]) {
    const t = Array.from({ length: 720 }, (_, ix) => 340 + amp * Math.sin(ix * 2 * Math.PI / period));
    for (let sx = 60; sx <= 660; sx += 50) {
      for (const [tx, away] of [[sx - 140, false], [sx + 160, false], [sx + 60, false], [sx - 260, false], [sx - 200, true], [sx + 220, true]] satisfies [number, boolean][]) {
        if (tx < 20 || tx > 700) continue;
        for (const wind of [-6, 0, 6]) {
          for (const [difficulty, round] of [['hard', 9], ['normal', 6], ['easy', 6]] satisfies [Difficulty, number][]) {
            for (const seed of [1, 2]) {
              const rack = Object.fromEntries(NAPALMS.map(k => [k, 1]));
              const self = drone(sx, nth(t, Math.round(sx)), { dirS: (tx > sx) !== away ? 1 : -1, ammo: rack }), target = human(tx, nth(t, Math.round(tx)));
              const G = world([target, self], t, { wind, difficulty, round, rng: mulberry32(sx * 7 + tx + seed * 1000) });
              const c = aiChoose(G, arsenal, self);
              if (!NAPALMS.includes(c.wkey)) continue;
              fired++;
              fire(G, self, c);
              assert.equal(self.hp, 200, `hills ${period}/${amp}, drone ${sx}, target ${tx}, wind ${wind}, ${difficulty}, seed ${seed}: ${c.wkey} burned its own drone`);
            }
          }
        }
      }
    }
  }
  t.diagnostic(`${fired} napalm shots fired`);
  assert.ok(fired >= 40, `${fired} napalm shots fired`);
});

test('a drone facing away from its target still fires napalm when it is safe (the aim\'s elevation is 180 - a)', () => {
  // Hard drones on flat ground, facing right, the target well behind on the left: every shot is a backward one.
  let picked = 0, fired = 0;
  for (const seed of [1, 2, 3, 4]) {
    for (const [sx, tx] of [[520, 160], [600, 240], [450, 120]] satisfies [number, number][]) {
      const rack = Object.fromEntries(NAPALMS.map(k => [k, 1]));
      const self = drone(sx, 340, { dirS: 1, ammo: rack }), target = human(tx, 340);
      const G = world([target, self], Array(720).fill(340), { round: 9, difficulty: 'hard', rng: mulberry32(seed * 13 + sx) });
      const c = aiChoose(G, arsenal, self);
      if (!NAPALMS.includes(c.wkey)) continue;
      picked++;
      assert.ok(c.angle > 90, `a backward shot (${c.angle})`);
      fire(G, self, c);
      fired++;
      assert.equal(self.hp, 200, `${sx} -> ${tx}: ${c.wkey} burned its own drone`);
    }
  }
  assert.ok(picked >= 6, `${picked} of 12 backward turns fired napalm`);
});
