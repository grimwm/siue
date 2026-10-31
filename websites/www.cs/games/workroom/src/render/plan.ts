// The render plan: each note of a renderable score as a voice, the sample it plays and how, the way the
// composing pipeline's SFZ instrument (music/compose/siue_compose/sfz.py) plays it under sfizz. DOM-free.
import type { Score } from '../score.ts';

/** One sample of the shared library (music/library/library.json): its root key, path under the library and format. */
export interface LibraryFile { pitch: number; file: string; rate: number; channels: number }
/** The composer's catalogue entry for an instrument (see catalogue.ts); a library.json from before the catalogue has none of it. */
export interface CatalogueFields {
  name?: string; category?: string; range?: [number, number] | null; expert?: [number, number] | null; home?: number | null;
  clef?: string; written?: number; gm?: number; gm_name?: string; pieces?: [number, string][] | null; standin?: string;
  standin_note?: string; attack?: number; release?: number;
}
/**
 * `loop` is the sustained stretch in seconds that repeats so a note may outlast its sample; absent for a plucked or struck instrument.
 * `pitched: false` (drums) plays each sample only on its own key.
 */
export interface LibraryInstrument extends CatalogueFields { files: LibraryFile[]; loop?: [number, number]; pitched?: false }
export interface Library { version: 1; source: string; commit: string; licence: string; credit: string; instruments: Record<string, LibraryInstrument> }

export interface Region { lo: number; hi: number; file: LibraryFile }
/**
 * A note as played: `file` at `rate` (1 is the sample's own pitch) from `at` for `dur` seconds, then released;
 * `gain` is linear (sfizz's level times the lane level times the velocity's); `loop` is the sample's sustained stretch in seconds, or null.
 */
export interface Voice { lane: string; file: string; rate: number; at: number; dur: number; gain: number; attack: number; release: number; loop: [number, number] | null }

/**
 * Each sample covers the keys nearest its root: split halfway between neighbouring roots, the outer ones reaching 0 and 127.
 * An unpitched instrument's sample covers its own key only and is never repitched.
 */
export function regions(files: readonly LibraryFile[], pitched = true): Region[] {
  const ordered = [...files].sort((a, b) => a.pitch - b.pitch);
  if (!pitched) return ordered.map(file => ({ lo: file.pitch, hi: file.pitch, file }));
  return ordered.map((file, i) => ({
    lo: i === 0 ? 0 : Math.floor((ordered[i - 1]!.pitch + file.pitch) / 2) + 1,
    hi: i === ordered.length - 1 ? 127 : Math.floor((file.pitch + ordered[i + 1]!.pitch) / 2),
    file,
  }));
}

const AMP_VELTRACK = 0.8;
/**
 * sfizz's amplitude for a velocity under amp_veltrack=80 with no amp_velcurve: the default curve is the squared
 * normalised velocity, and veltrack blends it with full level, so gain = (1 - 0.8) + 0.8 * (velocity / 127)^2
 * (sfizz Region::velocityCurve: 1 - veltrack * (1 - v^2)).
 */
export const velocityGain = (velocity: number): number => 1 - AMP_VELTRACK * (1 - (velocity / 127) ** 2);

/**
 * sfizz_render's own level: it plays a sample at velocity 127 at this fraction of the sample's level in each channel
 * (measured in the composing container on the harp, horn, organ and cello: 0.2654, -11.5 dB). Every voice carries it,
 * so the master's soft clip and hiss meet the music at the levels render.py's do.
 */
export const SFIZZ_LEVEL = 0.2654;

/**
 * One voice per note, in the score's note order; a drum note with no sample of its own makes none.
 * Throws on a lane without a sound or an instrument the library lacks.
 */
export function voices(score: Score, lib: Library): Voice[] {
  const byLane = new Map(score.lanes.map(lane => {
    const sound = lane.sound;
    if (!sound) throw new Error(`lane ${lane.id} has no sound, so the score cannot be rendered`);
    const inst = lib.instruments[sound.instrument];
    if (!inst) throw new Error(`lane ${lane.id} uses instrument ${sound.instrument}, which the sample library does not have`);
    return [lane.id, { sound, regions: regions(inst.files, inst.pitched !== false), loop: inst.loop ?? null }] as const;
  }));
  return score.notes.flatMap(n => {
    const lane = byLane.get(n.lane);
    if (!lane) throw new Error(`a note names lane ${n.lane}, which the score does not have`);
    const region = lane.regions.find(r => n.pitch >= r.lo && n.pitch <= r.hi);
    if (!region) return [];
    return [{
      lane: n.lane, file: region.file.file, rate: 2 ** ((n.pitch - region.file.pitch) / 12), at: n.start, dur: n.length,
      gain: SFIZZ_LEVEL * 10 ** (lane.sound.gain_db / 20) * velocityGain(n.velocity), attack: lane.sound.attack, release: lane.sound.release, loop: lane.loop,
    }];
  });
}
