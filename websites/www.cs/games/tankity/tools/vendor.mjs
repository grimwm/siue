#!/usr/bin/env node
/**
 * Copies the ES module builds of Preact (the one runtime dependency) from
 * node_modules/ into vendor/preact/, which ships: the game is self-contained,
 * works offline as an installed app, and has no bundler. index.html's import
 * map points the bare specifiers `preact`, `preact/hooks` and
 * `preact/jsx-runtime` at these files.
 *
 *   node tools/vendor.mjs          write every missing or stale vendored file
 *   node tools/vendor.mjs --check  list missing, stale and extra files, exit 1
 *                                  if any, or if package.json does not pin
 *                                  Preact exactly, or if package-lock.json and
 *                                  node_modules/ disagree with that pin
 *
 * (Run from the game folder, after `npm ci`; from the site root it is
 * node games/tankity/tools/vendor.mjs.) The files are byte copies: never edit
 * them. To upgrade, change the version in package.json, run `npm install`, then
 * this tool, then tools/install-files.php.
 * Copyright (C) 2026 William Grim
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const GAME = resolve(import.meta.dirname, '..');
const check = process.argv.includes('--check');

/** vendored name -> file inside node_modules/preact. */
const FILES = {
  'preact.module.js': 'dist/preact.mjs',
  'hooks.module.js': 'hooks/dist/hooks.mjs',
  'jsx-runtime.module.js': 'jsx-runtime/dist/jsxRuntime.mjs',
  LICENSE: 'LICENSE',
};
const OUT = join(GAME, 'vendor', 'preact');
const PKG = join(GAME, 'node_modules', 'preact');
const rel = file => relative(GAME, file).split('\\').join('/');
const json = file => JSON.parse(readFileSync(file, 'utf8'));

const problems = [];

// The pin: an exact version in package.json, the same in the lockfile and in
// the installed package, so `npm ci` and the vendored copy cannot disagree.
const pinned = json(join(GAME, 'package.json')).dependencies?.preact;
if (!/^\d+\.\d+\.\d+$/.test(pinned ?? '')) {
  problems.push(`package.json must pin preact to an exact version in dependencies (found ${pinned === undefined ? 'none' : `"${pinned}"`})`);
}
const locked = json(join(GAME, 'package-lock.json')).packages?.['node_modules/preact']?.version;
if (locked !== pinned) {
  problems.push(`package-lock.json has preact ${locked ?? 'nowhere'}, package.json pins ${pinned}; run npm install`);
}
if (!existsSync(join(PKG, 'package.json'))) {
  problems.push('node_modules/preact is missing; run npm ci in the game folder');
} else if (json(join(PKG, 'package.json')).version !== pinned) {
  problems.push(`node_modules/preact is ${json(join(PKG, 'package.json')).version}, package.json pins ${pinned}; run npm ci`);
}
if (problems.length) {
  for (const p of problems) console.error(`vendor: ${p}`);
  process.exit(1);
}

const stale = [];
for (const [name, from] of Object.entries(FILES)) {
  const want = readFileSync(join(PKG, from));
  const file = join(OUT, name);
  const have = existsSync(file) ? readFileSync(file) : null;
  if (have === null || !have.equals(want)) {
    stale.push({ file, want, why: have === null ? 'is missing' : 'differs from node_modules/preact' });
  }
}
const extra = (existsSync(OUT) ? readdirSync(OUT) : []).filter(f => !(f in FILES)).map(f => join(OUT, f));

if (check) {
  for (const s of stale) console.error(`vendor: ${rel(s.file)} ${s.why}; run node tools/vendor.mjs in the game folder`);
  for (const f of extra) console.error(`vendor: ${rel(f)} is not a vendored Preact file; run node tools/vendor.mjs in the game folder`);
  process.exit(stale.length || extra.length ? 1 : 0);
}
mkdirSync(OUT, { recursive: true });
for (const s of stale) {
  writeFileSync(s.file, s.want);
  console.log(`vendor: wrote ${rel(s.file)}`);
}
for (const f of extra) {
  unlinkSync(f);
  console.log(`vendor: removed ${rel(f)}`);
}
