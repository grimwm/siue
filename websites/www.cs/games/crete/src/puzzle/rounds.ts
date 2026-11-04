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
  { id: 'ch7-4', text: `title: The Frozen Round
intro: Ice runs across the north hall, with skates above it. A snare waits in the west by a block, and the brown button in the south looses it; one bronze ball rolls along the south hall. Two relics.
facing: right

############
####P###.###
##...###..##
#..=====.###
##.#&...*.##
##..O#.....#
###...##...#
##M..o.....#
##.*#......#
####...-.|E#
############
` },
  { id: 'ch7-5', text: `title: The Sunken Round
intro: Three teleports, each sending you out of the next along, counting left to right and top to bottom. Pools lie in the northeast and the southwest, with flippers between; a block waits in the southeast, and one bronze ball rolls along the middle hall. Two relics.
facing: right

############
#P#@.#...*##
#....#..~~##
#....#*.~~##
#..###.#####
##..o.M...##
#..f......##
#~~.......##
#.~....#O@##
#E|#...@####
############
` },
  { id: 'ch7-6', text: `title: The Burning Round
intro: Three teleports, each sending you out of the next along. Fire burns in the middle hall, with boots above it; the button in the south opens the toggle wall below the fire, and shuts it again. Two relics, and one bronze ball in the south.
facing: left

############
#P###...####
#.........##
#.........##
#..#h#....##
#..@..FF.@*#
###*#..T####
##..#....###
#.o.._...###
#@M.###..|E#
############
` },
  { id: 'ch7-7', text: `title: The Icy Round
intro: Ice runs down the middle, a current drives west below the east room, and pop-up walls rise behind you once you leave them. Two relics, and one bronze ball in the south, where the ice will carry it.
facing: down

############
#......#####
#P.....#####
#.....######
#....=..*..#
#...;=.....#
##..;=#<<<.#
####...#...#
###......M##
###.*o..#|E#
############
` },
  { id: 'ch7-8', text: `title: The Driven Round
intro: Currents run through these ways, and gravel lies about them: you can cross it, but the beast and the ball cannot. Suction boots in the middle let you walk the currents as you please. Three relics, and one bronze ball in the southeast.
facing: up

############
#..>.>>v####
#.P....v.###
#....#uv:..#
#..>#<.:...#
#.<.<...*..#
#.....:^#.##
#..<#M.^*..#
#.#....^.o.#
#.*..#.^.|E#
############
` },
  { id: 'ch7-9', text: `title: The Mirrored Round
intro: Fire burns down the west halls, with boots beside it, and pop-up walls rise behind you once you leave them. Medusa's mirror lies in the east and a honey cake by the fire; two relics, and one bronze ball in the south. Off the quick way a page waits, and a memory of the man of bronze.
pages: ch7-brazen
facing: down

############
#P.#..##;###
#.##.....###
#..#.F#.p#.#
#h.;.F#...*#
#...xF.....#
#...F....z.#
##.##..#.#;#
#......o...#
#*.....M.|E#
#..#.#.#...#
############
` },
  { id: 'ch7-10', text: `title: The Last Round
intro: The rounds end at the gate. Three teleports, each sending you out of the next along; fire and the boots for it; the toggle wall and its button; and a red key in the west for the door to the last relic, in the southeast. Three relics, and one bronze ball in the north hall. Off the quickest way a page waits, and a memory of how the bronze guard fell.
pages: ch7-vein
facing: up

################
#P...o#........#
#.....#........#
#.#...@...###.p#
#...###...###..#
#...#h....FF...#
#...#*#....#.#.#
#..T._......@..#
#..#.##......###
#...r#...M...#*#
#.@###.FF*..R..#
#E|######...####
################
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
