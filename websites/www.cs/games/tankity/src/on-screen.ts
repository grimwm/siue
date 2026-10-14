/* Operation Tankity: which room each tab of the game is showing.
 *
 * A tab showing a room (its match, or its lobby) says so to the other tabs,
 * and says it again every ON_SCREEN_BEAT_MS while visible; a hidden tab or
 * one on the title card says ''. The Your games watcher then never toasts
 * or notifies a room another tab is showing. Carried by a BroadcastChannel
 * where there is one, else by a localStorage key (`tankity-on-screen`, one
 * entry per tab) and the storage events other tabs get when it changes. A
 * tab that stops reporting (closed, frozen) is forgotten after
 * ON_SCREEN_STALE_MS. Nothing here throws. */
import type { StorageLike } from '../../_kit/ports.ts';

export const ON_SCREEN_KEY = 'tankity-on-screen';
export const ON_SCREEN_BEAT_MS = 5_000;
export const ON_SCREEN_STALE_MS = 15_000;

interface Seen { code: string; at: number }
export interface ChannelLike {
  postMessage(m: unknown): void;
  onmessage: ((ev: { data: unknown }) => void) | null;
}
export interface OnScreenDeps {
  /** This tab's id, random per page load. */
  tab: string;
  /** Milliseconds since the epoch (shared by every tab on the machine). */
  now(): number;
  channel: ChannelLike | null;
  storage: StorageLike | null;
  /** Calls `fn` with the key of every storage event from another tab. */
  listen(fn: (key: string | null) => void): void;
}

function isSeen(v: unknown): v is Seen {
  return !!v && typeof v === 'object' && typeof (v as Seen).code === 'string' && typeof (v as Seen).at === 'number';
}

export function createOnScreen(d: OnScreenDeps) {
  const others = new Map<string, Seen>();
  function note(tab: unknown, seen: unknown): void {
    if (typeof tab !== 'string' || tab === d.tab || !isSeen(seen)) return;
    others.set(tab, { code: seen.code, at: seen.at });
  }
  function readStorage(): Record<string, unknown> {
    try {
      const raw = d.storage?.getItem(ON_SCREEN_KEY);
      const v: unknown = raw ? JSON.parse(raw) : {};
      return v && typeof v === 'object' ? (v as Record<string, unknown>) : {};
    } catch (_) { return {}; }
  }
  if (d.channel) {
    d.channel.onmessage = ev => {
      const m = ev.data as { tab?: unknown; code?: unknown; at?: unknown } | null;
      if (m) note(m.tab, { code: m.code, at: m.at });
    };
  } else {
    d.listen(key => {
      if (key !== null && key !== ON_SCREEN_KEY) return;
      for (const [tab, seen] of Object.entries(readStorage())) note(tab, seen);
    });
  }
  return {
    /** What this tab shows now ('' for no room); call on every change and on the beat. */
    set(code: string): void {
      const seen = { code, at: d.now() };
      if (d.channel) {
        try { d.channel.postMessage({ tab: d.tab, ...seen }); } catch (_) { /* a closed channel */ }
        return;
      }
      const all = readStorage();
      const fresh: Record<string, unknown> = {};
      for (const [tab, s] of Object.entries(all)) {
        if (tab !== d.tab && isSeen(s) && d.now() - s.at <= ON_SCREEN_STALE_MS) fresh[tab] = s;
      }
      if (code) fresh[d.tab] = seen;
      try { d.storage?.setItem(ON_SCREEN_KEY, JSON.stringify(fresh)); } catch (_) { /* storage refused: this tab keeps quiet */ }
    },
    /** Another tab is showing this room right now. */
    elsewhere(code: string): boolean {
      if (!code) return false;
      const now = d.now();
      for (const s of others.values()) if (s.code === code && now - s.at <= ON_SCREEN_STALE_MS) return true;
      return false;
    },
  };
}
