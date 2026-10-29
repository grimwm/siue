// Playback decisions that need no browser: which audio file to use, when a
// hear-it clip stops, where the transport buttons jump and how the view
// follows the playhead. DOM-free.
import type { AudioSource } from './score.ts';
import type { Bounds, View } from './zoom.ts';
import { clampView } from './zoom.ts';

/** The first source the browser says it can play (canPlay answers '' for none). */
export function pickSource(sources: readonly AudioSource[], canPlay: (type: string) => string): AudioSource | null {
  return sources.find(s => canPlay(s.type) !== '') ?? null;
}

export interface Clip { from: number; to: number }

/** Where a clip stops: true once t has reached clip.to. */
export function clipDone(t: number, clip: Clip): boolean {
  return t >= clip.to;
}

export type Skip = 'back5' | 'ahead5' | 'prev' | 'next';
/** Within this many seconds of a section's start, previous section goes to the section before it. */
const PREV_GRACE = 1.5;

/** Where a transport button jumps from t: five seconds back or ahead (clamped to 0..duration), or to the previous or next section start (starts ascending, in seconds). Previous from within PREV_GRACE of a start goes to the one before, and to 0 when none is; next past the last start stays at t. */
export function skipTarget(kind: Skip, t: number, duration: number, starts: readonly number[]): number {
  if (kind === 'back5') return Math.max(0, t - 5);
  if (kind === 'ahead5') return Math.min(duration, t + 5);
  if (kind === 'prev') return starts.filter(s => s <= t - PREV_GRACE).pop() ?? 0;
  return Math.min(duration, starts.find(s => s > t) ?? t);
}

/** Keeps the playhead visible: a view whose window contains t, moved by whole pages (a page is the window's width in seconds). */
export function follow(view: View, t: number, b: Bounds): View {
  const page = view.width / view.pxPerSec;
  if (t >= view.start && t < view.start + page) return view;
  return clampView({ ...view, start: Math.floor(t / page) * page }, b);
}
