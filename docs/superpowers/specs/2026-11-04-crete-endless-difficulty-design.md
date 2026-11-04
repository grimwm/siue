# Crete: Endless at three difficulties

**Goal:** rebuild Crete's Endless so that every level is a real puzzle at every depth. Endless gets three
difficulties, Easy, Medium and Hard. No level may fall to a habit player. Mazes are corridors, with open space only
where it earns its place. Hidden walls come back. Runs climb by a difficulty score that tracks what people find hard.
The level editor's Check rates a level on the same scale, with the same functions.

**From:** the owner's approved design page (`endless-difficulty.html`: findings, the design, three questions, all
answered), the strategy probe behind it (`results.md`, with its scripts), and the owner's rulings listed below.

## What the probe found

- 29% of Endless levels (bank and fresh) fall to a simple habit player, mostly "set the cow down at once and walk";
  12% of campaign levels do.
- `explored`, the solver's stored situations that Endless climbed by, does not predict difficulty. Its Spearman
  correlation with the number of habits that win is +0.19 on Endless (the wrong way), and its AUC for telling apart
  the levels no habit wins is 0.36, worse than chance.
- Endless was far too open: 92% of its floor sat in open 2 × 2 blocks, against 63% in the campaign.
- The gate's plain walk (`naiveWins`) walks through the Minotaur, so the walk that steps round him was never tried.
  That walk wins bank level 35 and campaign 7-8.
- Hidden walls almost never came: the bank had none, and new ones could only fall in about levels 2 to 4.

## The owner's rulings

1. **The card** offers Easy, Medium (the default) and Hard. Each has its own saved run and best. A seed link names
   its difficulty, `&difficulty=hard`, beside `&tier=`, the pieces; a link without one plays Medium. The same seed,
   tier and difficulty make the same levels on every device. A run saved before this ships is dropped; the old best
   becomes Easy's best when Easy has none.
2. **Every difficulty blocks habits.** No habit player wins, at Easy too; Easy only climbs lower.
3. **Mazes are complex at every difficulty and depth.** Drafts are corridor mazes with turns, loops and dead ends.
   Open space earns its place, and the floor's open share has a hard ceiling.
4. **Hidden walls** come in about one level in five once the tier has them, each set easier than its neighbours, at
   every depth. The banks hold hidden-wall levels.
5. **The cow.** In Hard it is rare and, when present, needed at the right moment: setting it down as soon as it is
   held loses, and without it the level is lost or longer. In Easy and Medium a cow or mirror is needed too; the
   habit gate covers the moment.
6. **A new difficulty score** from what predicts human difficulty; Endless climbs by it, with `explored` only a
   floor. Easy plateaus around a middle chapter's hardest levels, Medium around Chapters 8 to 10's hardest, Hard
   well past them, and the ramp still applies.
7. **Phones.** Each difficulty has its own bank, so a run's first level is instant. Background generation keeps
   working per difficulty. Generation time is measured at a 4× CPU throttle, and no run may stall.
8. **Piece coverage.** A test checks that every piece a tier unlocks appears across a sample of seeds per difficulty.
9. **The campaign is measured, not failed.** The habit and openness checks are functions the campaign can use later;
   no campaign level fails them yet. Chapter 1 is never changed.
10. **The editor rates levels.** When Check finishes, it shows the level's band ("Too Easy", "Easy", "Medium",
    "Hard" or "Beyond Hard"), its score and the score's parts in plain words, and every rule it fails, named by
    cause. It uses the same functions as the Endless gate, so the two always agree. Check keeps its Stop and its
    progress bar, and the new checks respect Stop.

## The habit players (`src/puzzle/habits.ts`)

These are the probe's nine strategies, made deterministic and moved into the engine. Each walks the shortest plain
path on the board as the player sees it: fake walls look like walls, unshown invisible walls like floor. The path is
recomputed every turn and steps round the Minotaur's cell while a way round exists. It fetches the tool it uses, then
the nearest needed relic (else anything to take), then the exit. It avoids hazards, the cell each faces, bombs and
thieves, and eats a cake at one heart. A move it cannot make becomes a wait. The habits:

| Habit | Name in code | What it adds |
| --- | --- | --- |
| a | `walk` | nothing: the step-around walk |
| b | `cowAtOnce` | sets the cow down as soon as it holds it |
| c | `cowNear` | sets the cow down when the Minotaur is within 3 |
| d | `mirrorNear` | raises the mirror when he is within 2 |
| e | `toolsNear` | c and d |
| f | `careful` | takes the safe step that keeps the plain distance shortest when its next step would be caught (1-ply) |
| g | `carefulTools` | f, c and d |
| h | `cowStuck` | sets the cow down where, after 10 waits, the Minotaur is still stuck short of it |
| i | `cowStuckCareful` | h, d and f |

A habit wins by reaching the exit within 4 × fewest + 50 turns, with catches allowed as in the game.
`habitProblems` fails a level that any habit wins. The plain walk through the Minotaur (`naiveWins`) stays in the
shared bar.

## The difficulty score (`src/puzzle/rating.ts`)

It is read off the solver's best line:

- **detour**: the moves the Minotaur adds, `minotaurDelta` (best line less the best beast-free line);
- **off route**: the best line's moves after which the beast-free distance to the win does not fall by one (a
  beast-free solve from each turn; a capped solve counts as on the route). Their excess adds up to the detour, so a
  level with few long detours and one with many short ones are told apart;
- **away**: moves after which the plain distance to the next goal (the next relic, else the exit) grows;
- **waits** on the line;
- **traps**: at every third turn of the line, each other step that is not caught at once but leaves no catch-free
  win (the solver proves it, capped at the level's own situations and at least 6,000; a capped search is no trap);
- **forced**: turns where exactly one step (a move or a wait) is not caught at once.

**Score = detour + off route + 2 × away + 3 × waits + 3 × traps + 4 × forced.**

**Calibration.** The parts were measured on all 100 campaign levels and the 41 old bank levels
(`tools/scratch/features.ts`, kept out of the repository). The weights scale each part so that it counts about as much
as the others on a typical challenge level (challenge medians: detour 13, off route 7, away 7, waits 0, traps 4,
forced 1). Among those weightings, this one best tells apart the levels no habit wins:

| Signal | AUC, all levels | AUC, old bank |
| --- | --- | --- |
| `explored` | 0.51 | 0.36 |
| detour | 0.68 | 0.60 |
| off route | 0.63 | 0.50 |
| away | 0.70 | 0.58 |
| waits | 0.61 | 0.63 |
| traps | 0.75 | 0.78 |
| forced | 0.71 | 0.70 |
| **the score** | **0.79** | **0.78** |

Against the campaign's order, no part tracks position well (Spearman with chapter and level, challenge levels:
`explored` 0.49, because the campaign was tuned on it; the score 0.05). The campaign's order is a designer's ramp
on `explored`, not a measure of people, so the bands below anchor on the chapters' hardest levels, not on their
order.

Campaign challenge levels by chapter, sorted (score):

| Chapter | Scores |
| --- | --- |
| 2 | 30 34 39 52 53 56 67 |
| 3 | 41 45 46 59 59 61 111 |
| 4 | 48 51 58 60 63 69 135 |
| 5 | 36 39 43 43 53 58 79 |
| 6 | 35 43 62 66 67 69 69 |
| 7 | 19 30 36 48 55 75 75 |
| 8 | 57 61 63 72 103 110 119 |
| 9 | 34 41 44 51 67 89 121 |
| 10 | 22 26 36 36 39 67 67 |

## The grades and the climb (`src/endless/gate.ts`)

| Grade | First level | Plateau |
| --- | --- | --- |
| Easy | 25 to 40 | 45 to 70 |
| Medium | 35 to 55 | 70 to 110 |
| Hard | 50 to 75 | 110 to 170 |

- **Easy's plateau** is a middle chapter's hardest: Chapters 4 to 6's last three score 45 to 79, Chapter 5's 53,
  58 and 79.
- **Medium's** is the campaign's hardest: Chapters 8 to 10's last three each score 47 to 121, with 89 in the middle.
- **Hard's** starts above all of those but three (Chapter 8's 110 and 119, Chapter 9's 121).
- **The climb.** Each plain level scores 1.1 to 1.35 times the last plain level before it (`CLIMB`), and never under
  4 points of room, until its band reaches the plateau. A score climb has no cliff: the steepest step, 1.35, is under
  the campaign's `RAMP.most` of 2.2.
- **Hidden walls.** At each depth after the first, a level hides walls when the seed says so: one depth in
  `HIDDEN_EVERY` (5), from `hash(seed, tier, grade, depth)`, once the tier has fake and invisible walls. Its band is
  `HIDDEN_EASE` (0.7 to 0.9) times the low end of the band its place would give a plain level, so it is set easier
  than its neighbours, plateau included. It still stores no more than `HIDDEN.most` (20,000). The climb goes on from
  the last plain level, so the level after a hidden one is no cliff from where the run stood. This replaces "never
  on the plateau".
- **The floor.** Every Endless level stores at least `FLOOR` situations (2,000), and Endless reads the shared bar
  with that floor. Maze corridors make long, hard lines from small searches. Raw maze drafts score 100 to 300 at
  450 to 7,000 situations, and at a 6,000 floor most maze drafts that passed every other check failed. The floor
  keeps out trivial searches; the score and the habits keep out easy levels. No level stores more than
  `EXPLORED_MOST` (30,000), so a phone can make and check it; past that the climb's solve stops at its cap.
- **The challenge bar** (`challengeProblems` with the chapter's teaching levels) still holds the Minotaur's 8
  moves, the line ignoring him losing, and a line no shorter than the chapter's longest teaching line. Its
  situations part is read at `FLOOR`.

## Mazes and open space

- **Drafts** (`src/endless/draft.ts`) are corridor mazes on a lattice (cells on odd rows and columns), 13 or 15 a
  side, 15 for bands from 60 up. They are grown as a growing tree that picks its newest cell with chance `winding`
  (0.3 to 0.9, long winding corridors) and a random one otherwise (many branches). Then a share `braid` (0.45 to
  0.95) of dead ends is broken through into a neighbour, making loops, without leaving any wall standing alone.
  About one draft in seven opens a 3 × 3 chamber.
- **Pieces.** Doors, gravel, pop-ups, thieves and toggle walls go on passages, the opened walls between two cells.
  A fake wall goes on a closed passage more often than not: a hidden shortcut. Water, fire, ice and force floors
  fill a straight run of two to four corridor cells. Relics prefer dead ends.
- **Placement.** Theseus comes first. The exit is among the third of border openings farthest from him, the relics
  in the farther half of the maze, and the beast a quarter to three fifths of the way out. The way then never runs
  back past the start, where a catch throws Theseus, so a catch is never a shortcut. Before this rule, the solver's
  best line took a catch in about two drafts in three.
- **Tidy.** Endless's tidy check allows a maze's dead-end corridors: a bare dead end is a fault only when it is a
  one-cell nub off a wider space.
- **New layouts.** Every lattice maze has a wall on each corner of its lattice (even row and column), so Endless's
  likeness check leaves those cells out on both sides (`mazeFeaturesOf`). Counted, half of all maze drafts looked
  like a campaign level.
- **Openness** (`openness`, `openProblems`):
  - *The ceiling.* At most `OPEN.most` (0.5) of the open cells may lie in a fully open 2 × 2 block. Across the
    campaign the share's quartiles are 0.53, 0.72 and 0.82 (challenge levels: 0.66, 0.78 and 0.85), and the old
    Endless sat at 0.92. 0.5 sits under the campaign's lower quartile: corridors, not rooms, make up most of every
    Endless level.
  - *Open areas earn their place.* Each open area (connected open 2 × 2 blocks) of 6 cells or more is walled into
    corridors (`walledIn`: a wall on each plain empty floor cell at an even row and column, which leaves no 2 × 2
    block open and every cell joined). If the walled level is still won and scores at least as high, the area fails.
    It stays only when walling it in makes the level easier or lost.

## The tools and the cow (`toolProblems`)

- **A cow or a mirror is needed.** Without it the level is lost, or its catch-free fewest moves go up. The habit
  gate covers the moment: the cow set down at once, when he is near, or where he is stuck, and the mirror when he is
  near, all lose.
- **Hard's cow.** Following the best line to the first turn the cow is held and setting it down at once leaves no
  catch-free win. Hard drafts take the cow family in about one draft in eight (`COW_HARD`), so the cow is rare.

## The gate's order

`levelChecks` in `src/endless/gate.ts` holds every rule that does not depend on the run, in order of cost:

1. the challenge bar as a challenge level of its chapter;
2. the shared bar at `FLOOR`;
3. a live beast (`threatProblems`, challenge);
4. the hidden-wall ceiling;
5. nothing under a figure;
6. a tidy maze;
7. no habit win;
8. the score;
9. open space;
10. the tools;
11. every piece's purpose.

The Endless gate stops at the first failure. The editor's rating runs them all. The run's own checks (the
`EXPLORED_MOST` ceiling, a new layout against the campaign and the run's last twelve levels, and the score's band)
come around them in `gateProblems`. `purposeProblems` gains `purposing`, the same check in steps, so the editor can
stop between pieces.

The climb (`distance` in `src/endless/generate.ts`) takes the cheap checks, then one capped solve: the floor, the
line's length, no catch on it, a live beast. Then one solve without the beast: he adds 8 and ignoring him loses.
Then the habit players (each one that wins puts the draft further off), then the real score against the band. A
draft that passes goes through the whole gate. A useless piece is stripped and the climb goes on.

## Saved runs, links and the card

- **Storage.** `crete-endless-easy`, `-medium` and `-hard` each hold a run, a best and an upcoming run;
  `crete-endless-grade` holds the grade last chosen. The old `crete-endless` is never written again. Its best is
  read once as Easy's starting best, and its run is dropped.
- **Levels.** A run level keeps its score; the next level's band climbs from the last plain one.
- **The card** shows Easy, Medium and Hard as three pressed-state buttons (the Levels card's chapter tabs) under its
  first line. The run, its ready levels and "Your deepest on Medium: Level N" follow the grade shown. Continue and
  New Run act on it.
- **Links.** Copy Seed Link writes `?seed=…&tier=…&difficulty=…`. A link opens the card on its grade, Medium when
  it names none or something else, and its button says the grade.
- **The start card** says "Seed abc, Hard. The fewest moves are N."
- **Background generation** (`ahead`) makes the shown grade's saved run's next levels, or its upcoming run's. A run
  in play keeps its own grade for wins and Next Level, whatever the card shows.
- **The request** carries `grade`, and the seed's draws include it, so each grade makes its own levels.

## Banks (`tools/endless-bank.ts`, `src/endless/bank.ts`)

`BANKS` holds one bank per grade, each level with its score. `tools/endless-bank.ts fill <lane> <lanes> <dir>` works
through `JOBS`, a grade, chapter, family and band each:

- every family of every chapter at least once per grade, the cow included in Hard, so a Hard bank still teaches
  that it exists;
- ten Chapter 1 levels per grade over the first and climbing bands and the plateau, so tier 1 has a run;
- hidden-wall levels at hidden bands;
- extra plateau levels.

`fromBank` picks from the band, a hidden-wall level for a hidden place, then within the climb from the last plain
level, then on the plateau.

## The editor's rating

`rate`, a new solver-worker search kind, measures the level, then runs `rating` (`levelChecks` with every rule, at
the grade of the band the score falls in) in batches, so Stop and the progress bar work as before. Searches are
capped at `CHECK_CAP` (4 × `EXPLORED_MOST`) as in the gate. Its answer is cached like a measure's.

The Check panel adds, under the solver's lines:

- "Endless rating", then the band in bold;
- "Score N: detour forced by the Minotaur D (O moves off the free route), A moves away from the goal, W waits,
  T traps, F forced moves";
- the failed rules as a quiet list, for example "The cow habit wins: setting the cow down at once and walking
  clears it", "Too open: 85% of the floor is open space (at most 50%)", "A useless piece: the red doors".

The strip adds " · Medium", or " · Medium, not for Endless" when a rule fails. The bands are `BAND_FROM`: under 25
Too Easy, 25 to 69 Easy, 70 to 109 Medium, 110 to 170 Hard, past 170 Beyond Hard.

## The campaign: measured only

`habitProblems`, `openness`, `openProblems` and `scoring` are exported for the campaign. `test/difficulty.test.ts`
gains a report-only test that runs the habit and openness checks over the released levels and fails nothing, so a
later redraw has its list. Chapter 1 is left alone.

## Engine-same

The campaign's recorded measures stay bit for bit. The bank parts and the Endless searches are recorded again: the
banks are new, and the searches carry a grade.

## Generation time on phones

Generation time is measured with `tools/endless-bench.ts` under `systemd-run -p CPUQuota=25%`, one core at a quarter
speed, which is a 4× throttle of the worker's JavaScript. Chrome's CPU throttling does not reach a worker. The plan
records the numbers and the budget they led to.
