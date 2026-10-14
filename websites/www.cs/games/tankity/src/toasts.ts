/* Operation Tankity: the turn toasts' queue.
 *
 * One toast per room (a newer one replaces it), the newest TOAST_MAX kept.
 * Each closes itself TOAST_MS after the player could first see it: a toast
 * raised while the tab is hidden waits, and its countdown starts when the
 * page is seen again (`shown`, from the visibility handler). DOM-free: the
 * timers and the page's visibility arrive as deps; ui/toast.tsx draws it. */
export const TOAST_MS = 12_000;
export const TOAST_MAX = 3;

export interface ToastItem { id: number; code: string; text: string }

export interface ToastQueueDeps {
  setTimeout(fn: () => void, ms: number): unknown;
  clearTimeout(id: unknown): void;
  hidden(): boolean;
  onChange(list: ToastItem[]): void;
}

export function createToastQueue(d: ToastQueueDeps) {
  let items: ToastItem[] = [];
  const timers = new Map<number, unknown>();
  let seq = 0;
  function arm(id: number): void {
    if (timers.has(id) || d.hidden()) return;
    timers.set(id, d.setTimeout(() => close(id), TOAST_MS));
  }
  function close(id: number): void {
    if (timers.has(id)) { d.clearTimeout(timers.get(id)); timers.delete(id); }
    const before = items.length;
    items = items.filter(t => t.id !== id);
    if (items.length !== before) d.onChange(items);
  }
  return {
    list: (): ToastItem[] => items,
    push(code: string, text: string): void {
      for (const t of items.filter(x => x.code === code)) close(t.id);
      const id = ++seq;
      items = [...items, { id, code, text }];
      while (items.length > TOAST_MAX) close(items[0]!.id);
      arm(id);
      d.onChange(items);
    },
    close,
    /** The page is visible again: the toasts waiting for it start counting. */
    shown(): void { for (const t of items) arm(t.id); },
  };
}
