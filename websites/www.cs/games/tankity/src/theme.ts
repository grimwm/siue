/* Operation Tankity: the colour theme, as the player picks and keeps it.
 *
 * A theme is the page's accent palette (game.css: `[data-theme="..."]` sets
 * --accent, --accent-hover, --accent-ink, --accent-rgb and --focus); the
 * battlefield's own colours never change. The choice is one word per browser
 * under `tankity-theme`, set on <html data-theme>. index.html's head applies
 * the saved word before the first paint, so the page never flashes the
 * default; the default is the data-theme the page ships on <html>. */
import type { StorageLike } from '../../_kit/ports.ts';
import { pref, text } from '../../_kit/prefs.ts';

export const THEMES = [
  { key: 'yellow', name: 'Yellow' },
  { key: 'lime', name: 'Lime' },
  { key: 'cyan', name: 'Cyan' },
  { key: 'orange', name: 'Orange' },
  { key: 'magenta', name: 'Magenta' },
] as const;

export type ThemeKey = (typeof THEMES)[number]['key'];

export const THEME_PREF = 'tankity-theme';

export function isTheme(v: unknown): v is ThemeKey {
  return typeof v === 'string' && THEMES.some(t => t.key === v);
}

/** The element that carries data-theme (document.documentElement). */
export interface ThemeRoot {
  getAttribute(name: string): string | null;
  setAttribute(name: string, value: string): void;
}

export interface ThemeSetting {
  get(): ThemeKey;
  /** Saves the choice and shows it at once. */
  set(key: ThemeKey): void;
}

/** The saved theme; a missing or unknown word reads as the page's default (the
 *  data-theme <html> carried when this was made), and Yellow without one. */
export function themeSetting(storage: StorageLike | null, root: ThemeRoot | null): ThemeSetting {
  const shipped = root?.getAttribute('data-theme');
  const fallback: ThemeKey = isTheme(shipped) ? shipped : 'yellow';
  const saved = pref<string>(THEME_PREF, fallback, text, storage);
  return {
    get() {
      const v = saved.get();
      return isTheme(v) ? v : fallback;
    },
    set(key) {
      if (!isTheme(key)) return;
      saved.set(key);
      root?.setAttribute('data-theme', key);
    },
  };
}
