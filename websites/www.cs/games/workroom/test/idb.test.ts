// The outbox in IndexedDB, against a fake IndexedDB (fake-indexeddb, a test-only
// dependency): notes survive a reload, nothing but the pending record is
// stored, and where IndexedDB is missing, refuses to open, or refuses a note,
// the note is kept in memory and the outbox says so.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { IDBFactory, IDBObjectStore } from 'fake-indexeddb';
import { OUTBOX_DB, OUTBOX_STORE, indexedDbOutbox } from '../src/idb.ts';
import type { Pending } from '../src/outbox.ts';

const pending = (key: string, bytes: number[], reason: Pending['reason'] = 'new'): Pending => ({ key, bundle: new Uint8Array(bytes), made: `2026-10-20T00:00:0${key.length}.000Z`, reason });
const bytesOf = (all: Pending[]): [string, number[], string][] => all.map((p): [string, number[], string] => [p.key, [...p.bundle], p.reason]).sort();

test('a stored note is there after a reload, with its reason; remove forgets it', async () => {
  const factory = new IDBFactory();
  const first = indexedDbOutbox(factory as unknown as globalThis.IDBFactory);
  await first.put(pending('a', [1, 2, 3]));
  await first.put(pending('bb', [4]));
  await first.put({ ...pending('a', [1, 2, 3]), reason: 'offline' });
  assert.equal(first.memoryOnly(), false);
  const reloaded = indexedDbOutbox(factory as unknown as globalThis.IDBFactory);
  assert.deepEqual(bytesOf(await reloaded.all()), [['a', [1, 2, 3], 'offline'], ['bb', [4], 'new']]);
  assert.ok((await reloaded.all()).every(p => p.bundle instanceof Uint8Array));
  await reloaded.remove('a');
  assert.deepEqual(bytesOf(await indexedDbOutbox(factory as unknown as globalThis.IDBFactory).all()), [['bb', [4], 'new']]);
});

test('the database holds one store of records with exactly key, bundle, made and reason', async () => {
  const factory = new IDBFactory();
  await indexedDbOutbox(factory as unknown as globalThis.IDBFactory).put(pending('a', [9]));
  assert.deepEqual((await factory.databases()).map(d => d.name), [OUTBOX_DB]);
  const db = await new Promise<IDBDatabase>((resolve, reject) => { const r = factory.open(OUTBOX_DB); r.onsuccess = () => resolve(r.result as unknown as IDBDatabase); r.onerror = () => reject(r.error); });
  assert.deepEqual([...db.objectStoreNames], [OUTBOX_STORE]);
  const rows = await new Promise<unknown[]>((resolve, reject) => { const q = db.transaction(OUTBOX_STORE).objectStore(OUTBOX_STORE).getAll(); q.onsuccess = () => resolve(q.result); q.onerror = () => reject(q.error); });
  db.close();
  assert.equal(rows.length, 1);
  assert.deepEqual(Object.keys(rows[0] as object).sort(), ['bundle', 'key', 'made', 'reason']);
});

test('no IndexedDB: notes are kept in memory, and the outbox says so', async () => {
  const box = indexedDbOutbox(null);
  assert.equal(box.memoryOnly(), true);
  await box.put(pending('a', [1]));
  assert.deepEqual(bytesOf(await box.all()), [['a', [1], 'new']]);
  await box.remove('a');
  assert.deepEqual(await box.all(), []);
});

test('IndexedDB that refuses to open: notes are kept in memory', async () => {
  const refusing = { open() { throw new Error('SecurityError'); } } as unknown as globalThis.IDBFactory;
  const box = indexedDbOutbox(refusing);
  await box.put(pending('a', [7]));
  assert.equal(box.memoryOnly(), true);
  assert.deepEqual(bytesOf(await box.all()), [['a', [7], 'new']]);
});

test('IndexedDB that refuses to store a note: that note is kept in memory, the stored ones stay, and the outbox says so', async () => {
  const factory = new IDBFactory();
  const box = indexedDbOutbox(factory as unknown as globalThis.IDBFactory);
  await box.put(pending('a', [1]));
  assert.equal(box.memoryOnly(), false);
  const put = IDBObjectStore.prototype.put;
  IDBObjectStore.prototype.put = function refuse() { throw new DOMException('The disk is full.', 'QuotaExceededError'); };
  try {
    await box.put(pending('bb', [2]));
  } finally {
    IDBObjectStore.prototype.put = put;
  }
  assert.equal(box.memoryOnly(), true);
  assert.deepEqual(bytesOf(await box.all()), [['a', [1], 'new'], ['bb', [2], 'new']]);
  await box.remove('bb');
  assert.deepEqual(bytesOf(await box.all()), [['a', [1], 'new']]);
});
