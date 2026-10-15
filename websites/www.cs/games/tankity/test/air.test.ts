// The air a shell flies through (src/sim.ts stepBallistic): quadratic drag on
// its speed relative to the moving air, a = g - k |v - w| (v - w), with the
// wind growing with the height over the field's floor, w(h) = wind x
// AIR_SPEED x (h / SHEAR_H)^(3/16); each gun's drag factor; and the field's
// scale. protocol/sim-vectors.json holds server/flight.php to the same steps.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { AIR_SPEED, DRAG_K, GRAV, H, ROOM_W, SHEAR_H, airOf, buildArsenal, dragOf, flies, shear, shotSpeed, stepBallistic } from '../src/sim.ts';
import type { Air, Motion, Weapon } from '../src/sim.ts';
import { BAL_W, REACH_MIN, fullReach } from '../src/balance.ts';

const GAME: { arsenal: { ammo: Weapon[] } } = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'game.json'), 'utf8'));
const arsenal = buildArsenal(GAME.arsenal);
assert.ok(arsenal, 'game.json has an arsenal');
const ROWS = GAME.arsenal.ammo;

/** A flight from (x, 300) at speed v and angle a (degrees) through air, until it falls back to y = 300:
 *  its path, the top of its arc, and its landing velocity. */
function fly(v: number, a: number, air: Air): { pts: Motion[]; top: Motion; land: Motion } {
  const r = a * Math.PI / 180;
  const st: Motion = { x: 0, y: 300, vx: Math.cos(r) * v, vy: -Math.sin(r) * v };
  const pts: Motion[] = [];
  let top = { ...st };
  for (let i = 0; i < 6000; i++) {
    stepBallistic(st, 1 / 60, air);
    pts.push({ ...st });
    if (st.y < top.y) top = { ...st };
    if (st.vy > 0 && st.y >= 300) break;
  }
  return { pts, top, land: { ...st } };
}
const calm = (drag = 1): Air => airOf(ROOM_W, 0, { drag });

test('drag holds a falling shell to its terminal speed, sqrt(g / k)', () => {
  const air = calm();
  const terminal = Math.sqrt(GRAV / DRAG_K);
  const st: Motion = { x: 0, y: -2000, vx: 0, vy: 0 };
  let fastest = 0;
  for (let i = 0; i < 60 * 30; i++) {
    stepBallistic(st, 1 / 60, air);
    fastest = Math.max(fastest, st.vy);
  }
  assert.ok(Math.abs(st.vy / terminal - 1) < 0.002, `falls at ${st.vy.toFixed(2)} px/s, terminal ${terminal.toFixed(2)}`);
  assert.ok(fastest <= terminal * 1.0001, 'and never faster');
  // Thrown down faster than that, drag slows it to the same speed.
  const fast: Motion = { x: 0, y: -2000, vx: 0, vy: 3 * terminal };
  for (let i = 0; i < 60 * 30; i++) stepBallistic(fast, 1 / 60, air);
  assert.ok(Math.abs(fast.vy / terminal - 1) < 0.002, `slowed to ${fast.vy.toFixed(2)}`);
});

test('the classic artillery arc: a long climb, the top past the middle, a steep fall', () => {
  for (const a of [30, 45, 60]) {
    const { top, land } = fly(shotSpeed(100, 1), a, calm());
    assert.ok(top.x > land.x / 2, `${a} degrees: the top at ${top.x.toFixed(0)} of ${land.x.toFixed(0)}`);
    const down = Math.atan2(land.vy, land.vx) * 180 / Math.PI;
    assert.ok(down > a + 5, `${a} degrees: comes down at ${down.toFixed(1)} degrees, steeper than it left`);
    const airless = fly(shotSpeed(100, 1), a, calm(0));
    assert.ok(Math.abs(airless.top.x / airless.land.x - 0.5) < 0.01, 'an airless arc is symmetric');
    assert.ok(land.x < 0.8 * airless.land.x, `${a} degrees: drag shortens it (${land.x.toFixed(0)} against ${airless.land.x.toFixed(0)})`);
  }
});

test('the wind grows with height: (h / SHEAR_H)^(3/16), from the floor, never below 1 px', () => {
  assert.equal(shear(SHEAR_H), 1);
  assert.ok(Math.abs(shear(16 * SHEAR_H) - Math.pow(2, 0.75)) < 1e-12, 'sixteen times as high: 2^(3/4)');
  for (const h of [-50, 0, 0.5]) assert.equal(shear(h), shear(1), `${h} px reads as 1 px`);
  let last = 0;
  for (let h = 1; h <= 2000; h += 7) {
    assert.ok(shear(h) > last, `rises at ${h}`);
    last = shear(h);
  }
  // The air at the floor's height x, seen through a still shell: rx = vx - w(h).
  const air = airOf(ROOM_W, 5, { drag: 1 });
  assert.equal(air.wind, 5 * AIR_SPEED);
  const pushAt = (y: number) => {
    const st: Motion = { x: 100, y, vx: 0, vy: 0 };
    stepBallistic(st, 1 / 60, air);
    return st.vx;
  };
  assert.ok(pushAt(H - 400) > pushAt(H - 100) && pushAt(H - 100) > pushAt(H - 10), 'the higher, the harder it pushes');
  assert.ok(Math.abs(pushAt(H - SHEAR_H) - (1 / 60) * DRAG_K * (5 * AIR_SPEED) ** 2) < 1e-9, 'at SHEAR_H it blows at wind x AIR_SPEED');
});

test('a high lob drifts more than a flat shot that lands as far, by more than its longer flight explains', () => {
  // Two aims to the same spot in calm air: a flat shot at 25 degrees and a lob at 70.
  const goal = 300;
  const speedFor = (a: number) => {
    let lo = 20, hi = 1000;
    for (let i = 0; i < 50; i++) {
      const mid = (lo + hi) / 2;
      if (fly(mid, a, calm()).land.x < goal) lo = mid; else hi = mid;
    }
    return (lo + hi) / 2;
  };
  /* The same flight in a wind of one speed at every height (wind x AIR_SPEED): the drift shear adds is the difference. */
  const uniform = (v: number, a: number): number => {
    const r = a * Math.PI / 180, w = 5 * AIR_SPEED;
    const st: Motion = { x: 0, y: 300, vx: Math.cos(r) * v, vy: -Math.sin(r) * v };
    for (let i = 0; i < 6000; i++) {
      const rx = st.vx - w, ry = st.vy, d = DRAG_K * Math.sqrt(rx * rx + ry * ry);
      st.vx -= d * rx / 60;
      st.vy += (GRAV - d * ry) / 60;
      st.x += st.vx / 60;
      st.y += st.vy / 60;
      if (st.vy > 0 && st.y >= 300) break;
    }
    return st.x;
  };
  const drift = (a: number) => {
    const v = speedFor(a), still = fly(v, a, calm()).land.x;
    return { d: fly(v, a, airOf(ROOM_W, 5, { drag: 1 })).land.x - still, flat: uniform(v, a) - still };
  };
  const flat = drift(25), lob = drift(70);
  assert.ok(flat.d > 0 && lob.d > flat.d, `lob ${lob.d.toFixed(1)} px against flat ${flat.d.toFixed(1)} px`);
  // Against a wind of one speed at every height, the lob, high in faster air, gains more from the shear.
  assert.ok(lob.d / lob.flat > flat.d / flat.flat, `shear's share: lob ${(lob.d / lob.flat).toFixed(3)}, flat ${(flat.d / flat.flat).toFixed(3)}`);
});

test('negative wind is the mirror image: a shot west into a west wind lands where its mirror east lands, to the bit', () => {
  for (const wind of [3, 6, 10]) {
    const east = fly(shotSpeed(70, 1), 50, airOf(ROOM_W, wind, { drag: 1 })).land.x;
    const west = fly(shotSpeed(70, 1), 130, airOf(ROOM_W, -wind, { drag: 1 })).land.x;
    assert.ok(Math.abs(east + west) < 1e-9, `${east} against ${west}`);
  }
  const still = fly(shotSpeed(70, 1), 50, calm()).land.x;
  assert.ok(fly(shotSpeed(70, 1), 50, airOf(ROOM_W, 6, { drag: 1 })).land.x > still, 'a tail wind carries it on');
  assert.ok(fly(shotSpeed(70, 1), 50, airOf(ROOM_W, -6, { drag: 1 })).land.x < still, 'a head wind holds it back');
});

test('every gun that flies has a drag factor; one that does not fly has none', () => {
  for (const row of ROWS) {
    if (flies(row)) assert.ok(typeof row.drag === 'number' && row.drag >= 0.1 && row.drag <= 5, `${row.name}: drag ${row.drag}`);
    else assert.equal(row.drag, undefined, `${row.name} does not fly`);
  }
  assert.equal(dragOf({}), 1, 'a row that names none flies as a Shell');
  assert.equal(airOf(ROOM_W, 0, { drag: 2.5 }).k, DRAG_K * 2.5);
});

test('a gun\'s drag factor sets its reach: slick guns outrange the Shell, draggy ones fall short', () => {
  const shell = fullReach({ ...arsenal.weapons['shell']!, drag: 1 });
  for (const row of ROWS) {
    if (!flies(row) || row.missile || row.speed !== 1) continue;
    const r = fullReach(arsenal.weapons[row.key]!);
    if (dragOf(row) < 1) assert.ok(r > shell, `${row.name} (drag ${row.drag}) ${r.toFixed(0)} against the Shell's ${shell.toFixed(0)}`);
    if (dragOf(row) > 1) assert.ok(r < shell, `${row.name} (drag ${row.drag}) ${r.toFixed(0)} against the Shell's ${shell.toFixed(0)}`);
  }
});

test('short range is rare and on purpose: only a few draggy guns, and only they fall under the reach floor', () => {
  const short = ROWS.filter(r => r.shortRange);
  assert.ok(short.length <= 5, short.map(r => r.name).join());
  for (const row of short) assert.ok(dragOf(row) > 1 && !row.missile, `${row.name} is short because the air slows it`);
  for (const row of ROWS) {
    if (!flies(row) || row.shortRange) continue;
    assert.ok(fullReach(arsenal.weapons[row.key]!) >= REACH_MIN * BAL_W, row.name);
  }
});

test('a wider field scales the air: k / s, the wind x sqrt(s), the height / s', () => {
  for (const w of [1080, 1440]) {
    const s = w / ROOM_W, air = airOf(w, 4, { drag: 1 });
    assert.equal(air.s, s);
    assert.ok(Math.abs(air.k - DRAG_K / s) < 1e-15);
    assert.ok(Math.abs(air.wind - 4 * AIR_SPEED * Math.sqrt(s)) < 1e-12);
    // A flight scaled by s (speeds by sqrt(s), heights over the floor by s) is the room's, scaled.
    const room = fly(200, 50, airOf(ROOM_W, 4, { drag: 1 })), wide = fly(200 * Math.sqrt(s), 50, air);
    assert.ok(Math.abs(wide.land.x / (room.land.x * s) - 1) < 0.03, `${w}: ${(wide.land.x / s).toFixed(1)} against ${room.land.x.toFixed(1)}`);
  }
});
