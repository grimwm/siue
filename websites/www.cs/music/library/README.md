# Shared sample library

Every sample the composing pipeline renders with, as lossless FLAC at the rate and depth it was recorded, one file per sounding pitch: `<instrument>/<midi pitch>.flac`. `library.json` lists them (rate, channels, and the loop points of the sustained instruments). The browser renderer plays these.

Built by `make music-library` from `music/compose/samples.json`; do not edit by hand.

- Samples: VSCO-2 Community Edition 1.1.0 (`library.json` names the exact commit)
- Credit: Versilian Studios; organ sampled by Simon Dalzell of Ivy Audio
- Licence: CC0 1.0 Universal (public domain dedication)

## Instruments

Each instrument also carries the composer's catalogue entry in `library.json`: name, category, normal and expert range, home note,
clef, written transposition, General MIDI program and name, drum pieces, and the default attack and release. A drum kit (`pitched:
false`) plays each sample only on its own key. A stand-in has no samples of its own: `library.json` lists its target's files, so it
costs nothing here, and a score keeps naming the real instrument.

Glockenspiel, Xylophone and Piccolo are filed by VSCO-2 CE under their written pitch; here each sits where it sounds.

| id | Instrument | VSCO-2 CE folder |
|---|---|---|
| `violin` | Violin | `Strings/Solo Violin/Arco Vib` |
| `viola` | Viola | `Strings/Viola Section/susvib` |
| `cello` | Cello | `Strings/Cello Section/susvib` |
| `bass` | Double Bass | `Strings/Solo Contrabass/SusNV` |
| `harp` | Harp | `Strings/Harp` |
| `flute` | Flute | `Woodwinds/Flute/susNV` |
| `piccolo` | Piccolo | `Woodwinds/Piccolo/Sus` |
| `oboe` | Oboe | `Woodwinds/Oboe/Sus` |
| `clarinet` | Clarinet | `Woodwinds/Clarinet/susLong` |
| `bassoon` | Bassoon | `Woodwinds/Bassoon/sus` |
| `trumpet` | Trumpet | `Brass/Trumpet/sus` |
| `horn` | French Horn | `Brass/F Horn/sus` |
| `trombone` | Trombone | `Brass/Tenor Trombone/sus` |
| `tuba` | Tuba | `Brass/Tuba/sus` |
| `piano` | Piano | `Keys/Upright Piano` |
| `organ` | Organ | `Keys/Organ/Quiet` |
| `celesta` | Celesta | stand-in: Glockenspiel, 1 octave lower |
| `timpani` | Timpani | `Percussion/Timpani` |
| `glock` | Glockenspiel | `Percussion/Glock` |
| `xylo` | Xylophone | `Percussion/Xylo` |
| `marimba` | Marimba | `Percussion/Marimba` |
| `vibes` | Vibraphone | stand-in: Marimba |
| `bells` | Tubular Bells | `Percussion` |
| `kit` | Drum Kit | `Percussion`, `VSCO 1 Percussion/drums/bass`, `VSCO 1 Percussion/drums/tenor/tenor_higher`, `VSCO 1 Percussion/drums/tenor/tenor_lower`, `VSCO 1 Percussion/varMetal/Cymbals/susp` |
| `orch` | Orchestral Percussion | `Percussion`, `VSCO 1 Percussion/drums/bass`, `VSCO 1 Percussion/varMetal/Cymbals/clash` |
| `choir` | Choir (Aahs / Oohs) | stand-in: Organ |

Notes on the gaps:
- Tubular Bells: only a few bells were recorded; the rest are stretched from the nearest.
- Drum Kit: VSCO-2 CE has no drum kit. The kick is its muted bass drum, the toms its tenor drums, and the hi-hats and ride its
  suspended cymbal struck with a stick.
- Celesta, Vibraphone and Choir are stand-ins until CC0 or public-domain samples of their own are found.
