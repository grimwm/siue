import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
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

function writeRecord(dir: string, files: Record<string, { leaves: number; names: string[] }>): string {
  const path = join(dir, 'before.json');
  writeFileSync(path, JSON.stringify({ kind: 'node', files }));
  return path;
}

test('verify passes when every file keeps its leaves and names, and prints the table', t => {
  const before = writeRecord(tmpDir(t), { 'flat.case': { leaves: 3, names: ['a', 'b', 'c'] }, 'loop.case': { leaves: 3, names: ['again', 'again', 'again'] } });
  const r = census(['verify', '--before', before, 'flat.case.ts', 'loop.case.ts']);
  assert.equal(r.status, 0, r.out);
  assert.match(r.out, /\| flat\.case \| 3 \| 3 \| same \|/);
  assert.match(r.out, /\| loop\.case \| 3 \| 3 \| same \|/);
});

test('verify fails on a lost leaf, naming the file and the leaf', t => {
  const before = writeRecord(tmpDir(t), { 'flat.case': { leaves: 4, names: ['a', 'b', 'c', 'd'] } });
  const r = census(['verify', '--before', before, 'flat.case.ts']);
  assert.equal(r.status, 1, r.out);
  assert.match(r.out, /flat\.case: 4 leaves before, 3 after; missing: d/);
});

test('record notes skipped leaves, and verify rejects a leaf that is newly skipped but keeps one skipped from the start', t => {
  const dir = tmpDir(t);
  const out = join(dir, 'before.json');
  assert.equal(census(['record', '--out', out, 'skip.case.ts']).status, 0);
  const record = JSON.parse(readFileSync(out, 'utf8'));
  assert.deepEqual(record.files['skip.case'], { leaves: 2, names: ['parked', 'ran'], skipped: ['parked'] });
  assert.equal(census(['verify', '--before', out, 'skip.case.ts']).status, 0);
  const before = writeRecord(dir, { 'skip.case': { leaves: 2, names: ['parked', 'ran'] } });
  const r = census(['verify', '--before', before, 'skip.case.ts']);
  assert.equal(r.status, 1, r.out);
  assert.match(r.out, /skip\.case: newly skipped: parked/);
});

test('verify fails on a renamed leaf, naming both names', t => {
  const before = writeRecord(tmpDir(t), { 'flat.case': { leaves: 3, names: ['a', 'b', 'x'] } });
  const r = census(['verify', '--before', before, 'flat.case.ts']);
  assert.equal(r.status, 1, r.out);
  assert.match(r.out, /flat\.case: missing: x; new: c/);
});

test('verify fails when a recorded file is gone, unless it is named with --removed', t => {
  const before = writeRecord(tmpDir(t), { 'flat.case': { leaves: 3, names: ['a', 'b', 'c'] }, 'gone.case': { leaves: 1, names: ['z'] } });
  const gone = census(['verify', '--before', before, 'flat.case.ts']);
  assert.equal(gone.status, 1, gone.out);
  assert.match(gone.out, /gone\.case: recorded, but not among the files/);
  const removed = census(['verify', '--before', before, '--removed', 'gone.case', 'flat.case.ts']);
  assert.equal(removed.status, 0, removed.out);
  assert.match(removed.out, /\| gone\.case \| 1 \| 0 \| removed \|/);
});

test('verify fails on a file the record does not hold', t => {
  const before = writeRecord(tmpDir(t), { 'flat.case': { leaves: 3, names: ['a', 'b', 'c'] } });
  const r = census(['verify', '--before', before, 'flat.case.ts', 'suite.case.ts']);
  assert.equal(r.status, 1, r.out);
  assert.match(r.out, /suite\.case: not in the record/);
});

// PHPUnit stands in as fake-phpunit.sh, which copies a junit fixture to --log-junit and exits as told.
const fakePhpunit = (junit: string, exit = 0) => ['--phpunit-cmd', `sh ${join(FIXTURES, 'fake-phpunit.sh')} ${junit} ${exit}`];

test('record --phpunit-suite counts tests and assertions per class, and marks the legacy ones', t => {
  const dir = tmpDir(t);
  const out = join(dir, 'before.json');
  const r = census(['record', '--out', out, '--phpunit-suite', 's', ...fakePhpunit(join(FIXTURES, 'junit-before.xml'))], dir);
  assert.equal(r.status, 0, r.out);
  assert.deepEqual(JSON.parse(readFileSync(out, 'utf8')), {
    kind: 'phpunit',
    suite: 's',
    classes: {
      LegacyThingTest: { tests: 3, assertions: 3, legacy: true },
      RealThingTest: { tests: 2, assertions: 5, legacy: false },
    },
  });
});

test('record refuses when phpunit exits non-zero', t => {
  const dir = tmpDir(t);
  const out = join(dir, 'before.json');
  const r = census(['record', '--out', out, '--phpunit-suite', 's', ...fakePhpunit(join(FIXTURES, 'junit-before.xml'), 1)], dir);
  assert.equal(r.status, 1, r.out);
  assert.match(r.out, /phpunit exited 1/);
  assert.throws(() => readFileSync(out), /ENOENT/);
});

/** Writes the after fixture with edits, asserting each one changed it. */
function afterWith(dir: string, ...edits: [RegExp | string, string][]): string {
  let xml = readFileSync(join(FIXTURES, 'junit-after.xml'), 'utf8');
  for (const [from, to] of edits) {
    const edited = xml.replace(from, to);
    assert.notEqual(edited, xml, `fixture edit did not apply: ${from}`);
    xml = edited;
  }
  const path = join(dir, 'after.xml');
  writeFileSync(path, xml);
  return path;
}

function phpVerify(dir: string, after: string, ...extra: string[]) {
  const before = join(dir, 'before.json');
  const r = census(['record', '--out', before, '--phpunit-suite', 's', ...fakePhpunit(join(FIXTURES, 'junit-before.xml'))], dir);
  assert.equal(r.status, 0, r.out);
  return census(['verify', '--before', before, '--phpunit-suite', 's', ...fakePhpunit(after), ...extra], dir);
}

test('verify --phpunit-suite passes when each class keeps its assertions: a legacy class may regroup its cases', t => {
  const r = phpVerify(tmpDir(t), join(FIXTURES, 'junit-after.xml'));
  assert.equal(r.status, 0, r.out);
  assert.match(r.out, /\| LegacyThingTest \| 3 cases \| 2 tests, 3 assertions \| same \|/);
});

test('verify --phpunit-suite fails when a class loses an assertion', t => {
  const dir = tmpDir(t);
  const r = phpVerify(dir, afterWith(dir, [/(name="testClosing"[^>]*assertions=")1"/, '$10"']));
  assert.equal(r.status, 1, r.out);
  assert.match(r.out, /LegacyThingTest: 3 assertions before, 2 after/);
});

test('verify --phpunit-suite fails when a class that was already a TestCase loses a test, even with every assertion kept', t => {
  const dir = tmpDir(t);
  const r = phpVerify(dir, afterWith(dir, [/(name="testFirst"[^>]*assertions=")2"/, '$15"'], [/\s*<testcase name="testSecond"[^>]*>/, '']));
  assert.equal(r.status, 1, r.out);
  assert.match(r.out, /RealThingTest: 2 tests before, 1 after/);
});

test('verify --phpunit-suite fails when a class is gone, unless it is named with --removed', t => {
  const dir = tmpDir(t);
  const after = afterWith(dir, [/\s*<testsuite name="RealThingTest"[\s\S]*?<\/testsuite>/, '']);
  const gone = phpVerify(dir, after);
  assert.equal(gone.status, 1, gone.out);
  assert.match(gone.out, /RealThingTest: recorded, but not in the run/);
  const removed = phpVerify(dir, after, '--removed', 'RealThingTest');
  assert.equal(removed.status, 0, removed.out);
});
