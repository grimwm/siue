// websites/www.cs/games/crete/test/corpus.ts
// A deterministic generator of small levels, 5x5 to 9x9, for the same-answers test. Not a test file.
import { parse, serialize } from '../src/puzzle/level.ts';
import type { Level } from '../src/puzzle/level.ts';
import { initial } from '../src/puzzle/state.ts';
import { solveBfs, solveBfsRefusing, caught } from './reference-solver.ts';

/** Levels the reference cannot finish within this many states are left out, to keep the corpus quick. */
export const CORPUS_CAP = 60_000;

const answers = new WeakMap<Level, ReturnType<typeof solveBfs>>();
/** The reference's answer at CORPUS_CAP, solved once per level. */
export function reference(lv: Level) {
  let r = answers.get(lv);
  if (!r) answers.set(lv, r = solveBfs(initial(lv), CORPUS_CAP));
  return r;
}

const refusing = new WeakMap<Level, ReturnType<typeof solveBfs>>();
/** The reference's answer at CORPUS_CAP when a catch is a dead end, solved once per level. */
export function referenceRefusing(lv: Level) {
  let r = refusing.get(lv);
  if (!r) refusing.set(lv, r = solveBfsRefusing(initial(lv), caught, CORPUS_CAP));
  return r;
}

/** mulberry32: a small seeded generator. */
export function prng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Each entry: the tiles that may be placed, and the most of them a level gets. A tile is dropped on a random floor
 *  cell. The first CLASSIC entries share a third of the level's cells; the trap and trick pieces and the hazards
 *  after them come less often and share an eighth of the cells, so they join the classic mix rather than crowd it
 *  out. */
export const SCATTER: readonly (readonly [string, number])[] = [
  ['#', 9], ['*', 3], ['|', 1], ['r', 1], ['R', 1], ['b', 1], ['B', 1], ['~', 4], ['f', 1], ['F', 3], ['h', 1],
  ['=', 4], ['k', 1], ['^', 2], ['v', 2], ['<', 2], ['>', 2], ['O', 3], ['_', 1], ['t', 2], ['T', 2], ['S', 2],
  ['%', 3], ['u', 1], ['z', 1], ['x', 1], ['c', 1], ['y', 1], ['Y', 1], ['g', 1], ['G', 1],
  ['&', 1], ['-', 1], ['+', 1], [';', 2], [':', 2], ['W', 1], ['I', 1], ['@', 2], ['$', 1], ['!', 2], ['C', 1],
  ['o', 1], ['w', 1], ['e', 1],
];
const CLASSIC = 31;

const DIRECTIONS = ['up', 'down', 'left', 'right'] as const;
const TEMPLATES = ['block', 'ball', 'glider', 'fireball'] as const;

function candidate(rand: () => number): Level {
  const pick = (n: number) => Math.floor(rand() * n);
  const rows = 5 + pick(5);
  const cols = 5 + pick(5);
  const g: string[][] = Array.from({ length: rows }, () => Array<string>(cols).fill('.'));
  const free = () => {
    for (;;) {
      const r = pick(rows), c = pick(cols);
      if (g[r]![c] === '.') return [r, c] as const;
    }
  };
  const put = (ch: string) => { const [r, c] = free(); g[r]![c] = ch; };
  put('P');
  put('E');
  if (rand() < 0.5) put('M');
  const scatter = (entries: typeof SCATTER, chance: number, room: { left: number }) => {
    for (const [ch, most] of entries) {
      if (rand() > chance) continue;
      // Walls come at least two at a time, and teleports too: a lone teleport is only a wall.
      const n = ch === '#' || ch === '@' ? 2 + pick(most) : 1 + pick(most);
      for (let i = 0; i < n && room.left > 0; i++, room.left--) put(ch);
    }
  };
  scatter(SCATTER.slice(0, CLASSIC), 0.45, { left: Math.floor(rows * cols / 3) });
  scatter(SCATTER.slice(CLASSIC), 0.25, { left: Math.floor(rows * cols / 8) });
  // A lock is no puzzle without its key, a toggle wall without its button, a snare without its brown button or a
  // clone machine without its red one: pair them most of the time.
  const has = (ch: string) => g.some(row => row.includes(ch));
  const pairs = [['R', 'r'], ['B', 'b'], ['Y', 'y'], ['G', 'g'], ['T', '_'], ['t', '_'], ['~', 'f'], ['F', 'h'], ['&', '-'], ['C', '+']] as const;
  for (const [lock, key] of pairs) {
    if (has(lock) && !has(key) && rand() < 0.8) put(key);
  }
  // Often wall the exit in with a lock, water or fire: the exit area is reachable by plain flood fill, and only
  // the right key or gear (or none, when the level has neither) gets there.
  if (rand() < 0.4) {
    const [er, ec] = g.flatMap((row, r) => row.flatMap((ch, c) => (ch === 'E' ? [[r, c] as const] : [])))[0]!;
    const lock = ['R', 'B', 'Y', 'G', '~', 'F'][pick(6)]!;
    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]] as const) {
      if (g[er + dr]?.[ec + dc] === '.') g[er + dr]![ec + dc] = lock;
    }
  }
  const hearts = rand() < 0.6 ? '' : `hearts: ${1 + pick(5)}\n`;
  // Some levels ask for fewer relics than the grid holds.
  const onGrid = g.reduce((n, row) => n + row.filter(ch => ch === '*').length, 0);
  const relics = onGrid > 0 && rand() < 0.25 ? `relics: ${pick(onGrid)}\n` : '';
  // One direction per hazard and one template and direction per clone machine, in reading order.
  const cells = g.flat();
  const hazards = cells.filter(ch => ch === 'o' || ch === 'w' || ch === 'e').map(() => DIRECTIONS[pick(4)]);
  const machines = cells.filter(ch => ch === 'C').map(() => `${TEMPLATES[pick(4)]}-${DIRECTIONS[pick(4)]}`);
  const facing = hazards.length ? `facing: ${hazards.join(' ')}\n` : '';
  const made = machines.length ? `machines: ${machines.join(' ')}\n` : '';
  return parse(`title: corpus\nintro: generated\n${hearts}${relics}${facing}${made}\n${g.map(row => row.join('')).join('\n')}\n`);
}

/** `count` levels from `seed`, the same every run. A level the reference does not finish within CORPUS_CAP
 *  states, plain or refusing catches, is replaced by the next candidate from the same stream. */
export function corpus(seed: number, count: number): Level[] {
  const rand = prng(seed);
  const out: Level[] = [];
  while (out.length < count) {
    const lv = candidate(rand);
    const r = reference(lv);
    if (!r.solved && r.capped) continue;
    const refused = referenceRefusing(lv);
    if (!refused.solved && refused.capped) continue;
    parse(serialize(lv));
    out.push(lv);
  }
  return out;
}
