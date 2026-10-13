// A modal panel inside its veil. The game says whether it is open; the dialog
// moves focus in when it opens and back when it closes, and Q (the kit's back
// key, keys.ts) or a click on the veil itself calls onDismiss when the game
// gives one. Escape does nothing here. A game whose own key router already
// handles Q should not pass onDismiss for it.
import type { ComponentChildren } from 'preact';
import { useLayoutEffect, useRef } from 'preact/hooks';
import { isBackKey, typesText } from '../keys.ts';
import { lastPressed } from './button.tsx';

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
  /** The element focused on opening; otherwise the panel's first usable button, else the panel. */
  focusId?: string;
  onDismiss?: () => void;
  children?: ComponentChildren;
}

export function Dialog(p: DialogProps) {
  const panel = useRef<HTMLDivElement>(null);
  const returnTo = useRef<Element | null>(null);
  const wasOpen = useRef(false);

  const pressedOnVeil = useRef(false);

  const giveFocusBack = (): void => {
    (returnTo.current as HTMLElement | null)?.focus?.();
    returnTo.current = null;
  };

  // Layout effects run as soon as the DOM is updated, so focus moves before
  // the player can press another key.
  useLayoutEffect(() => {
    if (p.open && !wasOpen.current) {
      // A kit Button blurs itself before it opens us, leaving nothing focused.
      const active = document.activeElement;
      returnTo.current = active && active !== document.body ? active : lastPressed();
      const named = p.focusId ? document.getElementById(p.focusId) : null;
      const usable = Array.from(panel.current?.querySelectorAll('button') ?? []).find(b => !b.disabled && !b.hidden);
      ((named ?? usable ?? panel.current) as HTMLElement | null)?.focus?.();
    } else if (!p.open && wasOpen.current) {
      giveFocusBack();
    }
    wasOpen.current = p.open;
  }, [p.open]);

  // A game that unmounts an open dialog still gets its focus back.
  useLayoutEffect(() => () => { if (wasOpen.current) giveFocusBack(); }, []);

  useLayoutEffect(() => {
    const dismiss = p.onDismiss;
    if (!p.open || !dismiss) return undefined;
    // Captured, and stopped there: an open dialog owns Q, so the game's own
    // key router under it never also acts on it (Crete's Q is Quit).
    const onKey = (ev: KeyboardEvent): void => {
      if (!isBackKey(ev) || typesText(ev.target)) return;
      ev.preventDefault();
      ev.stopPropagation();
      dismiss();
    };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [p.open, p.onDismiss]);

  return (
    <div id={p.id} class={p.veilClass} hidden={!p.open}
      onPointerDown={ev => { pressedOnVeil.current = ev.target === ev.currentTarget; }}
      onClick={ev => {
        // A drag that began in the panel (selecting text) ends on the veil with a click there too.
        const dismiss = pressedOnVeil.current && ev.target === ev.currentTarget;
        pressedOnVeil.current = false;
        if (dismiss) p.onDismiss?.();
      }}>
      <div class={p.panelClass} role={p.role ?? 'dialog'} aria-modal="true" aria-labelledby={p.titleId}
        aria-describedby={p.describedBy} tabIndex={-1} ref={panel}>
        {p.kicker != null && p.kicker !== false && <p class={p.kickerClass} id={p.kickerId}>{p.kicker}</p>}
        <h2 id={p.titleId} class={p.titleClass}>{p.title}</h2>
        {p.children}
      </div>
    </div>
  );
}
