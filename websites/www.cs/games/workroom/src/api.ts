// The page's own API client, over the signed-in session. One POST at a time,
// each carrying the CSRF token the last answer gave: the server spends a token
// on every check, so a refused one (403 {"error":"csrf"}) is refreshed from
// csrf.php once and the POST retried once. A lost session is SignedOut, read
// from the status (a redirect to the sign-in, a 401, or a 403 other than the
// CSRF refusal), never from the Content-Type. Every other failure is a ServerError naming the status.
import type { Fetch } from './load.ts';
import type { LockedKeyring } from './unlock.ts';

export class SignedOut extends Error {}
export class NoKeyring extends Error {}
/** The server answered, but with an error status. */
export class ServerError extends Error {
  readonly status: number;
  constructor(status: number) {
    super(`The server answered ${status}.`);
    this.status = status;
  }
}
export type RefusedReason = 'too_large' | 'full' | 'no_key' | 'bad_header' | 'unknown_key';
export const REFUSED_REASONS: readonly RefusedReason[] = ['too_large', 'full', 'no_key', 'bad_header', 'unknown_key'];
export interface ServerNote { id: string; size: number; arrived_at: number; picked_up_at: number | null }
export type UploadResult = { kind: 'sent'; id: string } | { kind: 'refused'; reason: RefusedReason };
export interface PageApi {
  upload(bundle: Uint8Array<ArrayBuffer>): Promise<UploadResult>;
  /** Every note row the page can read, and how many rows it could not (they are left out, the rest still come). */
  list(): Promise<{ notes: ServerNote[]; unreadable: number }>;
  bytes(id: string): Promise<Uint8Array<ArrayBuffer>>;
  remove(id: string): Promise<number>;
  removeAll(): Promise<number>;
  keyring(): Promise<LockedKeyring>;
}

type Reply = Awaited<ReturnType<Fetch>>;
type Data = Record<string, unknown>;
const NOTE_ID = /^[0-9a-f]{32}$/;
const encoder = new TextEncoder();

async function read(reply: Reply): Promise<Data> {
  try {
    const j: unknown = await reply.json();
    return typeof j === 'object' && j !== null && !Array.isArray(j) ? (j as Data) : {};
  } catch {
    return {};
  }
}
const signedOut = (reply: Reply, data: Data): boolean => reply.redirected || reply.status === 401 || (reply.status === 403 && data['error'] !== 'csrf');
const failed = (reply: Reply): ServerError => new ServerError(reply.status);
const isServerNote = (x: unknown): x is ServerNote => {
  const n = x as Partial<ServerNote> | null;
  return typeof n === 'object' && n !== null && typeof n.id === 'string' && NOTE_ID.test(n.id) && Number.isInteger(n.size)
    && Number.isInteger(n.arrived_at) && (n.picked_up_at === null || Number.isInteger(n.picked_up_at));
};
const noteId = (id: string): string => {
  if (!NOTE_ID.test(id)) throw new Error('Not a note id.');
  return id;
};

export function createApi(fetch: Fetch, csrf: string): PageApi {
  let token = csrf;
  let queue: Promise<unknown> = Promise.resolve();
  const get = async (url: string): Promise<{ reply: Reply; data: Data }> => {
    const reply = await fetch(url);
    const data = reply.redirected ? {} : await read(reply);
    if (signedOut(reply, data)) throw new SignedOut('Your sign-in ended.');
    return { reply, data };
  };
  const post = (url: string, type: string, body: Uint8Array<ArrayBuffer>): Promise<{ reply: Reply; data: Data }> => {
    const run = async (): Promise<{ reply: Reply; data: Data }> => {
      for (let attempt = 0; ; attempt++) {
        const reply = await fetch(url, { method: 'POST', headers: { 'X-CSRF': token, 'Content-Type': type }, body });
        const data = reply.redirected ? {} : await read(reply);
        if (typeof data['csrf'] === 'string') token = data['csrf'];
        if (reply.status === 403 && data['error'] === 'csrf' && attempt === 0) {
          const fresh = await get('csrf.php');
          if (!fresh.reply.ok || typeof fresh.data['csrf'] !== 'string') throw failed(fresh.reply);
          token = fresh.data['csrf'];
          continue;
        }
        if (signedOut(reply, data)) throw new SignedOut('Your sign-in ended.');
        return { reply, data };
      }
    };
    const next = queue.then(run, run);
    queue = next.catch(() => undefined);
    return next;
  };
  const deleted = async (form: string): Promise<number> => {
    const { reply, data } = await post('delete.php', 'application/x-www-form-urlencoded', encoder.encode(form));
    if (!reply.ok) throw failed(reply);
    return typeof data['deleted'] === 'number' ? data['deleted'] : 0;
  };
  return {
    async upload(bundle) {
      const { reply, data } = await post('notes.php', 'application/octet-stream', bundle);
      const id = data['id'];
      if (reply.status === 201 && typeof id === 'string' && NOTE_ID.test(id)) return { kind: 'sent', id };
      const error = data['error'];
      if (!reply.ok && typeof error === 'string' && (REFUSED_REASONS as readonly string[]).includes(error)) return { kind: 'refused', reason: error as RefusedReason };
      throw failed(reply);
    },
    async list() {
      const { reply, data } = await get('notes.php');
      if (!reply.ok) throw failed(reply);
      const notes = data['notes'];
      if (!Array.isArray(notes)) return { notes: [], unreadable: 0 };
      const readable = notes.filter(isServerNote);
      return { notes: readable, unreadable: notes.length - readable.length };
    },
    async bytes(id) {
      const reply = await fetch(`note.php?id=${noteId(id)}`);
      if (reply.redirected || reply.status === 401 || reply.status === 403) throw new SignedOut('Your sign-in ended.');
      if (!reply.ok) throw failed(reply);
      if (!(reply.headers.get('content-type') ?? '').toLowerCase().startsWith('application/octet-stream')) throw new Error('note.php did not answer application/octet-stream.');
      return new Uint8Array(await reply.arrayBuffer());
    },
    remove: async id => deleted(`id=${noteId(id)}`),
    removeAll: async () => deleted('all=1'),
    async keyring() {
      const { reply, data } = await get('keyring.php');
      if (reply.status === 404 && data['error'] === 'no_keyring') throw new NoKeyring('No notes key has been uploaded yet.');
      const keyring = data['keyring'];
      if (!reply.ok || typeof keyring !== 'object' || keyring === null) throw failed(reply);
      return keyring as LockedKeyring;
    },
  };
}
