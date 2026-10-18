// The piano roll: notes as bars, pitch up, time across, drawn on the same view
// as the timeline. A sound piece may have no notes. DOM-free.
import type { Score } from './score.ts';
import { motifColor } from './score.ts';
import type { TempoMap } from './tempo.ts';
import { timeToX, xToTime } from './zoom.ts';
import type { View } from './zoom.ts';
import type { Rect } from './timeline.ts';
import type { Hit } from './hit.ts';

export const ROLL = { minRowH: 4, maxRowH: 14 } as const;
export interface RollLayout {
  low: number; high: number; rowH: number; height: number;
  rows: { pitch: number; y: number; name: string; black: boolean }[];
  notes: { index: number; lane: string; motif: string | null; color: string; rect: Rect }[]; // index into score.notes
}

const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;
const BLACK = new Set([1, 3, 6, 8, 10]);

export function pitchName(midi: number): string {
  return `${NAMES[((midi % 12) + 12) % 12]}${Math.floor(midi / 12) - 1}`;
}

/** A pitch label is about this tall; two labels closer than this would overprint. */
export const LABEL_H = 12;

/** The rows that carry a pitch name: every C, plus the top and bottom rows (so a range with no C is still labelled) unless a C is already closer than a label's height. */
export function labelRows(roll: RollLayout): RollLayout['rows'] {
  const cs = roll.rows.filter(r => r.pitch % 12 === 0);
  const ends = [roll.rows[0], roll.rows.at(-1)].filter((r): r is RollLayout['rows'][number] => r !== undefined && r.pitch % 12 !== 0);
  const clear = ends.filter(r => !cs.some(c => Math.abs(c.y - r.y) < LABEL_H));
  const distinct = clear.length === 2 && Math.abs(clear[0]!.y - clear[1]!.y) < LABEL_H ? clear.slice(0, 1) : clear;
  return roll.rows.filter(r => cs.includes(r) || distinct.includes(r));
}

/** Pitch range = the shown notes' lowest - 1 .. highest + 1; higher pitch is higher (smaller y); colour = the motif's character colour from the score (motifColor), else lane colour. rowH is the row height clamped to ROLL's range and height is rows * rowH. With no shown notes (a sound piece may have none) rows and notes are empty and rowH and height are 0. */
export function layoutRoll(score: Score, view: View, height: number, lanes?: ReadonlySet<string>): RollLayout {
  const shown = score.notes.map((n, index) => ({ n, index })).filter(({ n }) => !lanes || lanes.has(n.lane));
  if (shown.length === 0) return { low: 0, high: 0, rowH: 0, height: 0, rows: [], notes: [] };
  const low = Math.min(...shown.map(s => s.n.pitch)) - 1;
  const high = Math.max(...shown.map(s => s.n.pitch)) + 1;
  const count = high - low + 1;
  const rowH = Math.min(ROLL.maxRowH, Math.max(ROLL.minRowH, height / count));
  const rows = [];
  for (let pitch = high; pitch >= low; pitch--) {
    rows.push({ pitch, y: (high - pitch) * rowH, name: pitchName(pitch), black: BLACK.has(((pitch % 12) + 12) % 12) });
  }
  const notes = shown.map(({ n, index }) => {
    const motif = n.motif === null ? undefined : score.motifs.find(m => m.id === n.motif);
    const lane = score.lanes.find(l => l.id === n.lane);
    return {
      index, lane: n.lane, motif: n.motif,
      color: motif ? motifColor(score, motif) : (lane?.color ?? '#888888'),
      rect: { x: timeToX(view, n.start), y: (high - n.pitch) * rowH, w: n.length * view.pxPerSec, h: rowH },
    };
  });
  return { low, high, rowH, height: count * rowH, rows, notes };
}

/** A note's hit area is at least this wide and tall around its centre, so a note a pixel or two across can still be tapped. */
export const MIN_HIT_PX = 24;

/** What is under a pixel: the time and bar (null on a sound piece), the row's pitch, and the note if any. A point inside a note's rect finds that note; otherwise the note whose centre is nearest among those whose padded area (at least MIN_HIT_PX square) holds the point. */
export function hitRoll(roll: RollLayout, view: View, tempo: TempoMap, score: Score, x: number, y: number): Hit & { pitch: number | null; noteIndex: number | null } {
  const time = Math.min(score.duration, Math.max(0, xToTime(view, x)));
  const row = roll.rows.find(r => y >= r.y && y < r.y + roll.rowH);
  const nearest = (pad: boolean): RollLayout['notes'][number] | undefined => {
    let best: RollLayout['notes'][number] | undefined;
    let bestD = Infinity;
    for (const n of roll.notes) {
      const r = n.rect;
      const w = pad ? Math.max(r.w, MIN_HIT_PX) : r.w;
      const h = pad ? Math.max(r.h, MIN_HIT_PX) : r.h;
      const cx = r.x + r.w / 2;
      const cy = r.y + r.h / 2;
      if (x < cx - w / 2 || x >= cx + w / 2 || y < cy - h / 2 || y >= cy + h / 2) continue;
      const d = Math.hypot(x - cx, y - cy);
      if (d <= bestD) { best = n; bestD = d; }
    }
    return best;
  };
  const note = nearest(false) ?? nearest(true);
  return {
    time, bar: tempo.barAt(time), zone: note ? 'lanes' : 'none', laneId: note?.lane ?? null, sectionId: null,
    pitch: row?.pitch ?? null, noteIndex: note?.index ?? null,
  };
}

/** The piano roll's drawing height. */
export const ROLL_H = 280;
