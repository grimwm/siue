/* The Island of Crete: the level editor's document. A draft is a grid of legend
 * characters (src/puzzle/tiles.ts) plus one `extra` string per cell for what a
 * character cannot say: a hazard's facing, a machine's `<template>-<dir>`, a
 * page's id. `toText` writes the level text; a draft always parses, because
 * `paint` and `resize` keep exactly one player, unique valid page ids and at
 * most 31 pages. DOM-free. */
import { TERRAIN, OBJECTS, HAZARDS } from '../puzzle/tiles.ts';
import type { Cell, Terrain, ObjectKind, HazardKind, Template, Dir } from '../puzzle/tiles.ts';
import { parse } from '../puzzle/level.ts';
import type { Level } from '../puzzle/level.ts';

export type Brush =
  | { kind: 'terrain'; t: Terrain } | { kind: 'object'; o: ObjectKind }
  | { kind: 'player' } | { kind: 'minotaur' } | { kind: 'erase' }
  | { kind: 'hazard'; h: HazardKind; dir: Dir }
  | { kind: 'machine'; template: Template; dir: Dir }
  | { kind: 'page'; id: string };             // owner only

export interface Draft {
  readonly rows: number; readonly cols: number;
  /** One legend character per cell, row-major. */
  readonly cells: readonly string[];
  /** Per cell: a hazard's facing, a machine's `<template>-<dir>`, a page's id; else null. */
  readonly extra: readonly (string | null)[];
  readonly hearts: number;
  /** null: every relic on the board. */
  readonly relics: number | null;
  readonly id: string; readonly title: string; readonly intro: string;   // owner only
}

export const MIN_SIDE = 3, MAX_SIDE = 64;
const MAX_PAGES = 31;
const PAGE_ID = /^[a-z0-9-]+$/;
const FLOOR = TERRAIN.floor.char;
const WALL = TERRAIN.wall.char;
const PAGE = OBJECTS.page.char;
const CLONE = TERRAIN.clone.char;
const HAZARD_CHARS = new Set(Object.values(HAZARDS).map(h => h.char));
const clampSide = (n: number): number => Math.min(MAX_SIDE, Math.max(MIN_SIDE, Math.trunc(n) || MIN_SIDE));

export function newDraft(rows: number, cols: number): Draft {
  const r = clampSide(rows), c = clampSide(cols);
  const cells: string[] = [];
  for (let y = 0; y < r; y++) for (let x = 0; x < c; x++) cells.push(y === 0 || x === 0 || y === r - 1 || x === c - 1 ? WALL : FLOOR);
  cells[1 * c + 1] = 'P';
  // A 3 x 3 board has one inside cell; it holds the player and no exit.
  if (r - 2 !== 1 || c - 2 !== 1) cells[(r - 2) * c + (c - 2)] = TERRAIN.exit.char;
  return { rows: r, cols: c, cells, extra: cells.map(() => null), hearts: 3, relics: null, id: '', title: '', intro: '' };
}

/** The lowest `page-N` not in `used`. */
function freePageId(used: ReadonlySet<string>): string {
  for (let n = 1; ; n++) if (!used.has(`page-${n}`)) return `page-${n}`;
}

export function paint(d: Draft, at: Cell, b: Brush): Draft {
  if (at.r < 0 || at.c < 0 || at.r >= d.rows || at.c >= d.cols) return d;
  const i = at.r * d.cols + at.c;
  const here = d.cells[i]!;
  let ch: string;
  let ex: string | null = null;
  let moved = -1;   // the old cell of the player or Minotaur this brush moves
  switch (b.kind) {
    case 'player':
      if (here === 'P') return d;
      ch = 'P'; moved = d.cells.indexOf('P');
      break;
    case 'minotaur':
      if (here === 'P' || here === 'M') return d;
      ch = 'M'; moved = d.cells.indexOf('M');
      break;
    case 'erase': ch = FLOOR; break;
    case 'terrain':
      ch = TERRAIN[b.t].char;
      if (ch === CLONE) ex = here === CLONE ? d.extra[i]! : 'block-up';
      break;
    case 'object':
      if (b.o === 'page') return paint(d, at, { kind: 'page', id: '' });
      ch = OBJECTS[b.o].char;
      break;
    case 'hazard': ch = HAZARDS[b.h].char; ex = b.dir; break;
    case 'machine': ch = CLONE; ex = `${b.template}-${b.dir}`; break;
    case 'page': {
      const others = d.extra.filter((e, j) => d.cells[j] === PAGE && j !== i);
      if (here !== PAGE && others.length >= MAX_PAGES) return d;
      const used = new Set(others as string[]);
      ch = PAGE;
      ex = PAGE_ID.test(b.id) && !used.has(b.id) ? b.id : freePageId(used);
      break;
    }
  }
  if (here === 'P' && b.kind !== 'player') return d;   // the player always stands on floor
  if (ch === here && ex === d.extra[i]) return d;
  const cells = d.cells.slice();
  const extra = d.extra.slice();
  if (moved >= 0) { cells[moved] = FLOOR; extra[moved] = null; }
  cells[i] = ch; extra[i] = ex;
  return { ...d, cells, extra };
}

export function resize(d: Draft, rows: number, cols: number): Draft {
  const r = clampSide(rows), c = clampSide(cols);
  if (r === d.rows && c === d.cols) return d;
  const cells: string[] = [];
  const extra: (string | null)[] = [];
  for (let y = 0; y < r; y++) for (let x = 0; x < c; x++) {
    const inside = y < d.rows && x < d.cols;
    cells.push(inside ? d.cells[y * d.cols + x]! : FLOOR);
    extra.push(inside ? d.extra[y * d.cols + x]! : null);
  }
  if (!cells.includes('P')) {
    let at = cells.indexOf(FLOOR);
    if (at < 0) at = 0;
    cells[at] = 'P'; extra[at] = null;
  }
  return { ...d, rows: r, cols: c, cells, extra };
}

/** The level text for a draft. `forShare` leaves out title, intro and page ids (a page becomes floor). */
export function toText(d: Draft, forShare: boolean): string {
  const oneLine = (s: string): string => s.replace(/[\r\n]+/g, ' ');
  const head: string[] = [];
  if (!forShare) head.push(`title: ${oneLine(d.title)}`, `intro: ${oneLine(d.intro)}`);
  if (d.hearts !== 3) head.push(`hearts: ${Math.min(99, Math.max(1, Math.trunc(d.hearts)))}`);
  const relicsOnGrid = d.cells.filter(ch => ch === OBJECTS.relic.char).length;
  if (d.relics !== null) head.push(`relics: ${Math.min(relicsOnGrid, Math.max(0, Math.trunc(d.relics)))}`);
  const pages: string[] = [], facing: string[] = [], machines: string[] = [];
  const rows: string[] = [];
  for (let y = 0; y < d.rows; y++) {
    let row = '';
    for (let x = 0; x < d.cols; x++) {
      const i = y * d.cols + x;
      let ch = d.cells[i]!;
      if (ch === PAGE) {
        if (forShare) ch = FLOOR; else pages.push(d.extra[i]!);
      } else if (HAZARD_CHARS.has(ch)) facing.push(d.extra[i] ?? 'up');
      else if (ch === CLONE) machines.push(d.extra[i] ?? 'block-up');
      row += ch;
    }
    rows.push(row);
  }
  if (pages.length > 0) head.push(`pages: ${pages.join(' ')}`);
  if (facing.length > 0) head.push(`facing: ${facing.join(' ')}`);
  if (machines.length > 0) head.push(`machines: ${machines.join(' ')}`);
  return `${head.join('\n')}${head.length > 0 ? '\n\n' : ''}${rows.join('\n')}\n`;
}

export function fromLevel(lv: Level): Draft {
  const cells: string[] = [];
  const extra: (string | null)[] = lv.terrain.map(() => null);
  lv.terrain.forEach((t, i) => cells.push(lv.objects[i] ? OBJECTS[lv.objects[i]!].char : TERRAIN[t].char));
  for (const h of lv.hazards) { const i = h.at.r * lv.cols + h.at.c; cells[i] = HAZARDS[h.kind].char; extra[i] = h.dir; }
  for (const m of lv.machines) extra[m.at.r * lv.cols + m.at.c] = `${m.template}-${m.dir}`;
  lv.pageCells.forEach((i, k) => { extra[i] = lv.pageIds[k]!; });
  cells[lv.player.r * lv.cols + lv.player.c] = 'P';
  if (lv.minotaur) cells[lv.minotaur.r * lv.cols + lv.minotaur.c] = 'M';
  const relicsOnGrid = lv.objects.filter(o => o === 'relic').length;
  return {
    rows: lv.rows, cols: lv.cols, cells, extra, hearts: lv.hearts,
    relics: lv.relics === relicsOnGrid ? null : lv.relics, id: '', title: lv.title, intro: lv.intro,
  };
}

export function toLevel(d: Draft): Level {
  return parse(toText(d, false));
}
