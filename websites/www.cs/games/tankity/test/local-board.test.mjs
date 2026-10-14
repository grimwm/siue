// This browser's board (src/local-board.ts): solo matches and one-human rooms,
// the best 20 per difficulty, kept in localStorage; and main's old
// `tankity-local` rows moved onto it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { memoryStorage, throwingStorage } from '../../_kit/test/record.ts';
import { LEGACY_KEY, LOCAL_KEEP, LOCAL_KEY, coerceInitials, localBoard } from '../src/local-board.ts';

const row = (score, o = {}) => ({ initials: 'ABC', score, rounds: 1, seed: 's' + score, at: '2026-10-13T10:00:00.000Z', kind: 'solo', ref: `solo:s${score}:${o.at ?? ''}`, ...o });
const stored = s => JSON.parse(s.data.get(LOCAL_KEY));

test('a fresh browser has an empty board on every difficulty', () => {
  const b = localBoard(memoryStorage());
  for (const lv of ['easy', 'normal', 'hard']) assert.deepEqual(b.rows(lv), []);
});

test('rows come back best first, each difficulty on its own', () => {
  const s = memoryStorage();
  const b = localBoard(s);
  assert.deepEqual(b.add('normal', row(500, { ref: 'a' })), { place: 1, kept: true });
  assert.deepEqual(b.add('normal', row(900, { ref: 'b' })), { place: 1, kept: true });
  assert.deepEqual(b.add('normal', row(700, { ref: 'c' })), { place: 2, kept: true });
  assert.deepEqual(b.add('hard', row(100, { ref: 'd' })), { place: 1, kept: true });
  assert.deepEqual(localBoard(s).rows('normal').map(r => r.score), [900, 700, 500]);
  assert.deepEqual(localBoard(s).rows('hard').map(r => r.ref), ['d']);
  assert.deepEqual(localBoard(s).rows('easy'), []);
  assert.equal(stored(s).v, 1);
});

test('a tie goes to the older run, and a run with no date counts as oldest', () => {
  const b = localBoard(memoryStorage());
  b.add('normal', row(500, { ref: 'new', at: '2026-10-13T12:00:00.000Z' }));
  assert.equal(b.add('normal', row(500, { ref: 'old', at: '2026-10-12T12:00:00.000Z' })).place, 1);
  assert.equal(b.add('normal', row(500, { ref: 'legacy', at: '' })).place, 1);
  assert.equal(b.add('normal', row(500, { ref: 'same-time', at: '2026-10-13T12:00:00.000Z' })).place, 4, 'a later run on the same date and score goes below');
  assert.deepEqual(b.rows('normal').map(r => r.ref), ['legacy', 'old', 'new', 'same-time']);
});

test('the best 20 per difficulty are kept; a run outside them answers null', () => {
  const s = memoryStorage();
  const b = localBoard(s);
  for (let i = 1; i <= LOCAL_KEEP; i++) b.add('easy', row(i * 100, { ref: 'r' + i }));
  assert.equal(LOCAL_KEEP, 20);
  assert.deepEqual(b.add('easy', row(50, { ref: 'low' })), { place: null, kept: true });
  assert.equal(b.rows('easy').length, 20);
  assert.ok(!b.rows('easy').some(r => r.ref === 'low'));
  assert.deepEqual(b.add('easy', row(150, { ref: 'mid' })), { place: 20, kept: true });
  assert.equal(b.rows('easy').length, 20);
  assert.ok(!b.rows('easy').some(r => r.ref === 'r1'), 'the lowest fell off');
  assert.equal(stored(s).boards.easy.length, 20);
});

test('a run already held is not added again, and answers its place', () => {
  const b = localBoard(memoryStorage());
  b.add('normal', row(900, { ref: 'x' }));
  b.add('normal', row(500, { ref: 'room:ABCD:m1' }));
  assert.deepEqual(b.add('normal', row(500, { ref: 'room:ABCD:m1' })), { place: 2, kept: true });
  assert.equal(b.rows('normal').length, 2);
});

test('a damaged value reads back as empty boards, and the next save replaces it', () => {
  for (const raw of ['{not json', '[]', '{"v":1}', '{"v":1,"boards":{"easy":[],"normal":[{"score":"x"}],"hard":[]}}', '{"v":2,"boards":{"easy":[],"normal":[],"hard":[]}}']) {
    const s = memoryStorage({ [LOCAL_KEY]: raw });
    const b = localBoard(s);
    assert.deepEqual(b.rows('normal'), [], raw);
    assert.deepEqual(b.add('normal', row(10, { ref: 'n' })), { place: 1, kept: true });
    assert.deepEqual(stored(s).boards.normal.map(r => r.ref), ['n']);
  }
});

test('blocked storage keeps nothing and says so; nothing throws', () => {
  for (const s of [throwingStorage(), null]) {
    const b = localBoard(s);
    assert.equal(b.rows('normal'), null);
    assert.deepEqual(b.add('normal', row(10)), { place: null, kept: false });
    assert.equal(b.migrate(), 0);
  }
});

test('storage that reads but refuses writes keeps nothing', () => {
  const s = memoryStorage();
  s.setItem = () => { throw new Error('quota'); };
  const b = localBoard(s);
  assert.deepEqual(b.rows('normal'), []);
  assert.deepEqual(b.add('normal', row(10)), { place: null, kept: false });
});

test('initials are coerced the way the score guard does it', () => {
  assert.equal(coerceInitials('abc'), 'ABC');
  assert.equal(coerceInitials('a-b'), 'ABX');
  assert.equal(coerceInitials('William'), 'WIL');
  assert.equal(coerceInitials(''), 'XXX');
  assert.equal(coerceInitials('7'), 'XXX');
});

const legacy = rows => memoryStorage({ [LEGACY_KEY]: JSON.stringify(rows) });
const old = (name, score, o = {}) => ({ name, score, banked: 2, won: false, seed: 'seed' + score, ...o });

test('main\'s tankity-local rows move onto the board, then the old key goes', () => {
  const s = legacy([old('wgr', 900), old('Bo', 400, { difficulty: 'hard' }), old('ABC', 300, { difficulty: 'easy' })]);
  const b = localBoard(s);
  assert.equal(b.migrate(), 3);
  assert.equal(s.data.has(LEGACY_KEY), false);
  assert.deepEqual(b.rows('normal'), [{ initials: 'WGR', score: 900, rounds: 2, seed: 'seed900', at: '', kind: 'solo', ref: 'legacy:seed900:900:wgr' }]);
  assert.deepEqual(b.rows('hard').map(r => r.initials), ['BOX']);
  assert.deepEqual(b.rows('easy').map(r => r.score), [300]);
});

test('migrating joins rows already on the board, and a second run is a no-op', () => {
  const s = legacy([old('WGR', 900)]);
  localBoard(memoryStorage()); // unrelated
  const b = localBoard(s);
  b.add('normal', row(1000, { ref: 'mine' }));
  assert.equal(b.migrate(), 1);
  assert.deepEqual(b.rows('normal').map(r => r.score), [1000, 900]);
  assert.equal(b.migrate(), 0);
  // A stale page writes the old key again with the same run: still once.
  s.setItem(LEGACY_KEY, JSON.stringify([old('WGR', 900)]));
  assert.equal(b.migrate(), 0);
  assert.equal(s.data.has(LEGACY_KEY), false);
  assert.equal(b.rows('normal').length, 2);
});

test('the old key stays when the board cannot be written', () => {
  const s = legacy([old('WGR', 900)]);
  s.setItem = k => { if (k === LOCAL_KEY) throw new Error('quota'); };
  assert.equal(localBoard(s).migrate(), 0);
  assert.equal(s.data.has(LEGACY_KEY), true);
});

test('an unparseable or empty tankity-local is left alone', () => {
  for (const raw of ['{oops', '[{"name":1}]', '{"rows":[]}']) {
    const s = memoryStorage({ [LEGACY_KEY]: raw });
    assert.equal(localBoard(s).migrate(), 0);
    assert.equal(s.data.get(LEGACY_KEY), raw);
    assert.equal(s.data.has(LOCAL_KEY), false);
  }
  const empty = memoryStorage({ [LEGACY_KEY]: '[]' });
  assert.equal(localBoard(empty).migrate(), 0);
  assert.equal(empty.data.has(LOCAL_KEY), false);
});
