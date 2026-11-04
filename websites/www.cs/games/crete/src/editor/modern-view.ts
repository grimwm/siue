/* The Island of Crete: the level editor's Modern look, the painted 3D board of the game's own Modern look built
 * on a canvas of the editor's own. It loads the modern bundle (dist/modern.js) the first time Modern is chosen, so
 * an editor kept in Classic never loads the 3D engine. The board answers the editor's brush (one finger or the left
 * button paints; two fingers, the right and middle buttons, the wheel and the compass move the camera:
 * src/modern/paint-route.ts) and is told each change of the draft, which it applies cell by cell. Needs the DOM lib. */
import type { Atlas } from '../board-plan.ts';
import type { IconSheet } from '../icons-models.ts';
import type { ModernBoard, ModernHost } from '../modern/board3d.ts';
import type { State } from '../puzzle/state.ts';
import type { WallMode } from '../settings.ts';

type ModernLib = typeof import('../modern/entry.ts');

export interface ModernViewDeps {
  /** The editor's board region, #editor-board. */
  holder: HTMLElement;
  /** Loads the modern bundle; null when this browser cannot draw it. */
  load(): Promise<ModernLib | null>;
  atlas: Atlas;
  image: HTMLImageElement;
  icons: IconSheet;
  walls(): WallMode;
  /** True while the editor is not showing. */
  hidden(): boolean;
  painter: NonNullable<ModernHost['painter']>;
}

export interface ModernView {
  /** The board, once loaded; null before, and for good when it could not start. */
  readonly board: ModernBoard | null;
  /** Loads and builds the board; false when this browser cannot draw it. */
  ready(): Promise<boolean>;
  /** Shows the 3D board in place of the flat one, or puts it away. */
  show(on: boolean): void;
  resize(): void;
}

export function createModernView(deps: ModernViewDeps): ModernView {
  let board: ModernBoard | null = null;
  let loading: Promise<boolean> | null = null;
  let area: HTMLElement | null = null;

  async function build(): Promise<boolean> {
    const lib = await deps.load();
    if (!lib) return false;
    area = document.createElement('div');
    area.className = 'editor-modern';
    const canvas = document.createElement('canvas');
    canvas.id = 'editor-stage3d';
    canvas.className = 'stage3d editor-stage3d';
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', 'Your level');
    const overlay = document.createElement('div');
    overlay.className = 'modern-overlay';
    area.append(canvas, overlay);
    deps.holder.append(area);
    try {
      board = lib.createModernBoard({
        canvas, overlay, atlas: deps.atlas, image: deps.image, icons: deps.icons,
        blocked: deps.hidden, covered: deps.hidden, gesture: () => {},
        // The editor's board stands still: no easing, no loops, nothing to wait for between strokes.
        reducedMotion: () => true,
        painter: deps.painter,
      });
    } catch (e) {
      console.error('Crete: the editor\'s modern board could not start', e);
      area.remove();
      area = null;
      return false;
    }
    board.walls(deps.walls());
    board.minimap(false);
    board.setActive(false);
    canvas.addEventListener('webglcontextlost', e => e.preventDefault());
    return true;
  }

  return {
    get board() {
      return board;
    },
    ready() {
      loading ??= build();
      return loading;
    },
    show(on) {
      deps.holder.classList.toggle('look-modern', on && board !== null);
      if (!board) return;
      if (on) {
        board.walls(deps.walls());
        board.resize();
      }
      board.setActive(on);
    },
    resize() {
      board?.resize();
    },
  };
}

/** What the draft's state is in the Modern look, applied to `board`. */
export function drawModern(board: ModernBoard, s: State, marks: readonly { r: number; c: number; mark: string }[]): void {
  board.edit(s);
  board.marks(marks);
}
