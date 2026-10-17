// The story timeline's layout in pixels: energy band, sections, one row per
// lane, motif ribbons and the time axis. DOM-free.
import { motifColor } from './score.ts';
import type { Score } from './score.ts';
import { axisTicks } from './axis.ts';
import type { AxisTick } from './axis.ts';
import { sectionTimes } from './tempo.ts';
import type { TempoMap } from './tempo.ts';
import { timeToX } from './zoom.ts';
import type { View } from './zoom.ts';

export interface Rect { x: number; y: number; w: number; h: number }
export const TIMELINE = { energyH: 48, sectionH: 28, laneH: 36, ribbonH: 6 } as const;

export interface TimelineLayout {
  height: number;
  energy: { rect: Rect; points: [number, number][] };            // pixel points, y = energyH * (1 - value)
  sections: { id: string; name: string; color: string; rect: Rect }[];
  lanes: { id: string; name: string; icon: string; color: string; rect: Rect }[];   // rect spans the view width
  ribbons: { motif: string; character: string; color: string; lane: string; rect: Rect }[]; // at the bottom of their lane; character is the character id, color that character's colour from the score
  ticks: AxisTick[];                                             // the time axis: visible bar starts (music) or seconds ticks (sound)
}

export function layoutTimeline(score: Score, tempo: TempoMap, view: View): TimelineLayout {
  const { energyH, sectionH, laneH, ribbonH } = TIMELINE;
  const lanesTop = energyH + sectionH;
  const span = (from: number, to: number): { x: number; w: number } => ({ x: timeToX(view, from), w: (to - from) * view.pxPerSec });

  const sections = score.sections.map(s => {
    const { from, to } = sectionTimes(s, tempo, score.duration);
    return { id: s.id, name: s.name, color: s.color, rect: { ...span(from, to), y: energyH, h: sectionH } };
  });
  const lanes = score.lanes.map((l, i) => ({ id: l.id, name: l.name, icon: l.icon, color: l.color, rect: { x: 0, y: lanesTop + i * laneH, w: view.width, h: laneH } }));
  const ribbons = score.motifs.flatMap(m => {
    const color = motifColor(score, m);
    return m.spans.flatMap(s => {
      const lane = lanes.find(l => l.id === s.lane);
      return lane ? [{ motif: m.id, character: m.character, color, lane: s.lane, rect: { ...span(s.from, s.to), y: lane.rect.y + laneH - ribbonH, h: ribbonH } }] : [];
    });
  });
  return {
    height: lanesTop + lanes.length * laneH,
    energy: { rect: { x: 0, y: 0, w: view.width, h: energyH }, points: score.energy.map(([t, v]): [number, number] => [timeToX(view, t), energyH * (1 - v)]) },
    sections,
    lanes,
    ribbons,
    ticks: axisTicks(score, tempo, view),
  };
}
