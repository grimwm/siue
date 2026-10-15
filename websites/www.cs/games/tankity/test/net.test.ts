// The room client without a browser or a server. src/net.ts takes its fetch,
// timers and clock as arguments, so every case below drives it with a fake server,
// fake timers and a clock the test moves by hand: the 429 retry, Ready's
// one-at-a-time ordering under rapid toggles, polling, the turn clock and the
// catch-up decision for a hidden tab. Replies come from protocol/*.json where a
// real shape matters.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  RoomClient, isGoneError, prettyRoomError, inviteUrl, standingsRows, shouldCatchUp, planCatchUp, isVolleyOpener,
  MATCH_POLL_MS, LOBBY_POLL_MS, RETRY_429_MS, RETRY_429_TRIES, PROTO,
} from '../src/net.ts';
import type { FetchInit, RoomEnv } from '../src/net.ts';
import type { StoredSeat } from '../src/seats.ts';
import type { MineRow, RoomEvent, RoomSeat, RoomSnapshot } from '../src/protocol.ts';

const GAME_DIR = path.join(import.meta.dirname, '..');
/** A protocol/*.json reply body: the room a room reply carries, the rows action=mine answers. */
interface FixtureBody { room: RoomSnapshot; rooms: MineRow[] }
const fixture = (name: string): FixtureBody => JSON.parse(fs.readFileSync(path.join(GAME_DIR, 'protocol', name + '.json'), 'utf8')).body;

const j = (v: unknown) => JSON.stringify(v);

/** Item `i` of a list the case reads, which must be there. */
function at<T>(list: readonly T[], i: number): T {
  const v = list[i];
  assert.ok(v !== undefined, `no item ${i} of ${list.length}`);
  return v;
}
/** What a case caught, which the client always throws as an Error. */
function errorOf(err: unknown): Error & { roomDown?: boolean } {
  assert.ok(err instanceof Error, String(err));
  return err;
}
// The cases hand the client partial rooms and seats: only the fields each one reads.
const snap = (room: Partial<RoomSnapshot>): RoomSnapshot => room as RoomSnapshot;
const seatOf = (seat: Partial<RoomSeat>): RoomSeat => seat as RoomSeat;
/** The hills a room or the client holds, which the case expects to be there. */
function hills(terrain: number[] | null | undefined): number[] {
  assert.ok(terrain, 'no hills');
  return terrain;
}

/** One request as the fake host saw it. */
interface Sent { url: string; init: FetchInit }
/** A fake server's answer: a status and a JSON body, or a page that is not JSON. */
interface FakeReply { status: number; body?: unknown; page?: boolean }
type Respond = (url: string, init: FetchInit, i: number) => FakeReply | Error | Promise<FakeReply | Error>;
interface Host {
  log: Sent[]; delays: number[]; intervals: Map<unknown, { fn: () => void; ms: number }>; nextId: number; clock: number;
  beacons: { url: string; body: string }[]; beaconTakes: boolean; inflight: number; maxInflight: number;
  env: RoomEnv;
}

/** A fake host. `respond(url, init)` returns a status and body (or a promise of
 * them) for each request; the log keeps every request as it was sent. */
function makeHost(respond: Respond): Host {
  const host: Host = {
    log: [], delays: [], intervals: new Map(), nextId: 1, clock: 0, beacons: [], beaconTakes: true,
    inflight: 0, maxInflight: 0,
    env: {
    async fetch(url: string, init: FetchInit) {
      host.log.push({ url, init });
      host.inflight++;
      host.maxInflight = Math.max(host.maxInflight, host.inflight);
      try {
        const r = await respond(url, init, host.log.length - 1);
        if (r instanceof Error) throw r;
        return { ok: r.status >= 200 && r.status < 300, status: r.status, json: async () => { if (r.page) throw new Error('not json'); return r.body; } };
      } finally { host.inflight--; }
    },
    // A timer that fires on the next turn of the loop, remembering how long it was asked to wait.
    setTimeout: (fn, ms) => { host.delays.push(ms); queueMicrotask(fn); return 0; },
    setInterval: (fn, ms) => { const id = host.nextId++; host.intervals.set(id, { fn, ms }); return id; },
    clearInterval: id => { host.intervals.delete(id); },
    now: () => host.clock,
    beacon: (url, body) => { host.beacons.push({ url, body }); return host.beaconTakes; },
  },
  };
  return host;
}
interface Seen { reachable: boolean[]; snapshots: { room: RoomSnapshot; fresh: RoomEvent[]; first: boolean }[]; ready: number; errors: unknown[] }
function makeClient(respond: Respond) {
  const host = makeHost(respond);
  const seen: Seen = { reachable: [], snapshots: [], ready: 0, errors: [] };
  const net = new RoomClient(host.env, {
    onReachable: up => seen.reachable.push(up),
    onSnapshot: (room, fresh, first) => seen.snapshots.push({ room, fresh, first }),
    onReadyChange: () => { seen.ready++; },
    onError: err => seen.errors.push(err),
  });
  net.code = 'FXT1'; net.token = 'tok'; net.csrf = 'csrf'; net.seat = 0;
  return { net, host, seen };
}
type Client = ReturnType<typeof makeClient>;
const ok = (body: unknown): FakeReply => ({ status: 200, body });
const roomReply = (patch: Partial<RoomSnapshot> = {}) => ok({ ok: true, room: Object.assign({ phase: 'shop', events: [], seats: [], turnLeft: null, shopLeft: 90 }, patch) });
const flush = async () => { for (let i = 0; i < 20; i++) await new Promise<void>(r => setImmediate(r)); };
// String(): JSON.parse reads a missing body as 'undefined' either way.
const bodyOf = (entry: Sent): Record<string, unknown> => JSON.parse(String(entry.init.body));

// ---- the wire ----
{
  const { net, host, seen } = makeClient(() => roomReply());
  await net.post('buy', { item: 'buck', qty: 2 });
  const req = at(host.log, 0);
  await test('wire-url-and-method', () => { assert.ok(req.url === 'rooms.php?action=buy' && req.init.method === 'POST', req.url); });
  await test('wire-csrf-header', () => { const headers = req.init.headers; assert.ok(headers); assert.ok(headers['X-CSRF-Token'] === 'csrf' && headers['Content-Type'] === 'application/json'); });
  await test('wire-body-carries-the-seat', () => { assert.ok(j(bodyOf(req)) === j({ code: 'FXT1', token: 'tok', csrf: 'csrf', since: 0, item: 'buck', qty: 2 }), req.init.body); });
  await test('wire-reachable-on-success', () => { assert.ok(j(seen.reachable) === '[true]', j(seen.reachable)); });

  const q = makeClient(() => roomReply());
  q.net.since = 7;
  await q.net.getState();
  await test('wire-state-query', () => { assert.ok(at(q.host.log, 0).url === 'rooms.php?action=state&code=FXT1&token=tok&since=7', at(q.host.log, 0).url); });
}

// ---- the 429 retry: 180 ms, up to 3 times ----
{
  let n = 0;
  const { net, host } = makeClient(() => (++n <= 2 ? fixture('error-too-fast') && { status: 429, body: fixture('error-too-fast') } : roomReply()));
  const reply = await net.post('act', { kind: 'weapon', weapon: 'buck' });
  await test('retry-429-then-success', () => { assert.ok(!!reply.ok && host.log.length === 3, `requests ${host.log.length}`); });
  // A room busy past the server's lock wait answers 503: retried the same way.
  {
    let m = 0;
    const busy = makeClient(() => (++m <= 1 ? { status: 503, body: { ok: false, error: 'this room is busy; try again' } } : roomReply()));
    const r2 = await busy.net.post('act', { kind: 'aim', angle: 40, power: 50 });
    await test('retry-503-then-success', () => { assert.ok(!!r2.ok && busy.host.log.length === 2, `requests ${busy.host.log.length}`); });
  }
  await test('retry-429-waits-180ms', () => { assert.ok(j(host.delays) === j([RETRY_429_MS, RETRY_429_MS]) && RETRY_429_MS === 180, j(host.delays)); });

  const stuck = makeClient(() => ({ status: 429, body: fixture('error-too-fast') }));
  let msg = '';
  try { await stuck.net.post('act', { kind: 'weapon', weapon: 'buck' }); } catch (err) { msg = errorOf(err).message; }
  await test('retry-429-gives-up-after-3-retries', () => { assert.ok(stuck.host.log.length === 1 + RETRY_429_TRIES && RETRY_429_TRIES === 3 && msg === 'too fast', `${stuck.host.log.length} requests, "${msg}"`); });
  await test('retry-429-error-reads-human', () => { assert.ok(/Easy on the trigger/.test(prettyRoomError(new Error(msg)))); });
  await test('retry-429-not-reachable-flip', () => { assert.ok(j(stuck.seen.reachable) === '[]', j(stuck.seen.reachable)); });

  const other = makeClient(() => ({ status: 409, body: fixture('error-not-your-turn') }));
  let m2 = '';
  try { await other.net.post('act', { kind: 'fire' }); } catch (err) { m2 = errorOf(err).message; }
  await test('no-retry-on-other-errors', () => { assert.ok(other.host.log.length === 1 && m2 === 'not your turn', `${other.host.log.length}, "${m2}"`); });
}

// ---- hosting and joining spend the address's hourly allowance: a 429 is never retried, a 503 once ----
{
  const capped = { status: 429, body: { ok: false, error: 'too many rooms from here; try again later' } };
  const busy = { status: 503, body: { ok: false, error: 'the room server is busy; try again' } };
  const created = ok({ ok: true, code: 'NEW1', seat: 0, token: 't', csrf: 'c' });
  const asks: [string, (c: Client) => Promise<void>][] = [['host', c => c.net.host('ABC', '', 'tank', 'normal')], ['join', c => c.net.join('FXT1', 'DEF', 'tank')]];
  for (const [what, go] of asks) {
    const spent = makeClient(() => capped);
    let msg = '';
    try { await go(spent); } catch (err) { msg = errorOf(err).message; }
    await test(`${what}-429-not-retried`, () => { assert.ok(spent.host.log.length === 1 && msg === 'too many rooms from here; try again later', `${spent.host.log.length} requests, "${msg}"`); });
    await test(`${what}-429-reads-as-the-server-says`, () => { assert.ok(prettyRoomError(new Error(msg)) === msg, prettyRoomError(new Error(msg))); });

    let n = 0;
    const once = makeClient(() => (++n === 1 ? busy : created));
    await go(once);
    await test(`${what}-503-retried-once`, () => { assert.ok(once.host.log.length === 2 && once.net.code === 'NEW1', `${once.host.log.length} requests`); });

    const down = makeClient(() => busy);
    let m2 = '';
    try { await go(down); } catch (err) { m2 = errorOf(err).message; }
    await test(`${what}-503-gives-up-after-one-retry`, () => { assert.ok(down.host.log.length === 2 && m2 === 'the room server is busy; try again', `${down.host.log.length} requests, "${m2}"`); });

    let k = 0;
    const thenCapped = makeClient(() => (++k === 1 ? busy : capped));
    try { await go(thenCapped); } catch (_) { /* refused */ }
    await test(`${what}-503-then-429-stops`, () => { assert.ok(thenCapped.host.log.length === 2, `${thenCapped.host.log.length} requests`); });
  }
}

// ---- transport trouble arrives in human words ----
{
  const gone = makeClient(() => new Error('connection refused'));
  let e1: (Error & { roomDown?: boolean }) | null = null;
  try { await gone.net.post('act', { kind: 'fire' }); } catch (err) { e1 = errorOf(err); }
  await test('down-unreachable', () => { assert.ok(e1 && e1.roomDown === true && /Could not reach the room server/.test(e1.message), e1?.message); });
  await test('down-flips-the-dot', () => { assert.ok(j(gone.seen.reachable) === '[false]', j(gone.seen.reachable)); });

  const page = makeClient(() => ({ status: 200, page: true }));
  let e2: (Error & { roomDown?: boolean }) | null = null;
  try { await page.net.getState(); } catch (err) { e2 = errorOf(err); }
  await test('down-page-instead-of-data', () => { assert.ok(e2 && /page instead of game data/.test(e2.message), e2?.message); });

  const stumble = makeClient(() => ({ status: 500, page: true }));
  let e3: (Error & { roomDown?: boolean }) | null = null;
  try { await stumble.net.getState(); } catch (err) { e3 = errorOf(err); }
  await test('down-stumble', () => { assert.ok(e3 && /stumbled/.test(e3.message), e3?.message); });

  await test('pretty-stale-session', () => { assert.ok(/went stale/.test(prettyRoomError(new Error('bad csrf token'))) && /went stale/.test(prettyRoomError('bad seat token'))); });
  await test('pretty-passthrough', () => { assert.ok(prettyRoomError(new Error('short on cash')) === 'short on cash'); });
}

// ---- host and join ----
{
  const { net, host } = makeClient((url) => (/create/.test(url) ? ok(fixture('create-reply')) : ok(fixture('join-reply'))));
  net.since = 9; net.seats = [seatOf({})];
  await net.host('ABC', '', 'tank', 'normal');
  await test('host-takes-the-seat', () => { assert.ok(net.code === 'FXT1' && net.seat === 0 && net.token === 'fixture-token-0' && net.csrf === 'fixture-csrf' && net.since === 0 && net.seats.length === 0, j({ c: net.code, s: net.seat, t: net.token, since: net.since })); });
  await test('host-sent-no-old-session', () => { assert.ok(bodyOf(at(host.log, 0)).code === '' && bodyOf(at(host.log, 0)).token === '', at(host.log, 0).init.body); });
  await net.join(' fxt1 ', 'DEF', 'hover');
  await test('join-uppercases-the-code', () => { assert.ok(bodyOf(at(host.log, 1)).code === 'FXT1' && net.seat === 1, at(host.log, 1).init.body); });
}

// ---- the room protocol: create, join and start say which one they speak ----
{
  const { net, host } = makeClient((url) => (/create/.test(url) ? ok(fixture('create-reply')) : ok(fixture('join-reply'))));
  await net.host('ABC', '', 'tank', 'normal');
  await net.join('FXT1', 'DEF', 'tank');
  await test('create-and-join-send-the-protocol', () => {
    assert.ok(PROTO === 2 && bodyOf(at(host.log, 0)).proto === 2 && bodyOf(at(host.log, 1)).proto === 2, j(host.log.map(bodyOf)));
  });
}
{
  // The host alone: the server closes the lobby and the browser plays the match.
  const { net, host } = makeClient(() => ({ status: 200, body: fixture('start-local-reply') }));
  const got = await net.start();
  await test('start-sends-the-protocol', () => { assert.ok(/action=start/.test(at(host.log, 0).url) && bodyOf(at(host.log, 0)).proto === 2, at(host.log, 0).init.body); });
  await test('start-local-resolves-the-match-to-play-here', () => { assert.deepEqual(got, { local: { difficulty: 'hard', speed: 1 } }); });

  const room = makeClient(() => roomReply({ phase: 'play' }));
  const started = await room.net.start();
  await test('start-with-company-resolves-the-room', () => { assert.ok('room' in started && started.room.phase === 'play', j(started)); });

  // An odd speed on the wire plays at 1×, as everywhere else.
  const odd = makeClient(() => ok({ ok: true, local: { difficulty: 'easy', speed: 3 } }));
  await test('start-local-speed-is-parsed', async () => { assert.deepEqual(await odd.net.start(), { local: { difficulty: 'easy', speed: 1 } }); });

  const old = makeClient(() => ({ status: 426, body: fixture('error-reload') }));
  let msg = '';
  await old.net.start().catch(err => { msg = prettyRoomError(err); });
  await test('start-426-says-reload', () => { assert.ok(msg === 'Tankity was updated. Reload the page to keep playing.' && old.host.log.length === 1, `${old.host.log.length} requests, "${msg}"`); });
}

// ---- acts ----
{
  let release = (): void => { throw new Error('the gate is not built yet'); };
  const gate = new Promise<void>(r => { release = r; });
  const { net, host } = makeClient(async () => { await gate; return roomReply({ phase: 'play' }); });
  net.on = true;
  const first = net.act({ kind: 'fire', angle: 60, power: 50 });
  const second = net.act({ kind: 'fire', angle: 61, power: 51 }); // dropped: one fire at a time
  release();
  await Promise.all([first, second]);
  await test('act-one-at-a-time', () => { assert.ok(host.log.length === 1, `requests ${host.log.length}`); });

  const failing = makeClient(() => ({ status: 409, body: fixture('error-not-your-turn') }));
  let rejected = '';
  await failing.net.act({ kind: 'fire' }).catch(err => { rejected = errorOf(err).message; });
  const again = failing.net.act({ kind: 'fire' }).catch(() => {});
  await again;
  await test('act-rejects-and-frees-the-guard', () => { assert.ok(rejected === 'not your turn' && failing.host.log.length === 2, `${rejected} / ${failing.host.log.length}`); });

  const quiet = makeClient(() => ({ status: 409, body: fixture('error-not-your-turn') }));
  quiet.net.sendQuiet({ kind: 'aim', angle: 70, power: 40 });
  await flush();
  await test('quiet-send-swallows-errors', () => { assert.ok(quiet.seen.errors.length === 0 && quiet.host.log.length === 1); });

  // The menu flag: once per change, and a failed send is retried by the next frame.
  let fail = true;
  const menu = makeClient(() => (fail ? { status: 500, page: true } : roomReply({ phase: 'play' })));
  menu.net.setMenu(true);
  menu.net.setMenu(true);
  await flush();
  await test('menu-flag-sends-once', () => { assert.ok(menu.host.log.length === 1 && bodyOf(at(menu.host.log, 0)).kind === 'menu' && bodyOf(at(menu.host.log, 0)).open === true); });
  menu.net.setMenu(true);
  await flush();
  await test('menu-flag-retries-after-a-failure', () => { assert.ok(menu.host.log.length === 2, `requests ${menu.host.log.length}`); });
  fail = false;
  menu.net.setMenu(true);
  await flush();
  menu.net.setMenu(false);
  await flush();
  await test('menu-flag-closes', () => { assert.ok(menu.host.log.length === 4 && bodyOf(at(menu.host.log, 2)).open === true && bodyOf(at(menu.host.log, 3)).open === false, menu.host.log.map(r => r.init.body).join(' ')); });
  const noRoom = makeClient(() => roomReply());
  noRoom.net.code = '';
  noRoom.net.setMenu(true);
  await test('menu-flag-needs-a-room', () => { assert.ok(noRoom.host.log.length === 0); });
}

// ---- Ready: wanted state, one request at a time, in click order ----
{
  const gates: (() => void)[] = [];
  const { net, host, seen } = makeClient((url, init, i) => new Promise(resolve => {
    const want: boolean = JSON.parse(String(init.body)).ready;
    gates[i] = () => resolve(roomReply({ seats: [seatOf({ seat: 0, human: true, ready: want })] }));
  }));
  net.on = true;
  net.seats = [seatOf({ seat: 0, human: true, ready: false })];
  net.setReady();            // asks for ready
  await test('ready-shows-the-wish-at-once', () => { assert.ok(net.readyNow() === true && seen.ready === 1); });
  net.setReady();            // while the first is out: toggles to unready
  net.setReady();            // and back to ready
  await test('ready-one-request-in-flight', () => { assert.ok(host.log.length === 1 && host.maxInflight === 1, `requests ${host.log.length}`); });
  at(gates, 0)();
  await flush();
  net.seats = at(seen.snapshots, 0).room.seats; // the page adopts the room's seats
  await test('ready-wish-satisfied-sends-nothing-more', () => { assert.ok(host.log.length === 1 && net.readyNow() === true, `requests ${host.log.length}`); });
  await test('ready-sent-wanted-state-not-a-flip', () => { assert.ok(bodyOf(at(host.log, 0)).ready === true); });
  await test('ready-reply-applied', () => { assert.ok(seen.snapshots.length === 1); });
  await test('ready-sender-reports-done', () => { assert.ok(seen.ready >= 2); });
}
{
  const gates: (() => void)[] = [];
  const { net, host } = makeClient((url, init, i) => new Promise(resolve => {
    const want: boolean = JSON.parse(String(init.body)).ready;
    gates[i] = () => resolve(roomReply({ seats: [seatOf({ seat: 0, human: true, ready: want })] }));
  }));
  net.on = true;
  net.seats = [seatOf({ seat: 0, human: true, ready: false })];
  net.setReady(true);
  net.setReady(false);       // the last wish differs from the one in flight
  at(gates, 0)();
  await flush();
  await test('ready-follow-up-goes-after-the-first-reply', () => { assert.ok(host.log.length === 2 && bodyOf(at(host.log, 1)).ready === false, `requests ${host.log.length}`); });
  at(gates, 1)();
  await flush();
  await test('ready-requests-never-overlap', () => { assert.ok(host.maxInflight === 1); });
  await test('ready-ends-on-the-last-click', () => { assert.ok(net.readyNow() === false && host.log.map(r => bodyOf(r).ready).join() === 'true,false'); });
}
{
  // A failed send drops the wish, tells the page, and re-reads the room.
  let n = 0;
  const { net, host, seen } = makeClient((url) => (++n === 1 ? { status: 409, body: { error: 'shop is closed' } } : roomReply({ phase: 'play' })));
  net.on = true;
  net.setReady(true);
  await flush();
  await test('ready-error-reaches-the-page', () => { const e0 = seen.errors[0]; assert.ok(seen.errors.length === 1 && e0 instanceof Error && e0.message === 'shop is closed'); });
  await test('ready-error-drops-the-wish', () => { assert.ok(net.readyNow() === false); });
  await test('ready-error-refreshes', () => { assert.ok(host.log.length === 2 && /action=state/.test(at(host.log, 1).url), host.log.map(r => r.url).join()); });
  net.setReady(true);
  await flush();
  await test('ready-works-again-after-an-error', () => { assert.ok(host.log.length >= 3 && /action=ready/.test(at(host.log, 2).url)); });
}
{
  const { net } = makeClient(() => roomReply());
  net.on = true;
  net.setReady(true);
  net.dropReadyWish();
  net.seats = [seatOf({ ready: false })];
  net.seat = 0;
  await test('ready-wish-dropped-outside-the-shop', () => { assert.ok(net.readyNow() === false); });
}

// ---- snapshots: the event cursor ----
{
  const { net, seen } = makeClient(() => roomReply());
  const room = fixture('play-after-fire').room;
  net.apply(room);
  const seqs = room.events.map(e => e.seq);
  await test('apply-first-sync-gets-history', () => { assert.ok(seen.snapshots.length === 1 && at(seen.snapshots, 0).first === true && at(seen.snapshots, 0).fresh.length === room.events.length); });
  await test('apply-cursor-moves-to-the-newest', () => { assert.ok(net.since === Math.max(...seqs), `${net.since} vs ${Math.max(...seqs)}`); });
  net.apply(room);
  await test('apply-only-fresh-events', () => { assert.ok(at(seen.snapshots, 1).first === false && at(seen.snapshots, 1).fresh.length === 0); });
  const more = Object.assign({}, room, { events: [...room.events, { t: 'round', round: 2, wind: 1, seq: net.since + 1 }] });
  net.apply(more);
  await test('apply-new-events-after-the-cursor', () => { assert.ok(at(seen.snapshots, 2).fresh.length === 1 && at(at(seen.snapshots, 2).fresh, 0).t === 'round'); });
  net.code = '';
  net.apply(room);
  await test('apply-ignored-without-a-session', () => { assert.ok(seen.snapshots.length === 3); });
  net.code = 'FXT1';
  net.apply(null);
  await test('apply-ignores-no-room', () => { assert.ok(seen.snapshots.length === 3); });
}

// ---- polling ----
{
  const { net, host, seen } = makeClient(() => roomReply({ phase: 'play', events: [{ t: 'round', round: 1, wind: 0, seq: 1 }] }));
  net.beginMatch();
  const poll = at([...host.intervals.values()], 0);
  await test('match-poll-cadence', () => { assert.ok(host.intervals.size === 1 && poll.ms === MATCH_POLL_MS && MATCH_POLL_MS === 1600, j([...host.intervals.values()].map(i => i.ms))); });
  await test('match-begins-clean', () => { assert.ok(net.on === true && net.since === 0 && net.synced === false); });
  poll.fn();
  await flush();
  await test('match-poll-applies-the-room', () => { assert.ok(seen.snapshots.length === 1 && at(seen.snapshots, 0).first === true && net.since === 1); });
  net.beginMatch();
  await test('match-poll-never-doubles', () => { assert.ok(host.intervals.size === 1); });
  net.stopPolling();
  await test('match-poll-stops', () => { assert.ok(host.intervals.size === 0); });

  // A match can start its cursor past events the lobby already told.
  const told = makeClient(() => roomReply({ phase: 'play', events: [
    { t: 'join', seat: 1, name: 'ZED', seq: 1 }, { t: 'round', round: 1, wind: 0, seq: 2 }] }));
  told.net.beginMatch(1);
  await test('match-begins-past-the-lobby', () => { assert.ok(told.net.since === 1 && told.net.synced === false); });
  at([...told.host.intervals.values()], 0).fn();
  await flush();
  const told0 = told.seen.snapshots[0];
  const fresh = told0 ? told0.fresh.map(e => e.t) : [];
  await test('match-skips-what-the-lobby-told', () => { assert.ok(fresh.join() === 'round', fresh.join()); });
  told.net.stopPolling();

  // A failing poll waits for the next one.
  const flaky = makeClient(() => new Error('offline'));
  flaky.net.beginMatch();
  at([...flaky.host.intervals.values()], 0).fn();
  await flush();
  await test('match-poll-survives-a-failure', () => { assert.ok(flaky.seen.snapshots.length === 0 && flaky.seen.reachable.includes(false)); });

  net.leave();
  await test('leave-clears-the-session', () => { assert.ok(net.code === '' && net.seat === -1 && net.token === '' && net.on === false && net.synced === false && host.intervals.size === 0); });
}
{
  let visible = true;
  const { net, host } = makeClient(() => roomReply({ phase: 'lobby' }));
  const rooms = [];
  net.watchLobby(() => visible, room => rooms.push(room));
  const tick = at([...host.intervals.values()], 0);
  await test('lobby-poll-cadence', () => { assert.ok(tick.ms === LOBBY_POLL_MS && LOBBY_POLL_MS === 2000); });
  tick.fn();
  await flush();
  await test('lobby-poll-delivers-the-room', () => { assert.ok(rooms.length === 1); });
  visible = false;
  tick.fn();
  await flush();
  await test('lobby-poll-stops-when-the-lobby-closes', () => { assert.ok(host.intervals.size === 0 && rooms.length === 1); });

  const m = makeClient(() => roomReply({ phase: 'lobby' }));
  m.net.watchLobby(() => true, () => {});
  m.net.on = true;
  at([...m.host.intervals.values()], 0).fn();
  await test('lobby-poll-stops-once-a-match-runs', () => { assert.ok(m.host.intervals.size === 0); });

  const t = makeClient(() => roomReply({ phase: 'lobby' }));
  t.net.watchLobby(() => true, () => { throw new Error('render failed'); });
  at([...t.host.intervals.values()], 0).fn();
  await flush();
  await test('lobby-poll-survives-a-bad-tick', () => { assert.ok(t.host.intervals.size === 1); });
}

// ---- delta snapshots: the hills ride only when the client lacks them ----
{
  const delta = fixture('play-after-fire-delta').room;
  const full = Object.assign(fixture('play-my-turn').room, { terrainRev: delta.terrainRev }); // the hills the delta is relative to
  const fullRev = full.terrainRev;
  const urlQuery = (entry: Sent) => new URLSearchParams(entry.url.split('?')[1]);
  let step = 0;
  const { net, host, seen } = makeClient(() => {
    step++;
    return ok({ ok: true, room: structuredClone(step === 1 ? full : delta) });
  });
  net.on = true;

  // The first sync holds nothing: no `have`, so the server sends the hills.
  await net.refresh();
  let q1 = urlQuery(at(host.log, 0));
  await test('delta-first-poll-names-no-rev', () => { assert.ok(!q1.has('have') && !q1.has('full') && q1.get('since') === '0', at(host.log, 0).url); });
  await test('delta-first-snapshot-keeps-the-hills', () => { assert.ok(net.terrain === at(seen.snapshots, 0).room.terrain && net.terrainRev === fullRev && net.terrain.length === 720); });

  // The next poll says what it holds; the reply omits the hills and the
  // client hands the page a complete room anyway.
  await net.refresh();
  const q2 = urlQuery(at(host.log, 1));
  await test('delta-poll-sends-its-rev', () => { assert.ok(q2.get('have') === String(fullRev) && !q2.has('full'), at(host.log, 1).url); });
  const second = at(seen.snapshots, 1).room;
  await test('delta-reply-omitted-the-hills', () => { assert.ok(delta.terrain === undefined); });
  await test('delta-page-sees-held-hills', () => { assert.ok(second.terrain === net.terrain && second.terrain.length === 720 && second.terrainRev === delta.terrainRev); });

  // act, buy and ready replies carry the same fields: the cursor and the rev.
  step = 1;
  await net.post('act', { kind: 'aim', angle: 40, power: 50 });
  const act = bodyOf(at(host.log, 2));
  await test('delta-act-sends-since-and-have', () => { assert.ok(act.since === net.since && act.have === fullRev && act.full === undefined, at(host.log, 2).init.body); });
  await net.post('buy', { item: 'buck', qty: 1 });
  await test('delta-buy-sends-have', () => { assert.ok(bodyOf(at(host.log, 3)).have === fullRev, at(host.log, 3).init.body); });
  await net.post('ready', { ready: true });
  await test('delta-ready-sends-have', () => { assert.ok(bodyOf(at(host.log, 4)).have === fullRev, at(host.log, 4).init.body); });
  await net.post('create', { proto: PROTO, initials: 'ABC', map: '', body: 'tank', difficulty: 'normal' }).catch(() => {});
  await test('delta-create-sends-no-holdings', () => { assert.ok(bodyOf(at(host.log, 5)).have === undefined && bodyOf(at(host.log, 5)).since === undefined, at(host.log, 5).init.body); });
}
{
  // A new revision arrives with its hills and replaces the held ones.
  const full = fixture('play-my-turn').room;
  const next = structuredClone(full);
  next.terrainRev = full.terrainRev + 1;
  next.terrain = hills(full.terrain).map(v => v + 1);
  const replies = [full, next];
  const { net, host, seen } = makeClient(() => ok({ ok: true, room: structuredClone(replies.shift()) }));
  net.on = true;
  await net.refresh();
  await net.refresh();
  await test('delta-new-rev-replaces-the-hills', () => { assert.ok(net.terrainRev === next.terrainRev && hills(net.terrain)[0] === at(hills(full.terrain), 0) + 1 && at(seen.snapshots, 1).room.terrain === net.terrain); });

  // A reply that lost a race (an older rev, hills omitted or sent) never rolls the hills back.
  const stale = structuredClone(full);
  const { net: n2, seen: s2 } = makeClient(() => ok({ ok: true, room: structuredClone(full) }));
  n2.on = true; n2.synced = true;
  n2.terrain = next.terrain; n2.terrainRev = next.terrainRev;
  n2.apply(stale);
  await test('delta-older-rev-never-rolls-back', () => { assert.ok(n2.terrain === next.terrain && at(s2.snapshots, 0).room.terrain === next.terrain); });
  const omitted = structuredClone(full);
  delete omitted.terrain;
  n2.apply(omitted);
  await test('delta-older-rev-omitted-keeps-the-hills', () => { assert.ok(at(s2.snapshots, 1).room.terrain === next.terrain); });
}
{
  // A snapshot that omits hills the client does not hold at that rev is not
  // used: the whole world is fetched (full=1) and that answer is.
  const full = fixture('play-my-turn').room;
  const ahead = structuredClone(fixture('play-after-fire-delta').room);
  ahead.terrainRev = full.terrainRev + 5;
  let n = 0;
  const { net, host, seen } = makeClient(() => {
    n++;
    return ok({ ok: true, room: structuredClone(n === 1 ? full : n === 2 ? ahead : Object.assign(structuredClone(full), { terrainRev: ahead.terrainRev })) });
  });
  net.on = true;
  await net.refresh();
  await net.refresh(); // `ahead` omits hills for a rev the client lacks
  await flush();
  await test('delta-unknown-rev-asks-for-everything', () => { assert.ok(host.log.length === 3 && /[?&]full=1/.test(at(host.log, 2).url) && !/[?&]have=/.test(at(host.log, 2).url), host.log.map(r => r.url).join('\n')); });
  await test('delta-unknown-rev-snapshot-not-applied', () => { assert.ok(seen.snapshots.length === 2 && net.terrainRev === ahead.terrainRev && hills(at(seen.snapshots, 1).room.terrain).length === 720, `${seen.snapshots.length} ${net.terrainRev}`); });
  // The request after that is a delta again.
  await net.refresh();
  await test('delta-full-is-asked-once', () => { assert.ok(!/[?&]full=1/.test(at(host.log, 3).url) && /[?&]have=/.test(at(host.log, 3).url), at(host.log, 3).url); });
}
{
  // A server that keeps omitting the hills when asked for everything is not looped on.
  const full = fixture('play-my-turn').room;
  const bare = structuredClone(fixture('play-after-fire-delta').room);
  bare.terrainRev = full.terrainRev + 1;
  let n = 0;
  const { net, host, seen } = makeClient(() => { n++; return ok({ ok: true, room: structuredClone(n === 1 ? full : bare) }); });
  net.on = true;
  await net.refresh();
  await net.refresh();
  await flush();
  await test('delta-no-refetch-loop', () => { assert.ok(host.log.length === 3 && seen.snapshots.length === 2, `${host.log.length} requests, ${seen.snapshots.length} snapshots`); });
}
{
  // resync: events were lost, so the snapshot is a first sync (no replay) and carries the hills.
  const full = fixture('play-my-turn').room;
  const lost = fixture('play-resync').room;
  await test('delta-resync-fixture-is-full', () => { assert.ok(lost.resync === true && Array.isArray(lost.terrain) && lost.terrain.length === 720); });
  const replies = [full, lost];
  const { net, seen } = makeClient(() => ok({ ok: true, room: structuredClone(replies.shift()) }));
  net.on = true;
  await net.refresh();
  net.since = 999;
  await net.refresh();
  await test('delta-resync-is-a-first-sync', () => { assert.ok(at(seen.snapshots, 0).first === true && at(seen.snapshots, 1).first === true && at(seen.snapshots, 1).room.resync === true); });
}
{
  // Hidden tab returns, or the server was unreachable: the next request is full=1.
  const full = fixture('play-my-turn').room;
  let down = false;
  const { net, host } = makeClient(() => (down ? new Error('offline') : ok({ ok: true, room: structuredClone(full) })));
  net.on = true;
  await net.refresh();
  await net.refresh();
  await test('delta-steady-poll-is-a-delta', () => { assert.ok(/[?&]have=/.test(at(host.log, 1).url) && !/full=1/.test(at(host.log, 1).url), at(host.log, 1).url); });
  net.resync(); // the tab came back
  await flush();
  await test('delta-hidden-return-asks-for-everything', () => { assert.ok(/[?&]full=1/.test(at(host.log, 2).url) && !/[?&]have=/.test(at(host.log, 2).url), at(host.log, 2).url); });
  await net.refresh();
  await test('delta-hidden-return-asks-once', () => { assert.ok(!/full=1/.test(at(host.log, 3).url) && /[?&]have=/.test(at(host.log, 3).url), at(host.log, 3).url); });
  down = true;
  await net.refresh();
  down = false;
  await net.refresh();
  await test('delta-reconnect-asks-for-everything', () => { assert.ok(/[?&]full=1/.test(at(host.log, 5).url), at(host.log, 5).url); });
  // A failed full request stays wanted: the flag clears only when an answer gets through.
  down = true;
  net.resync();
  await flush();
  down = false;
  await net.refresh();
  await test('delta-full-stays-wanted-until-answered', () => { assert.ok(/[?&]full=1/.test(at(host.log, host.log.length - 1).url), host.log.map(r => r.url).join('\n')); });
}
{
  // A new match starts empty: the first sync is always full.
  const full = fixture('play-my-turn').room;
  const { net, host } = makeClient(() => ok({ ok: true, room: structuredClone(full) }));
  net.beginMatch();
  await net.refresh();
  net.stopPolling();
  net.beginMatch();
  await net.refresh();
  net.stopPolling();
  await test('delta-match-start-forgets-the-hills', () => { assert.ok(net.terrain !== null && !/[?&]have=/.test(at(host.log, 1).url), at(host.log, 1).url); });
  net.leave();
  await test('delta-leave-forgets-the-hills', () => { assert.ok(net.terrain === null && net.terrainRev === 0); });
}

// ---- leave beacon ----
{
  const { net, host } = makeClient(() => ok({ ok: true }));
  net.sendLeave();
  await test('leave-beacon-first', () => { assert.ok(host.beacons.length === 1 && host.log.length === 0 && j(JSON.parse(at(host.beacons, 0).body)) === j({ code: 'FXT1', token: 'tok', csrf: 'csrf' })); });
  host.beaconTakes = false;
  net.sendLeave();
  await test('leave-falls-back-to-keepalive-fetch', () => { assert.ok(host.log.length === 1 && at(host.log, 0).init.keepalive === true && at(host.log, 0).url === 'rooms.php?action=leave'); });
  net.token = '';
  net.sendLeave();
  await test('leave-needs-a-seat', () => { assert.ok(host.beacons.length === 2 && host.log.length === 1); });
}

// ---- the clocks ----
{
  const { net, host } = makeClient(() => roomReply());
  net.on = true;
  host.clock = 1000;
  net.armClocks({ turnLeft: 40, shopLeft: null });
  await test('clock-counts-down-locally', () => { assert.ok(Math.abs(Number(net.turnClockLeft()) - 40) < 1e-9); });
  host.clock = 1000 + 12_000;
  await test('clock-ticks-with-the-host-clock', () => { assert.ok(Math.abs(Number(net.turnClockLeft()) - 28) < 1e-9, String(net.turnClockLeft())); });
  await test('clock-warns-at-30-once', () => { assert.ok(net.clockWarnDue() === true && net.clockWarnDue() === false); });
  host.clock = 1000 + 100_000;
  await test('clock-floors-at-zero-and-stops-warning', () => { assert.ok(net.turnClockLeft() === 0 && net.clockWarnDue() === false); });
  net.armClocks({ turnLeft: 119, shopLeft: null });
  await test('clock-a-jump-up-is-a-new-turn', () => { assert.ok(net.clockWarnDue() === false); });
  host.clock += 90_000;
  await test('clock-new-turn-warns-again', () => { assert.ok(net.clockWarnDue() === true); });
  net.armClocks({ turnLeft: null, shopLeft: 90 });
  await test('clock-none-outside-a-turn', () => { assert.ok(net.turnClockLeft() === null && net.clockWarnDue() === false); });
  await test('shop-clock', () => { assert.ok(Math.abs(Number(net.shopClockLeft()) - 90) < 1e-9); });
  host.clock += 30_000;
  await test('shop-clock-counts-down', () => { assert.ok(Math.abs(Number(net.shopClockLeft()) - 60) < 1e-9); });
  net.on = false;
  await test('clocks-silent-outside-a-match', () => { assert.ok(net.turnClockLeft() === null && net.shopClockLeft() === null); });
}

// ---- catching up a replay queue ----
{
  const op = (t: string, seat = 1) => ({ t, seat });
  const ev = (t: string) => ({ t });
  await test('opener-kinds', () => { assert.ok(['fire', 'aifire', 'auto'].every(t => isVolleyOpener({ t })) && !isVolleyOpener({ t: 'hit' }) && !isVolleyOpener({ t: 'shot' })); });

  await test('catch-up-wanted-when-hidden', () => { assert.ok(shouldCatchUp(true) === true); });
  // A visible tab plays everything: a human's shot and the drones' answers
  // arrive in one reply, and none of them may be skipped.
  await test('visible-tab-never-catches-up', () => { assert.ok(shouldCatchUp(false) === false); });

  const play = (turn: number) => snap({ phase: 'play', turn });
  const queue = [op('fire', 0), ev('shot'), ev('hit'), op('aifire'), ev('shot'), op('aifire'), ev('shot'), ev('kill')];
  // Not our turn next: keep the newest volley, log everything before it.
  let plan = planCatchUp(queue, false, play(2), 0);
  await test('plan-keeps-the-newest-volley', () => { assert.ok(plan && plan.cut === 5 && plan.fastNext === true, j(plan)); });
  // Our turn next: skip them all, hand over the controls.
  plan = planCatchUp(queue, false, play(0), 0);
  await test('plan-skips-all-when-it-is-our-turn', () => { assert.ok(plan && plan.cut === queue.length && plan.fastNext === false, j(plan)); });
  // One waiting volley and nothing on screen: nothing to skip.
  await test('plan-nothing-to-skip', () => { assert.ok(planCatchUp([op('fire'), ev('shot')], false, play(2), 0) === null); });
  // The volley on screen counts as waiting.
  plan = planCatchUp([op('aifire'), ev('shot')], true, play(2), 0);
  await test('plan-counts-the-playing-volley', () => { assert.ok(plan && plan.cut === 0 && plan.fastNext === true, j(plan)); });
  plan = planCatchUp([ev('hit')], true, play(0), 0);
  await test('plan-playing-volley-skipped-when-our-turn', () => { assert.ok(plan && plan.cut === 1 && plan.fastNext === false, j(plan)); });
  await test('plan-no-waiting-room-keeps-one', () => { const p = planCatchUp([op('fire'), op('aifire')], false, null, 0); assert.ok(p); assert.ok(p.cut === 1); });
  await test('plan-other-phase-is-not-our-turn', () => { assert.ok(planCatchUp([op('fire')], false, snap({ phase: 'shop', turn: null }), 0) === null); });
}

// A match poll in flight when Play again takes the room to its lobby answers
// with the old 'over' room: it is dropped, so the end card cannot come back
// over the lobby. So is one that answers after the next match began.
{
  let release = (): void => { throw new Error('no request is waiting yet'); };
  const { net, seen } = makeClient(() => new Promise(r => { release = () => r(roomReply({ phase: 'over' })); }));
  net.beginMatch();
  const late = net.refresh();
  net.toLobby();
  release();
  await late;
  await test('late-poll-after-lobby-dropped', () => { assert.ok(seen.snapshots.length === 0, j(seen.snapshots.length)); });
  net.beginMatch();
  const old = net.refresh();
  net.toLobby();
  net.beginMatch();
  release();
  await old;
  await test('late-poll-after-next-match-dropped', () => { assert.ok(seen.snapshots.length === 0, j(seen.snapshots.length)); });
  const fresh = net.refresh();
  release();
  await fresh;
  await test('current-poll-still-applied', () => { assert.ok(seen.snapshots.length === 1, j(seen.snapshots.length)); });
}

// An act, a quiet act and a menu flag answered after the room went back to its lobby are dropped too.
{
  let release = (): void => { throw new Error('no request is waiting yet'); };
  const { net, seen } = makeClient(() => new Promise(r => { release = () => r(roomReply({ phase: 'over' })); }));
  net.beginMatch();
  const sent = [];
  sent.push(net.act({ kind: 'fire', angle: 45, power: 50 }));
  net.toLobby();
  release();
  await at(sent, 0);
  await test('late-act-after-lobby-dropped', () => { assert.ok(seen.snapshots.length === 0, j(seen.snapshots.length)); });
  net.beginMatch();
  net.sendQuiet({ kind: 'aim', angle: 40, power: 50 });
  net.toLobby();
  release();
  await new Promise(r => setTimeout(r, 0));
  await test('late-quiet-act-after-lobby-dropped', () => { assert.ok(seen.snapshots.length === 0, j(seen.snapshots.length)); });
  net.beginMatch();
  net.setMenu(true);
  net.toLobby();
  release();
  await new Promise(r => setTimeout(r, 0));
  await test('late-menu-flag-after-lobby-dropped', () => { assert.ok(seen.snapshots.length === 0, j(seen.snapshots.length)); });
}

// ---- invite link ----
await test('invite-url', () => { assert.ok(inviteUrl('AB3D', { origin: 'https://host', pathname: '/games/tankity/' }) === 'https://host/games/tankity/?code=AB3D'); });
await test('invite-url-needs-a-code', () => { assert.ok(inviteUrl('', { origin: 'https://host', pathname: '/x' }) === ''); });
await test('invite-url-escapes-the-code', () => { assert.ok(inviteUrl('A&B', {}) === '?code=A%26B'); });

// Final standings name a human by the initials the server sends as `name`.
{
  const seats = fixture('play-after-fire').room.seats;
  const rows = standingsRows(seats, 0);
  await test('standings-name-the-human-by-initials', () => { assert.ok(at(rows, 0).name === 'ABC' && at(rows, 0).mine && at(rows, 0).score === 88, JSON.stringify(at(rows, 0))); });
  await test('standings-tag-drones-ai', () => { assert.ok(rows.some(r => r.name === 'REAPER (AI)' && !r.mine), JSON.stringify(rows)); });
  const flipped = standingsRows([...seats].reverse(), 0);
  await test('standings-best-first', () => { assert.ok(at(flipped, 0).name === 'ABC' && at(flipped, 0).mine, JSON.stringify(at(flipped, 0))); });
}


// ---- seats that survive the tab: resume, detach, mine ----
{
  const { net, host } = makeClient(() => roomReply({ phase: 'lobby' }));
  net.code = ''; net.token = ''; net.csrf = ''; net.seat = -1;
  const stored: StoredSeat = { code: 'FXT1', seat: 1, token: 'tok', csrf: 'c', initials: 'ZED', at: 1 };
  net.resume(stored);
  await test('resume-adopts-the-seat', () => { assert.ok(net.code === 'FXT1' && net.seat === 1 && net.token === 'tok' && net.csrf === 'c' && net.since === 0); });
  await net.getState();
  await test('resume-polls-with-the-stored-token', () => { assert.ok(at(host.log, 0).url.startsWith('rooms.php?action=state&code=FXT1&token=tok&'), at(host.log, 0).url); });
}
{
  const { net, host } = makeClient(() => roomReply({ phase: 'play' }));
  net.beginMatch();
  net.detach();
  await test('detach-stops-the-poll', () => { assert.ok(host.intervals.size === 0 && net.on === false); });
  await test('detach-tells-nobody', () => { assert.ok(host.beacons.length === 0 && host.log.length === 0); });
  await test('detach-clears-the-session', () => { assert.ok(net.code === '' && net.token === '' && net.seat === -1); });
}
{
  const { net, host } = makeClient(() => ok({ ok: true }));
  net.beginMatch();
  net.leave();
  await test('leave-still-beacons-once', () => { assert.ok(host.beacons.length === 1 && host.intervals.size === 0 && net.code === ''); });
}
{
  const reply = fixture('mine-reply');
  const { net, host, seen } = makeClient(() => ok(reply));
  const rows = await net.mine([{ code: 'FXT1', token: 'tok' }, { code: 'GONE', token: 't2' }]);
  const req = at(host.log, 0);
  await test('mine-posts-the-seats', () => { assert.ok(req.url === 'rooms.php?action=mine' && req.init.method === 'POST'
    && j(bodyOf(req)) === j({ seats: [{ code: 'FXT1', token: 'tok' }, { code: 'GONE', token: 't2' }] }), req.init.body); });
  await test('mine-returns-the-rows', () => { assert.ok(j(rows) === j(reply.rooms)); });
  const bad = makeClient(() => ({ status: 422, body: { ok: false, error: 'too many rooms at once' } }));
  let msg = '';
  try { await bad.net.mine([]); } catch (err) { msg = errorOf(err).message; }
  await test('mine-rejects-with-the-server-line', () => { assert.ok(msg === 'too many rooms at once', msg); });
}
{
  const { net } = makeClient(() => roomReply());
  await test('turn-secs-defaults-to-two-minutes', () => { assert.ok(net.turnSecs === 120); });
  net.apply(snap({ phase: 'play', events: [], seats: [], turnLeft: 500, shopLeft: null, turnSecs: 600 }));
  await test('turn-secs-from-the-snapshot', () => { assert.ok(net.turnSecs === 600, String(net.turnSecs)); });
  const lobby = makeClient(() => roomReply({ phase: 'lobby', turnSecs: 28800 }));
  await lobby.net.getState();
  await test('turn-secs-from-a-lobby-poll', () => { assert.ok(lobby.net.turnSecs === 28800, String(lobby.net.turnSecs)); });
}
// ---- the room's game speed: from every snapshot; a server or room from before it sends none (1×) ----
{
  const { net } = makeClient(() => roomReply());
  await test('speed-defaults-to-1x', () => { assert.equal(net.speed, 1); });
  net.apply(snap({ phase: 'play', events: [], seats: [], turnLeft: 500, shopLeft: null, speed: 4 }));
  await test('speed-from-the-snapshot', () => { assert.equal(net.speed, 4); });
  const old = snap({ phase: 'play', events: [], seats: [], turnLeft: 500, shopLeft: null }) as Partial<RoomSnapshot>;
  delete old.speed;
  net.apply(old as RoomSnapshot);
  await test('speed-missing-reads-1x', () => { assert.equal(net.speed, 1); });
  net.apply(snap({ phase: 'play', events: [], seats: [], turnLeft: 500, shopLeft: null, speed: 3 }));
  await test('speed-unknown-reads-1x', () => { assert.equal(net.speed, 1); });
}

// ---- the per-address hosting cap: its 429 is never retried and reads as the server says ----
{
  const line = 'too many rooms hosted from here; finish or leave one first';
  const capped = makeClient(() => ({ status: 429, body: { ok: false, error: line } }));
  let msg = '';
  try { await capped.net.host('ABC', '', 'tank', 'normal'); } catch (err) { msg = errorOf(err).message; }
  await test('host-cap-429-not-retried', () => { assert.ok(capped.host.log.length === 1 && msg === line, msg); });
  await test('host-cap-429-shown-as-sent', () => { assert.ok(prettyRoomError(new Error(msg)) === line); });
}

// ---- the room's closing time: closesIn, seconds from the reply, counted on the client's monotonic clock ----
{
  const { net, host } = makeClient(() => roomReply());
  net.on = true;
  // expiresAt says nothing useful against a wrong client clock; closesIn is what counts.
  net.apply(snap({ phase: 'play', events: [], seats: [], turnLeft: 86000, shopLeft: null, turnSecs: 86400, expiresAt: 5, closesIn: 600 }));
  await test('close-left-from-closes-in', () => { assert.ok(Math.abs(Number(net.closeClockLeft()) - 600) < 1e-9, String(net.closeClockLeft())); });
  host.clock += 60_000;
  await test('close-left-counts-down', () => { assert.ok(Math.abs(Number(net.closeClockLeft()) - 540) < 1e-9, String(net.closeClockLeft())); });
  net.apply(snap({ phase: 'play', events: [], seats: [], turnLeft: 86000, shopLeft: null, turnSecs: 86400 }));
  await test('close-left-missing-is-no-close', () => { assert.ok(net.closeClockLeft() === null); });
}

// ---- the watcher's ask never touches the room on screen: no dot flip, no forced full refetch ----
{
  const failing = makeClient(() => new Error('offline'));
  let threw = false;
  try { await failing.net.mine([{ code: 'FXT1', token: 'tok' }]); } catch (_) { threw = true; }
  await test('mine-failure-rejects', () => { assert.ok(threw); });
  await test('mine-failure-leaves-the-dot', () => { assert.ok(failing.seen.reachable.length === 0, JSON.stringify(failing.seen.reachable)); });
  await failing.net.getState().catch(() => {});
  await test('mine-failure-forces-no-full-fetch', () => { assert.ok(!at(failing.host.log, failing.host.log.length - 1).url.includes('full=1'), at(failing.host.log, failing.host.log.length - 1).url); });
  const fine = makeClient(() => ok(fixture('mine-reply')));
  await fine.net.mine([{ code: 'FXT1', token: 'tok' }]);
  await test('mine-success-leaves-the-dot', () => { assert.ok(fine.seen.reachable.length === 0, JSON.stringify(fine.seen.reachable)); });
}

// ---- a room that closed, or a seat given up elsewhere, stops the polls and says so ----
{
  const gone: [string, string][] = [];
  const host = makeHost(url => (url.includes('action=state') ? { status: 404, body: { ok: false, error: 'no such room' } } : roomReply()));
  const net = new RoomClient(host.env, { onReachable() {}, onSnapshot() {}, onReadyChange() {}, onError() {}, onGone: (c, why) => gone.push([c, why]) });
  net.code = 'FXT1'; net.token = 'tok'; net.seat = 0;
  net.beginMatch();
  at([...host.intervals.values()], 0).fn();
  await flush();
  await test('gone-room-detaches', () => { assert.ok(net.code === '' && net.on === false && host.intervals.size === 0); });
  await test('gone-room-reported', () => { assert.ok(j(gone) === j([['FXT1', 'closed']]), j(gone)); });
}
{
  // A room closed to make space says so to its own seats: the 404 carries why.
  const gone: [string, string][] = [];
  const host = makeHost(url => (url.includes('action=state') ? { status: 404, body: { ok: false, error: 'no such room', closed: 'space' } } : roomReply()));
  const net = new RoomClient(host.env, { onReachable() {}, onSnapshot() {}, onReadyChange() {}, onError() {}, onGone: (c, why) => gone.push([c, why]) });
  net.code = 'FXT1'; net.token = 'tok'; net.seat = 0;
  net.beginMatch();
  at([...host.intervals.values()], 0).fn();
  await flush();
  await test('closed-for-space-detaches-and-says-why', () => { assert.ok(net.code === '' && net.on === false && j(gone) === j([['FXT1', 'space']]), j(gone)); });
}
await test('gone-error-reason', () => {
  assert.equal(isGoneError(new Error('no such room')), 'closed');
  assert.equal(isGoneError(Object.assign(new Error('no such room'), { closed: 'space' })), 'space');
  assert.equal(isGoneError(new Error('offline')), null);
});
{
  const gone: [string, string][] = [];
  // The seat was given up in another tab: the server answers the room, but to no seat.
  const host = makeHost(() => roomReply({ phase: 'play', seats: [seatOf({ seat: 0, human: true, name: 'ABC' }), seatOf({ seat: 1, human: false, bot: true, name: 'ZED' })] }));
  const net = new RoomClient(host.env, { onReachable() {}, onSnapshot() {}, onReadyChange() {}, onError() {}, onGone: (c, why) => gone.push([c, why]) });
  net.code = 'FXT1'; net.token = 'tok'; net.seat = 1;
  net.beginMatch();
  at([...host.intervals.values()], 0).fn();
  await flush();
  await test('gone-seat-reported', () => { assert.ok(j(gone) === j([['FXT1', 'seat']]) && net.code === '', j(gone)); });
}
{
  // A plain network failure is not a closed room: the poll goes on.
  const gone: [string, string][] = [];
  const host = makeHost(() => new Error('offline'));
  const net = new RoomClient(host.env, { onReachable() {}, onSnapshot() {}, onReadyChange() {}, onError() {}, onGone: (c, why) => gone.push([c, why]) });
  net.code = 'FXT1'; net.token = 'tok'; net.seat = 0;
  net.beginMatch();
  at([...host.intervals.values()], 0).fn();
  await flush();
  await test('offline-is-not-gone', () => { assert.ok(gone.length === 0 && net.code === 'FXT1' && host.intervals.size === 1); });
  net.stopPolling();
}
