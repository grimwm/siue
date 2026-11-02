# Crete Chapter 5, "The Snares of Daedalus": Implementation Plan

**Goal:** release Chapter 5. It has ten levels that bring in Daedalus's snare and its brown button, its story card and pages, and the tests that gate it.

**Architecture:** the same shape as Chapters 2 to 4:
- `src/puzzle/snares.ts` holds the level text;
- `src/campaign/chapter-5.ts` holds the words;
- `src/campaign/chapters.ts` releases the chapter, and `levelById` finds its levels;
- `src/campaign/fewest.ts` holds the fewest moves per level.

The difficulty gate in `test/difficulty.test.ts` already loops over every released chapter, so the challenge bar, the shared bar and the ramp apply to Chapter 5 without a change.

**Tech stack:** TypeScript, node:test, Playwright e2e.

**Spec:** `docs/superpowers/specs/2026-10-29-crete-chapter-2-design.md` sets the pace table (Chapter 5 brings Daedalus's snare and button) and the chapter pattern. `docs/superpowers/specs/2026-10-21-crete-pieces-design.md` sets the rules:
- whoever steps into a snare (Theseus, a block, the Minotaur) is held there until something stands on a brown button linked to it;
- a held Minotaur is pinned, and waiting while held is a move;
- Theseus, blocks and hazards press brown buttons; the Minotaur never does;
- each brown button holds the next snare after it in reading order, wrapping.

`docs/superpowers/specs/2026-10-16-crete-redesign-vision.md` sets the story and the quotation rule.

## The story

The chapter is the ring where the floor itself is a trap, and its memory is the man who built the Labyrinth. The opening card recalls Daedalus fleeing Crete (Plutarch 19.4). The pages recall him as Theseus's own kinsman (19.5) and the other telling, in which Theseus came with ships and fought at the gate of the Labyrinth (19.6). The closing card turns to the circling passages of the Delian crane dance (21.1) and points at the teleports Chapter 6 brings in.

## Global constraints

- **One new piece and its button:** the snare (`&`) and the brown button (`-`). Nothing from Chapters 6 to 9 appears: no teleport, thief, bomb, clone machine, red button or moving hazard.
- **Teaching levels 1–3:**
  1. a snare holds the beast: led into it, he is pinned, and without it the level is lost;
  2. a block on a brown button opens the snare in Theseus's way: without the button, or the block, the level is lost;
  3. a button frees whatever its snare holds, the beast too: the snare is needed, and the button costs the long way round.
- **Challenge levels 4–10:**
  - Each clears the challenge bar and the shared bar, and `catchProblems`: no level needs a catch, to win or for the fewest moves.
  - Each stores 1.2 to 2.2 times the situations of the level before it (`RAMP`), with margin: about 1.3 or more between neighbours.
  - Level 4 stores at least 20 times as many as the hardest teaching level.
  - Level 10 is the hardest. It stores more than Chapter 4's level 10, which hides walls and so sits under `HIDDEN.most`.
- **Every level** has a Minotaur, and its snares matter: as plain floor, the level is lost or won another way.
- **Size:** levels 1–9 fit 12 by 12. Level 10 is larger than the screen but fits 20 by 20, has more than one route, and ends at a gate.
- **Pages:** level 9 holds "The Kinsman" and level 10 holds "The Gate". Each lies off the shortest line, on a longer winning route.
- **Quotations** are word for word from Perrin's 1914 Loeb Plutarch, cited by section.
- **Music:** the title theme, unchanged.
- **Layouts:** tuned with the solver for the numbers, then tidied: no stray wall stubs or pointless pockets.

## Review focus

1. **A player who doesn't know which button holds which snare.** Every intro names how many snares and buttons a level holds, and the reading-order link is the same everywhere.
2. **Progress keys across five chapters.** Chapters 1 to 4 keep their ids. Chapter 4's closing card goes on to Chapter 5's opening card.
3. **The Lore book:** Chapter 5's pages, its opening card, and its closing card once it has been seen.
4. **Level 10's size** on a phone: it scrolls like the earlier tenth levels.
5. **The pinned shortest lines** catch any later rule change that alters a level.

## Tasks

### Task 1: the levels and the words

- Create `src/puzzle/snares.ts` with `SNARES` (ids `ch5-1` to `ch5-10`) and `snareLevel(i)`.
- Create `src/campaign/chapter-5.ts` with `CHAPTER_5`.
- Release Chapter 5 in `chapters.ts` (`teaching: 3`), and extend `levelById`.
- Add FEWEST entries for `ch5-1` to `ch5-10`.
- Test file `test/chapter-5.test.ts`, mirroring `test/chapter-4.test.ts`:
  - the chapter table, progress keys, parsing and canonical text, sizes;
  - the snare as the new piece, every button linked to a snare, and no later piece;
  - pinned shortest lines, and on every level the snares matter;
  - the three teaching lessons;
  - the pages;
  - level 10's routes.
- Run `node --test test/chapter-5.test.ts test/difficulty.test.ts test/fewest.test.ts`. Expected: all pass.

### Task 2: chapter flow and e2e

- Update the unit tests that count released chapters (`campaign`, `ui`, `views`).
- Update `tests/e2e/crete-chapter.spec.ts` so that Chapter 4's closing card leads on to Chapter 5's, and `crete-play.spec.ts` for the fifth open tab.
- Rebuild `dist/`, `sw.js` and `play/crete`.
- Run `make e2e E2E_ARGS="crete-chapter.spec.ts crete-play.spec.ts"`. Expected: all pass.

### Task 3: the roadmap

- Record Chapter 5 as live; Chapters 6 to 10 remain.
