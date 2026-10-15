// The shipped key table (spec 6.3): what is bound, what is left free, the caps
// the chips print, and the Shift+arrow drive chord coming apart in any order.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { FALLBACK_KEYS, buildKeymap, lookupKey, keycap, createInput, gridCommand } from '../src/input.ts';
import type { Command, CommandTable, KeyDefs, KeyLike } from '../src/input.ts';
/** A pad button's tap timer, for tests that tap none. */
const NO_TIMER = (): void => {};

const GAME: { keys: KeyDefs } = JSON.parse(fs.readFileSync(new URL('../game.json', import.meta.url), 'utf8'));
const map = buildKeymap(GAME.keys);
/** A key event that counts its preventDefault calls. */
type Ev = KeyLike & { prevented: number };
type EvInit = Omit<KeyLike, 'preventDefault'>;
const ev = (o: EvInit): Ev => {
  const e: Ev = { key: '', code: '', repeat: false, prevented: 0, ...o, preventDefault: () => { e.prevented++; } };
  return e;
};
const arrowLeft = (o: EvInit = {}) => ev({ code: 'ArrowLeft', key: 'ArrowLeft', ...o });
const shift = (o: EvInit = {}) => ev({ code: 'ShiftLeft', key: 'Shift', ...o });
function rig() {
  const input = createInput({ touch: false, setTimeout: NO_TIMER });
  input.setKeys(GAME.keys);
  return input;
}

test('arrows aim; Shift+arrows drive', () => {
  assert.equal(lookupKey(map, 'aim', { code: 'ArrowLeft', key: 'ArrowLeft' }), 'barrelLeft');
  assert.equal(lookupKey(map, 'aim', { code: 'ArrowRight', key: 'ArrowRight' }), 'barrelRight');
  assert.equal(lookupKey(map, 'aim', { code: 'ArrowUp', key: 'ArrowUp' }), 'powerUp');
  assert.equal(lookupKey(map, 'aim', { code: 'ArrowDown', key: 'ArrowDown' }), 'powerDown');
  assert.equal(lookupKey(map, 'aim', { code: 'ArrowLeft', key: 'ArrowLeft', shiftKey: true }), 'driveLeft');
  assert.equal(lookupKey(map, 'aim', { code: 'ArrowRight', key: 'ArrowRight', shiftKey: true }), 'driveRight');
});

test('Space or Ctrl fires, and G, Q, L, ], H, M, E, F each do their one job', () => {
  for (const [code, key] of [['Space', ' '], ['ControlLeft', 'Control'], ['ControlRight', 'Control']] satisfies [string, string][]) {
    assert.equal(lookupKey(map, 'global', { code, key }), 'fire', code);
  }
  const want = [['KeyG', 'g', 'guns'], ['KeyQ', 'q', 'back'], ['KeyL', 'l', 'log'], ['BracketRight', ']', 'nextTrack'],
    ['KeyH', 'h', 'help'], ['KeyM', 'm', 'music'], ['KeyE', 'e', 'sound'], ['KeyF', 'f', 'fullscreen']] satisfies [string, string, string][];
  for (const [code, key, action] of want) assert.equal(lookupKey(map, 'global', { code, key }), action, code);
});

test('W, A, S, D and C are bound in no context, Q only goes back, and nothing cycles weapons', () => {
  const q: string[] = [];
  for (const [ctx, actions] of Object.entries(GAME.keys)) {
    for (const [action, tokens] of Object.entries(actions)) {
      for (const t of tokens) assert.doesNotMatch(t, /^(Key[WASDC]|[wasdc])$/i, `${ctx}.${action} binds ${t}`);
      if (tokens.some(t => /^(KeyQ|q)$/i.test(t))) q.push(`${ctx}.${action}`);
    }
  }
  // Q is free in every other context: the held aim keys, the shop, the scroll keys and the gun grid.
  assert.deepEqual(q.sort(), ['global.back', 'shop.close']);
  for (const ctx of ['aim', 'scroll']) assert.equal(lookupKey(map, ctx, { code: 'KeyQ', key: 'q' }), null, ctx);
  assert.equal(gridCommand('q'), null);
  assert.equal(GAME.keys.global.cycle, undefined);
  assert.equal(GAME.keys.global.menu, undefined);
});

test('the frozen fallback is the table game.yaml ships', () => {
  assert.deepEqual(JSON.parse(JSON.stringify(FALLBACK_KEYS)), GAME.keys);
});

test('chips print keys the way a keyboard does', () => {
  assert.deepEqual(['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown'].map(keycap), ['←', '↑', '→', '↓']);
  assert.equal(keycap('Shift+ArrowLeft'), 'Shift+←');
  assert.equal(keycap('Space'), 'Space');
  assert.equal(keycap(' '), 'Space');
  assert.equal(keycap('KeyQ'), 'Q');
  assert.equal(keycap('BracketRight'), ']');
  assert.equal(keycap('KeyG'), 'G');
  assert.equal(keycap('g'), 'G');
});

test('the first token is the one shown: Space for fire, Shift+← for driving, Q for the menu', () => {
  const input = rig();
  assert.equal(input.hint('global', 'fire'), 'Space');
  assert.equal(input.hint('global', 'fire', 2), 'Ctrl');
  assert.equal(input.hint('aim', 'driveLeft'), 'Shift+←');
  assert.equal(input.hint('global', 'back'), 'Q');
  assert.equal(input.hint('shop', 'close'), 'Q');
});

test('chord: Shift then ← drives; letting Shift go first stops the drive', () => {
  const input = rig();
  input.keydown(shift({ shiftKey: true }));
  input.keydown(arrowLeft({ shiftKey: true }));
  assert.ok(input.held.has('driveLeft'));
  assert.ok(!input.held.has('barrelLeft'));
  input.keyup(shift());
  assert.ok(!input.held.has('driveLeft'));
  input.keyup(arrowLeft());
  assert.ok(!input.held.has('barrelLeft') && !input.held.has('driveLeft'));
});

test('chord: letting ← go first, Shift still down, stops the drive too', () => {
  const input = rig();
  input.keydown(shift({ shiftKey: true }));
  input.keydown(arrowLeft({ shiftKey: true }));
  input.keyup(arrowLeft({ shiftKey: true }));
  assert.ok(!input.held.has('driveLeft'));
  input.keyup(shift());
  assert.ok(!input.held.has('driveLeft') && !input.held.has('barrelLeft'));
});

test('chord: Shift pressed during a barrel hold turns it into a drive, never both', () => {
  const input = rig();
  input.keydown(arrowLeft());
  assert.ok(input.held.has('barrelLeft'));
  input.keydown(arrowLeft({ shiftKey: true, repeat: true }));
  assert.ok(input.held.has('driveLeft'));
  assert.ok(!input.held.has('barrelLeft'));
  input.keydown(arrowLeft({ repeat: true }));
  assert.ok(input.held.has('barrelLeft'));
  assert.ok(!input.held.has('driveLeft'));
});

test('chord: Shift going down mid-hold drives at once, with no further repeat from the arrow', () => {
  const input = rig();
  input.keydown(arrowLeft());
  assert.ok(input.held.has('barrelLeft'));
  input.keydown(shift({ shiftKey: true }));
  assert.ok(input.held.has('driveLeft'));
  assert.ok(!input.held.has('barrelLeft'));
});

test('letting go of Shift with an arrow still down goes back to aiming at once', () => {
  const input = rig();
  input.keydown(arrowLeft());
  input.keydown(shift({ shiftKey: true }));
  assert.ok(input.held.has('driveLeft') && !input.held.has('barrelLeft'));
  input.keyup(shift({ shiftKey: false }));
  assert.ok(input.held.has('barrelLeft') && !input.held.has('driveLeft'));
});

test('card: Space presses the focused card button, never fires, never scrolls', () => {
  const input = rig();
  const calls: string[] = [];
  input.register({ fire: () => { calls.push('fire'); } }, { cardOpen: () => true });
  let clicked = 0, prevented = 0;
  input.keydown({ ...ev({ code: 'Space', key: ' ' }), target: { tagName: 'BUTTON', click: () => { clicked++; } }, preventDefault: () => { prevented++; } });
  assert.equal(clicked, 1);
  assert.equal(prevented, 1);
  assert.deepEqual(calls, []);
});

test('card: the aim keys hold nothing, and the letter keys still reach their commands', () => {
  const input = rig();
  const calls: string[] = [];
  const log = (name: string) => () => { calls.push(name); };
  input.register({ new: log('new'), rooms: log('rooms'), back: log('back') }, { cardOpen: () => true });
  input.keydown(arrowLeft());
  assert.ok(!input.held.has('barrelLeft'));
  for (const [code, key] of [['KeyN', 'n'], ['KeyO', 'o'], ['Escape', 'Escape'], ['KeyQ', 'q']] satisfies [string, string][]) input.keydown(ev({ code, key }));
  assert.deepEqual(calls, ['new', 'rooms', 'back']);
});

test('card: with no button focused, the fire key reaches the game (which explains the demo)', () => {
  const input = rig();
  const calls: string[] = [];
  input.register({ fire: () => { calls.push('fire'); } }, { cardOpen: () => true });
  input.keydown(ev({ code: 'Space', key: ' ' }));
  assert.deepEqual(calls, ['fire']);
});

test('card: Ctrl alone never presses the focused card button; it only reaches fire', () => {
  const input = rig();
  const calls: string[] = [];
  input.register({ fire: () => { calls.push('fire'); } }, { cardOpen: () => true });
  let clicked = 0;
  input.keydown({ ...ev({ code: 'ControlLeft', key: 'Control', ctrlKey: true }), target: { tagName: 'BUTTON', click: () => { clicked++; } } });
  assert.equal(clicked, 0);
  assert.deepEqual(calls, ['fire']);
});

test('overlay: Space and Enter press the focused button (the end card\'s Play again), never fire', () => {
  const input = rig();
  const calls: string[] = [];
  input.register({ fire: () => { calls.push('fire'); }, buy: () => { calls.push('buy'); return true; } }, { overlayOpen: () => true, shopLive: () => true });
  let clicked = 0, prevented = 0;
  const onButton = (o: EvInit) => ({ ...ev(o), target: { tagName: 'BUTTON', click: () => { clicked++; } }, preventDefault: () => { prevented++; } });
  input.keydown(onButton({ code: 'Space', key: ' ' }));
  input.keydown(onButton({ code: 'Enter', key: 'Enter' }));
  input.keydown(onButton({ code: 'Space', key: ' ', repeat: true }));
  assert.equal(clicked, 2);
  assert.equal(prevented, 3);
  assert.deepEqual(calls, []);
});

test('shop: after a Buy click drops its focus, Enter buys the selected row, not the row last clicked', () => {
  const input = rig();
  const bought: number[] = [];
  let selected = 0;
  input.register({ buy: () => { bought.push(selected); return true; }, selDown: () => { selected++; return true; } }, { overlayOpen: (t: { tagName?: string }) => t.tagName === 'BUTTON', shopLive: () => true });
  // The click on row 0's Buy blurred it (shop.tsx), so the focus is on the page; the arrow moves the selection.
  const onPage = (o: EvInit) => ({ ...ev(o), target: { tagName: 'BODY' }, preventDefault: () => {} });
  input.keydown(onPage({ code: 'ArrowDown', key: 'ArrowDown' }));
  input.keydown(onPage({ code: 'Enter', key: 'Enter' }));
  assert.deepEqual(bought, [1]);
});

test('overlay: Ctrl never presses the focused button', () => {
  const input = rig();
  let clicked = 0;
  input.register({ fire: () => {} }, { overlayOpen: () => true });
  input.keydown({ ...ev({ code: 'ControlLeft', key: 'Control', ctrlKey: true }), target: { tagName: 'BUTTON', click: () => { clicked++; } } });
  assert.equal(clicked, 0);
});

test('battlefield: with no overlay up, Space on a focused button fires', () => {
  const input = rig();
  const calls: string[] = [];
  input.register({ fire: () => { calls.push('fire'); } }, { overlayOpen: () => false });
  let clicked = 0;
  input.keydown({ ...ev({ code: 'Space', key: ' ' }), target: { tagName: 'BUTTON', click: () => { clicked++; } } });
  assert.equal(clicked, 0);
  assert.deepEqual(calls, ['fire']);
});

test('a text box keeps every key: Q types a letter there, and Esc does nothing', () => {
  const input = rig();
  const calls: string[] = [];
  input.register({ back: () => { calls.push('back'); }, close: () => { calls.push('close'); return true; }, new: () => { calls.push('new'); } },
    { shopLive: () => true });
  const inBox = (o: EvInit) => ev({ ...o, target: { tagName: 'INPUT' } });
  const keys = [inBox({ code: 'KeyQ', key: 'q' }), inBox({ code: 'Escape', key: 'Escape' }), inBox({ code: 'KeyN', key: 'n' })];
  for (const k of keys) input.keydown(k);
  assert.deepEqual(calls, []);
  assert.deepEqual(keys.map(k => k.prevented), [0, 0, 0]);
});

test('Esc maps to no action in any context, in game.json and in the fallback', () => {
  for (const table of [GAME.keys, FALLBACK_KEYS]) {
    const m = buildKeymap(table);
    for (const ctx of Object.keys(table)) {
      for (const mods of [{}, { shiftKey: true }, { ctrlKey: true }]) {
        assert.equal(lookupKey(m, ctx, { code: 'Escape', key: 'Escape', ...mods }), null, `${ctx} ${JSON.stringify(mods)}`);
      }
    }
  }
  assert.equal(gridCommand('Escape'), null);
});

test('Esc reaches no command in any state: shop, aim, gun grid, card, overlay or question', () => {
  const input = rig();
  const calls: string[] = [];
  const table: CommandTable = {};
  for (const name of ['back', 'close', 'fire', 'new', 'guns', 'lineDown', 'pageDown', 'gridLeft', 'confirm', 'digit', 'selUp', 'buy', 'preview', 'next'] satisfies Command[]) {
    table[name] = () => { calls.push(name); return true; };
  }
  let modal = false;
  input.register(table, {
    shopLive: () => true, cardOpen: () => true, overlayOpen: () => true,
    modalOpen: () => modal, modalBack: () => { calls.push('modalBack'); },
  });
  for (const m of [false, true]) {
    modal = m;
    for (const target of [null, { tagName: 'BUTTON', click: () => { calls.push('click'); } }]) {
      const esc = ev({ code: 'Escape', key: 'Escape', target });
      input.keydown(esc);
      assert.equal(esc.prevented, 0);
    }
  }
  assert.deepEqual(calls, []);
});

test('overlay: a focused button outside the open overlay (the HUD under the radio log) still fires on Space', () => {
  const input = rig();
  const calls: string[] = [];
  const inside = { tagName: 'BUTTON', click: () => { calls.push('inside'); } };
  const outside = { tagName: 'BUTTON', click: () => { calls.push('outside'); } };
  input.register({ fire: () => { calls.push('fire'); } }, { overlayOpen: t => t === inside });
  input.keydown({ ...ev({ code: 'Space', key: ' ' }), target: outside });
  input.keydown({ ...ev({ code: 'Space', key: ' ' }), target: inside });
  assert.deepEqual(calls, ['fire', 'inside']);
});
