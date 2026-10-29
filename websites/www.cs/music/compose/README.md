# Composing

Pieces for the music workroom are written in Python and rendered here into the
draft folders `make music-publish` sends (`music/pieces/<piece>/v<n>/`).

- `make music-image` builds the container (Debian, sfizz 1.2.3 built from its
  pinned source, ffmpeg, music21). Every tool runs in it, so any machine with
  podman makes the same drafts.
- `make music-render PIECE=crete-title VERSION=1` composes `pieces/crete_title.py`,
  renders one stem per lane with sfizz, masters it (soft saturation, slow tape
  wow and flutter, a low-pass, a long dark reverb, a hiss floor, loudness
  -20 LUFS), folds the reverb tail onto the start so the loop has no seam, and
  writes `score.json`, `score.musicxml`, `audio.webm` (Opus, 96 kb/s) and
  `spectrogram.png`. It refuses a draft that breaks a check, fails the
  workroom's score rules or is over 8 MB.
- `make music-render PIECE=crete-title VERSION=3 CUT=story` mixes that rendered
  draft's stems again as a cut (`siue_compose/cut.py`): each lane's gain moved
  by the piece's `CUTS[<name>]`, through the same master chain and loop fold,
  to the cut's own loudness. It writes `cuts/<name>.webm` (Opus, 96 kb/s) and
  `cuts/<name>.m4a` (AAC, 96 kb/s, for Safari) in the draft folder. `CUT=full`
  is every piece's: every lane as composed, the draft's own mix. Games take
  their music from cuts.
- A draft listed in its piece's `SCORE_ONLY` is rendered the same way, for the
  checks, but keeps only `score.json` (with no audio and no spectrogram) and
  `score.musicxml`: the workroom builds its sound in the browser from the
  shared sample library (`music/library/`).
- `make music-compose-test` runs the tests in the container.

## Checks

- **Repetition:** two statements of a motif with the same notes in the same
  lanes.
- **Sharpness:** a 5 ms peak more than 18 dB above the 400 ms around it, or
  energy above 8 kHz more than -30 dB of the whole.

## Samples

`samples.json` names every sample file, its sha256 and its sounding pitch. Files
download once from the library's pinned commit into `~/.cache/siue-music/samples/`
(or `$SIUE_MUSIC_CACHE`) and are never committed. Only CC0 or CC-BY libraries
are used; their credits go in each piece's README.

- VSCO-2 Community Edition 1.1.0 (CC0 1.0) by Versilian Studios; the organ was
  sampled by Simon Dalzell of Ivy Audio.

Renders (`audio.webm`, `spectrogram.png`, `stems/`, `midi/`, `cuts/`) are git-ignored:
the same source, container and samples make them again.
