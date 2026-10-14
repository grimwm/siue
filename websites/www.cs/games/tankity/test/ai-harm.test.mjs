// How a drone picks its gun (src/ai.ts aiHarm): the aim search finds the best
// aim per planning arc, then each loaded gun is scored by the harm it would do
// there, each bomblet or leap at its own predicted landing, capped at the
// target's armor; the most harmful gun fires, the cheaper one on a tie. A gun
// whose burst or munitions could reach the drone itself is never chosen.
// server/ai.php room_ai_harm is the same; protocol/sim-vectors.json holds the
// two together. These tests fire what the drone chose and look at what
// happened.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { buildArsenal, droneRack, fireWeapon, muzzle, mulberry32, simShot, stepShells } from '../src/sim.ts';
import { aiChoose, aiHarm, fallHarm } from '../src/ai.ts';

const GAME = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'game.json'), 'utf8'));
const arsenal = buildArsenal(GAME.arsenal);
const AI_GUNS = GAME.arsenal.ammo.filter(a => a.ai && a.key !== 'shell').map(a => a.key);

const flat = () => Array(720).fill(400);
const drone = (x, extra = {}) => ({ id: 'D' + x, isPlayer: false, x, y: 400, hp: 1000, angle: 45, power: 50, dirS: 1, fuel: 80, vy: 0, ammo: {}, s: 'hunter', ...extra });
const human = (x, hp = 1000) => ({ id: 'P', isPlayer: true, x, y: 400, hp, angle: 45, power: 50, dirS: -1, fuel: 80, vy: 0, ammo: {} });
const world = (tanks, extra = {}) => ({ tanks, terrain: flat(), wind: 0, round: 9, difficulty: 'hard', score: 0, cash: 0, jammer: 0,
  rng: mulberry32(7), shells: [], ammo: {}, selected: 'shell', shield: false, bunker: 0, laststand: false, ...extra });

/** Fly a volley to its end; returns each unit's hp loss. */
function fly(G, gunner, wkey, angle, power) {
  const before = G.tanks.map(t => t.hp);
  gunner.angle = angle;
  gunner.power = power;
  (gunner.isPlayer ? G.ammo : gunner.ammo)[wkey] = 9;
  fireWeapon(G, arsenal, gunner, wkey);
  for (let f = 0; G.shells.length && f < 6000; f++) stepShells(G, arsenal, 1 / 60);
  return G.tanks.map((t, i) => before[i] - t.hp);
}
/** The aim, on the drone's own planning flight, that lands nearest x. */
function aimAt(G, gunner, wkey, x) {
  let best = null;
  for (let a = 15; a <= 85; a++) {
    for (let p = 20; p <= 100; p++) {
      const m = muzzle({ ...gunner, angle: a });
      const land = simShot(G, arsenal, m.x, m.y, a, p, wkey, gunner.dirS);
      const err = land.oob ? Infinity : Math.abs(land.x - x);
      if (!best || err < best.err) best = { err, a, p, land: { ...land, a, p } };
    }
  }
  return best;
}

test('predicted harm ranks Shell, Baby Nuke, Funky and Death\'s Head as their real bursts do', () => {
  const guns = ['shell', 'babynuke', 'funky', 'deathshead'];
  const predicted = {}, real = {};
  for (const k of guns) {
    const self = drone(120), target = human(460);
    const G = world([self, target]);
    const aim = aimAt(G, self, k, 460);
    predicted[k] = aiHarm(G, arsenal, self, target, k, aim.land);
    real[k] = fly(G, self, k, aim.a, aim.p)[1];
  }
  const rank = o => guns.slice().sort((a, b) => o[a] - o[b]).join();
  assert.equal(rank(predicted), rank(real), `predicted ${JSON.stringify(predicted)} real ${JSON.stringify(real)}`);
});

test('a drone never hurts itself with its own Funky Bomb, its target 160 to 220 px away', () => {
  for (let gap = 160; gap <= 220; gap += 10) {
    for (const dir of [1, -1]) {
      for (const seed of [1, 2, 3]) {
        const self = drone(360, { dirS: dir, ammo: { funky: 1 } }), target = human(360 + dir * gap, 100);
        const G = world([self, target], { rng: mulberry32(seed) });
        const c = aiChoose(G, arsenal, self);
        const hurt = fly(G, self, c.wkey, c.angle, c.power)[0];
        assert.equal(hurt, 0, `gap ${gap} dir ${dir} seed ${seed}: ${c.wkey} cost the drone ${hurt}`);
      }
    }
  }
});

test('a drone never hurts itself with any gun it carries, its target 80 to 300 px away', () => {
  for (const k of AI_GUNS) {
    for (let gap = 80; gap <= 300; gap += 40) {
      const self = drone(360, { ammo: { [k]: 1 } }), target = human(360 + gap, 100);
      const G = world([self, target]);
      const c = aiChoose(G, arsenal, self);
      const hurt = fly(G, self, c.wkey, c.angle, c.power)[0];
      assert.equal(hurt, 0, `${k} at ${gap}: fired ${c.wkey}, the drone lost ${hurt}`);
    }
  }
});

test('pressed against its target with big guns and a Needle, a drone fires something that spares it', () => {
  const self = drone(300, { ammo: { heavy: 1, babynuke: 1, needle: 1 } }), target = human(350, 100);
  const G = world([self, target]);
  const c = aiChoose(G, arsenal, self);
  assert.ok(!['heavy', 'babynuke'].includes(c.wkey), c.wkey);
  assert.equal(fly(G, self, c.wkey, c.angle, c.power)[0], 0);
});

test('Mortar beats Shell on the same arc', () => {
  const self = drone(120, { ammo: { buck: 2, mortar: 2 } });
  assert.equal(aiChoose(world([self, human(400, 100)]), arsenal, self).wkey, 'mortar');
});

test('a weak target gets the cheapest gun that finishes it', () => {
  const self = drone(120, { ammo: { mortar: 2, babynuke: 1, funky: 1 } });
  assert.equal(aiChoose(world([self, human(400, 10)]), arsenal, self).wkey, 'shell');
});

test('drones vary their guns over rounds 5 to 12: no gun above 60% of picks', () => {
  const picks = {};
  let n = 0;
  for (let round = 5; round <= 12; round++) {
    for (const [gap, hp] of [[140, 100], [220, 60], [300, 100], [380, 35], [460, 80], [520, 100]]) {
      for (const s of ['hunter', 'glory', 'lobber', 'sniper']) {
        const self = drone(100, { ammo: droneRack(arsenal, round), s });
        const G = world([self, human(100 + gap, hp)], { round, difficulty: 'normal', rng: mulberry32(round * 31 + gap) });
        const c = aiChoose(G, arsenal, self);
        picks[c.wkey] = (picks[c.wkey] || 0) + 1;
        n++;
      }
    }
  }
  const top = Math.max(...Object.values(picks));
  assert.ok(top / n <= 0.6, JSON.stringify(picks));
  assert.ok(Object.keys(picks).length >= 4, JSON.stringify(picks));
});

test('the fall term waits for terrain removal to drop units: it is 0', () => {
  const self = drone(100), target = human(500), G = world([self, target]);
  for (const k of arsenal.order) assert.equal(fallHarm(G, arsenal, self, target, k, { x: 500, y: 400, oob: false }), 0, k);
});
