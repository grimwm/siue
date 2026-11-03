# Crete Chapter 7, "The Bronze Guard": Implementation Plan

**Goal:** release Chapter 7. It has ten levels that bring in the bronze ball, its story cards and pages, and the tests that gate it.

**Architecture:** the same shape as Chapters 2 to 6:
- `src/puzzle/rounds.ts` holds the level text;
- `src/campaign/chapter-7.ts` holds the words;
- `src/campaign/chapters.ts` releases the chapter, and `levelById` finds its levels;
- `src/campaign/fewest.ts` holds the fewest moves per level.

The difficulty gate in `test/difficulty.test.ts` already loops over every released chapter, so the challenge bar, the shared bar and the ramp apply to Chapter 7 without a change. The bronze ball is already in the engine, both solvers, the pack, the estimate, the pruning, the same-answers corpus, the Modern and Classic art (`fx/blender/ball.blend`), the sound and the Dictionary with its first-meeting card (`plans/2026-10-27-crete-pieces.md`), so this chapter adds levels and words only.

**Tech stack:** TypeScript, node:test, Playwright e2e.

**Spec:** `docs/superpowers/specs/2026-10-29-crete-chapter-2-design.md` sets the pace table (Chapter 7 brings the bronze ball) and the chapter pattern. `docs/superpowers/specs/2026-10-21-crete-pieces-design.md` sets the rules:
- a ball moves one cell every turn, after Theseus and before the Minotaur, straight ahead; blocked, it turns back, and if that is blocked too it stays put;
- walls, closed doors, water, fire, gravel, teleports, blocks, items, the cow, the Minotaur and other hazards stop it; ice and force floors carry it, and a snare holds it;
- touching it, or being rolled onto, is a catch: a heart, and the throw back;
- the Minotaur and a ball block each other: neither enters the other's cell;
- a ball presses the brown and toggle buttons it rolls onto.

`docs/superpowers/specs/2026-10-16-crete-redesign-vision.md` sets the story and the quotation rule.

## Rulings

These were open; Claude settled them without asking, per the roadmap's standing rule.

- **The name:** "The Bronze Guard". Chapter 6's closing card ends on Talos, the bronze guard of Crete who never rested, and the ball is the chapter's guard: it never stops rolling.
- **The sources:** Apollonius of Rhodes's *Argonautica* in R. C. Seaton's 1912 Loeb translation (Theoi) for the opening, and Apollodorus's *Library* in Frazer's 1921 translation (Theoi) for the pages and the closing. Apollodorus is on the vision's list. Seaton's Apollonius is not, but it is public domain (1912) and is the fullest ancient telling of Talos; the vision's rule is public-domain translations, and the list names the ones used so far. The opening's line numbers (4.1641–1644) are checked against the Greek on Perseus.
- **The three lessons,** one idea each, each one a thing the ball does that a player has to see before mixing it with the rest:
  1. it rolls straight and turns back: wait in a side niche while it rolls past (without the ball the level is shorter, and the shortest line waits);
  2. it and the beast block each other: rolling in the one way out of his hall, it holds him (without the ball the level is lost; without the beast as well, it is won);
  3. it presses the buttons it rolls over: rolling over a toggle button in a sealed hall, it opens and shuts the toggle wall in Theseus's way (without the ball the level is lost).
  A block stopping a ball was tried as the third lesson and dropped: in a straight hall Theseus can always walk behind a ball rolling away from him, so a block is never needed against a lone ball unless the beast presses him, and then the lesson is the beast, not the ball.
- **The ramp's start:** as in Chapter 6, measured within the chapter: level 4 starts at the challenge bar (20 times the hardest teaching level, and the shared bar), and each level after it climbs 1.2 to 2.2 times. Level 10 stores more than Chapter 6's level 10 (55,797).
- **Where the levels come from:** each challenge level is a new layout, drawn by hand as rooms and halls with the chapter's pieces, then tuned with the solver to the ramp and the gate and tidied. None is an earlier level turned or flipped: players would know the maze. `test/layouts.test.ts` holds every released level to a new layout, and the tuning search that moved walls scored each draft's overlap with every released level and kept it well under the test's threshold.
- **Pieces per level** stay as the titles name them: ice, skates, a block and a snare with its brown button in level 4; teleports, pools, flippers and a block in level 5; teleports, fire, boots and toggle walls in level 6; ice, a current and pop-up walls in level 7; currents, gravel and suction boots in level 8; fire, boots, pop-up walls, the mirror and a honey cake in level 9; and in level 10, the finale, teleports, fire, boots, toggle walls, a red key and door, and the gate.
- **Every piece matters, the beast is live:** the owner's two rules, as `src/puzzle/difficulty.ts` states them (`uselessProblems`, `threatProblems`), hold on every level, the ball included: taken away, each ball changes the fewest moves, makes the level lost, or cuts its search by `USEFUL.explored`.

## The story

The chapter is the ring the bronze ball guards, as Talos guarded Crete. The opening card recalls Talos, the last of the men of bronze, given to Europa to stride round the island three times a day (*Argonautica* 4.1641–1644). The pages recall what nobody agreed on, man of bronze or bull (Apollodorus 1.9.26), and his one vein shut with a bronze nail (1.9.26). The closing card hears wings over an open roof and smells burning, and recalls the Harpies that fouled Phineus's table (1.9.21): it points at Chapter 8's Harpy and Talos's fire.

## Global constraints

- **One new piece:** the bronze ball (`o`, with a `facing:` header). Nothing from Chapters 8 and 9 appears: no harpy, Talos's fire, thief, bomb, clone machine or red button.
- **Teaching levels 1–3** as in the rulings.
- **Challenge levels 4–10:**
  - Each clears the challenge bar and the shared bar, and `catchProblems`: no level needs a catch, to win or for the fewest moves.
  - Each stores 1.2 to 2.2 times the situations of the level before it (`RAMP`).
  - The measures, in situations stored (the gate-every-piece branch's solver):

    | Level | Title | Fewest moves | Stored | × the level before | Beast adds |
    |---|---|---|---|---|---|
    | 1 | The Bronze Ball | 18 | 102 | | 3 |
    | 2 | The Ball and the Beast | 8 | 30 | | 1 |
    | 3 | The Rolling Button | 18 | 174 | | 8 |
    | 4 | The Frozen Round | 35 | 6,281 | 36 × level 3 | 15 |
    | 5 | The Sunken Round | 31 | 13,018 | 2.07 | 11 |
    | 6 | The Burning Round | 33 | 15,870 | 1.22 | 8 |
    | 7 | The Icy Round | 45 | 29,027 | 1.83 | 15 |
    | 8 | The Driven Round | 48 | 50,102 | 1.73 | 9 |
    | 9 | The Mirrored Round | 56 | 74,084 | 1.48 | 9 |
    | 10 | The Last Round | 47 | 114,683 | 1.55 | 9 |
  - Level 4 stores at least 20 times as many as the hardest teaching level (174), and clears the shared bar for a chase level (6,000 stored, 30 moves).
  - Level 10 is the hardest. It stores more than Chapter 6's level 10 (55,797).
  - No level hides a wall, so `HIDDEN` does not apply.
- **Every level** has a Minotaur and at least one bronze ball, and its intro names how many ("one bronze ball").
- **Size:** levels 1–9 fit 12 by 12. Level 10 is larger than the screen (12 by 14) but fits 20 by 20; its red door is the one way to the last relic, so its key is needed, and it ends at a gate.
- **Pages:** level 9 holds "The Brazen Man" and level 10 holds "The Bronze Nail". Each lies off the shortest line, on a longer winning route.
- **Quotations** are word for word from Seaton's Apollonius and Frazer's Apollodorus, cited by line or section.
- **Music:** the title theme, unchanged.

## Review focus

1. **A ball a player cannot read.** Every intro says where the ball rolls; the Dictionary's first-meeting card explains the ball the first time one is on the board.
2. **The shortest lines take no catch.** With three hearts a catch can be a short cut; the gate's `catchProblems` refuses any level whose fewest moves take one, and the chapter test checks the pinned lines are never caught.
3. **Progress keys across seven chapters.** Chapters 1 to 6 keep their ids. Chapter 6's closing card goes on to Chapter 7's opening card.
4. **The Lore book:** Chapter 7's pages, its opening card, and its closing card once it has been seen.
5. **The pinned shortest lines** catch any later rule change that alters a level.

## Tasks

### Task 1: the levels and the words

- Create `src/puzzle/rounds.ts` with `ROUNDS` (ids `ch7-1` to `ch7-10`) and `roundLevel(i)`.
- Create `src/campaign/chapter-7.ts` with `CHAPTER_7`.
- Release Chapter 7 in `chapters.ts` (`teaching: 3`), and extend `levelById`.
- Add FEWEST entries for `ch7-1` to `ch7-10`.
- Test file `test/chapter-7.test.ts`, mirroring `test/chapter-6.test.ts`:
  - the chapter table, progress keys, parsing and canonical text, sizes;
  - the ball as the new piece, counted in each intro, and no later piece;
  - pinned shortest lines, never caught, and on every level the balls matter;
  - the three teaching lessons;
  - the pages;
  - level 10's red door and key.
- Run `node --test test/chapter-7.test.ts`, then `test/difficulty.test.ts`, then `test/fewest.test.ts`. Expected: all pass.

### Task 2: chapter flow and e2e

- Update the unit tests that count released chapters (`campaign`, `ui`, `views`).
- Update `tests/e2e/crete-chapter.spec.ts` so that Chapter 6's closing card leads on to Chapter 7's, and `crete-play.spec.ts` for the seventh open tab.
- Rebuild `dist/`, `sw.js` and `play/crete`.
- Run `crete-chapter.spec.ts` and `crete-play.spec.ts` against a local compose project. Expected: all pass.

### Task 3: the docs

- Record Chapter 7 in the roadmap and the Crete README; Chapters 8 to 10 remain.
