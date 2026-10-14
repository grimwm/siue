// Every unit test in the games is TypeScript, type-checked by its game's build,
// and runs on node:test and PHPUnit directly: no check() or LegacyCheckCase
// bridge. ALLOW names what is not converted yet. It only shrinks: an entry that
// is no longer needed fails as stale, and once every list is empty the bridges
// themselves must be gone.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, posix, relative } from 'node:path';

interface Allow {
  /** `*.test.mjs` files not yet renamed, relative to games/. */
  mjs: string[];
  /** Folders (relative to games/) whose tsconfig.test.json is missing, incomplete, or not in build.json. */
  program: string[];
  /** Test runners (relative to games/) without the zero-files guard. */
  runner: string[];
  /** Files (relative to games/) that still import _kit/test/check.ts. */
  check: string[];
  /** PHP classes (relative to the site) that still extend LegacyCheckCase. */
  legacy: string[];
}

const ALLOW: Allow = {
  mjs: [
    'crete/test/audio.test.mjs',
    'crete/test/bots.test.mjs',
    'crete/test/engine.test.mjs',
    'crete/test/maze-rule.test.mjs',
    'crete/test/maze-sweep.test.mjs',
    'crete/test/rules.test.mjs',
    'crete/test/smoke.test.mjs',
    'crete/test/ui.test.mjs',
    'cylon/test/abilities.test.mjs',
    'cylon/test/audio.test.mjs',
    'cylon/test/chrome-settings.test.mjs',
    'cylon/test/field.test.mjs',
    'cylon/test/playfield.test.mjs',
    'cylon/test/rules.test.mjs',
    'cylon/test/scores.test.mjs',
    'cylon/test/smoke.test.mjs',
    'cylon/test/state.test.mjs',
    'cylon/test/ui.test.mjs',
    'tankity/test/ai-arcs.test.mjs',
    'tankity/test/ai-beams.test.mjs',
    'tankity/test/ai-earth.test.mjs',
    'tankity/test/ai-fire.test.mjs',
    'tankity/test/ai-harm.test.mjs',
    'tankity/test/ai-hitrate.test.mjs',
    'tankity/test/ai-search.test.mjs',
    'tankity/test/armor.test.mjs',
    'tankity/test/audio-announce.test.mjs',
    'tankity/test/audio-cache.test.mjs',
    'tankity/test/audio.test.mjs',
    'tankity/test/beams.test.mjs',
    'tankity/test/bomblets.test.mjs',
    'tankity/test/burial.test.mjs',
    'tankity/test/camera.test.mjs',
    'tankity/test/determinism.test.mjs',
    'tankity/test/detmath.test.mjs',
    'tankity/test/earth-fx.test.mjs',
    'tankity/test/earth-show.test.mjs',
    'tankity/test/earth.test.mjs',
    'tankity/test/endveil.test.mjs',
    'tankity/test/fall.test.mjs',
    'tankity/test/field.test.mjs',
    'tankity/test/fixed-step.test.mjs',
    'tankity/test/fire.test.mjs',
    'tankity/test/flow.test.mjs',
    'tankity/test/fullscreen.test.mjs',
    'tankity/test/games-ui.test.mjs',
    'tankity/test/games.test.mjs',
    'tankity/test/ghosts.test.mjs',
    'tankity/test/help.test.mjs',
    'tankity/test/hud.test.mjs',
    'tankity/test/icons.test.mjs',
    'tankity/test/initials-picker.test.mjs',
    'tankity/test/initials.test.mjs',
    'tankity/test/input.test.mjs',
    'tankity/test/keys.test.mjs',
    'tankity/test/lobby.test.mjs',
    'tankity/test/local-board.test.mjs',
    'tankity/test/marks.test.mjs',
    'tankity/test/match-local.test.mjs',
    'tankity/test/menu.test.mjs',
    'tankity/test/music-build.test.mjs',
    'tankity/test/music-catalog.test.mjs',
    'tankity/test/net.test.mjs',
    'tankity/test/notify.test.mjs',
    'tankity/test/on-screen.test.mjs',
    'tankity/test/prefs-legacy.test.mjs',
    'tankity/test/preview.test.mjs',
    'tankity/test/protocol.test.mjs',
    'tankity/test/render.test.mjs',
    'tankity/test/replay.test.mjs',
    'tankity/test/rotate-hint.test.mjs',
    'tankity/test/scenery.test.mjs',
    'tankity/test/scores-ui.test.mjs',
    'tankity/test/seats.test.mjs',
    'tankity/test/shop.test.mjs',
    'tankity/test/sim-vectors.test.mjs',
    'tankity/test/smoke.test.mjs',
    'tankity/test/solo.test.mjs',
    'tankity/test/standings-ui.test.mjs',
    'tankity/test/standings.test.mjs',
    'tankity/test/title.test.mjs',
    'tankity/test/toasts.test.mjs',
    'tankity/test/track-toast.test.mjs',
    'tankity/test/turn-time.test.mjs',
    'tankity/test/ui.test.mjs',
    'tankity/test/weapon-keys.test.mjs',
    'tankity/test/weapon-label.test.mjs',
    'tankity/test/wide-field.test.mjs',
  ],
  program: [
    'crete',
    'cylon',
    'tankity',
  ],
  runner: [
    'crete/test.sh',
    'cylon/test.sh',
    'tankity/test.sh',
  ],
  check: [
    'crete/test/engine.test.mjs',
    'cylon/test/abilities.test.mjs',
    'cylon/test/field.test.mjs',
    'cylon/test/playfield.test.mjs',
    'cylon/test/rules.test.mjs',
    'cylon/test/scores.test.mjs',
    'cylon/test/state.test.mjs',
    'tankity/test/flow.test.mjs',
    'tankity/test/input.test.mjs',
    'tankity/test/net.test.mjs',
    'tankity/test/prefs-legacy.test.mjs',
    'tankity/test/preview.test.mjs',
    'tankity/test/protocol.test.mjs',
    'tankity/test/render.test.mjs',
    'tankity/test/replay.test.mjs',
    'tankity/test/smoke.test.mjs',
    'tankity/test/ui.test.mjs',
  ],
  legacy: [
    'games/tankity/test/php-docker/RoomsTest.php',
    'games/tankity/test/php/ConfigTest.php',
    'games/tankity/test/php/GameJsonTest.php',
    'games/tankity/test/php/RoomsSimTest.php',
  ],
};

const SITE = join(import.meta.dirname, '..', '..', '..');

const SKIP_DIRS = new Set(['node_modules', 'vendor', 'dist', 'fixture', '.git']);

/** Files under `dir`, as paths relative to `base` with forward slashes. */
function walk(dir: string, base: string): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name) || entry.name.startsWith('.tmp-')) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(path, base));
    else out.push(relative(base, path).split('\\').join('/'));
  }
  return out;
}

/** JSON with comments, as tsconfig files are written; a glob like test/**\/*.ts inside a string is not a comment. */
function readJsonc(path: string): unknown {
  const src = readFileSync(path, 'utf8');
  let out = '';
  for (let i = 0; i < src.length; i++) {
    const c = src[i]!;
    if (c === '"') {
      let j = i + 1;
      while (j < src.length && src[j] !== '"') j += src[j] === '\\' ? 2 : 1;
      out += src.slice(i, j + 1);
      i = j;
    } else if (c === '/' && src[i + 1] === '/') {
      while (i < src.length && src[i] !== '\n') i++;
      out += '\n';
    } else if (c === '/' && src[i + 1] === '*') {
      i = src.indexOf('*/', i + 2) + 1;
      if (i === 0) throw new Error(`${path}: unterminated comment`);
    } else out += c;
  }
  return JSON.parse(out);
}

const asStrings = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);

/** What is wrong with a folder's test program, or [] when it is complete. `folder` is relative to games/. */
function programGaps(games: string, folder: string): string[] {
  const config = join(games, folder, 'tsconfig.test.json');
  if (!existsSync(config)) return [`${folder}/tsconfig.test.json is missing`];
  const json = readJsonc(config) as { compilerOptions?: { types?: unknown }; include?: unknown };
  const gaps: string[] = [];
  if (!asStrings(json.compilerOptions?.types).includes('node')) gaps.push(`${folder}/tsconfig.test.json: types must include node`);
  const include = asStrings(json.include);
  const wanted = folder === '_kit' ? ['test/**/*.test.ts', 'build/*.test.ts'] : ['test/**/*.ts'];
  for (const w of wanted) if (!include.includes(w)) gaps.push(`${folder}/tsconfig.test.json: include must hold ${w}`);
  if (folder !== '_kit') {
    const build = join(games, folder, 'build.json');
    const programs = existsSync(build) ? asStrings((readJsonc(build) as { programs?: unknown }).programs) : [];
    if (!programs.includes('tsconfig.test.json')) gaps.push(`${folder}/build.json: programs must list tsconfig.test.json`);
  }
  return gaps;
}

// R2: a runner expands its globs itself and fails on none, so a typo cannot pass with zero tests.
function runnerGuarded(games: string, runner: string): boolean {
  const path = join(games, runner);
  if (!existsSync(path)) return false;
  const sh = readFileSync(path, 'utf8');
  return /^\s*set -- .*\.test\.(ts|mjs)/m.test(sh) && sh.includes('[ -e "$1" ] ||') && sh.includes('node --test "$@"');
}

const BRIDGE = '_kit/test/check.ts';

function importsBridge(games: string, file: string): boolean {
  const text = readFileSync(join(games, file), 'utf8');
  // Static imports start a line; a string that merely holds one (a fixture in a test) does not count.
  for (const m of text.matchAll(/^\s*(?:import|export)\b[^;'"]*?\bfrom\s*['"]([^'"]+)['"]|\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/gm)) {
    const spec = m[1] ?? m[2] ?? '';
    if (spec.startsWith('.') && posix.join(posix.dirname(file), spec) === BRIDGE) return true;
  }
  return false;
}

const LEGACY_CLASS = /^\s*(?:(?:final|abstract|readonly)\s+)*class\s+\w+\s+extends\s+LegacyCheckCase\b/m;

// Spelled in pieces so this file does not trip its own check.
const ANY_TYPE = new RegExp([':\\s*' + 'any\\b', '\\bas\\s+' + 'any\\b', '<' + 'any>'].join('|'));
const DIRECTIVES = new RegExp(['@ts-' + 'ignore', '@ts-' + 'nocheck'].join('|'));
// A test's name is prose ("six icons: any, maskable"), so the type patterns look outside quoted strings.
const QUOTED = /'(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"/g;
const escapeIn = (text: string) => ANY_TYPE.exec(text.replace(QUOTED, "''")) ?? DIRECTIVES.exec(text);

/** Every rule the typed tests keep, as messages; [] when the tree keeps them all. */
function problems(site: string, allow: Allow): string[] {
  const games = join(site, 'games');
  const out: string[] = [];
  const stale = (list: string, entry: string) => out.push(`stale allowlist entry: remove it (ALLOW.${list}: ${entry})`);
  const files = walk(games, games);
  const folders = readdirSync(games, { withFileTypes: true })
    .filter(d => d.isDirectory() && !d.name.startsWith('.') && d.name !== 'node_modules')
    .map(d => d.name)
    .filter(name => name === '_kit' || existsSync(join(games, name, 'test')));

  // (a) No test file is still JavaScript.
  for (const f of files.filter(f => f.endsWith('.test.mjs'))) {
    if (!allow.mjs.includes(f)) out.push(`${f}: rename it to .test.ts`);
  }
  for (const f of allow.mjs) if (!existsSync(join(games, f))) stale('mjs', f);

  // (b, c) Each game's tests, and the kit's, are a type-checked program.
  for (const folder of folders) {
    const gaps = programGaps(games, folder);
    if (gaps.length && !allow.program.includes(folder)) out.push(...gaps);
  }
  for (const folder of allow.program) {
    if (!folders.includes(folder) || !programGaps(games, folder).length) stale('program', folder);
  }

  // (g) Every runner fails when it finds no test files.
  const runners = folders.map(f => `${f}/test.sh`);
  for (const r of runners) if (!runnerGuarded(games, r) && !allow.runner.includes(r)) out.push(`${r}: missing, or without the zero-files guard (set -- <globs>; [ -e "$1" ] || exit 1; node --test "$@")`);
  for (const r of allow.runner) if (!runners.includes(r) || runnerGuarded(games, r)) stale('runner', r);

  // (d) Nothing runs through the check() bridge.
  const sources = files.filter(f => /\.(mjs|js|ts|tsx)$/.test(f));
  for (const f of sources) if (importsBridge(games, f) && !allow.check.includes(f)) out.push(`${f}: imports ${BRIDGE}; use node:test directly`);
  for (const f of allow.check) if (!existsSync(join(games, f)) || !importsBridge(games, f)) stale('check', f);

  // (e) No PHPUnit class runs a check script through LegacyCheckCase.
  const php = [...walk(join(site, 'tests'), site), ...walk(games, site)].filter(f => f.endsWith('.php'));
  const isLegacy = (f: string) => LEGACY_CLASS.test(readFileSync(join(site, f), 'utf8'));
  for (const f of php) if (isLegacy(f) && !allow.legacy.includes(f)) out.push(`${f}: extends LegacyCheckCase; make it a TestCase`);
  for (const f of allow.legacy) if (!existsSync(join(site, f)) || !isLegacy(f)) stale('legacy', f);

  // (f) No escape hatches in a typed test.
  for (const f of files.filter(f => f.endsWith('.test.ts'))) {
    const m = escapeIn(readFileSync(join(games, f), 'utf8'));
    if (m) out.push(`${f}: ${m[0]} is not allowed in a test (see games/_kit/README.md)`);
  }

  // (i) With nothing left to allow, the bridges are gone.
  if (Object.values(allow).every((list: string[]) => !list.length)) {
    for (const bridge of ['_kit/test/check.ts', '_kit/php/testing/LegacyCheckCase.php', '_kit/test/dom-stub.mjs']) {
      if (existsSync(join(games, bridge))) out.push(`${bridge}: nothing uses the bridge any more; delete it`);
    }
  }
  return out;
}

test('the games tests are typed, and the allowlist holds only what is not converted yet', () => {
  assert.deepEqual(problems(SITE, ALLOW), []);
});

// The rules on a scratch tree, so each is seen to fire.
const NONE: Allow = { mjs: [], program: [], runner: [], check: [], legacy: [] };

const RUNNER = '#!/bin/sh\nset -e\nset -- test/*.test.ts\n[ -e "$1" ] || { echo "no tests" >&2; exit 1; }\nnode --test "$@"\n';
const KIT_RUNNER = RUNNER.replace('set -- test/*.test.ts', 'set -- test/*.test.ts build/*.test.ts');

function tree(t: { after: (fn: () => void) => void }, files: Record<string, string>): string {
  const site = mkdtempSync(join(tmpdir(), 'typed-tests-'));
  t.after(() => rmSync(site, { recursive: true, force: true }));
  const all: Record<string, string> = {
    'games/_kit/tsconfig.test.json': '{\n  // The kit\'s tests.\n  "compilerOptions": { "types": ["node"] },\n  "include": ["test/**/*.test.ts", "build/*.test.ts"]\n}\n',
    'games/_kit/test.sh': KIT_RUNNER,
    'games/_kit/test/a.test.ts': "import { test } from 'node:test';\n",
    'games/g/build.json': '{ "programs": ["tsconfig.json", "tsconfig.test.json"] }\n',
    'games/g/tsconfig.test.json': '{ "compilerOptions": { "types": ["node"] }, "include": ["test/**/*.ts"] }\n',
    'games/g/test.sh': RUNNER,
    'games/g/test/b.test.ts': "import { test } from 'node:test';\n",
    'tests/php/RealTest.php': '<?php\nfinal class RealTest extends TestCase {}\n',
    ...files,
  };
  for (const [path, text] of Object.entries(all)) {
    mkdirSync(dirname(join(site, path)), { recursive: true });
    writeFileSync(join(site, path), text);
  }
  return site;
}

test('a converted tree with nothing allowed passes', t => {
  assert.deepEqual(problems(tree(t, {}), NONE), []);
});

test('each rule names what breaks it', t => {
  const site = tree(t, {
    'games/g/test/old.test.mjs': '',
    'games/g/build.json': '{ "programs": ["tsconfig.json"] }\n',
    'games/g/test.sh': "#!/bin/sh\nnode --test 'test/*.test.ts'\n",
    'games/g/test/bridged.test.ts': "import { check } from '../../_kit/test/check.ts';\n",
    'games/g/test/loose.test.ts': 'const x = y as ' + 'any;\n',
    'tests/php/OldTest.php': '<?php\nfinal class OldTest extends LegacyCheckCase {}\n',
  });
  assert.deepEqual(problems(site, NONE), [
    'g/test/old.test.mjs: rename it to .test.ts',
    'g/build.json: programs must list tsconfig.test.json',
    'g/test.sh: missing, or without the zero-files guard (set -- <globs>; [ -e "$1" ] || exit 1; node --test "$@")',
    'g/test/bridged.test.ts: imports _kit/test/check.ts; use node:test directly',
    'tests/php/OldTest.php: extends LegacyCheckCase; make it a TestCase',
    'g/test/loose.test.ts: as ' + 'any is not allowed in a test (see games/_kit/README.md)',
  ]);
});

test('the type patterns skip quoted prose, and the directives are caught in comments', t => {
  const site = tree(t, {
    'games/g/test/named.test.ts': "test('six icons: any, maskable', () => {});\n",
    'games/g/test/hushed.test.ts': '// @ts-' + 'ignore\nconst x = 1;\n',
  });
  assert.deepEqual(problems(site, { ...NONE, mjs: [], program: ['g'], runner: ['g/test.sh'] }).filter(p => p.includes('is not allowed')), [
    'g/test/hushed.test.ts: @ts-' + 'ignore is not allowed in a test (see games/_kit/README.md)',
  ]);
});

test('an allowlist entry that is no longer needed is stale', t => {
  const site = tree(t, {});
  const allow: Allow = { mjs: ['g/test/gone.test.mjs'], program: ['g'], runner: ['g/test.sh'], check: ['g/test/b.test.ts'], legacy: ['tests/php/RealTest.php'] };
  assert.deepEqual(problems(site, allow), [
    'stale allowlist entry: remove it (ALLOW.mjs: g/test/gone.test.mjs)',
    'stale allowlist entry: remove it (ALLOW.program: g)',
    'stale allowlist entry: remove it (ALLOW.runner: g/test.sh)',
    'stale allowlist entry: remove it (ALLOW.check: g/test/b.test.ts)',
    'stale allowlist entry: remove it (ALLOW.legacy: tests/php/RealTest.php)',
  ]);
});

test('with nothing allowed, the bridges must be gone', t => {
  const site = tree(t, {
    'games/_kit/test/check.ts': '',
    'games/_kit/php/testing/LegacyCheckCase.php': '<?php\n',
    'games/_kit/test/dom-stub.mjs': "export * from './dom-stub.ts';\n",
  });
  assert.deepEqual(problems(site, NONE), [
    '_kit/test/check.ts: nothing uses the bridge any more; delete it',
    '_kit/php/testing/LegacyCheckCase.php: nothing uses the bridge any more; delete it',
    '_kit/test/dom-stub.mjs: nothing uses the bridge any more; delete it',
  ]);
  const allowed = problems(site, { ...NONE, mjs: ['g/test/old.test.mjs'] });
  assert.ok(allowed.every(p => !p.includes('delete it')), allowed.join('\n'));
});
