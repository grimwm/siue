/* The Island of Crete, modern look: the light. A dim sky and a cold moon that casts the walls' shadows, a warm
 * lamp that follows Theseus, torches on the walls facing the floor, one glow per run of fire, and a lamp at
 * each door, the gate and the exit. A level's lights are fixed when it is built (adding a light recompiles
 * every material), so a door that opens dims its lamp rather than losing it. */
import { BoxGeometry, ConeGeometry, CylinderGeometry, DirectionalLight, Group, HemisphereLight, Mesh, PointLight, Sprite, SpriteMaterial, AdditiveBlending, Vector3 } from 'three';
import type { Material, MeshBasicMaterial } from 'three';
import type { WallMode } from '../../settings.ts';
import type { TerrainModel } from '../model-names.ts';
import { FY, cellX, cellZ } from './floor.ts';
import { SIDES } from './walls.ts';
import type { Wall } from './walls.ts';
import { flameMat } from './textures.ts';
import type { Kit } from './textures.ts';

interface Torch { g: Group; flames: Mesh[]; halo: Sprite; light: PointLight; base: number; ph: number }
interface Glow { light: PointLight; base: number; ph: number }

export interface Lights {
  readonly group: Group;
  /** The lamp that follows Theseus. */
  hero(x: number, z: number): void;
  setMode(m: WallMode): void;
  /** A cell's model changed: its lamp, if it has one, lights only while it is still a door, gate or exit. */
  piece(i: number, model: TerrainModel): void;
  /** Turns shadows on or off. */
  shadows(on: boolean): void;
  /** Torch and fire flicker at time `t` seconds. */
  loop(t: number): void;
  /** Where the looping lights stand, to tell whether one is on screen. */
  readonly anchors: readonly Vector3[];
  dispose(): void;
}

const LAMPS: Partial<Record<TerrainModel, (x: number, z: number) => PointLight>> = {
  'door-red': door, 'door-blue': door, 'door-yellow': door, 'door-green': door,
  'gate-closed': gate, 'gate-open': gate,
  exit: (x, z) => at(new PointLight(0xff9a40, 4, 4, 1.6), x, 0.4, z),
};
function door(x: number, z: number): PointLight { return at(new PointLight(0xffb070, 1.6, 2.6, 1.8), x, 0.9, z + 0.6); }
function gate(x: number, z: number): PointLight { return at(new PointLight(0xffc070, 1.2, 2.5, 1.8), x, 1, z); }
function at<T extends { position: Vector3 }>(o: T, x: number, y: number, z: number): T { o.position.set(x, y, z); return o; }
const kindOf = (m: TerrainModel) => (m.startsWith('door') ? 'door' : m.startsWith('gate') ? 'gate' : m);

/** Builds the lights for one level: its cells' models and its walls. */
export function createLights(kit: Kit, models: readonly TerrainModel[], rows: number, cols: number, walls: readonly Wall[]): Lights {
  const { m } = kit;
  const group = new Group();
  const owned: Material[] = [];
  group.add(new HemisphereLight(0x9a98a0, 0x2a2420, 2.4));
  const span = Math.hypot(cols, rows) / 2 + 1.5;
  const moon = new DirectionalLight(0xb0b8d0, 1.6);
  moon.position.set(-6, 14, 8);
  moon.castShadow = true;
  moon.shadow.mapSize.set(2048, 2048);
  Object.assign(moon.shadow.camera, { left: -span, right: span, top: span, bottom: -span, near: 1, far: 40 + span });
  moon.shadow.camera.updateProjectionMatrix();
  moon.shadow.bias = -0.0008;
  group.add(moon, moon.target);
  const heroLight = new PointLight(0xffb878, 5.5, 5.5, 1.6);
  heroLight.castShadow = true;
  heroLight.shadow.mapSize.set(512, 512);
  heroLight.shadow.bias = -0.004;
  group.add(heroLight);
  const anchors: Vector3[] = [];

  // Torches: on wall faces that look onto plain floor, south faces first, no two within four cells.
  const torches: Torch[] = [];
  const most = Math.min(8, Math.max(3, Math.round((rows * cols) / 37)));
  const prefer = ['s', 'e', 'w', 'n'] as const;
  const cand: { w: Wall; k: (typeof prefer)[number]; r: number; c: number; pri: number }[] = [];
  for (const w of walls) for (const k of prefer) {
    const [dr, dc] = SIDES[k].d, r = w.r + dr, c = w.c + dc;
    if (r < 0 || c < 0 || r >= rows || c >= cols || models[r * cols + c] !== 'floor') continue;
    cand.push({ w, k, r, c, pri: prefer.indexOf(k) });
  }
  cand.sort((a, b) => a.pri - b.pri || a.r - b.r || a.c - b.c);
  const picked: typeof cand = [];
  for (const cd of cand) {
    if (picked.length >= most) break;
    if (picked.some(p => Math.max(Math.abs(p.r - cd.r), Math.abs(p.c - cd.c)) < 4)) continue;
    picked.push(cd);
  }
  const haloMat = new SpriteMaterial({ map: m.halo, blending: AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.55 });
  owned.push(haloMat);
  picked.forEach(({ w, k }, i) => {
    const [nx, , nz] = SIDES[k].n, g = new Group();
    g.position.set(w.x + nx * 0.5, 0, w.z + nz * 0.5);
    g.add(at(new Mesh(new BoxGeometry(0.08, 0.2, 0.08), m.iron), nx * 0.04, 0.82, nz * 0.04));
    g.add(at(new Mesh(new CylinderGeometry(0.05, 0.03, 0.12, 8), m.iron), nx * 0.1, 0.92, nz * 0.1));
    const f1 = at(new Mesh(new ConeGeometry(0.055, 0.2, 8), flameMat(0xff8a30)), nx * 0.1, 1.07, nz * 0.1);
    const f2 = at(new Mesh(new ConeGeometry(0.03, 0.12, 8), flameMat(0xffe0a0)), nx * 0.1, 1.04, nz * 0.1);
    owned.push(f1.material as MeshBasicMaterial, f2.material as MeshBasicMaterial);
    const halo = new Sprite(haloMat);
    halo.scale.setScalar(0.7);
    halo.position.set(nx * 0.12, 1.05, nz * 0.12);
    g.add(f1, f2, halo);
    for (const o of g.children) if (o instanceof Mesh && o.material === m.iron) o.castShadow = true;
    group.add(g);
    const light = at(new PointLight(0xffa864, 4, 6, 1.7), g.position.x + nx * 0.45, 1.05, g.position.z + nz * 0.45);
    group.add(light);
    torches.push({ g, flames: [f1, f2], halo, light, base: 4, ph: i * 2.39 });
    anchors.push(new Vector3(g.position.x, 1, g.position.z));
  });

  // Fire: one glow per run of fire cells along a row.
  const glows: Glow[] = [];
  const runs: { r: number; c0: number; c1: number }[] = [];
  models.forEach((md, i) => {
    if (md !== 'fire') return;
    const r = Math.floor(i / cols), c = i % cols, last = runs.at(-1);
    if (last && last.r === r && last.c1 === c - 1) last.c1 = c;
    else runs.push({ r, c0: c, c1: c });
    anchors.push(new Vector3(cellX(c, cols), FY + 0.2, cellZ(r, rows)));
  });
  for (const run of runs) {
    const n = run.c1 - run.c0 + 1;
    const light = at(new PointLight(0xff7a30, 3 + n * 1.2, 3 + n * 0.8, 1.6), (cellX(run.c0, cols) + cellX(run.c1, cols)) / 2, 0.8, cellZ(run.r, rows));
    group.add(light);
    glows.push({ light, base: light.intensity, ph: run.r });
  }
  models.forEach((md, i) => {
    if (md === 'water' || md === 'teleport') anchors.push(new Vector3(cellX(i % cols, cols), FY, cellZ(Math.floor(i / cols), rows)));
  });

  // Lamps at doors, the gate and the exit, keyed by cell.
  const lamps = new Map<number, { light: PointLight; base: number; kind: string }>();
  models.forEach((md, i) => {
    const make = LAMPS[md];
    if (!make) return;
    const light = make(cellX(i % cols, cols), cellZ(Math.floor(i / cols), rows));
    group.add(light);
    lamps.set(i, { light, base: light.intensity, kind: kindOf(md) });
  });

  return {
    group,
    anchors,
    hero(x, z) { heroLight.position.set(x, 1.5, z + 0.1); },
    setMode(md) {
      for (const t of torches) {
        t.g.visible = md !== 'low';
        t.light.position.y = md === 'low' ? 0.7 : 1.05;
      }
    },
    piece(i, md) {
      const l = lamps.get(i);
      if (l) l.light.intensity = kindOf(md) === l.kind ? l.base : 0;
    },
    shadows(on) {
      moon.castShadow = on;
      heroLight.castShadow = on;
    },
    loop(t) {
      for (const tc of torches) {
        const f = 1 + 0.07 * Math.sin(t * 7.1 + tc.ph) + 0.04 * Math.sin(t * 12.7 + tc.ph * 2);
        tc.flames.forEach(fl => fl.scale.set(1, f, 1));
        tc.light.intensity = tc.base * (1 + 0.1 * Math.sin(t * 6.3 + tc.ph) + 0.05 * Math.sin(t * 11.1));
      }
      haloMat.opacity = 0.5 + 0.06 * Math.sin(t * 5);
      for (const gl of glows) gl.light.intensity = gl.base * (1 + 0.1 * Math.sin(t * 5.7 + gl.ph));
    },
    dispose() {
      group.traverse(o => {
        if (o instanceof Mesh) o.geometry.dispose();
        if (o instanceof DirectionalLight || o instanceof PointLight) o.shadow.map?.dispose();
      });
      for (const mat of owned) mat.dispose();
    },
  };
}
