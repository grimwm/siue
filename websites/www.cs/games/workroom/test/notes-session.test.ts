// The notes session with the test keys: unlocking says what went wrong in plain
// words, nothing is sealed before an unlock and every note after it is sealed
// to the keyring's current key, sent notes come back opened, a damaged or
// missing note never stops the rest, an earlier key's note still opens,
// deletes forget what they removed.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { KeyExists, NetworkError, NoKeyring, ServerError, SignedOut, UnreadableAnswer, type PageApi } from '../src/api.ts';
import { DISCARD_FAILED, NO_CRYPTO, UNLOCK_FIRST, UNLOCK_MESSAGES, createNotesSession, describeFailure, failureReason } from '../src/notes-session.ts';
import { SEND_MESSAGES, createOutbox, memoryOutbox } from '../src/outbox.ts';
import { PROBLEMS, downloadProblem } from '../src/history.ts';
import { headerFingerprint, open, seal, siuen2Header } from '../src/seal.ts';
import { keyringWithAi, makeAiKey } from './ai-key.ts';
import { PASSPHRASE_MESSAGES } from '../src/keymaker.ts';
import { NoCrypto } from '../src/unlock.ts';
import type { LockedKeyring } from '../src/unlock.ts';
import { createVault } from '../src/vault.ts';
import type { NoteBody } from '../src/note.ts';
import { fx, otherKey } from './fixture-key.ts';

const note = (text: string, piece = 'test-piece'): NoteBody => ({ v: 1, kind: 'text', piece, draft: 1, from: 0, to: 1, fromBar: 1, toBar: 1, lane: null, text, reaction: null, curve: null, audio: null, made: '2026-10-20T00:00:00.000Z' });

function server() {
  const notes: { id: string; bytes: Uint8Array<ArrayBuffer>; arrived: number; picked: number | null }[] = [];
  let n = 0;
  const state = { failKeyring: null as unknown, keyring: fx.keyring as LockedKeyring, session: 'tag-1', broken: new Set<string>(), downloads: 0, unreadable: 0, uploaded: [] as string[], ai: [] as string[] };
  const api: PageApi = {
    upload: async b => { const id = (++n).toString(16).padStart(32, '0'); notes.push({ id, bytes: b, arrived: n, picked: null }); return { kind: 'sent', id }; },
    list: async () => ({ notes: notes.map(x => ({ id: x.id, size: x.bytes.length, arrived_at: x.arrived, picked_up_at: x.picked })), unreadable: state.unreadable }),
    bytes: async id => { state.downloads++; if (state.broken.has(id)) throw new ServerError(500); return notes.find(x => x.id === id)!.bytes; },
    remove: async id => { const i = notes.findIndex(x => x.id === id); if (i >= 0) notes.splice(i, 1); return i >= 0 ? 1 : 0; },
    removeAll: async () => { const k = notes.length; notes.length = 0; return k; },
    keyring: async () => { if (state.failKeyring) throw state.failKeyring; return { locked: state.keyring, session: state.session, ai: state.ai }; },
    uploadKeyring: async (locked, current) => { state.keyring = locked; state.failKeyring = null; state.uploaded.push(current); },
    changeKeyring: async locked => { state.keyring = locked; },
    deleteDraft: async () => 0,
    saveDraft: async () => ({ status: 201, data: {} }),
    checkPairing: async () => 'wrong_code',
    pairKeyring: async () => null,
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
  s.state.failKeyring = new NetworkError('Failed to fetch');
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

test('makeKey refuses a short passphrase, never replaces a key the server holds, otherwise uploads its key and unlocks it', async () => {
  const { s, notes } = session();
  assert.equal(await notes.makeKey('too short'), PASSPHRASE_MESSAGES.short);
  assert.equal(await notes.makeKey('a passphrase long enough'), UNLOCK_MESSAGES.keyExists);
  assert.deepEqual(s.state.uploaded, []);
  assert.equal(s.state.keyring, fx.keyring, 'the key the server holds stays');
  s.state.failKeyring = new NoKeyring('none');
  assert.equal(await notes.makeKey('a passphrase long enough'), null);
  assert.equal(s.state.uploaded.length, 1);
  assert.equal(notes.unlocked(), true, 'unlocked at once with the same passphrase');
  const sent = await notes.send(note('to the new key'), null);
  assert.equal(headerFingerprint(s.notes.find(n => n.id === sent.sent[0]!.id)!.bytes), s.state.uploaded[0]);
  assert.deepEqual((await notes.history()).map(i => i.opened?.body.text), ['to the new key']);
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
  assert.deepEqual(items.map(i => i.opened?.body.text ?? i.problem), [downloadProblem(failureReason(new ServerError(500))), 'sealed before a rotation', PROBLEMS.format, 'fine']);
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
  let reached!: () => void;
  const downloading = new Promise<void>(r => { reached = r; });
  const bytes = s.api.bytes;
  s.api.bytes = async id => { reached(); await gate; return bytes(id); };
  const pending = notes.history();
  await downloading;
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
  s.state.failKeyring = new NetworkError('Failed to fetch');
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

test('every failure is described as what it was', () => {
  assert.equal(describeFailure(new SignedOut('out')), UNLOCK_MESSAGES.signedOut);
  assert.equal(describeFailure(new NetworkError('Failed to fetch')), UNLOCK_MESSAGES.offline);
  assert.doesNotMatch(describeFailure(new TypeError('x is not a function')), /Could not reach/, 'a plain TypeError is a bug, not a lost connection');
  assert.match(describeFailure(new UnreadableAnswer()), /cannot read/);
  const server = describeFailure(new ServerError(503));
  assert.match(server, /503/);
  assert.doesNotMatch(server, /Could not reach/);
  assert.equal(describeFailure(new NoCrypto('none')), NO_CRYPTO);
  const other = describeFailure(new Error('note.php did not answer application/octet-stream.'));
  assert.doesNotMatch(other, /note\.php|Could not reach/, 'developer text stays out of the message');
  assert.match(other, /\.$/);
  assert.match(DISCARD_FAILED, /could not be discarded/);
});

test('unlock names a server error and a browser without Web Crypto, not a lost connection or a wrong passphrase', async () => {
  const { s, notes } = session();
  s.state.failKeyring = new ServerError(503);
  const server = await notes.unlock(fx.passphrase);
  assert.match(server!, /503/);
  assert.doesNotMatch(server!, /Could not reach/);
  s.state.failKeyring = null;
  const real = Object.getOwnPropertyDescriptor(globalThis, 'crypto')!;
  Object.defineProperty(globalThis, 'crypto', { value: {}, configurable: true });
  try {
    assert.equal(await notes.unlock(fx.passphrase), NO_CRYPTO);
  } finally {
    Object.defineProperty(globalThis, 'crypto', real);
  }
  assert.equal(await notes.unlock(fx.passphrase), null, 'with Web Crypto back it unlocks');
});

test('a failed download keeps its reason on the note', async () => {
  const { s, notes } = session();
  await notes.unlock(fx.passphrase);
  await notes.send(note('a'), null);
  s.state.broken.add(s.notes[0]!.id);
  const [item] = await notes.history();
  assert.equal(item!.problem, downloadProblem(failureReason(new ServerError(500))));
  assert.match(item!.problem!, /500/);
  assert.doesNotMatch(item!.problem!, /Reload/, 'every history() retries the download');
  assert.equal(item!.problem!.match(/\./g)!.length, 1, 'one sentence');
  assert.notEqual(item!.problem, downloadProblem(failureReason(new NetworkError('Failed to fetch'))));
});

test('notes the server listed but this page cannot read are counted', async () => {
  const { s, notes } = session();
  await notes.unlock(fx.passphrase);
  assert.equal(notes.unreadable(), 0);
  s.state.unreadable = 2;
  await notes.history();
  assert.equal(notes.unreadable(), 2);
  notes.lock();
  assert.equal(notes.unreadable(), 0);
});

test('a keyring the server refuses as already there is the key-exists message, and the key is the studio\'s', async () => {
  const { s, notes } = session();
  s.state.failKeyring = new NoKeyring('none');
  s.api.uploadKeyring = async () => { throw new KeyExists('there'); };
  assert.equal(await notes.makeKey('a passphrase long enough'), UNLOCK_MESSAGES.keyExists);
  assert.equal(notes.keyStored(), true, 'a retry unlocks, it does not make another key');
});

test('a key uploaded whose unlock then fails is stored: the panel must offer the unlock, not another make', async () => {
  const { s, notes } = session();
  s.state.failKeyring = new NoKeyring('none');
  assert.equal(notes.keyStored(), false);
  s.api.uploadKeyring = async (locked, current) => { s.state.keyring = locked; s.state.uploaded.push(current); s.state.failKeyring = new NetworkError('down'); };
  assert.equal(await notes.makeKey('a passphrase long enough'), UNLOCK_MESSAGES.offline);
  assert.equal(notes.unlocked(), false);
  assert.equal(notes.keyStored(), true);
});

test('a key that failed to upload is not stored', async () => {
  const { s, notes } = session();
  s.state.failKeyring = new NoKeyring('none');
  s.api.uploadKeyring = async () => { throw new ServerError(500); };
  assert.match((await notes.makeKey('a passphrase long enough'))!, /500/);
  assert.equal(notes.keyStored(), false);
});

test('a lock during makeKey leaves the key stored and says so, not silence', async () => {
  const { s, notes } = session();
  s.state.failKeyring = new NoKeyring('none');
  let uploaded = false;
  const upload = s.api.uploadKeyring;
  const keyring = s.api.keyring;
  s.api.uploadKeyring = async (l, c) => { await upload(l, c); uploaded = true; };
  s.api.keyring = async () => { const k = await keyring(); if (uploaded) notes.lock(); return k; };
  assert.equal(await notes.makeKey('a passphrase long enough'), UNLOCK_MESSAGES.lockedAgain);
  assert.equal(notes.unlocked(), false);
  assert.equal(notes.keyStored(), true);
});

test('the damaged-key message sends everyone, the owner included, to a reload and Forgot your passphrase?, with no command-line step', () => {
  assert.match(UNLOCK_MESSAGES.invalid, /Reload the page/);
  assert.match(UNLOCK_MESSAGES.invalid, /Forgot your passphrase\? on Your studio/);
  for (const words of Object.values(UNLOCK_MESSAGES)) assert.doesNotMatch(words, /make music|terminal|checkout|repositor|1Password|\bop\b/i, 'no command-line step on the page');
});

// Sealing to a paired AI: only an AI key the unlocked keyring holds AND the server lists as active; the list is asked
// again before each note, so a key revoked since the unlock is dropped.
test('a note is sealed to the person and every active paired AI key, and a revoked one is dropped', async () => {
  const ai = await makeAiKey(5);
  const { s, notes } = session();
  s.state.keyring = await keyringWithAi([ai]);
  assert.equal(await notes.unlock(fx.passphrase), null);
  const sendOne = async (text: string): Promise<Uint8Array<ArrayBuffer>> => {
    const sent = await notes.send(note(text), null);
    return s.notes.find(n => n.id === sent.sent[0]!.id)!.bytes;
  };
  assert.equal(new TextDecoder().decode((await sendOne('before the server lists it')).slice(0, 6)), 'SIUEN1', 'paired in the keyring but not active: the person only');
  s.state.ai = [ai.fingerprint];
  const both = await sendOne('to both');
  assert.deepEqual(siuen2Header(both)!.wraps.map(w => w.fingerprint), [fx.fingerprint, ai.fingerprint]);
  assert.equal((await open(both, new Map([[ai.fingerprint, ai.priv]]))).body.text, 'to both', 'the AI opens it with its own key');
  s.state.ai = [];
  assert.equal(new TextDecoder().decode((await sendOne('after revoking')).slice(0, 6)), 'SIUEN1');
  s.state.ai = [ai.fingerprint, 'f'.repeat(64)];
  assert.equal(siuen2Header(await sendOne('a key the server lists but the keyring lacks'))!.wraps.length, 2, 'the server cannot add a recipient');
});
