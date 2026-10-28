#!/usr/bin/env node
// Picks the browser specs a change needs, from the files it touches.
//
//   git diff --name-only origin/main...HEAD | node select.ts
//     prints NONE, ALL, or the spec files to run (one line, space-separated)
//   node select.ts --check
//     fails if some spec in this folder is not reachable from a source rule
//   ... | node select.ts --base <sha>
//     also reads each Makefile as it was at <sha>: a Makefile whose only
//     change is help text selects NONE (see helpOnlyChange). Without --base
//     every Makefile change selects ALL.
//
// Paths are relative to the repository root. Every touched file is matched
// against the rules in order; the first matching rule wins for that file,
// and the specs of all files are unioned. A file under websites/www.cs/ that
// no rule knows runs everything: the selector errs toward testing, never
// toward skipping.
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = 'websites/www.cs/';
const HERE = dirname(fileURLToPath(import.meta.url));
/** What to run: nothing, everything, or these specs. */
export type Selection = 'NONE' | 'ALL' | string[];

const SPECS = readdirSync(HERE).filter(f => f.endsWith('.spec.ts')).sort();
const tankity = SPECS.filter(f => f.startsWith('tankity-'));
const shell = ['games-hub.spec.ts', 'games-pwa.spec.ts', 'games-install.spec.ts', 'play-nav.spec.ts', 'home-eye.spec.ts', 'cylon-help.spec.ts', 'cylon-play.spec.ts'];

/* [pattern, what to run]: 'NONE', 'ALL', a list of specs, or a function of
   the regex match returning a list. */
const RULES: [RegExp, Selection | ((m: RegExpMatchArray) => string[])][] = [
  // Nothing a browser sees.
  [new RegExp(`^${SITE}music/tools/`), 'NONE'], // the owner's key tool and its tests; never served
  [/\.md$/, 'NONE'],
  [/(^|\/)LICENSE$/, 'NONE'],
  [/^(docs|\.beads|scripts)\//, 'NONE'],
  [/^\.git(attributes|ignore)$/, 'NONE'],
  [/^\.github\/workflows\/deploy\.yml$/, 'NONE'],
  [new RegExp(`^${SITE}deploy\\.sh$`), 'NONE'],
  [new RegExp(`^${SITE}docker/(check-parity\\.sh|expected-.*\\.txt)$`), 'NONE'],
  [new RegExp(`^${SITE}tests/[^/]+\\.php$`), 'NONE'], // unit tests
  [new RegExp(`^${SITE}(composer\\.(json|lock)|phpunit\\.xml)$`), 'NONE'],
  [new RegExp(`^${SITE}tests/php/`), 'NONE'],
  [new RegExp(`^${SITE}games/_kit/php/tests/`), 'NONE'],
  [new RegExp(`^${SITE}games/[^/]+/[^/]*-test\\.(php|js)$`), 'NONE'], // unit and smoke tests
  [new RegExp(`^${SITE}games/([^/]+/test|units)\\.sh$`), 'NONE'], // the unit-suite runners: each game's static and PHP steps, and every unit test
  [new RegExp(`^${SITE}games/[^/]+/(tools|protocol|fx/blender|audio/sfx/src)/`), 'NONE'], // generators, fixtures, sources
  [new RegExp(`^${SITE}games/[^/]+/(audio/(sfx/build_sfx|music/build_music)\\.sh|game\\.yaml|\\.gitignore)$`), 'NONE'],
  // The kit's own tests and docs, and a game's unit tests: not what a browser runs.
  [new RegExp(`^${SITE}games/[^/]+/test/`), 'NONE'],
  [new RegExp(`^${SITE}games/[^/]+/tsconfig\\.test\\.json$`), 'NONE'], // type-checks the unit tests only
  [new RegExp(`^${SITE}games/_kit/(tsconfig\\.test\\.json|test\\.sh)$`), 'NONE'],
  [new RegExp(`^${SITE}games/_kit/(README\\.md|test/|php/tests/|build/(build\\.test\\.(mjs|ts)|icons\\.mjs|icons\\.test\\.(mjs|ts)|fixture/))`), 'NONE'],
  // The score guard reaches a browser only as the copy each game commits in
  // its server/, and that copy selects its own game's specs. The rest of the
  // kit's PHP (install-core.php) writes every game's pages: ALL, below.
  [new RegExp(`^${SITE}games/_kit/php/score-guard\\.php$`), 'NONE'],
  // The kit's sources and the games' shared lockfile feed every game's build.
  [new RegExp(`^${SITE}games/(_kit/|package(-lock)?\\.json$)`), 'ALL'],
  // A game's lockfile only pins the compiler; what the browser runs is dist/,
  // which has its own rule below. The unit suites still check the build.
  [new RegExp(`^${SITE}games/[^/]+/package-lock\\.json$`), 'NONE'],
  // The dev-only effects editor: only the effects spec opens it.
  [new RegExp(`^${SITE}games/tankity/(fx-editor\\.(html|css)|src/fx/editor\\.ts|dist/fx-editor\\.js(\\.map)?)$`), ['tankity-fx-editor.spec.ts']],
  // The test harness, the stack and CI: everything.
  [new RegExp(`^${SITE}tests/e2e/(helpers\\.ts|playwright\\.config\\.ts|package(-lock)?\\.json|run\\.sh|select\\.ts)$`), 'ALL'],
  [new RegExp(`^${SITE}tests/e2e/(.+\\.spec\\.ts)$`), m => [m[1]!]],
  [/^(compose\.yaml|Makefile|\.github\/workflows\/ci\.yml)$/, 'ALL'],
  [new RegExp(`^${SITE}(Makefile|compose\\.yaml|docker/)`), 'ALL'],
  [new RegExp(`^${SITE}games/\\.htaccess$`), 'ALL'],
  // Tankity's TypeScript: the sources, the bundles the browser loads, and the
  // settings that decide how one becomes the other.
  [new RegExp(`^${SITE}games/tankity/(src/|dist/|build\\.json$|tsconfig\\.json$)`), [...tankity, 'games-pwa.spec.ts', 'games-hub.spec.ts', 'games-install.spec.ts', 'play-nav.spec.ts']],
  // A game's own folder.
  [new RegExp(`^${SITE}games/tankity/`), [...tankity, 'games-pwa.spec.ts', 'games-hub.spec.ts', 'games-install.spec.ts', 'play-nav.spec.ts']],
  // Cylon's folder (src/, the dist/ bundle the kit builds, build.json, tests): the home page and the games hub load it.
  [new RegExp(`^${SITE}games/cylon/`), shell],
  [new RegExp(`^${SITE}games/crete/`), ['games-hub.spec.ts', 'games-pwa.spec.ts', 'crete-play.spec.ts', 'crete-pieces.spec.ts', 'crete-layout.spec.ts', 'crete-chapter.spec.ts', 'crete-editor.spec.ts', 'crete-solver.spec.ts', 'games-install.spec.ts', 'play-nav.spec.ts']],
  // The site's own TypeScript (src/ compiles to main.js and play/play.js) and the
  // settings that decide how: the lockfile only pins the compiler.
  [new RegExp(`^${SITE}package-lock\\.json$`), 'NONE'],
  // The /play/ pages frame the games, and how decides whether Esc can be held
  // in full screen (Chrome refuses Keyboard Lock to a frame).
  [new RegExp(`^${SITE}(src/play/|play/)`), [...shell, 'tankity-fullscreen-esc.spec.ts']],
  [new RegExp(`^${SITE}(src/|package\\.json$|tsconfig\\.json$)`), shell],
  // The site shell around the games.
  [new RegExp(`^${SITE}(index\\.html|main\\.js|site\\.css|games\\.php|games/hub\\.php|games/README|site\\.webmanifest|[^/]+\\.(png|ico)|play/|tools/)`), shell],
  // Elsewhere in the site: unknown, so everything.
  [new RegExp(`^${SITE}`), 'ALL'],
  // Outside the site nothing is served.
  [/./, 'NONE'],
];

/** The Makefiles whose help-only edits skip the browser suite. */
const MAKEFILES = new RegExp(`^(${SITE})?Makefile$`);

/** What `make help` is built from, removed so the rest can be compared: the
    `##@` section headings, the trailing ` ## description` of a rule line, and
    the help recipe (every tab-indented line under `help:`). */
function withoutHelp(text: string): string[] {
  const out: string[] = [];
  let inHelp = false;
  for (const line of text.split('\n')) {
    if (inHelp && (line.startsWith('\t') || line.trim() === '')) continue;
    inHelp = false;
    if (line.startsWith('##@')) continue;
    if (/^help:/.test(line)) inHelp = true;
    out.push(line.replace(/^([^\t\s#][^#=]*:(?!=)[^#]*?)\s*##(?!@).*$/, '$1'));
  }
  // Blank lines around a dropped heading or recipe carry no meaning.
  return out.filter(l => l.trim() !== '');
}

/** True when two versions of a Makefile differ only in help text. */
export function helpOnlyChange(before: string, after: string): boolean {
  const a = withoutHelp(before);
  const b = withoutHelp(after);
  return a.length === b.length && a.every((l, i) => l === b[i]);
}

export interface Options {
  /** Whether a Makefile (by path) changed only in help text. Absent: no Makefile qualifies. */
  helpOnly?: (path: string) => boolean;
}

export function select(files: string[], opts: Options = {}): Selection {
  const picked = new Set<string>();
  for (const f of files.map(s => s.trim()).filter(Boolean)) {
    if (MAKEFILES.test(f) && opts.helpOnly?.(f)) continue;
    for (const [re, run] of RULES) {
      const m = f.match(re);
      if (!m) continue;
      const specs = typeof run === 'function' ? run(m) : run;
      if (specs === 'ALL') return 'ALL';
      if (specs !== 'NONE') specs.forEach((s: string) => picked.add(s));
      break;
    }
  }
  // A spec that no longer exists (renamed or removed in the same change) is
  // dropped; its replacement is picked up by its own path.
  const live = [...picked].filter(s => SPECS.includes(s)).sort();
  return live.length ? live : 'NONE';
}

function check() {
  // Every spec must be reachable from some source path, or a change to the
  // code it covers would never run it.
  const reachable = new Set();
  for (const [, run] of RULES) if (Array.isArray(run)) run.forEach(s => reachable.add(s));
  const missing = SPECS.filter(s => !reachable.has(s));
  if (missing.length) {
    console.error(`e2e select: no source rule runs ${missing.join(', ')}; add it to a rule in select.ts`);
    process.exit(1);
  }
  console.log('E2E-SELECT-OK');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  if (process.argv.includes('--check')) {
    check();
  } else {
    const bi = process.argv.indexOf('--base');
    const base = bi > 0 ? process.argv[bi + 1] : undefined;
    // Compares the Makefile at the base commit with the one on disk. Any
    // failure to read either side means it is not a help-only change.
    const helpOnly = base
      ? (path: string) => {
          try {
            const before = execFileSync('git', ['show', `${base}:${path}`], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
            return helpOnlyChange(before, readFileSync(path, 'utf8'));
          } catch {
            return false;
          }
        }
      : undefined;
    const out = select(readFileSync(0, 'utf8').split('\n'), { helpOnly });
    console.log(Array.isArray(out) ? out.join(' ') : out);
  }
}
