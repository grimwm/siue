// The console's button: primary (amber), secondary, ghost and record (red);
// at least 44 px square. A pressed secondary or ghost toggle is filled amber,
// like a pressed chip, or outlined in amber when its look is 'outline'.
// buttonClass styles a link that acts as a button (a download) the same way.
import type { ComponentChildren, Ref } from 'preact';
import { cx } from './cx.ts';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'record';
const VARIANTS: Readonly<Record<ButtonVariant, string>> = {
  primary: 'border-amber bg-amber text-on-accent hover:brightness-110',
  secondary: 'border-rule bg-panel text-ink hover:border-dim',
  ghost: 'border-transparent bg-transparent text-ink hover:bg-lane',
  record: 'border-record bg-record text-on-accent hover:brightness-110',
};
const PRESSED = { fill: 'border-amber bg-amber text-on-accent hover:brightness-110', outline: 'border-amber bg-panel text-amber ring-1 ring-amber' } as const;
const BASE = 'inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-md border px-4 font-display text-sm font-semibold tracking-wider uppercase select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber disabled:cursor-not-allowed disabled:opacity-50';

export interface ButtonProps {
  variant?: ButtonVariant;
  onClick?(): void;
  disabled?: boolean;
  /** aria-pressed, for a toggle. */
  pressed?: boolean;
  /** How a pressed toggle is drawn: filled amber (the default) or outlined in amber. */
  pressedLook?: 'fill' | 'outline';
  /** The accessible name, for a button whose text is a symbol. */
  label?: string;
  /** A form's submit button (type="submit"); every other button is type="button" and never submits. */
  submit?: boolean;
  class?: string;
  buttonRef?: Ref<HTMLButtonElement>;
  data?: Record<`data-${string}`, string>;
  children?: ComponentChildren;
}

/** A button's classes, for a link styled as one. */
export function buttonClass(variant: ButtonVariant = 'secondary', extra?: string): string {
  return cx(BASE, VARIANTS[variant], extra);
}

export function Button(p: ButtonProps) {
  return (
    <button type={p.submit ? 'submit' : 'button'} ref={p.buttonRef} class={cx(BASE, toggledOn(p) ? PRESSED[p.pressedLook ?? 'fill'] : VARIANTS[p.variant ?? 'secondary'], p.class)} disabled={p.disabled}
      aria-pressed={p.pressed} aria-label={p.label} onClick={() => p.onClick?.()} {...p.data}>{p.children}</button>
  );
}

function toggledOn(p: ButtonProps): boolean {
  const v = p.variant ?? 'secondary';
  return p.pressed === true && (v === 'secondary' || v === 'ghost');
}
