// The notes session with the test keys: unlocking says what went wrong in plain
// words, nothing is sealed before an unlock and every note after it is sealed
// to the keyring's current key, sent notes come back opened, a damaged or
// missing note never stops the rest, an earlier key's note still opens,
// deletes forget what they removed.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NoKeyring, SignedOut, type PageApi } from '../src/api.ts';
import { UNLOCK_FIRST, UNLOCK_MESSAGES, createNotesSession } from '../src/notes-session.ts';
import { SEND_MESSAGES, createOutbox, memoryOutbox } from '../src/outbox.ts';
import { PROBLEMS } from '../src/history.ts';
import { headerFingerprint, seal } from '../src/seal.ts';
import type { LockedKeyring } from '../src/unlock.ts';
import { createVault } from '../src/vault.ts';
import type { NoteBody } from '../src/note.ts';
import { fx, otherKey } from './fixture-key.ts';

const note = (text: string, piece = 'test-piece'): NoteBody => ({ v: 1, kind: 'text', piece, draft: 1, from: 0, to: 1, fromBar: 1, toBar: 1, lane: null, text, reaction: null, curve: null, audio: null, made: '2026-10-20T00:00:00.000Z' });

function server() {
  const notes: { id: string; bytes: Uint8Array<ArrayBuffer>; arrived: number; picked: number | null }[] = [];
  let n = 0;
  const state = { failKeyring: null as unknown, keyring: fx.keyring as LockedKeyring, broken: new Set<string>(), downloads: 0 };
  const api: PageApi = {
    upload: async b => { const id = (++n).toString(16).padStart(32, '0'); notes.push({ id, bytes: b, arrived: n, picked: null }); return { kind: 'sent', id }; },
    list: async () => notes.map(x => ({ id: x.id, size: x.bytes.length, arrived_at: x.arrived, picked_up_at: x.picked })),
    bytes: async id => { state.downloads++; if (state.broken.has(id)) throw new Error('The server answered 500.'); return notes.find(x => x.id === id)!.bytes; },
    remove: async id => { const i = notes.findIndex(x => x.id === id); if (i >= 0) notes.splice(i, 1); return i >= 0 ? 1 : 0; },
    removeAll: async () => { const k = notes.length; notes.length = 0; return k; },
    keyring: async () => { if (state.failKeyring) throw state.failKeyring; return state.keyring; },
  };
  return { api, notes, state };
}
const session = (s = server()) => ({ s, notes: createNotesSession({ api: s.api, vault: createVault(), outbox: createOutbox(memoryOutbox(), s.api, () => crypto.randomUUID()) }) });
const locked = (e: unknown): boolean => e instanceof Error && e.message === UNLOCK_FIRST;

test('unlock: no keyring yet, a damaged keyring, a wrong passphrase, then the right passphrase', async () => {
  const { s, notes } = session();
  s.state.failKeyring = new NoKeyring('none');
  assert.equal(await notes.hasKeyring(), false);
  assert.equal(await notes.unlock(fx.passphrase), UNLOCK_MESSAGES.noKeyring);
  s.state.failKeyring = new TypeError('Failed to fetch');
  assert.equal(await notes.hasKeyring(), true, 'a server that cannot be asked is not a server without a keyring');
  s.state.failKeyring = null;
  assert.equal(await notes.hasKeyring(), true);
  s.state.keyring = { ...fx.keyring, iterations: 1000 };
  assert.equal(await notes.unlock(fx.passphrase), UNLOCK_MESSAGES.invalid);
  s.state.keyring = fx.keyring;
  assert.equal(await notes.unlock('not it'), UNLOCK_MESSAGES.wrong);
  assert.equal(notes.unlocked(), false);
  await assert.rejects(notes.history(), /locked/);
  assert.equal(await notes.unlock(fx.passphrase), null);
  assert.equal(notes.unlocked(), true);
});

test('nothing is sealed before an unlock or after a lock; an unlocked session seals to the keyring\'s current key', async () => {
  const { s, notes } = session();
  await assert.rejects(notes.send(note('too soon'), null), locked);
  assert.equal(s.notes.length, 0);
  assert.deepEqual(await notes.kept(), [], 'nothing waits in the outbox either');
  await notes.unlock(fx.passphrase);
  await notes.send(note('sealed'), null);
  assert.equal(headerFingerprint(s.notes[0]!.bytes), fx.fingerprint, 'the first keyring entry is the current key');
  notes.lock();
  await assert.rejects(notes.send(note('after the lock'), null), locked);
  assert.equal(s.notes.length, 1);
});

test('sent notes come back opened, newest first; a picked-up note says so', async () => {
  const { s, notes } = session();
  await notes.unlock(fx.passphrase);
  assert.deepEqual((await notes.send(note('first'), null)).kept, []);
  await notes.send(note('second'), null);
  s.notes[0]!.picked = 9;
  const items = await notes.history();
  assert.deepEqual(items.map(i => [i.opened?.body.text, i.state]), [['second', 'waiting'], ['first', 'picked-up']]);
  const before = s.state.downloads;
  await notes.history();
  assert.equal(s.state.downloads, before, 'an opened note is not downloaded again');
});

test('a damaged note and a failed download never stop the rest; an earlier key\'s note opens', async () => {
  const { s, notes } = session();
  await notes.unlock(fx.passphrase);
  await notes.send(note('fine'), null);
  await s.api.upload(new TextEncoder().encode('not a sealed note'));
  await s.api.upload(await seal(note('sealed before a rotation'), null, otherKey));
  await notes.send(note('download fails'), null);
  s.state.broken.add(s.notes[3]!.id);
  const items = await notes.history();
  assert.deepEqual(items.map(i => i.opened?.body.text ?? i.problem), [PROBLEMS.download, 'sealed before a rotation', PROBLEMS.format, 'fine']);
  s.state.broken.clear();
  assert.equal((await notes.history())[0]!.opened?.body.text, 'download fails', 'a failed download is tried again');
});

test('delete one, delete all, and lock forgets the keys', async () => {
  const { s, notes } = session();
  await notes.unlock(fx.passphrase);
  await notes.send(note('a'), null);
  await notes.send(note('b'), null);
  await notes.remove(s.notes[0]!.id);
  assert.deepEqual((await notes.history()).map(i => i.opened?.body.text), ['b']);
  assert.equal(await notes.removeAll(), 1);
  assert.deepEqual(await notes.history(), []);
  notes.lock();
  assert.equal(notes.unlocked(), false);
  await assert.rejects(notes.history(), /locked/);
});

test('a note that cannot be sealed here is a plain message, and nothing is stored', async t => {
  const s = server();
  const outbox = createOutbox(memoryOutbox(), s.api, () => 'k');
  const notes = createNotesSession({ api: s.api, vault: createVault(), outbox });
  await notes.unlock(fx.passphrase);
  // As on a page with no usable Web Crypto: sealing fails after the unlock.
  t.mock.method(crypto.subtle, 'generateKey', async () => { throw new Error('no AES-GCM here'); });
  await assert.rejects(notes.send(note('x'), null), (e: unknown) => e instanceof Error && e.message === SEND_MESSAGES.sealFailed);
  assert.deepEqual(await outbox.pending(), []);
  assert.equal(s.notes.length, 0);
});

test('a lock wins against an unlock still deriving its key', async () => {
  const { s, notes } = session();
  const pending = notes.unlock(fx.passphrase);
  notes.lock();
  assert.equal(await pending, null);
  assert.equal(notes.unlocked(), false);
  await assert.rejects(notes.send(note('x'), null), locked);
  assert.equal(s.notes.length, 0);
});

test('a lock wins against a history still downloading', async () => {
  const { s, notes } = session();
  await notes.unlock(fx.passphrase);
  await notes.send(note('a'), null);
  let release!: () => void;
  const gate = new Promise<void>(r => { release = r; });
  const bytes = s.api.bytes;
  s.api.bytes = async id => { await gate; return bytes(id); };
  const pending = notes.history();
  await new Promise(r => setTimeout(r, 10));
  notes.lock();
  release();
  assert.deepEqual((await pending).map(i => i.opened), [null]);
  await notes.unlock(fx.passphrase);
  s.api.bytes = bytes;
  assert.equal((await notes.history())[0]!.opened?.body.text, 'a', 'nothing opened after the lock was kept');
});

test('a signed-out download ends the history; unlock and hasKeyring report sign-out and a lost connection', async () => {
  const { s, notes } = session();
  await notes.unlock(fx.passphrase);
  await notes.send(note('a'), null);
  const bytes = s.api.bytes;
  s.api.bytes = async () => { throw new SignedOut('out'); };
  await assert.rejects(notes.history(), SignedOut);
  s.api.bytes = bytes;
  s.state.failKeyring = new SignedOut('out');
  assert.equal(await notes.unlock(fx.passphrase), UNLOCK_MESSAGES.signedOut);
  assert.equal(await notes.hasKeyring(), true);
  s.state.failKeyring = new TypeError('Failed to fetch');
  assert.equal(await notes.unlock(fx.passphrase), UNLOCK_MESSAGES.offline);
});

test('the session says while a note not sent yet is held only in memory', async () => {
  const outbox = createOutbox(memoryOutbox(), { upload: async () => { throw new TypeError('offline'); } }, () => 'k');
  const notes = createNotesSession({ api: server().api, vault: createVault(), outbox });
  await notes.unlock(fx.passphrase);
  assert.equal(notes.memoryOnly(), false);
  await notes.send(note('x'), null);
  assert.equal(notes.memoryOnly(), true);
  await notes.discard('k');
  assert.equal(notes.memoryOnly(), false);
});
