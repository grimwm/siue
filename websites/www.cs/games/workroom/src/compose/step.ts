// Step entry: pick a length, then a pitch (or a chord). The note goes in at the step cursor and the cursor moves on by
// that length; "+ Rest" moves it on without a note and "‹ Back One" takes back the last step. Keys pressed together
// make one chord step; a key held longer than a tap sets the step's length the way Play Live does. DOM-free.
import { snapHeld } from './snap.ts';

/** The lengths offered, in quarter notes, each with its note icon's name. */
export const STEP_LENGTHS = [
  { id: 'whole', label: 'Whole', quarters: 4 },
  { id: 'half', label: 'Half', quarters: 2 },
  { id: 'quarter', label: 'Quarter', quarters: 1 },
  { id: 'eighth', label: 'Eighth', quarters: 0.5 },
  { id: 'sixteenth', label: 'Sixteenth', quarters: 0.25 },
] as const;
export type StepLength = (typeof STEP_LENGTHS)[number]['id'];

/** A key let go within this long of going down is a tap: the picked length stands. */
export const TAP_SECONDS = 0.3;

/** One step: where it started, how long it was, and the ids of the notes it added (none for a rest). */
export interface Step { start: number; length: number; ids: number[] }

/** The length of a step in beats: the picked length, half again when dotted. */
export const stepBeats = (length: StepLength, dotted: boolean, quarter: number): number =>
  STEP_LENGTHS.find(l => l.id === length)!.quarters * quarter * (dotted ? 1.5 : 1);

export interface StepCursor {
  cursor(): number;
  /** Records a step of `length` beats at the cursor holding notes `ids`, and moves the cursor on. */
  add(length: number, ids: number[]): Step;
  rest(length: number): Step;
  /** Takes back the last step: the cursor returns to its start, and its notes' ids come back for removal. */
  back(): Step | null;
  /** Puts the cursor at `beat` and forgets the steps before it. */
  moveTo(beat: number): void;
}

export function createStepCursor(start: number): StepCursor {
  let at = start;
  const steps: Step[] = [];
  const add = (length: number, ids: number[]): Step => {
    const s = { start: at, length, ids };
    steps.push(s);
    at += length;
    return s;
  };
  return {
    cursor: () => at,
    add,
    rest: length => add(length, []),
    back: () => {
      const s = steps.pop();
      if (!s) return null;
      at = s.start;
      return s;
    },
    moveTo: beat => { at = Math.max(0, beat); steps.length = 0; },
  };
}

/**
 * Gathers keys into a chord: every key that goes down before all of them are up again is one chord. When the last
 * key comes up it answers the pitches and, when the keys were held longer than a tap, the held length in beats.
 */
export function createChordGather(bpm: () => number) {
  let down: number[] = [];
  /** Each key of the chord and how hard it was played. */
  let pitches = new Map<number, number>();
  let since = 0;
  return {
    down(pitch: number, t: number, velocity = 90): void {
      if (down.length === 0) { pitches = new Map(); since = t; }
      if (!down.includes(pitch)) down.push(pitch);
      if (!pitches.has(pitch)) pitches.set(pitch, velocity);
    },
    /** null while keys are still down; then the chord, low to high with each key's velocity, and `held` beats when it was held, else null. */
    up(pitch: number, t: number): { pitches: number[]; velocities: number[]; held: number | null } | null {
      if (!down.includes(pitch)) return null;
      down = down.filter(p => p !== pitch);
      if (down.length > 0) return null;
      const seconds = t - since;
      const order = [...pitches.keys()].sort((a, b) => a - b);
      return { pitches: order, velocities: order.map(p => pitches.get(p)!), held: seconds > TAP_SECONDS ? snapHeld((seconds * bpm()) / 60) : null };
    },
    held: (): number[] => [...down],
  };
}
