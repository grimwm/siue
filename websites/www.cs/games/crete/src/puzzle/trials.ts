/* The Island of Crete: the eight trials, in the level text (src/puzzle/level.ts).
 * Each teaches one idea; the solver proves each winnable (test/puzzle-trials.test.ts).
 * DOM-free. */
import { parse } from './level.ts';
import type { Level } from './level.ts';

export const TRIALS: readonly { id: string; text: string }[] = [
  { id: 'trial-1', text: `title: The Mouth of the Labyrinth
intro: Ariadne's thread is in your hand, Theseus. The beast runs two steps to your one: do not run at him, let the walls hold him.

#######
#...E.#
#M..#.#
#.#...#
##....#
#P.##.#
#######
` },
  { id: 'trial-2', text: `title: The Tribute Relics
intro: Two relics lie in the dark, and the gate of Minos opens for nothing less. The beast keeps watch over the far one: draw him away.

#########
#P.....*#
##....#M#
#.*#.#..#
#.#....##
#.....|E#
#########
` },
  { id: 'trial-3', text: `title: The Doors of Daedalus
intro: Daedalus hung doors of every colour. A red or blue key is spent in its lock; the green key is never used up.

#########
#..M#.Rb#
#.#.#.###
##g.G...#
###.##.##
##r.#..##
#.#.G..##
#P..#.BE#
#########
` },
  { id: 'trial-4', text: `title: The River and the Flame
intro: The Naiads lend flippers for the water and Hephaestus lends boots for the fire. The beast prowls the shore between.

##########
#.#~...FE#
###~...F##
#f.~...F##
##.~#.hF##
#..~#M#F##
#P.~#..F##
###~...F##
##########
` },
  { id: 'trial-5', text: `title: The Slippery Halls
intro: Daedalus polished these halls to glass and set currents in the stones. Skates hold the ice; suction boots hold the current.

############
#P.#k======#
##.#.##.####
##...##u<<E#
#.##.#######
#....#######
###..#######
#..M.#######
############
` },
  { id: 'trial-6', text: `title: The Sinking Stones
intro: Roll a stone into the deep and the water becomes a road. Tread the plate and the walls of Daedalus change places.

###########
#.M..#._..#
#.#..#..#.#
##PO.~.#..#
##...#....#
#....#...##
#....#.#T##
#######.E##
###########
` },
  { id: 'trial-7', text: `title: The Gifts of Ariadne
intro: Ariadne left you gifts: Medusa's mirror, Daedalus's cow and a honey cake. Stone the beast to pass him, set the cow where the walls will pin him, and keep the cake as a spare heart.

#########
#..E..M.#
##.....##
#P##.##c#
#x......#
##S.z#..#
####..S.#
#########
` },
  { id: 'trial-8', text: `title: The Heart of the Labyrinth
intro: Here Minos hid his last riddle: a locked door, a block to sink in the pool, a flood to swim, and the beast between. Pass it, and Athens owes no more tribute.

############
#P..#.M.~.##
###.#...~..#
#.r.##..~..#
#.#.R...~..#
#.#.###.~..#
#.z##..O~..#
#...#..~~..#
#...#.~f~.E#
############
` },
];

const cache = new Map<number, Level>();
/** Trial `i` (0-based), parsed once. */
export function trialLevel(i: number): Level {
  let lv = cache.get(i);
  if (!lv) {
    lv = parse(TRIALS[i]!.text);
    cache.set(i, lv);
  }
  return lv;
}
