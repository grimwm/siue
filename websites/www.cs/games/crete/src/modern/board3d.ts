/* The modern board: a three.js scene drawn on the modern canvas, only when something changes. */
import { WebGLRenderer } from 'three';
import type { Atlas, Figures } from '../board-plan.ts';
import type { State } from '../puzzle/state.ts';
import type { Cell } from '../puzzle/tiles.ts';
import type { WallMode } from '../settings.ts';

export interface ModernHost {
  /** The modern canvas, sized by CSS to the board region. */
  canvas: HTMLCanvasElement;
  /** For the mini map. */
  atlas: Atlas;
  image: HTMLImageElement;
  /** True while a layer other than `start` is open. */
  blocked(): boolean;
  /** A camera gesture happened (closes the start card). */
  gesture(): void;
  reducedMotion(): boolean;
}

export interface ModernBoard {
  /** Builds the scene for a new level; the camera resets to follow. */
  level(s: State): void;
  /** Applies the state and figures locally and draws once. */
  show(f: { state: State; figures: Figures }, thread: readonly Cell[] | null): void;
  walls(m: WallMode): void;
  /** The camera's yaw in degrees, for screenToGrid. */
  yaw(): number;
  reset(): void;
  resize(): void;
  /** A hidden board draws nothing and stops its loops. */
  setActive(on: boolean): void;
  /** Frames drawn, for tests. */
  frames(): number;
  dispose(): void;
}

const BACKGROUND = 0x060504;

export function createModernBoard(host: ModernHost): ModernBoard {
  const renderer = new WebGLRenderer({ canvas: host.canvas, antialias: true });
  renderer.setClearColor(BACKGROUND);
  let active = true;
  let drawn = 0;

  const draw = (): void => {
    if (!active) return;
    renderer.clear();
    drawn++;
  };
  const resize = (): void => {
    const w = host.canvas.clientWidth, h = host.canvas.clientHeight;
    if (w > 0 && h > 0) renderer.setSize(w, h, false);
  };
  resize();

  return {
    level() { draw(); },
    show() { draw(); },
    walls() { draw(); },
    yaw: () => 0,
    reset() { draw(); },
    resize() { resize(); draw(); },
    setActive(on) { active = on; if (on) draw(); },
    frames: () => drawn,
    dispose() { renderer.dispose(); },
  };
}
