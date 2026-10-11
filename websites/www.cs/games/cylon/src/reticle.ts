/* Cylon Defense: the aim and the reticle.
 *
 * The player's aim is the cursor (the reticle follows the mouse on a desktop,
 * and on a touch screen a finger drags the reticle's pip). This module keeps the
 * aim point current (viewport and page coordinates, and the last aim the
 * missiles lock on), paints the reticle, shows it only while a run is live, and
 * binds the touch drag. Moving the aim wakes the eye's tracking and arms the
 * idle timer that puts it back to sleep.
 *
 * It touches only the reticle element it is handed and `window`. Browser-only:
 * it compiles in the DOM program. */
import type { AimPoint, Game, Mouse, Settings } from './types.js';

export interface ReticleDeps {
  /** The reticle; without it only the aim point is kept. */
  reticleEl: HTMLElement | null;
  mouse: Mouse;
  lastAim: AimPoint;
  game: Game;
  settings: Settings;
  /** A touch screen: the reticle is dragged instead of following a mouse. */
  coarsePointer: boolean;
  /** How long the cursor may rest before the eye stops tracking it. */
  IDLE_MS: number;
  isGameLive: () => boolean;
  isEyeDisoriented: () => boolean;
  setEyeTracking: (on: boolean) => void;
  audio: { prime(): void };
  abilities: { grenadeArmed(): boolean };
  scrollX: () => number;
  scrollY: () => number;
}

export interface Reticle {
  /** Document aim coordinates follow the viewport ones (a scroll does not fire pointermove). */
  syncMousePageFromClient(): void;
  paintReticle(): void;
  /** Shows the reticle while a run is live, hides it otherwise. */
  syncReticleVisibility(): void;
  /** A new run starts with the aim in the middle of the screen. */
  resetReticleToCenter(): void;
  /** The window's pointermove handler. */
  onPointerMove(e: PointerEvent): void;
  /** Binds the touch drag (touch screens only). */
  bindReticle(): void;
}

export function createReticle(d: ReticleDeps): Reticle {
  const { reticleEl, mouse, lastAim, game, settings, coarsePointer, IDLE_MS, isGameLive, isEyeDisoriented,
    setEyeTracking, audio, abilities, scrollX, scrollY } = d;

  function syncMousePageFromClient() {
    // Scroll does not fire pointermove; keep document aim coords fresh.
    mouse.pageX = mouse.clientX + scrollX();
    mouse.pageY = mouse.clientY + scrollY();
  }

  function paintReticle() {
    if (!reticleEl || reticleEl.hidden) return;
    reticleEl.style.transform = `translate(${mouse.clientX}px, ${mouse.clientY}px)`;
  }

  function setAim(clientX: number, clientY: number): void {
    const vw = window.innerWidth || 1;
    const vh = window.innerHeight || 1;
    mouse.clientX = Math.min(vw - 8, Math.max(8, clientX));
    mouse.clientY = Math.min(vh - 8, Math.max(8, clientY));
    syncMousePageFromClient();
    mouse.t = performance.now();
    paintReticle();
    lastAim.clientX = mouse.clientX;
    lastAim.clientY = mouse.clientY;
    lastAim.t = performance.now();
    if (isGameLive() && settings.eyeEnabled && !isEyeDisoriented()) {
      setEyeTracking(true);
      clearTimeout(game.idleTimer!);
      game.idleTimer = setTimeout(() => setEyeTracking(false), IDLE_MS);
    }
  }

  function syncReticleVisibility() {
    if (!reticleEl) return;
    const show = isGameLive();
    reticleEl.hidden = !show;
    reticleEl.setAttribute('aria-hidden', show ? 'false' : 'true');
    // Desktop: follow the mouse without stealing clicks; mobile keeps drag
    reticleEl.classList.toggle('is-mouse-follow', show && !coarsePointer);
    if (show) paintReticle();
  }

  function resetReticleToCenter() {
    setAim(window.innerWidth / 2, window.innerHeight * 0.42);
  }

  function isUiAimBlocker(el: Element | null): boolean {
    if (!el || !el.closest) return false;
    return !!el.closest('.site-nav, .cylon-help, .cylon-gameover, .cylon-settings-panel');
  }

  function onPointerMove(e: PointerEvent): void {
    audio.prime();
    // Reticle finger is handled in bindReticle (per pointerId)
    if (game.reticlePointerId != null && e.pointerId === game.reticlePointerId) return;
    // Other touch fingers must not move aim (so a tap/attack finger is free)
    if (coarsePointer && e.pointerType === 'touch') return;
    // Don't drag aim (and seeking nukes) up into the nav when clicking Raptor / gear
    if (isUiAimBlocker(e.target as Element | null)) return;
    setAim(e.clientX, e.clientY);
  }

  function endReticleDrag(e?: PointerEvent): void {
    if (game.reticlePointerId == null || (e && e.pointerId !== game.reticlePointerId)) return;
    game.draggingReticle = false;
    game.reticlePointerId = null;
    reticleEl?.classList.remove('is-dragging');
  }

  function bindReticle() {
    if (!reticleEl || !coarsePointer) return;

    // No setPointerCapture — capturing the dodge finger blocks other fingers
    // from hitting Grenade / Raptor / bots on many mobile browsers.
    reticleEl.addEventListener('pointerdown', (e) => {
      if (!isGameLive()) return;
      if (e.button != null && e.button !== 0) return;
      if (game.reticlePointerId != null) return; // already steering with another finger
      if (abilities.grenadeArmed()) return; // window capture handler throws instead
      e.preventDefault();
      game.draggingReticle = true;
      game.reticlePointerId = e.pointerId;
      reticleEl.classList.add('is-dragging');
      setAim(e.clientX, e.clientY);
    });

    const onReticleMove = (e: PointerEvent): void => {
      if (game.reticlePointerId == null || e.pointerId !== game.reticlePointerId) return;
      e.preventDefault();
      setAim(e.clientX, e.clientY);
    };
    window.addEventListener('pointermove', onReticleMove, { passive: false });
    window.addEventListener('pointerup', endReticleDrag, true);
    window.addEventListener('pointercancel', endReticleDrag, true);

  }

  return { syncMousePageFromClient, paintReticle, syncReticleVisibility, resetReticleToCenter, onPointerMove, bindReticle };
}
