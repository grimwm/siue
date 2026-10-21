#!/usr/bin/env node
// Type-checks one game (tsc --noEmit per program) and bundles its entries with
// esbuild into the game's checked-in dist/. Usage, from websites/www.cs/games:
//   node _kit/build/build.mjs <game>          write dist/ (and remove extra files)
//   node _kit/build/build.mjs <game> --check  exit 1 if dist/ is stale, missing or has extra files
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import * as esbuild from 'esbuild';

const GAMES = resolve(import.meta.dirname, '..', '..');
const TSC = join(GAMES, 'node_modules', '.bin', 'tsc');
const TAILWIND = join(GAMES, 'node_modules', '.bin', 'tailwindcss');
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
  if (cfg.inlined !== undefined && !(Array.isArray(cfg.inlined) && cfg.inlined.every(p => typeof p === 'string' && p !== ''))) {
    throw new BuildError('build.json: `inlined` must be a list of package names');
  }
  if (cfg.notInlined !== undefined && !(Array.isArray(cfg.notInlined) && cfg.notInlined.every(p => typeof p === 'string' && p !== ''))) {
    throw new BuildError('build.json: `notInlined` must be a list of package names');
  }
  if (cfg.kitCss !== undefined && typeof cfg.kitCss !== 'boolean') throw new BuildError('build.json: `kitCss` must be true or false');
  const bundles = new Set(cfg.entries.map(bundleOf));
  for (const [name, file] of Object.entries(cfg.versions ?? {})) {
    if (!/^[A-Z][A-Z0-9_]*$/.test(name)) throw new BuildError(`build.json: version constant ${name} must be UPPER_CASE`);
    if (!bundles.has(file) && !existsSync(join(gameDir, file))) throw new BuildError(`build.json: version file ${file} does not exist`);
  }
  if (cfg.css !== undefined) {
    const c = cfg.css;
    if (typeof c !== 'object' || c === null || Array.isArray(c)) throw new BuildError('build.json: `css` must be { in, out } with an optional `fonts` folder');
    if (typeof c.in !== 'string' || !existsSync(join(gameDir, c.in))) throw new BuildError(`build.json: css \`in\` ${c.in} does not exist`);
    if (typeof c.out !== 'string' || !OUT_RE.test(c.out)) throw new BuildError(`build.json: css \`out\` ${c.out} must match ${OUT_RE}`);
    if (c.fonts !== undefined && (typeof c.fonts !== 'string' || !existsSync(join(gameDir, c.fonts, 'fonts.json')))) {
      throw new BuildError('build.json: css `fonts` must be a folder holding fonts.json');
    }
    if (c.out === 'kit' && cfg.kitCss === true) throw new BuildError('build.json: css `out` kit would overwrite the kit stylesheet');
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

/** Compiles a game's Tailwind entry with the pinned CLI, minified; the entry's own @source lines say which files it scans. */
export function compileCss(gameDir, css) {
  const r = spawnSync(TAILWIND, ['--input', css.in, '--output', '-', '--minify'], { cwd: gameDir, encoding: 'utf8' });
  if (r.error) throw new BuildError(`tailwindcss did not run (${r.error.message}); run npm ci in games/`);
  if (r.status !== 0) throw new BuildError(`${css.in}: tailwindcss failed:\n${r.stderr}`);
  return r.stdout;
}

const WOFF2_MAGIC = Buffer.from('wOF2');
const LICENSE_FILE_RE = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
const FONT_FILE_RE = /^[a-z0-9][a-z0-9-]*\.woff2$/;
// url(fonts/x.woff2), quoted or not, as Tailwind's minifier writes it.
const FONT_URL_RE = /url\(\s*["']?fonts\/([^"')\s]+)["']?\s*\)/g;

/** The fonts a stylesheet ships: fonts.json names each family, its source, licence and woff2 files. Returns dist path -> bytes, and one notice per family. */
export function loadFonts(gameDir, folder) {
  const dir = join(gameDir, folder);
  let manifest;
  try {
    manifest = JSON.parse(readFileSync(join(dir, 'fonts.json'), 'utf8'));
  } catch (e) {
    throw new BuildError(`${folder}/fonts.json: ${e.message}`);
  }
  if (typeof manifest !== 'object' || manifest === null || !Array.isArray(manifest.fonts) || manifest.fonts.length === 0) throw new BuildError(`${folder}/fonts.json: \`fonts\` must list at least one font`);
  const files = new Map();
  const blocks = [];
  const names = new Set();
  const isFile = p => lstatSync(p, { throwIfNoEntry: false })?.isFile() === true;
  for (const f of manifest.fonts) {
    if (typeof f !== 'object' || f === null || Array.isArray(f)) throw new BuildError(`${folder}/fonts.json: every font must be an object`);
    for (const k of ['name', 'source', 'license', 'licenseFile']) {
      if (typeof f[k] !== 'string' || f[k] === '') throw new BuildError(`${folder}/fonts.json: every font needs a \`${k}\``);
    }
    if (names.has(f.name)) throw new BuildError(`${folder}/fonts.json: duplicate font name ${f.name}`);
    names.add(f.name);
    if (!LICENSE_FILE_RE.test(f.licenseFile)) throw new BuildError(`${folder}/fonts.json: ${f.name}: licenseFile ${f.licenseFile} must be a plain file name in ${folder}/`);
    if (!Array.isArray(f.files) || f.files.length === 0) throw new BuildError(`${folder}/fonts.json: ${f.name}: \`files\` must list its woff2 files`);
    if (!existsSync(join(dir, f.licenseFile))) throw new BuildError(`${folder}/fonts.json: ${f.name}: licence file ${f.licenseFile} does not exist`);
    if (!isFile(join(dir, f.licenseFile))) throw new BuildError(`${folder}/${f.licenseFile} is not a regular file`);
    for (const name of f.files) {
      if (typeof name !== 'string' || !FONT_FILE_RE.test(name)) throw new BuildError(`${folder}/fonts.json: ${f.name}: ${name} must match ${FONT_FILE_RE}`);
      if (files.has(`fonts/${name}`)) throw new BuildError(`${folder}/fonts.json: duplicate file ${name}`);
      if (!lstatSync(join(dir, name), { throwIfNoEntry: false })) throw new BuildError(`${folder}/fonts.json: ${name} does not exist`);
      if (!isFile(join(dir, name))) throw new BuildError(`${folder}/${name} is not a regular file`);
      const bytes = readFileSync(join(dir, name));
      if (!bytes.subarray(0, 4).equals(WOFF2_MAGIC)) throw new BuildError(`${folder}/${name} is not a woff2 file`);
      files.set(`fonts/${name}`, bytes);
    }
    const text = readFileSync(join(dir, f.licenseFile), 'utf8').replace(/\r\n?/g, '\n').trim();
    blocks.push({ name: f.name, text: `${f.name} (${f.source})\nLicense: ${f.license}\n\n${text}\n` });
  }
  const stray = readdirSync(dir).filter(n => n.endsWith('.woff2') && !files.has(`fonts/${n}`));
  if (stray.length) throw new BuildError(`${folder}: ${stray.join(', ')} is not listed in fonts.json`);
  blocks.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  return { files, blocks: blocks.map(b => b.text) };
}

const LICENSES_FILE = 'THIRD_PARTY_LICENSES.txt';
const BANNER = `/*! Third-party licenses: ${LICENSES_FILE} */`;
// LICENSE, LICENCE or COPYING, optionally with -MIT and an .md, .txt or .markdown extension.
export const LICENSE_NAME_RE = /^(licen[sc]e|copying)(-mit)?(\.(md|txt|markdown))?$/i;

/** The license file among a package's file names: LICENSE and LICENCE before COPYING, then the shortest name, then alphabetical. */
export function licenseFile(names) {
  const rank = f => (/^copying/i.test(f) ? 1 : 0);
  return names.filter(f => LICENSE_NAME_RE.test(f))
    .sort((a, b) => rank(a) - rank(b) || a.length - b.length || (a < b ? -1 : a > b ? 1 : 0))[0];
}

/**
 * The runtime dependency closure of lockfile packages: `roots` are lock keys
 * (node_modules/<name>); follows `dependencies` recursively, resolving each the
 * way node does (the nearest node_modules/<dep> up the key's path). Skips
 * dev and optional packages, @types/* (declarations ship no runtime code) and the
 * names in `skip` (dependencies a package lists but its prebuilt bundle does not contain).
 * Returns key -> package name for the roots and everything they pull in.
 */
export function runtimeClosure(lock, roots, skip = []) {
  const found = new Map();
  const visit = key => {
    if (found.has(key)) return;
    const entry = lock.packages?.[key];
    if (!entry) throw new BuildError(`package-lock.json has no entry for ${key}; run npm install in games/`);
    found.set(key, key.split('node_modules/').pop());
    for (const dep of Object.keys(entry.dependencies ?? {})) {
      if (dep.startsWith('@types/') || skip.includes(dep)) continue;
      let scope = key;
      for (;;) {
        const candidate = `${scope}/node_modules/${dep}`.replace(/^\//, '');
        const hit = lock.packages[candidate];
        if (hit) {
          if (!hit.dev && !hit.optional) visit(candidate);
          break;
        }
        const i = scope.lastIndexOf('/node_modules/');
        if (i < 0) {
          if (scope === '') throw new BuildError(`package-lock.json has no entry for ${dep}, a dependency of ${key}; run npm install in games/`);
          scope = '';
        } else scope = scope.slice(0, i);
      }
    }
  };
  for (const key of roots) visit(key);
  return found;
}

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
  const file = licenseFile(readdirSync(dir));
  if (!file) throw new BuildError(`${name}: no license file (LICENSE, LICENCE or COPYING, optionally -MIT and .md, .txt or .markdown) in the package; the bundle cannot ship it without its notice`);
  const text = readFileSync(join(dir, file), 'utf8').replace(/\r\n?/g, '\n').trim();
  return `${name} ${pkg.version}\nLicense: ${license}\n\n${text}\n`;
}

const hash10 = text => createHash('sha256').update(text).digest('hex').slice(0, 10);
/** The game-relative path of an entry's bundle. */
const bundleOf = e => `dist/${e.out}.js`;

/** Bundles every entry in memory: dist-relative path -> file text, or bytes for a font. */
export async function bundle(gameDir, cfg) {
  const define = {};
  // A version naming an entry's bundle is that bundle's hash as this build makes it: those entries go first.
  const fromBundle = new Map();
  for (const [name, file] of Object.entries(cfg.versions ?? {})) {
    if (cfg.entries.some(e => bundleOf(e) === file)) fromBundle.set(file, name);
    else define[name] = JSON.stringify(hash10(readFileSync(join(gameDir, file))));
  }
  const first = e => (fromBundle.has(bundleOf(e)) ? 0 : 1);
  const entries = [...cfg.entries].sort((a, b) => first(a) - first(b));
  const outdir = join(gameDir, 'dist');
  const files = new Map();
  const packages = new Map(); // package dir -> name
  // One build per entry so a banner lands only on bundles that contain npm code.
  for (const e of entries) {
    const options = {
      absWorkingDir: gameDir,
      entryPoints: [{ in: e.in, out: e.out }],
      outdir,
      bundle: true,
      format: e.format,
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
      for (const [name, dir] of used) packages.set(dir, name);
    }
    for (const f of result.outputFiles) files.set(relative(outdir, f.path).split(sep).join('/'), f.text);
    const versioned = fromBundle.get(bundleOf(e));
    if (versioned) define[versioned] = JSON.stringify(hash10(files.get(`${e.out}.js`)));
  }
  if (cfg.kitCss === true) files.set(KIT_CSS, readFileSync(join(KIT, KIT_CSS), 'utf8'));
  const fonts = cfg.css?.fonts ? loadFonts(gameDir, cfg.css.fonts) : null;
  if (cfg.css) {
    const css = compileCss(gameDir, cfg.css);
    const shipped = fonts?.files ?? new Map();
    const used = new Set([...css.matchAll(FONT_URL_RE)].map(m => `fonts/${m[1]}`));
    const missing = [...used].filter(p => !shipped.has(p));
    if (missing.length) throw new BuildError(`${cfg.css.in}: ${missing.join(', ')} is not in ${cfg.css.fonts ?? 'fonts'}/fonts.json`);
    const unused = [...shipped.keys()].filter(p => !used.has(p));
    if (unused.length) throw new BuildError(`${cfg.css.fonts}/fonts.json: ${unused.join(', ')} is not used by ${cfg.css.in}`);
    const cssName = `${cfg.css.out}.css`;
    if (files.has(cssName)) throw new BuildError(`build.json: css \`out\` ${cfg.css.out} collides with the bundle's own ${cssName} (an entry's stylesheet); pick another css out`);
    files.set(cssName, css);
    for (const [p, bytes] of shipped) files.set(p, bytes);
  }
  // Packages a bundled dependency carries prebuilt inside itself (OSMD's min.js inlines jszip, pako and more): esbuild never
  // sees them, so the notices come from the lockfile's runtime dependency closure of every package it did see,
  // plus any package build.json's `inlined` names (and their closures).
  let blocks = [];
  if (packages.size || (cfg.inlined ?? []).length) {
    const lockFile = join(GAMES, 'package-lock.json');
    const lock = existsSync(lockFile) ? JSON.parse(readFileSync(lockFile, 'utf8')) : { packages: {} };
    const roots = [...packages.keys()].map(dir => relative(GAMES, dir).split(sep).join('/'));
    const unlocked = [];
    for (const name of cfg.inlined ?? []) {
      const dir = join(GAMES, 'node_modules', ...name.split('/'));
      if (!existsSync(join(dir, 'package.json'))) throw new BuildError(`build.json: inlined package ${name} is not installed in games/node_modules`);
      packages.set(dir, name);
      const key = `node_modules/${name}`;
      if (lock.packages?.[key]) roots.push(key);
      else unlocked.push(name);
    }
    for (const [key, name] of runtimeClosure(lock, roots, cfg.notInlined)) packages.set(join(GAMES, ...key.split('/')), name);
    blocks = [...packages].sort(([da, a], [db, b]) => (a < b ? -1 : a > b ? 1 : da < db ? -1 : da > db ? 1 : 0)).map(([dir, name]) => licenseBlock(name, dir));
    // Without a lockfile root its dependencies' notices cannot be collected: fail rather than write an incomplete file.
    if (unlocked.length) throw new BuildError(`build.json: inlined package ${unlocked.join(', ')} has no entry in games/package-lock.json, so its dependencies' notices cannot be collected`);
  }
  if (blocks.length || fonts) {
    const header = fonts ? "Third-party code bundled into this game's scripts, and the fonts in fonts/." : "Third-party code bundled into this game's scripts.";
    files.set(LICENSES_FILE, `${header}\n\n${[...blocks, ...(fonts?.blocks ?? [])].join('\n---\n\n')}`);
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
  const bytesOf = v => (typeof v === 'string' ? Buffer.from(v, 'utf8') : v);
  const stale = [...files].filter(([p, v]) => {
    const f = join(dist, p);
    return !existsSync(f) || !readFileSync(f).equals(bytesOf(v));
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
