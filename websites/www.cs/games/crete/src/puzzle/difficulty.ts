/* The Island of Crete: how hard a level is, and the bar a level must clear.
 * `measure` runs the exact solver a few ways: the level as it is, without the
 * Minotaur, and refusing every catch. `challengeProblems` checks the numbers
 * against the bar. A winnable level can still be no fight at all (the beast
 * walled off, the line walked straight); the bar fails that. Campaign levels,
 * the editor and endless mode all use these. DOM-free. */
import type { Level } from './level.ts';
import { initial } from './state.ts';
import { solve, solveRefusing, caught, SOLVER_CAP } from './solver.ts';
import type { SolveResult } from './solver.ts';
import { step } from './step.ts';

/** A search's answer: the shortest line's length, 'none' when proved unwinnable, 'unknown' when it hit the cap. */
export type Shortest = number | 'none' | 'unknown';

export interface Difficulty {
  solved: boolean;
  /** The shortest winning line, in moves. */
  shortest: Shortest;
  /** States the solver visited to find it. */
  explored: number;
  /** The shortest line with the Minotaur taken off the board; null when the level has none. */
  withoutMinotaur: Shortest | null;
  /** How many moves the Minotaur adds: `shortest - withoutMinotaur`, 0 without a Minotaur, null when either is not a number. */
  minotaurDelta: number | null;
  /** The Minotaur-free line, played on the real level, wins. True without a Minotaur; null when unknown. */
  greedyWins: boolean | null;
  /** The shortest win that is never caught. */
  catchFree: Shortest;
  /** Catches on the shortest line. */
  catches: number;
}

const length = (r: SolveResult): Shortest => (r.solved ? r.line.length : r.capped ? 'unknown' : 'none');

/** Every search searches at most `cap` states; a capped search reports 'unknown', never 'none'. */
export function measure(level: Level, cap = SOLVER_CAP): Difficulty {
  const start = initial(level);
  const r = solve(start, cap);
  const shortest = length(r);
  let catches = 0;
  if (r.solved) {
    let s = start;
    for (const a of r.line) { const x = step(s, a); s = x.state; if (caught(x.events, s)) catches++; }
  }
  const catchFree = length(solveRefusing(start, caught, cap));
  if (!level.minotaur) {
    return { solved: r.solved, shortest, explored: r.explored, withoutMinotaur: null, minotaurDelta: 0, greedyWins: true, catchFree, catches };
  }
  const free = solve(initial({ ...level, minotaur: null }), cap);
  const withoutMinotaur = length(free);
  let greedyWins: boolean | null = free.solved ? false : free.capped ? null : false;
  if (free.solved) {
    let s = start;
    for (const a of free.line) s = step(s, a).state;
    greedyWins = s.outcome === 'won';
  }
  const minotaurDelta = typeof shortest === 'number' && typeof withoutMinotaur === 'number' ? shortest - withoutMinotaur : null;
  return { solved: r.solved, shortest, explored: r.explored, withoutMinotaur, minotaurDelta, greedyWins, catchFree, catches };
}

/** The bar. Every level with a Minotaur: the Minotaur shapes the route (it adds moves, or the line that ignores
 *  it loses). A chapter's challenge levels, past its teaching stretch, are a real fight on top of that. */
export interface Bar {
  /** A challenge level's Minotaur adds at least this many moves. */
  minotaurDelta: number;
  /** A challenge level searches at least this many times the states of the chapter's hardest teaching level. */
  exploredTimes: number;
}

/** Chapter 1's numbers set it: its teaching Minotaurs add 3 to 13 moves (level 9's adds 22), and its hardest
 *  teaching search is trial 6's 2,437 states (level 9 searches 16 times that, level 10 26 times). */
export const BAR: Bar = { minotaurDelta: 8, exploredTimes: 8 };

/** Where a challenge level sits: the chapter's teaching levels, measured. */
export interface ChallengeContext { teaching: readonly Difficulty[] }

/** What keeps the level from clearing the bar; empty when it clears it. With a context, the level is a challenge
 *  level and the challenge rules apply too. */
export function challengeProblems(d: Difficulty, bar: Bar = BAR, context?: ChallengeContext): string[] {
  const out: string[] = [];
  if (d.shortest === 'unknown') return ['the solver hit its cap: the level is not proved winnable'];
  if (!d.solved) return ['the level cannot be won'];
  const hasMinotaur = d.withoutMinotaur !== null;
  if (hasMinotaur) {
    if (d.minotaurDelta === null || d.greedyWins === null) out.push('the Minotaur-free search hit its cap');
    else if (d.minotaurDelta <= 0 && d.greedyWins) out.push('the Minotaur does not matter: the line that ignores him wins, no longer');
  }
  if (!context) return out;
  if (!hasMinotaur) return [...out, 'a challenge level has a Minotaur'];
  if (d.greedyWins !== false) out.push('a challenge level: the line that ignores the Minotaur must lose');
  if (d.minotaurDelta !== null && d.minotaurDelta < bar.minotaurDelta) {
    out.push(`a challenge level: the Minotaur adds ${d.minotaurDelta} moves, the bar is ${bar.minotaurDelta}`);
  }
  const most = (f: (t: Difficulty) => number) => Math.max(0, ...context.teaching.map(f));
  const explored = most(t => t.explored);
  if (d.explored < bar.exploredTimes * explored) {
    out.push(`a challenge level: explored ${d.explored} states, the bar is ${bar.exploredTimes} × ${explored} = ${bar.exploredTimes * explored}`);
  }
  const longest = most(t => (typeof t.shortest === 'number' ? t.shortest : 0));
  if (typeof d.shortest === 'number' && d.shortest < longest) {
    out.push(`a challenge level: ${d.shortest} moves, shorter than the longest teaching level's ${longest}`);
  }
  return out;
}

/** Within a chapter no challenge level is easier (fewer states explored) than the one before it. */
export function rampProblems(previous: Difficulty, d: Difficulty): string[] {
  return d.explored < previous.explored
    ? [`explored ${d.explored} states, fewer than the challenge level before it (${previous.explored})`]
    : [];
}
