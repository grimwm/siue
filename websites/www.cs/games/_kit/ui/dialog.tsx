// A modal panel inside its veil. The game says whether it is open; the dialog
// moves focus in when it opens and back when it closes, keeps Tab inside the
// panel while it is open (it is aria-modal), and Q (the kit's back
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
  /** The element focused on opening; otherwise the panel's first usable button (enabled, and
      neither it nor anything around it in the panel `hidden`), else the panel. */
  focusId?: string;
  onDismiss?: () => void;
  children?: ComponentChildren;
}

const TABBABLE = new Set(['button', 'input', 'select', 'textarea']);

/** True for a subtree the browser never focuses into: display:none, or inert. */
function unfocusable(node: HTMLElement): boolean {
  if (node.hidden || node.inert || node.getAttribute('inert') != null) return true;
  if (node.style && node.style.display === 'none') return true;
  if (typeof getComputedStyle === 'function') {
    try { if (getComputedStyle(node).display === 'none') return true; } catch { /* a detached node answers nothing */ }
  }
  return false;
}

/** What Tab reaches inside `root`, in order: enabled controls (links with an
 *  href, anything with a tabindex of 0 or more) outside any subtree that is
 *  hidden, display:none, inert or inside a disabled fieldset. */
function tabbables(root: Element): HTMLElement[] {
  const out: HTMLElement[] = [];
  const visit = (el: Element, off: boolean): void => {
    let legendSeen = false;
    for (const c of Array.from(el.children)) {
      if (c.nodeType !== 1) continue;
      const node = c as HTMLElement;
      const tag = (node.localName || '').toLowerCase();
      // A disabled fieldset disables everything in it but its first legend's controls.
      const exempt = tag === 'legend' && !legendSeen;
      if (tag === 'legend') legendSeen = true;
      if (unfocusable(node)) continue;
      const index = node.getAttribute('tabindex');
      const reach = index != null ? Number(index) >= 0
        : TABBABLE.has(tag) || (tag === 'a' && node.getAttribute('href') != null);
      const nodeOff = off && !exempt;
      if (reach && !nodeOff && !(node as HTMLButtonElement).disabled) out.push(node);
      visit(node, nodeOff || (tag === 'fieldset' && (node as HTMLFieldSetElement).disabled === true));
    }
  };
  visit(root, false);
  return out;
}

function within(root: Element, el: Element | null): boolean {
  for (let n: Node | null = el; n; n = n.parentNode) if (n === root) return true;
  return false;
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
      const usable = panel.current ? tabbables(panel.current).find(el => el.localName === 'button') : undefined;
      ((named ?? usable ?? panel.current) as HTMLElement | null)?.focus?.();
    } else if (!p.open && wasOpen.current) {
      giveFocusBack();
    }
    wasOpen.current = p.open;
  }, [p.open]);

  // A game that unmounts an open dialog still gets its focus back.
  useLayoutEffect(() => () => { if (wasOpen.current) giveFocusBack(); }, []);

  // aria-modal: Tab and Shift+Tab wrap inside the panel, and focus that
  // strayed behind the veil comes back in, so nothing under it is pressed.
  useLayoutEffect(() => {
    if (!p.open) return undefined;
    const onTab = (ev: KeyboardEvent): void => {
      const box = panel.current;
      if (ev.key !== 'Tab' || ev.ctrlKey || ev.altKey || ev.metaKey || !box) return;
      const items = tabbables(box);
      const active = document.activeElement;
      const inside = within(box, active);
      if (!items.length) {
        ev.preventDefault();
        box.focus();
        return;
      }
      const first = items[0]!;
      const last = items[items.length - 1]!;
      // Focus on anything that is not itself a Tab stop (a tabindex=-1 element, the
      // panel) counts as an end: native Tab from there could leave the panel.
      const stop = items.includes(active as HTMLElement);
      const wrap = ev.shiftKey ? !inside || !stop || active === first : !inside || !stop || active === last;
      if (!wrap) return;
      ev.preventDefault();
      (ev.shiftKey ? last : first).focus();
    };
    document.addEventListener('keydown', onTab, true);
    return () => document.removeEventListener('keydown', onTab, true);
  }, [p.open]);

  useLayoutEffect(() => {
    const dismiss = p.onDismiss;
    if (!p.open || !dismiss) return undefined;
    // Captured, and stopped there: an open dialog owns Q, so the game's own
    // key router under it never also acts on it (Crete's Q opens its menu).
    const onKey = (ev: KeyboardEvent): void => {
      if (!isBackKey(ev) || typesText(ev.target)) return;
      ev.preventDefault();
      ev.stopPropagation();
      if (!ev.repeat) dismiss();
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
