// Crete's keyboard: Q is Quit with nothing open (the kit's back key), a letter
// typed into the seed box is only a letter, and Escape is never bound.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importTsx } from '../../_kit/test/tsx.ts';
import { fireDocument, installDocument } from '../../_kit/test/dom-stub.ts';
import type { Game } from '../src/engine.ts';
import type { Controls, UiDeps } from '../src/ui.ts';

installDocument();
const { ui } = await importTsx<{ ui: typeof import('../src/ui.ts') }>(import.meta.dirname, { ui: '../src/ui.ts' });

const calls: string[] = [];
const note = (name: string) => () => { calls.push(name); };
// Only the members the key handler touches; the cast says so.
const game = {
  G: { over: false, auto: false },
  toggleAuto: note('auto'), toggleAnswer: note('answer'), hint: note('hint'), bash: note('bash'),
  tryMove: note('move'), useItem: note('item'),
} as unknown as Game;
const controls: Controls = { game, restart: note('restart'), toggleMute: note('mute'), wake: note('wake'), quit: note('quit') };
// createUi only keeps these for drawing; bindControls never reads them.
const deps = { ROWS: 1, COLS: 1, MAX_HP: 1, TOTAL_PAGES: 1, ITEMS: {}, key: () => '', heart: () => {} } as unknown as UiDeps;
ui.createUi(deps).bindControls(controls);

const press = (key: string, extra: Record<string, unknown> = {}) => {
  calls.length = 0;
  const ev = fireDocument('keydown', { key, target: { tagName: 'DIV' }, ...extra });
  return { ev, calls: calls.filter(c => c !== 'wake') };
};

test('Q quits in either case and swallows the key', () => {
  for (const key of ['q', 'Q']) {
    const { ev, calls } = press(key);
    assert.deepEqual(calls, ['quit'], key);
    assert.equal(ev.prevented, true);
  }
});

test('a held Q quits once, and a chord with Ctrl, Cmd or Alt is the browser\'s', () => {
  assert.deepEqual(press('q', { repeat: true }).calls, []);
  for (const chord of ['ctrlKey', 'metaKey', 'altKey']) assert.deepEqual(press('q', { [chord]: true }).calls, [], chord);
  assert.deepEqual(press('q', { isComposing: true }).calls, []);
});

test('keys typed into the seed box, or a textarea, do nothing', () => {
  for (const tagName of ['INPUT', 'TEXTAREA']) {
    for (const key of ['q', 'n', 'm', 'h', ' ', 'ArrowUp']) {
      const { ev, calls } = press(key, { target: { tagName, type: tagName === 'INPUT' ? 'text' : undefined } });
      assert.deepEqual(calls, [], `${tagName} ${key}`);
      assert.equal(ev.prevented, false);
    }
  }
});

test('Escape does nothing', () => {
  const { ev, calls } = press('Escape');
  assert.deepEqual(calls, []);
  assert.equal(ev.prevented, false);
});

test('the other keys still reach the game', () => {
  assert.deepEqual(press('m').calls, ['mute']);
  assert.deepEqual(press('h').calls, ['hint']);
  assert.deepEqual(press('ArrowUp').calls, ['move']);
  assert.deepEqual(press(' ').calls, ['bash']);
});
