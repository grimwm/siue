// Counts the tests of each test file before a conversion and checks afterwards
// that no file lost one. Single-use: it goes when the typed-tests conversion ends.
//
//   node _kit/test/census.ts record --out <json> <files...>
//     runs each file in its own `node --test` and records its leaf tests and
//     their names, keyed by the path without its extension (x.test.mjs and
//     x.test.ts share a key). Refuses if any test fails or any file fails to load.
//
// Paths are relative to the working directory, and the files run from it.
import { spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { CensusRun } from './census-reporter.ts';

export interface FileCount {
  leaves: number;
  names: string[];
}

export interface NodeRecord {
  kind: 'node';
  files: Record<string, FileCount>;
}

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
      else record.files[key] = { leaves: run.leaves, names: run.names };
    });
    if (problems.length) throw new Refusal(problems.join('\n'));
    return record;
  } finally {
    rmSync(outDir, { recursive: true, force: true });
  }
}

interface Options {
  command: string;
  out?: string;
  files: string[];
}

function parseArgs(argv: string[]): Options {
  const [command = '', ...rest] = argv;
  const options: Options = { command, files: [] };
  for (let i = 0; i < rest.length; i++) {
    const arg = rest[i]!;
    const value = () => {
      const v = rest[++i];
      if (v === undefined) throw new Refusal(`${arg} needs a value`);
      return v;
    };
    if (arg === '--out') options.out = value();
    else if (arg.startsWith('--')) throw new Refusal(`unknown option ${arg}`);
    else options.files.push(arg);
  }
  return options;
}

async function main(argv: string[]): Promise<void> {
  const options = parseArgs(argv);
  if (options.command === 'record') {
    if (!options.out) throw new Refusal('record needs --out <json>');
    if (!options.files.length) throw new Refusal('record needs files');
    const record = await countFiles(options.files);
    writeFileSync(options.out, `${JSON.stringify(record, null, 2)}\n`);
    const leaves = Object.values(record.files).reduce((sum, f) => sum + f.leaves, 0);
    console.log(`census: ${leaves} leaf tests in ${options.files.length} files -> ${options.out}`);
    return;
  }
  throw new Refusal('usage: census.ts record --out <json> <files...>');
}

if (import.meta.main) {
  main(process.argv.slice(2)).catch((e: unknown) => {
    console.error(e instanceof Refusal ? `census: ${e.message}` : e);
    process.exitCode = 1;
  });
}
