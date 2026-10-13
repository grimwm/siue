/* Operation Tankity: the drone AI.
 *
 * Who a drone shoots at and how it aims: ballistic solutions from the sim,
 * round-scaled error, bracketing and the six strategies. Pure, like the sim it
 * reads (state in, a choice out). server/ai.php room_ai_choose is the same
 * algorithm, kept in step by the shared vectors in protocol/sim-vectors.json.
 * brkLand stays in sim.ts: explode calls it, and sim.ts must not import this
 * file. */
import { clamp, facing, gauss, muzzle, powi, simShot, spotTaken, surfY } from './sim.ts';
import type { Arsenal, Difficulty, Rng, Tank, Weapon, World } from './sim.ts';
export type { Difficulty } from './sim.ts';

/* ---------- drone AI: real ballistic solutions, plus round-scaled error ---------- */
export interface AimChoice {
  wkey: string;
  angle: number;
  power: number;
  tactic?: string; // set when the drone just switched strategy
}
/* Drone bracketing, like real artillery. The first shot at a target is the
   ballistic solution plus the round's wobble (the ranging shot). While the
   target and the gunner both stay put, each next shot starts from the last aim
   and corrects by a share (`correct`) of the measured miss, with the wobble
   shrinking by `brkShrink` per correction down to `brkFloor` (never zero, so a
   drone cannot lock into a bad aim). A target that moved more than BRK_DRIFT
   px, a gunner that moved, a dead target, or `brkMax` corrections without a
   kill all send it back to a fresh solution. server/ai.php room_ai_choose is
   the same algorithm. */
export const BRK_DRIFT = 3;
export const BRK_ON = 22;

/* How well the drones aim, by difficulty. The ranging shot's wobble is
   wobStart - wobStep x round, never below wobFloor; angle and power stray by
   9 and 12 times it. The numbers are tuned against measured hit rates
   (src/ai-measure.ts, test/ai-hitrate.test.mjs): hard is the sharpest
   (full correction, fastest-shrinking wobble), normal lands a ranging shot 10-25% of the time from round 1
   to round 10, easy about half as often as normal. server/ai.php
   ROOM_DIFFICULTY is the same table. */
export interface AimSkill {
  wobStart: number;
  wobStep: number;
  wobFloor: number;
  correct: number; // the share of the measured miss a correction takes out
  brkShrink: number;
  brkFloor: number;
  brkMax: number;
}
export const DIFFICULTIES: readonly Difficulty[] = ['easy', 'normal', 'hard'];
export const DIFFICULTY: Readonly<Record<Difficulty, Readonly<AimSkill>>> = {
  easy: { wobStart: 5, wobStep: 0.3, wobFloor: 2, correct: 0.5, brkShrink: 0.6, brkFloor: 0.8, brkMax: 5 },
  normal: { wobStart: 3.7, wobStep: 0.33, wobFloor: 1.15, correct: 0.6, brkShrink: 0.5, brkFloor: 0.4, brkMax: 5 },
  hard: { wobStart: 0.85, wobStep: 0.12, wobFloor: 0.25, correct: 1, brkShrink: 0.65, brkFloor: 0.2, brkMax: 5 },
};
/* Wider fields fly faster shells (sim.ts fieldReach), so a degree or a power
   point moves the burst further: the drones' wobble tightens with the width so
   each difficulty keeps its hit rates (test/ai-hitrate.test.mjs, every width).
   `aim` scales the ranging wobble, `floor` the bracket's floor. Measured with
   src/ai-measure.ts; between points the knobs are interpolated straight.
   Rooms are always ROOM_W wide, where both are exactly 1. */
export const FIELD_AIM: readonly { w: number; aim: number; floor: number }[] = [
  { w: 720, aim: 1, floor: 1 },
  { w: 1080, aim: 0.7, floor: 0.5 },
  { w: 1440, aim: 0.55, floor: 0.4 },
];
export function fieldAim(w: number): { aim: number; floor: number } {
  const last = FIELD_AIM[FIELD_AIM.length - 1]!;
  if (w <= FIELD_AIM[0]!.w) return { aim: FIELD_AIM[0]!.aim, floor: FIELD_AIM[0]!.floor };
  if (w >= last.w) return { aim: last.aim, floor: last.floor };
  let i = 0;
  while (FIELD_AIM[i + 1]!.w < w) i++;
  const a = FIELD_AIM[i]!, b = FIELD_AIM[i + 1]!;
  const t = (w - a.w) / (b.w - a.w);
  return { aim: a.aim + (b.aim - a.aim) * t, floor: a.floor + (b.floor - a.floor) * t };
}
/* The table row for a stored difficulty; anything else (an older save, a
   room from before the setting) aims at normal. */
export function aimSkill(d: string | undefined): Readonly<AimSkill> {
  return DIFFICULTIES.includes(d as Difficulty) ? DIFFICULTY[d as Difficulty] : DIFFICULTY.normal;
}

/* The best (angle, power) near a last aim for a shot to burst on goalX: a
   coarse sweep, then a fine one around its best. Nearer the last aim wins ties. */
function aiCorrect(world: World, arsenal: Arsenal, mx: number, my: number, wkey: string, dirS: number,
  a0: number, p0: number, goalX: number): [number, number] {
  let best: { err: number; a: number; p: number } | null = null;
  const tryAim = (a: number, p: number): void => {
    if (a < 10 || a > 170 || p < 10 || p > 100) return;
    const land = simShot(world, arsenal, mx, my, a, p, wkey, dirS);
    const err = (land.oob ? 400 + Math.abs(land.x - goalX) * 0.2 : Math.abs(land.x - goalX)) + 0.02 * (Math.abs(a - a0) + Math.abs(p - p0));
    if (!best || err < best.err) best = { err, a, p };
  };
  for (let da = -15; da <= 15; da += 3) {
    for (let dp = -18; dp <= 18; dp += 3) tryAim(a0 + da, p0 + dp);
  }
  const { a: ca, p: cp } = best!;
  for (let da = -2; da <= 2; da++) {
    for (let dp = -2; dp <= 2; dp++) tryAim(ca + da, cp + dp);
  }
  const b = best!;
  return [b.a, b.p];
}
/* Drone strategies: who a drone shoots at and how it aims. Every drone is
   dealt one at random when it spawns, and a drone that goes DRY_FLIP turns
   without hurting anyone may switch (FLIP_CHANCE per further dry turn). Every
   strategy brackets a standing target the same way.
     hunter   keeps its target until it is wrecked (nearest when it picks)
     bully    always the nearest rival
     sniper   the weakest rival (lowest hp, nearest on a tie); wobble x0.8
     avenger  whoever last damaged it; the nearest while nobody has
     glory    the rival with the most score (a drone: 300 per kill); its strongest gun
     lobber   any rival; high arcs (above LOB_ANGLE degrees first) and area guns
   server/ai.php has the same table. */
export const TACTICS = ['hunter', 'bully', 'sniper', 'avenger', 'glory', 'lobber'] as const;
export const DRY_FLIP = 3;
export const FLIP_CHANCE = 0.35;
export const SNIPER_WOB = 0.8;
export const LOB_ANGLE = 60;
export const LOB_OK = 40; // a high arc this close is good enough; otherwise flat shots may compete
export const KILL_GLORY = 300;
export function pickTactic(rng: Rng): string {
  return TACTICS[Math.floor(rng() * TACTICS.length)]!;
}
/* A different strategy from the one it has. */
export function flipTactic(rng: Rng, now: string): string {
  const others = TACTICS.filter(k => k !== now);
  return others[Math.floor(rng() * others.length)]!;
}
/* Guns that hurt an area: pellets, cluster bomblets, a big blast. */
function areaGun(w: Weapon): boolean {
  return w.effect === 'pellets' || w.effect === 'cluster' || w.radius >= 40;
}
/* The rival a strategy would pick, ignoring any bracket in progress. Null for
   a lobber, whose pick is random. rivals are sorted nearest first. */
function tacticTarget(world: World, t: Tank, rivals: readonly Tank[], s: string): Tank | null {
  if (s === 'lobber') return null;
  let pick = rivals[0]!;
  if (s === 'hunter') {
    const mem = t.brk;
    for (const r of rivals) if (mem && world.tanks.indexOf(r) === mem.t) pick = r;
  } else if (s === 'sniper') {
    for (const r of rivals) if (r.hp < pick.hp) pick = r;
  } else if (s === 'avenger') {
    for (const r of rivals) if (world.tanks.indexOf(r) === (t.lastHitBy === undefined ? -1 : t.lastHitBy)) pick = r;
  } else if (s === 'glory') {
    const glory = (r: Tank): number => r.isPlayer ? world.score : (r.kills || 0) * KILL_GLORY;
    for (const r of rivals) if (glory(r) > glory(pick)) pick = r;
  }
  return pick;
}
export function aiChoose(world: World, arsenal: Arsenal, t: Tank): AimChoice {
  // Drones feud with each other too. Nobody is safe, nobody is perfect.
  const rivals = world.tanks
    .filter(c => c !== t && c.hp > 0)
    .sort((a, b) => Math.abs(a.x - t.x) - Math.abs(b.x - t.x));
  const dirS = facing(t);
  const m = muzzle(t);
  const keys = ['shell'];
  const rack = t.ammo || {};
  for (const k of arsenal.order) {
    if (k === 'shell' || keys.includes(k)) continue;
    if ((rack[k] || 0) > 0) keys.push(k);
  }
  // A drone that cannot hurt anyone for a while tries something else.
  let s = t.s || 'hunter';
  const mem = t.brk;
  let dry = t.dry || 0;
  let tactic: string | undefined;
  if (rivals.length) {
    if (mem) dry = t.dealt ? 0 : dry + 1;
    if (dry >= DRY_FLIP && world.rng() < FLIP_CHANCE) {
      s = flipTactic(world.rng, s);
      tactic = s;
      dry = 0;
    }
  }
  const want = rivals.length ? tacticTarget(world, t, rivals, s) : null;
  // A bracket in progress: same target standing where it stood, same gunner
  // on the same spot, the same gun still loaded, under the correction cap, and
  // a strategy that still wants that target.
  let cont: Tank | null = null;
  const skill = aimSkill(world.difficulty);
  const fa = fieldAim(world.terrain.length);
  if (mem && mem.n < skill.brkMax && Math.abs(t.x - mem.ox) <= 1 && keys.includes(mem.w)) {
    const c = world.tanks[mem.t];
    if (c && c !== t && c.hp > 0 && Math.abs(c.x - mem.tx) <= BRK_DRIFT && (want === null || want === c)) cont = c;
  }
  let target: Tank;
  if (cont) target = cont;
  else if (want) target = want;
  else if (rivals.length > 1) target = rivals[Math.floor(world.rng() * rivals.length)]!;
  else target = rivals[0] || t;
  // Deliberately shaky hands: dangerous up close, forgiving at range.
  // A jammer doubles the wobble of anything aimed at our tank.
  let wob = Math.max(skill.wobFloor, skill.wobStart - skill.wobStep * world.round) * (s === 'sniper' ? SNIPER_WOB : 1) * fa.aim;
  let ba: number, bp: number, w: string, n: number;
  if (cont) {
    w = mem!.w;
    n = mem!.n + 1;
    const sim = simShot(world, arsenal, m.x, m.y, mem!.a, mem!.p, w, dirS);
    const landed = mem!.land === null ? sim.x : mem!.land;
    let miss = target.x - landed;
    if (Math.abs(miss) <= BRK_ON) miss = 0; // a burst on the hull is on target: hold the aim
    // Where the sim must put a shot so that, shifted by the measured miss of
    // the last one, it bursts on the target (or, taking out only part of the
    // miss, nearer it).
    [ba, bp] = aiCorrect(world, arsenal, m.x, m.y, w, dirS, mem!.a, mem!.p, sim.x + miss * skill.correct);
    wob = Math.max(skill.brkFloor * fa.floor, wob * powi(skill.brkShrink, n));
  } else {
    let guns = keys;
    if (s === 'glory') {
      let top = keys[0]!;
      for (const k of keys) if (arsenal.weapons[k]!.dmg > arsenal.weapons[top]!.dmg) top = k;
      guns = [top];
    } else if (s === 'lobber') {
      const area = keys.filter(k => areaGun(arsenal.weapons[k]!));
      if (area.length) guns = area;
    }
    let best: { err: number; a: number; p: number; wkey: string } | null = null;
    const consider = (wkey: string, a: number): void => {
      for (let p = 20; p <= 100; p += 6) {
        const land = simShot(world, arsenal, m.x, m.y, a, p, wkey, dirS);
        const err = land.oob ? 400 + Math.abs(land.x - target.x) * 0.2 : Math.abs(land.x - target.x);
        if (!best || err < best.err) best = { err, a, p, wkey };
      }
    };
    // The first angle on the grid (25, 31, ...) above LOB_ANGLE.
    const highFrom = 25 + 6 * Math.ceil((LOB_ANGLE + 1 - 25) / 6);
    for (const wkey of guns) {
      for (let a = s === 'lobber' ? highFrom : 25; a <= 155; a += 6) consider(wkey, a);
    }
    // A lobber falls back to flat shots only when no high arc lands near.
    if (s === 'lobber' && best!.err > LOB_OK) {
      for (const wkey of guns) {
        for (let a = 25; a < highFrom; a += 6) consider(wkey, a);
      }
    }
    const pick = best!;
    [ba, bp, w, n] = [pick.a, pick.p, pick.wkey, 0];
  }
  if (target.isPlayer && (world.jammer || 0) > 0) wob *= 2;
  const angle = clamp(Math.round(ba + gauss(world.rng) * 9 * wob), 10, 170);
  const power = clamp(Math.round(bp + gauss(world.rng) * 12 * wob), 10, 100);
  // Drones shuffle for a better firing spot instead of camping one rut,
  // unless they are walking a bracket in.
  if (!cont && world.rng() < 0.35) {
    const dx = (world.rng() < 0.5 ? -1 : 1) * (8 + world.rng() * 27);
    const nx = clamp(t.x + dx, 12, world.terrain.length - 12);
    if (!spotTaken(world.tanks, t, nx)) {
      t.x = nx;
      t.y = surfY(world.terrain, t.x);
    }
  }
  t.s = s;
  t.dry = dry;
  t.dealt = false;
  t.brk = { t: world.tanks.indexOf(target), a: angle, p: power, w, n, tx: target.x, ox: t.x, land: null };
  const out: AimChoice = { wkey: w, angle, power };
  if (tactic) out.tactic = tactic;
  return out;
}
