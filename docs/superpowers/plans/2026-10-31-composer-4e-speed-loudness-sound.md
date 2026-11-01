# Composer 4e: Speed, Loudness, Sound and Voice Effects Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Score schema 2 and the editor's Speed, Loudness, Sound and Voice Effects panels, heard through the page's renderer.

**Architecture:** Notes stay in seconds in the score, so every reader of schema 1 (bar times, sheet music, export,
the Python validator) keeps working. The tempo line (`piece_tempo`) is the editor's intent, and the step `tempo`
list is written from it a bar at a time. A part's speed is a retime of its notes, done in the editor. Loudness lines
and bends are applied by the renderer, the same way in TypeScript and in Python, checked by shared vectors. Sound,
Room, the limiter and Voice Effects are nodes and buffer passes in the browser renderer, and are saved only as score
settings. Live microphone effects run in a real-time context in the page.

**Tech Stack:** TypeScript 7, Preact, Web Audio (OfflineAudioContext, BiquadFilter, DynamicsCompressor, Convolver,
ScriptProcessor for live mic), node:test; Python 3 (siue_music) with pytest; PHP 8.4 (DraftCheck) with PHPUnit;
Playwright e2e (`make music-e2e`).

**Spec:** `docs/superpowers/specs/2026-10-31-composer-editor-design.md` (Speed and loudness, Sound, Voice Effects,
The score, Phases 4e).

Shipped as two pull requests: **Part A** (Tasks 1–5: schema 2, tempo line, part speed, loudness, bends) and
**Part B** (Tasks 6–10: Sound, Room, limiter, Voice Effects).

## Global Constraints

- Every button, menu, tab and heading in Title Case; sentences in sentence case.
- The page never scrolls or jumps while a key or note is held (`scrollpin.ts` stays in force).
- Phone (about 400 px) and desktop layouts both work.
- Schema 1 scores still load, play and save; a schema 1 score with no schema 2 field is saved as schema 1.
- The page (`score.ts`), PHP (`DraftCheck`) and Python (`siue_music/score.py`) accept schema 2 in the same PR.
- Nothing but score settings is saved for Sound and Voice Effects: no audio is stored.
- A live microphone is asked for only when a mic button is tapped, and its audio never leaves the page.
- Loudness marks: Very Soft pp 32, Soft p 48, Fairly Soft mp 64, Fairly Loud mf 80, Loud f 100, Very Loud ff 120.
- Speed presets: Slow 66, Walking 92, Quick 128 BPM; part ratios ½×, ⅔×, 1×, 1½×, 2×.
- Room presets: Dry, Small Room, Concert Hall, Cathedral, Cave.
- `lane.voice`: at most 4 effects, in order; settings ranges exactly as the spec's score section lists.

## The schema 2 fields

All optional; any of them makes the score schema 2, and schema 1 refuses them ("needs schema 2").

| Field | Shape |
|---|---|
| `piece_tempo` (music) | list ≥ 1 of `{bar 1..bars, bpm 20..400, shape steady\|slow_down\|speed_up}`; first at bar 1, bars increase; the last is steady; slow_down needs the next mark slower, speed_up faster. The step `tempo` must give, at every bar, the line's BPM (a ramp moves linearly by bar, rounded to 0.01). |
| `lane.speed` | `"follow"`, `{ratio: ½, ⅔ (0.666667), 1, 1.5 or 2}` or `{bpm: 20..400}` |
| `lane.dynamics` (music) | list ≥ 1 of `{bar 1..bars, level 32\|48\|64\|80\|100\|120, shape steady\|louder\|softer}`; first at bar 1, bars increase, last steady; louder needs the next mark louder, softer softer |
| `note.bend` | list of 2..64 `[seconds from the note's start, cents]`, times from 0, increasing, within the note; cents −1200..1200 |
| `lane.fx` | `{volume_db −60..12, pan −1..1, eq {bass, middle, treble −12..12}, echo {amount 0..1, repeats 1..8, beats 0.25..2}, shimmer 0..1, warmth 0..1, brightness {cutoff 0..1, sweep off\|slow\|fast}, even_out 0..1, room 0..1, mute bool, solo bool}`, every key optional |
| `mix.room` | `{preset dry\|small_room\|concert_hall\|cathedral\|cave, amount 0..1}` |
| `mix.limiter` | `{on bool, ceiling_db −12..0}` |
| `lane.voice` | list ≤ 4 of `{effect, …settings}` as the spec lists; `carrier` names another lane |

**Renderer rules shared by TypeScript and Python** (`test/fixtures/schema2-vectors.json`, read by both):
- A note's loudness level is the lane's line at the note's start: a steady mark holds; louder/softer move linearly in
  seconds from the mark's bar start to the next mark's bar start. Effective velocity =
  `clamp(round(velocity × level / 80), 1, 127)`. No line: the note's own velocity.
- A bend multiplies the voice's playback rate by `2^(cents/1200)`, linear between points, held after the last.

## Review Focus

1. A schema 1 draft opened and saved without touching Speed or Loudness stays schema 1, byte for byte in its fields.
2. Changing the piece's speed moves Follow and Ratio parts but leaves an Own BPM part where it sounds (in seconds).
3. A tempo ramp across a bar line: the step `tempo` and `piece_tempo` agree, and the validator says why when they do not.
4. A bend on a note shortened by Tidy To keeps only the points inside the note, at most 64.
5. A live mic effect stops the mic (the track ends) when the panel closes, the page hides or another effect starts.

---

## Part A

### Task 1: Schema 2 in the page's validator

**Files:** Modify `games/workroom/src/score.ts`; Test `games/workroom/test/score2.test.ts`; Create
`games/workroom/test/fixtures/schema2-vectors.json`.

**Interfaces — Produces:** `SCHEMAS = [1, 2]`; types `TempoMark {bar,bpm,shape}`, `Speed = 'follow' | {ratio} | {bpm}`,
`DynMark {bar,level,shape}`, `LaneFx`, `Room`, `Limiter`, `VoiceFx`; `Score.schema: 1 | 2`,
`Score.piece_tempo?`, `Lane.speed?`, `Lane.dynamics?`, `Lane.fx?`, `Lane.voice?`, `ScoreNote.bend?`, `Mix.room?`,
`Mix.limiter?`; `tempoLineBpm(marks, bar): number`; `needsSchema2(score): boolean`.

- [ ] Tests: a schema 2 score with every field parses; each field broken in turn fails with its path; schema 1 with
  a schema 2 field fails "needs schema 2"; `piece_tempo` disagreeing with `tempo` at a bar fails naming the bar;
  `tempoLineBpm` on a speed_up from 92 at bar 1 to 128 at bar 5 gives 101, 110, 119 at bars 2–4.
- [ ] Run `node --test test/score2.test.ts` (from games/workroom): FAIL.
- [ ] Implement in `score.ts`.
- [ ] Run again: PASS; `node --test test/score.test.ts` still PASS.
- [ ] Commit.

### Task 2: Schema 2 in PHP and Python, and the MCP's words

**Files:** Modify `music/lib/DraftCheck.php`, `music/tools/siue_music/score.py`, `studio.py`, `studio_mcp.py`;
Test `tests/php/MusicSaveDraftTest.php` (one case), `music/tools/tests/test_score2.py`.

- [ ] Tests: Python accepts and refuses the same fixtures as Task 1 with the same paths (the fixture file lists each
  case and its expected error path); PHP keeps a schema 2 score through save-draft and refuses schema 3.
- [ ] Run pytest and PHPUnit for those: FAIL. Implement. Run: PASS. Commit.

### Task 3: The tempo line and part speeds in the editor

**Files:** Create `games/workroom/src/compose/speed.ts`, `src/ui/compose/SpeedPanel.tsx`; Modify `compose/doc.ts`,
`ui/compose/Composer.tsx`; Test `test/compose-speed.test.ts`.

**Interfaces — Produces:** `stepTempo(marks, meter: Tempo[], bars): Tempo[]`;
`retimePart(part, from: Speed, to: Speed, clock): Part`; `retimeForTempo(doc, nextMarks): EditDoc`;
`EditDoc.tempoLine: TempoMark[] | null`; `Part.speed: Speed`.

- [ ] Tests: step tempo from a ramp; a 2× part's notes halve their beats; Own BPM part keeps seconds when the
  piece's speed changes; a schema 1 doc round-trips to schema 1; a doc with a line saves schema 2 whose `tempo`
  passes the validator.
- [ ] FAIL, implement, PASS, commit.

### Task 4: Loudness lines

**Files:** Create `games/workroom/src/compose/loudness.ts`, `src/ui/compose/LoudnessPanel.tsx`; Modify
`render/plan.ts`, `compose/doc.ts`, `Composer.tsx`; Python `music/tools/siue_music/score.py` (`effective_velocity`);
Tests `test/render-plan.test.ts` (vectors), `music/tools/tests/test_score2.py` (vectors).

**Interfaces — Produces:** `levelAt(marks, seconds, barStart): number`, `effectiveVelocity(v, level): number`;
`Voice.gain` uses the effective velocity.

- [ ] Tests: the shared vectors give the same effective velocities in both languages; a lane with no line is
  unchanged. FAIL, implement, PASS, commit.

### Task 5: Exact Pitch bends saved and played

**Files:** Modify `compose/hum.ts` (`thinBend`), `compose/doc.ts` (`EditNote.bend`), `render/plan.ts`
(`Voice.bend`), `render/engine.ts` (playbackRate automation), Python `bend_rate_at`; e2e `tests/e2e/compose.local.ts`.

- [ ] Tests: `thinBend` keeps ≤ 64 points within the note, the ends kept; the engine's fake context records the
  rate ramps; the vectors' bend rates match in Python; e2e: Speed panel ramp, Loudness mark, Hum Exact Pitch, Save
  Draft, and the saved score is schema 2 with all three; the page does not move while a key is held.
- [ ] FAIL, implement, PASS, commit. Open Part A's PR.

## Part B

### Task 6: The Sound panel's settings in the document

**Files:** Create `compose/sound.ts`, `ui/compose/SoundPanel.tsx`; Modify `doc.ts`, `Composer.tsx`.
- [ ] Tests: defaults leave `lane.fx` out; a changed setting saves it; What The Score Saves shows the JSON.

### Task 7: Part effects in the renderer

**Files:** Modify `render/engine.ts`; Create `render/fx.ts`; Test `test/render-fx.test.ts` (offline render with
a pure-JS context in the test, measuring band energy, pan balance, echo repeats, drive harmonics, filter cutoff,
compressor range, mute and solo).

### Task 8: Room and the limiter

**Files:** `render/room.ts` (impulse responses made from seeded noise per preset), `render/limiter.ts`; Tests:
reverb tail length per preset rises Dry < Small Room < Concert Hall < Cathedral < Cave; limiter output peak ≤ ceiling.

### Task 9: Voice Effects on a part and on the live mic

**Files:** `render/voice.ts` (vocoder, autotune using `compose/pitch.ts`, harmonizer, pitch shift with formant,
talk box, robot, whisper as buffer passes), `compose/livemic.ts`, `ui/compose/VoicePanel.tsx`.
Tests: each effect's measured change (autotune moves a 50-cent-flat tone to within 10 cents at Hard; pitch shift
+12 doubles the tracked pitch; vocoder output follows the modulator's envelope; robot flattens pitch movement;
whisper lowers the harmonic-to-noise ratio); the live mic stops its tracks on close.

### Task 10: e2e and the owner's page

- [ ] e2e: Sound panel changes saved; Room preset saved; a Voice effect on a part saved; mic button with a fake
  stream starts and stops. Owner artifact with screenshots and before/after audio. Open Part B's PR.
