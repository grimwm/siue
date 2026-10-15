/* The tutorial's coach marks: a spotlight on the real control a step is about
 * (the rest of the screen dimmed, nothing blocked), and a small speech bubble
 * beside it with an arrow at it, the step's words, the keys on a keyboard, and
 * Skip and Next. The game owns the lesson (src/tutorial.ts, steps in
 * src/coach.ts) and hands in the step; this finds the step's target on the
 * page every frame, so the marks follow a scrolled list, a resize or a
 * rotation, and keeps the bubble on screen (placeBubble). While the step
 * cannot be done (a drone's turn) or its target is not on screen (the firing
 * range over the shop) the marks wait, hidden. The section element (#tutorial-overlay) stays in index.html
 * and the game shows and hides it; the marks draw inside it.
 * Copyright (C) 2026 William Grim
 * SPDX-License-Identifier: GPL-3.0-or-later */
import { render } from 'preact';
import { useLayoutEffect, useRef, useState } from 'preact/hooks';
import { KeyHints, Key, blurThen } from './chrome.tsx';
import type { KeyHintFn } from './chrome.tsx';
import { placeBubble, spotlight, union } from '../coach.ts';
import type { Placement, Rect } from '../coach.ts';

/** The step on show, as the game words it. */
export interface CoachView {
  id: string;
  /** "3 of 11". */
  count: string;
  text: string;
  /** The keys line with {context:action} tokens; null on touch screens. */
  keys: string | null;
  /** Selectors, tried in order (src/coach.ts CoachStep.target). */
  target: readonly string[];
  /** The last step: Next reads Done. */
  last: boolean;
}

export interface TutorialProps {
  keyHint: KeyHintFn;
  /** The step, or null while no lesson runs. */
  step: CoachView | null;
  /** The step cannot be done just now (a drone's turn, a name card): the marks wait, hidden. */
  waiting: boolean;
  /** The key Skip's chip names; none on touch screens. */
  skipKey?: string;
  onNext: () => void;
  onSkip: () => void;
}

/** Where the marks go, in the layer's own coordinates. */
interface Geometry { spot: Rect; place: Placement }

/** The marked elements wear this attribute (game.css draws their focus ring). */
export const TARGET_ATTR = 'data-coach-target';

/** Laid out on the page (a hidden panel's controls are not). */
function laidOut(el: Element): boolean {
  if (typeof el.getClientRects !== 'function') return false;
  const r = el.getBoundingClientRect();
  return el.getClientRects().length > 0 && r.width > 0 && r.height > 0;
}

/** Whether the topmost thing at the element's centre, the marks aside, is the element. */
function onTop(el: Element, layer: Element): boolean {
  const r = el.getBoundingClientRect();
  const x = r.left + r.width / 2;
  const y = r.top + r.height / 2;
  if (x < 0 || y < 0 || x > window.innerWidth || y > window.innerHeight) return false;
  if (typeof document.elementsFromPoint !== 'function') return true;
  const hit = document.elementsFromPoint(x, y).find(h => !layer.contains(h));
  return !!hit && (hit === el || el.contains(hit));
}

/** The step's target: for the first selector with one on top, the first laid-out
 *  match of each of its comma-separated parts (so "#a, #b" marks both). */
export function findTarget(selectors: readonly string[], layer: Element): Element[] {
  if (typeof document === 'undefined' || typeof document.querySelectorAll !== 'function') return [];
  for (const sel of selectors) {
    const found: Element[] = [];
    for (const part of sel.split(',')) {
      let list: Element[] = [];
      try { list = [...document.querySelectorAll(part.trim())]; } catch { list = []; }
      const el = list.find(laidOut);
      if (el) found.push(el);
    }
    if (found.length && onTop(found[0]!, layer)) return found;
  }
  return [];
}

/** The first laid-out match of a step's first selector, for scrolling it into view. */
function firstMatch(selectors: readonly string[]): Element | null {
  if (typeof document === 'undefined' || typeof document.querySelectorAll !== 'function') return null;
  for (const sel of selectors) {
    try {
      const el = [...document.querySelectorAll(sel.split(',')[0]!.trim())].find(laidOut);
      if (el) return el;
    } catch { /* not a selector this browser reads */ }
  }
  return null;
}

/** The text of a keys line, with each {context:action} as a key cap. */
function KeysLine({ line }: { line: string }) {
  const parts = line.split(/(\{[a-z]+:[a-zA-Z]+(?::\d+)?\})/);
  return <>{parts.map((part, i) => (i % 2 ? <Key key={i} at={part.slice(1, -1)} cls="hk" /> : part))}</>;
}

function Marks(p: TutorialProps & { step: CoachView }) {
  const bubble = useRef<HTMLDivElement>(null);
  const [geo, setGeo] = useState<Geometry | null>(null);
  const focused = useRef('');
  const marked = useRef<Element[]>([]);
  const waiting = useRef(p.waiting);
  waiting.current = p.waiting;
  const step = p.step;

  // Every frame: find the target, measure, and move the marks when anything moved.
  useLayoutEffect(() => {
    const layer = bubble.current?.parentElement;
    if (!layer) return undefined;
    firstMatch(step.target)?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
    let last = '';
    let raf = 0;
    const mark = (els: Element[]) => {
      if (els.length === marked.current.length && els.every((el, i) => el === marked.current[i])) return;
      for (const el of marked.current) el.removeAttribute(TARGET_ATTR);
      for (const el of els) el.setAttribute(TARGET_ATTR, '');
      marked.current = els;
    };
    const measure = () => {
      const els = waiting.current ? [] : findTarget(step.target, layer);
      mark(els);
      const box = layer.getBoundingClientRect();
      const b = bubble.current;
      const rect = union(els.map(el => {
        const r = el.getBoundingClientRect();
        return { left: r.left - box.left, top: r.top - box.top, width: r.width, height: r.height };
      }));
      const view = { w: layer.clientWidth, h: layer.clientHeight };
      const next: Geometry | null = rect && b && view.w > 0 && view.h > 0
        ? { spot: spotlight(rect, view), place: placeBubble(rect, { w: b.offsetWidth, h: b.offsetHeight }, view) }
        : null;
      const key = next ? JSON.stringify([next.spot, next.place].map(o => Object.values(o).map(v => (typeof v === 'number' ? Math.round(v) : v)))) : '';
      if (key !== last) { last = key; setGeo(next); }
      if (typeof requestAnimationFrame === 'function') raf = requestAnimationFrame(measure);
    };
    measure();
    return () => {
      if (raf && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(raf);
      mark([]);
    };
  }, [step.id]);

  // Focus moves to the bubble once per step, as it first shows.
  useLayoutEffect(() => {
    if (!geo || focused.current === step.id) return;
    focused.current = step.id;
    bubble.current?.focus({ preventScroll: true });
  }, [geo, step.id]);

  const place = geo?.place;
  return (
    <>
      {geo && <div class="coach-spot" style={{ left: `${geo.spot.left}px`, top: `${geo.spot.top}px`, width: `${geo.spot.width}px`, height: `${geo.spot.height}px` }} />}
      <div class="coach-bubble" ref={bubble} role="dialog" aria-modal="false" aria-labelledby="tutorial-count" aria-describedby="tutorial-text"
        tabIndex={-1} data-side={place?.side ?? 'none'} data-waiting={geo ? undefined : ''}
        style={place ? { left: `${place.x}px`, top: `${place.y}px`, '--arrow': `${place.arrow}px` } : undefined}>
        <p class="coach-count" id="tutorial-count"><span aria-hidden="true">🎓 </span>Tutorial · {step.count}</p>
        <p class="coach-text" id="tutorial-text" aria-live="polite">{step.text}</p>
        {step.keys && <p class="coach-keys" id="tutorial-keys"><KeysLine line={step.keys} /></p>}
        <div class="coach-acts">
          <button type="button" id="tutorial-skip" class="coach-skip" onClick={blurThen(p.onSkip)}>
            Skip{p.skipKey && <>{' '}<Key at={p.skipKey} bare /></>}
          </button>
          <button type="button" id="tutorial-next" class="btn-primary coach-next" onClick={blurThen(p.onNext)}>{step.last ? 'Done' : 'Next'}</button>
        </div>
      </div>
    </>
  );
}

export function Tutorial(p: TutorialProps) {
  return (
    <KeyHints.Provider value={p.keyHint}>
      {p.step && <Marks key={p.step.id} {...p} step={p.step} />}
    </KeyHints.Provider>
  );
}

/** Draws (or redraws) the coach marks into their section. */
export function renderTutorial(container: Element, props: TutorialProps): void {
  render(<Tutorial {...props} />, container);
}
