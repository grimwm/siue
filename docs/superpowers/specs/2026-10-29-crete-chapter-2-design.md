# Crete Chapter 2: the Winding Ways

Part of the Crete redesign (`2026-10-16-crete-redesign-vision.md`). Chapter 1
(`2026-10-19-crete-chapter-1-design.md`) is live: the outer halls, ending with
Theseus at the sealed gate of the true Labyrinth, holding Ariadne's thread.
The chapter frame (cards, level list, story pages, Lore book), the nine new
pieces (`2026-10-21-crete-pieces-design.md`) and the level editor
(`2026-10-21-crete-editor-design.md`) are live.

## Decided by the owner

- **Follow the real story.** The owner left the story beat and the levels to
  Claude ("you pick; generally, we want to follow the real story").
- **One new idea per chapter, simplest first.** Chapter 2 brings in **gravel**
  and nothing else new. The approved pace:

  | Chapter | New |
  |---|---|
  | 2 | Gravel |
  | 3 | Pop-up wall |
  | 4 | Fake and invisible walls |
  | 5 | Daedalus's snare and button |
  | 6 | Teleport |
  | 7 | Bronze ball |
  | 8 | Harpy and Talos's fire |
  | 9 | Thief, bomb, clone machine |
  | 10 | Nothing new |

  Pieces not yet introduced never appear in an earlier chapter.
- **Every level is winnable and hard enough:**
  - every challenge level passes the challenge bar (`src/puzzle/difficulty.ts`);
  - a winnable but easy level is refused;
  - L9 of Chapter 1 was too easy, and that must not happen again.
- **Claude drafts the text, and the owner reads it before the chapter ships**
  (vision, Writing).

## The story (Claude's call, from the myth)

The chapter is the true Labyrinth's first ring, beyond the sealed gate. The
myth reaches the player as Theseus's memory of how he came to be there:
- **Athens' tribute.** Every nine years (Plutarch), seven youths and seven
  maidens are sent by lot to Crete.
- **Theseus offers himself.**
- **Aegeus's sails.** The ship sails under a black sail. Aegeus gives the
  pilot a white one, to hoist if Theseus comes home alive.

This is Plutarch, *Life of Theseus* 15–17. The memory of Crete itself (Minos,
Ariadne's gift, the thread) is Chapter 3's.

- **Name:** "The Winding Ways".
- **Gravel in the fiction:** Daedalus's loose stone, which a man can cross but
  a beast's hooves, a pushed block or a rolling thing cannot. The rules are
  unchanged from the pieces design: Theseus crosses gravel; blocks, the
  Minotaur and moving hazards cannot.
- **The opening card:**
  - a short paragraph in the myth's voice (the gate opens on narrower, winding
    passages, the floors strewn with loose stone, and Theseus remembers the
    lots in Athens);
  - one quotation.
- **Two story pages**, one in level 9 and one in level 10, as in Chapter 1:
  - **"The Lots":** the tribute drawn by lot, and Theseus offering himself;
  - **"The Black Sail":** Aegeus's order about the white sail.
- **The closing card:** Theseus reaches the inner gate, and the thread runs
  deeper. A line names Chapter 3 ("not yet released") without a date.
- **One or two lines when each level opens,** as Chapter 1's.
- **Quotations** are word for word from a public-domain translation, with
  their citation (author, work, section, translator, year). For Plutarch that
  is Bernadotte Perrin's 1914 Loeb translation, checked against a published
  copy of that text (Perseus or LacusCurtius). Never paraphrase inside
  quotation marks, and never quote a modern translation. Where no
  public-domain wording fits, use our own words without quotation marks.

## The levels

Ten levels with the ids `ch2-1` to `ch2-10`, in the campaign's level format
(the editor's level text). They are authored and checked with the editor's
own solver and difficulty measure, then exported to the repository like
Chapter 1's.

- **Teaching levels: 1 to 3.** Each teaches one thing about gravel:
  1. Gravel alone: Theseus crosses it, and a shorter path over gravel is
     the way.
  2. Gravel against the Minotaur: the beast cannot follow across it, so gravel
     is a refuge and a shortcut it lacks.
  3. Gravel against a block: a block will not cross it, so where a block can
     be pushed is limited.
- **Challenge levels: 4 to 10.** Each mixes gravel with Chapter 1's pieces
  (keys and doors, gear, water and fire, ice and force floors, dirt, blocks
  and buttons, tools, safe zones and catches). Each must pass the challenge
  bar.
  - Level 10 is the capstone: larger than the screen, more than one route,
    and it ends at the inner gate.
  - Levels 9 and 10 hold the two pages, each on the harder route, as Chapter
    1's do.
- **Variety:** no two levels share a layout idea. Hearts and relics are as
  each level needs.
- **Each level's title and intro** follow the chapter's story beat.

## What changes in the game

- `src/campaign/chapters.ts`: Chapter 2 is released, with its name, its
  levels, `teaching: 3` and its lore.
- **`levelById` finds Chapter 2's levels** as well as the trials. Progress,
  the level list, the Lore book, the cards and Next level work across the
  chapter boundary. Next after Chapter 1's level 10 goes to Chapter 2's
  opening card.
- `src/campaign/chapter-2.ts`: the lore, in Chapter 1's shape.
- **Help** gains gravel's line where pieces are explained, if it is not there
  already.
- **No new piece, no rule change, no music change.** The chapter's music comes
  later.

## Tests and checks

- **Unit tests:**
  - every Chapter 2 level parses;
  - every level is winnable by the exact solver;
  - levels 4–10 pass `challengeProblems`;
  - levels 1–3 are winnable and each uses gravel;
  - no level uses a piece from a later chapter;
  - the two pages are in levels 9 and 10;
  - the chapter table lists ten levels;
  - progress keys stay stable for Chapter 1.
- **The browser specs that cover chapters** (`crete-chapter`, `crete-play`,
  `crete-layout`) pass, and cover moving into Chapter 2 from Chapter 1's
  closing card.
- **Before the chapter ships,** its text (card, intros, pages, closing card)
  goes to the owner to read, quoted in the pull request.

## Left to the builder

- Each level's layout, title and intro.
- The exact Plutarch passages, within the public-domain rule.
- How level text for Chapter 2 is stored (beside the trials or in its own
  file).
