/* The Island of Crete: a shared level's rating, a `measure` search in the solver's worker that runs while the level
 * is played. The page has one worker and runs one search in it at a time, and the editor's Check comes first: a
 * rating wanted while a Check holds the worker (running or stopped) waits until the Check ends, and a Check started
 * during a rating cancels it, and the rating starts again from the beginning once every Check has ended. A rating
 * never cancels a Check. DOM-free. */
import type { CheckJob } from '../editor/check.ts';
import type { Difficulty } from '../puzzle/difficulty.ts';

export type RatingState =
  | { kind: 'none' }
  /** Wanted, while a Check holds the worker. */
  | { kind: 'waiting'; text: string }
  | { kind: 'running'; text: string }
  | { kind: 'done'; text: string; d: Difficulty }
  | { kind: 'failed'; text: string; message: string };

export interface Rater {
  readonly state: RatingState;
  /** Rates the level text `text`: a rating of any other text is cancelled; one of this text goes on as it is. */
  rate(text: string): void;
  /** No rating is wanted: a running one is cancelled. */
  cancel(): void;
  /** Starts the editor's Check of `text` (the editor's `start`); a running rating gives up the worker to it. */
  check(text: string): CheckJob;
}

export function createRater(start: (text: string) => CheckJob, changed: () => void): Rater {
  let state: RatingState = { kind: 'none' };
  let job: CheckJob | null = null;
  /** The running rating's number; an answer of any other number is dropped. */
  let gen = 0;
  /** The Checks whose searches have not ended. */
  const checks = new Set<CheckJob>();

  const set = (s: RatingState): void => {
    state = s;
    changed();
  };

  /** Ends the running rating's search, if there is one. */
  function drop(): void {
    gen++;
    const j = job;
    job = null;
    try { j?.cancel(); } catch { /* it is over either way */ }
  }

  function launch(text: string): void {
    const mine = ++gen;
    let j: CheckJob;
    try {
      j = start(text);
    } catch (e) {
      set({ kind: 'failed', text, message: e instanceof Error ? e.message : String(e) });
      return;
    }
    job = j;
    set({ kind: 'running', text });
    j.result.then(
      a => {
        if (gen !== mine) return;
        job = null;
        set({ kind: 'done', text, d: a as Difficulty });
      },
      (e: unknown) => {
        if (gen !== mine) return;
        job = null;
        set({ kind: 'failed', text, message: e instanceof Error ? e.message : String(e) });
      },
    );
  }

  /** A Check ended: with none left, a waiting rating starts. */
  function ended(j: CheckJob): void {
    checks.delete(j);
    if (checks.size === 0 && state.kind === 'waiting') launch(state.text);
  }

  return {
    get state() {
      return state;
    },
    rate(text) {
      if (state.kind !== 'none' && state.text === text && state.kind !== 'failed') return;
      drop();
      if (checks.size > 0) set({ kind: 'waiting', text });
      else launch(text);
    },
    cancel() {
      drop();
      if (state.kind !== 'none') set({ kind: 'none' });
    },
    check(text) {
      if (state.kind === 'running') {
        drop();
        set({ kind: 'waiting', text: state.text });
      }
      let j: CheckJob;
      try {
        j = start(text);
      } catch (e) {
        if (checks.size === 0 && state.kind === 'waiting') launch(state.text);
        throw e;
      }
      checks.add(j);
      j.result.then(() => ended(j), () => ended(j));
      return j;
    },
  };
}
