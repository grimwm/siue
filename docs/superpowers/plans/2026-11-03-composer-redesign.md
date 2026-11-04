# Composer Redesign Implementation Plan (2 PRs)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The composer in the music workroom (`websites/www.cs/games/workroom/`) rebuilt around the owner-approved
prototype: a transport bar on top, one left-to-right timeline (sections, ruler, Effects lane, tracks) on one scale,
tracks that open in place as a piano roll or a step sequencer, regions, note tools and effects placed by dragging; then
the Mix view, Sheet on the shared scale, song settings, Colors and Style, and Start A Song.

**Architecture:** The editing rules stay DOM-free in `src/compose/` (pure functions from one `EditDoc` to the next, the
`history.ts` Undo stack over them), with new modules for regions, sections, note tools, chords, Type Notes, effect
placement, mutes and the playhead's follow. The UI is split out of the 900-line `Composer.tsx` into a transport, the
arrangement (`Arrange.tsx`) and its rows. Sound stays the real sample renderer (`render/`), played as a rendered file,
with the loop crossfade of PR #292 and Hear's one-press start; the playhead is drawn from the audio clock straight into
the DOM, never through Preact state.

**Tech Stack:** TypeScript 7, Preact, Web Audio, node:test with the DOM stub, Python unittest (the MCP's validator),
PHPUnit, Playwright (`make music-e2e`).

**Design sources:** the owner's decisions (memory `composer-redesign-decisions.md`, 2026-11-02 and 11-03), the
prototype (`composer-prototype.html`, v12 to v15 screenshots) and its audit notes; the spec
`docs/superpowers/specs/2026-10-31-composer-editor-design.md` for everything the redesign keeps.

## Global constraints

- Phone first: 360 to 412 px wide with no sideways page scroll, nothing crowding, nothing past the track-header column.
  It must also look right at 1280 to 1440 px.
- Every recorded instrument (27, VSCO-2 CE and VCSL) and every DJ effect (36 in 7 families, `djcatalogue.ts`) with its
  settings stays; so do Vocal Tracks, Hum, Step, Play Live and Play Along, Your Keyboard, import, export and Save Draft.
- Buttons, menus, tabs and headings in Title Case; sentences in sentence case. The page never mentions make, the
  repository or password managers.
- Nothing scrolls or jumps while a key, a pad or a note is held (`scrollpin.ts`).
- Saved pieces keep opening. Every new score field is optional, schema 2, music only, and accepted by the page's
  validator (`score.ts`), the MCP's (`music/tools/siue_music/score.py`) and the PHP draft check in the same PR.
- No Solo: Mute All, Unmute All and one mute per track, with the status line in the owner's words.

## The split

The prototype's own audit suggested this split, and it holds: PR 1 changes how a person composes (layout, timeline,
editing, effects placement); PR 2 changes how they mix, read and start a song. PR 1 keeps today's Mix-like panels
(Sound, Speed And Loudness, DJ Mode, the effects' full settings) reachable in the Mix view unchanged, so nothing is lost
between the two PRs, and today's Sheet Music (one part, engraved) in the Sheet view.

| | PR 1: layout and timeline | PR 2: Mix, Sheet and Start A Song |
|---|---|---|
| Transport | Play/Stop (Space), Back To Start, Loop, tempo − / BPM / +, Bar · Beat · time readout, Undo, Redo, Compose / Mix / Sheet, a Piece menu (Save Draft, Import, Export) | Metronome and count-in, Song menu, Start A Song, Colors And Style |
| Timeline | sections lane, ruler (cursor, loop range, markers), Effects lane, tracks, one scale and scroll, zoom | tempo-change marks on the ruler |
| Tracks | grip, caret, instrument tile = track menu (rename, duplicate, change instrument, clear, remove), name, mute speaker; all collapsed on load; Expand All, Collapse All; Mute All, Unmute All and the status line | Mix strips |
| Editing | piano roll (two octaves, sticky keys, fit-to-width bars, key shading), step sequencer, regions, note tools, Type Notes, chord helper, action bar; Play Live, Step, Hum and Your Keyboard in a Record drawer; Vocal Tracks in place | — |
| Effects | the palette (all 36, by family, each with Hear), drag or tap to place, the hover ghost, the flash; own-sound effects on the Effects lane; track effects as ramps or blocks on their tracks with their settings; fades that hold | the effects list in Mix, DJ decks and the crossfader redesigned |
| Mix view | today's Sound, Speed And Loudness and DJ Mode panels for the open track | per-track volume, pan, echo, room; decks; effects list |
| Sheet view | today's Sheet Music of the open track, with the playhead's bar | the shared scale, every track |
| Song | — | time signature, tempo changes, add and remove bars, count-in, metronome |
| Looks | today's theme | Colors and Style pickers (Tape & Valve dark default, Original button sizes) |
| Start | the empty song's Add Instrument | Start A Song templates, the Try It coach, screenshots and READMEs |

## What the prototype maps onto

| Prototype | Real code |
|---|---|
| `S.tracks[]` with `inst`, `notes[{s,l,p,v}]`, `regions` | `EditDoc.parts[]` (`compose/doc.ts`): `instrument`, `notes[{start,length,pitch,velocity}]` in beats, new `regions` |
| sixteenth-note steps `s` | beats (`compose/beats.ts`), so every meter and tempo change keeps working |
| 13 synth stand-ins and `preview()` | the 27-instrument library (`catalogue.ts`), the live sampler (`compose/sampler.ts`) for notes and Hear |
| the lookahead scheduler | the real renderer (`render/engine.ts` via `buildSound`), played as a file in an `<audio>` element; Loop jumps the element back at the loop's end |
| `S.fx` (riser, hit, sweep, xfade) | `EditDoc.fxClips` (`FxClip`, `compose/djclips.ts`) with all 36 effects |
| riser / drop hit on the lane | own-sound effects on the Effects lane: Riser, Snare Roll, Impact, Vinyl Crackle And Wow (lane null) |
| sweep / crossfade ramps on tracks | every effect that changes a track's sound, drawn on that track: Filter Sweep as a ramp, Crossfader as a ramp down on its Fade Out tracks and up on its Fade In tracks, the rest as blocks; dropped on the Effects row, a track effect is the whole song and shows on every track |
| crossfade `out`, `in`, `silent`, holding levels | Crossfader settings `a` (Fade Out), `b` (Fade In, may be empty), new `fade: true` and `silent`, rendered by a per-lane gain that ramps and holds (`render/djfx.ts`) |
| `t.mute` | `LaneFx.mute` (already saved); Solo is never shown, and old solos are cleared on the first mute change |
| `S.sections` | `Score.sections` (already saved; they tile the piece, so the editor's sections tile it too: adding one cuts the one it lands in, removing one gives its bars to its neighbour) |
| `S.markers`, `S.key` | new `markers` and `key` (schema 2) |
| `S.loopRange` | the composer's state, not saved |
| `t.regions` | new `lanes[].regions` (schema 2); notes of a looped region are saved with their repeats as real notes |
| `t.low` (two-octave window) | the composer's state per track, opening on the track's notes or the instrument's home |

## Files

PR 1 (this plan's first half):

- `src/compose/doc.ts`: `Region`, `EditSection`, markers, key; read and write `regions`, `markers`, `key`,
  `sections`; old pieces get regions on opening.
- New DOM-free modules, each with its own `test/compose-*.test.ts`: `regions.ts` (fit, split, join, move, duplicate,
  copy and paste, loop, delete), `sections.ts` (tiling, add, rename, remove, move and duplicate with every timed thing
  remapped), `notetools.ts` (box-select, transpose, shift, duplicate, Fix Timing, loudness, copy and paste),
  `chords.ts`, `typenotes.ts`, `placement.ts` (where an effect lands, what each row draws), `mutes.ts`, `follow.ts`.
- `src/score.ts`, `music/tools/siue_music/score.py`, the shared vectors: the new fields and the crossfader's `fade`,
  `silent` and empty `b`. `music/lib/DraftCheck.php` reads only what it needs and keeps working (PHPUnit unchanged).
- `src/render/djfx.ts`, `render/engine.ts`, `compose/djclips.ts`: fades that ramp and hold.
- `src/ui/compose/Composer.tsx` keeps the state, the sound, saving and files; new `Transport.tsx`, `Arrange.tsx`
  (shared scale and scroll, sections, ruler, Effects lane, rows, the playhead), `TrackHead.tsx`, `PianoRoll.tsx`
  (replaces `EditGrid.tsx` in Compose), `StepGrid.tsx`, `FxPalette.tsx`, `ActionBar.tsx`, `Pop.tsx` (a popover, a
  sheet on a phone), `RecordDrawer.tsx` (Play Live, Step, Hum, the keyboard, Your Keyboard). `EffectsPanel.tsx` keeps
  only its clip settings (`ClipSheet`), shown for a picked clip.
- `src/ui/compose/compose.css` or the workroom's `app.css`: the timeline's layout (sticky header column, rows).
- `tests/e2e/compose.local.ts` rewritten for the new UI; `test/compose-view.test.ts` for the shell.
- The spec's Views and DJ & Effects sections, the workroom and music READMEs: current state only.

## PR 1 tasks

- [ ] 1. Model and schema (subagent): the modules above, test first; migration tests: an old schema 1 score and an
  old schema 2 score open with regions and the same notes; a new piece round-trips; edited loop repeats open unlooped;
  TS and Python agree on the new vectors.
- [ ] 2. Fades that hold (subagent): `fadeGains` in `djfx.ts`, used by `engine.ts`; `savedClips` keeps a fade with an
  empty Fade In side; non-fade crossfaders unchanged.
- [ ] 3. Transport: Play/Stop, Space, Back To Start, Loop, tempo, readout, Undo/Redo, modes, Piece menu, "Getting
  Ready…" beside Play. The playhead and readout are written by a requestAnimationFrame loop into refs; Composer never
  re-renders per frame.
- [ ] 4. Arrange: the shared scale (`pxPerBeat` fitting the bars to the width, zoom − / +), one horizontal scroll,
  the sticky header column (108 px on a phone, 176 px wide), sections lane, ruler, Effects lane, track rows, Add
  Instrument, the playhead following centred.
- [ ] 5. Track headers and the track menu; Expand All, Collapse All, Mute All, Unmute All, the status line.
- [ ] 6. Piano roll and step sequencer in place; regions strip; note tools; Type Notes; chords; action bar.
- [ ] 7. Effects: palette with Hear (a short demo rendered by the real renderer, playable over the song), drag and
  tap to place with the ghost, the flash; lane blocks; track ramps and blocks; the picked clip's settings.
- [ ] 8. Record drawer, Vocal Tracks, Mix and Sheet views hosting today's panels.
- [ ] 9. e2e rewrite, screenshots at 390 and 1440, docs.

## PR 2 tasks (later)

- [ ] Mix view: a strip per track (Volume, Left/Right, Echo, Room, mute, live level), Sound behind More; DJ decks and
  the crossfader with Put A Crossfade On The Timeline; the effects list with Show On Timeline; the whole song's volume
  and limiter.
- [ ] Sheet on the shared scale, every track, note names, the playhead following centred.
- [ ] Song: time signature (4/4, 3/4, 6/8), tempo changes on the ruler, add or remove bars, count-in, metronome (clicks
  on the AudioContext clock).
- [ ] Colors and Style as two pickers, remembered on the device; Tape & Valve dark by default; Original button sizes
  in every style.
- [ ] Start A Song: templates as starting documents (`newpiece.ts`), the Try It coach, the screenshots, share images
  and READMEs.

## Data migration

- Reading: `docFromScore` gives an old piece (no `regions`) one region per run of bars holding notes; a piece without
  `markers`, `key` or editor sections opens without them. Old crossfaders (no `fade`) play as they did.
- Writing: a piece is schema 1 until it uses a schema 2 field; regions are schema 2, so a piece with notes is now saved
  as schema 2. Pages from before this PR are replaced by the deploy, and the MCP's validator accepts the same fields.
- Loops: the saved notes include every repeat, so anything that reads notes (the renderer, the piece page, MusicXML,
  MIDI, the AI) hears the loop without knowing about regions.
