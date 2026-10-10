/* The Island of Crete: sound. A tiny Web Audio synth, no assets. The engine
 * names an event (`sfx('hurt')`) and this module voices it; a browser with no
 * audio, or a muted player, stays silent. This file needs the DOM lib (the
 * audio context hangs off `window`), so it is in the second program
 * (src/tsconfig.dom.json). It imports nothing at run time.
 */

import type { SfxName } from "./engine.js";

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

export function createAudio(): Audio {
  type Ctor = typeof AudioContext;
  let ac: AudioContext | null = null;
  let muted = false;

  /** The context, made on first use; throws where there is no audio. */
  function context(): AudioContext {
    const w = window as unknown as { AudioContext?: Ctor; webkitAudioContext?: Ctor };
    const Make = w.AudioContext || w.webkitAudioContext;
    if (!Make) throw new Error("no Web Audio");
    ac = ac || new Make();
    return ac;
  }

  function ensure(): void {
    if (muted) return;
    try {
      const ctx = context();
      if (ctx.state === "suspended") void ctx.resume();
    } catch (_) {
      /* headless harness or no audio: stay silent */
    }
  }

  function tone(freq: number, dur: number, type?: OscillatorType, vol?: number, when?: number): void {
    if (muted) return;
    try {
      const ctx = context();
      const t = ctx.currentTime + (when || 0);
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type || "square";
      o.frequency.value = freq;
      g.gain.setValueAtTime(vol || 0.04, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g);
      g.connect(ctx.destination);
      o.start(t);
      o.stop(t + dur + 0.02);
    } catch (_) {
      /* silent */
    }
  }

  return {
    ensure,
    sfx(name) {
      for (const v of VOICES[name]) tone(...v);
    },
    toggleMute() {
      muted = !muted;
      if (!muted) ensure();
      return muted;
    },
  };
}
