// A modal panel inside its veil. The game says whether it is open; the dialog
// moves focus in when it opens and back when it closes, and Escape or a click
// on the veil itself calls onDismiss when the game gives one.
import type { ComponentChildren } from 'preact';
import { useLayoutEffect, useRef } from 'preact/hooks';

export interface DialogProps {
  open: boolean;
  /** The veil's id and class (the page's CSS styles both). */
  id: string;
  veilClass: string;
  panelClass: string;
  role?: 'dialog' | 'alertdialog';
  titleId: string;
  title: ComponentChildren;
  titleClass?: string;
  kicker?: ComponentChildren;
  kickerId?: string;
  kickerClass?: string;
  describedBy?: string;
  /** The element focused on opening; otherwise the panel's first button. */
  focusId?: string;
  onDismiss?: () => void;
  children?: ComponentChildren;
}

export function Dialog(p: DialogProps) {
  const panel = useRef<HTMLDivElement>(null);
  const returnTo = useRef<Element | null>(null);
  const wasOpen = useRef(false);

  // Layout effects run as soon as the DOM is updated, so focus moves before
  // the player can press another key.
  useLayoutEffect(() => {
    if (p.open && !wasOpen.current) {
      returnTo.current = document.activeElement ?? null;
      const named = p.focusId ? document.getElementById(p.focusId) : null;
      const target = (named ?? panel.current?.querySelector('button') ?? null) as HTMLElement | null;
      target?.focus?.();
    } else if (!p.open && wasOpen.current) {
      (returnTo.current as HTMLElement | null)?.focus?.();
      returnTo.current = null;
    }
    wasOpen.current = p.open;
  }, [p.open]);

  useLayoutEffect(() => {
    const dismiss = p.onDismiss;
    if (!p.open || !dismiss) return undefined;
    const onKey = (ev: KeyboardEvent): void => {
      if (ev.key !== 'Escape') return;
      ev.preventDefault();
      dismiss();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [p.open, p.onDismiss]);

  return (
    <div id={p.id} class={p.veilClass} hidden={!p.open}
      onClick={ev => { if (ev.target === ev.currentTarget) p.onDismiss?.(); }}>
      <div class={p.panelClass} role={p.role ?? 'dialog'} aria-modal="true" aria-labelledby={p.titleId}
        aria-describedby={p.describedBy} ref={panel}>
        {p.kicker !== undefined && <p class={p.kickerClass} id={p.kickerId}>{p.kicker}</p>}
        <h2 id={p.titleId} class={p.titleClass}>{p.title}</h2>
        {p.children}
      </div>
    </div>
  );
}
