// The room client without a browser or a server. Run here: `node net-test.js`.
// js/net.js (compiled from src/net.ts) takes its fetch, timers and clock as
// arguments, so every case below drives it with a fake server, fake timers and
// a clock the test moves by hand: the 429 retry, Ready's one-at-a-time ordering
// under rapid toggles, polling, the turn clock and the catch-up decision for a
// hidden tab. Replies come from protocol/*.json where a real shape matters.
import fs from 'node:fs';
import path from 'node:path';
import {
  RoomClient, prettyRoomError, inviteUrl, shouldCatchUp, planCatchUp, isVolleyOpener,
  MATCH_POLL_MS, LOBBY_POLL_MS, RETRY_429_MS, RETRY_429_TRIES,
} from './js/net.js';

const __dirname = import.meta.dirname;
const fixture = name => JSON.parse(fs.readFileSync(path.join(__dirname, 'protocol', name + '.json'), 'utf8')).body;

let failed = 0;
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${ok ? '' : ` :: ${detail}`}`);
  if (!ok) failed++;
};
const j = v => JSON.stringify(v);

/** A fake host. `respond(url, init)` returns a status and body (or a promise of
 * them) for each request; the log keeps every request as it was sent. */
function makeHost(respond) {
  const host = {
    log: [], delays: [], intervals: new Map(), nextId: 1, clock: 0, beacons: [], beaconTakes: true,
    inflight: 0, maxInflight: 0,
  };
  host.env = {
    async fetch(url, init) {
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
  };
  return host;
}
function makeClient(respond) {
  const host = makeHost(respond);
  const seen = { reachable: [], snapshots: [], ready: 0, errors: [] };
  const net = new RoomClient(host.env, {
    onReachable: up => seen.reachable.push(up),
    onSnapshot: (room, fresh, first) => seen.snapshots.push({ room, fresh, first }),
    onReadyChange: () => { seen.ready++; },
    onError: err => seen.errors.push(err),
  });
  net.code = 'FXT1'; net.token = 'tok'; net.csrf = 'csrf'; net.seat = 0;
  return { net, host, seen };
}
const ok = body => ({ status: 200, body });
const roomReply = (patch = {}) => ok({ ok: true, room: Object.assign({ phase: 'shop', events: [], seats: [], turnLeft: null, shopLeft: 90 }, patch) });
const flush = async () => { for (let i = 0; i < 20; i++) await new Promise(r => setImmediate(r)); };
const bodyOf = entry => JSON.parse(entry.init.body);

// ---- the wire ----
{
  const { net, host, seen } = makeClient(() => roomReply());
  await net.post('buy', { item: 'buck', qty: 2 });
  const req = host.log[0];
  check('wire-url-and-method', req.url === 'rooms.php?action=buy' && req.init.method === 'POST', req.url);
  check('wire-csrf-header', req.init.headers['X-CSRF-Token'] === 'csrf' && req.init.headers['Content-Type'] === 'application/json');
  check('wire-body-carries-the-seat', j(bodyOf(req)) === j({ code: 'FXT1', token: 'tok', csrf: 'csrf', item: 'buck', qty: 2 }), req.init.body);
  check('wire-reachable-on-success', j(seen.reachable) === '[true]', j(seen.reachable));

  const q = makeClient(() => roomReply());
  q.net.since = 7;
  await q.net.getState();
  check('wire-state-query', q.host.log[0].url === 'rooms.php?action=state&code=FXT1&token=tok&since=7', q.host.log[0].url);
}

// ---- the 429 retry: 180 ms, up to 3 times ----
{
  let n = 0;
  const { net, host } = makeClient(() => (++n <= 2 ? fixture('error-too-fast') && { status: 429, body: fixture('error-too-fast') } : roomReply()));
  const reply = await net.post('act', { kind: 'weapon', weapon: 'buck' });
  check('retry-429-then-success', !!reply.ok && host.log.length === 3, `requests ${host.log.length}`);
  check('retry-429-waits-180ms', j(host.delays) === j([RETRY_429_MS, RETRY_429_MS]) && RETRY_429_MS === 180, j(host.delays));

  const stuck = makeClient(() => ({ status: 429, body: fixture('error-too-fast') }));
  let msg = '';
  try { await stuck.net.post('act', { kind: 'weapon', weapon: 'buck' }); } catch (err) { msg = err.message; }
  check('retry-429-gives-up-after-3-retries', stuck.host.log.length === 1 + RETRY_429_TRIES && RETRY_429_TRIES === 3 && msg === 'too fast',
    `${stuck.host.log.length} requests, "${msg}"`);
  check('retry-429-error-reads-human', /Easy on the trigger/.test(prettyRoomError(new Error(msg))));
  check('retry-429-not-reachable-flip', j(stuck.seen.reachable) === '[]', j(stuck.seen.reachable));

  const other = makeClient(() => ({ status: 409, body: fixture('error-not-your-turn') }));
  let m2 = '';
  try { await other.net.post('act', { kind: 'fire' }); } catch (err) { m2 = err.message; }
  check('no-retry-on-other-errors', other.host.log.length === 1 && m2 === 'not your turn', `${other.host.log.length}, "${m2}"`);
}

// ---- transport trouble arrives in human words ----
{
  const gone = makeClient(() => new Error('connection refused'));
  let e1 = null;
  try { await gone.net.post('act', { kind: 'fire' }); } catch (err) { e1 = err; }
  check('down-unreachable', e1 && e1.roomDown === true && /Could not reach the room server/.test(e1.message), e1 && e1.message);
  check('down-flips-the-dot', j(gone.seen.reachable) === '[false]', j(gone.seen.reachable));

  const page = makeClient(() => ({ status: 200, page: true }));
  let e2 = null;
  try { await page.net.getState(); } catch (err) { e2 = err; }
  check('down-page-instead-of-data', e2 && /page instead of game data/.test(e2.message), e2 && e2.message);

  const stumble = makeClient(() => ({ status: 500, page: true }));
  let e3 = null;
  try { await stumble.net.getState(); } catch (err) { e3 = err; }
  check('down-stumble', e3 && /stumbled/.test(e3.message), e3 && e3.message);

  check('pretty-stale-session', /went stale/.test(prettyRoomError(new Error('bad csrf token'))) && /went stale/.test(prettyRoomError('bad seat token')));
  check('pretty-passthrough', prettyRoomError(new Error('short on cash')) === 'short on cash');
}

// ---- host and join ----
{
  const { net, host } = makeClient((url) => (/create/.test(url) ? ok(fixture('create-reply')) : ok(fixture('join-reply'))));
  net.since = 9; net.seats = [{}];
  await net.host('ABC', '', 'tank');
  check('host-takes-the-seat', net.code === 'FXT1' && net.seat === 0 && net.token === 'fixture-token-0' && net.csrf === 'fixture-csrf' && net.since === 0 && net.seats.length === 0,
    j({ c: net.code, s: net.seat, t: net.token, since: net.since }));
  check('host-sent-no-old-session', bodyOf(host.log[0]).code === '' && bodyOf(host.log[0]).token === '', host.log[0].init.body);
  await net.join(' fxt1 ', 'DEF', 'hover');
  check('join-uppercases-the-code', bodyOf(host.log[1]).code === 'FXT1' && net.seat === 1, host.log[1].init.body);
}

// ---- acts ----
{
  let release;
  const gate = new Promise(r => { release = r; });
  const { net, host } = makeClient(async () => { await gate; return roomReply({ phase: 'play' }); });
  net.on = true;
  const first = net.act({ kind: 'fire', angle: 60, power: 50 });
  const second = net.act({ kind: 'fire', angle: 61, power: 51 }); // dropped: one fire at a time
  release();
  await Promise.all([first, second]);
  check('act-one-at-a-time', host.log.length === 1, `requests ${host.log.length}`);

  const failing = makeClient(() => ({ status: 409, body: fixture('error-not-your-turn') }));
  let rejected = '';
  await failing.net.act({ kind: 'fire' }).catch(err => { rejected = err.message; });
  const again = failing.net.act({ kind: 'fire' }).catch(() => {});
  await again;
  check('act-rejects-and-frees-the-guard', rejected === 'not your turn' && failing.host.log.length === 2, `${rejected} / ${failing.host.log.length}`);

  const quiet = makeClient(() => ({ status: 409, body: fixture('error-not-your-turn') }));
  quiet.net.sendQuiet({ kind: 'aim', angle: 70, power: 40 });
  await flush();
  check('quiet-send-swallows-errors', quiet.seen.errors.length === 0 && quiet.host.log.length === 1);

  // The menu flag: once per change, and a failed send is retried by the next frame.
  let fail = true;
  const menu = makeClient(() => (fail ? { status: 500, page: true } : roomReply({ phase: 'play' })));
  menu.net.setMenu(true);
  menu.net.setMenu(true);
  await flush();
  check('menu-flag-sends-once', menu.host.log.length === 1 && bodyOf(menu.host.log[0]).kind === 'menu' && bodyOf(menu.host.log[0]).open === true);
  menu.net.setMenu(true);
  await flush();
  check('menu-flag-retries-after-a-failure', menu.host.log.length === 2, `requests ${menu.host.log.length}`);
  fail = false;
  menu.net.setMenu(true);
  await flush();
  menu.net.setMenu(false);
  await flush();
  check('menu-flag-closes', menu.host.log.length === 4 && bodyOf(menu.host.log[2]).open === true && bodyOf(menu.host.log[3]).open === false,
    menu.host.log.map(r => r.init.body).join(' '));
  const noRoom = makeClient(() => roomReply());
  noRoom.net.code = '';
  noRoom.net.setMenu(true);
  check('menu-flag-needs-a-room', noRoom.host.log.length === 0);
}

// ---- Ready: wanted state, one request at a time, in click order ----
{
  const gates = [];
  const { net, host, seen } = makeClient((url, init, i) => new Promise(resolve => {
    const want = JSON.parse(init.body).ready;
    gates[i] = () => resolve(roomReply({ seats: [{ seat: 0, human: true, ready: want }] }));
  }));
  net.on = true;
  net.seats = [{ seat: 0, human: true, ready: false }];
  net.setReady();            // asks for ready
  check('ready-shows-the-wish-at-once', net.readyNow() === true && seen.ready === 1);
  net.setReady();            // while the first is out: toggles to unready
  net.setReady();            // and back to ready
  check('ready-one-request-in-flight', host.log.length === 1 && host.maxInflight === 1, `requests ${host.log.length}`);
  gates[0]();
  await flush();
  net.seats = seen.snapshots[0].room.seats; // the page adopts the room's seats
  check('ready-wish-satisfied-sends-nothing-more', host.log.length === 1 && net.readyNow() === true, `requests ${host.log.length}`);
  check('ready-sent-wanted-state-not-a-flip', bodyOf(host.log[0]).ready === true);
  check('ready-reply-applied', seen.snapshots.length === 1);
  check('ready-sender-reports-done', seen.ready >= 2);
}
{
  const gates = [];
  const { net, host } = makeClient((url, init, i) => new Promise(resolve => {
    const want = JSON.parse(init.body).ready;
    gates[i] = () => resolve(roomReply({ seats: [{ seat: 0, human: true, ready: want }] }));
  }));
  net.on = true;
  net.seats = [{ seat: 0, human: true, ready: false }];
  net.setReady(true);
  net.setReady(false);       // the last wish differs from the one in flight
  gates[0]();
  await flush();
  check('ready-follow-up-goes-after-the-first-reply', host.log.length === 2 && bodyOf(host.log[1]).ready === false, `requests ${host.log.length}`);
  gates[1]();
  await flush();
  check('ready-requests-never-overlap', host.maxInflight === 1);
  check('ready-ends-on-the-last-click', net.readyNow() === false && host.log.map(r => bodyOf(r).ready).join() === 'true,false');
}
{
  // A failed send drops the wish, tells the page, and re-reads the room.
  let n = 0;
  const { net, host, seen } = makeClient((url) => (++n === 1 ? { status: 409, body: { error: 'shop is closed' } } : roomReply({ phase: 'play' })));
  net.on = true;
  net.setReady(true);
  await flush();
  check('ready-error-reaches-the-page', seen.errors.length === 1 && seen.errors[0].message === 'shop is closed');
  check('ready-error-drops-the-wish', net.readyNow() === false);
  check('ready-error-refreshes', host.log.length === 2 && /action=state/.test(host.log[1].url), host.log.map(r => r.url).join());
  net.setReady(true);
  await flush();
  check('ready-works-again-after-an-error', host.log.length >= 3 && /action=ready/.test(host.log[2].url));
}
{
  const { net } = makeClient(() => roomReply());
  net.on = true;
  net.setReady(true);
  net.dropReadyWish();
  net.seats = [{ ready: false }];
  net.seat = 0;
  check('ready-wish-dropped-outside-the-shop', net.readyNow() === false);
}

// ---- snapshots: the event cursor ----
{
  const { net, seen } = makeClient(() => roomReply());
  const room = fixture('play-after-fire').room;
  net.apply(room);
  const seqs = room.events.map(e => e.seq);
  check('apply-first-sync-gets-history', seen.snapshots.length === 1 && seen.snapshots[0].first === true && seen.snapshots[0].fresh.length === room.events.length);
  check('apply-cursor-moves-to-the-newest', net.since === Math.max(...seqs), `${net.since} vs ${Math.max(...seqs)}`);
  net.apply(room);
  check('apply-only-fresh-events', seen.snapshots[1].first === false && seen.snapshots[1].fresh.length === 0);
  const more = Object.assign({}, room, { events: [...room.events, { t: 'round', round: 2, wind: 1, seq: net.since + 1 }] });
  net.apply(more);
  check('apply-new-events-after-the-cursor', seen.snapshots[2].fresh.length === 1 && seen.snapshots[2].fresh[0].t === 'round');
  net.code = '';
  net.apply(room);
  check('apply-ignored-without-a-session', seen.snapshots.length === 3);
  net.code = 'FXT1';
  net.apply(null);
  check('apply-ignores-no-room', seen.snapshots.length === 3);
}

// ---- polling ----
{
  const { net, host, seen } = makeClient(() => roomReply({ phase: 'play', events: [{ t: 'round', round: 1, wind: 0, seq: 1 }] }));
  net.beginMatch();
  const [poll] = [...host.intervals.values()];
  check('match-poll-cadence', host.intervals.size === 1 && poll.ms === MATCH_POLL_MS && MATCH_POLL_MS === 1600, j([...host.intervals.values()].map(i => i.ms)));
  check('match-begins-clean', net.on === true && net.since === 0 && net.synced === false);
  poll.fn();
  await flush();
  check('match-poll-applies-the-room', seen.snapshots.length === 1 && seen.snapshots[0].first === true && net.since === 1);
  net.beginMatch();
  check('match-poll-never-doubles', host.intervals.size === 1);
  net.stopPolling();
  check('match-poll-stops', host.intervals.size === 0);

  // A match can start its cursor past events the lobby already told.
  const told = makeClient(() => roomReply({ phase: 'play', events: [
    { t: 'join', seat: 1, name: 'ZED', seq: 1 }, { t: 'round', round: 1, wind: 0, seq: 2 }] }));
  told.net.beginMatch(1);
  check('match-begins-past-the-lobby', told.net.since === 1 && told.net.synced === false);
  [...told.host.intervals.values()][0].fn();
  await flush();
  const fresh = told.seen.snapshots[0] ? told.seen.snapshots[0].fresh.map(e => e.t) : [];
  check('match-skips-what-the-lobby-told', fresh.join() === 'round', fresh.join());
  told.net.stopPolling();

  // A failing poll waits for the next one.
  const flaky = makeClient(() => new Error('offline'));
  flaky.net.beginMatch();
  [...flaky.host.intervals.values()][0].fn();
  await flush();
  check('match-poll-survives-a-failure', flaky.seen.snapshots.length === 0 && flaky.seen.reachable.includes(false));

  net.leave();
  check('leave-clears-the-session', net.code === '' && net.seat === -1 && net.token === '' && net.on === false && net.synced === false && host.intervals.size === 0);
}
{
  let visible = true;
  const { net, host } = makeClient(() => roomReply({ phase: 'lobby' }));
  const rooms = [];
  net.watchLobby(() => visible, room => rooms.push(room));
  const [tick] = [...host.intervals.values()];
  check('lobby-poll-cadence', tick.ms === LOBBY_POLL_MS && LOBBY_POLL_MS === 2000);
  tick.fn();
  await flush();
  check('lobby-poll-delivers-the-room', rooms.length === 1);
  visible = false;
  tick.fn();
  await flush();
  check('lobby-poll-stops-when-the-lobby-closes', host.intervals.size === 0 && rooms.length === 1);

  const m = makeClient(() => roomReply({ phase: 'lobby' }));
  m.net.watchLobby(() => true, () => {});
  m.net.on = true;
  [...m.host.intervals.values()][0].fn();
  check('lobby-poll-stops-once-a-match-runs', m.host.intervals.size === 0);

  const t = makeClient(() => roomReply({ phase: 'lobby' }));
  t.net.watchLobby(() => true, () => { throw new Error('render failed'); });
  [...t.host.intervals.values()][0].fn();
  await flush();
  check('lobby-poll-survives-a-bad-tick', t.host.intervals.size === 1);
}

// ---- leave beacon ----
{
  const { net, host } = makeClient(() => ok({ ok: true }));
  net.sendLeave();
  check('leave-beacon-first', host.beacons.length === 1 && host.log.length === 0 && j(JSON.parse(host.beacons[0].body)) === j({ code: 'FXT1', token: 'tok', csrf: 'csrf' }));
  host.beaconTakes = false;
  net.sendLeave();
  check('leave-falls-back-to-keepalive-fetch', host.log.length === 1 && host.log[0].init.keepalive === true && host.log[0].url === 'rooms.php?action=leave');
  net.token = '';
  net.sendLeave();
  check('leave-needs-a-seat', host.beacons.length === 2 && host.log.length === 1);
}

// ---- the clocks ----
{
  const { net, host } = makeClient(() => roomReply());
  net.on = true;
  host.clock = 1000;
  net.armClocks({ turnLeft: 40, shopLeft: null });
  check('clock-counts-down-locally', Math.abs(net.turnClockLeft() - 40) < 1e-9);
  host.clock = 1000 + 12_000;
  check('clock-ticks-with-the-host-clock', Math.abs(net.turnClockLeft() - 28) < 1e-9, String(net.turnClockLeft()));
  check('clock-warns-at-30-once', net.clockWarnDue() === true && net.clockWarnDue() === false);
  host.clock = 1000 + 100_000;
  check('clock-floors-at-zero-and-stops-warning', net.turnClockLeft() === 0 && net.clockWarnDue() === false);
  net.armClocks({ turnLeft: 119, shopLeft: null });
  check('clock-a-jump-up-is-a-new-turn', net.clockWarnDue() === false);
  host.clock += 90_000;
  check('clock-new-turn-warns-again', net.clockWarnDue() === true);
  net.armClocks({ turnLeft: null, shopLeft: 90 });
  check('clock-none-outside-a-turn', net.turnClockLeft() === null && net.clockWarnDue() === false);
  check('shop-clock', Math.abs(net.shopClockLeft() - 90) < 1e-9);
  host.clock += 30_000;
  check('shop-clock-counts-down', Math.abs(net.shopClockLeft() - 60) < 1e-9);
  net.on = false;
  check('clocks-silent-outside-a-match', net.turnClockLeft() === null && net.shopClockLeft() === null);
}

// ---- catching up a replay queue ----
{
  const op = (t, seat = 1) => ({ t, seat });
  const ev = t => ({ t });
  check('opener-kinds', ['fire', 'aifire', 'auto'].every(t => isVolleyOpener({ t })) && !isVolleyOpener({ t: 'hit' }) && !isVolleyOpener({ t: 'shot' }));

  check('catch-up-wanted-when-hidden', shouldCatchUp(true) === true);
  // A visible tab plays everything: a human's shot and the drones' answers
  // arrive in one reply, and none of them may be skipped.
  check('visible-tab-never-catches-up', shouldCatchUp(false) === false);

  const play = (turn) => ({ phase: 'play', turn });
  const queue = [op('fire', 0), ev('shot'), ev('hit'), op('aifire'), ev('shot'), op('aifire'), ev('shot'), ev('kill')];
  // Not our turn next: keep the newest volley, log everything before it.
  let plan = planCatchUp(queue, false, play(2), 0);
  check('plan-keeps-the-newest-volley', plan && plan.cut === 5 && plan.fastNext === true, j(plan));
  // Our turn next: skip them all, hand over the controls.
  plan = planCatchUp(queue, false, play(0), 0);
  check('plan-skips-all-when-it-is-our-turn', plan && plan.cut === queue.length && plan.fastNext === false, j(plan));
  // One waiting volley and nothing on screen: nothing to skip.
  check('plan-nothing-to-skip', planCatchUp([op('fire'), ev('shot')], false, play(2), 0) === null);
  // The volley on screen counts as waiting.
  plan = planCatchUp([op('aifire'), ev('shot')], true, play(2), 0);
  check('plan-counts-the-playing-volley', plan && plan.cut === 0 && plan.fastNext === true, j(plan));
  plan = planCatchUp([ev('hit')], true, play(0), 0);
  check('plan-playing-volley-skipped-when-our-turn', plan && plan.cut === 1 && plan.fastNext === false, j(plan));
  check('plan-no-waiting-room-keeps-one', planCatchUp([op('fire'), op('aifire')], false, null, 0).cut === 1);
  check('plan-other-phase-is-not-our-turn', planCatchUp([op('fire')], false, { phase: 'shop', turn: null }, 0) === null);
}

// ---- invite link ----
check('invite-url', inviteUrl('AB3D', { origin: 'https://host', pathname: '/games/tankity/' }) === 'https://host/games/tankity/?code=AB3D');
check('invite-url-needs-a-code', inviteUrl('', { origin: 'https://host', pathname: '/x' }) === '');
check('invite-url-escapes-the-code', inviteUrl('A&B', {}) === '?code=A%26B');

if (failed) { console.log(`\n${failed} check(s) failed`); process.exit(1); }
console.log('\nNET-OK');
