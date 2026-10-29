/* The Island of Crete, modern look: Ariadne's thread, a thin red cord lying just above the floor through the
 * centres of its cells, in the red Classic draws it. It is rebuilt only when the thread changes. */
import { CylinderGeometry, Group, Mesh, MeshStandardMaterial, SphereGeometry } from 'three';
import type { BufferGeometry } from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { Cell } from '../../puzzle/tiles.ts';
import { FY, cellX, cellZ } from './floor.ts';

const RED = 0xc0392b;
const R = 0.03;
const Y = FY + 0.035;

export interface Thread {
  readonly group: Group;
  /** Lays the thread, or takes it up when null; true when it changed. */
  set(cells: readonly Cell[] | null, cols: number, rows: number): boolean;
  dispose(): void;
}

export function createThread(): Thread {
  const group = new Group();
  const mat = new MeshStandardMaterial({ color: RED, roughness: 0.7, emissive: RED, emissiveIntensity: 0.35 });
  let mesh: Mesh | null = null;
  let key = '';

  const clear = () => {
    if (!mesh) return;
    group.remove(mesh);
    mesh.geometry.dispose();
    mesh = null;
  };

  return {
    group,
    set(cells, cols, rows) {
      const k = cells && cells.length > 1 ? `${cols}x${rows}:${cells.map(c => `${c.r},${c.c}`).join(' ')}` : '';
      if (k === key) return false;
      key = k;
      clear();
      if (!cells || cells.length < 2) return true;
      const pts = cells.map(c => [cellX(c.c, cols), cellZ(c.r, rows)] as const);
      const parts: BufferGeometry[] = [];
      pts.forEach(([x, z], i) => {
        // A knot at each cell keeps the corners round; a straight run of cord to the next.
        parts.push(new SphereGeometry(R, 8, 6).translate(x, Y, z));
        const next = pts[i + 1];
        if (!next) return;
        const dx = next[0] - x, dz = next[1] - z, len = Math.hypot(dx, dz);
        if (len < 1e-6) return;
        const seg = new CylinderGeometry(R, R, len, 8, 1, true);
        seg.rotateZ(Math.PI / 2);
        seg.rotateY(-Math.atan2(dz, dx));
        seg.translate(x + dx / 2, Y, z + dz / 2);
        parts.push(seg);
      });
      const flatParts = parts.map(g => (g.index ? g.toNonIndexed() : g));
      mesh = new Mesh(mergeGeometries(flatParts), mat);
      parts.forEach(g => g.dispose());
      flatParts.forEach(g => g.dispose());
      mesh.receiveShadow = true;
      group.add(mesh);
      return true;
    },
    dispose() {
      clear();
      mat.dispose();
    },
  };
}
