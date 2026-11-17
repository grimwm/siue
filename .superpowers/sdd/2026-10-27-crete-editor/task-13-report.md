# Task 13 report: browser specs and docs

Status: DONE. Base 78c72d4. Nothing pushed.

## Commits
- d0465ff: carried fixes. editorHook.load now calls ui.showEditor(draft) (no empty draft beneath the level); new ui.leaveShared() keeps titleHint for Back from the card (main.ts followHash uses it). Tests: shared.test.ts (hint kept), editor-ui.test.ts (fresh editor opened on a draft has nothing to undo).
- 1f4b374: bug found by the spec: Play on the shared card left the shared layer under the start card, so closing the start card revealed the card again and keys did nothing. main.ts visit.play now calls ui.closeLayers() first (as tryLevel does). shared.test.ts wiring mirrors it and asserts ui.top() is null after Enter (verified to fail without the fix).
- 3cb4b66: crete-editor.spec.ts (weight 12 in shard.ts, mapping in select.ts), README "The editor" section, roadmap step 2 live and Chapter 2 next.

## Spec (5 tests): builds and tries a level (draft unchanged after Back to the editor); Q from #edit clears the address; shares a level and wins it on a phone (390x844; load on a page that never opened the editor, U keeps the level); damaged link; link in the address, Edit a copy then U restores the earlier draft, browser Back goes to the title card.
Notes: README says MAX_LINE 18,000 (the code), not 20,000 as in globals. After #edit, load is an undo step on the empty draft (R18), so the no-empty-draft check opens from the title page. The author has no best on the shared level, so the end card reads "You found the way on your own."

## Results (own compose project siue-crete-editor; the root compose.yaml build path fails under podman-compose, so used websites/www.cs/compose.yaml plus an SELinux label=disable override, E2E_BASE_URL set to the real port)
  ✓ 1 crete-editor.spec.ts:50 builds a small level and tries it
  ✓ 2 crete-editor.spec.ts:78 Q from #edit clears the address and shows the title card
  ✓ 3 crete-editor.spec.ts:87 shares a level and wins it on a phone
  ✓ 4 crete-editor.spec.ts:129 a damaged link shows a message, never a board
  ✓ 5 crete-editor.spec.ts:137 a link opened in a page shows the card; Edit a copy then U ...; Back goes to the title card
  crete-play.spec.ts 15 tests all ✓ — "20 passed (19.7s)"

## Units
bash units.sh: tests 3499, pass 3498, fail 0, skipped 1; exit 0. sh crete/test.sh: exit 0. Generated files rebuilt (build.mjs, install-files.php, site-versions, site-game-pages) and committed. Compose project torn down.
