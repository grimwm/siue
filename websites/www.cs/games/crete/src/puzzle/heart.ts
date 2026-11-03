/* The Island of Crete: the heart of the Labyrinth, Chapter 10's levels, in the level text (src/puzzle/level.ts).
 * Ten levels that bring in nothing new: the first three each join two earlier pieces in a new way, and the rest
 * mix pieces from across the campaign, up to the last level, where Theseus faces the Minotaur. DOM-free. */
import { parse } from './level.ts';
import type { Level } from './level.ts';

export const HEART: readonly { id: string; text: string }[] = [
  { id: 'ch10-1', text: `title: The Wooden Cow
intro: Daedalus's wooden cow lies beside you: set it down and the beast goes to it, not to you. A snare waits in the top hall, with no button to loose it. Lead him round to it.

###########
#cP..&....#
#.###.##..#
#...#.#...#
#...#.#.#.#
#.#.....#.#
#.#######.#
#.....M..E#
###########
` },
  { id: 'ch10-2', text: `title: Stone and Fire
intro: Medusa's mirror lies in the south: hold it up and the beast turns to stone for three turns. Talos's fire runs its round in the west, and the mirror never stills it.
facing: down

###########
#e..M.#...#
#.##..###.#
#.#.P.....#
#.#.#####.#
#...#.....#
###.#z###.#
#.......#E#
###########
` },
  { id: 'ch10-3', text: `title: The Fold and the Bomb
intro: A bomb waits by the way out. Push the block into the teleport in the south: it comes out of the one in the north and rolls on, onto the bomb.

###########
#..@.....!#
#M#####.#E#
#....P#.#.#
#####.#...#
#.........#
#.#########
#......O.@#
###########
` },
  { id: 'ch10-4', text: `title: The Snared Hall
intro: A snare holds the doorway to the southwest room, gravel the way east, and the wooden cow waits in the north room. Two relics.

############
#.......#..#
#...c......#
####.##.#.##
E....#..#..#
#....#P.:..#
#....#..#..#
####.#####.#
#....#...*.#
#....#.....#
#....&*..M.#
############
` },
];

const cache = new Map<number, Level>();
/** Heart level `i` (0-based), parsed once. */
export function heartLevel(i: number): Level {
  let lv = cache.get(i);
  if (!lv) {
    lv = parse(HEART[i]!.text);
    cache.set(i, lv);
  }
  return lv;
}
