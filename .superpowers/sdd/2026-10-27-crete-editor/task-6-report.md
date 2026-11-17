# Task 6 report: the editor's document and its undo

## Implemented
- src/editor/model.ts: Brush, Draft, MIN_SIDE/MAX_SIDE, newDraft, paint, resize, toText, fromLevel, toLevel (rulings R1, cut-off player/Minotaur, relics clamp all applied).
- src/editor/history.ts: UNDO_LIMIT 50, startHistory, commit, undoH, redoH (immutable; History also exposes past/future).
- crete/tsconfig.json: both files added to the DOM-free program (same as src/share).
- test/editor-model.test.ts: 15 tests.

## TDD
- RED: with src/editor moved aside, `node --test crete/test/editor-model.test.ts` -> fail 1 (module not found), exit 1.
- GREEN: same command -> tests 15, pass 15, fail 0.
- `bash units.sh` exit 0 (fail 0). `sh crete/test.sh` exit 0 after fixing one type error (Set<string|null>) found by the first run (exit 1). Rebuild changes no generated files (nothing imports src/editor).

## Decisions
- newDraft(3,3): the single inside cell holds P, no exit (E would collide).
- Object brush 'page' routes to the page brush with an auto id; terrain brush 'clone' keeps an existing machine's extra, else 'block-up'.
- toText writes `relics:` as min(count, relics) whenever relics is non-null; title/intro newlines become spaces.
- Painting on the player is a no-op for everything but the player brush; Minotaur on P or M is a no-op.

## Self-review
Diff reviewed; no history comments; invariants (one P, valid unique page ids, <=31) guarded by "a draft always parses".

## Concerns
None.

## Fix round 1 (commit 71c1308)
- Test "a draft always parses" now paints every hazard x DIRS and every machine template x DIRS.
- Object page brush on a cell already holding a page returns d unchanged; test added.
- toText: non-finite hearts -> 3; non-finite relics -> no header (as null); test added.
- `node --test crete/test/editor-model.test.ts`: tests 17, pass 17, fail 0. `sh crete/test.sh`: exit 0.
