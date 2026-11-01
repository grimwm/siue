# Crete Chapter 3, "The Closing Ways": Implementation Plan

**Goal:** release Chapter 3. It has ten levels that bring in the pop-up wall, its story card and pages, and the tests that gate it.

**Architecture:** the same shape as Chapter 2:
- `src/puzzle/closing.ts` holds the level text;
- `src/campaign/chapter-3.ts` holds the words;
- `src/campaign/chapters.ts` releases the chapter, and `levelById` finds its levels;
- `src/campaign/fewest.ts` holds the fewest moves per level.

The difficulty gate in `test/difficulty.test.ts` already loops over every released chapter, so the challenge bar, the shared bar and the ramp apply to Chapter 3 without a change.

**Tech stack:** TypeScript, node:test, Playwright e2e.

**Spec:** `docs/superpowers/specs/2026-10-29-crete-chapter-2-design.md` sets the pace table (Chapter 3 brings the pop-up wall) and the chapter pattern. `docs/superpowers/specs/2026-10-16-crete-redesign-vision.md` sets the story and the quotation rule. Chapter 2's design gives Chapter 3 its story beat: "the memory of Crete itself (Minos, Ariadne's gift, the thread)".

## Global constraints

- **One new piece:** the pop-up wall (`;`). Nothing from Chapters 4 to 9 appears: no fake or invisible wall, snare, brown or red button, teleport, thief, bomb, clone machine or moving hazard.
- **Teaching levels 1–3:**
  1. a pop-up rises behind you;
  2. the beast cannot step on one;
  3. a block will not cross one.
- **Challenge levels 4–10:**
  - Each clears the challenge bar and the shared bar.
  - Each stores 1.2 to 2.2 times the situations of the level before it (`RAMP`).
  - Level 4 stores at least 20 times as many as the hardest teaching level.
  - Level 10 is the hardest. It stores a little more than Chapter 2's level 10 (38,375).
- **Every level** has a Minotaur, a catch-free win, and a shortest line that crosses a pop-up.
- **Size:** levels 1–9 fit 12 by 12. Level 10 is larger than the screen but fits 20 by 20, has more than one route, and ends at a gate.
- **Pages:** level 9 holds "The Games of Minos" and level 10 holds "The Thread". Each lies off the shortest line, on a longer winning route.
- **Quotations** are word for word from Perrin's 1914 Loeb Plutarch, cited by section.
- **Music:** the title theme, unchanged.

## Review focus

1. **A player who takes the quick way first.** A pop-up crossed too soon can seal off a relic. The level must still be won from the start, which the solver proves. Restart is the way back.
2. **Progress keys across three chapters.** Chapter 1 stays `trial-N` and Chapter 2 stays `ch2-N`. Chapter 2's closing card goes on to Chapter 3's opening card.
3. **The Lore book:** Chapter 3's pages, its opening card, and its closing card once it has been seen.
4. **Level 10's size** on a phone: it scrolls like Chapter 2's level 10.
5. **The pinned shortest lines** catch any later rule change that alters a level.

## Tasks

### Task 1: the levels and the words

- Create `src/puzzle/closing.ts` with `CLOSING` (ids `ch3-1` to `ch3-10`) and `closingLevel(i)`.
- Create `src/campaign/chapter-3.ts` with `CHAPTER_3`.
- Release Chapter 3 in `chapters.ts` (`teaching: 3`), and extend `levelById`.
- Add FEWEST entries for `ch3-1` to `ch3-10`.
- Test file `test/chapter-3.test.ts`, mirroring `test/chapter-2.test.ts`:
  - the chapter table;
  - progress keys;
  - parsing and canonical text;
  - sizes;
  - pop-up as the one new piece;
  - pinned shortest lines that cross pop-ups;
  - the three teaching lessons (pop-up to wall loses or is longer; as floor the beast follows; as floor the block goes the short way, and the block is needed);
  - the pages;
  - level 10's routes.
- Run `node --test test/chapter-3.test.ts test/difficulty.test.ts test/fewest.test.ts`. Expected: all pass.

### Task 2: chapter flow and e2e

- Update `tests/e2e/crete-chapter.spec.ts` so that Chapter 2's closing card leads on to Chapter 3's.
- Rebuild `dist/`, `sw.js` and `play/crete`.
- Run `make e2e E2E_ARGS="crete-chapter.spec.ts crete-play.spec.ts"`. Expected: all pass.

### Task 3: the roadmap

- Record Chapter 3 as live, and the composer (project 4) as live with all its phases.
