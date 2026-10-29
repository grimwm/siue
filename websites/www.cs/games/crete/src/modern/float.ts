/* The Island of Crete, modern look: blocks pushed into water. The rules fill the water with the block, so the cell
 * is dirt from then on; the modern board draws a cell that was water when the level began and is dirt now as the
 * block floating in the water, its top just above the surface. A block that goes in during play splashes, dips under
 * and rises to float; it bobs slowly while it floats, and stands still when motion is reduced. DOM-free. */
import type { Terrain } from '../puzzle/tiles.ts';

/** The splash's droplets and ring play this long, in seconds. */
export const SPLASH_S = 0.4;
/** The block dips under the surface over this long, then rises to float over RISE_S. */
export const DIP_S = 0.25;
export const RISE_S = 0.35;
/** The floating block's top above the water, in cells. */
export const FLOAT_TOP = 0.065;
/** How far under the surface the block's top dips, in cells. */
const DIP_TOP = -0.2;
const BOB_AMP = 0.012;
const BOB_PERIOD_S = 3;

/** The cells, as row * cols + col, that were water when the level began and are dirt now: the blocks that sank. */
export function filledWater(initial: readonly Terrain[], now: readonly Terrain[]): number[] {
  const out: number[] = [];
  initial.forEach((t, i) => {
    if (t === 'water' && now[i] === 'dirt') out.push(i);
  });
  return out;
}

/** The block's top above the water `t` seconds after it went in at `enter` above it: it falls, gathering speed,
 *  to under the surface, then rises and settles at FLOAT_TOP. */
export function floatTop(t: number, enter: number): number {
  if (t <= 0) return enter;
  if (t < DIP_S) {
    const k = t / DIP_S;
    return enter + (DIP_TOP - enter) * k * k;
  }
  if (t < DIP_S + RISE_S) {
    const k = (t - DIP_S) / RISE_S;
    return DIP_TOP + (FLOAT_TOP - DIP_TOP) * (1 - (1 - k) ** 3);
  }
  return FLOAT_TOP;
}

/** The floating block's bob at loop time `t` seconds, in cells: 0 when motion is reduced. */
export function floatBob(t: number, still: boolean): number {
  return still ? 0 : BOB_AMP * Math.sin((2 * Math.PI * t) / BOB_PERIOD_S);
}
