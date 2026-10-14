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

const GAME = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'game.json'), 'utf8'));
const arsenal = buildArsenal(GAME.arsenal);
const NAPALMS = arsenal.order.filter(k => arsenal.weapons[k].effect === 'napalm');

const drone = (x, y, extra = {}) => ({ id: 'D' + x, isPlayer: false, x, y, hp: 200, angle: 45, power: 50, dirS: 1, fuel: 80, vy: 0, ammo: {}, s: 'hunter', ...extra });
const human = (x, y, hp = 100, extra = {}) => ({ id: 'P', isPlayer: true, x, y, hp, angle: 60, power: 50, dirS: -1, fuel: 80, vy: 0, ammo: {}, ...extra });
const world = (tanks, terrain, extra = {}) => ({ tanks, terrain, wind: 0, round: 9, difficulty: 'hard', score: 0, cash: 0, jammer: 0, chutes: 0,
  rng: mulberry32(3), shells: [], ammo: {}, selected: 'shell', shield: false, bunker: 0, laststand: false, ...extra });
/* A V valley centred on cx: rim y 330, its floor 90 px down, half as wide as half. */
const vale = (cx = 360, half = 150) => Array.from({ length: 720 }, (_, ix) => 330 + 90 * Math.max(0, 1 - Math.abs(ix - cx) / half));
function fire(G, t, c) {
  t.angle = c.angle;
  t.power = c.power;
  (t.isPlayer ? G.ammo : t.ammo)[c.wkey] = 9;
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
      const a = human(340, t[340]), b = drone(385, t[385], { id: 'B', hp: 100 }), self = drone(110, t[110], { ammo: { [wkey]: 1, mortar: 1 } });
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
      const self = drone(320, t[320], { ammo: { [wkey]: 2 } }), target = human(400, t[400]);
      const G = world([target, self], t, { rng: mulberry32(seed) });
      assert.notEqual(aiChoose(G, arsenal, self).wkey, wkey, `seed ${seed}`);
    }
  });
}

test('a drone never burns itself with the napalm it chose, across hills, places, winds, skills and seeds', t => {
  let fired = 0;
  for (const [period, amp] of [[200, 40], [150, 30], [300, 50], [120, 25], [720, 0]]) {
    const t = Array.from({ length: 720 }, (_, ix) => 340 + amp * Math.sin(ix * 2 * Math.PI / period));
    for (let sx = 60; sx <= 660; sx += 50) {
      for (const tx of [sx - 140, sx + 160, sx + 60, sx - 260]) {
        if (tx < 20 || tx > 700) continue;
        for (const wind of [-6, 0, 6]) {
          for (const [difficulty, round] of [['hard', 9], ['normal', 6], ['easy', 6]]) {
            for (const seed of [1, 2]) {
              const rack = Object.fromEntries(NAPALMS.map(k => [k, 1]));
              const self = drone(sx, t[Math.round(sx)], { dirS: tx > sx ? 1 : -1, ammo: rack }), target = human(tx, t[Math.round(tx)]);
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
