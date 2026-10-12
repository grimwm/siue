// The drones' measured hit rates per difficulty, on the real sim
// (src/ai-measure.ts), against the targets the table in src/ai.ts was tuned
// to: normal within 5 points of its targets, easy within 5 of half of normal,
// hard at least as good as normal. Also the table's shape and the setting's
// saved form.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { buildArsenal } from '../src/sim.ts';
import { DIFFICULTIES, DIFFICULTY, aimSkill } from '../src/ai.ts';
import { measureHitRates } from '../src/ai-measure.ts';
import { difficultySetting } from '../src/difficulty.ts';
import { memoryStorage, throwingStorage } from '../../_kit/test/record.ts';

const GAME = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'game.json'), 'utf8'));
const arsenal = buildArsenal(GAME.arsenal);

// Enough seeded cases that a rate sits within a couple of points of its
// long-run value (checked against 1000), few enough to stay near two seconds.
const CASES = 600;
const ROUNDS = [1, 5, 10];
// Percent hits, per round: the ranging shot, and the shot after two corrections.
const NORMAL = { ranging: { 1: 10, 5: 15, 10: 25 }, twice: { 1: 25, 5: 40, 10: 55 } };
const BAND = 5;

const rates = {};
for (const d of DIFFICULTIES) {
  rates[d] = {};
  for (const r of ROUNDS) rates[d][r] = measureHitRates(arsenal, r, d, CASES, 3).map(p => p * 100);
}
const cell = (d, r, shot) => rates[d][r][shot];

test('the table has the three levels, each with every knob', () => {
  assert.deepEqual([...DIFFICULTIES], ['easy', 'normal', 'hard']);
  assert.deepEqual(Object.keys(DIFFICULTY).sort(), ['easy', 'hard', 'normal']);
  for (const d of DIFFICULTIES) {
    const s = DIFFICULTY[d];
    assert.deepEqual(Object.keys(s).sort(), ['brkFloor', 'brkMax', 'brkShrink', 'correct', 'wobFloor', 'wobStart', 'wobStep']);
    assert.ok(s.correct > 0 && s.correct <= 1, `${d}: correct takes out part of the miss, at most all of it`);
    assert.ok(s.brkFloor > 0, `${d}: the wobble never reaches zero`);
    assert.ok(Number.isInteger(s.brkMax) && s.brkMax >= 1, `${d}: brkMax counts corrections`);
  }
});

test('hard is the original aim', () => {
  assert.deepEqual({ ...DIFFICULTY.hard },
    { wobStart: 0.85, wobStep: 0.12, wobFloor: 0.25, correct: 1, brkShrink: 0.65, brkFloor: 0.2, brkMax: 5 });
});

test('an unknown or missing level aims at normal', () => {
  for (const d of [undefined, '', 'brutal', 'Hard']) assert.equal(aimSkill(d), DIFFICULTY.normal);
  assert.equal(aimSkill('easy'), DIFFICULTY.easy);
});

test('normal hits within 5 points of its targets', () => {
  for (const r of ROUNDS) {
    assert.ok(Math.abs(cell('normal', r, 0) - NORMAL.ranging[r]) <= BAND, `round ${r} ranging shot: ${cell('normal', r, 0).toFixed(1)}%`);
    assert.ok(Math.abs(cell('normal', r, 2) - NORMAL.twice[r]) <= BAND, `round ${r} after two corrections: ${cell('normal', r, 2).toFixed(1)}%`);
  }
});

test('easy hits about half as often as normal', () => {
  for (const r of ROUNDS) {
    for (const shot of [0, 2]) {
      const half = cell('normal', r, shot) / 2;
      assert.ok(Math.abs(cell('easy', r, shot) - half) <= BAND, `round ${r} shot ${shot}: easy ${cell('easy', r, shot).toFixed(1)}%, half of normal ${half.toFixed(1)}%`);
    }
  }
});

test('hard hits at least as often as normal', () => {
  for (const r of ROUNDS) {
    for (const shot of [0, 1, 2]) {
      assert.ok(cell('hard', r, shot) >= cell('normal', r, shot), `round ${r} shot ${shot}: hard ${cell('hard', r, shot)}%, normal ${cell('normal', r, shot)}%`);
    }
  }
});

test('the setting defaults to normal and keeps a saved word', () => {
  assert.equal(difficultySetting(memoryStorage()).get(), 'normal');
  assert.equal(difficultySetting(memoryStorage({ 'tankity-body': 'walker' })).get(), 'normal');
  assert.equal(difficultySetting(memoryStorage({ 'tankity-difficulty': 'hard' })).get(), 'hard');
  assert.equal(difficultySetting(memoryStorage({ 'tankity-difficulty': 'brutal' })).get(), 'normal');
  assert.equal(difficultySetting(throwingStorage()).get(), 'normal');
  const store = memoryStorage();
  difficultySetting(store).set('easy');
  assert.equal(store.data.get('tankity-difficulty'), 'easy');
  assert.equal(difficultySetting(store).get(), 'easy');
});
