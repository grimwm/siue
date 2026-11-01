# Composer 4c: Sheet Music, Import and Export Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The editor shows the selected part as a Grid, as Sheet Music engraved live, or Both. Any music piece's page
shows sheet music even when its draft stores none. A person can bring in MusicXML (`.musicxml`, `.xml`, `.mxl`) or
MIDI (`.mid`, `.midi`) after a preview that matches each part to an instrument. A piece can be exported as MusicXML or
MIDI.

**Architecture:** Every conversion is DOM-free TypeScript in `games/workroom/src/compose/` and works on the editor's
`EditDoc`, where notes are in beats:
- `toxml.ts` engraves a document as MusicXML.
- `midi.ts` reads and writes Standard MIDI Files.
- `mxl.ts` unzips a compressed MusicXML in memory.
- `fromxml.ts` reads MusicXML through a minimal DOM interface: the browser's `DOMParser` in the page, `@xmldom/xmldom`
  in tests.
- `importing.ts` turns what was read into a preview and applies it.

The Preact views use these and the existing sheet bundle (`sheet.ts`, OpenSheetMusicDisplay). The piece page engraves a
score that stores no MusicXML with the same `toxml.ts`.

**Tech Stack:** Preact + TypeScript (games/workroom, `_kit/build`), OpenSheetMusicDisplay 1.9.9, DecompressionStream,
node:test, `@xmldom/xmldom` (dev only), Playwright (`make music-e2e`).

**Spec:** `docs/superpowers/specs/2026-10-31-composer-editor-design.md` (phase 4c: Views, Importing and exporting).

## Global Constraints

- Title Case for every button, menu, tab and heading ("Show As", "Sheet Music", "Import Music File",
  "Add As New Parts", "Start A New Piece", "Export MusicXML", "Export MIDI"); sentences stay sentence case.
- Import runs only in the browser. It never uploads the file and never changes the piece until the person confirms
  the preview. A failed import leaves the piece exactly as it was.
- `DOMParser` resolves no external entities, DTDs or URLs. A document with a `<!DOCTYPE` that declares entities
  (`<!ENTITY`) is refused.
- An `.mxl` is unzipped in memory. Only the file `META-INF/container.xml` names is read; absolute paths and `..`
  segments are refused.
- Limits, each refused with a plain reason:
  - the file is at most 10 MB, and an `.mxl` at most 20 MB unzipped;
  - at most 16 parts and 20,000 notes;
  - parsing finishes within 5 seconds.
- Notes are never moved into range by import. They come in coloured amber or red like any note.
- Written pitch = sounding + `entry.written`. The values are: Double Bass +12; Clarinet and Trumpet (in B♭) +2;
  French Horn (in F) +7; Piccolo, Celesta and Xylophone −12; Glockenspiel −24. Exported MusicXML carries
  `<transpose>` so other programs know.
- MIDI export: format 1, the GM program on each part's channel, drums on channel 10 (index 9).
- The page never moves while a key is held (compose/scrollpin.ts) in every view. Phone (400 px) and desktop layouts.
- The renderer's CSP: no inline style attributes in SVG markup; classes or script-set styles only.

## Review Focus

1. **A part longer than the piece's bars, or a note crossing a bar line or a tempo/time change.** The sheet ties it
   across the bar and the bars grow. Tested by `toxml.test.ts` "ties across bar lines and time changes".
2. **A MuseScore file with two voices, chords, ties, a backup, grace notes, lyrics and a transposing part.**
   Sounding pitches come in right, and grace notes and lyrics are listed as lost. Tested by
   `fromxml.test.ts` "reads the MuseScore fixture".
3. **A MIDI file with running status, note-on velocity 0 as note-off, several tracks on one channel, and a drum
   channel.** Tested by `midi.test.ts` "reads the GM fixture made by another writer".
4. **A hostile `.mxl`** (`../` path, an absolute path, a zip bomb past 20 MB, or no container.xml) is refused
   without throwing anything the page can't say. Tested by `mxl.test.ts`.
5. **Export then import is the same piece** (MusicXML and MIDI), including drums and the transposing parts. Tested
   by `roundtrip.test.ts`.

---

### Task 1: Transposing brass and woodwinds in the catalogue

**Files:**
- Modify: `music/compose/samples.json` and `music/library/library.json` (`clarinet`, `trumpet`: `written` 2;
  `horn`: `written` 7).
- Modify: the spec's Written transposition line.
- Modify: `games/workroom/src/ui/compose/Composer.tsx`: the "Written …" line names the interval.
- Test: `games/workroom/test/catalogue.test.ts`.

**Interfaces:** Produces `intervalWords(semitones: number): string` in `catalogue.ts`. For example:
`intervalWords(12)` is `"an octave above"`, `intervalWords(-24)` is `"two octaves below"`, `intervalWords(7)` is
`"a perfect fifth above"` and `intervalWords(2)` is `"a major second above"`.

- [ ] Test: in the real library's catalogue, `horn.written === 7`, `clarinet.written === 2`, `trumpet.written === 2`,
  `bass.written === 12` and `glock.written === -24`. Also test `intervalWords` on those four values.
- [ ] Run it and watch it fail. Implement. Run it and watch it pass. Commit.

### Task 2: Engraving a document as MusicXML (`compose/toxml.ts`)

**Interfaces:**
- Produces `toMusicXml(doc: EditDoc, entries: readonly Entry[], opts?: { parts?: readonly string[]; concert?: boolean; colours?: boolean }): string`.
  - Output: a `score-partwise` 4.0 document. Each part's id is the part id and its `<part-name>` is the part's name.
  - `parts` limits the output to those parts.
  - `concert` writes sounding pitch, with no `<transpose>`.
  - `colours` (default true) gives amber and red notes `color` on `<note>` and `<notehead>`: amber `#d08a00`, red
    `#c4372c`.
- Produces `inferFifths(pitches: readonly number[]): number`, the major key (−6..6) whose scale holds the most of
  the notes. Ties go to the fewest accidentals, and no notes gives 0.

Rules:
- `divisions` is 24 per quarter. A note's start and end are rounded to the nearest 1/24 quarter. A rounded length of
  0 becomes one division.
- Each bar takes its time signature from `beatClock(doc.tempo).tempoAt(bar)`. A tempo entry writes `<time>`, plus
  `<sound tempo>` and a `<metronome>` direction in the first part.
- Each staff is chordified. At every start and end inside a bar, the notes sounding are written as one chord.
  Notes that carry on past the boundary are tied (`<tie>` plus `<notations><tied>`). Rests fill the gaps. A bar
  with nothing in it is a whole-bar rest (`<rest measure="yes"/>`).
- Durations are split into note values (whole to 32nd, single-dotted) from the largest down. Any remainder smaller
  than a 32nd is folded into the previous value's `<duration>`, so the bar still adds up.
- Clefs: `treble` is G2, `alto` C3, `bass` F4, `grand` two staves (G2 and F4, written pitch ≥ 60 on staff 1) with
  `<backup>` between them, `percussion` the percussion clef. For percussion each piece has a `<score-instrument>`
  and a `<midi-instrument>` with `<midi-unpitched>` (the GM note + 1). Notes are `<unpitched>` at a fixed staff
  position (`DRUM_DISPLAY`) with `<instrument id>`; cymbals and hi-hats get an `x` notehead.
- `<transpose>` gives written→sounding: `chromatic` = −(written mod 12, as −11..11), `diatonic` from the semitone
  map, and `octave-change` = the whole octaves. Written pitch spelling uses the written key: sharps when its fifths
  ≥ 0, flats otherwise. The key is `inferFifths(sounding)` plus the transposition's fifths.
- `<midi-instrument>` carries `<midi-program>` (entry.gm) and `<midi-channel>`, the same channel `midi.ts` uses.

- [ ] Tests in `test/toxml.test.ts`:
  - one C4 quarter in 4/4 becomes `<step>C</step><octave>4</octave>`, `<duration>24</duration>`, `<type>quarter</type>`,
    followed by a 3-beat rest (dotted half);
  - "ties across bar lines and time changes": a 6-beat note from beat 2 of 4/4, then a change to 3/4 at bar 2;
  - a chord (C4 E4 G4) is written as one `<chord/>` group, and two overlapping notes of different lengths are chordified
    and tied;
  - the grand staff splits at middle C and has a `<backup>`;
  - the Double Bass is written an octave up (sounding E1 → written E2) with `<octave-change>-1</octave-change>`;
  - the horn in F: sounding F3 is written C4, with `<chromatic>-7</chromatic><diatonic>-4</diatonic>`. The Glockenspiel
    gets `octave-change` 2;
  - `concert: true` writes the sounding pitch and no `<transpose>`;
  - drums: a kick and a closed hi-hat give `<unpitched>` with `<instrument id>`, the hi-hat with an `x` notehead;
  - an out-of-range note is red and an expert-range one amber;
  - `inferFifths` gives 1 for G major's notes, −1 for F major's and 0 for none;
  - a 1/48 sliver still makes every bar add up to its length.
- [ ] Run them and watch them fail, implement, watch them pass, commit.

### Task 3: Standard MIDI Files (`compose/midi.ts`)

**Interfaces:**
- Produces `writeMidi(doc: EditDoc, entries: readonly Entry[]): Uint8Array`:
  - format 1 at 480 ticks per quarter;
  - track 0 holds the title (meta 0x03) and every tempo entry's set-tempo and time signature at its bar;
  - one track per part with its name, program change (gm − 1) and notes, on channels 0..15 skipping 9. A drum part
    is always on channel 9;
  - a 16th pitched part shares channel 15.
- Produces `readMidi(bytes: Uint8Array): ReadMusic`. Shared with `fromxml.ts`:
  ```ts
  interface ReadPart { name: string; program: number | null; drums: boolean; notes: { start: number; length: number; pitch: number; velocity: number }[] } // beats = quarters
  interface ReadMusic { format: 'MIDI' | 'MusicXML'; app: string | null; title: string | null; tempo: { bar: number; bpm: number; beats: number; unit: 1|2|4|8|16 }[]; fifths: number | null; mode: 'major' | 'minor' | null; parts: ReadPart[]; lost: string[] }
  ```
  Notes are in quarter notes from the start.
  - One part per (track, channel) that has notes. Channel 9 is drums.
  - Program changes, running status, and a note-on at velocity 0 acting as a note-off are all handled.
  - A set-tempo or time signature that falls mid-bar takes effect from the next bar, and goes on the lost list.
  - Pitch bends, controllers (other than 64 sustain, which lengthens held notes) and SysEx go on the lost list.
  - It throws `ImportError` (with words for the page) on a bad header or a track that runs off the end.
- Produces `class ImportError extends Error`.

- [ ] Tests in `test/midi.test.ts`:
  - "reads the GM fixture made by another writer": `test/fixtures/import/gm-band.mid`, made by
    `test/fixtures/import/make-gm-band.py` with raw bytes and no MIDI library. It is in 3/4 at 100 BPM, with a piano
    on channel 1, a bass on channel 2 with running status and velocity-0 offs, drums on channel 10 and one pitch bend.
    Expect 3 parts with programs 1, 33 and drums, the exact note lists, tempo `[{bar:1,bpm:100,beats:3,unit:4}]`, and
    the bend listed as lost;
  - `writeMidi` puts the drums on channel 9 and gives the horn program 61 (0x3C on the wire);
  - a truncated file throws `ImportError`.
- [ ] Watch them fail, implement, watch them pass, commit.

### Task 4: Reading MusicXML and `.mxl` (`compose/fromxml.ts`, `compose/mxl.ts`)

**Interfaces:**
- Produces `readMusicXml(text: string, parse: (text: string) => XmlDocument): ReadMusic`. `XmlDocument` and
  `XmlElement` are minimal interfaces: `documentElement`, `tagName`, `childNodes`, `getAttribute` and `textContent`.
  - It reads `score-partwise`; `score-timewise` is refused in words.
  - It follows `divisions`, `<backup>`, `<forward>`, `<chord/>` and ties, joining tied notes into one.
  - It reads `<transpose>` and turns written pitch into sounding pitch, and applies the `<alter>` accidentals.
  - It follows `<sound tempo>` and `<time>`, `<key>` (the first: fifths and mode) and `<midi-program>`.
  - Percussion: `<unpitched>` with `<instrument id>` → `<midi-unpitched>` − 1 gives the drum note, and the part
    has `drums: true`.
  - The lost list counts: lyrics (by words), chord symbols (`<harmony>`), grace notes (they are dropped, so the
    preview says so), ornaments and articulations, `<repeat>` and endings (not written out: listed), and tablature.
  - The app comes from `<software>`.
  - A `<!ENTITY` in the text is refused.
- Produces `unzipMusicXml(bytes: Uint8Array, inflate: (raw: Uint8Array, limit: number) => Promise<Uint8Array>): Promise<string>`.
  - It reads the zip's central directory, finds `META-INF/container.xml`, and takes the first `<rootfile full-path>`.
  - It refuses an absolute path, a `..` path, encryption, or a method other than 0 or 8.
  - Every entry it inflates counts toward the 20 MB limit; past that it throws `ImportError`.
- Produces `browserInflate(raw, limit)`: `DecompressionStream('deflate-raw')`, stopping at `limit` bytes.

- [ ] Tests:
  - "reads the MuseScore fixture": `test/fixtures/import/musescore-quartet.musicxml` is hand-written in MuseScore 4's
    shape. It has a flute with lyrics and a grace note; a B♭ clarinet with `<transpose>`; a piano on two staves with
    `<backup>`, a chord and a tie across the bar; a drumset with `<unpitched>`; and a tempo of 112. Expect sounding
    pitches, joined ties, `fifths -1`, `app 'MuseScore 4.4.2'`, and lost lines for lyrics, the grace note and the
    chord symbol;
  - "refuses entities": a document with `<!DOCTYPE … [<!ENTITY …>]>` is refused;
  - in `mxl.test.ts`: the fixture zipped (stored, and deflated with node's `zlib.deflateRawSync`) reads back the same.
    A `../evil.xml` rootfile, an absolute path, an entry inflating past 20 MB, and a missing container are each
    refused with `ImportError`.
- [ ] Watch them fail, implement, watch them pass, commit (`@xmldom/xmldom` 0.9.12 as a devDependency, used only in
  tests).

### Task 5: The import preview and applying it (`compose/importing.ts`)

**Interfaces:**
- Produces `readMusicFile(name: string, bytes: Uint8Array, ports: { parseXml; inflate; now(): number }): Promise<ReadMusic>`.
  - It picks the reader by extension and content: `MThd` → MIDI, `PK` → `.mxl`, otherwise XML.
  - It enforces 10 MB, the 5-second deadline (checked by readers through `now`), 16 parts and 20,000 notes.
- Produces `matchInstrument(part: ReadPart, entries: readonly Entry[]): string`:
  - drums → `kit`, or `orch` when every note is one of orch's pieces;
  - otherwise by name words first (e.g. "violin", "horn", "flute", "piano"…, case-insensitive), then by the GM
    program's nearest catalogue entry (exact gm, else the same GM family of eight), else `piano`.
- Produces `previewOf(read: ReadMusic, file: string, entries: readonly Entry[]): ImportPreview`, which holds the
  facts (From, Speed, Time Signature, Key, Length in bars) and each part with its match.
- Produces `addAsNewParts(doc: EditDoc, preview: ImportPreview, choice: readonly string[], entries: readonly Entry[]): EditDoc`.
  The notes go in at the piece's own speed: quarters are turned into the document's beats bar by bar. Parts are named
  after the file's parts, and the piece keeps at most 16 parts.
- Produces `newDocFrom(preview: ImportPreview, choice: readonly string[], entries: readonly Entry[], title: string): EditDoc`,
  which keeps the file's tempo map.

- [ ] Tests in `test/importing.test.ts`:
  - matching: "Violin I" → violin, GM 34 → bass, a drum part of only 35, 57 and 81 → orch;
  - "Add As New Parts" into a 6/8 document converts quarters to eighth beats and keeps the document's tempo;
  - "Start A New Piece" keeps 3/4 at 100;
  - more than 16 parts is refused, with words naming both counts;
  - the deadline: a `now` that jumps 6 seconds makes it refuse.
  - `roundtrip.test.ts`: `toMusicXml` → `readMusicXml`, and `writeMidi` → `readMidi`, give the same notes (pitch, start,
    length in quarters) for a document with a cello, a horn, a double bass, a piano chord with a tie, and drums.
- [ ] Watch them fail, implement, watch them pass, commit.

### Task 6: Show As Grid / Sheet Music / Both, and the range picture

**Files:**
- Create: `src/ui/compose/PartSheet.tsx`, the selected part engraved through `sheet.js`'s `mountSheet(el, identity)`.
  It is re-engraved 250 ms after the last edit. It has a Concert Pitch switch when the instrument transposes, and
  lights the playhead's bar.
- Create: `src/ui/compose/RangePicture.tsx`, a bar from the lowest to the highest MIDI pitch drawn green (normal),
  amber (expert only) and red (beyond), with the part's notes as ticks. It appears in Part Settings and the import
  preview.
- Modify: `Composer.tsx`, which gets the "Show As" switch (Grid, Sheet Music, Both; desktop and phone). Both stacks
  the two, each keeping a usable height (`min-h-64`). Horizontal scroll is shared: scrolling one sets the other's
  `scrollLeft` by the same fraction.

- [ ] Tests (`test/compose-view.test.ts`, extended): the Show As buttons render with aria-pressed; Sheet Music
  mounts the sheet port with XML holding the part's id; Both renders the grid and the sheet; the range picture
  segments for the Violin are [55–100 green, expert amber, outside red].
- [ ] Watch them fail, implement, watch them pass, commit.

### Task 7: Import Music File and Export in the editor

**Files:**
- Create: `src/ui/compose/ImportPreview.tsx`. It shows Found In &lt;file&gt;, the facts row, the parts with instrument
  selects (drum parts offer only drum instruments) and range flags, What Can't Come Across, and Add As New Parts /
  Start A New Piece / Cancel.
- Modify: `Composer.tsx`, which gets Import Music File (a hidden file input, `accept=".musicxml,.xml,.mxl,.mid,.midi"`)
  and Export MusicXML / Export MIDI (a Blob download named `<piece-id>.musicxml` or `.mid`).
  - Add As New Parts is one Undo step.
  - Start A New Piece opens the New Piece form with the file's title filled in, then the editor on `newDocFrom(…)`.
    Through `ComposerProps.onNewPiece(doc, title)`, which `mount.ts` wires to New Piece.

- [ ] Tests: the preview's buttons call their handlers; Cancel leaves the document unchanged; a refused file shows
  its words in the status line; Export MIDI hands a Blob whose first bytes are `MThd`.
- [ ] Watch them fail, implement, watch them pass, commit.

### Task 8: Sheet music on the piece page for drafts that store none

**Files:**
- Modify: `SheetMusic.tsx`. `SheetMusicProps.musicxml?: () => Promise<string>` replaces the fetch when given.
- Modify: `Workroom.tsx`, `tabs`. A renderable music score with no stored sheet (`p.sheet === false` or score-only)
  offers Sheet Music engraved from `toMusicXml(docFromScore(score, entries), entries)`, with the library fetched
  once. The download keeps offering only stored files.

- [ ] Tests: `tabsFor` offers sheet when `engrave` is possible; SheetMusic with `musicxml` never calls `fetchText`.
- [ ] Watch them fail, implement, watch them pass, commit.

### Task 9: In the browser

- [ ] Extend `tests/e2e/compose.local.ts`:
  - Show As Sheet Music draws an SVG with a part name;
  - Both shows both, and on a phone each is at least 200 px tall;
  - Import Music File with `musescore-quartet.musicxml` → the preview lists 4 parts, Add As New Parts → the parts
    appear and Undo removes them;
  - Export MIDI downloads a file starting `MThd`;
  - after Save Draft, the piece page's Sheet Music shows the engraved part;
  - on the phone, holding a key in the Both view never moves the page.
- [ ] Update `music/README.md` (what import/export do, the limits).
- [ ] Commit; PR; pr-fix-loop; merge on green.
