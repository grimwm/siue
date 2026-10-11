/* Operation Tankity: the room volley replay.
 *
 * The server settles a whole turn per request and sends it as events, each
 * stamped with `at` (seconds into the volley); a shot carries the path it
 * flew, its launch and landing times and its blast radius. This module plays
 * a volley back at real speed, so every room client shows exactly what the
 * server computed: the barrel easing to the shooter's aim, each shell
 * following its recorded path point by point, blasts and hits landing when
 * the server says they did.
 *
 * It owns the queue of events waiting to play and the volley on screen, and
 * nothing else. What the replay causes (a blast, a muzzle flash, a trail, a
 * sound, a log line, a tank's armor) happens through the ReplayEnv it is built
 * with; where the shells are now it hands back from flying(), for the
 * renderer. game.js decides when a room snapshot is adopted: it asks idle()
 * after step(). Nothing here touches the page, so it compiles in the DOM-free
 * program and replay-test.js steps recorded volleys on a clock the test moves
 * by hand. */
import { planCatchUp, isVolleyOpener } from './net.js';
import type { RoomEvent, RoomSnapshot, ShotEvent, VolleyOpenerEvent } from './protocol.js';

/** rooms.php records a path point every 5 sim steps at 60/s. */
export const PATH_HZ = 12;
/** A volley kept back by a catch-up plays this much faster. */
export const FAST_SPEED = 3;

/** The tank fields the replay reads and writes (game.js's own tank objects). */
export interface ReplayTank {
  seat?: number;
  x: number; y: number;
  angle: number; power: number;
  hp: number;
  showA?: number; // the aim the barrel shows
  showP?: number;
}

/** What the replay needs from its host. */
export interface ReplayEnv {
  /** The tank in `seat`, if any. */
  tank(seat: number): ReplayTank | undefined;
  /** The effect kind of weapon `wkey` ('pierce', 'emp', ...), if it has one. */
  effect(wkey: string): string | undefined;
  /** An event to log (and react to) that the replay itself does not fly. */
  event(e: RoomEvent): void;
  /** A shell leaves its barrel. */
  launch(): void;
  /** A blast at (x, y): sound, crater, shake, particles. */
  blast(x: number, y: number, r: number, wkey: string): void;
  muzzle(wkey: string, x: number, y: number, ang: number): void;
  special(wkey: string, name: string, x: number, y: number, ang: number): void;
  /** A shell in flight: drip its trail from the place and velocity the server's path gives it now. */
  trail(shot: ReplayShot, dt: number, x: number, y: number, vx: number, vy: number, wkey: string): void;
}

/** One shell of the volley: its event, its recorded path, and whether it has landed.
 * `fx` is the trail's own bookkeeping, filled in by the host. */
export interface ReplayShot { e: ShotEvent; pts: [number, number][]; landed: boolean; fx: unknown }

/** Where a replayed shell is on screen. */
export interface ReplayFlying { x: number; y: number; vx: number; vy: number; wkey: string }

interface Volley {
  fast: boolean;
  opener: VolleyOpenerEvent;
  events: RoomEvent[];
  done: Set<RoomEvent>;
  shooter: ReplayTank | undefined;
  tau: number; // seconds of (sped-up) volley time played
  ft: number; // seconds since the barrel stopped moving; negative while it eases
  a0: number; p0: number; x0: number; a1: number; p1: number; x1: number;
  aimDur: number;
  shots: ReplayShot[];
  end: number;
}

export interface Replay {
  /** Events waiting to play. */
  readonly queue: readonly RoomEvent[];
  /** The tank the volley on screen belongs to, while it plays. */
  shooter(): ReplayTank | null;
  /** Add the events of a new snapshot to the back of the queue. */
  push(events: readonly RoomEvent[]): void;
  /** Play `dt` seconds: advance the volley on screen, then start or log whatever is next. */
  step(dt: number): void;
  /** Nothing is playing and nothing is waiting. */
  idle(): boolean;
  /** Shells of the volley on screen, at their place now. */
  flying(): ReplayFlying[];
  /** Skip all but the newest waiting volley (see planCatchUp). Returns the
   * events dropped, for the caller to log, or null when nothing was skipped. */
  catchUp(waiting: RoomSnapshot | null, seat: number): RoomEvent[] | null;
  /** Forget everything: the match is over or left. */
  clear(): void;
}

export function parsePath(str: string | undefined): [number, number][] {
  return String(str || '').split(' ').filter(Boolean).map(p => p.split(',').map(Number) as [number, number]);
}

/** Where a replayed shell is at flight time ft: path points are 1/PATH_HZ s
 * apart. The last element is the path index the position is on. */
export function shellAt(s: Pick<ReplayShot, 'e' | 'pts'>, ft: number): [number, number, number] {
  const k = (ft - s.e.t0) * PATH_HZ;
  const pts = s.pts;
  if (!pts.length) return [s.e.x1, s.e.y1, 0];
  const i = Math.max(0, Math.min(pts.length - 1, Math.floor(k)));
  const j = Math.min(pts.length - 1, i + 1);
  const f = Math.max(0, Math.min(1, k - i));
  const a = pts[i] as [number, number], b = pts[j] as [number, number];
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, i];
}

/** A replayed shell's velocity at path index i (points are 1/PATH_HZ s apart). */
export function shellVel(s: Pick<ReplayShot, 'pts'>, i: number): [number, number] {
  const pts = s.pts, a = pts[Math.min(i, pts.length - 1)], b = pts[Math.min(i + 1, pts.length - 1)];
  if (!a || !b) return [0, 0];
  return [(b[0] - a[0]) * PATH_HZ, (b[1] - a[1]) * PATH_HZ];
}

const clamp = (v: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, v));

export function createReplay(env: ReplayEnv): Replay {
  let queue: RoomEvent[] = [];
  let volley: Volley | null = null;
  let fastNext = false;

  function startVolley(): void {
    const opener = queue.shift() as VolleyOpenerEvent;
    // A catch-up keeps a volley back at triple speed; so does a drone's
    // volley fired with no human left standing.
    const fast = fastNext || !!opener.watch;
    fastNext = false;
    const events: RoomEvent[] = [];
    while (queue.length && !isVolleyOpener(queue[0] as RoomEvent)) events.push(queue.shift() as RoomEvent);
    const shooter = env.tank(opener.seat);
    const a1 = opener.a ?? (shooter ? shooter.angle : 62);
    const p1 = opener.pw ?? (shooter ? shooter.power : 55);
    const x1 = opener.x ?? (shooter ? shooter.x : 0);
    const swing = shooter ? Math.max(Math.abs(a1 - shooter.angle), Math.abs(p1 - shooter.power), Math.abs(x1 - shooter.x)) : 0;
    volley = {
      fast,
      opener, events, done: new Set(), shooter, tau: 0, ft: 0,
      a0: shooter ? shooter.angle : a1, p0: shooter ? shooter.power : p1, x0: shooter ? shooter.x : x1, a1, p1, x1,
      aimDur: swing < 1 ? 0.15 : clamp(0.45 + swing / 110, 0.5, 1.4),
      shots: [], end: Math.max(0, ...events.map(e => ('t1' in e ? e.t1 : undefined) ?? e.at ?? 0)) + 0.6,
    };
    env.event(opener);
  }

  function stepVolley(v: Volley, dt: number): void {
    // A volley kept back from a catch-up plays at triple speed.
    v.tau += dt * (v.fast ? FAST_SPEED : 1);
    const sh = v.shooter;
    if (sh) {
      const u = Math.min(1, v.tau / v.aimDur);
      const e = u * u * (3 - 2 * u);
      sh.angle = v.a0 + (v.a1 - v.a0) * e;
      sh.power = v.p0 + (v.p1 - v.p0) * e;
      sh.x = v.x0 + (v.x1 - v.x0) * e;
      sh.showA = sh.angle;
      sh.showP = sh.power;
    }
    const ft = v.tau - v.aimDur;
    v.ft = ft;
    if (ft < 0) return;
    for (const e of v.events) {
      if (v.done.has(e) || e.at === undefined || ft < e.at) continue;
      v.done.add(e);
      if (e.t === 'shot') {
        const shot: ReplayShot = { e, pts: parsePath(e.p), landed: false, fx: null };
        v.shots.push(shot);
        env.launch();
        // Bomblets leave the bloom point; every other shot leaves the barrel.
        const first = shot.pts[0];
        if (e.t0 < 0.01 && shot.pts.length > 1 && first) {
          const hv = shellVel(shot, 0);
          env.muzzle(e.w, first[0], first[1], Math.atan2(hv[1], hv[0]));
        }
      } else if (e.t === 'burst') {
        env.blast(e.x, e.y, e.r, e.w);
        // A burst from a lance is the bolt passing through a tank.
        const pass = env.effect(e.w) === 'pierce' && v.shots.find(s => s.e.w === e.w);
        if (pass) {
          const hv = shellVel(pass, shellAt(pass, ft)[2]);
          env.special(e.w, 'pierce', e.x, e.y, Math.atan2(hv[1], hv[0]));
        }
      } else {
        if (e.t === 'hit') {
          const t = env.tank(e.seat);
          if (t) t.hp = Math.max(0, t.hp - e.dmg);
          // Over a fried tank, the EMP's arcs.
          const emp = t && v.shots.find(s => env.effect(s.e.w) === 'emp');
          if (t && emp) env.special(emp.e.w, 'arc', t.x, t.y - 12, 0);
        } else if (e.t === 'kill') {
          const t = env.tank(e.seat);
          if (t) t.hp = 0;
        }
        env.event(e);
      }
    }
    for (const s of v.shots) {
      if (s.landed) continue;
      if (ft < s.e.t1) {
        // In flight: the trail drips along the path the server flew.
        const at = shellAt(s, ft), hv = shellVel(s, at[2]);
        env.trail(s, dt, at[0], at[1], hv[0], hv[1], s.e.w);
        continue;
      }
      s.landed = true;
      if (s.e.r > 0) env.blast(s.e.x1, s.e.y1, s.e.r, s.e.w);
      else if (s.e.split) {
        const hv = shellVel(s, s.pts.length - 2);
        env.special(s.e.w, 'split', s.e.x1, s.e.y1, Math.atan2(hv[1], hv[0]));
      }
    }
    if (ft >= v.end && v.events.every(e => v.done.has(e) || e.at === undefined) && v.shots.every(s => s.landed)) {
      for (const e of v.events) if (!v.done.has(e)) env.event(e);
      volley = null;
    }
  }

  return {
    get queue() { return queue; },
    shooter: () => (volley && volley.shooter) || null,
    push(events) { queue.push(...events); },
    step(dt) {
      if (volley) stepVolley(volley, dt);
      while (!volley && queue.length) {
        if (isVolleyOpener(queue[0] as RoomEvent)) startVolley();
        else env.event(queue.shift() as RoomEvent);
      }
    },
    idle: () => !volley && !queue.length,
    flying() {
      const out: ReplayFlying[] = [];
      if (volley && volley.ft >= 0) {
        for (const sh of volley.shots) {
          if (sh.landed) continue;
          const [hx, hy, idx] = shellAt(sh, volley.ft);
          const hv = shellVel(sh, idx);
          out.push({ x: hx, y: hy, vx: hv[0], vy: hv[1], wkey: sh.e.w });
        }
      }
      return out;
    },
    catchUp(waiting, seat) {
      const plan = planCatchUp(queue, !!volley, waiting, seat);
      if (!plan) return null;
      volley = null;
      const skipped = queue.slice(0, plan.cut);
      queue = queue.slice(plan.cut);
      fastNext = plan.fastNext;
      return skipped;
    },
    clear() { queue = []; volley = null; },
  };
}
