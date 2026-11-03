/* The Island of Crete: the rounds, Chapter 7's levels, in the level text (src/puzzle/level.ts).
 * Ten levels that bring in the bronze ball: the first three teach it (wait while it rolls past, it and the beast
 * block each other, and it presses a button as it rolls over), the rest mix it with the pieces of Chapters 1 to 6
 * and clear the challenge bar, and the tenth, larger than the screen, has more than one way round. The solver proves
 * each winnable (test/chapter-7.test.ts). DOM-free. */
import { parse } from './level.ts';
import type { Level } from './level.ts';

export const ROUNDS: readonly { id: string; text: string }[] = [
  { id: 'ch7-1', text: `title: The Bronze Ball
intro: One bronze ball rolls along the hall between you and the way out, straight ahead, and turns back at each end. Touch it and it costs a heart: step into the niche off the hall and let it roll past.
facing: right

############
#........M.#
#.########.#
#......o...#
#P##.####.E#
############
` },
  { id: 'ch7-2', text: `title: The Ball and the Beast
intro: The beast's one way out of his hall is the passage where one bronze ball rolls up and down. Neither can pass the other: while it rolls there, he stays in.
facing: down

############
#..P......E#
######o#####
######.#####
#####..#####
#.......M..#
############
` },
  { id: 'ch7-3', text: `title: The Rolling Button
intro: One bronze ball rolls in a sealed hall in the north, over a button. Each time it passes, the toggle wall in your way opens or shuts: watch it, and go through while the way is open.
facing: right

############
#o...._....#
############
##...T..####
#P.###M....#
##........E#
############
` },
];

const cache = new Map<number, Level>();
/** Round level `i` (0-based), parsed once. */
export function roundLevel(i: number): Level {
  let lv = cache.get(i);
  if (!lv) {
    lv = parse(ROUNDS[i]!.text);
    cache.set(i, lv);
  }
  return lv;
}
