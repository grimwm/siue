# Crete Chapter 9, "Daedalus's Workshop": Implementation Plan

**Goal:** release Chapter 9. It has ten levels that bring in the thief, the bomb and the clone machine with its red button, its story cards and pages, and the tests that gate it.

**Architecture:** the same shape as Chapters 2 to 8:
- `src/puzzle/workshop.ts` holds the level text;
- `src/campaign/chapter-9.ts` holds the words;
- `src/campaign/chapters.ts` releases the chapter, and `levelById` finds its levels;
- `src/campaign/fewest.ts` holds the fewest moves per level.

The difficulty gate in `test/difficulty.test.ts` and the new-layouts check in `test/layouts.test.ts` loop over every released chapter, so they hold Chapter 9 without a change. The thief, the bomb and the clone machine are already in the engine, both solvers, the pack, the estimate, the pruning, the same-answers corpus, the Modern and Classic art (`fx/blender/thief.blend`, `bomb.blend`, `clone-*.blend`, `button-red.blend`), the sound and the Dictionary (`plans/2026-10-27-crete-pieces.md`), and `pieceUnits` already takes each one out (a thief or a bomb as floor, a clone machine as wall with its red buttons as floor), so this chapter adds levels, words and tests.

**Tech stack:** TypeScript, node:test, Playwright e2e.

**Spec:** `docs/superpowers/specs/2026-10-29-crete-chapter-2-design.md` sets the pace table (Chapter 9 brings the thief, the bomb and the clone machine) and the chapter pattern. `docs/superpowers/specs/2026-10-21-crete-pieces-design.md` sets the rules:
- stepping on a thief takes all of Theseus's gear (flippers, fire boots, skates, suction boots); keys and tools stay; the thief stays too;
- whatever steps onto a bomb is destroyed and the bomb is gone; Theseus loses a heart and is thrown back as when caught; a block or a moving hazard is destroyed with it; the Minotaur never steps on one;
- each time something arrives on a red button, the next clone machine along (reading order, wrapping) makes a copy of what it holds, a block or a moving hazard, in the cell it faces, if that cell is free; machine cells are wall to everyone, and it never clones the Minotaur.

`docs/superpowers/specs/2026-10-16-crete-redesign-vision.md` sets the story and the quotation rule.

## Rulings

These were open; Claude settled them without asking, per the roadmap's standing rule.

- **The name:** "Daedalus's Workshop". Chapter 8's closing card ends on small quick footprints and the infant Hermes stealing Apollo's cattle; the footprints lead into the place where the Labyrinth's builder made his machines. The Dictionary already calls the thief a servant of Hermes, the bomb a jar from the forge and the clone machine Daedalus's workshop that never rests, so one place holds all three.
- **Three pieces, three lessons,** one idea each:
  1. the thief takes your gear: the flippers lie by the start, the thief stands on the short way to the pool, and the shortest line goes round it (without the thief the way is shorter; the line is never robbed);
  2. a block bursts a bomb: a bomb lies in the hall to the way out, and the shortest line pushes the block along the hall onto it (without the bomb the way is shorter; without the block only a catch gets past it);
  3. the red button makes the clone machine turn out a block: the shortest line presses it and pushes the block into the moat, and crosses on the dirt (without the button the level is lost).
- **The sources:** the Homeric Hymn to Hermes in H. G. Evelyn-White's 1914 Loeb translation for the opening card and the Backward Tracks page, and Apollodorus's *Library* in Frazer's 1921 translation for the First Inventor page and the closing card. Evelyn-White's Hesiod volume (the same Loeb, which holds the Homeric Hymns) was first quoted in Chapter 8. The hymn is not on the vision's list; it is public domain and it is the story Chapter 8's closing card begins, so it follows the vision's rule (public-domain translations, the list naming those used so far). Each quotation is checked word for word against the Project Gutenberg text of Evelyn-White (#348, footnote numbers left out) and Perseus's Frazer; the hymn's line numbers against the Greek on Perseus.
- **The meta reveal begins:** the vision puts it in the last two chapters. Chapter 9 only hints: the closing card finds plans of every hall Theseus has walked, in a hand that is not Daedalus's, the ink on the newest still wet. Chapter 10 tells the rest.
- **The tools' random numbers:** the Chapter 8 tools drew from a linear congruential generator whose product overflowed a double's 53 bits, so it fell into short cycles and a tuner revisited the same few drafts. The Chapter 9 tools draw from a 32-bit generator with `Math.imul`.
- **New layouts:** every level is drawn new. The teaching levels began as sketches for this chapter (a room by a pool, a hall with a bomb in it, a hall above a moat) and were tuned with the solver. The challenge levels began as drafts from a generator of rooms and halls: a grid of rooms joined by a random spanning tree of doors, some neighbours merged into halls, each level's pieces placed on doors and in rooms by a recipe (the thief and gravel on doors, a pool filling a room, a clone machine on a room's wall facing in, and so on), kept only when solved without a catch, with a live beast that adds moves; then tuned with walls held mostly still and pieces moved. `test/layouts.test.ts` holds each to the 0.42 bar; Chapter 9's levels overlap any other released level by at most 0.41 (levels 6 and 8), the rest by 0.24 to 0.39.
- **The ramp's start:** as in Chapters 6 to 8, measured within the chapter: level 4 clears the challenge bar (20 times the hardest teaching level, 450) and the shared bar, and each level after it climbs 1.36 to 1.68 times. Level 10 stores more than Chapter 8's level 10 (128,649); level 9 was taken at 107,434 so that level 10 climbs 1.68 times, under the 1.8 the brief asked for.
- **Level 10 holds the clone machine and a Harpy, not all three pieces:** its first draft held the thief, flippers and water, and a bomb, and the every-piece rule refused them: the line never needed them and the search hardly changed without them. Every other place tried for the bomb either left it idle or pushed the search past the ramp's 2.2 times, so they were taken out. The thief is in levels 4, 7 and 9, the bomb in 2, 5 and 8, the clone machine in 3, 6, 8 and 10.
- **The thief can help:** in level 7 the shortest line lets the thief take the skates, so that the ice carries Theseus and the block across it. No intro says so.
- **Every piece matters, the beast is live:** `uselessProblems` and `threatProblems` hold on every level.

## The story

The chapter is Daedalus's workshop, where the thief's footprints from Chapter 8 lead. The opening card names the three pieces and recalls the infant Hermes, "a robber, a cattle driver, ... a thief at the gates" (Homeric Hymn to Hermes 13–16). The pages recall Hermes driving Apollo's cattle off backwards (76–78) and Daedalus, "the first inventor of images" (Apollodorus 3.15.8): the workshop that turns out copies. The closing card finds plans of every hall Theseus has walked, in another hand, the ink still wet, and the floor sloping down to the middle of the maze, where the Minotaur was confined (Apollodorus 3.15.8): it points at Chapter 10.

## Global constraints

- **Three new pieces:** the thief (`$`), the bomb (`!`), the clone machine (`C`, with its `machines:` word) and its red button (`+`). Nothing hides a wall.
- **Teaching levels 1–3** as in the rulings.
- **Challenge levels 4–10:**
  - Each clears the challenge bar, the shared bar and `catchProblems`.
  - Each stores 1.2 to 2.2 times the situations of the level before it (`RAMP`).
  - The measures, in situations stored:

    | Level | Title | Fewest moves | Stored | × the level before | Beast adds |
    |---|---|---|---|---|---|
    | 1 | The Thief | 18 | 217 | | 6 |
    | 2 | The Bomb | 16 | 260 | | 6 |
    | 3 | The Clone Machine | 16 | 450 | | 2 |
    | 4 | The Thief's Pool | 35 | 12,516 | 28 × level 3 | 10 |
    | 5 | The Powder Store | 40 | 20,653 | 1.65 | 9 |
    | 6 | The Copying Bench | 39 | 27,995 | 1.36 | 10 |
    | 7 | Stolen Skates | 42 | 42,387 | 1.51 | 8 |
    | 8 | The Bronze Copies | 43 | 65,017 | 1.53 | 9 |
    | 9 | The Backward Tracks | 63 | 107,434 | 1.65 | 14 |
    | 10 | The Last Bench | 53 | 179,963 | 1.68 | 18 |
- **Size:** levels 1–9 fit 12 by 12. Level 10 is 15 by 14 and ends at a gate.
- **Pages:** level 9 holds "The Backward Tracks" and level 10 "The First Inventor", each off the shortest line, on a longer winning route.
- **Music:** the title theme, unchanged.

## Tasks

### Task 1: the levels and the words

- `src/puzzle/workshop.ts` with `WORKSHOP` (`ch9-1` to `ch9-10`) and `workshopLevel(i)`; `src/campaign/chapter-9.ts` with `CHAPTER_9`; release Chapter 9 in `chapters.ts` (`teaching: 3`) and extend `levelById`; FEWEST entries; `test/chapter-9.test.ts`.
- Run `test/chapter-9.test.ts`, `layouts`, `difficulty` (Chapter 9's cases) and `fewest`. Expected: all pass.

### Task 2: chapter flow and e2e

- The unit tests that count released chapters (`campaign`, `ui`, `views`); `tests/e2e/crete-chapter.spec.ts` (Chapter 8's closing card leads on to Chapter 9's) and `crete-play.spec.ts` (the ninth open tab).
- Rebuild `dist/`, `sw.js` and `play/crete`; run both specs against a local compose project.

### Task 3: the docs

- The roadmap and the Crete README record Chapter 9; Chapter 10 remains.
