// The outbox's home in the browser: IndexedDB database "siue-music", store
// "outbox", one record per sealed note waiting to be sent ({ key, bundle,
// made, reason }). Nothing of any key, and nothing in the clear about a note,
// is ever stored here. Where IndexedDB is missing, refuses to open, or refuses
// to store a note (some private windows, a full disk), that note lives in this
// page view's memory instead: put() says so for that note, and memoryOnly()
// while any note is held there.
import { memoryOutbox } from './outbox.ts';
import type { OutboxStore, Pending } from './outbox.ts';

export const OUTBOX_DB = 'siue-music';
export const OUTBOX_STORE = 'outbox';

const isPending = (x: unknown): x is Pending => {
  const p = x as Partial<Pending> | null;
  return typeof p === 'object' && p !== null && typeof p.key === 'string' && p.bundle instanceof Uint8Array && typeof p.made === 'string' && typeof p.reason === 'string';
};

/** The browser has no IndexedDB to use right now (it refused to open it), so nothing is stored there. */
class Unavailable extends Error {}

export function indexedDbOutbox(idb: IDBFactory | null = typeof indexedDB === 'undefined' ? null : indexedDB): OutboxStore {
  const fallback = memoryOutbox();
  if (!idb) return fallback;
  /** The open connection, or null until the next use opens one: a connection that failed or that the browser closed (Safari drops idle ones; another tab's upgrade asks for it) is forgotten. */
  let db: Promise<IDBDatabase | null> | null = null;
  const open = (): Promise<IDBDatabase | null> => {
    if (db) return db;
    let opening: Promise<IDBDatabase | null> | null = null;
    /** Set when opening failed before the promise was stored (idb.open threw): it is not cached, so the next use tries again. */
    let failedAtOnce = false;
    opening = new Promise<IDBDatabase | null>(resolve => {
      const failed = (): void => {
        if (opening === null) failedAtOnce = true;
        else if (db === opening) db = null;
        resolve(null);
      };
      try {
        const req = idb.open(OUTBOX_DB, 1);
        req.onupgradeneeded = () => { if (!req.result.objectStoreNames.contains(OUTBOX_STORE)) req.result.createObjectStore(OUTBOX_STORE, { keyPath: 'key' }); };
        req.onsuccess = () => {
          const d = req.result;
          d.onclose = () => { if (db === opening) db = null; };
          d.onversionchange = () => { d.close(); if (db === opening) db = null; };
          resolve(d);
        };
        req.onerror = failed;
        req.onblocked = failed;
      } catch {
        failed();
      }
    });
    if (!failedAtOnce) db = opening;
    return opening;
  };
  const run = <T>(d: IDBDatabase, mode: IDBTransactionMode, work: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> => new Promise((resolve, reject) => {
    const tx = d.transaction(OUTBOX_STORE, mode);
    const req = work(tx.objectStore(OUTBOX_STORE));
    tx.oncomplete = () => resolve(req.result);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
  /** Runs one transaction; a failed one forgets the connection and is tried once more on a new one. Rejects when there is no database or both tries fail. */
  const transact = async <T>(mode: IDBTransactionMode, work: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> => {
    for (let tries = 1; ; tries++) {
      const opening = open();
      let d: IDBDatabase | null;
      try {
        d = await opening;
      } catch {
        d = null;
      }
      if (!d && db === opening) db = null;
      if (!d) throw new Unavailable();
      try {
        return await run(d, mode, work);
      } catch (e) {
        if (db === opening) db = null;
        try { d.close(); } catch { /* already closed */ }
        if (tries >= 2) throw e;
      }
    }
  };
  return {
    async all() {
      let stored: Pending[] = [];
      try {
        stored = (await transact('readonly', s => s.getAll())).filter(isPending);
      } catch {
        // Unreadable now: the notes held in memory are listed, and the stored ones come back on the next read that works.
      }
      const held = new Map(stored.map(p => [p.key, p]));
      for (const p of await fallback.all()) held.set(p.key, p); // a note this view could only keep in memory
      return [...held.values()];
    },
    async put(p) {
      try {
        await transact('readwrite', s => s.put({ key: p.key, bundle: p.bundle, made: p.made, reason: p.reason }));
        await fallback.remove(p.key);
        return false;
      } catch {
        // The browser refused to store it (a full disk, a locked-down window): keep it in memory rather than lose it.
        return fallback.put(p);
      }
    },
    async remove(key) {
      await fallback.remove(key);
      try {
        await transact('readwrite', s => s.delete(key));
      } catch (e) {
        if (!(e instanceof Unavailable)) throw e;
      }
    },
    memoryOnly: () => fallback.memoryOnly(),
  };
}
