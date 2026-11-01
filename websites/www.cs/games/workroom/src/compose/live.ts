// Play Live: keys pressed and released as they are played, in seconds from any clock, turned into notes. The first key
// down is the take's start beat; a key held down sets its note's length, the way a piano does. Keys that go down within
// CHORD_SECONDS of one another are one chord and share a start. When recording stops the starts snap to "Tidy To" and
// the held lengths to the nearest musical length, or stay exactly as played with Off. DOM-free.
import { snapHeld, snapStart } from './snap.ts';
import type { Grid } from './snap.ts';
import type { NewNote } from './edit.ts';

/** Keys down within this long of the chord's first key are played together. */
export const CHORD_SECONDS = 0.05;

export interface LiveTake {
  /** Starts the take's clock at `t` (the downbeat after a count-in), before any key; a take without it starts on its first key. */
  begin(t: number): void;
  down(pitch: number, t: number, velocity?: number): void;
  up(pitch: number, t: number): void;
  /** The keys held now. */
  held(): number[];
  started(): boolean;
  /** True once nothing is held and a whole bar has gone by since the last key came up: recording stops by itself. */
  quietEnough(t: number): boolean;
  /** Every note played, keys still held ending at `t`; starts and lengths tidied unless `tidy` is Off. */
  notes(tidy: Grid, quarter: number, t: number): NewNote[];
}

interface Played { pitch: number; velocity: number; down: number; up: number | null; chordAt: number }

export function createLiveTake(o: { startBeat: number; bpm: number; beatsPerBar: number }): LiveTake {
  const played: Played[] = [];
  let first: number | null = null;
  let chordAt = -Infinity;
  let lastUp = -Infinity;
  const beats = (seconds: number): number => (seconds * o.bpm) / 60;
  const open = (pitch: number) => played.find(p => p.pitch === pitch && p.up === null);
  return {
    begin: t => { if (first === null) first = t; },
    down: (pitch, t, velocity = 90) => {
      if (open(pitch)) return;
      if (first === null) first = t;
      if (t - chordAt > CHORD_SECONDS) chordAt = t;
      played.push({ pitch, velocity, down: t, up: null, chordAt });
    },
    up: (pitch, t) => {
      const p = open(pitch);
      if (!p) return;
      p.up = Math.max(t, p.down);
      lastUp = p.up;
    },
    held: () => played.filter(p => p.up === null).map(p => p.pitch),
    started: () => first !== null,
    quietEnough: t => first !== null && played.every(p => p.up !== null) && beats(t - lastUp) >= o.beatsPerBar - 1e-9,
    notes: (tidy, quarter, t) => played.map(p => {
      const start = o.startBeat + Math.max(0, beats(p.chordAt - first!));
      const length = beats((p.up ?? Math.max(t, p.down)) - p.down);
      return tidy === 'off'
        ? { start, length: Math.max(length, 1e-3), pitch: p.pitch, velocity: p.velocity }
        : { start: o.startBeat + snapStart(start - o.startBeat, tidy, quarter), length: snapHeld(length), pitch: p.pitch, velocity: p.velocity };
    }),
  };
}
