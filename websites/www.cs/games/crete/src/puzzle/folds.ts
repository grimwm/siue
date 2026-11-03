/* The Island of Crete: the folds, Chapter 6's levels, in the level text (src/puzzle/level.ts).
 * Ten levels that bring in the teleport: the first three teach it (a teleport carries you, the beast cannot follow,
 * and a block goes through too), the rest mix it with the pieces of Chapters 1 to 5 and clear the challenge bar, and
 * the tenth, larger than the screen, has more than one way round. The solver proves each winnable
 * (test/chapter-6.test.ts). DOM-free. */
import { parse } from './level.ts';
import type { Level } from './level.ts';

export const FOLDS: readonly { id: string; text: string }[] = [
  { id: 'ch6-1', text: `title: The Teleport
intro: The way out lies in a sealed hall. Two teleports join it to the rest: step into the one in the south hall and you step out of the other, still walking the way you went in.

###########
#P....#..E#
#.##..#...#
#..#..#@..#
#..#..#####
#...M.@####
###########
` },
  { id: 'ch6-2', text: `title: Where He Cannot Follow
intro: The short way round to the gate runs past the beast. To him the two teleports are wall: go through, and he is left behind.

##########
#E...##..#
#.M#...@.#
##...#..##
#....##..#
#.....@..#
######..P#
##########
` },
  { id: 'ch6-3', text: `title: Through the Fold
intro: A block goes through a teleport as you do. Of the two teleports, push it into the one in the west hall, and it comes out of the other into the pool beyond and fills it.

###########
#P...##E..#
#....##.#.#
#..O.@#.#.#
#.###.#.#.#
#.M...#@~.#
###########
` },
  { id: 'ch6-4', text: `title: The Driven Fold
intro: Three teleports, each sending you out of the next along, counting left to right and top to bottom. Force floors drive you round the middle; the suction boots in the south let you walk them as you please. Three relics.

############
#..........#
#........@.#
#..#..P..*##
#.#...*...##
#.#>>>v...@#
#...#.v....#
##.##u<<<..#
##.@####...#
#M....*##|E#
############
` },
  { id: 'ch6-5', text: `title: The Drowned Fold
intro: Three teleports, and each sends you out of the next along, counting left to right and top to bottom. Flippers lie by the southern pool; a block waits in the north, by the beast and the first of two relics.

############
#...#M*.~~.#
#...O..#~~.#
#@..##.##@.#
#..#*......#
#..##@###.##
#P.##.....##
#.~~##.##..#
##~~f..##..#
##.......|E#
############
` },
  { id: 'ch6-6', text: `title: The Burning Fold
intro: Three teleports stand together in the west, each sending you out of the next along. Fire burns in two places, and boots lie just past the teleports; the button in the west opens the toggle walls, and shuts them again.

############
#.........M#
#..P..FFF..#
##.........#
##.@@....T.#
#..@.h#...##
#...._##..##
#.FF....T#.#
##*#...#...#
#.#..*.#.|E#
############
` },
  { id: 'ch6-7', text: `title: The Frozen Fold
intro: Two teleports join the south to the north. Ice runs across both halls, and skates lie in the west; three relics, and a pop-up wall that rises behind you once you have crossed it.

############
##..##*#.|E#
#.=====..M.#
#.......@..#
##*.....*.##
#..........#
#....;.....#
#.k#=====..#
#P##.@#....#
#.......#..#
############
` },
  { id: 'ch6-8', text: `title: The Far Gate
intro: Two teleports, ice in the north and the south, skates by the start, and a pop-up wall in the middle hall. Three relics, and the gate lies in the far southwest.

############
#..#.......#
#....#@.##P#
#..=====#k.#
#.....;....#
#*.........#
##.......*.#
#..@.......#
#.M..=====.#
#E|.#*##..##
############
` },
  { id: 'ch6-9', text: `title: The Workshop
intro: Three teleports, each sending you out of the next along. Force floors run down the north hall, and suction boots lie in the south; four relics. Off the quick way a page waits, and a memory of the sky.
pages: ch6-sky

############
#.P..>>>v.*#
#.......v..#
#....p*.v###
#.......<<##
#.##.M...###
##.@.#...@.#
#.@..##....#
##..*u#....#
#....#*.#|E#
############
` },
  { id: 'ch6-10', text: `title: The Heart of the Fold
intro: The folds end at the gate. Three teleports, fire and the boots for it, the toggle walls and their button, and a red key in the south for the door to the last relic. Off the quickest way, a page waits, and a memory of the man who folded these halls.
pages: ch6-arts

############
#.........##
##.P..FFF.M#
##.....@...#
##..@....T##
#..@.h#...##
#...._##..##
#.FF....T..#
##*#..*#...#
###*R#.#...#
#.##.###.#.#
#r.........#
#.##p.##.|E#
############
` },
];

const cache = new Map<number, Level>();
/** Fold level `i` (0-based), parsed once. */
export function foldLevel(i: number): Level {
  let lv = cache.get(i);
  if (!lv) {
    lv = parse(FOLDS[i]!.text);
    cache.set(i, lv);
  }
  return lv;
}
