// The header's System / Dark / Light switch, and the root that hands the live
// theme to the views.
import type { ComponentChildren } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { THEME_CHOICES, THEME_LABELS } from '../theme.ts';
import type { ThemeHandle } from '../theme.ts';
import { cx } from './console/cx.ts';
import { ThemeContext } from './theme-context.ts';

export function ThemeSwitch(p: { handle: ThemeHandle }) {
  const [choice, setChoice] = useState(p.handle.choice());
  useEffect(() => p.handle.subscribe((_t, c) => setChoice(c)), [p.handle]);
  return (
    <div role="group" aria-label="Theme" data-theme-switch="" class="inline-flex rounded-md border border-rule bg-panel p-0.5">
      {THEME_CHOICES.map(c => (
        <button type="button" aria-pressed={c === choice} onClick={() => p.handle.choose(c)}
          class={cx('min-h-11 min-w-11 rounded px-3 font-display text-xs font-semibold tracking-widest uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber',
            c === choice ? 'bg-amber text-on-accent' : 'text-dim hover:text-ink')}>{THEME_LABELS[c]}</button>
      ))}
    </div>
  );
}

export function ThemeRoot(p: { handle: ThemeHandle; children?: ComponentChildren }) {
  const [theme, setTheme] = useState(p.handle.theme());
  useEffect(() => p.handle.subscribe(t => setTheme(t)), [p.handle]);
  return <ThemeContext.Provider value={theme}>{p.children}</ThemeContext.Provider>;
}
