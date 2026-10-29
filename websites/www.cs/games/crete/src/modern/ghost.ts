/* The Island of Crete, modern look: walls that hide the hero fade to a third. DOM-free. */
import type { WallMode } from '../settings.ts';

const clamp01 = (x: number): number => Math.max(0, Math.min(1, x));
const TAU = 0.2 / 3;

/** The opacity a wall settles at when `cover` (0..1) of it hides the hero. */
export function ghostTarget(cover: number): number {
  return 1 - 0.67 * clamp01(cover);
}

/** One frame of easing toward `target`; exact once within half a percent. */
export function easeOpacity(cur: number, target: number, dtSec: number): number {
  const d = target - cur;
  if (Math.abs(d) < 0.005) return target;
  return cur + d * (1 - Math.exp(-dtSec / TAU));
}

/** What the walls fade for: in Ghosted, Theseus and everything else that stands on the board; in Solid and Low,
 *  Theseus alone. */
export function ghostSubjects<T>(mode: WallMode, hero: T | null, rest: readonly T[]): T[] {
  const me = hero ? [hero] : [];
  return mode === 'ghosted' ? [...me, ...rest] : me;
}
