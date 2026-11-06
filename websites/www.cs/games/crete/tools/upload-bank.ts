/* The Island of Crete: posts levels saved by `make crete-levels SAVE_ONLY=<dir>` (tools/bank-file.ts) to the shared
 * bank with `trusted-add`, as the trusted generator would have (`make crete-levels-upload FROM=<dir>`). It asks the
 * bank first how full each grade is; a full grade's files wait unless `--rollover yes`, which posts each with `replace`
 * (the server fills the room first, then retires one served level for each). A file the bank took, or already holds,
 * moves to <dir>/uploaded/, one whose layout the bank served once and retired to <dir>/retired/ (it never comes back),
 * one it refused to <dir>/rejected/ with the reason; the rest stay, so a second run picks up where this one stopped.
 * Neither a duplicate nor a retired layout takes room or retires a level.
 *
 * Over HTTPS only (never ssh or sftp); the CRETE_BANK_VERIFIER_TOKEN secret goes in the X-Crete-Verifier header and is
 * never printed. A post the bank fails is logged and tried again, and only failures that persist stop it
 * (tools/bank-post.ts). Exits 0 when it went through the folder, 1 when it stopped early (the bank failing for good,
 * turning this runner down, or this runner's hourly share spent), 2 on bad options.
 *
 *   CRETE_BANK_VERIFIER_TOKEN=… node tools/upload-bank.ts --from <dir> [--difficulties easy,medium,hard]
 *     [--rollover yes|no] [--url <endpoint>] */
import { mkdirSync, readdirSync, readFileSync, renameSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { SharedMade, Tuple } from '../src/endless/provenance.ts';
import type { Grade } from '../src/puzzle/rating.ts';
import { readLevelFile } from './bank-file.ts';
import { DIFFICULTY_ORDER, difficultiesOf, safeUrl } from './generate-bank.ts';
import type { Counts } from './generate-bank.ts';
import { BANK_URL } from './verify-bank.ts';
import { answeredLine, backoffMs, Failures, transient, trustedPoster } from './bank-post.ts';

/** A post's outcome. `rejected` carries the bank's reason; `denied` is the bank turning this runner down (a 403 other
 *  than `version`); `error` is the bank or the network failing in a way a later try may not (bank-post.ts's
 *  `transient`). */
export type Posted = { kind: 'added' | 'replaced' | 'duplicate' | 'retired' | 'full' | 'rate' | 'denied' | 'error' } | { kind: 'rejected'; reason: string };

export interface UploadDeps {
  counts(): Promise<Counts | null>;
  /** The level files waiting, by name. */
  files(): string[];
  read(name: string): string;
  post(t: Tuple, made: SharedMade, replace: boolean): Promise<Posted>;
  /** Moves a file into the `uploaded`, `retired` or `rejected` folder beside it. */
  move(name: string, to: 'uploaded' | 'retired' | 'rejected'): void;
  now(): number;
  /** Resolves after `ms`. */
  wait(ms: number): Promise<void>;
  /** In [0, 1): the jitter in a retry's wait (Math.random when not given). */
  random?: () => number;
  log(line: string): void;
}

export interface GradeUpload { added: number; replaced: number; duplicate: number; retired: number; rejected: number; left: number }
/** `halt` is why it stopped early, or null. */
export interface Uploaded { grades: Record<Grade, GradeUpload>; seconds: number; halted: boolean; halt: string | null; hints: string[] }

/** Posts every waiting file of `grades`, in name order; what it did. Never throws. */
export async function uploadAll(deps: UploadDeps, o: { grades: readonly Grade[]; rollover: boolean; dir: string }): Promise<Uploaded> {
  const zero = (): GradeUpload => ({ added: 0, replaced: 0, duplicate: 0, retired: 0, rejected: 0, left: 0 });
  const out: Uploaded = { grades: { easy: zero(), medium: zero(), hard: zero() }, seconds: 0, halted: false, halt: null, hints: [] };
  const start = deps.now();
  const random = deps.random ?? Math.random;
  const failures = new Failures(deps.now);
  let counts: Counts | null = null;
  for (let attempt = 0; !counts; attempt++) {
    try { counts = await deps.counts(); } catch { counts = null; }
    if (counts) break;
    const why = failures.failed();
    if (why) { deps.log(`could not read the bank's counts: ${why}; nothing sent`); out.halted = true; out.halt = why; return out; }
    await deps.wait(backoffMs(attempt, random));
  }
  failures.answered();
  const stopFor = (why: string) => { out.halted = true; out.halt = why; deps.log(`${why}; stopping`); };
  /** Posts a file's level, trying again after a growing wait while the bank fails, until it answers or failures persist. */
  const send = async (name: string, t: Tuple, made: SharedMade): Promise<Posted> => {
    for (let attempt = 0; ; attempt++) {
      const r = await deps.post(t, made, o.rollover).catch((): Posted => ({ kind: 'error' }));
      if (r.kind !== 'error') { failures.answered(); return r; }
      const why = failures.failed();
      if (why) { stopFor(why); return r; }
      const wait = backoffMs(attempt, random);
      deps.log(`${name}: trying again in ${Math.round(wait / 1000)} s`);
      await deps.wait(wait);
    }
  };
  const room = {} as Record<Grade, number>;
  for (const g of DIFFICULTY_ORDER) room[g] = Math.max(0, counts[g].cap - counts[g].served - counts[g].pending);
  const names = deps.files().filter(n => n.endsWith('.json')).sort();
  for (const name of names) {
    const grade = DIFFICULTY_ORDER.find(g => name.startsWith(`${g}-`));
    if (!grade || !o.grades.includes(grade)) continue;
    const s = out.grades[grade];
    if (out.halted || (!o.rollover && room[grade] === 0)) { s.left++; continue; }
    const file = readLevelFile(deps.read(name));
    if (typeof file === 'string') { s.rejected++; deps.move(name, 'rejected'); deps.log(`${name}: rejected, ${file}`); continue; }
    const r = await send(name, file.tuple, file.made);
    if (r.kind === 'added' || r.kind === 'replaced' || r.kind === 'duplicate') {
      s[r.kind]++;
      if (r.kind === 'added') room[grade] = Math.max(0, room[grade] - 1);
      deps.move(name, 'uploaded');
      deps.log(`${name}: ${r.kind === 'duplicate' ? 'duplicate, the bank has it' : r.kind}`);
    } else if (r.kind === 'retired') {
      s.retired++;
      deps.move(name, 'retired');
      deps.log(`${name}: retired, the bank served this layout once and let it go; not counted`);
    } else if (r.kind === 'rejected') {
      s.rejected++;
      deps.move(name, 'rejected');
      deps.log(`${name}: rejected, ${r.reason}`);
    } else if (r.kind === 'full') {
      room[grade] = 0;
      s.left++;
    } else if (r.kind === 'rate') {
      stopFor('the bank\'s hourly share for this runner is spent'); s.left++;
    } else if (r.kind === 'denied') {
      stopFor('the bank turned this runner down (logged above)'); s.left++;
    } else {
      s.left++;
      deps.log(`${name}: left for the next run`);
    }
  }
  for (const g of o.grades) {
    const s = out.grades[g], left = s.left;
    if (o.rollover || room[g] !== 0 || !left) continue;
    const of = s.added + s.replaced + s.duplicate + s.retired + s.rejected + left;
    const hint = `${g}: full at ${counts[g].cap} \u2014 stopped with ${left} of ${of} left (${left} file(s) remain in ${o.dir}). To replace older levels with them, run again with ROLLOVER=yes.`;
    out.hints.push(hint); deps.log(hint);
  }
  out.seconds = Math.round((deps.now() - start) / 1000);
  return out;
}

/** The totals, one line per grade and one for the run. */
export function uploadLines(u: Uploaded, grades: readonly Grade[]): string[] {
  const lines = grades.map(g => { const s = u.grades[g]; return `${g}: added ${s.added}, replaced ${s.replaced}, duplicate ${s.duplicate}, retired ${s.retired}, rejected ${s.rejected}, left ${s.left}`; });
  const sent = grades.reduce((n, g) => { const s = u.grades[g]; return n + s.added + s.replaced + s.duplicate + s.retired + s.rejected; }, 0);
  lines.push(...u.hints);
  lines.push(`sent ${sent} in ${u.seconds} s${u.seconds > 0 ? ` (${Math.round((sent / u.seconds) * 3600)} per hour)` : ''}`);
  return lines;
}

/** The bank's answer to a trusted-add, as a Posted. */
export function postedOf(status: number, body: unknown): Posted {
  const b = (body !== null && typeof body === 'object' ? body : {}) as { error?: unknown; field?: unknown; h?: unknown; retired?: unknown };
  if (status === 200) return typeof b.h === 'string' ? { kind: b.retired ? 'replaced' : 'added' } : { kind: 'error' };
  if (status === 409 && b.error === 'duplicate') return { kind: 'duplicate' };
  if (status === 409 && b.error === 'retired') return { kind: 'retired' };
  if (status === 409 && b.error === 'full') return { kind: 'full' };
  if (status === 429) return { kind: 'rate' };
  if (status === 403 && b.error === 'version') return { kind: 'rejected', reason: '403 version: the bank no longer takes this generator version' };
  if (transient(status)) return { kind: 'error' };
  if (status === 403) return { kind: 'denied' };
  return { kind: 'rejected', reason: `${status} ${typeof b.error === 'string' ? b.error : 'refused'}${typeof b.field === 'string' ? ` (${b.field})` : ''}` };
}

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const log = (line: string) => console.log(`upload-bank: ${line}`);
  const fail = (why: string, code: number) => { console.error(`upload-bank: ${why}`); process.exit(code); };
  const from = arg('from');
  if (!from) fail('--from <dir> names the folder of saved levels', 2);
  let names: string[] = [];
  try { names = readdirSync(from!); } catch { fail(`cannot read ${from}`, 2); }
  const grades = process.argv.includes('--difficulties') ? difficultiesOf(arg('difficulties') ?? '') : DIFFICULTY_ORDER;
  if (typeof grades === 'string') fail(grades, 2);
  const roll = arg('rollover') ?? 'no';
  if (roll !== 'yes' && roll !== 'no') fail(`--rollover ${roll} must be yes or no`, 2);
  const token = process.env.CRETE_BANK_VERIFIER_TOKEN ?? '';
  const url = safeUrl(arg('url') ?? BANK_URL);
  if (!token) fail('no CRETE_BANK_VERIFIER_TOKEN', 1);
  if (!url) fail('the bank\'s URL must be HTTPS', 2);
  const post = trustedPoster(url!, token, log);
  const u = await uploadAll({
    async counts() {
      const r = await post({ op: 'trusted-counts' }, 'trusted-counts');
      const grades = (r.body as { grades?: Counts } | null)?.grades;
      if (r.status === 200 && grades && DIFFICULTY_ORDER.every(g => grades[g])) return grades;
      if (r.status) log(answeredLine('trusted-counts', r, token));
      return null;
    },
    files: () => names,
    read: n => readFileSync(join(from!, n), 'utf8'),
    async post(tuple, made, replace) {
      const what = `${tuple.grade}: trusted-add`;
      const r = await post(replace ? { op: 'trusted-add', tuple, made, replace } : { op: 'trusted-add', tuple, made }, what);
      const p = postedOf(r.status, r.body);
      if (r.status && (p.kind === 'error' || p.kind === 'denied')) log(answeredLine(what, r, token));
      return p;
    },
    move(n, to) { mkdirSync(join(from!, to), { recursive: true }); renameSync(join(from!, n), join(from!, to, n)); },
    now: () => Date.now(),
    wait: ms => new Promise(r => setTimeout(r, ms)),
    log,
  }, { grades: grades as Grade[], rollover: roll === 'yes', dir: from! });
  for (const line of uploadLines(u, grades as Grade[])) log(line);
  process.exit(u.halted ? 1 : 0);
}
