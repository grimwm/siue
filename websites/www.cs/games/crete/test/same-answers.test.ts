// Every solver gets the breadth-first reference's answers (the helper is test/same-answers.ts) on the trial levels
// and a generated corpus.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parse, serialize } from '../src/puzzle/level.ts';
import { TRIALS, trialLevel } from '../src/puzzle/trials.ts';
import { corpus, reference, CORPUS_CAP } from './corpus.ts';
import { sameAnswers } from './same-answers.ts';

const LEVELS = corpus(1, 360);

test('every trial level gets the reference answer', () => {
  TRIALS.forEach((_, i) => sameAnswers(trialLevel(i), CORPUS_CAP));
});

test('the generated corpus: valid, round-trips, and mixes solvable with unsolvable levels', () => {
  assert.equal(LEVELS.length, 360);
  for (const lv of LEVELS) assert.deepEqual(parse(serialize(lv)), lv);
  const solvable = LEVELS.filter(lv => reference(lv).solved).length;
  assert.ok(solvable >= 100, `${solvable} solvable`);
  assert.ok(LEVELS.length - solvable >= 30, `${LEVELS.length - solvable} unsolvable`);
  const explored = LEVELS.filter(lv => { const r = reference(lv); return !r.solved && r.explored >= 50; }).length;
  assert.ok(explored >= 30, `${explored} unsolvable levels explore 50 states or more`);
  assert.ok(LEVELS.some(lv => lv.relics < lv.objects.filter(o => o === 'relic').length), 'a level asks for fewer relics than the grid holds');
  assert.ok(LEVELS.some(lv => lv.minotaur) && LEVELS.some(lv => !lv.minotaur));
  assert.ok(LEVELS.some(lv => lv.hazards.length > 1), 'a level has more than one hazard');
  assert.ok(LEVELS.some(lv => lv.machines.some(m => m.template === 'block')), 'a machine clones blocks');
  assert.ok(LEVELS.some(lv => lv.machines.some(m => m.template !== 'block')), 'a machine clones hazards');
});

test('every corpus level gets the reference answer', () => {
  for (const lv of LEVELS) sameAnswers(lv, CORPUS_CAP);
});
