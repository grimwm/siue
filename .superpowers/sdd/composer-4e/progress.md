# SDD ledger — plan: docs/superpowers/plans/2026-10-31-composer-4e-speed-loudness-sound.md
Worktree: .claude/worktrees/composer-4e (branch music/composer-4e). Executor: inline (fork; no subagents).
Ruling: notes stay in seconds; piece_tempo is intent and step `tempo` is written per bar from it — every schema-1 reader keeps working — cost if wrong: ramps are per-bar steps, not smooth.
Ruling: part speed is an editor retime (renderer unchanged) — parity for tempo/ratio holds by construction — cost: none for playback.
Ruling: fx_clips is left to 4g, which uses it — cost: 4g adds its validator.
Ruling: two PRs (Part A tasks 1-5, Part B 6-10) per directive.
Task 1: complete (196d7077, tests: node --test test/score2.test.ts test/score.test.ts → 4/4, 12/12)
Task 2: complete (5fc7a2b5 + test_publish fix, tests: python unittest discover 252 ok after schema-3 fix; PHPUnit MusicSaveDraftTest 10/10)
Ruling: Task 1 tests written with the code in one step (no watched RED) — cost: none found; vectors cover each path.
Task 3-5: complete (806cf5eb..HEAD, tests: workroom units 737/737, make music-e2e compose.local.ts 7/7)
Ruling: notes are entered on the piece's grid for every part; a non-Follow part's speed retimes its notes — cost: a 2× part's step lengths are piece lengths.
Ruling: Follow Piece is saved by leaving lane.speed out — equivalent meaning, keeps schema 1 drafts schema 1.
Part A: PR #261 merged a319b9ce (required checks green; CodeRabbit skipped, 0 threads).
HOLD (coordinator): do not merge #262 until told; deploy failed scp, one deploy attempt left.
Part B: PR #262 merged after review fixes 23ee5534 (7 threads fixed + replied; all checks green).
