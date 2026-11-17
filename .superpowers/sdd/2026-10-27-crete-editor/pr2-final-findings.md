# PR 2 whole-branch review — findings to fix (one fix wave)

Branch crete-editor, range 60ef647..ec22271 (Tasks 7–11 plus the kit dom-stub fix). Paths relative to
websites/www.cs/games/crete/ unless they start with `_kit/` (then relative to websites/www.cs/games/).
editor-check, editor-share and editor-ui unit tests: 68 pass at ec22271.

How the tasks fit: editor → Try (outside.ts slot, `Levels.outside/line/won`) → Back to the editor, the Check line
handed to Try only for the very text, Share reusing a running or finished Check, the hash routes (`#edit` in,
replaceState out) and the editor layer taking every key all line up. Within PR 2 only the checker starts worker
searches, and it runs one at a time (a new text cancels the old), so no two searches compete. No Important code
defect found; the one Important item is the README.

## Important

1. **README describes the page before PR 2.** Current-state rule; PR 2 deploys on merge. The full "The editor"
   section waits for Task 13, but these lines are now false or incomplete:
   - README.md:18: "`src/editor/` (DOM-free): `model` … and `history`". `src/editor/` now also holds `editor.ts`,
     `bar.tsx`, `palette.tsx`, `check-panel.tsx` and `share-panel.tsx`, which need the DOM, plus the DOM-free
     `check.ts` and `keys.ts`. `src/outside.ts` is not listed.
     Fix: say which files are DOM-free and give each new file a one-line role. Add `src/outside.ts` (the level from
     outside the campaign: a try's slot after the campaign's levels).
   - README.md:12 and :191: the `window.__creteTest` lists. :191 lacks `playLevel`, `parse` and `editor`; :12 lacks
     `editor`. Fix: list them. `playLevel(level, { outside?, line? })` opens a level outside the campaign (a try by
     default). `editor` is the Editor plus `load(text)`.
   - README.md:155 (the cards paragraph) needs four additions:
     - The layers list gains the editor.
     - On the title card, Make a level (E) opens the editor.
     - The menu gains Back to the editor, shown during a try.
     - The ending card of a level from outside the campaign has a different kicker and no Next or Levels. A shared
       level's card adds the author's-best line.
   - README.md:5 key summary and the key table at :158-171: add E (Make a level, title card only). Note that while
     the editor is the top layer every key goes to it: U/Y undo and redo, P Try it, C Check, O turn the brush, and Q
     leaves.

## Fix now (minor, cheap)

2. **Strip Share disabled while a search is stopped** (Task 11 re-review deferred). src/editor/check-panel.tsx:50
   uses `disabled={s.kind === 'running'}`, so after Stop the strip's Share stays disabled. That contradicts
   STOPPED_MESSAGE's "press Share again".
   Fix: `disabled={s.kind === 'running' && !s.stopped}`. Add a test: Stop from the strip, and `check-strip-share`
   is enabled; pressing it resumes the same search (`searches.length` stays 1).
3. **Stale "press Share again" after Keep searching** (Task 11 re-review deferred). src/editor/editor.ts:155 and
   :316-323: once Keep searching resumes the search, `shared.message` still reads STOPPED_MESSAGE. It stays after
   the search finishes, too.
   Fix: in the checker's change callback, clear `shared` when its message is STOPPED_MESSAGE and the checker is no
   longer a stopped run of that text (running and not stopped, or done). Add a test: Share, Stop, Keep searching,
   answer, and `share-message` is gone.
4. **`later()` never fails** (Task 11 re-review deferred). test/editor-share.test.ts:47-50: on timeout it returns
   silently. "Stop during a Share…" (:204, ends on `await later(...)`) and "Share while a Check … reuses that
   search" (:221) therefore pass even if no link ever appears.
   Fix: throw `new Error('timed out waiting')` when `done()` is still false at the deadline.
5. **Three copies of the fake solver job and the window stub** (Task 10 deferred; now three files):
   - the fake `start`: test/editor-check.test.ts:14-38, test/editor-share.test.ts:139-160 and
     test/editor-ui.test.ts:125-150;
   - the `window` + `localStorage` + `getComputedStyle` stub: editor-share.test.ts:25-32 and editor-ui.test.ts:32-39;
   - REPORT and ANSWER/DIFF: editor-check.test.ts:40, editor-ui.test.ts:598.

   The copies have also drifted. In editor-share and editor-ui the fake's `cancel()` never rejects `result`, while
   the real client rejects with CancelledError, so in those files a Share whose Check an edit cancels would hang.
   Fix: add test/editor-fakes.ts holding:
   - `fakeSearches()`, whose `cancel` rejects like the client;
   - `installEditorWindow(stored)`;
   - `REPORT` and `ANSWER`;
   - `makeEditor(opts)`.

   Use it in the three files. Then add the test the old fake could not support: during a Share waiting on its
   Check, an edit makes `share-run` enabled again with no link.
6. **No test shows that Check's line reaches the try's thread.** test/editor-ui.test.ts:394 wires
   `tryIt: (level, text) => outside.tryLevel(level, text, null)`, which drops the line. The chain Check →
   `tryIt(…, line)` → `outside` → `Levels.line` → thread is proven only in pieces.
   Fix: wire `(level, text, line) => outside.tryLevel(level, text, line)` and give `tryEditor` a fake `start`.
   Add a test: Check a draft, answer with `measure(parse(text))`, press P, and
   `outside.levels.line(outside.at)` deep-equals `lineOf(answer.line)`. Then press Enter and H, and the move played
   is that line's first.
7. **No test for "a search goes on while the editor is left"** (R15; the CheckStrip comment promises it).
   Fix: in editor-ui, press C, call `e.editor.close()`, answer, then `e.editor.open()`; `check-result` shows the
   answer and the search was never cancelled (`calls` has no `cancel`).
8. **An owner's try with story pages opens the Lore book's list mid-try.** A draft with pages (owner brush) is
   tried as `toLevel(live)`, which keeps them. In src/game.ts:231, `pageStops` pauses the animation at a page.
   ui.ts `announcePages` (~:531) then opens Lore on an id that no chapter lists, so `fullOf` returns null and the
   list shows. src/outside.ts:3 says an outside level "finds no pages".
   Fix:
   - In game.ts, make `pageStops` return `[]` when `deps.levels.scratch?.(trial)`.
   - In ui.ts, `announcePages` returns early for `outsideOf(g)`.
   - Add a ui.test: an outside try of a level with a page takes it with no Lore layer, and the end card shows.

   Both changes are needed: skipping only the announcement would leave the animation paused forever.
9. **outside.ts is DOM-free but not in the DOM-free program.** tsconfig.json:4 lacks `src/outside.ts`, so the
   smoke test "the rules never name the page" does not cover it. Fix: add it to `files`.
10. **outside.ts with no level held** (Task 7 deferred). src/outside.ts:42: `level(at)` with nothing held falls
    through to `campaign.level(at)` → `levelById(undefined)` → `trialLevel(-1)`. This is unreachable today.
    Fix: `if (i === at) { if (!held) throw new RangeError('no outside level is held'); return held.level; }`.
11. **Copy notes go stale.** In src/editor/share-panel.tsx:79-80, SharePanel's `copied`, `entryText` and
    `entryCopied` outlive the link and the draft they were for. After an edit and a new Share, "Copied." shows
    beside a link nobody copied. The owner's `#owner-entry` keeps the old entry after edits.
    Fix: move the link block (name, field, Copy, `copied`) into a child keyed by `p.link.url`. Key the entry block
    by `toText(p.draft, false)`. Add a test: Copy, edit, Share again, and `share-copied` is absent.
12. **History wording in tests.**
    - test/editor-ui.test.ts:297 `// ---- review round 1 ----`: rename it after what follows, e.g. `// ---- hidden
      walls, focus, and the hearts and size boxes ----`.
    - _kit/test/dom-stub.test.ts:51 "the tree links still read as before": rename it to "the hidden tree links
      still read".
13. **Header wrap.** src/outside.ts:4 runs past the file's width (Task 9 deferred); re-wrap it to ~120 columns.
    src/editor/bar.tsx:4-5 breaks short ("…and the Share panel\n// (share-panel.tsx)"); re-wrap it.
14. **Shared start card with no best** (Task 7 deferred). In test/ui.test.ts:788 ("an outside level offers no next
    level…", a shared level with `best: null`), add `assert.equal(el('start-best'), undefined)` after `win(9)`
    opens it. Alternatively, open the level and check the start card before winning.
15. **No diagonal-drag test** (Task 8 deferred). Add a test that `lineCells({r:0,c:0},{r:3,c:5})` has 5 cells,
    ends at (3,5), and each cell touches the one before it (8-neighbour). Optionally add a drag test over a
    diagonal.

## Leave

- **Check keeps running after the editor is left** (R15). This includes campaign play and Quit, with a stopped
  search holding its node file open, and nothing outside the editor can cancel it. It is by ruling. Carry it into
  Task 12: the rating search will replace an editor Check in the one worker, and the editor will then say "The
  solver stopped: the search was cancelled". Task 12 should either leave a running Check alone (no rating while one
  runs) or word that case.
- **A new Check of B drops A's finished answer** (Task 10 deferred). Undo back to A then needs a re-check, which
  the worker's cache answers quickly.
- **Re-renders on every painted cell and every progress report** (Task 8 deferred). Each one re-renders the whole
  panel and palette, and the game loop still paints the hidden main board under the editor. There is no measured
  cost.
- **The editor-ui Try tests share module-level fixtures** (Task 9 deferred). They are order-tolerant. Fix 5's
  helper makes isolating them cheap later.
- **The main.ts hash wiring has no unit test.** This covers `followHash` and `leftEditor`'s replaceState. Task
  13's spec should open `#edit`, press Q, and assert the hash is gone and a reload shows the title card.
- **`trialsEntry` puts the id in single quotes unescaped** (src/editor/share-panel.tsx:43). This is owner-only, and
  a bad id fails the build loudly.
- **Share ends silently when an edit cancels its Check.** The panel's comment says the Check panel explains it, but
  the state is `none`. That is acceptable, since the link belongs to the old text.
- **Small redundancies.** `tryLevel` in main.ts:69-71 only forwards to `outside.tryLevel`. `__creteTest.editor.load`
  opens the editor twice (showEditor, then open(draft)). Both are harmless.
- **The `playLevel` test hook defaults to kind 'try'.** The crete-pieces spec's menu therefore offers Back to the
  editor. The spec never presses it.
- **PR 1 leftovers already recorded:** one throwing getFile aborts a trim; the trims===1 sync assertion;
  `startsWith('key-')`; the loss test not pinning the playing guard.

Counts: Important 1, Fix now 14, Leave 10.
