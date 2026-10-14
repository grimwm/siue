import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const CENSUS = join(import.meta.dirname, 'census.ts');
const FIXTURES = join(import.meta.dirname, 'fixture', 'census');

// The outer runner marks its children; a nested run that inherits it reports to the parent instead of exiting nonzero.
const envWithoutRunner = () => Object.fromEntries(Object.entries(process.env).filter(([k]) => k !== 'NODE_TEST_CONTEXT'));

function census(args: string[], cwd = FIXTURES) {
  const r = spawnSync(process.execPath, [CENSUS, ...args], { cwd, encoding: 'utf8', env: envWithoutRunner() });
  return { status: r.status, out: r.stdout + r.stderr };
}

function tmpDir(t: { after: (fn: () => void) => void }): string {
  const dir = mkdtempSync(join(import.meta.dirname, '.tmp-census-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  return dir;
}

test('record counts leaf tests and their names, per file', t => {
  const out = join(tmpDir(t), 'before.json');
  const r = census(['record', '--out', out, 'flat.case.ts', 'nested.case.ts', 'suite.case.ts', 'loop.case.ts']);
  assert.equal(r.status, 0, r.out);
  const record = JSON.parse(readFileSync(out, 'utf8'));
  assert.deepEqual(record, {
    kind: 'node',
    files: {
      'flat.case': { leaves: 3, names: ['a', 'b', 'c'] },
      'nested.case': { leaves: 2, names: ['first', 'second'] },
      'suite.case': { leaves: 2, names: ['one', 'two'] },
      'loop.case': { leaves: 3, names: ['again', 'again', 'again'] },
    },
  });
});

test('record refuses a failing test, naming the file and the test', t => {
  const out = join(tmpDir(t), 'before.json');
  const r = census(['record', '--out', out, 'flat.case.ts', 'failing.case.ts']);
  assert.equal(r.status, 1, r.out);
  assert.match(r.out, /failing\.case\.ts/);
  assert.match(r.out, /breaks/);
  assert.throws(() => readFileSync(out), /ENOENT/);
});

test('record refuses a file that fails to load, rather than counting it', t => {
  const out = join(tmpDir(t), 'before.json');
  const r = census(['record', '--out', out, 'broken.case.ts']);
  assert.equal(r.status, 1, r.out);
  assert.match(r.out, /broken\.case\.ts: failed to load/);
  assert.throws(() => readFileSync(out), /ENOENT/);
});
