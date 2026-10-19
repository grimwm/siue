// The energy the owner draws: a finger's path in pixels becomes [seconds, value]
// points, and each stroke replaces the curve under its own time span. The curve
// always runs from 0 to the end of the piece, in time order, values in [0, 1]. A
// curve handed in with its times out of order is sorted first. DOM-free.
import { timeToX, xToTime } from './zoom.ts';
import type { View } from './zoom.ts';

export type Curve = [number, number][];
export const ENERGY_EDIT_H = 160;
export const STROKE_STEP_PX = 4;

const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));
const byTime = (a: readonly [number, number], b: readonly [number, number]): number => a[0] - b[0];
const sortedCopy = (curve: readonly [number, number][]): Curve => curve.map(([t, v]): [number, number] => [t, v]).sort(byTime);

export function strokeFromPixels(points: readonly [number, number][], view: View, height: number = ENERGY_EDIT_H): Curve {
  const out: Curve = [];
  let lastX = -Infinity;
  points.forEach(([x, y], i) => {
    if (Math.abs(x - lastX) < STROKE_STEP_PX && i !== points.length - 1) return;
    lastX = x;
    out.push([xToTime(view, x), clamp01(1 - y / height)]);
  });
  return out;
}

export function redraw(curve: readonly [number, number][], stroke: Curve, duration: number): Curve {
  if (stroke.length === 0) return sortedCopy(curve);
  const atTime = new Map<number, number>();
  for (const [t, v] of stroke) atTime.set(Math.min(duration, Math.max(0, t)), clamp01(v)); // a later point at the same time wins
  const drawn = [...atTime].sort(byTime);
  const lo = drawn[0]![0];
  const hi = drawn[drawn.length - 1]![0];
  const out: Curve = [...sortedCopy(curve).filter(([t]) => t < lo || t > hi), ...drawn].sort(byTime);
  if (out[0]![0] > 0) out.unshift([0, out[0]![1]]);
  const last = out[out.length - 1]!;
  if (last[0] < duration) out.push([duration, last[1]]);
  return out;
}

export function curveToPixels(curve: readonly [number, number][], view: View, height: number = ENERGY_EDIT_H): [number, number][] {
  return sortedCopy(curve).map(([t, v]): [number, number] => [timeToX(view, t), height * (1 - v)]);
}
