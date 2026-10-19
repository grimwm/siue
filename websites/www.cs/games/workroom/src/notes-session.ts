// The owner's notes on this page view: unlock the keyring with the passphrase
// (used once, kept nowhere), list and open every note, seal a new one to the
// unlocked keyring's current key and send it through the outbox, delete. The
// unlocked private keys live in the vault and the current public key here,
// both in memory only; before an unlock nothing can be sealed.
import { NoKeyring, SignedOut } from './api.ts';
import type { PageApi } from './api.ts';
import { buildHistory } from './history.ts';
import type { HistoryItem, OpenOutcome } from './history.ts';
import type { NoteBody } from './note.ts';
import { SEND_MESSAGES } from './outbox.ts';
import type { AddReport, FlushReport, Outbox, Pending } from './outbox.ts';
import { NoteUnreadable, open, seal } from './seal.ts';
import type { PublicKey } from './seal.ts';
import { KeyringInvalid, WrongPassphrase, unlockKeyring } from './unlock.ts';
import type { Vault } from './vault.ts';

export const UNLOCK_MESSAGES = {
  noKeyring: 'No notes key has been uploaded yet (make music-setup).',
  wrong: 'That passphrase did not unlock the key.',
  invalid: 'The notes key on the server is damaged or does not match its fingerprints. Run make music-setup, then reload the page.',
  signedOut: 'Your sign-in ended. Sign in again.',
  offline: 'Could not reach the server. Check the connection and try again.',
} as const;

export const UNLOCK_FIRST = 'Unlock your notes first: each note is sealed to your notes key, and the passphrase unlocks it.';

export interface SessionDeps { api: PageApi; vault: Vault; outbox: Outbox }
export interface NotesSession {
  hasKeyring(): Promise<boolean>;
  unlocked(): boolean;
  unlock(passphrase: string): Promise<string | null>;
  history(): Promise<HistoryItem[]>;
  send(body: NoteBody, audio: Uint8Array<ArrayBuffer> | null): Promise<AddReport>;
  flush(): Promise<FlushReport>;
  kept(): Promise<Pending[]>;
  discard(key: string): Promise<void>;
  remove(id: string): Promise<void>;
  removeAll(): Promise<number>;
  lock(): void;
  /** True while a note not sent yet is held only in this page view's memory: closing the page would lose it. */
  memoryOnly(): boolean;
}

/** Notes opened at once while listing. */
const AT_ONCE = 6;

export function createNotesSession(d: SessionDeps): NotesSession {
  const outcomes = new Map<string, OpenOutcome>();
  /** The unlocked keyring's current public key: what new notes are sealed to. Null while locked. */
  let current: PublicKey | null = null;
  /** Incremented by lock(): an operation that started before a lock drops its result. */
  let epoch = 0;
  const say = (e: unknown): string => (e instanceof NoKeyring ? UNLOCK_MESSAGES.noKeyring
    : e instanceof WrongPassphrase ? UNLOCK_MESSAGES.wrong
    : e instanceof KeyringInvalid ? UNLOCK_MESSAGES.invalid
    : e instanceof SignedOut ? UNLOCK_MESSAGES.signedOut
    : UNLOCK_MESSAGES.offline);
  const openOne = async (id: string, ring: ReadonlyMap<string, CryptoKey>, at: number): Promise<void> => {
    let bytes: Uint8Array<ArrayBuffer>;
    try {
      bytes = await d.api.bytes(id);
    } catch (e) {
      if (e instanceof SignedOut) throw e;
      if (at === epoch) outcomes.set(id, 'download');
      return;
    }
    let outcome: OpenOutcome;
    try {
      outcome = await open(bytes, ring);
    } catch (e) {
      outcome = e instanceof NoteUnreadable ? e : new NoteUnreadable('format');
    }
    if (at === epoch) outcomes.set(id, outcome);
  };
  return {
    async hasKeyring() {
      try {
        await d.api.keyring();
        return true;
      } catch (e) {
        return !(e instanceof NoKeyring);
      }
    },
    unlocked: () => current !== null,
    async unlock(passphrase) {
      const at = epoch;
      try {
        const unlocked = await unlockKeyring(await d.api.keyring(), passphrase);
        if (at !== epoch) return null;
        d.vault.load(unlocked.ring);
        current = unlocked.current;
        return null;
      } catch (e) {
        return say(e);
      }
    },
    async history() {
      if (current === null) throw new Error('The notes are locked.');
      const at = epoch;
      const server = await d.api.list();
      const ring = d.vault.keyring();
      const todo = server.filter(n => { const o = outcomes.get(n.id); return o === undefined || o === 'download'; }).map(n => n.id);
      for (let i = 0; i < todo.length; i += AT_ONCE) await Promise.all(todo.slice(i, i + AT_ONCE).map(id => openOne(id, ring, at)));
      if (at !== epoch) return buildHistory(server, new Map());
      const live = new Set(server.map(n => n.id));
      for (const id of [...outcomes.keys()]) if (!live.has(id)) outcomes.delete(id);
      return buildHistory(server, outcomes);
    },
    async send(body, audio) {
      const key = current;
      if (key === null) throw new Error(UNLOCK_FIRST);
      let bundle: Uint8Array<ArrayBuffer>;
      try {
        bundle = await seal(body, audio, key);
      } catch {
        throw new Error(SEND_MESSAGES.sealFailed);
      }
      if (key !== current) throw new Error(UNLOCK_FIRST);
      return d.outbox.add(bundle, body.made);
    },
    flush: () => d.outbox.flush(),
    kept: () => d.outbox.pending(),
    discard: key => d.outbox.discard(key),
    memoryOnly: () => d.outbox.memoryOnly(),
    async remove(id) {
      await d.api.remove(id);
      outcomes.delete(id);
    },
    async removeAll() {
      const n = await d.api.removeAll();
      outcomes.clear();
      return n;
    },
    lock() {
      d.vault.clear();
      outcomes.clear();
      current = null;
      epoch++;
    },
  };
}
