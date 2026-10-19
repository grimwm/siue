# Crete Chapter 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn Crete's eight trials into Chapter 1, "The Outer Halls", with two new levels, chapter cards, a level list by chapter, story pages, a Lore book, and a board that scrolls when a level is bigger than the screen.

**Architecture:** The engine learns which story page a `p` cell is (a `pages:` header and a bitmask in the state). A DOM-free campaign module holds the chapters and their lore; the controller records found pages beside the existing progress; the page (`src/ui.ts`) gains a chapter card, a levels list, a Lore book and a follow-the-player scroll for big boards.

**Tech Stack:** TypeScript 7 run by `node --test` (no build for tests), Preact for cards (`games/_kit/ui`), esbuild via `games/_kit/build/build.mjs`, Playwright browser specs in `websites/www.cs/tests/e2e`.

**Spec:** `docs/superpowers/specs/2026-10-19-crete-chapter-1-design.md` (mockup beside it: `2026-10-19-crete-chapter-1-screens.html`). Vision: `docs/superpowers/specs/2026-10-16-crete-redesign-vision.md`.

All paths below are relative to `websites/www.cs/games/crete/` unless they start with `websites/` or `docs/`.

## Global Constraints

- Every level is open from the start; nothing locks. No level codes anywhere.
- Levels 1–8 play exactly as today: their grids and their pinned shortest lines (`SHORTEST` in `test/puzzle-trials.test.ts`: `10, 23, 36, 28, 23, 24, 23, 29`) do not change. Only trial 8's `title:` and `intro:` change.
- Level ids `trial-1` … `trial-8` keep their ids (stored progress carries over); the new ones are `trial-9` and `trial-10`.
- Found pages are stored under `crete-pages`, never inside `crete-progress`.
- A page counts as found only when the level is won holding it; a helped win still counts it.
- Chapter 1 has exactly two pages: one in level 9, one in level 10.
- Quotations are word for word from: Plutarch, *Theseus* (Bernadotte Perrin, 1914); Ovid, *Metamorphoses* 8 (Brookes More, 1922); Apollodorus, *The Library* (J. G. Frazer, 1921); Catullus 64 (a public-domain translation); Hawthorne, *Tanglewood Tales*, "The Minotaur" (1853). Each carries a citation (author, work, section, translator, year). A quotation that cannot be checked word for word against the source text is left out.
- Esc is never bound. No new key collides with an existing one (`src/keys.ts`); the level list keeps N.
- Never bind ports 3000, 5173, 8000 or 8080; browser specs run through `make e2e`.
- Docs (README, comments) describe current state, never history.
- After any change under `src/`, `game.css` or `index.html`: from `websites/www.cs/games` run `node _kit/build/build.mjs crete`; in `games/crete` run `php tools/install-files.php`; in `websites/www.cs` run `php tools/site-versions.php && php tools/site-game-pages.php`. Commit `dist/`, `sw.js` and the changed pages with the source.
- Unit tests: from `websites/www.cs/games`, `node --test crete/test/<file>.test.ts`; the whole set with `bash units.sh`. Type check and build check: `crete/test.sh`.

## Rulings made while planning (spec silent or open)

- **Big boards:** a level whose grid is more than 12 in either dimension is *big*. A big level's cell is `max(fitted cell, 32)` CSS px and the board scrolls inside `#board`; every other level fits exactly as today. On a 393 px-wide portrait phone a 14-column board then needs ≥ 448 px and scrolls; levels 1–9 (≤ 12 × 12) never scroll.
- **Title and chapter card flow:** Play (and `?seed=`) opens Chapter 1's opening card. Its **Enter the halls** starts the first level of the chapter this browser has not cleared (level 1 for a new player); **Levels** (N, the existing list key) opens the list. Picking level 1 from the list shows the opening card first. The mockup's "L" tab becomes N.
- **Rename trials → levels in the page:** layer `trials` → `levels`, `ui/trials.tsx` → `ui/levels.tsx`, ids `#trials-veil`/`#trial-N` → `#levels-veil`/`#level-N`. `src/puzzle/trials.ts` keeps its name and its `TRIALS` array (now ten entries); `Game.trial` keeps its name (an index into the campaign's levels).
- **Lore format:** TypeScript data in `src/campaign/chapter-1.ts`: plain strings the owner can edit, loaded by tests directly.

## Review Focus

1. Stored `crete-progress` from today's eight trials (including a `best: null` assisted clear) must still read correctly after the change: the levels list shows the same statuses.
2. A page taken, then undone (or the try restarted, or lost), must not be recorded; taking the same page in two wins must not duplicate it in the Lore book.
3. Blocked or corrupt `crete-pages` storage (a string, an array of non-strings, a thrown `getItem`) reads as no pages found and never breaks the page.
4. Resizing or rotating while a big level is open (portrait → landscape → portrait) keeps Theseus visible and leaves small levels unscrolled.
5. Q on the chapter card, the Lore book and an open Lore entry closes only the top card; the closing chapter card after level 10 does not let the end card's buttons act before it is dismissed.

---

### Task 1: Pages have names (level header, state bitmask, solver key)

**Files:**
- Modify: `src/puzzle/level.ts` (header names, `Level`, `parse`, `serialize`)
- Modify: `src/puzzle/state.ts:21,44` (`pages` doc + initial)
- Modify: `src/puzzle/step.ts:95` (`arrive`)
- Test: `test/puzzle-level.test.ts`, `test/puzzle-step.test.ts`

**Interfaces:**
- Produces:
  - `Level.pageIds: readonly string[]` — the `pages:` header's ids, in grid reading order; `[]` when the level has no pages.
  - `Level.pageCells: readonly number[]` — the row-major cell index of each `p`, in reading order (same length as `pageIds`).
  - `State.pages: number` — now a bitmask: bit `i` set when the page at `pageCells[i]` has been taken. `stateKey` already includes `s.pages`, so the solver needs no change.
  - `pagesTaken(s: State): string[]` in `src/puzzle/state.ts` — the ids of the set bits, in `pageIds` order.

- [ ] **Step 1: Write the failing tests**

In `test/puzzle-level.test.ts`:
```ts
test('pages: header names each page cell in reading order', () => {
  const lv = parse('title: t\nintro: i\npages: d1-hand d1-gate\n\n#####\n#PpE#\n#..p#\n#####\n');
  assert.deepEqual(lv.pageIds, ['d1-hand', 'd1-gate']);
  assert.deepEqual(lv.pageCells, [7, 13]);
  assert.equal(serialize(lv), 'title: t\nintro: i\npages: d1-hand d1-gate\n\n#####\n#PpE#\n#..p#\n#####\n');
});
test('pages: count must match the grid, ids unique and lower-case', () => {
  assert.throws(() => parse('title: t\nintro: i\npages: a\n\n####\n#Pp#\n#pE#\n####\n'), /pages: 1 named but the grid has 2/);
  assert.throws(() => parse('title: t\nintro: i\npages: a a\n\n####\n#Pp#\n#pE#\n####\n'), /page 'a' named twice/);
  assert.throws(() => parse('title: t\nintro: i\npages: A\n\n###\n#Pp\n###\n'), /page id 'A'/);
  assert.throws(() => parse('title: t\nintro: i\n\n####\n#PpE\n####\n'), /pages: 0 named but the grid has 1/);
});
test('a level with no page needs no pages: header', () => {
  assert.deepEqual(parse('title: t\nintro: i\n\n###\n#PE\n###\n').pageIds, []);
});
```
In `test/puzzle-step.test.ts`, replace the `r.state.pages, 1` assertion's test with one on a two-page level: taking the second page in reading order gives `pages === 0b10` and `pagesTaken(...)` `['second-id']`; then taking the first gives `0b11` and both ids in header order.

- [ ] **Step 2: Run to see them fail**

Run (from `websites/www.cs/games`): `node --test crete/test/puzzle-level.test.ts crete/test/puzzle-step.test.ts`
Expected: FAIL (`pageIds` undefined; no `pages` header).

- [ ] **Step 3: Implement**

`NAMES` gains `'pages'`. Page ids match `/^[a-z0-9-]+$/`, separated by single spaces; errors are `LevelError`s at the header line with the messages the tests pin. Each page cell is `1 << i`, so a level holds at most 31 pages (`LevelError` past that). `serialize` writes `pages: …` after `relics:` only when `pageIds` is non-empty. In `arrive`: `w.pages |= 1 << w.level.pageCells.indexOf(index(w, at))`. Update the `State.pages` doc comment to say bitmask.

- [ ] **Step 4: Run the puzzle tests**

Run: `node --test crete/test/puzzle-*.test.ts`
Expected: PASS, the trials' `SHORTEST` unchanged.

- [ ] **Step 5: Commit**

```bash
git add websites/www.cs/games/crete/src/puzzle websites/www.cs/games/crete/test
git commit -m "feat(crete): story pages have ids (pages: header, bitmask in the state)"
```

---

### Task 2: The campaign and Chapter 1's lore

**Files:**
- Create: `src/campaign/lore.ts` (types)
- Create: `src/campaign/chapter-1.ts` (the words)
- Create: `src/campaign/chapters.ts` (the ten chapters, the flat level list)
- Modify: `src/puzzle/trials.ts` (trial 8's title and intro only; header comment says ten levels arrive in Task 3)
- Test: `test/campaign.test.ts`

**Interfaces:**
- Consumes: `Level.pageIds` (Task 1), `TRIALS`, `trialLevel` (`src/puzzle/trials.ts`).
- Produces (`src/campaign/lore.ts`):
  ```ts
  export interface Quote { text: string; cite: string }
  export interface Card { text: string; quote?: Quote }
  export interface Page { id: string; title: string; text: string; quote?: Quote }
  export interface ChapterLore { opening: Card; closing: Card; pages: readonly Page[] }
  ```
- Produces (`src/campaign/chapters.ts`):
  ```ts
  export interface Chapter { n: number; name: string; released: boolean; levelIds: readonly string[]; lore: ChapterLore | null }
  export const CHAPTERS: readonly Chapter[];          // n = 1..10; only 1 released
  export const LEVEL_IDS: readonly string[];          // released chapters' level ids, in play order
  export function chapterOf(levelIndex: number): { chapter: Chapter; within: number }; // within: 0-based
  export function pageHome(pageId: string): number[]; // level indexes whose header names it
  export function nextChapter(n: number): Chapter | null;
  ```
  Unreleased chapters have `name: ''`, `levelIds: []`, `lore: null`.

- [ ] **Step 1: Write the failing tests** (`test/campaign.test.ts`)

- `CHAPTERS.length === 10`, `CHAPTERS[0]` is `{ n: 1, name: 'The Outer Halls', released: true }` with `levelIds` `trial-1` … `trial-10` (Task 3 adds 9 and 10; until then assert the first eight and mark the length check `todo` — remove the `todo` in Task 3).
- Every released chapter has lore; every chapter after it is unreleased.
- Every page id a released level names exists in its chapter's `lore.pages`, and every lore page is named by exactly one level (`pageHome(id).length === 1`) — enforced once Task 3 lands; until then the test runs over the levels that exist.
- Chapter 1's lore has exactly two pages; ids match `/^[a-z0-9-]+$/` and are unique across all chapters.
- Every `quote` has non-empty `text` and a `cite` matching `/^[A-Z][^,]+, .+, .+, tr\. .+ \(\d{4}\)$/` (author, work, section, translator, year).
- `trialLevel(7).title !== 'The Heart of the Labyrinth'` and its intro does not contain `tribute`.

- [ ] **Step 2: Run to see them fail**

Run: `node --test crete/test/campaign.test.ts` — Expected: FAIL (module missing).

- [ ] **Step 3: Write the words and the data**

Draft in the voice of today's intros and `src/ui/story.tsx`: plain, short, second person in intros. Chapter 1 frame: Theseus is already inside with Ariadne's thread; these are Daedalus's outer halls, built to wear down each tribute; the chapter ends at a sealed gate with the true Labyrinth behind it. No meta twist; at most one page hints that the halls "move at night". Two pages (ids `ch1-` prefixed): one for level 9, one for level 10. Opening and closing cards each get at most one quotation. The closing card's text ends by saying Chapter 2 is not yet released (taken from `nextChapter(1)`, so the UI can also print it).

- [ ] **Step 4: Check every quotation against its source**

Fetch the source text (Project Gutenberg or Perseus) for each quotation and compare word for word, punctuation included; correct the citation's section. Drop any quotation you cannot match. Write the source URL for each kept quotation in the task report (not in the code).

- [ ] **Step 5: Rename trial 8**

In `src/puzzle/trials.ts`, trial 8's `title:` becomes "The Sealed Gate" (or a better name in the same spirit) and its `intro:` keeps its list of obstacles but no longer promises the end of the tribute. The grid is untouched.

- [ ] **Step 6: Run the tests**

Run: `node --test crete/test/campaign.test.ts crete/test/puzzle-trials.test.ts` — Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add websites/www.cs/games/crete/src/campaign websites/www.cs/games/crete/src/puzzle/trials.ts websites/www.cs/games/crete/test/campaign.test.ts
git commit -m "feat(crete): chapters and Chapter 1 lore; trial 8 renamed"
```

---

### Task 3: Levels 9 and 10

Use the most capable model: this is level design against the solver.

**Files:**
- Modify: `src/puzzle/trials.ts` (two new entries, header comment: ten levels)
- Modify: `src/campaign/chapters.ts` (Chapter 1 `levelIds` gains `trial-9`, `trial-10`)
- Modify: `test/puzzle-trials.test.ts`, `test/campaign.test.ts` (drop the Task 2 `todo`)

**Interfaces:**
- Consumes: `pages:` header (Task 1); page ids from `src/campaign/chapter-1.ts` (Task 2); `solve(start, cap)`; `SOLVER_CAP`.
- Produces: `TRIALS.length === 10`; `trialLevel(8)` "The Bull's Horns", `trialLevel(9)` "The Great Hall".

- [ ] **Step 1: Write the failing tests** (`test/puzzle-trials.test.ts`)

- Replace "eight trials … at most 12 by 12" with: ten levels, canonical text; levels 1–9 at most 12 × 12; level 10 has `cols >= 14`, `cols > 12 || rows > 12`, and fits in 20 × 20.
- `SHORTEST` gains the two new lengths (measured in Step 3, then pinned).
- **Level 9 teaches the catch:** `hearts === 3`; it has `safe` terrain, `dirt` reachable only after sinking a block, and one page. Its shortest line (`solve`) loses exactly one heart (replay the line; count `caught` events === 1). A second search that treats any `caught` event as a dead end (write `solveNoCatch(start, cap)` in the test file: the same BFS as `solve` but skipping successor states whose step emitted `caught`) either finds no win or finds one strictly longer.
- **Level 10 is the capstone:** uses at least one key door, one gear, a block with a button, one tool and the Minotaur (check by the replayed line's `took`/`opened`/`pushed`/`flipped` events and the grid's contents); it has one page; there are two winning routes that differ in which key or gear they use (prove by solving it twice: as is, and with one of the two route-defining objects removed via `withoutObjects`, both solved).
- Level 10 is proved with `solve(initial(lv), 6_000_000)` and the test finishes in under 20 s on a laptop; levels 1–9 keep the existing `explored < 200_000` bound.

- [ ] **Step 2: Run to see them fail**

Run: `node --test crete/test/puzzle-trials.test.ts` — Expected: FAIL (8 levels).

- [ ] **Step 3: Design the two levels**

Write each grid by hand or with a throwaway search script kept out of the repo, iterate against the tests, then tune by hand. Level 9: a hall lined with safe zones where taking one hit on purpose is the quickest way through, and a pool to fill with a block so dirt opens a path for both Theseus and the Minotaur; the page on an out-of-the-way spur. Level 10: at least 14 columns, more than one route, ends at the gate; the page off the main route. If level 10 cannot be proved within the cap, cut mechanics or branches, never the proof. Each intro is one or two lines in the trials' voice; level 10's points toward the sealed gate.

- [ ] **Step 4: Run the tests**

Run: `node --test crete/test/puzzle-trials.test.ts crete/test/campaign.test.ts` — Expected: PASS. Note each level's explored count and wall time in the report.

- [ ] **Step 5: Commit**

```bash
git add websites/www.cs/games/crete/src websites/www.cs/games/crete/test
git commit -m "feat(crete): levels 9 (The Bull's Horns) and 10 (The Great Hall)"
```

---

### Task 4: Found pages are kept, and the controller plays the campaign

**Files:**
- Create: `src/pages.ts`
- Modify: `src/campaign/chapters.ts` (`CAMPAIGN_LEVELS`)
- Modify: `src/game.ts` (levels from the campaign; record pages on a win)
- Modify: `src/main.ts` (wire `createFoundPages`; test hook gains `LEVEL_IDS`, `CHAPTERS`)
- Test: `test/pages.test.ts`, `test/game.test.ts`, `test/progress.test.ts`

**Interfaces:**
- Consumes: `pagesTaken` (Task 1), `LEVEL_IDS` (Task 2), `trialLevel`.
- Produces:
  ```ts
  // src/pages.ts
  export const PAGES_KEY = 'crete-pages';
  export interface FoundPages { has(id: string): boolean; all(): string[]; /** Adds; returns the ids that were new. */ add(ids: readonly string[]): string[] }
  export function createFoundPages(storage: StorageLike | null): FoundPages;
  ```
  `GameDeps` gains `pages: FoundPages` and `levels: Levels`, where
  ```ts
  export interface Levels { readonly count: number; id(i: number): string; level(i: number): Level }
  export const CAMPAIGN_LEVELS: Levels; // in src/campaign/chapters.ts: LEVEL_IDS with trialLevel
  ```
  `game.ts` no longer imports `TRIALS`/`trialLevel`; `open(i)` uses `deps.levels.level(i)` and progress is recorded under `deps.levels.id(trial)`. `Game` gains `readonly found: readonly string[]` — the pages the last win recorded as new (empty after `open`, `undo`, `restart`).

- [ ] **Step 1: Write the failing tests**

`test/pages.test.ts` (with the kit's memory storage, as `test/progress.test.ts` uses):
- `add(['a','b'])` returns `['a','b']`; a second `add(['b','c'])` returns `['c']`; `all()` is `['a','b','c']`; survives a new `createFoundPages` on the same storage.
- `crete-pages` holding `"x"`, `[1,2]`, `{}` or a storage whose `getItem` throws reads as `all() === []`, and `add` still works in memory.
- `crete-progress` is untouched by `add`.

`test/progress.test.ts`: a stored table for `trial-1`…`trial-8` written in today's shape (one with `best: null`) reads back the same statuses.

`test/game.test.ts`, on a small two-page level given through a stub `levels` dep (existing tests pass `CAMPAIGN_LEVELS`):
- winning with one page taken calls `pages.add([thatId])` once and exposes `found` `[thatId]`;
- taking a page then undoing past it and winning records nothing; restarting clears `found`;
- a win with the thread used (`assisted`) still records the page;
- a lost try records nothing.

- [ ] **Step 2: Run to see them fail**

Run: `node --test crete/test/pages.test.ts crete/test/game.test.ts crete/test/progress.test.ts` — Expected: FAIL.

- [ ] **Step 3: Implement** `createFoundPages` on the kit's `pref`/`json` like `src/progress.ts` (validator: array of strings matching the page-id pattern). In `play()`, on a win: `found = deps.pages.add(pagesTaken(run.now))`. Wire it in `main.ts`.

- [ ] **Step 4: Run** `bash units.sh` (from `websites/www.cs/games`) — Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add websites/www.cs/games/crete/src websites/www.cs/games/crete/test
git commit -m "feat(crete): keep found story pages; the controller plays the campaign's levels"
```

---

### Task 5: Big boards scroll and follow Theseus

**Files:**
- Create: `src/follow.ts`
- Modify: `src/fit.ts` (big-level rule), `src/ui.ts` (`fit()` and a follow after each render), `game.css` (`.board.scrolls`)
- Test: `test/follow.test.ts`, `test/fit.test.ts` (create if missing)
- Modify: `websites/www.cs/tests/e2e/crete-layout.spec.ts`

**Interfaces:**
- Produces:
  ```ts
  // src/fit.ts
  export const BIG = 12;          // more than this in either dimension is a big level
  export const BIG_MIN_CELL = 32; // CSS px
  export function cellFor(width: number, height: number, cols: number, rows: number, gap: number): { cell: number; scrolls: boolean };
  // src/follow.ts
  export interface View { x: number; y: number; w: number; h: number } // scroll offset and visible size, CSS px
  /** The scroll offset that keeps the box [left, top, size] at least `margin` inside the view, moving as little as possible, clamped to [0, content - view]. */
  export function follow(view: View, content: { w: number; h: number }, box: { left: number; top: number; size: number }, margin: number): { x: number; y: number };
  ```
  `cellFor` returns `{ cell: fitCell(...), scrolls: false }` for levels ≤ 12 × 12; for a big level `{ cell: max(fitCell(...), BIG_MIN_CELL), scrolls: fitCell(...) < BIG_MIN_CELL }`.

- [ ] **Step 1: Write the failing tests**

`test/fit.test.ts`: a 12 × 10 level in a 385 × 500 space never scrolls (same cell as `fitCell`); a 14 × 12 level in 385 × 500 gives `{ cell: 32, scrolls: true }`; the same level in 1000 × 800 fits without scrolling.

`test/follow.test.ts`: a box well inside the view leaves the offset unchanged (no jump per step); a box past the right margin moves `x` just enough to bring it `margin` inside; never below 0 nor past `content - view`; same on `y`. Margin is 2 cells in the page (`2 * cell`).

`crete-layout.spec.ts`: on 'iPhone 15, portrait' and 'iPhone SE, portrait', opening level 10 (through the levels list) leaves the page unscrolled (`documentElement` checks unchanged) while `#board` has `scrollWidth > clientWidth`; walking the solver's line through the strip's buttons keeps the player's cell inside `#board`'s visible rect at every step; levels 1–9 on every device keep `#board` unscrolled. Rotate the iPhone 15 context to landscape and back with level 10 open: the player stays visible.

- [ ] **Step 2: Run unit tests to see them fail**

Run: `node --test crete/test/fit.test.ts crete/test/follow.test.ts` — Expected: FAIL.

- [ ] **Step 3: Implement** `cellFor`, `follow`; in `ui.ts` `fit()` uses `cellFor` and toggles `.scrolls` on `#board` (`overflow: auto`, scroll bars hidden on touch, the canvas no longer centred when scrolling); after each `render` and after `fit`, call `follow` with the player's cell from the frame being drawn (`run.now.player`) and set `#board.scrollLeft/Top`. Reduced motion or not, the scroll is instant.

- [ ] **Step 4: Build and run**

Build per Global Constraints, then `node --test crete/test/fit.test.ts crete/test/follow.test.ts` and, from `websites/www.cs`, `make e2e E2E_ARGS="crete-layout.spec.ts"` — Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add websites/www.cs/games/crete websites/www.cs/tests/e2e/crete-layout.spec.ts websites/www.cs/sw.js websites/www.cs/play
git commit -m "feat(crete): big boards scroll and follow Theseus"
```

---

### Task 6: Chapter card, levels list and the new title flow

**Files:**
- Create: `src/ui/chapter.tsx`, `src/ui/levels.tsx` (replaces `src/ui/trials.tsx`, which is deleted)
- Modify: `src/layers.ts` (`LayerName`: `trials` → `levels`; add `chapter`), `src/ui.ts`, `src/main.ts` (`play`, `?seed=`), `src/ui/title.tsx` (kicker from `CHAPTERS[0]`), `src/ui/start.tsx` (kicker "Chapter 1 · Level 3"), `src/status.ts` (label "Level"), `src/help.ts` (N = level list), `index.html` (`levels-root`, `chapter-root`), `game.css` (`.chapter-tabs`, quote block per the mockup)
- Test: `test/views.test.ts`, `test/layers.test.ts`, `test/ui.test.ts`, `test/start.test.ts`, `test/smoke.test.ts`, `test/keys.test.ts` (rename trials → levels where they reference it)
- Modify: `websites/www.cs/tests/e2e/crete-play.spec.ts`, `crete-layout.spec.ts` (ids `#levels-veil`, `#level-N`; the title → chapter card → level flow)

**Interfaces:**
- Consumes: `CHAPTERS`, `LEVEL_IDS`, `chapterOf`, `nextChapter` (Task 2); `progress.get`.
- Produces:
  ```ts
  // src/ui/chapter.tsx
  export interface ChapterCardProps { open: boolean; chapter: Chapter; closing: boolean; next: Chapter | null; onEnter: () => void; onLevels: () => void; onClose: () => void }
  // src/ui/levels.tsx
  export interface LevelRow { title: string; status: string }
  export interface LevelsProps { open: boolean; chapters: readonly Chapter[]; shown: number /* chapter n */; rows: LevelRow[]; current: number; onPick: (i: number) => void; onTab: (n: number) => void; onClose: () => void }
  ```
  `Ui.showTrials()` becomes `Ui.showLevels()`. `Ui` gains `showChapter(n: number, closing: boolean)`.

- [ ] **Step 1: Write the failing tests**

`test/views.test.ts` (render to a DOM the way the file does today):
- Chapter card, opening: kicker "Chapter 1 of 10", title "The Outer Halls", the opening text, the quotation in a `blockquote` with its `cite`, buttons **Enter the halls** (Enter tab) and **Levels** (N tab). Closing: the closing text and quotation, the line "Chapter 2 is not yet released", and only a **Continue** button.
- Levels list: ten tabs; tab 1 pressed, tabs 2–10 disabled and labelled "Ch N · soon"; ten rows with title and status ("not yet" / "cleared with help" / "cleared · best 14"); every row enabled; the current one `aria-pressed="true"`.
- Start card kicker "Chapter 1 · Level 3".

`test/layers.test.ts`: the new names; Q closes `chapter` like any other card.

`test/ui.test.ts`: Play opens the chapter card; Enter on it starts the first uncleared level (level 1 with empty progress; level 4 when 1–3 are cleared); picking level 1 from the list opens the chapter card first, picking level 5 does not; N opens the levels list from anywhere it does today.

- [ ] **Step 2: Run to see them fail**

Run: `node --test crete/test/views.test.ts crete/test/layers.test.ts crete/test/ui.test.ts` — Expected: FAIL.

- [ ] **Step 3: Implement** the two components on `_kit/ui/dialog.tsx` and `button.tsx` like `ui/trials.tsx` and `ui/end.tsx`, wire them in `ui.ts`, change `play()` and the `?seed=` path in `main.ts` to open the chapter card, and rename the ids. Status bar shows `Level 3/10`.

- [ ] **Step 4: Build and run**

Build per Global Constraints; `bash units.sh`; from `websites/www.cs`: `make e2e E2E_ARGS="crete-play.spec.ts crete-layout.spec.ts"` — Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add websites/www.cs/games/crete websites/www.cs/tests/e2e websites/www.cs/sw.js websites/www.cs/play
git commit -m "feat(crete): chapter card, levels list by chapter, title opens Chapter 1"
```

---

### Task 7: Pages on the win card, the closing card, and the Lore book

**Files:**
- Create: `src/ui/lore.tsx`
- Modify: `src/ui/end.tsx` (page lines), `src/ui.ts` (`endView`, closing card after level 10, `lore` layer), `src/ui/menu.tsx` (a **Lore book** button), `src/layers.ts` (add `lore`), `src/audio.ts` (a `chapter` sound on Crete's synth, played when a chapter card opens), `index.html` (`lore-root`), `game.css`
- Test: `test/views.test.ts`, `test/ui.test.ts`, `test/audio.test.ts`, `test/layers.test.ts`
- Create: `websites/www.cs/tests/e2e/crete-chapter.spec.ts`

**Interfaces:**
- Consumes: `Game.found` and `FoundPages` (Task 4), `CHAPTERS`, `pageHome` (Task 2), `ChapterCardProps` (Task 6).
- Produces:
  ```ts
  // src/ui/lore.tsx
  export type LoreEntry = { kind: 'card'; which: 'opening' | 'closing'; chapter: number } | { kind: 'page'; id: string };
  export interface LoreProps { open: boolean; chapters: readonly Chapter[]; found: (id: string) => boolean; closingSeen: (n: number) => boolean; shown: LoreEntry | null; onShow: (e: LoreEntry | null) => void; onClose: () => void }
  ```
  `EndView` gains `pages: string[]` (page titles found in this win).

- [ ] **Step 1: Write the failing tests**

`test/views.test.ts`:
- End card after a win with `pages: ['A note in Daedalus's hand']` shows "You found a page: A note in Daedalus's hand. It is in the Lore book."; with `pages: []` shows no such line.
- Lore book: Chapter 1 heading with its opening card entry; a found page shows its title and "found in level 9"; a missing page shows "? ? ?" and "hides in level 10" (from `pageHome`); the closing card entry appears only when `closingSeen(1)`; chapters 2–10 each show one line "Not yet released". Opening an entry shows its full text, quotation and citation, with a Back button.

`test/ui.test.ts`:
- Winning level 10 opens the closing chapter card on top of the end card; the end card's buttons are not reachable (its layer is not top) until Continue or Q; then the end card shows with no **Next**.
- The closing card counts as seen (Lore book shows it) once level 10 has been won in this browser — derive it from `progress.get('trial-10').cleared`, not a new key.
- Menu has a **Lore book** button that opens the `lore` layer; Q from an open entry goes back to the list, Q again closes the book.

`test/audio.test.ts`: the `chapter` sound exists and plays once per chapter card opening.

`websites/www.cs/tests/e2e/crete-chapter.spec.ts`: from the title, Play shows the chapter card; Enter opens level 1's start card. Then, using the test hook to open level 9 and the solver's line *with the page*: play the shortest winning line that takes the page (compute it in the page with a search that requires the page bit — expose nothing new; do it in the spec with `__creteTest.solve` on a copy of the level whose exit is gated by the page, or by walking to the page first then solving from there), win, see the page line on the end card, open the menu's Lore book and see the page by title. No `pageerror`s.

- [ ] **Step 2: Run to see them fail**

Run: `node --test crete/test/views.test.ts crete/test/ui.test.ts crete/test/audio.test.ts crete/test/layers.test.ts` — Expected: FAIL.

- [ ] **Step 3: Implement** the Lore book as one dialog with a list view and an entry view (`shown`), the page lines on the end card from `game.found` mapped to titles, and the closing flow in `render()`.

- [ ] **Step 4: Build and run**

Build per Global Constraints; `bash units.sh`; from `websites/www.cs`: `make e2e E2E_ARGS="crete-play.spec.ts crete-layout.spec.ts crete-chapter.spec.ts"` — Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add websites/www.cs/games/crete websites/www.cs/tests/e2e websites/www.cs/sw.js websites/www.cs/play
git commit -m "feat(crete): found pages on the win card, the closing card and the Lore book"
```

---

### Task 8: Docs and the whole check

**Files:**
- Modify: `README.md` (Crete's), `metadata.yaml` if it says "eight trials", `src/ui/title.tsx` blurb if it still does; `docs/superpowers/specs/2026-10-16-crete-redesign-vision.md` only if something there no longer matches.

- [ ] **Step 1:** Rewrite the README's opening, the page/controls paragraph, the module list (`src/campaign/`, `pages.ts`, `follow.ts`), the cards paragraph (title → chapter card → level; levels list; Lore book; `crete-pages`), the keys table (N: level list), the test hook line and the browser-spec list (`crete-chapter`), as the game is now.
- [ ] **Step 2:** `grep -rn -i "eight trials\|trial list" websites/www.cs/games/crete websites/www.cs/play/crete websites/www.cs/tests/e2e` returns nothing that describes the current game wrongly.
- [ ] **Step 3:** From `websites/www.cs`: `make test` then `make e2e E2E_ARGS="crete-play.spec.ts crete-layout.spec.ts crete-chapter.spec.ts games-hub.spec.ts games-install.spec.ts games-pwa.spec.ts"` — Expected: all PASS.
- [ ] **Step 4: Commit**

```bash
git add -A websites/www.cs docs
git commit -m "docs(crete): Chapter 1 in the README"
```

The owner then plays levels 9 and 10 and reads every line of `src/campaign/chapter-1.ts` and the new intros before the PR merges.
