// A small rounded button: a glossary word (term set: dashed amber, opens its
// card) or a toggle (aria-pressed, filled amber when on).
import type { ComponentChildren } from 'preact';
import { cx } from './cx.ts';

export interface ChipProps { onClick(): void; pressed?: boolean; term?: string; children?: ComponentChildren }

export function Chip(p: ChipProps) {
  const word = p.term !== undefined;
  return (
    <button type="button" data-term={p.term} aria-pressed={word ? undefined : (p.pressed ?? false)} onClick={() => p.onClick()}
      class={cx('inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber',
        word ? 'border-dashed border-amber text-ink hover:bg-lane' : p.pressed ? 'border-amber bg-amber text-on-accent' : 'border-rule bg-panel text-dim hover:text-ink')}>{p.children}</button>
  );
}
