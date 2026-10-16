/* Operation Tankity: the arena's walls.
 *
 * The field's left and right edges are walls, as in Scorched Earth. None (the
 * default) leaves them open: a shell flies off and is gone. Concrete: a shell
 * bursts against the wall. Rubber: it bounces back, keeping RUBBER_KEEP of
 * its speed across the wall. Spring: it bounces back with SPRING_KICK times
 * that speed. Wraparound: it leaves one side and comes in at the other, at
 * the same height and velocity. The top is open in every mode (Scorched
 * Earth's sky has no ceiling): a shell that leaves it falls back in.
 *
 * Random is a setting, not a wall: each round plays one of the four real
 * walls, drawn from the round's own random stream (wallsFor). The sim only
 * ever sees a real wall.
 *
 * wallStep is the one place a flight meets a wall: sim.ts stepBallistic calls
 * it after every step when the air carries walls, so the war, the drones'
 * search, the aim guide, the camera and the firing range all fly the same
 * walls. server/walls.php is the same to the last bit, kept in step by the
 * `walls` group of protocol/sim-vectors.json.
 *
 * DOM-free: the setting is kept through _kit/prefs; the menu, the lobby and
 * the renderer draw it. */
import type { StorageLike } from '../../_kit/ports.ts';
import { oneOf, pref } from '../../_kit/prefs.ts';

/** A wall the sim flies against. */
export type Walls = 'none' | 'concrete' | 'rubber' | 'spring' | 'wrap';
/** What a player or a host picks: a wall, or Random (one real wall per round). */
export type WallsSetting = Walls | 'random';
/** Every wall the sim knows, in the order the pickers show them. */
export const WALLS: readonly Walls[] = ['none', 'concrete', 'rubber', 'spring', 'wrap'];
/** What Random draws from: the four real walls, never None. */
export const REAL_WALLS: readonly Walls[] = ['concrete', 'rubber', 'spring', 'wrap'];
/** Every pick, in the order the pickers show them. */
export const WALL_SETTINGS: readonly WallsSetting[] = [...WALLS, 'random'];
export const WALL_NAMES: Readonly<Record<WallsSetting, string>> = {
  none: 'None', concrete: 'Concrete', rubber: 'Rubber', spring: 'Spring', wrap: 'Wraparound', random: 'Random',
};
/** The share of its speed across the wall a shell keeps off Rubber. */
export const RUBBER_KEEP = 0.7;
/** How much faster across the wall a shell leaves a Spring. */
export const SPRING_KICK = 1.3;

/** What a step did at a wall: nothing, bounced, wrapped to the other side, or burst against Concrete. */
export const WALL_NONE = 0, WALL_BOUNCE = 1, WALL_WRAP = 2, WALL_BURST = 3;

export function isWalls(v: unknown): v is Walls {
  return typeof v === 'string' && (WALLS as readonly string[]).includes(v);
}
export function isWallsSetting(v: unknown): v is WallsSetting {
  return typeof v === 'string' && (WALL_SETTINGS as readonly string[]).includes(v);
}
/** A wall as the wire or a save carries it: anything unknown (an old room, an old client) is None. */
export function parseWalls(v: unknown): Walls {
  return isWalls(v) ? v : 'none';
}
/** The wall a round plays: the setting itself, or for Random one of the four real walls by one
 *  draw of the round's stream. Only Random draws, so every other setting leaves the stream as it was.
 *  server/walls.php room_walls_for is the same. */
export function wallsFor(setting: WallsSetting, rng: () => number): Walls {
  if (setting !== 'random') return setting;
  return REAL_WALLS[Math.min(REAL_WALLS.length - 1, Math.floor(rng() * REAL_WALLS.length))]!;
}
/** Whether liquid (liquid dirt, a napalm pool) pools against this wall instead of spilling off the
 *  field: every solid wall does; None and Wraparound have nothing to hold it. */
export function wallsDam(w: Walls | undefined): boolean {
  return w === 'concrete' || w === 'rubber' || w === 'spring';
}
/** Whether a shell rebounds off this wall (and a roller rolls back off it). */
export function wallsBounce(w: Walls | undefined): boolean {
  return w === 'rubber' || w === 'spring';
}
/** The factor a bounce multiplies the speed across the wall by (its sign flips too). */
export function wallKeep(w: Walls): number {
  return w === 'spring' ? SPRING_KICK : RUBBER_KEEP;
}
/** What the round banner and the HUD say: "Walls: Rubber"; nothing for None. */
export function wallsLine(w: Walls | undefined): string {
  return w && w !== 'none' ? `Walls: ${WALL_NAMES[w]}` : '';
}

/** Anything that flies. */
export interface Flier { x: number; y: number; vx: number; vy: number }

/* A flight's step from (px, py) to where st is now, against the walls of a
   field fw wide. Concrete and the bouncing walls stand at x = 0 and at the
   last column, x = fw - 1; Wraparound joins x = 0 to x = fw. Concrete stops
   the shell on the wall, at the height it crossed it; a bounce mirrors the
   overshoot back onto the field and turns vx round, times wallKeep; a wrap
   moves it a field's width to the other side. Returns what happened (WALL_*).
   server/walls.php room_wall_step is the same. */
export function wallStep(st: Flier, walls: Walls, fw: number, px: number, py: number): number {
  if (walls === 'none') return WALL_NONE;
  if (walls === 'wrap') {
    if (st.x < 0) { st.x += fw; return WALL_WRAP; }
    if (st.x >= fw) { st.x -= fw; return WALL_WRAP; }
    return WALL_NONE;
  }
  const right = fw - 1;
  if (st.x >= 0 && st.x <= right) return WALL_NONE;
  const wx = st.x < 0 ? 0 : right;
  if (walls === 'concrete') {
    const dx = st.x - px;
    const f = dx === 0 ? 1 : Math.max(0, Math.min(1, (wx - px) / dx));
    st.y = py + (st.y - py) * f;
    st.x = wx;
    return WALL_BURST;
  }
  st.x = Math.max(0, Math.min(right, 2 * wx - st.x));
  st.vx = -st.vx * wallKeep(walls);
  return WALL_BOUNCE;
}
/* A roller on the ground at r.x (its speed along the ground r.u), on a field n
   columns wide: off a bouncing wall it rolls back (r.u turned round, times
   wallKeep); through Wraparound it comes out at the other edge (columns 0 and
   n - 1 are the same place). Concrete and None stop it at the edge, which the
   roller's own step reads. Returns what happened (WALL_*). server/walls.php
   room_wall_roll is the same. */
export function wallRoll(r: { x: number; u: number }, walls: Walls, n: number): number {
  const right = n - 1;
  if (r.x >= 0 && r.x <= right) return WALL_NONE;
  if (walls === 'wrap') {
    r.x += r.x < 0 ? right : -right;
    return WALL_WRAP;
  }
  if (!wallsBounce(walls)) return WALL_NONE;
  const wx = r.x < 0 ? 0 : right;
  r.x = Math.max(0, Math.min(right, 2 * wx - r.x));
  r.u = -r.u * wallKeep(walls);
  return WALL_BOUNCE;
}

/** Where a shell met a wall, as the battlefield flashes it: the place, how (WALL_*), and seconds since. */
export interface WallHit { x: number; y: number; hit: number; t: number }
/** Seconds the wall flashes where a shell met it. */
export const WALL_FLASH_S = 0.4;
/** Ages the flashes by dt and drops the spent ones, in place. */
export function ageWallHits(hits: WallHit[], dt: number): void {
  let n = 0;
  for (const h of hits) {
    h.t += dt;
    if (h.t < WALL_FLASH_S) hits[n++] = h;
  }
  hits.length = n;
}

/** The solo Walls setting, kept in this browser under `tankity-walls`; a missing or unknown word reads as None. */
export interface WallsPref {
  get(): WallsSetting;
  set(w: WallsSetting): void;
}
export const WALLS_KEY = 'tankity-walls';
export function wallsSetting(storage: StorageLike | null): WallsPref {
  const saved = pref<WallsSetting>(WALLS_KEY, 'none', oneOf(WALL_SETTINGS, 'none'), storage);
  return { get: saved.get, set: saved.set };
}
