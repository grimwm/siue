# Audio credits

Every source here is CC0 1.0 (public domain dedication,
https://creativecommons.org/publicdomain/zero/1.0/). Credit is not required by
CC0 and is given anyway.

## Sound effects (`sfx/`)

Each effect is a mix of the layers below, run through one shared processing
chain ("gritty 16-bit artillery": 22.05 kHz mono, EQ, bit-crush, tanh soft
clip, short room, peak-normalised to -2 dBFS) and encoded as mono mp3. The
sounds are therefore changed, not transcoded copies. `sfx/build_sfx.sh`
downloads the sources (SHA-256 pinned) and rebuilds every file; the exact
filter graph for each effect is in that script.

| File | Layers (source file, pack) |
|---|---|
| `boom.mp3` | `explosion.wav`, Explosion (number99); `lowFrequency_explosion_001.ogg` and `explosionCrunch_002.ogg`, Sci-fi Sounds (Kenney) |
| `launch.mp3` | `cannon_02.ogg` and `shot_01.ogg`, 25 CC0 bang / firework SFX (Snabisch); `impactSoft_heavy_000.ogg` and `impactMetal_medium_001.ogg`, Impact Sounds (Kenney) |
| `clank.mp3` | `impactMetal_heavy_003.ogg` and `impactMetal_medium_000.ogg`, Impact Sounds (Kenney); `bong1.wav`, Metal Impact Sounds (Brian MacIntosh) |
| `thud.mp3` | `impactSoft_heavy_001.ogg` and `impactPunch_heavy_002.ogg`, Impact Sounds (Kenney) |
| `move.mp3` | `engineCircular_002.ogg`, Sci-fi Sounds; `footstep_concrete_000.ogg` and `footstep_concrete_003.ogg`, Impact Sounds (Kenney) |
| `click.mp3` | `click_004.ogg` and `click_005.ogg`, Interface Sounds (Kenney) |
| `cash.mp3` | `handleCoins.ogg`, RPG Audio (Kenney); `bing1.wav`, Metal Impact Sounds (Brian MacIntosh) |
| `warn.mp3` | `error_001.ogg` and `error_002.ogg`, Interface Sounds (Kenney) |
| `bark.mp3` | `question_003.ogg`, Interface Sounds (Kenney) |
| `win.mp3` | `8-Bit jingles/jingles_NES12.ogg`, Music Jingles (Kenney) |
| `lose.mp3` | `8-Bit jingles/jingles_NES07.ogg`, Music Jingles (Kenney), pitched down |
| `fanfare.mp3` | `8-Bit jingles/jingles_NES00.ogg`, Music Jingles (Kenney) |

Sources and the licence each states:

- Kenney (https://kenney.nl), whose License.txt in each pack reads "Creative
  Commons Zero, CC0": Sci-fi Sounds https://kenney.nl/assets/sci-fi-sounds,
  Impact Sounds https://kenney.nl/assets/impact-sounds, Interface Sounds
  https://kenney.nl/assets/interface-sounds, RPG Audio
  https://kenney.nl/assets/rpg-audio, Music Jingles
  https://kenney.nl/assets/music-jingles.
- Snabisch, "25 CC0 bang / firework SFX":
  https://opengameart.org/content/25-cc0-bang-firework-sfx (License(s): CC0).
- number99, "Explosion": https://opengameart.org/content/explosion-0
  (License(s): CC0).
- Brian MacIntosh, "Metal Impact Sounds":
  https://opengameart.org/content/metal-impact-sounds (License(s): CC0).

## Music (`music/`)

Each file is the author's track, loudness-normalised to one level and encoded
as stereo mp3 at 80 kbps with metadata stripped by `music/build_music.sh`,
which downloads the source and refuses it unless its SHA-256 (last column)
matches. Each page below states CC0 in its License(s) field, copied exactly
into the table. The author is the composer the page names; OpenGameArt's own
"Author" line shows who uploaded it.

| File | Title | Author | Source page | License field | Download SHA-256 |
|---|---|---|---|---|---|
| `battle-theme-a.mp3` | Battle Theme A | cynicmusic | https://opengameart.org/content/battle-theme-a | CC0 | 6042399782e581d753d616bc703e66483d5eccb5fb687a20c9a552d68c49e620 |
| `chiptune-level-1.mp3` | Action Chiptune 1 | Juhani Junkala | https://opengameart.org/content/5-chiptunes-action | CC0 | ea189990c0fb9a700187ccc740eda72400341a082305a163867467d96346460d |
| `awake-megawall-10.mp3` | Awake! (Megawall-10) | cynicmusic | https://opengameart.org/content/awake-megawall-10 | CC0 | 462c85304df0ea5369cb98aaae158108c92227fa5f442fb63a2da6febbe82ded |
| `chiptune-level-3.mp3` | Action Chiptune 3 | Juhani Junkala | https://opengameart.org/content/5-chiptunes-action | CC0 | ea189990c0fb9a700187ccc740eda72400341a082305a163867467d96346460d |
| `artillery-mans-stage.mp3` | Artillery Man's Stage | Spring Spring | https://opengameart.org/content/artillery-mans-stage | CC0 | 0ac84d7f50d24db53de8e256ef5534606fe3b35ec82f8ebc4a6dd32bcfdb4e8a |
| `abandoned-hopes.mp3` | Abandoned Hopes | Jonathan So | https://opengameart.org/content/abandoned-hopes | CC0 | 556a2178173bf62a44bcc0e3e5c640f1b9421f8f9c28c49a6fd8c3b17f032f7d |
| `great-boss.mp3` | Great Boss | Spring Spring | https://opengameart.org/content/great-boss | CC0 | 5a9eaa1236c36efbdf36c5b576c722057d8a7177f8277fd42105e013eaf19aac |
| `inevitable-doom.mp3` | Inevitable Doom | celestialghost8 | https://opengameart.org/content/inevitable-doom | CC0 | cef9610f1a708fa039c6ef61f2851413f0d2d09b27cdca4943778a76d428be47 |
| `boss-battle-1.mp3` | Boss Battle #1 | nene | https://opengameart.org/content/boss-battle-1-8-bit-re-upload | CC0 | 70508dcdb1e1b29884913f6d73949b0dfaa097390b23e9a53fd3067e1cb80781 |
| `chip-bit-danger.mp3` | Chip Bit Danger | Sudocolon | https://opengameart.org/content/chip-bit-danger | CC0 | 6656f7ee749dfcb060effcd9ce73da6be9d3006cd189463bc7e7429f2ccf600f |
| `mecha-collection.mp3` | Mecha Collection | Jonathan So | https://opengameart.org/content/mecha-collection | CC0 | d2d1e2b188c91a99efab0e5cb964861b5540095b0e1c2c646b83601a7874ecb5 |
| `hey-boss.mp3` | Hey Boss! | megupets | https://opengameart.org/content/hey-boss | CC0 | af6f6ed2a3c97f04c0b9b5092ee51bc2d8d69ae41b98172d6ed33037beb08caa |
| `nes-shooter-mars.mp3` | Mars (NES Shooter Music) | SketchyLogic | https://opengameart.org/content/nes-shooter-music-5-tracks-3-jingles | CC0 | cefe1973eda47bd0388d5e80c50cf224a6d7c473276a11a3c90d6b4b8e7f0e6a |
| `8-bit-battle-theme.mp3` | 8 bit battle theme | celestialghost8 | https://opengameart.org/content/8-bit-battle-theme-famitracker | CC0 | 73d4f61dd69a89edb7948cdc0bac14ce878c6ab46bc8ec4118867b5ab147772b |
| `the-monarchs-rule.mp3` | The Monarch's Rule | Jonathan So | https://opengameart.org/content/the-monarchs-rule | CC0 | 238239ff2d976e01f0f7521ec2858caf7070bb6abdaa45a883a9800f4c56bf81 |
| `operation-unthinkable.mp3` | Operation Unthinkable | Spring Spring | https://opengameart.org/content/operation-unthinkable | CC0 | 47f876174af5a8125dcb807aeced5a31e44b97336bf54b204bd8aabda43d33f4 |

cynicmusic's site is https://cynicmusic.com; Juhani Junkala's tracks are
"Level 1" and "Level 3" from his pack "5 Chiptunes (Action)". Mars is the file
`Mars.wav` from SketchyLogic's "NES Shooter Music (5 tracks, 3 jingles)", and
Boss Battle #1 is nene's version 1 (`Boss Battle #1 V1.wav`).
