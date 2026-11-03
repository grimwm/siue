// Endless's generator and gate: every bank level (each one the generator made) passes the whole gate as it measures
// now; a tier offers a bank level at every step of the climb; the generator gives the same level for the same seed,
// tier and depth; and a run's levels climb by the ramp, then hold on the plateau.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BANK } from '../src/endless/bank.ts';
import { generate, fromBank, RUN_MEMORY } from '../src/endless/generate.ts';
import type { Played, Request } from '../src/endless/generate.ts';
import { bandAfter, chapterOf, floorOf, gateProblems, knownOf, PLATEAU, FLOOR } from '../src/endless/gate.ts';
import { campaignLevels } from '../src/endless/campaign.ts';
import { measure, rampProblems, rampOf, hidesWalls } from '../src/puzzle/difficulty.ts';
import type { Difficulty } from '../src/puzzle/difficulty.ts';
import { parse } from '../src/puzzle/level.ts';
import { lineOf } from '../src/puzzle/cache.ts';
import { initial } from '../src/puzzle/state.ts';
import { step } from '../src/puzzle/step.ts';

const known = knownOf(campaignLevels());

test('the bank holds levels of every chapter\'s pieces, none hiding walls', () => {
  assert.ok(BANK.length >= 20, `${BANK.length} levels`);
  assert.ok(BANK.some(b => b.chapter === 1), 'Chapter 1\'s pieces alone, for a new player');
  for (const b of BANK) assert.equal(hidesWalls(parse(b.text)), false);
});

test('every bank level passes the whole gate, as it measures now: the bars, no catch, every piece, a live beast, tidy and new', () => {
  const failed: string[] = [];
  for (const b of BANK) {
    const level = parse(b.text);
    const d = measure(level);
    assert.equal(chapterOf(level), b.chapter, 'its chapter');
    assert.deepEqual([d.explored, d.shortest], [b.explored, b.shortest], 'its numbers');
    // Its line wins: Ariadne's thread follows it.
    let s = initial(level);
    for (const a of lineOf(b.line)!) s = step(s, a).state;
    assert.equal(s.outcome, 'won');
    const problems = gateProblems(level, d, { band: { least: floorOf(b.chapter).explored, most: PLATEAU.most, plateau: true }, previous: null }, known);
    if (problems.length) failed.push(`${b.chapter}/${b.explored}: ${problems.join('; ')}`);
  }
  assert.deepEqual(failed, []);
});

test('no two bank levels repeat a layout', () => {
  const levels = BANK.map(b => parse(b.text));
  for (let i = 0; i < levels.length; i++) {
    assert.deepEqual(gateProblems(levels[i]!, measure(levels[i]!), { band: { least: 0, most: Infinity, plateau: true }, previous: null }, { features: [] }, levels.filter((_, j) => j !== i))
      .filter(p => p.includes('repeats')), [], `bank level ${i}`);
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
