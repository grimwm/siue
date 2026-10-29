import { test } from 'node:test';
import assert from 'node:assert/strict';
import { KEYS } from '../src/keys.ts';
import { helpLines } from '../src/help.ts';
import type { Seg } from '../src/help.ts';
import { TOOLS } from '../src/puzzle/tiles.ts';

const text = (lines: Seg[][]) => lines.map(l => l.map(s => (typeof s === 'string' ? s : s.strong)).join('')).join('\n');

test('the help names every key from the key table and the tools', () => {
  const all = text(helpLines(KEYS, TOOLS));
  for (const a of ['wait', 'undo', 'restart', 'hint', 'route', 'auto', 'mute', 'new', 'menu'] as const) assert.ok(all.includes(KEYS[a].label), a);
  for (const t of Object.values(TOOLS)) assert.ok(all.includes(t.key) && all.includes(t.name), t.name);
  assert.doesNotMatch(all, /bash|fuse|seed/i);
  assert.doesNotMatch(all, /\bEsc/i);
});

test('a changed table changes the help', () => {
  const keys = { ...KEYS, hint: { ...KEYS.hint, label: 'J' } };
  assert.match(text(helpLines(keys, TOOLS)), /Hint \(J\)/);
});

test('the move keys come from the table', () => {
  const all = text(helpLines(KEYS, TOOLS));
  assert.match(all, /Move with ↑ ← ↓ → or W A S D;/);
  const keys = { ...KEYS, up: { label: '8', keys: ['8'] } };
  assert.match(text(helpLines(keys, TOOLS)), /Move with 8 ← ↓ → or 8 A S D;/);
});

test('the help states the rules\' key facts', () => {
  const all = text(helpLines(KEYS, TOOLS));
  assert.ok(all.indexOf('horizontal') >= 0 && all.indexOf('horizontal') < all.indexOf('vertical'), 'horizontal before vertical');
  assert.doesNotMatch(all, /longer way/);
  assert.match(all, /gate opens when you take the last/);
  assert.match(all, /green key is kept/);
  assert.match(all, /Red, blue and yellow keys are used up/);
  assert.match(all, /flips every toggle wall/);
  assert.match(all, /Hint \([^)]*\) plays one step/);
  assert.doesNotMatch(all, /step onto the gate/);
});

test("the help names Daedalus's snare, the Bronze ball, the Harpy and Talos's fire, and the turn order", () => {
  const all = text(helpLines(KEYS, TOOLS));
  for (const n of ["Daedalus's snare", 'Bronze ball', 'Harpy', "Talos's fire", 'Pop-up', 'Teleport', 'Thief', 'Bomb', 'Clone']) {
    assert.ok(all.toLowerCase().includes(n.toLowerCase()), n);
  }
  for (const w of ['flippers', 'fire boots', 'skates', 'suction boots', 'only while something stands on it', 'throws you back', 'sent home']) {
    assert.ok(all.includes(w), w);
  }
  assert.match(all, /you, then the hazards, then the Minotaur/);
});

test('the help says what the Music switch does and credits the music and its samples', () => {
  const all = text(helpLines(KEYS, TOOLS));
  assert.match(all, /Music in this menu turns the music off; M silences everything\./);
  assert.match(all, /VSCO-2 Community Edition by Versilian Studios \(CC0\)/);
  assert.match(all, /organ sampled by Simon Dalzell of Ivy Audio/);
});
