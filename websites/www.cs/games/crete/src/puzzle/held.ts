/* The Island of Crete: harder layouts held back. These are Chapter 2's challenge levels as they first shipped,
 * before the chapter's climb was smoothed (src/puzzle/ways.ts holds what plays now). They are kept, unplayed, for a
 * later chapter or Endless; nothing in the game imports this file. Each still parses and is won by the solver
 * (test/held.test.ts). DOM-free. */

/** A held layout: its own id, the level it was (`was`), and its level text (src/puzzle/level.ts). */
export const HELD: readonly { id: string; was: string; text: string }[] = [
  { id: 'held-1', was: 'ch2-4', text: `title: The Currents
intro: Daedalus set currents running through these ways, and they carry the beast as they carry you. Draw him onto them and let them take him while you gather the relics; suction boots will hold you fast.

############
#P...>..>.##
#>#.:.#...##
#.##.^*:#*.#
#^....#....#
#.<:#^:Mu.##
#...:...#..#
##....#:.#.#
#*#......#.#
#.<.v.#.:..E
############
` },
  { id: 'held-2', was: 'ch2-5', text: `title: The Glassy Ways
intro: The floors are polished to ice, and the beast skids on them as you do. Loose stone does not slide: stop on it, where he cannot follow. Skates lie somewhere in the cold.

############
#P..#k.#..*#
#=...:.#=..#
#.:=....:.##
#..=##.=M#.#
#.==.*#=...#
#.:....=...#
#...#..===.#
#:..:.#..###
#.=*#..#.=.E
############
` },
  { id: 'held-3', was: 'ch2-6', text: `title: Water and Fire
intro: A river and a fire cross these ways, with loose stone between them. Flippers and fire boots both lie here, and you will need both; the beast will not wait while you find them.

############
#P:..~..#.*#
#...~.O.F:##
#.......F#:#
#f...##:...#
####.####M.#
#*##.....#.#
#.F..~h:~#.#
###.#.#:...#
#*.~#..F:.|E
############
` },
  { id: 'held-4', was: 'ch2-7', text: `title: The Three Locks
intro: Three doors and three keys, and not every key is worth its door. Each door you open is another road for the beast. Loose stone is a road for you alone.

############
#P..#....#*#
##..Rr#..#.#
#.#.#:.:...#
#r..#.:...##
#.....:M.#.#
#*#:#b#....#
##R:B...#..#
#..#..####.#
#:..#..*##.E
############
` },
  { id: 'held-5', was: 'ch2-8', text: `title: The Shifting Walls
intro: A plate here moves the walls, and the only road over the water is a block you sink yourself. Loose stone turns the blocks aside, and the beast with them.

############
#P..##...*##
#.....#....#
#.....~.##.#
##.....##:.#
#*.#._#:M..#
###..#:.:O.#
#:O....#~.T#
#::...#.T..#
#*.........E
############
` },
  { id: 'held-6', was: 'ch2-9', text: `title: The Bronze Mirror
intro: A bronze mirror lies past the beast, and Daedalus's cow beside him. Marked stones and loose ones both keep him off you; between them you will have to run. Off the quick way, a page waits, and a memory of Athens.
pages: ch2-lots

############
#:..#.p#z.*#
#P....#.:..#
#.#..#..:.##
##.#.#:#.#.#
#*#..S.M.c.#
#....#.###.#
#.x.:..S#:.#
##S#.####..#
#*...#....|E
############
` },
  { id: 'held-7', was: 'ch2-10', text: `title: The Inner Gate
intro: The winding ways end at the inner gate. Water guards it on one side and fire on the other: flippers take you through the one, fire boots through the other. The longest way round holds a page and a honey cake.
pages: ch2-black-sail

####################
#P...#.:.......p..x#
#.##::.##....##.:..#
#..r.:...#...#..:.##
#..##.:#...#..:##:.#
#*:##......#......##
#....#.#.#####.#.#.#
#....:.h.#.*M#.....#
###.#..#####.###~###
##..R#.......###~###
#.####.#..##.#..~.*#
#*..:..##.f...FF..|E
####################
` },
];
