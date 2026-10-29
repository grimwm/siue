/* The Island of Crete, modern look: the render quality ladder. 3 is full (shadows, paint, pixel ratio up to
 * 2), 2 drops shadows, 1 drops the paint filter, 0 drops to pixel ratio 1. DOM-free. */

export type Quality = 0 | 1 | 2 | 3;

const WINDOW = 20;
const SLOW_MS = 40;

/** One step down when the median of the last 20 animating frames is slow. Quality never rises. */
export function nextQuality(q: Quality, recentFrameMs: readonly number[]): Quality {
  if (q === 0 || recentFrameMs.length < WINDOW) return q;
  const last = recentFrameMs.slice(-WINDOW).sort((x, y) => x - y);
  const median = ((last[WINDOW / 2 - 1] ?? 0) + (last[WINDOW / 2] ?? 0)) / 2;
  return median > SLOW_MS ? ((q - 1) as Quality) : q;
}

/** The frame time a frame adds to the ladder's window: its gap from the last frame only when that frame asked for
 *  it (a run of animation frames); a frame drawn after an idle wait or on a loop's own tick adds nothing. */
export function frameSample(chained: boolean, gapMs: number): number | null {
  return chained ? gapMs : null;
}
