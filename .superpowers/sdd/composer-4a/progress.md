# SDD ledger — plan: docs/superpowers/plans/2026-10-31-composer-4a-instrument-library.md
Executor: inline (fork cannot dispatch subagents) — Ruling: executing-plans inline — fork hard rule — cost: no per-task reviewer
Worktree: .claude/worktrees/instrument-library (branch music/instrument-library)
Task 1: complete (957c0927, tests: unittest test_library → 9/9 pass)
Task 2: Ruling: Python region tests in new tests/test_sfz.py, not test_render.py (which needs sfizz) — keeps them runnable without the container — cost: none
Task 2: Ruling: render.py resolves stand-ins through sfz.instrument() — spec says no special case in renderers; library.json handles the browser, the manifest helper the pipeline — cost: small
Task 2: complete (2ba3134d, tests: render-plan 10/10, test_sfz 4/4)
Task 3: Ruling: drum kit samples hand-picked (VSCO has no kit; GM-StylePerc.sfz is not GM-mapped): muted bass drum kick, tenor toms, suspended cymbal hi-hats/ride — cost: owner may prefer other picks
Task 3: Ruling: glock/xylo/piccolo roots +12 from VSCO names — measured: every sample sounds an octave above its filed pitch — cost: none, verified by FFT
Task 3: Ruling: loops from loudness envelope (70%-peak onset +0.25s to last 50%-peak), not by ear — cost: an audible seam on some notes
Task 3: Ruling: published cello loop [2.5,6.5] passes cello/71's end (6.39s); kept as published via manifest loop_past_end:[71] — renderers clamp — cost: none
Task 3: Ruling: celesta standin_shift -12 (spec: glock an octave lower), new manifest field — cost: none
Task 3: Ruling: neighbouring-root gap test exempts instruments VSCO itself records sparsely (SPARSE set) — cost: weaker check
Task 3: Ruling: PHP test in tests/php/MusicLibraryCatalogueTest.php (repo PHPUnit layout), old-five byte compare against committed fixture (no git in container) — cost: none
Task 3: complete (3da69be3, library 170M/251 flac; tests: music-compose-test 53 OK, music-test 244 OK, phpunit music 10 OK)
Task 4: complete (a0eb384a, tests: catalogue 9/9, build --check clean, tsc clean)
Task 5: Ruling: test_list_instruments in test_studio.py with the real library.json via the Studio fetch seam (FakeServer serves no library.json); MCP test checks the tool is listed — cost: no stdio call of the tool
Task 5: Ruling: wheel version 1.0.0 → 1.1.0 (new tool) — cost: none
Task 5: complete (97f2ed4a, tests: test_studio*.py 18 OK with MCP SDK venv; build-wheel --check OK)
Coordinator scope (owner): Lyre + shipped-piece audit; collect CC0 samples for gaps; design-page checklist; Voice Effects; Vocal Tracks phase (Perfect FLAC / Good To The Ear Opus, local-first, 25 MB limit)
Ruling: second CC0 source VCSL (manifest sources.vcsl, instrument from) for vibes, bells, kit, lyre — real samples — cost: none
Ruling: VCSL roots +12 (measured; VCSL names C3 as middle C) — cost: none
Ruling: Polyphone 'public domain' SF2 celesta/choir rejected (unclear provenance) — stay stand-ins — cost: no real celesta/choir
Ruling: lyre = VCSL folk harp, marked with standin_note; published Crete scores keep 'harp' — cost: none
Ruling: library 180M (<260M stop)
Task 6: Ruling: fixture is test/fixtures/draft-orchestra/ (score.json + generated score.musicxml; music needs MusicXML), not score-orchestra-v1.json — publishFixtureDraft takes a folder — cost: none
Task 6: Ruling: e2e written after fixture existed, not watched failing first — cost: weaker TDD evidence
Task 6: Ruling: spec labels follow the approved page (Tidy To, Line Up To); added Upload A Recording, Fill My Screen; phases now 4a–4g (4f Vocal Tracks, 4g DJ)
Task 6: complete (939d96de, music-e2e orchestra + score-only 2/2)
Final: self-review (no subagent tool). fixed sfz.instrument ignoring standin_shift/pitched — test_standin_shift_and_unpitched_target_carry_over RED→GREEN, compose suite OK
Ruling: shared total 20 GB default + 50 GB disk floor + 80% admin warn, in #255 docs (not merged yet)
Task: PR #255 merged 020d9758; pr-fix-loop 1 pass, 9 threads fixed
