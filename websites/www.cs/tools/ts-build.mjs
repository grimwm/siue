#!/usr/bin/env node
/**
 * Compiles the site's own TypeScript (src/) to the JavaScript the pages load,
 * one file to one file, with the TypeScript compiler API and the options in
 * tsconfig.json: src/main.ts becomes main.js and src/play/play.ts becomes
 * play/play.js, beside the pages that load them. The compiled files are checked
 * in: the host serves static files and has no Node, so what ships is what is
 * committed.
 *
 * This is the thin sibling of the games' tools/ts-build.mjs (games/tankity,
 * games/cylon, games/crete), which are copies of each other because a game
 * folder is self-contained. The site is not a game, so its tool lives here and
 * differs in the one way that matters: the output is not a js/ folder of its
 * own but the site root itself, so it checks and writes only the files its
 * sources produce and never prunes. A source that is deleted leaves its
 * compiled file for a person to delete.
 *
 *   node tools/ts-build.mjs          write every missing or stale file
 *   node tools/ts-build.mjs --check  list missing and stale files
 *                                    (compiling in memory), exit 1 if any
 *
 * (Run from the site root, after `npm ci`.) Either mode exits 1 on a type
 * error and prints the diagnostics.
 * Copyright (C) 2026 William Grim
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import ts from 'typescript';

const SITE = resolve(import.meta.dirname, '..');
const check = process.argv.includes('--check');
const rel = file => relative(SITE, file).split('\\').join('/');

function fail(diagnostics) {
  const host = { getCurrentDirectory: () => SITE, getCanonicalFileName: f => f, getNewLine: () => '\n' };
  console.error(ts.formatDiagnostics(diagnostics, host).trimEnd());
  console.error('ts-build: fix the type errors above');
  process.exit(1);
}

const read = ts.readConfigFile(join(SITE, 'tsconfig.json'), ts.sys.readFile);
if (read.error) fail([read.error]);
const config = ts.parseJsonConfigFileContent(read.config, ts.sys, SITE);
if (config.errors.length) fail(config.errors);

// Compile in memory: path -> text.
const program = ts.createProgram({ rootNames: config.fileNames, options: config.options });
const problems = ts.getPreEmitDiagnostics(program);
if (problems.length) fail(problems);
const outputs = new Map();
for (const sf of program.getSourceFiles()) {
  if (sf.isDeclarationFile || program.isSourceFileFromExternalLibrary(sf)) continue;
  const emitted = program.emit(sf, (out, text) => outputs.set(resolve(out), text));
  if (emitted.emitSkipped) fail(emitted.diagnostics);
}
if (!outputs.size) {
  console.error('ts-build: tsconfig.json lists no source that emits anything');
  process.exit(1);
}

const stale = [];
for (const [file, text] of outputs) {
  const have = existsSync(file) ? readFileSync(file, 'utf8') : null;
  if (have !== text) stale.push({ file, text, why: have === null ? 'is missing' : 'is stale' });
}

if (check) {
  for (const s of stale) console.error(`ts-build: ${rel(s.file)} ${s.why}; run node tools/ts-build.mjs in the site folder`);
  process.exit(stale.length ? 1 : 0);
}
for (const s of stale) {
  mkdirSync(dirname(s.file), { recursive: true });
  writeFileSync(s.file, s.text);
  console.log(`ts-build: wrote ${rel(s.file)}`);
}
