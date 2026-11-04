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
- **No WebAssembly yet.** The profile below puts 55% of a search's time in the game's own `step` (the rules, building a State per move), 13% in packing and unpacking situations and 8% in the pruning; the store is already packed words in a typed-array open-addressing table. A faster engine would shorten every part by a constant, and the measurements below show a phone waiting at Next Level, so `step` is the case for WebAssembly (or an allocation-free rewrite of it in TypeScript): it is the next step if phones wait too often.

## Architecture

DOM-free modules in `src/endless/`:

- `random.ts`: seed hashing (cyrb53) and the sfc32 generator; `rngOf(...parts)`, `cleanSeed`, `newSeed`.
- `draft.ts`: a draft of rooms and halls (a grid of rooms one wall apart, a random spanning tree of doorways, some walls taken out whole as halls, a few loops) with the pieces of a few families on the doorways and in the rooms; `mutate` makes one small change (a piece moved, a doorway's piece moved, a hazard turned, a doorway opened or walled up).
- `gate.ts`: the bands, the per-chapter bar, `tidyProblems`, `newProblems`, `quickProblems` and `gateProblems`.
- `generate.ts`: `search`, a climb from a draft steered by the seed: each change kept when it brings the level no further from passing the cheap checks (`distance`: one capped solve, and one without the beast), now and then a step up so a climb is not stuck; a draft that passes them goes through the whole gate, and a piece the gate finds useless is taken out and the climb goes on. `generate` wraps it with the budget and the bank, `fromBank` picks a bank level.
- `bank.ts` (written by the tool), `campaign.ts` (the campaign's level texts without its words, for the worker), `host.ts` (the worker's message handler: one part, or the bank's level), `client.ts` (the page's side: the workers, the parts handed out in order and settled on the lowest that finds a level, one job at a time, cancel ends the workers), `saved.ts` (the saved run and best under `crete-endless`), `tier.ts`, `name.ts`, `mode.ts` (opens levels, prefetches the next).

The page: `src/endless-worker.ts` (bundle `dist/endless-worker.js`, versioned by `ENDLESS_WORKER_V`), `src/ui/endless.tsx` (the card), and changes to `src/ui.ts`, `src/ui/title.tsx`, `src/main.ts`, `src/outside.ts`, `src/keys.ts`, `src/layers.ts`, `game.css`, `index.html`.

## Measurements

On the workstation (Intel i7-9700, 8 cores, 16 GB, Linux) (Node 22, one core each):

| Measure | Result |
| --- | --- |
| The gate on a campaign level of 16,596 situations (Chapter 1, level 9) | measure 326 ms, every piece 82 ms |
| The gate on one of 69,836 (Chapter 10, level 8) | measure 1,151 ms, every piece 3,550 ms |
| The gate on one of 180,046 (Chapter 10, level 10) | measure 3,402 ms, every piece 3,424 ms |
| Random drafts, no climb: share passing the cheap checks in the first band | about 1 in 300 |
| The climb, per level found, before the bar was set per chapter (every level held to Chapter 1's 36 moves) | 2 of 12 searches found one within 12,000,000 situations, about 100 s each |
| The bank's search, no budget, per level (36 levels, four at once) | all 36 found; median 197 s, mean 241 s, 5 s to 1,084 s |
| The shipped budget, 6,000,000 situations, at a run's second level | 2 of 12 searches made a level (29 s, 56 s); 10 took the bank's after 71 to 90 s |
| The final bank | 44 levels: 26 of Chapter 1's pieces alone, the rest of Chapters 2 to 8; every one passes the whole gate in `test/endless-gate.test.ts` |
| The search's pace | about 100,000 situations a second (12,000,000 in 117 to 124 s in Chrome's worker) |

In the browser (Chrome, `tests/e2e`, the local site), through the page's own Endless:

| Measure | Laptop | Main thread throttled 4× (CDP) |
| --- | --- | --- |
| New Run to the first level's start card (the bank's) | 229 to 279 ms | 552 ms |
| The worker making level 2 with a budget of 12,000,000 | 117 s (made) and 123 s (the bank's after the budget) | 124 s: CDP's throttle slows the page's thread, not the worker's |
| The page's longest stall while the worker searches | 21 to 33 ms | 38 ms |

So the page never freezes: the worker carries every search and the page's longest stall stayed under 40 ms. What a phone changes is how long a search takes. The budget is counted in situations, not seconds, so a phone makes the same level as the laptop, only later. A phone's JavaScript runs at roughly a third to a quarter of this laptop's single-core speed (an estimate: Chrome cannot throttle a worker, and no phone was at hand), which gives about 25,000 to 35,000 situations a second.

The budget is set from that: 6,000,000 situations take about a minute on the laptop and three to four minutes on such a phone, spent while the player plays the level before. A player who is faster sees Finding a Good Level… with its progress for at most what is left of that. In a sample of 12 searches for a run's second level (tiers 1, 5 and 10, four seeds each, three at once), 2 found a level within the budget, in 29 s and 56 s; the other 10 spent it in 71 to 90 s and took the bank's. The bank's median of 197 s a level is well past the laptop's minute. That is why the bank, not the search, carries most of a run's variety, and it is built to cover every tier's climb (`test/endless-gate.test.ts`).

**WebAssembly:** not used. The page is never blocked, so the only gain would be a shorter search. That gain is a constant factor, perhaps two, on code that is already integer typed-array work in a worker, and it would not change the design: the bank and the prefetch would still be needed. It is worth trying only if a phone measurement shows players waiting on Finding a Good Level… often.

## Tasks

1. `src/puzzle/layouts.ts` from `test/layouts.test.ts`; `uselessPieces` beside `uselessProblems` in `difficulty.ts`.
2. The generator modules, the worker, the client, the saved run, the mode.
3. The card and the page wiring; `?seed=` opens the Endless card.
4. The bank: `tools/endless-bank.ts make` in four lanes, `write`.
5. Tests: `test/endless.test.ts` (seeds, drafts, chapters, teaching numbers, bands, tier, names, saved run, host, client, mode) and `test/endless-gate.test.ts` (every bank level through the gate, the ramp over bank-only runs at every tier, determinism); `tests/e2e/crete-endless.spec.ts` (Classic and Modern: a new run, a move, a win by the thread, Next Level, the page responsive while the worker searches; the saved run after a reload; a phone viewport with the touch pad) and `crete-play.spec.ts`'s `?seed=` case.
6. Build, `install-files.php`, `site-game-pages.php`; the README, the roadmap, the hub tile if its words change.
