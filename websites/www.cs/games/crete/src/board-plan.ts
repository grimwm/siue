// websites/www.cs/games/crete/src/board-plan.ts
/* The Island of Crete: what the board draws, as data. `drawList` lists the
 * sprites row by row from the top, so a wall's top (the sprite's rise) lies
 * over the row above; a row's objects follow its terrain. A figure between two
 * rows draws after the lower one, so no floor paints over it.
 * A clone machine shows its facing with its template over it; hazards draw
 * from the figures, after their row's objects.
 * `timeline` turns a turn's events into where the figures stand at each
 * moment: the player's moves and slides (and the blocks they push) first, then
 * the hazard phase in one slot (every hazard moving at once, the slot as long
 * as the longest slide), then each Minotaur step, SLIDE_MS a cell. Through a
 * teleport a figure jumps to the exit and steps on. A hazard destroyed or sent
 * home plays its move, then is gone or home when the turn lands; anything a
 * clone machine makes has no path and shows when the turn lands. Reduced motion snaps. It also says when the
 * player's figure reaches each thing taken. The gate and the doors draw as they slide and sink, and the Minotaur
 * where he stands at a gate (src/openings.ts): the gate as a pit, its bars part way over it, or the grid; a door
 * sinking through its sill, or the sill it left. DOM-free. */
import { DIRS, TERRAIN, OBJECTS, HAZARDS } from './puzzle/tiles.ts';
import type { Cell, HazardKind, ObjectKind } from './puzzle/tiles.ts';
import { same } from './puzzle/state.ts';
import type { State } from './puzzle/state.ts';
import type { GameEvent } from './puzzle/step.ts';
import { REST, axisAt, beastDrawnAt, openedDoor } from './openings.ts';
import type { Motion } from './openings.ts';

export interface Atlas {
  cell: number;
  rise: number;
  sprites: Record<string, { x: number; y: number; frames: number; fps: number }>;
}
export interface Pos { r: number; c: number }
/** A block between cells: `origin` is where the state being drawn still holds it. */
export interface MovingBlock { origin: Cell; at: Pos }
/** A moving hazard where it is drawn: the board draws these, not the state's own. */
export interface HazardFigure { kind: HazardKind; at: Pos }
export interface Figures { player: Pos; minotaur: Pos | null; hazards: HazardFigure[]; blocks?: MovingBlock[] }
/** A sprite to draw at (x, y). `sink`, from 0 to 1, is how far it has sunk into its cell: it draws that far down its
 *  frame, cut off at the frame's foot. */
export interface Draw { sprite: string; frame: number; x: number; y: number; sink?: number }
/** A thing the player took this turn, and when their figure reaches its cell. */
export interface Taken { what: ObjectKind; at: Cell; ms: number }
export interface Timeline {
  duration: number;
  /** What the player took, in the order they reach it. */
  taken: readonly Taken[];
  /** When the player's own moves, slides and pushed blocks have landed: the hazards' moves follow. */
  playerEnd: number;
  /** When the hazards' moves have landed: the Minotaur's steps follow. */
  hazardEnd: number;
  at(ms: number): Figures;
}

export const SLIDE_MS = 120;

export const boardRows = (level: { rows: number }, atlas: Atlas): number => level.rows + atlas.rise / atlas.cell;

export function frameAt(atlas: Atlas, sprite: string, ms: number): number {
  const s = atlas.sprites[sprite];
  if (!s || s.frames <= 1 || s.fps <= 0) return 0;
  return Math.floor((ms * s.fps) / 1000) % s.frames;
}

/** Of the gate's slide frames, the one `p` of the way across shows, or -1 for the bare pit and the frame count for
 *  the grid. */
export function slideFrame(atlas: Atlas, p: number): number {
  const n = atlas.sprites['gate-slide']?.frames ?? 1;
  return Math.max(-1, Math.min(n, Math.round(p * (n + 1)) - 1));
}

export function drawList(s: State, fig: Figures, atlas: Atlas, ms: number, motion: Motion = REST): Draw[] {
  const out: Draw[] = [];
  const put = (sprite: string, x: number, y: number) => out.push({ sprite, frame: frameAt(atlas, sprite, ms), x, y });
  /** The gate at (c, r), `p` of the way open. */
  const gate = (c: number, r: number, p: number) => {
    const v = axisAt(s, r, c) === 'v' ? '-v' : '';
    const f = slideFrame(atlas, p);
    const n = atlas.sprites['gate-slide']?.frames ?? 1;
    if (f < 0) put('gate-closed' + v, c, r);
    else if (f >= n) put('gate-open' + v, c, r);
    else out.push({ sprite: 'gate-slide' + v, frame: f, x: c, y: r });
  };
  /** A door's sill at (c, r), and over it the door `sink` of the way down, unless it is gone. */
  const sill = (color: string, c: number, r: number, sink: number) => {
    put(`door-${color}-sill${axisAt(s, r, c) === 'v' ? '-v' : ''}`, c, r);
    if (sink < 1) out.push({ sprite: `door-${color}`, frame: 0, x: c, y: r, sink });
  };
  const { rows, cols } = s.level;
  const onRow = (p: Pos | null, r: number) => !!p && Math.ceil(p.r - 1e-9) === r;
  const beast = fig.minotaur && beastDrawnAt(s, fig.minotaur, motion.hoof);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const t = s.terrain[r * cols + c]!;
      const sprites = TERRAIN[t].sprites;
      const machine = t === 'clone' ? s.level.machines.find(m => m.at.r === r && m.at.c === c) : undefined;
      const i = r * cols + c;
      const door = TERRAIN[t].door ?? openedDoor(s, i);
      if (machine) put(sprites[DIRS.indexOf(machine.dir)]!, c, r);
      else if (t === 'gate') gate(c, r, motion.bars.get(i) ?? (s.relicsLeft === 0 ? 1 : 0));
      else if (door && (t !== 'floor' ? motion.doors.has(i) : true)) sill(door, c, r, motion.doors.get(i) ?? 1);
      else put(sprites[0]!, c, r);
    }
    for (let c = 0; c < cols; c++) {
      const o = s.objects[r * cols + c];
      if (o === 'block' && fig.blocks?.some(b => b.origin.r === r && b.origin.c === c)) continue;
      if (o) put(OBJECTS[o].sprite, c, r);
    }
    for (const m of s.level.machines) {
      if (m.at.r === r) put(m.template === 'block' ? OBJECTS.block.sprite : HAZARDS[m.template].sprite, m.at.c, r);
    }
    for (const b of fig.blocks ?? []) if (onRow(b.at, r)) put(OBJECTS.block.sprite, b.at.c, b.at.r);
    for (const h of fig.hazards) if (onRow(h.at, r)) put(HAZARDS[h.kind].sprite, h.at.c, h.at.r);
    if (s.cow && s.cow.r === r) put('cow-standing', s.cow.c, r);
    if (beast && onRow(beast, r)) put(s.stone > 0 ? 'minotaur-stone' : 'minotaur', beast.c, beast.r);
    if (onRow(fig.player, r)) put('theseus', fig.player.c, fig.player.r);
  }
  return out;
}

/** A move from `from` to `to` starting at `t0`, `ms` long: a step or a slide is SLIDE_MS, a jump through a teleport 0. */
interface Seg { from: Cell; to: Cell; t0: number; ms: number }
/** A block the player sets moving: where the state before the turn holds it, and its path. */
interface BlockPath { origin: Cell; end: Cell; segs: Seg[] }
/** A hazard of the state before the turn: where it stands now in the reading of the events, and its path. */
interface HazardPath { kind: HazardKind; start: Cell; end: Cell; segs: Seg[]; moved: boolean; exploded: boolean }

const lerp = (a: Cell, b: Cell, t: number): Pos => ({ r: a.r + (b.r - a.r) * t, c: a.c + (b.c - a.c) * t });
/** Where a path puts its figure at `ms`, or `rest` before it starts. */
function along(segs: readonly Seg[], ms: number, rest: Pos): Pos {
  let p = rest;
  for (const s of segs) {
    if (ms < s.t0) break;
    p = s.ms === 0 ? s.to : lerp(s.from, s.to, Math.min(1, (ms - s.t0) / s.ms));
  }
  return p;
}

export function timeline(before: State, events: GameEvent[], reducedMotion: boolean, after: State): Timeline {
  const player: Seg[] = [];
  const minotaur: Seg[] = [];
  const blocks: BlockPath[] = [];
  /** The ends of blocks made by a clone machine this turn: they appear when the turn lands. */
  const clonedBlocks: Cell[] = [];
  const hazards: HazardPath[] = before.hazards.map(h => ({ kind: h.kind, start: h.at, end: h.at, segs: [], moved: false, exploded: false }));
  const taken: Taken[] = [];
  /** The hazards made by a clone machine this turn. */
  const clonedHazards: Figures['hazards'] = [];
  let playerT = 0;
  let current: HazardPath | null = null;
  const step = (segs: Seg[], from: Cell, to: Cell, t0: number, ms = SLIDE_MS) => segs.push({ from, to, t0, ms });
  const blockAt = (x: Cell) => blocks.find(b => same(b.end, x));
  const hazardAt = (x: Cell) => hazards.find(h => same(h.end, x));
  /** The hazard is gone or sent home: it plays its move, and later events no longer find it. */
  const drop = (h: HazardPath | undefined) => {
    if (!h) return;
    h.end = { r: -1, c: -1 };
    if (current === h) current = null;
  };
  for (const e of events) {
    // A thing is taken as the figure lands on its cell: the end of the player's segments so far.
    if (e.kind === 'took') taken.push({ what: e.what, at: e.at, ms: playerT });
    else if (e.kind === 'pushed') blocks.push({ origin: e.from, end: e.to, segs: [{ from: e.from, to: e.to, t0: playerT, ms: SLIDE_MS }] });
    else if (e.kind === 'cloned' && e.what === 'block') clonedBlocks.push(e.at);
    else if (e.kind === 'cloned' && e.what !== 'block') clonedHazards.push({ kind: e.what, at: e.at });
    else if (e.kind === 'slid' && e.who === 'block') {
      const c = clonedBlocks.findIndex(x => same(x, e.from));
      const b = blockAt(e.from);
      if (c >= 0) clonedBlocks[c] = e.to;
      else if (b) {
        step(b.segs, e.from, e.to, b.segs.at(-1)!.t0 + b.segs.at(-1)!.ms);
        b.end = e.to;
      }
    } else if (e.kind === 'teleported') {
      if (e.who === 'player') {
        step(player, e.from, e.via, playerT, 0);
        step(player, e.via, e.to, playerT);
        playerT += SLIDE_MS;
      } else {
        const c = clonedBlocks.findIndex(x => same(x, e.from));
        const b = blockAt(e.from);
        if (c >= 0) clonedBlocks[c] = e.to;
        else if (b) {
          const t = b.segs.at(-1)!.t0 + b.segs.at(-1)!.ms;
          step(b.segs, e.from, e.via, t, 0);
          step(b.segs, e.via, e.to, t);
          b.end = e.to;
        }
      }
    } else if ((e.kind === 'moved' || e.kind === 'slid') && e.who === 'player') {
      step(player, e.from, e.to, playerT);
      playerT += SLIDE_MS;
    } else if ((e.kind === 'moved' || e.kind === 'slid') && e.who === 'minotaur') {
      step(minotaur, e.from, e.to, 0);
    } else if (e.kind === 'moved' && e.who === 'hazard') {
      // Each hazard moves once a phase; one made by a clone machine has no path.
      current = hazards.find(h => !h.moved && h.kind === e.hazard && same(h.end, e.from)) ?? null;
      if (current) {
        current.moved = true;
        step(current.segs, e.from, e.to, 0);
        current.end = e.to;
      }
    } else if (e.kind === 'slid' && e.who === 'hazard') {
      if (current && same(current.end, e.from)) {
        step(current.segs, e.from, e.to, current.segs.length * SLIDE_MS);
        current.end = e.to;
      }
    } else if (e.kind === 'exploded' && e.who === 'hazard') { const h = hazardAt(e.at); if (h) h.exploded = true; drop(h); }
    else if (e.kind === 'sent-home') drop(hazardAt(e.from));
  }
  const blockEnd = Math.max(0, ...blocks.map(b => b.segs.at(-1)!.t0 + b.segs.at(-1)!.ms));
  const playerEnd = reducedMotion ? 0 : Math.max(playerT, blockEnd);
  const hazardEnd = reducedMotion ? 0 : playerEnd + Math.max(0, ...hazards.map(h => h.segs.length)) * SLIDE_MS;
  minotaur.forEach((s, i) => (s.t0 = hazardEnd + i * SLIDE_MS));
  for (const h of hazards) for (const s of h.segs) s.t0 += playerEnd;
  const duration = reducedMotion ? 0 : hazardEnd + minotaur.length * SLIDE_MS;
  const end: Figures = { player: after.player, minotaur: after.minotaur, hazards: after.hazards.map(h => ({ kind: h.kind, at: h.at })) };
  return {
    duration,
    taken: reducedMotion ? taken.map(t => ({ ...t, ms: 0 })) : taken,
    playerEnd,
    hazardEnd,
    at(ms: number): Figures {
      if (ms >= duration) return end;
      const f: Figures = {
        player: along(player, ms, before.player),
        minotaur: before.minotaur && along(minotaur, ms, before.minotaur),
        // A destroyed hazard is gone once the hazards' moves land; a cloned one is there from then on.
        hazards: [
          ...hazards.filter(h => ms < hazardEnd || !h.exploded).map(h => ({ kind: h.kind, at: along(h.segs, ms, h.start) })),
          ...(ms >= hazardEnd ? clonedHazards.filter(c => after.hazards.some(a => a.kind === c.kind && same(a.at, c.at))) : []),
        ],
      };
      const moving = ms < playerEnd ? blocks.filter(b => ms >= b.segs[0]!.t0) : [];
      if (moving.length > 0) f.blocks = moving.map(b => ({ origin: b.origin, at: along(b.segs, ms, b.origin) }));
      return f;
    },
  };
}
