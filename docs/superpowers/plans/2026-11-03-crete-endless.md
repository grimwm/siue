# Crete Endless: Implementation Plan

**Goal:** ship Endless, the last step on the Crete roadmap: levels without end, made by a seeded generator on the game's own engine and checked by the solver through the same gate as the campaign's levels, climbing in difficulty with the run, on any phone, in both looks.

**Spec:** `docs/superpowers/specs/2026-10-16-crete-redesign-vision.md` ("a seeded endless mode after [the campaign]", "Endless mode is [the old chase's] successor, and old `?seed=` links open endless mode on that seed", part 6: "the seeded generator on the same engine, checked by the solver"). The README's "Rules for new levels", and its "One gate for every tool": the Endless generator applies every check the campaign's tests apply.

**Tech stack:** TypeScript, Preact, node:test, Playwright e2e; a second Web Worker bundle.

## How it works for a player

- The title card has **Endless** (key O). Its card says what Endless is and which pieces a new run takes, shows the saved run (seed, level, levels cleared, moves) with **Continue**, the player's deepest level cleared without help, **New Run**, a **Seed** box with **Play This Seed**, and **Copy Seed Link**.
- **New Run** draws a fresh six-letter seed. The run's first level opens at once; every level is named for a hall of the Labyrinth ("The Sunken Court") from the seed and depth, its start card says "Endless · Level N", and the status bar "Endless • Level N".
- While a level is played the worker already makes the next one. A win's card offers **Next Level** (Enter), Retry and the score set against the fewest moves ("41 moves · best possible 38 (3 over)"). Next Level opens the next level at once when it is made, else the Endless card shows **Finding a Good Level…** with a progress bar and Cancel until it is.
- The run is saved after every level and comes back with Continue after a reload; a run cleared with Ariadne's thread at any level is marked "with help" and sets no deepest.
- A `?seed=<seed>&tier=<n>` link (Copy Seed Link writes one) opens the Endless card with **Play Seed <seed>**; the old chase's `?seed=` links (no tier) open it the same way with the player's own pieces.
- Classic and Modern, keyboard, the touch pad and the view tips all work as in any level: an Endless level is a level from outside the campaign (`src/outside.ts`), like a shared one.

## Rulings

Claude settled these without asking, under the roadmap's standing rule.

- **The pieces (the tier).** A chapter's pieces are the player's once every one of its teaching levels is cleared (where the piece is taught); Chapter 1's always are. A new run takes the chapters in order up to the first not yet taught, and every piece once the whole campaign is cleared (`src/endless/tier.ts`). A run keeps the tier it began with, and a seed link carries it, so the same seed plays the same levels for anyone who opens it.
- **The challenge bar.** An Endless level is a challenge level of the latest chapter whose pieces it holds (`chapterOf` in `src/endless/gate.ts`), measured against that chapter's teaching levels exactly as the campaign's challenge levels are: at least 20 times their most situations and no shorter than their longest line, and never under the shared bar for a chase (6,000 situations, 30 moves). The teaching numbers are constants (`TEACHING`), measured again by the test.
- **The ramp.** The first level stores anything from 6,000 to 20,000 situations. Each level after it stores 1.2 to 1.6 times the one before (inside the campaign's `RAMP` of 1.2 to 2.2, aimed at its 1.3), a level that hides walls 1.1 to 1.5 times (`HIDDEN.ramp`) and never more than `HIDDEN.most`. Once a level stores 30,000 the climb levels off: every later level stores 30,000 to 50,000, about a middle chapter's last levels (Chapter 2's stores 44,006, Chapter 5's 54,608), and the ramp check no longer applies. An endless climb by 1.3 a level would pass the solver's cap within twenty levels, and a phone could not make such levels.
- **The rest of the gate.** Every level also passes `sharedProblems`, `threatProblems` with the challenge bar, `hiddenProblems`, `catchProblems` (through `challengeProblems`), `startProblems` (nothing starts under Theseus, the beast or a hazard) and `purposeProblems`, all from `src/puzzle/difficulty.ts`; plus two the campaign's tests keep for released levels: a **tidy** layout of rooms and halls (no wall standing alone, no bare pocket) and a **new** layout, overlapping no campaign level and none of the run's last twelve by `SAME` (0.42), with the measure moved from `test/layouts.test.ts` to `src/puzzle/layouts.ts` so both share it.
- **Every piece has a purpose a player sees** (`purposeProblems`). The campaign's every-piece rule (`uselessProblems`) also passes a piece whose loss shrinks the search 1.3 times or more: a door and key the shortest line never opens add situations to the search, so they passed, though a player can walk past them. That clause let through every unused piece the owner found: 28 of the first bank's 44 levels and 30 of the campaign's 100 have such a piece. Endless holds every level to the rule a player sees instead: a piece has a purpose when the shortest line uses it (walks through a door of a key's colour, wears gear on its ground, raises the mirror, sets the cow down, takes a spare relic, pushes a block, presses a button, crosses a tile) or when losing it makes the level unwinnable or changes its fewest moves (a door that holds the beast back). The campaign's levels are rebuilt to it in the next PR, and its tests then hold them to it too.
- **Fresh levels, and the bank as a safety net.** Endless makes its levels from the seed; the bank only catches what the search cannot make in its budget. A run's first level comes from the bank, picked by the seed, so a run starts at once on any phone, and its start card says "From the level bank." (so does any other level from the bank). Every later level is searched for in `PARTS` (12) parts of `PART_BUDGET` (3,000,000 situations) each; part k is a search of its own steered by the seed and k, the level is the one the lowest part that finds one finds, and every device settles on the same one, the parts run one after another or side by side. When no part finds one the level is the bank's, picked by the seed among those in the band that the tier offers and the run has not had lately (when none is in the band, one within the campaign's own `RAMP` of 1.2 to 2.2, then one on the plateau). The bank is made by the same generator ahead of time (`tools/endless-bank.ts fill`, resumable, with a job per chapter and band so each tier's newest pieces have levels) and committed; `test/endless-bank-*.test.ts` measure every bank level again and run it through the whole gate, a quarter each.
- **Several workers, three levels ahead.** The page runs one worker per core but one, at most three (`workersFor`), one alone on a low battery that is not charging (the Battery API, where the browser has it). While a level is played the workers make the next three, one level after another (each needs the one before it for its band and its new-layout check), and the saved run keeps them, so a reload loses none.
- **Shapes.** Drafts take boards from 11 to 15 cells a side (12 at least for Chapter 1's pieces alone, whose 36-move bar needs room) and grids of 2 to 4 rooms each way. The first bank, all 3 by 3 rooms on boards of 12 to 14, repeated its own layouts: 20 of its 36 levels overlapped another by `SAME` or more. Shapes of every size fixed that, and `tools/endless-bank.ts write` leaves out any level whose layout repeats one it has kept.
- **Determinism and builds.** A seed reproduces its run within a build. A later build whose generator or gate changes may make other levels from the same seed; a saved run keeps its levels' texts, so a run in progress never changes under the player.
- **Help.** Using Ariadne's thread on an Endless level still clears it and moves the run on (a run has no other way forward), but marks the run "with help", and such a run sets no deepest.
- **Score and best.** A level's score is its moves against its fewest, as in the campaign. The run counts its levels cleared and their moves; the best is the deepest level a run cleared without help, with its seed.
- **Names.** Endless levels carry generated hall names, never typed text; the start card's intro gives the seed and the fewest moves, and says "From the level bank." for a bank level.
- **The key.** O opens Endless from the title card: K and J already move the focus on every card.
- **No WebAssembly.** The engine's hot path is TypeScript that copies as little as it can ("The engine's speed", below), 2.3 to 2.7 times as fast as the engine Endless shipped with and giving the same answers bit for bit. After it the rules (`step`) take 42% of a search, so even a WebAssembly `step` that cost nothing could make a search at most 1.7 times as fast, short of the 2 times that would earn a second toolchain; and a `step` in WebAssembly would have to take each situation across the boundary, which is the copying the TypeScript work took out. Only the whole search (rules, packing, store, pruning) in WebAssembly could pass that bar, a second engine to keep equal to the first.

## Architecture

DOM-free modules in `src/endless/`:

- `random.ts`: seed hashing (cyrb53) and the sfc32 generator; `rngOf(...parts)`, `cleanSeed`, `newSeed`.
- `draft.ts`: a draft of rooms and halls (a grid of rooms one wall apart, a random spanning tree of doorways, some walls taken out whole as halls, a few loops) with the pieces of a few families on the doorways and in the rooms; `mutate` makes one small change (a piece moved, a doorway's piece moved, a hazard turned, a doorway opened or walled up).
- `gate.ts`: the bands, the per-chapter bar, `tidyProblems`, `newProblems`, `quickProblems` and `gateProblems`.
- `generate.ts`: `search`, a climb from a draft steered by the seed: each change kept when it brings the level no further from passing the cheap checks (`distance`: one capped solve, and one without the beast), now and then a step up so a climb is not stuck; a draft that passes them goes through the whole gate, and a piece the gate finds useless is taken out and the climb goes on. `generate` wraps it with the budget and the bank, `fromBank` picks a bank level.
- `bank.ts` (written by the tool), `campaign.ts` (the campaign's level texts without its words, for the worker), `host.ts` (the worker's message handler: one part, or the bank's level), `client.ts` (the page's side: the workers, the parts handed out in order and settled on the lowest that finds a level, one job at a time, cancel ends the workers), `saved.ts` (the saved run and best under `crete-endless`), `tier.ts`, `name.ts`, `mode.ts` (opens levels, prefetches the next).

The page: `src/endless-worker.ts` (bundle `dist/endless-worker.js`, versioned by `ENDLESS_WORKER_V`), `src/ui/endless.tsx` (the card), and changes to `src/ui.ts`, `src/ui/title.tsx`, `src/main.ts`, `src/outside.ts`, `src/keys.ts`, `src/layers.ts`, `game.css`, `index.html`.

## Measurements

On the workstation (Intel i7-9700, 8 cores, 16 GB, Linux; Node 22, one core a search). The workstation was shared with other work while these ran (load 12 to 16 on its 8 cores), so the times are about twice what an idle core gives; the shares made fresh do not depend on time, since every budget is counted in situations.

**Fresh levels.** `tools/endless-bench.ts` makes a run's second level (after the bank's first for that seed) for seeds `bench0` to `bench9` at every tier:

| Tier | Before: one search of 6,000,000, the old every-piece rule | Now: 12 parts of 3,000,000, `purposeProblems` |
| --- | --- | --- |
| 1 | 3 of 10 | 11 of 11 |
| 2 | 4 of 10 | 10 of 10 |
| 3 | 3 of 10 | 10 of 10 |
| 4 | 3 of 10 | 10 of 10 |
| 5 | 7 of 10 | 10 of 10 |
| 6 | 6 of 10 | 10 of 10 |
| 7 | 5 of 10 | 10 of 10 |
| 8 | 3 of 10 | 9 of 10 |
| 9 | 6 of 10 | 9 of 10 |
| 10 | 4 of 10 | 10 of 10 |
| All | 44 of 100 (44%) | 99 of 101 (98%) |

The level came from part 0 in 21 of the 101, part 1 in 21, part 2 in 13, from parts 3 to 11 in 44, and from the bank in 2: a part finds a level about one time in five. Within the old budget's 6,000,000 (parts 0 and 1) the new search makes 42 of 101, the old 44 of 100: the stricter every-piece rule costs about what the cheaper climb below saves.

**Where the time goes.** A CPU profile of a whole search: 95% in the climb's capped solves (`distance`), 3% in the gate's measure and every-piece check. Inside the solves, after the engine work below: the game's `step` 42% (its own code 13%, the Minotaur's steps 12%, the hazards' 8%), the pruning 15%, the A* loop and its heap and store about 20%, packing and unpacking situations 11%, the garbage collector 3%. Before it, `step` took 55% (half of it copying and comparing the board's arrays), packing and unpacking 13% and the pruning 8%. Of the situations the climb's solves store, about 40% go to drafts too easy for their band, 22% to drafts in the band that fail another cheap check, 21% to drafts too hard (the solve hits its cap), and the rest to drafts that cannot be won and to the second solve without the beast.

**What each change gave**, on the same seeds:

| Change | Effect |
| --- | --- |
| The new-layout check before any solve (it was after the measure) | Tier 1: in 4 searches, 9 of 11 levels that reached the measure were thrown out for repeating a campaign layout, after a whole climb; now such a draft is judged far and climbs away; tier 1 went from 2 to 3 of 4 made |
| Each draft's distance remembered by its text | 89 to 127 solves saved in 3 to 4 searches (a change that undoes the one before) |
| The plain walk wins, or the beast is penned with no mirror and no snare: rejected without a solve (both are the gate's own failures; `test/difficulty.test.ts` checks they agree with it) | 120 of about 700 drafts in 3 searches, 17% of the climb's solves |
| Parts: 12 of 3,000,000, lowest finder wins | The share made fresh: 42% within 6,000,000, 98% within all 12 parts |
| Early stops in the yes/no searches | None: the every-piece searches already stop at their first shortest win; stopping them sooner (at the old optimum, or once the search passes the old count / 1.3) turns some "capped" answers into "changed", which would change verdicts |
| Packed situations, typed-array hash table | Already in place (`src/puzzle/pack.ts`, `src/puzzle/store.ts`) |
| The every-piece check across workers | Not done: the workers already run a level's parts side by side, which keeps every core busy, and the check is 3% of the time |
| Drafts built along a route | Not done; the parts make 98% fresh without it |

**Time per fresh level**, with the engine as it is now (below), the parts run as `src/endless/client.ts` runs them: `tools/endless-bench.ts` for seeds `bench0` to `bench9` at every tier, on the workstation shared with other work (load 6 to 17). The same seeds make 93 of 100 levels fresh against today's bank, the rest from the bank after all 12 parts. Three workers, per tier:

| Tier | Median | p90 | Phone median (estimated) | Phone p90 (estimated) |
| --- | --- | --- | --- | --- |
| 1 | 38 s | 51 s | 132 s | 178 s |
| 2 | 25 s | 43 s | 89 s | 150 s |
| 3 | 21 s | 62 s | 75 s | 217 s |
| 4 | 32 s | 68 s | 112 s | 237 s |
| 5 | 35 s | 83 s | 122 s | 292 s |
| 6 | 24 s | 46 s | 83 s | 161 s |
| 7 | 27 s | 161 s | 94 s | 564 s |
| 8 | 58 s | 112 s | 204 s | 391 s |
| 9 | 24 s | 71 s | 83 s | 248 s |
| 10 | 36 s | 112 s | 126 s | 393 s |
| All | 28 s | 68 s | 97 s | 237 s |

One worker takes 34 to 160 s a level at the median. The engine Endless first shipped with took 52 to 151 s a level at the median on three workers (load 12 to 16). A phone's JavaScript runs at about a third to a quarter of the workstation's (an estimate: Chrome cannot throttle a worker, and no phone was at hand); the phone columns take 3.5 times the workstation's time.

**Staying ahead.** Simulated from those times (`tools/endless-bench.ts sum`) over 30 levels, the workers three levels ahead (`AHEAD`), three workers. On the workstation a player who takes 120 s a level never waits at Next Level, and one who takes 60 s waits at most once in 29 levels (tiers 7 and 8). On a phone a 120 s player waits at 0 to 4 of 29 levels at seven tiers, 6 at tier 7, 12 at tier 5 and 15 at tier 8, with 0.5 to 2.4 levels ready at each win; a 60 s player waits at 11 to 29 of 29. With the first engine a phone player waited at most levels at either pace.

**The bank** holds 41 levels (`src/endless/bank.ts`): 12 of Chapter 1's pieces alone, 7 of Chapter 2's, 4 of Chapter 3's, 2 of Chapter 5's, 4 of Chapter 6's, 3 of Chapter 7's, 5 of Chapter 8's and 4 of Chapter 9's, so tier 1 is offered 12 and tiers 9 and 10 all 41; `test/endless-gate.test.ts` checks every tier is offered ten or more. A bank level takes 1 to 20 minutes to make here (Chapter 9's the longest, as the climb often takes their pieces out as decoys), and the fill's first rounds repeated layouts within the bank (26 of 61 left out), so its last round checks each new level against the bank as it stands. It lives only in `dist/endless-worker.js`, which the page starts when Endless asks for a level (the service worker also keeps it for playing offline). The bank is 14.6 KB of source (3.2 KB gzipped) in a bundle of 116 KB (38 KB gzipped), so it needs no compact encoding.

In the browser (Chrome, `tests/e2e`, the local site), through the page's own Endless, measured with one worker:

| Measure | Workstation | Main thread throttled 4× (CDP) |
| --- | --- | --- |
| New Run to the first level's start card (the bank's) | 229 to 279 ms | 552 ms |
| The page's longest stall while the worker searches | 21 to 33 ms | 38 ms |

So the page never freezes: the workers carry every search.

**The engine's speed.** Each change measured on the same work: plain solves of campaign levels 70, 80, 89, 90, 99 and 100 (a finale's search each, 805,000 situations in all), and two Endless parts of 1,000,000 situations (tier 5 and tier 8), the old engine and the new run one after the other on the workstation, which was shared with other work (load 6 to 13 on its 8 cores):

| Change | Solves | Parts |
| --- | --- | --- |
| A turn shares the state's terrain and objects until it changes them (it copied both, then compared them item by item to share them again, half of `step`'s time) | 1.6× | 1.5× |
| `unpack` shares one terrain and one objects array per pattern of bits, and one object per cell; `pack` copies the bits a child shares with its parent | 2.0× (both) | 2.2× (both) |
| Keys, tools and gear shared until changed; cells from one table; the Minotaur's and a ride's steps without lists, closures or a set; pruning's fields in typed arrays | 2.4× (all three) | 2.7× (all three) |
| Hazard checks without closures; pruning's groups keep their hash | about 1.04× more | about 1.04× more |

Every change gives the same answers: `test/engine-same-*.test.ts` (README, "The solver") hold every campaign level's measure and every-piece verdicts, every bank level's gate and ten Endless searches to the old engine's, and a differential run over 511 levels (the campaign, the bank, the 360-level corpus and the trials) compared the old and new `step`, `act`, `pack` and `unpack` on 9.1 million turns, events and situations included.

## Tasks

1. `src/puzzle/layouts.ts` from `test/layouts.test.ts`; `uselessPieces` beside `uselessProblems` in `difficulty.ts`.
2. The generator modules, the worker, the client, the saved run, the mode.
3. The card and the page wiring; `?seed=` opens the Endless card.
4. The bank: `tools/endless-bank.ts make` in four lanes, `write`.
5. Tests: `test/endless.test.ts` (seeds, drafts, chapters, teaching numbers, bands, tier, names, saved run, host, client, mode) and `test/endless-gate.test.ts` (every bank level through the gate, the ramp over bank-only runs at every tier, determinism); `tests/e2e/crete-endless.spec.ts` (Classic and Modern: a new run, a move, a win by the thread, Next Level, the page responsive while the worker searches; the saved run after a reload; a phone viewport with the touch pad) and `crete-play.spec.ts`'s `?seed=` case.
6. Build, `install-files.php`, `site-game-pages.php`; the README, the roadmap, the hub tile if its words change.
