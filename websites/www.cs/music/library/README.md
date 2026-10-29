# Shared sample library

Every sample the composing pipeline renders with, as lossless FLAC at the rate and depth it was recorded, one file per sounding pitch: `<instrument>/<midi pitch>.flac`. `library.json` lists them (rate, channels, and the loop points of the sustained instruments). The browser renderer plays these.

Built by `make music-library` from `music/compose/samples.json`; do not edit by hand.

- Samples: VSCO-2 Community Edition 1.1.0 (`library.json` names the exact commit)
- Credit: Versilian Studios; organ sampled by Simon Dalzell of Ivy Audio
- Licence: CC0 1.0 Universal (public domain dedication)
