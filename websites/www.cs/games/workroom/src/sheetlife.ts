// The life of one sheet-music view: at most one notation drawn in its container,
// redrawn on resize or a layout change (page or continuous, the zoom) with its
// lit bar lit again, and nothing left behind (no children, no listener) after a
// lane switch or dispose. The notation library and the window are ports. DOM-free.

/** How the music is laid out: in pages that wrap to the width, or as one long line that scrolls right; zoom 1 is the notation's own size. */
export interface SheetLayout { continuous: boolean; zoom: number }

export interface Notation {
  load(xml: string): Promise<unknown>;
  render(): void;
  clear(): void;
  /** Lights one bar (by its bar number) in what was rendered, replacing any lit bar; null lights none. */
  mark?(bar: number | null): void;
  /** Sets the layout the next render uses. */
  layout?(l: SheetLayout): void;
  /** Shows the drawing scaled by this much (a pinch in progress), without laying it out again; 1 is as drawn. */
  preview?(scale: number): void;
}
export interface Container { firstChild: unknown; removeChild(child: never): unknown }
export interface ResizeSource { addEventListener(type: 'resize', f: () => void): void; removeEventListener(type: 'resize', f: () => void): void }
export interface SheetHandle {
  /** Draws one lane, or with laneId null the full score, replacing whatever was drawn. */
  show(musicxml: string, laneId: string | null, laneName?: string): Promise<void>;
  /** Lays the music out this way on every later drawing, and (unless now is false) redraws what is drawn now. */
  layout(l: SheetLayout, now?: boolean): void;
  /** Shows what is drawn scaled by this much while a pinch is under way; the layout's zoom settles it. */
  preview(scale: number): void;
  /** Lights one bar (by its bar number), now and after every redraw; null lights none. */
  mark(bar: number | null): void;
  /** Clears the container and removes the resize listener. */
  dispose(): void;
}

export function createSheet(host: Container, make: (host: Container) => Notation, win: ResizeSource, prepare: (musicxml: string, laneId: string | null, laneName?: string) => string): SheetHandle {
  let notation: Notation | null = null;
  let onResize: (() => void) | null = null;
  let turn = 0;
  let lit: number | null = null;
  let look: SheetLayout | null = null;
  /** The notation once it is drawn; a bar is lit only on a drawing. */
  let drawn: Notation | null = null;
  const teardown = (): void => {
    turn++;
    if (onResize) win.removeEventListener('resize', onResize);
    onResize = null;
    notation?.clear();
    notation = null;
    drawn = null;
    while (host.firstChild) host.removeChild(host.firstChild as never);
  };
  const redraw = (n: Notation): void => {
    if (look) n.layout?.(look);
    n.render();
    n.mark?.(lit);
  };
  return {
    async show(musicxml, laneId, laneName) {
      teardown();
      const mine = turn;
      const n = make(host);
      notation = n;
      await n.load(prepare(musicxml, laneId, laneName));
      if (mine !== turn) return; // a later show or dispose took over while this one loaded
      drawn = n;
      redraw(n);
      onResize = () => { redraw(n); };
      win.addEventListener('resize', onResize);
    },
    mark(bar) {
      lit = bar;
      drawn?.mark?.(bar);
    },
    layout(l, now = true) {
      look = l;
      if (drawn && now) redraw(drawn);
    },
    preview(scale) { drawn?.preview?.(scale); },
    dispose: teardown,
  };
}
