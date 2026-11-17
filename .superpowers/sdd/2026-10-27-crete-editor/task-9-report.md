# Task 9 report: Try it

Status: DONE. Commit `231905a` on `crete-editor` (parent `c719e3a`). Not pushed.

## What was implemented

- **`src/outside.ts` (new, DOM-free): `createOutside(campaign, deps)`.** It holds the outside level slot that used to live in `main.ts`. The slot sits at index `at = campaign.count` and keeps its level, `OutsideLevel`, line and text until the next `play`. It returns:
  - `levels`: the campaign plus the slot, with `id`, `level`, `scratch`, `outside`, `line` and the new `won` hook.
  - `play(level, about, line?, text?)`: what `main.ts`'s `playLevel` (the browser-spec hook) now calls.
  - `tryLevel(level, text, line)`: closes every layer (so the editor layer closes and the editor hides), then opens the level as kind `'try'`. The name is `level.title || 'Your level'` and the best is `null`. The game opens it, and the UI opens the start card.
  - `backToEditor()`: stops the game, then `ui.showEditor()`. That clears every card and opens the editor layer on the draft in progress, with the same history.
  I moved this out of `main.ts` so the wiring is unit-testable; `main.ts` cannot be imported from a test. The brief listed only `editor.ts` and `main.ts`, so this new file is a small departure from it.
- **`main.ts`:**
  - `tryLevel(level, text, line)` delegates to `outside.tryLevel`.
  - The editor's `tryIt` calls `tryLevel(level, text, null)`. Task 10 will pass the Check line in place of `null`.
  - `bindControls` now gets `backToEditor: outside.backToEditor`. Before this, it was not passed, so the buttons never showed on the page.
  - `__creteTest.editor` also exposes `bestFor`.
- **`editor.ts`:**
  - `tryIt` passes the share text, `toText(live, true)`, instead of `toText(live, false)`. That text is the key for the author's best, and the key Check will use.
  - The new `tryWon(text, moves)` keeps the lowest move count per text.
  - The new `bestFor(text): number | null` reads it, for Task 11's Share.
  - The map lives in the editor's closure for the page's life.

## The seam for the win

`Levels` gains an optional `won?(i, moves, assisted)`. In `game.ts`'s win branch:

- a scratch level now calls `deps.levels.won?.(trial, moves, assisted)`;
- a campaign level still calls `progress.record` and `pages.add`, unchanged.

The slot's `won` forwards to `deps.bestWon(text, moves)` (in `main.ts`, that is `editor.tryWon`) only when all of these hold:

- the level is the outside slot;
- its kind is `'try'`;
- it has a text;
- the run was not assisted.

Shared levels, browser-spec `playLevel` tries (no text) and hinted wins record nothing.

## Hash behaviour during a try

Try it leaves the address alone, so it stays `#edit` during the try.

- **Browser Back while a try plays:** `followHash` calls `ui.leaveEditor()`. That is a no-op, because the editor layer is not in the stack. The try keeps playing, nothing is half-open, and Back to the editor is still in the menu and on the end card.
- **Back to the editor after that:** shows the editor even though the address no longer says `#edit`. Q from there leaves the editor for the title card.
- **The hash returning to `#edit` (browser Forward):** opens the editor, as Back to the editor does.

A unit test covers this (`the browser leaving #edit during a try leaves the try playing`), and so did the live check.

## Tests

Every test name the brief asked for is in `test/editor-ui.test.ts`. They drive a real `createUi`, `createGame`, `createEditor` and `createOutside`, wired as in `main.ts`, through document keydowns and button clicks:

- `Try it opens the level on the game screen with its start card`. It checks:
  - the start card shows the "Your level" kicker and title;
  - the editor root is hidden;
  - the game is at `outside.at`;
  - the painted wall is in the level;
  - Enter begins the try and the arrow keys move.
- `a draft with a title is named by it, and its best is kept under its share text` (extra). It fails if `tryIt` passes `toText(d, false)`.
- `Back to the editor returns to the same draft and history`. It goes back from the menu while a T play-out runs and checks the play-out stopped. It also goes back from the end card. Both times the draft is the same object, and undo and redo still work.
- `an unassisted win records the author's best for that text`. It wins in 12 moves, then wins again more slowly after Retry: the best stays 12, and no progress is recorded.
- `a hinted win records none`.
- `an edit after a win forgets the best`. Undoing back to the won text brings the best back, because the key is the text.
- `P with no player-reachable problem opens Try it; the editor layer closes`. After that, Q closes the start card, and the next Q opens the menu, which shows `menu-editor`.
- `the browser leaving #edit during a try leaves the try playing` (extra).

`test/game.test.ts` has two extra tests:

- `a scratch win is handed to the levels, with its moves and whether it had help`;
- `a campaign win is not handed to the levels`.

**TDD.** RED: the `editor-ui` file failed on the missing `src/outside.ts` module, and the game test failed with `wins []` against the expected `[[0, 2, false]]` (2 failures). GREEN once implemented. The share-text test was checked by reverting `tryIt` to `toText(live, false)`: it failed (1 fail), then passed once restored.

**Counts:**

| Run | Result |
|---|---|
| `node --test crete/test/editor-ui.test.ts crete/test/ui.test.ts crete/test/game.test.ts` | 98 tests, 98 pass, 0 fail |
| `bash units.sh` | exit 0; 3420 tests, 3419 pass, 0 fail, 1 skipped |
| `sh crete/test.sh` | exit 0 |

`units.sh` ran before the last comment edits, which touched only comments in `main.ts` and the test header. The focused suites and `test.sh` were re-run after those edits.

## Browser checks

I used the setup from the earlier tasks: the site's `compose.yaml` under my own project, plus the label-off override, then `make e2e` with an explicit `E2E_BASE_URL`.

```
docker compose -p crete-editor-t9 -f compose.yaml -f <scratchpad>/label-off.yaml up -d --build www-cs-php www-cs-nginx
```

The site came up on port 36175.

- **`crete-play.spec.ts`:** `E2E_BASE_URL=http://127.0.0.1:36175/ make e2e E2E_ARGS="crete-play.spec.ts"` gave 15 passed, exit 0.
- **Live headless check:** a scratch Playwright script against system Chrome at 1200×800. Steps and results:
  1. Open the page and set `#edit`: the editor opens.
  2. Click the wall brush, then click cell (5,5): the cell becomes `#`.
  3. Press P:
     - the editor root is hidden;
     - the start card shows "Your level";
     - the hash stays `#edit`.
  4. Enter, then 9 × → and 9 × ↓: the end card shows "Your level", "18 moves", **Retry** and **Back to the editor**. I checked this in a screenshot.
  5. Click **Back to the editor**: the editor shows, the draft is identical (JSON-equal), and Undo is enabled.
  6. P → Enter → Q opens the menu with `#menu-editor`. Q closes it.
  7. `page.goBack()` gives:
     - hash `""`;
     - the editor still hidden;
     - no title card;
     - game trial 10 (the try plays on).
  8. Q → **Back to the editor**: the same draft.
  9. No page errors and no console errors.

The stack was then taken down with `compose ... down`. No containers are left.

## Files changed

- `websites/www.cs/games/crete/src/outside.ts` (new)
- `websites/www.cs/games/crete/src/main.ts`
- `websites/www.cs/games/crete/src/editor/editor.ts`
- `websites/www.cs/games/crete/src/game.ts`
- `websites/www.cs/games/crete/src/campaign/chapters.ts`
- `websites/www.cs/games/crete/test/editor-ui.test.ts`
- `websites/www.cs/games/crete/test/game.test.ts`
- Generated: `dist/main.js`, `dist/main.js.map`, `index.html`, `sw.js`

## Self-review

- `game.ts`'s campaign path is unchanged, and the scratch path still records no progress and finds no pages. The existing scratch test passes.
- `main.ts` needs `outside`'s deps before `game`, `ui` and `editor` exist. They are closures that run only after those are initialised, so there is no TDZ (temporal dead zone) error. The live check confirms it.
- `tryLevel` closes the layers before `game.open`. Otherwise the start card would open on top of a still-stacked editor layer.
- Comments describe the current state.

## Concerns

- **New file.** `src/outside.ts` was not in the brief's file list. I added it so `tryLevel` and `backToEditor` could be unit-tested instead of living untested in `main.ts`.
- **`tryIt`'s text changed.** It is now the share text (`toText(d, true)`), not the full text. Task 10 should compare Check's text, `toText(draft, true)`, against it.
- **Browser-spec tries keep no best.** A `'try'` opened through `__creteTest.playLevel` has no text, so it never records a best.
- **The hash is not restored.** After browser Back during a try, **Back to the editor** shows the editor while the address no longer says `#edit`. That is harmless, and Q leaves it normally.

## Fix round 1

Commit `3125f65` "Crete: Try it review fixes (Forward to #edit settles the try, leaving a try clears #edit)", on top of `231905a`.

1. **[Important] Forward to `#edit` during a try.** `followHash`'s `#edit` path now calls `outside.backToEditor()` instead of `ui.showEditor()`, so it is the same path as the button. On page load with no level, `backToEditor` is harmless, because `settle` is a no-op.
   - **The play-out was in fact already stopped.** `showEditor` opens a layer, and the layers' `onChange` runs `game.stop()` whenever any layer is open. I checked this by pointing the new test at `flow.showEditor()`: `playing` was false, and no moves were played after `m.advance(10_000)`.
   - **The thread did stay live under the editor.** That assertion failed until this fix.
2. **[Minor] Leaving a try by another route clears `#edit`.**
   - `ui.ts`'s `open(i)` (used by the levels list, the chapter card, Next and Retry) now calls `controls.leftEditor()` when level `i` is not an outside level. Retry of the try keeps the hash.
   - `main.ts`'s `quit()` calls `leftEditor()` too.
   - `leftEditor` was already the `replaceState` that takes `#edit` off, and its doc now says "the editor's visit ended".
3. **[Minor] `backToEditor` settles the game.** The new `Game.settle()` stops the play-out, calls `finishAnim()`, and takes the thread down (`threadOn = false`, `thread = null`, then `changed()`). The try's state is otherwise left as it stands. `OutsideDeps.stop` is renamed `settle`.

**Tests added** (`test/editor-ui.test.ts`):

- `the #edit path back into the editor settles a running try: no play-out, no animation, no thread`:
  - it turns on V, then T, and advances 1 s;
  - then it calls `outside.backToEditor()`, the path `followHash` takes;
  - it checks the editor is the top layer, and that `playing`, `anim` and `thread` are false, null and null;
  - after `m.advance(10_000)`, no further moves have been played.
- `a try left for a campaign level ends the editor's visit; Retry does not`: Retry gives 0 `leftEditor` calls; N, then level 2, gives 1.

RED: both failed before the fix (thread still drawn; 0 calls instead of 1). GREEN after.

Quit is in `main.ts` and cannot be reached from a unit test, so the live check covers it.

**Runs:**

| Run | Result |
|---|---|
| Focused (`editor-ui`, `ui`, `game`) | 100 tests, 100 pass, 0 fail |
| `bash units.sh` | exit 0; 3422 tests, 3421 pass, 0 fail, 1 skipped |
| `sh crete/test.sh` | exit 0 |
| `crete-play.spec.ts` | 15 passed |

I rebuilt and committed the generated files (`dist/main.js`, `dist/main.js.map`, `index.html`, `sw.js`).

**Live headless check.** Same compose setup (project `crete-editor-t9`, label-off override, port 37053), torn down afterwards with no containers left.

The round trip was re-run (paint, P, win, end card, Back to the editor, same draft, browser Back during a try). All results were as before, with no errors.

The new Back/Forward script gave:

| Step | Hash | Editor | Playing | Thread | Moves | Trial |
|---|---|---|---|---|---|---|
| Running (V, then T) | `#edit` | hidden | yes | yes | 1 | — |
| After browser Back | `""` | hidden | yes | yes | 2 | — |
| After browser Forward | `#edit` | shown | no | no | 2 | — |

After Forward, the move count stayed the same 1.5 s later.

- Quit from a try's menu: hash `""`.
- Try, then N, then level 2: hash `""`, trial 1.
- No page errors and no console errors.
