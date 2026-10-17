// Hit testing on the story timeline: a pixel to a time, a bar, a band, a lane
// and a section. DOM-free.
import type { TempoMap } from './tempo.ts';
import { xToTime } from './zoom.ts';
import type { View } from './zoom.ts';
import type { TimelineLayout } from './timeline.ts';

export type Zone = 'energy' | 'sections' | 'lanes' | 'none';
export interface Hit { time: number; bar: number | null; zone: Zone; laneId: string | null; sectionId: string | null }  // bar is null on a sound piece
export interface Span { from: number; to: number; fromBar: number | null; toBar: number | null; laneId: string | null }  // the bars are null on a sound piece

export function hitTimeline(layout: TimelineLayout, view: View, tempo: TempoMap, x: number, y: number): Hit {
  const duration = tempo.barStart(Infinity); // past the last bar is the end of the piece
  const time = Math.min(duration, Math.max(0, xToTime(view, x)));
  const lane = layout.lanes.find(l => within(y, l.rect));
  const sections = layout.sections.map(s => ({ id: s.id, from: xToTime(view, s.rect.x), to: xToTime(view, s.rect.x + s.rect.w) }));
  const last = sections[sections.length - 1];
  const section = sections.find(s => (time >= s.from && time < s.to) || (s === last && time === duration && time >= s.from));
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
