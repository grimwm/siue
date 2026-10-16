#!/usr/bin/env node
// Type-checks one game (tsc --noEmit per program) and bundles its entries with
// esbuild into the game's checked-in dist/. Usage, from websites/www.cs/games:
//   node _kit/build/build.mjs <game>          write dist/ (and remove extra files)
//   node _kit/build/build.mjs <game> --check  exit 1 if dist/ is stale, missing or has extra files
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import * as esbuild from 'esbuild';

const GAMES = resolve(import.meta.dirname, '..', '..');
const TSC = join(GAMES, 'node_modules', '.bin', 'tsc');
const KIT = resolve(import.meta.dirname, '..');
const KIT_CSS = 'kit.css';
const OUT_RE = /^[a-z][a-z0-9-]*$/;
const FORMATS = new Set(['esm', 'iife']);

class BuildError extends Error {}

/** Reads and validates <game>/build.json. */
export function loadBuildJson(gameDir) {
  let cfg;
  try {
    cfg = JSON.parse(readFileSync(join(gameDir, 'build.json'), 'utf8'));
  } catch (e) {
    throw new BuildError(`build.json: ${e.message}`);
  }
  if (!Array.isArray(cfg.programs) || !cfg.programs.every(p => typeof p === 'string')) {
    throw new BuildError('build.json: `programs` must be a list of tsconfig paths');
  }
  if (!Array.isArray(cfg.entries) || cfg.entries.length === 0) {
    throw new BuildError('build.json: `entries` must list at least one entry');
  }
  for (const e of cfg.entries) {
    if (typeof e.in !== 'string' || !existsSync(join(gameDir, e.in))) throw new BuildError(`build.json: entry \`in\` ${e.in} does not exist`);
    if (typeof e.out !== 'string' || !OUT_RE.test(e.out)) throw new BuildError(`build.json: entry \`out\` ${e.out} must match ${OUT_RE}`);
    if (!FORMATS.has(e.format)) throw new BuildError(`build.json: entry \`format\` must be esm or iife`);
  }
  if (cfg.kitCss !== undefined && typeof cfg.kitCss !== 'boolean') throw new BuildError('build.json: `kitCss` must be true or false');
  for (const [name, file] of Object.entries(cfg.versions ?? {})) {
    if (!/^[A-Z][A-Z0-9_]*$/.test(name)) throw new BuildError(`build.json: version constant ${name} must be UPPER_CASE`);
    if (!existsSync(join(gameDir, file))) throw new BuildError(`build.json: version file ${file} does not exist`);
  }
  return cfg;
}

/** Runs tsc --noEmit on each program; throws with tsc's output on any error. */
export function typecheck(gameDir, cfg) {
  for (const program of cfg.programs) {
    const r = spawnSync(TSC, ['-p', join(gameDir, program), '--pretty', 'false'], { encoding: 'utf8' });
    if (r.status !== 0) throw new BuildError(`${relative(GAMES, join(gameDir, program))}:\n${r.stdout}${r.stderr}`);
  }
}

const LICENSES_FILE = 'THIRD_PARTY_LICENSES.txt';
const BANNER = `/*! Third-party licenses: ${LICENSES_FILE} */`;
const LICENSE_NAME_RE = /^licen[sc]e(\.(md|txt))?$/i;

/** The npm packages an esbuild metafile's inputs came from: name -> package dir. */
function packagesOf(metafile, gameDir) {
  const found = new Map();
  for (const input of Object.keys(metafile.inputs)) {
    const parts = input.split('/');
    const i = parts.lastIndexOf('node_modules');
    if (i < 0) continue;
    const n = parts[i + 1]?.startsWith('@') ? 2 : 1;
    const name = parts.slice(i + 1, i + 1 + n).join('/');
    found.set(name, resolve(gameDir, ...parts.slice(0, i + 1 + n)));
  }
  return found;
}

/** One notice per package: name, version, license field and the full license text. */
function licenseBlock(name, dir) {
  const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
  const field = pkg.license ?? pkg.licenses;
  const license = typeof field === 'string' ? field
    : Array.isArray(field) ? field.map(l => l.type ?? l).join(' OR ')
    : field?.type ?? 'UNKNOWN';
  const file = readdirSync(dir).filter(f => LICENSE_NAME_RE.test(f)).sort()[0];
  if (!file) throw new BuildError(`${name}: no license file (LICENSE, LICENSE.md, LICENSE.txt) in the package; the bundle cannot ship it without its notice`);
  const text = readFileSync(join(dir, file), 'utf8').replace(/\r\n?/g, '\n').trim();
  return `${name} ${pkg.version}\nLicense: ${license}\n\n${text}\n`;
}

const hash10 = text => createHash('sha256').update(text).digest('hex').slice(0, 10);

/** Bundles every entry in memory: dist-relative path -> file text. */
export async function bundle(gameDir, cfg) {
  const define = {};
  for (const [name, file] of Object.entries(cfg.versions ?? {})) {
    define[name] = JSON.stringify(hash10(readFileSync(join(gameDir, file))));
  }
  const outdir = join(gameDir, 'dist');
  const files = new Map();
  const packages = new Map();
  for (const format of FORMATS) {
    const entries = cfg.entries.filter(e => e.format === format);
    if (!entries.length) continue;
    // One build per entry so a banner lands only on bundles that contain npm code.
    for (const e of entries) {
      const options = {
        absWorkingDir: gameDir,
        entryPoints: [{ in: e.in, out: e.out }],
        outdir,
        bundle: true,
        format,
        platform: 'browser',
        target: 'es2022',
        minify: true,
        sourcemap: 'linked',
        jsx: 'automatic',
        jsxImportSource: 'preact',
        charset: 'utf8',
        legalComments: 'eof',
        define,
        write: false,
        logLevel: 'silent',
        metafile: true,
      };
      let result = await esbuild.build(options);
      const used = packagesOf(result.metafile, gameDir);
      if (used.size) {
        result = await esbuild.build({ ...options, banner: { js: BANNER } });
        for (const [name, dir] of used) packages.set(name, dir);
      }
      for (const f of result.outputFiles) files.set(relative(outdir, f.path).split(sep).join('/'), f.text);
    }
  }
  if (cfg.kitCss === true) files.set(KIT_CSS, readFileSync(join(KIT, KIT_CSS), 'utf8'));
  if (packages.size) {
    const blocks = [...packages].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)).map(([name, dir]) => licenseBlock(name, dir));
    files.set(LICENSES_FILE, `Third-party code bundled into this game's scripts.\n\n${blocks.join('\n---\n\n')}`);
  }
  return files;
}

/** Every file under dir, dist-relative. */
function listDist(dir, base = dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap(e =>
    e.isDirectory() ? listDist(join(dir, e.name), base) : [relative(base, join(dir, e.name)).split(sep).join('/')]);
}

/** Type-checks and bundles; writes dist/ unless check. */
export async function build(gameDir, { check = false } = {}) {
  // A second node_modules would make preact resolve to another copy than the one the tests load.
  if (existsSync(join(gameDir, 'node_modules'))) {
    throw new BuildError(`${relative(GAMES, join(gameDir, 'node_modules'))} exists: delete it; everything resolves from games/node_modules`);
  }
  const cfg = loadBuildJson(gameDir);
  typecheck(gameDir, cfg);
  const files = await bundle(gameDir, cfg);
  const dist = join(gameDir, 'dist');
  const stale = [...files].filter(([p, text]) => {
    const f = join(dist, p);
    return !existsSync(f) || readFileSync(f, 'utf8') !== text;
  }).map(([p]) => p);
  const extra = listDist(dist).filter(p => !files.has(p));
  if (!check) {
    for (const p of stale) {
      mkdirSync(dirname(join(dist, p)), { recursive: true });
      writeFileSync(join(dist, p), files.get(p));
    }
    for (const p of extra) rmSync(join(dist, p));
  }
  return { stale, extra };
}

if (resolve(process.argv[1] ?? '') === resolve(import.meta.filename)) {
  const args = process.argv.slice(2);
  const check = args.includes('--check');
  const name = args.find(a => a !== '--check');
  if (!name) {
    console.error('usage: node _kit/build/build.mjs <game> [--check]');
    process.exit(1);
  }
  const gameDir = resolve(GAMES, name);
  try {
    const { stale, extra } = await build(gameDir, { check });
    const rel = p => relative(GAMES, join(gameDir, 'dist', p));
    if (check) {
      for (const p of stale) console.error(`build: ${rel(p)} is stale or missing; run node _kit/build/build.mjs ${name}`);
      for (const p of extra) console.error(`build: ${rel(p)} is not built from any entry; run node _kit/build/build.mjs ${name}`);
      process.exit(stale.length || extra.length ? 1 : 0);
    }
    for (const p of stale) console.log(`build: wrote ${rel(p)}`);
    for (const p of extra) console.log(`build: removed ${rel(p)}`);
  } catch (e) {
    if (!(e instanceof BuildError) && !e.errors) throw e;
    console.error(e.message);
    process.exit(1);
  }
}
