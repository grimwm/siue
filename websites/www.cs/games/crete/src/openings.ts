/* The Island of Crete: how the Daedalus Gate and the doors move as they open and shut, and how the Minotaur stands
 * at the gate, for both looks. The gate is a pit across the way; the last relic taken, bronze bars slide out of the
 * walls on both sides of it and meet over it, a grid a man crosses and hooves cannot. A door sinks straight down
 * into the floor and leaves a sill in its key's colour. The Minotaur stands back a little from a gate beside him, and
 * the first time in a try he waits beside an open one he tries its bars with a hoof, twice, and backs off. All of it
 * is only how things look: none of it touches the rules. Reduced motion snaps. DOM-free. */
import { TERRAIN } from './puzzle/tiles.ts';
import type { KeyColor } from './puzzle/tiles.ts';
import type { State } from './puzzle/state.ts';

/** The bars that slide over the gate's pit. */
export const GATE_BARS = 4;
/** How long the bars take to slide across, or back. */
export const GATE_SLIDE_MS = 900;
/** How long a door takes to sink into the floor, or rise out of it. */
export const DOOR_SINK_MS = 500;
/** How far the Minotaur stands back from a gate beside him, in cells. */
export const STEP_BACK = 0.22;
/** The hoof test: how far toward the gate he leans, in cells from where he stands, and how long each move takes. */
export const HOOF_KEYS: readonly (readonly [number, number])[] = [
  [0.3, 420], [0.36, 160], [0.3, 200], [0.36, 160], [0.3, 380], [-0.12, 520], [0, 400],
];
export const HOOF_MS = HOOF_KEYS.reduce((t, [, ms]) => t + ms, 0);

const SIDES = [[-1, 0], [1, 0], [0, -1], [0, 1]] as const;
type Pos = { r: number; c: number };
type Board = Pick<State, 'level' | 'terrain'>;

const wallAt = (s: Board, r: number, c: number) =>
  r < 0 || c < 0 || r >= s.level.rows || c >= s.level.cols || s.terrain[r * s.level.cols + c] === 'wall';

/** Which way the way through a gate or door at (r, c) runs: 'h' left and right (its walls lie above and below it),
 *  'v' up and down. */
export function axisAt(s: Board, r: number, c: number): 'h' | 'v' {
  return (wallAt(s, r - 1, c) || wallAt(s, r + 1, c)) && !(wallAt(s, r, c - 1) && wallAt(s, r, c + 1)) ? 'h' : 'v';
}

/** The colour of the door cell `i` was, when it is open now; else null. */
export function openedDoor(s: Board, i: number): KeyColor | null {
  if (s.terrain[i] !== 'floor') return null;
  return TERRAIN[s.level.terrain[i]!].door ?? null;
}

/** The step from cell (r, c) to a gate beside it, or null. */
function gateBeside(s: Board, r: number, c: number): readonly [number, number] | null {
  for (const d of SIDES) {
    const rr = r + d[0], cc = c + d[1];
    if (!wallAt(s, rr, cc) && s.terrain[rr * s.level.cols + cc] === 'gate') return d;
  }
  return null;
}

/** Where the Minotaur's figure at `at` is drawn: stood back from a gate beside him, leaning `hoof` toward it. A
 *  figure between cells stands back by how near he is to the cell he is passing, so he never jumps. */
export function beastDrawnAt(s: Board, at: Pos, hoof = 0): Pos {
  const r = Math.round(at.r), c = Math.round(at.c);
  const g = gateBeside(s, r, c);
  if (!g) return at;
  const near = Math.max(0, 1 - 2 * Math.max(Math.abs(at.r - r), Math.abs(at.c - c)));
  const k = -STEP_BACK * near + hoof;
  return { r: at.r + g[0] * k, c: at.c + g[1] * k };
}

/** What moves this frame. */
export interface Motion {
  /** How far each gate cell's bars are across, by cell, while they slide: 0 a bare pit to 1 a grid. A gate cell
   *  not named is at rest, open or shut as the state says. */
  readonly bars: ReadonlyMap<number, number>;
  /** How far each door cell's door has sunk, by cell, while it moves: 0 standing to 1 gone. */
  readonly doors: ReadonlyMap<number, number>;
  /** How far the Minotaur leans toward the gate beside him, testing it, in cells. */
  readonly hoof: number;
  /** Something is still moving. */
  readonly busy: boolean;
}

export const REST: Motion = { bars: new Map(), doors: new Map(), hoof: 0, busy: false };

export interface Openings {
  /** What moves at `now` (ms), for the state the board draws and where the figures stand. `resting` is true once
   *  the turn's animation has ended. */
  at(s: State, figures: { player: Pos; minotaur: Pos | null }, now: number, reduced: boolean, resting: boolean): Motion;
}

const smooth = (k: number) => k * k * (3 - 2 * k);

/** How far toward the gate the hoof test leans `ms` into it. */
export function hoofAt(ms: number): number {
  let t = 0, from = 0;
  for (const [to, len] of HOOF_KEYS) {
    if (ms < t + len) return from + (to - from) * smooth((ms - t) / len);
    t += len;
    from = to;
  }
  return 0;
}

/** One look's record of what is moving. Each look keeps its own. */
export function createOpenings(): Openings {
  /** A thing moving from `from` to `to` (0 shut, 1 open) since `t0`. */
  interface Move { from: number; to: number; t0: number; ms: number }
  let level: State['level'] | null = null;
  let gateOpen = false;
  let doorOpen = new Map<number, boolean>();
  const gate: { move: Move | null } = { move: null };
  const doors = new Map<number, Move>();
  /** The hoof test has played in this try; the state it started on, and when. */
  let hoofed = false;
  let hoof: { s: State; t0: number } | null = null;

  const where = (m: Move, now: number) => {
    const k = Math.min(1, Math.max(0, (now - m.t0) / m.ms));
    return m.from + (m.to - m.from) * smooth(k);
  };
  /** Starts a move toward `to`, from wherever a move under way has got to, as long as what is left of the way. */
  const toward = (m: Move | null | undefined, to: number, now: number, ms: number): Move => {
    const from = m ? where(m, now) : 1 - to;
    return { from, to, t0: now, ms: ms * Math.abs(to - from) };
  };

  return {
    at(s, figures, now, reduced, resting) {
      const { cols } = s.level;
      const doorCells: number[] = [];
      s.level.terrain.forEach((t, i) => { if (TERRAIN[t].door) doorCells.push(i); });
      // A door Theseus is walking into is opening, though the state still holds it shut until he is through.
      const entering = (i: number) => {
        const r = Math.floor(i / cols), c = i % cols;
        return Math.abs(figures.player.r - r) + Math.abs(figures.player.c - c) < 0.999;
      };
      const nowOpen = new Map(doorCells.map(i => [i, s.terrain[i] === 'floor' || entering(i)] as const));
      const open = s.relicsLeft === 0;
      if (s.level !== level) {
        level = s.level;
        gate.move = null;
        doors.clear();
        hoofed = false;
        hoof = null;
      } else if (!reduced) {
        if (open !== gateOpen) gate.move = toward(gate.move, open ? 1 : 0, now, GATE_SLIDE_MS);
        for (const [i, o] of nowOpen) if (doorOpen.get(i) !== o) doors.set(i, toward(doors.get(i), o ? 1 : 0, now, DOOR_SINK_MS));
      }
      gateOpen = open;
      doorOpen = nowOpen;
      if (reduced) {
        gate.move = null;
        doors.clear();
      }

      let busy = false;
      const bars = new Map<number, number>();
      if (gate.move) {
        if (now - gate.move.t0 >= gate.move.ms) gate.move = null;
        else {
          const p = where(gate.move, now);
          s.terrain.forEach((t, i) => { if (t === 'gate') bars.set(i, p); });
          busy = true;
        }
      }
      const sunk = new Map<number, number>();
      for (const [i, m] of doors) {
        if (now - m.t0 >= m.ms) doors.delete(i);
        else {
          sunk.set(i, where(m, now));
          busy = true;
        }
      }

      // The hoof test: once a try, when he rests beside the open gate. It stops the moment anything changes.
      if (s.moves === 0) hoofed = false;
      if (hoof && hoof.s !== s) hoof = null;
      const m = s.minotaur;
      if (!hoofed && !reduced && resting && open && s.outcome === 'playing' && m && s.stone === 0 && gateBeside(s, m.r, m.c)) {
        hoofed = true;
        hoof = { s, t0: now };
      }
      let lean = 0;
      if (hoof) {
        if (now - hoof.t0 >= HOOF_MS) hoof = null;
        else {
          lean = hoofAt(now - hoof.t0);
          busy = true;
        }
      }
      return busy ? { bars, doors: sunk, hoof: lean, busy } : REST;
    },
  };
}
