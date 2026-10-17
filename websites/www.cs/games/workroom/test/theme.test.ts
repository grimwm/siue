// The theme: System follows the device, Dark and Light override it, the
// choice is remembered, and blocked, missing or garbage storage falls back to
// System without throwing. The switch and the context follow the handle.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { h, render } from 'preact';
import { act } from 'preact/test-utils';
import { applyTheme, resolveTheme, startTheme, THEME_KEY } from '../src/theme.ts';
import type { DarkQuery, ThemePorts } from '../src/theme.ts';
import { memoryStorage, throwingStorage } from '../../_kit/test/record.ts';
import { fire, installDocument, makeEl, renderTarget, walk } from '../../_kit/test/dom-stub.ts';
import { importTsx } from '../../_kit/test/tsx.ts';

installDocument();
const ui = await importTsx<{ sw: typeof import('../src/ui/ThemeSwitch.tsx'); ctx: typeof import('../src/ui/theme-context.ts') }>(
  import.meta.dirname, { sw: '../src/ui/ThemeSwitch.tsx', ctx: '../src/ui/theme-context.ts' });

const device = (dark: boolean): DarkQuery & { flip(d: boolean): void; listeners: Set<() => void> } => {
  const listeners = new Set<() => void>();
  const q = {
    matches: dark,
    listeners,
    addEventListener: (_t: 'change', fn: () => void) => { listeners.add(fn); },
    removeEventListener: (_t: 'change', fn: () => void) => { listeners.delete(fn); },
    flip(d: boolean) { q.matches = d; for (const fn of listeners) fn(); },
  };
  return q;
};
const rootEl = () => { const attrs: Record<string, string> = {}; return { attrs, setAttribute: (n: string, v: string) => { attrs[n] = v; } }; };
const ports = (over: Partial<ThemePorts> = {}) => {
  const root = rootEl();
  return { root, ports: { storage: memoryStorage(), root, dark: device(true), ...over } };
};

test('resolveTheme: System follows the device, Dark and Light do not', () => {
  assert.equal(resolveTheme('system', true), 'dark');
  assert.equal(resolveTheme('system', false), 'light');
  assert.equal(resolveTheme('dark', false), 'dark');
  assert.equal(resolveTheme('light', true), 'light');
});

test('applyTheme sets data-theme once from the remembered choice and listens to nothing', () => {
  const q = device(true);
  const { root, ports: p } = ports({ storage: memoryStorage({ [THEME_KEY]: 'light' }), dark: q });
  assert.equal(applyTheme(p), 'light');
  assert.equal(root.attrs['data-theme'], 'light');
  assert.equal(q.listeners.size, 0);
});

test('stored garbage, throwing storage, no storage: System', () => {
  for (const storage of [memoryStorage({ [THEME_KEY]: 'purple' }), throwingStorage(), null]) {
    const { root, ports: p } = ports({ storage, dark: device(false) });
    assert.equal(applyTheme(p), 'light');
    assert.equal(root.attrs['data-theme'], 'light');
  }
});

test('no colour-scheme query: dark', () => {
  const { ports: p } = ports({ dark: null });
  assert.equal(applyTheme(p), 'dark');
});

test('under System the page follows the device live; under Dark or Light it does not', () => {
  const q = device(true);
  const { root, ports: p } = ports({ dark: q });
  const handle = startTheme(p);
  assert.equal(root.attrs['data-theme'], 'dark');
  q.flip(false);
  assert.equal(root.attrs['data-theme'], 'light');
  handle.choose('dark');
  assert.equal(root.attrs['data-theme'], 'dark');
  q.flip(true); q.flip(false);
  assert.equal(root.attrs['data-theme'], 'dark');
  handle.stop();
  assert.equal(q.listeners.size, 0);
});

test('the choice is remembered in storage and read back by the next page', () => {
  const storage = memoryStorage();
  const first = startTheme(ports({ storage }).ports);
  first.choose('light');
  assert.equal(storage.data.get(THEME_KEY), 'light');
  const { root, ports: p } = ports({ storage });
  assert.equal(startTheme(p).choice(), 'light');
  assert.equal(root.attrs['data-theme'], 'light');
});

test('with throwing storage a choice still holds for this page', () => {
  const { root, ports: p } = ports({ storage: throwingStorage() });
  const handle = startTheme(p);
  handle.choose('light');
  assert.equal(handle.choice(), 'light');
  assert.equal(root.attrs['data-theme'], 'light');
});

test('subscribers hear the theme and the choice', () => {
  const handle = startTheme(ports().ports);
  const heard: string[] = [];
  const off = handle.subscribe((t, c) => heard.push(`${t}/${c}`));
  handle.choose('light');
  off();
  handle.choose('dark');
  assert.deepEqual(heard, ['light/light']);
});

test('the switch shows three buttons, marks the choice, and a press changes the page', async () => {
  const { root: html, ports: p } = ports();
  const handle = startTheme(p);
  const root = makeEl('root');
  await act(() => { render(h(ui.sw.ThemeSwitch, { handle }), renderTarget(root)); });
  const buttons = walk(root).filter(e => e.localName === 'button');
  assert.deepEqual(buttons.map(b => b.textContent), ['System', 'Dark', 'Light']);
  assert.deepEqual(buttons.map(b => b._attrs['aria-pressed']), ['true', 'false', 'false']);
  await act(() => { fire(buttons[2]!, 'click'); });
  assert.equal(html.attrs['data-theme'], 'light');
  assert.deepEqual(buttons.map(b => b._attrs['aria-pressed']), ['false', 'false', 'true']);
});

test('ThemeRoot hands the live theme to what it wraps', async () => {
  const handle = startTheme(ports().ports);
  const seen: string[] = [];
  function Probe() { seen.push(ui.ctx.useTheme()); return null; }
  const root = makeEl('root');
  await act(() => { render(h(ui.sw.ThemeRoot, { handle }, h(Probe, {})), renderTarget(root)); });
  await act(() => { handle.choose('light'); });
  assert.deepEqual(seen.slice(-1), ['light']);
  assert.equal(seen[0], 'dark');
});
