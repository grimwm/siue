/* The Island of Crete: the level editor's Classic look, the game's tilted sheet (src/sheet.ts, src/sheet-board.ts)
 * with the game's compass camera. Like the game's Classic it turns to any heading and tilts from straight down to 10°,
 * zooms and pans, opens at 75° north up, and never loads a 3D engine. The editor's rule for the pointer is the Modern
 * board's (src/modern/paint-route.ts): one finger, a pen or the left button paints; two fingers pan, twist and pinch;
 * the right button turns and tilts, the middle one pans, the wheel zooms toward the pointer, and the compass turns,
 * tilts, zooms from its keys and resets with a tap. A double click is two dabs of paint, not a reset. The cell a press
 * paints is the square under it on the turned, tilted sheet (sheet.ts cellUnder). The board stands still: a turn, a
 * tilt or a reset shows at once, as the editor's Modern board does under reduced motion. Needs the DOM lib. */
import type { Atlas, Draw } from '../board-plan.ts';
import { createSheetBoard } from '../sheet-board.ts';
import type { ClassicBoard } from '../sheet-board.ts';
import {
  cellUnder, centredOn, createSheetView, eye, holdTarget, panned, project, sheetCell, unproject, wholeFrame,
} from '../sheet.ts';
import type { Frame, Pt } from '../sheet.ts';
import { ZOOM_STEP, clampZoom, zoomedCell } from '../zoom.ts';
import { createCompassButton } from '../modern/controls.ts';
import type { CompassButton } from '../modern/controls.ts';
import { createGestures } from '../modern/gestures.ts';
import type { CamOp, Ptr } from '../modern/gestures.ts';
import { createPaintRouter } from '../modern/paint-route.ts';
import type { Route } from '../modern/paint-route.ts';
import type { Heading } from '../modern/compass.ts';
import type { Cell } from '../puzzle/tiles.ts';

export interface ClassicViewDeps {
  /** The editor's board region, #editor-board. */
  holder: HTMLElement;
  /** The sheet canvas, #editor-stage. */
  canvas: HTMLCanvasElement;
  atlas: Atlas;
  image: HTMLImageElement;
  /** True while the editor or this look is not showing: the board and its compass then take nothing. */
  hidden(): boolean;
  /** The editor's brush: a stroke reaching a square (`first` for the press that starts it), its end, and its drop (a
   *  second finger came down). */
  painter: { stroke(at: Cell, first: boolean): void; end(): void; drop(): void };
}

export interface ClassicView {
  /** Shows `list` (the draft's draw list) for a `cols` × `rows` draft, with the hidden walls' letters. A new size
   *  opens at the opening view. */
  draw(cols: number, rows: number, list: Draw[], marks: readonly { r: number; c: number; mark: string }[]): void;
  /** Lays the sheet out again for the board region as it now is. */
  fit(): void;
  /** The heading and tilt. */
  view(): Heading;
  /** Puts the view at this heading and tilt (the Modern board's, on switching), showing the whole board. */
  setView(yaw: number, pitch: number): void;
  zoom(): number;
  /** The square under the page point (x, y); null off the board. */
  cellAt(x: number, y: number): Cell | null;
  /** Where square (c, r)'s centre shows, in page px; null before the sheet is laid out. */
  at(c: number, r: number): Pt | null;
}

/** Wheel lines as pixels. */
const LINE_PX = 16;
/** How long a view must rest before the whole level is drawn again at the cell that fits it unscaled. */
const SETTLE_MS = 200;

/** Finds `#id` in `parent`, or makes it there as a div of class `cls`. */
function part(parent: HTMLElement, id: string, cls: string): HTMLElement {
  const found = parent.querySelector<HTMLElement>(`#${id}`);
  if (found) return found;
  const el = document.createElement('div');
  el.id = id;
  el.className = cls;
  parent.appendChild(el);
  return el;
}

export function createClassicView(deps: ClassicViewDeps): ClassicView {
  const { holder, canvas, atlas, image } = deps;
  // The view the sheet turns in, and the layer that holds its compass.
  const view = part(holder, 'editor-view', 'stage-view editor-view');
  if (canvas.parentElement !== view) view.appendChild(canvas);
  const cam = part(holder, 'editor-classic-cam', 'modern-overlay editor-classic-cam');
  const board: ClassicBoard = createSheetBoard(canvas, atlas, image);
  const rise = atlas.rise / atlas.cell;
  const sheetView = createSheetView();
  let cols = 0, rows = 0;
  let list: Draw[] = [];
  let zoom = 1;
  /** The whole-level cell in CSS px, the cell drawn now, and how the sheet is framed. */
  let wholePx = 0;
  let cellCss = 0;
  let frame: Frame | null = null;
  let settleTimer = 0;
  let compass: CompassButton | null = null;

  /** The view's box: its size, and its corner on the page. */
  const box = (): { left: number; top: number; width: number; height: number } => {
    const r = view.getBoundingClientRect() as Partial<DOMRect>;
    return { left: r.left ?? 0, top: r.top ?? 0, width: r.width ?? 0, height: r.height ?? 0 };
  };

  /** The whole level's cell for the view as it now is, then the zoom on it. */
  function fit(): void {
    if (!cols || deps.hidden()) return;
    const b = box();
    if (b.width <= 0 || b.height <= 0) return;
    wholePx = sheetCell(sheetView.cur, cols, rows, rise, b.width, b.height);
    resize();
  }

  /** Sizes the sheet for the zoom and frames it: the whole level at zoom 1; zoomed, about the view point `at` (the
   *  board under it stays under it), or its centre. */
  function resize(at?: Pt): void {
    if (!wholePx) return;
    const b = box();
    if (b.width <= 0 || b.height <= 0) return;
    const before = frame;
    const was = cellCss;
    zoom = clampZoom(zoom, wholePx);
    cellCss = zoomedCell(wholePx, zoom, window.devicePixelRatio || 1);
    board.size(cols, rows, cellCss);
    const vw = b.width, vh = b.height;
    if (zoom === 1 || !before || !was) frame = wholeFrame(sheetView.cur, cols, rows, cellCss, rise, vw, vh);
    else {
      const ratio = cellCss / was;
      const p = at ?? { x: vw / 2, y: vh / 2 };
      const g = unproject(before, p.x, p.y);
      const mid = unproject(before, vw / 2, vh / 2) ?? { x: before.tx, y: before.ty };
      let f: Frame = { ...before, tx: mid.x * ratio, ty: mid.y * ratio, ox: 0, oy: 0, k: 1, d: eye(cols, rows, cellCss), vw, vh };
      if (g) {
        const q = project(f, g.x * ratio, g.y * ratio);
        f = centredOn(f, vw / 2 + q.x - p.x, vh / 2 + q.y - p.y);
      }
      frame = holdTarget(f, cols, rows, cellCss);
    }
    board.frame(frame);
    board.paint(list);
  }

  /** Frames the sheet again for a new heading or tilt, keeping the zoom and where it looks; once the view rests, the
   *  whole level is drawn again at the cell that fits it unscaled, crisp. */
  function reframe(): void {
    const v = sheetView.cur;
    compass?.setView(v.yaw, v.pitch);
    if (!frame || !cellCss) return;
    const b = box();
    if (b.width <= 0 || b.height <= 0) return;
    frame = zoom === 1 ? wholeFrame(v, cols, rows, cellCss, rise, b.width, b.height) : { ...frame, yaw: v.yaw, pitch: v.pitch, vw: b.width, vh: b.height };
    board.frame(frame);
    clearTimeout(settleTimer);
    settleTimer = window.setTimeout(() => {
      if (zoom === 1) fit();
    }, SETTLE_MS);
  }

  const turn = (deg: number): void => {
    sheetView.turn(deg, false);
    reframe();
  };
  const tilt = (deg: number): void => {
    sheetView.tilt(deg, false);
    reframe();
  };
  /** Back to the opening view: 75°, north up, the whole level. */
  const reset = (): void => {
    sheetView.home(false);
    zoom = 1;
    compass?.setView(sheetView.cur.yaw, sheetView.cur.pitch);
    fit();
  };
  const zoomBy = (k: number, at?: Pt): void => {
    zoom = clampZoom(zoom * k, wholePx);
    resize(at);
  };

  const gestures = createGestures(() => performance.now());
  const router = createPaintRouter();
  const apply = (ops: CamOp[]): void => {
    if (!ops.length || deps.hidden()) return;
    for (const op of ops) {
      if (op.kind === 'turn') turn(op.deg);
      else if (op.kind === 'tilt') tilt(op.deg);
      else if (op.kind === 'zoom') {
        const b = box();
        zoomBy(1 / op.factor, { x: op.x - b.left, y: op.y - b.top });
      } else if (op.kind === 'pan') {
        if (zoom === 1 || !frame) continue;
        frame = panned(frame, op.dx, op.dy, cols, rows, cellCss);
        board.frame(frame);
      }
      // A double tap is two dabs of paint: the compass resets the view.
    }
  };
  const cellAt = (x: number, y: number): Cell | null => {
    if (!frame) return null;
    const b = box();
    return cellUnder(frame, x - b.left, y - b.top, cols, rows, cellCss);
  };
  const route = (rs: Route[]): void => {
    for (const r of rs) {
      if (r.kind === 'paint') {
        const at = cellAt(r.x, r.y);
        if (at) deps.painter.stroke(at, r.first);
      } else if (r.kind === 'end') deps.painter.end();
      else if (r.kind === 'drop') deps.painter.drop();
      else if (r.kind === 'cam') {
        if (r.op === 'cancel') apply(gestures.cancel(r.p.id));
        else apply(gestures[r.op](r.p));
      }
    }
  };
  const ptr = (e: PointerEvent): Ptr => ({
    id: e.pointerId,
    x: e.clientX,
    y: e.clientY,
    type: e.pointerType === 'touch' || e.pointerType === 'pen' ? e.pointerType : 'mouse',
    button: e.button,
  });
  const cancel = (e: PointerEvent): void => route(router.cancel(e.pointerId));
  view.addEventListener('pointerdown', (e: PointerEvent) => {
    if (deps.hidden()) return;
    e.preventDefault();
    try {
      view.setPointerCapture(e.pointerId);
    } catch {
      // A synthetic pointer cannot be captured; its moves still reach the view.
    }
    route(router.down(ptr(e)));
  });
  view.addEventListener('pointermove', (e: PointerEvent) => route(router.move(ptr(e))));
  view.addEventListener('pointerup', (e: PointerEvent) => route(router.up(ptr(e))));
  view.addEventListener('pointercancel', cancel);
  view.addEventListener('lostpointercapture', cancel);
  view.addEventListener('pointerleave', (e: PointerEvent) => {
    // A finger that left the board without its capture is gone: it never pairs with the next touch.
    if (e.pointerType !== 'mouse' && !view.hasPointerCapture?.(e.pointerId)) cancel(e);
  });
  view.addEventListener('contextmenu', (e: Event) => e.preventDefault());
  view.addEventListener('wheel', (e: WheelEvent) => {
    if (deps.hidden()) return;
    e.preventDefault();
    const px = e.deltaMode === 1 ? LINE_PX : e.deltaMode === 2 ? box().height : 1;
    apply(gestures.wheel(e.deltaY * px, e.clientX, e.clientY));
  }, { passive: false });

  compass = createCompassButton('editor-compass', { blocked: deps.hidden, gesture: () => {} },
    { turn, tilt, reset, zoomStep: (d) => zoomBy(d > 0 ? ZOOM_STEP : 1 / ZOOM_STEP) });
  compass.setView(sheetView.cur.yaw, sheetView.cur.pitch);
  cam.append(compass.button);

  return {
    draw(c, r, l, marks) {
      list = l;
      board.marks(marks);
      if (c !== cols || r !== rows) {
        cols = c;
        rows = r;
        frame = null;
        cellCss = 0;
        reset();
        return;
      }
      if (!frame) fit();
      else board.paint(list);
    },
    fit,
    view: () => ({ ...sheetView.cur }),
    setView(yaw, pitch) {
      sheetView.set(yaw, pitch);
      zoom = 1;
      compass?.setView(sheetView.cur.yaw, sheetView.cur.pitch);
      fit();
    },
    zoom: () => zoom,
    cellAt,
    at(c, r) {
      if (!frame) return null;
      const b = box();
      const p = project(frame, (c + 0.5) * cellCss, (r + 0.5) * cellCss);
      return { x: b.left + p.x, y: b.top + p.y };
    },
  };
}
