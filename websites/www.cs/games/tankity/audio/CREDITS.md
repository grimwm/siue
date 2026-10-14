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

cynicmusic's site is https://cynicmusic.com; Juhani Junkala's tracks are
"Level 1" and "Level 3" from his pack "5 Chiptunes (Action)".
