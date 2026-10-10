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

Each file is the author's track transcoded to stereo mp3 at 80 kbps with
metadata stripped; the sound itself is unchanged.

Each page below states the license as "CC0" in its License(s) field.

| File | Title | Author | Source |
|---|---|---|---|
| `battle-theme-a.mp3` | Battle Theme A | cynicmusic (https://cynicmusic.com) | https://opengameart.org/content/battle-theme-a |
| `awake-megawall-10.mp3` | Awake! (Megawall-10) | cynicmusic | https://opengameart.org/content/awake-megawall-10 |
| `chiptune-level-1.mp3` | Action Chiptune, Level 1 | Juhani Junkala | https://opengameart.org/content/5-chiptunes-action (file "Level 1") |
| `chiptune-level-3.mp3` | Action Chiptune, Level 3 | Juhani Junkala | https://opengameart.org/content/5-chiptunes-action (file "Level 3") |
