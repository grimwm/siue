/* The Next song announcement: the line's text and the timer that clears it.
 * DOM-free (it is handed the element and the timers), so Node tests it. */
import type { Timers } from '../../_kit/ports.ts';

/** What a toast needs from its element. */
export interface ToastHost { textContent: string | null; hidden: boolean }

/** "♫ Title · Author"; just "♫ Title" when no author is credited. */
export function trackToastText(track: { file: string; title?: string; credit?: string }): string {
  const title = track.title || track.file.replace(/^.*\//, '').replace(/\.[^.]*$/, '');
  const author = (track.credit ?? '').trim();
  return author ? `♫ ${title} · ${author}` : `♫ ${title}`;
}

export function createTrackToast(host: ToastHost, timers: Timers, ms = 4000): { show(text: string): void } {
  let timer = 0;
  return {
    show(text) {
      if (timer) timers.clearTimeout(timer);
      host.textContent = text;
      host.hidden = false;
      timer = timers.setTimeout(() => { host.hidden = true; host.textContent = ''; timer = 0; }, ms);
    },
  };
}
