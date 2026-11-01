// What reading another program's music file gives the importer, whether it was MusicXML or MIDI: its parts (notes
// in quarter notes from the start, at the pitch they sound), its speed and time signatures by bar, its key when it
// says one, and what could not come across, in words for the preview. DOM-free.
import type { Tempo } from '../score.ts';

/** A note of an imported part: start and length in quarter notes, the sounding MIDI pitch (a drum's GM note), velocity 1–127. */
export interface ReadNote { start: number; length: number; pitch: number; velocity: number }
export interface ReadPart {
  name: string;
  /** The General MIDI program, counted from 1; null when the file does not say (and for drums). */
  program: number | null;
  drums: boolean;
  notes: ReadNote[];
}
export interface ReadMusic {
  format: 'MIDI' | 'MusicXML';
  /** The program that wrote it ("MuseScore 4.4.2"), when the file says. */
  app: string | null;
  title: string | null;
  /** Speed and time signature by bar, the first at bar 1; bpm counts the time signature's own beat. */
  tempo: Tempo[];
  /** The key the file states (fifths, −7 to 7, and major or minor), when it states one. */
  fifths: number | null;
  mode: 'major' | 'minor' | null;
  parts: ReadPart[];
  /** What the score cannot keep, each a sentence for What Can't Come Across. */
  lost: string[];
}

/** A file the importer refuses, with the reason in words for the page. */
export class ImportError extends Error {
  override name = 'ImportError';
}

/** Notes sorted by start, then pitch. */
export const byStart = (a: ReadNote, b: ReadNote): number => a.start - b.start || a.pitch - b.pitch;

/** A tempo entry's beat unit from a time signature's denominator, or null when it is not one the score allows. */
export function unitOf(denominator: number): Tempo['unit'] | null {
  return ([1, 2, 4, 8, 16] as const).find(u => u === denominator) ?? null;
}
