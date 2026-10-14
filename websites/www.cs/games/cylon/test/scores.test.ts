// The high-score client against a fake scores.php.
// src/scores.ts gets its fetch as an argument, so
// the fake server below answers it the way scores.php does: a GET gives the
// board, the config and a CSRF token; a POST op=start gives a run token; a POST
// op=score checks the run token and the initials.
import { createScoresClient, highScoreRows, weeklyResetText } from '../src/scores.ts';
import type { ScoreEntry } from '../src/scores.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { last, nth } from './nth.ts';


interface FakeOptions {
  alltime?: ScoreEntry[];
  board?: ScoreEntry[];
  down?: boolean;
  rejectInitials?: boolean;
  /** What the server claims as the all-time place; deliberately any shape. */
  alltimeRank?: unknown;
}
/** The JSON body of a POST the client sent. */
interface SentBody { op: string; run?: string; initials: string; score: number; hits?: number }
interface LoggedCall { method: string; url: URL | RequestInfo; csrf: string | null; body: SentBody | null }

function fakeServer(opts: FakeOptions = {}) {
  const log: LoggedCall[] = [];
  let allTime = opts.alltime ?? [{ initials: 'OLD', score: 40, at: '2026-08-01T12:00:00Z' }, { initials: 'AAA', score: 12, at: '2026-10-05T12:00:00Z' }];
  let board = opts.board ?? [{ initials: 'AAA', score: 12, at: '2026-10-05T12:00:00Z' }];
  const server = {
    log,
    get board() { return board; },
    fetch: async (url: URL | RequestInfo, init: RequestInit = {}) => {
      const body: SentBody | null = typeof init.body === 'string' && init.body ? JSON.parse(init.body) : null;
      log.push({ method: init.method || 'GET', url, csrf: new Headers(init.headers).get('X-Cylon-CSRF'), body });
      // The client reads only ok, status and json(), so this stands in for a whole Response.
      const reply = (status: number, data: unknown) => ({ ok: status >= 200 && status < 300, status, json: async () => { if (data === undefined) throw new Error('no body'); return data; } }) as unknown as Response;
      if (opts.down) throw new TypeError('network down');
      if (!init.method) {
        return reply(200, { csrf: 'tok-1', alltime: allTime, config: { maxScores: 3, blockedInitials: ['bad', 'XX', 'nope1'], weekStartsOn: 'monday', timezone: 'America/Chicago' }, scores: board });
      }
      if (!body) throw new Error('a POST carries a body');
      if (body.op === 'start') return reply(200, { run: 'run-1' });
      if (body.op === 'score') {
        if (body.run !== 'run-1') return reply(403, { error: 'bad run' });
        if (opts.rejectInitials) return reply(400, { error: 'invalid initials', scores: board });
        board = [...board, { initials: body.initials, score: body.score, at: '2026-10-10T12:00:00Z' }].sort((a, b) => b.score - a.score);
        allTime = [...allTime, { initials: body.initials, score: body.score, at: '2026-10-10T12:00:00Z' }].sort((a, b) => b.score - a.score).slice(0, 10);
        const place = allTime.map((e) => `${e.initials}${e.score}`).lastIndexOf(body.initials + body.score) + 1;
        return reply(200, { scores: board, alltime: allTime, alltimeRank: 'alltimeRank' in opts ? opts.alltimeRank : (place || null) });
      }
      return reply(400, { error: 'unknown' });
    },
  };
  return server;
}

// Loading: the board, the config, the token every later call carries.
{
  const server = fakeServer();
  const client = createScoresClient('scores.php', { fetch: server.fetch });
  await test('empty-before-loading', () => { assert.ok(client.board().length === 0, ''); });
  const config = await client.load();
  await test('load-returns-the-config', () => { assert.ok(config && config.maxScores === 3, JSON.stringify(config)); });
  await test('load-keeps-the-all-time-board', () => { assert.ok(client.alltime().length === 2 && nth(client.alltime(), 0).initials === 'OLD', JSON.stringify(client.alltime())); });
  await test('load-keeps-the-board', () => { assert.ok(client.board().length === 1 && nth(client.board(), 0).score === 12, ''); });
  await test('blocked-initials-come-from-the-config', () => { assert.ok(client.isBlocked('BAD') && client.isBlocked('bad') && client.isBlocked('XX') === false, ''); });
  await test('malformed-blocked-entries-are-ignored', () => { assert.ok(client.isBlocked('NOPE1') === false, ''); });
  await client.startRun();
  await test('the-token-rides-later-calls', () => { const second = nth(server.log, 1); assert.ok(second.body); assert.ok(second.csrf === 'tok-1' && second.body.op === 'start', JSON.stringify(server.log)); });
  await test('first-call-had-no-token', () => { assert.ok(nth(server.log, 0).csrf === '', JSON.stringify(nth(server.log, 0))); });
}

// A run that misses the all-time board has no all-time place; a server without one leaves the list empty.
{
  const client = createScoresClient('scores.php', { fetch: fakeServer({ alltime: Array.from({ length: 10 }, () => ({ initials: 'TOP', score: 99, at: '2026-08-01T12:00:00Z' })) }).fetch });
  await client.load();
  await client.startRun();
  const r = await client.submit(5, 'LOW', 0);
  await test('a-run-off-the-all-time-board-has-no-place', () => { assert.ok(r.saved && r.allTimeRank === null, JSON.stringify(r)); });
}

// The all-time place is the server's word, not a guess from the list.
{
  for (const [sent, want] of [[7, 7], [null, null], [0, null], ['2', null]]) {
    const client = createScoresClient('scores.php', { fetch: fakeServer({ alltimeRank: sent }).fetch });
    await client.load();
    await client.startRun();
    const r = await client.submit(20, 'abc', 0);
    await test(`all-time-place-follows-the-server-${JSON.stringify(sent)}`, () => { assert.ok(r.saved && r.allTimeRank === want, JSON.stringify(r)); });
  }
}

// The qualifying rule: open seats, else strictly above the lowest shown.
{
  const client = createScoresClient('scores.php', { fetch: fakeServer().fetch });
  await client.load(); // limit 3, one entry
  await test('zero-never-qualifies', () => { assert.ok(!client.qualifies(0), ''); });
  await test('open-seat-qualifies-any-score', () => { assert.ok(client.qualifies(1), ''); });
  const full = [{ score: 9 }, { score: 7 }, { score: 5 }];
  await test('full-board-needs-strictly-more', () => { assert.ok(!client.qualifies(5, full) && client.qualifies(6, full), ''); });
  await test('default-limit-is-ten', () => { assert.ok(createScoresClient('s', { fetch: fakeServer().fetch }).qualifies(1, Array.from({ length: 9 }, () => ({ score: 99 }))), ''); });
}

// Submitting.
{
  const server = fakeServer();
  const client = createScoresClient('scores.php', { fetch: server.fetch });
  await client.load();
  await client.startRun();
  const r = await client.submit(20, 'abc', 4);
  await test('submit-saves', () => { assert.ok(r.saved && r.problem === null, JSON.stringify(r)); });
  const post = last(server.log).body;
  assert.ok(post);
  await test('submit-sends-score-hits-initials-run', () => { assert.ok(post.op === 'score' && post.score === 20 && post.hits === 4 && post.initials === 'ABC' && post.run === 'run-1', JSON.stringify(post)); });
  await test('submit-reports-the-all-time-place', () => { assert.ok(r.allTimeRank === 2, JSON.stringify(r)); });
  await test('submit-adopts-the-new-all-time-board', () => { assert.ok(client.alltime().map(e => e.score).join() === '40,20,12', JSON.stringify(client.alltime())); });
  await test('submit-adopts-the-new-board', () => { assert.ok(nth(client.board(), 0).score === 20, JSON.stringify(client.board())); });
  const again = await client.submit(21, 'abc', 4);
  await test('a-run-token-is-single-use', () => { assert.ok(!again.saved && again.problem === 'save-failed', JSON.stringify(again)); });
  await test('initials-are-padded', async () => { assert.ok((await (async () => { await client.startRun(); await client.submit(22, 'a', 0); const sent = last(server.log).body; assert.ok(sent); return sent.initials; })()) === 'AAA', ''); });
}
{
  const server = fakeServer();
  const client = createScoresClient('scores.php', { fetch: server.fetch });
  await client.load();
  await client.startRun();
  const n = server.log.length;
  const blocked = await client.submit(5, 'bad', 0);
  await test('blocked-initials-never-reach-the-server', () => { assert.ok(!blocked.saved && blocked.problem === 'invalid-initials' && server.log.length === n, JSON.stringify(blocked)); });
  await test('a-zero-score-is-not-submitted', async () => { assert.ok((await client.submit(0, 'ABC', 0)).problem === null && server.log.length === n, ''); });
}
{
  const server = fakeServer({ rejectInitials: true });
  const client = createScoresClient('scores.php', { fetch: server.fetch });
  await client.load();
  await client.startRun();
  const r = await client.submit(5, 'ZZZ', 0);
  await test('a-400-for-initials-is-reported', () => { assert.ok(!r.saved && r.problem === 'invalid-initials', JSON.stringify(r)); });
}
{
  // No run token (the start call never succeeded): a clear problem, no POST.
  const server = fakeServer();
  const client = createScoresClient('scores.php', { fetch: server.fetch });
  await client.load();
  const n = server.log.length;
  const r = await client.submit(5, 'ZZZ', 0);
  await test('no-run-token-is-save-failed', () => { assert.ok(!r.saved && r.problem === 'save-failed' && server.log.length === n, JSON.stringify(r)); });
}
{
  const server = fakeServer({ down: true });
  const logged: string[] = [];
  const client = createScoresClient('scores.php', { fetch: server.fetch, log: (m) => logged.push(m) });
  await test('load-when-down-is-null', async () => { assert.ok((await client.load()) === null && client.board().length === 0, ''); });
  await client.startRun();
  await test('start-run-when-down-is-logged-not-thrown', () => { assert.ok(logged.length === 1, JSON.stringify(logged)); });
  await test('submit-when-down-is-quiet', async () => { assert.ok((await client.submit(5, 'ZZZ', 0)).problem === 'save-failed', ''); });
}

// A newer run replaces an older one's token: a late reply for the old run is dropped.
{
  const server = fakeServer();
  const client = createScoresClient('scores.php', { fetch: server.fetch });
  await client.load();
  const first = client.startRun();
  const second = client.startRun();
  await Promise.all([first, second]);
  await test('two-starts-leave-a-usable-token', async () => { assert.ok((await client.submit(3, 'AAA', 0)).saved, ''); });
}

// Text.
await test('reset-text-sunday-central', () => { assert.ok(weeklyResetText({ weekStartsOn: 'sunday', timezone: 'America/Chicago' }) === 'Play often — scores reset every Sunday at midnight Central.', weeklyResetText({ weekStartsOn: 'sunday', timezone: 'America/Chicago' })); });
await test('reset-text-monday-central', () => { assert.ok(weeklyResetText({ weekStartsOn: 'monday', timezone: 'America/Chicago' }) === 'Play often — scores reset every Monday at midnight Central.', weeklyResetText({ weekStartsOn: 'monday', timezone: 'America/Chicago' })); });
await test('reset-text-sunday-other-zone', () => { assert.ok(weeklyResetText({ weekStartsOn: 'sunday', timezone: 'UTC' }) === 'Play often — scores reset every Sunday at midnight UTC.', ''); });
await test('empty-board-has-no-rows', () => { assert.ok(highScoreRows([]).length === 0, ''); });
const rows = highScoreRows([{ initials: 'abcdef', score: 9, at: 'not a date' }, { score: 4 }]);
await test('rows-rank-initials-score', () => { assert.ok(nth(rows, 0).rank === 1 && nth(rows, 0).initials === 'ABC' && nth(rows, 0).score === 9 && nth(rows, 1).rank === 2, JSON.stringify(rows)); });
await test('rows-default-initials-and-empty-date', () => { assert.ok(nth(rows, 1).initials === 'AAA' && nth(rows, 0).date === '' && nth(rows, 1).date === '', JSON.stringify(rows)); });
await test('rows-show-a-date', () => { assert.ok(/^\w+ \d+, 2026$/.test(nth(highScoreRows([{ initials: 'A', score: 1, at: '2026-10-05T12:00:00Z' }]), 0).date), JSON.stringify(highScoreRows([{ initials: 'A', score: 1, at: '2026-10-05T12:00:00Z' }]))); });
