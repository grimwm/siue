// Builds Endless's banks (src/endless/bank.ts), one for each grade, with the generator Endless runs in the browser,
// with no budget but a large one.
//
//   node tools/endless-bank.ts fill <lane> <lanes> <dir>      # works through JOBS, lane of lanes
//   node tools/endless-bank.ts write <file.jsonl>...           # writes src/endless/bank.ts from them
//
// `fill` takes every lanes-th job of JOBS and appends each level to <dir>/lane<lane>.jsonl as it is made, so a run
// that stops loses only the level it was on: run again, it skips every job any lane's file already holds. Run four
// at once at most, each under systemd-run --user --scope -p MemoryMax=3G -p MemorySwapMax=0. `write` leaves out a
// level whose layout repeats one its grade's bank has kept. Run from games/crete.
import { appendFileSync, existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { search } from '../src/endless/generate.ts';
import type { BankLevel } from '../src/endless/generate.ts';
import { bandAfter, chapterOf, hiddenBand, knownOf, mazeOverlap, GRADE_BANDS } from '../src/endless/gate.ts';
import type { Band } from '../src/endless/gate.ts';
import { campaignLevels } from '../src/endless/campaign.ts';
import { measure } from '../src/puzzle/difficulty.ts';
import { finish } from '../src/puzzle/astar.ts';
import { scoring, GRADES } from '../src/puzzle/rating.ts';
import type { Grade } from '../src/puzzle/rating.ts';
import { parse } from '../src/puzzle/level.ts';
import type { Level } from '../src/puzzle/level.ts';
import { FAMILY_CHAPTER } from '../src/endless/draft.ts';
import type { Family } from '../src/endless/draft.ts';
import { SAME } from '../src/puzzle/layouts.ts';

/** A grade's bands from its first level to its plateau, each climbing from the middle of the one before. */
export function bandsOf(grade: Grade): Band[] {
  const out = [bandAfter(null, grade)];
  while (!out.at(-1)!.plateau) { const b = out.at(-1)!; out.push(bandAfter(Math.floor((b.least + b.most) / 2), grade)); }
  return out;
}

/** One bank job: a grade, the tier it searches at, the family it must hold (null for any), and the band it falls in,
 *  by its index in bandsOf; `hidden` for a level that hides walls, in the hidden band of that place. */
export interface Job { grade: Grade; tier: number; family: Family | null; band: number; hidden: boolean }

const CH1: Family[] = ['keys', 'water', 'fire', 'ice', 'force', 'blocks', 'toggle', 'mirror', 'cow'];
const LATER: Family[] = ['gravel', 'popup', 'snare', 'teleport', 'ball', 'glider', 'fireball', 'thief', 'bomb', 'clone'];

/** The jobs for each grade: every family of every chapter once (Chapter 1's at tier 1, so tier 1 has a run; the
 *  rest at their own chapter), fake and invisible walls in hidden bands, two more Chapter 1 levels, two more that hide
 *  walls, and three more on the plateau. The bands go round in turn, so each band gets levels. */
export function jobsOf(grade: Grade): Job[] {
  const n = bandsOf(grade).length;
  const out: Job[] = [];
  let k = 0;
  const next = () => k++ % n;
  for (const f of CH1) out.push({ grade, tier: 1, family: f, band: next(), hidden: false });
  out.push({ grade, tier: 1, family: null, band: 0, hidden: false }, { grade, tier: 1, family: null, band: n - 1, hidden: false });
  for (const f of LATER) out.push({ grade, tier: FAMILY_CHAPTER[f], family: f, band: next(), hidden: false });
  for (const [f, tier, band] of [['fake', 4, 0], ['invisible', 4, 1], ['fake', 6, n - 1], ['invisible', 9, n - 1]] as const) {
    out.push({ grade, tier, family: f, band: Math.min(band, n - 1), hidden: true });
  }
  for (const tier of [5, 7, 9]) out.push({ grade, tier, family: null, band: n - 1, hidden: false });
  return out;
}
export const JOBS: readonly Job[] = GRADES.flatMap(jobsOf);

/** A bank job gives up past this many situations and is written as skipped. */
const JOB_BUDGET = 400_000_000;

const [cmd, ...args] = process.argv.slice(2);
if (cmd === 'fill') {
  const [laneS, lanesS, dir] = args;
  const lane = Number(laneS), lanes = Number(lanesS);
  const done = new Set<string>();
  // Every level a lane has made, by grade: a new one's layout must repeat none of its grade's.
  const others: Record<Grade, Level[]> = { easy: [], medium: [], hard: [] };
  for (const f of existsSync(dir!) ? readdirSync(dir!) : []) {
    if (!f.endsWith('.jsonl')) continue;
    for (const line of readFileSync(`${dir}/${f}`, 'utf8').split('\n')) {
      if (!line.trim()) continue;
      const j = JSON.parse(line) as { job: string; grade: Grade; text?: string };
      done.add(j.job);
      if (j.text) others[j.grade].push(parse(j.text));
    }
  }
  const known = knownOf(campaignLevels());
  JOBS.forEach((job, j) => {
    const id = `${j}:${job.grade}:${job.tier}:${job.family ?? 'any'}:${job.band}${job.hidden ? ':hidden' : ''}`;
    if (j % lanes !== lane || done.has(id)) return;
    const plain = bandsOf(job.grade)[job.band]!;
    const band = job.hidden ? hiddenBand(plain) : plain;
    const at = { tries: 0, spent: 0 };
    const t0 = Date.now();
    const found = search(['bank', job.grade, j], { tier: job.tier, grade: job.grade, band, hides: job.hidden, family: job.family }, null, known,
      others[job.grade], JOB_BUDGET, at, undefined, process.env.TRACE ? line => process.stderr.write(`  ${line.slice(0, 300)}\n`) : undefined);
    if (!found) {
      process.stderr.write(`job ${id}: skipped past ${JOB_BUDGET}\n`);
      appendFileSync(`${dir}/lane${lane}.jsonl`, `${JSON.stringify({ job: id, grade: job.grade, skipped: true })}\n`);
      return;
    }
    const level = parse(found.text);
    const d = measure(level);
    const score = finish(scoring(level, d)).total;
    const out: BankLevel = { text: found.text, explored: d.explored, shortest: d.shortest as number, score, chapter: chapterOf(level), line: d.line };
    others[job.grade].push(level);
    process.stderr.write(`job ${id}: chapter ${out.chapter}, score ${score}, ${d.explored} situations, ${d.shortest} moves, ${at.tries} tries, ${Math.round((Date.now() - t0) / 1000)} s\n`);
    appendFileSync(`${dir}/lane${lane}.jsonl`, `${JSON.stringify({ job: id, grade: job.grade, ...out })}\n`);
  });
} else if (cmd === 'write') {
  const banks: Record<Grade, BankLevel[]> = { easy: [], medium: [], hard: [] };
  const seen = new Set<string>();
  for (const f of args) {
    for (const line of readFileSync(f, 'utf8').split('\n')) {
      if (!line.trim()) continue;
      const b = JSON.parse(line) as BankLevel & { grade: Grade; skipped?: boolean };
      if (b.skipped) continue;
      const counts = [b.chapter, b.explored, b.shortest, b.score].every(n => Number.isInteger(n) && n >= 0);
      if (!GRADES.includes(b.grade) || !counts || typeof b.text !== 'string' || typeof b.line !== 'string' || !/^[a-z]*$/.test(b.line)) throw new Error(`${f}: not a bank level: ${line.slice(0, 80)}`);
      if (seen.has(`${b.grade}\n${b.text}`)) continue;
      seen.add(`${b.grade}\n${b.text}`);
      // No two levels of a grade's bank repeat a layout, so a run that falls back on the bank never meets one twice.
      const lv = parse(b.text);
      const like = banks[b.grade].find(k => mazeOverlap(lv, parse(k.text)) >= SAME);
      if (like) { console.log(`left out a ${b.grade} level of chapter ${b.chapter} (${b.score}): its layout repeats one of chapter ${like.chapter} (${like.score})`); continue; }
      banks[b.grade].push({ chapter: b.chapter, explored: b.explored, shortest: b.shortest, score: b.score, line: b.line, text: b.text });
    }
  }
  const body = GRADES.map(g => {
    const all = banks[g].sort((a, b) => a.chapter - b.chapter || a.score - b.score || a.explored - b.explored);
    return `  ${g}: [\n${all.map(b => `    { chapter: ${b.chapter}, explored: ${b.explored}, shortest: ${b.shortest}, score: ${b.score}, line: ${JSON.stringify(b.line)}, text: ${JSON.stringify(b.text)} },`).join('\n')}\n  ],`;
  }).join('\n');
  writeFileSync(new URL('../src/endless/bank.ts', import.meta.url), `/* The Island of Crete: Endless's banks, written by tools/endless-bank.ts; do not edit them by hand. Levels the
 * generator made ahead of time and the gate passed, one bank for each grade, for a run's first level and for any level
 * whose search runs out of its budget: ${GRADES.map(g => `${banks[g].length} ${g}`).join(', ')}, each by chapter and then score. DOM-free. */
import type { BankLevel } from './generate.ts';
import type { Grade } from '../puzzle/rating.ts';

export const BANKS: Readonly<Record<Grade, readonly BankLevel[]>> = {
${body}
};
`);
  console.log(`wrote ${GRADES.map(g => `${banks[g].length} ${g}`).join(', ')}`);
} else {
  console.error('usage: endless-bank.ts fill <lane> <lanes> <dir> | write <file.jsonl>...');
  process.exit(2);
}
