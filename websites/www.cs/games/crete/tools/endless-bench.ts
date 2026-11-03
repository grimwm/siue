// Measures how often Endless's search finds a level within its budget, as the browser runs it: a run's second
// level (after the bank's first for that seed) at each tier, one JSON line per search.
//
//   node tools/endless-bench.ts <tiers> <seeds> [lane] [lanes]   # e.g. 1-10 50 0 4
//   node tools/endless-bench.ts sum <file.jsonl>...               # the share made, by tier
//
// `lane` of `lanes` takes every lanes-th search, so four can run at once. Run from games/crete.
import { readFileSync } from 'node:fs';
import { generate, fromBank, BUDGET } from '../src/endless/generate.ts';
import { BANK } from '../src/endless/bank.ts';
import { bandAfter, knownOf } from '../src/endless/gate.ts';
import { campaignLevels } from '../src/endless/campaign.ts';

const [cmd, ...rest] = process.argv.slice(2);
if (cmd === 'sum') {
  const by = new Map<number, { n: number; made: number; ms: number[] }>();
  for (const f of rest) for (const line of readFileSync(f, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    const r = JSON.parse(line) as { tier: number; from: string; ms: number };
    const t = by.get(r.tier) ?? { n: 0, made: 0, ms: [] };
    t.n++; if (r.from === 'made') { t.made++; t.ms.push(r.ms); }
    by.set(r.tier, t);
  }
  let n = 0, made = 0;
  for (const [tier, t] of [...by].sort((a, b) => a[0] - b[0])) {
    n += t.n; made += t.made;
    const ms = t.ms.sort((a, b) => a - b);
    console.log(`tier ${tier}: ${t.made}/${t.n} made (${Math.round(100 * t.made / t.n)}%), median ${ms.length ? Math.round(ms[ms.length >> 1]! / 1000) : '-'} s`);
  }
  console.log(`all: ${made}/${n} (${Math.round(100 * made / Math.max(1, n))}%)`);
} else {
  const [tiersS = '1-10', seedsS = '50', laneS = '0', lanesS = '1'] = [cmd, ...rest];
  const [lo, hi = lo] = tiersS!.split('-').map(Number) as [number, number?];
  const seeds = Number(seedsS), lane = Number(laneS), lanes = Number(lanesS);
  const known = knownOf(campaignLevels());
  let k = 0;
  for (let tier = lo; tier <= hi!; tier++) {
    for (let i = 0; i < seeds; i++) {
      if (k++ % lanes !== lane) continue;
      const seed = `bench${i}`;
      const first = fromBank(BANK, { seed, tier, depth: 1, run: [] }, bandAfter(null, false)!);
      const t0 = Date.now();
      const m = generate({ seed, tier, depth: 2, run: [{ text: first.text, explored: first.explored }] }, BANK, known);
      console.log(JSON.stringify({ tier, seed, from: m.from, explored: m.explored, spent: m.spent, budget: BUDGET, tries: m.tries, ms: Date.now() - t0 }));
    }
  }
}
