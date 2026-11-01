# Crete Chapter 4, "The False Walls": Implementation Plan

**Goal:** release Chapter 4. It has ten levels that bring in the fake wall and the invisible wall, its story card and pages, and the tests that gate it.

**Architecture:** the same shape as Chapters 2 and 3:
- `src/puzzle/false-walls.ts` holds the level text;
- `src/campaign/chapter-4.ts` holds the words;
- `src/campaign/chapters.ts` releases the chapter, and `levelById` finds its levels;
- `src/campaign/fewest.ts` holds the fewest moves per level.

The difficulty gate in `test/difficulty.test.ts` already loops over every released chapter, so the challenge bar, the shared bar and the ramp apply to Chapter 4 without a change.

**Tech stack:** TypeScript, node:test, Playwright e2e.

**Spec:** `docs/superpowers/specs/2026-10-29-crete-chapter-2-design.md` sets the pace table (Chapter 4 brings the fake and invisible walls) and the chapter pattern. `docs/superpowers/specs/2026-10-21-crete-pieces-design.md` sets their rules: a fake wall looks like wall and opens at Theseus's bump; an invisible wall looks like floor and shows at his bump; either bump costs a move; to the Minotaur a fake wall is wall until opened and an invisible wall is always wall. `docs/superpowers/specs/2026-10-16-crete-redesign-vision.md` sets the story and the quotation rule.

## The story

The chapter is the ring where the Labyrinth lies to you. Its memory is the tales the Cretans told against the myth: the Labyrinth only a prison (Plutarch 16.2, after Aristotle), its cruelty the work of Minos's general Taurus (16.1), and the whisper about Taurus and the queen Pasiphaë (19.2). The closing card turns back to the beast with two natures (15.2) and points at Daedalus's snares, which Chapter 5 brings in.

## Global constraints

- **Two new pieces:** the fake wall (`W`) and the invisible wall (`I`). Nothing from Chapters 5 to 9 appears: no snare, brown or red button, teleport, thief, bomb, clone machine or moving hazard.
- **Teaching levels 1–3:**
  1. a painted wall is the way (as a true wall the level is lost);
  2. an unseen wall keeps the beast in his hall (as floor he gets through, and the level is lost);
  3. both: the fake wall is the way and the invisible wall shuts the near way to it.
- **Challenge levels 4–10:**
  - Each clears the challenge bar and the shared bar.
  - Each stores 1.2 to 2.2 times the situations of the level before it (`RAMP`), with margin: about 1.27 or more between neighbours.
  - Level 4 stores at least 20 times as many as the hardest teaching level.
  - Level 10 is the hardest. It stores a little more than Chapter 3's level 10 (43,275).
- **Every level** has a Minotaur and a catch-free win, and its false walls matter: drawn as they look, the level is lost or won another way.
- **Size:** levels 1–9 fit 12 by 12. Level 10 is larger than the screen but fits 20 by 20, has more than one route, and ends at a gate.
- **Pages:** level 9 holds "Taurus" and level 10 holds "The Queen". Each lies off the shortest line, on a longer winning route.
- **Quotations** are word for word from Perrin's 1914 Loeb Plutarch, cited by section.
- **Music:** the title theme, unchanged.

## Review focus

1. **A player who cannot see the false walls.** Every intro says how many painted or unseen walls a level holds, so a player knows what to look for.
2. **Progress keys across four chapters.** Chapters 1 to 3 keep their ids. Chapter 3's closing card goes on to Chapter 4's opening card.
3. **The Lore book:** Chapter 4's pages, its opening card, and its closing card once it has been seen.
4. **Level 10's size** on a phone: it scrolls like the earlier tenth levels.
5. **The pinned shortest lines** catch any later rule change that alters a level.

## Tasks

### Task 1: the levels and the words

- Create `src/puzzle/false-walls.ts` with `FALSE_WALLS` (ids `ch4-1` to `ch4-10`) and `falseWallLevel(i)`.
- Create `src/campaign/chapter-4.ts` with `CHAPTER_4`.
- Release Chapter 4 in `chapters.ts` (`teaching: 3`), and extend `levelById`.
- Add FEWEST entries for `ch4-1` to `ch4-10`.
- Test file `test/chapter-4.test.ts`, mirroring `test/chapter-3.test.ts`:
  - the chapter table, progress keys, parsing and canonical text, sizes;
  - the false walls as the new pieces, and no later piece;
  - pinned shortest lines, and on every level the false walls matter;
  - the three teaching lessons;
  - the pages;
  - level 10's routes.
- Run `node --test test/chapter-4.test.ts test/difficulty.test.ts test/fewest.test.ts`. Expected: all pass.

### Task 2: chapter flow and e2e

- Update the unit tests that count released chapters (`campaign`, `ui`, `views`).
- Update `tests/e2e/crete-chapter.spec.ts` so that Chapter 3's closing card leads on to Chapter 4's, and `crete-play.spec.ts` for the fourth open tab.
- Rebuild `dist/`, `sw.js` and `play/crete`.
- Run `make e2e E2E_ARGS="crete-chapter.spec.ts crete-play.spec.ts"`. Expected: all pass.

### Task 3: the roadmap

- Record Chapter 4 as live; Chapters 5 to 10 remain.
