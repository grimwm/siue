// Tests for select.ts. Run: node select-test.ts (exit 0 when all pass).
import { helpOnlyChange, select } from './select.ts';
import type { Selection } from './select.ts';

const S = 'websites/www.cs/';
let fail = 0;
const check = (name: string, got: unknown, want: unknown) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${ok ? '' : ` :: got ${JSON.stringify(got)} want ${JSON.stringify(want)}`}`);
  if (!ok) fail++;
};
// The specs a selection names; these checks only make sense for a list.
const list = (r: Selection): string[] => {
  if (!Array.isArray(r)) throw new Error(`expected a list of specs, got ${r}`);
  return r;
};
const has = (name: string, got: Selection, specs: string[]) => check(name, Array.isArray(got) && specs.every(s => got.includes(s)), true);

check('docs-only-runs-nothing', select(['README.md', `${S}games/tankity/README.md`, 'docs/plan.md']), 'NONE');
check('game-test-runner-runs-nothing', select([`${S}games/tankity/test.sh`, `${S}games/cylon/test.sh`]), 'NONE');
check('unit-tests-run-nothing', select([`${S}games/tankity/test/php/RoomsSimTest.php`, `${S}games/tankity/test/smoke.test.ts`, `${S}tests/games-hub-test.php`]), 'NONE');
check('phpunit-config-runs-no-browser-specs', select([`${S}phpunit.xml`]), 'NONE');
check('site-php-tests-run-no-browser-specs', select([`${S}tests/php/SiteVersionsTest.php`]), 'NONE');
check('kit-php-tests-run-no-browser-specs', select([`${S}games/_kit/php/tests/InstallCoreTest.php`]), 'NONE');
check('sim-vectors-run-nothing', select([`${S}games/tankity/test/sim-vectors.test.ts`, `${S}games/tankity/protocol/sim-vectors.php`, `${S}games/tankity/protocol/sim-vectors.json`]), 'NONE');
check('music-build-script-runs-nothing', select([`${S}games/tankity/audio/music/build_music.sh`, `${S}games/tankity/audio/sfx/build_sfx.sh`]), 'NONE');
check('deploy-only-runs-nothing', select([`${S}deploy.sh`, '.github/workflows/deploy.yml']), 'NONE');
check('outside-the-site-runs-nothing', select(['scripts/deploy-hash']), 'NONE');
check('harness-runs-everything', select([`${S}tests/e2e/helpers.ts`]), 'ALL');
check('stack-runs-everything', select(['compose.yaml']), 'ALL');
check('ci-runs-everything', select(['.github/workflows/ci.yml']), 'ALL');
check('unknown-site-file-runs-everything', select([`${S}something-new.txt`]), 'ALL');
check('a-spec-runs-itself', select([`${S}tests/e2e/home-eye.spec.ts`]), ['home-eye.spec.ts']);
has('tankity-runs-its-specs', select([`${S}games/tankity/src/main.ts`]), ['tankity-solo.spec.ts', 'tankity-rooms.spec.ts', 'games-pwa.spec.ts']);
check('tankity-skips-the-home-page', (select([`${S}games/tankity/rooms.php`])).includes('home-eye.spec.ts'), false);
has('cylon-runs-home-and-cylon', select([`${S}games/cylon/css/units.css`]), ['home-eye.spec.ts', 'cylon-help.spec.ts']);
has('site-shell-runs-the-shell', select([`${S}main.js`]), ['games-hub.spec.ts', 'games-pwa.spec.ts', 'home-eye.spec.ts']);
check('site-shell-skips-tankity', list(select([`${S}site.css`])).some(s => s.startsWith('tankity-')), false);
has('union-of-files', select([`${S}games/crete/src/main.ts`, `${S}tests/e2e/tankity-audio.spec.ts`]), ['games-hub.spec.ts', 'tankity-audio.spec.ts']);
has('play-page-runs-install-spec', select([`${S}play/play.css`, `${S}tools/site-game-pages.php`]), ['games-install.spec.ts']);
has('a-page-game-runs-install-spec', select([`${S}games/crete/index.html`, `${S}games/tankity/index.html`]), ['games-install.spec.ts']);
check('kit-icon-renderer-runs-no-spec', select([`${S}games/_kit/build/icons.mjs`, `${S}games/_kit/build/icons.test.ts`]), 'NONE');
check('a-game-icon-drawing-runs-no-spec', select([`${S}games/crete/tools/icon.svg`]), 'NONE');
check('generated-sources-run-nothing', select([`${S}games/tankity/game.yaml`, `${S}games/tankity/fx/blender/moon.blend`]), 'NONE');
check('effects-editor-runs-the-effects-spec', select([`${S}games/tankity/fx-editor.html`]), ['tankity-fx-editor.spec.ts']);
check('effects-editor-source-runs-the-effects-spec', select([`${S}games/tankity/src/fx/editor.ts`, `${S}games/tankity/dist/fx-editor.js`]), ['tankity-fx-editor.spec.ts']);
has('tankity-sources-run-its-specs', select([`${S}games/tankity/src/sim.ts`]), ['tankity-solo.spec.ts', 'tankity-rooms.spec.ts', 'games-pwa.spec.ts']);
has('tankity-bundles-run-its-specs', select([`${S}games/tankity/dist/main.js`]), ['tankity-solo.spec.ts', 'tankity-rooms.spec.ts', 'games-pwa.spec.ts']);
has('tankity-tsconfig-runs-its-specs', select([`${S}games/tankity/tsconfig.json`]), ['tankity-solo.spec.ts', 'games-pwa.spec.ts']);
has('tankity-build-config-runs-its-specs', select([`${S}games/tankity/build.json`]), ['tankity-solo.spec.ts', 'games-pwa.spec.ts']);
check('tankity-lockfile-alone-runs-no-browser', select([`${S}games/tankity/package-lock.json`]), 'NONE');
check('tankity-lockfile-with-a-module-still-runs-its-specs', select([`${S}games/tankity/package-lock.json`, `${S}games/tankity/dist/main.js`]).includes('tankity-solo.spec.ts'), true);
check('tankity-build-tool-runs-nothing', select([`${S}games/tankity/tools/install-files.php`, `${S}games/tankity/test/dom-stub.mjs`, `${S}games/tankity/test/ui.test.ts`, `${S}games/tankity/.gitignore`]), 'NONE');
check('cylon-lockfile-alone-runs-no-browser', select([`${S}games/cylon/package-lock.json`]), 'NONE');
check('cylon-build-tool-runs-nothing', select([`${S}games/cylon/tools/install-files.php`, `${S}games/cylon/.gitignore`, `${S}games/cylon/test/rules.test.ts`]), 'NONE');
has('cylon-sources-run-the-shell-specs', select([`${S}games/cylon/src/rules.ts`]), ['home-eye.spec.ts', 'cylon-help.spec.ts', 'cylon-play.spec.ts', 'games-hub.spec.ts']);
has('cylon-bundle-runs-the-shell-specs', select([`${S}games/cylon/dist/main.js`]), ['home-eye.spec.ts', 'cylon-help.spec.ts']);
has('cylon-build-config-runs-the-shell-specs', select([`${S}games/cylon/tsconfig.json`, `${S}games/cylon/build.json`]), ['home-eye.spec.ts', 'cylon-help.spec.ts']);
check('cylon-skips-tankity', list(select([`${S}games/cylon/src/rules.ts`])).some(s => s.startsWith('tankity-')), false);
has('home-page-tool-runs-the-shell', select([`${S}tools/site-versions.php`]), ['home-eye.spec.ts', 'cylon-help.spec.ts']);
has('crete-sources-run-its-specs', select([`${S}games/crete/src/engine.ts`]), ['games-hub.spec.ts', 'games-pwa.spec.ts', 'crete-play.spec.ts', 'crete-layout.spec.ts']);
has('crete-bundle-runs-its-specs', select([`${S}games/crete/dist/main.js`, `${S}games/crete/tsconfig.json`, `${S}games/crete/build.json`]), ['games-hub.spec.ts', 'games-pwa.spec.ts', 'crete-play.spec.ts', 'crete-layout.spec.ts']);
check('crete-lockfile-alone-runs-no-browser', select([`${S}games/crete/package-lock.json`]), 'NONE');
check('crete-build-tool-and-tests-run-nothing', select([`${S}games/crete/tools/install-files.php`, `${S}games/crete/.gitignore`, `${S}games/crete/test/engine.test.ts`, `${S}games/crete/test/smoke.test.ts`]), 'NONE');
check('crete-skips-tankity', list(select([`${S}games/crete/src/ui.ts`])).some(s => s.startsWith('tankity-')), false);
check('kit-guard-alone-runs-nothing', select([`${S}games/_kit/php/score-guard.php`]), 'NONE');
check('kit-install-core-runs-everything', select([`${S}games/_kit/php/install-core.php`]), 'ALL');
has('a-games-copy-runs-its-specs', select([`${S}games/cylon/server/score-guard.php`]), ['cylon-play.spec.ts']);
has('site-sources-run-the-shell', select([`${S}src/main.ts`, `${S}src/play/play.ts`]), ['games-hub.spec.ts', 'home-eye.spec.ts']);
has('site-tsconfig-runs-the-shell', select([`${S}tsconfig.json`, `${S}package.json`]), ['games-hub.spec.ts', 'home-eye.spec.ts']);
check('site-lockfile-alone-runs-no-browser', select([`${S}package-lock.json`]), 'NONE');
has('play-script-runs-the-shell', select([`${S}play/play.js`]), ['games-hub.spec.ts']);
has('play-pages-run-the-fullscreen-esc-spec', select([`${S}play/tankity/index.html`, `${S}src/play/play.ts`]), ['tankity-fullscreen-esc.spec.ts']);
check('kit-change-runs-everything', select([`${S}games/_kit/prefs.ts`]), 'ALL');
check('kit-lockfile-runs-everything', select([`${S}games/package-lock.json`]), 'ALL');
check('kit-tests-run-no-browser-specs', select([`${S}games/_kit/test/prefs.test.ts`, `${S}games/_kit/README.md`, `${S}games/_kit/php/tests/InstallCoreTest.php`]), 'NONE');
check('game-unit-tests-run-no-browser-specs', select([`${S}games/crete/test/engine.test.ts`]), 'NONE');
has('build-config-runs-the-games-specs', select([`${S}games/crete/build.json`]), ['games-hub.spec.ts', 'games-pwa.spec.ts']);
has('built-output-runs-the-games-specs', select([`${S}games/crete/dist/main.js`]), ['games-hub.spec.ts', 'games-pwa.spec.ts']);
check('game-test-program-runs-no-browser-specs', select([`${S}games/crete/tsconfig.test.json`, `${S}games/tankity/tsconfig.test.json`]), 'NONE');
check('kit-test-program-and-runner-run-no-browser-specs', select([`${S}games/_kit/tsconfig.test.json`, `${S}games/_kit/test.sh`]), 'NONE');
check('games-unit-runner-runs-no-browser-specs', select([`${S}games/units.sh`]), 'NONE');
check('kit-build-and-icon-tests-run-no-browser-specs', select([`${S}games/_kit/build/build.test.ts`, `${S}games/_kit/build/build.test.mjs`, `${S}games/_kit/build/icons.test.ts`]), 'NONE');
check('kit-build-tool-still-runs-everything', select([`${S}games/_kit/build/build.mjs`]), 'ALL');
check('music-key-tool-runs-nothing', select([`${S}music/tools/siue-music`, `${S}music/tools/siue_music/answering.py`, `${S}music/tools/tests/test_x.py`, `${S}music/tools/requirements.txt`]), 'NONE');
check('music-pages-still-run-everything', select([`${S}music/index.php`]), 'ALL');
check('markdown-anywhere-runs-nothing', select(['README.md', 'docs/superpowers/specs/x.md', `${S}music/README.md`, `${S}music/tools/README.md`, `${S}games/crete/docs/plan.md`]), 'NONE');
check('markdown-with-a-source-file-runs-the-source-specs', select([`${S}music/README.md`, `${S}music/tools/siue-music`, `${S}site.css`]).includes('home-eye.spec.ts'), true);

const MK = `.PHONY: help up

##@ Help
help: ## Show this list
\t@awk '/^##@ /{print}' $(MAKEFILE_LIST)
\t@echo ""

##@ Local docker
up: ## Build and start every site
\tdocker compose up -d --build

down:
\tdocker compose down
`;
const edit = (a: string, b: string) => MK.replace(a, b);
check('help-text-reworded', helpOnlyChange(MK, edit('Build and start every site', 'Start everything')), true);
check('help-heading-renamed', helpOnlyChange(MK, edit('##@ Local docker', '##@ Docker')), true);
check('help-description-added', helpOnlyChange(MK, edit('down:\n', 'down: ## Stop it\n')), true);
check('help-recipe-rewritten', helpOnlyChange(MK, edit("\t@awk '/^##@ /{print}' $(MAKEFILE_LIST)\n\t@echo \"\"", "\t@awk '/^##@ /{n++}' $(MAKEFILE_LIST)")), true);
check('help-heading-added', helpOnlyChange(MK, edit('down:', '##@ Stop\ndown:')), true);
check('recipe-change-is-not-help', helpOnlyChange(MK, edit('docker compose up -d --build', 'docker compose up -d')), false);
check('prerequisite-change-is-not-help', helpOnlyChange(MK, edit('up: ## Build', 'up: down ## Build')), false);
check('new-target-is-not-help', helpOnlyChange(MK, MK + 'extra: ## New\n\techo hi\n'), false);
check('phony-change-is-not-help', helpOnlyChange(MK, edit('.PHONY: help up', '.PHONY: help up down')), false);
check('variable-change-is-not-help', helpOnlyChange(MK, MK + 'X := 1\n'), false);
check('edit-after-help-recipe-is-not-help', helpOnlyChange(MK, edit('\t@echo ""\n', '\t@echo ""\nX = 1\n')), false);
const helpOnly = (p: string) => p === 'Makefile';
check('help-only-makefile-runs-nothing', select(['Makefile'], { helpOnly }), 'NONE');
check('help-only-site-makefile-runs-nothing', select([`${S}Makefile`], { helpOnly: () => true }), 'NONE');
check('other-makefile-change-runs-everything', select(['Makefile'], { helpOnly: () => false }), 'ALL');
check('makefile-without-a-diff-check-runs-everything', select(['Makefile']), 'ALL');
check('help-only-makefile-with-a-source-still-runs-its-specs', select(['Makefile', `${S}site.css`], { helpOnly }).includes('home-eye.spec.ts'), true);
check('one-help-only-and-one-real-makefile-runs-everything', select(['Makefile', `${S}Makefile`], { helpOnly }), 'ALL');
check('a-removed-spec-is-dropped', select([`${S}tests/e2e/gone-away.spec.ts`]), 'NONE');

console.log(fail ? `E2E-SELECT-TEST-FAIL ${fail}` : 'E2E-SELECT-TEST-OK');
process.exit(fail ? 1 : 0);
