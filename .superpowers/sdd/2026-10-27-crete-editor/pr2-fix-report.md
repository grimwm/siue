# PR 2 fix wave report

Commits (branch crete-editor, on top of ec22271):
- 75222e2 Share after Stop, stale stopped note, copy notes, shared editor fakes, new editor tests (items 2-7, 11, 12 test heading, 15)
- b19e4ba try with story pages: no Lore entry, no pause; outside.ts in the DOM-free program and guarded (items 8, 9, 10, 13 outside.ts wrap, 14)
- ab6babf README, bar.tsx header wrap, dom-stub test rename, rebuilt dist/index/sw (items 1, 12 dom-stub name, 13 bar.tsx)

Findings:
1. README: fixed (files and roles, outside.ts, both __creteTest lists, layers/title/menu/ending-card text, E key, editor key note).
2. Strip Share while stopped: fixed; test (enabled after Stop, press resumes, searches stay 1).
3. Stale "press Share again": fixed (clearStoppedMessage in the checker callback); test.
4. later() timeout: fixed, it throws 'timed out waiting'.
5. Shared fakes: fixed, test/editor-fakes.ts (fakeSearches with real-client cancel via CancelledError, installEditorWindow, REPORT, ANSWER, makeEditor); used by editor-check, editor-share, editor-ui. New test: an edit during a Share waiting on its Check frees share-run with no link.
6. Check line to the try's thread: fixed; wiring passes the line, test checks Levels.line and that H plays the line's first move.
7. Search survives leaving the editor: test added (no cancel call).
8. Lore book during a try: fixed in game.ts (no page stops for scratch levels) and ui.ts (announcePages returns for outside levels); test fails if either change is reverted alone.
9. tsconfig: src/outside.ts added.
10. outside.level with nothing held throws RangeError. No separate test (unreachable path).
11. Copy notes: LinkBlock keyed by link url, EntryBlock keyed by the draft text; tests for share-copied and owner-entry.
12. History wording: both renamed.
13. Header wraps: outside.ts and bar.tsx re-wrapped.
14. Shared start card with no best: assertion added in test/ui.test.ts.
15. Diagonal: lineCells test and a diagonal drag test.
Leave items: untouched.

Verification:
- bash units.sh: exit 0; 3477 tests, 3476 pass, 0 fail, 1 skipped.
- sh crete/test.sh: exit 0 (after node _kit/build/build.mjs crete and install-files.php).
- Note: one early run of editor-check.test.ts (20 pass) ran without the memory cap; every later run was capped.
