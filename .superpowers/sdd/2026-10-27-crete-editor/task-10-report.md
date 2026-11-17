# Task 10: Check — report

Commit d52c5fc "Crete: Check proves and rates a level in the editor" (branch crete-editor, on 3125f65). Not pushed.

## Implemented
- src/editor/check.ts (DOM-free, added to tsconfig.json): CheckState, Checker, createChecker, checkLines, plus a structural `CheckJob` (SolverJob's shape; solver-client.ts uses Worker/URL and cannot enter the DOM-free program).
- src/editor/check-panel.tsx: #check-panel with #check-run (key chip C), indeterminate #check-bar, #check-progress ("Searched N situations · trying lines of at least M moves", plus "(in memory only)"), #check-stop / #check-keep (both always shown, the wrong one disabled), #check-result lines, "Out of date: press Check." (#check-stale) with the result greyed.
- bar.tsx: panel above the palette in the side aside (so the result is on screen without scrolling the palette). editor.ts: checker owned by the editor; `start` dep (default startSearch(text,'measure')); C and the Check button call check(toText(draft,true)); show() and open() call checker.edited(text) (every edit, undo/redo, stroke step, resize); tryIt passes lineOf(d.line) as a third arg when the done check's text equals the try's text. main.ts forwards that line to tryLevel. game.css styles; build outputs regenerated.

## Cancellation tracking
A generation counter. Starting or cancelling bumps `gen`; each search's then-handlers drop their outcome (resolve null) when `gen` changed. CancelledError is never consulted, so a search replaced by a newer startSearch (plain Error) and failedJob's no-op cancel are both handled. A genuine rejection of the current search becomes the `failed` state (null). edited(text): running search of a different text is cancelled and state becomes none; a finished answer stays (stale derived by text comparison, so undo to the checked text makes it current again); an edit back to the running text keeps it running. check() of the done text returns the stored result; of the running text returns the same promise.

## Tests
- test/editor-check.test.ts: 18 new (checker: progress, edit cancels and drops late answer, superseded resolves null, edit back keeps running, undo makes current, stop/keep, reuse and sharing, failed, start throws; checkLines: chase exact strings incl. 24,086, real measure of trial 9, shareable, solo and no-Minotaur, unknown label, unwinnable, capped with/without blocks lead and no pieces, not-shareable list, stale/none).
- test/editor-ui.test.ts: 3 new (C/button with progress, in-memory note, Stop/Keep, reuse; edit cancels, stale and undo; Try it line only for the checked text) and C test renamed. Focused run: 48 pass, 0 fail.
- units.sh: exit 0, 3443 tests, 3442 pass, 0 fail, 1 skipped (pre-existing). sh crete/test.sh: exit 0.
- TDD: editor-check.test.ts failed first (module missing, 1 failed file); the UI tests were written after the wiring in the same pass, not shown red separately.

## Live check
Headless Chrome (channel chrome) against a static server on an ephemeral port (not the compose stack; the page needs no PHP): #edit, __creteTest.editor.load(trial 9 without title/intro; pages header kept because its grid has a page cell), pressed C, waited for the result: "Winnable: quickest win 54 moves / Situations searched: 12,161 / Chase: the Minotaur adds 22 moves; ignoring him loses / Shareable". Hearts changed to 7: result greyed with "Out of date: press Check."; Undo: stale note gone. No page errors. Server stopped, scratch spec removed. Real situations count is 12,161 (24,086 in the brief was an example).

## Files
websites/www.cs/games/crete/: src/editor/check.ts, check-panel.tsx (new), bar.tsx, editor.ts, src/main.ts, game.css, tsconfig.json, test/editor-check.test.ts (new), test/editor-ui.test.ts, dist/main.js(.map), index.html, sw.js.

## Self-review
Edit with state none is cheap (toText only). edited() does not re-render itself unless it cancels; show() redraws the panel anyway. Stale level for hardPieces is parsed from the answered text. Singular "1 move" handled by plural helper (brief gave plural only). A chase with unknown delta/greedy degrades to "can catch you" without the ignoring clause.

## Concerns
- Under 700 px the side panel is a drawer, so the Check panel and progress are visible only with Pieces open (C works regardless).
- The live run was a cache-warm/fast search, so the progress bar was seen only as "Starting the search…"; progress text is covered by unit tests with a fake job.
- Replaced-by-newer-search errors for the current job (if another caller started a search) would show as a failed state.

## Fix round 1
1. Phone: added `CheckStrip` (check-panel.tsx) in the editor bar, outside the drawer: ids check-strip, check-strip-run, check-strip-text, check-strip-stop, check-strip-keep (panel ids unchanged, no duplicates, asserted). Running: bar + one-line progress + Stop/Keep; done: `checkSummary` (check.ts) one-liner ("Winnable in 54 · Shareable" / "Winnable in N · Not shareable yet" / "Cannot be won" / "The solver could not finish" / "Out of date: press Check."). CSS shows it only under 700 px (hidden on desktop where the panel shows the same).
2. check(): a re-check of the same text while stopped now resumes it (test added).
3. Comment in editor.close() that a running check goes on when the editor is left.
Tests: editor-check +2, editor-ui +1; focused 51 pass; units.sh and crete/test.sh results in the reply. Live at 390x800 (touch): drawer closed, strip visible, Check pressed: "Starting the search…" -> "Searched 4,581 situations · trying lines of at least 41 moves" -> "Winnable in 54 · Shareable"; no page errors.
