/* The Island of Crete: the closing ways, Chapter 3's levels, in the level text (src/puzzle/level.ts).
 * Ten levels that bring in the pop-up wall: the first three teach it (it rises behind you, the beast will not
 * tread on it, a block will not cross it), the rest mix it with the pieces of Chapters 1 and 2 and clear the
 * challenge bar, and the tenth, larger than the screen, has more than one way through. The solver proves each
 * winnable (test/chapter-3.test.ts). DOM-free. */
import { parse } from './level.ts';
import type { Level } from './level.ts';

export const CLOSING: readonly { id: string; text: string }[] = [
  { id: 'ch3-1', text: `title: The Rising Floor
intro: These stones bear you once. Step off one and it rises into wall behind you. The beast waits on the short way; take the long way, under him.

###########
#P.......E#
#.##.M.##.#
#.#######.#
#.;.....;.#
###########
` },
  { id: 'ch3-2', text: `title: Stones He Will Not Tread
intro: The beast will not set a hoof on these stones, risen or not. Two of them pen him in the lower hall; go round, and leave him there.

############
#P.........#
#.########;#
#.#......#.#
#.#.####.#.#
#..;...M.;.#
######.###.#
######...|E#
############
` },
  { id: 'ch3-3', text: `title: The Block That Stays
intro: A pushed block will not cross a closing stone either. The near way to the pool is barred to it, and the beast keeps the way round; get the block there anyway.

############
#P..#..#..##
#.#...#.#.##
#...O..;.~E#
##.#####...#
##.######..#
#..........#
#....#M.##.#
############
` },
  { id: 'ch3-4', text: `title: The Red Door
intro: A red door and its key, and stones that close behind you. The door is the quicker way; every stone you cross is one you cannot cross again.

############
#P......r..#
#.......##.#
#.#...;..#.#
#.##.....#.#
#...;....#M#
###..#.#.#.#
#*#.#...;..#
#.#..##R##.#
#...#.;...|E
############
` },
  { id: 'ch3-5', text: `title: The Flooded Hall
intro: Pools fill the middle of this hall. The beast will not wade them and will not tread the closing stones; between the two, find your way to both relics.

############
#P.......f.#
#..#.....#.#
##..;..##..#
##..##....##
#..#.~~~;..#
#....~.~...#
#*;#.~~~..M#
###....#...#
#*...#..;.|E
############
` },
  { id: 'ch3-6', text: `title: The Sliding Floor
intro: Ice and a pushing current run through this hall, and closing stones hold the beast back. Let neither the ice nor the current carry you where you cannot leave.

############
#P..#...=..#
#...#.#.=#.#
#.#...;#=#.#
#..#...#...#
##.>>>>...M#
#..#.#.....#
#*..;...k..#
###...#.#..#
#*...;..#.|E
############
` },
  { id: 'ch3-7', text: `title: The Stone in the Way
intro: A block stands in the way, and a wall waits on a button. The closing stones leave few ways round; plan before you cross.

############
#P...#...#.#
#.##.#...#.#
#..O.;...###
#....##..#.#
#...._.T.;M#
###.#....#.#
#*..;#.....#
##.#.......#
#*....;#..|E
############
` },
  { id: 'ch3-8', text: `title: Marked Ground
intro: Loose stone, marked stone and closing stone: the beast can stand on none of them. Between them lies open floor, and that is where he will look for you.

############
#P..::...###
##....##..##
#.#.;.....##
#.....S#...#
#*.#....;#M#
###.:.#....#
#...###..#.#
#.;##...:..#
#*...#.#.;|E
############
` },
  { id: 'ch3-9', text: `title: The Bronze Glass
intro: Fire burns across these halls, and a bronze mirror lies past the beast. Off the quick way a page waits, and a memory of the games of Minos.
pages: ch3-games

############
#P.....h...#
#.#.#.#.##.#
#...;.FF...#
#.#.##p.##.#
#*.#;.#z#.M#
###....#...#
#*......;..#
#..##..F#..#
#.#.x.;...|E
############
` },
  { id: 'ch3-10', text: `title: The Ring of Walls
intro: The closing ways end in a ring of walls that were floor a moment ago. A red door is one way through and the long west hall another; off the quickest, a page waits, and a memory of Ariadne.
pages: ch3-thread

####################
#P...#....;...#.p..#
#.##...####..##.##.#
#..r.;...#...#..;..#
#..#.......#.#.##..#
#*.#.#.#.#.#...#..##
#....###..######.#.#
#....;.......M#..#.#
###.#..#####...##;.#
#...R...........#..#
#.##..##....##..#..#
#*#..;...#.##.x.;.|E
####################
` },
];

const cache = new Map<number, Level>();
/** Closing way `i` (0-based), parsed once. */
export function closingLevel(i: number): Level {
  let lv = cache.get(i);
  if (!lv) {
    lv = parse(CLOSING[i]!.text);
    cache.set(i, lv);
  }
  return lv;
}
