/* The Island of Crete, modern look: the floating icons. The Minotaur, every object Theseus can take and every
 * moving hazard carry their Classic sprite above them, drawn over the walls, so each is easy to find. Blocks,
 * Theseus, the cow he set down and a clone machine's template carry none. The icons bob gently, and stand still
 * when motion is reduced. DOM-free. */
import type { Placed } from './model-names.ts';

/** An icon's width, in cells. */
export const ICON_SIZE = 0.55;
/** How high an icon floats above the top of its piece, in cells. */
export const ICON_LIFT = 0.32;
const BOB_AMP = 0.03;
const BOB_PERIOD_S = 2;

/** The sprite floating over a placed thing, or null when it has none. */
export function iconFor(p: Placed): string | null {
  if (p.model === 'block' || p.model === 'theseus' || p.model === 'cow-standing') return null;
  if (p.id?.startsWith('machine')) return null;
  return p.model;
}

/** The icons' bob at loop time `t` seconds, in cells: 0 when motion is reduced. */
export function bob(t: number, still: boolean): number {
  return still ? 0 : BOB_AMP * Math.sin((2 * Math.PI * t) / BOB_PERIOD_S);
}
