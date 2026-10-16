// A drone earns as a player does: twice the damage it deals to any other unit, the kill bonus whoever the
// victim was, a shield of its own that absorbs one hit, and the round prize when it stands alone
// (the prize is test/solo.test.ts's). The player earns exactly as before.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { buildArsenal, explode, TUNE } from '../src/sim.ts';
import type { Tank, World } from '../src/sim.ts';

const GAME: { arsenal: Parameters<typeof buildArsenal>[0] } = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'game.json'), 'utf8'));
const arsenal = (() => { const a = buildArsenal(GAME.arsenal); assert.ok(a); return a; })();

const unit = (id: string, isPlayer: boolean, x: number, hp = 100, extra: Partial<Tank> = {}): Tank =>
  ({ id, isPlayer, x, y: 400, hp, angle: 45, power: 50, fuel: 80, ...extra });
const world = (tanks: Tank[]): World => ({
  tanks, terrain: new Array(720).fill(400), wind: 0, round: 1, rng: () => 0.5, shells: [],
  score: 0, cash: 0, ammo: { shell: Infinity }, selected: 'shell', shield: false, bunker: 0, laststand: false, jammer: 0, chutes: 0,
});
const at = <T>(list: T[], i: number): T => { const v = list[i]; assert.ok(v !== undefined); return v; };
/** A direct hit by `owner` on `victim`, dealing what the Shell deals. */
function hit(G: World, owner: Tank, victim: Tank): number {
  const before = victim.hp;
  explode(G, arsenal, victim.x, 395, 'shell', owner, victim, null);
  return before - victim.hp;
}
/** What a direct Shell hit on a unit of this look deals: the raw damage credit pays on, even when the victim has less armor left. */
function shellOn(isPlayer: boolean): number {
  const gunner = unit('reaper', false, 300), victim = unit(isPlayer ? 'tank' : 'reaper', isPlayer, 500, 1000);
  return hit(world([gunner, victim]), gunner, victim);
}

test('a drone earns twice the damage it deals to the player', () => {
  const me = unit('tank', true, 100), foe = unit('reaper', false, 300, 100, { cash: 600 });
  const G = world([me, foe]);
  const dealt = hit(G, foe, me);
  assert.ok(dealt > 0);
  assert.equal(foe.cash, 600 + 2 * dealt);
  assert.equal(G.cash, 0, 'the player earns nothing for being hit');
  assert.equal(G.score, 0, 'a drone has no score');
});

test('a drone earns twice the damage it deals to another drone', () => {
  const me = unit('tank', true, 100), a = unit('reaper', false, 300, 100, { cash: 0 }), b = unit('reaper', false, 500, 100, { cash: 0 });
  const G = world([me, a, b]);
  const dealt = hit(G, a, b);
  assert.equal(a.cash, 2 * dealt);
  assert.equal(b.cash, 0);
  assert.equal(G.cash, 0);
});

test('a drone earns the kill bonus whoever the victim was', () => {
  const me = unit('tank', true, 100, 5), a = unit('reaper', false, 300, 100, { cash: 0 }), b = unit('reaper', false, 500, 5, { cash: 0 });
  const G = world([me, a, b]);
  hit(G, a, me);
  assert.equal(me.hp, 0);
  assert.equal(a.cash, 2 * shellOn(true) + TUNE.killBonus, 'a player wrecked');
  const before = a.cash;
  hit(G, a, b);
  assert.equal(b.hp, 0);
  assert.equal(a.cash, before + 2 * shellOn(false) + TUNE.killBonus, 'a drone wrecked');
  assert.equal(a.kills, 2);
});

test('a drone earns nothing from hurting itself', () => {
  const me = unit('tank', true, 100), a = unit('reaper', false, 300, 100, { cash: 50 });
  const G = world([me, a]);
  hit(G, a, a);
  assert.equal(a.cash, 50);
});

test('the player earns as he always has: damage and kills of drones pay score and cash, hits on the player or between drones pay him nothing', () => {
  const me = unit('tank', true, 100), a = unit('reaper', false, 300, 100, { cash: 0 }), b = unit('reaper', false, 500, 5, { cash: 0 });
  const G = world([me, a, b]);
  const d1 = hit(G, me, a);
  assert.equal(G.score, 2 * d1);
  assert.equal(G.cash, 2 * d1);
  hit(G, me, b);
  assert.equal(b.hp, 0);
  assert.equal(G.score, 2 * d1 + 2 * shellOn(false) + TUNE.killBonus);
  assert.equal(G.cash, 2 * d1 + 2 * shellOn(false) + TUNE.killBonus);
  assert.equal(a.cash, 0);
  assert.equal(b.cash, 0, 'being hit pays a drone nothing');
});

test('a drone\'s shield absorbs one hit whole and is then gone; the player\'s is the world\'s', () => {
  const me = unit('tank', true, 100), foe = unit('reaper', false, 300, 100, { shield: true, cash: 0 });
  const G = world([me, foe]);
  assert.equal(hit(G, me, foe), 0, 'the first hit is absorbed');
  assert.equal(foe.shield, false);
  assert.equal(G.cash, 0, 'an absorbed hit pays nothing');
  assert.ok(hit(G, me, foe) > 0, 'the second hurts');
  const mine = world([unit('tank', true, 100), unit('reaper', false, 300, 100, { shield: true })]);
  mine.shield = true;
  assert.equal(hit(mine, at(mine.tanks, 1), at(mine.tanks, 0)), 0);
  assert.equal(mine.shield, false);
  assert.equal(at(mine.tanks, 1).shield, true, 'the drone\'s own is not spent by the player\'s');
});
