// Records the engine's answers that test/engine-same-<k>.test.ts holds every later engine to (test/engine-same.ts):
// every campaign level's measure and every-piece verdicts, every bank level's measure and gate, and the Endless
// searches of SEARCHES.
//
//   node tools/engine-same.ts record <shard>    # writes test/engine-same/shard-<shard>.json
//
// Record from the engine the answers must match (a rewrite records before it starts), one shard a process, at most
// three at once. A new campaign or bank level is recorded the same way, from an engine already held to the old
// answers. Run from games/crete.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { shardAnswers, shardFile, SHARDS } from '../test/engine-same.ts';

const [cmd, shardS] = process.argv.slice(2);
const k = Number(shardS);
if (cmd !== 'record' || !Number.isInteger(k) || k < 0 || k >= SHARDS) {
  console.error(`usage: node tools/engine-same.ts record <0 to ${SHARDS - 1}>`);
  process.exit(2);
}
const t0 = Date.now();
const shard = shardAnswers(k, what => console.log(`${((Date.now() - t0) / 1000).toFixed(1)} s: ${what}`));
mkdirSync(dirname(shardFile(k)), { recursive: true });
writeFileSync(shardFile(k), JSON.stringify(shard, null, 1) + '\n');
console.log(`wrote ${shardFile(k)}`);
