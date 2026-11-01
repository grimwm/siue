// Vocal takes on this device: IndexedDB database "siue-music-takes", a store of takes (what each is) and a store of
// its recorded sound in chunks of 16-bit mono PCM, written as the take records so a reload keeps all but the last
// few seconds. A take is "Only On This Device" until it is saved to the studio, when `saved` names its studio file.
// Where IndexedDB is missing or refuses, takes live in this page view's memory and `memoryOnly()` says so.

export const TAKES_DB = 'siue-music-takes';
const TAKES = 'takes';
const CHUNKS = 'chunks';

export interface LocalTake {
  id: string; // local-<uuid>
  piece: string;
  name: string;
  made: string;
  rate: number;
  samples: number;
  /** The studio file once saved (vocal-<sha256>.<ext>). */
  saved?: string;
}

export interface TakeStore {
  /** Starts a take; its chunks follow with `append`. */
  begin(t: LocalTake): Promise<void>;
  append(id: string, seq: number, pcm: Int16Array): Promise<void>;
  /** Sets what is known of a take (its final length, its saved name). */
  update(t: LocalTake): Promise<void>;
  list(piece: string): Promise<LocalTake[]>;
  /** A take's sound, every chunk in order. */
  pcm(id: string): Promise<Int16Array | null>;
  remove(id: string): Promise<void>;
  memoryOnly(): boolean;
}

/** Takes in this page view's memory only. */
export function memoryTakes(): TakeStore {
  const takes = new Map<string, LocalTake>();
  const chunks = new Map<string, Int16Array[]>();
  return {
    async begin(t) { takes.set(t.id, { ...t }); chunks.set(t.id, []); },
    async append(id, seq, pcm) { (chunks.get(id) ?? chunks.set(id, []).get(id)!)[seq] = Int16Array.from(pcm); },
    async update(t) { takes.set(t.id, { ...t }); },
    async list(piece) { return [...takes.values()].filter(t => t.piece === piece).map(t => ({ ...t })); },
    async pcm(id) { return chunks.has(id) ? joinChunks(chunks.get(id)!) : null; },
    async remove(id) { takes.delete(id); chunks.delete(id); },
    memoryOnly: () => true,
  };
}

export function joinChunks(parts: readonly (Int16Array | undefined)[]): Int16Array {
  const all = parts.filter((p): p is Int16Array => !!p);
  const out = new Int16Array(all.reduce((n, p) => n + p.length, 0));
  let at = 0;
  for (const p of all) { out.set(p, at); at += p.length; }
  return out;
}

const isTake = (x: unknown): x is LocalTake => {
  const t = x as Partial<LocalTake> | null;
  return !!t && typeof t.id === 'string' && typeof t.piece === 'string' && typeof t.rate === 'number' && typeof t.samples === 'number';
};

/** Takes in IndexedDB, falling back to memory (and saying so) where the browser refuses. */
export function indexedDbTakes(idb: IDBFactory | null = typeof indexedDB === 'undefined' ? null : indexedDB): TakeStore {
  const memory = memoryTakes();
  let refused = !idb;
  let db: Promise<IDBDatabase | null> | null = null;
  const open = (): Promise<IDBDatabase | null> => db ??= new Promise(resolve => {
    try {
      const req = idb!.open(TAKES_DB, 1);
      req.onupgradeneeded = () => {
        const d = req.result;
        if (!d.objectStoreNames.contains(TAKES)) d.createObjectStore(TAKES, { keyPath: 'id' });
        if (!d.objectStoreNames.contains(CHUNKS)) d.createObjectStore(CHUNKS, { keyPath: ['id', 'seq'] });
      };
      req.onsuccess = () => { req.result.onclose = () => { db = null; }; resolve(req.result); };
      req.onerror = () => { db = null; resolve(null); };
      req.onblocked = () => { db = null; resolve(null); };
    } catch {
      db = null;
      resolve(null);
    }
  });
  const run = async <T>(stores: string[], mode: IDBTransactionMode, work: (tx: IDBTransaction) => IDBRequest<T> | void): Promise<T | undefined> => {
    const d = refused ? null : await open();
    if (!d) throw new Error('no IndexedDB');
    return new Promise((resolve, reject) => {
      const tx = d.transaction(stores, mode);
      const req = work(tx);
      tx.oncomplete = () => resolve(req ? req.result : undefined);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  };
  /** Tries IndexedDB; once it refuses, this view keeps every take in memory from then on. */
  const either = async <T>(stored: () => Promise<T>, inMemory: () => Promise<T>): Promise<T> => {
    if (refused) return inMemory();
    try {
      return await stored();
    } catch {
      refused = true;
      return inMemory();
    }
  };
  return {
    begin: t => either(async () => { await run([TAKES], 'readwrite', tx => tx.objectStore(TAKES).put({ ...t })); }, () => memory.begin(t)),
    append: (id, seq, pcm) => either(async () => { await run([CHUNKS], 'readwrite', tx => tx.objectStore(CHUNKS).put({ id, seq, pcm: Int16Array.from(pcm) })); }, () => memory.append(id, seq, pcm)),
    update: t => either(async () => { await run([TAKES], 'readwrite', tx => tx.objectStore(TAKES).put({ ...t })); }, () => memory.update(t)),
    async list(piece) {
      const mine = await memory.list(piece);
      if (refused) return mine;
      try {
        const all = ((await run([TAKES], 'readonly', tx => tx.objectStore(TAKES).getAll())) ?? []).filter(isTake);
        return [...all.filter(t => t.piece === piece), ...mine].sort((a, b) => a.made.localeCompare(b.made));
      } catch {
        return mine;
      }
    },
    async pcm(id) {
      const held = await memory.pcm(id);
      if (held || refused) return held;
      try {
        const rows = (await run([CHUNKS], 'readonly', tx => tx.objectStore(CHUNKS).getAll(IDBKeyRange.bound([id, 0], [id, Number.MAX_SAFE_INTEGER])))) as { seq: number; pcm: Int16Array }[] | undefined;
        if (!rows?.length) return null;
        return joinChunks(rows.sort((a, b) => a.seq - b.seq).map(r => r.pcm));
      } catch {
        return null;
      }
    },
    async remove(id) {
      await memory.remove(id);
      if (refused) return;
      try {
        await run([TAKES, CHUNKS], 'readwrite', tx => {
          tx.objectStore(TAKES).delete(id);
          tx.objectStore(CHUNKS).delete(IDBKeyRange.bound([id, 0], [id, Number.MAX_SAFE_INTEGER]));
        });
      } catch { /* forgotten next time the database opens */ }
    },
    memoryOnly: () => refused,
  };
}

/** A new take's id. */
export const newTakeId = (uuid: () => string = () => crypto.randomUUID()): string => `local-${uuid()}`;
