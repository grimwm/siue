/* The Island of Crete: the false walls, Chapter 4's levels, in the level text (src/puzzle/level.ts).
 * Ten levels that bring in the fake wall and the invisible wall: the first three teach them (a painted wall gives
 * way as you walk in, an unseen wall stops you and the beast alike, and the two together), the rest mix them with the pieces
 * of Chapters 1 to 3 and clear the challenge bar, and the tenth, larger than the screen, has more than one way
 * through. The solver proves each winnable (test/chapter-4.test.ts). DOM-free. */
import { parse } from './level.ts';
import type { Level } from './level.ts';

export const FALSE_WALLS: readonly { id: string; text: string }[] = [
  { id: 'ch4-1', text: `title: The Wall That Gives
intro: The high way runs past the beast. The low way ends in a wall, and one of its stones is only painted: walk into it and it gives way, and you are through.

###########
#P...#...E#
#.##...##.#
#.#..M..#.#
#.#######.#
#....W....#
###########
` },
  { id: 'ch4-2', text: `title: The Gap That Is Not
intro: The gap under the beast is no gap. It is wall you cannot see, to him as much as to you. Walk the low hall beneath him; he will watch you through it and stay where he is.

###########
#P.....M.E#
#.###I###.#
#.........#
###########
` },
  { id: 'ch4-3', text: `title: Neither Wall Nor Floor
intro: Here what looks open is shut, and what looks shut is open. Bump what blocks you, go round what does not, and keep the beast in his hall above.

###########
#P........#
#.##.M.##.#
#.#######.#
#.I..W...E#
#...#######
###########
` },
  { id: 'ch4-4', text: `title: The Unseen Shore
intro: Flippers lie in the pool and three relics about it. Two stretches of floor here are wall you cannot see; the beast knows where they are, and he will not wade after you.

############
#P.#######*#
#...#M.~~~.#
#..*.I.~f~.#
#..#.#.~~~.#
#....#.....#
#..###..#.##
#*..O......#
###....##..#
###.##I..|E#
############
` },
  { id: 'ch4-5', text: `title: The Painted Stone
intro: Two relics, a red key and its door. The beast keeps the middle hall; two of these walls are only painted, and they are your way round him.

############
#P......#..#
#..##.#.#..#
#.#*..W.#.##
#.##.......#
#......M...#
#.#..##....#
#.#r.#...#.#
#...###.R..#
#...W..*#|E#
############
` },
  { id: 'ch4-6', text: `title: Lying Ground
intro: Loose stone and closing stone keep the beast off, and here the walls lie both ways: one painted, two unseen. Mind where the stones close behind you.

############
#P..::.#..##
#...#.#..;.#
##.#I....#.#
#.:..#W..#M#
#*##.##.:#.#
###..#...#.#
#...:....;.#
#..##.#.I..#
#*.#;.#...|E
############
` },
  { id: 'ch4-7', text: `title: The Glass Floor
intro: Ice runs through these halls and skates lie in the west. Two walls here are only painted, one of them across the ice; the beast skids as you do.

############
#P...#.##.*#
#.#....#...#
#.#==W==.###
#..##..=.#.#
#k.#M##=...#
#....##=...#
##......W..#
#...##....##
#*..#....|E#
############
` },
  { id: 'ch4-8', text: `title: The Waiting Wall
intro: A block, a button and a wall that waits on it. A painted stone stands near the block, and two unseen walls guard the low ways.

############
#P##..##.###
#.#...#..#.#
#.#O.W..*#.#
#.......T###
#...#._#..##
###.##.#..M#
#*#.#......#
#...#...I#.#
###.I..###|E
############
` },
  { id: 'ch4-9', text: `title: The General
intro: Fire burns across these halls, and boots lie near it. One wall here is painted and two are unseen; off the quick way a page waits, and a memory of the general of Minos.
pages: ch4-taurus

############
##..FF::..P#
#.;###.##..#
#.#h...I..##
#M##.W#..:.#
#.#:..#.#.*#
#.#.FF#..###
#.;....:...#
#.pI.##.#..#
E|.....;..*#
############
` },
  { id: 'ch4-10', text: `title: The Painted Labyrinth
intro: The false walls end in a maze of them. A red door is one way through and a painted wall the other; one more painted wall leads nowhere, and one stretch of open floor is not open at all. Off the quickest way, a page waits, and a memory of the queen.
pages: ch4-queen

####################
#P....#......####.p#
####....##...###..##
###*..:...##..:..###
#.......#..I##.....#
#..##...#.......#W.#
##.....#..###.#.#.##
#r###.:..M#...:.#.##
#.......###..#.#...#
#..*.###..##.#.R...#
#.#..#.#..:.#####.##
#*##...W##...####|E#
####################
` },
];

const cache = new Map<number, Level>();
/** False-wall level `i` (0-based), parsed once. */
export function falseWallLevel(i: number): Level {
  let lv = cache.get(i);
  if (!lv) {
    lv = parse(FALSE_WALLS[i]!.text);
    cache.set(i, lv);
  }
  return lv;
}
