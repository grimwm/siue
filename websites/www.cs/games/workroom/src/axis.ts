// The time axis: bars for a music piece, seconds for a sound piece. DOM-free.
import type { Score } from './score.ts';
import type { TempoMap } from './tempo.ts';
import { timeToX } from './zoom.ts';
import type { View } from './zoom.ts';

export interface AxisTick { x: number; label: string; bar: number | null }  // bar is null on a sound piece's axis

const STEPS = [0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 15, 30, 60, 120, 300];
const MIN_GAP_PX = 60;

/** "0 s", "50 ms", "300 ms", "1 s", "1.5 s", "12 s": milliseconds below one second, otherwise seconds with at most two decimals. */
export function formatSeconds(t: number): string {
  if (t === 0) return '0 s';
  if (t < 1) return `${Math.round(t * 1000)} ms`;
  return `${Math.round(t * 100) / 100} s`;
}

/** Ticks at a round step (10 ms up to 5 min) chosen so neighbours are at least 60 px apart; only ticks with 0 <= x < view.width - 1e-6. */
export function secondsTicks(view: View): AxisTick[] {
  const step = STEPS.find(s => s * view.pxPerSec >= MIN_GAP_PX) ?? STEPS[STEPS.length - 1]!;
  const out: AxisTick[] = [];
  for (let k = Math.ceil(view.start / step - 1e-9); ; k++) {
    const t = Math.round(k * step * 1e9) / 1e9;
    const x = timeToX(view, t);
    if (x >= view.width - 1e-6) break;
    if (x >= -1e-6) out.push({ x, label: formatSeconds(t), bar: null });
  }
  return out;
}

/** A music piece: one tick per visible bar start, labelled with the bar number. A sound piece: secondsTicks(view). */
export function axisTicks(score: Score, tempo: TempoMap, view: View): AxisTick[] {
  if (!tempo.metric || score.bars === undefined) return secondsTicks(view);
  const out: AxisTick[] = [];
  for (let bar = 1; bar <= score.bars; bar++) {
    const x = timeToX(view, tempo.barStart(bar));
    if (x >= -1e-6 && x < view.width - 1e-6) out.push({ x, label: String(bar), bar });
  }
  return out;
}

const CHAR_PX = 7;
const LABEL_PAD_PX = 8;

/** The ticks whose labels can be read: left to right, a tick is kept only when its label starts after the end of the last kept one (about 7 px a character plus 8 px of air). */
export function thinTicks(ticks: readonly AxisTick[]): AxisTick[] {
  const out: AxisTick[] = [];
  let free = -Infinity;
  for (const t of ticks) {
    if (t.x < free) continue;
    out.push(t);
    free = t.x + t.label.length * CHAR_PX + LABEL_PAD_PX;
  }
  return out;
}

/** The height of the time axis under a drawing. */
export const AXIS_H = 20;
