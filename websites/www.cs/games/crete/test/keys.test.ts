// Crete's keyboard: Q is the kit's back key (it opens the menu, closes what is open, and the title card keeps it),
// a letter typed into a text box is only a letter, game keys wait while a card is up, and Escape is never bound.
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { importTsx } from '../../_kit/test/tsx.ts';
import { fireDocument, installDocument } from '../../_kit/test/dom-stub.ts';
import { TOOLS } from '../src/puzzle/tiles.ts';
import { createProgress } from '../src/progress.ts';
import type { Atlas } from '../src/board-plan.ts';
import type { Board } from '../src/board.ts';
import type { Game } from '../src/game.ts';
import type { Controls } from '../src/ui.ts';

installDocument();
const { ui } = await importTsx<{ ui: typeof import('../src/ui.ts') }>(import.meta.dirname, { ui: '../src/ui.ts' });

const calls: string[] = [];
const note = (name: string) => () => { calls.push(name); };
// Only the members the key handler touches; the cast says so.
const game = {
  trial: 0, run: null, thread: null, playing: false, anim: null,
  press: (a: unknown) => { calls.push(typeof a === 'string' ? a : (a as { kind: string; dir?: string; tool?: string }).dir ?? (a as { kind: string; tool?: string }).tool ?? (a as { kind: string }).kind); },
  hint: note('hint'), route: note('route'), auto: note('auto'), stop: note('stop'), open: note('open'),
} as unknown as Game;
const controls: Controls = {
  game, toggleMute: note('mute'), toggleFullscreen: note('fullscreen'), wake: note('wake'), quit: note('quit'), play: note('play'),
};
// createUi keeps these for drawing; the key handler reads none of them.
const page = ui.createUi({ atlas: {} as Atlas, board: {} as Board, progress: createProgress(null) });
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

test('Q under the title card does nothing; N opens the level list and M still reaches the game', () => {
  page.showTitle(false);
  assert.deepEqual(press('q').calls, []);
  assert.equal(page.top(), 'title');
  assert.deepEqual(press('n').calls, []);
  assert.equal(page.top(), 'levels');
  assert.deepEqual(press('m').calls, ['mute']);
  press('q');
  assert.equal(page.top(), 'title', 'Q goes back to where the list was opened from');
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

test('keys typed into a text box do nothing, Q included', () => {
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
  for (const key of ['h', 'v', 't', '.', 'u', 'r', 'ArrowUp']) assert.deepEqual(press(key).calls, [], key);
  for (const tool of Object.values(TOOLS)) assert.deepEqual(press(tool.key.toLowerCase()).calls, [], tool.name);
  assert.deepEqual(press('m').calls, ['mute']);
  assert.deepEqual(press('n').calls, []);
  assert.equal(page.top(), 'levels');
});

test('with nothing open, the keys reach the game, and a tool key uses its tool', () => {
  assert.deepEqual(press('m').calls, ['mute']);
  assert.deepEqual(press('h').calls, ['hint']);
  assert.deepEqual(press('v').calls, ['route']);
  assert.deepEqual(press('t').calls, ['auto']);
  assert.deepEqual(press('ArrowUp').calls, ['up']);
  assert.deepEqual(press('s').calls, ['down']);
  assert.deepEqual(press('.').calls, ['wait']);
  assert.deepEqual(press('u').calls, ['undo']);
  assert.deepEqual(press('r').calls, ['restart']);
  for (const [tool, def] of Object.entries(TOOLS)) assert.deepEqual(press(def.key).calls, [tool], tool);
  assert.deepEqual(press(' ').calls, []);
});

test('a card opening stops the play-out', () => {
  calls.length = 0;
  press('q');
  assert.ok(calls.includes('stop'));
});

test('a chord with Ctrl, Cmd or Alt is the browser\'s: no game key acts on it or swallows it', () => {
  for (const chord of ['ctrlKey', 'metaKey', 'altKey']) {
    for (const key of ['r', 't', 'w', 'n', 'm', 'h', 'u', 'v', 'z', '.', 'ArrowUp']) {
      const { ev, calls } = press(key, { [chord]: true });
      assert.deepEqual(calls, [], `${chord} ${key}`);
      assert.equal(ev.prevented, false, `${chord} ${key}`);
    }
  }
  assert.equal(page.top(), null);
});
