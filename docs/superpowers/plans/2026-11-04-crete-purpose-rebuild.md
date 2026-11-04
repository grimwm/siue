# Crete: every piece has a purpose, in the campaign

**Goal:** hold every campaign level to the every-piece rule Endless uses (`purposeProblems` in `src/puzzle/difficulty.ts`), and rebuild the 30 levels that broke it, keeping each level's id, its chapter's teaching levels and story pages, and the whole gate.

**From:** `plans/2026-11-03-crete-endless.md` ("Every piece has a purpose a player sees"), and the owner's word: "If any of the existing levels need to be rebuilt so that everything serves a purpose, do that too."

## The rule

A piece, or a linked pair (a colour's keys and doors, a snare and its brown buttons, the toggle walls and their button), has a purpose when either:

- **(a)** the solver's shortest line uses it: walks through a door of the key's colour, wears the gear on its ground, raises the mirror, sets down the cow, takes a spare relic, pushes a block, presses a button, crosses a tile, holds the beast in a snare; or
- **(b)** taking it out (every way `pieceUnits` tries) makes the level unwinnable or changes its fewest moves, with a catch or without.

A piece whose loss only shrinks the search is a decoy and fails. `test/difficulty.test.ts` checks `purposeProblems` on every released level; it replaces the campaign's check of `uselessProblems`. A moving hazard is never "used" by the line, so it always needs (b).

## Rulings

- **No exemptions.** All 30 levels were challenge levels; no teaching level failed, so none needed one.
- **A decoy is put to use where it can be, else taken out.** A tuning search (moves of pieces and walls, scored by the whole gate in place: the challenge bar against the chapter's teaching levels, the shared bar, a live beast, no catch, the hidden band, nothing under a figure, a layout new against every other level at the 0.42 limit, the pages off the shortest line and on a longer winning one, each chapter test's own rules, and the purpose rule) started from each level as it was, then from the level with its decoys taken out. 21 levels kept every piece and now use it; 9 lost a piece the search could not give a use (ch2-9 and ch10-10 the cow, ch4-10 the east painted wall, ch5-10 the red key and door, ch7-4 the skates, ch7-10 the fire boots, ch8-5 the red key and door, ch9-4 a block and the gravel, ch9-7 the red key). Each intro that named a lost or moved piece says what the level holds now.
- **A door with no key is a wall.** ch9-7's key went, and its door then played exactly as a wall, so it is one.
- **Second roads are gone.** ch3-10, ch4-10 and ch5-10 each had a second road the shortest line never took; under the rule its pieces are decoys. ch3-10's red door is now the one way into the west hall, ch4-10 lost the painted wall in the east, and ch5-10 has one road, east past a snare the block holds open, with a second snare that holds the beast. Their chapter tests say so.
- **The ramp held without moving any level that passed.** Each rebuilt level was tuned in chapter order into the band its neighbours leave (1.2 to 2.2 times the one before it and within 2.2 of the one after, 1.1 to 1.5 and at most 20,000 for a level that hides walls), so no passing level had to change.
- **The chapter tests follow the rule.** Chapters 7 and 8 checked that taking every hazard off at once changes the level, or shrinks the search 1.3 times; they now check each hazard alone by the rule's (b). The fewest table (`src/campaign/fewest.ts`) and each chapter test's pinned lines are solved again, and `test/engine-same/` is recorded again for the rebuilt levels.

## Before and after

| Level | Decoy before | Fix | Fewest before → after | Situations before → after |
| --- | --- | --- | --- | --- |
| trial-9 | the block | block moved into the north hall, where the line pushes it | 43 → 43 | 16,596 → 13,906 |
| ch2-5 | the skates | ice redrawn; the line takes the skates and skates the ice | 45 → 54 | 9,817 → 10,009 |
| ch2-6 | the block | fire and gravel moved; the block now holds the beast back (the fewest moves change without it) | 60 → 60 | 12,622 → 12,906 |
| ch2-9 | the cow | cow taken out (intro too); layout redrawn round the mirror, which the line raises | 54 → 52 | 34,389 → 34,035 |
| ch3-4 | the red key and door | rooms redrawn; the line takes the key and opens the door | 49 → 41 | 7,289 → 6,245 |
| ch3-7 | the block; the toggle walls and button | rooms redrawn; the line pushes the block and presses the button | 37 → 33 | 14,391 → 16,785 |
| ch3-8 | the marked stones | rooms redrawn; the line crosses the marked stones | 52 → 47 | 22,932 → 23,508 |
| ch3-10 | the red key and door | the red door is now the one way into the west hall (intro and test too) | 78 → 80 | 53,285 → 48,169 |
| ch4-5 | the red key; a fake wall | rooms redrawn; the line opens the red door and one painted wall, the other holds the beast | 42 → 42 | 8,723 → 8,357 |
| ch4-6 | the pop-up walls | rooms redrawn; the line raises a pop-up wall | 44 → 45 | 10,427 → 9,645 |
| ch4-7 | the skates | ice and a painted wall moved; the line skates the ice (intro too) | 55 → 57 | 12,320 → 10,825 |
| ch4-9 | a fake wall | one wall opened; the painted wall now changes the fewest moves | 58 → 57 | 15,929 → 15,648 |
| ch4-10 | the east fake wall | the painted wall in the east taken out, the second road with it (intro and test too) | 91 → 85 | 18,005 → 19,293 |
| ch5-5 | the block | rooms redrawn; the line pushes the block | 43 → 46 | 12,966 → 11,145 |
| ch5-7 | the red key; a block | rooms redrawn; the line takes the key and pushes the block | 44 → 43 | 23,613 → 23,778 |
| ch5-8 | the gravel | gravel and a relic moved; the line crosses the gravel | 49 → 45 | 32,069 → 28,646 |
| ch5-10 | the block (a second road, never the quick one) | the red key and door taken out; one road east, past a snare the block holds open on the brown button, and a second snare in the east room that holds the beast (intro and test too) | 66 → 75 | 54,608 → 48,242 |
| ch6-4 | the suction boots | currents redrawn; the line walks the currents in the boots | 37 → 34 | 6,729 → 7,639 |
| ch7-4 | the skates | skates taken out (intro too); walls redrawn | 33 → 33 | 7,765 → 6,016 |
| ch7-8 | the suction boots | currents and gravel redrawn; the line walks the currents in the boots | 30 → 31 | 33,254 → 27,621 |
| ch7-9 | the bronze ball | rooms redrawn; the ball now changes the fewest moves | 40 → 45 | 51,674 → 43,190 |
| ch7-10 | the fire boots; the bronze ball | boots taken out, the fire a wall to both; the ball moved to the south hall, where it changes the fewest moves (intro too) | 51 → 55 | 93,443 → 52,391 |
| ch8-5 | the red key and door | key and door taken out (intro too); fire redrawn | 31 → 30 | 12,562 → 11,073 |
| ch8-9 | the suction boots, currents and Talos's fire | fire and walls redrawn; each now changes the fewest moves | 37 → 42 | 66,751 → 67,223 |
| ch9-4 | a block; the gravel | block and gravel taken out (intro too); pool redrawn | 35 → 42 | 12,516 → 10,062 |
| ch9-7 | the red key | key taken out and its door walled (intro too); ice room redrawn | 42 → 39 | 42,387 → 40,704 |
| ch9-8 | the bomb; the clone machine | the red button and the bomb moved; the line presses the button | 43 → 47 | 65,017 → 69,092 |
| ch9-10 | the clone machine | the red button, the clone machine and the Harpy moved; the line presses the button (intro too) | 53 → 60 | 179,963 → 149,484 |
| ch10-6 | a block; the thief | rooms redrawn; the line pushes the block and crosses the thief | 40 → 42 | 33,221 → 31,438 |
| ch10-10 | the cow | cow taken out (intro too); rooms redrawn; the snare still holds the beast | 48 → 60 | 180,046 → 141,191 |
