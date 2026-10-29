// The life of one sheet-music view: at most one notation drawn in its container,
// redrawn on resize, and nothing left behind (no children, no listener) after a
// lane switch or dispose. The notation library and the window are ports. DOM-free.

export interface Notation { load(xml: string): Promise<unknown>; render(): void; clear(): void }
export interface Container { firstChild: unknown; removeChild(child: never): unknown }
export interface ResizeSource { addEventListener(type: 'resize', f: () => void): void; removeEventListener(type: 'resize', f: () => void): void }
export interface SheetHandle {
  /** Draws one lane, replacing whatever was drawn. */
  show(musicxml: string, laneId: string, laneName?: string): Promise<void>;
  /** Clears the container and removes the resize listener. */
  dispose(): void;
}

export function createSheet(host: Container, make: (host: Container) => Notation, win: ResizeSource, prepare: (musicxml: string, laneId: string, laneName?: string) => string): SheetHandle {
  let notation: Notation | null = null;
  let onResize: (() => void) | null = null;
  let turn = 0;
  const teardown = (): void => {
    turn++;
    if (onResize) win.removeEventListener('resize', onResize);
    onResize = null;
    notation?.clear();
    notation = null;
    while (host.firstChild) host.removeChild(host.firstChild as never);
  };
  return {
    async show(musicxml, laneId, laneName) {
      teardown();
      const mine = turn;
      const n = make(host);
      notation = n;
      await n.load(prepare(musicxml, laneId, laneName));
      if (mine !== turn) return; // a later show or dispose took over while this one loaded
      n.render();
      onResize = () => n.render();
      win.addEventListener('resize', onResize);
    },
    dispose: teardown,
  };
}
