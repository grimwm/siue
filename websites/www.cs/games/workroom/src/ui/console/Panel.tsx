// A card on the console: a section with an optional small-caps heading;
// accent outlines it in amber (an open glossary card).
import type { ComponentChildren, Ref } from 'preact';
import { cx } from './cx.ts';

export interface PanelProps {
  title?: string;
  accent?: boolean;
  class?: string;
  role?: 'dialog' | 'region' | 'group';
  /** A dialog that holds the focus: aria-modal. */
  modal?: boolean;
  style?: Record<string, string>;
  label?: string;
  tabIndex?: number;
  panelRef?: Ref<HTMLElement>;
  data?: Record<`data-${string}`, string>;
  children?: ComponentChildren;
}

export function Panel(p: PanelProps) {
  return (
    <section ref={p.panelRef} role={p.role} aria-label={p.label} aria-modal={p.role === 'dialog' && p.modal ? 'true' : undefined} style={p.style} tabindex={p.tabIndex} {...p.data}
      class={cx('rounded-lg border bg-panel p-4 text-ink focus:outline-none', p.accent ? 'border-amber' : 'border-rule', p.class)}>
      {p.title ? <h2 class="mb-2 font-display text-sm font-semibold tracking-widest uppercase text-dim">{p.title}</h2> : null}
      {p.children}
    </section>
  );
}
