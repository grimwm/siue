// The view of the time axis: which seconds are on screen and how wide a second
// is. Pure arithmetic. DOM-free.
export interface View { start: number; pxPerSec: number; width: number }
export interface Bounds { duration: number; minPxPerSec: number; maxPxPerSec: number }
export const MAX_PX_PER_SEC = 400;

/** minPxPerSec = width / duration (the whole piece fits); maxPxPerSec = max(MAX_PX_PER_SEC, 8 * minPxPerSec), so even a 0.3 s sound can zoom in. */
export function boundsFor(duration: number, width: number): Bounds {
  const min = Math.max(1, width) / duration;
  return { duration, minPxPerSec: min, maxPxPerSec: Math.max(MAX_PX_PER_SEC, 8 * min) };
}

export function fitView(duration: number, width: number): View {
  return { start: 0, pxPerSec: Math.max(1, width) / duration, width: Math.max(1, width) };
}

/** The width changed from prevWidth to width: a view that was the whole piece stays the whole piece; one the owner zoomed or panned keeps its zoom (clamped). */
export function resizeView(v: View, prevWidth: number, width: number, duration: number): View {
  const was = fitView(duration, prevWidth);
  const atFit = v.start === 0 && Math.abs(v.pxPerSec - was.pxPerSec) <= was.pxPerSec * 1e-9;
  return atFit ? fitView(duration, width) : clampView({ ...v, width }, boundsFor(duration, width));
}

export const timeToX = (v: View, t: number): number => (t - v.start) * v.pxPerSec;
export const xToTime = (v: View, x: number): number => v.start + x / v.pxPerSec;

export function clampView(v: View, b: Bounds): View {
  const pxPerSec = Number.isFinite(v.pxPerSec) ? Math.min(b.maxPxPerSec, Math.max(b.minPxPerSec, v.pxPerSec)) : b.minPxPerSec;
  const width = Math.max(1, v.width);
  const latest = Math.max(0, b.duration - width / pxPerSec);
  return { start: Math.min(latest, Math.max(0, Number.isFinite(v.start) ? v.start : 0)), pxPerSec, width };
}

/** Zooms by factor keeping the time under x fixed; clamps pxPerSec and start. */
export function zoomAt(v: View, x: number, factor: number, b: Bounds): View {
  const pxPerSec = Math.min(b.maxPxPerSec, Math.max(b.minPxPerSec, v.pxPerSec * factor));
  return clampView({ start: xToTime(v, x) - x / pxPerSec, pxPerSec, width: v.width }, b);
}

export function panBy(v: View, dx: number, b: Bounds): View {
  return clampView({ ...v, start: v.start - dx / v.pxPerSec }, b);
}

/** Two fingers moved from before to after (x positions): the times under them follow the fingers. */
export function pinch(v: View, before: readonly [number, number], after: readonly [number, number], b: Bounds): View {
  const t0 = xToTime(v, before[0]);
  const t1 = xToTime(v, before[1]);
  const apart = after[1] - after[0];
  if (t1 === t0 || apart === 0) return v;
  const pxPerSec = apart / (t1 - t0);
  if (!(pxPerSec > 0)) return v;
  const clamped = Math.min(b.maxPxPerSec, Math.max(b.minPxPerSec, pxPerSec));
  return clampView({ start: t0 - after[0] / clamped, pxPerSec: clamped, width: v.width }, b);
}

/** Each press of the zoom buttons on the time views zooms by this much. */
export const ZOOM_STEP = 1.5;

/** Zooms about the middle of the view (the zoom buttons). */
export function zoomBy(v: View, factor: number, b: Bounds): View {
  return zoomAt(v, v.width / 2, factor, b);
}

/** The whole piece is on screen: zooming out and Fit have nothing to do. */
export const isWhole = (v: View, b: Bounds): boolean => v.pxPerSec <= b.minPxPerSec * (1 + 1e-9);
/** As close as the view goes: zooming in has nothing to do. */
export const isClosest = (v: View, b: Bounds): boolean => v.pxPerSec >= b.maxPxPerSec * (1 - 1e-9);

/** The sheet music's zoom: 1 is the notation's own size (fitted to the width in page view); a step per button press. */
export const SHEET_ZOOM = { min: 0.5, max: 3, step: 1.25 } as const;

/** The sheet zoom times factor (a button step, or a pinch's new spread over its old one), held to its limits; a broken factor changes nothing. */
export function sheetZoom(zoom: number, factor: number): number {
  if (!Number.isFinite(factor) || factor <= 0) return zoom;
  return Math.min(SHEET_ZOOM.max, Math.max(SHEET_ZOOM.min, zoom * factor));
}

/** The full score's own size on a host this wide (in pixels): its natural size from 760 px up, shrinking with the width below that (half on a phone), never under the smallest zoom; an unmeasured width (0) changes nothing. */
export function fullScoreFit(width: number): number {
  if (!(width > 0)) return 1;
  return Math.max(SHEET_ZOOM.min, Math.min(1, width / 760));
}
