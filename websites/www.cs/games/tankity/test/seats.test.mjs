// The seats this browser holds (src/seats.ts): remembered across tabs in
// localStorage, newest first, at most SEATS_MAX; storage that is missing,
// malformed or refuses writes never throws.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSeatStore, SEATS_KEY, SEATS_MAX } from '../src/seats.ts';

function mapStorage(init = {}) {
  const m = new Map(Object.entries(init));
  return {
    m,
    getItem: k => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => { m.set(k, String(v)); },
    removeItem: k => { m.delete(k); },
  };
}
const seat = (code, extra = {}) => ({ code, seat: 1, token: 'tok-' + code, csrf: 'csrf-' + code, initials: 'ABC', ...extra });

test('a remembered seat round-trips, survives a reload, and a second remember moves it first', () => {
  let t = 1000;
  const storage = mapStorage();
  const store = createSeatStore(storage, () => t);
  store.remember(seat('AAAA'));
  assert.deepEqual(store.get('AAAA'), { ...seat('AAAA'), at: 1000 });
  assert.equal(JSON.parse(storage.m.get(SEATS_KEY)).v, 1);
  // A second store over the same storage (another tab, a reload) reads it.
  assert.equal(createSeatStore(storage, () => t).get('AAAA')?.token, 'tok-AAAA');

  t = 2000;
  store.remember(seat('BBBB'));
  t = 3000;
  store.remember(seat('AAAA', { token: 'tok2' }));
  assert.deepEqual(store.list().map(s => s.code), ['AAAA', 'BBBB']);
  assert.equal(store.get('AAAA').token, 'tok2');
  assert.equal(store.get('AAAA').at, 3000);

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
  const wrong = createSeatStore(mapStorage({ [SEATS_KEY]: JSON.stringify({ v: 1, seats: [{ code: 'lower', seat: 0 }] }) }), () => 0);
  assert.deepEqual(wrong.list(), []);
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
