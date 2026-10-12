// websites/www.cs/games/_kit/install.ts
// Install and Share for one game: whether to offer the browser's install
// prompt, iOS's Add to Home Screen steps, or nothing, and how a link is
// shared. The browser is a port (InstallEnv), so every platform is
// unit-tested; browserInstallEnv() is the real one.
import type { Timers } from './ports.ts';
import { browserTimers } from './ports.browser.ts';
import { isInstalled, browserAppEnv } from './app.ts';

/**
 * Whether Chromium offers to install a game from a page that links its
 * manifest but lies outside the manifest's scope, as the site's /play/<id>/
 * pages do (measured in Chrome). Where it does not, Install there opens the
 * game's own page with ?install.
 */
export const OUT_OF_SCOPE_PROMPTS: boolean = true;

export const IOS_STEPS = 'Tap Share, then Add to Home Screen';
/** How long "Link copied" stays up. */
export const COPIED_MS = 2500;
/** Where the page's first script parks a prompt that came before the bar (install-core.php's INSTALL_PROMPT_STASH). */
export const PROMPT_STASH = '__installPrompt';

export type Platform = 'ios' | 'chromium' | 'other';

/** A held-back BeforeInstallPromptEvent: prompt() shows the browser's install dialog, once. */
export interface DeferredPrompt {
  prompt(): Promise<unknown>;
}

export interface InstallEnv {
  /** Each install prompt the browser offers, already held back with preventDefault(). */
  onPrompt(cb: (p: DeferredPrompt) => void): void;
  /** appinstalled. */
  onInstalled(cb: () => void): void;
  /** This page runs as an installed app. */
  installed(): boolean;
  platform(): Platform;
  /** This page is inside another page's frame (the game inside /play/<id>/). */
  framed(): boolean;
  /** navigator.share, or null where there is none. */
  share: ((data: { title: string; url: string }) => Promise<void>) | null;
  /** navigator.clipboard.writeText, or null where there is none. */
  copy: ((text: string) => Promise<void>) | null;
  /** Goes to another page; `replace` leaves this one out of the history. */
  navigate(url: string, replace: boolean): void;
  timers: Timers;
}

export interface InstallSetup {
  /** The game's name, for the share sheet. */
  title: string;
  /** The address Share hands out: the game's /play/<id>/ page. */
  shareUrl: string;
  /** The page installing happens on when it cannot happen here (absolute, without ?install), or null when it can. */
  installPage: string | null;
  /** Whether Chromium offers its install prompt on this page. */
  promptsHere: boolean;
  /** The address asked for installing (?install). */
  asked: boolean;
}

/** 'copied': "Link copied" is up; 'field': the address is shown to copy by hand. */
export type ShareState = 'idle' | 'copied' | 'field';

export interface InstallView {
  /** Nothing to draw: the page is framed. */
  off: boolean;
  install: boolean;
  /** ?install: the button is drawn to the eye. */
  highlight: boolean;
  /** iOS's Add to Home Screen steps are open. */
  steps: boolean;
  share: ShareState;
}

export interface Install {
  view(): InstallView;
  pressInstall(): Promise<void>;
  closeSteps(): void;
  pressShare(): Promise<void>;
  closeShare(): void;
}

export function asksInstall(search: string): boolean {
  return new URLSearchParams(search).has('install');
}

/** `page` with ?install added to its query. */
export function withInstall(page: string): string {
  const url = new URL(page);
  url.search = url.search ? `${url.search}&install` : '?install';
  return url.href;
}

const cancelled = (e: unknown): boolean => (e as { name?: unknown } | null)?.name === 'AbortError';

export function createInstall(env: InstallEnv, setup: InstallSetup, onChange: (v: InstallView) => void): Install {
  const off = env.framed();
  const platform = env.platform();
  const ios = platform === 'ios';
  // Chromium on a page it does not prompt on: Install opens the page that does.
  const sendsAway = platform === 'chromium' && !setup.promptsHere && setup.installPage !== null;
  let installed = env.installed();
  let prompt: DeferredPrompt | null = null;
  let steps = false;
  let share: ShareState = 'idle';
  let copiedTimer: number | null = null;

  const offered = (): boolean => !off && !installed && (ios || sendsAway || prompt !== null);
  const view = (): InstallView => ({ off, install: offered(), highlight: setup.asked && offered(), steps, share });
  const changed = (): void => onChange(view());

  function setShare(next: ShareState): void {
    if (copiedTimer !== null) {
      env.timers.clearTimeout(copiedTimer);
      copiedTimer = null;
    }
    share = next;
    if (next === 'copied') {
      copiedTimer = env.timers.setTimeout(() => {
        copiedTimer = null;
        share = 'idle';
        changed();
      }, COPIED_MS);
    }
    changed();
  }

  if (!off && !installed) {
    env.onPrompt(p => {
      prompt = p;
      changed();
    });
    env.onInstalled(() => {
      installed = true;
      prompt = null;
      steps = false;
      changed();
    });
    if (setup.asked && ios) {
      if (setup.installPage === null) steps = true;
      else env.navigate(withInstall(setup.installPage), true);
    }
  }

  return {
    view,
    async pressInstall() {
      if (!offered()) return;
      if (ios) {
        if (setup.installPage === null) {
          steps = true;
          changed();
        } else {
          env.navigate(withInstall(setup.installPage), false);
        }
        return;
      }
      if (prompt) {
        // A prompt shows once; the browser offers a new one if the player declines.
        const p = prompt;
        prompt = null;
        changed();
        try {
          await p.prompt();
        } catch {
          // Already shown, or refused: the button is gone either way.
        }
        return;
      }
      if (setup.installPage !== null) env.navigate(withInstall(setup.installPage), false);
    },
    closeSteps() {
      if (!steps) return;
      steps = false;
      changed();
    },
    async pressShare() {
      if (off) return;
      if (env.share) {
        try {
          await env.share({ title: setup.title, url: setup.shareUrl });
          return;
        } catch (e) {
          if (cancelled(e)) return;
          // Refused (no gesture left, a blocked sheet): copy instead.
        }
      }
      if (env.copy) {
        try {
          await env.copy(setup.shareUrl);
          setShare('copied');
          return;
        } catch {
          // A blocked clipboard: show the address to copy by hand.
        }
      }
      setShare('field');
    },
    closeShare() {
      if (share !== 'idle') setShare('idle');
    },
  };
}

type Parked = { [PROMPT_STASH]?: DeferredPrompt | null };
type WithBrands = Navigator & { userAgentData?: { brands?: { brand: string }[] } };

/** iOS has no install API; Chromium (Chrome, Edge, Samsung Internet) has; anything else cannot install. */
export function detectPlatform(userAgent: string, platform: string, touchPoints: number, brands: { brand: string }[] = []): Platform {
  // iPadOS reports itself as a Mac; its touch points give it away.
  if (/iPhone|iPad|iPod/.test(userAgent) || (platform === 'MacIntel' && touchPoints > 1)) return 'ios';
  return brands.some(b => b.brand === 'Chromium') ? 'chromium' : 'other';
}

export function browserInstallEnv(): InstallEnv {
  const parked = window as unknown as Parked;
  return {
    onPrompt: cb => {
      const early = parked[PROMPT_STASH];
      parked[PROMPT_STASH] = null;
      if (early) cb(early);
      window.addEventListener('beforeinstallprompt', ev => {
        ev.preventDefault();
        parked[PROMPT_STASH] = null;
        cb(ev as unknown as DeferredPrompt);
      });
    },
    onInstalled: cb => window.addEventListener('appinstalled', () => cb()),
    installed: () => isInstalled(browserAppEnv()),
    platform: () => detectPlatform(navigator.userAgent, navigator.platform, navigator.maxTouchPoints, (navigator as WithBrands).userAgentData?.brands),
    framed: () => window.self !== window.top,
    share: typeof navigator.share === 'function' ? data => navigator.share(data) : null,
    copy: typeof navigator.clipboard?.writeText === 'function' ? text => navigator.clipboard.writeText(text) : null,
    navigate: (url, replace) => (replace ? location.replace(url) : location.assign(url)),
    timers: browserTimers,
  };
}
