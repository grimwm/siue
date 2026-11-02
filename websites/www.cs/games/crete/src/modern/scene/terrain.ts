/* The Island of Crete, modern look: the terrain models, one per terrain sprite, each in the colour and shape of
 * its Classic sprite. A model stands at its cell's centre on the ground floor.ts lays; floor, wall, water, ice,
 * force floors, dirt and gravel are all ground (or walls.ts) and add nothing here. A model's static parts are
 * merged into one mesh per material; flames and discs that loop stay apart, moved by `userData.loop(t)`. */
import {
  BoxGeometry, CanvasTexture, ConeGeometry, CylinderGeometry, ExtrudeGeometry, Group, LatheGeometry, Mesh,
  MeshBasicMaterial, PlaneGeometry, SRGBColorSpace, Shape, SphereGeometry, TorusGeometry, Vector2,
} from 'three';
import type { BufferGeometry, Material, Object3D } from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import type { TerrainModel } from '../model-names.ts';
import { FY } from './floor.ts';
import { WALL_H } from './walls.ts';
import { flameMat, rng } from './textures.ts';
import type { Kit } from './textures.ts';
import { GATE_BARS } from '../../openings.ts';

export interface ModelCtx {
  kit: Kit;
  r: number;
  c: number;
  /** True where the cell shows a wall, or lies outside the board. */
  wall(r: number, c: number): boolean;
}

/** What a model tells the board about itself, kept in `userData`. */
export interface PieceInfo {
  /** Half its footprint and its height, for the ghosted walls. */
  half: number;
  h: number;
  /** How far its top leans back from its foot toward -z (up the board), when it leans toward the camera. */
  back?: number;
  /** It rises to the walls' height and sinks with them when they are low. */
  tall?: boolean;
  /** Its flames or discs at loop time `t` seconds. */
  loop?: (t: number) => void;
  /** How far it has opened, 0 shut to 1 open (src/openings.ts): the Daedalus Gate's bars across its pit, a door
   *  sunk into its floor. */
  open?: (p: number) => void;
}

export const at = <T extends Object3D>(o: T, x: number, y: number, z: number): T => (o.position.set(x, y, z), o);
const cylG = (rt: number, rb: number, h: number, seg = 14) => new CylinderGeometry(rt, rb, h, seg);
export const cyl = (rt: number, rb: number, h: number, mat: Material, seg = 14) => new Mesh(cylG(rt, rb, h, seg), mat);
export const box = (x: number, y: number, z: number, mat: Material) => new Mesh(new BoxGeometry(x, y, z), mat);
/** `o` turned a quarter about x, so a cylinder or ring lies along z or flat. */
export const flat = <T extends Object3D>(o: T): T => (o.rotation.x = Math.PI / 2, o);

/** Merges a group's meshes into one mesh per material, casting and taking shadows. */
function bake(g: Group): Group {
  g.updateMatrixWorld(true);
  const byMat = new Map<Material, BufferGeometry[]>();
  g.traverse(o => {
    if (!(o instanceof Mesh)) return;
    let geo = (o.geometry as BufferGeometry).clone().applyMatrix4(o.matrixWorld);
    if (geo.index) geo = geo.toNonIndexed();
    for (const k of Object.keys(geo.attributes)) if (k !== 'position' && k !== 'normal' && k !== 'uv') geo.deleteAttribute(k);
    const mat = o.material as Material;
    byMat.set(mat, [...(byMat.get(mat) ?? []), geo]);
    (o.geometry as BufferGeometry).dispose();
  });
  const out = new Group();
  for (const [mat, geos] of byMat) {
    const m = new Mesh(mergeGeometries(geos), mat);
    geos.forEach(x => x.dispose());
    m.castShadow = m.receiveShadow = true;
    out.add(m);
  }
  return out;
}

/** Adds a dark rim round every baked surface of `obj` (not its live parts): the same geometry, drawn from behind
 *  and pushed out along its normals (textures.ts `outline`). */
export function outlined(kit: Kit, obj: Group): Group {
  const shells: Mesh[] = [];
  for (const c of obj.children) if (c instanceof Mesh && !c.userData.live) shells.push(new Mesh(c.geometry, kit.m.outline));
  obj.add(...shells);
  return obj;
}

export function piece(g: Group, info: PieceInfo, live: Object3D[] = []): Group {
  const out = bake(g);
  if (live.length) out.add(...live);
  out.userData = info;
  return out;
}

const empty = (): Group => Object.assign(new Group(), { userData: { half: 0, h: 0 } satisfies PieceInfo });

/** Which way a slab in a doorway runs: along z when its wall neighbours lie north and south. */
const spansZ = (x: ModelCtx) =>
  (x.wall(x.r - 1, x.c) || x.wall(x.r + 1, x.c)) && !(x.wall(x.r, x.c - 1) && x.wall(x.r, x.c + 1));

/** A door: a thick oak slab banded in its key's colour, its top edge painted too, so it reads from any side,
 *  standing in a dark slot across the way with a sill of its colour at its foot. Opening, it sinks straight down
 *  through the slot and leaves the sill; `open` sets how far down it is. Built with the way through along x. */
function door(x: ModelCtx, color: 'red' | 'blue' | 'yellow' | 'green', open: boolean): Group {
  const { m } = x.kit;
  const accent = m.keyColor[color];
  const g = new Group();
  const H = 1.1, T = 0.26;
  g.add(at(box(1, 0.008, T + 0.08, m.dark), 0, FY + 0.003, 0));
  g.add(at(box(0.98, 0.012, T, accent), 0, FY + 0.007, 0));
  const d = new Group();
  d.add(at(box(1, H, T, m.wood), 0, H / 2, 0));
  d.add(at(box(1, 0.06, T + 0.02, m.iron), 0, 0.34, 0));
  d.add(at(box(1, 0.16, T + 0.02, accent), 0, 0.8, 0));
  d.add(at(box(1, 0.1, T + 0.02, accent), 0, 0.06, 0));
  d.add(at(box(1, 0.04, T + 0.02, accent), 0, H + 0.02, 0));
  d.add(at(box(0.16, 0.18, T + 0.04, m.iron), 0.24, 0.55, 0));
  d.add(flat(at(cyl(0.05, 0.05, T + 0.08, accent, 12), 0.24, 0.55, 0)));
  d.traverse(o => { if (o instanceof Mesh) o.castShadow = o.receiveShadow = true; });
  const sink = (p: number) => {
    // Below the floor the flagstones hide it.
    d.position.y = -(H + 0.14) * p;
    d.visible = p < 1;
  };
  sink(open ? 1 : 0);
  const turn = turned(x, [d]);
  if (spansZ(x)) g.rotation.y = Math.PI / 2;
  return piece(g, { half: 0.4, h: open ? 0.02 : H, tall: !open, open: sink }, turn);
}

/** The pit's picture: its far wall lit, the near ones in shade, a floor of rubble at the bottom. */
let pitTex: CanvasTexture | null = null;
function pitTexture(): CanvasTexture {
  if (pitTex) return pitTex;
  const n = 128, cv = document.createElement('canvas');
  cv.width = cv.height = n;
  const g = cv.getContext('2d')!;
  g.fillStyle = '#050302';
  g.fillRect(0, 0, n, n);
  const wall = (x0: number, y0: number, x1: number, y1: number, gx0: number, gy0: number, gx1: number, gy1: number, top: string) => {
    const gr = g.createLinearGradient(gx0, gy0, gx1, gy1);
    gr.addColorStop(0, top);
    gr.addColorStop(1, '#0a0604');
    g.fillStyle = gr;
    g.fillRect(x0, y0, x1 - x0, y1 - y0);
  };
  const w = n * 0.2;
  wall(0, 0, n, w, 0, 0, 0, w, '#6a5236');
  wall(0, n - w, n, n, 0, n, 0, n - w, '#2a1e14');
  wall(0, 0, w, n, 0, 0, w, 0, '#4a3826');
  wall(n - w, 0, n, n, n, 0, n - w, 0, '#4a3826');
  g.fillStyle = '#1e160f';
  g.fillRect(w, w, n - 2 * w, n - 2 * w);
  const r = rng(7);
  for (let i = 0; i < 14; i++) {
    g.fillStyle = ['#3a2c1e', '#2c2116', '#4a3a28'][i % 3]!;
    g.beginPath();
    g.ellipse(w + r() * (n - 2 * w), w + r() * (n - 2 * w), 3 + r() * 5, 2 + r() * 4, r() * 3, 0, Math.PI * 2);
    g.fill();
  }
  pitTex = new CanvasTexture(cv);
  pitTex.colorSpace = SRGBColorSpace;
  return pitTex;
}

/** The Daedalus Gate (src/openings.ts): a pit across the way between two stone kerbs, under GATE_BARS bronze bars
 *  that slide out of the walls on both sides and meet over it, a grid a man crosses and hooves cannot. Shut, the
 *  bars are in the walls and the pit is bare; `open` sets how far across they are. Built with the way through
 *  along z. */
function gate(x: ModelCtx, open: boolean): Group {
  const { m } = x.kit;
  const g = new Group();
  const span = 0.7, rad = 0.06;
  const pit = new Mesh(new PlaneGeometry(1, span), new MeshBasicMaterial({ map: pitTexture() }));
  pit.rotation.x = -Math.PI / 2;
  g.add(at(pit, 0, FY + 0.004, 0));
  for (const sz of [-1, 1]) {
    g.add(at(box(1, 0.07, 0.15, m.paleStone), 0, FY + 0.035, sz * (span / 2 + 0.075)));
    g.add(at(box(1, 0.012, 0.02, m.dark), 0, FY + 0.072, sz * (span / 2 + 0.005)));
  }
  // Each bar is two halves, one from each wall, that grow out of it to meet in the middle.
  const bars: Mesh[] = [];
  for (let i = 0; i < GATE_BARS; i++) {
    const z = -span / 2 + (span * (i + 0.5)) / GATE_BARS;
    for (const side of [-1, 1]) {
      const bar = at(cyl(rad, rad, 0.5, m.bronze, 12), 0, FY + 0.06, z);
      bar.rotation.z = Math.PI / 2;
      bar.castShadow = bar.receiveShadow = true;
      bar.userData.side = side;
      bars.push(bar);
    }
  }
  const across = (p: number) => {
    for (const bar of bars) {
      bar.visible = p > 0.01;
      bar.scale.y = Math.max(0.01, p);
      bar.position.x = (bar.userData.side as number) * (0.5 - 0.25 * p);
    }
  };
  across(open ? 1 : 0);
  if (spansZ(x)) g.rotation.y = Math.PI / 2;
  return piece(g, { half: 0.5, h: 0.15, open: across }, turned(x, bars));
}

/** Live parts, turned as the baked model is. */
function turned(x: ModelCtx, live: Object3D[]): Object3D[] {
  const lg = new Group();
  lg.add(...live);
  if (spansZ(x)) lg.rotation.y = Math.PI / 2;
  return [lg];
}

/** The exit: a stair going down from its open side into a lit pit, under a lintel. */
function exit(x: ModelCtx): Group {
  const { m } = x.kit;
  const g = new Group();
  for (let i = 0; i < 3; i++) g.add(at(box(0.25, 0.08, 0.9, m.stone), -0.375 + i * 0.25, FY - 0.04 - i * 0.12, 0));
  for (const sz of [-1, 1]) g.add(at(box(1, 0.7, 0.05, m.stone), 0, FY - 0.35, sz * 0.475));
  g.add(at(box(0.05, 0.7, 0.9, m.stone), 0.475, FY - 0.35, 0));
  const glow = at(new Mesh(new PlaneGeometry(0.25, 0.9), m.glow), 0.375, -0.32, 0);
  glow.rotation.x = -Math.PI / 2;
  g.add(glow);
  g.add(at(box(0.3, 0.16, 1.1, m.top), 0, WALL_H - 0.08, 0));
  for (const sz of [-1, 1]) g.add(at(box(0.16, WALL_H - 0.16, 0.12, m.darkWood), 0, (WALL_H - 0.16) / 2, sz * 0.5));
  // The stair goes down away from the first open neighbour.
  const open = ([[0, -1], [-1, 0], [1, 0], [0, 1]] as const).find(([dr, dc]) => !x.wall(x.r + dr, x.c + dc));
  const [dr, dc] = open ?? [0, -1];
  g.rotation.y = Math.atan2(dr, -dc);
  return piece(g, { half: 0.4, h: 0.3, tall: true });
}

function toggle(x: ModelCtx, closed: boolean): Group {
  const { m } = x.kit;
  const g = new Group();
  if (closed) {
    // A cage of upright wooden bars on a frame, as tall as a man's chest.
    const H = 0.72;
    g.add(at(box(0.8, H - 0.04, 0.8, m.dark), 0, FY + H / 2, 0));
    for (const y of [FY + 0.04, FY + H - 0.04]) g.add(at(box(0.92, 0.08, 0.92, m.darkWood), 0, y, 0));
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(at(box(0.1, H, 0.1, m.darkWood), sx * 0.41, FY + H / 2, sz * 0.41));
    for (let i = 0; i < 4; i++) {
      const u = -0.27 + i * 0.18;
      for (const s of [-1, 1]) {
        g.add(at(box(0.07, H - 0.12, 0.05, m.wood), u, FY + H / 2, s * 0.43));
        g.add(at(box(0.05, H - 0.12, 0.07, m.wood), s * 0.43, FY + H / 2, u));
      }
      g.add(at(box(0.07, 0.04, 0.8, m.wood), u, FY + H - 0.01, 0));
    }
    return piece(g, { half: 0.46, h: H + 0.1 });
  }
  // Open, the bars lie sunk in a grate in the floor.
  g.add(at(box(0.84, 0.02, 0.84, m.dark), 0, FY + 0.005, 0));
  for (const s of [-1, 1]) {
    g.add(at(box(0.88, 0.04, 0.07, m.darkWood), 0, FY + 0.02, s * 0.42));
    g.add(at(box(0.07, 0.04, 0.88, m.darkWood), s * 0.42, FY + 0.02, 0));
  }
  for (let i = 0; i < 4; i++) g.add(at(box(0.08, 0.035, 0.8, m.wood), -0.27 + i * 0.18, FY + 0.018, 0));
  return piece(g, { half: 0.42, h: 0.06 });
}

/** A round plate in a bronze rim: the buttons, the snare, the teleport and the thief. */
function plate(rimMat: Material, faceMat: Material, r = 0.3): Group {
  const g = new Group();
  g.add(at(cyl(r, r + 0.03, 0.05, rimMat, 28), 0, FY + 0.025, 0));
  g.add(at(cyl(r - 0.05, r - 0.04, 0.03, faceMat, 28), 0, FY + 0.06, 0));
  return g;
}

function button(x: ModelCtx): Group {
  const { m } = x.kit;
  const g = new Group();
  g.add(at(cyl(0.28, 0.31, 0.05, m.iron, 24), 0, FY + 0.025, 0));
  const dome = at(new Mesh(new SphereGeometry(0.21, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), m.brownButton), 0, FY + 0.04, 0);
  dome.scale.y = 0.55;
  g.add(dome);
  return piece(g, { half: 0.3, h: 0.16 });
}

function ringButton(x: ModelCtx, face: Material): Group {
  const { m } = x.kit;
  const g = plate(m.bronze, face);
  g.add(flat(at(new Mesh(new TorusGeometry(0.15, 0.018, 8, 32), m.cream), 0, FY + 0.077, 0)));
  g.add(at(cyl(0.05, 0.055, 0.04, m.bronze, 16), 0, FY + 0.08, 0));
  return piece(g, { half: 0.3, h: 0.12 });
}

function trap(x: ModelCtx): Group {
  const { m } = x.kit;
  const g = plate(m.bronze, m.dark, 0.34);
  // The snare's jaws: a ring of iron teeth round a pressure plate.
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    g.add(at(new Mesh(new ConeGeometry(0.028, 0.12, 6), m.iron), Math.cos(a) * 0.22, FY + 0.13, Math.sin(a) * 0.22));
  }
  g.add(at(cyl(0.1, 0.11, 0.04, m.bronze, 16), 0, FY + 0.09, 0));
  return piece(g, { half: 0.34, h: 0.2 });
}

function safe(x: ModelCtx): Group {
  const { m } = x.kit;
  const g = new Group();
  g.add(at(cyl(0.07, 0.08, 0.03, m.gold, 18), 0, FY + 0.015, 0));
  const out = piece(g, { half: 0.4, h: 0.05 });
  const mark = new Mesh(new PlaneGeometry(0.9, 0.9), m.wreath);
  mark.rotation.x = -Math.PI / 2;
  mark.position.y = FY + 0.003;
  mark.receiveShadow = true;
  out.add(mark);
  return out;
}

function popup(x: ModelCtx): Group {
  const { m } = x.kit;
  const g = new Group();
  g.add(at(box(0.78, 0.04, 0.78, m.paleStone), 0, FY + 0.02, 0));
  for (const s of [-1, 1]) {
    g.add(at(box(0.9, 0.09, 0.07, m.darkWood), 0, FY + 0.045, s * 0.42));
    g.add(at(box(0.07, 0.09, 0.9, m.darkWood), s * 0.42, FY + 0.045, 0));
  }
  return piece(g, { half: 0.45, h: 0.1 });
}

function teleport(x: ModelCtx): Group {
  const { m } = x.kit;
  const g = new Group();
  g.add(at(cyl(0.36, 0.38, 0.06, m.bronze, 32), 0, FY + 0.03, 0));
  const out = piece(g, { half: 0.36, h: 0.1 });
  const disc = at(cyl(0.3, 0.3, 0.02, m.swirl, 32), 0, FY + 0.065, 0);
  disc.receiveShadow = true;
  out.add(disc);
  (out.userData as PieceInfo).loop = t => { disc.rotation.y = -t * 1.6; };
  return out;
}

function thief(x: ModelCtx): Group {
  const { m } = x.kit;
  const g = new Group();
  g.add(at(cyl(0.36, 0.38, 0.06, m.gold, 32), 0, FY + 0.03, 0));
  const face = at(cyl(0.3, 0.3, 0.02, m.hand, 32), 0, FY + 0.065, 0);
  face.rotation.y = Math.PI;
  g.add(face);
  return piece(g, { half: 0.36, h: 0.1 });
}

function bomb(x: ModelCtx): Group {
  const { m } = x.kit;
  const g = new Group();
  const profile = [[0, 0], [0.12, 0], [0.2, 0.08], [0.22, 0.2], [0.18, 0.32], [0.08, 0.4], [0.07, 0.46], [0.09, 0.48], [0, 0.48]]
    .map(([a, b]) => new Vector2(a, b));
  g.add(at(new Mesh(new LatheGeometry(profile, 24), m.clay), 0, FY, 0));
  g.add(flat(at(new Mesh(new TorusGeometry(0.205, 0.012, 6, 28), m.dark), 0, FY + 0.22, 0)));
  const fuse = at(cyl(0.012, 0.012, 0.12, m.dark, 6), 0.02, FY + 0.53, 0);
  fuse.rotation.z = -0.3;
  g.add(fuse);
  const flame = at(new Mesh(new ConeGeometry(0.035, 0.1, 8), flameMat(0xffc060)), 0.04, FY + 0.62, 0);
  const out = piece(g, { half: 0.22, h: 0.6 }, [flame]);
  (out.userData as PieceInfo).loop = t => flame.scale.set(1, 1 + 0.2 * Math.sin(t * 9), 1);
  return out;
}

/** The clone machine: a bronze-studded crate with a dark top and a gold arrow showing which way it sends. */
function clone(x: ModelCtx, turn: number): Group {
  const { m } = x.kit;
  const g = new Group();
  g.add(at(new Mesh(new RoundedBoxGeometry(0.86, 0.36, 0.86, 2, 0.03), m.darkWood), 0, FY + 0.18, 0));
  g.add(at(box(0.64, 0.02, 0.64, m.dark), 0, FY + 0.365, 0));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(at(cyl(0.03, 0.03, 0.02, m.gold, 10), sx * 0.37, FY + 0.365, sz * 0.37));
  const sh = new Shape();
  sh.moveTo(0, 0.24);
  sh.lineTo(0.17, 0.04);
  sh.lineTo(0.07, 0.04);
  sh.lineTo(0.07, -0.22);
  sh.lineTo(-0.07, -0.22);
  sh.lineTo(-0.07, 0.04);
  sh.lineTo(-0.17, 0.04);
  sh.closePath();
  const arrow = new Mesh(new ExtrudeGeometry(sh, { depth: 0.025, bevelEnabled: false }), m.gold);
  arrow.rotation.x = -Math.PI / 2;
  arrow.position.y = FY + 0.37;
  const holder = new Group();
  holder.add(arrow);
  holder.rotation.y = turn;
  g.add(holder);
  return piece(g, { half: 0.43, h: 0.4 });
}

function fire(x: ModelCtx): Group {
  const g = new Group();
  const R = rng(x.r * 31 + x.c);
  const flames: Mesh[] = [];
  for (let i = 0; i < 5; i++) {
    const h = 0.3 + R() * 0.28;
    const f = at(new Mesh(new ConeGeometry(0.08 + R() * 0.05, h, 7), flameMat(i % 2 ? 0xff6a20 : 0xffb050, 0.8)),
      (R() - 0.5) * 0.55, FY + h / 2, (R() - 0.5) * 0.55);
    flames.push(f);
    g.add(f);
  }
  const ph = R() * 6.28;
  g.userData = {
    half: 0.4, h: 0.5,
    loop: t => flames.forEach((f, i) => f.scale.set(1, 1 + 0.12 * Math.sin(t * (6 + i) + ph + i), 1)),
  } satisfies PieceInfo;
  return g;
}

export const TERRAIN_MODELS: Record<TerrainModel, (x: ModelCtx) => Object3D> = {
  floor: empty, wall: empty, water: empty, ice: empty, dirt: empty, gravel: empty,
  'force-up': empty, 'force-down': empty, 'force-left': empty, 'force-right': empty,
  exit, fire,
  'gate-closed': x => gate(x, false),
  'gate-open': x => gate(x, true),
  safe, button, trap, popup, teleport, thief, bomb,
  'toggle-open': x => toggle(x, false),
  'toggle-closed': x => toggle(x, true),
  'door-red': x => door(x, 'red', false),
  'door-blue': x => door(x, 'blue', false),
  'door-yellow': x => door(x, 'yellow', false),
  'door-green': x => door(x, 'green', false),
  'door-red-sill': x => door(x, 'red', true),
  'door-blue-sill': x => door(x, 'blue', true),
  'door-yellow-sill': x => door(x, 'yellow', true),
  'door-green-sill': x => door(x, 'green', true),
  'button-brown': x => ringButton(x, x.kit.m.brownButton),
  'button-red': x => ringButton(x, x.kit.m.redButton),
  'clone-up': x => clone(x, 0),
  'clone-left': x => clone(x, Math.PI / 2),
  'clone-down': x => clone(x, Math.PI),
  'clone-right': x => clone(x, -Math.PI / 2),
};

/** Frees a model's own geometry and materials; the kit's shared ones stay. */
export function disposeModel(o: Object3D, kit: Kit): void {
  o.traverse(n => {
    if (!(n instanceof Mesh)) return;
    (n.geometry as BufferGeometry).dispose();
    const mats = Array.isArray(n.material) ? n.material : [n.material];
    for (const mat of mats as Material[]) if (!kit.keeps.has(mat)) mat.dispose();
  });
}
