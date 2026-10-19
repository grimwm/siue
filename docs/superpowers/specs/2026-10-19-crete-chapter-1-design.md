# Crete Chapter 1: the outer halls and the campaign frame

Part of the Crete redesign (`2026-10-16-crete-redesign-vision.md`). The
engine and the eight trials (`2026-10-17-crete-engine-design.md`) are live.
This part turns the trials into the first chapter of the campaign and builds
what every later chapter reuses: chapter cards, a level list by chapter,
story pages and a Lore book. The level editor and chapters 2 to 10 come after
it, each with its own spec.

## Goal

A player opens Crete, meets a chapter card for "The Outer Halls", and plays
ten levels: the eight trials they know and two new ones. Story pages hidden
in the levels go into a Lore book. Clearing level 10 shows the chapter's
closing card and leaves Theseus at the sealed gate of the true Labyrinth.

## What the owner decided

- **Chapter 1 is the outer halls.** Theseus is already inside, holding
  Ariadne's thread. The trials are Daedalus's outer halls, a proving ground
  built to wear down each year's tribute before it reaches the beast. The
  chapter ends at a sealed gate; the true Labyrinth is behind it. Athens, the
  ship and Minos come in later chapters, through memory and pages.
- **Ten levels.** Levels 1 to 8 are today's trials, unchanged in play.
  Levels 9 and 10 are new:
  - **9, "The Bull's Horns":** getting caught on purpose. Safe zones line
    the hall; being caught costs a heart and throws Theseus back to the last
    safe zone without losing the ground behind it. The shortest win takes
    exactly one catch. Dirt appears here first: Theseus can walk on dirt and
    so can the Minotaur, so a sunk block opens a path for both.
  - **10, "The Great Hall":** the chapter's capstone, larger than the
    screen, so the view follows Theseus. It uses keys, gear, a block and a
    button, a tool and the Minotaur, has more than one route, and ends at the
    gate that leads on.
- **Trial 8 is renamed** (no longer "The Heart of the Labyrinth") and its
  intro is rewritten so it no longer ends the tribute.
- **Screens,** as in the approved mockup
  (`2026-10-19-crete-chapter-1-screens.html`, beside this file): a chapter
  card, a level list with chapter tabs, the level-cleared card with any page
  found, and a Lore book. Its words, codes and the "found in level 3" page are
  placeholders; codes are dropped (below). The screens extend the existing
  card, trial-list, menu and end-card styles.
- **Every level is open from the start.** Nothing is locked.
- **No level codes.** The list opens any level, and progress stays in each
  browser. (This replaces the vision's 4-letter codes.)
- **Writing:** Claude drafts the text; the owner reads and edits it before
  the chapter ships (vision, Writing).

## What players get

### Chapter card

A card in Crete's existing card style: kicker "Chapter 1 of 10", the
chapter's name, a short paragraph in the myth's voice, and one quotation from
a public-domain translation with its citation (author, work, section,
translator, year). Buttons: **Enter the halls** (Enter) and **Levels** (L).

- The opening card shows when level 1 of a chapter is started from the title
  card or the level list, and every time that happens (it is short and
  dismissed with one key).
- The closing card, with its own paragraph and quotation, shows after level
  10 is won, before the usual win card's buttons are reachable. It names what
  comes next ("Chapter 2 is not yet released") without promising a date.
- Both cards can be read again from the Lore book.

### Level list

Replaces "The Eight Trials". Kicker "The Island of Crete", title "Levels".

- A row of chapter tabs. Chapter 1 is the only released one; tabs 2 to 10
  show the chapter number and "soon" and cannot be opened. (Claude's call:
  showing the ten tabs tells the player how big the campaign is.)
- One row per level: number, title, and this browser's status ("cleared ·
  best 14 moves", "cleared with help", "not yet"). The level in play is
  outlined, as today.
- Every row opens its level.
- Q and Close behave as the trial list does today.

### Level start and level cleared

- The start card is today's, with the level number and chapter in the kicker
  ("Chapter 1 · Level 3").
- The win card is today's, with two additions: a line for each story page
  taken in this win ("You found a page: <title>. It is in the Lore book."),
  and after level 10 the closing chapter card first. Its **Next** goes to the
  next level of the chapter; after level 10 there is no Next.

### Story pages

- A page is the existing `page` object (`p` in the level grid). Walking onto
  it takes it, as today.
- A page counts as found when a level is won holding it. A loss, undo past
  it or restart gives it back. A win with help still counts the page: the
  help mark is for the move score, not the story. (Claude's call.)
- Each page has an id, a title, its text, and an optional quotation with its
  citation. Pages are placed on the harder or out-of-the-way route, so they
  are something to go after rather than a toll.
- Chapter 1 has two pages, one in level 9 and one in level 10, so levels 1
  to 8 stay exactly as they are. (Claude's call: enough to show the idea
  without front-loading the lore.)
- Which page a `p` cell holds is named in the level's header, in the grid's
  reading order (left to right, top to bottom). A level may hold more than
  one page. The engine records which pages were taken (a set or bitmask in
  place of today's count, and in the solver's state key), not only how many.
- The Lore book's hint for a missing page ("hides in level 9") comes from the
  levels that name that page, not from text in the lore file.

### Lore book

A new entry in the Q menu, "Lore book".

- Grouped by chapter: the chapter's opening card, each page found (title, and
  the level it came from), and the closing card once level 10 is won.
- A page not yet found shows as a blank with the levels it hides in
  ("somewhere in levels 6–10"), so the player knows it exists.
- Chapters not yet released show one line saying so. The released chapters,
  the "soon" tabs and the closing card's "Chapter 2 is not yet released" all
  come from one list of chapters in the data, so releasing a chapter is a
  data change.
- Opening an entry shows its full text, with its quotation and citation.
- Endings chosen by pages found are a later chapter's job; Chapter 1 only
  keeps the count.

### The board that is bigger than the screen

Level 10 is larger than the screen at Crete's smallest comfortable cell
size, so the board scrolls:

- The view keeps Theseus inside a margin of the visible area and moves when
  he leaves it, without jumping on every step; the Minotaur may be off screen.
- Slides, carries and the thread's drawn route still show; following the
  thread (T) keeps Theseus in view.
- Levels that fit stay exactly as they are drawn today.
- The cell-size threshold that triggers scrolling is the builder's call; on
  a phone in portrait, level 10 must scroll and levels 1 to 8 must not.

## The words

All player-facing text for Chapter 1 lives in one lore file per chapter in
the game's source (format is the builder's call: something the owner can
edit by hand, and that a test can load). It holds:

- the opening and closing chapter cards (paragraph, quotation, citation);
- each page (id, title, text, optional quotation and citation);
- the new titles and intros for trial 8 and levels 9 and 10 stay in the level
  text, where intros live today.

Rules for the words:

- **Quotations are word for word** from the public-domain translations the
  vision lists (Plutarch/Perrin 1914, Ovid/More 1922, Apollodorus/Frazer
  1921, Catullus 64 in a public-domain translation, Hawthorne 1853). Each is
  checked against the source text before it ships, and its citation names the
  section. A modern translation is paraphrased, never quoted.
- Our own text is in the voice of today's intros and story card: plain,
  second person in intros, short.
- Chapter 1 does not tell the meta twist; at most one page hints that the
  halls "move at night".
- Claude drafts; the owner edits in the same pull request before it merges.
- The builder may fetch the public-domain source texts (Project Gutenberg,
  Perseus) to check each quotation. A quotation that cannot be checked word
  for word does not ship; the card or page goes out without one.

## Progress

- Stored as today (`crete-progress`, this browser only), keyed by level id.
  The eight trials keep their ids so a player's existing clears and bests
  carry over; the new levels get new ids in the same scheme.
- Found pages are stored under their own key (for example
  `crete-pages`), never inside `crete-progress`, whose validation would read
  a changed shape as empty and wipe a player's clears. Blocked or unreadable
  storage reads as empty, as today.
- The title card's **Play** opens the opening chapter card. A player with any
  progress may also open the level list. (Claude's call.)
- A `?seed=` link still opens level 1, now through the chapter card.

## Levels 9 and 10

- Both are written in the existing level text format and proved winnable by
  the solver in the test suite, like the trials.
- Level 9 starts with 3 hearts. Its test also checks the lesson: the
  solver's shortest winning route loses exactly one heart to a catch, and
  every catch-free winning route is strictly longer (or none exists). The
  catch-free check is a second search that treats a catch as a dead end.
- Level 10's test proves it winnable and that more than one route reaches the
  exit (for example, two winning routes that differ in which key or gear they
  use).
- Level 10 is at least 14 columns wide, so on a 390-pixel-wide phone in
  portrait it cannot fit at the smallest comfortable cell and must scroll
  (the largest trial is 12 × 10).
- The solver must prove level 10 winnable in the test suite. The proof wins
  any conflict: cut mechanics or route branches before giving it up. The test
  may pass a larger state cap than `SOLVER_CAP` if the run stays within the
  suite's usual time; the in-game help keeps its cap.
- Like the trials, layouts may be found by search and then tuned by hand; the
  owner plays both before the chapter ships and may ask for redraws.

## Audio

Page pickup already has a sound. A sound for the chapter card opening uses
Crete's existing synth. Chapter music waits for the music pipeline, which the
owner has put on hold; Chapter 1 ships without it. (Claude's call, following
the owner's "we can finish music later".)

## Not in this part

- The level editor and share links (its own spec next).
- Chapters 2 to 10, endings, and the meta reveal.
- Chapter music.
- Endless mode.

## How it is checked

- Unit tests: the lore file loads and every page id a level names exists;
  every quotation has a citation; page found only on a win; progress for the
  eight trial ids carries over; the level list rows; scrolling keeps the
  player inside the margin.
- Solver tests for levels 9 and 10, as above.
- An end-to-end check in a real browser (the repo's `make e2e` path): start
  from the title, see the chapter card, play level 1 through the list, take a
  page in a test level and win, see it in the Lore book, and on a phone-sized
  viewport see level 10 scroll as Theseus moves.
- The owner plays levels 9 and 10 and reads all the text before merge.
