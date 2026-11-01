// The editing grid: which rows a part shows (a pitched instrument's range, a drum part's own pieces), where each note
// sits, and which beat and row a point is on. A note on a key the instrument cannot play still gets a row, drawn red:
// nothing the person put in is ever hidden. DOM-free.
import { rangeClass } from '../catalogue.ts';
import type { Entry } from '../catalogue.ts';
import { pitchName } from '../pianoroll.ts';
import type { EditNote } from './doc.ts';

export interface GridRow { pitch: number; name: string; black: boolean; range: 'normal' | 'expert' | 'out' }
export interface GridLayout { rows: GridRow[]; rowH: number; beatW: number; beats: number }
export interface Rect { x: number; y: number; w: number; h: number }

const BLACK = new Set([1, 3, 6, 8, 10]);
const row = (entry: Entry, pitch: number, name?: string): GridRow =>
  ({ pitch, name: name ?? pitchName(pitch), black: !entry.pieces && BLACK.has(pitch % 12), range: rangeClass(entry, pitch) });

/**
 * The rows, highest first. A pitched part: its expert range, at least an octave either side of its home note, and
 * every pitch its notes use. A drum part: its pieces (the lowest-numbered at the bottom) and a red row for any note
 * on another key.
 */
export function gridRows(entry: Entry, notes: readonly EditNote[]): GridRow[] {
  const used = notes.map(n => n.pitch);
  if (entry.pieces) {
    const pieces = new Map(entry.pieces.map(([p, name]) => [p, name] as const));
    const pitches = [...new Set([...pieces.keys(), ...used])].sort((a, b) => b - a);
    return pitches.map(p => row(entry, p, pieces.get(p) ?? `${pitchName(p)} (no drum)`));
  }
  const home = entry.home ?? 60;
  const range = entry.expert ?? entry.range ?? [home - 12, home + 12];
  const low = Math.max(0, Math.min(range[0], home - 12, ...used));
  const high = Math.min(127, Math.max(range[1], home + 12, ...used));
  const rows: GridRow[] = [];
  for (let p = high; p >= low; p--) rows.push(row(entry, p));
  return rows;
}

export function rowIndex(layout: GridLayout, pitch: number): number {
  return layout.rows.findIndex(r => r.pitch === pitch);
}

export function noteRect(layout: GridLayout, note: Pick<EditNote, 'start' | 'length' | 'pitch'>): Rect | null {
  const i = rowIndex(layout, note.pitch);
  if (i < 0) return null;
  return { x: note.start * layout.beatW, y: i * layout.rowH, w: Math.max(2, note.length * layout.beatW), h: layout.rowH };
}

/** The beat and row under (x, y), or null outside the rows. */
export function cellAt(layout: GridLayout, x: number, y: number): { beat: number; pitch: number } | null {
  const r = layout.rows[Math.floor(y / layout.rowH)];
  if (!r || x < 0) return null;
  return { beat: x / layout.beatW, pitch: r.pitch };
}
