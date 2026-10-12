# Games Kit, Plan D: Tankity's Rules and Scores Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** One SQLite database that holds everything Tankity keeps (rooms off shared memory, the boards, solo runs) in one private directory, cleaned up by the server itself; armor that carries between rounds; a room match that ends on the last human standing; per-match scoreboards; scores that file themselves on one all-time board per difficulty; and solo scores the server earns by playing each round itself, from the run's stored state, as the round ends.

**Architecture:** `server/db.php` opens `tankity.sqlite` in the storage directory (`games/tankity/data/` when PHP can write there, else `/var/tmp/<username>-tankity/`), picks the journal mode from the directory's filesystem, and serializes writers with `BEGIN IMMEDIATE` and a busy timeout; rooms, the old per-callsign scores and, later, the boards and solo runs are tables in it, and opportunistic housekeeping on requests deletes what has expired. The armor rules live once per language (`src/armor.ts`, `room_*_armor` in `server/rules.php`) and are pinned together by a sim-vector group. Rooms keep per-seat match stats on the server, end on the last human standing, and file each human's score on the board of the room's difficulty (`server/board.php`). Solo play moves its deterministic rules out of `match.ts` into a pure referee (`src/solo.ts`, mirrored by `server/solo.php`), flies shells and drops tanks in fixed 1/60 s steps (`server/flight.php` is the same steps in PHP), and sends each round's purchases and shots when the round ends; the server plays that round from the run's stored state, stores the new state and the running score, and at game over files the score it already holds. A determinism audit precedes the server's solo play.

**Tech Stack:** TypeScript 7 (native type stripping for `node --test`), Preact 11, esbuild via `games/_kit/build/build.mjs`, PHP 8.4 with `pdo_sqlite`, PHPUnit 12, Playwright.

**Spec:** `docs/superpowers/specs/2026-10-12-games-kit-design.md`, sections 7.1, 7.2, 7.3, 8 and 12, PR rows 20, 14, 15 and 16 of section 10.

**PRs in this plan:** four. PR 20 (Tankity storage, spec row 20) lands first; then PR 14, PR 15 and PR 16, numbered as before. No D PR was renumbered; PR 20 is new and goes in front of them.

**Landing order across plans:** difficulty PR → B6 ∥ C10 → B7 → (B8 ∥ B9) ∥ (C11 → C12 → C13) → B19 → D20 → D14 → D15 → D16 → E17 → row 18.

**Cross-plan dependencies:**
- The difficulty PR (#77: `src/difficulty.ts`; `DIFFICULTY`, `DIFFICULTIES`, `aimSkill()` and `type Difficulty` in `src/ai.ts`/`src/sim.ts`; `World.difficulty`; `ROOM_DIFFICULTY`, `room_parse_difficulty()` and `room_difficulty()` in `server/ai.php`; `$room['difficulty']`, set by the host at create and sent in every snapshot) is on `main`. Every protocol fixture (`protocol/*.json`) and `protocol/sim-vectors.json` this plan regenerates is written on top of it, by the generators (`make protocol`, `php protocol/sim-vectors.php`), never by hand.
- PR 20 needs only Plan A (PHPUnit, the kit build) and lands after B19 so it does not rebase under Plan C's Tankity PRs.
- PR 14 needs Plan C's PR 13 (the status bar in `src/ui/hud.tsx` and its `test/hud.test.mjs`) and PR 20 (`test/php/rooms-lib.php`).
- PR 15 needs PR 20 (the database), Plan C's PR 10 (the kit's `Kit\ScoreGuard` and the `kit_php` install key) and PR 12 (`src/initials.ts`, `getInitials`, the title card and `backToTitle()`, and `test/menu.test.mjs`), and Plan B's PR 19 (Menu → Quit, which Task 18's Standings button follows).
- `menu.tsx`, `menu.ts` and `test/menu.test.mjs` change in this order: the difficulty PR → Plan C Task 14 → Plan C Task 19 → Plan B Task 24 (Quit) → Task 18 here (Standings).

## Assumes from Plan C

Plan D runs after Plan C. These are the names this plan uses from Plan C's work.

| What | Name and shape |
|---|---|
| Kit score guard | `games/_kit/php/score-guard.php` (Plan C Tasks 2–4), copied into the game as `games/tankity/server/score-guard.php` when Tankity's `tools/install-files.php` config lists it under `'kit_php' => ['score-guard.php']` (generated, checked in, kept current by `php tools/install-files.php --check`). One class, `Kit\ScoreGuard`: `new ScoreGuard(array $config, string $csrfHeader, string $rateSalt, array $server, array $cookies, string $runsPath, ?Closure $clock = null, ?Closure $setCookie = null)`; `ScoreGuard::CONFIG_KEYS` (`runTtlSec`, `startsPerHour`, `scoresPerHour`, `csrfCookie`, `storageKey`, `blockedInitials`, `allowedHosts`); `static validateConfig(array): array` (throws `RuntimeException`; `runTtlSec` 60–86400); `static initials(mixed): ?string` (`[A-Za-z]{3}` in, uppercase out, null otherwise; it does not check the blocklist); `static coerceInitials(mixed $value, string $pad): string`; `isBlocked(string): bool`; `originAllowed(): bool`; `csrfToken(): string` (the cookie's token, or a new one set now); `csrfOk(): bool`; `startRun(): ?string` (null = rate-limited; a 32-hex id); `consumeRun(string $id, ?callable $plausible = null): ?string` (null accepted, else `'rate'`, `'invalid run'` or `'score rejected'`); `rateTake(string $kind, int $perHour): bool` (Task 4's per-client cap for any other endpoint). Tankity's `server/guard.php` (Task 10) is the thin wrapper that builds one from Tankity's settings, with its run store in the storage directory. |
| Initials | `src/initials.ts` exports `BLOCKED_INITIALS`, `validInitials(raw)`, `randomInitials(rng)` and `initialsPref(storage, rng)` (Plan C Task 11). `main.ts` (Plan C Task 13) holds the one set: `const savedInitials = initialsPref(browserStorage(), Math.random);` and `const getInitials = (): string => savedInitials.get();`. There is no `getInitials` export from `src/initials.ts`. The rooms host and join with `getInitials()` (`LobbyDeps.savedInitials`). |
| Title card | `main.ts` has `backToTitle(): void` (close panels, restart the demo, open the card; Plan C Task 13). Leave room (`netLeave`) and the solo end card's **Continue** return to it. `MatchDeps.backToTitle` replaced `freshMatchFromSeedBox`. |
| Menu | Plan C Task 14's settings-only menu (with Difficulty), Task 19's phone extras, and Plan B Task 24's **Quit**; **Scores** calls `toggleOverlay('report-overlay', 'scores-open')`. Plan C does not add Standings: Task 18 here does (`MenuDeps.openStandings`, `MenuProps.onStandings`, `#menu-standings`, shown only in a room). |
| Status bar | Plan C Task 17's `src/ui/hud.tsx`: `HudProps.armor` is `{ shown: string; sr: string }`, drawn in the ARMOR pill's `#hud-armor`; its tests are `test/hud.test.mjs` (node:test). `src/hud.ts` (Task 19) has `HUD.armor` and `renderStanding()`. |
| End card | Plan C Task 13's `src/ui/endveil.tsx`: the solo button reads **Continue** and goes back to the title card; a room's reads **Back to rooms**. |
| e2e helpers | `tests/e2e/helpers.mjs` has `newPlayer`, `hud`, `aimTo`, `setPower`, `roomPair`, `setInitials` (Plan C Task 15) and `startSolo(page)` (deals in, leaves the shop, waits for the first aim). Task 7 adds `dealSolo(page)`: click `#title-play` and wait for the pre-match shop (`#shop-veil`). |
| Test helpers | Component tests load `.tsx` with the kit's `importTsx` (`games/_kit/test/tsx.ts`) and render into `games/_kit/test/dom-stub.mjs` (Plan B Task 5). |

## Decisions

William's answers (2026-10-12); every task below is written to them.

1. **One all-time board per difficulty.** Easy, Normal and Hard each keep their own best 100 runs. A run files on the board of the difficulty it was played at (a room's is its host's). Menu → Scores opens on the player's current difficulty's board, with a switcher to the other two. Rows filed before boards had a difficulty go on the Normal board.
2. **Tanks fall mid-volley.** The browser keeps today's behaviour: a tank left over a crater falls while shells are still flying, and a later shell of the same volley meets it where it has fallen to. The war (aim, flight and falls) runs in fixed 1/60 s steps, and the server's solo simulation (`server/flight.php`) takes the same steps in the same order, pinned by the `volley-fall` sim vectors.
3. **The server keeps a solo run as it is played; nothing is replayed at the end.** The run starts with a single-use guard run token. As each round ends the browser sends that round's purchases and shots and how it saw the round end; the server plays the round from the run's stored state, stores the new state and the running score in SQLite, and answers. At game over the server already holds the score, and filing reads it. There is no round limit: CPU is bounded per round (2 s, and at most 200 player shots), not per run. A round whose outcome differs from the client's claim voids the run (the server's simulation is the authority; once the two disagree nothing later could match). A run expires two hours after the last round the server accepted, and 24 hours after it started at the latest; an expired run cannot advance or file and housekeeping deletes it.
4. **Rooms move into SQLite**, replacing SysV shared memory. One writer at a time, through `BEGIN IMMEDIATE` and a 2 s busy timeout (a request that waits longer answers 503, as a busy room did). The shared-memory code and the ping's `store: "memory"` report are removed.
5. **Storage location: one setting, then a fixed order.** `data_dir` / `TANKITY_DATA_DIR` (read through `tankity_setting()`: the environment, then `.config.yaml`) names the one directory for everything Tankity keeps; when set it is used exactly, created 0700 when missing, and an unwritable one is an error (logged, "store unavailable"), never a silent move elsewhere. It replaces `scores_dir` / `TANKITY_SCORES_DIR`, which is retired: an existing `scores_dir` is read only as the place to import old score files from. `shm_key` / `TANKITY_SHM_KEY` are retired with shared memory. When `data_dir` is unset, in this order: `games/tankity/data/` when PHP can write there (it then also writes `data/.htaccess` denying HTTP), else `/var/tmp/<username>-tankity/`, where `<username>` is `get_current_user()`: the owner of the running script, which is the account the site is deployed as (`wgrim` on the host), the same for every PHP-FPM worker and pool, and needing no extension; `uid<N>` (from `getmyuid()`) when the name cannot be resolved. A directory PHP creates is mode 0700 and its files 0600; a `/var/tmp` directory that is a symlink, not PHP's own, or open to group or others is refused. Every Tankity file lives there: `tankity.sqlite` (rooms, the boards, solo runs, and the old per-callsign scores until they are converted) and the guard's run store `guard-runs.json`. The old `/var/tmp/<callsign>-operation-tankity.json` files are imported once, idempotently, without losing a run, and each is deleted only after its import committed and only if it did not change since it was read. The journal mode is WAL on a local filesystem and DELETE otherwise (including when the filesystem cannot be read), chosen at run time.
6. **The server cleans up after itself**: idle rooms, expired solo runs, converted per-callsign rows, the old files once imported, and leftover temp files. The host has no cron, so housekeeping runs on requests, at most once every five minutes, each job bounded, and every function takes the clock as an argument so tests use a fake one.

## Global Constraints

- Paths below are relative to `websites/www.cs/` unless they start with `games/tankity/`-relative commands; every `Run:` line says where it runs.
- The host is the sftp-only PHP 8.4 server; nothing is built there. What ships is static files plus runtime PHP. `dist/` is checked in and must match `node ../_kit/build/build.mjs tankity --check`. `pdo_sqlite` and `sqlite3` are loaded on the host and in the docker PHP (`docker/expected-modules.txt`).
- A built game folder needs nothing outside itself at run time: Tankity's PHP may require only files inside `games/tankity/` (the guard is the generated copy `server/score-guard.php`, never `../_kit/`).
- Pinned versions: `typescript` 7.0.2, `esbuild` 0.28.2, `preact` 11.0.1; `phpunit/phpunit` ^12.
- Never bind a port someone may be using (3000, 5173, 8000, 8080); the docker site publishes an ephemeral port and specs get it from `make url`; PHP tests that serve take a free 127.0.0.1 port from the kernel.
- SQL stays within SQLite 3.8: no `UPSERT`, `RETURNING` or window functions (the host's version is confirmed by Task S1).
- Every PHP test that touches storage points `TANKITY_DATA_DIR` at its own temporary directory (made with `tankity_test_dir()` from `test/php/rooms-lib.php`) and never at `games/tankity/data/` or `/var/tmp/<username>-tankity/`.
- Browser specs run only through `make e2e` / `tests/e2e/run.sh` (the e2e lock). Agents run `make test` plus at most the 1–2 specs each task names; CI runs the selected specs in four shards.
- New browser specs target ≤ 15 s each (Playwright `page.clock` where timers matter) and are registered in `tests/e2e/shard.mjs` `WEIGHTS` (`select.mjs` already maps every `tankity-*` spec to Tankity changes).
- `make test` budgets: static ≤ 15 s, unit ≤ 45 s. Slow sweeps (long recorded runs) run in the nightly job only (PHPUnit group `slow`).
- Tests: new node tests are `test/*.test.mjs` on `node:test` + `node:assert/strict` (no `check()` bridge); spec row 18 turns them into `.test.ts`. New UI tests never extend the `check()`-style `test/ui.test.mjs`: they go in new node:test files (`test/standings-ui.test.mjs`, `test/endveil.test.mjs`, `test/scores-ui.test.mjs`) or in Plan C's (`test/hud.test.mjs`, `test/menu.test.mjs`), loading `.tsx` with the kit's `importTsx`; a `ui.test.mjs` block those files replace is deleted. New PHP tests are real `PHPUnit\Framework\TestCase` classes in `games/tankity/test/php/` (or `test/php-docker/` when they serve HTTP) that load the room library in `setUpBeforeClass()` through `test/php/rooms-lib.php`.
- Comments say why, not what; no history ("kept from", "moved in #NN"); file headers 1–5 lines. Docs (`games/tankity/README.md`) describe the current state.
- One PR per spec row: PR 20 (Tasks S1–S8), PR 14 (Tasks 1–7), PR 15 (Tasks 8–20), PR 16 (Tasks 21–35). Each PR: branch in its own worktree off `main`, CI, the pr-fix loop on review comments, merge on green CI after pr-fix (William authorized merging on green; CodeRabbit rate-limit notices never block), deploy, a light live check, and a report ending with a cache-busted `/play/tankity/?v=<sha>` link.
- Generated files are never hand-merged. Every Tankity PR rewrites `dist/`, `sw.js`, `index.html`'s `?v=` values and `game.json`, and this plan's PRs also `protocol/*.json`, `protocol/sim-vectors.json` and `protocol/solo-runs.json`; after rebasing onto `main`, take either side of a conflict in them and rebuild: `cd websites/www.cs/games && npm run build && php tankity/tools/game-json.php && php tankity/tools/install-files.php`, then `cd websites/www.cs && php tools/site-versions.php && make protocol && (cd games/tankity && php protocol/sim-vectors.php && node tools/solo-runs.mjs)` (each generator that exists by then), and commit what they wrote.
- Browser specs run as `make e2e E2E_ARGS="<spec> [<spec>]"` (the Makefile has no `SPECS` variable).
- Spec constants, verbatim: max armor = 100 + 25 × hull plates; Repair +40 restores up to max; winner's bonus = the round bonus × 2 (round bonus = 750 + round × 150); `WATCH_TURNS` = 40 stays; initials `[A-Za-z]{3}` in, `[A-Z]{3}` stored; one board per difficulty, best 100 each; a solo round: at most 2 s of CPU and 200 player shots; a solo run expires 2 h after its last accepted round and 24 h after its start; housekeeping at most every 300 s.
- Every commit message ends with:
  ```
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb
  ```

## Review Focus

1. **A solo run on a 30 Hz phone, a 144 Hz monitor, or a tab throttled in the background, with tanks falling into craters mid-volley.** Frame lengths vary wildly; the server's per-round play must still land every shell and drop every tank where the browser did, so the filed score equals the shown one. Pinned by `test/fixed-step.test.mjs` "every step is exactly SOLO_STEP whatever the frame lengths" (Task 23), the jittered-frame test in `test/solo-play.test.mjs` (Task 26), and `FlightTest::testTheVolleyFallVectorsMatch` (Task 29).
2. **A client that lies about a round** (a shot it never fired, a claim of a won round the server sees lost, a forged score field, a round sent twice or out of order). Expected: the server's own play decides; a mismatched claim voids the run and nothing files; a repeated round answers the stored reply without playing it again. Pinned by `ScoresApiTest::testALyingClaimVoidsTheRun`, `testAForgedScoreFieldIsIgnored`, `testARoundSentTwiceIsPlayedOnce`, `testARoundOutOfOrderIsRefused` (Task 31).
3. **The host's storage**: `games/tankity/data/` not writable, `/var/tmp/<username>-tankity` pre-created by another account or as a symlink, `/proc/self/mounts` unreadable, the directory on NFS. Expected: the fallback is taken, a foreign or open directory is refused (503, nothing written), unknown or network filesystems get the DELETE journal. Pinned by `DataDirTest` (Task S2) and confirmed on the real host by Task S1's probe.
4. **The one-time import of the old score files**, interrupted halfway, run twice, or racing a file that changes while it is read. Expected: every run in every old file ends up in the database exactly once, and a file is deleted only after its import committed and only if it is unchanged. Pinned by `LegacyImportTest::testAnInterruptedImportResumesWithoutDuplicates`, `testAFileThatChangedIsKeptForTheNextPass` (Task S5).
5. **Two creates racing for the last room, and one room's slow turn.** Expected: the cap is exact (one wins, one gets 409), and a request that waits past the 2 s busy timeout answers 503 rather than hanging a PHP worker. Pinned by `RoomsStoreTest::testTwoCreatesRaceForTheLastPlace` and `testAHeldWriterMakesOthersWaitThenAnswerBusy` (Task S4).
6. **Old free-text callsigns on the Normal board** (`""`, `"123"`, `"r2-d2"`, `"bo"`, `"ass"`, `"tankity ace"`). Expected: three letters, never a blocked set, every old callsign's best run still listed. Pinned by `BoardTest::testOddCallsignsConvert` and `testConvertsCallsignRowsOnceOntoTheNormalBoard` (Task 10).
7. **Two humans losing their last lives in the same round.** In a 3-human room with one left, that one wins; in a 2-human room nobody is left, so the match ends with no winner and no bonus. Pinned by `RoomMatchEndTest::testTwoOutAtOnceLeaveOneWinner` and `testLastTwoFallTogetherNobodyWins` (Task 8).
8. **Buying Repair at full armor, or more packs than the hull needs, in a room or solo.** Expected: refused at full, otherwise only the packs that fill the hull are charged. Pinned by `RoomBuyTest::testRepairAtFullArmorIsRefusedAndCostsNothing` / `testRepairBuysOnlyThePacksThatFillTheHull` (Task 3) and `test/armor.test.mjs` "packs wanted" (Task 1).

---

## File Structure

```
games/tankity/
  data/                    runtime only (gitignored, never deployed): tankity.sqlite, guard-runs.json, .htaccess
  server/db.php            create (S2)   the storage directory, the database, its schema steps, transactions
  server/store.php         rewrite (S3)  rooms as rows: load/lock, save, alloc, register, close, sweep, count
  server/legacy.php        create (S5)   the one-time import of the old per-callsign files; the callsigns table
  server/housekeep.php     create (S6)   throttled, bounded cleanup jobs on requests
  src/armor.ts             create (T1)   max armor, repair, plates, carry-over, the shop's two notes
  src/standings.ts         create (T13–14, T18) match-end rule, winner bonus, scoreboard rows, the filed line, what Esc does on an end card
  src/ui/standings.tsx     create (T15)  the scoreboard table (room or solo)
  src/solo.ts              create (T22, T24) the solo referee: deal, muster, settle, turns, 1-ups, buy, drone aim
  src/solo-log.ts          create (T25)  a round's inputs and claim, and their validators
  src/solo-play.ts         create (T26)  headless solo runs, a bot, and soloRound (the server's round in TypeScript)
  src/solo-file.ts         create (T32)  sending a run's rounds and filing it, with the offline queue
  src/flow.ts              modify (T23)  runFixed replaces runWar
  src/match.ts, shop.ts, room.ts, lobby.ts, scores.ts, hud.ts, main.ts, net.ts, protocol.ts, game-types.ts  modify
  src/ui/endveil.tsx, shop.tsx, scores.tsx, hud.tsx  modify
  src/sim.ts               modify (T21, T26) rad(), dist(), squares, seek and bomblet alignment; flyVolley()
  server/rules.php         modify        armor, room_buy, match end, stats, filing, again
  server/sim.php           modify (T21, T30) room_dist, squares, lance bracket, hot-loop constants
  server/protocol.php      modify        snapshot fields
  server/guard.php         create (T10)  BLOCKED_INITIALS, tankity_guard() (a Kit\ScoreGuard from Tankity's settings), tankity_initials()
  server/board.php         create (T10)  the boards (one per difficulty) and the callsign conversion
  server/solo.php          create (T28, T30) the solo referee in PHP and solo_round()
  server/flight.php        create (T29)  a volley in fixed steps with tanks falling, as the browser flies it
  server/scores-api.php    create (T31)  the score endpoint's handler: start, round, file
  rooms.php                modify        requires, store, buy, start, again, origin and rate gates
  scores.php               modify (S5, T19, T31) thin endpoint over the database / board / scores-api
  rooms-web-test.php       modify (S4)   the live check without shared memory
  protocol/generate.php    modify (S4)   a private data directory instead of a private memory key
  protocol/sim-vectors.php modify        groups armor, match-end, solo-deal, volley-fall; known cases dropped
  protocol/solo-runs.json  create (T27)  recorded bot runs, round by round, the PHP play must match
  tools/solo-runs.mjs      create (T27)  writes / checks solo-runs.json
  tools/round-bench.php    create (T30)  CPU per recorded round
  test/*.test.mjs          create/modify as named per task (UI: standings-ui, endveil, scores-ui; Plan C's hud and menu)
  test/php/rooms-lib.php   create (S2)
  test/php/*Test.php       create as named per task
  test/php-docker/RoomsStoreTest.php  rewrite (S4) a real TestCase; checks/rooms-store.php deleted
  test/php-docker/checks/rooms.php    modify (S4)
  .config.yaml, game.css, game.yaml, game.json, README.md, test.sh  modify
.gitignore                  modify (S7)   games/tankity/data/
deploy.sh                   modify (S7)   never stages games/tankity/data/
docker/nginx/default.conf   modify (S7)   deny /games/tankity/data/
Makefile                    modify (S7, T27) the data-deny check; solo-runs target
tests/php/checks/deploy-set.php   modify (S7)
tests/e2e/helpers.mjs             modify (T7)   dealSolo(page)
tests/e2e/tankity-armor.spec.mjs  create (T7)
tests/e2e/tankity-end.spec.mjs    modify (T20, T35)
tests/e2e/tankity-hud.spec.mjs    modify (T6)
tests/e2e/shard.mjs               modify (T7)
.github/workflows/ci.yml          modify (T30)  nightly runs the slow PHPUnit group and the round bench
```

---

# PR 20: Tankity storage — one SQLite database, rooms off shared memory, cleanup

Branch `games/tankity-storage`, worktree `.claude/worktrees/tankity-storage`, off `main` after Plan B's PR 19 merged. Task S1 runs before the branch has any code.

### Task S1: Probe the host's storage, read-only, before any code

The approved probe-script approach (the www.cs host is sftp-only and chrooted, so a PHP file is the only way to see what PHP-FPM sees): upload a randomly named PHP file at mode 644, fetch it once, delete it. The probe reads and writes nothing else; it opens SQLite only in memory.

**Files:**
- Create (in the session's scratchpad, never in the repository): `p<16 hex>.php`

**Interfaces:**
- Produces: the probe's JSON, pasted into PR 20's description under "Host probe", and the go/stop answer from the table in Step 4. Tasks S2–S8 rely on it.

- [ ] **Step 1: Write the probe**

Run (anywhere): `P=$(mktemp -d) && N=p$(openssl rand -hex 8).php && echo "$P/$N"`, then write `"$P/$N"`:

```php
<?php
// Read-only probe of what PHP-FPM sees for Tankity's storage (Plan D, Task S1).
// Uploaded under a random name, fetched once, deleted. It writes nothing.
declare(strict_types=1);
header('Content-Type: application/json');
header('Cache-Control: no-store');
$mounts = @file_get_contents('/proc/self/mounts');
$fs = function (string $path) use ($mounts): ?array {
    if (!is_string($mounts)) {
        return null;
    }
    $real = @realpath($path) ?: $path;
    $best = null;
    foreach (explode("\n", $mounts) as $line) {
        $f = preg_split('/\s+/', trim($line));
        if (!is_array($f) || count($f) < 4) {
            continue;
        }
        $mp = str_replace(['\\040', '\\011', '\\012', '\\134'], [' ', "\t", "\n", '\\'], $f[1]);
        $inside = $mp === '/' || $real === $mp || str_starts_with($real, rtrim($mp, '/') . '/');
        if ($inside && ($best === null || strlen($mp) > strlen($best['mount']))) {
            $best = ['mount' => $mp, 'type' => $f[2], 'device' => $f[0], 'options' => $f[3]];
        }
    }
    return $best;
};
$who = function (int $uid): ?string {
    $pw = function_exists('posix_getpwuid') ? posix_getpwuid($uid) : false;
    return is_array($pw) ? (string) $pw['name'] : null;
};
$dir = function (string $p) use ($fs, $who): array {
    clearstatcache();
    $exists = file_exists($p);
    return [
        'path' => $p, 'exists' => $exists, 'is_dir' => is_dir($p), 'is_link' => is_link($p),
        'writable' => $exists ? is_writable($p) : null, 'parent_writable' => is_writable(dirname($p)),
        'mode' => $exists ? sprintf('%04o', fileperms($p) & 07777) : null,
        'owner' => $exists ? ($who((int) fileowner($p)) ?? (string) fileowner($p)) : null,
        'fs' => $fs($p),
    ];
};
$user = strtolower((string) preg_replace('/[^A-Za-z0-9_-]+/', '', get_current_user()));
$user = $user !== '' ? substr($user, 0, 32) : 'uid' . getmyuid();
$legacy = glob('/var/tmp/*-operation-tankity.json') ?: [];
$mtimes = array_map(fn(string $f): int => (int) @filemtime($f), $legacy);
try {
    $pdo = (string) (new PDO('sqlite::memory:'))->query('select sqlite_version()')->fetchColumn();
} catch (Throwable $e) {
    $pdo = 'error: ' . $e->getMessage();
}
echo json_encode([
    'php' => PHP_VERSION, 'sapi' => PHP_SAPI,
    'sqlite3' => class_exists('SQLite3') ? SQLite3::version()['versionString'] : null,
    'pdo_sqlite' => $pdo,
    'euid' => function_exists('posix_geteuid') ? [posix_geteuid(), $who(posix_geteuid())] : null,
    'get_current_user' => get_current_user(), 'getmyuid' => getmyuid(), 'tankity_user' => $user,
    'open_basedir' => ini_get('open_basedir'), 'disable_functions' => ini_get('disable_functions'),
    'sys_get_temp_dir' => sys_get_temp_dir(), 'umask' => sprintf('%04o', umask()),
    'mounts_readable' => is_string($mounts),
    'dirs' => [$dir(__DIR__), $dir(__DIR__ . '/data'), $dir('/var/tmp'), $dir('/var/tmp/' . $user . '-tankity')],
    'legacy_files' => [
        'count' => count($legacy), 'bytes' => array_sum(array_map(fn(string $f): int => (int) @filesize($f), $legacy)),
        'oldest' => $mtimes ? gmdate('c', min($mtimes)) : null, 'newest' => $mtimes ? gmdate('c', max($mtimes)) : null,
    ],
    'legacy_tmp_files' => count(glob('/var/tmp/*-operation-tankity.json.tmp.*') ?: []),
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n";
```

(`umask()` with no argument only reads the mask.)

- [ ] **Step 2: Upload, fetch, delete**

Run (anywhere, with `$P` and `$N` from Step 1):

```bash
chmod 644 "$P/$N"
sshpass -f ~/.ssh/.passwd.siue scp -p "$P/$N" "wgrim@www.cs.siue.edu:games/tankity/$N"
curl -sS "https://www.cs.siue.edu/~wgrim/games/tankity/$N" > "$P/probe.json"
printf 'rm "games/tankity/%s"\n' "$N" | sshpass -f ~/.ssh/.passwd.siue sftp -q -oBatchMode=no -b - wgrim@www.cs.siue.edu
curl -s -o /dev/null -w '%{http_code}\n' "https://www.cs.siue.edu/~wgrim/games/tankity/$N"
cat "$P/probe.json"
```

Expected: the last `curl` prints `404` (the probe is gone), and `probe.json` is the JSON above. (`-oBatchMode=no` must come before `-b`, or sftp refuses the password.) If the delete failed, delete it by hand before anything else.

- [ ] **Step 3: Record it**

Keep `probe.json`; it goes into PR 20's description (Task S8) under "Host probe". Note `legacy_files.count`: Task S8's live check expects every one of those callsigns on the board after the deploy.

- [ ] **Step 4: Go or stop**

Read the JSON against this table. Any "stop" row: stop, report the JSON and the row to William, and wait.

| The probe says | Then |
|---|---|
| `pdo_sqlite` is a version ≥ 3.8.0 | go (WAL needs 3.7.0; this plan's SQL needs nothing newer) |
| `pdo_sqlite` older, or `error: …` | **stop** |
| `dirs[1]` (`…/data`) `writable` true, or absent with `dirs[0].writable` true | storage is `games/tankity/data/` (PHP writes `data/.htaccess` itself) |
| otherwise `dirs[2]` (`/var/tmp`) `writable` true, and `dirs[3]` absent or (`is_dir`, not `is_link`, `owner` = `euid[1]`, `mode` `0700`) | storage is `/var/tmp/<tankity_user>-tankity/` |
| `dirs[3]` exists but is a link, someone else's, or open to group/others | **stop**: the code refuses it (503 on every request); William removes it first |
| neither directory writable | **stop** |
| the chosen directory's `fs.type` is one of `ext2 ext3 ext4 xfs btrfs zfs f2fs jfs reiserfs bcachefs overlay` | journal mode WAL |
| `fs.type` is anything else (`nfs`, `nfs4`, `cifs`, `smb3`, `fuse.*`, `9p`, `ceph`, `glusterfs`, `afs`, …), or `mounts_readable` false | journal mode DELETE (the code chooses it); for an `nfs*`, `cifs` or `smb*` filesystem also **stop**: SQLite's locks are unreliable over a network filesystem even with DELETE, and rooms write constantly, so William decides whether to go on |
| `fs.type` is `tmpfs` | WAL, but **stop**: tmpfs empties on reboot and the boards would go with it |
| `open_basedir` is set and leaves out the chosen directory or `/var/tmp` | **stop** (the fallback cannot be opened) |

The code makes the same choices at run time (Task S2); this step only confirms that the host lands on a "go" row before any code ships.

### Task S2: The storage directory and the database

**Files:**
- Create: `games/tankity/server/db.php`
- Create: `games/tankity/test/php/rooms-lib.php`
- Create: `games/tankity/test/php/DataDirTest.php`
- Create: `games/tankity/test/php/DbTest.php`
- Modify: `games/tankity/test/php/checks/config.php` (`data_dir` replaces `scores_dir` in the precedence checks)

**Interfaces:**
- Produces (`server/db.php`): `TANKITY_DB_FILE = 'tankity.sqlite'`, `TANKITY_DIR_MODE = 0700`, `TANKITY_FILE_MODE = 0600`, `TANKITY_BUSY_MS = 2000`, `TANKITY_LOCAL_FS`; `tankity_username(): string`; `tankity_euid(): int`; `tankity_claim_dir(string $dir, bool $private): string` (throws `RuntimeException`); `tankity_deny_http(string $dir): bool`; `tankity_pick_dir(string $preferred, string $fallback, ?Closure $writable = null): string`; `tankity_data_dir(): string` (setting `TANKITY_DATA_DIR` / `data_dir` wins); `tankity_fs_type(string $path, ?string $mounts = null): ?string`; `tankity_journal_mode(string $dir, ?string $mounts = null): string` (`'wal' | 'delete'`; setting `TANKITY_JOURNAL` / `journal_mode` wins); `tankity_schema_steps(): array<int, list<string>>` (version 1: tables `meta`, `rooms`, `callsigns`); `tankity_schema(PDO $db): void`; `tankity_db(): PDO`; `tankity_depth(PDO $db, int $delta = 0): int`; `tankity_tx(PDO $db, callable $fn): mixed`; `tankity_busy(Throwable $e): bool`.
- Produces (`test/php/rooms-lib.php`): `tankity_test_dir(): string` (a fresh 0700 directory, and `TANKITY_DATA_DIR` pointed at it); `tankity_test_rm(string $dir): void`; on load, a process-wide default `TANKITY_DATA_DIR` when none is set, so no test ever stores in the game's own directories.

- [ ] **Step 1: The test library, and the failing tests**

```php
<?php
// games/tankity/test/php/rooms-lib.php
// Loads rooms.php for its functions only (no request is served) and keeps
// every test's storage in its own temporary directory. TestCases require this
// in setUpBeforeClass; check scripts require it instead of rooms.php.
declare(strict_types=1);
if (!defined('TANKITY_ROOMS_LIB')) {
    define('TANKITY_ROOMS_LIB', true);
}
require_once dirname(__DIR__, 2) . '/server/db.php';
require_once dirname(__DIR__, 2) . '/rooms.php';

/* Removes a test directory and everything in it, and points TANKITY_DATA_DIR
   back at this process's default. */
function tankity_test_rm(string $dir): void
{
    foreach (array_diff(scandir($dir) ?: [], ['.', '..']) as $f) {
        $p = "$dir/$f";
        is_dir($p) && !is_link($p) ? tankity_test_rm($p) : @unlink($p);
    }
    @rmdir($dir);
    putenv('TANKITY_DATA_DIR=' . ($GLOBALS['TANKITY_TEST_HOME'] ?? ''));
}

/* A fresh private directory, with TANKITY_DATA_DIR pointed at it. */
function tankity_test_dir(): string
{
    $dir = sys_get_temp_dir() . '/tankity-test-' . bin2hex(random_bytes(6));
    tankity_claim_dir($dir, true);
    putenv('TANKITY_DATA_DIR=' . $dir);
    return $dir;
}

// A process that sets no directory stores in one of its own, removed at exit.
if ((string) getenv('TANKITY_DATA_DIR') === '' && !isset($GLOBALS['TANKITY_TEST_HOME'])) {
    $GLOBALS['TANKITY_TEST_HOME'] = sys_get_temp_dir() . '/tankity-test-' . getmypid() . '-' . bin2hex(random_bytes(4));
    tankity_claim_dir($GLOBALS['TANKITY_TEST_HOME'], true);
    putenv('TANKITY_DATA_DIR=' . $GLOBALS['TANKITY_TEST_HOME']);
    register_shutdown_function(static fn() => tankity_test_rm($GLOBALS['TANKITY_TEST_HOME']));
}
```

```php
<?php
// games/tankity/test/php/DataDirTest.php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

/* Where Tankity keeps its files: data/ when PHP can write it (with the deny
   file), else a private /var/tmp directory, and never one someone else made. */
final class DataDirTest extends TestCase
{
    private string $root;

    public static function setUpBeforeClass(): void
    {
        require_once __DIR__ . '/rooms-lib.php';
    }

    protected function setUp(): void
    {
        $this->root = tankity_test_dir();
    }

    protected function tearDown(): void
    {
        foreach (glob($this->root . '/*') ?: [] as $d) {
            @chmod($d, 0700);
        }
        tankity_test_rm($this->root);
    }

    public function testAWritablePreferredDirectoryIsUsedAndDeniesHttp(): void
    {
        $pref = $this->root . '/data';
        $this->assertSame($pref, tankity_pick_dir($pref, $this->root . '/fallback'));
        $this->assertSame(0700, fileperms($pref) & 0777);
        $this->assertStringContainsString('Require all denied', (string) file_get_contents($pref . '/.htaccess'));
        $this->assertDirectoryDoesNotExist($this->root . '/fallback');
    }

    public function testAnUnwritablePreferredDirectoryFallsBackToAPrivateOne(): void
    {
        $fallback = $this->root . '/someone-tankity';
        $this->assertSame($fallback, tankity_pick_dir($this->root . '/data', $fallback, fn(string $p): bool => false));
        $this->assertSame(0700, fileperms($fallback) & 0777);
        $this->assertDirectoryDoesNotExist($this->root . '/data');
    }

    public function testAPreferredDirectoryThatCannotTakeItsDenyFileIsNotUsed(): void
    {
        if (tankity_euid() === 0) {
            $this->markTestSkipped('root writes through any mode');
        }
        $pref = $this->root . '/data';
        mkdir($pref, 0500);
        $this->assertSame($this->root . '/fallback', tankity_pick_dir($pref, $this->root . '/fallback', fn(string $p): bool => true));
    }

    public function testAFallbackOpenToOthersIsRefused(): void
    {
        $open = $this->root . '/open';
        mkdir($open);
        chmod($open, 0777);
        $this->expectException(RuntimeException::class);
        tankity_pick_dir($this->root . '/data', $open, fn(string $p): bool => false);
    }

    public function testASymlinkedFallbackIsRefused(): void
    {
        mkdir($this->root . '/elsewhere', 0700);
        symlink($this->root . '/elsewhere', $this->root . '/link');
        $this->expectException(RuntimeException::class);
        tankity_pick_dir($this->root . '/data', $this->root . '/link', fn(string $p): bool => false);
    }

    public function testTheUsernameIsTheScriptOwnersAndSafeInAPath(): void
    {
        $name = tankity_username();
        $this->assertMatchesRegularExpression('/^[a-z0-9_-]{1,32}$/', $name);
        $owner = strtolower((string) preg_replace('/[^A-Za-z0-9_-]+/', '', get_current_user()));
        $this->assertSame($owner !== '' ? substr($owner, 0, 32) : 'uid' . getmyuid(), $name);
        $this->assertSame($name, tankity_username(), 'the same on every call');
    }

    public function testTheDataDirSettingWins(): void
    {
        $this->assertSame($this->root, tankity_data_dir());
    }

    public function testADataDirFromTheConfigFileIsUsedExactlyAndCreatedPrivate(): void
    {
        $want = $this->root . '/configured/store';
        file_put_contents($this->root . '/c.yaml', "data_dir: \"$want\"\n");
        putenv('TANKITY_DATA_DIR');
        putenv('CONFIG_FILE=' . $this->root . '/c.yaml');
        tankity_config(true);
        try {
            $this->assertSame($want, tankity_data_dir());
            $this->assertSame(0700, fileperms($want) & 0777);
        } finally {
            putenv('CONFIG_FILE');
            tankity_config(true);
        }
    }

    public function testAnUnwritableDataDirFailsLoudlyAndNeverFallsBack(): void
    {
        if (tankity_euid() === 0) {
            $this->markTestSkipped('root writes through any mode');
        }
        $locked = $this->root . '/locked';
        mkdir($locked, 0500);
        putenv('TANKITY_DATA_DIR=' . $locked);
        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage("$locked is not a writable directory");
        tankity_data_dir();
    }
}
```

```php
<?php
// games/tankity/test/php/DbTest.php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

/* The database: private, at the latest schema, the journal its filesystem
   allows, one writer at a time. */
final class DbTest extends TestCase
{
    private string $dir;

    public static function setUpBeforeClass(): void
    {
        require_once __DIR__ . '/rooms-lib.php';
    }

    protected function setUp(): void
    {
        $this->dir = tankity_test_dir();
    }

    protected function tearDown(): void
    {
        putenv('TANKITY_JOURNAL');
        tankity_test_rm($this->dir);
    }

    public function testANewDatabaseIsPrivateAndAtTheLatestSchema(): void
    {
        $db = tankity_db();
        $path = $this->dir . '/' . TANKITY_DB_FILE;
        $this->assertSame(0600, fileperms($path) & 0777);
        $this->assertSame(max(array_keys(tankity_schema_steps())), (int) $db->query('PRAGMA user_version')->fetchColumn());
        $this->assertSame(TANKITY_BUSY_MS, (int) $db->query('PRAGMA busy_timeout')->fetchColumn());
        $this->assertSame(tankity_journal_mode($this->dir), strtolower((string) $db->query('PRAGMA journal_mode')->fetchColumn()));
        $tables = $db->query("SELECT name FROM sqlite_master WHERE type = 'table'")->fetchAll(PDO::FETCH_COLUMN);
        foreach (['meta', 'rooms', 'callsigns'] as $t) {
            $this->assertContains($t, $tables);
        }
    }

    public function testTheSchemaStepsRunOnce(): void
    {
        $db = tankity_db();
        tankity_schema($db);
        $this->assertSame(max(array_keys(tankity_schema_steps())), (int) $db->query('PRAGMA user_version')->fetchColumn());
    }

    public function testTheJournalFollowsTheFilesystem(): void
    {
        $mounts = "/dev/sda1 / ext4 rw 0 0\nfiler:/home /home nfs4 rw 0 0\ntmpfs /run tmpfs rw 0 0\n//srv/share /mnt/my\\040share cifs rw 0 0\n";
        $this->assertSame('ext4', tankity_fs_type('/srv/tankity', $mounts));
        $this->assertSame('nfs4', tankity_fs_type('/home/wgrim/public_html/games/tankity/data', $mounts));
        $this->assertSame('cifs', tankity_fs_type('/mnt/my share/db', $mounts));
        $this->assertSame('wal', tankity_journal_mode('/srv/tankity', $mounts));
        $this->assertSame('delete', tankity_journal_mode('/home/wgrim', $mounts));
        $this->assertSame('delete', tankity_journal_mode('/mnt/my share', $mounts));
        $this->assertNull(tankity_fs_type('/srv/tankity', ''));
        $this->assertSame('delete', tankity_journal_mode('/srv/tankity', ''), 'an unreadable mount table is not trusted');
    }

    public function testTheJournalSettingOverrides(): void
    {
        putenv('TANKITY_JOURNAL=delete');
        $this->assertSame('delete', tankity_journal_mode('/srv/tankity', "/dev/sda1 / ext4 rw 0 0\n"));
    }

    public function testAFailedTransactionLeavesNothing(): void
    {
        $db = tankity_db();
        try {
            tankity_tx($db, function (PDO $db): void {
                $db->exec("INSERT INTO meta (k, v) VALUES ('x', '1')");
                throw new RuntimeException('boom');
            });
        } catch (RuntimeException) {
            // expected: the point is what it left behind
        }
        $this->assertFalse($db->query("SELECT v FROM meta WHERE k = 'x'")->fetchColumn());
        $this->assertSame(0, tankity_depth($db));
    }

    public function testAnInnerTransactionJoinsTheOuterOne(): void
    {
        $db = tankity_db();
        tankity_tx($db, function (PDO $db): void {
            tankity_tx($db, fn(PDO $db) => $db->exec("INSERT INTO meta (k, v) VALUES ('inner', '1')"));
            $this->assertSame(1, tankity_depth($db));
        });
        $this->assertSame('1', $db->query("SELECT v FROM meta WHERE k = 'inner'")->fetchColumn());
    }

    public function testASecondWriterWaitsThenGivesUpBusy(): void
    {
        $db = tankity_db();
        $other = new PDO('sqlite:' . $this->dir . '/' . TANKITY_DB_FILE, null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
        $other->exec('PRAGMA busy_timeout = 100');
        $db->exec('BEGIN IMMEDIATE');
        try {
            $t = microtime(true);
            try {
                tankity_tx($other, fn() => null);
                $this->fail('a second writer got in');
            } catch (PDOException $e) {
                $this->assertTrue(tankity_busy($e));
            }
            $this->assertGreaterThanOrEqual(0.09, microtime(true) - $t);
        } finally {
            $db->exec('ROLLBACK');
        }
    }
}
```

In `test/php/checks/config.php` the precedence checks move from the retired `scores_dir` to `data_dir`: in the `a.yaml` fixture replace `scores_dir: \"/tmp/sco\" # trailing note` with `data_dir: \"/tmp/sco\" # trailing note`, and replace the `file-dir` check with:

```php
$check('file-dir', tankity_setting('TANKITY_DATA_DIR', 'data_dir', '') === '/tmp/sco');
putenv('TANKITY_DATA_DIR=/tmp/env-dir');
$check('env-dir-beats-file', tankity_setting('TANKITY_DATA_DIR', 'data_dir', '') === '/tmp/env-dir');
putenv('TANKITY_DATA_DIR');
```

(The script saves and restores `TANKITY_DATA_DIR` like `TANKITY_MAX_ROOMS`: add `$oldDir = getenv('TANKITY_DATA_DIR');` beside `$oldMax`, and at the end `if (is_string($oldDir)) { putenv('TANKITY_DATA_DIR=' . $oldDir); }`.)

Run (in `websites/www.cs`): `vendor/bin/phpunit --testsuite tankity --filter 'DataDirTest|DbTest'`
Expected: FAIL, `server/db.php` does not exist.

- [ ] **Step 2: The module**

```php
<?php
// games/tankity/server/db.php
// Where Tankity keeps its files and its one SQLite database there: the
// directory (data/ when PHP can write it, else /var/tmp/<username>-tankity),
// the journal mode its filesystem allows, the schema steps, and transactions.
// Loaded by rooms.php and scores.php; it serves nothing.
declare(strict_types=1);
if (count(get_included_files()) === 1) {
    http_response_code(404);
    exit;
}
require_once __DIR__ . '/../config.php';

const TANKITY_DB_FILE = 'tankity.sqlite';
const TANKITY_DIR_MODE = 0700;
const TANKITY_FILE_MODE = 0600;
const TANKITY_BUSY_MS = 2000; // a writer that waits longer answers "busy" instead of tying up a PHP worker
// Filesystems whose locks and shared memory WAL can trust. Anything else,
// including a mount table PHP cannot read, gets the DELETE journal.
const TANKITY_LOCAL_FS = ['ext2', 'ext3', 'ext4', 'xfs', 'btrfs', 'zfs', 'f2fs', 'jfs', 'reiserfs', 'bcachefs', 'tmpfs', 'overlay', 'apfs', 'hfs'];
const TANKITY_DENY = "# Tankity's database: PHP reads it, browsers may not.\nRequire all denied\n";

/* The account the site belongs to: the owner of the running script, the same
   in every PHP-FPM worker and pool; uid<N> when the name cannot be looked up. */
function tankity_username(): string
{
    $name = strtolower((string) preg_replace('/[^A-Za-z0-9_-]+/', '', get_current_user()));
    return $name !== '' ? substr($name, 0, 32) : 'uid' . getmyuid();
}

/* PHP's own effective uid: who must own a directory on a shared /var/tmp. */
function tankity_euid(): int
{
    return function_exists('posix_geteuid') ? posix_geteuid() : getmyuid();
}

/* Creates $dir (0700) unless it exists, then checks it is a real directory PHP
   can write. $private also requires that PHP owns it and nobody else may
   enter: /var/tmp is shared, so a directory another account made is refused. */
function tankity_claim_dir(string $dir, bool $private): string
{
    if (!is_dir($dir) && !is_link($dir)) {
        if (!@mkdir($dir, TANKITY_DIR_MODE, true) && !is_dir($dir)) {
            throw new RuntimeException("cannot create $dir");
        }
        @chmod($dir, TANKITY_DIR_MODE);
    }
    clearstatcache(true, $dir);
    if (is_link($dir) || !is_dir($dir) || !is_writable($dir)) {
        throw new RuntimeException("$dir is not a writable directory");
    }
    if ($private && (fileowner($dir) !== tankity_euid() || (fileperms($dir) & 0077) !== 0)) {
        throw new RuntimeException("$dir is not private to this account");
    }
    return $dir;
}

/* The deny file Apache reads in a storage directory under the web root; true
   once it is in place. */
function tankity_deny_http(string $dir): bool
{
    $f = $dir . '/.htaccess';
    if (is_file($f) && str_contains((string) @file_get_contents($f), 'Require all denied')) {
        return true;
    }
    if (@file_put_contents($f, TANKITY_DENY) === false) {
        return false;
    }
    @chmod($f, TANKITY_FILE_MODE);
    return true;
}

/* $preferred when PHP can write it (or create it there) and its deny file is
   in place; otherwise the private $fallback. $writable is the tests' seam. */
function tankity_pick_dir(string $preferred, string $fallback, ?Closure $writable = null): string
{
    $writable ??= fn(string $p): bool => is_writable($p);
    if (is_dir($preferred) && !is_link($preferred)) {
        $usable = $writable($preferred);
    } else {
        $usable = !file_exists($preferred) && $writable(dirname($preferred)) && @mkdir($preferred, TANKITY_DIR_MODE);
        if ($usable) {
            @chmod($preferred, TANKITY_DIR_MODE);
        }
    }
    if ($usable && tankity_deny_http($preferred)) {
        return $preferred;
    }
    return tankity_claim_dir($fallback, true);
}

/* Where Tankity keeps its files. A data_dir setting (TANKITY_DATA_DIR, or
   .config.yaml) is used exactly: created 0700 when missing, and an error when
   it cannot be written, never a silent move elsewhere. Unset: games/tankity/data/
   when PHP can write it, else /var/tmp/<username>-tankity/. */
function tankity_data_dir(): string
{
    $set = trim((string) tankity_setting('TANKITY_DATA_DIR', 'data_dir', ''));
    if ($set !== '') {
        return tankity_claim_dir(rtrim($set, '/'), false);
    }
    static $picked = null;
    return $picked ??= tankity_pick_dir(dirname(__DIR__) . '/data', '/var/tmp/' . tankity_username() . '-tankity');
}

/* The filesystem type holding $path: the longest mount point in the mount
   table that contains it. Null when the table cannot be read. */
function tankity_fs_type(string $path, ?string $mounts = null): ?string
{
    $mounts ??= @file_get_contents('/proc/self/mounts');
    if (!is_string($mounts) || $mounts === '') {
        return null;
    }
    $real = realpath($path) ?: $path;
    $type = null;
    $len = -1;
    foreach (explode("\n", $mounts) as $line) {
        $f = preg_split('/\s+/', trim($line));
        if (!is_array($f) || count($f) < 3) {
            continue;
        }
        // The kernel writes a space in a mount point as \040.
        $mp = str_replace(['\\040', '\\011', '\\012', '\\134'], [' ', "\t", "\n", '\\'], $f[1]);
        $inside = $mp === '/' || $real === $mp || str_starts_with($real, rtrim($mp, '/') . '/');
        if ($inside && strlen($mp) > $len) {
            $len = strlen($mp);
            $type = $f[2];
        }
    }
    return $type;
}

/* WAL only on a local filesystem; DELETE on anything else or unknown. */
function tankity_journal_mode(string $dir, ?string $mounts = null): string
{
    $set = strtolower(trim((string) tankity_setting('TANKITY_JOURNAL', 'journal_mode', '')));
    if ($set === 'wal' || $set === 'delete') {
        return $set;
    }
    return in_array(tankity_fs_type($dir, $mounts), TANKITY_LOCAL_FS, true) ? 'wal' : 'delete';
}

/* The schema, one step per version. A database at version N runs the steps
   after N, each in its own transaction. */
function tankity_schema_steps(): array
{
    return [
        1 => [
            'CREATE TABLE meta (k TEXT PRIMARY KEY, v TEXT NOT NULL)',
            'CREATE TABLE rooms (code TEXT PRIMARY KEY, data BLOB NOT NULL, created INTEGER NOT NULL, touched INTEGER NOT NULL)',
            'CREATE INDEX rooms_touched ON rooms (touched)',
            'CREATE TABLE callsigns (slug TEXT PRIMARY KEY, data TEXT NOT NULL)',
        ],
    ];
}

function tankity_schema(PDO $db): void
{
    $have = (int) $db->query('PRAGMA user_version')->fetchColumn();
    foreach (tankity_schema_steps() as $version => $sql) {
        if ($version <= $have) {
            continue;
        }
        tankity_tx($db, function (PDO $db) use ($version, $sql): void {
            // Another request may have run this step while this one waited for the lock.
            if ((int) $db->query('PRAGMA user_version')->fetchColumn() >= $version) {
                return;
            }
            foreach ($sql as $q) {
                $db->exec($q);
            }
            $db->exec('PRAGMA user_version = ' . $version);
        });
    }
}

/* The database in the storage directory, opened once per request. */
function tankity_db(): PDO
{
    static $open = [];
    $dir = tankity_data_dir();
    if (isset($open[$dir])) {
        return $open[$dir];
    }
    $path = $dir . '/' . TANKITY_DB_FILE;
    $fresh = !file_exists($path);
    $db = new PDO('sqlite:' . $path, null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    if ($fresh) {
        // SQLite gives its journal and WAL files the database file's mode.
        @chmod($path, TANKITY_FILE_MODE);
    }
    $db->exec('PRAGMA busy_timeout = ' . TANKITY_BUSY_MS);
    $mode = tankity_journal_mode($dir);
    $db->query('PRAGMA journal_mode = ' . $mode)->fetchColumn();
    $db->exec('PRAGMA synchronous = ' . ($mode === 'wal' ? 'NORMAL' : 'FULL'));
    tankity_schema($db);
    return $open[$dir] = $db;
}

/* Open write transactions per connection. A tankity_tx inside one (a score
   filed while a room is held) joins it, and the outer commit covers both. */
function tankity_depth(PDO $db, int $delta = 0): int
{
    static $depth = [];
    $id = spl_object_id($db);
    $depth[$id] = max(0, ($depth[$id] ?? 0) + $delta);
    return $depth[$id];
}

/* Runs $fn as one writer (BEGIN IMMEDIATE, waiting at most the busy timeout);
   rolls back and rethrows when $fn throws. */
function tankity_tx(PDO $db, callable $fn): mixed
{
    if (tankity_depth($db) > 0) {
        return $fn($db);
    }
    $db->exec('BEGIN IMMEDIATE');
    tankity_depth($db, 1);
    try {
        $out = $fn($db);
        $db->exec('COMMIT');
        return $out;
    } catch (Throwable $e) {
        try {
            $db->exec('ROLLBACK');
        } catch (PDOException) {
            // SQLite already rolled the transaction back.
        }
        throw $e;
    } finally {
        tankity_depth($db, -1);
    }
}

/* SQLITE_BUSY or SQLITE_LOCKED: the wait for the writer ahead ran out. */
function tankity_busy(Throwable $e): bool
{
    return $e instanceof PDOException && in_array((int) ($e->errorInfo[1] ?? 0), [5, 6], true);
}
```

- [ ] **Step 3: Run**

Run (in `websites/www.cs`): `vendor/bin/phpunit --testsuite tankity --filter 'DataDirTest|DbTest'` then `vendor/bin/phpunit --testsuite tankity`
Expected: PASS, 9 `DataDirTest` and 7 `DbTest` cases (two skipped when run as root); `ConfigTest` reads `data_dir`; the rest of the suite unchanged.

- [ ] **Step 4: Commit**

```bash
git add games/tankity/server/db.php games/tankity/test/php/rooms-lib.php games/tankity/test/php/DataDirTest.php games/tankity/test/php/DbTest.php games/tankity/test/php/checks/config.php
git commit -F- <<'MSG'
Tankity: one private storage directory and its SQLite database

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb
MSG
```

### Task S3: Rooms as rows

**Files:**
- Rewrite: `games/tankity/server/store.php`
- Modify: `games/tankity/rooms.php` (header comment, file map, requires, `room_shm_key` deleted, `ping`, the `room_load` callers)
- Modify: `games/tankity/src/protocol.ts` (`PingReply`)
- Modify: `games/tankity/test/php/rooms-lib.php` (`room_test_age`)
- Modify: `games/tankity/test/php/checks/rooms-sim.php` (load through `rooms-lib.php`)
- Create: `games/tankity/test/php/RoomStoreTest.php`

**Interfaces:**
- Consumes: Task S2's `tankity_db`, `tankity_tx`, `tankity_depth`, `tankity_busy`; `room_live_secs`, `room_max_age`, `room_new_code`, `room_json_out`.
- Produces (`server/store.php`): `ROOM_MAX_BYTES = 131072`; `final class RoomLock { PDO $db; string $code; bool $open; bool $saved }`; `room_begin(): PDO` (503 `'this room is busy; try again'` past the busy timeout, 500 `'store unavailable'`); `room_hold(RoomLock $lock): RoomLock`; `room_release_all(): void` (commits a held room that was saved, rolls back one that was not); `room_unlock($lock): void`; `room_decode(mixed $raw): ?array`; `room_count(?int $now = null): int`; `room_idle(array $r, ?int $now = null): bool`; `room_alloc(?callable $nextCode = null): RoomLock`; `room_register(string $code, int $max): ?bool`; `room_load(string $code): array` (`[?array $room, ?RoomLock $lock, string $code]`; with no room nothing stays locked); `room_save($lock, string $code, array $room): bool`; `room_close($lock): void`; `room_discard($lock): void`; `room_sweep(?int $now = null, int $limit = 100): int`; `room_rand_token`, `room_new_code` unchanged. Removed: `ROOM_SEG_*`, `ROOM_REGISTRY_*`, `ROOM_LOCK_WAIT`, `ROOM_REGISTRY_BUSY`, `room_use_shm`, `room_key`, `room_registry_key`, `room_registry_read`, `room_registry_update`, `room_sem_take`, `room_lock`, `room_seg_read`, `room_seg_head`, `room_seg_write`, `room_peek`, `room_shm_key`. Ping replies `{ ok, game, rooms: { used, max } }`.
- Produces (`test/php/rooms-lib.php`): `room_test_age(string $code, int $seconds): void`.

- [ ] **Step 1: Write the failing test**

Append to `test/php/rooms-lib.php`:

```php
/* Ages a stored room by $seconds, as a room nobody touches ages. */
function room_test_age(string $code, int $seconds): void
{
    tankity_tx(tankity_db(), function (PDO $db) use ($code, $seconds): void {
        $q = $db->prepare('SELECT data FROM rooms WHERE code = ?');
        $q->execute([$code]);
        $room = room_decode($q->fetchColumn());
        if ($room === null) {
            return;
        }
        $room['touched'] = (int) ($room['touched'] ?? time()) - $seconds;
        $room['created'] = (int) ($room['created'] ?? time()) - $seconds;
        $u = $db->prepare('UPDATE rooms SET data = ?, touched = touched - ?, created = created - ? WHERE code = ?');
        $u->bindValue(1, serialize($room), PDO::PARAM_LOB);
        $u->bindValue(2, $seconds, PDO::PARAM_INT);
        $u->bindValue(3, $seconds, PDO::PARAM_INT);
        $u->bindValue(4, $code);
        $u->execute();
    });
}
```

```php
<?php
// games/tankity/test/php/RoomStoreTest.php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

/* Rooms as rows: a held room is one write transaction from load to unlock,
   the cap is exact, idle rooms are gone, and nothing is left locked. */
final class RoomStoreTest extends TestCase
{
    private string $dir;

    public static function setUpBeforeClass(): void
    {
        require_once __DIR__ . '/rooms-lib.php';
    }

    protected function setUp(): void
    {
        $this->dir = tankity_test_dir();
        putenv('TANKITY_ROOM_LIVE_SECS=60');
        putenv('TANKITY_ROOM_MAX_AGE=3600');
    }

    protected function tearDown(): void
    {
        room_release_all();
        putenv('TANKITY_ROOM_LIVE_SECS');
        putenv('TANKITY_ROOM_MAX_AGE');
        tankity_test_rm($this->dir);
    }

    private function make(string $initials = 'TST'): string
    {
        $lock = room_alloc();
        $this->assertTrue(room_save($lock, $lock->code, room_new($lock->code, $initials)));
        $this->assertTrue(room_register($lock->code, 10));
        room_unlock($lock);
        return $lock->code;
    }

    private function rows(): int
    {
        return (int) tankity_db()->query('SELECT COUNT(*) FROM rooms')->fetchColumn();
    }

    public function testARoomSavedIsTheRoomLoaded(): void
    {
        $code = $this->make();
        [$room, $lock] = room_load($code);
        $this->assertSame($code, $room['code']);
        $this->assertInstanceOf(RoomLock::class, $lock);
        room_unlock($lock);
        $this->assertSame(1, room_count());
    }

    public function testAMissingCodeLoadsNothingAndHoldsNothing(): void
    {
        $this->assertSame([null, null, 'ZZZZ'], room_load('ZZZZ'));
        $this->assertSame(0, tankity_depth(tankity_db()));
        tankity_tx(tankity_db(), fn() => null);
        $this->assertSame(0, $this->rows());
    }

    public function testACollidingCodeDrawsAnother(): void
    {
        $taken = $this->make();
        $feed = [$taken, $taken, 'WXYZ'];
        $tries = 0;
        $lock = room_alloc(function () use (&$feed, &$tries): string {
            $tries++;
            return array_shift($feed);
        });
        $this->assertSame(['WXYZ', 3], [$lock->code, $tries]);
        room_discard($lock);
        $this->assertSame(1, $this->rows());
    }

    public function testTheCapIsCheckedUnderTheSameLock(): void
    {
        for ($i = 0; $i < 3; $i++) {
            $this->make();
        }
        $lock = room_alloc();
        room_save($lock, $lock->code, room_new($lock->code, 'CAP'));
        $this->assertFalse(room_register($lock->code, 3));
        $this->assertTrue(room_register($lock->code, 4));
        room_discard($lock);
        $this->assertSame(3, room_count());
    }

    public function testAHeldRoomKeepsOtherWritersOut(): void
    {
        $code = $this->make();
        [, $lock] = room_load($code);
        $other = new PDO('sqlite:' . $this->dir . '/' . TANKITY_DB_FILE, null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
        $other->exec('PRAGMA busy_timeout = 50');
        try {
            $other->exec('BEGIN IMMEDIATE');
            $this->fail('a second writer got in while the room was held');
        } catch (PDOException $e) {
            $this->assertTrue(tankity_busy($e));
        }
        room_unlock($lock);
        $other->exec('BEGIN IMMEDIATE');
        $other->exec('ROLLBACK');
    }

    public function testAnIdleRoomIsUncountedAndGoneOnLoad(): void
    {
        $code = $this->make();
        room_test_age($code, 120);
        $this->assertSame(0, room_count());
        $this->assertSame([null, null, $code], room_load($code));
        $this->assertSame(0, $this->rows());
    }

    public function testTheSweepDropsIdleRoomsOnlyAndIsBounded(): void
    {
        $keep = $this->make();
        $a = $this->make();
        $b = $this->make();
        room_test_age($a, 120);
        room_test_age($b, 4000);
        $this->assertSame(1, room_sweep(null, 1));
        $this->assertSame(1, room_sweep());
        $this->assertSame(0, room_sweep());
        $this->assertSame([$keep], tankity_db()->query('SELECT code FROM rooms')->fetchAll(PDO::FETCH_COLUMN));
    }

    public function testClosingDeletesTheRow(): void
    {
        $code = $this->make();
        [, $lock] = room_load($code);
        room_close($lock);
        $this->assertSame(0, $this->rows());
        $this->assertSame([null, null, $code], room_load($code));
    }

    public function testAnOversizedRoomIsRefused(): void
    {
        $lock = room_alloc();
        $this->assertFalse(room_save($lock, $lock->code, room_new($lock->code, 'BIG') + ['pad' => str_repeat('x', ROOM_MAX_BYTES)]));
        room_discard($lock);
    }

    public function testARequestThatEndsHoldingARoomKeepsOnlyWhatItSaved(): void
    {
        $unsaved = room_alloc();
        room_release_all();
        $this->assertSame(0, $this->rows());
        $saved = room_alloc();
        room_save($saved, $saved->code, room_new($saved->code, 'SAV'));
        room_release_all();
        $this->assertSame(1, $this->rows());
        $this->assertFalse($unsaved->open);
    }
}
```

In `test/php/checks/rooms-sim.php` replace

```php
const TANKITY_ROOMS_LIB = true;
require TANKITY_GAME_DIR . '/rooms.php';
```

with

```php
// The room library, storing in this test process's own directory.
require_once __DIR__ . '/../rooms-lib.php';
```

Run (in `websites/www.cs`): `vendor/bin/phpunit --testsuite tankity --filter RoomStoreTest`
Expected: FAIL, `Call to undefined function room_count()` arguments or `Class "RoomLock" not found`.

- [ ] **Step 2: The store**

Replace `server/store.php` with:

```php
<?php
// Operation Tankity rooms. Room storage: one row per room in Tankity's
// database (server/db.php), a room held as one write transaction from load to
// unlock, and the room lifecycle (allocate, register, load, save, close,
// discard, sweep). Loaded by rooms.php; it runs nothing on its own.
declare(strict_types=1);

// Not an endpoint: rooms.php defines this constant, then requires the file.
// A direct request gets a 404 and nothing runs.
if (!defined('TANKITY_ROOMS_INCLUDED')) {
    http_response_code(404);
    exit;
}

/* A room serializes to about 30-45 KB; one far past that is a bug, refused
   rather than stored. */
const ROOM_MAX_BYTES = 131072;

/* A held room: its write transaction is open until room_unlock (commit),
   room_close (delete, commit) or room_discard (roll back). */
final class RoomLock
{
    public bool $open = true;
    public bool $saved = false;

    public function __construct(public readonly PDO $db, public readonly string $code)
    {
    }
}

// Through $GLOBALS so it is a real global even when a test script loads this in a closure.
$GLOBALS['ROOM_HELD'] ??= [];

/* A request that ends while it holds a room (an early reply, a fatal) keeps
   what room_save wrote and nothing else. */
function room_release_all(): void
{
    foreach ($GLOBALS['ROOM_HELD'] as $lock) {
        $lock->saved ? room_unlock($lock) : room_discard($lock);
    }
}
function room_hold(RoomLock $lock): RoomLock
{
    static $guard = false;
    if (!$guard) {
        $guard = true;
        register_shutdown_function('room_release_all');
    }
    $GLOBALS['ROOM_HELD'][$lock->code] = $lock;
    return $lock;
}

/* Opens the write transaction a room is held under. Every room shares the
   one writer: a request that waits past the busy timeout answers 503 rather
   than tying up a PHP worker. */
function room_begin(): PDO
{
    try {
        $db = tankity_db();
        $db->exec('BEGIN IMMEDIATE');
        tankity_depth($db, 1);
        return $db;
    } catch (Throwable $e) {
        if (tankity_busy($e)) {
            room_json_out(503, ['error' => 'this room is busy; try again']);
        }
        error_log('tankity rooms: ' . $e->getMessage());
        room_json_out(500, ['error' => 'store unavailable']);
    }
}
function room_unlock($lock): void
{
    if (!$lock instanceof RoomLock || !$lock->open) {
        return;
    }
    $lock->open = false;
    unset($GLOBALS['ROOM_HELD'][$lock->code]);
    tankity_depth($lock->db, -1);
    $lock->db->exec('COMMIT');
}
/* Drops a room whose creation failed after allocation, or anything a request
   held but never saved. */
function room_discard($lock): void
{
    if (!$lock instanceof RoomLock || !$lock->open) {
        return;
    }
    $lock->open = false;
    unset($GLOBALS['ROOM_HELD'][$lock->code]);
    tankity_depth($lock->db, -1);
    $lock->db->exec('ROLLBACK');
}

/* The room in a row, or null when nothing readable is there. */
function room_decode(mixed $raw): ?array
{
    $v = is_string($raw) && $raw !== '' ? @unserialize($raw, ['allowed_classes' => false]) : false;
    return is_array($v) ? $v : null;
}

/* The idle rules: nobody has touched it inside the live window, or it is
   older than the day limit. */
function room_idle(array $r, ?int $now = null): bool
{
    $now = $now ?? time();
    $t = $r['touched'] ?? $r['created'] ?? 0;
    return $now - $t > room_live_secs() || $now - ($r['created'] ?? $t) > room_max_age();
}

/* Live rooms: touched inside the live window and younger than the day limit.
   A read, so the lobby's occupancy never waits for a writer. */
function room_count(?int $now = null): int
{
    $now ??= time();
    $q = tankity_db()->prepare('SELECT COUNT(*) FROM rooms WHERE touched >= ? AND created >= ?');
    $q->execute([$now - room_live_secs(), $now - room_max_age()]);
    return (int) $q->fetchColumn();
}

/* Holds a new room: a free code taken under the write lock, its row inserted
   empty. The caller saves it, registers it, then unlocks (or discards). */
function room_alloc(?callable $nextCode = null): RoomLock
{
    $nextCode = $nextCode ?? fn() => room_new_code(fn($c) => false);
    $db = room_begin();
    $ins = $db->prepare('INSERT OR IGNORE INTO rooms (code, data, created, touched) VALUES (?, ?, ?, ?)');
    for ($try = 0; $try < 50; $try++) {
        $code = $nextCode();
        $now = time();
        $ins->execute([$code, '', $now, $now]);
        if ($ins->rowCount() === 1) {
            return room_hold(new RoomLock($db, $code));
        }
    }
    tankity_depth($db, -1);
    $db->exec('ROLLBACK');
    room_json_out(500, ['error' => 'no free room code; try again']);
}

/* Registers a freshly saved room unless that would pass the cap. The write
   lock has been held since room_alloc, so the count is exact. True when
   registered, false at the cap, null when $code is not held here. */
function room_register(string $code, int $max): ?bool
{
    $lock = $GLOBALS['ROOM_HELD'][$code] ?? null;
    if (!$lock instanceof RoomLock || !$lock->open) {
        return null;
    }
    $now = time();
    $q = $lock->db->prepare('SELECT COUNT(*) FROM rooms WHERE code <> ? AND touched >= ? AND created >= ?');
    $q->execute([$code, $now - room_live_secs(), $now - room_max_age()]);
    return (int) $q->fetchColumn() < $max;
}

/* Holds a room for this request: [room, lock, code]. With no room (never
   made, closed, or idle and cleared out now) it answers [null, null, code]
   and holds nothing. */
function room_load(string $code): array
{
    $db = room_begin();
    $q = $db->prepare('SELECT data FROM rooms WHERE code = ?');
    $q->execute([$code]);
    $room = room_decode($q->fetchColumn());
    if ($room !== null && ($room['code'] ?? null) === $code) {
        if (!room_idle($room)) {
            return [$room, room_hold(new RoomLock($db, $code)), $code];
        }
        // Whoever loads a room clears it out when it is idle.
        $db->prepare('DELETE FROM rooms WHERE code = ?')->execute([$code]);
    }
    tankity_depth($db, -1);
    $db->exec('COMMIT');
    return [null, null, $code];
}
function room_save($lock, string $code, array $room): bool
{
    if (!$lock instanceof RoomLock || !$lock->open) {
        return false;
    }
    $room['touched'] = time();
    $raw = serialize($room);
    if (strlen($raw) > ROOM_MAX_BYTES) {
        return false;
    }
    $q = $lock->db->prepare('UPDATE rooms SET data = ?, touched = ? WHERE code = ?');
    $q->bindValue(1, $raw, PDO::PARAM_LOB);
    $q->bindValue(2, $room['touched'], PDO::PARAM_INT);
    $q->bindValue(3, $code);
    $q->execute();
    $lock->saved = true;
    return $q->rowCount() === 1;
}
/* Closes a room the caller holds: its row goes, then the lock. A request
   waiting for it finds no room: the 404. */
function room_close($lock): void
{
    if (!$lock instanceof RoomLock || !$lock->open) {
        return;
    }
    $lock->db->prepare('DELETE FROM rooms WHERE code = ?')->execute([$lock->code]);
    $lock->saved = true;
    room_unlock($lock);
}
/* Deletes idle rooms, at most $limit. Housekeeping and create run it; a
   database too busy to answer skips it. */
function room_sweep(?int $now = null, int $limit = 100): int
{
    $now ??= time();
    try {
        return tankity_tx(tankity_db(), function (PDO $db) use ($now, $limit): int {
            $q = $db->prepare('DELETE FROM rooms WHERE code IN (SELECT code FROM rooms WHERE touched < ? OR created < ? LIMIT ?)');
            $q->execute([$now - room_live_secs(), $now - room_max_age(), $limit]);
            return $q->rowCount();
        });
    } catch (Throwable $e) {
        if (!tankity_busy($e)) {
            throw $e;
        }
        return 0;
    }
}
function room_rand_token(int $bytes = 32): string
{
    return bin2hex(random_bytes($bytes));
}
function room_new_code(callable $exists): string
{
    $alpha = ROOM_CODE_ALPHABET;
    $n = strlen($alpha);
    do {
        $code = '';
        for ($i = 0; $i < ROOM_CODE_LEN; $i++) {
            $code .= $alpha[random_int(0, $n - 1)];
        }
    } while ($exists($code));
    return $code;
}
```

(`room_begin` and `room_alloc` end in `room_json_out`, which exits.)

- [ ] **Step 3: rooms.php on the store**

In `rooms.php`:

1. Replace the header's storage paragraph (from `// Storage: rooms live in SysV shared memory, never on disk.` through `// written only when a room is created or closed.`) with:

```php
// Storage: rooms are rows in Tankity's SQLite database (server/db.php), one
// serialized room per row. A request holds its room inside one write
// transaction (BEGIN IMMEDIATE) from load to unlock, so writers take turns;
// one that waits past the busy timeout answers 503. Rooms are play sessions:
// idle ones are deleted by whoever loads them and by housekeeping.
```

2. In the file map replace `//   server/store.php     shared memory, the registry, locks, room lifecycle` with:

```php
//   server/db.php        the storage directory, the database, transactions
//   server/store.php     rooms as rows: the room lock, room lifecycle, the sweep
```

and add `require_once __DIR__ . '/server/db.php';` before `require_once __DIR__ . '/server/settings.php';`.

3. Replace the comment `// These two resolve against this file's own location, so they stay here:` / `// room_shm_key() derives the shared-memory key from rooms.php's path, and` / `// room_arsenal() reads game.json next to it.` with `// room_arsenal() resolves against this file's own location (game.json next to it), so it stays here.`, and delete `room_shm_key()` entirely.

4. Replace the `ping` handler with:

```php
if ($action === 'ping') {
    // Health plus occupancy for the lobby shelf. No secrets in here. A read:
    // idle rooms are not counted, and housekeeping deletes them.
    try {
        $rooms = ['used' => room_count(), 'max' => room_max_rooms()];
    } catch (Throwable $e) {
        error_log('tankity rooms: ' . $e->getMessage());
        room_json_out(500, ['error' => 'store unavailable']);
    }
    room_json_out(200, ['ok' => true, 'game' => 'operation-tankity', 'rooms' => $rooms]);
}
```

5. In the `join` handler, `room_gate()` and the `state` handler, `room_load()` always answers an array now: delete the three lines

```php
    if ($loaded === null) {
        room_json_out(500, ['error' => 'store unavailable']);
    }
```

after each `$loaded = room_load($code);` (three places). The `create` handler is unchanged: `room_alloc`, `room_save`, `room_register`, `room_discard` and `room_unlock` keep its exact-cap flow, and `room_register()` never answers null there.

`src/protocol.ts`: `export interface PingReply { ok: true; game: string; rooms: { used: number; max: number } }`.

- [ ] **Step 4: Run**

Run (in `websites/www.cs`): `vendor/bin/phpunit --testsuite tankity && (cd games/tankity && node ../_kit/build/build.mjs tankity && node --test 'test/*.test.mjs')`
Expected: PASS, 10 `RoomStoreTest` cases; `RoomsSimTest` unchanged. (The docker suite still talks to shared memory until Task S4; it is not run here.)

- [ ] **Step 5: Commit**

```bash
git add games/tankity/server/store.php games/tankity/rooms.php games/tankity/src/protocol.ts games/tankity/test/php games/tankity/dist
git commit -F- <<'MSG'
Tankity rooms: rows in SQLite, held as one write transaction; shared memory gone

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb
MSG
```

### Task S4: The rooms' HTTP suites and fixtures, off shared memory

**Files:**
- Rewrite: `games/tankity/test/php-docker/RoomsStoreTest.php` (a real `TestCase`)
- Delete: `games/tankity/test/php-docker/checks/rooms-store.php`
- Modify: `games/tankity/test/php-docker/checks/rooms.php`
- Modify: `games/tankity/rooms-web-test.php`
- Modify: `games/tankity/protocol/generate.php`

**Interfaces:**
- Consumes: Task S3's store and `room_test_age`.
- Produces: `RoomsStoreTest` (tankity-docker suite) over its own `php -S` on a kernel-chosen 127.0.0.1 port with a private data directory: distinct codes to the cap, an exact cap under a race, close, sweep on create, a held writer making others wait then answer 503, a killed holder releasing the lock, and ping answering while a room is held.

- [ ] **Step 1: The store suite over HTTP**

Replace `test/php-docker/RoomsStoreTest.php` with:

```php
<?php
// games/tankity/test/php-docker/RoomsStoreTest.php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

/* The room store under real concurrency: its own php -S (four workers) on a
   free 127.0.0.1 port, a four-room cap, a private data directory, and
   holders in other processes. */
final class RoomsStoreTest extends TestCase
{
    private const CAP = 4;
    private static string $tmp;
    private static string $base;
    /** @var resource */
    private static $server;

    public static function setUpBeforeClass(): void
    {
        self::$tmp = sys_get_temp_dir() . '/tankity-store-http-' . getmypid() . '-' . bin2hex(random_bytes(3));
        mkdir(self::$tmp, 0700);
        file_put_contents(self::$tmp . '/test.yaml', 'max_rooms: ' . self::CAP . "\nroom_max_age: 3600\nroom_live_secs: 60\n");
        putenv('CONFIG_FILE=' . self::$tmp . '/test.yaml');
        putenv('TANKITY_DATA_DIR=' . self::$tmp . '/data');
        require_once dirname(__DIR__) . '/php/rooms-lib.php';
        tankity_config(true);
        $probe = stream_socket_server('tcp://127.0.0.1:0');
        $port = (int) substr((string) strrchr((string) stream_socket_get_name($probe, false), ':'), 1);
        fclose($probe);
        self::$base = 'http://127.0.0.1:' . $port;
        self::$server = proc_open([PHP_BINARY, '-S', '127.0.0.1:' . $port, '-t', dirname(__DIR__, 2)],
            [0 => ['file', '/dev/null', 'r'], 1 => ['file', '/dev/null', 'w'], 2 => ['file', '/dev/null', 'w']], $pipes, null,
            array_merge(getenv(), ['CONFIG_FILE' => self::$tmp . '/test.yaml', 'TANKITY_DATA_DIR' => self::$tmp . '/data', 'PHP_CLI_SERVER_WORKERS' => '4']));
        for ($i = 0; $i < 50 && self::get('ping') === null; $i++) {
            usleep(100000);
        }
    }

    public static function tearDownAfterClass(): void
    {
        proc_terminate(self::$server);
        proc_close(self::$server);
        tankity_test_rm(self::$tmp);
        putenv('CONFIG_FILE');
        tankity_config(true);
    }

    protected function setUp(): void
    {
        putenv('TANKITY_DATA_DIR=' . self::$tmp . '/data');
        tankity_db()->exec('DELETE FROM rooms');
    }

    private static function get(string $action, string $query = ''): ?array
    {
        $ctx = stream_context_create(['http' => ['timeout' => 10, 'ignore_errors' => true]]);
        $raw = @file_get_contents(self::$base . '/rooms.php?action=' . $action . $query, false, $ctx);
        return $raw === false ? null : json_decode($raw, true);
    }

    /** @return array{int, ?array} */
    private static function post(string $action, array $body): array
    {
        $ctx = stream_context_create(['http' => ['method' => 'POST', 'timeout' => 10, 'ignore_errors' => true,
            'header' => "Content-Type: application/json\r\n", 'content' => json_encode($body)]]);
        $raw = @file_get_contents(self::$base . '/rooms.php?action=' . $action, false, $ctx);
        preg_match('#^HTTP/\S+ (\d+)#', $http_response_header[0] ?? '', $m);
        return [(int) ($m[1] ?? 0), $raw === false ? null : json_decode($raw, true)];
    }

    private function rows(): int
    {
        return (int) tankity_db()->query('SELECT COUNT(*) FROM rooms')->fetchColumn();
    }

    /** A process that takes the write lock, says LOCKED, and holds it $secs seconds. */
    private function holder(float $secs)
    {
        $code = 'define("TANKITY_ROOMS_LIB", true); require $argv[1] . "/rooms.php"; $db = tankity_db();'
            . ' $db->exec("BEGIN IMMEDIATE"); echo "LOCKED\n"; fflush(STDOUT); usleep((int) ($argv[2] * 1e6)); $db->exec("ROLLBACK");';
        $p = proc_open([PHP_BINARY, '-r', $code, dirname(__DIR__, 2), (string) $secs], [1 => ['pipe', 'w'], 2 => ['file', '/dev/null', 'w']], $pipes,
            null, array_merge(getenv(), ['TANKITY_DATA_DIR' => self::$tmp . '/data']));
        $this->assertSame('LOCKED', trim((string) fgets($pipes[1])));
        return [$p, $pipes];
    }

    public function testCreatesTakeDistinctCodesUpToTheCap(): void
    {
        $codes = [];
        for ($i = 0; $i < self::CAP; $i++) {
            [$st, $r] = self::post('create', ['initials' => 'ab' . chr(97 + $i)]);
            $this->assertSame(200, $st, json_encode($r));
            $codes[] = $r['code'];
        }
        $this->assertCount(self::CAP, array_unique($codes));
        $this->assertSame(self::CAP, self::get('ping')['rooms']['used']);
        [$st, $r] = self::post('create', ['initials' => 'zzz']);
        $this->assertSame(409, $st);
        $this->assertStringContainsString('taken', $r['error']);
        $this->assertSame(self::CAP, $this->rows(), 'a refused create leaves no row');
    }

    public function testTwoCreatesRaceForTheLastPlace(): void
    {
        for ($i = 0; $i < self::CAP - 1; $i++) {
            $this->assertSame(200, self::post('create', ['initials' => 'ra' . chr(97 + $i)])[0]);
        }
        $multi = curl_multi_init();
        $handles = [];
        foreach (['raz', 'ray'] as $who) {
            $h = curl_init(self::$base . '/rooms.php?action=create');
            curl_setopt_array($h, [CURLOPT_POST => true, CURLOPT_POSTFIELDS => json_encode(['initials' => $who]),
                CURLOPT_HTTPHEADER => ['Content-Type: application/json'], CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 10]);
            curl_multi_add_handle($multi, $h);
            $handles[] = $h;
        }
        do {
            curl_multi_exec($multi, $running);
            curl_multi_select($multi, 0.05);
        } while ($running > 0);
        $codes = array_map(fn($h): int => (int) curl_getinfo($h, CURLINFO_RESPONSE_CODE), $handles);
        sort($codes);
        $this->assertSame([200, 409], $codes);
        $this->assertSame(self::CAP, $this->rows());
    }

    public function testTheLastHumanLeavingClosesTheRoom(): void
    {
        [, $r] = self::post('create', ['initials' => 'lvx']);
        [$st] = self::post('leave', ['code' => $r['code'], 'token' => $r['token'], 'csrf' => $r['csrf']]);
        $this->assertSame(200, $st);
        $this->assertSame(0, $this->rows());
        $this->assertSame('no such room', self::get('state', '&code=' . $r['code'])['error']);
    }

    public function testACreateSweepsIdleRooms(): void
    {
        [, $old] = self::post('create', ['initials' => 'old']);
        room_test_age($old['code'], 120);
        $this->assertSame(0, self::get('ping')['rooms']['used'], 'an idle room is not counted');
        self::post('create', ['initials' => 'new']);
        $this->assertSame(1, $this->rows());
    }

    public function testAHeldWriterMakesOthersWaitThenAnswerBusy(): void
    {
        [, $r] = self::post('create', ['initials' => 'bsy']);
        [$p, $pipes] = $this->holder(3.0);
        $t = microtime(true);
        $out = self::get('state', '&code=' . $r['code'] . '&token=' . $r['token']);
        $dt = microtime(true) - $t;
        proc_close($p);
        $this->assertSame('this room is busy; try again', $out['error'] ?? json_encode($out));
        $this->assertGreaterThan(1.8, $dt);
        $this->assertLessThan(3.0, $dt);
    }

    public function testAShortHoldOnlyDelays(): void
    {
        [, $r] = self::post('create', ['initials' => 'dly']);
        [$p, $pipes] = $this->holder(0.5);
        $t = microtime(true);
        $out = self::get('state', '&code=' . $r['code'] . '&token=' . $r['token']);
        $dt = microtime(true) - $t;
        proc_close($p);
        $this->assertTrue($out['ok'] ?? false, json_encode($out));
        $this->assertGreaterThan(0.3, $dt);
    }

    public function testAKilledHolderReleasesTheLock(): void
    {
        [, $r] = self::post('create', ['initials' => 'kil']);
        [$p, $pipes] = $this->holder(30.0);
        proc_terminate($p, 9);
        proc_close($p);
        $t = microtime(true);
        $out = self::get('state', '&code=' . $r['code'] . '&token=' . $r['token']);
        $this->assertTrue($out['ok'] ?? false, json_encode($out));
        $this->assertLessThan(1.0, microtime(true) - $t);
    }

    public function testPingAnswersWhileARoomIsHeld(): void
    {
        self::post('create', ['initials' => 'png']);
        [$p, $pipes] = $this->holder(3.0);
        $t = microtime(true);
        $ping = self::get('ping');
        $dt = microtime(true) - $t;
        proc_close($p);
        $this->assertSame(1, $ping['rooms']['used']);
        $this->assertLessThan(1.0, $dt);
        $this->assertArrayNotHasKey('store', $ping['rooms']);
    }
}
```

Delete `test/php-docker/checks/rooms-store.php`.

- [ ] **Step 2: The room shelf suite**

In `test/php-docker/checks/rooms.php`:

1. Header lines 2–4 become: `// The room shelf, live. Spins its own php -S on a free 127.0.0.1 port with a` / `// private data directory, so it never touches real rooms or a port in use,` / `// and removes that directory when done.`
2. Replace everything from `$tmp = sys_get_temp_dir() . '/tankity-rooms-test-' . getmypid();` through the end of `function room_test_wipe(...) { ... }` with:

```php
$tmp = sys_get_temp_dir() . '/tankity-rooms-test-' . getmypid();
@mkdir($tmp, 0700);
file_put_contents($tmp . '/test.yaml', "max_rooms: 2\nroom_max_age: 3600\nroom_live_secs: 60\n");
$env = array_merge(getenv(), ['CONFIG_FILE' => $tmp . '/test.yaml', 'TANKITY_DATA_DIR' => $tmp . '/data']);
// The room functions, in this process, for aging records and holding the lock.
putenv('CONFIG_FILE=' . $tmp . '/test.yaml');
putenv('TANKITY_DATA_DIR=' . $tmp . '/data');
require_once dirname(__DIR__, 2) . '/php/rooms-lib.php';
tankity_config(true);
```

3. `$ageRoom` becomes `$ageRoom = function (string $c): void { room_test_age($c, 3600); };`
4. Delete `$store = (string) ($ping['rooms']['store'] ?? '?');` and `$check('store-known', $store === 'memory', 'store=' . $store);`.
5. Replace the lock block (from `// A request holding one room's lock never stalls the shelf: ping reads` through `@sem_release($held);` and its closing `}`) with:

```php
// A request holding the write lock never stalls the shelf's count: ping only
// reads (RoomsStoreTest covers the full lock behaviour).
$held = tankity_db();
$held->exec('BEGIN IMMEDIATE');
$lockT = microtime(true);
$pingHeld = $get($base . '/rooms.php?action=ping', 20);
$lockDt = microtime(true) - $lockT;
$held->exec('ROLLBACK');
```

and in the `ping-ignores-room-lock` check change `$lockDt < 2.0` to `$lockDt < 1.0`.
6. The restart comment (`// Rooms live in SysV memory, which outlives a web-server restart (only a host` / `// restart wipes it): a restarted server still sees the same shelf. Then age` / `// every room out so the sweep frees the cap for the match below.`) becomes `// Rooms live in the database, which outlives a web-server restart: a` / `// restarted server still sees the same shelf. Then age every room out so the` / `// cap is free for the match below.`
7. At the end replace `// Remove the private shelf so test runs never pile up segments.` / `room_test_wipe($shmKey);` / `@unlink($tmp . '/test.yaml');` / `@rmdir($tmp);` with `// Remove the private shelf.` / `tankity_test_rm($tmp);` / `putenv('CONFIG_FILE');` / `tankity_config(true);`.

- [ ] **Step 3: The live check and the fixture generator**

`rooms-web-test.php` (it runs inside the site's own PHP, on the server's own store):

1. Header lines 2–6 become: `// Web-runnable sibling of test/php-docker/checks/rooms.php: exercises rooms.php through the` / `// real web server (same box, same SAPI, same database) instead of spawning` / `// its own php -S, which shared hosting does not allow. Strangers may share` / `// the shelf, so every count is relative and it only ages its own rooms.`
2. The comment `// follow the config instead of hardcoding a ceiling or a memory key.` becomes `// follow the config instead of hardcoding a ceiling.`
3. Replace `$ageRoom = function (string $c): void { ... };` (the block using `room_seg_write`) with:

```php
$ageRoom = function (string $c): void {
    tankity_tx(tankity_db(), function (PDO $db) use ($c): void {
        $q = $db->prepare('SELECT data FROM rooms WHERE code = ?');
        $q->execute([$c]);
        $room = room_decode($q->fetchColumn());
        if ($room === null) {
            return;
        }
        $room['touched'] = time() - 3600;
        $u = $db->prepare('UPDATE rooms SET data = ?, touched = ? WHERE code = ?');
        $u->bindValue(1, serialize($room), PDO::PARAM_LOB);
        $u->bindValue(2, $room['touched'], PDO::PARAM_INT);
        $u->bindValue(3, $c);
        $u->execute();
    });
};
```

4. Delete the two `store-known` lines.
5. Replace the lock block (`// A request holding one room's lock never stalls the shelf: ping reads` through the `ping-ignores-room-lock` check) with:

```php
// A request holding the write lock never stalls the shelf's count: ping only reads.
$held = tankity_db();
$held->exec('BEGIN IMMEDIATE');
$lockT = microtime(true);
$pingHeld = $get($base . '/rooms.php?action=ping');
$lockDt = microtime(true) - $lockT;
$held->exec('ROLLBACK');
$check('ping-ignores-room-lock', $pingHeld !== null && ($pingHeld['rooms']['used'] ?? -1) >= 1
    && $lockDt < 1.0, sprintf('wait=%.2fs', $lockDt));
```

6. `$get($base . '/rooms.php?action=ping'); // the sweep runs on ping, not on state` becomes `$get($base . '/rooms.php?action=ping');` (an idle room is gone the moment anything loads it).
7. In the `server-$lib-not-served` loop, the list becomes `['settings', 'db', 'store', 'sim', 'ai', 'rules', 'protocol']`.

`protocol/generate.php`:

1. Header lines 5–9 (`// Snapshots are built in process ...` through `// (the docker PHP; see README.md).`) become: `// Snapshots are built in process with rooms.php's own functions` / `// (scenarios.php). The create/join replies and the act errors come from a` / `// real rooms.php served by php -S on a free 127.0.0.1 port with a private` / `// data directory (run it in the docker PHP: make protocol).`
2. Delete the SysV check (`if (!function_exists('shm_attach') || !function_exists('sem_get')) { ... exit(1); }`).
3. Replace `$shmKey = 200000 + (getmypid() % 50000);` with `$data = sys_get_temp_dir() . '/tankity-protocol-' . getmypid() . '-' . bin2hex(random_bytes(3));`, and in the `proc_open` environment replace `'TANKITY_SHM_KEY' => (string) $shmKey` with `'TANKITY_DATA_DIR' => $data`.
4. Delete `function room_test_wipe(int $base): void { ... }` and its comment; the cleanup becomes:

```php
$cleanup = function () use ($proc, $data): void {
    if (is_resource($proc)) {
        proc_terminate($proc);
    }
    // The server's private store: the database and its journal.
    foreach (glob($data . '/{,.}*', GLOB_BRACE) ?: [] as $f) {
        if (is_file($f)) {
            @unlink($f);
        }
    }
    @rmdir($data);
};
```

(The generator runs in the docker PHP, whose glibc has `GLOB_BRACE`.)

- [ ] **Step 4: Run in the container**

Run (in `websites/www.cs`): `make up && docker compose -f ../../compose.yaml exec -T www-cs-php sh -c 'cd /var/www/html && vendor/bin/phpunit --testsuite tankity-docker && cd games/tankity && php protocol/generate.php --check' && curl -sf "$(make -s url)games/tankity/rooms-web-test.php" | tail -1`
Expected: PASS (8 `RoomsStoreTest` cases and every `RoomsTest` check), `protocol: … current`, and `WEB-OK`.

- [ ] **Step 5: Commit**

```bash
git add -A games/tankity/test/php-docker games/tankity/rooms-web-test.php games/tankity/protocol/generate.php
git commit -F- <<'MSG'
Tankity rooms: the HTTP suites and fixtures run on a private data directory

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb
MSG
```

### Task S5: Scores in the database, and the one-time import of the old files

**Files:**
- Create: `games/tankity/server/legacy.php`
- Modify: `games/tankity/scores.php` (on the database)
- Modify: `games/tankity/server/rules.php` (`room_save_score`)
- Modify: `games/tankity/server/settings.php` (delete `room_scores_dir`; header)
- Modify: `games/tankity/rooms.php` (require `server/legacy.php`; file map)
- Create: `games/tankity/test/php/LegacyImportTest.php`

**Interfaces:**
- Consumes: Task S2's `tankity_db`, `tankity_tx`.
- Produces (`server/legacy.php`): (`scores_dir` / `TANKITY_SCORES_DIR` is retired: nothing stores there; it only says where the old files are) `LEGACY_SLUG = 'operation-tankity'`, `LEGACY_RUNS_KEPT = 50`, `LEGACY_IMPORT_BATCH = 200`, `LEGACY_TMP_AGE = 3600`; `legacy_dir(): string` (setting `TANKITY_SCORES_DIR` / `scores_dir`, default `/var/tmp`); `legacy_slug(string $name): string`; `legacy_read(PDO $db, string $slug): array`; `legacy_write(PDO $db, string $slug, array $data): void`; `legacy_add_run(string $slug, array $run): int` (the callsign's new best); `legacy_top(int $n): array` (rows `name, best, banked, won, ts`); `legacy_run_key(array $run): string`; `legacy_import(?string $dir = null, int $limit = LEGACY_IMPORT_BATCH, ?int $now = null): array{int, int}` (files imported, files deleted). `scores.php` keeps its wire: GET `{ scores: [{ name, best, banked, won, ts }] }`, POST `{ name, score, banked, won, seed }` → `{ ok, name, best }`, 503 `'store busy'`, 500 `'store unavailable'`.

- [ ] **Step 1: Write the failing test**

```php
<?php
// games/tankity/test/php/LegacyImportTest.php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

/* The per-callsign runs live in the database; the old files are imported
   once, losing nothing, and deleted only once their import has committed. */
final class LegacyImportTest extends TestCase
{
    private string $dir;
    private string $old;

    public static function setUpBeforeClass(): void
    {
        require_once __DIR__ . '/rooms-lib.php';
    }

    protected function setUp(): void
    {
        $this->dir = tankity_test_dir();
        $this->old = $this->dir . '/old';
        mkdir($this->old, 0700);
        putenv('TANKITY_SCORES_DIR=' . $this->old);
    }

    protected function tearDown(): void
    {
        putenv('TANKITY_SCORES_DIR');
        tankity_test_rm($this->dir);
    }

    private function file(string $slug, array $runs): string
    {
        $path = $this->old . "/$slug-operation-tankity.json";
        file_put_contents($path, json_encode(['name' => $slug, 'runs' => $runs, 'best' => max(array_column($runs, 'score'))]));
        return $path;
    }

    private function run(int $score, string $ts): array
    {
        return ['score' => $score, 'banked' => 2, 'won' => false, 'seed' => 's' . $score, 'ts' => $ts];
    }

    private function runs(string $slug): array
    {
        return legacy_read(tankity_db(), $slug)['runs'];
    }

    public function testEveryRunOfEveryFileArrivesAndTheFilesGo(): void
    {
        $runs = [];
        for ($i = 0; $i < 60; $i++) {
            $runs[] = $this->run(10 + $i, sprintf('2026-01-01T00:%02d:00+00:00', $i));
        }
        $a = $this->file('wg', $runs);
        $b = $this->file('r2-d2', [$this->run(450, '2026-03-01T00:00:00+00:00')]);
        $this->assertSame([2, 2], legacy_import());
        $this->assertCount(60, $this->runs('wg'), 'the import keeps every run, past the 50 a new file keeps');
        $this->assertSame(69, legacy_read(tankity_db(), 'wg')['best']);
        $this->assertSame([450], array_column($this->runs('r2-d2'), 'score'));
        $this->assertFileDoesNotExist($a);
        $this->assertFileDoesNotExist($b);
        $this->assertSame(['r2-d2', 'wg'], array_column(legacy_top(10), 'name'), 'best first: 450 beats 69');
    }

    public function testAnInterruptedImportResumesWithoutDuplicates(): void
    {
        $path = $this->file('wg', [$this->run(100, '2026-01-01T00:00:00+00:00'), $this->run(200, '2026-01-02T00:00:00+00:00')]);
        $copy = (string) file_get_contents($path);
        legacy_import();
        file_put_contents($path, $copy); // as if the request died between the commit and the delete
        $this->assertSame([1, 1], legacy_import());
        $this->assertSame([100, 200], array_column($this->runs('wg'), 'score'));
    }

    public function testRunsAlreadyInTheDatabaseMergeWithTheFile(): void
    {
        legacy_add_run('wg', $this->run(300, '2026-05-01T00:00:00+00:00'));
        $this->file('wg', [$this->run(100, '2026-01-01T00:00:00+00:00')]);
        legacy_import();
        $this->assertSame([100, 300], array_column($this->runs('wg'), 'score'), 'merged, oldest first');
    }

    public function testAFileThatChangedIsKeptForTheNextPass(): void
    {
        $path = $this->file('wg', [$this->run(100, '2026-01-01T00:00:00+00:00')]);
        legacy_import(null, LEGACY_IMPORT_BATCH, null, function () use ($path): void {
            $this->file('wg', [$this->run(100, '2026-01-01T00:00:00+00:00'), $this->run(150, '2026-01-03T00:00:00+00:00')]);
        });
        $this->assertFileExists($path);
        legacy_import();
        $this->assertFileDoesNotExist($path);
        $this->assertSame([100, 150], array_column($this->runs('wg'), 'score'));
    }

    public function testAnUnreadableFileIsLeftAlone(): void
    {
        file_put_contents($this->old . '/bad-operation-tankity.json', '{not json');
        $this->assertSame([0, 0], legacy_import());
        $this->assertFileExists($this->old . '/bad-operation-tankity.json');
    }

    public function testOldTempFilesGoAndFreshOnesStay(): void
    {
        $stale = $this->old . '/wg-operation-tankity.json.tmp.123';
        $fresh = $this->old . '/wg-operation-tankity.json.tmp.456';
        file_put_contents($stale, 'x');
        file_put_contents($fresh, 'x');
        touch($stale, time() - 7200);
        legacy_import();
        $this->assertFileDoesNotExist($stale);
        $this->assertFileExists($fresh);
    }

    public function testABatchIsBounded(): void
    {
        foreach (['a', 'b', 'c'] as $s) {
            $this->file($s, [$this->run(1, '2026-01-01T00:00:00+00:00')]);
        }
        $this->assertSame([2, 2], legacy_import(null, 2));
        $this->assertSame([1, 1], legacy_import(null, 2));
    }

    public function testANewRunKeepsTheLastFiftyAndAnswersTheBest(): void
    {
        for ($i = 1; $i <= 55; $i++) {
            $best = legacy_add_run('ace', $this->run($i * 10, sprintf('2026-02-01T00:%02d:00+00:00', $i)));
        }
        $this->assertSame(550, $best);
        $this->assertCount(LEGACY_RUNS_KEPT, $this->runs('ace'));
    }

    public function testARoomScoreGoesToTheSameCallsign(): void
    {
        room_save_score('WGR', 640, ['code' => 'ABCD']);
        $this->assertSame([['score' => 640, 'banked' => 0, 'won' => false, 'seed' => 'room:ABCD']],
            array_map(fn(array $r): array => array_diff_key($r, ['ts' => 1]), $this->runs('wgr')));
    }
}
```

Run (in `websites/www.cs`): `vendor/bin/phpunit --testsuite tankity --filter LegacyImportTest`
Expected: FAIL, `Call to undefined function legacy_import()`.

- [ ] **Step 2: The module**

```php
<?php
// games/tankity/server/legacy.php
// The per-callsign score runs: the callsigns table (one row per callsign, in
// the shape the old files had), what scores.php and the rooms file into it,
// and the one-time import of the old <scores_dir>/<callsign>-operation-tankity.json
// files. Loaded by rooms.php and scores.php; it serves nothing.
declare(strict_types=1);
if (count(get_included_files()) === 1) {
    http_response_code(404);
    exit;
}
require_once __DIR__ . '/db.php';

const LEGACY_SLUG = 'operation-tankity';
const LEGACY_RUNS_KEPT = 50;
const LEGACY_IMPORT_BATCH = 200; // old files per housekeeping pass
const LEGACY_TMP_AGE = 3600; // a temp file this old was left by a writer that died

/* Where the old files are: a scores_dir setting left from before data_dir
   (it is retired, and read only to find them), else /var/tmp. */
function legacy_dir(): string
{
    $d = trim((string) tankity_setting('TANKITY_SCORES_DIR', 'scores_dir', ''));
    return $d !== '' ? rtrim($d, '/') : '/var/tmp';
}

function legacy_slug(string $name): string
{
    $s = strtolower(trim($name));
    $s = (string) preg_replace('/[^a-z0-9_-]+/', '-', $s);
    $s = trim($s, '-');
    return substr($s === '' ? 'anonymous' : $s, 0, 32);
}

/* A callsign's record: name, runs (oldest first) and best. */
function legacy_read(PDO $db, string $slug): array
{
    $q = $db->prepare('SELECT data FROM callsigns WHERE slug = ?');
    $q->execute([$slug]);
    $d = json_decode((string) $q->fetchColumn(), true);
    return is_array($d) && is_array($d['runs'] ?? null) ? $d : ['name' => $slug, 'runs' => [], 'best' => 0];
}

function legacy_write(PDO $db, string $slug, array $data): void
{
    $best = 0;
    foreach ($data['runs'] as $r) {
        $best = max($best, (int) ($r['score'] ?? 0));
    }
    $row = ['name' => $slug, 'runs' => array_values($data['runs']), 'best' => $best];
    $db->prepare('INSERT OR REPLACE INTO callsigns (slug, data) VALUES (?, ?)')->execute([$slug, json_encode($row, JSON_UNESCAPED_SLASHES)]);
}

/* Appends one run to a callsign, keeping its last LEGACY_RUNS_KEPT; answers the new best. */
function legacy_add_run(string $slug, array $run): int
{
    return tankity_tx(tankity_db(), function (PDO $db) use ($slug, $run): int {
        $d = legacy_read($db, $slug);
        $d['runs'][] = $run;
        $d['runs'] = array_slice($d['runs'], -LEGACY_RUNS_KEPT);
        legacy_write($db, $slug, $d);
        return legacy_read($db, $slug)['best'];
    });
}

/* Each callsign's best and its latest run, best first. */
function legacy_top(int $n): array
{
    $rows = [];
    foreach (tankity_db()->query('SELECT slug, data FROM callsigns') as $r) {
        $d = json_decode((string) $r['data'], true);
        if (!is_array($d) || empty($d['runs'])) {
            continue;
        }
        $last = end($d['runs']);
        $rows[] = ['name' => (string) $r['slug'], 'best' => (int) ($d['best'] ?? 0), 'banked' => (int) ($last['banked'] ?? 0),
            'won' => (bool) ($last['won'] ?? false), 'ts' => (string) ($last['ts'] ?? '')];
    }
    usort($rows, fn($a, $b) => $b['best'] <=> $a['best']);
    return array_slice($rows, 0, $n);
}

/* What makes two runs the same run, so an import that runs twice adds nothing twice. */
function legacy_run_key(array $r): string
{
    return (string) json_encode([(int) ($r['score'] ?? 0), (int) ($r['banked'] ?? 0), (bool) ($r['won'] ?? false),
        (string) ($r['seed'] ?? ''), (string) ($r['ts'] ?? '')]);
}

/* Imports up to $limit old files: each file's runs merge into its callsign's
   row (every run kept, none twice), and the file is deleted only after that
   commit, and only if it is byte for byte what was read. An unreadable file
   is left for a person. Temp files a dead writer left go too. $afterCommit is
   the tests' seam between the commit and the delete. Answers [imported, deleted]. */
function legacy_import(?string $dir = null, int $limit = LEGACY_IMPORT_BATCH, ?int $now = null, ?Closure $afterCommit = null): array
{
    $dir ??= legacy_dir();
    $now ??= time();
    $imported = 0;
    $deleted = 0;
    $paths = glob($dir . '/*-' . LEGACY_SLUG . '.json') ?: [];
    sort($paths);
    foreach (array_slice($paths, 0, $limit) as $path) {
        $raw = @file_get_contents($path);
        $data = is_string($raw) ? json_decode($raw, true) : null;
        if (!is_array($data) || !is_array($data['runs'] ?? null)) {
            continue;
        }
        $slug = legacy_slug(basename($path, '-' . LEGACY_SLUG . '.json'));
        $runs = $data['runs'];
        tankity_tx(tankity_db(), function (PDO $db) use ($slug, $runs): void {
            $d = legacy_read($db, $slug);
            $have = array_flip(array_map('legacy_run_key', $d['runs']));
            foreach ($runs as $r) {
                if (is_array($r) && isset($r['score']) && !isset($have[legacy_run_key($r)])) {
                    $d['runs'][] = $r;
                    $have[legacy_run_key($r)] = true;
                }
            }
            usort($d['runs'], fn($a, $b) => strcmp((string) ($a['ts'] ?? ''), (string) ($b['ts'] ?? '')));
            legacy_write($db, $slug, $d);
        });
        $imported++;
        if ($afterCommit !== null) {
            $afterCommit();
        }
        clearstatcache(true, $path);
        if (@file_get_contents($path) === $raw && @unlink($path)) {
            $deleted++;
        }
    }
    foreach (array_slice(glob($dir . '/*-' . LEGACY_SLUG . '.json.tmp.*') ?: [], 0, $limit) as $tmp) {
        if ($now - (int) @filemtime($tmp) > LEGACY_TMP_AGE && @unlink($tmp)) {
            $deleted++;
        }
    }
    return [$imported, $deleted];
}
```

`testOldTempFilesGoAndFreshOnesStay` counts the temp file in `deleted`; the `[2, 2]` and `[1, 1]` expectations in the other tests hold because they make no temp files.

- [ ] **Step 3: scores.php and the rooms on it**

Replace `games/tankity/scores.php` with:

```php
<?php
// Operation Tankity: after-action report store.
// Runs per callsign in Tankity's database (server/legacy.php): GET answers
// each callsign's best, POST appends a validated run. Every write is one
// SQLite transaction, so a reader never sees half a record.
declare(strict_types=1);

// Same promise as rooms.php: diagnostics belong in the server log, never in
// a JSON response body.
ini_set('display_errors', '0');

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/server/db.php';
require_once __DIR__ . '/server/legacy.php';

function json_out(int $code, array $payload): void
{
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode($payload, JSON_UNESCAPED_SLASHES);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
try {
    if ($method === 'GET') {
        json_out(200, ['scores' => legacy_top(10)]);
    }
    if ($method === 'POST') {
        $body = file_get_contents('php://input');
        $in = json_decode(is_string($body) ? $body : '', true);
        if (!is_array($in)) {
            json_out(400, ['error' => 'body must be JSON']);
        }
        $name = isset($in['name']) ? (string) $in['name'] : '';
        $score = isset($in['score']) ? (int) $in['score'] : -1;
        $banked = isset($in['banked']) ? (int) $in['banked'] : -1;
        if ($name === '' || strlen($name) > 24 || $score < 0 || $score > 999999 || $banked < 0 || $banked > 999) {
            json_out(422, ['error' => 'invalid run (name 1-24 chars, score 0-999999, banked 0-999)']);
        }
        $slug = legacy_slug($name);
        $best = legacy_add_run($slug, ['score' => $score, 'banked' => $banked, 'won' => !empty($in['won']),
            'seed' => isset($in['seed']) ? substr((string) $in['seed'], 0, 64) : '', 'ts' => gmdate('c')]);
        json_out(200, ['ok' => true, 'name' => $slug, 'best' => $best]);
    }
    json_out(405, ['error' => 'method not allowed']);
} catch (Throwable $e) {
    error_log('tankity scores.php: ' . $e->getMessage());
    json_out(tankity_busy($e) ? 503 : 500, ['error' => tankity_busy($e) ? 'store busy' : 'store unavailable']);
}
```

In `server/rules.php` replace `room_save_score()` (the whole function and its comment) with:

```php
/* Files a room score with the per-callsign runs, as local play does. Inside a
   room's transaction: it commits with the room. A failure is logged, never
   allowed to break the round. */
function room_save_score(string $initials, int $score, array $room): void
{
    try {
        legacy_add_run(legacy_slug($initials), ['score' => $score, 'banked' => 0, 'won' => false,
            'seed' => 'room:' . $room['code'], 'ts' => gmdate('c')]);
    } catch (Throwable $e) {
        error_log('tankity rooms: score not filed: ' . $e->getMessage());
    }
}
```

`server/settings.php`: delete `room_scores_dir()` and its comment (`/* Room score files still live on disk ... */`), and in the header change `(room cap, room age, live window, scores directory)` to `(room cap, room age, live window)`.

`rooms.php`: after `require_once __DIR__ . '/server/db.php';` add `require_once __DIR__ . '/server/legacy.php';`, and add `//   server/legacy.php    the per-callsign score runs and the import of the old score files` to the file map.

- [ ] **Step 4: Run**

Run (in `websites/www.cs`): `vendor/bin/phpunit --testsuite tankity`
Expected: PASS, 9 `LegacyImportTest` cases; `RoomsSimTest`'s room endings now file into the test process's own database.

- [ ] **Step 5: Commit**

```bash
git add games/tankity/server games/tankity/scores.php games/tankity/rooms.php games/tankity/test/php/LegacyImportTest.php
git commit -F- <<'MSG'
Tankity scores: per-callsign runs in the database; the old files import once

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb
MSG
```

### Task S6: The server cleans up after itself

**Files:**
- Create: `games/tankity/server/housekeep.php`
- Modify: `games/tankity/rooms.php` (require; run housekeeping before routing; `create` keeps its own sweep)
- Modify: `games/tankity/scores.php` (require; run housekeeping first)
- Create: `games/tankity/test/php/HousekeepTest.php`

**Interfaces:**
- Consumes: `room_sweep` (S3), `legacy_import` (S5), `tankity_tx`, `tankity_busy`.
- Produces: `HOUSEKEEP_EVERY = 300`; `tankity_housekeep(int $now, array $jobs): ?array` (`$jobs` is `name => fn(int $now): int`, what each removed; null when it was not time or the database was busy; a job that throws reports -1 and the rest still run); `tankity_jobs(): array` (`legacy`, and `rooms` where `room_sweep` is loaded; PR 15 adds `callsigns`, PR 16 `solo`).

- [ ] **Step 1: Write the failing test**

```php
<?php
// games/tankity/test/php/HousekeepTest.php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

/* Cleanup without cron: at most once per interval, bounded, never failing the
   request, on a fake clock. */
final class HousekeepTest extends TestCase
{
    private string $dir;

    public static function setUpBeforeClass(): void
    {
        require_once __DIR__ . '/rooms-lib.php';
    }

    protected function setUp(): void
    {
        $this->dir = tankity_test_dir();
        mkdir($this->dir . '/old', 0700);
        putenv('TANKITY_SCORES_DIR=' . $this->dir . '/old');
        putenv('TANKITY_ROOM_LIVE_SECS=60');
    }

    protected function tearDown(): void
    {
        putenv('TANKITY_SCORES_DIR');
        putenv('TANKITY_ROOM_LIVE_SECS');
        tankity_test_rm($this->dir);
    }

    public function testItRunsAtMostOncePerInterval(): void
    {
        $job = ['n' => fn(int $now): int => 1];
        $this->assertSame(['n' => 1], tankity_housekeep(1_000_000, $job));
        $this->assertNull(tankity_housekeep(1_000_000 + HOUSEKEEP_EVERY - 1, $job));
        $this->assertSame(['n' => 1], tankity_housekeep(1_000_000 + HOUSEKEEP_EVERY, $job));
    }

    public function testAFailingJobDoesNotStopTheOthers(): void
    {
        $out = tankity_housekeep(2_000_000, [
            'bad' => function (int $now): int { throw new RuntimeException('boom'); },
            'good' => fn(int $now): int => 3,
        ]);
        $this->assertSame(['bad' => -1, 'good' => 3], $out);
    }

    public function testABusyDatabaseSkipsItQuietly(): void
    {
        $other = new PDO('sqlite:' . $this->dir . '/' . TANKITY_DB_FILE, null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
        tankity_db();
        $other->exec('BEGIN IMMEDIATE');
        try {
            $this->assertNull(tankity_housekeep(3_000_000, ['n' => fn(int $now): int => 1]));
        } finally {
            $other->exec('ROLLBACK');
        }
    }

    public function testIdleRoomsAndOldFilesGo(): void
    {
        $lock = room_alloc();
        room_save($lock, $lock->code, room_new($lock->code, 'OLD'));
        room_unlock($lock);
        room_test_age($lock->code, 600);
        file_put_contents($this->dir . '/old/wg-operation-tankity.json',
            json_encode(['name' => 'wg', 'runs' => [['score' => 5, 'banked' => 1, 'won' => false, 'seed' => 'a', 'ts' => '2026-01-01T00:00:00+00:00']], 'best' => 5]));
        $out = tankity_housekeep(time(), tankity_jobs());
        $this->assertSame(1, $out['rooms']);
        $this->assertSame(2, $out['legacy'], 'one file imported, the same file deleted');
        $this->assertSame(0, (int) tankity_db()->query('SELECT COUNT(*) FROM rooms')->fetchColumn());
        $this->assertFileDoesNotExist($this->dir . '/old/wg-operation-tankity.json');
    }
}
```

Run (in `websites/www.cs`): `vendor/bin/phpunit --testsuite tankity --filter HousekeepTest`
Expected: FAIL, `Call to undefined function tankity_housekeep()`.

- [ ] **Step 2: The module**

```php
<?php
// games/tankity/server/housekeep.php
// Cleanup without cron: on requests, at most once every HOUSEKEEP_EVERY
// seconds, each job bounded so no request pays much for it. Loaded by
// rooms.php and scores.php; it serves nothing.
declare(strict_types=1);
if (count(get_included_files()) === 1) {
    http_response_code(404);
    exit;
}
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/legacy.php';

const HOUSEKEEP_EVERY = 300;

/* Runs $jobs (name => fn(int $now): int, what it removed) when the last run
   is HOUSEKEEP_EVERY seconds old. A plain read decides that, so a request
   between runs never waits for the writer; one request then claims the run
   under the write lock. A busy database, or a job that fails, never fails the
   request. Answers what each job removed (-1 for one that failed), or null
   when it was not time. */
function tankity_housekeep(int $now, array $jobs): ?array
{
    try {
        $db = tankity_db();
        $last = (int) $db->query("SELECT v FROM meta WHERE k = 'housekeep_at'")->fetchColumn();
        if ($last > 0 && $now - $last < HOUSEKEEP_EVERY) {
            return null;
        }
        $claimed = tankity_tx($db, function (PDO $db) use ($now): bool {
            $last = (int) $db->query("SELECT v FROM meta WHERE k = 'housekeep_at'")->fetchColumn();
            if ($last > 0 && $now - $last < HOUSEKEEP_EVERY) {
                return false;
            }
            $db->prepare("INSERT OR REPLACE INTO meta (k, v) VALUES ('housekeep_at', ?)")->execute([(string) $now]);
            return true;
        });
    } catch (Throwable $e) {
        if (!tankity_busy($e)) {
            error_log('tankity housekeeping: ' . $e->getMessage());
        }
        return null;
    }
    if (!$claimed) {
        return null;
    }
    $out = [];
    foreach ($jobs as $name => $job) {
        try {
            $out[$name] = (int) $job($now);
        } catch (Throwable $e) {
            error_log("tankity housekeeping $name: " . $e->getMessage());
            $out[$name] = -1;
        }
    }
    return $out;
}

/* Every cleanup job this request can run: the room sweep only where the room
   library is loaded. */
function tankity_jobs(): array
{
    $jobs = ['legacy' => fn(int $now): int => array_sum(legacy_import(null, LEGACY_IMPORT_BATCH, $now))];
    if (function_exists('room_sweep')) {
        $jobs['rooms'] = fn(int $now): int => room_sweep($now);
    }
    return $jobs;
}
```

`testABusyDatabaseSkipsItQuietly` waits out the 2 s busy timeout once; it is the only slow case.

- [ ] **Step 3: Wire it**

`rooms.php`: after `require_once __DIR__ . '/server/legacy.php';` add `require_once __DIR__ . '/server/housekeep.php';`, add `//   server/housekeep.php throttled cleanup on requests` to the file map, and right after the `if (defined('TANKITY_ROOMS_LIB')) { return; }` block add:

```php
// No cron on the host: requests do the cleanup, at most every few minutes.
tankity_housekeep(time(), tankity_jobs());
```

`scores.php`: after `require_once __DIR__ . '/server/legacy.php';` add `require_once __DIR__ . '/server/housekeep.php';`, and make `tankity_housekeep(time(), tankity_jobs());` the first line inside its `try {`. (The first request after the deploy imports the old files before it answers, so the board shows them at once.)

- [ ] **Step 4: Run**

Run (in `websites/www.cs`): `vendor/bin/phpunit --testsuite tankity`
Expected: PASS, 4 `HousekeepTest` cases.

- [ ] **Step 5: Commit**

```bash
git add games/tankity/server/housekeep.php games/tankity/rooms.php games/tankity/scores.php games/tankity/test/php/HousekeepTest.php
git commit -F- <<'MSG'
Tankity: requests clean up idle rooms and the old score files, a few minutes apart

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb
MSG
```

### Task S7: Never served, never deployed

**Files:**
- Modify: `.gitignore` (site root, `websites/www.cs/.gitignore`)
- Modify: `deploy.sh`
- Modify: `docker/nginx/default.conf`
- Create: `tests/tankity-data-deny.sh`
- Modify: `Makefile` (`test` runs it)
- Modify: `tests/php/checks/deploy-set.php`

**Interfaces:**
- Produces: `tests/tankity-data-deny.sh <site-url>`: plants `games/tankity/data/zz-deny-probe.sqlite`, fetches it through the local site, removes it; exit 0 on 403 or 404, 1 otherwise.

- [ ] **Step 1: The failing checks**

`tests/tankity-data-deny.sh` (mode 755):

```sh
#!/bin/sh
# games/tankity/data/ can hold Tankity's database: the web server must refuse
# it. Plants a probe file there, fetches it through the site at $1, removes it.
set -eu
cd "$(dirname "$0")/.."
url=$1
dir=games/tankity/data
made=
if [ ! -d "$dir" ]; then
  mkdir "$dir"
  made=1
fi
echo probe > "$dir/zz-deny-probe.sqlite"
code=$(curl -s -o /dev/null -w '%{http_code}' "${url}games/tankity/data/zz-deny-probe.sqlite") || code=000
rm -f "$dir/zz-deny-probe.sqlite"
# A local PHP may have taken the directory for its store meanwhile: then it stays.
if [ -n "$made" ]; then rmdir "$dir" 2>/dev/null || true; fi
if [ "$code" != 403 ] && [ "$code" != 404 ]; then
  echo "tankity-data-deny: $dir is served over HTTP (status $code)" >&2
  exit 1
fi
echo "tankity-data-deny: refused ($code)"
```

`Makefile` `test` target, after the `rooms-web-test.php` line:

```make
	@url=$$($(MAKE) --no-print-directory -s url) && tests/tankity-data-deny.sh "$$url"
```

`tests/php/checks/deploy-set.php`: add `'games/tankity/data/zz-deploy-probe.sqlite'` to `$probes`, add `'games/tankity/data'` at the front of the cleanup list `['games/zz-probe/test', ...]` (it is removed only when empty, and only the probe ever lands there), and after the `kit-php-stays-home` check add:

```php
// Tankity's storage belongs to the server: nothing under games/tankity/data/ ships.
$check('tankity-data-stays-home', !array_filter($out, fn($f) => str_starts_with($f, 'games/tankity/data/')), '');
```

Run (in `websites/www.cs`): `make up && tests/tankity-data-deny.sh "$(make -s url)"`
Expected: FAIL, `tankity-data-deny: games/tankity/data is served over HTTP (status 200)`.

- [ ] **Step 2: Deny and exclude**

`docker/nginx/default.conf`, after the `games/tankity/server/` location:

```nginx
    # Tankity's storage (its SQLite database), when PHP keeps it inside the
    # game: the server reads it, browsers may not (on Apache the store's own
    # .htaccess says the same).
    location ^~ /games/tankity/data/ { deny all; }
```

`.gitignore`: add `games/tankity/data/`.

`deploy.sh`, in the staging `case`, before `    games/*) ;;`:

```bash
    # Tankity's storage (its database, its run store) belongs to the server:
    # never staged, so never uploaded, never chmodded, and never in the
    # manifest a PRUNE reads.
    games/tankity/data/*) continue ;;
```

- [ ] **Step 3: Run**

Run (in `websites/www.cs`): `make up && tests/tankity-data-deny.sh "$(make -s url)" && vendor/bin/phpunit --testsuite site --filter DeploySetTest`
Expected: `tankity-data-deny: refused (403)` and PASS.

- [ ] **Step 4: Commit**

```bash
git add .gitignore deploy.sh docker/nginx/default.conf tests/tankity-data-deny.sh Makefile tests/php/checks/deploy-set.php
git commit -F- <<'MSG'
Tankity storage: never served over HTTP, never staged by a deploy

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb
MSG
```

### Task S8: Docs, settings, PR 20

**Files:**
- Modify: `games/tankity/.config.yaml` (comments)
- Modify: `games/tankity/README.md` (Files table, "Architecture rules", a new "Storage" section, Tests table, Protocol fixtures)

- [ ] **Step 1: Settings**

Replace `games/tankity/.config.yaml`'s comment block (its first 13 lines) with:

```yaml
# Operation Tankity server settings.
# The game reads this file once at startup and NEVER writes to it.
# Tankity keeps its database (rooms, scores) in games/tankity/data/ when PHP
# can write there, else in /var/tmp/<username>-tankity/ (README "Storage").
# For each setting, the matching environment variable wins when set and non-empty:
#   max_rooms      <- TANKITY_MAX_ROOMS (how many rooms can exist at once)
#   room_max_age   <- TANKITY_ROOM_MAX_AGE (seconds a room record is kept)
#   room_live_secs <- TANKITY_ROOM_LIVE_SECS (seconds since the last touch
#                     before a room stops counting as occupied)
#   data_dir       <- TANKITY_DATA_DIR (the one directory for everything
#                     Tankity keeps: used exactly as given, created 0700 when
#                     missing, an error when not writable, never a fallback.
#                     Unset: games/tankity/data/, else /var/tmp/<user>-tankity/)
#   journal_mode   <- TANKITY_JOURNAL (wal or delete; otherwise chosen from
#                     the storage directory's filesystem)
#   scores_dir     <- TANKITY_SCORES_DIR (retired: only where score files
#                     from before the database are imported from; default /var/tmp)
# shm_key / TANKITY_SHM_KEY are gone with shared memory; a value is ignored.
# Point CONFIG_FILE at another file to load settings from elsewhere.
```

- [ ] **Step 2: README**

Files table: the `rooms.php` row's tail becomes `… It requires the files below, and keeps the one helper that resolves against its own location (`room_arsenal` reads `game.json`) |`; `server/settings.php` becomes `What a room is (`ROOM_*` shape constants) and the host's knobs (`room_max_rooms`, `room_max_age`, `room_live_secs`) |`; `server/store.php` becomes `Rooms as rows: the room lock (`RoomLock`, one write transaction from `room_load` to `room_unlock`), create/register/close/discard, `room_save`, `room_count`, the sweep, room codes |`; the `.config.yaml` row's env list becomes `TANKITY_MAX_ROOMS`, `TANKITY_ROOM_MAX_AGE`, `TANKITY_ROOM_LIVE_SECS`, `TANKITY_DATA_DIR`, `TANKITY_JOURNAL`, and `TANKITY_SCORES_DIR` (retired: read only as where the old score files are), with no `TANKITY_SHM_KEY`; and add after `server/store.php`:

```markdown
| `server/db.php` | Where Tankity keeps its files (`tankity_data_dir`), the database (`tankity_db`), the journal mode for its filesystem, the schema steps, `tankity_tx` |
| `server/legacy.php` | The per-callsign score runs (`legacy_add_run`, `legacy_top`) and the one-time import of the old score files (`legacy_import`) |
| `server/housekeep.php` | Cleanup on requests, at most every five minutes (`tankity_housekeep`, `tankity_jobs`) |
| `data/` | Runtime only, when PHP may write here: `tankity.sqlite` and the deny `.htaccess` PHP writes. Never in git, never deployed |
```

"Architecture rules": replace the five bullets from `- Rooms live in SysV shared memory only: no disk, no fallback.` through the crash-safety bullet (ending `never removes a semaphore it does not own.`) with:

```markdown
- Rooms are rows in Tankity's database (see Storage), one serialized room per
  row (`rooms`: code, data, created, touched). Create, join, state and every
  act hold their room as one write transaction (`BEGIN IMMEDIATE`) from
  `room_load` (or `room_alloc`) to `room_unlock`, so writers take turns across
  all rooms; a request that waits past the 2 s busy timeout answers 503 "this
  room is busy". A room serializes to 30–45 KB; one past 128 KB is refused.
- Create draws a random code and inserts its row with `INSERT OR IGNORE`
  under the write lock, so a collision just draws another code; the cap is
  counted under the same lock, so it is exact. Ping only reads: it counts
  rooms touched inside the live window and younger than a day.
- Closing a room (the last human leaves) deletes its row in its own
  transaction; a request that was waiting for it finds no room: the 404. An
  idle room is deleted by whoever loads it next, by a create, and by
  housekeeping.
- Crash safety: a request that ends while it holds a room commits what
  `room_save` wrote and rolls back anything else; one that is killed leaves
  SQLite to roll back its open transaction, and the operating system frees
  its lock.
```

New section after "Architecture rules":

```markdown
## Storage

Everything Tankity keeps is in one directory, picked in this order:

1. `data_dir` from `.config.yaml` or `TANKITY_DATA_DIR` (the environment wins):
   used exactly as given, created 0700 when missing, and an error ("store
   unavailable", logged) when PHP cannot write it; never a silent fallback.
   Tests point it at a temporary directory;
2. `games/tankity/data/` when PHP can write there; PHP then writes
   `data/.htaccess` (`Require all denied`) itself, and the local nginx denies
   `/games/tankity/data/` too;
3. `/var/tmp/<username>-tankity/`, where `<username>` is `get_current_user()`
   (the owner of the running script: the account the site is deployed as),
   or `uid<N>` when the name cannot be resolved. A directory PHP creates is
   mode 0700 and its files 0600; one that already exists there must be a
   real directory owned by PHP's own user and closed to group and others, or
   every request answers "store unavailable".

`deploy.sh` never stages anything under `games/tankity/data/` (and git
ignores it), so a deploy never uploads into it, changes its modes or prunes
it.

The directory holds `tankity.sqlite` (rooms; the per-callsign runs) and its
journal. The journal mode is WAL when the directory is on a local filesystem
(`/proc/self/mounts`) and DELETE on anything else, including when the mount
table cannot be read; `journal_mode` overrides. `PRAGMA user_version` is the
schema version (`tankity_schema_steps()`); a newer server runs the missing
steps on its first request.

Score files from before the database, `<scores_dir>/<callsign>-operation-tankity.json`
(`/var/tmp` unless a `scores_dir` from before `data_dir` says otherwise; the
setting is retired and read only for this), are imported by housekeeping:
every run of every file goes into its callsign's row, none twice, and the file
is deleted only after that commit and only if it did not change meanwhile.
An unreadable file is left alone.

Housekeeping has no cron: any request to `rooms.php` or `scores.php` runs it,
at most every five minutes, each job bounded (idle rooms, 100 at a time; old
files, 200 at a time; leftover temp files over an hour old).
```

Tests table: the `phpunit --testsuite tankity` row gains `DataDirTest`, `DbTest`, `RoomStoreTest`, `LegacyImportTest`, `HousekeepTest` with "storage: the directory and its checks, the database and its journal, rooms as rows, the old files' import, cleanup on a fake clock"; the `tankity-docker` row becomes `` `RoomsTest` (the room shelf over its own `php -S`) and `RoomsStoreTest` (the store under real concurrency: exact cap under a race, close, sweep, a held writer and the 503, a killed holder). Runs inside the PHP container, which matches the host's PHP (`make test` does) ``; the `protocol/generate.php --check` row drops "(needs SysV; …)" for "(run inside the PHP container)"; add a row `` `tests/tankity-data-deny.sh` `` | `games/tankity/data/` is refused over HTTP (`make test` runs it). In "Protocol fixtures", `a private shared-memory key` becomes `a private data directory`.

- [ ] **Step 3: Full gate, PR**

Run (in `websites/www.cs`): `make test` then `make e2e E2E_ARGS="tankity-rooms.spec.mjs"`
Expected: green.

```bash
git add games/tankity/.config.yaml games/tankity/README.md
git commit -F- <<'MSG'
Tankity storage: settings and docs

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb
MSG
git push -u origin games/tankity-storage
gh pr create --title "Tankity storage: one SQLite database, rooms off shared memory, cleanup on requests" --body "Spec row 20 (section 12). Rooms and the per-callsign scores move into games/tankity/data/ or /var/tmp/<username>-tankity/tankity.sqlite; the old score files import once; housekeeping runs on requests; data/ is never served or deployed.

Host probe (Task S1):
<probe.json>

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb"
```

- [ ] **Step 4: Merge, deploy, live check**

Run the pr-fix loop, gate on required checks (`gh pr checks --required`; if none are listed and `gh api "repos/:owner/:repo/branches/main/protection"` answers 404, wait for the CI run's own conclusion instead), merge on green. Before `make deploy`, save today's board: `curl -s https://www.cs.siue.edu/~wgrim/games/tankity/scores.php > /tmp/tankity-before.json`. Then `make deploy`, and check live:

1. `curl -s 'https://www.cs.siue.edu/~wgrim/games/tankity/rooms.php?action=ping'` answers `{"ok":true,…,"rooms":{"used":N,"max":10}}` with no `store`.
2. `curl -s https://www.cs.siue.edu/~wgrim/games/tankity/scores.php` lists the same names with the same `best` as `/tmp/tankity-before.json` (the first request imported the old files). With more than 200 old files (the probe's `legacy_files.count`), the rest arrive on the following housekeeping passes, five minutes apart.
3. `curl -s -o /dev/null -w '%{http_code}\n' https://www.cs.siue.edu/~wgrim/games/tankity/data/tankity.sqlite` prints 403 or 404.
4. Open `/play/tankity/?v=<sha>`, host a room, and leave it.

Report the cache-busted link and the probe's storage row (which directory, which journal mode).

---

# PR 14: armor rules

Branch `games/tankity-armor`, worktree `.claude/worktrees/tankity-armor`, off `main` after PR 20 merged.

### Task 1: The armor rules module

**Files:**
- Create: `games/tankity/src/armor.ts`
- Create: `games/tankity/test/armor.test.mjs`
- Modify: `games/tankity/tsconfig.json` (`files`)

**Interfaces:**
- Consumes: `TUNE.playerArmor` (100) from `src/sim.ts`.
- Produces: `PLATE_ARMOR = 25`; `interface Hull { armor: number; plates: number }`; `maxArmor(plates: number): number`; `repairRestores(armor: number, plates: number, per: number, packs: number): number`; `repairPacksWanted(armor: number, plates: number, per: number): number`; `fitPlates(h: Hull, qty: number): Hull`; `carryArmor(h: Hull, endHp: number, wrecked: boolean): Hull`; `armorLabel(armor: number, plates: number): string`; `repairNote(armor: number, plates: number, per: number, packs: number): string`; `plateNote(plates: number): string`.

- [ ] **Step 1: Write the failing test**

```js
// games/tankity/test/armor.test.mjs
// The player's armor between rounds (src/armor.ts): max armor, a capped
// repair, a plate, what the next round musters with, and the shop's notes.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  PLATE_ARMOR, maxArmor, repairRestores, repairPacksWanted, fitPlates, carryArmor, armorLabel, repairNote, plateNote,
} from '../src/armor.ts';

test('max armor is 100 plus 25 per plate', () => {
  assert.equal(PLATE_ARMOR, 25);
  assert.equal(maxArmor(0), 100);
  assert.equal(maxArmor(3), 175);
});

test('a repair restores up to max, never beyond', () => {
  assert.equal(repairRestores(160, 3, 40, 1), 15);
  assert.equal(repairRestores(100, 0, 40, 1), 0);
  assert.equal(repairRestores(20, 0, 40, 2), 80);
  assert.equal(repairRestores(20, 0, 40, 3), 80);
});

test('packs wanted: the fewest that fill the hull, none at full armor', () => {
  assert.equal(repairPacksWanted(100, 0, 40), 0);
  assert.equal(repairPacksWanted(99, 0, 40), 1);
  assert.equal(repairPacksWanted(20, 0, 40), 2);
  assert.equal(repairPacksWanted(0, 2, 40), 4);
});

test('a plate raises max and adds 25 armor now', () => {
  assert.deepEqual(fitPlates({ armor: 60, plates: 0 }, 1), { armor: 85, plates: 1 });
  assert.deepEqual(fitPlates({ armor: 100, plates: 1 }, 2), { armor: 150, plates: 3 });
});

test('a round starts with what the last one ended with; a wreck re-musters at full max, plates kept', () => {
  assert.deepEqual(carryArmor({ armor: 125, plates: 1 }, 72, false), { armor: 72, plates: 1 });
  assert.deepEqual(carryArmor({ armor: 125, plates: 1 }, 0, true), { armor: 125, plates: 1 });
});

test('labels and shop notes', () => {
  assert.equal(armorLabel(160, 3), '160 of 175');
  assert.equal(repairNote(160, 3, 40, 1), "Restores 15 (you're at 160 of 175).");
  assert.equal(repairNote(175, 3, 40, 1), 'Armor full (175 of 175).');
  assert.equal(repairNote(20, 0, 40, 2), "Restores 80 (you're at 20 of 100).");
  assert.equal(plateNote(0), 'Max armor 100; a plate adds 25 max and 25 armor now.');
  assert.equal(plateNote(2), 'Max armor 150 (2 fitted); a plate adds 25 max and 25 armor now.');
});
```

- [ ] **Step 2: Run it to see it fail**

Run (in `games/tankity`): `node --test test/armor.test.mjs`
Expected: FAIL, `Cannot find module '.../src/armor.ts'`.

- [ ] **Step 3: Write the module**

```ts
// games/tankity/src/armor.ts
/* Operation Tankity: the player's armor between rounds.
 *
 * Max armor, what a repair restores, a plate, the armor a round musters with,
 * and the shop's lines about them. Pure. server/rules.php room_max_armor ..
 * room_carry_armor are the same rules, pinned by the 'armor' sim vectors. */
import { TUNE } from './sim.ts';

export const PLATE_ARMOR = 25;

/** Armor carried into the next round and hull plates fitted. */
export interface Hull { armor: number; plates: number }

export function maxArmor(plates: number): number {
  return TUNE.playerArmor + PLATE_ARMOR * plates;
}

/** Armor `packs` repairs of `per` would restore: never past max. */
export function repairRestores(armor: number, plates: number, per: number, packs: number): number {
  return Math.max(0, Math.min(per * packs, maxArmor(plates) - armor));
}

/** The fewest packs that fill the hull; 0 at full armor. */
export function repairPacksWanted(armor: number, plates: number, per: number): number {
  const missing = maxArmor(plates) - armor;
  return missing <= 0 || per <= 0 ? 0 : Math.ceil(missing / per);
}

export function fitPlates(h: Hull, qty: number): Hull {
  return { armor: h.armor + PLATE_ARMOR * qty, plates: h.plates + qty };
}

/** What the next round musters with: this round's end, or a fresh tank at full max after a wreck. */
export function carryArmor(h: Hull, endHp: number, wrecked: boolean): Hull {
  const max = maxArmor(h.plates);
  return { armor: wrecked ? max : Math.min(endHp, max), plates: h.plates };
}

export function armorLabel(armor: number, plates: number): string {
  return `${armor} of ${maxArmor(plates)}`;
}

export function repairNote(armor: number, plates: number, per: number, packs: number): string {
  const back = repairRestores(armor, plates, per, packs);
  return back === 0
    ? `Armor full (${armorLabel(armor, plates)}).`
    : `Restores ${back} (you're at ${armorLabel(armor, plates)}).`;
}

export function plateNote(plates: number): string {
  return `Max armor ${maxArmor(plates)}${plates ? ` (${plates} fitted)` : ''}; a plate adds 25 max and 25 armor now.`;
}
```

In `games/tankity/tsconfig.json` change the `files` line:

```jsonc
  "files": ["src/sim.ts", "src/ai.ts", "src/net.ts", "src/input.ts", "src/preview.ts", "src/replay.ts", "src/flow.ts", "src/armor.ts"]
```

- [ ] **Step 4: Run the test and the type check**

Run (in `games/tankity`): `node --test test/armor.test.mjs && node ../_kit/build/build.mjs tankity`
Expected: 6 tests pass; the build type-checks clean (dist unchanged: nothing imports `armor.ts` yet).

- [ ] **Step 5: Commit**

```bash
git add games/tankity/src/armor.ts games/tankity/test/armor.test.mjs games/tankity/tsconfig.json
git commit -F- <<'MSG'
Tankity armor: the rules module

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb
MSG
```

### Task 2: Server armor rules: carry-over, re-muster, no banking

**Files:**
- Modify: `games/tankity/server/rules.php` (`room_seat_economy`, `room_shop_settle`, `room_start_round`, `room_end_round`, `room_apply_banked`)
- Modify: `games/tankity/test/php/checks/rooms-sim.php:72-80` (the banked-repair check)
- Create: `games/tankity/test/php/RoomArmorTest.php`

**Interfaces:**
- Consumes: nothing new.
- Produces (PHP, `rules.php`): `ROOM_ARMOR = 100`, `ROOM_PLATE_ARMOR = 25`; `room_max_armor(array $room, int $seat): int`; `room_muster_armor(array $room, int $seat): int`; `room_repair_packs_wanted(array $room, int $seat, int $per): int`; `room_repair(array &$room, int $seat, int $n): int` (restored amount); `room_fit_plate(array &$room, int $seat, int $qty): void`; `room_carry_armor(array &$room, int $seat, int $hp, bool $wrecked): void`; `room_apply_fuel(array &$room): void` (replaces `room_apply_banked`). Room keys: `armor[seat]`, `plate[seat]`. Removed keys: `repair`, `repairApplied`.

- [ ] **Step 1: Write the failing test**

The test library `test/php/rooms-lib.php` is PR 20's (Task S2): it loads `rooms.php` for its functions and gives the process its own storage directory.

```php
<?php
// games/tankity/test/php/RoomArmorTest.php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

/* Armor carries between rounds, repairs stop at max, plates add max and armor,
   and a wreck re-musters at full max (src/armor.ts is the same). */
final class RoomArmorTest extends TestCase
{
    public static function setUpBeforeClass(): void
    {
        require_once __DIR__ . '/rooms-lib.php';
    }

    /** Host HUM at seat 0 against one drone, round 1 started. */
    private function room(): array
    {
        $room = room_new('ARMR', 'HUM');
        $room['seats'][0] = room_seat_human('HUM', 't0', []);
        $room['seats'][1] = room_idle_seat(1, 'ai');
        $room['seats'][2] = room_idle_seat(2, 'open');
        $room['seats'][3] = room_idle_seat(3, 'open');
        room_seat_economy($room, 0);
        room_start_round($room);
        return $room;
    }

    private function human(array $room): array
    {
        foreach ($room['tanks'] as $t) {
            if ($t['kind'] === 'human') {
                return $t;
            }
        }
        $this->fail('no human tank');
    }

    private function setHp(array &$room, string $kind, int $hp): void
    {
        foreach ($room['tanks'] as &$t) {
            if ($t['kind'] === $kind) {
                $t['hp'] = $hp;
            }
        }
        unset($t);
    }

    public function testFirstRoundMustersAtOneHundred(): void
    {
        $me = $this->human($this->room());
        $this->assertSame(100, $me['hp']);
        $this->assertSame(100, $me['maxHp']);
    }

    public function testDamageCarriesIntoTheNextRound(): void
    {
        $room = $this->room();
        $this->setHp($room, 'human', 64);
        $this->setHp($room, 'ai', 0);
        $events = [];
        room_end_round($room, $events);
        room_shop_set_ready($room, 0, true);
        $this->assertTrue(room_shop_settle($room));
        $me = $this->human($room);
        $this->assertSame(64, $me['hp']);
        $this->assertSame(100, $me['maxHp']);
    }

    public function testAWreckReMustersAtFullMaxWithPlatesKept(): void
    {
        $room = $this->room();
        room_fit_plate($room, 0, 2);
        $this->setHp($room, 'human', 0);
        $events = [];
        room_end_round($room, $events);
        $this->assertSame(2, $room['seats'][0]['lives']);
        $this->assertSame(150, $room['armor'][0]);
        $this->assertSame(2, $room['plate'][0]);
        room_shop_set_ready($room, 0, true);
        room_shop_settle($room);
        $me = $this->human($room);
        $this->assertSame(150, $me['hp']);
        $this->assertSame(150, $me['maxHp']);
    }

    public function testRepairRestoresUpToMax(): void
    {
        $room = $this->room();
        room_fit_plate($room, 0, 3);
        $room['armor'][0] = 160;
        $this->assertSame(1, room_repair_packs_wanted($room, 0, 40));
        $this->assertSame(15, room_repair($room, 0, 40));
        $this->assertSame(175, $room['armor'][0]);
        $this->assertSame(0, room_repair($room, 0, 40));
        $this->assertSame(0, room_repair_packs_wanted($room, 0, 40));
    }

    public function testAPlateAddsMaxAndArmorNow(): void
    {
        $room = $this->room();
        $room['armor'][0] = 60;
        room_fit_plate($room, 0, 1);
        $this->assertSame(125, room_max_armor($room, 0));
        $this->assertSame(85, $room['armor'][0]);
    }

    public function testDronesAreUnchanged(): void
    {
        $room = $this->room();
        foreach ($room['tanks'] as $t) {
            if ($t['kind'] === 'ai') {
                $this->assertSame(60 + 6 * ($room['round'] - 1), $t['hp']);
            }
        }
    }

    public function testFuelStillBanksAndNothingElseDoes(): void
    {
        $room = $this->room();
        $room['fuelBonus'][0] = 60;
        $this->setHp($room, 'ai', 0);
        $events = [];
        room_end_round($room, $events);
        room_shop_set_ready($room, 0, true);
        room_shop_settle($room);
        $this->assertSame(140.0, (float) $this->human($room)['fuel']);
        $this->assertArrayNotHasKey('repair', $room);
        $this->assertArrayNotHasKey('repairApplied', $room);
    }
}
```

- [ ] **Step 2: Run it to see it fail**

Run (in `websites/www.cs`): `vendor/bin/phpunit --testsuite tankity --filter RoomArmorTest`
Expected: FAIL, `Call to undefined function room_fit_plate()`.

- [ ] **Step 3: Implement the rules**

In `server/rules.php`, add after `room_find_seat()`:

```php
/* ---------- armor (src/armor.ts is the same) ---------- */
const ROOM_ARMOR = 100;
const ROOM_PLATE_ARMOR = 25;
/* A human seat's max armor: 100 plus 25 per hull plate fitted. */
function room_max_armor(array $room, int $seat): int
{
    return ROOM_ARMOR + ROOM_PLATE_ARMOR * (int) ($room['plate'][$seat] ?? 0);
}
/* The armor a seat's next tank musters with: what its last round ended with. */
function room_muster_armor(array $room, int $seat): int
{
    return (int) ($room['armor'][$seat] ?? room_max_armor($room, $seat));
}
/* The fewest repair packs that fill the hull; 0 at full armor. */
function room_repair_packs_wanted(array $room, int $seat, int $per): int
{
    $missing = room_max_armor($room, $seat) - room_muster_armor($room, $seat);
    return $missing <= 0 || $per <= 0 ? 0 : (int) ceil($missing / $per);
}
/* Restores up to $n armor, never past max; returns what it restored. */
function room_repair(array &$room, int $seat, int $n): int
{
    $have = room_muster_armor($room, $seat);
    $back = max(0, min($n, room_max_armor($room, $seat) - $have));
    $room['armor'][$seat] = $have + $back;
    return $back;
}
/* A plate raises max armor and adds the same armor now. */
function room_fit_plate(array &$room, int $seat, int $qty): void
{
    $have = room_muster_armor($room, $seat);
    $room['plate'][$seat] = (int) ($room['plate'][$seat] ?? 0) + $qty;
    $room['armor'][$seat] = $have + ROOM_PLATE_ARMOR * $qty;
}
/* The next round's armor: this round's end, or, after a wreck, a fresh tank at
   full max (the plates stay fitted). */
function room_carry_armor(array &$room, int $seat, int $hp, bool $wrecked): void
{
    $max = room_max_armor($room, $seat);
    $room['armor'][$seat] = $wrecked ? $max : min($hp, $max);
}
```

`room_seat_economy()` (current lines 313–320) gains the two armor slots:

```php
function room_seat_economy(array &$room, int $seat): void
{
    $room['scores'][$seat] = 0;
    $room['cash'][$seat] = 600;
    $room['ammo'][$seat] = ['shell' => -1, 'buck' => 1, 'mortar' => 0, 'rail' => 0, 'nuke' => 0];
    $room['weapon'][$seat] = 'shell';
    $room['nextUp'][$seat] = 3000;
    $room['plate'][$seat] = 0;
    $room['armor'][$seat] = ROOM_ARMOR;
}
```

In `room_shop_settle()` replace the banking block (current lines 125–137):

```php
    // Apply stockpiled repairs and fuel before fresh hills.
    foreach ($room['seats'] as $idx => $s) {
        if (!($s['human'] ?? false)) {
            continue;
        }
        $room['repairApplied'][$idx] = $room['repair'][$idx] ?? 0;
        $room['fuelApplied'][$idx] = $room['fuelBonus'][$idx] ?? 0;
        $room['repair'][$idx] = 0;
        $room['fuelBonus'][$idx] = 0;
    }
    unset($room['shop']);
    room_start_round($room);
    room_apply_banked($room);
```

with:

```php
    // Fuel bought in the shop rides in a bank until the tanks muster.
    foreach ($room['seats'] as $idx => $s) {
        if (!($s['human'] ?? false)) {
            continue;
        }
        $room['fuelApplied'][$idx] = $room['fuelBonus'][$idx] ?? 0;
        $room['fuelBonus'][$idx] = 0;
    }
    unset($room['shop']);
    room_start_round($room);
    room_apply_fuel($room);
```

In `room_start_round()` replace current line 410:

```php
        $armor = $s['human'] ? 100 + 25 * ($room['plate'][$idx] ?? 0) : 60 + 6 * ($room['round'] - 1);
```

with:

```php
        $armor = $s['human'] ? room_muster_armor($room, $idx) : 60 + 6 * ($room['round'] - 1);
        $max = $s['human'] ? room_max_armor($room, $idx) : $armor;
```

and current line 420 `'maxHp' => $armor,` with `'maxHp' => $max,`.

In `room_end_round()`, right after the trick-timer loop (before `$alive = array_values(...)`), carry every human tank's armor:

```php
    // Armor carries into the next round; a wrecked tank re-musters at full max.
    foreach ($room['tanks'] as $t) {
        if ($t['kind'] === 'human') {
            room_carry_armor($room, (int) $t['seat'], (int) $t['hp'], $t['hp'] <= 0);
        }
    }
```

Replace `room_apply_banked()` (current lines 684–698) with:

```php
/* Fuel bought in the shop goes onto the freshly mustered human tanks. */
function room_apply_fuel(array &$room): void
{
    foreach ($room['tanks'] as &$t) {
        if ($t['kind'] !== 'human') {
            continue;
        }
        $t['fuel'] += ($room['fuelApplied'][$t['seat']] ?? 0);
    }
    unset($t);
}
```

In `test/php/checks/rooms-sim.php` replace current lines 72–80 (the "Banked repair rides above full armor" block and its two checks) with:

```php
// Banked fuel adds on when the tanks muster; drones are untouched.
$room = $flatRoom([$tank(0, 'human', 100.0, 125), $tank(1, 'ai', 300.0, 60)]);
$room['fuelApplied'] = [0 => 60];
room_apply_fuel($room);
$me = $room['tanks'][0];
$check('fuel-banked', $me['fuel'] === 140.0, 'fuel=' . $me['fuel']);
```

- [ ] **Step 4: Run the PHP suite**

Run (in `websites/www.cs`): `vendor/bin/phpunit --testsuite tankity`
Expected: PASS, including the 7 `RoomArmorTest` cases and `RoomsSimTest` (now without `repair-above-max`).

- [ ] **Step 5: Commit**

```bash
git add games/tankity/server/rules.php games/tankity/test/php/RoomArmorTest.php games/tankity/test/php/checks/rooms-sim.php
git commit -F- <<'MSG'
Tankity rooms: armor carries between rounds, a wreck re-musters at full max

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb
MSG
```

### Task 3: One room shop purchase function, capped repair, armor in the snapshot

**Files:**
- Modify: `games/tankity/server/rules.php` (new `room_buy`)
- Modify: `games/tankity/rooms.php` (the `buy` handler body)
- Modify: `games/tankity/server/protocol.php` (`you` block)
- Modify: `games/tankity/src/protocol.ts` (`RoomYou`)
- Regenerate: `games/tankity/protocol/*.json`
- Create: `games/tankity/test/php/RoomBuyTest.php`

**Interfaces:**
- Consumes: Task 2's armor functions.
- Produces: `room_buy(array &$room, int $seat, string $item, int $qty): ?array` — null on success, else `[int status, string error]`; errors `'not for sale'` (422), `'unlocks in round N'` / `'nukes unlock in round 4'` (409), `'armor is full'` (409), `'short on cash'` (409). Snapshot `you.armor: number`, `you.maxArmor: number`.

- [ ] **Step 1: Write the failing test**

```php
<?php
// games/tankity/test/php/RoomBuyTest.php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

/* The room shop: one function for every purchase, and Repair never banks. */
final class RoomBuyTest extends TestCase
{
    public static function setUpBeforeClass(): void
    {
        require_once __DIR__ . '/rooms-lib.php';
    }

    private function room(int $round = 1): array
    {
        $room = room_new('SHOP', 'HUM');
        $room['seats'][0] = room_seat_human('HUM', 't0', []);
        room_seat_economy($room, 0);
        $room['round'] = $round;
        return $room;
    }

    public function testRepairAtFullArmorIsRefusedAndCostsNothing(): void
    {
        $room = $this->room();
        $this->assertSame([409, 'armor is full'], room_buy($room, 0, 'repair', 1));
        $this->assertSame(600, $room['cash'][0]);
    }

    public function testRepairBuysOnlyThePacksThatFillTheHull(): void
    {
        $room = $this->room();
        $room['armor'][0] = 30;
        $this->assertNull(room_buy($room, 0, 'repair', 9));
        $this->assertSame(100, $room['armor'][0]);
        $this->assertSame(600 - 2 * 120, $room['cash'][0]);
    }

    public function testAPlateFromTheShop(): void
    {
        $room = $this->room();
        $this->assertNull(room_buy($room, 0, 'plate', 1));
        $this->assertSame(1, $room['plate'][0]);
        $this->assertSame(125, $room['armor'][0]);
        $this->assertSame(300, $room['cash'][0]);
    }

    public function testOneShotTricksNeverStack(): void
    {
        $room = $this->room();
        $this->assertNull(room_buy($room, 0, 'shield', 3));
        $this->assertTrue($room['shield'][0]);
        $this->assertSame(350, $room['cash'][0]);
    }

    public function testRoundOneGoodsSellBeforeRoundOne(): void
    {
        $room = $this->room(0);
        $this->assertNull(room_buy($room, 0, 'mortar', 1));
        $this->assertSame(2, $room['ammo'][0]['mortar']);
    }

    public function testLaterGoodsWaitForTheirRound(): void
    {
        $room = $this->room(1);
        $this->assertSame([409, 'unlocks in round 2'], room_buy($room, 0, 'cluster', 1));
        $this->assertSame([409, 'nukes unlock in round 4'], room_buy($room, 0, 'nuke', 1));
    }

    public function testShortOnCashAndNotForSale(): void
    {
        $room = $this->room();
        $this->assertSame([409, 'short on cash'], room_buy($room, 0, 'extralife', 1));
        $this->assertSame([422, 'not for sale'], room_buy($room, 0, 'shell', 1));
        $this->assertSame([422, 'not for sale'], room_buy($room, 0, 'rocket', 1));
    }

    public function testTheSnapshotCarriesArmorAndMax(): void
    {
        $room = $this->room();
        room_buy($room, 0, 'plate', 1);
        $room['armor'][0] = 90;
        $snap = room_snapshot($room, 0, 0);
        $this->assertSame(90, $snap['you']['armor']);
        $this->assertSame(125, $snap['you']['maxArmor']);
    }
}
```

- [ ] **Step 2: Run it to see it fail**

Run (in `websites/www.cs`): `vendor/bin/phpunit --testsuite tankity --filter RoomBuyTest`
Expected: FAIL, `Call to undefined function room_buy()`.

- [ ] **Step 3: Implement `room_buy` and use it**

Add to `server/rules.php` after `room_carry_armor()`:

```php
/* One purchase: ammo packs or a piece of gear. Null when it went through, else
   [HTTP status, the player's line]. One-shot tricks never stack, a repair buys
   only the packs that fill the hull, and round-one goods sell in the pre-match
   shop (round 0) as the browser's shelf does. */
function room_buy(array &$room, int $seat, string $item, int $qty): ?array
{
    $weapons = room_weapons();
    $qty = max(1, min(9, $qty));
    $gear = null;
    if ($item !== 'shell' && isset($weapons[$item])) {
        $minRound = (int) ($weapons[$item]['minRound'] ?? 1);
        $price = (int) $weapons[$item]['price'];
        $pack = (int) ($weapons[$item]['pack'] ?? 1);
    } elseif (($gear = room_gear($item)) !== null) {
        $minRound = (int) ($gear['minRound'] ?? 1);
        $price = (int) ($gear['price'] ?? 0);
        $pack = 0;
    } else {
        return [422, 'not for sale'];
    }
    if ((int) $room['round'] < ($minRound <= 1 ? 0 : $minRound)) {
        return [409, $item === 'nuke' ? 'nukes unlock in round 4' : 'unlocks in round ' . $minRound];
    }
    $effect = (string) ($gear['effect'] ?? '');
    if (in_array($effect, ['shield', 'extralife', 'laststand'], true)) {
        $qty = 1;
    }
    if ($effect === 'repair') {
        $want = room_repair_packs_wanted($room, $seat, (int) ($gear['n'] ?? 0));
        if ($want === 0) {
            return [409, 'armor is full'];
        }
        $qty = min($qty, $want);
    }
    $total = $price * $qty;
    $cash = $room['cash'][$seat] ?? 0;
    if ($cash < $total) {
        return [409, 'short on cash'];
    }
    $room['cash'][$seat] = $cash - $total;
    if ($gear === null) {
        $room['ammo'][$seat][$item] = ($room['ammo'][$seat][$item] ?? 0) + $pack * $qty;
        return null;
    }
    $n = (int) ($gear['n'] ?? 0) * $qty;
    switch ($effect) {
        case 'repair':
            room_repair($room, $seat, $n);
            break;
        case 'fuel':
            $room['fuelBonus'][$seat] = ($room['fuelBonus'][$seat] ?? 0) + $n;
            break;
        case 'plate':
            room_fit_plate($room, $seat, $qty);
            break;
        case 'shield':
            $room['shield'][$seat] = true;
            break;
        case 'extralife':
            if (($room['seats'][$seat]['lives'] ?? 3) < 5) {
                $room['seats'][$seat]['lives'] = ($room['seats'][$seat]['lives'] ?? 3) + 1;
            } else {
                $room['scores'][$seat] = ($room['scores'][$seat] ?? 0) + 500;
            }
            break;
        case 'jammer':
            $room['jammer'][$seat] = max($room['jammer'][$seat] ?? 0, $n);
            break;
        case 'bunker':
            $room['bunker'][$seat] = max($room['bunker'][$seat] ?? 0, $n);
            break;
        case 'laststand':
            $room['laststand'][$seat] = true;
            break;
    }
    return null;
}
```

In `rooms.php`'s `buy` handler, replace everything from `$item = (string) ($body['item'] ?? '');` down to the closing brace of the `elseif ($gear !== null) { ... switch ... }` block (just before `if (!room_save($fh, $path, $room)) {`) with:

```php
    $err = room_buy($room, $seat, (string) ($body['item'] ?? ''), (int) ($body['qty'] ?? 1));
    if ($err !== null) {
        room_unlock($fh);
        room_json_out($err[0], ['error' => $err[1]]);
    }
```

In `server/protocol.php`, the `you` block gains two lines after `'plate' => ...`:

```php
            'armor' => room_muster_armor($room, $seat),
            'maxArmor' => room_max_armor($room, $seat),
```

In `src/protocol.ts`, `RoomYou` gains after `plate: number;`:

```ts
  /** The armor the next round musters with (what the last one ended with). */
  armor: number;
  maxArmor: number;
```

- [ ] **Step 4: Regenerate the fixtures and run the suites**

Run (in `websites/www.cs`): `make up && make protocol && vendor/bin/phpunit --testsuite tankity && (cd games/tankity && node ../_kit/build/build.mjs tankity)`
Expected: `protocol/*.json` rewritten with `armor` and `maxArmor` in `you`; PHPUnit passes; the build type-checks `protocol-fixtures.check.ts` against the new `RoomYou`.

- [ ] **Step 5: Commit**

```bash
git add games/tankity/server/rules.php games/tankity/rooms.php games/tankity/server/protocol.php games/tankity/src/protocol.ts games/tankity/protocol games/tankity/test/php/RoomBuyTest.php games/tankity/dist
git commit -F- <<'MSG'
Tankity rooms: one shop function; Repair stops at max and never banks

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb
MSG
```

### Task 4: Shared sim vectors for armor

**Files:**
- Modify: `games/tankity/protocol/sim-vectors.php` (new group before `/* ---- write or compare ---- */`)
- Modify: `games/tankity/test/sim-vectors.test.mjs` (import, `RUN.armor`)
- Regenerate: `games/tankity/protocol/sim-vectors.json`

**Interfaces:**
- Consumes: Task 1 (`armor.ts`), Task 2 (`room_muster_armor`, `room_carry_armor`, `room_repair`, `room_fit_plate`, `room_max_armor`).
- Produces: vector group `armor`, case input `{ ops: [op, n?][] }` with ops `muster | damage n | end | repair packs | plate qty`; output per op `{ armor, max, hp }`.

- [ ] **Step 1: Add the generator group**

In `protocol/sim-vectors.php`, before `/* ---- write or compare ---- */`:

```php
/* ---- armor between rounds: carry-over, a capped repair, a plate, a wreck ----
 * Each case is a list of ops on one seat; the output is the seat's armor, its
 * max, and the tank's hp after every op. src/armor.ts replays them. */
$armor = function (string $name, array $ops) use ($add): void {
    $room = ['plate' => [0 => 0]];
    $hp = 0;
    $out = [];
    foreach ($ops as $op) {
        switch ($op[0]) {
            case 'muster':
                $hp = room_muster_armor($room, 0);
                break;
            case 'damage':
                $hp = max(0, $hp - $op[1]);
                break;
            case 'end':
                room_carry_armor($room, 0, $hp, $hp <= 0);
                break;
            case 'repair':
                room_repair($room, 0, 40 * $op[1]);
                break;
            case 'plate':
                room_fit_plate($room, 0, $op[1]);
                break;
        }
        $out[] = ['armor' => room_muster_armor($room, 0), 'max' => room_max_armor($room, 0), 'hp' => $hp];
    }
    $add('armor', $name, ['ops' => $ops], $out);
};
$armor('damage-carries-over', [['muster'], ['damage', 36], ['end'], ['muster']]);
$armor('repair-capped-at-max', [['muster'], ['damage', 15], ['end'], ['repair', 1], ['muster']]);
$armor('repair-from-low-needs-three', [['muster'], ['damage', 90], ['end'], ['repair', 3], ['muster']]);
$armor('plate-raises-max-and-armor', [['muster'], ['damage', 40], ['end'], ['plate', 1], ['muster']]);
$armor('plates-then-repair-to-the-new-max', [['plate', 3], ['muster'], ['damage', 15], ['end'], ['repair', 1], ['muster']]);
$armor('wreck-re-musters-at-full-max', [['plate', 2], ['muster'], ['damage', 500], ['end'], ['muster']]);
$armor('full-armor-repair-restores-nothing', [['muster'], ['repair', 2], ['muster']]);
```

- [ ] **Step 2: Run the JS side to see it fail**

Run (in `games/tankity`): `php protocol/sim-vectors.php && node --test test/sim-vectors.test.mjs`
Expected: FAIL, `armor: no runner for this group in sim-vectors.test.mjs`.

- [ ] **Step 3: Add the runner**

In `test/sim-vectors.test.mjs`, after the `sim` import block:

```js
const armorRules = await import(pathToFileURL(path.join(dir, 'src', 'armor.ts')).href);
```

and in `RUN`, after `'roll-out'`:

```js
  armor(c) {
    let hull = { armor: armorRules.maxArmor(0), plates: 0 };
    let hp = 0;
    const out = [];
    for (const [op, n] of c.ops) {
      if (op === 'muster') hp = hull.armor;
      else if (op === 'damage') hp = Math.max(0, hp - n);
      else if (op === 'end') hull = armorRules.carryArmor(hull, hp, hp <= 0);
      else if (op === 'repair') hull = { armor: hull.armor + armorRules.repairRestores(hull.armor, hull.plates, 40, n), plates: hull.plates };
      else if (op === 'plate') hull = armorRules.fitPlates(hull, n);
      out.push({ armor: hull.armor, max: armorRules.maxArmor(hull.plates), hp });
    }
    return out;
  },
```

- [ ] **Step 4: Run both sides**

Run (in `games/tankity`): `php protocol/sim-vectors.php --check && node --test test/sim-vectors.test.mjs`
Expected: `sim-vectors: N cases current`; `SIM-VECTORS-OK`. `sim-vectors.json` is regenerated on top of the difficulty PR: its `easy-…`, `normal-…`, `hard-…` and `brutal-…` aim and bracket cases stay in the file and stay green beside the new `armor` group (the armor cases do not depend on the drones' aim).

- [ ] **Step 5: Commit**

```bash
git add games/tankity/protocol/sim-vectors.php games/tankity/protocol/sim-vectors.json games/tankity/test/sim-vectors.test.mjs
git commit -F- <<'MSG'
Tankity sim vectors: armor carry-over, capped repair, plates, re-muster

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb
MSG
```

### Task 5: Solo armor in the browser and the shop

**Files:**
- Modify: `games/tankity/src/game-types.ts` (`GameState`)
- Modify: `games/tankity/src/main.ts` (`FALLBACK_ARSENAL` repair note, `G` init)
- Modify: `games/tankity/src/match.ts` (`resetMatch`, `newRound`, `settle`)
- Modify: `games/tankity/src/shop.ts` (`ShopState`, `renderShop`, `shopSub2`, `buyItem`, `applyGear`)
- Modify: `games/tankity/game.yaml` (gear docs and notes), regenerate `game.json`

**Interfaces:**
- Consumes: Task 1.
- Produces: `GameState.armor: number` (armor the next round musters with); `GameState.repairBank` removed.

- [ ] **Step 1: State**

In `src/game-types.ts` replace `  repairBank: number;` with:

```ts
  armor: number; // the armor the next round musters with (src/armor.ts)
```

In `src/main.ts` replace the `G` initialiser line `  fuelBank: 0, repairBank: 0,` with `  fuelBank: 0, armor: TUNE.playerArmor,` and the fallback repair row's note `'Restores 40 armor, banked for next round.'` with `'Restores up to 40 armor, never past max.'`.

- [ ] **Step 2: The match**

In `src/match.ts` add `import { maxArmor } from './armor.ts';`. In `resetMatch()` replace `    G.repairBank = 0;` with `    G.armor = TUNE.playerArmor;`.

In `newRound()` replace current lines 191–202:

```ts
    // Shop fuel and repairs ride in banks: the round rebuilds every tank from
    // scratch, so anything bought spends only if it waits here for muster.
    const musterMax = TUNE.playerArmor + 25 * (G.plate || 0);
    const musterHp = musterMax + (G.repairBank || 0);
    const musterFuel = TUNE.fuel + (G.fuelBank || 0);
    G.repairBank = 0;
    G.fuelBank = 0;
    G.tanks = [{
      id: 'tank', isPlayer: true, color: '#ffff00', body: G.body,
      x: order[0]!, y: 0, angle: 62, power: 55,
      hp: musterHp, maxHp: musterHp, fuel: musterFuel,
    }];
```

with:

```ts
    // Fuel bought in the shop waits in a bank until the tank musters; armor
    // carries over from the last round (src/armor.ts).
    const musterFuel = TUNE.fuel + (G.fuelBank || 0);
    G.fuelBank = 0;
    G.tanks = [{
      id: 'tank', isPlayer: true, color: '#ffff00', body: G.body,
      x: order[0]!, y: 0, angle: 62, power: 55,
      hp: G.armor, maxHp: maxArmor(G.plate), fuel: musterFuel,
    }];
```

In `settle()`, the demo branch: before `newRound('Back in! Same hills, fresh tank.', 'tankLost');` add `G.armor = maxArmor(G.plate);`, and before `G.round += 1;` add `G.armor = me().hp;`. In the non-demo `else if (me().hp <= 0) {` branch, right after `G.lives -= 1;` add `G.armor = maxArmor(G.plate); // a fresh tank next round, plates kept`. In the round-won branch, after `G.cash += prize;` add `G.armor = me().hp;`.

- [ ] **Step 3: The shop**

In `src/shop.ts` add `import { PLATE_ARMOR, armorLabel, maxArmor, plateNote, repairNote, repairPacksWanted, repairRestores } from './armor.ts';`, and in `ShopState` replace `'repairBank'` with `'armor'`.

In `renderShop()` replace `        disabled: locked || G.cash < total,` with:

```ts
        disabled: locked || G.cash < total || (it.effect === 'repair' && G.armor >= maxArmor(G.plate)),
```

and the war-chest line `: \`War chest: $${G.cash} · armor ${me().hp}/${TUNE.playerArmor} · round ${G.round} cleared\`,` with:

```ts
        : `War chest: $${G.cash} · armor ${G.armor}/${maxArmor(G.plate)} · round ${G.round} cleared`,
```

In `shopSub2()` replace the first line `    const maxArmor = TUNE.playerArmor + 25 * (G.plate || 0);` (delete it) and the `repair` and `plate` cases with:

```ts
      case 'repair':
        return repairNote(G.armor, G.plate, it.n, G.shopQty || 1);
      ...
      case 'plate':
        return plateNote(G.plate);
```

In `buyItem()`, after `qty = clamp(Math.floor(qty || 1), 1, 9);` and before `if (net.on) {`, add:

```ts
    if (it.effect === 'repair') {
      const want = repairPacksWanted(G.armor, G.plate, it.n);
      if (want === 0) { say('Armor is full already.', 'info'); return; }
      qty = Math.min(qty, want);
    }
```

In `applyGear()` replace the `repair` and `plate` cases with:

```ts
      case 'repair':
        G.armor += repairRestores(G.armor, G.plate, it.n || 0, qty);
        say(`Bought ${lots}${it.label}: armor ${armorLabel(G.armor, G.plate)}.`, 'good');
        break;
      ...
      case 'plate':
        G.plate += qty;
        G.armor += PLATE_ARMOR * qty;
        say(`Bought ${lots}${it.label}: armor ${armorLabel(G.armor, G.plate)}.`, 'good');
        break;
```

Remove `TUNE` from the `./sim.ts` import if nothing else in `shop.ts` uses it (`renderShop` no longer does; `shopSub2`'s `extralife` case still reads `TUNE.maxLives`, so keep it).

- [ ] **Step 4: The data file**

In `game.yaml` change the gear field docs:

```yaml
#               repair     armor restored, up to max armor
#               fuel       driving fuel added
#               plate      max armor added, and the same armor now
```

the repair row's note to `note: Restores up to 40 armor, never past max.` and the plate row's note to `note: Raises max armor by 25 and adds 25 armor now.`

- [ ] **Step 5: Rebuild and run the unit suites**

Run (in `games/tankity`): `php tools/game-json.php && node ../_kit/build/build.mjs tankity && node --test 'test/*.test.mjs'`
Expected: `game.json` rewritten; build clean; all node tests pass (the smoke test's `shop-bulk-banked` still reads fuel 260; `boot-hud` still matches `/you 100/`).

- [ ] **Step 6: Commit**

```bash
git add games/tankity/src games/tankity/game.yaml games/tankity/game.json games/tankity/dist
git commit -F- <<'MSG'
Tankity solo: armor carries over; Repair restores to max and greys at full

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb
MSG
```

### Task 6: Armor in a room's shop and on the ARMOR pill

**Files:**
- Modify: `games/tankity/src/room.ts` (`netAdopt`)
- Modify: `games/tankity/src/hud.ts` (`renderStanding`, `HUD` init)
- Modify: `games/tankity/src/ui/hud.tsx` (Plan C Task 17's status bar: `HudProps.armor`, the ARMOR pill)
- Modify: `games/tankity/test/hud.test.mjs` (Plan C Task 17's node:test file)
- Modify: `tests/e2e/tankity-hud.spec.mjs:19`

**Interfaces:**
- Consumes: Task 3 (`you.armor`, `you.maxArmor`), Task 1 (`armorLabel`, `maxArmor`).
- Produces: `HudProps['armor']` gains `title: string` ("160 of 175"); the pill sets `title` and `aria-label` from it.

- [ ] **Step 1: Write the failing UI test**

In `test/hud.test.mjs`, in `props()`, change the sample `armor: { shown: '100', sr: 'you 100 · REAPER:100' }` to `armor: { shown: '100', sr: 'you 100 of 100 · REAPER:100', title: '100 of 100' }`; in `'a redraw updates in place'` change `armor: { shown: '90', sr: '' }` to `armor: { shown: '90', sr: '', title: '90 of 125' }`; and append:

```js
test('ARMOR says armor of max on hover and to readers', () => {
  const bar = makeEl('hud-bar');
  hud.renderHud(bar, props().p);
  const armor = byId(bar, 'hud-armor');
  assert.equal(armor.getAttribute('title'), '100 of 100');
  assert.equal(armor.getAttribute('aria-label'), '100 of 100 armor');
  assert.equal(armor.textContent, '100 you 100 of 100 · REAPER:100');
  hud.renderHud(bar, props({ armor: { shown: '-', sr: '', title: '' } }).p);
  assert.equal(byId(bar, 'hud-armor').getAttribute('title'), undefined);
});
```

Run (in `games/tankity`): `node --test test/hud.test.mjs`
Expected: FAIL on `ARMOR says armor of max`.

- [ ] **Step 2: Implement**

In `src/ui/hud.tsx`, the ARMOR pill's value element gets the hover text and its spoken name: replace

```tsx
            <span class="v" id="hud-armor">{p.armor.shown}{p.armor.sr && <span class="sr-only">{` ${p.armor.sr}`}</span>}</span>
```

with

```tsx
            <span class="v" id="hud-armor" title={p.armor.title || undefined} aria-label={p.armor.title ? `${p.armor.title} armor` : undefined}>
              {p.armor.shown}{p.armor.sr && <span class="sr-only">{` ${p.armor.sr}`}</span>}
            </span>
```

and in `HudProps` replace `armor: { shown: string; sr: string };` (and its doc comment) with

```tsx
  /** Armor: what shows, what a screen reader adds (the rivals' armor), and "160 of 175" for hover and readers. */
  armor: { shown: string; sr: string; title: string };
```

In `src/hud.ts` (Plan C Task 19's) add `import { armorLabel } from './armor.ts';`, change the `HUD` initialiser's `armor: { shown: '-', sr: '' }` to `armor: { shown: '-', sr: '', title: '' }`, and replace `renderStanding()`'s `HUD.armor = {...};` with:

```ts
    // In the shop the next round's armor is what counts; on the field, the tank's.
    const shop = G.phase === 'shop';
    const hp = shop ? G.armor : mine ? Math.max(0, Math.round(mine.hp)) : null;
    const label = hp === null ? '' : shop ? armorLabel(G.armor, G.plate) : `${hp} of ${mine!.maxHp}`;
    HUD.armor = {
      shown: hp === null ? '-' : `${hp}`,
      sr: `${label ? `you ${label} · ` : ''}${others}`,
      title: label,
    };
```

Add `'armor'` to `HudState`'s `Pick<GameState, ...>` list (it already has `'plate'`).

In `src/room.ts` `netAdopt()`, after `      G.plate = room.you.plate || 0;` add:

```ts
      G.armor = room.you.armor ?? G.armor;
```

In `tests/e2e/tankity-hud.spec.mjs` line 19 change the expectation to:

```js
  expect(await hud(page, 'hud-armor')).toMatch(/you \d+ of \d+ · .*reaper:\d+/);
```

- [ ] **Step 3: Run the checks**

Run (in `games/tankity`): `node ../_kit/build/build.mjs tankity && node --test test/hud.test.mjs test/smoke.test.mjs`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add games/tankity/src games/tankity/test/hud.test.mjs games/tankity/dist tests/e2e/tankity-hud.spec.mjs
git commit -F- <<'MSG'
Tankity: the ARMOR pill and screen readers say armor of max

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb
MSG
```

### Task 7: Armor browser spec, docs, PR 14

**Files:**
- Create: `tests/e2e/tankity-armor.spec.mjs`
- Modify: `tests/e2e/helpers.mjs` (`dealSolo`; `startSolo` uses it)
- Modify: `tests/e2e/shard.mjs` (`WEIGHTS`)
- Modify: `games/tankity/README.md` (new section "Armor"; the `RoomsSimTest` line in Tests)

**Interfaces:**
- Consumes: Tasks 1–6; Plan C's title card (`#title-play`).
- Produces: `dealSolo(page)` in `tests/e2e/helpers.mjs` (Play on the title card, then the pre-match shop is open); `tankity-armor.spec.mjs` (≤ 15 s).

- [ ] **Step 1: The helper, then the spec**

Plan C adds no helper for this, and `helpers.mjs`'s existing `startSolo(page)` goes past the shop (its callers in `tankity-solo` and `tankity-hud` want the first aim). In `tests/e2e/helpers.mjs`, replace

```js
/* Solo match: deal in, leave the shop, wait for our first aim. */
export async function startSolo(page) {
  await page.keyboard.press('n');
  await page.waitForSelector('#shop-veil:not([hidden])');
  await page.click('#shop-next');
```

with

```js
/* Solo match from the title card: Play deals in and the pre-match shop opens. */
export async function dealSolo(page) {
  await page.click('#title-play');
  await page.waitForSelector('#shop-veil:not([hidden])');
}

/* Solo match: deal in, leave the shop, wait for our first aim. */
export async function startSolo(page) {
  await dealSolo(page);
  await page.click('#shop-next');
```

```js
// tests/e2e/tankity-armor.spec.mjs
// Operation Tankity: armor between rounds, as the shop and the ARMOR pill show it.
import { test, expect } from '@playwright/test';
import { newPlayer, dealSolo } from './helpers.mjs';

test('Repair greys out at full armor, a plate raises max and armor, and the pill reads armor of max', async ({ browser }) => {
  const { page, errors } = await newPlayer(browser, undefined, { clock: true });
  await dealSolo(page);
  const row = name => page.locator('#shop-list li', { hasText: name });
  const buy = name => row(name).locator('.acts button').last();
  await expect(row('Repair')).toContainText('Armor full (100 of 100).');
  await expect(buy('Repair')).toBeDisabled();
  await buy('Hull plate').click();
  await expect(row('Hull plate')).toContainText('Max armor 125 (1 fitted)');
  await expect(row('Repair')).toContainText('Armor full (125 of 125).');
  await expect(page.locator('#shop-cash')).toContainText('armor 125/125');
  await page.click('#shop-next');
  await expect.poll(async () => {
    await page.clock.runFor(1000);
    return page.locator('#hud-armor').getAttribute('title');
  }, { timeout: 10_000 }).toBe('125 of 125');
  expect(errors).toEqual([]);
});
```

In `tests/e2e/shard.mjs` `WEIGHTS` add `'tankity-armor.spec.mjs': 15,`.

- [ ] **Step 2: Run it**

Run (in `websites/www.cs`): `make e2e E2E_ARGS="tankity-armor.spec.mjs"`
Expected: 1 passed in under 15 s.

- [ ] **Step 3: Docs**

Append to `games/tankity/README.md` before `## Drone aim`:

```markdown
## Armor

A human's tank carries its armor from round to round. Max armor is 100 plus
25 per hull plate; fitting a plate raises the max and adds 25 armor at once.
Repair +40 restores up to max and never beyond: the shop greys it out at full
armor and says what it would restore. Losing a life sends the next round out
in a fresh tank at full max, plates still fitted. Drones are unchanged: each
round they muster with 60 + 6 × (round − 1) armor.

The rules live in `src/armor.ts` and `server/rules.php` (`room_max_armor` ..
`room_carry_armor`, used by `room_buy` and the round start and end); the
`armor` group of the sim vectors keeps them identical.
```

In the Tests table, replace "pierce, repair, spawns" with "pierce, spawns" and add a row:

```markdown
| `RoomArmorTest`, `RoomBuyTest` (host PHP) | Armor carry-over and re-muster, the capped repair, plates, and every shop purchase rule |
```

- [ ] **Step 4: Full local gate, then the PR**

Run (in `websites/www.cs`): `make test`
Expected: green within budgets.

```bash
git add tests/e2e/tankity-armor.spec.mjs tests/e2e/helpers.mjs tests/e2e/shard.mjs games/tankity/README.md
git commit -F- <<'MSG'
Tankity armor: browser spec and docs

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb
MSG
git push -u origin games/tankity-armor
gh pr create --title "Tankity armor: carry-over, capped repair, plates, re-muster" --body "Spec row 14 (section 7.1). Client and server change together; new sim-vector group 'armor'.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb"
```

If `main` moved, rebase and rebuild the generated files (Global Constraints). Run the pr-fix loop on the review comments; wait on required checks (`gh pr checks --required`; when it lists none, confirm branch protection and gate on the CI run instead), merge on green, deploy (`make deploy`), and check live: one solo round on `/play/tankity/?v=<sha>` shows "Armor full (100 of 100)." on Repair in the pre-match shop. Report the cache-busted link.

---

# PR 15: match end, scoreboards, Play again, auto-filed scores

Branch `games/tankity-match-end`, worktree `.claude/worktrees/tankity-match-end`, off `main` after PR 14 merged.

### Task 8: The last human standing ends a room match

**Files:**
- Modify: `games/tankity/server/rules.php` (new `room_match_begin`, `room_match_outcome`, `room_winner_bonus`; `room_end_round`)
- Modify: `games/tankity/rooms.php` (`start` handler)
- Modify: `games/tankity/src/protocol.ts` (`MatchWinEvent`)
- Create: `games/tankity/test/php/RoomMatchEndTest.php`

**Interfaces:**
- Produces: `room_match_begin(array &$room): void` (stamps `startHumans`, `stats`, `filed`, `winner`); `room_match_outcome(array $room): array{over: bool, winner: ?int}`; `room_winner_bonus(int $round): int`; event `['t' => 'matchwin', 'seat' => int, 'bonus' => int]`; room keys `startHumans`, `winner`.

- [ ] **Step 1: Write the failing test**

```php
<?php
// games/tankity/test/php/RoomMatchEndTest.php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

/* A room that started with two or more humans ends when one human has lives
   left: that human wins, with twice the round bonus. One human plays like solo. */
final class RoomMatchEndTest extends TestCase
{
    public static function setUpBeforeClass(): void
    {
        require_once __DIR__ . '/rooms-lib.php';
    }

    /** $humans humans on $lives lives each, the rest drones, the match begun. */
    private function room(int $humans, int $lives = 1): array
    {
        $room = room_new('ENDS', 'H00');
        for ($i = 0; $i < 4; $i++) {
            $room['seats'][$i] = $i < $humans
                ? room_seat_human('H0' . $i, 't' . $i, []) + ['lives' => $lives]
                : room_idle_seat($i, 'ai');
            if ($i < $humans) {
                $room['seats'][$i]['lives'] = $lives;
                room_seat_economy($room, $i);
            }
        }
        room_match_begin($room);
        room_start_round($room);
        return $room;
    }

    private function wreck(array &$room, callable $which): void
    {
        foreach ($room['tanks'] as &$t) {
            if ($which($t)) {
                $t['hp'] = 0;
            }
        }
        unset($t);
    }

    private function types(array $events): array
    {
        return array_column($events, 't');
    }

    public function testOneHumanPlaysLikeSolo(): void
    {
        $room = $this->room(1, 2);
        $this->wreck($room, fn($t) => $t['kind'] === 'human');
        $events = [];
        room_end_round($room, $events);
        $this->assertSame('shop', $room['phase']);
        $this->assertSame(['over' => false, 'winner' => null], room_match_outcome($room));
    }

    public function testLastHumanStandingWinsWithTwiceTheRoundBonus(): void
    {
        $room = $this->room(2, 1);
        $this->wreck($room, fn($t) => $t['seat'] === 1);
        $score0 = $room['scores'][0] ?? 0;
        $events = [];
        room_end_round($room, $events);
        $this->assertSame('over', $room['phase']);
        $this->assertSame(0, $room['winner']);
        $this->assertContains('matchwin', $this->types($events));
        $win = array_values(array_filter($events, fn($e) => $e['t'] === 'matchwin'))[0];
        $this->assertSame(room_winner_bonus(1), $win['bonus']);
        $this->assertSame(2 * (750 + 150), room_winner_bonus(1));
        $this->assertSame($score0 + $win['bonus'], $room['scores'][0]);
        $this->assertSame('matchover', end($events)['t']);
    }

    public function testTwoOutAtOnceLeaveOneWinner(): void
    {
        $room = $this->room(3, 1);
        $this->wreck($room, fn($t) => $t['seat'] === 1 || $t['seat'] === 2);
        $events = [];
        room_end_round($room, $events);
        $this->assertSame('over', $room['phase']);
        $this->assertSame(0, $room['winner']);
    }

    public function testLastTwoFallTogetherNobodyWins(): void
    {
        $room = $this->room(2, 1);
        $this->wreck($room, fn($t) => $t['kind'] === 'human');
        $score0 = $room['scores'][0] ?? 0;
        $events = [];
        room_end_round($room, $events);
        $this->assertSame('over', $room['phase']);
        $this->assertNull($room['winner']);
        $this->assertNotContains('matchwin', $this->types($events));
        $this->assertSame($score0, $room['scores'][0] ?? 0);
    }

    public function testTwoHumansWithLivesLeftPlayOn(): void
    {
        $room = $this->room(2, 3);
        $this->wreck($room, fn($t) => $t['seat'] === 1);
        $events = [];
        room_end_round($room, $events);
        $this->assertSame('shop', $room['phase']);
    }

    public function testTheWatchCapStays(): void
    {
        $this->assertSame(40, ROOM_WATCH_TURNS);
    }
}
```

- [ ] **Step 2: Run it to see it fail**

Run (in `websites/www.cs`): `vendor/bin/phpunit --testsuite tankity --filter RoomMatchEndTest`
Expected: FAIL, `Call to undefined function room_match_begin()`.

- [ ] **Step 3: Implement**

Add to `server/rules.php` before `room_end_round()`:

```php
/* ---------- this match ---------- */
/* Called by the start handler: who started (the last-human-standing rule needs
   two), and each human's match stats from zero. */
function room_match_begin(array &$room): void
{
    $room['startHumans'] = 0;
    $room['stats'] = [];
    $room['filed'] = [];
    $room['winner'] = null;
    foreach ($room['seats'] as $idx => $s) {
        if ($s['human'] ?? false) {
            $room['startHumans']++;
            $room['stats'][$idx] = ['won' => 0, 'kills' => 0, 'gain' => 0, 'from' => 0, 'out' => null];
        }
    }
}
/* Whether the match is over after a round, and who won. No human with a life
   left ends it with no winner; in a room that started with two or more humans,
   exactly one left ends it and that one wins. src/standings.ts matchOutcome()
   is the same, pinned by the 'match-end' sim vectors. */
function room_match_outcome(array $room): array
{
    $left = [];
    foreach ($room['seats'] as $idx => $s) {
        if (($s['human'] ?? false) && ($s['lives'] ?? 0) > 0) {
            $left[] = $idx;
        }
    }
    if (!$left) {
        return ['over' => true, 'winner' => null];
    }
    if (($room['startHumans'] ?? 1) >= 2 && count($left) === 1) {
        return ['over' => true, 'winner' => $left[0]];
    }
    return ['over' => false, 'winner' => null];
}
/* The winner's bonus: twice the round bonus of the round the match ended in. */
function room_winner_bonus(int $round): int
{
    return 2 * (750 + $round * 150);
}
```

In `room_end_round()` replace the tail from `    unset($room['pace']);` to the end of the function:

```php
    unset($room['pace']);
    if (!$anyLeft) {
        $room['phase'] = 'over';
        $events[] = ['t' => 'matchover'];
        return;
    }
    // Every round starts from the shop, won or lost.
    $room['phase'] = 'shop';
    $room['shop'] = ['at' => microtime(true), 'ready' => []];
}
```

with:

```php
    unset($room['pace']);
    $outcome = room_match_outcome($room);
    if ($outcome['over']) {
        if ($outcome['winner'] !== null) {
            $w = $outcome['winner'];
            $bonus = room_winner_bonus((int) $room['round']);
            $room['scores'][$w] = ($room['scores'][$w] ?? 0) + $bonus;
            $room['winner'] = $w;
            $events[] = ['t' => 'matchwin', 'seat' => $w, 'bonus' => $bonus];
        }
        $room['phase'] = 'over';
        $events[] = ['t' => 'matchover'];
        return;
    }
    // Every round starts from the shop, won or lost.
    $room['phase'] = 'shop';
    $room['shop'] = ['at' => microtime(true), 'ready' => []];
}
```

The `$anyLeft` variable is now unused: delete its declaration (`$anyLeft = false;`) and the `if (($s['lives'] ?? 0) > 0) { $anyLeft = true; }` block inside the seats loop.

In `rooms.php` `start` handler, replace `    room_start_round($room);` with:

```php
    room_match_begin($room);
    room_start_round($room);
```

In `src/protocol.ts`, after `MatchOverEvent`:

```ts
/** The last human standing in a room that started with two or more: `bonus` is twice the round bonus. */
export interface MatchWinEvent extends EventBase { t: 'matchwin'; seat: number; bonus: number }
```

and add `| MatchWinEvent` to the `RoomEvent` union after `MatchOverEvent`.

- [ ] **Step 4: Run the suites**

Run (in `websites/www.cs`): `vendor/bin/phpunit --testsuite tankity && (cd games/tankity && node ../_kit/build/build.mjs tankity)`
Expected: PASS (the legacy `last-life-lost-ends-the-match` and `ffa-*` checks still hold: rooms built without `room_match_begin` read `startHumans` as 1).

- [ ] **Step 5: Commit**

```bash
git add games/tankity/server/rules.php games/tankity/rooms.php games/tankity/src/protocol.ts games/tankity/test/php/RoomMatchEndTest.php games/tankity/dist
git commit -F- <<'MSG'
Tankity rooms: the last human standing wins, with twice the round bonus

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb
MSG
```

### Task 9: Per-seat match stats in the snapshot

**Files:**
- Modify: `games/tankity/server/rules.php` (`room_start_round`, `room_end_round`)
- Modify: `games/tankity/server/sim.php` (`room_explode`)
- Modify: `games/tankity/server/protocol.php` (seats, top level)
- Modify: `games/tankity/src/protocol.ts` (`RoomSeat`, `RoomSnapshot`)
- Regenerate: `games/tankity/protocol/*.json`
- Create: `games/tankity/test/php/RoomStandingsTest.php`

**Interfaces:**
- Consumes: Task 8 (`stats`, `startHumans`, `winner`).
- Produces: snapshot seat fields `roundsWon: number`, `kills: number`, `gain: number` (score this seat gained in the last finished round, winner's bonus included), `out: number | null` (round its last life went); top-level `startHumans: number`, `winner: number | null`.

- [ ] **Step 1: Write the failing test**

```php
<?php
// games/tankity/test/php/RoomStandingsTest.php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

/* Each human's match so far: rounds won, kills, this round's gain, the round
   they went out in, all in the snapshot the scoreboards draw. */
final class RoomStandingsTest extends TestCase
{
    public static function setUpBeforeClass(): void
    {
        require_once __DIR__ . '/rooms-lib.php';
    }

    private function room(): array
    {
        $room = room_new('STAT', 'AAA');
        $room['seats'][0] = room_seat_human('AAA', 't0', []);
        $room['seats'][1] = room_seat_human('BBB', 't1', []);
        $room['seats'][2] = room_idle_seat(2, 'ai');
        $room['seats'][3] = room_idle_seat(3, 'open');
        room_seat_economy($room, 0);
        room_seat_economy($room, 1);
        room_match_begin($room);
        room_start_round($room);
        return $room;
    }

    private function idx(array $room, int $seat): int
    {
        foreach ($room['tanks'] as $i => $t) {
            if ($t['seat'] === $seat) {
                return $i;
            }
        }
        $this->fail("no tank for seat $seat");
    }

    public function testAKillByAHumanCounts(): void
    {
        $room = $this->room();
        $drone = $this->idx($room, 2);
        $room['tanks'][$drone]['hp'] = 1;
        $t = $room['tanks'][$drone];
        $events = [];
        room_explode($room, $events, $room['tanks'][$this->idx($room, 0)], 'shell', (float) $t['x'], (float) $t['y'] - 30.0, $drone, null);
        $this->assertSame(1, $room['stats'][0]['kills']);
        $this->assertSame(0, $room['stats'][1]['kills']);
    }

    public function testRoundEndRecordsWinGainAndOut(): void
    {
        $room = $this->room();
        $room['seats'][1]['lives'] = 1;
        foreach ($room['tanks'] as &$t) {
            if ($t['seat'] !== 0) {
                $t['hp'] = 0;
            }
        }
        unset($t);
        $events = [];
        room_end_round($room, $events);
        $this->assertSame(1, $room['stats'][0]['won']);
        $this->assertSame(1, $room['stats'][1]['out']);
        $this->assertSame($room['scores'][0], $room['stats'][0]['gain']);
        $snap = room_snapshot($room, 0, 0);
        $this->assertSame(2, $snap['startHumans']);
        $this->assertSame(0, $snap['winner']);
        $this->assertSame(['roundsWon' => 1, 'kills' => 0, 'out' => null],
            array_intersect_key($snap['seats'][0], ['roundsWon' => 0, 'kills' => 0, 'out' => 0]));
        $this->assertSame(1, $snap['seats'][1]['out']);
        $this->assertSame($room['scores'][0], $snap['seats'][0]['gain']);
    }

    public function testGainIsPerRound(): void
    {
        $room = $this->room();
        $room['scores'][0] = 400;
        $events = [];
        $room['stats'][0]['from'] = 0;
        foreach ($room['tanks'] as &$t) {
            if ($t['kind'] === 'ai') {
                $t['hp'] = 0;
            }
        }
        unset($t);
        room_end_round($room, $events);
        $first = $room['stats'][0]['gain'];
        room_shop_set_ready($room, 0, true);
        room_shop_set_ready($room, 1, true);
        room_shop_settle($room);
        $this->assertSame($room['scores'][0], $room['stats'][0]['from']);
        $this->assertGreaterThan(0, $first);
    }
}
```

- [ ] **Step 2: Run it to see it fail**

Run (in `websites/www.cs`): `vendor/bin/phpunit --testsuite tankity --filter RoomStandingsTest`
Expected: FAIL (`kills` stays 0 / undefined index `startHumans`).

- [ ] **Step 3: Implement**

`server/sim.php` `room_explode()`: inside `if ($t['hp'] <= 0) {`, right after `$events[] = ['t' => 'kill', ...];`, add:

```php
            if ($tank['kind'] === 'human' && $t['seat'] !== $tank['seat'] && isset($room['stats'][$tank['seat']])) {
                $room['stats'][$tank['seat']]['kills']++;
            }
```

`server/rules.php` `room_start_round()`: after `$room['watchTurns'] = 0;` add:

```php
    // Each human's gain this round counts from here.
    foreach ($room['stats'] ?? [] as $idx => $st) {
        $room['stats'][$idx]['from'] = $room['scores'][$idx] ?? 0;
    }
```

`room_end_round()`: in the seats loop, inside `if ($s['lives'] <= 0) {` before `room_save_score(...)`, add `$room['stats'][$idx]['out'] = (int) $room['round'];` (guarded: `if (isset($room['stats'][$idx])) { ... }`). After the `if ($winner !== null) { ... }` block (round pay) add:

```php
    if ($winner !== null && isset($room['stats'][$winner['seat']])) {
        $room['stats'][$winner['seat']]['won']++;
    }
```

and in Task 8's `$outcome['over']` winner branch, after `$room['winner'] = $w;` nothing changes; right before `$outcome = room_match_outcome($room);` add the gains (the winner's bonus is added to `gain` in its branch):

```php
    foreach ($room['stats'] ?? [] as $idx => $st) {
        $room['stats'][$idx]['gain'] = ($room['scores'][$idx] ?? 0) - $st['from'];
    }
```

and in the winner branch after `$room['scores'][$w] = ...;`: `if (isset($room['stats'][$w])) { $room['stats'][$w]['gain'] += $bonus; }`.

`server/protocol.php`: in the `$seats[] = [...]` entry add after `'score' => ...`:

```php
            'roundsWon' => (int) ($room['stats'][$idx]['won'] ?? 0),
            'kills' => (int) ($room['stats'][$idx]['kills'] ?? 0),
            'gain' => (int) ($room['stats'][$idx]['gain'] ?? 0),
            'out' => $room['stats'][$idx]['out'] ?? null,
```

and in `$out` after `'round' => $room['round'],`:

```php
        'startHumans' => (int) ($room['startHumans'] ?? 0),
        'winner' => $room['winner'] ?? null,
```

`src/protocol.ts`: `RoomSeat` gains

```ts
  /** This match: rounds won, units wrecked, score gained in the last finished round, and the round the last life went (null while alive). */
  roundsWon: number;
  kills: number;
  gain: number;
  out: number | null;
```

and `RoomSnapshot` gains after `round: number;`:

```ts
  /** Humans seated when the match started; two or more makes it last-human-standing. */
  startHumans: number;
  /** The seat that won the match; null until then, and when nobody did. */
  winner: number | null;
```

- [ ] **Step 4: Regenerate fixtures, run suites**

Run (in `websites/www.cs`): `make up && make protocol && vendor/bin/phpunit --testsuite tankity && (cd games/tankity && php protocol/sim-vectors.php --check && node ../_kit/build/build.mjs tankity && node --test 'test/*.test.mjs')`
Expected: PASS (the sim vectors' `blast` and `volley` outcomes are unchanged: their rooms carry no `stats`). The fixtures are regenerated on top of the difficulty PR: every snapshot keeps its `difficulty` field beside the new per-seat stats, and `protocol-fixtures.check.ts` type-checks both.

- [ ] **Step 5: Commit**

```bash
git add games/tankity/server games/tankity/src/protocol.ts games/tankity/protocol games/tankity/test/php/RoomStandingsTest.php games/tankity/dist
git commit -F- <<'MSG'
Tankity rooms: per-seat match stats (rounds won, kills, gain, out) in the snapshot

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb
MSG
```

### Task 10: The boards, one per difficulty, with the callsign conversion

**Files:**
- Create: `games/tankity/server/guard.php`
- Create: `games/tankity/server/board.php`
- Modify: `games/tankity/server/db.php` (schema step 2: the `board` table)
- Modify: `games/tankity/server/housekeep.php` (`tankity_jobs`: the `callsigns` job)
- Modify: `games/tankity/server/rules.php` (delete `BLOCKED_INITIALS` const, current lines 14–30)
- Modify: `games/tankity/rooms.php` (require `server/guard.php` and `server/board.php` before `server/rules.php`)
- Modify: `games/tankity/tools/install-files.php` (install config: `'kit_php' => ['score-guard.php']`, Plan C Task 1's key)
- Create: `games/tankity/server/score-guard.php` (generated copy, written by `php tools/install-files.php`)
- Modify: `games/tankity/test/smoke.test.mjs` (`phpFiles` reads `server/guard.php` and `server/board.php`)
- Create: `games/tankity/test/php/BoardTest.php`

**Interfaces:**
- Consumes: Plan C's `Kit\ScoreGuard` (`validateConfig`, `initials`, `coerceInitials`, `isBlocked`, the constructor), through the `server/score-guard.php` copy; PR 20's `tankity_db`, `tankity_tx`, `tankity_data_dir`, `tankity_schema_steps`, `tankity_jobs`, `legacy_read`.
- Produces: `BLOCKED_INITIALS` (now in `guard.php`); `TANKITY_GUARD_RUNS = 'guard-runs.json'`; `tankity_guard_config(array $override = []): array` (Tankity's `CONFIG_KEYS`, validated; `runTtlSec` 86400, since a solo run's token is spent when the run files, which can be hours after it started); `tankity_guard(array $override = [], ?array $server = null, ?array $cookies = null, ?Closure $clock = null, ?Closure $setCookie = null): Kit\ScoreGuard` (header `X-Tankity-Csrf`, rate salt `tankity-score-rate-v1`, run store `<storage directory>/guard-runs.json`; the request's `$_SERVER`/`$_COOKIE` unless given); `tankity_initials(Kit\ScoreGuard $guard, mixed $raw): ?string` (`ScoreGuard::initials()` on the trimmed value, and null for a blocked set); `BOARD_LEVELS = ['easy', 'normal', 'hard']`, `BOARD_KEEP = 100` (per difficulty), `BOARD_SHOW = 20`, `BOARD_STANDIN = 'AAA'`; `board_level(mixed $raw): ?string`; `board_convert_name(string $name, Kit\ScoreGuard $guard): string`; `board_file(array $run): ?int` (run keys `difficulty`, `initials`, `score`, `rounds`, `seed`, optional `at`; the 1-based place on that difficulty's board, null when it did not place); `board_top(string $difficulty, int $n): array` (rows `initials, score, rounds, seed, at, place`); `board_convert_callsigns(int $limit = 200): int` (callsign rows moved onto the Normal board, each its best run, the row then deleted). Schema step 2: `board (id INTEGER PRIMARY KEY AUTOINCREMENT, difficulty, initials, score, rounds, seed, at)`, index `board_rank (difficulty, score DESC, id)`.

- [ ] **Step 1: Write the failing test**

```php
<?php
// games/tankity/test/php/BoardTest.php
declare(strict_types=1);

use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

/* The boards: one per difficulty, best runs first, ties keep the older run
   ahead, the best BOARD_KEEP kept per board, and the per-callsign rows from
   before the boards converted once onto the Normal board. */
final class BoardTest extends TestCase
{
    private string $dir;

    public static function setUpBeforeClass(): void
    {
        require_once __DIR__ . '/rooms-lib.php';
    }

    protected function setUp(): void
    {
        $this->dir = tankity_test_dir();
    }

    protected function tearDown(): void
    {
        tankity_test_rm($this->dir);
    }

    private function run(string $who, int $score, string $level = 'normal'): array
    {
        return ['difficulty' => $level, 'initials' => $who, 'score' => $score, 'rounds' => 1, 'seed' => 's'];
    }

    public function testFilesAndRanksBestFirst(): void
    {
        $this->assertSame(1, board_file($this->run('AAA', 300)));
        $this->assertSame(1, board_file($this->run('BBB', 500)));
        $this->assertSame(3, board_file($this->run('CCC', 100)));
        $this->assertSame(['BBB', 'AAA', 'CCC'], array_column(board_top('normal', 10), 'initials'));
        $this->assertSame([1, 2, 3], array_column(board_top('normal', 10), 'place'));
    }

    public function testEachDifficultyHasItsOwnBoard(): void
    {
        $this->assertSame(1, board_file($this->run('EZE', 100, 'easy')));
        $this->assertSame(1, board_file($this->run('HRD', 50, 'hard')));
        $this->assertSame(1, board_file($this->run('NRM', 10)));
        $this->assertSame(['EZE'], array_column(board_top('easy', 10), 'initials'));
        $this->assertSame(['HRD'], array_column(board_top('hard', 10), 'initials'));
        $this->assertSame(['NRM'], array_column(board_top('normal', 10), 'initials'));
        $this->assertSame(BOARD_LEVELS, array_keys(ROOM_DIFFICULTY), 'the boards are the drones\' levels');
    }

    public function testAnUnknownDifficultyIsNotABoard(): void
    {
        $this->assertNull(board_level('brutal'));
        $this->assertNull(board_level(null));
        $this->assertSame('hard', board_level('hard'));
        $this->expectException(InvalidArgumentException::class);
        board_file($this->run('BAD', 1, 'brutal'));
    }

    public function testTiesKeepTheOlderRunAhead(): void
    {
        board_file($this->run('OLD', 200));
        $this->assertSame(2, board_file($this->run('NEW', 200)));
        $this->assertSame(['OLD', 'NEW'], array_column(board_top('normal', 2), 'initials'));
    }

    public function testKeepsTheBestAndARunBelowThemDoesNotPlace(): void
    {
        for ($i = 0; $i < BOARD_KEEP; $i++) {
            board_file($this->run('TOP', 1000 + $i));
        }
        $this->assertNull(board_file($this->run('LOW', 1)));
        $this->assertCount(BOARD_KEEP, board_top('normal', BOARD_KEEP + 5));
        $this->assertSame(1, board_file($this->run('LOW', 1, 'easy')), 'another board is not full');
    }

    /** @return iterable<string, array{string, string}> */
    public static function callsigns(): iterable
    {
        yield 'two letters pad with X' => ['bo', 'BOX'];
        yield 'digits and dashes drop' => ['r2-d2', 'RDX'];
        yield 'long names cut' => ['tankity-ace', 'TAN'];
        yield 'no letters is XXX, which is blocked' => ['123', 'AAA'];
        yield 'empty' => ['', 'AAA'];
        yield 'a blocked set' => ['ass', 'AAA'];
        yield 'already three' => ['wgr', 'WGR'];
    }

    #[DataProvider('callsigns')]
    public function testOddCallsignsConvert(string $name, string $want): void
    {
        $this->assertSame($want, board_convert_name($name, tankity_guard()));
    }

    public function testConvertsCallsignRowsOnceOntoTheNormalBoard(): void
    {
        legacy_write(tankity_db(), 'wg', ['runs' => [
            ['score' => 10, 'banked' => 0, 'won' => false, 'seed' => 'a', 'ts' => '2026-01-01T00:00:00+00:00'],
            ['score' => 900, 'banked' => 4, 'won' => false, 'seed' => 'b', 'ts' => '2026-02-01T00:00:00+00:00'],
        ]]);
        legacy_write(tankity_db(), 'r2-d2', ['runs' => [['score' => 450, 'banked' => 2, 'won' => false, 'seed' => 'c', 'ts' => '2026-03-01T00:00:00+00:00']]]);
        $this->assertSame(2, board_convert_callsigns());
        $top = board_top('normal', 10);
        $this->assertSame(['WGX', 'RDX'], array_column($top, 'initials'));
        $this->assertSame([900, 450], array_column($top, 'score'));
        $this->assertSame([4, 'b', '2026-02-01T00:00:00+00:00'], [$top[0]['rounds'], $top[0]['seed'], $top[0]['at']]);
        $this->assertSame(0, (int) tankity_db()->query('SELECT COUNT(*) FROM callsigns')->fetchColumn());
        $this->assertSame(0, board_convert_callsigns(), 'nothing is converted twice');
        $this->assertSame([], board_top('easy', 10));
    }

    public function testTheGuardKeepsItsRunsInTheStorageDirectory(): void
    {
        $this->assertNotNull(tankity_guard([], ['HTTP_HOST' => 'localhost', 'REMOTE_ADDR' => '192.0.2.1'], [], fn(): int => 1_000_000, function (): void {})->startRun());
        $this->assertFileExists($this->dir . '/' . TANKITY_GUARD_RUNS);
    }
}
```

Run (in `websites/www.cs`): `vendor/bin/phpunit --testsuite tankity --filter BoardTest`
Expected: FAIL, `Call to undefined function board_file()`.

- [ ] **Step 2: The guard settings**

In `tools/install-files.php`, add `'kit_php' => ['score-guard.php'],` to Tankity's install config array (after `'precache_exclude' => ['fx-editor.*'],`; Plan C Task 1's key), change its header's second line to `// The work is games/_kit/php/install-core.php; this is Tankity's config (it also keeps server/score-guard.php current).`, then run `php tools/install-files.php` to write the copy (`install-files: wrote server/score-guard.php`). The copy needs no new deny rule: `server/.htaccess` already denies the folder, and `docker/nginx/default.conf` already has `location ^~ /games/tankity/server/ { deny all; }`.

`server/guard.php` is a thin wrapper: Tankity's settings for the kit's `Kit\ScoreGuard`, nothing else.

```php
<?php
// games/tankity/server/guard.php
// Tankity's settings for the kit's score guard (server/score-guard.php is the
// generated copy of games/_kit/php/score-guard.php) and the initials nobody may
// file or sit down with. Loaded by rooms.php, scores.php and server/board.php.
declare(strict_types=1);
if (count(get_included_files()) === 1) {
    http_response_code(404);
    exit;
}
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/score-guard.php';

use Kit\ScoreGuard;

// Matched on the uppercase form. src/initials.ts BLOCKED_INITIALS is the same list.
const BLOCKED_INITIALS = [
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
];
// The guard's run tokens and rate stamps, beside the database.
const TANKITY_GUARD_RUNS = 'guard-runs.json';

/* The guard's config keys for Tankity, validated. A solo run's token is spent
   when the run files, hours after it may have started; the run's own expiry
   (solo_runs) is the tighter limit. Tests pass $override (a low limit). */
function tankity_guard_config(array $override = []): array
{
    $hosts = array_values(array_filter(array_map('trim',
        explode(',', (string) tankity_setting('TANKITY_ALLOWED_HOSTS', 'allowed_hosts', 'www.cs.siue.edu,cs.siue.edu')))));
    return ScoreGuard::validateConfig($override + [
        'runTtlSec' => 86400,
        'startsPerHour' => 120,
        'scoresPerHour' => 60,
        'csrfCookie' => 'tankity_csrf',
        'storageKey' => 'operation-tankity',
        'blockedInitials' => BLOCKED_INITIALS,
        'allowedHosts' => $hosts,
    ]);
}

/* The kit's score guard for this request, set up for Tankity: its cookie and
   header, its rate salt and its run store in the storage directory. Tests pass
   the request, a clock and a cookie setter; a page request uses $_SERVER,
   $_COOKIE and the real ones. */
function tankity_guard(array $override = [], ?array $server = null, ?array $cookies = null, ?Closure $clock = null, ?Closure $setCookie = null): ScoreGuard
{
    return new ScoreGuard(
        tankity_guard_config($override),
        'X-Tankity-Csrf',
        'tankity-score-rate-v1',
        $server ?? $_SERVER,
        $cookies ?? $_COOKIE,
        tankity_data_dir() . '/' . TANKITY_GUARD_RUNS,
        $clock,
        $setCookie,
    );
}

/* Initials as filed and seated: three letters typed in either case (spaces
   around them dropped), stored uppercase; null for anything else or a blocked set. */
function tankity_initials(ScoreGuard $guard, mixed $raw): ?string
{
    $initials = ScoreGuard::initials(is_string($raw) ? trim($raw) : $raw);
    return $initials !== null && !$guard->isBlocked($initials) ? $initials : null;
}
```

(The guard sets its store to mode 0666 after each write, which Cylon's shared folder needs; inside Tankity's 0700 directory no other account can reach it.)

Delete the `// Mirrors cylon: ...` comment and the `const BLOCKED_INITIALS = [...]` block from `server/rules.php` (current lines 14–30). In `rooms.php`, before `require_once __DIR__ . '/server/settings.php';` add:

```php
require_once __DIR__ . '/server/guard.php';
require_once __DIR__ . '/server/board.php';
```

and add three lines to its file map comment: `//   server/guard.php     the score guard's settings and the blocked initials`, `//   server/score-guard.php  the kit's score guard (a generated copy; never edit it)` and `//   server/board.php     the boards, one per difficulty`.

In `test/smoke.test.mjs`, replace `const phpFiles = ['rooms.php', ...['settings', 'store', 'sim', 'ai', 'rules', 'protocol'].map(f => `server/${f}.php`)];` with `const phpFiles = ['rooms.php', ...['settings', 'store', 'sim', 'ai', 'rules', 'protocol', 'guard', 'board'].map(f => `server/${f}.php`)];`: the `blocked-parity` check reads the server's list, which now lives in `server/guard.php`.

- [ ] **Step 3: The board table and the boards**

In `server/db.php` add step 2 to `tankity_schema_steps()` after step 1:

```php
        2 => [
            'CREATE TABLE board (id INTEGER PRIMARY KEY AUTOINCREMENT, difficulty TEXT NOT NULL, initials TEXT NOT NULL,
                score INTEGER NOT NULL, rounds INTEGER NOT NULL, seed TEXT NOT NULL, at TEXT NOT NULL)',
            'CREATE INDEX board_rank ON board (difficulty, score DESC, id)',
        ],
```

and change its comment's last sentence to `… each in its own transaction. Step 2 is the boards.`

```php
<?php
// games/tankity/server/board.php
// Operation Tankity's all-time boards, one per difficulty: rows in the board
// table, best first, ties to the older run, the best BOARD_KEEP kept per
// board. Also moves the per-callsign rows from before the boards onto the
// Normal board. Loaded by rooms.php and scores.php; it serves nothing.
declare(strict_types=1);
if (count(get_included_files()) === 1) {
    http_response_code(404);
    exit;
}
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/guard.php';
require_once __DIR__ . '/legacy.php';

use Kit\ScoreGuard;

const BOARD_LEVELS = ['easy', 'normal', 'hard']; // server/ai.php ROOM_DIFFICULTY's levels
const BOARD_KEEP = 100;
const BOARD_SHOW = 20;
const BOARD_STANDIN = 'AAA'; // what a converted name the blocklist refuses becomes

function board_level(mixed $raw): ?string
{
    return is_string($raw) && in_array($raw, BOARD_LEVELS, true) ? $raw : null;
}

/* An old free-text callsign as board initials: the kit guard's coercion
   (letters uppercased, the rest dropped, cut or padded with X to three), and
   the stand-in for a set the guard blocks. */
function board_convert_name(string $name, ScoreGuard $guard): string
{
    $three = ScoreGuard::coerceInitials($name, 'X');
    return $guard->isBlocked($three) ? BOARD_STANDIN : $three;
}

/* Files a run on its difficulty's board: its 1-based place, or null when it
   did not make the best BOARD_KEEP. A board never holds more than that. */
function board_file(array $run): ?int
{
    $level = board_level($run['difficulty'] ?? null);
    if ($level === null) {
        throw new InvalidArgumentException('no such board: ' . var_export($run['difficulty'] ?? null, true));
    }
    return tankity_tx(tankity_db(), function (PDO $db) use ($run, $level): ?int {
        $db->prepare('INSERT INTO board (difficulty, initials, score, rounds, seed, at) VALUES (?, ?, ?, ?, ?, ?)')->execute([
            $level, (string) $run['initials'], (int) $run['score'], (int) $run['rounds'],
            substr((string) $run['seed'], 0, 64), (string) ($run['at'] ?? gmdate('c')),
        ]);
        $id = (int) $db->lastInsertId();
        $q = $db->prepare('SELECT COUNT(*) FROM board WHERE difficulty = ? AND (score > ? OR (score = ? AND id < ?))');
        $q->execute([$level, (int) $run['score'], (int) $run['score'], $id]);
        $place = (int) $q->fetchColumn() + 1;
        $db->prepare('DELETE FROM board WHERE difficulty = ? AND id NOT IN
            (SELECT id FROM board WHERE difficulty = ? ORDER BY score DESC, id LIMIT ?)')->execute([$level, $level, BOARD_KEEP]);
        return $place <= BOARD_KEEP ? $place : null;
    });
}

/* A board's best $n runs with their places. */
function board_top(string $difficulty, int $n): array
{
    $q = tankity_db()->prepare('SELECT initials, score, rounds, seed, at FROM board WHERE difficulty = ? ORDER BY score DESC, id LIMIT ?');
    $q->execute([$difficulty, $n]);
    $out = [];
    foreach ($q->fetchAll(PDO::FETCH_ASSOC) as $i => $r) {
        $out[] = ['initials' => (string) $r['initials'], 'score' => (int) $r['score'], 'rounds' => (int) $r['rounds'],
            'seed' => (string) $r['seed'], 'at' => (string) $r['at'], 'place' => $i + 1];
    }
    return $out;
}

/* Moves up to $limit per-callsign rows onto the Normal board (the only level
   there was): each callsign's best run, its name converted, the row deleted in
   the same transaction, so nothing is converted twice. Answers the rows moved. */
function board_convert_callsigns(int $limit = 200): int
{
    $guard = tankity_guard();
    $q = tankity_db()->prepare('SELECT slug FROM callsigns ORDER BY slug LIMIT ?');
    $q->execute([$limit]);
    $moved = 0;
    foreach ($q->fetchAll(PDO::FETCH_COLUMN) as $slug) {
        tankity_tx(tankity_db(), function (PDO $db) use ($slug, $guard, &$moved): void {
            $d = legacy_read($db, (string) $slug);
            $best = null;
            foreach ($d['runs'] as $r) {
                if (is_array($r) && isset($r['score']) && ($best === null || (int) $r['score'] > (int) $best['score'])) {
                    $best = $r;
                }
            }
            if ($best !== null) {
                board_file(['difficulty' => 'normal', 'initials' => board_convert_name((string) $slug, $guard),
                    'score' => max(0, (int) $best['score']), 'rounds' => max(0, (int) ($best['banked'] ?? 0)),
                    'seed' => (string) ($best['seed'] ?? ''), 'at' => (string) ($best['ts'] ?? '')]);
            }
            $db->prepare('DELETE FROM callsigns WHERE slug = ?')->execute([$slug]);
            $moved++;
        });
    }
    return $moved;
}
```

In `server/housekeep.php` `tankity_jobs()`, after the `legacy` job add `$jobs['callsigns'] = fn(int $now): int => board_convert_callsigns();` (guarded by `if (function_exists('board_convert_callsigns'))`, since housekeeping is loaded before the board in some requests), and change its comment to `/* Every cleanup job this request can run, in order: old files into callsign rows, callsign rows onto the Normal board, then the room sweep where the room library is loaded. */`.

- [ ] **Step 4: Run the suites**

Run (in `websites/www.cs`): `(cd games/tankity && php tools/install-files.php --check && node --test test/smoke.test.mjs) && vendor/bin/phpunit --testsuite tankity`
Expected: PASS, 14 `BoardTest` cases; the smoke test's `blocked-parity` finds the same list in `src/initials.ts` and `server/guard.php`; `DbTest` sees schema version 2.

- [ ] **Step 5: Commit**

```bash
git add games/tankity/server games/tankity/rooms.php games/tankity/tools/install-files.php games/tankity/test/php/BoardTest.php games/tankity/test/smoke.test.mjs
git commit -F- <<'MSG'
Tankity: a board per difficulty in the database; callsign rows move to Normal

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb
MSG
```

### Task 11: Rooms file every human's score on the board

**Files:**
- Modify: `games/tankity/server/rules.php` (`room_end_round`; replace `room_save_score` with `room_file_seat`)
- Modify: `games/tankity/server/protocol.php` (`you.filed`, `you.filedRank`)
- Modify: `games/tankity/src/protocol.ts` (`RoomYou`)
- Regenerate: `games/tankity/protocol/*.json`
- Create: `games/tankity/test/php/RoomFilingTest.php`

**Interfaces:**
- Consumes: Task 10 `board_file`; Task 8 winner; `room_difficulty()` (the difficulty PR).
- Produces: `room_file_seat(array &$room, int $seat): void` (files once per match, on the board of the room's difficulty, `room['filed'][seat] = ?int rank`); snapshot `you.filed: boolean`, `you.filedRank: number | null`.

- [ ] **Step 1: Write the failing test**

```php
<?php
// games/tankity/test/php/RoomFilingTest.php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

/* The server files every room score itself, on the board of the room's
   difficulty: an eliminated human when the last life goes, the winner with the
   bonus when the match ends, each once. */
final class RoomFilingTest extends TestCase
{
    private string $dir;

    public static function setUpBeforeClass(): void
    {
        require_once __DIR__ . '/rooms-lib.php';
    }

    protected function setUp(): void
    {
        $this->dir = tankity_test_dir();
    }

    protected function tearDown(): void
    {
        tankity_test_rm($this->dir);
    }

    private function duel(): array
    {
        $room = room_new('FILE', 'WIN');
        $room['seats'][0] = room_seat_human('WIN', 't0', []);
        $room['seats'][1] = room_seat_human('OUT', 't1', []);
        $room['seats'][2] = room_idle_seat(2, 'ai');
        $room['seats'][3] = room_idle_seat(3, 'open');
        foreach ([0, 1] as $s) {
            room_seat_economy($room, $s);
            $room['seats'][$s]['lives'] = 1;
        }
        room_match_begin($room);
        room_start_round($room);
        $room['scores'][1] = 700;
        foreach ($room['tanks'] as &$t) {
            if ($t['seat'] === 1) {
                $t['hp'] = 0;
            }
        }
        unset($t);
        return $room;
    }

    public function testTheEliminatedAndTheWinnerAreFiled(): void
    {
        $room = $this->duel();
        $events = [];
        room_end_round($room, $events);
        $top = board_top('normal', 10);
        $this->assertSame(['WIN', 'OUT'], array_column($top, 'initials'));
        $this->assertSame($room['scores'][0], $top[0]['score']);
        $this->assertSame('room:FILE', $top[0]['seed']);
        $this->assertSame(1, $room['filed'][0]);
        $this->assertSame(2, $room['filed'][1]);
        $snap = room_snapshot($room, 1, 0);
        $this->assertTrue($snap['you']['filed']);
        $this->assertSame(2, $snap['you']['filedRank']);
    }

    public function testASeatIsFiledOnce(): void
    {
        $room = $this->duel();
        $events = [];
        room_end_round($room, $events);
        room_file_seat($room, 0);
        $this->assertCount(2, board_top('normal', 10));
    }

    public function testAHardRoomFilesOnTheHardBoard(): void
    {
        $room = $this->duel();
        $room['difficulty'] = 'hard';
        $events = [];
        room_end_round($room, $events);
        $this->assertSame(['WIN', 'OUT'], array_column(board_top('hard', 10), 'initials'));
        $this->assertSame([], board_top('normal', 10));
    }

    public function testInitialsAreFiledUppercase(): void
    {
        $room = $this->duel();
        $room['seats'][1]['initials'] = 'out';
        $events = [];
        room_end_round($room, $events);
        $this->assertContains('OUT', array_column(board_top('normal', 10), 'initials'));
    }
}
```

- [ ] **Step 2: Run it to see it fail**

Run (in `websites/www.cs`): `vendor/bin/phpunit --testsuite tankity --filter RoomFilingTest`
Expected: FAIL, `Call to undefined function room_file_seat()`.

- [ ] **Step 3: Implement**

Replace `room_save_score()` in `server/rules.php` (the whole function and its comment, PR 20's version) with:

```php
/* Files a human seat's match score on the board of the room's difficulty,
   once per match. Inside the room's transaction: it commits with the room. */
function room_file_seat(array &$room, int $seat): void
{
    if (array_key_exists($seat, $room['filed'] ?? [])) {
        return;
    }
    $s = $room['seats'][$seat] ?? [];
    try {
        $rank = board_file(['difficulty' => room_difficulty($room), 'initials' => strtoupper((string) ($s['initials'] ?? 'AAA')), 'score' => (int) ($room['scores'][$seat] ?? 0),
            'rounds' => (int) ($room['stats'][$seat]['won'] ?? 0), 'seed' => 'room:' . $room['code']]);
    } catch (RuntimeException $e) {
        error_log('tankity board: ' . $e->getMessage());
        $rank = null;
    }
    $room['filed'][$seat] = $rank;
}
```

In `room_end_round()` replace `                room_save_score($s['initials'], $room['scores'][$idx] ?? 0, $room);` with nothing there, and instead file after the loop (the loop holds `$s` by reference; filing reads the seats): after `unset($s);` add

```php
    foreach ($room['seats'] as $idx => $s) {
        if (($s['human'] ?? false) && ($s['lives'] ?? 0) <= 0 && isset($wrecked[$idx])) {
            room_file_seat($room, $idx);
        }
    }
```

and in Task 8's winner branch, after `$events[] = ['t' => 'matchwin', ...];` add `room_file_seat($room, $w);`.

Rooms no longer file per-callsign runs: delete `LegacyImportTest::testARoomScoreGoesToTheSameCallsign` (PR 20's), whose job `RoomFilingTest` now does.

`server/protocol.php` `you` block, after `'maxArmor' => ...`:

```php
            'filed' => array_key_exists($seat, $room['filed'] ?? []),
            'filedRank' => $room['filed'][$seat] ?? null,
```

`src/protocol.ts` `RoomYou`:

```ts
  /** This seat's match score went on the all-time board; filedRank is its place (null: outside the board). */
  filed: boolean;
  filedRank: number | null;
```

- [ ] **Step 4: Regenerate fixtures, run suites**

Run (in `websites/www.cs`): `make up && make protocol && vendor/bin/phpunit --testsuite tankity && (cd games/tankity && node ../_kit/build/build.mjs tankity)`
Expected: PASS, 4 `RoomFilingTest` cases. (The docker suite's room checks file onto the boards in their private data directory.)

- [ ] **Step 5: Commit**

```bash
git add games/tankity/server games/tankity/src/protocol.ts games/tankity/protocol games/tankity/test/php/RoomFilingTest.php games/tankity/test/php/LegacyImportTest.php games/tankity/dist
git commit -F- <<'MSG'
Tankity rooms: the server files each human's score on the all-time board

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb
MSG
```

### Task 12: Play again in the same room

**Files:**
- Modify: `games/tankity/server/rules.php` (new `room_again`)
- Modify: `games/tankity/rooms.php` (new `again` handler before `ready`)
- Modify: `games/tankity/src/protocol.ts` (`AgainEvent`, `PostBodies.again`, `PostReplies.again`)
- Modify: `games/tankity/src/net.ts` (`ROOM_ANSWERS`, `RoomClient.toLobby()`)
- Create: `games/tankity/test/php/RoomAgainTest.php`

**Interfaces:**
- Produces: `room_again(array &$room): bool` (false while the match is on); action `again` (POST, any seated human, answers `RoomReply`, emits `{t:'again', seat}`); `RoomClient.toLobby(): void` (stops the match poll, keeps the session).

- [ ] **Step 1: Write the failing test**

```php
<?php
// games/tankity/test/php/RoomAgainTest.php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

/* Play again keeps the code and the seats and resets lives, scores and cash:
   the room goes back to its lobby for the host to start. */
final class RoomAgainTest extends TestCase
{
    public static function setUpBeforeClass(): void
    {
        require_once __DIR__ . '/rooms-lib.php';
    }

    private function over(): array
    {
        $room = room_new('AGIN', 'HOS');
        $room['seats'][0] = room_seat_human('HOS', 't0', []);
        $room['seats'][1] = room_seat_human('GST', 't1', []);
        $room['seats'][2] = ['human' => false, 'name' => 'LFT', 'initials' => 'LFT', 'mode' => 'ai', 'bot' => true, 'lives' => 2];
        $room['seats'][3] = room_idle_seat(3, 'open');
        room_seat_economy($room, 0);
        room_seat_economy($room, 1);
        room_match_begin($room);
        room_start_round($room);
        $room['scores'][0] = 4200;
        $room['cash'][0] = 50;
        $room['seats'][0]['lives'] = 1;
        $room['seats'][1]['lives'] = 0;
        $room['plate'][0] = 2;
        $room['phase'] = 'over';
        $room['winner'] = 0;
        $room['difficulty'] = 'hard';
        return $room;
    }

    public function testBackToTheLobbyWithSeatsKept(): void
    {
        $room = $this->over();
        $this->assertTrue(room_again($room));
        $this->assertSame('lobby', $room['phase']);
        $this->assertSame('AGIN', $room['code']);
        $this->assertSame('hard', room_difficulty($room), 'the host chose the drones\' aim for the room, not the match');
        $this->assertSame('HOS', $room['seats'][0]['initials']);
        $this->assertSame('t1', $room['seats'][1]['token']);
        $this->assertSame([3, 3], [$room['seats'][0]['lives'], $room['seats'][1]['lives']]);
        $this->assertSame([0, 0], [$room['scores'][0], $room['scores'][1]]);
        $this->assertSame([600, 600], [$room['cash'][0], $room['cash'][1]]);
        $this->assertSame(0, $room['plate'][0]);
        $this->assertSame(100, $room['armor'][0]);
        $this->assertSame(0, $room['round']);
        $this->assertSame([], $room['tanks']);
        $this->assertNull($room['winner']);
    }

    public function testALeaversSeatGoesBackToTheBattery(): void
    {
        $room = $this->over();
        room_again($room);
        $this->assertFalse($room['seats'][2]['human']);
        $this->assertArrayNotHasKey('bot', $room['seats'][2]);
        $this->assertSame('ai', $room['seats'][2]['mode']);
    }

    public function testASecondPressIsHarmlessAndAMatchInPlayRefuses(): void
    {
        $room = $this->over();
        room_again($room);
        $this->assertTrue(room_again($room));
        $playing = $this->over();
        $playing['phase'] = 'play';
        $this->assertFalse(room_again($playing));
    }
}
```

- [ ] **Step 2: Run it to see it fail**

Run (in `websites/www.cs`): `vendor/bin/phpunit --testsuite tankity --filter RoomAgainTest`
Expected: FAIL, `Call to undefined function room_again()`.

- [ ] **Step 3: Implement**

`server/rules.php`, after `room_leave()`:

```php
/* Play again (same room): back to the lobby with the same code and seats, every
   human on fresh lives, score and cash. The room's map and Difficulty stay (the
   host chose them at create). A seat a player left goes back to the battery.
   Pressed twice (two players at once), the second press finds the lobby and
   changes nothing. False while the match is still on. */
function room_again(array &$room): bool
{
    if ($room['phase'] === 'lobby') {
        return true;
    }
    if ($room['phase'] !== 'over') {
        return false;
    }
    foreach (['plate', 'armor', 'shield', 'jammer', 'bunker', 'laststand', 'fuelBonus', 'fuelApplied', 'tactic', 'stats', 'filed', 'menu', 'shop', 'pace', 'clock'] as $k) {
        unset($room[$k]);
    }
    foreach ($room['seats'] as $idx => $s) {
        if ($s['human'] ?? false) {
            $room['seats'][$idx]['lives'] = 3;
            room_seat_economy($room, $idx);
        } elseif (!empty($s['bot'])) {
            $room['seats'][$idx] = room_idle_seat($idx);
        }
    }
    $room['winner'] = null;
    $room['startHumans'] = 0;
    $room['phase'] = 'lobby';
    $room['round'] = 0;
    $room['tanks'] = [];
    $room['terrain'] = [];
    room_terrain_changed($room);
    return true;
}
```

`rooms.php`, before the `ready` handler's comment:

```php
/* Play again (same room): anyone seated may press it once the match is over. */
if ($action === 'again' && $method === 'POST') {
    [$room, $fh, $path, $seat] = room_gate($body, true, false);
    if (!room_again($room)) {
        room_unlock($fh);
        room_json_out(409, ['error' => 'the match is still on']);
    }
    room_emit($room, ['t' => 'again', 'seat' => $seat]);
    if (!room_save($fh, $path, $room)) {
        room_unlock($fh);
        room_json_out(500, ['error' => 'store write failed']);
    }
    $out = room_reply_snapshot($room, $seat, $body);
    room_unlock($fh);
    room_json_out(200, ['ok' => true, 'room' => $out]);
}
```

`src/protocol.ts`: after `LeftEvent` add `export interface AgainEvent extends EventBase { t: 'again'; seat: number }`, add `| AgainEvent` to `RoomEvent`, `again: Record<string, never>;` to `PostBodies`, and `again: RoomReply;` to `PostReplies`.

`src/net.ts`: `ROOM_ANSWERS` gains `'again'`; in `RoomClient`, after `stopPolling()`:

```ts
  /** The room went back to its lobby (Play again): the match poll stops and the
   * session stays, so the lobby can watch the room. */
  toLobby(): void {
    this.stopPolling();
    this.on = false;
    this.synced = false;
  }
```

- [ ] **Step 4: Run the suites**

Run (in `websites/www.cs`): `make up && make protocol && vendor/bin/phpunit --testsuite tankity && (cd games/tankity && node ../_kit/build/build.mjs tankity && node --test test/net.test.mjs)`
Expected: PASS; `make protocol` leaves `protocol/*.json` as the difficulty PR and Tasks 9 and 11 wrote them (each snapshot's `difficulty` included), since `again` changes no snapshot shape.

- [ ] **Step 5: Commit**

```bash
git add games/tankity/server/rules.php games/tankity/rooms.php games/tankity/src/protocol.ts games/tankity/src/net.ts games/tankity/test/php/RoomAgainTest.php games/tankity/dist
git commit -F- <<'MSG'
Tankity rooms: Play again keeps the room and its seats

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb
MSG
```

### Task 13: The match-end rule in TypeScript, pinned by sim vectors

**Files:**
- Create: `games/tankity/src/standings.ts` (rule part)
- Create: `games/tankity/test/standings.test.mjs`
- Modify: `games/tankity/tsconfig.json` (`files` + `src/standings.ts`)
- Modify: `games/tankity/protocol/sim-vectors.php`, `games/tankity/test/sim-vectors.test.mjs`, regenerate `sim-vectors.json`

**Interfaces:**
- Consumes: `RoomSeat` (Task 9), `TUNE` from `sim.ts`.
- Produces: `matchOutcome(seats: readonly Pick<RoomSeat, 'seat' | 'human' | 'lives'>[], startHumans: number): { over: boolean; winner: number | null }`; `winnerBonus(round: number): number`; vector group `match-end` (input `{ lives: (number|null)[], startHumans, round }`, `null` = a drone seat; output `{ over, winner, bonus }`).

- [ ] **Step 1: Write the failing test**

```js
// games/tankity/test/standings.test.mjs
// This match's scoreboards (src/standings.ts): the room's match-end rule first.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { matchOutcome, winnerBonus } from '../src/standings.ts';

const seats = (...lives) => lives.map((l, seat) => ({ seat, human: l !== null, lives: l ?? 0 }));

test('one human plays like solo: over only when the last life goes', () => {
  assert.deepEqual(matchOutcome(seats(2, null, null, null), 1), { over: false, winner: null });
  assert.deepEqual(matchOutcome(seats(0, null, null, null), 1), { over: true, winner: null });
});

test('two or more humans: the last one with lives wins', () => {
  assert.deepEqual(matchOutcome(seats(1, 0, null, null), 2), { over: true, winner: 0 });
  assert.deepEqual(matchOutcome(seats(0, 0, 2, null), 3), { over: true, winner: 2 });
  assert.deepEqual(matchOutcome(seats(1, 1, 0, null), 3), { over: false, winner: null });
});

test('nobody left: over with no winner', () => {
  assert.deepEqual(matchOutcome(seats(0, 0, null, null), 2), { over: true, winner: null });
});

test("the winner's bonus is twice the round bonus", () => {
  assert.equal(winnerBonus(1), 1800);
  assert.equal(winnerBonus(9), 2 * (750 + 9 * 150));
});
```

Run (in `games/tankity`): `node --test test/standings.test.mjs`
Expected: FAIL, module not found.

- [ ] **Step 2: Implement the rule**

```ts
// games/tankity/src/standings.ts
/* Operation Tankity: this match's scoreboards.
 *
 * The room's match-end rule and the winner's bonus (server/rules.php
 * room_match_outcome() is the same, pinned by the 'match-end' sim vectors),
 * and the rows the scoreboards show. Pure: seats and rounds in, rows out. */
import type { RoomSeat } from './protocol.ts';
import { TUNE } from './sim.ts';

/** No human with a life left ends the match with no winner; in a room that
 * started with two or more humans, exactly one left ends it, and wins. */
export function matchOutcome(seats: readonly Pick<RoomSeat, 'seat' | 'human' | 'lives'>[], startHumans: number): { over: boolean; winner: number | null } {
  const left = seats.filter(s => s.human && s.lives > 0).map(s => s.seat);
  if (!left.length) return { over: true, winner: null };
  if (startHumans >= 2 && left.length === 1) return { over: true, winner: left[0]! };
  return { over: false, winner: null };
}

/** Twice the round bonus of the round the match ended in. */
export function winnerBonus(round: number): number {
  return 2 * (TUNE.roundWinScore + round * 150);
}
```

Add `"src/standings.ts"` to `tsconfig.json`'s `files`.

- [ ] **Step 3: The vectors**

In `protocol/sim-vectors.php`, after Task 4's armor group:

```php
/* ---- the room match ends on the last human standing ----
 * lives per seat (null: a drone seat), how many humans started, the round. */
$matchEnd = function (string $name, array $lives, int $startHumans, int $round) use ($add): void {
    $room = ['seats' => [], 'startHumans' => $startHumans];
    foreach ($lives as $i => $l) {
        $room['seats'][$i] = $l === null ? ['human' => false, 'lives' => 0] : ['human' => true, 'lives' => $l];
    }
    $o = room_match_outcome($room);
    $add('match-end', $name, ['lives' => $lives, 'startHumans' => $startHumans, 'round' => $round],
        ['over' => $o['over'], 'winner' => $o['winner'], 'bonus' => room_winner_bonus($round)]);
};
$matchEnd('one-human-alive-plays-on', [2, null, null, null], 1, 3);
$matchEnd('one-human-out-ends', [0, null, null, null], 1, 5);
$matchEnd('last-of-two-wins', [1, 0, null, null], 2, 4);
$matchEnd('last-of-three-wins-after-a-double-out', [2, 0, 0, null], 3, 7);
$matchEnd('two-of-three-play-on', [1, 1, 0, null], 3, 2);
$matchEnd('last-two-fall-together', [0, 0, null, null], 2, 6);
$matchEnd('a-leaver-counts-as-out', [3, null, null, null], 2, 3);
```

In `test/sim-vectors.test.mjs` add `const standings = await import(pathToFileURL(path.join(dir, 'src', 'standings.ts')).href);` and to `RUN`:

```js
  'match-end'(c) {
    const seats = c.lives.map((l, seat) => ({ seat, human: l !== null, lives: l ?? 0 }));
    const o = standings.matchOutcome(seats, c.startHumans);
    return { over: o.over, winner: o.winner, bonus: standings.winnerBonus(c.round) };
  },
```

- [ ] **Step 4: Run both sides**

Run (in `games/tankity`): `php protocol/sim-vectors.php && node --test test/standings.test.mjs test/sim-vectors.test.mjs && node ../_kit/build/build.mjs tankity`
Expected: PASS. `sim-vectors.json` is regenerated on top of the difficulty PR's per-level aim and bracket cases and Task 4's `armor` group; all of them stay green beside `match-end`.

- [ ] **Step 5: Commit**

```bash
git add games/tankity/src/standings.ts games/tankity/test/standings.test.mjs games/tankity/tsconfig.json games/tankity/protocol/sim-vectors.php games/tankity/protocol/sim-vectors.json games/tankity/test/sim-vectors.test.mjs
git commit -F- <<'MSG'
Tankity: the match-end rule in the browser, pinned to the server by vectors

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb
MSG
```

### Task 14: Scoreboard rows

**Files:**
- Modify: `games/tankity/src/standings.ts`
- Modify: `games/tankity/test/standings.test.mjs`

**Interfaces:**
- Consumes: `RoomSnapshot`, `RoomSeat` (Task 9).
- Produces: `fmt(n: number): string` ("8,420"); `BOARD_KEEP = 100`; `filedLine(rank: number | null, score: number, difficulty: Difficulty): string` ("Filed · #12 all-time on Normal"); `interface SoloRound { round: number; won: boolean; points: number; kills: number; cash: number; lives: number }`; `interface BoardRow { place: number; name: string; you: boolean; crown: boolean; out: boolean; score: number; gain: string; won: number; kills: number; last: string }`; `type Board = { kind: 'room'; caption: string; title: string; lastHead: 'Lives' | 'Out in'; rows: BoardRow[] } | { kind: 'solo'; caption: string; title: string; rows: SoloRound[]; total: { points: number; kills: number } }`; `type RoomCard = 'shop' | 'over' | 'out' | 'peek'`; `roomBoard(room: Pick<RoomSnapshot, 'code' | 'round' | 'seats' | 'winner'>, mySeat: number, card: RoomCard, roundTo: string): Board`; `soloBoard(rounds: readonly SoloRound[], card: 'shop' | 'over'): Board`.

- [ ] **Step 1: Write the failing tests**

Append to `test/standings.test.mjs`:

```js
import { BOARD_KEEP, filedLine, fmt, roomBoard, soloBoard } from '../src/standings.ts';

const seat = (s, name, o) => ({ seat: s, human: true, name, mode: 'human', bot: false, ready: false, lives: 2, score: 0, roundsWon: 0, kills: 0, gain: 0, out: null, ...o });
const ROOM = {
  code: 'ABCD', round: 6, winner: null,
  seats: [
    seat(0, 'AK', { score: 6105, gain: 380, roundsWon: 2, kills: 8, lives: 1 }),
    seat(1, 'WG', { score: 8420, gain: 1650, roundsWon: 3, kills: 11 }),
    seat(2, 'JR', { score: 3940, roundsWon: 1, kills: 4, lives: 0, out: 5 }),
    { seat: 3, human: false, name: 'reaper', mode: 'ai', bot: false, ready: false, lives: 0, score: 0, roundsWon: 0, kills: 0, gain: 0, out: null },
  ],
};

test('numbers read with thousands separators', () => {
  assert.equal(fmt(8420), '8,420');
  assert.equal(fmt(98760), '98,760');
});

test('after a round: humans only, by score, with this round\'s gain and lives or the round they went out', () => {
  const b = roomBoard(ROOM, 0, 'shop', 'WG');
  assert.equal(b.kind, 'room');
  assert.equal(b.caption, 'Room ABCD · after round 6');
  assert.equal(b.title, 'Round 6 to WG');
  assert.equal(b.lastHead, 'Lives');
  assert.deepEqual(b.rows.map(r => [r.place, r.name, r.gain, r.last, r.you, r.out]), [
    [1, 'WG', '+1,650', '♥ 2', false, false],
    [2, 'AK', '+380', '♥ 1', true, false],
    [3, 'JR', '', 'out in round 5', false, true],
  ]);
});

test('match over: the winner is crowned and the last column says when each went out', () => {
  const over = { ...ROOM, round: 9, winner: 1, seats: ROOM.seats.map(s => s.seat === 0 ? { ...s, lives: 0, out: 9 } : s.seat === 1 ? { ...s, gain: 2000 } : s) };
  const b = roomBoard(over, 0, 'over', 'WG');
  assert.equal(b.caption, 'Room ABCD · match over after round 9');
  assert.equal(b.title, '♛ WG wins: last tank standing');
  assert.equal(b.lastHead, 'Out in');
  assert.deepEqual(b.rows.map(r => [r.name, r.crown, r.gain, r.last]), [
    ['WG', true, '+2,000 win', '♥ 2'], ['AK', false, '', 'round 9'], ['JR', false, '', 'round 5'],
  ]);
  const nobody = roomBoard({ ...over, winner: null }, 0, 'over', 'the battery');
  assert.equal(nobody.title, 'Match over: the battery holds the hills');
});

test("you're out, and a peek while playing", () => {
  assert.equal(roomBoard(ROOM, 2, 'out', 'WG').title, "You're out");
  assert.equal(roomBoard(ROOM, 0, 'peek', 'WG').title, 'Standings');
});

test('solo: the rounds so far, with a total', () => {
  const rounds = [
    { round: 1, won: true, points: 1020, kills: 3, cash: 600, lives: 3 },
    { round: 2, won: false, points: 240, kills: 1, cash: 0, lives: 2 },
  ];
  const b = soloBoard(rounds, 'shop');
  assert.equal(b.kind, 'solo');
  assert.equal(b.caption, 'Solo · after round 2');
  assert.equal(b.title, 'Round 2 lost');
  assert.deepEqual(b.total, { points: 1260, kills: 4 });
  assert.equal(soloBoard(rounds.slice(0, 1), 'shop').title, 'Round 1 cleared');
  assert.equal(soloBoard(rounds, 'over').caption, 'Solo · match over after round 2');
});

test('the filed line', () => {
  assert.equal(filedLine(12, 9210, 'normal'), 'Filed · #12 all-time on Normal');
  assert.equal(filedLine(null, 40, 'hard'), `Filed · 40 pts, outside the all-time top ${BOARD_KEEP} on Hard`);
});
```

Run (in `games/tankity`): `node --test test/standings.test.mjs`
Expected: FAIL, `roomBoard` is not exported.

- [ ] **Step 2: Implement**

Append to `src/standings.ts` (and add `RoomSnapshot` and `Difficulty` to the type imports, and `import { DIFFICULTY_NAMES } from './difficulty.ts';`):

```ts
/** "8,420". */
export function fmt(n: number): string {
  return Math.round(n).toLocaleString('en-US');
}

/** server/board.php BOARD_KEEP: the runs each difficulty's board keeps. */
export const BOARD_KEEP = 100;

/** Where a run went: its place on its difficulty's board. */
export function filedLine(rank: number | null, score: number, difficulty: Difficulty): string {
  const on = DIFFICULTY_NAMES[difficulty];
  return rank !== null ? `Filed · #${rank} all-time on ${on}` : `Filed · ${fmt(score)} pts, outside the all-time top ${BOARD_KEEP} on ${on}`;
}

/** One finished solo round. */
export interface SoloRound { round: number; won: boolean; points: number; kills: number; cash: number; lives: number }

/** One player in a room's scoreboard. `gain` is this round's ("+1,650", "+2,000 win", or ""); `last` fills the Lives / Out in column. */
export interface BoardRow {
  place: number; name: string; you: boolean; crown: boolean; out: boolean;
  score: number; gain: string; won: number; kills: number; last: string;
}

export type Board =
  | { kind: 'room'; caption: string; title: string; lastHead: 'Lives' | 'Out in'; rows: BoardRow[] }
  | { kind: 'solo'; caption: string; title: string; rows: SoloRound[]; total: { points: number; kills: number } };

/** After a round (top of the shop), the match over, you're out, or a look from the menu. */
export type RoomCard = 'shop' | 'over' | 'out' | 'peek';

export function roomBoard(room: Pick<RoomSnapshot, 'code' | 'round' | 'seats' | 'winner'>, mySeat: number, card: RoomCard, roundTo: string): Board {
  const over = card === 'over';
  const winner = room.winner;
  const rows = room.seats
    .filter(s => s.human)
    .sort((a, b) => b.score - a.score || a.seat - b.seat)
    .map((s, i): BoardRow => {
      const crown = over && s.seat === winner;
      const gain = s.gain ? `+${fmt(s.gain)}${crown ? ' win' : ''}` : '';
      const alive = s.lives > 0;
      const last = over
        ? (crown || (alive && s.out === null) ? `♥ ${s.lives}` : `round ${s.out ?? room.round}`)
        : (alive ? `♥ ${s.lives}` : `out in round ${s.out ?? room.round}`);
      return { place: i + 1, name: s.name, you: s.seat === mySeat, crown, out: !alive, score: s.score, gain, won: s.roundsWon, kills: s.kills, last };
    });
  const champ = room.seats.find(s => s.seat === winner);
  const caption = over ? `Room ${room.code} · match over after round ${room.round}`
    : card === 'shop' ? `Room ${room.code} · after round ${room.round}` : `Room ${room.code} · round ${room.round}`;
  const title = card === 'shop' ? `Round ${room.round} to ${roundTo}`
    : card === 'out' ? "You're out"
    : card === 'peek' ? 'Standings'
    : champ ? `♛ ${champ.name} wins: last tank standing` : 'Match over: the battery holds the hills';
  return { kind: 'room', caption, title, lastHead: over ? 'Out in' : 'Lives', rows };
}

export function soloBoard(rounds: readonly SoloRound[], card: 'shop' | 'over'): Board {
  const last = rounds[rounds.length - 1];
  const n = last ? last.round : 0;
  return {
    kind: 'solo',
    caption: card === 'over' ? `Solo · match over after round ${n}` : `Solo · after round ${n}`,
    title: card === 'over' || !last ? '' : `Round ${n} ${last.won ? 'cleared' : 'lost'}`,
    rows: [...rounds],
    total: { points: rounds.reduce((a, r) => a + r.points, 0), kills: rounds.reduce((a, r) => a + r.kills, 0) },
  };
}
```

- [ ] **Step 3: Run**

Run (in `games/tankity`): `node --test test/standings.test.mjs && node ../_kit/build/build.mjs tankity`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add games/tankity/src/standings.ts games/tankity/test/standings.test.mjs
git commit -F- <<'MSG'
Tankity: scoreboard rows for rooms and solo

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb
MSG
```

### Task 15: The scoreboard component, and its place at the top of the shop

**Files:**
- Create: `games/tankity/src/ui/standings.tsx`
- Modify: `games/tankity/src/ui/shop.tsx` (`ShopProps.board`, render)
- Modify: `games/tankity/src/tsconfig.dom.json` (`files` + `ui/standings.tsx`)
- Modify: `games/tankity/game.css` (board styles)
- Create: `games/tankity/test/standings-ui.test.mjs`
- Modify: `games/tankity/test/ui.test.mjs` (`shopProps()` gains `board: null`)

**Interfaces:**
- Consumes: Task 14 `Board`, `fmt`.
- Produces: `Standings({ board }: { board: Board }): JSX`; `ShopProps.board: Board | null` (drawn above `#shop-cash`).

- [ ] **Step 1: Write the failing tests**

`test/standings-ui.test.mjs`:

```js
// games/tankity/test/standings-ui.test.mjs
// The scoreboard component (src/ui/standings.tsx): a room's players, then a
// solo run's rounds, rendered into the kit's DOM stub.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { h, render } from 'preact';
import { document, makeEl } from '../../_kit/test/dom-stub.mjs';
import { importTsx } from '../../_kit/test/tsx.ts';

globalThis.document = document;
const { standings } = await importTsx(import.meta.dirname, { standings: '../src/ui/standings.tsx' });
const { Standings } = standings;
const walk = (el, out = []) => { for (const c of el.children || []) { if (c.nodeType === 1) { out.push(c); walk(c, out); } } return out; };
const hasClass = (el, name) => String(el.className || '').split(' ').includes(name);
const byClass = (el, name) => walk(el).filter(n => hasClass(n, name));

const ROOM = {
  kind: 'room', caption: 'Room ABCD · after round 6', title: 'Round 6 to WG', lastHead: 'Lives',
  rows: [
    { place: 1, name: 'WG', you: false, crown: false, out: false, score: 8420, gain: '+1,650', won: 3, kills: 11, last: '♥ 2' },
    { place: 2, name: 'AK', you: true, crown: false, out: false, score: 6105, gain: '', won: 2, kills: 8, last: '♥ 1' },
    { place: 3, name: 'JR', you: false, crown: false, out: true, score: 3940, gain: '', won: 1, kills: 4, last: 'out in round 5' },
  ],
};
const SOLO = {
  kind: 'solo', caption: 'Solo · after round 2', title: 'Round 2 lost',
  rows: [{ round: 1, won: true, points: 1020, kills: 3, cash: 600, lives: 3 }, { round: 2, won: false, points: 240, kills: 1, cash: 0, lives: 2 }],
  total: { points: 1260, kills: 4 },
};

test('a room board: the heads, your row and an out row marked, the YOU badge, score with its gain', () => {
  const host = makeEl('div');
  render(h(Standings, { board: ROOM }), host);
  const table = walk(host).find(n => n.localName === 'table');
  assert.deepEqual(walk(table).filter(n => n.localName === 'th').map(n => n.textContent), ['#', 'Player', 'Score', 'Rounds', 'Kills', 'Lives']);
  const trs = walk(table).filter(n => n.localName === 'tr').slice(1);
  assert.equal(trs.length, 3);
  assert.ok(hasClass(trs[1], 'me'));
  assert.ok(hasClass(trs[2], 'out'));
  assert.equal(byClass(trs[1], 'you').length, 1);
  assert.equal(byClass(trs[0], 'you').length, 0);
  assert.equal(walk(trs[0]).filter(n => n.localName === 'td')[2].textContent, '8,420+1,650');
  assert.equal(byClass(host, 'kicker')[0].textContent, 'Room ABCD · after round 6');
  assert.equal(byClass(host, 'board-title')[0].textContent, 'Round 6 to WG');
});

test('a solo board: its rounds, then the total', () => {
  const host = makeEl('div');
  render(h(Standings, { board: SOLO }), host);
  assert.deepEqual(walk(host).filter(n => n.localName === 'th').map(n => n.textContent), ['Round', 'Points', 'Kills', 'Cash', 'Lives']);
  const foot = walk(host).find(n => n.localName === 'tfoot');
  assert.ok(foot);
  assert.match(foot.textContent, /^Total1,2604/);
});
```

In `test/ui.test.mjs`, add `board: null,` to the props `shopProps()` builds (every shop check there renders through it, or through `props` from it); the shop's existing checks stay there unchanged.

Run (in `games/tankity`): `node --test test/standings-ui.test.mjs`
Expected: FAIL (cannot resolve `../src/ui/standings.tsx`).

- [ ] **Step 2: The component**

```tsx
// games/tankity/src/ui/standings.tsx
/* This match's scoreboard: a room's players by score, or a solo run's rounds.
 * The shop shows it after every round; the end card and the you're-out card
 * show it too. The game hands in finished rows; this lays them out.
 * Copyright (C) 2026 William Grim
 * SPDX-License-Identifier: GPL-3.0-or-later */
import { fmt } from '../standings.ts';
import type { Board } from '../standings.ts';

type RoomBoard = Extract<Board, { kind: 'room' }>;
type SoloBoard = Extract<Board, { kind: 'solo' }>;

function RoomTable({ board }: { board: RoomBoard }) {
  return (
    <table class="board-table">
      <thead><tr><th>#</th><th>Player</th><th class="n">Score</th><th class="n">Rounds</th><th class="n">Kills</th><th class="n">{board.lastHead}</th></tr></thead>
      <tbody>
        {board.rows.map(r => (
          <tr key={r.name} class={[r.you ? 'me' : '', r.out ? 'out' : ''].filter(Boolean).join(' ') || undefined}>
            <td>{r.place}</td>
            <td><span class="pl">{r.name}</span>{r.crown && <span class="crown" aria-label="winner"> ♛</span>}{r.you && <span class="you">YOU</span>}</td>
            <td class="n">{fmt(r.score)}{r.gain && <span class="delta">{r.gain}</span>}</td>
            <td class="n">{r.won}</td>
            <td class="n">{r.kills}</td>
            <td class="n">{r.last}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function SoloTable({ board }: { board: SoloBoard }) {
  return (
    <table class="board-table">
      <thead><tr><th>Round</th><th class="n">Points</th><th class="n">Kills</th><th class="n">Cash</th><th class="n">Lives</th></tr></thead>
      <tbody>
        {board.rows.map(r => (
          <tr key={r.round} class={r.won ? undefined : 'out'}>
            <td>{r.round}</td><td class="n">{fmt(r.points)}</td><td class="n">{r.kills}</td>
            <td class="n">{`+$${fmt(r.cash)}`}</td><td class="n">{`♥ ${r.lives}`}</td>
          </tr>
        ))}
      </tbody>
      <tfoot><tr><td>Total</td><td class="n">{fmt(board.total.points)}</td><td class="n">{board.total.kills}</td><td /><td /></tr></tfoot>
    </table>
  );
}

export function Standings({ board }: { board: Board }) {
  return (
    <section class="board" aria-label="Standings">
      {board.caption && <div class="kicker">{board.caption}</div>}
      {board.title && <h3 class="board-title">{board.title}</h3>}
      {board.kind === 'room' ? <RoomTable board={board} /> : <SoloTable board={board} />}
    </section>
  );
}
```

`src/ui/shop.tsx`: `import { Standings } from './standings.tsx'; import type { Board } from '../standings.ts';`, add to `ShopProps`:

```ts
  /** This match's scoreboard, at the top of the shop after every round; null before the first. */
  board: Board | null;
```

and in `Shop()` render `{p.board && <Standings board={p.board} />}` right before `<p id="shop-cash" ...>`.

Add `"ui/standings.tsx"` to `src/tsconfig.dom.json`'s `files`.

`game.css`, after the `.runstats` rule:

```css
/* This match's scoreboard (src/ui/standings.tsx). */
.board { margin: 0 0 10px; }
.board .kicker { font-size: 0.7rem; letter-spacing: 0.14em; color: var(--dim); text-transform: uppercase; }
.board-title { margin: 2px 0 8px; font-size: 1.1rem; color: var(--gold, #ffc93c); }
.board-table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
.board-table th { text-align: left; font-size: 0.62rem; letter-spacing: 0.1em; color: var(--dim); font-weight: 600; padding: 3px 4px; border-bottom: 1px solid #3a3fb0; }
.board-table td { padding: 5px 4px; border-bottom: 1px solid #1b2050; white-space: nowrap; }
.board-table .n { text-align: right; }
.board-table tr.me td { background: #141a46; }
.board-table tr.out td { color: #7d84a8; }
.board-table .pl { font-weight: 800; }
.board-table .you { font-size: 0.6rem; color: #111; background: var(--gold, #ffc93c); border-radius: 4px; padding: 1px 4px; margin-left: 4px; }
.board-table .delta { color: #7f7; font-size: 0.66rem; margin-left: 3px; }
.board-table .crown { color: var(--gold, #ffc93c); }
.board-table tfoot td { font-weight: 800; border-bottom: 0; }
```

- [ ] **Step 3: Run**

Run (in `games/tankity`): `node ../_kit/build/build.mjs tankity && node --test test/standings-ui.test.mjs test/ui.test.mjs`
Expected: PASS (the shop's existing checks are unchanged with `board: null`).

- [ ] **Step 4: Commit**

```bash
git add games/tankity/src/ui games/tankity/src/tsconfig.dom.json games/tankity/game.css games/tankity/test/standings-ui.test.mjs games/tankity/test/ui.test.mjs games/tankity/dist
git commit -F- <<'MSG'
Tankity: the scoreboard component, at the top of the shop

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb
MSG
```

### Task 16: Solo rounds table and the shop's board

**Files:**
- Modify: `games/tankity/src/game-types.ts` (`GameState.rounds`, `roundStart`; `MatchState.roundTo`, `out`, `outShown`, `lastRoom`)
- Modify: `games/tankity/src/main.ts` (`G` and `MATCH` init; `createShop` deps)
- Modify: `games/tankity/src/match.ts` (`resetMatch`, `newRound`, `settle`, new `recordRound`, `soloShopBoard`)
- Modify: `games/tankity/src/room.ts` (`netEvent` roundwin/roundlost, `netAdopt` keeps `lastRoom`, new `roomShopBoard`)
- Modify: `games/tankity/src/shop.ts` (`ShopDeps.board`, `renderShop`)

**Interfaces:**
- Consumes: Tasks 14–15.
- Produces: `G.rounds: SoloRound[]`, `G.roundStart: { score: number; cash: number }`; `MATCH.roundTo: string`, `MATCH.out: boolean`, `MATCH.outShown: boolean`, `MATCH.lastRoom: RoomSnapshot | null`; `soloShopBoard(): Board | null` (match.ts); `roomShopBoard(): Board | null` (room.ts); `ShopDeps.board(): Board | null`.

- [ ] **Step 1: State**

`src/game-types.ts`: `import type { SoloRound } from './standings.ts';` and in `GameState`:

```ts
  rounds: SoloRound[]; // this solo match's finished rounds, for its scoreboard
  roundStart: { score: number; cash: number }; // score and cash when this round began
```

and in `MatchState`:

```ts
  roundTo: string; // who took the last round: a seat's name, or "the battery"
  out: boolean; // this seat lost its last life this match
  outShown: boolean; // the you're-out card has been shown
  lastRoom: RoomSnapshot | null; // the last snapshot adopted, for the scoreboards
```

`src/main.ts`: `G` initialiser adds `rounds: [], roundStart: { score: 0, cash: 0 },`; `MATCH` initialiser adds `roundTo: '', out: false, outShown: false, lastRoom: null,`.

- [ ] **Step 2: Solo rounds**

`src/match.ts`: `import { soloBoard } from './standings.ts'; import type { Board } from './standings.ts';`. In `resetMatch()` after `G.cash = 600;` add `G.rounds = []; G.roundStart = { score: 0, cash: 600 };`. In `newRound()` after `G.firstTurn++;` add `G.roundStart = { score: G.score, cash: G.cash };`. Add above `settle()`:

```ts
  /* One line of the solo scoreboard: what the round just ended paid. */
  function recordRound(won: boolean): void {
    G.rounds.push({
      round: G.round, won,
      points: G.score - G.roundStart.score,
      kills: me().kills || 0,
      cash: G.cash - G.roundStart.cash,
      lives: G.lives,
    });
  }
  /* The shop's scoreboard in a solo match: the rounds so far. */
  function soloShopBoard(): Board | null {
    return G.rounds.length ? soloBoard(G.rounds, 'shop') : null;
  }
```

In `settle()`'s non-demo lost branch, after `if (G.lives <= 0) { G.lives = 0;` call `recordRound(false);` before `endMatch(...)`, and in its `else {` (lives left) branch call `recordRound(false);` first. In the round-won branch call `recordRound(true);` after `G.cash += prize;`. Add `soloShopBoard` to `createMatch`'s returned object.

- [ ] **Step 3: Room rounds**

`src/room.ts`: `import { roomBoard } from './standings.ts'; import type { Board } from './standings.ts';`. In `netEvent()` at the top of the `roundwin` branch add `MATCH.roundTo = seatName(e.seat);` and at the top of the `roundlost` branch `MATCH.roundTo = 'the battery';`. In `netAdopt()` after `net.seats = room.seats || [];` add `MATCH.lastRoom = room;`. Add:

```ts
  /* The shop's scoreboard in a room: everyone's match after the round just ended. */
  function roomShopBoard(): Board | null {
    return MATCH.lastRoom && MATCH.lastRoom.round > 0 ? roomBoard(MATCH.lastRoom, net.seat, 'shop', MATCH.roundTo || 'the battery') : null;
  }
```

and return it from `createRoom`.

- [ ] **Step 4: The shop draws it**

`src/shop.ts`: `import type { Board } from './standings.ts';`, `ShopDeps` gains `board(): Board | null;` (destructure it in `createShop`), and the `drawShop(veil, {` props gain `board: G.phase === 'shop' ? board() : null,`.

`src/main.ts` `createShop({...})` deps add `board: () => (net.on ? roomShopBoard() : soloShopBoard()),` and destructure `soloShopBoard` from `createMatch` and `roomShopBoard` from `createRoom` (both are wired before the shop is first drawn; the arrow defers the lookup).

- [ ] **Step 5: Run**

Run (in `games/tankity`): `node ../_kit/build/build.mjs tankity && node --test 'test/*.test.mjs'`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add games/tankity/src games/tankity/dist
git commit -F- <<'MSG'
Tankity: the shop opens under this match's scoreboard, solo and rooms

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb
MSG
```

### Task 17: The end card: scoreboard, filed line, and its buttons

**Files:**
- Modify: `games/tankity/src/ui/endveil.tsx` (props and render; Plan C Task 13's version)
- Modify: `games/tankity/src/match.ts` (`EndState`, `END`, `renderEndVeil`, `endMatch`, `MatchDeps`)
- Create: `games/tankity/test/endveil.test.mjs`
- Modify: `games/tankity/test/ui.test.mjs` (delete the end-veil block)

**Interfaces:**
- Consumes: Task 15 `Standings`; Plan C Task 13's `MatchDeps.backToTitle()` and its solo **Continue** button.
- Produces: `EndVeilProps = { keyHint; kicker; title; text; score; board: Board | null; filed: string | null; buttons: 'solo' | 'over' | 'out' | 'peek'; onAgain(): void; onLeave(): void; onWatch(): void }`; ids `#again` (solo: "Continue", back to the title card; over: "Play again (same room)"), `#end-leave` (over, out, peek: "Leave room"), `#end-watch` (out: "Watch the finish", peek: "Back to the battle"), `#end-filed`. `EndState = { kicker; title; text; score; board: Board | null; filed: string | null; buttons: EndVeilProps['buttons'] }`. `MatchDeps` loses `fileReport`, `savedCallsign`, `netRematch`, `openLobby`; gains `netAgain(): void`, `fileSolo(run: { initials: string; score: number; banked: number; seed: string; difficulty: Difficulty }, done: (line: string) => void): void`, `initials(): string`.

- [ ] **Step 1: The end card's tests, in their own file (failing)**

`test/endveil.test.mjs`:

```js
// games/tankity/test/endveil.test.mjs
// The end card (src/ui/endveil.tsx): no callsign form, the filed line, the
// scoreboard at its head, and the buttons each kind of ending offers.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { document, makeEl, click } from '../../_kit/test/dom-stub.mjs';
import { importTsx } from '../../_kit/test/tsx.ts';

globalThis.document = document;
const { endveil } = await importTsx(import.meta.dirname, { endveil: '../src/ui/endveil.tsx' });
const walk = (el, out = []) => { for (const c of el.children || []) { if (c.nodeType === 1) { out.push(c); walk(c, out); } } return out; };
const byId = (el, id) => walk(el).find(n => n.id === id);

function draw(over = {}) {
  const veil = makeEl('end-veil');
  const calls = [];
  endveil.renderEndVeil(veil, {
    keyHint: () => 'N', kicker: 'Match lost', title: 'Tank down', text: 'The tank is scrap.', score: 'Score 4,450 · seed s',
    board: null, filed: 'Filed · #12 all-time', buttons: 'solo',
    onAgain: () => calls.push('again'), onLeave: () => calls.push('leave'), onWatch: () => calls.push('watch'), ...over,
  });
  return { veil, calls };
}

test('no callsign form; the filed line shows, and hides when nothing was filed', () => {
  const { veil } = draw();
  assert.equal(byId(veil, 'end-score-form'), undefined);
  assert.equal(byId(veil, 'end-name'), undefined);
  assert.equal(byId(veil, 'end-filed').textContent, 'Filed · #12 all-time');
  assert.equal(byId(veil, 'end-filed').hidden, false);
  assert.equal(byId(draw({ filed: null }).veil, 'end-filed').hidden, true);
});

test('a solo run: Continue, back to the title card, and nothing else', () => {
  const { veil, calls } = draw();
  assert.equal(byId(veil, 'again').textContent, 'Continue');
  assert.equal(byId(veil, 'end-leave'), undefined);
  assert.equal(byId(veil, 'end-watch'), undefined);
  click(byId(veil, 'again'));
  assert.deepEqual(calls, ['again']);
});

test('a finished room match: Play again (same room) and Leave room', () => {
  const { veil, calls } = draw({ buttons: 'over' });
  assert.equal(byId(veil, 'again').textContent, 'Play again (same room)');
  assert.equal(byId(veil, 'end-leave').textContent, 'Leave room');
  click(byId(veil, 'end-leave'));
  assert.deepEqual(calls, ['leave']);
});

test('out of lives: Watch the finish and Leave room; from the menu: Back to the battle', () => {
  const out = draw({ buttons: 'out' });
  assert.equal(byId(out.veil, 'end-watch').textContent, 'Watch the finish');
  assert.equal(byId(out.veil, 'again'), undefined);
  assert.ok(byId(out.veil, 'end-leave'));
  click(byId(out.veil, 'end-watch'));
  assert.deepEqual(out.calls, ['watch']);
  assert.equal(byId(draw({ buttons: 'peek' }).veil, 'end-watch').textContent, 'Back to the battle');
});

test('the scoreboard heads the card', () => {
  const board = { kind: 'solo', caption: '', title: '', rows: [{ round: 1, won: true, points: 10, kills: 1, cash: 5, lives: 3 }], total: { points: 10, kills: 1 } };
  assert.ok(walk(draw({ board }).veil).some(n => n.localName === 'table'));
});
```

In `test/ui.test.mjs` delete the block from `// ---- end veil ----` through its closing `}` (the line before `// ---- leave question ----`), `const { renderEndVeil } = ui.endveil;`, and `'endveil', ` from the `UI` list.

Run (in `games/tankity`): `node --test test/endveil.test.mjs`
Expected: FAIL on the callsign-form and button tests.

- [ ] **Step 2: The component**

Replace `src/ui/endveil.tsx` from its header to the end of `EndVeil` with:

```tsx
/* The end card: the result, this match's scoreboard, where the run was filed,
 * and what to do next: Continue (back to the title card) in solo; Play again
 * (same room) or Leave room when a room match is over; Watch the finish or
 * Leave room when you are out; Back to the battle when the scoreboard was
 * opened from the menu. The veil (#end-veil) stays in index.html and the game
 * shows and hides it.
 * Copyright (C) 2026 William Grim
 * SPDX-License-Identifier: GPL-3.0-or-later */
import { render } from 'preact';
import { useRef } from 'preact/hooks';
import { KeyHints, OverlayHead, ScrollKeys, blurThen, useScrollKeep } from './chrome.tsx';
import type { KeyHintFn } from './chrome.tsx';
import { Standings } from './standings.tsx';
import type { Board } from '../standings.ts';

export interface EndVeilProps {
  keyHint: KeyHintFn;
  kicker: string;
  title: string;
  text: string;
  /** The score line under the scoreboard. */
  score: string;
  board: Board | null;
  /** "Filed · #12 all-time", "Filing…", or null when nothing was filed. */
  filed: string | null;
  buttons: 'solo' | 'over' | 'out' | 'peek';
  onAgain: () => void;
  onLeave: () => void;
  onWatch: () => void;
}

export function EndVeil(p: EndVeilProps) {
  const card = useRef<HTMLDivElement>(null);
  // The veil scrolls on a short screen; a redraw keeps its place.
  useScrollKeep(() => card.current?.parentElement);
  const watch = p.buttons === 'out' || p.buttons === 'peek';
  return (
    <KeyHints.Provider value={p.keyHint}>
      <div class="card" role="dialog" aria-modal="true" aria-labelledby="end-title" ref={card}>
        <OverlayHead kicker={p.kicker} kickerId="end-kicker" titleId="end-title" title={p.title}
          navId="nav-end" scrollOnly nav={<ScrollKeys line />} />
        <p id="end-text" hidden={!p.text}>{p.text}</p>
        {p.board && <Standings board={p.board} />}
        <p id="end-score" class="runstats">{p.score}</p>
        <p id="end-filed" class="hint" hidden={p.filed === null}>{p.filed ?? ''}</p>
        {watch
          ? <button type="button" id="end-watch" class="btn-primary" onClick={blurThen(p.onWatch)}>
              {p.buttons === 'out' ? 'Watch the finish' : 'Back to the battle'}
            </button>
          : <button type="button" id="again" class="btn-primary" onClick={blurThen(p.onAgain)}>
              {p.buttons === 'over' ? 'Play again (same room)' : 'Continue'}
            </button>}
        {p.buttons !== 'solo' && (
          <button type="button" id="end-leave" class="btn-leave" onClick={blurThen(p.onLeave)}>Leave room</button>
        )}
      </div>
    </KeyHints.Provider>
  );
}
```

(`renderEndVeil` below it is unchanged.)

- [ ] **Step 3: The match's end state**

`src/match.ts`:

```ts
/** What the end card says and which buttons it offers (src/ui/endveil.tsx). */
export interface EndState {
  kicker: string;
  title: string;
  text: string;
  score: string;
  board: Board | null;
  filed: string | null;
  buttons: 'solo' | 'over' | 'out' | 'peek';
}
```

In `MatchDeps` (Plan C Task 13's, with `backToTitle`) remove `fileReport`, `savedCallsign`, `netRematch` and `openLobby`, and add:

```ts
  netAgain(): void;
  initials(): string;
  fileSolo(run: { initials: string; score: number; banked: number; seed: string; difficulty: Difficulty }, done: (line: string) => void): void;
```

(update the destructuring in `createMatch` to match). Replace `const END: EndState = {...}` and `renderEndVeil()` with:

```ts
  const END: EndState = { kicker: '', title: '', text: '', score: '', board: null, filed: null, buttons: 'solo' };
  function renderEndVeil(): void {
    const veil = $('end-veil');
    if (!veil) return;
    drawEndVeil(veil, {
      keyHint, ...END,
      onAgain: () => { sfx.play('click'); if (net.on) netAgain(); else backToTitle(); },
      onLeave: () => { sfx.play('click'); netLeave(); },
      onWatch: () => { veil.hidden = true; refreshNavHints(); },
    });
  }
```

In `endMatch()` replace the `if (veil) { ... }` body with:

```ts
    if (veil) {
      END.kicker = won ? 'Match over' : 'Match lost';
      END.title = won ? 'Hills claimed!' : 'Tank down';
      END.text = text;
      END.score = `Score ${G.score} · ${G.roundsWon} rounds won · ${G.round} rounds played · seed ${G.seed}`;
      END.board = G.rounds.length ? { ...soloBoard(G.rounds, 'over'), caption: '', title: '' } : null;
      END.buttons = 'solo';
      END.filed = 'Filing…';
      renderEndVeil();
      veil.hidden = false;
      refreshNavHints();
      // A finished run files itself: no form, no button.
      fileSolo({ initials: initials(), score: G.score, banked: G.roundsWon, seed: G.seed, difficulty: G.difficulty ?? 'normal' }, line => {
        END.filed = line;
        renderEndVeil();
      });
    }
```

(`Difficulty` comes into `match.ts` as a type from `./sim.ts`.) In `main.ts`'s `createMatch({...})` call, remove `fileReport, savedCallsign, ` and add `netAgain: () => {}, initials: getInitials, fileSolo: (_r, done) => done(''),` (`getInitials` is Plan C Task 13's, in `main.ts`); Task 18 replaces `netAgain` and Task 19 replaces `fileSolo`, so the build type-checks after every task.

- [ ] **Step 4: Run**

Run (in `games/tankity`): `node ../_kit/build/build.mjs tankity && node --test test/endveil.test.mjs test/ui.test.mjs test/smoke.test.mjs`
Expected: PASS. (Smoke checks that referred to the callsign form go in Task 19.)

- [ ] **Step 5: Commit**

```bash
git add games/tankity/src games/tankity/test/endveil.test.mjs games/tankity/test/ui.test.mjs games/tankity/dist
git commit -F- <<'MSG'
Tankity: the end card shows the scoreboard and where the run was filed

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb
MSG
```

### Task 18: Room endings on the client: over, out, standings, Play again

**Files:**
- Modify: `games/tankity/src/room.ts` (`netEvent` eliminated/matchwin/again, `netAdopt` lobby phase, `netShowStandings`, new `roomCard`, `openStandings`)
- Modify: `games/tankity/src/lobby.ts` (remove `netRematch`, add `netAgain`, `netBackToLobby`; `netLeave` END fields)
- Modify: `games/tankity/src/standings.ts` (`endCardEscape`), `games/tankity/src/match.ts` (`endVeilEscape`)
- Modify: `games/tankity/src/ui/menu.tsx` (`MenuProps.onStandings`, `#menu-standings`), `games/tankity/src/menu.ts` (`MenuDeps.openStandings`)
- Modify: `games/tankity/src/main.ts` (wire `netAgain`, `openStandings`, `backToLobby`; the `escape` command)
- Modify: `games/tankity/test/menu.test.mjs` (Plan C's), `games/tankity/test/standings.test.mjs`

**Interfaces:**
- Consumes: Tasks 12 (`again`, `toLobby`), 14 (`roomBoard`, `filedLine`, `matchOutcome`), 17 (`EndState`); Plan C Task 14's menu (after Plan C Task 19 and Plan B Task 24's Quit) and `test/menu.test.mjs`; Plan C Task 13's `backToTitle()` and Task 7's `escape` command.
- Produces: `RoomDeps.backToLobby(): void`; `openStandings(): void` (room.ts); `netAgain(): Promise<void>`, `netBackToLobby(): void` (lobby.ts); `MenuDeps.openStandings(): void`, `MenuProps.onStandings: () => void`, `#menu-standings` (shown only in a room); `endCardEscape(buttons): 'watch' | 'stay' | 'pass'` (standings.ts) and `endVeilEscape(): boolean` (match.ts): Esc on the `peek` card is Back to the battle, on the `out` card Watch the finish, and the `over` card keeps its buttons (Esc leaves it up).

- [ ] **Step 1: Room cards**

In `src/room.ts` add `import { filedLine, matchOutcome, roomBoard } from './standings.ts'; import type { RoomCard } from './standings.ts';`, add `backToLobby(): void;` to `RoomDeps` (and its destructuring), and add:

```ts
  /* The scoreboard card for a room: match over, you're out, or a look from the menu. */
  function roomCard(room: RoomSnapshot, card: Exclude<RoomCard, 'shop'>): void {
    const board = roomBoard(room, net.seat, card, MATCH.roundTo || 'the battery');
    END.kicker = board.caption;
    END.title = board.title;
    END.text = '';
    END.score = room.you ? `You banked $${room.you.cash || 0} · ${room.you.score || 0} pts` : '';
    END.board = { ...board, caption: '', title: '' };
    END.filed = room.you && room.you.filed ? filedLine(room.you.filedRank, room.you.score || 0, room.difficulty) : null;
    END.buttons = card;
    renderEndVeil();
    const veil = $('end-veil');
    if (veil) veil.hidden = false;
    refreshNavHints();
  }
  /* Menu → Standings while a room match runs. */
  function openStandings(): void {
    if (!net.on || !MATCH.lastRoom) return;
    roomCard(MATCH.lastRoom, MATCH.out ? 'out' : 'peek');
  }
```

Replace `netShowStandings()` with:

```ts
  function netShowStandings(room: RoomSnapshot): void {
    // The poll keeps running: a Play again from anyone brings this room back to its lobby.
    roomCard(room, 'over');
  }
```

In `netEvent()`: the `eliminated` branch, when `e.seat === net.seat`, also sets `MATCH.out = true;`; add before the `join` branch:

```ts
    if (e.t === 'matchwin') {
      if (e.seat === net.seat) { sfx.play('win'); say(`Last tank standing! +${e.bonus} winner's bonus.`, 'good'); }
      else say(`${seatName(e.seat)} is the last tank standing.`, 'info');
      return;
    }
    if (e.t === 'again') { say(`${seatName(e.seat)} wants another round in this room.`, 'info'); return; }
```

In `netAdopt()`, at the end of the `room.phase === 'play'` branch add:

```ts
      // Out of lives while others fight on: the you're-out card, once.
      if (MATCH.out && !MATCH.outShown && !matchOutcome(room.seats, room.startHumans).over) {
        MATCH.outShown = true;
        roomCard(room, 'out');
      }
```

and remove the line `if ($('end-veil')) $('end-veil')!.hidden = true;` from that branch only when `MATCH.outShown` (replace it with `if ($('end-veil') && !MATCH.out) $('end-veil')!.hidden = true;`). Add a branch after the `over` branch:

```ts
    } else if (room.phase === 'lobby' && MATCH.lastPhase && MATCH.lastPhase !== 'lobby') {
      backToLobby();
      return;
```

Return `openStandings` from `createRoom`.

- [ ] **Step 2: Lobby side**

In `src/lobby.ts` replace `netRematch()` with:

```ts
  /* Play again (same room): the room goes back to its lobby for everyone. */
  async function netAgain(): Promise<void> {
    try {
      await net.post('again', {});
      netBackToLobby();
    } catch (err) { say(prettyRoomError(err), 'bad'); }
  }
  /* The room is in its lobby again: the match poll stops, the lobby shows the
     seats, and the host's Start begins the next match. */
  function netBackToLobby(): void {
    net.toLobby();
    MATCH.out = false; MATCH.outShown = false; MATCH.lastPhase = 'lobby'; MATCH.roundTo = '';
    replay.clear(); MATCH.pendingRoom = null; MATCH.myTurn = false;
    G.over = false;
    if ($('end-veil')) $('end-veil')!.hidden = true;
    hideShop();
    void openLobby();
  }
```

In `netLeave()` replace `    END.rematch = null;\n    END.backToRooms = false;` with `    END.buttons = 'solo';\n    END.board = null;\n    END.filed = null;` and add `MATCH.out = false; MATCH.outShown = false; MATCH.lastRoom = null;` beside the other `MATCH` resets. `netLeave()` keeps Plan C Task 13's ending: it says "Back from the room…" and calls `backToTitle()`. In `startNetMatch()` add `MATCH.out = false; MATCH.outShown = false; MATCH.roundTo = '';`. Return `netAgain, netBackToLobby` instead of `netRematch`.

- [ ] **Step 3: Menu → Standings (failing test first)**

Append to `test/menu.test.mjs`:

```js
test('Standings shows only in a room and reports a press', () => {
  let shown = 0;
  const { section, props } = draw({ onStandings: () => { shown++; } });
  assert.equal(byId(section, 'menu-standings').hidden, true);
  menu.renderMenu(section, { ...props, inRoom: true });
  const standings = byId(section, 'menu-standings');
  assert.equal(standings.hidden, false);
  assert.equal(standings.textContent, 'Standings');
  click(standings);
  assert.equal(shown, 1);
});
```

Run (in `games/tankity`): `node --test test/menu.test.mjs`
Expected: FAIL (`menu-standings` missing).

`src/ui/menu.tsx`: in `MenuProps`, after `onScores`, add

```tsx
  /** This room match's scoreboard (shown only in a room). */
  onStandings: () => void;
```

and directly after the `#scores-open` button add

```tsx
        <button type="button" id="menu-standings" title="This match's scoreboard" hidden={!p.inRoom}
          onClick={blurThen(p.onStandings)}>Standings</button>
```

`src/menu.ts`: add `/** The room match's scoreboard card (room.ts openStandings). */` `openStandings(): void;` to `MenuDeps`, `openStandings` to `createMenu`'s destructuring, and in `renderMenu` after `onScores: ...,`:

```ts
      // The card replaces the menu: close it first, so Esc then goes back to the battle.
      onStandings: () => { toggleOverlay('menu-overlay', 'btn-menu'); openStandings(); },
```

- [ ] **Step 4: Esc on a room's end card (failing test first)**

Append to `test/standings.test.mjs` (add `endCardEscape` to its `../src/standings.ts` import):

```js
test('Esc on an end card: back to the battle, watch the finish, or keep the card', () => {
  assert.equal(endCardEscape('peek'), 'watch');
  assert.equal(endCardEscape('out'), 'watch');
  assert.equal(endCardEscape('over'), 'stay');
  assert.equal(endCardEscape('solo'), 'pass');
});
```

`src/standings.ts`:

```ts
/** What Esc does on an end card: a look from the menu ('peek') goes back to
 *  the battle and the you're-out card ('out') watches the finish, both as their
 *  button does; a finished room match ('over') keeps its card until a button is
 *  pressed; a solo card ('solo') leaves Esc to its usual job. */
export function endCardEscape(buttons: 'solo' | 'over' | 'out' | 'peek'): 'watch' | 'stay' | 'pass' {
  if (buttons === 'out' || buttons === 'peek') return 'watch';
  return buttons === 'over' ? 'stay' : 'pass';
}
```

`src/match.ts` (import `endCardEscape` with the other `./standings.ts` imports), after `renderEndVeil()`:

```ts
  /* Esc while the end card shows; true when it handled the key. */
  function endVeilEscape(): boolean {
    const veil = $('end-veil');
    if (!veil || veil.hidden) return false;
    const act = endCardEscape(END.buttons);
    if (act === 'watch') { veil.hidden = true; refreshNavHints(); }
    return act !== 'pass';
  }
```

and add `endVeilEscape` to `createMatch`'s returned object.

- [ ] **Step 5: Wiring**

`src/main.ts`: destructure `netAgain, netBackToLobby` from `createLobby`, `openStandings` from `createRoom`, and `endVeilEscape` from `createMatch`; pass `netAgain: () => netAgain()` to `createMatch` (replacing Task 17's stub), `backToLobby: () => netBackToLobby()` to `createRoom`, and `openStandings: () => openStandings()` to `createMenu`. In `bindKeys`'s `escape` command (Plan C Task 7's), replace

```ts
      if (!closeOverlays()) toggleOverlay('menu-overlay', 'btn-menu');
```

with

```ts
      if (closeOverlays()) return;
      if (endVeilEscape()) return;
      toggleOverlay('menu-overlay', 'btn-menu');
```

so an open panel (the menu over the card) closes first.

- [ ] **Step 6: Run**

Run (in `games/tankity`): `node ../_kit/build/build.mjs tankity && node --test 'test/*.test.mjs'`
Expected: PASS. (`smoke.test.mjs`'s room replay through the fixtures still adopts `play`/`shop` phases; it never reaches `over`.)

- [ ] **Step 7: Commit**

```bash
git add games/tankity/src games/tankity/test/menu.test.mjs games/tankity/test/standings.test.mjs games/tankity/dist
git commit -F- <<'MSG'
Tankity rooms: match-over and you're-out cards, Menu → Standings, Esc on the cards, Play again

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb
MSG
```

### Task 19: Solo runs file themselves; Scores shows your difficulty's board, yours marked, with a switcher

**Files:**
- Modify: `games/tankity/scores.php` (rewrite: a board per difficulty, initials-checked POST)
- Modify: `games/tankity/src/scores.ts` (rewrite)
- Modify: `games/tankity/src/ui/scores.tsx` (rows marked, the level switcher, no form)
- Modify: `games/tankity/src/lobby.ts` (drop `SCORES`/`renderScoresOverlay` deps)
- Modify: `games/tankity/src/main.ts` (`createScores`, `createMatch`, `createLobby` wiring)
- Create: `games/tankity/test/scores-ui.test.mjs`
- Modify: `games/tankity/test/ui.test.mjs` (delete the scores block), `games/tankity/test/smoke.test.mjs` (form checks)

**Interfaces:**
- Consumes: Task 10's boards, `tankity_guard()` and `tankity_initials()`; PR 20's `tankity_housekeep`/`tankity_jobs`; Task 14's `filedLine`; the difficulty PR's `difficultySetting` (main.ts's `difficulty`), `DIFFICULTY_NAMES` and `isDifficulty` (`src/difficulty.ts`); Plan C Task 13's `getInitials` (in `main.ts`).
- Produces: `scores.php` GET `?difficulty=<level>` (default `normal`; 422 for an unknown word) → `{ difficulty, scores: { place, initials, score, rounds, seed, at }[], keep }`; POST `{ initials, difficulty, score, banked, seed }` → `{ ok, score, rank, difficulty }`. `createScores({ $, keyHint, say, toggleOverlay, initials, difficulty })` → `{ SCORES, renderScoresOverlay, loadScores, fileSolo }` with `loadScores(level?: Difficulty): Promise<void>` (no argument: the player's current difficulty) and `fileSolo(run: SoloRun, done)`, `SoloRun = { initials; score; banked; seed; difficulty: Difficulty }`. `ScoresProps = { keyHint; onClose; level: Difficulty; onLevel(level: Difficulty): void; rows: { text: string; mine: boolean }[] | null; note: string }`; the switcher's buttons are `#scores-level-easy`, `#scores-level-normal`, `#scores-level-hard`, the shown one `aria-pressed="true"`.

- [ ] **Step 1: The endpoint**

Replace `games/tankity/scores.php` with:

```php
<?php
// Operation Tankity: the all-time boards over HTTP, one per difficulty. GET
// ?difficulty= answers that board's best runs; POST {initials, difficulty,
// score, banked, seed} files a finished solo run. Rooms file their own scores
// on the server. The boards are server/board.php.
declare(strict_types=1);

// A JSON API must never leak diagnostics into its output.
ini_set('display_errors', '0');

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/server/db.php';
require_once __DIR__ . '/server/guard.php';
require_once __DIR__ . '/server/board.php';
require_once __DIR__ . '/server/housekeep.php';

function json_out(int $code, array $payload): void
{
    http_response_code($code);
    header('Content-Type: application/json');
    header('Cache-Control: no-store');
    echo json_encode($payload, JSON_UNESCAPED_SLASHES);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
try {
    tankity_housekeep(time(), tankity_jobs());
    if ($method === 'GET') {
        $level = board_level($_GET['difficulty'] ?? 'normal');
        if ($level === null) {
            json_out(422, ['error' => 'no such board']);
        }
        json_out(200, ['difficulty' => $level, 'scores' => board_top($level, BOARD_SHOW), 'keep' => BOARD_KEEP]);
    }
    if ($method === 'POST') {
        $guard = tankity_guard();
        if (!$guard->originAllowed()) {
            json_out(403, ['error' => 'forbidden']);
        }
        $in = json_decode((string) file_get_contents('php://input'), true);
        if (!is_array($in)) {
            json_out(400, ['error' => 'body must be JSON']);
        }
        $initials = tankity_initials($guard, $in['initials'] ?? null);
        if ($initials === null) {
            json_out(422, ['error' => 'initials must be 3 letters, kept clean']);
        }
        $level = board_level($in['difficulty'] ?? null);
        $score = $in['score'] ?? null;
        $banked = $in['banked'] ?? null;
        if ($level === null || !is_int($score) || $score < 0 || $score > 999999 || !is_int($banked) || $banked < 0 || $banked > 999) {
            json_out(422, ['error' => 'invalid run (difficulty easy/normal/hard, score 0-999999, banked 0-999)']);
        }
        $rank = board_file(['difficulty' => $level, 'initials' => $initials, 'score' => $score, 'rounds' => $banked, 'seed' => (string) ($in['seed'] ?? '')]);
        json_out(200, ['ok' => true, 'score' => $score, 'rank' => $rank, 'difficulty' => $level]);
    }
    json_out(405, ['error' => 'method not allowed']);
} catch (Throwable $e) {
    error_log('tankity scores.php: ' . $e->getMessage());
    json_out(tankity_busy($e) ? 503 : 500, ['error' => tankity_busy($e) ? 'store busy' : 'store unavailable']);
}
```

(`server/legacy.php` stays: housekeeping still imports any old file and moves its rows onto the Normal board. `legacy_add_run` and `legacy_top` lose their last callers here and in Task 11; delete both and their tests (`testANewRunKeepsTheLastFiftyAndAnswersTheBest`, and the `legacy_top` assertion in `testEveryRunOfEveryFileArrivesAndTheFilesGo`) in this step, and `LEGACY_RUNS_KEPT` with them.)

- [ ] **Step 2: The client**

Replace `src/scores.ts` with:

```ts
/* Operation Tankity: the high scores.
 *
 * One all-time board per difficulty from scores.php, this player's rows marked,
 * opening on the player's own difficulty with a switcher to the others; and a
 * finished solo run filed the moment it ends, on its difficulty's board. When
 * the server is out of reach the board falls back to this browser's own rows.
 * The page arrives as deps. */
import { browserStorage } from '../../_kit/ports.browser.ts';
import { json, pref } from '../../_kit/prefs.ts';
import { DIFFICULTY_NAMES } from './difficulty.ts';
import { isScoreRows, type ScoreEntry } from './score-rows.ts';
import type { Difficulty } from './sim.ts';
import { filedLine, fmt } from './standings.ts';
import type { KeyHintFn } from './ui/chrome.tsx';
import { renderScores as drawScores } from './ui/scores.tsx';

/** A board row as scores.php sends it. */
interface BoardRow { place: number; initials: string; score: number; rounds: number }

export interface ScoresDeps {
  $(id: string): HTMLElement | null;
  keyHint: KeyHintFn;
  say(text: string, tone?: string): void;
  toggleOverlay(id: string, btnId?: string): void;
  initials(): string;
  /** The Menu's Difficulty: the board Scores opens on. */
  difficulty(): Difficulty;
}

export interface SoloRun { initials: string; score: number; banked: number; seed: string; difficulty: Difficulty }

export function createScores(deps: ScoresDeps) {
  const { $, keyHint, say, toggleOverlay, initials, difficulty } = deps;
  const localRows = pref<ScoreEntry[]>('tankity-local', [], json(isScoreRows), browserStorage());

  const SCORES: { level: Difficulty; rows: { text: string; mine: boolean }[] | null; note: string } = { level: 'normal', rows: null, note: '' };
  function renderScoresOverlay(): void {
    const section = $('report-overlay');
    if (!section) return;
    drawScores(section, {
      keyHint, onClose: () => toggleOverlay('report-overlay', 'scores-open'),
      level: SCORES.level, onLevel: lv => { void loadScores(lv); }, rows: SCORES.rows, note: SCORES.note,
    });
  }
  async function loadScores(level: Difficulty = difficulty()): Promise<void> {
    const me = initials();
    SCORES.level = level;
    try {
      const res = await fetch(`scores.php?difficulty=${level}`, { headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error('http ' + res.status);
      const data = (await res.json()) as { scores?: BoardRow[] };
      SCORES.rows = (data.scores || []).map(r => ({
        text: `#${r.place} ${r.initials} · ${fmt(r.score)} pts · ${r.rounds} rounds won`, mine: r.initials === me,
      }));
      SCORES.note = `The all-time board on ${DIFFICULTY_NAMES[level]}. Your runs are marked.`;
    } catch (_) {
      SCORES.rows = localRows.get().map((r, i) => ({ text: `#${i + 1} ${r.name} · ${fmt(r.score)} pts · ${r.banked} rounds won`, mine: r.name === me }));
      SCORES.note = 'The score server is out of reach: these are this browser\'s runs only.';
    }
    renderScoresOverlay();
  }
  function saveLocal(entry: ScoreEntry): void {
    localRows.set([...localRows.get(), entry].sort((a, b) => b.score - a.score).slice(0, 10));
  }
  /* Files a finished solo run on its difficulty's board; `done` gets the line the end card shows. */
  async function fileSolo(run: SoloRun, done: (line: string) => void): Promise<void> {
    try {
      const res = await fetch('scores.php', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(run),
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; score?: number; rank?: number | null; error?: string } | null;
      if (!res.ok || !data || !data.ok) throw new Error((data && data.error) || 'http ' + res.status);
      done(filedLine(data.rank ?? null, data.score ?? run.score, run.difficulty));
    } catch (_) {
      saveLocal({ name: run.initials, score: run.score, banked: run.banked, won: false, seed: run.seed });
      say('The score server is out of reach; the run stays in this browser.', 'info');
      done('Not filed: the score server is out of reach. Kept in this browser.');
    }
    void loadScores();
  }

  return { SCORES, renderScoresOverlay, loadScores, fileSolo };
}
```

`src/ui/scores.tsx`: delete the form, `formHidden`, `onFile`, the `useRef` for the form/name and their imports; `ScoresProps` becomes `{ keyHint: KeyHintFn; onClose(): void; level: Difficulty; onLevel(level: Difficulty): void; rows: { text: string; mine: boolean }[] | null; note: string }` (import `type Difficulty` from `../sim.ts`, `DIFFICULTIES` from `../ai.ts` and `DIFFICULTY_NAMES` from `../difficulty.ts`). Above the list render the switcher:

```tsx
      <div class="scores-levels" role="group" aria-label="Board">
        {DIFFICULTIES.map(lv => (
          <button key={lv} id={`scores-level-${lv}`} type="button" aria-pressed={p.level === lv ? 'true' : 'false'}
            onClick={() => { if (p.level !== lv) p.onLevel(lv); }}>{DIFFICULTY_NAMES[lv]}</button>
        ))}
      </div>
```

and the list renders `p.rows.map((r, i) => <li key={i} class={r.mine ? 'mine' : undefined}>{r.text}{r.mine && <span class="sr-only"> (yours)</span>}</li>)`; `useScrollKeep(() => document.getElementById('scores')?.parentElement)`. Header comment: "The scores overlay: one difficulty's all-time board, best first, with this player's runs marked, a switcher to the other difficulties, and where the list came from." Add to `game.css`:

```css
#scores li.mine { color: var(--gold, #ffc93c); font-weight: 700; }
.scores-levels { display: flex; gap: 6px; margin: 0 0 8px; }
.scores-levels button { min-height: 44px; padding: 0 14px; }
.scores-levels button[aria-pressed="true"] { background: var(--gold, #ffc93c); color: #14183a; }
```

`src/lobby.ts`: delete `SCORES.formHidden = false;` + `renderScoresOverlay();` in `netLeave()` and `SCORES.formHidden = true;` + `renderScoresOverlay();` in `startNetMatch()`; remove `SCORES` and `renderScoresOverlay` from `LobbyDeps` and the destructuring.

`src/main.ts`: `const { SCORES, renderScoresOverlay, loadScores, fileSolo } = createScores({ $, keyHint, say, toggleOverlay, initials: getInitials, difficulty: () => difficulty.get() });` (`getInitials` is main.ts's own, from Plan C Task 13; `difficulty` is main.ts's `difficultySetting(browserStorage())`); in the `createMatch` call replace Task 17's `fileSolo: (_r, done) => done('')` with `fileSolo: (run, done) => { void fileSolo(run, done); }` (`initials: getInitials` stays); `createLobby` loses `SCORES, renderScoresOverlay`. Opening the Scores overlay calls `loadScores()` (it already does), so it opens on the Menu's current difficulty.

- [ ] **Step 3: Tests that read the old form**

The scores overlay's tests move to their own node:test file. `test/scores-ui.test.mjs`:

```js
// games/tankity/test/scores-ui.test.mjs
// The scores overlay (src/ui/scores.tsx): one difficulty's board with the
// player's own runs marked, a switcher to the others, and no form.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { document, makeEl } from '../../_kit/test/dom-stub.mjs';
import { importTsx } from '../../_kit/test/tsx.ts';

globalThis.document = document;
const { scores } = await importTsx(import.meta.dirname, { scores: '../src/ui/scores.tsx' });
const walk = (el, out = []) => { for (const c of el.children || []) { if (c.nodeType === 1) { out.push(c); walk(c, out); } } return out; };
const byId = (el, id) => walk(el).find(n => n.id === id);
const hasClass = (el, name) => String(el.className || '').split(' ').includes(name);
const props = over => ({ keyHint: () => '', onClose() {}, onLevel() {}, level: 'normal', note: 'The all-time board on Normal.',
  rows: [{ text: '#1 WGR · 9,000 pts · 4 rounds won', mine: false }, { text: '#2 ABC · 8,000 pts · 3 rounds won', mine: true }], ...over });

test('the board lists every row, marks the player\'s own, and has no form', () => {
  const section = makeEl('report-overlay');
  scores.renderScores(section, props({}));
  assert.equal(byId(section, 'score-form'), undefined);
  const items = walk(byId(section, 'scores')).filter(n => n.localName === 'li');
  assert.equal(items.length, 2);
  assert.ok(!hasClass(items[0], 'mine'));
  assert.ok(hasClass(items[1], 'mine'));
  assert.match(items[1].textContent, /\(yours\)$/);
});

test('the switcher shows the board on screen and asks for another', () => {
  const asked = [];
  const section = makeEl('report-overlay');
  scores.renderScores(section, props({ level: 'hard', onLevel: lv => asked.push(lv) }));
  assert.equal(byId(section, 'scores-level-hard').getAttribute('aria-pressed'), 'true');
  assert.equal(byId(section, 'scores-level-easy').getAttribute('aria-pressed'), 'false');
  assert.equal(byId(section, 'scores-level-normal').textContent, 'Normal');
  byId(section, 'scores-level-easy').click();
  byId(section, 'scores-level-hard').click();
  assert.deepEqual(asked, ['easy'], 'the board already shown is not asked for again');
});
```

In `test/ui.test.mjs` delete the block from `// ---- scores ----` through its closing `}` (the line before `// ---- leave question ----`: Task 17 already removed the end-veil block that sat between them), `const { renderScores } = ui.scores;`, and `'scores', ` from the `UI` list.

In `test/smoke.test.mjs`, delete every check that types into `#end-name` / `#name-input` or submits `#end-score-form` / `#score-form`, and replace them with one check after the match-over veil opens:

```js
  check('end-files-itself', !els['end-score-form'] && /Filed|Not filed|Filing/.test(els['end-filed'].textContent), els['end-filed'] && els['end-filed'].textContent);
```

(The smoke test's `fetch` stub answers `{ scores: [] }` with `ok: true`, which reads as a failed file — no `ok` — and shows "Not filed…".)

- [ ] **Step 4: Run**

Run (in `games/tankity`): `node ../_kit/build/build.mjs tankity && node --test 'test/*.test.mjs'` then (in `websites/www.cs`) `vendor/bin/phpunit --testsuite tankity`
Expected: PASS, `scores-ui.test.mjs` (2) included.

- [ ] **Step 5: Commit**

```bash
git add -A games/tankity/scores.php games/tankity/server games/tankity/src games/tankity/game.css games/tankity/test games/tankity/dist
git commit -F- <<'MSG'
Tankity: solo runs file themselves on their difficulty's board; Scores opens on yours

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb
MSG
```

### Task 20: Browser spec, docs, PR 15

**Files:**
- Modify: `tests/e2e/tankity-end.spec.mjs`
- Modify: `games/tankity/README.md` (Files table rows for `standings.ts`, `ui/standings.tsx`, `server/board.php`, `server/guard.php`; the Storage section; new section "Match end and scoreboards"; Tests table)

**Interfaces:**
- Consumes: Tasks 8–19; Task 7's `dealSolo`; Plan C Task 15's version of `tankity-end.spec.mjs` (its test is `'a lost match shows the end veil: result, score, callsign form, and Continue back to the title card'`, and its last block, from `// Continue goes back to the title card over the demo; Play deals a fresh`, clicks `#again`, sees `#title-card`, and deals a fresh match from `#title-play`).

- [ ] **Step 1: The end spec**

In `tests/e2e/tankity-end.spec.mjs` (as Plan C Task 15 left it):

1. Change the import line to `import { newPlayer, hud, aimTo, setPower, dealSolo } from './helpers.mjs';`.
2. Rename the test to `'a lost match shows the end card: result, the rounds table, where it was filed, and Continue back to the title card'`.
3. Replace its two opening lines `await page.keyboard.press('n');` / `await page.waitForSelector('#shop-veil:not([hidden])');` with `await dealSolo(page);` (the mortar purchase that follows needs the pre-match shop open).
4. Replace everything from `// The result and the score.` through the end of the `if (local(baseURL)) { ... }` block (just before `// Continue goes back to the title card over the demo; Play deals a fresh`) with:

```js
  // The result, this match's rounds, and the run filing itself.
  const veil = page.locator('#end-veil');
  await expect(veil).toBeVisible();
  await expect(veil.locator('#end-kicker')).toHaveText('Match lost');
  await expect(veil.locator('#end-title')).toHaveText('Tank down');
  await expect(veil.locator('#end-text')).toContainText('The tank is scrap');
  await expect(veil.locator('#end-score')).toHaveText(/^Score \d+ · \d+ rounds won · \d+ rounds played · seed \S+$/);
  await expect(veil.locator('table thead')).toContainText('Round');
  await expect(veil.locator('table tfoot')).toContainText('Total');
  await expect(veil.locator('#end-score-form')).toHaveCount(0);
  await expect(veil.locator('#end-leave')).toHaveCount(0);
  // Filing writes a real score, so only the local site is expected to say Filed.
  await expect(veil.locator('#end-filed')).toHaveText(local(baseURL) ? /^Filed · / : /^(Filed|Not filed)/, { timeout: 10_000 });
  await veil.locator('.card').screenshot({ path: 'test-results/tankity-end-veil.png' });
```

The Continue block after it stays as Plan C wrote it: `#again` reads **Continue** now (Task 17) and still goes back to the title card.

Run (in `websites/www.cs`): `make e2e E2E_ARGS="tankity-end.spec.mjs"`
Expected: 1 passed.

- [ ] **Step 2: Docs**

Add to the README Files table:

```markdown
| `src/standings.ts` | This match's scoreboards: the room's match-end rule (`matchOutcome`, `winnerBonus`), room and solo rows (`roomBoard`, `soloBoard`), the filed line |
| `src/ui/standings.tsx` | The scoreboard table, at the top of the shop and on the end cards |
| `server/guard.php` | Tankity's settings for the kit's `Kit\ScoreGuard` (`tankity_guard()`, `tankity_initials()`; its run store is `guard-runs.json` in the storage directory), and `BLOCKED_INITIALS` (the same list as `src/initials.ts`) |
| `server/score-guard.php` | The kit's score guard, a generated copy written by `tools/install-files.php` (`kit_php`); never edit it |
| `server/board.php` | The all-time boards, one per difficulty, best 100 each, rows in the database (`board_file`, `board_top`), and the move of the per-callsign rows onto the Normal board (`board_convert_callsigns`) |
```

and a section before `## Drone aim`:

```markdown
## Match end and scoreboards

Solo is endless and ends at ♥ 0. A room with one human plays the same way. A
room that started with two or more humans ends when only one human has lives
left: that human wins, with a winner's bonus of twice the round bonus
(`room_match_outcome`, `room_winner_bonus`; `src/standings.ts` is the same
rule, pinned by the `match-end` vectors). The drones' 40-turn watch cap stays.

The server keeps each human's match (rounds won, kills, this round's gain, the
round the last life went) and sends it in every snapshot. The shop opens under
this match's scoreboard after every round; a finished room match shows the final
standings with ♛ on the winner, **Play again (same room)** (back to the lobby
with the same code and seats, every human on fresh lives, score and cash) and
**Leave room**; losing your last life while others play shows the same table
with **Watch the finish**, and Menu → Standings brings it back. A solo match
shows its rounds the same way and heads its end card with them.

Scores file themselves: a room's server files each human when the last life
goes and the winner when the match ends; a solo run is sent the moment it ends.
There is one all-time board per difficulty (Easy, Normal, Hard), each keeping
its best 100 runs (`server/board.php`); a run files on its difficulty's board
(a room's is its host's), and the rows from before the boards had a difficulty
are on Normal. Menu → Scores opens on the player's current difficulty, with a
switcher to the other two, shows the top 20 with the player's own runs
marked, and an end card says "Filed · #12 all-time on Normal" when a run places.
```

In the Storage section (PR 20), `tankity.sqlite` now also holds the boards, the directory also holds `guard-runs.json` (the score guard's run tokens and rate stamps), and housekeeping also moves per-callsign rows onto the Normal board.

In the Tests table add `RoomMatchEndTest`, `RoomStandingsTest`, `RoomFilingTest`, `RoomAgainTest`, `BoardTest` with a one-line description each, and `test/standings.test.mjs` and `test/scores-ui.test.mjs`.

- [ ] **Step 3: Full gate, PR**

Run (in `websites/www.cs`): `make test` then `make e2e E2E_ARGS="tankity-rooms-shop.spec.mjs"`
Expected: green.

```bash
git add tests/e2e/tankity-end.spec.mjs games/tankity/README.md
git commit -F- <<'MSG'
Tankity match end: browser spec and docs

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb
MSG
git push -u origin games/tankity-match-end
gh pr create --title "Tankity: last human standing, scoreboards, Play again, auto-filed scores" --body "Spec row 15 (sections 7.2, 7.3; auto-filing and a board per difficulty from 8). The per-callsign rows PR 20 imported move onto the Normal board on the first request after the deploy.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb"
```

This PR needs Plan C's PR 10 (the score guard and `kit_php`) and PR 12 (initials, the title card) on `main`; if `main` moved, rebase and rebuild the generated files (Global Constraints). Run the pr-fix loop, gate on required checks as in PR 14, merge on green, `make deploy`, and check live: open Menu → Scores on `/play/tankity/?v=<sha>`, see the converted callsigns on the Normal board, and switch to Easy and Hard (empty until runs file there). Report the cache-busted link.

---

# PR 16: score integrity — guard, the server plays each solo round, initials

Branch `games/tankity-score-integrity`, worktree `.claude/worktrees/tankity-score-integrity`, off `main` after PR 15 merged.

### Task 21: Determinism audit: every number the server's solo play depends on

**Files:**
- Modify: `games/tankity/src/sim.ts` (`rad`, `dist`, `powi`; `muzzle`, `fireWeapon`, `simShot`, `inHitBox`, `steerShell`, `splitShell`, `sweepHit`, `rollHit`, `explode`, `stepShells`)
- Modify: `games/tankity/src/ai.ts` (`aiChoose`'s bracket shrink)
- Modify: `games/tankity/server/sim.php` (`room_dist`, `room_powi`; `room_seek_push`, `room_split_vel`, `room_explode`, `room_in_box`, `room_sweep_hit`, `room_roll_hit`, `room_fly_arc`)
- Modify: `games/tankity/server/ai.php` (`room_ai_choose`'s bracket shrink)
- Modify: `games/tankity/protocol/sim-vectors.php` (drop two known cases; add a lance bracket case)
- Create: `games/tankity/test/determinism.test.mjs`
- Modify: `games/tankity/README.md` (new section "Solo determinism")

**Interfaces:**
- Consumes: the difficulty PR's `DIFFICULTY`, `DIFFICULTIES` and `aimSkill()` (`src/ai.ts`) and `ROOM_DIFFICULTY` / `room_difficulty()` (`server/ai.php`).
- Produces: `rad(deg: number): number` (`(deg / 180) * Math.PI`, PHP `deg2rad`'s order); `dist(dx: number, dy: number): number` (`Math.sqrt(dx*dx + dy*dy)`); `powi(b: number, n: number): number` (b multiplied n times); PHP `room_dist(float $dx, float $dy): float`, `room_powi(float $b, int $n): float`.

The audit, done before this task's code (the executor re-verifies each line against the source):

| Where | What the server's play depends on | Same on both sides? | Action |
|---|---|---|---|
| `hashSeed` / `room_hash_seed`, `mulberry32` / `room_rng_next` | integer hashing and the stream | bit-identical (`imul32`), pinned by `rng` vectors | none |
| `genTerrain` | 9 draws + `sin` ×3 per column, clamp; **plus 20 cloud draws** | PHP `room_gen_terrain` draws 9 | solo PHP draws the 20 (`solo_gen_terrain`, Task 28) |
| solo wind `Math.round((rng*2-1)*8)`, shift `Math.round(wind + gauss*2)` | half-way values go up in JS, away from zero in PHP | differs on negative halves | solo PHP uses `js_round()` (Task 28) |
| `spawnSpots`, damage `Math.round`, AI angle/power `Math.round` | positive (or clamped) values only | same | none |
| degrees→radians | `angle * PI / 180` vs `deg2rad` = `(deg / 180) * PI` | may differ in the last bit | TS adopts PHP's order (`rad`) |
| `Math.hypot` vs `hypot()` | sweep sample counts, blast distances, flak, seek, cluster speed | engines may differ in the last bit | both sides use `sqrt` of the squares |
| `** 2` in hit boxes | `Math.pow` vs C `pow` | may differ | both multiply |
| seeker within 1 px | TS clamps the distance to 1 and steers; PHP skips | differs (a known vector case) | TS skips, like PHP |
| cluster bomblets | TS ignores ground for a bomblet's first 0.1 s; PHP's bomblets start at age 99 | differs when a cluster splits near the ground | TS bomblets may burst on the ground at once (`s.split ||`) |
| lance bracket | TS `explode()` marks a drone's bracket landing at the first pierce burst; PHP only at the final hit | differs for drones with lances (round 5 on) | PHP marks it at the pierce burst too |
| `sin`/`cos`/`atan2` (terrain, launch, cluster fan) | V8 fdlibm vs the host's libm | may differ by one ulp | accepted: a one-ulp drift flips a hit or a rounding only at an exact boundary (≈1e-13 per test); measured by the nightly long-run sweep (Task 30), and a run it touches is voided at that round, never filed wrong |
| shells flying a full 12 s | TS `life -= dt` (float) vs PHP 720 steps | can differ on the very last step | accepted: no weapon stays airborne 12 s on a 720×460 field |
| volley order | TS flies all pellets/bomblets together, holding a later burst until earlier ones land; the room server resolves them one by one | same outcome without falls, pinned by every `volley` vector | the solo server flies them together like the browser (`server/flight.php`, Task 29) |
| tank falls | TS drops tanks over craters between frames, including mid-volley; the room server snaps them after the volley | differs mid-volley | the browser keeps its falls and takes them inside the war's fixed steps (Task 23); the solo server takes the same steps, falls first, then shells (`server/flight.php`, Task 29, pinned by the `volley-fall` vectors); rooms keep snapping (they are refereed on the server and animated on the client) |
| frame `dt` | TS flies shells and drops tanks by the frame's `dt` | the server cannot know it | fixed 1/60 s steps for the whole war, falls included (Task 23) |
| `Math.random` | banter, sparks, the default seed | cosmetic or sent in the log | none (and `test/determinism.test.mjs` forbids it in the rule modules) |
| drone aim by difficulty | `DIFFICULTY` / `aimSkill(world.difficulty)` in `ai.ts` vs `ROOM_DIFFICULTY` / `room_difficulty($room)` in `ai.php`: the ranging wobble `max(wobFloor, wobStart - wobStep × round)`, the correction share, the bracket's shrink, floor and cap | the same seven numbers per level, and an unknown word is `normal` on both; pinned by the difficulty PR's per-level aim and bracket vectors | the run's start carries the match's difficulty (Task 33) and the server deals with it (Tasks 28, 31); `determinism.test.mjs` compares the two tables number by number |
| bracket shrink `brkShrink ** n` | `Math.pow` vs PHP's `**` (C `pow`) with an integer exponent | may differ in the last bit | both sides multiply n times (`powi()` / `room_powi()`) |
| arsenal | the browser plays `game.json`'s, or the baked fallback if it failed to load | the server reads `game.json` | a run on the fallback is not sent (Task 25) |
| seeds | `charCodeAt` (UTF-16) vs `ord` (bytes) | differ beyond ASCII | only printable-ASCII seeds are sent (Task 25) and started (Task 31) |

- [ ] **Step 1: Write the failing guard test**

```js
// games/tankity/test/determinism.test.mjs
// The rule modules the server's solo play depends on must compute the same
// numbers in the browser and on the server: no wall clock, no Math.random, no
// Math.hypot, no powers, no degree conversion other than rad(). See README
// "Solo determinism".
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { rad, dist, powi } from '../src/sim.ts';
import { DIFFICULTIES, DIFFICULTY, aimSkill } from '../src/ai.ts';

const dir = path.join(import.meta.dirname, '..');
const read = f => fs.readFileSync(path.join(dir, f), 'utf8').replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');

for (const file of ['src/sim.ts', 'src/ai.ts', 'src/armor.ts']) {
  test(`${file} uses only replay-safe math`, () => {
    const src = read(file);
    for (const banned of [/Math\.random/, /Math\.hypot/, /\*\*/, /Date\.now|performance\.now/, /\* Math\.PI \/ 180/]) {
      assert.doesNotMatch(src, banned, `${file} must not use ${banned}`);
    }
  });
}

for (const file of ['server/sim.php', 'server/ai.php']) {
  test(`${file} uses only replay-safe math`, () => {
    const src = read(file);
    for (const banned of [/\bhypot\(/, /\*\*\s*2\b/, /\bmt_rand|\brand\(|random_int|microtime/]) {
      assert.doesNotMatch(src, banned, `${file} must not use ${banned}`);
    }
  });
}

test('server/ai.php raises nothing to a power (the bracket shrink multiplies)', () => {
  assert.doesNotMatch(read('server/ai.php'), /\*\*/);
});

test('rad() rounds like PHP deg2rad', () => {
  assert.equal(rad(62), (62 / 180) * Math.PI);
  assert.equal(rad(45.3), (45.3 / 180) * Math.PI);
});

test('dist() is the root of the squares', () => {
  assert.equal(dist(3, 4), 5);
  assert.equal(dist(-1e-3, 2), Math.sqrt(1e-6 + 4));
});

test('powi() is repeated multiplication', () => {
  assert.equal(powi(0.65, 0), 1);
  assert.equal(powi(0.65, 3), 0.65 * 0.65 * 0.65);
});

test('the difficulty table is the same numbers on both sides, and an unknown word aims at normal', () => {
  const php = fs.readFileSync(path.join(dir, 'server/ai.php'), 'utf8');
  for (const level of DIFFICULTIES) {
    const row = php.match(new RegExp(`'${level}' => \\[([^\\]]*)\\]`));
    assert.ok(row, `ROOM_DIFFICULTY has no ${level} row`);
    const got = Object.fromEntries([...row[1].matchAll(/'(\w+)' => (-?[\d.]+)/g)].map(m => [m[1], Number(m[2])]));
    assert.deepEqual(got, { ...DIFFICULTY[level] }, level);
  }
  assert.equal(aimSkill('brutal'), DIFFICULTY.normal);
  assert.equal(aimSkill(undefined), DIFFICULTY.normal);
});
```

Run (in `games/tankity`): `node --test test/determinism.test.mjs`
Expected: FAIL (`rad` not exported; `src/sim.ts must not use /Math\.hypot/`; `src/ai.ts must not use /\*\*/` at the bracket shrink). (`room_pace_stamp` uses `microtime` in `rules.php`, which this test does not read.)

- [ ] **Step 2: Align the browser sim**

In `src/sim.ts`, after `clamp`:

```ts
/* Degrees to radians in PHP deg2rad()'s order, (deg / 180) * PI, so the
   server's play and the browser agree to the last bit. */
export function rad(deg: number): number {
  return (deg / 180) * Math.PI;
}
/* A distance as the root of the squares: correctly rounded in every engine,
   where Math.hypot and C's hypot() may differ in the last bit. */
export function dist(dx: number, dy: number): number {
  return Math.sqrt(dx * dx + dy * dy);
}
/* b to a small whole power by repeated multiplication: Math.pow and PHP's **
   may round the last bit differently. */
export function powi(b: number, n: number): number {
  let r = 1;
  for (let i = 0; i < n; i++) r *= b;
  return r;
}
```

Then, quoting each current line and its replacement:

- `inHitBox`: `return ((x - b.cx) / b.rx) ** 2 + ((y - b.cy) / b.ry) ** 2 <= 1;` → `const u = (x - b.cx) / b.rx, v = (y - b.cy) / b.ry;\n  return u * u + v * v <= 1;`
- `muzzle`: `const rad = t.angle * Math.PI / 180;` → `const a = rad(t.angle);` and the return uses `a`: `return { x: t.x + Math.cos(a) * 20 * s, y: t.y - 14 - Math.sin(a) * 20 };`
- `fireWeapon`: `const rad = t.angle * Math.PI / 180;` → `const r0 = rad(t.angle);`; `const a = rad + off;` → `const a = r0 + off;`; the return's `Math.atan2(-Math.sin(rad), Math.cos(rad) * s)` → `Math.atan2(-Math.sin(r0), Math.cos(r0) * s)`.
- `simShot`: `const rad = angle * Math.PI / 180;` → `const r = rad(angle);`, and `Math.cos(rad)` / `Math.sin(rad)` → `Math.cos(r)` / `Math.sin(r)`.
- `steerShell`: replace the body after the loop:

```ts
export function steerShell(tanks: readonly Tank[], s: Shell, w: Weapon, dt: number): void {
  let best: Tank | null = null, bd = Infinity;
  for (const t of tanks) {
    if (t.hp <= 0 || t === s.owner) continue;
    const d = dist(t.x - s.x, (t.y - 12) - s.y);
    if (d < bd) { bd = d; best = t; }
  }
  // On top of its target a seeker has nowhere to bend (server/sim.php room_seek_push).
  if (!best || bd <= 1) return;
  const push = (w.steer || 70) * dt;
  s.vx += ((best.x - s.x) / bd) * push;
  s.vy += (((best.y - 12) - s.y) / bd) * push;
}
```

- `splitShell`: `Math.hypot(s.vx, s.vy) * 0.85` → `dist(s.vx, s.vy) * 0.85`.
- `sweepHit`, `rollHit`: `Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 3)` → `Math.ceil(dist(x1 - x0, y1 - y0) / 3)`.
- `explode`: `const d = Math.hypot(b.cx - x, b.cy - y);` → `const d = dist(b.cx - x, b.cy - y);`
- `stepShells` flak: `const d = Math.hypot(s.x - t.x, s.y - (t.y - 12));` → `const d = dist(s.x - t.x, s.y - (t.y - 12));`
- `src/ai.ts` `aiChoose` (the difficulty PR's bracket): `wob = Math.max(skill.brkFloor, wob * skill.brkShrink ** n);` → `wob = Math.max(skill.brkFloor, wob * powi(skill.brkShrink, n));`, and add `powi` to its `./sim.ts` import.
- `stepShells` ground: `const grounded = s.age >= 0.1 && s.y >= surfY(world.terrain, s.x);` → 

```ts
    // A bomblet may burst on the ground at once; a fresh shell ignores it for
    // 0.1 s (server/sim.php room_fly_arc starts bomblets at age 99).
    const grounded = (s.split || s.age >= 0.1) && s.y >= surfY(world.terrain, s.x);
```

- [ ] **Step 3: Align the server sim**

In `server/sim.php`, after `room_rng_range()`:

```php
/* A distance as the root of the squares (src/sim.ts dist()). */
function room_dist(float $dx, float $dy): float
{
    return sqrt($dx * $dx + $dy * $dy);
}

/* $b to a small whole power by repeated multiplication (src/sim.ts powi()). */
function room_powi(float $b, int $n): float
{
    $r = 1.0;
    for ($i = 0; $i < $n; $i++) {
        $r *= $b;
    }
    return $r;
}
```

In `server/ai.php` `room_ai_choose()`, replace `$wob = max($skill['brkFloor'], $wob * $skill['brkShrink'] ** $n);` with `$wob = max($skill['brkFloor'], $wob * room_powi($skill['brkShrink'], $n));`.

Replace each `hypot(` call (lines 191, 208, 356, 457, 482, 547) with `room_dist(` keeping the arguments, and `room_in_box`'s return with:

```php
    $u = ($x - $cx) / $rx;
    $v = ($y - $cy) / $ry;
    return $u * $u + $v * $v <= 1;
```

In `room_fly_arc()`'s pierce branch, before `$mark = count($events);`:

```php
                // The bracket learns where the volley first burst, as src/sim.ts explode() does.
                if (isset($room['tanks'][$ownerIdx]['brk']) && $room['tanks'][$ownerIdx]['brk']['land'] === null) {
                    $room['tanks'][$ownerIdx]['brk']['land'] = $sx;
                }
```

- [ ] **Step 4: The vectors agree now**

In `protocol/sim-vectors.php` delete `'seek-push/half-a-pixel-away' => ['out'],` and `'seek-push/exactly-one-pixel-away' => ['out'],` from `SV_KNOWN_PATHS`, and the trailing reason arguments of the two `$seek('half-a-pixel-away', ...)` / `$seek('exactly-one-pixel-away', ...)` calls (current lines 257–260):

```php
$seek('half-a-pixel-away', [$human(100), $drone(150)], 0, 150.5, 388, 70, 1 / 60);
$seek('exactly-one-pixel-away', [$human(100), $drone(150)], 0, 150, 389, 70, 1 / 60);
```

Add a bracket case after `drone-with-a-rack`:

```php
$bracket('lance-marks-its-first-burst', ['terrain' => $flat, 'wind' => 0, 'round' => 6, 'seed' => 23, 'shooter' => 2, 'target' => 0, 'shots' => 4,
    'tanks' => [$human(150, 9999), $drone(330, 9999), $drone(560, 9999) + ['dirS' => -1, 's' => 'glory', 'ammo' => ['lance' => 9]]]]);
```

- [ ] **Step 5: Run everything that pins the sims**

Run (in `games/tankity`): `php protocol/sim-vectors.php && node --test test/determinism.test.mjs test/sim-vectors.test.mjs test/preview.test.mjs` then (in `websites/www.cs`) `vendor/bin/phpunit --testsuite tankity`
Expected: PASS; `SIM-VECTORS-OK ... (1 known differences)` (only `ai-aim/no-rivals-left` remains known). `sim-vectors.json` is regenerated on top of the difficulty PR: its per-level aim and bracket cases (`easy-…`, `normal-…`, `hard-…`, `brutal-…`) now run through `powi`/`room_powi` on both sides and must stay green, as must Tasks 4 and 13's groups.

- [ ] **Step 6: Docs**

Add a README section after `## Sim vectors`:

```markdown
## Solo determinism

A solo score is earned by the server playing every round with the PHP sim
(`server/solo.php` and `server/flight.php` over `server/sim.php`, `ai.php`,
`rules.php`), so every number the outcome depends on must come out the same in
the browser and on the server:

- the drones aim from one table per difficulty (`DIFFICULTY` in `src/ai.ts`,
  `ROOM_DIFFICULTY` in `server/ai.php`, the same numbers); a run starts with
  the match's difficulty, so the server's drones aim as the browser's did;
- one random stream per match (`hashSeed(seed)` → `mulberry32`), drawn in the
  same order: the deal's hills and clouds, then per round hills and clouds,
  wind, spawn spots and new drones' strategies, every drone choice, and the
  wind shift after every settled volley;
- the war runs in fixed 1/60 s steps whatever the frame rate: each step drops
  any tank left over a crater, then moves every shell, so a tank falls while
  shells are still in the air on both sides alike;
- no `Math.hypot`/`hypot()`, powers or other last-bit-sensitive helpers in the
  rule modules: distances are `dist()`/`room_dist()`, whole powers are
  `powi()`/`room_powi()`, degrees go through
  `rad()` in PHP `deg2rad`'s order, and JavaScript's `Math.round` is
  `js_round()` in PHP where a value can be a negative half;
- `sin`, `cos` and `atan2` remain; a last-bit difference there changes an
  outcome only at an exact boundary, and the nightly long-run sweep measures it.

`test/determinism.test.mjs` keeps the banned calls out; the sim vectors
(`volley-fall` among them) and `protocol/solo-runs.json` keep the two sides
agreeing.
```

- [ ] **Step 7: Commit**

```bash
git add games/tankity/src/sim.ts games/tankity/src/ai.ts games/tankity/server/sim.php games/tankity/server/ai.php games/tankity/protocol games/tankity/test/determinism.test.mjs games/tankity/README.md games/tankity/dist
git commit -F- <<'MSG'
Tankity: determinism audit; browser and server sims agree to the last bit where they can

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb
MSG
```

### Task 22: The solo referee, out of match.ts

**Files:**
- Create: `games/tankity/src/solo.ts`
- Create: `games/tankity/test/solo.test.mjs`
- Modify: `games/tankity/src/match.ts` (`resetMatch`, `newRound`, `nextTurn`, `settle`, `aiPlanAim`; delete `genTerrain`, `FOE_DEFS`, `droneRack`, `aiChoose`)
- Modify: `games/tankity/src/main.ts` (the 1-up loop)
- Modify: `games/tankity/tsconfig.json` (`files` + `src/solo.ts`)

**Interfaces:**
- Consumes: `armor.ts`, `ai.ts` (`aiChoose`, `pickTactic`; `aiChoose` reads `world.difficulty` through `aimSkill()`), `flow.ts` (`WATCH_TURNS`), `sim.ts` (`type Difficulty`); the difficulty PR's `MatchDeps.difficulty` and its `G.difficulty = difficulty.get()` in `resetMatch()`.
- Produces: `SOLO_STEP = 1 / 60`; `FOES`; `interface SoloTank extends Tank { maxHp: number; color?: string; body?: string }`; `interface SoloState extends World { seed; difficulty: Difficulty; body; clouds; tanks: SoloTank[]; turn; firstTurn; lives; nextOneUp; roundsWon; tactics; watchTurns; armor; plate; fuelBank }` (`difficulty` is required here, where `World` has it optional); `soloDeal(G: SoloState, arsenal: Arsenal, seed: string, difficulty: Difficulty): void` (the match keeps its difficulty from the deal on); `soloMuster(G: SoloState, arsenal: Arsenal): void`; `snapTanks(G: Pick<SoloState, 'tanks' | 'terrain'>): void`; `soloNextTurn(G: SoloState): void`; `type Settled = { kind: 'next' } | { kind: 'roundWon'; bonus: number; prize: number } | { kind: 'tankLost' } | { kind: 'matchLost' }`; `soloSettle(G: SoloState): Settled`; `type OneUp = 'life' | 'points'`; `soloOneUps(G: SoloState): OneUp[]`; `soloAim(G: SoloState, arsenal: Arsenal, t: SoloTank): AimChoice`.

- [ ] **Step 1: Write the failing test**

```js
// games/tankity/test/solo.test.mjs
// The solo referee (src/solo.ts) without a page: the deal, a round's muster,
// settling a volley, the turn order and 1-ups.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { buildArsenal, TUNE } from '../src/sim.ts';
import { soloAim, soloDeal, soloMuster, soloSettle, soloNextTurn, soloOneUps } from '../src/solo.ts';

const GAME = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'game.json'), 'utf8'));
const arsenal = buildArsenal(GAME.arsenal);
const fresh = (seed, level = 'normal') => { const G = { body: 'tank' }; soloDeal(G, arsenal, seed, level); return G; };
const round1 = (seed, level = 'normal') => { const G = fresh(seed, level); G.round = 1; soloMuster(G, arsenal); return G; };

test('a deal is the stake, three lives and full armor', () => {
  const G = fresh('alpha');
  assert.equal(G.cash, 600);
  assert.equal(G.lives, TUNE.lives);
  assert.equal(G.armor, 100);
  assert.equal(G.ammo.shell, Infinity);
  assert.equal(G.ammo.buck, 1);
  assert.equal(G.round, 0);
});

test('the same seed musters the same round', () => {
  const a = round1('alpha'), b = round1('alpha'), c = round1('beta');
  assert.deepEqual(a.terrain, b.terrain);
  assert.deepEqual(a.tanks.map(t => [t.x, t.s]), b.tanks.map(t => [t.x, t.s]));
  assert.equal(a.wind, b.wind);
  assert.notDeepEqual(a.terrain, c.terrain);
  assert.equal(a.tanks.length, 4);
  assert.equal(a.tanks[0].hp, 100);
  assert.equal(a.tanks[1].hp, TUNE.droneArmor);
});

test('a round won pays the bonus and carries the armor', () => {
  const G = round1('alpha');
  G.tanks[0].hp = 64;
  for (const t of G.tanks.slice(1)) t.hp = 0;
  const end = soloSettle(G);
  assert.deepEqual(end, { kind: 'roundWon', bonus: 900, prize: 600 });
  assert.equal(G.score, 900);
  assert.equal(G.armor, 64);
  assert.equal(G.roundsWon, 1);
});

test('a wreck costs a life and re-musters at full max; the last life ends the match', () => {
  const G = round1('alpha');
  G.plate = 1;
  G.tanks[0].hp = 0;
  G.tanks[1].hp = 0; G.tanks[2].hp = 0;
  assert.deepEqual(soloSettle(G), { kind: 'tankLost' });
  assert.equal(G.lives, 2);
  assert.equal(G.armor, 125);
  G.lives = 1;
  G.tanks[0].hp = 0;
  assert.deepEqual(soloSettle(G), { kind: 'matchLost' });
  assert.equal(G.lives, 0);
});

test('play goes on, the wind shifts, and the turn skips the wrecked', () => {
  const G = round1('alpha');
  G.turn = 0;
  G.tanks[1].hp = 0;
  assert.deepEqual(soloSettle(G), { kind: 'next' });
  assert.equal(G.turn, 2);
  G.turn = 3; soloNextTurn(G);
  assert.equal(G.turn, 0);
});

test('with the player down the drones get WATCH_TURNS settles', () => {
  const G = round1('alpha');
  G.tanks[0].hp = 0;
  let end;
  for (let i = 0; i < 40 && (!end || end.kind === 'next'); i++) end = soloSettle(G);
  assert.deepEqual(end, { kind: 'tankLost' });
  assert.equal(G.watchTurns, 40);
});

test('the deal keeps its difficulty, and the drones aim with it', () => {
  assert.equal(fresh('alpha', 'hard').difficulty, 'hard');
  const easy = round1('alpha', 'easy'), hard = round1('alpha', 'hard');
  const aim = G => { const t = G.tanks[1]; const c = soloAim(G, arsenal, t); return [c.wkey, c.angle, c.power]; };
  assert.notDeepEqual(aim(easy), aim(hard));
});

test('1-ups: a life per 3000, or 500 points at five lives', () => {
  const G = fresh('alpha');
  G.score = 6100;
  assert.deepEqual(soloOneUps(G), ['life', 'life']);
  assert.equal(G.lives, 5);
  G.score = 9000;
  assert.deepEqual(soloOneUps(G), ['points', 'points']);
  assert.equal(G.score, 10000);
});
```

Run (in `games/tankity`): `node --test test/solo.test.mjs`
Expected: FAIL, module not found.

- [ ] **Step 2: Write the referee**

```ts
// games/tankity/src/solo.ts
/* Operation Tankity: the solo referee.
 *
 * The rules of a match against the drone battery, without a page: dealing,
 * mustering a round, the turn order, settling a volley, 1-ups, a drone's aim
 * and the shop. match.ts plays them with words and sound; solo-play.ts runs
 * them headless; server/solo.php is the same rules for the server's play of
 * each round. Nothing here reads a clock or Math.random. */
import { aiChoose, pickTactic } from './ai.ts';
import type { AimChoice } from './ai.ts';
import { carryArmor, maxArmor } from './armor.ts';
import { WATCH_TURNS } from './flow.ts';
import { TUNE, W, clamp, droneRack, gauss, genTerrain, hashSeed, mulberry32, spawnSpots, surfY } from './sim.ts';
import type { Arsenal, Cloud, Difficulty, Tank, World } from './sim.ts';

/** Every war step is this long, in the browser and in the server's play. */
export const SOLO_STEP = 1 / 60;
export const FOES = [
  { id: 'reaper', color: '#ff0000' },
  { id: 'wraith', color: '#00ffff' },
  { id: 'spotter', color: '#ff00ff' },
] as const;

export interface SoloTank extends Tank { maxHp: number; color?: string; body?: string }
export interface SoloState extends World {
  seed: string;
  /** How well the drones aim this match (ai.ts DIFFICULTY); set at the deal, never during play. */
  difficulty: Difficulty;
  body: string;
  clouds: Cloud[];
  tanks: SoloTank[];
  turn: number;
  firstTurn: number;
  lives: number;
  nextOneUp: number;
  roundsWon: number;
  tactics: Record<string, string>;
  watchTurns: number;
  armor: number;
  plate: number;
  fuelBank: number;
}

/** A new match at a difficulty: the stake, three lives, full armor, and the pre-match hills (drawn, never fought on). */
export function soloDeal(G: SoloState, arsenal: Arsenal, seed: string, difficulty: Difficulty): void {
  G.seed = seed;
  G.difficulty = difficulty;
  G.rng = mulberry32(hashSeed(seed));
  G.lives = TUNE.lives;
  G.score = 0;
  G.cash = 600;
  G.nextOneUp = TUNE.oneUpEvery;
  G.roundsWon = 0;
  G.round = 0;
  G.tactics = {};
  G.firstTurn = 0;
  G.ammo = { shell: Infinity, buck: 1 };
  for (const k of arsenal.order) if (!(k in G.ammo)) G.ammo[k] = 0;
  G.selected = 'shell';
  G.fuelBank = 0;
  G.armor = TUNE.playerArmor;
  G.plate = 0;
  G.shield = false;
  G.jammer = 0;
  G.bunker = 0;
  G.laststand = false;
  G.watchTurns = 0;
  const g = genTerrain(G.rng);
  G.terrain = g.terrain;
  G.clouds = g.clouds;
  G.tanks = [];
  G.shells = [];
}

/** A round's hills, wind and four units, spread anywhere; the opener rotates round by round. */
export function soloMuster(G: SoloState, arsenal: Arsenal): void {
  const g = genTerrain(G.rng);
  G.terrain = g.terrain;
  G.clouds = g.clouds;
  G.watchTurns = 0;
  G.wind = Math.round((G.rng() * 2 - 1) * 8);
  const order = spawnSpots(1 + FOES.length, G.rng);
  const fuel = TUNE.fuel + (G.fuelBank || 0);
  G.fuelBank = 0;
  G.tanks = [{
    id: 'tank', isPlayer: true, color: '#ffff00', body: G.body,
    x: order[0]!, y: 0, angle: 62, power: 55, hp: G.armor, maxHp: maxArmor(G.plate), fuel,
  }];
  FOES.forEach((f, i) => {
    // Endless escalation: thicker armor and a deeper magazine every round.
    const armor = TUNE.droneArmor + 6 * (G.round - 1);
    G.tanks.push({
      id: f.id, isPlayer: false, color: f.color,
      x: order[i + 1]!, y: 0, angle: 62, power: 55, hp: armor, maxHp: armor, fuel: 0,
      ammo: droneRack(arsenal, G.round),
      s: G.tactics[f.id] || (G.tactics[f.id] = pickTactic(G.rng)),
    });
  });
  for (const t of G.tanks) {
    t.y = surfY(G.terrain, t.x);
    t.dirS = t.x < W / 2 ? 1 : -1; // face the middle of the field
  }
  G.turn = G.firstTurn % G.tanks.length;
  G.firstTurn++;
  G.shells = [];
}

/** Standing tanks sit exactly on the ground once the falls are over (fallTanks
 *  stops within half a pixel); server/solo.php solo_settle() does the same. */
export function snapTanks(G: Pick<SoloState, 'tanks' | 'terrain'>): void {
  for (const t of G.tanks) {
    if (t.hp <= 0) continue;
    t.y = surfY(G.terrain, t.x);
    t.vy = 0;
  }
}

export function soloNextTurn(G: SoloState): void {
  const n = G.tanks.length;
  for (let k = 1; k <= n; k++) {
    if (G.tanks[(G.turn + k) % n]!.hp > 0) { G.turn = (G.turn + k) % n; return; }
  }
}

export type Settled =
  | { kind: 'next' }
  | { kind: 'roundWon'; bonus: number; prize: number }
  | { kind: 'tankLost' }
  | { kind: 'matchLost' };

/** After a volley: play on (the wind shifts, the next unit is up), or the round ends. */
export function soloSettle(G: SoloState): Settled {
  snapTanks(G);
  const me = G.tanks[0]!;
  const alive = G.tanks.filter(t => t.hp > 0).length;
  // A round ends with one unit left; with the player wrecked the drones fight
  // on for at most WATCH_TURNS settles, so a stalemate cannot run forever.
  if (alive > 1 && !(me.hp <= 0 && ++G.watchTurns >= WATCH_TURNS)) {
    G.wind = clamp(Math.round(G.wind + gauss(G.rng) * 2), -12, 12);
    soloNextTurn(G);
    return { kind: 'next' };
  }
  if (me.hp <= 0) {
    G.lives -= 1;
    G.armor = carryArmor({ armor: G.armor, plates: G.plate }, 0, true).armor;
    if (G.lives <= 0) { G.lives = 0; return { kind: 'matchLost' }; }
    return { kind: 'tankLost' };
  }
  G.roundsWon += 1;
  const bonus = TUNE.roundWinScore + G.round * 150;
  const prize = TUNE.roundWinCash + G.round * 100;
  G.score += bonus;
  G.cash += prize;
  // Trick timers tick down on claimed rounds, not on wrecked restarts.
  if (G.jammer > 0) G.jammer--;
  if (G.bunker > 0) G.bunker--;
  G.armor = carryArmor({ armor: G.armor, plates: G.plate }, me.hp, false).armor;
  return { kind: 'roundWon', bonus, prize };
}

export type OneUp = 'life' | 'points';
/** Every 3000 points a life, up to five; past five, 500 points instead. */
export function soloOneUps(G: SoloState): OneUp[] {
  const out: OneUp[] = [];
  while (G.score >= G.nextOneUp) {
    G.nextOneUp += TUNE.oneUpEvery;
    if (G.lives < TUNE.maxLives) { G.lives += 1; out.push('life'); }
    else { G.score += 500; out.push('points'); }
  }
  return out;
}

/** A drone's choice for its turn, aimed at the match's difficulty (aiChoose reads
 *  G.difficulty); a strategy switch is remembered for later rounds. */
export function soloAim(G: SoloState, arsenal: Arsenal, t: SoloTank): AimChoice {
  const plan = aiChoose(G, arsenal, t);
  if (plan.tactic) G.tactics[t.id] = plan.tactic;
  return plan;
}
```

Add `"src/solo.ts"` to `tsconfig.json` `files`.

- [ ] **Step 3: match.ts plays the referee**

In `src/match.ts` import `{ FOES, SOLO_STEP, snapTanks, soloAim, soloDeal, soloMuster, soloNextTurn, soloSettle } from './solo.ts'` and drop now-unused imports (`hashSeed`, `mulberry32`, `simDroneRack`, `simGenTerrain`, `spawnSpots`, `pickTactic`, `simAiChoose`). Delete `genTerrain()`, `FOE_DEFS`, `droneRack()` and the `aiChoose(t)` wrapper (`simAiChoose(G, tables.arsenal!, t)`). The difficulty pass-through stays: the `difficulty` dep (`MatchDeps.difficulty: Pick<DifficultySetting, 'get'>` and its `import type { DifficultySetting }`) stays, `resetMatch()` hands `difficulty.get()` to `soloDeal`, which sets `G.difficulty`, and `soloAim` → `aiChoose(G, …)` reads it, as the wrapper did.

`resetMatch()` becomes:

```ts
  function resetMatch(seedStr?: string): void {
    const seed = (seedStr || '').trim() || ('scorched-' + Math.floor(Math.random() * 9000 + 1000));
    // The Menu's Difficulty, read once per match: a change waits for the next one.
    soloDeal(G, tables.arsenal!, seed, difficulty.get());
    G.shopSel = 0;
    G.shopQty = 1;
    G.rounds = [];
    G.roundStart = { score: 0, cash: G.cash };
    G.over = false;
    const endVeil = $('end-veil');
    if (endVeil) endVeil.hidden = true; // a new match never sits on the last one's result
    G.won = false;
    G.demo = false;
    G.demoHint = false;
    G.time = 0;
    G.dlgQ = [];
    G.dlgT = 0;
    G.lastTalk = -99;
    G.banterT = 24;
    G.bannerT = 0;
    G.bannerDone = null;
    G.cam = { z: 1, cx: W / 2, cy: H / 2 };
    if ($('round-banner')) $('round-banner')!.hidden = true;
    G.parts = [];
    G.booms = [];
    if (G.fx) G.fx.clear();
    closePreview();
    hideShop();
  }
```

`newRound()`'s body up to `if (G.fx) G.fx.clear();` becomes:

```ts
    soloMuster(G, tables.arsenal!);
    G.roundStart = { score: G.score, cash: G.cash };
    G.parts = [];
    G.booms = [];
    if (G.fx) G.fx.clear();
```

(the rest — music, `advance(event)`, banner — is unchanged).

Replace `nextTurn()` with the page half of a turn:

```ts
  /* Says whose turn it is, after soloSettle or soloNextTurn picked it. */
  function announceTurn(): void {
    const t = cur();
    if (t.isPlayer && !G.demo) {
      advance('playerUp');
      say('Your turn. Aim!', 'info');
    } else {
      advance('foeUp');
      G.thinkT = TUNE.thinkTime;
      say(`${t.isPlayer ? 'Tankity tank' : t.id} is aiming…`, 'info');
      if (Math.random() < 0.4) talk(t.id, pick(FOE_FIRE[t.id] || FOE_MISS));
    }
    render();
    renderHUD();
  }
```

Replace `settle()` with:

```ts
  function settle(): void {
    if (G.demo) {
      if (me().hp <= 0) {
        G.armor = maxArmor(G.plate);
        say('Demo tank wrecked. Rolling a fresh one.', 'info');
        newRound('Back in! Same hills, fresh tank.', 'tankLost');
        return;
      }
      if (!foesAlive().length) {
        G.armor = me().hp;
        G.round += 1;
        newRound(undefined, 'roundWon');
        return;
      }
      snapTanks(G);
      G.wind = clamp(Math.round(G.wind + gauss(G.rng) * 2), -12, 12);
      soloNextTurn(G);
      announceTurn();
      return;
    }
    const end = soloSettle(G);
    if (end.kind === 'next') { announceTurn(); return; }
    if (end.kind === 'roundWon') {
      recordRound(true);
      sfx.play('win');
      say(`Round ${G.round} won! +${end.bonus} pts, +$${end.prize}. The battery rebuilds meaner, so spend it wisely.`, 'good');
      exchange('tank', 'tankity tank! Hill claimed!', pick(['reaper', 'wraith', 'spotter']),
        pick(['Lucky shot, treads...', 'The hill was... too hilly...', 'Recharge... revenge...']));
      advance('roundWon');
      startBanner(`Round ${G.round} claimed! Spend the winnings.`, openShop);
      return;
    }
    recordRound(false);
    if (end.kind === 'matchLost') {
      endMatch(false, 'The tank is scrap across these hills. The battery keeps the high ground.');
      return;
    }
    say(`Round ${G.round} goes to the battery. ${G.lives} ${G.lives === 1 ? 'life' : 'lives'} left. Restock and roll again.`, 'bad');
    talk('tank', 'I will be back... after shopping!', true);
    advance('tankLost');
    startBanner(`Round ${G.round} lost. Restock and roll again.`, openShop);
  }
```

`aiPlanAim()`: replace `const plan = aiChoose(t);` and the `if (plan.tactic) { G.tactics[t.id] = plan.tactic; ... }` block with:

```ts
    const plan = soloAim(G, tables.arsenal!, t);
    if (plan.tactic) say(`${t.id.toUpperCase()} switches to ${plan.tactic} tactics.`, 'info');
```

`src/main.ts` frame: replace the `while (!net.on && G.score >= G.nextOneUp) { ... }` loop with:

```ts
  if (!net.on) {
    for (const up of soloOneUps(G)) {
      if (up === 'life') {
        sfx.play('win');
        say(`1-UP! Extra life! (${G.lives}/${TUNE.maxLives} lives)`, 'good');
        talk('tank', 'Another life! I am basically immortal!', true);
      } else say('Max lives already, so take +500 points instead!', 'good');
    }
  }
```

(import `soloOneUps` from `./solo.ts`).

- [ ] **Step 4: Run**

Run (in `games/tankity`): `node ../_kit/build/build.mjs tankity && node --test 'test/*.test.mjs'`
Expected: PASS, including `solo.test.mjs` (8) and the smoke test's whole match; `grep -n "difficulty" src/match.ts` still shows the dep, its destructuring and the `soloDeal(..., difficulty.get())` call.

- [ ] **Step 5: Commit**

```bash
git add games/tankity/src games/tankity/test/solo.test.mjs games/tankity/tsconfig.json games/tankity/dist
git commit -F- <<'MSG'
Tankity: the solo referee in its own pure module

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb
MSG
```

### Task 23: Fixed-step war; tanks still fall mid-volley, inside the steps

Decision 2: tanks keep falling while shells fly. What changes is only that the war (a drone's aim, the flight, and every tank's fall) advances in fixed 1/60 s steps, each step dropping the tanks first and moving the shells second, so a server that knows only the moves can take the very same steps (Task 29).

**Files:**
- Modify: `games/tankity/src/flow.ts` (`runWar` → `runFixed`, `MAX_STEPS`)
- Modify: `games/tankity/src/main.ts` (`frame`)
- Create: `games/tankity/test/fixed-step.test.mjs`
- Modify: `games/tankity/test/flow.test.mjs` (delete its `runWar` checks and import)

**Interfaces:**
- Consumes: `SOLO_STEP`; `fallTanks`, `anyTankFalling` (`src/sim.ts`).
- Produces: `MAX_STEPS = 30`; `runFixed(acc: number, dt: number, h: number, step: (h: number) => boolean): number` (returns the carried remainder). In a solo match's think/fly/settle phases the frame drops tanks only inside those steps; elsewhere (aim, shop, demo banner) it keeps dropping them by the frame.

- [ ] **Step 1: Write the failing test**

```js
// games/tankity/test/fixed-step.test.mjs
// The solo war runs in fixed SOLO_STEP steps whatever the frame lengths, tank
// falls included, so the server's play of a round lands every shell and drops
// every tank exactly as the browser did.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runFixed, MAX_STEPS } from '../src/flow.ts';
import { SOLO_STEP } from '../src/solo.ts';
import { fallTanks, mulberry32 } from '../src/sim.ts';

function drive(frames) {
  const seen = [];
  let acc = 0;
  for (const dt of frames) acc = runFixed(acc, dt, SOLO_STEP, h => { seen.push(h); return true; });
  return seen;
}

test('every step is exactly SOLO_STEP whatever the frame lengths', () => {
  const r = mulberry32(7);
  const jitter = Array.from({ length: 600 }, () => 0.002 + r() * 0.048);
  for (const frames of [Array(300).fill(1 / 30), Array(1440).fill(1 / 144), jitter]) {
    const steps = drive(frames);
    assert.ok(steps.every(h => h === SOLO_STEP));
    const total = frames.reduce((a, b) => a + b, 0);
    assert.ok(Math.abs(steps.length - total / SOLO_STEP) <= 1, `${steps.length} steps for ${total} s`);
  }
});

test('a tank over a crater falls through the same heights at any frame rate', () => {
  const fall = frames => {
    const world = { terrain: Array(720).fill(400), tanks: [{ x: 300, y: 300, hp: 50, vy: 0 }] };
    const ys = [];
    let acc = 0;
    for (const dt of frames) acc = runFixed(acc, dt, SOLO_STEP, h => { fallTanks(world, h); ys.push(world.tanks[0].y); return true; });
    return ys;
  };
  const steady = fall(Array(120).fill(1 / 60));
  const r = mulberry32(11);
  const jitter = fall(Array.from({ length: 400 }, () => 0.001 + r() * 0.03));
  const n = Math.min(steady.length, jitter.length);
  assert.ok(n > 30);
  assert.deepEqual(jitter.slice(0, n), steady.slice(0, n));
  assert.equal(steady.at(-1), 400, 'it lands on the ground');
});

test('a step that ends the war drops the rest of the frame', () => {
  let n = 0;
  const acc = runFixed(0, 0.1, SOLO_STEP, () => ++n < 2);
  assert.equal(n, 2);
  assert.equal(acc, 0);
});

test('a long stall runs at most MAX_STEPS in one frame', () => {
  let n = 0;
  runFixed(0, 10, SOLO_STEP, () => { n++; return true; });
  assert.equal(n, MAX_STEPS);
});
```

Run (in `games/tankity`): `node --test test/fixed-step.test.mjs`
Expected: FAIL, `runFixed` is not exported.

- [ ] **Step 2: Implement**

In `src/flow.ts` replace the `warSpeed`-following `runWar` doc comment and function with:

```ts
/** Steps one frame may run, so a tab coming back from a long stall never freezes. */
export const MAX_STEPS = 30;
/** Runs `step` in fixed `h`-second steps for `dt` more seconds of war plus the
 * remainder `acc` carried from the last frame; returns the new remainder. The
 * step size never varies, so the server, which knows only the moves, takes
 * the same steps and lands every shell and every falling tank where the
 * browser did. A step answering false (the phase left think/fly/settle) drops
 * the rest of the frame. */
export function runFixed(acc: number, dt: number, h: number, step: (h: number) => boolean): number {
  let left = acc + dt;
  for (let n = 0; left >= h; n++) {
    if (n >= MAX_STEPS) return 0;
    left -= h;
    if (!step(h)) return 0;
  }
  return left;
}
```

(Keep `warSpeed`'s doc comment, changing "How many sim steps one frame runs" to "How fast the war runs".)

In `src/main.ts`: `import { runFixed, warSpeed } from './flow.ts';` and `SOLO_STEP` from `./solo.ts`; add `let warAcc = 0;` next to `let lastT = 0;`. In `frame()` replace `  fallTanks(dt);` (after `decayFx(dt);`) with:

```ts
  // In the war, tanks fall inside its fixed steps (below), shells or no
  // shells; anywhere else they fall by the frame.
  const war = G.phase === 'think' || G.phase === 'fly' || G.phase === 'settle';
  if (!war) fallTanks(dt);
```

and replace the `runWar(...)` branch:

```ts
  } else if (G.phase === 'think' || G.phase === 'fly' || G.phase === 'settle') {
    // With the player's tank wrecked the drones play on at triple speed.
    runWar(dt, warSpeed(me().hp > 0, G.demo), (d, i) => {
      if (i > 0) fallTanks(d);
      stepWar(d);
      return !G.over && (G.phase === 'think' || G.phase === 'fly' || G.phase === 'settle');
    });
  }
```

with:

```ts
  } else if (war) {
    // Fixed SOLO_STEP steps whatever the frame rate, each dropping the tanks
    // and then moving the war on (server/flight.php takes the same steps);
    // with the player's tank wrecked the drones play on at triple speed.
    warAcc = runFixed(warAcc, dt * warSpeed(me().hp > 0, G.demo), SOLO_STEP, h => {
      fallTanks(h);
      stepWar(h);
      return !G.over && (G.phase === 'think' || G.phase === 'fly' || G.phase === 'settle');
    });
  } else {
    warAcc = 0;
  }
```

In `test/flow.test.mjs` remove `runWar` from the import and delete the checks that call `runWar` (the block headed by its comment about sub-steps).

- [ ] **Step 3: Run**

Run (in `games/tankity`): `node ../_kit/build/build.mjs tankity && node --test 'test/*.test.mjs'`
Expected: PASS.

- [ ] **Step 4: One browser spec**

Run (in `websites/www.cs`): `make e2e E2E_ARGS="tankity-solo.spec.mjs"`
Expected: 1 passed (drone turns still play, tanks still drop into craters, and turns settle).

- [ ] **Step 5: Commit**

```bash
git add games/tankity/src games/tankity/test/fixed-step.test.mjs games/tankity/test/flow.test.mjs games/tankity/dist
git commit -F- <<'MSG'
Tankity solo: the war, falling tanks included, runs in fixed 1/60 s steps

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb
MSG
```

### Task 24: The shop's rules in the referee

**Files:**
- Modify: `games/tankity/src/solo.ts` (`soloBuy`, `ONE_SHOT`)
- Modify: `games/tankity/src/shop.ts` (`buyItem`, `applyGear` → messages only)
- Modify: `games/tankity/test/solo.test.mjs`

**Interfaces:**
- Consumes: Task 1 armor helpers; `ShopRow`.
- Produces: `ONE_SHOT: ReadonlySet<string>` (`shield`, `extralife`, `laststand`); `type BuyResult = { ok: true; qty: number; total: number } | { ok: false; why: 'locked' | 'cash' | 'full'; total: number }`; `soloBuy(G: SoloState, row: ShopRow, qty: number): BuyResult` (same rules as `room_buy`).

- [ ] **Step 1: Failing tests**

Append to `test/solo.test.mjs`:

```js
import { soloBuy } from '../src/solo.ts';
const row = key => arsenal.shop.find(r => (r.w ?? r.g) === key);

test('the shop: round-one goods before round one, later goods wait', () => {
  const G = fresh('shop');
  assert.deepEqual(soloBuy(G, row('mortar'), 1), { ok: true, qty: 1, total: 200 });
  assert.equal(G.ammo.mortar, 2);
  assert.equal(soloBuy(G, row('cluster'), 1).why, 'locked');
});

test('one-shot tricks never stack; Repair buys only what fills the hull', () => {
  const G = fresh('shop');
  assert.deepEqual(soloBuy(G, row('shield'), 3), { ok: true, qty: 1, total: 250 });
  assert.equal(soloBuy(G, row('repair'), 1).why, 'full');
  G.armor = 30;
  assert.deepEqual(soloBuy(G, row('repair'), 9), { ok: true, qty: 2, total: 240 });
  assert.equal(G.armor, 100);
});

test('a plate and the chest', () => {
  const G = fresh('shop');
  G.cash = 299;
  assert.equal(soloBuy(G, row('plate'), 1).why, 'cash');
  G.cash = 300;
  soloBuy(G, row('plate'), 1);
  assert.deepEqual([G.plate, G.armor, G.cash], [1, 125, 0]);
});
```

Run (in `games/tankity`): `node --test test/solo.test.mjs`
Expected: FAIL, `soloBuy` is not exported.

- [ ] **Step 2: Implement**

Append to `src/solo.ts` (add `fitPlates, repairPacksWanted, repairRestores` to the armor import and `ShopRow` to the sim type import):

```ts
/** Tricks that do their one thing once: buying more is money on fire. */
export const ONE_SHOT: ReadonlySet<string> = new Set(['shield', 'extralife', 'laststand']);

export type BuyResult = { ok: true; qty: number; total: number } | { ok: false; why: 'locked' | 'cash' | 'full'; total: number };

/** One purchase, by server/rules.php room_buy()'s rules. */
export function soloBuy(G: SoloState, row: ShopRow, qtyIn: number): BuyResult {
  let qty = clamp(Math.floor(qtyIn || 1), 1, 9);
  if ((row.minRound || 0) > G.round) return { ok: false, why: 'locked', total: 0 };
  if (row.kind === 'gear' && ONE_SHOT.has(row.effect || '')) qty = 1;
  if (row.effect === 'repair') {
    const want = repairPacksWanted(G.armor, G.plate, row.n);
    if (want === 0) return { ok: false, why: 'full', total: 0 };
    qty = Math.min(qty, want);
  }
  const total = (row.price || 0) * qty;
  if (G.cash < total) return { ok: false, why: 'cash', total };
  G.cash -= total;
  if (row.kind === 'ammo') {
    G.ammo![row.w!] = (G.ammo![row.w!] || 0) + row.n * qty;
    return { ok: true, qty, total };
  }
  const n = (row.n || 0) * qty;
  switch (row.effect) {
    case 'repair': G.armor += repairRestores(G.armor, G.plate, row.n || 0, qty); break;
    case 'fuel': G.fuelBank += n; break;
    case 'plate': { const h = fitPlates({ armor: G.armor, plates: G.plate }, qty); G.armor = h.armor; G.plate = h.plates; break; }
    case 'shield': G.shield = true; break;
    case 'extralife': if (G.lives < TUNE.maxLives) G.lives += 1; else G.score += 500; break;
    case 'jammer': G.jammer = Math.max(G.jammer, n); break;
    case 'bunker': G.bunker = Math.max(G.bunker, n); break;
    case 'laststand': G.laststand = true; break;
  }
  return { ok: true, qty, total };
}
```

In `src/shop.ts`, `buyItem()` becomes:

```ts
  function buyItem(it: ShopRow, qty?: number): void {
    qty = clamp(Math.floor(qty || 1), 1, 9);
    if (net.on) { netBuy(it, qty); return; }
    const lives = G.lives;
    const r = soloBuy(G, it, qty);
    if (!r.ok) {
      if (r.why === 'locked') say(`That unlocks in round ${it.minRound}.`, 'info');
      else if (r.why === 'full') say('Armor is full already.', 'info');
      else say(`That costs $${r.total}, and the chest holds $${G.cash}.`, 'info');
      return;
    }
    sfx.play('cash');
    const lots = r.qty > 1 ? `${r.qty} × ` : '';
    if (it.kind === 'ammo') say(`Bought ${lots}${it.label}.`, 'good');
    else boughtLine(it, lots, lives);
    // After a buy the pack count only ever drops, down to what the chest
    // can still cover for the highlighted row.
    G.shopQty = Math.max(1, Math.min(G.shopQty, maxPacks(tables.shop[G.shopSel]!)));
    renderShop();
    renderHUD();
  }
```

`ShopState` must satisfy `SoloState` for `soloBuy`: replace the `ShopState` `Pick` with `GameState` (the shop is handed the whole `G` already). Replace `applyGear()` with `boughtLine(it, lots, livesBefore)` that only speaks, using the state `soloBuy` left:

```ts
  /* What a trick purchase says, from the state soloBuy left. */
  function boughtLine(it: ShopRow, lots: string, livesBefore: number): void {
    switch (it.effect) {
      case 'repair':
      case 'plate':
        say(`Bought ${lots}${it.label}: armor ${armorLabel(G.armor, G.plate)}.`, 'good');
        break;
      case 'fuel':
        say(`Bought ${lots}${it.label}, banked for next round.`, 'good');
        break;
      case 'shield':
        say(`Bought ${it.label}. Next hit bounces off.`, 'good');
        break;
      case 'extralife':
        say(G.lives > livesBefore ? `Bought ${it.label}! (${G.lives}/${TUNE.maxLives} lives)` : 'Max lives already, so take +500 points instead!', 'good');
        break;
      case 'jammer':
        say(`Bought ${it.label}. Drones aim shaky for ${G.jammer} rounds.`, 'good');
        break;
      case 'bunker':
        say(`Bought ${it.label}. Dug in for ${G.bunker} rounds.`, 'good');
        break;
      case 'laststand':
        say(`Bought ${it.label}. Go down glowing.`, 'good');
        break;
      default:
        say(`Bought ${lots}${it.label}.`, 'good');
    }
  }
```

Delete the repair pre-check Task 5 put in `buyItem` (now inside `soloBuy`) and unused armor imports.

- [ ] **Step 3: Run**

Run (in `games/tankity`): `node ../_kit/build/build.mjs tankity && node --test 'test/*.test.mjs'`
Expected: PASS (the smoke test's bulk-fuel buy still says "Bought 3 × Fuel").

- [ ] **Step 4: Commit**

```bash
git add games/tankity/src games/tankity/test/solo.test.mjs games/tankity/dist
git commit -F- <<'MSG'
Tankity solo: the shop's rules move into the referee, one-shot tricks never stack

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb
MSG
```

### Task 25: A round's inputs and claim, recorded as the player plays

**Files:**
- Create: `games/tankity/src/solo-log.ts`
- Create: `games/tankity/test/solo-log.test.mjs`
- Modify: `games/tankity/src/game-types.ts` (`GameState.rec`, `Tables.fromFile`)
- Modify: `games/tankity/src/main.ts` (`G.rec`, `tables.fromFile`, `applyArsenal`)
- Modify: `games/tankity/src/match.ts` (`newMatch`, `startDemo`, `playerFire`)
- Modify: `games/tankity/src/shop.ts` (`buyItem`)
- Modify: `games/tankity/tsconfig.json`

**Interfaces:**
- Produces: `interface SoloBuy { i: string; q: number }`; `interface SoloShot { w: string; a: number; p: number; x: number }`; `type RoundEnd = 'roundWon' | 'tankLost' | 'matchLost'`; `interface RoundClaim { end: RoundEnd; score: number; cash: number; lives: number; roundsWon: number }`; `interface SoloRoundLog { n: number; buys: SoloBuy[]; shots: SoloShot[]; claim: RoundClaim }`; `ROUND_MAX_SHOTS = 200`, `ROUND_MAX_BUYS = 60`; `interface RoundRecorder { buys: SoloBuy[]; shots: SoloShot[] }`; `newRecorder(): RoundRecorder`; `recordBuy(r: RoundRecorder, row: Pick<ShopRow, 'kind' | 'w' | 'g'>, qty: number): void`; `recordShot(r: RoundRecorder, t: Pick<Tank, 'x' | 'angle' | 'power'>, w: string): void`; `closeRound(r: RoundRecorder, n: number, claim: RoundClaim): SoloRoundLog` (the round as sent; the recorder starts empty for the next); `isRoundLog(v: unknown): v is SoloRoundLog`; `replayableSeed(seed: string): boolean`. `GameState.rec: RoundRecorder | null` (null in the demo, rooms, and runs the server could not play); `Tables.fromFile: boolean`.

- [ ] **Step 1: Failing test**

```js
// games/tankity/test/solo-log.test.mjs
// A round's inputs and claim (src/solo-log.ts): what the browser sends the
// server as each round ends.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newRecorder, recordBuy, recordShot, closeRound, isRoundLog, replayableSeed } from '../src/solo-log.ts';

const claim = { end: 'roundWon', score: 1450, cash: 1210, lives: 3, roundsWon: 1 };

test('a round is its buys and shots with exact numbers, and survives JSON', () => {
  const rec = newRecorder();
  recordBuy(rec, { kind: 'ammo', w: 'mortar' }, 3);
  recordBuy(rec, { kind: 'gear', g: 'repair' }, 1);
  recordShot(rec, { x: 211.38333333333335, angle: 47.016666666666666, power: 63.5 }, 'mortar');
  const round = closeRound(rec, 1, claim);
  const back = JSON.parse(JSON.stringify(round));
  assert.deepEqual(back, {
    n: 1, buys: [{ i: 'mortar', q: 3 }, { i: 'repair', q: 1 }],
    shots: [{ w: 'mortar', a: 47.016666666666666, p: 63.5, x: 211.38333333333335 }], claim,
  });
  assert.ok(isRoundLog(back));
  assert.deepEqual([rec.buys, rec.shots], [[], []], 'the recorder starts the next round empty');
});

test('the validator refuses anything else', () => {
  const ok = { n: 1, buys: [], shots: [], claim };
  assert.ok(isRoundLog(ok));
  assert.ok(!isRoundLog(null));
  assert.ok(!isRoundLog({ ...ok, n: 0 }));
  assert.ok(!isRoundLog({ ...ok, shots: [{ w: 'shell', a: '1', p: 1, x: 1 }] }));
  assert.ok(!isRoundLog({ ...ok, buys: [{ i: 'mortar', q: 1.5 }] }));
  assert.ok(!isRoundLog({ ...ok, claim: { ...claim, end: 'won' } }));
  assert.ok(!isRoundLog({ ...ok, shots: Array(201).fill({ w: 'shell', a: 45, p: 50, x: 100 }) }), 'past ROUND_MAX_SHOTS');
});

test('only printable-ASCII seeds play the same in PHP', () => {
  assert.ok(replayableSeed('scorched-1234'));
  assert.ok(!replayableSeed('héllo'));
  assert.ok(!replayableSeed(''));
  assert.ok(!replayableSeed('x'.repeat(65)));
});
```

Run (in `games/tankity`): `node --test test/solo-log.test.mjs`
Expected: FAIL, module not found.

- [ ] **Step 2: The module**

```ts
// games/tankity/src/solo-log.ts
/* Operation Tankity: a solo round as the server plays it.
 *
 * What the browser sends as each round ends: the purchases made before it,
 * each shot (gun, angle, power, and where the tank had driven to), and how the
 * browser saw it end (the claim). The server plays the round from the run's
 * stored state; a claim it does not reach voids the run. Numbers are the
 * browser's own: JSON carries a double exactly. */
import type { ShopRow, Tank } from './sim.ts';

export interface SoloBuy { i: string; q: number }
export interface SoloShot { w: string; a: number; p: number; x: number }
export type RoundEnd = 'roundWon' | 'tankLost' | 'matchLost';
export interface RoundClaim { end: RoundEnd; score: number; cash: number; lives: number; roundsWon: number }
export interface SoloRoundLog { n: number; buys: SoloBuy[]; shots: SoloShot[]; claim: RoundClaim }

/** server/solo.php SOLO_MAX_SHOTS and SOLO_MAX_BUYS: a round past them is refused. */
export const ROUND_MAX_SHOTS = 200;
export const ROUND_MAX_BUYS = 60;

export interface RoundRecorder { buys: SoloBuy[]; shots: SoloShot[] }

export function newRecorder(): RoundRecorder {
  return { buys: [], shots: [] };
}
export function recordBuy(r: RoundRecorder, row: Pick<ShopRow, 'kind' | 'w' | 'g'>, qty: number): void {
  r.buys.push({ i: (row.kind === 'ammo' ? row.w : row.g)!, q: qty });
}
export function recordShot(r: RoundRecorder, t: Pick<Tank, 'x' | 'angle' | 'power'>, w: string): void {
  r.shots.push({ w, a: t.angle, p: t.power, x: t.x });
}
/** The round as sent; the recorder is emptied for the next one. */
export function closeRound(r: RoundRecorder, n: number, claim: RoundClaim): SoloRoundLog {
  const round = { n, buys: r.buys, shots: r.shots, claim };
  r.buys = [];
  r.shots = [];
  return round;
}

const num = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const int = (v: unknown): v is number => Number.isInteger(v);
const ENDS: readonly string[] = ['roundWon', 'tankLost', 'matchLost'];
function isBuy(v: unknown): v is SoloBuy {
  const o = v as Record<string, unknown> | null;
  return !!o && typeof o === 'object' && typeof o['i'] === 'string' && int(o['q']);
}
function isShot(v: unknown): v is SoloShot {
  const o = v as Record<string, unknown> | null;
  return !!o && typeof o === 'object' && typeof o['w'] === 'string' && num(o['a']) && num(o['p']) && num(o['x']);
}
function isClaim(v: unknown): v is RoundClaim {
  const o = v as Record<string, unknown> | null;
  return !!o && typeof o === 'object' && ENDS.includes(o['end'] as string)
    && int(o['score']) && int(o['cash']) && int(o['lives']) && int(o['roundsWon']);
}
export function isRoundLog(v: unknown): v is SoloRoundLog {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  return int(o['n']) && (o['n'] as number) >= 1
    && Array.isArray(o['buys']) && o['buys'].length <= ROUND_MAX_BUYS && o['buys'].every(isBuy)
    && Array.isArray(o['shots']) && o['shots'].length <= ROUND_MAX_SHOTS && o['shots'].every(isShot)
    && isClaim(o['claim']);
}

/** PHP hashes a seed's bytes and the browser its UTF-16 units: only printable
 * ASCII hashes the same on both. */
export function replayableSeed(seed: string): boolean {
  return /^[\x20-\x7e]{1,64}$/.test(seed);
}
```

Add `"src/solo-log.ts"` to `tsconfig.json` `files`.

- [ ] **Step 3: Record as the player plays**

`src/game-types.ts`: `GameState` gains `rec: RoundRecorder | null; // this solo match's round being recorded; null in the demo, rooms, and runs the server could not play` (import the type); `Tables` gains `/** The arsenal came from game.json (the server's), not the baked fallback. */ readonly fromFile: boolean;`.

`src/main.ts`: `G` init adds `rec: null,`; add `let ARSENAL_FROM_FILE = false;` beside `ARSENAL_REV`; in `applyArsenal()` inside the success branch add `ARSENAL_FROM_FILE = true; G.rec = null; // a mid-match change of arsenal cannot be played on the server`; `tables` gains `get fromFile() { return ARSENAL_FROM_FILE; },`.

`src/match.ts` (import `{ newRecorder, recordShot, replayableSeed }`): in `newMatch()` after `resetMatch(seedStr);`:

```ts
    // The server plays every round of this run as it ends; one it could not play is not recorded.
    G.rec = tables.fromFile && replayableSeed(G.seed) ? newRecorder() : null;
    if (!G.rec) say(replayableSeed(G.seed)
      ? 'The game data did not load, so this run cannot be filed.'
      : 'This seed has characters the score server cannot play, so this run will not be filed.', 'info');
```

In `startDemo()` after `resetMatch('scorched-demo');` add `G.rec = null;`. In `playerFire()` change `if (fireWeapon(me(), G.selected)) {` to:

```ts
    const wkey = G.selected;
    if (fireWeapon(me(), wkey)) {
      if (G.rec) recordShot(G.rec, me(), wkey);
```

(the `say` line then uses `wkey`).

`src/shop.ts` (`import { recordBuy } from './solo-log.ts';`): in `buyItem()` after `sfx.play('cash');` add `if (G.rec) recordBuy(G.rec, it, r.qty);`.

Closing a round and sending it is Task 33's (`settle()` builds the claim).

- [ ] **Step 4: Run**

Run (in `games/tankity`): `node ../_kit/build/build.mjs tankity && node --test 'test/*.test.mjs'`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add games/tankity/src games/tankity/test/solo-log.test.mjs games/tankity/tsconfig.json games/tankity/dist
git commit -F- <<'MSG'
Tankity solo: record each round's buys and shots for the server to play

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb
MSG
```

### Task 26: Headless solo runs, and the server's round in TypeScript

**Files:**
- Create: `games/tankity/src/solo-play.ts`
- Create: `games/tankity/test/solo-play.test.mjs`
- Modify: `games/tankity/tsconfig.json`

**Interfaces:**
- Consumes: Tasks 22–25; `fallTanks`, `anyTankFalling`, `stepShells` (`src/sim.ts`).
- Produces: `FLIGHT_MAX_STEPS = 20000`; `flyVolley(G: World, arsenal: Arsenal, onStep?: (G: World) => void): number` (steps taken: each drops the tanks, then moves the shells, until no shell is left; then drops the tanks until none is falling; `server/flight.php flight_volley()` is the same); `interface Bot { shop(G: SoloState, arsenal: Arsenal): SoloBuy[]; aim(G: SoloState, arsenal: Arsenal): SoloShot }`; `interface Played { seed: string; difficulty: Difficulty; rounds: SoloRoundLog[]; score: number; roundsWon: number }`; `blankSolo(): SoloState`; `type RoundResult = { ok: true; claim: RoundClaim } | { ok: false; error: string }`; `soloRound(G: SoloState, arsenal: Arsenal, buys: readonly SoloBuy[], shots: readonly SoloShot[]): RoundResult` (`server/solo.php solo_round()` in TypeScript: the same steps, the same refusals); `playSolo(seed: string, arsenal: Arsenal, bot: Bot, difficulty: Difficulty, maxRounds?: number): Played`; `replaySolo(p: Pick<Played, 'seed' | 'difficulty' | 'rounds'>, arsenal: Arsenal): { ok: true; score: number; roundsWon: number; rounds: number } | { ok: false; round: number; error: string }`; `makeBot(seed: string, skill: number, untilRound: number): Bot`.

- [ ] **Step 1: Failing test**

```js
// games/tankity/test/solo-play.test.mjs
// Solo runs without a page: a bot plays the browser's rules round by round,
// every round's claim is what soloRound (the server's round) reaches, and a
// tampered round does not.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { buildArsenal, fireWeapon, fallTanks, stepShells, anyTankFalling } from '../src/sim.ts';
import { playSolo, replaySolo, makeBot, blankSolo, flyVolley } from '../src/solo-play.ts';
import { soloDeal, soloMuster, SOLO_STEP } from '../src/solo.ts';
import { runFixed } from '../src/flow.ts';

const GAME = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'game.json'), 'utf8'));
const arsenal = buildArsenal(GAME.arsenal);

test('every round of a played run replays to its claim, at every difficulty', () => {
  for (const [seed, skill, until, level] of [['t-1', 0, 99, 'easy'], ['t-2', 0.6, 99, 'normal'], ['t-3', 1, 4, 'hard']]) {
    const run = playSolo(seed, arsenal, makeBot(seed, skill, until), level);
    assert.equal(run.rounds.at(-1).claim.end, 'matchLost');
    const back = replaySolo(JSON.parse(JSON.stringify(run)), arsenal);
    assert.deepEqual(back, { ok: true, score: run.score, roundsWon: run.roundsWon, rounds: run.rounds.length }, seed);
  }
});

test('the same seed and bot play the same run', () => {
  const a = playSolo('same', arsenal, makeBot('same', 0.5, 99), 'normal');
  const b = playSolo('same', arsenal, makeBot('same', 0.5, 99), 'normal');
  assert.deepEqual(a, b);
});

test('a run replayed at another difficulty does not reach its claims', () => {
  const run = playSolo('level', arsenal, makeBot('level', 0.6, 99), 'easy');
  assert.equal(replaySolo({ ...run, difficulty: 'hard' }, arsenal).ok, false);
});

test('a volley flown in jittered frames lands, and drops its tanks, where fixed steps do', () => {
  const fly = frames => {
    const G = blankSolo();
    soloDeal(G, arsenal, 'jitter', 'normal');
    G.round = 1;
    soloMuster(G, arsenal);
    const me = G.tanks[0];
    me.angle = 52.3; me.power = 71.9;
    fireWeapon(G, arsenal, me, 'buck');
    let acc = 0;
    for (const dt of frames) {
      if (!G.shells.length && !anyTankFalling(G)) break;
      acc = runFixed(acc, dt, SOLO_STEP, h => { fallTanks(G, h); if (G.shells.length) stepShells(G, arsenal, h); return true; });
    }
    return { hp: G.tanks.map(t => t.hp), y: G.tanks.map(t => t.y), terrain: G.terrain.slice(0) };
  };
  const steady = fly(Array(3000).fill(1 / 60));
  const r = [0.004, 0.05, 0.017, 0.033, 0.009];
  const jitter = fly(Array.from({ length: 6000 }, (_, i) => r[i % r.length]));
  assert.deepEqual(jitter, steady);
});

test('flyVolley drops tanks between shell steps, not after the volley', () => {
  const G = blankSolo();
  soloDeal(G, arsenal, 'pit', 'normal');
  G.round = 1;
  soloMuster(G, arsenal);
  G.terrain = Array(720).fill(400);
  G.tanks.forEach((t, i) => { t.x = 120 + i * 160; t.y = 400; });
  G.tanks[1].y = 330; // hanging over a pit already: it must fall while the shell flies
  const ys = [];
  fireWeapon(G, arsenal, G.tanks[0], 'shell');
  flyVolley(G, arsenal, w => { if (w.shells.length) ys.push(w.tanks[1].y); });
  assert.ok(ys.length > 3 && ys[0] < ys[2], 'the tank moved while the shell was in the air');
  assert.equal(G.tanks[1].y, 400);
});

test('a tampered round does not reach its claim', () => {
  const run = playSolo('tamper', arsenal, makeBot('tamper', 0.3, 99), 'normal');
  const short = structuredClone(run);
  short.rounds[0].shots.pop();
  assert.equal(replaySolo(short, arsenal).ok, false);
  const wild = structuredClone(run);
  wild.rounds[0].shots[0].a = 200;
  assert.deepEqual(replaySolo(wild, arsenal), { ok: false, round: 1, error: 'out of range' });
  const lying = structuredClone(run);
  lying.rounds[0].claim.score += 100;
  assert.deepEqual(replaySolo(lying, arsenal), { ok: false, round: 1, error: 'mismatch' });
  const extra = structuredClone(run);
  extra.rounds.at(-1).shots.push({ w: 'shell', a: 45, p: 50, x: extra.rounds.at(-1).shots.at(-1)?.x ?? 100 });
  assert.equal(replaySolo(extra, arsenal).ok, false);
});
```

Run (in `games/tankity`): `node --test test/solo-play.test.mjs`
Expected: FAIL, module not found.

- [ ] **Step 2: The module**

```ts
// games/tankity/src/solo-play.ts
/* Operation Tankity: solo matches without a page.
 *
 * flyVolley() takes the war's fixed steps (tanks fall, then shells move);
 * soloRound() plays one round from the shop the way server/solo.php does;
 * playSolo() drives the rules with a bot and records each round as the page
 * would send it; replaySolo() checks every claim. tools/solo-runs.mjs records
 * bot runs for the PHP side to match. Not part of the page bundle. */
import { anyTankFalling, clamp, facing, fallTanks, fireWeapon, hashSeed, muzzle, mulberry32, simShot, spotTaken, stepShells, surfY, W } from './sim.ts';
import type { Arsenal, Difficulty, World } from './sim.ts';
import { SOLO_STEP, soloAim, soloBuy, soloDeal, soloMuster, soloOneUps, soloSettle } from './solo.ts';
import type { Settled, SoloState, SoloTank } from './solo.ts';
import { closeRound, newRecorder, recordBuy, recordShot, ROUND_MAX_BUYS, ROUND_MAX_SHOTS } from './solo-log.ts';
import type { RoundClaim, SoloBuy, SoloRoundLog, SoloShot } from './solo-log.ts';

export const FLIGHT_MAX_STEPS = 20000;

export interface Bot {
  shop(G: SoloState, arsenal: Arsenal): SoloBuy[];
  aim(G: SoloState, arsenal: Arsenal): SoloShot;
}
export interface Played { seed: string; difficulty: Difficulty; rounds: SoloRoundLog[]; score: number; roundsWon: number }
export type RoundResult = { ok: true; claim: RoundClaim } | { ok: false; error: string };

/** An empty state for soloDeal to fill. */
export function blankSolo(): SoloState {
  return { body: 'tank' } as SoloState;
}

/** The war's fixed steps for one volley, as the page's frame takes them:
 *  each drops the tanks, then moves the shells; once the last shell is gone,
 *  steps drop the tanks until none is falling. server/flight.php flight_volley()
 *  is the same. Answers the steps taken. */
export function flyVolley(G: World, arsenal: Arsenal, onStep?: (G: World) => void): number {
  let steps = 0;
  for (; G.shells.length && steps < FLIGHT_MAX_STEPS; steps++) {
    fallTanks(G, SOLO_STEP);
    stepShells(G, arsenal, SOLO_STEP);
    if (onStep) onStep(G);
  }
  for (; anyTankFalling(G) && steps < FLIGHT_MAX_STEPS; steps++) {
    fallTanks(G, SOLO_STEP);
    if (onStep) onStep(G);
  }
  return steps;
}

function droneTurn(G: SoloState, arsenal: Arsenal, t: SoloTank): void {
  const plan = soloAim(G, arsenal, t);
  t.angle = plan.angle;
  t.power = plan.power;
  fireWeapon(G, arsenal, t, plan.wkey);
}

/** Drives the player's tank to x (paying fuel) and fires; an error when the move is not legal. */
function playerFire(G: SoloState, arsenal: Arsenal, m: SoloShot): string | null {
  const me = G.tanks[0]!;
  if (!arsenal.weapons[m.w]) return 'no such weapon';
  if (!(m.a >= 10 && m.a <= 170 && m.p >= 10 && m.p <= 100 && m.x >= 12 && m.x <= W - 12)) return 'out of range';
  const dx = Math.abs(m.x - me.x);
  if (dx > 0) {
    if (dx > me.fuel + 1e-6) return 'not enough fuel';
    if (spotTaken(G.tanks, me, m.x)) return 'blocked';
    me.fuel = Math.max(0, me.fuel - dx);
    me.x = m.x;
    me.y = surfY(G.terrain, me.x);
  }
  me.angle = m.a;
  me.power = m.p;
  return fireWeapon(G, arsenal, me, m.w) ? null : 'none left';
}

function claimOf(G: SoloState, end: Exclude<Settled['kind'], 'next'>): RoundClaim {
  return { end, score: G.score, cash: G.cash, lives: G.lives, roundsWon: G.roundsWon };
}

/** One round from the shop: its purchases, the muster, then turns until the
 *  round ends, the player's turns taking `shots` in order. server/solo.php
 *  solo_round() is the same, refusal for refusal. */
export function soloRound(G: SoloState, arsenal: Arsenal, buys: readonly SoloBuy[], shots: readonly SoloShot[]): RoundResult {
  if (buys.length > ROUND_MAX_BUYS) return { ok: false, error: 'bad buys' };
  if (shots.length > ROUND_MAX_SHOTS) return { ok: false, error: 'too many shots' };
  for (const b of buys) {
    const row = arsenal.shop.find(r => (r.kind === 'ammo' ? r.w : r.g) === b.i);
    if (!row || !soloBuy(G, row, b.q).ok) return { ok: false, error: 'bad buy' };
    soloOneUps(G);
  }
  G.round += 1;
  soloMuster(G, arsenal);
  let i = 0;
  for (;;) {
    const t = G.tanks[G.turn]!;
    if (t.isPlayer) {
      const m = shots[i++];
      if (!m) return { ok: false, error: 'unfinished' };
      const err = playerFire(G, arsenal, m);
      if (err) return { ok: false, error: err };
    } else droneTurn(G, arsenal, t);
    flyVolley(G, arsenal);
    soloOneUps(G);
    const end = soloSettle(G);
    if (end.kind === 'next') continue;
    if (end.kind !== 'matchLost') soloOneUps(G);
    if (i !== shots.length) return { ok: false, error: 'shots after the end' };
    return { ok: true, claim: claimOf(G, end.kind) };
  }
}

export function playSolo(seed: string, arsenal: Arsenal, bot: Bot, difficulty: Difficulty, maxRounds = 200): Played {
  const G = blankSolo();
  soloDeal(G, arsenal, seed, difficulty);
  const rec = newRecorder();
  const rounds: SoloRoundLog[] = [];
  for (;;) {
    for (const want of bot.shop(G, arsenal)) {
      const row = arsenal.shop.find(r => (r.kind === 'ammo' ? r.w : r.g) === want.i);
      if (!row) continue;
      const r = soloBuy(G, row, want.q);
      if (r.ok) { recordBuy(rec, row, r.qty); soloOneUps(G); }
    }
    if (G.round >= maxRounds) throw new Error(`${seed}: still alive after ${maxRounds} rounds`);
    const claim = playTurns(G, arsenal, bot, rec);
    rounds.push(closeRound(rec, G.round, claim));
    if (claim.end === 'matchLost') return { seed, difficulty, rounds, score: G.score, roundsWon: G.roundsWon };
  }
}

/* The muster and the turns of one round, the bot choosing each shot as its
   turn comes and the recorder keeping what it fired: soloRound's loop with a
   bot in place of the recorded shots. */
function playTurns(G: SoloState, arsenal: Arsenal, bot: Bot, rec: ReturnType<typeof newRecorder>): RoundClaim {
  G.round += 1;
  soloMuster(G, arsenal);
  for (;;) {
    const t = G.tanks[G.turn]!;
    if (t.isPlayer) {
      const m = bot.aim(G, arsenal);
      const err = playerFire(G, arsenal, m);
      if (err) throw new Error(`${G.seed}: the bot made an illegal move (${err})`);
      recordShot(rec, G.tanks[0]!, m.w);
    } else droneTurn(G, arsenal, t);
    flyVolley(G, arsenal);
    soloOneUps(G);
    const end = soloSettle(G);
    if (end.kind === 'next') continue;
    if (end.kind !== 'matchLost') soloOneUps(G);
    return claimOf(G, end.kind);
  }
}

/** Plays a recorded run round by round and checks every claim. */
export function replaySolo(p: Pick<Played, 'seed' | 'difficulty' | 'rounds'>, arsenal: Arsenal):
  { ok: true; score: number; roundsWon: number; rounds: number } | { ok: false; round: number; error: string } {
  const G = blankSolo();
  soloDeal(G, arsenal, p.seed, p.difficulty);
  for (const [k, r] of p.rounds.entries()) {
    if (r.n !== k + 1) return { ok: false, round: r.n, error: 'out of order' };
    const got = soloRound(G, arsenal, r.buys, r.shots);
    if (!got.ok) return { ok: false, round: r.n, error: got.error };
    if (JSON.stringify(got.claim) !== JSON.stringify(r.claim)) return { ok: false, round: r.n, error: 'mismatch' };
    if (got.claim.end === 'matchLost' && k !== p.rounds.length - 1) return { ok: false, round: r.n + 1, error: 'the run is over' };
  }
  const last = p.rounds.at(-1);
  if (!last || last.claim.end !== 'matchLost') return { ok: false, round: p.rounds.length, error: 'unfinished' };
  return { ok: true, score: G.score, roundsWon: G.roundsWon, rounds: G.round };
}

/** A bot with its own random stream (never the match's): it shops at random,
 * drives a little, and with probability `skill` aims with the sim's own
 * predictor at the nearest drone, until round `untilRound`; after that it
 * fires wild, so every run ends. */
export function makeBot(seed: string, skill: number, untilRound: number): Bot {
  const r = mulberry32(hashSeed('bot:' + seed));
  return {
    shop(G, arsenal) {
      const rows = arsenal.shop.filter(row => (row.minRound || 0) <= G.round && (row.price || 0) > 0);
      const out: SoloBuy[] = [];
      for (let k = 0; k < 3 && rows.length; k++) {
        const row = rows[Math.floor(r() * rows.length)]!;
        if (r() < 0.6) out.push({ i: (row.kind === 'ammo' ? row.w : row.g)!, q: 1 + Math.floor(r() * 2) });
      }
      return out;
    },
    aim(G, arsenal) {
      const me = G.tanks[0]!;
      const guns = arsenal.order.filter(k => k === 'shell' || (G.ammo![k] || 0) > 0);
      const w = guns[Math.floor(r() * guns.length)]!;
      let x = me.x;
      if (r() < 0.3 && me.fuel > 1) {
        const nx = clamp(me.x + (r() * 2 - 1) * Math.min(me.fuel, 30), 12, W - 12);
        if (!spotTaken(G.tanks, me, nx)) x = nx;
      }
      if (G.round <= untilRound && r() < skill) {
        const foes = G.tanks.filter(t => !t.isPlayer && t.hp > 0).sort((a, b) => Math.abs(a.x - x) - Math.abs(b.x - x));
        const target = foes[0];
        if (target) {
          const m = muzzle({ ...me, x, y: surfY(G.terrain, x) });
          let best = { err: Infinity, a: 45, p: 50 };
          for (let a = 15; a <= 165; a += 2) {
            for (let p = 20; p <= 100; p += 4) {
              const land = simShot(G, arsenal, m.x, m.y, a, p, w, facing(me));
              const err = land.oob ? Infinity : Math.abs(land.x - target.x);
              if (err < best.err) best = { err, a, p };
            }
          }
          return { w, a: clamp(best.a + (r() - 0.5) * 2, 10, 170), p: best.p, x };
        }
      }
      return { w, a: 15 + r() * 150, p: 20 + r() * 80, x };
    },
  };
}
```

`playSolo` records a purchase only when `soloBuy` took it, so a recorded round never carries a refused buy; the shot recorded is the tank's angle, power and x after `playerFire` (what the page records).

Add `"src/solo-play.ts"` to `tsconfig.json` `files`.

- [ ] **Step 3: Run**

Run (in `games/tankity`): `node --test test/solo-play.test.mjs && node ../_kit/build/build.mjs tankity`
Expected: PASS (6 tests). If the jitter test fails, a war path still reads the frame's `dt`: fix the path, never the test.

- [ ] **Step 4: Commit**

```bash
git add games/tankity/src/solo-play.ts games/tankity/test/solo-play.test.mjs games/tankity/tsconfig.json
git commit -F- <<'MSG'
Tankity solo: headless runs, a bot, and the server's round in TypeScript

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb
MSG
```

### Task 27: Recorded runs the PHP rounds must match

**Files:**
- Create: `games/tankity/tools/solo-runs.mjs`
- Create: `games/tankity/protocol/solo-runs.json` (generated)
- Modify: `games/tankity/test.sh` (check), `websites/www.cs/Makefile` (`solo-runs` target and help line)

**Interfaces:**
- Consumes: Task 26 `playSolo`, `makeBot`.
- Produces: `protocol/solo-runs.json` = `{ about, runs: [{ name, skill, until, seed, difficulty, rounds: SoloRoundLog[], score, roundsWon }] }`, with runs at each of `easy`, `normal` and `hard`, and one past 60 rounds (solo has no round limit); `node tools/solo-runs.mjs [--check]`.

- [ ] **Step 1: The tool**

```js
// games/tankity/tools/solo-runs.mjs
// Writes (or checks) protocol/solo-runs.json: solo runs a bot plays with the
// browser's rules, each round as the page sends it (buys, shots, the claim).
// test/php/SoloRoundTest.php plays every round in PHP from the stored state
// and must reach every claim.
//   node tools/solo-runs.mjs          rewrite solo-runs.json
//   node tools/solo-runs.mjs --check  exit 1 if it is stale
import fs from 'node:fs';
import path from 'node:path';
import { buildArsenal } from '../src/sim.ts';
import { makeBot, playSolo } from '../src/solo-play.ts';

const dir = path.join(import.meta.dirname, '..');
const arsenal = buildArsenal(JSON.parse(fs.readFileSync(path.join(dir, 'game.json'), 'utf8')).arsenal);
// name, bot skill, the round the bot stops aiming, the drones' difficulty.
// Every difficulty is played, so the PHP drones are checked at each level's
// aim. The long runs are for the per-round CPU bench (tools/round-bench.php)
// and the nightly; long-70 shows a run past 60 rounds plays and files.
const PLAN = [
  ['wild-1', 0, 0, 'easy'], ['wild-2', 0, 0, 'hard'], ['middling-1', 0.5, 99, 'easy'], ['middling-2', 0.5, 99, 'normal'],
  ['sharp-5', 1, 5, 'hard'], ['long-15', 1, 15, 'normal'], ['long-70', 1, 70, 'easy'],
];
const runs = PLAN.map(([name, skill, until, difficulty]) => {
  const seed = `runs-${name}`;
  const run = playSolo(seed, arsenal, makeBot(seed, skill, until), difficulty);
  return { name, skill, until, ...run };
});
const text = JSON.stringify({
  about: 'Solo runs played by node tools/solo-runs.mjs with the browser rules, round by round; SoloRoundTest plays each round in PHP. Do not edit by hand.',
  runs,
}, null, 1) + '\n';
const file = path.join(dir, 'protocol', 'solo-runs.json');
if (process.argv.includes('--check')) {
  if (!fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== text) {
    console.error('solo-runs: protocol/solo-runs.json is stale; run make solo-runs and commit the result');
    process.exit(1);
  }
  console.log(`solo-runs: ${runs.length} runs current`);
} else {
  fs.writeFileSync(file, text);
  for (const r of runs) {
    const shots = r.rounds.reduce((n, x) => n + x.shots.length, 0);
    console.log(`  ${r.name.padEnd(12)} ${r.difficulty.padEnd(6)} ${String(r.rounds.length).padStart(3)} rounds  ${r.score} pts  ${shots} shots`);
  }
}
```

- [ ] **Step 2: Generate and wire**

Run (in `games/tankity`): `node tools/solo-runs.mjs`
Expected: seven lines, covering `easy`, `normal` and `hard`; `long-70` plays more than 60 rounds (if it ends earlier, raise its `until` in `PLAN`, so the bot aims well for longer against the easy drones, and regenerate until it passes 60).

`test.sh`: after `php tools/install-files.php --check` add `node tools/solo-runs.mjs --check`.
`Makefile`: `.PHONY` gains `solo-runs`; add a help line `@echo "  solo-runs - Rewrite the Tankity recorded solo runs (node; no docker)"` and:

```make
solo-runs:
	cd games/tankity && node tools/solo-runs.mjs
```

- [ ] **Step 3: Commit**

```bash
git add games/tankity/tools/solo-runs.mjs games/tankity/protocol/solo-runs.json games/tankity/test.sh Makefile
git commit -F- <<'MSG'
Tankity: recorded solo runs, round by round, for the PHP rounds to match

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb
MSG
```

### Task 28: The PHP referee, part 1: deal and muster, pinned by vectors

**Files:**
- Create: `games/tankity/server/solo.php`
- Modify: `games/tankity/rooms.php` (require it after `server/rules.php`; file map comment)
- Modify: `games/tankity/protocol/sim-vectors.php` (group `solo-deal`), `games/tankity/test/sim-vectors.test.mjs` (`RUN['solo-deal']`)

**Interfaces:**
- Consumes: `room_hash_seed`, `room_rng_next`, `room_gen_terrain`, `room_spawn_spots`, `room_pick_tactic`, `room_ai_rack`, `room_max_armor`, `room_muster_armor`, `room_weapons`.
- Produces: `SOLO_FOES`, `SOLO_W`; `js_round(float $x): float`; `solo_gen_terrain(int &$rng): array`; `solo_deal(string $seed, string $difficulty): array` (a room-shaped state: one human at seat 0, keys `seed, difficulty (a ROOM_DIFFICULTY word, read by room_ai_choose through room_difficulty()), rng, phase ('shop'), round, wind, terrain, tanks, shells (the volley in the air, `server/flight.php`'s), turn, firstTurn, watchTurns, seats[0].lives, scores[0], cash[0], ammo[0], nextUp[0], roundsWon, tactics, plate[0], armor[0], fuelBonus[0], shield[0], jammer[0], bunker[0], laststand[0]`); `solo_muster(array &$s): void` (round must already be incremented). Vector group `solo-deal`: input `{ seed, rounds }`, output per round `{ samples, wind, xs, ys, tactics, turn, hp, next }`.

- [ ] **Step 1: Generator group (the PHP side does not exist yet, so this fails)**

In `protocol/sim-vectors.php` after the match-end group:

```php
/* ---- a solo match's deal and musters: the random stream in the browser's order ----
 * Per round: terrain samples, wind, every unit's x and y, the drones'
 * strategies, who opens, each unit's armor, and the next number on the stream. */
$soloDeal = function (string $seed, int $rounds) use ($add): void {
    $s = solo_deal($seed, 'normal'); // a deal and its musters draw nothing that depends on the difficulty
    $out = [];
    for ($r = 1; $r <= $rounds; $r++) {
        $s['round'] = $r;
        solo_muster($s);
        $samples = [];
        for ($x = 0; $x < SOLO_W; $x += 60) {
            $samples[] = $s['terrain'][$x];
        }
        $peek = $s['rng'];
        $out[] = ['samples' => $samples, 'wind' => $s['wind'], 'xs' => array_column($s['tanks'], 'x'), 'ys' => array_column($s['tanks'], 'y'),
            'tactics' => array_values(array_filter(array_column($s['tanks'], 's'))), 'turn' => $s['turn'], 'hp' => array_column($s['tanks'], 'hp'),
            'next' => room_rng_next($peek)];
    }
    $add('solo-deal', $seed, ['seed' => $seed, 'rounds' => $rounds], $out);
};
foreach (['scorched-1000', 'scorched-4242', 'alpha', 'runs-long-70', 'a b c'] as $seed) {
    $soloDeal($seed, 3);
}
```

Run (in `games/tankity`): `php protocol/sim-vectors.php`
Expected: FAIL, `Call to undefined function solo_deal()`.

- [ ] **Step 2: The PHP deal and muster**

```php
<?php
// games/tankity/server/solo.php
// Operation Tankity: the solo referee in PHP, for the server's play of each
// round of a solo run. The rules of src/solo.ts over the room sim: a solo
// match is a room with one human at seat 0 and three drones, and draws its
// random stream in the browser's order. protocol/solo-runs.json pins it to
// the browser. Loaded by rooms.php.
declare(strict_types=1);

// Not an endpoint: rooms.php defines this constant, then requires the file.
if (!defined('TANKITY_ROOMS_INCLUDED')) {
    http_response_code(404);
    exit;
}

const SOLO_FOES = ['reaper', 'wraith', 'spotter'];
const SOLO_W = 720;

/* JavaScript's Math.round: halves go up, toward +infinity (PHP's round() takes
   them away from zero, which differs on negative halves). */
function js_round(float $x): float
{
    $f = floor($x);
    return $x - $f >= 0.5 ? $f + 1.0 : $f;
}

/* src/sim.ts genTerrain(): the hills, then five clouds of four numbers each,
   which the server must draw too to stay on the browser's stream. */
function solo_gen_terrain(int &$rng): array
{
    $t = room_gen_terrain($rng, SOLO_W);
    for ($i = 0; $i < 20; $i++) {
        room_rng_next($rng);
    }
    return $t;
}

/* src/solo.ts soloDeal(): the stake, three lives, full armor, the drones'
   difficulty (room_ai_choose reads it, as the room's), and the pre-match hills
   (drawn, never fought on). The match opens in the shop. */
function solo_deal(string $seed, string $difficulty): array
{
    $ammo = ['shell' => -1];
    foreach (room_weapons() as $k => $_) {
        if ($k !== 'shell') {
            $ammo[$k] = $k === 'buck' ? 1 : 0;
        }
    }
    $s = [
        'code' => 'SOLO', 'seed' => $seed, 'difficulty' => room_parse_difficulty($difficulty), 'rng' => room_hash_seed($seed), 'phase' => 'shop',
        'round' => 0, 'wind' => 0, 'terrain' => [], 'tanks' => [], 'shells' => [], 'turn' => 0, 'firstTurn' => 0, 'watchTurns' => 0,
        'seats' => [0 => ['human' => true, 'initials' => 'YOU', 'lives' => 3]],
        'scores' => [0 => 0], 'cash' => [0 => 600], 'ammo' => [0 => $ammo], 'nextUp' => [0 => 3000],
        'roundsWon' => 0, 'tactics' => [],
        'plate' => [0 => 0], 'armor' => [0 => 100], 'fuelBonus' => [0 => 0],
        'shield' => [0 => false], 'jammer' => [0 => 0], 'bunker' => [0 => 0], 'laststand' => [0 => false],
    ];
    $s['terrain'] = solo_gen_terrain($s['rng']);
    return $s;
}

/* src/solo.ts soloMuster(): hills, wind, four spawn spots, the player's tank and
   the three drones (a new drone is dealt a strategy), the opener rotating. */
function solo_muster(array &$s): void
{
    $s['terrain'] = solo_gen_terrain($s['rng']);
    $s['watchTurns'] = 0;
    $s['wind'] = (int) js_round((room_rng_next($s['rng']) * 2 - 1) * 8);
    $xs = room_spawn_spots($s['rng'], 1 + count(SOLO_FOES), SOLO_W);
    $fuel = 80.0 + (float) ($s['fuelBonus'][0] ?? 0);
    $s['fuelBonus'][0] = 0;
    $s['tanks'] = [[
        'seat' => 0, 'kind' => 'human', 'name' => 'tank', 'x' => (float) $xs[0], 'y' => 0.0, 'angle' => 62.0, 'power' => 55.0,
        'hp' => room_muster_armor($s, 0), 'maxHp' => room_max_armor($s, 0), 'fuel' => $fuel, 'dirS' => 1, 'ammo' => $s['ammo'][0],
    ]];
    foreach (SOLO_FOES as $i => $id) {
        $armor = 60 + 6 * ($s['round'] - 1);
        $s['tactics'][$id] ??= room_pick_tactic($s['rng']);
        $s['tanks'][] = [
            'seat' => $i + 1, 'kind' => 'ai', 'name' => $id, 'x' => (float) $xs[$i + 1], 'y' => 0.0, 'angle' => 62.0, 'power' => 55.0,
            'hp' => $armor, 'maxHp' => $armor, 'fuel' => 0.0, 'dirS' => -1, 'ammo' => room_ai_rack((int) $s['round']), 's' => $s['tactics'][$id],
        ];
    }
    foreach ($s['tanks'] as &$t) {
        $t['y'] = $s['terrain'][max(0, min(SOLO_W - 1, (int) round($t['x'])))];
        $t['dirS'] = $t['x'] < SOLO_W / 2 ? 1 : -1;
    }
    unset($t);
    $s['turn'] = $s['firstTurn'] % count($s['tanks']);
    $s['firstTurn']++;
    $s['shells'] = [];
    $s['phase'] = 'play';
}
```

`rooms.php`: after `require_once __DIR__ . '/server/rules.php';` add `require_once __DIR__ . '/server/solo.php';` and the map line `//   server/solo.php      the solo referee, for the server's play of solo rounds`.

- [ ] **Step 3: The TS runner**

In `test/sim-vectors.test.mjs` add `const solo = await import(pathToFileURL(path.join(dir, 'src', 'solo.ts')).href);` and the runner below. The browser's stream cannot be peeked the way PHP copies its integer state, so for round r the runner deals afresh, musters rounds 1..r, and reads `next` off that fresh stream:

```js
  'solo-deal'(c) {
    const out = [];
    for (let r = 1; r <= c.rounds; r++) {
      const S = { body: 'tank' };
      solo.soloDeal(S, arsenal, c.seed, 'normal');
      for (let k = 1; k <= r; k++) { S.round = k; solo.soloMuster(S, arsenal); }
      const samples = [];
      for (let x = 0; x < sim.W; x += 60) samples.push(S.terrain[x]);
      out.push({ samples, wind: S.wind, xs: S.tanks.map(t => t.x), ys: S.tanks.map(t => t.y),
        tactics: S.tanks.filter(t => t.s).map(t => t.s), turn: S.turn, hp: S.tanks.map(t => t.hp), next: S.rng() });
    }
    return out;
  },
```

- [ ] **Step 4: Run both sides**

Run (in `games/tankity`): `php protocol/sim-vectors.php && node --test test/sim-vectors.test.mjs` then (in `websites/www.cs`) `vendor/bin/phpunit --testsuite tankity`
Expected: PASS. A mismatch in `next` means a draw is missing or extra on one side: compare the draw order with the README's determinism list.

- [ ] **Step 5: Commit**

```bash
git add games/tankity/server/solo.php games/tankity/rooms.php games/tankity/protocol/sim-vectors.php games/tankity/protocol/sim-vectors.json games/tankity/test/sim-vectors.test.mjs
git commit -F- <<'MSG'
Tankity: the solo deal and muster in PHP, on the browser's random stream

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb
MSG
```

### Task 29: The volley in PHP, step by step, with tanks falling mid-volley

The room server resolves a volley shell by shell and settles tanks after it; the browser's solo war flies a volley's shells together and drops tanks between steps (Decision 2). The server's solo play must take the browser's steps, so it gets its own flight: `server/flight.php`, a step-for-step PHP port of `stepShells`, `stepRoller`, `waitsOnEarlier`, `fallTanks` and `fireWeapon`'s launch, built on the room sim's pinned helpers (`room_seek_push`, `room_split_vel`, `room_sweep_hit`, `room_roll_hit`, `room_roll_*`, `room_explode`, `room_brk_land`). The `volley-fall` vectors pin it to `flyVolley`.

**Files:**
- Create: `games/tankity/server/flight.php`
- Modify: `games/tankity/rooms.php` (require it after `server/sim.php`; file map)
- Modify: `games/tankity/protocol/sim-vectors.php` (group `volley-fall`), `games/tankity/test/sim-vectors.test.mjs` (`RUN['volley-fall']`)
- Create: `games/tankity/test/php/FlightTest.php`

**Interfaces:**
- Consumes: Task 21's aligned helpers (`room_dist`, the lance bracket, the seek clamp); `ROOM_GRAV`, `ROOM_FLAT_GRAV`, `ROOM_TURN_WIND`, `ROOM_ROLL_LIFT`; Task 26's `flyVolley`.
- Produces: `FLIGHT_STEP = 1 / 60`, `FLIGHT_FALL_GRAVITY = 700.0` (`src/sim.ts FALL_GRAVITY`), `FLIGHT_MAX_STEPS = 20000`; `flight_surf(array $terrain, float $x): float`; `flight_launch(array &$s, int $idx, string $wkey): void` (shells into `$s['shells']`; ammo is the caller's); `flight_fall(array &$s, float $h): void`; `flight_falling(array $s): bool`; `flight_waits(array $s, int $k): bool`; `flight_burst(array &$s, array $shell, float $x, float $y, ?int $direct, ?array $ov): void`; `flight_step_shells(array &$s, float $h): void`; `flight_volley(array &$s, ?Closure $onStep = null): int`. A shell is `['x','y','vx','vy','w','owner','life','age','pierced','split','order','dead','clear','dw','dr','rolling','ru','rt']`. Vector group `volley-fall`: a `volley` case's inputs; output `sv_outcome` plus `ys` (each tank's y), `steps` and `midFall` (a tank moved while a shell was in the air).

- [ ] **Step 1: The generator group and the failing test**

In `protocol/sim-vectors.php`, after the `volley` group:

```php
/* ---- volleys as the solo war flies them: fixed steps, tanks falling between ----
 * Each step drops the tanks, then moves every shell (server/flight.php);
 * the browser's flyVolley() takes the same steps. midFall says a tank moved
 * while a shell was still in the air, so the cases really cover the falls. */
$volleyFall = function (string $name, array $c) use ($add): void {
    $room = sv_room($c);
    $room['shells'] = [];
    $before = $room;
    $seat = $c['shooter'];
    $room['tanks'][$seat]['angle'] = (float) $c['angle'];
    $room['tanks'][$seat]['power'] = (float) $c['power'];
    flight_launch($room, $seat, $c['wkey']);
    $ys = array_column($room['tanks'], 'y');
    $midFall = false;
    $steps = flight_volley($room, function (array $s) use (&$ys, &$midFall): void {
        $now = array_column($s['tanks'], 'y');
        if ($s['shells'] && $now !== $ys) {
            $midFall = true;
        }
        $ys = $now;
    });
    $add('volley-fall', $name, $c, sv_outcome($before, $room) + ['ys' => array_column($room['tanks'], 'y'), 'steps' => $steps, 'midFall' => $midFall]);
};
$drone = fn(float $x, int $hp = 200, array $more = []): array => ['kind' => 'ai', 'x' => $x, 'y' => 400, 'hp' => $hp, 'dirS' => -1] + $more;
$human = fn(float $x, int $hp = 200, array $more = []): array => ['kind' => 'human', 'x' => $x, 'y' => 400, 'hp' => $hp, 'dirS' => 1] + $more;
$flat = ['flat' => 400];
// A pellet craters under a drone; the next pellet meets it on its way down.
$volleyFall('buck-meets-a-sinking-drone', ['terrain' => $flat, 'wind' => 0, 'shooter' => 0, 'wkey' => 'buck', 'angle' => 47, 'power' => 62,
    'tanks' => [$human(120), $drone(330), $drone(560)]]);
$volleyFall('mortar-digs-out-a-tank', ['terrain' => $flat, 'wind' => 2, 'shooter' => 1, 'wkey' => 'mortar', 'angle' => 50, 'power' => 58,
    'tanks' => [$human(260), $drone(560), $drone(660)]]);
$volleyFall('cluster-over-a-pit', ['terrain' => ['flat' => 400, 'set' => [[300, 360, 420]]], 'wind' => -3, 'shooter' => 0, 'wkey' => 'cluster', 'angle' => 55, 'power' => 66,
    'tanks' => [$human(100), $drone(330, 300, ['y' => 380]), $drone(600)]]);
$volleyFall('roller-into-the-crater-it-follows', ['terrain' => $flat, 'wind' => 0, 'shooter' => 0, 'wkey' => 'roller', 'angle' => 30, 'power' => 50,
    'tanks' => [$human(100), $drone(400), $drone(640)]]);
$volleyFall('lance-through-and-down', ['terrain' => $flat, 'wind' => 0, 'shooter' => 0, 'wkey' => 'lance', 'angle' => 12, 'power' => 80,
    'tanks' => [$human(100), $drone(300, 500), $drone(420, 500)]]);
$volleyFall('already-hanging-over-a-pit', ['terrain' => ['flat' => 400, 'set' => [[420, 470, 440]]], 'wind' => 0, 'shooter' => 0, 'wkey' => 'shell', 'angle' => 60, 'power' => 60,
    'tanks' => [$human(120), $drone(445), $drone(640)]]);
```

(`sv_room` places each tank at its spec's `y`, 400 unless given; weapons a game does not have are skipped the way the `volley` group skips them: wrap each call in `if (isset(room_weapons()[$wkey]))` when the case's gun is one of `cluster`, `roller` or `lance`.)

In `test/sim-vectors.test.mjs` import the flight and add the runner:

```js
const soloPlay = await import(pathToFileURL(path.join(dir, 'src', 'solo-play.ts')).href);
```

```js
  'volley-fall'(c) {
    world(c);
    const before = G.terrain.slice(), shooter = G.tanks[c.shooter];
    shooter.angle = c.angle;
    shooter.power = c.power;
    (shooter.isPlayer ? G.ammo : shooter.ammo)[c.wkey] = 99;
    sim.fireWeapon(G, arsenal, shooter, c.wkey);
    let ys = G.tanks.map(t => t.y), midFall = false;
    const steps = soloPlay.flyVolley(G, arsenal, w => {
      const now = w.tanks.map(t => t.y);
      if (w.shells.length && now.some((y, i) => y !== ys[i])) midFall = true;
      ys = now;
    });
    return { ...outcome(before), ys: G.tanks.map(t => t.y), steps, midFall };
  },
```

```php
<?php
// games/tankity/test/php/FlightTest.php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

/* The solo flight: fixed steps, tanks dropping between them, pinned to the
   browser's flyVolley by the volley-fall vectors. */
final class FlightTest extends TestCase
{
    public static function setUpBeforeClass(): void
    {
        require_once __DIR__ . '/rooms-lib.php';
    }

    /* make test's `php protocol/sim-vectors.php --check` keeps the file current; this checks the cases cover what they are for. */
    public function testTheVolleyFallVectorsReallyFall(): void
    {
        $dir = dirname(__DIR__, 2);
        $cases = json_decode((string) file_get_contents($dir . '/protocol/sim-vectors.json'), true)['groups']['volley-fall'];
        $this->assertGreaterThanOrEqual(4, count($cases));
        $this->assertNotEmpty(array_filter($cases, fn(array $c): bool => $c['out']['midFall']), 'some case drops a tank mid-volley');
    }

    public function testATankOverAPitFallsAndLands(): void
    {
        $s = ['terrain' => array_fill(0, 720, 400.0), 'shells' => [], 'tanks' => [['hp' => 50, 'x' => 300.0, 'y' => 300.0]]];
        $this->assertTrue(flight_falling($s));
        $y = [];
        for ($i = 0; $i < 3; $i++) {
            flight_fall($s, FLIGHT_STEP);
            $y[] = $s['tanks'][0]['y'];
        }
        $this->assertGreaterThan($y[0], $y[2]);
        $this->assertEqualsWithDelta(FLIGHT_FALL_GRAVITY * FLIGHT_STEP * 3, $s['tanks'][0]['vy'], 1e-9);
        $this->assertGreaterThan(0, flight_volley($s), 'a fall left over is stepped to its end');
        $this->assertSame(400.0, $s['tanks'][0]['y']);
        $this->assertFalse(flight_falling($s));
    }

    public function testLaterPelletsWaitForEarlierOnes(): void
    {
        $s = ['shells' => [
            ['owner' => 0, 'order' => [0], 'dead' => false], ['owner' => 0, 'order' => [1], 'dead' => false],
            ['owner' => 0, 'order' => [0, 2], 'dead' => false], ['owner' => 1, 'order' => [0], 'dead' => false],
        ]];
        $this->assertFalse(flight_waits($s, 0));
        $this->assertTrue(flight_waits($s, 1), 'pellet 1 waits on pellet 0');
        $this->assertTrue(flight_waits($s, 2), 'a bomblet of pellet 0 waits on the pellet itself');
        $this->assertFalse(flight_waits($s, 3), 'another gunner\'s shell never waits on this one');
    }
}
```

Run (in `games/tankity`): `php protocol/sim-vectors.php`
Expected: FAIL, `Call to undefined function flight_launch()`.

- [ ] **Step 2: The flight**

```php
<?php
// games/tankity/server/flight.php
// Operation Tankity: a volley as the browser's solo war flies it, for the
// server's play of a solo round. Fixed steps; each drops the tanks, then moves
// every shell, the shells of one volley flying together and bursting in
// launch order. src/sim.ts stepShells/fallTanks and src/solo-play.ts
// flyVolley are the same, pinned by the volley-fall vectors. Loaded by rooms.php.
declare(strict_types=1);

// Not an endpoint: rooms.php defines this constant, then requires the file.
if (!defined('TANKITY_ROOMS_INCLUDED')) {
    http_response_code(404);
    exit;
}

const FLIGHT_STEP = 1 / 60; // src/solo.ts SOLO_STEP
const FLIGHT_FALL_GRAVITY = 700.0; // src/sim.ts FALL_GRAVITY
const FLIGHT_MAX_STEPS = 20000; // src/solo-play.ts FLIGHT_MAX_STEPS

/* The ground under x: src/sim.ts surfY (Math.round, which is floor(x + 0.5)). */
function flight_surf(array $terrain, float $x): float
{
    $xi = max(0, min(count($terrain) - 1, (int) floor($x + 0.5)));
    return (float) $terrain[$xi];
}

/* src/sim.ts fireWeapon's launch: one shell per pellet, fanned by the spread. */
function flight_launch(array &$s, int $idx, string $wkey): void
{
    $t = $s['tanks'][$idx];
    $w = room_weapons()[$wkey];
    [$mx, $my] = room_muzzle($t);
    $r0 = deg2rad((float) $t['angle']);
    $dirS = $t['dirS'] ?? -1;
    $shots = (int) (($w['pellets'] ?? 0) ?: 1);
    $spd = room_shot_speed((float) $t['power'], !empty($w['flat']), (float) (($w['speed'] ?? 0) ?: 1.0));
    for ($i = 0; $i < $shots; $i++) {
        $off = $shots === 1 ? 0.0 : ($i - ($shots - 1) / 2) * (float) ($w['spread'] ?? 0.0);
        $a = $r0 + $off;
        $s['shells'][] = ['x' => $mx, 'y' => $my, 'vx' => cos($a) * $spd * $dirS, 'vy' => -sin($a) * $spd, 'w' => $wkey, 'owner' => $idx,
            'life' => 12.0, 'age' => 0.0, 'pierced' => null, 'split' => false, 'order' => [$i], 'dead' => false, 'clear' => false,
            'dw' => null, 'dr' => null, 'rolling' => false, 'ru' => 0.0, 'rt' => 0];
    }
}

/* src/sim.ts fallTanks: a tank above the ground falls under gravity until it lands. */
function flight_fall(array &$s, float $h): void
{
    foreach ($s['tanks'] as &$t) {
        if ($t['hp'] <= 0) {
            continue;
        }
        $gy = flight_surf($s['terrain'], (float) $t['x']);
        if ($t['y'] < $gy - 0.5) {
            $t['vy'] = ($t['vy'] ?? 0.0) + FLIGHT_FALL_GRAVITY * $h;
            $t['y'] = min($gy, $t['y'] + $t['vy'] * $h);
            if ($t['y'] >= $gy) {
                $t['vy'] = 0.0;
            }
        } else {
            $t['y'] = $gy;
            $t['vy'] = 0.0;
        }
    }
    unset($t);
}

function flight_falling(array $s): bool
{
    foreach ($s['tanks'] as $t) {
        if ($t['hp'] > 0 && $t['y'] < flight_surf($s['terrain'], (float) $t['x']) - 0.5) {
            return true;
        }
    }
    return false;
}

/* src/sim.ts waitsOnEarlier: a shell launched earlier in the same volley is still in the air. */
function flight_waits(array $s, int $k): bool
{
    $me = $s['shells'][$k];
    foreach ($s['shells'] as $j => $o) {
        if ($j === $k || $o['dead'] || $o['owner'] !== $me['owner']) {
            continue;
        }
        $n = min(count($me['order']), count($o['order']));
        for ($i = 0; $i < $n; $i++) {
            if ($o['order'][$i] !== $me['order'][$i]) {
                if ($o['order'][$i] < $me['order'][$i]) {
                    return true;
                }
                continue 2;
            }
        }
        if (count($o['order']) < count($me['order'])) {
            return true;
        }
    }
    return false;
}

/* src/sim.ts explode: the gunner's bracket learns where it burst, then the room blast. */
function flight_burst(array &$s, array $shell, float $x, float $y, ?int $direct, ?array $ov): void
{
    room_brk_land($s['tanks'][$shell['owner']], $x);
    $events = [];
    room_explode($s, $events, $s['tanks'][$shell['owner']], $shell['w'], $x, $y, $direct, $ov);
}

/* src/sim.ts stepRoller: one step of a ball on the ground. */
function flight_step_roller(array &$s, int $k, array $w, float $h): void
{
    $sh = $s['shells'][$k];
    $t = $s['terrain'];
    $n = count($t);
    $x0 = $sh['x'];
    $y0 = $sh['y'];
    $x = $sh['x'];
    $u = $sh['ru'];
    $done = $sh['rt'] >= (int) floor((($w['rollTime'] ?? 0) ?: 5.0) * 60 + 0.5) || $x <= 0 || $x >= $n - 1;
    $direct = null;
    if (!$done) {
        $moving = room_roll_step($t, $x, $u, (float) (($w['friction'] ?? 0) ?: 0.3), $h);
        $sh['rt']++;
        $sh['x'] = $x;
        $sh['ru'] = $u;
        $sh['y'] = room_ground_at($t, $x) - ROOM_ROLL_LIFT;
        $m = room_ground_slope($t, $x);
        $sh['vx'] = $u / sqrt(1 + $m * $m);
        $sh['vy'] = $sh['vx'] * $m;
        $done = !$moving;
        $clear = $sh['clear'];
        $hit = room_roll_hit($s, $x0, $y0, $sh['x'], $sh['y'], $sh['owner'], $clear);
        $sh['clear'] = $clear;
        if ($hit !== null) {
            $direct = $hit[0];
            $sh['x'] = $hit[1];
            $done = true;
        }
    }
    if (!$done) {
        $s['shells'][$k] = $sh;
        return;
    }
    $sh['dead'] = true;
    $s['shells'][$k] = $sh;
    $bx = max(0.0, min((float) ($n - 1), $sh['x']));
    flight_burst($s, $sh, $bx, room_ground_at($s['terrain'], $bx), $direct, null);
}

/* src/sim.ts stepShells: every shell one step. Bomblets born this step fly
   this step too; a shell that would burst while an earlier one of its volley
   is in the air holds where it was. */
function flight_step_shells(array &$s, float $h): void
{
    $weapons = room_weapons();
    $width = count($s['terrain']);
    for ($k = 0; $k < count($s['shells']); $k++) {
        $sh = $s['shells'][$k];
        $w = $weapons[$sh['w']];
        $effect = $w['effect'] ?? 'shot';
        if ($sh['rolling']) {
            flight_step_roller($s, $k, $w, $h);
            continue;
        }
        $sh['age'] += $h;
        if ($effect === 'seeker') {
            $dv = room_seek_push($s['tanks'], $sh['owner'], $sh['x'], $sh['y'], (float) (($w['steer'] ?? 0) ?: 70.0), $h);
            if ($dv !== null) {
                $sh['vx'] += $dv[0];
                $sh['vy'] += $dv[1];
            }
        }
        $x0 = $sh['x'];
        $y0 = $sh['y'];
        $held = [$sh['vx'], $sh['vy'], $sh['age'] - $h, $sh['life'], $sh['clear']];
        $grav = !empty($w['flat']) ? (float) ROOM_FLAT_GRAV : (float) ROOM_GRAV;
        $sh['vx'] += $s['wind'] * ROOM_TURN_WIND * $h;
        $sh['vy'] += $grav * $h;
        $sh['x'] += $sh['vx'] * $h;
        $sh['y'] += $sh['vy'] * $h;
        $sh['life'] -= $h;
        if ($sh['life'] <= 0 || $sh['x'] < -20 || $sh['x'] > $width + 20 || $sh['y'] > 500) {
            $sh['dead'] = true;
            $s['shells'][$k] = $sh;
            continue;
        }
        if ($effect === 'cluster' && !$sh['split'] && $sh['age'] >= (float) (($w['fuse'] ?? 0) ?: 0.9)) {
            $sh['split'] = true;
            $sh['dead'] = true;
            $s['shells'][$k] = $sh;
            $n = max(2, (int) (($w['split'] ?? 0) ?: 4));
            foreach (room_split_vel($sh['vx'], $sh['vy'], $n, (float) (($w['fan'] ?? 0) ?: 0.22)) as $i => [$vx, $vy]) {
                $s['shells'][] = ['x' => $sh['x'], 'y' => $sh['y'], 'vx' => $vx, 'vy' => $vy, 'w' => $sh['w'], 'owner' => $sh['owner'],
                    'life' => 12.0, 'age' => 0.0, 'pierced' => null, 'split' => true, 'order' => [...$sh['order'], $i], 'dead' => false, 'clear' => false,
                    'dw' => (int) (($w['subDmg'] ?? 0) ?: $w['dmg']), 'dr' => (float) (($w['subRadius'] ?? 0) ?: $w['radius']),
                    'rolling' => false, 'ru' => 0.0, 'rt' => 0];
            }
            continue;
        }
        $direct = null;
        $clear = $sh['clear'];
        $hit = room_sweep_hit($s, $x0, $y0, $sh['x'], $sh['y'], $sh['pierced'], $sh['owner'], $clear);
        $sh['clear'] = $clear;
        if ($hit !== null) {
            [$direct, $sh['x'], $sh['y']] = $hit;
        }
        if ($direct === null && $effect === 'proximity') {
            $bd = (float) (($w['prox'] ?? 0) ?: 34.0);
            foreach ($s['tanks'] as $i => $t) {
                if ($t['hp'] <= 0 || $i === $sh['owner']) {
                    continue;
                }
                $d = room_dist($sh['x'] - $t['x'], $sh['y'] - ($t['y'] - 12));
                if ($d < $bd) {
                    $bd = $d;
                    $direct = $i;
                }
            }
        }
        $grounded = ($sh['split'] || $sh['age'] >= 0.1) && $sh['y'] >= flight_surf($s['terrain'], $sh['x']);
        if (($direct !== null || ($grounded && $effect !== 'roller')) && flight_waits($s, $k)) {
            $sh['x'] = $x0;
            $sh['y'] = $y0;
            [$sh['vx'], $sh['vy'], $sh['age'], $sh['life'], $sh['clear']] = $held;
            $s['shells'][$k] = $sh;
            continue;
        }
        $ov = $sh['dw'] !== null ? ['dmg' => $sh['dw'], 'radius' => $sh['dr']] : null;
        if ($direct !== null) {
            // A lance punches through its first victim and keeps flying.
            if ($effect === 'pierce' && $sh['pierced'] === null) {
                $sh['pierced'] = $direct;
            } else {
                $sh['dead'] = true;
            }
            $s['shells'][$k] = $sh;
            flight_burst($s, $sh, $sh['x'], $sh['y'], $direct, $ov);
            continue;
        }
        if ($grounded && $effect === 'roller') {
            $sh['rolling'] = true;
            $sh['rt'] = 0;
            $sh['x'] = max(0.0, min((float) ($width - 1), $sh['x']));
            $sh['ru'] = room_roll_start($s['terrain'], $sh['x'], $sh['vx'], $sh['vy']);
            $sh['y'] = room_ground_at($s['terrain'], $sh['x']) - ROOM_ROLL_LIFT;
            $s['shells'][$k] = $sh;
            continue;
        }
        if ($grounded) {
            $sh['dead'] = true;
            $s['shells'][$k] = $sh;
            flight_burst($s, $sh, $sh['x'], $sh['y'], null, $ov);
            continue;
        }
        $s['shells'][$k] = $sh;
    }
    $s['shells'] = array_values(array_filter($s['shells'], fn(array $x): bool => !$x['dead']));
}

/* The war's steps for one volley: each drops the tanks, then moves the shells;
   once the last shell is gone, steps drop the tanks until none is falling.
   $onStep sees the state after each step. Answers the steps taken. */
function flight_volley(array &$s, ?Closure $onStep = null): int
{
    $steps = 0;
    for (; ($s['shells'] ?? []) && $steps < FLIGHT_MAX_STEPS; $steps++) {
        flight_fall($s, FLIGHT_STEP);
        flight_step_shells($s, FLIGHT_STEP);
        if ($onStep !== null) {
            $onStep($s);
        }
    }
    for (; flight_falling($s) && $steps < FLIGHT_MAX_STEPS; $steps++) {
        flight_fall($s, FLIGHT_STEP);
        if ($onStep !== null) {
            $onStep($s);
        }
    }
    return $steps;
}
```

Each line mirrors one in `src/sim.ts`, with JavaScript's `||` defaults written as `?:` (a zero falls back as it does there). `rooms.php`: after `require_once __DIR__ . '/server/sim.php';` add `require_once __DIR__ . '/server/flight.php';` and the map line `//   server/flight.php    a solo volley in fixed steps, tanks falling between`.

- [ ] **Step 3: Run both sides**

Run (in `games/tankity`): `php protocol/sim-vectors.php && node --test test/sim-vectors.test.mjs` then (in `websites/www.cs`) `vendor/bin/phpunit --testsuite tankity --filter FlightTest`
Expected: PASS; `volley-fall` lists six cases and at least one with `"midFall": true`. A mismatch names the case: step both sides with `onStep` dumping every shell and tank, find the first step that differs, and fix the side that departs from `src/sim.ts` (never the vector).

- [ ] **Step 4: Commit**

```bash
git add games/tankity/server/flight.php games/tankity/rooms.php games/tankity/protocol/sim-vectors.php games/tankity/protocol/sim-vectors.json games/tankity/test/sim-vectors.test.mjs games/tankity/test/php/FlightTest.php
git commit -F- <<'MSG'
Tankity: the solo volley in PHP, step for step with the browser, tanks falling mid-volley

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb
MSG
```

### Task 30: The PHP round, and its CPU per round

**Files:**
- Modify: `games/tankity/server/solo.php` (turns, settle, 1-ups, fire, `solo_round`, `solo_claim`)
- Create: `games/tankity/test/php/SoloRoundTest.php`
- Create: `games/tankity/tools/round-bench.php`
- Modify: `games/tankity/server/sim.php` (`room_sim_shot`, `room_fly_arc`: loop constants hoisted, bit-identical)
- Modify: `games/tankity/test.sh` (exclude the `slow` group)
- Modify: `.github/workflows/ci.yml` (the nightly job also runs `phpunit --testsuite tankity --group slow` and the bench)

**Interfaces:**
- Consumes: Task 28 (`solo_deal`, `solo_muster`); Task 29 (`flight_launch`, `flight_volley`); `room_ai_choose` (its aim comes from `ROOM_DIFFICULTY[room_difficulty($s)]`, the run's difficulty), `room_spot_taken`, `room_gauss`, `room_buy`, `room_carry_armor`; `ROOM_DIFFICULTY`.
- Produces: `SOLO_ROUND_CPU = 2.0`, `SOLO_MAX_SHOTS = 200`, `SOLO_MAX_BUYS = 60` (`src/solo-log.ts` `ROUND_MAX_SHOTS`, `ROUND_MAX_BUYS`); `solo_next_turn(array &$s): void`; `solo_settle(array &$s): string` (`'next' | 'roundWon' | 'tankLost' | 'matchLost'`); `solo_oneups(array &$s): void`; `solo_drone_turn(array &$s): void`; `solo_player_fire(array &$s, array $m): ?string`; `solo_cpu_now(): float`; `solo_claim(array $s, string $end): array` (`end, score, cash, lives, roundsWon`, the shape of `RoundClaim`); `solo_round(array $s, mixed $buys, mixed $shots, float $cpuBudget = SOLO_ROUND_CPU): array` → `['ok' => true, 's' => array, 'claim' => array]` or `['ok' => false, 'error' => string]`. `php tools/round-bench.php` prints the worst round's CPU per recorded run and exits 1 when any round needs more than `SOLO_ROUND_CPU`.

- [ ] **Step 1: Failing test**

```php
<?php
// games/tankity/test/php/SoloRoundTest.php
declare(strict_types=1);

use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\Attributes\Group;
use PHPUnit\Framework\TestCase;

/* Every round of the browser's recorded solo runs (protocol/solo-runs.json),
   played in PHP from the stored state, reaches the browser's claim; a
   tampered round does not. */
final class SoloRoundTest extends TestCase
{
    public static function setUpBeforeClass(): void
    {
        require_once __DIR__ . '/rooms-lib.php';
    }

    /** @return array<string, array{array}> */
    private static function runs(callable $keep): array
    {
        $all = json_decode((string) file_get_contents(dirname(__DIR__, 2) . '/protocol/solo-runs.json'), true);
        $out = [];
        foreach ($all['runs'] as $r) {
            if ($keep($r)) {
                $out[$r['name']] = [$r];
            }
        }
        return $out;
    }

    public static function shortRuns(): array
    {
        return self::runs(fn($r) => count($r['rounds']) <= 8);
    }

    public static function longRuns(): array
    {
        return self::runs(fn($r) => count($r['rounds']) > 8);
    }

    /** Plays $run round by round, carrying the state between rounds as the database does. */
    private function play(array $run, ?callable $tamper = null): array
    {
        $s = solo_deal($run['seed'], $run['difficulty']);
        foreach ($run['rounds'] as $k => $r) {
            if ($tamper !== null) {
                $r = $tamper($k, $r);
            }
            $got = solo_round(unserialize(serialize($s)), $r['buys'], $r['shots'], 30.0);
            if (!$got['ok']) {
                return ['round' => $r['n'], 'error' => $got['error']];
            }
            if ($got['claim'] !== $r['claim']) {
                return ['round' => $r['n'], 'error' => 'mismatch', 'server' => $got['claim'], 'browser' => $r['claim']];
            }
            $s = $got['s'];
        }
        return ['score' => (int) $s['scores'][0], 'roundsWon' => (int) $s['roundsWon'], 'rounds' => (int) $s['round'], 'phase' => $s['phase']];
    }

    private function assertPlays(array $run): void
    {
        $this->assertSame(['score' => $run['score'], 'roundsWon' => $run['roundsWon'], 'rounds' => count($run['rounds']), 'phase' => 'over'],
            $this->play($run), $run['name']);
    }

    #[DataProvider('shortRuns')]
    public function testEveryRoundReachesTheBrowsersClaim(array $run): void
    {
        $this->assertPlays($run);
    }

    #[DataProvider('longRuns')]
    #[Group('slow')]
    public function testALongRunPlaysToo(array $run): void
    {
        $this->assertPlays($run);
    }

    public function testTheRecordedRunsCoverEveryDifficultyAndPassSixtyRounds(): void
    {
        $all = array_column(array_merge(self::shortRuns(), self::longRuns()), 0);
        $levels = array_unique(array_column($all, 'difficulty'));
        sort($levels);
        $this->assertSame(['easy', 'hard', 'normal'], array_values($levels));
        $this->assertGreaterThan(60, max(array_map(fn($r) => count($r['rounds']), $all)), 'solo has no round limit');
    }

    private function sample(): array
    {
        return array_values(self::shortRuns())[0][0];
    }

    public function testTheRunsDifficultyAimsTheDrones(): void
    {
        $run = $this->sample();
        $run['difficulty'] = $run['difficulty'] === 'hard' ? 'easy' : 'hard';
        $this->assertArrayHasKey('error', $this->play($run));
    }

    public function testAMissingShotLeavesTheRoundUnfinished(): void
    {
        $got = $this->play($this->sample(), function (int $k, array $r): array {
            if ($k === 0) {
                array_pop($r['shots']);
            }
            return $r;
        });
        $this->assertSame(1, $got['round']);
        $this->assertContains($got['error'], ['unfinished', 'mismatch']);
    }

    public function testShotsAfterTheEndAreRefused(): void
    {
        $got = $this->play($this->sample(), function (int $k, array $r): array {
            if ($k === 0) {
                $r['shots'][] = end($r['shots']) ?: ['w' => 'shell', 'a' => 45, 'p' => 50, 'x' => 100];
            }
            return $r;
        });
        $this->assertSame(['round' => 1, 'error' => 'shots after the end'], array_intersect_key($got, ['round' => 1, 'error' => 1]));
    }

    public function testAShotOutOfRangeIsRefused(): void
    {
        $got = $this->play($this->sample(), function (int $k, array $r): array {
            if ($k === 0) {
                $r['shots'][0]['a'] = 200;
            }
            return $r;
        });
        $this->assertSame(['round' => 1, 'error' => 'out of range'], $got);
    }

    public function testATeleportIsRefused(): void
    {
        $got = $this->play($this->sample(), function (int $k, array $r): array {
            if ($k === 0) {
                $x = $r['shots'][0]['x'];
                $r['shots'][0]['x'] = $x < 360 ? $x + 300 : $x - 300;
            }
            return $r;
        });
        $this->assertArrayHasKey('error', $got);
    }

    public function testBuyingWithoutCashIsRefused(): void
    {
        $got = $this->play($this->sample(), function (int $k, array $r): array {
            if ($k === 0) {
                array_unshift($r['buys'], ['i' => 'extralife', 'q' => 1]);
            }
            return $r;
        });
        $this->assertSame(['round' => 1, 'error' => 'bad buy'], $got);
    }

    public function testTooManyShotsAreRefusedBeforeAnyPlay(): void
    {
        $s = solo_deal('x', 'normal');
        $this->assertSame(['ok' => false, 'error' => 'too many shots'],
            solo_round($s, [], array_fill(0, SOLO_MAX_SHOTS + 1, ['w' => 'shell', 'a' => 45, 'p' => 50, 'x' => 100])));
        $this->assertSame(['ok' => false, 'error' => 'bad buys'], solo_round($s, ['i' => 'mortar'], []));
    }

    public function testAnOverRunPlaysNoMore(): void
    {
        $s = solo_deal('x', 'normal');
        $s['phase'] = 'over';
        $this->assertSame(['ok' => false, 'error' => 'the run is over'], solo_round($s, [], []));
    }

    public function testTheCpuBudgetIsEnforced(): void
    {
        $r = $this->sample()['rounds'][0];
        $this->assertSame(['ok' => false, 'error' => 'too slow'], solo_round(solo_deal($this->sample()['seed'], $this->sample()['difficulty']), $r['buys'], $r['shots'], 0.0));
    }
}
```

In `test.sh` change the PHPUnit line to `../../vendor/bin/phpunit -c ../../phpunit.xml --testsuite tankity --exclude-group slow`.

Run (in `websites/www.cs`): `vendor/bin/phpunit --testsuite tankity --filter SoloRoundTest --exclude-group slow`
Expected: FAIL, `Call to undefined function solo_round()`.

- [ ] **Step 2: Implement**

Append to `server/solo.php`:

```php
const SOLO_ROUND_CPU = 2.0;
const SOLO_MAX_SHOTS = 200; // src/solo-log.ts ROUND_MAX_SHOTS
const SOLO_MAX_BUYS = 60; // src/solo-log.ts ROUND_MAX_BUYS

function solo_next_turn(array &$s): void
{
    $n = count($s['tanks']);
    for ($k = 1; $k <= $n; $k++) {
        $i = ($s['turn'] + $k) % $n;
        if ($s['tanks'][$i]['hp'] > 0) {
            $s['turn'] = $i;
            return;
        }
    }
}

/* src/solo.ts soloSettle(): play on (the wind shifts, the next unit is up), or
   the round ends: won, a life lost, or the match lost. */
function solo_settle(array &$s): string
{
    // The falls are over (flight_volley stepped them out); this settles the last half pixel, as snapTanks does.
    foreach ($s['tanks'] as &$t) {
        if ($t['hp'] > 0) {
            $t['y'] = flight_surf($s['terrain'], (float) $t['x']);
            $t['vy'] = 0.0;
        }
    }
    unset($t);
    $me = $s['tanks'][0];
    $alive = 0;
    foreach ($s['tanks'] as $t) {
        if ($t['hp'] > 0) {
            $alive++;
        }
    }
    if ($alive > 1 && !($me['hp'] <= 0 && ++$s['watchTurns'] >= ROOM_WATCH_TURNS)) {
        $s['wind'] = (int) max(-12, min(12, js_round($s['wind'] + room_gauss($s['rng']) * 2)));
        solo_next_turn($s);
        return 'next';
    }
    if ($me['hp'] <= 0) {
        $s['seats'][0]['lives']--;
        room_carry_armor($s, 0, 0, true);
        if ($s['seats'][0]['lives'] <= 0) {
            $s['seats'][0]['lives'] = 0;
            $s['phase'] = 'over';
            return 'matchLost';
        }
        $s['phase'] = 'shop';
        return 'tankLost';
    }
    $s['roundsWon']++;
    $s['scores'][0] += 750 + $s['round'] * 150;
    $s['cash'][0] += 500 + $s['round'] * 100;
    if ($s['jammer'][0] > 0) {
        $s['jammer'][0]--;
    }
    if ($s['bunker'][0] > 0) {
        $s['bunker'][0]--;
    }
    room_carry_armor($s, 0, (int) $me['hp'], false);
    $s['phase'] = 'shop';
    return 'roundWon';
}

/* src/solo.ts soloOneUps(): a life per 3000 points up to five; past five, 500 points. */
function solo_oneups(array &$s): void
{
    while ($s['scores'][0] >= $s['nextUp'][0]) {
        $s['nextUp'][0] += 3000;
        if ($s['seats'][0]['lives'] < 5) {
            $s['seats'][0]['lives']++;
        } else {
            $s['scores'][0] += 500;
        }
    }
}

/* A drone's turn, as src/solo-play.ts plays one: choose, shuffle, launch. */
function solo_drone_turn(array &$s): void
{
    $cur = $s['turn'];
    $choice = room_ai_choose($s, $s['tanks'][$cur]);
    if (isset($choice['tactic'])) {
        $s['tactics'][$s['tanks'][$cur]['name']] = $choice['tactic'];
    }
    $s['tanks'][$cur]['angle'] = $choice['angle'];
    $s['tanks'][$cur]['power'] = $choice['power'];
    $nx = max(12.0, min(SOLO_W - 12.0, $s['tanks'][$cur]['x'] + $choice['dx']));
    if (abs($choice['dx']) > 0.5 && !room_spot_taken($s, $cur, $nx)) {
        $s['tanks'][$cur]['x'] = $nx;
        $s['tanks'][$cur]['y'] = flight_surf($s['terrain'], $nx);
    }
    $s['tanks'][$cur]['brk']['ox'] = $s['tanks'][$cur]['x'];
    if ($choice['wkey'] !== 'shell') {
        $s['tanks'][$cur]['ammo'][$choice['wkey']] = max(0, ($s['tanks'][$cur]['ammo'][$choice['wkey']] ?? 0) - 1);
    }
    flight_launch($s, $cur, $choice['wkey']);
}

/* The player's shot: drive to x (fuel pays for the distance; the spot must be
   free), aim, launch. An error line when the move is not legal. */
function solo_player_fire(array &$s, array $m): ?string
{
    $w = $m['w'] ?? null;
    foreach (['a', 'p', 'x'] as $k) {
        if (!isset($m[$k]) || !(is_int($m[$k]) || is_float($m[$k])) || !is_finite((float) $m[$k])) {
            return 'bad move';
        }
    }
    if (!is_string($w) || !isset(room_weapons()[$w])) {
        return 'no such weapon';
    }
    $a = (float) $m['a'];
    $p = (float) $m['p'];
    $x = (float) $m['x'];
    if ($a < 10 || $a > 170 || $p < 10 || $p > 100 || $x < 12 || $x > SOLO_W - 12) {
        return 'out of range';
    }
    $dx = abs($x - $s['tanks'][0]['x']);
    if ($dx > 0) {
        if ($dx > $s['tanks'][0]['fuel'] + 1e-6) {
            return 'not enough fuel';
        }
        if (room_spot_taken($s, 0, $x)) {
            return 'blocked';
        }
        $s['tanks'][0]['fuel'] = max(0.0, $s['tanks'][0]['fuel'] - $dx);
        $s['tanks'][0]['x'] = $x;
        $s['tanks'][0]['y'] = flight_surf($s['terrain'], $x);
    }
    $have = $s['ammo'][0][$w] ?? 0;
    if ($w !== 'shell') {
        if ($have <= 0) {
            return 'none left';
        }
        $s['ammo'][0][$w] = $have - 1;
    }
    $s['tanks'][0]['angle'] = $a;
    $s['tanks'][0]['power'] = $p;
    flight_launch($s, 0, $w);
    return null;
}

function solo_cpu_now(): float
{
    $u = getrusage();
    return $u['ru_utime.tv_sec'] + $u['ru_utime.tv_usec'] / 1e6 + $u['ru_stime.tv_sec'] + $u['ru_stime.tv_usec'] / 1e6;
}

/* How a round ended, in src/solo-log.ts RoundClaim's shape. */
function solo_claim(array $s, string $end): array
{
    return ['end' => $end, 'score' => (int) $s['scores'][0], 'cash' => (int) $s['cash'][0],
        'lives' => (int) $s['seats'][0]['lives'], 'roundsWon' => (int) $s['roundsWon']];
}

/* Plays one round of a run from its stored state (the shop before it): the
   round's purchases, the muster, then turns until the round ends, the
   player's turns taking the round's shots in order. src/solo-play.ts
   soloRound() is the same, refusal for refusal. At most $cpuBudget seconds of
   CPU, SOLO_MAX_SHOTS shots and SOLO_MAX_BUYS purchases. */
function solo_round(array $s, mixed $buys, mixed $shots, float $cpuBudget = SOLO_ROUND_CPU): array
{
    $no = fn(string $why): array => ['ok' => false, 'error' => $why];
    if (($s['phase'] ?? '') !== 'shop') {
        return $no('the run is over');
    }
    if (!is_array($buys) || !array_is_list($buys) || count($buys) > SOLO_MAX_BUYS) {
        return $no('bad buys');
    }
    if (!is_array($shots) || !array_is_list($shots) || count($shots) > SOLO_MAX_SHOTS) {
        return $no('too many shots');
    }
    $t0 = solo_cpu_now();
    foreach ($buys as $b) {
        $q = is_array($b) ? ($b['q'] ?? null) : null;
        if (!is_array($b) || !is_string($b['i'] ?? null) || !is_int($q) || room_buy($s, 0, $b['i'], $q) !== null) {
            return $no('bad buy');
        }
        solo_oneups($s);
    }
    $s['round']++;
    solo_muster($s);
    $i = 0;
    $n = count($shots);
    for (;;) {
        if (solo_cpu_now() - $t0 > $cpuBudget) {
            return $no('too slow');
        }
        if ($s['turn'] === 0) {
            if ($i >= $n) {
                return $no('unfinished');
            }
            $m = $shots[$i++];
            $err = is_array($m) ? solo_player_fire($s, $m) : 'bad move';
            if ($err !== null) {
                return $no($err);
            }
        } else {
            solo_drone_turn($s);
        }
        flight_volley($s);
        solo_oneups($s);
        $end = solo_settle($s);
        if ($end === 'next') {
            continue;
        }
        if ($end !== 'matchLost') {
            solo_oneups($s);
        }
        if ($i !== $n) {
            return $no('shots after the end');
        }
        return ['ok' => true, 's' => $s, 'claim' => solo_claim($s, $end)];
    }
}
```

- [ ] **Step 3: Run**

Run (in `websites/www.cs`): `vendor/bin/phpunit --testsuite tankity --exclude-group slow`
Expected: PASS. A run that disagrees names its round and both claims: play that round in node with `soloRound` and in PHP with `solo_round` from the same state, dump the state after each volley, and fix the side that departs from `src/solo.ts`; add the case that found it to the sim vectors.

- [ ] **Step 4: The bench, and the hot loop trimmed bit for bit**

```php
<?php
// games/tankity/tools/round-bench.php
// CPU per round of every recorded solo run (protocol/solo-runs.json), with no
// budget cap. Exit 1 when any round needs more than SOLO_ROUND_CPU: an honest
// round must always play.
//   php -d xdebug.mode=off tools/round-bench.php
declare(strict_types=1);
define('TANKITY_ROOMS_LIB', true);
require __DIR__ . '/../rooms.php';

$runs = json_decode((string) file_get_contents(__DIR__ . '/../protocol/solo-runs.json'), true)['runs'];
$over = 0;
foreach ($runs as $r) {
    $s = solo_deal($r['seed'], $r['difficulty']);
    $worst = 0.0;
    $total = 0.0;
    foreach ($r['rounds'] as $round) {
        $t0 = solo_cpu_now();
        $got = solo_round($s, $round['buys'], $round['shots'], 1e9);
        $cpu = solo_cpu_now() - $t0;
        $worst = max($worst, $cpu);
        $total += $cpu;
        if (!$got['ok']) {
            printf("%-14s round %d REFUSED %s\n", $r['name'], $round['n'], $got['error']);
            $over++;
            break;
        }
        $s = $got['s'];
    }
    printf("%-14s %3d rounds  worst %5.3f s  total %6.2f s\n", $r['name'], count($r['rounds']), $worst, $total);
    if ($worst > SOLO_ROUND_CPU) {
        $over++;
    }
}
exit($over ? 1 : 0);
```

Run (in `games/tankity`): `php -d xdebug.mode=off tools/round-bench.php`
Expected: every run's worst round well under a second; record the numbers in the PR description.

The drones' aim search calls `room_sim_shot` some 300 times per gun per turn. In `room_sim_shot()` hoist the per-step constants (the products are formed in the same order, so every value is identical):

```php
    $windStep = $wind * ROOM_TURN_WIND * $dt;
    $gravStep = $grav * $dt;
    $roller = ($weapons[$wkey]['effect'] ?? 'shot') === 'roller';
    for ($i = 0; $i < 720; $i++) {
        $vx += $windStep;
        $vy += $gravStep;
        $x += $vx * $dt;
        $y += $vy * $dt;
        if ($x < 0 || $x >= $w || $y >= 500) {
            return ['x' => $x, 'y' => $y, 'oob' => true];
        }
        $xi = $x < 0.5 ? 0 : ($x >= $w - 0.5 ? $w - 1 : (int) round($x));
        if ($i >= 6 && $y >= $terrain[$xi]) { // the real flight ignores ground for its first 0.1 s
            if ($roller) {
                [$rx, $ry] = room_roll_out($terrain, $x, $vx, $vy, $weapons[$wkey]);
                return ['x' => $rx, 'y' => $ry, 'oob' => false];
            }
            return ['x' => $x, 'y' => $y, 'oob' => false];
        }
    }
```

and in `room_fly_arc()` likewise `$windStep = $room['wind'] * ROOM_TURN_WIND * $dt; $gravStep = $grav * $dt;` before the loop, using them in `$vx += $windStep; $vy += $gravStep;` (the seeker push stays inside the loop, before them, as now).

Run (in `games/tankity`): `php protocol/sim-vectors.php --check && php -d xdebug.mode=off tools/round-bench.php` and (in `websites/www.cs`) `vendor/bin/phpunit --testsuite tankity --group slow`
Expected: vectors current (bit-identical), every recorded round still plays, and lower CPU numbers.

If a round still needs more than `SOLO_ROUND_CPU` on this machine, stop before Task 31 and report the numbers: the budget or the shot cap is wrong for honest play, and William decides which moves.

- [ ] **Step 5: Nightly**

In `.github/workflows/ci.yml`'s scheduled job, after the full e2e run, add:

```yaml
      - name: Tankity long solo runs and the per-round CPU bench (slow)
        working-directory: websites/www.cs
        run: |
          vendor/bin/phpunit --testsuite tankity --group slow
          (cd games/tankity && php -d xdebug.mode=off tools/round-bench.php)
```

- [ ] **Step 6: Commit**

```bash
git add games/tankity/server/solo.php games/tankity/server/sim.php games/tankity/test/php/SoloRoundTest.php games/tankity/tools/round-bench.php games/tankity/test.sh .github/workflows/ci.yml
git commit -F- <<'MSG'
Tankity: the server plays a solo round from its stored state; CPU bounded per round

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb
MSG
```

### Task 31: The score endpoint on the guard: start a run, play its rounds, file it

**Files:**
- Create: `games/tankity/server/scores-api.php`
- Modify: `games/tankity/server/db.php` (schema step 3: `solo_runs`)
- Modify: `games/tankity/server/housekeep.php` (`tankity_jobs`: the `solo` job)
- Modify: `games/tankity/scores.php` (thin bootstrap)
- Create: `games/tankity/test/php/ScoresApiTest.php`

**Interfaces:**
- Consumes: Plan C's `Kit\ScoreGuard` (`csrfToken`, `originAllowed`, `csrfOk`, `startRun`, `consumeRun`, `rateTake`), Task 10's `tankity_guard()`, `tankity_initials()`, `board_level`, `board_file`, `board_top`; Task 28's `solo_deal`; Task 30's `solo_round`; PR 20's `tankity_db`, `tankity_tx`, `tankity_housekeep`.
- Produces: `SCORES_MAX_BODY = 262144`; `SOLO_RUN_IDLE = 7200`, `SOLO_RUN_MAX_AGE = 86400`, `SOLO_RUN_FILED_KEEP = 3600`, `SOLO_MAX_LIVE_RUNS = 1000`, `SOLO_ROUNDS_PER_HOUR = 240`; schema step 3 `solo_runs (id TEXT PRIMARY KEY, difficulty, seed, created, touched, round, status ('live' | 'over' | 'void' | 'filed'), state BLOB, reply TEXT)`; `solo_runs_expire(int $now, int $limit = 100): int`; `tankity_scores_handle(string $method, array $query, string $raw, Kit\ScoreGuard $guard, int $now): array` → `[int status, array payload]`. Wire:
  - GET `?difficulty=` → `{ difficulty, scores, keep, csrf }`.
  - POST (JSON, allowed origin, CSRF header) `{op:'start', seed, difficulty}` → `{ ok, run }`; 422 seed or difficulty; 429 `'rate'`; 503 `'busy'` at `SOLO_MAX_LIVE_RUNS`.
  - `{op:'round', run, n, buys, shots, claim}` → `{ ok, n, end, score, cash, lives, roundsWon }` (the server's claim); a round already played answers its stored reply again; 409 `{ error: 'out of order', round }`; 422 `{ error: 'void', why }` and the run is void from then on (a refused round, or a claim that is not the server's: `why: 'mismatch'`, with `server` holding the server's claim); 409 `'void'` for a void run; 410 `'expired'`; 404 `'no such run'`; 429 `'rate'`.
  - `{op:'file', run, initials}` → `{ ok, score, roundsWon, rank, difficulty }`; 409 `'the run is not over'` / `'void'`; 400 `'invalid run'` (a token spent or expired); 422 initials; 410; 404; 429.
  - 403 `'forbidden'`, 413 `'too large'`, 400 `'invalid json'`.

- [ ] **Step 1: Failing test**

```php
<?php
// games/tankity/test/php/ScoresApiTest.php
declare(strict_types=1);

use Kit\ScoreGuard;
use PHPUnit\Framework\TestCase;

/* scores.php's handler: every guard rule, the server playing each round from
   the stored state, and filing what the server already holds. */
final class ScoresApiTest extends TestCase
{
    private string $dir;
    private array $override;
    private int $now;
    private const TOKEN = '0123456789abcdef0123456789abcdef';

    public static function setUpBeforeClass(): void
    {
        require_once __DIR__ . '/rooms-lib.php';
        require_once dirname(__DIR__, 2) . '/server/scores-api.php';
    }

    protected function setUp(): void
    {
        $this->dir = tankity_test_dir();
        $this->override = ['startsPerHour' => 3];
        $this->now = 1_800_000_000;
        $_SERVER = ['HTTP_HOST' => 'localhost', 'HTTP_ORIGIN' => 'http://localhost', 'CONTENT_TYPE' => 'application/json',
            'REMOTE_ADDR' => '203.0.113.' . random_int(1, 254), 'HTTP_X_TANKITY_CSRF' => self::TOKEN, 'SCRIPT_NAME' => '/games/tankity/scores.php'];
        $_COOKIE = ['tankity_csrf' => self::TOKEN];
    }

    protected function tearDown(): void
    {
        tankity_test_rm($this->dir);
    }

    /** The guard for this test's request, on the test's clock; it sets no real cookie. */
    private function guard(): ScoreGuard
    {
        return tankity_guard($this->override, $_SERVER, $_COOKIE, fn(): int => $this->now, function (): void {});
    }

    private function post(array $body): array
    {
        return tankity_scores_handle('POST', [], (string) json_encode($body), $this->guard(), $this->now);
    }

    private function recorded(): array
    {
        $all = json_decode((string) file_get_contents(dirname(__DIR__, 2) . '/protocol/solo-runs.json'), true)['runs'];
        foreach ($all as $r) {
            if (count($r['rounds']) <= 8) {
                return $r;
            }
        }
        $this->fail('no short recorded run');
    }

    private function start(array $run): string
    {
        [$status, $out] = $this->post(['op' => 'start', 'seed' => $run['seed'], 'difficulty' => $run['difficulty']]);
        $this->assertSame(200, $status, json_encode($out));
        return $out['run'];
    }

    private function round(string $id, array $r): array
    {
        return $this->post(['op' => 'round', 'run' => $id] + $r);
    }

    /** Starts the run and sends every round; answers its id. */
    private function playAll(array $run): string
    {
        $id = $this->start($run);
        foreach ($run['rounds'] as $r) {
            $this->now += 30;
            [$status, $out] = $this->round($id, $r);
            $this->assertSame(200, $status, json_encode($out));
            $this->assertSame($r['claim'], array_intersect_key($out, $r['claim']));
        }
        return $id;
    }

    public function testGetGivesTheBoardOfTheAskedDifficultyAndTheToken(): void
    {
        board_file(['difficulty' => 'hard', 'initials' => 'HRD', 'score' => 5, 'rounds' => 1, 'seed' => 's']);
        [$status, $out] = tankity_scores_handle('GET', ['difficulty' => 'hard'], '', $this->guard(), $this->now);
        $this->assertSame(200, $status);
        $this->assertSame(self::TOKEN, $out['csrf']);
        $this->assertSame(['hard', ['HRD']], [$out['difficulty'], array_column($out['scores'], 'initials')]);
        $this->assertSame([], tankity_scores_handle('GET', [], '', $this->guard(), $this->now)[1]['scores'], 'Normal by default');
        $this->assertSame(422, tankity_scores_handle('GET', ['difficulty' => 'brutal'], '', $this->guard(), $this->now)[0]);
    }

    public function testABadOriginIsForbidden(): void
    {
        $_SERVER['HTTP_ORIGIN'] = 'https://evil.example';
        $this->assertSame(403, $this->post(['op' => 'start', 'seed' => 's', 'difficulty' => 'normal'])[0]);
    }

    public function testAMissingCsrfHeaderIsForbidden(): void
    {
        unset($_SERVER['HTTP_X_TANKITY_CSRF']);
        $this->assertSame(403, $this->post(['op' => 'start', 'seed' => 's', 'difficulty' => 'normal'])[0]);
    }

    public function testAMismatchedCsrfIsForbidden(): void
    {
        $_SERVER['HTTP_X_TANKITY_CSRF'] = 'ffffffffffffffffffffffffffffffff';
        $this->assertSame(403, $this->post(['op' => 'start', 'seed' => 's', 'difficulty' => 'normal'])[0]);
    }

    public function testStartsAreRateLimitedAndChecked(): void
    {
        $this->assertSame(422, $this->post(['op' => 'start', 'seed' => "h\u{e9}llo", 'difficulty' => 'normal'])[0]);
        $this->assertSame(422, $this->post(['op' => 'start', 'seed' => 's', 'difficulty' => 'brutal'])[0]);
        for ($i = 0; $i < 3; $i++) {
            $this->assertSame(200, $this->post(['op' => 'start', 'seed' => 's', 'difficulty' => 'normal'])[0]);
        }
        $this->assertSame([429, ['error' => 'rate']], $this->post(['op' => 'start', 'seed' => 's', 'difficulty' => 'normal']));
    }

    public function testAnHonestRunFilesAtExactlyTheScoreTheBrowserShowed(): void
    {
        $run = $this->recorded();
        $id = $this->playAll($run);
        [$status, $out] = $this->post(['op' => 'file', 'run' => $id, 'initials' => 'abc']);
        $this->assertSame(200, $status, json_encode($out));
        $this->assertSame([$run['score'], $run['roundsWon'], 1, $run['difficulty']], [$out['score'], $out['roundsWon'], $out['rank'], $out['difficulty']]);
        $top = board_top($run['difficulty'], 1)[0];
        $this->assertSame(['ABC', $run['score'], $run['roundsWon'], $run['seed']], [$top['initials'], $top['score'], $top['rounds'], $top['seed']]);
    }

    public function testAForgedScoreFieldIsIgnored(): void
    {
        $run = $this->recorded();
        $id = $this->playAll($run);
        [, $out] = $this->post(['op' => 'file', 'run' => $id, 'initials' => 'ABC', 'score' => 999999]);
        $this->assertSame($run['score'], $out['score']);
        $this->assertSame($run['score'], board_top($run['difficulty'], 1)[0]['score']);
    }

    public function testALyingClaimVoidsTheRun(): void
    {
        $run = $this->recorded();
        $id = $this->start($run);
        $r = $run['rounds'][0];
        $r['claim']['score'] += 500;
        [$status, $out] = $this->round($id, $r);
        $this->assertSame(422, $status);
        $this->assertSame(['void', 'mismatch'], [$out['error'], $out['why']]);
        $this->assertSame($run['rounds'][0]['claim'], $out['server']);
        $this->assertSame([409, ['error' => 'void']], $this->round($id, $run['rounds'][0]), 'nothing later can match');
        $this->assertSame(409, $this->post(['op' => 'file', 'run' => $id, 'initials' => 'ABC'])[0]);
        $this->assertSame([], board_top($run['difficulty'], 5));
    }

    public function testATamperedRoundVoidsTheRun(): void
    {
        $run = $this->recorded();
        $id = $this->start($run);
        $r = $run['rounds'][0];
        $r['shots'][0]['a'] = 200;
        $this->assertSame([422, ['error' => 'void', 'why' => 'out of range']], $this->round($id, $r));
    }

    public function testARoundSentTwiceIsPlayedOnce(): void
    {
        $run = $this->recorded();
        $id = $this->start($run);
        $first = $this->round($id, $run['rounds'][0]);
        $this->assertSame($first, $this->round($id, $run['rounds'][0]));
        $row = tankity_db()->query('SELECT round FROM solo_runs')->fetchColumn();
        $this->assertSame(1, (int) $row);
    }

    public function testARoundOutOfOrderIsRefused(): void
    {
        $run = $this->recorded();
        if (count($run['rounds']) < 2) {
            $this->markTestSkipped('the short run has one round');
        }
        $id = $this->start($run);
        $this->assertSame([409, ['error' => 'out of order', 'round' => 0]], $this->round($id, $run['rounds'][1]));
    }

    public function testARunFilesOnceAndOnlyWhenOver(): void
    {
        $run = $this->recorded();
        $id = $this->start($run);
        $this->assertSame([409, ['error' => 'the run is not over']], $this->post(['op' => 'file', 'run' => $id, 'initials' => 'ABC']));
        foreach ($run['rounds'] as $r) {
            $this->round($id, $r);
        }
        $this->assertSame(200, $this->post(['op' => 'file', 'run' => $id, 'initials' => 'ABC'])[0]);
        $this->assertSame(400, $this->post(['op' => 'file', 'run' => $id, 'initials' => 'ABC'])[0]);
        $this->assertCount(1, board_top($run['difficulty'], 5));
    }

    public function testARunGoneQuietExpires(): void
    {
        $run = $this->recorded();
        $id = $this->start($run);
        $this->now += SOLO_RUN_IDLE + 1;
        $this->assertSame([410, ['error' => 'expired']], $this->round($id, $run['rounds'][0]));
        $this->assertSame(1, solo_runs_expire($this->now));
        $this->assertSame([404, ['error' => 'no such run']], $this->round($id, $run['rounds'][0]));
    }

    public function testRoundsAreRateLimited(): void
    {
        $run = $this->recorded();
        $id = $this->start($run);
        $guard = $this->guard();
        for ($i = 0; $i < SOLO_ROUNDS_PER_HOUR; $i++) {
            $guard->rateTake('round', SOLO_ROUNDS_PER_HOUR);
        }
        $this->assertSame([429, ['error' => 'rate']], $this->round($id, $run['rounds'][0]));
    }

    public function testBadInitialsAreRefused(): void
    {
        $run = $this->recorded();
        $id = $this->playAll($run);
        foreach (['AB', 'A1C', 'ass', ''] as $bad) {
            $this->assertSame(422, $this->post(['op' => 'file', 'run' => $id, 'initials' => $bad])[0], $bad);
        }
    }
}
```

Run (in `websites/www.cs`): `vendor/bin/phpunit --testsuite tankity --filter ScoresApiTest`
Expected: FAIL, `scores-api.php` missing.

- [ ] **Step 2: The runs table, and the handler**

`server/db.php`, step 3 in `tankity_schema_steps()`:

```php
        3 => [
            'CREATE TABLE solo_runs (id TEXT PRIMARY KEY, difficulty TEXT NOT NULL, seed TEXT NOT NULL, created INTEGER NOT NULL,
                touched INTEGER NOT NULL, round INTEGER NOT NULL, status TEXT NOT NULL, state BLOB NOT NULL, reply TEXT NOT NULL)',
            'CREATE INDEX solo_runs_touched ON solo_runs (touched)',
        ],
```

(its comment's last sentence becomes `… Step 2 is the boards, step 3 the solo runs.`)

```php
<?php
// games/tankity/server/scores-api.php
// Operation Tankity's score endpoint. GET answers a difficulty's board and a
// CSRF token. POST {op: start} opens a solo run on a single-use guard token;
// {op: round} has the server play the round from the run's stored state and
// keep the result; {op: file} files the score the server already holds. The
// client never sends a score that counts. Loaded by scores.php; serves nothing.
declare(strict_types=1);
if (count(get_included_files()) === 1) {
    http_response_code(404);
    exit;
}

use Kit\ScoreGuard;

const SCORES_MAX_BODY = 262144;
const SOLO_RUN_IDLE = 7200; // a run expires two hours after its last accepted round
const SOLO_RUN_MAX_AGE = 86400; // and a day after it started, at the latest
const SOLO_RUN_FILED_KEEP = 3600; // a filed run's row answers a repeated request this long
const SOLO_MAX_LIVE_RUNS = 1000;
const SOLO_ROUNDS_PER_HOUR = 240; // per client; an honest round takes far longer than 15 s

function solo_run_row(PDO $db, string $id): ?array
{
    $q = $db->prepare('SELECT * FROM solo_runs WHERE id = ?');
    $q->execute([$id]);
    $row = $q->fetch(PDO::FETCH_ASSOC);
    return is_array($row) ? $row : null;
}

function solo_run_expired(array $row, int $now): bool
{
    return $row['status'] !== 'filed' && ($now - (int) $row['touched'] > SOLO_RUN_IDLE || $now - (int) $row['created'] > SOLO_RUN_MAX_AGE);
}

/* Deletes expired runs and filed runs past their keep, at most $limit. */
function solo_runs_expire(int $now, int $limit = 100): int
{
    return tankity_tx(tankity_db(), function (PDO $db) use ($now, $limit): int {
        $q = $db->prepare("DELETE FROM solo_runs WHERE id IN (SELECT id FROM solo_runs WHERE
            (status <> 'filed' AND (touched < ? OR created < ?)) OR (status = 'filed' AND touched < ?) LIMIT ?)");
        $q->execute([$now - SOLO_RUN_IDLE, $now - SOLO_RUN_MAX_AGE, $now - SOLO_RUN_FILED_KEEP, $limit]);
        return $q->rowCount();
    });
}

function solo_run_void(string $id, int $now): void
{
    tankity_tx(tankity_db(), fn(PDO $db) => $db->prepare("UPDATE solo_runs SET status = 'void', touched = ? WHERE id = ?")->execute([$now, $id]));
}

function solo_is_claim(mixed $c): bool
{
    return is_array($c) && in_array($c['end'] ?? null, ['roundWon', 'tankLost', 'matchLost'], true)
        && is_int($c['score'] ?? null) && is_int($c['cash'] ?? null) && is_int($c['lives'] ?? null) && is_int($c['roundsWon'] ?? null);
}

function tankity_scores_start(array $in, ScoreGuard $guard, int $now): array
{
    $seed = $in['seed'] ?? null;
    $level = board_level($in['difficulty'] ?? null);
    if (!is_string($seed) || !preg_match('/^[\x20-\x7e]{1,64}$/', $seed) || $level === null) {
        return [422, ['error' => 'a printable seed and a difficulty (easy, normal, hard)']];
    }
    $live = (int) tankity_db()->query("SELECT COUNT(*) FROM solo_runs WHERE status IN ('live', 'over')")->fetchColumn();
    if ($live >= SOLO_MAX_LIVE_RUNS) {
        return [503, ['error' => 'busy']];
    }
    $id = $guard->startRun();
    if ($id === null) {
        return [429, ['error' => 'rate']];
    }
    $q = tankity_db()->prepare("INSERT INTO solo_runs (id, difficulty, seed, created, touched, round, status, state, reply) VALUES (?, ?, ?, ?, ?, 0, 'live', ?, '')");
    $q->bindValue(1, $id);
    $q->bindValue(2, $level);
    $q->bindValue(3, $seed);
    $q->bindValue(4, $now, PDO::PARAM_INT);
    $q->bindValue(5, $now, PDO::PARAM_INT);
    $q->bindValue(6, serialize(solo_deal($seed, $level)), PDO::PARAM_LOB);
    $q->execute();
    return [200, ['ok' => true, 'run' => $id]];
}

/* One round: the server plays it from the stored state (outside the write
   lock: it can take up to SOLO_ROUND_CPU), then stores the result unless
   another request stored this round first. The client's claim must be the
   server's own, or the run is void. */
function tankity_scores_round(array $in, ScoreGuard $guard, int $now): array
{
    $id = (string) ($in['run'] ?? '');
    $n = $in['n'] ?? null;
    if (!is_int($n) || $n < 1 || !solo_is_claim($in['claim'] ?? null)) {
        return [400, ['error' => 'invalid json']];
    }
    if (!$guard->rateTake('round', SOLO_ROUNDS_PER_HOUR)) {
        return [429, ['error' => 'rate']];
    }
    $row = solo_run_row(tankity_db(), $id);
    if ($row === null) {
        return [404, ['error' => 'no such run']];
    }
    if (solo_run_expired($row, $now)) {
        return [410, ['error' => 'expired']];
    }
    if ($row['status'] === 'void') {
        return [409, ['error' => 'void']];
    }
    if ((int) $row['round'] === $n && $row['reply'] !== '') {
        return [200, json_decode($row['reply'], true)];
    }
    if ($row['status'] !== 'live' || (int) $row['round'] !== $n - 1) {
        return [409, ['error' => 'out of order', 'round' => (int) $row['round']]];
    }
    $state = unserialize((string) $row['state'], ['allowed_classes' => false]);
    $got = solo_round(is_array($state) ? $state : [], $in['buys'] ?? null, $in['shots'] ?? null);
    if (!$got['ok']) {
        solo_run_void($id, $now);
        return [422, ['error' => 'void', 'why' => $got['error']]];
    }
    if ($got['claim'] !== $in['claim']) {
        solo_run_void($id, $now);
        return [422, ['error' => 'void', 'why' => 'mismatch', 'server' => $got['claim']]];
    }
    $reply = ['ok' => true, 'n' => $n] + $got['claim'];
    return tankity_tx(tankity_db(), function (PDO $db) use ($id, $n, $got, $reply, $now): array {
        $row = solo_run_row($db, $id);
        if ($row === null || $row['status'] !== 'live' || (int) $row['round'] !== $n - 1) {
            // Another request stored this round (or the run moved on) while this one played it.
            return $row !== null && (int) $row['round'] === $n && $row['reply'] !== ''
                ? [200, json_decode($row['reply'], true)] : [409, ['error' => 'out of order', 'round' => (int) ($row['round'] ?? 0)]];
        }
        $q = $db->prepare('UPDATE solo_runs SET state = ?, round = ?, status = ?, touched = ?, reply = ? WHERE id = ?');
        $q->bindValue(1, serialize($got['s']), PDO::PARAM_LOB);
        $q->bindValue(2, $n, PDO::PARAM_INT);
        $q->bindValue(3, $got['claim']['end'] === 'matchLost' ? 'over' : 'live');
        $q->bindValue(4, $now, PDO::PARAM_INT);
        $q->bindValue(5, (string) json_encode($reply, JSON_UNESCAPED_SLASHES));
        $q->bindValue(6, $id);
        $q->execute();
        return [200, $reply];
    });
}

function tankity_scores_file(array $in, ScoreGuard $guard, int $now): array
{
    $id = (string) ($in['run'] ?? '');
    $initials = tankity_initials($guard, $in['initials'] ?? null);
    if ($initials === null) {
        return [422, ['error' => 'initials must be 3 letters, kept clean']];
    }
    $row = solo_run_row(tankity_db(), $id);
    if ($row === null) {
        return [404, ['error' => 'no such run']];
    }
    if (solo_run_expired($row, $now)) {
        return [410, ['error' => 'expired']];
    }
    if ($row['status'] === 'void') {
        return [409, ['error' => 'void']];
    }
    if ($row['status'] === 'live') {
        return [409, ['error' => 'the run is not over']];
    }
    $problem = $guard->consumeRun($id);
    if ($problem === 'rate') {
        return [429, ['error' => 'rate']];
    }
    if ($problem !== null) {
        return [400, ['error' => $problem]];
    }
    return tankity_tx(tankity_db(), function (PDO $db) use ($id, $initials, $now): array {
        $row = solo_run_row($db, $id);
        if ($row === null || $row['status'] !== 'over') {
            return [409, ['error' => 'the run is not over']];
        }
        $s = unserialize((string) $row['state'], ['allowed_classes' => false]);
        $score = (int) $s['scores'][0];
        $won = (int) $s['roundsWon'];
        $rank = board_file(['difficulty' => $row['difficulty'], 'initials' => $initials, 'score' => $score, 'rounds' => $won, 'seed' => $row['seed']]);
        $db->prepare("UPDATE solo_runs SET status = 'filed', touched = ? WHERE id = ?")->execute([$now, $id]);
        return [200, ['ok' => true, 'score' => $score, 'roundsWon' => $won, 'rank' => $rank, 'difficulty' => $row['difficulty']]];
    });
}

function tankity_scores_handle(string $method, array $query, string $raw, ScoreGuard $guard, int $now): array
{
    if ($method === 'GET') {
        $level = board_level($query['difficulty'] ?? 'normal');
        if ($level === null) {
            return [422, ['error' => 'no such board']];
        }
        return [200, ['difficulty' => $level, 'scores' => board_top($level, BOARD_SHOW), 'keep' => BOARD_KEEP, 'csrf' => $guard->csrfToken()]];
    }
    if ($method !== 'POST') {
        return [405, ['error' => 'method not allowed']];
    }
    $type = (string) ($_SERVER['CONTENT_TYPE'] ?? $_SERVER['HTTP_CONTENT_TYPE'] ?? '');
    if (stripos($type, 'application/json') === false || !$guard->originAllowed() || !$guard->csrfOk()) {
        return [403, ['error' => 'forbidden']];
    }
    if (strlen($raw) > SCORES_MAX_BODY) {
        return [413, ['error' => 'too large']];
    }
    $in = json_decode($raw, true);
    if (!is_array($in)) {
        return [400, ['error' => 'invalid json']];
    }
    return match ($in['op'] ?? '') {
        'start' => tankity_scores_start($in, $guard, $now),
        'round' => tankity_scores_round($in, $guard, $now),
        'file' => tankity_scores_file($in, $guard, $now),
        default => [400, ['error' => 'invalid json']],
    };
}
```

A forged `score` field in a `file` request is never read: the score comes from the stored state.

`server/housekeep.php` `tankity_jobs()`: add `if (function_exists('solo_runs_expire')) { $jobs['solo'] = fn(int $now): int => solo_runs_expire($now); }` and name it in the comment (`…, expired solo runs where the score endpoint is loaded`).

Replace `scores.php`'s body after `require_once __DIR__ . '/config.php';` with:

```php
// The sim, the guard, the boards and housekeeping come with the room library; no room is served.
define('TANKITY_ROOMS_LIB', true);
require_once __DIR__ . '/rooms.php';
require_once __DIR__ . '/server/scores-api.php';

try {
    tankity_housekeep(time(), tankity_jobs());
    [$status, $payload] = tankity_scores_handle($_SERVER['REQUEST_METHOD'] ?? 'GET', $_GET,
        (string) file_get_contents('php://input'), tankity_guard(), time());
} catch (Throwable $e) {
    error_log('tankity scores.php: ' . $e->getMessage());
    [$status, $payload] = tankity_busy($e) ? [503, ['error' => 'busy']] : [500, ['error' => 'store unavailable']];
}
http_response_code($status);
header('Content-Type: application/json');
header('Cache-Control: no-store');
echo json_encode($payload, JSON_UNESCAPED_SLASHES);
```

(and its header comment: "Operation Tankity: the score endpoint. The work is server/scores-api.php; this answers the request."; the `json_out` function and the Task 19 body go).

- [ ] **Step 3: Run**

Run (in `websites/www.cs`): `vendor/bin/phpunit --testsuite tankity --exclude-group slow`
Expected: PASS, 15 `ScoresApiTest` cases (one may skip when the short recorded run has a single round); `DbTest` sees schema version 3.

- [ ] **Step 4: Commit**

```bash
git add games/tankity/server games/tankity/scores.php games/tankity/test/php/ScoresApiTest.php
git commit -F- <<'MSG'
Tankity scores: the guard first; the server plays each round and files what it holds

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb
MSG
```

### Task 32: Sending a run's rounds and filing it, with the offline queue

**Files:**
- Create: `games/tankity/src/solo-file.ts`
- Create: `games/tankity/test/solo-file.test.mjs`
- Modify: `games/tankity/tsconfig.json`

**Interfaces:**
- Consumes: kit `prefs.ts` (`pref`, `json`), `StorageLike`; Task 25 `isRoundLog`, `SoloRoundLog`; the difficulty PR's `isDifficulty`.
- Produces: `interface PendingRun { id: string; seed: string; difficulty: Difficulty; run: string | null; rounds: SoloRoundLog[]; initials: string | null; tries: number }` (`rounds` holds only those not yet taken; `initials` is set when the match ends); `type FileOutcome = { id: string; kind: 'filed'; score: number; rank: number | null; difficulty: Difficulty } | { id: string; kind: 'refused'; why: string } | { id: string; kind: 'waiting' }`; `interface FilerEnv { fetch(url: string, init?: FetchLike): Promise<{ ok: boolean; status: number; json(): Promise<unknown> }>; storage: StorageLike | null }`; `PENDING_KEY = 'tankity-pending-runs'`, `PENDING_MAX = 3`, `MAX_TRIES = 5`; `createFiler(env: FilerEnv): { begin(id: string, seed: string, difficulty: Difficulty): void; round(id: string, log: SoloRoundLog): void; finish(id: string, initials: string): void; flush(): Promise<FileOutcome[]>; waiting(): number }`. `flush` answers an outcome for every run it reached a verdict on (a run still being played whose rounds all went through answers nothing).

- [ ] **Step 1: Failing test**

```js
// games/tankity/test/solo-file.test.mjs
// Sending a solo run (src/solo-file.ts): GET for the CSRF token, start, every
// round in order, then file; offline runs wait in storage and go on later; a
// voided or expired run is dropped.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { memoryStorage } from '../../_kit/test/record.ts';
import { createFiler, PENDING_KEY, MAX_TRIES } from '../src/solo-file.ts';

const claim = end => ({ end, score: 100, cash: 700, lives: end === 'matchLost' ? 0 : 3, roundsWon: 0 });
const round = (n, end = 'tankLost') => ({ n, buys: [], shots: [{ w: 'shell', a: 45, p: 50, x: 100 }], claim: claim(end) });
const reply = (status, body) => ({ ok: status >= 200 && status < 300, status, json: async () => body });

/** A score server; `answer(op, body)` may override a reply. */
function server(answer = () => null) {
  const calls = [];
  const fetch = async (url, init = {}) => {
    const body = init.body ? JSON.parse(init.body) : null;
    calls.push({ method: init.method || 'GET', op: body && body.op, n: body && body.n, csrf: init.headers && init.headers['X-Tankity-Csrf'] });
    if (!init.method) return reply(200, { scores: [], csrf: 'tok' });
    const over = answer(body.op, body);
    if (over) return reply(over[0], over[1]);
    if (body.op === 'start') return reply(200, { ok: true, run: 'r'.repeat(32) });
    if (body.op === 'round') return reply(200, { ok: true, n: body.n, ...body.claim });
    return reply(200, { ok: true, score: 100, roundsWon: 0, rank: 7, difficulty: 'hard' });
  };
  return { fetch, calls };
}

function played(f, id = 'a') {
  f.begin(id, 'seed-1', 'hard');
  f.round(id, round(1));
  f.round(id, round(2, 'matchLost'));
  f.finish(id, 'ABC');
}

test('a run goes start, rounds in order, file, with the CSRF header', async () => {
  const s = server();
  const f = createFiler({ fetch: s.fetch, storage: memoryStorage() });
  played(f);
  assert.deepEqual(await f.flush(), [{ id: 'a', kind: 'filed', score: 100, rank: 7, difficulty: 'hard' }]);
  assert.deepEqual(s.calls.map(c => [c.method, c.op, c.n]), [['GET', null, null], ['POST', 'start', null], ['POST', 'round', 1], ['POST', 'round', 2], ['POST', 'file', null]]);
  assert.ok(s.calls.slice(1).every(c => c.csrf === 'tok'));
  assert.equal(f.waiting(), 0);
});

test('rounds go as they end; a run still being played answers nothing', async () => {
  const s = server();
  const f = createFiler({ fetch: s.fetch, storage: memoryStorage() });
  f.begin('p', 'seed-1', 'normal');
  f.round('p', round(1));
  assert.deepEqual(await f.flush(), []);
  assert.deepEqual(s.calls.filter(c => c.op).map(c => c.op), ['start', 'round']);
  f.round('p', round(2));
  await f.flush();
  assert.deepEqual(s.calls.filter(c => c.op).map(c => c.op), ['start', 'round', 'round'], 'the run is started once');
});

test('offline: the run waits in storage and goes on with the next try', async () => {
  const storage = memoryStorage();
  const down = createFiler({ fetch: async () => { throw new Error('offline'); }, storage });
  played(down, 'b');
  assert.deepEqual(await down.flush(), [{ id: 'b', kind: 'waiting' }]);
  assert.match(storage.data.get(PENDING_KEY), /"id":"b"/);
  const later = createFiler({ fetch: server().fetch, storage });
  assert.equal((await later.flush())[0].kind, 'filed');
  assert.equal(later.waiting(), 0);
});

test('a void run is dropped at once, mid-game too', async () => {
  const s = server(op => op === 'round' ? [422, { error: 'void', why: 'mismatch' }] : null);
  const f = createFiler({ fetch: s.fetch, storage: memoryStorage() });
  f.begin('c', 'seed-1', 'normal');
  f.round('c', round(1));
  assert.deepEqual(await f.flush(), [{ id: 'c', kind: 'refused', why: 'the server played that round differently' }]);
  assert.equal(f.waiting(), 0);
  f.round('c', round(2));
  assert.equal(f.waiting(), 0, 'rounds of a dropped run are not kept');
});

test('an expired run is dropped', async () => {
  const s = server(op => op === 'round' ? [410, { error: 'expired' }] : null);
  const f = createFiler({ fetch: s.fetch, storage: memoryStorage() });
  played(f, 'd');
  assert.deepEqual(await f.flush(), [{ id: 'd', kind: 'refused', why: 'it waited too long to reach the score server' }]);
});

test('a round the server already has is skipped, not resent', async () => {
  const s = server((op, body) => op === 'round' && body.n === 1 ? [409, { error: 'out of order', round: 1 }] : null);
  const f = createFiler({ fetch: s.fetch, storage: memoryStorage() });
  played(f, 'e');
  assert.equal((await f.flush())[0].kind, 'filed');
  assert.deepEqual(s.calls.filter(c => c.op === 'round').map(c => c.n), [1, 2]);
});

test('a run the server keeps failing is dropped after MAX_TRIES tries', async () => {
  const s = server(op => op === 'file' ? [500, { error: 'store unavailable' }] : null);
  const f = createFiler({ fetch: s.fetch, storage: memoryStorage() });
  played(f, 'g');
  for (let i = 1; i < MAX_TRIES; i++) assert.equal((await f.flush())[0].kind, 'waiting');
  assert.equal((await f.flush())[0].kind, 'refused');
  assert.equal(f.waiting(), 0);
});

test('two flushes at once send each round once', async () => {
  const s = server();
  const f = createFiler({ fetch: s.fetch, storage: memoryStorage() });
  played(f, 'h');
  await Promise.all([f.flush(), f.flush()]);
  assert.equal(s.calls.filter(c => c.op === 'round').length, 2);
  assert.equal(s.calls.filter(c => c.op === 'file').length, 1);
});

test('blocked storage still files the run in hand', async () => {
  const f = createFiler({ fetch: server().fetch, storage: null });
  played(f, 'i');
  assert.equal((await f.flush())[0].kind, 'filed');
});
```

Run (in `games/tankity`): `node --test test/solo-file.test.mjs`
Expected: FAIL, module not found.

- [ ] **Step 2: The filer**

```ts
// games/tankity/src/solo-file.ts
/* Operation Tankity: sending a solo run to the score server.
 *
 * A run is started on the server when it is dealt, each round goes as it ends
 * (the server plays it and keeps the result), and the run files when the match
 * is over. Everything waits in this browser's storage until scores.php takes
 * it, in order: offline or busy, it waits for the next try; voided or expired,
 * it is dropped. Fetch and storage arrive as arguments. */
import type { StorageLike } from '../../_kit/ports.ts';
import { json, pref } from '../../_kit/prefs.ts';
import { isDifficulty } from './difficulty.ts';
import type { Difficulty } from './sim.ts';
import { isRoundLog } from './solo-log.ts';
import type { SoloRoundLog } from './solo-log.ts';

export interface PendingRun {
  id: string; seed: string; difficulty: Difficulty; run: string | null;
  rounds: SoloRoundLog[]; initials: string | null; tries: number;
}
export type FileOutcome =
  | { id: string; kind: 'filed'; score: number; rank: number | null; difficulty: Difficulty }
  | { id: string; kind: 'refused'; why: string }
  | { id: string; kind: 'waiting' };
interface FetchLike { method?: string; headers?: Record<string, string>; body?: string; credentials?: 'same-origin' }
export interface FilerEnv {
  fetch(url: string, init?: FetchLike): Promise<{ ok: boolean; status: number; json(): Promise<unknown> }>;
  storage: StorageLike | null;
}

export const PENDING_KEY = 'tankity-pending-runs';
export const PENDING_MAX = 3;
export const MAX_TRIES = 5;
const URL = 'scores.php';

function isPendingRuns(v: unknown): v is PendingRun[] {
  return Array.isArray(v) && v.every(r => r && typeof r === 'object' && typeof r.id === 'string' && typeof r.seed === 'string'
    && isDifficulty(r.difficulty) && (r.run === null || typeof r.run === 'string') && Array.isArray(r.rounds) && r.rounds.every(isRoundLog)
    && (r.initials === null || typeof r.initials === 'string') && typeof r.tries === 'number');
}

/** Why the server dropped a run, in the end card's words. */
function why(status: number, data: Record<string, unknown>): string | null {
  if (status === 422 && data['error'] === 'void') return 'the server played that round differently';
  if (status === 409 && data['error'] === 'void') return 'the server played a round differently';
  if (status === 410) return 'it waited too long to reach the score server';
  if (status === 404) return 'the score server no longer has it';
  if (status === 400 || status === 422) return String(data['error'] || 'refused');
  return null;
}

export function createFiler(env: FilerEnv) {
  const stored = pref<PendingRun[]>(PENDING_KEY, [], json(isPendingRuns), env.storage);
  // Runs in hand stay here too, so blocked storage still sends this session's run.
  let held: PendingRun[] = stored.get();
  let busy: Promise<FileOutcome[]> | null = null;
  const save = (runs: PendingRun[]): void => { held = runs; stored.set(runs); };
  const update = (id: string, fn: (r: PendingRun) => PendingRun): void => save(held.map(r => (r.id === id ? fn(r) : r)));

  function begin(id: string, seed: string, difficulty: Difficulty): void {
    save([...held.filter(r => r.id !== id), { id, seed, difficulty, run: null, rounds: [], initials: null, tries: 0 }].slice(-PENDING_MAX));
  }
  function round(id: string, log: SoloRoundLog): void {
    update(id, r => ({ ...r, rounds: [...r.rounds, log] }));
  }
  function finish(id: string, initials: string): void {
    update(id, r => ({ ...r, initials }));
  }

  async function post(csrf: string, body: unknown): Promise<{ status: number; data: Record<string, unknown> }> {
    const res = await env.fetch(URL, {
      method: 'POST', credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', 'X-Tankity-Csrf': csrf }, body: JSON.stringify(body),
    });
    return { status: res.status, data: ((await res.json().catch(() => null)) || {}) as Record<string, unknown> };
  }

  /* Takes one run as far as the server allows: null when it should wait (or,
     still being played, has nothing to report), else its verdict. */
  async function sendOne(id: string, csrf: string): Promise<FileOutcome | null> {
    let r = held.find(x => x.id === id);
    if (!r) return null;
    if (!r.run) {
      const st = await post(csrf, { op: 'start', seed: r.seed, difficulty: r.difficulty });
      if (st.status !== 200 || typeof st.data['run'] !== 'string') return failed(id, st.status, st.data);
      update(id, x => ({ ...x, run: st.data['run'] as string }));
      r = held.find(x => x.id === id)!;
    }
    while (r.rounds.length) {
      const next = r.rounds[0]!;
      const sent = await post(csrf, { op: 'round', run: r.run, ...next });
      const skip = sent.status === 409 && sent.data['error'] === 'out of order' && Number(sent.data['round']) >= next.n;
      if (sent.status !== 200 && !skip) return failed(id, sent.status, sent.data);
      update(id, x => ({ ...x, rounds: x.rounds.slice(1), tries: 0 }));
      r = held.find(x => x.id === id)!;
    }
    if (!r.initials) return null;
    const filed = await post(csrf, { op: 'file', run: r.run, initials: r.initials });
    if (filed.status !== 200 || !filed.data['ok']) return failed(id, filed.status, filed.data);
    save(held.filter(x => x.id !== id));
    return {
      id, kind: 'filed', score: Number(filed.data['score']),
      rank: typeof filed.data['rank'] === 'number' ? filed.data['rank'] : null,
      difficulty: isDifficulty(filed.data['difficulty']) ? filed.data['difficulty'] : r.difficulty,
    };
  }

  /* A refusal drops the run; anything else waits, and a run the server keeps
     failing is dropped after MAX_TRIES tries. */
  function failed(id: string, status: number, data: Record<string, unknown>): FileOutcome {
    const refused = why(status, data);
    const r = held.find(x => x.id === id);
    if (refused || !r || r.tries + 1 >= MAX_TRIES) {
      save(held.filter(x => x.id !== id));
      return { id, kind: 'refused', why: refused || 'the score server kept failing' };
    }
    update(id, x => ({ ...x, tries: x.tries + 1 }));
    return { id, kind: 'waiting' };
  }

  async function flushNow(): Promise<FileOutcome[]> {
    if (!held.length) return [];
    let csrf = '';
    try {
      const res = await env.fetch(URL, { credentials: 'same-origin' });
      const data = (await res.json().catch(() => null)) as { csrf?: unknown } | null;
      csrf = res.ok && data && typeof data.csrf === 'string' ? data.csrf : '';
    } catch (_) { /* offline: everything waits */ }
    const out: FileOutcome[] = [];
    for (const { id, initials } of [...held]) {
      let o: FileOutcome | null = initials ? { id, kind: 'waiting' } : null;
      if (csrf) {
        try { o = await sendOne(id, csrf); } catch (_) { o = held.some(r => r.id === id && r.initials) ? { id, kind: 'waiting' } : null; }
      }
      if (o) out.push(o);
    }
    return out;
  }

  /** Sends everything waiting; concurrent calls share one attempt. */
  function flush(): Promise<FileOutcome[]> {
    if (!busy) busy = flushNow().finally(() => { busy = null; });
    return busy;
  }

  return { begin, round, finish, flush, waiting: () => held.length };
}
```

A round added to a run the filer already dropped is ignored (`update` finds no run), which is what `a void run is dropped at once, mid-game too` checks.

Add `"src/solo-file.ts"` to `tsconfig.json` `files`.

- [ ] **Step 3: Run**

Run (in `games/tankity`): `node --test test/solo-file.test.mjs && node ../_kit/build/build.mjs tankity`
Expected: PASS (9).

- [ ] **Step 4: Commit**

```bash
git add games/tankity/src/solo-file.ts games/tankity/test/solo-file.test.mjs games/tankity/tsconfig.json
git commit -F- <<'MSG'
Tankity: send a run's rounds as they end and file it, with an offline queue

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb
MSG
```

### Task 33: The page sends each round as it ends, and files the run at game over

**Files:**
- Modify: `games/tankity/src/scores.ts` (the filer instead of the trusting POST and local rows; `soloBegin`, `soloRound`, `soloFinish`, `flushPending`)
- Modify: `games/tankity/src/match.ts` (`MatchDeps`, `newMatch`, `settle`, `endMatch`, `checkOneUps`)
- Modify: `games/tankity/src/main.ts` (wiring, the 1-up loop moves into `checkOneUps`, boot flush, `online` listener)
- Delete: `games/tankity/src/score-rows.ts`
- Modify: `games/tankity/test/prefs-legacy.test.mjs` (drop the `tankity-local` checks and the `score-rows` import)

**Interfaces:**
- Consumes: Task 32's `createFiler`; Task 25's `closeRound`, `RoundClaim`; Task 14's `filedLine(rank, score, difficulty)`.
- Produces: `createScores(...)` returns `{ SCORES, renderScoresOverlay, loadScores, soloBegin, soloRound, soloFinish, flushPending }` with `soloBegin(id: string, seed: string, difficulty: Difficulty): void`, `soloRound(id: string, log: SoloRoundLog): void`, `soloFinish(id: string, initials: string, done: (line: string) => void): Promise<void>`, `flushPending(): Promise<void>`. `MatchDeps` loses `fileSolo` and gains `soloBegin`, `soloRound`, `soloFinish` (those three signatures). `GameState.runId: string | null` (this solo run's id in the filer). The match API gains `checkOneUps(): void` (1-ups for a solo match: life or +500, with their words), which the frame calls and `settle()` calls before it closes a round.

- [ ] **Step 1: scores.ts on the filer**

In `src/scores.ts`: drop the `score-rows` import, `localRows`, `saveLocal`, `SoloRun` and `fileSolo`; import `createFiler` and `type FileOutcome` from `./solo-file.ts` and `type SoloRoundLog` from `./solo-log.ts`. After `const { $, keyHint, say, toggleOverlay, initials, difficulty } = deps;` add:

```ts
  const filer = createFiler({ fetch: (url, init) => fetch(url, init), storage: browserStorage() });
  /** The end card's line for a run that is still waiting, by id, so a later flush can update it. */
  const waitingLines = new Map<string, (line: string) => void>();
  function lineFor(o: FileOutcome): string {
    if (o.kind === 'filed') return filedLine(o.rank, o.score, o.difficulty);
    if (o.kind === 'refused') return `Not filed: ${o.why}.`;
    return 'Saved in this browser; it files itself when the score server answers (within two hours).';
  }
  /* Sends everything waiting; called at boot, when the browser comes back
     online, after each round and at game over. */
  async function flushPending(): Promise<void> {
    const outcomes = await filer.flush();
    for (const o of outcomes) {
      const done = waitingLines.get(o.id);
      if (done) done(lineFor(o));
      else if (o.kind === 'refused') say(`This run can no longer be filed: ${o.why}.`, 'info');
      if (o.kind !== 'waiting') waitingLines.delete(o.id);
      if (o.kind === 'filed' && !done) say(`Run filed: ${lineFor(o)}.`, 'good');
    }
    if (outcomes.some(o => o.kind === 'filed')) void loadScores();
  }
  /* A dealt run: the server opens it now, or when it is next reachable. */
  function soloBegin(id: string, seed: string, level: Difficulty): void {
    filer.begin(id, seed, level);
    void flushPending();
  }
  /* A finished round: the server plays it from the run's state. */
  function soloRound(id: string, log: SoloRoundLog): void {
    filer.round(id, log);
    void flushPending();
  }
  /* Game over: the run files under these initials. `done` gets the end card's
     line now and again if it files later. */
  async function soloFinish(id: string, who: string, done: (line: string) => void): Promise<void> {
    filer.finish(id, who);
    waitingLines.set(id, done);
    await flushPending();
  }
```

In `loadScores()`'s `catch` branch replace the local-rows fallback with `SCORES.rows = []; SCORES.note = 'The score server is out of reach right now.';`. Return `{ SCORES, renderScoresOverlay, loadScores, soloBegin, soloRound, soloFinish, flushPending }`. Delete `src/score-rows.ts`; in `test/prefs-legacy.test.mjs` remove the `isScoreRows` import, the `ROWS` constant, the `tankity-local` seed entry and every check naming `tankity-local` or "score rows".

- [ ] **Step 2: The match sends its rounds**

`src/game-types.ts`: `GameState` gains `runId: string | null; // this solo run in the filer; null when it is not sent`.

`src/match.ts`:

1. `MatchDeps`: replace `fileSolo(run: { initials: string; score: number; banked: number; seed: string; difficulty: Difficulty }, done: (line: string) => void): void;` with

```ts
  soloBegin(id: string, seed: string, difficulty: Difficulty): void;
  soloRound(id: string, log: SoloRoundLog): void;
  soloFinish(id: string, initials: string, done: (line: string) => void): void;
```

(import `closeRound` and `type SoloRoundLog`, `type RoundClaim` from `./solo-log.ts`), and update the destructuring.

2. In `newMatch()`, after Task 25's `G.rec = …` lines:

```ts
    G.runId = G.rec ? `${G.seed}:${Date.now()}` : null;
    if (G.runId) soloBegin(G.runId, G.seed, G.difficulty ?? 'normal');
```

and in `startDemo()` add `G.runId = null;` beside `G.rec = null;`.

3. Move the 1-up loop Task 22 put in `main.ts` into `match.ts`:

```ts
  /* Solo 1-ups (a life per 3000 points, +500 past five lives), with their words. */
  function checkOneUps(): void {
    for (const up of soloOneUps(G)) {
      if (up === 'life') {
        sfx.play('win');
        say(`1-UP! Extra life! (${G.lives}/${TUNE.maxLives} lives)`, 'good');
        talk('tank', 'Another life! I am basically immortal!', true);
      } else say('Max lives already, so take +500 points instead!', 'good');
    }
  }
  /* A round is over: it goes to the server with how this page saw it end
     (the server plays it and must reach the same). */
  function sendRound(end: RoundClaim['end']): void {
    if (!G.rec || !G.runId) return;
    if (end !== 'matchLost') checkOneUps();
    soloRound(G.runId, closeRound(G.rec, G.round, { end, score: G.score, cash: G.cash, lives: G.lives, roundsWon: G.roundsWon }));
  }
```

and return `checkOneUps` from `createMatch`. In `src/main.ts`'s frame replace the `if (!net.on) { for (const up of soloOneUps(G)) { … } }` block with `if (!net.on && !G.demo) checkOneUps();` (destructure it from `createMatch`; drop the now-unused `soloOneUps` import).

4. In `settle()` (Task 22's), right after `const end = soloSettle(G);` / `if (end.kind === 'next') { announceTurn(); return; }` add `sendRound(end.kind);`.

5. In `endMatch()` the filing call becomes:

```ts
      if (G.runId) {
        soloFinish(G.runId, initials(), line => {
          END.filed = line;
          renderEndVeil();
        });
      } else END.filed = 'This run cannot be filed (see the radio log).';
```

(the `END.filed = 'Filing…';` line before it stays).

`src/main.ts`: `const { SCORES, renderScoresOverlay, loadScores, soloBegin, soloRound, soloFinish, flushPending } = createScores({ … });`; in the `createMatch` call replace `fileSolo: (run, done) => { void fileSolo(run, done); },` with `soloBegin, soloRound, soloFinish: (id, who, done) => { void soloFinish(id, who, done); },`; `G` init adds `runId: null,`; in `init()` after `loadScores();` add:

```ts
  // Runs that could not reach the server go on when it is back.
  void flushPending();
  window.addEventListener('online', () => { void flushPending(); });
```

- [ ] **Step 3: Run**

Run (in `games/tankity`): `node ../_kit/build/build.mjs tankity && node --test 'test/*.test.mjs'`
Expected: PASS. (The smoke test's `fetch` stub answers GET without `csrf`, so the run waits and the end card reads "Saved in this browser…"; its `end-files-itself` check from Task 19 accepts that once you add `|Saved` to its regex.)

- [ ] **Step 4: Commit**

```bash
git add -A games/tankity/src games/tankity/test games/tankity/dist
git commit -F- <<'MSG'
Tankity solo: each round goes to the server as it ends; the run files at game over

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb
MSG
```

### Task 34: Rooms on the guard: uppercase initials, allowed origins, a rate on rooms

**Files:**
- Modify: `games/tankity/server/rules.php` (`room_valid_initials`)
- Modify: `games/tankity/rooms.php` (`room_origin_ok`; `create`/`join` rate)
- Create: `games/tankity/test/php/RoomGuardTest.php`

**Interfaces:**
- Consumes: Task 10's `tankity_guard()` (a `Kit\ScoreGuard`: `originAllowed()`, and Plan C Task 4's `rateTake($kind, $perHour)`) and `tankity_initials()`.
- Produces: `room_valid_initials($raw): ?string` returns uppercase; `ROOM_JOINS_PER_HOUR` setting (`TANKITY_ROOM_JOINS_PER_HOUR` / `room_joins_per_hour`, default 300); 429 `'too many rooms from here; try again later'`.

- [ ] **Step 1: Failing test**

```php
<?php
// games/tankity/test/php/RoomGuardTest.php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

/* Rooms use the score guard's rules: initials typed in either case are stored
   uppercase, and only allowed origins may post. */
final class RoomGuardTest extends TestCase
{
    public static function setUpBeforeClass(): void
    {
        require_once __DIR__ . '/rooms-lib.php';
    }

    protected function setUp(): void
    {
        $_SERVER = ['HTTP_HOST' => 'localhost', 'REMOTE_ADDR' => '198.51.100.7'];
    }

    public function testInitialsAreStoredUppercase(): void
    {
        $this->assertSame('ABC', room_valid_initials('abc'));
        $this->assertSame('WGR', room_valid_initials(' wGr '));
    }

    public function testBadInitialsAreRefused(): void
    {
        foreach (['ab', 'abcd', 'a1c', 'ass', 'AsS', null, 7] as $bad) {
            $this->assertNull(room_valid_initials($bad), var_export($bad, true));
        }
    }

    public function testOriginsFollowTheAllowList(): void
    {
        $this->assertTrue(room_origin_ok(), 'no Origin: the seat and room tokens gate it');
        $_SERVER['HTTP_ORIGIN'] = 'http://localhost';
        $this->assertTrue(room_origin_ok());
        $_SERVER['HTTP_ORIGIN'] = 'https://www.cs.siue.edu';
        $this->assertTrue(room_origin_ok());
        $_SERVER['HTTP_ORIGIN'] = 'https://evil.example';
        $this->assertFalse(room_origin_ok());
    }
}
```

Run (in `websites/www.cs`): `vendor/bin/phpunit --testsuite tankity --filter RoomGuardTest`
Expected: FAIL (`'abc'` comes back as typed).

- [ ] **Step 2: Implement**

`server/rules.php` — replace `room_valid_initials()` and its comment with:

```php
/* Exactly three letters, typed in either case, stored uppercase; a blocked set is refused. */
function room_valid_initials($raw): ?string
{
    return tankity_initials(tankity_guard(), $raw);
}
```

`rooms.php` — replace `room_origin_ok()` with:

```php
function room_origin_ok(): bool
{
    if (($_SERVER['HTTP_ORIGIN'] ?? '') === '' && ($_SERVER['HTTP_REFERER'] ?? '') === '') {
        return true; // curl-style callers send neither; the seat and room tokens still gate them
    }
    return tankity_guard()->originAllowed();
}
```

In the `create` and `join` handlers, right after their `room_origin_ok()` checks:

```php
    $perHour = max(1, (int) tankity_setting('TANKITY_ROOM_JOINS_PER_HOUR', 'room_joins_per_hour', 300));
    if (!tankity_guard()->rateTake('room', $perHour)) {
        room_json_out(429, ['error' => 'too many rooms from here; try again later']);
    }
```

(`room_gate()` keeps calling `room_origin_ok()`, so every authenticated act gets the allow-list too.)

- [ ] **Step 3: Run**

Run (in `websites/www.cs`): `vendor/bin/phpunit --testsuite tankity --exclude-group slow && make up && vendor/bin/phpunit --testsuite tankity-docker` (inside the container: `docker compose -f ../../compose.yaml exec -T www-cs-php sh -c 'cd /var/www/html && vendor/bin/phpunit --testsuite tankity-docker'`) and `make e2e E2E_ARGS="tankity-rooms.spec.mjs"`
Expected: PASS; two browsers still create and join (their Origin is the page's own host).

- [ ] **Step 4: Commit**

```bash
git add games/tankity/server/rules.php games/tankity/rooms.php games/tankity/test/php/RoomGuardTest.php
git commit -F- <<'MSG'
Tankity rooms: the guard's initials, origins and a rate on new rooms

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb
MSG
```

### Task 35: The browser proves it, docs, PR 16

**Files:**
- Modify: `tests/e2e/tankity-end.spec.mjs` (the filed score equals the shown score)
- Modify: `games/tankity/README.md` (Files table: `solo.ts`, `solo-log.ts`, `solo-play.ts`, `solo-file.ts`, `server/solo.php`, `server/flight.php`, `server/scores-api.php`, `tools/solo-runs.mjs`, `tools/round-bench.php`, `protocol/solo-runs.json`; the Storage section's tables; section "Scores and the server's solo play"; Tests table)

**Interfaces:**
- Consumes: everything in PR 16.

- [ ] **Step 1: The spec checks the server's score against the card**

In `tests/e2e/tankity-end.spec.mjs`, before `await loseMatch(page);` add:

```js
  const filed = page.waitForResponse(r => r.url().includes('scores.php') && r.request().method() === 'POST'
    && (r.request().postData() || '').includes('"op":"file"'), { timeout: 120_000 }).catch(() => null);
```

and after the `#end-filed` expectation:

```js
  // The server played every round as it ended and filed exactly the score this page showed.
  if (local(baseURL)) {
    const res = await filed;
    expect(res, 'the run was sent for filing').toBeTruthy();
    expect(res.status(), `scores.php refused the run: ${await res.text()}`).toBe(200);
    const shown = Number((await veil.locator('#end-score').textContent()).match(/^Score (\d+)/)[1]);
    expect((await res.json()).score).toBe(shown);
  }
```

Run (in `websites/www.cs`): `make e2e E2E_ARGS="tankity-end.spec.mjs"`
Expected: 1 passed, with the server's score equal to the card's.

- [ ] **Step 2: Docs**

README Files table rows:

```markdown
| `src/solo.ts` | The solo referee: deal, muster, settle, turns, 1-ups, the shop's rules, a drone's aim (pure; `server/solo.php` is the same) |
| `src/solo-log.ts` | A solo round as the server plays it: the purchases before it, each shot (gun, angle, power, where the tank drove), and the claim of how it ended |
| `src/solo-play.ts` | Solo matches without a page: `flyVolley` (the war's fixed steps), `soloRound` (the server's round), `playSolo` with a bot, `replaySolo` (not in the bundle) |
| `src/solo-file.ts` | Sending a run: start, each round as it ends, file; an offline queue that keeps them in order |
| `server/solo.php` | The solo referee in PHP and `solo_round()` (2 s of CPU and 200 shots per round) |
| `server/flight.php` | A solo volley in fixed steps, tanks falling between them, as the browser flies it |
| `server/scores-api.php` | The score endpoint: guard checks, run tokens, the server's play of each round (`solo_runs`), filing, and the runs' expiry |
| `tools/solo-runs.mjs`, `protocol/solo-runs.json` | Bot runs recorded round by round with the browser's rules; the PHP rounds must reach every claim |
| `tools/round-bench.php` | CPU per round of every recorded run; the nightly fails when a round needs more than the cap |
```

In the Storage section (PR 20), the list of what the directory holds becomes `tankity.sqlite` (rooms; the boards; solo runs; per-callsign rows only until housekeeping moves them onto the Normal board) and `guard-runs.json` (the score guard's run tokens and rate stamps); the housekeeping list gains "solo runs two hours after their last round (a day after their start at the latest), filed runs an hour after filing".

Section before `## Drone aim`:

```markdown
## Scores and the server's solo play

Runs file themselves the moment they end, on the board of their difficulty
(one per difficulty, the best 100 each). A room's server files its humans'
scores itself. A solo run is played by the server as it goes:

- When a match is dealt the page asks scores.php for a CSRF token and starts a
  run (`op: start`, the seed and the difficulty): a single-use guard run token
  becomes the run's id, and the server deals the same match and stores it
  (`solo_runs`).
- As each round ends the page sends that round (`op: round`): the purchases
  before it, each shot, and its claim (how the round ended, the score, cash,
  lives and rounds won). The server plays the round from the stored state
  with the same rules and the same fixed-step flight, tanks falling mid-volley
  (`server/solo.php`, `server/flight.php`), stores the new state, and answers
  its own claim. A round it cannot play (a shot out of range, a purchase the
  chest cannot pay, shots after the round ended, more than 200 shots or 2 s of
  CPU), or a claim that differs from its own, voids the run: the server's
  play is the authority, and once the two disagree no later round could match.
  A round sent twice answers the stored reply; one out of order is refused.
- At game over the page files the run (`op: file`, the initials): the guard
  spends the run token, and the server files the score it already holds; any
  score the client sends is ignored. There is no round limit.
- A run expires two hours after the last round the server accepted, and a day
  after it started at the latest. Rounds that could not be sent wait in the
  browser (`tankity-pending-runs`) and go, in order, when the server answers.

Initials are three letters, typed in either case and stored uppercase, one
set per player shared by solo and rooms; the guard refuses a blocked set.
Origins come from the guard's allow-list; run tokens, starts, rounds and
filings are rate-limited per IP, and so are new rooms.
```


Tests table: add `SoloRoundTest`, `FlightTest`, `ScoresApiTest`, `RoomGuardTest`, `test/solo*.test.mjs`, `test/fixed-step.test.mjs`, `test/determinism.test.mjs`, and the nightly's `--group slow` and round bench.

- [ ] **Step 3: Full gate, PR**

Run (in `websites/www.cs`): `make test` then `make e2e E2E_ARGS="tankity-solo.spec.mjs"`
Expected: green within budgets.

```bash
git add tests/e2e/tankity-end.spec.mjs games/tankity/README.md
git commit -F- <<'MSG'
Tankity score integrity: the end spec checks the server's score; docs

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb
MSG
git push -u origin games/tankity-score-integrity
gh pr create --title "Tankity score integrity: guard, the server plays each solo round, uppercase initials" --body "Spec row 16 (section 8). Determinism audit first (README 'Solo determinism'); the server keeps each solo run in SQLite, plays every round from its stored state with a step-for-step flight (tanks fall mid-volley), voids a run whose claim differs, and files the score it holds. Per-round CPU measured in Task 30: <numbers>.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb"
```

If `main` moved, rebase and rebuild the generated files (Global Constraints). Run the pr-fix loop, gate on required checks as before, merge on green, `make deploy`, and check live: lose a short solo match on `/play/tankity/?v=<sha>` and see "Filed · #N all-time on <difficulty>" (the live board takes a real entry; use initials that read as a test, such as `TST`, and say so in the report). Report the cache-busted link.

---

## Self-Review

1. **Spec coverage.** 7.1: max armor and plates (T1–3, T5), carry-over (T2, T5), Repair capped/greyed/says what it restores (T1, T3, T5, T7), no banking (T2, T3, T5), re-muster at full max with plates (T2, T5), drones unchanged (T2 test), ARMOR pill "160 of 175" (T6), client and server together with vectors (T4). 7.2: solo endless with no round limit (T22, T27's run past 60 rounds, T30), tanks falling mid-volley on both sides (T23, T29), last human standing with ×2 bonus (T8, T13), one-human room like solo (T8), `WATCH_TURNS` stays (T8 test, T22), vectors (T13, T29). 7.3: top-of-shop board (T14–16), match over with ♛, Play again (same room), Leave room, "Filed · #12 all-time on Normal" (T12, T14, T17–18), you're out with Watch the finish and Menu → Standings (T18), solo rounds table heading the end card (T16–17). 8: auto-filing, no form (T11, T17, T19, T33), a board per difficulty with yours highlighted and a switcher (T10, T19), initials in either case, uppercase stored (T19 and T31 via `tankity_initials`, T34), one-time conversion onto Normal (T10), guard on score and room endpoints (T31, T34), rooms filed server-side (T11), the server playing each round from stored state with the per-round limits and voiding on a mismatch (T29–31), filing what the server holds (T31), expiry (T31), offline queue (T32–33), PHPUnit for every guard rule and round case (T30, T31), determinism audit before the endpoint (T21–23). 12: one SQLite database for rooms, boards and runs (S2–S5, T10, T31), the `data_dir` setting used exactly or the location order with the username source and the private-directory checks (S2), journal mode by filesystem (S2, confirmed by S1), the one-time lossless import of the old files with `scores_dir` read only as their location (S5), `shm_key` and shared memory gone (S3, S4), cleanup on requests with a fake clock (S6, T10, T31), never served or deployed (S7), the host probe before any code (S1).
2. **Placeholders.** None remain. The plan has no open questions; the decisions it is written to are in **Decisions** (header). Two gates stop for William on measured facts: Task S1's "stop" rows (the host's storage) and Task 30's per-round CPU.
3. **Type consistency.** Plan C's names are used as Plan C defines them: `Kit\ScoreGuard` and its methods through `tankity_guard()`/`tankity_initials()` (T10, T19, T31, T34; `rateTake` is Plan C Task 4's and paces rounds in T31), `kit_php` (T10), `initialsPref` and main.ts's `getInitials` (T17, T19), `backToTitle` (T17, T18), `HudProps` in `ui/hud.tsx` with `test/hud.test.mjs` (T6), `test/menu.test.mjs` (T18), and the e2e `dealSolo` is this plan's (T7). PR 20's `tankity_db`/`tankity_tx`/`tankity_depth` are what the store (S3), the callsign rows (S5), housekeeping (S6), the boards (T10) and the runs (T31) use, and a filing inside a held room joins the room's transaction (S2's `tankity_depth`). `tankity_jobs()` grows by `callsigns` (T10) and `solo` (T31). `difficulty` runs from the Menu through `soloDeal` (T22) into the run's start (T33, T31), the board a run files on (T10, T19, T31), `filedLine` (T14, T18, T19, T33), `playSolo`/`replaySolo` (T26), `solo-runs.json` (T27) and `solo_deal` (T28). `SoloRoundLog`/`RoundClaim` (T25) are what `soloRound` (T26), `solo-runs.json` (T27), `solo_claim`/`solo_round` (T30), the `round` op (T31) and the filer (T32) carry; `FLIGHT_STEP`/`SOLO_STEP` and `FLIGHT_MAX_STEPS` match (T23, T26, T29). `SoloState`/`SoloTank` (T22) are what `soloBuy` (T24) and `soloRound` (T26) use; `EndState.buttons` matches `EndVeilProps.buttons` (T17) and `RoomCard` minus `'shop'` (T14, T18); `MatchDeps.fileSolo` (T17, T19) gives way to `soloBegin`/`soloRound`/`soloFinish` once, in T33, with its caller.
4. **Review Focus.** Each of the eight lines has its test in the owning task (T23/T26/T29, T31, S2/S1, S5, S4, T10, T8, T3/T1).
