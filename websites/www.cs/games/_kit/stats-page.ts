// websites/www.cs/games/_kit/stats-page.ts
// Built into each game as dist/stats.js, a classic script. Its own tag says what to count:
//   <script src="dist/stats.js?v=…" data-page="crete" data-endpoint="../../stats/collect.php"></script>
// data-game-query (the faculty page) counts the page as the game its ?game= names, when it names one.
// data-views="0" sends events only. Without data-endpoint it does nothing, so a game copied elsewhere stays silent.
import { startStats, referrerHost, GLOBAL } from './stats.ts';
import type { SiteStats, StatsEnv } from './stats.ts';
import { browserTimers } from './ports.browser.ts';

type Nav = Navigator & { globalPrivacyControl?: boolean; msDoNotTrack?: string };

const tag = document.currentScript as HTMLScriptElement | null;
const endpoint = tag?.dataset['endpoint'];
let page = tag?.dataset['page'] ?? '';
if (tag && 'gameQuery' in tag.dataset) {
  const game = new URLSearchParams(location.search).get('game');
  if (game && /^[a-z0-9-]{1,32}$/.test(game)) page = game;
}

function parentStats(): SiteStats | null {
  try {
    if (window.parent === window) return null;
    return ((window.parent as unknown as Record<string, unknown>)[GLOBAL] as SiteStats | undefined) ?? null;
  } catch (_) {
    return null; // another origin's frame
  }
}

function storage(): Storage | null {
  try {
    return window.localStorage;
  } catch (_) {
    return null;
  }
}

function referrer(): string {
  try {
    if (window.parent !== window) return referrerHost(window.parent.document.referrer);
  } catch (_) {
    // another origin's frame: our own referrer is all there is
  }
  return referrerHost(document.referrer);
}

const env: StatsEnv = {
  optedOut: () => {
    const nav = navigator as Nav;
    const w = window as unknown as { doNotTrack?: string };
    return nav.doNotTrack === '1' || w.doNotTrack === '1' || nav.msDoNotTrack === '1' || nav.globalPrivacyControl === true;
  },
  automated: () => navigator.webdriver === true,
  storage: storage(),
  now: () => Date.now(),
  randomHex: bytes => Array.from(crypto.getRandomValues(new Uint8Array(bytes)), b => b.toString(16).padStart(2, '0')).join(''),
  send: (url, body) => {
    const blob = new Blob([body], { type: 'text/plain' });
    if (typeof navigator.sendBeacon === 'function' && navigator.sendBeacon(url, blob)) return;
    void fetch(url, { method: 'POST', body, keepalive: true, credentials: 'omit', headers: { 'Content-Type': 'text/plain' } }).catch(() => {});
  },
  referrer,
  device: () => ({ tp: navigator.maxTouchPoints || 0, sw: Math.round(Math.min(screen.width, screen.height)) || 0 }),
  visible: () => document.visibilityState === 'visible',
  onVisibility: cb => {
    document.addEventListener('visibilitychange', () => cb(document.visibilityState === 'visible'));
    window.addEventListener('pagehide', () => cb(false));
    window.addEventListener('pageshow', e => { if (e.persisted) cb(true); });
  },
  parentStats,
  timers: browserTimers,
};

if (endpoint && page) {
  startStats(env, { page, endpoint: new URL(endpoint, location.href).href, views: tag?.dataset['views'] !== '0' });
}
