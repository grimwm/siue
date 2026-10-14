/* Operation Tankity: the burning pools as they are drawn.
 *
 * The rules burn a napalm pool tick by tick (sim.ts stepFires in the war,
 * server/rules.php room_fire_burn in a room); the picture is this: each pool
 * lit where it lies, its flames rising over a moment, standing while it
 * burns, and dying down after its last tick. light() is handed the pool and
 * how long it burns; heat() is how high its flames stand this frame (0 to 1).
 * Pure and DOM-free: render.ts draws pools(), main.ts steps it. */

/** Seconds a pool's flames take to rise, and to die down after its last tick. */
export const FIRE_RISE = 0.3;
export const FIRE_FADE = 0.8;

/** A burning pool on screen: the gun, the pool (level over columns x0..x1,
 *  flames `flame` px tall), seconds since it lit, and seconds it burns. */
export interface BurnPool { wkey: string; x0: number; x1: number; level: number; flame: number; t: number; dur: number }

export interface FireShow {
  /** A pool lit: it burns `dur` seconds, then dies down. A pool with no columns lights nothing. */
  light(p: Pick<BurnPool, 'wkey' | 'x0' | 'x1' | 'level' | 'flame'>, dur: number): void;
  step(dt: number): void;
  /** The pools to draw now. */
  pools(): readonly BurnPool[];
  /** How high p's flames stand now, 0 to 1. */
  heat(p: BurnPool): number;
  /** Some pool is still drawn. */
  busy(): boolean;
  clear(): void;
}

const ease = (u: number): number => u * u * (3 - 2 * u);

export function createFireShow(): FireShow {
  let list: BurnPool[] = [];
  return {
    light(p, dur) {
      if (p.x0 > p.x1) return;
      list.push({ wkey: p.wkey, x0: p.x0, x1: p.x1, level: p.level, flame: p.flame, t: 0, dur: Math.max(0, dur) });
    },
    step(dt) {
      for (const p of list) p.t += dt;
      list = list.filter(p => p.t < p.dur + FIRE_FADE);
    },
    pools: () => list,
    heat(p) {
      if (p.t < FIRE_RISE) return ease(p.t / FIRE_RISE);
      if (p.t <= p.dur) return 1;
      return ease(Math.max(0, 1 - (p.t - p.dur) / FIRE_FADE));
    },
    busy: () => list.length > 0,
    clear() { list = []; },
  };
}
