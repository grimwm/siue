import { test } from 'node:test';
import assert from 'node:assert/strict';
import { KEYS } from '../src/keys-trial.ts';
import { helpLines } from '../src/help-trial.ts';
import type { Seg } from '../src/help-trial.ts';
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
