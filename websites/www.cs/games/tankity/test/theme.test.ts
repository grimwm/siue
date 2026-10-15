// The colour themes: the saved choice (src/theme.ts), the palettes game.css
// gives them, each held to WCAG AA by computing its contrast, and index.html's
// head, which applies the saved theme before the first paint.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { memoryStorage, throwingStorage } from '../../_kit/test/record.ts';
import { THEMES, THEME_PREF, CUSTOM_PREF, CUSTOM_PALETTE_PREF, DEFAULT_THEME, DEFAULT_CUSTOM, deriveCustomPalette, isTheme, themeSetting } from '../src/theme.ts';
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

test('five themes plus Custom, Yellow first', () => {
  assert.deepEqual(THEMES.map(t => t.key), ['yellow', 'lime', 'cyan', 'orange', 'magenta']);
  assert.deepEqual(THEMES.map(t => t.name), ['Yellow', 'Lime', 'Cyan', 'Orange', 'Magenta']);
  assert.ok(isTheme('custom') && isTheme('lime') && !isTheme('LIME') && !isTheme('') && !isTheme(null));
});

test('game.css has a palette for each preset theme and no other, and Orange is also :root', () => {
  assert.deepEqual([...palettes.keys()].sort(), THEMES.map(t => t.key).sort());
  assert.match(css, /\n:root, \[data-theme="orange"\] \{/);
  for (const t of THEMES) {
    const p = pal(t.key);
    for (const prop of ['accent', 'accent-hover', 'accent-ink', 'accent-rgb', 'focus']) assert.ok(p[prop], `${t.key} sets --${prop}`);
    const hex = p.accent!;
    const rgb = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)).join(', ');
    assert.equal(p['accent-rgb'], rgb, `${t.key}: --accent-rgb is --accent`);
  }
});

test('the :root default comes before every other palette, so a chosen theme wins the tie', () => {
  const root = css.indexOf(':root, [data-theme="orange"]');
  assert.ok(root >= 0);
  for (const t of THEMES) if (t.key !== 'orange') assert.ok(css.indexOf(`[data-theme="${t.key}"] {`) > root, t.key);
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
  assert.equal(tag[1], DEFAULT_THEME, 'the shipped default is the code default');
  assert.equal(DEFAULT_THEME, 'orange');
  const head = html.slice(0, html.indexOf('</head>'));
  const script = /<script>([^<]*tankity-theme[^<]*)<\/script>/.exec(head);
  assert.ok(script, 'an inline script in the head reads the saved theme');
  assert.ok(head.indexOf(script[0]) < head.indexOf('game.css'), 'it runs before the stylesheet loads');
  assert.match(script[1]!, /try\s*\{/, 'storage reads are wrapped');
  const list = /\^\(([a-z|]+)\)\$/.exec(script[1]!);
  assert.ok(list, 'it accepts only the known themes');
  assert.deepEqual(list[1]!.split('|').sort(), THEMES.map(t => t.key).sort());
  assert.ok(script[1]!.includes(CUSTOM_PALETTE_PREF), 'it applies the saved custom palette');
  assert.ok(script[1]!.includes(THEME_PREF));
});

/** A stand-in for <html>: its attributes and inline custom properties. */
function fakeRoot(theme?: string): ThemeRoot & { attrs: Map<string, string>; props: Map<string, string> } {
  const attrs = new Map<string, string>(theme ? [['data-theme', theme]] : []);
  const props = new Map<string, string>();
  return {
    attrs, props,
    getAttribute: n => attrs.get(n) ?? null,
    setAttribute: (n, v) => { attrs.set(n, v); },
    style: { setProperty: (n, v) => { props.set(n, v); }, removeProperty: n => props.delete(n) },
  };
}

test('with nothing stored the theme is Orange, wherever the page started', () => {
  assert.equal(themeSetting(memoryStorage(), fakeRoot('orange')).get(), 'orange');
  assert.equal(themeSetting(memoryStorage(), fakeRoot('yellow')).get(), 'orange');
  assert.equal(themeSetting(memoryStorage(), fakeRoot()).get(), 'orange');
  assert.equal(themeSetting(memoryStorage(), null).get(), 'orange');
});

test('a player who saved a choice keeps it', () => {
  for (const key of ['yellow', 'lime', 'cyan', 'magenta', 'orange']) {
    assert.equal(themeSetting(memoryStorage({ 'tankity-theme': key }), fakeRoot('orange')).get(), key);
  }
});

test('the choice is saved under tankity-theme and shown at once', () => {
  const storage = memoryStorage();
  const root = fakeRoot('orange');
  const theme = themeSetting(storage, root);
  theme.set('lime');
  assert.equal(storage.data.get('tankity-theme'), 'lime');
  assert.equal(root.attrs.get('data-theme'), 'lime');
  assert.equal(theme.get(), 'lime');
  assert.equal(themeSetting(storage, fakeRoot('lime')).get(), 'lime');
});

test('an unknown saved word reads as Orange', () => {
  assert.equal(themeSetting(memoryStorage({ 'tankity-theme': 'plaid' }), fakeRoot('yellow')).get(), 'orange');
  const s = themeSetting(memoryStorage(), fakeRoot('orange'));
  s.set('plaid' as never);
  assert.equal(s.get(), 'orange');
});

test('storage that throws keeps the choice for the session and never throws', () => {
  const root = fakeRoot('orange');
  const theme = themeSetting(throwingStorage(), root);
  assert.equal(theme.get(), 'orange');
  theme.set('magenta');
  assert.equal(theme.get(), 'magenta');
  assert.equal(root.attrs.get('data-theme'), 'magenta');
  theme.setCustom('#3366ff');
  assert.equal(theme.get(), 'custom');
  assert.equal(theme.custom(), '#3366ff');
});

const CUSTOM_COLOURS = ['#ffff00', '#0000ff', '#000000', '#ffffff', '#808080', '#ff0000', '#3366ff', '#00ff00', '#123456', '#ffd1dc'];

test('a derived palette meets AA for pure yellow, blue, black, white, grey, red and more', () => {
  for (const hex of CUSTOM_COLOURS) {
    const p = deriveCustomPalette(hex);
    for (const [name, v] of Object.entries({ accent: p.accent, hover: p.accentHover, focus: p.focus, ink: p.accentInk })) {
      assert.match(v, /^#[0-9a-f]{6}$/, `${hex}: ${name} is #rrggbb`);
    }
    assert.ok(contrast(p.accentInk, p.accent) >= 4.5, `${hex}: ink on fill ${contrast(p.accentInk, p.accent).toFixed(2)}`);
    assert.ok(contrast(p.accentInk, p.accentHover) >= 4.5, `${hex}: ink on hover`);
    for (const [name, bg] of Object.entries(SURFACES)) {
      assert.ok(contrast(p.accent, bg) >= 4.5, `${hex}: accent on ${name}`);
      assert.ok(contrast(p.accentHover, bg) >= 4.5, `${hex}: hover on ${name}`);
      assert.ok(contrast(p.focus, bg) >= 3, `${hex}: focus on ${name}`);
    }
    assert.equal(p.accentRgb, [1, 3, 5].map(i => parseInt(p.accent.slice(i, i + 2), 16)).join(', '), `${hex}: rgb is the fill`);
    assert.ok(luminance(p.accentHover) >= luminance(p.accent), `${hex}: hover is the lighter step`);
  }
});

test('a derived palette keeps the colour\'s hue and sets the same tokens as a theme', () => {
  const blue = deriveCustomPalette('#3366ff');
  const [r, g, b] = [1, 3, 5].map(i => parseInt(blue.accent.slice(i, i + 2), 16)) as [number, number, number];
  assert.ok(b > r && b >= g, `blue stays blue: ${blue.accent}`);
  assert.deepEqual(Object.keys(blue).sort(), ['accent', 'accentHover', 'accentInk', 'accentRgb', 'focus']);
  assert.notEqual(deriveCustomPalette('#ff0000').accent, deriveCustomPalette('#00ff00').accent);
  assert.equal(deriveCustomPalette('not a colour').accent, deriveCustomPalette(DEFAULT_CUSTOM).accent);
});

test('a custom colour round-trips through storage and is shown at once', () => {
  const storage = memoryStorage();
  const root = fakeRoot('orange');
  const theme = themeSetting(storage, root);
  assert.equal(theme.custom(), DEFAULT_CUSTOM);
  theme.setCustom('#3366FF');
  assert.equal(storage.data.get(CUSTOM_PREF), '#3366ff');
  assert.equal(storage.data.get(THEME_PREF), 'custom');
  const p = deriveCustomPalette('#3366ff');
  assert.equal(root.attrs.get('data-theme'), 'custom');
  assert.equal(root.props.get('--accent'), p.accent);
  assert.equal(root.props.get('--accent-ink'), p.accentInk);
  assert.match(storage.data.get(CUSTOM_PALETTE_PREF)!, new RegExp(`--accent:${p.accent};`));
  // A new page reads both back.
  const again = themeSetting(storage, fakeRoot('custom'));
  assert.equal(again.get(), 'custom');
  assert.equal(again.custom(), '#3366ff');
  // A preset takes the inline palette away; Custom brings the saved colour back.
  theme.set('lime');
  assert.equal(root.props.size, 0);
  theme.set('custom');
  assert.equal(root.props.get('--accent'), p.accent);
});

test('a malformed custom colour is ignored', () => {
  const storage = memoryStorage({ 'tankity-theme-custom': 'blue' });
  const root = fakeRoot('orange');
  const theme = themeSetting(storage, root);
  assert.equal(theme.custom(), DEFAULT_CUSTOM);
  theme.setCustom('rgb(1,2,3)');
  assert.equal(theme.get(), 'orange');
  assert.equal(root.props.size, 0);
});

test('the head script applies a saved custom palette only when it is well formed', () => {
  const head = html.slice(0, html.indexOf('</head>'));
  const script = /<script>([^<]*tankity-theme[^<]*)<\/script>/.exec(head)![1]!;
  const run = (items: Record<string, string>) => {
    const attrs = new Map<string, string>([['data-theme', 'orange']]);
    const doc = { documentElement: { setAttribute: (n: string, v: string) => attrs.set(n, v), style: { cssText: '' } } };
    new Function('localStorage', 'document', script)({ getItem: (k: string) => items[k] ?? null }, doc);
    return { theme: attrs.get('data-theme'), css: doc.documentElement.style.cssText };
  };
  const css = '--accent:#6f93ff;--accent-ink:#111111;';
  assert.deepEqual(run({ 'tankity-theme': 'custom', 'tankity-theme-custom-palette': css }), { theme: 'custom', css });
  assert.equal(run({ 'tankity-theme': 'custom' }).theme, 'orange');
  assert.equal(run({ 'tankity-theme': 'custom', 'tankity-theme-custom-palette': 'x;} body{display:none' }).theme, 'orange');
  assert.equal(run({ 'tankity-theme': 'lime' }).theme, 'lime');
  assert.equal(run({}).theme, 'orange');
});
