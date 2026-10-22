// A button that gives up focus when clicked, so the key that pressed it (Space,
// Enter) cannot press it again, with an optional key after its text.
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
  /** The key that does the same, shown after the text as the kit's dark keycap (.kit-key-inline). */
  keyLabel?: string;
  children?: ComponentChildren;
}

let pressed: Element | null = null;

/** The button whose click handler is running, which has already blurred itself: a Dialog that click opens returns focus here. */
export function lastPressed(): Element | null {
  return pressed;
}

export function Button(p: ButtonProps) {
  return (
    <button type="button" id={p.id} class={p.class} disabled={p.disabled} aria-label={p.label} title={p.title}
      aria-pressed={p.pressed} onClick={ev => {
        pressed = ev.currentTarget;
        ev.currentTarget.blur();
        p.onClick();
        // A dialog this click opened has taken it by now (synchronously, or in
        // Preact's next microtask); a dialog the game opens later must not.
        setTimeout(() => { pressed = null; }, 0);
      }}>
      {p.children}
      {p.keyLabel ? <KeyChip label={p.keyLabel} variant="tab" class="kit-key-inline" decorative /> : null}
    </button>
  );
}
