# Crete level editor and the fast solver

Part of the Crete redesign (`2026-10-16-crete-redesign-vision.md`). Chapter 1
(`2026-10-19-crete-chapter-1-design.md`) is live, with the exact solver
(`src/puzzle/solver.ts`) and the difficulty measure and campaign gate
(`src/puzzle/difficulty.ts`). This part builds a public level editor and, under
it, a much faster solver. It is two pieces of work, each with its own plan and
pull request, in this order:

1. **The fast solver.** It replaces today's breadth-first search everywhere
   (the thread help, the difficulty measure, the campaign tests) and runs in the
   background.
2. **The editor.** A page to build, test and share levels, built on the fast
   solver.

## Why

The owner wants players and themselves to build Crete levels: players to make
levels and send them to friends, and the owner to build the campaign (Chapter
2 onward) in the same tool. Every shared level must be winnable, proven by the
game, not by the author playing it ("that's just kind of a bitch"), and the
game should tell everyone how hard it is. Today's solver cannot prove large or
busy levels: it remembers every game situation it has seen as a text key, and
the number of situations multiplies with every key, door, block and figure, so
a big level runs the browser out of memory.

## What the owner decided

- **Who:** players making levels for friends, and the owner building the
  campaign. Campaign use comes first.
- **Board size:** up to 64 × 64.
- **Sharing:** links only. The whole level travels inside the link; nothing
  is stored on the site and there is no public list of levels. This keeps
  strangers' words off a university website.
- **No typed text in shared levels.** A shared level gets a generated name
  ("Level K7QX by WGR"): a code made from the level itself and the author's
  three initials. There is no free-text title or intro.
- **Winnable, proven by the solver:** only a level the solver has proven
  winnable can be shared. The author never has to beat it first.
- **Every level must have a Minotaur, and he must matter.** A level is
  shareable only if it has a Minotaur, the solver proves it winnable, and it
  cannot be won while ignoring him: the shortest route with the Minotaur taken
  off the board, played on the real level, loses (the difficulty measure's
  "ignoring him wins?" check). A level without a Minotaur, or one he cannot
  affect, is refused with a plain explanation.
- **Hard or slow levels:** while the solver works, the editor shows a progress
  bar. There is no fixed time limit: the author may keep it searching or stop;
  stopping means "not shareable yet", never "shared unproven".
- **Too easy is allowed:** a level that passes the rules above but is under
  the difficulty bar can be shared; it is marked "easy". Campaign levels must
  clear the bar.
- **The solver runs only when asked.** Editing never starts a search. The
  author presses **Check** to prove and rate the level, and **Share** runs the
  check first if the level changed since the last one.
- **Desktop first;** full phone editing too if it can be done well. Phones can
  always play shared levels.
- **Editing:** paint tiles and pieces, undo the last 50 edits, and a
  **Try it** button that drops into the level and back out.
- **A shared link opens Play and Edit a copy.** It shows the generated name
  and the author's best move count, if the author played it, as a challenge
  ("beat 54"). Editing makes a new level; a link never changes.
- **Campaign export:** an owner-only button copies the level's exact text in
  the `trials.ts` format; Claude commits it.
- **Not in the first version:** generating starting layouts for the author.
- **The fast solver uses** A\* search, compact situations, Sokoban-style
  pruning, a background worker, and the browser's private file storage (the
  Origin Private File System) when memory fills, with proven results cached.

## Part 1: the fast solver

### What it must do

- **Same answers.** For every level, the shortest winning line it finds has
  the same length as today's breadth-first search finds, and "no win" means
  the same. The test suite runs both on every campaign level and on a corpus
  of small generated levels and compares them. Today's search stays in the
  repo as the reference for that check.
- **Exact shortest wins.** The move score, the difficulty measure and the
  thread help all depend on the shortest line, so the search must still find
  it. A\* does, as long as its estimate of the moves left never overestimates.
  Ice and force floors move Theseus several cells in one move, so a plain
  cell distance overestimates; the estimate must be one that is provably never
  too high (for example, distances on a relaxed graph where a slide or a carry
  counts as one move and every door is open). The builder chooses it; the
  tests above guard it.
- **Compact situations.** Each situation is packed into numbers (the positions
  of Theseus, the Minotaur and the cow; the taken items, open doors, toggle
  walls and filled water as bits; block positions; hearts, stone turns and
  tools), not a text key. Memory per stored situation drops by at least ten
  times against today's.
- **Pruning that never loses a win:**
  - *Dead blocks:* a block pushed where it can never move again and that a
    win needs moved is a dead end (the Sokoban "dead square" and frozen-block
    checks).
  - *Dominated situations:* a situation strictly worse than one already seen
    (same cells and terrain, fewer keys, tools, hearts or gear) is dropped.
  - Every rule is checked by the same-answers tests; a rule that ever changes
    an answer is wrong.
- **Background worker.** The search runs in a Web Worker. It reports progress
  (situations searched, a rough share of work done when one can be estimated)
  and can be stopped and resumed. The page never freezes.
- **Private file storage.** When the worker's memory budget fills, the search
  continues with its seen-situations and frontier on disk, in the Origin
  Private File System through a synchronous access handle in the worker.
  Where that storage is missing or refused (some phones, private windows), the
  search runs in memory only and says so when it runs out.
- **Cached results.** A finished result (proven with its shortest line, or
  proven unwinnable) is kept in that storage keyed by the level's exact text,
  so the same level is never solved twice on that browser. Storage that is
  missing, full or throws reads as "not cached".
- **One engine for everything.** The thread help (hint, route, follow), the
  difficulty measure and the campaign tests all call it. In tests it runs
  without a worker or disk, in memory, under Node.

### Out of scope for Part 1

Parallel search across several workers; a server-side solver.

## Part 2: the editor

### The page

A new page in the Crete game folder (its own entry beside today's game), in
the game's look: the board on a canvas from the same tile sprites, a palette of
terrain and pieces, and a side panel. Desktop first: mouse to paint (click,
drag to paint a line or area), keys for undo and Try it. Phone: tap to paint,
with the palette in a drawer, as far as it works well; playing shared levels on
a phone must always work.

- **Board size:** a new level starts at a size the author picks; it can grow
  or shrink up to 64 × 64. Bigger than the screen scrolls, as Chapter 1's big
  boards do.
- **Pieces:** everything the level format has today: every terrain, every
  object, Theseus and the Minotaur, hearts and the relic count. Story pages are
  not offered in the editor for shared levels (they belong to the campaign's
  lore); campaign export keeps whatever the owner placed.
- **Undo:** the last 50 edits, and redo.
- **Try it:** plays the level in the real game engine, with undo and restart;
  leaving returns to the editor where it was. A win by the author is kept as
  their best for the link.
- **Check:** proves and rates the level on request, in the background
  solver: winnable or not, quickest win, situations searched, how much the
  Minotaur adds, whether ignoring him still wins, and the rating (easy, or
  passes the bar). While it searches it shows the progress bar with **Keep
  searching** and **Stop**. Any edit marks the result out of date; nothing
  re-runs until Check or Share is pressed.
- **Problems are explained:** an unwinnable level says so; a level the solver
  could not finish says which pieces make it hard (most often blocks), so the
  author can simplify.

### Sharing

- **Share** runs Check if the level changed since the last one, and succeeds
  only when the level has a Minotaur, is proven winnable, and ignoring the
  Minotaur loses.
- The link carries the whole level, compressed, in the URL fragment (after
  `#`), so it never reaches the server's logs. It also carries the solver's
  winning line (see below), the author's three initials and their best move
  count, if any.
- **Generated name:** "Level XXXX by ABC", where XXXX is a short code derived
  from the level's text (the same level always gets the same code) and ABC is
  the initials.
- **Initials** are three letters A–Z, checked against a short list of
  offensive three-letter words, refused with a plain message if they match.
- A 64 × 64 level must fit in a link that common browsers and chat apps open
  (the builder measures the worst case and keeps it under a limit it states).
- Opening a link shows the name, the rating, and the author's best ("beat
  54"), with **Play** and **Edit a copy**. Playing uses the normal game with
  the thread help, which uses the cached or freshly computed solution.
- A link that is damaged, too long, from a newer format, or fails the solver
  shows a plain message and never a broken board.
- Nothing about a shared level is stored on the server.

### Campaign export

An owner-only button (hidden unless a flag is set in the browser by the owner;
not a security boundary, since the export is only text) copies the level in the
exact `trials.ts` text format. Campaign levels must also pass the difficulty
gate in the test suite, as today.

## Constraints

- No server storage for levels; links only.
- No free text from players anywhere on the site.
- Esc is never bound. Never bind ports 3000, 5173, 8000 or 8080 in tests.
- The level text format (`src/puzzle/level.ts`) stays the source of truth; the
  link format is a compressed, versioned encoding of it.
- Docs describe current state.

## How it is checked

- Part 1: the same-answers tests (new solver against the reference search) on
  every campaign level and a generated corpus; pruning-rule unit tests; memory
  per situation measured; a test that a big generated level (for example 40 ×
  40 with keys, doors and two blocks) is proven within a stated time in Node;
  the worker's progress, stop and resume; storage fallbacks.
- Part 2: link round-trips for every piece and for 64 × 64; damaged and
  oversized links; generated names stable; initials filter; Share disabled
  until proven; Try it and back; browser specs for building a small level,
  sharing it, opening the link on a phone-sized screen and winning it.

## Decisions settled after review (Claude's calls)

- **Difficulty uses the new engine's numbers.** "Situations searched" in the
  meter and in the campaign gate is the new solver's count. Because pruning
  makes it smaller than today's breadth-first count, the bar in
  `difficulty.ts` is recalibrated in Part 1 so every Chapter 1 level keeps its
  current pass or fail (the test suite checks this), and the README section
  "What makes a good level" is updated with the new numbers.
- **"Easy" for a player's level** means it passes the share rules but fails
  the challenge bar measured against Chapter 1's teaching levels (the
  campaign's fixed reference). A level with no Minotaur is never shareable.
- **Links carry the solver's proof.** When the solver proves a level, the
  shortest winning line it found goes into the link with the level. Whoever
  opens the link replays that line, which takes milliseconds even at 64 × 64,
  so the level is proven on their device without a search, and the thread help
  works at once. Nothing else in a link is trusted: the Minotaur rule and the
  rating are recomputed in the background on the player's device, which shows
  "rating…" until done. A line that does not win, or a level without a
  Minotaur, is a damaged link.
- **What Share waits for.** Share needs two searches: the level as it is
  (the proof) and the level without the Minotaur (whose route, replayed on the
  real level, must lose). The catch-refusing search is part of the rating
  only and does not block Share. All go through the same engine and cache; the
  progress bar covers whichever search is running, and Stop stops them all.
- **Campaign fields:** with the owner flag on, the editor shows title, intro
  and page-id fields and offers the story page piece, for campaign export only.
  Those fields never go into a share link, so the no-free-text rule holds for
  everything players can send.
- **The A\* estimate** may ignore the Minotaur and catches only where that is
  provably never too high; where the builder cannot prove that, it uses a
  weaker estimate (down to zero, which is plain breadth-first order). The
  same-answers tests are the guard either way.
- **Limits:** in the editor and in Play there is no fixed cap: the progress bar
  and Stop decide. In Node tests the search runs in memory with a cap, and the
  campaign tests stay within the suite's current time (no slower than today's
  `units.sh`).
- **The author's best** in a link counts only a win in Try it with no thread
  help. An assisted win plays normally but sets no challenge number.

## Left to the builder

The A\* estimate, the exact packing, the pruning rules beyond the two named,
the disk layout, the link encoding, the progress estimate, the palette layout
and the editor's file structure.
