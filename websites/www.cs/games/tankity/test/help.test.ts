// The How to play overlay: every key in the shipped table is listed with its
// live cap, the prose for touch screens names no key, and a new table
// rewrites the list in place.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { asElement, byId, click, installDocument, makeEl, walk } from '../../_kit/test/dom-stub.ts';
import type { StubElement } from '../../_kit/test/dom-stub.ts';
import { importTsx } from '../../_kit/test/tsx.ts';
import { createInput } from '../src/input.ts';
import type { KeyDefs } from '../src/input.ts';
import type { KeyHintFn } from '../src/ui/chrome.tsx';

installDocument();
const { help } = await importTsx<{ help: typeof import('../src/ui/help.tsx') }>(import.meta.dirname, { help: '../src/ui/help.tsx' });
const GAME: { keys: KeyDefs } = JSON.parse(fs.readFileSync(new URL('../game.json', import.meta.url), 'utf8'));
const input = createInput({ touch: false });
input.setKeys(GAME.keys);
const keyHint: KeyHintFn = (c, a, i) => input.hint(c, a, i);
const hasClass = (el: StubElement, name: string) => String(el.className || '').split(' ').includes(name);

/** Item `i` of a list the case reads, which must be there. */
function nth<T>(list: readonly T[], i: number): T {
  const v = list[i];
  assert.ok(v !== undefined, `no item ${i} of ${list.length}`);
  return v;
}

function draw(hint: KeyHintFn = keyHint) {
  const section = makeEl('help-overlay');
  const calls = { closed: 0 };
  help.renderHelp(asElement(section), { keyHint: hint, onClose: () => { calls.closed++; } });
  return { section, calls };
}
const keyList = (section: StubElement): StubElement => {
  const list = walk(section).find(n => hasClass(n, 'help-keys'));
  assert.ok(list, 'no key list');
  return list;
};
const capOf = (section: StubElement, at: string) => {
  const cap = walk(keyList(section)).find(n => n.getAttribute('data-keyhint') === at);
  assert.ok(cap, `no cap for ${at}`);
  return cap.textContent;
};

test('Help lists every action in the key table, and only those', () => {
  const { section } = draw();
  const rows = walk(keyList(section)).filter(n => n.localName === 'dt')
    .map(dt => nth(walk(dt).map(n => n.getAttribute('data-keyhint')).filter((v): v is string => !!v), 0).split(':').slice(0, 2).join(':'));
  const bound = Object.entries(GAME.keys).flatMap(([ctx, actions]) => Object.keys(actions).map(a => `${ctx}:${a}`));
  assert.deepEqual([...rows].sort(), bound.sort(), 'each action has exactly one row');
});

test('Help names both fire keys, Space or Ctrl', () => {
  const { section } = draw();
  assert.equal(capOf(section, 'global:fire'), keyHint('global', 'fire'));
  assert.equal(capOf(section, 'global:fire:2'), keyHint('global', 'fire', 2));
  assert.match(keyHint('global', 'fire', 2), /^Ctrl$/);
});

test('each key shows its cap from the live table', () => {
  const { section } = draw();
  assert.equal(capOf(section, 'aim:driveLeft'), 'Shift+←');
  assert.equal(capOf(section, 'aim:barrelLeft'), '←');
  assert.equal(capOf(section, 'global:fire'), 'Space');
  assert.equal(capOf(section, 'global:back'), 'Q');
  assert.equal(capOf(section, 'shop:buyRow:0'), '1');
  assert.equal(capOf(section, 'shop:buyRow:8'), '9');
});

test('the key list is for keyboards; the touch prose names no key', () => {
  const { section } = draw();
  assert.ok(hasClass(keyList(section), 'keys-only'));
  const touch = walk(section).filter(n => hasClass(n, 'touch-only'));
  assert.ok(touch.length >= 1);
  for (const el of touch) assert.ok(walk(el).every(n => n.getAttribute('data-keyhint') === undefined));
});

test('the title bar closes the panel', () => {
  const { section, calls } = draw();
  click(byId(section, 'help-close'));
  assert.equal(calls.closed, 1);
});

test('a remapped table rewrites the list in place', () => {
  const section = makeEl('help-redraw');
  help.renderHelp(asElement(section), { keyHint, onClose() {} });
  const list = keyList(section);
  help.renderHelp(asElement(section), { keyHint: (c, a, i) => keyHint(c, a, i).toLowerCase(), onClose() {} });
  assert.equal(keyList(section), list);
  assert.equal(capOf(section, 'global:back'), 'q');
});
