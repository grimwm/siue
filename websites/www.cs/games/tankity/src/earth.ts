/* Operation Tankity: the earth, as the shells move it.
 *
 * The ground is a height map (terrain[x] is the surface's y at column x; y
 * grows downward), and every op here is a pure function of it: a crater, a
 * mound of dirt, a pool of liquid dirt, slopes slumping, a trench a digger
 * cuts, a riot charge's scoop. The war (sim.ts), the room replay and the
 * firing range all move the ground with these, and server/earth.php is the
 * same ops to the last bit, kept in step by the `earth` group of
 * protocol/sim-vectors.json. No imports from sim.ts: sim.ts imports this. */
import { dcos, dsin } from './detmath.ts';

/** The sky stays open above this row: dirt never piles higher. */
export const TOP_Y = 40;
/** The field's floor (sim.ts H - 4): no crater or trench cuts below it. */
export const FLOOR = 456;
/** A ground unit whose column's surface is more than this above it is buried (sim.ts buried). */
export const BURY_EPS = 2;
/** A digger burrows 240 px/s: this many px per 1/60 s step. */
export const DIG_STEP = 4;
/** A pool's level is found in exactly this many halvings. */
export const POUR_ITERS = 48;

/* Cuts a crater: the ground under the blast drops to a 3:4 ellipse around
   (x, y), never below floor. The war, the room replay and the firing range
   all carve with this. server/earth.php room_carve_crater is the same. */
export function carveCrater(terrain: number[], x: number, y: number, r: number, floor: number): void {
  const x0 = Math.max(0, Math.floor(x - r)), x1 = Math.min(terrain.length - 1, Math.ceil(x + r));
  for (let ix = x0; ix <= x1; ix++) {
    const dx = ix - x;
    const cut = Math.sqrt(Math.max(0, r * r - dx * dx)) * 0.75;
    terrain[ix] = Math.min(floor, Math.max(terrain[ix]!, y + cut));
  }
}
/* A disc of dirt of radius r around (x, y) lands on the ground: each
   column's surface rises to the top of the disc over it (never above TOP_Y);
   a disc under the surface changes nothing. server/earth.php room_add_dirt
   is the same. */
export function addDirt(terrain: number[], x: number, y: number, r: number): void {
  const x0 = Math.max(0, Math.floor(x - r)), x1 = Math.min(terrain.length - 1, Math.ceil(x + r));
  for (let ix = x0; ix <= x1; ix++) {
    const dx = ix - x;
    const chord = Math.sqrt(Math.max(0, r * r - dx * dx));
    terrain[ix] = Math.max(TOP_Y, Math.min(terrain[ix]!, y - chord));
  }
}
/** A pool of liquid: its level (a terrain y) over columns x0..x1 (x0 > x1: no pool). */
export interface Pool { level: number; x0: number; x1: number }
/* The pool liquid at `level` would make around column xi: the run of columns
   out from xi whose ground lies below the level (more than half a pixel above
   it counts as dry), its volume and whether it spills off the field's edge
   (never against a wall that dams it). server/earth.php room_pour_basin is
   the same. */
function basin(terrain: readonly number[], xi: number, level: number, dam: boolean): { x0: number; x1: number; vol: number; edge: boolean } {
  const n = terrain.length;
  if (!(terrain[xi]! > level - 0.5)) return { x0: xi, x1: xi - 1, vol: 0, edge: false };
  let a = xi, b = xi;
  while (a > 0 && terrain[a - 1]! > level - 0.5) a--;
  while (b < n - 1 && terrain[b + 1]! > level - 0.5) b++;
  let vol = 0;
  for (let ix = a; ix <= b; ix++) vol += terrain[ix]! - level;
  return { x0: a, x1: b, vol, edge: !dam && (a === 0 || b === n - 1) };
}
/* Where `volume` px^2 of liquid poured at column x comes to rest. It runs
   downhill first, column by column to the lower neighbour (the right one on a
   tie), to the bottom of the dip it landed in; there its level is found in
   POUR_ITERS halvings between the highest ground and the floor. A pool that
   would reach either edge of the field spills off it, so the level stays
   below what would reach one; what will not fit is lost (all of it, poured on
   a slope down to an edge). With `dam` (a solid wall, walls.ts wallsDam) the
   edges hold it instead: it pools against them. With poolMin above 0 a
   liquid spreads only until it is poolMin deep: when that fill would leave it
   shallower (or spill it all), it lies instead as a puddle (puddle) poolMin
   deep at the bottom it ran to. server/earth.php room_pour_level is the same. */
export function pourLevel(terrain: readonly number[], x: number, volume: number, poolMin = 0, dam = false): Pool {
  const n = terrain.length;
  const xi = pourBottom(terrain, x);
  if (!(volume > 0)) return { level: terrain[xi]!, x0: xi, x1: xi - 1 };
  let lo = Infinity, hi = FLOOR;
  for (const y of terrain) if (y < lo) lo = y;
  for (let i = 0; i < POUR_ITERS; i++) {
    const mid = (lo + hi) / 2;
    const b = basin(terrain, xi, mid, dam);
    if (b.edge || b.vol > volume) lo = mid;
    else hi = mid;
  }
  const b = basin(terrain, xi, hi, dam);
  const pool = b.edge ? { level: hi, x0: xi, x1: xi - 1 } : { level: hi, x0: b.x0, x1: b.x1 };
  if (!(poolMin > 0) || (pool.x0 <= pool.x1 && terrain[xi]! - pool.level >= poolMin)) return pool;
  return puddle(terrain, xi, volume, poolMin, dam);
}
/* A puddle: liquid that spreads only until it is d deep, its level d over the
   ground at column xi, widening a column at a time, left then right in turn
   (a side whose next column stands dry gives way to the other), until it
   holds `volume`. Once it reaches either edge of the field the rest spills
   off; with `dam` an edge is a side that stands dry, and it widens the other
   way. On flat ground it is volume / d columns wide, centred on xi.
   server/earth.php room_pour_puddle is the same. */
function puddle(terrain: readonly number[], xi: number, volume: number, d: number, dam: boolean): Pool {
  const n = terrain.length, level = terrain[xi]! - d;
  let a = xi, b = xi, vol = d, left = true;
  while (vol < volume && (dam || (a > 0 && b < n - 1))) {
    const l = a > 0 && terrain[a - 1]! > level - 0.5, r = b < n - 1 && terrain[b + 1]! > level - 0.5;
    if (!l && !r) break;
    if (left ? l : !r) {
      a--;
      vol += Math.max(0, terrain[a]! - level);
    } else {
      b++;
      vol += Math.max(0, terrain[b]! - level);
    }
    left = !left;
  }
  return { level, x0: a, x1: b };
}
/* The column liquid poured at x runs down to: column by column to the lower
   neighbour (the right one on a tie), to the bottom of its dip. */
export function pourBottom(terrain: readonly number[], x: number): number {
  const n = terrain.length;
  let xi = Math.round(Math.max(0, Math.min(n - 1, x)));
  for (;;) {
    const l = xi > 0 ? terrain[xi - 1]! : -Infinity, r = xi < n - 1 ? terrain[xi + 1]! : -Infinity;
    if (r > terrain[xi]! && r >= l) xi++;
    else if (l > terrain[xi]!) xi--;
    else return xi;
  }
}
/* Liquid dirt sets: every column of the pool rises to its level (none is
   lowered). server/earth.php room_fill_pour is the same. */
export function fillPour(terrain: number[], p: Pool): void {
  for (let ix = p.x0; ix <= p.x1; ix++) terrain[ix] = Math.min(terrain[ix]!, p.level);
}
/* The ground within r of column x slumps: `passes` passes, each from left to
   right, moving earth from the higher of two neighbouring columns to the
   lower wherever they differ by more than `slope` px, half the excess at a
   time, so every move keeps the volume. server/earth.php room_slump_ground
   is the same. */
export function slumpGround(terrain: number[], x: number, r: number, slope: number, passes: number): void {
  const x0 = Math.max(0, Math.floor(x - r)), x1 = Math.min(terrain.length - 1, Math.ceil(x + r));
  for (let p = 0; p < passes; p++) {
    for (let ix = x0; ix < x1; ix++) {
      const d = terrain[ix + 1]! - terrain[ix]!;
      const ad = Math.abs(d);
      if (ad <= slope) continue;
      const m = (ad - slope) / 2;
      if (d > 0) {
        terrain[ix] = terrain[ix]! + m;
        terrain[ix + 1] = terrain[ix + 1]! - m;
      } else {
        terrain[ix + 1] = terrain[ix + 1]! + m;
        terrain[ix] = terrain[ix]! - m;
      }
    }
  }
}
/* A riot charge's scoop from a hull centred on (hx, hy) whose unit stands at
   `base`, its barrel heading a (radians, screen frame: x along cos, y along
   sin, y down): a crater of radius r / 2 over the hull, never cutting below
   `base` (it clears the hull, it does not drop it), then one every 4 px along
   the barrel out to r, their radius growing from r / 4 to r x fan.
   server/earth.php room_riot_carve is the same. */
export function riotCarve(terrain: number[], hx: number, hy: number, a: number, r: number, fan: number, base: number): void {
  carveCrater(terrain, hx, hy, r / 2, Math.min(FLOOR, base));
  const ux = dcos(a), uy = dsin(a);
  for (let k = 1; 4 * k <= r; k++) {
    const d = 4 * k;
    carveCrater(terrain, hx + ux * d, hy + uy * d, r / 4 + (r * fan - r / 4) * d / r, FLOOR);
  }
}
/* A digger's heading from its velocity at touchdown, a unit vector
   (straight down for a shell standing still). server/earth.php
   room_dig_heading is the same. */
export function digHeading(vx: number, vy: number): [number, number] {
  const len = Math.sqrt(vx * vx + vy * vy);
  return len > 0 ? [vx / len, vy / len] : [0, 1];
}
/* A digger's trench from (x, y): n steps of DIG_STEP px along (ux, uy), a
   crater of radius r at each. The room replay carves a dig event with this;
   the burrow itself (sim.ts) steps the same way. server/earth.php
   room_dig_carve is the same. */
export function digCarve(terrain: number[], x: number, y: number, ux: number, uy: number, n: number, r: number): void {
  for (let i = 1; i <= n; i++) {
    x += ux * DIG_STEP;
    y += uy * DIG_STEP;
    carveCrater(terrain, x, y, r, FLOOR);
  }
}
/** What an earth gun did to the ground, as the room wire carries it (src/protocol.ts):
 *  each is replayed with applyEarth, which moves the ground exactly as the sim did.
 *  dirt: a disc of dirt; pour: liquid dirt at column x; dig: a trench of n steps
 *  from (x, y) along (ux, uy); riot: a scoop from a hull at (x, y), barrel heading
 *  a; slump: the slopes within r of x. `w` is the gun; a pour's m is its poolMin,
 *  and d: 1 when a solid wall dams the field's edges (pourLevel's dam). */
export type EarthOp =
  | { t: 'dirt'; w: string; x: number; y: number; r: number }
  | { t: 'pour'; w: string; x: number; v: number; m: number; d?: 1 }
  | { t: 'dig'; w: string; x: number; y: number; ux: number; uy: number; n: number; r: number }
  | { t: 'riot'; w: string; x: number; y: number; a: number; r: number; fan: number; b: number }
  | { t: 'slump'; w: string; x: number; r: number; slope: number; passes: number };
/* Moves the ground as op did, and says which columns it touched (the pool, for
   a pour; x0 > x1 when nothing moved). The room replay mirrors the server's
   ground with it; server/earth.php is each op's twin. */
export function applyEarth(terrain: number[], op: EarthOp): { x0: number; x1: number } {
  const n = terrain.length;
  const span = (x: number, r: number) => ({ x0: Math.max(0, Math.floor(x - r)), x1: Math.min(n - 1, Math.ceil(x + r)) });
  switch (op.t) {
    case 'dirt':
      addDirt(terrain, op.x, op.y, op.r);
      return span(op.x, op.r);
    case 'pour': {
      const p = pourLevel(terrain, op.x, op.v, op.m, op.d === 1);
      fillPour(terrain, p);
      return { x0: p.x0, x1: p.x1 };
    }
    case 'dig': {
      digCarve(terrain, op.x, op.y, op.ux, op.uy, op.n, op.r);
      const ex = op.x + op.ux * DIG_STEP * op.n;
      return { x0: Math.max(0, Math.floor(Math.min(op.x, ex) - op.r)), x1: Math.min(n - 1, Math.ceil(Math.max(op.x, ex) + op.r)) };
    }
    case 'riot': {
      riotCarve(terrain, op.x, op.y, op.a, op.r, op.fan, op.b);
      return span(op.x, op.r + op.r * op.fan);
    }
    case 'slump':
      slumpGround(terrain, op.x, op.r, op.slope, op.passes);
      return span(op.x, op.r);
  }
}
