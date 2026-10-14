// Drones with guns that do not fly (src/ai.ts): a beam is aimed straight at
// the target's body at full power and scores its flat damage on every rival
// on its line; a plasma ring scores its falloff damage on every rival inside
// it. Neither ever hurts the drone itself, and either is chosen only when it
// would do more harm than the best ballistic gun. These tests fire what the
// drone chose and look at what happened. server/ai.php is the same, pinned by
// protocol/sim-vectors.json.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { buildArsenal, fireWeapon, mulberry32, stepShells, settleFalls, unitHitBox } from '../src/sim.ts';
import { aiChoose, aiHarm, aiSelfHarm, beamAim } from '../src/ai.ts';

const GAME = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'game.json'), 'utf8'));
const arsenal = buildArsenal(GAME.arsenal);
const byEffect = e => GAME.arsenal.ammo.find(a => a.effect === e).key;
const BEAM = byEffect('beam'), RING = byEffect('plasma');

const flat = (y = 400) => Array(720).fill(y);
const drone = (x, extra = {}) => ({ id: 'D' + x, isPlayer: false, x, y: 400, hp: 1000, angle: 45, power: 50, dirS: 1, fuel: 80, vy: 0, ammo: {}, s: 'hunter', ...extra });
const human = (x, extra = {}) => ({ id: 'P', isPlayer: true, x, y: 400, hp: 1000, angle: 45, power: 50, dirS: -1, fuel: 80, vy: 0, ammo: {}, ...extra });
const world = (tanks, terrain = flat(), extra = {}) => ({ tanks, terrain, wind: 0, round: 9, difficulty: 'hard', score: 0, cash: 0, jammer: 0,
  rng: mulberry32(7), shells: [], ammo: {}, selected: 'shell', shield: false, bunker: 0, laststand: false, ...extra });
/* A hill under x0..x1 at height y. */
const hill = (x0, x1, y) => { const t = flat(); for (let x = x0; x <= x1; x++) t[x] = y; return t; };

/** The drone chooses, then fires what it chose; returns the choice and each unit's hp loss. */
function chooseAndFire(G, gunner) {
  const before = G.tanks.map(t => t.hp);
  const c = aiChoose(G, arsenal, gunner);
  gunner.angle = c.angle;
  gunner.power = c.power;
  fireWeapon(G, arsenal, gunner, c.wkey);
  for (let f = 0; G.shells.length && f < 6000; f++) stepShells(G, arsenal, 1 / 60);
  settleFalls(G, arsenal);
  return { c, lost: G.tanks.map((t, i) => before[i] - t.hp) };
}

test('a beam is aimed at the target\'s body from the barrel\'s pivot, at full power', () => {
  const self = drone(120), target = drone(320, { y: 330 });
  const G = world([self, target], hill(300, 340, 330));
  const aim = beamAim(G, arsenal, self, target, BEAM);
  const b = unitHitBox(target);
  const want = Math.round(Math.atan2(-(b.cy - (self.y - 14)), b.cx - self.x) / Math.PI * 180);
  assert.equal(aim.a, want);
  assert.equal(aim.p, 100);
  assert.equal(aiHarm(G, arsenal, self, target, BEAM, { x: 0, y: 0, oob: false, a: aim.a, p: aim.p }), arsenal.weapons[BEAM].dmg);
  assert.equal(aiSelfHarm(G, arsenal, self, target, BEAM, { x: 0, y: 0, oob: false, a: aim.a, p: aim.p }), 0, 'a beam never hits its gunner');
});

test('a drone with a beam and a rival in line fires the beam and hits it', () => {
  for (const seed of [1, 2, 3]) {
    const self = drone(120, { ammo: { [BEAM]: 2 } }), target = drone(320, { y: 330 });
    const G = world([self, target], hill(300, 340, 330), { rng: mulberry32(seed) });
    const { c, lost } = chooseAndFire(G, self);
    assert.equal(c.wkey, BEAM, `seed ${seed}`);
    assert.ok(c.power >= 95, 'full power, give or take the wobble');
    assert.equal(lost[1], arsenal.weapons[BEAM].dmg, `seed ${seed}: the rival takes the beam`);
    assert.equal(lost[0], 0);
  }
});

test('a beam scores every rival on its line, so two in line beat one', () => {
  const self = drone(100), a = drone(250, { y: 352 }), b = drone(400, { y: 302 });
  const G = world([self, a, b], flat());
  const aim = beamAim(G, arsenal, self, a, BEAM);
  const land = { x: 0, y: 0, oob: false, a: aim.a, p: aim.p };
  assert.equal(aiHarm(G, arsenal, self, a, BEAM, land), 2 * arsenal.weapons[BEAM].dmg);
});

test('a drone dips its beam at a ground target below it and hits it', () => {
  for (const seed of [1, 2, 3, 4]) {
    const self = drone(100, { ammo: { [BEAM]: 2 } }), target = human(400, { hp: 100 });
    const G = world([self, target], flat(), { rng: mulberry32(seed) });
    const aim = beamAim(G, arsenal, self, target, BEAM);
    assert.ok(aim.a < 0 && aim.a >= arsenal.weapons[BEAM].aimMin, `dips to ${aim.a}`);
    assert.equal(aiHarm(G, arsenal, self, target, BEAM, { x: 0, y: 0, oob: false, a: aim.a, p: aim.p }), arsenal.weapons[BEAM].dmg);
    const { c, lost } = chooseAndFire(G, self);
    assert.equal(c.wkey, BEAM, `seed ${seed}`);
    assert.ok(lost[1] === arsenal.weapons[BEAM].dmg, `seed ${seed}: the tank takes the beam (${lost[1]})`);
  }
});

test('a beam aimed at a target behind and below the drone dips on that side (past 180)', () => {
  const self = drone(400, { dirS: 1 }), target = human(150);
  const G = world([self, target]);
  const aim = beamAim(G, arsenal, self, target, BEAM);
  assert.ok(aim.a > 180 && aim.a <= 200, String(aim.a));
});

test('a drone with a plasma ring and a rival 40 px away fires the ring and spares itself', () => {
  for (const [dir, seed] of [[1, 1], [-1, 2], [1, 3]]) {
    const self = drone(300, { dirS: dir, ammo: { [RING]: 2, mortar: 2 } }), target = human(300 + 40 * dir, { hp: 100 });
    const G = world([self, target], flat(), { rng: mulberry32(seed) });
    const { c, lost } = chooseAndFire(G, self);
    assert.equal(c.wkey, RING, `dir ${dir}`);
    assert.ok(lost[1] > 0, 'the rival is burnt');
    assert.equal(lost[0], 0, 'the gunner is spared');
  }
});

test('a drone with a plasma ring and rivals 300 px away fires something else', () => {
  const self = drone(200, { ammo: { [RING]: 2 } }), a = human(500, { hp: 100 }), b = drone(520);
  const G = world([self, a, b]);
  const c = aiChoose(G, arsenal, self);
  assert.notEqual(c.wkey, RING);
  assert.equal(aiHarm(G, arsenal, self, a, RING, { x: 0, y: 0, oob: false, a: 45, p: 100 }), 0);
});

test('a ring\'s harm is its burns on every rival inside it, each capped at that rival\'s armor', () => {
  const self = drone(300), a = human(330, { hp: 5 }), b = drone(360), c = drone(500);
  const G = world([self, a, b, c]);
  const h = aiHarm(G, arsenal, self, a, RING, { x: 0, y: 0, oob: false, a: 45, p: 100 });
  const w = arsenal.weapons[RING];
  const burn = u => { const s = unitHitBox(self), t = unitHitBox(u); const d = Math.hypot(t.cx - s.cx, t.cy - s.cy); return Math.round(w.dmg * Math.max(0.3, 1 - d / (w.radius + 14))); };
  assert.equal(h, 5 + burn(b));
  assert.equal(aiSelfHarm(G, arsenal, self, a, RING, { x: 0, y: 0, oob: false, a: 45, p: 100 }), 0);
});

test('a beam or a ring never starts a bracket: the next turn aims afresh', () => {
  const self = drone(120, { ammo: { [BEAM]: 3 } }), target = drone(320, { y: 330 });
  const G = world([self, target], hill(300, 340, 330));
  chooseAndFire(G, self);
  const { c } = chooseAndFire(G, self);
  assert.equal(self.brk.n, 0);
  assert.equal(c.wkey, BEAM);
});
