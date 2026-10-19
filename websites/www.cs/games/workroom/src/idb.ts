// The outbox's home in the browser: IndexedDB database "siue-music", store
// "outbox", one record per sealed note waiting to be sent ({ key, bundle,
// made, reason }). Nothing of any key, and nothing in the clear about a note,
// is ever stored here. Where IndexedDB is missing, refuses to open, or refuses
// to store a note (some private windows, a full disk), that note lives in this
// page view's memory instead and memoryOnly() says so.
import { memoryOutbox } from './outbox.ts';
import type { OutboxStore, Pending } from './outbox.ts';

export const OUTBOX_DB = 'siue-music';
export const OUTBOX_STORE = 'outbox';

const isPending = (x: unknown): x is Pending => {
  const p = x as Partial<Pending> | null;
  return typeof p === 'object' && p !== null && typeof p.key === 'string' && p.bundle instanceof Uint8Array && typeof p.made === 'string' && typeof p.reason === 'string';
};

export function indexedDbOutbox(idb: IDBFactory | null = typeof indexedDB === 'undefined' ? null : indexedDB): OutboxStore {
  const fallback = memoryOutbox();
  let inMemory = !idb;
  if (!idb) return { ...fallback, memoryOnly: () => true };
  let db: Promise<IDBDatabase | null> | null = null;
  const open = (): Promise<IDBDatabase | null> => (db ??= new Promise(resolve => {
    try {
      const req = idb.open(OUTBOX_DB, 1);
      req.onupgradeneeded = () => { if (!req.result.objectStoreNames.contains(OUTBOX_STORE)) req.result.createObjectStore(OUTBOX_STORE, { keyPath: 'key' }); };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => { inMemory = true; resolve(null); };
      req.onblocked = () => { inMemory = true; resolve(null); };
    } catch {
      inMemory = true;
      resolve(null);
    }
  }));
  const run = <T>(d: IDBDatabase, mode: IDBTransactionMode, work: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> => new Promise((resolve, reject) => {
    const tx = d.transaction(OUTBOX_STORE, mode);
    const req = work(tx.objectStore(OUTBOX_STORE));
    tx.oncomplete = () => resolve(req.result);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
  return {
    async all() {
      const d = await open();
      const stored = d ? (await run(d, 'readonly', s => s.getAll())).filter(isPending) : [];
      const held = new Map(stored.map(p => [p.key, p]));
      for (const p of await fallback.all()) held.set(p.key, p); // a note this view could only keep in memory
      return [...held.values()];
    },
    async put(p) {
      const d = await open();
      if (d) {
        try {
          await run(d, 'readwrite', s => s.put({ key: p.key, bundle: p.bundle, made: p.made, reason: p.reason }));
          await fallback.remove(p.key);
          return;
        } catch {
          // The browser refused to store it (a full disk, a locked-down window): keep it in memory rather than lose it.
        }
      }
      inMemory = true;
      await fallback.put(p);
    },
    async remove(key) {
      const d = await open();
      if (d) await run(d, 'readwrite', s => s.delete(key));
      await fallback.remove(key);
    },
    memoryOnly: () => inMemory,
  };
}
