// The Your games watcher (src/games.ts) with fake timers, a scripted `mine`
// and a seat store over a Map: what it asks, what it forgets, and that each
// turn is reported once and never for the room on screen.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { StorageLike } from '../../_kit/ports.ts';
import { createGamesWatch, GAMES_POLL_MS, roomOnScreen } from '../src/games.ts';
import type { GamesWatch, LiveRow } from '../src/games.ts';
import type { MineRow } from '../src/protocol.ts';
import { createSeatStore } from '../src/seats.ts';
import type { SeatStore } from '../src/seats.ts';

/** Item `i` of a list the case reads, which must be there. */
function nth<T>(list: readonly T[], i: number): T {
  const v = list[i];
  assert.ok(v !== undefined, `no item ${i} of ${list.length}`);
  return v;
}

function mapStorage(): StorageLike {
  const m = new Map<string, string>();
  return { getItem: k => m.get(k) ?? null, setItem: (k, v) => { m.set(k, String(v)); }, removeItem: k => { m.delete(k); } };
}
const row = (code: string, over: Partial<LiveRow> = {}): LiveRow => ({
  code, gone: false, seat: 1, phase: 'play', round: 2, turnSecs: 600, turn: 0, yourTurn: false, turnKey: null,
  turnLeft: null, shopLeft: null, players: ['ABC', 'ZED'], hostSeat: 0, turnName: 'ABC', expiresAt: 2e9, closesIn: 600, ...over,
});
const flush = async () => { for (let i = 0; i < 10; i++) await new Promise(r => setImmediate(r)); };

/** What `mine` answers: rows, or an error the ask rejects with. */
type Reply = MineRow[] | Error;
interface Rig {
  store: SeatStore;
  asks: string[][];
  rows: string[][];
  turns: string[];
  intervals: Map<number, { fn: () => void; ms: number }>;
  here: string;
  reply: (asks: { code: string }[]) => Reply;
  pending: Promise<MineRow[]> | null;
  elsewhere: string[];
  watch: GamesWatch;
  tick(): void;
}

function rig({ codes = [], reply = asks => asks.map(a => row(a.code)) }: { codes?: string[]; reply?: Rig['reply'] } = {}): Rig {
  const store = createSeatStore(mapStorage(), () => 0);
  for (const c of [...codes].reverse()) store.remember({ code: c, seat: 1, token: 't' + c, csrf: 'c', initials: 'ZED' });
  const intervals: Rig['intervals'] = new Map();
  let nextId = 1;
  const state: Omit<Rig, 'watch' | 'tick'> = { store, asks: [], rows: [], turns: [], intervals, here: '', reply, pending: null, elsewhere: [] };
  const watch = createGamesWatch({
    store,
    mine: asks => {
      state.asks.push(asks.map(a => a.code));
      if (state.pending) return state.pending;
      const out = state.reply(asks);
      return out instanceof Error ? Promise.reject(out) : Promise.resolve(out);
    },
    setInterval: (fn, ms) => { const id = nextId++; intervals.set(id, { fn, ms }); return id; },
    clearInterval: id => { intervals.delete(Number(id)); },
    viewing: () => state.here,
    elsewhere: code => state.elsewhere.includes(code),
    onRows: rows => { state.rows.push(rows.map(x => x.code)); },
    onTurn: x => { state.turns.push(x.code + '#' + x.turnKey); },
  });
  const tick = () => { for (const { fn } of intervals.values()) fn(); };
  return Object.assign(state, { watch, tick });
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
  let release: (rows: MineRow[]) => void = () => {};
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
  assert.equal(nth([...r.intervals.values()], 0).ms, GAMES_POLL_MS);
  await flush();
  let release: (rows: MineRow[]) => void = () => {};
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

test('a room another tab is showing is listed but never raises a turn there', async () => {
  const r = rig({ codes: ['AAAA'], reply: asks => asks.map(a => row(a.code, { yourTurn: true, turnKey: '1:1:0', turn: 1 })) });
  r.elsewhere = ['AAAA'];
  r.watch.start();
  await flush();
  assert.deepEqual(r.rows, [['AAAA']]);
  assert.deepEqual(r.turns, []);
});

test('after stepping out on your own turn, that turn raises no toast; the next one does', async () => {
  let key = '1:1:0';
  const r = rig({ codes: ['AAAA'], reply: asks => asks.map(a => row(a.code, { yourTurn: true, turnKey: key, turn: 1 })) });
  r.watch.quietNext('AAAA');
  r.watch.start();
  await flush();
  assert.deepEqual(r.turns, []);
  key = '1:1:2';
  r.tick();
  await flush();
  assert.deepEqual(r.turns, ['AAAA#1:1:2']);
});

test('quietNext lapses on the next answer when it is not your turn there', async () => {
  let yours = false;
  const r = rig({ codes: ['AAAA'], reply: asks => asks.map(a => row(a.code, yours ? { yourTurn: true, turnKey: '2:1:0', turn: 1 } : {})) });
  r.watch.quietNext('AAAA');
  r.watch.start();
  await flush();
  yours = true;
  r.tick();
  await flush();
  assert.deepEqual(r.turns, ['AAAA#2:1:0']);
});
