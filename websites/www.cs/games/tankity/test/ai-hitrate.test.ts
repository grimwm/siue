// The drones' measured hit rates per difficulty, on the real sim
// (src/ai-measure.ts), against the targets the table in src/ai.ts was tuned
// to: normal within 5 points of its targets, easy within 5 of half of normal,
// hard at least as good as normal. Also the table's shape and the setting's
// saved form.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { buildArsenal, fieldWidthOk } from '../src/sim.ts';
import { DIFFICULTIES, DIFFICULTY, aimSkill } from '../src/ai.ts';
import type { Difficulty } from '../src/ai.ts';
import { measureHitRates } from '../src/ai-measure.ts';
import { difficultySetting } from '../src/difficulty.ts';
import { memoryStorage, throwingStorage } from '../../_kit/test/record.ts';

const GAME: { arsenal: Parameters<typeof buildArsenal>[0] } = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'game.json'), 'utf8'));
const loaded = buildArsenal(GAME.arsenal);
assert.ok(loaded, 'game.json has an arsenal');
const arsenal = loaded;

function must<T>(v: T | undefined, what: string): T {
  assert.ok(v !== undefined, `${what} is missing`);
  return v;
}

// Enough seeded cases that a rate sits within a couple of points of its
// long-run value (checked against 1000), few enough to stay near seven seconds across the three widths.
const CASES = 600;
const ROUNDS = [1, 5, 10] as const;
// Percent hits, per round: the ranging shot, and the shot after two corrections.
const NORMAL = { ranging: { 1: 10, 5: 15, 10: 25 }, twice: { 1: 25, 5: 40, 10: 55 } };
const BAND = 5;

const WIDTHS = (process.env.TANKITY_HITRATE_WIDTHS || '720,1080,1440').split(',').map(Number);
for (const w of WIDTHS) assert.ok(fieldWidthOk(w), `${w} is not a width a match can be dealt at`);
type Round = typeof ROUNDS[number];
const rates: Record<number, Partial<Record<Difficulty, Partial<Record<Round, number[]>>>>> = {};
for (const w of WIDTHS) {
  const byLevel: Partial<Record<Difficulty, Partial<Record<Round, number[]>>>> = rates[w] = {};
  for (const d of DIFFICULTIES) {
    const byRound: Partial<Record<Round, number[]>> = byLevel[d] = {};
    for (const r of ROUNDS) byRound[r] = measureHitRates(arsenal, r, d, CASES, 3, w).map(p => p * 100);
  }
}
const cell = (d: Difficulty, r: Round, shot: number, w = 720): number =>
  must(must(must(must(rates[w], `${w} wide`)[d], d)[r], `round ${r}`)[shot], `shot ${shot}`);

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

for (const w of WIDTHS) {
  test(`normal hits within 5 points of its targets, ${w} wide`, () => {
    for (const r of ROUNDS) {
      assert.ok(Math.abs(cell('normal', r, 0, w) - NORMAL.ranging[r]) <= BAND, `round ${r} ranging shot: ${cell('normal', r, 0, w).toFixed(1)}%`);
      assert.ok(Math.abs(cell('normal', r, 2, w) - NORMAL.twice[r]) <= BAND, `round ${r} after two corrections: ${cell('normal', r, 2, w).toFixed(1)}%`);
    }
  });

  test(`easy hits about half as often as normal, ${w} wide`, () => {
    for (const r of ROUNDS) {
      for (const shot of [0, 2]) {
        const half = cell('normal', r, shot, w) / 2;
        assert.ok(Math.abs(cell('easy', r, shot, w) - half) <= BAND, `round ${r} shot ${shot}: easy ${cell('easy', r, shot, w).toFixed(1)}%, half of normal ${half.toFixed(1)}%`);
      }
    }
  });

  test(`hard hits at least as often as normal, ${w} wide`, () => {
    for (const r of ROUNDS) {
      for (const shot of [0, 1, 2]) {
        assert.ok(cell('hard', r, shot, w) >= cell('normal', r, shot, w), `round ${r} shot ${shot}: hard ${cell('hard', r, shot, w)}%, normal ${cell('normal', r, shot, w)}%`);
      }
    }
  });
}

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
