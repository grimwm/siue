/* The Island of Crete: the level text. A header of `name: value` lines, a blank
 * line, then the grid, one legend character per cell (src/puzzle/tiles.ts).
 * `parse` reports a bad level by line and column; `serialize` writes the
 * canonical text back. The level editor writes this format. DOM-free. */
import { TERRAIN, OBJECTS } from './tiles.ts';
import type { Cell, Terrain, ObjectKind } from './tiles.ts';

export interface Level {
  readonly title: string;
  readonly intro: string;
  /** Hearts at the start, and the most a honey cake gives back to. */
  readonly hearts: number;
  /** Relics to take before the gate opens. */
  readonly relics: number;
  /** The `pages:` header's ids, in grid reading order; empty when the level has no page. */
  readonly pageIds: readonly string[];
  /** Row-major cell index of each `p`, in reading order (as long as `pageIds`). */
  readonly pageCells: readonly number[];
  readonly rows: number;
  readonly cols: number;
  /** Row-major, `rows * cols` long. */
  readonly terrain: readonly Terrain[];
  readonly objects: readonly (ObjectKind | null)[];
  readonly player: Cell;
  readonly minotaur: Cell | null;
}

export class LevelError extends Error {
  readonly line: number;
  readonly col: number;
  constructor(line: number, col: number, what: string) {
    super(`line ${line}, column ${col}: ${what}`);
    this.line = line;
    this.col = col;
  }
}

const TERRAIN_BY_CHAR = new Map(Object.entries(TERRAIN).map(([k, d]) => [d.char, k as Terrain]));
const OBJECT_BY_CHAR = new Map(Object.entries(OBJECTS).map(([k, d]) => [d.char, k as ObjectKind]));
const PAGE_ID = /^[a-z0-9-]+$/;
const HEADER = /^([a-z]+): (.*)$/;
const NAMES = ['title', 'intro', 'hearts', 'relics', 'pages'] as const;
type Name = typeof NAMES[number];

/** The ids of the `pages:` header, checked against the `count` of `p` cells on the grid. */
function pagesHeader(h: { value: string; line: number; col: number } | undefined, count: number): string[] {
  const ids = h && h.value !== '' ? h.value.split(' ') : [];
  const at = h ?? { line: 1, col: 1 };
  const seen = new Set<string>();
  for (const id of ids) {
    if (!PAGE_ID.test(id)) throw new LevelError(at.line, at.col, `page id '${id}' must be lower-case letters, digits and hyphens`);
    if (seen.has(id)) throw new LevelError(at.line, at.col, `page '${id}' named twice`);
    seen.add(id);
  }
  if (ids.length > 31) throw new LevelError(at.line, at.col, 'a level holds at most 31 pages');
  if (ids.length !== count) throw new LevelError(at.line, at.col, `pages: ${ids.length} named but the grid has ${count}`);
  return ids;
}

export function parse(text: string): Level {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const head: Partial<Record<Name, { value: string; line: number; col: number }>> = {};
  let i = 0;
  for (; i < lines.length; i++) {
    const m = HEADER.exec(lines[i]!);
    if (!m) break;
    if (!(NAMES as readonly string[]).includes(m[1]!)) throw new LevelError(i + 1, 1, `unknown header '${m[1]}'`);
    head[m[1] as Name] = { value: m[2]!, line: i + 1, col: m[1]!.length + 3 };
  }
  while (i < lines.length && lines[i] === '') i++;
  const first = i;
  const rows: string[] = [];
  for (; i < lines.length && lines[i] !== ''; i++) rows.push(lines[i]!);
  if (rows.length === 0) throw new LevelError(first + 1, 1, 'no grid');
  for (; i < lines.length; i++) if (lines[i]!.trim() !== '') throw new LevelError(i + 1, 1, 'text after the grid');
  const cols = rows[0]!.length;
  const terrain: Terrain[] = [];
  const objects: (ObjectKind | null)[] = [];
  let player: Cell | null = null;
  let minotaur: Cell | null = null;
  let relicsOnGrid = 0;
  const pageCells: number[] = [];
  rows.forEach((row, r) => {
    const line = first + r + 1;
    if (row.length !== cols) throw new LevelError(line, 1, `row is ${row.length} wide, expected ${cols}`);
    [...row].forEach((ch, c) => {
      const col = c + 1;
      if (ch === 'P' || ch === 'M') {
        if (ch === 'P' && player) throw new LevelError(line, col, 'second player');
        if (ch === 'M' && minotaur) throw new LevelError(line, col, 'second Minotaur');
        if (ch === 'P') player = { r, c }; else minotaur = { r, c };
        terrain.push('floor');
        objects.push(null);
        return;
      }
      const tk = TERRAIN_BY_CHAR.get(ch);
      const ok = OBJECT_BY_CHAR.get(ch);
      if (!tk && !ok) throw new LevelError(line, col, `unknown tile '${ch}'`);
      terrain.push(tk ?? 'floor');
      objects.push(ok ?? null);
      if (ok === 'relic') relicsOnGrid++;
      if (ok === 'page') pageCells.push(r * cols + c);
    });
  });
  if (!player) throw new LevelError(first + 1, 1, 'no player');
  const num = (name: 'hearts' | 'relics', fallback: number, min: number, max: number): number => {
    const h = head[name];
    if (!h) return fallback;
    const n = Number(h.value);
    if (!Number.isInteger(n) || n < min) throw new LevelError(h.line, h.col, `${name} must be ${min} to ${max}`);
    if (n > max) {
      const why = name === 'relics' ? `relics: ${h.value} but the grid has ${max}` : `${name} must be ${min} to ${max}`;
      throw new LevelError(h.line, h.col, why);
    }
    return n;
  };
  const hearts = num('hearts', 3, 1, 99);
  const relics = num('relics', relicsOnGrid, 0, relicsOnGrid);
  const pageIds = pagesHeader(head.pages, pageCells.length);
  return {
    title: head.title?.value ?? '', intro: head.intro?.value ?? '', hearts, relics, pageIds, pageCells,
    rows: rows.length, cols, terrain, objects, player, minotaur,
  };
}

export function serialize(lv: Level): string {
  if (/[\r\n]/.test(lv.title) || /[\r\n]/.test(lv.intro)) throw new Error('title and intro must be one line');
  const relicsOnGrid = lv.objects.filter(o => o === 'relic').length;
  const head = [`title: ${lv.title}`, `intro: ${lv.intro}`];
  if (lv.hearts !== 3) head.push(`hearts: ${lv.hearts}`);
  if (lv.relics !== relicsOnGrid) head.push(`relics: ${lv.relics}`);
  if (lv.pageIds.length > 0) head.push(`pages: ${lv.pageIds.join(' ')}`);
  const grid: string[] = [];
  for (let r = 0; r < lv.rows; r++) {
    let row = '';
    for (let c = 0; c < lv.cols; c++) {
      const i = r * lv.cols + c;
      if (lv.player.r === r && lv.player.c === c) row += 'P';
      else if (lv.minotaur && lv.minotaur.r === r && lv.minotaur.c === c) row += 'M';
      else row += lv.objects[i] ? OBJECTS[lv.objects[i]!].char : TERRAIN[lv.terrain[i]!].char;
    }
    grid.push(row);
  }
  return `${head.join('\n')}\n\n${grid.join('\n')}\n`;
}
