# Shared sample library

Every sample the composing pipeline renders with, as lossless FLAC at the rate and depth it was recorded, one file per sounding pitch: `<instrument>/<midi pitch>.flac`. `library.json` lists them (rate, channels, and the loop points of the sustained instruments). The browser renderer plays these.

Built by `make music-library` from `music/compose/samples.json`; do not edit by hand.

- Samples: VSCO-2 Community Edition 1.1.0 (`library.json` names the exact commit)
- Credit: Versilian Studios; organ sampled by Simon Dalzell of Ivy Audio
- Licence: CC0 1.0 Universal (public domain dedication)

## Instruments

Each instrument also carries the composer's catalogue entry in `library.json`: name, category, normal and expert range, home note,
clef, written transposition, General MIDI program and name, drum pieces, picker icon, and the default attack and release. A drum
kit (`pitched: false`) plays each sample only on its own key. A stand-in has no samples of its own: `library.json` lists its target's
files, so it costs nothing here, and a score keeps naming the real instrument.

Two libraries, both CC0 1.0 Universal:
- **VSCO-2 CE** (Versilian Studios; organ by Simon Dalzell of Ivy Audio), `https://github.com/sgossner/VSCO-2-CE`, at the commit
  `library.json` names.
- **VCSL**, the Versilian Community Sample Library (Versilian Studios and contributors), `https://github.com/sgossner/VCSL`, at the
  commit `library.json`'s `sources.vcsl` names. An instrument from it has `from: "vcsl"`.

Each root is where the sample sounds, measured: VCSL names its notes an octave below that (it counts C3 as middle C), and VSCO-2
CE names Glockenspiel, Xylophone and Piccolo by their written pitch.

| id | Instrument | Library | Samples |
|---|---|---|---|
| `violin` | Violin | VSCO-2 CE | `Strings/Solo Violin/Arco Vib` |
| `viola` | Viola | VSCO-2 CE | `Strings/Viola Section/susvib` |
| `cello` | Cello | VSCO-2 CE | `Strings/Cello Section/susvib` |
| `bass` | Double Bass | VSCO-2 CE | `Strings/Solo Contrabass/SusNV` |
| `harp` | Harp | VSCO-2 CE | `Strings/Harp` |
| `lyre` | Lyre | VCSL | `Chordophones/Composite Chordophones/Folk Harp` |
| `flute` | Flute | VSCO-2 CE | `Woodwinds/Flute/susNV` |
| `piccolo` | Piccolo | VSCO-2 CE | `Woodwinds/Piccolo/Sus` |
| `oboe` | Oboe | VSCO-2 CE | `Woodwinds/Oboe/Sus` |
| `clarinet` | Clarinet | VSCO-2 CE | `Woodwinds/Clarinet/susLong` |
| `bassoon` | Bassoon | VSCO-2 CE | `Woodwinds/Bassoon/sus` |
| `trumpet` | Trumpet | VSCO-2 CE | `Brass/Trumpet/sus` |
| `horn` | French Horn | VSCO-2 CE | `Brass/F Horn/sus` |
| `trombone` | Trombone | VSCO-2 CE | `Brass/Tenor Trombone/sus` |
| `tuba` | Tuba | VSCO-2 CE | `Brass/Tuba/sus` |
| `piano` | Piano | VSCO-2 CE | `Keys/Upright Piano` |
| `organ` | Organ | VSCO-2 CE | `Keys/Organ/Quiet` |
| `celesta` | Celesta | — | Stand-in: Glockenspiel |
| `timpani` | Timpani | VSCO-2 CE | `Percussion/Timpani` |
| `glock` | Glockenspiel | VSCO-2 CE | `Percussion/Glock` |
| `xylo` | Xylophone | VSCO-2 CE | `Percussion/Xylo` |
| `marimba` | Marimba | VSCO-2 CE | `Percussion/Marimba` |
| `vibes` | Vibraphone | VCSL | `Idiophones/Struck Idiophones/Vibraphone/Soft Mallets` |
| `bells` | Tubular Bells | VCSL | `Idiophones/Struck Idiophones/Tubular Bells 2` |
| `kit` | Drum Kit | VCSL | `Idiophones/Struck Idiophones/Clash Cymbals 1`, `Idiophones/Struck Idiophones/Hi-Hat Cymbal`, `Idiophones/Struck Idiophones/Suspended Cymbal 2`, `Membranophones/Struck Membranophones/Bass Drum 3 - Legacy`, `Membranophones/Struck Membranophones/Snare Drum, Modern 1`, `Membranophones/Struck Membranophones/Tom 1/Stick`, `Membranophones/Struck Membranophones/Tom 2/Stick` |
| `orch` | Orchestral Percussion | VSCO-2 CE | `Percussion`, `VSCO 1 Percussion/drums/bass`, `VSCO 1 Percussion/varMetal/Cymbals/clash` |
| `choir` | Choir (Aahs / Oohs) | — | Stand-in: Organ |

What is not the instrument itself (the picker says "Stand-In Sound"):
- **Celesta** plays the Glockenspiel's samples at its own pitches, and **Choir** the Organ with a soft start: neither VSCO-2 CE nor VCSL has
  them, and no CC0 or public-domain multisample of either was found.
- **Lyre** plays VCSL's folk harp: no lyre has been recorded under a CC0 or public-domain licence.
- **Drum Kit**'s ride is a suspended cymbal struck with a stick; the rest of the kit is its own (VCSL).
