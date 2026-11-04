/* The Island of Crete, classic look: the game board as a tilted sheet (src/sheet.ts). The sheet canvas holds the
 * terrain and Ariadne's thread, with a margin of the walls' rise all round, and the page turns and tilts it with a CSS
 * transform; the figures, items and hazards stand upright on a second canvas over the whole view, at their sprites'
 * own pixels (scaled only as the whole sheet is while it turns), each on a soft shadow on its square.
 *
 * A raised tile (a wall, a door, a closed toggle wall) shows its top leaning away from the viewer and its face toward
 * them, so the sheet draws every tile turned to the quarter of the view (src/sheet.ts faceQuarter), farthest row
 * first; a tile whose picture points along the grid (a force floor, a clone machine) keeps its own way round, and the
 * gate and a door's sill, which lie across the way through them, swap to their twin drawn the other way round when
 * the turn is a quarter or three. A door sinking draws down its frame, cut off at the frame's foot. The hidden
 * walls' cues (src/wall-cues.ts) are drawn on the sheet over the terrain, in 2D: a found invisible wall a faint
 * glassy sheen and edge, after a light sweeping across it as it shimmers into view; an unshown one beside Theseus a
 * thin faint sliver of glass along its side toward him; a fake wall's haze a few faint wavering lines on its side
 * toward Theseus, a still tint under reduced motion. Each canvas repaints only when what
 * it shows has changed. */
import type { Atlas, Draw } from './board-plan.ts';
import { drawThread } from './board.ts';
import { pulseScale } from './thread-path.ts';
import type { ThreadCell } from './thread-path.ts';
import { EXIT_SPRITES, TERRAIN, TURNED_SPRITES } from './puzzle/tiles.ts';
import { AWAY, LEAN_FEET, faceQuarter, project, sheetTransform } from './sheet.ts';
import type { Frame } from './sheet.ts';
import { classicPics, createBubbleLayer } from './item-bubble.ts';
import type { Bubble, BubbleLayer } from './item-bubble.ts';
import { NO_CUES, cueKey, cuesShown } from './wall-cues.ts';
import type { CueDraw, CuesShown } from './wall-cues.ts';
import type { Dir } from './puzzle/tiles.ts';

export interface SheetBoard {
  /** Sets the sheet to `cols × rows` cells of `cellPx` CSS pixels, snapped to whole device pixels. */
  size(cols: number, rows: number, cellPx: number): void;
  /** Shows the sheet as `f` frames it. */
  frame(f: Frame): void;
  /** Paints `list`: its terrain and `thread` on the sheet, the rest standing over it; `t` (seconds) breathes the next
   *  step's arrow. */
  paint(list: Draw[], thread?: readonly ThreadCell[], t?: number): void;
}

/** The game's sheet, with the item bubbles over it. */
export interface ClassicBoard extends SheetBoard {
  /** The item bubbles (src/item-bubble.ts) the next paint shows. */
  bubbles(list: readonly Bubble[]): void;
  /** The item bubbles showing, for tests. */
  shownBubbles(): ReturnType<BubbleLayer['shown']>;
  /** Letters the next paint stands upright on their squares, each in a dark tab (the editor's F and I). */
  marks(list: readonly { r: number; c: number; mark: string }[]): void;
  /** The hidden walls' cues the next paint shows. */
  cues(c: CueDraw): void;
  /** The cues the sheet last drew, for tests. */
  shownCues(): CuesShown;
}

/** A grid way as a vector, x right and y down. */
const WAY: Record<Dir, readonly [number, number]> = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
/** How deep a fake wall's haze reaches into its tile, in cells. */
const HAZE_DEPTH = 0.3;
/** How deep the sliver of glass beside Theseus reaches into its tile, in cells. */
const GLASS_DEPTH = 0.09;

const TERRAIN_SPRITES = new Set([...Object.values(TERRAIN).flatMap(t => t.sprites), ...TURNED_SPRITES, ...EXIT_SPRITES]);
/** Each sprite that lies across the way through its cell, and its twin drawn the other way round. */
const TWIN = new Map(TURNED_SPRITES.filter(v => v.endsWith('-v')).flatMap(v => [[v, v.slice(0, -2)], [v.slice(0, -2), v]] as const));
/** Tiles whose picture points along the grid: they never turn with the view. */
const GRID_WAY = new Set(Object.values(TERRAIN).filter(t => t.carries || t === TERRAIN.clone).flatMap(t => t.sprites));
/** A shadow's radius, in cells. */
const SHADOW = 0.33;

export function createSheetBoard(canvas: HTMLCanvasElement, atlas: Atlas, image: HTMLImageElement): ClassicBoard {
  const ctx = canvas.getContext('2d')!;
  const view = canvas.parentElement!;
  const overlay = document.createElement('canvas');
  overlay.className = 'stage-figures';
  overlay.setAttribute('aria-hidden', 'true');
  view.append(overlay);
  const o = overlay.getContext('2d')!;
  const bubbleLayer = createBubbleLayer(l => view.insertBefore(l, overlay.nextSibling), classicPics(atlas, image));
  let bubbles: readonly Bubble[] = [];
  let marks: readonly { r: number; c: number; mark: string }[] = [];
  if (!canvas.className.split(' ').includes('sheet')) canvas.className = `${canvas.className} sheet`.trim();
  let cues: CueDraw = NO_CUES;
  let drawnCues: CueDraw = NO_CUES;
  const rise = atlas.rise / atlas.cell;
  const fw = atlas.cell, fh = atlas.cell + atlas.rise;
  let cell = 16; // a cell, in device pixels
  let top = 0; // the walls' rise, and the margin round the board, in device pixels
  let dpr = 1;
  let f: Frame | null = null;
  let sheetKey = '';
  let overKey = '';
  let lastThread: readonly ThreadCell[] | undefined;
  /** The last paint's list, thread and time: a resize or a new frame repaints from them at once, so no display
   *  frame shows the sheet cleared. */
  let last: Parameters<SheetBoard['paint']> | null = null;

  function paintSheet(terrain: Draw[], thread: readonly ThreadCell[] | undefined, pulse: number, q: number): void {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const away = AWAY[q]!;
    // Farthest first, so a raised tile's top leaning away covers the tile behind it.
    const order = terrain.slice().sort((a, b) => (b.x * away.x + b.y * away.y) - (a.x * away.x + a.y * away.y));
    // Each cell's last tile drawn: its cue goes on after it.
    const lastAt = new Map<string, Draw>();
    for (const d of order) lastAt.set(`${d.y},${d.x}`, d);
    for (const d of order) {
      const s = atlas.sprites[(q % 2 && TWIN.get(d.sprite)) || d.sprite];
      if (!s) continue;
      const x = top + d.x * cell, y = top + d.y * cell;
      ctx.save();
      ctx.translate(x + cell / 2, y + cell / 2);
      // Turned a quarter at a time about its square's centre, so its rise (the top of a wall) leans away.
      if (!GRID_WAY.has(d.sprite)) ctx.rotate((-q * Math.PI) / 2);
      const down = (d.sink ?? 0) * (cell + top);
      if (down) {
        ctx.beginPath();
        ctx.rect(-cell / 2, -cell / 2 - top, cell, cell + top);
        ctx.clip();
      }
      ctx.drawImage(image, s.x + d.frame * fw, s.y, fw, fh, -cell / 2, -cell / 2 - top + down, cell, cell + top);
      ctx.restore();
      // A cue goes on its tile as the tile is drawn, so a nearer tile drawn later covers it as it covers the tile.
      if (lastAt.get(`${d.y},${d.x}`) !== d) continue;
      const found = cues.found.find(f => f.at.r === d.y && f.at.c === d.x);
      if (found) paintFound(found.at, found.shimmer, q);
      for (const g of cues.glass) if (g.at.r === d.y && g.at.c === d.x) paintGlass(g, q);
      for (const f of cues.haze?.faces ?? []) if (f.at.r === d.y && f.at.c === d.x) paintHaze(f, q);
    }
    drawnCues = cues;
    if (thread && thread.length > 1) {
      ctx.translate(top, 0);
      drawThread(ctx, thread, cell, top, pulse);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
  }

  /** Turns the context to cell (r, c)'s tile as paintSheet draws it: origin at its square's centre, turned with the
   *  view's quarter, so the tile's picture spans x −cell/2 to cell/2 and y −cell/2 − top (its raised top's far edge)
   *  to cell/2. */
  function atTile(r: number, c: number, q: number): void {
    ctx.translate(top + c * cell + cell / 2, top + r * cell + cell / 2);
    ctx.rotate((-q * Math.PI) / 2);
  }

  /** A found invisible wall: a faint cool sheen over its tile and a pale edge round its top, glass found where floor
   *  seemed; while it shimmers, the tile flashes up and a band of light sweeps across it, corner to corner. */
  function paintFound(at: { r: number; c: number }, shimmer: number | null, q: number): void {
    const lw = Math.max(1, cell * 0.04);
    ctx.save();
    atTile(at.r, at.c, q);
    const x0 = -cell / 2, y0 = -cell / 2 - top, h = cell + top;
    ctx.beginPath();
    ctx.rect(x0, y0, cell, h);
    ctx.clip();
    ctx.fillStyle = 'rgba(150, 205, 255, 0.16)';
    ctx.fillRect(x0, y0, cell, h);
    ctx.strokeStyle = 'rgba(210, 238, 255, 0.6)';
    ctx.lineWidth = lw;
    ctx.strokeRect(x0 + lw / 2, y0 + lw / 2, cell - lw, cell - lw);
    if (shimmer !== null) {
      const env = Math.sin(Math.PI * shimmer);
      ctx.fillStyle = `rgba(225, 245, 255, ${(0.3 * env).toFixed(3)})`;
      ctx.fillRect(x0, y0, cell, h);
      const p = -0.3 + 1.6 * shimmer;
      const g = ctx.createLinearGradient(x0, y0 + h, x0 + cell, y0);
      const stop = (on: number, a: number) => g.addColorStop(Math.min(1, Math.max(0, on)), `rgba(255, 255, 255, ${a.toFixed(3)})`);
      stop(p - 0.18, 0);
      stop(p, 0.75 * env);
      stop(p + 0.18, 0);
      ctx.fillStyle = g;
      ctx.fillRect(x0, y0, cell, h);
    }
    ctx.restore();
  }

  /** The band along a face's side of a raised tile's picture, `depth` deep, on the context turned by atTile: toward
   *  the viewer it takes the face and the top's near edge. `lx`, `ly` are the face's way on the turned tile. */
  function band(face: Dir, q: number, depth: number): { bx: number; by: number; bw: number; bh: number; lx: number; ly: number } {
    const a = (q * Math.PI) / 2;
    const [gx, gy] = WAY[face];
    const lx = Math.round(gx * Math.cos(a) - gy * Math.sin(a)), ly = Math.round(gx * Math.sin(a) + gy * Math.cos(a));
    const bx = lx > 0 ? cell / 2 - depth : -cell / 2;
    const by = ly > 0 ? cell / 2 - top - depth : -cell / 2 - top;
    const bw = lx !== 0 ? depth : cell;
    const bh = ly > 0 ? top + depth : ly < 0 ? depth : cell + top;
    return { bx, by, bw, bh, lx, ly };
  }

  /** The glass of an unshown invisible wall beside Theseus: a thin sliver standing along its side toward him, as a
   *  wall's face and top edge would, a faint cool tint with a pale line along its inner edge, at `g.strength`. */
  function paintGlass(g: { at: { r: number; c: number }; face: Dir; strength: number }, q: number): void {
    ctx.save();
    atTile(g.at.r, g.at.c, q);
    const depth = Math.max(2, GLASS_DEPTH * cell);
    const { bx, by, bw, bh, lx, ly } = band(g.face, q, depth);
    ctx.beginPath();
    ctx.rect(bx, by, bw, bh);
    ctx.clip();
    const k = g.strength;
    ctx.fillStyle = `rgba(150, 205, 255, ${(0.16 * k).toFixed(3)})`;
    ctx.fillRect(bx, by, bw, bh);
    // The inner edge: the side of the sliver away from him, where the glass ends inside the cell.
    const lw = Math.max(1, cell * 0.025);
    ctx.strokeStyle = `rgba(215, 240, 255, ${(0.42 * k).toFixed(3)})`;
    ctx.lineWidth = lw;
    ctx.beginPath();
    if (lx !== 0) {
      const x = lx > 0 ? bx + lw / 2 : bx + bw - lw / 2;
      ctx.moveTo(x, by + cell * 0.08);
      ctx.lineTo(x, by + bh - cell * 0.08);
    } else {
      const y = ly > 0 ? by + lw / 2 : by + bh - lw / 2;
      ctx.moveTo(bx + cell * 0.08, y);
      ctx.lineTo(bx + bw - cell * 0.08, y);
    }
    ctx.stroke();
    ctx.restore();
  }

  /** A fake wall's haze on its side toward Theseus: a tint fuller at the face and, unless motion is reduced, a few
   *  faint wavering lines along it, drifting as heat over stone. */
  function paintHaze(f: { at: { r: number; c: number }; face: Dir }, q: number): void {
    const haze = cues.haze!;
    ctx.save();
    atTile(f.at.r, f.at.c, q);
    const { bx, by, bw, bh, lx, ly } = band(f.face, q, HAZE_DEPTH * cell);
    ctx.beginPath();
    ctx.rect(bx, by, bw, bh);
    ctx.clip();
    const across = lx !== 0;
    const g = across
      ? ctx.createLinearGradient(lx > 0 ? bx : bx + bw, 0, lx > 0 ? bx + bw : bx, 0)
      : ctx.createLinearGradient(0, ly > 0 ? by : by + bh, 0, ly > 0 ? by + bh : by);
    const tint = cues.still ? 0.2 : 0.12 * haze.strength;
    g.addColorStop(0, 'rgba(255, 236, 205, 0)');
    g.addColorStop(1, `rgba(255, 236, 205, ${tint.toFixed(3)})`);
    ctx.fillStyle = g;
    ctx.fillRect(bx, by, bw, bh);
    if (!cues.still) {
      ctx.strokeStyle = `rgba(255, 246, 228, ${(0.22 * haze.strength).toFixed(3)})`;
      ctx.lineWidth = Math.max(1, cell * 0.03);
      const len = across ? bh : bw, deep = across ? bw : bh;
      for (let k = 0; k < 3; k++) {
        ctx.beginPath();
        for (let u = 0; u <= 12; u++) {
          const along = (u / 12) * len;
          const off = deep * ((k + 0.5) / 3) + Math.sin((u / 12) * Math.PI * 3 + cues.t * 2.6 + k * 1.9) * deep * 0.12;
          const px = across ? bx + off : bx + along, py = across ? by + along : by + off;
          if (u === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  function paintFigures(up: Draw[], fr: Frame): void {
    const ow = Math.round(fr.vw * dpr), oh = Math.round(fr.vh * dpr);
    if (overlay.width !== ow || overlay.height !== oh) {
      overlay.width = ow;
      overlay.height = oh;
    }
    o.setTransform(1, 0, 0, 1, 0, 0);
    o.clearRect(0, 0, ow, oh);
    o.imageSmoothingEnabled = true;
    o.imageSmoothingQuality = 'high';
    const c = cell / dpr;
    const k = fr.k;
    const lean = Math.min(1, Math.max(0, (90 - fr.pitch) / 45));
    const flat = Math.sin((fr.pitch * Math.PI) / 180);
    // The point of a sprite's frame that stands on its square: the square's centre seen from above, its feet as the
    // view leans.
    const anchor = (top + cell * (0.5 + LEAN_FEET * lean)) * k;
    const placed = up.map(d => ({ d, p: project(fr, (d.x + 0.5) * c, (d.y + 0.5) * c) })).sort((a, b) => a.p.y - b.p.y);
    o.fillStyle = 'rgba(0, 0, 0, 0.42)';
    for (const { p } of placed) {
      o.beginPath();
      o.ellipse(p.x * dpr, p.y * dpr, SHADOW * cell * k, SHADOW * cell * k * flat, 0, 0, Math.PI * 2);
      o.fill();
    }
    const dw = Math.round(cell * k), dh = Math.round((cell + top) * k);
    for (const { d, p } of placed) {
      const s = atlas.sprites[d.sprite]!;
      o.drawImage(image, s.x + d.frame * fw, s.y, fw, fh, Math.round(p.x * dpr - dw / 2), Math.round(p.y * dpr - anchor), dw, dh);
    }
    if (!marks.length) return;
    const size = Math.max(8, Math.round(cell * k * 0.45));
    o.font = `bold ${size}px system-ui, sans-serif`;
    o.textAlign = 'center';
    o.textBaseline = 'middle';
    for (const m of marks) {
      const p = project(fr, (m.c + 0.5) * c, (m.r + 0.5) * c);
      const x = p.x * dpr, y = p.y * dpr;
      o.fillStyle = 'rgba(1, 4, 9, 0.75)';
      o.fillRect(x - size * 0.6, y - size * 0.6, size * 1.2, size * 1.2);
      o.fillStyle = '#f0b429';
      o.fillText(m.mark, x, y);
    }
  }

  /** Lays each bubble by its figure's head: the top of the sprite's frame, a little down, as paintFigures stands it. */
  function placeBubbles(fr: Frame): void {
    const c = cell / dpr, k = fr.k;
    const lean = Math.min(1, Math.max(0, (90 - fr.pitch) / 45));
    const anchor = (top + cell * (0.5 + LEAN_FEET * lean)) * k / dpr;
    bubbleLayer.place(bubbles.map(b => {
      const p = project(fr, (b.c + 0.5) * c, (b.r + 0.5) * c);
      return { bubble: b, x: p.x, head: p.y - anchor + (top * k * 0.4) / dpr, cell: c * k };
    }), fr.vw, fr.vh);
  }

  const sheet: ClassicBoard = {
    size(cols, rows, cellPx) {
      dpr = window.devicePixelRatio || 1;
      cell = Math.max(1, Math.round(cellPx * dpr));
      top = Math.round(rise * cell);
      canvas.width = cols * cell + 2 * top;
      canvas.height = rows * cell + 2 * top;
      canvas.style.width = `${canvas.width / dpr}px`;
      canvas.style.height = `${canvas.height / dpr}px`;
      canvas.dataset.cell = String(cellPx);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      sheetKey = overKey = '';
      if (f) canvas.style.transform = sheetTransform(f, top / dpr);
    },
    frame(next) {
      f = next;
      canvas.style.transform = sheetTransform(next, top / dpr);
      overKey = '';
      if (last) sheet.paint(...last);
    },
    paint(list, thread, t) {
      last = [list, thread, t];
      if (!f) return;
      const terrain: Draw[] = [];
      const up: Draw[] = [];
      for (const d of list) (TERRAIN_SPRITES.has(d.sprite) ? terrain : up).push(d);
      const q = faceQuarter(f.yaw);
      const pulse = t === undefined ? 1 : pulseScale(t);
      const showsThread = !!thread && thread.length > 1;
      const ck = cueKey(cues);
      const sk = `${q}|${showsThread ? pulse.toFixed(3) : '-'}|${ck}|${terrain.map(d => `${d.sprite}${d.frame}${d.sink ?? ''}`).join(',')}`;
      if (sk !== sheetKey || (showsThread && thread !== lastThread)) {
        sheetKey = sk;
        lastThread = thread;
        paintSheet(terrain, thread, pulse, q);
      }
      const ok = up.map(d => `${d.sprite}${d.frame}@${d.x},${d.y}`).join(',') + `|${marks.map(m => `${m.mark}@${m.c},${m.r}`).join(',')}`;
      if (ok !== overKey) {
        overKey = ok;
        paintFigures(up, f);
      }
      placeBubbles(f);
    },
    bubbles(list) {
      bubbles = list;
    },
    shownBubbles: () => bubbleLayer.shown(),
    marks(list) {
      marks = list;
    },
    cues(c) {
      cues = c;
    },
    shownCues: () => cuesShown(drawnCues),
  };
  return sheet;
}
