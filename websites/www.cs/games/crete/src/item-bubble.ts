/* The Island of Crete: the item bubble. An item the Minotaur stands on is hidden under him, so a small thought
 * bubble up and to the right of his head shows it: the item's icon in the board's look (Classic's sprite, Modern's
 * pre-rendered model). Theseus never has one: he picks up whatever he steps on. The hazards never share a cell with
 * an item (the rules keep them off objects), so only the Minotaur can need one. On the top row, or at an edge, the
 * bubble goes to the side or below rather than off the board. Both looks lay it over the board as a DOM layer
 * (`createBubbleLayer`), placed from where their own view shows the head; it fades in and out gently, and at once
 * under reduced motion (game.css). */
import { OBJECTS } from './puzzle/tiles.ts';
import type { ObjectKind } from './puzzle/tiles.ts';
import type { State } from './puzzle/state.ts';
import type { Atlas, Figures } from './board-plan.ts';
import type { IconSheet } from './icons-models.ts';
import type { Look } from './settings.ts';

/** An item a figure other than Theseus stands on, at cell (c, r). */
export interface Bubble { kind: ObjectKind; c: number; r: number; by: 'minotaur' }

/** The bubbles to show for this frame: the Minotaur at rest on an item's cell (not mid-step), the item not a block.
 *  DOM-free. */
export function bubbles(s: State, fig: Figures): Bubble[] {
  const m = fig.minotaur, at = s.minotaur;
  if (!m || !at || m.r !== at.r || m.c !== at.c) return [];
  const o = s.objects[at.r * s.level.cols + at.c];
  return o && o !== 'block' ? [{ kind: o, c: at.c, r: at.r, by: 'minotaur' }] : [];
}

/** A bubble on screen, in the layer's CSS pixels: the top of the figure's head at (x, head), and a cell's width. */
export interface BubbleSpot { bubble: Bubble; x: number; head: number; cell: number }

/** Where the cloud sits beside the head, as a share of its diameter: up and right first, then the other ways in
 *  turn when it would leave the board. */
const PLACES: readonly (readonly [number, number])[] = [[0.55, -0.62], [-0.55, -0.62], [0.95, 0.15], [-0.95, 0.15], [0.55, 0.9], [-0.55, 0.9]];
/** The cloud's least room from the board's edge, CSS px. */
const EDGE = 2;
/** How long a fading bubble stays in the page, ms: longer than its fade in game.css. */
const FADE_MS = 220;

/** The cloud's diameter for a cell `cell` CSS px wide: about three quarters of it, readable on a phone, never
 *  crowding a zoomed-in view. */
export function bubbleSize(cell: number): number {
  return Math.round(Math.min(54, Math.max(34, cell * 0.8)));
}

/** Where the cloud's centre goes for a head at (x, head) in a `w` × `h` layer: the first of PLACES that keeps it
 *  inside, else the first held inside. Also gives which way it went (0 up-right, …), for tests. */
export function bubbleAt(x: number, head: number, cell: number, w: number, h: number): { cx: number; cy: number; place: number } {
  const d = bubbleSize(cell), r = d / 2;
  const ax = x + cell * 0.12, ay = head + cell * 0.08;
  for (let i = 0; i < PLACES.length; i++) {
    const [px, py] = PLACES[i]!;
    const cx = ax + px * d, cy = ay + py * d;
    if (cx - r >= EDGE && cx + r <= w - EDGE && cy - r >= EDGE && cy + r <= h - EDGE) return { cx, cy, place: i };
  }
  const [px, py] = PLACES[0]!;
  const clamp = (v: number, lo: number, hi: number) => (lo > hi ? (lo + hi) / 2 : Math.min(hi, Math.max(lo, v)));
  return { cx: clamp(ax + px * d, r + EDGE, w - r - EDGE), cy: clamp(ay + py * d, r + EDGE, h - r - EDGE), place: 0 };
}

/** What draws an item's icon: Classic's atlas or Modern's icon sheet (game.css names the picture), each a frame at
 *  (x, y) of `w` × `h` in a sheet `sw` × `sh`, with the item's middle at (mx, my) in the frame as shares of it, drawn
 *  `fill` of the cloud's width across. */
export interface BubblePics {
  look: Look;
  frame(kind: ObjectKind): { x: number; y: number; w: number; h: number; sw: number; sh: number; mx: number; my: number; fill: number } | null;
}

/** Classic's pictures: the item's sprite from the atlas, its square the frame's foot. */
export function classicPics(atlas: Atlas, image: HTMLImageElement): BubblePics {
  const fw = atlas.cell, fh = atlas.cell + atlas.rise;
  return {
    look: 'classic',
    frame(kind) {
      const s = atlas.sprites[OBJECTS[kind].sprite];
      return s ? { x: s.x, y: s.y, w: fw, h: fh, sw: image.naturalWidth, sh: image.naturalHeight, mx: 0.5, my: (atlas.rise + atlas.cell * 0.3) / fh, fill: 0.74 } : null;
    },
  };
}

/** Modern's pictures: the item's model as the Dictionary shows it, standing on its plate. */
export function modernPics(icons: IconSheet): BubblePics {
  return {
    look: 'modern',
    frame(kind) {
      const s = icons.icons[kind];
      return s ? { x: s.x, y: s.y, w: icons.cell, h: icons.cell, sw: icons.width, sh: icons.height, mx: 0.5, my: 0.44, fill: 0.92 } : null;
    },
  };
}

export interface BubbleLayer {
  /** Shows these bubbles, each at its spot in a `w` × `h` CSS px board, and fades out the rest. */
  place(spots: readonly BubbleSpot[], w: number, h: number): void;
  /** The bubbles showing, for tests: each one's item, cell, and where its cloud went (0 up-right, …). */
  shown(): { kind: ObjectKind; c: number; r: number; by: string; place: number; x: number; y: number; size: number }[];
}

interface Shown { el: HTMLElement; cloud: HTMLElement; pic: HTMLElement; puffs: HTMLElement[]; bubble: Bubble; place: number; x: number; y: number; d: number; key: string }

/** A bubble layer for a board, put into the page by `insert` (over the board's pictures, under its controls). */
export function createBubbleLayer(insert: (layer: HTMLElement) => void, pics: BubblePics): BubbleLayer {
  const layer = document.createElement('div');
  layer.className = 'item-bubbles';
  layer.dataset.look = pics.look;
  layer.setAttribute('aria-hidden', 'true');
  insert(layer);
  const live = new Map<string, Shown>();

  function make(b: Bubble): Shown {
    const el = document.createElement('div');
    el.className = 'item-bubble';
    el.dataset.kind = b.kind;
    el.dataset.by = b.by;
    const puffs = [document.createElement('span'), document.createElement('span')];
    for (const p of puffs) p.className = 'item-bubble-puff';
    const cloud = document.createElement('span');
    cloud.className = 'item-bubble-cloud';
    const pic = document.createElement('span');
    pic.className = 'item-bubble-pic';
    cloud.append(pic);
    el.append(...puffs, cloud);
    layer.append(el);
    // Shown on the next frame, so it fades in from nothing.
    void el.offsetWidth;
    el.classList.add('shown');
    return { el, cloud, pic, puffs, bubble: b, place: 0, x: 0, y: 0, d: 0, key: '' };
  }

  function lay(s: Shown, sp: BubbleSpot, w: number, h: number): void {
    const d = bubbleSize(sp.cell);
    const { cx, cy, place } = bubbleAt(sp.x, sp.head, sp.cell, w, h);
    const key = `${cx.toFixed(1)} ${cy.toFixed(1)} ${d}`;
    if (key === s.key) return;
    Object.assign(s, { key, place, x: cx, y: cy, d });
    s.cloud.style.cssText = `left:${cx - d / 2}px;top:${cy - d / 2}px;width:${d}px;height:${d * 0.86}px`;
    // Two puffs from the head to the cloud, small to larger.
    const ax = sp.x + sp.cell * 0.08, ay = sp.head + sp.cell * 0.12;
    [[0.3, 0.13], [0.55, 0.2]].forEach(([t, k], i) => {
      const pd = Math.max(4, d * k!);
      const px = ax + (cx - ax) * t!, py = ay + (cy - ay) * t!;
      s.puffs[i]!.style.cssText = `left:${px - pd / 2}px;top:${py - pd / 2}px;width:${pd}px;height:${pd}px`;
    });
    const f = pics.frame(s.bubble.kind);
    if (f) {
      // The item's middle at the cloud's middle.
      const k = (d * f.fill) / f.w;
      const iw = d - 3, ih = d * 0.86 - 3;
      s.pic.style.cssText = `background-size:${f.sw * k}px ${f.sh * k}px;`
        + `background-position:${iw / 2 - (f.x + f.mx * f.w) * k}px ${ih / 2 - (f.y + f.my * f.h) * k}px`;
    }
  }

  return {
    place(spots, w, h) {
      const keep = new Set<string>();
      for (const sp of spots) {
        const id = `${sp.bubble.by} ${sp.bubble.c},${sp.bubble.r} ${sp.bubble.kind}`;
        keep.add(id);
        let s = live.get(id);
        if (!s) live.set(id, (s = make(sp.bubble)));
        lay(s, sp, w, h);
      }
      for (const [id, s] of live) {
        if (keep.has(id)) continue;
        live.delete(id);
        s.el.classList.remove('shown');
        setTimeout(() => s.el.remove(), FADE_MS);
      }
    },
    shown() {
      return [...live.values()].map(s => ({ kind: s.bubble.kind, c: s.bubble.c, r: s.bubble.r, by: s.bubble.by, place: s.place, x: s.x, y: s.y, size: s.d }));
    },
  };
}
