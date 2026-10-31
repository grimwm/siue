// The outbox: a note is stored before it is sent, so nothing is lost; offline,
// over the limits, signed out or refused, it stays with a reason; online again,
// it goes, in the order the notes were made; only Discard drops one.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { KEPT_MESSAGES, createOutbox, keptMessage, memoryOutbox } from '../src/outbox.ts';
import type { KeptReason, OutboxLock, OutboxStore } from '../src/outbox.ts';
import { SignedOut, type UploadResult } from '../src/api.ts';
import { MAX_NOTE_BYTES } from '../src/note.ts';

const keys = () => { let k = 0; return () => `k${++k}`; };
const one = (b: number) => new Uint8Array([b]);
const SENT = (id = 'f'.repeat(32)): UploadResult => ({ kind: 'sent', id });

test('a note is in the store while it is sent, and leaves it once sent', async () => {
  const store = memoryOutbox();
  const seen: number[] = [];
  const box = createOutbox(store, { upload: async () => { seen.push((await store.all()).length); return SENT(); } }, keys());
  const r = await box.add(one(1), '2026-10-20T00:00:00.000Z');
  assert.deepEqual(seen, [1]);
  assert.deepEqual(r, { key: 'k1', memoryOnly: true, sent: [{ key: 'k1', id: 'f'.repeat(32) }], kept: [] });
  assert.deepEqual(await store.all(), []);
});

test('offline keeps every note and stops trying after the first failure', async () => {
  const store = memoryOutbox();
  let calls = 0;
  const box = createOutbox(store, { upload: async () => { calls++; throw new TypeError('Failed to fetch'); } }, keys());
  await box.add(one(1), '2026-10-20T00:00:01.000Z');
  const r = await box.add(one(2), '2026-10-20T00:00:02.000Z');
  assert.deepEqual(r.kept, [{ key: 'k1', reason: 'offline' }, { key: 'k2', reason: 'offline' }]);
  assert.equal(calls, 2, 'one try per flush: the second flush stopped at the first note');
  assert.deepEqual((await store.all()).map(p => p.reason), ['offline', 'offline']);
  assert.match(KEPT_MESSAGES.offline, /kept on this device/);
});

test('refusals, a lost session and a server error keep the note with their reason', async () => {
  const cases: [() => Promise<UploadResult>, string][] = [
    [async () => ({ kind: 'refused', reason: 'too_large' }), 'too_large'],
    [async () => ({ kind: 'refused', reason: 'full' }), 'full'],
    [async () => ({ kind: 'refused', reason: 'unknown_key' }), 'unknown_key'],
    [async () => { throw new SignedOut('x'); }, 'signed_out'],
    [async () => { throw new Error('The server answered 500.'); }, 'server'],
  ];
  for (const [upload, reason] of cases) {
    const store = memoryOutbox();
    const r = await createOutbox(store, { upload }, keys()).add(one(1), 'a');
    assert.deepEqual(r.kept.map(x => x.reason), [reason]);
    assert.equal((await store.all())[0]?.reason, reason);
    assert.ok(keptMessage(reason as KeptReason, 0).length > 0);
  }
});

test('a note over 2 MB is never sent and does not hold up the next one', async () => {
  const store = memoryOutbox();
  const sizes: number[] = [];
  const box = createOutbox(store, { upload: async b => { sizes.push(b.length); return SENT(); } }, keys());
  const big = await box.add(new Uint8Array(MAX_NOTE_BYTES + 1), '2026-10-20T00:00:01.000Z');
  assert.deepEqual(big.kept, [{ key: 'k1', reason: 'too_large' }]);
  const small = await box.add(one(2), '2026-10-20T00:00:02.000Z');
  assert.deepEqual([small.sent.map(s => s.key), small.kept], [['k2'], [{ key: 'k1', reason: 'too_large' }]]);
  assert.deepEqual(sizes, [1]);
  assert.match(keptMessage('too_large'), /2 MB/);
});

test('back online, kept notes go in the order they were made', async () => {
  const store = memoryOutbox();
  let online = false;
  const sent: number[] = [];
  const box = createOutbox(store, { upload: async b => { if (!online) throw new TypeError('offline'); sent.push(b[0]!); return SENT(); } }, keys());
  await box.add(one(2), '2026-10-20T00:00:02.000Z');
  await box.add(one(1), '2026-10-20T00:00:01.000Z');
  online = true;
  const r = await box.flush();
  assert.deepEqual([sent, r.sent.length, (await store.all()).length], [[1, 2], 2, 0]);
});

test('two sends at once never send a note twice', async () => {
  const store = memoryOutbox();
  const uploaded: number[] = [];
  const box = createOutbox(store, { upload: async b => { await new Promise(r => setTimeout(r, 5)); uploaded.push(b[0]!); return SENT(); } }, keys());
  await Promise.all([box.add(one(1), 'a'), box.add(one(2), 'b'), box.flush()]);
  assert.deepEqual(uploaded, [1, 2]);
});

test('the 2,000-note limit is named from the limit itself', () => {
  assert.match(KEPT_MESSAGES.full, /holds 2,000 notes/);
});

test('with a lock, two tabs on one store upload each kept note once; without it they can upload it twice', async () => {
  const mutex = (): OutboxLock => { let tail: Promise<unknown> = Promise.resolve(); return work => { const next = tail.then(work, work); tail = next.catch(() => undefined); return next; }; };
  const run = async (lock: OutboxLock | null): Promise<number[]> => {
    const store = memoryOutbox();
    const uploaded: number[] = [];
    let online = false;
    const api = { upload: async (b: Uint8Array<ArrayBuffer>): Promise<UploadResult> => { if (!online) throw new TypeError('offline'); await new Promise(r => setTimeout(r, 5)); uploaded.push(b[0]!); return SENT(); } };
    const tabA = createOutbox(store, api, keys(), lock);
    const tabB = createOutbox(store, api, () => 'other', lock);
    await tabA.add(one(1), '2026-10-20T00:00:01.000Z');
    await tabA.add(one(2), '2026-10-20T00:00:02.000Z');
    online = true;
    await Promise.all([tabA.flush(), tabB.flush()]);
    return uploaded;
  };
  assert.deepEqual(await run(mutex()), [1, 2], 'each note once, in order');
  assert.ok((await run(null)).length > 2, 'the control: without the lock the same notes go twice');
});

test('Discard drops an unsent note; pending lists the rest in order', async () => {
  const store = memoryOutbox();
  const box = createOutbox(store, { upload: async () => { throw new TypeError('offline'); } }, keys());
  await box.add(one(1), '2026-10-20T00:00:02.000Z');
  await box.add(one(2), '2026-10-20T00:00:01.000Z');
  assert.deepEqual((await box.pending()).map(p => p.key), ['k2', 'k1']);
  await box.discard('k1');
  assert.deepEqual((await box.pending()).map(p => p.key), ['k2']);
});

test('only idb.ts names IndexedDB, and it keeps nothing but the pending record', () => {
  const outbox = readFileSync(new URL('../src/outbox.ts', import.meta.url), 'utf8');
  assert.doesNotMatch(outbox, /indexedDB|localStorage|sessionStorage|document\.cookie|\bcaches\b/);
  const idb = readFileSync(new URL('../src/idb.ts', import.meta.url), 'utf8');
  assert.match(idb, /'siue-music'/);
  assert.match(idb, /'outbox'/);
  assert.doesNotMatch(idb, /localStorage|sessionStorage|document\.cookie|\bcaches\b|passphrase|keyring|CryptoKey/);
});

/** A memory store whose reads or removes can be made to fail, as a dropped IndexedDB connection does. */
function flaky() {
  const inner = memoryOutbox();
  const fail = { all: false, remove: false };
  const store: OutboxStore = {
    all: () => (fail.all ? Promise.reject(new DOMException('The connection is closing.', 'InvalidStateError')) : inner.all()),
    put: p => inner.put(p),
    remove: key => (fail.remove ? Promise.reject(new DOMException('The connection is closing.', 'InvalidStateError')) : inner.remove(key)),
    memoryOnly: () => inner.memoryOnly(),
  };
  return { store, inner, fail };
}

test('a stored note whose flush cannot read the store is reported kept, not thrown: the words can be cleared', async () => {
  const { store, inner, fail } = flaky();
  fail.all = true;
  const r = await createOutbox(store, { upload: async () => SENT() }, keys()).add(one(1), 'a');
  assert.deepEqual(r, { key: 'k1', memoryOnly: true, sent: [], kept: [{ key: 'k1', reason: 'server' }] });
  assert.equal((await inner.all()).length, 1, 'the note is in the store');
});

test('a note uploaded but not removed from the store counts as sent, and is never uploaded again', async () => {
  const { store, fail } = flaky();
  let uploads = 0;
  const box = createOutbox(store, { upload: async () => { uploads++; return SENT(); } }, keys());
  fail.remove = true;
  const r = await box.add(one(1), 'a');
  assert.deepEqual([r.sent.map(s => s.key), r.kept], [['k1'], []]);
  assert.deepEqual(await box.pending(), [], 'not listed as waiting to be sent');
  await box.flush();
  assert.equal(uploads, 1, 'the next flush does not send it twice');
  fail.remove = false;
  await box.flush();
  assert.deepEqual(await store.all(), [], 'removed once the store works again');
  assert.equal(uploads, 1);
});

test('the outbox says while a note is held only in memory', async () => {
  const store = memoryOutbox();
  const box = createOutbox(store, { upload: async () => { throw new TypeError('offline'); } }, keys());
  assert.equal(box.memoryOnly(), false);
  await box.add(one(1), 'a');
  assert.equal(box.memoryOnly(), true);
  await box.discard('k1');
  assert.equal(box.memoryOnly(), false);
});

test("a note over the studio's note max stays on the device as too_large", async () => {
  const store = memoryOutbox();
  const sizes: number[] = [];
  const box = createOutbox(store, { upload: async b => { sizes.push(b.length); return SENT(); } }, keys(), null, 1_048_576);
  const r = await box.add(new Uint8Array(1_048_577), '2026-10-20T00:00:01.000Z');
  assert.deepEqual(r.kept, [{ key: 'k1', reason: 'too_large' }]);
  assert.deepEqual(sizes, [], 'never sent');
  assert.equal((await store.all()).length, 1);
  const fits = await box.add(new Uint8Array(1_048_576), '2026-10-20T00:00:02.000Z');
  assert.deepEqual(fits.sent.map(x => x.key), ['k2']);
});

test('over_quota keeps the note and names the room', async () => {
  const store = memoryOutbox();
  const box = createOutbox(store, { upload: async () => ({ kind: 'refused', reason: 'over_quota', room: 1_258_291 }) as UploadResult }, keys());
  const r = await box.add(one(1), 'a');
  assert.deepEqual(r.kept, [{ key: 'k1', reason: 'over_quota', room: 1_258_291 }]);
  assert.deepEqual((await store.all()).map(p => [p.reason, p.room]), [['over_quota', 1_258_291]]);
  assert.equal(KEPT_MESSAGES.over_quota(1_258_291), 'There is no room for this note: 1.2 MB left. Delete drafts or picked-up notes to make room; this note stays on this device until then.');
  assert.equal(keptMessage('over_quota', 5_242_880), KEPT_MESSAGES.over_quota(5_242_880));
  assert.equal(keptMessage('over_quota', undefined), KEPT_MESSAGES.over_quota(0), 'a note kept before the room was known still says it is full');
});

test('too_large names the note limit it was given, and the page limit by default', () => {
  assert.equal(KEPT_MESSAGES.too_large(1_048_576), 'This note is over 1 MB, so it stays on this device. Record a shorter one, then discard this one.');
  assert.match(KEPT_MESSAGES.too_large(2_097_152), /over 2 MB/);
  assert.equal(keptMessage('too_large'), KEPT_MESSAGES.too_large(MAX_NOTE_BYTES), 'with no page limits, the default note max');
  for (const words of Object.values(KEPT_MESSAGES)) if (typeof words === 'string') assert.doesNotMatch(words, /\d MB/, 'no fixed size in the table');
});

test('the unknown-key message points studio people to Forgot your passphrase, named people to make music-status', () => {
  assert.match(keptMessage('unknown_key', undefined, true), /make music-status/);
  assert.doesNotMatch(keptMessage('unknown_key', undefined, false), /make music/);
  assert.match(keptMessage('unknown_key', undefined, false), /Forgot your passphrase on Your studio/);
  assert.equal(keptMessage('offline', undefined, false), KEPT_MESSAGES.offline);
});
