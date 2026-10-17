// websites/www.cs/games/crete/src/board-plan.ts
/* The Island of Crete: what the board draws, as data. `drawList` lists the
 * sprites row by row from the top, so a wall's top (the sprite's rise) lies
 * over the row above; a row's objects and figures follow its terrain.
 * `timeline` turns a turn's events into where the figures stand at each
 * moment: the player's moves and slides first, then each Minotaur step,
 * SLIDE_MS a cell; reduced motion snaps. DOM-free. */
import { TERRAIN, OBJECTS } from './puzzle/tiles.ts';
import type { Cell } from './puzzle/tiles.ts';
import type { State } from './puzzle/state.ts';
import type { GameEvent } from './puzzle/step.ts';

export interface Atlas {
  cell: number;
  rise: number;
  sprites: Record<string, { x: number; y: number; frames: number; fps: number }>;
}
export interface Pos { r: number; c: number }
export interface Figures { player: Pos; minotaur: Pos | null }
export interface Draw { sprite: string; frame: number; x: number; y: number }
export interface Timeline { duration: number; at(ms: number): Figures }

export const SLIDE_MS = 120;

export const boardRows = (level: { rows: number }, atlas: Atlas): number => level.rows + atlas.rise / atlas.cell;

function frameAt(atlas: Atlas, sprite: string, ms: number): number {
  const s = atlas.sprites[sprite];
  if (!s || s.frames <= 1 || s.fps <= 0) return 0;
  return Math.floor((ms * s.fps) / 1000) % s.frames;
}

export function drawList(s: State, fig: Figures, atlas: Atlas, ms: number): Draw[] {
  const out: Draw[] = [];
  const put = (sprite: string, x: number, y: number) => out.push({ sprite, frame: frameAt(atlas, sprite, ms), x, y });
  const { rows, cols } = s.level;
  const onRow = (p: Pos | null, r: number) => !!p && Math.round(p.r) === r;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const t = s.terrain[r * cols + c]!;
      const sprites = TERRAIN[t].sprites;
      put(t === 'gate' && s.relicsLeft === 0 ? sprites[1]! : sprites[0]!, c, r);
    }
    for (let c = 0; c < cols; c++) {
      const o = s.objects[r * cols + c];
      if (o) put(OBJECTS[o].sprite, c, r);
    }
    if (s.cow && s.cow.r === r) put('cow-standing', s.cow.c, r);
    if (onRow(fig.minotaur, r)) put(s.stone > 0 ? 'minotaur-stone' : 'minotaur', fig.minotaur!.c, fig.minotaur!.r);
    if (onRow(fig.player, r)) put('theseus', fig.player.c, fig.player.r);
  }
  return out;
}

interface Seg { who: 'player' | 'minotaur'; from: Cell; to: Cell }

export function timeline(before: State, events: GameEvent[], reducedMotion: boolean, after: State): Timeline {
  const segs: Seg[] = [];
  for (const e of events) {
    if ((e.kind === 'moved' || e.kind === 'slid') && e.who !== 'block') segs.push({ who: e.who, from: e.from, to: e.to });
  }
  const end: Figures = { player: after.player, minotaur: after.minotaur };
  const duration = reducedMotion ? 0 : segs.length * SLIDE_MS;
  const lerp = (a: Cell, b: Cell, t: number): Pos => ({ r: a.r + (b.r - a.r) * t, c: a.c + (b.c - a.c) * t });
  return {
    duration,
    at(ms: number): Figures {
      if (ms >= duration) return end;
      const f: Figures = { player: before.player, minotaur: before.minotaur };
      segs.forEach((s, i) => {
        if (ms >= i * SLIDE_MS) f[s.who] = lerp(s.from, s.to, Math.min(1, (ms - i * SLIDE_MS) / SLIDE_MS));
      });
      return f;
    },
  };
}
