/* The Island of Crete, modern look: the ground. One flagstone per cell, so the seams between stones are the only
 * grid; each stone takes one of three faces, a quarter turn and a tint chosen by its cell, so a rebuild after a
 * turn changes only the cells whose ground changed. Fire, ice, force floors, dirt and gravel are stones of their
 * own; water lies in a basin below the stones, and the exit's stair goes down through the ground. Each surface is one instanced mesh. */
import { Color, Group, IcosahedronGeometry, InstancedMesh, Matrix4, Mesh, Path, PlaneGeometry, Shape, ShapeGeometry, Vector2 } from 'three';
import type { BufferGeometry, Material } from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { SURFACES } from '../model-names.ts';
import type { TerrainModel } from '../model-names.ts';
import { rng } from './textures.ts';
import type { Kit } from './textures.ts';

/** The top of the flagstones: everything standing on the floor stands at this height. */
export const FY = 0.1;
/** World x and z of a cell, the board centred at the origin. */
export const cellX = (c: number, cols: number): number => c - (cols - 1) / 2;
export const cellZ = (r: number, rows: number): number => r - (rows - 1) / 2;

const FORCE_TURN: Partial<Record<TerrainModel, number>> = {
  'force-up': 0, 'force-left': Math.PI / 2, 'force-down': Math.PI, 'force-right': -Math.PI / 2,
};
const PEBBLES = 26;

export interface Floor {
  readonly group: Group;
  /** Lays the ground for every cell's model, row by row. */
  set(models: readonly TerrainModel[], rows: number, cols: number): void;
  /** The tile loops at time `t` seconds: the water's ripples. */
  loop(t: number): void;
  dispose(): void;
}

export function createFloor(kit: Kit): Floor {
  const { m } = kit;
  const group = new Group();
  const flagGeo = new RoundedBoxGeometry(0.93, 0.12, 0.93, 2, 0.035);
  flagGeo.translate(0, FY - 0.06, 0);
  const waterGeo = new PlaneGeometry(1, 1);
  waterGeo.rotateX(-Math.PI / 2);
  waterGeo.translate(0, 0.035, 0);
  const pebbleGeo = new IcosahedronGeometry(0.045, 0);
  // The dark ground round the board, open over the board itself so the exit's pit can go down.
  const under = new Mesh<BufferGeometry, Material>(new PlaneGeometry(1, 1), m.under);
  under.rotation.x = -Math.PI / 2;
  under.position.y = -0.02;
  under.receiveShadow = true;
  group.add(under);
  const mortarGeo = new PlaneGeometry(1, 1);
  mortarGeo.rotateX(-Math.PI / 2);
  let layers: InstancedMesh[] = [];

  const instanced = (geo: BufferGeometry, mat: Material, n: number): InstancedMesh => {
    const im = new InstancedMesh(geo, mat, Math.max(1, n));
    im.count = n;
    im.receiveShadow = true;
    layers.push(im);
    group.add(im);
    return im;
  };

  const clear = () => {
    for (const l of layers) { group.remove(l); l.dispose(); }
    layers = [];
  };

  return {
    group,
    set(models, rows, cols) {
      clear();
      const ground = new Shape([new Vector2(-100, -100), new Vector2(100, -100), new Vector2(100, 100), new Vector2(-100, 100)]);
      ground.holes.push(new Path([new Vector2(-cols / 2, -rows / 2), new Vector2(-cols / 2, rows / 2), new Vector2(cols / 2, rows / 2), new Vector2(cols / 2, -rows / 2)]));
      under.geometry.dispose();
      under.geometry = new ShapeGeometry(ground);
      const flags: number[][] = [[], [], []];
      const by: Record<string, number[]> = { ember: [], ice: [], force: [], dirt: [], gravel: [], water: [], mortar: [] };
      models.forEach((model, i) => {
        const s = SURFACES[model];
        // The mortar between the stones; the exit's pit has none.
        if (model !== 'exit') by.mortar!.push(i);
        if (s === 'flag') flags[(rng(i * 2654435761 + 7)() * 3) | 0]!.push(i);
        else if (s !== 'none') by[s]!.push(i);
      });
      const mx = new Matrix4(), col = new Color();
      const place = (im: InstancedMesh, cells: number[], turn: (i: number, R: () => number) => number, tint: boolean) => {
        cells.forEach((i, k) => {
          const R = rng(i * 40503 + 11);
          mx.makeRotationY(turn(i, R)).setPosition(cellX(i % cols, cols), 0, cellZ(Math.floor(i / cols), rows));
          im.setMatrixAt(k, mx);
          if (tint) {
            const v = 0.78 + R() * 0.3;
            im.setColorAt(k, col.setRGB(v * (1 + (R() - 0.5) * 0.06), v, v * (1 - R() * 0.06)));
          }
        });
      };
      const quarter = (_: number, R: () => number) => ((R() * 4) | 0) * (Math.PI / 2);
      place(instanced(mortarGeo, m.mortar, by.mortar!.length), by.mortar!, () => 0, false);
      flags.forEach((cells, k) => place(instanced(flagGeo, m.flags[k]!, cells.length), cells, quarter, true));
      place(instanced(flagGeo, m.ember, by.ember!.length), by.ember!, quarter, false);
      place(instanced(flagGeo, m.ice, by.ice!.length), by.ice!, quarter, false);
      place(instanced(flagGeo, m.dirt, by.dirt!.length), by.dirt!, quarter, true);
      place(instanced(flagGeo, m.gravelBed, by.gravel!.length), by.gravel!, quarter, true);
      place(instanced(flagGeo, m.force, by.force!.length), by.force!, i => FORCE_TURN[models[i]!] ?? 0, false);
      place(instanced(waterGeo, m.water, by.water!.length), by.water!, () => 0, false);
      const gravel = by.gravel!;
      if (gravel.length) {
        const peb = instanced(pebbleGeo, m.pebble, gravel.length * PEBBLES);
        peb.castShadow = true;
        let k = 0;
        for (const i of gravel) {
          const R = rng(i * 7919 + 3);
          for (let j = 0; j < PEBBLES; j++) {
            const v = 0.7 + R() * 0.5;
            mx.makeScale(v, 0.6 * v, v).setPosition(
              cellX(i % cols, cols) + (R() - 0.5) * 0.8, FY + 0.015, cellZ(Math.floor(i / cols), rows) + (R() - 0.5) * 0.8);
            peb.setMatrixAt(k, mx);
            peb.setColorAt(k++, col.setScalar(0.75 + R() * 0.5));
          }
        }
      }
    },
    loop(t) {
      kit.t.water.offset.set(Math.sin(t * 0.5) * 0.04, (t * 0.025) % 1);
      m.water.emissiveIntensity = 1 + 0.15 * Math.sin(t * 1.3);
    },
    dispose() {
      clear();
      flagGeo.dispose();
      waterGeo.dispose();
      pebbleGeo.dispose();
      mortarGeo.dispose();
      under.geometry.dispose();
    },
  };
}
