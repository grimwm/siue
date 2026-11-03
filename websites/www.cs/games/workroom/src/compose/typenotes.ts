// Type Notes: the computer keyboard adds notes at a fixed step, the way step entry works in music programs. The home
// row and the row above are an octave and a bit from a C (A is C, W is C♯, … L is the D above); with Stay In Key on, a
// key outside the piece's key plays the nearest key note below it. Keys are read by their place (KeyboardEvent.code).
// DOM-free.
import { inKey } from './chords.ts';
import type { KeyOf } from './chords.ts';
import type { EditDoc } from './doc.ts';
import { addNotes } from './edit.ts';
import { KEY_SEMITONE } from './keys.ts';
import { fitRegions } from './regions.ts';

const EPS = 1e-6;

/** Each typing key's semitone above the keyboard's C: KeyA 0 to KeyL 14. */
export const TYPE_KEYS: Readonly<Record<string, number>> = Object.fromEntries(
  Object.entries(KEY_SEMITONE).filter(([code]) => code !== 'KeyP' && code !== 'Semicolon'),
);

/**
 * The pitch a typing key plays: the C at or above `low` plus the key's semitone; with `stayInKey` and a key, a pitch
 * outside the key moves down to the nearest one in it. Null for a key that plays none, or a pitch off the keyboard.
 */
export function typedPitch(code: string, low: number, key?: KeyOf, stayInKey?: boolean): number | null {
  const s = TYPE_KEYS[code];
  if (s === undefined) return null;
  let p = low + ((12 - (((low % 12) + 12) % 12)) % 12) + s;
  if (stayInKey && key) while (!inKey(p, key)) p--;
  return p >= 0 && p <= 127 ? p : null;
}

/** A note of `pitch` added at `at` for `length` beats, unless one of that pitch already starts there. */
export function typeNote(doc: EditDoc, part: string, pitch: number, at: number, length: number): { doc: EditDoc; added: boolean } {
  const p = doc.parts.find(x => x.id === part);
  if (!p || p.vocal || p.notes.some(n => n.pitch === pitch && Math.abs(n.start - at) < EPS)) return { doc, added: false };
  return { doc: fitRegions(addNotes(doc, part, [{ start: Math.max(0, at), length, pitch }]).doc), added: true };
}

/** Every note of the part that starts at `at` gone. */
export function clearStep(doc: EditDoc, part: string, at: number): EditDoc {
  const p = doc.parts.find(x => x.id === part);
  if (!p?.notes.some(n => Math.abs(n.start - at) < EPS)) return doc;
  return { ...doc, parts: doc.parts.map(x => (x.id === part ? { ...x, notes: x.notes.filter(n => Math.abs(n.start - at) >= EPS) } : x)) };
}
