# Crete Endless at Three Difficulties Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Endless gets Easy, Medium and Hard. Every level blocks the habit players, is a corridor maze whose open
space earns its place, climbs by a difficulty score, and hides walls about one level in five. The editor's Check
rates any level on the same scale.

**Architecture:** The rules that do not depend on the run (`levelChecks` in `src/endless/gate.ts`) are built from
`src/puzzle/habits.ts` (the habit players) and `src/puzzle/rating.ts` (the score, openness, tools and bands). The
Endless gate stops at the first failure. The editor's new `rate` search runs the same function with every rule, in
batches, in the solver worker. The generator (`src/endless/generate.ts`) climbs maze drafts (`src/endless/draft.ts`)
on the score. Each grade has its own bank, saved run and best.

**Tech Stack:** TypeScript 7 run directly by Node 22+ (type stripping), node:test, Preact, esbuild through
`games/_kit/build/build.mjs`, Playwright for the e2e specs.

**Spec:** `docs/superpowers/specs/2026-11-04-crete-endless-difficulty-design.md`

## Global Constraints

- Grades `easy | medium | hard`, named "Easy", "Medium", "Hard"; Medium is the default.
- Score = detour + offRoute + 2 × away + 3 × waits + 3 × traps + 4 × forced; traps at every 3rd turn.
- `GRADE_BANDS`: easy first 25–40, plateau 45–70; medium 35–55, 70–110; hard 50–75, 110–170. `CLIMB` 1.1–1.35.
- `HIDDEN_EVERY` 5, `HIDDEN_EASE` 0.7–0.9. `FLOOR` 2,000. `EXPLORED_MOST` 30,000. `CHECK_CAP` 4 × `EXPLORED_MOST`.
- `OPEN.most` 0.5, `OPEN.area` 6 cells. `BAND_FROM`: Easy 25, Medium 70, Hard 110, Beyond Hard past 170.
- Link parameter `&difficulty=<grade>`; storage `crete-endless-<grade>` and `crete-endless-grade`; the old
  `crete-endless` best seeds Easy's.
- Everything the generator decides is deterministic: no `Math.random`, no `Math.log`/`Math.exp` (use `ln`/`expNeg`).
- Buttons and headings in Title Case; sentences in sentence case. Docs describe the current state.
- Unit tests one at a time under `systemd-run --user --scope -q -p MemoryMax=3G -p MemorySwapMax=0 /usr/bin/timeout 600 node --test test/<f>.test.ts`.
- Campaign measures in `test/engine-same/` stay bit for bit; only the bank and search parts are recorded again.

## Review Focus

- A run in play while the card shows another grade: wins and Next Level go to the run's own grade (mode test).
- A link with `difficulty=` missing or unknown plays Medium, and an old `?seed=` link still opens the card (mode test, e2e).
- Corrupt or old storage under any grade's key reads as no run and never throws; the old best moves to Easy only when Easy has none (saved test).
- Stop during the rating's checks pauses between searches, and the result after Keep Searching is the same (host test).
- A bank level of one grade whose score falls in another grade's band gets the same verdict from the editor and the gate (agreement test).

---

### Task 1: Habit players and the score (`src/puzzle/habits.ts`, `src/puzzle/rating.ts`)

**Files:** Create `src/puzzle/habits.ts`, `src/puzzle/rating.ts`; modify `src/puzzle/difficulty.ts` (add
`purposing`); test `test/rating.test.ts`.

**Interfaces (produces):**
- `HABITS`, `HABIT_LIST: Habit[]`, `playHabit(level, h, limit): { won; turns }`, `habitLimit(shortest) = 4 × shortest + 50`, `habitWins(level, shortest): Habit[]`, `goalDistance(s): number`.
- `scoring(level, d, cost?): Generator<Progress, Score>`; `Score { detour; offRoute; away; waits; traps; forced; total }`; `WEIGHTS`.
- `openness(level): { open; share; areas: { cells }[] }`, `walledIn(level, cells): Level`, `openProblems(level, score, cap)`, `habitProblems(level, d)`, `toolProblems(level, d, grade | null, cap)`, each giving `Problem { rule; words; mended? }`.
- `bandOf(total): Band`, `gradeOf(band): Grade`, `GRADES`, `GRADE_NAMES`, `BAND_FROM`, `OPEN`.
- `purposing(level, d, cap): Generator<Progress, string[]>`, the same answers as `purposeProblems`.

- [ ] **Step 1: Write the failing tests** in `test/rating.test.ts`:
  - `the cow habit wins a corridor level where setting the cow down at once clears it, and no habit wins a level that needs a waiting move`: two small fixture levels; assert `habitWins` contains `cowAtOnce`, and is `[]`.
  - `the step-around walk wins where the plain walk through the Minotaur fails`: a fixture where `naiveWalkWins` is false and `habitWins` includes `walk`.
  - `the score's parts add up by WEIGHTS, detour is the measure's minotaurDelta, waits are the line's w's`: for campaign `ch8-7` assert `total` equals the weighted sum and `detour === measure(level).minotaurDelta`.
  - `openness: a solid 3 × 3 room is one area of 9 cells and walledIn leaves no 2 × 2 block`.
  - `the tools: a cow nobody needs is named, with the level without it as the mend`.
  - `purposing answers as purposeProblems on every campaign level of Chapter 2`.
  - `bands: 24 Too Easy, 25 Easy, 70 Medium, 110 Hard, 170 Hard, 171 Beyond Hard`.
- [ ] **Step 2:** Run it and see it fail (modules missing).
- [ ] **Step 3:** Implement the modules as the spec's sections "The habit players", "The difficulty score", "Mazes and open space" and "The tools and the cow" describe.
- [ ] **Step 4:** Run `test/rating.test.ts` and `test/difficulty.test.ts`; both pass.
- [ ] **Step 5: Commit** "Crete: habit players, the difficulty score, openness and the tools' rules".

### Task 2: Maze drafts (`src/endless/draft.ts`)

**Files:** Modify `src/endless/draft.ts`; test `test/endless.test.ts` (the draft tests).

**Interfaces (produces):** `Plan { rows; cols; families; relics; winding; braid; chambers }` (odd sides, 7 or more);
`draft(rng, plan): Sketch | null`; `mutate(rng, sketch)`; `textOf`.

- [ ] **Step 1:** Replace the rooms-and-halls draft test with `a draft is a maze: the same from the same seed, corridors one wide on a lattice, no lone wall, the exit on the border far from Theseus`. Over 20 seeds, assert:
  - `openness(level).share <= 0.5` with `chambers: 0`;
  - `tidyProblems` is `[]`;
  - the exit's steps from Theseus are in the farthest third of the openings;
  - `mutate` keeps a parsable level.
- [ ] **Step 2:** Run and see it fail.
- [ ] **Step 3:** Implement the growing tree, the braid, the chambers and the placement as in the spec.
- [ ] **Step 4:** Run `test/endless.test.ts`; the draft tests pass.
- [ ] **Step 5: Commit** "Crete Endless: corridor maze drafts".

### Task 3: The gate, grades and the climb (`src/endless/gate.ts`, `src/endless/generate.ts`)

**Files:** Modify `src/endless/gate.ts`, `src/endless/generate.ts`; test `test/endless.test.ts`, `test/endless-gate.test.ts`.

**Interfaces (produces):**
- `GRADE_BANDS`, `CLIMB`, `HIDDEN_EASE`, `HIDDEN_EVERY`, `FLOOR`, `ENDLESS_SHARED_BAR`, `EXPLORED_MOST`, `CHECK_CAP`.
- `bandAfter(previous: number | null, grade): Band`, `hiddenBand(plain: Band): Band`.
- `levelChecks(level, d, grade | (score) => grade, all, cap): Generator<Progress, Checked>`; `Checked { score; problems }`.
- `rating(level, d, cap = CHECK_CAP): Generator<Progress, Rated>`; `Rated { d; score; band; problems }`.
- `runProblems(level, d, known, run)`, `bandProblems(score, band)`.
- `gateProblems(level, d, Place { grade; band; previous }, known, run, cap)`.
- `mazeFeaturesOf`, `mazeOverlap`.
- `Request` and `Played` gain `grade` and `score`; `Made` and `BankLevel` gain `score`.
- `generate(req, banks: Record<Grade, BankLevel[]>, known)`, `placeOf(req): { band; hides; before }`.
- `search(key, aim: Aim, previous, known, run, budget, at, progress?, trace?)`; `Aim { tier; grade; band; hides; family? }`; `holds(level, family)`.

- [ ] **Step 1:** Write the failing tests.
  - `the climb: each grade's first band, then 1.1 to 1.35 times the last plain level, then its plateau`: e.g. `bandAfter(40, 'medium')` is `{ least: 44, most: 54 }`, and `bandAfter(80, 'medium')` is the plateau 70–110.
  - `a hidden level's band is 0.7 to 0.9 of its place's low end, and one depth in five hides walls once the tier has them` (over depths 2..200 for one seed: 15% to 25%; never at tier 3).
  - `the tidy maze: a dead-end corridor is tidy, a one-cell nub off a hall is not`.
  - `the same seed, tier, grade and depth give the same level; another grade another` (`generate` with budget 400,000).
  - `a fixed seed is made fresh at each grade and passes the whole gate`.
- [ ] **Step 2:** Run and see them fail.
- [ ] **Step 3:** Implement as the spec's "The grades and the climb" and "The gate's order" describe. The climb's `distance` adds the habit players and the real score, and the search mends `Problem.mended`.
- [ ] **Step 4:** Run `test/endless.test.ts`; it passes.
- [ ] **Step 5: Commit** "Crete Endless: grades, the score's climb, hidden walls at every depth".

### Task 4: Saved runs, mode, link and card per grade

**Files:**
- Modify `src/endless/saved.ts`, `src/endless/mode.ts`, `src/endless/host.ts`, `src/endless-worker.ts`, `src/main.ts`, `src/ui/endless.tsx`, `src/ui.ts` and `game.css`.
- Test `test/endless.test.ts`.

**Interfaces (produces):**
- `endlessKey(grade)`, `GRADE_KEY`, `OLD_ENDLESS_KEY`, `gradePref(storage)`, `createEndlessSaved(storage, grade)`.
- `EndlessDeps.saved(grade)`, `grade()` and `setGrade(g)`.
- `EndlessMode.choose(g)`, `newRun(seed?, tier?, grade?)` and `link(seed, tier, grade?)`.
- `gradeFrom(raw)`; `introOf(seed, level, grade)`; `EndlessView.grade`.

- [ ] **Step 1:** Write the failing tests.
  - `each grade keeps its own run and best; the old best seeds Easy's once`.
  - `a link's difficulty picks the card's grade, Medium when it names none or another word`.
  - `a run in play keeps its grade for wins and Next Level while the card shows another`.
  - `the background makes the shown grade's levels`.
- [ ] **Step 2:** Run and see them fail.
- [ ] **Step 3:** Implement as the spec's "Saved runs, links and the card". The card's picker reuses `.chapter-tab` with `pressed`, ids `endless-grade-easy|medium|hard`.
- [ ] **Step 4:** Run `test/endless.test.ts` and the build check `node ../_kit/build/build.mjs crete --check`; both pass.
- [ ] **Step 5: Commit** "Crete Endless: Easy, Medium and Hard on the card, each with its own run and best".

### Task 5: The editor's rating

**Files:**
- Modify `src/solver-host.ts` (kind `rate`), `src/editor/check.ts` (`rated` in the done state, `ratingLines`, `scoreWords`, the strip's band), `src/editor/check-panel.tsx`, `src/editor/editor.ts` (Check starts `rate`) and `game.css`.
- Test `test/editor-check.test.ts` and a new `test/rating-agree.test.ts`.

- [ ] **Step 1:** Write the failing tests.
  - `Check shows the band, the score in parts and each failed rule in plain words` (a fake job answering a `Rated`).
  - `the strip says "· Medium" and ", not for Endless" when a rule fails`.
  - `the rate search yields between the rating's checks: stop holds it, resume ends it with the same answer` (host test).
  - `test/rating-agree.test.ts`: for every bank level of every grade, `finish(rating(level, d)).problems` is `[]` exactly when `gateProblems` without the run checks is `[]`, and the score agrees.
- [ ] **Step 2:** Run and see them fail.
- [ ] **Step 3:** Implement as the spec's "The editor's rating".
- [ ] **Step 4:** Run the four test files; they pass.
- [ ] **Step 5: Commit** "Crete editor: Check rates a level as Endless would".

### Task 6: Banks per grade (`tools/endless-bank.ts`, `src/endless/bank.ts`)

**Files:**
- Modify `tools/endless-bank.ts` (jobs by grade, chapter, family and band, `fill` by lanes, `write` to `BANKS`) and `src/endless/bank.ts` (generated).
- Modify `test/endless-bank.ts`, `test/endless-bank-*.test.ts` and `test/endless-gate.test.ts`.

- [ ] **Step 1:** Write the failing tests.
  - `every grade's bank offers ten levels or more at every tier, holds hidden-wall levels, and every family of every chapter; Hard holds at most one cow level in five`.
  - `a run from the bank alone climbs by the score at every tier and grade`.
  - `every bank level passes the whole gate at its grade and its numbers and score are as written` (the shards).
- [ ] **Step 2:** Run `node tools/endless-bank.ts fill <lane> 4 <dir>` in four lanes under the memory scope, then `write`.
- [ ] **Step 3:** Run the bank and gate tests; they pass.
- [ ] **Step 4: Commit** "Crete Endless: a bank per grade".

### Task 7: Piece coverage, habits on the banks, the campaign report, engine-same

**Files:**
- Test `test/endless-pieces.test.ts`, `test/difficulty.test.ts` (the report-only campaign test), `test/engine-same.ts` (searches with a grade).
- Recorded `test/engine-same/shard-*.json`.

- [ ] **Step 1:** Write `every piece a tier unlocks appears across a sample of seeds per grade`. Use `planOf` and `draft` over 60 seeds for each tier and grade: every family of the tier, the cow in Hard too, appears on some draft. The bank test above covers final levels.
- [ ] **Step 2:** Write the report-only campaign test: it counts the levels a habit wins and the levels over `OPEN.most`, and fails on nothing but a thrown error.
- [ ] **Step 3:** Record shards 0–3 with `node tools/engine-same.ts record <k>`. Check that the campaign parts of each shard are identical to the previous recording (`jq '.campaign'` diff empty).
- [ ] **Step 4:** Run the four engine-same tests one at a time; they pass.
- [ ] **Step 5: Commit** "Crete Endless: piece coverage, the campaign's report, engine answers recorded again".

### Task 8: Timing, docs, e2e, samples, landing

- [ ] **Step 1:** Measure generation time with `tools/endless-bench.ts` (grades × tiers, 12 parts as the client runs them) under `systemd-run --user --scope -p CPUQuota=25%`. Record the medians and p90 per grade, first and plateau, and the share made fresh, in this plan's Results. Raise `PARTS` or `PART_BUDGET` if Hard's fresh share falls under 60%.
- [ ] **Step 2:** Update the README ("What makes a good level" rules, "The editor", "Endless") and `docs/superpowers/roadmap.md` to describe the current state.
- [ ] **Step 3:** Update `tests/e2e/crete-endless.spec.ts`:
  - the picker;
  - the link with `&difficulty=hard`;
  - Medium by default.

  Then run it and `crete-editor.spec.ts` locally with their own compose project.
- [ ] **Step 4:** Render the samples: per grade, an early level and a plateau level, Modern at 390 × 844 at the opening view, one Classic, and the editor after Check. Save them to the scratch `endlessdesign/img/`.
- [ ] **Step 5:** Open the PR, drive it with foundry:pr-fix-loop, merge when green, and check the deploy.

## Results

**Rulings made on the way.**
- The floor is 2,000 situations, not the shared bar's 6,000. Raw maze drafts score 100 to 300 from 450 to 7,000
  situations. At 6,000, most drafts that passed every other check failed; the score and the habits now keep out
  easy levels.
- The ceiling is 30,000 situations, not 150,000. At 60,000, two thirds of a search's budget went on solves that hit
  their cap.
- Plateaus are Medium 70–110 and Hard 110–170, down from a first draft of 80–120 and 130–200. A part found a level
  at those first plateaus well under one time in ten; the bands that shipped still sit on the campaign's hardest
  levels and past them (see the spec).
- The exit and relics are placed far from Theseus. Being caught throws him back to his start, and in a corridor
  maze that carried him past a Minotaur blocking the way: two drafts in three had a catch on the best line. Placing
  the way out on the far side stops the catch being a shortcut.
- The climb mends what it can instead of throwing the draft away. A cow or mirror no one needs is taken out, and an
  open area that does not earn its place is walled in.
- Endless's likeness check leaves out the lattice's corners. Every maze has walls there, so with them counted half
  of all drafts looked like a campaign level.
- The editor's problem list is kept short: winning habits fold into one line, "(and N more habits)", and open areas
  into one.

**Generation time at a 4× throttle** (`systemd-run --user --scope -p CPUQuota=25%`, one core at a quarter speed). Each
row is one request, its 12 parts run in order on one worker, then laid out on three workers as `src/endless/client.ts`
runs them:

| Grade | Place | Tier | From | Parts run | One worker | Three workers |
| --- | --- | --- | --- | --- | --- | --- |
| Easy | 2nd level | 9 | made (39) | 1 | 23 s | 23 s |
| Easy | 2nd level | 5 | made (38) | 6 | 364 s | 126 s |
| Easy | plateau | 9 | made (48) | 3 | 163 s | 61 s |
| Easy | plateau | 5 | made (68) | 6 | 316 s | 123 s |
| Medium | 2nd level | 9 | made (42) | 8 | 616 s | 217 s |
| Medium | 2nd level | 5 | made (50) | 1 | 55 s | 55 s |
| Medium | plateau | 9 | made (77) | 6 | 370 s | 141 s |
| Medium | plateau | 5 | made (93) | 1 | 34 s | 34 s |
| Hard | 2nd level | 9 | made (49) | 5 | 385 s | 167 s |
| Hard | 2nd level | 5 | made (73) | 3 | 184 s | 68 s |
| Hard | plateau | 9 | made (85, hides walls) | 5 | 347 s | 149 s |
| Hard | plateau | 5 | bank | 12 | 824 s | 276 s |

- 11 of 12 were made fresh. The median on three workers is about 2 minutes and the worst 4.6 minutes; the worst was
  a Hard plateau level that fell back to its bank.
- A run never stalls. Its first level comes from the bank at once, the workers make the next three while a level is
  played (`AHEAD`), and a search that runs out of budget takes a bank level.
- Hard leans on its bank at the plateau, which holds plateau levels for every tier.
- `PARTS` and `PART_BUDGET` are unchanged.

**The banks.**

| Grade | Levels | Habit wins | Open share (mean, max) | Hide walls | Cows | Scores |
| --- | --- | --- | --- | --- | --- | --- |
| Easy | 28 | 0 (0%) | 0.00, 0.00 | 4 | 7 | 22–64 |
| Medium | 28 | 0 (0%) | 0.00, 0.07 | 4 | 4 | 31–102 |
| Hard | 27 | 0 (0%) | 0.00, 0.00 | 4 | 1 | 37–161 |

For comparison, the old bank's open share was 0.91, and the habits won 11 of its 41 levels; the campaign's median is
0.72. Two Hard jobs ran out of their 400,000,000 budget: tier 1 ice at 103–125, and tier 1 cow at 103–125, whose
place the first band's cow job took. One Medium gravel level repeated another made in a parallel lane and was made
again.

The engine-same shards were recorded again. Their campaign answers are identical to the earlier recordings, shard
for shard.
