// websites/www.cs/games/_kit/test/stats.test.ts
// The visitor beacon: opt-outs send nothing, a view and its visible time, the visitor and visit IDs in
// storage (and without it), a framed game handing its events to the page around it, and track() before start.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { StatsEnv, SiteStats } from '../stats.ts';
import { startStats, track, tracker, STORE_KEY, BEAT_MS, VISIT_GAP_MS, GLOBAL, QUEUE, referrerHost } from '../stats.ts';
import { manualClock } from './clock.ts';
import type { StorageLike } from '../ports.ts';

type Sent = Record<string, unknown>;

function memoryStorage(): StorageLike & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: k => data.get(k) ?? null,
    setItem: (k, v) => { data.set(k, v); },
    removeItem: k => { data.delete(k); },
  };
}

function world(over: Partial<StatsEnv> = {}) {
  const t = manualClock();
  const sent: Sent[] = [];
  let visible = true;
  const watchers: ((v: boolean) => void)[] = [];
  let n = 0;
  const env: StatsEnv = {
    optedOut: () => false,
    automated: () => false,
    storage: memoryStorage(),
    now: () => 1_000_000 + t.clock.now(),
    randomHex: bytes => (++n).toString(16).padStart(bytes * 2, '0'),
    send: (url, body) => { assert.equal(url, '/stats/collect.php'); sent.push(JSON.parse(body) as Sent); },
    referrer: () => 'l.facebook.com',
    device: () => ({ tp: 5, sw: 390 }),
    visible: () => visible,
    onVisibility: cb => { watchers.push(cb); },
    parentStats: () => null,
    timers: t.timers,
    ...over,
  };
  return {
    env, sent, t,
    hide() { visible = false; for (const w of watchers) w(false); },
    show() { visible = true; for (const w of watchers) w(true); },
  };
}

const START = { page: 'crete', endpoint: '/stats/collect.php', views: true };

test('a page view carries the page, its IDs, the referring host and the device', () => {
  const w = world();
  startStats(w.env, START);
  assert.equal(w.sent.length, 1);
  const v = w.sent[0]!;
  assert.equal(v['t'], 'v');
  assert.equal(v['p'], 'crete');
  assert.match(String(v['pv']), /^[0-9a-f]{16}$/);
  assert.match(String(v['sid']), /^[0-9a-f]{16}$/);
  assert.match(String(v['vid']), /^[0-9a-f]{32}$/);
  assert.equal(v['r'], 'l.facebook.com');
  assert.equal(v['tp'], 5);
  assert.equal(v['sw'], 390);
});

for (const [why, over] of [
  ['Do Not Track or Global Privacy Control', { optedOut: () => true }],
  ['a browser driven by automation', { automated: () => true }],
] as const) {
  test(`${why} sends nothing, not even events`, () => {
    const w = world(over);
    const s = startStats(w.env, START);
    s.event('crete', 'hint');
    w.t.advance(BEAT_MS * 3);
    w.hide();
    assert.deepEqual(w.sent, []);
  });
}

test('time on the page counts only while it is in view, every beat and once more when hidden', () => {
  const w = world();
  startStats(w.env, START);
  const pv = w.sent[0]!['pv'];
  w.t.advance(BEAT_MS);
  assert.deepEqual(w.sent[1], { t: 's', p: 'crete', pv, sec: 30 });
  w.t.advance(5000);
  w.hide();
  assert.deepEqual(w.sent[2], { t: 's', p: 'crete', pv, sec: 35 });
  w.t.advance(BEAT_MS * 10);
  assert.equal(w.sent.length, 3, 'nothing while hidden');
  w.show();
  w.t.advance(BEAT_MS);
  assert.deepEqual(w.sent[3], { t: 's', p: 'crete', pv, sec: 65 });
});

test('the visitor ID stays; the visit ID changes after half an hour away', () => {
  const store = memoryStorage();
  const w = world({ storage: store });
  startStats(w.env, START);
  const first = w.sent[0]!;
  const w2 = world({ storage: store, now: () => 1_000_000 + 60_000 });
  startStats(w2.env, START);
  assert.equal(w2.sent[0]!['vid'], first['vid']);
  assert.equal(w2.sent[0]!['sid'], first['sid'], 'a minute later: the same visit');
  const w3 = world({ storage: store, now: () => 1_000_000 + 60_000 + VISIT_GAP_MS + 1 });
  startStats(w3.env, START);
  assert.equal(w3.sent[0]!['vid'], first['vid']);
  assert.notEqual(w3.sent[0]!['sid'], first['sid']);
  assert.ok(store.data.has(STORE_KEY));
});

test('blocked storage still counts the view, without a visitor ID', () => {
  const throwing: StorageLike = {
    getItem: () => { throw new Error('SecurityError'); },
    setItem: () => { throw new Error('SecurityError'); },
    removeItem: () => { throw new Error('SecurityError'); },
  };
  const w = world({ storage: throwing });
  const s = startStats(w.env, START);
  s.event('crete', 'hint');
  assert.equal(w.sent[0]!['vid'], null);
  assert.match(String(w.sent[0]!['sid']), /^[0-9a-f]{16}$/);
  assert.equal(w.sent[1]!['sid'], w.sent[0]!['sid'], 'one visit for the page load');
  const none = world({ storage: null });
  startStats(none.env, START);
  assert.equal(none.sent[0]!['vid'], null);
});

test('an event names its page, the visit and visitor, and its one property', () => {
  const w = world();
  const s = startStats(w.env, START);
  s.event('crete', 'level_start', '1-3');
  s.event('crete', 'hint');
  assert.deepEqual(w.sent[1], { t: 'e', p: 'crete', sid: w.sent[0]!['sid'], vid: w.sent[0]!['vid'], n: 'level_start', k: '1-3' });
  assert.equal('k' in w.sent[2]!, false);
});

test('a framed game hands its events to the page around it and sends nothing itself', () => {
  const got: unknown[][] = [];
  const parent: SiteStats = { event: (...a: unknown[]) => { got.push(a); } };
  const w = world({ parentStats: () => parent });
  const s = startStats(w.env, START);
  s.event('crete', 'level_win', '1-1');
  w.t.advance(BEAT_MS * 2);
  w.hide();
  assert.deepEqual(w.sent, []);
  assert.deepEqual(got, [['crete', 'level_win', '1-1']]);
});

test('a page that only forwards events sends no view', () => {
  const w = world();
  const s = startStats(w.env, { ...START, views: false });
  s.event('crete', 'share');
  assert.deepEqual(w.sent.map(m => m['t']), ['e']);
});

test('track() before the beacon starts is queued, then sent', () => {
  const g = globalThis as Record<string, unknown>;
  delete g[GLOBAL];
  delete g[QUEUE];
  track('crete', 'game_start', 'new');
  tracker('crete')('hint');
  const w = world();
  const s = startStats(w.env, START);
  g[GLOBAL] = s;
  assert.deepEqual(w.sent.slice(1).map(m => [m['n'], m['k']]), [['game_start', 'new'], ['hint', undefined]]);
  track('crete', 'auto');
  assert.equal(w.sent.at(-1)!['n'], 'auto');
  delete g[GLOBAL];
  delete g[QUEUE];
});

test('the referring host leaves the browser, never the path', () => {
  assert.equal(referrerHost('https://l.facebook.com/l.php?u=secret'), 'l.facebook.com');
  assert.equal(referrerHost(''), '');
  assert.equal(referrerHost('not a url'), '');
  assert.equal(referrerHost('android-app://com.google.android.gm/'), '');
});
