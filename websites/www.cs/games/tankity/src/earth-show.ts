/* Operation Tankity: the ground as it is drawn while the earth moves.
 *
 * The rules move the ground at once (src/earth.ts); the picture follows over
 * a moment, so a mound of dirt rises, liquid dirt flows out from where it
 * landed and sets, and slopes slide down. begin() is handed the ground as it
 * was and the columns an op moved; shown() is the ground to draw this frame.
 * Pure and DOM-free: view.ts draws shown(), main.ts steps it. */

/** Seconds each kind of earth takes to settle on screen. */
export const EARTH_ANIM = { dirt: 0.35, pour: 1.3, slump: 0.6 } as const;
export type EarthAnimKind = keyof typeof EARTH_ANIM;

interface Anim { before: number[]; x0: number; x1: number; kind: EarthAnimKind; origin: number; t: number }

export interface EarthShow {
  /** The ground moved over columns x0..x1 (before: the whole ground as it was); origin: where it started (a pour flows out from it). */
  begin(before: readonly number[], x0: number, x1: number, kind: EarthAnimKind, origin: number): void;
  step(dt: number): void;
  /** The ground to draw now: `terrain` itself while nothing moves. */
  shown(terrain: readonly number[]): readonly number[];
  /** Some earth is still settling on screen. */
  busy(): boolean;
  clear(): void;
}

const ease = (u: number): number => u * u * (3 - 2 * u);

export function createEarthShow(): EarthShow {
  let anims: Anim[] = [];
  /* How far column ix of a has come, 0 to 1. A pour fills from its origin
     out to its rims; the rest move together. */
  function progress(a: Anim, ix: number): number {
    const u = a.t / EARTH_ANIM[a.kind];
    if (a.kind !== 'pour') return ease(Math.min(1, u));
    const half = Math.max(1, a.x1 - a.origin, a.origin - a.x0);
    const lag = Math.abs(ix - a.origin) / half * 0.6;
    return ease(Math.max(0, Math.min(1, (u - lag) / 0.4)));
  }
  return {
    begin(before, x0, x1, kind, origin) {
      if (x0 > x1) return;
      anims.push({ before: before.slice(x0, x1 + 1), x0, x1, kind, origin, t: 0 });
    },
    step(dt) {
      for (const a of anims) a.t += dt;
      anims = anims.filter(a => a.t < EARTH_ANIM[a.kind]);
    },
    shown(terrain) {
      if (!anims.length) return terrain;
      const out = terrain.slice();
      for (const a of anims) {
        for (let ix = Math.max(0, a.x0); ix <= Math.min(out.length - 1, a.x1); ix++) {
          const from = a.before[ix - a.x0]!;
          out[ix] = from + (terrain[ix]! - from) * progress(a, ix);
        }
      }
      return out;
    },
    busy: () => anims.length > 0,
    clear() { anims = []; },
  };
}
