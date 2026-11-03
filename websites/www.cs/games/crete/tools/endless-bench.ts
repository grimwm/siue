// Measures how often Endless's search finds a level within its budget, as the browser runs it: a run's second
// level (after the bank's first for that seed) at each tier, one JSON line per level with each part's time.
//
//   node tools/endless-bench.ts <tiers> <seeds> [lane] [lanes]   # e.g. 1-10 50 0 4
//   node tools/endless-bench.ts sum <file.jsonl>...               # the share made, by tier
//
// `lane` of `lanes` takes every lanes-th search, so four can run at once. Run from games/crete.
import { readFileSync } from 'node:fs';
import { fromBank, makePart, settle, PARTS } from '../src/endless/generate.ts';
import type { Made, Part } from '../src/endless/generate.ts';
import { BANK } from '../src/endless/bank.ts';
import { bandAfter, knownOf } from '../src/endless/gate.ts';
import { campaignLevels } from '../src/endless/campaign.ts';

/** The wall time of parts handed out in order to `n` workers, as src/endless/client.ts does: none past the first that
 *  found a level, and done once every part up to it is back. Parts not run (past the one that settled) take none. */
function wall(parts: readonly { ms: number; found: boolean }[], n: number): number {
  const free = Array<number>(n).fill(0);
  let end = 0;
  for (const p of parts) {
    const w = free.indexOf(Math.min(...free));
    free[w]! += p.ms;
    end = Math.max(end, free[w]!);
  }
  return end;
}

const [cmd, ...rest] = process.argv.slice(2);
if (cmd === 'sum') {
  const by = new Map<number, { n: number; made: number; ms: number[]; w3: number[] }>();
  for (const f of rest) for (const line of readFileSync(f, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    const r = JSON.parse(line) as { tier: number; from: string; ms?: number; parts?: { ms: number; found: boolean }[] };
    const t = by.get(r.tier) ?? { n: 0, made: 0, ms: [], w3: [] };
    t.n++; if (r.from === 'made') t.made++;
    // A level's time: one worker's (the parts in a row; for the old runs, the one search), and three workers'.
    t.ms.push(r.parts ? r.parts.reduce((n, p) => n + p.ms, 0) : r.ms!);
    if (r.parts) t.w3.push(wall(r.parts, 3));
    by.set(r.tier, t);
  }
  let n = 0, made = 0;
  for (const [tier, t] of [...by].sort((a, b) => a[0] - b[0])) {
    n += t.n; made += t.made;
    const med = (xs: number[]) => (xs.length ? Math.round([...xs].sort((a, b) => a - b)[xs.length >> 1]! / 1000) : '-');
    console.log(`tier ${tier}: ${t.made}/${t.n} fresh (${Math.round(100 * t.made / t.n)}%), median per level ${med(t.ms)} s on one worker, ${med(t.w3)} s on three`);
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
      const req = { seed, tier, depth: 2, run: [{ text: first.text, explored: first.explored }] };
      // The parts one after another, as one worker runs them, each timed.
      const parts: { ms: number; found: boolean; spent: number }[] = [];
      const results: Part[] = [];
      let made: Made | null = null;
      for (let p = 0; p < PARTS && !made; p++) {
        const t0 = Date.now();
        const r = makePart(req, p, known);
        results.push(r);
        parts.push({ ms: Date.now() - t0, found: !!r.found, spent: r.spent });
        made = settle(results, PARTS).made;
      }
      console.log(JSON.stringify({ tier, seed, from: made ? 'made' : 'bank', part: made ? parts.length - 1 : null, explored: made?.explored ?? null, spent: parts.reduce((n, p) => n + p.spent, 0), parts }));
    }
  }
}
