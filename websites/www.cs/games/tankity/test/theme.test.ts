// The colour themes: the saved choice (src/theme.ts), the palettes game.css
// gives them, each held to WCAG AA by computing its contrast, and index.html's
// head, which applies the saved theme before the first paint.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { memoryStorage, throwingStorage } from '../../_kit/test/record.ts';
import { THEMES, THEME_PREF, isTheme, themeSetting } from '../src/theme.ts';
import type { ThemeRoot } from '../src/theme.ts';

const GAME_DIR = path.join(import.meta.dirname, '..');
const css = fs.readFileSync(path.join(GAME_DIR, 'game.css'), 'utf8');
const html = fs.readFileSync(path.join(GAME_DIR, 'index.html'), 'utf8');

/** WCAG 2 relative luminance of a #rrggbb colour. */
function luminance(hex: string): number {
  const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  assert.ok(m, `not a #rrggbb colour: ${hex}`);
  const [r, g, b] = [m[1]!, m[2]!, m[3]!].map(h => {
    const c = parseInt(h, 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

/** Each theme's custom properties, from its [data-theme] block in game.css. */
const palettes = new Map<string, Record<string, string>>();
for (const m of css.matchAll(/(?:^|\n)(?::root, )?\[data-theme="([a-z]+)"\] \{([^}]*)\}/g)) {
  const props: Record<string, string> = {};
  for (const d of m[2]!.matchAll(/--([a-z-]+):\s*([^;]+);/g)) props[d[1]!] = d[2]!.trim();
  palettes.set(m[1]!, props);
}
const pal = (key: string) => { const p = palettes.get(key); assert.ok(p, `no palette for ${key}`); return p; };

// The dark surfaces accent text and focus rings sit on: the page, a panel, the
// title card and status bar, and the in-frame cards.
const SURFACES = { bg: '#101308', panel: '#1a1e10', card: '#0c0f2e', wash: '#040420', deck: '#0a0d26', head: '#0e0e40' };

test('five themes, Yellow first', () => {
  assert.deepEqual(THEMES.map(t => t.key), ['yellow', 'lime', 'cyan', 'orange', 'magenta']);
  assert.deepEqual(THEMES.map(t => t.name), ['Yellow', 'Lime', 'Cyan', 'Orange', 'Magenta']);
  assert.ok(isTheme('lime') && !isTheme('LIME') && !isTheme('') && !isTheme(null));
});

test('game.css has a palette for each theme and no other, and Yellow is also :root', () => {
  assert.deepEqual([...palettes.keys()].sort(), THEMES.map(t => t.key).sort());
  assert.match(css, /\n:root, \[data-theme="yellow"\] \{/);
  for (const t of THEMES) {
    const p = pal(t.key);
    for (const prop of ['accent', 'accent-hover', 'accent-ink', 'accent-rgb', 'focus']) assert.ok(p[prop], `${t.key} sets --${prop}`);
    const hex = p.accent!;
    const rgb = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)).join(', ');
    assert.equal(p['accent-rgb'], rgb, `${t.key}: --accent-rgb is --accent`);
  }
});

test('every theme reads at WCAG AA: button text 4.5:1 on the fill and its hover', () => {
  for (const t of THEMES) {
    const p = pal(t.key);
    const onFill = contrast(p['accent-ink']!, p.accent!);
    const onHover = contrast(p['accent-ink']!, p['accent-hover']!);
    assert.ok(onFill >= 4.5, `${t.key}: ink on accent ${onFill.toFixed(2)}`);
    assert.ok(onHover >= 4.5, `${t.key}: ink on hover ${onHover.toFixed(2)}`);
  }
});

test('accent text reads at 4.5:1, and the focus ring at 3:1, on every dark surface', () => {
  for (const t of THEMES) {
    const p = pal(t.key);
    for (const [name, bg] of Object.entries(SURFACES)) {
      for (const prop of ['accent', 'accent-hover']) {
        const c = contrast(p[prop]!, bg);
        assert.ok(c >= 4.5, `${t.key}: --${prop} on ${name} ${c.toFixed(2)}`);
      }
      const ring = contrast(p.focus!, bg);
      assert.ok(ring >= 3, `${t.key}: focus ring on ${name} ${ring.toFixed(2)}`);
    }
  }
});

test('no accent colour is left hard-coded outside the palettes', () => {
  const outside = css.replace(/(?:^|\n)(?::root, )?\[data-theme="[a-z]+"\] \{[^}]*\}/g, '');
  assert.doesNotMatch(outside, /#ffc93c|255, 201, 60|--gold/i);
});

test('the page ships its default theme on <html> and applies the saved one before the stylesheet', () => {
  const tag = /<html lang="en" data-theme="([a-z]+)">/.exec(html);
  assert.ok(tag, '<html> carries data-theme');
  assert.ok(isTheme(tag[1]), `the default ${tag[1]} is a theme`);
  const head = html.slice(0, html.indexOf('</head>'));
  const script = /<script>([^<]*tankity-theme[^<]*)<\/script>/.exec(head);
  assert.ok(script, 'an inline script in the head reads the saved theme');
  assert.ok(head.indexOf(script[0]) < head.indexOf('game.css'), 'it runs before the stylesheet loads');
  assert.match(script[1]!, /try\s*\{/, 'storage reads are wrapped');
  const list = /\^\(([a-z|]+)\)\$/.exec(script[1]!);
  assert.ok(list, 'it accepts only the known themes');
  assert.deepEqual(list[1]!.split('|').sort(), THEMES.map(t => t.key).sort());
  assert.ok(script[1]!.includes(THEME_PREF));
});

/** A stand-in for <html>: its attributes. */
function fakeRoot(theme?: string): ThemeRoot & { attrs: Map<string, string> } {
  const attrs = new Map<string, string>(theme ? [['data-theme', theme]] : []);
  return { attrs, getAttribute: n => attrs.get(n) ?? null, setAttribute: (n, v) => { attrs.set(n, v); } };
}

test('the choice is saved under tankity-theme and shown at once', () => {
  const storage = memoryStorage();
  const root = fakeRoot('yellow');
  const theme = themeSetting(storage, root);
  assert.equal(theme.get(), 'yellow');
  theme.set('lime');
  assert.equal(storage.data.get('tankity-theme'), 'lime');
  assert.equal(root.attrs.get('data-theme'), 'lime');
  assert.equal(theme.get(), 'lime');
  // A new page reads it back.
  assert.equal(themeSetting(storage, fakeRoot('lime')).get(), 'lime');
});

test('a missing or unknown saved word reads as the page default', () => {
  assert.equal(themeSetting(memoryStorage(), fakeRoot('cyan')).get(), 'cyan');
  assert.equal(themeSetting(memoryStorage({ 'tankity-theme': 'plaid' }), fakeRoot('yellow')).get(), 'yellow');
  assert.equal(themeSetting(memoryStorage(), fakeRoot()).get(), 'yellow');
  assert.equal(themeSetting(memoryStorage(), null).get(), 'yellow');
  const s = themeSetting(memoryStorage(), fakeRoot('yellow'));
  s.set('plaid' as never);
  assert.equal(s.get(), 'yellow');
});

test('storage that throws keeps the choice for the session and never throws', () => {
  const root = fakeRoot('yellow');
  const theme = themeSetting(throwingStorage(), root);
  assert.equal(theme.get(), 'yellow');
  theme.set('magenta');
  assert.equal(theme.get(), 'magenta');
  assert.equal(root.attrs.get('data-theme'), 'magenta');
});
