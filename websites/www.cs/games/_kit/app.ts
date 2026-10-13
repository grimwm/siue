// websites/www.cs/games/_kit/app.ts
// What every game shares about running as an installed app: telling whether
// it is one, full screen, and leaving. The browser is a port (AppEnv), so the
// three ways a game can be left are unit-tested. DOM program only.
import type { Timers } from './ports.ts';
import { browserTimers } from './ports.browser.ts';

export const EXIT_HINT = 'Swipe the app away to close it';
/** How long a closing window gets before the game falls back to its title card. */
export const CLOSE_WAIT_MS = 150;

export interface AppEnv {
  /** window.matchMedia(query).matches */
  matches(query: string): boolean;
  /** iOS home-screen apps say so here, not through display-mode. */
  iosStandalone(): boolean;
  fullscreenElement(): Element | null;
  requestFullscreen(el: Element): Promise<void>;
  exitFullscreen(): Promise<void>;
  closeWindow(): void;
  closed(): boolean;
  timers: Timers;
}

export type ExitOutcome = 'closed' | 'title' | 'title-with-hint';

const APP_MODES = ['fullscreen', 'standalone', 'minimal-ui'];

export function isInstalled(env: AppEnv): boolean {
  return APP_MODES.some(m => env.matches(`(display-mode: ${m})`)) || env.iosStandalone();
}

export async function enterFullscreen(env: AppEnv, el: Element): Promise<boolean> {
  if (env.fullscreenElement()) return true;
  try {
    await env.requestFullscreen(el);
    return true;
  } catch {
    return false;
  }
}

/**
 * Leaves the game. An installed app asks to close its window (installed
 * desktop Chrome and Edge allow it); where that does nothing, and always in a
 * browser tab, which must never be closed, it leaves full screen and the game
 * shows its title card. An installed app that is still open adds the hint.
 */
export async function exitApp(env: AppEnv): Promise<ExitOutcome> {
  const installed = isInstalled(env);
  if (installed) {
    try {
      env.closeWindow();
    } catch {
      // A refusal is the same as a window that stays: fall back to the title card.
    }
    const gone = await new Promise<boolean>(resolve => {
      env.timers.setTimeout(() => resolve(env.closed()), CLOSE_WAIT_MS);
    });
    if (gone) return 'closed';
  }
  if (env.fullscreenElement()) {
    try {
      await env.exitFullscreen();
    } catch {
      // Already out, or refused: the title card shows either way.
    }
  }
  return installed ? 'title-with-hint' : 'title';
}

/** Keyboard Lock (Chromium only; Safari and Firefox have none). */
export interface KeyLock {
  lock(keys: string[]): Promise<void>;
  unlock(): void;
}

/** The parts of a window topKeyLock reads; a Window is one. */
export interface LockWindow {
  readonly top: LockWindow | null;
  /** Its keyboard (Keyboard Lock), where the browser has one; DOM typings leave it out. */
  readonly navigator: object;
}

/**
 * The top-level page's Keyboard Lock. Chromium refuses lock() from inside a
 * frame ("must be called from a primary top-level browsing context"), and the
 * site's /play/ pages run every game in one, so a game in a same-origin frame
 * locks through its top page. Null where there is no lock to take: no Keyboard
 * Lock, or a top page on another origin.
 */
export function topKeyLock(win: LockWindow): KeyLock | null {
  try {
    const kb = ((win.top ?? win).navigator as { keyboard?: Partial<KeyLock> }).keyboard;
    return kb && typeof kb.lock === 'function' && typeof kb.unlock === 'function' ? (kb as KeyLock) : null;
  } catch {
    return null;
  }
}

export type EscapeHold = 'locked' | 'released' | 'unsupported' | 'refused';

/**
 * In full screen the browser takes Esc to leave it. No game asks for Esc (Q,
 * keys.ts, is the back key), but a player may press it from habit. Where
 * Keyboard Lock exists, claim Esc while full screen: a tap then does nothing
 * and only holding Esc leaves. Called on every fullscreenchange. A
 * refused lock is reported through warn: without the lock, a tap of Esc leaves
 * full screen. Guarded by _kit/test/app.test.mjs and
 * tests/e2e/tankity-fullscreen-esc.spec.mjs.
 */
export async function holdEscape(full: boolean, kb: KeyLock | null, warn: (msg: string) => void): Promise<EscapeHold> {
  if (!kb) return 'unsupported';
  if (!full) {
    kb.unlock();
    return 'released';
  }
  try {
    await kb.lock(['Escape']);
    return 'locked';
  } catch (err) {
    warn(`Keyboard Lock refused, so Esc will leave full screen: ${err instanceof Error ? err.message : String(err)}`);
    return 'refused';
  }
}

export function browserAppEnv(): AppEnv {
  return {
    matches: q => typeof window.matchMedia === 'function' && window.matchMedia(q).matches,
    iosStandalone: () => (navigator as Navigator & { standalone?: boolean }).standalone === true,
    fullscreenElement: () => document.fullscreenElement,
    requestFullscreen: el => (typeof el.requestFullscreen === 'function' ? el.requestFullscreen() : Promise.reject(new Error('no fullscreen'))),
    exitFullscreen: () => (typeof document.exitFullscreen === 'function' ? document.exitFullscreen() : Promise.resolve()),
    closeWindow: () => window.close(),
    closed: () => window.closed,
    timers: browserTimers,
  };
}
