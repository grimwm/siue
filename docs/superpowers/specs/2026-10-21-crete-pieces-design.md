# Crete's second set of pieces: traps and tricks

Part of the Crete redesign (`2026-10-16-crete-redesign-vision.md`). It comes
after the fast solver and before the editor (`2026-10-21-crete-editor-design.md`),
so the editor launches with every piece. Each piece is engine rules, solver
support, Blender art and a sound, like the first set
(`2026-10-17-crete-engine-design.md`).

## Why

Levels without a chase ("solo" levels) must still be hard, which needs Chip's
Challenge style traps and tricks; chase levels gain new ways to pin, lure and
dodge the Minotaur. The owner asked for all nine classics below.

## The pieces (owner-approved rules)

1. **Bear trap** (in the game: **Daedalus's snare**), with its brown button.
   Whoever steps in (Theseus, a block, the Minotaur, a moving hazard) is held
   there until something stands on a brown button linked to it; then it can
   leave. A held Minotaur is pinned. Waiting while held is a move.
2. **Pop-up wall.** Floor that becomes wall once Theseus steps off it: one pass
   only. Only Theseus raises it; the Minotaur, blocks and moving hazards cannot
   enter it.
3. **Fake wall and invisible wall.** A fake wall looks like wall but is floor:
   bumping it opens it. An invisible wall looks like floor but is wall:
   bumping it shows it. Unlike a normal bump, discovering either one costs a
   move. To the Minotaur and to moving hazards a fake wall is wall until
   opened and an invisible wall is always wall.
4. **Gravel.** Theseus crosses it; blocks, the Minotaur and moving hazards
   cannot.
5. **Teleport.** Entering one sends Theseus out of the next teleport in
   reading order (wrapping to the first), moving on in the same direction; if
   that exit is blocked, the next one is tried, and if every exit is blocked he
   stays where he entered. Blocks teleport the same way. To the Minotaur a
   teleport is wall.
6. **Thief.** Stepping on it takes all of Theseus's gear (flippers, fire boots,
   skates, suction boots). Keys and tools are kept.
7. **Bomb.** Whatever steps onto it is destroyed and the bomb is gone.
   Theseus loses a heart and is thrown back exactly as when caught. A block or
   a moving hazard is destroyed.
8. **Clone machine**, with its red button. Pressing the red button makes a
   copy of what the machine holds (a block or a moving hazard), pushed out in
   the direction the machine faces, if that cell is free. It never clones the
   Minotaur.
9. **Moving hazards**, which move one cell on their own every turn, after
   Theseus and before the Minotaur:
   - **Bronze ball** (rolling ball): goes straight; turns back when blocked.
   - **Harpy** (glider): turns left when blocked.
   - **Talos's fire** (fireball): turns right when blocked.
   Touching one, or one moving onto Theseus, costs a heart and throws him back
   as a catch does. Hazards obey tiles the way the Minotaur does (walls,
   closed doors, water and fire stop them, ice and force floors carry them,
   traps hold them, bombs destroy them, teleports are wall), with two
   exceptions: Talos's fire crosses fire and the harpy crosses water. The
   Minotaur and a hazard block each other: neither can enter the other's cell.

## Rules settled after review (Claude's calls)

These follow Chip's Challenge wherever it has a rule, and the vision's rule
that the Minotaur never dies.

- **Hazard movement.** A hazard that is blocked turns (ball: back; harpy:
  left; fire: right) and tries again in the same turn; if that is blocked too
  it tries the remaining directions in its turning order (fire: right, then
  left, then back; harpy: left, then right, then back; ball: back only), and
  stays put if all are blocked. On ice and force floors it slides like the
  Minotaur, several cells in one turn; a slide that is stopped ends the move
  without turning, and after a force floor it faces the way it was carried.
- **Buttons.** Theseus and blocks press brown and red buttons; moving hazards
  press them too; the Minotaur never presses a button (as today). The brown
  button is live: a trap holds whatever is in it while no linked button is
  occupied, and anything may walk through a trap whose button is held. The red
  button fires once each time something arrives on it.
- **The Minotaur and the new tiles.** He never dies and never loses anything:
  a bomb, a pop-up wall, gravel, a teleport and a clone machine are wall to
  him; a thief and both buttons are plain floor to him (he presses nothing);
  a bear trap holds him like anyone else.
- **Hazard contact.** Theseus moving into a hazard's cell, or a hazard moving
  into his, is a catch. The turn order stays fixed (Theseus, hazards in
  reading order, the Minotaur's two steps) and stops at the first catch of the
  turn, so at most one catch happens per turn. If a hazard stands on the
  throw-back cell it is sent back to its own start, like the Minotaur today.
  Theseus cannot push a block into a hazard's cell. Hazards do not enter cells
  holding a block, an object, the cow, the stone Minotaur or another hazard.
- **Hazard order.** When the hazard phase starts, the hazards are listed once
  in reading order of the cells they stand on then; that list is the order for
  the whole phase, so a hazard that moves keeps its place and a later hazard
  sees the cells earlier ones have already left. A hazard cloned during the
  phase joins the end of the list in the order the clones were made, and first
  moves in the next turn. Catches, button presses and clone firings all
  follow this order, and the engine, the reference solver and the fast solver
  use the same one.
- **Clone machines.** A machine holds the block or hazard placed on it in the
  level; it is a template that is never pushed off and is cloned each time its
  red button fires, the clone taking the machine's direction. "Free" means the
  target cell holds nothing that blocks that kind of figure; a cloned hazard
  never appears on Theseus. Machine cells are wall to everyone. Clones are
  bounded only by the free cells on the board.
- **Teleports.** A cell is a blocked exit if the arriving figure could not
  enter the cell beyond it. A pushed block with every exit blocked makes the
  push refused. Arriving out of a teleport is a full arrival on the cell
  beyond (items, bombs, thieves, buttons, safe zones, exit, ice and force
  floors all act). A level with a single teleport has no exit for it: it is
  wall.
- **Fake and invisible walls.** Only Theseus's own bump discovers them (one
  move). A pushed block, a slide or carry, and a teleport exit treat a fake
  wall as wall and an invisible wall as wall, and reveal nothing.
- **Medusa's mirror and hazards.** Hazards keep moving while the Minotaur is
  stone, and treat the stone Minotaur as a wall, as everyone does.
- **Pop-up walls** rise when Theseus leaves the cell by any means: a step, a
  slide or carry passing through, being thrown back, or a teleport.

## Look and sound

Blender-rendered tiles and sprites with short animations, through the same
pipeline as the board (`crete/fx/`), and a sound for each on Crete's synth.
The myth names above appear in the game, the help text and the editor
palette; the plain names stay in code.

## Engine and solver

- The pieces join the tile data (`src/puzzle/tiles.ts`) and the level text
  format, each with a legend character, and the pure step function
  (`src/puzzle/step.ts`). Links between buttons and the traps or clone
  machines they control follow Chip's Challenge's reading-order rule unless
  the builder finds a clearer one (the level text must state the links
  unambiguously and round-trip).
- Everything that can change (held figures, raised pop-up walls, opened fake
  walls, shown invisible walls, spent bombs, hazard positions and directions,
  clones) becomes part of the solver's situation, packed compactly by the
  fast solver. Moving hazards and clone machines grow the search the most; the
  same-answers and pruning tests cover every piece, among them hazards whose
  order decides a catch, a button press or a clone's cell, and clones made in
  the same turn.
- Turn order is fixed and documented: Theseus's action, then moving hazards in
  reading order, then the Minotaur's two steps.
- The help text and Chapter 1's levels are unaffected; no existing level uses
  the new pieces.

## How it is checked

- Unit tests for each piece's rule, including every interaction named above
  (Minotaur in a trap, hazard on a bomb, block through a teleport, thief and
  keys, clone into a blocked cell).
- The level text round-trips with every piece.
- Solver tests on small levels built around each piece.
- The tiles test page and the atlas test cover the new sprites.

## Left to the builder

Legend characters, the link rule's exact form, art and animation details,
sound design, and how the solver packs the new state.
