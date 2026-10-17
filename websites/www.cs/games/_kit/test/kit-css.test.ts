import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const css = readFileSync(join(import.meta.dirname, '..', 'kit.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

test('every kit.css selector involves a .kit- class, so the sheet is inert without one', () => {
  const preludes = [...css.matchAll(/([^{}]+)\{/g)].map(m => (m[1] ?? '').trim()).filter(p => !p.startsWith('@'));
  assert.ok(preludes.length > 0);
  for (const prelude of preludes) {
    for (const selector of prelude.split(',')) {
      assert.match(selector, /\.kit-[a-z]/, `selector without a .kit- class: ${selector.trim()}`);
    }
  }
});

test('every custom property kit.css declares or reads starts with --kit-', () => {
  for (const m of css.matchAll(/(?:^|[\s;{(])(--[a-z0-9-]+)/g)) {
    assert.ok((m[1] ?? '').startsWith('--kit-'), `property ${m[1]}`);
  }
});

test('the key chip colors come from --kit-key-* properties', () => {
  for (const name of ['--kit-key-bg', '--kit-key-color', '--kit-key-border', '--kit-key-font']) {
    assert.ok(css.includes(`var(${name}`), name);
  }
});

test('the key tab is a zero-specificity :where() rule driven by --kit-key-tab-* properties', () => {
  assert.match(css, /:where\(\.kit-key-tab\)\s*\{/);
  for (const name of ['position', 'top', 'right', 'height', 'padding', 'size', 'font', 'color', 'bg', 'border', 'edge', 'radius', 'shine']) {
    assert.ok(css.includes(`var(--kit-key-tab-${name}`), name);
  }
});

test('tabs hide on touch screens, in a game frame under 760px wide, and when empty', () => {
  assert.match(css, /@media \(hover: none\), \(pointer: coarse\)\s*\{\s*:where\(\.kit-key-tab\)\s*\{\s*display:\s*none/);
  assert.match(css, /@container \(max-width: 760px\)\s*\{\s*:where\(\.kit-key-tab\)\s*\{\s*display:\s*none/);
  assert.match(css, /:where\(\.kit-key-tab\):empty\s*\{\s*display:\s*none/);
});
