// The same-answers helper: every solver must agree with the breadth-first reference on whether a level is
// winnable and on the length of the shortest line, plain and refusing catches, and every line it returns must
// play out. Where the reference gives up at the cap, a solver that decides must agree with the reference given
// room to finish (SOLVER_CAP). Registers no tests.
import assert from 'node:assert/strict';
import { solve, solveRefusing, caught, SOLVER_CAP } from '../src/puzzle/solver.ts';
import { solveBfs, solveBfsRefusing } from '../src/puzzle/solver-bfs.ts';
import type { SolveResult, Refuse } from '../src/puzzle/solver.ts';
import type { State } from '../src/puzzle/state.ts';
import { initial } from '../src/puzzle/state.ts';
import { step } from '../src/puzzle/step.ts';
import { serialize } from '../src/puzzle/level.ts';
import type { Level } from '../src/puzzle/level.ts';
import { reference, referenceRefusing, CORPUS_CAP } from './corpus.ts';

const summary = (r: SolveResult) => (r.solved ? { solved: true, length: r.line.length } : { solved: false, capped: r.capped });
const gaveUp = (r: SolveResult) => !r.solved && r.capped;

/** `got` against the reference's `want` at the same cap; when only the reference gave up, against `finished`. */
function agree(got: SolveResult, want: SolveResult, finished: () => SolveResult, message: string): void {
  const truth = gaveUp(want) && !gaveUp(got) ? finished() : want;
  assert.ok(!gaveUp(truth), `the reference gives up even at ${SOLVER_CAP} states: ${message}`);
  assert.deepEqual(summary(got), summary(truth), message);
}

/** Plays a solved line from the level's start: it must end won, and with `refuseCatches` no turn may catch. */
function replay(level: Level, r: SolveResult, refuseCatches: boolean, what: string): void {
  if (!r.solved) return;
  let s = initial(level);
  r.line.forEach((a, i) => {
    const t = step(s, a);
    assert.notEqual(t.state, s, `turn ${i} of the line is a bump on\n${what}`);
    if (refuseCatches) assert.ok(!t.events.some(e => e.kind === 'caught'), `turn ${i} of the line is caught on\n${what}`);
    s = t.state;
  });
  assert.equal(s.outcome, 'won', `the line does not win on\n${what}`);
}

/** A solver under test: `refuse` null searches plain. */
export type Search = (s: State, refuse: Refuse | null, cap: number) => SolveResult;
const SOLVER: Search = (s, refuse, cap) => (refuse ? solveRefusing(s, refuse, cap) : solve(s, cap));

export function sameAnswers(level: Level, cap: number, search: Search = SOLVER): void {
  const s = initial(level);
  const what = serialize(level);
  const plain = search(s, null, cap);
  const refusing = search(s, caught, cap);
  const want = cap === CORPUS_CAP ? reference(level) : solveBfs(s, cap);
  const wantRefusing = cap === CORPUS_CAP ? referenceRefusing(level) : solveBfsRefusing(s, caught, cap);
  agree(plain, want, () => solveBfs(s, SOLVER_CAP), `solve disagrees on\n${what}`);
  agree(refusing, wantRefusing, () => solveBfsRefusing(s, caught, SOLVER_CAP), `solveRefusing disagrees on\n${what}`);
  replay(level, plain, false, what);
  replay(level, refusing, true, what);
}
