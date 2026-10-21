# Crete Fast Solver Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Crete's breadth-first solver with an exact A\* solver over packed states, with sound pruning, disk spill, a background worker and a result cache, giving the same shortest-win lengths on every level.

**Architecture:** Today's search is kept verbatim as the reference (`solver-bfs.ts`). A new engine packs each game situation into a few 32-bit words (`pack.ts`), stores nodes in typed arrays with an open-addressing hash (`store.ts`), and runs A\* with a consistent relaxed-graph estimate (`heuristic.ts`, `astar.ts`). `solver.ts` keeps its public API and calls the new engine; every caller (thread help, difficulty measure, tests) switches with it. A node store can spill records to a paged file; in the browser a Web Worker runs searches with that file in the Origin Private File System and caches finished results.

**Tech Stack:** TypeScript 7 run by `node --test`, esbuild through `games/_kit/build/build.mjs`, Web Workers, OPFS `FileSystemSyncAccessHandle`, `crypto.subtle` SHA-256, Playwright for one browser spec.

**Spec:** `docs/superpowers/specs/2026-10-21-crete-editor-design.md`, Part 1 and "Decisions settled after review" (vision: `2026-10-16-crete-redesign-vision.md`; pieces that come later: `2026-10-21-crete-pieces-design.md`).

All paths are relative to `websites/www.cs/games/crete/` unless they start with `websites/` or `docs/`.

## Global Constraints

- **Same answers:** for every level, `solve` returns `solved` exactly when the reference does, and the same line length; "no win" (`solved: false, capped: false`) means the same. A line may differ from the reference's when both are shortest.
- The campaign's pinned `SHORTEST` (`test/puzzle-trials.test.ts`) does not change. Every Chapter 1 level keeps its current pass or fail in the difficulty gate.
- The public API of `src/puzzle/solver.ts` stays: `solve(start, cap?)`, `solveRefusing(start, refuse, cap?)`, `caught`, `Refuse`, `SolveResult`, `SOLVER_CAP`. `cap` bounds stored nodes; a capped search reports `capped: true`, never "no win".
- Memory per stored situation is at least 10× smaller than the reference's (its `stateKey` string plus `Set` entry).
- `bash units.sh` takes no longer than today (measure it before Task 1 and write the number into the ledger).
- Tests run in Node, in memory, with no worker and no disk; browser-only code is behind interfaces with Node test doubles.
- Esc is never bound. Never bind ports 3000, 5173, 8000 or 8080; browser specs run through `make e2e` in an own compose project, torn down with `down -v`, never the default `siue` project.
- Docs and comments describe current state, never history.
- After any change under `src/`, `game.css`, `index.html` or `build.json`: from `websites/www.cs/games` run `node _kit/build/build.mjs crete`; in `games/crete` run `php tools/install-files.php`; in `websites/www.cs` run `php tools/site-versions.php && php tools/site-game-pages.php`. Commit generated files with the source.
- Unit tests: from `websites/www.cs/games`, `node --test crete/test/<file>.test.ts`; all with `bash units.sh`; type and build check with `sh crete/test.sh`.

## Rulings made while planning

- **Thread help stays synchronous in the page.** `src/game.ts` keeps calling `solve(run.now, THREAD_CAP)`; it just becomes faster. The worker is built and tested here for the editor (Part 3) and any long search; moving the thread help into the worker would make hint/route/auto asynchronous for no gain at Chapter 1's sizes.
- **Ties:** of equally short lines A\* keeps the one found first under (lower f, then lower h, then wait before moves). The reference's "keeps the line that waits in place" test applies to the reference only.
- **Dominance is limited to resources that never make a shortest line longer:** hearts, the three key counts, the three tool counts, flippers, fire boots, and pages. Skates and suction boots change how many moves a route takes, so they must match exactly.
- **"Dead blocks":** Crete's blocks have no goal squares, so a frozen block is not a dead end by itself. The dead-end rule is: a node whose estimate is infinite (a remaining relic or the exit unreachable even in the relaxed graph) is dropped. A frozen block (two perpendicular unchanging walls, or frozen neighbours) is treated as wall when the relaxed graph is built for that node's region if, and only if, the same-answers tests stay green; otherwise it is left out.

## Review Focus

1. A level whose winning route needs a catch (Theseus thrown back to a safe zone nearer the goal): the estimate must stay a lower bound, so the throw-back edge is in the relaxed graph.
2. Ice and force floors that carry Theseus several cells in one move: the estimate counts a whole slide as one move, and every cell a slide could stop on is reachable in the relaxed graph.
3. A level with no relics, or with a `relics:` header lower than the grid count: the estimate uses the relics still needed, not the relic cells.
4. A search that hits its cap during spill or while stopped must say "capped", never "no win".
5. Storage that is missing, full, or throws (private window, iPhone quota): the worker falls back to memory and the cache reads as empty; nothing throws to the page.

---

### Task 1: Keep the reference, and the same-answers harness

**Files:**
- Create: `src/puzzle/solver-bfs.ts` (today's `search`, `stateKey`, action coding, moved verbatim; exports `solveBfs(start, cap?)`, `solveBfsRefusing(start, refuse, cap?)`, `stateKey(s)`)
- Modify: `src/puzzle/solver.ts` (re-exports the same public API, for now delegating to `solver-bfs.ts`)
- Create: `test/corpus.ts` (deterministic generator of small levels)
- Create: `test/same-answers.test.ts`
- Modify: `tsconfig.json` (`files` gains the new src files), `test/puzzle-solver.test.ts` (imports `stateKey` from `solver-bfs.ts`)

**Interfaces:**
- Produces: `solveBfs`, `solveBfsRefusing`, `stateKey` in `src/puzzle/solver-bfs.ts`; `corpus(seed: number, count: number): Level[]` in `test/corpus.ts` — levels from 5×5 to 9×9 built from a seeded PRNG with walls, relics, the gate, keys and doors, water and flippers, fire and boots, ice, force floors, blocks, a button and toggle walls, a safe zone, tools, and a Minotaur in about half; each parses and round-trips through `serialize`.
- `sameAnswers(level: Level, cap: number): void` in `test/same-answers.test.ts` asserts `solve` and `solveBfs` agree on `solved`, `capped === false ? line.length : —`, and the same for `solveRefusing(…, caught, …)`.

- [ ] **Step 1:** Measure `bash units.sh` wall time on the untouched branch; note it in the task report.
- [ ] **Step 2: Write the failing test** `test/same-answers.test.ts`: for every `TRIALS` level and for `corpus(1, 300)`, `sameAnswers(level, 2_000_000)`; and `corpus(1, 300)` contains at least 100 solvable and 30 unsolvable levels (assert the counts with `solveBfs`).
- [ ] **Step 3:** Run `node --test crete/test/same-answers.test.ts` — Expected: FAIL (`solver-bfs.ts` missing).
- [ ] **Step 4:** Move the search into `solver-bfs.ts` unchanged; `solver.ts` re-exports through it; write `corpus`.
- [ ] **Step 5:** Run `bash units.sh` and `sh crete/test.sh` — Expected: PASS, SHORTEST unchanged.
- [ ] **Step 6: Commit** `feat(crete): keep the breadth-first solver as the reference, with a same-answers corpus`

---

### Task 2: Packed situations

**Files:**
- Create: `src/puzzle/pack.ts`
- Test: `test/pack.test.ts`

**Interfaces:**
- Consumes: `State`, `initial`, `Level` (`src/puzzle/state.ts`, `level.ts`); `stateKey` (Task 1) as the oracle.
- Produces:
  ```ts
  export interface Layout { readonly words: number; /* fields' bit offsets, decided here */ }
  export function layoutOf(level: Level): Layout;
  export function pack(s: State, layout: Layout, out: Uint32Array, at: number): void;   // writes layout.words words
  export function unpack(words: Uint32Array, at: number, layout: Layout, level: Level): State;
  ```
  The packed words hold exactly what `stateKey` holds: positions of Theseus, the Minotaur, the cow and the throw-back cell; stone turns, hearts, relics left, the pages bitmask, key counts, tool counts; gear as bits; the terrain of the cells that can change (doors, toggle walls, water) as bits; and each object cell's object (only cells that start with an object, plus cells a block can reach, are encoded). `moves` and `outcome` are not packed; `unpack` sets `moves: 0`, `outcome: 'playing'`.

- [ ] **Step 1: Write the failing tests** (`test/pack.test.ts`): for every `TRIALS` level and `corpus(2, 100)`, walk every state the reference reaches (BFS from `initial`, capped at 20,000 per level): `unpack(pack(s))` has the same `stateKey` as `s`; two states have equal packed words exactly when their `stateKey`s are equal (check with a Map from key to words). `layoutOf(trialLevel(9)).words * 4` is at most one tenth of the average `stateKey(s).length * 2 + 48` bytes over level 10's reachable states.
- [ ] **Step 2:** Run `node --test crete/test/pack.test.ts` — Expected: FAIL (module missing).
- [ ] **Step 3:** Implement `layoutOf`, `pack`, `unpack` in `src/puzzle/pack.ts` (fixed-width bit fields sized from the level: cell indexes need `ceil(log2(rows*cols+1))` bits; counts are capped by the level's own totals).
- [ ] **Step 4:** Run the test — Expected: PASS.
- [ ] **Step 5: Commit** `feat(crete): pack a game situation into a few words`

---

### Task 3: The relaxed-graph estimate

**Files:**
- Create: `src/puzzle/heuristic.ts`
- Test: `test/heuristic.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export interface Estimate { /** Moves still needed at least; Infinity when no win is possible even relaxed. */ (s: State): number }
  export function estimateFor(level: Level): Estimate;
  ```
  The relaxed graph is over cells. From each cell, for each direction, an edge to every cell a move could end on if every door, toggle wall, block and figure were absent: one cell for floor, every cell along a slide or a force-floor carry. Water and fire are passable (gear could be held). An edge from every cell to every safe zone and to the start (a catch throws Theseus there in one move). The estimate is `dist(player → exit)` when no relic is still needed. When `relicsLeft > 0`: if every relic still on the board is needed (`relicsLeft` equals their count) it is `max(dist(player → exit), max over those relics of dist(player → relic))`; otherwise (the `relics:` header asks for fewer than the board holds) it is `max(dist(player → exit), min over those relics of dist(player → relic))`. Distances are precomputed per target by breadth-first search over reversed edges.

- [ ] **Step 1: Write the failing tests:** on every `TRIALS` level and `corpus(3, 200)`, for every state the reference reaches (capped at 20,000 per level), `estimate(s) <= ` the reference's shortest line length from `s` (solve from `s` with `solveBfs`; skip states it cannot solve); the estimate is consistent: for every state and every action, `estimate(s) <= 1 + estimate(step(s, a).state)`; a level whose exit is walled off has `Infinity` at the start. Include hand-built levels for Review Focus 1–3: a catch that throws Theseus to a safe zone next to the exit; a 10-cell ice slide; a `relics:` header lower than the grid count.
- [ ] **Step 2:** Run `node --test crete/test/heuristic.test.ts` — Expected: FAIL.
- [ ] **Step 3:** Implement `estimateFor`.
- [ ] **Step 4:** Run the test — Expected: PASS.
- [ ] **Step 5: Commit** `feat(crete): a consistent lower bound on the moves left`

---

### Task 4: A\* over packed nodes, behind the solver API

**Files:**
- Create: `src/puzzle/store.ts`, `src/puzzle/astar.ts`
- Modify: `src/puzzle/solver.ts` (now calls A\*), `test/puzzle-solver.test.ts` (the tie test targets `solveBfs`), `test/difficulty.test.ts` and `test/puzzle-trials.test.ts` only where they pin `explored` numbers (the gate's recalibration is Task 6: mark any gate assertion that fails on `explored` alone as `todo` with a message naming Task 6)
- Test: `test/astar.test.ts`, `test/same-answers.test.ts` (now meaningful)

**Interfaces:**
- Consumes: `layoutOf`, `pack`, `unpack` (Task 2); `estimateFor` (Task 3); `step`, `GameEvent` (`step.ts`).
- Produces:
  ```ts
  // store.ts — nodes in typed arrays; no State objects kept for stored nodes
  export interface NodeStore {
    readonly size: number;
    /** Adds unless an equal packed situation is stored; returns its id, or -1 when it was already there. */
    add(words: Uint32Array, at: number, parent: number, action: number, g: number): number;
    words(id: number, out: Uint32Array, at: number): void;
    parent(id: number): number; action(id: number): number; g(id: number): number;
  }
  export function memoryStore(wordsPerNode: number): NodeStore;  // open addressing over a hash of the words; grows by doubling
  // astar.ts
  export interface SearchOptions { cap: number; refuse: Refuse | null; onProgress?: (p: Progress) => void; progressEvery?: number; store?: NodeStore; prune?: Prune | null }
  export interface Progress { expanded: number; stored: number; bestF: number; startH: number }
  export function astar(start: State, opts: SearchOptions): SolveResult;
  ```
  The open list is a binary heap of node ids keyed by (f, h, insertion order). `SolveResult.explored` is the number of stored nodes. `cap` bounds stored nodes. `Prune` is defined in Task 5; here `prune` is always null.

- [ ] **Step 1: Write the failing tests** (`test/astar.test.ts`): `memoryStore` returns -1 for a duplicate, grows past its first capacity, and round-trips words, parent, action and g; `astar` on a 1×3 corridor returns a 1-move line; a capped search returns `capped: true`; `onProgress` is called with non-decreasing `expanded`. Then the same-answers test from Task 1 now exercises A\* because `solve` points at it.
- [ ] **Step 2:** Run `node --test crete/test/astar.test.ts crete/test/same-answers.test.ts` — Expected: astar tests FAIL; same-answers still passes against the old path.
- [ ] **Step 3:** Implement `store.ts` and `astar.ts`; point `solve` and `solveRefusing` at `astar` (`refuse` checked on each successor, as the reference does).
- [ ] **Step 4:** Run `bash units.sh` — Expected: PASS, SHORTEST unchanged, same-answers green on all 10 levels and the corpus; gate assertions that fail only on `explored` are `todo` naming Task 6. Report each campaign level's `explored` (reference vs A\*) and the units.sh time.
- [ ] **Step 5: Commit** `feat(crete): the solver searches with A* over packed nodes`

---

### Task 5: Pruning that never changes an answer

**Files:**
- Create: `src/puzzle/prune.ts`
- Modify: `src/puzzle/astar.ts` (applies `prune`), `src/puzzle/solver.ts` (passes the default prune)
- Test: `test/prune.test.ts`, `test/same-answers.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export interface Prune { /** True when the node can be dropped. */ (s: State, words: Uint32Array, at: number): boolean; }
  export function pruneFor(level: Level, layout: Layout): Prune;
  ```
  Two rules (see Rulings): (1) estimate is `Infinity`; (2) dominance — a node is dropped when a stored node has identical packed words except the dominance fields (hearts, red/blue/yellow/green key counts, mirror/cake/cow counts, flippers, fire boots, pages bits) and is at least as good in every one of them with g no larger. Dominance is indexed by the packed words with those fields masked out.

- [ ] **Step 1: Write the failing tests** (`test/prune.test.ts`): a state with one more key than a stored equal one is not pruned, the one with fewer is; skates or suction differences are never dominated; a walled-off exit prunes at the start. Same-answers on all levels and `corpus(1, 300)` with pruning on. On level 10, A\* with pruning stores fewer nodes than without (assert `<`).
- [ ] **Step 2:** Run `node --test crete/test/prune.test.ts` — Expected: FAIL.
- [ ] **Step 3:** Implement `pruneFor`; wire it as the default in `solve`/`solveRefusing`. Add the frozen-block refinement only if same-answers stays green (see Rulings).
- [ ] **Step 4:** Run `bash units.sh` — Expected: PASS. Report stored-node counts per campaign level (reference, A\*, A\*+prune) and the units.sh time.
- [ ] **Step 5: Commit** `feat(crete): prune dominated and hopeless situations`

---

### Task 6: The difficulty measure on the new engine, solo and chase, and the shared bar

**Files:**
- Modify: `src/puzzle/difficulty.ts`, `src/campaign/chapters.ts` (if the gate's context needs the challenge set), `README.md` ("What makes a good level")
- Test: `test/difficulty.test.ts` (remove Task 4's `todo`s)

**Interfaces:**
- Consumes: `solve`, `solveRefusing`, `caught`.
- Produces (additions to `Difficulty` and new exports):
  ```ts
  label: 'solo' | 'chase' | 'unknown';   // chase when a catch is reachable from the start
  naiveWins: boolean;                     // the shortest path over plain floor (ignoring every piece), replayed, wins
  export function canCatch(level: Level, cap?: number): boolean | null;   // search that stops at the first catch; null when capped
  export const SHARED_BAR: SharedBar;     // the bar for shared levels, calibrated against Chapter 1's challenge levels 9 and 10
  export function sharedProblems(d: Difficulty, bar?: SharedBar): string[];  // empty when a shared level clears the bar
  ```
  `BAR` is recalibrated so that every Chapter 1 level keeps its current pass or fail in `challengeProblems`/`rampProblems` with the new `explored`. `SHARED_BAR` never requires a Minotaur: it requires a long enough quickest win, enough stored situations, and `naiveWins === false`; for chase levels a Minotaur delta and `greedyWins === false` count toward it as the spec says ("count toward the bar but are not required") — express that as: a chase level clears the bar either on the puzzle numbers alone or on puzzle numbers at a lower threshold plus a Minotaur delta ≥ `BAR.minotaurDelta`. Levels 9 and 10 clear `SHARED_BAR`; levels 1–8 do not (assert both).

- [ ] **Step 1: Write the failing tests:** `canCatch` true on a corridor with the Minotaur, false when he is walled behind water, null under a tiny cap; `label` matches; `naiveWins` true on an open room, false when a door blocks the plain path; `sharedProblems` empty for levels 9 and 10, non-empty for 1–8; the Chapter 1 gate passes with no `todo`.
- [ ] **Step 2:** Run `node --test crete/test/difficulty.test.ts` — Expected: FAIL.
- [ ] **Step 3:** Implement; recalibrate `BAR` and set `SHARED_BAR` from the measured table; rewrite the README section with the new numbers and the solo/chase labels (present tense).
- [ ] **Step 4:** Run `bash units.sh` — Expected: PASS. Report the measure table for levels 1–10 (old and new `explored`) and the chosen bar values.
- [ ] **Step 5: Commit** `feat(crete): difficulty on the fast solver; solo and chase; the shared-level bar`

---

### Task 7: Spill to a paged file

**Files:**
- Create: `src/puzzle/paged.ts`
- Modify: `src/puzzle/store.ts` (a spilling store)
- Test: `test/spill.test.ts`

**Interfaces:**
- Produces:
  ```ts
  // paged.ts
  export interface PagedFile { read(offset: number, into: Uint8Array): void; write(offset: number, from: Uint8Array): void; size(): number; truncate(size: number): void; }
  export function memoryFile(): PagedFile;   // for tests and for when no disk is available
  // store.ts
  export function spillingStore(wordsPerNode: number, file: PagedFile, memoryBudgetNodes: number): NodeStore;
  ```
  Up to `memoryBudgetNodes`, records live in memory; beyond it, records (packed words, parent, action, g) are appended to the file in fixed-size pages and only a fingerprint → id index stays in memory; a fingerprint match is confirmed by reading the record, so duplicates are exact. `astar` takes the store through `SearchOptions.store`.

- [ ] **Step 1: Write the failing tests:** `memoryFile` read/write/size/truncate; with `spillingStore(…, memoryFile(), 50)`, same-answers holds on all 10 levels and `corpus(4, 100)` (A\* with prune); a file whose `write` throws makes the search end `capped: true` with a reason, never "no win" (Review Focus 4).
- [ ] **Step 2:** Run `node --test crete/test/spill.test.ts` — Expected: FAIL.
- [ ] **Step 3:** Implement `paged.ts` and `spillingStore`.
- [ ] **Step 4:** Run the test and `bash units.sh` — Expected: PASS.
- [ ] **Step 5: Commit** `feat(crete): the solver can keep its nodes in a paged file`

---

### Task 8: The worker, OPFS, the result cache, and a big level

**Files:**
- Create: `src/solver-worker.ts` (worker entry), `src/solver-client.ts` (page side), `src/puzzle/cache.ts`
- Create: `src/tsconfig.worker.json` (a program with the WebWorker lib for `solver-worker.ts`); Modify: `build.json` (`programs` gains it; `entries` gains `{ "in": "src/solver-worker.ts", "out": "solver-worker", "format": "iife" }`), `tools/install-files.php` if new dist files need precaching
- Modify: `src/main.ts` (test hook gains `solveInWorker(levelText: string): Promise<…>`), `README.md` (modules, how the solver works, the worker and storage)
- Test: `test/cache.test.ts`, `test/solver-client.test.ts`, `test/solver-big.test.ts`; Create: `websites/www.cs/tests/e2e/crete-solver.spec.ts`; Modify: `websites/www.cs/tests/e2e/select.ts` and `shard.ts` (the new spec joins Crete's existing set, as `crete-chapter` did)

**Interfaces:**
- Consumes: `astar`, `spillingStore`, `memoryFile`, `PagedFile`, `measure`.
- Produces:
  ```ts
  // cache.ts — results keyed by SHA-256 of the level text
  export interface ResultStore { get(key: string): Promise<CachedResult | null>; put(key: string, r: CachedResult): Promise<void>; }
  export interface CachedResult { solved: boolean; line: string; explored: number }  // line as the move letters
  export function memoryResults(): ResultStore;
  // solver-client.ts
  export type SearchKind = 'solve' | 'measure';
  export interface SolverJob { progress(cb: (p: Progress) => void): void; stop(): void; resume(): void; result: Promise<SolveResult | Difficulty>; }
  export function startSearch(levelText: string, kind: SearchKind, worker?: WorkerLike): SolverJob;
  ```
  The worker opens an OPFS file through `createSyncAccessHandle()`; if OPFS is missing or refuses, it uses `memoryFile()` and reports `storage: 'memory'` in progress. The OPFS result cache lives in the same origin storage; any storage error reads as a miss. Stop pauses the search loop between batches; resume continues it.

- [ ] **Step 1: Write the failing tests:** `cache.test.ts` (miss, put/get, a throwing store reads as miss — Review Focus 5); `solver-client.test.ts` with a fake in-process `WorkerLike` (progress arrives, stop then resume completes, the result for level 9 has its pinned shortest, a cached second run returns without progress events); `solver-big.test.ts`: a generated 40 × 40 level with keys, doors and two blocks, built by a seeded generator kept in the test, is proven by `solve` within 20 s in Node (assert the time and that `same answers` holds against `solveBfs` with a generous cap if the reference finishes); `crete-solver.spec.ts`: the page's `__creteTest.solveInWorker(text)` for level 10 resolves with its pinned shortest, reports progress, and the page stays responsive (a `requestAnimationFrame` counter advances during the search).
- [ ] **Step 2:** Run the unit tests — Expected: FAIL.
- [ ] **Step 3:** Implement the worker, client and cache; add the build entry and the worker program; expose the test hook; update the README (current state).
- [ ] **Step 4:** Build per Global Constraints; `bash units.sh`; `sh crete/test.sh`; from `websites/www.cs`, run `make e2e E2E_ARGS="crete-solver.spec.ts crete-play.spec.ts crete-layout.spec.ts crete-chapter.spec.ts"` with `COMPOSE="docker compose -f ../../compose.yaml -p crete-solver-e2e"` exported for `make up`, the run and `down -v`. Expected: all PASS; units.sh time within the Task 1 baseline.
- [ ] **Step 5: Commit** `feat(crete): the solver runs in a worker with disk spill and a result cache`
