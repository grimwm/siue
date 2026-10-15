// The seats this browser holds (src/seats.ts): remembered across tabs in
// localStorage, newest first, at most SEATS_MAX; storage that is missing,
// malformed or refuses writes never throws.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSeatStore, SEATS_KEY, SEATS_MAX } from '../src/seats.ts';
import type { StoredSeat } from '../src/seats.ts';

function must<T>(v: T | null | undefined, what: string): T {
  assert.ok(v !== null && v !== undefined, `${what} is missing`);
  return v;
}

function mapStorage(init: Record<string, string> = {}) {
  const m = new Map(Object.entries(init));
  return {
    m,
    getItem: (k: string) => (m.has(k) ? m.get(k) ?? null : null),
    setItem: (k: string, v: string) => { m.set(k, String(v)); },
    removeItem: (k: string) => { m.delete(k); },
  };
}
const seat = (code: string, extra: Partial<StoredSeat> = {}) => ({ code, seat: 1, token: 'tok-' + code, csrf: 'csrf-' + code, initials: 'ABC', ...extra });

test('a remembered seat round-trips, survives a reload, and a second remember moves it first', () => {
  let t = 1000;
  const storage = mapStorage();
  const store = createSeatStore(storage, () => t);
  store.remember(seat('AAAA'));
  assert.deepEqual(store.get('AAAA'), { ...seat('AAAA'), at: 1000 });
  assert.equal(JSON.parse(must(storage.m.get(SEATS_KEY), 'the saved seats')).v, 1);
  // A second store over the same storage (another tab, a reload) reads it.
  assert.equal(createSeatStore(storage, () => t).get('AAAA')?.token, 'tok-AAAA');

  t = 2000;
  store.remember(seat('BBBB'));
  t = 3000;
  store.remember(seat('AAAA', { token: 'tok2' }));
  assert.deepEqual(store.list().map(s => s.code), ['AAAA', 'BBBB']);
  assert.equal(must(store.get('AAAA'), 'seat AAAA').token, 'tok2');
  assert.equal(must(store.get('AAAA'), 'seat AAAA').at, 3000);

  store.forget('AAAA');
  assert.equal(store.get('AAAA'), null);
  assert.equal(store.list().length, 1);
  assert.equal(store.get('ZZZZ'), null);
});

test('the thirteenth seat drops the oldest', () => {
  const store = createSeatStore(mapStorage(), () => 0);
  for (let i = 0; i < SEATS_MAX + 1; i++) store.remember(seat('S' + String(i).padStart(3, '0')));
  const codes = store.list().map(s => s.code);
  assert.equal(SEATS_MAX, 12);
  assert.equal(codes.length, 12);
  assert.equal(codes[0], 'S012');
  assert.ok(!codes.includes('S000'));
});

test('malformed or wrongly shaped storage reads as empty and never throws', () => {
  const bad = createSeatStore(mapStorage({ [SEATS_KEY]: '{not json' }), () => 0);
  assert.deepEqual(bad.list(), []);
  assert.equal(bad.get('AAAA'), null);
  const wrong = createSeatStore(mapStorage({ [SEATS_KEY]: JSON.stringify({ v: 2, seats: [] }) }), () => 0);
  assert.deepEqual(wrong.list(), []);
});

test('one bad entry is dropped, never the whole list', () => {
  const good = { ...seat('GOOD'), at: 1 };
  const storage = mapStorage({ [SEATS_KEY]: JSON.stringify({ v: 1, seats: [{ code: 'lower', seat: 0 }, good, 'junk'] }) });
  const store = createSeatStore(storage, () => 2);
  assert.deepEqual(store.list(), [good]);
  store.remember(seat('NEWW'));
  assert.deepEqual(store.list().map(s => s.code), ['NEWW', 'GOOD']);
});

test('storage that refuses writes, or none at all, keeps the seat for the session', () => {
  const refusing = { getItem: () => null, setItem: () => { throw new Error('quota'); }, removeItem: () => {} };
  const store = createSeatStore(refusing, () => 5);
  store.remember(seat('CCCC'));
  assert.equal(store.get('CCCC')?.token, 'tok-CCCC');
  const none = createSeatStore(null, () => 5);
  none.remember(seat('DDDD'));
  assert.equal(none.get('DDDD')?.seat, 1);
});

test('subscribers hear remember and forget until they unsubscribe', () => {
  const store = createSeatStore(mapStorage(), () => 0);
  let heard = 0;
  const off = store.subscribe(() => { heard++; });
  store.remember(seat('EEEE'));
  store.forget('EEEE');
  off();
  store.remember(seat('FFFF'));
  assert.equal(heard, 2);
});

test('a seat closed to make space is kept, marked closed, and a reload reads the mark', () => {
  const storage = mapStorage();
  const store = createSeatStore(storage, () => 5);
  store.remember(seat('ABCD'));
  store.remember(seat('EFGH'));
  store.markClosed('ABCD');
  assert.equal(must(store.get('ABCD'), 'seat ABCD').closed, 'space');
  assert.equal(store.get('EFGH')?.closed, undefined);
  assert.deepEqual(store.list().map(s => s.code), ['EFGH', 'ABCD'], 'marking does not reorder');
  assert.equal(createSeatStore(storage, () => 5).get('ABCD')?.closed, 'space');
  store.markClosed('ZZZZ');
  assert.equal(store.get('ZZZZ'), null, 'marking an unknown code adds nothing');
  store.forget('ABCD');
  assert.equal(store.get('ABCD'), null);
});

test('six-character codes are kept, four-character ones still read, other lengths are dropped', () => {
  const six = { ...seat('K7Q2MX'), at: 1 };
  const four = { ...seat('AB3D'), at: 1 };
  const storage = mapStorage({ [SEATS_KEY]: JSON.stringify({ v: 1, seats: [six, four, { ...seat('K7Q2M'), at: 1 }, { ...seat('K7Q2MXY'), at: 1 }] }) });
  assert.deepEqual(createSeatStore(storage, () => 2).list().map(s => s.code), ['K7Q2MX', 'AB3D']);
});
