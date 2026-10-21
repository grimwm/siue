# The Island of Crete

Chapter 1, "The Outer Halls": ten tile puzzles in the Labyrinth. Gather every relic, reach the exit once the last relic has opened the gate; the Minotaur takes two steps to every move you make, each along the horizontal gap if that cell is open to it, else along the vertical gap. A catch costs a heart and throws you back to the last safe zone you stood on. The board is a Blender-rendered canvas; doors, keys, water, fire, ice, force floors, blocks, buttons, toggle walls and three tools (Medusa's mirror, Daedalus's cow, a honey cake) are the pieces. Medusa's mirror stones the Minotaur on the turn you raise it and for the next three turns, so you get three free moves; while stone it blocks everyone like a wall. Each level teaches one idea, and the solver proves each winnable. The campaign is ten chapters; only Chapter 1 is released, and the rest are named in the Lore book as not yet open.

The page is one frame: a status bar (Level, Hearts, Relics, Keys, Gear, Moves, Menu), the board, and a control strip (the move pad, Wait, Undo, Restart, Hint, Route, Auto and the three tools with their counts), each button with a key tab. Arrows or WASD move, `.` waits, U undoes, R restarts the level, H plays one step of Ariadne's thread, V draws all of it, T plays it out, Z/X/C use the tools, M mutes, N opens the level list, and Q opens the menu and closes whatever is open. Esc is never bound. Any use of the thread marks the try assisted; this browser keeps which levels are cleared and the fewest moves of an unassisted clear. A level wider or taller than 12 cells (`BIG` in `src/fit.ts`) is drawn at no less than 32 px a cell, so on a small screen its board scrolls inside the frame and follows Theseus. A story page is found by taking it and winning that level while holding it. `?seed=` (any value) skips the title card and opens Chapter 1's card.

It is a `play` game: the folder is a complete page (`index.html`) with its own PWA files, and the site wraps it in `play/crete/` without the game knowing.

## Files

- `index.html`, `game.css`: the frame markup and its style (status bar, board, strip, toast, cards, the phone layouts).
- `src/main.ts`: the entry. It wires the modules together, paints the board every frame, keeps the sound and full-screen settings, and exposes `window.__creteTest` (`game`, `TRIALS`, `solve`, `initial`, `trialLevel`, `LEVEL_IDS`, `CHAPTERS`, `solveInWorker`) for the browser specs.
- `src/puzzle/`: the rules, DOM-free: `tiles` (the pieces as data), `level` (the level text), `state`, `step` (one turn), `minotaur`, `run` (a try with its undo), `solver` with `astar`, `pack`, `heuristic`, `prune`, `store` and `paged` (the exact solver, below), `cache` (finished results by level text), `difficulty` (the measure and the bar, below), `trials` (the ten levels of Chapter 1, kept under their `trial-N` ids).
- `src/campaign/`: the campaign as data, DOM-free: `chapters` (the ten chapters, which are released, each one's teaching stretch, `LEVEL_IDS` in play order, `chapterOf`, `pageHome`), `chapter-1` (The Outer Halls: its opening and closing cards and its story pages) and `lore` (the shape of a chapter's words; every quotation is word for word from a public-domain translation).
- `src/game.ts`: the controller, DOM-free: the try in progress, the turn that is animating, Ariadne's thread, sounds per event, progress and found pages on a win.
- `src/board-plan.ts` (what to draw and the turn's timeline, DOM-free), `src/board.ts` (the canvas painter), `fx/sprites/tiles.{png,json}` (the atlas, rendered from `fx/blender/`), `src/tiles-page.ts` with `tiles-test.html` (a test page, not deployed).
- `src/solver-worker.ts` (the solver's Web Worker, `dist/solver-worker.js`), `src/solver-host.ts` (its message handling, DOM-free) and `src/solver-client.ts` (the page's side): searches off the page, below.
- `src/audio.ts`, `src/ui.ts`, `src/ui/*.tsx`: sound, the page and its views (DOM lib).
- `src/keys.ts`, `src/layers.ts`, `src/status.ts`, `src/fit.ts`, `src/help.ts`, `src/progress.ts`, `src/pages.ts`, `src/follow.ts`, `src/settings.ts`: the DOM-free page helpers. `src/pages.ts` keeps which story pages this browser has found, and `src/follow.ts` computes the scroll offset that keeps Theseus in view on a scrolling board. `src/notes.ts`, `src/install-slot.ts`: the words for a full-screen toggle that did not go, and the title card's install bar.
- `dist/`: the esbuild bundle, checked in and served as it is: the host has no Node.
- `build.json`, `tsconfig.json`, `src/tsconfig.dom.json`, `src/tsconfig.worker.json`: the build and its type programs.
- `test/`: the unit and static suites, TypeScript on `node:test`, with `reference-solver.ts` (the breadth-first reference every faster search must agree with; only the tests use it); `tsconfig.test.json` type-checks them, so `build.mjs crete --check` fails on a type error in a test. `../units.sh` runs them with every other game's; `test.sh` runs the build checks.
- `tools/install-files.php`: Crete's config for `../_kit/php/install-core.php` (manifest, service worker, install block, `?v=` versions).
- `metadata.yaml`: the Games-page card and install colours.

## Build

`index.html` loads `dist/main.js` with `<script type="module">`. The patterns shared with the other games are in `../_kit/README.md`.

```
cd .. && npm ci                            # once, in games/
node ../_kit/build/build.mjs crete         # type-check src/ and bundle into dist/
node ../_kit/build/build.mjs crete --check # fail if dist/ is missing or stale
php tools/install-files.php                # then rewrite the ?v= versions and sw.js
```

- `dist/` is generated: edit `src/`, rebuild, rerun `install-files.php`, commit all of it. `make test` runs `npm ci` and `--check`, and `deploy.sh` refuses a stale `dist/`.
- `tsconfig.json` extends the kit's base, is strict and lists the DOM-free modules, which compile without page types, so they cannot reach for `document`. `src/tsconfig.dom.json` extends it with the DOM lib for `audio.ts`, `ui.ts`, the views, `board.ts`, `main.ts` and `solver-client.ts`, and `src/tsconfig.worker.json` with the WebWorker lib for `solver-worker.ts`. Imports carry their `.ts` extension.
- Versions are content hashes written by `tools/install-files.php`, never by hand: `dist/main.js?v=` and `game.css?v=` in `index.html`. The solver worker's `?v=` is its own bundle's hash, which the build puts into `dist/main.js` (`SOLVER_WORKER_V` in `build.json`'s `versions`). `sw.js` hashes the same files plus the rest of `dist/` and `fx/sprites/`, so a changed bundle or atlas makes it stale too.

## The seam

The rules never name the page. `game.ts` takes everything it needs as `GameDeps` (`sfx`, `say`, `progress`, `pages`, `levels`, `timers`, `clock`, `reducedMotion`, `changed`), so `test/game.test.ts` plays whole levels against recording hooks and a manual clock. `ui.ts` and `audio.ts` are the other ends of those hooks.

A turn that animates draws the state *before* it while the figures walk (`frameOf` in `game.ts`), so an item vanishes and a door opens when the figure arrives, and the state after it once the last step lands. A key during a slide finishes it and acts at once, exactly once. Reduced motion is read live from `prefers-reduced-motion` and snaps the figures. The thread solves with a cap of 200,000 states; when none is found in that, or the try cannot be won, the toast says the thread goes slack and to undo or restart.

## The solver

`solve` in `src/puzzle/solver.ts` is exact: it returns a shortest winning line, proves a level unwinnable, or says it gave up at its cap (2,000,000 stored situations; capped is never "no win"). It is A\* (`astar.ts`) over situations packed into a few 32-bit words (`pack.ts`), with an estimate that never overstates the moves left (`heuristic.ts`) and pruning that drops a situation another one already seen beats on every resource that only helps (`prune.ts`). The nodes live in typed arrays (`store.ts`); a spilling store keeps the first ones in memory and the rest in fixed-size records on pages of a file (`paged.ts`), and a file that fails ends the search capped with the failure as its reason. `searching` runs the same search in batches, yielding its progress between them; `measure` has `measuring` the same way, its catch search (`catching`, a depth-first search with no estimate, so its progress reports a best f and start estimate of 0) included. The game's thread help solves in the page, as it always answers within a few hundred milliseconds on Chapter 1's levels.

The editor and any long search run in a Web Worker instead. `startSearch(levelText, kind)` in `src/solver-client.ts` (kind `solve` or `measure`) returns a job: `progress(cb)` (expansions, situations stored, the best f, the start's estimate, and `storage`), `stop()`, `resume()` and `result`. One worker serves every search; a new search cancels the one before it, stopped or not, whose result rejects. A worker that errors (it failed to load, or threw) is terminated and its searches reject, and the next search starts a fresh one; where no worker can be made, the search rejects at once. In the worker (`src/solver-host.ts`):

- A finished result (solved, or proved unwinnable; for a measure, nothing unknown) is cached under the kind, the solver's version and the SHA-256 of the exact level text, in the origin private file system (`crete-results/`), and a second search of the same text answers from it with no progress. The version is a hash of the worker's own bundle, which holds every rule and the solver, so a new build never serves an old build's answer; when the bundle cannot be read, nothing is cached. A cached line is served only if it still wins the level on its last move. Any storage error reads as a miss; nothing throws to the page.
- The search runs 4,096 expansions per batch, posts its progress, then lets messages in: stop waits there until resume, which goes on with the same search.
- Its nodes past the first 65,536 go to a node file in the origin private file system (`crete-nodes/`), written through a sync access handle in 64 KiB pages of which 64 (4 MiB) are cached. The file's size is the handle's, and a short read or write throws, so the search ends capped with a reason. When the file system is missing or refuses (a private window, no quota), the nodes stay in memory and progress says `storage: 'memory'`. The file is closed and deleted when the search ends or is cancelled; one a closed tab left behind is deleted by the first search six hours after it was made.
- Memory is bounded before the cap: per stored node, the A\* arrays and heap take 19 bytes, pruning's index at most 8 × words + 20, and the store 12 bytes with the file (its hash and table) or 4 × words + 21 without; every array grows by doubling, so to at most twice that. With the file the 65,536 nodes in memory (4 × words + 9 bytes each) and the page cache come on top. The worker's cap is the solver's 2,000,000 or less, so that the total stays within 384 MiB: Chapter 1's levels (3 words) and anything up to 5 words keep 2,000,000 with the file; 10 words get 1,508,578, and a level that packs into 23 words 833,701. Should memory run out below that anyway, a solve ends capped with the failure as its reason and a measure rejects with it. The disk holds only the nodes themselves: pruning's index, the A\* arrays, the heap and the store's hash stay in memory, so the file extends a search's reach by a constant factor, not without bound.

`test/solver-big.test.ts` proves a generated 40 × 40 level (keys, doors, two blocks, a Minotaur; 145 moves) in about a second and checks it against the reference.

## What makes a good level

Winnable is not enough: a level the solver wins in a few hundred situations, with the Minotaur walled off, is no fight. `measure` in `src/puzzle/difficulty.ts` runs the solver three ways and reports the shortest line and the situations stored to find it (`explored`: the A\* search with pruning in `src/puzzle/solver.ts`), the shortest line with the Minotaur taken off the board (`minotaurDelta` is how many moves he adds), whether that Minotaur-free line still wins when played on the real level (`greedyWins`), the shortest line that is never caught, and the catches on the shortest line. A search that hits its cap reports unknown, never none.

It also labels the level and plays the plain walk:

- **chase** or **solo** (`label`): `canCatch` searches depth-first from the start and stops at the first turn that catches Theseus. A catch found makes the level chase. A level with no Minotaur, or one whose search ends with no catch (he taunts Theseus from behind walls or water), is solo; when the cells the Minotaur could ever reach and the cells Theseus could ever reach do not meet, that is proved without a search (a door counts open only when its key is on the board, water only when a block could fill it). A capped search labels it unknown. The search yields its progress in batches like the others, so the worker can report and stop it.
- **The plain walk** (`naiveWins`): the shortest path from Theseus to the exit over plain floor, ignoring every piece (only walls stop it) and taking the relics the gate needs on the way, played as moves on the real level. `naiveWins` is true when that walk wins, false when it fails or there is no plain path.

`challengeProblems` checks a measure against `BAR`, the campaign's bar, and lists what falls short:

- Every level with a Minotaur: he shapes the route. He adds moves, or the line that ignores him loses.
- A chapter's challenge levels (those after its teaching stretch, `teaching` in `src/campaign/chapters.ts`; Chapter 1 teaches in levels 1 to 8) are a real fight: the line that ignores the Minotaur loses, he adds at least 8 moves, the search stores at least 20 times the situations of the chapter's hardest teaching level, and the line is no shorter than its longest teaching level's. `rampProblems` keeps each challenge level from storing fewer situations than the one before it.

`sharedProblems` checks a measure against `SHARED_BAR`, the bar every shared level must clear. It never needs a Minotaur, so a solo level clears it on puzzle difficulty alone:

- The level is proved winnable, and the plain walk does not win.
- The quickest win takes at least 40 moves, and the solver stores at least 12,000 situations to find it.
- A chase level whose Minotaur adds at least 8 moves (`BAR.minotaurDelta`), and whose line that ignores him loses, needs only 30 moves and 6,000 situations.

Chapter 1 sets both bars. Every level is chase and no plain walk wins:

| Level | Moves | Situations | Minotaur adds | Ignoring him wins | Catches |
| --- | --- | --- | --- | --- | --- |
| 1 | 10 | 25 | 3 | no | 0 |
| 2 | 23 | 104 | 7 | no | 0 |
| 3 | 36 | 614 | 10 | no | 0 |
| 4 | 28 | 120 | 12 | no | 0 |
| 5 | 23 | 55 | 8 | no | 0 |
| 6 | 24 | 447 | 8 | no | 0 |
| 7 | 23 | 237 | 13 | no | 1 |
| 8 | 29 | 120 | 11 | no | 0 |
| 9 | 54 | 24,086 | 22 | no | 1 |
| 10 | 76 | 28,990 | 31 | no | 0 |

Its hardest teaching search is level 3's 614 situations; level 9 stores 39 times that and level 10 47 times, so the campaign bar of 20 times is about half of level 9's. The shared bar is about half of level 9's situations and a few moves past the longest teaching level (36), so levels 9 and 10 clear it and levels 1 to 8 fall far short. `test/difficulty.test.ts` gates every released level on both bars; new campaign levels must pass `BAR` and every shared level `SHARED_BAR`.

## Layout

The frame (`#frame`, a size container) fills the window and stacks the status bar (`#status-root`), the board (`#board`, holding the `#stage` canvas and a toast over its foot that shows the newest log line and fades) and the control strip (`#strip-root`). `ui.ts` fits the canvas with `cellFor` (`fit.ts`) over the board's free space and `boardRows` (the top row's rise included), then reads the size the canvas was actually given: `board.ts` snaps a cell to whole device pixels, which can round it up, so the cell shrinks until the canvas fits. A big level keeps at least `BIG_MIN_CELL` and the board holder scrolls instead (`follow.ts` keeps the player two cells inside the view; the toast stays on the visible board). The cards are inside the frame, so full screen keeps them. A key tab is the kit's `.kit-key-tab`; it shows only with a mouse and a frame at least 760 px wide. A portrait phone stacks the status bar in two rows and puts the strip under the board; a landscape phone puts the pad and the actions in the margins left and right of the board.

## Cards, Q and settings

The cards are a stack (`layers.ts`): title, menu, story, chapter, Lore, levels, a level's start card, ending. Only the top one shows. Q (the kit's `isBackKey`) closes the top card; with nothing open it opens the menu; the title card ignores it. Play on the title card opens Chapter 1's card (its opening words and quotation, Enter the halls and Levels); Enter starts the first level this browser has not cleared (the chapter's first once all are). N anywhere opens the levels list over what is showing: a tab for each of the ten chapters (the unreleased ones disabled) and a button per level of the shown chapter with its title and whether it is cleared, cleared with help or not yet. Q returns to what was under it. A level's end opens the ending card once its last step has landed: after a win Next level (Enter), Retry (R) and Levels (N), with the titles of any story pages the win took; after a loss Undo and Restart. Clearing level 10 opens the chapter's closing card over the ending card (its words, a line on the next chapter, Continue). The menu holds, in order, Sound and Full screen, the Lore book, the story log, How to play and Quit. The Lore book lists each released chapter's opening card, its story pages (a found page opens in full; the rest say which level hides them), its closing card once seen, and one line for each unreleased chapter; Q goes from an open entry back to the list, then closes the book. While a card is up only Q, N and M reach the game, plus the keys a card names on its own buttons. Esc is never bound and never leaves full screen: the full-screen toggle takes the Escape lock where the browser has Keyboard Lock (`_kit/app.ts`). Sound and full screen are kept in this browser under `crete-sound` and `crete-fullscreen`; Play enters full screen again when it was last on. Cleared levels are kept under `crete-progress` (by their `trial-N` ids) and found story pages under `crete-pages`.

## Keys

| Key | Does |
| --- | --- |
| Arrows, WASD | Move (also closes the start card, then moves) |
| `.` | Wait: the Minotaur moves, you stay |
| U, R | Undo the last turn; restart the level |
| H, V, T | Hint (one step of the thread), Route (draw all of it), Auto (play it out) |
| Z, X, C | Medusa's mirror, honey cake, Daedalus's cow |
| Enter, Space | Begin, on a start card; on a chapter card, enter the halls (Continue on the closing card) |
| N | Open the level list |
| M | Mute |
| Q | Close the top card; with none open, open the menu; ignored on the title card |

Esc is never bound. `src/keys.ts` is the one table: the key tabs, the help text and the bindings all read it; the tools' keys come from `TOOLS` in `src/puzzle/tiles.ts`. A chord (Ctrl, Cmd, Alt) is the browser's, never a game key.

## The art

Every sprite is rendered by Blender from scenes built in code: `fx/blender/render_tiles.py` writes one `.blend` per sprite beside it (Git LFS), renders each through one camera and light rig, and tiles the frames into `fx/sprites/tiles.png` with `tiles.json` naming where each sprite sits (`src/puzzle/tiles.ts` lists the names). It needs Blender 4.2 or newer (`brew install --cask blender`) and the system `python3` with Pillow. To regenerate, from `fx/blender/`:

```
/Applications/Blender.app/Contents/MacOS/Blender -b -P render_tiles.py -- --out ../sprites
```

`--only a,b` renders a few sprites into `<out>/_only/` for a quick look and leaves the atlas alone; every option is described at the top of the script. The script also writes `preview-16.png` (each sprite at 16 px) and `board-preview.png` beside itself. After a new atlas, rebuild and rerun `install-files.php` so `sw.js` hashes it. `fx/CREDITS.md` states that no outside images, models or fonts are used.

`tiles-test.html` (entry `src/tiles-page.ts`, bundled to `dist/tiles-test.js`) is a test page, not deployed: it plays a level that holds every piece on the board canvas, and draws each sprite alone in a strip at a chosen size. Open it from the local site at `games/crete/tiles-test.html`.

## Test hook

`window.__creteTest` is `{ game, TRIALS, solve, initial, trialLevel, LEVEL_IDS, CHAPTERS, solveInWorker }`: the real controller (`game.run.now` is the current state with `moves`, `hearts` and `outcome`), the ten levels, the exact solver, a state from a level, level `i`'s level, the released levels' ids in play order, the chapter table, and `solveInWorker(levelText)`, which solves in the worker and resolves with `{ result, progress }` (every progress report). The browser specs read it to take the solver's winning line and press it through the page's own buttons and keys.

## Tests

From this folder: `./test.sh` (the build check, its tests' type check included, `install-files.php --check` and the icon check), and `node --test test/*.test.ts` for the unit tests; `../units.sh` runs them with every other game's, as `make test` does, and fails on a folder with none. Run `npm ci` in `games/` first. Browser specs (from `websites/www.cs`, `make e2e E2E_ARGS="crete-play.spec.ts crete-layout.spec.ts crete-chapter.spec.ts crete-solver.spec.ts"`): `crete-play` (the level flow, the start card, keys, the cards, full screen and the Esc lock), `crete-layout` (ten screen sizes, the levels list and start card included, and level 10's scrolling board), `crete-chapter` (the chapter card, a win that takes a story page, and the Lore book), `crete-solver` (level 10 solved in the worker with its node file opened in the origin private file system while the page keeps drawing, then answered from the cache), then `games-hub`, `games-install` and `games-pwa` in `../../tests/e2e`.
