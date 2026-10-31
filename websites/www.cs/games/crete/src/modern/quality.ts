/* The Island of Crete, modern look: the render quality ladder, judged by the measured frame rate. 3 is full
 * (shadows, pixel ratio up to 2, FXAA), 2 drops shadows, 1 drops FXAA, 0 drops to pixel ratio 1. Only animating frames are measured: idle waits, loop ticks, stalls (a tab switch, a hidden board) and the
 * first frames after a level opens or the ladder moves count for nothing. One step down when the rate stays under
 * 40 fps over two seconds of animation; one step back up when it stays over 55 fps for three seconds, unless that
 * step has already proved too slow twice. A single slow frame never moves it. DOM-free. */

export type Quality = 0 | 1 | 2 | 3;

/** Under this rate over DOWN_MS of animation, one step down. */
export const DOWN_FPS = 40;
export const DOWN_MS = 2000;
/** Over this rate over UP_MS of animation, one step up. */
export const UP_FPS = 55;
export const UP_MS = 3000;
/** A gap this long between animating frames is a stall, not a frame time. */
export const STALL_MS = 250;
/** Frames left out after a level opens, the tab returns or the ladder moves: the first ones build and upload. */
export const WARM_FRAMES = 10;
/** A step that has proved too slow this many times is not stepped back up to. */
const FAILS = 2;

export interface Ladder {
  q: Quality;
  /** The recent animating frames' times, oldest first, in ms. */
  gaps: number[];
  /** Frames still to leave out. */
  skip: number;
  /** How often each step proved too slow. */
  fails: number[];
}

export function createLadder(): Ladder {
  return { q: 3, gaps: [], skip: WARM_FRAMES, fails: [0, 0, 0, 0] };
}

/** Forgets the window and leaves out the next few frames: after a level opens or the tab returns. */
export function rewarm(l: Ladder): void {
  l.gaps = [];
  l.skip = WARM_FRAMES;
}

/** The frame rate over the latest `windowMs` of measured frames, or null until that much is measured. */
export function rate(gaps: readonly number[], windowMs: number): number | null {
  let sum = 0;
  for (let i = gaps.length - 1; i >= 0; i--) {
    sum += gaps[i]!;
    if (sum >= windowMs) return ((gaps.length - i) * 1000) / sum;
  }
  return null;
}

/** Measures one animating frame `gapMs` after the last; returns the step to draw at. */
export function measure(l: Ladder, gapMs: number): Quality {
  if (gapMs > STALL_MS) return l.q;
  if (l.skip > 0) {
    l.skip--;
    return l.q;
  }
  l.gaps.push(gapMs);
  // Keep just enough for the longer window.
  let sum = 0, keep = 0;
  for (let i = l.gaps.length - 1; i >= 0 && sum < UP_MS; i--, keep++) sum += l.gaps[i]!;
  if (keep < l.gaps.length) l.gaps = l.gaps.slice(-keep);
  const down = rate(l.gaps, DOWN_MS);
  if (down !== null && down < DOWN_FPS && l.q > 0) {
    l.fails[l.q]!++;
    l.q = (l.q - 1) as Quality;
    rewarm(l);
  } else if (l.q < 3 && (l.fails[l.q + 1] ?? 0) < FAILS) {
    const up = rate(l.gaps, UP_MS);
    if (up !== null && up > UP_FPS) {
      l.q = (l.q + 1) as Quality;
      rewarm(l);
    }
  }
  return l.q;
}

/** The frame time a frame adds to the ladder: its gap from the last frame only when that frame asked for it (a run
 *  of animation frames); a frame drawn after an idle wait or on a loop's own tick adds nothing. */
export function frameSample(chained: boolean, gapMs: number): number | null {
  return chained ? gapMs : null;
}
