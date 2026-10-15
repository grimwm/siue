// Missiles (game.yaml `missile: true`): self-propelled guns whose power picks
// how far they fly (src/sim.ts launchSpeed, missileTable). At 45 degrees in
// calm air power p lands about p% of the field away and full power at the far
// edge, never past it; drag and wind shape the arc but cannot cut the reach
// short; a gale drifts one by no more than MISSILE_WIND_MARGIN of the field; a
// seeker's homing never carries it off; drones aim them. tools/game-json.php
// writes each table with server/flight.php, and this file holds it to the
// browser's own bisection, bit for bit.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  MISSILE_WIND_MARGIN, ROOM_W, airOf, buildArsenal, fieldReach, fireWeapon, launchSpeed, missileTable, mulberry32, muzzle, rad, shotSpeed,
  simShot, stepBallistic, stepShells,
} from '../src/sim.ts';
import type { Motion, Tank, Weapon, World } from '../src/sim.ts';
import { aiChoose } from '../src/ai.ts';

const GAME: { arsenal: { ammo: Weapon[] } } = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'game.json'), 'utf8'));
const built = buildArsenal(GAME.arsenal);
assert.ok(built, 'game.json has an arsenal');
const arsenal = built;
const MISSILES = arsenal.order.filter(k => arsenal.weapons[k]!.missile);
const WIDTHS = [720, 1080, 1440];
const POWERS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
/** A unit's spot this far from either edge: as close as a round deals one (sim.ts spawnSpots). */
const EDGE = 30;

/** Where missile k fired from x0 (facing dirS) at this angle and power lands on flat ground at 400
 *  on a field w wide, flown on past either edge (so a landing off the field reads as where it is). */
function landing(k: string, w: number, x0: number, dirS: number, power: number, wind = 0, angle = 45): number {
  const gun = arsenal.weapons[k]!;
  const m = muzzle({ x: x0, y: 400, angle, dirS, isPlayer: true });
  const v = launchSpeed(gun, power, fieldReach(w)), r = rad(angle);
  const st: Motion = { x: m.x, y: m.y, vx: Math.cos(r) * v * dirS, vy: -Math.sin(r) * v };
  const air = airOf(w, wind, gun);
  for (let i = 0; i < 6000; i++) {
    stepBallistic(st, 1 / 60, air);
    if (i >= 6 && st.y >= 400) break;
  }
  return st.x;
}

test('the missiles are the self-propelled guns, flagged in the data', () => {
  assert.ok(MISSILES.length >= 3, MISSILES.join());
  for (const k of MISSILES) {
    const w = arsenal.weapons[k]!;
    assert.equal(w.speed, 1, `${w.name}: its power, not a speed, picks how far it flies`);
    assert.ok(Array.isArray(w.missileSpeed) && w.missileSpeed.length === 101, `${w.name} carries its speed table`);
  }
});

test('game.json\'s missile tables are the browser\'s own bisection, to the bit (the server wrote them)', () => {
  for (const k of MISSILES) {
    const w: Readonly<Weapon> = arsenal.weapons[k]!, mine = missileTable(w.drag!);
    for (let p = 0; p <= 100; p++) assert.ok(Object.is(mine[p], w.missileSpeed![p]), `${w.name} at ${p}: ${mine[p]} against ${w.missileSpeed![p]}`);
  }
});

test('a missile\'s speed between two whole powers is straight between theirs, and its power is clamped to 0..100', () => {
  for (const k of MISSILES) {
    const w: Readonly<Weapon> = arsenal.weapons[k]!, tab: readonly number[] = w.missileSpeed!;
    assert.equal(launchSpeed(w, 37), tab[37]);
    assert.ok(Math.abs(launchSpeed(w, 37.25) - (tab[37]! + (tab[38]! - tab[37]!) * 0.25)) < 1e-12);
    assert.equal(launchSpeed(w, 140), tab[100]);
    assert.equal(launchSpeed(w, -5), tab[0]);
    assert.equal(launchSpeed(w, 100, fieldReach(1440)), tab[100]! * fieldReach(1440));
  }
  // A cannon's speed is untouched.
  assert.equal(launchSpeed(arsenal.weapons['shell']!, 60), shotSpeed(60, 1));
});

for (const w of WIDTHS) {
  test(`${w} wide: every missile at 45 degrees in calm air lands on the field, further with every step of power`, () => {
    for (const k of MISSILES) {
      for (const [x0, dirS] of [[EDGE, 1], [w - EDGE, -1]] as const) {
        let last = -Infinity;
        for (const p of POWERS) {
          const x = landing(k, w, x0, dirS, p), far = (x - x0) * dirS;
          assert.ok(x >= 0 && x <= w, `${k} at ${p} from ${x0}: lands at ${x.toFixed(1)}`);
          assert.ok(far > last, `${k} at ${p}: ${far.toFixed(1)} px, no further than at ${p - 10}`);
          last = far;
        }
        // About p% of the field: within 10 points of it at every power from 20 up.
        for (const p of POWERS.slice(1)) {
          const share = (landing(k, w, x0, dirS, p) - x0) * dirS / w * 100;
          assert.ok(Math.abs(share - p) <= 10, `${k} at ${p}: ${share.toFixed(1)}% of the field`);
        }
      }
    }
  });
}

test('full power reaches at least 95% of a room\'s field, and at least 93% of the widest', () => {
  for (const k of MISSILES) {
    assert.ok(landing(k, ROOM_W, EDGE, 1, 100) / ROOM_W >= 0.95, `${k}: ${landing(k, ROOM_W, EDGE, 1, 100).toFixed(1)}`);
    // The barrel and the drop to the ground below it do not grow with the field.
    assert.ok(landing(k, 1440, EDGE, 1, 100) / 1440 >= 0.93, `${k}: ${landing(k, 1440, EDGE, 1, 100).toFixed(1)}`);
  }
});

test(`in a wind of 10 either way, full power lands on the field or within ${MISSILE_WIND_MARGIN * 100}% of its width past the edge`, () => {
  for (const w of WIDTHS) {
    for (const k of MISSILES) {
      for (const wind of [10, -10]) {
        for (const [x0, dirS] of [[EDGE, 1], [w - EDGE, -1]] as const) {
          const x = landing(k, w, x0, dirS, 100, wind);
          assert.ok(x >= -MISSILE_WIND_MARGIN * w && x <= (1 + MISSILE_WIND_MARGIN) * w, `${w} ${k} wind ${wind} from ${x0}: ${x.toFixed(1)}`);
          // Into the wind it still crosses most of the field: the air does not cut a missile short.
          if (wind * dirS < 0) assert.ok((x - x0) * dirS >= 0.85 * w, `${w} ${k} into wind ${wind}: ${((x - x0) * dirS).toFixed(1)} px`);
        }
      }
    }
  }
});

/** A two-unit world on flat ground at 400. */
function duel(w: number, gx: number, rx: number, wind: number, gun: string, extra: Partial<World> = {}): { G: World; me: Tank; foe: Tank } {
  const dirS = rx > gx ? 1 : -1;
  const me: Tank = { id: 'G', isPlayer: true, x: gx, y: 400, hp: 1e6, angle: 45, power: 50, fuel: 0, dirS };
  const foe: Tank = { id: 'R', isPlayer: false, x: rx, y: 400, hp: 1e6, angle: 45, power: 50, fuel: 80, dirS: -dirS, ammo: {}, s: 'hunter' };
  const G: World = {
    tanks: [me, foe], terrain: new Array(w).fill(400), wind, round: 12, rng: mulberry32(5), shells: [], score: 0, cash: 0,
    ammo: { shell: Infinity, [gun]: 999 }, selected: gun, shield: false, bunker: 0, laststand: false, jammer: 0, chutes: 0, ...extra,
  };
  return { G, me, foe };
}

test('a seeker\'s homing turns it but never carries it off the field', () => {
  const seekers = MISSILES.filter(k => arsenal.weapons[k]!.effect === 'seeker');
  assert.ok(seekers.length > 0);
  for (const k of seekers) {
    for (const w of [720, 1440]) {
      for (const wind of [-10, 0, 10]) {
        for (const gx of [EDGE, w - EDGE]) {
          for (const rx of [0.15, 0.5, 0.85, 0.97].map(f => Math.round(f * w))) {
            if (Math.abs(rx - gx) < 50) continue;
            for (const p of POWERS) {
              for (const a of [30, 45, 70]) {
                const { G, me } = duel(w, gx, rx, wind, k);
                me.angle = a;
                me.power = p;
                fireWeapon(G, arsenal, me, k);
                let x = me.x;
                for (let f = 0; f < 6000 && G.shells.length; f++) {
                  stepShells(G, arsenal, 1 / 60);
                  for (const s of G.shells) x = s.x;
                }
                const margin = MISSILE_WIND_MARGIN * w;
                assert.ok(x >= -margin && x <= w + margin, `${k} ${w} wind ${wind} from ${gx} at ${rx}, ${a} degrees, power ${p}: last seen at ${x.toFixed(1)}`);
              }
            }
          }
        }
      }
    }
  }
});

test('drones aim missiles onto their target, near or far', () => {
  for (const k of MISSILES) {
    const w = arsenal.weapons[k]!;
    const misses: number[] = [];
    for (const [gx, rx] of [[100, 260], [100, 420], [120, 640], [620, 200], [600, 90]] as const) {
      for (const wind of [-6, 0, 6]) {
        const { G, me, foe } = duel(ROOM_W, gx, rx, wind, k, { difficulty: 'hard' });
        // The drone fires; the target is the human, and the drone carries only this missile and the Shell.
        foe.ammo = { shell: Infinity, [k]: 9 };
        const c = aiChoose(G, arsenal, foe);
        if (c.wkey !== k) continue;
        const m = muzzle({ ...foe, angle: c.angle });
        const land = simShot(G, arsenal, m.x, m.y, c.angle, c.power, k, foe.dirS!);
        misses.push(land.oob ? Infinity : Math.abs(land.x - me.x));
      }
    }
    // A drone also carries the Shell, and fires it where it does as much: the missile must win a few.
    assert.ok(misses.length >= 5, `${w.name} chosen ${misses.length} times of 15`);
    misses.sort((a, b) => a - b);
    assert.ok(misses[misses.length >> 1]! <= 30, `${w.name}: median miss ${misses[misses.length >> 1]} px (${misses.map(m => m.toFixed(0)).join()})`);
    assert.ok(misses.every(m => Number.isFinite(m)), `${w.name}: never off the field (${misses.join()})`);
  }
});
