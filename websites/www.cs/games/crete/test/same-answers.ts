// The same-answers helper: every solver must agree with the breadth-first reference on whether a level is
// winnable and on the length of the shortest line, plain and refusing catches, and every line it returns must
// play out. Registers no tests.
import assert from 'node:assert/strict';
import { solve, solveRefusing, caught } from '../src/puzzle/solver.ts';
import { solveBfs, solveBfsRefusing } from '../src/puzzle/solver-bfs.ts';
import type { SolveResult } from '../src/puzzle/solver.ts';
import { initial } from '../src/puzzle/state.ts';
import { step } from '../src/puzzle/step.ts';
import { serialize } from '../src/puzzle/level.ts';
import type { Level } from '../src/puzzle/level.ts';
import { reference, referenceRefusing, CORPUS_CAP } from './corpus.ts';

const summary = (r: SolveResult) => (r.solved ? { solved: true, length: r.line.length } : { solved: false, capped: r.capped });

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

export function sameAnswers(level: Level, cap: number): void {
  const s = initial(level);
  const what = serialize(level);
  const plain = solve(s, cap);
  const refusing = solveRefusing(s, caught, cap);
  const want = cap === CORPUS_CAP ? reference(level) : solveBfs(s, cap);
  const wantRefusing = cap === CORPUS_CAP ? referenceRefusing(level) : solveBfsRefusing(s, caught, cap);
  assert.deepEqual(summary(plain), summary(want), `solve disagrees on\n${what}`);
  assert.deepEqual(summary(refusing), summary(wantRefusing), `solveRefusing disagrees on\n${what}`);
  replay(level, plain, false, what);
  replay(level, refusing, true, what);
}
