// The notes panel: below 1024 px a bottom sheet whose 44 px handle opens it to
// at most three quarters of the screen; from 1024 px a side column, always open.
import type { ComponentChildren } from 'preact';
import { cx } from './cx.ts';

export interface SheetProps { title: string; count?: number; open: boolean; onToggle(open: boolean): void; children?: ComponentChildren }

export function Sheet(p: SheetProps) {
  const count = p.count !== undefined ? <span class="ml-2 font-mono text-amber">{p.count}</span> : null;
  return (
    <aside data-sheet="" aria-label={p.title}
      class="fixed inset-x-0 bottom-0 z-20 max-h-[75dvh] overflow-y-auto rounded-t-xl border-t border-rule bg-panel shadow-lg lg:static lg:z-auto lg:max-h-none lg:overflow-visible lg:rounded-lg lg:border">
      <button type="button" aria-expanded={p.open} onClick={() => p.onToggle(!p.open)}
        class="flex min-h-11 w-full items-center justify-between gap-2 px-4 font-display text-sm font-semibold tracking-widest uppercase focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-amber lg:hidden">
        <span>{p.title}{count}</span>
        <span aria-hidden="true">{p.open ? '▾' : '▴'}</span>
      </button>
      <h2 class="hidden px-4 pt-4 font-display text-sm font-semibold tracking-widest uppercase lg:block">{p.title}{count}</h2>
      <div data-sheet-body="" class={cx('gap-4 px-4 pb-4 lg:pt-3', p.open ? 'grid' : 'hidden lg:grid')}>{p.children}</div>
    </aside>
  );
}
