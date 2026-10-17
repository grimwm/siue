// The note a sealed bundle carries: what the owner means, where in the piece, and how it was made.
export const NOTE_KINDS = ['text', 'speech', 'hum', 'react', 'energy'] as const;
export type NoteKind = (typeof NOTE_KINDS)[number];
export const REACTION_IDS = ['more-epic', 'calmer', 'darker', 'brighter', 'longer', 'shorter', 'love-it', 'not-this'] as const;
export type Reaction = (typeof REACTION_IDS)[number];

export interface NoteBody {
  v: 1;
  kind: NoteKind;
  piece: string;
  draft: number;
  /** Seconds. */
  from: number;
  to: number;
  /** Bars on a music piece; null on a sound piece, which has seconds only. */
  fromBar: number | null;
  toBar: number | null;
  lane: string | null;
  text: string | null;
  reaction: Reaction | null;
  curve: [number, number][] | null;
  audio: { mime: string; seconds: number } | null;
  made: string;
}
