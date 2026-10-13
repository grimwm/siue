// The How to play overlay: every key in the shipped table is listed with its
// live cap, the prose for touch screens names no key, and a new table
// rewrites the list in place.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { document, makeEl, click } from '../../_kit/test/dom-stub.mjs';
import { importTsx } from '../../_kit/test/tsx.ts';
import { createInput } from '../src/input.ts';

globalThis.document = document;
const { help } = await importTsx(import.meta.dirname, { help: '../src/ui/help.tsx' });
const GAME = JSON.parse(fs.readFileSync(new URL('../game.json', import.meta.url), 'utf8'));
const input = createInput({ touch: false });
input.setKeys(GAME.keys);
const keyHint = (c, a, i) => input.hint(c, a, i);
const walk = (el, out = []) => { for (const c of el.children || []) { out.push(c); walk(c, out); } return out; };
const hasClass = (el, name) => String(el.className || '').split(' ').includes(name);

function draw(hint = keyHint) {
  const section = makeEl('help-overlay');
  const calls = { closed: 0 };
  help.renderHelp(section, { keyHint: hint, onClose: () => { calls.closed++; } });
  return { section, calls };
}
const keyList = section => walk(section).find(n => hasClass(n, 'help-keys'));
const capOf = (section, at) => walk(keyList(section)).find(n => n.getAttribute?.('data-keyhint') === at)?.textContent;

test('Help lists every action in the key table, and only those', () => {
  const { section } = draw();
  const rows = walk(keyList(section)).filter(n => n.localName === 'dt')
    .map(dt => walk(dt).map(n => n.getAttribute?.('data-keyhint')).filter(Boolean)[0].split(':').slice(0, 2).join(':'));
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
  for (const el of touch) assert.ok(walk(el).every(n => n.getAttribute?.('data-keyhint') === undefined));
});

test('the title bar closes the panel', () => {
  const { section, calls } = draw();
  click(walk(section).find(n => n.id === 'help-close'));
  assert.equal(calls.closed, 1);
});

test('a remapped table rewrites the list in place', () => {
  const section = makeEl('help-redraw');
  help.renderHelp(section, { keyHint, onClose() {} });
  const list = keyList(section);
  help.renderHelp(section, { keyHint: (c, a, i) => keyHint(c, a, i).toLowerCase(), onClose() {} });
  assert.equal(keyList(section), list);
  assert.equal(capOf(section, 'global:back'), 'q');
});
