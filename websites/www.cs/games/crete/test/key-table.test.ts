// Crete's key table: one place says which keys do what and what a button's tab prints.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ITEMS } from '../src/engine.ts';
import { KEYS, MOVE_DELTA, actionFor, isMove, itemFor } from '../src/keys.ts';
import type { Action } from '../src/keys.ts';

const ACTIONS = Object.keys(KEYS) as Action[];

test('no key does two things', () => {
  const seen = new Map<string, Action>();
  for (const a of ACTIONS) {
    for (const k of KEYS[a].keys) {
      assert.equal(seen.get(k), undefined, `${k} is on both ${seen.get(k)} and ${a}`);
      seen.set(k, a);
    }
  }
});

test('every label is a short printed word or glyph, and none names Esc', () => {
  for (const a of ACTIONS) {
    const { label } = KEYS[a];
    assert.ok(label.length > 0 && label === label.trim(), a);
    assert.doesNotMatch(label, /esc/i, a);
  }
});

test('presses map to their action whatever the case; Escape maps to nothing', () => {
  assert.equal(actionFor('ArrowUp'), 'up');
  assert.equal(actionFor('W'), 'up');
  assert.equal(actionFor(' '), 'bash');
  assert.equal(actionFor('H'), 'hint');
  assert.equal(actionFor('Escape'), null);
  assert.equal(actionFor('q'), null, 'Q is the kit back key, read with isBackKey');
});

test('the four moves are unit steps and isMove tells them from the rest', () => {
  assert.deepEqual(MOVE_DELTA, { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] });
  assert.equal(isMove('left'), true);
  assert.equal(isMove('hint'), false);
  assert.equal(isMove(null), false);
});

test('a tool is found by the key its definition prints, and no tool key is in the table', () => {
  for (const kind of Object.keys(ITEMS) as (keyof typeof ITEMS)[]) {
    const printed = ITEMS[kind].key;
    assert.equal(itemFor(printed, ITEMS), kind);
    assert.equal(itemFor(printed.toLowerCase(), ITEMS), kind);
    assert.equal(actionFor(printed), null, `${printed} is a tool key and an action key`);
  }
  assert.equal(itemFor('q', ITEMS), null);
});

// Escape is never bound: no source file of the page names it outside a comment.
const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const sources = (dir: string): string[] => readdirSync(dir, { withFileTypes: true })
  .flatMap(e => e.isDirectory() ? sources(join(dir, e.name)) : /\.tsx?$/.test(e.name) ? [join(dir, e.name)] : []);
test('no source of the page binds Escape', () => {
  for (const f of sources(join(import.meta.dirname, '..', 'src'))) {
    assert.doesNotMatch(strip(readFileSync(f, 'utf8')), /['"`](Escape|esc)['"`]/i, f);
  }
});
