/* The Island of Crete: the editor's Check. It proves and rates the draft in the solver's worker (one `measure`
 * search per share text), keeps the answer, and says in words what the answer means. An edit cancels a running
 * search and leaves a finished answer in place, marked out of date until the draft is that text again. Whether a
 * search was cancelled is this module's own bookkeeping (each search has a number), never the solver client's error:
 * a search a newer one replaced rejects with a plain Error. DOM-free. */
import type { Answer, Report } from '../solver-host.ts';
import { hardPieces, sharedProblems } from '../puzzle/difficulty.ts';
import type { Difficulty } from '../puzzle/difficulty.ts';
import type { Level } from '../puzzle/level.ts';

/** What Check needs of a search (the solver client's SolverJob, which this DOM-free module cannot import). */
export interface CheckJob {
  progress(cb: (p: Report) => void): void;
  stop(): void;
  resume(): void;
  cancel(): void;
  result: Promise<Answer>;
}

export type CheckState =
  | { kind: 'none' }
  | { kind: 'running'; text: string; report: Report | null; stopped: boolean }
  | { kind: 'done'; text: string; d: Difficulty }
  | { kind: 'failed'; text: string; message: string };

export interface Checker {
  readonly state: CheckState;
  /** Proves and rates the level text `text`; resolves null when the search was cancelled, replaced or failed. */
  check(text: string): Promise<Difficulty | null>;
  /** Pauses a running search. */
  stop(): void;
  /** Resumes a paused search. */
  keepSearching(): void;
  /** The draft is now `text`: a search of any other text is cancelled. */
  edited(text: string): void;
}

export function createChecker(start: (text: string) => CheckJob, changed: () => void): Checker {
  let state: CheckState = { kind: 'none' };
  let job: CheckJob | null = null;
  /** The running search's number and its answer; an answer of any other number is dropped. */
  let gen = 0;
  let pending: Promise<Difficulty | null> | null = null;

  const set = (s: CheckState): void => {
    state = s;
    changed();
  };

  /** Ends the running search for good. */
  function cancel(): void {
    gen++;
    const j = job;
    job = null;
    pending = null;
    try { j?.cancel(); } catch { /* it is over either way */ }
  }

  function check(text: string): Promise<Difficulty | null> {
    if (state.kind === 'done' && state.text === text) return Promise.resolve(state.d);
    if (state.kind === 'running' && state.text === text && pending) return pending;
    cancel();
    const mine = gen;
    set({ kind: 'running', text, report: null, stopped: false });
    let j: CheckJob;
    try {
      j = start(text);
    } catch (e) {
      set({ kind: 'failed', text, message: e instanceof Error ? e.message : String(e) });
      return Promise.resolve(null);
    }
    job = j;
    j.progress(report => {
      if (gen === mine && state.kind === 'running') set({ ...state, report });
    });
    const p = j.result.then(
      a => {
        if (gen !== mine) return null;
        job = null;
        pending = null;
        const d = a as Difficulty;
        set({ kind: 'done', text, d });
        return d;
      },
      (e: unknown) => {
        if (gen !== mine) return null;
        job = null;
        pending = null;
        set({ kind: 'failed', text, message: e instanceof Error ? e.message : String(e) });
        return null;
      },
    );
    pending = p;
    return p;
  }

  return {
    get state() {
      return state;
    },
    check,
    stop() {
      if (state.kind !== 'running' || state.stopped) return;
      job?.stop();
      set({ ...state, stopped: true });
    },
    keepSearching() {
      if (state.kind !== 'running' || !state.stopped) return;
      job?.resume();
      set({ ...state, stopped: false });
    },
    edited(text) {
      if (state.kind === 'running' && state.text !== text) {
        cancel();
        set({ kind: 'none' });
      }
    },
  };
}

const plural = (n: number, one: string) => `${n} ${one}${n === 1 ? '' : 's'}`;

/** The words for an answer: what the solver found, what the Minotaur does to it, and whether it can be shared.
 *  `stale` is true when `current` is not the text the answer is for; `level` is the level of that text. */
export function checkLines(s: CheckState, current: string, level: Level): { lines: string[]; stale: boolean; shareable: boolean } {
  if (s.kind === 'none' || s.kind === 'running') return { lines: [], stale: false, shareable: false };
  const stale = s.text !== current;
  if (s.kind === 'failed') return { lines: [`The solver stopped: ${s.message}`], stale, shareable: false };
  const d = s.d;
  if (d.shortest === 'none' || (!d.solved && d.shortest !== 'unknown')) return { lines: ['This level cannot be won.'], stale, shareable: false };
  if (d.shortest === 'unknown' || !d.solved) {
    const hard = hardPieces(level);
    let line = 'The solver could not finish.';
    if (hard.length > 0) line += ` What makes it hard here: ${hard.join(', ')}.`;
    if (/^\d+ blocks?$/.test(hard[0] ?? '')) line += ' Fewer blocks help most.';
    return { lines: [line], stale, shareable: false };
  }
  const lines = [`Winnable: quickest win ${plural(d.shortest as number, 'move')}`, `Situations searched: ${d.explored.toLocaleString('en-US')}`];
  if (d.label === 'chase') {
    const adds = d.minotaurDelta === null ? 'can catch you' : `adds ${plural(d.minotaurDelta, 'move')}`;
    const ignoring = d.greedyWins === null ? '' : `; ignoring him ${d.greedyWins ? 'wins' : 'loses'}`;
    lines.push(`Chase: the Minotaur ${adds}${ignoring}`);
  } else if (d.label === 'solo') {
    lines.push(level.minotaur ? 'Solo: no Minotaur can reach you' : 'Solo: no Minotaur');
  } else {
    lines.push('Chase or solo: not known (the search hit its cap)');
  }
  const problems = sharedProblems(d);
  if (problems.length === 0) lines.push('Shareable');
  else lines.push('Not shareable yet:', ...problems);
  return { lines, stale, shareable: problems.length === 0 };
}
