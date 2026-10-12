// The high-score client against a fake scores.php. Run here: `node scores-test.js`.
// js/scores.js (compiled from src/scores.ts) gets its fetch as an argument, so
// the fake server below answers it the way scores.php does: a GET gives the
// board, the config and a CSRF token; a POST op=start gives a run token; a POST
// op=score checks the run token and the initials.
import { createScoresClient, formatHighScoreRows, weeklyResetText } from './js/scores.js';

let failed = 0;
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${ok ? '' : ` :: ${detail}`}`);
  if (!ok) failed++;
};

function fakeServer(opts = {}) {
  const log = [];
  let allTime = opts.alltime ?? [{ initials: 'OLD', score: 40, at: '2026-08-01T12:00:00Z' }, { initials: 'AAA', score: 12, at: '2026-10-05T12:00:00Z' }];
  let board = opts.board ?? [{ initials: 'AAA', score: 12, at: '2026-10-05T12:00:00Z' }];
  const server = {
    log,
    get board() { return board; },
    fetch: async (url, init = {}) => {
      const body = init.body ? JSON.parse(init.body) : null;
      log.push({ method: init.method || 'GET', url, csrf: init.headers?.['X-Cylon-CSRF'], body });
      const reply = (status, data) => ({ ok: status >= 200 && status < 300, status, json: async () => { if (data === undefined) throw new Error('no body'); return data; } });
      if (opts.down) throw new TypeError('network down');
      if (!init.method) {
        return reply(200, { csrf: 'tok-1', alltime: allTime, config: { maxScores: 3, blockedInitials: ['bad', 'XX', 'nope1'], weekStartsOn: 'monday', timezone: 'America/Chicago' }, scores: board });
      }
      if (body.op === 'start') return reply(200, { run: 'run-1' });
      if (body.op === 'score') {
        if (body.run !== 'run-1') return reply(403, { error: 'bad run' });
        if (opts.rejectInitials) return reply(400, { error: 'invalid initials', scores: board });
        board = [...board, { initials: body.initials, score: body.score, at: '2026-10-10T12:00:00Z' }].sort((a, b) => b.score - a.score);
        allTime = [...allTime, { initials: body.initials, score: body.score, at: '2026-10-10T12:00:00Z' }].sort((a, b) => b.score - a.score).slice(0, 10);
        const place = allTime.map((e) => e.initials + e.score).lastIndexOf(body.initials + body.score) + 1;
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
  check('empty-before-loading', client.board().length === 0, '');
  const config = await client.load();
  check('load-returns-the-config', config && config.maxScores === 3, JSON.stringify(config));
  check('load-keeps-the-all-time-board', client.alltime().length === 2 && client.alltime()[0].initials === 'OLD', JSON.stringify(client.alltime()));
  check('load-keeps-the-board', client.board().length === 1 && client.board()[0].score === 12, '');
  check('blocked-initials-come-from-the-config', client.isBlocked('BAD') && client.isBlocked('bad') && client.isBlocked('XX') === false, '');
  check('malformed-blocked-entries-are-ignored', client.isBlocked('NOPE1') === false, '');
  await client.startRun();
  check('the-token-rides-later-calls', server.log[1].csrf === 'tok-1' && server.log[1].body.op === 'start', JSON.stringify(server.log));
  check('first-call-had-no-token', server.log[0].csrf === '', JSON.stringify(server.log[0]));
}

// A run that misses the all-time board has no all-time place; a server without one leaves the list empty.
{
  const client = createScoresClient('scores.php', { fetch: fakeServer({ alltime: Array.from({ length: 10 }, () => ({ initials: 'TOP', score: 99, at: '2026-08-01T12:00:00Z' })) }).fetch });
  await client.load();
  await client.startRun();
  const r = await client.submit(5, 'LOW', 0);
  check('a-run-off-the-all-time-board-has-no-place', r.saved && r.allTimeRank === null, JSON.stringify(r));
}

// The all-time place is the server's word, not a guess from the list.
{
  for (const [sent, want] of [[7, 7], [null, null], [0, null], ['2', null]]) {
    const client = createScoresClient('scores.php', { fetch: fakeServer({ alltimeRank: sent }).fetch });
    await client.load();
    await client.startRun();
    const r = await client.submit(20, 'abc', 0);
    check(`all-time-place-follows-the-server-${JSON.stringify(sent)}`, r.saved && r.allTimeRank === want, JSON.stringify(r));
  }
}

// The qualifying rule: open seats, else strictly above the lowest shown.
{
  const client = createScoresClient('scores.php', { fetch: fakeServer().fetch });
  await client.load(); // limit 3, one entry
  check('zero-never-qualifies', !client.qualifies(0), '');
  check('open-seat-qualifies-any-score', client.qualifies(1), '');
  const full = [{ score: 9 }, { score: 7 }, { score: 5 }];
  check('full-board-needs-strictly-more', !client.qualifies(5, full) && client.qualifies(6, full), '');
  check('default-limit-is-ten', createScoresClient('s', { fetch: fakeServer().fetch }).qualifies(1, Array.from({ length: 9 }, () => ({ score: 99 }))), '');
}

// Submitting.
{
  const server = fakeServer();
  const client = createScoresClient('scores.php', { fetch: server.fetch });
  await client.load();
  await client.startRun();
  const r = await client.submit(20, 'abc', 4);
  check('submit-saves', r.saved && r.problem === null, JSON.stringify(r));
  const post = server.log.at(-1).body;
  check('submit-sends-score-hits-initials-run', post.op === 'score' && post.score === 20 && post.hits === 4 && post.initials === 'ABC' && post.run === 'run-1', JSON.stringify(post));
  check('submit-reports-the-all-time-place', r.allTimeRank === 2, JSON.stringify(r));
  check('submit-adopts-the-new-all-time-board', client.alltime().map(e => e.score).join() === '40,20,12', JSON.stringify(client.alltime()));
  check('submit-adopts-the-new-board', client.board()[0].score === 20, JSON.stringify(client.board()));
  const again = await client.submit(21, 'abc', 4);
  check('a-run-token-is-single-use', !again.saved && again.problem === 'save-failed', JSON.stringify(again));
  check('initials-are-padded', (await (async () => { await client.startRun(); await client.submit(22, 'a', 0); return server.log.at(-1).body.initials; })()) === 'AAA', '');
}
{
  const server = fakeServer();
  const client = createScoresClient('scores.php', { fetch: server.fetch });
  await client.load();
  await client.startRun();
  const n = server.log.length;
  const blocked = await client.submit(5, 'bad', 0);
  check('blocked-initials-never-reach-the-server', !blocked.saved && blocked.problem === 'invalid-initials' && server.log.length === n, JSON.stringify(blocked));
  check('a-zero-score-is-not-submitted', (await client.submit(0, 'ABC', 0)).problem === null && server.log.length === n, '');
}
{
  const server = fakeServer({ rejectInitials: true });
  const client = createScoresClient('scores.php', { fetch: server.fetch });
  await client.load();
  await client.startRun();
  const r = await client.submit(5, 'ZZZ', 0);
  check('a-400-for-initials-is-reported', !r.saved && r.problem === 'invalid-initials', JSON.stringify(r));
}
{
  // No run token (the start call never succeeded): a clear problem, no POST.
  const server = fakeServer();
  const client = createScoresClient('scores.php', { fetch: server.fetch });
  await client.load();
  const n = server.log.length;
  const r = await client.submit(5, 'ZZZ', 0);
  check('no-run-token-is-save-failed', !r.saved && r.problem === 'save-failed' && server.log.length === n, JSON.stringify(r));
}
{
  const server = fakeServer({ down: true });
  const logged = [];
  const client = createScoresClient('scores.php', { fetch: server.fetch, log: (m) => logged.push(m) });
  check('load-when-down-is-null', (await client.load()) === null && client.board().length === 0, '');
  await client.startRun();
  check('start-run-when-down-is-logged-not-thrown', logged.length === 1, JSON.stringify(logged));
  check('submit-when-down-is-quiet', (await client.submit(5, 'ZZZ', 0)).problem === 'save-failed', '');
}

// A newer run replaces an older one's token: a late reply for the old run is dropped.
{
  const server = fakeServer();
  const client = createScoresClient('scores.php', { fetch: server.fetch });
  await client.load();
  const first = client.startRun();
  const second = client.startRun();
  await Promise.all([first, second]);
  check('two-starts-leave-a-usable-token', (await client.submit(3, 'AAA', 0)).saved, '');
}

// Text.
check('reset-text-sunday-central', weeklyResetText({ weekStartsOn: 'sunday', timezone: 'America/Chicago' }) === 'Play often — scores reset every Sunday at midnight Central.', weeklyResetText({ weekStartsOn: 'sunday', timezone: 'America/Chicago' }));
check('reset-text-monday-central', weeklyResetText({ weekStartsOn: 'monday', timezone: 'America/Chicago' }) === 'Play often — scores reset every Monday at midnight Central.', weeklyResetText({ weekStartsOn: 'monday', timezone: 'America/Chicago' }));
check('reset-text-sunday-other-zone', weeklyResetText({ weekStartsOn: 'sunday', timezone: 'UTC' }) === 'Play often — scores reset every Sunday at midnight UTC.', '');
check('empty-board-text', formatHighScoreRows([]) === '<li class="cylon-hs-empty">No scores yet</li>', '');
const rows = formatHighScoreRows([{ initials: 'abcdef', score: 9, at: 'not a date' }, { score: 4 }]);
check('rows-rank-initials-score', rows.includes('#1</span><strong class="cylon-hs-initials">ABC</strong>') && rows.includes('9 KOs') && rows.includes('#2'), rows);
check('rows-default-initials-and-empty-date', rows.includes('>AAA</strong>') && !rows.includes('Invalid'), rows);
check('rows-show-a-date', /cylon-hs-date">\w+ \d+, 2026</.test(formatHighScoreRows([{ initials: 'A', score: 1, at: '2026-10-05T12:00:00Z' }])), formatHighScoreRows([{ initials: 'A', score: 1, at: '2026-10-05T12:00:00Z' }]));

console.log(failed ? `SCORES-FAIL ${failed}` : 'SCORES-OK');
process.exit(failed ? 1 : 0);
