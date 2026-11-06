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

test('the level stat is short, with its full place as the note; an outside level has neither', () => {
  const v = statusView({ ...base, trial: 'Ch. 1 • Level 3/10', trialNote: 'Chapter 1, Level 3: The Doors of Daedalus' });
  assert.equal(v.trial, 'Ch. 1 • Level 3/10');
  assert.equal(v.trialNote, 'Chapter 1, Level 3: The Doors of Daedalus');
  const out = statusView({ ...base, trial: '' });
  assert.equal(out.trial, '');
  assert.equal(out.trialNote, '');
});

test('Best is the fewest possible; past it, by how many; the player\'s own best is in its note', () => {
  assert.deepEqual([statusView(base).best, statusView(base).over], ['', 0], 'unknown: no Best');
  const on = statusView({ ...base, moves: 12, fewest: 12 });
  assert.deepEqual([on.best, on.over, on.bestNote], ['12', 0, 'Fewest possible moves 12']);
  const over = statusView({ ...base, moves: 15, fewest: 12, yourBest: 13 });
  assert.equal(over.best, '12 +3');
  assert.equal(over.over, 3);
  assert.match(over.bestNote, /^Fewest possible moves 12; 3 over.*; your best clear 13$/);
});

test('the effects at work pass through as chips, in order; none by default', () => {
  assert.deepEqual(statusView(base).effects, []);
  const fx = [
    { id: 'stone', label: 'Stone: 2 Turns', note: 'The Minotaur is stone for 2 more turns.' },
    { id: 'cow', label: 'Chasing the Cow', note: 'The Minotaur goes for the cow, not you, until he reaches it.' },
  ] as const;
  assert.deepEqual(statusView({ ...base, effects: fx }).effects.map(e => e.label), ['Stone: 2 Turns', 'Chasing the Cow']);
});
