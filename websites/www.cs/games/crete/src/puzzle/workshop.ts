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
  { id: 'ch9-4', text: `title: The Thief's Pool
intro: A pool fills the west, and the flippers lie by your start. A thief stands among the relics in the middle: step on it and the flippers are gone. Three relics, and the beast waits by the way out.

############
#..#.###...#
#........P.#
#.~#....#f.#
##..*~*.##.#
#.~....$*#.#
#..~~~.....#
##..##.###.#
##..#......#
###M#..#...#
#.#...##...#
####E#######
` },
  { id: 'ch9-5', text: `title: The Powder Store
intro: Two bombs guard the doorways, and a block waits in the north hall. The button in the middle opens and shuts the toggle wall to the west. Two relics.

############
###.#...P..#
#....!O....#
#.###...##.#
#*..#...##.#
#...T...#..#
##.##._....#
##..##.##.##
#.....M.#..#
E....!.....#
##..#*.....#
############
` },
  { id: 'ch9-6', text: `title: The Copying Bench
intro: The red button by your start makes the clone machine below it turn out a block. A snare waits in the north hall, loosed by the brown button in the southwest. Two relics.
machines: block-up

############
#.P..#.#...#
#.+........#
#.....&#...#
##C#.####*##
#......#...#
E..#.......#
#.####.##.##
#-.....#.M.#
#..#...#...#
#..#..*..###
############
` },
  { id: 'ch9-7', text: `title: Stolen Skates
intro: Ice fills the room in the northeast, with the skates and a block in the south. A thief waits in the ice room's doorway. Three relics.

############
#M....*#==##
##..##=...=#
##.....#==.#
#...###.=###
E...#*##.$=#
##..#.=...*#
##..#.#.O..#
#...#..#...#
#..P#.##k..#
##....#....#
############
` },
  { id: 'ch9-8', text: `title: The Bronze Copies
intro: The red button in the south wakes the clone machine in the east, which makes bronze balls. Two teleports, one sending you out of the other, and a bomb above the machine. Two relics.
machines: ball-up

############
#...#..#...#
#@..#..#...#
#...#..#.*.#
#.#.#*.#.!.#
#...#..#...#
#..P#.###..#
##.##.###.C#
##.....#@M.#
#...#.+....#
##..#..#...E
############
` },
  { id: 'ch9-9', text: `title: The Backward Tracks
intro: Water fills the northwest, and a thief waits in its doorway: step on it and it takes your flippers. Gravel lies by your start, one Harpy flies the south hall, and a block waits in the southeast. Two relics. Off the quick way a page waits, and a memory of the oldest thief's trick.
pages: ch9-tracks
facing: left

############
#~~~#.P:.*.#
#~~~#..#...#
#~~~$..#...#
##.##..#.###
#..*#......#
#...#f.....#
##.#######.#
#...#w.....#
#p.....#O..#
#.M.#..#...#
########E###
` },
  { id: 'ch9-10', text: `title: The Last Bench
intro: The workshop ends at the gate in the west. The red button in the middle wakes the clone machine in the southwest, one Harpy flies the west hall, and the beast waits in the northwest. Three relics. Off the quick way a page waits, and a memory of the man who built this place.
pages: ch9-inventor
facing: right
machines: block-right

###############
#Mp.#*..#.....#
#.......#..#..#
#...#...#.....#
#E|.#####.##..#
#.......#..#..#
#...#+.....#..#
#*w.#...#.....#
#####.#######.#
#...#.......*.#
#.C.#...#.....#
#.......#....P#
#...#...#....##
###############
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
