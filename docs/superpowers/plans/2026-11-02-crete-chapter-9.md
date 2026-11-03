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
