// The whole gate over every level of every grade's bank, measured again now, at its grade, a shard at a time: test/endless-bank-<k>.test.ts runs
// shard k of SHARDS, so node runs the four side by side. Not a test file.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BANKS } from '../src/endless/bank.ts';
import { chapterOf, gateProblems, knownOf } from '../src/endless/gate.ts';
import { finish } from '../src/puzzle/astar.ts';
import { scoring, GRADES } from '../src/puzzle/rating.ts';
import { campaignLevels } from '../src/endless/campaign.ts';
import { measure } from '../src/puzzle/difficulty.ts';
import { parse } from '../src/puzzle/level.ts';
import { lineOf } from '../src/puzzle/cache.ts';
import { initial } from '../src/puzzle/state.ts';
import { step } from '../src/puzzle/step.ts';

export const SHARDS = 4;

/** Every grade's bank levels, as one list. */
export const ALL = GRADES.flatMap(g => BANKS[g].map((b, i) => ({ grade: g, i, b })));

export function bankShard(k: number): void {
  test(`bank levels ${k + 1} of every ${SHARDS} pass the whole gate at their grade, as they measure now: the bars, no catch, no habit win, open space that earns its place, every piece, a live beast, nothing under a figure, tidy and new`, () => {
    const known = knownOf(campaignLevels());
    const failed: string[] = [];
    ALL.forEach(({ grade, i, b }, j) => {
      if (j % SHARDS !== k) return;
      const level = parse(b.text);
      const d = measure(level);
      assert.equal(chapterOf(level), b.chapter, `${grade} bank level ${i}: its chapter`);
      assert.deepEqual([d.explored, d.shortest], [b.explored, b.shortest], `${grade} bank level ${i}: its numbers`);
      assert.equal(finish(scoring(level, d)).total, b.score, `${grade} bank level ${i}: its score`);
      // Its line wins: Ariadne's thread follows it.
      let s = initial(level);
      for (const a of lineOf(b.line)!) s = step(s, a).state;
      assert.equal(s.outcome, 'won', `${grade} bank level ${i}: its line wins`);
      const problems = gateProblems(level, d, { grade, band: { least: 0, most: Number.MAX_SAFE_INTEGER, plateau: true }, previous: null }, known);
      if (problems.length) failed.push(`${grade} ${i} (${b.chapter}/${b.score}): ${problems.join('; ')}`);
    });
    assert.deepEqual(failed, []);
  });
}
