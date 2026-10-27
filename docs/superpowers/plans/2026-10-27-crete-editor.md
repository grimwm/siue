# Crete Level Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A level editor for Crete, on the game page. It lets an author build a level with every piece, try it, have the solver prove and rate it, and share it as a link. Opening the link plays the level in the normal game or edits a copy. The work also adds the two solver items the roadmap held over: Stop that cancels a search, and eviction for the result cache.

**Architecture:** The DOM-free core comes first, in three parts:
- the solver client's `cancel()`, cache eviction, and a `Difficulty` that carries its line;
- the link codec (`src/share/`);
- the editor's document model with undo (`src/editor/model.ts`).

Then the editor itself, a view on the game page (`games/crete/#edit`). First the game screen learns to play a level from outside the campaign. The editor view holds its canvas, the palette, Check, Share and the owner's campaign export. Try it opens the level on the full game screen, and **Back to the editor** returns. Last, the game page opens a `#L1.` link: a shared card, then play through the same screen with the link's proven line feeding the thread help.

**Tech Stack:** TypeScript 7 on `node --test`, Preact 11 (`.tsx` under `src/`), esbuild through `games/_kit/build/build.mjs`, `CompressionStream`/`DecompressionStream` (`deflate-raw`, in browsers and Node 22), and Playwright for the browser specs.

**Spec:** `docs/superpowers/specs/2026-10-21-crete-editor-design.md`, Part 2 and "Decisions settled after review". The solver it builds on is Part 1, and the pieces are `2026-10-21-crete-pieces-design.md`.

All paths are relative to `websites/www.cs/games/crete/` unless they start with `websites/` or `docs/`.

## Global Constraints

- **No server storage for levels; links only.** Nothing about a shared level is sent to the server: the level travels in the URL fragment.
- **No free text from players.** A share link never carries a title, intro or page id. A shared level's name is generated: `Level XXXX by ABC`.
- **Initials** are the kit's `validInitials` (`games/_kit/initials.ts`): three letters A–Z, uppercased, never a word in `blocked-initials.json`. A refusal reads `Pick three letters that are not a word on the blocked list.`
- **Only a proven level is shared.** That means solved, with a line that replays to a win, and `sharedProblems(d)` empty. Stopping a search means "not shareable yet", never "shared unproven".
- **The solver runs only when asked:** on Check, on Share when the level changed since the last check, and on opening a link (for the rating). Editing never starts a search.
- **The author's best** counts only a win in Try it with no thread help.
- **The level text** (`src/puzzle/level.ts`) is the source of truth. The link is a compressed, versioned encoding of it.
- Esc is never bound; Q is the kit's back key. Tests never bind ports 3000, 5173, 8000 or 8080.
- Docs and comments describe current state, never history.
- **After any change** under `src/`, `game.css`, `index.html` or `build.json`:
  - from `websites/www.cs/games`, run `node _kit/build/build.mjs crete`;
  - in `games/crete`, run `php tools/install-files.php`;
  - in `websites/www.cs`, run `php tools/site-versions.php && php tools/site-game-pages.php`.
  
  Commit the generated files with the source.
- **Tests.** Unit tests: from `websites/www.cs/games`, `node --test crete/test/<file>.test.ts`; all of them with `bash units.sh`; the type and build check with `sh crete/test.sh`. Agents run unit suites plus at most two browser specs; CI runs the rest. A new spec gets a weight in `websites/www.cs/tests/e2e/shard.ts` and a mapping in `select.ts`.

## Rulings made while planning

These are the spec's "left to the builder" choices, plus two departures from settled calls. The departures are flagged for the owner's review.

- **Link format.** The link is `<game page>#L1.<payload>`.
  - `L1` is the format version.
  - The payload is base64url (no padding) of `deflate-raw` of UTF-8 text with this shape:
    - `by: ABC`
    - `best: 54` (only when there is a best)
    - `line: <move letters>`
    - a blank line
    - the level text as `serialize` writes it, with an empty title and intro and no `pages:`.
  - Move letters are `cache.ts`'s `lineText`.
  - A version other than `L1` reads as "made by a newer version of the game".
- **Link limits.**
  - `ENCODED_MAX = 16_384` characters after `#L1.`. This is checked before decompressing.
  - `DECODED_MAX = 32_768` characters. This is enforced chunk by chunk while decompressing, which aborts past it.
  - `MAX_LINE = 20_000` moves.
  - Board sides are 3 to 64. The shape is checked on the raw grid lines before `parse` runs.
  - The worst case is a 64 × 64 board drawn at random from every legend character, plus a 20,000-move random line. A test pins it under `ENCODED_MAX`, which is well inside what browsers and chat apps open.
- **Rejecting a link.** Beyond the limits above, two checks refuse a link:
  - The `best` is an integer of at least the line's length; a smaller best is damaged.
  - The line must replay to a win on its last move; otherwise the link is damaged.
- **Generated name.** `levelCode(text)` takes the first 20 bits of SHA-256 of the link's level text. Those bits become 4 characters from `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`, five bits each, high bits first. The name is `Level ${code} by ${initials}`.
- **Cache eviction.**
  - After each put, the worker's disk store trims `crete-results/`.
  - An entry whose key carries another version goes first.
  - After that, the oldest by file `lastModified` go, down to `RESULT_LIMIT = 256` entries.
- **Cancel.** `SolverJob.cancel()` posts `{type:'cancel', id}`, drops the route at once and rejects `result` with `CancelledError`. The host treats `cancel` like a newer search arriving: the job ends and its node file closes. Stop and Keep searching stay the existing `stop()`/`resume()`.
- **Check runs one `measure`.** Share waits for that whole measure, including the catch-refusing search, which only feeds the rating. *Departure:* the spec says the catch-refusing search does not block Share. One search kind, one cache entry and one progress bar are much simpler. On every Chapter 1 level the catch-refusing search costs at most what the main solve costs. The owner accepted this departure.
- **`Difficulty.line`.** `measure` keeps the shortest winning line as move letters (`''` when unsolved), so Check produces the proof Share puts in the link without a second solve.
- **The editor is a view on the game page**, not a page of its own. *Departure, chosen by the owner:* the spec puts the editor on its own page, but the owner wants Try it on the full game screen, with its start card, status bar, strip, menu, thread help and end card. One page gives that without a second copy of the game's wiring.
  - `games/crete/#edit` opens the editor.
  - Its code lives in `src/editor/` and is bundled into `main.js`.
  - The editor is a layer (`editor`) over the game frame. While it is the top layer, keys go to the editor.
  - Try it opens the draft as an outside level. The menu and the end card offer **Back to the editor** (`menu-editor`, `end-editor`).
- **Editor keys** (never Esc):
  - U, Ctrl/⌘+Z: undo
  - Y, Ctrl/⌘+Y, Ctrl/⌘+Shift+Z: redo
  - P: Try it
  - C: Check
  - O: rotate the brush's direction
  - Q: close a dialog, else leave the editor for the title card (the draft is kept for this page's life)
- **The thread on a proven line.** `Levels` gains `line?(i): readonly Action[] | null`. While the try's actions so far are exactly a prefix of that line, the thread uses the rest of it rather than solving in the page. Otherwise it solves as today.
- **Outside levels record nothing.** A try or a shared level records no progress and no pages. The end card names the level and gives the author's best: `beat 54` before, and `You beat the author's 54.` or `The author's best is 54.` after.
- **Owner flag.** The kit pref `crete-owner` set to `on` shows the campaign fields:
  - id, title, intro;
  - the page brush, with a page id per page cell.
  
  It also shows **Copy for trials.ts**, which copies `{ id: '<id>', text: \`<serialize>\` },` with backticks and `${` escaped. This is not a security boundary.
- **Finding the editor.** The title card gains **Make a level** (`#title-editor`, key E), which opens the editor.

## Review Focus

1. **An edit while Check is running** must cancel that search; its late answer must never show as the new level's result (Task 10 test `an edit cancels the running check and its answer is dropped`).
2. **A link whose line wins only after a detour that loses a heart**, or one that wins before its last move, is damaged and must never show a board (Task 5 test `a line that wins early or never is damaged`).
3. **Undo back to the text that was last checked** shows that result as current again without a search (Task 10 test `undo to the checked text makes the result current`).
4. **A drag across 64 cells is one undo step**, and the 51st edit forgets only the oldest (Task 6 tests `a stroke is one edit` and `the 51st edit drops the first`).
5. **Opening a link on a level whose rating search is slow**: the card shows `rating…` and Play works at once with the thread help from the link's line (Task 12 test `play starts before the rating finishes`).

---

# Pull request 1: the core (`crete/editor-core`)

### Task 1: Stop that cancels a search

**Files:**
- Modify: `src/solver-client.ts`, `src/solver-host.ts`
- Test: `test/solver-client.test.ts`

**Interfaces:**
- Produces:
  - `export class CancelledError extends Error` (message `the search was cancelled`);
  - `SolverJob.cancel(): void`;
  - `ToHost` gains `{ type: 'cancel'; id: number }`.

- [ ] **Step 1: Write the failing tests** in `test/solver-client.test.ts`, using the in-process host the file already wires as a `WorkerLike`:
  - `cancel rejects the result with CancelledError at once`: start a `solve` on trial 10, call `job.cancel()`, then `await assert.rejects(job.result, CancelledError)`.
  - `a cancelled search reports no more progress`: count progress calls after `cancel()`; after the host's next pause, the count is unchanged.
  - `cancel closes the node file`: in the host test, an `openFile` stub's `close` has been called once after `cancel`.
  - `a search started after a cancel runs`: cancel one, start another, and its result resolves solved.
- [ ] **Step 2:** Run `node --test crete/test/solver-client.test.ts`. Expect FAIL: `cancel` is not a function.
- [ ] **Step 3: Implement.**
  - Client: `cancel()` deletes the id from its worker's route map, posts `cancel`, and rejects through the pending promise's reject (keep a reference to it). `failedJob` gets a no-op `cancel`.
  - Host: `cancel` for the current id sets `cancelled` and wakes the job, exactly as a newer `start` does.
  - Update the client's header comment: a search ends by `cancel` or by a newer search.
- [ ] **Step 4:** Run the file again. Expect PASS. Then run `bash units.sh`.
- [ ] **Step 5: Commit** `Crete: a search can be cancelled`.

### Task 2: Cache eviction

**Files:**
- Modify: `src/puzzle/cache.ts`, `src/solver-worker.ts`, `src/solver-host.ts`
- Test: `test/cache.test.ts`, `test/solver-client.test.ts`

**Interfaces:**
- Produces:
  - `export const RESULT_LIMIT = 256`;
  - `export function evictions(entries: readonly { key: string; modified: number }[], version: string | null, limit = RESULT_LIMIT): string[]`, which returns the keys to remove;
  - `ResultStore` gains optional `trim?(): Promise<void>`, which `safeResults` wraps so it never throws.

- [ ] **Step 1: Write the failing tests** in `test/cache.test.ts`:
  - `evictions removes other versions first`: given keys `solve-aaaa-<sha>` and `solve-bbbb-<sha>` with version `aaaa`, it returns the `bbbb` key even under the limit.
  - `evictions keeps the newest RESULT_LIMIT`: given 300 current-version entries with `modified` 0…299, it returns the 44 keys with `modified` 0…43.
  - `a key with no version counts as another version`: given version `aaaa`, the key `measure-<sha>` (no version part) is removed.
  - `safeResults trim swallows a throwing trim`.
  - In `test/solver-client.test.ts`: `the host trims after it caches a result`, where a store stub's `trim` is called once after a finished solve.
- [ ] **Step 2:** Run them. Expect FAIL.
- [ ] **Step 3: Implement.**
  - `evictions` parses the version as the second `-` field when there are three, sorts the rest by `modified` descending, and keeps `limit`.
  - The worker's `diskResults.trim` lists `crete-results/`, reads `getFile().lastModified` for each, and removes `evictions(…)` with `removeEntry`. It is serialized: one trim at a time, and a trim asked for while one runs is skipped.
  - The host calls `results.trim?.()` after a put and does not await it into the answer.
- [ ] **Step 4:** Run the two files, then `bash units.sh`. Expect PASS.
- [ ] **Step 5: Commit** `Crete: the result cache keeps its newest 256 entries`.

### Task 3: The line in a measure, and what makes a level hard

**Files:**
- Modify: `src/puzzle/difficulty.ts`, `src/solver-host.ts` (its measure cache check)
- Test: `test/difficulty.test.ts`

**Interfaces:**
- Produces:
  - `Difficulty.line: string`: the shortest line as `lineText`, `''` when not solved;
  - `export function hardPieces(level: Level): string[]`.

- [ ] **Step 1: Write the failing tests:**
  - `measure keeps the shortest line`: for trials 1, 9 and 10, `lineOf(measure(lv).line)` replays from `initial(lv)` to a win, and its length equals `d.shortest`.
  - `an unsolved measure has an empty line`.
  - `hardPieces names the pieces by how many there are`. On a level with 3 blocks, 1 block machine, 2 keys, 2 doors and 1 Harpy, it returns `['4 blocks', '2 keys and 2 doors', '1 hazard']`.
  - `hardPieces skips what the level does not have`: a plain level gives `[]`.
- [ ] **Step 2:** Run `node --test crete/test/difficulty.test.ts`. Expect FAIL.
- [ ] **Step 3: Implement.**
  - `measuring` sets `line: r.solved ? lineText(r.line) : ''`. Import `lineText` from `cache.ts`; if that makes an import cycle, move `lineText` and `lineOf` into a new `src/puzzle/line.ts` and re-export them from `cache.ts`.
  - The host's `fromCache` for `measure` rejects a cached difficulty with no string `line`, so results cached before this change are searched again.
  - `hardPieces` returns these entries, largest first, then in this order on ties:
    - blocks (objects `block` plus block-template machines);
    - keys and doors, together, counted as keys `+` doors;
    - toggle walls (`toggle-open` and `toggle-closed`);
    - hazards (level hazards plus hazard-template machines);
    - clone machines that are not counted above;
    - buttons (brown, red, toggle).
    
    Each entry is singular when its count is 1.
- [ ] **Step 4:** Run the file, then `bash units.sh`. Every Chapter 1 difficulty pin stays the same apart from the new field. Expect PASS.
- [ ] **Step 5: Commit** `Crete: a measure keeps its line; hardPieces`.

### Task 4: The link codec

**Files:**
- Create: `src/share/link.ts`, `src/share/name.ts`
- Test: `test/share-link.test.ts`

**Interfaces:**
- Produces from `link.ts`:
  - `export const LINK_VERSION = 'L1', ENCODED_MAX = 16_384, DECODED_MAX = 32_768, MAX_LINE = 20_000`;
  - `export interface Shared { text: string; level: Level; line: Action[]; initials: string; best: number | null }`;
  - `export async function encodeLink(s: { text: string; line: readonly Action[]; initials: string; best: number | null }): Promise<string>`, which returns the fragment without `#`;
  - `export type LinkError = 'damaged' | 'too-long' | 'too-large' | 'newer' | 'not-a-link'`;
  - `export async function decodeLink(fragment: string): Promise<{ ok: true; shared: Shared } | { ok: false; error: LinkError }>`;
  - `export const LINK_MESSAGES: Record<LinkError, string>`.
- Produces from `name.ts`:
  - `export async function levelCode(text: string): Promise<string>`;
  - `export function sharedName(code: string, initials: string): string`.

- [ ] **Step 1: Write the failing tests:**
  - `round trip keeps every piece`: build one level text holding every terrain, object, hazard (each facing), every machine template, `P` and `M`, with `hearts: 5` and `relics: 1`; use a hand-written short line, so do not check that it wins here. Decoding the encoding gives the same `text`, `line`, `initials` and `best`.
  - `round trip at 64 × 64`.
  - `the worst case fits`: a seeded random 64 × 64 grid of every legend character with one `P`, plus a seeded random 20,000-letter line, encodes to at most `ENCODED_MAX` characters.
  - `a fragment over ENCODED_MAX is too-long before decompressing`: pass `'L1.' + 'A'.repeat(ENCODED_MAX + 1)` and assert that `DecompressionStream` is never constructed, by spying on `globalThis.DecompressionStream`.
  - `a decompression bomb is too-large`: deflate 1 MB of `#`, which still encodes under `ENCODED_MAX`, gives `too-large`.
  - `L2 is newer; garbage, bad base64 and a truncated stream are damaged`.
  - `a link with a title, intro or pages is damaged`.
  - `a board side outside 3..64 is damaged`.
  - `a best below the line's length is damaged`.
  - `levelCode is stable`: pin the code of trial 1's text with its title and intro emptied to the literal it returns. Write the literal from the first run and check that it is 4 characters from the alphabet.
  - `sharedName('K7QX', 'WGR')` is `Level K7QX by WGR`.
- [ ] **Step 2:** Run `node --test crete/test/share-link.test.ts`. Expect FAIL.
- [ ] **Step 3: Implement** with `CompressionStream('deflate-raw')`. Decode in this order:
  1. version;
  2. length;
  3. base64url;
  4. streamed decompress with the running count;
  5. the payload's header lines;
  6. the raw grid shape;
  7. `parse` (a `LevelError` is damaged);
  8. the no-free-text checks;
  9. `lineOf`;
  10. `best`.
  
  `link.ts` does not replay the line: Task 5 does, because replaying needs the engine. `LINK_MESSAGES`:
  - damaged: `This level link is damaged. Ask for the link again.`
  - too-long, too-large: `This level link is too long to open.`
  - newer: `This level was made by a newer version of the game. Reload the page and try again.`
  - not-a-link: `This is not a level link.`
- [ ] **Step 4:** Run the file. Expect PASS.
- [ ] **Step 5: Commit** `Crete: share links carry a level, its proof and its author`.

### Task 5: Opening a link proves it

**Files:**
- Create: `src/share/open.ts`
- Test: `test/share-link.test.ts`

**Interfaces:**
- Consumes: `decodeLink`, `Shared`, `LinkError` (Task 4).
- Produces: `export async function openLink(fragment: string): Promise<{ ok: true; shared: Shared; name: string } | { ok: false; error: LinkError }>`. It decodes the link, then replays `shared.line` from `initial(level)`.

- [ ] **Step 1: Write the failing tests:**
  - `a real link opens`: encode trial 9 with its title, intro and pages cleared (`p` cells become `.`) and its solver line, then open it.
  - `a line that wins early or never is damaged`: one line with an extra move after the win, and one with its last move removed.
  - `a line that loses before the end is damaged`.
- [ ] **Step 2:** Run. Expect FAIL.
- [ ] **Step 3: Implement.** Replay with `step`. The line must be `playing` before every move and `won` after the last.
- [ ] **Step 4:** Run. Expect PASS.
- [ ] **Step 5: Commit** `Crete: a link's line must win`.

### Task 6: The editor's document and its undo

**Files:**
- Create: `src/editor/model.ts`, `src/editor/history.ts`
- Test: `test/editor-model.test.ts`

**Interfaces:**
- Produces from `model.ts`:
  ```ts
  export type Brush =
    | { kind: 'terrain'; t: Terrain } | { kind: 'object'; o: ObjectKind }
    | { kind: 'player' } | { kind: 'minotaur' } | { kind: 'erase' }
    | { kind: 'hazard'; h: HazardKind; dir: Dir }
    | { kind: 'machine'; template: Template; dir: Dir }
    | { kind: 'page'; id: string };             // owner only
  export interface Draft {
    readonly rows: number; readonly cols: number;
    /** One legend character per cell, row-major. */
    readonly cells: readonly string[];
    /** Per cell: a hazard's facing, a machine's `<template>-<dir>`, a page's id; else null. */
    readonly extra: readonly (string | null)[];
    readonly hearts: number;
    /** null: every relic on the board. */
    readonly relics: number | null;
    readonly id: string; readonly title: string; readonly intro: string;   // owner only
  }
  export const MIN_SIDE = 3, MAX_SIDE = 64;
  export function newDraft(rows: number, cols: number): Draft;  // wall border, P at (1,1), E at (rows-2, cols-2)
  export function paint(d: Draft, at: Cell, b: Brush): Draft;   // returns d itself when nothing changes
  export function resize(d: Draft, rows: number, cols: number): Draft;
  export function toText(d: Draft, forShare: boolean): string;  // forShare: no title, intro, pages (p → .)
  export function fromLevel(lv: Level): Draft;
  export function toLevel(d: Draft): Level;                      // parse(toText(d, false))
  ```
- Produces from `history.ts`:
  ```ts
  export const UNDO_LIMIT = 50;
  export interface History<T> { readonly now: T; readonly canUndo: boolean; readonly canRedo: boolean }
  export function startHistory<T>(t: T): History<T>;
  export function commit<T>(h: History<T>, t: T): History<T>;   // same object as now: h unchanged
  export function undoH<T>(h: History<T>): History<T>;
  export function redoH<T>(h: History<T>): History<T>;
  ```

- [ ] **Step 1: Write the failing tests:**
  - `a draft always parses`: paint every brush on every cell of a 5 × 5 draft in turn, and `toLevel` never throws.
  - `painting the player moves him`.
  - `erase on the player does nothing`.
  - `painting over a hazard or machine clears its extra`.
  - `toText for sharing drops title, intro and pages`.
  - `fromLevel(parse(text)) round-trips every trial`: run `toText(…, false)` on the result and `parse` it again; `serialize` of the two is equal.
  - `resize keeps the top-left`: new cells are floor, and a player cut off is put back at (0,0)'s nearest floor in reading order.
  - `resize clamps to 3..64`.
  - History: `a stroke is one edit`. The page commits once per stroke; the test commits the final draft of a 64-cell drag once and undoes it to the start in one step.
  - `the 51st edit drops the first`.
  - `redo after a new edit is gone`.
- [ ] **Step 2:** Run `node --test crete/test/editor-model.test.ts`. Expect FAIL.
- [ ] **Step 3: Implement.** The draft has exactly one `P` by construction; the Minotaur is optional.
  - Relics set above the count on the grid are clamped by `toText`.
  - The relics header is written only when `relics !== null`.
  - Facing and machine headers are written in reading order from `extra`.
- [ ] **Step 4:** Run. Expect PASS.
- [ ] **Step 5: Commit** `Crete: the editor's level document and undo`.

---

# Pull request 2: the editor (`crete/editor-page`)

### Task 7: The game screen plays a level that is not the campaign's

**Files:**
- Modify:
  - `src/campaign/chapters.ts`: the `Levels` type;
  - `src/game.ts`: the thread on a known line;
  - `src/ui.ts`: the start card, end card and menu for a level outside the campaign;
  - `src/ui/menu.tsx`, `src/ui/end.tsx`, `src/ui/start.tsx`;
  - `src/main.ts`: `playLevel` takes the new fields.
- Test: `test/game.test.ts`, `test/ui.test.ts`

**Interfaces:**
- Produces:
  ```ts
  /** A level from outside the campaign: one the author is trying in the editor, or one a link shared. */
  export interface OutsideLevel {
    kind: 'try' | 'shared';
    /** What the start and end cards call it: the draft's title or "Your level" for 'try', the generated name for 'shared'. */
    name: string;
    /** The author's best, for 'shared'; null otherwise or when there is none. */
    best: number | null;
  }
  // in Levels:
  outside?(i: number): OutsideLevel | null;
  /** A proven winning line from the level's start, or null. */
  line?(i: number): readonly Action[] | null;
  ```
  - `MenuProps` and `EndCardProps` gain `onBackToEditor?: () => void`, shown as **Back to the editor** (ids `menu-editor` and `end-editor`) only when it is given.
  - `Controls` gains `backToEditor?(): void`.

- [ ] **Step 1: Write the failing tests.**
  - In `game.test.ts`:
    - `the thread follows a known line while the try is on it`. Give `Levels.line` trial 9's solver line and wrap `solve` with a call counter. Hint three times: `solve` is never called. Then press a move off the line, and the next hint solves.
    - `undo back onto the line uses it again`.
  - In `ui.test.ts`, for an `outside` level:
    - `the start and end cards name an outside level`.
    - `a shared win says whether it beat the author`: `You beat the author's 54.` or `The author's best is 54.`.
    - `an outside level offers no next level and no levels list`.
    - `an outside win records no progress`.
    - `Back to the editor shows in the menu and on the end card only for a try`, and it calls `backToEditor`.
    - A campaign level's cards are unchanged; the existing tests stay green.
- [ ] **Step 2:** Run. Expect FAIL.
- [ ] **Step 3: Implement.**
  - The game keeps `played: Action[]`: a move pushes, undo pops, and restart and open clear it. `line()` returns `known.slice(played.length)` while `played` is a prefix of `known`.
  - `ui.ts` reads `levels.outside?.(g.trial)` wherever it now reads `LEVEL_IDS`, `chapterOf` or `CHAPTERS` for the level in play. An outside level has:
    - kicker `Your level` for a try or `Shared level` for a shared one;
    - `hasNext` false;
    - no chapter card;
    - no pages line.
  - An outside level is scratch: `levels.scratch` is true for it.
- [ ] **Step 4:** Run, then `bash units.sh`. Expect PASS.
- [ ] **Step 5: Commit** `Crete: the game screen plays a level from outside the campaign`.

### Task 8: The editor view, the board and the palette

**Files:**
- Create:
  - `src/editor/editor.ts`: the view, which holds the canvas, painting, fitting and the keys;
  - `src/editor/palette.tsx`;
  - `src/editor/keys.ts`.
- Modify:
  - `index.html`: `#editor-root`, holding its own canvas `#editor-stage`;
  - `src/layers.ts`: an `editor` layer;
  - `src/ui.ts`: while `editor` is the top layer, every key goes to the editor's handler;
  - `src/main.ts`: `#edit` opens the editor, at start and on `hashchange`;
  - `src/ui/title.tsx` and `src/keys.ts`: **Make a level** (`#title-editor`, key E), which opens the editor;
  - `game.css`.
- Test: `test/editor-ui.test.ts` (the DOM stub, as in `test/ui.test.ts`), `test/keys.test.ts`, `test/ui.test.ts`

**Interfaces:**
- Consumes: `Draft`, `Brush`, `paint`, `History` (Task 6); `drawList`, `Atlas` (`board-plan.ts`); `createBoard`; `cellFor`.
- Produces:
  - `export const EDITOR_KEYS: Record<EditorAction, KeyDef>` in `src/editor/keys.ts`, where `EditorAction` is `'undo' | 'redo' | 'try' | 'check' | 'rotate'`;
  - `export interface PaletteProps { brush: Brush; owner: boolean; onPick(b: Brush): void; onRotate(): void }`;
  - `export interface Editor { open(draft?: Draft): void; close(): void; readonly draft: Draft; key(ev: KeyboardEvent): boolean }`;
  - `export function createEditor(deps: { root: HTMLElement; atlas: Atlas; image: HTMLImageElement; tryIt(level: Level, text: string): void; changed(): void }): Editor`;
  - `window.__creteTest.editor`: the `Editor`, plus `load(text: string): void`, extended by later tasks.

- [ ] **Step 1: Write the failing tests.**
  - The palette lists one button per brush, with ids `brush-<terrain|object|hazard|machine…>`. The hazard and machine buttons show their direction, and `O` rotates the brush.
  - `the page brush only with the owner flag`.
  - `EDITOR_KEYS never binds escape`.
  - `Make a level on the title card opens the editor layer`.
  - `game keys do nothing while the editor is open`: an arrow key moves no figure.
  - `Q in the editor closes it to the title card`.
- [ ] **Step 2:** Run. Expect FAIL.
- [ ] **Step 3: Implement.**
  - The board draws `drawList(initial(toLevel(draft)), restingFigures, atlas, now)` on `#editor-stage`. The list is recomputed only when the draft changes.
  - Mouse down paints, a drag paints every cell it crosses, and mouse up commits one history entry. Touch does the same with one finger.
  - A size bar holds rows and cols number inputs (3–64) and Resize.
  - Hearts (1–99) and relics needed ("all", or 0..count).
  - At widths under 700 px the palette is a drawer, opened by a **Pieces** button.
  - A big board scrolls as in `ui.ts`'s fit.
  - Opening with no draft starts `newDraft(12, 12)`, or the draft in progress when the editor was left by Try it or Q.
- [ ] **Step 4:** Run the unit tests, then `sh crete/test.sh`. Expect PASS.
- [ ] **Step 5: Commit** `Crete: the level editor`.

### Task 9: Try it

**Files:**
- Modify: `src/editor/editor.ts`, `src/main.ts`
- Test: `test/editor-ui.test.ts`

**Interfaces:**
- Consumes: `Levels.outside`, `Levels.line`, `backToEditor` (Task 7); `Editor` (Task 8).
- Produces: `main.ts`'s `tryLevel(level: Level, text: string, line: readonly Action[] | null): void`. It opens the level as an outside level of kind `'try'`, with the line from the last Check when that check is for this exact text.

- [ ] **Step 1: Write the failing tests:**
  - `Try it opens the level on the game screen with its start card`.
  - `Back to the editor returns to the same draft and history`.
  - `an unassisted win records the author's best for that text`.
  - `a hinted win records none`.
  - `an edit after a win forgets the best`, because the best is keyed by `toText(d, true)`.
  - `P with no player-reachable problem opens Try it; the editor layer closes`.
- [ ] **Step 2:** Run. Expect FAIL.
- [ ] **Step 3: Implement.** P and the **Try it** button call `tryIt`.
  - `main.ts` closes the editor layer and opens the level through the queued scratch path with `outside` and `line` set.
  - `backToEditor` stops the game and reopens the editor layer on its draft.
  - The game's `progress`-recording win hook is replaced, for a try, by the editor's best map: an unassisted won run's `moves`.
- [ ] **Step 4:** Run, then `bash units.sh`. Expect PASS.
- [ ] **Step 5: Commit** `Crete: Try it plays the level on the game screen`.

### Task 10: Check

**Files:**
- Create: `src/editor/check.ts` (DOM-free state), `src/editor/check-panel.tsx`
- Modify: `src/editor/editor.ts`
- Test: `test/editor-check.test.ts`

**Interfaces:**
- Consumes: `startSearch`, `SolverJob.cancel` (Task 1); `Difficulty.line`, `hardPieces`, `sharedProblems` (Task 3).
- Produces:
  ```ts
  export type CheckState =
    | { kind: 'none' }
    | { kind: 'running'; text: string; report: Report | null; stopped: boolean }
    | { kind: 'done'; text: string; d: Difficulty }
    | { kind: 'failed'; text: string; message: string };
  export interface Checker { readonly state: CheckState; check(text: string): Promise<Difficulty | null>; stop(): void; keepSearching(): void; edited(text: string): void }
  export function createChecker(start: (text: string) => SolverJob, changed: () => void): Checker;
  export function checkLines(s: CheckState, current: string, level: Level): { lines: string[]; stale: boolean; shareable: boolean };
  ```
  `check` resolves `null` when cancelled.

- [ ] **Step 1: Write the failing tests**, with a fake `start` whose job resolves on demand:
  - `an edit cancels the running check and its answer is dropped`.
  - `undo to the checked text makes the result current`.
  - `stop pauses; keep searching resumes`.
  - `a second check of the same text while done reuses the result`.
  - `checkLines` for the following:
    - a winnable chase level, with lines `Winnable: quickest win 54 moves`, `Situations searched: 24,086`, `Chase: the Minotaur adds 22 moves; ignoring him loses` and `Shareable`;
    - a solo level;
    - an unwinnable one: `This level cannot be won.`;
    - a capped one: `The solver could not finish. What makes it hard here: 4 blocks, 1 hazard. Fewer blocks help most.`, with the last sentence only when blocks lead;
    - a winnable but easy one: `Not shareable yet:` followed by `sharedProblems` lines.
- [ ] **Step 2:** Run. Expect FAIL.
- [ ] **Step 3: Implement.**
  - The panel shows the progress bar while running: an indeterminate bar, plus `Searched N situations · trying lines of at least M moves`, where N is `report.stored` and M is `report.bestF`. When `storage` is `memory` it adds `(in memory only)`.
  - The panel has **Stop** and **Keep searching** buttons.
  - The `C` key and the **Check** button call `check(toText(draft, true))`. Every committed edit calls `edited`.
  - A stale result shows greyed with `Out of date: press Check.`
- [ ] **Step 4:** Run. Expect PASS.
- [ ] **Step 5: Commit** `Crete: Check proves and rates a level in the editor`.

### Task 11: Share and the owner's export

**Files:**
- Create: `src/editor/share-panel.tsx`
- Modify: `src/editor/editor.ts`, `src/editor/check.ts`
- Test: `test/editor-share.test.ts`

**Interfaces:**
- Consumes: `encodeLink`, `MAX_LINE` (Task 4); `levelCode`, `sharedName`; `validInitials`; the checker (Task 10); the author's best map (Task 9).
- Produces:
  - `export async function shareLink(base: string, draftText: string, d: Difficulty, initials: string, best: number | null): Promise<{ ok: true; url: string; name: string } | { ok: false; message: string }>`;
  - `export function trialsEntry(d: Draft): string`.

- [ ] **Step 1: Write the failing tests:**
  - `share refuses until the level is shareable`, giving the `sharedProblems` text.
  - `share refuses blocked or malformed initials`, giving the Global Constraints message.
  - `share refuses a line over MAX_LINE`: `This level's quickest win is too long to share.`
  - `share builds a link that openLink opens`, with the same text, line, initials and best.
  - `share runs Check first when the level changed`. This one uses the editor wiring with a fake checker.
  - `trialsEntry escapes backticks and ${`.
  - `the owner fields only with crete-owner on`.
- [ ] **Step 2:** Run. Expect FAIL.
- [ ] **Step 3: Implement.**
  - The panel holds an initials input remembered in the kit pref `crete-initials`, and **Share**.
  - On success it shows a read-only link field, the name, and **Copy**. Copy uses `navigator.clipboard.writeText`; when that fails it selects the field and says `Press Ctrl+C to copy.`
  - The link's base is the page's own URL without its hash.
  - With the owner flag, the panel also shows the id, title and intro inputs and **Copy for trials.ts**.
- [ ] **Step 4:** Run. Expect PASS.
- [ ] **Step 5: Commit** `Crete: Share makes a link; the owner copies a campaign level`.

---

# Pull request 3: playing a shared level (`crete/editor-links`)

### Task 12: The game page opens a link

**Files:**
- Create: `src/ui/shared.tsx`
- Modify:
  - `src/main.ts`: read `location.hash` at start and on `hashchange`;
  - `src/ui.ts`;
  - `src/layers.ts`: a `shared` layer;
  - `index.html`: `#shared-root`.
- Test: `test/ui.test.ts`, `test/shared.test.ts`

**Interfaces:**
- Consumes:
  - `openLink`, `LINK_MESSAGES` (Task 5);
  - `startSearch(text, 'measure')`;
  - `Levels.outside` and `Levels.line` (Task 7);
  - `Editor.open` (Task 8);
  - `fromLevel` (Task 6).
- Produces:
  - `export interface SharedCardProps { name: string; rating: string | null; best: number | null; onPlay(): void; onEdit(): void }`;
  - `export function ratingText(d: Difficulty): string`.

- [ ] **Step 1: Write the failing tests:**
  - The shared card shows the name, `rating…` while `rating` is null, `beat 54` when there is a best, and the buttons `#shared-play` and `#shared-edit`.
  - `ratingText` gives `Chase · quickest win 54 moves · 24,086 situations` and `Solo · …`.
  - A bad link shows its `LINK_MESSAGES` text in the toast and the title card, never a board.
  - `play starts before the rating finishes`. With a rating job that never resolves, `#shared-play` opens the level as an outside level of kind `'shared'`, and a hint uses the link's line without solving.
  - **Edit a copy** opens the editor on `fromLevel(shared.level)`, with no initials or best carried over.
- [ ] **Step 2:** Run. Expect FAIL.
- [ ] **Step 3: Implement.**
  - The rating search keeps running in the worker during play, and the shared card shows its result the next time it opens.
  - Opening another link, or the page going away, cancels the rating search.
  - The shared card's Q goes to the title card.
- [ ] **Step 4:** Run, then `bash units.sh`. Expect PASS.
- [ ] **Step 5: Commit** `Crete: a shared link opens on the game page`.

### Task 13: Browser specs and docs

**Files:**
- Create: `websites/www.cs/tests/e2e/crete-editor.spec.ts`
- Modify:
  - `websites/www.cs/tests/e2e/shard.ts`: weight `'crete-editor.spec.ts': 12`;
  - `select.ts`;
  - `README.md`: a section "The editor", covering the view, the keys, the link format and limits, the generated name, the owner flag and the test hook; add the editor's files to the README's file map;
  - `docs/superpowers/roadmap.md`: step 2 is live, and the next step is Chapter 2 built in the editor.

- [ ] **Step 1: Write the spec.**
  - `builds a small level and tries it`, at desktop size:
    1. Open `games/crete/#edit`, pick a brush and paint a few cells.
    2. Press Try it, close the start card, and win with the arrow keys.
    3. Press **Back to the editor** on the end card, and confirm the draft is unchanged.
  - `shares a level and wins it on a phone`:
    1. Call `__creteTest.editor.load(<trial 9 cleared of title, intro and pages>)`.
    2. Enter initials `WGR` and press **Share**. Wait for the link field and read the link.
    3. Open the link in a 390 × 844 context. The card shows `Level ` + the code + ` by WGR`.
    4. Press **Play**, press the link's line through the page's keys, and the end card shows a win.
  - `a damaged link shows a message, never a board`.
- [ ] **Step 2:** Run `make e2e E2E_ARGS="crete-editor.spec.ts"` from `websites/www.cs`. Expect PASS. Run `crete-play.spec.ts` once as the second spec.
- [ ] **Step 3: Docs.** Write the README and roadmap changes, describing the current state only.
- [ ] **Step 4:** Run `bash units.sh` and `sh crete/test.sh`. Expect PASS.
- [ ] **Step 5: Commit** `Crete: browser specs and docs for the editor`.
