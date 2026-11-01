// The page's sound builder: the library beside the page, its samples decoded once for the page's life, the render in
// an OfflineAudioContext and the WAV at a blob address. Its own module, so the theme boot (which reads browser.ts)
// does not carry the engine.
import { defaultDeps, LIBRARY_BASE, loadInstruments, renderScore } from './engine.ts';
import { voices } from './plan.ts';
import { isVocal } from '../score.ts';
import type { Library } from './plan.ts';
import { soundBuilder } from './sound.ts';
import type { BuildSound } from './sound.ts';

/** `take` gives a Vocal Track's take (on this device, or from the studio), decoded at the renderer's rate. */
export function browserSound(take?: (file: string) => Promise<AudioBuffer>): BuildSound {
  const deps = { ...defaultDeps(), take };
  return soundBuilder({
    library: async () => {
      const reply = await fetch(`${LIBRARY_BASE}library.json`).catch((e: unknown) => {
        throw new Error(`the sample library could not be reached: ${e instanceof Error ? e.message : String(e)}`);
      });
      if (!reply.ok) throw new Error(`the sample library's index could not be loaded: the server answered ${reply.status}`);
      return (await reply.json()) as Library;
    },
    load: async (score, lib) => {
      const played = { ...score, lanes: score.lanes.filter(l => !isVocal(l)) };
      const instruments = [...new Set(played.lanes.map(l => l.sound!.instrument))];
      await loadInstruments(lib, instruments, deps.fetchBytes, deps.decode, undefined, new Set(voices(played, lib).map(v => v.file)));
    },
    render: (score, lib) => renderScore(score, lib, deps),
    url: bytes => URL.createObjectURL(new Blob([bytes as Uint8Array<ArrayBuffer>], { type: 'audio/wav' })),
  });
}
