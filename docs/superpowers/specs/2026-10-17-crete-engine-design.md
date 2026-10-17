# Crete engine: tile puzzles, the Theseus Minotaur, and eight trials

Part 2 of the Crete redesign (`2026-10-16-crete-redesign-vision.md`). It
replaces today's seeded chase with the puzzle engine, renders the board from
Blender, and ships eight hand-made trial levels that teach every piece.

## Goal

A player opens Crete and plays puzzle levels: collect the relics, open the
gate, reach the exit, while a Minotaur that moves by a fixed rule hunts them
through keys and doors, water and fire, ice and force floors, blocks and
buttons. Every move can be undone. An exact solver proves every level
winnable and drives Ariadne's thread.

## What players get

- **Eight trials**, picked from the title card, each teaching one idea:
  1. Walls and the Minotaur's rule (lure it behind a wall).
  2. Relics and the exit gate.
  3. Keys and doors.
  4. Water and flippers, fire and fire boots.
  5. Ice and skates, force floors and suction boots.
  6. Blocks and buttons.
  7. The three tools and safe zones.
  8. A finale that combines them.
- Each trial opens with a one- or two-line intro. Trial progress (cleared,
  assisted, best moves) is kept in this browser.
- **Today's seeded chase is removed**: `engine.ts`, `grid.ts`, `bots.ts`,
  their tests and the nightly maze sweep. A `?seed=` link opens trial 1.

## Rules

A level is a grid of cells. Each cell has terrain and at most one object.

**Terrain:** floor, wall, exit, exit gate (open once every relic is taken),
water, fire, ice, force floor (one of four directions), dirt (water filled by
a block; floor in every way), safe zone, button, toggle wall (open or
closed), and coloured doors (red, blue, yellow, green).

**Objects:** relic, key (red, blue, yellow, green), gear (flippers, fire
boots, skates, suction boots), tool (Medusa's mirror, honey cake, Daedalus's
cow), story page, block.

**A turn** is one player action, then the Minotaur's two steps.

- **Actions:** move in one of four directions, wait, undo, restart, or use a
  tool. Bumping a wall, a closed door without its key, a block that cannot
  move, the gate before it opens, or water or fire without its gear does
  nothing and costs no turn.
- **Moving:** a coloured door opens with a key of its colour (red, blue and
  yellow keys are used up; a green key is kept) and stays open. Walking onto
  an object takes it; a block is pushed one cell instead, and it can go onto
  floor, dirt, water (it sinks and the cell becomes dirt), ice (it slides on
  until it leaves the ice) or a force floor (it is carried until it leaves).
  Stepping onto ice without skates slides you on in the same direction until
  you leave the ice or hit something. Stepping onto a force floor without
  suction boots carries you along the chain, the same turn. Stepping onto a
  button, by you or a pushed block, flips every toggle wall. Reaching the exit
  with the gate open wins.
- **The Minotaur** takes two steps toward its target: the player, or the cow
  while one stands. Each step moves one cell along the horizontal gap if that
  cell is open to it, else along the vertical gap, else it stays. Open to it:
  floor, dirt, ice (it slides), force floors (it is carried), open doors,
  open toggle walls and buttons (it does not press them). Closed to it:
  walls, blocks, closed doors and toggle walls, water, fire, safe zones, the
  exit and the gate. It never picks anything up and never dies. When it
  reaches the cow, the cow is gone.
- **Caught:** if the Minotaur enters the player's cell on either step, the
  player loses one heart and is thrown back to the last safe zone they stood
  on, or the start; the Minotaur stays where it is. At zero hearts the try
  ends: undo or restart.
- **Hearts:** shown as a heart with a number. Each level sets its starting
  hearts (3 unless it says otherwise); a honey cake gives one back, up to the
  level's start.
- **Tools:** Medusa's mirror (Z) turns the Minotaur to stone for its next 3
  turns, and while stone it is a wall to everyone. Honey cake (X) gives one
  heart. Daedalus's cow (C) is set on the player's cell and becomes the
  Minotaur's target until it reaches it.
- **Undo** steps back one turn, as far as the start; restart returns to the
  start. **Score** is the move count of the winning line; undone moves do not
  count.

## Engine

All DOM-free, in `crete/src/puzzle/`, compiled by Crete's DOM-free program.

- `tiles.ts`: the terrain and object kinds as data: what blocks whom, what
  slides, what carries, and each kind's sprite name.
- `level.ts`: the level format. A level is text: a header of `key: value`
  lines (`title`, `intro`, `hearts`, `relics` when not every relic is
  needed), then the grid, one character per cell, with a legend shared by
  every level. `parse` reports a bad level by line and column; `serialize`
  writes it back exactly. Part 3's editor writes this format.
- `state.ts`: the state of a try, immutable: the grid, the player (cell,
  hearts, keys, gear, tools, pages, last safe zone), the Minotaur (cell,
  stone turns), the cow, relics left, moves, and the outcome.
- `step.ts`: `step(state, action) → { state, events }`. Events (moved, slid,
  pushed, opened, took, sank, flipped, caught, stoned, won, lost) feed the
  log, the sounds and the animation. Undo is the list of earlier states.
- `minotaur.ts`: its two steps by the rule above, alone and testable.
- `solver.ts`: breadth-first search over states (a compact key per state),
  capped at 2 million states. It returns the shortest winning line or
  "unsolved". The thread uses it from the current state: one step (H), the
  whole line drawn as a red thread (V), or playing it out (T). Any use marks
  the try assisted.

## Board and art

- **Blender:** `crete/art/blender/render_tiles.py` builds every scene in
  code (no outside assets), renders with Cycles or EEVEE, and writes a sprite
  atlas and `tiles.json`, as Tankity's `render_fx.py` does; the `.blend` files
  are committed through Git LFS.
- **Look:** painted and realistic, seen from a three-quarter top-down camera:
  limestone floors and walls with a front face, bronze doors, sea-blue water,
  fire, ice, force floors with moving arrows, a Theseus and a Minotaur that
  read as figures. To stay readable at 14 to 24 px a cell, the figures get a
  rim light and an outline, the terrain keeps strong value contrast, and every
  object has a silhouette test at 16 px.
- **Loops:** water, fire, force floors and the Minotaur's breathing loop; the
  stone Minotaur is its own sprite.
- **Drawing:** a canvas renderer draws by rows, back to front, so a wall's
  front face overlaps the cell above it. Each move slides one cell in about
  120 ms; the Minotaur's two steps play one after the other. A key press
  during a slide finishes it and acts at once. Reduced motion snaps.

## Interface

The shell from part 1 stays; its contents change.

- **Status bar:** the trial's name, hearts, relics left, keys, gear, moves,
  and Menu.
- **Strip:** the move pad, Wait (.), Undo (U), Restart (R), the thread (H, V,
  T), and the three tools with their counts. Bash is gone.
- **Title card:** Play opens the trial list (each with cleared, assisted and
  best moves); Story and Settings as today.
- **Sounds:** step, push, splash, sizzle, door, key, relic, gate, button,
  slide, caught, stone, win, on Crete's synth.

## Tests

- Unit: each rule in `step.ts` with a small grid; the Minotaur's rule on the
  classic Theseus cases; the level parser's errors and its round trip; undo;
  hearts and throw-back; the solver on small levels with known answers.
- Every trial: it parses, the solver solves it within the cap, and its
  shortest line is recorded so a rule change that alters it fails a test.
- Art: `tiles.json` names every sprite a kind uses, and the build checks the
  atlas exists.
- Browser: `crete-play.spec.ts` wins trial 1 through the strip, uses undo,
  and gets caught once; `crete-layout.spec.ts` keeps passing on ten screens.

## Delivery

Three PRs, each green on its own:

1. **Engine:** `src/puzzle/` and its tests; nothing on the page changes.
2. **Art:** the Blender script, the atlas and the canvas renderer, shown on a
   test page.
3. **Game:** the trials, the interface, the removal of the old chase, and the
   browser specs.

## Out of scope

The editor, level codes, the campaign and its lore, chapter music, endless
mode; traps and clone machines.
