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
  { id: 'ch10-2', text: `title: The Mirror and the Fire
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
  { id: 'ch10-5', text: `title: Talos's Round
intro: A fire room lies west of your start, with the fire boots below it and Medusa's mirror beyond. Talos's fire runs the northwest. Two relics.
facing: down

############
#..#FFF#...#
##z.FFFP...#
#e.#FFF#...#
##.#######.#
#......#...#
##h#......*#
#..#...#...#
#..###.#####
#..#M......#
#....*.....#
####E#######
` },
  { id: 'ch10-6', text: `title: The Robbed Ice
intro: Ice runs down the north, with the skates below it, and a thief waits beside your start. A snare holds the doorway to the west room; the brown button by the ice looses it. A block waits by the thief. Two relics.

############
#*#..#.#.#=#
#......##..#
##.==.##M#-#
##..k===*#.#
###.#..##..#
#...#=.#=..#
##..#P.#..##
##&#.$.#...E
#...#.O....#
#.#...#....#
############
` },
  { id: 'ch10-7', text: `title: The Powder Fold
intro: Two teleports, one sending you out of the other. A bomb waits by the way out in the west, and a block in the southeast. Three relics.

############
#..........#
##.M....##*#
#####...####
#P.##....#.#
#..*.......#
##.##.####@#
#@..#...#..#
#...##...*.#
E!.......O.#
###.....#..#
############
` },
  { id: 'ch10-8', text: `title: The Rising Wings
intro: Currents run down the northwest room, with the suction boots below them, and a thief waits in the west doorway. One Harpy flies the middle room, and a pop-up wall stands beside your start. Three relics.
facing: left

############
#>>.....##.#
#>>###..#*.#
#>>........#
#.u##.####.#
#..#...M...#
#..#.w.##..#
#*$##.##.###
#..#.*..;P.#
#..#....#..#
#.......#..#
#######E####
` },
  { id: 'ch10-9', text: `title: The Last Part
intro: The wooden cow lies by your start, and a snare holds the west doorway, loosed by the brown button in the north. The red button beside it wakes the clone machine in the south, which makes blocks. Three relics. Off the quick way a page waits, and a memory of how the old book ends the story.
pages: ch10-last-part
machines: block-up

############
#..*..+.M..#
#...#..-...#
#&####.#.###
#......#..*#
#...#p.#*..#
#..##......#
#...####C#.#
#.....c...P#
E...#......#
#...#......#
############
` },
  { id: 'ch10-10', text: `title: The Open Space
intro: The beast waits in the southeast room. Medusa's mirror lies by your start, the wooden cow in the northwest room, and a snare in the middle hall, loosed by the brown button beside the cow. Three relics, and the way out is through the gate in the north. Off the quick way a page waits, and a memory of how the poet ends the story.
pages: ch10-oak

#################
#....p#...#.E...#
#...........|#..#
#.##.######..##.#
#.c#..#*.....#..#
#..#-.#...#..#*.#
#..######.#.##..#
#...............#
##.#..###.#.#####
#.....#.....&#..#
#z..P.#...#*..M.#
##.####...#..#..#
#..#......#..#..#
#..#......#..#..#
#################
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
