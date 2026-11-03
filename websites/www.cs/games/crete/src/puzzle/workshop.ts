/* The Island of Crete: the workshop, Chapter 9's levels, in the level text (src/puzzle/level.ts).
 * Ten levels that bring in the thief, the bomb and the clone machine with its red button. DOM-free. */
import { parse } from './level.ts';
import type { Level } from './level.ts';

export const WORKSHOP: readonly { id: string; text: string }[] = [
  { id: 'ch9-1', text: `title: The Thief
intro: A thief waits beside you: step on it and it takes all your gear. Take the flippers first, then go round the thief, over the top, and swim the pool to the way out. Keep clear of the beast.

###########
##....#####
#..P$....##
#....##..##
#..f..#...#
#..#..#...#
#.........#
#..###M~~~#
#######~~E#
###########
` },
  { id: 'ch9-2', text: `title: The Bomb
intro: A bomb lies in the hall to the way out: step on it and it bursts, for a heart. Push the block along the hall onto it, and both are gone. The beast never steps on a bomb.

###########
#..O...!.E#
#...P##.M.#
#.#####...#
#.###.....#
#.........#
###########
` },
  { id: 'ch9-3', text: `title: The Clone Machine
intro: A clone machine stands by the moat, its red button above it. Step on the button and the machine makes a block; push the block into the water and cross on the dirt it leaves.
machines: block-right

###########
##.......##
##+...P...#
#C......#M#
#~~~~~~~~~#
#........E#
###########
` },
];

const cache = new Map<number, Level>();
/** Workshop level `i` (0-based), parsed once. */
export function workshopLevel(i: number): Level {
  let lv = cache.get(i);
  if (!lv) {
    lv = parse(WORKSHOP[i]!.text);
    cache.set(i, lv);
  }
  return lv;
}
