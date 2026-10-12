/* Operation Tankity: what the battlefield shows each frame.
 *
 * The camera, and the snapshot of everything the canvas shows this frame
 * (whose turn marker shows, whether the aim arm is up, when the clock counts
 * down on the canvas). src/render.ts reads that snapshot and paints it; it
 * never writes back. The game's state, the room client and the replay arrive
 * as deps. */
import type { GameState, GameTank, MatchState, Tables } from './game-types.ts';
import type { FxEngine } from './fx/types.ts';
import { CLOCK_SHOW_S } from './net.ts';
import type { RoomClient } from './net.ts';
import { PV_W, PV_H, PV_FOE_HP } from './preview.ts';
import { fitField, visibleWorld } from './field.ts';
import { createGhosts } from './ghosts.ts';
import { createRenderer } from './render.ts';
import type { BattleView, DrawTank, Renderer } from './render.ts';
import type { Replay } from './replay.ts';
import { sceneryY } from './scenery.ts';
import {
  hashSeed, mulberry32, gauss, GRAV, FLAT_GRAV, H, clamp, surfY as simSurfY, facing, isGroundUnit, muzzle,
} from './sim.ts';
import type { Weapon } from './sim.ts';

/** The slice of the game's state the view reads and steps (main.ts's G). */
export type ViewState = Pick<GameState, 'tanks' | 'turn' | 'phase' | 'over' | 'cam' | 'terrain' | 'clouds' | 'time' | 'shake'
  | 'seed' | 'booms' | 'fx' | 'shells' | 'parts' | 'wind' | 'preview' | 'w' | 'hills'>;

/** What the view needs from the page and the rest of the game. */
export interface ViewDeps {
  G: ViewState;
  tables: Pick<Tables, 'weapons'>;
  net: Pick<RoomClient, 'on' | 'code' | 'turnClockLeft'>;
  MATCH: Pick<MatchState, 'myTurn'>;
  replay: Pick<Replay, 'shooter' | 'flying'>;
  FX: FxEngine | null;
  fxSet(key: string): { body?: unknown };
  cur(): GameTank;
  textScale(): number;
}

export function createView(deps: ViewDeps) {
  const { G, tables, net, MATCH, replay, FX, fxSet, cur, textScale } = deps;

  /* The camera only ever pulls back, slowly, to keep every live tank framed. */
  function updateCamera(dt: number): void {
    // Always centred: the view is never narrower than the field (fitField), so panning would only
    // cut one edge of the field off and show scenery at the other.
    let tz = 1;
    const tx = G.w / 2;
    let ty = H / 2;
    const live = G.tanks.filter(t => t.hp > 0);
    if (live.length) {
      let y0 = Infinity, y1 = -Infinity;
      for (const t of live) {
        y0 = Math.min(y0, t.y - 56); y1 = Math.max(y1, t.y);
      }
      const pad = 70;
      const spanY = Math.max(1, (y1 - y0) + pad * 2);
      tz = clamp(Math.min(H / spanY, 1), 0.45, 1); // the field is always in view across, so only height pulls back
      ty = (y0 + y1) / 2;
    }
    const k = Math.min(1, dt * 1.5);
    G.cam.z += (tz - G.cam.z) * k;
    G.cam.cx += (tx - G.cam.cx) * k;
    G.cam.cy += (ty - G.cam.cy) * k;
    // Pin the ground to the viewport floor: the visible bottom edge never drops
    // below the world base, so no void opens up under the terrain. Tanks live
    // on the ground, so they stay framed while the sky takes the slack above.
    const halfView = (H / 2) / Math.max(0.2, G.cam.z);
    G.cam.cy = Math.min(G.cam.cy, H + 8 - halfView);
  }
  /* Aim as drawn. Solo drones animate their real angle and power; in rooms the
     server only reports where a rival ended up, so the drawing glides there
     (showA/showP, eased in netEaseAim) instead of jumping. */
  function shownAngle(t: DrawTank): number {
    return t.showA === undefined ? t.angle : t.showA;
  }
  function shownPower(t: GameTank): number {
    return t.showP === undefined ? t.power : t.showP;
  }
  /* Aim-arm length in world units: 14 at power 10 up to 50 at power 100. */
  function aimArmLength(power: number): number {
    return 10 + clamp(power, 10, 100) * 0.4;
  }
  /* Whose turn the battlefield shows: the shooter of a replaying volley, else
     the tank whose turn it is. Nobody between rounds or after the match. */
  function turnTank(): GameTank | null {
    if (G.over || G.phase === 'shop' || G.phase === 'banner') return null;
    const shooter = net.on ? replay.shooter() : null;
    if (shooter) return shooter as GameTank;
    const t = G.tanks[G.turn];
    return t && t.hp > 0 ? t : null;
  }
  /* ---------- the battlefield: painted by src/render.ts ---------- */
  /* A ground unit has moved when its x changed since the last frame (walker legs
     shuffle, buggy wheels spin). That memory is game state, so it is stepped
     here, before the frame is built, and the renderer only reads `moving`. */
  function trackMotion(): void {
    for (const t of G.tanks) {
      if (t.hp <= 0 || !isGroundUnit(t)) continue;
      t.moving = Math.abs(t.x - (t.lastX ?? t.x)) > 0.01;
      t.lastX = t.x;
    }
  }
  /* The snapshot of everything the canvas shows this frame. render.ts reads it
     and paints; it never writes back. The rules live here: whose turn marker
     shows, whether the aim arm is up, when the clock counts down on the canvas. */
  const ghosts = createGhosts();
  let ghostTime = 0;
  function battleView(): BattleView {
    const t = cur();
    const aiming = (G.phase === 'aim' || G.phase === 'think') && t && t.hp > 0 && !G.over;
    const left = net.turnClockLeft();
    const pv = G.preview;
    // Shells the sim retires past the field's edge fly on, drawn only, over the scenery.
    const flying = replay.flying();
    if (G.time < ghostTime) ghosts.clear(); // a new match restarted the clock
    const flyOn = ghosts.frame([...G.shells, ...flying], G.w, Math.min(0.1, Math.max(0, G.time - ghostTime)), G.wind,
      wkey => (tables.weapons[wkey]?.flat ? FLAT_GRAV : GRAV));
    ghostTime = G.time;
    return {
      time: G.time, shake: G.shake, cam: G.cam,
      skyKey: net.on ? 'room:' + net.code : String(G.seed || ''),
      terrain: G.terrain, field: { w: G.w, h: H }, hills: G.hills, clouds: G.clouds, tanks: G.tanks,
      turnUnit: turnTank(), online: net.on,
      aim: aiming ? { unit: t, length: aimArmLength(shownPower(t)) } : null,
      booms: G.booms, fx: G.fx, shells: G.shells, replay: flying, ghosts: flyOn, sparks: G.parts,
      wind: G.wind,
      textScale: textScale(),
      turnClock: left !== null && left <= CLOCK_SHOW_S && left > 0 ? { left, myTurn: MATCH.myTurn } : null,
      preview: pv && pv.cv ? {
        canvas: pv.cv as HTMLCanvasElement, width: PV_W, height: PV_H, terr: pv.terr, sx: pv.sx, tx: pv.tx,
        angle: pv.angle, foeHp: pv.foeHp, foeHpMax: PV_FOE_HP, wkey: pv.wkey, wind: pv.wind,
        booms: pv.booms, shells: pv.shells, fx: pv.fx, result: pv.result, resultT: pv.resultT,
      } : null,
    };
  }
  /* The backing store follows the battlefield box (at most two device pixels
     per CSS pixel), so the field is drawn in the box's own shape and never
     stretched; #stage tells the layout spec the width and where the field sits. */
  let published = '';
  function fitCanvas(cv: HTMLCanvasElement): void {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const bw = Math.round(cv.clientWidth * dpr), bh = Math.round(cv.clientHeight * dpr);
    if (bw > 0 && bh > 0 && (cv.width !== bw || cv.height !== bh)) {
      cv.width = bw;
      cv.height = bh;
    }
    const fit = fitField({ w: cv.clientWidth || 1, h: cv.clientHeight || 1 }, { w: G.w, h: H });
    const field = [fit.ox, fit.oy, G.w * fit.s, H * fit.s].map(v => Math.round(v)).join(',');
    if (published !== `${G.w}|${field}`) {
      published = `${G.w}|${field}`;
      cv.dataset.w = String(G.w);
      cv.dataset.field = field;
    }
  }
  let renderer: Renderer | null = null;
  function render(): void {
    const cv = document.getElementById('stage') as HTMLCanvasElement | null;
    if (!cv || !G.terrain) return;
    fitCanvas(cv);
    if (!renderer) {
      renderer = createRenderer(cv, {
        fx: FX,
        sim: { facing, isGroundUnit, muzzle, surfY: simSurfY, hashSeed, mulberry32, gauss, fitField, visibleWorld, sceneryY },
        shownAngle,
        look: wkey => (tables.weapons[wkey] || {}).gfx || {},
        fxBody: wkey => fxSet(wkey).body,
        reducedMotion: () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        random: () => Math.random(),
      });
    }
    trackMotion();
    renderer.frame(battleView());
  }
  return { updateCamera, shownAngle, shownPower, render };
}
