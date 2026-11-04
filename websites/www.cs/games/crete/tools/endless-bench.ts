// Measures how often Endless's search finds a level within its budget, as the browser runs it, one JSON line per
// level with each part's time: for each grade, a run's second level (after the bank's first for that seed), and a
// level on the plateau (after a level that scored the plateau's start), at each tier.
//
//   node tools/endless-bench.ts <tiers> <seeds> [lane] [lanes] [done-dir]   # e.g. 1-10 50 0 4 out/
//
// For a phone, run it under systemd-run --user --scope -p CPUQuota=25%: one core at a quarter of its speed, a 4×
// throttle of the worker's JavaScript (Chrome's CPU throttling does not reach a worker).
//   node tools/endless-bench.ts sum <file.jsonl>...               # the share made, by tier
//
// `lane` of `lanes` takes every lanes-th search, so four can run at once. Run from games/crete.
import { readFileSync, readdirSync } from 'node:fs';
import { fromBank, makePart, settle, PARTS } from '../src/endless/generate.ts';
import type { Made, Part } from '../src/endless/generate.ts';
import { AHEAD } from '../src/endless/saved.ts';
import { BANKS } from '../src/endless/bank.ts';
import { bandAfter, knownOf, GRADE_BANDS } from '../src/endless/gate.ts';
import { GRADES } from '../src/puzzle/rating.ts';
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

/** A run of `levels` levels played at `play` seconds each, the workers making each next level in `make[i]` seconds
 *  (taken in turn) and staying AHEAD in front, as src/endless/mode.ts does: how often the player waits at Next Level,
 *  for how long in all, and how many levels were ready, on average, when a level was won. */
function ahead(make: readonly number[], play: number, levels = 30): { waits: number; waited: number; ready: number } {
  const done: number[] = [0];
  let at = 0, waits = 0, waited = 0, ready = 0, busy = 0;
  for (let i = 1; i < levels; i++) {
    // The level the player is on was opened at `at`; the workers make the next ones in order, at most AHEAD past it.
    const won = at + play;
    while (done.length <= i + AHEAD - 1 && done.length < levels) {
      const start = Math.max(busy, done.length - AHEAD >= 0 ? openAt[done.length - AHEAD] ?? 0 : 0);
      busy = start + make[(done.length - 1) % make.length]!;
      done.push(busy);
    }
    ready += done.filter((t, k) => k > i - 1 && t <= won).length;
    if (done[i]! > won) { waits++; waited += done[i]! - won; }
    at = Math.max(won, done[i]!);
    openAt[i] = at;
  }
  return { waits, waited, ready: ready / (levels - 1) };
}
const openAt: number[] = [0];

const [cmd, ...rest] = process.argv.slice(2);
if (cmd === 'sum') {
  const by = new Map<string, { n: number; made: number; ms: number[]; w3: number[] }>();
  for (const f of rest) for (const line of readFileSync(f, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    const r = JSON.parse(line) as { tier: number; grade: string; where: string; from: string; ms?: number; parts?: { ms: number; found: boolean }[] };
    const key = `${r.grade} ${r.where}`;
    const t = by.get(key) ?? { n: 0, made: 0, ms: [], w3: [] };
    t.n++; if (r.from === 'made') t.made++;
    // A level's time: one worker's (the parts in a row; for the old runs, the one search), and three workers'.
    t.ms.push(r.parts ? r.parts.reduce((n, p) => n + p.ms, 0) : r.ms!);
    if (r.parts) t.w3.push(wall(r.parts, 3));
    by.set(key, t);
  }
  let n = 0, made = 0;
  for (const [tier, t] of [...by].sort((a, b) => a[0].localeCompare(b[0]))) {
    n += t.n; made += t.made;
    const med = (xs: number[]) => (xs.length ? Math.round([...xs].sort((a, b) => a - b)[xs.length >> 1]! / 1000) : '-');
    console.log(`${tier}: ${t.made}/${t.n} fresh (${Math.round(100 * t.made / t.n)}%), median per level ${med(t.ms)} s on one worker, ${med(t.w3)} s on three`);
    if (t.w3.length) for (const [who, slow] of [['workstation', 1], ['phone (3.5× slower)', 3.5]] as const) {
      const words = [60, 120].map(play => {
        openAt.length = 1;
        const a = ahead(t.w3.map(ms => slow * ms / 1000), play);
        return `${play} s a level: ${a.waits} waits in 29 levels (${Math.round(a.waited)} s), ${a.ready.toFixed(1)} ready at each win`;
      });
      console.log(`  ${who}: ${words.join('; ')}`);
    }
  }
  console.log(`all: ${made}/${n} (${Math.round(100 * made / Math.max(1, n))}%)`);
} else {
  const [tiersS = '1-10', seedsS = '50', laneS = '0', lanesS = '1', doneDir] = [cmd, ...rest];
  const [lo, hi = lo] = tiersS!.split('-').map(Number) as [number, number?];
  const seeds = Number(seedsS), lane = Number(laneS), lanes = Number(lanesS);
  const known = knownOf(campaignLevels());
  // Levels a stopped run already measured (any .jsonl in `doneDir`) are not measured again.
  const done = new Set<string>();
  if (doneDir) for (const f of readdirSync(doneDir)) if (f.endsWith('.jsonl')) {
    for (const line of readFileSync(`${doneDir}/${f}`, 'utf8').split('\n')) if (line.trim()) { const r = JSON.parse(line) as { tier: number; grade: string; where: string; seed: string }; done.add(`${r.tier}/${r.grade}/${r.where}/${r.seed}`); }
  }
  let k = 0;
  // Seed by seed across the tiers, so a run stopped early has measured every tier alike.
  for (let i = 0; i < seeds; i++) {
    for (let tier = lo; tier <= hi!; tier++) for (const grade of GRADES) for (const where of ['second', 'plateau'] as const) {
      const seed = `bench${i}`;
      if (done.has(`${tier}/${grade}/${where}/${seed}`) || k++ % lanes !== lane) continue;
      const first = fromBank(BANKS[grade], { seed, tier, grade, depth: 1, run: [] }, bandAfter(null, grade));
      const before = where === 'second' ? first.score : GRADE_BANDS[grade].plateau[0];
      const req = { seed, tier, grade, depth: 2, run: [{ text: first.text, explored: first.explored, score: before }] };
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
      console.log(JSON.stringify({ tier, grade, where, seed, from: made ? 'made' : 'bank', part: made ? parts.length - 1 : null, explored: made?.explored ?? null, spent: parts.reduce((n, p) => n + p.spent, 0), parts }));
    }
  }
}
