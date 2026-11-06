/* The Island of Crete: the shared Endless bank's trusted generator, run by .github/workflows/crete-verify.yml after
 * tools/verify-bank.ts has checked the waiting levels. For the rest of its time (`--minutes`) it makes new Endless
 * levels with this checkout's generator on every core the runner has, and posts each straight into the served pool
 * (`trusted-add`) with its provenance tuple: the runner is our own code on our own machine, as trusted as its
 * verdicts. It asks the bank first how full each grade is (`trusted-counts`) and shares the run's time among the
 * grades with room (TIME_SHARE: Hard half, Medium 30%, Easy 20%; a grade without room passes its time to the
 * others), Hard first on a tie, so a slow Hard never starves Medium and Easy. Within a grade it makes what is
 * scarcest: the plateau, large boards especially, which a run's own search seldom finds in time. It never makes more
 * than fits under a grade's cap, counting the levels waiting in quarantine.
 *
 * A full grade still turns over: each run makes up to TURNOVER_SHARE of its cap and posts each with `replace`, so the
 * server retires one served level (its own weighted pick, old and often-served first) for each one it takes in. Only
 * what this run actually made goes in, so a slow run retires fewer and the grade never drops below its cap.
 *
 * Each level is one part of a search (generate.ts's makePart, PART_BUDGET situations), from a tuple of its own: a
 * fresh seed, a tier, the grade, a depth and a part, and a run memory of one level from the grade's bundled bank
 * that sets the place (on the plateau, or on the climb). Anyone can make the level again from that tuple.
 *
 * On a machine of our own (the site's `make crete-levels`), `--difficulties` names the grades to make (the others get
 * no time; the named ones keep their TIME_SHARE weights), `--count` makes that many levels of each named grade (one
 * number for all, or one per grade in `--difficulties`'s order, easy,medium,hard when it is left out) and then
 * stops it, its share passing on (each posted with `replace`, so the server fills a grade's room first and then
 * retires one served level for each), with no time limit unless `--minutes` is also given, and `--memory-mb` is the
 * run's memory cap, which sets the workers (WORKER_MB each). `--rollover no` stops a full grade at its cap instead of
 * replacing served levels (a count is then cut short, and says so). `--plan` prints what a run would do and exits;
 * `--status` prints the bank's shelves and exits. Each run ends with its numbers per grade (made, added, replaced,
 * refused, part time, levels per hour, seconds a level), appended as one JSON line to `--stats-file` and written as a
 * table to GITHUB_STEP_SUMMARY when that is set. `--save-only <dir>` saves each level there (tools/bank-file.ts) instead of
 * posting it, for tools/upload-bank.ts to post later; it needs no token, and with one it still keeps to the room.
 *
 * Over HTTPS only (never ssh or sftp); the CRETE_BANK_VERIFIER_TOKEN secret goes in the X-Crete-Verifier header and is
 * never printed. A post the bank fails is logged and tried again, and only failures that persist stop the run
 * (tools/bank-post.ts); the halt line says why. A run always exits 0 once it starts: a
 * failed run only leaves the bank as it was (`--status` exits 1 when it cannot read the bank). Options it cannot take
 * exit 2 before anything starts.
 *
 *   CRETE_BANK_VERIFIER_TOKEN=… node tools/generate-bank.ts [--minutes 35] [--workers n] [--url <endpoint>]
 *     [--difficulties easy,medium,hard] [--count n | n,n,n] [--memory-mb n] [--rollover yes|no] [--stats-file <path>]
 *     [--save-only <dir>] [--plan | --status] */
import { appendFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { availableParallelism, cpus, hostname, totalmem } from 'node:os';
import { dirname, join } from 'node:path';
import { levelFile } from './bank-file.ts';
import { pathToFileURL } from 'node:url';
import { Worker } from 'node:worker_threads';
import { ENDLESS_VERSION, requestOf } from '../src/endless/provenance.ts';
import type { SharedMade, Tuple } from '../src/endless/provenance.ts';
import { PARTS, SIDES, placeOf, planOf, reachOf } from '../src/endless/generate.ts';
import type { BankLevel } from '../src/endless/generate.ts';
import { GRADE_BANDS, hidesWalls } from '../src/endless/gate.ts';
import { rngOf } from '../src/endless/random.ts';
import { BANKS } from '../src/endless/bank.ts';
import { parse } from '../src/puzzle/level.ts';
import type { Grade } from '../src/puzzle/rating.ts';
import { BANK_URL } from './verify-bank.ts';
import { answeredLine, backoffMs, Failures, transient, trustedPoster } from './bank-post.ts';

/** Each grade's share of a run's part time while it has room; a grade without room passes its share to the others. */
export const TIME_SHARE: Readonly<Record<Grade, number>> = { hard: 0.5, medium: 0.3, easy: 0.2 };
/** What a part is reckoned to take before a grade has finished one: running parts count toward their grade's time. */
export const PART_GUESS_MS = 60_000;
/** The share of a grade's served levels that should be on the plateau, where a run spends most of its levels. */
export const PLATEAU_SHARE = 0.75;
/** The share of a grade's plateau levels that should be large boards. */
export const LARGE_SHARE: Readonly<Record<Grade, number>> = { hard: 0.5, medium: 0.35, easy: 0.25 };
/** While large boards are wanted, one part in LARGE_EVERY of a grade's plateau parts leans large: a part finds a
 *  large board far less often than a plain one, so the rest keep the plateau filling. */
export const LARGE_EVERY = 3;
/** A board is large when its long side reaches the top of its grade's plateau sides (Hard 21, Medium 19, Easy 17). */
export const LARGE_SIDE: Readonly<Record<Grade, number>> = { hard: SIDES.hard.plateau[1], medium: SIDES.medium.plateau[1], easy: SIDES.easy.plateau[1] };
/** The share of a full grade's cap each run replaces with fresh levels: 1.5%, 22 levels at a cap of 1,500. */
export const TURNOVER_SHARE = 0.015;
/** Memory a worker may use: its heap limit, and what the planner keeps free for the rest of the runner. */
export const WORKER_HEAP_MB = 1536;
export const WORKER_MB = 2048;
const RESERVE_MB = 2048;

/** A grade's shelf as trusted-counts reports it: each served level as [score, chapter, rows, cols, hides]. */
export interface Shelf { served: number; pending: number; cap: number; levels: readonly (readonly number[])[] }
export type Counts = Record<Grade, Shelf>;
/** What the planner keeps for a grade: room left under the cap (or, for a full grade, the levels to replace), whether
 *  its levels replace served ones, and the served levels by place and size. */
export interface Tally {
  cap: number; room: number; replace: boolean; total: number; plateau: number; large: number; asked: number;
  /** Part time this run spent on the grade (ms), its parts finished, and its parts still running. */
  spent: number; done: number; running: number;
}
/** A level to make: its grade, on the plateau or on the climb, and whether a large board is wanted. */
export interface Want { grade: Grade; plateau: boolean; large: boolean }

const GRADES: readonly Grade[] = ['hard', 'medium', 'easy'];

/** Whether a level of `grade` with this score sits on its plateau; whether its board is large. */
export const onPlateau = (grade: Grade, score: number, hides: boolean) => !hides && score >= GRADE_BANDS[grade].plateau[0];
export const isLarge = (grade: Grade, rows: number, cols: number) => Math.max(rows, cols) >= LARGE_SIDE[grade];

export function tallyOf(counts: Counts): Record<Grade, Tally> {
  const out = {} as Record<Grade, Tally>;
  for (const g of GRADES) {
    const s = counts[g];
    let plateau = 0, large = 0;
    for (const [score = 0, , rows = 0, cols = 0, hides = 0] of s.levels) {
      if (!onPlateau(g, score, hides === 1)) continue;
      plateau++;
      if (isLarge(g, rows, cols)) large++;
    }
    const room = Math.max(0, s.cap - s.served - s.pending);
    const replace = room === 0 && s.served > 0;
    out[g] = { cap: s.cap, room: replace ? Math.max(1, Math.floor(s.cap * TURNOVER_SHARE)) : room, replace, total: s.served, plateau, large, asked: 0, spent: 0, done: 0, running: 0 };
  }
  return out;
}

/** A grade's part time so far, its running parts reckoned at its average finished part (or PART_GUESS_MS). */
const timeOf = (s: Tally) => s.spent + s.running * (s.done ? s.spent / s.done : PART_GUESS_MS);

/** The level to make next, or null when no grade has room or turnover left. The grade is the one furthest behind its
 *  TIME_SHARE of the run's part time, among the grades with empty room, and once none has, among the full grades
 *  turning over (Hard first on a tie); on the plateau until PLATEAU_SHARE of the grade is, and a large board until
 *  LARGE_SHARE of its plateau is, on every LARGE_EVERY-th part the grade is asked for. */
export function nextWant(t: Readonly<Record<Grade, Tally>>): Want | null {
  let grade: Grade | null = null, best = Infinity;
  for (const replace of [false, true]) {
    for (const g of GRADES) {
      const p = timeOf(t[g]) / TIME_SHARE[g];
      if (t[g].replace === replace && t[g].room > 0 && p < best) { grade = g; best = p; }
    }
    if (grade) break;
  }
  if (!grade) return null;
  const s = t[grade];
  const plateau = s.total === 0 || s.plateau / s.total < PLATEAU_SHARE;
  const large = plateau && s.asked % LARGE_EVERY === 0 && (s.plateau === 0 || s.large / s.plateau < LARGE_SHARE[grade]);
  return { grade, plateau, large };
}

/** The bundled bank's plain levels of `grade` that set a place: on the plateau, or on its climb. */
function memoryPool(grade: Grade, plateau: boolean): BankLevel[] {
  const g = GRADE_BANDS[grade];
  const plain = BANKS[grade].filter(b => !hidesWalls(parse(b.text)));
  const fits = plain.filter(b => (plateau ? b.score >= g.plateau[0] : b.score >= g.first[0] && b.score < g.plateau[0]));
  return fits.length ? fits : plain;
}

const SEED_CHARS = 'abcdefghjkmnpqrstuvwxyz23456789';

/** A tuple for `want`, drawn from `random`. For a large board it tries seeds until the first rounds' drafts are large
 *  (the plan alone, no search), which leans the part toward a large level. */
export function tupleFor(want: Want, random: () => number): Tuple {
  const int = (n: number) => Math.floor(random() * n);
  const pool = memoryPool(want.grade, want.plateau);
  const before = pool[int(pool.length)]!;
  const tier = 1 + int(10);
  const depth = want.plateau ? 6 + int(25) : 2 + int(4);
  const k = int(PARTS);
  const draw = (): Tuple => {
    let seed = 'ci-';
    for (let i = 0; i < 8; i++) seed += SEED_CHARS[int(SEED_CHARS.length)]!;
    return { v: ENDLESS_VERSION, seed, tier, grade: want.grade, depth, k, run: [{ text: before.text, explored: before.explored, score: before.score }] };
  };
  let t = draw();
  if (!want.large) return t;
  for (let i = 0; i < 200; i++, t = draw()) {
    const { band, hides } = placeOf(requestOf(t));
    const reach = reachOf(band, t.grade);
    let large = true;
    for (let round = 0; round < 3 && large; round++) {
      const plan = planOf(rngOf('endless', t.seed, t.tier, t.grade, t.depth, 'part', t.k, round), t.tier, t.grade, hides, null, reach);
      large = isLarge(t.grade, plan.rows, plan.cols);
    }
    if (large) return t;
  }
  return t;
}

/** A post's outcome: `ok` took room, `replaced` retired a served level for it; `duplicate` is a layout the bank holds
 *  and `retired` one it served once and let go, neither taken; `full` the grade at its cap and `rate` this runner's
 *  hourly share spent. `refused` is the bank turning this one level down (400, or a 409 it gives no known reason
 *  for); `denied` the bank turning this runner down (403: a generator version it no longer takes, every post faring
 *  the same). `error` is a post that may fare better later (tools/bank-post.ts's `transient`, or a 200 the run cannot
 *  read). */
export type Upload = 'ok' | 'replaced' | 'duplicate' | 'retired' | 'full' | 'rate' | 'refused' | 'denied' | 'error';

/** What a trusted-add's answer means (as Upload), from its status and body. */
export function uploadOf(status: number, body: unknown): Upload {
  const b = body !== null && typeof body === 'object' ? body as { error?: unknown; h?: unknown; retired?: unknown } : null;
  if (status === 200) return typeof b?.h === 'string' ? (typeof b.retired === 'string' ? 'replaced' : 'ok') : 'error';
  if (status === 409) return b?.error === 'duplicate' || b?.error === 'retired' || b?.error === 'full' ? b.error : 'refused';
  if (status === 429) return 'rate';
  if (transient(status)) return 'error';
  return status === 400 ? 'refused' : 'denied';
}

export interface GenerateDeps {
  /** Each grade's shelf, or null when the bank would not say. */
  counts(): Promise<Counts | null>;
  /** How many parts run at once. */
  workers: number;
  /** Runs a tuple's part: the level it made, or null. */
  make(t: Tuple): Promise<SharedMade | null>;
  /** Posts a level; with `replace`, a full grade retires one served level for it. */
  upload(t: Tuple, made: SharedMade, replace: boolean): Promise<Upload>;
  tupleFor(w: Want): Tuple;
  now(): number;
  /** Resolves after `ms`. */
  wait(ms: number): Promise<void>;
  /** In [0, 1): the jitter in a retry's wait (Math.random when not given). */
  random?: () => number;
  /** Ends the parts still running. */
  stop(): void;
  log(line: string): void;
}

type PerGrade<T> = Record<Grade, T>;

/** What a run did: parts tried, levels made and posted per grade (`replaced` the posted ones that retired a served
 *  level), parts that made nothing, and posts the bank refused; per grade too, with the levels the bank (or this run)
 *  already held, which count for nothing, the part time spent on it (ms) and how long each part that made a level
 *  took (ms). */
export interface Made {
  tried: number; found: PerGrade<number>; added: PerGrade<number>; replaced: PerGrade<number>; empty: number; refused: number;
  emptyBy: PerGrade<number>; refusedBy: PerGrade<number>; duplicateBy: PerGrade<number>; retiredBy: PerGrade<number>; spentMs: PerGrade<number>; levelMs: PerGrade<number[]>;
  /** The grades stopped at their cap with rollover off, and what the run says about each. */
  capped: Grade[]; hints: string[];
  /** Why the run stopped before its time or counts were done (a spent hourly share, a failing or refusing bank), or null. */
  halt: string | null;
}

/** What a run says of a grade it stopped at its cap with rollover off: how many it still owes, and how to go on. */
export function capHint(g: Grade, cap: number, left: number | null, count: number | null): string {
  const owed = left !== null && count !== null ? ` — stopped with ${left} of ${count} left` : '';
  return `${g}: full at ${cap}${owed}. To keep making levels that replace older ones, run again with ROLLOVER=yes.`;
}

/** Each named grade's count of levels to make. */
export type Quota = Partial<Record<Grade, number>>;

/** What a run makes: for `ms` (Infinity: no time limit), the named grades only, and with `count`, that many levels of
 *  each. With `rollover` (the default) a full grade's levels go in with `replace`, retiring served ones; without it a
 *  grade stops at its cap. */
export interface Limits { ms: number; grades?: readonly Grade[]; count?: Quota | null; rollover?: boolean }

/** The room left under a grade's cap. */
const roomOf = (s: Shelf) => Math.max(0, s.cap - s.served - s.pending);

/** The tally for a run limited to `grades`: the others get no room. With `count` each named grade's room is its count;
 *  with `rollover` it is posted with `replace` (the server fills its room first, then retires one served level for
 *  each), and without it no more than fits under the cap. Without `rollover` a full grade gets no turnover. */
export function limitedTally(counts: Counts, grades: readonly Grade[], count: Quota | null, rollover = true): Record<Grade, Tally> {
  const t = tallyOf(counts);
  for (const g of GRADES) {
    if (!grades.includes(g)) { t[g].room = 0; continue; }
    if (count !== null) { t[g].room = rollover ? count[g] ?? 0 : Math.min(count[g] ?? 0, roomOf(counts[g])); t[g].replace = rollover; }
    else if (!rollover && t[g].replace) { t[g].room = 0; t[g].replace = false; }
  }
  return t;
}

/** How often a long run logs its progress. */
export const PROGRESS_MS = 5 * 60_000;

/** Makes and posts levels until `ms` have passed, or every grade is full or has its count; what it did. Never throws. */
export async function generateAll(deps: GenerateDeps, limits: Limits): Promise<Made> {
  const zero = () => ({ easy: 0, medium: 0, hard: 0 });
  const out: Made = {
    tried: 0, found: zero(), added: zero(), replaced: zero(), empty: 0, refused: 0,
    emptyBy: zero(), refusedBy: zero(), duplicateBy: zero(), retiredBy: zero(), spentMs: zero(), levelMs: { easy: [], medium: [], hard: [] }, capped: [], hints: [], halt: null,
  };
  const random = deps.random ?? Math.random;
  const failures = new Failures(deps.now);
  let counts: Counts | null = null;
  for (let attempt = 0; !counts; attempt++) {
    try { counts = await deps.counts(); } catch { counts = null; }
    if (counts) break;
    const why = failures.failed();
    if (why) { out.halt = why; deps.log(`could not read the bank's counts: ${why}; nothing made`); return out; }
    await deps.wait(backoffMs(attempt, random));
  }
  failures.answered();
  const grades = limits.grades ?? GRADES, count = limits.count ?? null, rollover = limits.rollover ?? true;
  const tally = limitedTally(counts, grades, count, rollover);
  // The grades the bank said were full, and those whose room under the cap (rollover off) runs short of what was asked;
  // only a grade the bank said was full, or whose room this run filled, is reported capped.
  const full = new Set<Grade>(), short = new Set<Grade>();
  const room0 = { easy: roomOf(counts.easy), medium: roomOf(counts.medium), hard: roomOf(counts.hard) };
  for (const g of GRADES) {
    const asked = count?.[g] ?? 0;
    if (grades.includes(g) && !rollover && (count !== null ? tally[g].room < asked : room0[g] === 0)) short.add(g);
    const plan = !grades.includes(g) ? 'not asked for'
      : count !== null ? `making ${asked}${short.has(g) ? `, room for ${tally[g].room}` : ''}`
      : short.has(g) ? 'full, rollover off: none made'
      : tally[g].replace ? `full, replacing up to ${tally[g].room}` : `room for ${tally[g].room}`;
    deps.log(`${g}: ${counts[g].served} served, ${counts[g].pending} waiting, ${plan}; ${tally[g].plateau} on the plateau, ${tally[g].large} of them large`);
  }
  const started0 = deps.now();
  const deadline = started0 + limits.ms;
  let lastProgress = started0;
  // The levels this run made, so one it makes twice is not sent twice.
  const seen = new Set<string>();
  let halted = false;
  const stopFor = (why: string) => { halted = true; out.halt = why; deps.log(`${why}; stopping`); };
  /** Posts a level, trying again after a growing wait while the bank fails, until it answers or the run halts. */
  const post = async (t: Tuple, made: SharedMade, replace: boolean): Promise<Upload> => {
    for (let attempt = 0; ; attempt++) {
      if (halted) return 'error';
      const sent = await deps.upload(t, made, replace).catch((): Upload => 'error');
      if (sent !== 'error') { failures.answered(); return sent; }
      const why = failures.failed();
      if (why) { if (!halted) stopFor(why); return 'error'; }
      const wait = backoffMs(attempt, random);
      deps.log(`${t.grade}: trying that level again in ${Math.round(wait / 1000)} s`);
      await deps.wait(wait);
    }
  };
  const running = new Set<Promise<void>>();

  const finish = async (want: Want, t: Tuple, made: SharedMade | null, started: number): Promise<void> => {
    const g = tally[want.grade];
    const took = Math.max(0, deps.now() - started);
    g.running--; g.done++; g.spent += took;
    out.spentMs[want.grade] += took;
    if (deps.now() - lastProgress >= PROGRESS_MS) {
      lastProgress = deps.now();
      deps.log(`progress after ${Math.round((lastProgress - started0) / 60_000)} min: ${grades.map(x => `${x} ${out.added[x]}${count !== null ? `/${count[x] ?? 0}` : ''}`).join(', ')}`);
    }
    if (!made) { out.empty++; out.emptyBy[want.grade]++; g.room++; return; }
    out.found[want.grade]++;
    out.levelMs[want.grade].push(took);
    const s = tally[want.grade];
    const again = seen.has(made.text);
    seen.add(made.text);
    const sent = again ? 'duplicate' : await post(t, made, s.replace);
    if (sent === 'duplicate' || sent === 'retired') {
      // Held already, or served once and let go: it counts toward nothing (not the count, the room or the cap), so
      // the grade makes another.
      (sent === 'duplicate' ? out.duplicateBy : out.retiredBy)[want.grade]++; g.room++;
      const why = sent === 'retired' ? 'the bank retired this layout' : again ? 'made twice this run' : 'the bank has it';
      deps.log(`${want.grade}: ${sent} (score ${made.score}), ${why}; not counted`);
      return;
    }
    if (sent === 'ok' || sent === 'replaced') {
      out.added[want.grade]++;
      if (sent === 'replaced') out.replaced[want.grade]++;
      s.total++;
      if (onPlateau(want.grade, made.score, made.hides)) {
        s.plateau++;
        const rows = made.text.split('\n').filter((l, i, all) => i > all.indexOf('') && l !== '');
        if (isLarge(want.grade, rows.length, rows[0]?.length ?? 0)) s.large++;
      }
      return;
    }
    out.refused++;
    out.refusedBy[want.grade]++;
    s.room++;
    if (sent === 'full') { s.room = 0; full.add(want.grade); deps.log(`${want.grade} is full`); }
    if (sent === 'rate' && !halted) stopFor('the bank\'s hourly share for this runner is spent');
    if (sent === 'denied' && !halted) stopFor('the bank turned this runner down (logged above)');
  };

  for (;;) {
    while (!halted && running.size < deps.workers && deps.now() < deadline) {
      const want = nextWant(tally);
      if (!want) break;
      tally[want.grade].room--;
      tally[want.grade].asked++;
      tally[want.grade].running++;
      const t = deps.tupleFor(want);
      const started = deps.now();
      out.tried++;
      const job: Promise<void> = deps.make(t).catch(() => null).then(m => finish(want, t, m, started)).finally(() => { running.delete(job); });
      running.add(job);
    }
    if (!running.size) break;
    const left = deadline - deps.now();
    // Past the deadline, parts that already came back still post their levels; the rest are ended.
    const timedOut = left <= 0
      ? (await new Promise(r => setImmediate(r)), running.size > 0)
      : left === Infinity
        ? await Promise.race([...running]).then(() => false)
        : await Promise.race([...running].map(p => p.then(() => false)).concat(deps.wait(left).then(() => true)));
    if (timedOut) {
      deps.log('stopping: this run\'s time is spent');
      deps.stop();
      // Levels already being posted get a moment to arrive.
      await Promise.race([Promise.allSettled([...running]), deps.wait(15_000)]);
      break;
    }
  }
  for (const g of grades) {
    // Capped: the bank said full, or rollover off and this run filled the room there was (none, for a full grade).
    const filled = short.has(g) && out.added[g] >= room0[g];
    if (!(full.has(g) || filled) || (count !== null && out.added[g] >= (count[g] ?? 0))) continue;
    const hint = capHint(g, counts[g].cap, count !== null ? (count[g] ?? 0) - out.added[g] : null, count?.[g] ?? null);
    out.capped.push(g); out.hints.push(hint); deps.log(hint);
  }
  return out;
}

/** The middle of `xs` (the mean of the two middle ones for an even count), or 0 for none. */
export function median(xs: readonly number[]): number {
  if (!xs.length) return 0;
  const a = [...xs].sort((x, y) => x - y), m = a.length >> 1;
  return a.length % 2 ? a[m]! : (a[m - 1]! + a[m]!) / 2;
}

/** One grade's numbers from a run: levels made (by a part), added into room, replacing a served one, refused by the
 *  bank, parts that made none; the part time spent on it, levels in per hour of the run, and the seconds a part that
 *  made a level took, mean and median, and the part time per level made counting the empty parts. */
export interface GradeStats {
  made: number; added: number; replaced: number; duplicate: number; retired: number; refused: number; empty: number; capped: boolean;
  partHours: number; perHour: number; meanSeconds: number; medianSeconds: number; secondsPerLevel: number;
}
/** The machine a run ran on. */
export interface Machine { host: string; cpu: string; cores: number; totalMb: number }
/** A run's numbers, as one line of the stats file. */
export interface RunStats {
  at: string; machine: Machine; args: readonly string[]; workers: number; memoryMb: number | null;
  wallSeconds: number; grades: Partial<Record<Grade, GradeStats>>;
}

const round = (n: number, places = 1) => Math.round(n * 10 ** places) / 10 ** places;

export function gradeStats(made: Made, g: Grade, wallMs: number): GradeStats {
  const ms = made.levelMs[g], found = made.found[g];
  return {
    made: found, added: made.added[g] - made.replaced[g], replaced: made.replaced[g], duplicate: made.duplicateBy[g], retired: made.retiredBy[g], refused: made.refusedBy[g], empty: made.emptyBy[g],
    capped: made.capped.includes(g),
    partHours: round(made.spentMs[g] / 3_600_000, 2),
    perHour: wallMs > 0 ? round(made.added[g] / (wallMs / 3_600_000)) : 0,
    meanSeconds: ms.length ? round(ms.reduce((a, b) => a + b, 0) / ms.length / 1000) : 0,
    medianSeconds: round(median(ms) / 1000),
    secondsPerLevel: found ? round(made.spentMs[g] / found / 1000) : 0,
  };
}

export function runStats(made: Made, o: RunOptions, args: readonly string[], machine: Machine, wallMs: number, at: Date): RunStats {
  const grades: Partial<Record<Grade, GradeStats>> = {};
  for (const g of o.grades) grades[g] = gradeStats(made, g, wallMs);
  return { at: at.toISOString(), machine, args, workers: o.workers, memoryMb: o.memoryMb, wallSeconds: Math.round(wallMs / 1000), grades };
}

const hm = (seconds: number) => `${Math.floor(seconds / 3600)}h${String(Math.round((seconds % 3600) / 60)).padStart(2, '0')}m`;

/** A run's numbers as log lines: one per grade, then the run's. */
export function statsLines(r: RunStats): string[] {
  const lines = Object.entries(r.grades).map(([g, s]) => `${g}: made ${s.made}, added ${s.added}, replaced ${s.replaced}, duplicate ${s.duplicate}, retired ${s.retired}, refused ${s.refused}, parts with none ${s.empty}; `
    + `${s.partHours} part-hours, ${s.perHour} per hour, ${s.meanSeconds} s mean and ${s.medianSeconds} s median a level (${s.secondsPerLevel} s of part time each, empty parts counted)`);
  lines.push(`run: ${hm(r.wallSeconds)} on ${r.workers} worker(s)${r.memoryMb !== null ? ` in ${r.memoryMb} MB` : ''}, ${r.machine.cores} cores (${r.machine.cpu}), ${Math.round(r.machine.totalMb)} MB`);
  return lines;
}

/** A run's numbers as a markdown table, for a CI step summary. */
export function statsMarkdown(r: RunStats): string {
  const rows = Object.entries(r.grades).map(([g, s]) => `| ${g} | ${s.made} | ${s.added} | ${s.replaced} | ${s.duplicate} | ${s.retired} | ${s.refused} | ${s.empty} | ${s.partHours} | ${s.perHour} | ${s.meanSeconds} | ${s.medianSeconds} |`);
  return ['### Crete levels made', '', '| Difficulty | Made | Added | Replaced | Duplicate | Retired | Refused | Parts with none | Part-hours | Per hour | Mean s | Median s |', '|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|', ...rows, '',
    `${hm(r.wallSeconds)} on ${r.workers} worker(s)${r.memoryMb !== null ? ` in ${r.memoryMb} MB` : ''}, ${r.machine.cores} cores (${r.machine.cpu})`, ''].join('\n');
}

/** The shelves a run saving levels without the bank's counts works from: nothing served, no cap to reach. */
export const unboundedCounts = (): Counts => {
  const shelf = (): Shelf => ({ served: 0, pending: 0, cap: Number.MAX_SAFE_INTEGER, levels: [] });
  return { easy: shelf(), medium: shelf(), hard: shelf() };
};

/** Saves a level to `dir` as tools/bank-file.ts's file; `duplicate` when that file is there already. */
export function saveLevel(dir: string, tuple: Tuple, made: SharedMade): { result: Upload; name: string } {
  const f = levelFile(tuple, made);
  const path = join(dir, f.name);
  if (existsSync(path)) return { result: 'duplicate', name: f.name };
  mkdirSync(dir, { recursive: true });
  writeFileSync(path, f.text, { flag: 'wx' });
  return { result: 'ok', name: f.name };
}

/** The bank's shelves, one line per grade: served, waiting, cap, room, and the plateau and large boards. */
export function statusLines(counts: Counts): string[] {
  const t = tallyOf(counts);
  return DIFFICULTY_ORDER.map(g => `${g}: ${counts[g].served} served, ${counts[g].pending} waiting, cap ${counts[g].cap}, room ${roomOf(counts[g])}; ${t[g].plateau} on the plateau, ${t[g].large} of them large`);
}

/** Up to `n` worker threads, each running one part at a time with a heap limit; one that dies is replaced. */
export function workerPool(n: number): { make(t: Tuple): Promise<SharedMade | null>; stop(): void } {
  const url = new URL('./generate-bank-worker.ts', import.meta.url);
  const idle: Worker[] = [];
  const all = new Set<Worker>();
  const queue: (() => void)[] = [];
  let id = 0, stopped = false;
  const spawn = () => {
    const w = new Worker(url, { resourceLimits: { maxOldGenerationSizeMb: WORKER_HEAP_MB } });
    all.add(w);
    return w;
  };
  for (let i = 0; i < n; i++) idle.push(spawn());
  const take = (): Promise<Worker> => (idle.length ? Promise.resolve(idle.pop()!) : new Promise(r => queue.push(() => r(idle.pop()!))));
  const give = (w: Worker) => { idle.push(w); queue.shift()?.(); };
  return {
    async make(t) {
      if (stopped) return null;
      const w = await take();
      const mine = ++id;
      return new Promise(resolve => {
        const done = (found: SharedMade | null, dead: boolean) => {
          w.off('message', onMessage); w.off('error', onError); w.off('exit', onExit);
          if (dead) { all.delete(w); if (!stopped) give(spawn()); } else give(w);
          resolve(found);
        };
        const onMessage = (m: { id: number; found: SharedMade | null }) => { if (m.id === mine) done(m.found, false); };
        const onError = () => { void w.terminate(); done(null, true); };
        const onExit = () => done(null, true);
        w.on('message', onMessage); w.on('error', onError); w.on('exit', onExit);
        w.postMessage({ id: mine, tuple: t });
      });
    },
    stop() { stopped = true; for (const w of all) void w.terminate(); },
  };
}

/** The workers a machine with `cores` and `totalMb` of memory can hold: one per core, as memory allows. */
export const workersOf = (cores: number, totalMb: number) => Math.max(1, Math.min(cores, Math.floor((totalMb - RESERVE_MB) / WORKER_MB)));

/** The workers this machine can hold. */
export const workersHere = () => workersOf(availableParallelism(), totalmem() / 2 ** 20);

/** The workers a run capped at `limitMb` may use on a machine with `cores` and `totalMb`: WORKER_MB each, never more
 *  than the machine holds. */
export const workersIn = (limitMb: number, cores: number, totalMb: number) => Math.max(1, Math.min(cores, Math.floor(limitMb / WORKER_MB), workersOf(cores, totalMb)));

/** The difficulties a run names when it names none, in the order a `--count` list follows. */
export const DIFFICULTY_ORDER: readonly Grade[] = ['easy', 'medium', 'hard'];

/** The grades a `--difficulties` list names (comma separated, in any case), in its order, or a message naming what it
 *  cannot take. */
export function difficultiesOf(raw: string): Grade[] | string {
  const names = raw.split(',').map(n => n.trim().toLowerCase()).filter(n => n !== '');
  const unknown = names.filter(n => !(GRADES as readonly string[]).includes(n));
  if (unknown.length) return `unknown difficulty ${unknown.join(', ')} (easy, medium or hard)`;
  if (!names.length) return 'no difficulty named (easy, medium or hard)';
  const twice = names.filter((n, i) => names.indexOf(n) !== i);
  if (twice.length) return `difficulty ${twice.join(', ')} named twice`;
  return names as Grade[];
}

const positive = (raw: string | undefined) => (raw !== undefined && /^[1-9][0-9]*$/.test(raw) ? Number(raw) : null);

/** Each of `grades`' counts from a `--count` list: one number for every grade, or one per grade in order; otherwise a
 *  message naming both lists. */
export function quotaOf(raw: string, grades: readonly Grade[]): Quota | string {
  const parts = raw.split(',').map(n => n.trim());
  const both = `--count ${raw} for --difficulties ${grades.join(',')}`;
  if (parts.some(n => positive(n) === null)) return `${both}: each count must be a whole number of levels, 1 or more`;
  if (parts.length !== 1 && parts.length !== grades.length) return `${both}: give one count for all, or ${grades.length}, one per difficulty in order`;
  return Object.fromEntries(grades.map((g, i) => [g, Number(parts[parts.length === 1 ? 0 : i])]));
}

/** A run's options, read from the command line on a machine with `cores` and `totalMb`. */
export interface RunOptions {
  minutes: number; grades: readonly Grade[]; count: Quota | null; workers: number; memoryMb: number | null; rollover: boolean;
  plan: boolean; status: boolean; statsFile: string | null; saveOnly: string | null;
}

/** The run `argv` asks for, or a message naming what it cannot take. With none of --difficulties, --count,
 *  --memory-mb and --rollover it is the runner's run: every grade, `--minutes` (35 by default), the workers the machine
 *  holds (`--workers` at most), and a full grade turning over. */
export function optionsOf(argv: readonly string[], cores: number, totalMb: number): RunOptions | string {
  const arg = (name: string) => { const i = argv.indexOf(`--${name}`); return i >= 0 ? argv[i + 1] : undefined; };
  const has = (name: string) => argv.includes(`--${name}`);
  let grades: readonly Grade[] = DIFFICULTY_ORDER;
  if (has('difficulties')) {
    const g = difficultiesOf(arg('difficulties') ?? '');
    if (typeof g === 'string') return g;
    grades = g;
  }
  const count = has('count') ? quotaOf(arg('count') ?? '', grades) : null;
  if (typeof count === 'string') return count;
  const memoryMb = has('memory-mb') ? positive(arg('memory-mb')) : null;
  if (has('memory-mb') && memoryMb === null) return '--memory-mb must be a whole number of megabytes';
  if (memoryMb !== null && memoryMb < WORKER_MB) return `--memory-mb ${memoryMb} is less than one worker needs (${WORKER_MB} MB)`;
  let minutes = count !== null ? Infinity : 35;
  if (has('minutes')) {
    minutes = Number(arg('minutes'));
    if (!Number.isFinite(minutes)) return '--minutes must be a number';
    minutes = Math.max(1, minutes);
  }
  let workers: number;
  if (memoryMb === null) workers = Math.max(1, Math.min(workersOf(cores, totalMb), Number(arg('workers')) || Infinity));
  else {
    const most = workersIn(memoryMb, cores, totalMb);
    const asked = has('workers') ? positive(arg('workers')) : most;
    if (asked === null) return '--workers must be a whole number, 1 or more';
    if (asked > most) return `${asked} workers need ${asked * WORKER_MB} MB; ${memoryMb} MB allows ${most} on this machine (${cores} cores, ${Math.round(totalMb)} MB)`;
    workers = asked;
  }
  const roll = arg('rollover');
  if (has('rollover') && roll !== 'yes' && roll !== 'no') return `--rollover ${roll ?? ''} must be yes or no`;
  const statsFile = has('stats-file') ? arg('stats-file') ?? '' : null;
  if (statsFile === '') return '--stats-file needs a path';
  const saveOnly = has('save-only') ? arg('save-only') ?? '' : null;
  if (saveOnly === '' || saveOnly?.startsWith('--')) return '--save-only needs a folder';
  return { minutes, grades, count, workers, memoryMb, rollover: roll !== 'no', plan: has('plan'), status: has('status'), statsFile, saveOnly };
}

/** The bank's endpoint, when it is one this script may post to: HTTPS, or plain HTTP to this machine (a local dry run). */
export function safeUrl(raw: string): string | null {
  try {
    const u = new URL(raw);
    if (u.protocol === 'https:' || (u.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(u.hostname))) return u.href;
  } catch { /* not a URL */ }
  return null;
}

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

/** What a run will do, in one line. */
export function planLine(o: RunOptions): string {
  const what = o.count !== null ? o.grades.map(g => `${o.count![g]} ${g}`).join(', ') : o.grades.join(', ');
  const time = o.minutes === Infinity ? 'no time limit' : `${o.minutes} minute(s)`;
  return `${what}; ${o.workers} worker(s)${o.memoryMb !== null ? ` in ${o.memoryMb} MB` : ''} for ${time}, ${o.saveOnly !== null ? `saving to ${o.saveOnly}` : `rollover ${o.rollover ? 'on' : 'off'}`}`;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const log = (line: string) => console.log(`generate-bank: ${line}`);
  const token = process.env.CRETE_BANK_VERIFIER_TOKEN ?? '';
  const url = safeUrl(arg('url') ?? BANK_URL);
  const args = process.argv.slice(2);
  const totalMb = totalmem() / 2 ** 20;
  const options = optionsOf(args, availableParallelism(), totalMb);
  if (typeof options === 'string') { console.error(`generate-bank: ${options}`); process.exit(2); }
  const { minutes, workers } = options;
  let code = 0;
  const post = trustedPoster(url ?? '', token, log);
  const counts = async (): Promise<Counts | null> => {
    const r = await post({ op: 'trusted-counts' }, 'trusted-counts');
    const grades = (r.body as { grades?: Counts } | null)?.grades;
    if (r.status === 200 && grades && GRADES.every(g => grades[g])) return grades;
    if (r.status) log(answeredLine('trusted-counts', r, token));
    return null;
  };
  const save = options.saveOnly;
  if (options.plan) {
    log(planLine(options));
  } else if (!token && save === null) {
    log('no CRETE_BANK_VERIFIER_TOKEN; skipping (it comes from the bank-verifier field of the "Crete Config" item in 1Password)');
    if (options.status) code = 1;
  } else if (!url && (save === null || token)) {
    log('the bank\'s URL must be HTTPS; nothing made');
    if (options.status) code = 1;
  } else if (options.status) {
    const c = await counts().catch(() => null);
    if (c) for (const line of statusLines(c)) log(line);
    else { log('could not read the bank\'s counts'); code = 1; }
  } else {
    const pool = workerPool(workers);
    if (save !== null) log(token ? `saving to ${save}; the bank's counts set the room` : `saving to ${save}; no token, so the bank's room is not known: making the counts asked`);
    log(options.grades.length === 3 && options.count === null && options.memoryMb === null && options.rollover ? `${workers} worker(s) for ${minutes} minute(s)` : planLine(options));
    const started = Date.now();
    try {
      const made = await generateAll({
        workers,
        counts: save !== null && !token ? async () => unboundedCounts() : counts,
        make: t => pool.make(t),
        async upload(tuple, made, replace) {
          if (save !== null) {
            const { result, name } = saveLevel(save, tuple, made);
            if (result === 'ok') log(`${tuple.grade}: saved ${name} (score ${made.score})`);
            return result;
          }
          const what = `${tuple.grade}: trusted-add`;
          const r = await post(replace ? { op: 'trusted-add', tuple, made, replace } : { op: 'trusted-add', tuple, made }, what);
          if (!r.status) return 'error';
          const sent = uploadOf(r.status, r.body);
          if (sent === 'ok' || sent === 'replaced') {
            const { h, retired } = r.body as { h: string; retired?: string };
            log(retired ? `${tuple.grade}: replaced ${retired} with ${h} (score ${made.score})` : `${tuple.grade}: added ${h} (score ${made.score})`);
          } else if (sent === 'error' || sent === 'refused' || sent === 'denied') log(answeredLine(what, r, token));
          return sent;
        },
        tupleFor: w => tupleFor(w, Math.random),
        now: () => Date.now(),
        wait: ms => new Promise(r => setTimeout(r, ms)),
        stop: () => pool.stop(),
        log,
      }, { ms: minutes * 60_000, grades: options.grades, count: options.count, rollover: options.rollover });
      const wallMs = Date.now() - started;
      log(`tried ${made.tried}, none found ${made.empty}, refused ${made.refused}; added hard ${made.added.hard}, medium ${made.added.medium}, easy ${made.added.easy}`);
      const machine: Machine = { host: hostname(), cpu: cpus()[0]?.model.trim() ?? 'unknown', cores: availableParallelism(), totalMb: Math.round(totalMb) };
      const stats = runStats(made, options, args, machine, wallMs, new Date());
      for (const line of [...statsLines(stats), ...made.hints]) log(line);
      if (options.statsFile) {
        try {
          mkdirSync(dirname(options.statsFile), { recursive: true });
          appendFileSync(options.statsFile, `${JSON.stringify(stats)}\n`);
          log(`stats appended to ${options.statsFile}`);
        } catch (e) { log(`could not write the stats file: ${e instanceof Error ? e.message : String(e)}`); }
      }
      if (process.env.GITHUB_STEP_SUMMARY) {
        try { appendFileSync(process.env.GITHUB_STEP_SUMMARY, statsMarkdown(stats)); } catch { /* the summary is a nicety */ }
      }
    } catch (e) {
      log(`stopped: ${e instanceof Error ? e.message : String(e)}`);
    }
    pool.stop();
  }
  process.exit(code);
}
