import { test, type TestContext } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, symlinkSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
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

test('an inlined package missing from the lockfile fails the build, naming it', t => {
  const dir = scratch(t);
  const name = `kit-test-unlocked-${process.pid}`;
  const pkg = join(NODE_MODULES, name);
  mkdirSync(pkg);
  t.after(() => rmSync(pkg, { recursive: true, force: true }));
  writeFileSync(join(pkg, 'package.json'), JSON.stringify({ name, version: '1.0.0', license: 'MIT' }));
  writeFileSync(join(pkg, 'LICENSE'), 'MIT test license\n');
  withInlined(dir, [name]);
  const r = run(dir);
  assert.equal(r.status, 1);
  assert.match(r.stderr, new RegExp(`inlined package ${name} has no entry in games/package-lock.json`));
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

const withCss = (dir: string, css: unknown = { in: 'src/app.css', out: 'look' }, extra = ''): void => {
  writeFileSync(join(dir, 'src/app.css'), `@import "tailwindcss" source(none);\n@source "./classes.txt";\n@theme static { --color-*: initial; --color-ink: #123456; }\n${extra}`);
  writeFileSync(join(dir, 'src/classes.txt'), 'text-ink\n');
  const cfg = JSON.parse(readFileSync(join(dir, 'build.json'), 'utf8'));
  writeFileSync(join(dir, 'build.json'), JSON.stringify({ ...cfg, css }));
};

test('css: compiles the Tailwind entry to dist/<out>.css with only the classes the sources use', t => {
  const dir = scratch(t);
  withCss(dir);
  const r = run(dir);
  assert.equal(r.status, 0, r.stderr);
  const css = readFileSync(join(dir, 'dist/look.css'), 'utf8');
  assert.ok(css.startsWith('/*! tailwindcss v4.3.3 | MIT License'), 'keeps the licence banner');
  assert.match(css, /\.text-ink\{color:var\(--color-ink\)\}/);
  assert.match(css, /--color-ink:#123456/);
  assert.doesNotMatch(css, /bg-red-500|--color-red/, 'the default palette is cleared');
  assert.equal(run(dir, '--check').status, 0);
});

test('css: --check fails on a stale stylesheet, and a build brings it back', t => {
  const dir = scratch(t);
  withCss(dir);
  run(dir);
  writeFileSync(join(dir, 'src/classes.txt'), 'text-ink bg-ink\n');
  const r = run(dir, '--check');
  assert.equal(r.status, 1);
  assert.match(r.stderr, /dist\/look\.css is stale/);
  assert.equal(run(dir).status, 0);
  assert.match(readFileSync(join(dir, 'dist/look.css'), 'utf8'), /\.bg-ink\{/);
  assert.equal(run(dir, '--check').status, 0);
});

test('css: deterministic and free of absolute paths', t => {
  const dir = scratch(t);
  withCss(dir);
  run(dir);
  const first = readFileSync(join(dir, 'dist/look.css'));
  rmSync(join(dir, 'dist'), { recursive: true });
  run(dir);
  assert.ok(first.equals(readFileSync(join(dir, 'dist/look.css'))));
  assert.doesNotMatch(first.toString('utf8'), /\/Users\/|\/home\/|[A-Z]:\\\\|file:\/\//);
});

test('css: a game without the key gets no stylesheet', t => {
  const dir = scratch(t);
  run(dir);
  assert.deepEqual(readdirSync(join(dir, 'dist')).filter(f => f.endsWith('.css')), []);
});

test('css: a bad css entry is refused with a reason', t => {
  const dir = scratch(t);
  withCss(dir, { in: 'src/none.css', out: 'look' });
  let r = run(dir);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /css `in` src\/none\.css does not exist/);
  withCss(dir, { in: 'src/app.css', out: '../look' });
  r = run(dir);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /css `out` \.\.\/look must match/);
  withCss(dir, 'src/app.css');
  assert.match(run(dir).stderr, /`css` must be/);
});

test('css: a Tailwind error fails the build, names the entry and writes nothing', t => {
  const dir = scratch(t);
  withCss(dir, undefined, '.x { @apply bg-nope; }\n');
  const r = run(dir);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /src\/app\.css: tailwindcss failed/);
  assert.match(r.stderr, /bg-nope/);
  assert.ok(!existsSync(join(dir, 'dist')));
});

const WOFF2_BYTES = Buffer.concat([Buffer.from('wOF2'), Buffer.from([0, 1, 2, 254, 255])]);
const FONT_FACE = '@font-face { font-family: "Test Sans"; src: url("fonts/test-sans-400.woff2") format("woff2"); }\n';
const withFonts = (dir: string, extraCss = FONT_FACE): void => {
  mkdirSync(join(dir, 'fonts'));
  writeFileSync(join(dir, 'fonts/test-sans-400.woff2'), WOFF2_BYTES);
  writeFileSync(join(dir, 'fonts/OFL.txt'), 'Copyright Test\r\nSIL OPEN FONT LICENSE Version 1.1\r\n');
  writeFileSync(join(dir, 'fonts/fonts.json'), JSON.stringify({ fonts: [{ name: 'Test Sans', source: 'test 1.0', license: 'OFL-1.1', licenseFile: 'OFL.txt', files: ['test-sans-400.woff2'] }] }));
  withCss(dir, { in: 'src/app.css', out: 'look', fonts: 'fonts' }, extraCss);
};

test('fonts: each listed woff2 is copied byte for byte to dist/fonts/', t => {
  const dir = scratch(t);
  withFonts(dir);
  const r = run(dir);
  assert.equal(r.status, 0, r.stderr);
  assert.ok(readFileSync(join(dir, 'dist/fonts/test-sans-400.woff2')).equals(WOFF2_BYTES));
  assert.match(readFileSync(join(dir, 'dist/look.css'), 'utf8'), /url\(fonts\/test-sans-400\.woff2\)/);
  assert.equal(run(dir, '--check').status, 0);
});

test('fonts: their licences follow the package notices, under a header that names them', t => {
  const dir = scratch(t);
  withFonts(dir);
  run(dir);
  const text = readFileSync(join(dir, LICENSES), 'utf8');
  assert.ok(text.startsWith("Third-party code bundled into this game's scripts, and the fonts in fonts/.\n\n"));
  assert.ok(text.includes('Test Sans (test 1.0)\nLicense: OFL-1.1\n\nCopyright Test\nSIL OPEN FONT LICENSE Version 1.1\n'));
  assert.ok(!text.includes('\r'));
  assert.ok(text.indexOf(`preact ${preactVersion}`) < text.indexOf('Test Sans'));
});

test('fonts: a game without fonts keeps the plain header', t => {
  const dir = scratch(t);
  run(dir);
  assert.ok(readFileSync(join(dir, LICENSES), 'utf8').startsWith("Third-party code bundled into this game's scripts.\n\n"));
});

test('fonts: --check fails when a shipped font changes, and a build restores it', t => {
  const dir = scratch(t);
  withFonts(dir);
  run(dir);
  writeFileSync(join(dir, 'dist/fonts/test-sans-400.woff2'), Buffer.from('wOF2changed'));
  const r = run(dir, '--check');
  assert.equal(r.status, 1);
  assert.match(r.stderr, /dist\/fonts\/test-sans-400\.woff2/);
  run(dir);
  assert.ok(readFileSync(join(dir, 'dist/fonts/test-sans-400.woff2')).equals(WOFF2_BYTES));
});

test('fonts: a listed file that is not woff2 is refused', t => {
  const dir = scratch(t);
  withFonts(dir);
  writeFileSync(join(dir, 'fonts/test-sans-400.woff2'), 'not a font');
  const r = run(dir);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /fonts\/test-sans-400\.woff2 is not a woff2 file/);
});

test('fonts: a woff2 the manifest does not list is refused', t => {
  const dir = scratch(t);
  withFonts(dir);
  writeFileSync(join(dir, 'fonts/stray.woff2'), WOFF2_BYTES);
  assert.match(run(dir).stderr, /stray\.woff2 is not listed in fonts\.json/);
});

test('fonts: a missing licence file is refused', t => {
  const dir = scratch(t);
  withFonts(dir);
  rmSync(join(dir, 'fonts/OFL.txt'));
  assert.match(run(dir).stderr, /Test Sans: licence file OFL\.txt does not exist/);
});

test('fonts: the stylesheet points only at fonts that ship, and every shipped font is used', t => {
  let dir = scratch(t);
  withFonts(dir, `${FONT_FACE}@font-face { font-family: "Gone"; src: url("fonts/gone.woff2"); }\n`);
  assert.match(run(dir).stderr, /fonts\/gone\.woff2 is not in fonts\/fonts\.json/);
  dir = scratch(t);
  withFonts(dir, '');
  assert.match(run(dir).stderr, /fonts\/test-sans-400\.woff2 is not used by src\/app\.css/);
});

const setManifest = (dir: string, fonts: unknown): void => writeFileSync(join(dir, 'fonts/fonts.json'), JSON.stringify({ fonts }));
const entry = (over: Record<string, unknown> = {}) => ({ name: 'Test Sans', source: 'test 1.0', license: 'OFL-1.1', licenseFile: 'OFL.txt', files: ['test-sans-400.woff2'], ...over });

test('fonts: a licence file must be a plain file name inside the folder', t => {
  for (const licenseFile of ['../x.txt', '/etc/hosts']) {
    const dir = scratch(t);
    withFonts(dir);
    setManifest(dir, [entry({ licenseFile })]);
    const r = run(dir);
    assert.equal(r.status, 1);
    assert.ok(r.stderr.includes(licenseFile), r.stderr);
  }
  const dir = scratch(t);
  withFonts(dir);
  writeFileSync(join(dir, 'outside.txt'), 'secret');
  rmSync(join(dir, 'fonts/OFL.txt'));
  symlinkSync(join(dir, 'outside.txt'), join(dir, 'fonts/OFL.txt'));
  const r = run(dir);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /OFL\.txt is not a regular file/);
});

test('fonts: a listed font that is a symlink or missing is refused', t => {
  let dir = scratch(t);
  withFonts(dir);
  writeFileSync(join(dir, 'outside.woff2'), WOFF2_BYTES);
  rmSync(join(dir, 'fonts/test-sans-400.woff2'));
  symlinkSync(join(dir, 'outside.woff2'), join(dir, 'fonts/test-sans-400.woff2'));
  assert.match(run(dir).stderr, /test-sans-400\.woff2 is not a regular file/);
  dir = scratch(t);
  withFonts(dir);
  rmSync(join(dir, 'fonts/test-sans-400.woff2'));
  assert.match(run(dir).stderr, /test-sans-400\.woff2 does not exist/);
});

test('fonts: a malformed or duplicated manifest is a build error, not a crash', t => {
  const cases: [unknown, RegExp][] = [
    [null, /fonts\.json/],
    [[null], /fonts\.json: every font must be an object/],
    [[entry(), entry({ files: ['other.woff2'] })], /duplicate font name Test Sans/],
    [[entry({ files: ['test-sans-400.woff2', 'test-sans-400.woff2'] })], /duplicate file test-sans-400\.woff2/],
  ];
  for (const [fonts, re] of cases) {
    const dir = scratch(t);
    withFonts(dir);
    setManifest(dir, fonts);
    const r = run(dir);
    assert.equal(r.status, 1);
    assert.match(r.stderr, re);
    assert.doesNotMatch(r.stderr, /TypeError/);
  }
  const dir = scratch(t);
  withFonts(dir);
  writeFileSync(join(dir, 'fonts/fonts.json'), 'null');
  const r = run(dir);
  assert.equal(r.status, 1);
  assert.doesNotMatch(r.stderr, /TypeError/);
});
