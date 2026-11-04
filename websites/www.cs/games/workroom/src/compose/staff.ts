// One part laid out on a simple staff for the Sheet view, in beats: which staff it gets (treble, bass, both as a grand
// staff, or a drum staff), and for each note it plays (looped repeats included) its place on the lines, the sharp, flat
// or natural it needs in the piece's key, the ledger lines it stands on, its name, whether its head is hollow (a half
// note or longer) and which way its stem goes. Drums sit on fixed lines by piece: the kick low, the snare in the
// middle, hi-hats and cymbals on top with an x for a head. DOM-free.
import type { Entry } from '../catalogue.ts';
import type { EditKey, Part } from './doc.ts';
import { heardNotes } from './regions.ts';

export type StaffKind = 'treble' | 'bass' | 'grand' | 'drums';
export type Accidental = '♯' | '♭' | '♮';

export interface StaffNote {
  id: number; start: number; length: number; pitch: number;
  /** Staff position in steps (a line or a space each): 0 is the middle line of its staff, up is higher. */
  step: number;
  /** 0 is the only staff, or the treble staff of a grand staff; 1 is a grand staff's bass staff. */
  staff: 0 | 1;
  accidental: Accidental | null;
  /** The steps of the short ledger lines the note needs above or below its staff. */
  ledgers: number[];
  /** "E♭4", or a drum piece's name. */
  name: string;
  hollow: boolean;
  stemUp: boolean;
  /** A drum with an x for a head (hi-hats, cymbals). */
  cross: boolean;
  /** A looped region's repeat. */
  ghost: boolean;
}

export interface StaffLayout {
  kind: StaffKind;
  notes: StaffNote[];
  /** The key signature's sharps or flats, as the letters they change ('F', 'C', …), or null for none. */
  signature: { accidental: '♯' | '♭'; letters: string[] } | null;
}

const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const;
/** The white keys' letters by pitch class. */
const WHITE: Readonly<Record<number, number>> = { 0: 0, 2: 1, 4: 2, 5: 3, 7: 4, 9: 5, 11: 6 };
const SHARP_ORDER = ['F', 'C', 'G', 'D', 'A', 'E', 'B'];
const FLAT_ORDER = ['B', 'E', 'A', 'D', 'G', 'C', 'F'];
/** Major keys' sharps (by tonic pitch class); the rest are flat keys. */
const SHARPS: Readonly<Record<number, number>> = { 0: 0, 7: 1, 2: 2, 9: 3, 4: 4, 11: 5, 6: 6 };
const FLATS: Readonly<Record<number, number>> = { 5: 1, 10: 2, 3: 3, 8: 4, 1: 5 };
/** The middle lines: B4 on the treble staff, D3 on the bass staff, as diatonic numbers (octave × 7 + letter). */
const TREBLE_MID = 4 * 7 + 6;
const BASS_MID = 3 * 7 + 1;
const EPS = 1e-6;

/** The key's signature, from its relative major. */
export function signatureOf(key: EditKey | null | undefined): StaffLayout['signature'] {
  if (!key) return null;
  const major = ((key.minor ? key.tonic + 3 : key.tonic) % 12 + 12) % 12;
  if (SHARPS[major] !== undefined) return SHARPS[major] ? { accidental: '♯', letters: SHARP_ORDER.slice(0, SHARPS[major]) } : null;
  return { accidental: '♭', letters: FLAT_ORDER.slice(0, FLATS[major] ?? 0) };
}

/** A pitch as a letter, an alteration (−1, 0, +1) and a diatonic number; black keys as flats in a flat key, else sharps. */
export function spell(pitch: number, flats: boolean): { letter: number; alter: -1 | 0 | 1; diatonic: number } {
  const pc = ((pitch % 12) + 12) % 12;
  const octave = Math.floor(pitch / 12) - 1;
  const white = WHITE[pc];
  if (white !== undefined) return { letter: white, alter: 0, diatonic: octave * 7 + white };
  const letter = flats ? WHITE[pc + 1]! : WHITE[pc - 1]!;
  return { letter, alter: flats ? -1 : 1, diatonic: octave * 7 + letter };
}

/** Which staff a melodic part gets: from its notes when it has some, else from the instrument's clef. */
export function clefOf(entry: Entry | null, pitches: readonly number[]): Exclude<StaffKind, 'drums'> {
  const own: Exclude<StaffKind, 'drums'> = entry?.clef === 'bass' ? 'bass' : entry?.clef === 'grand' ? 'grand'
    : entry?.clef === 'alto' ? ((entry.home ?? 60) >= 60 ? 'treble' : 'bass') : 'treble';
  if (!pitches.length) return own;
  const lo = Math.min(...pitches);
  const hi = Math.max(...pitches);
  const trebleFits = lo >= 55;
  const bassFits = hi <= 64;
  if (trebleFits && bassFits) return own === 'bass' ? 'bass' : 'treble';
  if (trebleFits) return 'treble';
  if (bassFits) return 'bass';
  return 'grand';
}

/** A drum's line (in steps from the middle line) and head, by its General MIDI number. */
export function drumPlace(pitch: number): { step: number; cross: boolean } {
  if (pitch === 35 || pitch === 36) return { step: -3, cross: false };
  if (pitch === 37 || pitch === 38 || pitch === 39 || pitch === 40) return { step: 1, cross: false };
  if (pitch === 41 || pitch === 43 || pitch === 45) return { step: -1, cross: false };
  if (pitch === 47 || pitch === 48) return { step: 2, cross: false };
  if (pitch === 50) return { step: 3, cross: false };
  if (pitch === 42 || pitch === 44 || pitch === 46 || pitch === 81) return { step: 5, cross: true };
  if (pitch === 49 || pitch === 52 || pitch === 55 || pitch === 57) return { step: 6, cross: true };
  if (pitch === 51 || pitch === 53 || pitch === 59) return { step: 4, cross: true };
  if (pitch === 54) return { step: 3, cross: true };
  return { step: 0, cross: false };
}

/** The ledger lines a note at `step` needs: every second step from just outside the staff to the note. */
export function ledgersFor(step: number): number[] {
  const out: number[] = [];
  for (let s = 6; s <= step; s += 2) out.push(s);
  for (let s = -6; s >= step; s -= 2) out.push(s);
  return out;
}

/**
 * The part on its staff. `quarter` is how many of the piece's beats make a quarter note (1 in 4/4, 2 in 6/8): a note
 * of two quarters or more has a hollow head.
 */
export function staffOf(part: Part, entry: Entry | null, key?: EditKey | null, quarter = 1): StaffLayout {
  const heard = heardNotes(part).slice().sort((a, b) => a.start - b.start || a.pitch - b.pitch);
  const signature = signatureOf(key);
  if (entry?.pieces) {
    const names = new Map(entry.pieces);
    return {
      kind: 'drums', signature: null,
      notes: heard.map(n => {
        const { step, cross } = drumPlace(n.pitch);
        return {
          id: n.id, start: n.start, length: n.length, pitch: n.pitch, step, staff: 0, accidental: null, ledgers: ledgersFor(step),
          name: names.get(n.pitch) ?? `Drum ${n.pitch}`, hollow: false, stemUp: true, cross, ghost: !!n.ghost,
        };
      }),
    };
  }
  const kind = clefOf(entry, heard.map(n => n.pitch));
  const flats = signature?.accidental === '♭';
  const inKey = (letter: string): -1 | 0 | 1 => (signature?.letters.includes(letter) ? (signature.accidental === '♯' ? 1 : -1) : 0);
  return {
    kind, signature,
    notes: heard.map(n => {
      const s = spell(n.pitch, flats);
      const letter = LETTERS[s.letter]!;
      const staff: 0 | 1 = kind === 'bass' || (kind === 'grand' && n.pitch < 60) ? 1 : 0;
      const step = s.diatonic - (staff === 1 ? BASS_MID : TREBLE_MID);
      const want = inKey(letter);
      const accidental: Accidental | null = s.alter === want ? null : s.alter === 1 ? '♯' : s.alter === -1 ? '♭' : '♮';
      const octave = Math.floor(s.diatonic / 7);
      return {
        id: n.id, start: n.start, length: n.length, pitch: n.pitch, step, staff: kind === 'grand' ? staff : 0, accidental, ledgers: ledgersFor(step),
        name: `${letter}${s.alter === 1 ? '♯' : s.alter === -1 ? '♭' : ''}${octave}`,
        hollow: n.length >= 2 * quarter - EPS, stemUp: step < 0, cross: false, ghost: !!n.ghost,
      };
    }),
  };
}
