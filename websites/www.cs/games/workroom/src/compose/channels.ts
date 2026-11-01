// The MIDI channel each part plays on, the same in exported MIDI and in exported MusicXML's <midi-instrument>: drums on
// channel 10 (index 9), the other parts on 1–16 in turn skipping 10, and a sixteenth pitched part sharing channel 16.
// DOM-free.
import type { Entry } from '../catalogue.ts';
import type { EditDoc } from './doc.ts';

export const DRUM_CHANNEL = 9;

/** Each part's channel, counted from 0. */
export function channels(doc: EditDoc, entries: readonly Entry[]): Map<string, number> {
  const out = new Map<string, number>();
  let next = 0;
  for (const p of doc.parts) {
    if (entries.find(e => e.id === p.instrument)?.pieces) { out.set(p.id, DRUM_CHANNEL); continue; }
    if (next === DRUM_CHANNEL) next++;
    out.set(p.id, Math.min(next, 15));
    next++;
  }
  return out;
}
