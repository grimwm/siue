# SDD ledger — plan: docs/superpowers/plans/2026-11-01-composer-4f-vocal-tracks.md
Branch music/composer-4f, worktree .claude/worktrees/composer-4f, base 82aab2a2.
Ruling: STREAMINFO MD5 left zero (FLAC allows unknown) — saves an MD5 implementation — cost: decoders cannot self-verify.
Ruling: one PR, not two — a half (local takes that cannot be saved) would ship a dead end — cost: a bigger review.
Task 1: complete (flac.ts, compose-flac 10/10)
Task 2: complete (ogg.ts, opus.ts, compose-opus 7/7)
Task 3: TS+Python done (vocal-schema, test_vocal); PHP ScoreRules goes with Task 9
Task 4: complete (doc.ts, vocal.ts; compose-vocal 8/8, compose-doc green)
Task 5: complete (render/vocal.ts, engine, browser-sound; render-vocal 5/5, render-engine green)
Task 6: complete (takes.ts, vocalrec.ts; compose-takes 4/4, compose-vocalrec 3/3)
Task 7: complete (vocalsave.ts, save.ts takes; compose-vocalsave 4/4)
Task 9: complete (TakeCheck, DraftCheck, Store takes/convert/settings, Limits 25MB, People caps, take.php, convert-take.php, studio card, admin 80%; MusicTakeCheckTest 9/9, MusicVocalTakesTest 11/11, site suite green except env-only deploy tests)
Ruling: disk floor applies to take uploads only — a score alone is never refused for it — cost: a flood of tiny scores is not floor-guarded (quota still is).
Task 8: complete (VocalPanel, SaveTakes, Composer wiring, mount ports, takesource; workroom units 807/807, tsc clean)
Task 10: complete (zip.ts, vocalexport.ts, list_vocal_takes, connector 1.3.0, READMEs; compose-vocalexport 2/2, test_vocal 3/3)
Task 11: complete (compose.local.ts 10/10 incl. 2 vocal; workroom units 810/810; python 255 OK; PHPUnit site green but env-only deploy tests)
Final: merged #266 as 0cce63fa; CI green; CodeRabbit skipped (no threads). Final review: self-review (fork cannot start subagents).
