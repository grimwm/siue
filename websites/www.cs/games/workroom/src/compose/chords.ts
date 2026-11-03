// Chords and keys for the piano roll's chord buttons: the six major and minor chords of a key (or six friendly ones
// when no key is chosen), their names, their notes, and whether a pitch is in the key. DOM-free.

/** A major or minor chord on `root`, 0 to 11 from C. */
export interface Chord { root: number; minor: boolean }
/** A key: its tonic, 0 to 11 from C, and whether it is minor. */
export interface KeyOf { tonic: number; minor: boolean }

/** The note names, sharps or flats as musicians usually spell them. */
export const NOTE_NAMES: readonly string[] = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];
const MAJOR_SCALE: readonly number[] = [0, 2, 4, 5, 7, 9, 11];
const MINOR_SCALE: readonly number[] = [0, 2, 3, 5, 7, 8, 10];
const pc = (x: number): number => ((x % 12) + 12) % 12;

/** The chords offered with no key chosen: C, Dm, Em, F, G and Am. */
export const BASIC_CHORDS: readonly Chord[] = [
  { root: 0, minor: false }, { root: 2, minor: true }, { root: 4, minor: true },
  { root: 5, minor: false }, { root: 7, minor: false }, { root: 9, minor: true },
];

/** The key's six major and minor chords in scale order (its diminished chord left out). */
export function keyChords(key: KeyOf): Chord[] {
  const steps: readonly [number, boolean][] = key.minor
    ? [[0, true], [3, false], [5, true], [7, true], [8, false], [10, false]]
    : [[0, false], [2, true], [4, true], [5, false], [7, false], [9, true]];
  return steps.map(([s, minor]) => ({ root: pc(key.tonic + s), minor }));
}

/** "C", "Dm", "F♯m". */
export function chordName(c: Chord): string {
  return `${NOTE_NAMES[pc(c.root)]}${c.minor ? 'm' : ''}`;
}

/** The chord's root, third and fifth from `rootPitch`. */
export function chordPitches(c: Chord, rootPitch: number): number[] {
  return [rootPitch, rootPitch + (c.minor ? 3 : 4), rootPitch + 7];
}

/** The pitch of the chord's root at or just below `near`. */
export function chordRoot(c: Chord, near: number): number {
  return near - pc(near - c.root);
}

/** Whether `pitch` is one of the key's seven notes. */
export function inKey(pitch: number, key: KeyOf): boolean {
  return (key.minor ? MINOR_SCALE : MAJOR_SCALE).includes(pc(pitch - key.tonic));
}

/** "A Minor", "E♭ Major". */
export function keyName(key: KeyOf): string {
  return `${NOTE_NAMES[pc(key.tonic)]} ${key.minor ? 'Minor' : 'Major'}`;
}
