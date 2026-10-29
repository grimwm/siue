/* The Island of Crete, modern look: the blocks floating in the water they filled (src/modern/float.ts). Each is the
 * block's own model, sunk until its top is just above the surface. One that goes in during play splashes: a ring
 * spreads on the water and droplets fly up and fall back, while the block dips under and rises to float. The
 * splash plays on the board's own frames and leaves nothing drawing once it ends. */
import { Group, IcosahedronGeometry, Mesh, MeshBasicMaterial, RingGeometry } from 'three';
import type { Object3D } from 'three';
import { DIP_S, FLOAT_TOP, RISE_S, SPLASH_S, floatBob, floatTop } from '../float.ts';
import { FY, WATER_Y, cellX, cellZ } from './floor.ts';
import { PIECE_MODELS } from './pieces.ts';
import { disposeModel } from './terrain.ts';
import { rng } from './textures.ts';
import type { Kit } from './textures.ts';

/** The block model's top above the floor. */
const BLOCK_TOP = 0.8;
/** Where a block's top stands above the water as it slides in on the floor. */
const ENTER = FY + BLOCK_TOP - WATER_Y;
const DROPS = 9;
const GRAVITY = 9;
const SPRAY = 0xd2ecee;

interface Splash {
  /** When it began, in ms on the frame clock; null until its first frame. */
  t0: number | null;
  ring: Mesh<RingGeometry, MeshBasicMaterial>;
  drops: Mesh<IcosahedronGeometry, MeshBasicMaterial>[];
  /** Each droplet's way out (x, z per second) and up (per second). */
  flight: [number, number, number][];
}

interface Floater {
  block: Object3D;
  x: number;
  z: number;
  splash: Splash | null;
}

export interface Floats {
  readonly group: Group;
  /** Floats a block on each of `cells`; one not floating before splashes in when `splash` is true, at once
   *  otherwise. True when any came or went. */
  set(cells: readonly number[], cols: number, rows: number, splash: boolean): boolean;
  /** Moves the splashes to `now` ms; true while one still plays. */
  frame(now: number): boolean;
  /** The bob of the blocks at rest, at loop time `t` seconds. */
  loop(t: number, still: boolean): void;
  /** The floating cells, for tests. */
  cells(): number[];
  clear(): void;
  dispose(): void;
}

export function createFloats(kit: Kit): Floats {
  const group = new Group();
  const dropGeo = new IcosahedronGeometry(0.05, 0);
  const ringGeo = new RingGeometry(0.82, 1, 40);
  ringGeo.rotateX(-Math.PI / 2);
  const floaters = new Map<number, Floater>();
  let loopY = 0;

  /** Stands the block with its top `top` above the water. */
  const sink = (f: Floater, top: number) => { f.block.position.y = WATER_Y + top - (FY + BLOCK_TOP); };

  function endSplash(f: Floater): void {
    const s = f.splash;
    if (!s) return;
    for (const m of [s.ring, ...s.drops]) { group.remove(m); m.material.dispose(); }
    f.splash = null;
  }

  function splashAt(i: number, x: number, z: number): Splash {
    const R = rng(i * 2246822519 + 5);
    const ring = new Mesh(ringGeo, new MeshBasicMaterial({ color: SPRAY, transparent: true, depthWrite: false }));
    ring.position.set(x, WATER_Y + 0.004, z);
    ring.scale.setScalar(0.35);
    group.add(ring);
    const drops: Splash['drops'] = [];
    const flight: Splash['flight'] = [];
    for (let k = 0; k < DROPS; k++) {
      const a = ((k + R() * 0.6) / DROPS) * Math.PI * 2;
      const out = 0.55 + R() * 0.45;
      flight.push([Math.cos(a) * out, Math.sin(a) * out, 1.6 + R() * 0.8]);
      const d = new Mesh(dropGeo, new MeshBasicMaterial({ color: SPRAY, transparent: true, depthWrite: false }));
      d.position.set(x, WATER_Y, z);
      group.add(d);
      drops.push(d);
    }
    return { t0: null, ring, drops, flight };
  }

  function remove(i: number): void {
    const f = floaters.get(i);
    if (!f) return;
    endSplash(f);
    group.remove(f.block);
    disposeModel(f.block, kit);
    floaters.delete(i);
  }

  return {
    group,
    set(cells, cols, rows, splash) {
      let changed = false;
      const want = new Set(cells);
      for (const i of [...floaters.keys()]) if (!want.has(i)) { remove(i); changed = true; }
      for (const i of cells) {
        if (floaters.has(i)) continue;
        const x = cellX(i % cols, cols), z = cellZ(Math.floor(i / cols), rows);
        const block = PIECE_MODELS.block(kit);
        block.position.set(x, 0, z);
        group.add(block);
        const f: Floater = { block, x, z, splash: splash ? splashAt(i, x, z) : null };
        sink(f, splash ? ENTER : FLOAT_TOP + loopY);
        floaters.set(i, f);
        changed = true;
      }
      return changed;
    },
    frame(now) {
      let playing = false;
      for (const f of floaters.values()) {
        const s = f.splash;
        if (!s) continue;
        s.t0 ??= now;
        const t = (now - s.t0) / 1000;
        if (t >= Math.max(SPLASH_S, DIP_S + RISE_S)) {
          endSplash(f);
          sink(f, FLOAT_TOP + loopY);
          continue;
        }
        playing = true;
        sink(f, floatTop(t, ENTER));
        const k = Math.min(1, t / SPLASH_S);
        s.ring.scale.setScalar(0.35 + 0.35 * (1 - (1 - k) ** 2));
        s.ring.material.opacity = 0.75 * (1 - k);
        s.drops.forEach((d, j) => {
          const [vx, vz, vy] = s.flight[j]!;
          const y = WATER_Y + vy * t - (GRAVITY / 2) * t * t;
          d.visible = k < 1 && y >= WATER_Y;
          d.position.set(f.x + vx * t, y, f.z + vz * t);
          d.material.opacity = 0.9 * (1 - k * k);
        });
      }
      return playing;
    },
    loop(t, still) {
      loopY = floatBob(t, still);
      for (const f of floaters.values()) if (!f.splash) sink(f, FLOAT_TOP + loopY);
    },
    cells: () => [...floaters.keys()].sort((a, b) => a - b),
    clear() {
      for (const i of [...floaters.keys()]) remove(i);
    },
    dispose() {
      this.clear();
      dropGeo.dispose();
      ringGeo.dispose();
    },
  };
}
