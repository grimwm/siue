/* The Island of Crete: how alike two levels' layouts are, so no level repeats another's, turned, flipped or lightly
 * edited; players notice repeats. Two levels are compared by their terrain inside the border, under all eight turns
 * and flips of one, at every offset when their sizes differ by at most two rows and two columns. A cell is a feature
 * when it is not plain floor: a wall (the exit and gate count as wall), ice, water, fire, gravel, a force floor (any
 * way), a teleport, and so on. The overlap is the features the two share, cell for cell and kind for kind, over the
 * cells where either has one. A wall buried in other walls is filler and no feature: small boards are walled out to
 * their frame, and two blocks of solid rock look alike to the measure but not to a player.
 *
 * Matching cells are no measure: floor is most of every level, so unrelated levels agree on 70 to 85 per cent of
 * their cells. Walls alone miss copies whose likeness is in their ice, gravel and force floors. The threshold sits
 * in the gap between copies and levels drawn apart: every level grown from another (turned or flipped, then tuned)
 * overlapped its source by 0.44 to 0.96; pairs of levels drawn apart overlap by at most 0.40. test/layouts.test.ts
 * holds the campaign to it and Endless (src/endless/gate.ts) each level it makes. DOM-free. */
import type { Level } from './level.ts';
import type { Terrain } from './tiles.ts';

/** Two levels whose features overlap this much or more repeat one layout. */
export const SAME = 0.42;

/** A level's features, row by row inside its border; '' for no feature. */
export type Features = readonly (readonly string[])[];

const kindOf = (t: Terrain): string =>
  t === 'floor' ? '' : t.startsWith('force') ? 'force' : t.startsWith('toggle') ? 'toggle' : t === 'exit' || t === 'gate' ? 'wall' : t;

/** A wall with wall all round it, the eight cells next to it, is filler: solid rock that fills a small board out to
 *  its frame, with no shape a player sees. */
function filler(lv: Level, r: number, c: number): boolean {
  for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
    const R = r + dr, C = c + dc;
    if (R >= 0 && C >= 0 && R < lv.rows && C < lv.cols && kindOf(lv.terrain[R * lv.cols + C]!) !== 'wall') return false;
  }
  return true;
}

export function featuresOf(lv: Level): Features {
  return Array.from({ length: lv.rows - 2 }, (_, r) => Array.from({ length: lv.cols - 2 }, (_, c) => {
    const k = kindOf(lv.terrain[(r + 1) * lv.cols + c + 1]!);
    return k === 'wall' && filler(lv, r + 1, c + 1) ? '' : k;
  }));
}

const turn = (g: Features): Features => g[0]!.map((_, c) => g.map(row => row[c]!).reverse());
const flip = (g: Features): Features => g.map(r => [...r].reverse());

/** The eight turns and flips of a level's features. */
export function eight(g: Features): Features[] {
  const out: Features[] = [];
  for (let i = 0, x = g; i < 4; i++, x = turn(x)) out.push(x, flip(x));
  return out;
}

/** The most the features `A` and any of `Bs` (one level's eight turns and flips) overlap, at the offsets that fit. */
export function overlapOf(A: Features, Bs: readonly Features[]): number {
  let best = 0;
  for (const B of Bs) {
    const [small, big] = A.length * A[0]!.length <= B.length * B[0]!.length ? [A, B] : [B, A];
    const h = small.length, w = small[0]!.length, H = big.length, W = big[0]!.length;
    if (h > H || w > W || H - h > 2 || W - w > 2) continue;
    for (let dr = 0; dr <= H - h; dr++) for (let dc = 0; dc <= W - w; dc++) {
      let both = 0, either = 0;
      for (let r = 0; r < h; r++) for (let c = 0; c < w; c++) {
        const x = small[r]![c]!, y = big[r + dr]![c + dc]!;
        if (x && x === y) both++;
        if (x || y) either++;
      }
      best = Math.max(best, either ? both / either : 1);
    }
  }
  return best;
}

/** The most the features of `a` and `b` overlap, over the eight turns and flips of `b` and the offsets that fit. */
export function overlap(a: Level, b: Level): number {
  return overlapOf(featuresOf(a), eight(featuresOf(b)));
}
