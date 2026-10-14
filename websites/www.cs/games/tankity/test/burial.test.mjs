// Burial: a ground unit under risen ground stays where it is until a new
// round (src/sim.ts buried, settleFalls, restY, fallTanks; src/solo.ts
// snapTanks). Drones hover, so risen ground carries them up.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { buildArsenal, buried, fallTanks, anyTankFalling, settleFalls, surfY } from '../src/sim.ts';
import { addDirt } from '../src/earth.ts';
import { snapTanks, soloDeal, soloMuster } from '../src/solo.ts';

const GAME = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'game.json'), 'utf8'));
const arsenal = buildArsenal(GAME.arsenal);
const unit = (id, isPlayer, x, y, hp = 100, extra = {}) => ({ id, isPlayer, x, y, hp, angle: 45, power: 50, fuel: 80, ...extra });
function world(tanks) {
  return {
    tanks, terrain: new Array(720).fill(400), wind: 0, round: 1, rng: () => 0.5, shells: [],
    score: 0, cash: 0, ammo: { shell: Infinity }, selected: 'shell', shield: false, bunker: 0, laststand: false, jammer: 0, chutes: 0,
  };
}

test('fresh dirt over a tank buries it: the settle, the falls and the snap leave it under the dirt', () => {
  const me = unit('tank', true, 300, 400), foe = unit('reaper', false, 500, 400);
  const G = world([me, foe]);
  addDirt(G.terrain, 300, 400, 35);
  assert.ok(buried(me, G.terrain));
  assert.deepEqual(settleFalls(G, arsenal), []);
  assert.equal(me.y, 400, 'the settle never lifts it');
  for (let i = 0; i < 30; i++) fallTanks(G, 1 / 60);
  assert.equal(me.drawY, undefined, 'drawn where it is, under the dirt');
  assert.ok(!anyTankFalling(G));
  snapTanks(G);
  assert.equal(me.y, 400, 'a settled round keeps it buried');
  assert.ok(buried(me, G.terrain));
});

test('a drone under fresh dirt rides up on it, free, and is never buried', () => {
  const me = unit('tank', true, 100, 400), foe = unit('reaper', false, 300, 400);
  const G = world([me, foe]);
  addDirt(G.terrain, 300, 400, 35);
  assert.ok(!buried(foe, G.terrain));
  settleFalls(G, arsenal);
  assert.equal(foe.y, surfY(G.terrain, 300));
  assert.equal(foe.hp, 100);
});

test('a few pixels of dirt is not burial; dug out, a buried tank drops and pays the fall', () => {
  const me = unit('tank', true, 300, 400);
  const G = world([me, unit('reaper', false, 500, 400)]);
  G.terrain[300] = 398.5;
  assert.ok(!buried(me, G.terrain));
  G.terrain[300] = 380;
  assert.ok(buried(me, G.terrain));
  G.terrain.fill(430);
  const ev = settleFalls(G, arsenal);
  assert.equal(me.y, 430);
  assert.equal(ev[0].dmg, 10);
});

test('a new round places every unit on the fresh hills', () => {
  const G = soloDeal ? {} : null;
  soloDeal(G, arsenal, 'burial', 'normal', 720);
  soloMuster(G, arsenal);
  for (const t of G.tanks) t.y += 30;
  soloMuster(G, arsenal);
  for (const t of G.tanks) assert.equal(t.y, surfY(G.terrain, t.x));
});
