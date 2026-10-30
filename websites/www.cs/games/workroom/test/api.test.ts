// The page's API client: POSTs never overlap, each carries the token the last
// answer returned, a spent token is refreshed once, a lost session is SignedOut
// (read from the status, never the Content-Type), and limits are refusals.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NetworkError, NoKeyring, ServerError, SignedOut, UnreadableAnswer, createApi } from '../src/api.ts';
import type { Fetch } from '../src/load.ts';

type Init = Parameters<Fetch>[1];
const reply = (status: number, body: unknown, redirected = false, type = 'application/json') => ({
  ok: status >= 200 && status < 300, status, redirected, headers: { get: (n: string) => (n.toLowerCase() === 'content-type' ? type : null) },
  json: async () => body, text: async () => JSON.stringify(body), arrayBuffer: async () => new Uint8Array([7, 8, 9]).buffer,
});
const A = 'a'.repeat(32);
const B = 'b'.repeat(32);

test('POSTs go one at a time with the token the last one returned', async () => {
  const tokens: string[] = [];
  let inFlight = 0;
  let most = 0;
  let n = 0;
  const fetch: Fetch = async (_url, init?: Init) => {
    if (init?.method !== 'POST') return reply(200, {});
    inFlight++;
    most = Math.max(most, inFlight);
    tokens.push(init.headers?.['X-CSRF'] ?? '');
    await new Promise(r => setTimeout(r, 5));
    inFlight--;
    return reply(200, { deleted: 1, csrf: `t${++n}` });
  };
  const api = createApi(fetch, 't0');
  await Promise.all([api.remove(A), api.remove(B), api.removeAll()]);
  assert.deepEqual(tokens, ['t0', 't1', 't2']);
  assert.equal(most, 1);
});

test('deletes are form posts: one id, or all', async () => {
  const sent: string[] = [];
  const fetch: Fetch = async (url, init?: Init) => {
    sent.push(`${url} ${init?.headers?.['Content-Type']} ${new TextDecoder().decode(init?.body)}`);
    return reply(200, { deleted: 2, csrf: 'n' });
  };
  const api = createApi(fetch, 't');
  assert.equal(await api.remove(A), 2);
  assert.equal(await api.removeAll(), 2);
  assert.deepEqual(sent, [`delete.php application/x-www-form-urlencoded id=${A}`, 'delete.php application/x-www-form-urlencoded all=1']);
  await assert.rejects(api.remove('../etc'), /Not a note id/);
});

test('a spent token is refreshed once from csrf.php and the POST retried', async () => {
  const seen: string[] = [];
  const fetch: Fetch = async (url, init?: Init) => {
    if (url === 'csrf.php') return reply(200, { csrf: 'fresh' });
    seen.push(init?.headers?.['X-CSRF'] ?? '');
    return seen.length === 1 ? reply(403, { error: 'csrf' }) : reply(200, { deleted: 1, csrf: 'next' });
  };
  assert.equal(await createApi(fetch, 'stale').remove(A), 1);
  assert.deepEqual(seen, ['stale', 'fresh']);
});

test('a second refusal is not retried again', async () => {
  let posts = 0;
  const fetch: Fetch = async url => (url === 'csrf.php' ? reply(200, { csrf: 'fresh' }) : (posts++, reply(403, { error: 'csrf' })));
  await assert.rejects(createApi(fetch, 'x').remove(A), /403/);
  assert.equal(posts, 2);
});

test('a sign-in redirect, a 401 or a 403 other than the CSRF refusal is SignedOut, whatever the Content-Type', async () => {
  await assert.rejects(createApi(async () => reply(200, '<html>', true, 'text/html'), 'x').list(), SignedOut);
  await assert.rejects(createApi(async () => reply(401, { error: 'unauthorized' }, false, 'text/html'), 'x').list(), SignedOut);
  await assert.rejects(createApi(async () => reply(403, { error: 'cross_site' }), 'x').list(), SignedOut);
  await assert.rejects(createApi(async () => reply(200, '<html>', true, 'text/html'), 'x').upload(new Uint8Array(4)), SignedOut);
  await assert.rejects(createApi(async () => reply(500, { error: 'boom' }), 'x').list(), (e: unknown) => e instanceof ServerError && e.status === 500 && /500/.test(e.message));
});

test('the list keeps well-formed entries and reads JSON whatever its Content-Type', async () => {
  const fetch: Fetch = async () => reply(200, { notes: [{ id: A, size: 5, arrived_at: 1, picked_up_at: null }, { id: 'zz', size: 1, arrived_at: 1, picked_up_at: null }, null] }, false, 'text/plain');
  assert.deepEqual(await createApi(fetch, 'x').list(), { notes: [{ id: A, size: 5, arrived_at: 1, picked_up_at: null }], unreadable: 2 });
});

test('bytes() returns a note\'s octet-stream; a redirect is SignedOut; any other type is an error', async () => {
  const urls: string[] = [];
  const ok: Fetch = async url => { urls.push(url); return reply(200, null, false, 'application/octet-stream'); };
  assert.deepEqual([...(await createApi(ok, 'x').bytes(A))], [7, 8, 9]);
  assert.deepEqual(urls, [`note.php?id=${A}`]);
  await assert.rejects(createApi(async () => reply(200, '<html>', true, 'text/html'), 'x').bytes(A), SignedOut);
  await assert.rejects(createApi(async () => reply(200, '<html>', false, 'text/html'), 'x').bytes(A), (e: unknown) => e instanceof Error && !(e instanceof SignedOut) && /octet-stream/.test(e.message));
});

test('the keyring and the sign-in tag come from keyring.php; before the first upload there is none', async () => {
  const locked = { v: 1, kdf: 'PBKDF2-SHA-256', iterations: 600000, salt: 's', iv: 'i', ct: 'c' };
  const urls: string[] = [];
  const fetch: Fetch = async url => { urls.push(url); return urls.length === 1 ? reply(200, { keyring: locked, session: 'tag' }) : reply(404, { error: 'no_keyring' }); };
  const api = createApi(fetch, 'x');
  assert.deepEqual(await api.keyring(), { locked, session: 'tag' });
  await assert.rejects(api.keyring(), NoKeyring);
  assert.deepEqual(urls, ['keyring.php', 'keyring.php']);
});

test('uploadKeyring posts the three fields with the CSRF header', async () => {
  const locked = { v: 1 as const, kdf: 'PBKDF2-SHA-256' as const, iterations: 600000, salt: 's', iv: 'i', ct: 'c' };
  const current = 'f'.repeat(64);
  const sent: { url: string; init: Init }[] = [];
  let status = 201;
  const fetch: Fetch = async (url, init?: Init) => { sent.push({ url, init }); return reply(status, status === 201 ? { uploaded: true, csrf: 'next' } : { error: 'bad_keyring', csrf: 'next' }); };
  const api = createApi(fetch, 't0');
  await api.uploadKeyring(locked, current);
  assert.equal(sent.length, 1);
  assert.equal(sent[0]!.url, 'keyring.php');
  assert.equal(sent[0]!.init?.method, 'POST');
  assert.equal(sent[0]!.init?.headers?.['X-CSRF'], 't0');
  assert.equal(sent[0]!.init?.headers?.['Content-Type'], 'application/json');
  assert.deepEqual(JSON.parse(new TextDecoder().decode(sent[0]!.init?.body)), { keyring: locked, current, previous: [] });
  status = 422;
  await assert.rejects(api.uploadKeyring(locked, current), (e: unknown) => e instanceof ServerError && e.status === 422);
  assert.equal(sent[1]!.init?.headers?.['X-CSRF'], 'next', 'the next POST carries the token the last answer gave');
});

test('an upload is a raw octet-stream; limits come back as refusals, not errors', async () => {
  const types: string[] = [];
  let status = 201;
  let answer: unknown = { id: 'c'.repeat(32), csrf: 'n' };
  const fetch: Fetch = async (url, init?: Init) => { types.push(`${url} ${init?.headers?.['Content-Type']}`); return reply(status, answer); };
  const api = createApi(fetch, 'x');
  assert.deepEqual(await api.upload(new Uint8Array(4)), { kind: 'sent', id: 'c'.repeat(32) });
  assert.deepEqual(types, ['notes.php application/octet-stream']);
  for (const [s, reason] of [[413, 'too_large'], [409, 'full'], [422, 'bad_header'], [422, 'unknown_key'], [503, 'no_key']] as const) {
    status = s;
    answer = { error: reason, csrf: 'n' };
    assert.deepEqual(await api.upload(new Uint8Array(4)), { kind: 'refused', reason });
  }
  status = 500;
  answer = { error: 'storage' };
  await assert.rejects(api.upload(new Uint8Array(4)), /500/);
});

test('a row the list cannot read is counted, and the rows beside it still come', async () => {
  const rows = [{ id: A, size: 5, arrived_at: 1, picked_up_at: null }, { id: 'nope', size: 1, arrived_at: 2, picked_up_at: null }, null, { id: B, size: 'x', arrived_at: 3, picked_up_at: null }];
  const listed = await createApi(async () => reply(200, { notes: rows }), 'x').list();
  assert.deepEqual(listed.notes.map(n => n.id), [A]);
  assert.equal(listed.unreadable, 3);
});

test('an answer without the list, or without the keyring, is an unreadable answer, not an empty one', async () => {
  await assert.rejects(createApi(async () => reply(200, { notes: 'nope' }), 'x').list(), UnreadableAnswer);
  await assert.rejects(createApi(async () => reply(200, {}), 'x').list(), UnreadableAnswer);
  const page = { ...reply(200, null, false, 'text/html'), json: async () => { throw new SyntaxError('Unexpected token <'); } };
  await assert.rejects(createApi(async () => page, 'x').list(), UnreadableAnswer);
  assert.deepEqual((await createApi(async () => reply(200, { notes: [] }), 'x').list()), { notes: [], unreadable: 0 });
  await assert.rejects(createApi(async () => reply(200, {}), 'x').keyring(), UnreadableAnswer);
  await assert.rejects(createApi(async () => reply(200, { keyring: 'x' }), 'x').keyring(), UnreadableAnswer);
});

test('a fetch that rejects with a TypeError is a NetworkError (still a TypeError); any other rejection passes through', async () => {
  const down = createApi(async () => { throw new TypeError('Failed to fetch'); }, 'x');
  await assert.rejects(down.list(), (e: unknown) => e instanceof NetworkError && e instanceof TypeError);
  await assert.rejects(down.remove(A), NetworkError);
  await assert.rejects(down.bytes(A), NetworkError);
  const odd = new RangeError('odd');
  await assert.rejects(createApi(async () => { throw odd; }, 'x').list(), (e: unknown) => e === odd);
});
