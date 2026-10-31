/* The Island of Crete, modern look: the floating markers. A small glass crystal floats over each figure and piece
 * that matters, coloured by what it is: red over the Minotaur, green over Theseus, violet over every moving hazard
 * (a Bronze ball, a Harpy, Talos's fire) and gold over every object Theseus can take (relics, keys, gear, tools and
 * story pages). Blocks, the cow he set down and a clone machine's template carry none. A marker hangs point down
 * just above its piece's head as the screen shows it, so in Top-down and in Angled alike it sits over its own
 * piece, and in Top-down its point stays inside its piece's cell. Markers bob gently down and back, and stand
 * still when motion is reduced. A marker whose piece is on screen is never cut off by the view's edge. DOM-free. */
import { HAZARDS, OBJECTS } from '../puzzle/tiles.ts';
import type { Placed } from './model-names.ts';

export type MarkerKind = 'minotaur' | 'theseus' | 'hazard' | 'item';

/** Each kind's colour. */
export const MARKER_COLOURS: Record<MarkerKind, number> = {
  minotaur: 0xe8322c,
  theseus: 0x36d46c,
  hazard: 0xa45cf2,
  item: 0xf5b62a,
};

/** A marker's width and height, in cells. */
export const MARKER_WIDTH = 0.26;
export const MARKER_HEIGHT = 0.44;
/** The room between the top of a piece's head and its marker's point, on screen, in cells. */
export const MARKER_GAP = 0.06;
const BOB_AMP = 0.02;
const BOB_PERIOD_S = 2.4;

const HAZARD_MODELS: ReadonlySet<string> = new Set(Object.values(HAZARDS).map(h => h.sprite));
const ITEM_MODELS: ReadonlySet<string> = new Set(Object.values(OBJECTS).map(o => o.sprite).filter(s => s !== OBJECTS.block.sprite));

/** The marker floating over a placed thing, or null when it has none. */
export function markerFor(p: Placed): MarkerKind | null {
  if (p.id?.startsWith('machine')) return null;
  if (p.model === 'theseus') return 'theseus';
  if (p.model === 'minotaur' || p.model === 'minotaur-stone') return 'minotaur';
  if (HAZARD_MODELS.has(p.model)) return 'hazard';
  if (ITEM_MODELS.has(p.model)) return 'item';
  return null;
}

/** How far the marker's point stands above its piece's foot on screen, in cells (view units), for a piece `h`
 *  cells tall seen at `pitchDeg`: the head's height foreshortened by the camera's tilt, plus the gap. The board
 *  places the point there along the camera's screen-up, so it is over the piece whatever the view. */
export function markerRise(h: number, pitchDeg: number): number {
  return h * Math.cos((pitchDeg * Math.PI) / 180) + MARKER_GAP;
}

/** The markers' bob at loop time `t` seconds, in cells: down to twice BOB_AMP and back, 0 when motion is reduced. */
export function bob(t: number, still: boolean): number {
  return still ? 0 : -BOB_AMP * (1 - Math.cos((2 * Math.PI * t) / BOB_PERIOD_S));
}

/** The room kept between a marker and the view's edge, in view units (cells across the screen). */
export const MARKER_MARGIN = 0.08;

/** How far to slide a marker so all of it shows: its point at `(fx, fy)` view units from the view's centre (right
 *  and up), `w` wide and `h` tall, in a view `hw` by `hh` from its centre to its edges, kept `margin` inside them. */
export function keepInView(fx: number, fy: number, w: number, h: number, hw: number, hh: number, margin: number): [number, number] {
  const fit = (p: number, lo: number, hi: number) => (lo > hi ? 0 : Math.max(lo, Math.min(hi, p)) - p);
  return [fit(fx, -hw + margin + w / 2, hw - margin - w / 2), fit(fy, -hh + margin, hh - margin - h)];
}
