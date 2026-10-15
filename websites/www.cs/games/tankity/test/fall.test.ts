// Fall damage and parachutes (src/sim.ts): a unit whose ground a blast took
// away drops straight down and pays by the drop, credited to whoever dug.
// server/sim.php room_settle_tanks is the same rules; the 'fall' sim vectors
// pin the two together.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import * as sim from '../src/sim.ts';
import {
  buildArsenal, droneChutes, explode, fallDamage, fallTanks, anyTankFalling, armChutes, dueFalls, restY, settleVolley, settleFalls, CHUTE_SPEED, TUNE,
} from '../src/sim.ts';
import { soloBuy, soloDeal, soloMuster } from '../src/solo.ts';
import type { Tank, World } from '../src/sim.ts';
import type { SoloState } from '../src/solo.ts';

function must<T>(v: T | null | undefined, what: string): T {
  assert.ok(v !== null && v !== undefined, `${what} is missing`);
  return v;
}
function nth<T>(list: readonly T[], i: number): T {
  return must(list[i], `item ${i}`);
}

const GAME: { arsenal: NonNullable<Parameters<typeof buildArsenal>[0]> } = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'game.json'), 'utf8'));
const RULES = { freePx: 10, perPx: 0.5, chuteOver: 5, aiRound: 3 };
const arsenal = must(buildArsenal({ ...GAME.arsenal, fall: RULES }), 'the arsenal');

const unit = (id: string, isPlayer: boolean, x: number, y: number, hp = 100, extra: Partial<Tank> = {}): Tank =>
  ({ id, isPlayer, x, y, hp, angle: 45, power: 50, fuel: 80, ...extra });
/* A flat field at 400 with the given units; the player's tricks on the world. */
function world(tanks: Tank[], extra: Partial<World> = {}): World {
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
  const live = must(buildArsenal(GAME.arsenal), 'the arsenal');
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
  assert.deepEqual(ev.map(e => [e.kind, e.tank.id, e.kind === 'fall' ? e.dmg : undefined, e.kind === 'fall' ? e.chute : undefined, e.by && e.by.id]), [['fall', 'tank', 45, false, null]]);
});

test('the shooter whose blast dug the pit is credited: score, cash, kills, the last hit', () => {
  const me = unit('tank', true, 100, 400);
  const foe = unit('reaper', false, 300, 400, 20);
  const G = world([me, foe]);
  // A Nuke bursting 70 px under the drone digs its ground to bedrock (456) without reaching it.
  explode(G, arsenal, 300, 470, 'nuke', me, null, null);
  assert.equal(foe.hp, 20, 'the blast itself missed');
  assert.equal(foe.fellBy, 0, 'the pit remembers who dug it');
  const ev = settleFalls(G, arsenal);
  // 56 px: (56 - 10) * 0.5 = 23, more than its 20 armor.
  assert.deepEqual(ev.map(e => [e.kind, e.tank.id, e.kind === 'fall' ? e.dmg : null, e.by && e.by.id]),
    [['fall', 'reaper', 23, 'tank'], ['wreck', 'reaper', null, 'tank']]);
  assert.equal(foe.hp, 0);
  assert.equal(foe.y, 456);
  assert.equal(foe.lastHitBy, 0);
  assert.ok(me.dealt);
  assert.equal(me.kills, 1);
  assert.equal(G.score, 23 * 2 + TUNE.killBonus);
  assert.equal(G.cash, 23 * 2 + TUNE.killBonus);
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
  assert.equal(nth(ev, 0).by, null);
});

test('a drone that digs out a drone gets the kill but pays no score', () => {
  const a = unit('reaper', false, 100, 400);
  const b = unit('wraith', false, 300, 300, 5, { fellBy: 0 });
  const G = world([unit('tank', true, 600, 400), a, b].map((t, i) => (i === 2 ? { ...t, fellBy: 1 } : t)));
  settleFalls(G, arsenal);
  assert.equal(nth(G.tanks, 2).hp, 0);
  assert.equal(nth(G.tanks, 1).kills, 1);
  assert.equal(nth(G.tanks, 2).lastHitBy, 1);
  assert.equal(G.score, 0);
});

test('a parachute saves a fall over the threshold and is spent', () => {
  const me = unit('tank', true, 100, 300);
  const G = world([me, unit('reaper', false, 400, 400)], { chutes: 2 });
  const ev = settleFalls(G, arsenal);
  assert.equal(me.hp, 100);
  assert.equal(G.chutes, 1);
  assert.deepEqual(ev.map(e => [e.kind, e.kind === 'fall' ? e.dmg : undefined, e.kind === 'fall' ? e.chute : undefined]), [['fall', 0, true]]);
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
  assert.ok(hit && hit.kind === 'fall' && hit.under && hit.by === digger);
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

test('fallTanks only animates: the drawn height follows the ground, the rules never move', () => {
  const me = unit('tank', true, 100, 300, 100, { fellBy: 1 });
  const G = world([me, unit('reaper', false, 400, 400)], { chutes: 1 });
  let frames = 0;
  for (; frames < 5000 && (me.drawY ?? me.y) < 399.5; frames++) fallTanks(G, 1 / 60);
  assert.ok(frames > 3, 'it falls over several frames');
  assert.equal(me.drawY, 400, 'drawn on the ground it fell to');
  assert.equal(me.y, 300, 'its rule height waits for the settle');
  assert.equal(me.hp, 100);
  assert.equal(G.chutes, 1);
  assert.equal(G.score, 0);
  assert.ok(anyTankFalling(G), 'the settle is still owed');
  settleFalls(G, arsenal);
  fallTanks(G, 1 / 60);
  assert.equal(me.y, 400);
  assert.equal(me.drawY, undefined, 'drawn where it rests');
  assert.ok(!anyTankFalling(G));
});

test('a settled fall plays out from where it was drawn to where the settle put it', () => {
  for (const [y, chutes, hp] of [[300, 0, 55], [300, 1, 100], [379, 1, 95], [200, 0, 5], [379.46, 0, 95]] satisfies [number, number, number][]) {
    const me = unit('tank', true, 100, y);
    const G = world([me, unit('reaper', false, 400, 400)], { chutes });
    const shows = settleVolley(G, arsenal);
    assert.equal(me.hp, hp, `decided at the settle, from ${y}`);
    assert.equal(me.y, 400);
    assert.equal(me.drawY, y, 'drawn where it fell from');
    assert.equal(shows.length, hp === 100 && chutes === 0 ? 0 : 1);
    for (let i = 0; i < 5000 && anyTankFalling(G); i++) fallTanks(G, 1 / 60);
    assert.equal(me.drawY, undefined);
    assert.equal(me.hp, hp, 'the animation changed nothing');
  }
});

test('a parachute armed for a fall opens only when the unit starts to drop, and never at rest', () => {
  const me = unit('tank', true, 100, 400, 100, { chuteArmed: true });
  const G = world([me, unit('reaper', false, 400, 400)]);
  let open = 0;
  for (let f = 0; f < 120; f++) { fallTanks(G, 1 / 60); if (me.chuteOpen) open++; }
  assert.equal(open, 0, 'no canopy over a unit on its ground');
  assert.equal(me.chuteArmed, true, 'still armed');
  // The pit opens under it: it floats down under the canopy.
  for (let x = 80; x <= 120; x++) G.terrain[x] = 520;
  let falling = 0, openFalling = 0;
  const steps: number[] = [];
  let last = me.drawY ?? me.y;
  for (let f = 0; f < 5000 && anyTankFalling(G); f++) {
    fallTanks(G, 1 / 60);
    const now = me.drawY ?? me.y;
    if (now > last) steps.push(now - last);
    if (now > last && now < 519.5) { falling++; if (me.chuteOpen) openFalling++; }
    last = now;
  }
  assert.ok(falling > 0 && openFalling === falling, `under the canopy all the way down (${openFalling} of ${falling})`);
  assert.ok(steps.slice(0, -1).every(d => Math.abs(d - CHUTE_SPEED / 60) < 1e-9), 'at CHUTE_SPEED');
  assert.equal(me.chuteOpen, false, 'folded on landing');
  assert.equal(me.chuteArmed, false);
  // A free fall is quicker.
  const free = unit('tank', true, 100, 400);
  const F = world([free, unit('reaper', false, 400, 400)]);
  for (let x = 80; x <= 120; x++) F.terrain[x] = 520;
  let freeFrames = 0;
  for (; freeFrames < 5000 && (free.drawY ?? free.y) < 519.5; freeFrames++) fallTanks(F, 1 / 60);
  assert.ok(falling > 2 * freeFrames, `a chute floats down (${falling} frames against ${freeFrames})`);
});

test('a solo volley arms the parachute of a unit it digs out, so the canopy opens as it drops', () => {
  const me = unit('tank', true, 100, 400, 100, { dirS: 1, angle: 30, power: 41 });
  const foe = unit('reaper', false, 400, 400, 100, { dirS: -1, chutes: 1 });
  const G = world([me, foe], { ammo: { shell: Infinity, nuke: 9 } });
  sim.fireWeapon(G, arsenal, me, 'nuke');
  let openFrames = 0;
  for (let f = 0; f < 5000 && G.shells.length; f++) {
    fallTanks(G, 1 / 60);
    sim.stepShells(G, arsenal, 1 / 60);
    armChutes(G, arsenal);
    if (foe.chuteOpen) openFrames++;
  }
  settleVolley(G, arsenal);
  for (let f = 0; f < 5000 && anyTankFalling(G); f++) { fallTanks(G, 1 / 60); if (foe.chuteOpen) openFrames++; }
  assert.equal(foe.chutes, 0, 'the settle spent it');
  assert.ok(openFrames > 0, 'seen under the canopy');
});

test('a unit dug out by an early pellet is seen to fall at once, before the volley settles', () => {
  const me = unit('tank', true, 100, 400, 100, { dirS: 1, angle: 35, power: 80 });
  const foe = unit('reaper', false, 400, 400, 100, { dirS: -1 });
  const G = world([me, foe], { ammo: { shell: Infinity, buck: 9 } });
  sim.fireWeapon(G, arsenal, me, 'buck');
  let fellMidVolley = false;
  for (let f = 0; f < 5000 && G.shells.length; f++) {
    fallTanks(G, 1 / 60);
    sim.stepShells(G, arsenal, 1 / 60);
    if (G.shells.length && (foe.drawY ?? foe.y) > 400.5) fellMidVolley = true;
  }
  assert.ok(fellMidVolley, 'drawn falling while pellets still fly');
  assert.equal(foe.y, 400, 'the rules hold it where it stood until the settle');
});

test('a fall that wrecks a unit is seen to fall and land before its words and wreck show', () => {
  const me = unit('tank', true, 100, 400);
  const foe = unit('reaper', false, 300, 250, 20, { fellBy: 0 });
  const G = world([me, foe]);
  let pending = settleVolley(G, arsenal);
  assert.equal(foe.hp, 0);
  assert.equal(foe.shownHp, 20, 'drawn whole until it lands');
  assert.equal(foe.drawY, 250);
  const shown: [number, string[]][] = [];
  let frames = 0;
  while (pending.length && frames < 5000) {
    fallTanks(G, 1 / 60);
    frames++;
    const due = dueFalls(G, pending);
    pending = due.pending;
    for (const ch of due.due) shown.push([frames, ch.events.map(e => e.kind)]);
    if (!shown.length) assert.ok((foe.drawY ?? foe.y) <= 400, 'still in the air');
  }
  assert.ok(frames > 5, `it fell first (${frames} frames)`);
  assert.deepEqual(shown.map(s => s[1]), [['fall', 'wreck']]);
  assert.equal(foe.drawY, undefined, 'its wreck rests on the crater floor');
  assert.equal(foe.shownHp, undefined);
  // A unit that already landed shows its words the moment the settle resolves.
  const me2 = unit('tank', true, 100, 300);
  const H = world([me2, unit('reaper', false, 400, 400)]);
  for (let f = 0; f < 5000 && (me2.drawY ?? me2.y) < 399.5; f++) fallTanks(H, 1 / 60);
  const p2 = settleVolley(H, arsenal);
  assert.equal(dueFalls(H, p2).due.length, 1);
});

/* A solo volley as the page plays it: falls animate every frame and the settle
   runs once the last shell is down; and the same volley as the room server
   resolves it: every shell, then one settle. */
function soloVolley(G: World, shooter: Tank, wkey: string) {
  sim.fireWeapon(G, arsenal, shooter, wkey);
  for (let f = 0; f < 5000 && G.shells.length; f++) {
    fallTanks(G, 1 / 60);
    sim.stepShells(G, arsenal, 1 / 60);
    armChutes(G, arsenal);
    if (!G.shells.length) settleVolley(G, arsenal);
  }
  for (let f = 0; f < 5000 && anyTankFalling(G); f++) fallTanks(G, 1 / 60);
}
function roomVolley(G: World, shooter: Tank, wkey: string) {
  sim.fireWeapon(G, arsenal, shooter, wkey);
  for (let f = 0; f < 5000 && G.shells.length; f++) sim.stepShells(G, arsenal, 1 / 60);
  settleFalls(G, arsenal);
}
const outcome = (G: World) => ({ hp: G.tanks.map(t => t.hp), y: G.tanks.map(t => t.y), chutes: [G.chutes, ...G.tanks.map(t => t.chutes || 0)], score: G.score });

test('the same shot costs the same armor in a solo match and in a room', () => {
  const cases = [
    // Buckshot's pellets dig the drone's pit in several bursts: one fall, not one per pellet.
    { wkey: 'buck', angle: 45, power: 81, ground: 400, drone: {} },
    { wkey: 'buck', angle: 45, power: 81, ground: 400, drone: { chutes: 1 } },
    // Fractional ground and a fall that stops just short of a whole pixel.
    { wkey: 'shell', angle: 30, power: 62, ground: 400, drone: {} },
    { wkey: 'shell', angle: 30, power: 62, ground: 420.54, drone: {} },
    { wkey: 'mortar', angle: 33, power: 58, ground: 400.37, drone: { chutes: 1 } },
  ];
  let fell = 0;
  for (const c of cases) {
    const make = () => {
      const G = world([unit('tank', true, 100, c.ground, 100, { dirS: 1 }), unit('reaper', false, 400, c.ground, 100, { dirS: -1, ...c.drone })],
        { terrain: new Array(720).fill(c.ground), ammo: { shell: Infinity, buck: 9, mortar: 9 } });
      Object.assign(nth(G.tanks, 0), { angle: c.angle, power: c.power });
      return G;
    };
    const solo = make(), room = make();
    soloVolley(solo, nth(solo.tanks, 0), c.wkey);
    roomVolley(room, nth(room.tanks, 0), c.wkey);
    assert.deepEqual(outcome(solo), outcome(room), JSON.stringify(c));
    if (nth(room.tanks, 1).y > c.ground + 10) fell++;
  }
  assert.ok(fell >= 3, `the cases dig real pits (${fell})`);
});

test('the bunker counts toward the parachute: a fall it halves to the threshold keeps the chute', () => {
  // 26 px: raw (26 - 10) * 0.5 = 8, halved to 4, not over 5.
  const me = unit('tank', true, 100, 374);
  const G = world([me, unit('reaper', false, 400, 400)], { chutes: 1, bunker: 2 });
  settleFalls(G, arsenal);
  assert.equal(me.hp, 96);
  assert.equal(G.chutes, 1);
});

test('of several blasts under one unit, the one that lowered its ground the most is credited', () => {
  const me = unit('tank', true, 100, 400);
  const other = unit('wraith', false, 600, 400);
  const foe = unit('reaper', false, 300, 400, 100);
  const G = world([me, other, foe]);
  explode(G, arsenal, 300, 440, 'mortar', me, null, null); // deep
  explode(G, arsenal, 330, 445, 'shell', other, null, null); // shallower, later
  assert.equal(foe.fellBy, 0);
  const ev = settleFalls(G, arsenal);
  assert.equal(must(ev.find(e => e.tank === foe), 'its fall').by, me);
});
test('drones carry a parachute from the rules\' round', () => {
  assert.equal(droneChutes(arsenal, 1), 0);
  assert.equal(droneChutes(arsenal, 2), 0);
  assert.equal(droneChutes(arsenal, 3), 1);
  assert.equal(droneChutes(arsenal, 9), 1);
  const G = { body: 'tank' } as SoloState; // soloDeal fills in the rest
  soloDeal(G, arsenal, 'chutes', 'normal', 720);
  G.round = 3;
  soloMuster(G, arsenal);
  assert.deepEqual(G.tanks.slice(1).map(t => t.chutes), [1, 1, 1]);
});

test('the shop sells parachutes that stack', () => {
  const G = { body: 'tank' } as SoloState; // soloDeal fills in the rest
  soloDeal(G, arsenal, 'chutes', 'normal', 720);
  assert.equal(G.chutes, 0);
  const row = must(arsenal.shop.find(r => r.g === 'parachute'), 'the parachute row');
  G.cash = 10000;
  assert.deepEqual(soloBuy(G, row, 3), { ok: true, qty: 3, total: row.price * 3 });
  assert.equal(G.chutes, 3 * row.n);
  soloBuy(G, row, 1);
  assert.equal(G.chutes, 4 * row.n);
});
