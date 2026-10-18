// A small button: a glossary word (term set; opens its card) or a toggle
// (aria-pressed, filled amber when on). A listed word is a compact dashed chip;
// an inline word reads as the sentence's own text with a dotted accent
// underline, its 44 px hit area made of padding and negative margin so the line keeps the
// text's height. The line is tall enough (the caller's leading) that the hit
// area reaches no further than half the line gap into the next line.
import type { ComponentChildren } from 'preact';
import { cx } from './cx.ts';

export interface ChipProps { onClick(): void; pressed?: boolean; term?: string; inline?: boolean; children?: ComponentChildren }

const FOCUS = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber';

export function Chip(p: ChipProps) {
  const word = p.term !== undefined;
  const cls = word && p.inline
    ? cx('-mx-3 -my-3 inline cursor-pointer px-3 py-3 text-ink [font:inherit] underline decoration-amber decoration-dotted underline-offset-4 hover:decoration-solid', FOCUS)
    : cx('inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border px-3 text-sm whitespace-nowrap', FOCUS,
      word ? 'border-dashed border-amber text-ink hover:bg-lane' : p.pressed ? 'border-amber bg-amber text-on-accent' : 'border-rule bg-panel text-dim hover:text-ink');
  return <button type="button" data-term={p.term} aria-pressed={word ? undefined : (p.pressed ?? false)} onClick={() => p.onClick()} class={cls}>{p.children}</button>;
}
