// Sending a solo run (src/solo-file.ts): GET for the CSRF token, start, every
// round in order, then file; offline runs wait in storage and go on later; a
// voided or expired run is dropped; a busy or rate-limited server never costs
// an honest run a try.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { memoryStorage, throwingStorage } from '../../_kit/test/record.ts';
import { createFiler, PENDING_KEY, MAX_TRIES } from '../src/solo-file.ts';

const claim = end => ({ end, score: 100, cash: 700, lives: end === 'matchLost' ? 0 : 3, roundsWon: 0 });
const round = (n, end = 'tankLost') => ({ n, buys: [], shots: [{ w: 'shell', a: 45, p: 50, x: 100 }], claim: claim(end) });
const reply = (status, body) => ({ ok: status >= 200 && status < 300, status, json: async () => body });

/** A score server; `answer(op, body)` may override a reply (null: the honest one). */
function server(answer = () => null) {
  const calls = [];
  const fetch = async (url, init = {}) => {
    const body = init.body ? JSON.parse(init.body) : null;
    calls.push({ method: init.method || 'GET', op: body ? body.op : null, n: body && body.n ? body.n : null, w: body && body.w, run: body && body.run, csrf: init.headers && init.headers['X-Tankity-Csrf'] });
    if (!init.method) {
      const over = answer('csrf', null);
      return over ? reply(over[0], over[1]) : reply(200, { scores: [], csrf: 'tok' });
    }
    const over = answer(body.op, body);
    if (over) return reply(over[0], over[1]);
    if (body.op === 'start') return reply(200, { ok: true, run: 'r'.repeat(32) });
    if (body.op === 'round') return reply(200, { ok: true, n: body.n, ...body.claim });
    return reply(200, { ok: true, score: 100, roundsWon: 0, rank: 7, difficulty: 'hard' });
  };
  return { fetch, calls };
}
const ops = s => s.calls.filter(c => c.op).map(c => c.op + (c.n ? c.n : ''));

function played(f, id = 'a') {
  f.begin(id, 'seed-1', 'hard', 1200);
  f.round(id, round(1));
  f.round(id, round(2, 'matchLost'));
  f.finish(id, 'ABC');
}

test('a run goes start, rounds in order, file, with the CSRF header', async () => {
  const s = server();
  const f = createFiler({ fetch: s.fetch, storage: memoryStorage() });
  played(f);
  assert.deepEqual(await f.flush(), [{ id: 'a', kind: 'filed', score: 100, rank: 7, difficulty: 'hard' }]);
  assert.deepEqual(s.calls.map(c => [c.method, c.op, c.n]), [['GET', null, null], ['POST', 'start', null], ['POST', 'round', 1], ['POST', 'round', 2], ['POST', 'file', null]]);
  assert.equal(s.calls.find(c => c.op === 'start').w, 1200, 'the run starts at the width it was dealt');
  assert.ok(s.calls.slice(1).every(c => c.csrf === 'tok'));
  assert.equal(f.waiting(), 0);
});

test('rounds go as they end; a run still being played answers nothing', async () => {
  const s = server();
  const f = createFiler({ fetch: s.fetch, storage: memoryStorage() });
  f.begin('p', 'seed-1', 'normal', 720);
  f.round('p', round(1));
  assert.deepEqual(await f.flush(), []);
  assert.deepEqual(ops(s), ['start', 'round1']);
  f.round('p', round(2));
  await f.flush();
  assert.deepEqual(ops(s), ['start', 'round1', 'round2'], 'the run is started once');
});

test('offline: the run waits in storage and goes on with the next try', async () => {
  const storage = memoryStorage();
  const down = createFiler({ fetch: async () => { throw new Error('offline'); }, storage });
  played(down, 'b');
  assert.deepEqual(await down.flush(), [{ id: 'b', kind: 'waiting' }]);
  assert.match(storage.data.get(PENDING_KEY), /"id":"b"/);
  const later = createFiler({ fetch: server().fetch, storage });
  assert.equal((await later.flush())[0].kind, 'filed');
  assert.equal(later.waiting(), 0);
});

test('a reload mid-run goes on from the round the server last took, without a second start', async () => {
  const storage = memoryStorage();
  const s = server();
  const one = createFiler({ fetch: s.fetch, storage });
  one.begin('m', 'seed-1', 'normal', 720);
  one.round('m', round(1));
  await one.flush();
  const reloaded = createFiler({ fetch: s.fetch, storage });
  assert.equal(reloaded.waiting(), 1);
  reloaded.round('m', round(2, 'matchLost'));
  reloaded.finish('m', 'XYZ');
  assert.equal((await reloaded.flush())[0].kind, 'filed');
  assert.deepEqual(ops(s), ['start', 'round1', 'round2', 'file']);
  assert.equal(s.calls.filter(c => c.op === 'round' || c.op === 'file').every(c => c.run === 'r'.repeat(32)), true);
});

test('every refusal drops the run, with the end card words', async () => {
  const cases = [
    ['round', 422, { error: 'void', why: 'mismatch' }, 'the server played that round differently'],
    ['round', 409, { error: 'void' }, 'the server played a round differently'],
    ['round', 410, { error: 'expired' }, 'it waited too long to reach the score server'],
    ['round', 404, { error: 'no such run' }, 'the score server no longer has it'],
    ['start', 422, { error: 'a printable seed' }, 'a printable seed'],
    ['start', 400, { error: 'invalid json' }, 'invalid json'],
    ['round', 413, { error: 'too large' }, 'too large'],
    ['file', 400, { error: 'invalid run' }, 'invalid run'],
    ['file', 422, { error: 'initials must be 3 letters, kept clean' }, 'initials must be 3 letters, kept clean'],
    ['file', 409, { error: 'void' }, 'the server played a round differently'],
    ['file', 410, { error: 'expired' }, 'it waited too long to reach the score server'],
  ];
  for (const [op, status, body, why] of cases) {
    const f = createFiler({ fetch: server(o => o === op ? [status, body] : null).fetch, storage: memoryStorage() });
    played(f, 'c');
    assert.deepEqual(await f.flush(), [{ id: 'c', kind: 'refused', why }], `${op} ${status}`);
    assert.equal(f.waiting(), 0);
  }
});

test('a void run is dropped at once, mid-game too', async () => {
  const s = server(op => op === 'round' ? [422, { error: 'void', why: 'mismatch' }] : null);
  const f = createFiler({ fetch: s.fetch, storage: memoryStorage() });
  f.begin('c', 'seed-1', 'normal', 720);
  f.round('c', round(1));
  assert.deepEqual(await f.flush(), [{ id: 'c', kind: 'refused', why: 'the server played that round differently' }]);
  assert.equal(f.waiting(), 0);
  f.round('c', round(2));
  f.finish('c', 'ABC');
  assert.equal(f.waiting(), 0, 'rounds of a dropped run are not kept');
});

test('a round the server already has is skipped, not resent', async () => {
  const s = server((op, body) => op === 'round' && body.n === 1 ? [409, { error: 'out of order', round: 1 }] : null);
  const f = createFiler({ fetch: s.fetch, storage: memoryStorage() });
  played(f, 'e');
  assert.equal((await f.flush())[0].kind, 'filed');
  assert.deepEqual(s.calls.filter(c => c.op === 'round').map(c => c.n), [1, 2]);
});

test('a server that is behind (out of order, an earlier round) spends a try, not a skip', async () => {
  const s = server(op => op === 'round' ? [409, { error: 'out of order', round: 0 }] : null);
  const f = createFiler({ fetch: s.fetch, storage: memoryStorage() });
  played(f, 'o');
  assert.deepEqual(await f.flush(), [{ id: 'o', kind: 'waiting' }]);
  assert.equal(s.calls.filter(c => c.op === 'file').length, 0, 'never files with rounds unsent');
});

test('429 and 503 wait for ever without spending a try (a busy NAT never drops a run)', async () => {
  for (const [status, body] of [[429, { error: 'rate' }], [503, { error: 'busy' }], [503, { error: 'store unavailable' }]]) {
    for (const op of ['start', 'round', 'file']) {
      let down = true;
      const s = server(o => down && o === op ? [status, body] : null);
      const f = createFiler({ fetch: s.fetch, storage: memoryStorage() });
      played(f, 'n');
      for (let i = 0; i < MAX_TRIES * 3; i++) assert.deepEqual(await f.flush(), [{ id: 'n', kind: 'waiting' }], `${op} ${status} try ${i}`);
      down = false;
      assert.equal((await f.flush())[0].kind, 'filed', 'and it files once the server lets it');
      assert.deepEqual(s.calls.filter(c => c.op === 'file').length > 0, true);
    }
  }
});

test('a rate-limited csrf fetch or network failure also wait for ever', async () => {
  for (const mode of ['429', '503', 'throw']) {
    let down = true;
    const inner = server();
    const fetch = async (url, init) => {
      if (down) {
        if (mode === 'throw') throw new Error('offline');
        return reply(Number(mode), { error: 'x' });
      }
      return inner.fetch(url, init);
    };
    const f = createFiler({ fetch, storage: memoryStorage() });
    played(f, 'w');
    for (let i = 0; i < MAX_TRIES * 2; i++) assert.deepEqual(await f.flush(), [{ id: 'w', kind: 'waiting' }]);
    down = false;
    assert.equal((await f.flush())[0].kind, 'filed');
  }
});

test('a 429 stops the pass: no further requests go to a server that said wait', async () => {
  const s = server(op => op === 'round' ? [429, { error: 'rate' }] : null);
  const f = createFiler({ fetch: s.fetch, storage: memoryStorage() });
  played(f, 'x');
  played(f, 'y');
  const out = await f.flush();
  assert.deepEqual(out, [{ id: 'x', kind: 'waiting' }, { id: 'y', kind: 'waiting' }]);
  assert.deepEqual(ops(s), ['start', 'round1'], 'one start, one refused round, then the pass stops');
});

test('backoff grows while the server says wait, and resets after progress', async () => {
  let mode = 'busy';
  const s = server(op => mode === 'busy' && op === 'round' ? [429, { error: 'rate' }] : null);
  const f = createFiler({ fetch: s.fetch, storage: memoryStorage() });
  const start = f.backoff();
  played(f, 'k');
  const seen = [];
  for (let i = 0; i < 12; i++) { await f.flush(); seen.push(f.backoff()); }
  assert.ok(seen[0] > start || seen[0] >= 1000);
  for (let i = 1; i < seen.length; i++) assert.ok(seen[i] >= seen[i - 1], 'never shrinks while waiting');
  assert.ok(seen[seen.length - 1] <= 5 * 60 * 1000, 'capped at five minutes');
  assert.ok(seen[seen.length - 1] > seen[0]);
  mode = 'ok';
  await f.flush();
  assert.equal(f.backoff(), start);
});

test('a run the server keeps failing (500) is dropped after MAX_TRIES tries', async () => {
  const s = server(op => op === 'file' ? [500, { error: 'store unavailable' }] : null);
  const f = createFiler({ fetch: s.fetch, storage: memoryStorage() });
  played(f, 'g');
  for (let i = 1; i < MAX_TRIES; i++) assert.equal((await f.flush())[0].kind, 'waiting');
  assert.equal((await f.flush())[0].kind, 'refused');
  assert.equal(f.waiting(), 0);
});

test('an unreadable reply spends a try; 403 too', async () => {
  for (const over of [[200, null], [200, { ok: false }], [403, { error: 'forbidden' }]]) {
    const f = createFiler({ fetch: server(op => op === 'file' ? over : null).fetch, storage: memoryStorage() });
    played(f, 'u');
    for (let i = 1; i < MAX_TRIES; i++) assert.equal((await f.flush())[0].kind, 'waiting');
    assert.equal((await f.flush())[0].kind, 'refused');
  }
});

test('tries count in a row: progress clears them', async () => {
  let fail = 0;
  const s = server(op => op === 'round' && fail > 0 && fail-- ? [500, {}] : null);
  const f = createFiler({ fetch: s.fetch, storage: memoryStorage() });
  played(f, 'z');
  fail = MAX_TRIES - 1;
  for (let i = 1; i < MAX_TRIES; i++) assert.equal((await f.flush())[0].kind, 'waiting');
  assert.equal((await f.flush())[0].kind, 'filed', 'the next try went through');
});

test('no duplicate filing: a lost reply is retried against the same run and files once', async () => {
  let lose = true;
  const inner = server();
  const filed = [];
  const fetch = async (url, init = {}) => {
    const res = await inner.fetch(url, init);
    const body = init.body && JSON.parse(init.body);
    if (body && body.op === 'file') {
      filed.push(body.run);
      if (lose) { lose = false; throw new Error('reply lost'); }
    }
    return res;
  };
  const f = createFiler({ fetch, storage: memoryStorage() });
  played(f, 'd');
  assert.deepEqual(await f.flush(), [{ id: 'd', kind: 'waiting' }]);
  assert.equal((await f.flush())[0].kind, 'filed');
  assert.equal(inner.calls.filter(c => c.op === 'start').length, 1, 'the retry does not start another run');
  assert.deepEqual(filed, ['r'.repeat(32), 'r'.repeat(32)], 'both tries name the same run');
  assert.deepEqual(await f.flush(), [], 'a filed run is gone and never filed again');
  assert.equal(inner.calls.filter(c => c.op === 'file').length, 2);
});

test('an expired run is dropped', async () => {
  const s = server(op => op === 'round' ? [410, { error: 'expired' }] : null);
  const f = createFiler({ fetch: s.fetch, storage: memoryStorage() });
  played(f, 'd');
  assert.deepEqual(await f.flush(), [{ id: 'd', kind: 'refused', why: 'it waited too long to reach the score server' }]);
});

test('two flushes at once send each round once', async () => {
  const s = server();
  const f = createFiler({ fetch: s.fetch, storage: memoryStorage() });
  played(f, 'h');
  await Promise.all([f.flush(), f.flush()]);
  assert.equal(s.calls.filter(c => c.op === 'round').length, 2);
  assert.equal(s.calls.filter(c => c.op === 'file').length, 1);
});

test('blocked storage still files the run in hand', async () => {
  for (const storage of [null, throwingStorage()]) {
    const f = createFiler({ fetch: server().fetch, storage });
    played(f, 'i');
    assert.equal((await f.flush())[0].kind, 'filed');
  }
});

test('storage holding junk is ignored, and at most PENDING_MAX runs are kept', async () => {
  const storage = memoryStorage({ [PENDING_KEY]: '{not json' });
  const f = createFiler({ fetch: server().fetch, storage });
  assert.equal(f.waiting(), 0);
  for (const id of ['1', '2', '3', '4']) f.begin(id, 'seed-1', 'normal', 720);
  assert.equal(f.waiting(), 3);
});

test('a run is not started on the server until it has a round to send', async () => {
  const s = server();
  const f = createFiler({ fetch: s.fetch, storage: memoryStorage() });
  f.begin('q', 'seed-1', 'normal', 720);
  assert.deepEqual(await f.flush(), []);
  assert.deepEqual(ops(s), [], 'dealt but not yet played: nothing is held open on the server');
  f.round('q', round(1));
  await f.flush();
  assert.deepEqual(ops(s), ['start', 'round1']);
});
