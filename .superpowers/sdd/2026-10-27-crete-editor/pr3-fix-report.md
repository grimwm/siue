# PR 3 fix wave report

Commit 04bc233 on top of 3cb4b66. Nothing pushed.

## Findings
1. Edit a copy then U: FIXED. The spec paints a wall on a floor cell (5,5) after reading the link, takes `earlier`, asserts the copy differs (`not.toBe(earlier)`), presses U, asserts `toBe(earlier)`.
2. Vacuous checks: FIXED. Test 1 reads the three cells (3*12+3, 3*12+4, 4*12+3) before (no '#') and after (all '#'). Test 3 asserts `#editor-undo` disabled right after `load`, then keeps the U press.
3. Phone test wins with the link's own line: FIXED. `linkLine` decodes `location.hash` (base64url, DecompressionStream deflate-raw, `line:` header); `winWithLine` maps u/d/l/r/w/z/x/c to keys.
4. Loose checks: FIXED. `#shared-title` is asserted against `#share-name` (tests 3 and 5); the real worker's rating line is asserted on the card in test 5; test 2 reloads after Q (title card up, editor hidden); tests 2, 4, 5 collect `pageerror`.
5. Q on a menu-opened shared card: FIXED. `showShared(fromMenu)` sets `sharedFromMenu`; Q then reopens the menu over the level. New shared.test: menu, Shared level, Q gives top `menu` with `game.run` unchanged; Q again closes onto the level; a link-opened card still goes to the title card.
6. Link mid-play does not settle: FIXED in main.ts (`show` and `refuse` call `game.settle()`). No unit test: it is main.ts wiring (type-checked and built only).
7. closeLayers in two copies: FIXED. `outside.play` calls `deps.closeLayers()` first, `tryLevel` no longer does; main.ts and shared.test wire `play: outside.play(...)` plain, so the existing "closing the start card leaves no shared card beneath it" test runs the real path. crete-pieces.spec.ts was NOT run (the message said only editor and play specs); `playLevel` now also closes layers, which unit tests cover.
8. README link limits in the code's order, with initials and no title/intro/page added: FIXED.
9. README Tests lists crete-editor and crete-pieces: FIXED.
10. README wording (Play opens from its start; Copy for trials.ts escapes the id too): FIXED.
11. Roadmap: dropped "The next step is the editor." and "(next: Chapter 2)", re-wrapped to 80 columns: FIXED.
Leave items untouched.

## Mutation checks (each broken, rerun, confirmed failing, restored)
Unit (shared.test.ts):
- removed `deps.closeLayers()` from `outside.play`: "play starts before the rating finishes" fails.
- `sharedFromMenu` ignored: the new Q test fails.
Browser (crete-editor.spec.ts):
- paint x offset +1 cell: tests 1 and 5 fail.
- last letter of the link's line dropped: test 3 fails.
- rating regex changed to `Solo`: test 5 fails (after the 120 s timeout).
- `editor.open` always starts a fresh history (the R18 bug): test 5 fails.
- `load` opens an empty draft first: test 3 fails on `toBeDisabled`.
- `leftEditor` no longer clears `#edit`: test 2 fails on the reload.
Sources and spec restored (diff-checked), bundle rebuilt.

## Spec run (own compose project, torn down after)
  ✓ 1 crete-editor.spec.ts:68 builds a small level and tries it
  ✓ 2 crete-editor.spec.ts:98 Q from #edit clears the address and shows the title card
  ✓ 3 crete-editor.spec.ts:113 shares a level and wins it on a phone
  ✓ 4 crete-editor.spec.ts:158 a damaged link shows a message, never a board
  ✓ 5 crete-editor.spec.ts:169 a link opened in a page shows the card; Edit a copy then U ...; Back goes to the title card
  ✓ 6-20 crete-play.spec.ts (15 tests)
  20 passed (17.7s)

## Units
bash units.sh: tests 3500, pass 3499, fail 0, skipped 1; exit 0. sh crete/test.sh: exit 0. Generated files rebuilt and committed.
