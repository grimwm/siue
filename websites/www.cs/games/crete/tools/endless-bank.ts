// Builds Endless's bank (src/endless/bank.ts) with the generator Endless runs in the browser, with no budget.
//
//   node tools/endless-bank.ts make <chapter> <band> <count> [salt]   # prints one JSON line per level it makes
//   node tools/endless-bank.ts fill <lane> <lanes> <dir>               # works through JOBS, lane of lanes
//   node tools/endless-bank.ts write <file.jsonl>...                    # writes src/endless/bank.ts from them
//
// `fill` takes every lanes-th job of JOBS and appends each level to <dir>/lane<lane>.jsonl as it is made, so a run
// that stops loses only the level it was on: run again, it skips every job any lane's file already holds. Run four
// at once at most, each under systemd-run --user --scope -p MemoryMax=3G -p MemorySwapMax=0.
//
// `make` searches for levels whose newest pieces are at most Chapter <chapter>'s (a tier offers a bank level from its
// chapter on) and whose search stores situations inside band <band> of BANDS, each through the whole gate. Run
// several at once (at most four), each appending to its own file, then `write` them all; `write` leaves out a level whose layout repeats one it has kept. Run from games/crete.
import { appendFileSync, existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { search } from '../src/endless/generate.ts';
import type { BankLevel } from '../src/endless/generate.ts';
import { chapterOf, knownOf, floorOf } from '../src/endless/gate.ts';
import { campaignLevels } from '../src/endless/campaign.ts';
import { measure } from '../src/puzzle/difficulty.ts';
import { parse } from '../src/puzzle/level.ts';
import { SAME, overlap } from '../src/puzzle/layouts.ts';

/** The bands the bank fills, a little under 1.3 times apart, from the shared bar up to the plateau's top. */
export const BANDS: readonly [number, number][] = [
  [6_000, 8_000], [8_000, 10_500], [10_500, 14_000], [14_000, 18_500], [18_500, 24_000], [24_000, 31_000], [31_000, 40_000], [40_000, 50_000],
];

/** The jobs `fill` works through: [chapter, band] pairs, each one level made with a family of that chapter's own
 *  pieces, so every tier's newest pieces have levels in the bank. Chapter 4's pieces (fake and invisible walls) are
 *  left out, as the bank holds no level that hides walls. */
export const JOBS: readonly (readonly [number, number])[] = [
  ...[2, 3, 5, 6, 7, 8].flatMap(c => [1, 3, 5, 7].map(b => [c, b] as const)),
  ...[1, 2, 3, 4, 5, 6, 7].map(b => [9, b] as const),
  ...[2, 3, 4, 5, 6, 7].map(b => [1, b] as const),
];
/** A bank job gives up past this many situations and is written as skipped. */
const JOB_BUDGET = 80_000_000;

/** One bank level, made by the search with no budget but `budget`; null when it runs out. */
function makeOne(chapter: number, bandNo: number, key: readonly (string | number)[], newest: boolean, budget = Number.MAX_SAFE_INTEGER): { out: BankLevel; tries: number; s: number } | null {
  const [lo, hi] = BANDS[bandNo]!;
  const least = Math.max(lo, floorOf(chapter).explored);
  if (least >= hi) throw new RangeError(`Chapter ${chapter}'s floor is past band ${bandNo}`);
  const known = knownOf(campaignLevels());
  const at = { tries: 0, spent: 0 };
  const t0 = Date.now();
  const found = search(key, chapter, { least, most: hi, plateau: false }, null, known, [], budget, at, undefined, null,
    process.env.TRACE ? line => process.stderr.write(`  ${line.slice(0, 300)}\n`) : undefined, newest);
  if (!found) return null;
  const level = parse(found.text);
  const d = measure(level);
  return { out: { text: found.text, explored: d.explored, shortest: d.shortest as number, chapter: chapterOf(level), line: d.line }, tries: at.tries, s: Math.round((Date.now() - t0) / 1000) };
}

const [cmd, ...args] = process.argv.slice(2);
if (cmd === 'fill') {
  const [laneS, lanesS, dir] = args;
  const lane = Number(laneS), lanes = Number(lanesS);
  const done = new Set<string>();
  for (const f of existsSync(dir!) ? readdirSync(dir!) : []) {
    if (!f.endsWith('.jsonl')) continue;
    for (const line of readFileSync(`${dir}/${f}`, 'utf8').split('\n')) if (line.trim()) done.add((JSON.parse(line) as { job: string }).job);
  }
  JOBS.forEach(([chapter, bandNo], j) => {
    const job = `${j}:${chapter}:${bandNo}`;
    if (j % lanes !== lane || done.has(job)) return;
    const made = makeOne(chapter, bandNo, ['bank', 'fill', j], true, JOB_BUDGET);
    if (made) process.stderr.write(`job ${job}: chapter ${made.out.chapter}, ${made.out.explored} situations, ${made.out.shortest} moves, ${made.tries} tries, ${made.s} s\n`);
    else process.stderr.write(`job ${job}: skipped past ${JOB_BUDGET}\n`);
    appendFileSync(`${dir}/lane${lane}.jsonl`, `${JSON.stringify(made ? { job, ...made.out } : { job, skipped: true })}\n`);
  });
} else if (cmd === 'make') {
  const [chapterS, bandS, countS, salt = '0'] = args;
  const chapter = Number(chapterS), [lo, hi] = BANDS[Number(bandS)]!, count = Number(countS);
  const least = Math.max(lo, floorOf(chapter).explored);
  if (least >= hi) throw new RangeError(`Chapter ${chapter}'s floor is past band ${bandS}`);
  const known = knownOf(campaignLevels());
  for (let k = 0; k < count; k++) {
    const at = { tries: 0, spent: 0 };
    const t0 = Date.now();
    const found = search(['bank', chapter, bandS!, salt, k], chapter, { least, most: hi, plateau: false }, null, known, [], Number.MAX_SAFE_INTEGER, at, undefined, null,
      process.env.TRACE ? line => process.stderr.write(`  ${line.slice(0, 300)}\n`) : undefined);
    if (!found) continue;
    const level = parse(found.text);
    const d = measure(level);
    const out: BankLevel = { text: found.text, explored: d.explored, shortest: d.shortest as number, chapter: chapterOf(level), line: d.line };
    process.stderr.write(`chapter ${chapter} band ${bandS}: ${d.explored} situations, ${d.shortest} moves, ${at.tries} tries, ${Math.round((Date.now() - t0) / 1000)} s\n`);
    console.log(JSON.stringify(out));
  }
} else if (cmd === 'write') {
  const seen = new Set<string>();
  const all: BankLevel[] = [];
  for (const f of args) {
    for (const line of readFileSync(f, 'utf8').split('\n')) {
      if (!line.trim()) continue;
      const b = JSON.parse(line) as BankLevel & { skipped?: boolean };
      if (b.skipped) continue;
      const counts = [b.chapter, b.explored, b.shortest].every(n => Number.isInteger(n) && n >= 0);
      if (!counts || typeof b.text !== 'string' || typeof b.line !== 'string' || !/^[a-z]*$/.test(b.line)) throw new Error(`${f}: not a bank level: ${line.slice(0, 80)}`);
      if (seen.has(b.text)) continue;
      seen.add(b.text);
      // No two bank levels repeat a layout, so a run that falls back on the bank never meets one twice.
      const lv = parse(b.text);
      const like = all.find(k => overlap(lv, parse(k.text)) >= SAME);
      if (like) { console.log(`left out a level of chapter ${b.chapter} (${b.explored}): its layout repeats one of chapter ${like.chapter} (${like.explored})`); continue; }
      all.push(b);
    }
  }
  all.sort((a, b) => a.chapter - b.chapter || a.explored - b.explored);
  const body = all.map(b => `  { chapter: ${b.chapter}, explored: ${b.explored}, shortest: ${b.shortest}, line: ${JSON.stringify(b.line)}, text: ${JSON.stringify(b.text)} },`).join('\n');
  writeFileSync(new URL('../src/endless/bank.ts', import.meta.url), `/* The Island of Crete: Endless's bank, written by tools/endless-bank.ts; do not edit it by hand. Levels the
 * generator made ahead of time and the gate passed, for a run's first level and for any level whose search runs out
 * of its budget: ${all.length} levels, by chapter and then situations stored. DOM-free. */
import type { BankLevel } from './generate.ts';

export const BANK: readonly BankLevel[] = [
${body}
];
`);
  console.log(`wrote ${all.length} levels`);
} else {
  console.error('usage: endless-bank.ts make <chapter> <band> <count> [salt] | write <file.jsonl>...');
  process.exit(2);
}
