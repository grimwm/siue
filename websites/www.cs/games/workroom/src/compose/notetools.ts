// The note selection tools of the piano roll: pick the notes in a box, move them up or down (never off the keyboard)
// or along the timeline (never before the piece), duplicate them straight after themselves, line their starts up with
// the grid, set how hard they are played, and copy and paste them. Ids are the EditNote ids of one part. Every edit
// that moves or adds notes fits the part's regions to them (regions.ts). DOM-free.
import type { EditDoc, EditNote, Part } from './doc.ts';
import { fitRegions } from './regions.ts';

const EPS = 1e-6;
const round = (x: number): number => Math.round(x * 1e6) / 1e6;
const sortNotes = (notes: EditNote[]): EditNote[] => [...notes].sort((a, b) => a.start - b.start || a.pitch - b.pitch);

/** A selection box: beats `from` to `to`, and pitches `low` to `high` inclusive (a drum part's rows are pitches too). */
export interface Box { from: number; to: number; low: number; high: number }
/** Copied notes: their span in beats and each note with its start from the earliest one's. */
export interface NoteClip { kind: 'notes'; drums: boolean; span: number; notes: Omit<EditNote, 'id'>[] }

const partOf = (doc: EditDoc, id: string): Part | undefined => doc.parts.find(p => p.id === id);
function withNotes(doc: EditDoc, part: string, change: (notes: EditNote[]) => EditNote[]): EditDoc {
  return { ...doc, parts: doc.parts.map(p => (p.id === part ? { ...p, notes: sortNotes(change(p.notes)) } : p)) };
}
const picked = (doc: EditDoc, part: string, ids: ReadonlySet<number>): EditNote[] => (partOf(doc, part)?.notes ?? []).filter(n => ids.has(n.id));

/** The ids of the notes the box touches: any part of the note inside its beats, its pitch inside its rows. */
export function notesInBox(notes: readonly EditNote[], box: Box): number[] {
  const [from, to] = box.from <= box.to ? [box.from, box.to] : [box.to, box.from];
  const [low, high] = box.low <= box.high ? [box.low, box.high] : [box.high, box.low];
  return notes.filter(n => n.start < to - EPS && n.start + n.length > from + EPS && n.pitch >= low && n.pitch <= high).map(n => n.id);
}

/** The chosen notes moved by `semitones`, the move shortened so that every one stays between 0 and 127. */
export function transposeNotes(doc: EditDoc, part: string, ids: ReadonlySet<number>, semitones: number): EditDoc {
  const sel = picked(doc, part, ids);
  if (!sel.length) return doc;
  const lo = Math.min(...sel.map(n => n.pitch));
  const hi = Math.max(...sel.map(n => n.pitch));
  const by = Math.round(Math.max(-lo, Math.min(127 - hi, semitones)));
  if (by === 0) return doc;
  return withNotes(doc, part, notes => notes.map(n => (ids.has(n.id) ? { ...n, pitch: n.pitch + by } : n)));
}

/** The chosen notes moved by `beats` along the timeline, the move shortened so that none starts before the piece. */
export function shiftNotes(doc: EditDoc, part: string, ids: ReadonlySet<number>, beats: number): EditDoc {
  const sel = picked(doc, part, ids);
  if (!sel.length) return doc;
  const by = Math.max(-Math.min(...sel.map(n => n.start)), beats);
  if (Math.abs(by) < EPS) return doc;
  return fitRegions(withNotes(doc, part, notes => notes.map(n => (ids.has(n.id) ? { ...n, start: round(n.start + by) } : n))));
}

/** Copies of the chosen notes straight after them: moved by their span, rounded up to a whole `beat` step. The copies' ids. */
export function duplicateNotes(doc: EditDoc, part: string, ids: ReadonlySet<number>, beat: number): { doc: EditDoc; ids: number[] } {
  const sel = picked(doc, part, ids);
  if (!sel.length) return { doc, ids: [] };
  const first = Math.min(...sel.map(n => n.start));
  const span = Math.max(...sel.map(n => n.start + n.length)) - first;
  const step = beat > 0 ? beat : 1;
  const by = Math.max(1, Math.ceil(span / step - EPS)) * step;
  let next = doc.nextId;
  const made = sel.map((n): EditNote => ({ ...n, id: next++, start: round(n.start + by) }));
  return { doc: fitRegions({ ...withNotes(doc, part, notes => [...notes, ...made]), nextId: next }), ids: made.map(n => n.id) };
}

/** The chosen notes' starts moved to the nearest `step` (null: every note of the part); their lengths stay. */
export function fixTiming(doc: EditDoc, part: string, ids: ReadonlySet<number> | null, step: number): EditDoc {
  if (!(step > 0)) return doc;
  const chosen = (n: EditNote) => ids === null || ids.has(n.id);
  const notes = partOf(doc, part)?.notes ?? [];
  if (!notes.some(n => chosen(n) && Math.abs(Math.round(n.start / step) * step - n.start) > EPS)) return doc;
  return fitRegions(withNotes(doc, part, ns => ns.map(n => (chosen(n) ? { ...n, start: round(Math.round(n.start / step) * step) } : n))));
}

/** The chosen notes played at `velocity`, 1 to 127. */
export function setVelocity(doc: EditDoc, part: string, ids: ReadonlySet<number>, velocity: number): EditDoc {
  const v = Math.round(Math.min(127, Math.max(1, velocity)));
  if (!picked(doc, part, ids).some(n => n.velocity !== v)) return doc;
  return withNotes(doc, part, notes => notes.map(n => (ids.has(n.id) ? { ...n, velocity: v } : n)));
}

/** The chosen notes as a clip, or null when none is chosen. */
export function copyNotes(doc: EditDoc, part: string, ids: ReadonlySet<number>, drums: boolean): NoteClip | null {
  const sel = picked(doc, part, ids);
  if (!sel.length) return null;
  const first = Math.min(...sel.map(n => n.start));
  return {
    kind: 'notes', drums, span: round(Math.max(...sel.map(n => n.start + n.length)) - first),
    notes: sortNotes(sel).map(({ id: _, ...n }) => ({ ...n, start: round(n.start - first), ...(n.bend ? { bend: n.bend.map(([f, c]): [number, number] => [f, c]) } : {}) })),
  };
}

/** A clip's notes added with the earliest at `at` (never before the piece); the new notes' ids. */
export function pasteNotes(doc: EditDoc, part: string, clip: NoteClip, at: number): { doc: EditDoc; ids: number[] } {
  if (!partOf(doc, part) || partOf(doc, part)!.vocal || !clip.notes.length) return { doc, ids: [] };
  let next = doc.nextId;
  const from = Math.max(0, at);
  const made = clip.notes.map((n): EditNote => ({ ...n, id: next++, start: round(from + n.start) }));
  return { doc: fitRegions({ ...withNotes(doc, part, notes => [...notes, ...made]), nextId: next }), ids: made.map(n => n.id) };
}
