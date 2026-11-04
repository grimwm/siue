# Crete: the level editor in both looks

The game has two looks, Modern (a painted 3D board with a free compass camera)
and Classic (the Blender-rendered flat board). The level editor painted only on
the flat canvas, whatever look the player chose. Now it builds in either look,
and the builder chooses which.

## Decided

- **One look setting.** The editor opens in the game's look (`crete-look`).
  Its Classic and Modern buttons, and B, switch it at any time and set that
  same setting, as the Map button does in play, so Try It plays in the look the
  level was built in. The editor has no look of its own.
- **The switch keeps everything.** The draft, its undo history, the brush and
  any Check stay as they were; only the board changes.
- **Classic is the flat canvas.** The editor's Classic board is the flat
  board it has always had. The tilted sheet is left out of the editor: painting
  on a tilted sheet gains little and costs a second hit test.
- **Classic never loads the 3D engine.** The editor's Modern board is built
  from `dist/modern.js`, loaded the first time Modern is chosen. Where it
  cannot start (no WebGL, or the bundle fails), the editor stays in Classic and
  the toast says so; the stored setting is left alone.
- **Modern is the game's own board.** The editor builds a second
  `createModernBoard` on its own canvas (`src/editor/modern-view.ts`), with the
  game's camera, compass, wheel and pinch. It stands still: the editor's board
  runs as under reduced motion, so nothing eases, loops or animates between
  strokes.

## Camera versus paint

The rule, as the game separates walking (the pad) from turning (the board):

- **One finger, a pen or the left mouse button paints.** A tap paints one
  cell; a drag paints every cell it crosses, as one undo step.
- **Two fingers always move the camera**: pan, twist to turn, pinch to zoom.
  A finger painting when a second comes down hands its stroke back (the stroke
  so far is undone) and joins the camera; once fingers move the camera, every
  finger does until all are up, so a finger left behind never paints.
- **The right mouse button turns and tilts** (the game's left-button drag),
  the middle button pans, the wheel zooms toward the pointer.
- **The compass** turns and tilts by dragging, resets with a tap, and takes
  the arrow keys and + and − while it has the focus.
- A double click or double tap does not reset the view in the editor (it is
  two dabs of paint); the compass does.

`src/modern/paint-route.ts` holds the rule (DOM-free, tested in
`test/editor-modern.test.ts`); `src/modern/controls.ts` applies it when the
board has a painter.

## Finding the cell

The cell under a pointer is where a ray through it meets the ground plane
(`cellUnder` in `src/modern/camera.ts`): the lens is orthographic, so the ray
runs along the view, and the floor point is `groundAt` of the pointer's offset
from the view's centre. Rounding to the nearest cell centre gives the cell; off
the board it is none. The unit test checks it against three.js's own camera at
many headings, tilts, pans and zooms.

On a desktop the cell under the mouse wears a gold frame. A phone needs no
hover: a tap paints at once.

## Live updates

`ModernBoard.edit(state)` takes each change of the draft. A draft of the same
size rebuilds only the cells whose model changed and their neighbours, the
walls when a wall came or went, the floor when a surface changed, and the
figures, hazards and machines (with their facing); the camera stays where it
is. The lights are fixed when a level is built (a new light recompiles every
material), so a new set of torches and lamps is lit once the painting pauses
(400 ms). A new size builds the level afresh at the opening view. The fake and
invisible walls carry their letter (F, I) over the board, as on the flat one.

## Not changed

Try It, Check and its panel, Share, Undo and Redo, the drawer on narrow
screens, the editor's keys (every key goes to the editor while it is the top
layer), Escape never leaving full screen, and held keys never scrolling.
