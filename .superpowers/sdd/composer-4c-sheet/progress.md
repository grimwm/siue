# SDD ledger — plan: docs/superpowers/plans/2026-10-31-composer-4c-sheet-import-export.md
Worktree: .claude/worktrees/composer-4c (branch music/composer-4c). Executor: inline (fork; no subagents).
Pre-flight: T2 toxml produces what T5 roundtrip/T6/T8 consume; T3/T4 share ReadMusic; T5 consumes T2–T4. Consistent.
Ruling: horn in F (+7), B♭ clarinet and trumpet (+2) written transpositions added to the catalogue — owner asked for true fidelity and the directive names horn in F; spec listed only octave transposers — cost if wrong: three numbers and the spec line.
Ruling: the sheet infers a key signature from the notes (score has no key) — readability; cost if wrong: accidentals spelled differently.
Task 1: complete (98b9ca63, catalogue.test.ts 11/11)
Task 2: complete (a5e980e8, toxml.test.ts 12/12)
Task 3: complete (ed9f15ef, midi.test.ts 5/5, toxml 12/12)
Task 4: complete (4538b030, fromxml 5/5, mxl 3/3; tests written before code, run after both)
Task 5: complete (e59b3f2a, importing 6/6, roundtrip 2/2)
Task 6+7: complete (3a5d204a, workroom units 695/695, MusicSaveDraftTest 9/9)
Ruling: Start A New Piece while the piece has unsaved edits is refused with words (save or undo first) — leaving would lose them silently; cost: one extra click.
Ruling: every compose page carries data-pieces/projects (not only New Piece), so a piece started from an import gets a fresh id — cost: a few bytes per page.
Task 8: complete (164c3319, engrave 2/2, playback 17/17, workroom 697+)
Task 9: complete (e3018112, make music-e2e compose.local.ts 3/3, PHPUnit site 609/609)
PR #257 merged 9a933b63 (CI required pass; CodeRabbit rate-limited, merged per standing rule). Owner page https://claude.ai/artifact/2wnBG4aFpTzyazqwuXEw3g. Provenance: not recorded (no ticket).
