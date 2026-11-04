// The Mix view's meters: how loud each track is at a moment of the song, worked out from its notes rather than
// listened to (the song plays as one rendered file, so its tracks cannot be heard apart). A note is loudest as it
// starts and dies away while it is held; the loudest sounding note sets the level, scaled by the track's Volume. A
// muted track reads zero. DOM-free.
import type { EditDoc, Part } from './doc.ts';
import { isMuted } from './mutes.ts';
import { heardNotes } from './regions.ts';

/** How fast a held note dies away on the meter, per beat. */
const DECAY = 1.4;

/** One track's notes, sorted by start, ready for levelAt. */
export interface LevelTrack { notes: { start: number; end: number; v: number }[]; gain: number; muted: boolean }

export function levelTrack(part: Part, doc: Pick<EditDoc, 'parts'>): LevelTrack {
  const gain = Math.min(1.6, 10 ** ((part.fx?.volume_db ?? 0) / 20));
  return {
    notes: heardNotes(part).map(n => ({ start: n.start, end: n.start + n.length, v: n.velocity / 127 })).sort((a, b) => a.start - b.start),
    gain,
    muted: isMuted(part, doc),
  };
}

/** The track's level at `beat`, 0 to 1. */
export function levelAt(t: LevelTrack, beat: number): number {
  if (t.muted) return 0;
  let best = 0;
  for (const n of t.notes) {
    if (n.start > beat) break;
    if (n.end <= beat) continue;
    best = Math.max(best, n.v * Math.exp(-(beat - n.start) * DECAY) * 0.35 + n.v * 0.55);
  }
  return Math.min(1, best * t.gain);
}
