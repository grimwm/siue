# Games Kit, Plan C: the Score Guard and Tankity's Interface Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Put every score endpoint's integrity rules in one kit file that Cylon uses unchanged, then give Tankity its new keys and key chips, a title card with initials and a settings-only menu, a status bar plus control deck that fit every screen from a 360 px phone to a desktop, and a battlefield that fills the screen between them, with no black bars and a solo field as wide as the landscape screen.

**Architecture:** `games/_kit/php/score-guard.php` is one namespaced class (`Kit\ScoreGuard`) holding Cylon's origin, CSRF, run-token, rate-limit and initials rules, configured by a validated config array, a header name, a salt and a store path; each game's `install-files.php` copies it into the game's `server/` (the kit is never deployed). Tankity's key table (`game.yaml`, mirrored by `input.ts`'s fallback) drops W/A/S/D/Q, C and the `cycle` command; chips are `<kbd class="key">` read from that table. A title card (`src/title.ts` + `src/ui/title.tsx`) sits over the dimmed demo; the menu keeps only settings. The page becomes three stacked parts, a Preact status bar, the battlefield, and a static-HTML control deck, laid out by CSS container and media queries. The battlefield's canvas then fills its box: a solo match is dealt a field width from the box's landscape shape (`src/field.ts`), the sim and the server's sim take that width, and the renderer fits the field in the box and fills the rest with the round's hills continued, sky and dirt (`src/scenery.ts`).

**Tech Stack:** TypeScript 7.0.2, esbuild 0.28.2, Preact 11.0.1, Node 24 (`node --test`), PHP 8.4, PHPUnit ^12, Playwright (+ `@axe-core/playwright` from PR 13).

**Spec:** `docs/superpowers/specs/2026-10-12-games-kit-design.md`, section 10 rows 10–13 and 13b, and the sections they point to: 6.1, 6.2, 6.3, 6.4, 6.6, 7.4 and 8 (the guard paragraph). Visual reference: `docs/superpowers/specs/2026-10-12-games-kit-mockups/` (`title-card.html` option A, `controls-and-key-chips.html`, `layout-all-devices.html`; `layout-measure.mjs` is the overflow check `tankity-layout` reuses).

**Landing order across plans:** difficulty PR → B6 ∥ C10 → B7 → (B8 ∥ B9) ∥ (C11 → C12 → C13 → C13b) → B19 → D20 → D14 → D15 → D16 → E17 → row 18. (D20 is Plan D's storage PR, spec row 20.)

**Cross-plan dependencies:**
- Tankity's Difficulty setting (branch `games/tankity-difficulty`: `src/difficulty.ts`, `DIFFICULTY`/`aimSkill` in `src/ai.ts`, the Menu's Difficulty picker, the `difficulty` dep of `createMenu`/`createMatch`/`createLobby`) lands before PR 11. Every search/replace anchor below that quotes `main.ts`, `menu.ts`, `ui/menu.tsx` or `lobby.ts` is written against that code.
- PR 11 needs Plan B's PR 7 merged first: the chips render through the kit's `KeyChip` (`games/_kit/ui/key-chip.tsx`), the title card is the kit's `Dialog` (`games/_kit/ui/dialog.tsx`), and the component tests load `.tsx` with the kit's `importTsx` (`games/_kit/test/tsx.ts`) and render into the kit's `games/_kit/test/dom-stub.mjs` (PR 7 moves it there from `tankity/test/`).
- PR 10 lands before Plan B's PR 19: both edit `install_sync` in `games/_kit/php/install-core.php` and `InstallCoreTest.php`, and B's PR 19 rebases onto this one.
- Plan B's PR 19 (Tankity's Menu → Quit) lands after PR 12 and calls `backToTitle()` from Task 13.
- PR 13b lands after PR 13 and before Plan B's PR 19 and all of Plan D. Plan D's solo referee and the server's play of a solo round take the field width it introduces (`GameState.w`, `genTerrain(rng, w)`, `bandOffset`, `fieldWidthOk` / `room_field_width`, `room_gen_hills`, `room_band_offset`; Plan D Tasks 21a, 22, 26, 28 and 30–33 are written against them). Its sim-vector `exact` cases are the mechanism Plan D Task 21a's `detmath` group uses.
- `menu.tsx`, `menu.ts` and `test/menu.test.mjs` change in this order: the difficulty PR → Task 14 → Task 19 → Plan B Task 24 (Quit) → Plan D Task 18 (Standings). Each later change is written against the one before it.

## Global Constraints

- The host is the sftp-only PHP 8.4 server; nothing is built there. What ships is static files plus the runtime PHP. `dist/` is checked in.
- A built game folder needs nothing outside itself at run time; a game's source needs `games/_kit/` beside it. Kit PHP reaches a game only as a copy the game commits (`install-files.php` writes it, `--check` refuses a stale one).
- Pinned versions: `typescript` `7.0.2`, `esbuild` `0.28.2`, `preact` `11.0.1` (exact, `games/package.json`); `phpunit/phpunit` `^12` (`websites/www.cs/composer.json`); `@axe-core/playwright` `^4.10.2` (`tests/e2e/package.json`, PR 13).
- Never bind a port someone may be using (3000, 5173, 8000, 8080). The docker site publishes an ephemeral port; specs get it from `make url`.
- Browser specs run only through `make e2e E2E_ARGS="…"` (or `tests/e2e/run.sh`), which holds the e2e lock.
- Agents run `make test` plus at most two browser specs locally (each task names them); CI runs the selected specs in four shards.
- `make test` budgets: static checks ≤ 15 s, unit suites ≤ 45 s.
- New tests: `test/*.test.mjs` on `node:test` (`test()` + `node:assert/strict`), TypeScript-friendly (no `check()`); they become `.test.ts` in spec row 18. PHP tests are PHPUnit `TestCase` classes. A test block this plan replaces is deleted from its old `check()` file, not bridged. Component tests load `.tsx` through the kit's `importTsx(import.meta.dirname, { name: '../src/ui/x.tsx' })` and render into `../../_kit/test/dom-stub.mjs`.
- New browser specs aim at ≤ 15 s each (Playwright `page.clock` where timers matter), and get a `WEIGHTS` entry in `tests/e2e/shard.mjs`. Specs named `tankity-*.spec.mjs` are selected by the existing Tankity rule in `select.mjs`.
- Existing specs that press `C`, `W`/`S`, `A`/`D` or `Q`, or click `#btn-menu`, change in the PR that changes those keys.
- After any change to `game.css` or a Tankity bundle: `node ../_kit/build/build.mjs tankity && php tools/install-files.php` in `games/tankity/` (the page's `?v=` hashes and `sw.js` follow the files). After `game.yaml`: `php tools/game-json.php`.
- Comments say why, never what or history; file headers 1–5 lines; docs describe the current state only.
- One PR per spec row: **PR 10** (Tasks 1–5), **PR 11** (Tasks 6–10), **PR 12** (Tasks 11–15), **PR 13** (Tasks 16–21), **PR 13b** (Tasks 22–28). PR 10 is independent; 11 → 12 → 13 → 13b are sequential, each branched from `main` after the previous merged. Every PR: worktree branch, CI, the pr-fix loop on review comments, merge on green CI after pr-fix (William authorized merging on green; CodeRabbit rate limits do not block), deploy, light live check, and the report ends with a cache-busted `/play/tankity/?v=<sha>` link.
- Generated files are never hand-merged. Every Tankity PR rewrites `dist/`, `sw.js`, `index.html`'s `?v=` values and `game.json`; after rebasing onto `main`, take either side of a conflict in them and rebuild: `cd websites/www.cs/games && npm run build && php tankity/tools/game-json.php && php tankity/tools/install-files.php && php cylon/tools/install-files.php && php crete/tools/install-files.php`, then `cd websites/www.cs && php tools/site-versions.php`, and commit what they wrote.
- Merge gate: `gh pr checks <pr> --required`; when it lists nothing, confirm with `gh api "repos/:owner/:repo/branches/main/protection"` and, on a 404, wait for the CI run's own conclusion (`gh run list --branch <branch> --limit 1`, then `gh run watch <id> --exit-status`, branching on the exit status). CodeRabbit rate-limit notices are not merge gates.
- Work happens in a worktree per branch; the main checkout stays on `main`.
- Commit messages end with:
  ```
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb
  ```

## Review Focus

1. **A Shift+arrow chord coming apart in either order** (Shift let go before ←, or ← before Shift, or Shift pressed mid-hold). Expected: driving stops the moment the chord breaks and the barrel and the drive are never both held. Pinned by `keys.test.mjs` "chord" tests in Task 6.
2. **Space or Enter while a title-card button has focus.** Expected: Space presses the focused button (it never fires, never scrolls the page); Enter presses it too; the letter keys (N, O, U, Esc) still work. Pinned by the `cardOpen` tests in Task 13.
3. **A run token issued by today's Cylon, spent after the deploy that moves Cylon onto the guard.** Expected: the guard reads the same `<storageKey>-runs.json` shape and the same HMAC rate keys, so the token is honoured and the hour's rate stamps still count. Pinned by `ScoreGuardTest::testAStoreWrittenByTheOldCylonCodeIsHonoured` in Task 4.
4. **Storage that throws or holds junk when the initials are first set** (Safari private mode, a hand-edited value, a blocked word). Expected: three valid random letters for the session, no exception, and a bad stored value replaced. Pinned by `initials.test.mjs` in Task 11.
5. **The Huge text size on the smallest phone with worst-case numbers.** Expected: the status bar and deck still fit without wrapping or clipping (they size in px, so text size only scales the panels). Pinned by the "Huge text" case in `tankity-layout.spec.mjs`, Task 20.
6. **A phone turned mid-match, or a desktop window resized, then the next match.** Expected: the match keeps the width it was dealt (the view only rescales, never black bars), the next match takes the new shape, and a phone deals the same width held either way. Pinned by `field.test.mjs` "the dealt width holds until the next deal" and "portrait and landscape on one device deal the same width" (Task 22) and the resize test in `tankity-layout.spec.mjs` (Task 28).
7. **A 1440 field against a 720 one, and a room after this PR.** Expected: the gaps between units and the drones' hit rates are the 720 field's; every room vector and fixture is unchanged apart from the new `hills` key; the new `field` vectors agree bit for bit in JS and PHP. Pinned by `wide-field.test.mjs` and the 1440 hit-rate test (Task 23), and the `field` group in `sim-vectors.json` (Task 24).

---

## File Structure

```
websites/www.cs/
  docker/nginx/default.conf                         # PR 10: deny games/cylon/server/
  tests/e2e/
    select.mjs, select-test.mjs                     # PR 10: kit PHP selects nothing on its own
    shard.mjs                                       # PR 12/13: weights for new specs; toolbar removed
    tankity-start.spec.mjs                          # PR 12 (create)
    tankity-layout.spec.mjs, tankity-a11y.spec.mjs  # PR 13 (create)
    tankity-toolbar.spec.mjs                        # PR 13 (delete)
    package.json, package-lock.json                 # PR 13: @axe-core/playwright
    games-hub, tankity-{audio,end,fx-battle,hud,overlays,pickers,rooms,rooms-play,rooms-seats,solo,touch}.spec.mjs  # edits
  games/
    _kit/README.md                                  # PR 10: score guard section
    _kit/php/install-core.php                       # PR 10: kit_php copies
    _kit/php/score-guard.php                        # PR 10 (create)
    _kit/php/tests/{InstallCoreTest,ScoreGuardTest}.php
    cylon/scores.php, cylon/tools/install-files.php, cylon/README.md
    cylon/server/.htaccess, cylon/server/score-guard.php (generated copy)
    cylon/test/php/ScoresTest.php
    tankity/
      game.yaml, game.json, tools/game-json.php     # PR 11: keys
      index.html, game.css, README.md               # PR 11–13
      src/input.ts                                  # PR 11 (keys, chords), PR 12 (cardOpen)
      src/initials.ts                               # PR 12 (create, DOM-free)
      src/title.ts, src/ui/title.tsx                # PR 12 (create)
      src/weapon-label.ts                           # PR 13 (create, DOM-free)
      src/field.ts, src/scenery.ts, src/rotate-hint.ts  # PR 13b (create, DOM-free)
      src/ui/rotate-hint.tsx                        # PR 13b (create)
      src/{sim,ai,ai-measure,protocol}.ts           # PR 13b: the field's width
      server/{sim,rules,ai,protocol}.php            # PR 13b: the field's width, the hills in the snapshot
      protocol/sim-vectors.php, protocol/*.json     # PR 13b: the exact `field` group; fixtures carry `hills`
      test/{field,wide-field,scenery,rotate-hint}.test.mjs, test/php/FieldWidthTest.php  # PR 13b (create)
      src/ui/gun-label.tsx                          # PR 13 (create)
      src/{main,menu,hud,guns,room,lobby,match,shop,tutorial,view,render,game-types}.ts
      src/ui/{chrome,help,menu,shop,tutorial,endveil,hud}.tsx
      tsconfig.json, src/tsconfig.dom.json          # new files join their program
      test/{keys,help,initials,title,menu,weapon-label,hud}.test.mjs  # create (UI files load .tsx with the kit's importTsx)
      test/{input,ui,smoke,render}.test.mjs         # edits
```

---

# PR 10: Kit `score-guard.php`; Cylon moves onto it

Branch `games/score-guard` (from `main`). Spec row 10, section 8 (the guard paragraph).

### Task 1: `install-core.php` copies kit PHP into a game's `server/`

**Files:**
- Modify: `websites/www.cs/games/_kit/php/install-core.php` (`install_sync`)
- Test: `websites/www.cs/games/_kit/php/tests/InstallCoreTest.php`

**Interfaces:**
- Consumes: `install_sync(string $dir, array $config, bool $write): array` (returns `[stale names, notes]`).
- Produces: config key `kit_php` (list of file names in `games/_kit/php/`); each is written to `<game>/server/<name>` byte for byte, and `--check` reports `server/<name>` stale when it differs.

- [ ] **Step 1: Write the failing tests**

Add to `InstallCoreTest` (after `testAStartGameGetsOnlyAManifest`):

```php
    public function testKitPhpIsCopiedIntoServerAndChecked(): void
    {
        file_put_contents("$this->dir/metadata.yaml", "title: Arty\ndescription: Lob.\nstart: artyStart\n");
        $config = ['kind' => 'start', 'kit_php' => ['install-core.php']];
        [$stale] = install_sync($this->dir, $config, true);
        $this->assertSame(['manifest.webmanifest', 'server/install-core.php'], $stale);
        $this->assertFileEquals(dirname(__DIR__) . '/install-core.php', "$this->dir/server/install-core.php");
        $this->assertSame([[], []], install_sync($this->dir, $config, false));
        file_put_contents("$this->dir/server/install-core.php", '<?php // edited by hand');
        $this->assertSame([['server/install-core.php'], []], install_sync($this->dir, $config, false));
    }

    public function testKitPhpMustNameAKitFile(): void
    {
        file_put_contents("$this->dir/metadata.yaml", "title: Arty\ndescription: Lob.\nstart: artyStart\n");
        [$stale, $notes] = install_sync($this->dir, ['kind' => 'start', 'kit_php' => ['nope.php']], true);
        $this->assertSame([], $stale);
        $this->assertSame(['config: kit_php names nope.php, which games/_kit/php does not have'], $notes);
        [, $notes] = install_sync($this->dir, ['kind' => 'start', 'kit_php' => ['../install-core.php']], true);
        $this->assertSame(['config: kit_php entries are file names in games/_kit/php, such as score-guard.php'], $notes);
        $this->assertDirectoryDoesNotExist("$this->dir/server");
    }
```

- [ ] **Step 2: Run them to see them fail**

Run: `cd websites/www.cs && vendor/bin/phpunit --testsuite kit --filter KitPhp`
Expected: FAIL (`server/install-core.php` missing from the stale list; no notes).

- [ ] **Step 3: Implement**

In `install_sync`, directly after the `if (!$notes) { ... }` block that fills the manifest and `sw.js`, add:

```php
    // Kit PHP is never deployed, so a game ships its own copy; the copy is an
    // output like the manifest, and --check refuses one edited by hand.
    foreach ($config['kit_php'] ?? [] as $file) {
        if (!is_string($file) || !preg_match('/^[a-z0-9-]+\.php$/', $file)) {
            return [[], array_merge($notes, ['config: kit_php entries are file names in games/_kit/php, such as score-guard.php'])];
        }
        $copy = @file_get_contents(__DIR__ . "/$file");
        if ($copy === false) {
            return [[], array_merge($notes, ["config: kit_php names $file, which games/_kit/php does not have"])];
        }
        $outputs["server/$file"] = $copy;
    }
```

and in the write loop replace

```php
            if ($write) {
                file_put_contents("$dir/$name", $content);
            }
```

with

```php
            if ($write) {
                if (!is_dir(dirname("$dir/$name"))) {
                    mkdir(dirname("$dir/$name"), 0755, true);
                }
                file_put_contents("$dir/$name", $content);
            }
```

- [ ] **Step 4: Run the kit suite**

Run: `cd websites/www.cs && vendor/bin/phpunit --testsuite kit`
Expected: PASS (all InstallCoreTest cases, old and new).

- [ ] **Step 5: Commit**

```bash
git add websites/www.cs/games/_kit/php/install-core.php websites/www.cs/games/_kit/php/tests/InstallCoreTest.php
git commit -m "Kit install: copy kit PHP into a game's server/ and check the copy"
```

---

### Task 2: `score-guard.php`: config and initials

**Files:**
- Create: `websites/www.cs/games/_kit/php/score-guard.php`
- Create: `websites/www.cs/games/_kit/php/tests/ScoreGuardTest.php`

**Interfaces:**
- Produces (namespace `Kit`, class `ScoreGuard`):
  - `const CONFIG_KEYS = ['runTtlSec','startsPerHour','scoresPerHour','csrfCookie','storageKey','blockedInitials','allowedHosts']`
  - `__construct(array $config, string $csrfHeader, string $rateSalt, array $server, array $cookies, string $runsPath, ?\Closure $clock = null, ?\Closure $setCookie = null)`; `$clock(): int` is Unix seconds, `$setCookie(string $name, string $value, array $options): void`.
  - `static validateConfig(array $data): array` (throws `\RuntimeException`)
  - `static initials(mixed $value): ?string` (`[A-Za-z]{3}` in, `[A-Z]{3}` out)
  - `static coerceInitials(mixed $value, string $pad): string` (stored rows: letters kept, cut or padded)
  - `isBlocked(string $initials): bool`

- [ ] **Step 1: Write the failing tests**

`ScoreGuardTest.php`:

```php
<?php
// The kit's score gate: config, initials, origin, CSRF, run tokens and rate limits.
declare(strict_types=1);

require_once dirname(__DIR__) . '/score-guard.php';

use Kit\ScoreGuard;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

final class ScoreGuardTest extends TestCase
{
    private const CONFIG = [
        'runTtlSec' => 600, 'startsPerHour' => 3, 'scoresPerHour' => 2,
        'csrfCookie' => 'test_csrf', 'storageKey' => 'test',
        'blockedInitials' => ['ASS', 'kkk', 'ASS'], 'allowedHosts' => ['WWW.cs.siue.edu'],
    ];
    private const IP = '203.0.113.7';

    private string $runs;
    private int $now = 1_800_000_000;
    /** @var list<array{string, string, array<string, mixed>}> */
    private array $cookiesSet = [];

    protected function setUp(): void
    {
        $this->runs = sys_get_temp_dir() . '/score-guard-' . bin2hex(random_bytes(4)) . '.json';
    }

    protected function tearDown(): void
    {
        @unlink($this->runs);
    }

    /** @param array<string, mixed> $server @param array<string, mixed> $cookies @param array<string, mixed> $config */
    private function guard(array $server = [], array $cookies = [], array $config = []): ScoreGuard
    {
        return new ScoreGuard(
            ScoreGuard::validateConfig($config + self::CONFIG),
            'X-Test-CSRF',
            'test-salt',
            $server + ['HTTP_HOST' => 'game.test', 'REMOTE_ADDR' => self::IP],
            $cookies,
            $this->runs,
            fn(): int => $this->now,
            function (string $name, string $value, array $options): void { $this->cookiesSet[] = [$name, $value, $options]; },
        );
    }

    public function testConfigIsValidatedAndNormalised(): void
    {
        $c = ScoreGuard::validateConfig(self::CONFIG + ['somethingElse' => 1]);
        $this->assertSame(['ASS', 'KKK'], $c['blockedInitials']);
        $this->assertSame(['www.cs.siue.edu'], $c['allowedHosts']);
        $this->assertSame(ScoreGuard::CONFIG_KEYS, array_keys($c));
    }

    /** @return array<string, array{array<string, mixed>, string}> */
    public static function badConfigs(): array
    {
        $without = self::CONFIG;
        unset($without['runTtlSec']);
        return [
            'missing key' => [$without, 'missing config keys: runTtlSec'],
            'ttl too short' => [['runTtlSec' => 59] + self::CONFIG, 'config runTtlSec must be an integer from 60 to 86400'],
            'starts as text' => [['startsPerHour' => '3'] + self::CONFIG, 'config startsPerHour must be an integer from 1 to 10000'],
            'bad cookie name' => [['csrfCookie' => 'bad-name!'] + self::CONFIG, 'config csrfCookie has an invalid value'],
            'empty storage key' => [['storageKey' => ''] + self::CONFIG, 'config storageKey has an invalid value'],
            'blocked not a list' => [['blockedInitials' => 'ASS'] + self::CONFIG, 'config blockedInitials must be a list'],
            'blocked two letters' => [['blockedInitials' => ['AS']] + self::CONFIG, 'config blockedInitials entries must be 3 letters'],
            'bad host' => [['allowedHosts' => ['bad host']] + self::CONFIG, 'config allowedHosts has an invalid host'],
        ];
    }

    /** @param array<string, mixed> $config */
    #[DataProvider('badConfigs')]
    public function testConfigRejects(array $config, string $message): void
    {
        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage($message);
        ScoreGuard::validateConfig($config);
    }

    public function testInitialsAreThreeLettersInEitherCase(): void
    {
        $this->assertSame('ABC', ScoreGuard::initials('abc'));
        $this->assertSame('ABC', ScoreGuard::initials('AbC'));
        foreach (['ab', 'abcd', 'a1c', ' abc', '', 'ÄBC'] as $bad) {
            $this->assertNull(ScoreGuard::initials($bad), $bad);
        }
        foreach ([123, null, ['abc'], true] as $bad) {
            $this->assertNull(ScoreGuard::initials($bad));
        }
    }

    public function testCoercingKeepsLettersThenCutsOrPads(): void
    {
        $this->assertSame('ABX', ScoreGuard::coerceInitials('ab', 'X'));
        $this->assertSame('ABC', ScoreGuard::coerceInitials('a1b2c3d', 'X'));
        $this->assertSame('XXX', ScoreGuard::coerceInitials('', 'X'));
        $this->assertSame('AAA', ScoreGuard::coerceInitials(null, 'A'));
        $this->assertSame('ZED', ScoreGuard::coerceInitials('Zed', 'A'));
        $this->expectException(InvalidArgumentException::class);
        ScoreGuard::coerceInitials('ab', 'xy');
    }

    public function testBlockedInitialsIgnoreCase(): void
    {
        $g = $this->guard();
        $this->assertTrue($g->isBlocked('ass'));
        $this->assertTrue($g->isBlocked('KKK'));
        $this->assertFalse($g->isBlocked('ABC'));
    }
}
```

- [ ] **Step 2: Run them to see them fail**

Run: `cd websites/www.cs && vendor/bin/phpunit --testsuite kit --filter ScoreGuardTest`
Expected: FAIL (`score-guard.php` missing).

- [ ] **Step 3: Implement**

`games/_kit/php/score-guard.php`:

```php
<?php
// The gate in front of a game's score endpoint: Origin/Referer allow-list,
// CSRF double-submit, single-use expiring run tokens, per-IP rate limits keyed
// by an HMAC of the address, and three-letter initials. It stores run tokens
// and rate stamps, nothing else. install-files.php copies it into each game's
// server/; edit games/_kit/php/score-guard.php, never a copy.
declare(strict_types=1);

namespace Kit;

// A library, never an endpoint.
if ((get_included_files()[0] ?? '') === __FILE__) {
    http_response_code(404);
    exit;
}

final class ScoreGuard
{
    /** The config keys the guard reads; a game's config may hold others it checks itself. */
    public const CONFIG_KEYS = ['runTtlSec', 'startsPerHour', 'scoresPerHour', 'csrfCookie', 'storageKey', 'blockedInitials', 'allowedHosts'];

    private const WINDOW_SEC = 3600;
    private const TOKEN = '/^[a-f0-9]{32}$/';

    /** @var array<string, string> */
    private array $cookies;
    private readonly \Closure $clock;
    private readonly \Closure $setCookie;

    /**
     * @param array<string, mixed> $config the CONFIG_KEYS, through validateConfig()
     * @param string $csrfHeader the request header that carries the CSRF token
     * @param string $rateSalt the HMAC key for client addresses; changing it forgets every rate stamp
     * @param array<string, mixed> $server $_SERVER
     * @param array<string, mixed> $cookies $_COOKIE
     * @param string $runsPath the run-token store, outside any web root
     */
    public function __construct(
        private readonly array $config,
        private readonly string $csrfHeader,
        private readonly string $rateSalt,
        private readonly array $server,
        array $cookies,
        private readonly string $runsPath,
        ?\Closure $clock = null,
        ?\Closure $setCookie = null,
    ) {
        $this->cookies = array_map('strval', array_filter($cookies, 'is_scalar'));
        $this->clock = $clock ?? static fn(): int => time();
        $this->setCookie = $setCookie ?? static function (string $name, string $value, array $options): void {
            setcookie($name, $value, $options);
        };
    }

    /**
     * The guard's part of a game's config, checked and normalised. Keys outside
     * CONFIG_KEYS are the caller's to check.
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     */
    public static function validateConfig(array $data): array
    {
        $missing = array_diff(self::CONFIG_KEYS, array_keys($data));
        if ($missing) {
            throw new \RuntimeException('missing config keys: ' . implode(', ', $missing));
        }
        $out = [];
        foreach (['runTtlSec' => [60, 86400], 'startsPerHour' => [1, 10000], 'scoresPerHour' => [1, 10000]] as $key => [$min, $max]) {
            if (!is_int($data[$key]) || $data[$key] < $min || $data[$key] > $max) {
                throw new \RuntimeException("config $key must be an integer from $min to $max");
            }
            $out[$key] = $data[$key];
        }
        foreach (['csrfCookie' => '/^[A-Za-z0-9_]{1,32}$/', 'storageKey' => '/^[A-Za-z0-9_-]{1,32}$/'] as $key => $pattern) {
            if (!is_string($data[$key]) || !preg_match($pattern, $data[$key])) {
                throw new \RuntimeException("config $key has an invalid value");
            }
            $out[$key] = $data[$key];
        }
        if (!is_array($data['blockedInitials'])) {
            throw new \RuntimeException('config blockedInitials must be a list');
        }
        $blocked = [];
        foreach ($data['blockedInitials'] as $initials) {
            $initials = strtoupper(is_scalar($initials) ? (string) $initials : '');
            if (!preg_match('/^[A-Z]{3}$/', $initials)) {
                throw new \RuntimeException('config blockedInitials entries must be 3 letters');
            }
            $blocked[$initials] = true;
        }
        $out['blockedInitials'] = array_keys($blocked);
        if (!is_array($data['allowedHosts'])) {
            throw new \RuntimeException('config allowedHosts must be a list');
        }
        $hosts = [];
        foreach ($data['allowedHosts'] as $host) {
            $host = strtolower(is_scalar($host) ? (string) $host : '');
            if (!preg_match('/^[a-z0-9.-]+$/', $host)) {
                throw new \RuntimeException('config allowedHosts has an invalid host');
            }
            $hosts[$host] = true;
        }
        $out['allowedHosts'] = array_keys($hosts);
        return $out;
    }

    /** Exactly three letters in either case, as uppercase; null for anything else. */
    public static function initials(mixed $value): ?string
    {
        return is_string($value) && preg_match('/^[A-Za-z]{3}$/', $value) ? strtoupper($value) : null;
    }

    /**
     * Any value forced to three uppercase letters: everything but letters
     * dropped, then cut or padded with $pad. For rows stored before initials
     * were checked, never for new input.
     */
    public static function coerceInitials(mixed $value, string $pad): string
    {
        if (!preg_match('/^[A-Z]$/', $pad)) {
            throw new \InvalidArgumentException('pad must be one uppercase letter');
        }
        $letters = (string) preg_replace('/[^A-Z]/', '', strtoupper(is_scalar($value) ? (string) $value : ''));
        return substr(str_pad($letters, 3, $pad), 0, 3);
    }

    public function isBlocked(string $initials): bool
    {
        return in_array(strtoupper($initials), $this->config['blockedInitials'], true);
    }
}
```

- [ ] **Step 4: Run them**

Run: `cd websites/www.cs && vendor/bin/phpunit --testsuite kit --filter ScoreGuardTest`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add websites/www.cs/games/_kit/php/score-guard.php websites/www.cs/games/_kit/php/tests/ScoreGuardTest.php
git commit -m "Kit score guard: validated config and three-letter initials"
```

---

### Task 3: `score-guard.php`: origin allow-list and CSRF double-submit

**Files:**
- Modify: `websites/www.cs/games/_kit/php/score-guard.php`
- Test: `websites/www.cs/games/_kit/php/tests/ScoreGuardTest.php`

**Interfaces:**
- Consumes: the class from Task 2.
- Produces: `originAllowed(): bool`, `csrfToken(): string`, `csrfOk(): bool`. The CSRF header is read from `$server['HTTP_' . strtoupper(str_replace('-', '_', $csrfHeader))]`.

- [ ] **Step 1: Write the failing tests**

Add to `ScoreGuardTest`:

```php
    /** @return array<string, array{array<string, string>, bool}> */
    public static function origins(): array
    {
        return [
            'own host' => [['HTTP_ORIGIN' => 'https://game.test'], true],
            'own host, other port' => [['HTTP_ORIGIN' => 'http://game.test:8080'], true],
            'own host behind a port' => [['HTTP_HOST' => 'game.test:8443', 'HTTP_ORIGIN' => 'https://game.test'], true],
            'allowed host' => [['HTTP_ORIGIN' => 'https://www.cs.siue.edu'], true],
            'foreign origin' => [['HTTP_ORIGIN' => 'https://evil.example'], false],
            'opaque origin' => [['HTTP_ORIGIN' => 'null'], false],
            'referer when no origin' => [['HTTP_REFERER' => 'https://game.test/games/cylon/'], true],
            'foreign referer' => [['HTTP_REFERER' => 'https://evil.example/x'], false],
            'origin wins over referer' => [['HTTP_ORIGIN' => 'https://evil.example', 'HTTP_REFERER' => 'https://game.test/'], false],
            'neither, with the header' => [['HTTP_X_TEST_CSRF' => 'x'], true],
            'neither, no header' => [[], false],
        ];
    }

    /** @param array<string, string> $server */
    #[DataProvider('origins')]
    public function testOriginAllowList(array $server, bool $allowed): void
    {
        $this->assertSame($allowed, $this->guard($server)->originAllowed());
    }

    public function testCsrfNeedsTheCookieAndAnEqualHeader(): void
    {
        $token = str_repeat('ab', 16);
        $this->assertTrue($this->guard(['HTTP_X_TEST_CSRF' => $token], ['test_csrf' => $token])->csrfOk());
        $this->assertFalse($this->guard(['HTTP_X_TEST_CSRF' => str_repeat('cd', 16)], ['test_csrf' => $token])->csrfOk());
        $this->assertFalse($this->guard([], ['test_csrf' => $token])->csrfOk());
        $this->assertFalse($this->guard(['HTTP_X_TEST_CSRF' => 'abc'], ['test_csrf' => 'abc'])->csrfOk());
        $this->assertFalse($this->guard(['HTTP_X_TEST_CSRF' => $token])->csrfOk());
    }

    public function testATokenCookieIsReusedNotReissued(): void
    {
        $token = str_repeat('ab', 16);
        $this->assertSame($token, $this->guard([], ['test_csrf' => $token])->csrfToken());
        $this->assertSame([], $this->cookiesSet);
    }

    public function testANewTokenIsAStrictHttpOnlyCookieScopedToTheGame(): void
    {
        $g = $this->guard(['SCRIPT_NAME' => '/games/test/scores.php', 'HTTPS' => 'on'], ['test_csrf' => 'not-a-token']);
        $token = $g->csrfToken();
        $this->assertMatchesRegularExpression('/^[a-f0-9]{32}$/', $token);
        $this->assertSame([['test_csrf', $token, [
            'expires' => $this->now + 7 * 86400, 'path' => '/games/test', 'secure' => true, 'httponly' => true, 'samesite' => 'Strict',
        ]]], $this->cookiesSet);
        $this->assertSame($token, $g->csrfToken(), 'the same request keeps the token it set');
    }

    public function testAPlainHttpRequestGetsANonSecureCookieAtTheRoot(): void
    {
        $this->guard(['SCRIPT_NAME' => '/scores.php'])->csrfToken();
        $this->assertSame('/', $this->cookiesSet[0][2]['path']);
        $this->assertFalse($this->cookiesSet[0][2]['secure']);
    }
```

- [ ] **Step 2: Run them to see them fail**

Run: `cd websites/www.cs && vendor/bin/phpunit --testsuite kit --filter ScoreGuardTest`
Expected: FAIL (undefined methods).

- [ ] **Step 3: Implement**

Add to the class, after `isBlocked`:

```php
    /**
     * A browser post from an allowed page: Origin, else Referer, must name the
     * request's own host or an allowed one. A request with neither passes only
     * when it carries the CSRF header, which a cross-site form cannot set.
     */
    public function originAllowed(): bool
    {
        $allowed = array_values(array_filter(array_unique(array_merge($this->config['allowedHosts'], [$this->requestHost()]))));
        foreach (['HTTP_ORIGIN', 'HTTP_REFERER'] as $field) {
            $value = (string) ($this->server[$field] ?? '');
            if ($value !== '') {
                return in_array(self::urlHost($value), $allowed, true);
            }
        }
        return isset($this->server[$this->headerKey()]);
    }

    /** This browser's CSRF token: the cookie's, or a new one set now (7 days, Strict, HttpOnly, scoped to the script's folder). */
    public function csrfToken(): string
    {
        $name = $this->config['csrfCookie'];
        $current = $this->cookies[$name] ?? '';
        if (preg_match(self::TOKEN, $current)) {
            return $current;
        }
        $token = bin2hex(random_bytes(16));
        ($this->setCookie)($name, $token, [
            'expires' => ($this->clock)() + 7 * 86400,
            'path' => $this->cookiePath(),
            'secure' => $this->https(),
            'httponly' => true,
            'samesite' => 'Strict',
        ]);
        $this->cookies[$name] = $token;
        return $token;
    }

    /** Double submit: the header must equal the cookie, and the cookie must be a token this guard issues. */
    public function csrfOk(): bool
    {
        $cookie = $this->cookies[$this->config['csrfCookie']] ?? '';
        $header = (string) ($this->server[$this->headerKey()] ?? '');
        return preg_match(self::TOKEN, $cookie) === 1 && $header !== '' && hash_equals($cookie, $header);
    }

    private function requestHost(): string
    {
        return (string) preg_replace('/:\d+$/', '', strtolower((string) ($this->server['HTTP_HOST'] ?? '')));
    }

    private static function urlHost(string $url): string
    {
        $host = parse_url($url, PHP_URL_HOST);
        return is_string($host) ? strtolower($host) : '';
    }

    private function headerKey(): string
    {
        return 'HTTP_' . strtoupper(str_replace('-', '_', $this->csrfHeader));
    }

    private function cookiePath(): string
    {
        $dir = rtrim(str_replace('\\', '/', dirname((string) ($this->server['SCRIPT_NAME'] ?? ''))), '/');
        return ($dir === '' || $dir === '.') ? '/' : $dir;
    }

    private function https(): bool
    {
        return (!empty($this->server['HTTPS']) && $this->server['HTTPS'] !== 'off')
            || ($this->server['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https'
            || ($this->server['REQUEST_SCHEME'] ?? '') === 'https';
    }
```

- [ ] **Step 4: Run them**

Run: `cd websites/www.cs && vendor/bin/phpunit --testsuite kit --filter ScoreGuardTest`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add websites/www.cs/games/_kit/php/score-guard.php websites/www.cs/games/_kit/php/tests/ScoreGuardTest.php
git commit -m "Kit score guard: origin allow-list and CSRF double-submit"
```

---

### Task 4: `score-guard.php`: run tokens and hashed-IP rate limits

**Files:**
- Modify: `websites/www.cs/games/_kit/php/score-guard.php`
- Test: `websites/www.cs/games/_kit/php/tests/ScoreGuardTest.php`

**Interfaces:**
- Consumes: Tasks 2–3.
- Produces: `clientKey(): string` (24 hex chars of `hash_hmac('sha256', REMOTE_ADDR, $rateSalt)`), `startRun(): ?string` (null = rate-limited), `consumeRun(string $id, ?callable $plausible = null): ?string` returning `null` (accepted), `'rate'`, `'invalid run'` or `'score rejected'`; `$plausible(int $elapsedSeconds): bool`; `rateTake(string $kind, int $perHour): bool` (takes one of this client's `$perHour` slots for `$kind` this hour; false when they are spent; `$kind` is 1–16 lowercase letters; Tankity's rooms use `'room'`). Store shape (unchanged from Cylon, plus any extra kinds beside `start` and `score`): `{"runs":[{"id","at","exp","used"}],"rates":{"<clientKey>":{"start":[ts…],"score":[ts…]}}}`. In the same file, `final class StoreModes` with `static phpIsOwner(): bool` and `static modes(?bool $phpIsOwner = null): array{dir: int, file: int, sharedDir: int, sharedFile: int}`: the one place a game's PHP takes file modes from (the guard's store, Cylon's scores file, Tankity's storage). `dir`/`file` (paths only PHP writes) are 0700/0600 whichever user PHP runs as; `sharedDir`/`sharedFile` (paths the deploy account also writes, such as a game's own `data/`) are 0700/0600 when PHP runs as the deploying account and 0777/0666 when it runs as a web user shared by every site on the host.

- [ ] **Step 1: Write the failing tests**

Add to `ScoreGuardTest`:

```php
    public function testARunTokenIsSpentOnce(): void
    {
        $g = $this->guard();
        $run = $g->startRun();
        $this->assertMatchesRegularExpression('/^[a-f0-9]{32}$/', (string) $run);
        $this->assertNull($g->consumeRun((string) $run));
        $this->assertSame('invalid run', $g->consumeRun((string) $run));
    }

    public function testAnExpiredTokenIsRefused(): void
    {
        $run = (string) $this->guard()->startRun();
        $this->now += 601;
        $this->assertSame('invalid run', $this->guard()->consumeRun($run));
    }

    public function testUnknownAndMalformedTokensAreRefused(): void
    {
        $this->assertSame('invalid run', $this->guard()->consumeRun(str_repeat('0', 32)));
        $this->assertSame('invalid run', $this->guard()->consumeRun('not-a-token'));
        $this->assertSame('invalid run', $this->guard()->consumeRun(''));
    }

    public function testAnImplausibleScoreKeepsItsTokenUnspent(): void
    {
        $run = (string) $this->guard()->startRun();
        $this->now += 42;
        $seen = [];
        $this->assertSame('score rejected', $this->guard()->consumeRun($run, function (int $elapsed) use (&$seen): bool { $seen[] = $elapsed; return false; }));
        $this->assertSame([42], $seen);
        $this->assertNull($this->guard()->consumeRun($run, fn(int $elapsed): bool => true));
    }

    public function testStartsAreLimitedPerHourPerClient(): void
    {
        for ($i = 0; $i < 3; $i++) {
            $this->assertNotNull($this->guard()->startRun());
        }
        $this->assertNull($this->guard()->startRun());
        $this->assertNotNull($this->guard(['REMOTE_ADDR' => '198.51.100.9'])->startRun(), 'another client has its own budget');
        $this->now += 3601;
        $this->assertNotNull($this->guard()->startRun(), 'an hour later the budget is back');
    }

    public function testScoresAreLimitedPerHour(): void
    {
        $runs = [];
        for ($i = 0; $i < 3; $i++) {
            $runs[] = (string) $this->guard()->startRun();
        }
        $this->assertNull($this->guard()->consumeRun($runs[0]));
        $this->assertNull($this->guard()->consumeRun($runs[1]));
        $this->assertSame('rate', $this->guard()->consumeRun($runs[2]));
    }

    public function testTheStoreHoldsTheKeyedHashNeverTheAddress(): void
    {
        $g = $this->guard();
        $g->startRun();
        $raw = (string) file_get_contents($this->runs);
        $this->assertStringNotContainsString(self::IP, $raw);
        $this->assertSame(substr(hash_hmac('sha256', self::IP, 'test-salt'), 0, 24), $g->clientKey());
        $this->assertArrayHasKey($g->clientKey(), json_decode($raw, true)['rates']);
    }

    public function testAStoreWrittenByTheOldCylonCodeIsHonoured(): void
    {
        $id = str_repeat('e', 32);
        $key = substr(hash_hmac('sha256', self::IP, 'test-salt'), 0, 24);
        file_put_contents($this->runs, json_encode([
            'runs' => [['id' => $id, 'at' => $this->now - 10, 'exp' => $this->now + 100, 'used' => false]],
            'rates' => [$key => ['start' => [$this->now - 10], 'score' => []]],
        ]));
        $this->assertNull($this->guard()->consumeRun($id));
        $this->assertNotNull($this->guard()->startRun());
        $this->assertNotNull($this->guard()->startRun());
        $this->assertNull($this->guard()->startRun(), 'the old start stamp still counts toward the hour');
    }

    public function testRateTakeCountsItsOwnKindPerClientPerHour(): void
    {
        $this->assertTrue($this->guard()->rateTake('room', 2));
        $this->assertTrue($this->guard()->rateTake('room', 2));
        $this->assertFalse($this->guard()->rateTake('room', 2));
        $this->assertTrue($this->guard(['REMOTE_ADDR' => '198.51.100.9'])->rateTake('room', 2), 'another client has its own budget');
        $this->assertNotNull($this->guard()->startRun(), 'room stamps never spend run starts');
        $this->now += 3601;
        $this->assertTrue($this->guard()->rateTake('room', 2), 'an hour later the budget is back');
    }

    public function testRateTakeKeepsTheStoreShapeOldReadersExpect(): void
    {
        $g = $this->guard();
        $g->rateTake('room', 5);
        $row = json_decode((string) file_get_contents($this->runs), true)['rates'][$g->clientKey()];
        $this->assertSame([[], [], [$this->now]], [$row['start'], $row['score'], $row['room']]);
    }

    public function testRateTakeRefusesAKindThatIsNotAWord(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->guard()->rateTake('Room!', 1);
    }

    public function testAnUnparsableStoreStartsEmpty(): void
    {
        file_put_contents($this->runs, '{not json');
        $this->assertNotNull($this->guard()->startRun());
    }

    public function testAnUnopenableStoreIsAnError(): void
    {
        $this->runs = sys_get_temp_dir() . '/no-such-dir-' . bin2hex(random_bytes(4)) . '/runs.json';
        $this->expectException(RuntimeException::class);
        $this->guard()->startRun();
    }
```

- [ ] **Step 2: Run them to see them fail**

Run: `cd websites/www.cs && vendor/bin/phpunit --testsuite kit --filter ScoreGuardTest`
Expected: FAIL (undefined methods).

- [ ] **Step 3: Implement**

Add to the class:

```php
    /** This client's rate-limit key: an HMAC of its address, so the store never holds an IP. */
    public function clientKey(): string
    {
        return substr(hash_hmac('sha256', (string) ($this->server['REMOTE_ADDR'] ?? ''), $this->rateSalt), 0, 24);
    }

    /** A new run token, or null when this client has started too many runs this hour. */
    public function startRun(): ?string
    {
        $now = ($this->clock)();
        return $this->withStore(function (array &$store) use ($now): ?string {
            if (!$this->rateAllows($store, 'start', $this->config['startsPerHour'], $now)) {
                return null;
            }
            $id = bin2hex(random_bytes(16));
            $store['runs'][] = ['id' => $id, 'at' => $now, 'exp' => $now + $this->config['runTtlSec'], 'used' => false];
            $this->rateMark($store, 'start', $now);
            return $id;
        });
    }

    /**
     * Spends a run token. $plausible, given the seconds since the token was
     * issued, may reject the score it came with; a rejected token stays
     * unspent. Returns null when the run is accepted, else 'rate',
     * 'invalid run' or 'score rejected'.
     * @param (callable(int): bool)|null $plausible
     */
    public function consumeRun(string $id, ?callable $plausible = null): ?string
    {
        if (!preg_match(self::TOKEN, $id)) {
            return 'invalid run';
        }
        $now = ($this->clock)();
        return $this->withStore(function (array &$store) use ($id, $plausible, $now): ?string {
            if (!$this->rateAllows($store, 'score', $this->config['scoresPerHour'], $now)) {
                return 'rate';
            }
            foreach ($store['runs'] as $i => $run) {
                if (!is_array($run) || ($run['id'] ?? '') !== $id) {
                    continue;
                }
                if (!empty($run['used']) || (int) ($run['exp'] ?? 0) < $now) {
                    return 'invalid run';
                }
                if ($plausible !== null && !$plausible($now - (int) ($run['at'] ?? $now))) {
                    return 'score rejected';
                }
                $store['runs'][$i]['used'] = true;
                $this->rateMark($store, 'score', $now);
                return null;
            }
            return 'invalid run';
        });
    }

    /**
     * Takes one of this client's $perHour slots for $kind (a lowercase word,
     * such as 'room'); false, and nothing taken, when this hour's are spent.
     * For endpoints other than run starts and scores that still need a cap.
     */
    public function rateTake(string $kind, int $perHour): bool
    {
        if (!preg_match('/^[a-z]{1,16}$/', $kind)) {
            throw new \InvalidArgumentException('rate kind must be 1 to 16 lowercase letters');
        }
        $now = ($this->clock)();
        return $this->withStore(function (array &$store) use ($kind, $perHour, $now): bool {
            if (!$this->rateAllows($store, $kind, $perHour, $now)) {
                return false;
            }
            $this->rateMark($store, $kind, $now);
            return true;
        });
    }

    /** @param array{runs: list<mixed>, rates: array<string, mixed>} $store */
    private function rateAllows(array $store, string $kind, int $limit, int $now): bool
    {
        $recent = 0;
        foreach ($store['rates'][$this->clientKey()][$kind] ?? [] as $ts) {
            if ((int) $ts >= $now - self::WINDOW_SEC) {
                $recent++;
            }
        }
        return $recent < $limit;
    }

    /** @param array{runs: list<mixed>, rates: array<string, mixed>} $store */
    private function rateMark(array &$store, string $kind, int $now): void
    {
        $key = $this->clientKey();
        if (!isset($store['rates'][$key]) || !is_array($store['rates'][$key])) {
            $store['rates'][$key] = ['start' => [], 'score' => []];
        }
        $store['rates'][$key][$kind][] = $now;
    }

    /** @return array{runs: list<mixed>, rates: array<string, mixed>} */
    private static function parseStore(string $raw): array
    {
        $data = json_decode($raw !== '' ? $raw : '{}', true);
        $store = ['runs' => [], 'rates' => []];
        if (is_array($data)) {
            if (isset($data['runs']) && is_array($data['runs'])) {
                $store['runs'] = array_values($data['runs']);
            }
            if (isset($data['rates']) && is_array($data['rates'])) {
                $store['rates'] = $data['rates'];
            }
        }
        return $store;
    }

    /**
     * Drops what can no longer matter: tokens an hour past expiry and rate
     * stamps older than the window. Every client row keeps `start` and
     * `score` (the shape Cylon's old code wrote), plus any kind rateTake() added.
     * @param array{runs: list<mixed>, rates: array<string, mixed>} $store
     * @return array{runs: list<mixed>, rates: array<string, mixed>}
     */
    private static function prune(array $store, int $now): array
    {
        $cutoff = $now - self::WINDOW_SEC;
        $store['runs'] = array_values(array_filter($store['runs'], static fn($run): bool => is_array($run) && (int) ($run['exp'] ?? 0) >= $cutoff));
        $rates = [];
        foreach ($store['rates'] as $key => $row) {
            if (!is_array($row)) {
                continue;
            }
            $clean = ['start' => [], 'score' => []];
            foreach ($row as $kind => $stamps) {
                if (is_string($kind) && preg_match('/^[a-z]{1,16}$/', $kind) && is_array($stamps)) {
                    $clean[$kind] = array_values(array_filter(array_map('intval', $stamps), static fn(int $ts): bool => $ts >= $cutoff));
                }
            }
            if (array_filter($clean)) {
                $rates[$key] = $clean;
            }
        }
        $store['rates'] = $rates;
        return $store;
    }

    /** Runs $fn on the store under one exclusive lock and writes back what it leaves. */
    private function withStore(callable $fn): mixed
    {
        $fh = @fopen($this->runsPath, 'c+');
        if ($fh === false) {
            throw new \RuntimeException('unable to open the run store: ' . $this->runsPath);
        }
        try {
            if (!flock($fh, LOCK_EX)) {
                throw new \RuntimeException('unable to lock the run store');
            }
            $raw = stream_get_contents($fh);
            $store = self::prune(self::parseStore($raw === false ? '' : $raw), ($this->clock)());
            $result = $fn($store);
            $encoded = json_encode($store, JSON_UNESCAPED_SLASHES);
            if ($encoded === false) {
                throw new \RuntimeException('run store encode failed');
            }
            rewind($fh);
            ftruncate($fh, 0);
            if (fwrite($fh, $encoded) === false) {
                throw new \RuntimeException('run store write failed');
            }
            fflush($fh);
            flock($fh, LOCK_UN);
            // Only PHP writes the store: StoreModes decides what that means on this host.
            @chmod($this->runsPath, StoreModes::modes()['file']);
            return $result;
        } finally {
            fclose($fh);
        }
    }
```

Append to `score-guard.php`, after the `ScoreGuard` class (same namespace, so every game's `kit_php` copy carries it):

```php
/**
 * The file modes a game's PHP uses, decided in one place. PHP runs either as
 * the account that deployed the game or as a web user every site on the host
 * shares (what Cylon's 0666/0777 assumed). A path only PHP writes is 0700/0600
 * either way: its owner is PHP's user, and that is all PHP needs. A path the
 * deploy account also writes (a game's own data/ folder) must be open to both
 * when they are different users. With a shared web user, any other site's PHP
 * runs as that same user and can read and write what this one stores; no
 * mode prevents that.
 */
final class StoreModes
{
    /** PHP's effective user is the owner of the running script: the deploying account. */
    public static function phpIsOwner(): bool
    {
        return !function_exists('posix_geteuid') || posix_geteuid() === getmyuid();
    }

    /** @return array{dir: int, file: int, sharedDir: int, sharedFile: int} */
    public static function modes(?bool $phpIsOwner = null): array
    {
        $own = $phpIsOwner ?? self::phpIsOwner();
        return ['dir' => 0700, 'file' => 0600, 'sharedDir' => $own ? 0700 : 0777, 'sharedFile' => $own ? 0600 : 0666];
    }
}
```

Add to `ScoreGuardTest` (with `use Kit\StoreModes;`):

```php
    public function testModesForEachWayPhpRuns(): void
    {
        $this->assertSame(['dir' => 0700, 'file' => 0600, 'sharedDir' => 0700, 'sharedFile' => 0600], StoreModes::modes(true));
        $this->assertSame(['dir' => 0700, 'file' => 0600, 'sharedDir' => 0777, 'sharedFile' => 0666], StoreModes::modes(false));
        $this->assertSame(StoreModes::modes(posix_geteuid() === getmyuid()), StoreModes::modes());
    }

    public function testTheStoreTakesThePrivateFileMode(): void
    {
        $this->guard()->startRun();
        $this->assertSame(0600, fileperms($this->runs) & 0777);
    }
```

- [ ] **Step 4: Run them**

Run: `cd websites/www.cs && vendor/bin/phpunit --testsuite kit`
Expected: PASS (ScoreGuardTest and InstallCoreTest).

- [ ] **Step 5: Commit**

```bash
git add websites/www.cs/games/_kit/php/score-guard.php websites/www.cs/games/_kit/php/tests/ScoreGuardTest.php
git commit -m "Kit score guard: single-use run tokens and hashed-IP rate limits"
```

---

### Task 5: Cylon on the guard, with no behaviour change

**Files:**
- Modify: `websites/www.cs/games/cylon/scores.php`
- Modify: `websites/www.cs/games/cylon/tools/install-files.php`
- Create: `websites/www.cs/games/cylon/server/.htaccess`; generated `websites/www.cs/games/cylon/server/score-guard.php`
- Modify: `websites/www.cs/docker/nginx/default.conf`
- Modify: `websites/www.cs/tests/e2e/select.mjs`, `select-test.mjs`
- Modify: `websites/www.cs/games/_kit/README.md`, `websites/www.cs/games/cylon/README.md`
- Test: `websites/www.cs/games/cylon/test/php/ScoresTest.php`

**Interfaces:**
- Consumes: `Kit\ScoreGuard` (Tasks 2–4); `install_run(..., ['kind' => 'start', 'kit_php' => [...]], ...)` (Task 1).
- Produces: in `cylon/scores.php`, `guard(): Kit\ScoreGuard` and `scoreFitsTime(int $score): callable`. Response codes, bodies, the cookie name `cylon_csrf`, the header `X-Cylon-CSRF`, the rate salt `cylon-score-rate-v1` and the runs file `sys_get_temp_dir()/cylon-runs.json` are all unchanged. File modes come from `Kit\StoreModes` (Task 4): the runs file is 0600 (it was 0666), and `openScoresFile` uses `sharedDir`/`sharedFile` for Cylon's own `data/` and `dir`/`file` elsewhere, in place of its hard-coded 0777/0755/0666.

- [ ] **Step 1: Write the failing tests**

Add to `cylon/test/php/ScoresTest.php`:

```php
    public function testTheGuardGetsCylonsBlockList(): void
    {
        $this->assertTrue(guard()->isBlocked('ass'));
        $this->assertTrue(guard()->isBlocked('KKK'));
        $this->assertFalse(guard()->isBlocked('ZED'));
    }

    public function testTheTimeRuleMatchesTheConfig(): void
    {
        $score = cfg('koBurst') + 10 * cfg('maxKosPerSec');
        $this->assertTrue(scoreFitsTime($score)(10));
        $this->assertFalse(scoreFitsTime($score)(9));
        $this->assertFalse(scoreFitsTime(1)(cfg('minRunSec') - 1));
        $this->assertTrue(scoreFitsTime(1)(cfg('minRunSec')));
    }

    public function testStoredInitialsAreCoercedAsBefore(): void
    {
        $rows = normalizeScores([['score' => 1, 'initials' => 'a1'], ['score' => 2], ['score' => 3, 'initials' => 'ass']]);
        $this->assertSame(['AAA', 'AAA'], array_column($rows, 'initials'));
    }
```

- [ ] **Step 2: Run them to see them fail**

Run: `cd websites/www.cs && vendor/bin/phpunit --testsuite cylon`
Expected: FAIL (`guard()` and `scoreFitsTime()` undefined).

- [ ] **Step 3: Copy the guard into Cylon**

`games/cylon/tools/install-files.php`, replace the last line with:

```php
exit(install_run(dirname(__DIR__), ['kind' => 'start', 'kit_php' => ['score-guard.php']], $argv));
```

and change its header's second line to `// The work is games/_kit/php/install-core.php; this is Cylon's config (it also keeps server/score-guard.php current).`

Create `games/cylon/server/.htaccess`:

```
# Libraries for scores.php, never endpoints (each file also 404s on its own).
Require all denied
```

Run: `cd websites/www.cs/games/cylon && php tools/install-files.php`
Expected: `install-files: wrote server/score-guard.php`.

In `docker/nginx/default.conf`, after the `location ^~ /games/cylon/data/ { deny all; }` line, add:

```
    # games/cylon/server/ holds libraries for scores.php; its .htaccess denies them.
    location ^~ /games/cylon/server/ { deny all; }
```

- [ ] **Step 4: Move `scores.php` onto the guard**

In `games/cylon/scores.php`:

1. Replace the header's last line (` * Run tokens: sys_get_temp_dir()/<storageKey>-runs.json`) with:
   ```
    * Origin, CSRF, run tokens, rate limits and initials: server/score-guard.php (the kit's
    *   score guard); its run tokens live in sys_get_temp_dir()/<storageKey>-runs.json.
   ```
   and add after the closing ` */`:
   ```php
   require_once __DIR__ . '/server/score-guard.php';

   use Kit\ScoreGuard;
   ```
2. Replace the whole `validateConfig` function with:
   ```php
   function validateConfig(array $data): array {
       $ints = [
           'maxScores' => [1, 100],
           'maxScoreValue' => [1, 10000000],
           'maxHitsStored' => [0, 100000],
           'minRunSec' => [0, 3600],
           'maxKosPerSec' => [1, 100],
           'koBurst' => [0, 10000],
       ];
       $required = array_merge(array_keys($ints), ['timezone', 'weekStartsOn'], ScoreGuard::CONFIG_KEYS);
       $unknown = array_diff(array_keys($data), $required);
       if ($unknown) {
           throw new RuntimeException('unknown config keys: ' . implode(', ', $unknown));
       }
       $missing = array_diff($required, array_keys($data));
       if ($missing) {
           throw new RuntimeException('missing config keys: ' . implode(', ', $missing));
       }

       $out = ScoreGuard::validateConfig(array_intersect_key($data, array_flip(ScoreGuard::CONFIG_KEYS)));
       foreach ($ints as $key => [$min, $max]) {
           if (!is_int($data[$key]) || $data[$key] < $min || $data[$key] > $max) {
               throw new RuntimeException("config $key must be an integer from $min to $max");
           }
           $out[$key] = $data[$key];
       }
       if ($out['minRunSec'] >= $out['runTtlSec']) {
           throw new RuntimeException('config minRunSec must be less than runTtlSec');
       }

       $tz = $data['timezone'];
       if (!is_string($tz) || !in_array($tz, timezone_identifiers_list(), true)) {
           throw new RuntimeException('config timezone is not a known timezone id');
       }
       $out['timezone'] = $tz;

       $week = $data['weekStartsOn'];
       if ($week !== 'monday' && $week !== 'sunday') {
           throw new RuntimeException('config weekStartsOn must be monday or sunday');
       }
       $out['weekStartsOn'] = $week;
       return $out;
   }

   /** The kit's score gate, set up for Cylon: its cookie, header, rate salt and run store. */
   function guard(): ScoreGuard {
       static $guard = null;
       return $guard ??= new ScoreGuard(
           array_intersect_key(gameConfig(), array_flip(ScoreGuard::CONFIG_KEYS)),
           'X-Cylon-CSRF',
           'cylon-score-rate-v1',
           $_SERVER,
           $_COOKIE,
           rtrim(sys_get_temp_dir(), DIRECTORY_SEPARATOR) . '/' . cfg('storageKey') . '-runs.json',
       );
   }

   /** Cylon's plausibility rule: no score before minRunSec, and no more KOs than the clock allows. */
   function scoreFitsTime(int $score): callable {
       return static fn(int $elapsed): bool => $elapsed >= cfg('minRunSec')
           && $score <= cfg('koBurst') + max(0, $elapsed) * cfg('maxKosPerSec');
   }
   ```
3. In `normalizeScores`, replace
   ```php
           $initials = isset($row['initials']) ? strtoupper((string) $row['initials']) : 'AAA';
           $initials = preg_replace('/[^A-Z]/', '', $initials) ?: 'AAA';
           $initials = substr(str_pad($initials, 3, 'A'), 0, 3);
           if (isBlockedInitials($initials)) {
   ```
   with
   ```php
           $initials = ScoreGuard::coerceInitials($row['initials'] ?? null, 'A');
           if (guard()->isBlocked($initials)) {
   ```
4. Delete these functions entirely: `sanitizeInitials`, `isBlockedInitials`, `requestHost`, `originHost`, `originAllowed`, `cookiePath`, `issueCsrfCookie`, `csrfOk`, `clientIpKey`, `runsPath`, `emptyRunStore`, `loadRunStore`, `pruneRunStore`, `rateAllows`, `rateMark`, `writeJsonHandle`, `withRunStore`, `startRun`, `consumeRun`.
5. In `addScoreLocked`, replace `'initials' => sanitizeInitials($initials),` with `'initials' => ScoreGuard::coerceInitials($initials, 'A'),`.
6. In the request handler, replace `$csrf = issueCsrfCookie();` with `$csrf = guard()->csrfToken();`; replace `!originAllowed() || !csrfOk()` with `!guard()->originAllowed() || !guard()->csrfOk()`; replace the whole `if ($op === 'start') { ... }` block with
   ```php
           if ($op === 'start') {
               $run = guard()->startRun();
               if ($run === null) {
                   respond(['error' => 'rate', 'scores' => [], 'alltime' => []], 429);
               }
               respond(['ok' => true, 'run' => $run]);
           }
   ```
   replace `$initials = sanitizeInitials($data['initials'] ?? 'AAA');` with `$initials = ScoreGuard::coerceInitials($data['initials'] ?? 'AAA', 'A');`, `if (isBlockedInitials($initials)) {` with `if (guard()->isBlocked($initials)) {`, and `$problem = consumeRun((string) ($data['run'] ?? ''), $score);` with `$problem = guard()->consumeRun((string) ($data['run'] ?? ''), scoreFitsTime($score));`.
7. `openScoresFile` (it now opens only the scores file) takes its modes from the kit: after `$dir = dirname($path);` add `$m = StoreModes::modes();`; replace `@mkdir($dir, $relax ? 0777 : 0755, true)` with `@mkdir($dir, $relax ? $m['sharedDir'] : $m['dir'], true)`, `@chmod($dir, 0777);` with `@chmod($dir, $m['sharedDir']);`, and `@chmod($path, 0666);` with `@chmod($path, $relax ? $m['sharedFile'] : $m['file']);`; its comment `// 0777 only for our data/ dir — shared-host PHP is not the SFTP user.` becomes `// Our own data/ is also the deploy account's: Kit\StoreModes opens it to both when PHP runs as another user.` Add `use Kit\StoreModes;` beside `use Kit\ScoreGuard;`.

Run: `grep -nE 'sanitizeInitials|isBlockedInitials|issueCsrfCookie|consumeRun\(|startRun\(|withRunStore' websites/www.cs/games/cylon/scores.php`
Expected: only the `guard()->consumeRun(` and `guard()->startRun(` calls.

- [ ] **Step 5: The kit's score guard selects no spec on its own**

In `tests/e2e/select.mjs`, directly above the line `// The kit's sources and the games' shared lockfile feed every game's build.`, add:

```js
  // The score guard reaches a browser only as the copy each game commits in
  // its server/, and that copy selects its own game's specs. The rest of the
  // kit's PHP (install-core.php) writes every game's pages: ALL, below.
  [new RegExp(`^${SITE}games/_kit/php/score-guard\\.php$`), 'NONE'],
```

In `tests/e2e/select-test.mjs`, after the `crete-skips-tankity` check, add:

```js
check('kit-guard-alone-runs-nothing', select([`${S}games/_kit/php/score-guard.php`]), 'NONE');
check('kit-install-core-runs-everything', select([`${S}games/_kit/php/install-core.php`]), 'ALL');
has('a-games-copy-runs-its-specs', select([`${S}games/cylon/server/score-guard.php`]), ['cylon-play.spec.mjs']);
```

- [ ] **Step 6: Docs**

`games/_kit/README.md`: add a section after "Saved settings":

```markdown
## Score guard (`php/score-guard.php`)

`Kit\ScoreGuard` is the gate in front of a score endpoint: the Origin (else Referer) allow-list, CSRF double-submit (the header must equal the cookie), single-use run tokens that expire, per-client rate limits keyed by an HMAC of the address (`startRun()` and `consumeRun()` count their own; `rateTake($kind, $perHour)` caps any other endpoint), and three-letter initials (`initials()`: `[A-Za-z]{3}` in, `[A-Z]{3}` out; `coerceInitials()` for rows stored before that rule). It reads only the keys in `ScoreGuard::CONFIG_KEYS`, checked by `ScoreGuard::validateConfig()`; a game's config may hold more. A game lists `score-guard.php` under `kit_php` in its `install-files.php` config, which keeps a copy in the game's `server/` (deny that folder in `.htaccess` and in `docker/nginx/default.conf`).

The same file holds `Kit\StoreModes`, the one place a game's PHP takes file modes from: 0700/0600 for what only PHP writes, and for a path the deploy account also writes (a game's own `data/`) 0700/0600 when PHP runs as the deploying account, 0777/0666 when it runs as a web user every site shares. In that second case any other site's PHP on the host can read and write the game's stored files; no mode prevents it.
```

`games/cylon/README.md`: after the `scores.php` bullet in the file list add `- `server/score-guard.php` — the kit's score guard (origin, CSRF, run tokens, rate limits, initials), copied by `tools/install-files.php`; never edit the copy`, and append to the paragraph that starts "`scores.php` keeps two boards" the sentence: "Every POST passes the kit's score guard first (`server/score-guard.php`), configured by the guard keys in `data/config.json`."

- [ ] **Step 7: Verify**

Run: `cd websites/www.cs && vendor/bin/phpunit --testsuite cylon && vendor/bin/phpunit --testsuite kit && node tests/e2e/select-test.mjs && make test`
Expected: all PASS.

Run: `make e2e E2E_ARGS="cylon-play.spec.mjs"`
Expected: PASS (start, a KO, game over and the score submit all go through the guard).

- [ ] **Step 8: Commit, PR, merge, deploy, live check**

```bash
git add -A websites/www.cs/games/cylon websites/www.cs/docker/nginx/default.conf websites/www.cs/tests/e2e/select.mjs websites/www.cs/tests/e2e/select-test.mjs websites/www.cs/games/_kit/README.md
git commit -m "Cylon: scores go through the kit's score guard; behaviour unchanged"
git push -u origin games/score-guard
gh pr create --fill --title "Kit score guard; Cylon moves onto it" --body-file - <<'BODY'
Spec row 10: games/_kit/php/score-guard.php holds Cylon's origin, CSRF, run-token, rate-limit and initials rules behind a validated config; install-files copies it into each game's server/. Cylon uses it with the same cookie, header, salt and run store, so live tokens survive the deploy.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb
BODY
```

If `main` moved, rebase and rebuild the generated files (Global Constraints: never hand-merge `dist/`, `sw.js`, `?v=` values or `game.json`). Run the pr-fix loop on the review comments, then gate on required checks (Global Constraints) and merge on green with `gh pr merge --squash`; wait for the deploy workflow (`gh run list --workflow deploy.yml --branch main --limit 1`, then `gh run watch <id> --exit-status`), then live-check without filing a real score (`cylon-play` posts one, so it runs only locally):

```bash
live=https://www.cs.siue.edu/~wgrim
if body=$(curl -fsS "$live/games/cylon/scores.php"); then
  php -r '$d = json_decode(stream_get_contents(STDIN), true); exit(is_array($d) && preg_match("/^[a-f0-9]{32}$/", $d["csrf"] ?? "") ? 0 : 1);' <<<"$body" && echo "board and CSRF token OK"
else
  echo "scores.php did not answer" >&2
fi
code=$(curl -s -o /dev/null -w '%{http_code}' "$live/games/cylon/server/score-guard.php"); echo "guard copy answers $code (expect 403 or 404)"
cd websites/www.cs && E2E_BASE_URL=$live/ tests/e2e/run.sh cylon-help.spec.mjs
```

Report the play link `https://www.cs.siue.edu/~wgrim/play/tankity/?v=<merged sha>`.

---

# PR 11: Tankity keys and key chips

Branch `games/tankity-keys` (from `main`). Spec row 11, section 6.3. Every task below works in `websites/www.cs/games/tankity/` unless a path says otherwise.

### Task 6: The key table and the Shift+arrow chord

**Files:**
- Modify: `game.yaml` (the `keys:` section and its comment block), `game.json` (regenerated), `tools/game-json.php` (`TANKITY_KEY_ACTIONS`)
- Modify: `src/input.ts` (`GlobalCommand`, `FALLBACK_KEYS`, `keycap`, `keydown`, `keyup`)
- Create: `test/keys.test.mjs`
- Modify: `test/input.test.mjs` (five checks)

**Interfaces:**
- Produces: the shipped table. `aim`: `barrelLeft [ArrowLeft, Left]`, `barrelRight [ArrowRight, Right]`, `powerUp [ArrowUp, Up]`, `powerDown [ArrowDown, Down]`, `driveLeft [Shift+ArrowLeft, Shift+Left]`, `driveRight [Shift+ArrowRight, Shift+Right]`. `global`: `music [m]`, `nextTrack [BracketRight, "]"]`, `sound [e]`, `log [l]`, `help [h]`, `report [r]`, `random [t]`, `rooms [o]`, `new [n]`, `guns [g]`, `tutorial [u]`, `battlePreview [v]`, `fullscreen [f]`, `fire [Space, " ", ControlLeft, ControlRight, Control]`, `escape [Escape]`. `shop` and `scroll` unchanged. The `menu` and `cycle` actions no longer exist.
- Produces: `keycap()` prints arrows as `← ↑ → ↓`, `Escape` as `Esc`, `Space` and `" "` as `Space`, chords as `Shift+←`.

- [ ] **Step 1: Write the failing tests**

`test/keys.test.mjs`:

```js
// The shipped key table (spec 6.3): what is bound, what is left free, the caps
// the chips print, and the Shift+arrow drive chord coming apart in any order.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { FALLBACK_KEYS, buildKeymap, lookupKey, keycap, createInput } from '../src/input.ts';

const GAME = JSON.parse(fs.readFileSync(new URL('../game.json', import.meta.url), 'utf8'));
const map = buildKeymap(GAME.keys);
const ev = o => ({ key: '', code: '', repeat: false, preventDefault() {}, ...o });
const arrowLeft = (o = {}) => ev({ code: 'ArrowLeft', key: 'ArrowLeft', ...o });
const shift = (o = {}) => ev({ code: 'ShiftLeft', key: 'Shift', ...o });
function rig() {
  const input = createInput({ touch: false });
  input.setKeys(GAME.keys);
  return input;
}

test('arrows aim; Shift+arrows drive', () => {
  assert.equal(lookupKey(map, 'aim', { code: 'ArrowLeft', key: 'ArrowLeft' }), 'barrelLeft');
  assert.equal(lookupKey(map, 'aim', { code: 'ArrowRight', key: 'ArrowRight' }), 'barrelRight');
  assert.equal(lookupKey(map, 'aim', { code: 'ArrowUp', key: 'ArrowUp' }), 'powerUp');
  assert.equal(lookupKey(map, 'aim', { code: 'ArrowDown', key: 'ArrowDown' }), 'powerDown');
  assert.equal(lookupKey(map, 'aim', { code: 'ArrowLeft', key: 'ArrowLeft', shiftKey: true }), 'driveLeft');
  assert.equal(lookupKey(map, 'aim', { code: 'ArrowRight', key: 'ArrowRight', shiftKey: true }), 'driveRight');
});

test('Space or Ctrl fires, and G, Esc, L, ], H, M, E, F each do their one job', () => {
  for (const [code, key] of [['Space', ' '], ['ControlLeft', 'Control'], ['ControlRight', 'Control']]) {
    assert.equal(lookupKey(map, 'global', { code, key }), 'fire', code);
  }
  const want = [['KeyG', 'g', 'guns'], ['Escape', 'Escape', 'escape'], ['KeyL', 'l', 'log'], ['BracketRight', ']', 'nextTrack'],
    ['KeyH', 'h', 'help'], ['KeyM', 'm', 'music'], ['KeyE', 'e', 'sound'], ['KeyF', 'f', 'fullscreen']];
  for (const [code, key, action] of want) assert.equal(lookupKey(map, 'global', { code, key }), action, code);
});

test('W, A, S, D, Q and C are bound in no context, and nothing cycles weapons', () => {
  for (const [ctx, actions] of Object.entries(GAME.keys)) {
    for (const [action, tokens] of Object.entries(actions)) {
      for (const t of tokens) assert.doesNotMatch(t, /^(Key[WASDQC]|[wasdqc])$/i, `${ctx}.${action} binds ${t}`);
    }
  }
  assert.equal(GAME.keys.global.cycle, undefined);
  assert.equal(GAME.keys.global.menu, undefined);
});

test('the frozen fallback is the table game.yaml ships', () => {
  assert.deepEqual(JSON.parse(JSON.stringify(FALLBACK_KEYS)), GAME.keys);
});

test('chips print keys the way a keyboard does', () => {
  assert.deepEqual(['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown'].map(keycap), ['←', '↑', '→', '↓']);
  assert.equal(keycap('Shift+ArrowLeft'), 'Shift+←');
  assert.equal(keycap('Space'), 'Space');
  assert.equal(keycap(' '), 'Space');
  assert.equal(keycap('Escape'), 'Esc');
  assert.equal(keycap('BracketRight'), ']');
  assert.equal(keycap('KeyG'), 'G');
  assert.equal(keycap('g'), 'G');
});

test('the first token is the one shown: Space for fire, Shift+← for driving, Esc for the menu', () => {
  const input = rig();
  assert.equal(input.hint('global', 'fire'), 'Space');
  assert.equal(input.hint('global', 'fire', 2), 'Ctrl');
  assert.equal(input.hint('aim', 'driveLeft'), 'Shift+←');
  assert.equal(input.hint('global', 'escape'), 'Esc');
});

test('chord: Shift then ← drives; letting Shift go first stops the drive', () => {
  const input = rig();
  input.keydown(shift({ shiftKey: true }));
  input.keydown(arrowLeft({ shiftKey: true }));
  assert.ok(input.held.has('driveLeft'));
  assert.ok(!input.held.has('barrelLeft'));
  input.keyup(shift());
  assert.ok(!input.held.has('driveLeft'));
  input.keyup(arrowLeft());
  assert.ok(!input.held.has('barrelLeft') && !input.held.has('driveLeft'));
});

test('chord: letting ← go first, Shift still down, stops the drive too', () => {
  const input = rig();
  input.keydown(shift({ shiftKey: true }));
  input.keydown(arrowLeft({ shiftKey: true }));
  input.keyup(arrowLeft({ shiftKey: true }));
  assert.ok(!input.held.has('driveLeft'));
  input.keyup(shift());
  assert.ok(!input.held.has('driveLeft') && !input.held.has('barrelLeft'));
});

test('chord: Shift pressed during a barrel hold turns it into a drive, never both', () => {
  const input = rig();
  input.keydown(arrowLeft());
  assert.ok(input.held.has('barrelLeft'));
  input.keydown(arrowLeft({ shiftKey: true, repeat: true }));
  assert.ok(input.held.has('driveLeft'));
  assert.ok(!input.held.has('barrelLeft'));
  input.keydown(arrowLeft({ repeat: true }));
  assert.ok(input.held.has('barrelLeft'));
  assert.ok(!input.held.has('driveLeft'));
});
```

- [ ] **Step 2: Run them to see them fail**

Run: `node --test test/keys.test.mjs`
Expected: FAIL (driveLeft is still `KeyA`, `ESC`, `◀`, the chord tests).

- [ ] **Step 3: The table**

In `game.yaml`, in the comment block above `keys:` replace the line
`#     text (it is printed as a keycap: arrows show as triangles, KeyW as W,`
and the line after it `#     Escape as ESC, ControlLeft as Ctrl). Put the one you want shown first;`
with
`#     text (it is printed as a keycap: arrows show as ← ↑ → ↓, KeyG as G,`
`#     Escape as Esc, ControlLeft as Ctrl). Put the one you want shown first;`
and add, directly above `# Only the actions below exist; each must have at least one token.`:

```yaml
# Driving is Shift plus an arrow, and W, A, S, D, Q and C are bound nowhere:
# the arrows do all the aiming, so the other hand only ever needs Shift,
# Space or Ctrl. Esc opens the menu and closes whatever is open.
```

Replace the `aim:` and `global:` blocks with:

```yaml
  aim:
    barrelLeft: [ArrowLeft, Left]
    barrelRight: [ArrowRight, Right]
    powerUp: [ArrowUp, Up]
    powerDown: [ArrowDown, Down]
    driveLeft: [Shift+ArrowLeft, Shift+Left]
    driveRight: [Shift+ArrowRight, Shift+Right]
```

```yaml
  global:
    music: [m]
    nextTrack: [BracketRight, "]"]
    sound: [e]
    log: [l]
    help: [h]
    report: [r]
    random: [t]
    rooms: [o]
    new: [n]
    guns: [g]
    tutorial: [u]
    battlePreview: [v]
    fullscreen: [f]
    fire: [Space, " ", ControlLeft, ControlRight, Control]
    escape: [Escape]
```

In `tools/game-json.php`, replace the `'global' => [...]` entry of `TANKITY_KEY_ACTIONS` with:

```php
    'global' => ['music', 'nextTrack', 'sound', 'log', 'help', 'report', 'random', 'rooms', 'new', 'guns',
        'tutorial', 'battlePreview', 'fullscreen', 'fire', 'escape'],
```

Run: `php tools/game-json.php && php tools/game-json.php --check`
Expected: writes `game.json`, then exits 0.

- [ ] **Step 4: `input.ts`**

Replace

```ts
type GlobalCommand =
  | 'music' | 'sound' | 'log' | 'help' | 'report' | 'menu' | 'random' | 'rooms' | 'new' | 'cycle'
  | 'guns' | 'nextTrack' | 'tutorial' | 'battlePreview' | 'fullscreen' | 'fire' | 'escape';
```

with

```ts
type GlobalCommand =
  | 'music' | 'sound' | 'log' | 'help' | 'report' | 'random' | 'rooms' | 'new'
  | 'guns' | 'nextTrack' | 'tutorial' | 'battlePreview' | 'fullscreen' | 'fire' | 'escape';
```

In `FALLBACK_KEYS`, replace the `aim` entry with

```ts
  aim: Object.freeze({
    barrelLeft: ['ArrowLeft', 'Left'],
    barrelRight: ['ArrowRight', 'Right'],
    powerUp: ['ArrowUp', 'Up'],
    powerDown: ['ArrowDown', 'Down'],
    driveLeft: ['Shift+ArrowLeft', 'Shift+Left'],
    driveRight: ['Shift+ArrowRight', 'Shift+Right'],
  }),
```

and the `global` entry with

```ts
  global: Object.freeze({
    music: ['m'], nextTrack: ['BracketRight', ']'], sound: ['e'], log: ['l'], help: ['h'],
    report: ['r'], random: ['t'], rooms: ['o'], new: ['n'], guns: ['g'], tutorial: ['u'],
    battlePreview: ['v'], fullscreen: ['f'],
    fire: ['Space', ' ', 'ControlLeft', 'ControlRight', 'Control'],
    escape: ['Escape'],
  }),
```

In `keycap`, replace

```ts
  const glyph: Record<string, string> = {
    ArrowUp: '▲', ArrowDown: '▼', ArrowLeft: '◀', ArrowRight: '▶', Up: '▲', Down: '▼', Left: '◀', Right: '▶',
  };
  const g = glyph[token];
  if (g) return g;
  if (token === ' ') return 'Space';
```

with

```ts
  const glyph: Record<string, string> = {
    ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→', Up: '↑', Down: '↓', Left: '←', Right: '→',
  };
  const g = glyph[token];
  if (g) return g;
  if (token === ' ' || token === 'Space') return 'Space';
```

and `if (token === 'Escape') return 'ESC';` with `if (token === 'Escape') return 'Esc';`. Update the doc comment above `keycap` to: `/** One token in, one printable cap out: arrows show as ← ↑ → ↓, codes shed their Key/Digit prefix, lone letters go uppercase, chords join with +. */`

In `createInput`'s `keydown`, replace

```ts
    const act = lookup('aim', e) as HoldCommand | null;
    if (act) {
      held.press(act);
```

with

```ts
    const act = lookup('aim', e) as HoldCommand | null;
    if (act) {
      // Shift pressed or let go mid-hold turns a barrel key into a drive key
      // (or back): only the action the chord names now stays down.
      const other = lookup('aim', { key: e.key, code: e.code, ctrlKey: e.ctrlKey, shiftKey: !e.shiftKey }) as HoldCommand | null;
      if (other && other !== act) held.release(other);
      held.press(act);
```

and replace the whole `keyup` function with

```ts
  function keyup(e: KeyLike): void {
    if (isTyping(e.target)) return;
    // A chord comes apart in either order: an arrow lets go of whatever it
    // held with or without Shift, and Shift lets go of every Shift+ hold.
    for (const shiftKey of [false, true]) {
      const act = lookup('aim', { key: e.key, code: e.code, ctrlKey: e.ctrlKey, shiftKey }) as HoldCommand | null;
      if (act) held.release(act);
    }
    if (e.key === 'Shift') {
      for (const [action, tokens] of Object.entries(defs.aim)) {
        if (tokens.some(t => t.startsWith('Shift+'))) held.release(action as HoldCommand);
      }
    }
  }
```

- [ ] **Step 5: The old checks that named W, A or the old caps**

In `test/input.test.mjs` replace:

- `check('lookup-by-code', lookupKey(map, 'aim', { code: 'KeyW', key: 'w' }) === 'powerUp');` → `check('lookup-by-code', lookupKey(map, 'aim', { code: 'ArrowUp', key: 'Up' }) === 'powerUp');`
- `check('lookup-by-key-when-code-unmapped', lookupKey(map, 'aim', { code: 'Quote', key: 'a' }) === 'driveLeft');` → `check('lookup-by-key-when-code-unmapped', lookupKey(map, 'aim', { code: 'Quote', key: 'Up' }) === 'powerUp');`
- `check('lookup-shift-falls-back-to-plain', lookupKey(map, 'aim', { code: 'KeyW', key: 'W', shiftKey: true }) === 'powerUp');` → `check('lookup-shift-falls-back-to-plain', lookupKey(map, 'aim', { code: 'ArrowUp', key: 'ArrowUp', shiftKey: true }) === 'powerUp');`
- `check('keycap-glyphs', keycap('ArrowLeft') === '◀' && keycap('Escape') === 'ESC' && keycap('PageDown') === 'PgDn' && keycap(' ') === 'Space');` → `check('keycap-glyphs', keycap('ArrowLeft') === '←' && keycap('Escape') === 'Esc' && keycap('PageDown') === 'PgDn' && keycap(' ') === 'Space');`
- `check('hint-nth-token', r.input.hint('global', 'fire', 0) === 'Ctrl' && r.input.hint('global', 'fire', 4) === 'Space' && r.input.hint('global', 'nope') === '');` → `check('hint-nth-token', r.input.hint('global', 'fire', 0) === 'Space' && r.input.hint('global', 'fire', 2) === 'Ctrl' && r.input.hint('global', 'nope') === '');`

- [ ] **Step 6: Run the input tests**

Run: `node --test test/keys.test.mjs test/input.test.mjs`
Expected: PASS. (`main.ts` still registers `menu` and `cycle`; the build's type check catches that in Task 7, so do not build yet.)

- [ ] **Step 7: Commit**

```bash
git add game.yaml game.json tools/game-json.php src/input.ts test/keys.test.mjs test/input.test.mjs
git commit -m "Tankity keys: Shift+arrows drive, Space fires first, no W/A/S/D/Q/C, no weapon cycling"
```

---

### Task 7: Commands follow the table: Esc toggles the menu, cycling is gone

**Files:**
- Modify: `src/main.ts` (header comment, `bindKeys`), `src/guns.ts`, `src/room.ts`, `src/tutorial.ts`, `src/match.ts`, `index.html` (two button attributes)
- Modify: `test/smoke.test.mjs` (driver and the checks listed below)
- Modify: `README.md`

**Interfaces:**
- Consumes: the Task 6 table.
- Produces: the `escape` command closes the topmost thing (firing range, leave question, tutorial, lobby, any panel) and, with nothing open, opens the menu; in the shop the `close` command does the same and no longer starts the round (N or the Start button does). `createGuns` no longer returns `cycleWeapon` or takes `netCycle`; `createRoom` no longer returns `netCycle`.

- [ ] **Step 1: Point the smoke driver at the new table (the failing test)**

In `test/smoke.test.mjs`, replace the driver lines from `function pressToken(t) {` through `const TAPD = ...;` with:

```js
function pressToken(t) {
  t = String(t);
  const mods = /^Shift\+/.test(t) ? { shiftKey: true } : {};
  t = t.replace(/^(Ctrl|Shift)\+/, '');
  let m = /^Key([A-Z])$/.exec(t);
  if (m) return [m[1].toLowerCase(), 'Key' + m[1], mods];
  m = /^Digit([0-9])$/.exec(t);
  if (m) return [m[1], 'Digit' + m[1], mods];
  if (t === 'Space' || t === ' ') return [' ', 'Space', mods];
  if (t === 'ControlLeft' || t === 'ControlRight') return ['Control', t, mods];
  if (t === 'Control') return ['Control', 'ControlLeft', mods];
  return [t, /^[A-Z][A-Za-z]*$/.test(t) ? t : undefined, mods];
}
const KB = (ctx, a, i) => pressToken((KEYS[ctx][a] || [])[i || 0]);
const KBD = (ctx, a, n) => pressToken((KEYS[ctx][a] || [])[n - 1]);
const KD = (ctx, a, i, extra) => { const [k, c, mods] = KB(ctx, a, i); keyDown(k, c, { ...mods, ...extra }); };
const KU = (ctx, a, i) => { const [k, c] = KB(ctx, a, i); keyUp(k, c); };
const TAP = (ctx, a, i, extra) => { KD(ctx, a, i, extra); KU(ctx, a, i); };
const TAPD = (ctx, a, n, extra) => { const [k, c, mods] = KBD(ctx, a, n); keyDown(k, c, { ...mods, ...extra }); keyUp(k, c); };
```

Replace the menu block (from `TAP('global', 'menu');` before `check('menu-toggle', ...` through `check('menu-esc', ...);`) with:

```js
TAP('global', 'escape');
check('menu-toggle', els['menu-overlay'].hidden === false && els['btn-menu'].getAttribute('aria-expanded') === 'true');
click(els['menu-close']);
check('menu-close', els['menu-overlay'].hidden === true);
// Esc toggles the menu: once opens it, again closes it.
TAP('global', 'escape');
check('menu-reopen', els['menu-overlay'].hidden === false);
TAP('global', 'escape');
check('menu-esc', els['menu-overlay'].hidden === true);
```

Replace the three other `TAP('global', 'menu')` calls (before `check('menu-open-before-newgame', ...)`, before `TAP('shop', 'close'); frames(3);` that precedes `check('shop-esc-closes-menu', ...)`, and the one before `click(els['menu-leave']); frames(2);` in the room section) with `TAP('global', 'escape')`. Update the comment above the shop case to `// Esc in the shop shuts panels first and, with none open, opens the menu: it never starts the round (N does).`

In `ensureAim`'s neighbour `loadGun`, replace

```js
    for (let i = 0; i < 6 && !selIs(name); i++) {
      TAP('global', 'cycle'); frames(3);
    }
```

with

```js
    // G opens the rack; a digit loads that tile and shuts it. Try each in turn.
    for (let n = 1; n <= 6 && !selIs(name); n++) {
      TAP('global', 'guns'); frames(2);
      keyDown(String(n), 'Digit' + n); keyUp(String(n), 'Digit' + n); frames(3);
    }
```

Replace

```js
  // Q -> Buckshot (1 in the rack); cycle right round to prove the NUKE stays
  // gated on round 1 while every affordable gun comes up.
  TAP('global', 'cycle'); frames(3);
  const qLog = logText();
  for (let i = 0; i < 4; i++) { TAP('global', 'cycle'); frames(3); }
```

with

```js
  // G then 2 loads the rack's second gun (Buckshot); loading every tile in
  // turn proves the NUKE stays off the round-1 rack while each bought gun is on it.
  const pickTile = n => { TAP('global', 'guns'); frames(2); keyDown(String(n), 'Digit' + n); keyUp(String(n), 'Digit' + n); frames(3); };
  pickTile(2);
  const qLog = logText();
  for (let n = 1; n <= 4; n++) pickTile(n);
```

and `check('q-cycle', /Loaded: Buckshot/.test(qLog));` with `check('picker-loads-a-tile', /Loaded: Buckshot/.test(qLog));`.

In `check('keys-file-drives', ...)` replace `KEYS.global.fire[0] === 'ControlLeft'` with `KEYS.global.fire[0] === 'Space'`. In `check('key-hints', ...)` replace `'data-keyhint="global:menu">(C)<'` with `'data-keyhint="global:escape">(Esc)<'` (Task 8 turns these into chips).

Run: `node --test test/smoke.test.mjs`
Expected: FAIL (the bundle still has `menu`/`cycle`; Esc does not open the menu).

- [ ] **Step 2: `main.ts`**

Replace the header's controls line ` * Controls: hold Left/Right = angle · hold Up/Down = power · A/D = drive ·` and the line after it with:

```ts
 * Controls: hold ←/→ = angle · hold ↑/↓ = power · Shift+←/→ = drive ·
 * Space or Ctrl = fire · G = weapons · Esc = menu · N = next round / new match.
```

In `bindKeys`, replace the `close:` handler with

```ts
    // Esc in the shop shuts the firing range first, then any open panel (the
    // menu can sit above the shop), and with nothing open it opens the menu.
    // It never starts the round: that is N or the Start button.
    close: () => {
      if (G.preview) closePreview();
      else if (closeLeaveVeil()) { /* the question closed */ }
      else if (!closeOverlays()) toggleOverlay('menu-overlay', 'btn-menu');
      return true;
    },
```

replace the `escape:` handler with

```ts
    // Esc toggles the menu: it shuts the topmost thing that is open, and with
    // nothing open it opens the menu.
    escape: () => {
      if (G.preview) { closePreview(); return; }
      if (closeLeaveVeil()) return;
      if (tutorialActive()) { skipTutorial(); return; }
      if (closeLobbyVeil()) return;
      if (!closeOverlays()) toggleOverlay('menu-overlay', 'btn-menu');
    },
```

delete the `// C opens the menu; ESC does the closing.` comment and its `menu: () => { ... },` handler, and delete the `cycle: () => { cycleWeapon(); if (gunsOpen()) renderGuns(); },` line. In the `createGuns` destructuring remove `cycleWeapon, ` and in its deps remove `netCycle: () => netCycle(),`; in the `createRoom` destructuring remove `netCycle, `.

- [ ] **Step 3: `guns.ts` and `room.ts`**

`src/guns.ts`: delete `netCycle(): void;` from `GunsDeps`, `netCycle` from the deps destructuring, the whole `cycleWeapon` function, and `cycleWeapon, ` from the returned object. Change the comment `/* One direct loader for the weapon picker; Q keeps cycling through it. */` to `/* The weapon picker's one loader. */`, and `/* The weapon picker: every gun on the rack as a tile, for when Q would take` / `a dozen presses. Arrows or J/K move the cursor, Enter or a digit loads. */` to `/* The weapon picker: every gun on the rack as a tile. Arrows or J/K move the cursor, Enter or a digit loads. */`. Replace the file header with:

```ts
/* Operation Tankity: the weapon picker.
 *
 * Every gun on the rack as a tile, and the keys that move its cursor and load
 * a gun. The picker overlay (src/ui/guns.tsx) draws what this says. In a room
 * a pick goes to the server (the `netPick` dep). The game's state, the
 * arsenal tables and the page arrive as deps. */
```

`src/room.ts`: delete the whole `netCycle` function and `netCycle, ` from the returned object.

- [ ] **Step 4: Text that named the old keys**

`src/tutorial.ts`: in `TOUCH_NAMES` replace `'global:cycle': 'Weapons', 'global:fire': 'Fire',` with `'global:guns': 'Weapon', 'global:fire': 'FIRE',`, and the step `{ text: 'Press {global:cycle} to cycle shells. The HUD shows what is loaded.', done: () => TUT && G.selected !== TUT.sel0 },` with `{ text: 'Press {global:guns} and pick another shell. The Weapon button shows what is loaded.', done: () => TUT && G.selected !== TUT.sel0 },`.

`src/match.ts`: replace `${TOUCH ? 'Tap Weapons' : keyHint('global', 'cycle')} to swap guns.` with `${TOUCH ? 'Tap Weapon' : `Press ${keyHint('global', 'guns')}`} to swap guns.`.

`index.html`: on `#btn-menu` change `data-keyhint="global:menu">(C)` to `data-keyhint="global:escape">(Esc)` and `data-tip-desc="New game, rooms, unit, text size, sound and more"` stays; on `#btn-weapon` change `data-tip-desc="Pick any gun on your rack (Q loads the next)"` to `data-tip-desc="Pick any gun on your rack"`.

`README.md`: in the section that says "Key tokens match `event.code` first", append: "Driving is Shift plus an arrow; W, A, S, D, Q and C are bound nowhere. Esc toggles the menu: it closes whatever is open and, with nothing open, opens the menu."

- [ ] **Step 5: Build and run**

Run: `node ../_kit/build/build.mjs tankity && php tools/install-files.php && node --test test/smoke.test.mjs test/input.test.mjs test/keys.test.mjs`
Expected: build clean (no type errors), PASS.

- [ ] **Step 6: Commit**

```bash
git add src index.html dist sw.js test/smoke.test.mjs README.md
git commit -m "Tankity: Esc toggles the menu, weapon cycling is gone, text names the new keys"
```

---

### Task 8: Key chips: one dark keycap, read from the table, only with a fine pointer

**Files:**
- Modify: `src/ui/chrome.tsx` (`Key`), `src/ui/shop.tsx` (`ShopProps.next`), `src/ui/tutorial.tsx` (`TutorialProps`), `src/shop.ts`, `src/tutorial.ts`, `src/main.ts` (`keyCap`, `renderKeyHints`, `bindToolTips`), `index.html`, `game.css`
- Modify: `test/ui.test.mjs`, `test/smoke.test.mjs`

**Interfaces:**
- Consumes: the kit's `KeyChip({ label, class, at, decorative })` (Plan B Task 6, `games/_kit/ui/key-chip.tsx`).
- Produces: `<Key at bare />` renders the kit's `<KeyChip label={cap} class="key" at={at} decorative />`, which is `<kbd class="key" data-keyhint={at} aria-hidden="true">{cap}</kbd>` (no parentheses). `ShopProps.next` is `{ label: string; keyAt?: string; pressed?: boolean }`. `TutorialProps` gains `skipKey?: string`. `ShopDeps` gains `touch: boolean` and loses `keyCap`; `TutorialDeps` loses `keyCap`. `main.ts` no longer has `keyCap`.

- [ ] **Step 1: Update the component tests to the chip format (failing)**

In `test/ui.test.mjs`:

- In `KEYS`, add `'shop:next': 'N',`.
- In `shopProps`, `next: { label: 'Start round 2 (N)' }` → `next: { label: 'Start round 2', keyAt: 'shop:next' }`.
- `check('shop-buy-and-preview-buttons', acts.length === 2 && text(acts[0]) === 'Preview (V)' && text(acts[1]) === 'Buy (B)'` → `check('shop-buy-and-preview-buttons', acts.length === 2 && text(acts[0]) === 'Preview V' && text(acts[1]) === 'Buy B'`, and in the same check `hasClass(acts[0].children[1], 'key')` stays and add `&& acts[0].children[1].localName === 'kbd' && acts[0].children[1].getAttribute('aria-hidden') === 'true'` before `, acts.map(text).join('|'));`.
- `check('shop-start-button-solo', text(next) === 'Start round 2 (N)'` → `check('shop-start-button-solo', text(next) === 'Start round 2 N'`.
- `shopProps({ next: { label: 'Ready (N)', pressed: false }` → `shopProps({ next: { label: 'Ready', keyAt: 'shop:next', pressed: false }`, and its check `text(next) === 'Ready (N)'` → `text(next) === 'Ready N'`.
- `shopProps({ next: { label: 'Ready ✓ (N)', pressed: true }` → `shopProps({ next: { label: 'Ready ✓', keyAt: 'shop:next', pressed: true }`, and `text(next) === 'Ready ✓ (N)'` → `text(next) === 'Ready ✓ N'`.
- `/^Buy ×3 \(B\)$/` → `/^Buy ×3 B$/`.
- `text(ng) === 'New Game (N)'` → `text(ng) === 'New Game N'`; `'Sound (E)|Music (M)|Fullscreen (F)'` → `'Sound E|Music M|Fullscreen F'`; `'Random seed (T)|Rooms (O)|Tutorial (U)|Scores (R)'` → `'Random seed T|Rooms O|Tutorial U|Scores R'`; `return text(ng) === 'New Game (n)';` → `return text(ng) === 'New Game n';`.
- `check('end-again', hasClass(again, 'btn-primary') && text(again) === 'Play again (N)', text(again));` → `check('end-again', hasClass(again, 'btn-primary') && text(again) === 'Play again N', text(again));`.
- In the tutorial block: `const tp = (over = {}) => ({ keyHint: (c, a) => (c === 'global' && a === 'tutorial' ? 'U' : ''), text: '', progress: '', skip: 'Skip tutorial (ESC)', onSkip: () => { skipped++; }, ...over });` → `const tp = (over = {}) => ({ keyHint: (c, a) => (c === 'global' && a === 'tutorial' ? 'U' : c === 'global' && a === 'escape' ? 'Esc' : ''), text: '', progress: '', skip: 'Skip tutorial', skipKey: 'global:escape', onSkip: () => { skipped++; }, ...over });`; `check('tutorial-skip-label-is-plain-text', text(btn) === 'Skip tutorial (ESC)' && byClass(btn, 'key').length === 0);` → `check('tutorial-skip-label-has-the-esc-chip', text(btn) === 'Skip tutorial Esc' && byClass(btn, 'key').length === 1);`; `renderTutorial(section, tp({ skip: 'Skip tutorial' }));` → `renderTutorial(section, tp({ skipKey: undefined }));`.

Run: `node --test test/ui.test.mjs`
Expected: FAIL on the chip texts.

- [ ] **Step 2: The components**

`src/ui/chrome.tsx`: add `import { KeyChip } from '../../../_kit/ui/key-chip.tsx';` after the `preact/hooks` import, and replace the `Key` doc comment and function with:

```tsx
/** A live key label. `at` is "context:action" or "context:action:n". A bare
 *  one is the key chip on a button: the kit's KeyChip as a dark keycap the
 *  CSS shows only where there is a mouse or trackpad, hidden from screen
 *  readers (the button's words are its name). Otherwise it is the plain key
 *  name inside a sentence, or a cap with its own classes (`cls`, as on the
 *  close button's Esc). */
export function Key({ at, bare, cls }: { at: string; bare?: boolean; cls?: string }) {
  const hint = useContext(KeyHints);
  const [ctx = '', action = '', idx] = at.split(':');
  const cap = hint(ctx, action, Number(idx ?? 0));
  if (bare) return <KeyChip label={cap} class="key" at={at} decorative />;
  return <span class={cls} data-keyhint={at}>{cap}</span>;
}
```

`src/ui/shop.tsx`: replace the `next` doc comment and field with

```tsx
  /** The start button: its words ("Start round 2", "Ready ✓" in a room), the
   *  key its chip names (none on touch screens), and `pressed`, set only in a
   *  room, where the button toggles and reads aria-pressed. */
  next: { label: string; keyAt?: string; pressed?: boolean };
```

and the button's children `onClick={blurThen(p.onNext)}>{p.next.label}</button>` with
`onClick={blurThen(p.onNext)}>{p.next.label}{p.next.keyAt && <>{' '}<Key at={p.next.keyAt} bare /></>}</button>`.

`src/ui/tutorial.tsx`: replace the `skip` field and its comment with

```tsx
  /** The Skip button's words. */
  skip: string;
  /** The key its chip names; none on touch screens. */
  skipKey?: string;
```

and the button with
`<button type="button" id="tutorial-skip" onClick={blurThen(p.onSkip)}>{p.skip}{p.skipKey && <>{' '}<Key at={p.skipKey} bare /></>}</button>`.

- [ ] **Step 3: The modules that built "(N)" strings**

`src/shop.ts`: in `ShopDeps` replace `keyCap(ctx: string, action: string): string;` with `/** A touch screen: no key chips. */` `touch: boolean;`; in the deps destructuring replace `keyCap` with `touch`; in `shopReadyView` replace `const label = \`Start round ${G.round + 1}${keyCap('shop', 'next')}\`;` and its return with

```ts
    const keyAt = touch ? undefined : 'shop:next';
    if (!net.on) {
      const label = `Start round ${G.round + 1}`;
      return { next: { label, keyAt }, readyLine: null, sig: label };
    }
```

(moving the `keyAt` line above the `if`), and `const label = \`${mine ? 'Ready ✓' : 'Ready'}${keyCap('shop', 'next')}\`;` and its return line with

```ts
    const label = mine ? 'Ready ✓' : 'Ready';
```
```ts
    return { next: { label, keyAt, pressed: mine }, readyLine: `${status} · ${marks}`, sig: label + '|' + status + '|' + marks };
```

Update the return type annotation to `{ next: { label: string; keyAt?: string; pressed?: boolean }; readyLine: string | null; sig: string }`.

`src/tutorial.ts`: remove `keyCap(ctx: string, action: string): string;` from `TutorialDeps` and `keyCap, ` from the destructuring; replace `skip: \`Skip tutorial${keyCap('global', 'escape')}\`,` with `skip: 'Skip tutorial',` `skipKey: TOUCH ? undefined : 'global:escape',`.

`src/main.ts`: delete the `keyCap` function and its comment; in the `createTutorial` deps remove `keyCap, `; in the `createShop` deps replace `keyCap, ` with `touch: TOUCH, `. Replace `renderKeyHints`'s body loop with

```ts
  document.querySelectorAll('[data-keyhint]').forEach(el => {
    if (el.closest && el.closest('[data-ui]')) return;
    const [kctx, kact, kidx] = (el.getAttribute('data-keyhint') || '').split(':');
    el.textContent = kctx !== undefined && kact !== undefined ? keyHint(kctx, kact, +(kidx || 0)) : '';
  });
```

and in `bindToolTips` replace `(key && !TOUCH ? \` ${key.textContent}\` : '')` with `(key && key.textContent && !TOUCH ? \` (${key.textContent})\` : '')` so a tip still reads "Pick any gun on your rack (G)".

- [ ] **Step 4: The page's own chips**

In `index.html`, every `<span class="key" data-keyhint="X">(Y)</span>` inside the toolbar buttons becomes `<kbd class="key" data-keyhint="X" aria-hidden="true">Y</kbd>`: `global:escape` → `Esc`, `global:fire` → `Space`, `global:guns` → `G`, `aim:driveLeft` → `Shift+←`, `aim:driveRight` → `Shift+→`, `global:log` → `L`, `global:nextTrack` → `]`, `global:help` → `H`. The pad note's `◀`, `▶`, `▲`, `▼` spans become `←`, `→`, `↑`, `↓`.

- [ ] **Step 5: One chip style**

In `game.css` delete these rules: `button .key { ... }` (with its comment "Key hints ride visibly inside their buttons."), `.tile-toggle .key { ... }`, `.guide-actions .tool .key { font-size: 0.7rem; ... }`, `.guide-actions .tool.btn-primary .key { ... }`, and `.guide-actions .tool .key { font-size: 0.62rem; ... }`. Add after the `button:disabled` rule:

```css
/* Key chips: one dark keycap on every button, its label centred in a fixed
   height. Only a mouse or trackpad means a keyboard is at hand, so only then
   do they show; narrow frames drop them too (the @container rules below). */
.key {
  display: none;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  height: 15px;
  padding: 1px 5px 0;
  font: 700 9px/1 system-ui, -apple-system, "Segoe UI", sans-serif;
  letter-spacing: 0.02em;
  color: #eef0ff;
  background: #14183a;
  border: 1px solid #3a3f78;
  border-bottom: 2px solid #000;
  border-radius: 4px;
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.15);
  white-space: nowrap;
  flex: none;
}
@media (hover: hover) and (pointer: fine) {
  .key { display: inline-flex; }
}
.key:empty { display: none; }
```

The existing `.touch .key, .touch .keys-only, .touch .nav-hint, .touch .pad-note { display: none; }` stays (it wins on touch screens by coming later).

- [ ] **Step 6: The smoke checks on markup and style**

In `test/smoke.test.mjs` replace

`check('key-hints', html.includes('data-keyhint="global:menu">(C)<') && html.includes('data-keyhint="global:fire">(Ctrl)<'));`
`check('key-style', /button \.key\s*\{[^}]*background/.test(css));`

with

`check('key-hints', html.includes('data-keyhint="global:escape" aria-hidden="true">Esc<') && html.includes('data-keyhint="global:fire" aria-hidden="true">Space<'));`
`check('key-style', /\n\.key\s*\{[^}]*background:\s*#14183a/.test(css) && /@media \(hover: hover\) and \(pointer: fine\)/.test(css));`

and in `check('shop-btn-hints', ...)` replace `=== '(V)'` with `=== 'V'` and `=== '(B)'` with `=== 'B'`.

- [ ] **Step 7: Build and run**

Run: `node ../_kit/build/build.mjs tankity && php tools/install-files.php && node --test test/ui.test.mjs test/smoke.test.mjs`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src index.html game.css dist sw.js test/ui.test.mjs test/smoke.test.mjs
git commit -m "Tankity key chips: one dark keycap from the key table, shown only with a fine pointer"
```

---

### Task 9: Help lists every key

**Files:**
- Create: `test/help.test.mjs`
- Modify: `src/ui/help.tsx`, `game.css`, `test/ui.test.mjs` (delete the help block)

**Interfaces:**
- Consumes: the kit's `importTsx(fromDir, modules)` (`games/_kit/test/tsx.ts`) and `games/_kit/test/dom-stub.mjs` (Plan B Task 5).
- Produces: `HELP_KEYS` (exported from `src/ui/help.tsx`): groups of `[ats: string[], what: string]`; the help's `.help-keys` section renders one `<Key cls="hk">` per `at`.

- [ ] **Step 1: Write the failing tests**

`test/help.test.mjs`:

```js
// The How to play overlay: every key in the shipped table is listed with its
// live cap, the prose for touch screens names no key, and a new table
// rewrites the list in place.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { document, makeEl, click } from '../../_kit/test/dom-stub.mjs';
import { importTsx } from '../../_kit/test/tsx.ts';
import { createInput } from '../src/input.ts';

globalThis.document = document;
const { help } = await importTsx(import.meta.dirname, { help: '../src/ui/help.tsx' });
const GAME = JSON.parse(fs.readFileSync(new URL('../game.json', import.meta.url), 'utf8'));
const input = createInput({ touch: false });
input.setKeys(GAME.keys);
const keyHint = (c, a, i) => input.hint(c, a, i);
const walk = (el, out = []) => { for (const c of el.children || []) { out.push(c); walk(c, out); } return out; };
const hasClass = (el, name) => String(el.className || '').split(' ').includes(name);

function draw(hint = keyHint) {
  const section = makeEl('help-overlay');
  const calls = { closed: 0 };
  help.renderHelp(section, { keyHint: hint, onClose: () => { calls.closed++; } });
  return { section, calls };
}
const keyList = section => walk(section).find(n => hasClass(n, 'help-keys'));
const capOf = (section, at) => walk(keyList(section)).find(n => n.getAttribute?.('data-keyhint') === at)?.textContent;

test('Help lists every action in the key table, and only those', () => {
  const { section } = draw();
  const listed = new Set(walk(keyList(section)).map(n => n.getAttribute?.('data-keyhint')).filter(Boolean)
    .map(at => at.split(':').slice(0, 2).join(':')));
  const bound = Object.entries(GAME.keys).flatMap(([ctx, actions]) => Object.keys(actions).map(a => `${ctx}:${a}`));
  assert.deepEqual([...listed].sort(), bound.sort());
});

test('each key shows its cap from the live table', () => {
  const { section } = draw();
  assert.equal(capOf(section, 'aim:driveLeft'), 'Shift+←');
  assert.equal(capOf(section, 'aim:barrelLeft'), '←');
  assert.equal(capOf(section, 'global:fire'), 'Space');
  assert.equal(capOf(section, 'global:escape'), 'Esc');
  assert.equal(capOf(section, 'shop:buyRow:0'), '1');
  assert.equal(capOf(section, 'shop:buyRow:8'), '9');
});

test('the key list is for keyboards; the touch prose names no key', () => {
  const { section } = draw();
  assert.ok(hasClass(keyList(section), 'keys-only'));
  const touch = walk(section).filter(n => hasClass(n, 'touch-only'));
  assert.ok(touch.length >= 1);
  for (const el of touch) assert.ok(walk(el).every(n => n.getAttribute?.('data-keyhint') === undefined));
});

test('the title bar closes the panel', () => {
  const { section, calls } = draw();
  click(walk(section).find(n => n.id === 'help-close'));
  assert.equal(calls.closed, 1);
});

test('a remapped table rewrites the list in place', () => {
  const section = makeEl('help-redraw');
  help.renderHelp(section, { keyHint, onClose() {} });
  const list = keyList(section);
  help.renderHelp(section, { keyHint: (c, a, i) => keyHint(c, a, i).toLowerCase(), onClose() {} });
  assert.equal(keyList(section), list);
  assert.equal(capOf(section, 'global:escape'), 'esc');
});
```

Run: `node --test test/help.test.mjs`
Expected: FAIL (no `.help-keys`).

- [ ] **Step 2: The help overlay**

Replace `src/ui/help.tsx` entirely with:

```tsx
/* The "How to play" overlay: how a match goes, then every key the game binds,
 * read from the live key table so a remapped game.json rewrites it. Touch
 * screens get the touch prose instead of the key list. The section element
 * (#help-overlay) stays in index.html and the game shows and hides it.
 * Copyright (C) 2026 William Grim
 * SPDX-License-Identifier: GPL-3.0-or-later */
import { Fragment, render } from 'preact';
import { KeyHints, Key, OverlayHead, ScrollKeys } from './chrome.tsx';
import type { KeyHintFn } from './chrome.tsx';

export interface HelpProps {
  /** The live key table (see KeyHintFn). */
  keyHint: KeyHintFn;
  /** The × button: the game closes the overlay. */
  onClose: () => void;
}

/** Every binding, grouped the way a player meets them: [keys, what they do].
 *  Two keys in one row read as a range ("1–9"). */
export const HELP_KEYS: readonly (readonly [string, readonly (readonly [readonly string[], string])[]])[] = [
  ['Aiming and firing', [
    [['aim:barrelLeft'], 'swing the barrel left'],
    [['aim:barrelRight'], 'swing the barrel right'],
    [['aim:powerUp'], 'more power'],
    [['aim:powerDown'], 'less power'],
    [['aim:driveLeft'], 'drive left (uses fuel)'],
    [['aim:driveRight'], 'drive right (uses fuel)'],
    [['global:fire'], 'fire and end your turn'],
    [['global:guns'], 'pick a weapon (a digit, or the arrows and Enter, loads one)'],
  ]],
  ['Panels and settings', [
    [['global:escape'], 'open the menu, or close whatever is open'],
    [['global:log'], 'the radio log'],
    [['global:help'], 'this help'],
    [['global:report'], 'the scores'],
    [['global:music'], 'music on or off'],
    [['global:nextTrack'], 'the next song'],
    [['global:sound'], 'sound effects on or off'],
    [['global:fullscreen'], 'fullscreen on or off'],
  ]],
  ['Matches', [
    [['global:new'], 'a new match on the seed box\'s hills (in the shop: start the round)'],
    [['global:random'], 'a new match on random hills'],
    [['global:rooms'], 'the game rooms'],
    [['global:tutorial'], 'the tutorial'],
    [['global:battlePreview'], 'the firing range'],
  ]],
  ['In the shop', [
    [['shop:selUp'], 'the row above'],
    [['shop:selDown'], 'the row below'],
    [['shop:qtyDown'], 'fewer packs'],
    [['shop:qtyUp'], 'more packs (never more than the chest covers)'],
    [['shop:buy'], 'buy the row'],
    [['shop:buyRow:0', 'shop:buyRow:8'], 'buy that row outright'],
    [['shop:preview'], 'try the row\'s gun on the firing range'],
    [['shop:next'], 'start the round (Ready, in a room)'],
    [['shop:close'], 'close the firing range or a panel, else open the menu'],
  ]],
  ['Scrolling a panel', [
    [['scroll:lineDown'], 'a line down'],
    [['scroll:lineUp'], 'a line up'],
    [['scroll:pageDown'], 'a page down'],
    [['scroll:pageUp'], 'a page up'],
    [['scroll:halfDown'], 'half a page down'],
    [['scroll:halfUp'], 'half a page up'],
  ]],
];

export function Help({ keyHint, onClose }: HelpProps) {
  return (
    <KeyHints.Provider value={keyHint}>
      <OverlayHead titleId="help-h" title="How to play" closeId="help-close" onClose={onClose}
        navId="nav-help" scrollOnly nav={<ScrollKeys line />} />
      <ul class="help">
        <li>
          Scorched-earth artillery: you and the drone battery take turns lobbing shells across destructible
          hills. Last one rolling wins the round.
        </li>
        <li class="touch-only">
          Hold <strong>◀ ▶</strong> to swing the barrel and <strong>▲ ▼</strong> for power.{' '}
          <strong>Drive</strong> moves while you have fuel. <strong>FIRE</strong> shoots and ends your
          turn. In the shop, tap a row's <strong>Buy</strong> or <strong>Preview</strong>.{' '}
          <strong>Menu</strong> holds the settings.
        </li>
        <li>
          <strong>Wind</strong> pushes every shell, so check it before you fire. <strong>Weapon</strong> opens
          every gun on your rack as tiles: Shell, Buckshot, Mortar, Rail, the round-4 <strong>NUKE</strong>, and
          more from the shop. Shells are free; the good stuff is bought with winnings, starting with a $600 stake
          you spend in the shop before round 1.
        </li>
        <li>
          There is no final victory. Every round the battery rebuilds with thicker armor, steadier aim, and
          deeper magazines. How many hills can you hold?
        </li>
        <li>
          Explosions carve craters and damage by distance. Direct hits pay double. You have{' '}
          <strong>3 lives</strong>; every 3000 points earns a <strong>1-up</strong> (max 5).
        </li>
        <li>
          The battery (<strong>Reaper</strong>, <strong>Wraith</strong>, <strong>Spotter</strong>) aims
          back, and gets steadier every round. Keep moving and mind the wind.
        </li>
        <li>
          <strong>Rooms</strong> lets friends share a hillside: host a room, read out the code, and take
          turns with the battery filling empty seats. Initials only, no chat, and the server settles every
          shot so nobody can fudge a hit. The host can pick named hills, and a rematch replays them without
          ever revealing the seed.
        </li>
        <li>
          Opening the page runs a demo battle behind the start. Every round gets its own name card before the
          shop and the shooting, and the camera pulls back as the battle spreads. Panels never pause the battle.
        </li>
      </ul>
      <div class="help-keys keys-only">
        {HELP_KEYS.map(([group, rows], g) => (
          <section key={group} aria-labelledby={`help-keys-${g}`}>
            <h3 id={`help-keys-${g}`}>{group}</h3>
            <dl>
              {rows.map(([ats, what]) => (
                <div key={ats.join()}>
                  <dt>{ats.map((at, i) => <Fragment key={at}>{i > 0 && '–'}<Key at={at} cls="hk" /></Fragment>)}</dt>
                  <dd>{what}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </KeyHints.Provider>
  );
}

/** Draws (or redraws, after the keys change) the help into its section. */
export function renderHelp(container: Element, props: HelpProps): void {
  render(<Help {...props} />, container);
}
```

Append to `game.css`:

```css
/* Help's key list: each key as a cap (always shown, unlike the button chips:
   the whole list is keyboard-only), its job beside it. */
.help-keys h3 { margin: 0.8rem 0 0.3rem; font-size: 0.85rem; color: var(--wash-key); }
.help-keys dl { display: grid; grid-template-columns: max-content 1fr; gap: 0.25rem 0.7rem; margin: 0; }
.help-keys dl > div { display: contents; }
.help-keys dt { white-space: nowrap; }
.help-keys dd { margin: 0; }
.hk {
  display: inline-flex; align-items: center; justify-content: center; height: 1.15rem; padding: 0 0.35rem;
  font: 700 0.72rem/1 system-ui, sans-serif; color: #eef0ff; background: #14183a;
  border: 1px solid #3a3f78; border-bottom: 2px solid #000; border-radius: 4px;
}
```

- [ ] **Step 3: Drop the old help block from `ui.test.mjs`**

In `test/ui.test.mjs` delete the block from `// ---- help ----` through its closing `}` (the line before `// ---- shop ----`), delete `const { renderHelp } = ui.help;`, and remove `'help', ` from the `UI` list.

- [ ] **Step 4: Run**

Run: `node ../_kit/build/build.mjs tankity && php tools/install-files.php && node --test test/help.test.mjs test/ui.test.mjs test/smoke.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/ui/help.tsx game.css dist sw.js index.html test/help.test.mjs test/ui.test.mjs
git commit -m "Tankity help: a key list built from the key table, every binding in it"
```

---

### Task 10: Browser specs follow the keys; PR 11

**Files:**
- Modify (all in `websites/www.cs/tests/e2e/`): `games-hub.spec.mjs`, `tankity-audio.spec.mjs`, `tankity-fx-battle.spec.mjs`, `tankity-overlays.spec.mjs`, `tankity-pickers.spec.mjs`, `tankity-rooms-play.spec.mjs`, `tankity-rooms-seats.spec.mjs`, `tankity-rooms.spec.mjs`, `tankity-solo.spec.mjs`, `tankity-touch.spec.mjs`, `tankity-toolbar.spec.mjs`

**Interfaces:**
- Consumes: Tasks 6–9 (Esc opens the menu, Shift+arrows drive, the picker loads guns, `Esc` caps).

- [ ] **Step 1: Every `C` becomes `Escape`**

Replace `keyboard.press('c')` with `keyboard.press('Escape')` at: `games-hub.spec.mjs` (the press before `#menu-overlay` is checked), `tankity-audio.spec.mjs` (the `press('c')` before `press('Escape')`), `tankity-pickers.spec.mjs` (in "menu toggles are icon tiles"), `tankity-overlays.spec.mjs` (in "text size is a menu setting" and both presses in "scrolled panels stay"), `tankity-rooms-play.spec.mjs` (host opens the menu), `tankity-rooms-seats.spec.mjs` (all three), `tankity-rooms.spec.mjs` (guest opens the menu), `tankity-solo.spec.mjs` (both in "the menu is a compact card" and "the unit picker", including `again.keyboard.press('c')`), `tankity-touch.spec.mjs`, `tankity-toolbar.spec.mjs`. In `tankity-touch.spec.mjs` change the comment `// Keys do nothing: C would open the menu.` to `// Keys do nothing: Esc would open the menu.` In `tankity-overlays.spec.mjs` replace `['c', 'menu-overlay', 'menu-close'],` with `['Escape', 'menu-overlay', 'menu-close'],`, the test title `'each panel has a title bar whose × closes it and shows ESC'` with `'each panel has a title bar whose × closes it and shows Esc'`, and `await expect(close).toContainText('ESC');` with `await expect(close).toContainText('Esc');`.

- [ ] **Step 2: Driving is Shift+arrow**

`tankity-solo.spec.mjs`, in "the keyboard drives the tank and burns fuel", replace the two `down/up('d')` and `down/up('a')` pairs with:

```js
  await page.keyboard.down('Shift');
  await page.keyboard.down('ArrowRight');
  await page.waitForTimeout(700);
  await page.keyboard.up('ArrowRight');
  await page.keyboard.down('ArrowLeft');
  await page.waitForTimeout(700);
  await page.keyboard.up('ArrowLeft');
  await page.keyboard.up('Shift');
```

`tankity-rooms.spec.mjs`, replace

```js
  await host.page.keyboard.down('d');
  await host.page.waitForTimeout(900);
  await host.page.keyboard.up('d');
```

with

```js
  await host.page.keyboard.down('Shift');
  await host.page.keyboard.down('ArrowRight');
  await host.page.waitForTimeout(900);
  await host.page.keyboard.up('ArrowRight');
  await host.page.keyboard.up('Shift');
```

- [ ] **Step 3: Weapons come from the picker, not Q**

`tankity-fx-battle.spec.mjs`, replace

```js
      // Q loads the next gun; stop on the one the HUD names first.
      for (let i = 0; i < 8 && !(await hud(page, 'hud-weapon')).trim().startsWith(W[key].name); i++) await page.keyboard.press('q');
```

with

```js
      // G opens the rack; a click on the gun's tile loads it.
      await page.keyboard.press('g');
      await page.locator('#gun-grid .gun-choice', { hasText: W[key].name }).first().click();
```

`tankity-pickers.spec.mjs`, replace `// Buy Buckshot, play on: Q cycles the loaded shell and the HUD icon follows.` with `// Buy Buckshot, play on: loading it from the picker changes the HUD icon.` and `await page.keyboard.press('q');` with

```js
  await page.keyboard.press('g');
  await page.keyboard.press('2'); // the rack's second tile: Buckshot
```

- [ ] **Step 4: Run the unit gate and two specs**

Run: `cd websites/www.cs && make test`
Expected: PASS.

Run: `make e2e E2E_ARGS="tankity-solo.spec.mjs tankity-overlays.spec.mjs"`
Expected: PASS (driving by Shift+arrows, Esc toggling the menu, the Esc caps).

- [ ] **Step 5: Commit and open PR 11**

```bash
git add websites/www.cs/tests/e2e
git commit -m "Specs: Esc opens the menu, Shift+arrows drive, guns load from the picker"
git push -u origin games/tankity-keys
gh pr create --fill --title "Tankity keys and key chips" --body-file - <<'BODY'
Spec row 11 (section 6.3): arrows aim, Shift+←/→ drive, Space or Ctrl fires, G weapons, Esc toggles the menu; W, A, S, D, Q and C are bound nowhere and weapon cycling is gone. game.yaml is the source and input.ts's fallback mirrors it. Key chips are one dark keycap read from the table, shown only with a fine pointer; Help lists every key.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb
BODY
```

If `main` moved, rebase and rebuild the generated files (Global Constraints: never hand-merge `dist/`, `sw.js`, `?v=` values or `game.json`). Run the pr-fix loop on the review comments, then gate, merge on green, wait for deploy (as in PR 10), then live-check with `cd websites/www.cs && E2E_BASE_URL=https://www.cs.siue.edu/~wgrim/ tests/e2e/run.sh tankity-overlays.spec.mjs` and report `https://www.cs.siue.edu/~wgrim/play/tankity/?v=<merged sha>`.

---

# PR 12: Tankity title card (with initials) and settings-only menu

Branch `games/tankity-title` (from `main` after PR 11). Spec row 12, sections 6.1, 6.4 (focus) and 8 (initials). Paths are in `websites/www.cs/games/tankity/` unless given in full.

### Task 11: Initials: three letters, one set per browser

**Files:**
- Create: `src/initials.ts` (DOM-free), `test/initials.test.mjs`
- Modify: `tsconfig.json` (add `"src/initials.ts"` to `files`), `src/lobby.ts` (use the shared rule), `test/smoke.test.mjs` (`blockedOf` finds the list in its new form)

**Interfaces:**
- Produces: `BLOCKED_INITIALS: readonly string[]`; `validInitials(raw: unknown): string | null` (three letters in either case → uppercase, null for anything else or a blocked word); `randomInitials(rng: Rng): string`; `initialsPref(storage: StorageLike | null, rng: Rng): Pref<string>` (key `tankity-initials`; a browser with none, or a bad stored value, gets random ones saved once).

- [ ] **Step 1: Write the failing tests**

`test/initials.test.mjs`:

```js
// A player's initials: the rule, the random first set, and storage that is
// empty, junk, or refuses to save.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validInitials, randomInitials, initialsPref, BLOCKED_INITIALS } from '../src/initials.ts';
import { mulberry32 } from '../../_kit/test/rng.ts';
import { memoryStorage, throwingStorage } from '../../_kit/test/record.ts';

test('three letters in either case come back uppercase; anything else is refused', () => {
  assert.equal(validInitials('abc'), 'ABC');
  assert.equal(validInitials('ZeD'), 'ZED');
  assert.equal(validInitials(' zed '), 'ZED');
  for (const bad of ['ab', 'abcd', 'a1c', '', 'äbc', null, undefined, 123]) assert.equal(validInitials(bad), null, String(bad));
});

test('blocked words are refused in any case', () => {
  assert.ok(BLOCKED_INITIALS.includes('ASS'));
  assert.equal(validInitials('ass'), null);
  assert.equal(validInitials('KkK'), null);
});

test('random initials are three uppercase letters and never a blocked word', () => {
  const rng = mulberry32(7);
  for (let i = 0; i < 2000; i++) {
    const s = randomInitials(rng);
    assert.match(s, /^[A-Z]{3}$/);
    assert.ok(!BLOCKED_INITIALS.includes(s), s);
  }
});

test('a generator stuck on a blocked word still ends, on a fixed set', () => {
  const k = (10 + 0.5) / 26; // always "K": KKK is blocked
  assert.equal(randomInitials(() => k), 'TNK');
});

test('a browser with none gets random initials, saved once', () => {
  const storage = memoryStorage();
  const first = initialsPref(storage, mulberry32(1)).get();
  assert.match(first, /^[A-Z]{3}$/);
  assert.equal(storage.getItem('tankity-initials'), first);
  assert.equal(initialsPref(storage, mulberry32(2)).get(), first);
});

test('saved initials come back uppercase; junk or a blocked word is replaced', () => {
  assert.equal(initialsPref(memoryStorage({ 'tankity-initials': 'zed' }), mulberry32(1)).get(), 'ZED');
  for (const junk of ['a1', 'ass', '{"x":1}']) {
    const storage = memoryStorage({ 'tankity-initials': junk });
    const got = initialsPref(storage, mulberry32(3)).get();
    assert.match(got, /^[A-Z]{3}$/);
    assert.equal(storage.getItem('tankity-initials'), got);
  }
});

test('storage that throws still gives initials for the session', () => {
  const p = initialsPref(throwingStorage(), mulberry32(4));
  const got = p.get();
  assert.match(got, /^[A-Z]{3}$/);
  p.set('ZED');
  assert.equal(p.get(), 'ZED');
});
```

Run: `node --test test/initials.test.mjs`
Expected: FAIL (module missing).

- [ ] **Step 2: Implement**

`src/initials.ts`:

```ts
/* Operation Tankity: a player's three-letter initials.
 *
 * One set per browser, shared by solo and rooms: exactly three letters, shown
 * uppercase, never a blocked word (the list mirrors the score server's). A
 * browser that never chose any gets three random letters, saved once. */
import { pref } from '../../_kit/prefs.ts';
import type { Codec, Pref } from '../../_kit/prefs.ts';
import type { Rng, StorageLike } from '../../_kit/ports.ts';

export const BLOCKED_INITIALS = Object.freeze([
  'ASS',
  'FUK', 'FUC', 'FCK', 'FUX', 'FUQ',
  'SHT', 'SHI',
  'DIK', 'DIC', 'DCK',
  'COK', 'COC', 'COQ',
  'CUM', 'JIZ',
  'CNT', 'PUS', 'VAG', 'CLT',
  'SEX', 'XXX', 'TIT',
  'FAG', 'FGT',
  'NIG', 'NGR',
  'WTF', 'FFS',
  'POO', 'PEE',
  'KKK',
]);

/** Three letters in either case, as uppercase; null for anything else or a blocked word. */
export function validInitials(raw: unknown): string | null {
  const s = String(raw ?? '').trim();
  if (!/^[A-Za-z]{3}$/.test(s)) return null;
  const up = s.toUpperCase();
  return BLOCKED_INITIALS.includes(up) ? null : up;
}

/** Three random letters that are not a blocked word. A generator that keeps
 *  landing on one gives up after a while rather than spinning. */
export function randomInitials(rng: Rng): string {
  for (let tries = 0; tries < 64; tries++) {
    const s = Array.from({ length: 3 }, () => String.fromCharCode(65 + Math.floor(rng() * 26))).join('');
    if (!BLOCKED_INITIALS.includes(s)) return s;
  }
  return 'TNK';
}

const INITIALS: Codec<string> = {
  parse(raw) {
    const v = validInitials(raw);
    if (v === null) throw new Error('not initials');
    return v;
  },
  stringify: v => v,
};

/** The saved initials. A browser with none, or with a value that is not valid
 *  initials, gets random ones now and keeps them. */
export function initialsPref(storage: StorageLike | null, rng: Rng): Pref<string> {
  const p = pref('tankity-initials', '', INITIALS, storage);
  if (p.get() === '') p.set(randomInitials(rng));
  return p;
}
```

Add `"src/initials.ts"` to the `files` list in `tsconfig.json`.

- [ ] **Step 3: The lobby and the smoke test's parity check use the shared list**

`test/smoke.test.mjs`'s `blocked-parity` check compares the client's list with the server's by reading `BLOCKED_INITIALS = [` up to `];`; the list now reads `BLOCKED_INITIALS = Object.freeze([` and ends `]);`. In its `blockedOf`, replace

```js
  const start = src.indexOf('BLOCKED_INITIALS = [');
  const end = src.indexOf('];', start);
```

with

```js
  const start = src.search(/BLOCKED_INITIALS = (Object\.freeze\()?\[/);
  const end = src.indexOf(']', start);
```

`src/lobby.ts`: add `import { validInitials } from './initials.ts';` with the other imports, and replace the block from `// The clean-initials rule mirrors rooms.php (which borrows it from the cylon` through the end of `function netValidInitials(...) { ... }` with:

```ts
  /* Room initials keep the case the player typed (rooms.php compares them
     uppercase); src/initials.ts holds the rule and the blocked words. */
  function netValidInitials(raw: unknown): string | null {
    return validInitials(raw) === null ? null : String(raw).trim();
  }
```

- [ ] **Step 4: Run**

Run: `node --test test/initials.test.mjs test/smoke.test.mjs && node ../_kit/build/build.mjs tankity`
Expected: PASS; the build type-checks clean.

- [ ] **Step 5: Commit**

```bash
git add src/initials.ts src/lobby.ts tsconfig.json test/initials.test.mjs test/smoke.test.mjs dist
git commit -m "Tankity initials: one rule and one saved set per browser, random until chosen"
```

---

### Task 12: The title card component

**Files:**
- Create: `src/ui/title.tsx`, `test/title.test.mjs`
- Modify: `src/tsconfig.dom.json` (add `"ui/title.tsx"` to `files`)

**Interfaces:**
- Consumes: the kit's `Dialog` (`games/_kit/ui/dialog.tsx`, Plan B Task 6); `Key` from `./chrome.tsx` (Task 8, a kit `KeyChip` with class `key`); `importTsx` and `dom-stub.mjs` from `games/_kit/test/` (Plan B Task 5).
- Produces: `renderTitle(container: Element, props: TitleProps): void` with
  `TitleProps = { keyHint; open: boolean; initials: string; problem: string; settingsOpen: boolean; onInitials(word: string): void; onPlay(): void; onFriends(): void; onTutorial(): void; onSettings(): void }`.
  The kit `Dialog` renders the veil `#title-card` (class `title-veil`, `hidden` while closed) around the panel `.title-card` (`role="dialog"`, `aria-modal="true"`, labelled by `#title-h`, described by `#title-tag`); on opening it focuses `#title-play`, on closing it gives focus back. No `onDismiss`: Esc opens the settings menu over the card and never closes it.
  Ids the page and specs use: `#title-card`, `#title-h`, `#title-play`, `#rooms-open` (Play with friends), `#tutorial-open`, `#title-settings`, `#title-initial-1..3`, `#title-initials-note`.

- [ ] **Step 1: Write the failing tests**

`test/title.test.mjs`:

```js
// The title card: the kit dialog with its buttons, the initials boxes that
// show the saved letters and report a typed set uppercase, and Settings
// saying whether the menu is open.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { document, makeEl, click, fire } from '../../_kit/test/dom-stub.mjs';
import { importTsx } from '../../_kit/test/tsx.ts';

globalThis.document = document;
const { title } = await importTsx(import.meta.dirname, { title: '../src/ui/title.tsx' });
const walk = (el, out = []) => { for (const c of el.children || []) { out.push(c); walk(c, out); } return out; };
const byId = (el, id) => walk(el).find(n => n.id === id);
const KEYS = { 'global:new': 'N', 'global:rooms': 'O', 'global:tutorial': 'U', 'global:escape': 'Esc' };

function draw(over = {}) {
  const root = makeEl('title-root');
  const calls = { initials: [], play: 0, friends: 0, tutorial: 0, settings: 0 };
  const props = {
    keyHint: (c, a) => KEYS[`${c}:${a}`] ?? '', open: true, initials: 'BDJ', problem: '', settingsOpen: false,
    onInitials: w => calls.initials.push(w), onPlay: () => { calls.play++; }, onFriends: () => { calls.friends++; },
    onTutorial: () => { calls.tutorial++; }, onSettings: () => { calls.settings++; }, ...over,
  };
  title.renderTitle(root, props);
  return { root, calls, props };
}
const type = (box, value) => { box.value = value; fire(box, 'input'); };

test('the card is the kit dialog: a veil around a panel labelled and described by its own text', () => {
  const { root } = draw();
  const veil = byId(root, 'title-card');
  assert.equal(veil.className, 'title-veil');
  assert.equal(veil.hidden, false);
  const card = veil.children[0];
  assert.equal(card.className, 'title-card');
  assert.equal(card.getAttribute('role'), 'dialog');
  assert.equal(card.getAttribute('aria-modal'), 'true');
  assert.equal(card.getAttribute('aria-labelledby'), 'title-h');
  assert.equal(card.getAttribute('aria-describedby'), 'title-tag');
  assert.equal(byId(root, 'title-h').textContent, 'Operation Tankity');
});

test('Play, Play with friends, Tutorial and Settings, each with its key chip', () => {
  const { root } = draw();
  assert.match(byId(root, 'title-play').textContent, /^▶ Play/);
  assert.match(byId(root, 'rooms-open').textContent, /^Play with friends/);
  assert.match(byId(root, 'tutorial-open').textContent, /^Tutorial/);
  assert.match(byId(root, 'title-settings').textContent, /^Settings/);
  const chip = walk(byId(root, 'title-play')).find(n => n.localName === 'kbd');
  assert.equal(chip.className, 'key');
  assert.equal(chip.getAttribute('data-keyhint'), 'global:new');
  assert.equal(chip.getAttribute('aria-hidden'), 'true');
  assert.equal(chip.textContent, 'N');
});

test('a closed card stays in the page, hidden; opening it focuses Play', () => {
  const { root, props } = draw({ open: false });
  assert.equal(byId(root, 'title-card').hidden, true);
  globalThis.__focused = null;
  title.renderTitle(root, { ...props, open: true });
  assert.equal(byId(root, 'title-card').hidden, false);
  assert.equal(globalThis.__focused?.id, 'title-play');
});

test('every button reports to the game', () => {
  const { root, calls } = draw();
  for (const id of ['title-play', 'rooms-open', 'tutorial-open', 'title-settings']) click(byId(root, id));
  assert.deepEqual([calls.play, calls.friends, calls.tutorial, calls.settings], [1, 1, 1, 1]);
});

test('the boxes show the saved initials, one letter each', () => {
  const { root } = draw({ initials: 'ZED' });
  assert.deepEqual([1, 2, 3].map(n => byId(root, `title-initial-${n}`).value), ['Z', 'E', 'D']);
  assert.equal(byId(root, 'title-initial-1').getAttribute('aria-label'), 'Initial 1 of 3');
});

test('typed letters show uppercase and a full set is reported; a non-letter is dropped', () => {
  const { root, calls } = draw();
  const [a, b, c] = [1, 2, 3].map(n => byId(root, `title-initial-${n}`));
  type(a, 'z');
  assert.equal(a.value, 'Z');
  type(b, '1');
  assert.equal(b.value, '');
  assert.deepEqual(calls.initials, []);
  type(b, 'e');
  type(c, 'd');
  assert.deepEqual(calls.initials, ['ZED']);
});

test('a refused set says why, and Settings follows the menu', () => {
  const { root } = draw({ problem: 'Those initials are not allowed. Pick others.', settingsOpen: true });
  assert.equal(byId(root, 'title-initials-note').textContent, 'Those initials are not allowed. Pick others.');
  assert.equal(byId(root, 'title-initials-note').getAttribute('role'), 'status');
  assert.equal(byId(root, 'title-settings').getAttribute('aria-expanded'), 'true');
});
```

Run: `node --test test/title.test.mjs`
Expected: FAIL (component missing).

- [ ] **Step 2: Implement**

`src/ui/title.tsx`:

```tsx
/* The title card over the dimmed demo, on the kit's Dialog: Play, Play with
 * friends, Tutorial, a Settings link, and the three-letter initials. The game
 * owns whether it shows, the initials and what each button does; this draws
 * them and reports. Its mount point (#title-root) stays in index.html.
 * Copyright (C) 2026 William Grim
 * SPDX-License-Identifier: GPL-3.0-or-later */
import { render } from 'preact';
import { useRef } from 'preact/hooks';
import { Dialog } from '../../../_kit/ui/dialog.tsx';
import { KeyHints, Key, blurThen } from './chrome.tsx';
import type { KeyHintFn } from './chrome.tsx';

export interface TitleProps {
  keyHint: KeyHintFn;
  /** The card shows; the demo plays dimmed behind it. */
  open: boolean;
  /** The saved initials, three uppercase letters. */
  initials: string;
  /** Why the last typed set was refused, or empty. */
  problem: string;
  /** The menu is open (the Settings link's aria-expanded). */
  settingsOpen: boolean;
  /** All three boxes hold a letter: the set, uppercase. The game checks it. */
  onInitials: (word: string) => void;
  onPlay: () => void;
  onFriends: () => void;
  onTutorial: () => void;
  onSettings: () => void;
}

function InitialsPicker({ initials, onInitials }: Pick<TitleProps, 'initials' | 'onInitials'>) {
  const boxes = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];
  function typed(i: number, ev: Event): void {
    const box = ev.currentTarget as HTMLInputElement;
    // One letter per box, shown uppercase whatever case was typed.
    const letter = box.value.replace(/[^A-Za-z]/g, '').slice(-1).toUpperCase();
    box.value = letter;
    if (!letter) return;
    const next = boxes[i + 1]?.current;
    if (next) {
      next.focus?.();
      next.select?.();
    }
    const word = boxes.map(b => b.current?.value ?? '').join('');
    if (/^[A-Z]{3}$/.test(word)) onInitials(word);
  }
  return (
    <fieldset class="initials">
      <legend>Your initials</legend>
      {[0, 1, 2].map(i => (
        <input key={i} ref={boxes[i]} id={`title-initial-${i + 1}`} class="initial" type="text" inputMode="text"
          autocomplete="off" spellcheck={false} maxLength={1} aria-label={`Initial ${i + 1} of 3`}
          value={initials[i] ?? ''} onInput={ev => typed(i, ev)}
          onFocus={ev => (ev.currentTarget as HTMLInputElement).select?.()} />
      ))}
    </fieldset>
  );
}

export function Title(p: TitleProps) {
  // No onDismiss: Esc opens the settings menu over the card, never closes it.
  return (
    <KeyHints.Provider value={p.keyHint}>
      <Dialog open={p.open} id="title-card" veilClass="title-veil" panelClass="title-card" titleId="title-h"
        title="Operation Tankity" describedBy="title-tag" focusId="title-play">
        <p id="title-tag" class="title-tag">Mind the wind. Flatten the drone battery.</p>
        <button type="button" id="title-play" class="title-play btn-primary" onClick={blurThen(p.onPlay)}>
          <span aria-hidden="true">▶ </span>Play <Key at="global:new" bare />
        </button>
        <div class="title-row">
          <button type="button" id="rooms-open" onClick={blurThen(p.onFriends)}>Play with friends <Key at="global:rooms" bare /></button>
          <button type="button" id="tutorial-open" onClick={blurThen(p.onTutorial)}>Tutorial <Key at="global:tutorial" bare /></button>
        </div>
        <InitialsPicker initials={p.initials} onInitials={p.onInitials} />
        <p class="title-note" id="title-initials-note" role="status">{p.problem}</p>
        <button type="button" id="title-settings" class="title-link" aria-haspopup="dialog" aria-expanded={p.settingsOpen}
          onClick={blurThen(p.onSettings)}>Settings <Key at="global:escape" bare /></button>
      </Dialog>
    </KeyHints.Provider>
  );
}

/** Draws (or redraws) the title card into its mount point. */
export function renderTitle(container: Element, props: TitleProps): void {
  render(<Title {...props} />, container);
}
```

Add `"ui/title.tsx"` to `src/tsconfig.dom.json`'s `files` (after `"ui/leave.tsx"`).

- [ ] **Step 3: Run**

Run: `node --test test/title.test.mjs`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/ui/title.tsx src/tsconfig.dom.json test/title.test.mjs
git commit -m "Tankity title card component on the kit Dialog: Play, friends, tutorial, settings and initials"
```

---

### Task 13: The card on the page: over the demo at load, after a match, after a room

**Files:**
- Create: `src/title.ts`
- Modify: `src/main.ts`, `src/input.ts` (`InputContext.cardOpen`, `KeyLike.target`), `src/match.ts`, `src/lobby.ts`, `src/ui/lobby.tsx` (no initials boxes), `src/ui/endveil.tsx`, `index.html`, `game.css`, `src/tsconfig.dom.json` (add `"title.ts"`)
- Modify: `test/keys.test.mjs` (card tests), `test/ui.test.mjs` (end veil label, lobby block), `test/smoke.test.mjs`

**Interfaces:**
- Consumes: `initialsPref`, `validInitials` (Task 11); `renderTitle` (Task 12).
- Produces: `createTitle(deps: TitleDeps)` returning `{ titleOpen(): boolean; openTitle(): void; closeTitle(): void; renderTitle(): void }`, with `TitleDeps = { $; keyHint; initials: Pref<string>; play(); friends(); tutorial(); settings(); settingsOpen(): boolean }`. `main.ts`'s `savedInitials` (the one `initialsPref(browserStorage(), Math.random)`) and `getInitials(): string` (its value: the player's three uppercase letters, shared by the title card, the rooms and, in Plan D, filed scores), and `backToTitle()` (close panels, restart the demo, open the card). `InputContext.cardOpen?(): boolean`. `MatchDeps.backToTitle` replaces `MatchDeps.freshMatchFromSeedBox`; `LobbyDeps` gains `closeTitle`, `backToTitle` and `savedInitials(): string` and loses `freshMatchFromSeedBox`. `LobbyProps.onHost` becomes `() => void`, `onJoin` becomes `(code: string) => void`, and `LobbyProps.initials: string` is shown in `#lobby-initials`; `#host-initials` and `#join-initials` are gone (spec section 8: one set of initials, shared by solo and rooms). The end veil's solo button reads **Continue** and returns to the card.

- [ ] **Step 1: Write the failing input tests**

Append to `test/keys.test.mjs`:

```js
test('card: Space presses the focused card button, never fires, never scrolls', () => {
  const input = rig();
  const calls = [];
  input.register({ fire: () => { calls.push('fire'); } }, { cardOpen: () => true });
  let clicked = 0, prevented = 0;
  input.keydown({ ...ev({ code: 'Space', key: ' ' }), target: { tagName: 'BUTTON', click: () => { clicked++; } }, preventDefault: () => { prevented++; } });
  assert.equal(clicked, 1);
  assert.equal(prevented, 1);
  assert.deepEqual(calls, []);
});

test('card: the aim keys hold nothing, and the letter keys still reach their commands', () => {
  const input = rig();
  const calls = [];
  const log = name => () => { calls.push(name); };
  input.register({ new: log('new'), rooms: log('rooms'), escape: log('escape') }, { cardOpen: () => true });
  input.keydown(arrowLeft());
  assert.ok(!input.held.has('barrelLeft'));
  for (const [code, key] of [['KeyN', 'n'], ['KeyO', 'o'], ['Escape', 'Escape']]) input.keydown(ev({ code, key }));
  assert.deepEqual(calls, ['new', 'rooms', 'escape']);
});

test('card: with no button focused, the fire key reaches the game (which explains the demo)', () => {
  const input = rig();
  const calls = [];
  input.register({ fire: () => { calls.push('fire'); } }, { cardOpen: () => true });
  input.keydown(ev({ code: 'Space', key: ' ' }));
  assert.deepEqual(calls, ['fire']);
});
```

Run: `node --test test/keys.test.mjs`
Expected: FAIL (the card tests).

- [ ] **Step 2: `input.ts`**

In `KeyLike`, replace `target?: { tagName?: string } | null;` with `target?: { tagName?: string; click?(): void } | null;`. In `InputContext`, add after `modalEscape?(): void;`:

```ts
  /** The title card is up: the aim keys rest, and Space or Ctrl presses the card's focused button. */
  cardOpen?(): boolean;
```

In `keydown`, replace

```ts
    const act = lookup('aim', e) as HoldCommand | null;
    if (act) {
```

with

```ts
    const act = lookup('aim', e) as HoldCommand | null;
    if (act && ctx.cardOpen && ctx.cardOpen()) return;
    if (act) {
```

and replace the fire block

```ts
    if (global === 'fire') {
      e.preventDefault();
      const fn = commands.fire;
      if (fn && !press.repeat) fn(press);
      return;
    }
```

with

```ts
    if (global === 'fire') {
      e.preventDefault();
      // On the title card Space and Ctrl press the focused button; their own
      // default is the page scroll suppressed just above.
      const target = e.target;
      if (ctx.cardOpen && ctx.cardOpen() && target && target.tagName === 'BUTTON' && target.click) {
        if (!press.repeat) target.click();
        return;
      }
      const fn = commands.fire;
      if (fn && !press.repeat) fn(press);
      return;
    }
```

Run: `node --test test/keys.test.mjs test/input.test.mjs`
Expected: PASS.

- [ ] **Step 3: `src/title.ts`**

```ts
/* Operation Tankity: the title card over the demo.
 *
 * Whether the card shows, the initials it edits, and its props; the card
 * itself is src/ui/title.tsx on the kit's Dialog, which moves focus. What its
 * buttons do (a solo match, the rooms, the tutorial, the menu) arrives as deps. */
import { validInitials } from './initials.ts';
import type { Pref } from '../../_kit/prefs.ts';
import { renderTitle as drawTitle } from './ui/title.tsx';
import type { KeyHintFn } from './ui/chrome.tsx';

export interface TitleDeps {
  $(id: string): HTMLElement | null;
  keyHint: KeyHintFn;
  /** The player's saved initials (main.ts's savedInitials), shared with the rooms. */
  initials: Pref<string>;
  play(): void;
  friends(): void;
  tutorial(): void;
  settings(): void;
  settingsOpen(): boolean;
}

export function createTitle(deps: TitleDeps) {
  const { $, keyHint, initials, play, friends, tutorial, settings, settingsOpen } = deps;
  let open = false;
  let problem = '';

  function titleOpen(): boolean {
    return open;
  }
  function chooseInitials(word: string): void {
    const ok = validInitials(word);
    if (ok === null) problem = 'Those initials are not allowed. Pick others.';
    else {
      problem = '';
      initials.set(ok);
    }
    renderTitle();
  }
  function renderTitle(): void {
    const el = $('title-root');
    if (!el) return;
    drawTitle(el, {
      keyHint, open, initials: initials.get(), problem, settingsOpen: settingsOpen(),
      onInitials: chooseInitials, onPlay: play, onFriends: friends, onTutorial: tutorial, onSettings: settings,
    });
  }
  /* The Dialog focuses Play as the card shows, so a keyboard player lands on it. */
  function openTitle(): void {
    problem = '';
    open = true;
    renderTitle();
  }
  function closeTitle(): void {
    if (!open) return;
    open = false;
    renderTitle();
  }

  return { titleOpen, openTitle, closeTitle, renderTitle };
}
```

Add `"title.ts"` to `src/tsconfig.dom.json`'s `files` (after `"menu.ts"`).

- [ ] **Step 4: Wire it into `main.ts`**

1. Imports: add `import { createTitle } from './title.ts';` after `import { createMenu } from './menu.ts';`, and `import { initialsPref } from './initials.ts';` after `import { difficultySetting } from './difficulty.ts';`.
2. After the line `const difficulty = difficultySetting(browserStorage());` add:

```ts
/* The player's initials (src/initials.ts): one set per browser, edited on the
   title card; the rooms host and join with it, and filed scores carry it. */
const savedInitials = initialsPref(browserStorage(), Math.random);
const getInitials = (): string => savedInitials.get();
```

3. In the `createMatch({...})` call replace `tutorialFired, fileReport, savedCallsign, freshMatchFromSeedBox,` with `tutorialFired, fileReport, savedCallsign, backToTitle: () => backToTitle(),`.
4. In the `createLobby({...})` call replace `closeOverlays, closePreview, endTutorial, freshMatchFromSeedBox, hideShop,` with `closeOverlays, closePreview, endTutorial, hideShop, savedInitials: getInitials,` and add the line `closeTitle: () => closeTitle(), backToTitle: () => backToTitle(),` after `renderMenu: () => renderMenu(),`.
5. After the `createMenu({...})` call, add:

```ts
/* The title card over the demo (src/title.ts). */
const { titleOpen, openTitle, closeTitle, renderTitle } = createTitle({
  $, keyHint, initials: savedInitials,
  play: () => { unlock(); sfx.play('click'); randomRun(); },
  friends: () => openRooms(),
  tutorial: () => { sfx.play('click'); tutorialOpen(); },
  settings: () => { const mv = $('menu-overlay'); if (mv && mv.hidden) toggleOverlay('menu-overlay', 'btn-menu'); },
  settingsOpen: () => { const mv = $('menu-overlay'); return !!mv && !mv.hidden; },
});
/* After a match or a room: the demo again, under the card. */
function backToTitle(): void {
  closeOverlays();
  startDemo();
  openTitle();
}
```

6. In `freshMatchFromSeedBox`, after `closeOverlays();` add `closeTitle();`.
7. In `applyKeys`, add `renderTitle();` after `renderMenu();`.
8. In `bindKeys`'s context object, add `cardOpen: () => titleOpen(),` after `modalEscape: () => { closeLeaveVeil(); },`.
9. In `init()`, after `startDemo();` add `openTitle();`.
10. Replace `toggleOverlay` with:

```ts
function toggleOverlay(id: string, btnId?: string): void {
  const ov = $(id);
  if (!ov) return;
  ov.hidden = !ov.hidden;
  if (OVERLAY_PAINT[id]) OVERLAY_PAINT[id]();
  const btn = btnId && $(btnId);
  if (btn) btn.setAttribute('aria-expanded', String(!ov.hidden));
  if (id === 'menu-overlay') menuFocus(!ov.hidden);
  refreshNavHints();
}
/* Focus goes into the menu when it opens, and back to what opens it when it
   closes: the card's Settings while the card is up, else the Menu button. */
function menuFocus(open: boolean): void {
  renderTitle();
  const to = open ? $('menu-close') : titleOpen() ? $('title-settings') : $('btn-menu');
  if (to && to.focus) to.focus();
}
```

- [ ] **Step 5: The match, the lobby and the end veil**

`src/match.ts`: in `MatchDeps` replace `freshMatchFromSeedBox(opts?: { tut?: boolean }): void;` with `/** Back to the title card over a fresh demo. */` `backToTitle(): void;`; in the destructuring replace `freshMatchFromSeedBox, ` with `backToTitle, `; replace `onAgain: () => { if (net.on) { netLeave(); openLobby(); } else freshMatchFromSeedBox(); },` with `onAgain: () => { if (net.on) { netLeave(); openLobby(); } else backToTitle(); },`. Replace the demo lines:
`newRound(\`Demo mode. Press New Game${TOUCH ? '' : \` (or ${keyHint('global', 'new')})\`} to play.\`);` → `newRound(\`Demo mode. Press Play${TOUCH ? '' : \` (or ${keyHint('global', 'new')})\`} to start.\`);`
and in `demoBlock` `say(\`Demo mode. Press New Game${TOUCH ? '' : \` (or ${keyHint('global', 'new')})\`} to take the controls.\`, 'info');` → `say(\`Demo mode. Press Play${TOUCH ? '' : \` (or ${keyHint('global', 'new')})\`} to take the controls.\`, 'info');`.

`src/lobby.ts`: in `LobbyDeps` replace `freshMatchFromSeedBox(opts?: { tut?: boolean }): void;` with

```ts
  /** Hide the title card: a room match is starting. */
  closeTitle(): void;
  /** Back to the title card over a fresh demo. */
  backToTitle(): void;
```

in the destructuring replace `freshMatchFromSeedBox, ` with `closeTitle, backToTitle, `; in `startNetMatch` add `closeTitle();` after `endTutorial(false);`; in `netLeave` replace

```ts
      say('Back to the solo hills. The battery takes your seat in the room.', 'info');
      freshMatchFromSeedBox();
```

with

```ts
      say('Back from the room. The battery takes your seat there.', 'info');
      backToTitle();
```

The rooms use the saved initials (spec section 8: one set, shared by solo and rooms). In `src/lobby.ts`, add to `LobbyDeps` after the `backToTitle(): void;` just added:

```ts
  /** The player's saved initials (the title card's); rooms host and join with them. */
  savedInitials(): string;
```

add `savedInitials, ` after `closeTitle, backToTitle, ` in the destructuring, and in `renderLobby` replace the `onHost` and `onJoin` entries

```ts
      onHost: raw => {
        const v = netValidInitials(raw);
        if (!v) { lobbySay('Initials need exactly 3 letters, and keep them clean.'); return; }
        unlock(); sfx.play('click');
        hostRoom(v, LOBBY.mapId);
      },
      onJoin: (rawCode, raw) => {
        const code = rawCode.trim().toUpperCase();
        const v = netValidInitials(raw);
        if (!/^[A-Z0-9]{4}$/.test(code)) { lobbySay('Room codes are 4 letters or digits. Read it back and retry.'); return; }
        if (!v) { lobbySay('Initials need exactly 3 letters, and keep them clean.'); return; }
        unlock(); sfx.play('click');
        joinRoom(code, v);
      },
```

with

```ts
      initials: savedInitials(),
      onHost: () => {
        unlock(); sfx.play('click');
        hostRoom(savedInitials(), LOBBY.mapId);
      },
      onJoin: rawCode => {
        const code = rawCode.trim().toUpperCase();
        if (!/^[A-Z0-9]{4}$/.test(code)) { lobbySay('Room codes are 4 letters or digits. Read it back and retry.'); return; }
        unlock(); sfx.play('click');
        joinRoom(code, savedInitials());
      },
```

and in the `LOBBY` comment replace `(code, link, hills, seats). The initials and code boxes stay the page's own. */` with `(code, link, hills, seats). The code box stays the page's own. */`.

`src/ui/lobby.tsx`:

1. Header: replace ` * The initials and room-code boxes are the one thing the page keeps: what the` / ` * player typed lives in the input, and is handed over on submit.` with ` * The room-code box is the one thing the page keeps: what the player typed` / ` * lives in the input, and is handed over on submit. Initials come from the title card.`
2. In `LobbyProps` replace

```tsx
  onHost: (initials: string) => void;
  onJoin: (code: string, initials: string) => void;
```

with

```tsx
  /** The player's saved initials, set on the title card. */
  initials: string;
  onHost: () => void;
  onJoin: (code: string) => void;
```

3. In `Lobby`, delete `const hostInitials = useRef<HTMLInputElement>(null);` and `const joinInitials = useRef<HTMLInputElement>(null);`.
4. In `#lobby-intro`, replace `Everyone picks 3-letter initials (kept clean, lowercase is fine). There is no chat,` with `Everyone plays under the initials on their title card. There is no chat,`.
5. Directly before `<div class="lobby-rows" id="lobby-rows" hidden={p.inRoom}>` add

```tsx
        <p class="hint" id="lobby-initials" hidden={p.inRoom}>
          You play as <strong>{p.initials}</strong>. Change your initials on the title card.
        </p>
```

6. Replace `onSubmit={ev => { ev.preventDefault(); p.onHost(hostInitials.current?.value ?? ''); }}>` with `onSubmit={ev => { ev.preventDefault(); p.onHost(); }}>`, and `onSubmit={ev => { ev.preventDefault(); p.onJoin(joinCode.current?.value ?? '', joinInitials.current?.value ?? ''); }}>` with `onSubmit={ev => { ev.preventDefault(); p.onJoin(joinCode.current?.value ?? ''); }}>`.
7. Delete both initials label/input pairs: `<label for="host-initials">Your initials</label>` with its `<input id="host-initials" ... ref={hostInitials} />` (two lines), and `<label for="join-initials">Your initials</label>` with its `<input id="join-initials" ... ref={joinInitials} />` (two lines).

`test/ui.test.mjs`, lobby block: in `lobbyProps` replace `onHost: i => calls.host.push(i), onJoin: (c, i) => calls.join.push([c, i]),` with `initials: 'ZED', onHost: () => calls.host.push('host'), onJoin: c => calls.join.push(c),`; replace everything from `// The host form: initials as typed, on submit.` through the `check('lobby-redraw-keeps-typing', ...)` line with:

```js
  // The forms carry no initials: the rooms use the set saved on the title card.
  submit(byId(card, 'host-form'));
  check('lobby-host-submit', calls.host.length === 1 && hasClass(byId(card, 'host-go'), 'btn-primary') && text(byId(card, 'host-go')) === 'Host a room');
  check('lobby-no-initials-boxes', !byId(card, 'host-initials') && !byId(card, 'join-initials') && attr(byId(card, 'join-code'), 'maxLength') === '4');
  check('lobby-says-whose-initials', /ZED/.test(text(byId(card, 'lobby-initials'))) && /title card/.test(text(byId(card, 'lobby-initials'))),
    text(byId(card, 'lobby-initials')));
  byId(card, 'join-code').value = 'tst1';
  submit(byId(card, 'join-form'));
  check('lobby-join-submit', JSON.stringify(calls.join) === '["tst1"]', JSON.stringify(calls.join));
  // The typed code survives every redraw; an invite's code fills the code box once.
  renderLobby(veil, { ...props, status: 'Raising the flag…' });
  check('lobby-redraw-keeps-typing', byId(card, 'join-code').value === 'tst1');
```

`src/ui/endveil.tsx`: replace

```tsx
          {p.backToRooms ? 'Back to rooms' : <>Play again <Key at="global:new" bare /></>}
```

with

```tsx
          {p.backToRooms ? 'Back to rooms' : 'Continue'}
```

change the `backToRooms` field comment to `/** The button reads "Back to rooms" (a room's standings) instead of "Continue" (back to the title card). */`, and in the header replace the words `the room rematch button, and the button` / ` * that starts over.` with `the room rematch button, and the button` / ` * that leaves it (Continue to the title card, or Back to rooms).`. `Key` stays imported only if the file still uses it; after this change it does not, so the import becomes `import { KeyHints, OverlayHead, ScrollKeys, blurThen, useScrollKeep } from './chrome.tsx';`.

`test/ui.test.mjs`: replace `check('end-again', hasClass(again, 'btn-primary') && text(again) === 'Play again N', text(again));` with `check('end-again', hasClass(again, 'btn-primary') && text(again) === 'Continue', text(again));`.

- [ ] **Step 6: The page and its style**

`index.html`: directly after the `<canvas id="stage" ...></canvas>` element add the card's mount point (the kit `Dialog` renders `#title-card` inside it):

```html
      <div id="title-root" data-ui></div>
```

Append to `game.css`:

```css
/* The title card's mount point adds no box of its own. */
#title-root { display: contents; }
/* The title card over the dimmed demo. It covers the battlefield only, so the
   toolbar stays usable, and sits under the in-frame panels: the menu opens over it. */
.title-veil {
  position: absolute;
  left: 0.6rem;
  right: 0.6rem;
  top: 0.6rem;
  aspect-ratio: 1080 / 690;
  display: grid;
  place-items: center;
  padding: 0.5rem;
  background: rgba(5, 6, 15, 0.55);
  border-radius: 6px;
  z-index: 3;
  overflow: auto;
}
.title-veil[hidden] { display: none; }
.title-card {
  width: min(78%, 20rem);
  padding: 0.9rem 1rem;
  text-align: center;
  color: #eef;
  background: #0c0f2e;
  border: 1px solid var(--accent);
  border-radius: 12px;
}
.title-card h2 { margin: 0 0 0.25rem; font-size: 1.15rem; letter-spacing: 0.04em; color: var(--accent); text-transform: uppercase; }
.title-tag { margin: 0 0 0.6rem; font-size: 0.75rem; color: #9aa3c7; }
#frame .title-play {
  display: flex; align-items: center; justify-content: center; gap: 0.35rem;
  width: 100%; padding: 0.65rem; margin-bottom: 0.45rem; font-size: 1rem; font-weight: 800; border-radius: 9px;
}
.title-row { display: flex; gap: 0.4rem; margin-bottom: 0.5rem; }
#frame .title-row button { flex: 1; padding: 0.45rem; background: #11163a; border-color: #3a3fb0; border-radius: 9px; }
.initials { display: flex; justify-content: center; align-items: center; gap: 0.3rem; border: 0; margin: 0 0 0.2rem; padding: 0; }
.initials legend { float: left; margin-right: 0.4rem; font-size: 0.75rem; color: #9aa3c7; }
input.initial { width: 2rem; height: 2rem; max-width: none; padding: 0; text-align: center; font-size: 1rem; font-weight: 800; text-transform: uppercase; }
.title-note { min-height: 1em; margin: 0 0 0.3rem; font-size: 0.72rem; color: var(--bad); }
#frame .title-link { background: none; border: 0; color: #9aa3c7; text-decoration: underline; font-weight: 600; padding: 0.25rem 0.5rem; }
@media (max-width: 600px) {
  .title-veil { background: rgba(5, 6, 15, 0.75); }
  .title-card { width: 92%; }
  #frame .title-play { padding: 0.9rem; }
}
/* Thumb-sized on touch screens. */
@media (pointer: coarse) {
  #frame .title-play, #frame .title-row button, #frame .title-link { min-height: 44px; }
  input.initial { width: 44px; height: 44px; }
}
```

- [ ] **Step 7: Smoke checks that met the demo without a card**

In `test/smoke.test.mjs`:

- Directly after the `const rendered = id => ...` line add `const titleVeil = () => els['title-root'].children[0];` (the kit `Dialog`'s `#title-card`, rendered inside the mount point).
- After `check('no-ambush-shop', els['shop-veil'].hidden === true);` add `check('title-card-over-the-demo', titleVeil().id === 'title-card' && titleVeil().hidden === false && rendered('title-play') && rendered('rooms-open') && rendered('tutorial-open'));` (move the `rendered` and `titleVeil` definitions above it if they are defined later; each is one line).
- Replace `for (const id of ['menu-close', 'seed-form', 'new-game', 'rooms-open']) {` with `for (const id of ['menu-close', 'seed-form', 'new-game']) {`.
- After `check('random-hotkey', els['shop-veil'].hidden === false);` add `check('a-match-closes-the-card', titleVeil().hidden === true);`.
- The lobby has no initials boxes; the rooms use the saved set. Replace `for (const id of ['rooms-open', 'host-form', 'host-initials', 'join-form',` / `'join-code', 'join-initials', 'lobby-status', 'lobby-room', 'lobby-code',` with `for (const id of ['rooms-open', 'host-form', 'lobby-initials', 'join-form',` / `'join-code', 'lobby-status', 'lobby-room', 'lobby-code',`; replace `for (const id of ['host-initials', 'host-form', 'lobby-status', 'lobby-code',` with `for (const id of ['lobby-initials', 'host-form', 'lobby-status', 'lobby-code',`; delete every line that is only `els['host-initials'].value = 'abc';` (five), and the two lines `void document.getElementById('join-initials');` and `els['join-initials'].value = 'def';`.
- After `let createdMap = '';` add `let createdInitials = '';`, and in the mock's `action=create` branch, after its `createdMap = body.map || '';`, add `createdInitials = body.initials || '';`.
- Replace the block from `// invalid + blocked initials never reach the server` through the `check('lobby-initials-gated', ...)` statement (two lines) with:
  ```js
  // The rooms use the initials saved on the title card; the lobby only names them.
  check('lobby-no-initials-boxes', !rendered('host-initials') && !rendered('join-initials'));
  check('lobby-names-saved-initials', els['lobby-initials'].textContent.includes(window.localStorage.getItem('tankity-initials')),
    els['lobby-initials'].textContent);
  ```
- After the `check('room-hosted', ...)` statement add `check('room-hosted-with-saved-initials', createdInitials === window.localStorage.getItem('tankity-initials'), createdInitials);`.

Run: `node ../_kit/build/build.mjs tankity && php tools/install-files.php && node --test test/*.test.mjs`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src index.html game.css dist sw.js test/keys.test.mjs test/ui.test.mjs test/smoke.test.mjs
git commit -m "Tankity title card over the demo: at load, after a match, after leaving a room; rooms use the saved initials"
```

---

### Task 14: The menu holds settings only

**Files:**
- Modify: `src/ui/menu.tsx`, `src/menu.ts`, `src/main.ts` (the `createMenu` call), `index.html` (`#btn-menu`'s tip)
- Create: `test/menu.test.mjs`
- Modify: `test/ui.test.mjs` (delete the menu block), `test/smoke.test.mjs`

**Interfaces:**
- Consumes: the difficulty PR's menu: `MenuProps.difficulties` / `difficulty` / `onPickDifficulty` (the `#difficulty-picker` row and `#difficulty-hint`) and `MenuDeps.difficulty: DifficultySetting`. They stay: Difficulty is a setting.
- Produces: `MenuProps` without `onRandom`, `onRooms`, `onTutorial`; `onNewGame` renamed `onPlaySeed` (the `#new-game` button now reads "Play this seed"). The title is "Settings". `MenuDeps` loses `randomRun`, `openRooms`, `tutorialOpen` and keeps `difficulty`.

- [ ] **Step 1: Write the failing tests**

`test/menu.test.mjs`:

```js
// The settings-only menu: seed with Play this seed, unit, text size,
// Difficulty, sound, music, fullscreen, scores, and Leave room in a room;
// nothing that starts a different kind of game.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { document, makeEl, click, submit, fire } from '../../_kit/test/dom-stub.mjs';
import { importTsx } from '../../_kit/test/tsx.ts';

globalThis.document = document;
const { menu } = await importTsx(import.meta.dirname, { menu: '../src/ui/menu.tsx' });
const walk = (el, out = []) => { for (const c of el.children || []) { out.push(c); walk(c, out); } return out; };
const byId = (el, id) => walk(el).find(n => n.id === id);
const KEYS = { 'global:new': 'N', 'global:sound': 'E', 'global:music': 'M', 'global:fullscreen': 'F', 'global:report': 'R' };
const UNITS = [{ key: 'tank', name: 'Tank' }, { key: 'hover', name: 'Hover' }, { key: 'walker', name: 'Walker' }, { key: 'buggy', name: 'Buggy' }];
const SIZES = [{ key: 's', name: 'Small', scale: 0.9 }, { key: 'm', name: 'Normal', scale: 1 }, { key: 'l', name: 'Large', scale: 1.15 }, { key: 'xl', name: 'Huge', scale: 1.3 }];
const LEVELS = [{ key: 'easy', name: 'Easy' }, { key: 'normal', name: 'Normal' }, { key: 'hard', name: 'Hard' }];

function draw(over = {}) {
  const section = makeEl('menu-overlay');
  section.hidden = false;
  const calls = { close: 0, playSeed: 0, submit: 0, unit: [], size: [], difficulty: [], sound: 0, music: 0, fs: 0, scores: 0, leave: 0 };
  const props = {
    keyHint: (c, a) => KEYS[`${c}:${a}`] ?? '', onClose: () => { calls.close++; },
    onPlaySeed: () => { calls.playSeed++; }, onSubmit: () => { calls.submit++; },
    units: UNITS, unit: 'tank', drawUnit() {}, onPickUnit: k => calls.unit.push(k),
    sizes: SIZES, size: 'm', onPickSize: k => calls.size.push(k),
    difficulties: LEVELS, difficulty: 'normal', onPickDifficulty: k => calls.difficulty.push(k),
    sound: true, music: true, fullscreen: false,
    onSound: () => { calls.sound++; }, onMusic: () => { calls.music++; }, onFullscreen: () => { calls.fs++; },
    onScores: () => { calls.scores++; }, inRoom: false, onLeave: () => { calls.leave++; }, ...over,
  };
  menu.renderMenu(section, props);
  return { section, calls, props };
}

test('the menu is titled Settings and offers no other kind of game', () => {
  const { section } = draw();
  assert.equal(byId(section, 'menu-h').textContent, 'Settings');
  for (const gone of ['random-run', 'rooms-open', 'tutorial-open']) assert.equal(byId(section, gone), undefined, gone);
});

test('Play this seed and Enter in the seed box both report', () => {
  const { section, calls } = draw();
  const play = byId(section, 'new-game');
  assert.equal(play.textContent, 'Play this seed N');
  click(play);
  submit(byId(section, 'seed-form'));
  assert.deepEqual([calls.playSeed, calls.submit], [1, 1]);
});

test('unit, text size, the toggles and Scores report; Leave room shows only in a room', () => {
  const { section, calls, props } = draw();
  click(byId(section, 'unit-picker').children[2]);
  click(byId(section, 'text-picker').children[3]);
  for (const id of ['btn-sound', 'btn-music', 'fullscreen', 'scores-open']) click(byId(section, id));
  assert.deepEqual(calls.unit, ['walker']);
  assert.deepEqual(calls.size, ['xl']);
  assert.deepEqual([calls.sound, calls.music, calls.fs, calls.scores], [1, 1, 1, 1]);
  assert.equal(byId(section, 'menu-leave').hidden, true);
  menu.renderMenu(section, { ...props, inRoom: true });
  click(byId(section, 'menu-leave'));
  assert.equal(byId(section, 'menu-leave').hidden, false);
  assert.equal(calls.leave, 1);
});

test('Difficulty stays a setting: three choices, the saved one pressed, a click reports it', () => {
  const { section, calls } = draw();
  const tiles = byId(section, 'difficulty-picker').children;
  assert.deepEqual(tiles.map(t => t.textContent), ['Easy', 'Normal', 'Hard']);
  assert.deepEqual(tiles.map(t => t.getAttribute('aria-pressed')), ['false', 'true', 'false']);
  assert.equal(byId(section, 'difficulty-label').textContent, 'Difficulty');
  assert.match(byId(section, 'difficulty-hint').textContent, /next match/);
  click(tiles[2]);
  assert.deepEqual(calls.difficulty, ['hard']);
});

test('the seed box keeps what was typed across a redraw, and the scroll stays put', () => {
  const { section, props } = draw();
  const seed = byId(section, 'seed-input');
  seed.value = 'bam-bam-01';
  section.scrollTop = 90;
  fire(section, 'scroll');
  section.scrollTop = 0;
  menu.renderMenu(section, { ...props, size: 'l' });
  assert.equal(byId(section, 'seed-input'), seed);
  assert.equal(seed.value, 'bam-bam-01');
  assert.equal(section.scrollTop, 90);
});
```

Run: `node --test test/menu.test.mjs`
Expected: FAIL (title, the removed buttons, `onPlaySeed`).

- [ ] **Step 2: The component**

`src/ui/menu.tsx`:

1. Header: replace its first three lines (`/* The game menu: the seed box and New Game, the unit, text-size and Difficulty pickers, the` / ` * sound, music and fullscreen toggles, and the buttons that open the rooms, the` / ` * tutorial and the scores. The game owns the state (the unit, the text size,`) with `/* The settings menu: the seed box and Play this seed, the unit, text-size and` / ` * Difficulty pickers, the sound, music and fullscreen toggles, the scores, and` / ` * Leave room in a room. The game owns the state (the unit, the text size,` (keep the rest of the header).
2. In `MenuProps`, replace

```tsx
  /** The New Game button, and Enter in the seed box. */
  onNewGame: () => void;
```

with

```tsx
  /** The Play this seed button. */
  onPlaySeed: () => void;
  /** Enter in the seed box. */
```

(the existing `onSubmit: () => void;` line follows it), and delete `onRandom: () => void;`, `onRooms: () => void;`, `onTutorial: () => void;`.
3. In `Menu`, replace `title="Game menu"` with `title="Settings"`; replace the `#new-game` button with

```tsx
          <button type="button" id="new-game" class="btn-primary" onClick={blurThen(p.onPlaySeed)}>Play this seed{' '}<Key at="global:new" bare /></button>
```

and delete the three buttons `#random-run`, `#rooms-open` and `#tutorial-open` (keep `#scores-open` and `#menu-leave`). The Difficulty row (`#difficulty-picker`) and `#difficulty-hint` stay as they are.

- [ ] **Step 3: The module and the wiring**

`src/menu.ts`: delete `openRooms(): void;`, `randomRun(): void;` and `tutorialOpen(): void;` from `MenuDeps`; replace the destructuring

```ts
    G, $, net, sfx, difficulty, unlock, isSoundMuted, isMusicMuted, keyHint, myTank, netLeave, openLeaveVeil, openRooms, placeLogBelowMenu,
    randomRun, freshMatchFromSeedBox, toggleFullscreen, toggleMusic, toggleOverlay, toggleSound, tutorialOpen,
```

with

```ts
    G, $, net, sfx, difficulty, unlock, isSoundMuted, isMusicMuted, keyHint, myTank, netLeave, openLeaveVeil, placeLogBelowMenu,
    freshMatchFromSeedBox, toggleFullscreen, toggleMusic, toggleOverlay, toggleSound,
```

in `renderMenu` replace `onNewGame: () => { unlock(); sfx.play('click'); freshMatchFromSeedBox(); },` with `onPlaySeed: () => { unlock(); sfx.play('click'); freshMatchFromSeedBox(); },` and delete the `onRandom`, `onRooms` and `onTutorial` lines (the `difficulties`, `difficulty` and `onPickDifficulty` lines stay). Header: replace `* The unit look, the text size and the Difficulty, all remembered in this browser, and the` with `* The settings menu: the unit look, the text size and the Difficulty (all remembered in this browser), and the` and replace `* chosen, what is muted, whether a room runs, and what each button does.` / `* The page's other controls (sound, music, fullscreen, a fresh match, the` / `* rooms) arrive as deps. */` with `* chosen, what is muted, whether a room runs, and what each button does.` / `* Sound, music, fullscreen and a match on the seed box's hills arrive as deps. */`.

`src/main.ts`: replace the `createMenu({...})` call's two dep lines

```ts
  G, $, net, sfx, difficulty, unlock, isSoundMuted, isMusicMuted, keyHint, myTank, netLeave, openLeaveVeil, openRooms, placeLogBelowMenu,
  randomRun, freshMatchFromSeedBox, toggleFullscreen, toggleMusic, toggleOverlay, toggleSound, tutorialOpen,
```

with

```ts
  G, $, net, sfx, difficulty, unlock, isSoundMuted, isMusicMuted, keyHint, myTank, netLeave, openLeaveVeil, placeLogBelowMenu,
  freshMatchFromSeedBox, toggleFullscreen, toggleMusic, toggleOverlay, toggleSound,
```

`index.html`: on `#btn-menu` change `data-tip-desc="New game, rooms, unit, text size, sound and more"` to `data-tip-desc="Unit, seed, text size, sound, scores and more"`.

- [ ] **Step 4: Retire the old menu tests**

`test/ui.test.mjs`: delete the block from `// ---- menu ----` through its closing `}` (the line before `// ---- weapon picker ----`), delete `const { renderMenu } = ui.menu;`, and remove `'menu', ` from the `UI` list.

`test/smoke.test.mjs`: replace the comment `// New Game, seed, sound, music, fullscreen, and rooms live in the in-frame menu.` with `// Seed, sound, music and fullscreen live in the in-frame settings menu.`; replace `check('menu-tutorial', !!els['tutorial-open'] && !!els['tutorial-overlay'] && !!els['tutorial-skip']);` and its comment line with `// Tutorial: the title card carries a replay button (pressed for real at the end).` / `check('title-tutorial', !!els['tutorial-open'] && !!els['tutorial-overlay'] && !!els['tutorial-skip']);`.

- [ ] **Step 5: Run**

Run: `node ../_kit/build/build.mjs tankity && php tools/install-files.php && node --test test/*.test.mjs`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src index.html dist sw.js test/menu.test.mjs test/ui.test.mjs test/smoke.test.mjs
git commit -m "Tankity menu: settings only; new games start from the title card"
```

---

### Task 15: `tankity-start` and the specs that met the old start; PR 12

**Files:**
- Create: `websites/www.cs/tests/e2e/tankity-start.spec.mjs`
- Modify: `websites/www.cs/tests/e2e/shard.mjs` (`WEIGHTS`), `helpers.mjs` (`roomPair`), `tankity-end.spec.mjs`, `tankity-rooms-seats.spec.mjs`, `tankity-overlays.spec.mjs`, `tankity-pickers.spec.mjs`, `tankity-rooms-play.spec.mjs`
- Modify: `websites/www.cs/games/tankity/README.md`

**Interfaces:**
- Consumes: Tasks 11–14 (ids `#title-card`, `#title-play`, `#rooms-open`, `#tutorial-open`, `#title-settings`, `#title-initial-1..3`, `#title-initials-note`; localStorage key `tankity-initials`).

- [ ] **Step 1: The spec**

`tests/e2e/tankity-start.spec.mjs`:

```js
// Operation Tankity's start: the title card over the demo, its buttons and
// initials, and the settings-only menu that Esc toggles.
import { test, expect } from '@playwright/test';
import { newPlayer } from './helpers.mjs';

test('the title card greets the player over the demo, and Play deals a solo match', async ({ browser }) => {
  const { page, errors } = await newPlayer(browser);
  const card = page.locator('#title-card');
  await expect(card).toBeVisible();
  await expect(page.locator('#title-play')).toBeFocused();
  for (const id of ['#rooms-open', '#tutorial-open', '#title-settings']) await expect(page.locator(id)).toBeVisible();
  await page.click('#title-play');
  await expect(card).toBeHidden();
  await expect(page.locator('#shop-veil')).toBeVisible({ timeout: 10_000 });
  expect(errors).toEqual([]);
});

test('Esc opens the settings menu over the card and closes it, and focus comes back', async ({ browser }) => {
  const { page, errors } = await newPlayer(browser);
  const menu = page.locator('#menu-overlay');
  await page.keyboard.press('Escape');
  await expect(menu).toBeVisible();
  await expect(page.locator('#menu-close')).toBeFocused();
  await expect(page.locator('#btn-menu')).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#menu-h')).toHaveText('Settings');
  await expect(page.locator('#new-game')).toHaveText(/^Play this seed/);
  await expect(page.locator('#scores-open')).toBeVisible();
  await expect(page.locator('#difficulty-picker')).toBeVisible();
  for (const gone of ['#random-run', '#menu-overlay #rooms-open', '#menu-overlay #tutorial-open']) {
    await expect(page.locator(gone)).toHaveCount(0);
  }
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
  await expect(page.locator('#title-card')).toBeVisible();
  await page.click('#title-settings');
  await expect(menu).toBeVisible();
  await expect(page.locator('#title-settings')).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
  await expect(page.locator('#title-settings')).toBeFocused();
  await expect(page.locator('#title-settings')).toHaveAttribute('aria-expanded', 'false');
  expect(errors).toEqual([]);
});

test('initials: random until chosen, typed in either case, shown and kept uppercase, blocked words refused', async ({ browser }) => {
  const { page, ctx, errors } = await newPlayer(browser);
  const saved = () => page.evaluate(() => localStorage.getItem('tankity-initials'));
  const first = await saved();
  expect(first).toMatch(/^[A-Z]{3}$/);
  await page.reload();
  expect(await saved()).toBe(first);
  await page.click('#title-initial-1');
  await page.keyboard.type('zed');
  await expect.poll(saved).toBe('ZED');
  await expect(page.locator('#title-initial-1')).toHaveValue('Z');
  await expect(page.locator('#title-initial-3')).toHaveValue('D');
  const again = await ctx.newPage();
  await again.goto('games/tankity/');
  await expect(again.locator('#title-initial-2')).toHaveValue('E');
  await page.click('#title-initial-1');
  await page.keyboard.type('ass');
  await expect(page.locator('#title-initials-note')).toContainText('not allowed');
  expect(await saved()).toBe('ZED');
  expect(errors).toEqual([]);
});

test('Play with friends opens the rooms; closing them shows the card again', async ({ browser }) => {
  const { page, errors } = await newPlayer(browser);
  await page.click('#rooms-open');
  await expect(page.locator('#lobby-veil')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#lobby-veil')).toBeHidden();
  await expect(page.locator('#title-card')).toBeVisible();
  await page.click('#tutorial-open');
  await expect(page.locator('#title-card')).toBeHidden();
  await expect(page.locator('#shop-veil')).toBeVisible({ timeout: 10_000 });
  expect(errors).toEqual([]);
});
```

`shard.mjs` `WEIGHTS`: add `'tankity-start.spec.mjs': 12,`.

- [ ] **Step 2: Specs that expected the old start**

`tankity-end.spec.mjs`: rename the test to `'a lost match shows the end veil: result, score, callsign form, and Continue back to the title card'`; replace the block from `// Play again deals a fresh match: the shop comes back with the result gone` through `}, { timeout: 15_000 }).toBe(true);` with

```js
  // Continue goes back to the title card over the demo; Play deals a fresh
  // match: the shop comes back with the result gone, and once the first
  // round starts all three lives are back.
  await page.click('#again');
  await expect(page.locator('#title-card')).toBeVisible();
  await page.click('#title-play');
  await expect.poll(async () => {
    await page.clock.runFor(1000);
    return page.locator('#shop-veil').isVisible();
  }, { timeout: 15_000 }).toBe(true);
```

`tankity-rooms-seats.spec.mjs`: rename `'a guest leaves mid-match from the menu and lands in solo; the host plays on'` to `'a guest leaves mid-match from the menu and lands on the title card; the host plays on'`, and replace

```js
  // A fresh solo match deals in: banner, then the pre-match shop (no room button there).
  await expect(guest.page.locator('#shop-veil')).toBeVisible({ timeout: 15_000 });
```

with

```js
  // Back at the title card over the demo; Play deals a fresh solo match.
  await expect(guest.page.locator('#title-card')).toBeVisible();
  await guest.page.click('#title-play');
  await expect(guest.page.locator('#shop-veil')).toBeVisible({ timeout: 15_000 });
```

`tankity-overlays.spec.mjs`, in "scrolled panels stay where the player left them": the menu is shorter now, so make sure it scrolls: replace the first `await page.setViewportSize({ width: 1000, height: 640 });` in that test with `await page.setViewportSize({ width: 1000, height: 500 });`. The lobby has no initials box now, so the redraw comes from a bad room code: replace

```js
  await page.fill('#host-initials', 'ass'); // a blocked word
  await page.keyboard.press('Enter'); // the status line says the initials are wrong: a redraw
  await expect(page.locator('#lobby-status')).toContainText('3 letters');
```

with

```js
  await page.fill('#join-code', '!!'); // not a room code
  await page.keyboard.press('Enter'); // the status line says so: a redraw
  await expect(page.locator('#lobby-status')).toContainText('4 letters or digits');
```

and replace the whole test `'the lobby shows the hills first, hosts from the initials row, then shows only the room'` with

```js
test('the lobby shows the hills first, hosts under the saved initials, then shows only the room', async ({ browser }) => {
  const { page } = await newPlayer(browser);
  await page.keyboard.press('o');
  await expect(page.locator('#lobby-veil')).toBeVisible();
  const box = sel => page.locator(sel).boundingBox();
  const [hills, host] = [await box('#lobby-map-picker'), await box('#host-go')];
  expect(hills.y + hills.height).toBeLessThanOrEqual(host.y);
  const saved = await page.evaluate(() => localStorage.getItem('tankity-initials'));
  await expect(page.locator('#lobby-initials')).toContainText(saved);
  await expect(page.locator('#host-initials')).toHaveCount(0);
  await page.click('#host-go');
  await expect(page.locator('#lobby-room')).toBeVisible();
  await expect(page.locator('#lobby-rows')).toBeHidden();
  await expect(page.locator('#lobby-intro')).toBeHidden();
  await page.locator('#lobby-veil .card').screenshot({ path: 'test-results/tankity-lobby-hosted.png' });
  // Leaving brings the forms back.
  await page.click('#lobby-leave');
  await expect(page.locator('#lobby-rows')).toBeVisible();
});
```

Rooms host and join under the initials saved on the title card. `helpers.mjs`, in `roomPair`, replace

```js
  await host.page.keyboard.press('o');
  await host.page.fill('#host-initials', 'abc');
  await host.page.click('#host-go');
```

with

```js
  await setInitials(host.page, 'abc');
  await host.page.click('#rooms-open');
  await host.page.click('#host-go');
```

and

```js
  await guest.page.keyboard.press('o');
  await guest.page.fill('#join-code', code);
  await guest.page.fill('#join-initials', 'zed');
  await guest.page.click('#join-go');
```

with

```js
  await setInitials(guest.page, 'zed');
  await guest.page.click('#rooms-open');
  await guest.page.fill('#join-code', code);
  await guest.page.click('#join-go');
```

and add above `roomPair`:

```js
/** Types a player's initials into the title card's three boxes, as a player would. */
export async function setInitials(page, word) {
  await page.click('#title-initial-1');
  await page.keyboard.type(word);
  await expect.poll(() => page.evaluate(() => localStorage.getItem('tankity-initials'))).toBe(word.toUpperCase());
}
```

`tankity-pickers.spec.mjs`: delete the line `await page.fill('#host-initials', 'abc');`. `tankity-rooms-play.spec.mjs`: delete the line `await game.locator('#host-initials').fill('abc');`.

- [ ] **Step 3: Docs**

`games/tankity/README.md`: in the file table add rows for `src/title.ts` ("The title card over the demo: whether it shows, the initials it edits, and its props. `createTitle(deps)`"), `src/initials.ts` ("A player's three-letter initials: the rule, the blocked words, and the one saved set per browser (`tankity-initials`), random until chosen") and add `title.tsx` to the `src/ui/*.tsx` row's list; change `src/menu.ts`'s description to "The settings menu (the unit look, the text size and the Difficulty, all remembered in this browser) and the menu overlay's props", and `src/lobby.ts`'s to say the rooms host and join under the saved initials. Add a paragraph to the overview: "The page opens on a title card over the dimmed demo: Play (solo, random hills), Play with friends (the rooms), Tutorial, Settings, and the player's initials, the one set solo and the rooms both use. The card comes back after a match ends and after leaving a room. Esc toggles the settings menu."

- [ ] **Step 4: Verify**

Run: `cd websites/www.cs && make test`
Expected: PASS.

Run: `make e2e E2E_ARGS="tankity-start.spec.mjs tankity-overlays.spec.mjs"`
Expected: PASS, each spec well under 15 s.

- [ ] **Step 5: Commit and open PR 12**

```bash
git add websites/www.cs/tests/e2e websites/www.cs/games/tankity/README.md
git commit -m "Specs: tankity-start; the end, the rooms and the overlays meet the title card and the saved initials"
git push -u origin games/tankity-title
gh pr create --fill --title "Tankity title card with initials; settings-only menu" --body-file - <<'BODY'
Spec row 12 (section 6.1): the demo plays dimmed behind a title card with Play, Play with friends, Tutorial, a Settings link and a three-letter initials picker; the card returns after a match and after leaving a room, and the rooms host and join under those same initials. The menu keeps only settings (Difficulty among them), and Esc toggles it with focus moving in and back.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb
BODY
```

If `main` moved, rebase and rebuild the generated files (Global Constraints: never hand-merge `dist/`, `sw.js`, `?v=` values or `game.json`). Run the pr-fix loop on the review comments, then gate, merge on green, wait for deploy, live-check with `cd websites/www.cs && E2E_BASE_URL=https://www.cs.siue.edu/~wgrim/ tests/e2e/run.sh tankity-start.spec.mjs`, and report `https://www.cs.siue.edu/~wgrim/play/tankity/?v=<merged sha>`.

---

# PR 13: Tankity layout: status bar, deck, phone layouts; `tankity-layout` and `tankity-a11y`

Branch `games/tankity-layout` (from `main` after PR 12). Spec row 13, sections 6.2 and 6.4. Paths are in `websites/www.cs/games/tankity/` unless given in full.

### Task 16: Blast size and the Weapon line

**Files:**
- Create: `src/weapon-label.ts` (DOM-free), `test/weapon-label.test.mjs`
- Modify: `tsconfig.json` (add `"src/weapon-label.ts"` to `files`)

**Interfaces:**
- Produces: `BLAST_CUTOFFS = { smallBelow: 20, largeFrom: 40 }`, `blastSize(radius: number): 'S' | 'M' | 'L'`, `weaponLine(w: Pick<Weapon, 'dmg' | 'radius'>): string` ("34 dmg · M").

- [ ] **Step 1: Write the failing tests**

`test/weapon-label.test.mjs`:

```js
// The Weapon button's second line: damage, then a blast size from the radius.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { blastSize, weaponLine, BLAST_CUTOFFS } from '../src/weapon-label.ts';

const GAME = JSON.parse(fs.readFileSync(new URL('../game.json', import.meta.url), 'utf8'));
const gun = key => GAME.arsenal.ammo.find(a => a.key === key);

test('the cut-offs: below 20 is S, 20 up to 40 is M, 40 and up is L', () => {
  assert.deepEqual(BLAST_CUTOFFS, { smallBelow: 20, largeFrom: 40 });
  assert.deepEqual([0, 19, 19.9, 20, 39, 39.9, 40, 70].map(blastSize), ['S', 'S', 'S', 'M', 'M', 'M', 'L', 'L']);
});

test('the shipped guns read the way the deck shows them', () => {
  assert.equal(weaponLine(gun('shell')), '34 dmg · M');
  assert.equal(blastSize(gun('rail').radius), 'S');
  assert.equal(blastSize(gun('mortar').radius), 'L');
  assert.equal(blastSize(gun('nuke').radius), 'L');
  for (const w of GAME.arsenal.ammo) assert.match(weaponLine(w), /^\d+ dmg · [SML]$/, w.key);
});
```

Run: `node --test test/weapon-label.test.mjs` — Expected: FAIL (module missing).

- [ ] **Step 2: Implement**

`src/weapon-label.ts`:

```ts
/* Operation Tankity: how the deck's Weapon button sums up a gun: its damage,
 * and a blast size (S, M, L) from its radius. DOM-free. */
import type { Weapon } from './sim.ts';

/** Radii below smallBelow are S, from largeFrom up are L, M between. */
export const BLAST_CUTOFFS = Object.freeze({ smallBelow: 20, largeFrom: 40 });

export function blastSize(radius: number): 'S' | 'M' | 'L' {
  if (radius < BLAST_CUTOFFS.smallBelow) return 'S';
  if (radius >= BLAST_CUTOFFS.largeFrom) return 'L';
  return 'M';
}

/** "34 dmg · M". */
export function weaponLine(w: Pick<Weapon, 'dmg' | 'radius'>): string {
  return `${w.dmg} dmg · ${blastSize(w.radius)}`;
}
```

Add `"src/weapon-label.ts"` to `tsconfig.json`'s `files`.

- [ ] **Step 3: Run** — `node --test test/weapon-label.test.mjs` — Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/weapon-label.ts tsconfig.json test/weapon-label.test.mjs
git commit -m "Tankity weapon line: damage and an S/M/L blast size from one tested cut-off"
```

---

### Task 17: The status bar and the Weapon label components

**Files:**
- Modify: `src/ui/hud.tsx` (rewrite)
- Create: `src/ui/gun-label.tsx`, `test/hud.test.mjs`
- Modify: `src/tsconfig.dom.json` (add `"ui/gun-label.tsx"`), `test/ui.test.mjs` (delete the status-bar block)

**Interfaces:**
- Produces:
  - `type Badge = { kind: 'solo'; cash: number; round: number; score: number; nextOneUp: number } | { kind: 'room'; code: string; seat: string; round: number }`
  - `HudProps = { turn; angle; power; fuel: string; ammo: string; armor: { shown: string; sr: string }; lives: number | null; wind: string; badge: Badge | null; online: boolean; runStats: string; menuOpen: boolean; menuKey: string; onMenu(): void }`; `renderHud(container, props)`.
  - Ids: `#btn-menu` (in the bar, `aria-expanded`), `#hud-turn` (sr-only, live), `#hud-angle`, `#hud-power`, `#hud-fuel`, `#hud-ammo`, `#hud-armor`, `#hud-lives` (`role="img"`, `aria-label="N lives"`, text `♥ N`), `#hud-wind`, `#hud-score` (the badge, three segments), `#hud-dot` (room only), `#hud-server`, `#run-stats`. Rows: `.hud-row.r1` (Menu, angle, power, fuel), `.r2` (four pills), `.r3` (badge).
  - `GunLabelProps = { gun: string | null; name: string; sr: string; line: string; drawIcon(cv, weapon): void; arsenalRev: number }`; `renderGunLabel(container, props)`; ids `#hud-weapon` (name + sr text), class `.gun-icon` canvas, `.gun-line`.

- [ ] **Step 1: Write the failing tests**

`test/hud.test.mjs`:

```js
// The status bar (Menu, aim numbers, four pills, the match badge) and the
// deck's Weapon label, rendered into the Node DOM stub.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { document, makeEl, click } from '../../_kit/test/dom-stub.mjs';
import { importTsx } from '../../_kit/test/tsx.ts';

globalThis.document = document;
const { hud, gunLabel } = await importTsx(import.meta.dirname, { hud: '../src/ui/hud.tsx', gunLabel: '../src/ui/gun-label.tsx' });
const walk = (el, out = []) => { for (const c of el.children || []) { out.push(c); walk(c, out); } return out; };
const byId = (el, id) => walk(el).find(n => n.id === id);
const hasClass = (el, name) => String(el.className || '').split(' ').includes(name);

const SOLO = { kind: 'solo', cash: 12450, round: 13, score: 98760, nextOneUp: 99000 };
function props(over = {}) {
  const calls = { menu: 0 };
  return {
    calls,
    p: {
      turn: 'YOU. Aim!', angle: '162°', power: '100', fuel: '100', ammo: '×2',
      armor: { shown: '100', sr: 'you 100 · REAPER:100' }, lives: 5, wind: '← 12', badge: SOLO,
      online: false, runStats: '', menuOpen: false, menuKey: 'Esc', onMenu: () => { calls.menu++; }, ...over,
    },
  };
}

test('the bar runs Menu, angle, power, fuel, AMMO, ARMOR, lives, WIND, then the badge', () => {
  const bar = makeEl('hud-bar');
  hud.renderHud(bar, props().p);
  const order = walk(bar).filter(n => n.id && ['btn-menu', 'hud-angle', 'hud-power', 'hud-fuel', 'hud-ammo', 'hud-armor', 'hud-lives', 'hud-wind', 'hud-score'].includes(n.id)).map(n => n.id);
  assert.deepEqual(order, ['btn-menu', 'hud-angle', 'hud-power', 'hud-fuel', 'hud-ammo', 'hud-armor', 'hud-lives', 'hud-wind', 'hud-score']);
  const rows = walk(bar).filter(n => hasClass(n, 'hud-row'));
  assert.deepEqual(rows.map(r => r.className), ['hud-row r1', 'hud-row r2', 'hud-row r3']);
  assert.equal(byId(bar, 'hud-turn').getAttribute('aria-live'), 'polite');
});

test('Menu has its Esc chip, says whether the menu is open, and reports a tap', () => {
  const bar = makeEl('hud-bar');
  const { p, calls } = props({ menuOpen: true });
  hud.renderHud(bar, p);
  const menu = byId(bar, 'btn-menu');
  assert.equal(menu.getAttribute('aria-expanded'), 'true');
  const chip = walk(menu).find(n => n.localName === 'kbd');
  assert.equal(chip.textContent, 'Esc');
  assert.equal(chip.getAttribute('aria-hidden'), 'true');
  click(menu);
  assert.equal(calls.menu, 1);
  hud.renderHud(bar, props({ menuKey: '' }).p);
  assert.equal(walk(byId(bar, 'btn-menu')).find(n => n.localName === 'kbd'), undefined);
});

test('lives are always a heart and a number, named for readers', () => {
  const bar = makeEl('hud-bar');
  hud.renderHud(bar, props({ lives: 3 }).p);
  const lives = byId(bar, 'hud-lives');
  assert.equal(lives.textContent, '♥ 3');
  assert.equal(lives.getAttribute('role'), 'img');
  assert.equal(lives.getAttribute('aria-label'), '3 lives');
});

test('labels shorten for the eye but readers keep the full word', () => {
  const bar = makeEl('hud-bar');
  hud.renderHud(bar, props().p);
  const shorts = walk(bar).filter(n => hasClass(n, 'short'));
  assert.deepEqual(shorts.map(n => n.textContent), ['ANG', 'PWR', 'FUEL', 'ARM', 'RND']);
  assert.ok(shorts.every(n => n.getAttribute('aria-hidden') === 'true'));
});

test('the solo badge: cash, round, points with thousands separators and the next 1-up', () => {
  const bar = makeEl('hud-bar');
  hud.renderHud(bar, props().p);
  const badge = byId(bar, 'hud-score');
  assert.equal(badge.children.length, 3);
  assert.equal(badge.children[0].textContent, '$12,450');
  assert.match(badge.children[1].textContent, /13$/);
  assert.equal(badge.children[2].textContent, '98,760 PTS');
  assert.equal(badge.getAttribute('title'), 'Next 1-up at 99,000 points');
});

test('the room badge: room code, your seat, round, and the server dot', () => {
  const bar = makeEl('hud-bar');
  hud.renderHud(bar, props({ badge: { kind: 'room', code: 'ABCD', seat: 'P2', round: 13 }, online: true }).p);
  const badge = byId(bar, 'hud-score');
  assert.equal(badge.children.length, 3);
  assert.match(badge.children[0].textContent, /^ROOM ABCD/);
  assert.equal(badge.children[1].textContent, 'YOU P2');
  assert.equal(byId(bar, 'hud-dot').className, 'dot on');
  assert.equal(byId(bar, 'hud-server').textContent, 'online');
});

test('a redraw updates in place', () => {
  const bar = makeEl('hud-bar');
  hud.renderHud(bar, props().p);
  const angle = byId(bar, 'hud-angle');
  hud.renderHud(bar, props({ angle: '63°', armor: { shown: '90', sr: '' } }).p);
  assert.equal(byId(bar, 'hud-angle'), angle);
  assert.equal(angle.textContent, '63°');
  assert.equal(byId(bar, 'hud-armor').textContent, '90');
});

test('the Weapon label: the icon painted once per gun, the name, the line, and the rest for readers', () => {
  const slot = makeEl('deck-gun');
  const painted = [];
  const gp = over => ({ gun: 'buck', name: 'Buckshot', sr: ' ×2 · also Shell ∞', line: '17 dmg · M', drawIcon: (cv, w) => painted.push(w), arsenalRev: 1, ...over });
  gunLabel.renderGunLabel(slot, gp());
  assert.equal(byId(slot, 'hud-weapon').textContent, 'Buckshot ×2 · also Shell ∞');
  assert.equal(walk(slot).find(n => hasClass(n, 'gun-line')).textContent, '17 dmg · M');
  assert.equal(walk(slot).find(n => hasClass(n, 'gun-icon')).getAttribute('aria-hidden'), 'true');
  gunLabel.renderGunLabel(slot, gp());
  gunLabel.renderGunLabel(slot, gp({ gun: 'rail', name: 'Rail' }));
  gunLabel.renderGunLabel(slot, gp({ gun: 'rail', name: 'Rail', arsenalRev: 2 }));
  assert.deepEqual(painted, ['buck', 'rail', 'rail']);
});
```

Run: `node --test test/hud.test.mjs` — Expected: FAIL.

- [ ] **Step 2: The status bar**

Replace `src/ui/hud.tsx` entirely:

```tsx
/* The status bar on top of the frame: Menu, angle, power and fuel, the AMMO,
 * ARMOR, lives and WIND pills, and the match badge ($ | ROUND | PTS solo,
 * ROOM | YOU | ROUND in a room). The game hands in finished values; this draws
 * them and reports a tap on Menu. Labels shorten at narrow widths in game.css;
 * screen readers always hear the full words.
 * Copyright (C) 2026 William Grim
 * SPDX-License-Identifier: GPL-3.0-or-later */
import { render } from 'preact';
import { KeyChip } from '../../../_kit/ui/key-chip.tsx';

export type Badge =
  | { kind: 'solo'; cash: number; round: number; score: number; nextOneUp: number }
  | { kind: 'room'; code: string; seat: string; round: number };

export interface HudProps {
  /** Whose turn it is, as a sentence ("YOU. Aim!"), for screen readers. */
  turn: string;
  angle: string;
  power: string;
  fuel: string;
  /** The loaded gun's count: "∞" or "×2". */
  ammo: string;
  /** Armor: what shows, and what a screen reader adds (the rivals' armor). */
  armor: { shown: string; sr: string };
  /** Lives left; null before a match is dealt. */
  lives: number | null;
  /** "→ 7", "← 3" or "· 0". */
  wind: string;
  badge: Badge | null;
  /** The room server answers. */
  online: boolean;
  /** The room line (hidden on the page, kept for the stats strip), or empty. */
  runStats: string;
  /** The menu is open (the Menu button's aria-expanded). */
  menuOpen: boolean;
  /** The Menu chip's text from the key table ("Esc"); empty shows none. */
  menuKey: string;
  onMenu: () => void;
}

const num = (n: number) => n.toLocaleString('en-US');

/** A label that shortens at narrow widths; readers always get the full word. */
function Label({ full, short }: { full: string; short?: string }) {
  if (!short) return <span class="k">{full}</span>;
  return <span class="k"><span class="full">{full}</span><span class="short" aria-hidden="true">{short}</span></span>;
}

function Stat({ id, full, short, value }: { id: string; full: string; short: string; value: string }) {
  return <span class="stat"><Label full={full} short={short} /> <span class="v" id={id}>{value}</span></span>;
}

function MatchBadge({ badge, online }: { badge: Badge | null; online: boolean }) {
  if (!badge) return <span class="seg" id="hud-score">-</span>;
  if (badge.kind === 'room') {
    return (
      <span class="seg" id="hud-score">
        <span>
          <span class="k">ROOM</span> <span class="v">{badge.code}</span>
          <span id="hud-dot" class={`dot ${online ? 'on' : 'off'}`} title={online ? 'room server: connected' : 'room server: not connected'} />
        </span>
        <span><span class="k">YOU</span> <span class="v">{badge.seat}</span></span>
        <span><Label full="ROUND" short="RND" /> <span class="v">{badge.round}</span></span>
      </span>
    );
  }
  return (
    <span class="seg" id="hud-score" title={`Next 1-up at ${num(badge.nextOneUp)} points`}>
      <span class="cash"><span class="v">${num(badge.cash)}</span></span>
      <span><Label full="ROUND" short="RND" /> <span class="v">{badge.round}</span></span>
      <span><span class="v">{num(badge.score)}</span> <span class="k">PTS</span></span>
    </span>
  );
}

export function Hud(p: HudProps) {
  return (
    <>
      <div class="hud" role="group" aria-label="Battle status">
        <span class="sr-only" id="hud-turn" aria-live="polite">{p.turn}</span>
        <div class="hud-row r1">
          <button type="button" id="btn-menu" class="menu-btn" aria-haspopup="dialog" aria-expanded={p.menuOpen}
            onClick={ev => { (ev.currentTarget as HTMLElement).blur(); p.onMenu(); }}>
            <svg class="menu-icon" viewBox="0 0 26 26" aria-hidden="true"><path d="M4 7h18M4 13h18M4 19h18" stroke="currentColor" stroke-width="3" stroke-linecap="round" /></svg>
            <span class="mword">Menu</span>
            {p.menuKey && <KeyChip label={p.menuKey} class="key" at="global:escape" decorative />}
          </button>
          <Stat id="hud-angle" full="ANGLE" short="ANG" value={p.angle} />
          <Stat id="hud-power" full="POWER" short="PWR" value={p.power} />
          <Stat id="hud-fuel" full="FUEL" short="FUEL" value={p.fuel} />
        </div>
        <div class="hud-row r2">
          <span class="pill ammo"><span class="k">AMMO</span> <span class="v" id="hud-ammo">{p.ammo}</span></span>
          <span class="pill armor">
            <Label full="ARMOR" short="ARM" />{' '}
            <span class="v" id="hud-armor">{p.armor.shown}{p.armor.sr && <span class="sr-only">{` ${p.armor.sr}`}</span>}</span>
          </span>
          {p.lives === null
            ? <span class="pill lives" id="hud-lives">-</span>
            : <span class="pill lives" id="hud-lives" role="img" aria-label={`${p.lives} lives`} title={`${p.lives} lives`}><span class="hearts">♥</span> <span class="v">{p.lives}</span></span>}
          <span class="pill wind"><span class="k">WIND</span> <span class="v" id="hud-wind">{p.wind}</span></span>
        </div>
        <div class="hud-row r3"><MatchBadge badge={p.badge} online={p.online} /></div>
        <span class="sr-only" id="hud-server">{p.online ? 'online' : 'offline'}</span>
      </div>
      <p id="run-stats" class="runstats">{p.runStats}</p>
    </>
  );
}

/** Draws (or redraws) the status bar into its element. */
export function renderHud(container: Element, props: HudProps): void {
  render(<Hud {...props} />, container);
}
```

- [ ] **Step 3: The Weapon label**

`src/ui/gun-label.tsx`:

```tsx
/* The deck's Weapon button face: the loaded gun's shell and name over its
 * damage and blast size ("34 dmg · M"); screen readers also hear its count
 * and the rest of the rack. The button itself stays in index.html.
 * Copyright (C) 2026 William Grim
 * SPDX-License-Identifier: GPL-3.0-or-later */
import { render } from 'preact';
import { useLayoutEffect, useRef } from 'preact/hooks';

export interface GunLabelProps {
  /** The loaded gun's arsenal key (for the icon), or null before a match. */
  gun: string | null;
  name: string;
  /** For readers: the count and the rest of the rack (" ×2 · also Shell ∞"). */
  sr: string;
  /** "34 dmg · M". */
  line: string;
  drawIcon: (canvas: HTMLCanvasElement, weapon: string) => void;
  /** Changes whenever the arsenal the icon is painted from does. */
  arsenalRev: number;
}

export function GunLabel(p: GunLabelProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => { if (canvas.current && p.gun) p.drawIcon(canvas.current, p.gun); }, [p.gun, p.arsenalRev]);
  return (
    <>
      <span class="gun-top">
        <canvas class="gun-icon" aria-hidden="true" ref={canvas} />
        <span id="hud-weapon">{p.name}{p.sr && <span class="sr-only">{p.sr}</span>}</span>
      </span>
      <span class="gun-line">{p.line}</span>
    </>
  );
}

/** Draws (or redraws) the Weapon button's face into its slot. */
export function renderGunLabel(container: Element, props: GunLabelProps): void {
  render(<GunLabel {...props} />, container);
}
```

Add `"ui/gun-label.tsx"` to `src/tsconfig.dom.json`.

- [ ] **Step 4: Retire the old status-bar tests**

`test/ui.test.mjs`: delete the block from `// ---- status bar ----` to its closing `}` (end of file), `const { renderHud } = ui.hud;`, and `'hud'` from the `UI` list.

- [ ] **Step 5: Run** — `node --test test/hud.test.mjs test/ui.test.mjs` — Expected: PASS. (`hud.ts` still uses the old props; the build is fixed in Task 19, so do not build yet.)

- [ ] **Step 6: Commit**

```bash
git add src/ui/hud.tsx src/ui/gun-label.tsx src/tsconfig.dom.json test/hud.test.mjs test/ui.test.mjs
git commit -m "Tankity status bar and Weapon label components: pills, segmented badge, Menu with its chip"
```

---

### Task 18: The wind badge leaves the sky

**Files:**
- Modify: `src/render.ts`, `src/view.ts`, `src/game-types.ts`, `src/main.ts`, `test/render.test.mjs`

**Interfaces:**
- Produces: `BattleView` without `windGauge` and `windTop`; `createView` no longer returns `windGaugeTop`; `GameState` without `windTop`. Wind is shown only by the WIND pill and the sky's streaks.

- [ ] **Step 1: Make the test describe the new view (failing type check)**

`test/render.test.mjs`: replace `wind: -5, windGauge: true, windTop: 30, textScale: 1.1,` with `wind: -5, textScale: 1.1,`.

- [ ] **Step 2: Remove the gauge**

- `src/render.ts`: delete the `windGauge` and `windTop` fields of `BattleView`, the whole `drawWindGauge` function, its call `drawWindGauge(c, view);`, and `const WIND_MAX = 12;` (only the gauge read it). In the header, replace `wind streaks and gauge` with `wind streaks`; in the `/* ---------- wind ---------- */` comment drop the sentence about the gauge under the menu strip.
- `src/view.ts`: in `ViewState` remove `| 'windTop'`; in the view object replace `wind: G.wind, windGauge: G.tanks.length > 0 && G.phase !== 'shop', windTop: G.windTop,` with `wind: G.wind,`; delete `windGaugeTop` with its comment, and `windGaugeTop` from the returned object.
- `src/game-types.ts`: delete the `windTop` field.
- `src/main.ts`: remove `windTop: undefined` from the `G` literal (keep the line's other fields), `windGaugeTop` from the `createView` destructuring, and `G.windTop = windGaugeTop();` from `placeLogBelowMenu`.

- [ ] **Step 3: Run** — `node --test test/render.test.mjs` — Expected: PASS. Run: `grep -rn "windGauge\|windTop\|WIND_MAX" src test` — Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add src test/render.test.mjs
git commit -m "Tankity: the wind gauge leaves the sky; the status bar's WIND pill carries it"
```

---

### Task 19: The page: status bar on top, battlefield, static control deck

**Files:**
- Modify: `index.html`, `src/hud.ts`, `src/main.ts`, `src/ui/menu.tsx`, `src/menu.ts`
- Modify: `test/smoke.test.mjs`, `test/menu.test.mjs`

**Interfaces:**
- Consumes: Tasks 16–18.
- Produces: `#hud-bar` (Preact status bar) / `#field` (the canvas, the title card, the banner, the chatter toast) / `#deck` (static HTML: `.grp-aim` with four `[data-aim]` buttons, `.grp-drive` with `#btn-drive-l/r`, `.grp-more` with `#btn-log`, `#btn-track`, `#btn-help`, `.grp-weapon` with `#btn-weapon` holding `#deck-gun`, `.grp-fire` with `#btn-cannon`). `HudDeps` gains `keyHint`, `touch`, `menuOpen()`, `onMenu()`, `net: Pick<RoomClient, 'on' | 'code' | 'seat'>` and loses `openGuns`. `MenuProps` gains `onNextSong`, `onRadio`, `onHelp`, `radioOpen`, `helpOpen` (the `.phone-extras` row: `#menu-track`, `#menu-radio`, `#menu-help`). `placeLogBelowMenu` becomes `placeLogBelowStatus`. No more toolbar, tool tips or pad.

- [ ] **Step 1: Failing tests**

Append to `test/menu.test.mjs`:

```js
test('phones get Next song, Radio and Help in the menu, each saying whether its panel is open', () => {
  const calls = { song: 0, radio: 0, help: 0 };
  const { section } = draw({
    onNextSong: () => { calls.song++; }, onRadio: () => { calls.radio++; }, onHelp: () => { calls.help++; },
    radioOpen: false, helpOpen: true,
  });
  const extras = walk(section).find(n => String(n.className || '').split(' ').includes('phone-extras'));
  assert.ok(extras);
  for (const id of ['menu-track', 'menu-radio', 'menu-help']) click(byId(extras, id));
  assert.deepEqual(calls, { song: 1, radio: 1, help: 1 });
  assert.equal(byId(section, 'menu-radio').getAttribute('aria-expanded'), 'false');
  assert.equal(byId(section, 'menu-help').getAttribute('aria-expanded'), 'true');
});
```

In `test/smoke.test.mjs`:

- Replace `for (const id of ['menu-overlay', 'btn-menu']) {` with `for (const id of ['menu-overlay', 'deck', 'hud-bar', 'field']) {` and add after that loop `check('menu-button-in-the-status-bar', rendered('btn-menu'));`.
- Replace the two lines `const menubarHtml = ...` and `check('menubar-one-primary', ...)` with:
  ```js
  const deckHtml = html.slice(html.indexOf('id="deck"'), html.indexOf('id="log-overlay"'));
  check('deck-groups', ['grp-aim', 'grp-drive', 'grp-more', 'grp-weapon', 'grp-fire'].every(g => deckHtml.includes(g)) && !/btn-primary/.test(deckHtml));
  ```
- Delete `check('pad-note', ...)`.
- Replace the `key-hints` check with `check('key-hints', html.includes('data-keyhint="global:fire" aria-hidden="true">Space<') && html.includes('data-keyhint="aim:driveLeft" aria-hidden="true">Shift+←<'));`.
- `check('solo-lost-round-costs-a-life', /^♥♥$/.test(...` → `check('solo-lost-round-costs-a-life', /^♥ 2$/.test(...` (same arguments otherwise).
- In `check('net-hud', ...)` replace `/\$600/.test(els['hud-score'].textContent)` with `/ROOM/.test(els['hud-score'].textContent)`; in `check('fx-play-hud', ...)` the same replacement.

Run: `node --test test/menu.test.mjs` — Expected: FAIL (no extras).

- [ ] **Step 2: `index.html`**

Replace everything inside `<div class="canvas-holder">` up to (not including) `<section id="log-overlay"` with:

```html
      <div class="hudbar-slot" id="hud-bar" data-ui></div>
      <div class="field" id="field">
        <canvas id="stage" width="1080" height="690" role="img"
          aria-label="Hillside artillery battlefield. Your tank, the drone battery, wind and turn order are announced in the log and the status bar."></canvas>
        <div id="title-root" data-ui></div>
        <div id="round-banner" class="banner" hidden><span id="round-banner-text"></span></div>
        <div id="dialogue" class="dialogue" hidden>
          <canvas id="portrait" width="36" height="36" aria-hidden="true"></canvas>
          <div class="dlg-text"><span id="dlg-name"></span><span id="dlg-line" aria-live="polite"></span></div>
        </div>
      </div>
      <div class="deck" id="deck" role="group" aria-label="Controls">
        <div class="grp grp-aim" role="group" aria-labelledby="deck-aim-h">
          <span class="gl" id="deck-aim-h">Aim</span>
          <div class="aim-pad">
            <span></span>
            <button type="button" class="btn gold" data-aim="up" aria-label="power up"><span class="ic" aria-hidden="true">▲</span><span class="w">power</span><kbd class="key" data-keyhint="aim:powerUp" aria-hidden="true">↑</kbd></button>
            <span></span>
            <button type="button" class="btn gold" data-aim="left" aria-label="barrel left"><span class="ic" aria-hidden="true">◀</span><span class="w">barrel</span><kbd class="key" data-keyhint="aim:barrelLeft" aria-hidden="true">←</kbd></button>
            <button type="button" class="btn gold" data-aim="down" aria-label="power down"><span class="ic" aria-hidden="true">▼</span><span class="w">power</span><kbd class="key" data-keyhint="aim:powerDown" aria-hidden="true">↓</kbd></button>
            <button type="button" class="btn gold" data-aim="right" aria-label="barrel right"><span class="ic" aria-hidden="true">▶</span><span class="w">barrel</span><kbd class="key" data-keyhint="aim:barrelRight" aria-hidden="true">→</kbd></button>
          </div>
        </div>
        <div class="grp grp-drive" role="group" aria-labelledby="deck-drive-h">
          <span class="gl" id="deck-drive-h">Drive (uses fuel)</span>
          <div class="row">
            <button type="button" id="btn-drive-l" class="btn" style="--c: #7ddf64" aria-label="Drive left"><span class="ic" aria-hidden="true">⇠</span><span class="w"><span class="w-wide">Left</span><span class="w-narrow">Drive</span></span><kbd class="key" data-keyhint="aim:driveLeft" aria-hidden="true">Shift+←</kbd></button>
            <button type="button" id="btn-drive-r" class="btn" style="--c: #7ddf64" aria-label="Drive right"><span class="ic" aria-hidden="true">⇢</span><span class="w"><span class="w-wide">Right</span><span class="w-narrow">Drive</span></span><kbd class="key" data-keyhint="aim:driveRight" aria-hidden="true">Shift+→</kbd></button>
          </div>
        </div>
        <div class="grp grp-more" role="group" aria-labelledby="deck-more-h">
          <span class="gl" id="deck-more-h">More</span>
          <div class="row">
            <button type="button" id="btn-log" class="btn" style="--c: #6fe4ff" aria-expanded="false"><span class="ic" aria-hidden="true">📻</span><span class="w">Radio</span><kbd class="key" data-keyhint="global:log" aria-hidden="true">L</kbd></button>
            <button type="button" id="btn-track" class="btn" style="--c: #ff7ad9"><span class="ic" aria-hidden="true">♫</span><span class="w">Next song</span><kbd class="key" data-keyhint="global:nextTrack" aria-hidden="true">]</kbd></button>
            <button type="button" id="btn-help" class="btn" style="--c: #8f8fff" aria-expanded="false"><span class="ic" aria-hidden="true">?</span><span class="w">Help</span><kbd class="key" data-keyhint="global:help" aria-hidden="true">H</kbd></button>
          </div>
        </div>
        <div class="grp grp-weapon" role="group" aria-labelledby="deck-weapon-h">
          <span class="gl" id="deck-weapon-h">Weapon</span>
          <button type="button" id="btn-weapon" class="btn weap" style="--c: #ffb13c" aria-expanded="false"><span id="deck-gun" class="gun" data-ui></span><kbd class="key" data-keyhint="global:guns" aria-hidden="true">G</kbd></button>
        </div>
        <div class="grp grp-fire">
          <span class="gl" aria-hidden="true">&nbsp;</span>
          <button type="button" id="btn-cannon" class="fire">FIRE<kbd class="key" data-keyhint="global:fire" aria-hidden="true">Space</kbd></button>
        </div>
      </div>
```

Delete the `#tool-tip` element (it sat after the old menubar). The overlays, veils and scripts stay as they are.

- [ ] **Step 3: `hud.ts`**

Replace `src/hud.ts` entirely:

```ts
/* Operation Tankity: the status bar's values and the Weapon button's face.
 *
 * What the status bar (src/ui/hud.tsx) shows: the aim numbers, the AMMO,
 * ARMOR, lives and WIND pills and the match badge, solo or room; and what the
 * deck's Weapon button (src/ui/gun-label.tsx) says about the loaded gun. Each
 * redraws only when its text changed, since the loop asks every frame. */
import type { GameState, GameTank, MatchState, Tables } from './game-types.ts';
import type { RoomClient } from './net.ts';
import { renderHud as drawHud } from './ui/hud.tsx';
import type { HudProps } from './ui/hud.tsx';
import { renderGunLabel as drawGun } from './ui/gun-label.tsx';
import type { GunLabelProps } from './ui/gun-label.tsx';
import { weaponLine } from './weapon-label.ts';
import type { KeyHintFn } from './ui/chrome.tsx';

/** The slice of the game's state the status bar reads (main.ts's G). */
export type HudState = Pick<GameState, 'tanks' | 'turn' | 'phase' | 'over' | 'ammo' | 'selected' | 'lives' | 'cash' | 'round'
  | 'score' | 'nextOneUp' | 'wind' | 'shield' | 'bunker' | 'jammer' | 'laststand' | 'plate'>;

/** The bar's values: HudProps without what the page supplies each draw. */
export type HudValues = Omit<HudProps, 'menuOpen' | 'menuKey' | 'onMenu'>;
type GunValues = Omit<GunLabelProps, 'drawIcon' | 'arsenalRev'>;

/** What the status bar needs from the page and the rest of the game. */
export interface HudDeps {
  G: HudState;
  $(id: string): HTMLElement | null;
  tables: Tables;
  net: Pick<RoomClient, 'on' | 'code' | 'seat'>;
  MATCH: Pick<MatchState, 'myTurn'>;
  me(): GameTank;
  cur(): GameTank;
  myTank(): GameTank | null;
  seatName(seat: number): string;
  drawShellIcon(cv: HTMLCanvasElement, wkey: string): void;
  keyHint: KeyHintFn;
  /** A touch screen: the Menu button shows no key chip. */
  touch: boolean;
  menuOpen(): boolean;
  onMenu(): void;
}

export function createHud(deps: HudDeps) {
  const { G, $, tables, net, MATCH, me, cur, myTank, seatName, drawShellIcon, keyHint, touch, menuOpen, onMenu } = deps;

  const HUD: HudValues = {
    turn: '-', angle: '-', power: '-', fuel: '-', ammo: '-', armor: { shown: '-', sr: '' }, lives: null,
    wind: '-', badge: null, online: false, runStats: '',
  };
  const GUN: GunValues = { gun: null, name: '-', sr: '', line: '' };

  /* Fitted tricks ride the rack line for readers. In room matches netOnSnapshot
  // keeps these G fields mirrored from the server snapshot. */
  function trickChips(): string[] {
    const chips: string[] = [];
    if (G.shield) chips.push('shield');
    if ((G.bunker || 0) > 0) chips.push(`bunker(${G.bunker})`);
    if ((G.jammer || 0) > 0) chips.push(`jammer(${G.jammer})`);
    if (G.laststand) chips.push('last stand');
    if ((G.plate || 0) > 0) chips.push(`plate(+${25 * G.plate})`);
    return chips;
  }
  /* The loaded gun: the Weapon button names it with its damage and blast
     size, the AMMO pill counts it, and readers also hear the rest of the rack. */
  function renderLoadout(): void {
    const count = (w: string) => (w === 'shell' ? '∞' : '×' + (G.ammo![w] || 0));
    const rack = tables.order.filter(w => w !== G.selected && ((G.ammo![w] || 0) > 0 || w === 'shell'))
      .map(w => `${tables.weapons[w]!.name} ${count(w)}`).concat(trickChips());
    const w = tables.weapons[G.selected]!;
    HUD.ammo = count(G.selected);
    GUN.gun = G.selected;
    GUN.name = w.name;
    GUN.sr = ` ${count(G.selected)}${rack.length ? ` · also ${rack.join(' · ')}` : ''}`;
    GUN.line = weaponLine(w);
  }
  let hudShown = '';
  let gunShown = '';
  function paintHud(): void {
    const slot = $('deck-gun');
    const gunSig = JSON.stringify(GUN) + '|' + tables.rev;
    if (slot && gunSig !== gunShown) {
      gunShown = gunSig;
      drawGun(slot, { ...GUN, drawIcon: drawShellIcon, arsenalRev: tables.rev });
    }
    const bar = $('hud-bar');
    if (!bar) return;
    const open = menuOpen();
    const menuKey = touch ? '' : keyHint('global', 'escape');
    const sig = JSON.stringify(HUD) + '|' + open + '|' + menuKey;
    if (sig === hudShown) return;
    hudShown = sig;
    drawHud(bar, { ...HUD, menuOpen: open, menuKey, onMenu });
  }
  function renderStanding(mine: GameTank | null, others: string): void {
    HUD.armor = {
      shown: mine ? `${Math.max(0, Math.round(mine.hp))}` : '-',
      sr: `${mine ? `you ${Math.max(0, Math.round(mine.hp))} · ` : ''}${others}`,
    };
    HUD.lives = G.lives;
    HUD.badge = net.on
      ? { kind: 'room', code: net.code, seat: `P${net.seat + 1}`, round: G.round }
      : { kind: 'solo', cash: G.cash, round: G.round, score: G.score, nextOneUp: G.nextOneUp };
  }
  function windText(): string {
    if (G.wind === 0) return '· 0';
    return (G.wind > 0 ? '→ ' : '← ') + Math.abs(G.wind);
  }
  function renderHUD(): void {
    if (net.on) { renderNetHUD(); return; }
    if (!G.tanks.length) return;
    const t = cur() || me();
    HUD.turn =
      G.phase === 'shop' ? 'shop. Spend it!' :
      G.over ? 'match over' :
      G.phase === 'banner' ? 'get ready...' :
      t.isPlayer ? (G.phase === 'aim' ? 'YOU. Aim!' : 'you fired…') : `${t.id} aiming…`;
    HUD.angle = `${Math.round(me().angle)}°`;
    HUD.power = `${Math.round(me().power)}`;
    HUD.wind = windText();
    renderLoadout();
    renderStanding(me(), G.tanks.filter(x => !x.isPlayer).map(x => `${x.id}:${Math.max(0, x.hp)}`).join(' '));
    HUD.fuel = `${Math.round(me().fuel)}`;
    paintHud();
  }
  function renderNetHUD(): void {
    if (!G.tanks.length) return;
    const mine = myTank();
    const turnTank = G.tanks[G.turn] || G.tanks[0]!;
    HUD.turn =
      G.phase === 'shop' ? 'shop. Spend it!' :
      G.over ? 'match over' :
      !mine || mine.hp <= 0 ? 'wrecked. Watching ' + seatName(turnTank.seat!) + '...' :
      MATCH.myTurn ? 'YOU. Aim!' : `${seatName(turnTank.seat!)} aiming...`;
    HUD.angle = mine ? `${Math.round(mine.angle)}°` : '-';
    HUD.power = mine ? `${Math.round(mine.power)}` : '-';
    HUD.wind = windText();
    renderLoadout();
    renderStanding(mine, G.tanks.filter(x => !x.isPlayer).map(x => `${seatName(x.seat!)}:${Math.max(0, Math.round(x.hp))}`).join(' '));
    HUD.fuel = mine ? `${Math.round(mine.fuel)}` : '-';
    paintHud();
  }

  return { HUD, paintHud, windText, renderHUD };
}
```

- [ ] **Step 4: `main.ts`**

1. Replace the `createHud({...})` call with:
   ```ts
   const { HUD, paintHud, windText, renderHUD } = createHud({
     G, $, tables, net, MATCH, me, cur, myTank, seatName, drawShellIcon, keyHint, touch: TOUCH,
     menuOpen: () => { const mv = $('menu-overlay'); return !!mv && !mv.hidden; },
     onMenu: () => toggleOverlay('menu-overlay', 'btn-menu'),
   });
   ```
2. Delete `TIP_DELAY_MS`, the whole `bindToolTips` function with its comment, and its call in `init()`.
3. In `init()`, delete the two lines that find `btn-menu` and add its click listener (the Menu button is the status bar's now).
4. Rename `placeLogBelowMenu` to `placeLogBelowStatus` everywhere in `main.ts` and replace its definition (with its comment) by:
   ```ts
   /* The radio log hangs just under the status bar, whose height changes with
      the frame width. */
   function placeLogBelowStatus(): void {
     const bar = $('hud-bar');
     const log = $('log-overlay');
     if (!bar || !log || !bar.offsetHeight) return;
     log.style.top = `${bar.offsetTop + bar.offsetHeight + 6}px`;
   }
   ```
5. In `toggleOverlay`, add `paintHud();` before `refreshNavHints();` (the Menu button's `aria-expanded` is a prop of the bar).
6. In `applyKeys`, add `paintHud();` after `renderKeyHints();`.
7. In the `createMenu({...})` call replace `placeLogBelowMenu` with `placeLogBelowStatus` and add `nextSong: () => { unlock(); music.next(); },`.

- [ ] **Step 5: Menu extras for phones**

`src/ui/menu.tsx`: add to `MenuProps`:

```tsx
  /** The phone-only row (the deck has no room for them there): Next song, Radio and Help. */
  onNextSong: () => void;
  onRadio: () => void;
  onHelp: () => void;
  radioOpen: boolean;
  helpOpen: boolean;
```

and, directly after the `Options` row's closing `</div>` (the toggles row), add:

```tsx
        <div class="unit-row phone-extras" role="group" aria-labelledby="extras-label">
          <span class="unit-label" id="extras-label">More</span>
          <div class="unit-picker">
            <button type="button" id="menu-track" class="m-track" onClick={blurThen(p.onNextSong)}>Next song</button>
            <button type="button" id="menu-radio" class="m-radio" aria-expanded={p.radioOpen} onClick={blurThen(p.onRadio)}>Radio</button>
            <button type="button" id="menu-help" class="m-help" aria-expanded={p.helpOpen} onClick={blurThen(p.onHelp)}>Help</button>
          </div>
        </div>
```

`src/menu.ts`: rename the dep `placeLogBelowMenu` to `placeLogBelowStatus` (interface, destructuring, the call in `applyTextSize`); add `nextSong(): void;` to `MenuDeps` and the destructuring; in `renderMenu` add:

```ts
      onNextSong: nextSong,
      // Radio and Help close the menu, then open their panel in its place.
      onRadio: () => { toggleOverlay('menu-overlay', 'btn-menu'); toggleOverlay('log-overlay', 'btn-log'); },
      onHelp: () => { toggleOverlay('menu-overlay', 'btn-menu'); toggleOverlay('help-overlay', 'btn-help'); },
      radioOpen: !($('log-overlay')?.hidden ?? true),
      helpOpen: !($('help-overlay')?.hidden ?? true),
```

`game.css`, in `.log-overlay`'s rule, change the comment `/* placeLogBelowMenu() sets the measured value */` to `/* placeLogBelowStatus() sets the measured value */`.

- [ ] **Step 6: Build and run**

Run: `node ../_kit/build/build.mjs tankity && php tools/install-files.php && node --test test/*.test.mjs`
Expected: build clean; PASS except the smoke checks on the old CSS (`css-actions-grid`, `css-menu-top`, `css-menu-centered`, `css-menu-row`, `css-menu-block`, `css-stats-strip`, `css-fit-windowed`), which Task 20 replaces. Run `grep -rn "menubar\|bindToolTips\|tool-tip\|placeLogBelowMenu\|openGuns: () => openGuns()" src index.html` — Expected: no output.

- [ ] **Step 7: Commit**

```bash
git add src index.html game.css dist sw.js test/menu.test.mjs test/smoke.test.mjs
git commit -m "Tankity page: status bar on top, battlefield, a labelled control deck; no toolbar or tips"
```

---

### Task 20: The layout CSS and `tankity-layout`

**Files:**
- Modify: `game.css`, `test/smoke.test.mjs`
- Create: `websites/www.cs/tests/e2e/tankity-layout.spec.mjs`

**Interfaces:**
- Consumes: the markup of Task 19.
- Produces: breakpoints on the frame's width (`#frame` is the container): ≤ 1100 short labels, ≤ 860 an 11 px bar, ≤ 760 no chips; portrait phone `(orientation: portrait) and (max-width: 600px)`; landscape phone `(orientation: landscape) and (max-height: 500px)`. Desktop deck buttons and FIRE are 55 px tall; touch targets 44 px or more.

- [ ] **Step 1: Write the failing spec**

`tests/e2e/tankity-layout.spec.mjs`:

```js
// Operation Tankity on eight screens, measured with the widest values the
// bars can show (the approach of the design's layout-measure.mjs): nothing in
// the status bar wraps or clips, the deck fits, the page fits the screen,
// chips in a row line up, and phone targets are thumb-sized.
import { test, expect } from '@playwright/test';
import { recorderScript, newPlayer } from './helpers.mjs';

const DEVICES = [
  ['Desktop', 1280, 720, false], ['Laptop, small window', 1024, 640, false],
  ['Tablet, landscape', 1180, 820, true], ['Tablet, portrait', 820, 1180, true],
  ['iPhone 15, portrait', 393, 852, true], ['Small Android, portrait', 360, 740, true],
  ['iPhone 15, landscape', 852, 393, true], ['Small Android, landscape', 740, 360, true],
];
const phone = ([, w, h]) => Math.min(w, h) < 600;
const landscapePhone = ([, w, h]) => phone([0, w, h]) && w > h;

async function open(browser, [, width, height, touch], { text } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height }, hasTouch: touch, isMobile: touch });
  await ctx.addInitScript(recorderScript);
  if (text) await ctx.addInitScript(t => { try { localStorage.setItem('tankity-text', t); } catch (_) { /* fine */ } }, text);
  const page = await ctx.newPage();
  await page.clock.install();
  await page.goto('games/tankity/');
  await page.waitForSelector('#hud-score > span');
  // Hold the frames still so no repaint undoes the values set below.
  await page.clock.pauseAt(Date.now() + 2000);
  return { ctx, page };
}

/* The worst case the spec names: angle 162°, power 100, fuel 100, ♥ 5,
   $12,450, round 13, 98,760 pts; a room badge is ROOM ABCD | YOU P2 | RND 13. */
function setWorst(room) {
  const put = (sel, v) => { document.querySelector(sel).textContent = v; };
  put('#hud-angle', '162°'); put('#hud-power', '100'); put('#hud-fuel', '100');
  put('#hud-ammo', '×12'); put('#hud-armor', '175'); put('#hud-lives .v', '5'); put('#hud-wind', '← 12');
  const segs = document.querySelectorAll('#hud-score > span');
  if (room) {
    segs[0].innerHTML = '<span class="k">ROOM</span> <span class="v">ABCD</span><span class="dot on"></span>';
    segs[1].innerHTML = '<span class="k">YOU</span> <span class="v">P2</span>';
  } else {
    segs[0].querySelector('.v').textContent = '$12,450';
    segs[2].querySelector('.v').textContent = '98,760';
  }
  segs[1].parentElement.children[room ? 2 : 1].querySelector('.v').textContent = '13';
}

function measure() {
  const probs = [];
  const clipped = el => el.getClientRects().length > 1 || el.scrollWidth > el.clientWidth + 0.5;
  const bar = document.querySelector('#hud-bar .hud');
  if (bar.scrollWidth > bar.clientWidth + 0.5) probs.push(`status bar overflows by ${bar.scrollWidth - bar.clientWidth}px`);
  const stacked = getComputedStyle(bar).flexDirection === 'column';
  const rows = new Map();
  for (const el of bar.querySelectorAll('.menu-btn, .stat, .pill, .seg')) {
    if (!el.getClientRects().length) continue;
    const key = stacked ? el.closest('.hud-row').className : 'one row';
    if (!rows.has(key)) rows.set(key, []);
    rows.get(key).push(el);
  }
  for (const [name, els] of rows) {
    const mids = els.map(el => { const r = el.getBoundingClientRect(); return r.top + r.height / 2; });
    if (Math.max(...mids) - Math.min(...mids) > 1) probs.push(`status ${name} wraps`);
    const box = (stacked ? els[0].closest('.hud-row') : bar).getBoundingClientRect();
    for (const el of els) {
      const r = el.getBoundingClientRect();
      if (clipped(el)) probs.push(`${el.className} clipped`);
      if (r.left < box.left - 0.5 || r.right > box.right + 0.5) probs.push(`${el.className} sticks out of ${name}`);
    }
  }
  const deck = document.getElementById('deck');
  if (getComputedStyle(deck).position !== 'absolute' && deck.scrollWidth > deck.clientWidth + 0.5) {
    probs.push(`deck overflows by ${deck.scrollWidth - deck.clientWidth}px`);
  }
  for (const el of deck.querySelectorAll('button')) {
    if (!el.getClientRects().length) continue;
    const r = el.getBoundingClientRect();
    if (clipped(el)) probs.push(`${el.id || el.dataset.aim} clipped`);
    if (r.bottom > innerHeight + 0.5 || r.right > innerWidth + 0.5 || r.left < -0.5) probs.push(`${el.id || el.dataset.aim} off screen`);
  }
  const doc = document.documentElement;
  if (doc.scrollHeight > innerHeight + 0.5) probs.push(`page taller than the screen by ${doc.scrollHeight - innerHeight}px`);
  if (doc.scrollWidth > innerWidth + 0.5) probs.push(`page wider than the screen by ${doc.scrollWidth - innerWidth}px`);
  return probs;
}

/* Spread of chip centres among buttons of one row (same top and height). */
function chipSpreads() {
  const rows = new Map();
  for (const k of document.querySelectorAll('#deck kbd.key, #hud-bar kbd.key')) {
    if (!k.getClientRects().length) continue;
    const b = k.closest('button').getBoundingClientRect();
    const key = `${Math.round(b.top)}|${Math.round(b.height)}`;
    const r = k.getBoundingClientRect();
    if (!rows.has(key)) rows.set(key, []);
    rows.get(key).push(r.top + r.height / 2);
  }
  const menu = document.querySelector('#btn-menu'), chip = menu.querySelector('kbd.key');
  const m = menu.getBoundingClientRect(), c = chip ? chip.getBoundingClientRect() : null;
  return { rows: [...rows.values()].map(v => Math.max(...v) - Math.min(...v)), menu: c ? Math.abs((c.top + c.height / 2) - (m.top + m.height / 2)) : null };
}

function smallTargets() {
  return [...document.querySelectorAll('#hud-bar button, #deck button')]
    .filter(el => el.getClientRects().length)
    .map(el => [el.id || el.dataset.aim, el.getBoundingClientRect()])
    .filter(([, r]) => r.width < 43.5 || r.height < 43.5)
    .map(([id, r]) => `${id} ${Math.round(r.width)}×${Math.round(r.height)}`);
}

for (const dev of DEVICES) {
  test(`${dev[0]} ${dev[1]}×${dev[2]}: solo and room bars fit, the deck fits, the page fits`, async ({ browser }) => {
    const { ctx, page } = await open(browser, dev);
    for (const room of [false, true]) {
      await page.evaluate(setWorst, room);
      expect(await page.evaluate(measure), room ? 'room' : 'solo').toEqual([]);
      await page.screenshot({ path: `test-results/tankity-layout-${dev[1]}x${dev[2]}-${room ? 'room' : 'solo'}.png` });
    }
    const chips = await page.evaluate(chipSpreads);
    if (!dev[3]) {
      expect(chips.rows.length).toBeGreaterThan(0);
      for (const s of chips.rows) expect(s).toBeLessThanOrEqual(1);
      expect(chips.menu).toBeLessThanOrEqual(1);
      const h = await page.evaluate(() => ['btn-weapon', 'btn-help', 'btn-drive-l', 'btn-cannon'].map(id => document.getElementById(id).getBoundingClientRect().height));
      for (const x of h) expect(Math.abs(x - 55)).toBeLessThan(0.6);
    } else {
      expect(chips.rows, 'no chips on a touch screen').toEqual([]);
    }
    const up = await page.locator('#deck [data-aim="up"]').evaluate(b => [getComputedStyle(b).backgroundColor, getComputedStyle(b).color]);
    if (!landscapePhone(dev)) expect(up).toEqual(['rgb(255, 201, 60)', 'rgb(17, 17, 17)']);
    if (phone(dev)) {
      await expect(page.locator('.topbar')).toBeHidden();
      expect(await page.evaluate(smallTargets)).toEqual([]);
      await expect(page.locator('#btn-track')).toBeHidden();
      if (landscapePhone(dev)) {
        await expect(page.locator('#btn-log')).toBeHidden();
        await expect(page.locator('#btn-help')).toBeHidden();
      }
      await page.locator('#btn-menu').tap();
      await expect(page.locator('#menu-track')).toBeVisible();
      for (const id of ['#menu-radio', '#menu-help']) {
        if (landscapePhone(dev)) await expect(page.locator(id)).toBeVisible();
        else await expect(page.locator(id)).toBeHidden();
      }
    } else {
      await expect(page.locator('.phone-extras')).toBeHidden();
    }
    await ctx.close();
  });
}

const lin = c => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const over = (fg, alpha, bg) => fg.map((c, i) => c * alpha + bg[i] * (1 - alpha));

test('the translucent landscape arrow keys keep white words readable; other buttons stay solid', async ({ browser }) => {
  const { ctx, page } = await open(browser, DEVICES[6]);
  const [bg, color, shadow] = await page.locator('#deck [data-aim="up"]').evaluate(b => { const c = getComputedStyle(b); return [c.backgroundColor, c.color, c.textShadow]; });
  expect(bg).toBe('rgba(255, 201, 60, 0.55)');
  expect(color).toBe('rgb(255, 255, 255)');
  expect(shadow).toContain('rgb(0, 0, 0)');
  // Over the night sky the fill alone gives 4.5:1; over the hills the dark halo carries the words.
  expect(contrast([255, 255, 255], over([255, 201, 60], 0.55, [0, 0, 11]))).toBeGreaterThanOrEqual(4.5);
  expect(await page.locator('#btn-drive-l').evaluate(b => getComputedStyle(b).backgroundColor)).toBe('rgb(10, 13, 38)');
  await ctx.close();
});

test('the Huge text size leaves the bars fitting on the smallest phone', async ({ browser }) => {
  const { ctx, page } = await open(browser, DEVICES[5], { text: 'xl' });
  expect(await page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).fontSize))).toBeCloseTo(20.8, 1);
  await page.evaluate(setWorst, false);
  expect(await page.evaluate(measure)).toEqual([]);
  await ctx.close();
});

test('chatter is a one-line toast inside the battlefield, never over the status bar', async ({ browser }) => {
  const { page, ctx, errors } = await newPlayer(browser, undefined, { clock: true });
  await page.keyboard.press('n');
  await expect.poll(async () => { await page.clock.runFor(500); return page.locator('#dialogue').isVisible(); }, { timeout: 10_000 }).toBe(true);
  const [d, h, f] = [await page.locator('#dialogue').boundingBox(), await page.locator('#hud-bar').boundingBox(), await page.locator('#field').boundingBox()];
  expect(d.y).toBeGreaterThanOrEqual(h.y + h.height);
  expect(d.y).toBeGreaterThanOrEqual(f.y);
  expect(d.height).toBeLessThan(32);
  expect(await page.locator('#dialogue').evaluate(e => getComputedStyle(e).whiteSpace)).toBe('nowrap');
  expect(errors).toEqual([]);
  await ctx.close();
});
```

`setWorst`'s room branch leaves `segs[2]`'s ROUND label as it was; the last line sets the round value in the segment that holds it (index 1 solo, 2 room).

Add `'tankity-layout.spec.mjs': 15,` to `WEIGHTS` in `shard.mjs`.

Run: `cd websites/www.cs && make e2e E2E_ARGS="tankity-layout.spec.mjs"` — Expected: FAIL (no layout CSS yet).

- [ ] **Step 2: Remove the old layout rules**

In `game.css` delete every rule whose selector names `.menubar`, `.pad`, `.pad-aim`, `.pad-grid`, `.pad-note`, `.pad-label`, `.guide`, `.guide-actions`, `.tool`, `.tool-icon`, `.tool-tip`, `.tool-tip-name`, `.tool-tip-desc`, `.hudbar`, `.chip`, `.chip-icon`, `#portrait`, `.dlg-text`, `#dlg-name`, `#dlg-line`, `.dialogue` or `.canvas-holder .dialogue`, plus `@keyframes tip-in` and its reduced-motion rule, the whole `@media (max-width: 700px) { ... }` block, both `.canvas-holder { ... }` rules, `#stage { ... }`, both `#frame:fullscreen ...` rules, and the `.layout { ... }` rule. Where a selector list also names something else, drop only these selectors: `button.btn-primary, .pad-grid button` becomes `button.btn-primary` (twice), and `.touch .key, .touch .keys-only, .touch .nav-hint, .touch .pad-note` becomes `.touch .key, .touch .keys-only, .touch .nav-hint`. In the row-12 `.title-veil` rule replace `left: 0.6rem; right: 0.6rem; top: 0.6rem; aspect-ratio: 1080 / 690;` (four lines) with `inset: 0;` and its comment's "so the toolbar stays usable" with "so the bars stay usable".

Run: `grep -nE 'menubar|\.pad|guide|\.tool|tool-tip|\.chip|hudbar|\.dialogue|#portrait' game.css` — Expected: no output.

- [ ] **Step 3: The new layout**

Append to `game.css`:

```css
/* ---------- the frame: status bar, battlefield, control deck ----------
   The page is one screen tall: the header, then the frame's three parts, the
   battlefield taking what is left. The bars size in px so the text-size
   setting (which scales the panels) never pushes them over; their
   breakpoints follow the frame's own width. */
body { height: 100dvh; display: flex; flex-direction: column; }
.topbar { flex: none; padding: 0.5rem 1.25rem; }
.layout { flex: 1; min-height: 0; display: grid; grid-template-columns: minmax(0, 1120px); justify-content: center; padding: 0.5rem; }
#frame { container-type: inline-size; height: 100%; min-height: 0; }
.canvas-holder {
  position: relative; display: flex; flex-direction: column; gap: 6px; height: 100%; width: 100%; margin: 0;
  padding: 6px; background: #05060a; border: 1px solid var(--line); border-radius: 10px; user-select: none;
}
.field { position: relative; flex: 1; min-height: 0; display: grid; grid-template: minmax(0, 1fr) / minmax(0, 1fr); place-items: center; }
#stage { display: block; width: auto; height: auto; max-width: 100%; max-height: 100%; border-radius: 6px; }
#frame:fullscreen { background: var(--bg); padding: 0.5rem; width: 100%; height: 100%; overflow: hidden; }
#frame:fullscreen .canvas-holder { max-width: 1600px; margin: 0 auto; }

/* Status bar: Menu, angle, power, fuel, the AMMO, ARMOR, lives and WIND
   pills, and the match badge at the far end. */
#hud-bar { flex: none; }
#hud-bar .runstats { display: none; }
.hud {
  display: flex; align-items: center; gap: 10px; min-width: 0; padding: 5px 8px;
  background: #0c0f2e; border: 1px solid #3a3fb0; border-radius: 9px; color: #eef;
  font: 13px/1.2 system-ui, -apple-system, "Segoe UI", sans-serif; white-space: nowrap;
}
.hud-row { display: contents; }
.hud .k { color: #9aa3c7; font-size: 0.78em; letter-spacing: 0.06em; }
.hud .v { color: #7f7; font-weight: 800; font-variant-numeric: tabular-nums; }
.hud .stat { flex: none; }
.hud .short { display: none; }
#frame .menu-btn {
  display: inline-flex; align-items: center; gap: 6px; flex: none; height: 26px; padding: 0 9px;
  font: 800 13px/1 system-ui, sans-serif; color: #111; background: var(--accent); border: 1px solid var(--accent); border-radius: 6px;
}
.menu-icon { width: 14px; height: 14px; }
.pill { display: inline-flex; align-items: center; gap: 5px; flex: none; padding: 2px 9px; background: #11163a; border: 1px solid #5a63e0; border-radius: 999px; }
.pill.ammo { border-color: #ffb13c; }
.pill.ammo .v { color: #ffb13c; }
.pill.armor { border-color: #7ddf64; }
.pill.lives { border-color: #ff5c8a; }
.pill.lives .v, .pill.lives .hearts { color: #ff5c8a; }
.seg { display: inline-flex; align-items: stretch; flex: none; margin-left: auto; border: 1px solid #3a3fb0; border-radius: 8px; overflow: hidden; }
.seg > span { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; }
.seg > span + span { border-left: 1px solid #3a3fb0; }
.seg .cash .v { color: #ffd75e; }
.seg .dot { margin-left: 4px; }

/* Control deck: Aim, Drive, More, Weapon and a big FIRE, each labelled. Chips
   sit at the foot of their button, so chips in a row line up. */
#deck {
  --chip: 4px;
  flex: none; display: flex; align-items: flex-end; justify-content: space-between; gap: 10px;
  padding: 8px; background: #0c0f2e; border: 1px solid #3a3fb0; border-radius: 10px;
}
@media (hover: hover) and (pointer: fine) { #deck { --chip: 18px; } }
.touch #deck { --chip: 4px; }
.grp { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.gl { font: 9px/1.2 system-ui, sans-serif; letter-spacing: 0.12em; color: #9aa3c7; text-transform: uppercase; }
#deck .row { display: flex; gap: 5px; }
.aim-pad { display: grid; grid-template-columns: repeat(3, auto); gap: 4px; }
#frame #deck .btn {
  position: relative; display: inline-flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px;
  min-width: 48px; height: 55px; padding: 4px 8px var(--chip); border: 1.5px solid var(--c, #667); border-radius: 9px;
  background: #0a0d26; color: #eef; font: 700 11px/1.15 system-ui, sans-serif; white-space: nowrap;
}
#deck .btn .ic { font-size: 14px; line-height: 1; color: var(--c); }
#frame #deck .btn.gold { background: var(--accent); border-color: var(--accent); color: #111; }
#deck .btn.gold .ic { color: #111; }
#frame .aim-pad .btn { height: 54px; }
#deck .w-narrow { display: none; }
#deck .key { position: absolute; left: 50%; bottom: 3px; transform: translateX(-50%); }
#frame #deck .weap { min-width: 96px; }
#deck .gun { display: flex; flex-direction: column; align-items: center; gap: 2px; }
#deck .gun-top { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 800; }
#deck .gun-icon { width: 28px; height: 18px; }
#deck .gun-line { font-size: 10px; font-weight: 700; color: #ffb13c; }
#frame #deck .fire {
  position: relative; display: inline-flex; flex-direction: column; align-items: center; justify-content: center;
  width: 120px; height: 55px; padding: 0 0 var(--chip); border: 0; border-radius: 12px; background: #e33; color: #fff;
  font: 900 16px/1 system-ui, sans-serif; box-shadow: 0 0 0 4px rgba(238, 51, 51, 0.3);
}
#deck [aria-expanded="true"] { box-shadow: 0 0 0 2px var(--c, var(--accent)); }
.phone-extras { display: none; }
/* Touch screens: no chips, thumb-sized targets. */
.touch #frame #deck .btn { height: 46px; min-width: 46px; font-size: 10px; padding: 2px 5px; }
.touch #frame .aim-pad .btn { height: 44px; }
.touch #frame #deck .fire { height: 46px; }
.touch #frame .menu-btn { height: 44px; min-width: 44px; }

/* Chatter: a one-line toast at the top of the battlefield. */
#dialogue {
  position: absolute; top: 8px; left: 50%; transform: translateX(-50%); z-index: 2;
  display: flex; align-items: center; max-width: calc(100% - 16px); padding: 3px 9px;
  background: rgba(12, 15, 46, 0.88); border: 1px solid #3a3fb0; border-radius: 7px;
  font-size: 0.72rem; line-height: 1.3; white-space: nowrap; pointer-events: none;
}
#dialogue[hidden] { display: none; }
#dialogue > canvas { display: none; }
#dialogue > div { display: flex; gap: 0.4rem; min-width: 0; }
#dialogue span + span { overflow: hidden; text-overflow: ellipsis; }
#dialogue span:first-child { font-weight: 800; letter-spacing: 0.04em; }

/* The frame's own width decides: short labels, then an 11 px bar, then no chips. */
@container (max-width: 1100px) {
  .hud { font-size: 12px; gap: 7px; }
  .hud .full { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
  .hud .short { display: inline; }
}
@container (max-width: 860px) {
  .hud { font-size: 11px; gap: 6px; padding: 4px 6px; }
  .pill { padding: 1px 7px; }
  .seg > span { padding: 1px 6px; }
}
@container (max-width: 760px) {
  #frame .menu-btn { height: 24px; padding: 0 7px; }
  .key { display: none !important; }
  #deck { --chip: 4px; }
}

/* Portrait phone: no page header; the status bar in three rows (Menu and the
   aim numbers, the four pills, the badge across); the deck without headings,
   Weapon on FIRE beside the arrows (its top level with ▲), Drive, Radio and
   Help along the foot; Next song moves to the Menu. */
@media (orientation: portrait) and (max-width: 600px) {
  .topbar { display: none; }
  .layout { padding: 4px; }
  .hud { flex-direction: column; align-items: stretch; gap: 4px; }
  .hud-row { display: flex; align-items: center; justify-content: space-between; gap: 6px; }
  .seg { flex: 1; margin-left: 0; justify-content: space-around; }
  #deck { display: grid; grid-template-columns: auto minmax(0, 1fr); grid-template-areas: "aim weapon" "aim fire" "drive more"; gap: 6px; align-items: stretch; }
  .grp-aim { grid-area: aim; }
  .grp-weapon { grid-area: weapon; align-items: stretch; }
  .grp-fire { grid-area: fire; align-items: stretch; }
  .grp-drive { grid-area: drive; align-items: flex-start; }
  .grp-more { grid-area: more; align-items: flex-end; }
  .gl { display: none; }
  .grp { gap: 0; }
  #frame #deck .weap { width: 100%; height: 44px; }
  #frame #deck .fire { width: 100%; height: auto; min-height: 44px; }
  #btn-track { display: none; }
  #deck .w-wide { display: none; }
  #deck .w-narrow { display: inline; }
  .phone-extras { display: flex; }
  .phone-extras .m-radio, .phone-extras .m-help { display: none; }
}

/* Landscape phone: no page header; the controls float over the battlefield's
   lower corners (arrows left, Drive centre, Weapon above FIRE right) and the
   arrow keys turn translucent so the hills show through; Radio, Help and
   Next song move to the Menu. */
@media (orientation: landscape) and (max-height: 500px) {
  .topbar { display: none; }
  .layout { padding: 4px; }
  #deck {
    position: absolute; left: 12px; right: 12px; bottom: 12px; z-index: 4;
    display: grid; grid-template-columns: auto 1fr auto; grid-template-areas: ". . weapon" "aim drive fire";
    align-items: end; row-gap: 8px; padding: 0; background: none; border: 0; pointer-events: none;
  }
  #deck > * { pointer-events: auto; }
  .gl, .grp-more { display: none; }
  .grp-aim { grid-area: aim; }
  .grp-drive { grid-area: drive; justify-self: center; }
  .grp-weapon { grid-area: weapon; }
  .grp-fire { grid-area: fire; }
  #frame #deck .weap { width: 96px; height: 44px; }
  #frame #deck .fire { width: 96px; height: 46px; }
  #frame #deck .btn.gold { background: rgba(255, 201, 60, 0.55); border-color: rgba(255, 201, 60, 0.9); color: #fff; text-shadow: 0 0 2px #000, 0 1px 2px #000; }
  #deck .btn.gold .ic { color: #fff; }
  #deck .w-wide { display: none; }
  #deck .w-narrow { display: inline; }
  .phone-extras { display: flex; }
}
```

(`#dialogue`'s children are addressed by position so the class names `.dlg-text` and the ids stay as they are in `index.html` while the grep in Step 2 stays clean.)

- [ ] **Step 4: The smoke checks on the CSS**

In `test/smoke.test.mjs` delete `css-actions-grid`, `css-menu-top`, `css-menu-centered`, `css-menu-row`, `css-menu-block` and `css-stats-strip`, and replace `check('css-fit-windowed', /\.canvas-holder\s*\{[^}]*100vh/.test(css));` with:

```js
check('css-fit-windowed', /\nbody\s*\{[^}]*height:\s*100dvh/.test(css) && /\n\.field\s*\{[^}]*flex:\s*1/.test(css));
check('css-breakpoints', ['@container (max-width: 1100px)', '@container (max-width: 860px)', '@container (max-width: 760px)'].every(q => css.includes(q)));
```

- [ ] **Step 5: Build, run, adjust**

Run: `node ../_kit/build/build.mjs tankity && php tools/install-files.php && node --test test/*.test.mjs`
Expected: PASS.

Run: `cd websites/www.cs && make e2e E2E_ARGS="tankity-layout.spec.mjs"`
Expected: PASS. If a device reports a problem, the message names the element and the pixels; fix it in this CSS only (tighten that breakpoint's gap or padding, or a button's min-width), never by changing the spec's values, and rerun. Look at `test-results/tankity-layout-*.png` once against `layout-all-devices.html`.

- [ ] **Step 6: Commit**

```bash
git add game.css index.html dist sw.js test/smoke.test.mjs ../../tests/e2e/tankity-layout.spec.mjs ../../tests/e2e/shard.mjs
git commit -m "Tankity layout: status bar, deck, portrait and landscape phones, measured on eight screens"
```

---

### Task 21: `tankity-a11y`, the specs that met the old bars; PR 13

**Files:**
- Create: `websites/www.cs/tests/e2e/tankity-a11y.spec.mjs`
- Delete: `websites/www.cs/tests/e2e/tankity-toolbar.spec.mjs`
- Modify: `websites/www.cs/tests/e2e/package.json`, `package-lock.json`, `shard.mjs`, `tankity-hud.spec.mjs`, `tankity-solo.spec.mjs`, `tankity-pickers.spec.mjs`, `tankity-end.spec.mjs`
- Modify: `websites/www.cs/games/tankity/README.md`

- [ ] **Step 1: axe-core**

Run: `cd websites/www.cs/tests/e2e && npm install --save-dev @axe-core/playwright@^4.10.2`
Expected: `package.json` lists it under `devDependencies`; the lockfile updates.

- [ ] **Step 2: The spec**

`tests/e2e/tankity-a11y.spec.mjs`:

```js
// Operation Tankity's accessibility: axe-core over the title card, the status
// bar, the deck and the open menu; every panel opener says whether its panel
// is open; and each control's visible words are part of its name.
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { newPlayer } from './helpers.mjs';

const scan = async (page, include) => (await new AxeBuilder({ page }).include(include)
  .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()).violations
  .map(v => `${v.id}: ${v.nodes.map(n => n.target.join(' ')).join(', ')}`);

test('axe finds nothing on the title card, the status bar, the deck or the open menu', async ({ browser }) => {
  const { page, errors } = await newPlayer(browser);
  for (const part of ['#title-card', '#hud-bar', '#deck']) expect(await scan(page, part), part).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(page.locator('#menu-overlay')).toBeVisible();
  expect(await scan(page, '#menu-overlay')).toEqual([]);
  expect(errors).toEqual([]);
});

test('every panel opener carries aria-expanded and it follows the panel', async ({ browser }) => {
  const { page } = await newPlayer(browser);
  for (const id of ['btn-menu', 'btn-log', 'btn-help', 'btn-weapon', 'title-settings']) {
    await expect(page.locator('#' + id)).toHaveAttribute('aria-expanded', 'false');
  }
  for (const [btn, key, panel] of [['btn-log', 'l', 'log-overlay'], ['btn-help', 'h', 'help-overlay'], ['btn-menu', 'Escape', 'menu-overlay']]) {
    await page.keyboard.press(key);
    await expect(page.locator('#' + panel)).toBeVisible();
    await expect(page.locator('#' + btn)).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press(key === 'Escape' ? 'Escape' : key);
    await expect(page.locator('#' + btn)).toHaveAttribute('aria-expanded', 'false');
  }
});

test('each control\'s visible words are part of its accessible name', async ({ browser }) => {
  const { page } = await newPlayer(browser);
  const misses = await page.evaluate(() => {
    const out = [];
    for (const b of document.querySelectorAll('#hud-bar button, #deck button, #title-card button')) {
      if (!b.getClientRects().length) continue;
      const words = [];
      const walk = n => {
        for (const c of n.childNodes) {
          if (c.nodeType === 3) words.push(c.textContent);
          else if (c.nodeType === 1 && c.getAttribute('aria-hidden') !== 'true' && c.getClientRects().length) walk(c);
        }
      };
      walk(b);
      const visible = words.join(' ').replace(/\s+/g, ' ').trim().toLowerCase();
      const name = (b.getAttribute('aria-label') || b.textContent).replace(/\s+/g, ' ').trim().toLowerCase();
      if (visible && !name.includes(visible)) out.push(`${b.id || b.dataset.aim}: "${visible}" not in "${name}"`);
    }
    return out;
  });
  expect(misses).toEqual([]);
});
```

When axe reports a violation, fix the markup it names (the report gives the rule and the selector) in the component or `index.html`, never by narrowing the tags or the included parts.

`shard.mjs` `WEIGHTS`: add `'tankity-a11y.spec.mjs': 10,` and delete `'tankity-toolbar.spec.mjs': 8,`.

- [ ] **Step 3: Specs that met the old bars**

- Delete `tests/e2e/tankity-toolbar.spec.mjs` (icon toolbar and tool tips are gone; the toast check lives in `tankity-layout`, Scores in the menu in `tankity-start`).
- `tankity-hud.spec.mjs`: replace the first test with

```js
test('the status bar runs Menu, the aim numbers, AMMO, ARMOR, lives, WIND and the badge, in one row', async ({ browser }) => {
  const { page, errors } = await newPlayer(browser);
  await startSolo(page);
  const IDS = ['btn-menu', 'hud-angle', 'hud-power', 'hud-fuel', 'hud-ammo', 'hud-armor', 'hud-lives', 'hud-wind', 'hud-score'];
  const boxes = await page.evaluate(ids => ids.map(id => { const r = document.getElementById(id).getBoundingClientRect(); return [r.left, r.top + r.height / 2]; }), IDS);
  const lefts = boxes.map(b => b[0]);
  expect([...lefts].sort((a, b) => a - b)).toEqual(lefts);
  const mids = boxes.map(b => b[1]);
  expect(Math.max(...mids) - Math.min(...mids)).toBeLessThanOrEqual(1);
  expect(await hud(page, 'hud-lives')).toBe('♥ 3');
  await expect(page.locator('#hud-lives')).toHaveAttribute('aria-label', '3 lives');
  expect(await hud(page, 'hud-armor')).toMatch(/you \d+ · .*reaper:\d+/);
  expect(await hud(page, 'hud-wind')).toMatch(/^(· 0|[←→] \d+)$/);
  expect(await page.locator('#hud-score > span').count()).toBe(3);
  await page.locator('#frame').screenshot({ path: 'test-results/tankity-hud.png' });
  expect(errors).toEqual([]);
});
```

  and delete the test `'the arrow pad sits centred over its label'`.
- `tankity-solo.spec.mjs`, in "the menu is a compact card…": rename it `'the menu is a compact card, and gold marks only Menu and the aim keys'` and replace the four lines from `// Gold means primary: only Menu on the navbar, the aim pad stays gold.` through `expect(gold).toEqual(['btn-menu']);` with

```js
  // Gold marks the primary control and the aim keys, nothing else on the bars.
  const gold = await page.locator('#hud-bar button, #deck button').evaluateAll(bs => bs
    .filter(b => getComputedStyle(b).backgroundColor === 'rgb(255, 201, 60)').map(b => b.id || b.getAttribute('data-aim')));
  expect(gold.sort()).toEqual(['btn-menu', 'down', 'left', 'right', 'up']);
```

- `tankity-pickers.spec.mjs`, in the `loaded` helper replace `const chip = document.querySelector('#hud-weapon .chip'); // only the loaded gun shows` and `const cv = chip && chip.querySelector('canvas');` with `const cv = document.querySelector('#btn-weapon .gun-icon');`, `if (!cv) return null;` stays, and `return { text: chip.textContent, n, sig: cv.toDataURL() };` with `return { text: document.getElementById('hud-weapon').textContent, n, sig: cv.toDataURL() };`. Replace `await page.locator('.hudbar').first().screenshot({ path: 'test-results/tankity-hud-icons.png' });` with `await page.locator('#deck').screenshot({ path: 'test-results/tankity-hud-icons.png' });`.
- `tankity-end.spec.mjs`: `expect(await hud(page, 'hud-lives')).toBe('♥♥♥');` → `expect(await hud(page, 'hud-lives')).toBe('♥ 3');`.

- [ ] **Step 4: Docs**

`games/tankity/README.md`: add rows for `src/weapon-label.ts` ("The Weapon button's line: damage and an S/M/L blast size from the radius, one tested cut-off") and `src/ui/gun-label.tsx`; change `src/hud.ts`'s row to "The status bar's values (aim numbers, AMMO, ARMOR, lives and WIND pills, the match badge) and the Weapon button's face. `createHud(deps)`". Add a "Layout" paragraph: "The frame stacks the status bar (`#hud-bar`, Preact), the battlefield (`#field`: the canvas, the title card, the round banner and the one-line chatter toast) and the control deck (`#deck`, static HTML in `index.html`: Aim, Drive, More, Weapon, FIRE). Breakpoints follow the frame's width (`#frame` is a size container): at 1100 px the labels shorten, at 860 px the bar drops to 11 px, at 760 px the key chips go. A portrait phone stacks the bar in three rows and moves Next song to the Menu; a landscape phone floats the controls over the battlefield's corners and moves Radio, Help and Next song to the Menu. `tankity-layout.spec.mjs` measures all of this on eight screens."

- [ ] **Step 5: Verify**

Run: `cd websites/www.cs && make test` — Expected: PASS within the budgets.
Run: `make e2e E2E_ARGS="tankity-a11y.spec.mjs tankity-hud.spec.mjs"` — Expected: PASS.
Run: `node tests/e2e/select.mjs --check && node tests/e2e/shard-test.mjs` — Expected: `E2E-SELECT-OK`; shard tests pass.

- [ ] **Step 6: Commit and open PR 13**

```bash
git add -A websites/www.cs/tests/e2e websites/www.cs/games/tankity/README.md
git commit -m "Specs: tankity-a11y with axe-core; the HUD, solo, pickers and end specs meet the new bars"
git push -u origin games/tankity-layout
gh pr create --fill --title "Tankity layout: status bar, control deck, phone layouts" --body-file - <<'BODY'
Spec row 13 (sections 6.2, 6.4): the status bar on top (Menu with its Esc chip, angle, power, fuel, AMMO, ARMOR, lives and WIND pills, segmented match badge), the battlefield with a one-line chatter toast and no sky gauge, and a labelled control deck (Aim, Drive, More, Weapon with damage and blast size, FIRE). Portrait and landscape phone layouts, breakpoints at 1100/860/760 px of the frame. New specs: tankity-layout (eight screens, worst-case values) and tankity-a11y (axe-core, aria-expanded, label in name).

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb
BODY
```

If `main` moved, rebase and rebuild the generated files (Global Constraints: never hand-merge `dist/`, `sw.js`, `?v=` values or `game.json`). Run the pr-fix loop on the review comments, then gate, merge on green, wait for deploy, live-check with `cd websites/www.cs && E2E_BASE_URL=https://www.cs.siue.edu/~wgrim/ tests/e2e/run.sh tankity-layout.spec.mjs`, and report `https://www.cs.siue.edu/~wgrim/play/tankity/?v=<merged sha>`.

# PR 13b: Tankity's battlefield fills the screen

Spec sections 6.6 and 7.4, row 13b. It branches from `main` after PR 13 merged (`games/tankity-battlefield`), and it lands before Plan B's PR 19 and before Plan D: Plan D's solo referee and the server's play of a solo round take the field width this PR introduces.

The measured starting point (PR 13, `game.css` at merge): the canvas keeps its 1080×690 backing store and is letterboxed inside `.field`. On a 1280×720 desktop it shows at 648×414 inside a 1106×414 box, and on a 393×852 phone at 371×237 inside a 371×556 box. After Task 26's CSS, the box is the canvas: 1118×426 on 1280×720, 383×568 on 393×852, 842×317 on 852×393 (measured with Playwright on the PR 13 build with Task 26's four CSS rules applied).

### Task 22: The field's width, from the landscape box

**Files:**
- Modify: `games/tankity/src/sim.ts` (constants, `fieldWidthOk`)
- Create: `games/tankity/src/field.ts`, `games/tankity/test/field.test.mjs`
- Modify: `games/tankity/tsconfig.json` (`files` + `src/field.ts`)

**Interfaces:**
- Produces, in `src/sim.ts`: `H = 460`; `ROOM_W = 720`; `FIELD_W_MIN = 720`, `FIELD_W_MAX = 1440`, `FIELD_COL = 24`; `FLIGHT_STEPS = 720` (a shell's longest flight in 1/60 s steps, not a width); `fieldWidthOk(w: unknown): w is number`. `W` stays exported until Task 23 removes it.
- Produces, in `src/field.ts` (DOM-free): `interface Box { w: number; h: number }`; `PHONE_SHORT = 500`; `PHONE_CHROME = { x: 10, y: 75 }`; `WIDE_CHROME = { x: 18, y: 294, maxW: 1118 }`; `landscapeBox(vw: number, vh: number): Box`; `fieldWidth(box: Box): number`; `fieldWidthFor(vw: number, vh: number): number`; `createFieldWidth(viewport: () => Box): FieldWidth` with `interface FieldWidth { deal(): number; readonly width: number }`; `SKY_SHARE = 0.6`; `interface Fit { s: number; ox: number; oy: number }`; `fitField(box: Box, field: Box): Fit`; `interface WorldRect { x0: number; y0: number; x1: number; y1: number }`; `visibleWorld(fit: Fit, box: Box): WorldRect`.

- [ ] **Step 1: Write the failing test**

```js
// games/tankity/test/field.test.mjs
// How wide a solo field is dealt, and how the field sits in the battlefield
// box (src/field.ts). The width comes from the box the device gives in
// landscape and never from portrait.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FIELD_COL, FIELD_W_MAX, FIELD_W_MIN, H, ROOM_W, fieldWidthOk } from '../src/sim.ts';
import { createFieldWidth, fieldWidth, fieldWidthFor, fitField, landscapeBox, visibleWorld } from '../src/field.ts';

test('the width is 460 × the landscape aspect, on a whole column', () => {
  assert.equal(fieldWidth({ w: 1118, h: 426 }), 1200); // 1207.2 → 50.3 columns → 50
  assert.equal(fieldWidth({ w: 842, h: 318 }), 1224);
  assert.equal(fieldWidth({ w: 1118, h: 526 }), 984);
  for (const w of [1200, 1224, 984]) assert.equal(w % FIELD_COL, 0);
});

test('the width clamps to 720–1440', () => {
  assert.equal(fieldWidth({ w: 800, h: 600 }), FIELD_W_MIN);
  assert.equal(fieldWidth({ w: 3000, h: 400 }), FIELD_W_MAX);
  assert.equal(fieldWidth({ w: 1000, h: 0 }), FIELD_W_MAX, 'a collapsed box never divides by zero');
  assert.equal(ROOM_W, FIELD_W_MIN);
});

test("a portrait box is read in its landscape aspect", () => {
  assert.equal(fieldWidth({ w: 383, h: 568 }), fieldWidth({ w: 568, h: 383 }));
});

test('the box is the one the device gives in landscape, whichever way it is held', () => {
  assert.deepEqual(landscapeBox(1280, 720), { w: 1118, h: 426 });
  assert.deepEqual(landscapeBox(1024, 640), { w: 1006, h: 346 });
  assert.deepEqual(landscapeBox(1180, 820), { w: 1118, h: 526 });
  assert.deepEqual(landscapeBox(852, 393), { w: 842, h: 318 });
  assert.deepEqual(landscapeBox(740, 360), { w: 730, h: 285 });
  for (const [w, h] of [[393, 852], [360, 740], [820, 1180]]) assert.deepEqual(landscapeBox(w, h), landscapeBox(h, w));
});

test('portrait and landscape on one device deal the same width', () => {
  const pairs = [[[1180, 820], [820, 1180], 984], [[852, 393], [393, 852], 1224], [[740, 360], [360, 740], 1176]];
  for (const [land, port, want] of pairs) {
    assert.equal(fieldWidthFor(...land), want, `${land} in landscape`);
    assert.equal(fieldWidthFor(...port), want, `${port} in portrait`);
  }
  assert.equal(fieldWidthFor(1280, 720), 1200);
  assert.equal(fieldWidthFor(1024, 640), 1344);
});

test('the dealt width holds until the next deal, whatever the viewport does', () => {
  let vp = { w: 1280, h: 720 };
  const fw = createFieldWidth(() => vp);
  assert.equal(fw.width, ROOM_W, 'nothing dealt yet');
  assert.equal(fw.deal(), 1200);
  vp = { w: 1024, h: 640 };
  assert.equal(fw.width, 1200, 'a resize mid-match rescales only');
  vp = { w: 640, h: 1024 };
  assert.equal(fw.width, 1200, 'and so does turning the device');
  assert.equal(fw.deal(), 1344, 'the next match takes the new shape');
});

test('fieldWidthOk takes only whole columns in range', () => {
  for (const w of [720, 744, 1200, 1440]) assert.ok(fieldWidthOk(w), String(w));
  for (const w of [696, 1464, 1201, 1200.5, '1200', null, NaN]) assert.ok(!fieldWidthOk(w), String(w));
});

test('a wider box centres the field; a taller one spans it and puts 60 % of the rest above', () => {
  const wide = fitField({ w: 1118, h: 426 }, { w: ROOM_W, h: H });
  assert.ok(Math.abs(wide.s - 426 / H) < 1e-12);
  assert.ok(Math.abs(wide.ox - (1118 - ROOM_W * wide.s) / 2) < 1e-9 && Math.abs(wide.oy) < 1e-9);
  const tall = fitField({ w: 383, h: 568 }, { w: 1224, h: H });
  assert.ok(Math.abs(tall.s * 1224 - 383) < 1e-9, 'the field spans the full width');
  assert.equal(tall.ox, 0);
  assert.ok(Math.abs(tall.oy - (568 - H * tall.s) * 0.6) < 1e-9);
  const seen = visibleWorld(tall, { w: 383, h: 568 });
  assert.ok(seen.x0 === 0 && Math.abs(seen.x1 - 1224) < 1e-9);
  assert.ok(seen.y0 < 0 && seen.y1 > H, 'sky above the field and dirt below it are in view');
});
```

- [ ] **Step 2: Run** — `cd websites/www.cs/games/tankity && node --test test/field.test.mjs` — Expected: FAIL, `Cannot find module '../src/field.ts'`.

- [ ] **Step 3: The constants**

`src/sim.ts`: replace `export const W = 720, H = 460;` with

```ts
/** The field is always H tall. A room's is ROOM_W wide; a solo match's is
 *  dealt from the screen (field.ts), a whole number of FIELD_COL columns. */
export const H = 460;
export const ROOM_W = 720;
export const W = ROOM_W; // removed in Task 23, once every reader takes the match's width
export const FIELD_W_MIN = 720, FIELD_W_MAX = 1440, FIELD_COL = 24;
/** A shell's longest flight, in 1/60 s steps (12 s). Not a width. */
export const FLIGHT_STEPS = 720;
/** A width a match may be played at; server/sim.php room_field_width() is the same rule. */
export function fieldWidthOk(w: unknown): w is number {
  return typeof w === 'number' && Number.isInteger(w) && w >= FIELD_W_MIN && w <= FIELD_W_MAX && w % FIELD_COL === 0;
}
```

- [ ] **Step 4: `src/field.ts`**

```ts
/* Operation Tankity: how wide a solo field is dealt, and where the field sits
 * in the battlefield box. DOM-free: main.ts hands in the viewport and view.ts
 * the canvas's box. The width comes only from the box the device gives in
 * landscape (spec 6.6); portrait frames that field and never changes it. */
import { FIELD_COL, FIELD_W_MAX, FIELD_W_MIN, ROOM_W, clamp } from './sim.ts';

export interface Box { w: number; h: number }

/* What the frame takes around the battlefield in landscape, in CSS px. The
   landscape-phone layout (game.css, `(orientation: landscape) and
   (max-height: 500px)`) applies at a short side of PHONE_SHORT or less.
   tankity-layout checks these against the measured box on every landscape screen. */
export const PHONE_SHORT = 500;
export const PHONE_CHROME = { x: 10, y: 75 } as const;
export const WIDE_CHROME = { x: 18, y: 294, maxW: 1118 } as const;

/** The battlefield box this viewport gives in landscape, held either way. */
export function landscapeBox(vw: number, vh: number): Box {
  const long = Math.max(vw, vh), short = Math.min(vw, vh);
  if (short <= PHONE_SHORT) return { w: long - PHONE_CHROME.x, h: short - PHONE_CHROME.y };
  return { w: Math.min(long - WIDE_CHROME.x, WIDE_CHROME.maxW), h: short - WIDE_CHROME.y };
}

/** 460 × the box's long side ÷ its short side, clamped, on a whole column. */
export function fieldWidth(box: Box): number {
  const long = Math.max(box.w, box.h), short = Math.max(1, Math.min(box.w, box.h));
  return Math.round(clamp(460 * long / short, FIELD_W_MIN, FIELD_W_MAX) / FIELD_COL) * FIELD_COL;
}

export function fieldWidthFor(vw: number, vh: number): number {
  return fieldWidth(landscapeBox(vw, vh));
}

export interface FieldWidth { deal(): number; readonly width: number }
/** The width matches are dealt at. Only deal() reads the viewport, so a
 *  resize or a turn mid-match rescales the view and never the map. */
export function createFieldWidth(viewport: () => Box): FieldWidth {
  let width = ROOM_W;
  return {
    deal() {
      const vp = viewport();
      width = fieldWidthFor(vp.w, vp.h);
      return width;
    },
    get width() { return width; },
  };
}

/** Share of a tall box's leftover height that goes to sky above the field; the rest is dirt below. */
export const SKY_SHARE = 0.6;
export interface Fit { s: number; ox: number; oy: number }
/** Scale and offset that put the field (world units) in the box (any unit):
 *  whole and as large as fits, centred across, the leftover height split sky above, dirt below. */
export function fitField(box: Box, field: Box): Fit {
  const s = Math.min(box.w / field.w, box.h / field.h);
  return { s, ox: (box.w - field.w * s) / 2, oy: (box.h - field.h * s) * SKY_SHARE };
}
export interface WorldRect { x0: number; y0: number; x1: number; y1: number }
/** The world rectangle the whole box shows at that fit, before the camera. */
export function visibleWorld(fit: Fit, box: Box): WorldRect {
  return { x0: -fit.ox / fit.s, y0: -fit.oy / fit.s, x1: (box.w - fit.ox) / fit.s, y1: (box.h - fit.oy) / fit.s };
}
```

`tsconfig.json`: add `"src/field.ts"` to `files`, after `"src/sim.ts"`.

- [ ] **Step 5: Run** — `node --test test/field.test.mjs && node ../_kit/build/build.mjs tankity` — Expected: PASS; the build type-checks both programs.

- [ ] **Step 6: Commit**

```bash
git add src/sim.ts src/field.ts test/field.test.mjs tsconfig.json dist
git commit -m "Tankity: a solo field's width comes from the landscape battlefield box, held either way"
```

---

### Task 23: The sim plays at any width, fairly

**Files:**
- Modify: `games/tankity/src/sim.ts`, `src/ai.ts`, `src/ai-measure.ts`
- Create: `games/tankity/test/wide-field.test.mjs`
- Modify: `games/tankity/test/ai-hitrate.test.mjs`, `test/render.test.mjs` (the `W` import), `test/sim-vectors.test.mjs` (`sim.W`)

**Interfaces:**
- Consumes: Task 22's constants.
- Produces: `W` is no longer exported. `interface Hills { a: readonly [number, number, number]; p: readonly [number, number, number]; f: readonly [number, number, number] }`; `drawHills(rng: Rng): Hills` (the nine draws, in today's order); `hillY(h: Hills, x: number): number` (today's formula for one column); `hillsWire(h: Hills): number[]` (`[a0, a1, a2, p0, p1, p2, f0, f1, f2]`); `hillsFrom(n: unknown): Hills | null` (nine finite numbers, else null); `genTerrain(rng: Rng, w: number): { terrain: number[]; clouds: Cloud[]; hills: Hills }`; `bandOffset(rng: Rng, w: number): number` (no draw when `w <= ROOM_W`, else one draw, an integer in 0…w − ROOM_W). `surfY`, `simShot`, `stepShells` take the width from `terrain.length`. `spawnSpots(n, rng)` is unchanged: it always deals on a 720 field. In `src/ai.ts`: `REACH_X = ROOM_W - 24`. `measureHitRates(arsenal, round, difficulty, cases, shots = 3, w = ROOM_W)`.

The fairness rule, which the tests pin: a wider field is more ground, not longer shots. The hills are the same nine draws over more columns; the units spawn exactly as on a 720 field and one more draw slides the whole group along the wider field; a drone prefers rivals within `REACH_X` (696 px, the widest a 720 field allows, so the rule never binds at 720 and no room changes); the wind range is untouched.

- [ ] **Step 1: Write the failing test**

```js
// games/tankity/test/wide-field.test.mjs
// The sim at any width (spec 6.6): a wide field is the 720 field's hills
// continued, the units spawn as on a 720 field and slide as a group, a drone
// prefers rivals within reach, and nothing at 720 draws differently.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import * as sim from '../src/sim.ts';
import { REACH_X, aiChoose } from '../src/ai.ts';

const GAME = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'game.json'), 'utf8'));
const arsenal = sim.buildArsenal(GAME.arsenal);
const WIDTHS = [720, 1080, 1440];

test('a wider field is the same hills, continued', () => {
  for (const seed of ['scorch-01', 'tankity-riverbed', 'a']) {
    const narrow = sim.genTerrain(sim.mulberry32(sim.hashSeed(seed)), 720);
    for (const w of WIDTHS) {
      const r = sim.mulberry32(sim.hashSeed(seed));
      const g = sim.genTerrain(r, w);
      assert.equal(g.terrain.length, w);
      assert.deepEqual(g.terrain.slice(0, 720), narrow.terrain, `${seed} at ${w}`);
      assert.deepEqual(sim.hillsWire(g.hills), sim.hillsWire(narrow.hills));
      for (let x = 0; x < w; x += 37) assert.ok(Object.is(g.terrain[x], sim.hillY(g.hills, x)));
    }
  }
});

test('the deal draws the same numbers at any width; only the group offset is new', () => {
  for (let seed = 1; seed <= 300; seed++) {
    const base = sim.mulberry32(seed);
    const xs = sim.spawnSpots(4, base);
    const after = base();
    for (const w of WIDTHS) {
      const r = sim.mulberry32(seed);
      assert.deepEqual(sim.spawnSpots(4, r), xs);
      const off = sim.bandOffset(r, w);
      if (w === 720) assert.equal(r(), after, 'a 720 field draws nothing more');
      assert.ok(Number.isInteger(off) && off >= 0 && off <= w - 720, `offset ${off} at ${w}`);
      for (const x of xs) assert.ok(x + off >= 30 && x + off <= w - 30);
    }
  }
});

test('the gaps between units are the same at any width', () => {
  const gaps = w => {
    const out = [];
    for (let seed = 1; seed <= 500; seed++) {
      const r = sim.mulberry32(seed);
      const xs = sim.spawnSpots(4, r);
      const off = sim.bandOffset(r, w);
      const placed = xs.map(x => x + off).sort((a, b) => a - b);
      out.push(...placed.slice(1).map((x, i) => x - placed[i]));
    }
    return out;
  };
  assert.deepEqual(gaps(1440), gaps(720));
  assert.ok(Math.max(...gaps(1440)) <= 720 - 60, 'no neighbour is farther than a 720 field allows');
});

test('a drone passes over a rival beyond reach for a nearer one', () => {
  for (const w of WIDTHS) {
    const terrain = Array(w).fill(400);
    const far = w === 720 ? 690 : w - 40;
    const tanks = [
      { id: 'd', isPlayer: false, x: 100, y: 400, angle: 45, power: 50, hp: 100, fuel: 0, dirS: 1, ammo: { shell: Infinity }, s: 'sniper' },
      { id: 'p', isPlayer: true, x: 600, y: 400, angle: 45, power: 50, hp: 100, fuel: 80, dirS: -1 },
      { id: 'x', isPlayer: false, x: far, y: 400, angle: 45, power: 50, hp: 10, fuel: 0, dirS: -1, ammo: { shell: Infinity }, s: 'hunter' },
    ];
    const world = { tanks, terrain, wind: 0, round: 1, rng: sim.mulberry32(7), shells: [], score: 0, cash: 0, ammo: { shell: Infinity },
      selected: 'shell', shield: false, bunker: 0, laststand: false, jammer: 0, difficulty: 'normal' };
    aiChoose(world, arsenal, tanks[0]);
    const want = Math.abs(far - 100) <= REACH_X ? 2 : 1; // the sniper wants the weakest it can reach
    assert.equal(tanks[0].brk.t, want, `at ${w}`);
  }
  assert.equal(REACH_X, 696);
});

test('out of bounds is the field edge, wherever it is', () => {
  for (const w of WIDTHS) {
    const r = sim.simShot({ terrain: Array(w).fill(400), wind: 0 }, arsenal, w - 100, 386, 40, 100, 'shell', 1);
    assert.ok(r.oob && r.x >= w, `${w}: ${JSON.stringify(r)}`);
    assert.equal(sim.surfY(Array.from({ length: w }, (_, i) => i), w + 50), w - 1);
  }
});

test('the scenery is not the sim: past the edge a shell is removed without a blast', () => {
  for (const w of WIDTHS) {
    const terrain = Array(w).fill(400);
    const world = { tanks: [], terrain, wind: 0, round: 1, rng: sim.mulberry32(1), shells: [], score: 0, cash: 0, ammo: {},
      selected: 'shell', shield: false, bunker: 0, laststand: false, jammer: 0 };
    world.shells.push({ x: w + 25, y: 440, vx: 120, vy: 10, wkey: 'shell', owner: null, life: 5, age: 1 });
    const events = sim.stepShells(world, arsenal, 1 / 60);
    assert.equal(world.shells.filter(s => !s.dead).length, 0);
    assert.ok(!events.some(e => e.kind === 'blast'));
    assert.deepEqual(terrain, Array(w).fill(400));
  }
  const src = fs.readFileSync(path.join(import.meta.dirname, '..', 'src', 'sim.ts'), 'utf8');
  assert.ok(!/world\.hills|G\.hills/.test(src), 'the sim never reads the scenery\'s hills');
});
```

The `stepShells` return value and shell fields above are the ones `sim.ts` uses today (`stepShells(world, arsenal, dt)` returns its events; a shell carries `x, y, vx, vy, wkey, owner, life, age`). If its signature differs on `main`, adapt only the call, never the assertions.

In `test/ai-hitrate.test.mjs`, after the existing tests, add:

```js
test('a 1440 field plays as fair as a 720 one: the drones hit as often', () => {
  const wide = {};
  for (const r of ROUNDS) wide[r] = measureHitRates(arsenal, r, 'normal', CASES, 3, 1440).map(p => p * 100);
  for (const r of ROUNDS) {
    for (const shot of [0, 2]) {
      const d = Math.abs(wide[r][shot] - cell('normal', r, shot));
      assert.ok(d <= 6, `round ${r} shot ${shot + 1}: ${wide[r][shot].toFixed(1)} at 1440 vs ${cell('normal', r, shot).toFixed(1)} at 720`);
    }
  }
});
```

- [ ] **Step 2: Run** — `node --test test/wide-field.test.mjs` — Expected: FAIL (`sim.hillsWire is not a function`, `sim.bandOffset is not a function`, `REACH_X` undefined).

- [ ] **Step 3: The sim**

In `src/sim.ts`:

1. Delete `export const W = ROOM_W; // removed in Task 23…`.
2. Replace the terrain block from `/* Rolling hills from seeded sines, and the clouds that drift over them. */` through the end of `surfY` with:

```ts
/** A round's hills: three sines' amplitudes, phases and frequencies. */
export interface Hills {
  a: readonly [number, number, number];
  p: readonly [number, number, number];
  f: readonly [number, number, number];
}
/** The nine draws a round's hills are made of, in the order the server draws them. */
export function drawHills(rng: Rng): Hills {
  const a = [20 + rng() * 30, 10 + rng() * 22, 5 + rng() * 12] as const;
  const p = [rng() * 6.28, rng() * 6.28, rng() * 6.28] as const;
  const f = [1 / 260 + rng() / 500, 1 / 120 + rng() / 260, 1 / 47 + rng() / 120] as const;
  return { a, p, f };
}
/** The hills' height at column x, on or past the field (the scenery draws the same hills). */
export function hillY(h: Hills, x: number): number {
  const y = 330
    + h.a[0] * Math.sin(x * h.f[0] + h.p[0])
    + h.a[1] * Math.sin(x * h.f[1] + h.p[1])
    + h.a[2] * Math.sin(x * h.f[2] + h.p[2]);
  return clamp(y, 190, 415);
}
/** The nine numbers as a room snapshot carries them. */
export function hillsWire(h: Hills): number[] {
  return [...h.a, ...h.p, ...h.f];
}
export function hillsFrom(n: unknown): Hills | null {
  if (!Array.isArray(n) || n.length !== 9 || !n.every(v => typeof v === 'number' && Number.isFinite(v))) return null;
  const v = n as number[];
  return { a: [v[0]!, v[1]!, v[2]!], p: [v[3]!, v[4]!, v[5]!], f: [v[6]!, v[7]!, v[8]!] };
}
/* Rolling hills over w columns, and the clouds that drift over them. */
export function genTerrain(rng: Rng, w: number): { terrain: number[]; clouds: Cloud[]; hills: Hills } {
  const hills = drawHills(rng);
  const terrain = new Array<number>(w);
  for (let x = 0; x < w; x++) terrain[x] = hillY(hills, x);
  const clouds: Cloud[] = [];
  for (let i = 0; i < 5; i++) {
    clouds.push({ x: rng() * w, y: 30 + rng() * 90, s: 0.6 + rng() * 0.9, v: 3 + rng() * 5 });
  }
  return { terrain, clouds, hills };
}
export function surfY(terrain: readonly number[], x: number): number {
  const xi = clamp(Math.round(x), 0, terrain.length - 1);
  return terrain[xi]!;
}
```

3. In `spawnSpots`, replace `const lo = 30, hi = W - 30;` with `const lo = 30, hi = ROOM_W - 30; // every deal is a 720 field's; bandOffset() places it`. Directly after `spawnSpots`, add:

```ts
/** Where a wider field puts the group spawnSpots dealt: one more draw, and
 *  only when the field is wider than a room's, so a 720 deal draws exactly as
 *  it always has. The gaps between units, and so every shot's length, do not
 *  change with the width. server/rules.php room_band_offset() is the same. */
export function bandOffset(rng: Rng, w: number): number {
  return w > ROOM_W ? Math.floor(rng() * (w - ROOM_W + 1)) : 0;
}
```

4. In `simShot`: after `const w = arsenal.weapons[wkey]!;` add `const fw = world.terrain.length;`; replace `for (let i = 0; i < 720; i++) {` with `for (let i = 0; i < FLIGHT_STEPS; i++) {`, `if (st.x < 0 || st.x >= W) return` with `if (st.x < 0 || st.x >= fw) return`, and `clamp(Math.round(st.x), 0, W - 1)` with `clamp(Math.round(st.x), 0, fw - 1)`.
5. In `stepShells`: replace `s.x > W + 20` with `s.x > world.terrain.length + 20`.

Run `grep -n "\bW\b" src/sim.ts` — Expected: no output.

- [ ] **Step 4: The drone AI**

`src/ai.ts`: the import becomes `import { ROOM_W, clamp, facing, gauss, muzzle, simShot, spotTaken, surfY } from './sim.ts';`. After the `aimSkill` export, add:

```ts
/** A drone passes over rivals farther than this for nearer ones, so a wide
 *  field never has it lobbing at what it cannot reach. It is the widest gap a
 *  ROOM_W field allows (units stay 12 px from each edge), so no room and no
 *  720 field ever meets it. server/ai.php ROOM_REACH_X is the same. */
export const REACH_X = ROOM_W - 24;
```

In `aiChoose`, replace

```ts
  const rivals = world.tanks
    .filter(c => c !== t && c.hp > 0)
    .sort((a, b) => Math.abs(a.x - t.x) - Math.abs(b.x - t.x));
```

with

```ts
  const nearest = world.tanks
    .filter(c => c !== t && c.hp > 0)
    .sort((a, b) => Math.abs(a.x - t.x) - Math.abs(b.x - t.x));
  const inReach = nearest.filter(c => Math.abs(c.x - t.x) <= REACH_X);
  const rivals = inReach.length ? inReach : nearest.slice(0, 1);
```

and the shuffle's `const nx = clamp(t.x + dx, 12, W - 12);` with `const nx = clamp(t.x + dx, 12, world.terrain.length - 12);`.

`src/ai-measure.ts`: the import drops `W` and adds `ROOM_W, bandOffset`; replace `dealCase` and the `dirS` line:

```ts
/** The hills, wind and the two units' spots of case `i` on a field w wide, the same for every round and difficulty. */
function dealCase(i: number, w: number): { terrain: number[]; wind: number; px: number; dx: number; mid: number } {
  const rng = mulberry32(hashSeed('hitrate-case-' + i));
  const { terrain } = genTerrain(rng, w);
  const wind = Math.round((rng() * 2 - 1) * 8);
  const [px, dx] = spawnSpots(4, rng);
  const off = bandOffset(rng, w);
  return { terrain, wind, px: px! + off, dx: dx! + off, mid: off + ROOM_W / 2 };
}
```

with `dirS: x < c.mid ? 1 : -1,` in `caseWorld`, and `measureHitRates(arsenal: Arsenal, round: number, difficulty: Difficulty, cases: number, shots = 3, w = ROOM_W)` calling `dealCase(i, w)`.

`test/render.test.mjs`: `import { W, H, …` becomes `import { ROOM_W as W, H, …` (Task 26 changes the renderer's deps).

`test/sim-vectors.test.mjs` stops reading `sim.W`: `function buildTerrain(spec)` becomes `function buildTerrain(spec, w = 720)` with both `sim.W` inside it replaced by `w`; `function world(c)` becomes `function world(c, w = 720)` and builds `terrain: buildTerrain(c.terrain || { flat: 400 }, w)`; in `'terrain-gen'(c)`, `sim.genTerrain(sim.mulberry32(sim.hashSeed(c.seed)))` becomes `sim.genTerrain(sim.mulberry32(sim.hashSeed(c.seed)), 720)` and `x < sim.W` becomes `x < 720`.

- [ ] **Step 5: Run** — `node --test test/wide-field.test.mjs test/ai-hitrate.test.mjs test/sim-vectors.test.mjs` — Expected: all PASS; `sim-vectors` unchanged at 720 (nothing at 720 draws differently). The page modules do not type-check yet (`W` is gone); Task 25 moves them, so do not build `dist/` in this task.

- [ ] **Step 6: Commit**

```bash
git add src/sim.ts src/ai.ts src/ai-measure.ts test/wide-field.test.mjs test/ai-hitrate.test.mjs test/render.test.mjs
git commit -m "Tankity sim: any field width; the units spawn as on a 720 field and slide as a group; drones prefer rivals in reach"
```

---

### Task 24: The server's sim takes the width; vectors at 720, 1080 and 1440

**Files:**
- Modify: `games/tankity/server/sim.php`, `server/rules.php`, `server/ai.php`, `server/protocol.php`, `src/protocol.ts`
- Modify: `games/tankity/protocol/sim-vectors.php`, `test/sim-vectors.test.mjs`
- Create: `games/tankity/test/php/FieldWidthTest.php`
- Regenerate: `protocol/sim-vectors.json`, `protocol/*.json` (the room fixtures gain `hills`)

**Interfaces:**
- Consumes: Task 23's TypeScript names.
- Produces (PHP): `ROOM_W = 720`, `FIELD_W_MIN = 720`, `FIELD_W_MAX = 1440`, `FIELD_COL = 24`, `ROOM_FLIGHT_STEPS = 720`, `ROOM_REACH_X = ROOM_W - 24`; `room_field_width(mixed $w): ?int`; `room_gen_hills(int &$rng): array` (`['a' => [3], 'p' => [3], 'f' => [3]]`, the nine draws in order); `room_hills_terrain(array $h, int $w): array`; `room_hills_wire(array $h): array` (nine floats); `room_gen_terrain(int &$rng, int $w): array` (unchanged result); `room_band_offset(int &$rng, int $w): int`; `$room['hills']`, set at every round start. A snapshot carries `hills` (nine numbers, or null before the first round). `RoomSnapshot.hills?: number[] | null` in `src/protocol.ts`.
- Vector group `field`, every case marked `exact`: `{ kind: 'terrain', w, seed }` → `{ hills, terrain, next }`; `{ kind: 'placement', w, seed }` → `{ xs, offset, next }`; `{ kind: 'sim-shot', w, x, y, angle, power, wkey, dirS }` → `{ x, y, oob }`; `{ kind: 'target', w, seed, tanks }` → `{ target, wkey, angle, power }`. The runner compares an exact case's numbers with `Object.is`.

- [ ] **Step 1: Write the failing tests**

```php
<?php
// games/tankity/test/php/FieldWidthTest.php
// The server's sim at any field width (spec 7.4): the width rule, the hills
// and their wire form, the group offset, and a room still dealt at 720.
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

final class FieldWidthTest extends TestCase
{
    public static function setUpBeforeClass(): void
    {
        if (!defined('TANKITY_ROOMS_LIB')) {
            define('TANKITY_ROOMS_LIB', true);
        }
        require_once dirname(__DIR__, 2) . '/rooms.php';
    }

    public function testOnlyWholeColumnsInRangeAreAWidth(): void
    {
        foreach ([720, 744, 1200, 1440] as $w) {
            $this->assertSame($w, room_field_width($w));
        }
        foreach ([696, 1464, 1201, 1200.0, '1200', null, true] as $w) {
            $this->assertNull(room_field_width($w), var_export($w, true));
        }
    }

    public function testTheHillsAreTheTerrainsNineDraws(): void
    {
        $a = room_hash_seed('scorch-01');
        $b = $a;
        $h = room_gen_hills($a);
        $this->assertSame(room_gen_terrain($b, 1440), room_hills_terrain($h, 1440));
        $this->assertSame(room_rng_next($a), room_rng_next($b), 'both drew exactly nine');
        $this->assertCount(9, room_hills_wire($h));
        $this->assertSame(array_slice(room_hills_terrain($h, 1440), 0, 720), room_hills_terrain($h, 720));
    }

    public function testTheGroupOffsetDrawsNothingAt720(): void
    {
        $a = 99;
        $b = 99;
        $this->assertSame(0, room_band_offset($a, ROOM_W));
        $this->assertSame(room_rng_next($b), room_rng_next($a));
        for ($seed = 1; $seed <= 200; $seed++) {
            $r = $seed;
            $off = room_band_offset($r, 1440);
            $this->assertGreaterThanOrEqual(0, $off);
            $this->assertLessThanOrEqual(720, $off);
        }
    }

    public function testARoomRoundIsDealtAt720WithItsHills(): void
    {
        $room = room_new('ABCD', 'AAA');
        room_start_round($room);
        $this->assertCount(ROOM_W, $room['terrain']);
        $this->assertSame(room_hills_terrain($room['hills'], ROOM_W), $room['terrain']);
        $snap = room_snapshot($room, 0, 0, null, true);
        $this->assertSame(room_hills_wire($room['hills']), $snap['hills']);
    }
}
```

`room_new`, `room_start_round` and `room_snapshot($room, $seat, $since, $have, $full)` are today's. If `room_start_round` needs seats seated first on `main`, seat the host the way `test/php/checks/rooms-sim.php` does before calling it.

In `test/sim-vectors.test.mjs` (whose `buildTerrain` and `world` already take a width, Task 23):

- `diff(want, got, at, out)` becomes `diff(want, got, at, out, exact = false)`; its number branch becomes

```js
  if (typeof want === 'number' && typeof got === 'number') {
    if (exact ? !Object.is(want, got) : !(Math.abs(want - got) <= TOL)) out.push(`${at}: expected ${want}, got ${got}`);
```

  each recursive `diff(…)` call passes `exact` on, and the case loop calls `diff(expectedFor(group, c.in, c.out), got, 'out', [], c.exact === true)`.
- Add the runner:

```js
  field(c) {
    if (c.kind === 'terrain') {
      const r = sim.mulberry32(sim.hashSeed(c.seed));
      const h = sim.drawHills(r);
      const next = r();
      const { terrain } = sim.genTerrain(sim.mulberry32(sim.hashSeed(c.seed)), c.w);
      return { hills: sim.hillsWire(h), terrain, next };
    }
    if (c.kind === 'placement') {
      const r = sim.mulberry32(c.seed);
      const xs = sim.spawnSpots(4, r);
      return { xs, offset: sim.bandOffset(r, c.w), next: r() };
    }
    if (c.kind === 'sim-shot') {
      return sim.simShot({ terrain: Array(c.w).fill(400), wind: 0 }, arsenal, c.x, c.y, c.angle, c.power, c.wkey, c.dirS);
    }
    world(c, c.w);
    G.rng = sim.mulberry32(c.seed);
    const t = G.tanks[0];
    const choice = sim.aiChoose(G, arsenal, t);
    return { target: t.brk.t, wkey: choice.wkey, angle: choice.angle, power: choice.power };
  },
```

- [ ] **Step 2: Run** — `cd websites/www.cs && vendor/bin/phpunit games/tankity/test/php/FieldWidthTest.php` — Expected: FAIL, `Call to undefined function room_field_width()`.

- [ ] **Step 3: The server's sim**

`server/sim.php`, after `const ROOM_FLAT_GRAV = 90; …`:

```php
const ROOM_W = 720; // a room's field; a solo run's is dealt (src/field.ts) and checked here
const FIELD_W_MIN = 720;
const FIELD_W_MAX = 1440;
const FIELD_COL = 24;
const ROOM_FLIGHT_STEPS = 720; // a shell's longest flight in 1/60 s steps (12 s); not a width

/* src/sim.ts fieldWidthOk(): an int in range on a whole column, else null. */
function room_field_width(mixed $w): ?int
{
    if (!is_int($w) || $w < FIELD_W_MIN || $w > FIELD_W_MAX || $w % FIELD_COL !== 0) {
        return null;
    }
    return $w;
}
```

Replace `room_gen_terrain` with:

```php
/* src/sim.ts drawHills(): the nine draws, in this order. */
function room_gen_hills(int &$rng): array
{
    $a = [20 + room_rng_next($rng) * 30, 10 + room_rng_next($rng) * 22, 5 + room_rng_next($rng) * 12];
    $p = [room_rng_next($rng) * 6.28, room_rng_next($rng) * 6.28, room_rng_next($rng) * 6.28];
    $f = [1 / 260 + room_rng_next($rng) / 500, 1 / 120 + room_rng_next($rng) / 260, 1 / 47 + room_rng_next($rng) / 120];
    return ['a' => $a, 'p' => $p, 'f' => $f];
}
/* src/sim.ts hillY() over columns 0..w-1. */
function room_hills_terrain(array $h, int $w): array
{
    [$a, $p, $f] = [$h['a'], $h['p'], $h['f']];
    $t = [];
    for ($x = 0; $x < $w; $x++) {
        $y = 330
            + $a[0] * sin($x * $f[0] + $p[0])
            + $a[1] * sin($x * $f[1] + $p[1])
            + $a[2] * sin($x * $f[2] + $p[2]);
        $t[$x] = max(190.0, min(415.0, $y));
    }
    return $t;
}
function room_hills_wire(array $h): array
{
    return array_merge($h['a'], $h['p'], $h['f']);
}
function room_gen_terrain(int &$rng, int $w): array
{
    return room_hills_terrain(room_gen_hills($rng), $w);
}
```

In `room_map_profile`, `$w = 720;` becomes `$w = ROOM_W;`. In `room_sim_shot`, `for ($i = 0; $i < 720; $i++) {` becomes `for ($i = 0; $i < ROOM_FLIGHT_STEPS; $i++) {`; in `room_fly_arc`, `for ($step = 0; $step < 720; $step++) {` becomes `for ($step = 0; $step < ROOM_FLIGHT_STEPS; $step++) {` and `720 * $dt` becomes `ROOM_FLIGHT_STEPS * $dt`.

`server/rules.php`: after `room_spawn_spots`, add

```php
/* src/sim.ts bandOffset(): one more draw, only on a field wider than a room's. */
function room_band_offset(int &$rng, int $w): int
{
    return $w > ROOM_W ? (int) floor(room_rng_next($rng) * ($w - ROOM_W + 1)) : 0;
}
```

In `room_start_round`, replace from `$w = 720;` through `room_terrain_changed($room);` with

```php
    $w = ROOM_W;
    if ($room['map'] !== null && isset(ROOM_MAPS[$room['map']])) {
        // A picked map replays its own hills every time: terrain comes from
        // the hidden seed plus the round, never from the live stream.
        $mrng = room_hash_seed(ROOM_MAPS[$room['map']]['seed'] . '|round' . $room['round']);
        $room['hills'] = room_gen_hills($mrng);
    } else {
        $room['hills'] = room_gen_hills($room['rng']);
    }
    $room['terrain'] = room_hills_terrain($room['hills'], $w);
    room_terrain_changed($room);
```

`server/ai.php`: after `const` declarations at the top add `const ROOM_REACH_X = ROOM_W - 24; // src/ai.ts REACH_X`; in `room_ai_choose`, after the `usort($rivals, …);` line add

```php
    // A wide field: pass over rivals beyond reach for nearer ones (never binds at 720).
    $inReach = array_values(array_filter($rivals, fn($r) => abs($r['x'] - $tank['x']) <= ROOM_REACH_X));
    $rivals = count($inReach) ? $inReach : [$rivals[0]];
```

`server/protocol.php`, in `room_snapshot`'s `$out` after `'terrainRev' => $rev,` add `'hills' => isset($room['hills']) ? room_hills_wire($room['hills']) : null,` (nine numbers every snapshot: small, and a round's hills never change, so the delta protocol leaves them alone). `src/protocol.ts`, in `RoomSnapshot` after `terrainRev: number;`, add `/** The round's nine hill numbers (sim.ts hillsWire), for the scenery past the field. */ hills?: number[] | null;`.

- [ ] **Step 4: The vectors**

`protocol/sim-vectors.php`: after `const SV_TOLERANCE = 0.0001;` add `ini_set('serialize_precision', '-1'); // exact cases are written as the shortest string that reads back to the same double`. `function sv_terrain(array $spec): array` becomes `function sv_terrain(array $spec, int $w = SV_WIDTH): array` with both `SV_WIDTH` inside it replaced by `$w`; `function sv_room(array $c): array` becomes `function sv_room(array $c, int $w = SV_WIDTH): array` with `sv_terrain($c['terrain'])` → `sv_terrain($c['terrain'], $w)`. After the `$add` closure add

```php
/* An exact case: written unrounded and compared bit for bit by the runner. */
$exact = function (string $group, string $name, array $in, $out) use (&$cases): void {
    $cases[$group][] = ['name' => $name, 'in' => $in, 'out' => $out, 'exact' => true];
};
```

and after the `spawn-spots` cases:

```php
/* ---- the field at any width, bit for bit (spec 7.4) ---- */
foreach ([720, 1080, 1440] as $w) {
    foreach (['tankity-twin-hills', 'scorch-01'] as $seed) {
        $rng = room_hash_seed($seed);
        $h = room_gen_hills($rng);
        $exact('field', "terrain-$w-$seed", ['kind' => 'terrain', 'w' => $w, 'seed' => $seed],
            ['hills' => room_hills_wire($h), 'terrain' => room_hills_terrain($h, $w), 'next' => room_rng_next($rng)]);
    }
    foreach ([3, 1234, 2026] as $seed) {
        $rng = $seed;
        $xs = room_spawn_spots($rng, 4, ROOM_W);
        $off = room_band_offset($rng, $w);
        $exact('field', "placement-$w-seed$seed", ['kind' => 'placement', 'w' => $w, 'seed' => $seed],
            ['xs' => $xs, 'offset' => $off, 'next' => room_rng_next($rng)]);
    }
    $shot = ['kind' => 'sim-shot', 'w' => $w, 'x' => $w - 100.0, 'y' => 386.0, 'angle' => 40.0, 'power' => 100.0, 'wkey' => 'shell', 'dirS' => 1];
    $exact('field', "off-the-right-$w", $shot, room_sim_shot(array_fill(0, $w, 400.0), 0.0, $shot['x'], $shot['y'], $shot['angle'], $shot['power'], 'shell', 1, $w));
    $far = $w === 720 ? 690 : $w - 40;
    $c = ['kind' => 'target', 'w' => $w, 'seed' => 7, 'difficulty' => 'normal', 'terrain' => ['flat' => 400], 'tanks' => [
        ['kind' => 'ai', 'x' => 100, 'y' => 400.0, 'hp' => 100, 's' => 'sniper', 'ammo' => ['shell' => 99], 'dirS' => 1],
        ['kind' => 'human', 'x' => 600, 'y' => 400.0, 'hp' => 100, 'dirS' => -1],
        ['kind' => 'ai', 'x' => $far, 'y' => 400.0, 'hp' => 10, 's' => 'hunter', 'ammo' => ['shell' => 99], 'dirS' => -1],
    ]];
    $room = sv_room($c, $w);
    $choice = room_ai_choose($room, $room['tanks'][0]);
    $exact('field', "target-$w", $c, ['target' => $room['tanks'][0]['brk']['t'], 'wkey' => $choice['wkey'],
        'angle' => $choice['angle'], 'power' => $choice['power']]);
}
```

In the writer, rows are encoded with `JSON_UNESCAPED_SLASHES | JSON_PRESERVE_ZERO_FRACTION` already, so exact floats keep their `.0`.

The `target` runner's `world(c, c.w)` builds the shooter with `ammo: { shell: 99 }` from the case; the drone's `ammo.shell` is finite in both languages, so the two sides load the same rack.

- [ ] **Step 5: Regenerate and run**

Run (in `websites/www.cs`): `make up && make sim-vectors && make protocol`, then `vendor/bin/phpunit --testsuite tankity` and (in `games/tankity`) `node --test test/sim-vectors.test.mjs test/net.test.mjs test/protocol.test.mjs`
Expected: PASS; the summary line counts the `field` group's 30 cases; every pre-existing case is unchanged (`git diff --stat protocol/sim-vectors.json` shows only additions); the room fixtures differ only by their new `hills` key.

If a `field` terrain or target case differs in the last bit between V8 and the PHP container, that is a libm difference in `sin` or `cos`, not a bug in this task: stop and land Plan D Task 21a (`detmath`) in front of this PR, then rerun. Never loosen an exact case.

- [ ] **Step 6: Commit**

```bash
git add server protocol src/protocol.ts test/sim-vectors.test.mjs test/php/FieldWidthTest.php
git commit -m "Tankity server: the sim takes the field width, rooms pass 720 and send their hills; vectors at 720, 1080 and 1440, bit for bit"
```

---

### Task 25: A match is dealt at its width and keeps it

**Files:**
- Modify: `games/tankity/src/game-types.ts`, `src/main.ts`, `src/match.ts`, `src/room.ts`, `src/view.ts`
- Modify: `games/tankity/test/smoke.test.mjs` (two static checks)

**Interfaces:**
- Consumes: Task 22's `createFieldWidth`, Task 23's `genTerrain(rng, w)`, `bandOffset`, `hillsFrom`, Task 24's `RoomSnapshot.hills`.
- Produces: `GameState.w: number` (this match's field width) and `GameState.hills: Hills | null`. `MatchDeps.field: Pick<FieldWidth, 'deal'>`. Only `resetMatch()` (solo, demo, tutorial) and `netAdopt()` (rooms, `ROOM_W`) write `G.w`.

- [ ] **Step 1: Write the failing checks**

In `test/smoke.test.mjs`, beside the other static checks on `src`, add:

```js
// The field's width is set where a match is dealt and nowhere else (spec 6.6).
const widthWrites = [...src.matchAll(/\bG\.w\s*=(?!=)/g)].length;
check('field-width-written-only-at-the-deal', widthWrites === 2 && /G\.w = field\.deal\(\)/.test(moduleSrc['match.ts']) && /G\.w = ROOM_W/.test(moduleSrc['room.ts']), `writes=${widthWrites}`);
check('no-module-imports-a-fixed-width', !/import\s*\{[^}]*\bW\b[^}]*\}\s*from\s*'\.\/sim\.ts'/.test(src), 'a module still imports W from sim.ts');
```

- [ ] **Step 2: Run** — `node ../_kit/build/build.mjs tankity` — Expected: FAIL, type errors in `main.ts`, `match.ts`, `room.ts`, `view.ts` (`W` is not exported by `./sim.ts`).

- [ ] **Step 3: The state and the deal**

`src/game-types.ts`: import `type Hills` from `./sim.ts` and add to `GameState`, after `clouds: Cloud[];`:

```ts
  /** This match's field width: dealt at the start of a solo match (field.ts), ROOM_W in a room; fixed for the match. */
  w: number;
  /** The round's hills, for the scenery past the field's edges; null until a room sends them. */
  hills: Hills | null;
```

`src/main.ts`: the sim import replaces `W,` with `ROOM_W,`; add `import { createFieldWidth } from './field.ts';`. In the `G` literal, `cam: { z: 1, cx: 360, cy: 230 },` becomes `w: ROOM_W, hills: null, cam: { z: 1, cx: ROOM_W / 2, cy: 230 },`. Before `createMatch({`, add

```ts
/* Matches are dealt at the width the landscape box gives (spec 6.6). */
const field = createFieldWidth(() => ({ w: window.innerWidth, h: window.innerHeight }));
```

and pass `field,` in the `createMatch({ … })` deps. Both cloud wraps `if (cl.x - 40 > W) cl.x = -40;` become `if (cl.x - 40 > G.w) cl.x = -40;`, and the drive clamp `clamp(t.x + step, 12, W - 12)` becomes `clamp(t.x + step, 12, G.w - 12)`.

`src/match.ts`: the sim import replaces `W,` with `ROOM_W,` and adds `bandOffset,`; add `import type { FieldWidth } from './field.ts';`; `MatchDeps` gains `field: Pick<FieldWidth, 'deal'>;` and the destructuring in `createMatch` gains `field`. Then:

- `genTerrain()` becomes

```ts
  function genTerrain(): void {
    const g = simGenTerrain(G.rng, G.w);
    G.terrain = g.terrain;
    G.clouds = g.clouds;
    G.hills = g.hills;
  }
```

- in `resetMatch`, after `G.rng = mulberry32(hashSeed(seed));` add `G.w = field.deal(); // fixed until the next deal`;
- in `newMatch`, `G.cam = { z: 1, cx: W / 2, cy: H / 2 };` becomes `G.cam = { z: 1, cx: G.w / 2, cy: H / 2 };`;
- in `newRound`, replace `const order = spawnSpots(1 + FOE_DEFS.length, G.rng);` with

```ts
    const order = spawnSpots(1 + FOE_DEFS.length, G.rng);
    const off = bandOffset(G.rng, G.w); // a wider field slides the whole group; the gaps stay a 720 field's
```

  `x: order[0]!,` becomes `x: order[0]! + off,`, `x: order[i + 1]!,` becomes `x: order[i + 1]! + off,`, and `t.dirS = t.x < W / 2 ? 1 : -1; // face the middle of the field` becomes `t.dirS = t.x < off + ROOM_W / 2 ? 1 : -1; // face the middle of the group`.

`src/room.ts`: the sim import replaces `W,` with `ROOM_W, hillsFrom,`. In `netAdopt`, before `if (Array.isArray(room.terrain) && room.terrain.length === W) {` add `G.w = ROOM_W; // every room plays a 720 field`, change that condition to `room.terrain.length === ROOM_W`, add after its block

```ts
    const hills = hillsFrom(room.hills);
    if (hills) G.hills = hills;
```

and change `Math.random() * W` to `Math.random() * ROOM_W` and the cloud wrap `cl.x - 40 > W` to `cl.x - 40 > G.w`.

`src/view.ts`: the sim import drops `W,`; `ViewState` adds `| 'w' | 'hills'`; in `updateCamera`, `let tz = 1, tx = W / 2, ty = H / 2;` becomes `let tz = 1, tx = G.w / 2, ty = H / 2;` and `Math.min(W / spanX, H / spanY, 1)` becomes `Math.min(G.w / spanX, H / spanY, 1)`. (`createRenderer`'s `size` is Task 26's; until then pass `size: { w: ROOM_W, h: H }` with `ROOM_W` imported.)

- [ ] **Step 4: Run** — `node ../_kit/build/build.mjs tankity && php tools/install-files.php && node --test 'test/*.test.mjs'` — Expected: PASS, the two new smoke checks included; a solo match on a 1280×720 screen is dealt at 1200 and still draws stretched into the box (Task 26 fixes the drawing).

- [ ] **Step 5: Commit**

```bash
git add src test/smoke.test.mjs dist sw.js index.html
git commit -m "Tankity: a solo match is dealt at the landscape box's width and keeps it; rooms play 720"
```

---

### Task 26: The battlefield fills the box: scenery, sky and dirt

**Files:**
- Create: `games/tankity/src/scenery.ts`, `games/tankity/test/scenery.test.mjs`
- Modify: `games/tankity/src/render.ts`, `src/view.ts`, `game.css`, `test/render.test.mjs`, `tsconfig.json` (`files` + `src/scenery.ts`)

**Interfaces:**
- Consumes: Task 22's `fitField`, `visibleWorld`; Task 23's `Hills`, `hillY`.
- Produces: `SEAM_EASE = 48`; `sceneryY(h: Hills, terrain: readonly number[], x: number): number`. `RenderDeps` loses `size`; `BattleView` gains `field: { w: number; h: number }` and `hills: Hills | null`. `#stage` carries `data-w` (the match's width) and `data-field` (`"x,y,w,h"`, the field's rectangle in CSS px inside the canvas), written only when they change; `tankity-layout` reads both.

- [ ] **Step 1: Write the failing test**

```js
// games/tankity/test/scenery.test.mjs
// The hills past the field's edges (src/scenery.ts): the same hills continued,
// eased from the field's live edge so a crater there leaves no cliff, and
// never more than 1 px of step at the seam beyond the hills' own slope.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { carveCrater, genTerrain, hashSeed, hillY, mulberry32 } from '../src/sim.ts';
import { SEAM_EASE, sceneryY } from '../src/scenery.ts';

const SEEDS = Array.from({ length: 60 }, (_, i) => 'seam-' + i);
const deal = (seed, w) => genTerrain(mulberry32(hashSeed(seed)), w);
function seamSteps(h, t) {
  const w = t.length;
  return [
    Math.abs(sceneryY(h, t, -1) - t[0]) - Math.abs(hillY(h, -1) - hillY(h, 0)),
    Math.abs(sceneryY(h, t, w) - t[w - 1]) - Math.abs(hillY(h, w) - hillY(h, w - 1)),
  ];
}

test('inside the field the scenery is the field', () => {
  const { terrain, hills } = deal('in', 1080);
  for (let x = 0; x < 1080; x += 13) assert.equal(sceneryY(hills, terrain, x), terrain[x]);
});

test('past the ease the scenery is the same hills, continued', () => {
  for (const w of [720, 1080, 1440]) {
    const { terrain, hills } = deal('far', w);
    for (const x of [-SEAM_EASE - 1, -300, w + SEAM_EASE, w + 500]) assert.equal(sceneryY(hills, terrain, x), hillY(hills, x));
  }
});

test('the seam adds no step greater than 1 px, untouched or cratered', () => {
  for (const w of [720, 1080, 1440]) {
    for (const seed of SEEDS) {
      const { terrain, hills } = deal(seed, w);
      for (const s of seamSteps(hills, terrain)) assert.ok(s <= 1 + 1e-9, `${seed} at ${w}: ${s}`);
      carveCrater(terrain, 0, terrain[0], 60, 456);
      carveCrater(terrain, w - 1, terrain[w - 1], 60, 456);
      for (const s of seamSteps(hills, terrain)) assert.ok(s <= 1 + 1e-9, `${seed} at ${w}, cratered: ${s}`);
    }
  }
});

test('each column of the ease moves at most 1 px off the hills', () => {
  const { terrain, hills } = deal('ease', 720);
  carveCrater(terrain, 719, terrain[719], 90, 456);
  for (let k = 1; k < 200; k++) {
    const off = sceneryY(hills, terrain, 719 + k) - hillY(hills, 719 + k);
    const prev = sceneryY(hills, terrain, 718 + k) - hillY(hills, 718 + k);
    assert.ok(Math.abs(off - prev) <= 1 + 1e-9, `column ${k}`);
  }
});
```

- [ ] **Step 2: Run** — `node --test test/scenery.test.mjs` — Expected: FAIL, `Cannot find module '../src/scenery.ts'`.

- [ ] **Step 3: `src/scenery.ts`**

```ts
/* Operation Tankity: the hills past the field's edges, for drawing only.
 * The sim never reads this: past the edge nothing is hittable. Pure. */
import { hillY } from './sim.ts';
import type { Hills } from './sim.ts';

/** Columns over which the scenery eases from the field's edge into the hills, at least. */
export const SEAM_EASE = 48;

/** The ground at column x as drawn: the field inside it; past an edge the
 *  round's hills continued, eased from the field's live edge height over
 *  max(SEAM_EASE, |difference|) columns, so the ease adds at most 1 px a column. */
export function sceneryY(h: Hills, terrain: readonly number[], x: number): number {
  const w = terrain.length;
  if (x >= 0 && x <= w - 1) return terrain[Math.round(x)]!;
  const edge = x < 0 ? 0 : w - 1;
  const d = terrain[edge]! - hillY(h, edge);
  const span = Math.max(SEAM_EASE, Math.ceil(Math.abs(d)));
  return hillY(h, x) + d * Math.max(0, 1 - Math.abs(x - edge) / span);
}
```

`tsconfig.json`: add `"src/scenery.ts"` to `files`.

- [ ] **Step 4: The renderer draws the box, not a stretched field**

`src/render.ts`:

1. Imports stay type-only, as the header requires: `import type { Cloud, Hills, Rng, Tank } from './sim.ts';` and `import type { Box, Fit, WorldRect } from './field.ts';`. `RenderSim` gains the three pure helpers the frame needs, which arrive with the other sim helpers:

```ts
  fitField(box: Box, field: Box): Fit;
  visibleWorld(fit: Fit, box: Box): WorldRect;
  sceneryY(h: Hills, terrain: readonly number[], x: number): number;
```

   Inside `createRenderer`, `fitField`, `visibleWorld` and `sceneryY` below mean `sim.fitField`, `sim.visibleWorld` and `sim.sceneryY` (add `const { fitField, visibleWorld, sceneryY } = sim;` after `const { fx: FX, sim } = deps;`).
2. `BattleView` gains, after `terrain: readonly number[];`: `field: { w: number; h: number }; // this match's field, in world units` and `hills: Hills | null; // the round's hills, for the scenery`.
3. `RenderDeps` loses `size`.
4. In `createRenderer`, replace `const { w: W, h: H } = deps.size;` and the `SKY_…` line with

```ts
  let W = 0, H = 0; // the field being drawn, from each frame's view
  let sky: Sky | null = null; // drawn from view.skyKey over the visible sky, rebuilt when either changes
```

  (delete the old `let sky` line below it).
5. `buildSky(key: string): Sky` becomes `buildSky(key: string, rect: WorldRect): Sky`; at its top add `const SKY_X0 = rect.x0 - 20, SKY_W = rect.x1 - rect.x0 + 40, SKY_Y0 = rect.y0 - 20, SKY_H = 420 - rect.y0; // a field-sized view gives today's -20…700 by -20…400` and scale the star count with the area: `const n = Math.round(130 * Math.max(1, (SKY_W * SKY_H) / (760 * 440)));` used for the first loop (`for (let i = 0; i < n; i++)`). In `drawSky(c, view)` add a third parameter `rect: WorldRect` and replace `if (!sky || sky.key !== view.skyKey) sky = buildSky(view.skyKey);` with

```ts
    const key = `${view.skyKey}|${Math.round(rect.x0)},${Math.round(rect.y0)},${Math.round(rect.x1)}`;
    if (!sky || sky.key !== key) sky = buildSky(key, rect);
```

6. `drawMoon(c)` becomes `drawMoon(c, rect)`; its first line becomes `const mx = W - 120, my = 90 + Math.min(0, rect.y0) * 0.5, mr = 32; // a tall sky lifts the moon into it`.
7. In `drawWindStreaks`, `const span = W + 160;` stays (it reads the frame's W).
8. In `drawTurnClock`, replace `c.scale((cv.width || W) / W || 1, (cv.height || H) / H || 1);` with

```ts
    const fit = fitField({ w: cv.width || W, h: cv.height || H }, { w: W, h: H });
    c.setTransform(fit.s, 0, 0, fit.s, fit.ox, fit.oy);
```

9. In `frame(view)`, replace everything from `c.save();` through the end of the green rim's `c.stroke();` with:

```ts
    W = view.field.w;
    H = view.field.h;
    const box = { w: cv.width || W, h: cv.height || H };
    const fit = fitField(box, view.field);
    const rect = visibleWorld(fit, box); // world units the whole canvas shows, before the camera
    c.save();
    c.setTransform(fit.s, 0, 0, fit.s, fit.ox, fit.oy);
    if (view.shake > 0 && !deps.reducedMotion()) {
      c.translate((deps.random() - 0.5) * 8 * view.shake, (deps.random() - 0.5) * 8 * view.shake);
    }
    // Night sky over everything the canvas shows: no band of page shows anywhere.
    c.fillStyle = '#00000b';
    c.fillRect(rect.x0 - 20, rect.y0 - 20, rect.x1 - rect.x0 + 40, rect.y1 - rect.y0 + 40);
    drawSky(c, view, rect);
    drawMoon(c, rect);
    // Slow camera: everything below rides the zoom so every tank stays seen.
    c.translate(W / 2, H / 2);
    c.scale(view.cam.z, view.cam.z);
    c.translate(-view.cam.cx, -view.cam.cy);
    // What the canvas shows through the camera: the scenery and the dirt fill all of it.
    const z = view.cam.z;
    const sx0 = Math.floor(view.cam.cx + (rect.x0 - W / 2) / z) - 8, sx1 = Math.ceil(view.cam.cx + (rect.x1 - W / 2) / z) + 8;
    const sy0 = view.cam.cy + (rect.y0 - H / 2) / z, sy1 = view.cam.cy + (rect.y1 - H / 2) / z + 8;
    c.fillStyle = '#23233f';
    for (const cl of view.clouds) {
      for (const lift of sy0 < -120 ? [0, sy0 * 0.45] : [0]) { // a tall sky gets a high layer too
        c.globalAlpha = lift ? 0.6 : 1;
        c.beginPath();
        c.ellipse(cl.x, cl.y + lift, 30 * cl.s, 10 * cl.s, 0, 0, Math.PI * 2);
        c.ellipse(cl.x + 22 * cl.s, cl.y + 3 + lift, 20 * cl.s, 8 * cl.s, 0, 0, Math.PI * 2);
        c.fill();
      }
    }
    c.globalAlpha = 1;
    // Far dunes, across the whole view.
    c.fillStyle = '#3a2408';
    c.beginPath();
    c.moveTo(sx0, H);
    for (let x = sx0; x <= sx1 + 24; x += 24) c.lineTo(x, 396 - 18 * Math.sin(x / 190 + 2));
    c.lineTo(sx1 + 24, H);
    c.fill();
    // The dirt and its layers, from the field's floor down to the canvas's.
    c.fillStyle = '#2e1a08';
    c.fillRect(sx0, H - 2, sx1 - sx0, Math.max(0, sy1 - H + 2));
    c.fillStyle = '#26150a';
    for (let y = H + 18; y < sy1; y += 36) c.fillRect(sx0, y, sx1 - sx0, 6);
    // Scenery: the round's hills past both edges, dimmed; drawn, never hit.
    if (view.hills) {
      const hills = view.hills;
      for (const [a, b] of [[sx0, 0], [W - 1, sx1]] as const) {
        if (b <= a) continue;
        c.fillStyle = '#4a2e14';
        c.beginPath();
        c.moveTo(a, H + 10);
        for (let x = a; x < b; x += 4) c.lineTo(x, sceneryY(hills, view.terrain, x));
        c.lineTo(b, sceneryY(hills, view.terrain, b));
        c.lineTo(b, H + 10);
        c.fill();
        c.strokeStyle = '#2f6a2f';
        c.lineWidth = 2;
        c.beginPath();
        for (let x = a; x < b; x += 4) {
          const y = sceneryY(hills, view.terrain, x);
          if (x === a) c.moveTo(x, y);
          else c.lineTo(x, y);
        }
        c.lineTo(b, sceneryY(hills, view.terrain, b));
        c.stroke();
      }
    }
    // The field's ground with its flat green rim, edge to edge (no cliff at either edge).
    c.fillStyle = '#7a4a1e';
    c.beginPath();
    c.moveTo(0, H + 10);
    for (let x = 0; x < W; x += 4) c.lineTo(x, terrain(x));
    c.lineTo(W - 1, terrain(W - 1));
    c.lineTo(W - 1, H + 10);
    c.fill();
    c.strokeStyle = '#00aa00';
    c.lineWidth = 3;
    c.beginPath();
    for (let x = 0; x < W; x += 4) {
      const y = terrain(x);
      if (x === 0) c.moveTo(x, y);
      else c.lineTo(x, y);
    }
    c.lineTo(W - 1, terrain(W - 1));
    c.stroke();
```

   A room before its first snapshot with hills (or a fixture without them) has `hills: null`: the dunes and the dirt still fill the sides, and nothing is cut off at the edge, because the dirt reaches the canvas floor and the far dunes span the view.

   Drawing cost: the scenery is two polylines of at most (visible width ÷ 4) points each, three `Math.sin` per point, so at most about 600 points and 1,800 sines a frame on the widest screen at the camera's widest pull-back (z = 0.45); the field's own ground already draws 360 points.

10. The header's first paragraph gains "the scenery past the field's edges and the dirt below it," after "hills,".

`src/view.ts`: import `{ fitField, visibleWorld }` from `./field.ts` and `{ sceneryY }` from `./scenery.ts`; `H` stays imported. Delete the renderer's `size: { w: ROOM_W, h: H },` line, add `fitField, visibleWorld, sceneryY` to the `sim: { … }` object passed to `createRenderer`, and in the view object add `field: { w: G.w, h: H }, hills: G.hills,` after `terrain: G.terrain,`. Add, above `render()`:

```ts
  /* The backing store follows the battlefield box (at most two device pixels
     per CSS pixel), so the field is drawn in the box's own shape and never
     stretched; #stage tells the layout spec the width and where the field sits. */
  let published = '';
  function fitCanvas(cv: HTMLCanvasElement): void {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const bw = Math.round(cv.clientWidth * dpr), bh = Math.round(cv.clientHeight * dpr);
    if (bw > 0 && bh > 0 && (cv.width !== bw || cv.height !== bh)) {
      cv.width = bw;
      cv.height = bh;
    }
    const fit = fitField({ w: cv.clientWidth || 1, h: cv.clientHeight || 1 }, { w: G.w, h: H });
    const field = [fit.ox, fit.oy, G.w * fit.s, H * fit.s].map(v => Math.round(v)).join(',');
    if (published !== `${G.w}|${field}`) {
      published = `${G.w}|${field}`;
      cv.dataset.w = String(G.w);
      cv.dataset.field = field;
    }
  }
```

and call `fitCanvas(cv);` in `render()` right after `if (!cv || !G.terrain) return;`.

`game.css`, in the frame block: `.canvas-holder`'s `gap: 6px;` becomes `gap: 0;`; `.field { … }` gains `margin: 0 -6px;`; `#stage { display: block; width: auto; height: auto; max-width: 100%; max-height: 100%; border-radius: 6px; }` becomes `#stage { display: block; width: 100%; height: 100%; justify-self: stretch; align-self: stretch; }`. Change the frame comment's "the battlefield taking what is left" to "the battlefield taking what is left, edge to edge and touching both bars, so no band of page shows between them".

`test/render.test.mjs`: import `{ fitField, visibleWorld }` from `../src/field.ts` and `{ sceneryY }` from `../src/scenery.ts`; delete `size: { w: W, h: H },` from `deps` and add `fitField, visibleWorld, sceneryY` to its `sim`; add `field: { w: W, h: H }, hills: { a: [30, 16, 8], p: [1, 2, 3], f: [0.005, 0.01, 0.025] },` after `terrain, clouds: […],` in the frozen `view`, and in the no-context block nothing changes.

- [ ] **Step 5: Run** — `node --test test/scenery.test.mjs test/field.test.mjs test/render.test.mjs && node ../_kit/build/build.mjs tankity && php tools/install-files.php && node --test 'test/*.test.mjs'` — Expected: PASS. Then `cd websites/www.cs && make e2e E2E_ARGS="tankity-layout.spec.mjs"` — Expected: PASS (the existing measurements are unchanged by the canvas filling the box).

- [ ] **Step 6: Commit**

```bash
git add src game.css test tsconfig.json dist sw.js index.html
git commit -m "Tankity: the battlefield fills its box; hills continue as scenery, a tall box adds sky above and dirt below"
```

---

### Task 27: The rotate hint

**Files:**
- Create: `games/tankity/src/rotate-hint.ts`, `src/ui/rotate-hint.tsx`, `test/rotate-hint.test.mjs`
- Modify: `games/tankity/index.html`, `src/main.ts`, `game.css`, `tsconfig.json` (`src/rotate-hint.ts`), `src/tsconfig.dom.json` (`ui/rotate-hint.tsx`)

**Interfaces:**
- Produces: `ROTATE_HINT_KEY = 'tankity-rotate-hint'`; `rotateHintShows(s: { portrait: boolean; dismissed: boolean; playing: boolean }): boolean`; `RotateHint({ onDismiss })`; `renderRotateHint(root: Element, show: boolean, onDismiss: () => void): void`. The pref holds `'dismissed'` once the chip is closed.

- [ ] **Step 1: Write the failing test**

```js
// games/tankity/test/rotate-hint.test.mjs
// "Turn sideways for the full battlefield": in portrait, in a match, until dismissed.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importTsx } from '../../_kit/test/tsx.ts';
import { document } from '../../_kit/test/dom-stub.mjs';
import { ROTATE_HINT_KEY, rotateHintShows } from '../src/rotate-hint.ts';

const { renderRotateHint } = await importTsx(import.meta.dirname, { name: '../src/ui/rotate-hint.tsx' });

test('only in portrait, only in a match, only until dismissed', () => {
  assert.equal(rotateHintShows({ portrait: true, dismissed: false, playing: true }), true);
  assert.equal(rotateHintShows({ portrait: false, dismissed: false, playing: true }), false);
  assert.equal(rotateHintShows({ portrait: true, dismissed: true, playing: true }), false);
  assert.equal(rotateHintShows({ portrait: true, dismissed: false, playing: false }), false, 'never over the demo');
  assert.equal(ROTATE_HINT_KEY, 'tankity-rotate-hint');
});

test('the chip says it and closes', () => {
  const root = document.createElement('div');
  let closed = 0;
  renderRotateHint(root, true, () => { closed++; });
  assert.match(root.textContent, /Turn sideways for the full battlefield/);
  const x = root.querySelector('button');
  assert.equal(x.getAttribute('aria-label'), 'Dismiss');
  x.click();
  assert.equal(closed, 1);
  renderRotateHint(root, false, () => {});
  assert.equal(root.querySelector('.rotate-hint'), null);
});
```

`importTsx`'s return and the stub's `createElement`/`querySelector`/`click` are the ones Plan C Tasks 12 and 17 use for `title.tsx` and `hud.tsx`; follow `test/title.test.mjs` exactly for the import line if its shape differs.

- [ ] **Step 2: Run** — `node --test test/rotate-hint.test.mjs` — Expected: FAIL, module not found.

- [ ] **Step 3: The rule, the chip and the wiring**

```ts
// games/tankity/src/rotate-hint.ts
/* Operation Tankity: when the "turn sideways" chip shows (spec 6.6). DOM-free. */
export const ROTATE_HINT_KEY = 'tankity-rotate-hint';
export function rotateHintShows(s: { portrait: boolean; dismissed: boolean; playing: boolean }): boolean {
  return s.portrait && s.playing && !s.dismissed;
}
```

```tsx
// games/tankity/src/ui/rotate-hint.tsx
/* The "turn sideways" chip over the top of the battlefield. */
import { render } from 'preact';

export function RotateHint({ onDismiss }: { onDismiss(): void }) {
  return (
    <div class="rotate-hint" role="status">
      <span>Turn sideways for the full battlefield</span>
      <button type="button" class="rotate-x" aria-label="Dismiss" onClick={onDismiss}>×</button>
    </div>
  );
}
export function renderRotateHint(root: Element, show: boolean, onDismiss: () => void): void {
  render(show ? <RotateHint onDismiss={onDismiss} /> : null, root);
}
```

`index.html`: inside `#field`, after `<div id="title-root" data-ui></div>`, add `<div id="rotate-hint-root" data-ui></div>`.

`src/main.ts`: import `{ ROTATE_HINT_KEY, rotateHintShows }` from `./rotate-hint.ts` and `{ renderRotateHint }` from `./ui/rotate-hint.tsx` (the kit's `pref`, `text` and `browserStorage` are already imported for the menu's prefs; add whichever is missing from the same modules `menu.ts` uses). Add, near the other prefs:

```ts
/* The rotate hint: portrait, a real match, until the player closes it once. */
const rotateHint = pref(ROTATE_HINT_KEY, '', text, browserStorage());
const portraitQuery = window.matchMedia('(orientation: portrait)');
function refreshRotateHint(): void {
  const root = document.getElementById('rotate-hint-root');
  if (!root) return;
  const show = rotateHintShows({ portrait: portraitQuery.matches, dismissed: rotateHint.get() === 'dismissed', playing: !G.demo && G.tanks.length > 0 });
  renderRotateHint(root, show, () => { rotateHint.set('dismissed'); refreshRotateHint(); });
}
portraitQuery.addEventListener?.('change', refreshRotateHint);
```

and call `refreshRotateHint();` at the end of `refreshNavHints()` (the match calls it whenever a match starts, a round opens or the page resizes).

`game.css`, after the chatter toast rules:

```css
/* "Turn sideways": a small chip at the top of the battlefield, in portrait only. */
#rotate-hint-root { display: contents; }
.rotate-hint {
  position: absolute; top: 8px; left: 50%; transform: translateX(-50%); z-index: 3;
  display: flex; align-items: center; gap: 6px; padding: 2px 4px 2px 12px;
  background: rgba(12, 15, 46, 0.92); border: 1px solid #3a3fb0; border-radius: 999px;
  color: #eef; font: 600 12px/1.2 system-ui, sans-serif; white-space: nowrap;
}
#frame .rotate-x { min-width: 44px; min-height: 44px; padding: 0; background: none; border: 0; color: #9aa3c7; font-size: 18px; }
@media (orientation: landscape) { .rotate-hint { display: none; } }
```

`tsconfig.json` gains `"src/rotate-hint.ts"`; `src/tsconfig.dom.json` gains `"ui/rotate-hint.tsx"` (the same lists `title.tsx` joined in Task 12).

- [ ] **Step 4: Run** — `node --test test/rotate-hint.test.mjs && node ../_kit/build/build.mjs tankity && php tools/install-files.php && node --test 'test/*.test.mjs'` — Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src test/rotate-hint.test.mjs index.html game.css tsconfig.json dist sw.js
git commit -m "Tankity: in portrait, a dismissible chip suggests turning sideways; the choice is remembered"
```

---

### Task 28: `tankity-layout` checks the battlefield; docs; PR 13b

**Files:**
- Modify: `websites/www.cs/tests/e2e/tankity-layout.spec.mjs`, `tests/e2e/tankity-a11y.spec.mjs`
- Modify: `games/tankity/README.md`

**Interfaces:**
- Consumes: `#stage`'s `data-w` and `data-field` (Task 26), `#rotate-hint-root` (Task 27).

- [ ] **Step 1: Add the three checks, the width and the box to every device**

In `tankity-layout.spec.mjs`, after `const landscapePhone = …;` add:

```js
/* The width each screen deals (spec 6.6): a device's portrait and landscape give the same. */
const DEALT = { '1280x720': 1200, '1024x640': 1344, '1180x820': 984, '820x1180': 984, '393x852': 1224, '852x393': 1224, '360x740': 1176, '740x360': 1176 };
/* The landscape box src/field.ts computes for a viewport, which the measured box must match. */
function landscapeBox(vw, vh) {
  const long = Math.max(vw, vh), short = Math.min(vw, vh);
  return short <= 500 ? { w: long - 10, h: short - 75 } : { w: Math.min(long - 18, 1118), h: short - 294 };
}

/* The battlefield as drawn: no band of page between the bars, the ground at
   both screen edges with no cut, and where the field sits. */
function battlefield() {
  const cv = document.getElementById('stage');
  const box = document.getElementById('field').getBoundingClientRect();
  const r = cv.getBoundingClientRect();
  const bar = document.getElementById('hud-bar').getBoundingClientRect();
  const deck = document.getElementById('deck');
  const floating = getComputedStyle(deck).position === 'absolute';
  const probs = [];
  if (Math.abs(r.left - box.left) > 0.5 || Math.abs(r.right - box.right) > 0.5 || Math.abs(r.top - box.top) > 0.5 || Math.abs(r.bottom - box.bottom) > 0.5) {
    probs.push('the canvas does not fill the battlefield');
  }
  if (Math.abs(box.top - bar.bottom) > 0.5) probs.push(`${Math.round(box.top - bar.bottom)}px between the status bar and the battlefield`);
  if (!floating && Math.abs(deck.getBoundingClientRect().top - box.bottom) > 0.5) probs.push(`${Math.round(deck.getBoundingClientRect().top - box.bottom)}px between the battlefield and the deck`);
  const holder = getComputedStyle(document.querySelector('.canvas-holder')).backgroundColor.match(/\d+/g).map(Number);
  const c = cv.getContext('2d'), W = cv.width, H = cv.height;
  const px = c.getImageData(0, 0, W, H).data;
  const at = (x, y) => { const i = (y * W + x) * 4; return [px[i], px[i + 1], px[i + 2], px[i + 3]]; };
  for (let y = 0; y < H; y += 2) {
    let band = true;
    for (let x = 0; x < W && band; x += 7) {
      const [r0, g0, b0, a0] = at(x, y);
      band = a0 < 255 || (r0 === holder[0] && g0 === holder[1] && b0 === holder[2]);
    }
    if (band) { probs.push(`a band of background at canvas row ${y}`); break; }
  }
  // Ground: dirt, hills, grass (warm or green), never the night sky (blue at least as strong as red).
  const ground = ([r0, g0, b0]) => r0 > b0 + 10 || (g0 > b0 + 40 && g0 > r0);
  const top = x => { let y = H - 1; while (y > 0 && ground(at(x, y))) y--; return y; };
  const dpr = W / r.width;
  for (const [edge, inward] of [[0, Math.round(8 * dpr)], [W - 1, W - 1 - Math.round(8 * dpr)]]) {
    const te = top(edge), ti = top(inward);
    if (te >= H - 1) probs.push(`no ground at canvas column ${edge}`);
    if (Math.abs(te - ti) > 6 * dpr) probs.push(`the ground is cut at canvas column ${edge}: ${H - te} vs ${H - ti} px high`);
  }
  const [fx, fy, fw, fh] = cv.dataset.field.split(',').map(Number);
  return { probs, w: Number(cv.dataset.w), field: { x: fx, y: fy, w: fw, h: fh }, canvas: { w: r.width, h: r.height }, box: { w: box.width, h: box.height } };
}
```

In the per-device test, after the loop over `[false, true]` (the bars), add:

```js
    // The battlefield fills the screen between the bars, the ground meets both
    // edges, and the field's width is the one this device deals either way up.
    const bf = await page.evaluate(battlefield);
    expect(bf.probs).toEqual([]);
    expect(bf.w).toBe(DEALT[`${dev[1]}x${dev[2]}`]);
    if (dev[1] > dev[2]) {
      const want = landscapeBox(dev[1], dev[2]);
      expect(Math.abs(bf.box.w - want.w), 'box width vs src/field.ts').toBeLessThanOrEqual(2);
      expect(Math.abs(bf.box.h - want.h), 'box height vs src/field.ts').toBeLessThanOrEqual(2);
    } else {
      // Portrait: the field spans the full width, with sky above and dirt below.
      expect(Math.abs(bf.field.x)).toBeLessThanOrEqual(1);
      expect(Math.abs(bf.field.w - bf.canvas.w)).toBeLessThanOrEqual(1);
      expect(bf.field.y).toBeGreaterThan(0);
      expect(bf.field.y + bf.field.h).toBeLessThan(bf.canvas.h);
    }
```

After the per-device loop, add two tests:

```js
test('the width holds through a resize and the next match takes the new one', async ({ browser }) => {
  const { ctx, page } = await open(browser, DEVICES[0]);
  await page.locator('.title-play').click();
  await page.clock.runFor(200);
  expect(Number(await page.locator('#stage').getAttribute('data-w'))).toBe(1200);
  await page.setViewportSize({ width: 1024, height: 640 });
  await page.clock.runFor(200);
  expect(Number(await page.locator('#stage').getAttribute('data-w')), 'mid-match: rescaled, not re-dealt').toBe(1200);
  expect((await page.evaluate(battlefield)).probs).toEqual([]);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: /Play this seed/ }).click(); // a new deal (Menu, Task 14)
  await page.clock.runFor(200);
  expect(Number(await page.locator('#stage').getAttribute('data-w'))).toBe(1344);
  await ctx.close();
});

test('the rotate hint: portrait only, in a match, gone once dismissed', async ({ browser }) => {
  const { ctx, page } = await open(browser, DEVICES[4]);
  expect(await page.locator('.rotate-hint').count(), 'not over the demo').toBe(0);
  await page.locator('.title-play').click();
  await page.clock.runFor(200);
  await expect(page.locator('.rotate-hint')).toContainText('Turn sideways for the full battlefield');
  await page.getByRole('button', { name: 'Dismiss' }).click();
  await expect(page.locator('.rotate-hint')).toHaveCount(0);
  await page.reload();
  await page.waitForSelector('#hud-score > span');
  await page.locator('.title-play').click();
  await page.clock.runFor(200);
  expect(await page.locator('.rotate-hint').count(), 'remembered').toBe(0);
  await ctx.close();
});
```

`tankity-a11y.spec.mjs`: in the open-menu or deck pass it runs on a portrait phone, add the chip (`await page.locator('.title-play').click();` before axe runs on that page) so axe covers `.rotate-hint`. If that spec runs only at desktop size, leave it: the chip's name and target size are pinned by `rotate-hint.test.mjs` and the 44 px rule in `smallTargets()` does not include it, so add `#field .rotate-x` to `smallTargets()`'s selector list.

- [ ] **Step 2: Run** — `cd websites/www.cs && make e2e E2E_ARGS="tankity-layout.spec.mjs tankity-a11y.spec.mjs"` — Expected: PASS, `tankity-layout` within 15 s (the battlefield check reads one canvas per device; the two new tests open one page each). Screenshots in `test-results/tankity-layout-*.png` show no bars, the scenery on the desktop and the sky and dirt on the phones.

- [ ] **Step 3: Docs**

`games/tankity/README.md`: add rows for `src/field.ts` ("How wide a solo field is dealt (from the landscape battlefield box, whichever way the device is held) and where the field sits in the box. DOM-free.") , `src/scenery.ts` ("The hills past the field's edges, for drawing only: the round's hills continued, eased from the field's edge.") and `src/rotate-hint.ts` / `src/ui/rotate-hint.tsx`. Add a paragraph "The battlefield": "The field is 460 world units tall. A room's is 720 wide; a solo match's is dealt at the start of each match, 460 × the battlefield box's landscape aspect, between 720 and 1440 on a whole number of 24-unit columns, and kept for the match: a resize or a turn only rescales. In portrait the width is the one the same device gives in landscape. The canvas fills the box: a wider box shows the round's hills continuing past both edges as dimmed scenery (`#stage`'s `data-w` and `data-field` give the width and the field's place); a taller box spans the field across and fills the rest with sky above and dirt below. The units spawn as on a 720 field and slide as a group along a wider one, and a drone prefers rivals within 696 px, so a wider field never makes shots longer. The server's sim takes the width; rooms pass 720, and `protocol/sim-vectors.json`'s `field` group pins 720, 1080 and 1440 bit for bit." In the tests table, add `test/field.test.mjs`, `test/wide-field.test.mjs`, `test/scenery.test.mjs`, `test/rotate-hint.test.mjs`, `test/php/FieldWidthTest.php` with one line each.

- [ ] **Step 4: Verify**

Run: `cd websites/www.cs && make test` — Expected: PASS within the budgets (the wide hit-rate comparison adds under 1 s to the unit tier).
Run: `make e2e E2E_ARGS="tankity-layout.spec.mjs tankity-rooms-play.spec.mjs"` — Expected: PASS (a room still plays its 720 field, now with scenery).

- [ ] **Step 5: Commit and open PR 13b**

```bash
git add -A websites/www.cs/tests/e2e websites/www.cs/games/tankity/README.md
git commit -m "Specs: tankity-layout checks the battlefield fills the screen on eight devices; README: the battlefield"
git push -u origin games/tankity-battlefield
gh pr create --title "Tankity: the battlefield fills the screen" --body-file - <<'BODY'
Spec row 13b (sections 6.6, 7.4). A solo match is dealt at a field width from the battlefield box's landscape shape (720–1440, whole 24-unit columns), the same whichever way the device is held, and keeps it for the match; rooms stay 720. The canvas fills the box: the round's hills continue past the edges as dimmed scenery, and a portrait screen spans the field across with sky above and dirt below. A dismissible chip suggests turning sideways in portrait. The units spawn as on a 720 field and slide as a group, and drones prefer rivals in reach, so a wider field never lengthens shots (hit rates at 1440 within 6 points of 720). The server's sim takes the width; sim vectors at 720, 1080 and 1440 are checked bit for bit in JS and PHP. tankity-layout checks no bars, ground at both edges, the portrait span and the dealt width on eight screens.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb
BODY
```

Run the pr-fix loop on review comments, gate (Global Constraints), merge on green, wait for deploy, live-check with `cd websites/www.cs && E2E_BASE_URL=https://www.cs.siue.edu/~wgrim/ tests/e2e/run.sh tankity-layout.spec.mjs`, and report `https://www.cs.siue.edu/~wgrim/play/tankity/?v=<merged sha>`.

---

## Self-review

- **Spec coverage.** Row 10: guard rules (Tasks 2–4), validated config (2), PHPUnit per rule (2–4), Cylon unchanged (5, with `cylon-play` locally), copy-not-deploy (1, 5). Row 11: keys per 6.3 (6), `cycle` gone and Esc toggles (7), chips from the table and only with a fine pointer (8), Help lists every key (9), specs updated (10). Row 12: title card over the dimmed demo with Play / Play with friends / Tutorial / Settings and initials (11–13), one set of initials for solo and rooms (13), card after a match and after a room (13), settings-only menu that keeps Difficulty (14), focus in and back (13), `tankity-start` (15). Row 13: status bar order, pills, lives `♥ N`, segmented badge (17, 19), Weapon "34 dmg · M" at 55 px (16, 17, 20), toast and no sky gauge (18, 20), portrait and landscape layouts with translucent arrows (20), breakpoints (20), eight-device measurement (20), `a11y` (21). Standings in the menu belong to row 15 and are not here. Row 13b: the solo width from the landscape box, held either way, with its clamps and columns (22); fixed per match (22, 25, 28); terrain, placement, out of bounds, the AI and the hit rates at any width (23); the server's sim taking the width, rooms at 720 with their hills, vectors at 720/1080/1440 bit for bit (24); no bars, scenery that continues the hills with no step over 1 px at the seam and is not hittable, sky above and dirt below in portrait (26); the rotate hint as a kit `pref` (27); the three new `tankity-layout` checks on all eight devices (28).
- **Placeholders.** None; each edit quotes the current text or gives the whole new file.
- **Names.** `ScoreGuard` methods (with `rateTake`, which Plan D's rooms use), `initialsPref`, `savedInitials`/`getInitials`, `createTitle`/`openTitle`/`closeTitle`/`titleOpen`/`renderTitle`, `backToTitle`, `weaponLine`, `renderGunLabel`, `placeLogBelowStatus`, `cardOpen`, and from PR 13b `fieldWidthOk`, `createFieldWidth`, `fitField`, `genTerrain(rng, w)`, `hillY`, `bandOffset`, `REACH_X`, `sceneryY`, `room_field_width`, `room_gen_hills`, `room_band_offset`, are used with the same signatures in every task, and Plans B (Task 24) and D use them as named here.
- **Kit reuse.** Chips are the kit's `KeyChip`, the title card is the kit's `Dialog`, and component tests use the kit's `importTsx` and `dom-stub.mjs`; no Tankity-only copies.
- **Review Focus.** Each line has its test in the owning task (6, 13, 4, 11, 20, 22 and 28, 23 and 24).
