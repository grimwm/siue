/* The Island of Crete: the tiles test page. Plays a level that holds every
 * piece on the board canvas, with the arrow keys, `.` (wait) and Z/X/C, and
 * draws each sprite alone in a strip under the board at the picked size. Not
 * deployed (games/*-test.* stays off the site). */
import atlasJson from '../fx/sprites/tiles.json' with { type: 'json' };
import { createBoard } from './board.ts';
import { drawList, frameAt, timeline } from './board-plan.ts';
import type { Atlas, Figures, Timeline } from './board-plan.ts';
import { parse } from './puzzle/level.ts';
import { act, startRun } from './puzzle/run.ts';
import type { Run } from './puzzle/run.ts';
import type { Action } from './puzzle/step.ts';
import { TOOLS } from './puzzle/tiles.ts';
import { itemFor } from './keys.ts';
import { TILES_LEVEL as LEVEL } from './tiles-level.ts';

const atlas = atlasJson as Atlas;

const KEYS: Record<string, Action> = {
  ArrowUp: { kind: 'move', dir: 'up' },
  ArrowDown: { kind: 'move', dir: 'down' },
  ArrowLeft: { kind: 'move', dir: 'left' },
  ArrowRight: { kind: 'move', dir: 'right' },
  '.': { kind: 'wait' },
};

const level = parse(LEVEL);
const canvas = document.getElementById('stage') as HTMLCanvasElement;
const picker = document.getElementById('cell-px') as HTMLSelectElement;
const reduced = document.getElementById('reduced') as HTMLInputElement;
const strip = document.getElementById('strip') as HTMLElement;
document.getElementById('level')!.textContent = LEVEL;

const image = new Image();
image.onload = start;
image.src = 'fx/sprites/tiles.png';

function start(): void {
  const board = createBoard(canvas, atlas, image);
  const names = Object.keys(atlas.sprites);
  const tiles = names.map(name => {
    const wrap = document.createElement('figure');
    const c = document.createElement('canvas');
    const cap = document.createElement('figcaption');
    cap.textContent = name;
    wrap.append(c, cap);
    strip.append(wrap);
    return { name, board: createBoard(c, atlas, image) };
  });

  let run: Run = startRun(level);
  let tl: Timeline | null = null;
  let t0 = 0;
  let from: Run = run;

  const resize = (): void => {
    const px = Number(picker.value);
    board.size(level.cols, level.rows, px);
    for (const t of tiles) t.board.size(1, 1, px);
  };
  picker.addEventListener('change', resize);
  resize();

  addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const tool = itemFor(e.key, TOOLS);
    const a: Action | undefined = tool ? { kind: 'tool', tool } : KEYS[e.key];
    if (!a) return;
    e.preventDefault();
    tl = null; // a press during a slide finishes it at once, then acts
    const r = act(run, a);
    if (r.run === run) return;
    from = run;
    run = r.run;
    tl = timeline(from.now, r.events, reduced.checked, run.now);
    t0 = performance.now();
  });

  const frame = (now: number): void => {
    const ms = tl ? now - t0 : 0;
    let fig: Figures = { player: run.now.player, minotaur: run.now.minotaur, hazards: run.now.hazards.map(h => ({ kind: h.kind, at: h.at })) };
    if (tl) {
      fig = tl.at(ms);
      if (ms >= tl.duration) tl = null;
    }
    board.paint(drawList(run.now, fig, atlas, now));
    for (const t of tiles) t.board.paint([{ sprite: t.name, frame: frameAt(atlas, t.name, now), x: 0, y: 0 }]);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
