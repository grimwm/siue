/* Operation Tankity: what each gun is worth, measured with the real sim.
 *
 * Every gun is fired from a ground tank at a standard set of scenarios (flat
 * ground and seeded hills with a target near, mid and far; a target on a
 * slope; a target in a dip), at one target and at a cluster of three, against
 * a drone and against a tank. In each, a skilled gunner's aim is found (the
 * angle and power that do the most damage), and the gun's expected damage is
 * the mean over a small spread of aim errors around it: power ±2 and ±4,
 * angle ±2. Damage counts every armor point the targets lose to the volley,
 * blasts, beams, burns and falls alike, with no armor cap (a target has a
 * million). test/balance.test.ts holds the arsenal to its invariants and
 * tools/balance-report.ts prints the table. Pure: no page, and the same
 * arsenal always gives the same numbers. Never bundled. */
import { GRAV, aimLimits, fireWeapon, flies, genTerrain, hashSeed, mulberry32, settleFalls, shotSpeed, stepBallistic, stepShells, surfY, volleyOn } from './sim.ts';
import type { Arsenal, Tank, Weapon, World } from './sim.ts';
import { beamAim } from './ai.ts';

/** The field the harness fires on (a room's), and the gunner's column. */
export const BAL_W = 720, BAL_GX = 60;
/** How far the near, mid and far targets stand from the gunner, px. */
export const BAL_NEAR = 120, BAL_MID = 280, BAL_FAR = 480;
/** A ring gun (plasma) reaches only around its gunner: it is judged with its target this close, px. */
export const BAL_RING = 70;
/** The cluster's spacing: the closest two units ever stand (UNIT_GAP). */
const CLUSTER_GAP = 44;
const TARGET_HP = 1e6;

export type BalanceGround = 'flat' | 'hills' | 'slope' | 'dip';
export interface BalanceScenario { id: string; ground: BalanceGround; dist: number }
/** The standard scenarios: flat and hills at near, mid and far; a target on a slope; a target in a dip. */
export const SCENARIOS: readonly BalanceScenario[] = [
  { id: 'flat-near', ground: 'flat', dist: BAL_NEAR },
  { id: 'flat-mid', ground: 'flat', dist: BAL_MID },
  { id: 'flat-far', ground: 'flat', dist: BAL_FAR },
  { id: 'hills-near', ground: 'hills', dist: BAL_NEAR },
  { id: 'hills-mid', ground: 'hills', dist: BAL_MID },
  { id: 'hills-far', ground: 'hills', dist: BAL_FAR },
  { id: 'slope', ground: 'slope', dist: BAL_MID },
  { id: 'dip', ground: 'dip', dist: BAL_MID },
];
/** The aim search: launch angles and powers a gunner tries, then the errors around the best. */
const ANGLES = [20, 35, 50, 65];
const POWER_STEP = 4;
const ERR_POWER = [-4, -2, 0, 2, 4];
const ERR_ANGLE = [-2, 0, 2];

/** The ground of a scenario whose target stands at column tx. */
export function balanceGround(g: BalanceGround, tx: number): number[] {
  if (g === 'hills') return genTerrain(mulberry32(hashSeed('balance-hills')), BAL_W).terrain;
  const t = new Array<number>(BAL_W);
  for (let x = 0; x < BAL_W; x++) {
    // A slope rises 1 px in 2 toward the gunner through the target; a dip is 40 px deep, its walls 1 in 2.
    t[x] = 330 + (g === 'slope' ? Math.max(-60, Math.min(60, (x - tx) * 0.5)) : g === 'dip' ? Math.max(0, 40 - Math.abs(x - tx) * 0.5) : 0);
  }
  return t;
}

/** The targets of a scenario: one at dist, or three CLUSTER_GAP apart centred there. */
function targetCols(dist: number, n: 1 | 3): number[] {
  const tx = BAL_GX + dist;
  return n === 1 ? [tx] : [tx - CLUSTER_GAP, tx, tx + CLUSTER_GAP];
}

/** The armor one volley of wkey at (angle, power) takes off the targets. */
export function volleyDamage(arsenal: Arsenal, wkey: string, ground: readonly number[], cols: readonly number[], drone: boolean, angle: number, power: number): number {
  const terrain = ground.slice();
  const gunner: Tank = { id: 'gunner', isPlayer: true, x: BAL_GX, y: surfY(terrain, BAL_GX), angle, power, hp: TARGET_HP, fuel: 0, dirS: 1 };
  const targets: Tank[] = cols.map((x, i) => ({
    id: 'target' + i, isPlayer: false, human: !drone, x, y: surfY(terrain, x), angle: 0, power: 0, hp: TARGET_HP, fuel: 100, dirS: -1, chutes: 0,
  }));
  const world: World = {
    tanks: [gunner, ...targets], terrain, wind: 0, round: 1, rng: mulberry32(hashSeed('balance')), shells: [],
    score: 0, cash: 0, ammo: { [wkey]: Infinity }, selected: wkey, shield: false, bunker: 0, laststand: false, jammer: 0, chutes: 0,
  };
  fireWeapon(world, arsenal, gunner, wkey);
  for (let f = 0; volleyOn(world) && f < 6000; f++) stepShells(world, arsenal, 1 / 60);
  settleFalls(world, arsenal);
  return targets.reduce((sum, t) => sum + (TARGET_HP - t.hp), 0);
}

/** A gun's expected damage in one scenario: the best aim's, averaged over the aim errors around it. */
export function expectedDamage(arsenal: Arsenal, wkey: string, sc: BalanceScenario, n: 1 | 3, drone: boolean): number {
  return aimDamage(arsenal, wkey, sc, n, drone).mean;
}
/** A gun's damage in one scenario: `mean` as expectedDamage, and `best` the most any one volley
 *  the gunner tried there did (the best hit a perfect shot lands, a direct hit or a stop at a hull). */
export function aimDamage(arsenal: Arsenal, wkey: string, sc: BalanceScenario, n: 1 | 3, drone: boolean): { mean: number; best: number } {
  const w = arsenal.weapons[wkey]!;
  const dist = w.effect === 'plasma' ? BAL_RING : sc.dist;
  const cols = targetCols(dist, n);
  const ground = balanceGround(sc.ground, BAL_GX + dist);
  const lim = aimLimits(w);
  let top = 0;
  const shot = (a: number, p: number): number => {
    const v = volleyDamage(arsenal, wkey, ground, cols, drone, Math.max(lim.min, Math.min(lim.max, a)), Math.max(0, Math.min(100, p)));
    top = Math.max(top, v);
    return v;
  };
  let best = { v: -1, a: ANGLES[0]!, p: 100 };
  const consider = (a: number, p: number): void => {
    const v = shot(a, p);
    if (v > best.v) best = { v, a, p };
  };
  if (w.effect === 'beam') {
    // A beam is aimed straight at the middle target's body, as a drone aims one.
    const self = { isPlayer: true, x: BAL_GX, y: surfY(ground, BAL_GX), dirS: 1 } as Tank;
    const mid = { isPlayer: false, human: !drone, x: cols[(cols.length - 1) / 2]!, y: surfY(ground, cols[(cols.length - 1) / 2]!) } as Tank;
    const at = beamAim({} as World, arsenal, self, mid, wkey);
    best = { v: 0, a: at.a, p: at.p };
  } else if (!flies(w)) {
    best = { v: 0, a: 45, p: 100 };
  } else {
    for (const a of ANGLES) for (let p = POWER_STEP; p <= 100; p += POWER_STEP) consider(a, p);
    const b = best;
    for (const dp of [-2, -1, 1, 2]) consider(b.a, b.p + dp);
    for (const da of [-6, -3, 3, 6]) consider(b.a + da, b.p);
  }
  // A gun with no flight fires at full power, its aim the only error.
  const powers = flies(w) ? ERR_POWER : [0];
  let sum = 0;
  for (const dp of powers) for (const da of ERR_ANGLE) sum += shot(best.a + da, best.p + dp);
  return { mean: sum / (powers.length * ERR_ANGLE.length), best: top };
}

/** How the harness judges a gun. `damage`: by its damage per dollar. `dot`: damage over time
 *  (napalm), judged by its own line. `utility`: a gun whose job is not a blast on a unit (a
 *  tracer, dirt (even dirt with a blast: its job is the burial), a pour, a riot charge, a slump, or a harmless crater or burrow whose only
 *  damage is a fall), judged by its own line. */
export type BalanceRole = 'damage' | 'dot' | 'utility';
export function balanceRole(w: Readonly<Weapon>): BalanceRole {
  if (w.effect === 'napalm') return 'dot';
  if (w.effect === 'dirt') return 'utility';
  if (w.dmg === 0 && !((w.warheads || 0) > 0 && (w.subDmg || 0) > 0)) return 'utility';
  return 'damage';
}

/** One gun's measured worth. */
export interface GunWorth {
  key: string;
  role: BalanceRole;
  /** Expected damage per shot: at one target, and at a cluster of three (mean over scenarios and target kinds). */
  single: number;
  cluster: number;
  /** Dollars per shot (price / pack); 0 for the free Shell. */
  perShot: number;
  /** Expected single-target damage per dollar; null for a gun the shop does not sell. */
  perDollar: number | null;
  /** Single-target expected damage per scenario id (mean of drone and tank). */
  byScenario: Record<string, number>;
  /** The best single-target hit in any scenario, at a drone or a tank: one volley, perfectly aimed. */
  bestHit: number;
}

/** Every gun of the arsenal, measured, in rack order. */
export function measureArsenal(arsenal: Arsenal): GunWorth[] {
  return arsenal.order.map(key => measureGun(arsenal, key));
}
export function measureGun(arsenal: Arsenal, key: string): GunWorth {
  const w = arsenal.weapons[key]!;
  const byScenario: Record<string, number> = {};
  let single = 0, cluster = 0, bestHit = 0;
  for (const sc of SCENARIOS) {
    const atDrone = aimDamage(arsenal, key, sc, 1, true), atTank = aimDamage(arsenal, key, sc, 1, false);
    bestHit = Math.max(bestHit, atDrone.best, atTank.best);
    const one = (atDrone.mean + atTank.mean) / 2;
    byScenario[sc.id] = one;
    single += one;
    cluster += (expectedDamage(arsenal, key, sc, 3, true) + expectedDamage(arsenal, key, sc, 3, false)) / 2;
  }
  single /= SCENARIOS.length;
  cluster /= SCENARIOS.length;
  const perShot = w.pack > 0 ? w.price / w.pack : 0;
  return { key, role: balanceRole(w), single, cluster, perShot, perDollar: perShot > 0 ? single / perShot : null, byScenario, bestHit };
}

/** The line a row belongs to: its cat, then its `line` within the cat when it names one. */
export function lineOf(w: Readonly<Weapon>): string {
  return (w.cat || 'Shells') + (w.line ? '/' + w.line : '');
}
/** The damage-per-dollar band: the median of the damage guns', and the share either side of it a gun may sit. */
export const BAND_LO = 0.5, BAND_HI = 2;
export function median(xs: readonly number[]): number {
  const s = xs.slice().sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m]! : (s[m - 1]! + s[m]!) / 2;
}
/** The share of a room's field every gun that flies must reach at full power and its best angle
 *  (unless its row says shortRange), so no gun is useful only at maximum power. */
export const REACH_MIN = 0.85;
/** How far gun w's full-power shot flies on a room's field with no wind, launch height to launch
 *  height, at its best whole-degree angle (the sim's own speed, gravity and 1/60 s step), px. */
export function fullReach(w: Readonly<Weapon>): number {
  let best = 0;
  for (let a = 5; a <= 85; a++) {
    const v = shotSpeed(100, w.speed), r = a * Math.PI / 180;
    const st = { x: 0, y: 0, vx: Math.cos(r) * v, vy: -Math.sin(r) * v };
    for (let i = 0; i < 6000 && !(st.y >= 0 && st.vy > 0); i++) stepBallistic(st, 1 / 60, 0, GRAV);
    best = Math.max(best, st.x);
  }
  return best;
}
/** No gun outside NUKE's own family lands a best single-target hit above this share of NUKE's. */
export const HIT_CAP = 0.7;
/** Two damage guns this far apart in expected damage must unlock in that order (minRound). */
export const UNLOCK_GAP = 1.5;
