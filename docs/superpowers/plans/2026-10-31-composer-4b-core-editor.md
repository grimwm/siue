# Composer 4b: The Core Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A studio user opens Compose on a music piece (or New Piece on the pieces page), builds parts from the
catalogue, enters notes by Play Live, Step or Grid (chords in every mode), edits them with select, delete, Undo and
Redo, hears the part alone or with the piece, and saves the result as the piece's next draft.

**Architecture:** The editor works on an `EditDoc` whose notes are in beats (the tempo's own beat), turned from and back
into a schema-1 score at the edges (`compose/doc.ts`). Every edit is a pure function of the document, kept in an undo
history (`compose/history.ts`). Play Live, Step and Grid are DOM-free state machines (`compose/live.ts`, `step.ts`,
`grid.ts`) that the Preact view (`ui/compose/`) drives. Notes sound at once through a live sampler on the shared library
(`compose/sampler.ts`). Hearing the piece uses the page's own renderer, so it sounds as the saved draft will. Saving posts a
SIUED1 bundle holding only `score.json` to a new session route, `save-draft.php`.

**Tech Stack:** Preact + TypeScript (games/workroom, bundled by `_kit/build`), Tailwind tokens, Web Audio, PHP 8.4
(`music/lib`), node:test, PHPUnit, Playwright (`make music-e2e`).

**Spec:** `docs/superpowers/specs/2026-10-31-composer-editor-design.md` (phase 4b).

## Global Constraints

- Every button, menu, tab and heading is Title Case ("Save Draft", "Play Live"); sentences stay sentence case.
- The editor never blocks, refuses or moves a note: normal range plain, expert-only amber, beyond expert red.
  "Move Them Into Range" is the only thing that moves notes (by octaves, undoable).
- While any key, pad or note is held the page never scrolls or jumps: fixed-height readouts, `overflow-anchor: none`,
  scroll position pinned while held. On phones too.
- Undo/Redo cover every edit (notes, Clear, part add/rename/recolour/remove/instrument). Ctrl/⌘+Z, Ctrl/⌘+Shift+Z.
- A saved score is renderable schema 1: a sound on every lane, a mix, `audio: []`, `musicxml: "score.musicxml"` (the
  score-only convention), at most 16 lanes and 20,000 notes, and passes `parseScore`, `ScoreRules` and `score.py`.
- `save-draft.php` takes only `score.json` for every account, the session and its CSRF token; an AI key never reaches it.
- Written transposition: `written = sounding + entry.written` (Double Bass +12, Piccolo/Celesta/Xylophone −12,
  Glockenspiel −24). The grid shows sounding pitch names; the written name is shown beside the instrument.
- No new browser storage. Phone (400 px) and desktop layouts.

## Review Focus

1. A piece the AI wrote (tempo changes, motifs, sections, glossary, changes, audio files) opens, is edited and saves
   without losing motifs/sections/changes or failing validation — `doc.test.ts` round-trips the full fixture.
2. Two keys pressed together in Play Live or Step land as one chord, even when released at different times —
   `live.test.ts` / `step.test.ts` chord tests.
3. A save that loses the race (another draft saved meanwhile) or passes the studio limit keeps the edit in the page
   and says why — `save.test.ts`, PHPUnit `SaveDraftTest`.
4. Holding a key while the readout grows never moves the page — `scrollpin.test.ts` and the e2e phone check.
5. Drums: a drum part's rows are its pieces only, and a note on another key is red, never dropped — `grid.test.ts`.

---

### Task 1: Server routes — save-draft.php, compose.php, the sheet flag, links

**Files:**
- Create: `websites/www.cs/music/lib/DraftCheck.php` (parseBundle + checkFiles moved out of `Api.php`)
- Create: `websites/www.cs/music/save-draft.php`, `websites/www.cs/music/compose.php`
- Modify: `music/lib/Api.php`, `music/lib/Pages.php`, `music/lib/Store.php` (`hasDraftFile`)
- Test: `websites/www.cs/tests/php/SaveDraftTest.php`

**Interfaces:**
- Produces: `POST save-draft.php?piece=&version=` (X-CSRF, body SIUED1 with exactly `score.json`): 201
  `{piece, version, csrf}`; 409 `{error:"stale", latest, csrf}` when `version` is not the latest + 1 (1 for a new
  piece); 409 `exists`; 413 `{error:"over_quota", room, message, csrf}`; 422 `{error, csrf}` for `bad_bundle`,
  `score_only`, `bad_score`, `unknown_instrument`, `too_many_notes`, `too_many_lanes`, `too_large`.
- Produces: `GET compose.php?id=<piece>[&v=]` shell with `data-view="compose"`; `GET compose.php` (no id) the New Piece
  shell with `data-pieces` (JSON list of the studio's piece ids) and `data-projects` (JSON `[{id,name}]`).
- Produces: `drafts.php` rows gain `sheet: bool` (a `score.musicxml` is stored).
- Produces: the piece page header links "Compose" (music pieces only); the pieces page and Your studio link "New Piece".

- [ ] Write `SaveDraftTest`: new piece v1 → 201; v3 when latest is 1 → 409 stale latest 1; a bundle with
  `score.musicxml` → 422 score_only even for the owner; over the room → 413 over_quota with message; no CSRF → 403;
  signed out → 401; `drafts.php` says `sheet:false` for it and `sheet:true` for a draft published with MusicXML.
- [ ] Run `make test` PHP step on that file — FAIL (no route).
- [ ] Move `parseBundle`/`checkFiles`/`isRenderable` to `DraftCheck` (static, `$scoreOnly` passed in); `Api` calls it.
- [ ] Add `Pages::saveDraft`, `Pages::compose`, the links, `Store::hasDraftFile`, the two route files.
- [ ] PHPUnit green; commit.

### Task 2: The document model — beats, doc ⇄ score, new piece

**Files:** Create `games/workroom/src/compose/beats.ts`, `compose/doc.ts`; Test `test/compose-doc.test.ts`

**Interfaces:**
- `beatClock(tempo: Tempo[], bars: number): { seconds(beat): number; beat(seconds): number; barStartBeat(bar): number; barOfBeat(beat): number; beatsInBar(bar): number; quarter(bar): number }`
  — a "beat" is the tempo's beat (`unit`); `quarter(bar)` is the beats in a quarter note (`unit / 4`).
- `EditNote { id: number; start: number; length: number; pitch: number; velocity: number; motif: string | null }` (beats)
- `Part { id; name; color; family: Family; icon: Family; instrument: string; gain_db; attack; release; notes: EditNote[] }`
- `EditDoc { title: string; tempo: Tempo[]; bars: number; parts: Part[]; base: Score | null; nextId: number }`
- `docFromScore(score: Score): EditDoc`, `newDoc(title: string): EditDoc` (92 BPM, 4/4, 4 bars, no parts),
  `scoreFromDoc(doc, at: { piece: {id,title}; project: {id,name}; draft: number; made: string }): Score`.

- [ ] Tests: the full fixture `score-v1.json` round-trips (notes' seconds within 1e-6, motifs, sections, characters,
  changes, glossary kept) and the result passes `parseScore`; a doc whose notes run past the last bar grows `bars`
  and extends the last section; bars never shrink below the base; a removed lane's motif spans and change lanes go;
  `audio` becomes `[]`, `spectrogram` goes, `mix` kept or `{lofi, -20}`; a new doc with one part saves and parses;
  6/8 at unit 8: `quarter` is 2 beats; tempo change at bar 3 maps beats to seconds piecewise.
- [ ] Implement; green; commit.

### Task 3: Edits and history

**Files:** Create `compose/edit.ts`, `compose/history.ts`; Test `test/compose-edit.test.ts`

**Interfaces:**
- `createHistory<T>(first: T): { now(): T; push(next: T): void; undo(): T; redo(): T; undoCount(): number; redoCount(): number }`
- `edit.ts` (all pure, `EditDoc → EditDoc`): `addNotes(doc, part, notes: Omit<EditNote,'id'>[])`,
  `removeNotes(doc, part, ids)`, `moveNote(doc, part, id, start, pitch)`, `resizeNote(doc, part, id, length)`,
  `clearPart`, `addPart(doc, entry: Entry, catalogue)` (name = instrument name, numbered when taken; colour from a
  fixed palette; at most 16), `removePart`, `renamePart`, `recolourPart`, `setInstrument(doc, part, entry)`,
  `moveIntoRange(doc, part, entry)` (each red note by whole octaves to the nearest normal-range octave, else expert;
  drums untouched), `rangeOf(entry, pitch)` re-exported from catalogue.

- [ ] Tests: undo/redo counts and branch drop on push; addPart numbering ("Cello", "Cello 2") and 16-part limit;
  moveIntoRange moves only red notes, by octaves (a C1 on Violin → G3 range → C4), keeps amber; setInstrument keeps
  notes and turns red ones red, never moves them; clearPart then undo restores.
- [ ] Implement; green; commit.

### Task 4: Play Live and Step

**Files:** Create `compose/snap.ts`, `compose/live.ts`, `compose/step.ts`; Test `test/compose-live.test.ts`

**Interfaces:**
- `TIDY = ['1/4','1/8','1/16','off']`, `snapStart(beat, tidy, quarter)`, `HELD_LENGTHS = [0.25,0.5,0.75,1,1.5,2,3,4]`
  (beats), `snapHeld(beats)`.
- `createLiveTake(o: { startBeat: number; bpm: number; beatsPerBar: number }): { down(pitch, t, velocity?): void; up(pitch, t): void; held(): number[]; quietEnough(t): boolean; notes(tidy, quarter): Omit<EditNote,'id'>[]; started(): boolean }`
  — `t` in seconds from any clock; the first `down` is beat `startBeat`; `quietEnough` is true when nothing is held
  and one bar has passed since the last key went up.
- `STEP_LENGTHS` (Whole 4, Half 2, Quarter 1, Eighth 0.5, Sixteenth 0.25 quarters), `createStep(cursor)`:
  `{ cursor(): number; add(pitches[], beats): {start, length, pitches}; rest(beats); back(): {start,length,pitches} | null }`.
  A chord step: every key down before the first key up is one step; a key held longer than a short tap sets the
  step length via `snapHeld`.

- [ ] Tests: hold 1 s at 60 BPM → length 1; 0.6 s → 0.5; two keys down 20 ms apart with Tidy 1/8 → same start,
  both notes; Off keeps 0.37 starts exactly; quietEnough after one bar of 4/4 at 120 (2 s); step chord of three
  pitches advances once; back removes the chord and moves the cursor back; dotted quarter = 1.5 quarters.
- [ ] Implement; green; commit.

### Task 5: Grid geometry, keys and the scroll pin

**Files:** Create `compose/grid.ts`, `compose/keys.ts`, `compose/scrollpin.ts`;
Test `test/compose-grid.test.ts`, `test/compose-scrollpin.test.ts`

**Interfaces:**
- `gridRows(entry: Entry, notes): { pitch: number; name: string; black: boolean; drum: boolean }[]` — a pitched part
  shows its expert range widened to its notes (at least two octaves around `home`); a drum part shows its pieces,
  named, plus a red row for any note on another key.
- `LINE_UP = ['1/4','1/8','1/16','off']`, `snapBeat(beat, lineUp, quarter)`, `cellAt(layout, x, y)`,
  `noteRect(layout, note)`.
- `KEY_SEMITONE: Record<string, number>` (KeyA C, KeyW C#, KeyS D, KeyE D#, KeyD E, KeyF F, KeyT F#, KeyG G, KeyY G#,
  KeyH A, KeyU A#, KeyJ B, KeyK C+12, KeyO C#+12, KeyL D+12), `KeyZ` octave down, `KeyX` octave up;
  `keyboardStart(entry)` = the C at or below `home` (drums: their lowest piece).
- `pinScroll(win: { scrollX; scrollY; scrollTo(x,y); addEventListener; removeEventListener }): { hold(key: string): void; release(key: string): void; held(): number; dispose(): void }`.

- [ ] Tests: snapBeat 1/8 in 4/4 rounds 1.3 → 1.5 beats; drum rows are Kick…Ride with their GM numbers; a pitch-61
  note in a kit part adds a red row; pinScroll restores a scroll that happened while held and ignores one after release.
- [ ] Implement; green; commit.

### Task 6: Live sound and the save client

**Files:** Create `compose/sampler.ts`, `compose/save.ts`; Test `test/compose-sampler.test.ts`, `test/compose-save.test.ts`

**Interfaces:**
- `createSampler(ports: { ctx(): AudioContext-like; library(): Promise<Library>; sample(lib, file): Promise<AudioBuffer> }): { ready(instrument): Promise<void>; start(instrument, pitch, velocity, sound: Sound): number; stop(id): void; stopAll(): void }`
  — the region and rate the renderer would pick (`regions`, `2^(Δ/12)`), the lane's gain and attack, its release on stop,
  looping the sustained stretch.
- `encodeBundle(files: Record<string, Uint8Array>): Uint8Array`, `saveDraft(fetch, csrf: () => string, setCsrf, piece, version, score): Promise<{ ok: true; version } | { ok: false; message: string; latest?: number }>`
  with plain-word messages for every refusal (over_quota uses the server's message).

- [ ] Tests: start on cello pitch 50 picks the 50-or-nearest root with the right rate; a kit note off its pieces plays
  nothing; bundle bytes equal the e2e `draftBundle` layout; 413 over_quota → server message, 409 stale → "A newer draft
  (draft N) was saved …", network error → "Could not reach the server …"; the CSRF from the answer is kept.
- [ ] Implement; green; commit.

### Task 7: The editor view

**Files:** Create `games/workroom/src/ui/compose/Composer.tsx`, `PartsList.tsx`, `InstrumentPicker.tsx`, `Keyboard.tsx`,
`EditGrid.tsx`, `EntryModes.tsx`, `NewPiece.tsx`; Modify `src/main.ts`, `src/load.ts` (sheet flag),
`src/ui/Workroom.tsx` (Sheet tab only when the draft stores MusicXML), `src/app.css`; Test `test/compose-view.test.ts`.

The page: title and draft line; toolbar (Play — Hear With The Piece / Hear My Part Alone —, ↶ Undo n, ↷ Redo n,
Clear, Save Draft, Notes On Controls, Fill My Screen); Parts In This Piece with Add Part; Part Settings (name,
colour, instrument picker by category with icons, range picture, Stand-In Sound line, written-pitch line); entry
modes Play Live (Tidy To, Count-In, the readout), Step (lengths with note icons, Dotted, + Rest, ‹ Back One), Grid
(Line Up To); the edit grid; the keyboard (on-screen keys, ‹ Lower / Higher ›). Tap a note to select, again to
delete; Delete/Backspace; drag across empty space to select several. Leaving with unsaved edits asks first.

- [ ] Tests (preact render with the repo's DOM stub, as `workroom.test.ts`): the toolbar labels are Title Case; Undo
  shows its count; a red note carries `data-range="out"` and an amber one `expert`; the Sheet tab is hidden for a
  draft without stored MusicXML.
- [ ] Implement; `node ../_kit/build/build.mjs workroom` builds; green; commit.

### Task 8: What users see — e2e, screenshots, docs

**Files:** Create `websites/www.cs/tests/e2e/compose.local.ts`; Modify `music/README.md`, the spec's phase line.

- [ ] e2e (desktop 1280 and phone 400): a student signs in, makes a notes key, New Piece "My First Tune", adds
  Cello; Play Live: holds a key 1 s (one note, length ≈ one beat at 92 BPM after Tidy), presses two keys together
  (a chord: two notes, one start); Step: Quarter then three keys together → a chord step, + Rest, ‹ Back One; Grid:
  taps a cell (a note), drags it a row up; selects and deletes; Undo brings it back, Redo removes it; adds Violin,
  puts a note below its range (red), Move Them Into Range (no red left), Undo; Save Draft → "Saved as draft 1";
  the piece page shows it and builds its sound; Compose opens draft 1 and saves draft 2. On the phone, holding an
  on-screen key while the readout changes leaves `scrollY` unchanged.
- [ ] Screenshots of the editor on phone and desktop for the owner's artifact page.
- [ ] README: the editor, the two routes. Commit.
