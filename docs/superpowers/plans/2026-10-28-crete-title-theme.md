# Crete title theme, draft 1: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A containerised composing pipeline that turns a Python piece into a complete workroom draft, and draft 1 of `crete-title` (a one-minute sketch) made with it.

**Architecture:** A piece is a Python function returning one `Piece` (lanes, sections, characters, motifs, notes, energy). From that one object the pipeline writes `score.json`, `score.musicxml` and one MIDI file per lane; sfizz renders each lane to a stem with SFZ instruments generated from CC0 samples; ffmpeg mixes, applies the lo-fi chain, folds the tail into the loop start, encodes Opus/WebM and draws the spectrogram. Checks (repetition on notes, sharpness on audio) gate the draft.

**Tech Stack:** Python 3 (unittest, numpy, mido, music21), sfizz 1.2.3 `sfizz_render` built from source, ffmpeg, podman, Debian trixie-slim.

**Spec:** `docs/superpowers/specs/2026-10-28-crete-title-theme-design.md`

## Global Constraints

- Everything runs in the container built from `websites/www.cs/music/compose/Containerfile`; host runs are memory-capped: `systemd-run --user --scope -q -p MemoryMax=4G -p MemorySwapMax=0 /usr/bin/timeout 1200 podman ...`.
- Samples: VSCO-2 Community Edition (CC0 1.0), tag `1.1.0`, commit `28092772094b2d9f1148d84cea97f4545b8c687d`, fetched per file from `https://raw.githubusercontent.com/sgossner/VSCO-2-CE/<commit>/<path>`, each verified by sha256 from `compose/samples.json`, cached in `~/.cache/siue-music/samples/` (mounted into the container), never committed.
- Draft folder: `websites/www.cs/music/pieces/crete-title/v1/` with `score.json`, `score.musicxml`, `audio.webm`, `spectrogram.png`; `score.json` passes `siue_music.score.validate` with the glossary at `websites/www.cs/games/workroom/src/glossary.json`. Renders (`audio.webm`, `spectrogram.png`, `stems/`, `midi/`) are git-ignored.
- One draft ≤ 8 MB (`siue_music.api.MAX_REQUEST_BYTES`); Opus at 96 kb/s stereo.
- Score duration == audio duration == loop length; `energy` ends exactly at `duration`.
- Project `crete` / "Crete"; piece `crete-title` / "Crete: title theme"; characters Ariadne `#d4a72c`, Minotaur `#b23a3a`, Daedalus `#b0793a`, Athens `#3a6fb2` (only those used appear).
- No copyrighted material as input. Original tune.
- Claude never runs `make music-publish` or `make music-pickup`.

## Review Focus

1. A sample download that is truncated or altered: the fetch refuses it and deletes the partial file (Task 1 test `test_bad_checksum_is_refused_and_removed`).
2. A note held past the loop end: export clips it to `duration` rather than producing an invalid score (Task 2 test `test_note_past_the_end_is_clipped`).
3. Notes starting mid-bar with ties across bar lines: MusicXML still parses back to the same pitches and onsets (Task 2 test `test_musicxml_round_trips_pitches_and_onsets`).
4. A loud pluck in a quiet passage: the sharpness check flags a click even when the overall level is low (Task 4 test `test_click_in_quiet_audio_fails`).
5. A rerender of the same draft: identical notes give identical `score.json` except `made` (Task 2 test `test_export_is_deterministic`).

---

### Task 1: Container, sample manifest and fetch

**Files:**
- Create: `websites/www.cs/music/compose/Containerfile`, `compose/samples.json`, `compose/siue_compose/__init__.py`, `compose/siue_compose/samples.py`, `compose/tests/test_samples.py`, `compose/README.md`
- Modify: `websites/www.cs/Makefile` (targets `music-image`, `music-compose-test`, `music-render`), `.gitignore`

**Interfaces:**
- Produces: `fetch(manifest: dict, cache: Path, get=urlopen) -> dict[str, Path]` (instrument id → folder of verified files); `samples.json` shape `{"library", "licence", "source", "commit", "instruments": {id: {"files": [{"path", "sha256", "pitch"}]}}}` where `pitch` is the MIDI root key of each sample.

- [ ] Step 1: tests — `test_fetches_and_verifies` (fake `get` returns bytes matching sha256 → file in cache), `test_cached_file_is_not_fetched_again`, `test_bad_checksum_is_refused_and_removed` (raises `SampleError`, no file left).
- [ ] Step 2: run in container, see them fail.
- [ ] Step 3: implement `samples.py`; write `.part` then rename after the hash matches.
- [ ] Step 4: Containerfile: `debian:trixie-slim`, apt `python3 python3-numpy python3-mido ffmpeg cmake g++ libsndfile1-dev`, pip `music21` (pinned), sfizz 1.2.3 source tarball with pinned sha256, built with `-DSFIZZ_JACK=OFF -DSFIZZ_RENDER=ON -DSFIZZ_LV2=OFF -DSFIZZ_VST=OFF`.
- [ ] Step 5: fill `samples.json` for `harp` (Strings/Harp, 23), `organ` (Keys/Organ/Quiet, 32), `cello` (Strings/Cello Section/susvib v1 layer), `bass` (Strings/Solo Contrabass/SusNV); root keys from file names, organ root keys from the files' numbering checked once by pitch detection.
- [ ] Step 6: tests pass; `make music-image` builds; commit.

### Task 2: Piece model and exports

**Files:**
- Create: `compose/siue_compose/piece.py`, `compose/siue_compose/export.py`, `compose/tests/test_export.py`

**Interfaces:**
- Produces: dataclasses `Lane(id, name, family, color, instrument, volume)`, `Note(lane, beat, beats, pitch, velocity, motif=None)` (times in beats), `Section(id, name, color, from_bar, to_bar)`, `Piece(project, piece_id, title, bpm, beats_per_bar, bars, lanes, sections, characters, motifs, notes, energy, glossary)`; `Piece.duration -> float`; `score_json(piece, draft: int, made: str) -> dict`; `musicxml(piece) -> str`; `midi_files(piece) -> dict[str, mido.MidiFile]` (one per lane, 480 ticks/beat).
- [ ] Step 1: tests — `test_score_validates` (the validator returns `[]`), `test_note_past_the_end_is_clipped`, `test_musicxml_round_trips_pitches_and_onsets` (music21 parse), `test_midi_has_every_note`, `test_export_is_deterministic`.
- [ ] Step 2: fail; implement; pass; commit.

### Task 3: Render and master

**Files:**
- Create: `compose/siue_compose/sfz.py`, `compose/siue_compose/render.py`, `compose/siue_compose/cli.py`, `compose/tests/test_render.py`

**Interfaces:**
- Consumes: `fetch`, `Piece`, `midi_files`, `score_json`, `musicxml`.
- Produces: `write_sfz(instrument: dict, folder: Path) -> Path` (regions spanning to the next root key, soft `ampeg_attack`, long release); `render(piece, draft, out: Path, samples: dict[str, Path]) -> None` writing the four draft files plus `stems/<lane>.wav`; CLI `python3 -m siue_compose.cli render <piece> <version>`.
- Master chain (ffmpeg): sum stems with lane volumes → gentle saturation → `vibrato` for wow/flutter (≈0.5 Hz, tiny depth) → low-pass ≈ 7 kHz → long reverb (`aecho` multi-tap or convolution with a generated decaying-noise IR) → hiss at about −60 dBFS → loudnorm to −20 LUFS. Fold: render `duration + tail`, add the tail onto the first seconds, trim to `duration`.
- [ ] Step 1: test `test_short_render_makes_every_draft_file` with a 2-bar test piece (container only, skips without `sfizz_render`); asserts file set and audio length within 20 ms of `duration`.
- [ ] Step 2: fail; implement; pass; commit.

### Task 4: Checks

**Files:**
- Create: `compose/siue_compose/checks.py`, `compose/tests/test_checks.py`

**Interfaces:**
- Produces: `repetition(piece, motif: str) -> list[str]` (problems: two statements of `motif` with identical note sets in identical lanes); `sharpness(wav: Path) -> list[str]` (peak in any 5 ms window more than 18 dB above the 400 ms RMS around it; energy above 8 kHz more than −30 dB relative to the total). `render` runs both and refuses on any problem.
- [ ] Step 1: tests — `test_identical_statements_fail`, `test_varied_statements_pass`, `test_click_in_quiet_audio_fails`, `test_soft_tone_passes`, `test_bright_noise_fails`.
- [ ] Step 2: fail; implement; pass; commit.

### Task 5: Draft 1 of `crete-title`

**Files:**
- Create: `compose/pieces/crete_title.py` (`compose(draft: int) -> Piece`), `websites/www.cs/music/pieces/crete-title/README.md` (credits: VSCO-2 CE, CC0; Organ by Simon Dalzell of Ivy Audio and Versilian Studios), `websites/www.cs/music/pieces/crete-title/v1/score.json`, `v1/score.musicxml`
- [ ] Step 1: compose the sketch: 62 BPM, 4/4, 16 bars (~62 s): bars 1–4 drone and organ breath (section "The island wakes"), bars 5–12 the tune on harp in D Dorian with a Phrygian E♭ turn (motif `ariadne`, character Ariadne), bars 9–14 the organ swell rising and falling, bars 13–16 drone alone returning to the start (section "The labyrinth breathes"). Glossary entries for `drone`, `swell`, `motif`.
- [ ] Step 2: `make music-render PIECE=crete-title VERSION=1`; checks pass; validator passes; size < 8 MB.
- [ ] Step 3: listen-check by numbers: loudness, peak, and the seam (RMS of last and first 200 ms within 3 dB).
- [ ] Step 4: commit, open the PR, give the owner the publish steps.
