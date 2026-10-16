// The arena's walls (src/walls.ts): None leaves the field's sides open,
// Concrete bursts a shell on the wall, Rubber and Spring bounce it back
// (slower, faster), Wraparound carries it to the other side. Every flight
// meets them in one place (stepBallistic through the air's walls), so the
// war, the drones' search and the aim guide fly the same walls; rollers roll
// back off them, and liquid pools against the solid ones. server/walls.php is
// held to the same by the `walls` sim vectors.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  airOf, buildArsenal, fireWeapon, flightTop, launchSpeed, mulberry32, muzzle, rad, rollOut, simShot, splitPoint, stepBallistic, stepShells, volleyOn,
} from '../src/sim.ts';
import { dcos, dsin } from '../src/detmath.ts';
import type { Blast, FallRules, Gear, StepEvent, Tank, Weapon, World } from '../src/sim.ts';
import { firePool } from '../src/fire.ts';
import { applyEarth, pourLevel } from '../src/earth.ts';
import { aiChoose } from '../src/ai.ts';
import { ZOOM_FLOOR, cameraTarget, stepHold } from '../src/camera.ts';
import {
  REAL_WALLS, RUBBER_KEEP, SPRING_KICK, WALLS, WALL_BOUNCE, WALL_BURST, WALL_NONE, WALL_WRAP, parseWalls, wallRoll, wallStep, wallsFor,
  wallsLine, wallsSetting,
} from '../src/walls.ts';
import type { Walls } from '../src/walls.ts';

function must<T>(v: T | null | undefined, what: string): T {
  assert.ok(v !== null && v !== undefined, `${what} is missing`);
  return v;
}
const GAME: { arsenal: { ammo: Weapon[]; gear?: Gear[]; fall?: Partial<FallRules> } } = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'game.json'), 'utf8'));
const arsenal = must(buildArsenal(GAME.arsenal), 'the arsenal');
const gun = (k: string): Readonly<Weapon> => must(arsenal.weapons[k], `the ${k} row`);
const first = (effect: string, missile = false): string =>
  must(arsenal.order.find(k => gun(k).effect === effect && !!gun(k).missile === missile), `a ${effect} gun`);
const SHELL = first('shot');
const ROLLER = first('roller');
const NAPALM = first('napalm');
const POUR = first('pour');
const MISSILE = must(arsenal.order.find(k => gun(k).missile && gun(k).effect === 'shot'), 'a missile that bursts');
const W = 720;
const flat = (y = 400, n = W): number[] => Array(n).fill(y);

test('a step that stays on the field meets no wall', () => {
  for (const walls of WALLS) {
    const st = { x: 300, y: 200, vx: 120, vy: -40 };
    assert.equal(wallStep(st, walls, W, 298, 201), WALL_NONE);
    assert.deepEqual(st, { x: 300, y: 200, vx: 120, vy: -40 });
  }
});

test('None leaves the sides open: the shell flies on off the field', () => {
  const st = { x: 723, y: 200, vx: 300, vy: -50 };
  assert.equal(wallStep(st, 'none', W, 718, 202), WALL_NONE);
  assert.deepEqual(st, { x: 723, y: 200, vx: 300, vy: -50 });
});

test('Rubber bounces a shell back off either wall, slower across it, its overshoot mirrored onto the field', () => {
  const right = { x: 722, y: 200, vx: 300, vy: -50 };
  assert.equal(wallStep(right, 'rubber', W, 717, 202), WALL_BOUNCE);
  assert.deepEqual(right, { x: 716, y: 200, vx: -300 * RUBBER_KEEP, vy: -50 });
  const left = { x: -4, y: 90, vx: -200, vy: 30 };
  assert.equal(wallStep(left, 'rubber', W, 1, 89), WALL_BOUNCE);
  assert.deepEqual(left, { x: 4, y: 90, vx: 200 * RUBBER_KEEP, vy: 30 });
  assert.ok(RUBBER_KEEP < 1, 'rubber loses speed');
});

test('Spring bounces a shell back faster across the wall', () => {
  const st = { x: 721, y: 300, vx: 240, vy: 10 };
  assert.equal(wallStep(st, 'spring', W, 716, 299), WALL_BOUNCE);
  assert.deepEqual(st, { x: 717, y: 300, vx: -240 * SPRING_KICK, vy: 10 });
  assert.ok(SPRING_KICK > 1, 'a spring adds speed');
});

test('Wraparound carries a shell to the other side at the same height and velocity', () => {
  const right = { x: 723.5, y: 150, vx: 260, vy: -20 };
  assert.equal(wallStep(right, 'wrap', W, 719, 151), WALL_WRAP);
  assert.deepEqual(right, { x: 3.5, y: 150, vx: 260, vy: -20 });
  const left = { x: -2, y: 80, vx: -90, vy: 40 };
  assert.equal(wallStep(left, 'wrap', W, 2, 79), WALL_WRAP);
  assert.deepEqual(left, { x: 718, y: 80, vx: -90, vy: 40 });
});

test('Concrete stops a shell on the wall, at the height it crossed it', () => {
  const st = { x: 724, y: 210, vx: 300, vy: 60 };
  assert.equal(wallStep(st, 'concrete', W, 714, 200), WALL_BURST);
  assert.equal(st.x, 719);
  assert.ok(Math.abs(st.y - 205) < 1e-12, `${st.y}`);
  const left = { x: -3, y: 100, vx: -100, vy: 0 };
  assert.equal(wallStep(left, 'concrete', W, 1, 100), WALL_BURST);
  assert.equal(left.x, 0);
});

test('a roller rolls back off Rubber and Spring, through Wraparound, and stops at None and Concrete', () => {
  const r = { x: 721, u: 80 };
  assert.equal(wallRoll(r, 'rubber', W), WALL_BOUNCE);
  assert.deepEqual(r, { x: 717, u: -80 * RUBBER_KEEP });
  const s = { x: -1, u: -50 };
  assert.equal(wallRoll(s, 'spring', W), WALL_BOUNCE);
  assert.deepEqual(s, { x: 1, u: 50 * SPRING_KICK });
  const w = { x: 720.5, u: 60 };
  assert.equal(wallRoll(w, 'wrap', W), WALL_WRAP);
  assert.deepEqual(w, { x: 1.5, u: 60 });
  for (const walls of ['none', 'concrete'] as const) {
    const n = { x: 721, u: 80 };
    assert.equal(wallRoll(n, walls, W), WALL_NONE);
    assert.deepEqual(n, { x: 721, u: 80 });
  }
});

test('Random plays one of the four real walls, drawn once from the round\'s stream; every other setting draws nothing', () => {
  const seen = new Set<Walls>();
  const rng = mulberry32(11);
  for (let i = 0; i < 200; i++) seen.add(wallsFor('random', rng));
  assert.deepEqual([...seen].sort(), [...REAL_WALLS].sort());
  for (const w of WALLS) assert.equal(wallsFor(w, () => { throw new Error('drew'); }), w);
  assert.equal(wallsFor('random', () => 0.999999), 'wrap');
  assert.equal(wallsFor('random', () => 0), 'concrete');
});

test('anything unknown reads as None; the line names the wall', () => {
  for (const odd of [undefined, null, '', 'brick', 3, 'random']) assert.equal(parseWalls(odd), 'none');
  assert.equal(parseWalls('rubber'), 'rubber');
  assert.equal(wallsLine('wrap'), 'Walls: Wraparound');
  assert.equal(wallsLine('none'), '');
  assert.equal(wallsLine(undefined), '');
});

test('the solo setting is kept under tankity-walls, None when missing or unknown', () => {
  const store = new Map<string, string>();
  const storage = { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => { store.set(k, v); }, removeItem: (k: string) => { store.delete(k); } };
  const s = wallsSetting(storage);
  assert.equal(s.get(), 'none');
  s.set('random');
  assert.equal(store.get('tankity-walls'), 'random');
  assert.equal(s.get(), 'random');
  store.set('tankity-walls', 'lava');
  assert.equal(s.get(), 'none');
});

/* ---- flights: the walls are in the air every flight flies through ---- */

/** A shot from a unit at x0 facing dirS, as simShot predicts it, on flat ground at 400. */
function predict(wkey: string, walls: Walls, x0: number, dirS: number, angle: number, power: number, wind = 0) {
  const m = muzzle({ x: x0, y: 400, angle, dirS, isPlayer: true });
  return simShot({ terrain: flat(), wind, walls }, arsenal, m.x, m.y, angle, power, wkey, dirS);
}

test('a full-power Shell fired at the near wall: off the field with None, back onto it with Rubber and Spring, through it with Wraparound', () => {
  const none = predict(SHELL, 'none', 650, 1, 45, 100);
  assert.ok(none.oob, 'None: it leaves the field');
  const rubber = predict(SHELL, 'rubber', 650, 1, 45, 100);
  const spring = predict(SHELL, 'spring', 650, 1, 45, 100);
  for (const [name, land] of [['rubber', rubber], ['spring', spring]] as const) {
    assert.ok(!land.oob, `${name}: it lands on the field`);
    assert.ok(land.x > 0 && land.x < 650, `${name}: it comes back past its gunner, x ${land.x}`);
    assert.ok(land.vx < 0, `${name}: it comes down heading back`);
  }
  assert.ok(spring.x < rubber.x, `the spring throws it further back (${spring.x} against ${rubber.x})`);
  const wrap = predict(SHELL, 'wrap', 650, 1, 45, 100);
  assert.ok(!wrap.oob && wrap.x > 0 && wrap.x < 650 && wrap.vx > 0, `Wraparound: it comes in at the left still heading right, x ${wrap.x}`);
});

test('the bounce angle: off Rubber the shell climbs or falls as it did, only its speed across the wall turns round and drops', () => {
  const st = { x: 700, y: 200, vx: 1500, vy: -30 };
  const air = airOf(W, 0, gun(SHELL), 'rubber');
  const vy0 = st.vy;
  assert.equal(stepBallistic(st, 1 / 60, air), WALL_BOUNCE);
  assert.ok(st.vx < 0 && st.x <= 719, `${st.x} ${st.vx}`);
  // The step's own air and gravity act first; the bounce flips what is left across the wall.
  const free = { x: 700, y: 200, vx: 1500, vy: -30 };
  stepBallistic(free, 1 / 60, airOf(W, 0, gun(SHELL)));
  assert.ok(Math.abs(st.vx + free.vx * RUBBER_KEEP) < 1e-9, 'vx turned round, times the keep');
  assert.equal(st.vy, free.vy, 'vy is untouched by the wall');
  assert.notEqual(st.vy, vy0);
});

test('Concrete: the shell bursts on the wall, above the ground', () => {
  const land = predict(SHELL, 'concrete', 650, 1, 45, 100);
  assert.ok(!land.oob);
  assert.equal(land.x, 719);
  assert.ok(land.y < 400, `on the wall at ${land.y}, over the ground`);
});

test('a cluster that meets Concrete before its fuse bursts there instead of splitting', () => {
  const k = first('cluster', true);
  const m = muzzle({ x: 715, y: 400, angle: 20, dirS: 1, isPlayer: true });
  assert.equal(splitPoint({ terrain: flat(), wind: 0, walls: 'concrete' }, arsenal, m.x, m.y, 20, 100, k, 1), null);
  assert.ok(splitPoint({ terrain: flat(), wind: 0, walls: 'wrap' }, arsenal, m.x, m.y, 20, 100, k, 1));
});

test('a missile at full power keeps its reach mapping on an open field, and the walls take over only at the edge', () => {
  // From the middle at 45 degrees a full-power missile lands on the field: every wall leaves it where None does.
  const mid = predict(MISSILE, 'none', 200, 1, 45, 60);
  assert.ok(!mid.oob);
  for (const walls of WALLS) {
    const land = predict(MISSILE, walls, 200, 1, 45, 60);
    assert.equal(land.x, mid.x, `${walls}: the open-field landing is unchanged`);
  }
  // At full power from x 200 it flies the whole field: off the right edge.
  const off = predict(MISSILE, 'none', 200, 1, 45, 100);
  assert.ok(off.oob, `None: past the edge (${off.x})`);
  const rubber = predict(MISSILE, 'rubber', 200, 1, 45, 100);
  assert.ok(!rubber.oob && rubber.x < 719 && rubber.x > 200, `Rubber: back on the field (${rubber.x})`);
  const wrap = predict(MISSILE, 'wrap', 200, 1, 45, 100);
  assert.ok(!wrap.oob && wrap.x < W / 2, `Wraparound: in from the left (${wrap.x})`);
  // Same height and velocity through the wall: it lands a field's width from where an endless field would put it.
  const m = muzzle({ x: 200, y: 400, angle: 45, dirS: 1, isPlayer: true });
  const v = launchSpeed(gun(MISSILE), 100), st = { x: m.x, y: m.y, vx: dcos(rad(45)) * v, vy: -dsin(rad(45)) * v };
  const air = airOf(W, 0, gun(MISSILE));
  for (let i = 0; i < 2000 && !(i >= 6 && st.y >= 400); i++) stepBallistic(st, 1 / 60, air);
  assert.ok(Math.abs(wrap.x - (st.x - W)) < 1e-6, `${wrap.x} against ${st.x - W}`);
  const concrete = predict(MISSILE, 'concrete', 200, 1, 45, 100);
  assert.equal(concrete.x, 719);
});

/* ---- the war: stepShells flies the world's walls ---- */
const tank = (x: number, isPlayer: boolean, extra: Partial<Tank> = {}): Tank =>
  ({ id: isPlayer ? 'P' : 'D' + x, isPlayer, x, y: 400, hp: 100, angle: 45, power: 100, dirS: x < 360 ? 1 : -1, fuel: 80, vy: 0, ammo: {}, ...extra });
function war(walls: Walls, shooter: Tank, others: Tank[], wkey: string, terrain = flat()): { G: World; events: StepEvent[] } {
  const G: World = { tanks: [shooter, ...others], terrain, wind: 0, round: 9, rng: mulberry32(1), shells: [], score: 0, cash: 0,
    ammo: { [wkey]: 5, shell: Infinity }, selected: wkey, shield: false, bunker: 0, laststand: false, jammer: 0, chutes: 0, walls };
  shooter.ammo = { [wkey]: 5 };
  must(fireWeapon(G, arsenal, shooter, wkey), 'a launch');
  const events: StepEvent[] = [];
  for (let i = 0; i < 4000 && volleyOn(G); i++) events.push(...stepShells(G, arsenal, 1 / 60));
  assert.ok(!volleyOn(G), 'the volley ended');
  return { G, events };
}
const blasts = (events: StepEvent[]): Blast[] => events.flatMap(e => e.kind === 'blast' ? [e.blast] : []);

test('the war flies what the aim guide predicts, wall by wall', () => {
  for (const walls of WALLS) {
    const me = tank(650, true, { dirS: 1 });
    const { events } = war(walls, me, [tank(100, false)], SHELL);
    const want = predict(SHELL, walls, 650, 1, 45, 100);
    const b = blasts(events);
    if (walls === 'none') {
      assert.equal(b.length, 0, 'None: it leaves the field without a burst');
      continue;
    }
    assert.equal(b.length, 1, `${walls}: one burst`);
    assert.ok(Math.abs(b[0]!.x - want.x) < 1e-9 && Math.abs(b[0]!.y - want.y) < 1e-9, `${walls}: burst at ${b[0]!.x},${b[0]!.y}, predicted ${want.x},${want.y}`);
  }
});

test('a shell fired at Rubber bounces back and bursts on a unit on the field', () => {
  // A drone 60 px behind the gunner: the bounce brings the shell down on it.
  const me = tank(600, true, { dirS: 1, angle: 50, power: 72 });
  const target = tank(470, false, { hp: 100 });
  const land = predict(SHELL, 'rubber', 600, 1, 50, 72);
  target.x = Math.round(land.x);
  const { events } = war('rubber', me, [target], SHELL);
  const b = blasts(events);
  assert.equal(b.length, 1);
  assert.ok(target.hp < 100, `the bounce hurt it (hp ${target.hp})`);
});

test('a wrapped shell sweeps for hits only along its real path, not across the field', () => {
  // A unit standing in the middle of the field, nowhere near the shell's path, is never struck by the wrap.
  const me = tank(700, true, { dirS: 1, angle: 20, power: 60 });
  const bystander = tank(360, false, { y: 300 });
  const { G } = war('wrap', me, [bystander], SHELL, flat(470));
  assert.equal(G.tanks[1]!.hp, 100);
});

test('a roller on the ground rolls back off Rubber, comes in at the other edge through Wraparound, and bursts at the edge with None and Concrete', () => {
  const w = gun(ROLLER);
  const none = rollOut(flat(), 700, 200, 10, w, undefined, 'none');
  assert.equal(none.x, 719);
  const concrete = rollOut(flat(), 700, 200, 10, w, undefined, 'concrete');
  assert.equal(concrete.x, 719);
  const rubber = rollOut(flat(), 700, 200, 10, w, undefined, 'rubber');
  assert.ok(rubber.x < 719, `rolled back to ${rubber.x}`);
  const wrap = rollOut(flat(), 700, 200, 10, w, undefined, 'wrap');
  assert.ok(wrap.x < 300, `came in at the left and rolled on to ${wrap.x}`);
});

test('in the war a roller touching down by the wall rolls back off Rubber and bursts on the field', () => {
  const me = tank(640, true, { dirS: 1, angle: 40, power: 45 });
  const { events } = war('rubber', me, [tank(100, false)], ROLLER);
  const b = blasts(events);
  assert.equal(b.length, 1);
  assert.ok(b[0]!.x < 719, `burst at ${b[0]!.x}, off the wall`);
  const open = war('none', tank(640, true, { dirS: 1, angle: 40, power: 45 }), [tank(100, false)], ROLLER);
  assert.equal(blasts(open.events)[0]?.x ?? 719, 719, 'with None it bursts at the edge');
});

/** Ground falling to the right edge: liquid there runs off with None. */
const slope = (): number[] => Array.from({ length: W }, (_, x) => 300 + 120 * x / (W - 1));

/** Columns a pool covers. */
const span = (p: { x0: number; x1: number }): number => Math.max(0, p.x1 - p.x0 + 1);

test('napalm landing by an edge: with None it spills off, against a solid wall it pools, through Wraparound it spills', () => {
  const w = gun(NAPALM);
  const spilled = firePool(slope(), 700, w.volume!, w.flame!, w.poolMin!);
  assert.ok(span(spilled) <= 1, `None: all but the last column runs off (${spilled.x0}..${spilled.x1})`);
  const p = firePool(slope(), 700, w.volume!, w.flame!, w.poolMin!, true);
  assert.ok(span(p) >= w.volume! / w.poolMin! / 2, `a pool (${p.x0}..${p.x1})`);
  assert.equal(p.x1, W - 1, 'against the wall');
  assert.ok(p.level < slope()[W - 1]!, 'over the ground at the wall');
  // The war lights it against the wall when the wall is solid.
  for (const walls of WALLS) {
    const me = tank(600, true, { dirS: 1, angle: 70, power: 40 });
    const { events } = war(walls, me, [tank(100, false)], NAPALM, slope());
    const lit = events.find(e => e.kind === 'fire');
    assert.ok(lit && lit.kind === 'fire');
    const pooled = span(lit.fire.pool) > 1;
    assert.equal(pooled, walls === 'concrete' || walls === 'rubber' || walls === 'spring', `${walls}: pooled ${pooled}`);
  }
});

test('liquid dirt pours against a solid wall and runs off past None, in the war and in the replay\'s op', () => {
  const w = gun(POUR);
  const open = pourLevel(slope(), 700, w.volume!, w.poolMin!);
  assert.ok(span(open) <= 1, `${open.x0}..${open.x1}`);
  const dammed = pourLevel(slope(), 700, w.volume!, w.poolMin!, true);
  assert.equal(dammed.x1, W - 1);
  assert.ok(span(dammed) > 10, `${dammed.x0}..${dammed.x1}`);
  const t = slope();
  applyEarth(t, { t: 'pour', w: POUR, x: 700, v: w.volume!, m: w.poolMin!, d: 1 });
  assert.ok(t[W - 1]! < slope()[W - 1]!, 'the op pours against the wall when it says so');
  const me = tank(600, true, { dirS: 1, angle: 70, power: 40 });
  const { events } = war('concrete', me, [tank(100, false)], POUR, slope());
  const earth = events.find(e => e.kind === 'earth');
  assert.ok(earth && earth.kind === 'earth' && earth.op.t === 'pour' && earth.op.d === 1, 'the war\'s pour says it was dammed');
});

/* ---- the drones: their search flies the walls, so they bank and wrap ---- */
function droneTurn(walls: Walls, terrain: number[], droneX: number, targetX: number, targetY = 400) {
  const drone = tank(droneX, false, { ammo: {}, s: 'hunter' });
  const human = tank(targetX, true, { y: targetY });
  const G: World = { tanks: [drone, human], terrain, wind: 0, round: 1, difficulty: 'hard', rng: () => 0.5, shells: [], score: 0, cash: 0,
    ammo: {}, selected: 'shell', shield: false, bunker: 0, laststand: false, jammer: 0, chutes: 0, walls };
  const pick = aiChoose(G, arsenal, drone);
  const m = muzzle({ ...drone, angle: pick.angle });
  const land = simShot(G, arsenal, m.x, m.y, pick.angle, pick.power, pick.wkey, drone.dirS!);
  return { pick, land };
}

test('a drone shoots through Wraparound at a rival behind a mountain no arc clears', () => {
  // Columns 200..520 stand at y 40: nothing the drone carries flies over them.
  const terrain = flat().map((y, x) => (x >= 200 && x <= 520 ? 40 : y));
  const open = droneTurn('none', terrain, 80, 660);
  assert.ok(open.land.oob || Math.abs(open.land.x - 660) > 100, `with None it cannot reach (${open.land.x})`);
  const wrap = droneTurn('wrap', terrain, 80, 660);
  assert.ok(!wrap.land.oob && Math.abs(wrap.land.x - 660) < 40, `through the wall it lands at ${wrap.land.x}`);
  assert.ok(wrap.pick.angle > 90, `it fires away from its rival, at ${wrap.pick.angle} degrees`);
});

test('a drone banks off a Spring at a rival past its reach', () => {
  // The rival is further than a full-power Shell flies; the spring at the drone's back throws it the rest.
  const open = droneTurn('none', flat(), 705, 120);
  assert.ok(open.land.oob || Math.abs(open.land.x - 120) > 50, `with None it falls short (${open.land.x})`);
  const spring = droneTurn('spring', flat(), 705, 120);
  assert.ok(!spring.land.oob && Math.abs(spring.land.x - 120) < 20, `off the spring it lands at ${spring.land.x}`);
  assert.ok(spring.pick.angle > 90, `it fires at the wall behind it, at ${spring.pick.angle} degrees`);
});

test('a drone banks off Rubber into a pit by the wall that a cliff hides from every direct arc', () => {
  // The pit (columns 680..719, 40 px deep) sits behind a cliff 150 px tall.
  const terrain = Array.from({ length: W }, (_, x) => (x >= 680 ? 440 : x >= 640 ? 250 : 400));
  const open = droneTurn('none', terrain, 560, 700, 440);
  assert.ok(open.land.x < 680, `with None it comes down short of the pit (${open.land.x})`);
  const rubber = droneTurn('rubber', terrain, 560, 700, 440);
  assert.ok(!rubber.land.oob && rubber.land.x >= 680 && rubber.land.y > 400, `off the wall it drops into the pit (${rubber.land.x}, ${rubber.land.y})`);
});

/* ---- the camera: both walls in view, and a bounced shell framed ---- */
test('the camera keeps both walls in view and holds a shell that bounces back', () => {
  // The view is never narrower than the field and always centred across it: both sides show.
  for (const w of [720, 1080, 1440]) {
    const pose = cameraTarget(w, 460, [{ y: 400 }], 50);
    assert.equal(pose.cx, w / 2);
  }
  // A Shell fired at Rubber: framed (held by its arc's top) from launch until it comes down, bounce and all.
  const air = airOf(W, 0, gun(SHELL), 'rubber');
  const m = muzzle({ x: 650, y: 400, angle: 60, dirS: 1, isPlayer: true });
  const v = launchSpeed(gun(SHELL), 90), s = { x: m.x, y: m.y, vx: dcos(rad(60)) * v, vy: -dsin(rad(60)) * v, wkey: SHELL };
  const hold = { top: null as number | null, empty: 0 };
  let bounced = false;
  for (let i = 0; i < 2000 && !(i > 6 && s.y >= 400); i++) {
    bounced = stepBallistic(s, 1 / 60, air) === WALL_BOUNCE || bounced;
    stepHold(hold, [[s]], a => flightTop({ x: a.x, y: a.y, vx: a.vx || 0, vy: a.vy }, air), { w: W, reach: W / 2 / ZOOM_FLOOR });
    assert.ok(hold.top !== null && hold.top <= s.y, `step ${i}: the arc's top is held (${hold.top}) over the shell at ${s.y}`);
  }
  assert.ok(bounced, 'it met the wall');
});

test('a climbing shell that meets Concrete tops out on the wall: the camera frames no higher', () => {
  const air = airOf(W, 0, gun(SHELL), 'concrete'), open = airOf(W, 0, gun(SHELL));
  const shell = { x: 700, y: 300, vx: 200, vy: -200 };
  assert.ok(flightTop(shell, air) > flightTop(shell, open), 'its arc ends at the wall');
});
