// The view of the time axis: which seconds are on screen and how wide a second
// is. Pure arithmetic. DOM-free.
export interface View { start: number; pxPerSec: number; width: number }
export interface Bounds { duration: number; minPxPerSec: number; maxPxPerSec: number }
export const MAX_PX_PER_SEC = 400;

/** minPxPerSec = width / duration (the whole piece fits); maxPxPerSec = max(MAX_PX_PER_SEC, 8 * minPxPerSec), so even a 0.3 s sound can zoom in. */
export function boundsFor(duration: number, width: number): Bounds {
  const min = width / duration;
  return { duration, minPxPerSec: min, maxPxPerSec: Math.max(MAX_PX_PER_SEC, 8 * min) };
}

export function fitView(duration: number, width: number): View {
  return { start: 0, pxPerSec: width / duration, width };
}

export const timeToX = (v: View, t: number): number => (t - v.start) * v.pxPerSec;
export const xToTime = (v: View, x: number): number => v.start + x / v.pxPerSec;

export function clampView(v: View, b: Bounds): View {
  const pxPerSec = Math.min(b.maxPxPerSec, Math.max(b.minPxPerSec, v.pxPerSec));
  const latest = Math.max(0, b.duration - v.width / pxPerSec);
  return { start: Math.min(latest, Math.max(0, v.start)), pxPerSec, width: v.width };
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
