// A popover beside the button that opened it on a wide screen, and a sheet from the bottom of the screen on a phone: a
// title, a close button and its own content. A press outside it, or Escape, closes it.
import type { ComponentChildren } from 'preact';
import { useEffect, useLayoutEffect, useRef } from 'preact/hooks';
import { Glyph } from './Glyph.tsx';

export interface PopProps {
  title: string;
  /** The element it opened from: a popover sits beside it on a wide screen. */
  anchor: HTMLElement | null;
  onClose(): void;
  children?: ComponentChildren;
  /** A key for tests and e2e: data-pop="<name>". */
  name?: string;
}

/** Wider than this, a popover sits beside its button; narrower, it is a sheet from the bottom. */
export const WIDE = 640;

export function Pop(p: PopProps) {
  const box = useRef<HTMLDivElement>(null);
  const close = useRef(p.onClose);
  close.current = p.onClose;
  useEffect(() => {
    const down = (e: PointerEvent): void => {
      const t = e.target as Node | null;
      if (!box.current || !t || box.current.contains(t)) return;
      if (t instanceof Element && (t.closest('[data-pop-anchor]') || t.closest('[data-pop]'))) return;
      close.current();
    };
    const key = (e: KeyboardEvent): void => { if (e.key === 'Escape') { e.preventDefault(); close.current(); } };
    document.addEventListener('pointerdown', down, true);
    document.addEventListener('keydown', key);
    return () => { document.removeEventListener('pointerdown', down, true); document.removeEventListener('keydown', key); };
  }, []);
  useLayoutEffect(() => {
    const el = box.current;
    if (!el || typeof window === 'undefined' || !p.anchor || !(window.innerWidth > WIDE) || !p.anchor.getBoundingClientRect) return;
    const r = p.anchor.getBoundingClientRect();
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    el.style.left = `${Math.max(8, Math.min(window.innerWidth - w - 8, r.left))}px`;
    const below = r.bottom + 6;
    el.style.top = `${below + h < window.innerHeight - 8 ? below : Math.max(8, r.top - h - 6 > 8 ? r.top - h - 6 : window.innerHeight - h - 8)}px`;
  });
  return (
    <div ref={box} role="dialog" aria-label={p.title} data-pop={p.name ?? ''} class="cmp-pop">
      <div class="flex items-center gap-2 border-b border-rule px-4 py-2">
        <h3 class="min-w-0 flex-1 font-display text-lg font-semibold tracking-wide">{p.title}</h3>
        <button type="button" class="cmp-icon" aria-label="Close" title="Close" onClick={p.onClose}><Glyph name="close" /></button>
      </div>
      <div class="grid gap-3 overflow-y-auto p-4">{p.children}</div>
    </div>
  );
}

/** A titled part of a popover. */
export function PopSection(p: { title?: string; children?: ComponentChildren }) {
  return (
    <section class="grid gap-2">
      {p.title ? <h4 class="font-display text-sm font-semibold tracking-wide text-dim uppercase">{p.title}</h4> : null}
      {p.children}
    </section>
  );
}

/** A row of a popover's list: an icon and words, red for a removal. */
export function PopItem(p: { glyph: string; label: string; onClick(): void; danger?: boolean; data?: Record<`data-${string}`, string> }) {
  return (
    <button type="button" class={`cmp-pop-item${p.danger ? ' text-record' : ''}`} onClick={p.onClick} {...p.data}>
      <Glyph name={p.glyph} />{p.label}
    </button>
  );
}
