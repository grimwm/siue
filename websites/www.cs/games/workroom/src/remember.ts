// The unlock this browser remembers, so a reload does not ask for the passphrase again: IndexedDB database
// "siue-music-keys", store "unlocked", one record { id, session, keyring, ring, current }. The private keys are the
// non-extractable CryptoKeys the unlock made, stored as they are, so no script can read their bytes; the
// passphrase and the locked keyring are never stored. `session` is the server's tag for the sign-in the unlock was
// made under and `keyring` the SHA-256 of the locked keyring it unlocked: a page that finds either changed (a
// sign-out, a new sign-in, a rotated key) forgets the record. Where IndexedDB is missing or refuses, nothing is
// remembered and every visit asks for the passphrase.
import type { PublicKey } from './seal.ts';
import type { LockedKeyring } from './unlock.ts';

export const KEYS_DB = 'siue-music-keys';
export const KEYS_STORE = 'unlocked';
const RECORD = 'ring';

export interface Remembered {
  /** The server's tag for the sign-in the unlock was made under. */
  session: string;
  /** keyringDigest() of the locked keyring the passphrase unlocked. */
  keyring: string;
  /** Every entry's non-extractable private key, by fingerprint, in keyring order. */
  ring: Map<string, CryptoKey>;
  current: PublicKey;
}

export interface KeyMemory {
  /** The remembered unlock, or null when there is none or it cannot be read. */
  recall(): Promise<Remembered | null>;
  /** Remembers the unlock; refuses an extractable key. Never throws: an unlock that cannot be remembered is still an unlock. */
  keep(r: Remembered): Promise<void>;
  /** Forgets the remembered unlock. Never throws. */
  forget(): Promise<void>;
}

/** The SHA-256, in hex, of the locked keyring's fields in a fixed order: changes whenever the keyring does. */
export async function keyringDigest(locked: LockedKeyring): Promise<string> {
  const text = JSON.stringify([locked.v, locked.kdf, locked.iterations, locked.salt, locked.iv, locked.ct]);
  const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)));
  return Array.from(hash, b => b.toString(16).padStart(2, '0')).join('');
}

/** Remembers nothing: every visit asks for the passphrase. */
export const forgetfulMemory: KeyMemory = { recall: async () => null, keep: async () => {}, forget: async () => {} };

const isRemembered = (x: unknown): x is Remembered => {
  const r = x as Partial<Remembered> | null;
  return typeof r === 'object' && r !== null && typeof r.session === 'string' && r.session !== '' && typeof r.keyring === 'string'
    && r.ring instanceof Map && r.ring.size > 0 && [...r.ring.values()].every(k => k instanceof CryptoKey && !k.extractable)
    && typeof r.current === 'object' && r.current !== null && typeof r.current.fingerprint === 'string' && typeof r.current.spki === 'string';
};

export function indexedDbKeyMemory(idb: IDBFactory | null = typeof indexedDB === 'undefined' ? null : indexedDB): KeyMemory {
  if (!idb) return forgetfulMemory;
  const open = (): Promise<IDBDatabase> => new Promise((resolve, reject) => {
    const req = idb.open(KEYS_DB, 1);
    req.onupgradeneeded = () => { if (!req.result.objectStoreNames.contains(KEYS_STORE)) req.result.createObjectStore(KEYS_STORE, { keyPath: 'id' }); };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    req.onblocked = () => reject(new Error('blocked'));
  });
  const transact = async <T>(mode: IDBTransactionMode, work: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> => {
    const d = await open();
    try {
      return await new Promise<T>((resolve, reject) => {
        const tx = d.transaction(KEYS_STORE, mode);
        const req = work(tx.objectStore(KEYS_STORE));
        tx.oncomplete = () => resolve(req.result);
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      });
    } finally {
      d.close();
    }
  };
  return {
    async recall() {
      try {
        const found: unknown = await transact('readonly', s => s.get(RECORD));
        return isRemembered(found) ? { session: found.session, keyring: found.keyring, ring: new Map(found.ring), current: found.current } : null;
      } catch {
        return null;
      }
    },
    async keep(r) {
      if ([...r.ring.values()].some(k => k.extractable)) return;
      try {
        await transact('readwrite', s => s.put({ id: RECORD, session: r.session, keyring: r.keyring, ring: new Map(r.ring), current: { fingerprint: r.current.fingerprint, spki: r.current.spki } }));
      } catch {
        // The browser would not store it (a private window, a full disk): the next visit asks for the passphrase.
      }
    },
    async forget() {
      try {
        await transact('readwrite', s => s.delete(RECORD));
      } catch {
        // The record stays; the next visit checks it against the sign-in and the keyring again before using it.
      }
    },
  };
}
