# The Island of Crete

Chapter 1, "The Outer Halls": ten tile puzzles in the Labyrinth. Gather every relic, reach the exit once the last relic has opened the gate; the Minotaur takes two steps to every move you make, each along the horizontal gap if that cell is open to it, else along the vertical gap. A catch costs a heart and throws you back to the last safe zone you stood on. The board is a Blender-rendered canvas; doors, keys, water, fire, ice, force floors, blocks, buttons, toggle walls and three tools (Medusa's mirror, Daedalus's cow, a honey cake) are the pieces. Medusa's mirror stones the Minotaur on the turn you raise it and for the next three turns, so you get three free moves; while stone it blocks everyone like a wall. Each level teaches one idea, and the solver proves each winnable. Nine trap and trick pieces from Chip's Challenge are in the rules and both solvers too (Pieces, below); no released level uses them. The campaign is ten chapters; only Chapter 1 is released, and the rest are named in the Lore book as not yet open.

The page is one frame: a status bar (Level, Hearts, Relics, Keys, Gear, Moves, Menu), the board, and a control strip (the move pad, Wait, Undo, Restart, Hint, Route, Auto and the three tools with their counts), each button with a key tab. Arrows or WASD move, `.` waits, U undoes, R restarts the level, H plays one step of Ariadne's thread, V draws all of it, T plays it out, Z/X/C use the tools, M mutes, N opens the level list, E on the title card opens the level editor, and Q opens the menu and closes whatever is open. Esc is never bound. Any use of the thread marks the try assisted; this browser keeps which levels are cleared and the fewest moves of an unassisted clear. A level wider or taller than 12 cells (`BIG` in `src/fit.ts`) is drawn at no less than 32 px a cell, so on a small screen its board scrolls inside the frame and follows Theseus. A story page is found by taking it and winning that level while holding it. `?seed=` (any value) skips the title card and opens Chapter 1's card.

It is a `play` game: the folder is a complete page (`index.html`) with its own PWA files, and the site wraps it in `play/crete/` without the game knowing.

## Files

- `index.html`, `game.css`: the frame markup and its style (status bar, board, strip, toast, cards, the phone layouts).
- `src/main.ts`: the entry. It wires the modules together, paints the board every frame, keeps the sound and full-screen settings, and exposes `window.__creteTest` (`game`, `TRIALS`, `solve`, `initial`, `trialLevel`, `LEVEL_IDS`, `CHAPTERS`, `solveInWorker`, `playLevel`, `parse`, `editor`) for the browser specs.
- `src/puzzle/`: the rules, DOM-free: `tiles` (the pieces as data), `level` (the level text), `state`, `work` (a turn's actions, events and working copy), `step` (one turn: Theseus and blocks), `pieces` (teleports, snares and their buttons, the toggle and red buttons, where a hazard may go), `hazards` (the hazard phase), `catch` (the catch every cause shares, and sending a hazard home), `minotaur`, `run` (a try with its undo), `solver` with `astar`, `pack`, `heuristic`, `prune`, `store` and `paged` (the exact solver, below), `cache` (finished results by level text), `difficulty` (the measure and the bar, below), `trials` (the ten levels of Chapter 1, kept under their `trial-N` ids).
- `src/campaign/`: the campaign as data, DOM-free: `chapters` (the ten chapters, which are released, each one's teaching stretch, `LEVEL_IDS` in play order, `chapterOf`, `pageHome`), `chapter-1` (The Outer Halls: its opening and closing cards and its story pages) and `lore` (the shape of a chapter's words; every quotation is word for word from a public-domain translation).
- `src/game.ts`: the controller, DOM-free: the try in progress, the turn that is animating, Ariadne's thread, sounds per event, progress and found pages on a win.
- `src/board-plan.ts` (what to draw and the turn's timeline, DOM-free), `src/board.ts` (the canvas painter), `fx/sprites/tiles.{png,json}` (the atlas, rendered from `fx/blender/`), `src/tiles-page.ts` with `tiles-test.html` (a test page, not deployed).
- `src/solver-worker.ts` (the solver's Web Worker, `dist/solver-worker.js`), `src/solver-host.ts` (its message handling, DOM-free) and `src/solver-client.ts` (the page's side): searches off the page, below.
- `src/share/` (DOM-free): `link` (the share link's codec, with its limits), `name` (a shared level's generated name), `open` (opening a link: decode, then replay its line on the engine), `rating` (a shared level's rating search, taking turns with the editor's Check in the one worker) and `visit` (a link's visit to the game page: its card, Play, Edit a copy). `src/editor/`, the level editor: `model` (the editor's level document), `history` (its undo), `check` (Check's search state and the words for its answer) and `keys` (the editor's key table) are DOM-free; `editor` (the editor, a layer over the game frame), `bar` (undo, redo, Try it, Leave and the size, hearts and relics boxes), `palette` (the brushes), `check-panel` (the Check panel and the strip for narrow screens) and `share-panel` (the Share panel and the owner's fields) need the DOM.
- `src/outside.ts` (DOM-free): the level from outside the campaign, a slot after the campaign's levels that a try from the editor plays in.
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

A turn that animates draws the state *before* it while the player's figure walks, less each thing the figure has reached (`frameOf` in `game.ts`; the timeline's `taken` gives the moment it lands on each), then the state once the player's action alone has played (`act` in `puzzle/step.ts`, kept as `anim.mid`) while the hazards move, and the state after the turn once the hazards' moves land (the timeline's `hazardEnd`), while the Minotaur steps. Hazards come from the timeline's figures, not the state: the hazards before the turn, moving all at once after the player and before the Minotaur, and the hazards after it once the turn lands, so a hazard destroyed or sent home plays its move and is gone or home only then, and a cloned one appears then, at `hazardEnd` like a cloned block, before the Minotaur steps. Through a teleport a figure jumps to the exit and steps on. The animation pauses the moment the figure reaches a story page (`game.animMs()` stops there and sets `anim.paused`) and holds that frame while the page reads it; `game.resume()` goes on from the same moment, so a slide over several pages stops at each in turn. A play-out waits while its turn has a page still to reach. A key during a slide finishes it and acts at once, exactly once. Reduced motion is read live from `prefers-reduced-motion` and snaps the figures. The thread solves with a cap of 200,000 states; when none is found in that, or the try cannot be won, the toast says the thread goes slack and to undo or restart.

## Pieces

The trap and trick pieces, by their character in the level text. The code uses the plain name; the game and the help text use the myth name where there is one.

| Char | Plain name | In the game |
| --- | --- | --- |
| `&` | `trap` | Daedalus's snare |
| `-` | `button-brown` | Brown button |
| `+` | `button-red` | Red button |
| `;` | `popup` | Pop-up wall |
| `:` | `gravel` | Gravel |
| `W` | `fake-wall` | Fake wall |
| `I` | `invisible-wall` | Invisible wall |
| `@` | `teleport` | Teleport |
| `$` | `thief` | Thief |
| `!` | `bomb` | Bomb |
| `C` | `clone` | Clone machine |
| `o` | `ball` | Bronze ball |
| `w` | `glider` | Harpy |
| `e` | `fireball` | Talos's fire |

A hazard (`o`, `w`, `e`) stands on floor; a clone machine's cell is terrain `clone` with nothing on it. Two headers go with them, each a `LevelError` at the header when its count or a word is wrong:

- `facing:` one direction (`up`, `down`, `left`, `right`) per hazard on the grid, in reading order; required exactly when the grid has a hazard.
- `machines:` one `<template>-<dir>` per `C`, in reading order, the template `block`, `ball`, `glider` or `fireball`; required exactly when the grid has a `C`.

Links are never written. As in Chip's Challenge, each brown button controls the first snare after it in reading order, wrapping to the first, and each red button the first clone machine after it; a button with nothing to control does nothing. `parse` derives `Level.links`.

- **Daedalus's snare**: whoever stands on it (Theseus, a block, a hazard, the Minotaur) is held while no linked brown button is held down by Theseus, a block or a hazard (never the Minotaur or the cow). Theseus's move while held is a bump; waiting and tools are turns. A block in a held snare cannot be pushed. The snare keeps no state of its own: it holds or not by what stands on its buttons now.
- **Pop-up wall**: floor until Theseus leaves it by any means (a step, a slide, a throw, a teleport), then wall. Nothing else enters it.
- **Gravel**: Theseus crosses it; blocks, the Minotaur and hazards do not.
- **Fake wall**: wall to everyone until Theseus bumps it, which opens it and costs a turn.
- **Invisible wall**: looks like floor and is wall; Theseus's bump shows it and costs a turn. Slides, pushed blocks and teleport exits reveal neither kind.
- **Teleport**: Theseus or a block comes out of the next teleport in reading order (wrapping), onto the cell beyond it in the same direction, and arrives there in full; a blocked exit is skipped for the next. Wall to the Minotaur and hazards; a lone teleport is wall.
- **Thief**: takes all of Theseus's gear; keys and tools stay.
- **Bomb**: a block or a hazard arriving on it is destroyed with it; Theseus arriving on it loses a heart and is thrown back as in a catch, and the bomb is gone. Wall to the Minotaur.
- **Clone machine**: wall to everyone. Each time something arrives on its red button it makes its template in front of it, facing its way, when that cell is free.
- **Bronze ball**: goes straight; turns back when blocked. **Harpy**: turns left, then right, then back; crosses water. **Talos's fire**: turns right, then left, then back; crosses fire. A hazard stuck every way stays. A hazard keeps to the ground the Minotaur keeps to, and a bomb, which destroys it; ice and force floors carry it as they carry him. It never enters a cell with an object, a block, the cow, the Minotaur or another hazard. Theseus stepping into a hazard, or a hazard into him, is a catch. The Minotaur and a hazard never share a cell, stone or not.

A turn goes in a fixed order and stops at its first catch: Theseus's action, then each hazard once, in reading order of the cells they stood on when the phase began (a hazard that moves keeps its place in that order), then the Minotaur's two steps.

The rulings the pieces need:

- **Sent home**: when a catch throws Theseus onto a hazard, or the Minotaur home onto one, that hazard goes back to its start (a level hazard's own cell; a clone's, the cell in front of its machine). If that is taken, it goes to the nearest cell it may stand on, breadth-first from its start over every cell, ties in reading order, never a bomb; only when no cell on the board can take it is it removed. Being set down is no arrival: it presses no button, though a snare it is set down in holds it.
- **The cow**: a hazard never enters the cow's cell, but one that moves onto Theseus standing on his cow catches him and the cow is lost. The cow never holds a brown button down.
- **Hazards and the toggle button**: a hazard on `_` flips the toggle walls, as Theseus and blocks do.
- **Teleport chains**: there are none. A teleport beyond an exit makes that exit blocked. Out of a teleport, Theseus pushes a block only when he entered it by his own step, not on a ride; with every exit blocked he stays on the teleport he entered, and a pushed block's push is refused.
- **Bomb catches**: a bomb under Theseus is a catch (`caught` with `by: 'bomb'`), so a search that refuses catches refuses it and the turn stops there. A hazard's catch is `by: 'hazard'`, the Minotaur's `by: 'minotaur'`.
- **Clones arrive in full**: a cloned block settles like a pushed one (it sinks, explodes, presses, slides); a cloned hazard presses buttons and meets a bomb on its cell, and first moves in the next hazard phase. One made during the hazard phase joins the end of the list and does not move until the next phase. A red button pressed by a clone's arrival fires again; each firing needs a free cell, so a chain ends.
- **No clone on the cell Theseus enters**: a clone is never made on Theseus, nor on the cell he is stepping into while his own push presses the button.

## The solver

`solve` in `src/puzzle/solver.ts` is exact: it returns a shortest winning line, proves a level unwinnable, or says it gave up at its cap (2,000,000 stored situations; capped is never "no win"). It is A\* (`astar.ts`) over situations packed into a few 32-bit words (`pack.ts`). A situation holds everything that can change during a try and nothing else: the cells of Theseus, the Minotaur, the cow and the throw-back, the Minotaur's stone turns, hearts, relics still needed, story pages, keys, tools and gear, one bit for each cell whose terrain changes once (a door or fake wall opens, water fills, a pop-up rises, an invisible wall shows, a bomb goes off) and one for the toggle walls, the objects and blocks where they lie, and each hazard's cell, facing and home (the home decides its kind). Where no machine clones a hazard the hazards pack as one slot per level hazard; otherwise per cell a hazard could ever stand on. A snare holds no state: whether it holds is read from its buttons. The search runs on that, with an estimate that never overstates the moves left (`heuristic.ts`) and pruning that drops a situation another one already seen beats on every resource that only helps (`prune.ts`). The nodes live in typed arrays (`store.ts`); a spilling store keeps the first ones in memory and the rest in fixed-size records on pages of a file (`paged.ts`), and a file that fails ends the search capped with the failure as its reason. `searching` runs the same search in batches, yielding its progress between them; `measure` has `measuring` the same way, its catch search (`catching`, a breadth-first search with no estimate, so its progress reports a best f and start estimate of 0) included. The game's thread help solves in the page, as it always answers within a few hundred milliseconds on Chapter 1's levels.

The editor and any long search run in a Web Worker instead. `startSearch(levelText, kind)` in `src/solver-client.ts` (kind `solve` or `measure`) returns a job: `progress(cb)` (expansions, situations stored, the best f, the start's estimate, and `storage`), `stop()`, `resume()`, `cancel()` and `result`. One worker serves every search; a new search cancels the one before it, stopped or not, whose result rejects with the host's message. `cancel()` ends a job for good: `result` rejects with `CancelledError` at once, no more progress arrives, and the host closes the job's node file like a replaced search's. A worker that errors (it failed to load, or threw) is terminated and its searches reject, and the next search starts a fresh one; where no worker can be made, the search rejects at once. In the worker (`src/solver-host.ts`):

- A finished result (solved, or proved unwinnable; for a measure, nothing unknown) is cached under the kind, the solver's version and the SHA-256 of the exact level text, in the origin private file system (`crete-results/`), and a second search of the same text answers from it with no progress. The version is a hash of the worker's own bundle, which holds every rule and the solver, so a new build never serves an old build's answer; when the bundle cannot be read, nothing is cached. After each put the cache is trimmed (`evictions` in `src/puzzle/cache.ts`): entries of another version go first, then all but the newest `RESULT_LIMIT = 256` by file `lastModified`. A cached line is served only if it still wins the level on its last move, and a cached measure with no `line` is searched again. Any storage error reads as a miss; nothing throws to the page.
- The search runs 4,096 expansions per batch, posts its progress, then lets messages in: stop waits there until resume, which goes on with the same search.
- Its nodes past the first 65,536 go to a node file in the origin private file system (`crete-nodes/`), written through a sync access handle in 64 KiB pages of which 64 (4 MiB) are cached. The file's size is the handle's, and a short read or write throws, so the search ends capped with a reason. When the file system is missing or refuses (a private window, no quota), the nodes stay in memory and progress says `storage: 'memory'`. The file is closed and deleted when the search ends or is cancelled; one a closed tab left behind is deleted by the first search six hours after it was made.
- Memory is bounded before the cap: per stored node, the A\* arrays and heap take 19 bytes, pruning's index at most 8 × words + 20, and the store 12 bytes with the file (its hash and table) or 4 × words + 21 without; every array grows by doubling, so to at most twice that. With the file the 65,536 nodes in memory (4 × words + 9 bytes each) and the page cache come on top. The worker's cap is the solver's 2,000,000 or less, so that the total stays within 384 MiB: Chapter 1's levels (3 words) and anything up to 5 words keep 2,000,000 with the file; 10 words get 1,508,578, and a level that packs into 23 words 833,701. Should memory run out below that anyway, a solve ends capped with the failure as its reason and a measure rejects with it. The disk holds only the nodes themselves: pruning's index, the A\* arrays, the heap and the store's hash stay in memory, so the file extends a search's reach by a constant factor, not without bound.

`test/solver-big.test.ts` proves a generated 40 × 40 level (keys, doors, two blocks, a Minotaur; 145 moves) in about a second and checks it against the reference.

## What makes a good level

Winnable is not enough: a level the solver wins in a few hundred situations, with the Minotaur walled off, is no fight. `measure` in `src/puzzle/difficulty.ts` runs the solver three ways and reports the shortest line (`line`, as move letters; `''` when unsolved, so Check holds the proof a share link carries) and the situations stored to find it (`explored`: the A\* search with pruning in `src/puzzle/solver.ts`), the shortest line with the Minotaur taken off the board (`minotaurDelta` is how many moves he adds), whether that Minotaur-free line still wins when played on the real level (`greedyWins`), the shortest line that is never caught, and the catches on the shortest line. A search that hits its cap reports unknown, never none. `hardPieces(level)` names the pieces that make a level hard ("4 blocks", "2 keys and 2 doors"), the most numerous first.

It also labels the level and plays the plain walk:

- **chase** or **solo** (`label`): `canCatch` searches breadth-first from the start and stops at the first turn the Minotaur catches Theseus. A catch by him makes the level chase; a hazard's or a bomb's never does. A level with no Minotaur, or one whose search ends with no catch by him (he taunts Theseus from behind walls or water), is solo; when the cells the Minotaur could ever reach and the cells Theseus could ever reach do not meet, that is proved without a search (a door counts open only when its key is on the board, water only when a block or a block machine could fill it; a fake wall or a bomb counts open to the Minotaur; Theseus goes through every piece but a wall, and from any teleport to every cell beside any teleport). A capped search labels it unknown. The search yields its progress in batches like the others, so the worker can report and stop it.
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

The cards are a stack (`layers.ts`): title, menu, story, chapter, Lore, levels, a level's start card, ending, the level editor, and a shared level's card. Only the top one shows. Q (the kit's `isBackKey`) closes the top card; with nothing open it opens the menu (on the title card too, over it). Play on the title card opens Chapter 1's card (its opening words and quotation, Enter the halls and Levels); Enter starts the first level this browser has not cleared (the chapter's first once all are). N anywhere opens the levels list over what is showing: a tab for each of the ten chapters (the unreleased ones disabled) and a button per level of the shown chapter with its title and whether it is cleared, cleared with help or not yet; up and down (or j and k) move between the levels and Enter opens the one chosen. Q returns to what was under it. A level from outside the campaign (a try from the editor, or a shared level) records nothing, has no chapter and opens no Lore entry for its story pages: its start and ending cards have their own kicker ("Your level" or "Shared level"), the ending card has no Next level or Levels, a try's has Back to the editor, and a shared level's adds a line setting the win against the author's best. A campaign level's end opens the ending card once its last step has landed: after a win Next level (Enter), Retry (R) and Levels (N), with the titles of any story pages the win took; after a loss Undo and Restart. Clearing level 10 opens the chapter's closing card over the ending card (its words, a line on the next chapter, Continue). The menu holds, in order, Sound and Full screen, the Lore book, the story log, How to play, Back to the editor (during a try from the editor) or Shared level (its card, during a shared level whose link is the open one) and Quit. The Lore book lists each released chapter's opening card, its story pages (a found page opens in full; the rest say which level hides them), its closing card once seen, and one line for each unreleased chapter; Q goes from an open entry back to the list, then closes the book. Every card works from the keyboard: up and down (or W and S, J and K) move the focus between its enabled buttons, clamped at the ends, and Enter or Space presses the focused one (where Enter already means something, as on the chapter, start and ending cards, it keeps that meaning while the focus is on the card's default button or on nothing); left and right switch the chapter tabs of the level list. A share link in the address (a fragment `#L<digits>…`) opens its card (the level's name, its rating, `rating…` until the page's own search is in or a line saying it waits for the editor's Check, and the author's best to beat, with Play and Edit a copy, which opens the editor on a copy as one undo step), and Q on it, or the browser's Back to no fragment, goes to the title card; a link that cannot be opened leaves the title card up, saying why. Any other fragment but `#edit` is ignored. On the title card I opens the story, E (Make a level) opens the editor and Q opens the menu; in the menu F toggles full screen and L opens the Lore book; each such button shows its key. Taking a story page opens its Lore entry over the board the moment Theseus reaches it, with the turn's animation paused there (the thread's play-out stops too); Enter, Space or Q closes it and the turn goes on, pausing again at the next page a slide takes. With reduced motion the pages a turn took open one after another once it has landed. Once the entry closes, play goes on, and the book lists the page as found only after the level is won. While a card is up only Q, N and M reach the game, plus the keys a card names on its own buttons. Esc is never bound and never leaves full screen: the full-screen toggle takes the Escape lock where the browser has Keyboard Lock (`_kit/app.ts`). Sound and full screen are kept in this browser under `crete-sound` and `crete-fullscreen`; Play enters full screen again when it was last on. Cleared levels are kept under `crete-progress` (by their `trial-N` ids) and found story pages under `crete-pages`.

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
| E | Make a level: open the editor (title card only) |
| I | Open the story card (title card only) |
| F, L | Full screen; open the Lore book (menu only) |
| Up, Down, J, K | Move the focus between the top card's buttons; Enter or Space presses the focused one |
| Left, Right | Switch chapter tabs in the level list |
| Q | Close the top card; with none open, open the menu; on the title card, open the menu |

While the editor is the top layer every key goes to it: U and Ctrl/Cmd+Z undo, Y and Ctrl/Cmd+Y or Ctrl/Cmd+Shift+Z redo, P tries the draft, C checks it, O turns the brush's direction, and Q closes a dialog or else leaves the editor. Esc is never bound. `src/keys.ts` is the one table: the key tabs, the help text and the bindings all read it; the tools' keys come from `TOOLS` in `src/puzzle/tiles.ts`. A chord (Ctrl, Cmd, Alt) is the browser's, never a game key.

## The art

Every sprite is rendered by Blender from scenes built in code: `fx/blender/render_tiles.py` writes one `.blend` per sprite beside it (Git LFS), renders each through one camera and light rig, and tiles the frames into `fx/sprites/tiles.png` with `tiles.json` naming where each sprite sits (`src/puzzle/tiles.ts` lists the names). It needs Blender 4.2 or newer (`brew install --cask blender`) and the system `python3` with Pillow. To regenerate, from `fx/blender/`:

```
/Applications/Blender.app/Contents/MacOS/Blender -b -P render_tiles.py -- --out ../sprites
```

`--only a,b` renders a few sprites into `<out>/_only/` for a quick look and leaves the atlas alone; every option is described at the top of the script. The script also writes `preview-16.png` (each sprite at 16 px) and `board-preview.png` beside itself. After a new atlas, rebuild and rerun `install-files.php` so `sw.js` hashes it. `fx/CREDITS.md` states that no outside images, models or fonts are used.

`tiles-test.html` (entry `src/tiles-page.ts`, bundled to `dist/tiles-test.js`) is a test page, not deployed: it plays a level that holds every piece on the board canvas, and draws each sprite alone in a strip at a chosen size. Open it from the local site at `games/crete/tiles-test.html`.

## Test hook

`window.__creteTest` is `{ game, TRIALS, solve, initial, trialLevel, LEVEL_IDS, CHAPTERS, solveInWorker, playLevel, parse, editor }`: the real controller (`game.run.now` is the current state with `moves`, `hearts` and `outcome`), the ten levels, the exact solver, a state from a level, level `i`'s level, the released levels' ids in play order, the chapter table, and `solveInWorker(levelText)`, which solves in the worker and resolves with `{ result, progress }` (every progress report). `playLevel(level, { outside?, line? })` opens a level from outside the campaign (a try unless `outside` says otherwise), with `line` as its proven line; `parse` reads level text; `editor` is the Editor plus `load(text)`, which opens the editor on that level. The browser specs read it to take the solver's winning line and press it through the page's own buttons and keys.

## Tests

From this folder: `./test.sh` (the build check, its tests' type check included, `install-files.php --check` and the icon check), and `node --test test/*.test.ts` for the unit tests; `../units.sh` runs them with every other game's, as `make test` does, and fails on a folder with none. Run `npm ci` in `games/` first. Browser specs (from `websites/www.cs`, `make e2e E2E_ARGS="crete-play.spec.ts crete-layout.spec.ts crete-chapter.spec.ts crete-solver.spec.ts"`): `crete-play` (the level flow, the start card, keys, the cards, full screen and the Esc lock), `crete-layout` (ten screen sizes, the levels list and start card included, and level 10's scrolling board), `crete-chapter` (the chapter card, a win that takes a story page, and the Lore book), `crete-solver` (level 10 solved in the worker with its node file opened in the origin private file system while the page keeps drawing, then answered from the cache), then `games-hub`, `games-install` and `games-pwa` in `../../tests/e2e`.
