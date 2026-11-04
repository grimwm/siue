# Crete: the level editor in both looks

The game has two looks, Modern (a painted 3D board with a free compass camera)
and Classic (the Blender-rendered board as a tilted sheet, with the same compass
camera). The level editor builds in either look, and the builder chooses which.

## Decided

- **One look setting.** The editor opens in the game's look (`crete-look`).
  Its Classic and Modern buttons, and B, switch it at any time and set that
  same setting, as the Map button does in play, so Try It plays in the look the
  level was built in. The editor has no look of its own.
- **The switch keeps everything.** The draft, its undo history, the brush and
  any Check stay as they were; only the board changes.
- **One view for both looks.** As in the game, the heading and tilt go across
  with the switch, both ways: Modern's to Classic, Classic's to Modern. The
  zoom and pan do not: the look switched to shows the whole board, as each
  look's own zoom has nothing to say about the other's.
- **Classic is the game's tilted sheet.** The editor's Classic board is the
  game's Classic (`src/sheet.ts`, `src/sheet-board.ts`) with its compass camera
  (`src/editor/classic-view.ts`): it turns freely, tilts from straight down to
  10°, zooms and pans, and opens at 75° north up. It stands still as the
  editor's Modern board does: a turn, a tilt or a reset shows at once.
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

The rule, the same in both looks, as the game separates walking (the pad) from
turning (the board):

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
Modern board has a painter, and `src/editor/classic-view.ts` on the Classic
sheet.

## Finding the cell

In Classic the cell under a pointer is the square the browser draws there on
the turned, tilted sheet: `cellUnder` in `src/sheet.ts` inverts the sheet's
lens, tilt and turn (`unproject`, the inverse of the `project` the figures
stand by) and floors the ground point to its square; off the board it is none.
The unit test in `test/sheet.test.ts` composes the sheet's CSS transform as the
browser does and checks a press at each square's middle and near its corners
lands on that square at six headings and five tilts, 10° included.

At low tilts the far rows are thin on the screen, so painting them by eye is
fiddly; the wheel, a pinch or the compass's + zoom in on them, or a tilt back
toward straight down widens them. The tilt is not held higher in the editor
than in the game.

In Modern the cell under a pointer is where a ray through it meets the ground plane
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
