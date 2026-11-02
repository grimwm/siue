/* The Island of Crete, modern look: the camera's controls. Pointers on the modern canvas go through the gesture
 * reader (gestures.ts) to the camera: one finger, or the left button, turns across and tilts up and down; two fingers
 * pan, twist (turn) and pinch (zoom); the right or middle button pans, the wheel zooms toward the pointer, and a
 * double tap or double click resets. The view stays at whatever heading and tilt the player leaves it. The board has
 * no camera buttons: a compass at its bottom-right shows the view as it is (its needle points at the board's north,
 * and its dial squashes and its ring fills as the view tilts); a finger, pen or mouse dragging it turns the view across
 * and tilts it up and down, and a tap or click on it (or Enter or Space) resets the view (compass.ts); while it has the
 * focus, Left and Right turn the view 15°, Up and Down lean it toward the lowest tilt (10°) and back toward straight
 * down, and + and − zoom it, without moving Theseus. Every control is ignored while a layer covers the board. */
import { compassFace, createCompassDrag } from './compass.ts';
import { createGestures } from './gestures.ts';
import { HINT_KEY, createHint, hintText, readHint } from './hint.ts';
import type { HintChange } from './hint.ts';
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
  /** Tilts by `deg` toward straight down (negative: back toward the lowest tilt); at once under a finger, eased from the compass. */
  tilt(deg: number, eased: boolean): void;
  /** Back to the default heading, tilt and zoom. */
  reset(): void;
}

export interface ControlHost {
  /** True while a layer other than `start` is open. */
  blocked(): boolean;
  /** True while any layer, the start card too, covers the board. */
  covered(): boolean;
  /** A camera gesture happened (closes the start card). */
  gesture(): void;
}

export interface Controls {
  /** Shows the view on the compass: a view turned `yaw` degrees and looking down at `pitch` degrees. */
  setView(yaw: number, pitch: number): void;
  /** Shows the view tips now, asked for (the menu's Show View Tips, the ? key). */
  showTips(): void;
  dispose(): void;
}

/** Degrees an arrow key on the focused compass turns the view. */
const TURN_KEY = 15;
/** Degrees an arrow key on the focused compass tilts the view. */
const TILT_KEY = 10;
/** How much + and − on the focused compass zoom the view. */
const ZOOM_STEP = 1.2;
/** Wheel lines and pages as pixels. */
const LINE_PX = 16;
const COMPASS = '<span class="tilt-ring" aria-hidden="true"></span><svg viewBox="0 0 24 24" aria-hidden="true"><circle class="dial" cx="12" cy="12" r="11"/><path class="n" d="M12 3l3.5 9h-7z"/><path class="s" d="M12 21l-3.5-9h7z"/></svg>';
/** A click this soon after a compass press was that press (already handled); a later one came from the keyboard. */
const CLICK_MS = 600;
/** How often, in ms, the first-time hint checks whether it is time to show or go. */
const HINT_TICK_MS = 250;

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
export function createControls(canvas: HTMLCanvasElement, parent: HTMLElement, host: ControlHost, camera: CamControl): Controls {
  // A camera move takes the view tips (hint.ts) away, and the first one means they never show by themselves again:
  // every control reaches the camera through here.
  let used = false;
  const touched = () => {
    const c = hint.moved();
    if (!used) {
      used = true;
      saveHint();
    }
    hintChange(c);
  };
  const cam: CamControl = {
    turn: (deg, eased) => { touched(); camera.turn(deg, eased); },
    pan: (dx, dy) => { touched(); camera.pan(dx, dy); },
    zoom: (factor, fx, fy, eased) => { touched(); camera.zoom(factor, fx, fy, eased); },
    tilt: (deg, eased) => { touched(); camera.tilt(deg, eased); },
    reset: () => { touched(); camera.reset(); },
  };
  /** The last kind of pointer on the board or the compass, for the hint's wording. */
  let lastPointer = '';
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
      if (op.kind === 'turn') cam.turn(op.deg, false);
      else if (op.kind === 'tilt') cam.tilt(op.deg, false);
      else if (op.kind === 'pan') cam.pan(op.dx, op.dy);
      else if (op.kind === 'zoom') {
        const r = canvas.getBoundingClientRect();
        cam.zoom(op.factor, (op.x - r.left) / (r.width || 1) - 0.5, 0.5 - (op.y - r.top) / (r.height || 1), false);
      } else cam.reset();
    }
  };

  const down = (e: PointerEvent) => {
    lastPointer = e.pointerType;
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
  /** A finger that left the board without its capture, or lost it, is gone: it never pairs with the next touch. */
  const leave = (e: PointerEvent) => { if (e.pointerType !== 'mouse' && !canvas.hasPointerCapture?.(e.pointerId)) cancel(e); };
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
  canvas.addEventListener('lostpointercapture', cancel);
  canvas.addEventListener('pointerleave', leave);
  canvas.addEventListener('dblclick', dbl);
  canvas.addEventListener('contextmenu', noMenu);
  canvas.addEventListener('wheel', wheel, { passive: false });

  // The compass: it shows the view, a drag on it steers the view, a tap resets it, and its keys turn, tilt and zoom.
  const dial = createCompassButton('cam-compass', host, { ...cam, zoomStep: (d) => cam.zoom(d > 0 ? 1 / ZOOM_STEP : ZOOM_STEP, 0, 0, true) }, (t) => { lastPointer = t; });
  const compass = dial.button;
  parent.append(compass);

  // The first-time hint: one line by the compass after a quiet moment, and one wiggle of the compass. It never takes
  // a press meant for the board; a tap on the line itself closes it.
  let rec = readHint(null);
  try {
    rec = readHint(localStorage.getItem(HINT_KEY));
  } catch {
    // No storage: a fresh record, kept for this visit only.
  }
  const hint = createHint(rec, performance.now());
  const pill = document.createElement('p');
  pill.className = 'view-hint';
  pill.id = 'view-hint';
  pill.hidden = true;
  pill.setAttribute('role', 'status');
  parent.append(pill);
  let ticker = 0;
  let hideTimer = 0;
  const tick = () => hintChange(hint.tick(performance.now(), covered()));
  function saveHint(): void {
    try {
      localStorage.setItem(HINT_KEY, JSON.stringify(hint.record()));
    } catch {
      // Not kept: the hint may show again next visit.
    }
  }
  function hintChange(c: HintChange): void {
    if (!c) return;
    saveHint();
    if (c === 'show') {
      const touch = lastPointer ? lastPointer !== 'mouse' : matchMedia('(pointer: coarse)').matches;
      pill.textContent = hintText(touch);
      clearTimeout(hideTimer);
      pill.hidden = false;
      requestAnimationFrame(() => pill.classList.add('on'));
      // Again from the start, when the tips are asked for a second time.
      compass.classList.remove('wiggle');
      void compass.offsetWidth;
      compass.classList.add('wiggle');
      return;
    }
    clearInterval(ticker);
    pill.classList.remove('on');
    compass.classList.remove('wiggle');
    hideTimer = window.setTimeout(() => { pill.hidden = true; }, 300);
  }
  const covered = (): boolean => host.covered() || document.hidden || parent.closest('[hidden]') !== null;
  // On a touch screen the touch tour (src/tour.ts) teaches the view instead: the hint shows only when asked for.
  if (!hint.over() && !matchMedia('(pointer: coarse)').matches) ticker = window.setInterval(tick, HINT_TICK_MS);
  pill.addEventListener('click', () => hintChange(hint.dismiss()));

  return {
    setView: dial.setView,
    showTips() {
      const c = hint.show(performance.now());
      if (c) {
        clearInterval(ticker);
        ticker = window.setInterval(tick, HINT_TICK_MS);
      }
      hintChange(c);
    },
    dispose() {
      clearInterval(ticker);
      clearTimeout(hideTimer);
      pill.remove();
      canvas.removeEventListener('pointerdown', down);
      canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerup', up);
      canvas.removeEventListener('pointercancel', cancel);
      canvas.removeEventListener('lostpointercapture', cancel);
      canvas.removeEventListener('pointerleave', leave);
      canvas.removeEventListener('dblclick', dbl);
      canvas.removeEventListener('contextmenu', noMenu);
      canvas.removeEventListener('wheel', wheel);
      compass.remove();
    },
  };
}

/** What the compass steers. */
export interface CompassCam {
  turn(deg: number, eased: boolean): void;
  tilt(deg: number, eased: boolean): void;
  reset(): void;
  /** One zoom step: in (1) or out (-1). */
  zoomStep(dir: 1 | -1): void;
}

export interface CompassButton {
  readonly button: HTMLButtonElement;
  /** Shows a view turned `yaw` degrees and looking down at `pitch` degrees. */
  setView(yaw: number, pitch: number): void;
}

/** The compass, for either look's board: it shows the view, a finger, pen or mouse dragging it turns the view across
 *  and tilts it up and down, and a tap or click on it (or Enter or Space) resets the view (compass.ts); while it has
 *  the focus, Left and Right turn the view, Up and Down tilt it and + and − zoom it, without moving Theseus. `pointer` hears the kind of
 *  each pointer that presses it. */
export function createCompassButton(id: string, host: Pick<ControlHost, 'blocked' | 'gesture'>, cam: CompassCam, pointer: (type: string) => void = () => {}): CompassButton {
  const compass = button(id, 'Compass: drag or use the arrow keys to turn and tilt the view, plus and minus to zoom, tap to reset it', COMPASS, 'compass');
  compass.title = 'Compass';
  const needle = compass.querySelector('svg');
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
  compass.style.touchAction = 'none';
  // A press on the compass is the compass's alone: nothing under or round it (the board's own gestures) reads it.
  for (const t of ['pointerdown', 'pointermove', 'pointerup', 'pointercancel']) compass.addEventListener(t, e => e.stopPropagation());
  compass.addEventListener('pointerdown', (e: PointerEvent) => {
    pointer(e.pointerType);
    if (host.blocked() || (e.pointerType === 'mouse' && e.button !== 0)) return;
    e.preventDefault();
    try {
      compass.setPointerCapture(e.pointerId);
    } catch {
      // A synthetic pointer cannot be captured; its moves still reach the compass.
    }
    steerOps(steer.down(e.pointerId, e.clientX, e.clientY));
  });
  compass.addEventListener('pointermove', (e: PointerEvent) => {
    if (host.blocked()) return;
    steerOps(steer.move(e.pointerId, e.clientX, e.clientY));
  });
  compass.addEventListener('pointerup', (e: PointerEvent) => {
    const ops = steer.up(e.pointerId, e.clientX, e.clientY);
    if (ops.length) pressedAt = performance.now();
    if (!host.blocked()) steerOps(ops);
  });
  compass.addEventListener('pointercancel', (e: PointerEvent) => steerOps(steer.cancel(e.pointerId)));
  // The arrow keys steer from the focused compass; the page's own arrow keys (moving Theseus) never see them.
  const compassKeys: Record<string, () => void> = {
    ArrowLeft: () => cam.turn(-TURN_KEY, true),
    ArrowRight: () => cam.turn(TURN_KEY, true),
    ArrowUp: () => cam.tilt(-TILT_KEY, true),
    ArrowDown: () => cam.tilt(TILT_KEY, true),
    '+': () => cam.zoomStep(1),
    '=': () => cam.zoomStep(1),
    '-': () => cam.zoomStep(-1),
    '_': () => cam.zoomStep(-1),
  };
  compass.addEventListener('keydown', (e: KeyboardEvent) => {
    // Ctrl, Meta or Alt with a key is the browser's (Ctrl + zooms the page): the compass leaves it alone.
    if (e.ctrlKey || e.metaKey || e.altKey) return;
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
    if (performance.now() - pressedAt < CLICK_MS || host.blocked()) return;
    host.gesture();
    cam.reset();
  });
  return {
    button: compass,
    setView(yaw, pitch) {
      const f = compassFace({ yaw, pitch });
      if (needle) needle.style.transform = `scale(1, ${f.squash.toFixed(3)}) rotate(${f.needle.toFixed(1)}deg)`;
      compass.style.setProperty('--tilt', f.tilt.toFixed(3));
      compass.dataset.heading = String(Math.round(yaw));
      compass.dataset.pitch = String(Math.round(pitch));
    },
  };
}
