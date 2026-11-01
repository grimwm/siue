// The page never moves under the player. While any key, pad or note is held, the scroll position is pinned: a scroll
// that happens anyway (the browser bringing a focused element into view, a readout or list growing above the keys)
// is put straight back. When the last key is let go the page is free again. DOM-free: the window is a port.
export interface ScrollWindow {
  scrollX: number;
  scrollY: number;
  scrollTo(x: number, y: number): void;
  addEventListener(type: 'scroll' | 'resize', fn: () => void, opts?: { passive: boolean }): void;
  removeEventListener(type: 'scroll' | 'resize', fn: () => void): void;
}

export interface ScrollPin {
  /** A key went down: the first one pins the page where it is now. */
  hold(key: string): void;
  release(key: string): void;
  /** Puts the page back where it was pinned, when it moved (call after anything that may have changed the layout). */
  keep(): void;
  held(): number;
  dispose(): void;
}

export function pinScroll(win: ScrollWindow): ScrollPin {
  const keys = new Set<string>();
  let pin: [number, number] | null = null;
  const keep = (): void => {
    if (!pin) return;
    if (win.scrollX !== pin[0] || win.scrollY !== pin[1]) win.scrollTo(pin[0], pin[1]);
  };
  win.addEventListener('scroll', keep, { passive: true });
  win.addEventListener('resize', keep, { passive: true });
  return {
    hold: key => {
      if (keys.size === 0) pin = [win.scrollX, win.scrollY];
      keys.add(key);
    },
    release: key => {
      keys.delete(key);
      if (keys.size === 0) pin = null;
    },
    keep,
    held: () => keys.size,
    dispose: () => {
      win.removeEventListener('scroll', keep);
      win.removeEventListener('resize', keep);
    },
  };
}
