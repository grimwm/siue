// The remembered unlock, against a fake IndexedDB (fake-indexeddb): a reload
// restores it for the same sign-in and keyring and forgets it when either
// changed or the sign-in ended; a lock forgets it; only non-extractable keys,
// the sign-in tag and the keyring's digest are stored, never the passphrase or
// the locked keyring.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { IDBFactory } from 'fake-indexeddb';
import { NetworkError, SignedOut, type PageApi } from '../src/api.ts';
import { createNotesSession } from '../src/notes-session.ts';
import { createOutbox, memoryOutbox } from '../src/outbox.ts';
import { KEYS_DB, KEYS_STORE, indexedDbKeyMemory, keyringDigest } from '../src/remember.ts';
import type { KeyMemory } from '../src/remember.ts';
import { lockKeyring, unlockKeyring } from '../src/unlock.ts';
import type { LockedKeyring } from '../src/unlock.ts';
import { createVault } from '../src/vault.ts';
import { b64, fx } from './fixture-key.ts';

const note = { v: 1 as const, kind: 'text' as const, piece: 'p', draft: 1, from: 0, to: 1, fromBar: 1, toBar: 1, lane: null, text: 'hi', reaction: null, curve: null, audio: null, made: '2026-10-20T00:00:00.000Z' };

function server() {
  const state = { keyring: fx.keyring as LockedKeyring, session: 'tag-1', fail: null as unknown, keyringCalls: 0, uploads: 0 };
  const api: PageApi = {
    takeBytes: async () => new Uint8Array(0),
    convertTake: async () => ({ status: 200, data: {} }),
    upload: async () => { state.uploads++; return { kind: 'sent', id: '0'.repeat(32) }; },
    list: async () => ({ notes: [], unreadable: 0 }),
    bytes: async () => new Uint8Array(),
    remove: async () => 0,
    removeAll: async () => 0,
    keyring: async () => { state.keyringCalls++; if (state.fail) throw state.fail; return { locked: state.keyring, session: state.session, ai: [] }; },
    uploadKeyring: async () => {},
    changeKeyring: async () => {},
    deleteDraft: async () => 0,
    saveDraft: async () => ({ status: 201, data: {} }),
    checkPairing: async () => 'wrong_code',
    pairKeyring: async () => null,
  };
  return { api, state };
}
const page = (s: ReturnType<typeof server>, memory: KeyMemory) => createNotesSession({ api: s.api, vault: createVault(), outbox: createOutbox(memoryOutbox(), s.api, () => crypto.randomUUID()), memory });
const factory = () => new IDBFactory() as unknown as globalThis.IDBFactory;

test('an unlock is restored on the next page view for the same sign-in and keyring, and seals', async () => {
  const idb = factory();
  const s = server();
  assert.equal(await page(s, indexedDbKeyMemory(idb)).restore(), false, 'nothing remembered yet');
  assert.equal(s.state.keyringCalls, 0, 'nothing remembered asks the server nothing');
  assert.equal(await page(s, indexedDbKeyMemory(idb)).unlock(fx.passphrase), null);
  const reloaded = page(s, indexedDbKeyMemory(idb));
  assert.equal(reloaded.unlocked(), false);
  assert.equal(await reloaded.restore(), true);
  assert.equal(reloaded.unlocked(), true);
  await reloaded.send(note, null);
  assert.equal(s.state.uploads, 1);
});

test('a new sign-in, a rotated keyring or an ended sign-in forgets it; a failed connection keeps it', async () => {
  for (const change of ['session', 'keyring', 'signed out'] as const) {
    const idb = factory();
    const s = server();
    await page(s, indexedDbKeyMemory(idb)).unlock(fx.passphrase);
    if (change === 'session') s.state.session = 'tag-2';
    else if (change === 'keyring') s.state.keyring = await lockKeyring([{ fingerprint: fx.fingerprint, pkcs8: b64(fx.pkcs8) }], fx.passphrase);
    else s.state.fail = new SignedOut('ended');
    assert.equal(await page(s, indexedDbKeyMemory(idb)).restore(), false, change);
    assert.equal(await indexedDbKeyMemory(idb).recall(), null, `${change}: forgotten`);
  }
  const idb = factory();
  const s = server();
  await page(s, indexedDbKeyMemory(idb)).unlock(fx.passphrase);
  s.state.fail = new NetworkError('offline');
  assert.equal(await page(s, indexedDbKeyMemory(idb)).restore(), false);
  s.state.fail = null;
  assert.equal(await page(s, indexedDbKeyMemory(idb)).restore(), true, 'kept for the next visit');
});

test('a lock forgets it; a sign-in with no tag is not remembered', async () => {
  const idb = factory();
  const s = server();
  const notes = page(s, indexedDbKeyMemory(idb));
  await notes.unlock(fx.passphrase);
  notes.lock();
  // lock() forgets in the background: wait until the record is gone (a lock that never forgets fails here).
  for (let i = 0; i < 100 && (await indexedDbKeyMemory(idb).recall()) !== null; i++) await new Promise(r => setTimeout(r, 5));
  assert.equal(await page(s, indexedDbKeyMemory(idb)).restore(), false);
  s.state.session = '';
  await page(s, indexedDbKeyMemory(idb)).unlock(fx.passphrase);
  assert.equal(await indexedDbKeyMemory(idb).recall(), null);
});

test('only non-extractable keys, the tag and the digest are stored; an extractable key is refused', async () => {
  const idb = factory();
  const s = server();
  await page(s, indexedDbKeyMemory(idb)).unlock(fx.passphrase);
  const db = await new Promise<IDBDatabase>((resolve, reject) => { const r = idb.open(KEYS_DB); r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error); });
  assert.deepEqual([...db.objectStoreNames], [KEYS_STORE]);
  const rows = await new Promise<Record<string, unknown>[]>((resolve, reject) => { const q = db.transaction(KEYS_STORE).objectStore(KEYS_STORE).getAll(); q.onsuccess = () => resolve(q.result); q.onerror = () => reject(q.error); });
  db.close();
  assert.equal(rows.length, 1);
  const row = rows[0]!;
  assert.deepEqual(Object.keys(row).sort(), ['ai', 'current', 'id', 'keyring', 'ring', 'session']);
  assert.deepEqual(row['ai'], [], 'the paired AI keys\' public halves, none here');
  assert.equal(row['session'], 'tag-1');
  assert.equal(row['keyring'], await keyringDigest(fx.keyring));
  assert.ok([...(row['ring'] as Map<string, CryptoKey>).values()].every(k => k instanceof CryptoKey && !k.extractable));
  const text = JSON.stringify(row);
  assert.ok(!text.includes(fx.passphrase) && !text.includes(fx.keyring.ct), 'no passphrase, no locked keyring');

  const memory = indexedDbKeyMemory(factory());
  const unlocked = await unlockKeyring(fx.keyring, fx.passphrase);
  const loose = await crypto.subtle.importKey('pkcs8', b64(fx.pkcs8), { name: 'RSA-OAEP', hash: 'SHA-256' }, true, ['decrypt']);
  await memory.keep({ session: 't', keyring: 'k', ring: new Map([[fx.fingerprint, loose]]), current: unlocked.current, ai: [] });
  assert.equal(await memory.recall(), null);
});

test('no IndexedDB, or one that refuses: nothing is remembered and nothing throws', async () => {
  const refusing = { open: () => { throw new Error('denied'); } } as unknown as globalThis.IDBFactory;
  for (const memory of [indexedDbKeyMemory(null), indexedDbKeyMemory(refusing)]) {
    const unlocked = await unlockKeyring(fx.keyring, fx.passphrase);
    await memory.keep({ session: 't', keyring: 'k', ring: unlocked.ring, current: unlocked.current, ai: [] });
    assert.equal(await memory.recall(), null);
    await memory.forget();
  }
});
