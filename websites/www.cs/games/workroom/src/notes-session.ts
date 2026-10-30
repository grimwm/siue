// The notes on this page view: make the notes key when there is none yet (made
// and locked on this page, then uploaded), unlock the keyring with the passphrase
// (used once, kept nowhere), list and open every note, seal a new one to the
// unlocked keyring's current key and send it through the outbox, delete. The
// unlocked private keys live in the vault and the current public key here; the
// unlock is also remembered in this browser (remember.ts) for the same sign-in
// and keyring, so a reload restores it, and a lock forgets it. Before an unlock
// or a restore nothing can be sealed.
import { NetworkError, NoKeyring, ServerError, SignedOut, UnreadableAnswer } from './api.ts';
import type { PageApi } from './api.ts';
import { DownloadFailed, buildHistory } from './history.ts';
import type { HistoryItem, OpenOutcome } from './history.ts';
import type { NoteBody } from './note.ts';
import { SEND_MESSAGES } from './outbox.ts';
import type { AddReport, FlushReport, Outbox, Pending } from './outbox.ts';
import { NoteUnreadable, open, seal } from './seal.ts';
import type { PublicKey } from './seal.ts';
import { PASSPHRASE_MESSAGES, checkPassphrase, makeNotesKey } from './keymaker.ts';
import { KeyringInvalid, NoCrypto, WrongPassphrase, unlockKeyring } from './unlock.ts';
import { forgetfulMemory, keyringDigest } from './remember.ts';
import type { KeyMemory } from './remember.ts';
import type { Vault } from './vault.ts';

export const UNLOCK_MESSAGES = {
  noKeyring: 'You have no notes key yet. Make your notes key under Your notes.',
  keyExists: 'There is a notes key already. Reload the page and unlock it with its passphrase.',
  wrong: 'That passphrase did not unlock the key.',
  invalid: 'The notes key on the server is damaged or does not match its fingerprints. Run make music-setup, then reload the page.',
  signedOut: 'Your sign-in ended. Sign in again.',
  offline: 'Could not reach the server. Check the connection and try again.',
} as const;

export const NO_CRYPTO = 'This browser cannot unlock or seal notes: it has no Web Crypto. Use a current browser, on the https page.';
export const DISCARD_FAILED = 'The saved note could not be discarded from this browser. Try again.';

/** Why something failed, as a phrase to follow "because" or a colon: no full stop, no developer text. */
export function failureReason(e: unknown): string {
  if (e instanceof SignedOut) return 'your sign-in ended';
  if (e instanceof NoCrypto) return 'this browser has no Web Crypto';
  if (e instanceof ServerError) return `the server answered with an error (${e.status})`;
  if (e instanceof NetworkError) return 'the connection to the server failed';
  if (e instanceof UnreadableAnswer) return "the server's answer could not be read";
  return 'something unexpected went wrong';
}

/** What went wrong, as a whole message for the owner. */
export function describeFailure(e: unknown): string {
  if (e instanceof SignedOut) return UNLOCK_MESSAGES.signedOut;
  if (e instanceof NoCrypto) return NO_CRYPTO;
  if (e instanceof ServerError) return `The server answered with an error (${e.status}). Try again in a moment.`;
  if (e instanceof NetworkError) return UNLOCK_MESSAGES.offline;
  if (e instanceof UnreadableAnswer) return 'The server sent an answer this page cannot read. Try again in a moment.';
  return 'Something unexpected went wrong. Try again.';
}

export const unreadableMessage = (n: number): string => `${n} ${n === 1 ? 'note' : 'notes'} on the server could not be read, so ${n === 1 ? 'it is' : 'they are'} not listed.`;

export const UNLOCK_FIRST = 'Unlock your notes first: each note is sealed to your notes key, and the passphrase unlocks it.';

/** `memory` remembers the unlock in this browser; without it every visit asks for the passphrase. */
export interface SessionDeps { api: PageApi; vault: Vault; outbox: Outbox; memory?: KeyMemory }
export interface NotesSession {
  hasKeyring(): Promise<boolean>;
  /** Makes a notes key locked with the passphrase, uploads it, then unlocks it with the same passphrase; what went wrong, or null. Never replaces a key the server already holds. */
  makeKey(passphrase: string): Promise<string | null>;
  unlocked(): boolean;
  unlock(passphrase: string): Promise<string | null>;
  /** Unlocks with what this browser remembers, when it was remembered under this sign-in and this keyring; true when it did. Forgets it when either changed. Never throws. */
  restore(): Promise<boolean>;
  history(): Promise<HistoryItem[]>;
  /** How many notes the last history() listed that this page could not read (they are not in the history). */
  unreadable(): number;
  send(body: NoteBody, audio: Uint8Array<ArrayBuffer> | null): Promise<AddReport>;
  flush(): Promise<FlushReport>;
  kept(): Promise<Pending[]>;
  discard(key: string): Promise<void>;
  remove(id: string): Promise<void>;
  removeAll(): Promise<number>;
  /** Locks the notes and forgets the remembered unlock. */
  lock(): void;
  /** True while a note not sent yet is held only in this page view's memory: closing the page would lose it. */
  memoryOnly(): boolean;
}

/** Notes opened at once while listing. */
const AT_ONCE = 6;

export function createNotesSession(d: SessionDeps): NotesSession {
  const memory = d.memory ?? forgetfulMemory;
  const outcomes = new Map<string, OpenOutcome>();
  /** The unlocked keyring's current public key: what new notes are sealed to. Null while locked. */
  let current: PublicKey | null = null;
  /** Incremented by lock(): an operation that started before a lock drops its result. */
  let epoch = 0;
  let skipped = 0;
  const say = (e: unknown): string => (e instanceof NoKeyring ? UNLOCK_MESSAGES.noKeyring
    : e instanceof WrongPassphrase ? UNLOCK_MESSAGES.wrong
    : e instanceof KeyringInvalid ? UNLOCK_MESSAGES.invalid
    : describeFailure(e));
  const openOne = async (id: string, ring: ReadonlyMap<string, CryptoKey>, at: number): Promise<void> => {
    let bytes: Uint8Array<ArrayBuffer>;
    try {
      bytes = await d.api.bytes(id);
    } catch (e) {
      if (e instanceof SignedOut) throw e;
      if (at === epoch) outcomes.set(id, new DownloadFailed(failureReason(e)));
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
  const session: NotesSession = {
    async hasKeyring() {
      try {
        await d.api.keyring();
        return true;
      } catch (e) {
        return !(e instanceof NoKeyring);
      }
    },
    async makeKey(passphrase) {
      const weak = checkPassphrase(passphrase, passphrase);
      if (weak !== null) return PASSPHRASE_MESSAGES[weak];
      try {
        const made = await makeNotesKey(passphrase);
        // Another tab may have made one while this key was being made: never seal over it.
        try {
          await d.api.keyring();
          return UNLOCK_MESSAGES.keyExists;
        } catch (e) {
          if (!(e instanceof NoKeyring)) throw e;
        }
        await d.api.uploadKeyring(made.locked, made.current);
      } catch (e) {
        return say(e);
      }
      return session.unlock(passphrase);
    },
    unlocked: () => current !== null,
    unreadable: () => skipped,
    async unlock(passphrase) {
      const at = epoch;
      try {
        const { locked, session } = await d.api.keyring();
        const unlocked = await unlockKeyring(locked, passphrase);
        if (at !== epoch) return null;
        d.vault.load(unlocked.ring);
        current = unlocked.current;
        if (session !== '') {
          await memory.keep({ session, keyring: await keyringDigest(locked), ring: unlocked.ring, current: unlocked.current });
          if (at !== epoch) await memory.forget(); // a lock while it was being stored
        }
        return null;
      } catch (e) {
        return say(e);
      }
    },
    async restore() {
      const at = epoch;
      const kept = await memory.recall();
      if (kept === null) return false;
      try {
        const { locked, session } = await d.api.keyring();
        const digest = await keyringDigest(locked);
        if (at !== epoch) return false;
        if (session === '' || session !== kept.session || digest !== kept.keyring || !kept.ring.has(kept.current.fingerprint)) {
          await memory.forget();
          return false;
        }
        d.vault.load(kept.ring);
        current = kept.current;
        return true;
      } catch (e) {
        // A sign-in that ended, or a keyring gone or unusable, forgets it; a failed connection keeps it for the next visit.
        if (!(e instanceof NetworkError || e instanceof ServerError || e instanceof UnreadableAnswer)) await memory.forget();
        return false;
      }
    },
    async history() {
      if (current === null) throw new Error('The notes are locked.');
      const at = epoch;
      const { notes: server, unreadable } = await d.api.list();
      if (at === epoch) skipped = unreadable;
      const ring = d.vault.keyring();
      const todo = server.filter(n => { const o = outcomes.get(n.id); return o === undefined || o instanceof DownloadFailed; }).map(n => n.id);
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
      skipped = 0;
      current = null;
      epoch++;
      void memory.forget();
    },
  };
  return session;
}
