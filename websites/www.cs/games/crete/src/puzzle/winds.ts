/* The Island of Crete: the winds, Chapter 8's levels, in the level text (src/puzzle/level.ts).
 * Ten levels that bring in the Harpy and Talos's fire. DOM-free. */
import { parse } from './level.ts';
import type { Level } from './level.ts';

export const WINDS: readonly { id: string; text: string }[] = [
  { id: 'ch8-1', text: `title: The Harpy
intro: One Harpy flies the halls ahead, straight on, and turns left at every wall that stops it. Touch it and it costs a heart: wait in the niche while it passes, and keep clear of the beast.
facing: right

############
#..##......#
#...#.####.#
#....#####.#
###.#P####.#
###.#.####.#
###w.......#
#.####...###
#..M......E#
############
` },
  { id: 'ch8-2', text: `title: Over the Water
intro: One Harpy flies up and down the pool in the north, where you cannot swim, and each time it crosses the button there the toggle wall opens or shuts. Go through while it is open, and let it shut on the beast behind you.
facing: left

############
#w~~~_~~~~##
####P#...###
#.##.##...##
#M.#..#...##
#......T...#
#....####..#
#########.E#
############
` },
  { id: 'ch8-3', text: `title: Talos's Fire
intro: Talos's fire runs up and down the burning hall, through the flames as if they were floor. The fire boots carry you over the flames, but not past it: cross when it has gone by.
facing: up

############
#h.P##.F####
#.#....F####
#.##...F####
#.###..e.###
#...##.F.M.#
##.....F...#
##.#..#F.#E#
############
` },
  { id: 'ch8-4', text: `title: The Storm Pool
intro: A pool fills the middle, with flippers by your start. One Harpy flies back and forth in the west, and the button in the north opens and shuts the toggle wall in the south.
facing: down

############
####._.....#
#..###....##
#.w.##~~~###
###.#~~.~~##
##...~.~~..#
#.Pf#.~~~..#
#...#..#..##
#..###.#####
#..T..M...E#
############
` },
  { id: 'ch8-5', text: `title: The Burning Court
intro: Fire rings the court in the middle, with boots in the west. Talos's fire runs the halls of the southwest, turning right at every wall.
facing: down

############
##......FF.#
##...##.P..#
#.........F#
##...F.F.###
#.#.....F.##
#.#.F.FFF.##
#.#..#.F.###
#h..e###F###
##..M.....E#
############
` },
  { id: 'ch8-6', text: `title: Harpies on the Ice
intro: Ice runs down the west and the middle, with skates by it. Two Harpies fly here, one in the northeast and one in the south. Two relics.
facing: right right

############
#P..==.*...#
###.==###..#
#.#.==.##w##
#..*...##..#
######...###
#...#..==###
#.###k.==M##
#..###..#..#
###.###w#.|E
############
` },
  { id: 'ch8-7', text: `title: The Frozen Line
intro: A line of ice runs down the middle, with skates beside it and a block in the north. Talos's fire runs the southwest, turning right at every wall.
facing: down

############
####...=O..#
#......=...#
##P....=...#
######.....#
####..k=..##
####...=..##
###....=..E#
#e.....=...#
#...M##.#.##
############
` },
  { id: 'ch8-8', text: `title: The Snared Wing
intro: Two teleports, one sending you out of the other; a snare in the north, loosed by the brown button below it; and one Harpy in the east. Two relics.
facing: right

############
#.P.#...#..#
#.#.#&..#..#
#.#.@.#...##
#....##.*###
#...-.....##
####..###..#
#*....M.##w#
#.##.@...#.#
#.........E#
############
` },
  { id: 'ch8-9', text: `title: The Crossing Winds
intro: Currents run along the north hall, with suction boots at their end, and gravel lies in the west: you can cross it, but the beast cannot. Fire burns in the east, and Talos's fire runs the halls beside it; one Harpy flies the southwest. Off the quick way a page waits, and a memory of whom the Harpies were named for.
pages: ch8-storm
facing: down left

############
#:.P..>>>.u#
#.######.#.#
#.#.##p.#..#
#.###..###F#
#..:##...F.#
#.#.#.##...#
#...#.F.e..#
#...wM..##.#
#...#..F..E#
############
` },
  { id: 'ch8-10', text: `title: The Last Wind
intro: The den ends at the gate in the east. Two Harpies ride the winds across both ways south, and Talos's fire runs a shaft of fire across the hall below them. The beast keeps the south. Three relics. Off the quickest way a page waits, and a memory of how the bronze guard fell.
pages: ch8-lead
facing: right left down

###############
#######p#######
#######.#####P#
##*...........#
####.#####.##.#
###w.~~#~~.w###
####.#####.####
#.....#e##....#
#.##.......##.#
#.##..#F#.###.#
#.#######...#.#
#*.....*...M#|E
###############
` },
];

const cache = new Map<number, Level>();
/** Wind level `i` (0-based), parsed once. */
export function windLevel(i: number): Level {
  let lv = cache.get(i);
  if (!lv) {
    lv = parse(WINDS[i]!.text);
    cache.set(i, lv);
  }
  return lv;
}
