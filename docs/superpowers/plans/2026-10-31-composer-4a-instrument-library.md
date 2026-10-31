# Composer 4a: the instrument library and catalogue Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The shared sample library holds the composer's whole orchestra. Every instrument VSCO-2 CE has is
sampled, the drums play each sample on its own key, and the stand-ins fill the gaps. `library.json` carries
each instrument's catalogue entry, which the page, PHP, the composing pipeline and the studio MCP all read.

**Architecture:**
- **One source.** `music/compose/samples.json` stays the one source of truth. Each instrument gains catalogue
  fields, and, where it needs them, `pitched: false` or `standin: "<id>"`.
- **The builder.** `siue_compose.library` (`make music-library`) copies the catalogue fields into
  `music/library/library.json`. For a stand-in it writes the target's `files` and `loop`, so the stand-in costs no
  bytes and needs no change in any renderer.
- **Unpitched instruments.** An instrument marked `pitched: false` maps each sample to its own key only, and
  never repitches it. This holds in the browser renderer (`render/plan.ts`) and in the SFZ writer (`sfz.py`).
- **The page's catalogue.** `games/workroom/src/catalogue.ts` (DOM-free) reads the catalogue out of `library.json`
  and gives the editor its categories, range colouring and written pitch.
- **The AI.** The studio MCP gains `list_instruments`, so a connected AI writes for the full orchestra.

**Tech Stack:** Python 3 (unittest) for `music/compose`; TypeScript with node:test for the workroom; PHP 8.4
with PHPUnit; the MCP Python SDK; Playwright for the local check.

**Spec:** `docs/superpowers/specs/2026-10-31-composer-editor-design.md` ("Instruments", "Decisions made with
defaults", phase 4a).

## Global Constraints

- **The sample source.** Samples come only from VSCO-2 CE at the commit already in `samples.json`
  (`28092772094b2d9f1148d84cea97f4545b8c687d`), CC0. There is no second source in this phase.
- **Existing ids keep working.** The ids `harp`, `cello`, `bass`, `organ` and `horn` keep their meaning and
  files, so every published score still plays.
- **The new ids** are exactly: `violin viola flute piccolo oboe clarinet bassoon trumpet trombone tuba piano
  celesta timpani glock xylo marimba vibes bells kit orch choir`.
- **The library format.** It stays FLAC at the recorded rate and depth, one file per sampled pitch
  (`<id>/<pitch>.flac`), and no lossy encoding anywhere. Sample about every 3 semitones, as today. Use one
  dynamic layer, mf or the nearest, and the sustain articulation for held instruments.
- **Size.** The library grows to about 200 MB, and the plan stops to report if it would pass 260 MB. It stays in
  plain git and deploys whole.
- **The written word.** Visible text is in Title Case for names ("Double Bass", "Drum Kit"). Docs describe the
  current state only.
- **Running tests.** Node tests run one file at a time, under:

  ```
  systemd-run --user --scope -q -p MemoryMax=3G -p MemorySwapMax=0 /usr/bin/timeout 300 node --test test/<f>.test.ts
  ```

  This runs from `websites/www.cs/games/workroom`. Locally run `make test` plus at most two e2e specs; CI runs
  the whole suite.
- **Deploying.** Never run `make deploy`, and never SSH to www.cs. A merge deploys through `deploy.yml`.

### Catalogue values (verbatim)

`range` is the normal range and `expert` is the expert range, both as inclusive MIDI pitches. `written` is the
number of semitones added to the sounding pitch to give the written pitch. `gm` is the General MIDI program,
counted from 1.

| id | name | category | range | expert | home | clef | written | gm | gm_name | standin |
|---|---|---|---|---|---|---|---|---|---|---|
| violin | Violin | strings | 55–100 | 55–105 | 67 | treble | 0 | 41 | Violin | |
| viola | Viola | strings | 48–88 | 48–93 | 60 | alto | 0 | 42 | Viola | |
| cello | Cello | strings | 36–84 | 36–93 | 48 | bass | 0 | 43 | Cello | |
| bass | Double Bass | strings | 28–67 | 24–72 | 36 | bass | 12 | 44 | Contrabass | |
| harp | Harp | strings | 23–104 | 23–104 | 60 | grand | 0 | 47 | Orchestral Harp | |
| flute | Flute | woodwinds | 60–96 | 59–101 | 72 | treble | 0 | 74 | Flute | |
| piccolo | Piccolo | woodwinds | 74–105 | 74–108 | 84 | treble | -12 | 73 | Piccolo | |
| oboe | Oboe | woodwinds | 58–91 | 58–93 | 69 | treble | 0 | 69 | Oboe | |
| clarinet | Clarinet | woodwinds | 50–91 | 50–94 | 62 | treble | 0 | 72 | Clarinet | |
| bassoon | Bassoon | woodwinds | 34–76 | 34–81 | 48 | bass | 0 | 71 | Bassoon | |
| trumpet | Trumpet | brass | 52–82 | 52–86 | 65 | treble | 0 | 57 | Trumpet | |
| horn | French Horn | brass | 35–77 | 29–81 | 53 | treble | 0 | 61 | French Horn | |
| trombone | Trombone | brass | 40–72 | 34–77 | 50 | bass | 0 | 58 | Trombone | |
| tuba | Tuba | brass | 26–65 | 22–67 | 38 | bass | 0 | 59 | Tuba | |
| piano | Piano | keys | 21–108 | 21–108 | 60 | grand | 0 | 1 | Acoustic Grand Piano | |
| organ | Organ | keys | 24–96 | 12–96 | 60 | grand | 0 | 20 | Church Organ | |
| celesta | Celesta | keys | 60–108 | 60–108 | 72 | treble | -12 | 9 | Celesta | glock |
| timpani | Timpani | pitched | 38–57 | 36–60 | 45 | bass | 0 | 48 | Timpani | |
| glock | Glockenspiel | pitched | 79–108 | 79–108 | 84 | treble | -24 | 10 | Glockenspiel | |
| xylo | Xylophone | pitched | 65–108 | 60–108 | 79 | treble | -12 | 14 | Xylophone | |
| marimba | Marimba | pitched | 36–96 | 36–96 | 60 | grand | 0 | 13 | Marimba | |
| vibes | Vibraphone | pitched | 53–89 | 53–89 | 65 | treble | 0 | 12 | Vibraphone | marimba |
| bells | Tubular Bells | pitched | 60–77 | 60–79 | 67 | treble | 0 | 15 | Tubular Bells | |
| kit | Drum Kit | drums | — | — | — | percussion | 0 | 1 | Standard Kit | |
| orch | Orchestral Percussion | drums | — | — | — | percussion | 0 | 49 | Orchestra Kit | |
| choir | Choir (Aahs / Oohs) | voices | 40–81 | 36–84 | 57 | grand | 0 | 53 | Choir Aahs | organ |

**Categories, in picker order:**

| category | Label | Lane family |
|---|---|---|
| `strings` | Strings | `strings` |
| `woodwinds` | Woodwinds | `woodwinds` |
| `brass` | Brass | `brass` |
| `keys` | Keyboards | `keys` |
| `pitched` | Pitched Percussion | `percussion` |
| `drums` | Drums & Percussion | `percussion` |
| `voices` | Voices | `choir` |

`harp` keeps the lane family `harp`.

**Drum pieces** (`pieces`, as `[GM note, name]`):
- `kit`: `[36,"Kick"],[38,"Snare"],[42,"Closed Hi-Hat"],[46,"Open Hi-Hat"],[45,"Low Tom"],[50,"High Tom"],[49,"Crash"],[51,"Ride"]`.
- `orch`: `[35,"Bass Drum"],[57,"Cymbals"],[81,"Triangle"],[54,"Tambourine"]`.

Each piece's pitch has exactly one file. The kit's hi-hats and ride use VSCO-2 CE cymbal samples. Note in
`standin_note` which samples they are: for example "Hi-Hat and Ride: VSCO-2 CE's suspended cymbal".

**The stand-in note** (`standin_note`, shown under "Stand-In Sound"):
- celesta: "Plays the Glockenspiel samples."
- vibes: "Plays the Marimba samples with a longer ring."
- choir: "Plays the Organ samples with a soft start."
- bells: "Only a few bells were recorded; the rest are stretched from the nearest."
- kit: the hi-hat and ride line above.

`bells` and `kit` keep their own `files`, and their `standin_note` explains the gap.

**Default lane sound** (`attack`, `release` in seconds, for the editor's new parts): `vibes` 0.005 / 1.8,
`choir` 0.25 / 0.6. Every other instrument takes 0.005 for a struck or plucked instrument and 0.05 for a held one,
and 0.4 / 0.3 respectively for release.

## Review Focus

1. **A published score naming `harp`, `cello`, `bass`, `organ` or `horn`** must sound exactly as before: the same
   files, regions and loop. Task 1 pins this with a byte-compare of the five old instruments' `files`/`loop` in
   `library.json` before and after.
2. **A drum note whose pitch has no sample** (such as 37 on the kit) is silent, never a repitched neighbour. The
   renderer must not throw on it. Task 2 tests both renderers.
3. **A stand-in id in a score** passes `ScoreRules`, the Python `validate` and the browser renderer, with no
   special case anywhere. Task 3 has the PHPUnit and Python tests.
4. **Loop points on a new held instrument** must lie inside every one of its samples. A loop past a sample's end
   clicks, or plays silence. Task 1's builder refuses such a loop and names the file.
5. **The page loads `library.json` from an older deploy** while the new page code is cached. `catalogue.ts` must
   treat missing catalogue fields as "not in the catalogue" and must not throw. Task 4 tests this with the old
   format.

---

### Task 1: The library format carries the catalogue, unpitched instruments and stand-ins

**Files:**
- Modify: `websites/www.cs/music/compose/siue_compose/library.py`
- Test: `websites/www.cs/music/compose/tests/test_library.py`

**Interfaces:**
- Produces, for each `library.json` instrument:
  - `files`, plus `loop` when the instrument has one;
  - `pitched: false`, only when the instrument is unpitched;
  - `standin`, the target id, when it is a stand-in, in which case `files` and `loop` are the target's;
  - the catalogue fields copied as they are: `name`, `category`, `range`, `expert`, `home`, `clef`, `written`,
    `gm`, `gm_name`, `pieces`, `standin_note`, `attack`, `release`. Any that are absent stay absent.
- Produces `CATALOGUE_FIELDS: tuple[str, ...]` in `library.py`.

- [ ] **Step 1: Write the failing tests**:
  - `test_catalogue_fields_copied`: a manifest instrument with every catalogue field gets the same values in the
    index.
  - `test_standin_shares_target_files`: `{"celesta": {"standin": "glock", ...}}` gives the index's
    `celesta.files == glock.files`, its `loop` equal to the target's, and no `celesta/` folder written.
  - `test_standin_of_standin_refused`: a stand-in whose target is itself a stand-in raises `LibraryError` naming
    both ids.
  - `test_unpitched_kept`: `pitched: false` survives.
  - `test_loop_past_sample_end_refused`: a loop ending after the shortest file raises `LibraryError` naming that
    file. Get the length from `_probe` extended to return the frame count.
  - `test_bad_loop_interval_refused`: a negative start, a start at or after the end, and a start past the sample's
    end each raise `LibraryError`.
- [ ] **Step 2: Run them, and check they fail.**
  Run `make music-compose-test` (or `python3 -m unittest tests.test_library` in `music/compose`).
  Expected: FAIL.
- [ ] **Step 3: Implement it in `build()`.**
  - Resolve stand-ins after the sampled instruments are written.
  - `_probe` returns `(rate, channels, frames)`.
  - Check the loop: `0 <= loop[0] < loop[1]` and `loop[1] * rate <= frames` for every file.
- [ ] **Step 4: Run them again.** Expected: PASS.
- [ ] **Step 5: Commit.** `git commit -m "Music library: catalogue fields, stand-ins and unpitched instruments"`

### Task 2: Unpitched instruments play each sample on its own key only

**Files:**
- Modify: `websites/www.cs/games/workroom/src/render/plan.ts`
- Modify: `websites/www.cs/music/compose/siue_compose/sfz.py`
- Test: `websites/www.cs/games/workroom/test/render-plan.test.ts`
- Test: `websites/www.cs/music/compose/tests/test_render.py`

**Interfaces:**
- Produces, in `plan.ts`:
  - `LibraryInstrument` gains `pitched?: false` and the optional catalogue fields from Task 1 (typed, all
    optional);
  - `regions(files, pitched = true): Region[]`. With `pitched === false`, every region is
    `{lo: f.pitch, hi: f.pitch, file: f}`.
- Produces, in `sfz.py`: `regions(files, pitched=True)` with the same rule. An unpitched region is written with
  `lokey=hikey=pitch_keycenter=<pitch>`.

- [ ] **Step 1: Write the failing tests**:
  - `unpitched regions are one key each`;
  - `an unpitched note with no sample makes no voice`: a kit with files at 36 and 38 and a note at 37 gives
    `planVoices` no voice for it, and does not throw;
  - `pitched regions unchanged`: today's split, on the cello fixture;
  - Python: `test_unpitched_sfz_regions`.
- [ ] **Step 2: Run them, and check they fail.**
  Run `node --test test/render-plan.test.ts` under the systemd-run line, and `make music-compose-test`.
  Expected: FAIL.
- [ ] **Step 3: Implement it.**
  - Pass `inst.pitched` where `plan.ts:50` builds the lane's regions.
  - A note with no region is skipped, the same way an out-of-range note is handled today. If today throws, keep
    the throw for pitched instruments only.
- [ ] **Step 4: Run them again.** Expected: PASS.
- [ ] **Step 5: Commit.** `git commit -m "Music renderer: drums play each sample on its own key"`

### Task 3: The manifest holds the whole orchestra; rebuild the library

**Files:**
- Modify: `websites/www.cs/music/compose/samples.json`
- Create: `websites/www.cs/music/compose/tools/vsco-files`. This stdlib Python script lists the VSCO-2 CE tree at
  the pinned commit through the GitHub trees API, and prints candidate `{path, sha256, pitch}` entries for a
  folder and a dynamic. It is a helper for writing the manifest, not part of the build.
- Modify: `websites/www.cs/music/library/**` (regenerated by `make music-library`).
- Modify: `websites/www.cs/music/library/README.md` (lists each instrument, the VSCO-2 CE folder it comes from and
  its stand-ins).
- Test: `websites/www.cs/music/compose/tests/test_samples.py`
- Test: `websites/www.cs/music/tests/LibraryCatalogueTest.php` (PHPUnit)
- Test: `websites/www.cs/music/tools/tests/test_score.py`

**Interfaces:**
- Consumes the Task 1 format.
- Produces `library.json` with the 26 ids of the catalogue table and its values.

- [ ] **Step 1: Write the failing tests**:
  - `test_manifest_catalogue`: in `samples.json`, every id of the table is present with exactly the table's
    values. Also check:
    - every pitched, non-stand-in instrument's file pitches lie within `expert`, widened by 3 semitones;
    - neighbouring roots are at most 4 semitones apart;
    - every `pieces` pitch of `kit` and `orch` has exactly one file;
    - the old five instruments' `files` and `loop` are byte-identical to `git show origin/main:` of the file.
  - PHPUnit `LibraryCatalogueTest`:
    - `music_library_instruments()` contains all 26 ids;
    - `ScoreRules::check` accepts a score whose lanes name `celesta`, `kit` and `violin`;
    - it still refuses `unknown_instrument` for `synth-pad`.
  - Python `test_score.py`: `validate` with `library_instruments()` of the real `library.json` accepts the same
    score.
- [ ] **Step 2: Run them, and check they fail.**
  Run `make music-compose-test`, then the PHP suite for music (`make test` runs it), then the music tools tests.
  Expected: FAIL (ids missing).
- [ ] **Step 3: Write the manifest entries.**
  - Choose VSCO-2 CE files with `vsco-files`, preferring the solo instrument and taking a section where solo is
    missing. Record which in the README.
  - Pick each held instrument's `loop` by listening, inside its sustain. Task 1's check proves it fits.
  - Run `make music-library`, then check `du -sh music/library`. Expected: about 200 MB. If it passes 260 MB,
    stop and report.
- [ ] **Step 4: Run every test from Step 1 again.** Expected: PASS.
- [ ] **Step 5: Check the deploy list.**
  Run `LIST=1 ./deploy.sh | grep -c 'music/library/.*\.flac'`. Expected: the number of files in
  `library.json`, and no stand-in folders.
- [ ] **Step 6: Commit.** Commit the manifest, the library and the tests together:
  `git commit -m "Music library: the composer's full orchestra from VSCO-2 CE, with stand-ins"`

### Task 4: The page's catalogue

**Files:**
- Create: `websites/www.cs/games/workroom/src/catalogue.ts` (DOM-free)
- Test: `websites/www.cs/games/workroom/test/catalogue.test.ts`

**Interfaces:**
- Consumes `Library` and `LibraryInstrument` from `render/plan.ts` (Task 2).
- Produces:
  - `type Category = 'strings' | 'woodwinds' | 'brass' | 'keys' | 'pitched' | 'drums' | 'voices'`;
  - `CATEGORIES: readonly { id: Category; label: string; family: Family }[]`, in the table's order and with its
    labels;
  - `interface Entry { id; name; category; range: [number, number] | null; expert: [number, number] | null;
    home: number | null; clef: 'treble' | 'alto' | 'bass' | 'grand' | 'percussion'; written: number; gm: number;
    gmName: string; pieces: [number, string][] | null; standin: string | null; standinNote: string | null;
    attack: number; release: number }`;
  - `catalogue(lib: Library): Entry[]`, ordered by category, then by the table's order. An instrument with no
    `name` or `category` is left out;
  - `rangeClass(e: Entry, pitch: number): 'normal' | 'expert' | 'out'`. For drums, a pitch in `pieces` is
    `normal` and anything else is `out`;
  - `writtenPitch(e: Entry, pitch: number): number` gives `pitch + e.written`;
  - `laneFamily(e: Entry): Family`, which is `harp` for harp and otherwise the category's family;
  - `defaultSound(e: Entry): Sound`, which is `{instrument: e.id, gain_db: 0, attack: e.attack, release:
    e.release}`.

- [ ] **Step 1: Write the failing tests** against the real `music/library/library.json`, read with `fs`:
  - `catalogue lists 26 in category order`;
  - `double bass writes an octave up`: `writtenPitch(bass, 28) === 40`;
  - `glock writes two octaves down`;
  - `range classes`: violin 60 is `normal`, 103 is `expert`, 110 is `out`, 40 is `out`;
  - `drum classes`: kit 36 is `normal`, 37 is `out`;
  - `stand-ins carry their note`;
  - `an old library.json without catalogue fields gives an empty catalogue and does not throw`. Use
    `test/fixtures`, adding a copy of the old five-instrument `library.json` if none exists.
- [ ] **Step 2: Run it, and check it fails.**
  Run `node --test test/catalogue.test.ts` under the systemd-run line. Expected: FAIL (module missing).
- [ ] **Step 3: Implement `catalogue.ts`.**
- [ ] **Step 4: Run it again, and run the build check.**
  Run the same test, then `node ../_kit/build/build.mjs workroom --check`. Expected: PASS, and the check is clean.
- [ ] **Step 5: Commit.** `git commit -m "Workroom: the instrument catalogue from the library"`

### Task 5: The AI sees the orchestra

**Files:**
- Modify: `websites/www.cs/music/tools/siue_music/studio_mcp.py`
- Modify: `websites/www.cs/music/tools/siue_music/studio.py`
- Test: `websites/www.cs/music/tools/tests/` (the studio MCP test module)

**Interfaces:**
- Consumes `library.json` as the site serves it (`Studio._instruments` already fetches it).
- Produces the MCP tool `list_instruments() -> {"instruments": [{id, name, category, range, expert, clef, written,
  gm, gm_name, pieces, standin_note}]}`, in catalogue order.

- [ ] **Step 1: Write the failing test.** `test_list_instruments` uses a fake site serving the real
  `library.json`. It checks for 26 entries, that the first is `violin`, and that `kit.pieces[0] == [36, "Kick"]`.
- [ ] **Step 2: Run it, and check it fails.** Run the music tools tests. Expected: FAIL.
- [ ] **Step 3: Implement it.**
  - The tool's description tells the AI four things:
    - to choose lane instruments from this list;
    - that drums take the `pieces` pitches;
    - that notes outside `expert` are allowed but unplayable by people;
    - that `written` is how the part is notated.
  - `publish_draft`'s description points to `list_instruments`.
  - Rebuild the wheel with `music/tools/build-wheel` and update `music/dist/release.json`, as the MCP plan's
    release step says.
- [ ] **Step 4: Run it again.** Expected: PASS.
- [ ] **Step 5: Commit.** `git commit -m "Studio MCP: list_instruments, so the AI writes for the full orchestra"`

### Task 6: Seen and heard on the page; docs

**Files:**
- Create: `websites/www.cs/games/workroom/test/fixtures/score-orchestra-v1.json`, a renderable 4-bar score with
  `violin`, `flute`, `kit` and `celesta` lanes.
- Modify: `websites/www.cs/tests/e2e/workroom.local.ts`
- Modify: `docs/superpowers/roadmap.md` (music: 4a live, 4b next)
- Modify: `websites/www.cs/music/README.md` (the library's instruments and stand-ins)

- [ ] **Step 1: Write the failing e2e check.**
  `orchestra score plays`: open the fixture piece and press Play. Check that the player reaches 2 s with no page
  error, and that the network fetched `violin/*.flac`, `kit/36.flac` and `glock/*.flac` (the celesta stand-in).
- [ ] **Step 2: Run it, and check it fails.** Run that spec only, locally (`make e2e` with the spec filter).
  Expected: FAIL.
- [ ] **Step 3: Load the fixture** the way `score-renderable-v1.json` is loaded, and update the docs.
- [ ] **Step 4: Run it again, then `make test`.** Expected: PASS.
- [ ] **Step 5: Commit.** `git commit -m "Workroom: the orchestra plays on the page; docs"`
