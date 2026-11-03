# Crete Chapter 10, "The Heart of the Labyrinth": Implementation Plan

**Goal:** release Chapter 10, the campaign's last. It has ten levels that bring in nothing new, its story cards and pages, the campaign's three endings, and the tests that gate it.

**Architecture:** the same shape as Chapters 2 to 9:
- `src/puzzle/heart.ts` holds the level text;
- `src/campaign/chapter-10.ts` holds the words, and the endings on its closing card;
- `src/campaign/chapters.ts` releases the chapter, and `levelById` finds its levels;
- `src/campaign/fewest.ts` holds the fewest moves per level.

The difficulty gate in `test/difficulty.test.ts` and the new-layouts check in `test/layouts.test.ts` loop over every released chapter, so they hold Chapter 10 without a change. One small addition reaches the UI: `Card` in `src/campaign/lore.ts` may hold `endings`, `endingFor` picks one by the story pages found, and `src/ui/chapter.tsx` shows it on the closing card under "The End", with the count of pages found (`src/ui.ts` passes the count from the Lore Book's store).

**Tech stack:** TypeScript, node:test, Playwright e2e.

**Spec:** `docs/superpowers/specs/2026-10-29-crete-chapter-2-design.md` sets the pace table (Chapter 10 brings nothing new) and the chapter pattern. `docs/superpowers/specs/2026-10-16-crete-redesign-vision.md` sets the story, the quotation rule, the meta reveal in the last two chapters ("the Labyrinth is a game someone is still writing", joined to the developer endings Crete had: the Whitehead review, the PAX ending), the endings chosen by how many pages were found, and that the meta chapters' words are ours alone.

## Rulings

These were open; Claude settled them without asking, per the roadmap's standing rule.

- **The name:** "The Heart of the Labyrinth". Chapter 9's closing card ends with the floor sloping down toward the middle of the maze and a breathing Theseus knows; Hawthorne has him find the Minotaur "at the very center of the labyrinth".
- **Nothing new, so the teaching levels recombine.** The pace table gives Chapter 10 no new piece. Its three teaching levels each join two earlier pieces in a way no earlier level asked for, all of them ways of handling the beast, the chapter's theme:
  1. **The Wooden Cow:** Daedalus's cow (Chapter 1) lures the beast into Daedalus's snare (Chapter 5). The shortest line sets the cow down; the beast walks to it, then turns for Theseus along the top hall and the snare holds him. Without the cow, or without the snare, the way is longer or lost.
  2. **The Mirror and the Fire:** Medusa's mirror (Chapter 1) stills the beast, never Talos's fire (Chapter 8). The shortest line holds the mirror up to slip past him by the way out; without the mirror the way is longer or lost, without the fire it is shorter.
  3. **The Fold and the Bomb:** a block pushed into a teleport (Chapter 6) comes out of the other and on onto a bomb (Chapter 9), clearing the way out.
  The chapter keeps `teaching: 3`, so the challenge bar and the ramp are measured within it as in Chapters 6 to 9.
- **Every challenge level mixes pieces from across the campaign:** the snare and its brown button, the cow, the mirror, teleports, a bomb, the thief, the clone machine, gravel, ice and skates, fire and fire boots, currents and suction boots, a pop-up wall, a Harpy and Talos's fire. `test/chapter-10.test.ts` checks that each of these is in some challenge level.
- **The story ends, and the meta reveal is told.** The opening card brings Theseus to the middle of the maze, where someone is drawing the halls a step ahead of him. The closing card has him face the Minotaur and walk out along the thread: the old stories say Theseus slew him, but in this game the beast never dies (the vision), so the snare holds him. By the last gate lies a plan of that hall, half drawn, the pen still wet: the hand that drew every hall was never Daedalus's, but someone still making this Labyrinth for the player to walk. Those words are ours, as the vision asks of the meta chapters.
- **Three endings, by the pages found** (the vision's "endings chosen by how many pages were found"): the closing card of Chapter 10 adds one, under "The End" with the count of pages found across all ten chapters. Every page: "The True Ending: The Maker's Notes" (the game ships and the review gives it five stars, after the old Whitehead-review ending); some: "Out, but Thin"; none: "The Hallway Ending" (the creature waits for your sequel). They are our words, after the endings Crete had before the redesign. The PAX ending (being caught) has no place here, since no level needs a catch and a try at 0 hearts simply ends.
- **The sources:** Nathaniel Hawthorne's *Tanglewood Tales* (1853), "The Minotaur", for the opening card; Catullus's poem 64 in Leonard C. Smithers's 1894 prose translation for the closing card and the Fallen Oak page; and Apollodorus's *Library* in Frazer's 1921 translation for the Last Part page. Hawthorne and Catullus are on the vision's list and are quoted here for the first time. Hawthorne wrote in English, so his cite names no translator ("Nathaniel Hawthorne, Tanglewood Tales, The Minotaur (1853)"), and `test/campaign.test.ts`'s cite rule takes that form. Each quotation is checked word for word: Hawthorne and Smithers against their Project Gutenberg texts (#976 and #20732), Frazer against Perseus; the Catullus line numbers against the Latin printed beside Smithers.
- **New layouts:** every level is drawn new. The teaching levels began as small hall sketches for this chapter; the pieces were placed by a solver search for the lesson (the cow used and the beast held; the mirror used and the fire costing moves; the block teleported onto the bomb) and one or two walls then moved to keep their overlap with released levels under the bar. The challenge levels began as drafts from Chapter 9's generator of rooms and halls (rooms joined by a random spanning tree of doors, pieces placed on doors and in rooms by a recipe, kept only when solved without a catch with a live beast that adds moves), then tuned with walls held mostly still and pieces moved, and checked whole by the gate. __OVERLAP__
- **The ramp:** measured within the chapter, as in Chapters 6 to 9: level 4 clears the challenge bar (20 times the hardest teaching level) and the shared bar, and each level after it climbs __RAMP__.
- **The finale's size:** __FINALE__
- **Every piece matters, the beast is live:** `uselessProblems` and `threatProblems` hold on every level.

## The story

The chapter is the heart of the Labyrinth, where Chapter 9's sloping floor leads. The opening card says nothing new waits there, only everything the maze has taught, all at once, and him; on the walls someone is drawing the halls a step ahead, and Hawthorne's Theseus discerns the creature "at the very center of the labyrinth". The pages recall how the old books end the story: Apollodorus's Theseus kills the beast with his fists and follows the clue out (Epitome 1.9), and Catullus's throws him down like an oak torn up by a storm (64.110–111); Theseus answers that nothing here dies, it is only held. The closing card ends the campaign as the rulings tell, with Catullus's Theseus "guiding his errant footsteps by means of a tenuous thread" (64.112–115), and the ending the pages found have earned.

## Global constraints

- **Nothing new:** every piece is one an earlier chapter brought in. Nothing hides a wall.
- **Teaching levels 1–3** as in the rulings.
- **Challenge levels 4–10:**
  - Each clears the challenge bar, the shared bar and `catchProblems`.
  - Each stores 1.2 to 2.2 times the situations of the level before it (`RAMP`).
  - The measures, in situations stored:

__TABLE__
- **Size:** levels 1–9 fit 12 by 12. Level 10 is larger than the screen, fits 20 by 20, and ends at a gate.
- **Pages:** level 9 holds "The Last Part" and level 10 "The Fallen Oak", each off the shortest line, on a longer winning route.
- **Music:** the title theme, unchanged.

## Tasks

### Task 1: the levels and the words

- `src/puzzle/heart.ts` with `HEART` (`ch10-1` to `ch10-10`) and `heartLevel(i)`; `src/campaign/chapter-10.ts` with `CHAPTER_10`; release Chapter 10 in `chapters.ts` (`teaching: 3`) and extend `levelById`; FEWEST entries; `test/chapter-10.test.ts`.
- The endings: `Ending` and `endingFor` in `lore.ts`, the ending on the closing card in `ui/chapter.tsx`, its style in `game.css`, the pages found passed from `ui.ts`.
- Run `test/chapter-10.test.ts`, `layouts`, `difficulty` (Chapter 10's cases) and `fewest`. Expected: all pass.

### Task 2: chapter flow and e2e

- The unit tests that count released chapters (`campaign`, `ui`, `views`): every chapter released, Chapter 9's closing card going on to Chapter 10's, and Chapter 10's closing card with its ending and Continue.
- `tests/e2e/crete-chapter.spec.ts` (Chapter 9's closing card leads on to Chapter 10's; Chapter 10's last level opens the last closing card with the Hallway Ending) and `crete-play.spec.ts` (every chapter tab open).
- Rebuild `dist/`, `sw.js` and `play/crete`; run both specs against a local compose project.

### Task 3: the docs

- The roadmap and the Crete README record Chapter 10 and the endings; Endless is next.
