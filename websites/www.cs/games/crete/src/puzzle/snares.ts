/* The Island of Crete: the snares, Chapter 5's levels, in the level text (src/puzzle/level.ts).
 * Ten levels that bring in Daedalus's snare and its brown button: the first three teach them (a snare holds the
 * beast, a block on a brown button opens a snare in your way, and a button frees whatever its snare holds), the
 * rest mix them with the pieces of Chapters 1 to 4 and clear the challenge bar, and the tenth, larger than the
 * screen, has more than one way through. The solver proves each winnable (test/chapter-5.test.ts). DOM-free. */
import { parse } from './level.ts';
import type { Level } from './level.ts';

export const SNARES: readonly { id: string; text: string }[] = [
  { id: 'ch5-1', text: `title: The Snare
intro: The beast stands between you and the way out. A snare of Daedalus lies in the west hall: lead him into it and it will hold him while you pass.

###########
#P......#E#
#.###.#.#.#
#.#...#.#.#
#.&.#M....#
#...#.###.#
#.........#
###########
` },
  { id: 'ch5-2', text: `title: The Brown Button
intro: The high way runs past the beast; the low way crosses a snare that would hold you for good. Push the block onto the brown button below it, and the snare lies open for as long as the block stays there.

###########
#P...#...E#
#.##...##.#
#.#..M..#.#
#.#######.#
#....&....#
#.O.#######
#.-.#######
###########
` },
  { id: 'ch5-3', text: `title: Bound and Loosed
intro: Lead the beast into the snare, then mind the brown button beside it: whatever stands on the button looses what the snare holds, the beast as well.

###########
#P..#....E#
#..&..#.#.#
#..-..#.#.#
#.....#...#
#M...#....#
######....#
###########
` },
  { id: 'ch5-4', text: `title: The Frozen Snare
intro: Ice runs through the middle halls; skates and a block lie in the west. A snare waits in the south, and the brown button by the ice looses it: lead the beast in, then keep off that button.

############
#P.....#..*#
#......#.M##
#.-==.==...#
#O.###.=...#
#k...#.=####
#....#.=#.##
#.##......##
#..#.&.....#
#*.#....#|E#
############
` },
  { id: 'ch5-5', text: `title: The Drowned Snare
intro: A relic lies in the pool, two more beside it, and the flippers wait by the gate. One snare guards the south door: lead the beast into it. The brown button in the north looses it, so keep off it, and keep the block off it too.

############
#.P.#.-.#..#
#.O.##.....#
#...####..##
#..........#
#.##*~~.##.#
#.#~.~*~~#.#
#.#*~~...#.#
#.####.&####
#.M.....f|E#
############
` },
  { id: 'ch5-6', text: `title: The Snare at the Gate
intro: A snare lies before the gate, and its brown button sits far off in the northeast. Two relics and a block; lead the beast into the snare, and stay off that button.

############
#P......#.-#
#.##......##
#.#*...##..#
#.####..##.#
#.#.M##.#..#
#.....#....#
#..O...#...#
#....#.#...#
###.*#.&.|E#
############
` },
  { id: 'ch5-7', text: `title: The Loosing Stone
intro: A block, a red key and its door, two relics and one snare. The brown button by the beast's hall looses the snare: once he is held, keep off it.

############
#..#...#####
##......####
#P.O...&*#.#
#....#.#R..#
#...##....##
###r#..##.##
#*#.#M.....#
#.....##...#
###..###-.|E
############
` },
  { id: 'ch5-8', text: `title: The Snared Relic
intro: One relic hides in the northwest, and the only way to it runs through a snare. Push the block to the brown button in the south to open it; a second snare lies in the west hall, for the beast.

############
###...P....#
#.#..*...#.#
#&.....#...#
#.#.##.:.O.#
#.&.....#.##
#.###.#...##
#.#.;...#..#
#.#........#
#E|#M-.#:.##
############
` },
  { id: 'ch5-9', text: `title: The House of Erechtheus
intro: Fire burns across these halls, and boots lie in the west. Two snares, and one brown button in the east that looses the western snare. Off the quick way a page waits, and a memory of the man who laid them.
pages: ch5-kinsman

############
#...FF::..P#
#.;.....##.#
#.&h....p&.#
#.###...#:.#
#..:..#..#*#
##..FF.#.###
##;..#.:#-.#
##.........#
E|.M.#.;..*#
############
` },
  { id: 'ch5-10', text: `title: The Gate of the Labyrinth
intro: The snares end at the gate, and the beast waits by it. The way runs east, past a snare that the block, pushed onto the brown button, holds open; a second snare in the east room is for the beast. Off the quickest way, a page waits, and a memory of another telling.
pages: ch5-gate

#################
#.#..#####......#
#####.#..##.#.#.#
###*.##..##*..#.#
###..####.#####.#
##p.............#
###..##.##..#####
#..P#.....#.....#
#...#.....#.&.O.#
#.*.#....#....-.#
#####.#.#######&#
#######..#......#
#######...###M#.#
#####.#...#.#.#|#
##########.####E#
#################
` },
];

const cache = new Map<number, Level>();
/** Snare level `i` (0-based), parsed once. */
export function snareLevel(i: number): Level {
  let lv = cache.get(i);
  if (!lv) {
    lv = parse(SNARES[i]!.text);
    cache.set(i, lv);
  }
  return lv;
}
