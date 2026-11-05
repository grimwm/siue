// Endless's generator and gate: each grade's bank (each level passes the whole gate in test/endless-bank-*.test.ts, a
// quarter of it each, so node runs them side by side) covers every tier, every family and hidden walls, with few cows
// in Hard; a run from a bank alone climbs by the score; the generator gives the same level for the same seed, tier,
// grade and depth; and a fixed seed is made fresh at each grade.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BANKS } from '../src/endless/bank.ts';
import { generate, fromBank, makePart, holds, placeOf, RUN_MEMORY } from '../src/endless/generate.ts';
import type { Played, Request } from '../src/endless/generate.ts';
import { bandAfter, chapterOf, gateProblems, knownOf, newProblems, GRADE_BANDS, HIDDEN_EASE, CLIMB } from '../src/endless/gate.ts';
import { campaignLevels } from '../src/endless/campaign.ts';
import { familiesOf } from '../src/endless/draft.ts';
import { measure, hidesWalls } from '../src/puzzle/difficulty.ts';
import { GRADES } from '../src/puzzle/rating.ts';
import type { Grade } from '../src/puzzle/rating.ts';
import type { Difficulty } from '../src/puzzle/difficulty.ts';
import { parse } from '../src/puzzle/level.ts';

const known = knownOf(campaignLevels());

test('each grade\'s bank, a safety net for every tier: ten levels or more each, every family, hidden walls, few cows in Hard', () => {
  for (const g of GRADES) {
    const bank = BANKS[g];
    for (let tier = 1; tier <= 10; tier++) assert.ok(bank.filter(b => b.chapter <= tier).length >= 10, `${g} tier ${tier}`);
    const levels = bank.map(b => parse(b.text));
    for (const f of familiesOf(9)) assert.ok(levels.some(lv => holds(lv, f)), `${g}: a level with ${f}`);
    assert.ok(levels.filter(hidesWalls).length >= 3, `${g}: levels that hide walls`);
    const plateau = GRADE_BANDS[g].plateau;
    assert.ok(bank.filter(b => b.score >= plateau[0] && b.score <= plateau[1]).length >= 3, `${g}: levels on the plateau`);
  }
  const cows = BANKS.hard.filter(b => holds(parse(b.text), 'cow')).length;
  assert.ok(cows >= 1 && cows <= BANKS.hard.length / 5, `Hard: ${cows} cows`);
});

test('no two levels of a grade\'s bank repeat a layout', () => {
  for (const g of GRADES) {
    const levels = BANKS[g].map(b => parse(b.text));
    for (let i = 0; i < levels.length; i++) {
      assert.deepEqual(newProblems(levels[i]!, { features: [] }, levels.filter((_, j) => j !== i), false), [], `${g} bank level ${i}`);
    }
  }
});

/** A run of `depth` levels on `seed` taken from the bank alone, as when every search runs out of budget. */
function bankRun(seed: string, tier: number, grade: Grade, depth: number): Played[] {
  const run: Played[] = [];
  for (let d = 1; d <= depth; d++) {
    const req: Request = { seed, tier, grade, depth: d, run };
    const place = placeOf(req);
    const b = fromBank(BANKS[grade], req, place.band, place.hides);
    run.push({ text: b.text, explored: b.explored, score: b.score });
  }
  return run;
}

test('a run from a bank alone climbs by the score at every tier and grade, a hidden-wall level eased, never a cliff, no level of its last again', () => {
  for (const grade of GRADES) for (let tier = 1; tier <= 10; tier++) {
    for (const seed of ['a', 'b']) {
      const run = bankRun(seed, tier, grade, 14);
      run.forEach((p, i) => {
        const lv = parse(p.text);
        assert.ok(chapterOf(lv) <= tier, `${grade} tier ${tier}: only pieces it offers`);
        if (i === 0) return;
        assert.notEqual(p.text, run[i - 1]!.text, 'never the same level twice in a row');
        // With more levels than the run remembers to offer, none of its last levels comes back.
        if (BANKS[grade].filter(b => b.chapter <= tier).length > RUN_MEMORY) {
          assert.ok(!run.slice(Math.max(0, i - RUN_MEMORY), i).some(q => q.text === p.text), `${grade} tier ${tier} seed ${seed} level ${i + 1}: a repeat`);
        }
        // Against the last plain level before it: no cliff up, and a dip only as deep as a hidden level's ease.
        const plain = [...run.slice(0, i)].reverse().find(q => !hidesWalls(parse(q.text)))!;
        assert.ok(p.score <= Math.max(plain.score * CLIMB.most, GRADE_BANDS[grade].plateau[1]), `${grade} tier ${tier} seed ${seed} level ${i + 1}: ${plain.score} → ${p.score}`);
        assert.ok(p.score >= plain.score * HIDDEN_EASE.least * 0.9 || p.score >= GRADE_BANDS[grade].plateau[0] * HIDDEN_EASE.least, `${grade} tier ${tier} seed ${seed} level ${i + 1}: ${plain.score} → ${p.score}`);
      });
    }
  }
});

test('a fixed seed is made fresh by its first part at each grade, and the level passes the whole gate', () => {
  const prev = { text: 'title: \nintro: \n\n#######\n#P...E#\n#M....#\n#######\n', explored: 3000, score: 30 };
  // tools/endless-bench.ts measures how often the search makes a level fresh; these pin one seed a grade that does.
  for (const [grade, seed] of [['easy', 'fixed0'], ['medium', 'fixed1'], ['hard', 'fixed0']] as const) {
    const req: Request = { seed, tier: 9, grade, depth: 2, run: [prev] };
    const part = makePart(req, 0, known);
    assert.ok(part.found, `${grade}: made fresh within its part's budget`);
    const level = parse(part.found.text);
    const d = measure(level);
    assert.deepEqual([d.explored, d.shortest], [part.found.explored, part.found.shortest]);
    const band = placeOf(req).band;
    assert.ok(part.found.score >= band.least && part.found.score <= band.most, `${grade}: scored ${part.found.score} in ${band.least} to ${band.most}`);
    assert.deepEqual(gateProblems(level, d, { grade, band, previous: { explored: prev.explored } as Difficulty }, known, [parse(prev.text)]), [], grade);
  }
});

test('the generator: the same seed, tier, grade and depth give the same level; another grade another', () => {
  const first = BANKS.medium.find(b => b.chapter <= 3)!;
  const req = (seed: string, grade: Grade): Request => ({ seed, tier: 3, grade, depth: 2, run: [{ text: first.text, explored: first.explored, score: first.score }], budget: 400_000 });
  const a = generate(req('same', 'medium'), BANKS, known), b = generate(req('same', 'medium'), BANKS, known);
  assert.deepEqual(a, b);
  assert.ok(a.spent > 0 && a.tries > 0, 'it searched');
  const firsts = new Set(['x1', 'x2', 'x3', 'x4', 'x5', 'x6'].map(s => generate({ seed: s, tier: 10, grade: 'hard', depth: 1, run: [] }, BANKS, known).text));
  assert.ok(firsts.size >= 3, 'seeds spread over the bank');
  assert.ok(BANKS.hard.some(l => l.text === [...firsts][0]), 'a Hard run starts from Hard\'s bank');
  assert.ok(RUN_MEMORY >= 10);
  void bandAfter;
});
