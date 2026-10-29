/* The Island of Crete, modern look: the figures, and everything that stands on the board (src/modern/model-names.ts
 * `placed`): Theseus, the Minotaur, the Minotaur turned to stone, and the pieces from pieces.ts. Each stands where
 * the state and the turn's figures put it, between cells while it moves, and turns to face along its last step,
 * easing round unless motion is reduced. A thing keeps its model from frame to frame by its id, or, when it has
 * none (a hazard, a sliding block), by its model and the nearest place it stood. The Minotaur, the items and the
 * hazards carry their floating icon (src/modern/icons.ts) above them. */
import { CatmullRomCurve3, ConeGeometry, CylinderGeometry, Group, Mesh, SphereGeometry, TorusGeometry, TubeGeometry, Vector3 } from 'three';
import type { Material, Object3D, Sprite } from 'three';
import type { Dir } from '../../puzzle/tiles.ts';
import type { FigureModel, PieceModel, Placed } from '../model-names.ts';
import { FIGURE_MODEL_NAMES } from '../model-names.ts';
import { ICON_LIFT, bob, iconFor } from '../icons.ts';
import { FY, cellX, cellZ } from './floor.ts';
import type { IconSheet } from './icons.ts';
import { PIECE_MODELS } from './pieces.ts';
import { at, box, cyl, disposeModel, piece } from './terrain.ts';
import type { PieceInfo } from './terrain.ts';
import type { Kit } from './textures.ts';
import type { Seen } from './walls.ts';

const sph = (r: number, mat: Material, ws = 16, hs = 12) => new Mesh(new SphereGeometry(r, ws, hs), mat);
/** Built with its feet at 0 and stood on the floor at the sample's size. */
function stand(g: Group, info: PieceInfo): Group {
  g.scale.setScalar(1.3);
  g.position.y = FY;
  const out = new Group();
  out.add(g);
  return piece(out, info);
}

/** Theseus: a blue tunic, a red cloak, a round bronze shield and a short sword. */
function theseus(kit: Kit): Group {
  const { m } = kit;
  const g = new Group();
  for (const sx of [-1, 1]) {
    g.add(at(cyl(0.045, 0.04, 0.28, m.skin), sx * 0.065, 0.14, 0));
    g.add(at(box(0.07, 0.05, 0.12, m.leather), sx * 0.065, 0.025, 0.02));
  }
  g.add(at(cyl(0.13, 0.2, 0.22, m.tunic), 0, 0.35, 0));
  g.add(at(cyl(0.155, 0.13, 0.22, m.tunic), 0, 0.55, 0));
  g.add(at(cyl(0.16, 0.16, 0.035, m.leather), 0, 0.45, 0));
  const cloak = at(box(0.3, 0.44, 0.03, m.cloak), 0, 0.44, -0.14);
  cloak.rotation.x = 0.12;
  g.add(cloak);
  for (const sx of [-1, 1]) {
    const a = at(cyl(0.04, 0.035, 0.26, m.skin), sx * 0.19, 0.5, 0.02);
    a.rotation.z = sx * 0.18;
    g.add(a);
  }
  g.add(at(sph(0.095, m.skin), 0, 0.75, 0));
  g.add(at(new Mesh(new SphereGeometry(0.103, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), m.furDark), 0, 0.765, -0.012));
  const shield = at(cyl(0.15, 0.15, 0.03, m.bronze, 24), -0.26, 0.5, 0.04);
  shield.rotation.z = Math.PI / 2;
  g.add(shield);
  const boss = at(cyl(0.06, 0.06, 0.035, m.cloak, 16), -0.275, 0.5, 0.04);
  boss.rotation.z = Math.PI / 2;
  g.add(boss);
  const sword = at(box(0.03, 0.34, 0.012, m.steel), 0.23, 0.5, 0.1);
  sword.rotation.x = 0.5;
  g.add(sword);
  g.add(at(box(0.09, 0.02, 0.03, m.bronze), 0.23, 0.37, 0.03));
  return stand(g, { half: 0.26, h: 1.2 });
}

/** The Minotaur with his labrys: fur, a red kilt and ivory horns, or all grey stone while the mirror holds him. */
function minotaur(kit: Kit, stone: boolean): Group {
  const { m } = kit;
  const s = (mat: Material) => (stone ? m.statue : mat);
  const fur = s(m.fur), furDark = stone ? m.statueDark : m.furDark;
  const g = new Group();
  for (const sx of [-1, 1]) {
    g.add(at(cyl(0.07, 0.06, 0.3, fur), sx * 0.1, 0.17, 0));
    g.add(at(cyl(0.065, 0.07, 0.05, s(m.hoof)), sx * 0.1, 0.025, 0));
  }
  g.add(at(cyl(0.2, 0.26, 0.2, s(m.kilt)), 0, 0.38, 0));
  const belt = at(new Mesh(new TorusGeometry(0.2, 0.02, 8, 24), s(m.gold)), 0, 0.47, 0);
  belt.rotation.x = Math.PI / 2;
  g.add(belt);
  const torso = at(sph(0.26, fur), 0, 0.66, 0);
  torso.scale.set(1.05, 1, 0.75);
  g.add(torso);
  for (const sx of [-1, 1]) {
    g.add(at(sph(0.11, fur), sx * 0.26, 0.78, 0));
    const arm = at(cyl(0.07, 0.055, 0.36, fur), sx * 0.31, 0.57, 0.03);
    arm.rotation.z = sx * 0.2;
    g.add(arm);
  }
  const head = at(sph(0.13, furDark), 0, 0.95, 0.06);
  head.scale.set(1, 0.95, 1.15);
  g.add(head);
  const snout = at(sph(0.085, s(m.snout)), 0, 0.9, 0.19);
  snout.scale.set(1.1, 0.8, 0.9);
  g.add(snout);
  g.add(at(new Mesh(new TorusGeometry(0.035, 0.008, 6, 16), s(m.gold)), 0, 0.85, 0.26));
  for (const sx of [-1, 1]) {
    g.add(at(sph(0.018, stone ? m.statueDark : m.eye, 8, 6), sx * 0.065, 0.99, 0.17));
    const curve = new CatmullRomCurve3([
      new Vector3(sx * 0.1, 1.0, 0.04), new Vector3(sx * 0.24, 1.03, 0.02), new Vector3(sx * 0.33, 1.12, 0.07), new Vector3(sx * 0.33, 1.22, 0.13),
    ]);
    g.add(new Mesh(new TubeGeometry(curve, 16, 0.028, 8), s(m.ivory)));
    g.add(at(new Mesh(new ConeGeometry(0.028, 0.07, 8), s(m.ivory)), sx * 0.33, 1.25, 0.14));
    const ear = at(sph(0.04, furDark), sx * 0.14, 0.97, 0.02);
    ear.scale.set(1.3, 0.6, 0.8);
    g.add(ear);
  }
  const ax = new Group();
  ax.add(cyl(0.018, 0.018, 0.85, s(m.iron), 8));
  for (const sx of [-1, 1]) {
    const blade = new Mesh(new CylinderGeometry(0.17, 0.17, 0.02, 24, 1, false, 0, Math.PI), s(m.steel));
    blade.rotation.z = Math.PI / 2;
    blade.rotation.y = sx > 0 ? 0 : Math.PI;
    blade.position.set(0, 0.3, 0);
    blade.scale.set(1, 1, 0.8);
    ax.add(blade);
  }
  ax.rotation.y = Math.PI / 2;
  ax.position.set(0.4, 0.62, 0.08);
  g.add(ax);
  return stand(g, { half: 0.36, h: 1.6 });
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
  model: PieceModel | FigureModel; id: string | null; obj: Object3D; icon: Sprite | null; r: number; c: number; yaw: number; goal: number;
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
  /** Moves the flames and bobs the icons to loop time `t` seconds. */
  loop(t: number): void;
  /** Where the things that loop stand, to tell whether one is on screen. */
  looping(): Object3D[];
  clear(): void;
  dispose(): void;
}

const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

/** `sheet` draws the icons (none without it); `still` is true while motion is reduced. */
export function createActors(kit: Kit, sheet: IconSheet | null, still: () => boolean): Actors {
  const group = new Group();
  let actors: Actor[] = [];
  let loopT = 0;

  const iconOf = (p: Placed) => {
    const name = iconFor(p);
    const sp = name && sheet ? sheet.make(name) : null;
    if (sp) group.add(sp);
    return sp;
  };
  /** The icon over its piece, bobbing. */
  function lift(a: Actor): void {
    if (!a.icon) return;
    const p = a.obj.position;
    a.icon.position.set(p.x, FY + (a.obj.userData as PieceInfo).h + ICON_LIFT + bob(loopT, still()), p.z);
  }
  function model(p: Placed): Object3D {
    const obj = MODELS[p.model](kit);
    if (p.id?.startsWith('machine')) obj.scale.setScalar(ON_MACHINE.scale);
    group.add(obj);
    return obj;
  }
  function make(p: Placed, yaw: number): Actor {
    const y = p.id?.startsWith('machine') ? ON_MACHINE.y : 0;
    return { model: p.model, id: p.id, obj: model(p), icon: iconOf(p), r: p.r, c: p.c, yaw, goal: yaw, y };
  }
  function drop(a: Actor): void {
    group.remove(a.obj);
    disposeModel(a.obj, kit);
    if (a.icon) group.remove(a.icon);
  }
  function rebuild(a: Actor, p: Placed): void {
    drop(a);
    a.model = p.model;
    a.obj = model(p);
    a.icon = iconOf(p);
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
      loopT = t;
      for (const a of actors) {
        (a.obj.userData as PieceInfo).loop?.(t);
        lift(a);
      }
    },
    looping: () => actors.flatMap(a => (a.icon ? [a.icon] : (a.obj.userData as PieceInfo).loop ? [a.obj] : [])),
    clear,
    dispose: clear,
  };
}
