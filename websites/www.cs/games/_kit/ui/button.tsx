// A button that gives up focus when clicked, so the key that pressed it (Space,
// Enter) cannot press it again, with an optional key chip after its text.
import type { ComponentChildren } from 'preact';
import { KeyChip } from './key-chip.tsx';

export interface ButtonProps {
  onClick: () => void;
  id?: string;
  class?: string;
  disabled?: boolean;
  /** The accessible name, for a button whose text is a symbol. */
  label?: string;
  title?: string;
  /** aria-pressed, for a toggle. */
  pressed?: boolean;
  /** The key that does the same, shown as a chip after the text. */
  keyLabel?: string;
  children?: ComponentChildren;
}

let pressed: Element | null = null;

/** The button last clicked, which has already blurred itself: a Dialog it opens returns focus here. */
export function lastPressed(): Element | null {
  return pressed;
}

export function Button(p: ButtonProps) {
  return (
    <button type="button" id={p.id} class={p.class} disabled={p.disabled} aria-label={p.label} title={p.title}
      aria-pressed={p.pressed} onClick={ev => { pressed = ev.currentTarget; ev.currentTarget.blur(); p.onClick(); }}>
      {p.children}
      {p.keyLabel ? <> <KeyChip label={p.keyLabel} decorative /></> : null}
    </button>
  );
}
