/* The Island of Crete: the Modern icons test page. Renders each Dictionary entry's Modern model (src/icons-models.ts)
 * alone, lit and angled, on a transparent ground, into one sheet, and leaves it as `window.__icons` for
 * tools/modern-icons.mjs to save as fx/sprites/modern-icons.{webp,json}. Not deployed (games/*-test.* stays off the
 * site). */
import { ACESFilmicToneMapping, Box3, DirectionalLight, Group, HemisphereLight, PerspectiveCamera, Scene, Sphere, Vector3, WebGLRenderer } from 'three';
import type { Object3D } from 'three';
import { ICON_MODELS } from './icons-models.ts';
import type { IconSheet } from './icons-models.ts';
import { createKit } from './modern/scene/textures.ts';
import { createFloor } from './modern/scene/floor.ts';
import { createWalls } from './modern/scene/walls.ts';
import { TERRAIN_MODELS } from './modern/scene/terrain.ts';
import { PIECE_MODELS } from './modern/scene/pieces.ts';
import { FIGURE_MODELS } from './modern/scene/figures.ts';
import type { FigureModel, PieceModel, TerrainModel } from './modern/model-names.ts';
import type { PieceInfo } from './modern/scene/terrain.ts';

declare global { interface Window { __icons?: { sheet: IconSheet; webp: string } } }

const CELL = 128;
const COLS = 8;
const PITCH = 50 * (Math.PI / 180);
const YAW = -20 * (Math.PI / 180);
/** How much of the picture's half-width the model's box reaches. */
const FILL = 0.96;

const ids = Object.keys(ICON_MODELS);
const rows = Math.ceil(ids.length / COLS);
const sheetCanvas = document.createElement('canvas');
sheetCanvas.width = CELL * COLS;
sheetCanvas.height = CELL * rows;
const sheetCtx = sheetCanvas.getContext('2d')!;
const canvas = document.createElement('canvas');
const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(CELL, CELL, false);
renderer.setClearColor(0x000000, 0);
renderer.toneMapping = ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.4;
const kit = createKit(renderer);

function ground(model: TerrainModel): Group {
  const floor = createFloor(kit);
  floor.set([model], 1, 1);
  // The dark ground round the board would fill the picture: the icon stands alone.
  floor.group.children[0]!.visible = false;
  return floor.group;
}

/** The scene for one icon, and the part of it the picture frames: a tile whole, a piece with a little of its stone. */
function build(id: string): { obj: Object3D; focus: Object3D | null } {
  const m = ICON_MODELS[id]!;
  const g = new Group();
  if (m.kind === 'wall') {
    const walls = createWalls(kit);
    walls.build(['wall'], 1, 1);
    walls.setMode('solid');
    g.add(walls.group);
    return { obj: g, focus: null };
  }
  if (m.kind === 'tile') {
    g.add(ground(m.model));
    const o = TERRAIN_MODELS[m.model]({ kit, r: 0, c: 0, wall: () => false });
    (o.userData as PieceInfo).loop?.(0.4);
    g.add(o);
    return { obj: g, focus: null };
  }
  g.add(ground('floor'));
  const make = (PIECE_MODELS as Record<string, (k: typeof kit) => Object3D>)[m.model as PieceModel]
    ?? FIGURE_MODELS[m.model as FigureModel];
  const o = make(kit);
  (o.userData as PieceInfo).loop?.(0.4);
  g.add(o);
  return { obj: g, focus: o };
}

const icons: IconSheet['icons'] = {};
ids.forEach((id, k) => {
  const scene = new Scene();
  scene.add(new HemisphereLight(0x9a98a0, 0x2a2420, 2.4));
  const sun = new DirectionalLight(0xfff0dc, 2.4);
  sun.position.set(-3, 7, 5);
  scene.add(sun);
  const { obj, focus } = build(id);
  scene.add(obj);
  const box = new Box3().setFromObject(focus ?? obj);
  if (focus) {
    box.expandByVector(new Vector3(0.12, 0, 0.12));
    box.min.y = 0;
  }
  // A cell at most: nothing under the board (hidden, but counted) widens the frame.
  box.min.max(new Vector3(-0.5, -0.2, -0.5));
  box.max.min(new Vector3(0.5, 3, 0.5));
  const sphere = box.getBoundingSphere(new Sphere());
  const cam = new PerspectiveCamera(26, 1, 0.1, 100);
  let dist = sphere.radius / Math.sin((26 / 2) * (Math.PI / 180));
  const dir = new Vector3(Math.sin(YAW) * Math.cos(PITCH), Math.sin(PITCH), Math.cos(YAW) * Math.cos(PITCH));
  // Closer until the model's box just fills the picture.
  const corners = [0, 1, 2, 3, 4, 5, 6, 7].map(i => new Vector3(i & 1 ? box.max.x : box.min.x, i & 2 ? box.max.y : box.min.y, i & 4 ? box.max.z : box.min.z));
  for (let i = 0; i < 6; i++) {
    cam.position.copy(sphere.center).addScaledVector(dir, dist);
    cam.lookAt(sphere.center);
    cam.updateMatrixWorld();
    const reach = Math.max(...corners.map(c => { const v = c.clone().project(cam); return Math.max(Math.abs(v.x), Math.abs(v.y)); }));
    dist *= 0.35 + 0.65 * (reach / FILL);
  }
  renderer.render(scene, cam);
  const x = (k % COLS) * CELL, y = Math.floor(k / COLS) * CELL;
  sheetCtx.drawImage(canvas, x, y);
  icons[id] = { x, y };
});

window.__icons = {
  sheet: { cell: CELL, width: sheetCanvas.width, height: sheetCanvas.height, icons },
  webp: sheetCanvas.toDataURL('image/webp', 0.9),
};
document.body.append(sheetCanvas);
