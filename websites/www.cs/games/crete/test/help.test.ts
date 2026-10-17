import { test } from 'node:test';
import assert from 'node:assert/strict';
import { KEYS } from '../src/keys.ts';
import { helpLines } from '../src/help.ts';
import type { Seg } from '../src/help.ts';

const text = (lines: Seg[][]) => lines.map(l => l.map(s => (typeof s === 'string' ? s : s.strong)).join('')).join('\n');

test('the help names the keys the table prints', () => {
  const all = text(helpLines(KEYS, ['Z', 'X', 'C']));
  for (const a of ['hint', 'route', 'auto', 'bash', 'mute', 'new', 'menu'] as const) {
    assert.ok(all.includes(KEYS[a].label), a);
  }
  assert.ok(all.includes('Z / X / C'));
});

test('a changed table changes the help', () => {
  const keys = { ...KEYS, hint: { ...KEYS.hint, label: 'J' } };
  assert.match(text(helpLines(keys, ['Z'])), /Hint \(J\)/);
});

test('the help never mentions Esc', () => {
  assert.doesNotMatch(text(helpLines(KEYS, ['Z', 'X', 'C'])), /\bEsc/i);
});
