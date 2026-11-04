/* The Island of Crete, modern look: the exit, the Aegean Portal. A white marble arch with gold capitals and a gold
 * keystone, filled with a shimmering sheet of Aegean-blue light, over a blue pool in a marble ring on a flagstone.
 * Until the last relic is taken it is dormant: its opening dark stone, its basin dry, no light. `light(k)` sets how
 * far it is lit (src/openings.ts): the sheet rises and brightens, the pool spreads from the middle. Built facing
 * local -x; terrain.ts turns it to face its cell's open side. The shimmer runs through `loop(t)`, which the board
 * never calls when motion is reduced, so the built portal is its still one. */
import {
  CanvasTexture, CircleGeometry, ClampToEdgeWrapping, DoubleSide, Group, Mesh, MeshBasicMaterial, MeshStandardMaterial,
  PlaneGeometry, RepeatWrapping, SRGBColorSpace, Shape, ShapeGeometry, TorusGeometry, AdditiveBlending,
} from 'three';
import type { Material, Object3D } from 'three';
import { FY } from './floor.ts';
import type { Kit } from './textures.ts';

export interface Portal {
  /** The baked parts: the marble and the gold. */
  g: Group;
  /** The parts that shimmer, kept apart from the bake. */
  live: Object3D[];
  /** Its height, for the ghosted walls. */
  h: number;
  loop: (t: number) => void;
  /** How far it is lit, 0 dormant to 1 lit. It is built lit. */
  light: (k: number) => void;
}

type Box = (x: number, y: number, z: number, m: Material) => Mesh;
type Cyl = (rt: number, rb: number, h: number, m: Material) => Mesh;

const at = <T extends Object3D>(o: T, x: number, y: number, z: number): T => (o.position.set(x, y, z), o);

function canvasTex(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, repeat = false): CanvasTexture {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d')!);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.wrapS = t.wrapT = repeat ? RepeatWrapping : ClampToEdgeWrapping;
  return t;
}

/** A soft round pool of light, `inner` at the middle fading out. */
function poolTex(inner: string, outer: string): CanvasTexture {
  return canvasTex(128, 128, g => {
    const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, inner);
    gr.addColorStop(0.5, outer);
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, 128, 128);
  });
}

/** The portal's light: Aegean blue at the edges, nearly white in the middle, with soft ripples that scroll. */
function shimmerTex(): CanvasTexture {
  return canvasTex(128, 256, g => {
    const gr = g.createLinearGradient(0, 0, 128, 0);
    gr.addColorStop(0, '#0b5fa8');
    gr.addColorStop(0.5, '#bfe9ff');
    gr.addColorStop(1, '#0b5fa8');
    g.fillStyle = gr;
    g.fillRect(0, 0, 128, 256);
    g.strokeStyle = 'rgba(255,255,255,0.35)';
    g.lineWidth = 3;
    for (let k = 0; k < 8; k++) {
      g.beginPath();
      for (let x = 0; x <= 128; x += 4) g.lineTo(x, k * 32 + 10 * Math.sin(x / 20 + k));
      g.stroke();
    }
  }, true);
}

/** A marble column with a base and a gold capital, standing on the floor at `z`. */
function column(g: Group, box: Box, cyl: Cyl, mat: Material, cap: Material, z: number, H: number): void {
  g.add(at(box(0.2, 0.06, 0.2, mat), 0, FY + 0.03, z));
  g.add(at(cyl(0.065, 0.075, H, mat), 0, FY + 0.06 + H / 2, z));
  g.add(at(box(0.2, 0.07, 0.2, cap), 0, FY + 0.06 + H + 0.035, z));
}

/** The arch's opening as a flat shape facing x: a rectangle under a half circle. */
function opening(W: number, spring: number): ShapeGeometry {
  const s = new Shape();
  s.moveTo(-W, FY);
  s.lineTo(-W, spring);
  s.absarc(0, spring, W, Math.PI, 0, true);
  s.lineTo(W, FY);
  s.lineTo(-W, FY);
  const geo = new ShapeGeometry(s, 24);
  geo.rotateY(Math.PI / 2);
  return geo;
}

export function portal(kit: Kit, box: Box, cyl: Cyl): Portal {
  const g = new Group();
  const live: Object3D[] = [];
  const marble = new MeshStandardMaterial({ color: 0xf2ece0, roughness: 0.55 });
  // Two columns and a round arch over them, its crown marked by a gold keystone that shows from straight above.
  const W = 0.36, H = 0.62;
  for (const z of [-W, W]) column(g, box, cyl, marble, kit.m.gold, z, H);
  const spring = FY + 0.06 + H + 0.07;
  const arch = new Mesh(new TorusGeometry(W, 0.06, 8, 24, Math.PI), marble);
  arch.scale.z = 1.6;
  arch.rotation.y = Math.PI / 2;
  g.add(at(arch, 0, spring, 0));
  g.add(at(box(0.16, 0.14, 0.1, kit.m.gold), 0, spring + W + 0.02, 0));
  // Dormant, the arch holds dark stone, just behind where the light stands.
  const shutMat = new MeshStandardMaterial({ color: 0x26303b, roughness: 0.9, transparent: true, side: DoubleSide });
  const shut = at(new Mesh(opening(0.3, spring), shutMat), 0.015, 0, 0);
  live.push(shut);
  // The sheet of light filling the arch, rising from the floor as it lights.
  const sheen = shimmerTex();
  const veil = new MeshBasicMaterial({ map: sheen, transparent: true, opacity: 0.92, side: DoubleSide, depthWrite: false });
  const sheetGeo = opening(0.3, spring);
  sheetGeo.translate(0, -FY, 0);
  const sheet = at(new Mesh(sheetGeo, veil), 0, FY, 0);
  live.push(sheet);
  // A marble ring round a blue pool on the floor, so it reads from straight above.
  const ring = new Mesh(new TorusGeometry(0.42, 0.03, 6, 40), marble);
  ring.rotation.x = Math.PI / 2;
  g.add(at(ring, 0, FY + 0.012, 0));
  // The basin under the pool: dry, dark stone while the portal sleeps.
  const basin = new Mesh(new CircleGeometry(0.42, 40), new MeshStandardMaterial({ color: 0x8a8378, roughness: 0.95 }));
  basin.rotation.x = -Math.PI / 2;
  g.add(at(basin, 0, FY + 0.006, 0));
  const poolMat = new MeshBasicMaterial({
    map: poolTex('rgba(190,235,255,1)', 'rgba(30,120,210,0.95)'), transparent: true, opacity: 0.95, depthWrite: false,
  });
  const pool = new Mesh(new CircleGeometry(0.42, 40), poolMat);
  pool.rotation.x = -Math.PI / 2;
  live.push(at(pool, 0, FY + 0.015, 0));
  // A soft halo of blue light round the arch.
  const haloMat = new MeshBasicMaterial({
    map: poolTex('rgba(150,215,255,0.8)', 'rgba(40,130,220,0.3)'), transparent: true, opacity: 0.7,
    blending: AdditiveBlending, depthWrite: false, side: DoubleSide,
  });
  const halo = new Mesh(new PlaneGeometry(1.1, 1.3), haloMat);
  halo.rotation.y = Math.PI / 2;
  live.push(at(halo, 0.01, spring - 0.05, 0));
  let lit = 1;
  /** The shimmer's own swing, 1 when still. */
  let veilSwing = 0.92, poolSwing = 0.95;
  const paint = () => {
    sheet.visible = pool.visible = halo.visible = lit > 0.001;
    shut.visible = lit < 0.999;
    shutMat.opacity = 1 - lit;
    sheet.scale.y = lit;
    pool.scale.setScalar(Math.max(0.001, lit));
    veil.opacity = veilSwing * lit;
    poolMat.opacity = poolSwing * lit;
    haloMat.opacity = 0.7 * lit;
  };
  return {
    g, live, h: spring + 0.45,
    loop: t => {
      sheen.offset.y = (t * 0.06) % 1;
      veilSwing = 0.86 + 0.08 * Math.sin(t * 1.4);
      poolSwing = 0.85 + 0.1 * Math.sin(t * 1.4 + 1);
      paint();
    },
    light: k => {
      lit = Math.min(1, Math.max(0, k));
      paint();
    },
  };
}
