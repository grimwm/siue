# Crete title theme: the first piece, and the tools that make it

The first piece of music for the workroom, and the composing pipeline it needs.
Nothing has been composed yet and the workroom has never held a draft; this
project makes both exist.

## Why

Crete has only its synth effects. The redesign vision gives every chapter music
"once the first piece is done", and the workroom was built so the owner can
answer music by pointing at it. Neither can start until one real piece goes
through the whole loop: composed, rendered, published, heard, answered, revised.
The title theme is that piece because it sets the island's sound, which every
chapter's music will vary.

## What it should feel like (the owner's words)

- "I want to feel awe, but I also want lo-fi style so it feels more mystical
  and thoughtful."
- "Maybe like music from Diablo 1", "Title should be more like Tristram": a
  slow, hummable tune on a plucked instrument over a low drone, melancholy and
  warm, not the dungeon style (that suits the levels later).
- "But with the organ swells like Interstellar": slow pipe-organ swells that
  rise and fall under the tune, carrying the awe.
- "When we are in stories, the Tristram style cinematic music will work": the
  story pages use the same theme.
- Anti-goals: "Sharp noises would ruin it and too much repetitiveness."

## Goals

1. An original piece, `crete-title` in project `crete`, about 3 to 4 minutes,
   that loops without a seam (the loop point sits in a quiet stretch).
2. The sound, my reading of the owner's words (each my call, open to their
   notes):
   - Lead: a plucked lyre or nylon guitar carrying a hummable modal tune
     (D Dorian with Phrygian turns for a Mediterranean colour), 8 bars long,
     slow (about 60–66 BPM).
   - Bed: a low drone, "the labyrinth breathing", on low strings or organ
     pedal, always present but never loud.
   - Awe: pipe organ swells, each rising over 4 to 8 bars and falling back,
     two or three in the piece, the biggest about two thirds of the way in.
   - Colour: distant wordless voices or a far horn, used sparingly.
   - Lo-fi haze over everything: gentle tape saturation, slow wow and flutter,
     a soft hiss floor, a low-pass that rounds off the highs, a long dark
     reverb.
3. Variation instead of repetition: the tune is stated three or four times,
   and no two statements share both their notes and their orchestration
   (re-harmonised, moved to another register or instrument, fragmented, or
   answered by a counter-line). Between statements, quiet passages of drone
   and organ give the ear rest.
4. The pipeline, reusable for every later piece and sound: compose in Python,
   render with sampled instruments, master, and write the full draft folder
   the workroom already expects (`score.json`, `score.musicxml`, `audio.webm`,
   `spectrogram.png`), checked by the same validator `make music-publish` runs.
5. Works anywhere: every tool runs in a podman container built from a file in
   the repo; sample libraries download on first use into a cache outside the
   repo, verified by checksums, never committed.

## Non-goals

- The dungeon music for levels and the per-chapter themes (later pieces; they
  reuse this pipeline and vary this theme).
- Composing or editing inside the workroom (the workroom design's version 2;
  a later project, see the end).
- Any change to the workroom page, its API or its storage.

## Anti-goals (failure even if everything technically works)

- **Sharp sounds.** No hard attacks, clicks, bright transients, or shrill
  highs. Every instrument has a soft attack; plucks are played gently and
  darkened.
- **Wearing thin.** A short loop heard over and over, or a tune repeated
  verbatim.
- **Sounding like Diablo or Interstellar.** Those are the feel, not the
  material; no melody, chord progression or motif is borrowed. Copyrighted
  music is never used as input.

Two of these get a check in the pipeline, run on every render and reported
with the draft (thresholds are the builder's, tuned on the first renders):

- Sharpness: the loudest short transient (peak over a short window against the
  surrounding loudness) and the energy above about 8 kHz both stay under set
  limits; a render that breaks either is not published.
- Repetition: no two statements of the tune have the same notes in the same
  lanes; checked on the composed notes, before rendering.

## How it gets made

### The loop with the owner

1. Claude composes and renders draft `vN` into
   `websites/www.cs/music/pieces/crete-title/vN/`, runs the checks, and opens
   a PR with the source and `score.json`/`score.musicxml`.
2. Claude gives the owner exact, copy-paste steps to publish it:
   `make music-publish PIECE=crete-title` (the owner's key; Claude never runs
   it).
3. The owner listens in the workroom and answers: pins, reactions, the energy
   curve, humming.
4. The owner runs `make music-pickup` (also their key), which saves the notes
   outside the repo; Claude reads them there and makes `vN+1`, with a change
   list that answers each note.
5. **Done** when the owner says the theme is done in the workroom.

Draft 1 is a sketch of about a minute: the tune once, the drone, one organ
swell and the haze, so the owner judges the sound before Claude writes the full
length. Later drafts are full length.

### The pipeline (decided)

- Python composes: the piece is a Python module that builds one note list
  (lane, start, length, pitch, loudness, motif), with sections, characters and
  the energy curve. `score.json`, `score.musicxml` and the MIDI the renderer
  plays are all written from that one list, so they cannot disagree.
- Sampled instruments in SFZ played by sfizz; organ swells and textures may
  use SuperCollider; ffmpeg masters (the lo-fi chain, loudness to a set
  target, the loop seam) and encodes Opus in WebM. A tool draws the
  spectrogram.
- Instruments: only free libraries under an open licence (CC0 or CC-BY, or
  equivalent), each licence checked and recorded with its source, version and
  checksum in a manifest in the repo; attribution for CC-BY goes in the
  piece's README and the game's credits.
- The container file, the manifest, the composing code and the piece's source
  are committed. The sample cache lives outside the repo
  (`~/.cache/siue-music/` or the container's volume).
- Rendering is repeatable: the same source, container and samples give the
  same audio, so renders (`audio.webm`, `spectrogram.png`, the MIDI) are not
  committed; the draft folder keeps them locally for publishing and
  `.gitignore` covers them.
- The renderer writes one stem per lane as well as the mix, so a cut can
  leave lanes out or lower them without a second composition (the story cut
  uses this; my call).
- The score's duration is the loop's length. Mastering folds the reverb and
  tape tail back into the start of the loop, so the audio is exactly as long
  as the score and the workroom's timeline lines up with it (my call).
- `make` targets wrap it: build the container, fetch samples, render a piece
  (`PIECE=`, `VERSION=`), run the checks. None of them touch the live server
  or 1Password.

### After approval: into the game

Once the owner approves, the same project puts the theme in Crete:

- The approved render, encoded for the game, plays on the kit's `music` bus
  under the title card and loops. The kit has no sample player yet, and
  decoding four minutes of stereo costs about 90 MB on a phone, so the game
  streams it from a media element, with two elements crossfading over the
  quiet stretch at the seam (my call; that plan settles the details).
- The story pages play a quieter cut of the same theme (lyre and drone, organ
  held back), mixed from the same stems.
- A Music toggle beside the existing sound mute, remembered like the other
  settings; browsers that block autoplay start the music on the first tap.
- The owner OKs that deploy like any other.

## Constraints

- The siue repo is public: no secrets, no picked-up notes, no copyrighted
  input in git.
- The owner runs every step that uses their key (publish, pickup). Claude
  gives the steps; it never runs them.
- One draft must fit the server's 8 MB limit (`api.py` `MAX_REQUEST_BYTES`):
  about 4 minutes of Opus at roughly 96–128 kb/s plus the spectrogram fits.
- `score.json` must pass `siue_music/score.py` with the glossary's terms.
- Container and test runs on this machine stay memory-capped
  (`systemd-run --user --scope -p MemoryMax=4G -p MemorySwapMax=0`, raised
  only if a full render shows it needs more).

## Plans

The first plan covers the pipeline and draft 1. Later drafts follow the
owner's notes, not a plan. Putting the theme into the game gets its own plan
once the owner approves the theme.

## Left to the builder

- The base image, how sfizz and SuperCollider get into it, and whether
  SuperCollider is needed at all for draft 1. Debian trixie packages
  SuperCollider, fluidsynth and mido but not sfizz, so sfizz is built from a
  pinned source release or taken from its project's own builds.
- Which libraries supply each instrument, within the licence rule.
- The Python libraries for MIDI and MusicXML, and how the code is laid out
  under `websites/www.cs/music/` (piece source beside its drafts or in a
  `compose/` folder).
- The checks' exact measures and thresholds, and the loudness target.
- Tests: the note list to `score.json` and MusicXML agree, the repetition
  check, the validator passes, and a short render in the container produces
  every draft file. Kept fast; the full render is not a unit test.

## Later (not this project)

Composing in the workroom: edit notes in the piano roll, choose instruments,
hear edits in the browser with the same samples, and send the edited score back
as a note. The score from this pipeline is built to be the source of truth that
editing will change.
