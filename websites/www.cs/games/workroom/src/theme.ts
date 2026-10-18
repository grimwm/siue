// Dark or light: the owner's choice (System, Dark or Light), remembered in
// this browser, and the theme it gives on this device, written to <html> as
// data-theme. DOM-free: the page passes the storage, the root element and the
// device's colour-scheme query in.
import { oneOf, pref } from '../../_kit/prefs.ts';
import type { Pref } from '../../_kit/prefs.ts';
import type { StorageLike } from '../../_kit/ports.ts';
import type { Theme } from './tokens.ts';

export type ThemeChoice = 'system' | 'dark' | 'light';
export const THEME_CHOICES: readonly ThemeChoice[] = ['system', 'dark', 'light'];
export const THEME_LABELS: Readonly<Record<ThemeChoice, string>> = { system: 'System', dark: 'Dark', light: 'Light' };
export const THEME_KEY = 'workroom-theme';

/** The device's prefers-color-scheme: dark query. */
export interface DarkQuery {
  readonly matches: boolean;
  addEventListener(type: 'change', fn: () => void): void;
  removeEventListener(type: 'change', fn: () => void): void;
}
export interface ThemePorts { storage: StorageLike | null; root: { setAttribute(name: string, value: string): void }; dark: DarkQuery | null }

export const themePref = (storage: StorageLike | null): Pref<ThemeChoice> => pref(THEME_KEY, 'system', oneOf(THEME_CHOICES, 'system'), storage);

/** System follows the device; Dark and Light override it. */
export function resolveTheme(choice: ThemeChoice, deviceDark: boolean): Theme {
  return choice === 'system' ? (deviceDark ? 'dark' : 'light') : choice;
}

/** Sets data-theme once from the remembered choice (a device without the query counts as dark). The page head's boot script runs this before the first paint. */
export function applyTheme(ports: ThemePorts): Theme {
  const theme = resolveTheme(themePref(ports.storage).get(), ports.dark?.matches ?? true);
  ports.root.setAttribute('data-theme', theme);
  return theme;
}

export interface ThemeHandle {
  choice(): ThemeChoice;
  choose(c: ThemeChoice): void;
  theme(): Theme;
  subscribe(fn: (t: Theme, c: ThemeChoice) => void): () => void;
  stop(): void;
}

/** The live theme: applied at once, again on every choice and, under System, whenever the device setting changes. */
export function startTheme(ports: ThemePorts): ThemeHandle {
  const choice = themePref(ports.storage);
  const subscribers = new Set<(t: Theme, c: ThemeChoice) => void>();
  let current = applyTheme(ports);
  const update = (): void => {
    const c = choice.get();
    current = resolveTheme(c, ports.dark?.matches ?? true);
    ports.root.setAttribute('data-theme', current);
    for (const fn of subscribers) fn(current, c);
  };
  const unChoice = choice.subscribe(update);
  ports.dark?.addEventListener('change', update);
  return {
    choice: () => choice.get(),
    choose: c => choice.set(c),
    theme: () => current,
    subscribe(fn) { subscribers.add(fn); return () => { subscribers.delete(fn); }; },
    stop() { unChoice(); ports.dark?.removeEventListener('change', update); subscribers.clear(); },
  };
}
