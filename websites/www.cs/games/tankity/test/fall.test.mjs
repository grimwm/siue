// Fall damage and parachutes (src/sim.ts): a unit whose ground a blast took
// away drops straight down and pays by the drop, credited to whoever dug.
// server/sim.php room_settle_tanks is the same rules; the 'fall' sim vectors
// pin the two together.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  buildArsenal, droneChutes, explode, fallDamage, fallTanks, anyTankFalling, restY, settleFalls, TUNE,
} from '../src/sim.ts';
import { soloBuy, soloDeal, soloMuster } from '../src/solo.ts';

const GAME = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'game.json'), 'utf8'));
const RULES = { freePx: 10, perPx: 0.5, chuteOver: 5, aiRound: 3 };
const arsenal = buildArsenal({ ...GAME.arsenal, fall: RULES });

const unit = (id, isPlayer, x, y, hp = 100, extra = {}) => ({ id, isPlayer, x, y, hp, angle: 45, power: 50, fuel: 80, ...extra });
/* A flat field at 400 with the given units; the player's tricks on the world. */
function world(tanks, extra = {}) {
  return {
    tanks, terrain: new Array(720).fill(400), wind: 0, round: 1, rng: () => 0.5, shells: [],
    score: 0, cash: 0, ammo: { shell: Infinity }, selected: 'shell', shield: false, bunker: 0, laststand: false, jammer: 0,
    chutes: 0, ...extra,
  };
}

test('the damage is linear past a free drop, rounded down', () => {
  assert.equal(fallDamage(0, RULES), 0);
  assert.equal(fallDamage(10, RULES), 0);
  assert.equal(fallDamage(11, RULES), 0); // 0.5 rounds down
  assert.equal(fallDamage(12, RULES), 1);
  assert.equal(fallDamage(19.5, RULES), 4);
  assert.equal(fallDamage(100, RULES), 45);
  assert.equal(fallDamage(-30, RULES), 0); // ground that rose
});

test('the game.yaml rules are the documented defaults', () => {
  const live = buildArsenal(GAME.arsenal);
  assert.deepEqual({ ...live.fall }, RULES);
  assert.ok(live.gear.parachute, 'the shop sells a parachute');
  assert.equal(live.gear.parachute.effect, 'parachute');
});

test('a unit over a pit lands on the ground and pays the drop', () => {
  const me = unit('tank', true, 100, 300);
  const G = world([me, unit('reaper', false, 400, 400)]);
  const ev = settleFalls(G, arsenal);
  assert.equal(me.y, 400);
  assert.equal(me.hp, 55);
  assert.deepEqual(ev.map(e => [e.kind, e.tank.id, e.dmg, e.chute, e.by && e.by.id]), [['fall', 'tank', 45, false, null]]);
});

test('the shooter whose blast dug the pit is credited: score, cash, kills, the last hit', () => {
  const me = unit('tank', true, 100, 400);
  const foe = unit('reaper', false, 300, 400, 20);
  const G = world([me, foe]);
  // A blast just beside the drone digs its ground away without reaching it.
  explode(G, arsenal, 300, 470, 'nuke', me, null, null);
  assert.equal(foe.fellBy, 0, 'the pit remembers who dug it');
  const hpBefore = foe.hp;
  const scoreBefore = G.score;
  const ev = settleFalls(G, arsenal);
  const fall = ev.find(e => e.kind === 'fall');
  assert.ok(fall && fall.dmg > 0, 'the drone fell far enough to hurt');
  assert.equal(fall.by, me);
  assert.equal(foe.hp, Math.max(0, hpBefore - fall.dmg));
  assert.equal(foe.lastHitBy, 0);
  assert.ok(me.dealt);
  assert.equal(G.score - scoreBefore, fall.dmg * 2 + (foe.hp <= 0 ? TUNE.killBonus : 0));
  if (foe.hp <= 0) {
    assert.equal(me.kills, 1);
    assert.ok(ev.some(e => e.kind === 'wreck' && e.tank === foe && e.by === me));
  }
});

test('a fall that wrecks a drone pays the kill bonus to the digger', () => {
  const me = unit('tank', true, 100, 400);
  const foe = unit('reaper', false, 300, 300, 10, { fellBy: 0 });
  const G = world([me, foe]);
  const ev = settleFalls(G, arsenal);
  assert.equal(foe.hp, 0);
  assert.equal(me.kills, 1);
  // The whole fall counts, as a blast's overkill does.
  assert.equal(G.score, 45 * 2 + TUNE.killBonus);
  assert.equal(G.cash, 45 * 2 + TUNE.killBonus);
  assert.deepEqual(ev.map(e => e.kind), ['fall', 'wreck']);
});

test('digging out your own footing hurts you and credits nobody', () => {
  const me = unit('tank', true, 100, 300, 100, { fellBy: 0 });
  const G = world([me, unit('reaper', false, 400, 400)]);
  const ev = settleFalls(G, arsenal);
  assert.equal(me.hp, 55);
  assert.equal(G.score, 0);
  assert.equal(me.kills, undefined);
  assert.equal(me.lastHitBy, undefined);
  assert.equal(ev[0].by, null);
});

test('a drone that digs out a drone gets the kill but pays no score', () => {
  const a = unit('reaper', false, 100, 400);
  const b = unit('wraith', false, 300, 300, 5, { fellBy: 0 });
  const G = world([unit('tank', true, 600, 400), a, b].map((t, i) => (i === 2 ? { ...t, fellBy: 1 } : t)));
  settleFalls(G, arsenal);
  assert.equal(G.tanks[2].hp, 0);
  assert.equal(G.tanks[1].kills, 1);
  assert.equal(G.tanks[2].lastHitBy, 1);
  assert.equal(G.score, 0);
});

test('a parachute saves a fall over the threshold and is spent', () => {
  const me = unit('tank', true, 100, 300);
  const G = world([me, unit('reaper', false, 400, 400)], { chutes: 2 });
  const ev = settleFalls(G, arsenal);
  assert.equal(me.hp, 100);
  assert.equal(G.chutes, 1);
  assert.deepEqual(ev.map(e => [e.kind, e.dmg, e.chute]), [['fall', 0, true]]);
});

test('a fall at or under the threshold keeps the parachute and takes the damage', () => {
  // 22 px: (22 - 10) * 0.5 = 6, over 5; 21 px: 5, not over.
  const me = unit('tank', true, 100, 379);
  const G = world([me, unit('reaper', false, 400, 400)], { chutes: 1 });
  settleFalls(G, arsenal);
  assert.equal(me.hp, 95);
  assert.equal(G.chutes, 1);
  const me2 = unit('tank', true, 100, 378);
  const G2 = world([me2, unit('reaper', false, 400, 400)], { chutes: 1 });
  settleFalls(G2, arsenal);
  assert.equal(me2.hp, 100);
  assert.equal(G2.chutes, 0);
});

test('a drone spends its own parachutes', () => {
  const foe = unit('reaper', false, 300, 300, 60, { chutes: 1 });
  const G = world([unit('tank', true, 100, 400), foe]);
  settleFalls(G, arsenal);
  assert.equal(foe.hp, 60);
  assert.equal(foe.chutes, 0);
});

test('armor takes fall damage as it takes a hit: the bunker halves it, the shield does not stop it', () => {
  const me = unit('tank', true, 100, 300);
  const G = world([me, unit('reaper', false, 400, 400)], { shield: true, bunker: 2 });
  settleFalls(G, arsenal);
  assert.equal(me.hp, 100 - Math.round(45 / 2));
  assert.equal(G.shield, true, 'the shield is still up for the next blast');
});

test('landing on a unit hurts it the same, credited to the digger; the parachute only saves the faller', () => {
  const digger = unit('wraith', false, 600, 400);
  const top = unit('reaper', false, 300, 200, 60, { fellBy: 2, chutes: 1 });
  const under = unit('tank', true, 310, 400);
  const G = world([under, top, digger]);
  // under's hull top is at 400 - 23: top falls 177 px onto it.
  assert.equal(restY(G.tanks, G.terrain, top), 377);
  const ev = settleFalls(G, arsenal);
  const dmg = fallDamage(177, RULES);
  assert.equal(top.y, 377);
  assert.equal(top.hp, 60, 'the parachute saved the faller');
  assert.equal(top.chutes, 0);
  assert.equal(under.hp, 100 - dmg);
  assert.equal(under.lastHitBy, 2);
  const hit = ev.find(e => e.kind === 'fall' && e.tank === under);
  assert.ok(hit && hit.under && hit.by === digger);
});

test('units side by side do not land on each other, and a wreck is not a floor', () => {
  const a = unit('tank', true, 100, 400);
  const b = unit('reaper', false, 100 + 44, 300);
  const G = world([a, b]);
  assert.equal(restY(G.tanks, G.terrain, b), 400);
  a.hp = 0;
  a.x = 140;
  assert.equal(restY(G.tanks, G.terrain, b), 400);
});

test('the lowest units land first, so a stack settles from the bottom up', () => {
  const low = unit('tank', true, 300, 350);
  const high = unit('reaper', false, 300, 300);
  const G = world([high, low]);
  settleFalls(G, arsenal);
  assert.equal(low.y, 400);
  assert.equal(high.y, 377);
  assert.equal(low.hp, 100 - 20 - 33, 'its own fall, then the drone landing on it');
});

test('the browser animation lands with the same damage as the instant settle', () => {
  for (const [y, chutes] of [[300, 0], [300, 1], [379, 1], [200, 0]]) {
    const a = unit('tank', true, 100, y, 100, { fellBy: 1 });
    const A = world([a, unit('reaper', false, 400, 400)], { chutes });
    settleFalls(A, arsenal);
    const b = unit('tank', true, 100, y, 100, { fellBy: 1 });
    const B = world([b, unit('reaper', false, 400, 400)], { chutes });
    const ev = [];
    for (let i = 0; i < 5000 && anyTankFalling(B); i++) fallTanks(B, 1 / 60, arsenal, ev);
    assert.equal(b.y, a.y);
    assert.equal(b.hp, a.hp, `drop from ${y}`);
    assert.equal(B.chutes, A.chutes);
    assert.equal(B.score, A.score);
  }
});

test('a parachute opens as the fall starts, slows the descent and folds on landing', () => {
  const me = unit('tank', true, 100, 200);
  const G = world([me, unit('reaper', false, 400, 400)], { chutes: 1 });
  fallTanks(G, 1 / 60, arsenal, []);
  assert.equal(me.chute, true);
  let frames = 1;
  while (anyTankFalling(G) && frames < 5000) { fallTanks(G, 1 / 60, arsenal, []); frames++; }
  assert.ok(!me.chute, 'folded on landing');
  const free = unit('tank', true, 100, 200);
  const F = world([free, unit('reaper', false, 400, 400)]);
  let freeFrames = 0;
  while ((freeFrames === 0 || anyTankFalling(F)) && freeFrames < 5000) { fallTanks(F, 1 / 60, arsenal, []); freeFrames++; }
  assert.ok(frames > 2 * freeFrames, `a chute floats down (${frames} frames against ${freeFrames})`);
});

test('without the rules the fall only moves the units (a room replays the server\'s settle)', () => {
  const me = unit('tank', true, 100, 300);
  const G = world([me, unit('reaper', false, 400, 400)], { chutes: 1 });
  for (let i = 0; i < 5000 && anyTankFalling(G); i++) fallTanks(G, 1 / 60);
  assert.equal(me.y, 400);
  assert.equal(me.hp, 100);
  assert.equal(G.chutes, 1);
});

test('drones carry a parachute from the rules\' round', () => {
  assert.equal(droneChutes(arsenal, 1), 0);
  assert.equal(droneChutes(arsenal, 2), 0);
  assert.equal(droneChutes(arsenal, 3), 1);
  assert.equal(droneChutes(arsenal, 9), 1);
  const G = { body: 'tank' };
  soloDeal(G, arsenal, 'chutes', 'normal', 720);
  G.round = 3;
  soloMuster(G, arsenal);
  assert.deepEqual(G.tanks.slice(1).map(t => t.chutes), [1, 1, 1]);
});

test('the shop sells parachutes that stack', () => {
  const G = { body: 'tank' };
  soloDeal(G, arsenal, 'chutes', 'normal', 720);
  assert.equal(G.chutes, 0);
  const row = arsenal.shop.find(r => r.g === 'parachute');
  G.cash = 10000;
  assert.deepEqual(soloBuy(G, row, 3), { ok: true, qty: 3, total: row.price * 3 });
  assert.equal(G.chutes, 3 * row.n);
  soloBuy(G, row, 1);
  assert.equal(G.chutes, 4 * row.n);
});
