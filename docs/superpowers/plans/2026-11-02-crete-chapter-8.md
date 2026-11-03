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

- **The name:** "The Harpies' Den". Chapter 7's closing card hears wings over an open roof and recalls the Harpies; Apollonius sends them, once Iris has turned the sons of Boreas back, to "their den in Minoan Crete" (*Argonautica* 2.298–300). The Labyrinth is that den.
- **Two pieces, one chapter:** the pace table gives Chapter 8 both the Harpy and Talos's fire. They move by one rule (straight on, turning when blocked) and differ in two things, the way they turn and what they cross, so the teaching levels split as two for the Harpy and one for the fire, and the challenge levels mix both with the earlier pieces.
- **The three lessons,** one idea each:
  1. the Harpy flies straight and turns at walls: it patrols a hooked hall, and the shortest line waits for it to pass (without it the level is shorter);
  2. the Harpy flies over water: it flies up and down a pool Theseus cannot swim, over a button that opens and shuts the toggle wall in his way, and the wall shuts on the beast behind him (without the Harpy, or with the pool walled up, the level is lost);
  3. Talos's fire runs through fire: it runs up and down a burning hall, and the fire boots carry Theseus over the flames but not past it (without it the level is shorter).
- **The sources:** Apollonius of Rhodes's *Argonautica* in R. C. Seaton's 1912 Loeb translation for the opening card and the Melted Lead page, Hesiod's *Theogony* in H. G. Evelyn-White's 1914 Loeb translation for the Storm-Swift page, and Apollodorus's *Library* in Frazer's 1921 translation for the closing card. Seaton was first quoted in Chapter 7. Hesiod is not on the vision's list, but Evelyn-White's 1914 translation is public domain and Hesiod is where the Harpies are named for the wind; the vision's rule is public-domain translations, and the list names the ones used so far. Each quotation is checked word for word against the Project Gutenberg texts of Seaton (#830) and Evelyn-White (#348) and against Perseus's Frazer; the Argonautica's line numbers against the Greek on Perseus.
- **New layouts:** every Chapter 8 level is drawn new, not grown from an earlier level. The teaching levels and levels 4 to 9 began as sketches made for this chapter (a hooked hall, a pool with a channel, a burning hall, a fire court, a line of ice and so on) and were tuned with the solver to the gate and the ramp; level 10 began as a draft from a generator of random walled halls with the chapter's pieces, kept only when its beast was live and its shortest line took no catch, then tuned. `test/layouts.test.ts` holds every released level to it (the Chapter 7 redraw extended the check from walls to every feature: each cell that is not plain floor, by kind, leaving out filler walls): two levels repeat a layout when their features overlap by 0.42 or more, under all eight turns and flips and at every offset when the sizes differ by at most two. Matching cells were tried first, as the brief suggested (70 per cent), and dropped: floor is most of every level, so unrelated released levels agree on 70 to 85 per cent of their cells and the measure cannot tell them from copies. Chapter 8's levels overlap any other released level by 0.26 to 0.39 at most.
- **The tuning tools refuse long waits:** a shortest line that stands still for more than four turns in a row, or for more than a fifth of its turns, scores worse in the tuner, so no level is won by waiting out a hazard for a dozen turns. The gate does not ask this; it keeps the levels lively.
- **The ramp's start:** as in Chapters 6 and 7, measured within the chapter: level 4 clears the challenge bar (20 times the hardest teaching level) and the shared bar, and each level after it climbs 1.2 to 2.2 times. Level 10 stores more than Chapter 7's level 10 (114,683 as it first shipped, 93,443 since its redraw), and at most 2.2 times level 9.
- **Level 10's fire and water are walls of a kind:** its first draft held flippers and fire boots, and the every-piece rule refused them: the shortest line never needed them. They were taken out, so the pool and the burning hall in level 10 are barriers that Theseus and the beast must go round, while the Harpies still fly over the water and Talos's fire still runs through the flames.
- **Every piece matters, the beast is live:** the owner's two rules, as the `crete/gate-every-piece` branch states them (`uselessProblems`, `threatProblems`), hold on every level, every hazard included.

## The story

The chapter is the ring where the Harpies nest, under an open roof. The opening card finds the wind coming down through it, and recalls the Harpies leaving Iris for their den in Minoan Crete (*Argonautica* 2.298–300). The pages recall the Harpies named for the wind, Storm-swift and Swift-flier (*Theogony* 265–269), and Talos's fall, when a stone grazed his ankle and the ichor ran out like melted lead (*Argonautica* 4.1677–1681): the fire that runs these halls. The closing card finds the pack lighter and small quick footprints running off, and recalls the infant Hermes slipping out of his swaddling-bands to steal Apollo's cattle (Apollodorus 3.10.2): it points at Chapter 9's thief.

## Global constraints

- **Two new pieces:** the Harpy (`w`) and Talos's fire (`e`), each with its `facing:` word. Nothing from Chapter 9 appears: no thief, bomb, clone machine or red button.
- **Teaching levels 1–3** as in the rulings.
- **Challenge levels 4–10:**
  - Each clears the challenge bar and the shared bar, and `catchProblems`: no level needs a catch, to win or for the fewest moves.
  - Each stores 1.2 to 2.2 times the situations of the level before it (`RAMP`).
  - The measures, in situations stored:

    | Level | Title | Fewest moves | Stored | × the level before | Beast adds |
    |---|---|---|---|---|---|
    | 1 | The Harpy | 25 | 322 | | 14 |
    | 2 | Over the Water | 17 | 135 | | 6 |
    | 3 | Talos's Fire | 19 | 178 | | 6 |
    | 4 | The Storm Pool | 38 | 9,213 | 29 × level 1 | 25 |
    | 5 | The Burning Court | 31 | 12,562 | 1.36 | 9 |
    | 6 | Harpies on the Ice | 31 | 17,713 | 1.41 | 10 |
    | 7 | The Frozen Line | 36 | 22,347 | 1.26 | 25 |
    | 8 | The Snared Wing | 46 | 33,766 | 1.51 | 19 |
    | 9 | The Crossing Winds | 37 | 66,751 | 1.98 | 16 |
    | 10 | The Last Wind | 39 | 128,649 | 1.93 | 10 |
  - Level 4 stores at least 20 times as many as the hardest teaching level (322), and clears the shared bar for a chase level (6,000 stored, 30 moves).
  - Level 10 is the hardest. It stores more than Chapter 7's level 10.
  - No level hides a wall, so `HIDDEN` does not apply.
- **Every level** has a Minotaur and at least one Harpy or Talos's fire, and its intro counts them ("one Harpy", "two Harpies", "Talos's fire"). Both pieces appear in the challenge levels, and level 10 has both.
- **Size:** levels 1–9 fit 12 by 12. Level 10 is larger than the screen (14 by 13) but fits 20 by 20; it ends at a gate, and it has both new pieces (two Harpies and Talos's fire).
- **Pages:** level 9 holds "Storm-Swift" and level 10 holds "Melted Lead". Each lies off the shortest line, on a longer winning route.
- **Quotations** are word for word from Seaton's Apollonius, Evelyn-White's Hesiod and Frazer's Apollodorus, cited by line or section.
- **Music:** the title theme, unchanged.

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
