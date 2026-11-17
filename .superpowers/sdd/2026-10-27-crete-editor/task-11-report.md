# Task 11 report

Commit: see `git log -1` on crete-editor (message "Crete: Share makes a link; the owner copies a campaign level").

## The three failures (all test faults; share-panel code was right)
1. Test 1 bar: level 9 is a chase level, so sharedProblems holds it to the chase bar (30 moves / 6000 situations); SHARED_BAR is 40/12000 only for solo levels. Test now pins D.label === 'chase' expecting 30/6000 and adds a solo-labelled case expecting 40/12000.
2. Test 8 link not cleared: the test's pointer landed on cell (0,0), already a wall, so no edit happened. It now finds a floor cell, computes the rise like editor-ui.test.ts, and asserts the text changed before checking the link is gone.
3. Test 12 Copy: the kit's dom-stub elements have no select() (the code is right for browsers). Test installs a select spy and asserts it was called.

## Also fixed
- Flake under the parallel full suite: the link is made with CompressionStream (real async time), so `later()` with 20 setImmediate ticks sometimes ended early. `later(done)` now polls a predicate (up to 10 s).
- Added .share-panel CSS to game.css (mirrors .check-panel).
- Rebuilt dist/main.js(+map), index.html, sw.js (test.sh checks them).

## Results
- editor-share.test.ts: 15 pass.
- Full units (games/units.sh): 3464 tests, 3463 pass, 0 fail, 1 skipped; exit 0.
- crete/test.sh: exit 0.

## Fix round 1 (commit 307b6f3)
1. ENCODED_MAX test now passes 30k incompressible characters with a valid line and deepEquals "This level is too large to share as a link."; mutation-checked (branch disabled -> test failed; restored). Dropped the false comment and empty assert.
2. shareLink maps openLink errors: only 'damaged' says the solver's line could not be read; others use LINK_MESSAGES[error]. No test (no cheap way to make a fragment under ENCODED_MAX that the decoder refuses otherwise).
3. Stop during a Share: the checker's change callback calls endStoppedShare(), which ends that Share with "The search stopped before it finished; press Share again to keep going." and re-enables the button; Share again resumes the paused search. Comment fixed. Test added.
4. later(done) condition is now required.
5. Test added: Share during a same-text Check reuses the search (searches.length 1).
6. validInitials import moved before the local share-panel import.

Results: units 3466 tests, 3465 pass, 0 fail, 1 skipped (exit 0); crete/test.sh exit 0 (dist, index.html, sw.js rebuilt).
