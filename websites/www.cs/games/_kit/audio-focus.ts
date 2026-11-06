/* A game in a frame on another page (a blog's embed, the site's play/<id>/ page) goes quiet when the player clicks
 * out of the frame and comes back when they click, tab or press a key in it again. `followFocus` tells the game
 * `away` and `back`; what going quiet means stays in the game (the kit core's setAway fades its buses and suspends
 * its context). A game on its own page (the top window) is never away: followPage (page-life.ts) already quiets it
 * when its tab hides. Inside the frame, a blur that leaves the frame focused (focus moving to one of the game's own
 * inputs or frames, an alert, the game's own fullscreen) is not leaving: the check waits BLUR_SETTLE_MS, then asks
 * the document whether it still has focus. */
import type { Timers } from './ports.ts';

type Listen = (type: string, fn: (e: unknown) => void, capture?: boolean) => void;

export interface FocusTargets {
  win: { top: unknown; addEventListener: Listen };
  doc: { visibilityState: string; hasFocus(): boolean; fullscreenElement?: unknown; addEventListener: Listen };
  timers: Pick<Timers, 'setTimeout' | 'clearTimeout'>;
}

export interface FocusHooks {
  /** The player left the frame (or its tab hid): go quiet. Not called twice in a row. */
  away(): void;
  /** The player is back in the frame and it shows: bring back what was playing. Only after `away`. */
  back(): void;
}

/** Seconds a game's sound takes to fade out when the player leaves (the core's setAway, Crete's music). */
export const AWAY_FADE_S = 0.15;

/** Milliseconds a blur waits before asking whether the frame still has focus. */
export const BLUR_SETTLE_MS = 50;

/** Whether this window is a frame in another page; a top window that cannot be read counts as one. */
export function isEmbedded(win: { top: unknown }): boolean {
  try {
    return win.top !== win;
  } catch {
    return true;
  }
}

/** Follows the frame's focus; returns false (and listens to nothing) in a top window. */
export function followFocus(t: FocusTargets, on: FocusHooks): boolean {
  if (!isEmbedded(t.win)) return false;
  let out = false;
  let pending = 0;
  const leave = (): void => { if (!out) { out = true; on.away(); } };
  const come = (): void => { if (out) { out = false; on.back(); } };
  const cancel = (): void => { if (pending) t.timers.clearTimeout(pending); pending = 0; };
  const shown = (): boolean => t.doc.visibilityState !== 'hidden';
  /** Focus anywhere in the frame (its own frames too), or the frame's document full screen. */
  const inFrame = (): boolean => {
    try {
      return t.doc.hasFocus() || (t.doc.fullscreenElement ?? null) !== null;
    } catch {
      return true;
    }
  };
  const check = (): void => {
    cancel();
    if (shown() && inFrame()) come();
    else leave();
  };
  t.win.addEventListener('blur', () => { cancel(); pending = t.timers.setTimeout(check, BLUR_SETTLE_MS); });
  t.win.addEventListener('focus', check);
  // A press in the frame is the player back, before the game's own handlers see it (capture on the window).
  const press = (): void => { cancel(); if (shown()) come(); };
  t.win.addEventListener('pointerdown', press, true);
  t.win.addEventListener('keydown', press, true);
  t.doc.addEventListener('visibilitychange', check);
  check();
  return true;
}
