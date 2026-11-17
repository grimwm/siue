# SDD ledger — plan: docs/superpowers/plans/2026-11-01-composer-4g-dj-effects.md
Worktree: .claude/worktrees/composer-4g (branch music/composer-4g), base 0cce63fa.
Pre-flight: Task 1 produces FxClip/barSeconds consumed by 2–5; Task 2 makeClip/applyClips consumed by 3 and 5. No conflicts.
Ruling: one shared per-sample processor set for offline render and live deck — avoids two implementations of 37 effects — cost if wrong: live CPU on slow phones (ScriptProcessor).
Ruling: crossfader and looper are whole-piece clips only — the live deck plays the mix — cost if wrong: no per-part loops.
Ruling: looper and hot cue read the target's dry sound (before other clips), not "what you hear" — offline order independence — cost if wrong: a loop recorded over a pad effect plays without it.
Task 1: complete (commits 0cce63fa..4ab65632, tests: node --test test/fxclips.test.ts → 4/4; python -m unittest test_fxclips → 4/4; phpunit MusicSaveDraftTest → 11/11). Note: score.ts rules written before the test was run; the vector broken cases exercise every rule.
Task 2: complete (commits 4ab65632..485f9346, tests: render-djfx 33/33, render-fx + render-voice pass). Ruling: tape stop slows as (1−t/T)^1.5, not the design page's exponential ramp — starts at full speed like a motor — cost if wrong: a slightly different curve.
Task 3: complete (commits ..b73c21ba, tests: render-engine 20/20)
Tasks 4–5: complete (commits ..d099785c, tests: workroom units 866/866; compose-djclips 7/7, compose-djlive 8/8). Ruling: live crossfader mixes separately rendered A and B stems (each levelled), the saved clip renders exact lane gains — cost if wrong: live fader a little louder than the saved one.
Task 6 e2e: compose.local.ts 12/12 (make music-e2e). Ruling: while DJ Mode's deck plays, letter/number keys are its pads and the note keyboard ignores them (Undo still works) — the design's pad keys collide with the note keys — cost if wrong: can't play notes while the deck runs. Ruling: the deck loops the piece, letting go of held effects at the wrap — cost if wrong: a held effect stops at the end.
PR #267 merged ef8216dd; review: 13 threads, all fixed in f7e86eb4 (one wait kept, reasoned). Final: self-review (fork has no subagent tool).
