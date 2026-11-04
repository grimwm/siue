// Try It: a one-line tour of the composer, one step at a time, ticked off as the person does each thing. It only
// suggests: nothing waits for it and nothing is locked behind it. Whether the tips show is remembered in this browser.
// DOM-free.
import { oneOf, pref } from '../../../_kit/prefs.ts';
import type { Pref } from '../../../_kit/prefs.ts';
import type { StorageLike } from '../../../_kit/ports.ts';

export type CoachStep = 'play' | 'note' | 'inst' | 'fxadd' | 'fx' | 'xf';

/** The steps in order, each with what to do next. */
export const COACH_STEPS: readonly { id: CoachStep; words: string }[] = [
  { id: 'play', words: 'Press Play, or the space bar. The green line shows where the music is.' },
  { id: 'note', words: 'Open a track with its ▸ and tap the piano roll to add a note. Higher rows are higher notes.' },
  { id: 'inst', words: 'Press Add Instrument, press Hear on a few, then add one.' },
  { id: 'fxadd', words: 'Press Add Effect and drag a Riser onto the timeline, or tap it and then a bar.' },
  { id: 'fx', words: 'Pick the riser and press Hear It From Here to hear it climb into the bar line.' },
  { id: 'xf', words: 'Open Mix and slide the crossfader while the song plays.' },
];

export const COACH_DONE = 'That is the whole tour. Keep going, or pick a new starting point.';

/** The next step not yet done, or null when every step is. */
export function nextStep(done: ReadonlySet<CoachStep>): CoachStep | null {
  return COACH_STEPS.find(s => !done.has(s.id))?.id ?? null;
}

/** The words for the next step, or the finished line. */
export function coachWords(done: ReadonlySet<CoachStep>): string {
  const next = nextStep(done);
  return next ? COACH_STEPS.find(s => s.id === next)!.words : COACH_DONE;
}

export type Tips = 'shown' | 'hidden';
export const TIPS_KEY = 'workroom-composer-tips';

/** Whether the Try It tips show, remembered in this browser; shown until hidden. */
export const coachPref = (storage: StorageLike | null): Pref<Tips> => pref<Tips>(TIPS_KEY, 'shown', oneOf<Tips>(['shown', 'hidden'], 'shown'), storage);
