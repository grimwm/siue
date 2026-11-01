# Composer 4g: DJ & Effects Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The editor's DJ & Effects: effects placed on a timeline over bars, a live DJ Mode whose performance can land
on that timeline, and the Looper, all saved as `fx_clips` in score schema 2 and rebuilt by the renderer on every play.

**Architecture:** One DOM-free module of effect processors (`src/render/djfx.ts`) works sample by sample on a dry
source buffer it may read anywhere, so the same code makes a clip in the offline render and a held pad in DJ Mode's live
deck. The renderer applies a lane's clips after its Sound settings and the whole piece's clips after the Room. The
editor gains an Effects panel (timeline, clip sheet, What Gets Saved, What A Browser Does Less Well) and a DJ Mode
panel (Platter, Crossfader, Hot Cues, Performance Pads, XY Pad, Looper, Record To Timeline).

**Tech Stack:** TypeScript 7, Preact, Web Audio (ScriptProcessorNode for the live deck), node:test, Python unittest,
PHPUnit, Playwright.

**Spec:** `docs/superpowers/specs/2026-10-31-composer-editor-design.md` (DJ & Effects; Schema 2 `fx_clips`; phase 4g).

## Global Constraints

- All of it is saved as score settings, never audio (spec: "saved as score settings, never audio").
- `fx_clips` is schema 2 and music only; the page, PHP and Python accept it in the same PR.
- A clip names: effect, lane (a lane id, or null for the whole piece), from bar, to bar, and settings.
- Works on instrument and vocal parts alike.
- Performance Pads use keys 1–4, Q–R, A–F and Z–V; several fingers at once.
- The page never scrolls or jumps while a pad, key or the platter is held (scrollpin.ts).
- UI labels in Title Case; sentences in sentence case.
- What A Browser Does Less Well stays visible, with the spec's three lines.

## The score shape

`fx_clips`: up to 256 clips, each
`{ effect, lane: string | null, from_bar, to_bar, settings?, points? }`.
- `from_bar` ≥ 1 and `to_bar` ≤ bars + 1, both bar positions (12.5 is halfway through bar 12), rounded to 1/1000, and
  `to_bar − from_bar` ≥ 1/64.
- `settings` holds only the effect's own keys (table below); a key left out is the effect's default.
- `points`, only on the effects that record moves: 2 to 512 `[bar, value…]` lists, bars non-decreasing within the clip.
  Scratch `[bar, rate −8..8]`; Crossfader `[bar, position 0..1]`; the XY effects `[bar, x 0..1, y 0..1]`.

| effect | settings (default) | points |
|---|---|---|
| scratch | style baby/chirp/transformer (baby) | rate |
| spinback | throw gentle/hard (hard) | |
| tape_stop | time fast/medium/slow (medium) | |
| tape_start | time fast/medium/slow (medium) | |
| vinyl | age 0.2–1 (0.7) | |
| riser | climb 1–3 octaves (2) | |
| snare_roll | level 0.3–1 (0.8) | |
| filter_sweep | mode highpass_up/lowpass_down (highpass_up) | |
| impact | kind impact/downlifter (impact) | |
| sidechain | depth 0–1 (0.95) | |
| stutter | slice 0 (roll down)/4/8/16/32 (16) | |
| trance_gate | pattern classic/offbeat/choppy (classic) | |
| wobble | rate 1–8 per beat (2), depth 0–1 (0.8) | x rate, y depth |
| tremolo | rate 4/8/12 per bar (8) | |
| auto_pan | speed bar/half_bar/beat (half_bar) | |
| bitcrusher | crunch 0.1–1 (0.6) | x crunch, y rate drop |
| ring_mod | tone 60–1500 Hz (330) | |
| phaser | speed slow/medium/fast (medium) | |
| flanger | speed slow/jet/fast (jet) | x mix, y speed |
| auto_wah | sensitivity 0–1 (0.5) | |
| rotary | speed slow/fast (fast) | |
| echo_out | time dotted_eighth/quarter/half (dotted_eighth) | |
| ping_pong | time eighth/dotted_eighth/quarter (dotted_eighth) | x amount, y feedback |
| reverse | length beat/two_beats/bar (bar) | |
| reverse_reverb | swell short/long (long) | |
| granular_freeze | mode freeze/stretch (freeze) | |
| wide_8d | circle four_bars/two_bars/bar (two_bars) | |
| doppler | none | |
| filter | cutoff 0–1 (0.5), resonance 0–1 (0.3) | x cutoff, y resonance |
| pitch_shift | semitones −12..12 (12), formant −12..12 (0) | |
| harmonizer | voices (third, fifth), mix 0–1 (0.5) | |
| vocoder | carrier (a lane id, needed), bands 8–32 (16) | |
| autotune | strength 0–1 (1), retune_ms 0–400 (20) | |
| crossfader | a, b: lane ids (needed, apart, not empty) | position |
| hot_cue | cue_bar (needed, ≥ 1, < bars + 1) | |
| looper | bars: 1–4 source bars (needed), mute_deck (false) | |

A lane clip of vocoder needs a carrier other than its lane; crossfader and looper are whole-piece clips (lane null).

## Review Focus

1. A clip past the piece's end, a to_bar before from_bar, or a lane id that is not a lane: refused naming its path.
2. A clip on a vocal part: the effect applies to the voice as it does to an instrument.
3. Two clips overlapping on one target: both apply, in the order they start, and neither clicks at its edges.
4. Releasing a pad while another is held, or a key held while the window loses focus: the effect stops, nothing sticks.
5. A piece saved with no clips stays schema 1 (if nothing else needs 2); Undo removes a recorded performance in one step.

---

### Task 1: The schema in the page, Python and the vectors

**Files:** Modify `games/workroom/src/score.ts`, `music/tools/siue_music/score.py`,
`music/tools/siue_music/studio_mcp.py` (instructions). Create `games/workroom/test/fixtures/fxclips-vectors.json`,
`games/workroom/test/fxclips.test.ts`, `music/tools/tests/test_fxclips.py`. Test PHP save in
`tests/php/MusicSaveDraftTest.php`.

**Interfaces:** Produces `FxClip`, `FX_CLIP_EFFECTS`, `Score.fx_clips?`, `barSeconds(tempo, bar)` (score.ts) and
`bar_seconds(tempo, bar)` (score.py), equal on the vectors.

- [ ] Vectors: one valid schema 2 score holding a clip of every effect (lane and whole piece, a vocal lane, points of
  each arity), 20+ broken cases with the page's error path, and `[bar, seconds]` pairs through a tempo change.
- [ ] Failing tests in both languages read the file; run `node --test test/fxclips.test.ts` and
  `python3 -m unittest test_fxclips` → FAIL.
- [ ] Implement the rules above in both; `needsSchema2` counts `fx_clips`; run both → PASS.
- [ ] PHPUnit: a save-draft with `fx_clips` is accepted.
- [ ] Commit.

### Task 2: The effect processors

**Files:** Create `games/workroom/src/render/djfx.ts`, `games/workroom/test/render-djfx.test.ts`.

**Interfaces:** `makeClip(clip: FxClip, env: ClipEnv): ClipProc` where `ClipProc = { start; end; tail; tick(i, x) }`
works on one sample of a stereo pair `x`; `applyClips(ch, clips, env)` runs every clip over a buffer in start order.

- [ ] A test per effect measuring its name on a rendered test signal (a tape stop's pitch falls and ends silent; a
  stutter repeats its first slice; a reverse plays the bar backwards; a riser's high-band energy climbs; a gate's
  pattern shows in its envelope; Wide / 8D moves level between the sides; a hot cue plays its cue bar; a looper repeats
  its bar and mutes the deck; …), plus "outside a clip the sound is untouched" and "no click at a clip's edges".
- [ ] Run → FAIL; implement; run → PASS; commit.

### Task 3: The renderer plays clips

**Files:** Modify `games/workroom/src/render/engine.ts`; test in `games/workroom/test/render-engine.test.ts`.

- [ ] Lane clips after the lane's Sound settings; whole-piece clips on the bus after the Room; Crossfader as lane
  gains; vocoder clips get their carrier. `usesSound` counts clips. Tests with the fake context; commit.

### Task 4: The Effects panel (Way One)

**Files:** Create `src/compose/djclips.ts` (edits: place, move, lengthen, shorter, longer, remove, settings) and
`src/compose/djcatalogue.ts` (families, Title Case names, choices); `src/ui/compose/EffectsPanel.tsx`; wire into
`Composer.tsx`, `doc.ts` (EditDoc.fxClips round trip).

- [ ] Unit tests for the edits and the doc round trip; the panel: families, tap an effect then a bar, drag a clip, its
  right edge, the clip sheet (bars, Hear From Here, Shorter, Longer, Remove, its settings), What Gets Saved, What A
  Browser Does Less Well. Undo covers each edit. Commit.

### Task 5: DJ Mode (Way Two) and Record To Timeline

**Files:** Create `src/compose/djlive.ts` (the deck and the recorder, DOM-free core), `src/ui/compose/DjMode.tsx`.

- [ ] The deck plays the piece rendered once, through the same processors live; Platter, Crossfader, Hot Cues, 16
  Performance Pads (keys), XY Pad (Filter, Echo, Crush, Flanger, Wobble), Looper (Record 1 Bar, Layer, Mute Deck,
  Clear); several fingers at once; Record To Timeline lands clips (pads, cues, loops) and moves (platter, fader, XY) as
  points, quantised as the design page does, in one Undo step. The scroll pin holds while anything is held. Unit tests
  for the recorder; commit.

### Task 6: e2e, the owner page, the PR

- [ ] `tests/e2e/compose.local.ts`: place a clip by tap, lengthen and remove it, save and reload it; DJ Mode with keys
  and touch pads under Record To Timeline lands clips, Undo removes them; the page does not move while a pad is held;
  phone and desktop.
- [ ] Rebuild `dist/`; full local checks; PR; pr-fix-loop; merge on green; owner page with before/after clips.
