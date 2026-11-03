/* The Island of Crete: the winds, Chapter 8's levels, in the level text (src/puzzle/level.ts).
 * Ten levels that bring in the Harpy and Talos's fire. DOM-free. */
import { parse } from './level.ts';
import type { Level } from './level.ts';

export const WINDS: readonly { id: string; text: string }[] = [
  { id: 'ch8-1', text: `title: The Harpy
intro: One Harpy flies the halls ahead, straight on, and turns left at every wall that stops it. Touch it and it costs a heart: wait in the niche while it passes, and keep clear of the beast.
facing: right

############
#..##......#
#...#.####.#
#....#####.#
###.#P####.#
###.#.####.#
###w.......#
#.####...###
#..M......E#
############
` },
  { id: 'ch8-2', text: `title: Over the Water
intro: One Harpy flies up and down the pool in the north, where you cannot swim, and each time it crosses the button there the toggle wall opens or shuts. Go through while it is open, and let it shut on the beast behind you.
facing: left

############
#w~~~_~~~~##
####P#...###
#.##.##...##
#M.#..#...##
#......T...#
#....####..#
#########.E#
############
` },
  { id: 'ch8-3', text: `title: Talos's Fire
intro: Talos's fire runs up and down the burning hall, through the flames as if they were floor. The fire boots carry you over the flames, but not past it: cross when it has gone by.
facing: up

############
#h.P##.F####
#.#....F####
#.##...F####
#.###..e.###
#...##.F.M.#
##.....F...#
##.#..#F.#E#
############
` },
];

const cache = new Map<number, Level>();
/** Wind level `i` (0-based), parsed once. */
export function windLevel(i: number): Level {
  let lv = cache.get(i);
  if (!lv) {
    lv = parse(WINDS[i]!.text);
    cache.set(i, lv);
  }
  return lv;
}
