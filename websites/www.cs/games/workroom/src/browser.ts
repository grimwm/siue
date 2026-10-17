// The browser adapters the page hands its DOM-free modules.
import type { StorageLike } from '../../_kit/ports.ts';
import type { ThemePorts } from './theme.ts';

/** localStorage, or null where touching it throws (blocked site data, some private windows). */
export function browserStorage(): StorageLike | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function browserThemePorts(): ThemePorts {
  const q = typeof matchMedia === 'function' ? matchMedia('(prefers-color-scheme: dark)') : null;
  return {
    storage: browserStorage(),
    root: document.documentElement,
    dark: q && {
      get matches() { return q.matches; },
      addEventListener: (type, fn) => q.addEventListener(type, fn),
      removeEventListener: (type, fn) => q.removeEventListener(type, fn),
    },
  };
}
