// Guns the arsenal has dropped (game.yaml arsenal.retired): their keys are
// no ammo or gear row's, and a key the arsenal lacks, left in a rack, fires
// nothing and crashes nothing. A room's stock is refunded on the server
// (test/php/RoomRetireTest.php); a solo match keeps no stock between visits.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { buildArsenal, fireWeapon, mulberry32 } from '../src/sim.ts';
import type { Tank, World } from '../src/sim.ts';

const GAME = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'game.json'), 'utf8'));
const arsenal = buildArsenal(GAME.arsenal);
assert.ok(arsenal, 'game.json has an arsenal');
const retired: { key: string; name: string; price: number; pack: number }[] = GAME.arsenal.retired || [];

test('a retired gun is gone from the arsenal, the shop and the picker', () => {
  assert.ok(retired.length >= 2, 'game.json lists the retired guns');
  for (const r of retired) {
    assert.ok(!(r.key in arsenal.weapons) && !(r.key in arsenal.gear), r.key);
    assert.ok(!arsenal.shelf.includes(r.key) && !arsenal.shop.some(row => row.w === r.key || row.g === r.key), r.key);
    assert.ok(r.price > 0 && r.pack > 0, `${r.key} keeps its old price per shell for the refund`);
  }
});

test('a rack holding a key the arsenal lacks fires nothing and keeps the volley empty', () => {
  for (const key of [...retired.map(r => r.key), 'nosuchgun']) {
    const t: Tank = { id: 'T', isPlayer: true, x: 100, y: 400, angle: 60, power: 50, hp: 100, fuel: 0, dirS: 1 };
    const world: World = { tanks: [t], terrain: Array(720).fill(400), wind: 0, round: 1, rng: mulberry32(1), shells: [], score: 0, cash: 0,
      ammo: { shell: Infinity, [key]: 3 }, selected: key, shield: false, bunker: 0, laststand: false, jammer: 0 };
    assert.equal(fireWeapon(world, arsenal, t, key), null, key);
    assert.equal(world.shells.length, 0);
    assert.equal(world.ammo![key], 3, 'nothing spent');
  }
});
