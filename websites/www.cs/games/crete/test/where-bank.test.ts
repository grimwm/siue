// Where the shared bank keeps its levels (tools/where-bank.ts): the trusted-where post and its token, the checks on
// the answer, the printed report, and what it reads into it (a bank in php-fpm's private /var/tmp, data/ in a group
// PHP is not in, a bank that began just after php-fpm started).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { askWhere, readings, utc, whereLines, whereOf } from '../tools/where-bank.ts';
import type { Folder, Where } from '../tools/where-bank.ts';
import { trustedPoster } from '../tools/bank-post.ts';
import { TOKEN_HEADER } from '../tools/verify-bank.ts';

const TOKEN = 'tok_Test-verifier_0123456789abcdefXYZ';
const START = 1_794_157_200; // 2026-11-08T17:00:00Z

function folder(over: Partial<Folder> = {}): Folder {
  return {
    path: '/var/tmp/acct-crete-bank', exists: true, link: false, writable: true, mode: '0700', uid: 48, gid: 48, parentGid: 0,
    ctime: START + 3600, mtime: START + 3600, holdsBank: true, born: { at: START + 1560, kind: 'vartmp' },
    grades: {
      easy: { served: { bytes: 2_500_000, mtime: START + 3600, count: 1200, oldest: START + 1560, newest: START + 3600 }, pending: null, retired: { bytes: 40, mtime: START, count: 2 } },
      medium: { served: null, pending: null, retired: null },
      hard: { served: { bytes: 9, mtime: START, count: null, error: 'unreadable' }, pending: null, retired: null },
    },
    ...over,
  };
}

function report(over: Partial<Where> = {}): Where {
  const vartmp = folder();
  return {
    kind: 'vartmp', dir: vartmp.path, refused: null, ctime: vartmp.ctime, mtime: vartmp.mtime, grades: vartmp.grades,
    dataWritable: false,
    folders: {
      data: folder({ path: '/home/acct/public_html/games/crete/data', writable: false, mode: '2770', uid: 1000, gid: 1000, parentGid: 48, holdsBank: false, born: null, grades: null }),
      vartmp,
    },
    php: { uid: 48, gid: 48, groups: [48], sapi: 'fpm-fcgi' },
    bootTime: START - 30 * 86400,
    server: { pid: 812, name: 'php-fpm', startedAt: START },
    tmpMounts: [{ mount: '/var/tmp', root: '/var/tmp/systemd-private-0f-php-fpm.service-Ab/tmp' }],
    now: START + 7200,
    ...over,
  };
}

test('a trusted-where post carries only the op and the token, and a report comes back checked', async () => {
  const seen: { body: string; headers: Record<string, string> }[] = [];
  const fetcher = (async (_url: string, init: RequestInit) => {
    seen.push({ body: String(init.body), headers: init.headers as Record<string, string> });
    return new Response(JSON.stringify(report()), { status: 200 });
  }) as unknown as typeof fetch;
  const w = await askWhere(trustedPoster('https://bank.example/endless-bank.php', TOKEN, () => {}, fetcher), TOKEN);
  assert.deepEqual(w, report());
  assert.deepEqual(JSON.parse(seen[0]!.body), { op: 'trusted-where' });
  assert.equal(seen[0]!.headers[TOKEN_HEADER], TOKEN);
});

test('a refusal, a body that is not a report or no answer is a reason, never with the token in it', async () => {
  const answer = (status: number, body: unknown) => async () => ({ status, body, text: JSON.stringify(body) + TOKEN });
  const unauthorized = await askWhere(answer(401, { error: 'unauthorized' }), TOKEN);
  assert.match(unauthorized as string, /answered 401/);
  assert.ok(!(unauthorized as string).includes(TOKEN));
  assert.match(await askWhere(answer(200, { kind: 'elsewhere' }), TOKEN) as string, /answered 200/);
  assert.equal(await askWhere(async () => ({ status: 0, body: null, text: '' }), TOKEN), 'the bank did not answer');
});

test('whereOf takes a report and nothing else', () => {
  assert.ok(whereOf(report()));
  assert.ok(whereOf(report({ kind: null, dir: null, refused: 'data/ exists but PHP cannot write it' })));
  assert.equal(whereOf(report({ kind: null })), null, 'no folder needs a reason');
  assert.equal(whereOf(report({ refused: 'why' })), null, 'a folder has no refusal');
  assert.equal(whereOf({ ...report(), kind: 'tmp' }), null);
  assert.equal(whereOf({ ...report(), dataWritable: 'no' }), null);
  assert.equal(whereOf([]), null);
  assert.equal(whereOf(null), null);
});

test('the printed report names the folder, every store and the host', () => {
  const text = whereLines(report()).join('\n');
  assert.match(text, /^The bank's folder: vartmp \/var\/tmp\/acct-crete-bank$/m);
  assert.match(text, /^data\/ \/home\/acct\/public_html\/games\/crete\/data: mode 2770, uid 1000, gid 1000 \(its parent's gid 48\); PHP can write it: no; holds a bank: no$/m);
  assert.match(text, /the bank first used it, empty, 2026-11-08T17:26:00Z \(as vartmp\)/);
  assert.match(text, /^ {2}easy {3}served 1200 \(2\.4 MB, written 2026-11-08T18:00:00Z, levels in 2026-11-08T17:26:00Z to 2026-11-08T18:00:00Z\); pending none; retired 2 \(0\.0 KB/m);
  assert.match(text, /^ {2}hard {3}served unreadable/m);
  assert.doesNotMatch(text, /medium/, 'a grade with no stores is left out');
  assert.match(text, /^PHP's server: php-fpm \(pid 812\) started 2026-11-08T17:00:00Z$/m);
  assert.match(text, /^\/tmp and \/var\/tmp as PHP sees them: \/var\/tmp from \/var\/tmp\/systemd-private-/m);
  assert.match(text, /^The bank's clock: 2026-11-08T19:00:00Z$/m);
});

test('it reads a bank in php-fpm\'s private /var/tmp, data/ in a group PHP is not in, and a start just after php-fpm\'s', () => {
  const r = readings(report());
  assert.ok(r.some(l => l.includes('php-fpm\'s private /var/tmp')), r.join('\n'));
  assert.ok(r.some(l => l === 'PHP cannot write data/: its group is 1000, which PHP is not in (PHP runs as uid 48, groups 48; data/\'s parent has gid 48).'), r.join('\n'));
  assert.ok(r.includes('The bank began 26 min after php-fpm started (2026-11-08T17:00:00Z).'), r.join('\n'));
  assert.ok(!r.some(l => l.includes('the host booted')), 'a boot a month before says nothing');

  const inData = readings(report({ kind: 'data', dir: '/d', dataWritable: true, tmpMounts: [], folders: { data: folder({ born: null }) } }));
  assert.deepEqual(inData, ['The bank lives in data/, which deploys never touch: it survives restarts and reboots.']);

  const refused = readings(report({ kind: null, dir: null, refused: 'data/ exists but PHP cannot write it' }));
  assert.equal(refused[0]!, 'The bank refuses to start: data/ exists but PHP cannot write it');
  assert.match(whereLines(report({ kind: null, dir: null, refused: 'x' }))[0]!, /refuses to start/);
});

test('utc prints seconds or unknown', () => {
  assert.equal(utc(START), '2026-11-08T17:00:00Z');
  assert.equal(utc(null), 'unknown');
});

test('it reads a bank in the folder the host names, and prints that folder alone', () => {
  const host = folder({ path: '/home/acct/crete-bank-data', uid: 6696571, gid: 1000, born: { at: START, kind: 'host' } });
  const w = report({
    kind: 'host', dir: host.path, dataWritable: false, folders: { host }, tmpMounts: [],
    php: { uid: 6696571, gid: 1000, groups: [1000], sapi: 'cgi-fcgi' }, server: null,
  });
  assert.ok(whereOf(w), 'a host folder is a report');
  assert.deepEqual(readings(w), ['The bank lives in the folder the host names (bank/place.json), outside the web root, which deploys never touch: it survives restarts and reboots.']);
  const lines = whereLines(w);
  assert.equal(lines[0], 'The bank\'s folder: host /home/acct/crete-bank-data');
  assert.ok(lines.some(l => l.startsWith('host folder /home/acct/crete-bank-data: mode 0700')), lines.join('\n'));
  assert.ok(!lines.some(l => l.startsWith('data/') || l.startsWith('/var/tmp')), lines.join('\n'));
});
