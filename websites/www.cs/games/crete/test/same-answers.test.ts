// The same-answers harness: every solver must agree with the breadth-first reference on whether a level is
// winnable and on the length of the shortest line, plain and refusing catches.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve, solveRefusing, caught } from '../src/puzzle/solver.ts';
import { solveBfs, solveBfsRefusing } from '../src/puzzle/solver-bfs.ts';
import type { SolveResult } from '../src/puzzle/solver.ts';
import { initial } from '../src/puzzle/state.ts';
import { parse, serialize } from '../src/puzzle/level.ts';
import type { Level } from '../src/puzzle/level.ts';
import { TRIALS, trialLevel } from '../src/puzzle/trials.ts';
import { corpus, reference, CORPUS_CAP } from './corpus.ts';

const summary = (r: SolveResult) => (r.solved ? { solved: true, length: r.line.length } : { solved: false, capped: r.capped });

export function sameAnswers(level: Level, cap: number): void {
  const s = initial(level);
  const what = serialize(level);
  assert.deepEqual(summary(solve(s, cap)), summary(solveBfs(s, cap)), `solve disagrees on\n${what}`);
  assert.deepEqual(summary(solveRefusing(s, caught, cap)), summary(solveBfsRefusing(s, caught, cap)), `solveRefusing disagrees on\n${what}`);
}

const LEVELS = corpus(1, 300);

test('every trial level gets the reference answer', () => {
  TRIALS.forEach((_, i) => sameAnswers(trialLevel(i), CORPUS_CAP));
});

test('the generated corpus: valid, round-trips, and mixes solvable with unsolvable levels', () => {
  assert.equal(LEVELS.length, 300);
  for (const lv of LEVELS) assert.deepEqual(parse(serialize(lv)), lv);
  const solvable = LEVELS.filter(lv => reference(lv).solved).length;
  assert.ok(solvable >= 100, `${solvable} solvable`);
  assert.ok(LEVELS.length - solvable >= 30, `${LEVELS.length - solvable} unsolvable`);
  assert.ok(LEVELS.some(lv => lv.minotaur) && LEVELS.some(lv => !lv.minotaur));
});

test('every corpus level gets the reference answer', () => {
  for (const lv of LEVELS) sameAnswers(lv, CORPUS_CAP);
});
