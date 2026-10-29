/* The Island of Crete: sound. A tiny synth on the kit's audio core, no
 * assets: the game names an event (`sfx('caught')`) and this module voices
 * it. The music (src/music.ts) plays on the core's music bus, which has its
 * own switch; the Sound switch silences both. A muted player, or a browser
 * without Web Audio, hears nothing. DOM program (src/tsconfig.dom.json). */
import { createAudioCore } from "../../_kit/audio/core.ts";
import type { AudioCore } from "../../_kit/audio/core.ts";
import type { SfxName } from "./game.ts";

export interface Audio {
  /** Wake the audio context; call from a user gesture. */
  ensure(): void;
  /** Voice an event. */
  sfx(name: SfxName): void;
  /** Flip the mute switch, which silences the effects and the music; returns whether the sound is now muted. */
  toggleMute(): boolean;
  /** The Music switch: the music bus alone. */
  setMusic(on: boolean): void;
  /** Whether music can be heard: Sound on and Music on. */
  musicHeard(): boolean;
}

/** The music bus's gain: the renders are mastered to -20 LUFS, which would cover the synth's quiet effects. */
export const MUSIC_GAIN = 0.5;

type Voice = [freq: number, dur: number, type?: OscillatorType, vol?: number, when?: number];

/** Each event as the tones it plays, in order. */
const VOICES: Record<SfxName, Voice[]> = {
  step: [[220, 0.05]],
  push: [[130, 0.09, "sawtooth", 0.05], [100, 0.07, "sine", 0.05, 0.04]],
  splash: [[400, 0.05, "sine", 0.05], [260, 0.09, "sine", 0.05, 0.05], [180, 0.12, "sine", 0.04, 0.12]],
  sizzle: [[1200, 0.04, "sawtooth", 0.03], [900, 0.05, "sawtooth", 0.03, 0.04], [1400, 0.05, "sawtooth", 0.025, 0.09]],
  door: [[330, 0.07], [495, 0.1, "square", 0.04, 0.07]],
  key: [[784, 0.05, "sine"], [1175, 0.1, "sine", 0.04, 0.05]],
  relic: [[523, 0.08, "sine"], [784, 0.14, "sine", 0.05, 0.08]],
  gate: [[392, 0.1, "square"], [523, 0.1, "square", 0.04, 0.1], [659, 0.1, "square", 0.04, 0.2], [784, 0.2, "square", 0.04, 0.3]],
  button: [[180, 0.05, "square", 0.05], [270, 0.07, "square", 0.04, 0.05]],
  slide: [[500, 0.12, "sine", 0.03], [350, 0.12, "sine", 0.03, 0.06]],
  caught: [[300, 0.15, "sawtooth", 0.05], [190, 0.2, "sawtooth", 0.05, 0.1]],
  stone: [[140, 0.2, "triangle", 0.06], [95, 0.25, "triangle", 0.06, 0.12]],
  win: [523, 659, 784, 1046].map((f, i): Voice => [f, 0.12, "square", 0.04, i * 0.1]),
  lose: [[160, 0.4, "sawtooth", 0.06], [110, 0.55, "sawtooth", 0.06, 0.2]],
  bump: [[90, 0.09, "sine", 0.06]],
  pickup: [[660, 0.06], [880, 0.08, "square", 0.04, 0.06]],
  page: [[523, 0.08, "sine"], [659, 0.08, "sine", 0.04, 0.08], [784, 0.1, "sine", 0.04, 0.16]],
  chapter: [[196, 0.5, "triangle", 0.05], [294, 0.5, "triangle", 0.04, 0.12], [392, 0.7, "triangle", 0.04, 0.24]],
  snap: [[240, 0.04, "square", 0.05], [120, 0.08, "square", 0.05, 0.04]],
  reveal: [[440, 0.06, "triangle", 0.05], [660, 0.1, "triangle", 0.04, 0.06]],
  rise: [[110, 0.1, "sawtooth", 0.04], [165, 0.1, "sawtooth", 0.04, 0.08], [220, 0.12, "sawtooth", 0.04, 0.16]],
  warp: [[300, 0.06, "sine", 0.05], [900, 0.08, "sine", 0.04, 0.05], [450, 0.1, "sine", 0.04, 0.12]],
  thief: [[700, 0.05, "square", 0.03], [520, 0.05, "square", 0.03, 0.06], [380, 0.09, "square", 0.03, 0.12]],
  boom: [[80, 0.3, "sawtooth", 0.07], [55, 0.4, "triangle", 0.07, 0.05]],
  clone: [[600, 0.05, "triangle", 0.05], [600, 0.05, "triangle", 0.05, 0.09], [900, 0.1, "triangle", 0.04, 0.18]],
  home: [[500, 0.06, "sine", 0.04], [250, 0.06, "sine", 0.04, 0.07], [125, 0.1, "sine", 0.04, 0.14]],
  hint: [[980, 0.07, "sine", 0.04]],
};

export function createAudio(core: AudioCore = createAudioCore()): Audio {
  let musicOn = true;
  const musicHeard = (): boolean => musicOn && !core.isMuted("sfx");
  const applyMusic = (): void => core.setMuted("music", !musicHeard());
  core.setGain("music", MUSIC_GAIN);
  return {
    ensure() {
      if (!core.isMuted("sfx")) core.unlock();
    },
    sfx(name) {
      for (const [freq, dur, type, vol, when] of VOICES[name]) {
        core.tone({ freq, dur, type: type ?? "square", vol: vol ?? 0.04, when: when ?? 0 });
      }
    },
    toggleMute() {
      const muted = !core.isMuted("sfx");
      core.setMuted("sfx", muted);
      applyMusic();
      if (!muted) core.unlock();
      return muted;
    },
    setMusic(on) {
      musicOn = on;
      applyMusic();
    },
    musicHeard,
  };
}
