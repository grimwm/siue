# Crete redesign: vision

The Island of Crete becomes a puzzle-chase: Chip's Challenge puzzles on a tile
grid, with a Minotaur that hunts by the rule of Robert Abbott's *Theseus and
the Minotaur*, and a story told across the levels. This document holds the
decisions that bind every part; each part has its own spec, plan and PRs.

## Decisions

| Topic | Decision |
|---|---|
| Levels | A hand-built campaign first; a seeded endless mode after it. |
| Time | Turn-based. Nothing moves until the player does; waiting is a move. |
| Minotaur | The Theseus rule: two steps per player step. Each step closes the horizontal gap if it can, else the vertical gap, else stays. It obeys tiles (no water, fire or closed doors; slides on ice, rides force floors; blocks wall it in). It never dies; trapping it is a puzzle tool. |
| Puzzle pieces | Relics that open the exit gate; coloured keys and doors (red, blue, yellow used up; green kept); water and flippers, fire and fire boots, ice and skates, force floors and suction boots; pushable blocks (a block in water makes dirt); buttons that toggle walls. Traps and clone machines are not in the first version. |
| Kept from today | Hint, answer route and play-through (driven by an exact solver); HP and safe zones; story pages and endings. Bash is removed. |
| Caught | The player loses HP and is thrown back to the last safe zone passed, or the start; the Minotaur stays. At 0 HP the try ends. Undo goes back one move at a time; restart begins the level again. The score is the move count. |
| Progress | The browser remembers the furthest level and best move count per level. Each level shows a 4-letter code that opens it on any device. No server. |
| Engine | A tile grid where each tile type is data with its rules; a pure step function (state, action) → state, so undo is a history of states; an exact breadth-first solver over states proves every campaign level winnable and drives the help tools. |

## Lore

The campaign tells the myth: Minos's Crete, Daedalus building the Labyrinth,
the tribute ships from Athens, Ariadne's thread. Late chapters reveal that the
Labyrinth is a game someone is still writing, which joins the myth to the
developer endings Crete has today (the Whitehead review, the PAX ending, the
`stefan-` seeds). The story reaches the player through:

- a chapter card before each chapter (about five levels) and at the end;
- optional story pages hidden in levels, often on the harder route, collected
  in a Lore book in the menu;
- one or two lines when each level opens;
- endings chosen by how many pages were found.

## Parts

1. **Shell** (`2026-10-16-crete-shell-design.md`): controls inside the game
   frame with key tabs, a Q menu and a title card, on today's game.
2. **Engine**: the tile rules, the Theseus Minotaur, HP and safe zones, undo,
   the solver, and the help tools rebuilt on the solver.
3. **Campaign**: the level format, about 20 levels each proven by the solver,
   level codes and saved progress, and the lore.
4. **Endless**: the seeded generator on the same engine, checked by the solver.
