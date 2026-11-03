// The timeline following the playhead while the music plays: the playhead walks to the middle of the visible area
// (right of the track heads), then the music scrolls under it, and at the end it walks on to the last bar. A scroll by
// hand pauses following until the playhead has left the view and come back into it, and 600 ms have passed since the
// last hand scroll. Pure: the caller sets the scroll position it returns. DOM-free.

/** Following's state: paused by a hand scroll, whether the playhead left the view since, the last scroll it set, and when it may resume. */
export interface Follow { paused: boolean; out: boolean; set: number | null; until: number }
/** The scroll box: where it is scrolled to, how wide it shows and holds, and the track heads' width over its left edge. */
export interface FollowView { scrollLeft: number; clientWidth: number; scrollWidth: number; inset: number }

/** How long after a hand scroll following may resume, in ms. */
export const RESUME_MS = 600;

export function newFollow(scrollLeft: number): Follow {
  return { paused: false, out: false, set: scrollLeft, until: 0 };
}

/** The scrollLeft that keeps the playhead at `x` in view as described above, or null to leave it. */
export function followTo(f: Follow, x: number, view: FollowView, now: number): number | null {
  const cw = view.clientWidth;
  const max = view.scrollWidth - cw;
  if (cw <= 0 || max <= 0) return null;
  const sl = view.scrollLeft;
  const inView = x >= sl + view.inset && x <= sl + cw;
  if (f.paused) {
    if (!inView) { f.out = true; return null; }
    if (!f.out || now < f.until) return null;
    f.paused = false;
  }
  const want = Math.max(0, Math.min(max, x - view.inset - (cw - view.inset) / 2));
  if (want > sl + 0.5 || x < sl + view.inset) {
    f.set = want;
    return want;
  }
  return null;
}

/** Called from the scroll listener while playing: a scroll that is not the one following set pauses following. */
export function handScrolled(f: Follow, scrollLeft: number, now: number): void {
  if (f.paused) { f.until = now + RESUME_MS; return; }
  if (f.set !== null && Math.abs(scrollLeft - f.set) > 2) {
    f.paused = true;
    f.out = false;
    f.until = now + RESUME_MS;
  }
}
