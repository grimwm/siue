/* The Island of Crete, modern look: the camera's controls. Pointers on the modern canvas go through the gesture
 * reader (gestures.ts) to the camera: one finger swipes Theseus; two fingers pan, twist (turn) and pinch (zoom), or
 * slide up and down together to tilt; the left button turns across and tilts up and down, the right or middle button
 * pans, the wheel zooms toward the pointer, and a double tap or double click resets. The view stays at whatever
 * heading and tilt the player leaves it. Buttons at the board's top-right turn the view a quarter either way, zoom it
 * in and out, and reset it; on a narrow touch screen a View button shows and hides them. A compass at the board's
 * bottom-right shows the view as it is (its needle points at the board's north, and its dial squashes and its ring
 * fills as the view tilts); a finger, pen or mouse dragging it turns the view across and tilts it up and down, and a
 * tap or click on it (or Enter or Space) resets the view (compass.ts); while it has the focus, Left and Right turn the
 * view 15° and Up and Down lean it toward 45° and back toward straight down, without moving Theseus. Every control is ignored
 * while a layer covers the board. */
import type { MoveAction } from '../keys.ts';
import { compassFace, createCompassDrag } from './compass.ts';
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
  /** Tilts by `deg` toward straight down (negative: back toward 45°); at once under a finger, eased from the compass. */
  tilt(deg: number, eased: boolean): void;
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
  /** Shows the view on the compass: a view turned `yaw` degrees and looking down at `pitch` degrees. */
  setView(yaw: number, pitch: number): void;
  dispose(): void;
}

/** A turn button turns a quarter. */
const STEP = 90;
/** Degrees an arrow key on the focused compass turns the view. */
const TURN_KEY = 15;
/** Degrees an arrow key on the focused compass tilts the view. */
const TILT_KEY = 10;
const ZOOM_STEP = 1.2;
/** Wheel lines and pages as pixels. */
const LINE_PX = 16;
const TURN_LEFT = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.5-5.8"/><path d="M4 4v4h4"/></svg>';
const TURN_RIGHT = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.5-5.8"/><path d="M20 4v4h-4"/></svg>';
const ZOOM_IN = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/><path d="M12 5v14"/></svg>';
const ZOOM_OUT = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/></svg>';
const COMPASS = '<span class="tilt-ring" aria-hidden="true"></span><svg viewBox="0 0 24 24" aria-hidden="true"><circle class="dial" cx="12" cy="12" r="11"/><path class="n" d="M12 3l3.5 9h-7z"/><path class="s" d="M12 21l-3.5-9h7z"/></svg>';
/** A click this soon after a compass press was that press (already handled); a later one came from the keyboard. */
const CLICK_MS = 600;

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
      else if (op.kind === 'tilt') cam.tilt(op.deg, false);
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
  // The compass: it shows the view, a drag on it steers the view, and a tap resets it.
  const compass = button('cam-compass', 'Compass: drag or use the arrow keys to turn and tilt the view, tap to reset it', COMPASS, 'compass');
  compass.title = 'Compass';
  const needle = compass.querySelector('svg')!;
  parent.append(view, group, compass);
  const steer = createCompassDrag();
  /** When a compass press last lifted, so the click that follows it is not taken twice. */
  let pressedAt = -1e9;
  const steerOps = (ops: CamOp[]) => {
    if (!ops.length) return;
    host.gesture();
    for (const op of ops) {
      if (op.kind === 'turn') cam.turn(op.deg, true);
      else if (op.kind === 'tilt') cam.tilt(op.deg, true);
      else if (op.kind === 'reset') cam.reset();
    }
  };
  const compassDown = (e: PointerEvent) => {
    if (host.blocked() || (e.pointerType === 'mouse' && e.button !== 0)) return;
    e.preventDefault();
    try {
      compass.setPointerCapture(e.pointerId);
    } catch {
      // A synthetic pointer cannot be captured; its moves still reach the compass.
    }
    steerOps(steer.down(e.pointerId, e.clientX, e.clientY));
  };
  const compassMove = (e: PointerEvent) => {
    if (host.blocked()) return;
    steerOps(steer.move(e.pointerId, e.clientX, e.clientY));
  };
  const compassUp = (e: PointerEvent) => {
    const ops = steer.up(e.pointerId, e.clientX, e.clientY);
    if (ops.length) pressedAt = performance.now();
    if (!host.blocked()) steerOps(ops);
  };
  const compassCancel = (e: PointerEvent) => steerOps(steer.cancel(e.pointerId));
  compass.style.touchAction = 'none';
  compass.addEventListener('pointerdown', compassDown);
  compass.addEventListener('pointermove', compassMove);
  compass.addEventListener('pointerup', compassUp);
  compass.addEventListener('pointercancel', compassCancel);
  // The arrow keys steer from the focused compass; the page's own arrow keys (moving Theseus) never see them.
  const compassKeys: Record<string, () => void> = {
    ArrowLeft: () => cam.turn(-TURN_KEY, true),
    ArrowRight: () => cam.turn(TURN_KEY, true),
    ArrowUp: () => cam.tilt(-TILT_KEY, true),
    ArrowDown: () => cam.tilt(TILT_KEY, true),
  };
  compass.addEventListener('keydown', (e: KeyboardEvent) => {
    const fn = compassKeys[e.key];
    if (!fn) return;
    e.preventDefault();
    e.stopPropagation();
    if (host.blocked()) return;
    host.gesture();
    fn();
  });
  compass.addEventListener('click', () => {
    // A pointer's tap reset the view as it lifted; Enter or Space clicks with no press before it.
    if (performance.now() - pressedAt < CLICK_MS) return;
    press(() => cam.reset())();
  });

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
  view.addEventListener('click', () => {
    const open = group.classList.toggle('open');
    view.setAttribute('aria-expanded', String(open));
  });

  return {
    setView(yaw, pitch) {
      const f = compassFace({ yaw, pitch });
      needle.style.transform = `scale(1, ${f.squash.toFixed(3)}) rotate(${f.needle.toFixed(1)}deg)`;
      compass.style.setProperty('--tilt', f.tilt.toFixed(3));
      compass.dataset.heading = String(Math.round(yaw));
      compass.dataset.pitch = String(Math.round(pitch));
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
      compass.remove();
    },
  };
}
