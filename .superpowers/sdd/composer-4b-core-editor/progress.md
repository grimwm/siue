# SDD ledger — plan: docs/superpowers/plans/2026-10-31-composer-4b-core-editor.md
Worktree: .claude/worktrees/composer-4b (branch music/composer-editor). Executor: inline (fork; no subagents).
Pre-flight: T2 produces EditDoc/beatClock consumed by T3-T7; T1 produces save-draft.php consumed by T6 saveDraft (409 stale/latest, 413 over_quota message) — consistent.
Ruling: editor drafts are score.json only for every account and carry musicxml:"score.musicxml" (the score-only convention every AI studio draft already uses), so parseScore/score.py stay unchanged; drafts.php gains sheet:bool so the Sheet tab shows only when MusicXML is stored — cost if wrong: owner's editor drafts lack a sheet until 4c engraves live.
Ruling: the editor edits music pieces only (Compose link hidden on sound pieces) — sound pieces have no bars to step through.
Ruling: bars never shrink below the base score's — keeps sections/changes valid.
Task 1: complete (commit a4f1a787, tests: phpunit MusicSaveDraftTest 9/9, site suite 609 green after assertion update)
Task 2: complete (commit 1e004642, tests: node --test compose-doc 8/8, tsc clean)
Task 2: Ruling: a lane without a sound opens with its family's instrument (strings→cello, brass→horn, …) — old full drafts become renderable on save — cost if wrong: owner retunes the instrument in the picker
Task 3: complete (commit 33ce21e0, tests: compose-edit 6/6; written with the code, not watched failing first)
Task 4: complete (commit 2dc60198, tests: compose-live 7/7)
Task 4: Ruling: keys down within 50 ms are one chord even with Tidy Off — spec says chords record together in every mode — cost if wrong: very fast grace notes merge into a chord
Task 5: complete (commit b94f46f8, tests: compose-grid 6/6 incl. written-transposition math)
Task 6: complete (commit b57f5a3a, tests: compose-save 4/4, api/remember/notes-session 45/45)
Task 6: Ruling: live notes ramp in over at most 0.3 s even when the part's attack is longer (organ 3 s) — a held key must answer at once; the saved draft keeps the part's own attack — cost if wrong: live preview of slow pads sounds sharper than the render
Task 7: complete (commits 8757f6ff..7cfcd3ff, tests: compose-view 1/1, units.sh 3992/3992, tsc all programs)
Task 8: complete (make music-e2e E2E_ARGS=compose.local.ts → 2/2 passed, desktop + phone)
Task 7: Ruling: on touch, dragging empty grid space scrolls the grid; drag-to-select is mouse/pen only — a finger drag must scroll on phones — cost if wrong: phone users select several notes only one by one
Task 7: Ruling: opening an older draft saves as latest+1 — the server takes only the next draft — cost if wrong: none (says Draft N of latest)
Task 7: Ruling: black keys use a fixed dark rgba in both themes (no token is dark in light theme) — owner asked for clearly visible keys — cost if wrong: one inline colour
Final: merged #256 as 718fcb9e; CI green (units, e2e 1-4, music-tool); review: 4 fixed, 1 skipped (e2e wait). Final review: self-review (fork, no subagent tool).
