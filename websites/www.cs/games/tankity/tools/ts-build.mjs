#!/usr/bin/env node
/**
 * Compiles this game's TypeScript (src/) to the JavaScript the browser loads
 * (js/), one file to one file, with the TypeScript compiler API and the
 * options in tsconfig.json (the DOM-free modules) and src/tsconfig.dom.json
 * (the modules that need browser types). src/tsconfig.check.json is a third
 * program that only type-checks (it holds the guard that keeps the client's
 * protocol types in step with the server's fixtures) and emits nothing. A module
 * that holds only types (src/protocol.ts) compiles to nothing, so it gets no
 * js/ file. js/ is checked in: the host serves static files and has no Node,
 * so what ships is what is committed.
 *
 *   node tools/ts-build.mjs          write every stale file, drop extra ones
 *   node tools/ts-build.mjs --check  list missing, stale and extra files in
 *                                    js/ (compiling in memory), exit 1 if any
 *
 * (Run from the game folder, after `npm ci`; from the site root it is
 * node games/tankity/tools/ts-build.mjs.) Either mode exits 1 on a type error
 * and prints the diagnostics.
 * Copyright (C) 2026 William Grim
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, rmdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import ts from 'typescript';

const GAME = resolve(import.meta.dirname, '..');
const check = process.argv.includes('--check');
const rel = file => relative(GAME, file).split('\\').join('/');

/** A module whose every statement is a type: it has no run-time code to ship. */
function typesOnly(sf) {
  return sf.statements.every(st =>
    ts.isInterfaceDeclaration(st) || ts.isTypeAliasDeclaration(st)
    || (ts.isImportDeclaration(st) && st.importClause?.isTypeOnly)
    || (ts.isExportDeclaration(st) && st.isTypeOnly));
}

/** Each config is its own program, so the lib a module sees is its config's. */
const CONFIGS = ['tsconfig.json', 'src/tsconfig.dom.json', 'src/tsconfig.check.json'];

/** Reads a config file; fails the run on a config problem. */
function loadConfig(file) {
  const read = ts.readConfigFile(join(GAME, file), ts.sys.readFile);
  if (read.error) fail([read.error]);
  const parsed = ts.parseJsonConfigFileContent(read.config, ts.sys, dirname(join(GAME, file)));
  if (parsed.errors.length) fail(parsed.errors);
  return parsed;
}

function fail(diagnostics) {
  const host = { getCurrentDirectory: () => GAME, getCanonicalFileName: f => f, getNewLine: () => '\n' };
  console.error(ts.formatDiagnostics(diagnostics, host).trimEnd());
  console.error('ts-build: fix the type errors above');
  process.exit(1);
}

/** Every file under dir, as absolute paths. */
function filesUnder(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .flatMap(e => (e.isDirectory() ? filesUnder(join(dir, e.name)) : [join(dir, e.name)]));
}

/** Removes directories left empty under dir (not dir itself). */
function pruneEmpty(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    const sub = join(dir, e.name);
    pruneEmpty(sub);
    if (!readdirSync(sub).length) rmdirSync(sub);
  }
}

const outDir = resolve(GAME, 'js');

// Compile in memory: path -> text. A module two programs both reach (audio
// importing the sim, say) is emitted by each; the text is the same.
const outputs = new Map();
for (const file of CONFIGS) {
  const config = loadConfig(file);
  const program = ts.createProgram({ rootNames: config.fileNames, options: config.options });
  const problems = ts.getPreEmitDiagnostics(program);
  if (problems.length) fail(problems);
  if (config.options.noEmit) continue;
  for (const sf of program.getSourceFiles()) {
    if (sf.isDeclarationFile || program.isSourceFileFromExternalLibrary(sf) || typesOnly(sf)) continue;
    const emitted = program.emit(sf, (out, text) => outputs.set(resolve(out), text));
    if (emitted.emitSkipped) fail(emitted.diagnostics);
  }
}

const stale = [];
for (const [file, text] of outputs) {
  const have = existsSync(file) ? readFileSync(file, 'utf8') : null;
  if (have !== text) stale.push({ file, text, why: have === null ? 'is missing' : 'is stale' });
}
const extra = filesUnder(outDir).filter(f => !outputs.has(f));

if (check) {
  for (const s of stale) console.error(`ts-build: ${rel(s.file)} ${s.why}; run node tools/ts-build.mjs in the game folder`);
  for (const f of extra) console.error(`ts-build: ${rel(f)} has no source in src/; run node tools/ts-build.mjs in the game folder`);
  process.exit(stale.length || extra.length ? 1 : 0);
}
for (const s of stale) {
  mkdirSync(dirname(s.file), { recursive: true });
  writeFileSync(s.file, s.text);
  console.log(`ts-build: wrote ${rel(s.file)}`);
}
for (const f of extra) {
  unlinkSync(f);
  console.log(`ts-build: removed ${rel(f)}`);
}
if (existsSync(outDir)) pruneEmpty(outDir);
