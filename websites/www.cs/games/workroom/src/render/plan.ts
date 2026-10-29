// The render plan: each note of a renderable score as a voice, the sample it plays and how, the way the
// composing pipeline's SFZ instrument (music/compose/siue_compose/sfz.py) plays it under sfizz. DOM-free.
import type { Score } from '../score.ts';

/** One sample of the shared library (music/library/library.json): its root key, path under the library and format. */
export interface LibraryFile { pitch: number; file: string; rate: number; channels: number }
/** `loop` is the sustained stretch in seconds that repeats so a note may outlast its sample; absent for a plucked or struck instrument. */
export interface LibraryInstrument { files: LibraryFile[]; loop?: [number, number] }
export interface Library { version: 1; source: string; commit: string; licence: string; credit: string; instruments: Record<string, LibraryInstrument> }

export interface Region { lo: number; hi: number; file: LibraryFile }
/**
 * A note as played: `file` at `rate` (1 is the sample's own pitch) from `at` for `dur` seconds, then released;
 * `gain` is linear (lane level times velocity); `loop` is the sample's sustained stretch in seconds, or null.
 */
export interface Voice { lane: string; file: string; rate: number; at: number; dur: number; gain: number; attack: number; release: number; loop: [number, number] | null }

/** Each sample covers the keys nearest its root: split halfway between neighbouring roots, the outer ones reaching 0 and 127. */
export function regions(files: readonly LibraryFile[]): Region[] {
  const ordered = [...files].sort((a, b) => a.pitch - b.pitch);
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

/** One voice per note, in the score's note order. Throws on a lane without a sound or an instrument the library lacks. */
export function voices(score: Score, lib: Library): Voice[] {
  const byLane = new Map(score.lanes.map(lane => {
    const sound = lane.sound;
    if (!sound) throw new Error(`lane ${lane.id} has no sound, so the score cannot be rendered`);
    const inst = lib.instruments[sound.instrument];
    if (!inst) throw new Error(`lane ${lane.id} uses instrument ${sound.instrument}, which the sample library does not have`);
    return [lane.id, { sound, regions: regions(inst.files), loop: inst.loop ?? null }] as const;
  }));
  return score.notes.map(n => {
    const lane = byLane.get(n.lane);
    if (!lane) throw new Error(`a note names lane ${n.lane}, which the score does not have`);
    const region = lane.regions.find(r => n.pitch >= r.lo && n.pitch <= r.hi)!;
    return {
      lane: n.lane, file: region.file.file, rate: 2 ** ((n.pitch - region.file.pitch) / 12), at: n.start, dur: n.length,
      gain: 10 ** (lane.sound.gain_db / 20) * velocityGain(n.velocity), attack: lane.sound.attack, release: lane.sound.release, loop: lane.loop,
    };
  });
}
