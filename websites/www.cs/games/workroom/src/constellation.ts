// Each character's tune drawn as stars over its lane: one star per note of a
// motif span (the notes of that lane between the span's from and to), left
// to right in time, higher for a higher pitch (on the lane's own pitch scale,
// the one its note blocks use, so each star sits on its note and a repeated
// tune keeps its shape), bigger for a louder note. A span with no notes in its
// lane keeps its ribbon. DOM-free.
//
// The lines are kept calm: they join only the tune's top line (a note that
// starts under a higher note still sounding, or under a higher note of its own
// chord, is accompaniment: a star with no line), each link is a curve that never
// bulges above or below its two stars, and a link is quiet (drawn only while its
// constellation is hovered, tapped or focused) when it leaps more than an
// octave, comes after a silence longer than twice the tune's usual step, or
// would pass through another star.
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
/** A line between two stars (from and to index the constellation's stars); d is its curve as an SVG path; a quiet link is drawn only while its constellation is picked. */
export interface Link { from: number; to: number; strong: boolean; d: string }
export interface Constellation { motif: string; character: string; name: string; color: string; lane: string; from: number; to: number; stars: Star[]; links: Link[]; ribbon: Rect | null }

/** A leap of more semitones than this is a quiet link. */
export const QUIET_LEAP = 12;
/** A link after a silence longer than this many times the tune's median step (start to start) is a quiet one. */
export const QUIET_REST = 2;
/** A link passing closer than this many pixels to the edge of another star is a quiet one. */
export const STAR_CLEARANCE = 1.5;

interface Timed { start: number; length: number; pitch: number }

/** The tune's top line: the indices (into notes, which are in start order) of every note that no higher note of the list is sounding over when it starts (one that started earlier and has not ended, or one starting with it). */
export function topLine(notes: readonly Timed[]): number[] {
  return notes.flatMap((n, i) => notes.some((o, j) => j !== i && o.pitch > n.pitch && o.start <= n.start && n.start < o.start + o.length) ? [] : [i]);
}

const r2 = (v: number): number => Math.round(v * 100) / 100;

/** Slopes for a curve through the points that never overshoots (Fritsch–Carlson): flat at a peak or a valley, never steeper than three times either neighbouring segment. */
function slopes(pts: readonly { x: number; y: number }[]): number[] {
  const d = pts.slice(1).map((p, i) => (p.x === pts[i]!.x ? 0 : (p.y - pts[i]!.y) / (p.x - pts[i]!.x)));
  return pts.map((_, i) => {
    const a = d[i - 1];
    const b = d[i];
    if (a === undefined) return b ?? 0;
    if (b === undefined) return a;
    if (a * b <= 0) return 0;
    return (2 * a * b) / (a + b);
  });
}

/** The distance from point p to the segment a–b. */
function toSegment(p: { x: number; y: number }, a: { x: number; y: number }, b: { x: number; y: number }): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = dx * dx + dy * dy;
  const t = len === 0 ? 0 : Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / len));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

function median(xs: number[]): number {
  if (xs.length === 0) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m]! : (s[m - 1]! + s[m]!) / 2;
}

/** The links of one constellation's stars (notes are the stars' notes, in the same order); obstacles are every star drawn in the lane. */
function linksOf(stars: readonly Star[], notes: readonly Timed[], obstacles: readonly Star[]): Link[] {
  const line = topLine(notes);
  const pts = line.map(i => stars[i]!);
  const m = slopes(pts);
  const steps = line.slice(1).map((i, k) => notes[i]!.start - notes[line[k]!]!.start);
  const usual = median(steps);
  return line.slice(1).map((to, k) => {
    const from = line[k]!;
    const a = stars[from]!;
    const b = stars[to]!;
    const na = notes[from]!;
    const nb = notes[to]!;
    const third = (b.x - a.x) / 3;
    const d = `M${r2(a.x)} ${r2(a.y)} C${r2(a.x + third)} ${r2(a.y + m[k]! * third)} ${r2(b.x - third)} ${r2(b.y - m[k + 1]! * third)} ${r2(b.x)} ${r2(b.y)}`;
    const leap = Math.abs(nb.pitch - na.pitch) > QUIET_LEAP;
    const rest = nb.start - (na.start + na.length) > QUIET_REST * usual;
    const blocked = obstacles.some(o => o !== a && o !== b && o.x > a.x && o.x < b.x && toSegment(o, a, b) < STAR_R[o.size] + STAR_CLEARANCE);
    return { from, to, strong: !leap && !rest && !blocked, d };
  });
}

export function layoutConstellations(score: Score, layout: TimelineLayout, view: View): Constellation[] {
  const { laneH, ribbonH, noteH } = TIMELINE;
  const barOf = new Map(layout.notes.map(n => [n.index, n.rect]));
  const drawn = score.motifs.flatMap(m => {
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
        return [{ ...base, stars: [], links: [], ribbon: { x: timeToX(view, s.from), y: lane.rect.y + laneH - ribbonH, w: (s.to - s.from) * view.pxPerSec, h: ribbonH } }];
      }
      const stars = notes.map(({ n, i }): Star => ({ note: i, x: timeToX(view, n.start), y: (barOf.get(i)?.y ?? 0) + noteH / 2, size: starSize(n.velocity) }));
      return [{ ...base, stars, links: [], ribbon: null }];
    });
  });
  // The links need every star of the lane drawn first: any of them can be in a line's way.
  const byLane = new Map<string, Star[]>();
  for (const c of drawn) byLane.set(c.lane, [...(byLane.get(c.lane) ?? []), ...c.stars]);
  for (const c of drawn) {
    if (c.stars.length > 1) c.links = linksOf(c.stars, c.stars.map(st => score.notes[st.note]!), byLane.get(c.lane) ?? []);
  }
  return drawn;
}

/** The index of the constellation with a star nearest (x, y), when that star is within reach pixels; else null. */
export function nearestConstellation(cs: readonly Constellation[], x: number, y: number, reach: number): number | null {
  let best: number | null = null;
  let bestD = reach;
  cs.forEach((c, i) => {
    for (const s of c.stars) {
      const d = Math.hypot(s.x - x, s.y - y);
      if (d <= bestD) { bestD = d; best = i; }
    }
  });
  return best;
}
