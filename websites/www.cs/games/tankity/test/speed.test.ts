// The game speed (src/speed.ts): the three speeds, kept equal to the
// server's list, the tap order, the words on the FF button, the solo setting
// in this browser's storage, and the host's pick in a room (shown at once,
// sent once it has stood, held over polls until the server answers).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  SPEEDS, SPEED_KEY, SPEED_SETTLE_MS, createSpeedSender, isSpeed, nextSpeed, parseSpeed, speedLabel, speedSetting, speedTitle,
} from '../src/speed.ts';
import type { Speed } from '../src/speed.ts';
import type { StorageLike } from '../../_kit/ports.ts';

const settings = fs.readFileSync(path.join(import.meta.dirname, '..', 'server', 'settings.php'), 'utf8');

test('the speeds are 1, 2 and 4, as server/settings.php has them', () => {
  assert.deepEqual([...SPEEDS], [1, 2, 4]);
  const php = /const ROOM_SPEEDS = \[([^\]]+)\]/.exec(settings);
  assert.ok(php && php[1], 'ROOM_SPEEDS is in server/settings.php');
  assert.deepEqual(php[1].split(',').map(Number), [...SPEEDS]);
});

test('each tap goes 1× → 2× → 4× → 1×', () => {
  assert.equal(nextSpeed(1), 2);
  assert.equal(nextSpeed(2), 4);
  assert.equal(nextSpeed(4), 1);
  let s: Speed = 1;
  const seen: Speed[] = [];
  for (let i = 0; i < 6; i++) { s = nextSpeed(s); seen.push(s); }
  assert.deepEqual(seen, [2, 4, 1, 2, 4, 1]);
});

test('anything that is not a speed reads as 1×', () => {
  for (const v of [1, 2, 4]) assert.equal(parseSpeed(v), v);
  assert.equal(parseSpeed('2'), 2);
  assert.equal(parseSpeed('4'), 4);
  for (const v of [undefined, null, 0, 3, 8, -2, 2.5, '', 'fast', NaN, {}, [2]]) assert.equal(parseSpeed(v), 1, String(v));
  assert.ok(isSpeed(4) && !isSpeed(3) && !isSpeed('2'));
});

test('the button reads 1×, 2×, 4×, and says who may turn it', () => {
  assert.deepEqual(SPEEDS.map(speedLabel), ['1×', '2×', '4×']);
  assert.equal(speedTitle(1, null), 'Game speed 1×. Tap for 2×.');
  assert.equal(speedTitle(4, null), 'Game speed 4×. Tap for 1×.');
  assert.equal(speedTitle(2, { host: true }), 'Game speed 2×. Tap for 4×.');
  assert.equal(speedTitle(2, { host: false }), "Game speed 2×. The host sets the room's speed.");
});

/** A Map behind StorageLike, with a switch that makes every call throw. */
function memoryStorage() {
  const m = new Map<string, string>();
  let broken = false;
  const store: StorageLike = {
    getItem: k => { if (broken) throw new Error('blocked'); return m.has(k) ? m.get(k)! : null; },
    setItem: (k, v) => { if (broken) throw new Error('blocked'); m.set(k, v); },
    removeItem: k => { if (broken) throw new Error('blocked'); m.delete(k); },
  };
  return { store, m, break: () => { broken = true; } };
}

test('the solo speed is kept in this browser under tankity-speed', () => {
  const { store, m } = memoryStorage();
  const a = speedSetting(store);
  assert.equal(a.get(), 1, 'nothing kept yet: 1×');
  a.set(4);
  assert.equal(m.get(SPEED_KEY), '4');
  assert.equal(speedSetting(store).get(), 4, 'a new page reads it back');
  m.set(SPEED_KEY, 'warp');
  assert.equal(speedSetting(store).get(), 1, 'a stray value reads as 1×');
});

test('storage that throws or is missing keeps the speed for the session and never throws', () => {
  const s = memoryStorage();
  s.break();
  const a = speedSetting(s.store);
  assert.equal(a.get(), 1);
  assert.doesNotThrow(() => a.set(2));
  assert.equal(a.get(), 2);
  const none = speedSetting(null);
  none.set(4);
  assert.equal(none.get(), 4);
});

/** Timers that run only when told to. */
function fakeTimers() {
  let now = 0;
  let id = 0;
  const due = new Map<number, { at: number; fn: () => void }>();
  return {
    setTimeout: (fn: () => void, ms: number) => { due.set(++id, { at: now + ms, fn }); return id; },
    clearTimeout: (t: unknown) => { due.delete(t as number); },
    advance(ms: number) {
      now += ms;
      for (const [k, t] of [...due]) if (t.at <= now) { due.delete(k); t.fn(); }
    },
  };
}
const flush = () => new Promise(r => setImmediate(r));

test("a host's taps show at once and send one settled pick", async () => {
  const sent: Speed[] = [];
  let settled = 0;
  const t = fakeTimers();
  const s = createSpeedSender({ send: async v => { sent.push(v); }, refused: () => assert.fail('refused'), settled: () => { settled++; }, ...t });
  assert.equal(s.pending(), null);
  s.pick(2);
  s.pick(4);
  assert.equal(s.pending(), 4, 'the newest pick shows at once');
  t.advance(SPEED_SETTLE_MS - 1);
  assert.deepEqual(sent, [], 'nothing is sent while the taps keep coming');
  t.advance(1);
  assert.deepEqual(sent, [4], 'one pick, the last');
  await flush();
  assert.equal(s.pending(), null, 'answered: the room says the speed again');
  assert.equal(settled, 1);
});

test('a refused pick gives the room its speed back and says why', async () => {
  const errors: unknown[] = [];
  const t = fakeTimers();
  const s = createSpeedSender({ send: async () => { throw new Error('only the host sets the game speed'); }, refused: e => errors.push(e), settled: () => {}, ...t });
  s.pick(2);
  t.advance(SPEED_SETTLE_MS);
  await flush();
  assert.equal(s.pending(), null);
  assert.equal(errors.length, 1);
});

test('only the newest answer counts', async () => {
  const t = fakeTimers();
  const answers: (() => void)[] = [];
  const fails: ((e: Error) => void)[] = [];
  const errors: unknown[] = [];
  const s = createSpeedSender({
    send: () => new Promise<void>((ok, no) => { answers.push(ok); fails.push(no); }),
    refused: e => errors.push(e), settled: () => {}, ...t,
  });
  s.pick(2);
  t.advance(SPEED_SETTLE_MS);
  s.pick(4);
  t.advance(SPEED_SETTLE_MS);
  fails[0]!(new Error('too fast'));
  await flush();
  assert.equal(s.pending(), 4, 'the older refusal neither shows nor undoes the newer pick');
  assert.deepEqual(errors, []);
  answers[1]!();
  await flush();
  assert.equal(s.pending(), null);
});

test('leaving forgets a pick waiting on the server', async () => {
  const t = fakeTimers();
  let answer: () => void = () => {};
  const s = createSpeedSender({ send: () => new Promise<void>(ok => { answer = ok; }), refused: () => {}, settled: () => {}, ...t });
  s.pick(4);
  t.advance(SPEED_SETTLE_MS);
  s.clear();
  assert.equal(s.pending(), null);
  answer();
  await flush();
  assert.equal(s.pending(), null);
});
