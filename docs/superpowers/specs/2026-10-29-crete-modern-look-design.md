# Crete: the modern look

Part of the Crete redesign (`2026-10-16-crete-redesign-vision.md`). Today the
board is a 2D canvas painted from a sprite atlas that Blender renders
(`fx/blender/render_tiles.py` → `fx/sprites/tiles.{png,json}`). This adds a
second look: a painted 3D board the player can turn and pan. Today's board
stays, unchanged, as the Classic look.

The owner approved the direction from a live sample
(https://claude.ai/artifact/YBKVNnoYpYn9hiiDYt6fSK) and asked for it to be
built ("we can always iterate if the working product should change later").

## Why

The puzzles stay the point. The modern look gives the Labyrinth atmosphere —
torchlit stone, an oil-painted finish, a Diablo 1/2 feel — while staying calm
and readable. Players who prefer the flat board keep it.

## Decided by the owner

- **Two looks.** *Modern* (the default) and *Classic*. Classic looks exactly
  like today's game: today's sprites, draw order and animation. The switch is
  easy to find: in the menu and on the title card, and it is remembered like
  the other settings.
- **Feel.** Diablo 1/2, oil-painted, relaxing. Figures stand still between
  moves, as in Chip's Challenge; any movement is subtle.
- **Active tiles loop.** Water, fire, torches and the like get smooth, subtle
  loops.
- **Camera angle.** The camera always looks down at **45°**. There is no tilt.
- **Zoom.** The mouse wheel (toward the pointer), a two-finger pinch (about the
  fingers) and Zoom in / Zoom out buttons zoom the view, from about five rows
  in to the whole level out (at most 22 rows, never less than the default).
  Reset view and a new level bring back the default.
- **Camera turn.** The default turn is **15°**, so "up" still reads clearly as
  up. The player may turn the board freely.
- **Camera input.** Only turning, panning and zooming move the camera.
  - Touch: **one finger turns** the board. **Two fingers pan**, and twisting
    two fingers also turns it, and pinching zooms. The board follows the fingers;
    the sample's first twist went the wrong way, and the fix is part of the
    approved sample.
  - Mouse: left-drag turns, right- or middle-drag pans, the wheel zooms.
  - Double-tap or double-click resets the view.
  - **No camera keys** — fingers and mouse only — so no key needs remapping.
  - Visible turn, zoom and reset buttons sit on the board's edge on PC-sized screens.
  - Camera input is ignored while any menu, card or dialog is open.
- **Floor.** One flagstone per cell; the seams between stones are the only
  grid. Every piece stands centred on its stone, never on a seam.
- **Walls.** **Solid by default.** A Walls setting offers *Solid*, *Ghosted*
  and *Low*.
  - Ghosted: the wall's own material turns semi-transparent, at about **33%**
    — no outlines, rims or posts. Only walls in front of something ghost. How
    much a wall fades depends on how much it hides, and it fades in and out
    over about 0.2 s.
  - Low: walls drawn at about a third of their height.
- **Theseus is never hidden.** In every wall mode, a wall in front of
  Theseus ghosts the same way Ghosted walls do.
- **Floating icons.** The Minotaur and every item carry a small floating icon
  above them, drawn from their Classic sprite, so they are easy to find in
  every setting. Walls never hide the icons. They bob very slightly, as if
  levitating; with reduced motion they hold still.
- **Mini map.** Modern shows a mini map of the whole level, drawn in today's
  Classic sprites, with the camera's view outlined. Tapping or clicking it
  looks at that spot.
- **Drawing on demand.** Nothing redraws while the board is at rest. Camera
  moves, turn animations and wall fades draw frames. A change recomputes only
  what it touches, never the whole board. Tile loops run at a low frame rate,
  only while one is on screen, and stop when the tab is hidden, the board is
  out of view or the player prefers reduced motion.
- **Share images stay current.** When the look changes, the share images,
  screenshots and the #games hub tile are regenerated in the same change
  (animated where our pages show them).

## Claude's calls

These were not put to the owner; each is easy to change later.

- **Moves follow the screen.** Arrow keys, WASD and the move pad move
  Theseus relative to the camera: "up" is the grid direction nearest to up on
  the screen. At the default 15° turn that is north, so nothing changes until
  the player turns the board. The pad's arrows stay as they are; their meaning
  follows the camera.
- **Models are built in code first.** The first build makes the figures,
  pieces and walls from three.js primitives and procedural textures, as the
  approved sample does. Replacing them with Blender-made glTF models is a later
  step, behind the same model table, so it changes no game code.
- **WebGL is required for Modern.** Where WebGL is missing or the context is
  lost for good, the game falls back to Classic and says so once.
- **Weak devices.** If frames take too long, the board drops its quality in
  steps: shadows first, then the paint filter, then pixel density. It never
  drops below the readable board.
- **The editor stays Classic.** The level editor keeps today's flat board;
  its grid is a tool, not a scene.
- **Default view size.** Until the player zooms, the camera frames a fixed
  number of rows for the screen's shape, as in the sample, so Theseus and his
  surroundings are always readable on a phone.
- **The camera follows Theseus** until the player pans; reset (or the next
  level) returns it to following.
- **Edges.** The camera's target stays within the level plus one cell, so
  the dark beyond the walls shows only a little at an edge.
- **Offline.** The modern bundle is cached for offline play like the rest of
  `dist/`, so an installed game draws Modern without a connection.
- **The change signal.** The modern board redraws from the controller's
  existing `changed` hook and from turn animations; the rules gain nothing.
- **Phones.** The turn and reset buttons sit behind a View button on narrow
  touch screens, as in the sample.
- **The thread** is a thin red cord lying on the floor through the cells'
  centres, the colour Classic uses.
- **three.js is pinned at 0.160.0**, the version the approved sample runs.

## Goals

- Every level plays the same in both looks. The rules, timeline and story-page
  pauses come from the same code; only the drawing differs.
- Every piece in the rules has a modern model, including the pieces not yet in
  a released level, so the editor's levels and shared links play in Modern.
- The modern board is readable at a glance: each piece's colour and silhouette
  match its Classic sprite closely enough that the mini map and the board
  agree.

## Non-goals

- New rules, levels or story.
- A 3D level editor.
- Blender glTF models in the first build (a later step, above).
- Camera tilt or keyboard camera controls.

## Anti-goals

- A board that redraws every frame at rest, or recomputes the whole scene for
  a local change.
- A camera that can look level or from below, or that hides Theseus.
- Anything that makes Classic look or behave differently from today.

## How it fits

The rules, the controller and the turn's timeline do not change. Everything
below is drawing, settings and input.

### Two boards, one frame

- **Classic is today's board, untouched.** `#stage` with `src/board.ts`,
  `fit()` in `src/ui.ts`, the big-level scrolling of `src/follow.ts`, and
  today's every-frame loop in `src/main.ts` run exactly as now while Classic is
  chosen.
- **Modern draws on its own canvas** in the same `#board` region. It fills the
  region; there is no cell fit and no scrolling, because the camera follows
  Theseus and pans.
- **What Modern draws from.** The same inputs Classic paints from:
  `frameOf(game, game.animMs())` gives `{state, figures, done}` (the state for
  the turn's phase and the moving figures from the timeline), and
  `game.thread` gives Ariadne's thread. Story-page pauses, reduced motion and
  the end of a turn's animation (`game.finishAnim()`) work through these as
  they do today.
- **On demand.** In Modern, the page asks for animation frames only while a
  turn animates; between turns nothing is scheduled. The modern board asks for
  its own frames while its camera eases, a wall fades or a tile loop ticks, and
  redraws when the game reports a change.
- **Local changes.** The board keeps one scene. A turn updates only the cells
  and figures it touched: the terrain of changed cells, objects taken, pushed
  blocks, opened doors and gates, and the moving figures. Walls are built once
  per level.

### Code layout

- **Pure helpers** (no DOM, no three.js), unit-tested with `node:test`:
  - the camera's state and its easing toward a goal;
  - the gesture reader (pointer events in, camera changes out);
  - the screen-relative move (a direction on screen and the camera's turn in,
    the grid direction out);
  - the wall ghosting grade (how much each wall hides, turned into an
    opacity);
  - the scene diff (two states in, the cells and pieces that changed out);
  - the quality steps.
- **The three.js board** is a separate bundle, loaded only when Modern is
  first shown. three.js comes from npm, pinned to an exact version, and is
  bundled into that file only, so Classic players never download it.
- **The model table** maps each sprite name in `fx/sprites/tiles.json` to a
  model builder. Every terrain, object, hazard and figure the rules know has an
  entry, so a later Blender export can replace entries one at a time.

### Settings

- `crete-look` (`modern` or `classic`, default `modern`) and `crete-walls`
  (`solid`, `ghosted` or `low`, default `solid`). Both are stored and restored
  like the sound, music and full-screen settings (`src/settings.ts`).
- The menu shows *Look* and, in Modern, *Walls*. The title card shows the
  look switch beside Settings.
- If Modern cannot start (no WebGL, or the bundle fails to load), the game
  shows Classic and says so once in the toast. The stored choice stays Modern,
  so it is tried again next visit.

### Input

- **Moves.** One function turns a pressed direction into a grid direction
  using the camera's turn: the keyboard handler and the move pad both call it
  before `game.press`. In Classic, and in Modern at the default turn, it
  returns the direction unchanged. The hint, the thread and auto-play move on
  the grid, as now.
- **Camera.** Pointer gestures on the modern canvas only. They are ignored
  while any layer is open (`layers.any()`), except the start card, which any
  camera gesture closes as a move does. The camera buttons are real buttons
  with labels.

### The mini map

- It sits in a corner of the board region in Modern and is hidden in Classic.
- It is drawn by today's painter (`createBoard` and `drawList`) on its own
  small canvas, so it shows exactly what Classic shows. The camera's view is
  drawn as an outline on a canvas over it.
- It redraws when the state or the camera changes, never on a timer, and does
  not animate its sprites.

### Tests and share images

- Existing browser specs that read Classic's canvas set `crete-look` to
  `classic` before loading the page; they keep testing Classic exactly.
- A new browser spec plays a level in Modern and checks what a player sees:
  the board draws, nothing draws at rest, moves follow the screen after a turn,
  walls switch modes, the mini map looks where it is tapped, the camera
  ignores input while the menu is open, and the look switch round-trips.
- The share images, screenshot, preview video and #games tile are regenerated
  in Modern (`make screenshots GAMES=crete`).

### Documentation

- The game's README describes both looks, the settings, the camera and the
  module layout; `fx/CREDITS.md` notes that the modern models are built in
  code.

## Left to the builder

- Exact model shapes, materials and lighting per piece, matched to the
  Classic sprite's colours and silhouette and to the approved sample.
- The paint filter's strength and the loop frame rate (the sample's 2 px
  brush and 12 fps are the starting point).
- The quality steps' thresholds.
- Exact button placement on phones, within the sample's layout.
