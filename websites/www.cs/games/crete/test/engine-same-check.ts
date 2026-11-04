// Registers shard k's test: the engine's answers now against the recorded ones (test/engine-same.ts). Not a test file.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ALL } from './endless-bank.ts';
import { campaignLevels, CAMPAIGN_TEXTS } from '../src/endless/campaign.ts';
import { knownOf } from '../src/endless/gate.ts';
import { bankAnswer, campaignAnswer, searchAnswer, shardFile, SEARCHES, SHARDS } from './engine-same.ts';
import type { Shard } from './engine-same.ts';

export function engineShard(k: number): void {
  const want = JSON.parse(readFileSync(shardFile(k), 'utf8')) as Shard;
  const known = knownOf(campaignLevels());
  // JSON has no Infinity or undefined: compare the answers as JSON writes them.
  const asJson = (x: unknown) => JSON.parse(JSON.stringify(x)) as unknown;

  test(`engine shard ${k + 1} of ${SHARDS}: every campaign level measures and passes or fails each piece as before`, () => {
    const ids = CAMPAIGN_TEXTS.filter((_, i) => i % SHARDS === k).map(t => t.id);
    assert.deepEqual(want.campaign.map(c => c.id), ids, 'the recorded levels are the campaign\'s: record them again (tools/engine-same.ts)');
    for (const c of want.campaign) {
      const t = CAMPAIGN_TEXTS.find(x => x.id === c.id)!;
      assert.deepEqual(asJson(campaignAnswer(t.id, t.text)), c, `campaign level ${c.id}`);
    }
  });

  test(`engine shard ${k + 1} of ${SHARDS}: every bank level measures and passes the gate as before`, () => {
    assert.deepEqual(want.bank.map(b => b.i), ALL.map((_, i) => i).filter(i => i % SHARDS === k), 'the recorded levels are the bank\'s');
    for (const b of want.bank) assert.deepEqual(asJson(bankAnswer(b.i, known)), b, `bank level ${b.i}`);
  });

  test(`engine shard ${k + 1} of ${SHARDS}: the Endless searches make the same levels, spending the same`, () => {
    assert.deepEqual(want.searches.map(s => `${s.tier}/${s.grade}/${s.seed}/${s.k}`), SEARCHES.filter((_, i) => i % SHARDS === k).map(s => `${s.tier}/${s.grade}/${s.seed}/${s.k}`));
    for (const s of want.searches) assert.deepEqual(asJson(searchAnswer(SEARCHES.find(x => x.seed === s.seed && x.tier === s.tier && x.grade === s.grade && x.k === s.k)!, known)), s, `search ${s.tier}/${s.grade}/${s.seed}/${s.k}`);
  });
}
