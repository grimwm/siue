// Counts the tests of each test file before a conversion and checks afterwards
// that no file lost one. Single-use: it goes when the typed-tests conversion ends.
//
//   node _kit/test/census.ts record --out <json> <files...>
//     runs each file in its own `node --test` and records its leaf tests and
//     their names, keyed by the path without its extension (x.test.mjs and
//     x.test.ts share a key). Refuses if any test fails or any file fails to load.
//
//   node _kit/test/census.ts verify --before <json> [--removed <key>]... <files...>
//     counts the files again and fails unless every key has as many leaves, and
//     the same names, as recorded. Prints a table for the pull request.
//
//   node _kit/test/census.ts record --out <json> --phpunit-suite <suite> [--phpunit-cmd "<prefix>"]
//   node _kit/test/census.ts verify --before <json> --phpunit-suite <suite> [--phpunit-cmd "<prefix>"] [--removed <Class>]...
//     runs `<prefix> vendor/bin/phpunit --testsuite <suite> --log-junit <file>`
//     and counts tests and assertions per class. A class built on
//     LegacyCheckCase turns each check into one case of one assertion, so after
//     its conversion only its assertions must match; a class that was already a
//     TestCase must keep its tests too. Run it from websites/www.cs: the junit
//     log is written there, which the compose container sees as /var/www/html,
//     so the prefix can be `docker compose -f ../../compose.yaml exec -T -w /var/www/html www-cs-php`.
//
// Paths are relative to the working directory, and the files run from it.
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { CensusRun } from './census-reporter.ts';

export interface FileCount {
  leaves: number;
  names: string[];
  /** Leaves recorded as skipped; absent in a record that predates this field or had none. */
  skipped?: string[];
}

export interface NodeRecord {
  kind: 'node';
  files: Record<string, FileCount>;
}

export interface ClassCount {
  tests: number;
  assertions: number;
  /** Every case came from LegacyCheckCase: one check, one assertion. */
  legacy: boolean;
}

export interface PhpRecord {
  kind: 'phpunit';
  suite: string;
  classes: Record<string, ClassCount>;
}

type CensusRecord = NodeRecord | PhpRecord;

const REPORTER = join(import.meta.dirname, 'census-reporter.ts');
const PARALLEL = 8;

class Refusal extends Error {}

/** x.test.mjs and x.test.ts both become x.test. */
export function keyOf(file: string): string {
  return file.replace(/\.(mjs|ts)$/, '');
}

function runFile(file: string, outDir: string, index: number): Promise<{ status: number | null; run: CensusRun | null; output: string }> {
  const dest = join(outDir, `${index}.jsonl`);
  // The outer runner marks its children; a nested run that inherits it reports to the parent instead.
  const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => k !== 'NODE_TEST_CONTEXT'));
  const child = spawn(process.execPath, ['--test', `--test-reporter=${REPORTER}`, `--test-reporter-destination=${dest}`, file], { env, stdio: ['ignore', 'pipe', 'pipe'] });
  let output = '';
  child.stdout.on('data', (d: Buffer) => { output += d; });
  child.stderr.on('data', (d: Buffer) => { output += d; });
  return new Promise((resolve, reject) => {
    child.on('error', reject);
    child.on('close', status => {
      let run: CensusRun | null = null;
      try {
        const line = readFileSync(dest, 'utf8').trim();
        run = line ? (JSON.parse(line) as CensusRun) : null;
      } catch {
        run = null;
      }
      resolve({ status, run, output });
    });
  });
}

/** Runs every file, PARALLEL at a time; throws a Refusal naming every file that failed. */
export async function countFiles(files: string[]): Promise<NodeRecord> {
  const outDir = mkdtempSync(join(tmpdir(), 'census-'));
  try {
    const results = new Array<Awaited<ReturnType<typeof runFile>>>(files.length);
    let next = 0;
    const worker = async () => {
      while (next < files.length) {
        const i = next++;
        results[i] = await runFile(files[i]!, outDir, i);
      }
    };
    await Promise.all(Array.from({ length: Math.min(PARALLEL, files.length) }, worker));
    const record: NodeRecord = { kind: 'node', files: {} };
    const problems: string[] = [];
    files.forEach((file, i) => {
      const { status, run, output } = results[i]!;
      const key = keyOf(file);
      if (key in record.files) problems.push(`${file}: a second file with the key ${key}`);
      if (!run) problems.push(`${file}: no census from the run (exit ${status})\n${output.trim()}`);
      else if (run.loadError !== undefined) problems.push(`${file}: failed to load\n${run.loadError}`);
      else if (run.failures.length) problems.push(...run.failures.map(f => `${file}: test failed: ${f.name}: ${f.error}`));
      else if (status !== 0) problems.push(`${file}: exit ${status}\n${output.trim()}`);
      else record.files[key] = { leaves: run.leaves, names: run.names, ...(run.skipped ? { skipped: run.skipped } : {}) };
    });
    if (problems.length) throw new Refusal(problems.join('\n'));
    return record;
  } finally {
    rmSync(outDir, { recursive: true, force: true });
  }
}

/** Counts per class from a PHPUnit junit log, read one <testcase> tag at a time. */
export function countJunit(xml: string): Record<string, ClassCount> {
  const classes: Record<string, ClassCount> = {};
  for (const [, attrText = ''] of xml.matchAll(/<testcase\b([^>]*)>/g)) {
    const attrs = Object.fromEntries(Array.from(attrText.matchAll(/([\w-]+)="([^"]*)"/g), ([, k = '', v = '']) => [k, v]));
    const name = attrs['class'];
    const assertions = Number(attrs['assertions']);
    if (!name || !Number.isInteger(assertions)) throw new Refusal(`junit testcase without a class or an assertion count: <testcase${attrText}>`);
    const legacy = (attrs['file'] ?? '').endsWith('/LegacyCheckCase.php');
    const c = (classes[name] ??= { tests: 0, assertions: 0, legacy });
    c.tests++;
    c.assertions += assertions;
    c.legacy &&= legacy;
  }
  return classes;
}

function countPhpunit(suite: string, prefix: string): PhpRecord {
  const junit = `.census-junit-${process.pid}.xml`;
  const [cmd = 'vendor/bin/phpunit', ...args] = [...prefix.split(/\s+/).filter(Boolean), 'vendor/bin/phpunit', '--testsuite', suite, '--log-junit', junit];
  try {
    const r = spawnSync(cmd, args, { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
    if (r.error) throw new Refusal(`could not run ${cmd}: ${r.error.message}`);
    if (r.status !== 0) throw new Refusal(`phpunit exited ${r.status ?? r.signal}\n${(r.stdout + r.stderr).trim()}`);
    if (!existsSync(junit)) throw new Refusal(`phpunit wrote no junit log at ${junit}`);
    const classes = countJunit(readFileSync(junit, 'utf8'));
    if (!Object.keys(classes).length) throw new Refusal(`suite ${suite}: no test cases in the junit log`);
    return { kind: 'phpunit', suite, classes };
  } finally {
    rmSync(junit, { force: true });
  }
}

/** Items of `a` that `b` lacks, as a multiset. */
function lacking(a: string[], b: string[]): string[] {
  const left = new Map<string, number>();
  for (const x of b) left.set(x, (left.get(x) ?? 0) + 1);
  return a.filter(x => {
    const n = left.get(x) ?? 0;
    if (n) left.set(x, n - 1);
    return !n;
  });
}

interface Verdict {
  table: string[];
  problems: string[];
}

export function compareNode(before: NodeRecord, after: NodeRecord, removed: Set<string>): Verdict {
  const table = ['| file | leaves before | leaves after | |', '|---|---|---|---|'];
  const problems: string[] = [];
  for (const [key, b] of Object.entries(before.files)) {
    const a = after.files[key];
    if (!a) {
      if (removed.has(key)) table.push(`| ${key} | ${b.leaves} | 0 | removed |`);
      else problems.push(`${key}: recorded, but not among the files (name it with --removed if it is meant to go)`);
      continue;
    }
    const diff: string[] = [];
    if (a.leaves !== b.leaves) diff.push(`${b.leaves} leaves before, ${a.leaves} after`);
    const missing = lacking(b.names, a.names);
    const added = lacking(a.names, b.names);
    if (missing.length) diff.push(`missing: ${missing.join(', ')}`);
    if (added.length) diff.push(`new: ${added.join(', ')}`);
    const newlySkipped = lacking(a.skipped ?? [], b.skipped ?? []);
    if (newlySkipped.length) diff.push(`newly skipped: ${newlySkipped.join(', ')}`);
    if (diff.length) problems.push(`${key}: ${diff.join('; ')}`);
    table.push(`| ${key} | ${b.leaves} | ${a.leaves} | ${diff.length ? 'DIFFERS' : 'same'} |`);
  }
  for (const key of Object.keys(after.files)) if (!(key in before.files)) problems.push(`${key}: not in the record`);
  for (const key of removed) if (!(key in before.files)) problems.push(`${key}: --removed, but not in the record`);
  for (const key of removed) if (key in after.files) problems.push(`${key}: --removed, but still among the files`);
  return { table, problems };
}

export function comparePhp(before: PhpRecord, after: PhpRecord, removed: Set<string>): Verdict {
  const table = [`| class (${before.suite}) | before | after | |`, '|---|---|---|---|'];
  const problems: string[] = [];
  const shape = (c: ClassCount) => (c.legacy ? `${c.tests} cases` : `${c.tests} tests, ${c.assertions} assertions`);
  if (after.suite !== before.suite) problems.push(`recorded suite ${before.suite}, verified suite ${after.suite}`);
  for (const [name, b] of Object.entries(before.classes)) {
    const a = after.classes[name];
    if (!a) {
      if (removed.has(name)) table.push(`| ${name} | ${shape(b)} | none | removed |`);
      else problems.push(`${name}: recorded, but not in the run (name it with --removed if it is meant to go)`);
      continue;
    }
    const diff: string[] = [];
    if (a.assertions !== b.assertions) diff.push(`${b.assertions} assertions before, ${a.assertions} after`);
    if (!b.legacy && a.tests !== b.tests) diff.push(`${b.tests} tests before, ${a.tests} after`);
    if (diff.length) problems.push(`${name}: ${diff.join('; ')}`);
    table.push(`| ${name} | ${shape(b)} | ${a.tests} tests, ${a.assertions} assertions | ${diff.length ? 'DIFFERS' : 'same'} |`);
  }
  for (const name of Object.keys(after.classes)) if (!(name in before.classes)) problems.push(`${name}: not in the record`);
  for (const name of removed) if (!(name in before.classes)) problems.push(`${name}: --removed, but not in the record`);
  for (const name of removed) if (name in after.classes) problems.push(`${name}: --removed, but still in the run`);
  return { table, problems };
}

interface Options {
  command: string;
  out?: string;
  before?: string;
  suite?: string;
  prefix: string;
  removed: Set<string>;
  files: string[];
}

function parseArgs(argv: string[]): Options {
  const [command = '', ...rest] = argv;
  const options: Options = { command, prefix: '', removed: new Set(), files: [] };
  for (let i = 0; i < rest.length; i++) {
    const arg = rest[i]!;
    const value = () => {
      const v = rest[++i];
      if (v === undefined) throw new Refusal(`${arg} needs a value`);
      return v;
    };
    if (arg === '--out') options.out = value();
    else if (arg === '--before') options.before = value();
    else if (arg === '--phpunit-suite') options.suite = value();
    else if (arg === '--phpunit-cmd') options.prefix = value();
    else if (arg === '--removed') options.removed.add(value());
    else if (arg.startsWith('--')) throw new Refusal(`unknown option ${arg}`);
    else options.files.push(arg);
  }
  if (options.suite !== undefined && options.files.length) throw new Refusal('give either --phpunit-suite or files, not both');
  if (options.suite === undefined && !options.files.length) throw new Refusal('give --phpunit-suite <suite> or files');
  return options;
}

async function count(options: Options): Promise<CensusRecord> {
  return options.suite !== undefined ? countPhpunit(options.suite, options.prefix) : await countFiles(options.files);
}

const USAGE = 'usage: census.ts record --out <json> (<files...> | --phpunit-suite <suite> [--phpunit-cmd "<prefix>"])\n'
  + '       census.ts verify --before <json> [--removed <key>]... (<files...> | --phpunit-suite <suite> [--phpunit-cmd "<prefix>"])';

async function main(argv: string[]): Promise<void> {
  const options = parseArgs(argv);
  if (options.command === 'record') {
    if (!options.out) throw new Refusal('record needs --out <json>');
    const record = await count(options);
    writeFileSync(options.out, `${JSON.stringify(record, null, 2)}\n`);
    if (record.kind === 'node') {
      const leaves = Object.values(record.files).reduce((sum, f) => sum + f.leaves, 0);
      console.log(`census: ${leaves} leaf tests in ${Object.keys(record.files).length} files -> ${options.out}`);
    } else {
      const assertions = Object.values(record.classes).reduce((sum, c) => sum + c.assertions, 0);
      console.log(`census: ${assertions} assertions in ${Object.keys(record.classes).length} classes of suite ${record.suite} -> ${options.out}`);
    }
    return;
  }
  if (options.command === 'verify') {
    if (!options.before) throw new Refusal('verify needs --before <json>');
    const before = JSON.parse(readFileSync(options.before, 'utf8')) as CensusRecord;
    const after = await count(options);
    let verdict: Verdict;
    if (before.kind === 'node' && after.kind === 'node') verdict = compareNode(before, after, options.removed);
    else if (before.kind === 'phpunit' && after.kind === 'phpunit') verdict = comparePhp(before, after, options.removed);
    else throw new Refusal(`the record holds ${before.kind} counts; verify them the same way`);
    console.log(verdict.table.join('\n'));
    if (verdict.problems.length) throw new Refusal(`verify failed:\n${verdict.problems.join('\n')}`);
    console.log('census: verified');
    return;
  }
  throw new Refusal(USAGE);
}

if (import.meta.main) {
  main(process.argv.slice(2)).catch((e: unknown) => {
    console.error(e instanceof Refusal ? `census: ${e.message}` : e);
    process.exitCode = 1;
  });
}
