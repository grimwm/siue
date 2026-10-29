/* The Island of Crete, modern look: the walls. Each wall cell is one mesh of its outer faces only (its top and
 * the sides that face no other wall), with its own pair of materials so it can fade on its own. A hidden face
 * toward a neighbouring wall shows only while that neighbour is the more see-through, so overlapping glass
 * never shows inner seams. Ghosted walls fade by how much of a figure or piece they hide from the camera,
 * sampled with rays; low walls stand at a third of their height. */
import { BufferGeometry, Float32BufferAttribute, Group, Mesh, Vector3 } from 'three';
import type { Camera, MeshStandardMaterial } from 'three';
import { easeOpacity, ghostTarget } from '../ghost.ts';
import type { WallMode } from '../../settings.ts';
import type { TerrainModel } from '../model-names.ts';
import { FY, cellX, cellZ } from './floor.ts';
import type { Kit } from './textures.ts';

export const WALL_H = 1.25;
export const LOW_H = 0.38;

type V3 = readonly [number, number, number];
interface Face { v: readonly V3[]; n: V3; uvs: readonly (readonly [number, number])[]; mat: number }
type Side = 'n' | 's' | 'w' | 'e';

export const SIDES: Record<Side, { d: readonly [number, number]; v: readonly V3[]; n: V3; u: (p: V3) => number }> = {
  n: { d: [-1, 0], v: [[0.5, 0, -0.5], [-0.5, 0, -0.5], [-0.5, 1, -0.5], [0.5, 1, -0.5]], n: [0, 0, -1], u: p => -p[0] },
  s: { d: [1, 0], v: [[-0.5, 0, 0.5], [0.5, 0, 0.5], [0.5, 1, 0.5], [-0.5, 1, 0.5]], n: [0, 0, 1], u: p => p[0] },
  w: { d: [0, -1], v: [[-0.5, 0, -0.5], [-0.5, 0, 0.5], [-0.5, 1, 0.5], [-0.5, 1, -0.5]], n: [-1, 0, 0], u: p => p[2] },
  e: { d: [0, 1], v: [[0.5, 0, 0.5], [0.5, 0, -0.5], [0.5, 1, -0.5], [0.5, 1, 0.5]], n: [1, 0, 0], u: p => -p[2] },
};
const SIDE_KEYS = Object.keys(SIDES) as Side[];

function quadGeo(faces: readonly Face[]): BufferGeometry {
  const pos: number[] = [], nor: number[] = [], uv: number[] = [], idx: number[] = [];
  const g = new BufferGeometry();
  let start = 0;
  for (const { v, n, uvs, mat } of faces) {
    const b = pos.length / 3;
    v.forEach((p, i) => { pos.push(...p); nor.push(...n); uv.push(...uvs[i]!); });
    idx.push(b, b + 1, b + 2, b, b + 2, b + 3);
    g.addGroup(start, 6, mat);
    start += 6;
  }
  g.setAttribute('position', new Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new Float32BufferAttribute(nor, 3));
  g.setAttribute('uv', new Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  return g;
}

const sideFace = (k: Side, x0: number, z0: number): Face => ({
  v: SIDES[k].v, n: SIDES[k].n, mat: 0,
  uvs: SIDES[k].v.map(p => [SIDES[k].u([p[0] + x0, 0, p[2] + z0]), p[1] * WALL_H] as const),
});

export interface Wall {
  r: number; c: number; x: number; z: number;
  mesh: Mesh;
  mats: MeshStandardMaterial[];
  /** Opacity now, and the opacity it eases toward. */
  op: number; target: number;
  inner: { k: Side; mesh: Mesh; nb: Wall | null }[];
}

/** Something a ghosted wall should not hide: a box `half` wide each way and `h` tall, standing on the floor. */
export interface Seen { x: number; z: number; half: number; h: number }

export interface Walls {
  readonly group: Group;
  list(): readonly Wall[];
  /** The wall at a cell, if any. */
  at(r: number, c: number): Wall | undefined;
  build(models: readonly TerrainModel[], rows: number, cols: number): void;
  setMode(m: WallMode): void;
  /** Recomputes each wall's target opacity from the camera and the things it should not hide. */
  aim(camera: Camera, seen: readonly Seen[]): void;
  /** One frame of easing; true while any wall still fades. `snap` jumps to the targets. */
  ease(dtSec: number, snap: boolean): boolean;
  dispose(): void;
}

const SAMPLES: (readonly [number, number, number])[] = [];
for (const a of [0.15, 0.5, 0.85]) for (const b of [0.15, 0.5, 0.85]) for (const c of [0.15, 0.5, 0.85]) SAMPLES.push([a, b, c]);

/** Where a ray first enters an axis-aligned box, or -1 when it misses. */
function rayBoxT(o: V3, d: V3, mn: V3, mx: V3): number {
  let t0 = -1e9, t1 = 1e9;
  for (let i = 0; i < 3; i++) {
    if (Math.abs(d[i]!) < 1e-9) {
      if (o[i]! < mn[i]! || o[i]! > mx[i]!) return -1;
      continue;
    }
    let a = (mn[i]! - o[i]!) / d[i]!, b = (mx[i]! - o[i]!) / d[i]!;
    if (a > b) [a, b] = [b, a];
    if (a > t0) t0 = a;
    if (b < t1) t1 = b;
    if (t0 > t1) return -1;
  }
  return t0;
}

export function createWalls(kit: Kit): Walls {
  const group = new Group();
  let walls: Wall[] = [];
  const byCell = new Map<number, Wall>();
  let cols = 0;
  let mode: WallMode = 'solid';
  const camDir = new Vector3();

  const apply = (w: Wall) => {
    const see = w.op < 0.999;
    for (const mat of w.mats) {
      if (mat.transparent !== see) { mat.transparent = see; mat.needsUpdate = true; }
      mat.opacity = w.op;
    }
  };
  const clear = () => {
    for (const w of walls) {
      group.remove(w.mesh);
      w.mesh.geometry.dispose();
      for (const f of w.inner) f.mesh.geometry.dispose();
      for (const mat of w.mats) mat.dispose();
    }
    walls = [];
    byCell.clear();
  };

  return {
    group,
    list: () => walls,
    at: (r, c) => byCell.get(r * cols + c),
    build(models, rows, nCols) {
      clear();
      cols = nCols;
      const isWall = (r: number, c: number) => r < 0 || c < 0 || r >= rows || c >= cols || models[r * cols + c] === 'wall';
      const h = mode === 'low' ? LOW_H : WALL_H;
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        if (models[r * cols + c] !== 'wall') continue;
        const x0 = cellX(c, cols), z0 = cellZ(r, rows);
        const faces: Face[] = [{
          v: [[-0.5, 1, 0.5], [0.5, 1, 0.5], [0.5, 1, -0.5], [-0.5, 1, -0.5]], n: [0, 1, 0], mat: 1,
          uvs: [[x0 - 0.5, -z0 - 0.5], [x0 + 0.5, -z0 - 0.5], [x0 + 0.5, -z0 + 0.5], [x0 - 0.5, -z0 + 0.5]],
        }];
        const inner: Side[] = [];
        for (const k of SIDE_KEYS) {
          const [dr, dc] = SIDES[k].d;
          const nr = r + dr, nc = c + dc;
          if (isWall(nr, nc) && nr >= 0 && nc >= 0 && nr < rows && nc < cols) inner.push(k);
          else faces.push(sideFace(k, x0, z0));
        }
        const mats = [kit.m.side.clone(), kit.m.top.clone()];
        const mesh = new Mesh(quadGeo(faces), mats);
        mesh.position.set(x0, 0, z0);
        mesh.scale.y = h;
        mesh.castShadow = mesh.receiveShadow = true;
        group.add(mesh);
        const w: Wall = { r, c, x: x0, z: z0, mesh, mats, op: 1, target: 1, inner: [] };
        for (const k of inner) {
          const f = new Mesh(quadGeo([sideFace(k, x0, z0)]), [mats[0]!]);
          f.visible = false;
          mesh.add(f);
          w.inner.push({ k, mesh: f, nb: null });
        }
        walls.push(w);
        byCell.set(r * cols + c, w);
      }
      for (const w of walls) for (const f of w.inner) {
        const [dr, dc] = SIDES[f.k].d;
        f.nb = byCell.get((w.r + dr) * cols + w.c + dc) ?? null;
      }
    },
    setMode(m) {
      mode = m;
      const h = m === 'low' ? LOW_H : WALL_H;
      for (const w of walls) w.mesh.scale.y = h;
    },
    aim(camera, seen) {
      const cover = new Map<Wall, number>();
      if (mode === 'ghosted') {
        camera.getWorldDirection(camDir);
        const d: V3 = [camDir.x, camDir.y, camDir.z], L = 30;
        for (const th of seen) {
          const near = walls.filter(w => Math.abs(w.x - th.x) < 3.2 && Math.abs(w.z - th.z) < 3.2);
          if (near.length === 0) continue;
          const hits = new Map<Wall, number>();
          for (const [a, b, c] of SAMPLES) {
            const p: V3 = [th.x - th.half + 2 * th.half * a, FY + th.h * b, th.z - th.half + 2 * th.half * c];
            const o: V3 = [p[0] - d[0] * L, p[1] - d[1] * L, p[2] - d[2] * L];
            for (const w of near) {
              const t = rayBoxT(o, d, [w.x - 0.49, 0, w.z - 0.49], [w.x + 0.49, WALL_H, w.z + 0.49]);
              if (t >= 0 && t < L - 0.01) hits.set(w, (hits.get(w) ?? 0) + 1);
            }
          }
          for (const [w, n] of hits) cover.set(w, Math.max(cover.get(w) ?? 0, n / SAMPLES.length));
        }
      }
      for (const w of walls) {
        // A wall that only grazes a thing stays solid; one that hides half of it or more fades all the way.
        const s = Math.min(1, Math.max(0, ((cover.get(w) ?? 0) - 0.03) / 0.45));
        w.target = ghostTarget(s * s * (3 - 2 * s));
      }
    },
    ease(dt, snap) {
      let busy = false;
      for (const w of walls) {
        if (w.op === w.target) continue;
        w.op = snap ? w.target : easeOpacity(w.op, w.target, dt);
        busy = true;
        apply(w);
      }
      if (busy) for (const w of walls) for (const f of w.inner) f.mesh.visible = !!f.nb && f.nb.op < 0.999 && w.op > f.nb.op + 0.02;
      return busy;
    },
    dispose: clear,
  };
}
