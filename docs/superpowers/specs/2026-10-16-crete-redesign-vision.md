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
| Kept from today | The help tools under myth names, driven by an exact solver: a tug on Ariadne's thread (H, one step), Ariadne's thread (V, the whole route drawn as a red thread), follow the thread (T, the solver plays). HP and safe zones; story pages and endings. Bash is removed. |
| Help cost | A campaign level cleared with any help tool counts as cleared and unlocks the next, but is marked assisted and records no best score until cleared unaided. |
| Tools | Fuses and barriers fold into keys and doors. Medusa's mirror (Z): the Minotaur sees its reflection and turns to stone for 3 of the player's turns, blocking its tile like a wall. Honey cake (X): a temple offering that restores a fixed amount of HP. Daedalus's cow (C): the wooden cow built for Pasiphaë, placed on a tile; the Minotaur goes to it instead of the player until it arrives. |
| Board | Most levels fit the screen (up to about 15 × 15); some late levels are larger and the view follows the player. |
| Look | Drawn tiles (stone, water, fire, ice, force floors, doors, blocks), with the hero and the Minotaur as sprites, replacing the emoji grid. |
| Audio | Tile effects (splash, sizzle, door, push) on Crete's synth, and a short looping theme per chapter on the kit's music voices, with a Music toggle. |
| Campaign | 100 levels in 10 chapters of 10, released chapter by chapter; the ending lands with the last chapter. Roughly one new tile or mechanic per chapter; the meta reveal in the last two chapters. |
| Editor | A public level editor page. A level saves as a compact string that is shared as a link (no server). Campaign levels are made in it and exported to the repo. The solver must prove a level winnable before it can be shared or exported. |
| Today's chase | Replaced. Endless mode (part 4) is its successor, and old `?seed=` links open endless mode on that seed. |
| Writing | Claude drafts the chapter cards, level intros, pages and endings in a lore file; the owner edits it in its own PR before levels ship. |
| Caught | The player loses HP and is thrown back to the last safe zone passed, or the start; the Minotaur stays. At 0 HP the try ends. Undo goes back one move at a time; restart begins the level again. The score is the move count; undone moves do not count. Relics and pages are tracked apart from it. |
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
2. **Engine**: the tile rules, the drawn tiles, the Theseus Minotaur, HP and
   safe zones, the three tools, undo, the solver, and the help tools rebuilt
   on the solver.
3. **Editor**: the level format, the editor page, share links, export, and
   the solver gate.
4. **Campaign**: chapter 1 (10 levels) with level codes, saved progress, the
   lore file and chapter music; chapters 2 to 10 follow as their own PRs.
5. **Endless**: the seeded generator on the same engine, checked by the solver.
