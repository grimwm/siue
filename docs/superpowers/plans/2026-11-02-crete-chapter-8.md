# Crete Chapter 8, "The Harpies' Den": Implementation Plan

**Goal:** release Chapter 8. It has ten levels that bring in the Harpy and Talos's fire, its story cards and pages, and the tests that gate it.

**Architecture:** the same shape as Chapters 2 to 7:
- `src/puzzle/winds.ts` holds the level text;
- `src/campaign/chapter-8.ts` holds the words;
- `src/campaign/chapters.ts` releases the chapter, and `levelById` finds its levels;
- `src/campaign/fewest.ts` holds the fewest moves per level.

The difficulty gate in `test/difficulty.test.ts` already loops over every released chapter, so the challenge bar, the shared bar and the ramp apply to Chapter 8 without a change. The Harpy and Talos's fire are already in the engine, both solvers, the pack, the estimate, the pruning, the same-answers corpus, the Modern and Classic art (`fx/blender/glider.blend`, `fx/blender/fireball.blend`), the sound and the Dictionary (`plans/2026-10-27-crete-pieces.md`), so this chapter adds levels, words and one new test: `test/layouts.test.ts`, which holds every level from Chapter 8 on to a new layout.

**Tech stack:** TypeScript, node:test, Playwright e2e.

**Spec:** `docs/superpowers/specs/2026-10-29-crete-chapter-2-design.md` sets the pace table (Chapter 8 brings the Harpy and Talos's fire) and the chapter pattern. `docs/superpowers/specs/2026-10-21-crete-pieces-design.md` sets the rules:
- each hazard moves one cell every turn, after Theseus and before the Minotaur, straight ahead;
- blocked, the Harpy turns left, else right, else back; Talos's fire turns right, else left, else back; either stays put when every way is blocked;
- the Harpy flies over water and Talos's fire runs through fire; otherwise walls, closed doors, water, fire, gravel, teleports, blocks, items, the cow, the Minotaur and other hazards stop them;
- touching one, or being flown or run onto, is a catch: a heart, and the throw back;
- the Minotaur and a hazard block each other, and a hazard presses the buttons it moves onto.

`docs/superpowers/specs/2026-10-16-crete-redesign-vision.md` sets the story and the quotation rule.

## Rulings

These were open; Claude settled them without asking, per the roadmap's standing rule.

RULINGS

## The story

STORY

## Global constraints

CONSTRAINTS

## Review focus

1. **A hazard a player cannot read.** Every intro says what each hazard does where it flies or runs; the Dictionary's first-meeting card explains each the first time it is on the board.
2. **The shortest lines take no catch.** The gate's `catchProblems` refuses any level whose fewest moves take one, and the chapter test checks the pinned lines are never caught.
3. **Progress keys across eight chapters.** Chapters 1 to 7 keep their ids. Chapter 7's closing card goes on to Chapter 8's opening card.
4. **The Lore book:** Chapter 8's pages, its opening card, and its closing card once it has been seen.
5. **New layouts:** `test/layouts.test.ts` fails a level whose walls repeat a released level's.

## Tasks

### Task 1: the levels and the words

- Create `src/puzzle/winds.ts` with `WINDS` (ids `ch8-1` to `ch8-10`) and `windLevel(i)`.
- Create `src/campaign/chapter-8.ts` with `CHAPTER_8`.
- Release Chapter 8 in `chapters.ts` (`teaching: 3`), and extend `levelById`.
- Add FEWEST entries for `ch8-1` to `ch8-10`.
- Test file `test/chapter-8.test.ts`, mirroring `test/chapter-7.test.ts`; and `test/layouts.test.ts`.
- Run `node --test test/chapter-8.test.ts`, then `test/layouts.test.ts`, `test/difficulty.test.ts` and `test/fewest.test.ts`. Expected: all pass.

### Task 2: chapter flow and e2e

- Update the unit tests that count released chapters (`campaign`, `ui`, `views`).
- Update `tests/e2e/crete-chapter.spec.ts` so that Chapter 7's closing card leads on to Chapter 8's, and `crete-play.spec.ts` for the eighth open tab.
- Rebuild `dist/`, `sw.js` and `play/crete`.
- Run `crete-chapter.spec.ts` and `crete-play.spec.ts` against a local compose project. Expected: all pass.

### Task 3: the docs

- Record Chapter 8 in the roadmap and the Crete README; Chapters 9 and 10 remain.
