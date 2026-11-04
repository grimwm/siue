// websites/www.cs/games/crete/src/puzzle/pack.ts
/* The Island of Crete: a game situation packed into a few 32-bit words, losslessly, for the searches that
 * store millions. It holds exactly what the reference solver's `stateKey` (test/reference-solver.ts) holds, as
 * fixed-width bit fields sized from the level; `moves` and `outcome` are not packed. Two situations of a level
 * pack alike exactly when they play alike. A hazard's kind is never packed: its home (a level hazard, or the
 * machine that cloned it) decides it. Where no machine clones a hazard, each home holds at most one hazard, so
 * the hazards pack as one slot per home: its cell (or none, once a bomb took it or a send-home found no cell for
 * it) and its facing. Otherwise they pack per cell a hazard could ever stand on: 0 empty, else 1 + facing + 4 ×
 * home. DOM-free. */
import { TERRAIN, HAZARDS, KEY_COLORS, GEAR, DIRS, DELTA } from './tiles.ts';
import type { Cell, Dir, Gear, Hazard, HazardKind, KeyColor, ObjectKind, Terrain, Tool } from './tiles.ts';
import type { Level } from './level.ts';
import { maxHearts } from './state.ts';
import type { State } from './state.ts';

export interface Layout {
  /** Words one situation takes. */
  readonly words: number;
  readonly cellBits: number;
  /** Cells are stored as `row * cols + col`; this value is "no cell". */
  readonly none: number;
  readonly minotaur: boolean;
  readonly cow: boolean;
  readonly stoneBits: number;
  readonly heartBits: number;
  readonly relicBits: number;
  readonly pageBits: number;
  readonly keyBits: readonly number[];
  readonly toolBits: readonly number[];
  /** The gear the level holds, one bit each. */
  readonly gear: readonly Gear[];
  /** Where fields start, in bits: hearts, pages, each key colour (KEY_COLORS order), each tool (mirror, cake,
   *  cow) and the first gear bit (one per `gear`, in order). */
  readonly heartAt: number;
  readonly pageAt: number;
  readonly keyAt: readonly number[];
  readonly toolAt: readonly number[];
  readonly gearAt: number;
  /** Cells whose terrain can change once (water fills in, a door or fake wall opens, a pop-up rises, an invisible
   *  wall shows, a bomb goes off): one bit each, set once changed. */
  readonly changing: Int32Array;
  /** One bit for every toggle wall, which flip together; -1 when the level has none. */
  readonly toggles: Int32Array;
  /** Cells that start with an object a block can never reach: one bit, set while it lies there. */
  readonly fixed: Int32Array;
  /** Cells a block can reach, starting empty or with a block: one bit, set while a block stands there. */
  readonly blockOnly: Int32Array;
  /** Cells a block can reach that start with another object: two bits, 0 empty, 1 the object, 2 a block. */
  readonly blockOrObject: Int32Array;
  /** Hazard slots, one per level hazard, used when no machine clones a hazard: the cell (`none` when gone) and the
   *  facing (2 bits, DIRS order). 0 when the hazards pack per cell. */
  readonly hazardSlots: number;
  /** The cells a hazard could ever stand on, used when a machine clones one: `hazardBits` each, 0 empty, else
   *  1 + facing + 4 × home. Empty when the hazards pack as slots. */
  readonly hazardCells: Int32Array;
  readonly hazardBits: number;
  /** Each home's hazard kind: the level's hazards, then the hazard-template machines. */
  readonly homeKinds: readonly HazardKind[];
  /** Where the terrain's bits (changing, then the toggle bit), the objects' bits (fixed, blockOnly, blockOrObject)
   *  and the hazards' bits start. */
  readonly terrainAt: number;
  readonly objectsAt: number;
  readonly hazardsAt: number;
  /** The level's cells, `row * cols + col`, one object each: unpacked situations share them. */
  readonly cells: readonly Cell[];
  /** Terrain and objects arrays already unpacked, by their bits (terrainOf, objectsOf). */
  readonly terrains: Map<number | string, readonly Terrain[]>;
  readonly objectLists: Map<number | string, readonly (ObjectKind | null)[]>;
}

const TOOL_LIST: readonly Tool[] = ['mirror', 'cake', 'cow'];
/** Bits that hold 0 to `n`. */
const bits = (n: number): number => (n <= 0 ? 0 : 32 - Math.clz32(n));

const layouts = new WeakMap<Level, Layout>();

export function layoutOf(level: Level): Layout {
  let l = layouts.get(level);
  if (!l) layouts.set(level, l = build(level));
  return l;
}

/** The cells a pushed block could ever stand on: a flood from the blocks' own cells and the cells block machines
 *  clone into. A block steps onto an adjacent cell it may enter when the player can stand behind it to push, or
 *  when it rides ice or a force floor there; stepping into a teleport, it comes out onto the cell beyond any
 *  teleport that way. Generous: a door or a fake wall counts as floor, and any non-wall cell as somewhere to
 *  stand. */
function blockCells(lv: Level): Set<number> {
  const reach = new Set<number>();
  const todo: number[] = [];
  const enterable = (i: number) => {
    const t = lv.terrain[i]!;
    return TERRAIN[t].block || TERRAIN[t].door !== undefined || t === 'fake-wall';
  };
  const mino = lv.minotaur ? lv.minotaur.r * lv.cols + lv.minotaur.c : -1;
  const inside = (r: number, c: number) => r >= 0 && c >= 0 && r < lv.rows && c < lv.cols;
  const add = (b: number) => {
    if (reach.has(b) || b === mino || !enterable(b)) return;
    reach.add(b);
    todo.push(b);
  };
  lv.objects.forEach((o, i) => { if (o === 'block') { reach.add(i); todo.push(i); } });
  for (const m of lv.machines) {
    const r = m.at.r + DELTA[m.dir][0], c = m.at.c + DELTA[m.dir][1];
    if (m.template === 'block' && inside(r, c)) add(r * lv.cols + c);
  }
  const teleports: number[] = [];
  lv.terrain.forEach((t, i) => { if (t === 'teleport') teleports.push(i); });
  while (todo.length) {
    const a = todo.pop()!;
    const ar = Math.floor(a / lv.cols), ac = a % lv.cols;
    const t = TERRAIN[lv.terrain[a]!];
    const rides = t.slides !== undefined || t.carries !== undefined;
    for (const d of DIRS) {
      const [dr, dc] = DELTA[d];
      const r = ar + dr, c = ac + dc;
      if (!inside(r, c)) continue;
      const pr = ar - dr, pc = ac - dc;
      const stands = inside(pr, pc) && lv.terrain[pr * lv.cols + pc] !== 'wall';
      if (!stands && !rides) continue;
      const b = r * lv.cols + c;
      if (lv.terrain[b] !== 'teleport') {
        add(b);
        continue;
      }
      for (const via of teleports) {
        const vr = Math.floor(via / lv.cols) + dr, vc = via % lv.cols + dc;
        if (inside(vr, vc)) add(vr * lv.cols + vc);
      }
    }
  }
  return reach;
}

/** Terrain whose cells change once during a try, and what each becomes; doors open to floor as well. */
const CHANGES_TO: Partial<Record<Terrain, Terrain>> = {
  water: 'dirt', popup: 'wall', 'fake-wall': 'floor', 'invisible-wall': 'wall', bomb: 'floor',
};
const changesTo = (t: Terrain): Terrain | undefined => CHANGES_TO[t] ?? (TERRAIN[t].door !== undefined ? 'floor' : undefined);

/** The cells a hazard of one of `kinds` could ever stand on: terrain a hazard may stand on, or may once it changes
 *  (water fills in, a door or fake wall opens, a toggle wall flips), and the terrain one of the kinds crosses. */
function hazardGround(lv: Level, kinds: readonly HazardKind[]): number[] {
  const crosses = new Set(kinds.map(k => HAZARDS[k].crosses));
  const out: number[] = [];
  lv.terrain.forEach((t, i) => {
    const later = changesTo(t);
    if (TERRAIN[t].hazard || crosses.has(t) || t === 'toggle-closed' || (later && TERRAIN[later].hazard)) out.push(i);
  });
  return out;
}

function build(lv: Level): Layout {
  const count = (kind: ObjectKind) => lv.objects.filter(o => o === kind).length;
  const blocks = blockCells(lv);
  const changing: number[] = [];
  const toggles: number[] = [];
  const fixed: number[] = [];
  const blockOnly: number[] = [];
  const blockOrObject: number[] = [];
  lv.terrain.forEach((t, i) => {
    if (changesTo(t)) changing.push(i);
    else if (t === 'toggle-open' || t === 'toggle-closed') toggles.push(i);
    const o = lv.objects[i]!;
    if (blocks.has(i)) (o && o !== 'block' ? blockOrObject : blockOnly).push(i);
    else if (o) fixed.push(i);
  });
  const cells = lv.rows * lv.cols;
  const keyBits = KEY_COLORS.map(k => bits(count(`key-${k}`)));
  const toolBits = TOOL_LIST.map(t => bits(count(t)));
  const gear = GEAR.filter(g => count(g) > 0);
  const cellBits = bits(cells);
  const cow = count('cow') > 0;
  const mino = lv.minotaur !== null;
  const stoneBits = count('mirror') > 0 ? 2 : 0;
  const heartAt = cellBits * (2 + (mino ? 1 : 0) + (cow ? 1 : 0)) + stoneBits;
  // The hearts field holds every count a try can reach: the starting hearts plus one a honey cake.
  const heartBits = bits(maxHearts(lv));
  const pageAt = heartAt + heartBits + bits(lv.relics);
  const keyAt: number[] = [];
  let at = pageAt + lv.pageIds.length;
  for (const b of keyBits) { keyAt.push(at); at += b; }
  const toolAt: number[] = [];
  for (const b of toolBits) { toolAt.push(at); at += b; }
  const homeKinds: HazardKind[] = [...lv.hazards.map(h => h.kind)];
  for (const m of lv.machines) if (m.home !== undefined) homeKinds[m.home] = m.template as HazardKind;
  const cloning = homeKinds.length > lv.hazards.length;
  const hazardSlots = cloning ? 0 : lv.hazards.length;
  const hazardCells = cloning ? hazardGround(lv, homeKinds) : [];
  const hazardBits = cloning ? bits(4 * homeKinds.length) : 0;
  const total = cellBits * (2 + (mino ? 1 : 0) + (cow ? 1 : 0)) + stoneBits + heartBits + bits(lv.relics) + lv.pageIds.length
    + keyBits.reduce((a, b) => a + b, 0) + toolBits.reduce((a, b) => a + b, 0) + gear.length
    + changing.length + (toggles.length ? 1 : 0) + fixed.length + blockOnly.length + 2 * blockOrObject.length
    + hazardSlots * (cellBits + 2) + hazardCells.length * hazardBits;
  const terrainAt = at + gear.length;
  const objectsAt = terrainAt + changing.length + (toggles.length ? 1 : 0);
  const hazardsAt = objectsAt + fixed.length + blockOnly.length + 2 * blockOrObject.length;
  const cellList: Cell[] = [];
  for (let i = 0; i < cells; i++) cellList.push({ r: Math.floor(i / lv.cols), c: i % lv.cols });
  return {
    terrainAt, objectsAt, hazardsAt, cells: cellList, terrains: new Map(), objectLists: new Map(),
    words: Math.max(1, Math.ceil(total / 32)), cellBits, none: cells, minotaur: mino, cow, stoneBits,
    heartBits, relicBits: bits(lv.relics), pageBits: lv.pageIds.length, keyBits, toolBits, gear,
    heartAt, pageAt, keyAt, toolAt, gearAt: at,
    changing: Int32Array.from(changing), toggles: Int32Array.from(toggles), fixed: Int32Array.from(fixed),
    blockOnly: Int32Array.from(blockOnly), blockOrObject: Int32Array.from(blockOrObject),
    hazardSlots, hazardCells: Int32Array.from(hazardCells), hazardBits, homeKinds,
  };
}

/** Writes `width` bits of `v` at bit `pos` of the words from `at`; the words are zero. Returns the next bit. */
export function put(out: Uint32Array, at: number, pos: number, width: number, v: number): number {
  if (width === 0) return pos;
  const w = at + (pos >>> 5);
  const sh = pos & 31;
  out[w]! |= v << sh;
  if (sh + width > 32) out[w + 1]! |= v >>> (32 - sh);
  return pos + width;
}

/** Reads `width` bits at bit `pos`. */
export function get(words: Uint32Array, at: number, pos: number, width: number): number {
  if (width === 0) return 0;
  const w = at + (pos >>> 5);
  const sh = pos & 31;
  let v = words[w]! >>> sh;
  if (sh + width > 32) v |= words[w + 1]! << (32 - sh);
  return width === 32 ? v >>> 0 : v & ((1 << width) - 1);
}

const cellOf = (s: State, x: { r: number; c: number } | null, none: number): number => (x ? x.r * s.level.cols + x.c : none);

/** Each direction's place in DIRS. */
const DIR_INDEX: Readonly<Record<Dir, number>> = { up: 0, down: 1, left: 2, right: 3 };

/** Copies `width` bits at bit `pos` of `from` (from word `fromAt`) to the same place in `out` (from word `at`); the
 *  bits there are zero. */
function copyBits(from: Uint32Array, fromAt: number, out: Uint32Array, at: number, pos: number, width: number): void {
  for (let p = pos, end = pos + width; p < end; p += 30) {
    const n = Math.min(30, end - p);
    put(out, at, p, n, get(from, fromAt, p, n));
  }
}

/** The situation `s` packed into `out` from word `at`. When `parent` is given (the situation `s` was played from,
 *  packed in `parentWords` from `parentAt`), the terrain or objects `s` shares with it are copied as packed there. */
export function pack(s: State, layout: Layout, out: Uint32Array, at: number, parent?: State, parentWords?: Uint32Array, parentAt = 0): void {
  const l = layout;
  for (let i = 0; i < l.words; i++) out[at + i] = 0;
  let p = 0;
  p = put(out, at, p, l.cellBits, cellOf(s, s.player, l.none));
  p = put(out, at, p, l.cellBits, cellOf(s, s.throwBack, l.none));
  if (l.minotaur) p = put(out, at, p, l.cellBits, cellOf(s, s.minotaur, l.none));
  if (l.cow) p = put(out, at, p, l.cellBits, cellOf(s, s.cow, l.none));
  p = put(out, at, p, l.stoneBits, s.stone);
  p = put(out, at, p, l.heartBits, s.hearts);
  p = put(out, at, p, l.relicBits, s.relicsLeft);
  p = put(out, at, p, l.pageBits, s.pages);
  const keys = s.keys, tools = s.tools;
  p = put(out, at, p, l.keyBits[0]!, keys.red);
  p = put(out, at, p, l.keyBits[1]!, keys.blue);
  p = put(out, at, p, l.keyBits[2]!, keys.yellow);
  p = put(out, at, p, l.keyBits[3]!, keys.green);
  p = put(out, at, p, l.toolBits[0]!, tools.mirror);
  p = put(out, at, p, l.toolBits[1]!, tools.cake);
  p = put(out, at, p, l.toolBits[2]!, tools.cow);
  for (let g = 0; g < l.gear.length; g++) p = put(out, at, p, 1, s.gear.includes(l.gear[g]!) ? 1 : 0);
  const terrain = s.terrain, objects = s.objects, first = s.level.terrain;
  if (parent && parentWords && terrain === parent.terrain) copyBits(parentWords, parentAt, out, at, l.terrainAt, l.objectsAt - l.terrainAt);
  else {
    for (let k = 0; k < l.changing.length; k++) {
      const i = l.changing[k]!;
      put(out, at, l.terrainAt + k, 1, terrain[i] === first[i] ? 0 : 1);
    }
    if (l.toggles.length) put(out, at, l.objectsAt - 1, 1, terrain[l.toggles[0]!] === first[l.toggles[0]!] ? 0 : 1);
  }
  if (parent && parentWords && objects === parent.objects) copyBits(parentWords, parentAt, out, at, l.objectsAt, l.hazardsAt - l.objectsAt);
  else {
    p = l.objectsAt;
    for (let k = 0; k < l.fixed.length; k++) p = put(out, at, p, 1, objects[l.fixed[k]!] ? 1 : 0);
    for (let k = 0; k < l.blockOnly.length; k++) p = put(out, at, p, 1, objects[l.blockOnly[k]!] === 'block' ? 1 : 0);
    for (let k = 0; k < l.blockOrObject.length; k++) {
      const o = objects[l.blockOrObject[k]!];
      p = put(out, at, p, 2, o === 'block' ? 2 : o ? 1 : 0);
    }
  }
  p = l.hazardsAt;
  const hazards = s.hazards;
  if (l.hazardSlots > 1) {
    for (let i = 1; i < hazards.length; i++) {
      if (cellOf(s, hazards[i]!.at, l.none) < cellOf(s, hazards[i - 1]!.at, l.none)) throw new Error('the hazards must be sorted by cell');
    }
  }
  for (let home = 0; home < l.hazardSlots; home++) {
    let h: Hazard | undefined;
    for (let i = 0; i < hazards.length; i++) if (hazards[i]!.home === home) { h = hazards[i]; break; }
    p = put(out, at, p, l.cellBits, h ? cellOf(s, h.at, l.none) : l.none);
    p = put(out, at, p, 2, h ? DIR_INDEX[h.dir] : 0);
  }
  // The hazards are sorted by cell, as the cells are: one pass pairs them.
  let k = 0;
  for (let c = 0; c < l.hazardCells.length; c++) {
    const i = l.hazardCells[c]!;
    const h = hazards[k];
    const here = h !== undefined && cellOf(s, h.at, l.none) === i;
    p = put(out, at, p, l.hazardBits, here ? 1 + DIR_INDEX[h.dir] + 4 * h.home : 0);
    if (here) k++;
  }
  // A hazard out of cell order, or off every hazard cell, would be passed over without a sign.
  if (l.hazardCells.length && k !== hazards.length) throw new Error(`packed ${k} of ${hazards.length} hazards: they must be sorted by cell`);
}

/** Unpacked terrain and objects arrays kept per level at most; past it they are forgotten and made again. */
const BOARDS_KEPT = 4096;

/** The `width` bits at `pos` as a key: a number up to 30 bits, else a string of 30-bit parts. */
function bitsKey(words: Uint32Array, at: number, pos: number, width: number): number | string {
  if (width <= 30) return get(words, at, pos, width);
  let key = '';
  for (let p = pos, end = pos + width; p < end; p += 30) key += get(words, at, p, Math.min(30, end - p)) + ',';
  return key;
}

/** The terrain the situation in the words holds: the level's, changed where its bits say. Made once per pattern of
 *  bits and shared by every situation with it, so never written to (a turn copies it first, work.ts). */
function terrainOf(words: Uint32Array, at: number, l: Layout, level: Level): readonly Terrain[] {
  const width = l.objectsAt - l.terrainAt;
  if (width === 0) return level.terrain;
  const key = bitsKey(words, at, l.terrainAt, width);
  const kept = l.terrains.get(key);
  if (kept) return kept;
  const made: Terrain[] = [...level.terrain];
  for (let k = 0; k < l.changing.length; k++) {
    if (!get(words, at, l.terrainAt + k, 1)) continue;
    const i = l.changing[k]!;
    made[i] = changesTo(level.terrain[i]!)!;
  }
  if (l.toggles.length && get(words, at, l.objectsAt - 1, 1)) {
    for (const i of l.toggles) made[i] = level.terrain[i] === 'toggle-open' ? 'toggle-closed' : 'toggle-open';
  }
  if (l.terrains.size >= BOARDS_KEPT) l.terrains.clear();
  l.terrains.set(key, made);
  return made;
}

/** The objects the situation in the words holds, made once per pattern of bits and shared as terrainOf's are. */
function objectsOf(words: Uint32Array, at: number, l: Layout, level: Level): readonly (ObjectKind | null)[] {
  const width = l.hazardsAt - l.objectsAt;
  if (width === 0) return level.objects;
  const key = bitsKey(words, at, l.objectsAt, width);
  const kept = l.objectLists.get(key);
  if (kept) return kept;
  const made: (ObjectKind | null)[] = [...level.objects];
  let p = l.objectsAt;
  for (const i of l.fixed) if (!get(words, at, p++, 1)) made[i] = null;
  for (const i of l.blockOnly) made[i] = get(words, at, p++, 1) ? 'block' : null;
  for (const i of l.blockOrObject) {
    const v = get(words, at, p, 2);
    p += 2;
    if (v === 0) made[i] = null;
    else if (v === 2) made[i] = 'block';
  }
  if (l.objectLists.size >= BOARDS_KEPT) l.objectLists.clear();
  l.objectLists.set(key, made);
  return made;
}

/** The situation packed in the words; `moves` is what it says (moves are not packed). Its terrain, objects and cells
 *  are shared with other situations unpacked from the same layout, so nothing may write to them. */
export function unpack(words: Uint32Array, at: number, layout: Layout, level: Level, moves = 0): State {
  const l = layout;
  const cells = l.cells, none = l.none, cb = l.cellBits;
  let p = 0;
  const player = cells[get(words, at, p, cb)]!; p += cb;
  const throwBack = cells[get(words, at, p, cb)]!; p += cb;
  let minotaur: Cell | null = null, cow: Cell | null = null;
  if (l.minotaur) { const v = get(words, at, p, cb); p += cb; minotaur = v === none ? null : cells[v]!; }
  if (l.cow) { const v = get(words, at, p, cb); p += cb; cow = v === none ? null : cells[v]!; }
  const stone = get(words, at, p, l.stoneBits); p += l.stoneBits;
  const hearts = get(words, at, p, l.heartBits); p += l.heartBits;
  const relicsLeft = get(words, at, p, l.relicBits); p += l.relicBits;
  const pages = get(words, at, p, l.pageBits); p += l.pageBits;
  const kb = l.keyBits, tb = l.toolBits;
  const red = get(words, at, p, kb[0]!); p += kb[0]!;
  const blue = get(words, at, p, kb[1]!); p += kb[1]!;
  const yellow = get(words, at, p, kb[2]!); p += kb[2]!;
  const green = get(words, at, p, kb[3]!); p += kb[3]!;
  const keys: Record<KeyColor, number> = { red, blue, yellow, green };
  const mirror = get(words, at, p, tb[0]!); p += tb[0]!;
  const cake = get(words, at, p, tb[1]!); p += tb[1]!;
  const cows = get(words, at, p, tb[2]!); p += tb[2]!;
  const tools: Record<Tool, number> = { mirror, cake, cow: cows };
  const gear: Gear[] = [];
  for (let g = 0; g < l.gear.length; g++) if (get(words, at, p++, 1)) gear.push(l.gear[g]!);
  const terrain = terrainOf(words, at, l, level);
  const objects = objectsOf(words, at, l, level);
  p = l.hazardsAt;
  const hazards: Hazard[] = [];
  for (let home = 0; home < l.hazardSlots; home++) {
    const i = get(words, at, p, cb); p += cb;
    const dir = DIRS[get(words, at, p, 2)]!; p += 2;
    if (i !== none) hazards.push({ kind: l.homeKinds[home]!, at: cells[i]!, dir, home });
  }
  if (hazards.length > 1) hazards.sort((a, b) => a.at.r * level.cols + a.at.c - (b.at.r * level.cols + b.at.c));
  for (let c = 0; c < l.hazardCells.length; c++) {
    const v = get(words, at, p, l.hazardBits); p += l.hazardBits;
    if (!v) continue;
    const home = (v - 1) >>> 2;
    hazards.push({ kind: l.homeKinds[home]!, at: cells[l.hazardCells[c]!]!, dir: DIRS[(v - 1) & 3]!, home });
  }
  return {
    // The order of `initial`'s keys: states of one shape keep `step` monomorphic.
    level, terrain, objects, player, hearts, keys, gear, tools, pages, throwBack, minotaur, stone, cow, hazards,
    relicsLeft, moves, outcome: 'playing',
  };
}
