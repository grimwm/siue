# Games Kit, Plan A: Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Pin today's Crete and Cylon behaviour with browser specs, add PHPUnit and a nightly full run, create the shared `games/_kit/` core, and move all three games onto it: bundled by esbuild into `dist/`, type-checked by TypeScript 7, and unit-tested with `node:test` and PHPUnit.

**Architecture:** `games/_kit/` is source only. Games import kit modules by relative path, and `games/_kit/build/build.mjs` type-checks each game with `tsc --noEmit` and bundles its entries with esbuild into a checked-in `dist/`. Per-game PHP install tooling shrinks to a config array passed to `games/_kit/php/install-core.php`. Existing PASS/FAIL test scripts move onto `node:test` and PHPUnit through two small adapters, so every check keeps running and reports on its own.

**Tech Stack:** TypeScript 7.0.2, esbuild 0.28.2, Preact 11.0.1, Node 24 (`node --test`, native type stripping), PHP 8.4, PHPUnit ^12 via Composer (dev only), Playwright (existing `tests/e2e`), GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-10-12-games-kit-design.md` (sections 1, 2, 3, 9 and PR rows 1–5 of section 10). Plans B–E cover rows 6–17 and are written when this plan lands.

## Global Constraints

- The host is the sftp-only PHP 8.4 server; nothing is built there. What ships is static files plus the existing runtime PHP. `dist/` is checked in.
- A built game folder needs nothing outside itself at run time; a game's source needs `games/_kit/` beside it.
- Pinned versions: `typescript` `7.0.2`, `esbuild` `0.28.2`, `preact` `11.0.1` (all exact, in `games/package.json`); `phpunit/phpunit` `^12` in `websites/www.cs/composer.json`.
- Never bind a port someone may be using (3000, 5173, 8000, 8080). The docker site already publishes an ephemeral port (`127.0.0.1::80`); specs get it from `make url`.
- Never run browser specs without the e2e lock: always through `make e2e` / `tests/e2e/run.sh`.
- Agents run `make test` plus at most two browser specs locally; CI runs the selected specs in four shards.
- `make test` budgets once this plan lands: static checks ≤ 15 s, unit suites ≤ 45 s (excluding `npm ci`/`composer install`).
- Comments: why, not what; no history; file headers one to five lines. Architecture lives in each game's `README.md` and `games/_kit/README.md`.
- Docs describe the current state only ("docs are current state, not history").
- One PR per spec row (rows 1–5 here). Every PR goes through CI, merge, deploy, and a light live check (one spec per touched area), and the report ends with a cache-busted `/play/tankity/?v=<sha>` link.
- Work happens in a worktree per branch; the main checkout stays on `main`.
- Commit messages end with:
  ```
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb
  ```

## Review Focus

1. **A browser holding yesterday's HTML.** After a deploy prunes `js/` and `cylon.js`, a page cached by the browser still asks for them and the game fails to load. Expected: HTML revalidates on every visit. Pinned by the `.htaccess` `no-cache` rule and its test in Task 10.
2. **Bundles built on macOS checked on Linux CI.** `build.mjs --check` must agree byte for byte on both. Expected: no absolute paths or host-specific bytes in `dist/`. Pinned by `build.test.mjs` "no absolute paths" in Task 5.
3. **Storage that throws or is missing** (Safari private mode, blocked site data). Expected: prefs fall back to defaults and never throw. Pinned by `prefs.test.mjs` in Task 7.
4. **Players' saved settings from before the change** (`tankity-body`, `tankity-text`, `tankity-tutorial`, `tankity-callsign`, `tankity-local`, Cylon's settings JSON). Expected: read unchanged after the move onto `prefs`. Pinned by legacy-value tests in Tasks 10 and 12.
5. **A service worker precaching files that no longer exist.** Expected: `sw.js` lists only files on disk, so install never fails. Pinned by `InstallCoreTest::testPrecacheListsOnlyExistingFiles` in Task 6.

---

## File Structure

```
.github/workflows/ci.yml                         # modify: schedule + dispatch, Node 24, composer, caches
websites/www.cs/
  composer.json, composer.lock, phpunit.xml      # create (Task 4)
  Makefile                                       # modify: composer, phpunit, games npm ci, node --test
  deploy.sh                                      # modify: excludes for _kit, node_modules, test/, build.json, maps kept
  .htaccess                                      # create (Task 10): HTML revalidates
  index.html                                     # modify (Task 10): cylon import path
  tools/site-versions.php                        # modify (Task 10): hashes cylon/dist/main.js
  tests/php/*Test.php                            # create (Task 4) from tests/*-test.php
  tests/e2e/crete-play.spec.mjs                  # create (Task 1)
  tests/e2e/cylon-play.spec.mjs                  # create (Task 2)
  tests/e2e/select.mjs, select-test.mjs, shard.mjs  # modify
  games/
    package.json, package-lock.json              # create (Task 5)
    .gitignore                                   # create: node_modules/, _kit/build/.tmp-*/
    _kit/
      README.md                                  # create (Task 5), grows each task
      build/build.mjs, build/tsconfig.base.json  # create (Task 5)
      build/build.test.mjs, build/fixture/**     # create (Task 5)
      php/install-core.php                       # create (Task 6)
      php/tests/InstallCoreTest.php              # create (Task 6)
      php/testing/LegacyCheckCase.php            # create (Task 4)
      ports.ts, ports.browser.ts                 # create (Task 7)
      prefs.ts                                   # create (Task 7)
      test/check.ts, clock.ts, rng.ts, record.ts # create (Task 7)
      test/*.test.mjs                            # create (Task 7)
    crete/   build.json, tsconfig.json, src/tsconfig.dom.json, src/main.ts, dist/, test/, tools/install-files.php  (Task 9)
    cylon/   same shape (Task 10)
    tankity/ same shape, plus src/fx/*.ts (Tasks 11–12)
```

Removed by the end: every `games/*/js/`, `games/*/tools/ts-build.mjs`, `games/*/package.json`, `games/*/package-lock.json`, `games/*/install-files-test.php`, `games/tankity/vendor/`, `games/tankity/tools/vendor.mjs`, `games/tankity/vendor-test.js`, `games/crete/game.js`, `games/cylon/cylon.js`, `games/tankity/{game.js,fx.js,fx-editor.js}`, and `websites/www.cs/tests/*-test.php`.

---

# PR 1: Characterization specs and the nightly run

Branch `games/characterization-specs`. These specs pin how Crete and Cylon behave today. They must pass on today's code before anything else in this plan changes the games.

### Task 1: `crete-play` spec

**Files:**
- Create: `websites/www.cs/tests/e2e/crete-play.spec.mjs`
- Create (throwaway, not committed): `games/crete/find-win-seed.mjs`
- Modify: `websites/www.cs/tests/e2e/select.mjs` (crete rule), `select-test.mjs`, `shard.mjs` (`WEIGHTS`)

**Interfaces:**
- Consumes: `window.__mazeTest` from `games/crete/game.js` (`G`, `newRun`, `tryMove`, `useItem`, `bash`, `toggleAuto`, `stopAuto`, `creaturePhase`, `bfsDist`, `key`, `ROWS`, `COLS`); page ids `#end-veil`, `#end-title`, `#again`, `#mute`, `#log`.
- Produces: `crete-play.spec.mjs`, which every later Crete change must keep green.

- [ ] **Step 1: Find a seed the play-through wins today**

The spec needs a seed where `T` (play-through) reaches the exit. Write this throwaway script in `games/crete/` (it reuses the engine through the same harness as `engine-test.js`):

```js
// games/crete/find-win-seed.mjs — throwaway; do not commit.
import * as E from './js/engine.js';
function run(seed) {
  let now = 0, id = 1; const pending = new Map();
  const timers = {
    setTimeout: (fn, ms) => { pending.set(id, { at: now + ms, every: 0, fn }); return id++; },
    clearTimeout: i => pending.delete(i),
    setInterval: (fn, ms) => { pending.set(id, { at: now + ms, every: ms, fn }); return id++; },
    clearInterval: i => pending.delete(i),
  };
  const game = E.createGame({ say() {}, sfx() {}, render() {}, showEnd() {}, timers });
  game.newRun(seed);
  game.toggleAuto();
  for (let step = 0; step < 2000 && !game.G.over; step++) {
    const due = [...pending.entries()].sort((a, b) => a[1].at - b[1].at)[0];
    if (!due) break;
    const [k, t] = due; now = t.at; if (t.every) t.at += t.every; else pending.delete(k); t.fn();
  }
  return game.G;
}
for (let i = 1; i <= 200; i++) {
  const seed = `play-${i}`;
  const G = run(seed);
  if (G.won && G.turns < 80) { console.log(seed, 'turns', G.turns); break; }
}
```

Run: `cd websites/www.cs/games/crete && npm ci --silent && node find-win-seed.mjs`
Expected: one line like `play-7 turns 41`. Use that seed as `WIN_SEED` below, then delete the script.

- [ ] **Step 2: Write the spec**

```js
// websites/www.cs/tests/e2e/crete-play.spec.mjs
// How The Island of Crete plays today, driven through its own test hook. Any
// change to Crete must keep this green.
import { test, expect } from '@playwright/test';

const WIN_SEED = 'play-7'; // from Step 1: the play-through wins this maze
const PAGE = 'games/crete/';

async function open(page, seed) {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.clock.install();
  await page.goto(`${PAGE}?seed=${encodeURIComponent(seed)}`);
  await page.waitForFunction(() => !!window.__mazeTest && window.__mazeTest.G.seed !== '');
  return errors;
}

test('the play-through wins a pinned seed and shows the ending', async ({ page }) => {
  const errors = await open(page, WIN_SEED);
  await page.keyboard.press('t');
  await page.clock.runFor(120_000);
  const G = await page.evaluate(() => ({ over: window.__mazeTest.G.over, won: window.__mazeTest.G.won }));
  expect(G).toEqual({ over: true, won: true });
  await expect(page.locator('#end-veil')).toBeVisible();
  await expect(page.locator('#end-title')).not.toHaveText('');
  expect(errors).toEqual([]);
});

test('the creature catching you ends the run as a loss', async ({ page }) => {
  const errors = await open(page, WIN_SEED);
  await page.evaluate(() => {
    const t = window.__mazeTest;
    const { G } = t;
    // Put the creature on an open cell next to the player, outside any safe zone.
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    const spot = dirs.map(([dr, dc]) => ({ r: G.player.r + dr, c: G.player.c + dc }))
      .find(p => !G.walls[p.r][p.c] && !G.safe.has(t.key(p.r, p.c)));
    G.foe.r = spot.r; G.foe.c = spot.c;
    t.creaturePhase(0);
  });
  const G = await page.evaluate(() => ({ over: window.__mazeTest.G.over, won: window.__mazeTest.G.won }));
  expect(G).toEqual({ over: true, won: false });
  await expect(page.locator('#end-veil')).toBeVisible();
  expect(errors).toEqual([]);
});

test('items, bash, mute and a new run answer their keys', async ({ page }) => {
  const errors = await open(page, WIN_SEED);
  const inv = () => page.evaluate(() => ({ ...window.__mazeTest.G.inv, frozen: window.__mazeTest.G.frozen }));
  const before = await inv();
  await page.keyboard.press('z'); // Mirror Shard: freezes the creature, no turn spent
  const afterShard = await inv();
  expect(afterShard.shard).toBe(before.shard - 1);
  expect(afterShard.frozen).toBe(1);

  const turns0 = await page.evaluate(() => window.__mazeTest.G.turns);
  await page.keyboard.press('Space'); // nothing adjacent: a message, no turn
  expect(await page.evaluate(() => window.__mazeTest.G.turns)).toBe(turns0);

  const muteText = await page.locator('#mute').textContent();
  await page.keyboard.press('m');
  await expect(page.locator('#mute')).not.toHaveText(muteText ?? '');

  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('n');
  await expect.poll(() => page.evaluate(() => window.__mazeTest.G.turns)).toBe(0);
  expect(errors).toEqual([]);
});
```

- [ ] **Step 3: Register the spec**

In `tests/e2e/select.mjs`, change the Crete rule:

```js
[`^${SITE}games/crete/`, ['games-hub.spec.mjs', 'games-pwa.spec.mjs', 'crete-play.spec.mjs']],
```

In `tests/e2e/shard.mjs`, add to `WEIGHTS`: `'crete-play.spec.mjs': 15,`

In `tests/e2e/select-test.mjs`, extend the existing crete case (named `'crete-sources-run-its-specs'`) so it also expects `crete-play.spec.mjs`.

- [ ] **Step 4: Run it on today's code**

Run: `cd websites/www.cs && node tests/e2e/select-test.mjs && node tests/e2e/select.mjs --check && make e2e E2E_ARGS=crete-play.spec.mjs`
Expected: `E2E-SELECT-TEST-OK`, no `--check` complaint, and `3 passed`. If a selector or key differs from what the spec assumes, read `games/crete/src/ui.ts` (`bindControls`, `setMuteLabel`, `showEnd`) and fix the **spec**, never the game: this PR pins existing behaviour.

- [ ] **Step 5: Commit**

```bash
git add websites/www.cs/tests/e2e/crete-play.spec.mjs websites/www.cs/tests/e2e/select.mjs websites/www.cs/tests/e2e/select-test.mjs websites/www.cs/tests/e2e/shard.mjs
git commit -m "e2e: crete-play pins how Crete plays today (win, loss, items, keys)"
```

### Task 2: `cylon-play` spec

**Files:**
- Create: `websites/www.cs/tests/e2e/cylon-play.spec.mjs`
- Modify: `select.mjs` (the `shell` list), `select-test.mjs`, `shard.mjs`

**Interfaces:**
- Consumes: home page `./?game=cylon`; `body.cylon-game-live`, `body.cylon-intro-hero`; `.cylon-bot.is-marching` (KO on `pointerdown`); `#cylon-score-value`; `#cylon-grenade-btn`, `#cylon-grenade-cd`; `#cylon-game-toggle` (turning the game off after a KO calls `endGame('quit')`); `#cylon-gameover`, `#cylon-score-submit`, `#cylon-gameover-board`; `games/cylon/scores.php` on the docker site.
- Produces: `cylon-play.spec.mjs`.

- [ ] **Step 1: Write the spec**

```js
// websites/www.cs/tests/e2e/cylon-play.spec.mjs
// How the Cylon game plays today on the home page: a KO scores, the grenade
// cools down, stopping a scored run opens the game over panel, and filing
// initials puts the run on the board. Any change to Cylon must keep this green.
import { test, expect } from '@playwright/test';

test('a scored run reaches the board', async ({ page }) => {
  test.setTimeout(60_000);
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('./?game=cylon');
  await expect(page.locator('body')).toHaveClass(/cylon-game-live/, { timeout: 30_000 });
  await expect(page.locator('body')).not.toHaveClass(/cylon-intro-hero/, { timeout: 30_000 });

  const score = async () => Number((await page.locator('#cylon-score-value').textContent()) || '0');
  const start = await score();
  const bot = page.locator('.cylon-bot.is-marching').first();
  await expect(bot).toBeVisible({ timeout: 20_000 });
  await bot.dispatchEvent('pointerdown', { pointerType: 'mouse', button: 0, isPrimary: true });
  await expect.poll(score, { timeout: 5_000 }).toBeGreaterThan(start);

  await page.locator('#cylon-grenade-btn').click();
  await expect(page.locator('#cylon-grenade-cd')).not.toHaveText('', { timeout: 3_000 });

  await page.locator('#cylon-game-toggle').click();
  await expect(page.locator('#cylon-gameover')).toBeVisible({ timeout: 5_000 });
  await page.locator('#cylon-score-submit').click();
  await expect(page.locator('#cylon-gameover-board')).toContainText(String(await score()), { timeout: 5_000 });
  expect(errors).toEqual([]);
});
```

- [ ] **Step 2: Register it**

In `select.mjs`, add `'cylon-play.spec.mjs'` to the `shell` array. In `shard.mjs` `WEIGHTS`, add `'cylon-play.spec.mjs': 25,`. In `select-test.mjs`, extend the case that checks Cylon sources select the shell specs so it also expects `cylon-play.spec.mjs`.

- [ ] **Step 3: Run it on today's code**

Run: `cd websites/www.cs && node tests/e2e/select-test.mjs && node tests/e2e/select.mjs --check && make e2e E2E_ARGS=cylon-play.spec.mjs`
Expected: `1 passed`, within 30 s. If the KO, cooldown text or initials flow differ, read `games/cylon/src/units.ts` (the `pointerdown` handler near line 698), `games/cylon/src/gameover.ts`, and `cylon.js` (`setGameEnabled`, `endGame`), and fix the **spec** to match how the game behaves today. The initials default (three letters already shown) is what gets filed; if the panel requires picking letters first, press `Enter` on the initials (read `gameover.ts`) before clicking submit.

- [ ] **Step 4: Commit**

```bash
git add websites/www.cs/tests/e2e/cylon-play.spec.mjs websites/www.cs/tests/e2e/select.mjs websites/www.cs/tests/e2e/select-test.mjs websites/www.cs/tests/e2e/shard.mjs
git commit -m "e2e: cylon-play pins a scored Cylon run reaching the board"
```

### Task 3: Nightly full run

**Files:**
- Modify: `.github/workflows/ci.yml`

**Interfaces:**
- Consumes: the existing `units` and `e2e` jobs; `deploy.yml` deploys only from a `push` run, so a scheduled run never deploys.
- Produces: a daily run of `make test` and every browser spec on `main`.

- [ ] **Step 1: Add the triggers**

In `ci.yml` `on:`, add:

```yaml
  schedule:
    - cron: "17 8 * * *" # daily, about 3 a.m. Central; the full suite on main
  workflow_dispatch:
```

Replace the header comment's first paragraph with: "Unit suites and the selected browser specs on pull requests; the unit suites on main when a covered path changes; and every suite, every browser spec, once a day on main (schedule) or on demand (workflow_dispatch). Only a green run from a push starts deploy.yml."

- [ ] **Step 2: Make the scheduled run cover everything**

In the `units` job's "Check what changed" step, treat `schedule` and `workflow_dispatch` like a push: set `run=1` whenever `BASE` is empty (it already does for push; confirm the `if [ -z "$BASE" ]` branch covers both, since neither event has a pull-request base).

In the `e2e` job, change the job condition to:

```yaml
    if: github.event_name == 'pull_request' || github.event_name == 'schedule' || github.event_name == 'workflow_dispatch'
```

and in its "Pick the specs" step, before computing `changed`, add:

```bash
          if [ "$GITHUB_EVENT_NAME" != pull_request ]; then
            echo "run=1" >>"$GITHUB_OUTPUT" # nightly: every spec
            exit 0
          fi
```

With `specs` unset, `shard.mjs` splits every spec across the four runners.

- [ ] **Step 3: Validate the workflow**

Run: `cd <worktree root> && npx --yes @action-validator/cli .github/workflows/ci.yml`
Expected: no output (valid). Then, after pushing the branch, run `gh workflow run ci.yml --ref games/characterization-specs` and confirm with `gh run list --workflow ci.yml --branch games/characterization-specs --limit 1` that a `workflow_dispatch` run starts all four e2e shards. Wait for it with `gh run watch <id> --exit-status` (branch on its exit status, not its output).

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "CI: run every suite and every browser spec nightly and on demand"
```

---

# PR 2: PHPUnit

Branch `site/phpunit`.

### Task 4: Composer, PHPUnit, the legacy adapter, and the site's PHP tests

**Files:**
- Create: `websites/www.cs/composer.json`, `composer.lock` (generated), `phpunit.xml`
- Create: `websites/www.cs/games/_kit/php/testing/LegacyCheckCase.php`
- Create: `websites/www.cs/tests/php/{GamesHubTest,SiteGamePagesTest,SiteVersionsTest,DeploySetTest}.php`
- Move: `websites/www.cs/tests/{games-hub,site-game-pages,site-versions,deploy-set}-test.php` → `tests/php/checks/*.php` (scripts the adapter runs)
- Modify: `websites/www.cs/Makefile` (`test`), `.github/workflows/ci.yml` (`units`), `websites/www.cs/tests/e2e/select.mjs` (+ test), `websites/www.cs/deploy.sh`, `websites/www.cs/.gitignore`

**Interfaces:**
- Produces: `LegacyCheckCase` (abstract PHPUnit `TestCase`): a subclass names a PASS/FAIL script with `protected static function script(): string`; the class turns each `$check(name, cond, extra)` call into its own PHPUnit test. Later tasks use it for game PHP tests.
- Produces: `vendor/bin/phpunit --testsuite <name>` with suites `site` and `kit`; later tasks add `crete`, `cylon`, `tankity`, `tankity-docker`.

- [ ] **Step 1: Composer and PHPUnit**

```json
// websites/www.cs/composer.json
{
  "name": "siue/www-cs",
  "description": "Development tooling only: PHPUnit. Nothing here is deployed.",
  "type": "project",
  "license": "GPL-3.0-or-later",
  "require-dev": { "phpunit/phpunit": "^12" },
  "config": { "platform": { "php": "8.4.0" }, "sort-packages": true },
  "autoload-dev": { "classmap": ["games/_kit/php/testing/"] }
}
```

Run: `cd websites/www.cs && composer install && vendor/bin/phpunit --version`
Expected: `PHPUnit 12.x`. Add `vendor/` to `websites/www.cs/.gitignore`. Commit `composer.lock`.

- [ ] **Step 2: The legacy adapter**

```php
<?php
// websites/www.cs/games/_kit/php/testing/LegacyCheckCase.php
// Runs a PASS/FAIL check script under PHPUnit: every $check(name, cond, extra)
// the script makes becomes one test case, named after the check.
declare(strict_types=1);

use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

abstract class LegacyCheckCase extends TestCase
{
    /** Absolute path of the check script. */
    abstract protected static function script(): string;

    /** @return iterable<string, array{bool, string}> */
    public static function checks(): iterable
    {
        $results = [];
        $check = function (string $name, bool $cond, string $extra = '') use (&$results): void {
            $key = $name;
            for ($n = 2; isset($results[$key]); $n++) {
                $key = "$name #$n";
            }
            $results[$key] = [$cond, $extra];
        };
        $fail = 0;
        (static function (string $__script) use ($check, &$fail): void {
            require $__script;
        })(static::script());
        if ($results === []) {
            $results['script ran no checks'] = [false, static::script()];
        }
        return $results;
    }

    #[DataProvider('checks')]
    public function testCheck(bool $ok, string $detail): void
    {
        $this->assertTrue($ok, $detail);
    }
}
```

A converted script keeps its body. Remove its own `$fail`/`$check` definitions (the adapter provides both) and its final summary `echo` and `exit(...)`. A script whose checks need `$fail` to be a counter still works: it is passed in by reference.

- [ ] **Step 3: Write the failing adapter test**

```php
<?php
// websites/www.cs/games/_kit/php/tests/LegacyCheckCaseTest.php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

final class LegacyCheckCaseTest extends TestCase
{
    public function testEachCheckBecomesACase(): void
    {
        $script = tempnam(sys_get_temp_dir(), 'lcc') . '.php';
        file_put_contents($script, "<?php\n\$check('one', true);\n\$check('two', false, 'why');\n\$check('one', true);\n");
        $case = new class ('x') extends LegacyCheckCase {
            public static string $path = '';
            protected static function script(): string { return self::$path; }
        };
        $case::$path = $script;
        $got = iterator_to_array($case::checks());
        unlink($script);
        $this->assertSame(['one' => [true, ''], 'two' => [false, 'why'], 'one #2' => [true, '']], $got);
    }

    public function testAScriptWithNoChecksFails(): void
    {
        $script = tempnam(sys_get_temp_dir(), 'lcc') . '.php';
        file_put_contents($script, "<?php\n");
        $case = new class ('x') extends LegacyCheckCase {
            public static string $path = '';
            protected static function script(): string { return self::$path; }
        };
        $case::$path = $script;
        $got = iterator_to_array($case::checks());
        unlink($script);
        $this->assertSame([false, $script], $got['script ran no checks']);
    }
}
```

```xml
<!-- websites/www.cs/phpunit.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<phpunit xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:noNamespaceSchemaLocation="vendor/phpunit/phpunit/phpunit.xsd"
         bootstrap="vendor/autoload.php" colors="true" failOnWarning="true"
         failOnRisky="true" executionOrder="defects">
  <testsuites>
    <testsuite name="site"><directory>tests/php</directory></testsuite>
    <testsuite name="kit"><directory>games/_kit/php/tests</directory></testsuite>
  </testsuites>
</phpunit>
```

Run: `vendor/bin/phpunit --testsuite kit`
Expected before Step 2's file exists: FAIL with `Class "LegacyCheckCase" not found`. After Step 2 and `composer dump-autoload`: `OK (2 tests, 2 assertions)`.

- [ ] **Step 4: Move the site's four PHP tests onto PHPUnit**

For each of `games-hub`, `site-game-pages`, `site-versions`, `deploy-set`:

1. `git mv tests/<name>-test.php tests/php/checks/<name>.php`.
2. In the moved script, fix `require_once` paths for the new depth (`__DIR__ . '/../../../games/hub.php'` and similar), delete the `$fail = 0;` and `$check = function ...;` block, and delete the final `echo ... OK/FAIL` line and `exit(...)`.
3. Add the case:

```php
<?php
// websites/www.cs/tests/php/SiteVersionsTest.php
declare(strict_types=1);

final class SiteVersionsTest extends LegacyCheckCase
{
    protected static function script(): string
    {
        return __DIR__ . '/checks/site-versions.php';
    }
}
```

(Same shape for `GamesHubTest` → `checks/games-hub.php`, `SiteGamePagesTest` → `checks/site-game-pages.php`, `DeploySetTest` → `checks/deploy-set.php`.)

Before moving anything, record each script's PASS count: `for t in tests/*-test.php; do echo "$t $(php $t | grep -c '^PASS')"; done > /tmp/site-php-pass-counts.txt` (run from `websites/www.cs`).

Run: `vendor/bin/phpunit --testsuite site --testdox`
Expected: `OK`. Each test class has as many passing cases as its old script had PASS lines in `/tmp/site-php-pass-counts.txt`.

- [ ] **Step 5: Wire it into `make test`, CI, deploy and selection**

`websites/www.cs/Makefile` `test`: replace the four `php tests/...-test.php` lines with:

```make
	composer install --quiet --no-interaction
	vendor/bin/phpunit --testsuite site
	vendor/bin/phpunit --testsuite kit
```

`.github/workflows/ci.yml` `units` job, after `setup-php`, add Composer caching and tools:

```yaml
        with:
          php-version: "8.4"
          coverage: none
          tools: composer:v2
      - uses: actions/cache@0400d5f644dc74513175e3cd8d07132dd4860809 # v4
        with:
          path: websites/www.cs/vendor
          key: composer-${{ hashFiles('websites/www.cs/composer.lock') }}
```

`deploy.sh` needs no rule: `composer.json`, `composer.lock`, `phpunit.xml` and `vendor/` already fall into the `*` and `*/*` skips. Extend `tests/php/checks/deploy-set.php` with two checks proving it:

```php
$check('composer-files-stay-home', !array_intersect(['composer.json', 'composer.lock', 'phpunit.xml'], $files), '');
$check('vendor-stays-home', !array_filter($files, fn($f) => str_starts_with($f, 'vendor/')), '');
```

(`$files` is the deploy list the script already builds from `LIST=1 ./deploy.sh`; use its existing variable name.)

`select.mjs`: add before the `^${SITE}` catch-all:

```js
[`^${SITE}(composer\\.(json|lock)|phpunit\\.xml)$`, 'NONE'],
[`^${SITE}tests/php/`, 'NONE'],
[`^${SITE}games/_kit/php/testing/`, 'NONE'],
```

and add `select-test.mjs` cases: `phpunit-config-runs-no-browser-specs` (`websites/www.cs/phpunit.xml` → NONE) and `site-php-tests-run-no-browser-specs` (`websites/www.cs/tests/php/SiteVersionsTest.php` → NONE).

Run: `cd websites/www.cs && make test`
Expected: green, with `phpunit` reporting the `site` and `kit` suites.

- [ ] **Step 6: Commit**

```bash
git add websites/www.cs/composer.json websites/www.cs/composer.lock websites/www.cs/phpunit.xml websites/www.cs/.gitignore websites/www.cs/games/_kit/php websites/www.cs/tests websites/www.cs/Makefile websites/www.cs/deploy.sh .github/workflows/ci.yml
git commit -m "Tests: PHPUnit via Composer (dev only); the site's PHP checks run as PHPUnit cases"
```

---

# PR 3: The kit core, and Crete on it

Branch `games/kit-core-crete`.

### Task 5: Toolchain and `build.mjs`

**Files:**
- Create: `websites/www.cs/games/package.json`, `package-lock.json` (generated), `.gitignore`
- Create: `games/_kit/build/build.mjs`, `games/_kit/build/tsconfig.base.json`
- Create: `games/_kit/build/build.test.mjs`, `games/_kit/build/fixture/{build.json,tsconfig.json,src/tsconfig.dom.json,src/main.ts,src/pure.ts,src/view.tsx}`
- Create: `games/_kit/README.md`

**Interfaces:**
- Produces: `node games/_kit/build/build.mjs <gameDir> [--check]`. Exit 0 when built or up to date; 1 on a type error, a bad `build.json`, or (with `--check`) any stale, missing or extra file in `dist/`.
- Produces: `build.json` schema:
  ```ts
  interface BuildJson {
    programs: string[];  // tsconfig paths relative to the game; each is type-checked with tsc --noEmit
    entries: { in: string; out: string; format: 'esm' | 'iife' }[];  // bundled to dist/<out>.js (+ .js.map)
    versions?: Record<string, string>;  // CONSTANT -> file; injected as JSON string of the file's 10-hex sha256
  }
  ```
- Produces: exported `loadBuildJson(gameDir)`, `typecheck(gameDir, cfg)`, `bundle(gameDir, cfg)` (returns `Map<string, string>` of dist-relative path → content), `build(gameDir, { check })` (returns `{ stale: string[], extra: string[] }`).
- Produces: `games/_kit/build/tsconfig.base.json`, which every game's `tsconfig.json` extends.

- [ ] **Step 1: The toolchain**

```json
// websites/www.cs/games/package.json
{
  "name": "siue-games",
  "private": true,
  "type": "module",
  "description": "Build and test tooling for every game: TypeScript type checks and esbuild bundles into each game's checked-in dist/.",
  "scripts": {
    "build": "for g in crete cylon tankity; do node _kit/build/build.mjs $g || exit 1; done",
    "check": "for g in crete cylon tankity; do node _kit/build/build.mjs $g --check || exit 1; done"
  },
  "devDependencies": { "esbuild": "0.28.2", "typescript": "7.0.2" },
  "dependencies": { "preact": "11.0.1" }
}
```

```gitignore
# websites/www.cs/games/.gitignore
node_modules/
_kit/build/.tmp-*/
```

Run: `cd websites/www.cs/games && npm install && npx tsc --version`
Expected: `Version 7.0.2`. (The `build`/`check` scripts list only games already moved; Tasks 10 and 11 extend them as each game moves. Until then, set them to `crete` only.)

```json
// websites/www.cs/games/_kit/build/tsconfig.base.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022"],
    "types": [],
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "erasableSyntaxOnly": true,
    "allowImportingTsExtensions": true,
    "noEmit": true,
    "skipLibCheck": true,
    "jsx": "react-jsx",
    "jsxImportSource": "preact"
  }
}
```

- [ ] **Step 2: The fixture game**

```json
// games/_kit/build/fixture/build.json
{
  "programs": ["tsconfig.json", "src/tsconfig.dom.json"],
  "entries": [{ "in": "src/main.ts", "out": "main", "format": "esm" }],
  "versions": { "NOTE_V": "note.txt" }
}
```

```json
// games/_kit/build/fixture/tsconfig.json
{ "extends": "../tsconfig.base.json", "files": ["src/pure.ts"] }
```

```json
// games/_kit/build/fixture/src/tsconfig.dom.json
{ "extends": "../tsconfig.json", "compilerOptions": { "lib": ["ES2022", "DOM"] }, "files": ["main.ts", "view.tsx"] }
```

```ts
// games/_kit/build/fixture/src/pure.ts
export const add = (a: number, b: number): number => a + b;
```

```tsx
// games/_kit/build/fixture/src/view.tsx
import { render } from 'preact';
export function show(root: HTMLElement, n: number): void { render(<p>{n}</p>, root); }
```

```ts
// games/_kit/build/fixture/src/main.ts
import { add } from './pure.ts';
import { show } from './view.tsx';
declare const NOTE_V: string;
show(document.body, add(1, 2));
export const noteVersion = NOTE_V;
```

Also create `games/_kit/build/fixture/note.txt` containing `note\n`. The fixture has no `dist/`; the tests build it in a scratch copy.

- [ ] **Step 3: Write the failing tests**

```js
// games/_kit/build/build.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const HERE = import.meta.dirname;
const CLI = join(HERE, 'build.mjs');

/** A scratch copy of the fixture inside _kit/build/, so preact resolves from games/node_modules. */
function scratch(t) {
  const dir = mkdtempSync(join(HERE, '.tmp-'));
  cpSync(join(HERE, 'fixture'), dir, { recursive: true });
  // The fixture's tsconfig extends ../tsconfig.base.json; the scratch copy sits at the same depth.
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  return dir;
}
const run = (dir, ...args) => spawnSync(process.execPath, [CLI, dir, ...args], { encoding: 'utf8' });

test('builds every entry with a linked source map', t => {
  const dir = scratch(t);
  const r = run(dir);
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(readdirSync(join(dir, 'dist')).sort(), ['main.js', 'main.js.map']);
  assert.match(readFileSync(join(dir, 'dist/main.js'), 'utf8'), /\/\/# sourceMappingURL=main\.js\.map\n?$/);
});

test('bundles preact in: no bare imports remain', t => {
  const dir = scratch(t);
  run(dir);
  const js = readFileSync(join(dir, 'dist/main.js'), 'utf8');
  assert.doesNotMatch(js, /from\s*["']preact/);
  assert.doesNotMatch(js, /import\s*\(?\s*["'][^.]/);
});

test('injects a version constant as the file content hash', t => {
  const dir = scratch(t);
  run(dir);
  const want = createHash('sha256').update('note\n').digest('hex').slice(0, 10);
  assert.ok(readFileSync(join(dir, 'dist/main.js'), 'utf8').includes(`"${want}"`));
});

test('is byte-for-byte deterministic', t => {
  const dir = scratch(t);
  run(dir);
  const first = readFileSync(join(dir, 'dist/main.js'));
  rmSync(join(dir, 'dist'), { recursive: true });
  run(dir);
  assert.ok(first.equals(readFileSync(join(dir, 'dist/main.js'))));
});

test('writes no absolute paths into the bundle or its map', t => {
  const dir = scratch(t);
  run(dir);
  for (const f of ['main.js', 'main.js.map']) {
    const text = readFileSync(join(dir, 'dist', f), 'utf8');
    assert.ok(!text.includes(dir), `${f} names the build folder`);
    assert.doesNotMatch(text, /\/Users\/|\/home\/|[A-Z]:\\\\|file:\/\//, f);
  }
});

test('--check passes on a fresh build and fails on stale, missing or extra files', t => {
  const dir = scratch(t);
  run(dir);
  assert.equal(run(dir, '--check').status, 0);
  writeFileSync(join(dir, 'dist/main.js'), '/* edited */');
  assert.equal(run(dir, '--check').status, 1);
  run(dir);
  writeFileSync(join(dir, 'dist/stray.js'), '');
  const r = run(dir, '--check');
  assert.equal(r.status, 1);
  assert.match(r.stderr, /dist\/stray\.js/);
  run(dir);
  assert.ok(!existsSync(join(dir, 'dist/stray.js')), 'a build removes extra files');
});

test('a type error fails the build and writes nothing', t => {
  const dir = scratch(t);
  writeFileSync(join(dir, 'src/pure.ts'), 'export const add = (a: number, b: number): string => a + b;\n');
  const r = run(dir);
  assert.equal(r.status, 1);
  assert.match(r.stdout + r.stderr, /TS2322/);
  assert.ok(!existsSync(join(dir, 'dist')));
});

test('the DOM-free program cannot reach the page', t => {
  const dir = scratch(t);
  writeFileSync(join(dir, 'src/pure.ts'), 'export const add = (a: number, b: number): number => a + b + document.title.length;\n');
  assert.equal(run(dir).status, 1);
});

test('a bad build.json is refused with a reason', t => {
  const dir = scratch(t);
  writeFileSync(join(dir, 'build.json'), JSON.stringify({ programs: [], entries: [{ in: 'src/main.ts', out: '../x', format: 'esm' }] }));
  const r = run(dir);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /out/);
});
```

Run: `cd websites/www.cs/games && node --test _kit/build/build.test.mjs`
Expected: FAIL; `build.mjs` does not exist.

- [ ] **Step 4: Write `build.mjs`**

```js
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

const hash10 = text => createHash('sha256').update(text).digest('hex').slice(0, 10);

/** Bundles every entry in memory: dist-relative path -> file text. */
export async function bundle(gameDir, cfg) {
  const define = {};
  for (const [name, file] of Object.entries(cfg.versions ?? {})) {
    define[name] = JSON.stringify(hash10(readFileSync(join(gameDir, file))));
  }
  const outdir = join(gameDir, 'dist');
  const files = new Map();
  for (const format of FORMATS) {
    const entries = cfg.entries.filter(e => e.format === format);
    if (!entries.length) continue;
    const result = await esbuild.build({
      absWorkingDir: gameDir,
      entryPoints: entries.map(e => ({ in: e.in, out: e.out })),
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
    });
    for (const f of result.outputFiles) files.set(relative(outdir, f.path).split(sep).join('/'), f.text);
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
```

The scratch fixture's `tsconfig.json` extends `../tsconfig.base.json`, which resolves because the scratch folder sits in `_kit/build/` like `fixture/`. If a test's type error is reported by esbuild instead of tsc, check that `typecheck` runs before `bundle` (it must; esbuild does not type-check).

- [ ] **Step 5: Run the tests**

Run: `cd websites/www.cs/games && node --test _kit/build/build.test.mjs`
Expected: `# pass 9`, `# fail 0`.

- [ ] **Step 6: Start the kit README**

```markdown
<!-- websites/www.cs/games/_kit/README.md -->
# Games kit

Shared source for every game. Nothing here is deployed: a game imports what
it needs by relative path, and `build/build.mjs` bundles it into that game's
checked-in `dist/`. A built game folder needs nothing outside itself; its
source needs this folder beside it.

## Build (`build/`)

`node _kit/build/build.mjs <game> [--check]`, run from `games/` after
`npm ci`. Each game's `build.json` names:

- `programs`: tsconfig files, each type-checked by `tsc --noEmit`. A game
  keeps a DOM-free program (engines, sims: `lib: ["ES2022"]`) and a DOM
  program, so pure code cannot reach for the page.
- `entries`: `{ in, out, format }`, bundled by esbuild to `dist/<out>.js`
  with a linked source map. `esm` for modules, `iife` for classic scripts.
- `versions`: `{ CONSTANT: file }`; the bundle sees `CONSTANT` as the
  file's 10-hex content hash (a `?v=` for a file the code fetches).

`--check` rebuilds in memory and fails on any stale, missing or extra file
in `dist/`. Every tsconfig extends `build/tsconfig.base.json`: strict,
`noUncheckedIndexedAccess`, `erasableSyntaxOnly` (so Node can run the
sources directly), imports written with their `.ts` extension.
```

- [ ] **Step 7: Commit**

```bash
git add websites/www.cs/games/package.json websites/www.cs/games/package-lock.json websites/www.cs/games/.gitignore websites/www.cs/games/_kit/build websites/www.cs/games/_kit/README.md
git commit -m "Games kit: one build for every game (tsc 7 type checks, esbuild bundles into dist/)"
```

### Task 6: `install-core.php`

**Files:**
- Create: `games/_kit/php/install-core.php`
- Create: `games/_kit/php/tests/InstallCoreTest.php`

**Interfaces:**
- Produces: `install_run(string $dir, array $config, array $argv): int`, the whole CLI, returning an exit code. `$config`:
  ```php
  [
    'kind' => 'play' | 'start',         // a page of its own, or a function on the site page
    'versioned' => ['dist/main.js', 'game.css'],   // play only: page tags whose ?v= is the file hash
    'precache_dirs' => ['dist'],        // play only: folders precached recursively
    'precache_exclude' => ['fx-editor.*'],  // play only: fnmatch patterns on file names
  ]
  ```
- Produces (tested pure functions): `install_parse_yaml`, `install_card($dir, $kind)`, `install_version`, `install_page_versions($dir, $page, $pageName, $files)`, `install_block`, `install_apply`, `install_icon_problems`, `install_manifest($card, $id)`, `install_precache($dir, $override, $image, $dirs, $exclude)`, `install_sw`, `install_sync($dir, $config, $write)`.

- [ ] **Step 1: Write the failing tests**

```php
<?php
// websites/www.cs/games/_kit/php/tests/InstallCoreTest.php
declare(strict_types=1);

require_once __DIR__ . '/../install-core.php';

use PHPUnit\Framework\TestCase;

final class InstallCoreTest extends TestCase
{
    private string $dir;

    private const PLAY = ['kind' => 'play', 'versioned' => ['dist/main.js', 'game.css'], 'precache_dirs' => ['dist'], 'precache_exclude' => []];

    protected function setUp(): void
    {
        $this->dir = sys_get_temp_dir() . '/install-core-' . bin2hex(random_bytes(4)) . '/arty';
        mkdir($this->dir . '/dist', 0777, true);
        file_put_contents("$this->dir/metadata.yaml", "title: Arty & Co\ndescription: >\n  Lob\n  shells.\nshort_name: Arty\ntheme_color: \"#112233\"\nbackground_color: \"#445566\"\nplay: index.html\nimage: og.png # share picture\n");
        file_put_contents("$this->dir/index.html", "<!doctype html>\n<html>\n<head>\n    <title>Arty</title>\n<link rel=\"stylesheet\" href=\"game.css?v=old\">\n</head>\n<body>\n<script type=\"module\" src=\"dist/main.js?v=old\"></script>\n</body>\n</html>\n");
        file_put_contents("$this->dir/game.css", 'body{}');
        file_put_contents("$this->dir/dist/main.js", 'console.log(1)');
        file_put_contents("$this->dir/dist/main.js.map", '{}');
        file_put_contents("$this->dir/og.png", 'png');
        file_put_contents("$this->dir/engine-test.js", '');
        foreach ([192, 512] as $n) {
            file_put_contents("$this->dir/icon-$n.png", self::png($n));
        }
    }

    protected function tearDown(): void
    {
        exec('rm -rf ' . escapeshellarg(dirname($this->dir)));
    }

    private static function png(int $n): string
    {
        $chunk = fn(string $t, string $d): string => pack('N', strlen($d)) . $t . $d . pack('N', crc32($t . $d));
        return "\x89PNG\r\n\x1a\n" . $chunk('IHDR', pack('NNCCCCC', $n, $n, 8, 2, 0, 0, 0))
            . $chunk('IDAT', (string) gzcompress(str_repeat("\0" . str_repeat("\0", $n * 3), $n))) . $chunk('IEND', '');
    }

    public function testParsesTheYamlSubset(): void
    {
        [$data, $err] = install_parse_yaml("a: 1\n# c\nb: \"x # y\"\nc: >\n  one\n  two\nd: z # note\n");
        $this->assertNull($err);
        $this->assertSame(['a' => '1', 'b' => 'x # y', 'c' => 'one two', 'd' => 'z'], $data);
        $this->assertSame('line 1: expected `key: value` starting at column 1', install_parse_yaml("  a: 1\n")[1]);
    }

    public function testCardNeedsTheKeyForItsKind(): void
    {
        [$card, $err] = install_card($this->dir, 'start');
        $this->assertNull($card);
        $this->assertSame('metadata.yaml: `start` is required', $err);
        [$card] = install_card($this->dir, 'play');
        $this->assertSame('Arty', $card['short_name']);
        $this->assertSame('#112233', $card['theme_color']);
    }

    public function testPageVersionsAreContentHashes(): void
    {
        $page = (string) file_get_contents("$this->dir/index.html");
        [$out, $problems] = install_page_versions($this->dir, $page, 'index.html', ['dist/main.js', 'game.css']);
        $this->assertSame([], $problems);
        $this->assertStringContainsString('src="dist/main.js?v=' . install_version('console.log(1)') . '"', $out);
        $this->assertStringContainsString('href="game.css?v=' . install_version('body{}') . '"', $out);
    }

    public function testAPageTagMustAppearExactlyOnce(): void
    {
        [, $problems] = install_page_versions($this->dir, '<p>none</p>', 'index.html', ['dist/main.js']);
        $this->assertSame(['index.html must reference dist/main.js?v=... exactly once (found 0)'], $problems);
    }

    public function testBlockIsInsertedThenReplaced(): void
    {
        [$card] = install_card($this->dir, 'play');
        $page = (string) file_get_contents("$this->dir/index.html");
        $once = install_apply($page, install_block($card, '    '));
        $this->assertNotNull($once);
        $this->assertSame($once, install_apply($once, install_block($card, '    ')));
        $this->assertStringContainsString('<meta name="apple-mobile-web-app-title" content="Arty">', $once);
        $this->assertNull(install_apply('<p>no title</p>', 'x'));
    }

    public function testManifestForAPlayGameAndAStartGame(): void
    {
        [$card] = install_card($this->dir, 'play');
        $play = json_decode(install_manifest($card, 'arty'), true);
        $this->assertSame(['./', './'], [$play['start_url'], $play['scope']]);
        $start = json_decode(install_manifest(['start' => 'arty'] + $card, 'arty'), true);
        $this->assertSame(['../../?game=arty', '../../'], [$start['start_url'], $start['scope']]);
    }

    public function testPrecacheListsShippedFilesOnly(): void
    {
        file_put_contents("$this->dir/fx-editor.js", '');
        [$names] = install_precache($this->dir, [], 'og.png', ['dist'], ['fx-editor.*']);
        $this->assertSame(['dist/main.js', 'game.css', 'icon-192.png', 'icon-512.png', 'index.html'], $names);
    }

    public function testPrecacheListsOnlyExistingFiles(): void
    {
        [$names] = install_precache($this->dir, ['manifest.webmanifest' => '{}'], 'og.png', ['dist', 'missing-dir'], []);
        foreach ($names as $n) {
            $this->assertTrue(is_file("$this->dir/$n") || $n === 'manifest.webmanifest', $n);
        }
    }

    public function testPrecacheHashFollowsContent(): void
    {
        [, $a] = install_precache($this->dir, [], 'og.png', ['dist'], []);
        file_put_contents("$this->dir/dist/main.js", 'console.log(2)');
        [, $b] = install_precache($this->dir, [], 'og.png', ['dist'], []);
        $this->assertNotSame($a, $b);
    }

    public function testIconsMustBeSquarePngsOfTheirSize(): void
    {
        $this->assertSame([], install_icon_problems($this->dir));
        file_put_contents("$this->dir/icon-512.png", self::png(511));
        $this->assertSame(['icon-512.png must be a 512x512 PNG'], install_icon_problems($this->dir));
    }

    public function testSyncWritesThenChecksClean(): void
    {
        [$stale] = install_sync($this->dir, self::PLAY, true);
        $this->assertSame(['index.html', 'manifest.webmanifest', 'sw.js'], $stale);
        [$again, $notes] = install_sync($this->dir, self::PLAY, false);
        $this->assertSame([[], []], [$again, $notes]);
        $this->assertStringContainsString('"dist/main.js"', (string) file_get_contents("$this->dir/sw.js"));
        $this->assertStringNotContainsString('main.js.map', (string) file_get_contents("$this->dir/sw.js"));
    }

    public function testAStartGameGetsOnlyAManifest(): void
    {
        file_put_contents("$this->dir/metadata.yaml", "title: Arty\ndescription: Lob.\nstart: artyStart\n");
        [$stale] = install_sync($this->dir, ['kind' => 'start'], true);
        $this->assertSame(['manifest.webmanifest'], $stale);
        $this->assertFileDoesNotExist("$this->dir/sw.js");
    }

    public function testRunReturnsOneOnACheckThatFindsStaleFiles(): void
    {
        ob_start();
        $code = install_run($this->dir, self::PLAY, ['install-files.php', '--check']);
        ob_end_clean();
        $this->assertSame(1, $code);
    }
}
```

Run: `cd websites/www.cs && vendor/bin/phpunit --testsuite kit --filter InstallCoreTest`
Expected: FAIL; `install-core.php` does not exist.

- [ ] **Step 2: Write `install-core.php`**

Start from `games/crete/tools/install-files.php` and change it as follows. The functions not listed (`install_esc`, `install_parse_yaml`, `install_version`, `install_block`, `install_apply`, `install_icon_problems`, and `install_sw` with its heredoc) move over **unchanged**. Header:

```php
<?php
// Keeps a game installable from its metadata.yaml: manifest.webmanifest, and
// for a game with a page of its own, the page's install tags, its ?v= values
// and sw.js. Each game's tools/install-files.php passes its config to
// install_run(). Needs only PHP.
declare(strict_types=1);
```

`install_card` takes the kind and requires its key:

```php
/** @return array{0: ?array<string, string>, 1: ?string} [card, error] */
function install_card(string $dir, string $kind): array
{
    $text = @file_get_contents("$dir/metadata.yaml");
    if (!is_string($text)) {
        return [null, 'metadata.yaml is not readable'];
    }
    [$meta, $err] = install_parse_yaml($text);
    if ($err !== null) {
        return [null, "metadata.yaml: $err"];
    }
    foreach (['title', 'description', $kind] as $key) {
        if (trim($meta[$key] ?? '') === '') {
            return [null, "metadata.yaml: `$key` is required"];
        }
    }
    $card = [
        'title' => trim($meta['title']),
        'description' => trim($meta['description']),
        $kind => trim($meta[$kind]),
        'image' => trim($meta['image'] ?? ''),
    ];
    $short = trim($meta['short_name'] ?? '');
    $card['short_name'] = $short !== '' ? $short : $card['title'];
    foreach (['theme_color', 'background_color'] as $key) {
        $color = trim($meta[$key] ?? INSTALL_DEFAULT_COLOR);
        if (!preg_match('/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/', $color)) {
            return [null, "metadata.yaml: `$key` must be a #rgb or #rrggbb color"];
        }
        $card[$key] = strtolower($color);
    }
    return [$card, null];
}
```

`install_page_versions` replaces the module-rewriting `install_versions` (bundles have no inner `?v=`):

```php
/**
 * Sets each listed file's ?v= in the page to its content hash. Every file
 * must be referenced exactly once as src="…?v=…" or href="…?v=…".
 * @param list<string> $files
 * @return array{0: string, 1: list<string>} [page, problems]
 */
function install_page_versions(string $dir, string $page, string $pageName, array $files): array
{
    $problems = [];
    foreach ($files as $f) {
        $content = @file_get_contents("$dir/$f");
        if (!is_string($content)) {
            $problems[] = "$f is not readable, but $pageName references it";
            continue;
        }
        $count = 0;
        $page = (string) preg_replace_callback(
            '#((?:src|href)=")' . preg_quote($f, '#') . '(\?v=)([^"?\s]*)(")#',
            fn(array $m): string => $m[1] . $f . $m[2] . install_version($content) . $m[4],
            $page,
            -1,
            $count
        );
        if ($count !== 1) {
            $problems[] = "$pageName must reference $f?v=... exactly once (found $count)";
        }
    }
    return [$page, $problems];
}
```

`install_manifest` serves both kinds:

```php
function install_manifest(array $card, string $id): string
{
    $start = isset($card['start']);
    $manifest = [
        'name' => $card['title'],
        'short_name' => $card['short_name'],
        'description' => $card['description'],
        'lang' => 'en',
        'start_url' => $start ? '../../?game=' . rawurlencode($id) : ($card['play'] === 'index.html' ? './' : $card['play']),
        'scope' => $start ? '../../' : './',
        'display' => 'standalone',
        'background_color' => $card['background_color'],
        'theme_color' => $card['theme_color'],
        'categories' => ['games'],
        'icons' => [
            ['src' => 'icon-192.png', 'sizes' => '192x192', 'type' => 'image/png', 'purpose' => 'any'],
            ['src' => 'icon-512.png', 'sizes' => '512x512', 'type' => 'image/png', 'purpose' => 'any'],
        ],
    ];
    return json_encode($manifest, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . "\n";
}
```

Before changing `start_url`/`scope` for a `start` game, diff the result against today's `games/cylon/manifest.webmanifest`. The `start` branch above must reproduce it byte for byte, key order included. If Cylon's manifest orders keys differently, follow Cylon's order in the `start` branch.

`install_precache` walks configured folders recursively and skips maps and tooling:

```php
/**
 * @param array<string, string> $override name -> content about to be written
 * @param list<string> $dirs folders precached recursively
 * @param list<string> $exclude fnmatch patterns on file names
 * @return array{0: list<string>, 1: string} [file names, hash]
 */
function install_precache(string $dir, array $override, string $image, array $dirs, array $exclude): array
{
    $found = array_merge(scandir($dir) ?: [], array_keys($override));
    foreach ($dirs as $sub) {
        if (!is_dir("$dir/$sub")) {
            continue;
        }
        $it = new RecursiveIteratorIterator(new RecursiveDirectoryIterator("$dir/$sub", FilesystemIterator::SKIP_DOTS));
        foreach ($it as $file) {
            $found[] = $sub . '/' . str_replace('\\', '/', substr($file->getPathname(), strlen("$dir/$sub/")));
        }
    }
    $skip = array_merge(['sw.js', '*-test.*', '*.test.*', '*.map', 'package*.json', 'tsconfig*.json', 'build.json'], $exclude);
    $names = [];
    foreach ($found as $f) {
        $base = basename($f);
        if (in_array($f, $names, true) || !(is_file("$dir/$f") || isset($override[$f]))
            || !preg_match('/\.(html|js|css|json|png|webmanifest)$/', $f) || $f === $image) {
            continue;
        }
        foreach ($skip as $pattern) {
            if (fnmatch($pattern, $base)) {
                continue 2;
            }
        }
        $names[] = $f;
    }
    sort($names);
    $ctx = hash_init('sha256');
    foreach ($names as $f) {
        hash_update($ctx, $f . "\0" . ($override[$f] ?? (string) file_get_contents("$dir/$f")) . "\0");
    }
    return [$names, substr(hash_final($ctx), 0, 12)];
}
```

`install_sync` and `install_run`:

```php
/** @return array{0: list<string>, 1: list<string>} [stale file names, notes] */
function install_sync(string $dir, array $config, bool $write): array
{
    $kind = $config['kind'] ?? '';
    if ($kind !== 'play' && $kind !== 'start') {
        return [[], ["config: kind must be play or start"]];
    }
    [$card, $err] = install_card($dir, $kind);
    if ($card === null) {
        return [[], [$err]];
    }
    $notes = install_icon_problems($dir);
    $outputs = [];
    if ($kind === 'play') {
        $pageName = $card['play'];
        [$html, $problems] = install_page_versions($dir, (string) @file_get_contents("$dir/$pageName"), $pageName, $config['versioned'] ?? []);
        if ($problems) {
            return [[], array_merge($notes, $problems)];
        }
        $pad = preg_match('#^([ \t]*)<title>#mi', $html, $m) ? $m[1] : '';
        $page = install_apply($html, install_block($card, $pad));
        if ($page === null) {
            return [[], array_merge($notes, ["no <title> in $pageName to put install tags after"])];
        }
        $outputs[$pageName] = $page;
    }
    if (!$notes) {
        $outputs['manifest.webmanifest'] = install_manifest($card, basename($dir));
        if ($kind === 'play') {
            [$names, $hash] = install_precache($dir, $outputs, basename($card['image']), $config['precache_dirs'] ?? [], $config['precache_exclude'] ?? []);
            $outputs['sw.js'] = install_sw($card, basename($dir), $names, $hash);
        }
    }
    $stale = [];
    foreach ($outputs as $name => $content) {
        if ((string) @file_get_contents("$dir/$name") !== $content) {
            $stale[] = $name;
            if ($write) {
                file_put_contents("$dir/$name", $content);
            }
        }
    }
    return [$stale, $notes];
}

/** The tools/install-files.php command line: write, or --check. Returns the exit code. */
function install_run(string $dir, array $config, array $argv): int
{
    $check = in_array('--check', $argv, true);
    [$stale, $notes] = install_sync($dir, $config, !$check);
    foreach ($notes as $n) {
        fwrite(STDERR, "install-files: $n\n");
    }
    foreach ($stale as $f) {
        if ($check) {
            fwrite(STDERR, "install-files: $f is stale; run php tools/install-files.php in the game folder\n");
        } else {
            echo "install-files: wrote $f\n";
        }
    }
    return $notes || ($check && $stale) ? 1 : 0;
}
```

Keep `INSTALL_BEGIN`, `INSTALL_END`, `INSTALL_DEFAULT_COLOR`, `INSTALL_SW_REGISTER` from Crete. In `install_sw`'s heredoc, change the generated header line to "Generated by tools/install-files.php (games/_kit/php/install-core.php)".

- [ ] **Step 3: Run the tests**

Run: `cd websites/www.cs && vendor/bin/phpunit --testsuite kit`
Expected: `OK`, every `InstallCoreTest` case passing.

- [ ] **Step 4: Commit**

```bash
git add websites/www.cs/games/_kit/php
git commit -m "Games kit: install-core.php, one PWA install tool configured per game"
```

### Task 7: Ports, prefs, and test helpers

**Files:**
- Create: `games/_kit/ports.ts`, `games/_kit/ports.browser.ts`, `games/_kit/prefs.ts`
- Create: `games/_kit/test/check.ts`, `clock.ts`, `rng.ts`, `record.ts`
- Create: `games/_kit/test/{prefs,clock,rng,record,check}.test.mjs`
- Create: `games/_kit/tsconfig.json` (type-checks the kit itself)
- Modify: `games/_kit/README.md`

**Interfaces:**
- Produces, `ports.ts`:
  ```ts
  export interface Timers {
    setTimeout(fn: () => void, ms: number): number;
    clearTimeout(id: number): void;
    setInterval(fn: () => void, ms: number): number;
    clearInterval(id: number): void;
  }
  export interface Clock { now(): number }
  export type Rng = () => number;
  export interface StorageLike { getItem(k: string): string | null; setItem(k: string, v: string): void; removeItem(k: string): void }
  ```
- Produces, `ports.browser.ts`: `browserTimers: Timers`, `browserClock: Clock`, `browserStorage(): StorageLike | null` (null when reading `window.localStorage` throws).
- Produces, `prefs.ts`:
  ```ts
  export interface Codec<T> { parse(raw: string): T; stringify(v: T): string }
  export const text: Codec<string>;
  export function json<T>(guard: (v: unknown) => v is T): Codec<T>;
  export interface Pref<T> { get(): T; set(v: T): void; subscribe(fn: (v: T) => void): () => void }
  export function pref<T>(key: string, fallback: T, codec: Codec<T>, storage: StorageLike | null): Pref<T>;
  ```
  A pref stores one raw value under its own key, the same key and format the games already use, so players' saved settings carry over.
- Produces, `test/`: `check(name: string, ok: boolean, detail?: string): void` (registers one `node:test` test); `manualClock(): { timers: Timers; clock: Clock; advance(ms: number): void; pending(): number }`; `mulberry32(seed: number): Rng`; `recorder<T extends unknown[]>(): { fn: (...a: T) => void; calls: T[] }`; `memoryStorage(seed?: Record<string, string>): StorageLike & { data: Map<string, string> }`; `throwingStorage(): StorageLike`.

- [ ] **Step 1: Write the failing tests**

```js
// games/_kit/test/prefs.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pref, text, json } from '../prefs.ts';
import { memoryStorage, throwingStorage } from './record.ts';

const isNums = v => Array.isArray(v) && v.every(n => typeof n === 'number');

test('reads a value saved before prefs existed, in its old raw form', () => {
  const s = memoryStorage({ 'tankity-text': 'l', 'tankity-local': '[1,2]' });
  assert.equal(pref('tankity-text', 'm', text, s).get(), 'l');
  assert.deepEqual(pref('tankity-local', [], json(isNums), s).get(), [1, 2]);
});

test('falls back when nothing is saved or the saved value is malformed', () => {
  const s = memoryStorage({ bad: '{nope', wrong: '"str"' });
  assert.equal(pref('missing', 'm', text, s).get(), 'm');
  assert.deepEqual(pref('bad', [], json(isNums), s).get(), []);
  assert.deepEqual(pref('wrong', [], json(isNums), s).get(), []);
});

test('set writes the raw form and tells subscribers', () => {
  const s = memoryStorage();
  const p = pref('k', 'a', text, s);
  const seen = [];
  const off = p.subscribe(v => seen.push(v));
  p.set('b');
  off();
  p.set('c');
  assert.equal(s.data.get('k'), 'c');
  assert.deepEqual(seen, ['b']);
  assert.equal(p.get(), 'c');
});

test('storage that throws, or none at all, never throws back', () => {
  for (const s of [throwingStorage(), null]) {
    const p = pref('k', 'a', text, s);
    assert.equal(p.get(), 'a');
    assert.doesNotThrow(() => p.set('b'));
    assert.equal(p.get(), 'b', 'the value lives for the session');
  }
});
```

```js
// games/_kit/test/clock.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { manualClock } from './clock.ts';

test('timeouts and intervals fire in time order as the clock advances', () => {
  const c = manualClock();
  const log = [];
  c.timers.setTimeout(() => log.push(`t@${c.clock.now()}`), 50);
  const id = c.timers.setInterval(() => log.push(`i@${c.clock.now()}`), 30);
  c.advance(100);
  c.timers.clearInterval(id);
  c.advance(100);
  assert.deepEqual(log, ['i@30', 't@50', 'i@60', 'i@90']);
  assert.equal(c.clock.now(), 200);
  assert.equal(c.pending(), 0);
});

test('a cleared timeout never fires', () => {
  const c = manualClock();
  let fired = false;
  c.timers.clearTimeout(c.timers.setTimeout(() => { fired = true; }, 10));
  c.advance(20);
  assert.equal(fired, false);
});
```

```js
// games/_kit/test/rng.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mulberry32 } from './rng.ts';

test('the same seed gives the same stream, in [0, 1)', () => {
  const a = mulberry32(42), b = mulberry32(42);
  const xs = Array.from({ length: 5 }, a);
  assert.deepEqual(xs, Array.from({ length: 5 }, b));
  assert.ok(xs.every(x => x >= 0 && x < 1));
  assert.notDeepEqual(xs, Array.from({ length: 5 }, mulberry32(43)));
});
```

```js
// games/_kit/test/record.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { recorder } from './record.ts';

test('a recorder keeps every call in order', () => {
  const r = recorder();
  r.fn('a', 1);
  r.fn('b', 2);
  assert.deepEqual(r.calls, [['a', 1], ['b', 2]]);
});
```

```js
// games/_kit/test/check.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { writeFileSync, rmSync, mkdtempSync } from 'node:fs';
import { join } from 'node:path';

test('check registers one passing or failing test per call', t => {
  const dir = mkdtempSync(join(import.meta.dirname, '.tmp-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const file = join(dir, 'x.test.mjs');
  writeFileSync(file, `import { check } from '../check.ts';\ncheck('good', true);\ncheck('bad', false, 'because');\n`);
  const r = spawnSync(process.execPath, ['--test', '--test-reporter=tap', file], { encoding: 'utf8' });
  assert.equal(r.status, 1);
  assert.match(r.stdout, /^ok \d+ - good$/m);
  assert.match(r.stdout, /^not ok \d+ - bad$/m);
  assert.match(r.stdout, /because/);
});
```

Add `_kit/test/.tmp-*/` to `games/.gitignore`.

Run: `cd websites/www.cs/games && node --test _kit/test/`
Expected: FAIL; the modules do not exist.

- [ ] **Step 2: Implement**

```ts
// games/_kit/ports.ts
// The ports an engine takes instead of reaching for the page: the page wires
// the browser adapters (ports.browser.ts), tests wire fakes (test/).
export interface Timers {
  setTimeout(fn: () => void, ms: number): number;
  clearTimeout(id: number): void;
  setInterval(fn: () => void, ms: number): number;
  clearInterval(id: number): void;
}
export interface Clock { now(): number }
export type Rng = () => number;
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}
```

```ts
// games/_kit/ports.browser.ts
// The real adapters for ports.ts. DOM program only.
import type { Clock, StorageLike, Timers } from './ports.ts';

export const browserTimers: Timers = {
  setTimeout: (fn, ms) => window.setTimeout(fn, ms),
  clearTimeout: id => window.clearTimeout(id),
  setInterval: (fn, ms) => window.setInterval(fn, ms),
  clearInterval: id => window.clearInterval(id),
};

export const browserClock: Clock = { now: () => performance.now() };

/** localStorage, or null where reading it throws (blocked site data, some private modes). */
export function browserStorage(): StorageLike | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
```

```ts
// games/_kit/prefs.ts
// One saved setting per key, in the raw form the games already store, so a
// player's settings survive. Storage that throws or is missing degrades to a
// value that lives for the session; nothing here ever throws.
import type { StorageLike } from './ports.ts';

export interface Codec<T> {
  parse(raw: string): T;
  stringify(v: T): string;
}

export const text: Codec<string> = { parse: raw => raw, stringify: v => v };

/** JSON values; a parsed value the guard rejects counts as malformed. */
export function json<T>(guard: (v: unknown) => v is T): Codec<T> {
  return {
    parse(raw) {
      const v: unknown = JSON.parse(raw);
      if (!guard(v)) throw new Error('unexpected shape');
      return v;
    },
    stringify: v => JSON.stringify(v),
  };
}

export interface Pref<T> {
  get(): T;
  set(v: T): void;
  subscribe(fn: (v: T) => void): () => void;
}

export function pref<T>(key: string, fallback: T, codec: Codec<T>, storage: StorageLike | null): Pref<T> {
  const subscribers = new Set<(v: T) => void>();
  let session: { v: T } | null = null;

  function read(): T {
    if (session) return session.v;
    try {
      const raw = storage?.getItem(key);
      return raw == null ? fallback : codec.parse(raw);
    } catch {
      return fallback;
    }
  }

  return {
    get: read,
    set(v) {
      let saved = false;
      try {
        if (storage) {
          storage.setItem(key, codec.stringify(v));
          saved = true;
        }
      } catch {
        // Storage refused the write; the session copy below answers instead.
      }
      session = saved ? null : { v };
      for (const fn of subscribers) fn(v);
    },
    subscribe(fn) {
      subscribers.add(fn);
      return () => subscribers.delete(fn);
    },
  };
}
```

```ts
// games/_kit/test/clock.ts
// A manual clock for engine tests: timers fire only when advance() passes them.
import type { Clock, Timers } from '../ports.ts';

export function manualClock(): { timers: Timers; clock: Clock; advance(ms: number): void; pending(): number } {
  let now = 0;
  let nextId = 1;
  const queue = new Map<number, { at: number; every: number; fn: () => void }>();
  const add = (fn: () => void, ms: number, every: number): number => {
    queue.set(nextId, { at: now + ms, every, fn });
    return nextId++;
  };
  return {
    timers: {
      setTimeout: (fn, ms) => add(fn, ms, 0),
      clearTimeout: id => { queue.delete(id); },
      setInterval: (fn, ms) => add(fn, ms, ms),
      clearInterval: id => { queue.delete(id); },
    },
    clock: { now: () => now },
    advance(ms) {
      const end = now + ms;
      for (;;) {
        let due: [number, { at: number; every: number; fn: () => void }] | undefined;
        for (const entry of queue) if (entry[1].at <= end && (!due || entry[1].at < due[1].at)) due = entry;
        if (!due) break;
        const [id, t] = due;
        now = t.at;
        if (t.every) t.at += t.every; else queue.delete(id);
        t.fn();
      }
      now = end;
    },
    pending: () => queue.size,
  };
}
```

```ts
// games/_kit/test/rng.ts
import type { Rng } from '../ports.ts';

/** A small seeded generator: the same seed always gives the same stream. */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
```

Before committing `rng.ts`, compare it with `mulberry32` in `games/crete/src/engine.ts` (line 23). If Crete's differs, Crete keeps its own (its mazes are pinned by seed); this one is for tests only. Say so in a one-line comment if they differ.

```ts
// games/_kit/test/record.ts
// Test doubles: call recorders and in-memory storage.
import type { StorageLike } from '../ports.ts';

export function recorder<T extends unknown[]>(): { fn: (...args: T) => void; calls: T[] } {
  const calls: T[] = [];
  return { fn: (...args: T) => { calls.push(args); }, calls };
}

export function memoryStorage(seed: Record<string, string> = {}): StorageLike & { data: Map<string, string> } {
  const data = new Map(Object.entries(seed));
  return {
    data,
    getItem: k => data.get(k) ?? null,
    setItem: (k, v) => { data.set(k, v); },
    removeItem: k => { data.delete(k); },
  };
}

export function throwingStorage(): StorageLike {
  const no = (): never => { throw new Error('storage blocked'); };
  return { getItem: no, setItem: no, removeItem: no };
}
```

```ts
// games/_kit/test/check.ts
// Lets a PASS/FAIL check script run under node:test unchanged: each
// check(name, ok, detail) becomes one test. New tests use node:test directly.
import { test } from 'node:test';
import assert from 'node:assert/strict';

export function check(name: string, ok: boolean, detail = ''): void {
  test(name, () => assert.ok(ok, detail || name));
}
```

`check.ts` imports `node:test`, so it needs Node's types. Give the kit its own type-check program:

```json
// games/_kit/tsconfig.json
{
  "extends": "./build/tsconfig.base.json",
  "compilerOptions": { "lib": ["ES2022", "DOM"], "types": ["node"] },
  "include": ["*.ts", "test/*.ts"]
}
```

Run: `cd websites/www.cs/games && npm install --save-dev --save-exact @types/node@24 && node_modules/.bin/tsc -p _kit/tsconfig.json`
Expected: no output (no type errors).

- [ ] **Step 3: Run the tests**

Run: `cd websites/www.cs/games && node --test _kit/test/ _kit/build/`
Expected: every test passes.

- [ ] **Step 4: Document the patterns**

Append to `games/_kit/README.md`:

```markdown
## Ports and adapters (`ports.ts`)

An engine never reaches for the page. It takes `Timers`, a `Clock`, an `Rng`
and its own hook interface as arguments; the page wires the browser adapters
(`ports.browser.ts`) and tests wire fakes (`test/`). This is what lets
engines type-check without DOM types and run under plain Node.

## Saved settings (`prefs.ts`)

`pref(key, fallback, codec, storage)` is one setting under its own
localStorage key, in the raw form that key already holds (`text` or
`json(guard)`), so moving a game onto it keeps every player's settings.
`subscribe` tells the UI when a value changes. Blocked or missing storage
falls back to a value that lives for the session; nothing throws.

## Tests (`test/`)

Unit tests are `*.test.mjs` files run with `node --test`. They import
sources directly (`../src/engine.ts`): Node strips the types. Doubles:
`manualClock()` (timers that fire only on `advance`), `mulberry32(seed)`,
`recorder()`, `memoryStorage()`, `throwingStorage()`. `check(name, ok,
detail)` runs an older PASS/FAIL script under `node:test` unchanged, one
test per check; write new tests with `test()` and `assert` directly. PHP
has the same bridge: `php/testing/LegacyCheckCase.php`.
```

- [ ] **Step 5: Commit**

```bash
git add websites/www.cs/games/_kit websites/www.cs/games/package.json websites/www.cs/games/package-lock.json websites/www.cs/games/.gitignore
git commit -m "Games kit: ports and their browser adapters, saved settings, test doubles"
```

### Task 8: Site plumbing for the kit

**Files:**
- Modify: `websites/www.cs/Makefile` (`test`), `websites/www.cs/deploy.sh`, `.github/workflows/ci.yml`, `.github/workflows/deploy.yml`, `websites/www.cs/tests/e2e/select.mjs`, `select-test.mjs`, `websites/www.cs/tests/php/checks/deploy-set.php`, `websites/www.cs/phpunit.xml`

**Interfaces:**
- Consumes: `build.mjs`, `install-core.php`, the kit tests.
- Produces: `make test` runs, in order: `npm ci` in `games/`, the kit unit tests, then every `games/*/test.sh`. `deploy.sh` ships `games/*/dist/` and never ships `_kit/`, `node_modules/`, `test/` or `build.json`. `select.mjs` maps `games/_kit/**` to ALL.

- [ ] **Step 1: Write the failing checks**

Add to `tests/php/checks/deploy-set.php`, after creating these probe files in its scratch copy the way the script already stages files (follow its existing pattern for staging and listing):

```php
foreach (['games/_kit/ports.ts', 'games/node_modules/x/index.js', 'games/package.json', 'games/crete/build.json', 'games/crete/test/engine.test.mjs'] as $f) {
    $check("never-ships-$f", !in_array($f, $files, true), '');
}
foreach (['games/crete/dist/main.js', 'games/crete/dist/main.js.map'] as $f) {
    $check("ships-$f", in_array($f, $files, true), '');
}
```

Add to `select-test.mjs`:

```js
check('kit-change-runs-everything', select(['websites/www.cs/games/_kit/prefs.ts']), 'ALL');
check('game-unit-tests-run-no-browser-specs', select(['websites/www.cs/games/crete/test/engine.test.mjs']), 'NONE');
check('build-config-runs-the-games-specs', has(select(['websites/www.cs/games/crete/build.json']), 'crete-play.spec.mjs'), true);
```

(Use the file's existing helper names: its `check` and `has` cases already show how to call `select`.)

Run: `cd websites/www.cs && vendor/bin/phpunit --testsuite site && node tests/e2e/select-test.mjs`
Expected: FAIL on the new cases.

- [ ] **Step 2: Deploy rules**

In `deploy.sh`'s `case`, add a line before `games/*) ;;`:

```bash
  games/_kit/* | games/node_modules/* | games/package.json | games/package-lock.json | games/.gitignore | games/*/build.json | games/*/test/*) continue ;;
```

In the pre-deploy checks, replace the `games/*/tools/ts-build.mjs` loop and the Tankity `vendor.mjs` check with:

```bash
if ! (cd games && npm ci --silent && npm run --silent check); then
  echo "deploy: run (cd games && npm run build) and commit dist/" >&2
  exit 1
fi
```

Keep the loop until Task 12 removes the last `tools/ts-build.mjs`: until then, run the loop only for games that still have one (`[ -f "$tool" ] || continue` is already the shape, since it globs existing files).

- [ ] **Step 3: `make test` and selection**

`Makefile` `test`: before the `for t in games/*/test.sh` loop, add:

```make
	cd games && npm ci --silent && node --test _kit/test/ _kit/build/ && node_modules/.bin/tsc -p _kit/tsconfig.json
```

`select.mjs`: add before the per-game rules:

```js
[`^${SITE}games/[^/]+/test/`, 'NONE'],
[`^${SITE}games/_kit/(README\\.md|test/|php/tests/|build/(build\\.test\\.mjs|fixture/))`, 'NONE'],
[`^${SITE}games/(_kit/|package(-lock)?\\.json$)`, 'ALL'],
```

and extend each per-game rule so `build.json` and `dist/` select that game's specs. The existing `^${SITE}games/crete/` catch already covers them; confirm with the `build-config-runs-the-games-specs` case.

`phpunit.xml`: the `kit` suite already points at `games/_kit/php/tests`; nothing to add.

- [ ] **Step 4: CI on Node 24**

In `ci.yml` (`units` and `e2e`) and `deploy.yml`, set `node-version: "24"`. In `units`, set `cache-dependency-path` to:

```yaml
          cache-dependency-path: |
            websites/www.cs/package-lock.json
            websites/www.cs/games/package-lock.json
            websites/www.cs/tests/e2e/package-lock.json
```

(Remove each game's lockfile from the list in the task that deletes it.)

- [ ] **Step 5: Run everything**

Run: `cd websites/www.cs && vendor/bin/phpunit --testsuite site && node tests/e2e/select-test.mjs && node tests/e2e/select.mjs --check && make test`
Expected: all green.

- [ ] **Step 6: Commit**

```bash
git add websites/www.cs/Makefile websites/www.cs/deploy.sh websites/www.cs/tests .github/workflows
git commit -m "Site: make test, deploy and spec selection know the games kit; CI on Node 24"
```

### Task 9: Crete on the kit

**Files:**
- Create: `games/crete/build.json`, `games/crete/src/main.ts` (from `game.js`), `games/crete/dist/` (built), `games/crete/test/{engine,smoke}.test.mjs` (from `engine-test.js`, `smoke-test.js`)
- Modify: `games/crete/tsconfig.json`, `games/crete/src/tsconfig.dom.json`, `games/crete/src/engine.ts`, `src/audio.ts`, `src/ui.ts` (import extensions; `Timers` from the kit), `games/crete/index.html`, `games/crete/tools/install-files.php`, `games/crete/test.sh`, `games/crete/README.md`, `games/README.md`
- Delete: `games/crete/game.js`, `games/crete/js/`, `games/crete/tools/ts-build.mjs`, `games/crete/package.json`, `games/crete/package-lock.json`, `games/crete/install-files-test.php`, `games/crete/engine-test.js`, `games/crete/smoke-test.js`
- Modify: `games/package.json` (`build`/`check` list `crete`), `.github/workflows/ci.yml` (drop Crete's lockfile from caches)

**Interfaces:**
- Consumes: `build.mjs`, `install_run`, `Timers` from `_kit/ports.ts`, `browserTimers` from `_kit/ports.browser.ts`, `check` from `_kit/test/check.ts`.
- Produces: `games/crete/dist/main.js` (ESM), loaded by `index.html` as `<script type="module" src="dist/main.js?v=…">`; `window.__mazeTest` unchanged.

- [ ] **Step 1: Build config and type programs**

```json
// games/crete/build.json
{
  "programs": ["tsconfig.json", "src/tsconfig.dom.json"],
  "entries": [{ "in": "src/main.ts", "out": "main", "format": "esm" }]
}
```

```json
// games/crete/tsconfig.json
{
  // DOM-free program: the engine cannot reach the page. See games/_kit/README.md.
  "extends": "../_kit/build/tsconfig.base.json",
  "files": ["src/engine.ts"]
}
```

```json
// games/crete/src/tsconfig.dom.json
{
  "extends": "../tsconfig.json",
  "compilerOptions": { "lib": ["ES2022", "DOM"] },
  "files": ["audio.ts", "ui.ts", "main.ts"]
}
```

- [ ] **Step 2: Sources onto `.ts` imports and the kit's ports**

In `src/engine.ts`, replace the local `Timers` interface (lines 79–84) with `import type { Timers } from '../../_kit/ports.ts';` plus `export type { Timers };` (so `ui.ts` and tests can keep importing it from the engine). Change every relative import in `src/*.ts` from `./x.js` to `./x.ts`.

`git mv games/crete/game.js games/crete/src/main.ts`, then in `src/main.ts`:

- Imports become `import { createGame, bfsDist, bfsPath, key, ROWS, COLS, MAX_HP, TOTAL_PAGES, ITEMS } from './engine.ts';`, `import { createAudio } from './audio.ts';`, `import { createUi } from './ui.ts';`, and `import { browserTimers } from '../../_kit/ports.browser.ts';`. Remove every `?v=`.
- The `timers: { ... }` object literal becomes `timers: browserTimers,`.
- Add types until `tsc` is clean: `function restart(seedStr: string): void`, `function toggleMute(): void`, `function start(): void`, and a global declaration for the test hook:

```ts
declare global {
  interface Window {
    __mazeTest?: Record<string, unknown>;
  }
}
```

- Replace the header comment with three lines: what the entry does (wires engine, audio and UI; starts a run; exposes `window.__mazeTest` for browser specs).

Run: `cd websites/www.cs/games && node _kit/build/build.mjs crete`
Expected: `build: wrote crete/dist/main.js` and `.map`. Fix every type error it prints before going on; never loosen a compiler option.

- [ ] **Step 3: Page and install tool**

In `index.html`, change `<script type="module" src="game.js?v=…"></script>` to `<script type="module" src="dist/main.js?v=0"></script>` (install-files writes the real hash).

Replace `games/crete/tools/install-files.php` entirely:

```php
<?php
// Keeps The Island of Crete installable: php tools/install-files.php [--check].
// The work is games/_kit/php/install-core.php; this is Crete's config.
declare(strict_types=1);
require_once __DIR__ . '/../../_kit/php/install-core.php';

exit(install_run(dirname(__DIR__), [
    'kind' => 'play',
    'versioned' => ['dist/main.js', 'game.css'],
    'precache_dirs' => ['dist'],
    'precache_exclude' => [],
], $argv));
```

Run: `cd websites/www.cs/games/crete && php tools/install-files.php && php tools/install-files.php --check`
Expected: it writes `index.html` and `sw.js`, then `--check` prints nothing and exits 0. Confirm that `sw.js`'s `PRECACHE` lists `dist/main.js` and no `js/` or `.map` paths.

- [ ] **Step 4: Unit tests onto `node:test`**

`git mv engine-test.js test/engine.test.mjs` and `git mv smoke-test.js test/smoke.test.mjs`. In `test/engine.test.mjs`:

- `import * as E from './js/engine.js';` → `import * as E from '../src/engine.ts';`
- delete `let failed = 0;` and the local `const check = …` block; add `import { check } from '../../_kit/test/check.ts';`
- delete the final summary line and `process.exit(...)`.
- Replace its hand-written timer harness with `manualClock()` from `../../_kit/test/clock.ts` (`timers`, `advance`, and `pending()` for any check that counted pending timers). Keep every check's name and condition.

`test/smoke.test.mjs` checked the per-module build. Rewrite its checks for the bundle, keeping the ones about the game:

```js
// games/crete/test/smoke.test.mjs
// Static checks on what ships: the page loads the bundle as a module with a
// version, the engine never names the page, and the test hook is exposed.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const GAME = join(import.meta.dirname, '..');
const read = (...p) => readFileSync(join(GAME, ...p), 'utf8');
const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

test('the page loads the bundle as a versioned module', () => {
  assert.match(read('index.html'), /<script type="module" src="dist\/main\.js\?v=[0-9a-f]{10}"><\/script>/);
});

test('the page versions its stylesheet', () => {
  assert.match(read('index.html'), /href="game\.css\?v=[0-9a-f]{10}"/);
});

test('the engine never names the page', () => {
  assert.doesNotMatch(strip(read('src/engine.ts')), /\b(document|window|navigator|localStorage|AudioContext)\b/);
});

test('the bundle exposes the browser specs\' test hook', () => {
  assert.match(read('dist/main.js'), /__mazeTest/);
});
```

Every check from the old `smoke-test.js` is either above or was about the per-module build that no longer exists (`modules-imported-with-a-version`, `every-js-module-imported-once`, `js-modules-import-nothing`, `every-compiled-module-has-a-source`). The old `install-files-test.php` is covered by `InstallCoreTest` plus `install-files.php --check`.

New `test.sh`:

```sh
#!/bin/sh
# Crete's build checks and unit tests, run from its folder (the site's
# make test runs every games/*/test.sh after `npm ci` in games/).
set -e
cd "$(dirname "$0")"
node ../_kit/build/build.mjs crete --check
php tools/install-files.php --check
node --test 'test/*.test.mjs'
```

Run: `cd websites/www.cs/games/crete && ./test.sh`
Expected: `# fail 0`, and the `# pass` count equals the old `engine-test.js` PASS count plus 4.

- [ ] **Step 5: Delete the old build and update docs**

```bash
cd websites/www.cs/games/crete
git rm -r js tools/ts-build.mjs package.json package-lock.json install-files-test.php
```

Set `games/package.json` scripts to iterate `crete` only. In `.github/workflows/ci.yml`, remove `websites/www.cs/games/crete/package-lock.json` from `cache-dependency-path`.

Rewrite `games/crete/README.md`'s "Files", "Source layout and build" and "Tests" sections for the current state: sources in `src/`, bundle in `dist/` built by `node ../_kit/build/build.mjs crete`, install files by `php tools/install-files.php`, tests by `./test.sh`. Keep the "split follows one seam" paragraph about engine/UI/audio, and point to `../_kit/README.md` for the patterns. In `games/README.md`, change the self-containment bullet to: "A built game folder is self-contained and works copied anywhere; its source needs `games/_kit/` beside it to rebuild (`cd games && npm ci && node _kit/build/build.mjs <id>`)." Update the Layout tree to show `dist/`, `src/`, `test/` and `build.json`.

- [ ] **Step 6: Verify in a browser**

Run: `cd websites/www.cs && make test && make e2e E2E_ARGS="crete-play.spec.mjs games-pwa.spec.mjs"`
Expected: green. `crete-play` passing unchanged is the proof that gameplay didn't move.

- [ ] **Step 7: Commit**

```bash
git add -A websites/www.cs/games/crete websites/www.cs/games/package.json websites/www.cs/games/README.md .github/workflows/ci.yml
git commit -m "Crete: built by the games kit; one bundle in dist/, tests on node:test"
```

---

# PR 4: Cylon on the kit

Branch `games/kit-cylon`.

### Task 10: Cylon on the kit

**Files:**
- Create: `games/cylon/build.json`, `games/cylon/dist/`, `games/cylon/test/*.test.mjs` (from the eight `*-test.js`)
- Move: `games/cylon/cylon.js` → `games/cylon/src/main.ts`
- Modify: `games/cylon/tsconfig.json`, `src/tsconfig.dom.json`, every `src/*.ts` (`.ts` imports), `src/chrome.ts` (settings via `pref`), `games/cylon/tools/install-files.php`, `test.sh`, `README.md`
- Modify: `websites/www.cs/index.html` (import path), `tools/site-versions.php` (`SITE_VERSIONS_REFS`), `tests/php/checks/site-versions.php`, `deploy.sh` (ship the root `.htaccess`)
- Create: `websites/www.cs/.htaccess`; `tests/php/checks/htaccess.php` and `tests/php/HtaccessTest.php`
- Delete: `games/cylon/js/`, `tools/ts-build.mjs`, `package.json`, `package-lock.json`, `install-files-test.php`

**Interfaces:**
- Consumes: the kit build, `install_run` (`kind: start`), `pref`/`json`/`browserStorage`, `check`.
- Produces: `games/cylon/dist/main.js` (ESM) exporting `initializeCylonEffects(options)`, imported by the home page as `./games/cylon/dist/main.js?v=…`; `window.cylonStartGame` unchanged; `MOUNT_HTML_V`, the content hash of `mount.html`, injected at build time.

- [ ] **Step 1: Build config, with the mount version injected**

```json
// games/cylon/build.json
{
  "programs": ["tsconfig.json", "src/tsconfig.dom.json"],
  "entries": [{ "in": "src/main.ts", "out": "main", "format": "esm" }],
  "versions": { "MOUNT_HTML_V": "mount.html" }
}
```

`tsconfig.json` extends `../_kit/build/tsconfig.base.json` and keeps its current `files` (`src/abilities.ts`, `src/rules.ts`, `src/playfield.ts`, `src/state.ts`). `src/tsconfig.dom.json` extends `../tsconfig.json`, adds `"lib": ["ES2022", "DOM"]`, and lists its current files plus `main.ts`. Replace their long header comments with one line pointing at `games/_kit/README.md`.

- [ ] **Step 2: The entry**

`git mv cylon.js src/main.ts`. Then:

- Imports become `./rules.ts`, `./playfield.ts` and so on, with no `?v=`.
- `new URL('mount.html?v=0f24d0d722', import.meta.url)` becomes:

  ```ts
  declare const MOUNT_HTML_V: string; // mount.html's content hash, injected by the build
  // …
  new URL(`../mount.html?v=${MOUNT_HTML_V}`, import.meta.url)
  ```

  The bundle lives in `dist/`, one level below `mount.html`, so the URL gains `../`. `scores.php` likewise becomes `new URL('../scores.php', import.meta.url)`.
- Type the file until `tsc` is clean. Add `interface Window { cylonStartGame?: () => void }` in a `declare global` block, and give `initializeCylonEffects` a typed options interface `{ onTheme?: (combat: boolean) => void; scoresApi?: ScoresApi }` (use the `ScoresApi` type `src/scores.ts` already exports, or export it there).

Run: `cd websites/www.cs/games && node _kit/build/build.mjs cylon`
Expected: writes `cylon/dist/main.js` and `.map`.

- [ ] **Step 3: Settings through `pref`, keeping players' saved settings**

In `src/chrome.ts`, replace the `localStorage` reads and writes of `SETTINGS_KEY` with one pref. `isSettings` is a type guard over the `Settings` shape in `src/types.ts`; write it next to that type:

```ts
import { pref, json } from '../../_kit/prefs.ts';
import { browserStorage } from '../../_kit/ports.browser.ts';
const saved = pref<Settings>(SETTINGS_KEY, DEFAULT_SETTINGS, json(isSettings), browserStorage());
```

Keep any merging of partial old settings with defaults that `chrome.ts` does today: if it spreads the parsed value over defaults, make `isSettings` accept a partial object and keep the spread at the call site.

Add `test/chrome-settings.test.mjs`. It feeds `memoryStorage({ [SETTINGS_KEY]: '<the JSON chrome.ts wrote before this change>' })` into a pref built the same way, and asserts that the saved volumes and toggles come back unchanged. Take a sample of the old JSON from `chrome.ts`'s current `JSON.stringify(settings)` with default settings, and change one volume. Export `SETTINGS_KEY`, `DEFAULT_SETTINGS` and `isSettings` from the module that defines them, so the test can import them.

- [ ] **Step 4: Install tool, site page, and HTML revalidation**

```php
<?php
// Keeps Cylon installable from the site page: php tools/install-files.php [--check].
// The work is games/_kit/php/install-core.php; this is Cylon's config.
declare(strict_types=1);
require_once __DIR__ . '/../../_kit/php/install-core.php';

exit(install_run(dirname(__DIR__), ['kind' => 'start'], $argv));
```

Run: `php tools/install-files.php --check`
Expected: exit 0 with no output. `manifest.webmanifest` must be byte-identical to the committed one; if it isn't, fix `install_manifest`'s `start` branch (Task 6), not the manifest.

In `websites/www.cs/index.html`, the dynamic import becomes `await import('./games/cylon/dist/main.js?v=0')`. In `tools/site-versions.php`, change `['import', 'games/cylon/cylon.js']` to `['import', 'games/cylon/dist/main.js']`. Update `tests/php/checks/site-versions.php` wherever it names `cylon.js`. Run `php tools/site-versions.php`, then `--check`.

Create `websites/www.cs/.htaccess`:

```apache
# Pages revalidate on every visit, so a browser never keeps a page that names
# files a deploy has removed. Assets keep their ?v= content-hash busting.
<IfModule mod_headers.c>
    <FilesMatch "\.html$">
        Header set Cache-Control "no-cache"
    </FilesMatch>
</IfModule>
```

`games/.htaccess` already exists for game folders. Add the same `IfModule mod_headers.c` block at its end, so `games/*/index.html` revalidates too.

In `deploy.sh`'s `case`, add `.htaccess) ;;` above `*/*) continue ;;` so the root `.htaccess` ships. Add `tests/php/checks/htaccess.php`, run by a new `HtaccessTest extends LegacyCheckCase`:

```php
<?php
// Pages revalidate on every visit (root and games/), so a cached page never names removed files.
$root = dirname(__DIR__, 3);
foreach (['.htaccess', 'games/.htaccess'] as $f) {
    $text = (string) @file_get_contents("$root/$f");
    $check("$f-pages-revalidate", str_contains($text, '<FilesMatch "\.html$">')
        && str_contains($text, 'Header set Cache-Control "no-cache"'), $f);
}
```

Then add `$check('ships-root-htaccess', in_array('.htaccess', $files, true), '');` to `checks/deploy-set.php`.

- [ ] **Step 5: Tests onto `node:test`**

For each of `rules`, `playfield`, `scores`, `audio`, `state`, `abilities`, `field`: `git mv <x>-test.js test/<x>.test.mjs`. Change `./js/<x>.js` to `../src/<x>.ts`, use `check` from `../../_kit/test/check.ts`, and drop `failed` and `process.exit`.

Rewrite `smoke-test.js` as `test/smoke.test.mjs`, keeping its game-level checks against the new layout:

```js
// games/cylon/test/smoke.test.mjs
// Static checks on what ships: the entry's export and theme hook, the mount
// fetch, and no name clashes with the site's main.js.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const GAME = join(import.meta.dirname, '..');
const read = (...p) => readFileSync(join(GAME, ...p), 'utf8');
const main = read('src/main.ts');

test('the entry exports initializeCylonEffects with an options object', () => {
  assert.match(main, /^export async function initializeCylonEffects\(options\b/m);
  assert.match(read('dist/main.js'), /initializeCylonEffects/);
});

test('the theme reaches the site only through options.onTheme', () => {
  assert.match(main, /options\.onTheme/);
});

test('mount.html is fetched with its build-time version', () => {
  assert.match(main, /new URL\(`\.\.\/mount\.html\?v=\$\{MOUNT_HTML_V\}`, import\.meta\.url\)/);
  assert.doesNotMatch(read('dist/main.js'), /MOUNT_HTML_V/);
});

test('the site page imports the bundle with a version', () => {
  assert.match(read('..', '..', 'index.html'), /import\('\.\/games\/cylon\/dist\/main\.js\?v=[0-9a-f]{10}'\)/);
});

test('the entry defines nothing the site main.js defines', () => {
  const site = read('..', '..', 'main.js');
  const names = new Set([...site.matchAll(/^(?:async\s+)?function\s+(\w+)|^(?:const|let|var)\s+(\w+)/gm)].map(m => m[1] || m[2]));
  const ours = [...main.matchAll(/^(?:export\s+)?(?:async\s+)?function\s+(\w+)|^(?:export\s+)?(?:const|let)\s+(\w+)/gm)].map(m => m[1] || m[2]);
  assert.deepEqual(ours.filter(n => names.has(n)), []);
});
```

If the old smoke test's name-clash check covered more cases than the last test, keep its logic as written; it is the stricter version.

`test.sh`:

```sh
#!/bin/sh
# Cylon's build checks and unit tests, run from its folder (the site's make
# test runs every games/*/test.sh after `npm ci` in games/).
set -e
cd "$(dirname "$0")"
node ../_kit/build/build.mjs cylon --check
php tools/install-files.php --check
node --test 'test/*.test.mjs'
```

- [ ] **Step 6: Delete, document, verify**

```bash
cd websites/www.cs/games/cylon
git rm -r js tools/ts-build.mjs package.json package-lock.json install-files-test.php
```

Add `cylon` to the `games/package.json` scripts, and remove Cylon's lockfile from the CI caches. Rewrite `games/cylon/README.md`'s layout, build and tests sections for the current state. In `select.mjs`, nothing changes: `games/cylon/` already selects the shell specs plus `cylon-play`.

Run: `cd websites/www.cs && make test && make e2e E2E_ARGS="cylon-play.spec.mjs home-eye.spec.mjs"`
Expected: green.

- [ ] **Step 7: Commit**

```bash
git add -A websites/www.cs/games/cylon websites/www.cs/index.html websites/www.cs/.htaccess websites/www.cs/games/.htaccess websites/www.cs/tools/site-versions.php websites/www.cs/tests websites/www.cs/deploy.sh websites/www.cs/games/package.json .github/workflows/ci.yml
git commit -m "Cylon: built by the games kit; settings through prefs; pages revalidate"
```

---

# PR 5: Tankity on the kit

Branch `games/kit-tankity`. Tasks 11 and 12 ship together.

### Task 11: Tankity's build: three bundles, no import map, no vendor

**Files:**
- Create: `games/tankity/build.json`, `games/tankity/dist/`
- Move: `game.js` → `src/main.ts`; `fx.js` → `src/fx/engine.ts`; `fx-editor.js` → `src/fx/editor.ts`
- Modify: `games/tankity/tsconfig.json`, `src/tsconfig.dom.json`, `src/tsconfig.check.json`, every `src/**/*.ts(x)` (`.ts`/`.tsx` imports), `src/effects.ts`, `index.html`, `fx-editor.html`, `tools/install-files.php`
- Delete: `js/`, `vendor/`, `tools/vendor.mjs`, `tools/ts-build.mjs`, `package.json`, `package-lock.json`

**Interfaces:**
- Consumes: the kit build and `install_run`.
- Produces:
  - `dist/main.js` (ESM, the game);
  - `dist/fx.js` (IIFE: sets `window.TankityFX` exactly as `fx.js` did, because the e2e `recorderScript` intercepts that assignment);
  - `dist/fx-editor.js` (IIFE: sets `window.fxEditor`).
  - `index.html` loads `dist/fx.js` (`defer`) before `dist/main.js` (module). `fx-editor.html` loads `dist/fx.js` and then `dist/fx-editor.js`.

- [ ] **Step 1: Build config**

```json
// games/tankity/build.json
{
  "programs": ["tsconfig.json", "src/tsconfig.dom.json", "src/tsconfig.check.json"],
  "entries": [
    { "in": "src/main.ts", "out": "main", "format": "esm" },
    { "in": "src/fx/engine.ts", "out": "fx", "format": "iife" },
    { "in": "src/fx/editor.ts", "out": "fx-editor", "format": "iife" }
  ]
}
```

`tsconfig.json` extends `../_kit/build/tsconfig.base.json` and keeps its `files`. `src/tsconfig.dom.json` extends `../tsconfig.json`, keeps its file list (the base config already sets `jsx`/`jsxImportSource`), and adds `main.ts`, `fx/engine.ts` and `fx/editor.ts`. `src/tsconfig.check.json` keeps `resolveJsonModule` and its fixture file, extends `../tsconfig.json`, and drops `noEmit`/`rootDir` (the base config sets `noEmit`; `rootDir` doesn't matter without emit).

- [ ] **Step 2: Sources**

- Every relative import in `src/` changes `.js` to `.ts` (or `.tsx` where the target is a `.tsx` file). Bare `preact` imports stay; esbuild bundles them from `games/node_modules`.
- `git mv game.js src/main.ts`. Imports become `./sim.ts`, `./ui/help.tsx` and so on, with no `?v=`. Type it until `tsc` is clean.
- `git mv fx.js src/fx/engine.ts`. Convert the IIFE to module code that ends with `window.TankityFX = api;`. Drop the CommonJS `module.exports` branch: the only Node consumer was `smoke-test.js`'s `eval`, which Task 12 replaces. Type the public API as the `FxEngine` interface that `src/effects.ts` already declares, and move that interface to `src/fx/types.ts` so both import it.
- `git mv fx-editor.js src/fx/editor.ts`. Convert the IIFE the same way, ending with `window.fxEditor = …`. It keeps reading `window.TankityFX` and fetching `game.json`. Change the fetch to `new URL('../game.json', document.baseURI)` only if it was relative to the script before; it was relative to the page, so `fetch('game.json')` stays.

Run: `cd websites/www.cs/games && node _kit/build/build.mjs tankity`
Expected: writes `dist/main.js`, `dist/fx.js`, `dist/fx-editor.js` and their maps.

- [ ] **Step 3: Pages**

`index.html`:
- delete the `<script type="importmap">…</script>` block;
- `<script src="fx.js?v=…" defer></script>` → `<script src="dist/fx.js?v=0" defer></script>`;
- `<script type="module" src="game.js?v=…"></script>` → `<script type="module" src="dist/main.js?v=0"></script>`.

`fx-editor.html`: `<script src="fx.js"></script><script src="fx-editor.js"></script>` → `<script src="dist/fx.js"></script><script src="dist/fx-editor.js"></script>`.

`tools/install-files.php` becomes:

```php
<?php
// Keeps Operation Tankity installable: php tools/install-files.php [--check].
// The work is games/_kit/php/install-core.php; this is Tankity's config.
declare(strict_types=1);
require_once __DIR__ . '/../../_kit/php/install-core.php';

exit(install_run(dirname(__DIR__), [
    'kind' => 'play',
    'versioned' => ['dist/main.js', 'dist/fx.js', 'game.css'],
    'precache_dirs' => ['dist', 'fx/sprites'],
    'precache_exclude' => ['fx-editor.*'],
], $argv));
```

Run: `php tools/install-files.php && php tools/install-files.php --check`
Expected: writes `index.html`, `sw.js` and possibly `manifest.webmanifest`. The `PRECACHE` must list `dist/main.js`, `dist/fx.js`, `fx/sprites/*` and `game.json`, and must not list `dist/fx-editor.js`, `js/`, `vendor/` or any `.map`.

- [ ] **Step 4: Delete**

```bash
cd websites/www.cs/games/tankity
git rm -r js vendor tools/vendor.mjs tools/ts-build.mjs package.json package-lock.json
```

Add `tankity` to `games/package.json` scripts, and remove Tankity's lockfile from the CI caches. In `deploy.sh`, delete the `vendor.mjs` check and the now-empty `games/*/tools/ts-build.mjs` loop. `select.mjs`'s rule naming `games/tankity/(src/|js/|tsconfig\.json$|package\.json$)` becomes `games/tankity/(src/|dist/|build\.json$|tsconfig\.json$)`, and the `fx-editor` rule becomes `games/tankity/(fx-editor\.(html|css)|src/fx/editor\.ts)$` → `tankity-fx-editor.spec.mjs`. Add a `select-test.mjs` case for the editor source.

No commit yet: Task 12 completes the PR's test move, and both land in one commit set.

### Task 12: Tankity's tests on the kit

**Files:**
- Move: every `games/tankity/*-test.js` → `games/tankity/test/*.test.mjs`
- Rewrite: `test/smoke.test.mjs` (bundle-level module checks), `tools/dom-stub.mjs` → `test/dom-stub.mjs`
- Create: `games/tankity/test/php/{Config,GameJson,RoomsSim}Test.php` and `test/php-docker/{Rooms,RoomsStore}Test.php` (LegacyCheckCase wrappers); move the PHP check scripts beside them as `checks/*.php`
- Modify: `src/menu.ts`, `src/tutorial.ts`, `src/scores.ts` (prefs), `test.sh`, `websites/www.cs/Makefile` (docker PHP tests via PHPUnit), `phpunit.xml`, `README.md`
- Delete: `vendor-test.js`, `install-files-test.php`

**Interfaces:**
- Consumes: `check`, `memoryStorage`, `pref`, `text`, `json`, `browserStorage`, `LegacyCheckCase`.
- Produces: PHPUnit suites `tankity` (host PHP) and `tankity-docker` (run inside `www-cs-php`).

- [ ] **Step 1: JS tests**

For `audio`, `flow`, `input`, `net`, `preview`, `protocol`, `render`, `replay`, `sim-vectors` and `ui`: `git mv <x>-test.js test/<x>.test.mjs`. Change `./js/<path>.js` to `../src/<path>.ts` (`.tsx` for `ui/*` components), switch to the kit's `check`, and drop `failed`/`process.exit`. Fix relative paths to `game.json` and `protocol/*.json` (`../game.json`, `../protocol/...`). `git mv tools/dom-stub.mjs test/dom-stub.mjs` and update its two importers. `protocol.test.mjs` uses the `typescript` package's API; under TS 7 that API no longer exists. Replace its program-building with a call to `tsc -p ../src/tsconfig.check.json` through `child_process`, and assert exit 0: the check program is the fixture type-check.

`ui.test.mjs` imports `.tsx` sources, which Node cannot strip (JSX is not erasable). Bundle them for the test instead. At the top of `ui.test.mjs`:

```js
import * as esbuild from 'esbuild';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { mkdtempSync, rmSync } from 'node:fs';

// All UI components in ONE bundle, with preact left external: the test and
// every component then share the single preact Node loads from
// games/node_modules (hooks and contexts break across two copies).
const UI = ['help', 'shop', 'lobby', 'menu', 'guns', 'scores', 'log', 'tutorial', 'hud', 'endveil', 'leave'];
const tmp = mkdtempSync(join(import.meta.dirname, '.tmp-'));
process.on('exit', () => rmSync(tmp, { recursive: true, force: true }));
const out = join(tmp, 'ui.mjs');
await esbuild.build({
  stdin: {
    contents: UI.map(n => `export * as ${n} from '../src/ui/${n}.tsx';`).join('\n'),
    resolveDir: import.meta.dirname,
    loader: 'ts',
  },
  bundle: true, format: 'esm', platform: 'neutral', external: ['preact', 'preact/*'],
  jsx: 'automatic', jsxImportSource: 'preact', outfile: out, logLevel: 'silent',
});
const ui = await import(pathToFileURL(out).href);
```

Then replace each `await import('./js/ui/<name>.js')` with `ui.<name>`. Add `games/tankity/test/.tmp-*/` to `games/.gitignore`.

`test/smoke.test.mjs`: keep every check about gameplay, page markup, CSS and PHP. Delete the module-graph block (old lines 183–238: `imports-carry-a-version`, `imports-name-real-js-modules`, `one-version-per-module`, `import-versions-are-content-hashes`, `every-js-file-reachable-from-game`, `bare-imports-are-in-the-import-map`, `import-map-files-are-versioned`, `import-map-precedes-the-game-script`, `vendored-files-import-only-mapped-names`), and replace it with:

```js
check('page-loads-fx-then-the-game-bundle', /<script src="dist\/fx\.js\?v=[0-9a-f]{10}" defer><\/script>\s*<script type="module" src="dist\/main\.js\?v=[0-9a-f]{10}"><\/script>/.test(html), '');
check('page-has-no-import-map', !/type="importmap"/.test(html), '');
check('bundle-has-no-bare-imports', !/\bfrom\s*["'](?!\.)/.test(read('dist/main.js')), '');
check('fx-bundle-sets-the-global', /TankityFX/.test(read('dist/fx.js')), '');
```

Where the smoke test ran the game, `eval(fxSrc)` becomes `eval(read('dist/fx.js'))`, and `await import(pathToFileURL('game.js'))` becomes `await import(pathToFileURL(join(GAME, 'dist/main.js')).href)`. Keep the stubs. Point the static regex checks that read `game.js` at `src/main.ts`, and those that read `fx.js` at `src/fx/engine.ts`.

- [ ] **Step 2: Saved settings through `pref`**

Replace each raw `localStorage` access with one pref that keeps its key and format:

| Module | Key | Codec | Fallback |
|---|---|---|---|
| `src/menu.ts` | `tankity-body` | `text` | the current default body |
| `src/menu.ts` | `tankity-text` | `text` | `'m'` |
| `src/tutorial.ts` | `tankity-tutorial` | `text` | `''` (`=== 'done'` stays the test) |
| `src/scores.ts` | `tankity-local` | `json(isScoreRows)` | `[]` |
| `src/scores.ts` | `tankity-callsign` | `text` | `''` |

`isScoreRows` is a guard over the row shape `scores.ts` already writes. Add `test/prefs-legacy.test.mjs`, which seeds `memoryStorage` with one value of each key as today's code writes it (e.g. `'tankity-local': '[{"name":"bam","score":120}]'` — copy the exact row shape from `scores.ts`) and asserts that each pref reads it back unchanged.

- [ ] **Step 3: PHP tests on PHPUnit**

For `config`, `game-json` and `rooms-sim` (host PHP): `git mv <x>-test.php test/php/checks/<x>.php`, drop each script's `$fail`/`$check` setup and its summary/exit lines, and fix `require` depths. Wrap each in `test/php/<Name>Test.php extends LegacyCheckCase`. Do the same for `rooms` and `rooms-store` into `test/php-docker/`. Delete `install-files-test.php` (covered by `InstallCoreTest` plus `--check`) and `vendor-test.js`.

`phpunit.xml`:

```xml
    <testsuite name="crete"><directory>games/crete/test/php</directory></testsuite>
    <testsuite name="tankity"><directory>games/tankity/test/php</directory></testsuite>
    <testsuite name="tankity-docker"><directory>games/tankity/test/php-docker</directory></testsuite>
```

(Add `crete` only if Crete has PHP tests; it has none after Task 9, so leave it out.)

`Makefile` `test`: replace `php rooms-test.php` and `php rooms-store-test.php` in the docker block with:

```make
	$(COMPOSE) exec -T www-cs-php sh -c 'cd /var/www/html && vendor/bin/phpunit --testsuite tankity-docker'
```

`vendor/` is visible in the container because the site folder is mounted at `/var/www/html`. Leave `protocol/*.php --check` and `rooms-web-test.php` as they are: they are generators and an HTTP probe, not test scripts.

`test.sh`:

```sh
#!/bin/sh
# Tankity's build checks and unit tests, run from its folder (the site's make
# test runs every games/*/test.sh after `npm ci` in games/, and the room
# suites in the docker PHP).
set -e
cd "$(dirname "$0")"
node ../_kit/build/build.mjs tankity --check
php tools/game-json.php --check
php tools/install-files.php --check
node --test 'test/*.test.mjs'
../../vendor/bin/phpunit -c ../../phpunit.xml --testsuite tankity
```

- [ ] **Step 4: Docs**

Rewrite `games/tankity/README.md`'s file table, build and tests sections for the current state: `src/` (including `src/fx/`), `dist/` (three bundles), `test/`, `build.json`, and no `vendor/` or import map. Drop every line about vendoring and per-module `?v=`. Update the `tankity` bullet in `games/README.md`'s layout if it names files that moved.

- [ ] **Step 5: Verify**

Run: `cd websites/www.cs && make test`
Expected: green. The `# pass` total must be at least the sum of the PASS counts recorded at the start of Task 11 (see below), minus the deleted module-graph, vendor and install-files checks, which are listed by name in Step 1 and Step 3.

At the **start of Task 11**, before changing anything, record the counts with `cd websites/www.cs/games/tankity && npm ci --silent && for t in *-test.js; do echo "$t $(node $t | grep -c '^PASS')"; done > /tmp/tankity-pass-counts.txt && for t in *-test.php; do echo "$t $(php $t | grep -c '^PASS')"; done >> /tmp/tankity-pass-counts.txt`. Do the same for Crete at the start of Task 9 and for Cylon at the start of Task 10, writing `/tmp/<game>-pass-counts.txt`, and compare each game's totals in its verify step.

Run: `make e2e E2E_ARGS="tankity-solo.spec.mjs tankity-fx-editor.spec.mjs"`
Expected: green. These two cover the module bundle and the IIFE bundles; CI runs the rest.

- [ ] **Step 6: Commit (Tasks 11–12)**

```bash
git add -A websites/www.cs/games/tankity websites/www.cs/games/package.json websites/www.cs/games/.gitignore websites/www.cs/Makefile websites/www.cs/phpunit.xml websites/www.cs/deploy.sh websites/www.cs/tests .github/workflows/ci.yml websites/www.cs/games/README.md
git commit -m "Tankity: built by the games kit; three bundles, no import map or vendor/; tests on node:test and PHPUnit"
```

After PR 5 merges, confirm the plan's done-state with these checks:

```bash
cd websites/www.cs/games
git ls-files '*/js/*' '*/vendor/*' '*/tools/ts-build.mjs' '*/package.json' | grep -v '^_kit/\|^package.json$' ; echo "exit:$?"
git ls-files '*.js' | grep -v '/dist/\|^_kit/\|/test/\|^node_modules/' ; echo "exit:$?"
```

Expected: both `grep`s find nothing (exit 1). The second may list `sw.js` files, which are generated by `install-files.php`; that is correct.
