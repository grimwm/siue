// Sheet music: one lane of the piece's MusicXML drawn with OpenSheetMusicDisplay.
// This is its own bundle, loaded only when the Sheet music view opens.
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';
import type { GraphicalMeasure } from 'opensheetmusicdisplay';
import { onlyLane } from './musicxml.ts';
import { createSheet } from './sheetlife.ts';
import type { Notation, SheetHandle } from './sheetlife.ts';

const SVG_NS = 'http://www.w3.org/2000/svg';
/** OSMD lays the music out in units of 10 SVG pixels (its unitInPixels); the SVG's viewBox applies the zoom. */
const UNIT = 10;
/** The lit box reaches this many units above the top line and below the bottom one, to take in notes off the staff. */
const REACH = 2;

interface Box { x: number; y: number; w: number; h: number }

/** The drawn box of a bar, in the SVG's own units: every staff of the measure numbered `bar`, or of the last one before it when the bar is inside a several-bar rest drawn as one. */
function barBox(osmd: OpenSheetMusicDisplay, bar: number): Box | null {
  let found: GraphicalMeasure[] | null = null;
  let foundNumber = -Infinity;
  for (const staves of osmd.GraphicSheet?.MeasureList ?? []) {
    const m = staves.find(s => s !== undefined);
    if (!m) continue;
    const n = m.MeasureNumber;
    if (n <= bar && n > foundNumber) { found = staves; foundNumber = n; }
  }
  if (!found) return null;
  let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
  for (const m of found) {
    if (!m) continue;
    const s = m.PositionAndShape;
    x1 = Math.min(x1, s.AbsolutePosition.x + s.BorderLeft);
    x2 = Math.max(x2, s.AbsolutePosition.x + s.BorderRight);
    y1 = Math.min(y1, s.AbsolutePosition.y + s.BorderTop - REACH);
    y2 = Math.max(y2, s.AbsolutePosition.y + s.BorderBottom + REACH);
  }
  return x2 > x1 && y2 > y1 ? { x: x1 * UNIT, y: y1 * UNIT, w: (x2 - x1) * UNIT, h: (y2 - y1) * UNIT } : null;
}

/** OSMD as the view's notation, lighting a bar with an amber box drawn behind its notes. */
function notation(host: HTMLElement): Notation {
  const osmd = new OpenSheetMusicDisplay(host, { autoResize: false, drawTitle: false });
  let lit: SVGRectElement | null = null;
  return {
    load: xml => osmd.load(xml),
    render: () => osmd.render(),
    clear: () => osmd.clear(),
    mark(bar) {
      lit?.remove();
      lit = null;
      if (bar === null) return;
      const box = barBox(osmd, bar);
      const svg = host.querySelector('svg');
      if (!box || !svg) return;
      const r = document.createElementNS(SVG_NS, 'rect');
      for (const [k, v] of Object.entries({ x: box.x, y: box.y, width: box.w, height: box.h, rx: 4 })) r.setAttribute(k, String(v));
      r.setAttribute('class', 'fill-amber/20 stroke-amber stroke-2'); // classes, not a style attribute: the page's CSP refuses inline styles
      r.setAttribute('data-sheet-bar', String(bar));
      svg.insertBefore(r, svg.firstChild);
      lit = r;
      r.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    },
  };
}

/** A sheet-music view in el: show a lane, light a bar, redraw on resize, dispose when done. OSMD's own resize handling is off; the handle owns the one listener. */
export function mountSheet(el: HTMLElement): SheetHandle {
  return createSheet(el, host => notation(host as HTMLElement), window, onlyLane);
}

const mounted = new WeakMap<HTMLElement, SheetHandle>();

/** Renders one lane (the MusicXML part with that id) with OpenSheetMusicDisplay into el, replacing any earlier rendering there. */
export async function renderSheet(el: HTMLElement, musicxml: string, laneId: string): Promise<void> {
  let sheet = mounted.get(el);
  if (!sheet) { sheet = mountSheet(el); mounted.set(el, sheet); }
  await sheet.show(musicxml, laneId);
}
