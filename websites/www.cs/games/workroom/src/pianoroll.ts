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

/** Pitch range = the shown notes' lowest - 1 .. highest + 1; higher pitch is higher (smaller y); colour = the motif's character colour from the score (motifColor), else lane colour. With no shown notes (a sound piece may have none) rows and notes are empty and rowH is 0. */
export function layoutRoll(score: Score, view: View, height: number, lanes?: ReadonlySet<string>): RollLayout {
  const shown = score.notes.map((n, index) => ({ n, index })).filter(({ n }) => !lanes || lanes.has(n.lane));
  if (shown.length === 0) return { low: 0, high: 0, rowH: 0, height, rows: [], notes: [] };
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

/** What is under a pixel: the time and bar (null on a sound piece), the row's pitch, and the note if any (the later-drawn one on top). */
export function hitRoll(roll: RollLayout, view: View, tempo: TempoMap, score: Score, x: number, y: number): Hit & { pitch: number | null; noteIndex: number | null } {
  const time = Math.min(score.duration, Math.max(0, xToTime(view, x)));
  const row = roll.rows.find(r => y >= r.y && y < r.y + roll.rowH);
  let note: RollLayout['notes'][number] | undefined;
  for (const n of roll.notes) {
    const r = n.rect;
    if (x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h) note = n;
  }
  return {
    time, bar: tempo.barAt(time), zone: note ? 'lanes' : 'none', laneId: note?.lane ?? null, sectionId: null,
    pitch: row?.pitch ?? null, noteIndex: note?.index ?? null,
  };
}
