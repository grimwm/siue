/* The Island of Crete, modern look: the procedural textures and the shared materials, painted once on canvases
 * from seeded noise, so every visit looks the same. One kit serves every level a board shows. */
import {
  AdditiveBlending, CanvasTexture, ClampToEdgeWrapping, Color, DoubleSide, MeshBasicMaterial, MeshStandardMaterial, PMREMGenerator,
  RepeatWrapping, SRGBColorSpace, Vector2, Vector3,
} from 'three';
import type { Material, Texture, WebGLRenderer } from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

type Ctx = CanvasRenderingContext2D;

export function rng(seed: number): () => number {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

function tex(size: number, draw: (g: Ctx, s: number) => void, srgb = true): CanvasTexture {
  const cv = document.createElement('canvas');
  cv.width = cv.height = size;
  draw(cv.getContext('2d')!, size);
  const t = new CanvasTexture(cv);
  if (srgb) t.colorSpace = SRGBColorSpace;
  t.wrapS = t.wrapT = RepeatWrapping;
  t.anisotropy = 8;
  return t;
}

/** `n` soft spots of colour `rgb`, wrapped across the edges when `wrap`. */
function blobs(g: Ctx, s: number, R: () => number, n: number, rgb: string, a: number, r0: number, r1: number, wrap = true): void {
  for (let i = 0; i < n; i++) {
    const x = R() * s, y = R() * s, rad = r0 + R() * (r1 - r0);
    g.fillStyle = `rgba(${rgb},${(a * (0.3 + 0.7 * R())).toFixed(3)})`;
    const offs = wrap ? [-s, 0, s] : [0];
    for (const ox of offs) for (const oy of offs) {
      if (wrap && (Math.abs(x + ox - s / 2) > s / 2 + rad || Math.abs(y + oy - s / 2) > s / 2 + rad)) continue;
      g.beginPath();
      g.arc(x + ox, y + oy, rad, 0, 7);
      g.fill();
    }
  }
}

/** Darkens a tile toward its edges, so each stone reads as its own. */
function edgeShade(g: Ctx, s: number, a: number): void {
  const gr = g.createRadialGradient(s / 2, s / 2, s * 0.3, s / 2, s / 2, s * 0.72);
  gr.addColorStop(0, 'rgba(0,0,0,0)');
  gr.addColorStop(1, `rgba(20,14,10,${a})`);
  g.fillStyle = gr;
  g.fillRect(0, 0, s, s);
}

function cracks(g: Ctx, s: number, R: () => number, n: number, style: string, width: number, step: number): void {
  g.strokeStyle = style;
  g.lineWidth = width;
  for (let k = 0; k < n; k++) {
    g.beginPath();
    let x = R() * s, y = R() * s;
    g.moveTo(x, y);
    for (let i = 0; i < 6; i++) {
      x += (R() - 0.5) * step;
      y += (R() - 0.5) * step;
      g.lineTo(x, y);
    }
    g.stroke();
  }
}

const flagTex = (seed: number) => tex(256, (g, s) => {
  const R = rng(seed);
  g.fillStyle = '#dcc699';
  g.fillRect(0, 0, s, s);
  blobs(g, s, R, 260, '150,120,80', 0.06, 6, 26, false);
  blobs(g, s, R, 220, '242,226,192', 0.1, 5, 20, false);
  blobs(g, s, R, 1800, '120,96,66', 0.1, 0.6, 2, false);
  blobs(g, s, R, 900, '250,238,212', 0.12, 0.6, 1.6, false);
  cracks(g, s, R, 2, 'rgba(120,94,62,.4)', 1.3, 60);
  edgeShade(g, s, 0.12);
});

const brickTex = () => tex(256, (g, s) => {
  const R = rng(7);
  g.fillStyle = '#15171a';
  g.fillRect(0, 0, s, s);
  const ch = s / 4, bw = s / 2;
  for (let row = 0; row < 4; row++) {
    const off = row % 2 ? bw / 2 : 0;
    for (let i = -1; i < 3; i++) {
      const x = i * bw + off, y = row * ch, v = 0.75 + R() * 0.35;
      g.fillStyle = `rgb(${(90 * v) | 0},${(94 * v) | 0},${(100 * v) | 0})`;
      for (const ox of [0, s]) g.fillRect(x + 3 - ox, y + 3, bw - 6, ch - 6);
    }
  }
  blobs(g, s, R, 1400, '16,18,22', 0.25, 0.7, 2.2);
  blobs(g, s, R, 500, '150,156,166', 0.14, 0.7, 2);
  blobs(g, s, R, 60, '20,22,26', 0.25, 4, 12);
});

const capTex = () => tex(256, (g, s) => {
  const R = rng(11);
  g.fillStyle = '#7a7e86';
  g.fillRect(0, 0, s, s);
  blobs(g, s, R, 200, '26,28,32', 0.2, 6, 24);
  blobs(g, s, R, 1500, '16,18,20', 0.25, 0.6, 2);
  blobs(g, s, R, 600, '140,146,156', 0.12, 0.6, 1.8);
});

function waterNormalTex(): CanvasTexture {
  const S = 128, cv = document.createElement('canvas');
  cv.width = cv.height = S;
  const g = cv.getContext('2d')!, img = g.createImageData(S, S);
  const waves = [[1, 2, 0.3], [3, -1, 1.7], [-2, 3, 4.1], [4, 1, 2.2], [-3, -4, 5.3], [5, -3, 0.9]] as const;
  const h = (x: number, y: number) =>
    waves.reduce((a, [kx, ky, ph], i) => a + Math.sin((2 * Math.PI * (kx * x + ky * y)) / S + ph) / (1 + i * 0.6), 0);
  const n = new Vector3();
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const dx = h(x + 1, y) - h(x - 1, y), dy = h(x, y + 1) - h(x, y - 1);
    n.set(-dx * 1.4, -dy * 1.4, 1).normalize();
    const o = (y * S + x) * 4;
    img.data[o] = (n.x * 0.5 + 0.5) * 255;
    img.data[o + 1] = (n.y * 0.5 + 0.5) * 255;
    img.data[o + 2] = (n.z * 0.5 + 0.5) * 255;
    img.data[o + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  const t = new CanvasTexture(cv);
  t.wrapS = t.wrapT = RepeatWrapping;
  return t;
}

const emberTex = () => tex(256, (g, s) => {
  const R = rng(21);
  g.fillStyle = '#1c120d';
  g.fillRect(0, 0, s, s);
  blobs(g, s, R, 200, '50,30,20', 0.3, 4, 18, false);
  g.lineCap = 'round';
  for (let k = 0; k < 14; k++) {
    g.strokeStyle = `rgba(${(200 + R() * 55) | 0},${(70 + R() * 80) | 0},20,.9)`;
    g.lineWidth = 1 + R() * 2.5;
    g.shadowColor = '#ff6a10';
    g.shadowBlur = 8;
    g.beginPath();
    let x = R() * s, y = R() * s;
    g.moveTo(x, y);
    for (let i = 0; i < 5; i++) {
      x += (R() - 0.5) * 70;
      y += (R() - 0.5) * 70;
      g.lineTo(x, y);
    }
    g.stroke();
  }
  g.shadowBlur = 0;
  edgeShade(g, s, 0.7);
});

const woodTex = () => tex(256, (g, s) => {
  const R = rng(31);
  for (let i = 0; i < 5; i++) {
    const v = 0.85 + R() * 0.25;
    g.fillStyle = `rgb(${(196 * v) | 0},${(150 * v) | 0},${(98 * v) | 0})`;
    g.fillRect((i * s) / 5, 0, s / 5, s);
    g.fillStyle = 'rgba(60,36,18,.6)';
    g.fillRect((i * s) / 5, 0, 2, s);
  }
  for (let k = 0; k < 160; k++) {
    g.strokeStyle = `rgba(90,58,30,${0.08 + R() * 0.15})`;
    g.lineWidth = 0.6 + R();
    const x = R() * s;
    g.beginPath();
    g.moveTo(x, 0);
    g.bezierCurveTo(x + (R() - 0.5) * 8, s * 0.3, x + (R() - 0.5) * 8, s * 0.7, x + (R() - 0.5) * 6, s);
    g.stroke();
  }
});

/** The force floor: dark wood, two gold chevrons pointing up the texture (toward -z on the ground). */
const forceTex = () => tex(256, (g, s) => {
  const R = rng(51);
  g.fillStyle = '#3a2414';
  g.fillRect(0, 0, s, s);
  blobs(g, s, R, 500, '20,12,6', 0.25, 0.6, 2.4, false);
  blobs(g, s, R, 80, '90,60,34', 0.15, 4, 16, false);
  g.strokeStyle = '#d8a640';
  g.lineWidth = 22;
  g.lineJoin = 'miter';
  for (const y of [78, 178]) {
    g.beginPath();
    g.moveTo(40, y + 38);
    g.lineTo(128, y - 34);
    g.lineTo(216, y + 38);
    g.stroke();
  }
  g.strokeStyle = 'rgba(0,0,0,.6)';
  g.lineWidth = 10;
  g.strokeRect(5, 5, s - 10, s - 10);
});

const iceTex = () => tex(256, (g, s) => {
  const R = rng(61);
  g.fillStyle = '#b6dcea';
  g.fillRect(0, 0, s, s);
  blobs(g, s, R, 120, '230,246,252', 0.25, 6, 30, false);
  blobs(g, s, R, 90, '120,170,196', 0.15, 6, 24, false);
  cracks(g, s, R, 6, 'rgba(250,254,255,.8)', 1.6, 90);
  edgeShade(g, s, 0.25);
});

const dirtTex = () => tex(256, (g, s) => {
  const R = rng(71);
  g.fillStyle = '#6a4626';
  g.fillRect(0, 0, s, s);
  blobs(g, s, R, 260, '40,24,12', 0.22, 4, 20, false);
  blobs(g, s, R, 200, '140,98,58', 0.16, 3, 14, false);
  blobs(g, s, R, 2200, '30,18,8', 0.25, 0.6, 2, false);
  blobs(g, s, R, 40, '170,160,150', 0.7, 2, 4.5, false);
  edgeShade(g, s, 0.45);
});

const gravelTex = () => tex(256, (g, s) => {
  const R = rng(81);
  g.fillStyle = '#5e5a54';
  g.fillRect(0, 0, s, s);
  blobs(g, s, R, 1600, '30,28,26', 0.3, 0.8, 3, false);
  blobs(g, s, R, 500, '160,154,146', 0.25, 1, 4, false);
  edgeShade(g, s, 0.45);
});

/** The safe zone's mark, drawn over a flagstone: a laurel wreath round a gold boss, on a clear ground. */
const wreathTex = () => {
  const t = tex(256, (g, s) => {
    g.translate(s / 2, s / 2);
    g.strokeStyle = 'rgba(214,200,160,.55)';
    g.lineWidth = 3;
    g.beginPath();
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2 + 0.3;
      g.lineTo(Math.cos(a) * 112, Math.sin(a) * 112);
    }
    g.closePath();
    g.stroke();
    for (let k = 0; k < 28; k++) {
      const a = (k / 28) * Math.PI * 2;
      g.save();
      g.rotate(a);
      g.translate(76, 0);
      g.rotate(k % 2 ? 0.6 : -0.6);
      g.fillStyle = k % 2 ? '#4f7a3a' : '#3d6a30';
      g.beginPath();
      g.ellipse(0, 0, 14, 6, 0, 0, 7);
      g.fill();
      g.restore();
    }
  });
  t.wrapS = t.wrapT = ClampToEdgeWrapping;
  return t;
};

/** A swirl of blue light for the teleport's disc. */
const swirlTex = () => {
  const t = tex(256, (g, s) => {
    const gr = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    gr.addColorStop(0, '#f2fbff');
    gr.addColorStop(0.35, '#6fc0ef');
    gr.addColorStop(1, '#1a4f9a');
    g.fillStyle = gr;
    g.fillRect(0, 0, s, s);
    g.translate(s / 2, s / 2);
    g.lineCap = 'round';
    for (let arm = 0; arm < 3; arm++) {
      g.strokeStyle = 'rgba(255,255,255,.85)';
      g.lineWidth = 9;
      g.beginPath();
      for (let k = 0; k <= 60; k++) {
        const u = k / 60, a = arm * ((Math.PI * 2) / 3) + u * 4.2, r = 8 + u * 110;
        g.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      g.stroke();
    }
  });
  t.wrapS = t.wrapT = ClampToEdgeWrapping;
  return t;
};

/** The thief's sign: a golden open hand on purple. */
const handTex = () => {
  const t = tex(256, (g, s) => {
    g.fillStyle = '#3a1f52';
    g.fillRect(0, 0, s, s);
    blobs(g, s, rng(91), 300, '20,10,30', 0.3, 1, 4, false);
    g.fillStyle = '#e0a838';
    g.translate(s / 2, s / 2 + 18);
    g.beginPath();
    g.roundRect(-46, -30, 92, 92, 30);
    g.fill();
    for (const [x, len, w] of [[-34, 70, 18], [-12, 92, 19], [12, 96, 19], [35, 78, 18]] as const) {
      g.beginPath();
      g.roundRect(x - w / 2, -30 - len, w, len + 20, w / 2);
      g.fill();
    }
    g.save();
    g.translate(-50, 14);
    g.rotate(-0.8);
    g.beginPath();
    g.roundRect(-11, -58, 22, 66, 11);
    g.fill();
    g.restore();
  });
  t.wrapS = t.wrapT = ClampToEdgeWrapping;
  return t;
};

/** A dressed stone block with a labrys cut in its face, in the Classic block's sandstone. */
const blockTex = () => tex(256, (g, s) => {
  const R = rng(41);
  g.fillStyle = '#ad9f86';
  g.fillRect(0, 0, s, s);
  blobs(g, s, R, 300, '60,52,44', 0.15, 4, 20, false);
  blobs(g, s, R, 1500, '50,44,38', 0.2, 0.6, 2, false);
  cracks(g, s, R, 4, 'rgba(60,50,40,.45)', 2, 40);
  const labrys = (dx: number, dy: number, col: string) => {
    g.save();
    g.translate(s / 2 + dx, s / 2 + dy);
    g.fillStyle = col;
    g.fillRect(-7, -80, 14, 160);
    for (const sx of [-1, 1]) {
      g.beginPath();
      g.moveTo(0, -38);
      g.quadraticCurveTo(sx * 60, -70, sx * 78, -50);
      g.quadraticCurveTo(sx * 58, 0, sx * 78, 50);
      g.quadraticCurveTo(sx * 60, 70, 0, 38);
      g.fill();
    }
    g.restore();
  };
  labrys(3, 3, 'rgba(225,210,185,.35)');
  labrys(0, 0, 'rgba(40,32,26,.4)');
  g.strokeStyle = 'rgba(40,32,26,.6)';
  g.lineWidth = 6;
  g.strokeRect(10, 10, s - 20, s - 20);
});

/** The shade where the floor meets a wall: dark at the top edge, clear by the bottom. */
const aoTex = () => {
  const t = tex(64, (g, s) => {
    const gr = g.createLinearGradient(0, 0, 0, s);
    gr.addColorStop(0, 'rgba(0,0,0,0.85)');
    gr.addColorStop(0.18, 'rgba(0,0,0,0.6)');
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, s, s);
  });
  t.wrapS = t.wrapT = ClampToEdgeWrapping;
  return t;
};

const haloTex = () => {
  const t = tex(64, (g, s) => {
    const gr = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    gr.addColorStop(0, 'rgba(255,220,160,1)');
    gr.addColorStop(0.35, 'rgba(255,150,60,.45)');
    gr.addColorStop(1, 'rgba(255,120,40,0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, s, s);
  });
  t.wrapS = t.wrapT = ClampToEdgeWrapping;
  return t;
};

export type Std = MeshStandardMaterial;
const std = (color: number, o: ConstructorParameters<typeof MeshStandardMaterial>[0] = {}): Std =>
  new MeshStandardMaterial({ color, roughness: 0.8, metalness: 0, ...o });
export const flameMat = (color: number, opacity = 0.9): MeshBasicMaterial =>
  new MeshBasicMaterial({ color, transparent: true, opacity, blending: AdditiveBlending, depthWrite: false });

export type Kit = ReturnType<typeof createKit>;

/** The textures and materials every level shares. `keeps` holds them so a level's teardown leaves them be. */
export function createKit(renderer: WebGLRenderer) {
  const pmrem = new PMREMGenerator(renderer);
  const room = new RoomEnvironment(renderer);
  const env = pmrem.fromScene(room, 0.04).texture;
  room.dispose();
  pmrem.dispose();
  const metal = (color: number, rough = 0.35, o: ConstructorParameters<typeof MeshStandardMaterial>[0] = {}): Std =>
    std(color, { roughness: rough, metalness: 0.85, envMap: env, envMapIntensity: 0.55, ...o });
  const t = {
    brick: brickTex(), cap: capTex(), water: waterNormalTex(), ember: emberTex(), wood: woodTex(), force: forceTex(),
    ice: iceTex(), dirt: dirtTex(), gravel: gravelTex(), wreath: wreathTex(), swirl: swirlTex(), hand: handTex(),
    halo: haloTex(), ao: aoTex(), block: blockTex(), flags: [101, 202, 303].map(flagTex),
  };
  const m = {
    under: std(0x0c0a08, { roughness: 1 }),
    mortar: std(0x6e5c44, { roughness: 1 }),
    ao: new MeshBasicMaterial({ map: t.ao, transparent: true, depthWrite: false }),
    edge: std(0x0c0d10, { roughness: 1, side: DoubleSide }),
    flags: t.flags.map(map => std(0xffffff, { map, roughness: 0.88 })),
    ember: std(0xffffff, { map: t.ember, emissiveMap: t.ember, emissive: 0xff7a30, emissiveIntensity: 0.9, roughness: 0.9 }),
    ice: std(0x9cc4d4, { map: t.ice, roughness: 0.08, metalness: 0.1, envMap: env, envMapIntensity: 0.35 }),
    force: std(0xffffff, { map: t.force, roughness: 0.7 }),
    dirt: std(0xffffff, { map: t.dirt, roughness: 0.97 }),
    gravelBed: std(0xffffff, { map: t.gravel, roughness: 0.95 }),
    pebble: std(0x8a8072, { roughness: 0.9 }),
    water: std(0x1a4a52, {
      roughness: 0.14, metalness: 0.1, normalMap: t.water, normalScale: new Vector2(0.55, 0.55), emissive: 0x06181c,
      envMap: env, envMapIntensity: 0.25,
    }),
    basin: std(0x0e1e20, { roughness: 0.9 }),
    side: std(0xb4b8c0, { map: t.brick, roughness: 0.93 }),
    top: std(0xa4aab2, { map: t.cap, roughness: 0.95 }),
    wood: std(0xffffff, { map: t.wood, roughness: 0.75 }),
    darkWood: std(0x8a6a4a, { map: t.wood, roughness: 0.8 }),
    iron: metal(0x2e2a26, 0.6),
    bronze: metal(0xb47a3a, 0.4),
    gold: metal(0xd8a640, 0.3, { emissive: 0x2a1600 }),
    stone: std(0x8a7c6a),
    paleStone: std(0xcab89a, { roughness: 0.85 }),
    dark: std(0x0a0807),
    glow: new MeshBasicMaterial({ color: 0xff9a40 }),
    keyColor: {
      red: std(0xa8281c, { roughness: 0.5, emissive: 0x200402 }),
      blue: std(0x2a5aa8, { roughness: 0.5, emissive: 0x040a20 }),
      yellow: metal(0xd8a640, 0.3, { emissive: 0x2a1600 }),
      green: std(0x3f7a52, { roughness: 0.45, metalness: 0.3, envMap: env, envMapIntensity: 0.3 }),
    },
    brownButton: std(0x6a3e1e, { roughness: 0.55 }),
    redButton: std(0xb02a1c, { roughness: 0.45, emissive: 0x2a0402 }),
    cream: std(0xe8dcc0, { roughness: 0.6 }),
    wreath: new MeshStandardMaterial({ map: t.wreath, transparent: true, roughness: 0.8, depthWrite: false }),
    swirl: new MeshStandardMaterial({ map: t.swirl, emissiveMap: t.swirl, emissive: new Color(0x6ab8ff), emissiveIntensity: 0.9, roughness: 0.3 }),
    hand: std(0xffffff, { map: t.hand, roughness: 0.6 }),
    clay: std(0xb07448, { roughness: 0.75 }),
    block: std(0xffffff, { map: t.block, roughness: 0.85 }),
    // The figures and the pieces Theseus takes.
    skin: std(0xc08a62, { roughness: 0.7 }),
    tunic: std(0x245e7a, { roughness: 0.8 }),
    cloak: std(0x8a2a1e),
    leather: std(0x5a3a22, { roughness: 0.8 }),
    steel: metal(0xc9cdd0, 0.3),
    fur: std(0x3e2618, { roughness: 0.95 }),
    furDark: std(0x26170f, { roughness: 0.95 }),
    snout: std(0x6a4a36),
    ivory: std(0xe2d6ba, { roughness: 0.5 }),
    kilt: std(0x7a1e16),
    hoof: std(0x141010),
    eye: new MeshBasicMaterial({ color: 0xff4a1a }),
    statue: std(0x8e8c88, { roughness: 0.9 }),
    statueDark: std(0x6a6864, { roughness: 0.92 }),
    parchment: std(0xe2d0a2),
    teal: std(0x2b9a92, { roughness: 0.4 }),
    boot: std(0x8e2a14, { roughness: 0.6 }),
    bootTrim: std(0xe08a20, { emissive: 0x5a2200 }),
    skate: std(0xa8b8c8, { roughness: 0.5 }),
    suction: std(0x2a6a4a, { roughness: 0.55 }),
    mirror: metal(0xe6e6e6, 0.08, { envMapIntensity: 1 }),
    gorgon: std(0x2f7a4a, { roughness: 0.5 }),
    cake: std(0xe0a040, { roughness: 0.6 }),
    hide: std(0xeee6d8, { roughness: 0.7 }),
    patch: std(0x5a3220, { roughness: 0.8 }),
    feather: std(0x6a4426, { roughness: 0.85 }),
    halo: t.halo,
    env,
  };
  const keeps = new Set<Material | Texture>([env, ...t.flags, ...Object.values(t).filter((x): x is CanvasTexture => x instanceof CanvasTexture)]);
  for (const v of Object.values(m)) {
    if (v && typeof v === 'object' && 'isMaterial' in v) keeps.add(v as Material);
    else if (Array.isArray(v)) v.forEach(x => keeps.add(x));
  }
  for (const v of Object.values(m.keyColor)) keeps.add(v);
  const dispose = () => { for (const k of keeps) k.dispose(); };
  return { t, m, metal, std, keeps, dispose };
}
