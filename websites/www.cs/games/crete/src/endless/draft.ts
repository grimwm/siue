/* The Island of Crete: Endless's drafts. A draft is a maze of corridors one cell wide: its cells stand on a lattice
 * (every odd row and column), joined through the wall cells between them in one of several styles (`STYLES`), each
 * with a look of its own: long winding corridors (a growing tree that grows from its newest cell), many short
 * branches (one that grows from a random cell), long straight corridors all running one way (a sidewinder), long
 * straight walls with a gap in each (recursive division), and loops everywhere (a braided maze). Some dead ends are then broken through
 * into a neighbour, making loops, and now and then a few cells are opened into a small chamber. The pieces of a few
 * families go on its passages (the wall cells it opened, where a door, gravel or a fake wall stands between two
 * cells) and on its cells. A draft is only a candidate: the gate (src/endless/gate.ts) decides whether it is a level,
 * and an open chamber stays only when it earns its place there. Everything is drawn from the `Rng` it is given.
 * DOM-free. */
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

/** How a draft's maze is carved: `winding`, a growing tree from its newest cell (long winding corridors);
 *  `branching`, one from a random cell (many short branches); `kruskal`, passages opened in a random order wherever
 *  they join two parts (short dead ends everywhere); `division`, the board cut again and again by a straight wall
 *  with one gap (long straight walls); `braided`, a growing tree whose dead ends are nearly all broken into loops. */
export type Style = 'winding' | 'branching' | 'sidewinder' | 'division' | 'braided';
export const STYLES: readonly Style[] = ['winding', 'branching', 'sidewinder', 'division', 'braided'];

/** What a draft is drawn from. */
export interface Plan {
  /** Odd and at least 7, so the lattice fills the board. */
  rows: number;
  cols: number;
  families: readonly Family[];
  /** Relics on the board (all needed). */
  relics: number;
  /** How the maze is carved; a growing tree that `winding` steers when not given. */
  style?: Style;
  /** For a growing tree: the chance it grows from its newest cell (a long winding corridor) rather than a random
   *  one. */
  winding: number;
  /** The share of dead ends broken through into a neighbour, each making a loop. */
  braid: number;
  /** Small chambers opened in the maze, 0 to 2: each a 2 × 2 block of the lattice's cells opened whole (3 × 3). */
  chambers: number;
}

export interface Door { r: number; c: number }

const DIR_DELTA: Record<Dir, readonly [number, number]> = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] };
const DIRS: readonly Dir[] = ['up', 'down', 'left', 'right'];

/** A level as it is drawn: its cells as level-text characters, its passages (the wall cells between two lattice
 *  cells that the maze opened), and the facing of each hazard and the template and facing of each clone machine, by
 *  cell index. */
export interface Sketch {
  g: string[][];
  doors: readonly Door[];
  facing: Map<number, Dir>;
  machines: Map<number, string>;
}

/** A wall cell that stands alone: a lattice corner (even row and column) with no wall on any side. */
function lone(g: readonly (readonly string[])[], y: number, x: number): boolean {
  const R = g.length, C = g[0]!.length;
  if (y <= 0 || x <= 0 || y >= R - 1 || x >= C - 1 || g[y]![x] !== '#') return false;
  return g[y - 1]![x] !== '#' && g[y + 1]![x] !== '#' && g[y]![x - 1] !== '#' && g[y]![x + 1] !== '#';
}

/** Opening the wall cell at (y, x) leaves no wall standing alone beside it. */
function opensClean(g: string[][], y: number, x: number): boolean {
  const was = g[y]![x]!;
  g[y]![x] = '.';
  const bad = DIRS.some(d => lone(g, y + DIR_DELTA[d][0], x + DIR_DELTA[d][1]));
  g[y]![x] = was;
  return !bad;
}

/** A draft, or null when its pieces would not fit. */
export function draft(rng: Rng, plan: Plan): Sketch | null {
  const { rows: R, cols: C } = plan;
  if (R % 2 === 0 || C % 2 === 0 || R < 7 || C < 7) return null;
  const m = (R - 1) / 2, n = (C - 1) / 2;
  const g: string[][] = Array.from({ length: R }, () => Array<string>(C).fill('#'));
  const cy = (i: number) => 2 * Math.floor(i / n) + 1, cx = (i: number) => 2 * (i % n) + 1;
  const N = m * n;
  for (let i = 0; i < N; i++) g[cy(i)]![cx(i)] = '.';
  const neighbours = (i: number): number[] => {
    const r = Math.floor(i / n), c = i % n, out: number[] = [];
    if (r > 0) out.push(i - n);
    if (r < m - 1) out.push(i + n);
    if (c > 0) out.push(i - 1);
    if (c < n - 1) out.push(i + 1);
    return out;
  };
  /** The wall cell between lattice cells a and b. */
  const between = (a: number, b: number): [number, number] => [(cy(a) + cy(b)) / 2, (cx(a) + cx(b)) / 2];
  const doors: Door[] = [];
  const carve = (a: number, b: number) => { const [y, x] = between(a, b); g[y]![x] = '.'; doors.push({ r: y, c: x }); };
  for (const [a, b] of carving(rng, plan.style, m, n, plan.winding, neighbours)) carve(a, b);
  const open = (y: number, x: number) => g[y]![x] !== '#';
  const exits = (i: number) => DIRS.filter(d => open(cy(i) + DIR_DELTA[d][0], cx(i) + DIR_DELTA[d][1])).length;
  // Loops: some dead ends broken through into a neighbour they are not joined to.
  for (const i of rng.shuffle([...Array(N).keys()])) {
    if (exits(i) !== 1 || rng.next() >= plan.braid) continue;
    const walls = rng.shuffle(neighbours(i).filter(j => { const [y, x] = between(i, j); return g[y]![x] === '#' && opensClean(g, y, x); }));
    if (walls.length) carve(i, walls[0]!);
  }
  // Chambers: a 2 × 2 block of lattice cells opened whole, its middle and the walls between its cells too.
  const chamberCells = new Set<number>();
  for (let k = 0; k < plan.chambers && m > 2 && n > 2; k++) {
    const r = rng.int(m - 1), c = rng.int(n - 1);
    for (let y = 2 * r + 1; y <= 2 * r + 3; y++) for (let x = 2 * c + 1; x <= 2 * c + 3; x++) {
      if (g[y]![x] === '#') g[y]![x] = '.';
      chamberCells.add(y * C + x);
    }
  }
  // Passages swallowed by a chamber are no longer passages.
  const passages = doors.filter(d => !chamberCells.has(d.r * C + d.c));
  if (passages.length !== doors.length) { doors.length = 0; doors.push(...passages); }
  const isDoor = (y: number, x: number) => doors.some(d => d.r === y && d.c === x);
  /** Every open cell that is no passage: the lattice's cells and the chambers'. */
  const cells = (): [number, number][] => {
    const out: [number, number][] = [];
    for (let y = 1; y < R - 1; y++) for (let x = 1; x < C - 1; x++) if (g[y]![x] === '.' && !isDoor(y, x)) out.push([y, x]);
    return out;
  };
  const deadEnd = (y: number, x: number) => DIRS.filter(d => open(y + DIR_DELTA[d][0], x + DIR_DELTA[d][1])).length === 1;
  /** A free cell: a dead end first when `end`, else any. */
  const spot = (end = false): [number, number] | null => {
    const free = cells();
    if (!free.length) return null;
    const ends = end ? free.filter(([y, x]) => deadEnd(y, x)) : [];
    return rng.pick(ends.length ? ends : free);
  };
  const put = (ch: string, end = false): boolean => { const p = spot(end); if (!p) return false; g[p[0]]![p[1]] = ch; return true; };
  const freeDoors = () => rng.shuffle(doors.filter(d => g[d.r]![d.c] === '.'));
  const onDoor = (ch: string): boolean => { const d = freeDoors()[0]; if (!d) return false; g[d.r]![d.c] = ch; return true; };
  /** A wall cell between two open cells, in a line (a closed passage): a fake wall there is a hidden shortcut. */
  const shutPassage = (): [number, number] | null => {
    const out: [number, number][] = [];
    for (let y = 1; y < R - 1; y++) for (let x = 1; x < C - 1; x++) {
      if (g[y]![x] !== '#') continue;
      if ((g[y - 1]![x] === '.' && g[y + 1]![x] === '.' && g[y]![x - 1] === '#' && g[y]![x + 1] === '#')
        || (g[y]![x - 1] === '.' && g[y]![x + 1] === '.' && g[y - 1]![x] === '#' && g[y + 1]![x] === '#')) out.push([y, x]);
    }
    return out.length ? rng.pick(out) : null;
  };
  /** Fills a straight run of 2 to 4 corridor cells with `ch`, from a passage along the way it runs. */
  const fill = (ch: string): boolean => {
    for (const d of freeDoors()) {
      const along: Dir[] = open(d.r - 1, d.c) && open(d.r + 1, d.c) ? ['up', 'down'] : ['left', 'right'];
      const run: [number, number][] = [[d.r, d.c]];
      const want = 2 + rng.int(3);
      for (const way of rng.shuffle(along)) {
        let y = d.r, x = d.c;
        while (run.length < want) {
          y += DIR_DELTA[way][0]; x += DIR_DELTA[way][1];
          if (g[y]?.[x] !== '.') break;
          run.push([y, x]);
        }
      }
      if (run.length < 2) continue;
      for (const [y, x] of run) g[y]![x] = ch;
      return true;
    }
    return false;
  };
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
        const k = 1 + rng.int(2);
        for (let j = 0; j < k; j++) ok = onDoor(door) && ok;
        for (let j = 0; j < (door === 'G' ? 1 : k); j++) ok = put(key, true) && ok;
        break;
      }
      case 'water': ok = fill('~') && (rng.next() < 0.5 ? put('f', true) : put('O')) && ok; break;
      case 'fire': ok = fill('F') && put('h', true) && ok; break;
      case 'ice': { ok = fill('=') && ok; if (rng.next() < 0.5) ok = put('k', true) && ok; break; }
      case 'force': { ok = fill(rng.pick(['^', 'v', '<', '>'])) && ok; if (rng.next() < 0.5) ok = put('u', true) && ok; break; }
      case 'blocks': { const k = 1 + rng.int(2); for (let j = 0; j < k; j++) ok = put('O') && ok; break; }
      case 'toggle': {
        const k = 1 + rng.int(2);
        for (let j = 0; j < k; j++) ok = onDoor(rng.next() < 0.5 ? 'T' : 't') && ok;
        ok = put('_') && ok;
        break;
      }
      case 'mirror': ok = put('z', true) && ok; break;
      case 'cow': ok = put('c', true) && ok; break;
      case 'gravel': { const k = 1 + rng.int(2); for (let j = 0; j < k; j++) ok = onDoor(':') && ok; break; }
      case 'popup': ok = onDoor(';') && ok; break;
      case 'fake': {
        const p = rng.next() < 0.6 ? shutPassage() : null;
        if (p) g[p[0]]![p[1]] = 'W'; else ok = onDoor('W') && ok;
        break;
      }
      case 'invisible': ok = (rng.next() < 0.5 ? onDoor('I') : put('I')) && ok; break;
      case 'snare': ok = (rng.next() < 0.5 ? onDoor('&') : put('&')) && put('-') && ok; break;
      case 'teleport': ok = put('@', true) && put('@', true) && ok; break;
      case 'ball': ok = hazard('o') && ok; break;
      case 'glider': ok = hazard('w') && ok; break;
      case 'fireball': ok = hazard('e') && ok; break;
      case 'thief': ok = onDoor('$') && ok; break;
      case 'bomb': ok = (rng.next() < 0.5 ? onDoor('!') : put('!')) && ok; break;
      case 'clone': {
        // A machine in a wall, facing into an open cell, and its red button elsewhere.
        let placed = false;
        for (let tries = 0; tries < 60 && !placed; tries++) {
          const y = 1 + rng.int(R - 2), x = 1 + rng.int(C - 2), dir = rng.pick(DIRS);
          const fy = y + DIR_DELTA[dir][0], fx = x + DIR_DELTA[dir][1];
          if (g[y]![x] !== '#' || g[fy]?.[fx] !== '.') continue;
          g[y]![x] = 'C'; machines.set(y * C + x, `${rng.pick(['block', 'ball', 'block'])}-${dir}`); placed = true;
        }
        ok = placed && put('+') && ok;
        break;
      }
    }
    if (!ok) return null;
  }
  // Theseus first; then the exit and the relics on the far side of the maze from him, so the way runs out and on and
  // never back past where he started (a catch throws him back there, and that must never be a short cut); then the
  // beast, apart from him but not so far that he is out of the hunt.
  const start = spot();
  if (!start) return null;
  g[start[0]]![start[1]] = 'P';
  const dist = stepsFrom(g, start);
  const ways: [number, number, number, number, number][] = [];
  for (let y = 1; y < R - 1; y++) {
    if (g[y]![1] === '.') ways.push([y, 0, y, 1, dist[y * C + 1]!]);
    if (g[y]![C - 2] === '.') ways.push([y, C - 1, y, C - 2, dist[y * C + C - 2]!]);
  }
  for (let x = 1; x < C - 1; x++) {
    if (g[1]![x] === '.') ways.push([0, x, 1, x, dist[C + x]!]);
    if (g[R - 2]![x] === '.') ways.push([R - 1, x, R - 2, x, dist[(R - 2) * C + x]!]);
  }
  ways.sort((p, q) => q[4] - p[4] || p[0] - q[0] || p[1] - q[1]);
  const farWays = ways.filter(w => w[4] > 0).slice(0, Math.max(1, Math.ceil(ways.length / 3)));
  if (!farWays.length) return null;
  const [ey, ex, iy, ix] = rng.pick(farWays);
  g[ey]![ex] = 'E';
  for (let k = 0; k < plan.relics; k++) {
    const far = band(g, dist, 0.5, 1).filter(([y, x]) => !(y === iy && x === ix));
    const ends = far.filter(([y, x]) => deadEnd(y, x));
    const pool = ends.length && rng.next() < 0.7 ? ends : far;
    if (!pool.length) return null;
    const [y, x] = rng.pick(pool);
    g[y]![x] = '*';
  }
  const near = band(g, dist, 0.25, 0.6);
  if (!near.length) return null;
  const den = rng.pick(near);
  g[den[0]]![den[1]] = 'M';
  if (plan.relics > 0 && rng.next() < 0.5 && g[iy]![ix] === '.' && !isDoor(iy, ix)) g[iy]![ix] = '|';
  return { g, doors, facing, machines };
}

/** The passages a maze of `m` × `n` lattice cells opens, as pairs of cells (index r * n + c), carved in `style`:
 *  every style joins every cell, with no loop (the loops come after). */
function carving(rng: Rng, style: Style | undefined, m: number, n: number, winding: number, neighbours: (i: number) => number[]): [number, number][] {
  const N = m * n;
  const out: [number, number][] = [];
  if (style === 'sidewinder') {
    // Lines of cells (rows, or columns when turned), the first a corridor from end to end; along each later line, runs
    // of cells joined side by side, each run joined to the line before it at one of its cells. Which side the first
    // line stands on is drawn too.
    const turned = rng.next() < 0.5, back = rng.next() < 0.5;
    const L = turned ? n : m, W = turned ? m : n;
    const at = (line: number, k: number) => { const l = back ? L - 1 - line : line; return turned ? k * n + l : l * n + k; };
    for (let line = 0; line < L; line++) {
      let run: number[] = [];
      for (let k = 0; k < W; k++) {
        run.push(at(line, k));
        const close = line > 0 && (k === W - 1 || rng.next() < 0.5);
        if (line === 0 ? k < W - 1 : !close) { out.push([at(line, k), at(line, k + 1)]); continue; }
        if (line > 0) { const j = rng.int(run.length); out.push([run[j]!, at(line - 1, (j + k - run.length + 1))]); }
        run = [];
      }
    }
    return out;
  }
  if (style === 'division') {
    // Every passage open, then each region cut across its longer side by a wall with one gap, down to single rows
    // and columns.
    const shut = new Set<string>();
    const cut = (r0: number, c0: number, r1: number, c1: number) => {
      const h = r1 - r0 + 1, w = c1 - c0 + 1;
      if (h < 2 || w < 2) return;
      const across = h > w || (h === w && rng.next() < 0.5);
      if (across) {
        const k = r0 + rng.int(h - 1), gap = c0 + rng.int(w);
        for (let c = c0; c <= c1; c++) if (c !== gap) shut.add(`${k * n + c}:${(k + 1) * n + c}`);
        cut(r0, c0, k, c1); cut(k + 1, c0, r1, c1);
      } else {
        const k = c0 + rng.int(w - 1), gap = r0 + rng.int(h);
        for (let r = r0; r <= r1; r++) if (r !== gap) shut.add(`${r * n + k}:${r * n + k + 1}`);
        cut(r0, c0, r1, k); cut(r0, k + 1, r1, c1);
      }
    };
    cut(0, 0, m - 1, n - 1);
    for (let i = 0; i < N; i++) {
      if (i % n < n - 1 && !shut.has(`${i}:${i + 1}`)) out.push([i, i + 1]);
      if (i + n < N && !shut.has(`${i}:${i + n}`)) out.push([i, i + n]);
    }
    return out;
  }
  // The growing tree: from its newest cell (winding) or a random one (branching); a braided maze, or a plan with no
  // style, grows from either as `winding` says.
  const newest = style === 'winding' ? Math.max(winding, 0.85) : style === 'branching' ? Math.min(winding, 0.15) : winding;
  const seen = new Uint8Array(N);
  const first = rng.int(N);
  seen[first] = 1;
  const active = [first];
  while (active.length) {
    const k = rng.next() < newest ? active.length - 1 : rng.int(active.length);
    const here = active[k]!;
    const free = neighbours(here).filter(j => !seen[j]);
    if (!free.length) { active.splice(k, 1); continue; }
    const next = rng.pick(free);
    out.push([here, next]);
    seen[next] = 1;
    active.push(next);
  }
  return out;
}

/** Steps from `from` to every cell, over every cell but walls (-1 where none reach). */
function stepsFrom(g: readonly (readonly string[])[], from: readonly [number, number]): Int32Array {
  const R = g.length, C = g[0]!.length;
  const dist = new Int32Array(R * C).fill(-1);
  dist[from[0] * C + from[1]] = 0;
  const queue = [from[0] * C + from[1]];
  for (let k = 0; k < queue.length; k++) {
    const i = queue[k]!, y = Math.floor(i / C), x = i % C;
    for (const d of DIRS) {
      const ny = y + DIR_DELTA[d][0], nx = x + DIR_DELTA[d][1];
      if (ny <= 0 || nx <= 0 || ny >= R - 1 || nx >= C - 1) continue;
      const j = ny * C + nx;
      if (dist[j]! >= 0 || g[ny]![nx] === '#') continue;
      dist[j] = dist[i]! + 1;
      queue.push(j);
    }
  }
  return dist;
}

/** The free floor cells from share `lo` to share `hi` of the way out from where `dist` was measured (of all the
 *  free cells it reaches, nearest first). */
function band(g: readonly (readonly string[])[], dist: Int32Array, lo: number, hi: number): [number, number][] {
  const R = g.length, C = g[0]!.length;
  const free: [number, number, number][] = [];
  for (let y = 1; y < R - 1; y++) for (let x = 1; x < C - 1; x++) if (g[y]![x] === '.' && dist[y * C + x]! > 0) free.push([y, x, dist[y * C + x]!]);
  free.sort((a, b) => a[2] - b[2] || a[0] - b[0] || a[1] - b[1]);
  return free.slice(Math.floor(free.length * lo), Math.ceil(free.length * hi)).map(([y, x]) => [y, x]);
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

/** What stands on a cell and may move to another: Theseus, the beast, relics, keys, gear, tools, blocks, hazards,
 *  buttons, snares, bombs, invisible walls and teleports. */
const ROOM_PIECES = new Set('PM*rbygfhkuzcxOowe_-+&!I@');

/** A copy of `s` with one small change: a piece moved to another cell, a passage's piece moved to another passage, a
 *  hazard turned, or a passage opened between two cells (a loop) or walled up. No wall is left standing alone. */
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
  const roll = rng.next();
  if (roll < 0.55) {
    const from = cells((y, x) => ROOM_PIECES.has(g[y]![x]!) && !isDoor(y, x));
    const to = cells((y, x) => g[y]![x] === '.' && !isDoor(y, x));
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
    // A wall cell between two open cells in a line, with wall on its other two sides: a passage to open.
    const shut = cells((y, x) => g[y]![x] === '#' && (
      (g[y - 1]![x] !== '#' && g[y + 1]![x] !== '#' && g[y]![x - 1] === '#' && g[y]![x + 1] === '#')
      || (g[y]![x - 1] !== '#' && g[y]![x + 1] !== '#' && g[y - 1]![x] === '#' && g[y + 1]![x] === '#')) && opensClean(g, y, x));
    if (plain.length > 1 && (rng.next() < 0.5 || !shut.length)) {
      const d = rng.pick(plain);
      g[d.r]![d.c] = '#';
      doors = doors.filter(o => o !== d);
    } else if (shut.length) {
      const [y, x] = rng.pick(shut);
      g[y]![x] = '.';
      doors.push({ r: y, c: x });
    }
  }
  return { g, doors, facing, machines: new Map(s.machines) };
}
