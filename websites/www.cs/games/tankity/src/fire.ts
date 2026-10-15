/* Operation Tankity: fire, as the napalm burns.
 *
 * A napalm shell pours burning liquid where it bursts: a pool found once, by
 * the earth's pour (earth.ts pourLevel) on the ground of that moment, which
 * burns where it lies for the gun's `burn` seconds and never changes the
 * ground. Every `tick` seconds each unit whose body reaches into its flames
 * takes the gun's damage. The war (sim.ts), the room replay and the firing
 * range all burn with these, and server/fire.php is the same to the last
 * bit, kept in step by the `fire` group of protocol/sim-vectors.json. No
 * imports from sim.ts: sim.ts imports this. */
import { pourLevel } from './earth.ts';
import type { Pool } from './earth.ts';

/** A burning pool: the liquid's level (a terrain y) over columns x0..x1
 *  (x0 > x1: none), its flames standing `flame` px over the level. */
export interface FirePool extends Pool { flame: number }
/* A napalm shell's pool: `volume` px^2 of burning liquid poured at column x
   comes to rest as liquid dirt would (earth.ts pourLevel: it runs to the
   bottom of the dip it landed in, and what would reach an edge spills off,
   on the ground of this moment, which it never changes, and spreading only
   until it is poolMin deep, so flat ground holds a puddle; with `dam` a solid
   wall holds it in at the edge); its flames stand `flame` px over its level.
   server/fire.php room_fire_pool is the same. */
export function firePool(terrain: readonly number[], x: number, volume: number, flame: number, poolMin = 0, dam = false): FirePool {
  const p = pourLevel(terrain, x, volume, poolMin, dam);
  return { level: p.level, x0: p.x0, x1: p.x1, flame };
}
/* Whether a unit's body (sim.ts unitHitBox) reaches into a pool's flames: a
   pooled column within its width (cx - rx .. cx + rx), and its bottom
   (cy + ry) at or below the flames' top (the level less flame).
   server/fire.php room_in_flames is the same. */
export function inFlames(pool: FirePool, b: { cx: number; cy: number; rx: number; ry: number }): boolean {
  if (pool.x0 > pool.x1) return false;
  const a = Math.max(pool.x0, Math.ceil(b.cx - b.rx)), z = Math.min(pool.x1, Math.floor(b.cx + b.rx));
  return a <= z && b.cy + b.ry >= pool.level - pool.flame;
}
/* The ticks a pool burns: one every `tick` seconds while it burns (`burn`
   seconds). server/fire.php room_burn_ticks is the same. */
export function burnTicks(burn: number, tick: number): number {
  return Math.floor(burn / tick + 1e-9);
}
/* A tick's length in 1/60 s sim steps: the war counts steps, not seconds.
   server/fire.php room_tick_steps is the same. */
export function tickSteps(tick: number): number {
  return Math.max(1, Math.floor(tick * 60 + 0.5));
}
/* What `ticks` ticks of dmg cost a unit in all: a shield eats the first
   whole (then is gone), a bunker halves each (never below 1). The drones
   weigh a pool with this; the burn itself hurts tick by tick through
   sim.ts hitUnit. server/fire.php room_burn_total is the same. */
export function burnTotal(dmg: number, ticks: number, shield: boolean, bunker: boolean): number {
  const n = Math.max(0, ticks - (shield && ticks > 0 ? 1 : 0));
  return n * (bunker ? Math.max(1, Math.round(dmg / 2)) : dmg);
}
