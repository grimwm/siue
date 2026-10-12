# Games Kit, Plan D: Tankity's Rules and Scores Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Armor that carries between rounds, a room match that ends on the last human standing, per-match scoreboards, scores that file themselves, and solo scores the server earns by replaying the move log with the same PHP sim the rooms use.

**Architecture:** The armor rules live once per language (`src/armor.ts`, `room_*_armor` in `server/rules.php`) and are pinned together by a new sim-vector group. Rooms keep per-seat match stats on the server, end on the last human standing, and file each human's score into a single all-time board (`server/board.php`). Solo play moves its deterministic rules out of `match.ts` into a pure referee (`src/solo.ts`, mirrored by `server/solo.php` over the room sim), flies shells in fixed 1/60 s steps, and records a move log; at game over the browser sends the log, the server replays it under the kit's score guard, and files what the replay scored. A determinism audit precedes the replay endpoint.

**Tech Stack:** TypeScript 7 (native type stripping for `node --test`), Preact 11, esbuild via `games/_kit/build/build.mjs`, PHP 8.4, PHPUnit 12, Playwright.

**Spec:** `docs/superpowers/specs/2026-10-12-games-kit-design.md`, sections 7.1, 7.2, 7.3 and 8, PR rows 14, 15 and 16 of section 10.

**Landing order across plans:** difficulty PR → B6 ∥ C10 → B7 → (B8 ∥ B9) ∥ (C11 → C12 → C13) → B19 → D14 → D15 → D16 → E17 → row 18.

**Cross-plan dependencies:**
- The difficulty PR (#77: `src/difficulty.ts`; `DIFFICULTY`, `DIFFICULTIES`, `aimSkill()` and `type Difficulty` in `src/ai.ts`/`src/sim.ts`; `World.difficulty`; `ROOM_DIFFICULTY`, `room_parse_difficulty()` and `room_difficulty()` in `server/ai.php`; `$room['difficulty']`, set by the host at create and sent in every snapshot) is on `main`. Every protocol fixture (`protocol/*.json`) and `protocol/sim-vectors.json` this plan regenerates is written on top of it, by the generators (`make protocol`, `php protocol/sim-vectors.php`), never by hand.
- PR 14 needs Plan C's PR 13 (the status bar in `src/ui/hud.tsx` and its `test/hud.test.mjs`).
- PR 15 needs Plan C's PR 10 (the kit's `Kit\ScoreGuard` and the `kit_php` install key) and PR 12 (`src/initials.ts`, `getInitials`, the title card and `backToTitle()`, and `test/menu.test.mjs`), and Plan B's PR 19 (Menu → Quit, which Task 18's Standings button follows).
- `menu.tsx`, `menu.ts` and `test/menu.test.mjs` change in this order: the difficulty PR → Plan C Task 14 → Plan C Task 19 → Plan B Task 24 (Quit) → Task 18 here (Standings).

## Assumes from Plan C

Plan D runs after Plan C. These are the names this plan uses from Plan C's work.

| What | Name and shape |
|---|---|
| Kit score guard | `games/_kit/php/score-guard.php` (Plan C Tasks 2–4), copied into the game as `games/tankity/server/score-guard.php` when Tankity's `tools/install-files.php` config lists it under `'kit_php' => ['score-guard.php']` (generated, checked in, kept current by `php tools/install-files.php --check`). One class, `Kit\ScoreGuard`: `new ScoreGuard(array $config, string $csrfHeader, string $rateSalt, array $server, array $cookies, string $runsPath, ?Closure $clock = null, ?Closure $setCookie = null)`; `ScoreGuard::CONFIG_KEYS` (`runTtlSec`, `startsPerHour`, `scoresPerHour`, `csrfCookie`, `storageKey`, `blockedInitials`, `allowedHosts`); `static validateConfig(array): array` (throws `RuntimeException`); `static initials(mixed): ?string` (`[A-Za-z]{3}` in, uppercase out, null otherwise; it does not check the blocklist); `static coerceInitials(mixed $value, string $pad): string`; `isBlocked(string): bool`; `originAllowed(): bool`; `csrfToken(): string` (the cookie's token, or a new one set now); `csrfOk(): bool`; `startRun(): ?string` (null = rate-limited); `consumeRun(string $id, ?callable $plausible = null): ?string` (null accepted, else `'rate'`, `'invalid run'` or `'score rejected'`); `rateTake(string $kind, int $perHour): bool` (Task 4's per-client cap for any other endpoint). Tankity's `server/guard.php` (Task 10) is the thin wrapper that builds one from Tankity's settings. |
| Initials | `src/initials.ts` exports `BLOCKED_INITIALS`, `validInitials(raw)`, `randomInitials(rng)` and `initialsPref(storage, rng)` (Plan C Task 11). `main.ts` (Plan C Task 13) holds the one set: `const savedInitials = initialsPref(browserStorage(), Math.random);` and `const getInitials = (): string => savedInitials.get();`. There is no `getInitials` export from `src/initials.ts`. The rooms host and join with `getInitials()` (`LobbyDeps.savedInitials`). |
| Title card | `main.ts` has `backToTitle(): void` (close panels, restart the demo, open the card; Plan C Task 13). Leave room (`netLeave`) and the solo end card's **Continue** return to it. `MatchDeps.backToTitle` replaced `freshMatchFromSeedBox`. |
| Menu | Plan C Task 14's settings-only menu (with Difficulty), Task 19's phone extras, and Plan B Task 24's **Quit**; **Scores** calls `toggleOverlay('report-overlay', 'scores-open')`. Plan C does not add Standings: Task 18 here does (`MenuDeps.openStandings`, `MenuProps.onStandings`, `#menu-standings`, shown only in a room). |
| Status bar | Plan C Task 17's `src/ui/hud.tsx`: `HudProps.armor` is `{ shown: string; sr: string }`, drawn in the ARMOR pill's `#hud-armor`; its tests are `test/hud.test.mjs` (node:test). `src/hud.ts` (Task 19) has `HUD.armor` and `renderStanding()`. |
| End card | Plan C Task 13's `src/ui/endveil.tsx`: the solo button reads **Continue** and goes back to the title card; a room's reads **Back to rooms**. |
| e2e helpers | `tests/e2e/helpers.mjs` has `newPlayer`, `hud`, `aimTo`, `setPower`, `roomPair`, `setInitials` (Plan C Task 15) and `startSolo(page)` (deals in, leaves the shop, waits for the first aim). Task 7 adds `dealSolo(page)`: click `#title-play` and wait for the pre-match shop (`#shop-veil`). |
| Test helpers | Component tests load `.tsx` with the kit's `importTsx` (`games/_kit/test/tsx.ts`) and render into `games/_kit/test/dom-stub.mjs` (Plan B Task 5). |

## Decision needed (William)

Three open questions this plan does not decide. Each must be answered before the PR named; until then the tasks are written for the option marked "as written".

**1. Does the all-time board separate or label difficulty? (before PR 15 / PR 16)** A run at Easy and a run at Hard land on the same board today.

- *Option A, recommended:* one shared board with a difficulty column or badge. Changes: Task 10 (`board_file` stores `difficulty`, `board_top` returns it, the conversion marks old rows `normal`; `BoardTest` gains a case), Task 11 (`room_file_seat` passes `room_difficulty($room)`), Task 19 (`BoardRow` and each row's text show the badge; the scores UI test), Task 31 (`board_file` gets the replayed log's `difficulty`; `ScoresApiTest` checks it), and the README sections of Tasks 20 and 35.
- *Option B:* a board per difficulty. Changes: Task 10 (one file per level, `operation-tankity-board-<level>.json`, `board_file`/`board_top` take a level, the conversion fills `normal`), Task 11, Task 19 (Scores shows the player's current level's board with a level switcher, or all three), Task 31 (files on the log's level's board), Task 20/35 docs and the `tankity-end` spec's "Filed · #N" wording.
- *As written:* neither; rows carry no difficulty.

**2. Tanks hold still while shells fly (Task 23)? (before PR 16)** Task 23 stops tank falls during a volley in the browser so the replay matches; that is a visible gameplay change the spec does not contain.

- *Option A:* drop Task 23's freeze and teach `server/solo.php` (Task 29) to drop tanks mid-volley the way the browser does, step by step, with vectors that pin it.
- *Option B:* keep Task 23 and add the rule to spec section 7 (tanks settle after the volley, in solo and rooms alike).
- *As written:* Task 23 is kept (Option B without the spec amendment).

**3. The 60-round replay cap vs. "solo is endless" (§7.2). (before PR 16)** `SOLO_MAX_ROUNDS = 60` (Task 29) refuses any log past round 60, so an honest run that survives that long can never file. This also covers the 2 s CPU concern already noted in Task 30.

- *Option A:* the browser stops recording at round 60 and files the run as it stood at the end of round 60 (Task 25 stops logging, Task 29 replays to round 60 and scores there, Task 32 files at that point; the end card says so).
- *Option B:* raise the cap (and the CPU budget with it, Task 30 measures what a longer replay costs on the host).
- *Option C:* file per round: the log is sent and replayed in round-sized pieces as the run goes, so no single replay is long (Tasks 25, 29, 31, 32, 33 change shape; the guard's run token covers the whole run).
- *As written:* the 60-round cap and 2 s budget stay, and a run past round 60 is refused.

## Global Constraints

- Paths below are relative to `websites/www.cs/` unless they start with `games/tankity/`-relative commands; every `Run:` line says where it runs.
- The host is the sftp-only PHP 8.4 server; nothing is built there. What ships is static files plus runtime PHP. `dist/` is checked in and must match `node ../_kit/build/build.mjs tankity --check`.
- A built game folder needs nothing outside itself at run time: Tankity's PHP may require only files inside `games/tankity/` (the guard is the generated copy `server/score-guard.php`, never `../_kit/`).
- Pinned versions: `typescript` 7.0.2, `esbuild` 0.28.2, `preact` 11.0.1; `phpunit/phpunit` ^12.
- Never bind a port someone may be using (3000, 5173, 8000, 8080); the docker site publishes an ephemeral port and specs get it from `make url`.
- Browser specs run only through `make e2e` / `tests/e2e/run.sh` (the e2e lock). Agents run `make test` plus at most the 1–2 specs each task names; CI runs the selected specs in four shards.
- New browser specs target ≤ 15 s each (Playwright `page.clock` where timers matter) and are registered in `tests/e2e/shard.mjs` `WEIGHTS` (`select.mjs` already maps every `tankity-*` spec to Tankity changes).
- `make test` budgets: static ≤ 15 s, unit ≤ 45 s. Slow replay sweeps run in the nightly job only (PHPUnit group `slow`).
- Tests: new node tests are `test/*.test.mjs` on `node:test` + `node:assert/strict` (no `check()` bridge); spec row 18 turns them into `.test.ts`. New UI tests never extend the `check()`-style `test/ui.test.mjs`: they go in new node:test files (`test/standings-ui.test.mjs`, `test/endveil.test.mjs`, `test/scores-ui.test.mjs`) or in Plan C's (`test/hud.test.mjs`, `test/menu.test.mjs`), loading `.tsx` with the kit's `importTsx`; a `ui.test.mjs` block those files replace is deleted. New PHP tests are real `PHPUnit\Framework\TestCase` classes in `games/tankity/test/php/` that load the room library in `setUpBeforeClass()` through `test/php/rooms-lib.php`.
- Comments say why, not what; no history ("kept from", "moved in #NN"); file headers 1–5 lines. Docs (`games/tankity/README.md`) describe the current state.
- One PR per spec row: PR 14 (Tasks 1–7), PR 15 (Tasks 8–20), PR 16 (Tasks 21–35). Each PR: branch in its own worktree off `main`, CI, the pr-fix loop on review comments, merge on green CI after pr-fix (William authorized merging on green; CodeRabbit rate-limit notices never block), deploy, a light live check, and a report ending with a cache-busted `/play/tankity/?v=<sha>` link.
- Generated files are never hand-merged. Every Tankity PR rewrites `dist/`, `sw.js`, `index.html`'s `?v=` values and `game.json`, and this plan's PRs also `protocol/*.json`, `protocol/sim-vectors.json` and `protocol/solo-runs.json`; after rebasing onto `main`, take either side of a conflict in them and rebuild: `cd websites/www.cs/games && npm run build && php tankity/tools/game-json.php && php tankity/tools/install-files.php`, then `cd websites/www.cs && php tools/site-versions.php && make protocol && (cd games/tankity && php protocol/sim-vectors.php && node tools/solo-runs.mjs)` (each generator that exists by then), and commit what they wrote.
- Browser specs run as `make e2e E2E_ARGS="<spec> [<spec>]"` (the Makefile has no `SPECS` variable).
- Spec constants, verbatim: max armor = 100 + 25 × hull plates; Repair +40 restores up to max; winner's bonus = the round bonus × 2 (round bonus = 750 + round × 150); `WATCH_TURNS` = 40 stays; initials `[A-Za-z]{3}` in, `[A-Z]{3}` stored; replay limits 60 rounds and 2 s of CPU.
- Every commit message ends with:
  ```
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb
  ```

## Review Focus

1. **A solo run on a 30 Hz phone, a 144 Hz monitor, or a tab throttled in the background.** Frame lengths vary wildly; the server's replay must still land every shell where the browser did, so the filed score equals the shown one. Pinned by `test/fixed-step.test.mjs` "every step is exactly SOLO_STEP whatever the frame lengths" (Task 23) and by the jittered-frame replay test in `test/solo-play.test.mjs` (Task 26).
2. **A run that ends with the score server unreachable (offline, 5xx, a 429).** Expected: it waits in the browser and files exactly once when the server answers; a run the server refuses is dropped, not retried forever. Pinned by `test/solo-file.test.mjs` (Task 32): offline keeps, filed removes, refused removes, five failures drop, two concurrent flushes file once.
3. **Old free-text callsigns on the board** (`""`, `"123"`, `"r2-d2"`, `"bo"`, `"ass"`, `"tankity ace"`). Expected: three letters, never a blocked set, every old best run still listed. Pinned by `BoardTest::testOddCallsignsConvert` and `testConvertsLegacyFilesOnce` (Task 10).
4. **Two humans losing their last lives in the same round.** In a 3-human room with one left, that one wins; in a 2-human room nobody is left, so the match ends with no winner and no bonus. Pinned by `RoomMatchEndTest::testTwoOutAtOnceLeaveOneWinner` and `testLastTwoFallTogetherNobodyWins` (Task 8).
5. **Buying Repair at full armor, or more packs than the hull needs, in a room or solo.** Expected: refused at full, otherwise only the packs that fill the hull are charged. Pinned by `RoomBuyTest::testRepairAtFullArmorIsRefusedAndCostsNothing` / `testRepairBuysOnlyThePacksThatFillTheHull` (Task 3) and `test/armor.test.mjs` "packs wanted" (Task 1).

---

## File Structure

```
games/tankity/
  src/armor.ts             create (T1)   max armor, repair, plates, carry-over, the shop's two notes
  src/standings.ts         create (T13–14, T18) match-end rule, winner bonus, scoreboard rows, the filed line, what Esc does on an end card
  src/ui/standings.tsx     create (T15)  the scoreboard table (room or solo)
  src/solo.ts              create (T22, T24) the solo referee: deal, muster, settle, turns, 1-ups, buy, drone aim
  src/solo-log.ts          create (T25)  the move log and its validators
  src/solo-play.ts         create (T26)  headless solo runs, a bot, and a TS replayer
  src/solo-file.ts         create (T32)  filing finished runs, with the offline queue
  src/flow.ts              modify (T23)  runFixed replaces runWar
  src/match.ts, shop.ts, room.ts, lobby.ts, scores.ts, hud.ts, main.ts, net.ts, protocol.ts, game-types.ts  modify
  src/ui/endveil.tsx, shop.tsx, scores.tsx, hud.tsx  modify
  src/sim.ts               modify (T21)  rad(), dist(), squares, seek and bomblet alignment
  server/rules.php         modify        armor, room_buy, match end, stats, filing, again
  server/sim.php           modify (T21, T30) room_dist, squares, lance bracket, hot-loop constants
  server/protocol.php      modify        snapshot fields
  server/guard.php         create (T10)  BLOCKED_INITIALS, tankity_guard() (a Kit\ScoreGuard from Tankity's settings), tankity_initials()
  server/board.php         create (T10)  the all-time board and the one-time conversion
  server/solo.php          create (T28–29) the solo referee in PHP and solo_replay()
  server/scores-api.php    create (T31)  the score endpoint's handler
  rooms.php                modify        requires, buy, start, again, origin and rate gates
  scores.php               modify (T19, T31) thin endpoint over board / scores-api
  protocol/sim-vectors.php modify        groups armor, match-end, solo-deal; known cases dropped
  protocol/solo-runs.json  create (T27)  recorded bot runs the PHP replay must match
  tools/solo-runs.mjs      create (T27)  writes / checks solo-runs.json
  tools/replay-bench.php   create (T30)  CPU per recorded replay
  test/*.test.mjs          create/modify as named per task (UI: standings-ui, endveil, scores-ui; Plan C's hud and menu)
  test/php/rooms-lib.php   create (T2)
  test/php/*Test.php       create as named per task
  game.css, game.yaml, game.json, README.md, test.sh  modify
Makefile                    modify (T27)  solo-runs target
tests/e2e/helpers.mjs             modify (T7)   dealSolo(page)
tests/e2e/tankity-armor.spec.mjs  create (T7)
tests/e2e/tankity-end.spec.mjs    modify (T20, T35)
tests/e2e/tankity-hud.spec.mjs    modify (T6)
tests/e2e/shard.mjs               modify (T7)
.github/workflows/ci.yml          modify (T30)  nightly runs the slow PHPUnit group
```

---

# PR 14: armor rules

Branch `games/tankity-armor`, worktree `.claude/worktrees/tankity-armor`.

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
- Create: `games/tankity/test/php/rooms-lib.php`
- Create: `games/tankity/test/php/RoomArmorTest.php`

**Interfaces:**
- Consumes: nothing new.
- Produces (PHP, `rules.php`): `ROOM_ARMOR = 100`, `ROOM_PLATE_ARMOR = 25`; `room_max_armor(array $room, int $seat): int`; `room_muster_armor(array $room, int $seat): int`; `room_repair_packs_wanted(array $room, int $seat, int $per): int`; `room_repair(array &$room, int $seat, int $n): int` (restored amount); `room_fit_plate(array &$room, int $seat, int $qty): void`; `room_carry_armor(array &$room, int $seat, int $hp, bool $wrecked): void`; `room_apply_fuel(array &$room): void` (replaces `room_apply_banked`). Room keys: `armor[seat]`, `plate[seat]`. Removed keys: `repair`, `repairApplied`.

- [ ] **Step 1: Write the test library loader and the failing test**

```php
<?php
// games/tankity/test/php/rooms-lib.php
// Loads rooms.php for its functions only (no request is served). TestCases
// require this in setUpBeforeClass, after PHPUnit has run the legacy check
// scripts that require rooms.php themselves.
declare(strict_types=1);
if (!defined('TANKITY_ROOMS_LIB')) {
    define('TANKITY_ROOMS_LIB', true);
}
require_once dirname(__DIR__, 2) . '/rooms.php';
```

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
git add games/tankity/server/rules.php games/tankity/test/php/rooms-lib.php games/tankity/test/php/RoomArmorTest.php games/tankity/test/php/checks/rooms-sim.php
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

### Task 10: The all-time board, with the one-time conversion

**Files:**
- Create: `games/tankity/server/guard.php`
- Create: `games/tankity/server/board.php`
- Modify: `games/tankity/server/rules.php` (delete `BLOCKED_INITIALS` const, current lines 14–30)
- Modify: `games/tankity/rooms.php` (require `server/guard.php` and `server/board.php` before `server/rules.php`)
- Modify: `games/tankity/tools/install-files.php` (install config: `'kit_php' => ['score-guard.php']`, Plan C Task 1's key)
- Create: `games/tankity/server/score-guard.php` (generated copy, written by `php tools/install-files.php`)
- Modify: `games/tankity/test/smoke.test.mjs` (`phpFiles` reads `server/guard.php` and `server/board.php`)
- Create: `games/tankity/test/php/BoardTest.php`

**Interfaces:**
- Consumes: Plan C's `Kit\ScoreGuard` (`validateConfig`, `initials`, `coerceInitials`, `isBlocked`, the constructor), through the `server/score-guard.php` copy.
- Produces: `BLOCKED_INITIALS` (now in `guard.php`); `tankity_guard_config(array $override = []): array` (Tankity's `CONFIG_KEYS`, validated); `tankity_guard(array $override = [], ?array $server = null, ?array $cookies = null, ?Closure $clock = null, ?Closure $setCookie = null): Kit\ScoreGuard` (header `X-Tankity-Csrf`, rate salt `tankity-score-rate-v1`, runs file `sys_get_temp_dir()/<storageKey>-runs.json`; the request's `$_SERVER`/`$_COOKIE` unless given); `tankity_initials(Kit\ScoreGuard $guard, mixed $raw): ?string` (`ScoreGuard::initials()` on the trimmed value, and null for a blocked set); `BOARD_KEEP = 100`, `BOARD_SHOW = 20`; `board_convert_name(string $name, Kit\ScoreGuard $guard): string` (`ScoreGuard::coerceInitials($name, 'X')`, then `BOARD_STANDIN` when `isBlocked()`); `board_file(array $run): ?int` (run keys `initials`, `score`, `rounds`, `seed`; returns the 1-based all-time place, null when it did not place); `board_top(int $n): array` (rows `initials, score, rounds, seed, at, place`).

- [ ] **Step 1: Write the failing test**

```php
<?php
// games/tankity/test/php/BoardTest.php
declare(strict_types=1);

use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

/* The all-time board: best runs first, ties keep the older run ahead, the best
   BOARD_KEEP kept, and the old per-callsign files converted once. */
final class BoardTest extends TestCase
{
    private string $dir;

    public static function setUpBeforeClass(): void
    {
        require_once __DIR__ . '/rooms-lib.php';
    }

    protected function setUp(): void
    {
        $this->dir = sys_get_temp_dir() . '/tankity-board-' . bin2hex(random_bytes(4));
        mkdir($this->dir);
        putenv('TANKITY_SCORES_DIR=' . $this->dir);
    }

    protected function tearDown(): void
    {
        putenv('TANKITY_SCORES_DIR');
        foreach (glob($this->dir . '/{,.}*', GLOB_BRACE) ?: [] as $f) {
            if (is_file($f)) {
                unlink($f);
            }
        }
        rmdir($this->dir);
    }

    private function run(string $who, int $score): array
    {
        return ['initials' => $who, 'score' => $score, 'rounds' => 1, 'seed' => 's'];
    }

    public function testFilesAndRanksBestFirst(): void
    {
        $this->assertSame(1, board_file($this->run('AAA', 300)));
        $this->assertSame(1, board_file($this->run('BBB', 500)));
        $this->assertSame(3, board_file($this->run('CCC', 100)));
        $this->assertSame(['BBB', 'AAA', 'CCC'], array_column(board_top(10), 'initials'));
        $this->assertSame([1, 2, 3], array_column(board_top(10), 'place'));
    }

    public function testTiesKeepTheOlderRunAhead(): void
    {
        board_file($this->run('OLD', 200));
        $this->assertSame(2, board_file($this->run('NEW', 200)));
        $this->assertSame(['OLD', 'NEW'], array_column(board_top(2), 'initials'));
    }

    public function testKeepsTheBestAndARunBelowThemDoesNotPlace(): void
    {
        for ($i = 0; $i < BOARD_KEEP; $i++) {
            board_file($this->run('TOP', 1000 + $i));
        }
        $this->assertNull(board_file($this->run('LOW', 1)));
        $this->assertCount(BOARD_KEEP, board_top(BOARD_KEEP + 5));
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

    public function testConvertsLegacyFilesOnce(): void
    {
        $legacy = fn(string $slug, array $runs) => file_put_contents(
            $this->dir . "/$slug-operation-tankity.json",
            json_encode(['name' => $slug, 'runs' => $runs, 'best' => max(array_column($runs, 'score'))]));
        $legacy('wg', [['score' => 10, 'banked' => 0, 'won' => false, 'seed' => 'a', 'ts' => '2026-01-01T00:00:00+00:00'],
            ['score' => 900, 'banked' => 4, 'won' => false, 'seed' => 'b', 'ts' => '2026-02-01T00:00:00+00:00']]);
        $legacy('r2-d2', [['score' => 450, 'banked' => 2, 'won' => false, 'seed' => 'c', 'ts' => '2026-03-01T00:00:00+00:00']]);
        $top = board_top(10);
        $this->assertSame(['WGX', 'RDX'], array_column($top, 'initials'));
        $this->assertSame([900, 450], array_column($top, 'score'));
        $this->assertSame(4, $top[0]['rounds']);
        $legacy('zz', [['score' => 5000, 'banked' => 9, 'won' => false, 'seed' => 'd', 'ts' => '2026-04-01T00:00:00+00:00']]);
        $this->assertSame(['WGX', 'RDX'], array_column(board_top(10), 'initials'));
    }
}
```

- [ ] **Step 2: Run it to see it fail**

Run (in `websites/www.cs`): `vendor/bin/phpunit --testsuite tankity --filter BoardTest`
Expected: FAIL, `Call to undefined function board_file()`.

- [ ] **Step 3: The guard settings**

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

/* The guard's config keys for Tankity, validated. Tests pass $override (a fresh
   storageKey, a low limit). */
function tankity_guard_config(array $override = []): array
{
    $hosts = array_values(array_filter(array_map('trim',
        explode(',', (string) tankity_setting('TANKITY_ALLOWED_HOSTS', 'allowed_hosts', 'www.cs.siue.edu,cs.siue.edu')))));
    return ScoreGuard::validateConfig($override + [
        'runTtlSec' => 900,
        'startsPerHour' => 120,
        'scoresPerHour' => 60,
        'csrfCookie' => 'tankity_csrf',
        'storageKey' => 'operation-tankity',
        'blockedInitials' => BLOCKED_INITIALS,
        'allowedHosts' => $hosts,
    ]);
}

/* The kit's score guard for this request, set up for Tankity: its cookie and
   header, its rate salt and its run store. Tests pass the request, a clock and
   a cookie setter; a page request uses $_SERVER, $_COOKIE and the real ones. */
function tankity_guard(array $override = [], ?array $server = null, ?array $cookies = null, ?Closure $clock = null, ?Closure $setCookie = null): ScoreGuard
{
    $cfg = tankity_guard_config($override);
    return new ScoreGuard(
        $cfg,
        'X-Tankity-Csrf',
        'tankity-score-rate-v1',
        $server ?? $_SERVER,
        $cookies ?? $_COOKIE,
        rtrim(sys_get_temp_dir(), DIRECTORY_SEPARATOR) . '/' . $cfg['storageKey'] . '-runs.json',
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

Delete the `// Mirrors cylon: ...` comment and the `const BLOCKED_INITIALS = [...]` block from `server/rules.php` (current lines 14–30). In `rooms.php`, before `require_once __DIR__ . '/server/settings.php';` add:

```php
require_once __DIR__ . '/server/guard.php';
require_once __DIR__ . '/server/board.php';
```

and add three lines to its file map comment: `//   server/guard.php     the score guard's settings and the blocked initials`, `//   server/score-guard.php  the kit's score guard (a generated copy; never edit it)` and `//   server/board.php     the all-time board`.

In `test/smoke.test.mjs`, replace `const phpFiles = ['rooms.php', ...['settings', 'store', 'sim', 'ai', 'rules', 'protocol'].map(f => `server/${f}.php`)];` with `const phpFiles = ['rooms.php', ...['settings', 'store', 'sim', 'ai', 'rules', 'protocol', 'guard', 'board'].map(f => `server/${f}.php`)];`: the `blocked-parity` check reads the server's list, which now lives in `server/guard.php`.

- [ ] **Step 4: The board**

```php
<?php
// games/tankity/server/board.php
// Operation Tankity's all-time board: one JSON file of the best runs, best
// first, in the scores directory. Writes hold board.lock and replace the file
// by rename, so readers never see half a board. The first load converts the
// per-callsign files the board replaced. Loaded by rooms.php and scores.php.
declare(strict_types=1);
if (count(get_included_files()) === 1) {
    http_response_code(404);
    exit;
}
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/guard.php';

use Kit\ScoreGuard;

const BOARD_KEEP = 100;
const BOARD_SHOW = 20;
const BOARD_FILE = 'operation-tankity-board.json';
const BOARD_LEGACY_GLOB = '*-operation-tankity.json';
const BOARD_STANDIN = 'AAA'; // what a converted name the blocklist refuses becomes

function board_dir(): string
{
    $d = (string) tankity_setting('TANKITY_SCORES_DIR', 'scores_dir', '');
    return trim($d) !== '' ? rtrim(trim($d), '/') : '/var/tmp';
}

/* An old free-text callsign as board initials: the kit guard's coercion
   (letters uppercased, the rest dropped, cut or padded with X to three), and
   the stand-in for a set the guard blocks. */
function board_convert_name(string $name, ScoreGuard $guard): string
{
    $three = ScoreGuard::coerceInitials($name, 'X');
    return $guard->isBlocked($three) ? BOARD_STANDIN : $three;
}

/* Best first; usort is stable, so equal scores keep the order they were filed. */
function board_sort(array $rows): array
{
    usort($rows, fn($a, $b) => $b['score'] <=> $a['score']);
    return $rows;
}

/* Each old per-callsign file's best run, as a board row. */
function board_legacy_rows(): array
{
    $rows = [];
    $guard = tankity_guard();
    $paths = glob(board_dir() . '/' . BOARD_LEGACY_GLOB) ?: [];
    sort($paths);
    foreach ($paths as $path) {
        $data = json_decode((string) @file_get_contents($path), true);
        if (!is_array($data) || !is_array($data['runs'] ?? null)) {
            continue;
        }
        $best = null;
        foreach ($data['runs'] as $r) {
            if (is_array($r) && isset($r['score']) && ($best === null || (int) $r['score'] > (int) $best['score'])) {
                $best = $r;
            }
        }
        if ($best === null) {
            continue;
        }
        $name = (string) ($data['name'] ?? basename($path, '-operation-tankity.json'));
        $rows[] = [
            'initials' => board_convert_name($name, $guard),
            'score' => max(0, (int) $best['score']),
            'rounds' => max(0, (int) ($best['banked'] ?? 0)),
            'seed' => substr((string) ($best['seed'] ?? ''), 0, 64),
            'at' => (string) ($best['ts'] ?? ''),
        ];
    }
    return $rows;
}

function board_write(string $path, array $data): void
{
    $tmp = $path . '.tmp.' . getmypid();
    $fh = fopen($tmp, 'wb');
    if ($fh === false) {
        throw new RuntimeException('board write failed');
    }
    fwrite($fh, (string) json_encode($data, JSON_UNESCAPED_SLASHES));
    fflush($fh);
    if (function_exists('fsync')) {
        fsync($fh);
    }
    fclose($fh);
    if (!rename($tmp, $path)) {
        @unlink($tmp);
        throw new RuntimeException('board write failed');
    }
}

/* Runs $fn over the board's rows under the board lock. $fn returns
   [result, rows to write or null]. A board that does not exist yet starts from
   the converted old files, and is written at once. */
function board_locked(callable $fn)
{
    $path = board_dir() . '/' . BOARD_FILE;
    $lock = @fopen($path . '.lock', 'c');
    if ($lock === false) {
        throw new RuntimeException('board unavailable');
    }
    try {
        if (!flock($lock, LOCK_EX)) {
            throw new RuntimeException('board busy');
        }
        $data = json_decode((string) @file_get_contents($path), true);
        $fresh = !is_array($data) || !is_array($data['rows'] ?? null);
        $rows = $fresh ? array_slice(board_sort(board_legacy_rows()), 0, BOARD_KEEP) : $data['rows'];
        [$result, $next] = $fn($rows);
        if ($fresh || $next !== null) {
            board_write($path, ['rows' => $next ?? $rows, 'converted' => $fresh ? gmdate('c') : ($data['converted'] ?? '')]);
        }
        flock($lock, LOCK_UN);
        return $result;
    } finally {
        fclose($lock);
    }
}

/* Files a run; its 1-based all-time place, or null when it did not make the board. */
function board_file(array $run): ?int
{
    $row = ['initials' => (string) $run['initials'], 'score' => (int) $run['score'], 'rounds' => (int) $run['rounds'],
        'seed' => substr((string) $run['seed'], 0, 64), 'at' => gmdate('c')];
    return board_locked(function (array $rows) use ($row): array {
        $rows[] = $row;
        $rows = board_sort($rows);
        $rank = null;
        foreach ($rows as $i => $r) {
            if ($r === $row) {
                $rank = $i + 1; // the last twin is the new one
            }
        }
        return [$rank !== null && $rank <= BOARD_KEEP ? $rank : null, array_slice($rows, 0, BOARD_KEEP)];
    });
}

/* The best $n runs with their places. */
function board_top(int $n): array
{
    return board_locked(function (array $rows) use ($n): array {
        $out = [];
        foreach (array_slice($rows, 0, $n) as $i => $r) {
            $out[] = $r + ['place' => $i + 1];
        }
        return [$out, null];
    });
}
```

- [ ] **Step 5: Run the suites**

Run (in `websites/www.cs`): `(cd games/tankity && php tools/install-files.php --check && node --test test/smoke.test.mjs) && vendor/bin/phpunit --testsuite tankity`
Expected: PASS, 11 `BoardTest` cases; the smoke test's `blocked-parity` finds the same list in `src/initials.ts` and `server/guard.php`.

- [ ] **Step 6: Commit**

```bash
git add games/tankity/server games/tankity/rooms.php games/tankity/tools/install-files.php games/tankity/test/php/BoardTest.php games/tankity/test/smoke.test.mjs
git commit -F- <<'MSG'
Tankity: one all-time board; old callsign files convert on first load

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb
MSG
```

### Task 11: Rooms file every human's score on the board

**Files:**
- Modify: `games/tankity/server/rules.php` (`room_end_round`; replace `room_save_score` with `room_file_seat`)
- Modify: `games/tankity/server/settings.php` (delete `room_scores_dir`, now `board_dir`)
- Modify: `games/tankity/server/protocol.php` (`you.filed`, `you.filedRank`)
- Modify: `games/tankity/src/protocol.ts` (`RoomYou`)
- Regenerate: `games/tankity/protocol/*.json`
- Create: `games/tankity/test/php/RoomFilingTest.php`

**Interfaces:**
- Consumes: Task 10 `board_file`; Task 8 winner.
- Produces: `room_file_seat(array &$room, int $seat): void` (files once per match, `room['filed'][seat] = ?int rank`); snapshot `you.filed: boolean`, `you.filedRank: number | null`.

- [ ] **Step 1: Write the failing test**

```php
<?php
// games/tankity/test/php/RoomFilingTest.php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

/* The server files every room score itself: an eliminated human when the last
   life goes, the winner with the bonus when the match ends, each once. */
final class RoomFilingTest extends TestCase
{
    private string $dir;

    public static function setUpBeforeClass(): void
    {
        require_once __DIR__ . '/rooms-lib.php';
    }

    protected function setUp(): void
    {
        $this->dir = sys_get_temp_dir() . '/tankity-roomfile-' . bin2hex(random_bytes(4));
        mkdir($this->dir);
        putenv('TANKITY_SCORES_DIR=' . $this->dir);
    }

    protected function tearDown(): void
    {
        putenv('TANKITY_SCORES_DIR');
        array_map('unlink', glob($this->dir . '/*') ?: []);
        rmdir($this->dir);
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
        $top = board_top(10);
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
        $this->assertCount(2, board_top(10));
    }

    public function testInitialsAreFiledUppercase(): void
    {
        $room = $this->duel();
        $room['seats'][1]['initials'] = 'out';
        $events = [];
        room_end_round($room, $events);
        $this->assertContains('OUT', array_column(board_top(10), 'initials'));
    }
}
```

- [ ] **Step 2: Run it to see it fail**

Run (in `websites/www.cs`): `vendor/bin/phpunit --testsuite tankity --filter RoomFilingTest`
Expected: FAIL, `Call to undefined function room_file_seat()`.

- [ ] **Step 3: Implement**

Replace `room_save_score()` in `server/rules.php` (the whole function, current lines 618–657) with:

```php
/* Files a human seat's match score on the all-time board, once per match. */
function room_file_seat(array &$room, int $seat): void
{
    if (array_key_exists($seat, $room['filed'] ?? [])) {
        return;
    }
    $s = $room['seats'][$seat] ?? [];
    try {
        $rank = board_file(['initials' => strtoupper((string) ($s['initials'] ?? 'AAA')), 'score' => (int) ($room['scores'][$seat] ?? 0),
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

Delete `room_scores_dir()` and its comment from `server/settings.php` (current lines 44–54).

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
Expected: PASS. (The docker suite's room checks write to the board in the container's `/var/tmp`, as the old per-callsign files did.)

- [ ] **Step 5: Commit**

```bash
git add games/tankity/server games/tankity/src/protocol.ts games/tankity/protocol games/tankity/test/php/RoomFilingTest.php games/tankity/dist
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
- Produces: `fmt(n: number): string` ("8,420"); `BOARD_KEEP = 100`; `filedLine(rank: number | null, score: number): string`; `interface SoloRound { round: number; won: boolean; points: number; kills: number; cash: number; lives: number }`; `interface BoardRow { place: number; name: string; you: boolean; crown: boolean; out: boolean; score: number; gain: string; won: number; kills: number; last: string }`; `type Board = { kind: 'room'; caption: string; title: string; lastHead: 'Lives' | 'Out in'; rows: BoardRow[] } | { kind: 'solo'; caption: string; title: string; rows: SoloRound[]; total: { points: number; kills: number } }`; `type RoomCard = 'shop' | 'over' | 'out' | 'peek'`; `roomBoard(room: Pick<RoomSnapshot, 'code' | 'round' | 'seats' | 'winner'>, mySeat: number, card: RoomCard, roundTo: string): Board`; `soloBoard(rounds: readonly SoloRound[], card: 'shop' | 'over'): Board`.

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
  assert.equal(filedLine(12, 9210), 'Filed · #12 all-time');
  assert.equal(filedLine(null, 40), `Filed · 40 pts, outside the all-time top ${BOARD_KEEP}`);
});
```

Run (in `games/tankity`): `node --test test/standings.test.mjs`
Expected: FAIL, `roomBoard` is not exported.

- [ ] **Step 2: Implement**

Append to `src/standings.ts` (and add `RoomSnapshot` to the type import):

```ts
/** "8,420". */
export function fmt(n: number): string {
  return Math.round(n).toLocaleString('en-US');
}

/** server/board.php BOARD_KEEP: the runs the all-time board keeps. */
export const BOARD_KEEP = 100;

export function filedLine(rank: number | null, score: number): string {
  return rank !== null ? `Filed · #${rank} all-time` : `Filed · ${fmt(score)} pts, outside the all-time top ${BOARD_KEEP}`;
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
- Produces: `EndVeilProps = { keyHint; kicker; title; text; score; board: Board | null; filed: string | null; buttons: 'solo' | 'over' | 'out' | 'peek'; onAgain(): void; onLeave(): void; onWatch(): void }`; ids `#again` (solo: "Continue", back to the title card; over: "Play again (same room)"), `#end-leave` (over, out, peek: "Leave room"), `#end-watch` (out: "Watch the finish", peek: "Back to the battle"), `#end-filed`. `EndState = { kicker; title; text; score; board: Board | null; filed: string | null; buttons: EndVeilProps['buttons'] }`. `MatchDeps` loses `fileReport`, `savedCallsign`, `netRematch`, `openLobby`; gains `netAgain(): void`, `fileSolo(run: { initials: string; score: number; banked: number; seed: string }, done: (line: string) => void): void`, `initials(): string`.

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
  fileSolo(run: { initials: string; score: number; banked: number; seed: string }, done: (line: string) => void): void;
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
      fileSolo({ initials: initials(), score: G.score, banked: G.roundsWon, seed: G.seed }, line => {
        END.filed = line;
        renderEndVeil();
      });
    }
```

In `main.ts`'s `createMatch({...})` call, remove `fileReport, savedCallsign, ` and add `netAgain: () => {}, initials: getInitials, fileSolo: (_r, done) => done(''),` (`getInitials` is Plan C Task 13's, in `main.ts`); Task 18 replaces `netAgain` and Task 19 replaces `fileSolo`, so the build type-checks after every task.

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
    END.filed = room.you && room.you.filed ? filedLine(room.you.filedRank, room.you.score || 0) : null;
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

### Task 19: Solo runs file themselves; Scores shows the board with yours marked

**Files:**
- Modify: `games/tankity/scores.php` (rewrite: board GET, initials-checked POST)
- Modify: `games/tankity/src/scores.ts` (rewrite)
- Modify: `games/tankity/src/ui/scores.tsx` (rows marked, no form)
- Modify: `games/tankity/src/lobby.ts` (drop `SCORES`/`renderScoresOverlay` deps)
- Modify: `games/tankity/src/main.ts` (`createScores`, `createMatch`, `createLobby` wiring)
- Create: `games/tankity/test/scores-ui.test.mjs`
- Modify: `games/tankity/test/ui.test.mjs` (delete the scores block), `games/tankity/test/smoke.test.mjs` (form checks)

**Interfaces:**
- Consumes: Task 10 board, `tankity_guard()` and `tankity_initials()`; Plan C Task 13's `getInitials` (in `main.ts`).
- Produces: `scores.php` GET `{ scores: { place, initials, score, rounds, seed, at }[], keep }`; POST `{ initials, score, banked, seed }` → `{ ok, score, rank }`. `createScores({ $, keyHint, say, toggleOverlay, initials })` → `{ SCORES, renderScoresOverlay, loadScores, fileSolo }`. `ScoresProps = { keyHint; onClose; rows: { text: string; mine: boolean }[] | null; note: string }`.

- [ ] **Step 1: The endpoint**

Replace `games/tankity/scores.php` with:

```php
<?php
// Operation Tankity: the all-time board over HTTP. GET answers the best runs;
// POST {initials, score, banked, seed} files a finished solo run. Rooms file
// their own scores on the server. The board itself is server/board.php.
declare(strict_types=1);

// A JSON API must never leak diagnostics into its output.
ini_set('display_errors', '0');

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/server/guard.php';
require_once __DIR__ . '/server/board.php';

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
    if ($method === 'GET') {
        json_out(200, ['scores' => board_top(BOARD_SHOW), 'keep' => BOARD_KEEP]);
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
        $score = $in['score'] ?? null;
        $banked = $in['banked'] ?? null;
        if (!is_int($score) || $score < 0 || $score > 999999 || !is_int($banked) || $banked < 0 || $banked > 999) {
            json_out(422, ['error' => 'invalid run (score 0-999999, banked 0-999)']);
        }
        $rank = board_file(['initials' => $initials, 'score' => $score, 'rounds' => $banked, 'seed' => (string) ($in['seed'] ?? '')]);
        json_out(200, ['ok' => true, 'score' => $score, 'rank' => $rank]);
    }
    json_out(405, ['error' => 'method not allowed']);
} catch (Throwable $e) {
    error_log('tankity scores.php: ' . $e->getMessage());
    json_out(500, ['error' => 'store unavailable']);
}
```

- [ ] **Step 2: The client**

Replace `src/scores.ts` with:

```ts
/* Operation Tankity: the high scores.
 *
 * The all-time board from scores.php with this player's rows marked, and a
 * finished solo run filed the moment it ends. When the server is out of reach
 * the board falls back to this browser's own rows. The page arrives as deps. */
import { browserStorage } from '../../_kit/ports.browser.ts';
import { json, pref } from '../../_kit/prefs.ts';
import { isScoreRows, type ScoreEntry } from './score-rows.ts';
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
}

export interface SoloRun { initials: string; score: number; banked: number; seed: string }

export function createScores(deps: ScoresDeps) {
  const { $, keyHint, say, toggleOverlay, initials } = deps;
  const localRows = pref<ScoreEntry[]>('tankity-local', [], json(isScoreRows), browserStorage());

  const SCORES: { rows: { text: string; mine: boolean }[] | null; note: string } = { rows: null, note: '' };
  function renderScoresOverlay(): void {
    const section = $('report-overlay');
    if (!section) return;
    drawScores(section, { keyHint, onClose: () => toggleOverlay('report-overlay', 'scores-open'), rows: SCORES.rows, note: SCORES.note });
  }
  async function loadScores(): Promise<void> {
    const me = initials();
    try {
      const res = await fetch('scores.php', { headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error('http ' + res.status);
      const data = (await res.json()) as { scores?: BoardRow[] };
      SCORES.rows = (data.scores || []).map(r => ({
        text: `#${r.place} ${r.initials} · ${fmt(r.score)} pts · ${r.rounds} rounds won`, mine: r.initials === me,
      }));
      SCORES.note = 'The all-time board. Your runs are marked.';
    } catch (_) {
      SCORES.rows = localRows.get().map((r, i) => ({ text: `#${i + 1} ${r.name} · ${fmt(r.score)} pts · ${r.banked} rounds won`, mine: r.name === me }));
      SCORES.note = 'The score server is out of reach: these are this browser\'s runs only.';
    }
    renderScoresOverlay();
  }
  function saveLocal(entry: ScoreEntry): void {
    localRows.set([...localRows.get(), entry].sort((a, b) => b.score - a.score).slice(0, 10));
  }
  /* Files a finished solo run; `done` gets the line the end card shows. */
  async function fileSolo(run: SoloRun, done: (line: string) => void): Promise<void> {
    try {
      const res = await fetch('scores.php', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(run),
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; score?: number; rank?: number | null; error?: string } | null;
      if (!res.ok || !data || !data.ok) throw new Error((data && data.error) || 'http ' + res.status);
      done(filedLine(data.rank ?? null, data.score ?? run.score));
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

`src/ui/scores.tsx`: delete the form, `formHidden`, `onFile`, the `useRef` for the form/name and their imports; `ScoresProps.rows` becomes `{ text: string; mine: boolean }[] | null`; the list renders `p.rows.map((r, i) => <li key={i} class={r.mine ? 'mine' : undefined}>{r.text}{r.mine && <span class="sr-only"> (yours)</span>}</li>)`; `useScrollKeep(() => document.getElementById('scores')?.parentElement)`. Header comment: "The scores overlay: the all-time board, best first, with this player's runs marked, and where the list came from." Add to `game.css`: `#scores li.mine { color: var(--gold, #ffc93c); font-weight: 700; }`.

`src/lobby.ts`: delete `SCORES.formHidden = false;` + `renderScoresOverlay();` in `netLeave()` and `SCORES.formHidden = true;` + `renderScoresOverlay();` in `startNetMatch()`; remove `SCORES` and `renderScoresOverlay` from `LobbyDeps` and the destructuring.

`src/main.ts`: `const { SCORES, renderScoresOverlay, loadScores, fileSolo } = createScores({ $, keyHint, say, toggleOverlay, initials: getInitials });` (`getInitials` is main.ts's own, from Plan C Task 13: `const getInitials = (): string => savedInitials.get();` over `initialsPref(browserStorage(), Math.random)`; `src/initials.ts` exports no `getInitials`); in the `createMatch` call replace Task 17's `fileSolo: (_r, done) => done('')` with `fileSolo: (run, done) => { void fileSolo(run, done); }` (`initials: getInitials` stays); `createLobby` loses `SCORES, renderScoresOverlay`.

- [ ] **Step 3: Tests that read the old form**

The scores overlay's tests move to their own node:test file. `test/scores-ui.test.mjs`:

```js
// games/tankity/test/scores-ui.test.mjs
// The scores overlay (src/ui/scores.tsx): the all-time board with the
// player's own runs marked, and no form.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { document, makeEl } from '../../_kit/test/dom-stub.mjs';
import { importTsx } from '../../_kit/test/tsx.ts';

globalThis.document = document;
const { scores } = await importTsx(import.meta.dirname, { scores: '../src/ui/scores.tsx' });
const walk = (el, out = []) => { for (const c of el.children || []) { if (c.nodeType === 1) { out.push(c); walk(c, out); } } return out; };
const byId = (el, id) => walk(el).find(n => n.id === id);
const hasClass = (el, name) => String(el.className || '').split(' ').includes(name);

test('the board lists every row, marks the player\'s own, and has no form', () => {
  const section = makeEl('report-overlay');
  scores.renderScores(section, { keyHint: () => '', onClose() {}, note: 'The all-time board.',
    rows: [{ text: '#1 WGR · 9,000 pts · 4 rounds won', mine: false }, { text: '#2 ABC · 8,000 pts · 3 rounds won', mine: true }] });
  assert.equal(byId(section, 'score-form'), undefined);
  const items = walk(byId(section, 'scores')).filter(n => n.localName === 'li');
  assert.equal(items.length, 2);
  assert.ok(!hasClass(items[0], 'mine'));
  assert.ok(hasClass(items[1], 'mine'));
  assert.match(items[1].textContent, /\(yours\)$/);
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
Expected: PASS, `scores-ui.test.mjs` included.

- [ ] **Step 5: Commit**

```bash
git add games/tankity/scores.php games/tankity/src games/tankity/game.css games/tankity/test games/tankity/dist
git commit -F- <<'MSG'
Tankity: solo runs file themselves; Scores shows the all-time board, yours marked

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb
MSG
```

### Task 20: Browser spec, docs, PR 15

**Files:**
- Modify: `tests/e2e/tankity-end.spec.mjs`
- Modify: `games/tankity/README.md` (Files table rows for `standings.ts`, `ui/standings.tsx`, `server/board.php`, `server/guard.php`; new section "Match end and scoreboards"; Tests table)

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
| `server/guard.php` | Tankity's settings for the kit's `Kit\ScoreGuard` (`tankity_guard()`, `tankity_initials()`), and `BLOCKED_INITIALS` (the same list as `src/initials.ts`) |
| `server/score-guard.php` | The kit's score guard, a generated copy written by `tools/install-files.php` (`kit_php`); never edit it |
| `server/board.php` | The all-time board: one file of the best 100 runs (`board_file`, `board_top`), and the one-time conversion of the old per-callsign files |
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
The all-time board keeps the best 100 runs (`server/board.php`); Menu → Scores
shows the top 20 with the player's own runs marked, and an end card says
"Filed · #12 all-time" when a run places.
```

In the Tests table add `RoomMatchEndTest`, `RoomStandingsTest`, `RoomFilingTest`, `RoomAgainTest`, `BoardTest` with a one-line description each, and `test/standings.test.mjs`.

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
gh pr create --title "Tankity: last human standing, scoreboards, Play again, auto-filed scores" --body "Spec row 15 (sections 7.2, 7.3; auto-filing from 8). Board conversion lands here because the board replaces the old files the moment it ships.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb"
```

This PR needs Plan C's PR 10 (the score guard and `kit_php`) and PR 12 (initials, the title card) on `main`; if `main` moved, rebase and rebuild the generated files (Global Constraints). Run the pr-fix loop, gate on required checks as in PR 14, merge on green, `make deploy`, and check live: open Menu → Scores on `/play/tankity/?v=<sha>` and see the converted board. Report the cache-busted link.

---

# PR 16: score integrity — guard, solo replay, initials

Branch `games/tankity-score-integrity`, worktree `.claude/worktrees/tankity-score-integrity`, off `main` after PR 15 merged.

### Task 21: Determinism audit: every number the replay depends on

**Files:**
- Modify: `games/tankity/src/sim.ts` (`rad`, `dist`, `powi`; `muzzle`, `fireWeapon`, `simShot`, `inHitBox`, `steerShell`, `splitShell`, `sweepHit`, `rollHit`, `explode`, `stepShells`)
- Modify: `games/tankity/src/ai.ts` (`aiChoose`'s bracket shrink)
- Modify: `games/tankity/server/sim.php` (`room_dist`, `room_powi`; `room_seek_push`, `room_split_vel`, `room_explode`, `room_in_box`, `room_sweep_hit`, `room_roll_hit`, `room_fly_arc`)
- Modify: `games/tankity/server/ai.php` (`room_ai_choose`'s bracket shrink)
- Modify: `games/tankity/protocol/sim-vectors.php` (drop two known cases; add a lance bracket case)
- Create: `games/tankity/test/determinism.test.mjs`
- Modify: `games/tankity/README.md` (new section "Solo replay determinism")

**Interfaces:**
- Consumes: the difficulty PR's `DIFFICULTY`, `DIFFICULTIES` and `aimSkill()` (`src/ai.ts`) and `ROOM_DIFFICULTY` / `room_difficulty()` (`server/ai.php`).
- Produces: `rad(deg: number): number` (`(deg / 180) * Math.PI`, PHP `deg2rad`'s order); `dist(dx: number, dy: number): number` (`Math.sqrt(dx*dx + dy*dy)`); `powi(b: number, n: number): number` (b multiplied n times); PHP `room_dist(float $dx, float $dy): float`, `room_powi(float $b, int $n): float`.

The audit, done before this task's code (the executor re-verifies each line against the source):

| Where | What the replay depends on | Same on both sides? | Action |
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
| `sin`/`cos`/`atan2` (terrain, launch, cluster fan) | V8 fdlibm vs the host's libm | may differ by one ulp | accepted: a one-ulp drift flips a hit or a rounding only at an exact boundary (≈1e-13 per test); measured by the nightly replay sweep (Task 30) |
| shells flying a full 12 s | TS `life -= dt` (float) vs PHP 720 steps | can differ on the very last step | accepted: no weapon stays airborne 12 s on a 720×460 field |
| volley order | TS flies all pellets/bomblets together, holding a later burst until earlier ones land; PHP resolves them one by one | same outcome, pinned by every `volley` vector | none |
| tank falls | TS drops tanks over craters between frames, including mid-volley; PHP snaps after the volley | differs mid-volley | the browser stops falls while shells fly (Task 23) and snaps at settle (Task 22) |
| frame `dt` | TS flies shells by the frame's `dt` | the replay cannot know it | fixed 1/60 s steps (Task 23) |
| `Math.random` | banter, sparks, the default seed | cosmetic or sent in the log | none (and `test/determinism.test.mjs` forbids it in the rule modules) |
| drone aim by difficulty | `DIFFICULTY` / `aimSkill(world.difficulty)` in `ai.ts` vs `ROOM_DIFFICULTY` / `room_difficulty($room)` in `ai.php`: the ranging wobble `max(wobFloor, wobStart - wobStep × round)`, the correction share, the bracket's shrink, floor and cap | the same seven numbers per level, and an unknown word is `normal` on both; pinned by the difficulty PR's per-level aim and bracket vectors | the move log carries the match's difficulty (Task 25) and the replay deals with it (Tasks 28–29); `determinism.test.mjs` compares the two tables number by number |
| bracket shrink `brkShrink ** n` | `Math.pow` vs PHP's `**` (C `pow`) with an integer exponent | may differ in the last bit | both sides multiply n times (`powi()` / `room_powi()`) |
| arsenal | the browser plays `game.json`'s, or the baked fallback if it failed to load | the server reads `game.json` | a run on the fallback is not logged (Task 25) |
| seeds | `charCodeAt` (UTF-16) vs `ord` (bytes) | differ beyond ASCII | only printable-ASCII seeds are logged (Task 25) |

- [ ] **Step 1: Write the failing guard test**

```js
// games/tankity/test/determinism.test.mjs
// The rule modules the solo replay depends on must compute the same numbers in
// the browser and on the server: no wall clock, no Math.random, no Math.hypot,
// no powers, no degree conversion other than rad(). See README "Solo replay
// determinism".
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
/* Degrees to radians in PHP deg2rad()'s order, (deg / 180) * PI, so the replay
   and the browser agree to the last bit. */
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
## Solo replay determinism

A solo score is earned by the server replaying the move log with the PHP sim
(`server/solo.php` over `server/sim.php`, `ai.php`, `rules.php`), so every
number the outcome depends on must come out the same in the browser and on
the server:

- the drones aim from one table per difficulty (`DIFFICULTY` in `src/ai.ts`,
  `ROOM_DIFFICULTY` in `server/ai.php`, the same numbers); the move log carries
  the match's difficulty, so the replay's drones aim as the browser's did;
- one random stream per match (`hashSeed(seed)` → `mulberry32`), drawn in the
  same order: the deal's hills and clouds, then per round hills and clouds,
  wind, spawn spots and new drones' strategies, every drone choice, and the
  wind shift after every settled volley;
- shells fly in fixed 1/60 s steps whatever the frame rate, and tanks do not
  fall while shells are in the air (both sides settle them after the volley);
- no `Math.hypot`/`hypot()`, powers or other last-bit-sensitive helpers in the
  rule modules: distances are `dist()`/`room_dist()`, whole powers are
  `powi()`/`room_powi()`, degrees go through
  `rad()` in PHP `deg2rad`'s order, and JavaScript's `Math.round` is
  `js_round()` in PHP where a value can be a negative half;
- `sin`, `cos` and `atan2` remain; a last-bit difference there changes an
  outcome only at an exact boundary, and the nightly replay sweep measures it.

`test/determinism.test.mjs` keeps the banned calls out; the sim vectors and
`protocol/solo-runs.json` keep the two sides agreeing.
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
 * them headless; server/solo.php is the same rules for the replay. Nothing here
 * reads a clock or Math.random. */
import { aiChoose, pickTactic } from './ai.ts';
import type { AimChoice } from './ai.ts';
import { carryArmor, maxArmor } from './armor.ts';
import { WATCH_TURNS } from './flow.ts';
import { TUNE, W, clamp, droneRack, gauss, genTerrain, hashSeed, mulberry32, spawnSpots, surfY } from './sim.ts';
import type { Arsenal, Cloud, Difficulty, Tank, World } from './sim.ts';

/** Every war step is this long, in the browser and in the replay. */
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

/** Standing tanks sit on the ground, as the server leaves them after a volley. */
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

### Task 23: Fixed-step war; tanks hold still while shells fly

Open question: **Decision needed (William) #2** (header). Holding tanks still while shells fly is a gameplay change the spec does not contain; this task is written as kept, and is dropped or kept (with a spec amendment) by that answer. The fixed 1/60 s step is needed either way.

**Files:**
- Modify: `games/tankity/src/flow.ts` (`runWar` → `runFixed`, `MAX_STEPS`)
- Modify: `games/tankity/src/main.ts` (`frame`)
- Create: `games/tankity/test/fixed-step.test.mjs`
- Modify: `games/tankity/test/flow.test.mjs` (delete its `runWar` checks and import)

**Interfaces:**
- Consumes: `SOLO_STEP`.
- Produces: `MAX_STEPS = 30`; `runFixed(acc: number, dt: number, h: number, step: (h: number) => boolean): number` (returns the carried remainder).

- [ ] **Step 1: Write the failing test**

```js
// games/tankity/test/fixed-step.test.mjs
// The solo war runs in fixed SOLO_STEP steps whatever the frame lengths, so the
// server's replay flies every shell exactly as the browser did.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runFixed, MAX_STEPS } from '../src/flow.ts';
import { SOLO_STEP } from '../src/solo.ts';
import { mulberry32 } from '../src/sim.ts';

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
 * step size never varies, so a replay that knows only the moves lands every
 * shell where the browser did. A step answering false (the phase left
 * think/fly/settle) drops the rest of the frame. */
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
  // Tanks hold still while shells fly: the server resolves a volley against the
  // units as they stood when it fired, and settles them after.
  if (!G.shells.length) fallTanks(dt);
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
  } else if (G.phase === 'think' || G.phase === 'fly' || G.phase === 'settle') {
    // Fixed SOLO_STEP steps whatever the frame rate (the replay depends on it);
    // with the player's tank wrecked the drones play on at triple speed.
    warAcc = runFixed(warAcc, dt * warSpeed(me().hp > 0, G.demo), SOLO_STEP, d => {
      if (!G.shells.length) fallTanks(d);
      stepWar(d);
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
Expected: 1 passed (drone turns still play and settle).

- [ ] **Step 5: Commit**

```bash
git add games/tankity/src games/tankity/test/fixed-step.test.mjs games/tankity/test/flow.test.mjs games/tankity/dist
git commit -F- <<'MSG'
Tankity solo: the war runs in fixed 1/60 s steps; tanks hold still mid-volley

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

### Task 25: The move log, recorded as the player plays

**Files:**
- Create: `games/tankity/src/solo-log.ts`
- Create: `games/tankity/test/solo-log.test.mjs`
- Modify: `games/tankity/src/game-types.ts` (`GameState.log`, `Tables.fromFile`)
- Modify: `games/tankity/src/main.ts` (`G.log`, `tables.fromFile`, `applyArsenal`)
- Modify: `games/tankity/src/match.ts` (`newMatch`, `startDemo`, `playerFire`, `nextRound`)
- Modify: `games/tankity/src/shop.ts` (`buyItem`)
- Modify: `games/tankity/tsconfig.json`

**Interfaces:**
- Produces: `type SoloMove = { k: 'buy'; i: string; q: number } | { k: 'next' } | { k: 'fire'; w: string; a: number; p: number; x: number }`; `interface SoloLog { v: 1; seed: string; difficulty: Difficulty; moves: SoloMove[] }` (the drones' aim the match was dealt; the replay deals at it); `LOG_MAX_MOVES = 20000`; `newLog(seed: string, difficulty: Difficulty): SoloLog`; `logBuy(log: SoloLog, row: ShopRow, qty: number): void`; `logNext(log: SoloLog): void`; `logFire(log: SoloLog, t: Pick<Tank, 'x' | 'angle' | 'power'>, w: string): void`; `isSoloLog(v: unknown): v is SoloLog`; `replayableSeed(seed: string): boolean`. `GameState.log: SoloLog | null`; `Tables.fromFile: boolean`.

- [ ] **Step 1: Failing test**

```js
// games/tankity/test/solo-log.test.mjs
// The solo move log (src/solo-log.ts): what the server replays.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newLog, logBuy, logNext, logFire, isSoloLog, replayableSeed, LOG_MAX_MOVES } from '../src/solo-log.ts';

test('moves are recorded with exact numbers and survive JSON', () => {
  const log = newLog('scorched-1234', 'hard');
  logBuy(log, { kind: 'ammo', w: 'mortar', n: 2 }, 3);
  logBuy(log, { kind: 'gear', g: 'repair', n: 40 }, 1);
  logNext(log);
  logFire(log, { x: 211.38333333333335, angle: 47.016666666666666, power: 63.5 }, 'mortar');
  const back = JSON.parse(JSON.stringify(log));
  assert.deepEqual(back, log);
  assert.equal(back.difficulty, 'hard');
  assert.deepEqual(back.moves, [
    { k: 'buy', i: 'mortar', q: 3 }, { k: 'buy', i: 'repair', q: 1 }, { k: 'next' },
    { k: 'fire', w: 'mortar', a: 47.016666666666666, p: 63.5, x: 211.38333333333335 },
  ]);
  assert.ok(isSoloLog(back));
});

test('the validator refuses anything else', () => {
  assert.ok(!isSoloLog(null));
  assert.ok(!isSoloLog({ v: 2, seed: 's', difficulty: 'normal', moves: [] }));
  assert.ok(!isSoloLog({ v: 1, seed: 's', difficulty: 'normal', moves: [{ k: 'fire', w: 'shell', a: '1', p: 1, x: 1 }] }));
  assert.ok(!isSoloLog({ v: 1, seed: 's', difficulty: 'normal', moves: [{ k: 'warp' }] }));
  assert.ok(!isSoloLog({ v: 1, seed: 's', moves: [] }), 'no difficulty');
  assert.ok(!isSoloLog({ v: 1, seed: 's', difficulty: 'brutal', moves: [] }), 'not a difficulty');
});

test('only printable-ASCII seeds replay the same in PHP', () => {
  assert.ok(replayableSeed('scorched-1234'));
  assert.ok(!replayableSeed('héllo'));
  assert.ok(!replayableSeed(''));
  assert.ok(!replayableSeed('x'.repeat(65)));
});

test('a log stops growing at its cap', () => {
  const log = newLog('s', 'normal');
  for (let i = 0; i < LOG_MAX_MOVES + 5; i++) logNext(log);
  assert.equal(log.moves.length, LOG_MAX_MOVES);
});
```

Run (in `games/tankity`): `node --test test/solo-log.test.mjs`
Expected: FAIL, module not found.

- [ ] **Step 2: The module**

```ts
// games/tankity/src/solo-log.ts
/* Operation Tankity: a solo match's move log.
 *
 * Everything the server needs to replay a solo run: the seed, the drones'
 * difficulty, each shop purchase, leaving the shop, and each shot (gun, angle,
 * power, and where the tank had driven to). Numbers are the browser's own: JSON
 * carries a double exactly, so the replay starts from the very same values. */
import { isDifficulty } from './difficulty.ts';
import type { Difficulty, ShopRow, Tank } from './sim.ts';

export type SoloMove =
  | { k: 'buy'; i: string; q: number }
  | { k: 'next' }
  | { k: 'fire'; w: string; a: number; p: number; x: number };
export interface SoloLog { v: 1; seed: string; difficulty: Difficulty; moves: SoloMove[] }

/** server/solo.php SOLO_MAX_MOVES: a log past this is refused, so it stops growing here. */
export const LOG_MAX_MOVES = 20000;

export function newLog(seed: string, difficulty: Difficulty): SoloLog {
  return { v: 1, seed, difficulty, moves: [] };
}
function push(log: SoloLog, m: SoloMove): void {
  if (log.moves.length < LOG_MAX_MOVES) log.moves.push(m);
}
export function logBuy(log: SoloLog, row: Pick<ShopRow, 'kind' | 'w' | 'g'>, qty: number): void {
  push(log, { k: 'buy', i: (row.kind === 'ammo' ? row.w : row.g)!, q: qty });
}
export function logNext(log: SoloLog): void {
  push(log, { k: 'next' });
}
export function logFire(log: SoloLog, t: Pick<Tank, 'x' | 'angle' | 'power'>, w: string): void {
  push(log, { k: 'fire', w, a: t.angle, p: t.power, x: t.x });
}

const num = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
function isMove(m: unknown): m is SoloMove {
  if (!m || typeof m !== 'object') return false;
  const o = m as Record<string, unknown>;
  if (o['k'] === 'next') return true;
  if (o['k'] === 'buy') return typeof o['i'] === 'string' && num(o['q']);
  if (o['k'] === 'fire') return typeof o['w'] === 'string' && num(o['a']) && num(o['p']) && num(o['x']);
  return false;
}
export function isSoloLog(v: unknown): v is SoloLog {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  return o['v'] === 1 && typeof o['seed'] === 'string' && isDifficulty(o['difficulty'])
    && Array.isArray(o['moves']) && o['moves'].every(isMove);
}

/** PHP hashes a seed's bytes and the browser its UTF-16 units: only printable
 * ASCII hashes the same on both. */
export function replayableSeed(seed: string): boolean {
  return /^[\x20-\x7e]{1,64}$/.test(seed);
}
```

Add `"src/solo-log.ts"` to `tsconfig.json` `files`.

- [ ] **Step 3: Record as the player plays**

`src/game-types.ts`: `GameState` gains `log: SoloLog | null; // this solo match's move log; null in the demo, rooms, and runs that cannot be replayed` (import the type); `Tables` gains `/** The arsenal came from game.json (the server's), not the baked fallback. */ readonly fromFile: boolean;`.

`src/main.ts`: `G` init adds `log: null,`; add `let ARSENAL_FROM_FILE = false;` beside `ARSENAL_REV`; in `applyArsenal()` inside the success branch add `ARSENAL_FROM_FILE = true; G.log = null; // a mid-match change of arsenal cannot be replayed`; `tables` gains `get fromFile() { return ARSENAL_FROM_FILE; },`.

`src/match.ts` (import `{ logFire, logNext, newLog, replayableSeed }`): in `newMatch()` after `resetMatch(seedStr);`:

```ts
    // The server replays this log to file the run; one it could not replay is not kept.
    G.log = tables.fromFile && replayableSeed(G.seed) ? newLog(G.seed, G.difficulty) : null;
    if (!G.log) say(replayableSeed(G.seed)
      ? 'The game data did not load, so this run cannot be filed.'
      : 'This seed has characters the score server cannot replay, so this run will not be filed.', 'info');
```

In `startDemo()` after `resetMatch('scorched-demo');` add `G.log = null;`. In `playerFire()` change `if (fireWeapon(me(), G.selected)) {` to:

```ts
    const wkey = G.selected;
    if (fireWeapon(me(), wkey)) {
      if (G.log) logFire(G.log, me(), wkey);
```

(the `say` line then uses `wkey`). In `nextRound()` before `G.round += 1;` add `if (G.log) logNext(G.log);`.

`src/shop.ts` (`import { logBuy } from './solo-log.ts';`): in `buyItem()` after `sfx.play('cash');` add `if (G.log) logBuy(G.log, it, r.qty);`.

- [ ] **Step 4: Run**

Run (in `games/tankity`): `node ../_kit/build/build.mjs tankity && node --test 'test/*.test.mjs'`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add games/tankity/src games/tankity/test/solo-log.test.mjs games/tankity/tsconfig.json games/tankity/dist
git commit -F- <<'MSG'
Tankity solo: record the move log the server will replay

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb
MSG
```

### Task 26: Headless solo runs and a TypeScript replayer

**Files:**
- Create: `games/tankity/src/solo-play.ts`
- Create: `games/tankity/test/solo-play.test.mjs`
- Modify: `games/tankity/tsconfig.json`

**Interfaces:**
- Consumes: Tasks 22–25.
- Produces: `interface Bot { shop(G: SoloState, arsenal: Arsenal): { item: string; qty: number }[]; aim(G: SoloState, arsenal: Arsenal): { w: string; a: number; p: number; x: number } }`; `interface Played { log: SoloLog; score: number; roundsWon: number; rounds: number }`; `blankSolo(): SoloState`; `flyVolley(G: SoloState, arsenal: Arsenal): void`; `playSolo(seed: string, arsenal: Arsenal, bot: Bot, difficulty: Difficulty, maxRounds?: number): Played`; `replaySolo(log: SoloLog, arsenal: Arsenal, maxRounds?: number): { ok: true; score: number; roundsWon: number; rounds: number } | { ok: false; error: string }` (it deals at `log.difficulty`); `makeBot(seed: string, skill: number, untilRound: number): Bot`.

- [ ] **Step 1: Failing test**

```js
// games/tankity/test/solo-play.test.mjs
// Solo runs without a page: a bot plays the browser's rules, the move log
// replays to the same score, and a tampered log does not.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { buildArsenal, stepShells, fireWeapon } from '../src/sim.ts';
import { playSolo, replaySolo, makeBot, blankSolo } from '../src/solo-play.ts';
import { soloDeal, soloMuster, SOLO_STEP } from '../src/solo.ts';
import { runFixed } from '../src/flow.ts';

const GAME = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'game.json'), 'utf8'));
const arsenal = buildArsenal(GAME.arsenal);

test('a played run replays to the very same score, at every difficulty', () => {
  for (const [seed, skill, until, level] of [['t-1', 0, 99, 'easy'], ['t-2', 0.6, 99, 'normal'], ['t-3', 1, 4, 'hard']]) {
    const run = playSolo(seed, arsenal, makeBot(seed, skill, until), level);
    assert.equal(run.log.difficulty, level);
    const back = replaySolo(JSON.parse(JSON.stringify(run.log)), arsenal);
    assert.deepEqual(back, { ok: true, score: run.score, roundsWon: run.roundsWon, rounds: run.rounds }, seed);
  }
});

test('the same seed and bot play the same run', () => {
  const a = playSolo('same', arsenal, makeBot('same', 0.5, 99), 'normal');
  const b = playSolo('same', arsenal, makeBot('same', 0.5, 99), 'normal');
  assert.deepEqual(a, b);
});

test('a log replayed at another difficulty does not reach the same result', () => {
  const run = playSolo('level', arsenal, makeBot('level', 0.6, 99), 'easy');
  const back = replaySolo({ ...run.log, difficulty: 'hard' }, arsenal);
  assert.notDeepEqual(back, { ok: true, score: run.score, roundsWon: run.roundsWon, rounds: run.rounds });
});

test('a volley flown in jittered frames lands where fixed steps land it', () => {
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
      if (!G.shells.length) break;
      acc = runFixed(acc, dt, SOLO_STEP, h => { stepShells(G, arsenal, h); return G.shells.length > 0; });
    }
    return { hp: G.tanks.map(t => t.hp), terrain: G.terrain.slice(0) };
  };
  const steady = fly(Array(2000).fill(1 / 60));
  const r = [0.004, 0.05, 0.017, 0.033, 0.009];
  const jitter = fly(Array.from({ length: 4000 }, (_, i) => r[i % r.length]));
  assert.deepEqual(jitter, steady);
});

test('a tampered log does not replay', () => {
  const run = playSolo('tamper', arsenal, makeBot('tamper', 0.3, 99), 'normal');
  const unfinished = { ...run.log, moves: run.log.moves.slice(0, -1) };
  assert.deepEqual(replaySolo(unfinished, arsenal), { ok: false, error: 'unfinished' });
  const fire = run.log.moves.findIndex(m => m.k === 'fire');
  const wild = structuredClone(run.log);
  wild.moves[fire].a = 200;
  assert.equal(replaySolo(wild, arsenal).ok, false);
  const extra = { ...run.log, moves: [...run.log.moves, { k: 'next' }] };
  assert.deepEqual(replaySolo(extra, arsenal), { ok: false, error: 'moves after the end' });
});
```

Run (in `games/tankity`): `node --test test/solo-play.test.mjs`
Expected: FAIL, module not found.

- [ ] **Step 2: The module**

```ts
// games/tankity/src/solo-play.ts
/* Operation Tankity: solo matches without a page.
 *
 * playSolo() drives the browser's rules (solo.ts) and flight (sim.ts at
 * SOLO_STEP) with a bot; replaySolo() plays a move log back the way
 * server/solo.php does. tools/solo-runs.mjs records bot runs for the PHP replay
 * to match. Not part of the page bundle. */
import { clamp, facing, fireWeapon, hashSeed, muzzle, mulberry32, simShot, spotTaken, stepShells, surfY, W } from './sim.ts';
import type { Arsenal, Difficulty } from './sim.ts';
import { SOLO_STEP, soloAim, soloBuy, soloDeal, soloMuster, soloOneUps, soloSettle } from './solo.ts';
import type { Settled, SoloState, SoloTank } from './solo.ts';
import { logBuy, logFire, logNext, newLog, replayableSeed } from './solo-log.ts';
import type { SoloLog } from './solo-log.ts';

export interface Bot {
  shop(G: SoloState, arsenal: Arsenal): { item: string; qty: number }[];
  aim(G: SoloState, arsenal: Arsenal): { w: string; a: number; p: number; x: number };
}
export interface Played { log: SoloLog; score: number; roundsWon: number; rounds: number }

/** An empty state for soloDeal to fill. */
export function blankSolo(): SoloState {
  return { body: 'tank' } as SoloState;
}

/** Flies the volley in the air to its end, in the browser's fixed steps. */
export function flyVolley(G: SoloState, arsenal: Arsenal): void {
  for (let n = 0; G.shells.length && n < 100000; n++) stepShells(G, arsenal, SOLO_STEP);
}

function droneTurn(G: SoloState, arsenal: Arsenal, t: SoloTank): void {
  const plan = soloAim(G, arsenal, t);
  t.angle = plan.angle;
  t.power = plan.power;
  fireWeapon(G, arsenal, t, plan.wkey);
}

/** Drives the player's tank to x (paying fuel) and fires; an error when the move is not legal. */
function playerFire(G: SoloState, arsenal: Arsenal, m: { w: string; a: number; p: number; x: number }): string | null {
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

/** One volley's aftermath: flight, 1-ups, settling; 1-ups again once a round ends. */
function afterVolley(G: SoloState, arsenal: Arsenal): Settled {
  flyVolley(G, arsenal);
  soloOneUps(G);
  const end = soloSettle(G);
  if (end.kind === 'roundWon' || end.kind === 'tankLost') soloOneUps(G);
  return end;
}

export function playSolo(seed: string, arsenal: Arsenal, bot: Bot, difficulty: Difficulty, maxRounds = 60): Played {
  const G = blankSolo();
  soloDeal(G, arsenal, seed, difficulty);
  const log = newLog(seed, difficulty);
  for (;;) {
    for (const want of bot.shop(G, arsenal)) {
      const row = arsenal.shop.find(r => (r.kind === 'ammo' ? r.w : r.g) === want.item);
      if (!row) continue;
      const r = soloBuy(G, row, want.qty);
      if (r.ok) { logBuy(log, row, r.qty); soloOneUps(G); }
    }
    if (G.round >= maxRounds) throw new Error(`${seed}: still alive after ${maxRounds} rounds`);
    logNext(log);
    G.round += 1;
    soloMuster(G, arsenal);
    let end: Settled = { kind: 'next' };
    while (end.kind === 'next') {
      const t = G.tanks[G.turn]!;
      if (t.isPlayer) {
        const m = bot.aim(G, arsenal);
        const err = playerFire(G, arsenal, m);
        if (err) throw new Error(`${seed}: the bot made an illegal move (${err})`);
        logFire(log, G.tanks[0]!, m.w);
      } else droneTurn(G, arsenal, t);
      end = afterVolley(G, arsenal);
    }
    if (end.kind === 'matchLost') return { log, score: G.score, roundsWon: G.roundsWon, rounds: G.round };
  }
}

export function replaySolo(log: SoloLog, arsenal: Arsenal, maxRounds = 60):
  { ok: true; score: number; roundsWon: number; rounds: number } | { ok: false; error: string } {
  if (!replayableSeed(log.seed)) return { ok: false, error: 'bad seed' };
  const G = blankSolo();
  soloDeal(G, arsenal, log.seed, log.difficulty);
  const moves = log.moves;
  let i = 0;
  let shop = true;
  for (;;) {
    if (shop) {
      const m = moves[i++];
      if (!m) return { ok: false, error: 'unfinished' };
      if (m.k === 'buy') {
        const row = arsenal.shop.find(r => (r.kind === 'ammo' ? r.w : r.g) === m.i);
        if (!row || !soloBuy(G, row, m.q).ok) return { ok: false, error: 'bad buy' };
        soloOneUps(G);
        continue;
      }
      if (m.k !== 'next') return { ok: false, error: 'bad move' };
      if (G.round >= maxRounds) return { ok: false, error: 'too many rounds' };
      G.round += 1;
      soloMuster(G, arsenal);
      shop = false;
      continue;
    }
    const t = G.tanks[G.turn]!;
    if (t.isPlayer) {
      const m = moves[i++];
      if (!m) return { ok: false, error: 'unfinished' };
      if (m.k !== 'fire') return { ok: false, error: 'bad move' };
      const err = playerFire(G, arsenal, m);
      if (err) return { ok: false, error: err };
    } else droneTurn(G, arsenal, t);
    const end = afterVolley(G, arsenal);
    if (end.kind === 'matchLost') {
      if (i !== moves.length) return { ok: false, error: 'moves after the end' };
      return { ok: true, score: G.score, roundsWon: G.roundsWon, rounds: G.round };
    }
    if (end.kind !== 'next') shop = true;
  }
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
      const out: { item: string; qty: number }[] = [];
      for (let k = 0; k < 3 && rows.length; k++) {
        const row = rows[Math.floor(r() * rows.length)]!;
        if (r() < 0.6) out.push({ item: (row.kind === 'ammo' ? row.w : row.g)!, qty: 1 + Math.floor(r() * 2) });
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

Add `"src/solo-play.ts"` to `tsconfig.json` `files`.

- [ ] **Step 3: Run**

Run (in `games/tankity`): `node --test test/solo-play.test.mjs && node ../_kit/build/build.mjs tankity`
Expected: PASS (5 tests). If the jitter test fails, a war path still reads the frame's `dt`: fix the path, never the test.

- [ ] **Step 4: Commit**

```bash
git add games/tankity/src/solo-play.ts games/tankity/test/solo-play.test.mjs games/tankity/tsconfig.json
git commit -F- <<'MSG'
Tankity solo: headless runs, a bot, and a TypeScript replayer

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb
MSG
```

### Task 27: Recorded runs the PHP replay must match

**Files:**
- Create: `games/tankity/tools/solo-runs.mjs`
- Create: `games/tankity/protocol/solo-runs.json` (generated)
- Modify: `games/tankity/test.sh` (check), `websites/www.cs/Makefile` (`solo-runs` target and help line)

**Interfaces:**
- Consumes: Task 26 `playSolo`, `makeBot`.
- Produces: `protocol/solo-runs.json` = `{ about, runs: [{ name, skill, until, difficulty, log, score, roundsWon, rounds }] }`, with runs at each of `easy`, `normal` and `hard`; `node tools/solo-runs.mjs [--check]`.

- [ ] **Step 1: The tool**

```js
// games/tankity/tools/solo-runs.mjs
// Writes (or checks) protocol/solo-runs.json: solo runs a bot plays with the
// browser's rules, each with its move log and the score the browser reached.
// test/php/SoloReplayTest.php replays every log in PHP and must reach the same
// score, round count and rounds won.
//   node tools/solo-runs.mjs          rewrite solo-runs.json
//   node tools/solo-runs.mjs --check  exit 1 if it is stale
import fs from 'node:fs';
import path from 'node:path';
import { buildArsenal } from '../src/sim.ts';
import { makeBot, playSolo } from '../src/solo-play.ts';

const dir = path.join(import.meta.dirname, '..');
const arsenal = buildArsenal(JSON.parse(fs.readFileSync(path.join(dir, 'game.json'), 'utf8')).arsenal);
// name, bot skill, the round the bot stops aiming, the drones' difficulty.
// Every difficulty is played, so the PHP replay's drones are checked at each
// level's aim. The 'long' runs exist for the replay CPU budget
// (tools/replay-bench.php and the nightly).
const PLAN = [
  ['wild-1', 0, 0, 'easy'], ['wild-2', 0, 0, 'hard'], ['middling-1', 0.5, 99, 'easy'], ['middling-2', 0.5, 99, 'normal'],
  ['sharp-5', 1, 5, 'hard'], ['long-15', 1, 15, 'normal'], ['long-30', 1, 30, 'normal'],
];
const runs = PLAN.map(([name, skill, until, difficulty]) => {
  const run = playSolo(`runs-${name}`, arsenal, makeBot(`runs-${name}`, skill, until), difficulty);
  return { name, skill, until, difficulty, ...run };
});
const text = JSON.stringify({
  about: 'Solo runs played by node tools/solo-runs.mjs with the browser rules; SoloReplayTest replays each in PHP. Do not edit by hand.',
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
  for (const r of runs) console.log(`  ${r.name.padEnd(12)} ${r.difficulty.padEnd(6)} ${String(r.rounds).padStart(3)} rounds  ${r.score} pts  ${r.log.moves.length} moves`);
}
```

- [ ] **Step 2: Generate and wire**

Run (in `games/tankity`): `node tools/solo-runs.mjs`
Expected: seven lines, covering `easy`, `normal` and `hard`; `long-30` plays 30 or more rounds (if a "long" run ends early, raise its `until` until it does not, then regenerate; if one reaches the 60-round cap and throws, lower its `until`: see **Decision needed (William) #3**).

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
Tankity: recorded solo runs for the PHP replay to match

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
- Produces: `SOLO_FOES`, `SOLO_W`; `js_round(float $x): float`; `solo_gen_terrain(int &$rng): array`; `solo_deal(string $seed, string $difficulty): array` (a room-shaped state: one human at seat 0, keys `seed, difficulty (a ROOM_DIFFICULTY word, read by room_ai_choose through room_difficulty()), rng, phase ('shop'), round, wind, terrain, tanks, turn, firstTurn, watchTurns, seats[0].lives, scores[0], cash[0], ammo[0], nextUp[0], roundsWon, tactics, plate[0], armor[0], fuelBonus[0], shield[0], jammer[0], bunker[0], laststand[0]`); `solo_muster(array &$s): void` (round must already be incremented). Vector group `solo-deal`: input `{ seed, rounds }`, output per round `{ samples, wind, xs, ys, tactics, turn, hp, next }`.

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
foreach (['scorched-1000', 'scorched-4242', 'alpha', 'runs-long-30', 'a b c'] as $seed) {
    $soloDeal($seed, 3);
}
```

Run (in `games/tankity`): `php protocol/sim-vectors.php`
Expected: FAIL, `Call to undefined function solo_deal()`.

- [ ] **Step 2: The PHP deal and muster**

```php
<?php
// games/tankity/server/solo.php
// Operation Tankity: the solo referee in PHP, for replaying a solo run. The
// rules of src/solo.ts over the room sim: a solo match is a room with one human
// at seat 0 and three drones, and draws its random stream in the browser's
// order. protocol/solo-runs.json pins it to the browser. Loaded by rooms.php.
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
   which the replay must draw too to stay on the browser's stream. */
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
        'round' => 0, 'wind' => 0, 'terrain' => [], 'tanks' => [], 'turn' => 0, 'firstTurn' => 0, 'watchTurns' => 0,
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
    $s['phase'] = 'play';
}
```

`rooms.php`: after `require_once __DIR__ . '/server/rules.php';` add `require_once __DIR__ . '/server/solo.php';` and the map line `//   server/solo.php      the solo referee, for replaying solo runs`.

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

### Task 29: The PHP referee, part 2: the whole replay

Open question: **Decision needed (William) #3** (header). As written, `SOLO_MAX_ROUNDS = 60` refuses a log past round 60, so an honest run that long cannot file although spec section 7.2 makes solo endless; the answer may change this task, Task 25 and Task 32.

**Files:**
- Modify: `games/tankity/server/solo.php` (turns, settle, 1-ups, fire, `solo_replay`)
- Create: `games/tankity/test/php/SoloReplayTest.php`
- Modify: `games/tankity/test.sh` (exclude the `slow` group)

**Interfaces:**
- Consumes: Task 28; `room_fire_shot`, `room_ai_choose` (its aim comes from `ROOM_DIFFICULTY[room_difficulty($s)]`, the log's difficulty), `room_spot_taken`, `room_settle_tanks`, `room_gauss`, `room_buy`, `room_carry_armor`; `ROOM_DIFFICULTY` (`server/ai.php`).
- Produces: `SOLO_MAX_ROUNDS = 60`, `SOLO_CPU_SECONDS = 2.0`, `SOLO_MAX_MOVES = 20000`; `solo_next_turn(array &$s): void`; `solo_settle(array &$s): string` (`'next' | 'roundWon' | 'tankLost' | 'matchLost'`); `solo_oneups(array &$s): void`; `solo_drone_turn(array &$s): void`; `solo_player_fire(array &$s, array $m): ?string`; `solo_cpu_now(): float`; `solo_replay(mixed $log, float $cpuBudget = SOLO_CPU_SECONDS): array` → `['ok' => true, 'score', 'roundsWon', 'rounds']` or `['ok' => false, 'error' => string]`.

- [ ] **Step 1: Failing test**

```php
<?php
// games/tankity/test/php/SoloReplayTest.php
declare(strict_types=1);

use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\Attributes\Group;
use PHPUnit\Framework\TestCase;

/* The browser's recorded solo runs (protocol/solo-runs.json) replay in PHP to
   exactly the browser's score; a tampered log does not file. */
final class SoloReplayTest extends TestCase
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
        return self::runs(fn($r) => $r['rounds'] <= 8);
    }

    public static function longRuns(): array
    {
        return self::runs(fn($r) => $r['rounds'] > 8);
    }

    private function assertReplays(array $run, float $budget): void
    {
        $got = solo_replay($run['log'], $budget);
        $this->assertSame(['ok' => true, 'score' => $run['score'], 'roundsWon' => $run['roundsWon'], 'rounds' => $run['rounds']], $got, $run['name']);
    }

    #[DataProvider('shortRuns')]
    public function testAnHonestRunReplaysToTheBrowsersScore(array $run): void
    {
        $this->assertReplays($run, 30.0);
    }

    #[DataProvider('longRuns')]
    #[Group('slow')]
    public function testALongRunReplaysToo(array $run): void
    {
        $this->assertReplays($run, 300.0);
    }

    public function testTheRecordedRunsCoverEveryDifficulty(): void
    {
        $levels = array_unique(array_column(array_column(array_merge(self::shortRuns(), self::longRuns()), 0), 'difficulty'));
        sort($levels);
        $this->assertSame(['easy', 'hard', 'normal'], array_values($levels));
    }

    public function testTheLogsDifficultyAimsTheDrones(): void
    {
        $run = array_values(self::shortRuns())[0][0];
        $log = $run['log'];
        $log['difficulty'] = $log['difficulty'] === 'hard' ? 'easy' : 'hard';
        $this->assertNotSame(['ok' => true, 'score' => $run['score'], 'roundsWon' => $run['roundsWon'], 'rounds' => $run['rounds']], solo_replay($log, 30.0));
    }

    private function sample(): array
    {
        return array_values(self::shortRuns())[0][0]['log'];
    }

    public function testAnUnfinishedLogIsRefused(): void
    {
        $log = $this->sample();
        array_pop($log['moves']);
        $this->assertSame(['ok' => false, 'error' => 'unfinished'], solo_replay($log));
    }

    public function testMovesAfterTheEndAreRefused(): void
    {
        $log = $this->sample();
        $log['moves'][] = ['k' => 'next'];
        $this->assertSame(['ok' => false, 'error' => 'moves after the end'], solo_replay($log));
    }

    public function testAShotOutOfRangeIsRefused(): void
    {
        $log = $this->sample();
        foreach ($log['moves'] as &$m) {
            if ($m['k'] === 'fire') {
                $m['a'] = 200;
                break;
            }
        }
        unset($m);
        $this->assertSame(['ok' => false, 'error' => 'out of range'], solo_replay($log));
    }

    public function testATeleportIsRefused(): void
    {
        $log = $this->sample();
        foreach ($log['moves'] as &$m) {
            if ($m['k'] === 'fire') {
                $m['x'] = $m['x'] < 360 ? $m['x'] + 300 : $m['x'] - 300;
                break;
            }
        }
        unset($m);
        $this->assertFalse(solo_replay($log)['ok']);
    }

    public function testBuyingWithoutCashIsRefused(): void
    {
        $log = $this->sample();
        array_unshift($log['moves'], ['k' => 'buy', 'i' => 'extralife', 'q' => 1]);
        $this->assertSame(['ok' => false, 'error' => 'bad buy'], solo_replay($log));
    }

    public function testGarbageIsRefused(): void
    {
        $this->assertSame(['ok' => false, 'error' => 'bad log'], solo_replay(['v' => 1, 'seed' => 'x']));
        $this->assertSame(['ok' => false, 'error' => 'bad seed'], solo_replay(['v' => 1, 'seed' => "h\u{e9}llo", 'difficulty' => 'normal', 'moves' => []]));
        $this->assertSame(['ok' => false, 'error' => 'bad difficulty'], solo_replay(['v' => 1, 'seed' => 'x', 'difficulty' => 'brutal', 'moves' => []]));
        $this->assertSame(['ok' => false, 'error' => 'bad difficulty'], solo_replay(['v' => 1, 'seed' => 'x', 'moves' => []]));
    }

    public function testTheCpuBudgetIsEnforced(): void
    {
        $this->assertSame(['ok' => false, 'error' => 'too slow'], solo_replay($this->sample(), 0.0));
    }
}
```

In `test.sh` change the PHPUnit line to `../../vendor/bin/phpunit -c ../../phpunit.xml --testsuite tankity --exclude-group slow`.

Run (in `websites/www.cs`): `vendor/bin/phpunit --testsuite tankity --filter SoloReplayTest --exclude-group slow`
Expected: FAIL, `Call to undefined function solo_replay()`.

- [ ] **Step 2: Implement**

Append to `server/solo.php`:

```php
const SOLO_MAX_ROUNDS = 60;
const SOLO_CPU_SECONDS = 2.0;
const SOLO_MAX_MOVES = 20000; // src/solo-log.ts LOG_MAX_MOVES

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
    room_settle_tanks($s);
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

/* A drone's turn, as room_advance plays one: choose, shuffle, fire. */
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
        $s['tanks'][$cur]['y'] = $s['terrain'][max(0, min(SOLO_W - 1, (int) round($nx)))];
    }
    $s['tanks'][$cur]['brk']['ox'] = $s['tanks'][$cur]['x'];
    if ($choice['wkey'] !== 'shell') {
        $s['tanks'][$cur]['ammo'][$choice['wkey']] = max(0, ($s['tanks'][$cur]['ammo'][$choice['wkey']] ?? 0) - 1);
    }
    $events = [['t' => 'aifire', 'seat' => $s['tanks'][$cur]['seat']]];
    room_fire_shot($s, $events, $cur, $choice['wkey']);
}

/* The player's shot: drive to x (fuel pays for the distance; the spot must be
   free), aim, fire. An error line when the move is not legal. */
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
        $s['tanks'][0]['y'] = $s['terrain'][max(0, min(SOLO_W - 1, (int) round($x)))];
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
    $events = [['t' => 'fire', 'seat' => 0]];
    room_fire_shot($s, $events, 0, $w);
    return null;
}

function solo_cpu_now(): float
{
    $u = getrusage();
    return $u['ru_utime.tv_sec'] + $u['ru_utime.tv_usec'] / 1e6 + $u['ru_stime.tv_sec'] + $u['ru_stime.tv_usec'] / 1e6;
}

/* Replays a solo move log (src/solo-log.ts). A run that plays to its end
   answers its score; anything else is refused with the reason. At most
   SOLO_MAX_ROUNDS rounds and $cpuBudget seconds of CPU. */
function solo_replay($log, float $cpuBudget = SOLO_CPU_SECONDS): array
{
    $no = fn(string $why): array => ['ok' => false, 'error' => $why];
    if (!is_array($log) || ($log['v'] ?? null) !== 1 || !is_string($log['seed'] ?? null) || !is_array($log['moves'] ?? null)) {
        return $no('bad log');
    }
    if (!preg_match('/^[\x20-\x7e]{1,64}$/', $log['seed'])) {
        return $no('bad seed');
    }
    // The drones aim at the match's difficulty; a word the browser never sends is refused, not read as normal.
    if (!is_string($log['difficulty'] ?? null) || !isset(ROOM_DIFFICULTY[$log['difficulty']])) {
        return $no('bad difficulty');
    }
    $moves = array_values($log['moves']);
    if (count($moves) > SOLO_MAX_MOVES) {
        return $no('too long');
    }
    $t0 = solo_cpu_now();
    $s = solo_deal($log['seed'], $log['difficulty']);
    $i = 0;
    $n = count($moves);
    while ($s['phase'] !== 'over') {
        if (solo_cpu_now() - $t0 > $cpuBudget) {
            return $no('too slow');
        }
        if ($s['phase'] === 'shop') {
            if ($i >= $n) {
                return $no('unfinished');
            }
            $m = $moves[$i++];
            $k = is_array($m) ? ($m['k'] ?? null) : null;
            if ($k === 'buy') {
                $q = $m['q'] ?? null;
                if (!is_string($m['i'] ?? null) || !is_int($q) || room_buy($s, 0, $m['i'], $q) !== null) {
                    return $no('bad buy');
                }
                solo_oneups($s);
                continue;
            }
            if ($k !== 'next') {
                return $no('bad move');
            }
            if ($s['round'] >= SOLO_MAX_ROUNDS) {
                return $no('too many rounds');
            }
            $s['round']++;
            solo_muster($s);
            continue;
        }
        if ($s['turn'] === 0) {
            if ($i >= $n) {
                return $no('unfinished');
            }
            $m = $moves[$i++];
            if (!is_array($m) || ($m['k'] ?? null) !== 'fire') {
                return $no('bad move');
            }
            $err = solo_player_fire($s, $m);
            if ($err !== null) {
                return $no($err);
            }
        } else {
            solo_drone_turn($s);
        }
        solo_oneups($s);
        $end = solo_settle($s);
        if ($end === 'roundWon' || $end === 'tankLost') {
            solo_oneups($s);
        }
    }
    if ($i !== $n) {
        return $no('moves after the end');
    }
    return ['ok' => true, 'score' => (int) $s['scores'][0], 'roundsWon' => (int) $s['roundsWon'], 'rounds' => (int) $s['round']];
}
```

- [ ] **Step 3: Run**

Run (in `websites/www.cs`): `vendor/bin/phpunit --testsuite tankity --exclude-group slow`
Expected: PASS. A short run that disagrees prints its name: replay it in node with `replaySolo` and in PHP with `solo_replay`, dumping the state after each volley, and fix the side that departs from `src/solo.ts`; add the case that found it to the sim vectors.

- [ ] **Step 4: Commit**

```bash
git add games/tankity/server/solo.php games/tankity/test/php/SoloReplayTest.php games/tankity/test.sh
git commit -F- <<'MSG'
Tankity: the server replays a solo move log to the browser's score

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb
MSG
```

### Task 30: The replay's CPU budget: measure, trim, gate

**Files:**
- Create: `games/tankity/tools/replay-bench.php`
- Modify: `games/tankity/server/sim.php` (`room_sim_shot`, `room_fly_arc`: loop constants hoisted, bit-identical)
- Modify: `.github/workflows/ci.yml` (the nightly job also runs `phpunit --testsuite tankity --group slow` and the bench)

**Interfaces:**
- Consumes: Task 29.
- Produces: `php tools/replay-bench.php` prints `name rounds cpu-seconds` per recorded run and exits 1 when any run of 30 rounds or fewer exceeds `SOLO_CPU_SECONDS`.

- [ ] **Step 1: The bench**

```php
<?php
// games/tankity/tools/replay-bench.php
// CPU per recorded solo replay (protocol/solo-runs.json), with no budget cap.
// Exit 1 when a run of 30 rounds or fewer needs more than SOLO_CPU_SECONDS:
// honest players' runs of that length must file.
//   php -d xdebug.mode=off tools/replay-bench.php
declare(strict_types=1);
define('TANKITY_ROOMS_LIB', true);
require __DIR__ . '/../rooms.php';

$runs = json_decode((string) file_get_contents(__DIR__ . '/../protocol/solo-runs.json'), true)['runs'];
$over = 0;
foreach ($runs as $r) {
    $t0 = solo_cpu_now();
    $got = solo_replay($r['log'], 1e9);
    $cpu = solo_cpu_now() - $t0;
    printf("%-14s %3d rounds  %6.2f s%s\n", $r['name'], $r['rounds'], $cpu, $got['ok'] ? '' : '  REFUSED ' . $got['error']);
    if ($r['rounds'] <= 30 && $cpu > SOLO_CPU_SECONDS) {
        $over++;
    }
}
exit($over ? 1 : 0);
```

Run (in `games/tankity`): `php -d xdebug.mode=off tools/replay-bench.php`
Expected today: the short runs well under a second; record the `long-15` and `long-30` numbers in the PR description.

- [ ] **Step 2: Trim the hot loop, bit for bit**

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

Run (in `games/tankity`): `php protocol/sim-vectors.php --check && php -d xdebug.mode=off tools/replay-bench.php` and (in `websites/www.cs`) `vendor/bin/phpunit --testsuite tankity --group slow`
Expected: vectors current (bit-identical), every recorded run still replays, and lower CPU numbers.

- [ ] **Step 3: The gate**

If `replay-bench.php` exits 0, continue. If a run of 30 rounds or fewer still needs more than 2 s of CPU, **stop before Task 31**: the spec's 2 s cap would refuse honest long runs. This is part of **Decision needed (William) #3** (header): add the measured numbers to that question, whose options cover it (raise `SOLO_CPU_SECONDS` with the round cap to the measured cost plus headroom, or file per round so no single replay is long), and wait for the answer.

- [ ] **Step 4: Nightly**

In `.github/workflows/ci.yml`'s scheduled job, after the full e2e run, add:

```yaml
      - name: Tankity replay sweep (slow)
        working-directory: websites/www.cs
        run: |
          vendor/bin/phpunit --testsuite tankity --group slow
          (cd games/tankity && php -d xdebug.mode=off tools/replay-bench.php)
```

- [ ] **Step 5: Commit**

```bash
git add games/tankity/tools/replay-bench.php games/tankity/server/sim.php .github/workflows/ci.yml
git commit -F- <<'MSG'
Tankity: measure the replay's CPU; lighter flight loops, same numbers

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb
MSG
```

### Task 31: The score endpoint on the guard, filing what the replay scored

**Files:**
- Create: `games/tankity/server/scores-api.php`
- Modify: `games/tankity/scores.php` (thin bootstrap)
- Create: `games/tankity/test/php/ScoresApiTest.php`

**Interfaces:**
- Consumes: Plan C's `Kit\ScoreGuard` (`csrfToken`, `originAllowed`, `csrfOk`, `startRun`, `consumeRun`), Task 10 `tankity_guard()` and `tankity_initials()`, `board_*`, Task 29 `solo_replay`.
- Produces: `SCORES_MAX_BODY = 262144`; `tankity_scores_handle(string $method, string $raw, Kit\ScoreGuard $guard): array` → `[int status, array payload]` (the guard carries the request and its clock). Wire: GET → `{ scores, keep, csrf }`; POST (JSON, origin, CSRF header) `{op:'start'}` → `{ ok, run }`; `{op:'score', run, initials, log}` → `{ ok, score, roundsWon, rank }`, or 422 `{ error: 'replay', why }`, 422 initials, 400 `'invalid run'`, 403 forbidden, 413, 429 `'rate'`.

- [ ] **Step 1: Failing test**

```php
<?php
// games/tankity/test/php/ScoresApiTest.php
declare(strict_types=1);

use Kit\ScoreGuard;
use PHPUnit\Framework\TestCase;

/* scores.php's handler: every guard rule, and the replay deciding the score. */
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
        $this->dir = sys_get_temp_dir() . '/tankity-api-' . bin2hex(random_bytes(4));
        mkdir($this->dir);
        putenv('TANKITY_SCORES_DIR=' . $this->dir);
        $this->override = ['storageKey' => 'tk-test-' . bin2hex(random_bytes(4)), 'startsPerHour' => 3];
        $this->now = time();
        $_SERVER = ['HTTP_HOST' => 'localhost', 'HTTP_ORIGIN' => 'http://localhost', 'CONTENT_TYPE' => 'application/json',
            'REMOTE_ADDR' => '203.0.113.' . random_int(1, 254), 'HTTP_X_TANKITY_CSRF' => self::TOKEN, 'SCRIPT_NAME' => '/games/tankity/scores.php'];
        $_COOKIE = ['tankity_csrf' => self::TOKEN];
    }

    protected function tearDown(): void
    {
        putenv('TANKITY_SCORES_DIR');
        array_map('unlink', glob($this->dir . '/{,.}*', GLOB_BRACE) ? array_filter(glob($this->dir . '/{,.}*', GLOB_BRACE), 'is_file') : []);
        rmdir($this->dir);
        @unlink(rtrim(sys_get_temp_dir(), DIRECTORY_SEPARATOR) . '/' . $this->override['storageKey'] . '-runs.json');
    }

    /** The guard for this test's request, on the test's clock; it sets no real cookie. */
    private function guard(): ScoreGuard
    {
        return tankity_guard($this->override, $_SERVER, $_COOKIE, fn(): int => $this->now, function (): void {});
    }

    private function post(array $body): array
    {
        return tankity_scores_handle('POST', (string) json_encode($body), $this->guard());
    }

    private function run(): array
    {
        $all = json_decode((string) file_get_contents(dirname(__DIR__, 2) . '/protocol/solo-runs.json'), true)['runs'];
        foreach ($all as $r) {
            if ($r['rounds'] <= 8) {
                return $r;
            }
        }
        $this->fail('no short recorded run');
    }

    private function token(): string
    {
        [$status, $out] = $this->post(['op' => 'start']);
        $this->assertSame(200, $status);
        return $out['run'];
    }

    public function testGetGivesTheBoardAndTheToken(): void
    {
        [$status, $out] = tankity_scores_handle('GET', '', $this->guard());
        $this->assertSame(200, $status);
        $this->assertSame(self::TOKEN, $out['csrf']);
        $this->assertSame([], $out['scores']);
    }

    public function testABadOriginIsForbidden(): void
    {
        $_SERVER['HTTP_ORIGIN'] = 'https://evil.example';
        $this->assertSame(403, $this->post(['op' => 'start'])[0]);
    }

    public function testAMissingCsrfHeaderIsForbidden(): void
    {
        unset($_SERVER['HTTP_X_TANKITY_CSRF']);
        $this->assertSame(403, $this->post(['op' => 'start'])[0]);
    }

    public function testAMismatchedCsrfIsForbidden(): void
    {
        $_SERVER['HTTP_X_TANKITY_CSRF'] = 'ffffffffffffffffffffffffffffffff';
        $this->assertSame(403, $this->post(['op' => 'start'])[0]);
    }

    public function testStartsAreRateLimited(): void
    {
        for ($i = 0; $i < 3; $i++) {
            $this->assertSame(200, $this->post(['op' => 'start'])[0]);
        }
        $this->assertSame([429, ['error' => 'rate']], $this->post(['op' => 'start']));
    }

    public function testAnHonestRunFilesAtExactlyTheScoreTheBrowserShowed(): void
    {
        $run = $this->run();
        [$status, $out] = $this->post(['op' => 'score', 'run' => $this->token(), 'initials' => 'abc', 'log' => $run['log']]);
        $this->assertSame(200, $status, json_encode($out));
        $this->assertSame($run['score'], $out['score']);
        $this->assertSame(1, $out['rank']);
        $top = board_top(1)[0];
        $this->assertSame(['ABC', $run['score'], $run['roundsWon']], [$top['initials'], $top['score'], $top['rounds']]);
    }

    public function testAForgedScoreFieldIsIgnored(): void
    {
        $run = $this->run();
        [, $out] = $this->post(['op' => 'score', 'run' => $this->token(), 'initials' => 'ABC', 'log' => $run['log'], 'score' => 999999]);
        $this->assertSame($run['score'], $out['score']);
        $this->assertSame($run['score'], board_top(1)[0]['score']);
    }

    public function testATamperedMoveLogIsRefused(): void
    {
        $log = $this->run()['log'];
        array_pop($log['moves']);
        [$status, $out] = $this->post(['op' => 'score', 'run' => $this->token(), 'initials' => 'ABC', 'log' => $log]);
        $this->assertSame(422, $status);
        $this->assertSame(['error' => 'replay', 'why' => 'unfinished'], $out);
        $this->assertSame([], board_top(5));
    }

    public function testATokenFilesOnce(): void
    {
        $run = $this->run();
        $token = $this->token();
        $this->assertSame(200, $this->post(['op' => 'score', 'run' => $token, 'initials' => 'ABC', 'log' => $run['log']])[0]);
        $this->assertSame([400, ['error' => 'invalid run']], $this->post(['op' => 'score', 'run' => $token, 'initials' => 'ABC', 'log' => $run['log']]));
    }

    public function testAnExpiredTokenIsRefused(): void
    {
        $token = $this->token();
        $this->now += 900 + 1;
        $this->assertSame([400, ['error' => 'invalid run']],
            $this->post(['op' => 'score', 'run' => $token, 'initials' => 'ABC', 'log' => $this->run()['log']]));
    }

    public function testBadInitialsAreRefused(): void
    {
        foreach (['AB', 'A1C', 'ass', ''] as $bad) {
            $this->assertSame(422, $this->post(['op' => 'score', 'run' => $this->token(), 'initials' => $bad, 'log' => $this->run()['log']])[0], $bad);
        }
    }
}
```

Run (in `websites/www.cs`): `vendor/bin/phpunit --testsuite tankity --filter ScoresApiTest`
Expected: FAIL, `scores-api.php` missing.

- [ ] **Step 2: The handler**

```php
<?php
// games/tankity/server/scores-api.php
// Operation Tankity's score endpoint. GET answers the all-time board and a CSRF
// token; POST {op: start} hands out a single-use run token; POST {op: score,
// run, initials, log} replays the solo run and files the score the replay
// reached (the client never sends one that counts). The kit guard checks
// origin, CSRF, tokens and rates first. Loaded by scores.php; serves nothing.
declare(strict_types=1);
if (count(get_included_files()) === 1) {
    http_response_code(404);
    exit;
}

use Kit\ScoreGuard;

const SCORES_MAX_BODY = 262144;

function tankity_scores_handle(string $method, string $raw, ScoreGuard $guard): array
{
    if ($method === 'GET') {
        return [200, ['scores' => board_top(BOARD_SHOW), 'keep' => BOARD_KEEP, 'csrf' => $guard->csrfToken()]];
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
    $op = (string) ($in['op'] ?? '');
    if ($op === 'start') {
        $run = $guard->startRun();
        return $run === null ? [429, ['error' => 'rate']] : [200, ['ok' => true, 'run' => $run]];
    }
    if ($op !== 'score') {
        return [400, ['error' => 'invalid json']];
    }
    $initials = tankity_initials($guard, $in['initials'] ?? null);
    if ($initials === null) {
        return [422, ['error' => 'initials must be 3 letters, kept clean']];
    }
    if (!is_array($in['log'] ?? null)) {
        return [422, ['error' => 'no move log']];
    }
    $problem = $guard->consumeRun((string) ($in['run'] ?? ''));
    if ($problem === 'rate') {
        return [429, ['error' => 'rate']];
    }
    if ($problem !== null) {
        return [400, ['error' => $problem]];
    }
    $result = solo_replay($in['log']);
    if (!$result['ok']) {
        return [422, ['error' => 'replay', 'why' => $result['error']]];
    }
    $rank = board_file(['initials' => $initials, 'score' => $result['score'], 'rounds' => $result['roundsWon'], 'seed' => $in['log']['seed']]);
    return [200, ['ok' => true, 'score' => $result['score'], 'roundsWon' => $result['roundsWon'], 'rank' => $rank]];
}
```

Replace `scores.php`'s body after `require_once __DIR__ . '/config.php';` with:

```php
// The sim, the guard and the board come with the room library; no room is served.
define('TANKITY_ROOMS_LIB', true);
require_once __DIR__ . '/rooms.php';
require_once __DIR__ . '/server/scores-api.php';

try {
    [$status, $payload] = tankity_scores_handle($_SERVER['REQUEST_METHOD'] ?? 'GET',
        (string) file_get_contents('php://input'), tankity_guard());
} catch (Throwable $e) {
    error_log('tankity scores.php: ' . $e->getMessage());
    [$status, $payload] = [500, ['error' => 'store unavailable']];
}
http_response_code($status);
header('Content-Type: application/json');
header('Cache-Control: no-store');
echo json_encode($payload, JSON_UNESCAPED_SLASHES);
```

(and update its header comment: "Operation Tankity: the score endpoint. The work is server/scores-api.php; this answers the request.").

- [ ] **Step 3: Run**

Run (in `websites/www.cs`): `vendor/bin/phpunit --testsuite tankity --exclude-group slow`
Expected: PASS, 11 `ScoresApiTest` cases.

- [ ] **Step 4: Commit**

```bash
git add games/tankity/server/scores-api.php games/tankity/scores.php games/tankity/test/php/ScoresApiTest.php
git commit -F- <<'MSG'
Tankity scores: the guard first, then the replay decides the score

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb
MSG
```

### Task 32: Filing runs from the browser, with the offline queue

**Files:**
- Create: `games/tankity/src/solo-file.ts`
- Create: `games/tankity/test/solo-file.test.mjs`
- Modify: `games/tankity/tsconfig.json`

**Interfaces:**
- Consumes: kit `prefs.ts` (`pref`, `json`), `StorageLike`; Task 25 `isSoloLog`.
- Produces: `interface PendingRun { id: string; initials: string; shown: number; log: SoloLog; tries: number }`; `type FileOutcome = { id: string; kind: 'filed'; score: number; rank: number | null } | { id: string; kind: 'refused'; why: string } | { id: string; kind: 'waiting' }`; `interface FilerEnv { fetch(url: string, init?: FetchLike): Promise<{ ok: boolean; status: number; json(): Promise<unknown> }>; storage: StorageLike | null }`; `PENDING_KEY = 'tankity-pending-runs'`, `PENDING_MAX = 5`, `MAX_TRIES = 5`; `createFiler(env: FilerEnv): { queue(run: Omit<PendingRun, 'tries'>): void; flush(): Promise<FileOutcome[]>; waiting(): number }`.

- [ ] **Step 1: Failing test**

```js
// games/tankity/test/solo-file.test.mjs
// Filing finished solo runs (src/solo-file.ts): GET for the CSRF token, a run
// token, then the log; offline runs wait in storage and file once.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { memoryStorage } from '../../_kit/test/record.ts';
import { createFiler, PENDING_KEY, MAX_TRIES } from '../src/solo-file.ts';

const LOG = { v: 1, seed: 's', difficulty: 'normal', moves: [{ k: 'next' }] };
const run = id => ({ id, initials: 'ABC', shown: 1200, log: LOG });
const reply = (status, body) => ({ ok: status >= 200 && status < 300, status, json: async () => body });

function server(score = { status: 200, body: { ok: true, score: 1200, rank: 7 } }) {
  const calls = [];
  const fetch = async (url, init = {}) => {
    const body = init.body ? JSON.parse(init.body) : null;
    calls.push({ method: init.method || 'GET', op: body && body.op, csrf: init.headers && init.headers['X-Tankity-Csrf'] });
    if (!init.method) return reply(200, { scores: [], csrf: 'tok' });
    if (body.op === 'start') return reply(200, { ok: true, run: 'r'.repeat(32) });
    return reply(score.status, score.body);
  };
  return { fetch, calls };
}

test('a run files: token, then the log, with the CSRF header', async () => {
  const s = server();
  const storage = memoryStorage();
  const f = createFiler({ fetch: s.fetch, storage });
  f.queue(run('a'));
  assert.deepEqual(await f.flush(), [{ id: 'a', kind: 'filed', score: 1200, rank: 7 }]);
  assert.deepEqual(s.calls.map(c => [c.method, c.op]), [['GET', null], ['POST', 'start'], ['POST', 'score']]);
  assert.ok(s.calls.slice(1).every(c => c.csrf === 'tok'));
  assert.equal(f.waiting(), 0);
});

test('offline: the run waits in storage and files on the next try', async () => {
  const storage = memoryStorage();
  const down = createFiler({ fetch: async () => { throw new Error('offline'); }, storage });
  down.queue(run('b'));
  assert.deepEqual(await down.flush(), [{ id: 'b', kind: 'waiting' }]);
  assert.match(storage.data.get(PENDING_KEY), /"id":"b"/);
  const later = createFiler({ fetch: server().fetch, storage });
  assert.equal((await later.flush())[0].kind, 'filed');
  assert.equal(later.waiting(), 0);
});

test('a refused run is dropped, not retried', async () => {
  const s = server({ status: 422, body: { error: 'replay', why: 'unfinished' } });
  const f = createFiler({ fetch: s.fetch, storage: memoryStorage() });
  f.queue(run('c'));
  assert.deepEqual(await f.flush(), [{ id: 'c', kind: 'refused', why: 'unfinished' }]);
  assert.equal(f.waiting(), 0);
});

test('a run the server keeps refusing is dropped after MAX_TRIES tries', async () => {
  const s = server({ status: 400, body: { error: 'invalid run' } });
  const f = createFiler({ fetch: s.fetch, storage: memoryStorage() });
  f.queue(run('d'));
  for (let i = 1; i < MAX_TRIES; i++) assert.equal((await f.flush())[0].kind, 'waiting');
  assert.equal((await f.flush())[0].kind, 'refused');
  assert.equal(f.waiting(), 0);
});

test('two flushes at once file a run once', async () => {
  const s = server();
  const f = createFiler({ fetch: s.fetch, storage: memoryStorage() });
  f.queue(run('e'));
  await Promise.all([f.flush(), f.flush()]);
  assert.equal(s.calls.filter(c => c.op === 'score').length, 1);
});

test('blocked storage still files the run in hand', async () => {
  const f = createFiler({ fetch: server().fetch, storage: null });
  f.queue(run('f'));
  assert.equal((await f.flush())[0].kind, 'filed');
});
```

Run (in `games/tankity`): `node --test test/solo-file.test.mjs`
Expected: FAIL, module not found.

- [ ] **Step 2: The filer**

```ts
// games/tankity/src/solo-file.ts
/* Operation Tankity: filing finished solo runs.
 *
 * A run that ends waits in this browser's storage until scores.php takes it:
 * GET for the CSRF token, a single-use run token, then the move log for the
 * server to replay. Offline or busy, it waits for the next try; refused by the
 * replay, it is dropped. Fetch and storage arrive as arguments. */
import type { StorageLike } from '../../_kit/ports.ts';
import { json, pref } from '../../_kit/prefs.ts';
import { isSoloLog } from './solo-log.ts';
import type { SoloLog } from './solo-log.ts';

export interface PendingRun { id: string; initials: string; shown: number; log: SoloLog; tries: number }
export type FileOutcome =
  | { id: string; kind: 'filed'; score: number; rank: number | null }
  | { id: string; kind: 'refused'; why: string }
  | { id: string; kind: 'waiting' };
interface FetchLike { method?: string; headers?: Record<string, string>; body?: string; credentials?: 'same-origin' }
export interface FilerEnv {
  fetch(url: string, init?: FetchLike): Promise<{ ok: boolean; status: number; json(): Promise<unknown> }>;
  storage: StorageLike | null;
}

export const PENDING_KEY = 'tankity-pending-runs';
export const PENDING_MAX = 5;
export const MAX_TRIES = 5;
const URL = 'scores.php';

function isPendingRuns(v: unknown): v is PendingRun[] {
  return Array.isArray(v) && v.every(r => r && typeof r === 'object' && typeof r.id === 'string' && typeof r.initials === 'string'
    && typeof r.shown === 'number' && typeof r.tries === 'number' && isSoloLog(r.log));
}

export function createFiler(env: FilerEnv) {
  const stored = pref<PendingRun[]>(PENDING_KEY, [], json(isPendingRuns), env.storage);
  // Runs in hand stay here too, so blocked storage still files this session's run.
  let held: PendingRun[] = stored.get();
  let busy: Promise<FileOutcome[]> | null = null;
  const save = (runs: PendingRun[]): void => { held = runs; stored.set(runs); };

  function queue(run: Omit<PendingRun, 'tries'>): void {
    save([...held.filter(r => r.id !== run.id), { ...run, tries: 0 }].slice(-PENDING_MAX));
  }

  async function post(csrf: string, body: unknown): Promise<{ status: number; data: Record<string, unknown> }> {
    const res = await env.fetch(URL, {
      method: 'POST', credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', 'X-Tankity-Csrf': csrf }, body: JSON.stringify(body),
    });
    return { status: res.status, data: ((await res.json().catch(() => null)) || {}) as Record<string, unknown> };
  }

  async function fileOne(run: PendingRun, csrf: string): Promise<FileOutcome> {
    const start = await post(csrf, { op: 'start' });
    if (start.status !== 200 || typeof start.data['run'] !== 'string') return { id: run.id, kind: 'waiting' };
    const sent = await post(csrf, { op: 'score', run: start.data['run'], initials: run.initials, log: run.log });
    if (sent.status === 200 && sent.data['ok']) {
      return { id: run.id, kind: 'filed', score: Number(sent.data['score']), rank: typeof sent.data['rank'] === 'number' ? sent.data['rank'] : null };
    }
    if (sent.status === 422) return { id: run.id, kind: 'refused', why: String(sent.data['why'] || sent.data['error'] || 'refused') };
    return { id: run.id, kind: 'waiting' };
  }

  async function flushNow(): Promise<FileOutcome[]> {
    const runs = held;
    if (!runs.length) return [];
    let csrf = '';
    try {
      const res = await env.fetch(URL, { credentials: 'same-origin' });
      const data = (await res.json().catch(() => null)) as { csrf?: unknown } | null;
      csrf = res.ok && data && typeof data.csrf === 'string' ? data.csrf : '';
    } catch (_) { /* offline: everything waits */ }
    const out: FileOutcome[] = [];
    const keep: PendingRun[] = [];
    for (const run of runs) {
      let o: FileOutcome = { id: run.id, kind: 'waiting' };
      if (csrf) {
        try { o = await fileOne(run, csrf); } catch (_) { /* waits */ }
      }
      if (o.kind === 'waiting' && csrf) {
        // The server answered but would not take it: give up after a few tries.
        const tries = run.tries + 1;
        if (tries >= MAX_TRIES) o = { id: run.id, kind: 'refused', why: 'the score server kept refusing it' };
        else keep.push({ ...run, tries });
      } else if (o.kind === 'waiting') keep.push(run);
      out.push(o);
    }
    save(keep);
    return out;
  }

  /** Files every waiting run; concurrent calls share one attempt. */
  function flush(): Promise<FileOutcome[]> {
    if (!busy) busy = flushNow().finally(() => { busy = null; });
    return busy;
  }

  return { queue, flush, waiting: () => held.length };
}
```

Add `"src/solo-file.ts"` to `tsconfig.json` `files`.

- [ ] **Step 3: Run**

Run (in `games/tankity`): `node --test test/solo-file.test.mjs && node ../_kit/build/build.mjs tankity`
Expected: PASS (6).

- [ ] **Step 4: Commit**

```bash
git add games/tankity/src/solo-file.ts games/tankity/test/solo-file.test.mjs games/tankity/tsconfig.json
git commit -F- <<'MSG'
Tankity: file finished runs, with an offline queue that files once

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb
MSG
```

### Task 33: The page files with the log

**Files:**
- Modify: `games/tankity/src/scores.ts` (filer instead of the trusting POST and local rows; `flushPending`)
- Modify: `games/tankity/src/match.ts` (`MatchDeps.fileSolo` signature, `endMatch`)
- Modify: `games/tankity/src/main.ts` (wiring, boot flush, `online` listener)
- Delete: `games/tankity/src/score-rows.ts`
- Modify: `games/tankity/test/prefs-legacy.test.mjs` (drop the `tankity-local` checks and the `score-rows` import)

**Interfaces:**
- Consumes: Task 32.
- Produces: `createScores(...)` returns `{ SCORES, renderScoresOverlay, loadScores, fileSolo, flushPending }`; `fileSolo(run: { initials: string; score: number; log: SoloLog | null }, done: (line: string) => void): Promise<void>`; `flushPending(): Promise<void>`.

- [ ] **Step 1: scores.ts on the filer**

In `src/scores.ts`: drop the `score-rows` import, `localRows`, `saveLocal`, and the `SoloRun` interface; import `browserStorage` (kept), `createFiler` from `./solo-file.ts` and `type SoloLog` from `./solo-log.ts`. After `const { $, keyHint, say, toggleOverlay, initials } = deps;` add:

```ts
  const filer = createFiler({ fetch: (url, init) => fetch(url, init), storage: browserStorage() });
  /** Lines for runs still waiting, by id, so a later flush can update the card. */
  const waitingLines = new Map<string, (line: string) => void>();
  function lineFor(o: FileOutcome): string {
    if (o.kind === 'filed') return filedLine(o.rank, o.score);
    if (o.kind === 'refused') return `Not filed: ${o.why}.`;
    return 'Saved in this browser; it files itself when the score server answers.';
  }
  /* Files every waiting run; called at boot, when the browser comes back online, and after a match. */
  async function flushPending(): Promise<void> {
    const outcomes = await filer.flush();
    for (const o of outcomes) {
      const done = waitingLines.get(o.id);
      if (done) done(lineFor(o));
      if (o.kind !== 'waiting') waitingLines.delete(o.id);
      if (o.kind === 'filed') say(`Run filed: ${lineFor(o)}.`, 'good');
    }
    if (outcomes.some(o => o.kind === 'filed')) void loadScores();
  }
```

Replace `fileSolo` with:

```ts
  /* A finished solo run: queued with its move log, then filed. `done` gets the
     end card's line now and again if it files later. */
  async function fileSolo(run: { initials: string; score: number; log: SoloLog | null }, done: (line: string) => void): Promise<void> {
    if (!run.log) { done('This run cannot be filed (see the radio log).'); return; }
    const id = `${run.log.seed}:${run.log.moves.length}:${Date.now()}`;
    filer.queue({ id, initials: run.initials, shown: run.score, log: run.log });
    waitingLines.set(id, done);
    await flushPending();
  }
```

In `loadScores()`'s `catch` branch replace the local-rows fallback with `SCORES.rows = []; SCORES.note = 'The score server is out of reach right now.';`. Return `flushPending` too. Delete `src/score-rows.ts`; in `test/prefs-legacy.test.mjs` remove the `isScoreRows` import, the `ROWS` constant, the `tankity-local` seed entry and every check naming `tankity-local` or "score rows".

- [ ] **Step 2: The match sends the log**

`src/match.ts`: `MatchDeps.fileSolo` becomes `fileSolo(run: { initials: string; score: number; log: SoloLog | null }, done: (line: string) => void): void;` and in `endMatch()` the call becomes:

```ts
      fileSolo({ initials: initials(), score: G.score, log: G.log }, line => {
        END.filed = line;
        renderEndVeil();
      });
```

`src/main.ts`: destructure `flushPending` from `createScores`; in `init()` after `loadScores();` add:

```ts
  // Runs that ended offline file themselves when the server is back.
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
Tankity solo: runs file with their move log; offline runs file when back online

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
- Modify: `games/tankity/README.md` (Files table: `solo.ts`, `solo-log.ts`, `solo-play.ts`, `solo-file.ts`, `server/solo.php`, `server/scores-api.php`, `tools/solo-runs.mjs`, `tools/replay-bench.php`, `protocol/solo-runs.json`; section "Scores and replay"; Tests table)

**Interfaces:**
- Consumes: everything in PR 16.

- [ ] **Step 1: The spec checks the server's score against the card**

In `tests/e2e/tankity-end.spec.mjs`, before `await loseMatch(page);` add:

```js
  const filed = page.waitForResponse(r => r.url().includes('scores.php') && r.request().method() === 'POST'
    && (r.request().postData() || '').includes('"op":"score"'), { timeout: 120_000 }).catch(() => null);
```

and after the `#end-filed` expectation:

```js
  // The server replayed the move log and filed exactly the score this page showed.
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
| `src/solo-log.ts` | A solo match's move log: buys, leaving the shop, shots (gun, angle, power, where the tank drove) |
| `src/solo-play.ts` | Solo matches without a page: `playSolo` with a bot, `replaySolo` (not in the bundle) |
| `src/solo-file.ts` | Filing finished runs: CSRF token, run token, the log; an offline queue that files once |
| `server/solo.php` | The solo referee in PHP over the room sim, and `solo_replay()` (60 rounds, 2 s of CPU) |
| `server/scores-api.php` | The score endpoint: guard checks, run tokens, the replay, the board |
| `tools/solo-runs.mjs`, `protocol/solo-runs.json` | Bot runs recorded with the browser's rules that the PHP replay must match |
| `tools/replay-bench.php` | CPU per recorded replay; the nightly fails when a 30-round run needs more than the cap |
```

Section before `## Drone aim`:

```markdown
## Scores and replay

Runs file themselves the moment they end. A room's server files its humans'
scores itself. A solo run is filed by replay: the page records a move log
(`src/solo-log.ts`: each purchase, leaving the shop, each shot's gun, angle,
power and where the tank had driven to) and, at game over, asks scores.php
for a CSRF token and a single-use run token and sends the log. The server
replays it with the same PHP sim the rooms use (`server/solo.php`), refuses a
log that does not play to a finished match (or needs more than 60 rounds or
2 s of CPU), and files the score the replay reached; any score the client
sends is ignored. A run that ends offline waits in the browser
(`tankity-pending-runs`) and files itself when the server answers.

Initials are three letters, typed in either case and stored uppercase, one
set per player shared by solo and rooms; the guard refuses a blocked set.
Origins come from the guard's allow-list; run tokens, starts and scores are
rate-limited per IP, and so are new rooms.
```

Tests table: add `SoloReplayTest`, `ScoresApiTest`, `RoomGuardTest`, `test/solo*.test.mjs`, `test/fixed-step.test.mjs`, `test/determinism.test.mjs`, and the nightly's `--group slow` and replay bench.

- [ ] **Step 3: Full gate, PR**

Run (in `websites/www.cs`): `make test` then `make e2e E2E_ARGS="tankity-solo.spec.mjs"`
Expected: green within budgets.

```bash
git add tests/e2e/tankity-end.spec.mjs games/tankity/README.md
git commit -F- <<'MSG'
Tankity score integrity: the end spec checks the replayed score; docs

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb
MSG
git push -u origin games/tankity-score-integrity
gh pr create --title "Tankity score integrity: guard, solo replay, uppercase initials" --body "Spec row 16 (section 8). Determinism audit first (README 'Solo replay determinism'); the server replays solo move logs with the room sim and files what the replay scored. Replay CPU measured in Task 30: <numbers>.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb"
```

Before this PR, **Decision needed (William)** #1–#3 (header) must be answered. If `main` moved, rebase and rebuild the generated files (Global Constraints). Run the pr-fix loop, gate on required checks as before, merge on green, `make deploy`, and check live: lose a short solo match on `/play/tankity/?v=<sha>` and see "Filed · #N all-time" (the live board takes a real entry; use initials that read as a test, such as `TST`, and say so in the report). Report the cache-busted link.

---

## Self-Review

1. **Spec coverage.** 7.1: max armor and plates (T1–3, T5), carry-over (T2, T5), Repair capped/greyed/says what it restores (T1, T3, T5, T7), no banking (T2, T3, T5), re-muster at full max with plates (T2, T5), drones unchanged (T2 test), ARMOR pill "160 of 175" (T6), client and server together with vectors (T4). 7.2: solo endless (unchanged, T22 keeps it), last human standing with ×2 bonus (T8, T13), one-human room like solo (T8), `WATCH_TURNS` stays (T8 test, T22), vectors (T13). 7.3: top-of-shop board (T14–16), match over with ♛, Play again (same room), Leave room, Filed line (T12, T17–18), you're out with Watch the finish and Menu → Standings (T18), solo rounds table heading the end card (T16–17). 8: auto-filing, no form (T11, T17, T19, T33), Scores board with yours highlighted (T19), initials in either case, uppercase stored (T19 and T31 via `tankity_initials`, T34), one-time conversion (T10), guard on score and room endpoints (T31, T34), rooms filed server-side (T11), solo server replay with 60 rounds / 2 s CPU / refusal of unfinished logs (T29–31), offline queue (T32–33), PHPUnit for every guard rule and replay case (T31, T29), determinism audit before the endpoint (T21–23).
2. **Placeholders.** None remain. The open questions are in **Decision needed (William)** (header): the board and difficulty, Task 23's hold-still rule, and the 60-round cap with Task 30's CPU gate; each task they touch is written for the "as written" option.
3. **Type consistency.** Plan C's names are used as Plan C defines them: `Kit\ScoreGuard` and its methods through `tankity_guard()`/`tankity_initials()` (T10, T19, T31, T34; `rateTake` is Plan C Task 4's), `kit_php` (T10), `initialsPref` and main.ts's `getInitials` (T17, T19), `backToTitle` (T17, T18), `HudProps` in `ui/hud.tsx` with `test/hud.test.mjs` (T6), `test/menu.test.mjs` (T18), and the e2e `dealSolo` is this plan's (T7). `difficulty` runs from the Menu through `soloDeal` (T22) into `SoloLog` (T25), `playSolo`/`replaySolo` (T26), `solo-runs.json` (T27) and `solo_deal`/`solo_replay` (T28–29). `SoloState`/`SoloTank` (T22) are what `soloBuy` (T24), `playSolo` (T26) use; `EndState.buttons` matches `EndVeilProps.buttons` (T17) and `RoomCard` minus `'shop'` (T14, T18); `fileSolo` changes signature once, in T33, with its caller.
4. **Review Focus.** Each of the five lines has its test in the owning task (T23/T26, T32, T10, T8, T3/T1).
