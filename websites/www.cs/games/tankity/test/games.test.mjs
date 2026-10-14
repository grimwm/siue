// The Your games watcher (src/games.ts) with fake timers, a scripted `mine`
// and a seat store over a Map: what it asks, what it forgets, and that each
// turn is reported once and never for the room on screen.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createGamesWatch, GAMES_POLL_MS, roomOnScreen } from '../src/games.ts';
import { createSeatStore } from '../src/seats.ts';

function mapStorage() {
  const m = new Map();
  return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => { m.set(k, String(v)); }, removeItem: k => { m.delete(k); } };
}
const row = (code, over = {}) => ({
  code, gone: false, seat: 1, phase: 'play', round: 2, turnSecs: 600, turn: 0, yourTurn: false, turnKey: null,
  turnLeft: null, shopLeft: null, players: ['ABC', 'ZED'], hostSeat: 0, turnName: 'ABC', expiresAt: 2e9, closesIn: 600, ...over,
});
const flush = async () => { for (let i = 0; i < 10; i++) await new Promise(r => setImmediate(r)); };

function rig({ codes = [], reply = asks => asks.map(a => row(a.code)) } = {}) {
  const store = createSeatStore(mapStorage(), () => 0);
  for (const c of [...codes].reverse()) store.remember({ code: c, seat: 1, token: 't' + c, csrf: 'c', initials: 'ZED' });
  const r = {
    store, asks: [], rows: [], turns: [], intervals: new Map(), nextId: 1, here: '', reply, pending: null,
  };
  r.watch = createGamesWatch({
    store,
    mine: asks => {
      r.asks.push(asks.map(a => a.code));
      if (r.pending) return r.pending;
      const out = r.reply(asks);
      return out instanceof Error ? Promise.reject(out) : Promise.resolve(out);
    },
    setInterval: (fn, ms) => { const id = r.nextId++; r.intervals.set(id, { fn, ms }); return id; },
    clearInterval: id => { r.intervals.delete(id); },
    viewing: () => r.here,
    onRows: rows => r.rows.push(rows.map(x => x.code)),
    onTurn: x => r.turns.push(x.code + '#' + x.turnKey),
  });
  r.tick = () => { for (const { fn } of r.intervals.values()) fn(); };
  return r;
}

test('with no stored seats it asks nothing and lists nothing', async () => {
  const r = rig();
  r.watch.start();
  await flush();
  assert.deepEqual(r.asks, []);
  assert.deepEqual(r.rows, [[]]);
});

test('the room on screen is never asked about', async () => {
  const r = rig({ codes: ['AAAA', 'BBBB'] });
  r.here = 'AAAA';
  r.watch.start();
  await flush();
  assert.deepEqual(r.asks, [['BBBB']]);
  assert.deepEqual(r.rows, [['BBBB']]);
});

test('a gone room is forgotten and left out of the list', async () => {
  const r = rig({ codes: ['AAAA', 'BBBB'], reply: asks => asks.map(a => (a.code === 'BBBB' ? { code: 'BBBB', gone: true } : row(a.code))) });
  r.watch.start();
  await flush();
  assert.equal(r.store.get('BBBB'), null);
  assert.ok(r.store.get('AAAA'));
  assert.deepEqual(r.rows, [['AAAA']]);
});

test('each turn is reported once, by its key', async () => {
  let key = '1:0:3';
  const r = rig({ codes: ['AAAA'], reply: asks => asks.map(a => row(a.code, { yourTurn: true, turnKey: key, turn: 1 })) });
  r.watch.start();
  await flush();
  r.tick();
  await flush();
  assert.deepEqual(r.turns, ['AAAA#1:0:3']);
  key = '1:0:5';
  r.tick();
  await flush();
  assert.deepEqual(r.turns, ['AAAA#1:0:3', 'AAAA#1:0:5']);
});

test('a row for the room that came on screen meanwhile never raises a turn', async () => {
  const r = rig({ codes: ['AAAA'] });
  let release;
  r.pending = new Promise(res => { release = res; });
  r.watch.start();
  await flush();
  r.here = 'AAAA'; // the player opened it while the answer was out
  release([row('AAAA', { yourTurn: true, turnKey: '1:1:0', turn: 1 })]);
  await flush();
  assert.deepEqual(r.turns, []);
});

test('a failed ask throws nothing, lists nothing, and the next tick asks again', async () => {
  let fail = true;
  const r = rig({ codes: ['AAAA'], reply: asks => (fail ? new Error('offline') : asks.map(a => row(a.code))) });
  r.watch.start();
  await flush();
  assert.deepEqual(r.rows, []);
  fail = false;
  r.tick();
  await flush();
  assert.equal(r.asks.length, 2);
  assert.deepEqual(r.rows, [['AAAA']]);
});

test('it polls every 10 s, pollNow asks at once without doubling up, and stop clears the timer', async () => {
  const r = rig({ codes: ['AAAA'] });
  r.watch.start();
  assert.equal(GAMES_POLL_MS, 10_000);
  assert.equal([...r.intervals.values()][0].ms, GAMES_POLL_MS);
  await flush();
  let release;
  r.pending = new Promise(res => { release = res; });
  void r.watch.pollNow();
  void r.watch.pollNow();
  r.tick();
  assert.equal(r.asks.length, 2, 'one ask in flight at a time');
  release([row('AAAA')]);
  await flush();
  r.pending = null;
  r.watch.start(); // a second start keeps the one timer
  assert.equal(r.intervals.size, 1);
  r.watch.stop();
  assert.equal(r.intervals.size, 0);
});

test('the room on screen is the match, or the lobby while it shows; a lobby closed with Q is listed', () => {
  assert.equal(roomOnScreen({ code: 'AAAA', on: true }, false), 'AAAA');
  assert.equal(roomOnScreen({ code: 'AAAA', on: false }, true), 'AAAA');
  assert.equal(roomOnScreen({ code: 'AAAA', on: false }, false), '');
  assert.equal(roomOnScreen({ code: '', on: false }, true), '');
});
