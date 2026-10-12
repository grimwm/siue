// The shipped key table (spec 6.3): what is bound, what is left free, the caps
// the chips print, and the Shift+arrow drive chord coming apart in any order.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { FALLBACK_KEYS, buildKeymap, lookupKey, keycap, createInput } from '../src/input.ts';

const GAME = JSON.parse(fs.readFileSync(new URL('../game.json', import.meta.url), 'utf8'));
const map = buildKeymap(GAME.keys);
const ev = o => ({ key: '', code: '', repeat: false, preventDefault() {}, ...o });
const arrowLeft = (o = {}) => ev({ code: 'ArrowLeft', key: 'ArrowLeft', ...o });
const shift = (o = {}) => ev({ code: 'ShiftLeft', key: 'Shift', ...o });
function rig() {
  const input = createInput({ touch: false });
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

test('Space or Ctrl fires, and G, Esc, L, ], H, M, E, F each do their one job', () => {
  for (const [code, key] of [['Space', ' '], ['ControlLeft', 'Control'], ['ControlRight', 'Control']]) {
    assert.equal(lookupKey(map, 'global', { code, key }), 'fire', code);
  }
  const want = [['KeyG', 'g', 'guns'], ['Escape', 'Escape', 'escape'], ['KeyL', 'l', 'log'], ['BracketRight', ']', 'nextTrack'],
    ['KeyH', 'h', 'help'], ['KeyM', 'm', 'music'], ['KeyE', 'e', 'sound'], ['KeyF', 'f', 'fullscreen']];
  for (const [code, key, action] of want) assert.equal(lookupKey(map, 'global', { code, key }), action, code);
});

test('W, A, S, D, Q and C are bound in no context, and nothing cycles weapons', () => {
  for (const [ctx, actions] of Object.entries(GAME.keys)) {
    for (const [action, tokens] of Object.entries(actions)) {
      for (const t of tokens) assert.doesNotMatch(t, /^(Key[WASDQC]|[wasdqc])$/i, `${ctx}.${action} binds ${t}`);
    }
  }
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
  assert.equal(keycap('Escape'), 'Esc');
  assert.equal(keycap('BracketRight'), ']');
  assert.equal(keycap('KeyG'), 'G');
  assert.equal(keycap('g'), 'G');
});

test('the first token is the one shown: Space for fire, Shift+← for driving, Esc for the menu', () => {
  const input = rig();
  assert.equal(input.hint('global', 'fire'), 'Space');
  assert.equal(input.hint('global', 'fire', 2), 'Ctrl');
  assert.equal(input.hint('aim', 'driveLeft'), 'Shift+←');
  assert.equal(input.hint('global', 'escape'), 'Esc');
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
