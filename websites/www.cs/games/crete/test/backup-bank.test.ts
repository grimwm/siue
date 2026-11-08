// The shared bank's backup (tools/backup-bank.ts) and restore (tools/restore-bank.ts) against a fake bank behind a
// fake fetch: the backup pages through every grade's lists, tries a failing bank again, stops on a refusal, and writes
// one file per grade and a manifest whose counts, sizes and SHA-256 match; the restore checks a backup against its
// manifest and posts only the served levels the bank has none of.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { backupAll, backupLines, exportList, gradeFile, size, stamp } from '../tools/backup-bank.ts';
import type { ExportDeps, GradeBackup, Manifest } from '../tools/backup-bank.ts';
import { planGrade, readBackup, restoreAll } from '../tools/restore-bank.ts';
import { trustedPoster } from '../tools/bank-post.ts';
import { TOKEN_HEADER } from '../tools/verify-bank.ts';
import { tupleFor } from '../tools/generate-bank.ts';
import type { Counts } from '../tools/generate-bank.ts';
import { sharedOf } from '../src/endless/provenance.ts';
import type { SharedMade, Tuple } from '../src/endless/provenance.ts';
import { BANKS } from '../src/endless/bank.ts';
import type { Grade } from '../src/puzzle/rating.ts';

const TOKEN = 'tok_Test-verifier_0123456789abcdefXYZ';
const URL_ = 'https://bank.example/endless-bank.php';
let seed = 11;
const random = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const hex = (i: number) => i.toString(16).padStart(16, '0');

type Item = Record<string, unknown> & { h: string };
/** A bank in memory: each grade's lists, answering trusted-export `page` items at a time in hash order. */
function fakeBank(page = 2) {
  const lists: Record<Grade, Record<'served' | 'pending' | 'retired', Item[]>> = {
    easy: { served: [], pending: [], retired: [] }, medium: { served: [], pending: [], retired: [] }, hard: { served: [], pending: [], retired: [] },
  };
  const bodies: Record<string, unknown>[] = [];
  const fail: number[] = [];
  const fetcher = (async (_url: string, init: RequestInit) => {
    assert.equal((init.headers as Record<string, string>)[TOKEN_HEADER], TOKEN);
    const b = JSON.parse(init.body as string) as Record<string, unknown>;
    bodies.push(b);
    const status = fail.shift();
    if (status) return new Response(`{"error":"x","echo":"${TOKEN}"}`, { status });
    if (b.op === 'trusted-export') {
      const all = [...lists[b.grade as Grade][b.list as 'served']].sort((x, y) => x.h < y.h ? -1 : 1);
      const rest = all.filter(i => b.after === null || i.h > (b.after as string));
      const items = rest.slice(0, Math.min(page, b.limit as number));
      const next = rest.length > items.length ? items.at(-1)!.h : null;
      return Response.json({ grade: b.grade, list: b.list, total: all.length, items, next });
    }
    if (b.op === 'trusted-counts') {
      const c = {} as Counts;
      for (const g of ['easy', 'medium', 'hard'] as Grade[]) c[g] = { served: lists[g].served.length, pending: lists[g].pending.length, cap: 1500, levels: [] };
      return Response.json({ grades: c });
    }
    if (b.op === 'trusted-add') {
      const t = b.tuple as Tuple;
      const h = createHash('sha256').update((b.made as SharedMade).text).digest('hex').slice(0, 16);
      lists[t.grade].served.push({ h, made: b.made, n: 0, tuple: t });
      return Response.json({ ok: true, h });
    }
    return Response.json({ error: 'invalid', field: 'op' }, { status: 400 });
  }) as typeof fetch;
  return { lists, bodies, fail, fetcher };
}

const lines: string[] = [];
function deps(fetcher: typeof fetch, clock = { t: Date.UTC(2026, 10, 7, 15, 30, 5) }): ExportDeps {
  const log = (l: string) => lines.push(l);
  return { post: trustedPoster(URL_, TOKEN, log, fetcher), token: TOKEN, log, now: () => clock.t, wait: async ms => { clock.t += ms; }, random };
}

const level = (grade: Grade, i: number): { tuple: Tuple; made: SharedMade; h: string } => {
  const made = sharedOf(BANKS[grade][i]!);
  return { tuple: tupleFor({ grade, plateau: true, large: false }, random), made, h: createHash('sha256').update(made.text).digest('hex').slice(0, 16) };
};

function stocked() {
  const bank = fakeBank();
  for (let i = 0; i < 5; i++) { const l = level('easy', i); bank.lists.easy.served.push({ h: l.h, v: 2, at: 1, made: l.made, n: i, tuple: i === 4 ? null : l.tuple }); }
  for (let i = 0; i < 3; i++) { const l = level('hard', i); bank.lists.hard.served.push({ h: l.h, v: 2, at: 1, made: l.made, n: 7, tuple: l.tuple }); }
  const w = level('medium', 0);
  bank.lists.medium.pending.push({ h: w.h, v: 2, at: 1, made: w.made, tuple: w.tuple });
  bank.lists.easy.retired.push({ h: hex(3) }, { h: hex(1) }, { h: hex(2) });
  return bank;
}

test('a list is paged with after until next is null, a failing post is tried again and a refusal stops it', async () => {
  const bank = stocked();
  bank.fail.push(503);
  const served = await exportList(deps(bank.fetcher), 'easy', 'served');
  assert.ok(Array.isArray(served));
  assert.equal(served.length, 5);
  const exports = bank.bodies.filter(b => b.op === 'trusted-export');
  assert.equal(exports.length, 4, 'a 503, then three pages of two');
  assert.deepEqual(exports.map(b => b.after), [null, null, served[1]!.h, served[3]!.h]);
  assert.ok(exports.every(b => b.limit === 500 && b.grade === 'easy' && b.list === 'served'));
  assert.deepEqual(served.map(s => s.h), [...served.map(s => s.h as string)].sort());

  bank.fail.push(403);
  const refused = await exportList(deps(bank.fetcher), 'easy', 'served');
  assert.equal(typeof refused, 'string');
  assert.match(refused as string, /403/);
  assert.ok(!(refused as string).includes(TOKEN) && !lines.some(l => l.includes(TOKEN)), 'the token is never in a line');
});

test('a backup writes one file per grade and a manifest whose counts, bytes and SHA-256 match', async () => {
  const into = mkdtempSync(join(tmpdir(), 'crete-backup-'));
  try {
    const bank = stocked();
    const r = await backupAll(deps(bank.fetcher), { grades: ['easy', 'medium', 'hard'], into, url: URL_, machine: 'box' });
    assert.equal(r.halt, null);
    assert.equal(r.dir, join(into, '20261107T153005Z'));
    assert.deepEqual(readdirSync(r.dir).sort(), ['easy.json', 'hard.json', 'manifest.json', 'medium.json']);
    const m = JSON.parse(readFileSync(join(r.dir, 'manifest.json'), 'utf8')) as Manifest;
    assert.equal(m.time, '2026-11-07T15:30:05.000Z');
    assert.equal(m.host, 'bank.example');
    assert.equal(m.machine, 'box');
    const easy = JSON.parse(readFileSync(join(r.dir, 'easy.json'), 'utf8')) as GradeBackup;
    assert.equal(easy.served.length, 5);
    assert.deepEqual(easy.retired, [hex(1), hex(2), hex(3)], 'retired hashes, in order');
    assert.deepEqual(easy.served.map(s => s.n).sort(), [0, 1, 2, 3, 4], 'each with its served count');
    assert.ok(easy.served.every(s => 'made' in s && 'tuple' in s));
    for (const g of ['easy', 'medium', 'hard'] as Grade[]) {
      const raw = readFileSync(join(r.dir, `${g}.json`));
      const e = m.grades[g]!;
      assert.equal(e.bytes, raw.length);
      assert.equal(e.sha256, createHash('sha256').update(raw).digest('hex'));
      assert.ok(e.gzipBytes > 0 && e.gzipBytes < e.bytes);
    }
    assert.deepEqual([m.grades.easy!.withoutTuple, m.grades.medium!.pending, m.grades.hard!.served], [1, 1, 3]);
    assert.deepEqual(m.total, { served: 8, pending: 1, retired: 3, bytes: m.grades.easy!.bytes + m.grades.medium!.bytes + m.grades.hard!.bytes, gzipBytes: m.grades.easy!.gzipBytes + m.grades.medium!.gzipBytes + m.grades.hard!.gzipBytes });
    assert.ok(bank.bodies.every(b => b.op === 'trusted-export'), 'read only: nothing but exports');
    const out = backupLines(r);
    assert.match(out[0]!, /^easy: 5 served \(1 served without a tuple\), 0 waiting, 3 retired; .+ gzipped$/);
    assert.match(out[3]!, /^total: 8 served, 1 waiting, 3 retired; /);
    assert.equal(out[4], `saved in ${r.dir}`);

    const again = await backupAll(deps(bank.fetcher), { grades: ['easy'], into, url: URL_, machine: 'box' });
    assert.match(again.halt!, /already there/, 'never over an earlier backup');
  } finally { rmSync(into, { recursive: true, force: true }); }
});

test('a backup that cannot finish writes nothing', async () => {
  const into = mkdtempSync(join(tmpdir(), 'crete-backup-'));
  try {
    const bank = stocked();
    let n = 0;
    const failing = (async (u: string, i: RequestInit) => (++n > 3 ? new Response('', { status: 403 }) : bank.fetcher(u, i))) as typeof fetch;
    const r = await backupAll(deps(failing), { grades: ['easy', 'medium', 'hard'], into, url: URL_, machine: 'box' });
    assert.match(r.halt!, /403/);
    assert.equal(r.manifest, null);
    assert.deepEqual(readdirSync(into), []);
  } finally { rmSync(into, { recursive: true, force: true }); }
});

test('sizes and the folder name read plainly', () => {
  assert.deepEqual([size(812), size(3482), size(2_737_000)], ['812 B', '3.4 KiB', '2.61 MiB']);
  assert.equal(stamp(Date.UTC(2026, 0, 2, 3, 4, 5, 678)), '20260102T030405Z');
  const f = gradeFile({ grade: 'easy', served: [], pending: [], retired: [] });
  assert.equal(f.text, '{"grade":"easy","served":[],"pending":[],"retired":[]}\n');
  assert.equal(f.entry.gzipBytes, gzipSync(f.text).length);
});

test('a restore checks the backup against its manifest and posts only what the bank has none of', async () => {
  const into = mkdtempSync(join(tmpdir(), 'crete-backup-'));
  try {
    const before = stocked();
    const { dir } = await backupAll(deps(before.fetcher), { grades: ['easy', 'medium', 'hard'], into, url: URL_, machine: 'box' });
    const read = (n: string) => readFileSync(join(dir, n), 'utf8');
    const backup = readBackup(read, ['easy', 'medium', 'hard']);
    assert.ok(backup instanceof Map);

    // The bank since: easy lost three levels (one had no tuple) and retired one of them; hard lost everything.
    const after = stocked();
    const lost = new Set(after.lists.easy.served.filter(s => s.tuple !== null).map(s => s.h).sort().slice(0, 3));
    after.lists.easy.served = after.lists.easy.served.filter(s => !lost.has(s.h) && s.tuple !== null);
    after.lists.easy.retired.push({ h: [...lost][0]! });
    after.lists.hard.served = [];
    const plan = planGrade((backup as Map<Grade, GradeBackup>).get('easy')!, { grade: 'easy', served: after.lists.easy.served, pending: [], retired: after.lists.easy.retired.map(r => r.h) });
    assert.deepEqual([plan.files.size, plan.there, plan.retired, plan.withoutTuple], [2, 1, 1, 1]);

    const d = deps(after.fetcher);
    const post = d.post;
    const dry = await restoreAll({ ...d, counts: async () => null, add: async () => { throw new Error('a dry run posts nothing'); } }, backup as Map<Grade, GradeBackup>, { dryRun: true, dir });
    assert.equal(dry.upload, null);
    const r = await restoreAll({
      ...d,
      async counts() { const a = await post({ op: 'trusted-counts' }, 'c'); return (a.body as { grades: Counts }).grades; },
      async add(tuple, made) { const a = await post({ op: 'trusted-add', tuple, made }, 'a'); return a.status === 200 ? { kind: 'added' } : { kind: 'error' }; },
    }, backup as Map<Grade, GradeBackup>, { dryRun: false, dir });
    assert.equal(r.halt, null);
    const adds = after.bodies.filter(b => b.op === 'trusted-add');
    assert.equal(adds.length, 2 + 3, 'two easy, three hard; none waiting, retired or without a tuple');
    assert.ok(adds.every(b => !('replace' in b)), 'never with replace');
    assert.equal(r.upload!.grades.hard.added, 3);
    assert.equal(r.upload!.grades.medium.added, 0, 'a waiting level is never posted');

    writeFileSync(join(dir, 'easy.json'), read('easy.json').replace('"served"', '"served" '));
    assert.match(readBackup(read, ['easy']) as string, /SHA-256/);
    rmSync(join(dir, 'manifest.json'));
    assert.match(readBackup(read, ['easy']) as string, /not a finished backup/);
    assert.ok(existsSync(join(dir, 'hard.json')), 'a restore moves no backup file');
  } finally { rmSync(into, { recursive: true, force: true }); }
});
