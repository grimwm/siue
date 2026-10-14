// Bomblets of one burst (a cluster's bloom, a scatter gun's throw) burst as
// they land: none is held in the air or on the ground waiting for a sibling.
// server/sim.php room_fly_siblings flies them the same way; the sim vectors
// hold the two together.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { buildArsenal, fireWeapon, stepShells, mulberry32 } from '../src/sim.ts';

const GAME = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'game.json'), 'utf8'));
const arsenal = buildArsenal(GAME.arsenal);
const SPLITTERS = GAME.arsenal.ammo.filter(a => a.effect === 'cluster' || a.effect === 'scatter').map(a => a.key);

function volley(wkey, dirS, terrain, angle, power) {
  const gunner = { id: 'P', isPlayer: true, x: dirS > 0 ? 120 : 600, y: terrain[dirS > 0 ? 120 : 600], hp: 1000, angle, power, dirS, fuel: 80, vy: 0 };
  const far = { id: 'D', isPlayer: false, x: 360, y: 200, hp: 1000, angle: 45, power: 50, dirS: 1, fuel: 80, vy: 0, ammo: {} };
  const G = { tanks: [gunner, far], terrain, wind: 0, round: 1, rng: mulberry32(1), shells: [], score: 0, cash: 0,
    ammo: { [wkey]: 9 }, selected: 'shell', shield: false, bunker: 0, laststand: false, jammer: 0 };
  fireWeapon(G, arsenal, gunner, wkey);
  let held = 0, bursts = 0;
  for (let f = 0; G.shells.length && f < 4000; f++) {
    const before = new Map(G.shells.map(s => [s, [s.x, s.y]]));
    for (const e of stepShells(G, arsenal, 1 / 60)) if (e.kind === 'blast') bursts++;
    for (const s of G.shells) {
      const was = before.get(s);
      if (was && !s.rolling && was[0] === s.x && was[1] === s.y) held++;
    }
  }
  return { held, bursts };
}

test('every bomblet of every cluster and scatter gun bursts as it lands, fired either way', () => {
  const flat = Array(720).fill(400);
  const hills = Array.from({ length: 720 }, (_, x) => 360 + 30 * Math.sin(x / 50));
  assert.ok(SPLITTERS.length >= 3, SPLITTERS.join());
  for (const wkey of SPLITTERS) {
    for (const [name, ground] of [['flat', flat], ['hills', hills]]) {
      for (const dirS of [1, -1]) {
        for (const [a, p] of [[45, 60], [70, 70], [25, 80]]) {
          const { held, bursts } = volley(wkey, dirS, ground.slice(), a, p);
          assert.equal(held, 0, `${wkey} ${name} dir ${dirS} at ${a}/${p}: ${held} frames held`);
          assert.ok(bursts > 1, `${wkey} ${name}: ${bursts} bursts`);
        }
      }
    }
  }
});
