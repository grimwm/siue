/* The Island of Crete, modern look: the camera's controls. Pointers on the modern canvas go through the gesture
 * reader (gestures.ts) to the camera: one finger swipes Theseus; two fingers pan, twist (turn) and pinch (zoom), or
 * slide up and down together to tilt; the left button turns across and tilts up and down, the right or middle button
 * pans, the wheel zooms toward the pointer, and a double tap or double click resets. When the player lets go the
 * heading eases to the nearest quarter turn. Buttons at the board's top-right turn the view a quarter either way,
 * zoom it in and out, and reset it; on a narrow touch screen a View button shows and hides them. A compass at the
 * board's bottom-right points at the board's north and resets the view when tapped. Every control is ignored while a
 * layer covers the board. */
import type { MoveAction } from '../keys.ts';
import { createGestures } from './gestures.ts';
import type { CamOp, Ptr } from './gestures.ts';

/** What the controls do to the camera. */
export interface CamControl {
  /** Turns by `deg`; at once under a finger, eased from a button. */
  turn(deg: number, eased: boolean): void;
  /** Slides the view by a screen drag of `(dx, dy)` CSS pixels; the camera stops following Theseus. */
  pan(dx: number, dy: number): void;
  /** Multiplies the view's height by `factor` about the screen point `(fx, fy)`, in fractions of the canvas from its
   *  centre (right and up are positive); at once under a finger or the wheel, eased from a button. */
  zoom(factor: number, fx: number, fy: number, eased: boolean): void;
  /** Tilts Angled by `deg` toward straight down (negative: back toward Angled's own pitch), at once. */
  tilt(deg: number): void;
  /** The player let go: the heading eases to the nearest quarter turn. */
  settle(): void;
  /** Back to the default heading, tilt and zoom. */
  reset(): void;
}

export interface ControlHost {
  /** True while a layer other than `start` is open. */
  blocked(): boolean;
  /** A camera gesture happened (closes the start card). */
  gesture(): void;
  /** A finger swiped the board: move Theseus that way as the screen shows it. */
  swipe(dir: MoveAction): void;
}

export interface Controls {
  /** Shows or hides the turn buttons and the compass (Top-down does not turn). */
  setTurnable(on: boolean): void;
  /** Points the compass at the board's north for a view turned `yaw` degrees. */
  setHeading(yaw: number): void;
  dispose(): void;
}

/** A turn button turns a quarter, so the grid stays square to the screen. */
const STEP = 90;
const ZOOM_STEP = 1.2;
/** Wheel lines and pages as pixels. */
const LINE_PX = 16;
const TURN_LEFT = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.5-5.8"/><path d="M4 4v4h4"/></svg>';
const TURN_RIGHT = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.5-5.8"/><path d="M20 4v4h-4"/></svg>';
const ZOOM_IN = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/><path d="M12 5v14"/></svg>';
const ZOOM_OUT = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/></svg>';
const COMPASS = '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="n" d="M12 3l3.5 9h-7z"/><path class="s" d="M12 21l-3.5-9h7z"/></svg>';

function button(id: string, label: string, html: string, className: string): HTMLButtonElement {
  const b = document.createElement('button');
  b.type = 'button';
  b.id = id;
  b.className = className;
  b.setAttribute('aria-label', label);
  b.title = label;
  b.innerHTML = html;
  return b;
}

/** Wires `canvas` and puts the camera buttons in `parent`. */
export function createControls(canvas: HTMLCanvasElement, parent: HTMLElement, host: ControlHost, cam: CamControl): Controls {
  const gestures = createGestures(() => performance.now());
  const ptr = (e: PointerEvent): Ptr => ({
    id: e.pointerId,
    x: e.clientX,
    y: e.clientY,
    type: e.pointerType === 'touch' || e.pointerType === 'pen' ? e.pointerType : 'mouse',
    button: e.button,
  });
  const apply = (ops: CamOp[]) => {
    if (!ops.length || host.blocked()) return;
    host.gesture();
    for (const op of ops) {
      if (op.kind === 'swipe') host.swipe(op.dir);
      else if (op.kind === 'turn') cam.turn(op.deg, false);
      else if (op.kind === 'tilt') cam.tilt(op.deg);
      else if (op.kind === 'settle') cam.settle();
      else if (op.kind === 'pan') cam.pan(op.dx, op.dy);
      else if (op.kind === 'zoom') {
        const r = canvas.getBoundingClientRect();
        cam.zoom(op.factor, (op.x - r.left) / (r.width || 1) - 0.5, 0.5 - (op.y - r.top) / (r.height || 1), false);
      } else cam.reset();
    }
  };

  const down = (e: PointerEvent) => {
    if (host.blocked()) return;
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
      // A synthetic pointer cannot be captured; its moves still reach the canvas.
    }
    apply(gestures.down(ptr(e)));
  };
  const move = (e: PointerEvent) => apply(gestures.move(ptr(e)));
  const up = (e: PointerEvent) => apply(gestures.up(ptr(e)));
  const cancel = (e: PointerEvent) => apply(gestures.cancel(e.pointerId));
  const dbl = () => {
    if (host.blocked()) return;
    host.gesture();
    cam.reset();
  };
  const noMenu = (e: Event) => e.preventDefault();
  const wheel = (e: WheelEvent) => {
    if (host.blocked()) return;
    e.preventDefault();
    const px = e.deltaMode === 1 ? LINE_PX : e.deltaMode === 2 ? canvas.clientHeight : 1;
    apply(gestures.wheel(e.deltaY * px, e.clientX, e.clientY));
  };

  canvas.style.touchAction = 'none';
  canvas.addEventListener('pointerdown', down);
  canvas.addEventListener('pointermove', move);
  canvas.addEventListener('pointerup', up);
  canvas.addEventListener('pointercancel', cancel);
  canvas.addEventListener('dblclick', dbl);
  canvas.addEventListener('contextmenu', noMenu);
  canvas.addEventListener('wheel', wheel, { passive: false });

  const view = document.createElement('button');
  view.type = 'button';
  view.className = 'modern-viewbtn';
  view.textContent = 'View';
  view.setAttribute('aria-expanded', 'false');
  view.setAttribute('aria-controls', 'cam-buttons');
  const group = document.createElement('div');
  group.id = 'cam-buttons';
  group.className = 'cam';
  group.setAttribute('role', 'group');
  group.setAttribute('aria-label', 'Camera');
  const left = button('cam-left', 'Turn left', TURN_LEFT, 'cbtn');
  const right = button('cam-right', 'Turn right', TURN_RIGHT, 'cbtn');
  const zoomIn = button('cam-zoom-in', 'Zoom in', ZOOM_IN, 'cbtn');
  const zoomOut = button('cam-zoom-out', 'Zoom out', ZOOM_OUT, 'cbtn');
  const reset = button('cam-reset', 'Reset view', 'Reset', 'cbtn wide');
  group.append(left, right, zoomIn, zoomOut, reset);
  // The compass: its needle points at the board's north and turns with the view; a tap resets it.
  const compass = button('cam-compass', 'Compass: reset the view', COMPASS, 'compass');
  const needle = compass.querySelector('svg')!;
  parent.append(view, group, compass);

  const press = (fn: () => void) => () => {
    if (host.blocked()) return;
    host.gesture();
    fn();
  };
  left.addEventListener('click', press(() => cam.turn(-STEP, true)));
  right.addEventListener('click', press(() => cam.turn(STEP, true)));
  zoomIn.addEventListener('click', press(() => cam.zoom(1 / ZOOM_STEP, 0, 0, true)));
  zoomOut.addEventListener('click', press(() => cam.zoom(ZOOM_STEP, 0, 0, true)));
  reset.addEventListener('click', press(() => cam.reset()));
  compass.addEventListener('click', press(() => cam.reset()));
  view.addEventListener('click', () => {
    const open = group.classList.toggle('open');
    view.setAttribute('aria-expanded', String(open));
  });

  return {
    setTurnable(on) {
      left.hidden = right.hidden = compass.hidden = !on;
    },
    setHeading(yaw) {
      needle.style.transform = `rotate(${yaw}deg)`;
    },
    dispose() {
      canvas.removeEventListener('pointerdown', down);
      canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerup', up);
      canvas.removeEventListener('pointercancel', cancel);
      canvas.removeEventListener('dblclick', dbl);
      canvas.removeEventListener('contextmenu', noMenu);
      canvas.removeEventListener('wheel', wheel);
      view.remove();
      group.remove();
    },
  };
}
