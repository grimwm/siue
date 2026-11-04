/* The Island of Crete, modern look: the exit, the Aegean Portal. A white marble arch with gold capitals and a gold
 * keystone, filled with a shimmering sheet of Aegean-blue light, over a blue pool in a marble ring on a flagstone,
 * with a row of gold runes along the top of the arch that stay a faint gold while it is lit. Until the last relic is
 * taken it is dormant: its opening dark stone, its basin dry, no light, no runes. `wake(t)` plays its waking
 * (src/modern/portal-wake.ts): the runes trace from the capitals to the crown, the keystone flares, the sheet rises
 * and the pool fills, and motes of light rise from the pool. `light(k)` sets how far it is lit otherwise, as it goes
 * dark again or stands lit or dormant (src/openings.ts). The runes, the flare and the motes are soft glows that face
 * the camera, so they read from straight above as well as low down. Built facing local -x; terrain.ts turns it to
 * face its cell's open side. The shimmer runs through `loop(t)`, which the board never calls when motion is
 * reduced, so the built portal is its still one. */
import {
  CanvasTexture, CircleGeometry, ClampToEdgeWrapping, DoubleSide, Group, Mesh, MeshBasicMaterial, MeshStandardMaterial,
  PlaneGeometry, RepeatWrapping, SRGBColorSpace, Shape, ShapeGeometry, Sprite, SpriteMaterial, TorusGeometry,
  AdditiveBlending,
} from 'three';
import type { Material, Object3D } from 'three';
import { FY } from './floor.ts';
import type { Kit } from './textures.ts';
import { MOTES, RUNE_REST, flareAt, lightAt, moteAt, runeAt } from '../portal-wake.ts';

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
  /** Its waking, `t` ms since it began (src/modern/portal-wake.ts). */
  wake: (t: number) => void;
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

/** The gold runes along the arch. */
const GLYPHS = [
  [[32, 12, 32, 52], [32, 26, 18, 14], [32, 26, 46, 14]],
  [[22, 12, 22, 52], [22, 14, 44, 30], [44, 30, 22, 44]],
  [[18, 52, 32, 12], [32, 12, 46, 52], [22, 36, 42, 36]],
  [[32, 12, 32, 52], [18, 22, 46, 42], [46, 22, 18, 42]],
];

/** Gold rune `n`: strokes in deep gold over a soft warm glow, drawn normally (not added), so it reads on the white
 *  marble. */
function runeTex(n: number): CanvasTexture {
  return canvasTex(64, 64, g => {
    const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,200,80,0.55)');
    gr.addColorStop(1, 'rgba(255,170,40,0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, 64, 64);
    g.strokeStyle = '#b87400';
    g.lineWidth = 6;
    g.lineCap = 'round';
    for (const [x0, y0, x1, y1] of GLYPHS[n]!) {
      g.beginPath();
      g.moveTo(x0!, y0!);
      g.lineTo(x1!, y1!);
      g.stroke();
    }
  });
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
  /** A soft glow `w` across that always faces the camera. */
  const face = (mat: SpriteMaterial, w: number, x: number, y: number, z: number): Sprite => {
    const m = new Sprite(mat);
    m.scale.set(w, w, 1);
    m.visible = false;
    live.push(at(m, x, y, z));
    return m;
  };
  const glow = (map: CanvasTexture) => new SpriteMaterial({
    map, transparent: true, opacity: 0, blending: AdditiveBlending, depthWrite: false,
  });
  // The runes, along the top of the arch from each capital to the crown, so they show from above as well as low down.
  const RUNES = 9;
  const runes: { m: Sprite; u: number }[] = [];
  const glyphs = GLYPHS.map((_, n) => runeTex(n));
  for (const side of [-1, 1]) {
    for (let i = 0; i < RUNES; i++) {
      const u = (i + 0.5) / RUNES, th = u * (Math.PI / 2), R = W + 0.07;
      const map = glyphs[(i + (side > 0 ? RUNES : 0)) % glyphs.length]!;
      const mat = new SpriteMaterial({ map, transparent: true, opacity: 0, depthWrite: false });
      runes.push({ m: face(mat, 0.13, -0.05, spring + Math.sin(th) * R, side * Math.cos(th) * R), u });
    }
  }
  // The keystone's flare, and the motes that rise from the pool.
  const flare = face(glow(poolTex('rgba(255,248,210,1)', 'rgba(255,190,60,0.6)')), 0.5, -0.1, spring + W + 0.02, 0);
  const mote = poolTex('rgba(230,248,255,1)', 'rgba(120,200,255,0.5)');
  const motes = MOTES.map(d => ({ d, m: face(glow(mote), 0.08, d.x, FY, d.z) }));
  const show = (m: Sprite, o: number) => {
    m.material.opacity = o;
    m.visible = o > 0.01;
  };
  let lit = 1;
  /** Ms since the waking began while it plays, else null. */
  let woke: number | null = null;
  /** The shimmer's own swing, 1 when still. */
  let veilSwing = 0.92, poolSwing = 0.95;
  const paint = () => {
    const t = woke;
    const k = t === null ? lit : lightAt(t);
    sheet.visible = pool.visible = halo.visible = k > 0.001;
    shut.visible = k < 0.999;
    shutMat.opacity = 1 - k;
    sheet.scale.y = k;
    pool.scale.setScalar(Math.max(0.001, k));
    veil.opacity = veilSwing * k;
    poolMat.opacity = poolSwing * k;
    haloMat.opacity = 0.7 * k;
    for (const r of runes) show(r.m, t === null ? RUNE_REST * lit : runeAt(t, r.u));
    const f = t === null ? 0 : flareAt(t);
    show(flare, f);
    flare.scale.setScalar(0.25 + 0.5 * f);
    for (const { d, m } of motes) {
      const { o, up } = t === null ? { o: 0, up: 0 } : moteAt(t, d);
      show(m, o);
      if (m.visible) m.position.y = FY + 0.05 + up * d.rise;
    }
  };
  paint();
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
      woke = null;
      paint();
    },
    wake: t => {
      lit = 1;
      woke = Math.max(0, t);
      paint();
    },
  };
}
