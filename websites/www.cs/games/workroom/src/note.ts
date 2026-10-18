// The note a sealed bundle carries: what the owner means, where in the piece, and how it was made.
import { ID_RE } from './score.ts';

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

/** A typed note's longest text, in characters. */
export const MAX_TEXT = 4000;
/** The longest recording, in seconds (the recorder stops itself there). */
export const MAX_AUDIO_SECONDS = 60;
/** The most points an energy shape may have. */
export const MAX_CURVE_POINTS = 512;
/** The largest sealed note the server keeps (music/lib/Store.php MAX_NOTE_BYTES). */
export const MAX_NOTE_BYTES = 2_097_152;
/** How many notes the server keeps (music/lib/Store.php MAX_NOTES). */
export const MAX_NOTES = 2000;

const ISO_UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/;
const finite = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const barOrNull = (v: unknown): boolean => v === null || (Number.isInteger(v) && (v as number) >= 1);

/** The note contract: what an opened body must be before the page shows it or a test trusts it. */
export function isNoteBody(x: unknown): x is NoteBody {
  if (typeof x !== 'object' || x === null || Array.isArray(x)) return false;
  const b = x as Record<string, unknown>;
  const { from, to, fromBar, toBar, text, reaction, curve, audio } = b;
  if (b['v'] !== 1 || !NOTE_KINDS.includes(b['kind'] as NoteKind)) return false;
  if (typeof b['piece'] !== 'string' || !ID_RE.test(b['piece'])) return false;
  if (!Number.isInteger(b['draft']) || (b['draft'] as number) < 1) return false;
  if (!finite(from) || !finite(to) || from < 0 || to < from) return false;
  if (!barOrNull(fromBar) || !barOrNull(toBar) || (fromBar === null) !== (toBar === null)) return false;
  if (fromBar !== null && (toBar as number) < (fromBar as number)) return false;
  if (!(b['lane'] === null || (typeof b['lane'] === 'string' && ID_RE.test(b['lane'])))) return false;
  if (!(text === null || (typeof text === 'string' && text.length <= MAX_TEXT))) return false;
  if (!(reaction === null || REACTION_IDS.includes(reaction as Reaction))) return false;
  const curveOk = curve === null || (Array.isArray(curve) && curve.length >= 2 && curve.length <= MAX_CURVE_POINTS
    && curve.every(p => Array.isArray(p) && p.length === 2 && finite(p[0]) && finite(p[1]) && p[0] >= 0 && p[1] >= 0 && p[1] <= 1));
  if (!curveOk) return false;
  const a = audio as Record<string, unknown> | null;
  const audioOk = a === null || (typeof a === 'object' && !Array.isArray(a) && typeof a['mime'] === 'string' && a['mime'].length <= 100
    && finite(a['seconds']) && a['seconds'] > 0 && a['seconds'] <= MAX_AUDIO_SECONDS);
  if (!audioOk) return false;
  if (typeof b['made'] !== 'string' || !ISO_UTC.test(b['made'])) return false;
  switch (b['kind'] as NoteKind) {
    case 'text': return typeof text === 'string' && text.trim() !== '';
    case 'speech':
    case 'hum': return a !== null;
    case 'react': return reaction !== null;
    case 'energy': return curve !== null;
  }
}
