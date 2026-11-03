/* The Island of Crete: Endless's drafts. A draft is a level drawn as rooms and halls, the way the campaign's
 * challenge levels were: a grid of rooms with walls one cell thick between them, joined by a random spanning tree of
 * doorways (some walls taken out whole, making a hall of two rooms), a few doorways more for loops, and then the
 * pieces of a few families put on the doorways and in the rooms. A draft is only a candidate: the gate
 * (src/endless/gate.ts) decides whether it is a level. Everything is drawn from the `Rng` it is given. DOM-free. */
import type { Rng } from './random.ts';
import type { Dir } from '../puzzle/tiles.ts';

/** A family of pieces that go together (a door and its key, water and what crosses it), and the chapter that
 *  brings it in: Endless offers a family once the player has reached that chapter. */
export type Family =
  | 'keys' | 'water' | 'fire' | 'ice' | 'force' | 'blocks' | 'toggle' | 'mirror' | 'cow'
  | 'gravel' | 'popup' | 'fake' | 'invisible' | 'snare' | 'teleport' | 'ball' | 'glider' | 'fireball'
  | 'thief' | 'bomb' | 'clone';

export const FAMILY_CHAPTER: Readonly<Record<Family, number>> = {
  keys: 1, water: 1, fire: 1, ice: 1, force: 1, blocks: 1, toggle: 1, mirror: 1, cow: 1,
  gravel: 2, popup: 3, fake: 4, invisible: 4, snare: 5, teleport: 6, ball: 7, glider: 8, fireball: 8,
  thief: 9, bomb: 9, clone: 9,
};

/** The families of the chapters up to `tier`. */
export function familiesOf(tier: number): Family[] {
  return (Object.keys(FAMILY_CHAPTER) as Family[]).filter(f => FAMILY_CHAPTER[f] <= tier);
}

/** Fake and invisible walls: a level that holds one is held to the gentler band (difficulty.ts's HIDDEN). */
export const HIDING: readonly Family[] = ['fake', 'invisible'];

/** What a draft is drawn from. */
export interface Plan {
  rows: number;
  cols: number;
  /** Rooms down and across. */
  roomRows: number;
  roomCols: number;
  families: readonly Family[];
  /** Relics on the board (all needed). */
  relics: number;
  /** The chance a wall between two rooms of the tree goes whole, making a hall. */
  hall: number;
  /** The chance a wall between two rooms already joined gets a doorway too. */
  loop: number;
}

type Band = readonly [number, number];
export interface Door { r: number; c: number }

/** `total` cells cut into `n` bands of at least `least`, with one wall cell between bands. */
function bands(rng: Rng, total: number, n: number, least: number): Band[] | null {
  const free = total - (n - 1);
  if (free < n * least) return null;
  const sizes = Array<number>(n).fill(least);
  for (let left = free - n * least; left > 0; left--) sizes[rng.int(n)]!++;
  const out: Band[] = [];
  let at = 1;
  for (const s of sizes) { out.push([at, at + s - 1]); at += s + 1; }
  return out;
}

const DIR_DELTA: Record<Dir, readonly [number, number]> = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] };
const DIRS: readonly Dir[] = ['up', 'down', 'left', 'right'];

/** A level as it is drawn: its cells as level-text characters, its doorways, and the facing of each hazard and the
 *  template and facing of each clone machine, by cell index. */
export interface Sketch {
  g: string[][];
  doors: readonly Door[];
  facing: Map<number, Dir>;
  machines: Map<number, string>;
}

/** A draft, or null when its pieces would not fit. */
export function draft(rng: Rng, plan: Plan): Sketch | null {
  const { rows: R, cols: C } = plan;
  const rowBands = bands(rng, R - 2, plan.roomRows, 2);
  const colBands = bands(rng, C - 2, plan.roomCols, 2);
  if (!rowBands || !colBands) return null;
  const g: string[][] = Array.from({ length: R }, () => Array<string>(C).fill('#'));
  const N = plan.roomRows * plan.roomCols;
  const room = (i: number) => ({ r: rowBands[Math.floor(i / plan.roomCols)]!, c: colBands[i % plan.roomCols]! });
  for (let i = 0; i < N; i++) {
    const { r, c } = room(i);
    for (let y = r[0]; y <= r[1]; y++) for (let x = c[0]; x <= c[1]; x++) g[y]![x] = '.';
  }
  // The rooms joined: a random spanning tree, some of its walls taken out whole (halls), some loops.
  const edges: [number, number][] = [];
  for (let i = 0; i < N; i++) {
    if (i % plan.roomCols < plan.roomCols - 1) edges.push([i, i + 1]);
    if (i + plan.roomCols < N) edges.push([i, i + plan.roomCols]);
  }
  const parent = [...Array(N).keys()];
  const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x]!)));
  const doors: Door[] = [];
  const open = (a: number, b: number, hall: boolean) => {
    const A = room(a), B = room(b);
    if (b === a + 1) {
      const lo = Math.max(A.r[0], B.r[0]), hi = Math.min(A.r[1], B.r[1]), x = A.c[1] + 1;
      if (hall) { for (let y = lo; y <= hi; y++) g[y]![x] = '.'; return; }
      const y = lo + rng.int(hi - lo + 1);
      g[y]![x] = '.'; doors.push({ r: y, c: x });
    } else {
      const lo = Math.max(A.c[0], B.c[0]), hi = Math.min(A.c[1], B.c[1]), y = A.r[1] + 1;
      if (hall) { for (let x = lo; x <= hi; x++) g[y]![x] = '.'; return; }
      const x = lo + rng.int(hi - lo + 1);
      g[y]![x] = '.'; doors.push({ r: y, c: x });
    }
  };
  for (const [a, b] of rng.shuffle(edges)) {
    if (find(a) !== find(b)) { parent[find(a)] = find(b); open(a, b, rng.next() < plan.hall); }
    else if (rng.next() < plan.loop) open(a, b, false);
  }
  // A wall cell is a doorway's cheek when the doorway runs through it; pieces on doorways stay on doorways.
  const order = rng.shuffle([...Array(N).keys()]);
  const used = new Set<number>();
  const takeRoom = (): number => { const free = order.filter(i => !used.has(i)); const i = free.length ? free[0]! : rng.pick(order); used.add(i); return i; };
  const cellIn = (i: number, ok: (y: number, x: number) => boolean = (y, x) => g[y]![x] === '.'): [number, number] | null => {
    const { r, c } = room(i);
    const cells: [number, number][] = [];
    for (let y = r[0]; y <= r[1]; y++) for (let x = c[0]; x <= c[1]; x++) if (ok(y, x)) cells.push([y, x]);
    return cells.length ? rng.pick(cells) : null;
  };
  /** A free floor cell that is no doorway's mouth (so nothing blocks a doorway): in room `i`, or any room. */
  const mouth = (y: number, x: number) => DIRS.some(d => doors.some(o => o.r === y + DIR_DELTA[d][0] && o.c === x + DIR_DELTA[d][1]));
  const spot = (i?: number): [number, number] | null => {
    const rooms = i === undefined ? rng.shuffle([...Array(N).keys()]) : [i];
    for (const k of rooms) { const p = cellIn(k, (y, x) => g[y]![x] === '.' && !mouth(y, x)); if (p) return p; }
    return null;
  };
  const put = (ch: string, i?: number): boolean => { const p = spot(i); if (!p) return false; g[p[0]]![p[1]] = ch; return true; };
  const freeDoors = () => rng.shuffle(doors.filter(d => g[d.r]![d.c] === '.'));
  const onDoor = (ch: string): boolean => { const d = freeDoors()[0]; if (!d) return false; g[d.r]![d.c] = ch; return true; };
  /** Fills part of room `i` with `ch`: a band across it, so the room still reads as a room. */
  const fill = (i: number, ch: string) => {
    const { r, c } = room(i);
    const across = rng.next() < 0.5;
    if (across) {
      const y0 = r[0] + rng.int(r[1] - r[0] + 1);
      const y1 = Math.min(r[1], y0 + rng.int(2));
      for (let y = y0; y <= y1; y++) for (let x = c[0]; x <= c[1]; x++) if (g[y]![x] === '.') g[y]![x] = ch;
    } else {
      const x0 = c[0] + rng.int(c[1] - c[0] + 1);
      const x1 = Math.min(c[1], x0 + rng.int(2));
      for (let y = r[0]; y <= r[1]; y++) for (let x = x0; x <= x1; x++) if (g[y]![x] === '.') g[y]![x] = ch;
    }
  };
  const start = takeRoom(), den = takeRoom();
  const facing = new Map<number, Dir>();
  const machines = new Map<number, string>();
  const hazard = (ch: string): boolean => {
    const p = spot(); if (!p) return false;
    g[p[0]]![p[1]] = ch; facing.set(p[0] * C + p[1], rng.pick(DIRS)); return true;
  };
  let ok = true;
  for (const f of plan.families) {
    switch (f) {
      case 'keys': {
        const [door, key] = rng.pick([['R', 'r'], ['B', 'b'], ['Y', 'y'], ['G', 'g']] as const);
        const n = door === 'G' ? 1 + rng.int(2) : 1 + rng.int(2);
        for (let k = 0; k < n; k++) ok = onDoor(door) && ok;
        for (let k = 0; k < (door === 'G' ? 1 : n); k++) ok = put(key) && ok;
        break;
      }
      case 'water': { const i = takeRoom(); fill(i, '~'); ok = (rng.next() < 0.5 ? put('f') : put('O')) && ok; break; }
      case 'fire': { const i = takeRoom(); fill(i, 'F'); ok = put('h') && ok; break; }
      case 'ice': { const i = takeRoom(); fill(i, '='); if (rng.next() < 0.5) ok = put('k') && ok; break; }
      case 'force': {
        const i = takeRoom(); const ch = rng.pick(['^', 'v', '<', '>']); fill(i, ch);
        if (rng.next() < 0.5) ok = put('u') && ok;
        break;
      }
      case 'blocks': { const n = 1 + rng.int(2); for (let k = 0; k < n; k++) ok = put('O') && ok; break; }
      case 'toggle': {
        const n = 1 + rng.int(2);
        for (let k = 0; k < n; k++) ok = onDoor(rng.next() < 0.5 ? 'T' : 't') && ok;
        ok = put('_') && ok;
        break;
      }
      case 'mirror': ok = put('z') && ok; break;
      case 'cow': ok = put('c') && ok; break;
      case 'gravel': { const n = 1 + rng.int(2); for (let k = 0; k < n; k++) ok = onDoor(':') && ok; break; }
      case 'popup': ok = onDoor(';') && ok; break;
      case 'fake': ok = onDoor('W') && ok; break;
      case 'invisible': ok = put('I') && ok; break;
      case 'snare': ok = (rng.next() < 0.5 ? onDoor('&') : put('&')) && put('-') && ok; break;
      case 'teleport': ok = put('@', takeRoom()) && put('@', takeRoom()) && ok; break;
      case 'ball': ok = hazard('o') && ok; break;
      case 'glider': ok = hazard('w') && ok; break;
      case 'fireball': ok = hazard('e') && ok; break;
      case 'thief': ok = onDoor('$') && ok; break;
      case 'bomb': ok = (rng.next() < 0.5 ? onDoor('!') : put('!')) && ok; break;
      case 'clone': {
        // A machine in a room's wall, facing into the room, and its red button in another room.
        let placed = false;
        for (let tries = 0; tries < 40 && !placed; tries++) {
          const i = rng.int(N); const { r, c } = room(i); const side = rng.int(4);
          const y = side < 2 ? (side === 0 ? r[0] - 1 : r[1] + 1) : r[0] + rng.int(r[1] - r[0] + 1);
          const x = side < 2 ? c[0] + rng.int(c[1] - c[0] + 1) : side === 2 ? c[0] - 1 : c[1] + 1;
          const dir: Dir = (['down', 'up', 'right', 'left'] as const)[side]!;
          const fy = y + DIR_DELTA[dir][0], fx = x + DIR_DELTA[dir][1];
          if (y <= 0 || x <= 0 || y >= R - 1 || x >= C - 1 || g[y]![x] !== '#' || g[fy]![fx] !== '.') continue;
          g[y]![x] = 'C'; machines.set(y * C + x, `${rng.pick(['block', 'ball', 'block'])}-${dir}`); placed = true;
        }
        ok = placed && put('+') && ok;
        break;
      }
    }
    if (!ok) return null;
  }
  for (let k = 0; k < plan.relics; k++) if (!put('*')) return null;
  if (!put('P', start) || !put('M', den)) return null;
  // The exit: a border cell beside a room's floor, behind the Daedalus Gate when there are relics.
  const exits: [number, number, number, number][] = [];
  for (let y = 1; y < R - 1; y++) {
    if (g[y]![1] === '.') exits.push([y, 0, y, 1]);
    if (g[y]![C - 2] === '.') exits.push([y, C - 1, y, C - 2]);
  }
  for (let x = 1; x < C - 1; x++) {
    if (g[1]![x] === '.') exits.push([0, x, 1, x]);
    if (g[R - 2]![x] === '.') exits.push([R - 1, x, R - 2, x]);
  }
  if (!exits.length) return null;
  const [ey, ex, iy, ix] = rng.pick(exits);
  g[ey]![ex] = 'E';
  if (plan.relics > 0 && rng.next() < 0.5 && g[iy]![ix] === '.' && !mouth(iy, ix)) g[iy]![ix] = '|';
  return { g, doors, facing, machines };
}

/** A sketch's level text, titled `title`. */
export function textOf(s: Sketch, title: string): string {
  const head = [`title: ${title}`, 'intro: '];
  const hazardCells = [...s.facing.keys()].sort((a, b) => a - b);
  if (hazardCells.length) head.push(`facing: ${hazardCells.map(i => s.facing.get(i)).join(' ')}`);
  const machineCells = [...s.machines.keys()].sort((a, b) => a - b);
  if (machineCells.length) head.push(`machines: ${machineCells.map(i => s.machines.get(i)).join(' ')}`);
  return `${head.join('\n')}\n\n${s.g.map(r => r.join('')).join('\n')}\n`;
}

/** What stands in a room and may move to another cell: Theseus, the beast, relics, keys, gear, tools, blocks,
 *  hazards, buttons, snares, bombs, invisible walls and teleports. */
const ROOM_PIECES = new Set('PM*rbygfhkuzcxOowe_-+&!I@');

/** A copy of `s` with one small change: a piece moved within the rooms, a doorway's piece moved to another doorway,
 *  a hazard turned, or a doorway opened in a wall between two rooms or walled up. The rooms stay as they were. */
export function mutate(rng: Rng, s: Sketch): Sketch {
  const g = s.g.map(r => [...r]);
  const R = g.length, C = g[0]!.length;
  let doors = [...s.doors];
  const facing = new Map(s.facing);
  const cells = (ok: (y: number, x: number) => boolean) => {
    const out: [number, number][] = [];
    for (let y = 1; y < R - 1; y++) for (let x = 1; x < C - 1; x++) if (ok(y, x)) out.push([y, x]);
    return out;
  };
  const isDoor = (y: number, x: number) => doors.some(d => d.r === y && d.c === x);
  const isMouth = (y: number, x: number) => DIRS.some(d => isDoor(y + DIR_DELTA[d][0], x + DIR_DELTA[d][1]));
  const roll = rng.next();
  if (roll < 0.55) {
    const from = cells((y, x) => ROOM_PIECES.has(g[y]![x]!) && !isDoor(y, x));
    const to = cells((y, x) => g[y]![x] === '.' && !isDoor(y, x) && !isMouth(y, x));
    if (from.length && to.length) {
      const [fy, fx] = rng.pick(from), [ty, tx] = rng.pick(to);
      g[ty]![tx] = g[fy]![fx]!;
      g[fy]![fx] = '.';
      const f = facing.get(fy * C + fx);
      if (f) { facing.delete(fy * C + fx); facing.set(ty * C + tx, f); }
    }
  } else if (roll < 0.7) {
    const held = doors.filter(d => g[d.r]![d.c] !== '.');
    const plain = doors.filter(d => g[d.r]![d.c] === '.');
    if (held.length && plain.length) {
      const a = rng.pick(held), b = rng.pick(plain);
      g[b.r]![b.c] = g[a.r]![a.c]!;
      g[a.r]![a.c] = '.';
    }
  } else if (roll < 0.8 && facing.size) {
    facing.set(rng.pick([...facing.keys()]), rng.pick(DIRS));
  } else {
    const plain = doors.filter(d => g[d.r]![d.c] === '.');
    // A wall cell one thick between two rooms' floors, either way, with wall on its other two sides.
    const between = cells((y, x) => g[y]![x] === '#' && (
      (g[y - 1]![x] !== '#' && g[y + 1]![x] !== '#' && g[y]![x - 1] === '#' && g[y]![x + 1] === '#')
      || (g[y]![x - 1] !== '#' && g[y]![x + 1] !== '#' && g[y - 1]![x] === '#' && g[y + 1]![x] === '#')));
    if (plain.length > 1 && (rng.next() < 0.5 || !between.length)) {
      const d = rng.pick(plain);
      g[d.r]![d.c] = '#';
      doors = doors.filter(o => o !== d);
    } else if (between.length) {
      const [y, x] = rng.pick(between);
      g[y]![x] = '.';
      doors.push({ r: y, c: x });
    }
  }
  return { g, doors, facing, machines: new Map(s.machines) };
}
