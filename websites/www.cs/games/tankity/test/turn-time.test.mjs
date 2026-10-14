// A room's turn time (src/turn-time.ts): the host's seven stops, kept equal to
// the server's list, their labels, how a clock reads at any length, the notes
// the status bar and the shop add, and the slider (src/ui/turn-time.tsx).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { document, makeEl, fire } from '../../_kit/test/dom-stub.mjs';
import { importTsx } from '../../_kit/test/tsx.ts';
import {
  TURN_STOPS, TURN_DEFAULT, TURN_LABELS, TURN_LONG_S, turnIndex, turnLabel, clockText, turnNote, shopNote,
} from '../src/turn-time.ts';

globalThis.document = document;
const { tt } = await importTsx(import.meta.dirname, { tt: '../src/ui/turn-time.tsx' });
const walk = (el, out = []) => { for (const c of el.children || []) { out.push(c); walk(c, out); } return out; };
const byId = (el, id) => walk(el).find(n => n.id === id);
const byTag = (el, tag) => walk(el).filter(n => n.localName === tag);

const settings = fs.readFileSync(path.join(import.meta.dirname, '..', 'server', 'settings.php'), 'utf8');

test('the stops and the default match server/settings.php', () => {
  const stops = /const ROOM_TURN_STOPS = \[([^\]]+)\]/.exec(settings);
  const def = /const ROOM_TURN_DEFAULT = (\d+)/.exec(settings);
  assert.ok(stops && def);
  assert.deepEqual([...TURN_STOPS], stops[1].split(',').map(n => Number(n.trim())));
  assert.equal(TURN_DEFAULT, Number(def[1]));
  assert.equal(TURN_LABELS.length, TURN_STOPS.length);
});

test('labels and indexes; anything not a stop reads as the default', () => {
  assert.deepEqual(TURN_STOPS.map(turnLabel), ['Lightning · 1 min', '2 min', '10 min', '30 min', '8 h', '24 h', '1 week']);
  assert.equal(turnIndex(600), 2);
  assert.equal(turnIndex(777), 1);
  assert.equal(turnLabel(777), '2 min');
});

test('a clock reads in seconds, m:ss, hours and minutes, or days and hours', () => {
  assert.equal(clockText(45.2), '46 s');
  assert.equal(clockText(0), '0 s');
  assert.equal(clockText(-3), '0 s');
  assert.equal(clockText(599), '9:59');
  assert.equal(clockText(600), '10:00');
  assert.equal(clockText(3600), '1h 0m');
  assert.equal(clockText(28799), '7h 59m');
  assert.equal(clockText(86400), '1d 0h');
  assert.equal(clockText(604799), '6d 23h');
});

test('the status bar shows the time left on long turns only', () => {
  assert.equal(TURN_LONG_S, 600);
  assert.equal(turnNote(28800, 3600, null), ' · 1h 0m left');
  assert.equal(turnNote(600, 599, null), ' · 9:59 left');
  assert.equal(turnNote(120, 100, null), '');
  assert.equal(turnNote(28800, null, null), '');
});

test('a room that closes before the turn ends says so instead of the turn clock', () => {
  // A 24 h turn in a room played from one connection: it closes in 10 minutes unless someone plays.
  assert.equal(turnNote(86400, 86000, 540), ' · Room closes in 9:00 unless someone plays');
  // Even a quick turn shows it when the room goes first.
  assert.equal(turnNote(120, 100, 40), ' · Room closes in 40 s unless someone plays');
  // A close after the turn ends is not news.
  assert.equal(turnNote(28800, 3600, 7200), ' · 1h 0m left');
  // With no clock running (a drone's turn), the close is not shown.
  assert.equal(turnNote(28800, null, 300), '');
});

test('the shop line counts its own close, or the room\'s when that comes first', () => {
  assert.equal(shopNote(600, null), ' · shop closes in 10:00');
  assert.equal(shopNote(86400, null), ' · shop closes in 1d 0h');
  assert.equal(shopNote(86400, 590), ' · room closes in 9:50 unless someone plays');
  assert.equal(shopNote(90, 600), ' · shop closes in 1:30');
  assert.equal(shopNote(null, 600), '');
});

test('the slider: seven stops, its label in an output and for readers, input reports seconds', () => {
  const box = makeEl('box');
  const got = [];
  tt.renderTurnTime(box, { id: 'lobby-turn', secs: 600, onChange: s => got.push(s) });
  const range = byId(box, 'lobby-turn');
  assert.equal(range.localName, 'input');
  assert.equal(range.getAttribute('type'), 'range');
  assert.equal(String(range.getAttribute('min')), '0');
  assert.equal(String(range.getAttribute('max')), '6');
  assert.equal(String(range.getAttribute('step')), '1');
  assert.equal(String(range.value), '2');
  assert.equal(range.getAttribute('aria-valuetext'), '10 min');
  const label = byTag(box, 'label')[0];
  assert.equal(label.getAttribute('for'), 'lobby-turn');
  assert.equal(label.textContent, 'Turn time');
  const out = byTag(box, 'output')[0];
  assert.equal(out.textContent, '10 min');
  range.value = '4';
  fire(range, 'input');
  assert.deepEqual(got, [28800]);
});

test('without the say, the slider is only its label', () => {
  const box = makeEl('box');
  tt.renderTurnTime(box, { id: 'room-turn', secs: 600, disabled: true, onChange: () => {} });
  assert.equal(byId(box, 'room-turn'), undefined);
  assert.equal(byId(box, 'room-turn-label').textContent, 'Turn time: 10 min');
});
