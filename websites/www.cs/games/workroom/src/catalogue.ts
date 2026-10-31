// The composer's instrument catalogue, read out of the shared sample library (music/library/library.json): each instrument's
// category, ranges, clef, written pitch, General MIDI program and drum pieces. DOM-free.
import type { Library, LibraryInstrument } from './render/plan.ts';
import type { Family, Sound } from './score.ts';

export type Category = 'strings' | 'woodwinds' | 'brass' | 'keys' | 'pitched' | 'drums' | 'voices';
export type Clef = 'treble' | 'alto' | 'bass' | 'grand' | 'percussion';

/** The instrument picker's groups, in picker order, with the lane family a new part of that group takes. */
export const CATEGORIES: readonly { id: Category; label: string; family: Family }[] = [
  { id: 'strings', label: 'Strings', family: 'strings' },
  { id: 'woodwinds', label: 'Woodwinds', family: 'woodwinds' },
  { id: 'brass', label: 'Brass', family: 'brass' },
  { id: 'keys', label: 'Keyboards', family: 'keys' },
  { id: 'pitched', label: 'Pitched Percussion', family: 'percussion' },
  { id: 'drums', label: 'Drums & Percussion', family: 'percussion' },
  { id: 'voices', label: 'Voices', family: 'choir' },
];
const CLEFS: readonly Clef[] = ['treble', 'alto', 'bass', 'grand', 'percussion'];

/**
 * One instrument as the editor shows it. `range` and `expert` are inclusive MIDI pitches (null for drums), `written` is the
 * semitones added to the sounding pitch to give the written one, `gm` the General MIDI program counted from 1, and `pieces`
 * a drum part's rows as [General MIDI note, name]. `standin` names the instrument whose samples play instead.
 */
export interface Entry {
  id: string; name: string; category: Category; range: [number, number] | null; expert: [number, number] | null; home: number | null;
  clef: Clef; written: number; gm: number; gmName: string; pieces: [number, string][] | null; standin: string | null;
  standinNote: string | null; attack: number; release: number;
}

const categoryOf = (c: string | undefined): Category | undefined => CATEGORIES.find(x => x.id === c)?.id;

function entry(id: string, i: LibraryInstrument): Entry | null {
  const category = categoryOf(i.category);
  if (!i.name || !category) return null;
  return {
    id, name: i.name, category, range: i.range ?? null, expert: i.expert ?? null, home: i.home ?? null,
    clef: CLEFS.find(c => c === i.clef) ?? 'treble', written: i.written ?? 0, gm: i.gm ?? 1, gmName: i.gm_name ?? i.name,
    pieces: i.pieces ?? null, standin: i.standin ?? null, standinNote: i.standin_note ?? null, attack: i.attack ?? 0.05, release: i.release ?? 0.3,
  };
}

/**
 * Every catalogued instrument, by category in picker order and then in the library's order. An instrument without a name or a
 * known category (as in a library.json from before the catalogue) is left out.
 */
export function catalogue(lib: Library): Entry[] {
  const entries = Object.entries(lib.instruments).flatMap(([id, i]) => entry(id, i) ?? []);
  const rank = (e: Entry) => CATEGORIES.findIndex(c => c.id === e.category);
  return entries.map((e, n) => ({ e, n })).sort((a, b) => rank(a.e) - rank(b.e) || a.n - b.n).map(x => x.e);
}

/** How a pitch sits on an instrument: 'expert' is playable only by experts, 'out' is beyond what it can play. Drums: a piece or 'out'. */
export function rangeClass(e: Entry, pitch: number): 'normal' | 'expert' | 'out' {
  if (e.pieces) return e.pieces.some(([p]) => p === pitch) ? 'normal' : 'out';
  const inside = (r: [number, number] | null) => r !== null && pitch >= r[0] && pitch <= r[1];
  return inside(e.range) ? 'normal' : inside(e.expert) ? 'expert' : 'out';
}

/** The pitch as the part is notated: Double Bass an octave up, Glockenspiel two octaves down. */
export const writtenPitch = (e: Entry, pitch: number): number => pitch + e.written;

export const laneFamily = (e: Entry): Family => (e.id === 'harp' ? 'harp' : CATEGORIES.find(c => c.id === e.category)!.family);

/** A new part's sound for this instrument. */
export const defaultSound = (e: Entry): Sound => ({ instrument: e.id, gain_db: 0, attack: e.attack, release: e.release });
