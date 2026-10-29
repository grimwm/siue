// A draft with no audio file, played from its score: the library index, the samples, the render and its WAV, built
// once per draft and kept in memory for the page's life (never in a browser store). The build reports its stage as it
// goes, for the page's progress line. DOM-free: the fetching, rendering and blob address are injected.
import type { Score } from '../score.ts';
import { wav } from './master.ts';
import type { Library } from './plan.ts';

/** The stages a build goes through, in order. */
export const BUILD_STAGES = ['instruments', 'rendering', 'finishing'] as const;
export type BuildStage = (typeof BUILD_STAGES)[number];
/** What the progress line says at each stage. */
export const STAGE_WORDS: Record<BuildStage, string> = {
  instruments: 'Loading the instruments',
  rendering: 'Playing the score',
  finishing: 'Making the audio file',
};

/** url is the WAV's address (a blob URL in the page); channels and rate are the audio it holds, for the sound picture. */
export interface BuiltSound { url: string; channels: Float32Array[]; rate: number }
/** Where a draft's sound is: being built, ready to play, or failed with the reason. */
export type DraftSound = { state: 'building'; stage: BuildStage } | ({ state: 'ready' } & BuiltSound) | { state: 'failed'; reason: string };

export interface SoundPorts {
  /** The sample library's index. */
  library(): Promise<Library>;
  /** Fetches and decodes the samples the score plays, so the render finds them ready. */
  load(score: Score, lib: Library): Promise<void>;
  render(score: Score, lib: Library): Promise<{ channels: Float32Array[]; rate: number }>;
  /** An address the page can play and save the WAV from. */
  url(wav: Uint8Array): string;
}

/** Builds the sound of the draft `key` (piece and version), or hands back the one already built or being built. */
export type BuildSound = (key: string, score: Score, onStage: (stage: BuildStage) => void) => Promise<BuiltSound>;

/** A builder that keeps each draft's sound, and the library index, once made; a failure is forgotten, so the next build tries again. */
export function soundBuilder(ports: SoundPorts): BuildSound {
  const built = new Map<string, Promise<BuiltSound>>();
  let library: Promise<Library> | null = null;
  const index = (): Promise<Library> => {
    const job = library ?? ports.library();
    library = job;
    job.catch(() => { if (library === job) library = null; });
    return job;
  };
  const build = async (score: Score, onStage: (stage: BuildStage) => void): Promise<BuiltSound> => {
    onStage('instruments');
    const lib = await index();
    await ports.load(score, lib);
    onStage('rendering');
    const { channels, rate } = await ports.render(score, lib);
    onStage('finishing');
    return { url: ports.url(wav(channels, rate)), channels, rate };
  };
  return (key, score, onStage) => {
    let job = built.get(key);
    if (!job) {
      job = build(score, onStage);
      built.set(key, job);
      const mine = job;
      mine.catch(() => { if (built.get(key) === mine) built.delete(key); });
    }
    return job;
  };
}
