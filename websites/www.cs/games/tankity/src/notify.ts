/* Operation Tankity: turn alerts as browser notifications.
 *
 * Opt-in: the Turn alerts button asks for permission from its own click
 * (Safari only asks from a user gesture, and old Safari answers through a
 * callback rather than a promise) and remembers on/off in this browser. A
 * notification needs a tab of the game open somewhere (hidden is fine);
 * there is no Web Push. Everything is feature-detected: without the
 * Notification API the toasts and the tab-title alert still work. */
import { pref } from '../../_kit/prefs.ts';
import type { Codec, Pref } from '../../_kit/prefs.ts';
import type { StorageLike } from '../../_kit/ports.ts';

export type NotifyPermission = 'unsupported' | 'default' | 'granted' | 'denied';
export type AlertsSetting = 'on' | 'off';
export const ALERTS_KEY = 'tankity-turn-alerts';

interface NotificationLike {
  onclick: (() => void) | null;
  close(): void;
}
interface NotificationCtor {
  new (title: string, opts?: { body?: string; tag?: string }): NotificationLike;
  readonly permission: string;
  requestPermission(cb?: (p: string) => void): Promise<string> | undefined;
}
function api(): NotificationCtor | null {
  const N = (globalThis as { Notification?: unknown }).Notification;
  return typeof N === 'function' ? (N as NotificationCtor) : null;
}
function asPermission(p: unknown): NotifyPermission {
  return p === 'granted' || p === 'denied' ? p : 'default';
}

export function notifyPermission(): NotifyPermission {
  const N = api();
  if (!N) return 'unsupported';
  try { return asPermission(N.permission); } catch (_) { return 'unsupported'; }
}

/** Asks for permission. Call it straight from a click handler: the request
 * itself is made before anything awaits. Resolves with the answer, or the
 * current permission when the browser refuses to ask. */
export function askNotify(): Promise<NotifyPermission> {
  const N = api();
  if (!N) return Promise.resolve('unsupported');
  return new Promise(resolve => {
    let done = false;
    const finish = (p: unknown): void => { if (!done) { done = true; resolve(asPermission(p)); } };
    try {
      const out = N.requestPermission(finish);
      if (out && typeof (out as Promise<string>).then === 'function') {
        (out as Promise<string>).then(finish, () => finish(notifyPermission()));
      }
    } catch (_) {
      finish(notifyPermission());
    }
  });
}

const setting: Codec<AlertsSetting> = {
  parse: raw => { if (raw !== 'on' && raw !== 'off') throw new Error('unexpected'); return raw; },
  stringify: v => v,
};
/** Turn alerts on or off in this browser; off until the player turns them on. */
export function alertsPref(storage: StorageLike | null): Pref<AlertsSetting> {
  return pref<AlertsSetting>(ALERTS_KEY, 'off', setting, storage);
}

/** A notification that it is this player's turn in a room, when alerts are on
 * and permitted. Clicking it focuses the game and calls `onClick`. True when
 * one was shown. One per room: a newer one replaces it (the tag). */
export function showTurnNotification(room: { code: string; others: string[] }, alertsOn: boolean, onClick: () => void): boolean {
  const N = api();
  if (!N || !alertsOn || notifyPermission() !== 'granted') return false;
  try {
    const n = new N('Your turn in Operation Tankity', {
      body: `Room ${room.code} · vs ${room.others.length ? room.others.join(', ') : 'the drones'}`,
      tag: 'tankity-turn-' + room.code,
    });
    n.onclick = () => {
      try {
        const w = (globalThis as { window?: Window }).window;
        if (w) { try { w.top!.focus(); } catch (_) { w.focus(); } }
      } catch (_) { /* no window to focus */ }
      n.close();
      onClick();
    };
    return true;
  } catch (_) {
    return false; // Android Chrome refuses the constructor outside a service worker
  }
}
