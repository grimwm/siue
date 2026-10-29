// Wall ghosting: the opacity a covering wall settles at, and how it eases there.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { easeOpacity, ghostSubjects, ghostTarget } from '../src/modern/ghost.ts';

test('ghostTarget runs from opaque to a third, clamping the cover', () => {
  assert.equal(ghostTarget(0), 1);
  assert.ok(Math.abs(ghostTarget(1) - 0.33) < 1e-9);
  assert.equal(ghostTarget(2), ghostTarget(1));
  assert.equal(ghostTarget(-1), 1);
});

test('easeOpacity settles within 0.01 of the target in a quarter second of frames', () => {
  let o = 1;
  for (let i = 0; i < 15; i++) o = easeOpacity(o, 0.6, 1 / 60);
  assert.ok(Math.abs(o - 0.6) < 0.01, String(o));
  let full = 1;
  for (let i = 0; i < 30; i++) full = easeOpacity(full, ghostTarget(1), 1 / 60);
  assert.ok(Math.abs(full - 0.33) < 0.01, String(full));
});

test('easeOpacity is exact once within 0.005 and never overshoots', () => {
  assert.equal(easeOpacity(0.333, 0.33, 1 / 60), 0.33);
  let o = 0.33;
  for (let i = 0; i < 60; i++) {
    o = easeOpacity(o, 1, 1 / 60);
    assert.ok(o <= 1);
  }
  assert.equal(o, 1);
});

test('walls fade for Theseus in every mode, and for everything else only in Ghosted', () => {
  assert.deepEqual(ghostSubjects('solid', 'hero', ['minotaur', 'key']), ['hero']);
  assert.deepEqual(ghostSubjects('low', 'hero', ['minotaur']), ['hero']);
  assert.deepEqual(ghostSubjects('ghosted', 'hero', ['minotaur', 'key']), ['hero', 'minotaur', 'key']);
  assert.deepEqual(ghostSubjects('solid', null, ['minotaur']), []);
});
