/* The Island of Crete: puts the levels of a backup (tools/backup-bank.ts) the shared bank no longer holds back in it
 * (`make crete-bank-restore FROM=<dir>`). It checks each grade's file against the backup's manifest (its SHA-256),
 * asks the bank with `trusted-export` which layouts it serves, holds waiting or has retired, and posts only the
 * backup's served levels it has none of with `trusted-add`, through tools/upload-bank.ts's upload, never with
 * `replace`: a restore never retires a level the bank serves, so a full grade keeps what it has and says how many it
 * left out. A layout the bank has retired since stays out (the bank never takes one back), and so does a level the
 * backup holds without a tuple (one players' devices verified: trusted-add needs one). Levels that were waiting are
 * never posted: they were not verified. `--dry-run` says what it would post and posts nothing.
 *
 * Over HTTPS only; the CRETE_BANK_VERIFIER_TOKEN secret goes in the X-Crete-Verifier header and is never printed.
 * Exits 0 when it went through the backup, 1 when it stopped early, 2 on a bad backup or bad options.
 *
 *   CRETE_BANK_VERIFIER_TOKEN=… node tools/restore-bank.ts --from <dir> [--difficulties easy,medium,hard]
 *     [--dry-run] [--url <endpoint>] */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { SharedMade, Tuple } from '../src/endless/provenance.ts';
import type { Grade } from '../src/puzzle/rating.ts';
import { DIFFICULTY_ORDER, difficultiesOf, safeUrl } from './generate-bank.ts';
import type { Counts } from './generate-bank.ts';
import { BANK_URL } from './verify-bank.ts';
import { answeredLine, trustedPoster } from './bank-post.ts';
import { exportGrade } from './backup-bank.ts';
import type { ExportDeps, GradeBackup, Manifest } from './backup-bank.ts';
import { postedOf, uploadAll, uploadLines } from './upload-bank.ts';
import type { Posted, Uploaded } from './upload-bank.ts';

/** A backup's grades, read and checked against its manifest, or why it cannot be used. */
export function readBackup(read: (name: string) => string, grades: readonly Grade[]): Map<Grade, GradeBackup> | string {
  let m: Manifest;
  try { m = JSON.parse(read('manifest.json')) as Manifest; } catch { return 'no manifest.json that reads as JSON: not a finished backup'; }
  if (m?.format !== 1 || typeof m.grades !== 'object' || m.grades === null) return 'manifest.json is not a backup manifest';
  const out = new Map<Grade, GradeBackup>();
  for (const g of grades) {
    const e = m.grades[g];
    if (!e) continue;
    // Only the backup's own file for the grade: never a path the manifest names elsewhere.
    if (e.file !== `${g}.json`) return `manifest.json names another file for ${g} than ${g}.json`;
    let raw: string;
    try { raw = read(e.file); } catch { return `${e.file} is missing`; }
    if (createHash('sha256').update(raw).digest('hex') !== e.sha256) return `${e.file} does not match its SHA-256 in manifest.json`;
    let b: GradeBackup;
    try { b = JSON.parse(raw) as GradeBackup; } catch { return `${e.file} is not JSON`; }
    if (b.grade !== g || !Array.isArray(b.served)) return `${e.file} is not ${g}'s levels`;
    out.set(g, b);
  }
  return out;
}

export interface Plan { grade: Grade; there: number; retired: number; withoutTuple: number; files: Map<string, string> }

/** The backup's served levels of one grade the bank holds none of, as upload files (`<grade>-<h>.json`), and how many
 *  it leaves out because the bank has them, retired them, or no tuple was kept. */
export function planGrade(backup: GradeBackup, bank: GradeBackup): Plan {
  const held = new Set([...bank.served, ...bank.pending].map(i => i.h as string));
  const retired = new Set(bank.retired);
  const plan: Plan = { grade: backup.grade, there: 0, retired: 0, withoutTuple: 0, files: new Map() };
  for (const s of backup.served) {
    const h = s.h as string;
    if (held.has(h)) { plan.there++; continue; }
    if (retired.has(h)) { plan.retired++; continue; }
    const tuple = s.tuple as Tuple | null, made = s.made as SharedMade;
    if (!tuple) { plan.withoutTuple++; continue; }
    plan.files.set(`${backup.grade}-${h}.json`, JSON.stringify({ v: tuple.v, grade: tuple.grade, score: made.score, tuple, made }));
  }
  return plan;
}

export const planLine = (p: Plan) =>
  `${p.grade}: ${p.files.size} to put back; ${p.there} the bank still holds, ${p.retired} it has retired since, ${p.withoutTuple} without a tuple`;

export interface RestoreDeps extends ExportDeps {
  counts(): Promise<Counts | null>;
  add(t: Tuple, made: SharedMade): Promise<Posted>;
}

/** Plans every grade against the bank, then (unless `dryRun`) posts what is missing. Never throws for the bank. */
export async function restoreAll(deps: RestoreDeps, backup: Map<Grade, GradeBackup>, o: { dryRun: boolean; dir: string }): Promise<{ plans: Plan[]; upload: Uploaded | null; halt: string | null }> {
  const plans: Plan[] = [];
  for (const [grade, b] of backup) {
    const bank = await exportGrade(deps, grade);
    if (typeof bank === 'string') return { plans, upload: null, halt: bank };
    const p = planGrade(b, bank);
    plans.push(p);
    deps.log(planLine(p));
  }
  if (o.dryRun) return { plans, upload: null, halt: null };
  const files = new Map(plans.flatMap(p => [...p.files]));
  const upload = await uploadAll({
    counts: deps.counts, files: () => [...files.keys()], read: n => files.get(n)!,
    post: (t, made) => deps.add(t, made), move: () => {},
    now: deps.now, wait: deps.wait, random: deps.random, log: deps.log,
  }, { grades: [...backup.keys()], rollover: false, dir: o.dir });
  // A restore never rolls over: a full grade's leftovers are said once, without upload's ROLLOVER hint.
  upload.hints = upload.hints.length ? ['a full difficulty keeps the levels it serves; the levels left out stay in the backup'] : [];
  return { plans, upload, halt: upload.halt };
}

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const log = (line: string) => console.log(`restore-bank: ${line}`);
  const fail = (why: string, code: number): never => { console.error(`restore-bank: ${why}`); process.exit(code); };
  const from = arg('from') ?? fail('--from <dir> names the backup folder', 2);
  const grades = process.argv.includes('--difficulties') ? difficultiesOf(arg('difficulties') ?? '') : DIFFICULTY_ORDER;
  if (typeof grades === 'string') fail(grades, 2);
  const backup = readBackup(n => readFileSync(join(from, n), 'utf8'), grades as Grade[]);
  if (typeof backup === 'string') fail(`${from}: ${backup}`, 2);
  const url = safeUrl(arg('url') ?? BANK_URL) ?? fail('the bank\'s URL must be HTTPS', 2);
  const token = process.env.CRETE_BANK_VERIFIER_TOKEN || fail('no CRETE_BANK_VERIFIER_TOKEN', 1);
  const post = trustedPoster(url, token, log);
  const r = await restoreAll({
    post, token, log, now: () => Date.now(), wait: ms => new Promise(res => setTimeout(res, ms)),
    async counts() {
      const a = await post({ op: 'trusted-counts' }, 'trusted-counts');
      const g = (a.body as { grades?: Counts } | null)?.grades;
      if (a.status === 200 && g && DIFFICULTY_ORDER.every(d => g[d])) return g;
      if (a.status) log(answeredLine('trusted-counts', a, token));
      return null;
    },
    async add(tuple, made) {
      const what = `${tuple.grade}: trusted-add`;
      const a = await post({ op: 'trusted-add', tuple, made }, what);
      const p = postedOf(a.status, a.body);
      if (a.status && (p.kind === 'error' || p.kind === 'denied')) log(answeredLine(what, a, token));
      return p;
    },
  }, backup as Map<Grade, GradeBackup>, { dryRun: process.argv.includes('--dry-run'), dir: from });
  if (r.halt && !r.upload) fail(`${r.halt}; nothing posted`, 1);
  if (r.upload) for (const line of uploadLines(r.upload, [...(backup as Map<Grade, GradeBackup>).keys()])) log(line);
  else log('dry run: nothing posted');
  process.exit(r.halt ? 1 : 0);
}
