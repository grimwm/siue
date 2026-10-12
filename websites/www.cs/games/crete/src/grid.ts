/* The Island of Crete: the board's geometry. Cells and their keys, bounds, and
 * the breadth-first searches the rules, the creature and the bots share. Pure:
 * in the DOM-free program (tsconfig.json). */
export const ROWS = 15;
export const COLS = 15;

export interface Cell {
  r: number;
  c: number;
}

export const key = (r: number, c: number): string => r + "," + c;
export const inBounds = (r: number, c: number): boolean => r >= 0 && r < ROWS && c >= 0 && c < COLS;
export const manhattan = (a: Cell, b: Cell): number => Math.abs(a.r - b.r) + Math.abs(a.c - b.c);

export const DIRS: ReadonlyArray<readonly [number, number]> = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

/** A [row, column] pair from a cell key. */
export function unkey(k: string): [number, number] {
  const [r, c] = k.split(",").map(Number);
  return [r!, c!];
}

/** Every cell of a ROWS x COLS grid set to `value`. */
export function grid<T>(value: T): T[][] {
  return Array.from({ length: ROWS }, () => Array<T>(COLS).fill(value));
}

/** Steps from `t` to every cell (-1 where unreachable, or all -1 if `t` is a wall). */
export function bfsDist(walls: boolean[][], t: Cell): number[][] {
  const dist = grid(-1);
  if (walls[t.r]![t.c]) return dist;
  const q: Array<[number, number]> = [[t.r, t.c]];
  dist[t.r]![t.c] = 0;
  while (q.length) {
    const [r, c] = q.shift()!;
    for (const [dr, dc] of DIRS) {
      const nr = r + dr,
        nc = c + dc;
      if (inBounds(nr, nc) && !walls[nr]![nc] && dist[nr]![nc] === -1) {
        dist[nr]![nc] = dist[r]![c]! + 1;
        q.push([nr, nc]);
      }
    }
  }
  return dist;
}

/** The shortest route from `from` to `to`, both included; empty when there is none. */
export function bfsPath(walls: boolean[][], from: Cell, to: Cell): Cell[] {
  const dist = bfsDist(walls, to);
  if (dist[from.r]![from.c] === -1) return [];
  const path: Cell[] = [{ ...from }];
  let cur: Cell = { ...from };
  while (cur.r !== to.r || cur.c !== to.c) {
    const here = cur;
    const next = DIRS.map(([dr, dc]) => ({ r: here.r + dr, c: here.c + dc }))
      .filter(
        (p) =>
          inBounds(p.r, p.c) && !walls[p.r]![p.c] && dist[p.r]![p.c] !== -1,
      )
      .sort((a, b) => dist[a.r]![a.c]! - dist[b.r]![b.c]!)[0];
    if (!next) return [];
    path.push(next);
    cur = next;
  }
  return path;
}
