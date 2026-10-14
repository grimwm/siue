/* Operation Tankity: how a napalm pool looks and sounds when it lights,
 * shared by the solo war (match.ts), the room replay (room.ts) and the
 * firing range (preview.ts): its splash, the embers and smoke over it for as
 * long as it burns (the gun's `burn` special, along the pool), the sound, and
 * its flames on screen (fire-show.ts). The rules burn it tick by tick
 * elsewhere (sim.ts stepFires, server/rules.php room_fire_burn). */
import type { FireShow } from './fire-show.ts';

export interface FireFxDeps {
  fxImpact(key: string, x: number, y: number, r: number): number | undefined;
  fxSpecial(key: string, name: string, x: number, y: number, ang: number, len?: number): void;
  sound(name: 'thud'): void;
  show: FireShow | null;
}

/** The smallest a pool's splash is sized, px. */
export const POOL_SPLASH_MIN = 12;

/* A pool lit: level over columns x0..x1 (x0 > x1: it spilled away, and only
   the splash shows, at (x, ground)), flames `flame` px tall, burning `dur`
   seconds. */
export function playBurn(wkey: string, p: { x: number; ground: number; level: number; x0: number; x1: number; flame: number }, dur: number, d: FireFxDeps): void {
  d.sound('thud');
  if (p.x0 > p.x1) {
    d.fxImpact(wkey, p.x, p.ground, POOL_SPLASH_MIN);
    return;
  }
  d.fxImpact(wkey, (p.x0 + p.x1) / 2, p.level, Math.max(POOL_SPLASH_MIN, (p.x1 - p.x0) / 2));
  d.fxSpecial(wkey, 'burn', p.x0, p.level, 0, p.x1 - p.x0);
  d.show && d.show.light({ wkey, x0: p.x0, x1: p.x1, level: p.level, flame: p.flame }, dur);
}
