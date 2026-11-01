// Saving the editor's draft: the score in a SIUED1 bundle (Formats: "SIUED1", a file count, then per file a name length,
// the name, a uint32 size and the bytes), posted over the page's session, and every answer said in plain words. A save
// that fails never loses the edit: the page keeps it and says what to do. DOM-free.
import { SignedOut } from '../api.ts';
import type { PageApi } from '../api.ts';
import type { Score } from '../score.ts';

const encoder = new TextEncoder();

export function encodeBundle(files: Readonly<Record<string, Uint8Array>>): Uint8Array<ArrayBuffer> {
  const names = Object.keys(files);
  const size = 6 + 1 + names.reduce((n, name) => n + 1 + encoder.encode(name).length + 4 + files[name]!.length, 0);
  const out = new Uint8Array(size);
  let at = 0;
  const put = (bytes: Uint8Array) => { out.set(bytes, at); at += bytes.length; };
  put(encoder.encode('SIUED1'));
  out[at++] = names.length;
  for (const name of names) {
    const n = encoder.encode(name);
    const bytes = files[name]!;
    out[at++] = n.length;
    put(n);
    new DataView(out.buffer).setUint32(at, bytes.length);
    at += 4;
    put(bytes);
  }
  return out;
}

export type Saved = { ok: true; version: number } | { ok: false; message: string; latest?: number };

const KEPT = 'Your edit is still here.';
const REFUSALS: Readonly<Record<string, string>> = {
  too_large: `This piece is too big to keep: a score holds at most 256 KB. Remove some notes or parts, then save again. ${KEPT}`,
  too_many_notes: `A piece holds at most 20,000 notes. Remove some, then save again. ${KEPT}`,
  too_many_lanes: `A piece holds at most 16 parts. Remove one, then save again. ${KEPT}`,
  unknown_instrument: `A part plays an instrument this studio's sounds do not have. Choose another instrument for it, then save again. ${KEPT}`,
  bad_take: `A vocal take could not be read as FLAC or Opus, so nothing was saved. Record it again, then save. ${KEPT}`,
  take_too_long: `A vocal take is longer than 15 minutes or longer than it says. Trim it or record it again, then save. ${KEPT}`,
  missing_take: `The score names a vocal take that is not in your studio or in this save. Reload the page, then save again. ${KEPT}`,
  low_disk: `The server is running short of space for recordings, so nothing was saved. Try again later. ${KEPT}`,
};

/** Saves `score` as draft `score.draft` of its piece, with the new vocal `takes` it names, and says how it went. */
export async function saveScore(api: Pick<PageApi, 'saveDraft'>, score: Score, takes: Readonly<Record<string, Uint8Array>> = {}): Promise<Saved> {
  const bundle = encodeBundle({ 'score.json': encoder.encode(JSON.stringify(score)), ...takes });
  let answer: { status: number; data: Record<string, unknown> };
  try {
    answer = await api.saveDraft(score.piece.id, score.draft, bundle);
  } catch (e) {
    if (e instanceof SignedOut) return { ok: false, message: `Your sign-in ended. Sign in again in another tab, then press Save Draft again. ${KEPT}` };
    if (e instanceof TypeError) return { ok: false, message: `Could not reach the server. Check the connection, then press Save Draft again. ${KEPT}` };
    throw e;
  }
  const { status, data } = answer;
  const error = typeof data['error'] === 'string' ? data['error'] : '';
  if (status === 201) return { ok: true, version: typeof data['version'] === 'number' ? data['version'] : score.draft };
  if (status === 409 && typeof data['latest'] === 'number') {
    const latest = data['latest'];
    return { ok: false, latest, message: `Draft ${latest} of this piece was saved after you opened it. Press Save Draft again to keep yours as draft ${latest + 1}; draft ${latest} stays as it is.` };
  }
  if (error === 'over_quota' && typeof data['message'] === 'string') return { ok: false, message: `${data['message']} ${KEPT}` };
  return { ok: false, message: REFUSALS[error] ?? `The server could not keep this draft (${error || `it answered ${status}`}). ${KEPT}` };
}
