// "How to read this": everything dimmed but the part being explained, a
// numbered badge on it, and a card with the explanation, an everyday
// comparison, Hear it, Back, Next and Close. The card sits above or below the
// lit part, never over it. Focus moves to the card and Tab stays inside it;
// Close is the way out (Escape is never bound).
import { useEffect, useRef, useState } from 'preact/hooks';
import { clipLength } from '../../guide.ts';
import type { GuideClip, GuidePart, GuideSpot } from '../../guide.ts';
import { Button } from './Button.tsx';
import { Panel } from './Panel.tsx';

export interface SpotBox { left: number; top: number; width: number; height: number }
export interface GuideOverlayProps {
  parts: readonly GuidePart[];
  onHear(clip: GuideClip): void;
  /** Whatever Hear it started must stop: called on Back, Next and Close. */
  onStop?(): void;
  onClose(): void;
  locate?(spot: GuideSpot): SpotBox | null;
}

/** A shadow far larger than the screen dims everything outside the lit spot. */
const VEIL = 'shadow-[0_0_0_9999px_color-mix(in_oklab,var(--color-well)_80%,transparent)]';
const FALLBACK_HEIGHT = 800;

/** The spot on screen: the anchor element's box, offset by the part's rect when it has one. */
export function locateSpot(spot: GuideSpot): SpotBox | null {
  const el = document.querySelectorAll(`[data-guide="${spot.anchor}"]`)[0];
  if (!el) return null;
  const box = el.getBoundingClientRect();
  return spot.rect
    ? { left: box.left + spot.rect.x, top: box.top + spot.rect.y, width: spot.rect.w, height: spot.rect.h }
    : { left: box.left, top: box.top, width: box.width, height: box.height };
}

export function GuideOverlay(p: GuideOverlayProps) {
  const [at, setAt] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [, redraw] = useState(0);
  const card = useRef<HTMLElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const part = p.parts[Math.min(at, p.parts.length - 1)]!;
  const box = (p.locate ?? locateSpot)(part.spot);
  // The card takes the half of the screen the lit part is not in.
  const below = box ? box.top + box.height / 2 < (window.innerHeight || FALLBACK_HEIGHT) / 2 : true;

  useEffect(() => { card.current?.focus(); }, []);
  // The lit spot follows the page when it scrolls or resizes.
  useEffect(() => {
    const again = (): void => redraw(n => n + 1);
    window.addEventListener('resize', again);
    window.addEventListener('scroll', again, true);
    return () => { window.removeEventListener('resize', again); window.removeEventListener('scroll', again, true); };
  }, []);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  // A new part brings its spot on screen.
  useEffect(() => { document.querySelectorAll(`[data-guide="${part.spot.anchor}"]`)[0]?.scrollIntoView({ block: 'nearest' }); redraw(n => n + 1); }, [at]);

  const quiet = (): void => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setPlaying(false);
    p.onStop?.();
  };
  const hear = (): void => {
    p.onHear(part.clip);
    setPlaying(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setPlaying(false), clipLength(part.clip) * 1000);
  };
  const go = (n: number): void => { quiet(); setAt(n); };
  const close = (): void => { quiet(); p.onClose(); };
  // Tab and Shift+Tab stay among the card's enabled buttons.
  const keepFocus = (e: KeyboardEvent): void => {
    if (e.key !== 'Tab' || !card.current) return;
    const buttons = [...card.current.querySelectorAll('button')].filter(b => !b.disabled);
    const first = buttons[0];
    const last = buttons[buttons.length - 1];
    if (!first || !last) return;
    if (e.shiftKey && (document.activeElement === first || document.activeElement === card.current)) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };

  return (
    <div data-guide-overlay="" class="fixed inset-0 z-40" onKeyDown={keepFocus}>
      {box ? (
        <div aria-hidden="true" data-guide-spot="" class={`pointer-events-none fixed rounded-md ring-2 ring-amber ${VEIL}`}
          style={{ left: `${box.left}px`, top: `${box.top}px`, width: `${box.width}px`, height: `${box.height}px` }}>
          <span class="absolute -top-3 -left-3 grid size-7 place-items-center rounded-full bg-amber font-mono text-xs font-semibold text-on-accent">{at + 1}</span>
        </div>
      ) : <div aria-hidden="true" class="fixed inset-0 bg-well/80" />}
      <Panel role="dialog" label={part.title} tabIndex={-1} panelRef={card} data={{ 'data-guide-card': '' }} accent
        class={`fixed inset-x-4 mx-auto grid max-h-[50vh] max-w-md gap-3 overflow-y-auto shadow-lg ${below ? 'bottom-4' : 'top-4'}`}>
        <p class="font-mono text-xs tracking-widest uppercase text-dim">Part {at + 1} of {p.parts.length}</p>
        <h2 class="font-display text-2xl font-semibold uppercase">{part.title}</h2>
        <p>{part.what}</p>
        <p class="text-dim">{part.like}</p>
        <div class="flex flex-wrap gap-2">
          <Button variant="primary" onClick={hear}>{playing ? 'Playing…' : 'Hear it'}</Button>
          <Button onClick={() => go(at - 1)} disabled={at === 0}>Back</Button>
          <Button onClick={() => go(at + 1)} disabled={at === p.parts.length - 1}>Next</Button>
          <Button variant="ghost" onClick={close}>Close</Button>
        </div>
      </Panel>
    </div>
  );
}
