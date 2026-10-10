// Tests for select.mjs. Run: node select-test.mjs (exit 0 when all pass).
import { select } from './select.mjs';

const S = 'websites/www.cs/';
let fail = 0;
const check = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${ok ? '' : ` :: got ${JSON.stringify(got)} want ${JSON.stringify(want)}`}`);
  if (!ok) fail++;
};
const has = (name, got, specs) => check(name, Array.isArray(got) && specs.every(s => got.includes(s)), true);

check('docs-only-runs-nothing', select(['README.md', `${S}games/tankity/README.md`, 'docs/plan.md']), 'NONE');
check('unit-tests-run-nothing', select([`${S}games/tankity/rooms-sim-test.php`, `${S}games/tankity/smoke-test.js`, `${S}tests/games-hub-test.php`]), 'NONE');
check('sim-vectors-run-nothing', select([`${S}games/tankity/sim-vectors-test.js`, `${S}games/tankity/protocol/sim-vectors.php`, `${S}games/tankity/protocol/sim-vectors.json`]), 'NONE');
check('deploy-only-runs-nothing', select([`${S}deploy.sh`, '.github/workflows/deploy.yml']), 'NONE');
check('outside-the-site-runs-nothing', select(['scripts/deploy-hash']), 'NONE');
check('harness-runs-everything', select([`${S}tests/e2e/helpers.mjs`]), 'ALL');
check('stack-runs-everything', select(['compose.yaml']), 'ALL');
check('ci-runs-everything', select(['.github/workflows/ci.yml']), 'ALL');
check('unknown-site-file-runs-everything', select([`${S}something-new.txt`]), 'ALL');
check('a-spec-runs-itself', select([`${S}tests/e2e/home-eye.spec.mjs`]), ['home-eye.spec.mjs']);
has('tankity-runs-its-specs', select([`${S}games/tankity/game.js`]), ['tankity-solo.spec.mjs', 'tankity-rooms.spec.mjs', 'games-pwa.spec.mjs']);
check('tankity-skips-the-home-page', (select([`${S}games/tankity/rooms.php`])).includes('home-eye.spec.mjs'), false);
has('cylon-runs-home-and-cylon', select([`${S}games/cylon/cylon.css`]), ['home-eye.spec.mjs', 'cylon-help.spec.mjs']);
has('site-shell-runs-the-shell', select([`${S}main.js`]), ['games-hub.spec.mjs', 'games-pwa.spec.mjs', 'home-eye.spec.mjs']);
check('site-shell-skips-tankity', select([`${S}site.css`]).some(s => s.startsWith('tankity-')), false);
has('union-of-files', select([`${S}games/crete/game.js`, `${S}tests/e2e/tankity-audio.spec.mjs`]), ['games-hub.spec.mjs', 'tankity-audio.spec.mjs']);
check('generated-sources-run-nothing', select([`${S}games/tankity/game.yaml`, `${S}games/tankity/fx/blender/moon.blend`]), 'NONE');
check('effects-editor-runs-the-effects-spec', select([`${S}games/tankity/fx-editor.js`]), ['tankity-fx.spec.mjs']);
has('tankity-sources-run-its-specs', select([`${S}games/tankity/src/sim.ts`]), ['tankity-solo.spec.mjs', 'tankity-rooms.spec.mjs', 'games-pwa.spec.mjs']);
has('tankity-compiled-modules-run-its-specs', select([`${S}games/tankity/js/sim.js`]), ['tankity-solo.spec.mjs', 'tankity-rooms.spec.mjs', 'games-pwa.spec.mjs']);
has('tankity-tsconfig-runs-its-specs', select([`${S}games/tankity/tsconfig.json`]), ['tankity-solo.spec.mjs', 'games-pwa.spec.mjs']);
has('tankity-package-json-runs-its-specs', select([`${S}games/tankity/package.json`]), ['tankity-solo.spec.mjs', 'games-pwa.spec.mjs']);
check('tankity-lockfile-alone-runs-no-browser', select([`${S}games/tankity/package-lock.json`]), 'NONE');
check('tankity-lockfile-with-a-module-still-runs-its-specs', select([`${S}games/tankity/package-lock.json`, `${S}games/tankity/js/sim.js`]).includes('tankity-solo.spec.mjs'), true);
check('tankity-build-tool-runs-nothing', select([`${S}games/tankity/tools/ts-build.mjs`, `${S}games/tankity/.gitignore`]), 'NONE');
check('a-removed-spec-is-dropped', select([`${S}tests/e2e/gone-away.spec.mjs`]), 'NONE');

console.log(fail ? `E2E-SELECT-TEST-FAIL ${fail}` : 'E2E-SELECT-TEST-OK');
process.exit(fail ? 1 : 0);
