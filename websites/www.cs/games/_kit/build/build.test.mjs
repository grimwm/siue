import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const HERE = import.meta.dirname;
const CLI = join(HERE, 'build.mjs');

/** A scratch copy of the fixture inside _kit/build/, so preact resolves from games/node_modules. */
function scratch(t) {
  const dir = mkdtempSync(join(HERE, '.tmp-'));
  cpSync(join(HERE, 'fixture'), dir, { recursive: true });
  // The fixture's tsconfig extends ../tsconfig.base.json; the scratch copy sits at the same depth.
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  return dir;
}
const run = (dir, ...args) => spawnSync(process.execPath, [CLI, dir, ...args], { encoding: 'utf8' });

test('builds every entry with a linked source map', t => {
  const dir = scratch(t);
  const r = run(dir);
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(readdirSync(join(dir, 'dist')).sort(), ['main.js', 'main.js.map']);
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
