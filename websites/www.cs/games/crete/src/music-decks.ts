/* The Island of Crete: the music's decks (src/music.ts). Each is one media
 * element, streamed rather than decoded (four minutes decoded would hold
 * about 90 MB on a phone), through its own gain onto the kit's music bus, so
 * the Music and Sound switches and the fades all work on Web Audio. Without
 * Web Audio a deck sets the element's own volume. DOM program
 * (src/tsconfig.dom.json). */
import type { AudioCore } from "../../_kit/audio/core.ts";
import type { Deck } from "./music.ts";

/** One encoding of a track, with the type canPlayType is asked about. */
export interface AudioSource {
  url: string;
  type: string;
}

/** What a deck uses of an HTMLAudioElement. */
export type MediaLike = Pick<HTMLAudioElement, "src" | "preload" | "currentTime" | "duration" | "volume" | "play" | "pause">;

/** The first source the browser says it can play, or null. */
export function pickSource(sources: readonly AudioSource[], canPlay: (type: string) => string): AudioSource | null {
  return sources.find(s => canPlay(s.type) !== "") ?? null;
}

export function mediaDeck(core: AudioCore, url: string, el: MediaLike): Deck {
  el.preload = "auto";
  el.src = url;
  let gain: GainNode | null = null;
  let wired = false;

  /** Routes the element through its gain, once; null without Web Audio. */
  function wire(): GainNode | null {
    if (wired) return gain;
    const c = core.context();
    const bus = core.bus("music");
    if (!c || !bus) return null;
    wired = true;
    try {
      const source = c.createMediaElementSource(el as HTMLMediaElement);
      const g = c.createGain();
      g.gain.value = 0;
      source.connect(g);
      g.connect(bus);
      gain = g;
    } catch {
      // A context that cannot take the element: it plays at its own volume.
    }
    return gain;
  }

  return {
    play() {
      wire();
      return el.play();
    },
    pause: () => el.pause(),
    position: () => el.currentTime,
    seek(seconds) {
      try {
        el.currentTime = seconds;
      } catch {
        // An element with nothing loaded yet may refuse; it starts from 0.
      }
    },
    duration: () => el.duration,
    fade(to, seconds) {
      const g = wire();
      const c = core.peek();
      if (!g || !c) {
        el.volume = to;
        return;
      }
      const now = c.currentTime;
      const from = g.gain.value;
      g.gain.cancelScheduledValues(now);
      g.gain.setValueAtTime(seconds > 0 ? from : to, now);
      if (seconds > 0) g.gain.linearRampToValueAtTime(to, now + seconds);
    },
  };
}
