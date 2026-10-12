/* Operation Tankity: how wide a solo field is dealt, and where the field sits
 * in the battlefield box. DOM-free: main.ts hands in the viewport and view.ts
 * the canvas's box. The width comes only from the box the device gives in
 * landscape (spec 6.6); portrait frames that field and never changes it. */
import { FIELD_COL, FIELD_W_MAX, FIELD_W_MIN, ROOM_W, clamp } from './sim.ts';

export interface Box { w: number; h: number }

/* What the frame takes around the battlefield in landscape, in CSS px. The
   landscape-phone layout (game.css, `(orientation: landscape) and
   (max-height: 500px)`) applies at a short side of PHONE_SHORT or less.
   tankity-layout checks these against the measured box on every landscape screen. */
export const PHONE_SHORT = 500;
export const PHONE_CHROME = { x: 10, y: 75 } as const;
export const WIDE_CHROME = { x: 18, y: 294, maxW: 1118 } as const;

/** The battlefield box this viewport gives in landscape, held either way. */
export function landscapeBox(vw: number, vh: number): Box {
  const long = Math.max(vw, vh), short = Math.min(vw, vh);
  if (short <= PHONE_SHORT) return { w: long - PHONE_CHROME.x, h: short - PHONE_CHROME.y };
  return { w: Math.min(long - WIDE_CHROME.x, WIDE_CHROME.maxW), h: short - WIDE_CHROME.y };
}

/** 460 × the box's long side ÷ its short side, clamped, on a whole column. */
export function fieldWidth(box: Box): number {
  const long = Math.max(box.w, box.h), short = Math.max(1, Math.min(box.w, box.h));
  return Math.round(clamp(460 * long / short, FIELD_W_MIN, FIELD_W_MAX) / FIELD_COL) * FIELD_COL;
}

export function fieldWidthFor(vw: number, vh: number): number {
  return fieldWidth(landscapeBox(vw, vh));
}

export interface FieldWidth { deal(): number; readonly width: number }
/** The width matches are dealt at. Only deal() reads the viewport, so a
 *  resize or a turn mid-match rescales the view and never the map. */
export function createFieldWidth(viewport: () => Box): FieldWidth {
  let width = ROOM_W;
  return {
    deal() {
      const vp = viewport();
      width = fieldWidthFor(vp.w, vp.h);
      return width;
    },
    get width() { return width; },
  };
}

/** Share of a tall box's leftover height that goes to sky above the field; the rest is dirt below. */
export const SKY_SHARE = 0.6;
export interface Fit { s: number; ox: number; oy: number }
/** Scale and offset that put the field (world units) in the box (any unit):
 *  whole and as large as fits, centred across, the leftover height split sky above, dirt below. */
export function fitField(box: Box, field: Box): Fit {
  const s = Math.min(box.w / field.w, box.h / field.h);
  return { s, ox: (box.w - field.w * s) / 2, oy: (box.h - field.h * s) * SKY_SHARE };
}
export interface WorldRect { x0: number; y0: number; x1: number; y1: number }
/** The world rectangle the whole box shows at that fit, before the camera. */
export function visibleWorld(fit: Fit, box: Box): WorldRect {
  return { x0: -fit.ox / fit.s, y0: -fit.oy / fit.s, x1: (box.w - fit.ox) / fit.s, y1: (box.h - fit.oy) / fit.s };
}
