# Crete Chapter 6, "The Folding Halls": Implementation Plan

**Goal:** release Chapter 6. It has ten levels that bring in the teleport, its story cards and pages, and the tests that gate it.

**Architecture:** the same shape as Chapters 2 to 5:
- `src/puzzle/folds.ts` holds the level text;
- `src/campaign/chapter-6.ts` holds the words;
- `src/campaign/chapters.ts` releases the chapter, and `levelById` finds its levels;
- `src/campaign/fewest.ts` holds the fewest moves per level.

The difficulty gate in `test/difficulty.test.ts` already loops over every released chapter, so the challenge bar, the shared bar and the ramp apply to Chapter 6 without a change. The teleport is already in the engine, both solvers, the pack, the estimate, the pruning, the same-answers corpus, the Modern and Classic art, the sound and the Dictionary with its first-meeting card (`plans/2026-10-27-crete-pieces.md`), so this chapter adds levels and words only.

**Tech stack:** TypeScript, node:test, Playwright e2e.

**Spec:** `docs/superpowers/specs/2026-10-29-crete-chapter-2-design.md` sets the pace table (Chapter 6 brings the teleport) and the chapter pattern. `docs/superpowers/specs/2026-10-21-crete-pieces-design.md` sets the rules:
- entering a teleport sends Theseus out of the next teleport in reading order (wrapping to the first), moving on in the same direction;
- if that exit is blocked, the next one is tried; if every exit is blocked, he stays on the teleport he entered, and may walk on from it;
- blocks teleport the same way, and a pushed block with every exit blocked makes the push refused;
- to the Minotaur a teleport is wall;
- arriving out of a teleport is a full arrival on the cell beyond (items, buttons, water, the exit all act).

`docs/superpowers/specs/2026-10-16-crete-redesign-vision.md` sets the story and the quotation rule.

## Rulings

These were open; Claude settled them without asking, per the roadmap's standing rule.

- **The name:** "The Folding Halls". Chapter 5's closing card already says "The Labyrinth is learning to fold", and the opening quote is Ovid's Maeander, the river that "meets itself".
- **The sources:** Ovid's *Metamorphoses* Book 8 in Brookes More's 1922 translation (Perseus) for the opening and the pages, and Apollodorus's *Library* in Frazer's 1921 translation (Theoi) for the closing. Both are on the vision's list of public-domain translations. Chapter 6 moves from Plutarch to Ovid because Ovid is where the Labyrinth's folding (the Maeander) and Daedalus's "arts unknown" are told; Hawthorne is left out because the campaign test's citation form names a translator.
- **The ramp's start:** the ramp is measured within the chapter, as the gate and the README define it: level 4 starts at the challenge bar (20 times the hardest teaching level, and the shared bar), and each level after it climbs 1.2 to 2.2 times. Chapter 5's level 10 sets the finale's floor: Chapter 6's level 10 stores more than it. Carrying the ramp on from Chapter 5's level 10 into level 4 would make every chapter start harder than the last one ended, and by Chapter 10 the levels would be beyond the in-game solver; the README's rules (and Chapter 5, which restarted the same way) say otherwise.
- **The third lesson:** a block goes through a teleport too. Reading order with three or more teleports is told in the Dictionary and in each intro that has more than two, so it needs no level of its own.
- **Level 10's two ways.** The owner's rule that every piece matters rules out a second route whose pieces the shortest line never uses: taking them away would leave the fewest moves as they were. So level 10's choice is in its pieces' use, not in an idle second route. The red door is the one way to the last relic, so the key is needed. The teleports are a short cut across the north, and the long way round on foot stays open, so walled up the level is still won, in more moves.

## The story

The chapter is the ring where the halls fold: a step in one place is a step out in another. The opening card recalls Ovid's Maeander, winding back to meet itself (*Met.* 8.162–166). The pages recall Daedalus shut in on Crete, looking up at the one way Minos did not hold (8.186–187), and turning his mind to arts unknown (8.188–189). The closing card finds a long hall worn smooth by something heavy rolling, and recalls Talos, the bronze guard who ran round Crete three times a day (Apollodorus 1.9.26): it points at the bronze ball Chapter 7 brings in.

## Global constraints

- **One new piece:** the teleport (`@`). Nothing from Chapters 7 to 9 appears: no thief, bomb, clone machine, red button or moving hazard.
- **Teaching levels 1–3:**
  1. a teleport carries Theseus: the way out lies in a sealed hall, and with the teleports walled up the level is lost;
  2. the beast cannot follow: the short way on foot runs past him, so without the teleports the level is lost, though without the beast it is won on foot, and sooner;
  3. a block goes through too: pushed through a teleport, it fills the pool beyond the other one; without the block, the level is lost.
- **Challenge levels 4–10:**
  - Each clears the challenge bar and the shared bar, and `catchProblems`: no level needs a catch, to win or for the fewest moves.
  - Each stores 1.2 to 2.2 times the situations of the level before it (`RAMP`).
  - The measures: level 4 stores 7,730, then 10,111, 12,756, 16,499, 20,878, 30,282 and 55,797. That is 1.31, 1.26, 1.29, 1.27, 1.45 and 1.84 times a step.
  - The teaching levels store 48, 98 and 40.
  - Level 4 stores at least 20 times as many as the hardest teaching level.
  - Level 10 is the hardest. It stores more than Chapter 5's level 10 (55,073 after the every-piece retune).
  - No level hides a wall, so `HIDDEN` does not apply.
- **Every level** has a Minotaur, and its teleports matter: walled up, the level is lost or won another way, and the shortest line goes through one.
- **Every piece matters** (the owner's rule, `uselessProblems` in `src/puzzle/difficulty.ts`): ignore any piece, by taking it away or walling it up, and the level is lost, needs a catch, changes its fewest moves, or its search shrinks by `USEFUL.explored`.
- **The beast is a threat from the start** (the owner's rule, `threatProblems`): he adds at least one move, on teaching levels too. On the shortest line of a challenge level he is within reach of Theseus for at least a third of the turns, and never out of reach for more than a third of them in a row (`THREAT`).
- **Size:** levels 1–9 fit 12 by 12. Level 10 is larger than the screen but fits 20 by 20, has more than one way round (the teleports, or the long way on foot), a red door that is the one way to the last relic, and ends at a gate.
- **Pages:** level 9 holds "The Open Sky" and level 10 holds "Arts Unknown". Each lies off the shortest line, on a longer winning route.
- **Quotations** are word for word from More's Ovid and Frazer's Apollodorus, cited by line or section.
- **Music:** the title theme, unchanged.
- **Layouts:** tuned with the solver for the numbers, then tidied: no stray wall stubs or pointless pockets. Levels 4 and 9 share the force-floor motif and levels 7 and 8 the ice. Level 7 is flipped top to bottom and level 8 left to right, so no two levels read alike. Level 10 grew from level 6's fire hall, with a south hall added. The Minotaur's rule (along the horizontal gap first) is the same under either flip.

## Review focus

1. **A player who doesn't know which teleport leads where.** Every intro names how many teleports a level holds; a level with more than two says that each sends you to the next along.
2. **The blocked exit:** a teleport whose way out is blocked leaves Theseus standing on it, free to walk on. The solver plays by the same rule, so every measure and fewest-moves count already takes such a step into account.
3. **Progress keys across six chapters.** Chapters 1 to 5 keep their ids. Chapter 5's closing card goes on to Chapter 6's opening card.
4. **The Lore book:** Chapter 6's pages, its opening card, and its closing card once it has been seen.
5. **The pinned shortest lines** catch any later rule change that alters a level.

## Tasks

### Task 1: the levels and the words

- Create `src/puzzle/folds.ts` with `FOLDS` (ids `ch6-1` to `ch6-10`) and `foldLevel(i)`.
- Create `src/campaign/chapter-6.ts` with `CHAPTER_6`.
- Release Chapter 6 in `chapters.ts` (`teaching: 3`), and extend `levelById`.
- Add FEWEST entries for `ch6-1` to `ch6-10`.
- Test file `test/chapter-6.test.ts`, mirroring `test/chapter-5.test.ts`:
  - the chapter table, progress keys, parsing and canonical text, sizes;
  - the teleport as the new piece, and no later piece;
  - pinned shortest lines, and on every level the teleports matter;
  - the three teaching lessons;
  - the pages;
  - level 10's routes.
- Run `node --test test/chapter-6.test.ts`, then `test/difficulty.test.ts`, then `test/fewest.test.ts`. Expected: all pass.

### Task 2: chapter flow and e2e

- Update the unit tests that count released chapters (`campaign`, `ui`, `views`).
- Update `tests/e2e/crete-chapter.spec.ts` so that Chapter 5's closing card leads on to Chapter 6's, and `crete-play.spec.ts` for the sixth open tab.
- Rebuild `dist/`, `sw.js` and `play/crete`.
- Run `crete-chapter.spec.ts` and `crete-play.spec.ts` against a local compose project. Expected: all pass.

### Task 3: the docs

- Record Chapter 6 as live in the roadmap and the Crete README; Chapters 7 to 10 remain.
