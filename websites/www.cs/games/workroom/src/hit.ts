// Hit testing on the story timeline: a pixel to a time, a bar, a band, a lane
// and a section. DOM-free.
import type { Score, Section } from './score.ts';
import { sectionTimes } from './tempo.ts';
import type { TempoMap } from './tempo.ts';
import { xToTime } from './zoom.ts';
import type { View } from './zoom.ts';
import type { TimelineLayout } from './timeline.ts';

export type Zone = 'energy' | 'sections' | 'lanes' | 'none';
export interface Hit { time: number; bar: number | null; zone: Zone; laneId: string | null; sectionId: string | null }  // bar is null on a sound piece
export interface Span { from: number; to: number; fromBar: number | null; toBar: number | null; laneId: string | null }  // the bars are null on a sound piece

/** Seconds within which a time counts as on a boundary: a time that went through pixels and back lands a hair either side of it. */
export const BOUNDARY_EPS = 1e-9;

/** Index of the span playing at t. Spans are in time order and cover from..to inclusive, within BOUNDARY_EPS; on a shared boundary the later span wins. -1 in a gap, or when there are none. */
export function spanIndexAt(spans: readonly { from: number; to: number }[], t: number): number {
  for (let i = spans.length - 1; i >= 0; i--) {
    const s = spans[i]!;
    if (t >= s.from - BOUNDARY_EPS) return t <= s.to + BOUNDARY_EPS ? i : -1;
  }
  return -1;
}

/** The section playing at t (null in a gap between a sound piece's moments, or when it has none). */
export function sectionAt(score: Score, tempo: TempoMap, t: number): Section | null {
  const i = spanIndexAt(score.sections.map(s => sectionTimes(s, tempo, score.duration)), t);
  return score.sections[i] ?? null;
}

export function hitTimeline(layout: TimelineLayout, view: View, tempo: TempoMap, x: number, y: number): Hit {
  const duration = tempo.barStart(Infinity); // past the last bar is the end of the piece
  const time = Math.min(duration, Math.max(0, xToTime(view, x)));
  const lane = layout.lanes.find(l => within(y, l.rect));
  const section = layout.sections[spanIndexAt(layout.sections, time)];
  const zone: Zone = lane ? 'lanes' : within(y, layout.energy.rect) ? 'energy' : y >= layout.energy.rect.y + layout.energy.rect.h && y < laneTop(layout) ? 'sections' : 'none';
  return { time, bar: tempo.barAt(time), zone, laneId: lane?.id ?? null, sectionId: section?.id ?? null };
}

const within = (y: number, r: { y: number; h: number }): boolean => y >= r.y && y < r.y + r.h;
const laneTop = (layout: TimelineLayout): number => layout.lanes[0]?.rect.y ?? layout.height;

/** The span between two hits, in time order; the lane only when both hits are in the same lane. */
export function spanBetween(a: Hit, b: Hit, _tempo: TempoMap): Span {
  const [first, last] = a.time <= b.time ? [a, b] : [b, a];
  return { from: first.time, to: last.time, fromBar: first.bar, toBar: last.bar, laneId: a.laneId !== null && a.laneId === b.laneId ? a.laneId : null };
}
