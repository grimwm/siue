// The computer keyboard as a music keyboard: the home row and the row above it are one octave and a bit, the way most
// music programs lay it out (A is C, W is C♯, … K is the next C). Z and X move the keyboard down and up an octave.
// Keys are read by their place (KeyboardEvent.code), so the layout works on any keyboard language. DOM-free.
import type { Entry } from '../catalogue.ts';

export const KEY_SEMITONE: Readonly<Record<string, number>> = {
  KeyA: 0, KeyW: 1, KeyS: 2, KeyE: 3, KeyD: 4, KeyF: 5, KeyT: 6, KeyG: 7, KeyY: 8, KeyH: 9, KeyU: 10, KeyJ: 11,
  KeyK: 12, KeyO: 13, KeyL: 14, KeyP: 15, Semicolon: 16,
};
export const OCTAVE_DOWN = 'KeyZ';
export const OCTAVE_UP = 'KeyX';

/** Where a part's keyboard starts: the C at or below the instrument's home note; a drum part's lowest piece. */
export function keyboardStart(entry: Entry): number {
  if (entry.pieces) return Math.min(...entry.pieces.map(([p]) => p));
  const home = entry.home ?? 60;
  return home - (home % 12);
}

/** The pitch a computer key plays with the keyboard starting at `start`, or null for a key that plays none. */
export function pitchForKey(code: string, start: number): number | null {
  const s = KEY_SEMITONE[code];
  if (s === undefined) return null;
  const p = start + s;
  return p >= 0 && p <= 127 ? p : null;
}

/** The on-screen keys from `start`, `octaves` of them and the C above: each pitch and whether it is a black key. */
export function screenKeys(start: number, octaves: number): { pitch: number; black: boolean }[] {
  const out: { pitch: number; black: boolean }[] = [];
  for (let p = start; p <= Math.min(127, start + 12 * octaves); p++) out.push({ pitch: p, black: [1, 3, 6, 8, 10].includes(p % 12) });
  return out;
}
