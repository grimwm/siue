// Every edit the editor makes, as a pure function from one document to the next (history.ts keeps them for Undo). An
// edit replaces only the part it touches, so documents share the rest. No edit ever refuses or moves a note on its
// own: a note outside its instrument's range stays where it was put, coloured; moveIntoRange is the person's choice.
// DOM-free.
import { laneFamily, rangeClass } from '../catalogue.ts';
import type { Entry } from '../catalogue.ts';
import type { EditDoc, EditNote, Part } from './doc.ts';
import { NEW_VELOCITY } from './doc.ts';

/** The score's limit of lanes, which the editor keeps. */
export const MAX_PARTS = 16;
/** New parts' colours, in turn. */
export const PART_COLOURS = ['#7a9cc6', '#c98b3a', '#7a8f6a', '#b0a6d6', '#d4a72c', '#a0603a', '#5aa6a0', '#c46b8a', '#8a7fb0', '#6b8f3a', '#c45a4c', '#4f86c6'] as const;

export type NewNote = Omit<EditNote, 'id' | 'velocity' | 'motif'> & Partial<Pick<EditNote, 'velocity' | 'motif'>>;

function withPart(doc: EditDoc, id: string, change: (p: Part) => Part): EditDoc {
  return { ...doc, parts: doc.parts.map(p => (p.id === id ? change(p) : p)) };
}
const sorted = (notes: EditNote[]): EditNote[] => [...notes].sort((a, b) => a.start - b.start || a.pitch - b.pitch);

/** Adds notes to a part (a chord is several at one start); returns the document and the new notes' ids. */
export function addNotes(doc: EditDoc, part: string, notes: readonly NewNote[]): { doc: EditDoc; ids: number[] } {
  let next = doc.nextId;
  const made = notes.map(n => ({ id: next++, start: n.start, length: n.length, pitch: n.pitch, velocity: n.velocity ?? NEW_VELOCITY, motif: n.motif ?? null }));
  if (made.length === 0) return { doc, ids: [] };
  return { doc: { ...withPart(doc, part, p => ({ ...p, notes: sorted([...p.notes, ...made]) })), nextId: next }, ids: made.map(n => n.id) };
}

export function removeNotes(doc: EditDoc, part: string, ids: ReadonlySet<number>): EditDoc {
  return withPart(doc, part, p => ({ ...p, notes: p.notes.filter(n => !ids.has(n.id)) }));
}

/** Moves a note to a new start (never before the piece) and pitch (kept to MIDI's 0–127). */
export function moveNote(doc: EditDoc, part: string, id: number, start: number, pitch: number): EditDoc {
  return withPart(doc, part, p => ({ ...p, notes: sorted(p.notes.map(n => (n.id === id ? { ...n, start: Math.max(0, start), pitch: Math.min(127, Math.max(0, Math.round(pitch))) } : n))) }));
}

/** Sets a note's length; a length is always above 0 (`min`, the grid's finest step). */
export function resizeNote(doc: EditDoc, part: string, id: number, length: number, min: number): EditDoc {
  return withPart(doc, part, p => ({ ...p, notes: p.notes.map(n => (n.id === id ? { ...n, length: Math.max(min, length) } : n)) }));
}

export function clearPart(doc: EditDoc, part: string): EditDoc {
  return withPart(doc, part, p => ({ ...p, notes: [] }));
}

const slug = (name: string): string => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'part';

/** Adds a part playing `entry`, named for it ("Cello", then "Cello 2"); null at the 16-part limit. */
export function addPart(doc: EditDoc, entry: Entry): { doc: EditDoc; id: string } | null {
  if (doc.parts.length >= MAX_PARTS) return null;
  const names = new Set(doc.parts.map(p => p.name));
  const ids = new Set(doc.parts.map(p => p.id));
  let n = 1;
  const name = (k: number): string => (k === 1 ? entry.name : `${entry.name} ${k}`);
  while (names.has(name(n))) n++;
  let id = slug(name(n));
  for (let k = 2; ids.has(id); k++) id = `${slug(entry.name)}-${k}`;
  const family = laneFamily(entry);
  const part: Part = { id, name: name(n), color: PART_COLOURS[doc.parts.length % PART_COLOURS.length]!, family, icon: family,
    instrument: entry.id, gain_db: 0, attack: entry.attack, release: entry.release, notes: [] };
  return { doc: { ...doc, parts: [...doc.parts, part] }, id };
}

export function removePart(doc: EditDoc, part: string): EditDoc {
  return { ...doc, parts: doc.parts.filter(p => p.id !== part) };
}

export function renamePart(doc: EditDoc, part: string, name: string): EditDoc {
  const clean = name.trim().slice(0, 60);
  return clean === '' ? doc : withPart(doc, part, p => ({ ...p, name: clean }));
}

export function recolourPart(doc: EditDoc, part: string, color: string): EditDoc {
  return /^#[0-9a-f]{6}$/.test(color) ? withPart(doc, part, p => ({ ...p, color })) : doc;
}

/** Plays the part on another instrument: its notes stay exactly where they are, now coloured for the new range. */
export function setInstrument(doc: EditDoc, part: string, entry: Entry): EditDoc {
  const family = laneFamily(entry);
  return withPart(doc, part, p => ({ ...p, instrument: entry.id, family, icon: family, attack: entry.attack, release: entry.release }));
}

/** The pitch a whole number of octaves away that `entry` plays normally, else as an expert; the pitch itself when none is. */
export function intoRange(entry: Entry, pitch: number): number {
  if (entry.pieces || rangeClass(entry, pitch) !== 'out') return pitch;
  for (const want of ['normal', 'expert'] as const) {
    for (let k = 1; k <= 10; k++) {
      for (const p of [pitch + 12 * k, pitch - 12 * k]) if (p >= 0 && p <= 127 && rangeClass(entry, p) === want) return p;
    }
  }
  return pitch;
}

/** "Move Them Into Range": each red note of the part by whole octaves into the instrument's range. Drums are untouched. */
export function moveIntoRange(doc: EditDoc, part: string, entry: Entry): EditDoc {
  return withPart(doc, part, p => ({ ...p, notes: p.notes.map(n => {
    const to = intoRange(entry, n.pitch);
    return to === n.pitch ? n : { ...n, pitch: to };
  }) }));
}
