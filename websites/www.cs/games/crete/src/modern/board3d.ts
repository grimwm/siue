/* The modern board: a three.js scene drawn on the modern canvas, only when something changes. A level builds the
 * ground, the walls, one model per cell and the light; a shown state rebuilds only the cells whose model
 * changed, and stands the pieces and figures where the state and the turn put them, with Ariadne's thread on
 * the floor. A frame is drawn when the board is told of a change, and more follow only while the camera eases,
 * a wall fades, a figure turns or the tile loops tick. The tile loops tick at 12 fps, only while one is on screen,
 * the tab is visible, the board is in view and motion is not reduced. The camera looks down at 45° through an
 * orthographic lens, and follows Theseus until a pan or the mini map sends it elsewhere; the controls
 * (controls.ts) turn and pan it, and the mini map (minimap.ts) shows what it sees. A wall that hides Theseus fades
 * in every walls mode; in Ghosted, one that hides any figure or piece fades too. The floating icons are drawn
 * over the finished picture. */
import { Color, Group, OrthographicCamera, PCFSoftShadowMap, Scene, Vector3, WebGLRenderer } from 'three';
import type { Object3D } from 'three';
import type { Atlas, Figures, Pos } from '../board-plan.ts';
import type { State } from '../puzzle/state.ts';
import type { Cell } from '../puzzle/tiles.ts';
import type { WallMode } from '../settings.ts';
import { DEFAULT_YAW, PITCH, clampCam, easeCam, nearestYaw, panCam, viewRows } from './camera.ts';
import type { Cam } from './camera.ts';
import { createControls } from './controls.ts';
import { changedCells } from './diff.ts';
import { ghostSubjects } from './ghost.ts';
import { createMinimap } from './minimap.ts';
import { SURFACES, placed, terrainModel } from './model-names.ts';
import type { TerrainModel } from './model-names.ts';
import { frameSample, nextQuality } from './quality.ts';
import type { Quality } from './quality.ts';
import { createActors } from './scene/figures.ts';
import { FY, cellX, cellZ, createFloor } from './scene/floor.ts';
import { createIconSheet } from './scene/icons.ts';
import { createLights } from './scene/light.ts';
import type { Lights } from './scene/light.ts';
import { createPaint } from './scene/paint.ts';
import { TERRAIN_MODELS, disposeModel } from './scene/terrain.ts';
import type { PieceInfo } from './scene/terrain.ts';
import { createKit } from './scene/textures.ts';
import { createThread } from './scene/thread.ts';
import { LOW_H, WALL_H, createWalls } from './scene/walls.ts';
import type { Seen } from './scene/walls.ts';

export interface ModernHost {
  /** The modern canvas, sized by CSS to the board region. */
  canvas: HTMLCanvasElement;
  /** A layer over the canvas, the same size, for the camera buttons and the mini map. */
  overlay: HTMLElement;
  /** For the mini map. */
  atlas: Atlas;
  image: HTMLImageElement;
  /** True while a layer other than `start` is open. */
  blocked(): boolean;
  /** A camera gesture happened (closes the start card). */
  gesture(): void;
  reducedMotion(): boolean;
}

export interface ModernBoard {
  /** Builds the scene for a new level; the camera resets to follow. */
  level(s: State): void;
  /** Applies the state and figures locally and draws once. */
  show(f: { state: State; figures: Figures }, thread: readonly Cell[] | null): void;
  walls(m: WallMode): void;
  /** The camera's yaw in degrees, for screenToGrid. */
  yaw(): number;
  reset(): void;
  resize(): void;
  /** A hidden board draws nothing and stops its loops. */
  setActive(on: boolean): void;
  /** Frames drawn, for tests. */
  frames(): number;
  /** The render quality step (quality.ts), for tests. */
  quality(): number;
  dispose(): void;
}

const BACKGROUND = 0x060504;
const RAD = Math.PI / 180;
const LOOP_FPS = 12;

export function createModernBoard(host: ModernHost): ModernBoard {
  const renderer = new WebGLRenderer({ canvas: host.canvas, antialias: false, powerPreference: 'high-performance' });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false;
  const kit = createKit(renderer);
  const scene = new Scene();
  scene.background = new Color(BACKGROUND);
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 200);
  const ndc = new Vector3();
  const paint = createPaint(renderer);
  const floor = createFloor(kit);
  const wallSet = createWalls(kit);
  const pieceGroup = new Group();
  const sheet = host.atlas && host.image ? createIconSheet(host.atlas, host.image, () => invalidate()) : null;
  const actors = createActors(kit, sheet, () => host.reducedMotion());
  const thread = createThread();
  scene.add(floor.group, wallSet.group, pieceGroup, actors.group, thread.group);
  const iconScene = new Scene();
  iconScene.add(actors.icons);

  let active = true;
  let drawn = 0;
  let raf = 0;
  let lastNow = -1e9;
  let chained = false;
  let quality: Quality = 3;
  let frameMs: number[] = [];
  let width = 1, height = 1;
  let mode: WallMode = 'solid';
  let last: State | null = null;
  let lastPlayer: Pos | null = null;
  let models: TerrainModel[] = [];
  let pieces: (Object3D | null)[] = [];
  let lights: Lights | null = null;
  let loopT = 0;
  let loopTimer: ReturnType<typeof setTimeout> | 0 = 0;
  let inView = true;
  let viewKey = '';
  // What the next frame must redo.
  let aimWalls = true;
  let loopsDirty = true;
  let shadowsDirty = true;

  /** The camera: where it is, where it eases to, and whether its target follows Theseus. */
  const cur: Cam = { yaw: DEFAULT_YAW, tx: 0, tz: 0 };
  const goal: Cam = { ...cur };
  let follow = true;

  const snap = () => host.reducedMotion();
  const dpr = () => (quality === 0 ? 1 : Math.min(globalThis.devicePixelRatio || 1, 2));
  const rows = () => last?.level.rows ?? 1;
  const cols = () => last?.level.cols ?? 1;

  function invalidate(): void {
    if (!raf && active) raf = requestAnimationFrame(frame);
  }

  /** Moves the tile loops (water, fire, torches, the teleport) to `t` seconds and draws them. */
  function loopAt(t: number): void {
    loopT = t;
    loopsDirty = true;
    invalidate();
  }
  const loopsMay = () => active && inView && !document.hidden && !host.reducedMotion();
  /** Ticks the tile loops at 12 fps while they may run, drawing only when one is on screen. */
  function scheduleLoops(): void {
    if (loopTimer) clearTimeout(loopTimer);
    loopTimer = 0;
    if (!loopsMay()) return;
    loopTimer = setTimeout(() => {
      loopTimer = 0;
      if (!loopsMay()) return;
      if (last && loopOnScreen()) loopAt(loopT + 1 / LOOP_FPS);
      else loopT += 1 / LOOP_FPS;
      scheduleLoops();
    }, 1000 / LOOP_FPS);
  }

  /** True while any looping thing stands in the camera's view. */
  function loopOnScreen(): boolean {
    applyCamera();
    const on = (v: Vector3) => {
      ndc.copy(v).project(camera);
      return Math.abs(ndc.x) < 1.05 && Math.abs(ndc.y) < 1.05;
    };
    return (lights?.anchors ?? []).some(on) || actors.looping().some(o => on(o.position))
      || pieces.some(p => !!(p?.userData as PieceInfo | undefined)?.loop && on(p!.position));
  }

  function applyCamera(): void {
    const y = cur.yaw * RAD, p = PITCH * RAD, D = 40;
    camera.position.set(cur.tx + Math.sin(y) * Math.cos(p) * D, FY + Math.sin(p) * D, cur.tz + Math.cos(y) * Math.cos(p) * D);
    camera.up.set(-Math.sin(y), 0, -Math.cos(y)); // screen-up is the board's forward
    camera.lookAt(cur.tx, FY, cur.tz);
    const hh = viewRows(width / height) / 2, a = width / height;
    camera.left = -hh * a;
    camera.right = hh * a;
    camera.top = hh;
    camera.bottom = -hh;
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
  }

  function aimGoal(): void {
    if (follow && lastPlayer) {
      goal.tx = cellX(lastPlayer.c, cols());
      goal.tz = cellZ(lastPlayer.r, rows());
    }
    Object.assign(goal, clampCam(goal, cols(), rows()));
  }

  /** What the walls fade for: Theseus in every mode; in Ghosted, every figure, piece and tall tile too. */
  function seen(): Seen[] {
    const { hero, rest } = actors.seen();
    if (mode === 'ghosted' && last) {
      const nc = cols(), nr = rows();
      pieces.forEach((p, i) => {
        const info = p?.userData as PieceInfo | undefined;
        if (!info || info.h <= 0) return;
        rest.push({ x: cellX(i % nc, nc), z: cellZ(Math.floor(i / nc), nr), half: info.half, h: info.h });
      });
    }
    return ghostSubjects(mode, hero, rest);
  }

  function applyQuality(): void {
    lights?.shadows(quality >= 3);
    shadowsDirty = true;
    resize();
  }

  function frame(now: number): void {
    raf = 0;
    if (!active) { chained = false; return; }
    const gap = now - lastNow;
    lastNow = now;
    // Only a frame the one before it asked for is part of an animation: its gap is a frame time.
    const sample = frameSample(chained, gap);
    if (sample !== null) {
      frameMs.push(sample);
      if (frameMs.length > 20) frameMs = frameMs.slice(-20);
      const q = nextQuality(quality, frameMs);
      if (q !== quality) {
        quality = q;
        frameMs = [];
        applyQuality();
      }
    }
    const dt = sample !== null ? Math.min(0.1, gap / 1000) : 1 / 60;
    aimGoal();
    let busy = easeCam(cur, goal, dt, snap());
    if (busy) aimWalls = true;
    applyCamera();
    if (aimWalls) {
      wallSet.aim(camera, seen());
      aimWalls = false;
    }
    busy = wallSet.ease(dt, snap()) || busy;
    if (actors.ease(dt, snap())) {
      busy = true;
      shadowsDirty = true;
    }
    if (loopsDirty) {
      floor.loop(loopT);
      lights?.loop(loopT);
      actors.loop(loopT);
      for (const p of pieces) (p?.userData as PieceInfo | undefined)?.loop?.(loopT);
      loopsDirty = false;
    }
    if (shadowsDirty) {
      renderer.shadowMap.needsUpdate = true;
      shadowsDirty = false;
    }
    paint.render(scene, camera, quality >= 2);
    if (actors.icons.children.length) {
      renderer.autoClear = false;
      renderer.render(iconScene, camera);
      renderer.autoClear = true;
    }
    const key = `${cur.yaw} ${cur.tx} ${cur.tz} ${width} ${height}`;
    if (key !== viewKey) {
      viewKey = key;
      mini?.view(cur, width / height);
    }
    drawn++;
    chained = busy;
    if (busy) invalidate();
  }

  function resize(): void {
    const w = host.canvas.clientWidth, h = host.canvas.clientHeight;
    if (w <= 0 || h <= 0) return;
    width = w;
    height = h;
    const r = dpr();
    renderer.setPixelRatio(r);
    renderer.setSize(w, h, false);
    paint.setSize(Math.round(w * r), Math.round(h * r), r);
    mini?.fit(host.overlay.clientWidth || w, host.overlay.clientHeight || h);
    aimWalls = true;
  }

  function placePiece(i: number): void {
    const old = pieces[i];
    if (old) {
      pieceGroup.remove(old);
      disposeModel(old, kit);
    }
    const nc = cols(), nr = rows(), r = Math.floor(i / nc), c = i % nc;
    const wall = (rr: number, cc: number) => rr < 0 || cc < 0 || rr >= nr || cc >= nc || models[rr * nc + cc] === 'wall';
    const o = TERRAIN_MODELS[models[i]!]({ kit, r, c, wall });
    const info = o.userData as PieceInfo;
    if (!o.children.length) {
      pieces[i] = null;
      return;
    }
    o.position.set(cellX(c, nc), 0, cellZ(r, nr));
    if (info.tall && mode === 'low') o.scale.y = LOW_H / WALL_H;
    pieceGroup.add(o);
    pieces[i] = o;
  }

  /** Stands the pieces and figures; true when any moved, turned, came or went. */
  function setFigures(s: State, f: Figures): boolean {
    lastPlayer = { r: f.player.r, c: f.player.c };
    const changed = actors.set(placed(s, f), cols(), rows(), snap());
    const hero = actors.hero();
    if (hero) lights?.hero(hero.position.x, hero.position.z);
    return changed;
  }

  function teardown(): void {
    for (const p of pieces) if (p) { pieceGroup.remove(p); disposeModel(p, kit); }
    pieces = [];
    if (lights) { scene.remove(lights.group); lights.dispose(); lights = null; }
    actors.clear();
    thread.set(null, 0, 0);
  }

  function level(s: State): void {
    teardown();
    last = s;
    const { rows: nr, cols: nc } = s.level;
    models = s.terrain.map((_, i) => terrainModel(s, i));
    floor.set(models, nr, nc);
    wallSet.build(models, nr, nc);
    pieces = models.map(() => null);
    for (let i = 0; i < models.length; i++) placePiece(i);
    lights = createLights(kit, models, nr, nc, wallSet.list());
    lights.setMode(mode);
    lights.shadows(quality >= 3);
    scene.add(lights.group);
    lastPlayer = null;
    setFigures(s, { player: s.player, minotaur: s.minotaur, hazards: s.hazards.map(h => ({ kind: h.kind, at: h.at })) });
    follow = true;
    aimGoal();
    Object.assign(cur, goal);
    aimWalls = loopsDirty = shadowsDirty = true;
    mini?.paint(s, { player: s.player, minotaur: s.minotaur, hazards: s.hazards.map(h => ({ kind: h.kind, at: h.at })) }, null);
    invalidate();
    if (!loopTimer) scheduleLoops();
  }

  function show(f: { state: State; figures: Figures }, threadCells: readonly Cell[] | null): void {
    const s = f.state;
    if (!last || s.level !== last.level) {
      level(s);
    }
    const prev = last!;
    const changed = changedCells(prev, s);
    if (prev.relicsLeft !== s.relicsLeft) s.terrain.forEach((t, i) => { if (t === 'gate') changed.push(i); });
    let ground = false, walled = false;
    const { rows: nr, cols: nc } = s.level;
    const near = new Set<number>();
    for (const i of changed) {
      const md = terrainModel(s, i), was = models[i]!;
      if (md === was) continue;
      if (SURFACES[md] !== SURFACES[was]) ground = true;
      if ((md === 'wall') !== (was === 'wall')) {
        walled = true;
        // A door, a gate or the exit turns by the walls beside it.
        const r = Math.floor(i / nc), c = i % nc;
        for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]] as const) {
          if (r + dr >= 0 && r + dr < nr && c + dc >= 0 && c + dc < nc) near.add((r + dr) * nc + c + dc);
        }
      }
      models[i] = md;
      placePiece(i);
      lights?.piece(i, md);
    }
    for (const i of near) if (!changed.includes(i)) placePiece(i);
    if (ground) floor.set(models, nr, nc);
    if (walled) {
      // A pop-up wall rose: its neighbours' faces change with it.
      wallSet.build(models, nr, nc);
      wallSet.setMode(mode);
    }
    last = s;
    const moved = setFigures(s, f.figures);
    const threaded = thread.set(threadCells, nc, nr);
    if (changed.length === 0 && !moved && !threaded && s === prev) return;
    if (changed.length || moved) { aimWalls = true; shadowsDirty = true; }
    mini?.paint(s, f.figures, threadCells);
    invalidate();
    if (!loopTimer) scheduleLoops();
  }

  function walls(m: WallMode): void {
    mode = m;
    wallSet.setMode(m);
    lights?.setMode(m);
    for (const p of pieces) if (p && (p.userData as PieceInfo).tall) p.scale.y = m === 'low' ? LOW_H / WALL_H : 1;
    aimWalls = shadowsDirty = true;
    invalidate();
  }

  /** The camera under the player's hand. */
  const cam = {
    turn(deg: number, eased: boolean) {
      goal.yaw += deg;
      if (!eased) cur.yaw += deg;
      aimWalls = true;
      invalidate();
    },
    pan(dx: number, dy: number) {
      follow = false;
      const upp = viewRows(width / height) / height;
      for (const c of [cur, goal]) Object.assign(c, clampCam(panCam(c, dx, dy, upp), cols(), rows()));
      aimWalls = true;
      invalidate();
    },
    reset() {
      follow = true;
      goal.yaw = nearestYaw(DEFAULT_YAW, cur.yaw);
      invalidate();
    },
  };

  const ui = document.createElement('div');
  ui.className = 'modern-ui';
  host.overlay.append(ui);
  const controls = createControls(host.canvas, ui, host, cam);
  const mini = host.atlas && host.image
    ? createMinimap(ui, host.atlas, host.image, {
      blocked: () => host.blocked(),
      look(g) {
        host.gesture();
        follow = false;
        goal.tx = g.x;
        goal.tz = g.z;
        invalidate();
      },
    })
    : null;

  const onVisible = () => scheduleLoops();
  document.addEventListener('visibilitychange', onVisible);
  const seenIO = typeof IntersectionObserver === 'function'
    ? new IntersectionObserver(es => {
      inView = es.some(e => e.isIntersecting);
      scheduleLoops();
    })
    : null;
  seenIO?.observe(host.canvas);
  const motion = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null;
  const onMotion = () => {
    // The icons settle and the loops stop or start with the setting.
    loopsDirty = true;
    invalidate();
    scheduleLoops();
  };
  motion?.addEventListener('change', onMotion);

  resize();

  return {
    level,
    show,
    walls,
    yaw: () => cur.yaw,
    reset: cam.reset,
    resize() { resize(); invalidate(); },
    setActive(on) {
      active = on;
      ui.hidden = !on;
      if (on) invalidate();
      else {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        chained = false;
      }
      scheduleLoops();
    },
    frames: () => drawn,
    quality: () => quality,
    dispose() {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      active = false;
      scheduleLoops();
      document.removeEventListener('visibilitychange', onVisible);
      seenIO?.disconnect();
      motion?.removeEventListener('change', onMotion);
      controls.dispose();
      mini?.dispose();
      ui.remove();
      teardown();
      floor.dispose();
      wallSet.dispose();
      actors.dispose();
      thread.dispose();
      sheet?.dispose();
      paint.dispose();
      kit.dispose();
      renderer.dispose();
    },
  };
}
