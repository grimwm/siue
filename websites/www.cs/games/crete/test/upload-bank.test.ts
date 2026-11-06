// Saved levels for the shared bank (tools/bank-file.ts) and their upload (tools/upload-bank.ts): a file holds exactly
// what trusted-add sends and reads back the same; the upload keeps to a full grade's cap unless rollover is on, moves
// what the bank took or already holds to uploaded/ and what it refused to rejected/, and leaves the rest for a rerun.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { levelFile, readLevelFile } from '../tools/bank-file.ts';
import { postedOf, uploadAll, uploadLines } from '../tools/upload-bank.ts';
import type { Posted, UploadDeps } from '../tools/upload-bank.ts';
import { saveLevel, tupleFor, unboundedCounts } from '../tools/generate-bank.ts';
import type { Counts, Shelf } from '../tools/generate-bank.ts';
import { sharedOf } from '../src/endless/provenance.ts';
import type { SharedMade, Tuple } from '../src/endless/provenance.ts';
import { BANKS } from '../src/endless/bank.ts';
import type { Grade } from '../src/puzzle/rating.ts';

let seed = 7;
const random = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const levelOf = (grade: Grade, i: number): { tuple: Tuple; made: SharedMade } =>
  ({ tuple: tupleFor({ grade, plateau: true, large: false }, random), made: sharedOf(BANKS[grade][i]!) });

test('a saved level holds what trusted-add sends, reads back the same, and is named <grade>-<hash>.json', () => {
  const { tuple, made } = levelOf('hard', 0);
  const f = levelFile(tuple, made);
  assert.match(f.name, /^hard-[0-9a-f]{16}\.json$/);
  assert.equal(levelFile(tuple, made).name, f.name, 'the same level, the same name');
  assert.notEqual(levelFile(tuple, sharedOf(BANKS.hard[1]!)).name, f.name, 'another level, another name');
  const back = readLevelFile(f.text);
  assert.deepEqual(back, { v: tuple.v, grade: 'hard', score: made.score, tuple, made });
  assert.equal(readLevelFile('{'), 'not JSON');
  assert.match(readLevelFile(JSON.stringify({ ...JSON.parse(f.text), tuple: { v: 1 } })) as string, /tuple/);
  assert.match(readLevelFile(JSON.stringify({ ...JSON.parse(f.text), grade: 'easy' })) as string, /does not match/);
  const { text: _t, ...partial } = made;
  assert.match(readLevelFile(JSON.stringify({ ...JSON.parse(f.text), made: partial })) as string, /missing fields/);
  assert.match(readLevelFile(JSON.stringify({ ...JSON.parse(f.text), made: { ...made, score: '12', hides: 0 } })) as string, /score, hides is not one the bank takes/);
  assert.match(readLevelFile(JSON.stringify({ ...JSON.parse(f.text), made: { ...made, line: 'UP' } })) as string, /line/);
});

test('saving writes one file per level into the folder, and the same level twice is a duplicate', () => {
  const dir = mkdtempSync(join(tmpdir(), 'crete-save-'));
  try {
    const { tuple, made } = levelOf('easy', 0);
    const into = join(dir, 'new');
    assert.equal(saveLevel(into, tuple, made).result, 'ok');
    assert.equal(saveLevel(into, tuple, made).result, 'duplicate');
    const files = readdirSync(into);
    assert.equal(files.length, 1);
    assert.deepEqual(readLevelFile(readFileSync(join(into, files[0]!), 'utf8')), { v: tuple.v, grade: 'easy', score: made.score, tuple, made });
    assert.equal(unboundedCounts().hard.cap, Number.MAX_SAFE_INTEGER);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

const shelf = (served: number, cap = 1500): Shelf => ({ served, pending: 0, cap, levels: [] });

/** A folder of saved levels in memory, and a bank that answers from `answer`. */
function bank(files: { grade: Grade; i: number }[], c: Counts, answer: (t: Tuple, replace: boolean, n: number) => Posted) {
  const dir = new Map<string, string>();
  for (const f of files) { const { tuple, made } = levelOf(f.grade, f.i); const l = levelFile(tuple, made); dir.set(l.name, l.text); }
  const moved: Record<string, string> = {};
  const posts: { grade: Grade; replace: boolean }[] = [];
  const lines: string[] = [];
  let t = 0;
  const deps: UploadDeps = {
    counts: async () => c,
    files: () => [...dir.keys()],
    read: n => dir.get(n)!,
    post: async (tuple, _made, replace) => { posts.push({ grade: tuple.grade, replace }); t += 1000; return answer(tuple, replace, posts.length - 1); },
    move: (n, to) => { moved[n] = to; dir.delete(n); },
    now: () => t,
    wait: async ms => { t += ms; },
    random: () => 0.5,
    log: l => lines.push(l),
  };
  return { deps, moved, posts, lines, left: () => [...dir.keys()] };
}

test('it fills a grade\'s room, then stops it unless rollover is on, leaving the rest for a rerun', async () => {
  const files = [0, 1, 2, 3].map(i => ({ grade: 'hard' as Grade, i }));
  const b = bank(files, { easy: shelf(0), medium: shelf(0), hard: shelf(1498) }, () => ({ kind: 'added' }));
  const u = await uploadAll(b.deps, { grades: ['easy', 'medium', 'hard'], rollover: false, dir: 'saved' });
  assert.deepEqual(u.grades.hard, { added: 2, replaced: 0, duplicate: 0, retired: 0, rejected: 0, left: 2 });
  assert.ok(b.posts.every(p => !p.replace));
  assert.equal(b.left().length, 2, 'two files wait');
  const hint = 'hard: full at 1500 \u2014 stopped with 2 of 4 left (2 file(s) remain in saved). To replace older levels with them, run again with ROLLOVER=yes.';
  assert.ok(b.lines.includes(hint), b.lines.join('\n'));
  assert.ok(uploadLines(u, ['hard']).includes(hint), 'repeated in the totals');
  // With rollover each goes in with replace: the server fills the room, then retires one for each.
  const r = bank(files, { easy: shelf(0), medium: shelf(0), hard: shelf(1499) }, (_t, _r, n) => ({ kind: n === 0 ? 'added' : 'replaced' }));
  const ru = await uploadAll(r.deps, { grades: ['hard'], rollover: true, dir: 'saved' });
  assert.deepEqual(ru.grades.hard, { added: 1, replaced: 3, duplicate: 0, retired: 0, rejected: 0, left: 0 });
  assert.ok(r.posts.every(p => p.replace));
  // The bank saying full stops the grade too.
  const f = bank(files, { easy: shelf(0), medium: shelf(0), hard: shelf(0) }, () => ({ kind: 'full' }));
  assert.equal((await uploadAll(f.deps, { grades: ['hard'], rollover: false, dir: 'saved' })).grades.hard.left, 4);
  assert.equal(f.posts.length, 1, 'one try, then the grade waits');
});

test('taken and duplicate files move to uploaded/, refused ones to rejected/ with the reason, lasting failures stay', async () => {
  const files = [{ grade: 'easy' as Grade, i: 0 }, { grade: 'easy' as Grade, i: 1 }, { grade: 'medium' as Grade, i: 0 }, { grade: 'hard' as Grade, i: 0 }];
  let easy = 0;
  const answer = (t: Tuple): Posted => (t.grade === 'easy' ? (easy++ ? { kind: 'duplicate' } : { kind: 'added' })
    : t.grade === 'hard' ? { kind: 'rejected', reason: '403 version: the bank no longer takes this generator version' } : { kind: 'error' });
  const b = bank(files, { easy: shelf(0), medium: shelf(0), hard: shelf(0) }, answer);
  const u = await uploadAll(b.deps, { grades: ['easy', 'medium', 'hard'], rollover: false, dir: 'saved' });
  assert.deepEqual(Object.values(b.moved).sort(), ['rejected', 'uploaded', 'uploaded']);
  assert.equal(b.left().length, 1, 'the one the bank never answered waits');
  assert.match(u.halt!, /^the bank has failed \d+ tries in a row over \d+ min/);
  assert.ok(b.lines.some(l => /^medium-.*: trying again in \d+ s$/.test(l)), 'tried again first');
  assert.ok(b.lines.some(l => /hard-.*: rejected, 403 version/.test(l)));
  assert.deepEqual(u.grades.easy, { added: 1, replaced: 0, duplicate: 1, retired: 0, rejected: 0, left: 0 });
  assert.deepEqual(uploadLines(u, ['easy', 'medium', 'hard']), [
    'easy: added 1, replaced 0, duplicate 1, retired 0, rejected 0, left 0',
    'medium: added 0, replaced 0, duplicate 0, retired 0, rejected 0, left 1',
    'hard: added 0, replaced 0, duplicate 0, retired 0, rejected 1, left 0',
    `sent 3 in ${u.seconds} s (${Math.round((3 / u.seconds) * 3600)} per hour)`,
  ]);
  // A bank that comes back after a few failed tries takes the file: nothing waits, nothing stops.
  let tries = 0;
  const back = bank([{ grade: 'hard', i: 0 }], { easy: shelf(0), medium: shelf(0), hard: shelf(0) }, () => (++tries <= 3 ? { kind: 'error' } : { kind: 'added' }));
  const bu = await uploadAll(back.deps, { grades: ['hard'], rollover: false, dir: 'saved' });
  assert.equal(bu.grades.hard.added, 1);
  assert.equal(bu.halt, null);
  assert.equal(back.left().length, 0);
  // A bank that turns this runner down stops it at once.
  const denied = bank(files, { easy: shelf(0), medium: shelf(0), hard: shelf(0) }, () => ({ kind: 'denied' }));
  const du = await uploadAll(denied.deps, { grades: ['easy', 'medium', 'hard'], rollover: false, dir: 'saved' });
  assert.equal(du.halt, 'the bank turned this runner down (logged above)');
  assert.equal(denied.posts.length, 1);
  // Only the named grades are sent; a file that does not read is rejected without a post.
  const only = bank(files, { easy: shelf(0), medium: shelf(0), hard: shelf(0) }, () => ({ kind: 'added' }));
  only.deps.read = n => (n.startsWith('hard-') ? 'nonsense' : '');
  await uploadAll(only.deps, { grades: ['hard'], rollover: false, dir: 'saved' });
  assert.equal(only.posts.length, 0);
  assert.deepEqual(Object.values(only.moved), ['rejected']);
  // A spent hourly share stops the run; the rest stay.
  const rate = bank(files, { easy: shelf(0), medium: shelf(0), hard: shelf(0) }, () => ({ kind: 'rate' }));
  const ru = await uploadAll(rate.deps, { grades: ['easy', 'medium', 'hard'], rollover: false, dir: 'saved' });
  assert.ok(ru.halted);
  assert.equal(rate.posts.length, 1);
  assert.equal(rate.left().length, 4);
});

test('the bank\'s answers read as added, replaced, duplicate, full, rejected with the reason, or a failure', () => {
  assert.deepEqual(postedOf(200, { ok: true, h: 'x' }), { kind: 'added' });
  assert.deepEqual(postedOf(200, { ok: true, h: 'x', retired: 'y' }), { kind: 'replaced' });
  assert.deepEqual(postedOf(409, { error: 'duplicate' }), { kind: 'duplicate' });
  assert.deepEqual(postedOf(409, { error: 'full' }), { kind: 'full' });
  assert.deepEqual(postedOf(409, { error: 'retired' }), { kind: 'retired' });
  assert.deepEqual(postedOf(429, null), { kind: 'rate' });
  assert.deepEqual(postedOf(400, { error: 'invalid', field: 'made.line' }), { kind: 'rejected', reason: '400 invalid (made.line)' });
  assert.match((postedOf(403, { error: 'version' }) as { reason: string }).reason, /no longer takes/);
  assert.deepEqual(postedOf(403, { error: 'forbidden' }), { kind: 'denied' }, 'a bad token is not the file\'s fault');
  assert.deepEqual(postedOf(401, { error: 'unauthorized' }), { kind: 'error' }, 'a deploy can give a 401 for a moment');
  assert.deepEqual(postedOf(404, null), { kind: 'error' }, 'or a 404: tried again, never rejected');
  assert.deepEqual(postedOf(500, null), { kind: 'error' });
  assert.deepEqual(postedOf(0, null), { kind: 'error' }, 'no answer');
  assert.deepEqual(postedOf(200, null), { kind: 'error' }, 'a 200 that is not the bank\'s JSON');
});

test('uploading the same folder twice leaves the bank as the first upload left it', async () => {
  // A bank that works as Bank.php's trusted-add does: a level it holds (served or waiting) is a duplicate before
  // anything else is decided, so it never takes room or retires one; at the cap, replace retires the oldest.
  const held: string[] = [];
  const gone: string[] = [];
  let cap = 10;
  const post = async (_t: Tuple, made: SharedMade, replace: boolean): Promise<Posted> => {
    if (gone.includes(made.text)) return { kind: 'retired' };
    if (held.includes(made.text)) return { kind: 'duplicate' };
    if (held.length >= cap) { if (!replace) return { kind: 'full' }; gone.push(held.shift()!); held.push(made.text); return { kind: 'replaced' }; }
    held.push(made.text);
    return { kind: 'added' };
  };
  const saved = [0, 1, 2, 3, 4].map(i => { const l = levelOf('easy', i); return levelFile(l.tuple, l.made); });
  const moved: string[] = [];
  const run = async (dir: Map<string, string>) => {
    const deps: UploadDeps = {
      counts: async () => ({ easy: { served: held.length, pending: 0, cap, levels: [] }, medium: shelf(0), hard: shelf(0) }),
      files: () => [...dir.keys()], read: n => dir.get(n)!, post, move: (n, to) => { dir.delete(n); moved.push(to); }, now: () => 0, wait: async () => {}, log: () => {},
    };
    return uploadAll(deps, { grades: ['easy'], rollover: true, dir: 'saved' });
  };
  const folder = new Map(saved.map(f => [f.name, f.text]));
  assert.equal((await run(folder)).grades.easy.added, 5);
  const after = [...held];
  // The same folder again: everything moved to uploaded/, so nothing is sent.
  assert.deepEqual((await run(folder)).grades.easy, { added: 0, replaced: 0, duplicate: 0, retired: 0, rejected: 0, left: 0 });
  // The same files put back: each is a duplicate, takes no room, retires nothing, and moves to uploaded/ again.
  const again = new Map(saved.map(f => [f.name, f.text]));
  assert.deepEqual((await run(again)).grades.easy, { added: 0, replaced: 0, duplicate: 5, retired: 0, rejected: 0, left: 0 });
  assert.equal(again.size, 0);
  assert.deepEqual(held, after, 'the bank is as the first upload left it');
  // After its levels rotate out of a smaller grade, the same files again are retired, not taken back.
  cap = 2;
  const small = new Map(saved.map(f => [f.name, f.text]));
  held.length = 0; gone.length = 0; moved.length = 0;
  await run(small);
  const kept = [...held];
  const back = await run(new Map(saved.map(f => [f.name, f.text])));
  assert.deepEqual(back.grades.easy, { added: 0, replaced: 0, duplicate: 2, retired: 3, rejected: 0, left: 0 });
  assert.deepEqual(held, kept);
  assert.equal(moved.filter(m => m === 'retired').length, 3, 'retired files go to retired/');
});
