// Sending a solo run (src/solo-file.ts): GET for the CSRF token, start, every
// round in order, then file; offline runs wait in storage and go on later; a
// voided run is dropped, an expired one starts again; a busy or rate-limited
// server never costs an honest run a try, and a failing one only backed-off tries.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { memoryStorage, throwingStorage } from '../../_kit/test/record.ts';
import { createFiler, PENDING_KEY, PENDING_MAX, MAX_TRIES, MAX_RESTARTS, BACKOFF_FIRST, BACKOFF_MAX } from '../src/solo-file.ts';

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

/** A filer on a clock the test moves; `again()` waits out nextTry() and flushes. */
function make(fetch, storage = memoryStorage(), rng = () => 0.5) {
  const clock = { t: 1_000_000, now: () => clock.t };
  const f = createFiler({ fetch, storage, clock, rng });
  f.clock = clock;
  f.again = () => { clock.t += f.nextTry() ?? 0; return f.flush(); };
  return f;
}

function played(f, id = 'a') {
  f.begin(id, 'seed-1', 'hard', 1200);
  f.round(id, round(1));
  f.round(id, round(2, 'matchLost'));
  f.finish(id, 'ABC');
}


const R = 'r'.repeat(32);

test('a run goes start, rounds in order, file, with the CSRF header', async () => {
  const s = server();
  const f = make(s.fetch);
  played(f);
  assert.deepEqual(await f.flush(), [{ id: 'a', kind: 'filed', score: 100, rank: 7, difficulty: 'hard' }]);
  assert.deepEqual(s.calls.map(c => [c.method, c.op, c.n]), [['GET', null, null], ['POST', 'start', null], ['POST', 'round', 1], ['POST', 'round', 2], ['POST', 'file', null]]);
  assert.equal(s.calls.find(c => c.op === 'start').w, 1200, 'the run starts at the width it was dealt');
  assert.ok(s.calls.slice(1).every(c => c.csrf === 'tok'));
  assert.equal(f.waiting(), 0);
  assert.equal(f.nextTry(), null, 'nothing left to send');
});

test('rounds go as they end; a run still being played answers nothing', async () => {
  const s = server();
  const f = make(s.fetch);
  f.begin('p', 'seed-1', 'normal', 720);
  f.round('p', round(1));
  assert.equal(f.nextTry(), 0);
  assert.deepEqual(await f.flush(), []);
  assert.deepEqual(ops(s), ['start', 'round1']);
  assert.equal(f.nextTry(), null, 'all sent and not over: no retry is armed');
  f.round('p', round(2));
  await f.flush();
  assert.deepEqual(ops(s), ['start', 'round1', 'round2'], 'the run is started once');
});

test('nothing due: flush makes no request at all, not even the CSRF GET', async () => {
  const s = server();
  const f = make(s.fetch);
  f.begin('p', 'seed-1', 'normal', 720);
  f.round('p', round(1));
  await f.flush();
  const before = s.calls.length;
  assert.deepEqual(await f.flush(), []);
  assert.equal(s.calls.length, before);
});

test('offline: the run waits in storage and goes on with the next try', async () => {
  const storage = memoryStorage();
  const down = make(async () => { throw new Error('offline'); }, storage);
  played(down, 'b');
  assert.deepEqual(await down.flush(), [{ id: 'b', kind: 'waiting' }]);
  assert.match(storage.data.get(PENDING_KEY), /"id":"b"/);
  const later = make(server().fetch, storage);
  assert.equal((await later.flush())[0].kind, 'filed');
  assert.equal(later.waiting(), 0);
});

test('a reload mid-run goes on from the round the server last took, without a second start', async () => {
  const storage = memoryStorage();
  const s = server();
  const one = make(s.fetch, storage);
  one.begin('m', 'seed-1', 'normal', 720);
  one.round('m', round(1));
  await one.flush();
  const reloaded = make(s.fetch, storage);
  assert.equal(reloaded.waiting(), 1);
  reloaded.round('m', round(2, 'matchLost'));
  reloaded.finish('m', 'XYZ');
  assert.equal((await reloaded.flush())[0].kind, 'filed');
  assert.deepEqual(ops(s), ['start', 'round1', 'round2', 'file']);
  assert.ok(s.calls.filter(c => c.op === 'round' || c.op === 'file').every(c => c.run === R));
});

test('every refusal drops the run with player words; the server text is kept as detail', async () => {
  const cases = [
    ['round', 422, { error: 'void', why: 'mismatch' }, 'the server played that round differently'],
    ['round', 409, { error: 'void' }, 'the server played a round differently'],
    ['start', 422, { error: 'a printable seed' }, 'the score server would not take it'],
    ['start', 400, { error: 'invalid json' }, 'the score server could not read it'],
    ['start', 410, { error: 'expired' }, 'it waited too long to reach the score server'],
    ['round', 413, { error: 'too large' }, 'it was too big to send'],
    ['file', 400, { error: 'invalid run' }, 'the score server could not read it'],
    ['file', 422, { error: 'initials must be 3 letters, kept clean' }, 'the score server would not take those initials'],
    ['file', 409, { error: 'void' }, 'the server played a round differently'],
  ];
  for (const [op, status, body, why] of cases) {
    const s = server(o => o === op ? [status, body] : null);
    const f = make(s.fetch);
    played(f, 'c');
    assert.deepEqual(await f.flush(), [{ id: 'c', kind: 'refused', why, detail: body.error }], `${op} ${status}`);
    assert.equal(f.waiting(), 0);
    assert.equal(s.calls.filter(c => c.op === 'start').length, 1, `${op} ${status}: never restarted`);
  }
});

test('a void run is dropped at once, mid-game too, and never restarted', async () => {
  const s = server(op => op === 'round' ? [422, { error: 'void', why: 'mismatch' }] : null);
  const f = make(s.fetch);
  f.begin('c', 'seed-1', 'normal', 720);
  f.round('c', round(1));
  assert.deepEqual(await f.flush(), [{ id: 'c', kind: 'refused', why: 'the server played that round differently', detail: 'void' }]);
  assert.equal(f.waiting(), 0);
  f.round('c', round(2));
  f.finish('c', 'ABC');
  assert.equal(f.waiting(), 0, 'rounds of a dropped run are not kept');
  assert.deepEqual(ops(s), ['start', 'round1']);
});

test('a round the server already has is skipped, not resent', async () => {
  const s = server((op, body) => op === 'round' && body.n === 1 ? [409, { error: 'out of order', round: 1 }] : null);
  const f = make(s.fetch);
  played(f, 'e');
  assert.equal((await f.flush())[0].kind, 'filed');
  assert.deepEqual(s.calls.filter(c => c.op === 'round').map(c => c.n), [1, 2]);
});

test('a server that is behind (out of order, an earlier round) spends a try, not a skip', async () => {
  const s = server(op => op === 'round' ? [409, { error: 'out of order', round: 0 }] : null);
  const f = make(s.fetch);
  played(f, 'o');
  assert.deepEqual(await f.flush(), [{ id: 'o', kind: 'waiting' }]);
  assert.equal(s.calls.filter(c => c.op === 'file').length, 0, 'never files with rounds unsent');
});

test('429 and 503 wait for ever without spending a try (a busy NAT never drops a run)', async () => {
  for (const [status, body] of [[429, { error: 'rate' }], [503, { error: 'busy' }], [503, { error: 'store unavailable' }]]) {
    for (const op of ['start', 'round', 'file']) {
      let down = true;
      const s = server(o => down && o === op ? [status, body] : null);
      const f = make(s.fetch);
      played(f, 'n');
      for (let i = 0; i < MAX_TRIES * 3; i++) assert.deepEqual(await f.again(), [{ id: 'n', kind: 'waiting' }], `${op} ${status} try ${i}`);
      down = false;
      assert.equal((await f.again())[0].kind, 'filed', 'and it files once the server lets it');
      assert.equal(s.calls.filter(c => c.op === 'file').length > 0, true);
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
    const f = make(fetch);
    played(f, 'w');
    for (let i = 0; i < MAX_TRIES * 2; i++) assert.deepEqual(await f.again(), [{ id: 'w', kind: 'waiting' }]);
    down = false;
    assert.equal((await f.again())[0].kind, 'filed');
  }
});

test('a 429 stops the pass: no further requests go to a server that said wait', async () => {
  const s = server(op => op === 'round' ? [429, { error: 'rate' }] : null);
  const f = make(s.fetch);
  played(f, 'x');
  played(f, 'y');
  const out = await f.flush();
  assert.deepEqual(out, [{ id: 'x', kind: 'waiting' }, { id: 'y', kind: 'waiting' }]);
  assert.deepEqual(ops(s), ['start', 'round1'], 'one start, one refused round, then the pass stops');
});

test('before nextTry() has passed, flush sends nothing', async () => {
  const s = server(op => op === 'round' ? [429, { error: 'rate' }] : null);
  const f = make(s.fetch);
  played(f, 'x');
  await f.flush();
  const before = s.calls.length;
  f.clock.t += f.nextTry() - 1;
  assert.deepEqual(await f.flush(), [{ id: 'x', kind: 'waiting' }]);
  assert.equal(s.calls.length, before, 'no GET, no POST while backing off');
  f.clock.t += 1;
  await f.flush();
  assert.ok(s.calls.length > before);
});

test('nextTry grows from BACKOFF_FIRST to BACKOFF_MAX while the server says wait, and resets after progress', async () => {
  let mode = 'busy';
  const s = server(op => mode === 'busy' && op === 'round' ? [429, { error: 'rate' }] : null);
  const f = make(s.fetch);
  played(f, 'k');
  assert.equal(f.nextTry(), 0);
  const seen = [];
  for (let i = 0; i < 12; i++) { await f.again(); seen.push(f.nextTry()); }
  assert.deepEqual(seen.slice(0, 4), [BACKOFF_FIRST, 2 * BACKOFF_FIRST, 4 * BACKOFF_FIRST, 8 * BACKOFF_FIRST]);
  assert.equal(seen.at(-1), BACKOFF_MAX, 'capped at five minutes');
  mode = 'ok';
  await f.again();
  assert.equal(f.nextTry(), null, 'filed: nothing left');
  played(f, 'k2');
  assert.equal(f.nextTry(), 0, 'a clean pass leaves no pause');
});

test('the pause is jittered by a quarter either way, and the cap still holds', async () => {
  for (const [r, factor] of [[0, 0.75], [1, 1.25]]) {
    const f = make(server(op => op === 'round' ? [429, {}] : null).fetch, memoryStorage(), () => r);
    played(f, 'j');
    await f.flush();
    assert.equal(f.nextTry(), BACKOFF_FIRST * factor);
    for (let i = 0; i < 12; i++) await f.again();
    assert.ok(f.nextTry() <= BACKOFF_MAX);
  }
});

test('failing passes back off too: four in a row give a growing pause', async () => {
  const f = make(server(op => op === 'file' ? [500, {}] : null).fetch);
  played(f, 'g');
  const seen = [];
  for (let i = 0; i < 4; i++) { await f.again(); seen.push(f.nextTry()); }
  assert.ok(seen[0] > 0);
  for (let i = 1; i < seen.length; i++) assert.ok(seen[i] > seen[i - 1], `pause ${i} grows: ${seen}`);
});

test('a 30 s outage of 500s, flushed as often as the caller likes, never drops the run', async () => {
  let down = true;
  const s = server(op => down && op === 'round' ? [500, {}] : null);
  const f = make(s.fetch);
  played(f, 'h');
  const start = f.clock.t;
  while (f.clock.t - start < 30_000) {
    assert.equal((await f.flush())[0].kind, 'waiting');
    f.clock.t += 100;
  }
  down = false;
  assert.equal((await f.again())[0].kind, 'filed');
});

test('a run the server keeps failing (500) is dropped after MAX_TRIES backed-off tries, minutes apart', async () => {
  const s = server(op => op === 'file' ? [500, { error: 'store unavailable' }] : null);
  const f = make(s.fetch);
  played(f, 'g');
  const start = f.clock.t;
  for (let i = 1; i < MAX_TRIES; i++) assert.equal((await f.again())[0].kind, 'waiting');
  assert.deepEqual(await f.again(), [{ id: 'g', kind: 'refused', why: 'the score server kept failing' }]);
  assert.ok(f.clock.t - start >= 3 * 60 * 1000, 'only after minutes of failing');
  assert.equal(f.waiting(), 0);
  assert.equal(s.calls.filter(c => c.op === 'file').length, MAX_TRIES);
});

test('an unreadable reply spends a try; 403 too', async () => {
  for (const over of [[200, null], [200, { ok: false }], [403, { error: 'forbidden' }]]) {
    const f = make(server(op => op === 'file' ? over : null).fetch);
    played(f, 'u');
    for (let i = 1; i < MAX_TRIES; i++) assert.equal((await f.again())[0].kind, 'waiting');
    assert.equal((await f.again())[0].kind, 'refused');
  }
});

test('tries count in a row: progress clears them', async () => {
  let fail = 0;
  const s = server(op => op === 'round' && fail > 0 && fail-- ? [500, {}] : null);
  const f = make(s.fetch);
  played(f, 'z');
  fail = MAX_TRIES - 1;
  for (let i = 1; i < MAX_TRIES; i++) assert.equal((await f.again())[0].kind, 'waiting');
  assert.equal((await f.again())[0].kind, 'filed', 'the next try went through');
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
  const f = make(fetch);
  played(f, 'd');
  assert.deepEqual(await f.flush(), [{ id: 'd', kind: 'waiting' }]);
  assert.equal((await f.again())[0].kind, 'filed');
  assert.equal(inner.calls.filter(c => c.op === 'start').length, 1, 'the retry does not start another run');
  assert.deepEqual(filed, [R, R], 'both tries name the same run');
  assert.deepEqual(await f.again(), [], 'a filed run is gone and never filed again');
  assert.equal(inner.calls.filter(c => c.op === 'file').length, 2);
});

test('expired on round 3: a new start replays rounds 1, 2, 3 and files once', async () => {
  let expire = true;
  let starts = 0;
  const inner = server();
  const fetch = async (url, init = {}) => {
    const body = init.body && JSON.parse(init.body);
    if (body && body.op === 'start') return reply(200, { ok: true, run: String(++starts).repeat(32) });
    if (body && body.op === 'round' && body.n === 3 && expire) { expire = false; inner.calls.push({ op: 'round', n: 3 }); return reply(410, { error: 'expired' }); }
    return inner.fetch(url, init);
  };
  const f = make(fetch);
  f.begin('t', 'seed-1', 'hard', 1200);
  for (const n of [1, 2, 3]) f.round('t', round(n, n === 3 ? 'matchLost' : 'tankLost'));
  f.finish('t', 'ABC');
  assert.equal((await f.flush())[0].kind, 'filed', 'in the same pass, no try spent');
  assert.deepEqual(ops(inner), ['round1', 'round2', 'round3', 'round1', 'round2', 'round3', 'file']);
  assert.equal(starts, 2);
  assert.ok(inner.calls.filter(c => c.op === 'file').every(c => c.run === '2'.repeat(32)), 'filed against the new run');
});

test('404 on round 1 (an unplayed run the server let go) starts again', async () => {
  let lost = true;
  const s = server((op, body) => op === 'round' && body.n === 1 && lost ? (lost = false, [404, { error: 'no such run' }]) : null);
  const f = make(s.fetch);
  played(f, 'u1');
  assert.equal((await f.flush())[0].kind, 'filed');
  assert.deepEqual(ops(s), ['start', 'round1', 'start', 'round1', 'round2', 'file']);
});

test('410 on the first file request starts again; restarts spend no tries', async () => {
  let gone = true;
  const s = server(op => op === 'file' && gone ? (gone = false, [410, { error: 'expired' }]) : null);
  const f = make(s.fetch);
  played(f, 'f1');
  assert.equal((await f.flush())[0].kind, 'filed');
  assert.deepEqual(ops(s), ['start', 'round1', 'round2', 'file', 'start', 'round1', 'round2', 'file']);
});

test('a 410/404 on file after a lost reply: no restart, and not "not filed"', async () => {
  for (const status of [410, 404]) {
    let lose = true;
    const s = server(op => op === 'file' ? [status, { error: 'x' }] : null);
    const fetch = async (url, init = {}) => {
      const body = init.body && JSON.parse(init.body);
      if (body && body.op === 'file' && lose) { lose = false; throw new Error('reply lost'); }
      return s.fetch(url, init);
    };
    const f = make(fetch);
    played(f, 'l');
    assert.deepEqual(await f.flush(), [{ id: 'l', kind: 'waiting' }]);
    assert.deepEqual(await f.again(), [{ id: 'l', kind: 'sent' }], `${status}`);
    assert.equal(s.calls.filter(c => c.op === 'start').length, 1, 'never started again');
    assert.equal(f.waiting(), 0);
  }
});

test('the filing flag survives a reload', async () => {
  const storage = memoryStorage();
  const lost = async (url, init = {}) => {
    const body = init.body && JSON.parse(init.body);
    if (body && body.op === 'file') throw new Error('reply lost');
    return server().fetch(url, init);
  };
  const one = make(lost, storage);
  played(one, 'l');
  await one.flush();
  const s = server(op => op === 'file' ? [410, { error: 'expired' }] : null);
  const two = make(s.fetch, storage);
  assert.deepEqual(await two.flush(), [{ id: 'l', kind: 'sent' }]);
  assert.deepEqual(ops(s), ['file']);
});

test(`restarts are capped at MAX_RESTARTS (${MAX_RESTARTS})`, async () => {
  const s = server(op => op === 'round' ? [404, { error: 'no such run' }] : null);
  const f = make(s.fetch);
  played(f, 'cap');
  assert.deepEqual(await f.flush(), [{ id: 'cap', kind: 'refused', why: 'the score server kept losing it', detail: 'no such run' }]);
  assert.equal(s.calls.filter(c => c.op === 'start').length, MAX_RESTARTS + 1);
  assert.equal(f.waiting(), 0);
});

test('a restart that meets 429 waits like any other start, keeping every round', async () => {
  let phase = 'expire';
  const s = server(op => {
    if (phase === 'expire' && op === 'round') { phase = 'busy'; return [410, { error: 'expired' }]; }
    if (phase === 'busy' && op === 'start') return [429, {}];
    return null;
  });
  const f = make(s.fetch);
  played(f, 'rb');
  assert.deepEqual(await f.flush(), [{ id: 'rb', kind: 'waiting' }]);
  phase = 'ok';
  assert.equal((await f.again())[0].kind, 'filed');
  assert.deepEqual(ops(s), ['start', 'round1', 'start', 'start', 'round1', 'round2', 'file']);
});

test('two flushes at once send each round once', async () => {
  const s = server();
  const f = make(s.fetch);
  played(f, 'h');
  await Promise.all([f.flush(), f.flush()]);
  assert.equal(s.calls.filter(c => c.op === 'round').length, 2);
  assert.equal(s.calls.filter(c => c.op === 'file').length, 1);
});

test('a round added while a flush of the same run is in flight goes in order, once', async () => {
  let release;
  const gate = new Promise(r => { release = r; });
  const s = server();
  const fetch = async (url, init = {}) => {
    const body = init.body && JSON.parse(init.body);
    if (body && body.op === 'round' && body.n === 1) await gate;
    return s.fetch(url, init);
  };
  const f = make(fetch);
  f.begin('fl', 'seed-1', 'normal', 720);
  f.round('fl', round(1));
  const pass = f.flush();
  await new Promise(r => setTimeout(r, 0));
  f.round('fl', round(2, 'matchLost'));
  f.finish('fl', 'ABC');
  release();
  assert.deepEqual((await pass).map(o => o.kind), ['filed']);
  assert.deepEqual(ops(s), ['start', 'round1', 'round2', 'file']);
});

test('blocked storage still files the run in hand, and says it is not stored', async () => {
  for (const storage of [null, throwingStorage()]) {
    const f = make(server().fetch, storage);
    played(f, 'i');
    assert.equal(f.stored(), false);
    assert.equal((await f.flush())[0].kind, 'filed');
  }
});

test('a full storage quota: the run is kept for this page and stored() says so', async () => {
  const storage = memoryStorage();
  const f = make(server(() => [429, {}]).fetch, storage);
  played(f, 'q1');
  assert.equal(f.stored(), true);
  storage.setItem = () => { throw new Error('QuotaExceededError'); };
  f.round('q1', round(3));
  assert.equal(f.stored(), false);
  assert.equal(f.waiting(), 1);
});

test('storage holding junk is ignored', async () => {
  const f = make(server().fetch, memoryStorage({ [PENDING_KEY]: '{not json' }));
  assert.equal(f.waiting(), 0);
  played(f, 'j');
  assert.equal((await f.flush())[0].kind, 'filed');
});

test('begin with an id already held is refused and keeps that run and its rounds', () => {
  const storage = memoryStorage();
  const f = make(server().fetch, storage);
  played(f, 'dup');
  const before = storage.data.get(PENDING_KEY);
  assert.equal(f.begin('dup', 'seed-2', 'easy', 720), false);
  assert.equal(storage.data.get(PENDING_KEY), before);
  assert.equal(f.waiting(), 1);
});

test('begin with the id of a run filed here is refused too', async () => {
  const f = make(server().fetch);
  played(f, 'once');
  await f.flush();
  assert.equal(f.begin('once', 'seed-1', 'hard', 1200), false);
  assert.equal(f.waiting(), 0);
});

test('a full queue of finished runs refuses a new one and keeps all of them', () => {
  const storage = memoryStorage();
  const f = make(async () => { throw new Error('offline'); }, storage);
  for (let i = 0; i < PENDING_MAX; i++) played(f, `done${i}`);
  assert.equal(f.begin('new', 'seed-1', 'normal', 720), false);
  const ids = JSON.parse(storage.data.get(PENDING_KEY)).map(r => r.id);
  assert.deepEqual(ids, Array.from({ length: PENDING_MAX }, (_, i) => `done${i}`));
});

test('a full queue evicts an abandoned run (no initials, not being played here), never a finished one', () => {
  const storage = memoryStorage();
  const old = make(async () => { throw new Error('offline'); }, storage);
  old.begin('left', 'seed-1', 'normal', 720);
  old.round('left', round(1));
  for (let i = 1; i < PENDING_MAX; i++) played(old, `done${i}`);
  const f = make(async () => { throw new Error('offline'); }, storage); // a reload: 'left' can never finish
  assert.equal(f.begin('new', 'seed-1', 'normal', 720), true);
  const ids = JSON.parse(storage.data.get(PENDING_KEY)).map(r => r.id);
  assert.deepEqual(ids, [...Array.from({ length: PENDING_MAX - 1 }, (_, i) => `done${i + 1}`), 'new']);
});

test('the run being played here is not evicted', () => {
  const f = make(async () => { throw new Error('offline'); });
  f.begin('mine', 'seed-1', 'normal', 720);
  for (let i = 1; i < PENDING_MAX; i++) played(f, `done${i}`);
  assert.equal(f.begin('new', 'seed-1', 'normal', 720), false);
  assert.equal(f.waiting(), PENDING_MAX);
});

test('drop lets go of a run that will not finish, never a finished one', async () => {
  const s = server();
  const f = make(s.fetch);
  f.begin('quit', 'seed-1', 'normal', 720);
  f.round('quit', round(1));
  played(f, 'kept');
  assert.equal(f.drop('quit'), true);
  assert.equal(f.drop('kept'), false, 'a finished score is never dropped');
  assert.equal(f.drop('nobody'), false);
  assert.deepEqual((await f.flush()).map(o => o.id), ['kept']);
  assert.equal(s.calls.filter(c => c.op === 'start').length, 1, 'the dropped run never started');
});

test('two tabs on one storage keep each other\'s runs', async () => {
  const storage = memoryStorage();
  const offline = async () => { throw new Error('offline'); };
  const a = make(offline, storage);
  const b = make(offline, storage);
  played(a, 'X');
  b.begin('Y', 'seed-1', 'normal', 720);
  b.round('Y', round(1));
  const ids = () => JSON.parse(storage.data.get(PENDING_KEY)).map(r => r.id).sort();
  assert.deepEqual(ids(), ['X', 'Y']);
  a.round('X', round(3)); // A saves again: Y must survive
  assert.deepEqual(ids(), ['X', 'Y']);
  const s = server();
  const c = make(s.fetch, storage);
  assert.deepEqual((await c.flush()).map(o => o.kind), ['filed']);
  assert.deepEqual(ids(), ['Y']);
});

test('a run another tab filed is not sent again from this one', async () => {
  const storage = memoryStorage();
  const s = server();
  const a = make(async () => { throw new Error('offline'); }, storage);
  played(a, 'X');
  await a.flush();
  const b = make(s.fetch, storage);
  assert.equal((await b.flush())[0].kind, 'filed');
  a.clock.t += 10 * 60 * 1000;
  assert.deepEqual(await a.flush(), [], 'A sees it gone');
  assert.equal(s.calls.filter(c => c.op === 'file').length, 1);
});

test('a run is not started on the server until it has a round to send', async () => {
  const s = server();
  const f = make(s.fetch);
  f.begin('q', 'seed-1', 'normal', 720);
  assert.equal(f.nextTry(), null);
  assert.deepEqual(await f.flush(), []);
  assert.deepEqual(ops(s), [], 'dealt but not yet played: nothing is held open on the server');
  f.round('q', round(1));
  await f.flush();
  assert.deepEqual(ops(s), ['start', 'round1']);
});
