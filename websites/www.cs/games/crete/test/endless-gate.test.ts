// Endless's generator and gate: the bank (each level passes the whole gate in test/endless-bank-*.test.ts, a quarter
// of it each, so node runs them side by side); a tier offers a bank level at every step of the climb; the generator
// gives the same level for the same seed, tier and depth; and a run's levels climb by the ramp, then hold on the plateau.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BANK } from '../src/endless/bank.ts';
import { generate, fromBank, RUN_MEMORY } from '../src/endless/generate.ts';
import type { Played, Request } from '../src/endless/generate.ts';
import { bandAfter, chapterOf, knownOf, newProblems, PLATEAU, FLOOR } from '../src/endless/gate.ts';
import { campaignLevels } from '../src/endless/campaign.ts';
import { rampProblems, rampOf, hidesWalls } from '../src/puzzle/difficulty.ts';
import type { Difficulty } from '../src/puzzle/difficulty.ts';
import { parse } from '../src/puzzle/level.ts';

const known = knownOf(campaignLevels());

test('the bank, a safety net for every tier: ten levels or more each, with the tier\'s own newest pieces from Chapter 2 on, none hiding walls', () => {
  for (let tier = 1; tier <= 10; tier++) {
    const offered = BANK.filter(b => b.chapter <= tier);
    assert.ok(offered.length >= 10, `tier ${tier}: ${offered.length} levels`);
  }
  // Chapter 4's pieces only hide walls, and Chapter 10 brings none.
  for (const c of [1, 2, 3, 5, 6, 7, 8, 9]) assert.ok(BANK.filter(b => b.chapter === c).length >= 2, `Chapter ${c}'s pieces`);
  for (const b of BANK) assert.equal(hidesWalls(parse(b.text)), false);
});

test('no two bank levels repeat a layout', () => {
  const levels = BANK.map(b => parse(b.text));
  for (let i = 0; i < levels.length; i++) {
    assert.deepEqual(newProblems(levels[i]!, { features: [] }, levels.filter((_, j) => j !== i)), [], `bank level ${i}`);
  }
});

/** A run of `depth` levels on `seed` taken from the bank alone, as when every search runs out of budget. */
function bankRun(seed: string, tier: number, depth: number): Played[] {
  const run: Played[] = [];
  for (let d = 1; d <= depth; d++) {
    const band = bandAfter(run.at(-1)?.explored ?? null, false)!;
    const b = fromBank(BANK, { seed, tier, depth: d, run }, band);
    run.push({ text: b.text, explored: b.explored });
  }
  return run;
}

test('the ramp: a run from the bank alone climbs by the ramp at every tier, then holds on the plateau', () => {
  for (let tier = 1; tier <= 10; tier++) {
    for (const seed of ['a', 'b', 'c']) {
      const run = bankRun(seed, tier, 16);
      run.forEach((p, i) => {
        const lv = parse(p.text);
        assert.ok(chapterOf(lv) <= tier, `tier ${tier}: only pieces it offers`);
        if (i === 0) { assert.ok(p.explored >= FLOOR); return; }
        const prev = run[i - 1]!;
        assert.notEqual(p.text, prev.text, 'never the same level twice in a row');
        const band = bandAfter(prev.explored, false)!;
        if (band.plateau) assert.ok(p.explored >= PLATEAU.least && p.explored <= PLATEAU.most, `tier ${tier} level ${i + 1} on the plateau: ${p.explored}`);
        else assert.deepEqual(rampProblems({ explored: prev.explored } as Difficulty, { explored: p.explored } as Difficulty, rampOf(lv)), [], `tier ${tier} seed ${seed} level ${i + 1}`);
      });
    }
  }
});

test('the generator: the same seed, tier and depth give the same level; another seed another', () => {
  const first = BANK.find(b => b.chapter <= 3)!;
  const req = (seed: string): Request => ({ seed, tier: 3, depth: 2, run: [{ text: first.text, explored: first.explored }], budget: 400_000 });
  const a = generate(req('same'), BANK, known), b = generate(req('same'), BANK, known);
  assert.deepEqual(a, b);
  assert.ok(a.spent > 0 && a.tries > 0, 'it searched');
  const firsts = new Set(['x1', 'x2', 'x3', 'x4', 'x5', 'x6'].map(s => generate({ seed: s, tier: 10, depth: 1, run: [] }, BANK, known).text));
  assert.ok(firsts.size >= 3, 'seeds spread over the bank');
  assert.ok(RUN_MEMORY >= 10);
});
