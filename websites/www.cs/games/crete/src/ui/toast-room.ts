// The Island of Crete: the room the toast takes at the top of the board's row. A long line wraps to two or three lines
// on a phone, so the banner (game.css .banner) cannot stand at a fixed height under it: this writes the shown toast's
// height to the frame's --toast-h, and the banner stands under that. A hidden toast takes no room.

/** The toast's height while it shows, else 0, in CSS pixels. */
export function toastRoom(toast: { className: string; offsetHeight?: number }): number {
  return toast.className.split(/\s+/).includes('show') ? toast.offsetHeight ?? 0 : 0;
}

/** Keeps the frame's --toast-h in step with the toast: its words, the width they wrap in, and its showing or not. */
export function watchToastRoom(toast: HTMLElement, frame: HTMLElement): void {
  const put = (): void => frame.style.setProperty('--toast-h', `${toastRoom(toast)}px`);
  if (typeof ResizeObserver === 'function') new ResizeObserver(put).observe(toast);
  if (typeof MutationObserver === 'function') new MutationObserver(put).observe(toast, { attributes: true, attributeFilter: ['class'] });
  put();
}
