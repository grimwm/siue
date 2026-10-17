import { test, type TestContext } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const HERE = import.meta.dirname;
const CLI = join(HERE, 'build.mjs');

/** A scratch copy of the fixture inside _kit/build/, so preact resolves from games/node_modules. */
function scratch(t: TestContext): string {
  const dir = mkdtempSync(join(HERE, '.tmp-'));
  cpSync(join(HERE, 'fixture'), dir, { recursive: true });
  // The fixture's tsconfig extends ../tsconfig.base.json; the scratch copy sits at the same depth.
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  return dir;
}
const run = (dir: string, ...args: string[]) => spawnSync(process.execPath, [CLI, dir, ...args], { encoding: 'utf8' });

test('builds every entry with a linked source map', t => {
  const dir = scratch(t);
  const r = run(dir);
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(readdirSync(join(dir, 'dist')).sort(), ['THIRD_PARTY_LICENSES.txt', 'main.js', 'main.js.map']);
  assert.match(readFileSync(join(dir, 'dist/main.js'), 'utf8'), /\/\/# sourceMappingURL=main\.js\.map\n?$/);
});

test('bundles preact in: no bare imports remain', t => {
  const dir = scratch(t);
  run(dir);
  const js = readFileSync(join(dir, 'dist/main.js'), 'utf8');
  assert.doesNotMatch(js, /from\s*["']preact/);
  assert.doesNotMatch(js, /import\s*\(?\s*["'][^.]/);
});

test('injects a version constant as the file content hash', t => {
  const dir = scratch(t);
  run(dir);
  const want = createHash('sha256').update('note\n').digest('hex').slice(0, 10);
  assert.ok(readFileSync(join(dir, 'dist/main.js'), 'utf8').includes(`"${want}"`));
});

test('is byte-for-byte deterministic', t => {
  const dir = scratch(t);
  run(dir);
  const first = readFileSync(join(dir, 'dist/main.js'));
  rmSync(join(dir, 'dist'), { recursive: true });
  run(dir);
  assert.ok(first.equals(readFileSync(join(dir, 'dist/main.js'))));
});

test('writes no absolute paths into the bundle or its map', t => {
  const dir = scratch(t);
  run(dir);
  for (const f of ['main.js', 'main.js.map']) {
    const text = readFileSync(join(dir, 'dist', f), 'utf8');
    assert.ok(!text.includes(dir), `${f} names the build folder`);
    assert.doesNotMatch(text, /\/Users\/|\/home\/|[A-Z]:\\\\|file:\/\//, f);
  }
});

test('--check passes on a fresh build and fails on stale, missing or extra files', t => {
  const dir = scratch(t);
  run(dir);
  assert.equal(run(dir, '--check').status, 0);
  writeFileSync(join(dir, 'dist/main.js'), '/* edited */');
  assert.equal(run(dir, '--check').status, 1);
  run(dir);
  writeFileSync(join(dir, 'dist/stray.js'), '');
  const r = run(dir, '--check');
  assert.equal(r.status, 1);
  assert.match(r.stderr, /dist\/stray\.js/);
  run(dir);
  assert.ok(!existsSync(join(dir, 'dist/stray.js')), 'a build removes extra files');
});

test('a type error fails the build and writes nothing', t => {
  const dir = scratch(t);
  writeFileSync(join(dir, 'src/pure.ts'), 'export const add = (a: number, b: number): string => a + b;\n');
  const r = run(dir);
  assert.equal(r.status, 1);
  assert.match(r.stdout + r.stderr, /TS2322/);
  assert.ok(!existsSync(join(dir, 'dist')));
});

test('the DOM-free program cannot reach the page', t => {
  const dir = scratch(t);
  writeFileSync(join(dir, 'src/pure.ts'), 'export const add = (a: number, b: number): number => a + b + document.title.length;\n');
  assert.equal(run(dir).status, 1);
});

test('a bad build.json is refused with a reason', t => {
  const dir = scratch(t);
  writeFileSync(join(dir, 'build.json'), JSON.stringify({ programs: [], entries: [{ in: 'src/main.ts', out: '../x', format: 'esm' }] }));
  const r = run(dir);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /out/);
});

test('a per-game node_modules is refused: everything resolves from games/node_modules', t => {
  const dir = scratch(t);
  mkdirSync(join(dir, 'node_modules'));
  const r = run(dir);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /node_modules.*delete it/);
  assert.ok(!existsSync(join(dir, 'dist')));
});

const LICENSES = 'dist/THIRD_PARTY_LICENSES.txt';
const preactVersion = JSON.parse(readFileSync(join(HERE, '..', '..', 'node_modules/preact/package.json'), 'utf8')).version;

test('ships the licenses of bundled npm packages: name, version, license and full text', t => {
  const dir = scratch(t);
  run(dir);
  const text = readFileSync(join(dir, LICENSES), 'utf8');
  assert.ok(text.includes(`preact ${preactVersion}\nLicense: MIT\n`));
  assert.match(text, /Permission is hereby granted, free of charge[\s\S]*THE SOFTWARE IS PROVIDED "AS IS"/);
  assert.ok(text.includes('Jason Miller'));
});

test('the bundle begins with the third-party licenses banner', t => {
  const dir = scratch(t);
  run(dir);
  assert.ok(readFileSync(join(dir, 'dist/main.js'), 'utf8').startsWith('/*! Third-party licenses: THIRD_PARTY_LICENSES.txt */\n'));
});

test('the licenses file is deterministic and holds no absolute paths or CRs', t => {
  const dir = scratch(t);
  run(dir);
  const first = readFileSync(join(dir, LICENSES));
  rmSync(join(dir, 'dist'), { recursive: true });
  run(dir);
  assert.ok(first.equals(readFileSync(join(dir, LICENSES))));
  const text = first.toString('utf8');
  assert.ok(!text.includes(dir) && !text.includes('\r'));
  assert.doesNotMatch(text, /\/Users\/|\/home\/|node_modules|[A-Z]:\\\\|file:\/\//);
});

test('--check fails when the licenses file is edited or deleted', t => {
  const dir = scratch(t);
  run(dir);
  writeFileSync(join(dir, LICENSES), 'edited\n');
  assert.equal(run(dir, '--check').status, 1);
  run(dir);
  rmSync(join(dir, LICENSES));
  const r = run(dir, '--check');
  assert.equal(r.status, 1);
  assert.match(r.stderr, /THIRD_PARTY_LICENSES\.txt/);
});

test('a game bundling no npm package gets no licenses file and no banner', t => {
  const dir = scratch(t);
  writeFileSync(join(dir, 'src/main.ts'), 'export const x: number = 1;\nconsole.log(x);\n');
  assert.equal(run(dir).status, 0);
  assert.ok(!existsSync(join(dir, LICENSES)));
  assert.doesNotMatch(readFileSync(join(dir, 'dist/main.js'), 'utf8'), /Third-party licenses/);
});

test('license files are found under the names npm packages use', async () => {
  const { LICENSE_NAME_RE } = (await import('./build.mjs')) as { LICENSE_NAME_RE: RegExp };
  for (const ok of ['LICENSE', 'LICENCE', 'license.md', 'LICENSE.txt', 'LICENSE.markdown', 'LICENSE-MIT', 'COPYING']) assert.match(ok, LICENSE_NAME_RE);
  for (const no of ['LICENSE-APACHE.bak', 'README.md', 'licenses.json', 'NOTICE']) assert.doesNotMatch(no, LICENSE_NAME_RE);
});

const NODE_MODULES = join(HERE, '..', '..', 'node_modules');
const withInlined = (dir: string, inlined: unknown): void => {
  const cfg = JSON.parse(readFileSync(join(dir, 'build.json'), 'utf8'));
  writeFileSync(join(dir, 'build.json'), JSON.stringify({ ...cfg, inlined }));
};

test('inlined packages get their notice in the licenses file, like the bundled ones', t => {
  const dir = scratch(t);
  withInlined(dir, ['lie', 'loglevel']);
  const r = run(dir);
  assert.equal(r.status, 0, r.stderr);
  const text = readFileSync(join(dir, LICENSES), 'utf8');
  for (const name of ['lie', 'loglevel']) {
    const version = JSON.parse(readFileSync(join(NODE_MODULES, name, 'package.json'), 'utf8')).version;
    assert.ok(text.includes(`${name} ${version}\nLicense: `), name);
  }
  assert.ok(text.indexOf('lie ') < text.indexOf('loglevel ') && text.indexOf('loglevel ') < text.indexOf('preact '), 'sorted by name');
  assert.equal(run(dir, '--check').status, 0);
});

test('an inlined package that is not installed fails the build, naming it', t => {
  const dir = scratch(t);
  withInlined(dir, ['no-such-package']);
  const r = run(dir);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /inlined package no-such-package is not installed/);
});

test('an inlined package without a license file fails the build, naming it', t => {
  const dir = scratch(t);
  // A package made for this test, so it never depends on what else is installed.
  const name = `kit-test-unlicensed-${process.pid}`;
  const pkg = join(NODE_MODULES, name);
  mkdirSync(pkg);
  t.after(() => rmSync(pkg, { recursive: true, force: true }));
  writeFileSync(join(pkg, 'package.json'), JSON.stringify({ name, version: '1.0.0', license: 'MIT' }));
  writeFileSync(join(pkg, 'README.md'), 'No license file here.\n');
  withInlined(dir, [name]);
  const r = run(dir);
  assert.equal(r.status, 1);
  assert.match(r.stderr, new RegExp(`${name}: no license file`));
});

test('inlined must be a list of package names', t => {
  const dir = scratch(t);
  withInlined(dir, 'jszip');
  const r = run(dir);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /`inlined` must be a list/);
});

const KIT_CSS = readFileSync(join(HERE, '..', 'kit.css'), 'utf8');

test('kitCss: true copies _kit/kit.css to dist/kit.css; without it the file is absent', t => {
  const dir = scratch(t);
  run(dir);
  assert.ok(!existsSync(join(dir, 'dist/kit.css')));
  const cfg = JSON.parse(readFileSync(join(dir, 'build.json'), 'utf8'));
  writeFileSync(join(dir, 'build.json'), JSON.stringify({ ...cfg, kitCss: true }));
  const r = run(dir);
  assert.equal(r.status, 0, r.stderr);
  assert.equal(readFileSync(join(dir, 'dist/kit.css'), 'utf8'), KIT_CSS);
  assert.equal(run(dir, '--check').status, 0);
  writeFileSync(join(dir, 'dist/kit.css'), '/* edited */');
  assert.equal(run(dir, '--check').status, 1);
  writeFileSync(join(dir, 'build.json'), JSON.stringify(cfg));
  run(dir);
  assert.ok(!existsSync(join(dir, 'dist/kit.css')), 'dropping the flag removes the copy');
});

test('kitCss must be a boolean', t => {
  const dir = scratch(t);
  const cfg = JSON.parse(readFileSync(join(dir, 'build.json'), 'utf8'));
  writeFileSync(join(dir, 'build.json'), JSON.stringify({ ...cfg, kitCss: 'yes' }));
  const r = run(dir);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /kitCss/);
});

type Mjs = {
  runtimeClosure(lock: unknown, roots: string[], skip?: string[]): Map<string, string>;
  licenseFile(names: string[]): string | undefined;
};
const kit = (): Promise<Mjs> => import('./build.mjs') as Promise<Mjs>;
const pkgs = (p: Record<string, object>) => ({ packages: { '': {}, ...p } });

test('runtimeClosure follows dependencies recursively, once each, through cycles', async () => {
  const { runtimeClosure } = await kit();
  const lock = pkgs({
    'node_modules/a': { dependencies: { b: '1' } },
    'node_modules/b': { dependencies: { c: '1', a: '1' } },
    'node_modules/c': {},
    'node_modules/unrelated': {},
  });
  assert.deepEqual([...runtimeClosure(lock, ['node_modules/a']).values()].sort(), ['a', 'b', 'c']);
});

test('runtimeClosure resolves a dependency to the nearest node_modules, scoped names included', async () => {
  const { runtimeClosure } = await kit();
  const lock = pkgs({
    'node_modules/a': { dependencies: { b: '2', '@s/c': '1' } },
    'node_modules/a/node_modules/b': {},
    'node_modules/b': {},
    'node_modules/@s/c': {},
  });
  assert.deepEqual([...runtimeClosure(lock, ['node_modules/a']).keys()].sort(),
    ['node_modules/@s/c', 'node_modules/a', 'node_modules/a/node_modules/b']);
});

test('runtimeClosure skips dev and optional packages, @types and the named skips', async () => {
  const { runtimeClosure } = await kit();
  const lock = pkgs({
    'node_modules/a': { dependencies: { d: '1', o: '1', '@types/a': '1', s: '1', k: '1' } },
    'node_modules/d': { dev: true },
    'node_modules/o': { optional: true },
    'node_modules/@types/a': {},
    'node_modules/s': { dependencies: { deep: '1' } },
    'node_modules/deep': {},
    'node_modules/k': {},
  });
  assert.deepEqual([...runtimeClosure(lock, ['node_modules/a'], ['s']).values()].sort(), ['a', 'k']);
});

test('runtimeClosure fails loudly on a package the lockfile does not know', async () => {
  const { runtimeClosure } = await kit();
  assert.throws(() => runtimeClosure(pkgs({ 'node_modules/a': { dependencies: { gone: '1' } } }), ['node_modules/a']), /no entry for gone, a dependency of node_modules\/a/);
  assert.throws(() => runtimeClosure(pkgs({}), ['node_modules/a']), /no entry for node_modules\/a/);
});

test("OSMD's closure covers every package its prebuilt bundle inlines", async () => {
  const { runtimeClosure } = await kit();
  const lock = JSON.parse(readFileSync(join(NODE_MODULES, '..', 'package-lock.json'), 'utf8'));
  const names = [...runtimeClosure(lock, ['node_modules/opensheetmusicdisplay'], ['readable-stream']).values()];
  for (const n of ['jszip', 'loglevel', 'vexflow', 'typescript-collections', 'pako', 'lie', 'immediate', 'setimmediate']) assert.ok(names.includes(n), n);
  assert.ok(!names.includes('@types/vexflow') && !names.includes('readable-stream'));
});

test('an inlined package pulls its dependencies into the licenses file', t => {
  const dir = scratch(t);
  withInlined(dir, ['lie']);
  assert.equal(run(dir).status, 0);
  const text = readFileSync(join(dir, LICENSES), 'utf8');
  assert.ok(text.includes('lie ') && text.includes('immediate '), 'lie is inlined; its dependency immediate is derived');
});

test('notInlined must be a list of package names', t => {
  const dir = scratch(t);
  const cfg = JSON.parse(readFileSync(join(dir, 'build.json'), 'utf8'));
  writeFileSync(join(dir, 'build.json'), JSON.stringify({ ...cfg, notInlined: 'x' }));
  const r = run(dir);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /`notInlined` must be a list/);
});

test('licenseFile prefers LICENSE over COPYING, whatever the order', async () => {
  const { licenseFile } = await kit();
  assert.equal(licenseFile(['COPYING', 'LICENSE', 'README.md']), 'LICENSE');
  assert.equal(licenseFile(['LICENSE.md', 'COPYING']), 'LICENSE.md');
  assert.equal(licenseFile(['COPYING.txt', 'COPYING']), 'COPYING');
  assert.equal(licenseFile(['README.md']), undefined);
});
