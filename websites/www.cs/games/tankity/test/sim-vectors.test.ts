// Replays the shared sim vectors (protocol/sim-vectors.json) through the browser
// sim: src/sim.ts, src/ai.ts, src/armor.ts, src/standings.ts and src/detmath.ts. The vectors
// are written by `php protocol/sim-vectors.php` from rooms.php, so a change to the browser sim
// or the room server's that the other side does not follow fails here (or in
// the generator's --check) until they agree. Passes when every case matches or
// is a marked known difference.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import * as simRules from '../src/sim.ts';
import * as aiRules from '../src/ai.ts';
import * as armorRules from '../src/armor.ts';
import * as standings from '../src/standings.ts';
import * as det from '../src/detmath.ts';
import * as earth from '../src/earth.ts';
import * as fire from '../src/fire.ts';
import * as walls from '../src/walls.ts';
import type { Ammo, Arsenal, BlastOverride, Shell, Tank, Weapon, World } from '../src/sim.ts';

/* One case as protocol/sim-vectors.php writes it: `in` has the shape its group's runner reads (Inputs). */
interface VectorCase { name: string; in: unknown; out: unknown; exact?: boolean; known?: string; knownPaths?: string[] }
interface Vectors { tolerance: number; weapons: string[]; groups: Record<string, VectorCase[]> }

const dir = path.join(import.meta.dirname, '..');
const VECTORS: Vectors = JSON.parse(fs.readFileSync(path.join(dir, 'protocol', 'sim-vectors.json'), 'utf8'));
const GAME: { arsenal: Parameters<typeof simRules.buildArsenal>[0] } = JSON.parse(fs.readFileSync(path.join(dir, 'game.json'), 'utf8'));
const TOL = VECTORS.tolerance;

function must<T>(v: T | null | undefined, what: string): T {
  assert.ok(v !== null && v !== undefined, `${what} is missing`);
  return v;
}
function nth<T>(list: readonly T[], i: number): T {
  return must(list[i], `item ${i}`);
}

/* ---- where the sim comes from ----
   The only place that reaches for it: the modules, which take their
   state as arguments, so the cases below pass a plain state object G. The
   physics is src/sim.ts and the drone AI src/ai.ts; `sim` holds both. */
const sim = { ...simRules, ...aiRules };
const arsenal: Arsenal = must(sim.buildArsenal(GAME.arsenal), 'the arsenal');

/* ---- what the cases say ---- */
interface TerrainSpec {
  flat?: number;
  slope?: [number, number];
  vee?: [number, number, number, number];
  hills?: [number, number, number];
  set?: [number, number, number][];
}
interface TankSpec {
  kind: string; x: number; y: number; hp?: number; angle?: number; power?: number; dirS?: number; fuel?: number; ammo?: Ammo;
  s?: string; dry?: number; dealt?: boolean; lastHitBy?: number; kills?: number; fellBy?: number; chutes?: number;
  score?: number; shield?: boolean; bunker?: number; laststand?: boolean; jammer?: number;
}
/* difficulty is a string, not a Difficulty: a case feeds an unknown word on purpose. */
interface WorldIn { terrain?: TerrainSpec; tanks?: TankSpec[]; wind?: number; round?: number; difficulty?: string; walls?: walls.Walls }
type WallsIn =
  | { kind: 'step'; walls: walls.Walls; x: number; y: number; vx: number; vy: number; px: number; py: number }
  | { kind: 'roll'; walls: walls.Walls; x: number; u: number }
  | ({ kind: 'sim-shot' | 'split'; walls: walls.Walls; terrain: TerrainSpec; wind: number } & Shot)
  | { kind: 'roll-out'; walls: walls.Walls; terrain: TerrainSpec; x: number; vx: number; vy: number; wkey: string }
  | { kind: 'fall-to'; walls: walls.Walls; wind: number; wkey: string; x: number; y: number; vx: number; vy: number; ground: number }
  | { kind: 'pour' | 'fire-pool'; dam: boolean; terrain: TerrainSpec; x: number; wkey: string }
  | { kind: 'random'; seed: number };
interface UnitSpot { kind: string; x: number; y: number }
interface Shot { x: number; y: number; angle: number; power: number; wkey: string; dirS: number }
type ArmorOp = ['muster'] | ['end'] | ['damage', number] | ['repair', number] | ['plate', number];
type EarthIn = { terrain: TerrainSpec } & (
  | { op: 'crater' | 'dirt'; x: number; y: number; r: number }
  | { op: 'pour'; x: number; v: number; m?: number }
  | { op: 'slump'; x: number; r: number; slope: number; passes: number }
  | { op: 'riot'; x: number; y: number; a: number; r: number; fan: number }
  | { op: 'dig'; x: number; y: number; vx: number; vy: number; n: number; r: number });
interface Inputs {
  constants: Record<string, never>;
  detmath: { fn: string; x: number; y: number };
  rng: { seed: string };
  'terrain-gen': { seed: string };
  'spawn-spots': { n: number; seed: number };
  'shot-speed': { power: number; mult: number };
  air: { kind: 'shear'; h: number } | { kind: 'flight'; w?: number; wind: number; drag: number; x: number; y: number; vx: number; vy: number; steps: number };
  'missile-speed': { kind: 'table'; drag: number } | { kind: 'speed'; wkey: string; power: number; w: number };
  muzzle: { x: number; y: number; angle: number; dirS: number };
  'hit-box': UnitSpot;
  'in-box': UnitSpot & { px: number; py: number };
  'sweep-hit': WorldIn & { owner: number; skip: number | null; clear: boolean; seg: [number, number, number, number] };
  'seek-push': WorldIn & { owner: number; sx: number; sy: number; steer: number; dt: number; vx: number; vy: number };
  'split-fan': { vx: number; vy: number; n: number; fan: number };
  'hop-vel': { vx: number; vy: number; keep: number };
  'scatter-vel': { n: number; fan: number; kick: number };
  'cluster-split': WorldIn & { wkey: string; x: number; y: number; vx: number; vy: number };
  rack: { round: number };
  blast: WorldIn & { owner: number; wkey: string; x: number; y: number; direct?: number | null; ov?: BlastOverride };
  'sim-shot': WorldIn & Shot;
  'roll-out': { terrain: TerrainSpec; x: number; vx: number; vy: number; wkey: string };
  armor: { ops: ArmorOp[] };
  'match-end': { lives: (number | null)[]; startHumans: number; round: number };
  volley: WorldIn & { shooter: number; wkey: string; angle: number; power: number };
  beam: WorldIn & { shooter: number; wkey: string; angle: number; power: number };
  plasma: WorldIn & { shooter: number; wkey: string; power: number };
  fall: WorldIn & { blast?: { x: number; y: number; wkey: string; owner: number } };
  field:
    | { kind: 'terrain'; w: number; seed: string }
    | { kind: 'placement'; w: number; seed: number }
    | { kind: 'speed'; w: number }
    | ({ kind: 'sim-shot'; w: number } & Shot)
    | (WorldIn & { kind: 'aim'; w: number; seed: number });
  'ai-aim': WorldIn & { seed: number; shooter: number; tanks: TankSpec[] };
  'ai-harm': WorldIn & { self: number; target: number; wkey: string; a: number; p: number };
  'ai-bracket': WorldIn & { w?: number; seed: number; shooter: number; target: number; shots: number; driveAt?: number; driveBy?: number };
  'ai-tactic': WorldIn & { seed: number; shooter: number; turns: number };
  earth: EarthIn;
  fire: { terrain: TerrainSpec; x: number; v: number; flame: number; m?: number; units: UnitSpot[] };
  'fire-ticks': { burn: number; tick: number } | { burn?: undefined; dmg: number; ticks: number; shield: boolean; bunker: boolean };
  settle: { terrain: TerrainSpec; x: number; y: number; hp: number; kind?: string };
  walls: WallsIn;
}

/* ---- state the cases run over ---- */
/* Filled by world(): a case that never sets rng never reads it. */
const G = {} as World;
function buildTerrain(spec: TerrainSpec, w = 720): number[] {
  const t: number[] = [];
  for (let ix = 0; ix < w; ix++) {
    let y: number;
    if (spec.flat !== undefined) y = spec.flat;
    else if (spec.slope) y = spec.slope[0] + (spec.slope[1] - spec.slope[0]) * ix / (w - 1);
    else if (spec.vee) y = spec.vee[2] + (spec.vee[3] - spec.vee[2]) * Math.max(0, 1 - Math.abs(ix - spec.vee[0]) / spec.vee[1]);
    else {
      const hills = must(spec.hills, 'the terrain spec');
      y = hills[0] + hills[1] * det.dsin(ix * 2 * Math.PI / hills[2]);
    }
    for (const [x0, x1, sy] of spec.set || []) if (ix >= x0 && ix <= x1) y = sy;
    t.push(Math.round(y * 1000) / 1000);
  }
  return t;
}
const tankOf = (spec: TankSpec, i: number): Tank => ({
  id: 'T' + i, isPlayer: spec.kind === 'human', x: spec.x, y: spec.y, hp: spec.hp === undefined ? 100 : spec.hp,
  angle: spec.angle === undefined ? 45 : spec.angle, power: spec.power === undefined ? 50 : spec.power,
  dirS: spec.dirS === undefined ? 1 : spec.dirS, fuel: spec.fuel === undefined ? 80 : spec.fuel, ammo: Object.assign({}, spec.ammo), vy: 0,
  s: spec.s, dry: spec.dry, dealt: spec.dealt, lastHitBy: spec.lastHitBy, kills: spec.kills, fellBy: spec.fellBy,
  chutes: spec.kind === 'human' ? undefined : spec.chutes,
});
/* A fresh world for a case: the tanks, the ground, the wind, and the human's tricks (G.shield and friends are the player's). */
function world(c: WorldIn, w = 720): World {
  for (const k of Object.keys(G)) Reflect.deleteProperty(G, k);
  const human: Partial<TankSpec> = (c.tanks || []).find(t => t.kind === 'human') || {};
  Object.assign(G, {
    tanks: (c.tanks || []).map(tankOf), terrain: buildTerrain(c.terrain || { flat: 400 }, w), wind: c.wind || 0, round: c.round || 1,
    shells: [], booms: [], clouds: [], fx: {}, ammo: {}, selected: 'shell', score: human.score || 0, cash: 0, shake: 0, shopSel: 0,
    shield: !!human.shield, bunker: human.bunker || 0, laststand: !!human.laststand, jammer: human.jammer || 0,
    chutes: human.chutes || 0, difficulty: c.difficulty, walls: c.walls,
  });
  return G;
}
/* A shell with no gunner, as the server's vector builds it: the runners below that use one never read its owner. */
function ownerless(s: Omit<Shell, 'owner' | 'life' | 'age' | 'pierced' | 'split'> & { owner: null }): Shell {
  return s as unknown as Shell; // owner is null, which Shell does not allow
}
function outcome(before: readonly number[]) {
  let first: number | null = null, last: number | null = null;
  G.terrain.forEach((y, ix) => {
    if (Math.abs(y - nth(before, ix)) > 1e-9) { if (first === null) first = ix; last = ix; }
  });
  return {
    tanks: G.tanks.map(t => ({ hp: t.hp, fuel: t.fuel, y: t.y, chutes: t.isPlayer ? null : t.chutes || 0,
      lastHitBy: t.lastHitBy ?? null, dealt: !!t.dealt, fellBy: t.fellBy ?? null })),
    crater: first === null ? null : { x0: first, y: G.terrain.slice(first, Number(last) + 1) },
    score: G.score, cash: G.cash, shield: G.shield, laststand: G.laststand, chutes: G.chutes,
  };
}

/* ---- one runner per group: the case's inputs in, what the sim says out ---- */
const RUN: { [K in keyof Inputs]: (c: Inputs[K]) => unknown } = {
  constants() {
    return { grav: sim.GRAV, dragK: sim.DRAG_K, airSpeed: sim.AIR_SPEED, shearH: sim.SHEAR_H, missileLow: sim.MISSILE_LOW,
      missileFull: sim.MISSILE_FULL, unitGap: sim.UNIT_GAP, spawnGap: sim.SPAWN_GAP };
  },
  air(c) {
    if (c.kind === 'shear') return sim.shear(c.h);
    const w = c.w || 720;
    const air = sim.airOf(w, c.wind, { drag: c.drag });
    const st = { x: c.x, y: c.y, vx: c.vx, vy: c.vy };
    const out: number[][] = [];
    for (let i = 1; i <= c.steps; i++) {
      sim.stepBallistic(st, 1 / 60, air);
      if (i % Math.max(1, Math.floor(c.steps / 10)) === 0) out.push([st.x, st.y, st.vx, st.vy]);
    }
    return out;
  },
  'missile-speed'(c) {
    if (c.kind === 'table') return sim.missileTable(c.drag);
    return sim.launchSpeed(must(arsenal.weapons[c.wkey], c.wkey), c.power, sim.fieldReach(c.w));
  },
  detmath(c) {
    switch (c.fn) {
      case 'sin': return det.dsin(c.x);
      case 'cos': return det.dcos(c.x);
      case 'atan': return det.datan(c.x);
      case 'atan2': return det.datan2(c.y, c.x);
      default: return Math.round(c.x);
    }
  },
  rng(c) {
    const hash = sim.hashSeed(c.seed), r = sim.mulberry32(hash);
    return { hash, stream: [0, 1, 2, 3, 4, 5].map(() => r()) };
  },
  'terrain-gen'(c) {
    const { terrain } = sim.genTerrain(sim.mulberry32(sim.hashSeed(c.seed)), 720);
    const samples = [];
    for (let x = 0; x < 720; x += 60) samples.push(terrain[x]);
    return { samples, min: Math.min(...terrain), max: Math.max(...terrain) };
  },
  'spawn-spots'(c) {
    const r = sim.mulberry32(c.seed);
    return { spots: sim.spawnSpots(c.n, r, 720), next: r() };
  },
  'shot-speed': c => sim.shotSpeed(c.power, c.mult),
  muzzle(c) {
    // The case gives no isPlayer: muzzle reads it only when dirS is 0 or missing, and every case sets dirS.
    const m = sim.muzzle(c as typeof c & Pick<Tank, 'isPlayer'>);
    return [m.x, m.y];
  },
  'hit-box'(c) {
    const b = sim.unitHitBox({ isPlayer: c.kind === 'human', x: c.x, y: c.y });
    return [b.cx, b.cy, b.rx, b.ry];
  },
  'in-box': c => sim.inHitBox({ isPlayer: c.kind === 'human', x: c.x, y: c.y }, c.px, c.py),
  'sweep-hit'(c) {
    world(c);
    const s: Pick<Shell, 'owner' | 'pierced' | 'clear'> = { owner: nth(G.tanks, c.owner), pierced: c.skip === null ? false : nth(G.tanks, c.skip), clear: c.clear };
    const hit = sim.sweepHit(G.tanks, s, ...c.seg);
    return { hit: hit ? [G.tanks.indexOf(hit.t), hit.x, hit.y] : null, clear: s.clear };
  },
  'seek-push'(c) {
    world(c);
    const s = { x: c.sx, y: c.sy, vx: c.vx, vy: c.vy, owner: nth(G.tanks, c.owner) };
    sim.steerShell(G.tanks, s as Shell, { steer: c.steer } as Weapon, c.dt);
    return s.vx === c.vx && s.vy === c.vy ? null : [s.vx - c.vx, s.vy - c.vy];
  },
  'split-fan'(c) {
    return sim.splitShell(ownerless({ x: 0, y: 0, vx: c.vx, vy: c.vy, wkey: 'shell', owner: null }), { split: c.n, fan: c.fan } as Weapon)
      .map(s => [s.vx, s.vy]);
  },
  'hop-vel'(c) {
    const s = ownerless({ x: 0, y: 0, vx: c.vx, vy: c.vy, wkey: 'shell', owner: null, order: [0] });
    const next = must(sim.hopShell(s, { hops: 3, hopKeep: c.keep, subDmg: 1, subRadius: 1 } as Weapon, 0, 0, 1), 'the next warhead');
    return [next.vx, next.vy];
  },
  'scatter-vel'(c) {
    const s = ownerless({ x: 0, y: 0, vx: 0, vy: 0, wkey: 'shell', owner: null, order: [0] });
    return sim.scatterShells(s, { split: c.n, fan: c.fan, kick: c.kick, subDmg: 1, subRadius: 1 } as Weapon, 0, 0, 1).map(b => [b.vx, b.vy]);
  },
  'cluster-split'(c) {
    world(c);
    const shell: Shell = { x: c.x, y: c.y, vx: c.vx, vy: c.vy, wkey: c.wkey, owner: nth(G.tanks, 0), life: 12, age: 0, pierced: false, split: false, order: [0] };
    G.shells = [shell];
    for (let steps = 1; steps <= 720; steps++) {
      const evs = sim.stepShells(G, arsenal, 1 / 60);
      if (evs.some(e => e.kind === 'split')) return { status: 'split', x: shell.x, y: shell.y, vx: shell.vx, vy: shell.vy, steps };
      if (shell.dead) return { status: 'landed', steps };
    }
    return { status: 'none' };
  },
  rack(c) {
    const r = sim.droneRack(arsenal, c.round);
    return Object.fromEntries(Object.entries(r).map(([k, n]) => [k, n === Infinity ? -1 : n]));
  },
  blast(c) {
    world(c);
    const before = G.terrain.slice();
    const direct = c.direct === undefined || c.direct === null ? null : nth(G.tanks, c.direct);
    sim.explode(G, arsenal, c.x, c.y, c.wkey, nth(G.tanks, c.owner), direct, c.ov || null);
    return outcome(before);
  },
  'sim-shot'(c) {
    world(c);
    return sim.simShot(G, arsenal, c.x, c.y, c.angle, c.power, c.wkey, c.dirS);
  },
  'roll-out'(c) {
    const r = sim.rollOut(buildTerrain(c.terrain), c.x, c.vx, c.vy, must(arsenal.weapons[c.wkey], c.wkey));
    return { x: r.x, y: r.y };
  },
  armor(c) {
    let hull = { armor: armorRules.maxArmor(0), plates: 0 };
    let hp = 0;
    const out = [];
    for (const [op, n] of c.ops) {
      if (op === 'muster') hp = hull.armor;
      else if (op === 'damage') hp = Math.max(0, hp - n);
      else if (op === 'end') hull = armorRules.carryArmor(hull, hp, hp <= 0);
      else if (op === 'repair') hull = { armor: hull.armor + armorRules.repairRestores(hull.armor, hull.plates, 40, n), plates: hull.plates };
      else if (op === 'plate') hull = armorRules.fitPlates(hull, n);
      out.push({ armor: hull.armor, max: armorRules.maxArmor(hull.plates), hp });
    }
    return out;
  },
  'match-end'(c) {
    const seats = c.lives.map((l, seat) => ({ seat, human: l !== null, lives: l ?? 0 }));
    const o = standings.matchOutcome(seats, c.startHumans);
    return { over: o.over, winner: o.winner, bonus: 2 * (sim.TUNE.roundWinScore + c.round * 150) };
  },
  volley(c) {
    world(c);
    const before = G.terrain.slice(), shooter = nth(G.tanks, c.shooter);
    shooter.angle = c.angle;
    shooter.power = c.power;
    must(shooter.isPlayer ? G.ammo : shooter.ammo, 'the shooter\'s ammo')[c.wkey] = 99;
    sim.fireWeapon(G, arsenal, shooter, c.wkey);
    // As a solo match plays it: 1/60 s frames, falls animated every frame, and
    // one settle when the last shell is down (src/match.ts), which must come out
    // as the room server's volley does (server/rules.php room_fire_shot). A
    // gun with no flight settles the moment it fires.
    if (!sim.volleyOn(G)) sim.settleVolley(G, arsenal);
    for (let frame = 0; sim.volleyOn(G) && frame < 5000; frame++) {
      sim.fallTanks(G, 1 / 60);
      sim.stepShells(G, arsenal, 1 / 60);
      sim.armChutes(G, arsenal);
      if (!sim.volleyOn(G)) sim.settleVolley(G, arsenal);
    }
    for (let frame = 0; frame < 5000 && sim.anyTankFalling(G); frame++) sim.fallTanks(G, 1 / 60);
    return outcome(before);
  },
  beam(c) {
    world(c);
    const before = G.terrain.slice(), shooter = nth(G.tanks, c.shooter);
    shooter.angle = c.angle;
    shooter.power = c.power;
    const b = sim.fireBeam(G, arsenal, shooter, c.wkey);
    return { line: [b.x0, b.y0, b.x1, b.y1], ...outcome(before) };
  },
  plasma(c) {
    world(c);
    const before = G.terrain.slice(), shooter = nth(G.tanks, c.shooter);
    shooter.power = c.power;
    const r = sim.firePlasma(G, arsenal, shooter, c.wkey);
    return { ring: [r.x, r.y, r.r], ...outcome(before) };
  },
  fall(c) {
    world(c);
    if (c.blast) sim.explode(G, arsenal, c.blast.x, c.blast.y, c.blast.wkey, nth(G.tanks, c.blast.owner), null, null);
    const events = sim.settleFalls(G, arsenal);
    const seat = (t: Tank) => G.tanks.indexOf(t);
    return {
      tanks: G.tanks.map(t => ({ y: t.y, hp: t.hp, kills: t.kills || 0, lastHitBy: t.lastHitBy ?? null, chutes: t.isPlayer ? null : t.chutes || 0 })),
      falls: events.filter(e => e.kind === 'fall').map(e => [seat(e.tank), e.dmg, seat(e.by || e.tank), e.chute, e.under]),
      score: G.score, cash: G.cash, chutes: G.chutes,
    };
  },
  field(c) {
    if (c.kind === 'terrain') {
      const r = sim.mulberry32(sim.hashSeed(c.seed));
      const h = sim.drawHills(r);
      const next = r();
      const { terrain } = sim.genTerrain(sim.mulberry32(sim.hashSeed(c.seed)), c.w);
      return { hills: sim.hillsWire(h), terrain, next };
    }
    if (c.kind === 'placement') {
      const r = sim.mulberry32(c.seed);
      const xs = sim.spawnSpots(4, r, c.w);
      return { xs, next: r() };
    }
    if (c.kind === 'speed') {
      const reach = sim.fieldReach(c.w);
      return { reach, speeds: [0, 37, 100].flatMap(p => [sim.shotSpeed(p, 1, reach), sim.shotSpeed(p, 0.55, reach)]) };
    }
    if (c.kind === 'sim-shot') {
      return sim.simShot({ terrain: Array(c.w).fill(400), wind: 0 }, arsenal, c.x, c.y, c.angle, c.power, c.wkey, c.dirS);
    }
    world(c, c.w);
    G.rng = sim.mulberry32(c.seed);
    const t = nth(G.tanks, 0);
    const choice = sim.aiChoose(G, arsenal, t);
    const fa = sim.fieldAim(c.w);
    return { fa: [fa.aim, fa.floor], target: must(t.brk, 'the bracket').t, wkey: choice.wkey, angle: choice.angle, power: choice.power };
  },
  'ai-aim'(c) {
    world(c);
    G.rng = sim.mulberry32(c.seed);
    const t = nth(G.tanks, c.shooter), x0 = t.x;
    const choice = sim.aiChoose(G, arsenal, t);
    return { wkey: choice.wkey, angle: choice.angle, power: choice.power, moved: t.x - x0 };
  },
  'ai-harm'(c) {
    world(c);
    const self = nth(G.tanks, c.self);
    const m = sim.muzzle({ ...self, angle: c.a });
    const land = { ...sim.simShot(G, arsenal, m.x, m.y, c.a, c.p, c.wkey, must(self.dirS, 'dirS')), a: c.a, p: c.p };
    const h = sim.aiHarm(G, arsenal, self, nth(G.tanks, c.target), c.wkey, land);
    return { land: [land.x, land.y], harm: h === -Infinity ? 'self' : h, selfHarm: sim.aiSelfHarm(G, arsenal, self, nth(G.tanks, c.target), c.wkey, land) };
  },
  'ai-bracket'(c) {
    world(c, c.w || 720);
    G.rng = sim.mulberry32(c.seed);
    const t = nth(G.tanks, c.shooter), steps = [];
    for (let k = 0; k < c.shots; k++) {
      if (c.driveAt === k) nth(G.tanks, c.target).x += Number(c.driveBy);
      const choice = sim.aiChoose(G, arsenal, t);
      t.angle = choice.angle;
      t.power = choice.power;
      must(t.ammo, 'the drone\'s ammo').shell = 99;
      sim.fireWeapon(G, arsenal, t, choice.wkey);
      for (let frame = 0; sim.volleyOn(G) && frame < 5000; frame++) sim.stepShells(G, arsenal, 1 / 60);
      sim.settleFalls(G, arsenal);
      const b = must(t.brk, 'the bracket');
      steps.push({ wkey: choice.wkey, angle: choice.angle, power: choice.power, x: t.x, n: b.n, target: b.t, land: b.land });
    }
    return steps;
  },
  'ai-tactic'(c) {
    world(c);
    G.rng = sim.mulberry32(c.seed);
    const t = nth(G.tanks, c.shooter), steps = [];
    for (let k = 0; k < c.turns; k++) {
      const choice = sim.aiChoose(G, arsenal, t);
      t.angle = choice.angle;
      t.power = choice.power;
      const brk = must(t.brk, 'the bracket');
      steps.push({ target: brk.t, s: t.s, dry: t.dry, tactic: choice.tactic === undefined ? null : choice.tactic,
        wkey: choice.wkey, angle: choice.angle, power: choice.power, x: t.x, n: brk.n });
    }
    return steps;
  },
  earth(c) {
    const t = buildTerrain(c.terrain), before = t.slice();
    const out: { pool?: number[]; heading?: number[]; cells?: { x0: number; y: number[] } | null } = {};
    if (c.op === 'crater') earth.carveCrater(t, c.x, c.y, c.r, earth.FLOOR);
    else if (c.op === 'dirt') earth.addDirt(t, c.x, c.y, c.r);
    else if (c.op === 'pour') {
      const pool = earth.pourLevel(t, c.x, c.v, c.m || 0);
      out.pool = [pool.level, pool.x0, pool.x1];
      earth.fillPour(t, pool);
    } else if (c.op === 'slump') earth.slumpGround(t, c.x, c.r, c.slope, c.passes);
    else if (c.op === 'riot') earth.riotCarve(t, c.x, c.y, c.a, c.r, c.fan, c.y + 10);
    else if (c.op === 'dig') {
      const [ux, uy] = earth.digHeading(c.vx, c.vy);
      out.heading = [ux, uy];
      earth.digCarve(t, c.x, c.y, ux, uy, c.n, c.r);
    }
    let first: number | null = null, last: number | null = null;
    t.forEach((y, ix) => { if (Math.abs(y - nth(before, ix)) > 1e-9) { if (first === null) first = ix; last = ix; } });
    out.cells = first === null ? null : { x0: first, y: t.slice(first, Number(last) + 1) };
    return out;
  },
  fire(c) {
    const pool = fire.firePool(buildTerrain(c.terrain), c.x, c.v, c.flame, c.m || 0);
    return { pool: [pool.level, pool.x0, pool.x1, pool.flame], in: c.units.map(u => fire.inFlames(pool, sim.unitHitBox({ isPlayer: u.kind === 'human', x: u.x, y: u.y }))) };
  },
  'fire-ticks'(c) {
    return c.burn !== undefined ? [fire.burnTicks(c.burn, c.tick), fire.tickSteps(c.tick)] : fire.burnTotal(c.dmg, c.ticks, c.shield, c.bunker);
  },
  settle(c) {
    world({ terrain: c.terrain, tanks: [{ kind: c.kind || 'ai', x: c.x, y: c.y, hp: c.hp }] });
    sim.settleFalls(G, arsenal);
    return nth(G.tanks, 0).y;
  },
  walls(c) {
    const gun = (k: string) => must(arsenal.weapons[k], k);
    switch (c.kind) {
      case 'step': {
        const st = { x: c.x, y: c.y, vx: c.vx, vy: c.vy };
        const did = walls.wallStep(st, c.walls, 720, c.px, c.py);
        return { did, x: st.x, y: st.y, vx: st.vx };
      }
      case 'roll': {
        const r = { x: c.x, u: c.u };
        const did = walls.wallRoll(r, c.walls, 720);
        return { did, x: r.x, u: r.u };
      }
      case 'sim-shot':
        return sim.simShot({ terrain: buildTerrain(c.terrain), wind: c.wind, walls: c.walls }, arsenal, c.x, c.y, c.angle, c.power, c.wkey, c.dirS);
      case 'split': {
        const at = sim.splitPoint({ terrain: buildTerrain(c.terrain), wind: c.wind, walls: c.walls }, arsenal, c.x, c.y, c.angle, c.power, c.wkey, c.dirS);
        return at && [at.x, at.y, at.vx, at.vy];
      }
      case 'roll-out':
        return sim.rollOut(buildTerrain(c.terrain), c.x, c.vx, c.vy, gun(c.wkey), undefined, c.walls);
      case 'fall-to': {
        const f = sim.fallTo(c.x, c.y, c.vx, c.vy, c.ground, sim.airOf(720, c.wind, gun(c.wkey), c.walls));
        return [f.x, f.y, f.vx, f.vy, f.stopped, f.n];
      }
      case 'pour': {
        const w = gun(c.wkey);
        return earth.pourLevel(buildTerrain(c.terrain), c.x, must(w.volume, 'volume'), must(w.poolMin, 'poolMin'), c.dam);
      }
      case 'fire-pool': {
        const w = gun(c.wkey);
        return fire.firePool(buildTerrain(c.terrain), c.x, must(w.volume, 'volume'), must(w.flame, 'flame'), must(w.poolMin, 'poolMin'), c.dam);
      }
      case 'random': {
        const rng = sim.mulberry32(c.seed);
        const picks = Array.from({ length: 8 }, () => walls.wallsFor('random', rng));
        let drew = false;
        const kept = walls.wallsFor('rubber', () => { drew = true; return 0; }) === 'rubber' && !drew;
        return { picks, next: rng(), rubberKeepsStream: kept };
      }
    }
  },
};
/* The server reports where a drone wanted to shuffle; the browser moves it (inside the board, unless another unit is in the way). */
// The JSON is taken at its word here, as in runCase: an ai-aim case's in and out have these shapes.
function expectedFor(group: string, input: unknown, expected: unknown): unknown {
  if (group !== 'ai-aim') return expected;
  const c = input as Inputs['ai-aim'], out = expected as { dx: number; wkey: string; angle: number; power: number };
  const x0 = nth(c.tanks, c.shooter).x;
  const moved = out.dx === 0 ? 0 : Math.max(12, Math.min(720 - 12, x0 + out.dx)) - x0;
  return { wkey: out.wkey, angle: out.angle, power: out.power, moved };
}

/* ---- compare and report ---- */
function diff(want: unknown, got: unknown, at: string, out: string[], exact = false, tol = TOL): string[] {
  if (typeof want === 'number' && typeof got === 'number') {
    // exact: Object.is, so -0 differs from 0 (detmath pins the sign).
    const same = exact ? Object.is(want, got) : Math.abs(want - got) <= tol;
    if (!same) out.push(`${at}: expected ${want}, got ${got}`);
  } else if (Array.isArray(want) && Array.isArray(got)) {
    if (want.length !== got.length) out.push(`${at}: expected ${want.length} items, got ${got.length}`);
    for (let i = 0; i < Math.min(want.length, got.length); i++) diff(want[i], got[i], `${at}[${i}]`, out, exact, tol);
  } else if (isRecord(want) && isRecord(got)) {
    for (const k of new Set([...Object.keys(want), ...Object.keys(got)])) diff(want[k], got[k], `${at}.${k}`, out, exact, tol);
  } else if (want !== got) {
    out.push(`${at}: expected ${JSON.stringify(want)}, got ${JSON.stringify(got)}`);
  }
  return out;
}
function isRecord(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object' && !Array.isArray(v);
}
const clip = (v: unknown, n: number) => { const s = JSON.stringify(v) ?? String(v); return s.length > n ? s.slice(0, n) + '...' : s; };

let failed = 0, known = 0, total = 0;
const failures: string[] = [];
const knownLines: string[] = [];
const wl = JSON.stringify(VECTORS.weapons), loaded = JSON.stringify(arsenal.order);
if (wl !== loaded) {
  failures.push(`weapons: the vectors cover ${wl} but the sim loads ${loaded} from game.json; run make sim-vectors`);
}
const isGroup = (g: string): g is keyof Inputs => Object.hasOwn(RUN, g);
/* protocol/sim-vectors.php writes each group's inputs in the shape its runner reads: the one place the JSON is taken at its word. */
const runCase = <K extends keyof Inputs>(group: K, input: unknown): unknown => RUN[group](input as Inputs[K]);
for (const [group, cases] of Object.entries(VECTORS.groups)) {
  if (!isGroup(group)) { failures.push(`${group}: no runner for this group in sim-vectors.test.ts`); continue; }
  for (const c of cases) {
    total++;
    let got: unknown, bad: string[];
    try {
      got = runCase(group, c.in);
      bad = diff(expectedFor(group, c.in, c.out), got, 'out', [], c.exact === true);
    } catch (e) {
      const stack = e instanceof Error ? e.stack : undefined;
      bad = [`threw ${stack ? stack.split('\n').slice(0, 3).join(' | ') : e}`];
    }
    if (c.known) {
      // Only the fields the known difference names may disagree.
      const knownPaths = must(c.knownPaths, `${group}/${c.name}'s knownPaths`);
      const norm = (b: string) => String(b.split(':')[0]).replace(/\[\d+\]/g, '[]');
      const allowed = (b: string) => knownPaths.some(p => norm(b) === p || norm(b).startsWith(p + '.') || norm(b).startsWith(p + '['));
      const other = bad.filter(b => !allowed(b));
      if (other.length) {
        failures.push(`${group}/${c.name}: known difference (${knownPaths.join(', ')}), but other fields disagree too\n  ${other.slice(0, 6).join('\n  ')}`);
      } else if (bad.length) { known++; knownLines.push(`KNOWN ${group}/${c.name} :: ${c.known}`); }
      else failures.push(`${group}/${c.name}: marked as a known difference but client and server now agree; drop its reason in protocol/sim-vectors.php`);
    } else if (bad.length) {
      failures.push(`${group}/${c.name}\n  ${bad.slice(0, 6).join('\n  ')}\n  inputs:   ${clip(c.in, 700)}\n  expected: ${clip(c.out, 700)}\n  actual:   ${clip(got, 700)}`);
    }
  }
}
failed = failures.length;
const summary = `SIM-VECTORS-OK ${total} cases (${known} known differences)`;
test('client and server sims agree on every shared vector', t => {
  for (const l of knownLines) t.diagnostic(l);
  t.diagnostic(summary);
  assert.equal(failed, 0, `SIM-VECTORS-FAILED ${failed} of ${total}: client (src/sim.ts) and server (rooms.php) disagree; fix the side that is wrong, then run make sim-vectors\n` + failures.join('\n'));
});
