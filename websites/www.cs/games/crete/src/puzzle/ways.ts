/* The Island of Crete: the winding ways, Chapter 2's levels, in the level text (src/puzzle/level.ts).
 * Ten levels that bring in gravel: the first three teach it (alone, against the Minotaur, against a block), the
 * rest mix it with Chapter 1's pieces and clear the challenge bar, and the tenth, larger than the screen, ends at
 * the inner gate. The solver proves each winnable (test/chapter-2.test.ts). DOM-free. */
import { parse } from './level.ts';
import type { Level } from './level.ts';

export const WAYS: readonly { id: string; text: string }[] = [
  { id: 'ch2-1', text: `title: The Loose Stone
intro: Daedalus strewed these ways with loose stone. You can cross it; the beast's hooves cannot. Leave him the open hall and take the stony way round.

###########
#P.....M.E#
#.#######.#
#.:::::::.#
###########
` },
  { id: 'ch2-2', text: `title: The Stone Between
intro: The beast will not step onto loose stone, not even to reach you. Draw him round to your side, keep a stone between you, and walk on.

############
#..........#
#.#.####.#.#
#P..:..:M.*#
#.#.####.#.#
#..........#
##########|#
##########E#
############
` },
  { id: 'ch2-3', text: `title: The Stubborn Block
intro: A pushed block will not cross loose stone either. The near pool is barred to it; find the long way round to the far one.

###########
#E.#.#..M.#
##.#.#..#.#
#....~:OP##
#.##.#...##
#....~....#
#.##.#....#
#.....#####
###########
` },
  { id: 'ch2-4', text: `title: The Currents
intro: Daedalus set currents running through these ways, and they carry the beast as they carry you. Draw him onto them and let them take him while you gather the relics; suction boots will hold you fast.

############
#P...>..>.##
#>..:.#...##
#.##.^*:#*.#
#^....##...#
#.<:#^:Mu.##
#...:...#.##
##....#:.#.#
#*#.....##.#
#.<.v.#.:..E
############
` },
  { id: 'ch2-5', text: `title: The Glassy Ways
intro: The floors are polished to ice, and the beast skids on them as you do. Loose stone does not slide: stop on it, where he cannot follow. Skates lie somewhere in the cold.

############
#P..#k.#..*#
#=...:.#=..#
#.:=....:.##
#..=##.=.#.#
#.==.*#=M..#
#.:....=...#
#.#.#..===.#
#:..:.#..###
#.=*#..#.=.E
############
` },
  { id: 'ch2-6', text: `title: Water and Fire
intro: A river and a fire cross these ways, with loose stone between them. Flippers and fire boots both lie here, and you will need both; the beast will not wait while you find them.

############
#P:.#~.##.*#
#...~.O.F:##
#..#....F#:#
#f...##:..##
####.####M.#
#*##...#.#.#
#.F..~h:~#.#
###.#.#:...#
#*.~#.#F:.|E
############
` },
  { id: 'ch2-7', text: `title: The Three Locks
intro: Three doors and three keys, and not every key is worth its door. Each door you open is another road for the beast. Loose stone is a road for you alone.

############
#P..#..#.#*#
##..Rr##.#.#
#.#.#:.:#..#
#r..##:M..##
#.....:..###
#*#:#b#....#
##R:B...##.#
#..#..####.#
#:#.#..*##.E
############
` },
  { id: 'ch2-8', text: `title: The Shifting Walls
intro: A plate here moves the walls, and the only road over the water is a block you sink yourself. Loose stone turns the blocks aside, and the beast with them.

############
#P..##...*##
#.....#....#
#.....~.##.#
##.....##:.#
#*.#._#:M..#
#.#..#:.:O.#
#:O...##~.T#
#::...#.T..#
#*.........E
############
` },
  { id: 'ch2-9', text: `title: The Bronze Mirror
intro: A bronze mirror lies past the beast, and Daedalus's cow beside him. Marked stones and loose ones both keep him off you; between them you will have to run. Off the quick way, a page waits, and a memory of Athens.
pages: ch2-lots

############
#:.##.p#z.*#
#P....#.:#.#
###..#..:.##
##.#.#:#.###
#*...S.M.c.#
##..##.###.#
##x#:..S#:.#
#.S#.####..#
#*..##....|E
############
` },
  { id: 'ch2-10', text: `title: The Inner Gate
intro: The winding ways end at the inner gate. Water guards it on one side and fire on the other: flippers take you through the one, fire boots through the other. The longest way round holds a page and a honey cake.
pages: ch2-black-sail

####################
#P..##.:.......p..x#
#.##::.##....##.:..#
#..r.:...#...#..:.##
#..##.:#...#..:##:.#
#*:###.#...#......##
#....#.#.#####.#.#.#
#....:.h.#.*M#.....#
###.#..#####.###~###
##..R#.......###~###
#.####....##.#..~.*#
#*..:..##.f...FF..|E
####################
` },
];

const cache = new Map<number, Level>();
/** Way `i` (0-based), parsed once. */
export function wayLevel(i: number): Level {
  let lv = cache.get(i);
  if (!lv) {
    lv = parse(WAYS[i]!.text);
    cache.set(i, lv);
  }
  return lv;
}
