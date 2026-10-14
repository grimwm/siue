# Games kit row 18: Typed Tests Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every unit test in the games is TypeScript and type-checked by the build, and no test runs through a bridge. Every `*.test.mjs` under `games/` becomes `*.test.ts` on `node:test` directly. Every PHP check script becomes a real PHPUnit `TestCase`. Each game's `tsconfig.test.json` (with `@types/node`) joins its `build.json` programs. The `check()` and `LegacyCheckCase` bridges are deleted. `make test` stays within budget: static ≤ 15 s, unit ≤ 45 s.

**Architecture:** Conversion is scripted and checked by tools. Each tool comes with its own test. `_kit/test/census.ts` records the leaf tests of each test file (and the PHPUnit assertions of each class) before a conversion, then checks afterwards that no file lost a test or a name. `_kit/test/convert-check.ts` renames files, fixes import specifiers and references, and rewrites `check(name, ok, detail)` into awaited `node:test` tests. `_kit/php/testing/checks-to-testcase.php` turns a sectioned check script into a `TestCase`, rewriting each `$check(...)` into one `self::assertTrue(...)`. A permanent guard test, `_kit/test/typed-tests.test.ts`, fails on any `.test.mjs`, any bridge import, any `LegacyCheckCase` subclass, or any game test program missing from `build.json`. It also fails on stale entries in its transition allowlist, which shrinks with every PR and is empty at the end. Tests keep running from source through Node's type stripping; nothing is compiled. Type errors fail `build.mjs <game> --check`, which `test.sh`, `make test` and CI `units` already run.

**Tech Stack:** TypeScript 7.0.2 (`tsc` native, `--noEmit`), Node 24 in CI (`node --test`, type stripping on by default) and Node 26 locally, `@types/node` 24.19.2 (already in `games/package.json`), esbuild 0.28.2 (only through the kit's `importTsx`), PHP 8.4 / PHPUnit 12, PHP's `token_get_all`.

**Spec:** `docs/superpowers/specs/2026-10-12-games-kit-design.md`: section 3 (testing tiers and budgets), section 10 row 18, and "Done when" (last two bullets).

**Branches:** eleven PRs, each off `main` in its own worktree (`.claude/worktrees/<branch>`), landed in order unless the PR table says otherwise. Branch names: `games/row18-<n>-<slug>`.

All paths are relative to `websites/www.cs/games/` unless they start with `websites/`, `tests/` (which means `websites/www.cs/tests/`) or `.github/`.

---

## Survey (main at b471098, 2026-10-14)

### Node test files

| Scope | Files | Lines | Leaf tests | `check()` files (calls) | tsc errors once renamed |
|---|---|---|---|---|---|
| `_kit/test/` + `_kit/build/` | 14 (12 + 2) | 1,499 | 124 | 0 | 303 (80 of them in `dom-stub`) |
| `crete/test/` | 8 | 993 | 107 | 1 (`engine`: 53) | 174 |
| `cylon/test/` | 10 | 1,176 | 228 | 6 (`abilities` 35, `rules` 32, `playfield` 33, `scores` 36, `state` 26, `field` 20) | 310 |
| `tankity/test/` | 68 | 11,308 | 1,592 | 10 (`smoke` 279, `net` 152, `ui` 141, `input` 71, `replay` 67, `preview` 63, `render` 19, `flow` 17, `protocol` 13, `prefs-legacy` 13) | 3,655 |
| **total** | **100** | **14,976** | **2,051** | **17 (1,067 calls)** | **4,442** |

Kit helpers: `_kit/test/{audio,check,clock,record,rng,tsx}.ts` are already TS. `_kit/test/dom-stub.mjs` (146 lines) is the only `.mjs` helper, and 23 test files import it (kit 6, crete 1, cylon 1, tankity 15). Its untyped `export const els = {}` causes 476 of tankity's errors ("Property 'x' does not exist on type '{}'"). `importTsx` returns `Record<string, Record<string, unknown>>`, so every component test indexes into `unknown`.

How the numbers were measured: every `.test.mjs` was renamed to `.test.ts` in a scratch copy. All 100 files then ran unchanged under `node --test` (2,051 tests, the same count as `main`). The only failures came from site files missing from the copy. Type checking used one `tsconfig.test.json` per scope (base config, `lib: ["ES2022", "DOM"]`, `types: ["node"]`, `include: ["test/**/*.ts"]`). By code, the tankity errors are TS7006 implicit-any parameter 975, TS2339 489, TS7053 393, TS2345 316, TS18048 305, TS2532 304 and TS18047 224. Turning off `noUncheckedIndexedAccess` removes only 5%.

### PHP

| Class (suite) | Kind | Script | `$check` sites | PHPUnit cases today |
|---|---|---|---|---|
| `tests/php/DeploySetTest` (site) | `LegacyCheckCase` | `tests/php/checks/deploy-set.php` (116 lines) | 24 | 90 |
| `tests/php/GamesHubTest` (site) | `LegacyCheckCase` | `checks/games-hub.php` (160) | 36 | 57 |
| `tests/php/HtaccessTest` (site) | `LegacyCheckCase` | `checks/htaccess.php` (8) | 1 | 2 |
| `tests/php/SiteGamePagesTest` (site) | `LegacyCheckCase` | `checks/site-game-pages.php` (139) | 35 | 35 |
| `tests/php/SiteVersionsTest` (site) | `LegacyCheckCase` | `checks/site-versions.php` (91) | 15 | 57 |
| `tankity/test/php/ConfigTest` (tankity) | `LegacyCheckCase` | `checks/config.php` (70) | 10 | 10 |
| `tankity/test/php/GameJsonTest` (tankity) | `LegacyCheckCase` | `checks/game-json.php` (528) | 68 | 244 |
| `tankity/test/php/RoomsSimTest` (tankity) | `LegacyCheckCase` | `checks/rooms-sim.php` (1,314) | 207 | 475 |
| `tankity/test/php-docker/RoomsTest` (tankity-docker) | `LegacyCheckCase` | `php-docker/checks/rooms.php` (490) | 86 | 89 |
| `_kit/php/tests/LegacyCheckCaseTest` (kit) | the bridge's own test | n/a | n/a | 2 |

The case counts come from a scratch copy on PHP 8.5.3. The site checks depend on the environment: 72 of `DeploySetTest`'s cases failed outside the repository. So every PR re-baselines inside its own worktree and compose container. The other 29 PHP test classes (`InstallCoreTest`, `ScoreGuardTest`, cylon `ScoresTest`, 24 tankity classes, 4 docker classes) are already real `TestCase`s and stay as they are.

### Wiring today

- `test.sh` per game: `node --test 'test/*.test.mjs'`; tankity and cylon then run their PHPUnit suite.
- `websites/www.cs/Makefile` `test`: `cd games && npm ci --silent && node --test '_kit/test/*.test.mjs' '_kit/build/*.test.mjs' && node_modules/.bin/tsc -p _kit/tsconfig.json`, then `for t in games/*/test.sh`.
- `build.json` programs: crete and cylon `["tsconfig.json", "src/tsconfig.dom.json"]`; tankity adds `src/tsconfig.check.json`. `build.mjs` runs `tsc -p` on each and throws with tsc's output on failure (`typeCheck`, line 45).
- `_kit/tsconfig.json` already checks `test/*.ts` (the helpers) with `types: ["node"]`.
- CI `.github/workflows/ci.yml`: `units` sets up Node `"24"` and PHP 8.4 and runs `make test`. The last `main` run's "Unit suites" step took 140 s, including `npm ci`, `composer install`, docker suites and the live `rooms-web-test.php` probe.
- `check()` users: 17 files (above). `LegacyCheckCase` users: 9 classes (above). The bridge is also referenced by `_kit/README.md` (Tests section), `tests/e2e/select-test.mjs` lines 18–19, and `composer.json` (`autoload-dev.classmap: games/_kit/php/testing/`).
- `tests/e2e/select.mjs` line 45 sends `_kit/build/build.test.mjs` to NONE by exact name. Renamed to `.ts`, it would fall through to the kit's ALL rule.

### Measured runtime (MacBook, 16 cores, Node 26.10, from `main`)

| What | Time |
|---|---|
| `build.mjs <game> --check` | crete 0.4 s, cylon 0.4 s, tankity 0.6 s |
| `tsc -p tsconfig.test.json` (the new program, renamed files) | kit 0.15 s, crete 0.12 s, cylon 0.12 s, tankity 0.21 s |
| `node --test` per scope, as `make test` runs them (one after another) | kit 8.0 s, crete 2.1 s, cylon 1.2 s, tankity 36.6 s, **sum 47.9 s** |
| one `node --test` over all five globs | **38.3 s** (2,051 tests) |
| longest single file | `tankity/test/smoke.test.mjs` 35 s wall, 4.6 s CPU (real `setTimeout` sleeps) |
| PHPUnit suites (scratch, PHP 8.5.3) | site 0.4 s, kit 0.5 s, cylon 0.4 s, **tankity 51.6 s** (`AiArcsTest` 35.0 s, `RoomGuardTest` 5.5 s, `HousekeepTest` 2.2 s), tankity-docker `RoomsStoreTest` 9.9 s |

The unit tier is over its 45 s budget before row 18 starts. See ruling R11.

### In-flight work

`games/tankity-se-fire` (Napalm, worktree `.claude/worktrees/tankity-se-fire`) changes 14 tankity test files. It adds `test/ai-fire.test.mjs` and `test/fire.test.mjs`, and edits `determinism`, `icons`, `match-local`, `preview`, `render`, `replay`, `shop`, `sim-vectors`, `smoke`, `ui` and `weapon-label`. It also edits `test/php/checks/game-json.php`, `test/php/checks/rooms-sim.php` and `tests/php/checks/deploy-set.php`. **PRs 5–10 start only after it merges** (R10).

---

## Rulings

- **R1. Node strips the types; nothing compiles the tests.** CI runs Node 24 (`ci.yml` `node-version: "24"`) and Node 26 runs locally. Both strip types by default, and the tests already import `../src/*.ts` that way. All 100 renamed files ran unchanged in the scratch copy. Compiling the tests with esbuild would add an output folder and source-map indirection and buy nothing. Test files are `.ts`, never `.tsx`: components still load through `importTsx`. Imports use `.ts` extensions (`allowImportingTsExtensions`) and `import type` for types (`verbatimModuleSyntax`), so whatever tsc accepts, Node can strip.
- **R2. Explicit discovery: shell-expanded lists that fail on zero.** `node --test 'test/*.test.mjs'` exits 0 when the glob matches nothing (measured on Node 26). A typo would therefore pass silently. Every runner (`<game>/test.sh`, the new `_kit/test.sh`, and from PR 11 `games/units.sh`) expands its globs in the shell, fails when a glob matches no file, and hands Node the list:
  ```sh
  set -- test/*.test.ts
  [ -e "$1" ] || { echo "test.sh: no test/*.test.ts" >&2; exit 1; }
  node --test "$@"
  ```
  Node's default discovery is never used. While a game is part-converted, its `test.sh` runs both kinds: `set -- test/*.test.mjs test/*.test.ts`, dropping any pattern that stays literal. The PR that converts a game's last `.mjs` drops the `.mjs` pattern.
- **R3. Type errors fail the build, at full strictness.** Each game gets `<game>/tsconfig.test.json`:
  ```jsonc
  {
    // The unit tests: Node runs them from source; this program type-checks them. See games/_kit/README.md.
    "extends": "../_kit/build/tsconfig.base.json",
    "compilerOptions": { "lib": ["ES2022", "DOM"], "types": ["node"] },
    "include": ["test/**/*.ts"]
  }
  ```
  It is appended to `build.json` `programs`, so `build.mjs <game> --check` (in `test.sh`, hence in `make test`, hence in CI `units`) prints tsc's errors and fails. The kit has no `build.json`, so the kit gets `_kit/tsconfig.test.json`, which `_kit/test.sh` checks. It is the same, with `include: ["test/**/*.test.ts", "build/*.test.ts"]`, `exclude: ["test/fixture/**"]`, and `allowJs: true` (no `checkJs`) so that `build.test.ts` and `icons.test.ts` get inferred types from `build.mjs` and `icons.mjs`. Nothing in the base config is relaxed. Test files may not use `any` (`: any`, `as any`, `<any>`), `@ts-ignore` or `@ts-nocheck`. `@ts-expect-error` is allowed only to assert an intended type error, with a comment saying so. The guard test enforces the bans. Partial fixtures are built by typed factory helpers or `satisfies`. A bare `as T` is acceptable only on a fixture literal that is deliberately partial; `as unknown as T` needs a one-line reason. Types come from the sources (`import type { Tank } from '../src/sim.ts'`) and are never redeclared in a test. To narrow, prefer an assertion (`assert.ok(x)`) over `!`. Use `!` only when indexing a fixture the test itself just built.
- **R4. The `check()` form is an awaited top-level test.** `node:test` runs a top-level `test()` body only after the module finishes evaluating. Measured: an unawaited `test('a', () => assert.equal(x, 0))` sees `x`'s final value. A check script mutates state between checks, so the conversion is:
  ```ts
  // before
  check('lance-hits-once', hits.length === 1, `hits=${hits.length}`);
  // after
  await test('lance-hits-once', () => { assert.ok(hits.length === 1, `hits=${hits.length}`); });
  ```
  The two-argument form drops the message. Top-level `await` keeps the script's order and state, and the names and leaf counts stay identical. A check inside a non-`async` function cannot be awaited. The converter does not guess there: tsc reports TS1308, and the implementer makes the enclosing function `async` and awaits its calls. Turning `assert.ok(a === b)` into `assert.equal(a, b)` is **not** part of row 18; later PRs that touch a file may do it.
- **R5. PHP check scripts become one method per section.** Before running the tool, the implementer does three things by hand. (1) Insert `// @test <camelName>: <what it covers>` markers where independent scenarios begin. (2) Move the prelude's helper closures (`$tank = function ...`) into `private static` methods or named functions, so that the prelude holds only `declare`, `require*`, `define` and `if (!defined(...))`. (3) Confirm the legacy class is still green. `checks-to-testcase.php` then writes `final class XTest extends TestCase`. Each section becomes `public function test<CamelName>(): void`. `$check(N, C)` becomes `self::assertTrue(C, N)` and `$check(N, C, D)` becomes `self::assertTrue(C, N . ' :: ' . D)`. The result is exactly one assertion per old check. The tool refuses a prelude with other statements, a `function` declaration inside a section, or any `exit`/`$fail` use. If one section reads a variable that another assigned, PHP warns about an undefined variable, and `phpunit.xml`'s `failOnWarning="true"` turns that into a failure. The `checks/` script is deleted once its class is converted.
- **R6. Counts are checked per file and must match.** Before the first conversion commit of each PR, run `census.ts record`. After the last one, run `census.ts verify`. Node: for each pair (`x.test.mjs` before and `x.test.ts` after, matched by stem), the number of leaf tests and the multiset of leaf names must be equal. PHP: per class, the assertion count must equal the old count, and for classes that were already real the test count must too. A legacy case is exactly one assertion. Only green runs count: `census` refuses to record or verify if any test fails or any file fails to load. The only exceptions are deletions named with `--removed <path>` (PR 11's bridge tests). The record lives outside the tree, in `"$(git rev-parse --git-common-dir)/row18-census/pr<n>-before.json"`, and the verify summary table goes in the PR body.
- **R7. Scope.**
  - The e2e specs (`tests/e2e/*.spec.mjs`, 34 files), their helpers (`helpers.mjs`, `fx-helpers.mjs`, `rooms-*-helpers.mjs`, `playwright.config.mjs`, `screenshots.mjs`) and the e2e tooling tests (`select-test.mjs`, `shard-test.mjs`, each with its own local `check`, not the kit bridge) are **out of scope**. Row 18 is defined over the games' `*.test.mjs` and `build.json` programs. The specs belong to a separate Playwright package (`tests/e2e/package.json`) with their own runner and types. Every in-flight game branch edits them. Spec filenames are keys in `select.mjs` and `shard.mjs`'s weights, so renaming them is its own change. The Done-when line "every test file is TypeScript" therefore stays open after row 18. **Proposed follow-up row 18b**: e2e specs and their tooling to `.ts` under a `tests/e2e/tsconfig.json` with `@playwright/test` types, after the Tankity line quiets down. The operator decides whether to add 18b to the spec table.
  - `tankity/rooms-web-test.php` is **out**. It is the deployed probe that `make test` runs over HTTP through the real SAPI (`WEB-OK`), not a PHPUnit check script, and it cannot run under PHPUnit.
  - `_kit/build/build.mjs`, `icons.mjs`, `tests/e2e/select.mjs` and `shard.mjs` are tools, not tests: **out**.
- **R8. The kit goes first, and its helpers are typed before any game converts.** The games import the kit's helpers, and the helpers' types decide most game errors. PR 2 does three things. It moves `dom-stub.mjs` to a typed `dom-stub.ts` (`els: Record<string, StubElement>`, typed `makeEl`, `fire`, `click`, `document`). It leaves `dom-stub.mjs` as the one-line shim `export * from './dom-stub.ts';`, so no game file changes in the kit PR, and that includes the Napalm branch's new tests. It makes `importTsx` generic: `importTsx<M>(fromDir, modules): Promise<M>`, with callers writing `importTsx<{ help: typeof import('../src/ui/help.tsx') }>(...)`. The shim goes away in PR 11.
- **R9. Games convert in batches.** Unconverted `.mjs` files keep running (R2) and are not type-checked. `tsconfig.test.json` includes only `.ts`, so a batch's renames enter the program automatically. The guard's allowlist names every not-yet-converted file. A PR removes its files from the allowlist and the guard fails on a stale entry, so the allowlist can only shrink.
- **R10. Order.** PRs 1–4 (tooling, kit, Crete, Cylon) touch nothing the Napalm branch touches and can start now. **PR 5 (site PHP) and PRs 6–10 (Tankity) start only after `games/tankity-se-fire` merges.** Napalm edits `tests/php/checks/deploy-set.php`, two tankity check scripts and 14 tankity test files, and adds `ai-fire.test.mjs` and `fire.test.mjs`. Those two new files join PR 9 (tasks 9.4 and 9.5). After the merge, re-run the inventory (Task 1.1's `census.ts record`) on `main` and re-split a task if its file grew by more than 30%. Any other branch that lands new `*.test.mjs` before its game's row-18 PR adds them to the allowlist. After that PR, the guard rejects them.
- **R11. Budget.** Row 18 may add at most 0.3 s per program to the static tier: tsc on the test programs measures 0.12–0.21 s. It must not slow the unit tier: renaming does not change the runtime (Node already strips `src/`). Each PR's body reports `make test`'s static and unit times against the PR 1 baseline taken in the same environment. PR 11 replaces the per-game `node --test` runs with one parallel run of every scope (`games/units.sh`), measured at 47.9 s → 38.3 s. Two existing overruns are **not** row 18's to fix. One is the 35 s wall of `tankity/test/smoke.test.mjs` (real sleeps). The other is `AiArcsTest`'s 35 s inside the 51.6 s tankity PHPUnit suite. PR 11 measures both in the compose container (PHP 8.4) and files a bead with the numbers. The spec's own remedy is section 3's nightly tier for slow sweeps: move the `AiArcsTest` sweep there and keep a fast sample in `make test`. The Done-when budget line stays open until that bead lands.
- **R12. The bridges are deleted in the last PR.** That covers `_kit/test/check.ts`, `_kit/test/check.test.ts`, `_kit/php/testing/LegacyCheckCase.php`, `_kit/php/tests/LegacyCheckCaseTest.php`, the `composer.json` classmap entry, the `dom-stub.mjs` shim, `convert-check.ts`, `checks-to-testcase.php`, and `census.ts` with its reporter. These are single-use conversion tools, and the guard test is the permanent check. Census verify runs in PR 11 before the deletion commit, with `--removed` for the two bridge tests.
- **R13. CI and selection.** No `.github/workflows` edit: CI already runs Node 24 and `make test`. The Makefile is edited twice: PR 2 moves the kit's line into `_kit/test.sh`, and PR 11 adds `games/units.sh`. Each Makefile edit selects ALL e2e specs (`select.mjs`), and that is accepted. PR 1 adds `select.mjs` rules so that nothing new selects specs for no reason: `games/[^/]+/tsconfig\.test\.json$` → NONE; `_kit/(tsconfig\.test\.json|test\.sh)$` → NONE; `_kit/build/build\.test\.(mjs|ts)` replaces the `build\.test\.mjs` alternative. Each rule gets matching `select-test.mjs` cases. A `build.json` edit still selects the game's specs, which is correct, since `build.json` decides the bundle.
- **R14. References follow the rename.** `convert-check.ts` rewrites every reference to a renamed path anywhere in the repository (`git grep -l`). The only exclusion is `docs/superpowers/` (plans and specs are history). That covers READMEs, the `src/` comments that name tests (cylon `src/rules.ts` and four others, tankity `src/ai.ts` and others, `_kit/app.ts`), `tankity/server/settings.php`, and `protocol/sim-vectors.php` together with `sim-vectors.json`'s `about` string. The last two are edited together, so `php protocol/sim-vectors.php --check` stays byte-equal. Verify that in docker with `make sim-vectors`. When a `src/` comment changes, the game is rebuilt (`node _kit/build/build.mjs <game>`) and its `dist/*.js.map` is committed, because maps carry `sourcesContent`.

---

## Global Constraints

- **Worktrees.** Each PR gets its own worktree off `main`. The root checkout stays on `main`. Use your own compose project: `export COMPOSE_PROJECT_NAME=row18-<n>`, `make up`, and finish with `docker compose -p "$COMPOSE_PROJECT_NAME" down -v`. Never bind 3000, 5173, 8000 or 8080. Never prune.
- **Behaviour is frozen.** A converted test asserts exactly what it asserted before. The diff of a test file is: rename, imports, the R4/R5 rewrite, type annotations, typed fixture helpers, and narrowing assertions (`assert.ok(x)` before using `x`). Any other change to a test's logic is a review finding. If typing exposes a real bug in a test (a misspelled property that was always `undefined`, an assertion that could never fail), do not fix it silently. Note it in the PR body and fix it in its own commit with its own message.
- **Source code is not edited to satisfy a test's types.** One exception: exporting a type that already exists in `src/` (`export type`/`export interface`) so a test can import it. That exception still means a rebuild and a `dist/*.map` commit (R14).
- **Census every PR (R6).** Record before the first conversion commit. Verify after the last one. Paste the summary into the PR body.
- **TDD shape for a conversion task.** (1) Remove the task's files from the guard allowlist and watch `node --test _kit/test/typed-tests.test.ts` fail, naming them. (2) Run the converter, then the census for those files: green, same counts. (3) Run `node _kit/build/build.mjs <game> --check` (or `node_modules/.bin/tsc -p _kit/tsconfig.test.json` for the kit) and watch it fail with the errors in the task's files. That is the red. (4) Fix the types until the program is clean for those files. Run `tsc -p <game>/tsconfig.test.json --pretty false | grep -c '<file>'` per file to see progress. (5) Run the guard, the census and `test.sh` again: all green. (6) Commit.
- **Gates per PR.** Run `sh games/<game>/test.sh` (or `sh games/_kit/test.sh`), then `make test` in `websites/www.cs` with the PR's compose project. Run no e2e specs locally unless `dist/` changed; in that case run at most one of the game's specs (for example `make e2e E2E_ARGS="crete-play"`). CI runs the selected shards.
- **Fast loop.** While working, run single files (`node --test test/x.test.ts`) and one tsc program. Run `make test` once per PR, at the end.
- **Docs describe current state.** Update `_kit/README.md` (Tests section), `games/README.md`, each game's README and the root `README.md` to say `*.test.ts`. No "was `.mjs`", no dates.
- **Commits.** Small: one per task at least. Commit messages end with the session's `Co-Authored-By` and `Claude-Session` lines. Each PR goes through `foundry:pr-fix-loop`, merges on green (required checks), and is deployed when `dist/` changed. A Tankity deploy reports a cache-busted `/play/tankity/?v=<sha>` link.
- **Provenance.** Record agent ids, briefs and usage on the row-18 bead with `foundry:agent-record-provenance`.

## Review Focus

1. **Counts and names.** Read the census table in the PR body: every pair equal, and any `--removed` justified. Then spot-check one converted check file: `grep -c "await test(" x.test.ts` must equal the old `grep -c "check(" x.test.mjs`.
2. **Order semantics.** In a converted `check()` file, every `test(` is `await`ed. One unawaited test silently changes which state it sees (R4).
3. **Weakened assertions.** Look for an assertion that became vacuous through typing: an optional chain inserted into the condition (`a?.b === c` where `a.b` used to throw), a `?? default` added inside an `assert`, a `!` hiding an `undefined` the test was supposed to catch.
4. **Casts and escapes.** No `any`, `@ts-ignore` or `@ts-nocheck`. Every `as unknown as` has a reason. Types are imported from `src/`, not redeclared.
5. **Logic drift.** Every change other than rename, imports, annotations and R4/R5 rewrites needs its own explanation.
6. **PHP sections.** Each `self::assertTrue` maps to one old `$check`. No section depends on state from another. The prelude contains only what R5 allows.
7. **Discovery.** Every runner fails when it finds zero files. `build.json` lists `tsconfig.test.json`. `select.mjs` sends the new files to NONE.
8. **Bridges gone (PR 11).** No `check.ts`, no `LegacyCheckCase`, no shim. The guard's allowlist is empty, and the guard asserts that the files do not exist.

---

## PRs

| # | PR | Files converted | Tests (leaf / PHP cases) | Tasks | Order |
|---|---|---|---|---|---|
| 1 | Tooling: census, JS converter, guard, select rules | new tools only | n/a | 4 | now |
| 2 | Kit tests typed; `dom-stub.ts`; generic `importTsx`; `_kit/test.sh` | 14 test files + `dom-stub` | 124 | 4 | after 1 |
| 3 | Crete tests typed | 8 | 107 | 2 | after 2 |
| 4 | Cylon tests typed | 10 | 228 | 3 | after 2 (parallel with 3) |
| 5 | Site PHP checks → `TestCase`; PHP converter | 5 scripts | 241 cases | 3 | after Napalm merges |
| 6 | Tankity wiring + `check()` files (not smoke) | 9 | 751 | 5 | after Napalm and 2 |
| 7 | Tankity `smoke` | 1 | 377 | 3 | after 6 |
| 8 | Tankity UI and overlay tests | 19 | 141 | 6 | after 6 (parallel with 7) |
| 9 | Tankity sim, AI, audio tests (+ Napalm's 2) | 39 + 2 | 323 + Napalm's | 7 | after 6; whichever of 7, 8, 9 lands last drops the `.mjs` pattern |
| 10 | Tankity PHP checks → `TestCase` | 4 scripts | 818 cases | 4 | after 5 (parallel with 7–9) |
| 11 | Delete bridges and tools; one parallel unit run; docs; budget | n/a | `--removed` 2 | 3 | last |

The numbers are from `main` at b471098. Re-baseline after Napalm (R10).

---

## PR 1: Tooling (`games/row18-1-tools`)

### Task 1.1: census for `node:test` files

**Files:** create `_kit/test/census.ts`, `_kit/test/census-reporter.ts`, `_kit/test/census.test.ts`, and the fixtures `_kit/test/fixture/census/{flat,nested,loop,suite,failing,broken}.case.ts`. The fixtures are named `.case.ts` so no runner glob picks them up.

- [ ] **Write the failing test** `census.test.ts`:
  - `flat` (3 `test()`s) → `{ leaves: 3, names: ['a','b','c'] }`.
  - `nested` (a parent with 2 `t.test` children) → 2 leaves, not 3.
  - `suite` (`describe` with 2 `it`) → 2.
  - `loop` (one name 3× in a loop) → 3 leaves, with the name 3× in the multiset.
  - `failing` → `record` exits 1 and names the file and the test.
  - `broken` (imports a missing module) → exits 1 with "failed to load". It must not be recorded as 0 or 1 leaves (measured: Node reports a load failure as one failing test named after the file).
  - Spawn with `NODE_TEST_CONTEXT` removed from `env`, as `check.test.mjs` already does. A nested run that inherits it reports to the parent instead.
- [ ] Run `node --test _kit/test/census.test.ts`. It fails (no module).
- [ ] **Implement.** `census-reporter.ts` is a custom reporter. It consumes `test:pass` and `test:fail` events. A test is a leaf when no deeper test completed since the last event at its nesting level. Suites are skipped. It writes one JSON line per run: `{ leaves, names, failures: [{name, error}] }`. `census.ts record --out <json> <files...>` runs each file in its own `node --test --test-reporter=<abs reporter path> <file>` process, 8 at a time, keyed by the file's stem (`x.test`). It refuses on any failure or non-zero exit. A file's attribution comes from the process, not from event `file` fields: `check()`-created tests report `check.ts` as their file.
- [ ] Run it again: pass. Then run `node _kit/test/census.ts record --out /tmp/x.json crete/test/*.test.mjs` on the real tree. Expect 107 leaves in 8 files.
- [ ] Commit `Games kit: census of node:test leaf tests per file, for the typed-tests conversion`.

### Task 1.2: census verify and PHP mode

**Files:** modify `_kit/test/census.ts` and `census.test.ts`; add `_kit/test/fixture/census/junit-{before,after}.xml`.

- [ ] **Failing tests:**
  - `verify --before b.json <files...>` passes when every stem has equal leaves and an equal name multiset.
  - It fails when a leaf is missing, a name changes, or a stem disappears. In each case it names the stem and the difference.
  - `--removed x.test` lets that one stem go.
  - PHP: `record --phpunit-suite <s> [--phpunit-cmd "<prefix>"]` runs `<prefix> vendor/bin/phpunit --testsuite <s> --log-junit <tmp>`. It parses `testcase` elements by attributes (`class`, `assertions`), per class.
  - From the junit fixtures, `verify` passes when each class's assertions are equal (a Legacy class's 475 cases become 475 assertions), and fails when a class loses assertions or an already-real class loses a test.
  - A phpunit exit code other than 0 refuses.
- [ ] Implement. XML is read with one attribute regex per `<testcase .../>`; no parser dependency. The command's exit status is checked before its output is read. Then make the tests pass and commit.

### Task 1.3: `convert-check.ts`

**Files:** create `_kit/test/convert-check.ts`, `_kit/test/convert-check.test.ts`, and fixture pairs `_kit/test/fixture/convert/<case>.in.mjs` and `<case>.out.ts`.

- [ ] **Failing tests**, one fixture pair each:
  - two- and three-argument `check`;
  - a multi-line call;
  - a regex literal argument (`said(h, /ran (left|right)/)`);
  - a template literal with `${f(a, b)}` and a nested template;
  - `check(` inside a string or a comment (untouched);
  - `obj.check(` (untouched);
  - an existing `import { test } from 'node:test'` (merged, not duplicated);
  - an existing `assert` import (kept);
  - a trailing comma;
  - `import { check } from '../../_kit/test/check.ts'` (removed);
  - `'../../_kit/test/dom-stub.mjs'` (rewritten to `.ts`).

  Output follows R4 exactly. Further tests:
  - `--rename` does `git mv x.test.mjs x.test.ts`. Run it against a temporary git repository.
  - References are rewritten in other files and skipped under `docs/superpowers/`.
  - The tool exits non-zero when a file had a `check` import but zero rewrites, or rewrites but no import: the edit must change what it claims.
  - An unbalanced argument list exits non-zero with `file:line`.
- [ ] **Implement** a small lexer: strings, template literals with nested `${}`, line and block comments, and regex literals after `( , = : [ ! & | ? { } ; return typeof`. It splits arguments only at depth-0 commas. No AST dependency: TypeScript 7 ships no stable JS API. Usage is `node _kit/test/convert-check.ts [--rename] <files...>`, and the tool prints `file: N checks rewritten, M references updated`.
- [ ] Run all fixtures to pass, then a dry run on `crete/test/engine.test.mjs` (`--rename` off, to stdout): 53 rewrites. Commit.

### Task 1.4: guard test and select rules

**Files:** create `_kit/test/typed-tests.test.ts`; modify `tests/e2e/select.mjs` and `tests/e2e/select-test.mjs`.

- [ ] **Failing test** `typed-tests.test.ts`, which reads the tree with `node:fs` and checks:
  - (a) no `*.test.mjs` under `_kit/` or `<game>/test/` outside `ALLOW.mjs`;
  - (b) for each game folder with a `test/`, `tsconfig.test.json` exists, has `types` including `node`, includes `test/**/*.ts`, and is listed in `build.json` `programs`, unless the game is in `ALLOW.program`;
  - (c) `_kit/tsconfig.test.json` exists (allowlisted until PR 2);
  - (d) no file imports `_kit/test/check.ts` outside `ALLOW.check`;
  - (e) no PHP class `extends LegacyCheckCase` outside `ALLOW.legacy`;
  - (f) no `: any`, `as any`, `<any>`, `@ts-ignore` or `@ts-nocheck` in any `*.test.ts`;
  - (g) each `test.sh` and `_kit/test.sh` contains the zero-files guard (R2);
  - (h) **every `ALLOW` entry still exists and still needs allowing**, otherwise the test fails with "stale allowlist entry: remove it";
  - (i) when every `ALLOW` list is empty, `check.ts`, `LegacyCheckCase.php` and `dom-stub.mjs` do not exist.

  `ALLOW` starts with today's 100 `.mjs` files, three games for `program`, the kit config, 17 `check` importers and 9 legacy classes. Generate the lists with a one-off `git ls-files` in the step and paste them. The runner checks are allowlisted per runner until its PR.
- [ ] Watch it fail with the allowlists empty, then pass with them filled.
- [ ] Add the three `select.mjs` rules from R13, plus `select-test.mjs` cases for `games/crete/tsconfig.test.json`, `games/_kit/tsconfig.test.json`, `games/_kit/test.sh` and `games/_kit/build/build.test.ts`, all `NONE`. Run `node tests/e2e/select-test.mjs` and `node tests/e2e/select.mjs --check`.
- [ ] Commit, run `make test`, and open the PR. The body carries the baseline timings (R11), re-measured in the PR's environment.

---

## PR 2: Kit (`games/row18-2-kit`)

### Task 2.1: kit runner, test program, typed helpers, renames

**Files:** create `_kit/test.sh`, `_kit/tsconfig.test.json` and `_kit/test/dom-stub.ts`; make `_kit/test/dom-stub.mjs` a one-line shim; modify `_kit/test/tsx.ts`, `websites/www.cs/Makefile` and the guard allowlist.

- [ ] Record the census: `node _kit/test/census.ts record --out "$(git rev-parse --git-common-dir)/row18-census/pr2-before.json" _kit/test/*.test.mjs _kit/build/*.test.mjs`.
- [ ] Remove the kit's entries from the guard's `ALLOW`, then run the guard: red.
- [ ] Create `_kit/test.sh`. It is `set -e`, runs from its own folder, expands `test/*.test.ts` and `build/*.test.ts` with the R2 guard, runs `node --test "$@"`, then `../node_modules/.bin/tsc -p tsconfig.json` and `-p tsconfig.test.json`. In the Makefile, `cd games && npm ci --silent && node --test ... && tsc -p _kit/tsconfig.json` becomes `cd games && npm ci --silent`, because the `games/*/test.sh` loop now runs `_kit/test.sh`. Check that the loop matches it: `ls games/*/test.sh`.
- [ ] Create `_kit/tsconfig.test.json` per R3.
- [ ] Move `dom-stub.mjs` to `dom-stub.ts` with `git mv`, then type it: `StubElement` (the shape `makeEl` builds), `els: Record<string, StubElement>`, and typed `makeEl`, `makeText`, `click`, `fire`, `submit`, `document` and `fireDocument`. Then write the shim `dom-stub.mjs` (`export * from './dom-stub.ts';`) with a comment that it goes away in row 18's last PR.
- [ ] Make `importTsx` generic (R8), defaulting to today's return type so the `.mjs` callers keep working.
- [ ] Run `node _kit/test/convert-check.ts --rename _kit/test/*.test.mjs _kit/build/*.test.mjs`, then the census verify: 124 leaves, same names. `tsc -p _kit/tsconfig.test.json` is red: 303 errors in the survey, fewer after the typed helpers.
- [ ] Commit (types red is allowed between tasks inside a PR; the PR is green at its last task).

### Task 2.2: types for `app`, `audio`, `clock`, `prefs`, `tsx`, `keys`, `record`, `rng`, `check`, `build`, `icons` (≈112 errors)

- [ ] Follow the TDD shape in Global Constraints. When `tsc ... | grep -E 'test/(app|audio|clock|prefs|tsx|keys|record|rng|check)\.test|build/' ` prints nothing, run `node --test` on these files and commit.

### Task 2.3: types for `install`, `install-bar` (≈102 errors)

- [ ] Same shape. Typing the `navigator` and `window` stubs is where most of these errors are: build one typed stub factory and use it in both files.

### Task 2.4: types for `ui` (≈89 errors); close the PR

- [ ] Same shape. Then run `sh _kit/test.sh`, the census verify (all 14 stems), the guard (kit entries gone) and `make test`. Update `_kit/README.md`'s Tests section: `*.test.ts`, `dom-stub.ts`, `importTsx<M>`, the test program. Leave the `check()` and LegacyCheckCase sentences until PR 11. Open the PR.

---

## PR 3: Crete (`games/row18-3-crete`)

### Task 3.1: wiring + `engine` (check, 53), `rules`, `maze-rule`, `maze-sweep`, `smoke` (≈83 errors)

- [ ] Run the census record for `crete/test/*.test.mjs` (8 files, 107 leaves). Remove the crete `ALLOW` entries for this task: red.
- [ ] Add `crete/tsconfig.test.json` (R3) and append it to `crete/build.json` `programs`. Change `crete/test.sh` to the mixed list with the zero guard (R2).
- [ ] `node _kit/test/convert-check.ts --rename` on the five files. Run the census for them: green. `node _kit/build/build.mjs crete --check`: red. Type them, get it green, commit.

### Task 3.2: `ui`, `bots`, `audio` (≈91 errors); close the PR

- [ ] Same shape. Then drop the `.mjs` pattern from `test.sh`, empty crete's `ALLOW` entries, run the census verify (8 stems) and `make test`, update `crete/README.md`, rebuild if a `src/` comment changed (R14), and open the PR.

## PR 4: Cylon (`games/row18-4-cylon`)

### Task 4.1: wiring + `rules` (check 32), `playfield` (33), `state` (26), `scores` (36), `chrome-settings`, `smoke` (≈71 errors)
### Task 4.2: `abilities` (check 35), `field` (check 20) (≈146 errors)
### Task 4.3: `ui`, `audio` (≈93 errors); close the PR

- [ ] Each task follows Task 3.1's steps with `cylon` in place of `crete`. The five `src/` files that name `test/*.test.mjs` in comments (`abilities.ts`, `playfield.ts`, `rules.ts`, `scores.ts`, `state.ts`) are rewritten by the converter, so rebuild and commit `dist/main.js.map`. Cylon's PHPUnit `ScoresTest` is already real: nothing to do there. The census PHP record for `--phpunit-suite cylon` still runs, to show it unchanged.

---

## PR 5: Site PHP (`games/row18-5-site-php`), after Napalm merges

### Task 5.1: `checks-to-testcase.php`

**Files:** create `_kit/php/testing/checks-to-testcase.php` and `_kit/php/tests/ChecksToTestCaseTest.php`, with fixtures `_kit/php/tests/fixture/{ok,bad-prelude,section-function,uses-fail}.checks.php` and `ok.expected.php`.

- [ ] **Failing test:** `ok` (prelude with `declare`/`require`/`define`, two `// @test` sections, two- and three-argument `$check`, a multi-line `$check` with nested parentheses and a string containing `$check(`) converts to `ok.expected.php` exactly. `bad-prelude` (a closure in the prelude), `section-function` and `uses-fail` each exit 1 with `file:line` and the R5 reason. The written class passes `php -l`.
- [ ] Implement with `token_get_all`. Usage: `php checks-to-testcase.php <LegacyClassFile> <checksScript>`. The tool overwrites the class file with the `TestCase` and `git rm`s the script. It asserts it rewrote as many `$check` calls as it counted.
- [ ] Pass, commit.

### Task 5.2: `DeploySetTest`, `HtaccessTest`, `SiteVersionsTest`

### Task 5.3: `GamesHubTest`, `SiteGamePagesTest`; close the PR

- [ ] For each class: census record (`--phpunit-suite site`, in the compose container), add the section markers and prelude helpers by hand (R5), check the legacy class is still green, run the tool, run the suite, run the census verify (assertions per class equal the old cases), and remove the class from the guard's `ALLOW.legacy`. Update the `tests/php` mention in `websites/www.cs/README` if any. Run `make test` and open the PR.

---

## PR 6: Tankity wiring and `check()` files (`games/row18-6-tankity-checks`), after Napalm merges

### Task 6.1: wiring + `prefs-legacy` (13), `flow` (17), `protocol` (13), `input` (71), `render` (19) (≈148 errors)

- [ ] Census record for **all** `tankity/test/*.test.mjs`, kept for PRs 6–9. Add `tankity/tsconfig.test.json` and append it to `build.json` `programs` after `src/tsconfig.check.json`. Change `test.sh` to the mixed list. Then the TDD shape for the five files.

### Task 6.2: `net` (check 152; ≈191 errors)
### Task 6.3: `replay` (check 67; ≈249 errors)
### Task 6.4: `preview` (check 63; ≈331 errors, mostly one fixture shape: type the factory once)
### Task 6.5: `ui` (check 141; ≈264 errors, mostly `dom-stub` lookups, which `dom-stub.ts` now types); close the PR

- [ ] For each: remove the file from `ALLOW`, convert, run the census for the file, run `build --check` (red), type it (green), commit. The PR closes with the census verify for its 9 stems, `make test`, a rebuild for the `src/` comment references, and a `sim-vectors` check in docker if R14 touched `sim-vectors.*`.

## PR 7: Tankity `smoke` (`games/row18-7-tankity-smoke`)

### Task 7.1: convert `smoke.test.mjs` (279 checks → 377 leaves); type lines 1–520
### Task 7.2: type lines 521–1040
### Task 7.3: type lines 1041–end; close the PR

- [ ] Task 7.1 runs the converter once for the whole file and the census for `smoke.test` (377). Each task types its line range until `tsc ... | grep 'smoke.test.ts(' | awk -F'[(,]' '$2>=A && $2<=B'` is empty, then commits. The program is green only after 7.3. `smoke` takes 35 s per run (R11), so run it once per task, at the end.

## PR 8: Tankity UI and overlay tests (`games/row18-8-tankity-ui`)

| Task | Files (≈ errors) |
|---|---|
| 8.1 | `solo` 125, `toasts` 21 |
| 8.2 | `scores-ui` 101, `games-ui` 35 |
| 8.3 | `hud` 90, `help` 28, `endveil` 25 |
| 8.4 | `menu` 85, `title` 48 |
| 8.5 | `games` 57, `shop` 40, `initials-picker` 35, `on-screen` 11 |
| 8.6 | `turn-time` 34, `lobby` 33, `notify` 26, `fullscreen` 20, `icons` 17, `standings-ui` 20 |

- [ ] Each task: the TDD shape on its files (`convert-check.ts --rename`, census, `build --check` red then green, guard, commit). The last task runs the census verify for the PR's 19 stems.

## PR 9: Tankity sim, AI and audio tests (`games/row18-9-tankity-sim`)

| Task | Files (≈ errors) |
|---|---|
| 9.1 | `sim-vectors` 132, `determinism` 4, `detmath` 5 |
| 9.2 | `fall` 113, `ai-hitrate` 10, `field` 12 |
| 9.3 | `ai-arcs` 66, `beams` 56, `earth` 8, `earth-show` 5 |
| 9.4 | `ai-harm` 49, `ai-beams` 49, `ai-earth` 37, `ai-fire` (Napalm) |
| 9.5 | `local-board` 38, `keys` 31, `ai-search` 31, `match-local` 28, `fire` (Napalm) |
| 9.6 | `wide-field` 25, `standings` 25, `marks` 21, `burial` 21, `weapon-keys` 18, `camera` 17, `earth-fx` 16 |
| 9.7 | `seats`, `bomblets`, `audio-announce`, `weapon-label`, `music-catalog`, `fixed-step`, `audio`, `music-build`, `scenery`, `audio-cache`, `ghosts`, `rotate-hint`, `track-toast`, `initials`, `armor` (≈114) |

- [ ] Same shape. `determinism.test.ts` lists rule files by path: check its lists still resolve after the rename. Whichever of PRs 7, 8 and 9 lands last drops the `.mjs` pattern from `tankity/test.sh` and empties tankity's `ALLOW.mjs`. The census verify then covers all 68 + 2 stems against PR 6's record (re-recorded for Napalm's two files if PR 6 predates them).

## PR 10: Tankity PHP (`games/row18-10-tankity-php`)

### Task 10.1: `ConfigTest` (10), `GameJsonTest` (68 sites → 244 cases)
### Task 10.2: `RoomsSimTest`, lines 1–660 of `rooms-sim.php`: markers, prelude helpers (`$tank`, `$flatRoom`, `$hitsOn` → private static methods)
### Task 10.3: `RoomsSimTest`, lines 661–end; run the tool (207 sites → 475 assertions)
### Task 10.4: `RoomsTest` (docker suite: 86 sites → 89 assertions); close the PR

- [ ] As in Task 5.2. Record and verify with `--phpunit-suite tankity`. For `RoomsTest`, use `--phpunit-suite tankity-docker --phpunit-cmd "docker compose -p $COMPOSE_PROJECT_NAME exec -T www-cs-php sh -c 'cd /var/www/html &&'"` (the exact prefix `make test` uses). Wall times go in the PR body, because `rooms-sim` sections now run as separate methods.

---

## PR 11: Bridges out, one unit run, docs, budget (`games/row18-11-close`)

### Task 11.1: delete the bridges

- [ ] Empty every `ALLOW` list in the guard and run it: red on (i), because `check.ts`, `LegacyCheckCase.php` and `dom-stub.mjs` still exist. Run the census record for `_kit`.
- [ ] `git rm` `_kit/test/check.ts`, `_kit/test/check.test.ts`, `_kit/test/dom-stub.mjs`, `_kit/php/testing/LegacyCheckCase.php` and `_kit/php/tests/LegacyCheckCaseTest.php`. Remove `autoload-dev.classmap` from `composer.json` (the folder now holds only the PHP converter, which Task 11.3 deletes) and run `composer dump-autoload`. Drop `select-test.mjs` lines 18–19, or point them at a remaining file under the same rule. Run the census verify with `--removed check.test`, and the PHP verify for the kit suite with `LegacyCheckCaseTest` removed. Run the guard: green. Commit.

### Task 11.2: one parallel unit run; measure the budget

- [ ] Create `games/units.sh`: one `node --test` over `_kit/test/*.test.ts`, `_kit/build/*.test.ts` and each `<game>/test/*.test.ts` for every folder with a `build.json`, expanded with the R2 guard. Remove the `node --test` line from each `test.sh` and `_kit/test.sh`, which keep their static and PHP steps. The Makefile runs `games/units.sh` once, after the `test.sh` loop. The guard's (g) now checks `units.sh`.
- [ ] Measure in the compose environment: static (every `build --check`, the `tsc` programs, `install-files --check`) and unit (`units.sh` plus the PHPUnit suites), three runs each, median. Put the table in the PR body. If unit is still over 45 s, which it will be because of `AiArcsTest` (R11), file the bead "Unit tier over budget: move the AiArcs sweep to nightly, keep a fast sample in make test" with the numbers, and link it in the body.

### Task 11.3: docs and tool removal

- [ ] `_kit/README.md` Tests: `*.test.ts`, the test programs, `units.sh`, the guard; delete the `check()` and LegacyCheckCase sentences. Also update `games/README.md`, each game README, and the root `README.md` line. Then `git rm` `convert-check.ts` and its test and fixtures, `census.ts` with its reporter, test and fixtures, and `checks-to-testcase.php` with its test and fixtures. Run `make test` one last time and open the PR.

---

## Done when (row 18)

- The `games/` tree has no `*.test.mjs`, no `check()`, no `LegacyCheckCase` and no `dom-stub.mjs`, and `typed-tests.test.ts` enforces all of that with an empty allowlist.
- `crete`, `cylon` and `tankity` `build.json` each list `tsconfig.test.json`, and the kit's `test.sh` checks `_kit/tsconfig.test.json`. A type error in any test fails `make test` and CI `units`.
- Every PR's census table shows equal leaf counts and names per file, and equal assertions per PHP class.
- The static tier is ≤ 15 s. The unit tier is measured. It is either ≤ 45 s or has a filed bead naming the pre-existing overrun (R11).
- Row 18b (e2e specs) is proposed to the operator (R7).
