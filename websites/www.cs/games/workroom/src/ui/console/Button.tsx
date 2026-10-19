// The console's button: primary (amber), secondary, ghost and record (red);
// at least 44 px square.
import type { ComponentChildren, Ref } from 'preact';
import { cx } from './cx.ts';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'record';
const VARIANTS: Readonly<Record<ButtonVariant, string>> = {
  primary: 'border-amber bg-amber text-on-accent hover:brightness-110',
  secondary: 'border-rule bg-panel text-ink hover:border-dim',
  ghost: 'border-transparent bg-transparent text-ink hover:bg-lane',
  record: 'border-record bg-record text-on-accent hover:brightness-110',
};
const BASE = 'inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-md border px-4 font-display text-sm font-semibold tracking-wider uppercase select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber disabled:cursor-not-allowed disabled:opacity-50';

export interface ButtonProps {
  variant?: ButtonVariant;
  onClick?(): void;
  disabled?: boolean;
  /** aria-pressed, for a toggle. */
  pressed?: boolean;
  /** The accessible name, for a button whose text is a symbol. */
  label?: string;
  /** A form's submit button (type="submit"); every other button is type="button" and never submits. */
  submit?: boolean;
  class?: string;
  buttonRef?: Ref<HTMLButtonElement>;
  data?: Record<`data-${string}`, string>;
  children?: ComponentChildren;
}

export function Button(p: ButtonProps) {
  return (
    <button type={p.submit ? 'submit' : 'button'} ref={p.buttonRef} class={cx(BASE, VARIANTS[p.variant ?? 'secondary'], p.class)} disabled={p.disabled}
      aria-pressed={p.pressed} aria-label={p.label} onClick={() => p.onClick?.()} {...p.data}>{p.children}</button>
  );
}
