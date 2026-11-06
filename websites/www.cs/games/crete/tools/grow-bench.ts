// Measures how many Hard levels an hour of part time makes, three ways, on fixed sets of tuples drawn as
// tools/generate-bank.ts draws them (from the seed `bench-grow`, so every run measures the same ones): `fresh`, a Hard
// plateau tuple's part as a search for a Hard draft (every Hard part in the generator's version 2, its even parts
// now); `grown`, the same part grown from a Medium search at the same place (generate.ts's growOf, its odd parts now);
// and `child`, a Medium plateau tuple's part with its Hard child (provenance.ts's childOf), as tools/generate-bank.ts
// makes them, its whole time charged to the Hard child though it makes a Medium level too. One JSON line per tuple
// and way, with the seconds it took, the Hard score it made and its parent's (the Medium level's).
//
//   node tools/grow-bench.ts <tuples> [ways] [lane] [lanes] [first]   # e.g. 40 fresh,grown,child 0 2; first skips the
//                                                                     # tuples before it, for a run that goes on
//   node tools/grow-bench.ts sum <file.jsonl>...                # Hard levels per part-hour, each way
//
// Run from games/crete, one lane a core.
import { readFileSync } from 'node:fs';
import { searchPart, GROWN_STEPS } from '../src/endless/generate.ts';
import { knownOf } from '../src/endless/gate.ts';
import { campaignLevels } from '../src/endless/campaign.ts';
import { rngOf } from '../src/endless/random.ts';
import { grownOf, remake, requestOf } from '../src/endless/provenance.ts';
import type { Tuple } from '../src/endless/provenance.ts';
import { tupleFor } from './generate-bank.ts';

const WAYS = ['fresh', 'grown', 'child'] as const;
type Way = (typeof WAYS)[number];

const [cmd, ...rest] = process.argv.slice(2);
if (cmd === 'sum') {
  const by = new Map<string, { n: number; made: number; parents: number; ms: number }>();
  for (const f of rest) for (const line of readFileSync(f, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    const r = JSON.parse(line) as { way: Way; ms: number; score: number | null; parent: number | null };
    const t = by.get(r.way) ?? { n: 0, made: 0, parents: 0, ms: 0 };
    t.n++; t.ms += r.ms; if (r.score !== null) t.made++; if (r.parent !== null) t.parents++;
    by.set(r.way, t);
  }
  for (const way of WAYS) {
    const t = by.get(way);
    if (!t) continue;
    const hours = t.ms / 3_600_000;
    const parents = way === 'fresh' ? '' : ` (from ${t.parents} Medium parents)`;
    console.log(`${way}: ${t.made}/${t.n} parts made a Hard level${parents} in ${hours.toFixed(2)} part-hours: ${(t.made / hours).toFixed(1)} an hour, ${t.made ? Math.round(t.ms / 1000 / t.made) : '-'} s each`);
  }
} else {
  const n = Number(cmd ?? 20), ways = (rest[0] ?? WAYS.join(',')).split(',') as Way[];
  const lane = Number(rest[1] ?? 0), lanes = Number(rest[2] ?? 1), first = Number(rest[3] ?? 0);
  const known = knownOf(campaignLevels());
  const random = rngOf('bench-grow');
  const tuples: Tuple[] = [];
  for (let i = 0; i < n; i++) tuples.push(tupleFor({ grade: 'hard', plateau: true, large: false }, () => random.next()));
  const mediums: Tuple[] = [];
  for (let i = 0; i < n; i++) mediums.push(tupleFor({ grade: 'medium', plateau: true, large: false }, () => random.next()));
  tuples.forEach((hard, i) => {
    if (i < first || i % lanes !== lane) return;
    for (const way of ways) {
      const t0 = Date.now();
      const t = way === 'child' ? mediums[i]! : hard;
      let score: number | null, parent: number | null = null;
      if (way === 'child') {
        const r = remake(t, known, undefined, true);
        parent = r.made?.score ?? null;
        score = r.child?.made.score ?? null;
      } else if (way === 'grown') {
        const g = grownOf({ ...t, grow: { from: 'medium', seed: 'part', steps: GROWN_STEPS } }, known);
        parent = g.parent?.score ?? null;
        score = g.part.found?.score ?? null;
      } else score = searchPart(requestOf(t), t.k, known).found?.score ?? null;
      console.log(JSON.stringify({ i, way, seed: t.seed, tier: t.tier, k: t.k, score, parent, ms: Date.now() - t0 }));
    }
  });
}
