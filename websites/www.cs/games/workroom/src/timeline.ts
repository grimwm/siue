// The story timeline's layout in pixels: energy band, sections, one row per
// lane, motif ribbons, lane notes, the energy glow and the time axis. DOM-free.
import { motifColor } from './score.ts';
import type { Family, Score } from './score.ts';
import { axisTicks } from './axis.ts';
import type { AxisTick } from './axis.ts';
import { sectionTimes } from './tempo.ts';
import type { TempoMap } from './tempo.ts';
import { timeToX } from './zoom.ts';
import type { View } from './zoom.ts';

export interface Rect { x: number; y: number; w: number; h: number }
export const TIMELINE = { energyH: 48, sectionH: 28, laneH: 36, ribbonH: 6, notePad: 6, noteH: 3 } as const;

/** The y of a pitch inside a band from top to top + h, scaled to lo..hi (a higher pitch is higher); the band's middle when lo === hi. */
export function pitchY(pitch: number, lo: number, hi: number, top: number, h: number): number {
  return hi === lo ? top + h / 2 : top + (1 - (pitch - lo) / (hi - lo)) * h;
}

export interface TimelineLayout {
  height: number;
  energy: { rect: Rect; points: [number, number][] };            // pixel points, y = energyH * (1 - value)
  sections: { id: string; name: string; color: string; from: number; to: number; rect: Rect }[];  // from and to in seconds
  lanes: { id: string; name: string; icon: Family; color: string; rect: Rect }[];   // rect spans the view width
  ribbons: { motif: string; character: string; color: string; lane: string; rect: Rect }[]; // at the bottom of their lane; character is the character id, color that character's colour from the score
  notes: { index: number; lane: string; color: string; rect: Rect }[];   // every note in its lane, scaled to that lane's pitch range; color is the lane's colour
  glow: [number, number][];                                             // the energy as a closed polygon over the full drawing height
  ticks: AxisTick[];                                             // the time axis: visible bar starts (music) or seconds ticks (sound)
}

export function layoutTimeline(score: Score, tempo: TempoMap, view: View): TimelineLayout {
  const { energyH, sectionH, laneH, ribbonH, notePad, noteH } = TIMELINE;
  const lanesTop = energyH + sectionH;
  const span = (from: number, to: number): { x: number; w: number } => ({ x: timeToX(view, from), w: (to - from) * view.pxPerSec });

  const sections = score.sections.map(s => {
    const { from, to } = sectionTimes(s, tempo, score.duration);
    return { id: s.id, name: s.name, color: s.color, from, to, rect: { ...span(from, to), y: energyH, h: sectionH } };
  });
  const lanes = score.lanes.map((l, i) => ({ id: l.id, name: l.name, icon: l.icon, color: l.color, rect: { x: 0, y: lanesTop + i * laneH, w: view.width, h: laneH } }));
  const ribbons = score.motifs.flatMap(m => {
    const color = motifColor(score, m);
    return m.spans.flatMap(s => {
      const lane = lanes.find(l => l.id === s.lane);
      return lane ? [{ motif: m.id, character: m.character, color, lane: s.lane, rect: { ...span(s.from, s.to), y: lane.rect.y + laneH - ribbonH, h: ribbonH } }] : [];
    });
  });
  const height = lanesTop + lanes.length * laneH;
  const notes = lanes.flatMap(lane => {
    const mine = score.notes.map((n, index) => ({ n, index })).filter(x => x.n.lane === lane.id);
    if (mine.length === 0) return [];
    const lo = Math.min(...mine.map(x => x.n.pitch));
    const hi = Math.max(...mine.map(x => x.n.pitch));
    return mine.map(({ n, index }) => ({
      index, lane: lane.id, color: lane.color,
      rect: { ...span(n.start, n.start + n.length), y: pitchY(n.pitch, lo, hi, lane.rect.y + notePad, laneH - 2 * notePad) - noteH / 2, h: noteH },
    }));
  }).sort((a, b) => a.index - b.index);
  const curve = score.energy.map(([t, v]): [number, number] => [timeToX(view, t), height * (1 - v)]);
  const last = curve[curve.length - 1];
  const glow: [number, number][] = last ? [...curve, [last[0], height], [curve[0]![0], height]] : [];
  return {
    height,
    energy: { rect: { x: 0, y: 0, w: view.width, h: energyH }, points: score.energy.map(([t, v]): [number, number] => [timeToX(view, t), energyH * (1 - v)]) },
    sections,
    lanes,
    ribbons,
    notes,
    glow,
    ticks: axisTicks(score, tempo, view),
  };
}
