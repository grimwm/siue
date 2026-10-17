// Each character's tune drawn as stars over its lane: one star per note of a
// motif span (the notes of that lane between the span's from and to), left
// to right in time, higher for a higher pitch (on the lane's own pitch scale,
// the one its note bars use, so each star sits on its note and a repeated
// tune keeps its shape), bigger for a louder note, joined in time order. A span with no notes in its lane keeps its ribbon. DOM-free.
import { motifColor } from './score.ts';
import type { Score } from './score.ts';
import { TIMELINE } from './timeline.ts';
import type { Rect, TimelineLayout } from './timeline.ts';
import { timeToX } from './zoom.ts';
import type { View } from './zoom.ts';

/** Star radii in pixels: small, middle, big. */
export const STAR_R = [2.5, 3.5, 5] as const;
export type StarSize = 0 | 1 | 2;

/** Velocity under 64 is a small star, under 96 a middle one, else a big one. */
export function starSize(velocity: number): StarSize {
  return velocity < 64 ? 0 : velocity < 96 ? 1 : 2;
}

export interface Star { note: number; x: number; y: number; size: StarSize }   // note: index into score.notes
export interface Constellation { motif: string; character: string; name: string; color: string; lane: string; from: number; to: number; stars: Star[]; ribbon: Rect | null }

export function layoutConstellations(score: Score, layout: TimelineLayout, view: View): Constellation[] {
  const { laneH, ribbonH, noteH } = TIMELINE;
  const barOf = new Map(layout.notes.map(n => [n.index, n.rect]));
  return score.motifs.flatMap(m => {
    const color = motifColor(score, m);
    const name = score.characters.find(c => c.id === m.character)?.name ?? m.character;
    return m.spans.flatMap((s): Constellation[] => {
      const lane = layout.lanes.find(l => l.id === s.lane);
      if (!lane) return [];
      const base = { motif: m.id, character: m.character, name, color, lane: s.lane, from: s.from, to: s.to };
      const notes = score.notes.map((n, i) => ({ n, i }))
        .filter(({ n }) => n.lane === s.lane && n.start >= s.from && n.start < s.to)
        .sort((a, b) => a.n.start - b.n.start || a.i - b.i);
      if (notes.length === 0) {
        return [{ ...base, stars: [], ribbon: { x: timeToX(view, s.from), y: lane.rect.y + laneH - ribbonH, w: (s.to - s.from) * view.pxPerSec, h: ribbonH } }];
      }
      const stars = notes.map(({ n, i }): Star => ({ note: i, x: timeToX(view, n.start), y: (barOf.get(i)?.y ?? 0) + noteH / 2, size: starSize(n.velocity) }));
      return [{ ...base, stars, ribbon: null }];
    });
  });
}
