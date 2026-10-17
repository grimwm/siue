import { test } from 'node:test';
import assert from 'node:assert/strict';
import { statusView } from '../src/status.ts';

const base = { trial: 'The first gate', hearts: 4, relicsLeft: 2, keys: { red: 1, blue: 0, yellow: 0, green: 1 }, gear: ['flippers'] as const, moves: 12, stone: 0 };

test('hearts are a heart and a number; keys and gear list what is held', () => {
  const v = statusView(base);
  assert.equal(v.hearts, '♥ 4');
  assert.equal(v.heartsNote, '4 hearts left');
  assert.equal(v.relics, '2');
  assert.equal(v.moves, '12');
  assert.equal(v.keys, '🔴1 🟢1');
  assert.equal(v.keysNote, 'red key ×1, green key ×1');
  assert.doesNotMatch(v.keysNote, /blue/i);
  assert.equal(v.gear, 'flippers');
  assert.equal(v.trial, 'The first gate');
});

test('nothing held reads as none; several gear are joined', () => {
  const v = statusView({ ...base, keys: { red: 0, blue: 0, yellow: 0, green: 0 }, gear: ['flippers', 'skates'] });
  assert.equal(v.keys, '');
  assert.equal(v.keysNote, 'no keys');
  assert.equal(v.gear, 'flippers, skates');
  assert.equal(statusView({ ...base, gear: [] }).gear, '');
});

test('one heart is singular and a stone Minotaur is said', () => {
  assert.equal(statusView({ ...base, hearts: 1 }).heartsNote, '1 heart left');
  const v = statusView({ ...base, stone: 2 });
  assert.equal(v.trial, 'The first gate');
  assert.match(v.heartsNote, /the Minotaur is stone for 2 turns/);
  assert.match(statusView({ ...base, stone: 1 }).heartsNote, /stone for 1 turn$/);
});
