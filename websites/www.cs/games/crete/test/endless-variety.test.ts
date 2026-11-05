// Endless's variety: a run's boards grow up its climb, the most at Hard, wide and tall as well as square; its mazes
// come in several styles; and no level of a run looks like another of it. A run of ten levels at each grade is drawn
// here as its searches draw it: at each depth, the first round whose draft looks like none of the run's levels so far
// (the search gives way at once to the next round on one that does, and its climb and the gate keep every level it
// changes that draft into as new, runProblems). Each depth's band follows from a level scoring the middle of the band
// before it. test/endless-gate.test.ts checks the same of a run from a bank alone.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { roundOf, reachOf, SIDES } from '../src/endless/generate.ts';
import { bandAfter, knownOf, likeness, runLikeness, RUN_SAME } from '../src/endless/gate.ts';
import { STYLES, textOf } from '../src/endless/draft.ts';
import type { Style } from '../src/endless/draft.ts';
import { campaignLevels } from '../src/endless/campaign.ts';
import { parse, serialize } from '../src/puzzle/level.ts';
import type { Level } from '../src/puzzle/level.ts';
import { GRADES } from '../src/puzzle/rating.ts';
import type { Grade } from '../src/puzzle/rating.ts';

const known = knownOf(campaignLevels());
const DEPTHS = 10;
const SEEDS = ['vary0', 'vary1'];

interface Drawn { depth: number; level: Level; style: Style; plateau: boolean }

/** A run's ten levels as its searches' first parts draw them, at tier 3 (no hidden walls). */
function runOf(seed: string, grade: Grade): Drawn[] {
  const out: Drawn[] = [];
  let previous: number | null = null;
  for (let depth = 2; depth < DEPTHS + 2; depth++) {
    const band = bandAfter(previous, grade);
    const aim = { tier: 3, grade, band, hides: false };
    for (let round = 0; ; round++) {
      assert.ok(round < 400, `${grade} ${seed} depth ${depth}: no draft new to the run in 400 rounds`);
      const { plan, sketch } = roundOf([seed, 3, grade, depth, 'part', 0], aim, round);
      if (!sketch) continue;
      const level = parse(textOf(sketch, ''));
      if (likeness(level, known, out.map(d => d.level)) >= 1) continue;
      out.push({ depth, level, style: plan.style!, plateau: band.plateau });
      break;
    }
    previous = Math.floor((band.least + band.most) / 2);
  }
  return out;
}

const RUNS = Object.fromEntries(GRADES.map(g => [g, SEEDS.map(s => runOf(s, g))])) as Record<Grade, Drawn[][]>;
const area = (lv: Level) => lv.rows * lv.cols;

test('a run\'s boards vary in size and shape and grow up its climb; Hard\'s plateau boards are large', () => {
  for (const g of GRADES) for (const run of RUNS[g]) {
    const sizes = new Set(run.map(d => `${d.level.rows}x${d.level.cols}`));
    assert.ok(sizes.size >= 5, `${g}: ${[...sizes].join(' ')}`);
    assert.ok(run.some(d => d.level.rows !== d.level.cols), `${g}: some board wide or tall`);
    const early = run.slice(0, 3).reduce((n, d) => n + area(d.level), 0) / 3;
    const last = run.slice(-3).reduce((n, d) => n + area(d.level), 0) / 3;
    assert.ok(last > early * 1.15, `${g}: the boards grow (${Math.round(early)} cells, then ${Math.round(last)})`);
  }
  for (const run of RUNS.hard) {
    const plateau = run.filter(d => d.plateau);
    assert.ok(plateau.length >= 3, 'Hard reaches its plateau');
    for (const d of plateau) assert.ok(Math.min(d.level.rows, d.level.cols) >= SIDES.hard.plateau[0], `Hard's plateau: ${d.level.rows}x${d.level.cols}`);
    const mean = plateau.reduce((n, d) => n + area(d.level), 0) / plateau.length;
    assert.ok(mean >= 300 && plateau.some(d => Math.max(d.level.rows, d.level.cols) >= SIDES.hard.plateau[1]), `Hard's plateau boards are large: ${plateau.map(d => `${d.level.rows}x${d.level.cols}`).join(' ')}`);
  }
  // Hard's boards end larger than Medium's, and Medium's than Easy's.
  const end = (g: Grade) => RUNS[g].flatMap(r => r.slice(-4)).reduce((n, d) => n + area(d.level), 0);
  assert.ok(end('hard') > end('medium') && end('medium') > end('easy'), `${end('easy')} ${end('medium')} ${end('hard')}`);
});

test('a run\'s mazes come in at least three styles', () => {
  for (const g of GRADES) for (const run of RUNS[g]) {
    const styles = new Set(run.map(d => d.style));
    assert.ok(styles.size >= 3, `${g}: ${[...styles].join(' ')}`);
    for (const s of styles) assert.ok(STYLES.includes(s));
  }
});

test('no two levels of a run look alike, however turned or flipped', () => {
  for (const g of GRADES) for (const run of RUNS[g]) {
    for (let i = 0; i < run.length; i++) for (let j = 0; j < i; j++) {
      const x = runLikeness(run[i]!.level, run[j]!.level);
      assert.ok(x < RUN_SAME, `${g} depths ${run[j]!.depth} and ${run[i]!.depth}: ${x.toFixed(2)}`);
    }
  }
});

test('a board\'s reach up the climb: 0 at the first band, 1 on the plateau', () => {
  for (const g of GRADES) {
    assert.equal(reachOf(bandAfter(null, g), g), 0);
    assert.equal(reachOf(bandAfter(1e9, g), g), 1);
  }
});

test('a level flipped top to bottom or turned on its side looks like itself', () => {
  const lv = RUNS.hard[0]!.at(-1)!.level;
  const text = serialize(lv);
  const [head, grid] = [text.slice(0, text.indexOf('\n\n') + 2), text.slice(text.indexOf('\n\n') + 2).trimEnd().split('\n')];
  const flipped = parse(`${head}${[...grid].reverse().join('\n')}\n`);
  const turned = parse(`${head}${[...grid[0]!].map((_, c) => grid.map(row => row[c]).join('')).join('\n')}\n`);
  assert.ok(runLikeness(flipped, lv) >= RUN_SAME, `flipped: ${runLikeness(flipped, lv).toFixed(2)}`);
  assert.ok(runLikeness(turned, lv) >= RUN_SAME, `turned: ${runLikeness(turned, lv).toFixed(2)}`);
});
