// websites/www.cs/games/_kit/stats.ts
// The visitor beacon: one page view per page load with the time it spent in view, and named game events
// (track). It sends to the page's endpoint only (first party, no cookies) and sends nothing under Do Not
// Track, Global Privacy Control or browser automation. The browser is a port (StatsEnv); stats-page.ts wires
// the real one. A game inside a page that already runs the beacon (the site's /play/<id>/) hands its events to
// that page's instance, so a visit is counted once.
import type { StorageLike, Timers } from './ports.ts';

/** The localStorage entry: a random visitor ID, the current visit's ID and when it was last active. */
export const STORE_KEY = 'wgrim-stats';
/** A visit ends after half an hour without activity. */
export const VISIT_GAP_MS = 30 * 60 * 1000;
/** How often the visible time is reported while the page is in view. */
export const BEAT_MS = 30_000;
/** Time on a page stops counting after 4 hours. */
export const MAX_SECS = 4 * 60 * 60;
/** Where the page's instance lives, and where track() parks events sent before it starts. */
export const GLOBAL = '__siteStats';
export const QUEUE = '__siteStatsQ';

export interface SiteStats {
  /** Sends a named event for `page`, with at most one property. */
  event(page: string, name: string, prop?: string): void;
}

export interface StatsEnv {
  /** Do Not Track or Global Privacy Control is on. */
  optedOut(): boolean;
  /** The browser is driven by automation (navigator.webdriver). */
  automated(): boolean;
  /** localStorage, or null; it may throw when blocked. */
  storage: StorageLike | null;
  now(): number;
  /** `bytes` random bytes as lower-case hex. */
  randomHex(bytes: number): string;
  /** Posts `body` to `url` and forgets it. */
  send(url: string, body: string): void;
  /** The referring site's host, or ''. */
  referrer(): string;
  /** Touch points and the screen's short side in CSS pixels. */
  device(): { tp: number; sw: number };
  visible(): boolean;
  /** Calls back whenever the page is shown or hidden (including when it is left). */
  onVisibility(cb: (visible: boolean) => void): void;
  /** The beacon of the same-origin page this one is framed in, or null. */
  parentStats(): SiteStats | null;
  timers: Timers;
}

export interface StatsStart {
  page: string;
  endpoint: string;
  /** Send this page's view and its time (false: events only). */
  views: boolean;
}

interface Stored {
  vid: string;
  sid: string;
  last: number;
}

const HEX = /^[0-9a-f]+$/;

/** The host of a referrer URL; '' for none or anything that is not http(s). */
export function referrerHost(ref: string): string {
  try {
    const url = new URL(ref);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.hostname : '';
  } catch (_) {
    return '';
  }
}

const silent: SiteStats = { event() {} };

/** Starts the beacon on this page and makes it the page's instance (globalThis.__siteStats), sending what track() queued. */
export function startStats(env: StatsEnv, start: StatsStart): SiteStats {
  const stats = make(env, start);
  const g = globalThis as Record<string, unknown>;
  g[GLOBAL] = stats;
  const queued = g[QUEUE];
  delete g[QUEUE];
  if (Array.isArray(queued)) {
    for (const q of queued as [string, string, string | undefined][]) stats.event(q[0], q[1], q[2]);
  }
  return stats;
}

function make(env: StatsEnv, start: StatsStart): SiteStats {
  if (env.optedOut() || env.automated()) return silent;
  const parent = env.parentStats();
  if (parent) return { event: (page, name, prop) => parent.event(page, name, prop) };

  let fallback: Stored | null = null;
  /** The visitor and visit, refreshed on each use; null vid when storage is blocked. */
  const ids = (): { vid: string | null; sid: string } => {
    const now = env.now();
    try {
      if (!env.storage) throw new Error('no storage');
      const raw = env.storage.getItem(STORE_KEY);
      const had = raw ? (JSON.parse(raw) as Partial<Stored>) : {};
      const vid = typeof had.vid === 'string' && had.vid.length === 32 && HEX.test(had.vid) ? had.vid : env.randomHex(16);
      const fresh = typeof had.sid === 'string' && had.sid.length === 16 && HEX.test(had.sid) && typeof had.last === 'number' && now - had.last <= VISIT_GAP_MS;
      const sid = fresh ? (had.sid as string) : env.randomHex(8);
      env.storage.setItem(STORE_KEY, JSON.stringify({ vid, sid, last: now }));
      return { vid, sid };
    } catch (_) {
      fallback ??= { vid: '', sid: env.randomHex(8), last: now };
      return { vid: null, sid: fallback.sid };
    }
  };
  const post = (msg: Record<string, unknown>): void => {
    try {
      env.send(start.endpoint, JSON.stringify(msg));
    } catch (_) {
      // A refused send loses one message, never the game.
    }
  };

  if (start.views) {
    const pv = env.randomHex(8);
    const { vid, sid } = ids();
    const { tp, sw } = env.device();
    post({ t: 'v', p: start.page, pv, sid, vid, r: env.referrer(), tp, sw });
    let shownAt = env.visible() ? env.now() : null;
    let banked = 0;
    let beat: number | null = null;
    const seconds = (): number => Math.min(MAX_SECS, Math.round((banked + (shownAt === null ? 0 : env.now() - shownAt)) / 1000));
    const report = (): void => {
      const sec = seconds();
      if (sec > 0) post({ t: 's', p: start.page, pv, sec });
      if (sec >= MAX_SECS && beat !== null) {
        env.timers.clearInterval(beat);
        beat = null;
      }
    };
    const run = (): void => {
      if (beat === null && seconds() < MAX_SECS) beat = env.timers.setInterval(report, BEAT_MS);
    };
    if (shownAt !== null) run();
    env.onVisibility(visible => {
      if (visible) {
        if (shownAt === null) shownAt = env.now();
        run();
        return;
      }
      if (shownAt === null) return;
      banked += env.now() - shownAt;
      shownAt = null;
      if (beat !== null) {
        env.timers.clearInterval(beat);
        beat = null;
      }
      report();
    });
  }

  return {
    event(page, name, prop) {
      const { vid, sid } = ids();
      post({ t: 'e', p: page, sid, vid, n: name, ...(prop === undefined ? {} : { k: prop }) });
    },
  };
}

/** Sends a game event through the page's beacon, or parks it until the beacon starts. Never throws. */
export function track(page: string, name: string, prop?: string): void {
  try {
    const g = globalThis as Record<string, unknown>;
    const stats = g[GLOBAL] as SiteStats | undefined;
    if (stats) {
      stats.event(page, name, prop);
      return;
    }
    const q = (g[QUEUE] ??= []) as unknown[];
    if (q.length < 50) q.push([page, name, prop]);
  } catch (_) {
    // Statistics never break a game.
  }
}

/** track() bound to one game: tracker('crete')('level_start', '1-3'). */
export function tracker(page: string): (name: string, prop?: string) => void {
  return (name, prop) => track(page, name, prop);
}
