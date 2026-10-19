// Sealed notes waiting to be sent. A note is stored before its first try, so
// a lost connection, a lost sign-in or a refusal never loses it; it stays with
// the reason and goes on the next flush (page load, back online, Try again).
// Only Discard drops an unsent note. The store holds the sealed bytes and when
// the note was made, nothing else. One add or flush runs at a time in a page,
// and only one tab at a time uploads (the page's lock, where the browser has one).
import { SignedOut } from './api.ts';
import type { PageApi, RefusedReason } from './api.ts';
import { MAX_NOTES, MAX_NOTE_BYTES } from './note.ts';

export type KeptReason = RefusedReason | 'offline' | 'signed_out' | 'server';
export interface Pending { key: string; bundle: Uint8Array<ArrayBuffer>; made: string; reason: KeptReason | 'new' }
export interface OutboxStore {
  all(): Promise<Pending[]>;
  /** Resolves true when this note is held only in this page view's memory (the browser has no IndexedDB, or refused to open it or to store the note), false when it is stored on the device. */
  put(p: Pending): Promise<boolean>;
  remove(key: string): Promise<void>;
  /** True while a note is held only in this page view's memory, so closing the page would lose it. */
  memoryOnly(): boolean;
}
export interface FlushReport { sent: { key: string; id: string }[]; kept: { key: string; reason: KeptReason }[] }
/** `memoryOnly`: the store could keep this note only in this page view's memory. */
export interface AddReport extends FlushReport { key: string; memoryOnly: boolean }
/** Runs `work` while holding the page's cross-tab lock, so two tabs never upload the same kept note. */
export type OutboxLock = <T>(work: () => Promise<T>) => Promise<T>;
export interface Outbox {
  /** Stores the note, then flushes. Rejects only when the note could not be stored; a flush that fails reports the note kept. */
  add(bundle: Uint8Array<ArrayBuffer>, made: string): Promise<AddReport>;
  flush(): Promise<FlushReport>; pending(): Promise<Pending[]>; discard(key: string): Promise<void>;
  /** True while a note not sent yet is held only in this page view's memory (OutboxStore.memoryOnly). */
  memoryOnly(): boolean;
}

export const SENT_MESSAGE = 'Sent. It is waiting for pickup.';
/** What the owner is told when a note cannot be sealed in this browser; nothing was stored, and the words or recording are still on screen. */
export const SEND_MESSAGES = {
  sealFailed: 'This note could not be sealed here (the browser blocked encryption, or the page is not secure). Nothing was sent, and your note is still here.',
} as const;
/** Added to a kept note's message when the browser would not store it on this device. */
export const MEMORY_NOTICE = 'This browser would not save it on this device, so it is kept only until this page is closed or reloaded.';

export const KEPT_MESSAGES: Readonly<Record<KeptReason, string>> = {
  offline: 'No connection: this note is kept on this device and will be sent when you are back online.',
  signed_out: 'Your sign-in ended. Sign in again; the note stays on this device.',
  server: 'The server had a problem. This note stays on this device and is sent on the next try.',
  too_large: 'This note is over 2 MB, so it stays on this device. Record a shorter one, then discard this one.',
  full: `The workroom holds ${MAX_NOTES.toLocaleString('en-US')} notes. Delete some old ones; this note stays on this device until then.`,
  no_key: 'The workroom has no notes key yet (make music-setup), so this note stays on this device.',
  bad_header: 'The server did not accept this note’s key. Reload the page; the note stays on this device.',
  unknown_key: 'The server does not take notes sealed to this key, so this note stays on this device. Run make music-status to compare the notes keys.',
};

/** Reasons that would be the same for every note after this one: the walk stops there. */
const STOPS: ReadonlySet<KeptReason> = new Set<KeptReason>(['offline', 'signed_out', 'server', 'full', 'no_key']);

export function memoryOutbox(): OutboxStore {
  const notes = new Map<string, Pending>();
  return {
    all: async () => [...notes.values()].map(p => ({ ...p })),
    put: async p => { notes.set(p.key, { ...p }); return true; },
    remove: async key => { notes.delete(key); },
    memoryOnly: () => notes.size > 0,
  };
}

const byMade = (a: Pending, b: Pending): number => (a.made < b.made ? -1 : a.made > b.made ? 1 : 0);

export function createOutbox(store: OutboxStore, api: Pick<PageApi, 'upload'>, newKey: () => string, lock: OutboxLock | null = null): Outbox {
  let chain: Promise<unknown> = Promise.resolve();
  const serial = <T>(work: () => Promise<T>): Promise<T> => {
    const next = chain.then(work, work);
    chain = next.catch(() => undefined);
    return next;
  };
  /** Notes the server took whose record the store would not remove: never uploaded again, and removed on a later flush. */
  const sentKeys = new Set<string>();
  const forget = async (key: string): Promise<void> => {
    try {
      await store.remove(key);
      sentKeys.delete(key);
    } catch {
      sentKeys.add(key);
    }
  };
  const flushNow = async (): Promise<FlushReport> => {
    const report: FlushReport = { sent: [], kept: [] };
    let stopped: KeptReason | null = null;
    for (const p of (await store.all()).sort(byMade)) {
      if (sentKeys.has(p.key)) { await forget(p.key); continue; }
      let reason: KeptReason | null = stopped;
      if (reason === null && p.bundle.length > MAX_NOTE_BYTES) reason = 'too_large';
      if (reason === null) {
        try {
          const r = await api.upload(p.bundle);
          if (r.kind === 'sent') {
            await forget(p.key);
            report.sent.push({ key: p.key, id: r.id });
            continue;
          }
          reason = r.reason;
        } catch (e) {
          reason = e instanceof SignedOut ? 'signed_out' : e instanceof TypeError ? 'offline' : 'server';
        }
        if (STOPS.has(reason)) stopped = reason;
      }
      if (p.reason !== reason) await store.put({ ...p, reason }).catch(() => undefined); // the reason is shown again on the next flush
      report.kept.push({ key: p.key, reason });
    }
    return report;
  };
  const locked = <T>(work: () => Promise<T>): Promise<T> => (lock ? lock(work) : work());
  return {
    add: (bundle, made) => serial(async () => {
      const key = newKey();
      const memoryOnly = await store.put({ key, bundle, made, reason: 'new' });
      try {
        return { key, memoryOnly, ...(await locked(flushNow)) };
      } catch {
        // Stored, but the store could not be read back to send it: it goes on the next flush.
        return { key, memoryOnly, sent: [], kept: [{ key, reason: 'server' }] };
      }
    }),
    flush: () => serial(() => locked(flushNow)),
    pending: async () => (await store.all()).filter(p => !sentKeys.has(p.key)).sort(byMade),
    discard: key => serial(() => store.remove(key)),
    memoryOnly: () => store.memoryOnly(),
  };
}
