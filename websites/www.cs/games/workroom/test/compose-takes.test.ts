// Vocal takes on this device: a take and its chunks survive a reload, come back in order, are listed per piece, and are
// forgotten on remove; where IndexedDB refuses, takes are kept in memory and the store says so.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';
import { indexedDbTakes, joinChunks, memoryTakes, newTakeId } from '../src/compose/takes.ts';
import type { LocalTake } from '../src/compose/takes.ts';

Object.defineProperty(globalThis, 'IDBKeyRange', { value: IDBKeyRange, configurable: true });
const take = (id: string, piece = 'song'): LocalTake => ({ id, piece, name: 'Take 1', made: '2026-11-01T00:00:00Z', rate: 48000, samples: 0 });

test('a take recorded in chunks is there after a reload, in order, and listed for its piece only', async () => {
  const factory = new IDBFactory() as unknown as globalThis.IDBFactory;
  const s = indexedDbTakes(factory);
  await s.begin(take('local-a'));
  await s.append('local-a', 1, Int16Array.of(4, 5));
  await s.append('local-a', 0, Int16Array.of(1, 2, 3));
  await s.begin(take('local-b', 'other'));
  await s.update({ ...take('local-a'), samples: 5 });
  const again = indexedDbTakes(factory);
  assert.deepEqual((await again.list('song')).map(t => [t.id, t.samples]), [['local-a', 5]]);
  assert.deepEqual([...(await again.pcm('local-a'))!], [1, 2, 3, 4, 5]);
  assert.equal(again.memoryOnly(), false);
  await again.remove('local-a');
  assert.deepEqual(await indexedDbTakes(factory).list('song'), []);
  assert.equal(await indexedDbTakes(factory).pcm('local-a'), null);
});

test('a saved take keeps its studio name', async () => {
  const factory = new IDBFactory() as unknown as globalThis.IDBFactory;
  const s = indexedDbTakes(factory);
  await s.begin(take('local-a'));
  await s.update({ ...take('local-a'), saved: `vocal-${'e'.repeat(64)}.flac` });
  assert.equal((await indexedDbTakes(factory).list('song'))[0]!.saved, `vocal-${'e'.repeat(64)}.flac`);
});

test('without IndexedDB, takes live in memory and the store says so', async () => {
  const s = indexedDbTakes(null);
  await s.begin(take('local-a'));
  await s.append('local-a', 0, Int16Array.of(7));
  assert.equal(s.memoryOnly(), true);
  assert.deepEqual([...(await s.pcm('local-a'))!], [7]);
  const broken = { open: () => { throw new Error('refused'); } } as unknown as globalThis.IDBFactory;
  const t = indexedDbTakes(broken);
  await t.begin(take('local-c'));
  assert.equal(t.memoryOnly(), true);
  assert.equal((await t.list('song')).length, 1);
  assert.equal(memoryTakes().memoryOnly(), true);
});

test('chunks join in order, skipping a missing one; ids are local-<uuid>', () => {
  assert.deepEqual([...joinChunks([Int16Array.of(1), undefined, Int16Array.of(2, 3)])], [1, 2, 3]);
  assert.equal(newTakeId(() => '0f8fad5b-d9cb-469f-a165-70867728950e'), 'local-0f8fad5b-d9cb-469f-a165-70867728950e');
});
