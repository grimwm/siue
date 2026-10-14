#!/usr/bin/env node
// Picks the browser specs a change needs, from the files it touches.
//
//   git diff --name-only origin/main...HEAD | node select.mjs
//     prints NONE, ALL, or the spec files to run (one line, space-separated)
//   node select.mjs --check
//     fails if some spec in this folder is not reachable from a source rule
//
// Paths are relative to the repository root. Every touched file is matched
// against the rules in order; the first matching rule wins for that file,
// and the specs of all files are unioned. A file under websites/www.cs/ that
// no rule knows runs everything: the selector errs toward testing, never
// toward skipping.
import { readdirSync, readFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = 'websites/www.cs/';
const HERE = dirname(fileURLToPath(import.meta.url));
const SPECS = readdirSync(HERE).filter(f => f.endsWith('.spec.mjs')).sort();
const tankity = SPECS.filter(f => f.startsWith('tankity-'));
const shell = ['games-hub.spec.mjs', 'games-pwa.spec.mjs', 'games-install.spec.mjs', 'play-nav.spec.mjs', 'home-eye.spec.mjs', 'cylon-help.spec.mjs', 'cylon-play.spec.mjs'];

/* [pattern, what to run]: 'NONE', 'ALL', a list of specs, or a function of
   the regex match returning a list. */
const RULES = [
  // Nothing a browser sees.
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
  [new RegExp(`^${SITE}games/_kit/php/(testing|tests)/`), 'NONE'],
  [new RegExp(`^${SITE}games/[^/]+/[^/]*-test\\.(php|js)$`), 'NONE'], // unit and smoke tests
  [new RegExp(`^${SITE}games/[^/]+/test\\.sh$`), 'NONE'], // a game's unit-suite runner
  [new RegExp(`^${SITE}games/[^/]+/(tools|protocol|fx/blender|audio/sfx/src)/`), 'NONE'], // generators, fixtures, sources
  [new RegExp(`^${SITE}games/[^/]+/(audio/(sfx/build_sfx|music/build_music)\\.sh|game\\.yaml|\\.gitignore)$`), 'NONE'],
  // The kit's own tests and docs, and a game's unit tests: not what a browser runs.
  [new RegExp(`^${SITE}games/[^/]+/test/`), 'NONE'],
  [new RegExp(`^${SITE}games/_kit/(README\\.md|test/|php/tests/|build/(build\\.test\\.mjs|icons(\\.test)?\\.mjs|fixture/))`), 'NONE'],
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
  [new RegExp(`^${SITE}games/tankity/(fx-editor\\.(html|css)|src/fx/editor\\.ts|dist/fx-editor\\.js(\\.map)?)$`), ['tankity-fx-editor.spec.mjs']],
  // The test harness, the stack and CI: everything.
  [new RegExp(`^${SITE}tests/e2e/(helpers\\.mjs|playwright\\.config\\.mjs|package(-lock)?\\.json|run\\.sh|select\\.mjs)$`), 'ALL'],
  [new RegExp(`^${SITE}tests/e2e/(.+\\.spec\\.mjs)$`), m => [m[1]]],
  [/^(compose\.yaml|Makefile|\.github\/workflows\/ci\.yml)$/, 'ALL'],
  [new RegExp(`^${SITE}(Makefile|compose\\.yaml|docker/)`), 'ALL'],
  [new RegExp(`^${SITE}games/\\.htaccess$`), 'ALL'],
  // Tankity's TypeScript: the sources, the bundles the browser loads, and the
  // settings that decide how one becomes the other.
  [new RegExp(`^${SITE}games/tankity/(src/|dist/|build\\.json$|tsconfig\\.json$)`), [...tankity, 'games-pwa.spec.mjs', 'games-hub.spec.mjs', 'games-install.spec.mjs', 'play-nav.spec.mjs']],
  // A game's own folder.
  [new RegExp(`^${SITE}games/tankity/`), [...tankity, 'games-pwa.spec.mjs', 'games-hub.spec.mjs', 'games-install.spec.mjs', 'play-nav.spec.mjs']],
  // Cylon's folder (src/, the dist/ bundle the kit builds, build.json, tests): the home page and the games hub load it.
  [new RegExp(`^${SITE}games/cylon/`), shell],
  [new RegExp(`^${SITE}games/crete/`), ['games-hub.spec.mjs', 'games-pwa.spec.mjs', 'crete-play.spec.mjs', 'games-install.spec.mjs', 'play-nav.spec.mjs']],
  // The site's own TypeScript (src/ compiles to main.js and play/play.js) and the
  // settings that decide how: the lockfile only pins the compiler.
  [new RegExp(`^${SITE}package-lock\\.json$`), 'NONE'],
  // The /play/ pages frame the games, and how decides whether Esc can be held
  // in full screen (Chrome refuses Keyboard Lock to a frame).
  [new RegExp(`^${SITE}(src/play/|play/)`), [...shell, 'tankity-fullscreen-esc.spec.mjs']],
  [new RegExp(`^${SITE}(src/|package\\.json$|tsconfig\\.json$)`), shell],
  // The site shell around the games.
  [new RegExp(`^${SITE}(index\\.html|main\\.js|site\\.css|games\\.php|games/hub\\.php|games/README|site\\.webmanifest|[^/]+\\.(png|ico)|play/|tools/)`), shell],
  // Elsewhere in the site: unknown, so everything.
  [new RegExp(`^${SITE}`), 'ALL'],
  // Outside the site nothing is served.
  [/./, 'NONE'],
];

export function select(files) {
  const picked = new Set();
  for (const f of files.map(s => s.trim()).filter(Boolean)) {
    for (const [re, run] of RULES) {
      const m = f.match(re);
      if (!m) continue;
      const specs = typeof run === 'function' ? run(m) : run;
      if (specs === 'ALL') return 'ALL';
      if (specs !== 'NONE') specs.forEach(s => picked.add(s));
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
    console.error(`e2e select: no source rule runs ${missing.join(', ')}; add it to a rule in select.mjs`);
    process.exit(1);
  }
  console.log('E2E-SELECT-OK');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  if (process.argv.includes('--check')) {
    check();
  } else {
    const out = select(readFileSync(0, 'utf8').split('\n'));
    console.log(Array.isArray(out) ? out.join(' ') : out);
  }
}
