/* Operation Tankity: the drone AI.
 *
 * Who a drone shoots at, how it aims and which gun it fires: ballistic
 * solutions from the sim, the harm each loaded gun would do,
 * round-scaled error, bracketing and the six strategies. Pure, like the sim it
 * reads (state in, a choice out). server/ai.php room_ai_choose is the same
 * algorithm, kept in step by the shared vectors in protocol/sim-vectors.json.
 * brkLand stays in sim.ts: explode calls it, and sim.ts must not import this
 * file. */
import { GRAV, blastDamage, clamp, dist, dropTime, facing, flightKey, gauss, muzzle, powi, scatterVel, simShot, splitPoint, splitVel, spotTaken, surfY, unitHitBox } from './sim.ts';
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

/* The guns a fresh aim searches: the first of each planning arc, in rack
   order. A later gun with the same arc lands every shot where the first did,
   and the search keeps only a strictly better shot, so it could never win. */
export function arcGuns(arsenal: Arsenal, guns: readonly string[]): string[] {
  const seen = new Set<string>();
  return guns.filter(k => {
    const f = flightKey(arsenal.weapons[k]!);
    if (seen.has(f)) return false;
    seen.add(f);
    return true;
  });
}
/* The highest ground: the least terrain y. */
function groundTop(terrain: readonly number[]): number {
  let top = Infinity;
  for (const y of terrain) if (y < top) top = y;
  return top;
}
/* The best (angle, power) near a last aim for a shot to burst on goalX: a
   6-step sweep, then 3- and 1-step neighbours of its best. Nearer the last
   aim wins ties. */
function aiCorrect(world: World, arsenal: Arsenal, mx: number, my: number, wkey: string, dirS: number,
  a0: number, p0: number, goalX: number, high: number): [number, number] {
  let best: { err: number; a: number; p: number } | null = null;
  const tryAim = (a: number, p: number): void => {
    if (a < 10 || a > 170 || p < 10 || p > 100) return;
    const land = simShot(world, arsenal, mx, my, a, p, wkey, dirS, high);
    const err = (land.oob ? 400 + Math.abs(land.x - goalX) * 0.2 : Math.abs(land.x - goalX)) + 0.02 * (Math.abs(a - a0) + Math.abs(p - p0));
    if (!best || err < best.err) best = { err, a, p };
  };
  for (let da = -12; da <= 12; da += 6) {
    for (let dp = -18; dp <= 18; dp += 6) tryAim(a0 + da, p0 + dp);
  }
  for (const step of [3, 1]) {
    const { a: ca, p: cp } = best!;
    for (let da = -step; da <= step; da += step) {
      for (let dp = -step; dp <= step; dp += step) if (da || dp) tryAim(ca + da, cp + dp);
    }
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
     glory    the rival with the most score (a drone: 300 per kill); its most harmful gun of any arc
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
/* Guns that hurt an area: pellets, bomblets, leaping warheads, a big blast. */
function areaGun(w: Weapon): boolean {
  return w.effect === 'pellets' || w.effect === 'cluster' || w.effect === 'scatter' || w.effect === 'hop' || w.radius >= 40;
}

/* ---------- which gun: the harm each would do ---------- */
/* A landing as simShot predicts it (where, and the velocity it came down
   with), and the aim that flies it. */
export interface Landing {
  x: number;
  y: number;
  oob: boolean;
  vx?: number;
  vy?: number;
  a?: number;
  p?: number;
}
/* How much wider than predicted a gun's reach is taken to be near the drone
   itself: the aim's wobble moves the landing, and wind and hills carry
   bomblets and leaps past the flat, windless landings the drone predicts. */
export const AI_SAFE_MARGIN = 1.25;
/* A blast's damage to a unit d px from it, or 0 past its reach. */
function reachDamage(dmg: number, d: number, r: number): number {
  return d <= r + 14 ? blastDamage(dmg, d, r) : 0;
}
/* Where a gun's later munitions land, as x on the landing's ground: a hop
   gun's leaps one after another, a scatter gun's bomblets from its burst, a
   cluster's bomblets from where its shot splits. Each flies from its start
   with no wind down to the landing's height (dropTime). `burst` is false
   when the shot itself never bursts (a cluster that splits). Pellets and
   other guns have none. server/ai.php room_ai_munitions is the same. */
export function munitions(world: World, arsenal: Arsenal, self: Tank, wkey: string, land: Landing): { burst: boolean; xs: number[] } {
  const w = arsenal.weapons[wkey]!;
  const xs: number[] = [];
  if (w.effect === 'hop') {
    let x = land.x, vx = land.vx || 0, vy = land.vy || 0;
    const keep = w.hopKeep || 0.5;
    for (let i = 1; i < (w.hops || 1); i++) {
      const hvx = vx * keep, hvy = -Math.abs(vy) * keep;
      const t = dropTime(land.y - 1, hvy, land.y);
      x += hvx * t;
      xs.push(x);
      vx = hvx;
      vy = hvy + GRAV * t;
    }
  } else if (w.effect === 'scatter') {
    for (const [vx, vy] of scatterVel(Math.max(2, w.split || 4), w.fan || 0.22, w.kick || 150)) {
      xs.push(land.x + vx * dropTime(land.y - 2, vy, land.y));
    }
  } else if (w.effect === 'cluster' && land.a !== undefined && land.p !== undefined) {
    const m = muzzle({ ...self, angle: land.a });
    const at = splitPoint(world, arsenal, m.x, m.y, land.a, land.p, wkey, facing(self));
    if (!at) return { burst: true, xs };
    for (const [vx, vy] of splitVel(at.vx, at.vy, Math.max(2, w.split || 4), w.fan || 0.22)) {
      xs.push(at.x + vx * dropTime(at.y, vy, land.y));
    }
    return { burst: false, xs };
  }
  return { burst: true, xs };
}
/* The harm gun wkey would do to target if it landed at land, fired by self:
   its blast on the target's body, plus each later munition's blast at its own
   landing (munitions), plus fallHarm, never more than the target's armor.
   Pellets count each pellet at the fan's spread at that distance. -Infinity
   when any of it could reach self's own body (with AI_SAFE_MARGIN):
   that gun is never chosen. server/ai.php room_ai_harm is the same. */
export function aiHarm(world: World, arsenal: Arsenal, self: Tank, target: Tank, wkey: string, land: Landing): number {
  const w = arsenal.weapons[wkey]!;
  if (land.oob) return 0;
  const tb = unitHitBox(target), sb = unitHitBox(self);
  const d = dist(tb.cx - land.x, tb.cy - land.y);
  // How near the drone's own body a burst may come: at the landing, or on the
  // target's near side, where a shot that strikes the target's body bursts.
  const own = Math.min(dist(sb.cx - land.x, sb.cy - land.y), dist(sb.cx - tb.cx, sb.cy - tb.cy) - Math.max(tb.rx, tb.ry));
  let harm = 0, reach = 0;
  if (w.effect === 'pellets') {
    const n = w.pellets || 1;
    // How far the fan has spread over the flight.
    const len = dist(land.x - self.x, land.y - (self.y - 14));
    for (let i = 0; i < n; i++) {
      const off = Math.abs(i - (n - 1) / 2) * (w.spread || 0) * len;
      harm += reachDamage(w.dmg, d + off, w.radius);
      reach = Math.max(reach, w.radius + 14 + off);
    }
  } else {
    const subs = munitions(world, arsenal, self, wkey, land);
    if (subs.burst) {
      harm = reachDamage(w.dmg, d, w.radius);
      reach = w.radius + 14;
    }
    const subDmg = w.subDmg || w.dmg, subR = w.subRadius || w.radius;
    let far = 0;
    for (const x of subs.xs) {
      harm += reachDamage(subDmg, dist(tb.cx - x, tb.cy - land.y), subR);
      far = Math.max(far, Math.abs(x - land.x));
    }
    if (subs.xs.length) reach = Math.max(reach, far + subR + 14);
  }
  if (own <= reach * AI_SAFE_MARGIN) return -Infinity;
  return Math.min(target.hp, harm + fallHarm(world, arsenal, self, target, wkey, land));
}
/* The harm of the fall a gun's crater would give the target, less the drone's
   own. Craters do not drop units into falls that hurt yet, so it is 0.
   server/ai.php room_ai_fall_harm is the same. */
export function fallHarm(_world: World, _arsenal: Arsenal, _self: Tank, _target: Tank, _wkey: string, _land: Landing): number {
  return 0;
}
/* A planning arc's best aim from the search, and where it lands. */
interface ArcAim {
  err: number;
  a: number;
  p: number;
  land: Landing;
}
/* The gun to fire once the search has found each arc's best aim. Each
   candidate is scored at its arc's best aim; the most harmful wins, the
   cheaper on a tie, then rack order. Glory weighs every gun it carries; any other strategy only the
   guns of the best-landing arc (so the landing is the same as with its
   first gun). When no gun would hurt anyone, the pick is that arc's first
   gun (glory: its strongest gun); if that would reach the drone itself, the
   gun of the best-landing arc that would not (rack order on a tie). */
function pickGun(world: World, arsenal: Arsenal, t: Tank, target: Tank, glory: boolean, guns: readonly string[],
  arcOf: ReadonlyMap<string, string>, byArc: ReadonlyMap<string, ArcAim>, bestGun: string): string {
  const harms = new Map<string, number>();
  const harmOf = (k: string): number => {
    let h = harms.get(k);
    if (h === undefined) {
      h = aiHarm(world, arsenal, t, target, k, byArc.get(arcOf.get(k)!)!.land);
      harms.set(k, h);
    }
    return h;
  };
  const pool = glory ? guns : guns.filter(k => arcOf.get(k) === arcOf.get(bestGun));
  let top: string | null = null, topHarm = 0;
  for (const k of pool) {
    const h = harmOf(k);
    // The cheaper gun on a tie: harm is capped at the target's armor, so it is the one that finishes the job for less.
    if (h > topHarm || (top !== null && h === topHarm && arsenal.weapons[k]!.price < arsenal.weapons[top]!.price)) [top, topHarm] = [k, h];
  }
  if (top !== null) return top;
  let fallback = bestGun;
  if (glory) for (const k of pool) if (arsenal.weapons[k]!.dmg > arsenal.weapons[fallback]!.dmg) fallback = k;
  if (harmOf(fallback) !== -Infinity) return fallback;
  let safe: string | null = null;
  for (const k of guns) {
    if (harmOf(k) !== -Infinity && (safe === null || byArc.get(arcOf.get(k)!)!.err < byArc.get(arcOf.get(safe)!)!.err)) safe = k;
  }
  return safe === null ? fallback : safe;
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
  const high = groundTop(world.terrain);
  if (cont) {
    w = mem!.w;
    n = mem!.n + 1;
    const sim = simShot(world, arsenal, m.x, m.y, mem!.a, mem!.p, w, dirS, high);
    const landed = mem!.land === null ? sim.x : mem!.land;
    let miss = target.x - landed;
    if (Math.abs(miss) <= BRK_ON) miss = 0; // a burst on the hull is on target: hold the aim
    // Where the sim must put a shot so that, shifted by the measured miss of
    // the last one, it bursts on the target (or, taking out only part of the
    // miss, nearer it).
    [ba, bp] = aiCorrect(world, arsenal, m.x, m.y, w, dirS, mem!.a, mem!.p, sim.x + miss * skill.correct, high);
    wob = Math.max(skill.brkFloor * fa.floor, wob * powi(skill.brkShrink, n));
  } else {
    let guns = keys;
    if (s === 'lobber') {
      const area = keys.filter(k => areaGun(arsenal.weapons[k]!));
      if (area.length) guns = area;
    }
    // Every planning arc's best aim, and the best of all.
    const arcOf = new Map(guns.map(k => [k, flightKey(arsenal.weapons[k]!)]));
    const byArc = new Map<string, ArcAim>();
    let best: { err: number; a: number; p: number; wkey: string } | null = null;
    const consider = (wkey: string, a: number, p: number): number => {
      const land = simShot(world, arsenal, m.x, m.y, a, p, wkey, dirS, high);
      const err = land.oob ? 400 + Math.abs(land.x - target.x) * 0.2 : Math.abs(land.x - target.x);
      const f = arcOf.get(wkey)!, b = byArc.get(f);
      if (!b || err < b.err) byArc.set(f, { err, a, p, land: { ...land, a, p } });
      if (!best || err < best.err) best = { err, a, p, wkey };
      return err;
    };
    // One gun over angles lo..hi of the grid (25, 31, ...) and powers 20, 26,
    // ... 98: every other point of it, then the eight neighbours of the best.
    // A roller's planning flight rolls on after it lands, several times the
    // cost of a shell's: its arcs are searched after the others, start on a
    // grid twice as coarse, and narrow (12, then 6) only when that coarse best
    // already beats the best landing so far.
    const search = (wkey: string, lo: number, hi: number): void => {
      const roll = arsenal.weapons[wkey]!.effect === 'roller';
      const coarse = roll ? 24 : 12;
      let ca = lo, cp = 20, ce = Infinity;
      for (let a = lo; a <= hi; a += coarse) {
        for (let p = 20; p <= 100; p += coarse) {
          const err = consider(wkey, a, p);
          if (err < ce) [ca, cp, ce] = [a, p, err];
        }
      }
      if (roll && ce > best!.err) return;
      for (const step of roll ? [12, 6] : [6]) {
        const ba = ca, bp = cp;
        for (let a = ba - step; a <= ba + step; a += step) {
          for (let p = bp - step; p <= bp + step; p += step) {
            if ((a !== ba || p !== bp) && a >= lo && a <= hi && p >= 20 && p <= 100) {
              const err = consider(wkey, a, p);
              if (err < ce) [ca, cp, ce] = [a, p, err];
            }
          }
        }
      }
    };
    // The first angle on the grid above LOB_ANGLE.
    const highFrom = 25 + 6 * Math.ceil((LOB_ANGLE + 1 - 25) / 6);
    const plan = arcGuns(arsenal, guns);
    plan.sort((a, b) => Number(arsenal.weapons[a]!.effect === 'roller') - Number(arsenal.weapons[b]!.effect === 'roller'));
    for (const wkey of plan) search(wkey, s === 'lobber' ? highFrom : 25, 155);
    // A lobber falls back to flat shots only when no high arc lands near.
    if (s === 'lobber' && best!.err > LOB_OK) {
      for (const wkey of plan) search(wkey, 25, highFrom - 1);
    }
    w = pickGun(world, arsenal, t, target, s === 'glory', guns, arcOf, byArc, best!.wkey);
    const aim = byArc.get(arcOf.get(w)!)!;
    [ba, bp, n] = [aim.a, aim.p, 0];
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
