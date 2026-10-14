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
import { aiChoose, aiHarm, aiSelfHarm, earthHarm } from '../src/ai.ts';
import type { Ammo, FallRules, Gear, Tank, Weapon, World } from '../src/sim.ts';
import type { Landing } from '../src/ai.ts';

function must<T>(v: T | null | undefined, what: string): T {
  assert.ok(v !== null && v !== undefined, `${what} is missing`);
  return v;
}
function nth<T>(list: readonly T[], i: number): T {
  return must(list[i], `item ${i}`);
}

const GAME: { arsenal: { ammo: Weapon[]; gear?: Gear[]; fall?: Partial<FallRules> } } = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'game.json'), 'utf8'));
const arsenal = must(buildArsenal(GAME.arsenal), 'the arsenal');
const AI_GUNS = GAME.arsenal.ammo.filter(a => a.ai && a.key !== 'shell').map(a => a.key);

const flat = (): number[] => Array(720).fill(400);
const drone = (x: number, extra: Partial<Tank> = {}): Tank => ({ id: 'D' + x, isPlayer: false, x, y: 400, hp: 1000, angle: 45, power: 50, dirS: 1, fuel: 80, vy: 0, ammo: {}, s: 'hunter', ...extra });
const human = (x: number, hp = 1000): Tank => ({ id: 'P', isPlayer: true, x, y: 400, hp, angle: 45, power: 50, dirS: -1, fuel: 80, vy: 0, ammo: {} });
const world = (tanks: Tank[], extra: Partial<World> = {}): World => ({ tanks, terrain: flat(), wind: 0, round: 9, difficulty: 'hard', score: 0, cash: 0, jammer: 0,
  rng: mulberry32(7), shells: [], ammo: {}, selected: 'shell', shield: false, bunker: 0, laststand: false, ...extra });

/** Fly a volley to its end; returns each unit's hp loss. */
function fly(G: World, gunner: Tank, wkey: string, angle: number, power: number): number[] {
  const before = G.tanks.map(t => t.hp);
  gunner.angle = angle;
  gunner.power = power;
  must(gunner.isPlayer ? G.ammo : gunner.ammo, 'the gunner\'s ammo')[wkey] = 9;
  fireWeapon(G, arsenal, gunner, wkey);
  for (let f = 0; G.shells.length && f < 6000; f++) stepShells(G, arsenal, 1 / 60);
  return G.tanks.map((t, i) => nth(before, i) - t.hp);
}
/** The aim, on the drone's own planning flight, that lands nearest x. */
function aimAt(G: World, gunner: Tank, wkey: string, x: number) {
  let best: { err: number; a: number; p: number; land: Landing } | null = null;
  for (let a = 15; a <= 85; a++) {
    for (let p = 20; p <= 100; p++) {
      const m = muzzle({ ...gunner, angle: a });
      const land = simShot(G, arsenal, m.x, m.y, a, p, wkey, must(gunner.dirS, 'dirS'));
      const err = land.oob ? Infinity : Math.abs(land.x - x);
      if (!best || err < best.err) best = { err, a, p, land: { ...land, a, p } };
    }
  }
  return must(best, 'an aim');
}

test('predicted harm ranks Shell, Baby Nuke, Funky and Death\'s Head as their real bursts do', () => {
  const guns = ['shell', 'babynuke', 'funky', 'deathshead'];
  const predicted: Record<string, number> = {}, real: Record<string, number> = {};
  for (const k of guns) {
    const self = drone(120), target = human(460);
    const G = world([self, target]);
    const aim = aimAt(G, self, k, 460);
    predicted[k] = aiHarm(G, arsenal, self, target, k, aim.land);
    real[k] = nth(fly(G, self, k, aim.a, aim.p), 1);
  }
  const rank = (o: Record<string, number>) => guns.slice().sort((a, b) => Number(o[a]) - Number(o[b])).join();
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

const STRATEGIES = ['hunter', 'bully', 'sniper', 'avenger', 'glory', 'lobber'];
/** The drone's own hp loss when it chooses from `ammo` at a target `gap` px off and fires it from where it aimed. */
function selfLoss(ammo: Ammo, s: string, gap: number, dir: number, seed: number) {
  const self = drone(300, { ammo: { ...ammo }, s, dirS: dir }), target = human(300 + dir * gap, 100);
  const G = world([self, target], { rng: mulberry32(seed) });
  const c = aiChoose(G, arsenal, self);
  self.x = 300; // the choice is judged from where it aimed (a drone may shuffle after choosing)
  return { wkey: c.wkey, lost: nth(fly(G, self, c.wkey, c.angle, c.power), 0) };
}

test('point blank, every strategy fires what hurts itself least: never more than a Shell alone would', () => {
  const rack = droneRack(arsenal, 9);
  for (const s of STRATEGIES) {
    for (let gap = 20; gap <= 80; gap += 10) {
      for (const dir of [1, -1]) {
        for (const seed of [1, 2]) {
          const full = selfLoss(rack, s, gap, dir, seed), shell = selfLoss({}, s, gap, dir, seed);
          // Within 3 hp: the landing the drone predicts is not quite where its shell bursts.
          assert.ok(full.lost <= shell.lost + 3, `${s} at ${gap} dir ${dir} seed ${seed}: ${full.wkey} cost ${full.lost}, Shell alone ${shell.lost}`);
        }
      }
    }
  }
});

test('every strategy never hurts itself with any gun it carries, its target 80 to 300 px away', () => {
  for (const s of STRATEGIES) {
    for (const k of AI_GUNS) {
      for (let gap = 80; gap <= 300; gap += 55) {
        const { wkey, lost } = selfLoss({ [k]: 1 }, s, gap, 1, 3);
        assert.equal(lost, 0, `${s} with ${k} at ${gap}: fired ${wkey}, the drone lost ${lost}`);
      }
    }
  }
});

test('the self-harm score ranks a point-blank Heavy above a Shell above a Needle', () => {
  const self = drone(300), target = human(340, 100), G = world([self, target]);
  const land = { x: 340, y: 400, oob: false, vx: 0, vy: 0 };
  const h = (k: string) => aiSelfHarm(G, arsenal, self, target, k, land);
  assert.ok(h('heavy') > h('shell') && h('shell') > h('needle'), JSON.stringify(['heavy', 'shell', 'needle'].map(h)));
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
  const picks: Record<string, number> = {};
  let n = 0;
  for (let round = 5; round <= 12; round++) {
    for (const [gap, hp] of [[140, 100], [220, 60], [300, 100], [380, 35], [460, 80], [520, 100]] satisfies [number, number][]) {
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

test('the earth term counts the fall the ground a gun moves would give: a harmless crater under the target, never under the drone', () => {
  const self = drone(100), target = human(500), G = world([self, target]);
  const e = earthHarm(G, arsenal, self, target, 'heavyriot', { x: 500, y: 400, oob: false });
  assert.equal(e.harm, 23, 'Heavy Riot drops the target 56 px');
  assert.equal(e.self, 0);
  assert.equal(aiHarm(G, arsenal, self, target, 'heavyriot', { x: 100, y: 400, oob: false }), -Infinity);
});
