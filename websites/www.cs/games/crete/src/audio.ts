/* The Island of Crete: sound. A tiny synth on the kit's audio core, no
 * assets: the game names an event (`sfx('caught')`) and this module voices
 * it. A muted player, or a browser without Web Audio, hears nothing. DOM
 * program (src/tsconfig.dom.json). */
import { createAudioCore } from "../../_kit/audio/core.ts";
import type { AudioCore } from "../../_kit/audio/core.ts";
import type { SfxName } from "./game.ts";

export interface Audio {
  /** Wake the audio context; call from a user gesture. */
  ensure(): void;
  /** Voice an event. */
  sfx(name: SfxName): void;
  /** Flip the mute switch; returns whether the sound is now muted. */
  toggleMute(): boolean;
}

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
  hint: [[980, 0.07, "sine", 0.04]],
};

export function createAudio(core: AudioCore = createAudioCore()): Audio {
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
      if (!muted) core.unlock();
      return muted;
    },
  };
}
