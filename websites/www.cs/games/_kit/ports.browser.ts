// The real adapters for ports.ts. DOM program only.
import type { Clock, StorageLike, Timers } from './ports.ts';

export const browserTimers: Timers = {
  setTimeout: (fn, ms) => window.setTimeout(fn, ms),
  clearTimeout: id => window.clearTimeout(id),
  setInterval: (fn, ms) => window.setInterval(fn, ms),
  clearInterval: id => window.clearInterval(id),
};

export const browserClock: Clock = { now: () => performance.now() };

/** localStorage, or null where reading it throws (blocked site data, some private modes). */
export function browserStorage(): StorageLike | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
