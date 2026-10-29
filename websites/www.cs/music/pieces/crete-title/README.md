# Crete: title theme

Ariadne's tune in D Dorian with a Phrygian turn, over a low drone, with slow
organ swells and a lo-fi haze; 62 BPM, about 3.6 minutes, looping. The tune
comes four times: on the lyre, in the cellos under a lyre ostinato, on the
organ at the peak (with a far horn answering and the turn landing on D major),
and as a slow, high fragment as it fades. Source:
`music/compose/pieces/crete_title.py`. Design:
`docs/superpowers/specs/2026-10-28-crete-title-theme-design.md`.

Make a draft's audio and spectrogram with `make music-render PIECE=crete-title VERSION=<n>`
(they are not committed), then publish it with `make music-publish PIECE=crete-title`.
A score-only draft (v4) has no audio or spectrogram to make: its render writes the score.

- v1: a one-minute sketch of the sound: the tune once, one organ swell, then the
  drone alone, returning to the start. It is also its own piece,
  `crete-title-short`.
- v2: the full theme.
- v3: the same music as v2, with working sheet music.
- v4: the same music as v3, sent as its score alone: the workroom builds its
  sound in the browser. Publish it, then compare it with v3 by ear.

The game plays draft 3's `CUT=full` on every screen, as
`games/crete/audio/music/title.*`.

## Credits

Samples: VSCO-2 Community Edition 1.1.0 by Versilian Studios (CC0 1.0): harp,
cellos, contrabass, French horn and organ (the organ sampled by Simon Dalzell
of Ivy Audio).
