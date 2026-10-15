/* Operation Tankity: the firing-range preview.
 *
 * A live mini demo of one weapon, run on its own small field with the war's
 * own ballistics (stepBallistic, launchSpeed, blastDamage and carveCrater from
 * sim.ts), so the demo flies exactly like a real shot. It aims, fires at a
 * fixed dummy, shows how the volley went, then resets and goes again.
 *
 * The state is a plain PreviewState that main.ts keeps (G.preview) and the
 * renderer draws from the view; this module only steps it. It never touches
 * the page: weapons, particle effects and the result text come in as a
 * PreviewEnv, so it compiles in the DOM-free program and test/preview.test.ts
 * drives it on a clock the test moves by hand. */
import {
  ROLL_LIFT, ROOM_W, aimLimits, airOf, beamLine, clamp, launchSpeed, stepBallistic, carveCrater, blastDamage, beamCarve, flies, unitHitBox, inHitBox,
  groundAt, groundSlope, rollStart, rollStep, rollOut, hopShell, scatterShells, fallDamage, FALL_RULES,
} from './sim.ts';
import { BURY_EPS, DIG_STEP, addDirt, digHeading, fillPour, pourLevel, riotCarve, slumpGround } from './earth.ts';
import { createEarthShow } from './earth-show.ts';
import type { EarthShow } from './earth-show.ts';
import type { Air, Shell, Tank, Weapon } from './sim.ts';
import { MARK_EVERY } from './marks.ts';
import { burnTicks, firePool, inFlames, tickSteps } from './fire.ts';
import type { FirePool } from './fire.ts';
import { createFireShow } from './fire-show.ts';
import type { FireShow } from './fire-show.ts';
import type { MarkKind } from './marks.ts';
import { WALL_BURST } from './walls.ts';
import type { Walls } from './walls.ts';

export const PV_W = 360, PV_H = 200, PV_WIND = 3, PV_FOE_HP = 60;
/** The shooter's column, and how far from it the dummy stands unless a gun's scenario says otherwise. */
export const PV_SX = 44, PV_DUMMY = 252;
/** The radius a tracer's landing effect is sized to: it has no blast of its own. */
const PV_MARK_R = 10;

/** The slice of an effects system (fx/engine.ts createSystem) the preview drives. */
export interface PreviewFx { wind: number; step(dt: number): void; clear(): void }

/** What the preview needs from its host. The effect hooks get the preview's
 * own system (null when there is none) and do nothing for null. `F` is the
 * system type the host hands to createPreview, so its hooks receive that type. */
export interface PreviewEnv<F extends PreviewFx = PreviewFx> {
  weapon(key: string): Readonly<Weapon> | undefined;
  muzzle(fx: F | null, wkey: string, x: number, y: number, ang: number): void;
  impact(fx: F | null, wkey: string, x: number, y: number, r: number): void;
  /** `len`: a line special (the beam) played along len px at heading ang. */
  special(fx: F | null, wkey: string, name: string, x: number, y: number, ang: number, len?: number): void;
  /** A shell in flight: drip its trail from its own position and velocity. */
  trail(fx: F | null, shell: PreviewShell, dt: number): void;
  /** The result line under the stage, once a volley has landed. */
  showResult(text: string): void;
}

export interface PreviewShell {
  x: number; y: number; vx: number; vy: number;
  wkey: string; age: number; pierced: boolean; split: boolean;
  dead?: boolean;
  dw?: number; // a cluster bomblet's own damage and radius
  dr?: number;
  rolling?: boolean; // a roller on the ground: ru is its speed along it, rt the 1/60 s steps rolled
  ru?: number;
  rt?: number;
  hop?: number; // a hop gun's warhead: 1 for the first, counting up with each leap
  spared?: boolean; // thrown from a burst on the dummy, so it never strikes the dummy directly
  digging?: boolean; // a digger burrowing: (dux, duy) its heading, dl the steps cut of dn, dk the warheads burst
  dux?: number;
  duy?: number;
  dl?: number;
  dn?: number;
  dk?: number;
}
export interface PreviewBoom { x: number; y: number; r: number; wkey: string; t: number; life: number }

/** aim: the demo waits, then solves and fires; fly: shells are up; show: the
 * result is on screen before the next volley. */
export type PreviewPhase = 'aim' | 'fly' | 'show';

/** `cv` is whatever the host draws on (the canvas); this module never reads it. */
export interface PreviewState<C = unknown> {
  wkey: string;
  terr: number[];
  sx: number; tx: number; // shooter and target columns
  sy: number; ty: number; // where the shooter and the dummy stand: on their ground, or buried under risen ground until a new range
  /** What the earth did to the dummy this volley: the px it dropped, how deep it ended up buried. */
  dropped: number; buriedBy: number;
  /** The range's ground as drawn while earth settles (a mound rising, liquid dirt flowing), as the war's. */
  show: EarthShow;
  /** A napalm pool on the range: the last one lit (null before one), how it is burning by the war's
   *  ticks (null once out: steps burned, the step fraction carried, ticks burnt), and its flames on screen. */
  pool: FirePool | null;
  burn: { step: number; acc: number; done: number; every: number; ticks: number } | null;
  fire: FireShow;
  wind: number;
  /** The range's side walls: the player's solo Walls (main.ts sets them as the range opens). */
  walls?: Walls;
  angle: number; power: number;
  phase: PreviewPhase;
  t: number; // seconds left in the phase
  shells: PreviewShell[];
  booms: PreviewBoom[];
  volleys: number;
  foeHp: number;
  fx: PreviewFx | null;
  result: string;
  resultT: number;
  volleyDmg: number;
  volleyHits: number;
  /** A tracer's path this volley (x, y pairs), as the battlefield marks it; null for other guns. */
  trace: { kind: MarkKind; pts: number[]; landed: boolean; age: number } | null;
  /** What this volley showed of its gun's mechanic (previewSeen). */
  seen: PreviewSeen;
  cv: C;
}
/** What a volley on the range showed: each a measure of one mechanic, 0 when the volley had none of it. */
export interface PreviewSeen {
  /** A shell, bomblet or warhead left the frame (off a side, the top or the bottom) before it resolved. */
  escaped: boolean;
  /** Hop warheads thrown on; bomblets thrown by a split or a scatter. */
  hops: number;
  split: number;
  /** px a roller rolled along the ground. */
  rolled: number;
  /** px a digger burrowed. */
  dug: number;
  /** px the liquid ran from where it landed to the dummy (0 when the pool missed the dummy). */
  flowed: number;
  /** px a seeker's burst lies from where its arc alone would have come down. */
  bend: number;
  /** px above the ground a proximity shell burst. */
  air: number;
  /** Degrees a beam ran below level. */
  dip: number;
  /** px a tracer's path rose above its higher end. */
  rise: number;
  /** px^2 of earth a riot charge cleared. */
  cleared: number;
}
export function previewSeen(): PreviewSeen {
  return { escaped: false, hops: 0, split: 0, rolled: 0, dug: 0, flowed: 0, bend: 0, air: 0, dip: 0, rise: 0, cleared: 0 };
}

/** A ridge under the dummy: px high, and px it falls away per column either side. */
const RIDGE = 60, RIDGE_SLOPE = 6;
/** A dip round the dummy: px deep, and px it rises per column away from it. */
const DIP = 30, DIP_SLOPE = 0.8;
/** A slope down to the dummy from the shooter's side: px high, and px it falls per column. */
const SLOPE = 70, SLOPE_FALL = 0.55;
/** A bowl round the dummy: its floor's half width, px its walls rise per column, and the most they rise. */
const BOWL_FLOOR = 20, BOWL_WALL = 2, BOWL = 90;
/** A perch the shooter stands on: px high, and the columns either side of it that it spans. */
const PERCH = 80, PERCH_HALF = 70;
/** The mound over a buried shooter: px of dirt round its hull. */
const MOUND = 30;
/** The range's ground to draw: earth still settling eases in, as on the battlefield. */
export function previewGround(pv: PreviewState): readonly number[] {
  return pv.show.shown(pv.terr);
}
/* The range's ground for gun w, by its scenario's `ground` (game.yaml
   preview): the hills; a dip round the dummy; a deep bowl round it; a steep
   ridge under it; a slope down to it from the shooter's side; a perch high
   over it for the shooter;
   or the hills with the shooter buried under a mound (where the shooter
   stands is the ground before the mound, rangeFloor). */
function makeRange(w: Readonly<Weapon>, sx: number, tx: number): number[] {
  const terr = rangeFloor(w, sx, tx);
  if (groundOf(w) === 'buried') addDirt(terr, sx, terr[sx]! - 4, MOUND);
  return terr;
}
function groundOf(w: Readonly<Weapon>): string {
  return (w.preview && w.preview.ground) || 'hills';
}
function rangeFloor(w: Readonly<Weapon>, sx: number, tx: number): number[] {
  const terr = makePreviewTerrain(), g = groundOf(w);
  for (let x = 0; x < PV_W; x++) {
    if (g === 'ridge') terr[x] = terr[x]! - Math.max(0, RIDGE - Math.abs(x - tx) * RIDGE_SLOPE);
    if (g === 'dip') terr[x] = terr[x]! + Math.max(0, DIP - Math.abs(x - tx) * DIP_SLOPE);
    if (g === 'slope') terr[x] = terr[x]! - clamp((tx - x) * SLOPE_FALL, 0, SLOPE);
    if (g === 'bowl') terr[x] = terr[x]! - clamp((Math.abs(x - tx) - BOWL_FLOOR) * BOWL_WALL, 0, BOWL);
    if (g === 'perch') terr[x] = terr[x]! - PERCH * clamp((PERCH_HALF - Math.abs(x - sx)) / (PERCH_HALF / 2), 0, 1);
  }
  return terr;
}
export function makePreviewTerrain(): number[] {
  const terr = new Array<number>(PV_W);
  for (let x = 0; x < PV_W; x++) {
    terr[x] = 150 + 14 * Math.sin(x / 63 + 1) + 7 * Math.sin(x / 29);
  }
  return terr;
}

/** A fresh demo of weapon `wkey`, or null for a weapon the arsenal lacks. */
export function createPreview<C, F extends PreviewFx>(wkey: string, env: PreviewEnv<F>, fx: F | null, cv: C): (PreviewState<C> & { fx: F | null }) | null {
  const w = env.weapon(wkey);
  if (!w) return null;
  // The dummy stands where the gun's scenario puts it (game.yaml preview `dummy`, px from the
  // shooter); a plasma ring reaches only so far, so its dummy stands within it.
  const sx = PV_SX, sc = w.preview || {};
  const tx = sx + (sc.dummy || (w.effect === 'plasma' ? Math.round(w.radius * 0.6) : PV_DUMMY));
  const terr = makeRange(w, sx, tx);
  return {
    wkey, terr,
    sx, tx, sy: rangeFloor(w, sx, tx)[sx]!, ty: terr[tx]!, dropped: 0, buriedBy: 0, show: createEarthShow(),
    pool: null, burn: null, fire: createFireShow(), wind: PV_WIND,
    angle: 60, power: 50, phase: 'aim', t: 0.6,
    shells: [], booms: [], volleys: 0, foeHp: PV_FOE_HP,
    fx,
    result: '', resultT: 0, volleyDmg: 0, volleyHits: 0, trace: null, seen: previewSeen(),
    cv,
  };
}

function weaponOf(env: PreviewEnv, key: string): Readonly<Weapon> {
  const w = env.weapon(key);
  if (!w) throw new Error(`preview: unknown weapon ${key}`);
  return w;
}

/** The air on the range: its wind over its ground, at a room's scale (the range is a room's field, cut short),
 *  between its own walls at its own edges. */
export function previewAir(pv: Pick<PreviewState, 'terr' | 'wind' | 'walls'>, w: Readonly<Weapon>): Air {
  return airOf(ROOM_W, pv.wind, w, pv.walls || 'none', PV_W);
}
/** Where a shot at (angle, power) comes down, in columns. */
export function previewShot(pv: PreviewState, env: PreviewEnv, angle: number, power: number): number {
  const w = weaponOf(env, pv.wkey);
  const rad = angle * Math.PI / 180;
  const st = {
    x: pv.sx, y: (pv.terr[pv.sx] ?? 0) - 12,
    vx: Math.cos(rad) * launchSpeed(w, power),
    vy: -Math.sin(rad) * launchSpeed(w, power),
  };
  const air = previewAir(pv, w);
  for (let i = 0; i < 720; i++) {
    // A Concrete wall: it bursts there.
    if (stepBallistic(st, 1 / 60, air) === WALL_BURST) return st.x;
    // An arc over the top of the frame flies out of sight: no landing the demo may use.
    if (st.y < 0) return NaN;
    if (st.x < 0 || st.x >= PV_W || st.y >= PV_H) return st.x;
    if (i >= 6 && st.y >= (pv.terr[clamp(Math.round(st.x), 0, PV_W - 1)] ?? 0)) {
      // A roller rolls on, and stops at the dummy.
      return w.effect === 'roller' ? rollOut(pv.terr, st.x, st.vx, st.vy, w, x => Math.abs(x - pv.tx) < 10).x : st.x;
    }
  }
  return st.x;
}

/* Aim the demo with the same integrator the war uses, at the dummy or where
 * the gun's scenario says (game.yaml preview: `aim` px past the dummy, at
 * its `angle`). A coarse sweep plus a fine pass lands every demo there, on an
 * arc that stays inside the frame: demos never miss. The fine passes read the
 * best candidate live, so their bounds follow it as it improves mid-sweep. */
export function solvePreview(pv: PreviewState, env: PreviewEnv): void {
  const w = weaponOf(env, pv.wkey);
  const best = { have: false, err: 0, a: 0, p: 0 };
  const sc = w.preview || {};
  const goal = pv.tx + (sc.aim || 0);
  const consider = (a: number, p: number): void => {
    const ca = sc.angle || clamp(a, 5, 85), cp = clamp(p, 10, 100);
    const err = Math.abs(previewShot(pv, env, ca, cp) - goal);
    if (!Number.isFinite(err)) return;
    if (!best.have || err < best.err) { best.have = true; best.err = err; best.a = ca; best.p = cp; }
  };
  for (let p = 20; p <= 100; p += 2) consider(60, p);
  for (let a = 50; a <= 70; a += 2) consider(a, best.p);
  for (let a = best.a - 3; a <= best.a + 3; a += 0.5) consider(a, best.p);
  for (let p = best.p - 2; p <= best.p + 2; p += 0.25) consider(best.a, p);
  pv.angle = best.a;
  pv.power = best.p;
}

function previewFire(pv: PreviewState, env: PreviewEnv): void {
  const w = weaponOf(env, pv.wkey);
  pv.volleyDmg = 0;
  pv.volleyHits = 0;
  const mark = w.gfx && w.gfx.mark;
  pv.trace = mark === 'line' || mark === 'smoke' ? { kind: mark, pts: [], landed: false, age: 0 } : null;
  pv.dropped = 0;
  pv.buriedBy = 0;
  pv.seen = previewSeen();
  if (w.effect === 'beam') { previewBeam(pv, env, w); return; }
  if (w.effect === 'plasma') { previewRing(pv, env, w); return; }
  if (w.effect === 'riot') { previewRiot(pv, env, w); return; }
  const rad = pv.angle * Math.PI / 180;
  const shots = w.pellets || 1;
  const y0 = (pv.terr[pv.sx] ?? 0) - 12;
  for (let i = 0; i < shots; i++) {
    const off = shots === 1 ? 0 : (i - (shots - 1) / 2) * (w.spread || 0);
    const a = rad + off;
    const spd = launchSpeed(w, pv.power);
    pv.shells.push({ x: pv.sx, y: y0, vx: Math.cos(a) * spd, vy: -Math.sin(a) * spd, wkey: pv.wkey, age: 0, pierced: false, split: false });
  }
  env.muzzle(pv.fx, pv.wkey, pv.sx, y0, Math.atan2(-Math.sin(rad), Math.cos(rad)));
}
/* A beam on the range, as the war fires one: aimed from the barrel's pivot
   at the dummy's body, inside the gun's own limits (aimLimits), at full power,
   run with the war's beamLine against a one-unit world (the dummy is a ground
   unit with the war's hit box) and carved with the war's beamCarve. */
function previewBeam(pv: PreviewState, env: PreviewEnv, w: Readonly<Weapon>): void {
  const gunner: Tank = { id: 'range', isPlayer: true, x: pv.sx, y: pv.terr[pv.sx] ?? 0, angle: 0, power: 100, hp: 1, fuel: 0, dirS: 1 };
  const dummy: Tank = { id: 'dummy', isPlayer: true, x: pv.tx, y: pv.terr[pv.tx] ?? 0, angle: 0, power: 0, hp: PV_FOE_HP, fuel: 0, dirS: -1 };
  const box = unitHitBox(dummy), lim = aimLimits(w);
  const deg = Math.round(Math.atan2(-(box.cy - (gunner.y - 14)), box.cx - gunner.x) * 180 / Math.PI);
  pv.angle = clamp(deg, lim.min, lim.max);
  pv.power = 100;
  pv.seen.dip = Math.max(0, -pv.angle);
  const line = beamLine({ tanks: [gunner, dummy], terrain: pv.terr }, gunner, w, pv.angle, 100);
  const ang = Math.atan2(line.y1 - line.y0, line.x1 - line.x0);
  if (line.y1 < 0 || line.x1 < 0 || line.x1 >= PV_W) pv.seen.escaped = true;
  env.muzzle(pv.fx, pv.wkey, line.x0, line.y0, ang);
  env.special(pv.fx, pv.wkey, 'beam', line.x0, line.y0, ang, Math.hypot(line.x1 - line.x0, line.y1 - line.y0));
  beamCarve(pv.terr, line.x0, line.y0, line.x1, line.y1, w.radius, PV_H - 4);
  env.impact(pv.fx, pv.wkey, line.x1, line.y1, w.radius);
  if (line.struck.includes(dummy)) {
    env.special(pv.fx, pv.wkey, 'pierce', box.cx, box.cy, ang);
    pv.foeHp = Math.max(0, pv.foeHp - w.dmg);
    pv.volleyDmg = w.dmg;
    pv.volleyHits = 1;
  }
}
/* A plasma ring on the range: around the gunner at full power, burning the
   dummy (which stands inside it) with the war's falloff; no crater. */
function previewRing(pv: PreviewState, env: PreviewEnv, w: Readonly<Weapon>): void {
  const y0 = (pv.terr[pv.sx] ?? 0) - 12, fy = (pv.terr[pv.tx] ?? 0) - 12;
  pv.power = 100;
  const r = Math.max(20, w.radius);
  env.muzzle(pv.fx, pv.wkey, pv.sx, y0, -Math.PI / 2);
  env.impact(pv.fx, pv.wkey, pv.sx, y0, r);
  const d = Math.hypot(pv.tx - pv.sx, fy - y0);
  if (d <= r + 14) {
    const dmg = blastDamage(w.dmg, d, r);
    pv.foeHp = Math.max(0, pv.foeHp - dmg);
    pv.volleyDmg = dmg;
    pv.volleyHits = 1;
  }
}
/* A riot charge on the range, as the war fires one (earth.ts riotCarve): the
   shooter, buried under a mound, scoops itself out toward the dummy. */
function previewRiot(pv: PreviewState, env: PreviewEnv, w: Readonly<Weapon>): void {
  pv.angle = 20;
  pv.power = 100;
  const a = Math.atan2(-Math.sin(pv.angle * Math.PI / 180), Math.cos(pv.angle * Math.PI / 180)), hy = pv.sy - 10;
  env.muzzle(pv.fx, pv.wkey, pv.sx, hy, a);
  const before = pv.terr.slice();
  riotCarve(pv.terr, pv.sx, hy, a, w.radius, w.fan || 1, pv.sy);
  pv.seen.cleared = pv.terr.reduce((sum, y, x) => sum + Math.max(0, y - before[x]!), 0);
  env.impact(pv.fx, pv.wkey, pv.sx, hy, w.radius);
  env.special(pv.fx, pv.wkey, 'dig', pv.sx, hy, a, w.radius);
}
/* Where an earth gun bursts on the range (dirt, a pour, a slump), as the war's
   burst does (earth.ts); a digger starts to burrow instead. */
function previewEarth(pv: PreviewState, env: PreviewEnv, s: PreviewShell, w: Readonly<Weapon>, onDummy: boolean): void {
  if (w.effect === 'dig') {
    [s.dux, s.duy] = digHeading(s.vx, s.vy);
    s.dn = Math.ceil((w.digLen || 0) / DIG_STEP);
    s.dl = 0;
    s.dk = 0;
    s.digging = !onDummy;
    if (!w.warheads) env.impact(pv.fx, pv.wkey, s.x, s.y, w.digR || 8);
    if (onDummy) finishPreviewDig(pv, env, s, w);
    return;
  }
  s.dead = true;
  const before = pv.terr.slice(), x = Math.round(clamp(s.x, 0, PV_W - 1));
  if (w.effect === 'dirt') {
    if (w.dmg > 0) previewHurt(pv, s.x, s.y, w.dmg, w.radius);
    addDirt(pv.terr, s.x, s.y, w.radius);
    env.impact(pv.fx, pv.wkey, s.x, s.y, w.radius);
    pv.show.begin(before, Math.max(0, Math.floor(s.x - w.radius)), Math.min(PV_W - 1, Math.ceil(s.x + w.radius)), 'dirt', x);
  } else if (w.effect === 'pour') {
    const p = pourLevel(pv.terr, x, w.volume || 0, w.poolMin || 0);
    fillPour(pv.terr, p);
    pv.seen.flowed = flowedTo(pv, x, p);
    env.impact(pv.fx, pv.wkey, s.x, s.y, Math.max(12, (p.x1 - p.x0) / 2));
    if (p.x1 >= p.x0) env.special(pv.fx, pv.wkey, 'pour', p.x0, p.level, 0, p.x1 - p.x0);
    pv.show.begin(before, p.x0, p.x1, 'pour', x);
  } else if (w.effect === 'slump') {
    slumpGround(pv.terr, s.x, w.radius, w.slope || 1, w.passes || 1);
    env.impact(pv.fx, pv.wkey, s.x, s.y, w.radius);
    pv.show.begin(before, Math.max(0, Math.floor(s.x - w.radius)), Math.min(PV_W - 1, Math.ceil(s.x + w.radius)), 'slump', x);
  }
}
/* A napalm shell bursts on the range: its pool, poured as the war pours it
   (fire.ts firePool) on the range's ground, which it never changes, burns by
   the war's ticks (previewBurn). One that spilled away lights nothing. */
function previewNapalm(pv: PreviewState, env: PreviewEnv, s: PreviewShell, w: Readonly<Weapon>): void {
  s.dead = true;
  const x = Math.round(clamp(s.x, 0, PV_W - 1));
  const p = firePool(pv.terr, x, w.volume || 0, w.flame || 0, w.poolMin || 0);
  pv.pool = p;
  pv.seen.flowed = flowedTo(pv, x, p);
  if (p.x0 > p.x1) {
    env.impact(pv.fx, pv.wkey, s.x, pv.terr[x]!, 12);
    return;
  }
  const every = tickSteps(w.tick || 0.5), ticks = burnTicks(w.burn || 0, w.tick || 0.5);
  pv.burn = { step: 0, acc: 0, done: 0, every, ticks };
  env.impact(pv.fx, pv.wkey, (p.x0 + p.x1) / 2, p.level, Math.max(12, (p.x1 - p.x0) / 2));
  env.special(pv.fx, pv.wkey, 'burn', p.x0, p.level, 0, p.x1 - p.x0);
  pv.fire.light({ wkey: pv.wkey, ...p }, ticks * every / 60);
}
/* How far a liquid that landed at column x ran to reach the dummy: 0 when its pool lies clear of it. */
function flowedTo(pv: PreviewState, x: number, p: { x0: number; x1: number }): number {
  return p.x0 <= pv.tx && pv.tx <= p.x1 ? Math.abs(pv.tx - x) : 0;
}
/* The range's pool burns on, a 1/60 s step at a time as the war's does: each
   tick burns the dummy when its body (a ground unit's hit box) reaches into
   the flames; it goes out with its last tick. */
function previewBurn(pv: PreviewState, dt: number, w: Readonly<Weapon>): void {
  const b = pv.burn, p = pv.pool;
  if (!b || !p) return;
  b.acc += dt * 60;
  while (b.acc >= 1 - 1e-9 && b.done < b.ticks) {
    b.acc -= 1;
    b.step++;
    if (b.step % b.every !== 0) continue;
    b.done++;
    if (inFlames(p, { cx: pv.tx, cy: pv.ty - 10, rx: 20, ry: 13 })) {
      pv.foeHp = Math.max(0, pv.foeHp - w.dmg);
      pv.volleyDmg += w.dmg;
      pv.volleyHits += 1;
    }
  }
  if (b.done >= b.ticks) pv.burn = null;
}
/* One step of a digger's burrow on the range: its trench, and each warhead as it falls due. */
function stepPreviewDig(pv: PreviewState, env: PreviewEnv, s: PreviewShell, w: Readonly<Weapon>): void {
  const i = (s.dl || 0) + 1, n = s.dn || 0, W = w.warheads || 0;
  const nx = s.x + s.dux! * DIG_STEP, ny = s.y + s.duy! * DIG_STEP;
  if (i > n || nx < 0 || nx > PV_W - 1 || ny >= PV_H - 4) { finishPreviewDig(pv, env, s, w); return; }
  s.x = nx;
  s.y = ny;
  // The dummy's body at the next point stops the burrow there, uncut, as the war's stepDigger does.
  if (pv.foeHp > 0 && inHitBox({ isPlayer: true, x: pv.tx, y: pv.ty }, nx, ny)) { finishPreviewDig(pv, env, s, w); return; }
  s.dl = i;
  pv.seen.dug += DIG_STEP;
  carveCrater(pv.terr, nx, ny, w.digR || 0, PV_H - 4);
  if (i % 3 === 0) env.special(pv.fx, pv.wkey, 'dig', nx, ny, Math.atan2(s.duy!, s.dux!));
  while ((s.dk || 0) < W && i >= Math.floor((((s.dk || 0) + 1) * n + W - 1) / W)) {
    s.dk = (s.dk || 0) + 1;
    previewBoom(pv, env, nx, ny, { dmg: w.subDmg || w.dmg, radius: w.subRadius || w.radius });
  }
  if (i >= n) finishPreviewDig(pv, env, s, w);
}
function finishPreviewDig(pv: PreviewState, env: PreviewEnv, s: PreviewShell, w: Readonly<Weapon>): void {
  while ((s.dk || 0) < (w.warheads || 0)) {
    s.dk = (s.dk || 0) + 1;
    previewBoom(pv, env, s.x, s.y, { dmg: w.subDmg || w.dmg, radius: w.subRadius || w.radius });
  }
  s.digging = false;
  s.dead = true;
}
/* A blast's damage to the dummy, with the war's falloff and no crater. */
function previewHurt(pv: PreviewState, x: number, y: number, dmg0: number, r: number): void {
  const d = Math.hypot(pv.tx - x, pv.ty - 12 - y);
  if (d > r + 14) return;
  const dmg = blastDamage(dmg0, d, r) * (d < 14 ? 2 : 1);
  pv.foeHp = Math.max(0, pv.foeHp - dmg);
  pv.volleyDmg += dmg;
  pv.volleyHits += 1;
}
/* The volley is down: the shooter and the dummy settle as the war's units
   do. Ground lowered under the dummy drops it, for the war's fall damage;
   ground risen over it leaves it buried where it stands. */
function settlePreview(pv: PreviewState): void {
  pv.sy = Math.max(pv.sy, pv.terr[pv.sx]!);
  const ground = pv.terr[pv.tx]!;
  if (ground > pv.ty + 0.5) {
    pv.dropped = ground - pv.ty;
    const dmg = fallDamage(pv.dropped, FALL_RULES);
    pv.foeHp = Math.max(0, pv.foeHp - dmg);
    pv.volleyDmg += dmg;
    pv.ty = ground;
  }
  pv.buriedBy = pv.ty - ground > BURY_EPS ? pv.ty - ground : 0;
}
/* A tracer's path grows as it flies, a point every MARK_EVERY px. */
function traceTo(pv: PreviewState, x: number, y: number, last: boolean): void {
  const tr = pv.trace;
  if (!tr || tr.landed) return;
  const n = tr.pts.length;
  if (last || n < 2 || Math.hypot(x - tr.pts[n - 2]!, y - tr.pts[n - 1]!) >= MARK_EVERY) tr.pts.push(x, y);
  if (last) {
    tr.landed = true;
    let top = Infinity;
    for (let i = 1; i < tr.pts.length; i += 2) top = Math.min(top, tr.pts[i]!);
    pv.seen.rise = Math.max(0, Math.min(tr.pts[1]!, y) - top);
  }
}

function previewBoom(pv: PreviewState, env: PreviewEnv, x: number, y: number, ov: { dmg: number; radius: number } | null): void {
  const w = weaponOf(env, pv.wkey);
  const dmg0 = (ov && ov.dmg) || w.dmg;
  const r = (ov && ov.radius) || w.radius;
  pv.booms.push({ x, y, r, wkey: pv.wkey, t: 0, life: 0.5 });
  carveCrater(pv.terr, x, y, r, PV_H - 4);
  env.impact(pv.fx, pv.wkey, x, y, r);
  // Same falloff the war uses, scored against the demo target where it stands.
  const fy = pv.ty - 12;
  const d = Math.hypot(pv.tx - x, fy - y);
  if (d <= r + 14) {
    let dmg = blastDamage(dmg0, d, r);
    const direct = d < 14;
    if (direct) dmg *= 2;
    pv.foeHp = Math.max(0, pv.foeHp - dmg);
    pv.volleyDmg += dmg;
    pv.volleyHits += 1;
  }
}

/** The effects whose burst moves the earth instead of blasting a crater, and every earth effect (a riot charge's too). */
const EARTH_BURSTS = ['dirt', 'pour', 'slump', 'dig'];
const EARTH_EFFECTS = [...EARTH_BURSTS, 'riot'];
/* The result line for an earth gun: what it did to the dummy (or the shooter). */
function earthResult(pv: PreviewState, w: Readonly<Weapon>): string {
  if (w.effect === 'riot') return pv.terr[pv.sx]! >= pv.sy - BURY_EPS ? 'Dug out, and a lane cleared' : 'Still buried';
  const hurt = pv.volleyDmg > 0 ? `: ${pv.volleyDmg} damage` : '';
  if (pv.dropped > 0) return `Dropped the dummy ${Math.round(pv.dropped)} px${hurt}`;
  if (pv.buriedBy > 0) return `Buried the dummy ${Math.round(pv.buriedBy)} px deep${hurt}`;
  return pv.volleyDmg > 0 ? `Splash${hurt}` : 'The dummy stands clear.';
}
const shellBoom = (s: PreviewShell): { dmg: number; radius: number } | null =>
  s.dw ? { dmg: s.dw, radius: s.dr as number } : null;

/* The demo has no units, so the war's sub-munition makers get a stand-in gunner. */
const RANGE_GUNNER: Tank = { id: 'range', isPlayer: true, x: 0, y: 0, angle: 60, power: 50, hp: 1, fuel: 0 };
/* What a burst throws on, from the war's own hopShell and scatterShells: a hop
 * gun's next warhead, or a scatter gun's bomblets (its own burst only). */
function previewAfterBurst(pv: PreviewState, env: PreviewEnv, s: PreviewShell, w: Readonly<Weapon>, onDummy: boolean): void {
  const src: Shell = { x: s.x, y: s.y, vx: s.vx, vy: s.vy, wkey: s.wkey, owner: RANGE_GUNNER, life: 12, age: s.age, pierced: false, split: s.split, order: [0], hop: s.hop };
  const thrown = w.effect === 'hop' ? [hopShell(src, w, s.x, s.y, 1)].filter(n => n !== null)
    : w.effect === 'scatter' && !s.split ? scatterShells(src, w, s.x, s.y, 1) : [];
  if (w.effect === 'hop') pv.seen.hops += thrown.length;
  else pv.seen.split += thrown.length;
  for (const n of thrown) {
    pv.shells.push({ x: n.x, y: n.y, vx: n.vx, vy: n.vy, wkey: pv.wkey, age: 0, pierced: false, split: n.split, dw: n.dw, dr: n.dr, hop: n.hop, spared: onDummy });
  }
  const first = thrown[0];
  if (w.effect === 'hop' && first) env.special(pv.fx, pv.wkey, 'hop', first.x, first.y, Math.atan2(first.vy, first.vx));
  if (w.effect === 'scatter' && first) env.special(pv.fx, pv.wkey, 'scatter', s.x, s.y, -Math.PI / 2);
}

/* A roller on the demo's ground: it rolls on until it reaches the dummy, the
 * field's edge, rest, or its roll time, and bursts there. */
function stepPreviewRoller(pv: PreviewState, env: PreviewEnv, s: PreviewShell, w: Readonly<Weapon>, dt: number): void {
  const r = { x: s.x, u: s.ru || 0 };
  const spent = (s.rt || 0) >= Math.round((w.rollTime || 5) * 60) || r.x <= 0 || r.x >= PV_W - 1;
  const moving = !spent && rollStep(pv.terr, r, w.friction || 0.3, dt);
  if (moving) {
    s.rt = (s.rt || 0) + 1;
    pv.seen.rolled += Math.abs(r.x - s.x);
    s.x = r.x;
    s.ru = r.u;
    s.y = groundAt(pv.terr, r.x) - ROLL_LIFT;
    const m = groundSlope(pv.terr, r.x);
    s.vx = r.u / Math.sqrt(1 + m * m);
    s.vy = s.vx * m;
    if (Math.abs(s.x - pv.tx) >= 10) {
      env.trail(pv.fx, s, dt);
      return;
    }
  }
  s.dead = true;
  const bx = clamp(s.x, 0, PV_W - 1);
  previewBoom(pv, env, bx, groundAt(pv.terr, bx), shellBoom(s));
}

/** Advance the demo by `dt` seconds. */
export function stepPreview(pv: PreviewState, dt: number, env: PreviewEnv): void {
  if (pv.fx) { pv.fx.wind = pv.wind; pv.fx.step(dt); }
  pv.show.step(dt);
  pv.fire.step(dt);
  for (const bm of pv.booms) bm.t += dt;
  pv.booms = pv.booms.filter(bm => bm.t < bm.life);
  if (pv.resultT > 0) pv.resultT -= dt;
  if (pv.trace) pv.trace.age += dt;
  if (pv.phase === 'aim') {
    pv.t -= dt;
    if (pv.t <= 0) {
      // A gun with no flight aims itself as it fires.
      if (flies(weaponOf(env, pv.wkey))) solvePreview(pv, env);
      previewFire(pv, env);
      pv.phase = 'fly';
    }
  } else if (pv.phase === 'fly') {
    const w = weaponOf(env, pv.wkey);
    const air = previewAir(pv, w);
    const fy = pv.ty - 12;
    // Bomblets join pv.shells mid-loop and get their first step this frame.
    for (const s of pv.shells) {
      if (s.rolling) {
        stepPreviewRoller(pv, env, s, w, dt);
        continue;
      }
      if (s.digging) {
        stepPreviewDig(pv, env, s, w);
        continue;
      }
      s.age = (s.age || 0) + dt;
      if (w.effect === 'seeker') {
        // As the war steers one (sim.ts steerShell): across its flight only.
        const dx = pv.tx - s.x, dy = fy - s.y;
        const d = Math.max(1, Math.hypot(dx, dy));
        const push = (w.steer || 70) * dt;
        let px = (dx / d) * push, py = (dy / d) * push;
        const sp = Math.hypot(s.vx, s.vy);
        if (sp > 0) {
          const along = (px * s.vx + py * s.vy) / sp;
          px -= along * s.vx / sp;
          py -= along * s.vy / sp;
        }
        s.vx += px;
        s.vy += py;
      }
      const walled = stepBallistic(s, dt, air) === WALL_BURST;
      if (s.dead) continue;
      if (s.x < 0 || s.x >= PV_W || s.y < 0 || s.y >= PV_H) pv.seen.escaped = true;
      env.trail(pv.fx, s, dt);
      traceTo(pv, s.x, s.y, false);
      if (w.effect === 'cluster' && !s.split && (w.apex ? s.age >= 0.1 && s.vy >= 0 : s.age >= (w.fuse || 0.9))) {
        s.split = true;
        env.special(pv.fx, pv.wkey, 'split', s.x, s.y, Math.atan2(s.vy, s.vx));
        const n = Math.max(2, w.split || 4), fan = w.fan || 0.22;
        pv.seen.split += n;
        const sp = Math.hypot(s.vx, s.vy) * 0.85, base = Math.atan2(s.vy, s.vx);
        for (let i = 0; i < n; i++) {
          const a = base + (i - (n - 1) / 2) * fan;
          pv.shells.push({ x: s.x, y: s.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, wkey: pv.wkey, age: 0, pierced: false, split: true, dw: w.subDmg || w.dmg, dr: w.subRadius || w.radius });
        }
        s.dead = true;
        continue;
      }
      const touch = !s.pierced && !s.spared && Math.hypot(s.x - pv.tx, s.y - fy) < 10;
      const near = w.effect === 'proximity' && Math.hypot(s.x - pv.tx, s.y - fy) < (w.prox || 34);
      // A tracer bursts on nothing: where it comes down (or strikes), it leaves its mark.
      const down = touch || walled || ((s.split || s.age >= 0.1) && s.y >= (pv.terr[clamp(Math.round(s.x), 0, PV_W - 1)] ?? 0));
      if (w.effect === 'tracer' && (down || s.x < 0 || s.x >= PV_W || s.y >= PV_H)) {
        s.dead = true;
        traceTo(pv, s.x, s.y, true);
        if (down) env.impact(pv.fx, pv.wkey, s.x, s.y, PV_MARK_R);
        continue;
      }
      if ((touch || near) && w.effect === 'proximity') pv.seen.air = Math.max(pv.seen.air, (pv.terr[clamp(Math.round(s.x), 0, PV_W - 1)] ?? 0) - s.y);
      if ((touch || near) && w.effect === 'seeker' && !pv.seen.bend) pv.seen.bend = Math.abs(s.x - previewShot(pv, env, pv.angle, pv.power)) || 0;
      if (touch || near) {
        if (EARTH_BURSTS.includes(w.effect)) { previewEarth(pv, env, s, w, touch); continue; }
        if (w.effect === 'napalm') { previewNapalm(pv, env, s, w); continue; }
        s.dead = true;
        previewBoom(pv, env, s.x, s.y, shellBoom(s));
        previewAfterBurst(pv, env, s, w, touch);
        continue;
      }
      // A bomblet may burst on the ground at once, as in the war.
      const landed = walled || ((s.split || s.age >= 0.1) && s.y >= (pv.terr[clamp(Math.round(s.x), 0, PV_W - 1)] ?? 0));
      if (landed && !walled && w.effect === 'roller' && s.x >= 0 && s.x < PV_W) {
        s.rolling = true;
        s.rt = 0;
        s.ru = rollStart(pv.terr, s.x, s.vx, s.vy);
        s.y = groundAt(pv.terr, s.x) - ROLL_LIFT;
        continue;
      }
      const gone = s.x < 0 || s.x >= PV_W || s.y >= PV_H;
      if (landed && !gone && EARTH_BURSTS.includes(w.effect)) { previewEarth(pv, env, s, w, false); continue; }
      if (landed && !gone && w.effect === 'napalm') { previewNapalm(pv, env, s, w); continue; }
      s.dead = gone || landed;
      if (landed && !gone && w.effect === 'seeker' && !pv.seen.bend) pv.seen.bend = Math.abs(s.x - previewShot(pv, env, pv.angle, pv.power)) || 0;
      if (s.dead) previewBoom(pv, env, s.x, s.y, shellBoom(s));
      if (landed && !gone) previewAfterBurst(pv, env, s, w, false);
    }
    pv.shells = pv.shells.filter(s => !s.dead);
    previewBurn(pv, dt, w);
  }
  // The volley is down once its last shell is, and its pool has burned out.
  if (pv.phase === 'fly' && !pv.shells.length && !pv.burn) {
    const w = weaponOf(env, pv.wkey);
    {
      settlePreview(pv);
      pv.phase = 'show';
      pv.t = 1.6;
      const end = pv.trace && pv.trace.landed ? pv.trace.pts.slice(-2) : null;
      const off = end ? Math.round(Math.abs(end[0]! - pv.tx)) : 0;
      pv.result = w.effect === 'napalm'
        ? (pv.volleyDmg > 0 ? `Burned the dummy: ${pv.volleyDmg} damage` : pv.pool && pv.pool.x0 <= pv.pool.x1 ? 'The pool burns clear of the dummy.' : 'It runs off and burns out.')
        : w.effect === 'tracer'
        ? (end ? (off < 10 ? 'Marked: right on the dummy' : `Marked: ${off} px from the dummy`) : 'Marked: off the range')
        : EARTH_EFFECTS.includes(w.effect) || w.dmg === 0 || (pv.dropped > 0 && !pv.volleyHits)
          ? earthResult(pv, w)
        : w.effect === 'beam'
          ? (pv.volleyHits ? `Beam hit: ${pv.volleyDmg} damage, straight through` : 'The beam misses.')
          : w.effect === 'plasma'
            ? (pv.volleyHits ? `Plasma ring: ${pv.volleyDmg} damage, its gunner spared` : 'The ring falls short.')
            : pv.volleyHits > 1
        ? `${pv.volleyHits} hits · ${pv.volleyDmg} total damage`
        : pv.volleyHits === 1
          ? (pv.volleyDmg >= w.dmg ? `Direct hit! ${pv.volleyDmg} damage (×2 bonus)` : `Splash: ${pv.volleyDmg} damage`)
          : 'Clean miss. Blame the wind.';
      pv.resultT = 1.6;
      env.showResult(pv.result);
    }
  } else if (pv.phase === 'show') {
    pv.t -= dt;
    if (pv.t <= 0) {
      pv.volleys += 1;
      if (pv.foeHp <= 0 || pv.volleys % 4 === 3 || pv.buriedBy > 0 || pv.dropped > 0 || weaponOf(env, pv.wkey).effect === 'riot') {
        pv.terr = makeRange(weaponOf(env, pv.wkey), pv.sx, pv.tx);
        pv.show.clear();
        pv.sy = rangeFloor(weaponOf(env, pv.wkey), pv.sx, pv.tx)[pv.sx]!;
        pv.ty = pv.terr[pv.tx]!;
        pv.foeHp = PV_FOE_HP;
      }
      pv.phase = 'aim';
      pv.t = 0.5;
    }
  }
}
