/* The modern board: a three.js scene drawn on the modern canvas, only when something changes. A level builds the
 * ground, the walls, one model per cell and the light; a shown state rebuilds only the cells whose model
 * changed, and stands the pieces and figures where the state and the turn put them, with Ariadne's thread on
 * the floor, and a block that filled water floating in it. A frame is drawn when the board is told of a change, and more follow only while the camera eases,
 * a wall fades, a figure turns, a block splashes into water, the gate's bars slide, a door sinks (src/openings.ts) or the tile loops tick. The tile loops tick at 12 fps, only while one is on screen,
 * the tab is visible, the board is in view and motion is not reduced. The camera looks down through an orthographic
 * lens at the whole level, edge to edge as the classic look shows it, and holds still while Theseus moves; once the player zooms, it
 * follows Theseus until a pan or the mini map sends it elsewhere. The controls
 * (controls.ts) turn, pan and zoom it, and the mini map (minimap.ts), when the Mini map setting is on, shows what it sees. A wall that hides Theseus fades
 * in every walls mode; in Ghosted, one that hides any figure or piece fades too. The floating markers are drawn
 * over the finished picture, slid inside the view when their piece shows but they would not. */
import { ACESFilmicToneMapping, Box3, Color, DirectionalLight, Group, HemisphereLight, NoToneMapping, OrthographicCamera, PCFSoftShadowMap, SRGBColorSpace, Scene, Vector3, WebGLRenderTarget, WebGLRenderer } from 'three';
import type { Object3D } from 'three';
import type { Atlas, Figures, Pos } from '../board-plan.ts';
import { bubbles, createBubbleLayer, modernPics } from '../item-bubble.ts';
import type { BubbleLayer } from '../item-bubble.ts';
import type { IconSheet } from '../icons-models.ts';
import type { State } from '../puzzle/state.ts';
import type { Cell, Dir } from '../puzzle/tiles.ts';
import type { WallMode } from '../settings.ts';
import { REST, createOpenings, portalAt } from '../openings.ts';
import type { Motion } from '../openings.ts';
import { lightAt } from './portal-wake.ts';
import { DEFAULT_YAW, START_PITCH, cameraDistance, cellUnder, clampTilt, clampView, clampZoom, easeCam, nearestYaw, panCam, wholeZoom, zoomAbout, zoomLimits } from './camera.ts';
import { VARIANT_KEY, useOverrides, variant } from './variants.ts';
import type { Cam } from './camera.ts';
import { createControls } from './controls.ts';
import type { PaintHooks } from './controls.ts';
import { createEditMarks } from './scene/edit-marks.ts';
import { changedCells } from './diff.ts';
import { filledWater } from './float.ts';
import { ghostSubjects } from './ghost.ts';
import { MARKER_HEIGHT, MARKER_MARGIN, MARKER_WIDTH, keepInView } from './markers.ts';
import type { MarkerKind } from './markers.ts';
import { createMinimap } from './minimap.ts';
import { SURFACES, placed, terrainModel } from './model-names.ts';
import type { TerrainModel } from './model-names.ts';
import { DOWN_MS, createLadder, frameSample, measure, rate, rewarm } from './quality.ts';
import { FIGURE_MODELS, createActors } from './scene/figures.ts';
import { createFloats } from './scene/float.ts';
import { FY, cellX, cellZ, createFloor } from './scene/floor.ts';
import { createMarkers } from './scene/markers.ts';
import type { MarkerInfo } from './scene/markers.ts';
import { createLights } from './scene/light.ts';
import type { Lights } from './scene/light.ts';
import { createFinish } from './scene/finish.ts';
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
  /** The Modern icons, for the item bubble. */
  icons: IconSheet;
  /** True while a layer other than `start` is open. */
  blocked(): boolean;
  /** True while any layer, the start card too, covers the board. */
  covered(): boolean;
  /** A camera gesture happened (closes the start card). */
  gesture(): void;
  reducedMotion(): boolean;
  /** The level editor's brush: when given, one finger or the left button paints the cell under it (a ray through the
   *  pointer meets the floor) rather than moving the camera (paint-route.ts), and the cell under the mouse is framed.
   *  `first` marks the press that starts a stroke; `drop` undoes a stroke a second finger turned into a camera move. */
  painter?: { stroke(at: Cell, first: boolean): void; end(): void; drop(): void };
}

export interface ModernBoard {
  /** Builds the scene for a new level; the camera resets to follow. */
  level(s: State): void;
  /** The level editor's draft changed to `s`, the start of its level: a board of the same size rebuilds only the
   *  cells, walls, pieces and figures that changed and keeps the camera; a new size builds the level afresh. */
  edit(s: State): void;
  /** The level editor's letters on the cells the game draws as something else. */
  marks(list: readonly { r: number; c: number; mark: string }[]): void;
  /** The cell under a client point, or null off the board, for the editor's tests. */
  cellUnder(x: number, y: number): Cell | null;
  /** The cell framed under the pointer, for tests. */
  hovered(): Cell | null;
  /** Applies the state and figures locally and draws once; `done` tells it the turn's animation has ended. */
  show(f: { state: State; figures: Figures; done?: boolean }, thread: readonly Cell[] | null): void;
  walls(m: WallMode): void;
  /** The camera's yaw in degrees, for screenToGrid. */
  yaw(): number;
  /** The view's height in ground rows, for tests. */
  zoom(): number;
  /** The camera's pitch in degrees, for tests. */
  pitch(): number;
  /** Puts the camera at this heading and tilt at once: the classic board's view, on switching looks. */
  setView(yaw: number, pitch: number): void;
  /** Whether the camera follows Theseus, for tests. */
  following(): boolean;
  reset(): void;
  resize(): void;
  /** A hidden board draws nothing and stops its loops. */
  setActive(on: boolean): void;
  /** Frames drawn, for tests. */
  frames(): number;
  /** What the gate and the doors were doing when the last frame was drawn (src/openings.ts), for tests. */
  opening(): { bars: number[]; portal: number; doors: number[]; hoof: number };
  /** The render quality step (quality.ts), for tests. */
  quality(): number;
  /** The frame rate measured over the last two seconds of animation, or null before there is that much. */
  fps(): number | null;
  /** The cells a block floats in, for tests. */
  floating(): number[];
  /** The Route's next-step arrow as laid, for tests: its way and its size as a scale of the other arrows. */
  routeNext(): { dir: Dir; scale: number } | null;
  /** The floating markers as last drawn, for tests: each one's kind, its point and its piece's foot on the canvas
   *  in CSS pixels, and a cell's width there. */
  markers(): { kind: MarkerKind; at: [number, number]; foot: [number, number]; cell: number }[];
  /** Where cell (c, r)'s centre on the floor shows on the canvas, in CSS pixels, for tests. */
  cellAt(c: number, r: number): [number, number];
  /** The item bubbles showing (src/item-bubble.ts), for tests. */
  bubbles(): ReturnType<BubbleLayer['shown']>;
  splashing(): number[];
  /** The Mini map setting: shows or hides the mini map. */
  minimap(on: boolean): void;
  /** Shows the view tips by the compass now (the menu's Show View Tips, the ? key). */
  showTips(): void;
  /** Draws the level as it stands, `cols` × `rows` squares round square (r, c), seen at 75° and north up as every
   *  level opens, onto `out` (the Map button's face); works while the board is hidden. False before a level is
   *  built. */
  snapshot(out: HTMLCanvasElement, r: number, c: number, cols: number, rows: number): boolean;
  /** Draws Theseus's head and shoulders, facing the viewer, on a clear background onto `out`: the movement pad's
   *  middle in this look (fx/sprites/theseus-face-modern.png, made by tests/e2e/screenshots.ts). */
  portrait(out: HTMLCanvasElement): void;
  dispose(): void;
}

const BACKGROUND = 0x060504;
/** The top of the Minotaur's head above the floor, in cells, where his item bubble starts. */
const BUBBLE_HEAD = 1.15;
const RAD = Math.PI / 180;
const LOOP_FPS = 12;

/** How lit the exit's portal is drawn: its sheet of light while it wakes, else as it moves or as the state says. */
const drawnPortal = (s: State, m: Motion): number => (m.wake !== null ? lightAt(m.wake) : portalAt(s, m));
/** A zoom about a point this near the view's centre (a share of its width or height) keeps following Theseus. */
const ZOOM_CENTRE = 0.12;
/** How long the editor's painting pauses before a changed set of torches and lamps is lit. */
const RELIGHT_MS = 400;

export function createModernBoard(host: ModernHost): ModernBoard {
  let override: string | null = null;
  try { override = localStorage.getItem(VARIANT_KEY); } catch { override = null; }
  useOverrides(override);
  const renderer = new WebGLRenderer({ canvas: host.canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false;
  const kit = createKit(renderer);
  const scene = new Scene();
  scene.background = new Color(BACKGROUND);
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 200);
  const ndc = new Vector3();
  const right = new Vector3(), up = new Vector3();
  const finish = createFinish(renderer);
  const floor = createFloor(kit);
  const wallSet = createWalls(kit);
  const pieceGroup = new Group();
  const markers = createMarkers();
  const actors = createActors(kit, markers);
  const thread = createThread();
  const floats = createFloats(kit);
  const editMarks = createEditMarks();
  scene.add(floor.group, wallSet.group, pieceGroup, actors.group, thread.group, floats.group);

  let active = true;
  let drawn = 0;
  let raf = 0;
  let lastNow = -1e9;
  let chained = false;
  const ladder = createLadder();
  let quality = ladder.q;
  let width = 1, height = 1;
  const bubbleLayer = createBubbleLayer(l => host.overlay.prepend(l), modernPics(host.icons));
  let mode: WallMode = 'solid';
  const V = variant();
  let last: State | null = null;
  /** The figures last shown, whether the turn had ended, what the gate and doors are doing and the hoof's lean. */
  let lastFigures: Figures | null = null;
  let lastDone = true;
  const openings = createOpenings();
  let hoof = 0;
  let lastMotion: Motion = REST;
  let lastPlayer: Pos | null = null;
  let models: TerrainModel[] = [];
  /** The cells that were water when the level began and are filled now: they show water, with the block in it. */
  let filled = new Set<number>();
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

  /** The camera: where it is, where it eases to, whether its target follows Theseus, and whether the player chose
   *  its zoom (otherwise it shows the whole level, centred, whatever Theseus does). It opens at 75°, north up. */
  const cur: Cam = { yaw: DEFAULT_YAW, pitch: START_PITCH, tx: 0, tz: 0, zoom: 10 };
  const goal: Cam = { ...cur };
  /** Whether the camera's target is Theseus: a pan, an off-centre zoom or the mini map look elsewhere until his next
   *  step. */
  let follow = true;
  let zoomed = false;

  const snap = () => host.reducedMotion();
  const dpr = () => (quality === 0 ? 1 : Math.min(globalThis.devicePixelRatio || 1, 2));
  const rows = () => last?.level.rows ?? 1;
  const cols = () => last?.level.cols ?? 1;
  const aspect = () => width / height;
  const shown = (s: State, i: number): TerrainModel => (filled.has(i) ? 'water' : terrainModel(s, i));
  const limits = () => zoomLimits(aspect(), cols(), rows(), goal.pitch);

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
      // The next step's arrow breathes with the loops; it lies under Theseus, so it is on screen with him.
      if (last && (loopOnScreen() || thread.next())) loopAt(loopT + 1 / LOOP_FPS);
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
    const y = cur.yaw * RAD, p = cur.pitch * RAD, hh = cur.zoom / 2, a = aspect();
    const D = cameraDistance(cur.pitch, cur.zoom);
    camera.position.set(cur.tx + Math.sin(y) * Math.cos(p) * D, FY + Math.sin(p) * D, cur.tz + Math.cos(y) * Math.cos(p) * D);
    camera.up.set(-Math.sin(y), 0, -Math.cos(y)); // screen-up is the board's forward
    camera.lookAt(cur.tx, FY, cur.tz);
    camera.far = D + 160;
    camera.left = -hh * a;
    camera.right = hh * a;
    camera.top = hh;
    camera.bottom = -hh;
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
  }

  function aimGoal(): void {
    if (!zoomed) {
      goal.tx = goal.tz = 0;
      goal.zoom = wholeZoom(aspect(), cols(), rows(), goal.pitch, goal.yaw);
    } else {
      if (follow && lastPlayer) {
        goal.tx = cellX(lastPlayer.c, cols());
        goal.tz = cellZ(lastPlayer.r, rows());
      }
      goal.zoom = clampZoom(goal.zoom, limits());
    }
    Object.assign(goal, clampView(goal, cols(), rows(), aspect()));
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
      const q = measure(ladder, sample);
      if (q !== quality) {
        quality = q;
        applyQuality();
      }
    }
    const dt = sample !== null ? Math.min(0.1, gap / 1000) : 1 / 60;
    aimGoal();
    let busy = easeCam(cur, goal, dt, snap());
    if (busy) aimWalls = true;
    applyCamera();
    controls.setView(cur.yaw, cur.pitch);
    if (aimWalls) {
      wallSet.aim(camera, seen());
      aimWalls = false;
    }
    busy = wallSet.ease(dt, snap()) || busy;
    if (actors.ease(dt, snap())) {
      busy = true;
      shadowsDirty = true;
    }
    if (floats.frame(now)) {
      busy = true;
      shadowsDirty = true;
    }
    if (open(now)) {
      busy = true;
      shadowsDirty = true;
    }
    if (loopsDirty) {
      floor.loop(loopT);
      lights?.loop(loopT);
      actors.loop(loopT);
      floats.loop(loopT, snap());
      thread.pulse(loopT);
      for (const p of pieces) (p?.userData as PieceInfo | undefined)?.loop?.(loopT);
      loopsDirty = false;
    }
    if (shadowsDirty) {
      renderer.shadowMap.needsUpdate = true;
      shadowsDirty = false;
    }
    finish.render(scene, camera, quality >= 2);
    if (markers.group.children.length) {
      const grow = markers.place(camera, cur.pitch, loopT, snap(), height / cur.zoom);
      keepMarkers(grow);
      renderer.autoClear = false;
      renderer.render(markers.scene, camera);
      renderer.autoClear = true;
    }
    if (!editMarks.empty()) {
      renderer.autoClear = false;
      renderer.render(editMarks.scene, camera);
      renderer.autoClear = true;
    }
    placeBubbles();
    const key = `${cur.yaw} ${cur.tx} ${cur.tz} ${cur.zoom} ${width} ${height}`;
    if (key !== viewKey) {
      viewKey = key;
      mini?.view(cur, aspect());
    }
    drawn++;
    chained = busy;
    if (busy) invalidate();
  }

  /** Moves the gate's bars, the exit's light, the doors and the Minotaur at the gate as they are at `now`; true while
   *  any moves. */
  function open(now: number): boolean {
    if (!last || !lastFigures) return false;
    const m = (lastMotion = openings.at(last, lastFigures, now, snap(), lastDone));
    last.terrain.forEach((t, i) => {
      const p = pieces[i]?.userData as PieceInfo | undefined;
      if (!p?.open) return;
      if (t === 'gate') p.open(m.bars.get(i) ?? (last!.relicsLeft === 0 ? 1 : 0));
      else if (t === 'exit') {
        if (m.wake !== null && p.wake) p.wake(m.wake);
        else p.open(portalAt(last!, m));
        lights?.portal(i, drawnPortal(last!, m));
      }
      else p.open(m.doors.get(i) ?? (t === 'floor' ? 1 : 0));
    });
    if (m.hoof !== hoof) {
      hoof = m.hoof;
      setFigures(last, lastFigures);
    }
    return m.busy;
  }

  /** Slides each marker whose piece shows on screen fully inside the view, for this frame's drawing. */
  function keepMarkers(grow: number): void {
    const hh = cur.zoom / 2, hw = hh * aspect();
    right.setFromMatrixColumn(camera.matrixWorld, 0);
    up.setFromMatrixColumn(camera.matrixWorld, 1);
    for (const m of markers.group.children) {
      ndc.copy((m.userData as MarkerInfo).foot).project(camera);
      if (Math.abs(ndc.x) > 1 || Math.abs(ndc.y) > 1) continue;
      ndc.copy(m.position).project(camera);
      const [dx, dy] = keepInView(ndc.x * hw, ndc.y * hh, MARKER_WIDTH * grow, MARKER_HEIGHT * grow, hw, hh, MARKER_MARGIN);
      m.position.addScaledVector(right, dx).addScaledVector(up, dy);
    }
  }

  /** Each marker's kind, the cell its piece stands in, and where its point and its piece's foot show on the
   *  canvas, in CSS pixels; `cell` is one cell's width there. */
  function markerSpots(): { kind: MarkerKind; at: [number, number]; foot: [number, number]; cell: number }[] {
    const px = (v: Vector3): [number, number] => {
      ndc.copy(v).project(camera);
      return [((ndc.x + 1) / 2) * width, ((1 - ndc.y) / 2) * height];
    };
    return markers.group.children.map(m => {
      const info = m.userData as MarkerInfo;
      return { kind: info.kind, at: px(m.position), foot: px(info.foot), cell: height / cur.zoom };
    });
  }

  /** The item bubble by the Minotaur's head while he stands on an item, placed as this frame's camera shows it. */
  function placeBubbles(): void {
    const list = last && lastFigures ? bubbles(last, lastFigures) : [];
    bubbleLayer.place(list.map(b => {
      const x = cellX(b.c, cols()), z = cellZ(b.r, rows());
      ndc.set(x, FY + BUBBLE_HEAD, z).project(camera);
      return { bubble: b, x: ((ndc.x + 1) / 2) * width, head: ((1 - ndc.y) / 2) * height, cell: height / cur.zoom };
    }), width, height);
  }

  function cellAt(c: number, r: number): [number, number] {
    ndc.set(cellX(c, cols()), FY, cellZ(r, rows())).project(camera);
    return [((ndc.x + 1) / 2) * width, ((1 - ndc.y) / 2) * height];
  }

  const snapCam = new OrthographicCamera(-1, 1, 1, -1, 0.1, 200);
  let snapTarget: WebGLRenderTarget | null = null;
  let snapPixels = new Uint8Array(0);
  function snapshot(out: HTMLCanvasElement, r: number, c: number, sc: number, sr: number): boolean {
    if (!last) return false;
    const nc = cols(), nr = rows(), w = out.width, h = out.height;
    // The crop's middle, held so the crop stays on the level where the level is larger than it.
    const mid = (at: number, n: number, size: number) => (size <= n ? (size - 1) / 2 : Math.max((n - 1) / 2, Math.min(size - 1 - (n - 1) / 2, at)));
    const x = cellX(mid(c, sc, nc), nc), z = cellZ(mid(r, sr, nr), nr);
    const p = START_PITCH * RAD, D = 40;
    snapCam.position.set(x, FY + Math.sin(p) * D, z + Math.cos(p) * D);
    snapCam.up.set(0, 0, -1);
    snapCam.lookAt(x, FY, z);
    const hw = sc / 2, hh = (sr * Math.sin(p)) / 2;
    Object.assign(snapCam, { left: -hw, right: hw, top: hh, bottom: -hh });
    snapCam.updateProjectionMatrix();
    snapCam.updateMatrixWorld();
    if (!snapTarget || snapTarget.width !== w || snapTarget.height !== h) {
      snapTarget?.dispose();
      snapTarget = new WebGLRenderTarget(w, h);
      snapTarget.texture.colorSpace = SRGBColorSpace;
      snapPixels = new Uint8Array(w * h * 4);
    }
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    // The shadows stay as the board last drew them: the face is too small to miss them, and they cost most.
    renderer.setRenderTarget(snapTarget);
    renderer.render(scene, snapCam);
    renderer.setRenderTarget(null);
    renderer.toneMapping = NoToneMapping;
    renderer.readRenderTargetPixels(snapTarget, 0, 0, w, h, snapPixels);
    const img = new ImageData(w, h);
    // The target's rows run bottom to top.
    for (let y = 0; y < h; y++) img.data.set(snapPixels.subarray((h - 1 - y) * w * 4, (h - y) * w * 4), y * w * 4);
    out.getContext('2d')!.putImageData(img, 0, 0);
    return true;
  }

  function portrait(out: HTMLCanvasElement): void {
    const w = out.width, h = out.height;
    const stage = new Scene();
    const hero = FIGURE_MODELS.theseus(kit);
    stage.add(hero, new HemisphereLight(0xfff1dc, 0x2a1d12, 1.6));
    const key = new DirectionalLight(0xffe2b8, 2.4);
    key.position.set(1.5, 3, 4);
    stage.add(key);
    const box = new Box3().setFromObject(hero);
    // Head to waist, arms and axe in, with a little room over his head, seen a little from his right and from
    // above, as the board sees him.
    const top = box.max.y, span = Math.max(box.max.y - box.min.y, box.max.x - box.min.x) * 0.8, cx = (box.min.x + box.max.x) / 2;
    const cz = (box.min.z + box.max.z) / 2, cy = top - span * 0.46;
    const cam = new OrthographicCamera(-span / 2, span / 2, span / 2, -span / 2, 0.1, 50);
    cam.position.set(cx + 3, cy + 3, cz + 9);
    cam.lookAt(cx, cy, cz);
    cam.updateMatrixWorld();
    const target = new WebGLRenderTarget(w, h);
    target.texture.colorSpace = SRGBColorSpace;
    const pixels = new Uint8Array(w * h * 4);
    const clear = renderer.getClearAlpha();
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    renderer.setRenderTarget(target);
    renderer.clear();
    renderer.render(stage, cam);
    renderer.setRenderTarget(null);
    renderer.toneMapping = NoToneMapping;
    renderer.setClearColor(BACKGROUND, clear);
    renderer.readRenderTargetPixels(target, 0, 0, w, h, pixels);
    target.dispose();
    disposeModel(hero, kit);
    const img = new ImageData(w, h);
    for (let y = 0; y < h; y++) img.data.set(pixels.subarray((h - 1 - y) * w * 4, (h - y) * w * 4), y * w * 4);
    out.getContext('2d')!.putImageData(img, 0, 0);
  }

  function resize(): void {
    const w = host.canvas.clientWidth, h = host.canvas.clientHeight;
    if (w <= 0 || h <= 0) return;
    width = w;
    height = h;
    const r = dpr();
    renderer.setPixelRatio(r);
    renderer.setSize(w, h, false);
    finish.setSize(Math.round(w * r), Math.round(h * r));
    mini?.fit(host.overlay.clientWidth || w, host.overlay.clientHeight || h);
    if (!zoomed) {
      aimGoal();
      cur.zoom = goal.zoom;
    }
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
    // A step by Theseus brings the camera back to him, wherever the player had looked.
    if (lastPlayer && (lastPlayer.r !== f.player.r || lastPlayer.c !== f.player.c)) follow = true;
    lastPlayer = { r: f.player.r, c: f.player.c };
    const changed = actors.set(placed(s, f, hoof), cols(), rows(), snap());
    const hero = actors.hero();
    if (hero) lights?.hero(hero.position.x, hero.position.z);
    return changed;
  }

  function teardown(): void {
    for (const p of pieces) if (p) { pieceGroup.remove(p); disposeModel(p, kit); }
    pieces = [];
    if (lights) { scene.remove(lights.group); lights.dispose(); lights = null; }
    actors.clear();
    floats.clear();
    thread.set(null, 0, 0);
  }

  function level(s: State): void {
    teardown();
    last = s;
    const { rows: nr, cols: nc } = s.level;
    filled = new Set(filledWater(s.level.terrain, s.terrain));
    models = s.terrain.map((_, i) => shown(s, i));
    floats.set([...filled], nc, nr, false);
    floor.set(models, nr, nc);
    wallSet.build(models, nr, nc);
    pieces = models.map(() => null);
    for (let i = 0; i < models.length; i++) placePiece(i);
    lights = createLights(kit, models, nr, nc, wallSet.list());
    lights.setMode(mode);
    lights.shadows(quality >= 3);
    scene.add(lights.group);
    rewarm(ladder);
    lastPlayer = null;
    setFigures(s, { player: s.player, minotaur: s.minotaur, hazards: s.hazards.map(h => ({ kind: h.kind, at: h.at })) });
    // Every level opens at 75° and north up, on the whole level.
    follow = true;
    zoomed = false;
    goal.yaw = DEFAULT_YAW;
    goal.pitch = START_PITCH;
    aimGoal();
    Object.assign(cur, goal);
    aimWalls = loopsDirty = shadowsDirty = true;
    mini?.paint(s, { player: s.player, minotaur: s.minotaur, hazards: s.hazards.map(h => ({ kind: h.kind, at: h.at })) }, null);
    invalidate();
    if (!loopTimer) scheduleLoops();
  }

  function show(f: { state: State; figures: Figures; done?: boolean }, threadCells: readonly Cell[] | null, sameLevel = false): void {
    const s = f.state;
    lastFigures = f.figures;
    lastDone = f.done ?? true;
    if (!last || (s.level !== last.level && !sameLevel)) {
      level(s);
    }
    const prev = last!;
    const changed = changedCells(prev, s);
    if (prev.relicsLeft !== s.relicsLeft) s.terrain.forEach((t, i) => { if (t === 'gate' || t === 'exit') changed.push(i); });
    let ground = false, walled = false;
    const { rows: nr, cols: nc } = s.level;
    const near = new Set<number>();
    const nowFilled = filledWater(s.level.terrain, s.terrain);
    filled = new Set(nowFilled);
    for (const i of changed) {
      const md = shown(s, i), was = models[i]!;
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
    // A block that went in during play splashes; one that is simply there (reduced motion) floats at once.
    const floated = floats.set(nowFilled, nc, nr, !snap());
    if (changed.length === 0 && !moved && !threaded && !floated && s === prev) return;
    if (changed.length || moved || floated) { aimWalls = true; shadowsDirty = true; }
    mini?.paint(s, f.figures, threadCells);
    invalidate();
    if (!loopTimer) scheduleLoops();
  }

  /** The lamps a level's lights were built with; another set rebuilds them once the editing pauses. */
  const lampKey = (ms: readonly TerrainModel[]): string => ms.map((m, i) => (m === 'wall' || m.startsWith('door') || m.startsWith('gate') || m === 'exit' || m === 'fire' ? `${i}${m}` : '')).join(',');
  let lamps = '';
  let relight: ReturnType<typeof setTimeout> | 0 = 0;
  function edit(s: State): void {
    const resting = { player: s.player, minotaur: s.minotaur, hazards: s.hazards.map(h => ({ kind: h.kind, at: h.at })) };
    if (!last || last.level.rows !== s.level.rows || last.level.cols !== s.level.cols) {
      lastFigures = resting;
      lastDone = true;
      level(s);
      lamps = lampKey(models);
      hover(null);
      return;
    }
    show({ state: s, figures: resting, done: true }, null, true);
    if (lampKey(models) === lamps) return;
    // A level's lights are fixed when it is built (adding one recompiles every material): new torches and lamps
    // come once the painting pauses.
    if (relight) clearTimeout(relight);
    relight = setTimeout(() => {
      relight = 0;
      if (!last || !lights) return;
      scene.remove(lights.group);
      lights.dispose();
      lights = createLights(kit, models, rows(), cols(), wallSet.list());
      lights.setMode(mode);
      lights.shadows(quality >= 3);
      const hero = actors.hero();
      if (hero) lights.hero(hero.position.x, hero.position.z);
      scene.add(lights.group);
      lamps = lampKey(models);
      shadowsDirty = loopsDirty = true;
      invalidate();
    }, RELIGHT_MS);
  }

  /** The cell under a client point. */
  function cellAtPoint(x: number, y: number): Cell | null {
    if (!last) return null;
    const r = host.canvas.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return null;
    return cellUnder(cur, aspect(), (x - r.left) / r.width - 0.5, 0.5 - (y - r.top) / r.height, cols(), rows());
  }
  let hovered: Cell | null = null;
  function hover(at: Cell | null): void {
    if (at === hovered || (at && hovered && at.r === hovered.r && at.c === hovered.c)) return;
    hovered = at;
    editMarks.hover(at, cols(), rows());
    invalidate();
  }
  const painter = host.painter;
  const paintHooks: PaintHooks | undefined = painter && {
    stroke(x, y, first) {
      const at = cellAtPoint(x, y);
      hover(at);
      if (at) painter.stroke(at, first);
    },
    end() { painter.end(); },
    drop() { hover(null); painter.drop(); },
    hover(p) { hover(p ? cellAtPoint(p.x, p.y) : null); },
  };

  function walls(chosen: WallMode): void {
    const m = V.cutaway && chosen === 'solid' ? 'ghosted' : chosen;
    mode = m;
    wallSet.setMode(m);
    lights?.setMode(m);
    for (const p of pieces) if (p && (p.userData as PieceInfo).tall) p.scale.y = m === 'low' ? LOW_H / WALL_H : 1;
    aimWalls = shadowsDirty = true;
    invalidate();
  }

  /** Back to the opening view: 75°, north up, the whole level round Theseus; eased unless motion is reduced. */
  function home(): void {
    follow = true;
    zoomed = false;
    goal.yaw = nearestYaw(DEFAULT_YAW, cur.yaw);
    goal.pitch = START_PITCH;
    if (snap()) {
      cur.yaw = goal.yaw;
      cur.pitch = goal.pitch;
    }
  }

  /** The camera under the player's hand. */
  const cam = {
    turn(deg: number, eased: boolean) {
      goal.yaw += deg;
      if (!eased || snap()) cur.yaw += deg;
      aimWalls = true;
      invalidate();
    },
    pan(dx: number, dy: number) {
      follow = false;
      const upp = cur.zoom / height;
      for (const c of [cur, goal]) Object.assign(c, clampView(panCam(c, dx, dy, upp), cols(), rows(), aspect()));
      aimWalls = true;
      invalidate();
    },
    zoom(factor: number, fx: number, fy: number, eased: boolean) {
      zoomed = true;
      const lim = limits();
      if (eased) goal.zoom = clampZoom(goal.zoom * factor, lim);
      else {
        // Toward the pointer, unless it is near the centre: then the view keeps following Theseus.
        const off = Math.abs(fx) > ZOOM_CENTRE || Math.abs(fy) > ZOOM_CENTRE;
        if (off) follow = false;
        const u = off ? fx * aspect() : 0, v = off ? fy : 0;
        for (const c of [cur, goal]) Object.assign(c, clampView(zoomAbout(c, factor, u, v, lim), cols(), rows(), aspect()));
      }
      aimWalls = true;
      invalidate();
    },
    tilt(deg: number, eased: boolean) {
      goal.pitch = clampTilt(goal.pitch + deg);
      if (!eased || snap()) cur.pitch = goal.pitch;
      aimWalls = true;
      invalidate();
    },
    reset() {
      home();
      aimWalls = true;
      invalidate();
    },
  };

  const ui = document.createElement('div');
  ui.className = 'modern-ui';
  host.overlay.append(ui);
  const controls = createControls(host.canvas, ui, host, cam, paintHooks);

  // The editor's board has no mini map: painting it on every stroke would cost more than the stroke.
  const mini = !host.painter && host.atlas && host.image
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

  const onVisible = () => {
    rewarm(ladder);
    scheduleLoops();
  };
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
    // The markers settle and the loops stop or start with the setting.
    loopsDirty = true;
    invalidate();
    scheduleLoops();
  };
  motion?.addEventListener('change', onMotion);

  resize();

  return {
    level,
    show: (f, t) => show(f, t),
    edit,
    marks(list) {
      editMarks.marks(list, cols(), rows());
      invalidate();
    },
    cellUnder: cellAtPoint,
    hovered: () => hovered,
    walls,
    yaw: () => cur.yaw,
    zoom: () => cur.zoom,
    pitch: () => cur.pitch,
    setView(yaw: number, pitch: number) {
      cam.turn(yaw - goal.yaw, false);
      cam.tilt(pitch - goal.pitch, false);
      aimGoal();
      Object.assign(cur, goal);
    },
    following: () => follow,
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
    opening: () => ({
      bars: [...lastMotion.bars.values()], portal: last ? drawnPortal(last, lastMotion) : 0,
      doors: [...lastMotion.doors.values()], hoof: lastMotion.hoof,
    }),
    quality: () => quality,
    fps: () => rate(ladder.gaps, DOWN_MS),
    floating: () => floats.cells(),
    routeNext: () => thread.next(),
    markers: markerSpots,
    cellAt,
    bubbles: () => bubbleLayer.shown(),
    splashing: () => floats.splashing(),
    minimap(on) {
      mini?.show(on);
    },
    showTips: () => controls.showTips(),
    snapshot,
    portrait,
    dispose() {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      if (relight) clearTimeout(relight);
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
      floats.dispose();
      thread.dispose();
      markers.dispose();
      editMarks.dispose();
      snapTarget?.dispose();
      finish.dispose();
      kit.dispose();
      renderer.dispose();
    },
  };
}
