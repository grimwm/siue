// Which cells a turn changed.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { changedCells } from '../src/modern/diff.ts';
import { grid } from './puzzle-grid.ts';

test('a state and its copy differ nowhere', () => {
  const a = grid(['P.R', '...']);
  assert.deepEqual(changedCells(a, { ...a }), []);
});

test('an opened door and a taken object are each found, ascending', () => {
  const a = grid(['P.R', 'k..']);
  const i = a.terrain.indexOf('door-red');
  assert.ok(i >= 0);
  const terrain = a.terrain.map((t, k) => (k === i ? 'floor' : t));
  assert.deepEqual(changedCells(a, { ...a, terrain }), [i]);
  const j = a.objects.findIndex(o => o !== null);
  assert.ok(j >= 0);
  const objects = a.objects.map((o, k) => (k === j ? null : o));
  assert.deepEqual(changedCells(a, { ...a, terrain, objects }), [i, j].sort((x, y) => x - y));
});
