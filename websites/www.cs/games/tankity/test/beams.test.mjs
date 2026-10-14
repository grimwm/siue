// Beams, plasma rings and tracers in the browser's sim (src/sim.ts): no
// flight for a beam or a ring, a harmless marked flight for a tracer. The
// room server's twins are pinned to these by protocol/sim-vectors.json; these
// tests pin the rules themselves on rows built here, so they do not lean on
// game.yaml's numbers.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { H, aimLimits, beamCarve, buildArsenal, carveCrater, fireBeam, firePlasma, fireWeapon, muzzle, mulberry32, stepShells, unitHitBox, inHitBox } from '../src/sim.ts';
import { dcos, dsin } from '../src/detmath.ts';

const GAME = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'game.json'), 'utf8'));
const ZAP = { key: 'zap', name: 'Zap', dmg: 45, radius: 6, price: 1, pack: 1, minRound: 1, effect: 'beam', range: 520, aimMin: -20, speed: 1 };
const RING = { key: 'ring', name: 'Ring', dmg: 60, radius: 90, price: 1, pack: 1, minRound: 1, effect: 'plasma', speed: 1 };
const MARK = { key: 'mark', name: 'Mark', dmg: 0, radius: 0, price: 1, pack: 1, minRound: 1, effect: 'tracer', speed: 1, gfx: { shell: '#fff', trail: '#fff', painter: 'dash', mark: 'line' } };
const arsenal = buildArsenal({ ammo: [...GAME.arsenal.ammo.filter(a => a.key === 'shell'), ZAP, RING, MARK], gear: GAME.arsenal.gear, fall: GAME.arsenal.fall });

const flat = (y = 400, w = 720) => Array(w).fill(y);
const human = (x, y = 400, more = {}) => ({ id: 'you', isPlayer: true, x, y, angle: 45, power: 100, hp: 100, fuel: 80, dirS: 1, ...more });
const drone = (x, y = 400, more = {}) => ({ id: 'd' + x, isPlayer: false, x, y, angle: 45, power: 100, hp: 100, fuel: 80, dirS: -1, ...more });
const world = (tanks, terrain = flat(), extra = {}) => ({ tanks, terrain, wind: 0, round: 1, rng: mulberry32(1), shells: [], score: 0, cash: 0,
  ammo: { shell: Infinity, zap: 3, ring: 3, mark: 3 }, selected: 'shell', shield: false, bunker: 0, laststand: false, jammer: 0, ...extra });
/* Where a beam fired by t is s px along its line. */
const along = (t, s) => { const m = muzzle(t), a = t.angle / 180 * Math.PI, f = t.dirS || 1; return { x: m.x + dcos(a) * f * s, y: m.y - dsin(a) * s }; };
/* A drone standing so that the beam fired by t crosses its body s px along. */
const droneOnBeam = (t, s) => { const p = along(t, s); return drone(p.x, p.y + 30); };

test('a beam hits every unit on its line once, for its flat damage, drones included', () => {
  const me = human(100);
  const a = droneOnBeam(me, 120), b = droneOnBeam(me, 220);
  const W = world([me, a, b]);
  const shot = fireBeam(W, arsenal, me, 'zap');
  assert.equal(a.hp, 55);
  assert.equal(b.hp, 55);
  assert.deepEqual(shot.hits.events.map(e => [e.kind, e.tank, e.dmg]), [['wound', a, 45], ['wound', b, 45]]);
  assert.ok(shot.hits.events.every(e => e.direct === false), 'no direct-hit double');
  assert.equal(me.hp, 100, 'its gunner is never hit');
  assert.equal(W.cash, 180, 'the player is paid twice the damage');
});

test('power sets the reach: a short beam stops short of a unit further along', () => {
  const me = human(100, 400, { power: 20 });
  const far = droneOnBeam({ ...me, power: 100 }, 200);
  const W = world([me, far]);
  const shot = fireBeam(W, arsenal, me, 'zap');
  assert.equal(far.hp, 100);
  const len = Math.hypot(shot.x1 - shot.x0, shot.y1 - shot.y0);
  assert.ok(len <= 520 * 0.2 && len > 520 * 0.2 - 3, `beam ${len} px`);
  assert.deepEqual([shot.x0, shot.y0], [muzzle(me).x, muzzle(me).y]);
});

test('a wider field reaches further, as its shells fly further', () => {
  const me = human(100, 400, { angle: 30 });
  const short = fireBeam(world([me], flat(400, 720)), arsenal, me, 'zap');
  const long = fireBeam(world([me], flat(400, 1440)), arsenal, me, 'zap');
  const len = s => Math.hypot(s.x1 - s.x0, s.y1 - s.y0);
  assert.ok(len(long) > len(short) * 1.35, `${len(long)} vs ${len(short)}`);
});

test('a beam stops at the side of the field', () => {
  const me = human(650, 400, { angle: 15 });
  const shot = fireBeam(world([me]), arsenal, me, 'zap');
  assert.ok(shot.x1 < 720 && shot.x1 > 716, String(shot.x1));
});

test('a beam cuts a channel through a hill and nowhere else', () => {
  const terrain = flat(400);
  for (let x = 200; x <= 260; x++) terrain[x] = 300;
  const me = human(100, 400, { angle: 30 });
  const W = world([me], terrain.slice());
  const shot = fireBeam(W, arsenal, me, 'zap');
  const want = terrain.slice();
  beamCarve(want, shot.x0, shot.y0, shot.x1, shot.y1, 6);
  assert.deepEqual(W.terrain, want, 'the sim carves what beamCarve carves');
  assert.ok(W.terrain.slice(200, 261).some((y, i) => y > terrain[200 + i]), 'the hill is cut');
  assert.deepEqual(W.terrain.slice(0, 190), terrain.slice(0, 190), 'open ground is untouched');
});

test('beamCarve carves a crater every radius px from the start, not at the start', () => {
  const t = flat(300), want = flat(300);
  beamCarve(t, 100, 300, 130, 300, 10);
  for (const x of [110, 120, 130]) carveCrater(want, x, 300, 10, H - 4);
  assert.deepEqual(t, want);
});

test('a beam into a shield spends the shield and does no damage', () => {
  const d = drone(100, 400, { dirS: 1, angle: 20 });
  const me = human(0, 0, { dirS: -1 });
  const p = along(d, 150);
  Object.assign(me, { x: p.x, y: p.y + 10 });
  assert.ok(inHitBox(me, p.x, p.y));
  const W = world([d, me], flat(), { shield: true });
  const shot = fireBeam(W, arsenal, d, 'zap');
  assert.equal(me.hp, 100);
  assert.equal(W.shield, false);
  assert.deepEqual(shot.hits.events.map(e => e.kind), ['shield']);
});

test('a beam marks its victim and its shooter as a blast does', () => {
  const me = human(100);
  const a = droneOnBeam(me, 150);
  const W = world([me, a]);
  fireBeam(W, arsenal, me, 'zap');
  assert.equal(a.lastHitBy, 0);
  assert.equal(me.dealt, true);
});

test('a plasma ring hurts everyone near, with falloff, and spares its gunner', () => {
  const me = human(300);
  const near = drone(330), mid = drone(380), far = drone(420);
  const W = world([me, near, mid, far]);
  const ring = firePlasma(W, arsenal, me, 'ring');
  const b = unitHitBox(me);
  assert.deepEqual([ring.x, ring.y, ring.r], [b.cx, b.cy, 90]);
  assert.equal(me.hp, 100);
  const hurt = d => { const u = unitHitBox(d); return Math.round(60 * Math.max(0.3, 1 - Math.hypot(u.cx - b.cx, u.cy - b.cy) / 104)); };
  assert.equal(near.hp, 100 - hurt(near));
  assert.equal(mid.hp, 100 - hurt(mid));
  assert.ok(near.hp < mid.hp);
  assert.equal(far.hp, 100, 'out past radius + 14');
});

test('power sets the ring: power 30 is a small ring, and it is never under 20', () => {
  const me = human(300, 400, { power: 30 });
  const d = drone(345);
  const W = world([me, d]);
  assert.equal(firePlasma(W, arsenal, me, 'ring').r, 27);
  assert.equal(d.hp, 100, '45 px off is past a 27 px ring');
  me.power = 10;
  assert.equal(firePlasma(world([me]), arsenal, me, 'ring').r, 20);
});

test('a plasma ring cuts no crater', () => {
  const me = human(300);
  const W = world([me, drone(330)]);
  firePlasma(W, arsenal, me, 'ring');
  assert.deepEqual(W.terrain, flat());
});

test('firing a beam or a ring resolves at once: no shells, the round spent, the event to play', () => {
  const me = human(100);
  const a = droneOnBeam(me, 150);
  const W = world([me, a]);
  const launch = fireWeapon(W, arsenal, me, 'zap');
  assert.equal(W.shells.length, 0);
  assert.equal(W.ammo.zap, 2);
  assert.equal(launch.now.length, 1);
  assert.equal(launch.now[0].kind, 'beam');
  assert.equal(launch.now[0].shot.hits.events.length, 1);
  const ring = fireWeapon(W, arsenal, me, 'ring');
  assert.equal(W.shells.length, 0);
  assert.equal(ring.now[0].kind, 'ring');
  const shell = fireWeapon(W, arsenal, me, 'shell');
  assert.deepEqual(shell.now, []);
  assert.equal(W.shells.length, 1);
});

test('a tracer flies like a shell and leaves only its mark: no blast, no crater, no damage', () => {
  const me = human(100, 400, { angle: 50, power: 60 });
  const d = drone(400);
  const W = world([me, d]);
  fireWeapon(W, arsenal, me, 'mark');
  assert.equal(W.shells.length, 1);
  const kinds = [];
  for (let i = 0; i < 1200 && W.shells.length; i++) for (const e of stepShells(W, arsenal, 1 / 60)) kinds.push(e.kind);
  assert.equal(W.shells.length, 0);
  assert.ok(!kinds.includes('blast'));
  assert.equal(kinds.filter(k => k === 'mark').length, 1);
  assert.deepEqual(W.terrain, flat());
  assert.equal(d.hp, 100);
});

test('a tracer that strikes a unit stops there, harmlessly', () => {
  const me = human(100, 400, { angle: 10, power: 40 });
  const d = drone(160, 420);
  const W = world([me, d]);
  fireWeapon(W, arsenal, me, 'mark');
  let mark = null;
  for (let i = 0; i < 600 && W.shells.length; i++) for (const e of stepShells(W, arsenal, 1 / 60)) if (e.kind === 'mark') mark = e;
  assert.ok(mark && Math.abs(mark.x - 160) < 20, JSON.stringify(mark && { x: mark.x, y: mark.y }));
  assert.equal(d.hp, 100);
});

test('the barrel reaches 10..170, and a beam row\'s aimMin dips it below level on either side', () => {
  assert.deepEqual(aimLimits(arsenal.weapons.shell), { min: 10, max: 170 });
  assert.deepEqual(aimLimits(arsenal.weapons.zap), { min: -20, max: 200 });
  assert.deepEqual(aimLimits(undefined), { min: 10, max: 170 });
});

test('a gun fires inside its own limits: a beam at -20, a Shell held at -20 leaves at 10', () => {
  const me = human(100, 400, { angle: -20 });
  const W = world([me]);
  const b = fireWeapon(W, arsenal, me, 'zap');
  assert.equal(me.angle, -20);
  assert.ok(b.now[0].shot.y1 > b.now[0].shot.y0, 'the beam runs downhill');
  fireWeapon(W, arsenal, me, 'shell');
  assert.equal(me.angle, 10, 'the Shell is clamped to its own minimum before it leaves');
  me.angle = 205;
  fireWeapon(W, arsenal, me, 'zap');
  assert.equal(me.angle, 200);
});

test('from level ground a beam held level hits an equal-height hull far off', () => {
  const me = human(100, 400, { angle: 0 });
  const far = drone(400, 400, { isPlayer: false, human: true });
  const W = world([me, far]);
  fireBeam(W, arsenal, me, 'zap');
  assert.equal(far.hp, 55);
});
