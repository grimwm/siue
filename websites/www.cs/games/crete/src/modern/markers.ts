/* The Island of Crete, modern look: the floating markers. A small glass crystal with a dark rim floats over Theseus
 * (green) and the Minotaur (red). With crystals over the items (variants.ts `cyan` or `white`; on plates, as ships,
 * the items stand out on their own), every moving hazard (a Bronze ball, a Harpy, Talos's fire) carries a violet one
 * and every object Theseus can take (relics, keys, gear, tools and story pages) a bright cyan one. Each colour stands
 * out from the dark stone, and the rim from the pale sand. Blocks, the cow he set down and a clone machine's template
 * carry none. A marker never draws smaller on screen than MARKER_MIN_PX across, however far the view is zoomed out.
 * It hangs point down just above its piece's head as the screen shows it, so top-down and tilted alike it sits over
 * its own piece, and top-down a figure's marker point stays inside its cell. Markers bob gently down and
 * back, and stand still when motion is reduced. A marker whose piece is on screen is never cut off by the view's
 * edge. DOM-free. */
import { HAZARDS, OBJECTS } from '../puzzle/tiles.ts';
import type { Placed } from './model-names.ts';
import { variant } from './variants.ts';
import type { Variant } from './variants.ts';

export type MarkerKind = 'minotaur' | 'theseus' | 'hazard' | 'item';

/** Each kind's colour. */
export const MARKER_COLOURS: Record<MarkerKind, number> = {
  minotaur: 0xff4a3a,
  theseus: 0x36d46c,
  hazard: 0xc07cff,
  item: 0x3ae4ff,
};
/** The rim round every marker: near black. */
export const MARKER_RIM = 0x0a0806;
/** A marker's least width on screen, in CSS pixels. */
export const MARKER_MIN_PX = 14;

/** How much to grow a marker so it is at least MARKER_MIN_PX wide where a cell is `cellPx` CSS pixels: 1 when it
 *  already is. */
export function markerScale(cellPx: number): number {
  return Math.max(1, MARKER_MIN_PX / (MARKER_WIDTH * Math.max(cellPx, 1e-6)));
}

/** WCAG relative luminance of an sRGB colour. */
export function luminance(c: number): number {
  const ch = (v: number) => {
    const x = v / 255;
    return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * ch(c >> 16) + 0.7152 * ch((c >> 8) & 255) + 0.0722 * ch(c & 255);
}

/** WCAG contrast ratio between two sRGB colours, 1 to 21. */
export function contrast(a: number, b: number): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

/** A marker's width and height, in cells. */
export const MARKER_WIDTH = 0.26;
export const MARKER_HEIGHT = 0.44;
/** The room between the top of a piece's head and its marker's point, on screen, in cells. */
export const MARKER_GAP = 0.06;
const BOB_AMP = 0.02;
const BOB_PERIOD_S = 2.4;

const HAZARD_MODELS: ReadonlySet<string> = new Set(Object.values(HAZARDS).map(h => h.sprite));
const ITEM_MODELS: ReadonlySet<string> = new Set(Object.values(OBJECTS).map(o => o.sprite).filter(s => s !== OBJECTS.block.sprite));

/** The marker floating over a placed thing, or null when it has none, for the item style `items` (variants.ts). */
export function markerFor(p: Placed, items: Variant['items'] = variant().items): MarkerKind | null {
  if (p.id?.startsWith('machine')) return null;
  if (p.model === 'theseus') return 'theseus';
  if (p.model === 'minotaur' || p.model === 'minotaur-stone') return 'minotaur';
  // On plates (variants.ts) the objects and hazards stand out by themselves.
  if (items === 'plate') return null;
  if (HAZARD_MODELS.has(p.model)) return 'hazard';
  if (ITEM_MODELS.has(p.model)) return 'item';
  return null;
}

/** How far the marker's point stands above its piece's foot on screen, in cells (view units), for a piece `h`
 *  cells tall whose top leans `back` cells up the board, seen at `pitchDeg`: the top's height foreshortened by the
 *  camera's tilt, plus its lean seen from above, plus the gap. The board places the point there along the camera's
 *  screen-up, so it is over the piece whatever the view. */
export function markerRise(h: number, pitchDeg: number, back = 0): number {
  const p = (pitchDeg * Math.PI) / 180;
  return h * Math.cos(p) + back * Math.sin(p) + MARKER_GAP;
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
