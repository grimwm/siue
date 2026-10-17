// Crete's keyboard: Q is the kit's back key (it opens the menu, closes what is open, and the title card keeps it),
// a letter typed into the seed box is only a letter, game keys wait while a card is up, and Escape is never bound.
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { importTsx } from '../../_kit/test/tsx.ts';
import { fireDocument, installDocument } from '../../_kit/test/dom-stub.ts';
import { ITEMS } from '../src/engine.ts';
import type { Game } from '../src/engine.ts';
import type { Controls, UiDeps } from '../src/ui.ts';

installDocument();
const { ui } = await importTsx<{ ui: typeof import('../src/ui.ts') }>(import.meta.dirname, { ui: '../src/ui.ts' });

const calls: string[] = [];
const note = (name: string) => () => { calls.push(name); };
// Only the members the key handler touches; the cast says so.
const game = {
  G: { over: false, auto: false },
  toggleAuto: note('auto'), toggleAnswer: note('route'), hint: note('hint'), bash: note('bash'),
  tryMove: note('move'), useItem: note('item'), stopAuto: note('stop'),
} as unknown as Game;
const controls: Controls = {
  game, restart: note('restart'), toggleMute: note('mute'), toggleFullscreen: note('fullscreen'),
  wake: note('wake'), quit: note('quit'), play: note('play'),
};
// createUi keeps these for drawing; the key handler reads only ITEMS.
const deps = { ROWS: 1, COLS: 1, MAX_HP: 1, TOTAL_PAGES: 1, ITEMS, key: () => '', heart: () => {} } as unknown as UiDeps;
const page = ui.createUi(deps);
page.bindControls(controls);

beforeEach(() => { page.closeLayers(); });

const press = (key: string, extra: Record<string, unknown> = {}) => {
  calls.length = 0;
  const ev = fireDocument('keydown', { key, target: { tagName: 'DIV' }, ...extra });
  return { ev, calls: calls.filter(c => c !== 'wake' && c !== 'stop') };
};

test('Q opens the menu, the next Q closes it, and neither quits the game', () => {
  for (const key of ['q', 'Q']) {
    const first = press(key);
    assert.equal(page.top(), 'menu', key);
    assert.deepEqual(first.calls, [], key);
    assert.equal(first.ev.prevented, true);
    press(key);
    assert.equal(page.top(), null, key);
  }
});

test('Q under the title card does nothing; N and M still reach the game', () => {
  page.showTitle(false);
  assert.deepEqual(press('q').calls, []);
  assert.equal(page.top(), 'title');
  assert.deepEqual(press('n').calls, ['restart']);
  assert.deepEqual(press('m').calls, ['mute']);
});

test('a held Q acts once, and a chord with Ctrl, Cmd or Alt is the browser\'s', () => {
  assert.deepEqual(press('q', { repeat: true }).calls, []);
  assert.equal(page.top(), null);
  for (const chord of ['ctrlKey', 'metaKey', 'altKey']) {
    press('q', { [chord]: true });
    assert.equal(page.top(), null, chord);
  }
  press('q', { isComposing: true });
  assert.equal(page.top(), null);
});

test('keys typed into the seed box, or a textarea, do nothing, Q included', () => {
  for (const tagName of ['INPUT', 'TEXTAREA']) {
    for (const key of ['q', 'n', 'm', 'h', ' ', 'ArrowUp']) {
      const { ev, calls } = press(key, { target: { tagName, type: tagName === 'INPUT' ? 'text' : undefined } });
      assert.deepEqual(calls, [], `${tagName} ${key}`);
      assert.equal(ev.prevented, false);
      assert.equal(page.top(), null, `${tagName} ${key} opened a card`);
    }
  }
});

test('Escape does nothing, with nothing open and with the menu open', () => {
  for (const open of [false, true]) {
    if (open) press('q');
    const { ev, calls } = press('Escape');
    assert.deepEqual(calls, []);
    assert.equal(ev.prevented, false);
    assert.equal(page.top(), open ? 'menu' : null);
  }
});

test('game keys wait while a card is up; Q, N and M do not', () => {
  press('q');
  for (const key of ['h', 'v', 't', ' ', 'ArrowUp']) assert.deepEqual(press(key).calls, [], key);
  assert.deepEqual(press(ITEMS.shard.key.toLowerCase()).calls, []);
  assert.deepEqual(press('m').calls, ['mute']);
  assert.deepEqual(press('n').calls, ['restart']);
});

test('with nothing open, the other keys reach the game, and a tool key uses its tool', () => {
  assert.deepEqual(press('m').calls, ['mute']);
  assert.deepEqual(press('h').calls, ['hint']);
  assert.deepEqual(press('v').calls, ['route']);
  assert.deepEqual(press('t').calls, ['auto']);
  assert.deepEqual(press('ArrowUp').calls, ['move']);
  assert.deepEqual(press('s').calls, ['move']);
  assert.deepEqual(press(' ').calls, ['bash']);
  for (const kind of Object.keys(ITEMS) as (keyof typeof ITEMS)[]) assert.deepEqual(press(ITEMS[kind].key).calls, ['item'], kind);
});
