// Drones and the earth guns (src/ai.ts earthHarm): the ground a gun would
// move counts as harm (the target's fall, a burial, a dig's warheads), and a
// gun whose ground would drop or bury the drone itself is never chosen.
// These fire what the drone chose and look at what happened.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { buildArsenal, buried, fireWeapon, mulberry32, settleFalls, stepShells } from '../src/sim.ts';
import { addDirt } from '../src/earth.ts';
import { aiChoose } from '../src/ai.ts';

const GAME = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'game.json'), 'utf8'));
const arsenal = buildArsenal(GAME.arsenal);
const keyOf = pred => arsenal.order.find(k => pred(arsenal.weapons[k]));
const DIRTBALL = keyOf(w => w.effect === 'dirt' && w.dmg === 0 && w.radius >= 35 && w.radius < 50);
const DIGGER = keyOf(w => w.effect === 'dig' && !w.warheads && w.digLen >= 100 && w.digLen < 150);
const DISRUPTER = keyOf(w => w.effect === 'slump');
const RIOT = keyOf(w => w.effect === 'riot');

const drone = (x, y, extra = {}) => ({ id: 'D' + x, isPlayer: false, x, y, hp: 200, angle: 45, power: 50, dirS: 1, fuel: 80, vy: 0, ammo: {}, s: 'hunter', ...extra });
const human = (x, y, hp = 100, extra = {}) => ({ id: 'P', isPlayer: true, x, y, hp, angle: 60, power: 50, dirS: -1, fuel: 80, vy: 0, ammo: {}, ...extra });
const world = (tanks, terrain, extra = {}) => ({ tanks, terrain, wind: 0, round: 9, difficulty: 'hard', score: 0, cash: 0, jammer: 0, chutes: 0,
  rng: mulberry32(3), shells: [], ammo: {}, selected: 'shell', shield: false, bunker: 0, laststand: false, ...extra });
function fire(G, t, c) {
  t.angle = c.angle;
  t.power = c.power;
  (t.isPlayer ? G.ammo : t.ammo)[c.wkey] = 9;
  fireWeapon(G, arsenal, t, c.wkey);
  for (let f = 0; G.shells.length && f < 6000; f++) stepShells(G, arsenal, 1 / 60);
  settleFalls(G, arsenal);
}

test('the earth guns exist', () => {
  assert.ok(DIRTBALL && DIGGER && DISRUPTER && RIOT, [DIRTBALL, DIGGER, DISRUPTER, RIOT].join());
});

test('Dirt Ball buries a full-armor human in a dip that a Shell cannot kill', () => {
  let buriedCount = 0;
  for (const seed of [1, 2, 3, 4, 5]) {
    const t = Array(720).fill(400);
    for (let ix = 380; ix <= 440; ix++) t[ix] = 420;
    const self = drone(120, 400, { ammo: { [DIRTBALL]: 1 } }), target = human(410, 420);
    const G = world([self, target], t, { rng: mulberry32(seed) });
    const c = aiChoose(G, arsenal, self);
    assert.equal(c.wkey, DIRTBALL, `seed ${seed}`);
    fire(G, self, c);
    if (buried(target, G.terrain)) buriedCount++;
  }
  assert.ok(buriedCount >= 3, `${buriedCount} of 5 shots buried it`);
});

test('dirt is never aimed at a drone: it would ride the mound up', () => {
  for (const seed of [1, 2, 3]) {
    const self = drone(120, 400, { ammo: { [DIRTBALL]: 2 } }), target = drone(420, 400, { dirS: -1 });
    const G = world([self, target], Array(720).fill(400), { rng: mulberry32(seed) });
    assert.notEqual(aiChoose(G, arsenal, self).wkey, DIRTBALL, `seed ${seed}`);
  }
});

test('the digger is chosen against a tank on a ridge with deep ground under it, and drops it', () => {
  const t = Array(720).fill(420);
  for (let ix = 0; ix < 720; ix++) t[ix] = 420 - Math.max(0, 90 - Math.abs(ix - 420) * 1.5);
  const self = drone(120, 420, { ammo: { [DIGGER]: 1 } }), target = human(420, t[420], 100);
  const G = world([self, target], t);
  const c = aiChoose(G, arsenal, self);
  assert.equal(c.wkey, DIGGER);
  const y0 = target.y;
  fire(G, self, c);
  assert.ok(target.y > y0 + 10 && target.hp < 100, `it fell from ${y0} to ${target.y}, hp ${target.hp}`);
});

test('the disrupter is refused when the drone itself stands on a slope in its reach', () => {
  const t = Array.from({ length: 720 }, (_, ix) => 300 + ix * 0.25 + (ix > 200 && ix < 260 ? (ix - 200) * 1.5 : ix >= 260 ? 90 : 0));
  const self = drone(240, t[240], { ammo: { [DISRUPTER]: 1 } }), target = human(330, t[330], 100);
  const G = world([self, target], t);
  for (const seed of [1, 2, 3]) {
    G.rng = mulberry32(seed);
    assert.notEqual(aiChoose(G, arsenal, self).wkey, DISRUPTER, `seed ${seed}`);
  }
});

test('a buried human fired for by the battery fires its Riot Charge, and is dug out', () => {
  const t = Array(720).fill(400);
  addDirt(t, 300, 400, 35);
  const me = human(300, 400, 100, { ammo: { [RIOT]: 1, shell: Infinity } }), foe = drone(600, 400, { dirS: -1 });
  const G = world([me, foe], t, { ammo: { [RIOT]: 1, shell: Infinity } });
  assert.ok(buried(me, G.terrain));
  const c = aiChoose(G, arsenal, me);
  assert.equal(c.wkey, RIOT);
  fire(G, me, c);
  assert.ok(!buried(me, G.terrain), 'dug out');
  assert.equal(me.hp, 100);
});
