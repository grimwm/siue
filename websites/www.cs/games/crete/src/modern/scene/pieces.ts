/* The Island of Crete, modern look: the piece models, one per object and hazard sprite and one for the cow Theseus
 * sets down, each in the colour and shape of its Classic sprite. A model stands at its cell's centre on the
 * floor and faces +z (down the board) until it is turned; its static parts are merged by material, and flames
 * that loop stay apart, moved by `userData.loop(t)`. Every object and hazard is sized to fill most of its cell, as
 * Classic's sprites do, so it can be named at the whole-level view: about 0.8 of a cell across, never past its
 * cell. One that reads best face-on (a relic, a key, the mirror, boots) leans back toward the camera, every one
 * wears the figures' thin dark rim and stands on a dark disc that parts it from the pale floor. */
import { CircleGeometry, ConeGeometry, ExtrudeGeometry, Group, LatheGeometry, Mesh, RingGeometry, Shape, SphereGeometry, TorusGeometry, Vector2 } from 'three';
import type { Material, Object3D } from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import type { PieceModel } from '../model-names.ts';
import { FY } from './floor.ts';
import { at, box, cyl, flat, outlined, piece } from './terrain.ts';
import type { PieceInfo } from './terrain.ts';
import { flameMat } from './textures.ts';
import { variant } from '../variants.ts';
import type { Kit } from './textures.ts';

const sph = (r: number, mat: Material, ws = 16, hs = 12) => new Mesh(new SphereGeometry(r, ws, hs), mat);
/** A flat outline, extruded `depth` thick and centred on its depth. */
function slab(pts: readonly (readonly [number, number])[], depth: number, mat: Material): Mesh {
  const sh = new Shape();
  sh.moveTo(pts[0]![0], pts[0]![1]);
  for (const [x, y] of pts.slice(1)) sh.lineTo(x, y);
  sh.closePath();
  const geo = new ExtrudeGeometry(sh, { depth, bevelEnabled: false, curveSegments: 6 });
  geo.translate(0, 0, -depth / 2);
  return new Mesh(geo, mat);
}

/** `g`, built standing on the floor, at `scale` times its size and leaned back `lean` radians about its foot so its
 *  face turns up toward the camera, its middle kept over the cell's centre; then baked (with `live` left apart) and
 *  rimmed. `info` is its size as built. */
function sized(kit: Kit, g: Group, info: PieceInfo, scale: number, lean = 0, live: Object3D[] = []): Group {
  const H = info.h * scale;
  g.position.y -= FY;
  const tilt = new Group();
  tilt.position.set(0, FY, (H / 2) * Math.sin(lean));
  tilt.rotation.x = -lean;
  tilt.scale.setScalar(scale);
  tilt.add(g);
  const out = new Group();
  out.add(tilt);
  return outlined(kit, piece(out, { ...info, half: Math.max(info.half * scale, (H / 2) * Math.sin(lean)), h: H * Math.cos(lean), back: H * Math.sin(lean) / 2 }, live));
}

/** A plate's radius and the width of its bright ring, in cells. */
const PLATE_R = 0.45;
const PLATE_RING = 0.035;
/** `mesh` laid flat `y` above the floor, kept out of the bake. */
function flatOn(mesh: Mesh, y: number): Mesh {
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = FY + y;
  mesh.userData.live = true;
  return mesh;
}
/** The dark disc under an object or a hazard that parts it from the pale floor. */
const shade = (kit: Kit, r = 0.42): Mesh => flatOn(new Mesh(new CircleGeometry(r, 32), kit.m.itemShade), 0.006);

/** An object Theseus can take: `sized`, on a dark disc; on plates (variants.ts) a little larger, with a bright ring
 *  round the disc. */
function item(kit: Kit, g: Group, info: PieceInfo, scale: number, lean = 0): Group {
  const plate = variant().items === 'plate';
  // On a plate the bright ring sits on the disc's edge, a thin line: the disc shows inside it, not round it.
  const live = [shade(kit, plate ? PLATE_R : 0.42)];
  if (plate) live.push(flatOn(new Mesh(new RingGeometry(PLATE_R - PLATE_RING, PLATE_R, 48), kit.m.itemRing), 0.008));
  return sized(kit, g, info, plate ? scale * 1.12 : scale, lean, live);
}

/** The relic: a golden labrys on a dark pole. */
function relic(kit: Kit): Group {
  const { m } = kit;
  const g = new Group();
  g.add(at(cyl(0.11, 0.13, 0.04, m.bronze, 18), 0, FY + 0.02, 0));
  g.add(at(cyl(0.02, 0.022, 0.66, m.darkWood, 8), 0, FY + 0.35, 0));
  g.add(at(sph(0.03, m.gold, 10, 8), 0, FY + 0.7, 0));
  for (const sx of [-1, 1]) {
    const blade = slab([[0.02, 0.05], [0.12, 0.08], [0.21, 0.17], [0.16, 0], [0.21, -0.17], [0.12, -0.08], [0.02, -0.05]]
      .map(([x, y]) => [sx * x!, y!] as const), 0.03, m.gold);
    g.add(at(blade, 0, FY + 0.5, 0));
  }
  g.add(at(cyl(0.035, 0.035, 0.12, m.gold, 10), 0, FY + 0.5, 0));
  return item(kit, g, { half: 0.22, h: 0.72 }, 1.2, 0.85);
}

/** A key: a bronze shaft and bit, its bow and the gem in it in the key's colour, standing aslant. */
function key(kit: Kit, color: 'red' | 'blue' | 'yellow' | 'green'): Group {
  const { m } = kit;
  const k = new Group();
  k.add(at(new Mesh(new TorusGeometry(0.075, 0.03, 10, 20), m.keyColor[color]), 0, 0.2, 0));
  k.add(flat(at(cyl(0.05, 0.05, 0.034, m.keyColor[color], 16), 0, 0.2, 0)));
  k.add(at(box(0.035, 0.24, 0.03, m.bronze), 0, 0, 0));
  k.add(at(box(0.07, 0.03, 0.03, m.bronze), 0.035, -0.08, 0));
  k.add(at(box(0.05, 0.03, 0.03, m.bronze), 0.025, -0.03, 0));
  k.position.y = FY + 0.2;
  k.rotation.z = 0.25;
  const g = new Group();
  g.add(k);
  return item(kit, g, { half: 0.12, h: 0.42 }, 2.05, 1.1);
}

function flippers(kit: Kit): Group {
  const { m } = kit;
  const g = new Group();
  const sh = new Shape();
  sh.moveTo(0, 0);
  sh.bezierCurveTo(0.08, 0.02, 0.1, 0.2, 0.07, 0.32);
  sh.lineTo(-0.07, 0.32);
  sh.bezierCurveTo(-0.1, 0.2, -0.08, 0.02, 0, 0);
  const geo = new ExtrudeGeometry(sh, { depth: 0.025, bevelEnabled: false });
  for (const sx of [-1, 1]) {
    const f = new Mesh(geo, m.teal);
    f.rotation.x = -Math.PI / 2 + 0.35;
    f.rotation.z = sx * 0.2;
    f.position.set(sx * 0.1, FY + 0.03, 0.14);
    g.add(f);
    g.add(at(box(0.1, 0.07, 0.1, m.teal), sx * 0.1, FY + 0.06, 0.14));
  }
  return item(kit, g, { half: 0.24, h: 0.2 }, 1.8);
}

/** A pair of boots, `boot` with a `trim` at the top; `under` adds a sole of its own (a blade, a cup). */
function boots(kit: Kit, boot: Material, trim: Material, under?: (b: Group) => number): Group {
  const g = new Group();
  for (const sx of [-1, 1]) {
    const b = new Group();
    const lift = under?.(b) ?? 0;
    b.add(at(box(0.09, 0.2, 0.09, boot), 0, lift + 0.12, 0));
    b.add(at(box(0.09, 0.06, 0.17, boot), 0, lift + 0.03, 0.04));
    b.add(at(box(0.1, 0.045, 0.1, trim), 0, lift + 0.225, 0));
    b.position.set(sx * 0.09, FY, 0);
    b.rotation.y = sx * 0.2;
    g.add(b);
  }
  return g;
}

function fireBoots(kit: Kit): Group {
  const { m } = kit;
  const g = boots(kit, m.boot, m.bootTrim, b => {
    b.add(at(new Mesh(new ConeGeometry(0.025, 0.07, 6), m.gold), 0, 0.11, 0.05));
    return 0;
  });
  return item(kit, g, { half: 0.2, h: 0.28 }, 1.9, 0.7);
}

function skates(kit: Kit): Group {
  const { m } = kit;
  const g = boots(kit, m.skate, m.cream, b => {
    b.add(at(box(0.02, 0.05, 0.24, m.steel), 0, 0.025, 0.04));
    for (const z of [-0.04, 0.12]) b.add(at(box(0.03, 0.03, 0.03, m.steel), 0, 0.05, z));
    return 0.05;
  });
  return item(kit, g, { half: 0.2, h: 0.32 }, 1.8, 0.7);
}

function suction(kit: Kit): Group {
  const { m } = kit;
  const g = boots(kit, m.suction, m.bootTrim, b => {
    b.add(at(cyl(0.1, 0.07, 0.035, m.bronze, 18), 0, 0.018, 0.03));
    return 0.035;
  });
  return item(kit, g, { half: 0.22, h: 0.3 }, 1.8, 0.7);
}

/** Medusa's mirror: a bronze hand mirror with the Gorgon's green head on its face. */
function mirror(kit: Kit): Group {
  const { m } = kit;
  const g = new Group();
  const face = new Group();
  face.position.set(0, FY + 0.32, 0);
  face.rotation.x = -0.25;
  face.add(flat(cyl(0.13, 0.13, 0.02, m.mirror, 28)));
  face.add(new Mesh(new TorusGeometry(0.13, 0.02, 8, 28), m.bronze));
  const head = at(sph(0.045, m.gorgon, 12, 10), 0, 0, 0.012);
  head.scale.z = 0.5;
  face.add(head);
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    face.add(at(sph(0.014, m.gorgon, 6, 5), Math.cos(a) * 0.08, Math.sin(a) * 0.08, 0.012));
  }
  g.add(face);
  g.add(at(cyl(0.018, 0.025, 0.2, m.bronze, 8), 0, FY + 0.1, 0));
  g.add(at(cyl(0.08, 0.09, 0.025, m.bronze), 0, FY + 0.012, 0));
  return item(kit, g, { half: 0.18, h: 0.48 }, 1.55, 0.9);
}

/** The honey cake: golden, iced, studded round, on a bronze plate. */
function cake(kit: Kit): Group {
  const { m } = kit;
  const g = new Group();
  g.add(at(cyl(0.24, 0.22, 0.03, m.bronze, 24), 0, FY + 0.015, 0));
  g.add(at(cyl(0.17, 0.19, 0.16, m.cake, 24), 0, FY + 0.11, 0));
  g.add(at(cyl(0.165, 0.17, 0.02, m.cream, 24), 0, FY + 0.2, 0));
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    g.add(at(sph(0.022, m.cream, 8, 6), Math.cos(a) * 0.12, FY + 0.215, Math.sin(a) * 0.12));
  }
  g.add(at(sph(0.035, m.cake, 10, 8), 0, FY + 0.22, 0));
  return item(kit, g, { half: 0.24, h: 0.26 }, 1.4, 0.35);
}

/** Daedalus's wooden cow: a white, brown-patched cow on a wheeled cart, its head to +x. */
function cow(kit: Kit, scale: number, lean = 0, taken = false): Group {
  const { m } = kit;
  const c = new Group();
  c.add(at(box(0.56, 0.05, 0.3, m.wood), 0, 0.1, 0));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    c.add(flat(at(cyl(0.07, 0.07, 0.03, m.darkWood, 14), sx * 0.2, 0.07, sz * 0.165)));
    c.add(at(cyl(0.028, 0.025, 0.14, m.hide, 8), sx * 0.16, 0.18, sz * 0.08));
  }
  c.add(at(new Mesh(new RoundedBoxGeometry(0.46, 0.22, 0.24, 2, 0.05), m.hide), 0, 0.34, 0));
  for (const [x, z, sy, sz] of [[-0.1, 0, 0.3, 1], [0.1, 0.05, 0.3, 1], [-0.04, 0.12, 1, 0.3], [0.12, -0.12, 1, 0.3], [-0.14, -0.12, 1, 0.3]] as const) {
    const p = at(sph(0.075, m.patch, 10, 8), x, sz === 1 ? 0.44 : 0.35, z);
    p.scale.set(1, sy, sz);
    c.add(p);
  }
  c.add(at(new Mesh(new RoundedBoxGeometry(0.14, 0.15, 0.15, 2, 0.03), m.hide), 0.29, 0.43, 0));
  c.add(at(box(0.06, 0.08, 0.12, m.snout), 0.37, 0.4, 0));
  for (const sz of [-1, 1]) {
    const horn = at(new Mesh(new ConeGeometry(0.02, 0.08, 6), m.ivory), 0.28, 0.53, sz * 0.06);
    horn.rotation.x = sz * 0.5;
    c.add(horn);
  }
  const tail = at(cyl(0.012, 0.012, 0.16, m.patch, 6), -0.25, 0.36, 0);
  tail.rotation.z = -0.4;
  c.add(tail);
  c.position.y = FY;
  c.rotation.y = 0.5;
  const g = new Group();
  g.add(c);
  return (taken ? item : sized)(kit, g, { half: 0.32, h: 0.56 }, scale, lean);
}

/** A story page: a rolled scroll tied with a red band. */
function page(kit: Kit): Group {
  const { m } = kit;
  const g = new Group();
  g.add(at(box(0.26, 0.008, 0.14, m.parchment), 0.02, FY + 0.006, 0.08));
  const roll = at(cyl(0.06, 0.06, 0.34, m.parchment, 14), 0, FY + 0.06, -0.02);
  roll.rotation.z = Math.PI / 2;
  g.add(roll);
  for (const sx of [-1, 1]) {
    const end = at(cyl(0.035, 0.035, 0.012, m.darkWood, 10), sx * 0.172, FY + 0.06, -0.02);
    end.rotation.z = Math.PI / 2;
    g.add(end);
  }
  const band = at(cyl(0.064, 0.064, 0.05, m.cloak, 14), -0.08, FY + 0.06, -0.02);
  band.rotation.z = Math.PI / 2;
  g.add(band);
  g.rotation.y = 0.3;
  return item(kit, g, { half: 0.2, h: 0.14 }, 1.9, 0.5);
}

function block(kit: Kit): Group {
  const g = new Group();
  g.add(at(new Mesh(new RoundedBoxGeometry(0.84, 0.8, 0.84, 3, 0.05), kit.m.block), 0, FY + 0.4, 0));
  return piece(g, { half: 0.42, h: 0.9 });
}

/** The bronze ball: a riveted bronze sphere, banded round its middle and over its top. */
function ball(kit: Kit): Group {
  const { m } = kit;
  const g = new Group();
  const y = FY + 0.22;
  g.add(at(sph(0.22, m.bronze, 24, 16), 0, y, 0));
  const band = at(new Mesh(new TorusGeometry(0.222, 0.012, 6, 32), m.gold), 0, y, 0);
  band.rotation.y = Math.PI / 2;
  g.add(band);
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    g.add(at(sph(0.022, m.gold, 6, 5), Math.cos(a) * 0.222, y, Math.sin(a) * 0.222));
    if (i % 2 === 0) g.add(at(sph(0.02, m.gold, 6, 5), 0, y + Math.cos(a + 0.3) * 0.224, Math.sin(a + 0.3) * 0.224));
  }
  return sized(kit, g, { half: 0.24, h: 0.46 }, 1.45, 0, [shade(kit)]);
}

/** The Harpy: a brown bird with a woman's pale face, wings spread wide, hanging above the floor. */
function glider(kit: Kit): Group {
  const { m } = kit;
  const g = new Group();
  const y = FY + 0.4;
  const body = at(sph(0.12, m.feather, 16, 12), 0, y, -0.02);
  body.scale.set(0.9, 1.15, 0.85);
  g.add(body);
  g.add(at(sph(0.075, m.skin, 14, 10), 0, y + 0.17, 0.03));
  const hair = at(sph(0.082, m.furDark, 14, 8), 0, y + 0.19, 0.01);
  hair.scale.set(1, 0.8, 1);
  g.add(hair);
  for (const sx of [-1, 1]) {
    g.add(at(sph(0.012, m.dark, 6, 5), sx * 0.028, y + 0.18, 0.1));
    const wing = slab([[0.06, 0.08], [0.24, 0.16], [0.4, 0.14], [0.38, 0.06], [0.33, 0.08], [0.33, -0.01], [0.26, 0.02],
      [0.24, -0.08], [0.17, -0.03], [0.12, -0.1], [0.06, -0.04]].map(([x, yy]) => [sx * x!, yy!] as const), 0.025, m.feather);
    wing.position.set(0, y + 0.04, -0.04);
    wing.rotation.x = -0.9;
    g.add(wing);
    g.add(at(cyl(0.014, 0.012, 0.16, m.bootTrim, 6), sx * 0.04, y - 0.18, 0.02));
  }
  const tail = at(new Mesh(new ConeGeometry(0.06, 0.16, 6), m.feather), 0, y - 0.1, -0.12);
  tail.rotation.x = -2.4;
  g.add(tail);
  return sized(kit, g, { half: 0.36, h: 0.66 }, 1.05, 0, [shade(kit)]);
}

const FIREBALL_SCALE = 1.35;
/** Talos's fire: a burning ball of flame on the floor, flickering. */
function fireball(kit: Kit): Group {
  const g = new Group();
  g.add(at(sph(0.13, kit.m.bootTrim, 12, 8), 0, FY + 0.14, 0));
  const flames: Mesh[] = [];
  const core = at(sph(0.16, flameMat(0xd04010, 0.5), 16, 12), 0, FY + 0.17, 0);
  flames.push(core);
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2, h = 0.24 + (i % 3) * 0.06;
    const f = at(new Mesh(new ConeGeometry(0.08, h, 7), flameMat(i % 2 ? 0xc83a0c : 0xd86818, 0.7)), Math.cos(a) * 0.12, FY + h / 2 + 0.04, Math.sin(a) * 0.12);
    f.rotation.z = -Math.cos(a) * 0.3;
    f.rotation.x = Math.sin(a) * 0.3;
    flames.push(f);
  }
  // The flames stay out of the bake, so they can flicker, and out of the rim.
  const fire = new Group();
  for (const f of flames) f.position.y -= FY;
  fire.add(...flames);
  fire.position.y = FY;
  fire.scale.setScalar(FIREBALL_SCALE);
  fire.userData.live = true;
  const out = sized(kit, g, { half: 0.26, h: 0.5 }, FIREBALL_SCALE, 0, [fire, shade(kit)]);
  (out.userData as PieceInfo).loop = t => flames.forEach((f, i) => f.scale.set(1, 1 + 0.15 * Math.sin(t * (7 + i) + i * 1.7), 1));
  return out;
}

export const PIECE_MODELS: Record<PieceModel, (kit: Kit) => Object3D> = {
  relic,
  'key-red': k => key(k, 'red'),
  'key-blue': k => key(k, 'blue'),
  'key-yellow': k => key(k, 'yellow'),
  'key-green': k => key(k, 'green'),
  flippers,
  'fire-boots': fireBoots,
  skates,
  suction,
  mirror,
  cake,
  cow: k => cow(k, 1.1, 0.35, true),
  'cow-standing': k => cow(k, 1.1),
  page,
  block,
  ball,
  glider,
  fireball,
};
