// What this studio may hold, as the page shell states it on <body>
// (data-note-max, data-room, data-named, data-score-only), and byte sizes said the way the
// server says them (music/lib/Usage.php human()).
import { MAX_NOTE_BYTES } from './note.ts';

export interface Limits {
  /** The largest sealed note, in bytes. */
  noteMax: number;
  /** Bytes the studio may still store when the page was drawn; Infinity when the page does not say. */
  room: number;
  /** The address has the allowance. */
  named: boolean;
  /** The studio stores scores only, so its drafts have no MusicXML (no sheet music to show or download). */
  scoreOnly: boolean;
}

const whole = (text: string | undefined): number | null => (text !== undefined && /^\d+$/.test(text) ? Number(text) : null);

export function readLimits(body: HTMLElement): Limits {
  const d = body.dataset;
  return { noteMax: whole(d['noteMax']) ?? MAX_NOTE_BYTES, room: whole(d['room']) ?? Infinity, named: d['named'] === '1', scoreOnly: d['scoreOnly'] === '1' };
}

/** The limits of the page being shown; a document without them (a test, a bare page) has the defaults. */
export function pageLimits(): Limits {
  const body = typeof document === 'undefined' ? null : document.body;
  return body?.dataset ? readLimits(body) : { noteMax: MAX_NOTE_BYTES, room: Infinity, named: true, scoreOnly: false };
}

const MB = 1_048_576;

/** At 1 MB and above, MB with one decimal ("1.2 MB", "5 MB"); below it, whole KB ("0 KB", "1024 KB"). Rounds as PHP does: a tenth of a MB to the nearest, an exact tie to the even tenth; a KB half up. */
export function humanBytes(bytes: number): string {
  const n = Math.max(0, Math.floor(bytes));
  if (n < MB) return `${Math.round(n / 1024)} KB`;
  const tenths = n * 10;
  let q = Math.floor(tenths / MB);
  const r = tenths - q * MB;
  if (r > MB / 2 || (r === MB / 2 && q % 2 === 1)) q++;
  return q % 10 === 0 ? `${q / 10} MB` : `${Math.floor(q / 10)}.${q % 10} MB`;
}
