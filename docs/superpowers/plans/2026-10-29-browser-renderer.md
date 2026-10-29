# Browser renderer and shared sample library: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The workroom plays, shows and downloads a draft that has only a score, by rendering it in the browser from a shared, lossless sample library, so it sounds like the container's render.

**Architecture:**
- The composing container builds the library: FLAC per sample plus `library.json`. The library is committed under `websites/www.cs/music/library/` and shipped like the page's own files.
- `score.json` gains each lane's sound (instrument, gain, attack, release) and the piece's mix, so a score is enough to render.
- The workroom renders a score in an `OfflineAudioContext`:
  - voices from the library;
  - the same lo-fi chain;
  - the tail folded onto the start;
  - hiss after the fold;
  - one gain to -20 LUFS.
- The result plays and downloads as WAV, and the sound picture is drawn from it.

**Tech stack:** Python (container: ffmpeg FLAC, unittest), TypeScript + Preact (node:test, Web Audio), PHP 8.4 (PHPUnit for deploy and serving rules), Playwright (`make music-e2e`).

**Spec:** `docs/superpowers/specs/2026-10-29-music-studios-design.md`, sections "Decided by the owner" (store the composition, not its renders; lossless) and "The shared sample library and the browser renderer". Also `docs/superpowers/specs/2026-10-28-crete-title-theme-design.md`, for the sound and the lo-fi chain.

## Global Constraints

- **Lossless only:** samples as FLAC (`-compression_level 12`), never resampled or re-encoded lossily. Library total today is about 37 MB for harp, cello, bass, organ and horn.
- **The library's source:** VSCO-2 CE (CC0) at the commit in `music/compose/samples.json`. The library's README and `library.json` carry the credit: "Versilian Studios; organ sampled by Simon Dalzell of Ivy Audio".
- **Owner's drafts with audio files** keep playing those files. The browser renders only when a draft has no audio.
- **No browser storage:** rendered audio lives in memory only (`test/no-storage.test.ts` guards what the page may store).
- **Lo-fi master chain** (from `music/compose/siue_compose/render.py`, kept in step):
  - per-lane gain;
  - tanh soft clip;
  - wow (0.45 Hz, depth 0.012) and flutter (5.5 Hz, 0.003);
  - high-pass 30 Hz;
  - low-pass 6.5 kHz and 9 kHz;
  - a 4.5 s dark reverb at wet 0.55;
  - the tail (6 s) folded onto the start;
  - pink hiss (amplitude 0.0015, low-passed at 5 kHz) added after the fold;
  - one gain to -20 LUFS, capped so the peak stays at -3 dBFS.
- **Node is memory-capped:** `systemd-run --user --scope -q -p MemoryMax=3G -p MemorySwapMax=0 /usr/bin/timeout 300 node --test workroom/test/<f>.test.ts` from `websites/www.cs/games`, one file at a time.
- **PHPUnit** runs in `docker.io/library/php:8.4-cli` from `websites/www.cs`. The Deploy, DeploySet and MakeHelp tests fail there for lack of git; check them with `LIST=1 ./deploy.sh`.
- **Container work** goes through `make music-compose-test` and `make music-library`.
- **`dist/` is rebuilt and committed** whenever the workroom's src changes.

## Review Focus

1. **A browser that cannot decode FLAC, or a library file that fails to load:** the page says the sound could not be built and offers nothing broken. Covered in Task 5's error test.
2. **A score whose lane names an instrument the library lacks:** the validator refuses it, in Python and in TypeScript alike. Covered in Task 2.
3. **A long piece (4 min, 7 lanes) on a phone:** render memory stays bounded (mono voices summed per lane, one stereo buffer). Covered in Task 4's voice-count test.
4. **The loop seam of a browser render:** continuous, the same test as the container's. Covered in Task 3's fold test, plus a seam check in Task 6's e2e.
5. **A score-only draft published from the owner's tool:** `make music-publish` accepts it, and the page renders it. Covered in Task 2 and Task 6.

---

### Task 1: The shared sample library

**Files:**
- Create:
  - `music/compose/siue_compose/library.py`
  - `music/compose/tests/test_library.py`
  - `music/library/library.json`, `music/library/<instrument>/<pitch>.flac` (generated, committed)
  - `music/library/README.md`
- Modify:
  - `websites/www.cs/Makefile` (`music-library`)
  - `websites/www.cs/deploy.sh` (ship `music/library/**`)
  - `music/.htaccess` and `docker/nginx/default.conf` (serve `music/library/` plainly; the samples are CC0)
  - `tests/php/MusicDeployTest.php`

**Interfaces:**
- Produces `build(manifest: dict, samples: Path, out: Path) -> dict`. It writes FLACs and returns the `library.json` dict: `{"version": 1, "source", "commit", "licence", "credit", "instruments": {id: {"files": [{"pitch": int, "file": "<id>/<pitch>.flac", "rate": int, "channels": int}], "loop": [start_s, end_s] | absent}}}`.
- **Steps:**
  - [ ] **Tests:**
    - `test_writes_one_flac_per_sample_and_the_index` (tiny generated WAVs);
    - `test_flac_decodes_to_the_same_samples` (bit-exact round trip);
    - `test_loop_and_credit_are_carried`.
  - [ ] Watch them fail; implement; pass.
  - [ ] Run `make music-library` and commit the 82 FLACs and `library.json`.
  - [ ] **Deploy and serving:**
    - `LIST=1 ./deploy.sh` lists `music/library/library.json` and the FLACs;
    - MusicDeployTest asserts it, and still asserts that `tools/`, `compose/`, `pieces/` and `keys/` never ship.
  - [ ] **nginx and htaccess:** `/music/library/` is served without a session. The other music folders stay denied.

### Task 2: A score that carries its own sound

**Files:**
- Modify:
  - `music/tools/siue_music/score.py` and `games/workroom/src/score.ts` (the same rules, the same order, the same paths)
  - `music/compose/siue_compose/export.py` (write `sound` and `mix`)
  - `music/tools/siue_music/publish.py` (audio and spectrogram are optional for a renderable score)
- Test:
  - `music/tools/tests/test_publish.py`
  - `music/tools/tests/test_parity.py` (a fixture checked by both validators)
  - `games/workroom/test/score.test.ts`
  - `music/compose/tests/test_export.py`

**Interfaces:**
- `lanes[i].sound` is optional: `{"instrument": id in library.json, "gain_db": -40..20, "attack": 0..10, "release": 0..20}`.
- `mix` is optional: `{"style": "lofi", "loudness": -30..-10}`.
- **A renderable score:** every lane has `sound`, and `mix` is present.
- `audio` may be an empty list only when the score is renderable. `spectrogram` may then be absent.
- **Validators get the library's instrument ids as a parameter,** as they get the glossary ids today.
- **Steps:**
  - [ ] **Tests:**
    - a renderable score with `audio: []` is valid;
    - an unknown instrument is refused at `lanes[0].sound.instrument`;
    - a score with no audio and no `sound` is refused at `audio`;
    - `export.score_json` writes `sound` from each `Lane` and `mix`;
    - publish sends `score.json` and `score.musicxml` without audio for a renderable music score.
  - [ ] Fail; implement in Python and TypeScript; pass; run parity.
  - [ ] Confirm `Store.php` already accepts a draft of only `score.json` and `score.musicxml`, with a PHPUnit assertion.

### Task 3: The render core (DOM-free)

**Files:**
- Create:
  - `games/workroom/src/render/plan.ts`
  - `games/workroom/src/render/master.ts`
  - `games/workroom/test/render-plan.test.ts`
  - `games/workroom/test/render-master.test.ts`

**Interfaces:**
- **`plan.ts`:**
  - `voices(score: Score, lib: Library): Voice[]`, where `Voice = { lane, file, rate, at, dur, gain, attack, release, loop: [number, number] | null }`;
  - region choice as `music/compose/siue_compose/sfz.py` `regions` (split halfway between neighbouring roots);
  - `rate = 2 ** ((pitch - root) / 12)`;
  - velocity gain with `amp_veltrack` 80 as sfizz does;
  - same-pitch notes in a lane are already cut by the exporter.
- **`master.ts`:**
  - `reverbIR(seconds, rate, seed): Float32Array[]` (seeded PRNG; the same shape as `render.py` `reverb_ir`);
  - `fold(ch: Float32Array[], length): Float32Array[]`;
  - `pinkHiss(length, rate, seed)`;
  - `loudnessLufs(ch, rate)` (BS.1770 K-weighting with gating);
  - `levelGain(ch, rate, target, peakDb)`;
  - `wav(ch, rate): Uint8Array` (16-bit PCM).
- **Steps:**
  - [ ] **Tests:**
    - region choice matches `sfz.regions` for the harp's real roots;
    - the voice count equals the note count;
    - `rate` of an octave up is 2;
    - fold adds the tail onto the start;
    - LUFS of a 1 kHz sine at -20 dBFS is about -20.6 (±0.3);
    - `wav` header and length are right;
    - the IR decays and is deterministic for a seed.
  - [ ] Fail; implement; pass.

### Task 4: The render engine (Web Audio)

**Files:**
- Create:
  - `games/workroom/src/render/engine.ts`
  - `games/workroom/test/render-engine.test.ts` (a recording fake `OfflineAudioContext`)

**Interfaces:**
- `loadInstruments(lib, ids, fetchBytes, decode): Promise<Map<string, AudioBuffer>>` (cached per page).
- `renderScore(score, lib, deps): Promise<{ channels: Float32Array[]; rate: number }>`. It builds:
  - sources → per-voice envelope `GainNode` → lane gain → the master chain: `WaveShaper` tanh, a wow/flutter `DelayNode` modulated by two `OscillatorNode`s, `BiquadFilterNode` high-pass and two low-passes, and a `ConvolverNode` with `reverbIR` at wet 0.55 beside the dry signal.

  It renders `duration + 6 s`, then in JS: fold, hiss, `levelGain`.
- `deps` injects the context factory, `fetchBytes` and `decode`, for tests.
- **Steps:**
  - [ ] **Tests (fake context):**
    - one source per voice, started at `at` with `playbackRate` = `rate`, `loop` set from the library's loop;
    - the graph reaches the destination through the chain in order;
    - the rendered length is `duration + 6 s`;
    - a failed fetch rejects with a message naming the instrument.
  - [ ] Fail; implement; pass.

### Task 5: The workroom plays, shows and downloads a rendered score

**Files:**
- Modify:
  - `src/ui/Workroom.tsx`, `src/ui/Player.tsx`, `src/ui/SoundPicture.tsx`
  - `src/download.ts` (WAV for a rendered draft)
- Create:
  - `src/render/spectrum.ts` (STFT to an ImageData, log frequency, the score's `low_hz`/`high_hz` or 20–12000)
- Tests:
  - `test/playback.test.ts`, `test/download.test.ts`, `test/render-spectrum.test.ts`, `test/views.test.ts`

**Behaviour:**
- A draft without audio shows "Building the sound…" with a progress line, then plays the rendered WAV from a blob URL.
- Download offers "Audio (WAV)", named `<piece>-v<n>.wav`.
- The Sound picture draws from the rendered audio.
- A failure shows "The sound could not be built: <reason>". There is no Play button then, and the other views still work.
- Drafts with audio files are unchanged.

**Steps:**
- [ ] **Tests:**
  - renders once per draft and caches in memory;
  - a failure message, with Play disabled;
  - the WAV download name;
  - spectrum rows map low to high on a log scale.
- [ ] Fail; implement; build `dist`; pass views, playback, workroom-answer, no-storage, download and console.

### Task 6: A score-only draft end to end, and the listening check

**Files:**
- Modify:
  - `tests/e2e/workroom.local.ts` (a score-only fixture draft)
  - `music/pieces/crete-title/` (`CHANGES` for the next draft)
  - `music/compose/pieces/crete_title.py`

**Steps:**
- [ ] **e2e** (`make music-e2e`, with temporary `E2E_ARGS` as before):
  - publish a score-only fixture against the docker stack;
  - open it, wait for "Building the sound…" to finish, and play;
  - check that `currentTime` advances;
  - download the WAV and check its length is the duration ±20 ms and its seam is continuous;
  - check that the library is served without a session and that `/music/compose/` is still 403.
- [ ] **Listening check:**
  - render `crete-title` v3's score in the browser through the e2e harness, and the container render;
  - compare integrated loudness (±1 LU), and the energy above 8 kHz and in each octave band (±3 dB);
  - record the numbers in the PR.
- [ ] **Publish ready:**
  - `crete-title` v4 is v3's music as a score-only draft (its change list: "Built in your browser from the score; it should sound the same as draft 3");
  - render it with `make music-render PIECE=crete-title VERSION=4` so its score has `sound` and `mix`;
  - give the owner the publish command, so he can compare the two by ear in the workroom.
