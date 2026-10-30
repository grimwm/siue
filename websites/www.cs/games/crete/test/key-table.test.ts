// The trials' key table: no two actions or tools share a key.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BACK_KEY } from '../../_kit/keys.ts';
import { TOOLS } from '../src/puzzle/tiles.ts';
import { KEYS, MOVE_DELTA, actionFor, isMove, itemFor } from '../src/keys.ts';
import type { Action } from '../src/keys.ts';

const ACTIONS = Object.keys(KEYS) as Action[];

test('no two actions or tools share a key, whatever the case', () => {
  const seen = new Map<string, string>();
  const claim = (k: string, who: string) => {
    const key = k.toLowerCase();
    assert.equal(seen.get(key), undefined, `${key} is on both ${seen.get(key)} and ${who}`);
    seen.set(key, who);
  };
  for (const a of ACTIONS) for (const k of KEYS[a].keys) claim(k, a);
  for (const [name, t] of Object.entries(TOOLS)) claim(t.key, name);
  claim(BACK_KEY, 'back');
});

test('the rows the trials use', () => {
  assert.deepEqual(KEYS.wait, { label: '.', keys: ['.'] });
  assert.deepEqual(KEYS.undo, { label: 'U', keys: ['u'] });
  assert.deepEqual(KEYS.restart, { label: 'R', keys: ['r'] });
  assert.deepEqual(KEYS.new, { label: 'N', keys: ['n'] });
  assert.deepEqual(KEYS.begin, { label: '↵', keys: ['enter', ' '] });
  assert.equal(actionFor('Enter'), 'begin');
  assert.equal(actionFor(' '), 'begin');
  assert.deepEqual(KEYS.story, { label: 'I', keys: ['i'] });
  assert.deepEqual(KEYS.fullscreen, { label: 'F', keys: ['f'] });
  assert.deepEqual(KEYS.lore, { label: 'L', keys: ['l'] });
  assert.deepEqual(KEYS.look, { label: 'B', keys: ['b'] });
  assert.equal(actionFor('B'), 'look');
  assert.equal('bash' in KEYS, false);
});

test('presses map to their action whatever the case; Escape and Q map to nothing', () => {
  assert.equal(actionFor('ArrowUp'), 'up');
  assert.equal(actionFor('W'), 'up');
  assert.equal(actionFor('.'), 'wait');
  assert.equal(actionFor('U'), 'undo');
  assert.equal(actionFor('Escape'), null);
  assert.equal(actionFor('q'), null);
  assert.equal(actionFor('J'), null, 'J and K move focus and are not actions');
});

test('moves are unit steps; tools are found by their printed key and are not actions', () => {
  assert.deepEqual(MOVE_DELTA, { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] });
  assert.equal(isMove('left'), true);
  assert.equal(isMove('wait'), false);
  for (const kind of Object.keys(TOOLS) as (keyof typeof TOOLS)[]) {
    assert.equal(itemFor(TOOLS[kind].key.toLowerCase(), TOOLS), kind);
    assert.equal(actionFor(TOOLS[kind].key), null);
  }
});
