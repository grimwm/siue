# Crete shell: controls inside the game frame

Part 1 of the Crete redesign (`2026-10-16-crete-redesign-vision.md`). It moves
every control into one game frame, the way Tankity's are, and changes no rule
of today's game.

## Goal

The page is the game: one frame that fills the window, with a status bar, the
maze and a control strip, a title card and a menu on Q. Nothing sits outside
the frame. Buttons carry key tabs that share one look with Tankity's.

## Layout

The frame (`#frame`, a size container) fills the viewport and stacks:

- **Status bar** (top): HP, Turns, Pages, Score, Fuses, Bash (its recharge),
  the Minotaur's distance, and a Menu button with its Q tab.
- **Maze** (middle): drawn at the largest whole cell size that fits the space
  left, centred. A one-line toast over the maze's foot shows the newest story
  log line and fades; the full log is in the menu.
- **Control strip** (bottom): the move pad (▲◀▼▶) and the actions: Hint (H),
  Route (V), Auto (T), Bash (Space), and the three tools (Z, X, C) with their
  counts. Each button has a key tab.

The header, the side panels, the help panel and the seed form are removed from
the page; their content moves into the title card and the menu.

**Phones.** Portrait stacks the status bar in two rows and the strip under the
maze. Landscape floats the move pad and the actions over the maze's lower
corners. No layout scrolls the page or puts a control off screen.

## Title card

Shown over the dimmed maze when the page opens, after Quit, and when a run
ends (under the ending card's Again). It holds Play (a run on a random seed),
Story (a short intro in the myth's voice: Minos, the Labyrinth, the tribute
ship arriving), Settings (opens the menu) and the kit's Install bar.

## Menu

Q or the Menu button opens it; Q closes whatever is open (menu, story,
ending). Esc is never bound and never leaves full screen. Contents, in order:

1. Seed box with Play this seed, and Random seed.
2. Sound (M) and Fullscreen (the kit's `toggleFullscreen`).
3. Story log: the run's full log.
4. How to play: today's help text, its key names filled from the key table.
5. Quit: ends the run and returns to the title card; an installed app closes
   or says how (`_kit/app.ts`).

Sound and Fullscreen are remembered in this browser through the kit's prefs.
New run (N) keeps working from anywhere.

## Key tabs

The kit stylesheet gains `.kit-key-tab` (with `--kit-key-tab-*` properties):
Tankity's tab look, a small bold label in a dark rounded box pinned to a
button's top corner, zero specificity through `:where()`. `KeyChip` takes a
`variant: 'chip' | 'tab'` so a button can wear either. Crete opts in to the
kit sheet already and uses tabs on the strip and the Menu button. Tankity
switches its `.key` rule to `.kit-key-tab` in the same PR, keeping its
current size and colours through the custom properties, so the two games
share one look; `tankity-layout.spec.ts` must pass unchanged.

Labels come from Crete's key table, as today, so a tab can never disagree with
its binding. Tabs are hidden on touch screens and below a frame width of
760 px, Tankity's rule.

## Code

- `index.html`: the frame markup replaces the header, panels and form.
- `game.css`: the frame layout, breakpoints and phone layouts.
- `src/ui.ts`: the toast, the strip's counts, and the menu and title wiring;
  the engine and its hooks do not change.
- `src/ui/title.tsx` (exists): the title card gains Story and Settings.
- `src/ui/menu.tsx` (new): the menu, drawn with the kit's `Dialog`.
- `_kit/kit.css`, `_kit/ui/key-chip.tsx`: the tab variant.
- `tankity/game.css` and its chip call sites: `.key` becomes `.kit-key-tab`.
- READMEs (Crete's controls and layout, the kit stylesheet): current state.

## Tests

- Unit: every strip button's tab label matches the key table; the menu's
  order; Q closes the open layer; no handler binds Esc; prefs round-trip.
- Kit: `kit-css.test.ts` covers the tab rule; `KeyChip` variants.
- Browser: `crete-play.spec.ts` drives runs through the strip and the menu;
  a new `crete-layout.spec.ts` measures phone portrait and landscape, tablet
  and desktop: no page scroll, every control inside the viewport, the maze at
  least 8 px per cell, tabs hidden on touch. `tankity-layout.spec.ts`
  unchanged and green.
- The fullscreen regression tests keep proving Esc never exits full screen.

## Out of scope

Any change to rules, mazes, the creature or scoring (part 2), levels and lore
text beyond the title card's intro (part 3).
