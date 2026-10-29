# Audio credits

The sound effects are synthesised in the page (`src/audio.ts`) and use no
recordings.

## Music (`music/`)

- `title.webm`, `title.m4a`: "Crete: title theme", composed for this game
  (`websites/www.cs/music/compose/pieces/crete_title.py`, draft 3).
- `story.webm`, `story.m4a`: its story cut, the same stems mixed again with
  the organ held back and the horn and cellos a little softer
  (`CUTS["story"]` in the same file).

Both are rendered by `make music-render PIECE=crete-title VERSION=3` and then
`CUT=full` and `CUT=story` (in `websites/www.cs`); the cuts land in
`music/pieces/crete-title/v3/cuts/` and are copied here as `title.*` and
`story.*`.

Samples: VSCO-2 Community Edition 1.1.0 by Versilian Studios, CC0 1.0
(https://creativecommons.org/publicdomain/zero/1.0/): harp, cellos,
contrabass, French horn and organ, the organ sampled by Simon Dalzell of Ivy
Audio. Credit is not required by CC0 and is given anyway.
