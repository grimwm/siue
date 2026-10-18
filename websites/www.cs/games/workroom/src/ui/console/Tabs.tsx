// A tab list: one tab selected, the only one in the Tab order; Left and Right
// move (wrapping), Home and End jump. The panel it controls is panelId(prefix).
import { useRef } from 'preact/hooks';
import { cx } from './cx.ts';

export interface TabItem<T extends string> { id: T; label: string }
export interface TabsProps<T extends string> { label: string; idPrefix: string; items: readonly TabItem<T>[]; value: T; onChange(id: T): void }

export const tabId = (prefix: string, id: string): string => `${prefix}-tab-${id}`;
export const panelId = (prefix: string): string => `${prefix}-panel`;

export function Tabs<T extends string>(p: TabsProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const at = Math.max(0, p.items.findIndex(t => t.id === p.value));
  const move = (i: number): void => {
    const n = p.items.length;
    const k = ((i % n) + n) % n;
    p.onChange(p.items[k]!.id);
    refs.current[k]?.focus();
  };
  return (
    <div role="tablist" aria-label={p.label} class="flex gap-1 overflow-x-auto border-b border-rule">
      {p.items.map((t, i) => {
        const on = t.id === p.value;
        return (
          <button type="button" role="tab" id={tabId(p.idPrefix, t.id)} aria-selected={on} aria-controls={panelId(p.idPrefix)} tabindex={on ? 0 : -1}
            ref={el => { refs.current[i] = el; }}
            class={cx('min-h-11 shrink-0 border-b-2 px-3 font-display text-sm font-semibold tracking-wider uppercase focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-amber',
              on ? 'border-amber text-amber' : 'border-transparent text-dim hover:text-ink')}
            onClick={() => p.onChange(t.id)}
            onKeyDown={e => {
              const go = e.key === 'ArrowRight' ? at + 1 : e.key === 'ArrowLeft' ? at - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? p.items.length - 1 : null;
              if (go === null) return;
              e.preventDefault();
              move(go);
            }}>{t.label}</button>
        );
      })}
    </div>
  );
}
