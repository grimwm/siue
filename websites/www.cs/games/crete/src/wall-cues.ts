/* The Island of Crete: the cues the hidden walls give, in both looks; only how they look, never the rules.
 * An invisible wall Theseus has bumped is wall in the state (src/puzzle/step.ts) and is drawn as wall; it also wears
 * a faint glassy sheen, so it reads as found, after a short shimmer as it comes into view (`SHIMMER_MS`). Which walls
 * are found is read from the state alone (the level's invisible walls that are wall now), so a switch of looks, an
 * undo or a restart shows exactly what the state holds. An invisible wall not yet shown, while Theseus stands beside
 * it, gives a pane of pale glass on its face toward him, just inside its cell, that comes up over `GLASS_IN_MS`
 * (at once under reduced motion) and goes the moment he is no longer beside it: it is read from where he stands, never
 * kept, so the player has to remember it. A fake wall beside Theseus, once he has stood still for `IDLE_MS`, shows a
 * faint haze on its face toward him that breathes gently while he stays, a still tint under reduced motion, and goes
 * as soon as anything is pressed. DOM-free. */
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
/** How long the glass of an invisible wall beside Theseus takes to come up. */
export const GLASS_IN_MS = 600;

/** A hidden wall's face toward Theseus: the wall's cell and the way from it to him. */
export interface Face { readonly at: Cell; readonly face: Dir }

const STEP: Record<Dir, readonly [number, number]> = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] };
const OPPOSITE: Record<Dir, Dir> = { up: 'down', down: 'up', left: 'right', right: 'left' };

/** The level's invisible walls the state shows (bumped, so wall now), as cell indices, ascending. */
export function foundWalls(s: Pick<State, 'level' | 'terrain'>): number[] {
  const out: number[] = [];
  s.level.terrain.forEach((t, i) => { if (t === 'invisible-wall' && s.terrain[i] === 'wall') out.push(i); });
  return out;
}

/** The cells of `kind` beside Theseus, each with its face toward him, in the order up, down, left, right. */
function facesOf(s: Pick<State, 'level' | 'terrain' | 'player'>, kind: 'fake-wall' | 'invisible-wall'): Face[] {
  const { rows, cols } = s.level;
  const out: Face[] = [];
  for (const d of DIRS) {
    const r = s.player.r + STEP[d][0], c = s.player.c + STEP[d][1];
    if (r < 0 || c < 0 || r >= rows || c >= cols) continue;
    if (s.terrain[r * cols + c] === kind) out.push({ at: { r, c }, face: OPPOSITE[d] });
  }
  return out;
}

/** The fake walls still standing beside Theseus, each with its face toward him, in the order up, down, left, right. */
export const fakeFaces = (s: Pick<State, 'level' | 'terrain' | 'player'>): Face[] => facesOf(s, 'fake-wall');

/** The invisible walls not yet shown beside Theseus, each with its face toward him, in the order up, down, left,
 *  right: the glass he senses. One he has bumped is wall now and is no longer among them. */
export const glassFaces = (s: Pick<State, 'level' | 'terrain' | 'player'>): Face[] => facesOf(s, 'invisible-wall');

/** A face of glass beside Theseus and how far it has come up, 0 to 1. */
export interface GlassFace extends Face { readonly strength: number }

/** When each face of glass beside Theseus came to be beside him, by the page's clock, so it comes up over
 *  `GLASS_IN_MS`. A face no longer beside him is forgotten, so coming back beside it brings it up again. Nothing here
 *  is in the try's state. */
export interface GlassClock {
  /** The glass to show for `s` (none when `show` is false: the try is over, or the editor is up). */
  update(s: Pick<State, 'level' | 'terrain' | 'player'>, now: number, reduced: boolean, show: boolean): GlassFace[];
}

export function createGlassClock(): GlassClock {
  const since = new Map<string, number>();
  return {
    update(s, now, reduced, show) {
      const faces = show ? glassFaces(s) : [];
      const keys = faces.map(f => `${f.at.r},${f.at.c}${f.face}`);
      for (const k of [...since.keys()]) if (!keys.includes(k)) since.delete(k);
      return faces.map((f, n) => {
        const k = keys[n]!;
        if (!since.has(k)) since.set(k, now);
        const strength = reduced ? 1 : Math.min(1, Math.max(0, (now - since.get(k)!) / GLASS_IN_MS));
        return { ...f, strength };
      });
    },
  };
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

/** What a look draws for the hidden walls this frame: each found wall and its shimmer, the glass beside Theseus, the
 *  haze (if any), the haze's clock in seconds for its ripple, and whether motion is reduced (the haze then a still
 *  tint). */
export interface CueDraw {
  readonly found: readonly { readonly at: Cell; readonly shimmer: number | null }[];
  readonly glass: readonly GlassFace[];
  readonly haze: { readonly faces: readonly Face[]; readonly strength: number } | null;
  readonly t: number;
  readonly still: boolean;
}

export const NO_CUES: CueDraw = { found: [], glass: [], haze: null, t: 0, still: false };

/** Whether `c` moves on its own: a shimmer running, glass coming up, or a haze that ripples. A look keeps drawing
 *  while it does. */
export const cuesMoving = (c: CueDraw): boolean =>
  c.found.some(f => f.shimmer !== null) || c.glass.some(g => g.strength < 1) || (!!c.haze && !c.still);

/** `c` as a key that changes whenever what it draws does; a haze's ripple steps at 15 fps. */
export const cueKey = (c: CueDraw): string =>
  `${c.found.map(f => `${f.at.r},${f.at.c}:${f.shimmer === null ? '-' : f.shimmer.toFixed(2)}`).join(';')}|${
    c.glass.map(g => `${g.at.r},${g.at.c}${g.face}:${g.strength.toFixed(2)}`).join(';')}|${
    c.haze ? `${c.haze.faces.map(f => `${f.at.r},${f.at.c}${f.face}`).join(';')}:${c.haze.strength.toFixed(2)}:${c.still ? '-' : Math.floor(c.t * 15)}` : '-'}`;

/** What a look last drew, for the browser specs: the found walls, the faces of glass and the hazed faces. */
export interface CuesShown { found: Cell[]; glass: { at: Cell; face: Dir }[]; haze: { at: Cell; face: Dir }[]; strength: number }
export const cuesShown = (c: CueDraw): CuesShown => ({
  found: c.found.map(f => f.at),
  glass: c.glass.map(g => ({ at: g.at, face: g.face })),
  haze: c.haze ? c.haze.faces.map(f => ({ at: f.at, face: f.face })) : [],
  strength: c.haze?.strength ?? 0,
});
