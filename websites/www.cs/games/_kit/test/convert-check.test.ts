import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { convertSource } from './convert-check.ts';

const TOOL = join(import.meta.dirname, 'convert-check.ts');
const FIXTURES = join(import.meta.dirname, 'fixture', 'convert');

for (const name of readdirSync(FIXTURES).filter(f => f.endsWith('.in.mjs')).map(f => f.slice(0, -'.in.mjs'.length))) {
  test(`converts ${name}`, () => {
    const src = readFileSync(join(FIXTURES, `${name}.in.mjs`), 'utf8');
    const want = readFileSync(join(FIXTURES, `${name}.out.ts`), 'utf8');
    // Where the file sits decides which dom-stub import is the kit's.
    const { text } = convertSource(src, `websites/www.cs/games/g/test/${name}.test.mjs`);
    assert.equal(text, want);
  });
}

test('counts the checks it rewrote', () => {
  const src = readFileSync(join(FIXTURES, 'three-args.in.mjs'), 'utf8');
  assert.equal(convertSource(src, 'websites/www.cs/games/g/test/x.test.mjs').checks, 2);
});

/** A scratch git repository holding `files`, committed. */
function repo(t: { after: (fn: () => void) => void }, files: Record<string, string>): string {
  const root = mkdtempSync(join(tmpdir(), 'convert-check-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  execFileSync('git', ['init', '-q'], { cwd: root });
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), text);
  }
  execFileSync('git', ['add', '-A'], { cwd: root });
  execFileSync('git', ['-c', 'user.name=census', '-c', 'user.email=census@example.invalid', '-c', 'commit.gpgsign=false', 'commit', '-q', '--no-verify', '-m', 'fixture'], { cwd: root });
  return root;
}

function convert(root: string, ...args: string[]) {
  const r = spawnSync(process.execPath, [TOOL, ...args], { cwd: root, encoding: 'utf8' });
  return { status: r.status, stdout: r.stdout, stderr: r.stderr };
}

const G = 'websites/www.cs/games/g';
const BRIDGED = "import { check } from '../../_kit/test/check.ts';\n\ncheck('one', 1 === 1);\n";

test('--rename moves the file with git, converts it, and rewrites references outside docs/superpowers', t => {
  const root = repo(t, {
    [`${G}/test/x.test.mjs`]: `// ${G}/test/x.test.mjs\n${BRIDGED}`,
    [`${G}/test/y.test.mjs`]: "import './x.test.mjs';\n",
    [`${G}/src/x.ts`]: '/* test/x.test.mjs pins this, as the end of a sentence does: test/x.test.mjs. */\n',
    [`${G}/README.md`]: '`test/x.test.mjs` and `x.test.mjs`, not `test/x.test.mjs.bak` or `test/*.test.mjs`.\n',
    'websites/www.cs/games/README.md': '`g/test/x.test.mjs`\n',
    'websites/www.cs/games/h/README.md': 'Its own `test/x.test.mjs`.\n',
    'docs/superpowers/plans/p.md': `\`${G}/test/x.test.mjs\`\n`,
    [`${G}/dist/main.js.map`]: '"test/x.test.mjs"\n',
  });
  const r = convert(root, '--rename', `${G}/test/x.test.mjs`);
  assert.equal(r.status, 0, r.stderr);
  assert.equal(r.stdout, `${G}/test/x.test.ts: 1 checks rewritten, 7 references updated\n`);
  const read = (p: string) => readFileSync(join(root, p), 'utf8');
  assert.equal(read(`${G}/test/x.test.ts`), `// ${G}/test/x.test.ts\nimport { test } from 'node:test';\nimport assert from 'node:assert/strict';\n\nawait test('one', () => { assert.ok(1 === 1); });\n`);
  assert.equal(read(`${G}/test/y.test.mjs`), "import './x.test.ts';\n");
  assert.equal(read(`${G}/src/x.ts`), '/* test/x.test.ts pins this, as the end of a sentence does: test/x.test.ts. */\n');
  assert.equal(read(`${G}/README.md`), '`test/x.test.ts` and `x.test.ts`, not `test/x.test.mjs.bak` or `test/*.test.mjs`.\n');
  assert.equal(read('websites/www.cs/games/README.md'), '`g/test/x.test.ts`\n');
  assert.equal(read('websites/www.cs/games/h/README.md'), 'Its own `test/x.test.mjs`.\n');
  assert.equal(read('docs/superpowers/plans/p.md'), `\`${G}/test/x.test.mjs\`\n`);
  assert.equal(read(`${G}/dist/main.js.map`), '"test/x.test.mjs"\n');
  const status = execFileSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' });
  assert.match(status, new RegExp(`^R. ${G}/test/x\\.test\\.mjs -> ${G}/test/x\\.test\\.ts$`, 'm'));
});

test('without --rename it writes nothing and prints the converted file', t => {
  const root = repo(t, { [`${G}/test/x.test.mjs`]: BRIDGED });
  const r = convert(root, `${G}/test/x.test.mjs`);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /^await test\('one', \(\) => \{ assert\.ok\(1 === 1\); \}\);$/m);
  assert.match(r.stderr, /x\.test\.ts: 1 checks rewritten, 0 references updated/);
  assert.equal(readFileSync(join(root, `${G}/test/x.test.mjs`), 'utf8'), BRIDGED);
});

test('refuses a check import with no call to rewrite', t => {
  const root = repo(t, { [`${G}/test/x.test.mjs`]: "import { check } from '../../_kit/test/check.ts';\n" });
  const r = convert(root, '--rename', `${G}/test/x.test.mjs`);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /x\.test\.mjs: imports check but has no check\(\) call to rewrite/);
  assert.equal(readFileSync(join(root, `${G}/test/x.test.mjs`), 'utf8'), "import { check } from '../../_kit/test/check.ts';\n");
});

test("leaves a file's own check() alone", t => {
  const own = "const check = label => label;\ncheck('a');\n";
  const root = repo(t, { [`${G}/test/x.test.mjs`]: own });
  const r = convert(root, `${G}/test/x.test.mjs`);
  assert.equal(r.status, 0, r.stderr);
  assert.equal(r.stdout, own);
  assert.match(r.stderr, /0 checks rewritten/);
});

test('refuses check() calls with neither the bridge import nor a check of its own', t => {
  const root = repo(t, { [`${G}/test/x.test.mjs`]: "import { check } from './other.ts';\ncheck('a', true);\n" });
  const r = convert(root, '--rename', `${G}/test/x.test.mjs`);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /x\.test\.mjs: 1 check\(\) calls but no import of _kit\/test\/check\.ts/);
});

test('refuses an unbalanced argument list, naming the file and line', t => {
  const root = repo(t, { [`${G}/test/x.test.mjs`]: "import { check } from '../../_kit/test/check.ts';\n\ncheck('a', f(1, 2;\n" });
  const r = convert(root, `${G}/test/x.test.mjs`);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /x\.test\.mjs:3: unbalanced/);
});
