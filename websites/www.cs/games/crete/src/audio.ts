/* The Island of Crete: sound. A tiny synth on the kit's audio core, no
 * assets: the engine names an event (`sfx('hurt')`) and this module voices
 * it. A muted player, or a browser without Web Audio, hears nothing. DOM
 * program (src/tsconfig.dom.json). */
import { createAudioCore } from "../../_kit/audio/core.ts";
import type { AudioCore } from "../../_kit/audio/core.ts";
import type { SfxName } from "./engine.ts";

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
  move: [[220, 0.05]],
  bump: [[90, 0.09, "sine", 0.06]],
  pickup: [[660, 0.06], [880, 0.08, "square", 0.04, 0.06]],
  page: [[523, 0.08, "sine"], [659, 0.08, "sine", 0.04, 0.08], [784, 0.1, "sine", 0.04, 0.16]],
  open: [[330, 0.07], [495, 0.1, "square", 0.04, 0.07]],
  bash: [[140, 0.12, "sawtooth", 0.06], [90, 0.1, "sine", 0.06, 0.05]],
  hurt: [[300, 0.15, "sawtooth", 0.05], [190, 0.2, "sawtooth", 0.05, 0.1]],
  win: [523, 659, 784, 1046].map((f, i): Voice => [f, 0.12, "square", 0.04, i * 0.1]),
  lose: [[160, 0.4, "sawtooth", 0.06], [110, 0.55, "sawtooth", 0.06, 0.2]],
  heart: [[70, 0.1, "sine", 0.07]],
  hint: [[980, 0.07, "sine", 0.04]],
  answerOn: [[740, 0.08, "sine", 0.04]],
  answerOff: [[420, 0.08, "sine", 0.04]],
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
