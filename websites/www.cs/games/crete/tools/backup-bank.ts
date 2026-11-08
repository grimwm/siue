/* The Island of Crete: copies every level of the shared bank to this machine (`make crete-bank-backup`), read only.
 * For each grade it pages through the bank's served levels, the levels waiting in quarantine and the retired layout
 * hashes with `trusted-export`, then writes `<grade>.json` and, last, `manifest.json` into a new folder named for the
 * UTC time, `<into>/<YYYYMMDDTHHMMSSZ>/`. A folder without its manifest is a backup that did not finish.
 *
 * A served level carries what it takes to put it back or make it again: its layout hash `h`, the level (`made`), the
 * times it was served (`n`), its generator version and when it came in, and the provenance `tuple` the bank keeps
 * beside it (null for a level players' devices verified, whose tuple the bank does not keep). The manifest holds each
 * file's counts, bytes, gzipped bytes and SHA-256, the time, the bank's host and this machine's name.
 *
 * Over HTTPS only; the CRETE_BANK_VERIFIER_TOKEN secret goes in the X-Crete-Verifier header and is never printed. A
 * post the bank fails is tried again, and only failures that persist stop it (tools/bank-post.ts). Exits 0 with every
 * grade saved, 1 when it stopped early, 2 on bad options.
 *
 *   CRETE_BANK_VERIFIER_TOKEN=… node tools/backup-bank.ts --into <dir> [--difficulties easy,medium,hard] [--url <endpoint>] */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { hostname } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { gzipSync } from 'node:zlib';
import type { Grade } from '../src/puzzle/rating.ts';
import { DIFFICULTY_ORDER, difficultiesOf, safeUrl } from './generate-bank.ts';
import { BANK_URL } from './verify-bank.ts';
import { answeredLine, backoffMs, Failures, transient, trustedPoster } from './bank-post.ts';
import type { Answer } from './bank-post.ts';

/** The most levels the bank sends in one page (Bank::EXPORT_LIMIT). */
export const PAGE_LIMIT = 500;
export const LISTS = ['served', 'pending', 'retired'] as const;
export type List = typeof LISTS[number];

/** One grade as the backup holds it. */
export interface GradeBackup {
  grade: Grade;
  served: Record<string, unknown>[];
  pending: Record<string, unknown>[];
  /** Layout hashes the bank served once and let go: never served again. */
  retired: string[];
}

export interface FileEntry { file: string; served: number; pending: number; retired: number; withoutTuple: number; bytes: number; gzipBytes: number; sha256: string }
export interface Manifest {
  format: 1; time: string; host: string; url: string; machine: string;
  grades: Partial<Record<Grade, FileEntry>>;
  total: { served: number; pending: number; retired: number; bytes: number; gzipBytes: number };
}

export interface ExportDeps {
  /** A trusted post (bank-post.ts's trustedPoster). */
  post(body: Record<string, unknown>, what: string): Promise<Answer>;
  now(): number;
  wait(ms: number): Promise<void>;
  random?: () => number;
  log(line: string): void;
  /** Blanked out of any body it logs. */
  token: string;
}

/** Every item of one grade's list, in the bank's hash order, or why it could not get them. A post the bank fails is
 *  tried again after a growing wait until failures persist; a refusal stops it at once. */
export async function exportList(deps: ExportDeps, grade: Grade, list: List, failures = new Failures(deps.now)): Promise<Record<string, unknown>[] | string> {
  const random = deps.random ?? Math.random;
  const items: Record<string, unknown>[] = [];
  let after: string | null = null;
  for (;;) {
    const what = `${grade}: trusted-export ${list}`;
    let page: { items: Record<string, unknown>[]; next: string | null } | null = null;
    for (let attempt = 0; ; attempt++) {
      const r = await deps.post({ op: 'trusted-export', grade, list, after, limit: PAGE_LIMIT }, what);
      page = r.status === 200 ? pageOf(r.body, grade, list, after) : null;
      if (page) break;
      // A refusal stops it; no answer, a failing bank or a 200 that is not a page is tried again.
      if (r.status && r.status !== 200 && !transient(r.status)) return answeredLine(what, r, deps.token);
      if (r.status) deps.log(answeredLine(what, r, deps.token));
      const why = failures.failed();
      if (why) return why;
      await deps.wait(backoffMs(attempt, random));
    }
    failures.answered();
    items.push(...page.items);
    if (page.next === null) return items;
    after = page.next;
  }
}

/** A trusted-export answer when it is one for this page: its items and a next hash past `after`, else null. */
function pageOf(body: unknown, grade: Grade, list: List, after: string | null): { items: Record<string, unknown>[]; next: string | null } | null {
  if (typeof body !== 'object' || body === null) return null;
  const b = body as { grade?: unknown; list?: unknown; items?: unknown; next?: unknown };
  if (b.grade !== grade || b.list !== list || !Array.isArray(b.items)) return null;
  if (!b.items.every(i => typeof i === 'object' && i !== null && typeof (i as { h?: unknown }).h === 'string')) return null;
  const next = b.next;
  if (next !== null && (typeof next !== 'string' || !/^[0-9a-f]{16}$/.test(next) || (after !== null && next <= after) || !b.items.length)) return null;
  return { items: b.items as Record<string, unknown>[], next: next as string | null };
}

/** One grade's served, waiting and retired levels, or why it could not get them. */
export async function exportGrade(deps: ExportDeps, grade: Grade): Promise<GradeBackup | string> {
  const failures = new Failures(deps.now);
  const out: GradeBackup = { grade, served: [], pending: [], retired: [] };
  for (const list of LISTS) {
    const got = await exportList(deps, grade, list, failures);
    if (typeof got === 'string') return got;
    if (list === 'retired') out.retired = got.map(i => i.h as string);
    else out[list] = got;
  }
  return out;
}

/** The folder name for a backup taken at `ms`: its UTC time, such as 20261107T153000Z. */
export const stamp = (ms: number) => new Date(ms).toISOString().replace(/\.\d+Z$/, 'Z').replace(/[-:]/g, '');

/** A grade's file: its text and its manifest entry. */
export function gradeFile(b: GradeBackup): { text: string; entry: FileEntry } {
  const text = `${JSON.stringify(b)}\n`;
  const bytes = Buffer.from(text);
  return {
    text,
    entry: {
      file: `${b.grade}.json`, served: b.served.length, pending: b.pending.length, retired: b.retired.length,
      withoutTuple: b.served.filter(s => s.tuple === null || s.tuple === undefined).length,
      bytes: bytes.length, gzipBytes: gzipSync(bytes).length, sha256: createHash('sha256').update(bytes).digest('hex'),
    },
  };
}

export interface BackupResult { dir: string; manifest: Manifest | null; halt: string | null }

/** Pages every grade out of the bank, then writes them and the manifest into a new `<into>/<stamp>/`; nothing is
 *  written unless every grade came. Refuses a folder that is already there. Never throws for the bank. */
export async function backupAll(deps: ExportDeps, o: { grades: readonly Grade[]; into: string; url: string; machine: string }): Promise<BackupResult> {
  const time = deps.now();
  const dir = join(o.into, stamp(time));
  if (existsSync(dir)) return { dir, manifest: null, halt: `${dir} is already there` };
  const files: { text: string; entry: FileEntry }[] = [];
  for (const grade of o.grades) {
    const got = await exportGrade(deps, grade);
    if (typeof got === 'string') return { dir, manifest: null, halt: got };
    files.push(gradeFile(got));
    deps.log(`${grade}: ${got.served.length} served, ${got.pending.length} waiting, ${got.retired.length} retired`);
  }
  const manifest: Manifest = {
    format: 1, time: new Date(time).toISOString(), host: new URL(o.url).host, url: o.url, machine: o.machine,
    grades: {}, total: { served: 0, pending: 0, retired: 0, bytes: 0, gzipBytes: 0 },
  };
  mkdirSync(dir, { recursive: true, mode: 0o700 });
  for (const f of files) {
    writeFileSync(join(dir, f.entry.file), f.text);
    manifest.grades[f.entry.file.replace(/\.json$/, '') as Grade] = f.entry;
    for (const k of ['served', 'pending', 'retired', 'bytes', 'gzipBytes'] as const) manifest.total[k] += f.entry[k];
  }
  writeFileSync(join(dir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  return { dir, manifest, halt: null };
}

/** A size in bytes as people read it: 812 B, 3.4 KiB, 2.61 MiB. */
export function size(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KiB`;
  return `${(n / 1024 ** 2).toFixed(2)} MiB`;
}

/** What the backup holds, one line per grade, one for the total and one for where it is. */
export function backupLines(r: BackupResult): string[] {
  const m = r.manifest;
  if (!m) return [];
  const lines = Object.values(m.grades).map(e => {
    const lost = e.withoutTuple ? ` (${e.withoutTuple} served without a tuple)` : '';
    return `${e.file.replace(/\.json$/, '')}: ${e.served} served${lost}, ${e.pending} waiting, ${e.retired} retired; ${size(e.bytes)}, ${size(e.gzipBytes)} gzipped`;
  });
  const t = m.total;
  lines.push(`total: ${t.served} served, ${t.pending} waiting, ${t.retired} retired; ${size(t.bytes)} (${t.bytes} bytes), ${size(t.gzipBytes)} gzipped (${t.gzipBytes} bytes)`);
  lines.push(`saved in ${r.dir}`);
  return lines;
}

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const log = (line: string) => console.log(`backup-bank: ${line}`);
  const fail = (why: string, code: number): never => { console.error(`backup-bank: ${why}`); process.exit(code); };
  const into = arg('into') ?? fail('--into <dir> names the folder the backup goes in', 2);
  const grades = process.argv.includes('--difficulties') ? difficultiesOf(arg('difficulties') ?? '') : DIFFICULTY_ORDER;
  if (typeof grades === 'string') fail(grades, 2);
  const url = safeUrl(arg('url') ?? BANK_URL) ?? fail('the bank\'s URL must be HTTPS', 2);
  const token = process.env.CRETE_BANK_VERIFIER_TOKEN || fail('no CRETE_BANK_VERIFIER_TOKEN', 1);
  const r = await backupAll({
    post: trustedPoster(url, token, log), token, log,
    now: () => Date.now(), wait: ms => new Promise(res => setTimeout(res, ms)),
  }, { grades: grades as Grade[], into, url, machine: hostname() });
  if (r.halt) fail(`${r.halt}; nothing saved`, 1);
  for (const line of backupLines(r)) log(line);
}
