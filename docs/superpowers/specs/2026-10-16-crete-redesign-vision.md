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
| Puzzle pieces | Relics that open the exit gate; coloured keys and doors (red, blue, yellow used up; green kept); water and flippers, fire and fire boots, ice and skates, force floors and suction boots; pushable blocks (a block in water makes dirt); buttons that toggle walls. A second set follows the fast solver: bear traps, teleports, thieves, pop-up walls, fake and invisible walls, bombs, clone machines, moving hazards and gravel (`2026-10-21-crete-pieces-design.md`). |
| Kept from today | The help tools under myth names, driven by an exact solver: a tug on Ariadne's thread (H, one step), Ariadne's thread (V, the whole route drawn as a red thread), follow the thread (T, the solver plays). HP and safe zones; story pages and endings. Bash is removed. |
| Help cost | A campaign level cleared with any help tool counts as cleared, but is marked assisted and records no best score until cleared unaided. Story pages taken in a helped win still count. |
| Tools | Fuses and barriers fold into keys and doors. Medusa's mirror (Z): the Minotaur sees its reflection and turns to stone for 3 of the player's turns, blocking its tile like a wall. Honey cake (X): a temple offering that restores a fixed amount of HP. Daedalus's cow (C): the wooden cow built for Pasiphaë, placed on a tile; the Minotaur goes to it instead of the player until it arrives. |
| Board | Most levels fit the screen (up to about 15 × 15); some late levels are larger and the view follows the player. |
| Look | Drawn tiles (stone, water, fire, ice, force floors, doors, blocks), with the hero and the Minotaur as sprites, replacing the emoji grid. |
| Audio | Tile effects (splash, sizzle, door, push) on Crete's synth, and a short looping theme per chapter on the kit's music voices, with a Music toggle. |
| Campaign | 100 levels in 10 chapters of 10, released chapter by chapter; the ending lands with the last chapter. Roughly one new tile or mechanic per chapter; the meta reveal in the last two chapters. |
| Editor | A public level editor page, desktop first, boards up to 64 × 64. A level is shared only as a link (no server, no public list); shared levels carry a generated name and the author's initials, never typed text. Campaign levels are made in it and exported to the repo. The solver must prove a level winnable and clear the shared-level difficulty bar before it can be shared; levels are labelled chase (the Minotaur can catch Theseus) or solo (no Minotaur, or one that can never reach him). See `2026-10-21-crete-editor-design.md`. |
| Today's chase | Replaced. Endless mode (part 4) is its successor, and old `?seed=` links open endless mode on that seed. |
| Writing | Claude drafts the chapter cards, level intros, pages and endings in a lore file; the owner edits it in its own PR before levels ship. |
| Caught | The player loses HP and is thrown back to the last safe zone passed, or the start; the Minotaur stays. At 0 HP the try ends. Undo goes back one move at a time; restart begins the level again. The score is the move count; undone moves do not count. Relics and pages are tracked apart from it. |
| Progress | Every level is open from the start. The browser remembers each level's clear and best move count, and the story pages found. No level codes and no server. |
| Engine | A tile grid where each tile type is data with its rules; a pure step function (state, action) → state, so undo is a history of states; an exact breadth-first solver over states proves every campaign level winnable and drives the help tools. |

## Lore

The campaign tells the myth: Minos's Crete, Daedalus building the Labyrinth,
the tribute ships from Athens, Ariadne's thread. Late chapters reveal that the
Labyrinth is a game someone is still writing, which joins the myth to the
developer endings Crete has today (the Whitehead review, the PAX ending, the
`stefan-` seeds). The story reaches the player through:

- a chapter card before each chapter and after its last level;
- optional story pages hidden in levels, often on the harder route, collected
  in a Lore book in the menu;
- one or two lines when each level opens;
- endings chosen by how many pages were found.

**Real quotes.** Chapter cards, level intros and pages quote the ancient
sources where they fit, word for word from public-domain English
translations, each with its citation (author, work, book or section,
translator, year):

- Plutarch, *Life of Theseus* (Bernadotte Perrin, 1914);
- Ovid, *Metamorphoses* Book 8 (Brookes More, 1922);
- Apollodorus, *The Library* (J. G. Frazer, 1921);
- Catullus, poem 64, Ariadne on Naxos (public-domain translations);
- Nathaniel Hawthorne, *Tanglewood Tales*, "The Minotaur" (1853).

Our own text joins the quotes, and the meta chapters are ours alone. Only
translations in the public domain are quoted; a modern translation is
paraphrased, never quoted. The lore file keeps each quote's source beside it,
and the Lore book shows it.

## Parts

1. **Shell** (`2026-10-16-crete-shell-design.md`): controls inside the game
   frame with key tabs, a Q menu and a title card, on today's game.
2. **Engine**: the tile rules, the drawn tiles, the Theseus Minotaur, HP and
   safe zones, the three tools, undo, the solver, and the help tools rebuilt
   on the solver.
3. **Chapter 1** (`2026-10-19-crete-chapter-1-design.md`): the trials
   become chapter 1 with two new levels, chapter cards, the level list,
   story pages, the Lore book and scrolling boards.
4. **Fast solver and editor** (`2026-10-21-crete-editor-design.md`): A\*
   search with pruning in a background worker, then the editor page, share
   links and campaign export.
5. **Chapters 2 to 10**, each its own PR, with chapter music once the music
   pipeline exists.
6. **Endless**: the seeded generator on the same engine, checked by the solver.
