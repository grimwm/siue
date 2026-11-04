/* The Island of Crete: the cues the hidden walls give, in both looks; only how they look, never the rules.
 * An invisible wall Theseus has bumped is wall in the state (src/puzzle/step.ts) and is drawn as wall; it also wears
 * a faint glassy sheen, so it reads as found, after a short shimmer as it comes into view (`SHIMMER_MS`). Which walls
 * are found is read from the state alone (the level's invisible walls that are wall now), so a switch of looks, an
 * undo or a restart shows exactly what the state holds. A fake wall beside Theseus, once he has stood still for
 * `IDLE_MS`, shows a faint haze on its face toward him that breathes gently while he stays, a still tint under reduced
 * motion, and goes as soon as anything is pressed. DOM-free. */
import type { State } from './puzzle/state.ts';
import { DIRS } from './puzzle/tiles.ts';
import type { Cell, Dir } from './puzzle/tiles.ts';

/** How long Theseus stands still beside a fake wall before its haze shows. */
export const IDLE_MS = 2500;
/** How long the haze takes to come up once it starts. */
export const HAZE_IN_MS = 700;
/** One breath of the haze while he stays. */
export const HAZE_BREATH_MS = 2400;
/** How long a found invisible wall shimmers before it settles. */
export const SHIMMER_MS = 900;

/** A fake wall's face toward Theseus: the wall's cell and the way from it to him. */
export interface Face { readonly at: Cell; readonly face: Dir }

const STEP: Record<Dir, readonly [number, number]> = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] };
const OPPOSITE: Record<Dir, Dir> = { up: 'down', down: 'up', left: 'right', right: 'left' };

/** The level's invisible walls the state shows (bumped, so wall now), as cell indices, ascending. */
export function foundWalls(s: Pick<State, 'level' | 'terrain'>): number[] {
  const out: number[] = [];
  s.level.terrain.forEach((t, i) => { if (t === 'invisible-wall' && s.terrain[i] === 'wall') out.push(i); });
  return out;
}

/** The fake walls still standing beside Theseus, each with its face toward him, in the order up, down, left, right. */
export function fakeFaces(s: Pick<State, 'level' | 'terrain' | 'player'>): Face[] {
  const { rows, cols } = s.level;
  const out: Face[] = [];
  for (const d of DIRS) {
    const r = s.player.r + STEP[d][0], c = s.player.c + STEP[d][1];
    if (r < 0 || c < 0 || r >= rows || c >= cols) continue;
    if (s.terrain[r * cols + c] === 'fake-wall') out.push({ at: { r, c }, face: OPPOSITE[d] });
  }
  return out;
}

/** How strong the haze shows, 0 to 1, `idle` ms after the last input: nothing before `IDLE_MS`, then up over
 *  `HAZE_IN_MS`, then breathing between a little over half and full. Under reduced motion it is a still tint, full
 *  at once. */
export function hazeStrength(idle: number, reduced: boolean): number {
  const t = idle - IDLE_MS;
  if (t < 0) return 0;
  if (reduced) return 1;
  const up = Math.min(1, t / HAZE_IN_MS);
  const breath = 0.775 + 0.225 * Math.cos((2 * Math.PI * t) / HAZE_BREATH_MS);
  return up * breath;
}

/** The fake-wall faces to haze and how strongly: none while a turn plays, the try is over or nothing has been still
 *  for `IDLE_MS`. */
export function hazeCue(s: Pick<State, 'level' | 'terrain' | 'player' | 'outcome'>, idle: number, reduced: boolean, busy: boolean):
  { faces: Face[]; strength: number } | null {
  if (busy || s.outcome !== 'playing') return null;
  const strength = hazeStrength(idle, reduced);
  if (strength <= 0) return null;
  const faces = fakeFaces(s);
  return faces.length ? { faces, strength } : null;
}

/** How far a found wall's shimmer has run, `ms` after it was found: 0 to 1 while it shimmers, null once settled. */
export function shimmerAt(ms: number, reduced: boolean): number | null {
  if (reduced || ms < 0 || ms >= SHIMMER_MS) return null;
  return ms / SHIMMER_MS;
}

/** When each found wall was found, by the page's clock, for its shimmer. A wall already found when a level or try is
 *  first seen (`opens` changed) never shimmers; one found later shimmers from then; one the state no longer shows
 *  (an undo, a restart) is forgotten, so finding it again shimmers again. */
export interface FoundClock {
  /** Notes the state now showing; returns each found wall with how far its shimmer has run (null once settled). */
  update(s: Pick<State, 'level' | 'terrain'>, opens: number, now: number, reduced: boolean): { i: number; shimmer: number | null }[];
}

export function createFoundClock(): FoundClock {
  const since = new Map<number, number>();
  let seen: number | null = null;
  return {
    update(s, opens, now, reduced) {
      const found = foundWalls(s);
      const fresh = seen !== opens;
      seen = opens;
      if (fresh) since.clear();
      for (const i of [...since.keys()]) if (!found.includes(i)) since.delete(i);
      for (const i of found) if (!since.has(i)) since.set(i, fresh ? -Infinity : now);
      return found.map(i => ({ i, shimmer: shimmerAt(now - since.get(i)!, reduced) }));
    },
  };
}

/** What a look draws for the hidden walls this frame: each found wall and its shimmer, the haze (if any), the haze's
 *  clock in seconds for its ripple, and whether motion is reduced (the haze then a still tint). */
export interface CueDraw {
  readonly found: readonly { readonly at: Cell; readonly shimmer: number | null }[];
  readonly haze: { readonly faces: readonly Face[]; readonly strength: number } | null;
  readonly t: number;
  readonly still: boolean;
}

export const NO_CUES: CueDraw = { found: [], haze: null, t: 0, still: false };

/** Whether `c` moves on its own: a shimmer running, or a haze that ripples. A look keeps drawing while it does. */
export const cuesMoving = (c: CueDraw): boolean => c.found.some(f => f.shimmer !== null) || (!!c.haze && !c.still);

/** What a look last drew, for the browser specs: the found walls and the hazed faces. */
export interface CuesShown { found: Cell[]; haze: { at: Cell; face: Dir }[]; strength: number }
export const cuesShown = (c: CueDraw): CuesShown =>
  ({ found: c.found.map(f => f.at), haze: c.haze ? c.haze.faces.map(f => ({ at: f.at, face: f.face })) : [], strength: c.haze?.strength ?? 0 });
