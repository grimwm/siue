/* The Island of Crete, modern look: the figures, and everything that stands on the board (src/modern/model-names.ts
 * `placed`): Theseus, the Minotaur, the Minotaur turned to stone, and the pieces from pieces.ts. Each stands where
 * the state and the turn's figures put it, between cells while it moves, and turns to face along its last step,
 * easing round unless motion is reduced. A thing keeps its model from frame to frame by its id, or, when it has
 * none (a hazard, a sliding block), by its model and the nearest place it stood. Theseus, the Minotaur, the items
 * and the hazards carry a floating marker (src/modern/markers.ts) over them. */
import { CatmullRomCurve3, ConeGeometry, CylinderGeometry, Group, Mesh, ReplaceStencilOp, RingGeometry, SphereGeometry, TorusGeometry, TubeGeometry, Vector3 } from 'three';
import type { Material, Object3D } from 'three';
import type { Dir } from '../../puzzle/tiles.ts';
import type { FigureModel, PieceModel, Placed } from '../model-names.ts';
import { FIGURE_MODEL_NAMES } from '../model-names.ts';
import { markerFor } from '../markers.ts';
import { variant } from '../variants.ts';
import { FY, cellX, cellZ } from './floor.ts';
import type { MarkerSet } from './markers.ts';
import { PIECE_MODELS } from './pieces.ts';
import { at, box, cyl, disposeModel, outlined, piece } from './terrain.ts';
import type { PieceInfo } from './terrain.ts';
import type { Kit } from './textures.ts';
import type { Seen } from './walls.ts';

const sph = (r: number, mat: Material, ws = 16, hs = 12) => new Mesh(new SphereGeometry(r, ws, hs), mat);
/** Built with its feet at 0 and stood on the floor at `scale` times the sample's size, with a thin dark rim round
 *  it (`outlined`). `live` stays out of the bake. */
function stand(kit: Kit, g: Group, info: PieceInfo, scale = 1.3, live: Object3D[] = []): Group {
  g.scale.setScalar(scale);
  g.position.y = FY;
  const out = new Group();
  out.add(g);
  return outlined(kit, piece(out, info, live));
}

/** The beacon (variants.ts): a column of green light over Theseus, over the walls, and his shape in green where
 *  something stands in front of him. */
function beacon(kit: Kit, hero: Group, top: number): void {
  const ghosts: Mesh[] = [];
  for (const c of hero.children) {
    if (!(c instanceof Mesh) || c.userData.live || c.material === kit.m.outline) continue;
    // He marks the stencil where he shows, so his outline draws only where something else hides him.
    const mat = c.material as Material;
    mat.stencilWrite = true;
    mat.stencilRef = 1;
    mat.stencilZPass = ReplaceStencilOp;
    const ghost = new Mesh(c.geometry, kit.m.heroXray);
    ghost.renderOrder = 20;
    ghost.userData.live = true;
    ghosts.push(ghost);
  }
  // The beam rises from just over his head, so it never tints him.
  const beam = new Mesh(new CylinderGeometry(0.16, 0.24, 2.2, 24, 1, true), kit.m.heroBeam);
  beam.position.y = FY + top + 0.25 + 1.1;
  beam.renderOrder = 21;
  beam.userData.live = true;
  hero.add(...ghosts, beam);
}

/** Theseus's size against the other figures: a little larger, so the eye finds him first. */
const HERO_SCALE = 1.45;

/** Theseus: a bright blue tunic, a red cloak, a round bronze shield and a short sword, a little larger than the
 *  others, on a green ring with a dark edge. */
function theseus(kit: Kit): Group {
  const { m } = kit;
  const g = new Group();
  for (const sx of [-1, 1]) {
    g.add(at(cyl(0.045, 0.04, 0.28, m.heroSkin), sx * 0.065, 0.14, 0));
    g.add(at(box(0.07, 0.05, 0.12, m.heroLeather), sx * 0.065, 0.025, 0.02));
  }
  g.add(at(cyl(0.13, 0.2, 0.22, m.heroTunic), 0, 0.35, 0));
  g.add(at(cyl(0.155, 0.13, 0.22, m.heroTunic), 0, 0.55, 0));
  g.add(at(cyl(0.16, 0.16, 0.035, m.heroLeather), 0, 0.45, 0));
  const cloak = at(box(0.3, 0.44, 0.03, m.heroCloak), 0, 0.44, -0.14);
  cloak.rotation.x = 0.12;
  g.add(cloak);
  for (const sx of [-1, 1]) {
    const a = at(cyl(0.04, 0.035, 0.26, m.heroSkin), sx * 0.19, 0.5, 0.02);
    a.rotation.z = sx * 0.18;
    g.add(a);
  }
  g.add(at(sph(0.095, m.heroSkin), 0, 0.75, 0));
  g.add(at(new Mesh(new SphereGeometry(0.103, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), m.heroHair), 0, 0.765, -0.012));
  const shield = at(cyl(0.15, 0.15, 0.03, m.bronze, 24), -0.26, 0.5, 0.04);
  shield.rotation.z = Math.PI / 2;
  g.add(shield);
  const boss = at(cyl(0.06, 0.06, 0.035, m.heroCloak, 16), -0.275, 0.5, 0.04);
  boss.rotation.z = Math.PI / 2;
  g.add(boss);
  const sword = at(box(0.03, 0.34, 0.012, m.steel), 0.23, 0.5, 0.1);
  sword.rotation.x = 0.5;
  g.add(sword);
  g.add(at(box(0.09, 0.02, 0.03, m.bronze), 0.23, 0.37, 0.03));
  const flat = (inner: number, outer: number, mat: Material, y: number) => {
    const r = new Mesh(new RingGeometry(inner, outer, 48), mat);
    r.rotation.x = -Math.PI / 2;
    r.position.y = FY + y;
    r.userData.live = true;
    return r;
  };
  const ring = [flat(0.33, 0.47, m.heroRingEdge, 0.01), flat(0.36, 0.44, m.heroRing, 0.012)];
  const hero = stand(kit, g, { half: 0.26 * HERO_SCALE / 1.3, h: 1.2 * HERO_SCALE / 1.3 }, HERO_SCALE, ring);
  if (variant().beacon) beacon(kit, hero, (hero.userData as PieceInfo).h);
  return hero;
}

/** How far the Minotaur's body leans in over his hips toward whoever he faces, in radians. */
const MINOTAUR_LEAN = 0.24;

/** The Minotaur with his labrys: fur, a red kilt and ivory horns, or all grey stone while the mirror holds him.
 *  He stands tall on long legs, broad in the chest and shoulders over a narrow waist, leaning in with his head
 *  low and thrust forward under wide horns, so he fills a doorway's height and a cell's width and reads from
 *  above as shoulders and horns. Built 1.25 tall from hoof to horn tip, stood at 1.3 times that. */
function minotaur(kit: Kit, stone: boolean): Group {
  const { m } = kit;
  const s = (mat: Material) => (stone ? m.statue : mat);
  const fur = s(m.fur), furDark = stone ? m.statueDark : m.furDark;
  const g = new Group();
  // Legs: long, spread, one hoof a little ahead of the other.
  for (const sx of [-1, 1]) {
    const dz = sx * -0.05;
    g.add(at(cyl(0.06, 0.068, 0.05, s(m.hoof)), sx * 0.13, 0.025, dz + 0.01));
    const shin = at(cyl(0.05, 0.06, 0.26, fur), sx * 0.125, 0.18, dz);
    shin.rotation.z = sx * 0.04;
    g.add(shin);
    const thigh = at(cyl(0.09, 0.062, 0.26, fur), sx * 0.11, 0.42, dz * 0.6);
    thigh.rotation.z = -sx * 0.1;
    g.add(thigh);
  }
  g.add(at(cyl(0.15, 0.2, 0.14, s(m.kilt)), 0, 0.54, 0));
  const belt = at(new Mesh(new TorusGeometry(0.155, 0.02, 8, 24), s(m.gold)), 0, 0.605, 0);
  belt.rotation.x = Math.PI / 2;
  g.add(belt);
  // Everything above the belt leans in over the hips.
  const up = at(new Group(), 0, 0.6, 0);
  up.rotation.x = MINOTAUR_LEAN;
  g.add(up);
  up.add(at(cyl(0.21, 0.15, 0.2, fur), 0, 0.09, 0));
  const chest = at(sph(0.25, fur), 0, 0.29, 0.01);
  chest.scale.set(1.42, 0.85, 0.92);
  up.add(chest);
  const hump = at(sph(0.17, furDark), 0, 0.42, -0.06);
  hump.scale.set(1.5, 0.66, 1);
  up.add(hump);
  for (const sx of [-1, 1]) {
    up.add(at(sph(0.12, fur), sx * 0.29, 0.39, 0));
    const upper = at(cyl(0.088, 0.072, 0.26, fur), sx * 0.325, 0.24, 0.01);
    upper.rotation.z = sx * 0.1;
    up.add(upper);
    const fore = at(cyl(0.074, 0.06, 0.24, fur), sx * 0.335, 0.04, 0.07);
    fore.rotation.x = -0.45;
    up.add(fore);
    up.add(at(sph(0.072, furDark), sx * 0.33, -0.08, 0.13));
    up.add(at(cyl(0.076, 0.076, 0.035, s(m.gold)), sx * 0.33, 0.14, 0.03));
  }
  // The head: low and forward between the shoulders, bowed, the horns sweeping out and up past the shoulders.
  const head = at(new Group(), 0, 0.45, 0.13);
  head.rotation.x = 0.3;
  up.add(head);
  const skull = sph(0.125, furDark);
  skull.scale.set(1.05, 0.95, 1.15);
  head.add(skull);
  const snout = at(sph(0.085, s(m.snout)), 0, -0.05, 0.12);
  snout.scale.set(1.1, 0.8, 0.95);
  head.add(snout);
  head.add(at(new Mesh(new TorusGeometry(0.035, 0.008, 6, 16), s(m.gold)), 0, -0.1, 0.19));
  for (const sx of [-1, 1]) {
    head.add(at(sph(0.02, stone ? m.statueDark : m.eye, 8, 6), sx * 0.065, 0.03, 0.115));
    const ear = at(sph(0.04, furDark), sx * 0.14, 0.02, -0.03);
    ear.scale.set(1.3, 0.6, 0.8);
    head.add(ear);
    const curve = new CatmullRomCurve3([
      new Vector3(sx * 0.08, 0.06, 0), new Vector3(sx * 0.24, 0.07, -0.03), new Vector3(sx * 0.37, 0.15, 0.01), new Vector3(sx * 0.42, 0.3, 0.1),
    ]);
    head.add(new Mesh(new TubeGeometry(curve, 20, 0.036, 8), s(m.ivory)));
    const tip = at(new Mesh(new ConeGeometry(0.036, 0.11, 8), s(m.ivory)), sx * 0.425, 0.36, 0.125);
    tip.rotation.x = 0.35;
    tip.rotation.z = -sx * 0.15;
    head.add(tip);
  }
  // The labrys, gripped in his right fist and held up across him.
  const ax = new Group();
  ax.add(cyl(0.02, 0.02, 1.0, s(m.iron), 8));
  for (const sx of [-1, 1]) {
    const blade = new Mesh(new CylinderGeometry(0.17, 0.17, 0.022, 24, 1, false, 0, Math.PI), s(m.steel));
    blade.rotation.z = Math.PI / 2;
    blade.rotation.y = sx > 0 ? 0 : Math.PI;
    blade.position.set(0, 0.36, 0);
    blade.scale.set(1, 1, 0.8);
    ax.add(blade);
  }
  ax.rotation.set(-0.12, Math.PI / 2, 0);
  ax.position.set(0.33, 0.1, 0.13);
  up.add(ax);
  return stand(kit, g, { half: 0.42, h: 1.6 });
}

export const FIGURE_MODELS: Record<FigureModel, (kit: Kit) => Object3D> = {
  theseus,
  minotaur: k => minotaur(k, false),
  'minotaur-stone': k => minotaur(k, true),
};

const MODELS: Record<PieceModel | FigureModel, (kit: Kit) => Object3D> = { ...PIECE_MODELS, ...FIGURE_MODELS };
const FACES = new Set<string>([...FIGURE_MODEL_NAMES, 'ball', 'glider', 'fireball']);
/** The turn toward a grid direction: a model faces +z, which is down the board. */
const DIR_YAW: Record<Dir, number> = { down: 0, up: Math.PI, right: Math.PI / 2, left: -Math.PI / 2 };
/** How far a thing without an id may have gone since the last frame and still be the same thing, in cells. */
const SAME_REACH = 1.5;
/** The time constant of a turn to face a new way, in seconds. */
const TURN_TAU = 0.05;
/** A clone machine's template stands on the machine's lid, smaller. */
const ON_MACHINE = { y: 0.37, scale: 0.7 };

interface Actor {
  model: PieceModel | FigureModel; id: string | null; obj: Object3D; marker: Mesh | null; foot: Vector3; r: number; c: number; yaw: number; goal: number;
  /** How high it stands: on the floor, or on a machine. */
  y: number;
}

export interface Actors {
  readonly group: Group;
  /** Stands the things placed on a board `cols` × `rows`; true when any moved, turned, came or went. */
  set(list: readonly Placed[], cols: number, rows: number, snap: boolean): boolean;
  /** Eases each turn toward its way; true while any is still turning. */
  ease(dt: number, snap: boolean): boolean;
  /** What the walls should not hide: Theseus, and everything else. */
  seen(): { hero: Seen | null; rest: Seen[] };
  /** Theseus, where he stands. */
  hero(): Object3D | null;
  /** Moves the flames to loop time `t` seconds. */
  loop(t: number): void;
  /** Where the things that loop stand, to tell whether one is on screen. */
  looping(): Object3D[];
  clear(): void;
  dispose(): void;
}

const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

/** `markers` makes the floating markers. */
export function createActors(kit: Kit, markers: MarkerSet): Actors {
  const group = new Group();
  let actors: Actor[] = [];

  const markerOf = (p: Placed, foot: Vector3, obj: Object3D) => {
    const kind = markerFor(p);
    const info = obj.userData as PieceInfo;
    return kind ? markers.make(kind, foot, info.h, info.back ?? 0) : null;
  };
  /** Where its marker hangs from: the floor under it. */
  function lift(a: Actor): void {
    a.foot.set(a.obj.position.x, FY + a.y, a.obj.position.z);
  }
  function model(p: Placed): Object3D {
    const obj = MODELS[p.model](kit);
    if (p.id?.startsWith('machine')) obj.scale.setScalar(ON_MACHINE.scale);
    group.add(obj);
    return obj;
  }
  function make(p: Placed, yaw: number): Actor {
    const y = p.id?.startsWith('machine') ? ON_MACHINE.y : 0;
    const obj = model(p), foot = new Vector3();
    return { model: p.model, id: p.id, obj, marker: markerOf(p, foot, obj), foot, r: p.r, c: p.c, yaw, goal: yaw, y };
  }
  function drop(a: Actor): void {
    group.remove(a.obj);
    disposeModel(a.obj, kit);
    if (a.marker) markers.group.remove(a.marker);
  }
  function rebuild(a: Actor, p: Placed): void {
    drop(a);
    a.model = p.model;
    a.obj = model(p);
    a.marker = markerOf(p, a.foot, a.obj);
  }

  function set(list: readonly Placed[], cols: number, rows: number, snap: boolean): boolean {
    let changed = false;
    const free = new Set(actors);
    const mine = new Map<Placed, Actor>();
    const byId = new Map(actors.filter(a => a.id).map(a => [a.id!, a]));
    for (const p of list) {
      const a = p.id ? byId.get(p.id) : undefined;
      if (a) { free.delete(a); mine.set(p, a); }
    }
    // The rest, nearest first: a block that has landed is the block that slid there.
    const near: [number, Placed, Actor][] = [];
    for (const p of list) {
      if (mine.has(p)) continue;
      for (const a of free) {
        const d = Math.hypot(a.r - p.r, a.c - p.c);
        if (a.model === p.model && d <= SAME_REACH) near.push([d, p, a]);
      }
    }
    near.sort((x, y) => x[0] - y[0]);
    for (const [, p, a] of near) {
      if (mine.has(p) || !free.has(a)) continue;
      free.delete(a);
      a.id = p.id;
      mine.set(p, a);
    }
    for (const a of free) { drop(a); changed = true; }
    const hero = list.find(p => p.model === 'theseus');
    const next: Actor[] = [];
    for (const p of list) {
      let a = mine.get(p);
      if (!a) {
        // New on the board: it faces its own way, the Minotaur faces Theseus, the rest face down the board.
        const yaw = p.dir ? DIR_YAW[p.dir] : p.id === 'minotaur' && hero ? Math.atan2(hero.c - p.c, hero.r - p.r) : 0;
        a = make(p, yaw);
        changed = true;
      }
      if (a.model !== p.model) { rebuild(a, p); changed = true; }
      const dr = p.r - a.r, dc = p.c - a.c;
      if (Math.abs(dr) + Math.abs(dc) > 1e-6) {
        if (FACES.has(a.model)) a.goal = Math.atan2(dc, dr);
        changed = true;
      }
      a.r = p.r;
      a.c = p.c;
      if (snap) a.yaw = a.goal;
      a.obj.position.set(cellX(a.c, cols), a.y, cellZ(a.r, rows));
      a.obj.rotation.y = a.yaw;
      lift(a);
      next.push(a);
    }
    actors = next;
    return changed;
  }

  function ease(dt: number, snap: boolean): boolean {
    let busy = false;
    for (const a of actors) {
      const d = wrap(a.goal - a.yaw);
      if (Math.abs(d) < 1e-3) { a.yaw = a.goal; a.obj.rotation.y = a.yaw; continue; }
      a.yaw = snap ? a.goal : a.yaw + d * (1 - Math.exp(-dt / TURN_TAU));
      a.obj.rotation.y = a.yaw;
      busy = true;
    }
    return busy;
  }

  function clear(): void {
    for (const a of actors) drop(a);
    actors = [];
  }

  return {
    group,
    set,
    ease,
    seen() {
      const box = (a: Actor): Seen => {
        const info = a.obj.userData as PieceInfo;
        return { x: a.obj.position.x, z: a.obj.position.z, half: info.half, h: info.h };
      };
      const me = actors.find(a => a.model === 'theseus');
      return { hero: me ? box(me) : null, rest: actors.filter(a => a !== me).map(box) };
    },
    hero: () => actors.find(a => a.model === 'theseus')?.obj ?? null,
    loop(t) {
      for (const a of actors) (a.obj.userData as PieceInfo).loop?.(t);
    },
    looping: () => actors.flatMap(a => (a.marker || (a.obj.userData as PieceInfo).loop ? [a.obj] : [])),
    clear,
    dispose: clear,
  };
}
