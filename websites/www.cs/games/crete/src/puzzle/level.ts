/* The Island of Crete: the level text. A header of `name: value` lines, a blank
 * line, then the grid, one legend character per cell (src/puzzle/tiles.ts).
 * `parse` reports a bad level by line and column; `serialize` writes the
 * canonical text back. The level editor writes this format. DOM-free. */
import { TERRAIN, OBJECTS, HAZARDS, DIRS } from './tiles.ts';
import type { Cell, Terrain, ObjectKind, Hazard, HazardKind, Template, Dir } from './tiles.ts';

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
  /** The moving hazards, in reading order; each stands on floor. */
  readonly hazards: readonly Hazard[];
  /** The clone machines, in reading order. */
  readonly machines: readonly {
    at: Cell; template: Template; dir: Dir;
    /** A hazard template's home index: the level's hazard count plus its place among hazard machines; derived, never written. */
    home?: number;
  }[];
  /** Button cell index to the trap or clone machine cell index it controls; derived, never written. */
  readonly links: Readonly<Record<number, number>>;
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
const HAZARD_BY_CHAR = new Map(Object.entries(HAZARDS).map(([k, d]) => [d.char, k as HazardKind]));
const TEMPLATES: readonly Template[] = ['block', 'ball', 'glider', 'fireball'];
const NAMES = ['title', 'intro', 'hearts', 'relics', 'pages', 'facing', 'machines'] as const;
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

type Header = { value: string; line: number; col: number } | undefined;

/** The words of a header that must hold exactly `count` of them, each passing `ok`. */
function words(name: string, h: Header, count: number, ok: (w: string) => boolean, what: string): string[] {
  const ws = h && h.value !== '' ? h.value.split(' ') : [];
  const at = h ?? { line: 1, col: 1 };
  for (const w of ws) if (!ok(w)) throw new LevelError(at.line, at.col, `${name}: '${w}' is not ${what}`);
  if (ws.length !== count) throw new LevelError(at.line, at.col, `${name}: ${ws.length} named but the grid has ${count}`);
  return ws;
}

/** Each button's control: brown buttons the next trap, red buttons the next clone machine, in reading order, wrapping. */
function linkButtons(terrain: readonly Terrain[]): Record<number, number> {
  const links: Record<number, number> = {};
  const n = terrain.length;
  terrain.forEach((t, i) => {
    const want = t === 'button-brown' ? 'trap' : t === 'button-red' ? 'clone' : null;
    if (!want) return;
    for (let k = 1; k <= n; k++) {
      const j = (i + k) % n;
      if (terrain[j] === want) { links[i] = j; return; }
    }
  });
  return links;
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
  const found: { kind: HazardKind; at: Cell }[] = [];
  const clones: Cell[] = [];
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
      const hk = HAZARD_BY_CHAR.get(ch);
      if (hk) {
        found.push({ kind: hk, at: { r, c } });
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
      if (tk === 'clone') clones.push({ r, c });
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
  const facing = words('facing', head.facing, found.length, w => (DIRS as readonly string[]).includes(w), 'a direction');
  const hazards = found.map((f, i) => ({ ...f, dir: facing[i] as Dir, home: i }));
  const made = words('machines', head.machines, clones.length, w => {
    const [tpl, d] = w.split('-');
    return (TEMPLATES as readonly string[]).includes(tpl!) && (DIRS as readonly string[]).includes(d!) && w.split('-').length === 2;
  }, 'a template and a direction like block-up');
  let homes = hazards.length;
  const machines = clones.map((at, i) => {
    const [template, dir] = made[i]!.split('-');
    const m = { at, template: template as Template, dir: dir as Dir };
    return template === 'block' ? m : { ...m, home: homes++ };
  });
  return {
    title: head.title?.value ?? '', intro: head.intro?.value ?? '', hearts, relics, pageIds, pageCells,
    rows: rows.length, cols, terrain, objects, player, minotaur, hazards, machines, links: linkButtons(terrain),
  };
}

export function serialize(lv: Level): string {
  if (/[\r\n]/.test(lv.title) || /[\r\n]/.test(lv.intro)) throw new Error('title and intro must be one line');
  const relicsOnGrid = lv.objects.filter(o => o === 'relic').length;
  const head = [`title: ${lv.title}`, `intro: ${lv.intro}`];
  if (lv.hearts !== 3) head.push(`hearts: ${lv.hearts}`);
  if (lv.relics !== relicsOnGrid) head.push(`relics: ${lv.relics}`);
  if (lv.pageIds.length > 0) head.push(`pages: ${lv.pageIds.join(' ')}`);
  if (lv.hazards.length > 0) head.push(`facing: ${lv.hazards.map(h => h.dir).join(' ')}`);
  if (lv.machines.length > 0) head.push(`machines: ${lv.machines.map(m => `${m.template}-${m.dir}`).join(' ')}`);
  const hazardAt = new Map(lv.hazards.map(h => [h.at.r * lv.cols + h.at.c, h.kind]));
  const grid: string[] = [];
  for (let r = 0; r < lv.rows; r++) {
    let row = '';
    for (let c = 0; c < lv.cols; c++) {
      const i = r * lv.cols + c;
      if (lv.player.r === r && lv.player.c === c) row += 'P';
      else if (lv.minotaur && lv.minotaur.r === r && lv.minotaur.c === c) row += 'M';
      else if (hazardAt.has(i)) row += HAZARDS[hazardAt.get(i)!].char;
      else row += lv.objects[i] ? OBJECTS[lv.objects[i]!].char : TERRAIN[lv.terrain[i]!].char;
    }
    grid.push(row);
  }
  return `${head.join('\n')}\n\n${grid.join('\n')}\n`;
}
