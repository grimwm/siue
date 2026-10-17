import { test } from 'node:test';
import assert from 'node:assert/strict';
import { statusView } from '../src/status.ts';
import type { StatusInput } from '../src/status.ts';

const base: StatusInput = { hp: 7, maxHp: 10, turns: 12, pages: 1, totalPages: 3, score: 340, fuses: 2, bashCd: 0, frozen: 0, inSafe: false, foeDist: 6 };

test('plain numbers read as they are', () => {
  assert.deepEqual(statusView(base), {
    hp: '7/10', turns: '12', pages: '1/3', score: '340', fuses: '2', bash: 'ready', foe: '6',
    foeNote: '6 steps away — and it moves twice',
  });
});

test('a recharging bash shows its turns; one step away is singular', () => {
  assert.equal(statusView({ ...base, bashCd: 2 }).bash, '2');
  assert.equal(statusView({ ...base, foeDist: 1 }).foeNote, '1 step away — and it moves twice');
});

test('frozen, safe and lost each say so, in that order of precedence', () => {
  assert.deepEqual(pick(statusView({ ...base, frozen: 2, inSafe: true, foeDist: -1 })), ['❄ 2', 'frozen solid (2 turns)']);
  assert.deepEqual(pick(statusView({ ...base, frozen: 1 })), ['❄ 1', 'frozen solid (1 turn)']);
  assert.deepEqual(pick(statusView({ ...base, inSafe: true, foeDist: -1 })), ['safe', 'pacing outside your safe zone']);
  assert.deepEqual(pick(statusView({ ...base, foeDist: -1 })), ['?', 'lost in the static']);
});
const pick = (v: ReturnType<typeof statusView>) => [v.foe, v.foeNote];
