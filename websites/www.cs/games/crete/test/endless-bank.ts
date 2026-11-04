// The whole gate over every bank level, measured again now, a shard at a time: test/endless-bank-<k>.test.ts runs
// shard k of SHARDS, so node runs the four side by side. Not a test file.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BANK } from '../src/endless/bank.ts';
import { chapterOf, floorOf, gateProblems, knownOf, PLATEAU } from '../src/endless/gate.ts';
import { campaignLevels } from '../src/endless/campaign.ts';
import { measure } from '../src/puzzle/difficulty.ts';
import { parse } from '../src/puzzle/level.ts';
import { lineOf } from '../src/puzzle/cache.ts';
import { initial } from '../src/puzzle/state.ts';
import { step } from '../src/puzzle/step.ts';

export const SHARDS = 4;

export function bankShard(k: number): void {
  test(`bank levels ${k + 1} of every ${SHARDS} pass the whole gate, as they measure now: the bars, no catch, every piece, a live beast, nothing under a figure, tidy and new`, () => {
    const known = knownOf(campaignLevels());
    const failed: string[] = [];
    BANK.forEach((b, i) => {
      if (i % SHARDS !== k) return;
      const level = parse(b.text);
      const d = measure(level);
      assert.equal(chapterOf(level), b.chapter, `bank level ${i}: its chapter`);
      assert.deepEqual([d.explored, d.shortest], [b.explored, b.shortest], `bank level ${i}: its numbers`);
      // Its line wins: Ariadne's thread follows it.
      let s = initial(level);
      for (const a of lineOf(b.line)!) s = step(s, a).state;
      assert.equal(s.outcome, 'won', `bank level ${i}: its line wins`);
      const problems = gateProblems(level, d, { band: { least: floorOf(b.chapter).explored, most: PLATEAU.most, plateau: true }, previous: null }, known);
      if (problems.length) failed.push(`${i} (${b.chapter}/${b.explored}): ${problems.join('; ')}`);
    });
    assert.deepEqual(failed, []);
  });
}
