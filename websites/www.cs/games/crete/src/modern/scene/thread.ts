/* The Island of Crete, modern look: Ariadne's thread, a thin red cord lying just above the floor through the
 * centres of its squares, in the red Classic draws it, broken where Theseus jumps (a teleport, a throw-back). On
 * each square lies a flat arrow, red edged dark, pointing the way to step next. The next step's arrow, on
 * Theseus's own square, is bigger and gold, drawn over everything so his figure never hides it, and breathes while
 * the tile loops run. It is rebuilt only when the thread changes. */
import { CylinderGeometry, Group, Mesh, MeshBasicMaterial, MeshStandardMaterial, Shape, ShapeGeometry, SphereGeometry } from 'three';
import type { BufferGeometry } from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { Dir } from '../../puzzle/tiles.ts';
import { NEXT_SCALE, arrowAt, nextArrow, pulseScale } from '../../thread-path.ts';
import type { ThreadCell } from '../../thread-path.ts';
import { FY, cellX, cellZ } from './floor.ts';

/** The cord and the arrows past the next step, held back (about 70% of their full red), as in Classic. */
const RED = 0x8f291f;
const ARROW_RED = 0xbb4131;
const NEXT_GOLD = 0xffd23f;
const EDGE = 0x1c0402;
const R = 0.03;
const Y = FY + 0.035;
/** The arrows lie flat just over the cord: the dark edge first, the fill a hair above it. */
const EDGE_Y = Y + R + 0.01;
const FILL_Y = EDGE_Y + 0.006;
const LEN = 0.42;
const HALF = 0.2;
/** An arrow sits in the half of its square it points into, so a square walked one way and back shows both apart. */
const SHIFT = 0.2;
/** How far the dark edge stands out round the fill, as a scale of the arrow. */
const EDGE_SCALE = 1.32;
const ANGLE: Record<Dir, number> = { right: 0, down: Math.PI / 2, left: Math.PI, up: -Math.PI / 2 };

/** An arrowhead pointing along +x, its centre SHIFT along +x from the origin, lying flat (facing up) on the XZ plane. */
function arrowhead(scale: number): ShapeGeometry {
  const l = LEN * scale, h = HALF * scale;
  const s = new Shape();
  s.moveTo(l / 2, 0);
  s.lineTo(-l / 2, h);
  s.lineTo(-l / 4, 0);
  s.lineTo(-l / 2, -h);
  s.closePath();
  return new ShapeGeometry(s).rotateX(-Math.PI / 2).translate(SHIFT, 0, 0);
}

export interface Thread {
  readonly group: Group;
  /** Lays the thread, or takes it up when null; true when it changed. */
  set(cells: readonly ThreadCell[] | null, cols: number, rows: number): boolean;
  /** Sizes the next step's arrow for `t` seconds into its pulse; false when there is none to breathe. */
  pulse(t: number): boolean;
  /** The next step's arrow as laid, for tests: its way and its size as a scale of the other arrows. */
  next(): { dir: Dir; scale: number } | null;
  dispose(): void;
}

export function createThread(): Thread {
  const group = new Group();
  const mat = new MeshStandardMaterial({ color: RED, roughness: 0.7, emissive: RED, emissiveIntensity: 0.35 });
  // Unlit, so an arrow keeps its contrast in shade and in light alike.
  const fillMat = new MeshBasicMaterial({ color: ARROW_RED });
  const edgeMat = new MeshBasicMaterial({ color: EDGE });
  // Drawn after the scene and through it, so Theseus's figure never hides the next step.
  const nextFill = new MeshBasicMaterial({ color: NEXT_GOLD, depthTest: false });
  const nextEdge = new MeshBasicMaterial({ color: EDGE, depthTest: false });
  const meshes: Mesh[] = [];
  let next: { mesh: Group; dir: Dir } | null = null;
  let key = '';

  const clear = () => {
    for (const m of meshes) {
      m.parent?.remove(m);
      m.geometry.dispose();
    }
    meshes.length = 0;
    if (next) group.remove(next.mesh);
    next = null;
  };
  const add = (parts: BufferGeometry[], m: MeshBasicMaterial | MeshStandardMaterial): Mesh | null => {
    if (parts.length === 0) return null;
    const flat = parts.map(g => (g.index ? g.toNonIndexed() : g));
    const mesh = new Mesh(mergeGeometries(flat), m);
    parts.forEach(g => g.dispose());
    flat.forEach(g => g.dispose());
    meshes.push(mesh);
    group.add(mesh);
    return mesh;
  };

  return {
    group,
    set(cells, cols, rows) {
      const k = cells && cells.length > 1 ? `${cols}x${rows}:${cells.map(c => `${c.jump ? '^' : ''}${c.r},${c.c}${c.way ?? ''}`).join(' ')}` : '';
      if (k === key) return false;
      key = k;
      clear();
      if (!cells || cells.length < 2) return true;
      const pts = cells.map(c => [cellX(c.c, cols), cellZ(c.r, rows)] as const);
      const cord: BufferGeometry[] = [], fills: BufferGeometry[] = [], edges: BufferGeometry[] = [];
      pts.forEach(([x, z], i) => {
        // A knot at each square keeps the corners round; a straight run of cord to the next, unless it is a jump.
        cord.push(new SphereGeometry(R, 8, 6).translate(x, Y, z));
        const dir = arrowAt(cells, i);
        if (!dir) return;
        const [nx, nz] = pts[i + 1]!;
        const dx = nx - x, dz = nz - z, len = Math.hypot(dx, dz);
        const seg = new CylinderGeometry(R, R, len, 8, 1, true);
        seg.rotateZ(Math.PI / 2);
        seg.rotateY(-Math.atan2(dz, dx));
        seg.translate(x + dx / 2, Y, z + dz / 2);
        cord.push(seg);
        if (i === 0) return;
        edges.push(arrowhead(EDGE_SCALE).rotateY(-ANGLE[dir]).translate(x, EDGE_Y, z));
        fills.push(arrowhead(1).rotateY(-ANGLE[dir]).translate(x, FILL_Y, z));
      });
      const c = add(cord, mat);
      if (c) c.receiveShadow = true;
      add(edges, edgeMat);
      add(fills, fillMat);
      const dir = nextArrow(cells);
      if (dir) {
        // Its own group about the square's centre, so the pulse scales it in place.
        const g = new Group();
        const e = new Mesh(arrowhead(EDGE_SCALE).rotateY(-ANGLE[dir]), nextEdge);
        const f = new Mesh(arrowhead(1).rotateY(-ANGLE[dir]).translate(0, FILL_Y - EDGE_Y, 0), nextFill);
        e.renderOrder = 10;
        f.renderOrder = 11;
        meshes.push(e, f);
        g.add(e, f);
        g.position.set(pts[0]![0], EDGE_Y, pts[0]![1]);
        g.scale.setScalar(NEXT_SCALE);
        group.add(g);
        next = { mesh: g, dir };
      }
      return true;
    },
    pulse(t) {
      if (!next) return false;
      next.mesh.scale.setScalar(NEXT_SCALE * pulseScale(t));
      return true;
    },
    next() {
      return next ? { dir: next.dir, scale: next.mesh.scale.x } : null;
    },
    dispose() {
      clear();
      mat.dispose();
      fillMat.dispose();
      edgeMat.dispose();
      nextFill.dispose();
      nextEdge.dispose();
    },
  };
}
