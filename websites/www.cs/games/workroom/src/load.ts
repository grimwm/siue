// Loads a draft's score over the page's own session. fetch is a port, so the
// tests hand in a fake. DOM-free.
import { parseScore } from './score.ts';
import type { Score } from './score.ts';

export type Fetch = (url: string, init?: { method?: string; headers?: Record<string, string>; body?: Uint8Array<ArrayBuffer> }) => Promise<{ ok: boolean; status: number; redirected: boolean; headers: { get(n: string): string | null }; json(): Promise<unknown>; arrayBuffer(): Promise<ArrayBuffer>; text(): Promise<string> }>;

export const draftUrl = (piece: string, version: number, file: string): string =>
  `draft.php?piece=${encodeURIComponent(piece)}&v=${version}&file=${encodeURIComponent(file)}`;

/** A file beside the running module, carrying the module's own query (its ?v= version stamp), so one stamp busts both. */
export function siblingUrl(moduleUrl: string, file: string): string {
  const [beforeHash = ''] = moduleUrl.split('#');
  const [path = '', ...query] = beforeHash.split('?');
  return `${path.slice(0, path.lastIndexOf('/') + 1)}${file}${query.length ? `?${query.join('?')}` : ''}`;
}

export type Loaded = { ok: true; score: Score; version: number; versions: number[] } | { ok: false; error: string };

const SIGNED_OUT = 'Your sign-in ended. Sign in again.';
const bad = (error: string): { ok: false; error: string } => ({ ok: false, error });

async function getJson(fetch: Fetch, url: string): Promise<{ ok: true; body: unknown } | { ok: false; error: string }> {
  let reply;
  try {
    reply = await fetch(url);
  } catch {
    return bad('Could not reach the server. Check the connection and try again.');
  }
  if (reply.redirected) return bad(SIGNED_OUT);
  if (!reply.ok) return bad(`The server answered ${reply.status}.`);
  try {
    return { ok: true, body: await reply.json() };
  } catch {
    return bad('The server sent something this page cannot read.');
  }
}

/** Reads drafts.php for the versions, then score.json for the asked (or latest) one; unknown schema → its message; a redirect → "Your sign-in ended. Sign in again." */
export async function loadDraft(fetch: Fetch, piece: string, version: number | null): Promise<Loaded> {
  const list = await getJson(fetch, `drafts.php?piece=${encodeURIComponent(piece)}`);
  if (!list.ok) return list;
  const drafts = (list.body as { drafts?: unknown } | null)?.drafts;
  const versions = Array.isArray(drafts) ? drafts.flatMap(d => (typeof (d as { version?: unknown })?.version === 'number' ? [(d as { version: number }).version] : [])) : [];
  if (versions.length === 0) return bad('This piece has no drafts yet.');
  const want = version ?? Math.max(...versions);
  const raw = await getJson(fetch, draftUrl(piece, want, 'score.json'));
  if (!raw.ok) return raw;
  const parsed = parseScore(raw.body);
  return parsed.ok ? { ok: true, score: parsed.score, version: want, versions } : bad(parsed.error);
}
