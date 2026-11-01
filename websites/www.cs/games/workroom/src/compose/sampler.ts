// Notes heard the moment they are played: each key sounds its instrument's library sample, picked and pitched as the
// renderer picks it (render/plan.ts), with the part's level and attack, and released with its release when the key
// comes up. Samples are decoded once for the page (shared with the renderer's cache). The audio context and the
// sample loading are ports, so the tests hand in fakes.
import { regions, velocityGain } from '../render/plan.ts';
import type { Library, LibraryFile } from '../render/plan.ts';
import type { Sound } from '../score.ts';

/** How loud a live note is at velocity 127 and 0 dB: the rendered piece is levelled afterwards, live notes are not. */
export const LIVE_LEVEL = 0.5;

/** The sample a pitch plays and how; null when the instrument has none for it (a drum with no piece on that key). */
export function liveVoice(lib: Library, sound: Sound, pitch: number, velocity: number): { file: LibraryFile; rate: number; gain: number; loop: [number, number] | null } | null {
  const inst = lib.instruments[sound.instrument];
  if (!inst) return null;
  const region = regions(inst.files, inst.pitched !== false).find(r => pitch >= r.lo && pitch <= r.hi);
  if (!region) return null;
  return { file: region.file, rate: 2 ** ((pitch - region.file.pitch) / 12), gain: LIVE_LEVEL * 10 ** (sound.gain_db / 20) * velocityGain(velocity), loop: inst.loop ?? null };
}

export interface SamplerPorts {
  context(): AudioContext;
  library(): Promise<Library>;
  /** The decoded samples of an instrument (all of them, or just `only`), by library path. */
  load(lib: Library, instrument: string, only?: ReadonlySet<string>): Promise<Map<string, AudioBuffer>>;
}

export interface Sampler {
  /** Loads an instrument's samples ahead of its first note. */
  ready(instrument: string): Promise<void>;
  /** Starts a note; its handle stops it. A note whose sample is still loading starts when it arrives. */
  start(sound: Sound, pitch: number, velocity: number): number;
  stop(handle: number): void;
  stopAll(): void;
}

interface Playing { src: AudioBufferSourceNode | null; amp: GainNode | null; release: number; stopped: boolean }

export function createSampler(ports: SamplerPorts): Sampler {
  let lib: Promise<Library> | null = null;
  const library = (): Promise<Library> => (lib ??= ports.library());
  const playing = new Map<number, Playing>();
  let next = 1;
  const end = (p: Playing): void => {
    if (!p.src || !p.amp) return;
    const ctx = ports.context();
    const now = ctx.currentTime;
    p.amp.gain.cancelScheduledValues(now);
    p.amp.gain.setValueAtTime(p.amp.gain.value, now);
    p.amp.gain.linearRampToValueAtTime(0, now + Math.max(0.02, p.release));
    p.src.stop(now + Math.max(0.02, p.release) + 0.05);
  };
  return {
    ready: async instrument => {
      const l = await library();
      if (l.instruments[instrument]) await ports.load(l, instrument);
    },
    start: (sound, pitch, velocity) => {
      const handle = next++;
      const p: Playing = { src: null, amp: null, release: sound.release, stopped: false };
      playing.set(handle, p);
      void (async () => {
        const l = await library();
        const voice = liveVoice(l, sound, pitch, velocity);
        if (!voice) return;
        const buffer = (await ports.load(l, sound.instrument, new Set([voice.file.file]))).get(voice.file.file);
        if (!buffer || p.stopped) return;
        const ctx = ports.context();
        const src = ctx.createBufferSource();
        src.buffer = buffer;
        src.playbackRate.value = voice.rate;
        if (voice.loop) {
          src.loop = true;
          src.loopStart = voice.loop[0];
          src.loopEnd = voice.loop[1];
        }
        const amp = ctx.createGain();
        const now = ctx.currentTime;
        amp.gain.setValueAtTime(0, now);
        amp.gain.linearRampToValueAtTime(voice.gain, now + Math.max(0.005, Math.min(sound.attack, 0.3)));
        src.connect(amp).connect(ctx.destination);
        src.start(now);
        p.src = src;
        p.amp = amp;
      })().catch(() => { playing.delete(handle); });
      return handle;
    },
    stop: handle => {
      const p = playing.get(handle);
      if (!p) return;
      p.stopped = true;
      playing.delete(handle);
      end(p);
    },
    stopAll: () => {
      for (const [h, p] of playing) { p.stopped = true; end(p); playing.delete(h); }
    },
  };
}
