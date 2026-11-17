# SDD ledger — plan: docs/superpowers/plans/2026-10-31-composer-4d-keyboards-hum-play-along.md
Pre-flight: T3 consumes T2 PitchFrame/midiOf; T5 consumes T1-T4; no conflicts.
Ruling: Exact Pitch bends shown not stored (schema 1) — spec table says stored from 4e — cost: none.
Ruling: channel-10 pads go to selected drum part else first drum part else selected part — spec silent — cost: small.
Task 1: complete (e2b4e9e4, tests: node --test test/midiin.test.ts → 8/8)
Task 2: complete (fb8534a9, tests: node --test test/pitch.test.ts → 7/7; note: tests written first but not run red before impl)
Task 3: complete (72799955, tests: hum 8/8 (red first: 2 fails, fixed segmentation), pitch 7/7)
Task 4: complete (f7d014c3, tests: compose-live 9/9, red first)
Task 5: complete (c5a4eb1d, tests: workroom units 723/723, typecheck via build)
Ruling: channel-10 pads with a non-drum part selected are not recorded; status names the drum part to choose — avoids recording drums into a pitched part — cost: one extra tap.
Ruling: Hum reads recordings via MediaRecorder+decode after stop (no live pitch line while singing; level meter only) — CSP script-src 'self' rules out blob AudioWorklets — cost: stage 1 appears after Stop.
Ruling: Hum uses the Tidy To setting (shown in Hum too); lengths snap to the grid, min one step.
Task 6: complete (722bad33, tests: make music-e2e E2E_ARGS=compose.local.ts → 5/5; units 723/723)
Final review: self-review (fork cannot start subagents). Play Along with Hear The Other Parts On is not covered by e2e (built-sound path shared with Hear With The Piece).
Merged: PR #258 as 6b8181fa (CI units pass; CodeRabbit 6 threads fixed in 4e621186, all acknowledged).
