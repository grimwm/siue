/* Cylon Defense: the page holds still while a run is live, wherever the game is
 * installed (the home page, or another site's page through the embed).
 *
 * Held, the root stops scrolling (`html.cylon-scroll-held`, fx.css: overflow
 * hidden, with the classic scrollbar's room kept so nothing shifts), and so does
 * any wrapper a theme scrolls instead of the document (`.cylon-scroll-held`).
 * The wheel, touch drags and the scroll keys are refused outside the panels
 * that scroll on their own, and anything that still moves the page (a focus, a
 * theme's script) is put back where the page was held. Released, every class
 * and style it set comes off and the page scrolls from where it stood. */

import { typesText } from '../../_kit/keys.ts';

/** The keys a browser scrolls the page with. */
const SCROLL_KEYS: ReadonlySet<string> = new Set(
  [' ', 'Spacebar', 'PageUp', 'PageDown', 'Home', 'End', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);

/** Where Space or Enter presses the focused control instead of scrolling. */
const PRESSABLE = 'button, a[href], summary, label, [role="button"], [role="link"], [role="checkbox"], [role="switch"], [role="tab"], [role="radio"], [role="menuitem"]';

/** How deep below <body> a theme's scrolling wrapper is looked for. */
const WRAPPER_DEPTH = 3;

/** The part of a keyboard event the lock reads. */
export interface ScrollKeyEvent {
  key?: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
}

/** True when the press would scroll the page: a scroll key with no Ctrl, Cmd or Alt (those chords stay the browser's). */
export function isScrollKey(ev: ScrollKeyEvent): boolean {
  return !!ev.key && SCROLL_KEYS.has(ev.key) && !ev.ctrlKey && !ev.metaKey && !ev.altKey;
}

export interface ScrollLockDeps {
  doc: Document;
  win: Window;
  /** Whether the browser keeps a scrollbar's room with `scrollbar-gutter: stable` (CSS.supports). */
  gutterStable: boolean;
  /** The game's panels that scroll on their own while the page is held (How to Play, game over, settings). */
  panels: string;
  /** Where a touch drag is left alone (the panels and the combat nav). */
  touchFree: string;
  /** Whether a run is live: the wheel, touch and key guards act only then. */
  live: () => boolean;
}

export interface ScrollLock {
  /** Holds the page where it is. A second call does nothing. */
  hold(): void;
  /** Lets the page scroll again, from where it stands. */
  release(): void;
  held(): boolean;
  /** Moves a held page (the game's own scroll to the top); the page is then held there. */
  moveTo(top: number, smooth: boolean): void;
  /** Adds the wheel, touch, key and scroll guards. Once. */
  bind(): void;
}

interface Saved {
  x: number;
  y: number;
  gutter: string;
  gutterPriority: string;
  padding: string;
  paddingPriority: string;
  wrappers: { el: Element; top: number; left: number }[];
}

export function createScrollLock(d: ScrollLockDeps): ScrollLock {
  const { doc, win } = d;
  let saved: Saved | null = null;
  /** The game's own move is under way: the scroll guard lets it run. */
  let moving = false;
  let movingTimer: ReturnType<typeof setTimeout> | null = null;

  const inPanel = (t: EventTarget | null, sel: string): boolean => !!(t && (t as Element).closest
    && (t as Element).closest(sel));

  /** The elements under <body>, <body> itself included, that scroll their content the way the document would. */
  function scrollingWrappers(): Element[] {
    const out: Element[] = [];
    const visit = (el: Element, depth: number): void => {
      if (el.matches(d.touchFree) || el.matches(d.panels)) return;
      const oy = win.getComputedStyle(el).overflowY;
      if ((oy === 'auto' || oy === 'scroll' || oy === 'overlay') && el.scrollHeight > el.clientHeight + 1) out.push(el);
      if (depth >= WRAPPER_DEPTH) return;
      for (const c of Array.from(el.children)) visit(c, depth + 1);
    };
    if (doc.body) visit(doc.body, 0);
    return out;
  }

  function hold(): void {
    if (saved) return;
    const root = doc.documentElement;
    const body = doc.body;
    // A classic scrollbar's width; overlay scrollbars (phones, most Macs) take none.
    const bar = Math.max(0, win.innerWidth - root.clientWidth);
    saved = {
      x: win.scrollX,
      y: win.scrollY,
      gutter: root.style.getPropertyValue('scrollbar-gutter'),
      gutterPriority: root.style.getPropertyPriority('scrollbar-gutter'),
      padding: body.style.getPropertyValue('padding-right'),
      paddingPriority: body.style.getPropertyPriority('padding-right'),
      wrappers: scrollingWrappers().map((el) => ({ el, top: el.scrollTop, left: el.scrollLeft })),
    };
    if (bar > 0) {
      // Keep the scrollbar's room so the page does not widen under the player.
      if (d.gutterStable) {
        root.style.setProperty('scrollbar-gutter', 'stable', 'important');
      } else {
        const pad = parseFloat(win.getComputedStyle(body).paddingRight) || 0;
        body.style.setProperty('padding-right', `${pad + bar}px`, 'important');
      }
    }
    for (const w of saved.wrappers) w.el.classList.add('cylon-scroll-held');
    root.classList.add('cylon-scroll-held');
  }

  function release(): void {
    if (!saved) return;
    const root = doc.documentElement;
    const body = doc.body;
    root.classList.remove('cylon-scroll-held');
    for (const w of saved.wrappers) w.el.classList.remove('cylon-scroll-held');
    if (saved.gutter) root.style.setProperty('scrollbar-gutter', saved.gutter, saved.gutterPriority);
    else root.style.removeProperty('scrollbar-gutter');
    if (saved.padding) body.style.setProperty('padding-right', saved.padding, saved.paddingPriority);
    else body.style.removeProperty('padding-right');
    saved = null;
    stopMoving();
  }

  function stopMoving(): void {
    moving = false;
    if (movingTimer) clearTimeout(movingTimer);
    movingTimer = null;
  }

  function moveTo(top: number, smooth: boolean): void {
    if (saved) {
      saved.y = top;
      saved.x = 0;
      moving = smooth;
      if (movingTimer) clearTimeout(movingTimer);
      // scrollend ends it where supported; a smooth scroll is over well within this.
      movingTimer = smooth ? setTimeout(stopMoving, 1500) : null;
    }
    win.scrollTo({ top, left: 0, behavior: smooth ? 'smooth' : 'instant' });
  }

  /** Puts back whatever moved while the page is held. */
  function onScroll(e: Event): void {
    if (!saved || moving) return;
    const t = e.target;
    if (t === doc || t === doc.documentElement || t === doc.body) {
      if (win.scrollX !== saved.x || win.scrollY !== saved.y) {
        win.scrollTo({ top: saved.y, left: saved.x, behavior: 'instant' });
      }
      return;
    }
    const w = saved.wrappers.find((s) => s.el === t);
    if (w && (w.el.scrollTop !== w.top || w.el.scrollLeft !== w.left)) {
      w.el.scrollTop = w.top;
      w.el.scrollLeft = w.left;
    }
  }

  function onWheel(e: WheelEvent): void {
    if (!d.live() || inPanel(e.target, d.panels)) return;
    e.preventDefault();
  }

  // iOS pans on touchmove unless the listener is non-passive and prevents it.
  function onTouchMove(e: TouchEvent): void {
    if (!d.live() || inPanel(e.target, d.touchFree)) return;
    e.preventDefault();
  }

  function onKey(e: KeyboardEvent): void {
    if (e.defaultPrevented || !d.live() || !isScrollKey(e)) return;
    const t = e.target;
    if (typesText(t) || inPanel(t, d.panels)) return;
    // A focused slider, checkbox or select takes the arrows; a focused control is pressed by Space.
    if (inPanel(t, 'input, select, textarea')) return;
    if ((e.key === ' ' || e.key === 'Spacebar') && inPanel(t, PRESSABLE)) return;
    e.preventDefault();
  }

  let bound = false;
  function bind(): void {
    if (bound) return;
    bound = true;
    doc.addEventListener('wheel', onWheel, { passive: false });
    doc.addEventListener('touchmove', onTouchMove, { passive: false });
    win.addEventListener('keydown', onKey);
    // Capture: an element's scroll does not bubble.
    doc.addEventListener('scroll', onScroll, { capture: true, passive: true });
    win.addEventListener('scrollend', stopMoving, { passive: true });
  }

  return { hold, release, held: () => saved !== null, moveTo, bind };
}
