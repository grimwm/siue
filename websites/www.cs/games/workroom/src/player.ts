// Playback decisions that need no browser: which audio file to use, when a
// hear-it clip stops and how the view follows the playhead. DOM-free.
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

/** Keeps the playhead visible: a view whose window contains t, moved by whole pages (a page is the window's width in seconds). */
export function follow(view: View, t: number, b: Bounds): View {
  const page = view.width / view.pxPerSec;
  if (t >= view.start && t < view.start + page) return view;
  return clampView({ ...view, start: Math.floor(t / page) * page }, b);
}
