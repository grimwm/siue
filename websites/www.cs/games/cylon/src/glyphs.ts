/* Cylon Defense: the page's scattered letters, drawn on one canvas (the embed).
 *
 * The home page breaks its text into one element per letter, which is fine for
 * its few hundred words. A blog post has thousands of letters inside a heavy
 * theme, and every letter element is its own transformed box the browser has
 * to restyle, layer and composite on every frame. Here each letter is a record
 * instead: where it sits in the text, the blocks and panel it belongs to, its
 * blast vector and its tweens. The page's text stays where it is, made
 * invisible, and the letters are drawn over it on one fixed canvas, each one
 * moving the way world.css would have moved its element: the same curves and
 * times, the same blown-out colour and chromatic shadow, carried along by its
 * blocks' and panel's own (still CSS) transforms.
 *
 * Only text in or near the viewport becomes letters (the page cannot be
 * scrolled while a run is live, but it can be resized or keyed along); more is
 * added as the viewport reaches it, up to a cap. The canvas draws only while
 * something moves. Browser-only: it compiles in the DOM program. */

import {
  IDENTITY, multiply, invert, apply, aboutOrigin, translateRotate, tweenAt, retarget, still, moving,
  EASE_KICK, EASE_BLOW, EASE, parseCanvasColor, mixSrgb, cssColor, parseCssTime,
} from './glyph-math.ts';
import type { Affine, Tween, Rgba } from './glyph-math.ts';

export interface GlyphVector { sx: number; sy: number; sr: number }

export interface GlyphLayer {
  /** Turns the panels' visible text into drawn letters, each with a vector from `vector`. */
  scatter(roots: readonly HTMLElement[], vector: () => GlyphVector): void;
  /** Puts the page's own text back and removes the canvas. */
  restore(): void;
  /** A nuke's full re-scatter: a new vector for every letter. */
  reshuffle(vector: () => GlyphVector): void;
  /**
   * A blast near the letters: `fn` gets each letter's on-screen centre in page
   * coordinates and its vector, and returns a new vector or null to leave it.
   */
  kick(fn: (pageX: number, pageY: number, v: GlyphVector) => GlyphVector | null): void;
  /** The blocks or panels holding the letters are moving for the next `ms`. */
  poke(ms: number): void;
  /** How many letters are drawn. */
  count(): number;
}

export interface GlyphLayerDeps {
  doc: Document;
  win: Window;
  /** The most letters at once; text beyond it stays as it is. */
  max?: number;
}

/** The letters' own timings from world.css (`.cylon-scatter-char`). */
const KICK_MS = 320;
const LOOK_MS = 450;
/** `--cylon-desolate-fade` when the body does not say. */
const BLOW_FALLBACK_MS = 1600;
/** The blown look (world.css, `body.cylon-glyphs-blown .cylon-scatter-char`). */
const ASH: Rgba = { r: 0x5a, g: 0x58, b: 0x54, a: 1 };
const SHADOWS: ReadonlyArray<[number, number, string]> = [
  // Bottom to top: CSS paints the first shadow on top.
  [0, 1.5, 'rgba(0, 0, 0, 0.4)'],
  [-1.8, 0.4, 'rgba(40, 90, 160, 0.45)'],
  [1.8, 0, 'rgba(160, 35, 35, 0.5)'],
];
/** Blocks are at this opacity once blown (world.css, `.cylon-scatter-block`). */
const BLOCK_OPACITY = 0.55;
const PAD = 3;
const ATLAS = 2048;
const DEFAULT_MAX = 6000;
const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'TEXTAREA', 'SELECT', 'OPTION', 'svg', 'SVG', 'CANVAS', 'IFRAME', 'VIDEO', 'AUDIO']);

/** A block or panel that carries its letters with its own CSS transform. */
interface Frame {
  el: Element;
  style: CSSStyleDeclaration;
  parent: Frame | null;
  fixed: boolean;
  blocks: number;
  ox: number;
  oy: number;
  /** This frame's whole transform, its parents' included, in page (or, fixed, viewport) space. */
  world: Affine;
}

interface Sprite { page: number; sx: number; sy: number; sw: number; sh: number }

/** How a text node's parent draws its letters. */
interface Style { ok: boolean; font: string; color: Rgba; opacity: number; upper: boolean; lower: boolean; asc: number; desc: number }

interface Glyph {
  text: Text;
  start: number;
  end: number;
  ch: string;
  frame: Frame;
  style: Style;
  lx: number;
  ly: number;
  w: number;
  h: number;
  rest: Sprite;
  blown: Sprite;
  v: GlyphVector;
  x: Tween;
  y: Tween;
  r: Tween;
  k: Tween;
}

interface Pending { text: Text; frame: Frame }

const matrixOf = (s: string): Affine => {
  if (!s || s === 'none') return IDENTITY;
  const m = new DOMMatrixReadOnly(s);
  return { a: m.a, b: m.b, c: m.c, d: m.d, e: m.e, f: m.f };
};

const nearIdentity = (m: Affine): boolean =>
  Math.abs(m.a - 1) < 1e-3 && Math.abs(m.d - 1) < 1e-3 && Math.abs(m.b) < 1e-3 && Math.abs(m.c) < 1e-3;

export function createGlyphLayer(d: GlyphLayerDeps): GlyphLayer {
  const { doc, win } = d;
  const max = d.max ?? DEFAULT_MAX;
  const body = doc.body;

  let canvas: HTMLCanvasElement | null = null;
  let ctx: CanvasRenderingContext2D | null = null;
  let dpr = 1;
  let glyphs: Glyph[] = [];
  let pending: Pending[] = [];
  let frames: Frame[] = [];
  const frameOf = new Map<Element, Frame>();
  const styleOf = new Map<Element, Style>();
  const wrappers: HTMLElement[] = [];
  const parents = new Set<Element>();
  let vectorFn: () => GlyphVector = () => ({ sx: 0, sy: 0, sr: 0 });
  let blown = false;
  let raf = 0;
  let domUntil = 0;
  let observer: MutationObserver | null = null;
  let extendTimer: ReturnType<typeof setTimeout> | null = null;
  let resizeTimer: ReturnType<typeof setTimeout> | null = null;

  // The sprite atlas: every letter in every look it needs, drawn once.
  const pages: HTMLCanvasElement[] = [];
  const sprites = new Map<string, Sprite>();
  let shelfX = 0;
  let shelfY = 0;
  let shelfH = 0;
  const metrics = new Map<string, { asc: number; desc: number }>();
  let measureCtx: CanvasRenderingContext2D | null = null;

  const now = (): number => win.performance.now();
  const isBlown = (): boolean => body.classList.contains('cylon-glyphs-blown');
  const blowing = (): boolean => body.classList.contains('cylon-glyphs-blowing');
  const blowMs = (): number => parseCssTime(win.getComputedStyle(body).getPropertyValue('--cylon-desolate-fade'), BLOW_FALLBACK_MS);

  function scratch(): CanvasRenderingContext2D {
    if (!measureCtx) measureCtx = doc.createElement('canvas').getContext('2d', { willReadFrequently: true })!;
    return measureCtx;
  }

  function fontMetrics(font: string): { asc: number; desc: number } {
    let m = metrics.get(font);
    if (!m) {
      const c = scratch();
      c.font = font;
      const t = c.measureText('Mg');
      // Layout rounds a font's ascent and descent to whole pixels; so does the baseline here.
      m = { asc: Math.round(t.fontBoundingBoxAscent || t.actualBoundingBoxAscent), desc: Math.round(t.fontBoundingBoxDescent || t.actualBoundingBoxDescent) };
      metrics.set(font, m);
    }
    return m;
  }

  function resolveColor(css: string): Rgba | null {
    const c = scratch();
    c.fillStyle = '#000';
    c.fillStyle = css;
    const parsed = parseCanvasColor(String(c.fillStyle));
    if (parsed) return parsed;
    // A colour the canvas hands back in another form (oklch, display-p3): paint one pixel and read it.
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, 1, 1);
    c.fillRect(0, 0, 1, 1);
    const [r = 0, g = 0, b = 0, a = 0] = c.getImageData(0, 0, 1, 1).data;
    return { r, g, b, a: a / 255 };
  }

  function sprite(g: { ch: string; style: Style }, kind: 'rest' | 'blown'): Sprite {
    const key = `${kind}|${g.style.font}|${cssColor(g.style.color)}|${g.ch}`;
    const hit = sprites.get(key);
    if (hit) return hit;
    const c = scratch();
    c.font = g.style.font;
    const t = c.measureText(g.ch);
    const wCss = Math.max(t.width, (t.actualBoundingBoxLeft || 0) + (t.actualBoundingBoxRight || 0)) + PAD * 2;
    const hCss = g.style.asc + g.style.desc + PAD * 2;
    const sw = Math.ceil(wCss * dpr);
    const sh = Math.ceil(hCss * dpr);
    if (shelfX + sw > ATLAS) { shelfX = 0; shelfY += shelfH + 1; shelfH = 0; }
    if (!pages.length || shelfY + sh > ATLAS) {
      const p = doc.createElement('canvas');
      p.width = ATLAS;
      p.height = ATLAS;
      pages.push(p);
      shelfX = 0; shelfY = 0; shelfH = 0;
    }
    const pageIndex = pages.length - 1;
    const pc = pages[pageIndex]!.getContext('2d')!;
    const s: Sprite = { page: pageIndex, sx: shelfX, sy: shelfY, sw, sh };
    pc.setTransform(dpr, 0, 0, dpr, shelfX, shelfY);
    pc.font = g.style.font;
    pc.textBaseline = 'alphabetic';
    const bx = PAD;
    const by = PAD + g.style.asc;
    if (kind === 'blown') {
      for (const [dx, dy, color] of SHADOWS) {
        pc.fillStyle = color;
        pc.fillText(g.ch, bx + dx, by + dy);
      }
      pc.fillStyle = cssColor(mixSrgb(g.style.color, ASH, 0.38));
    } else {
      pc.fillStyle = cssColor(g.style.color);
    }
    pc.fillText(g.ch, bx, by);
    shelfX += sw + 1;
    shelfH = Math.max(shelfH, sh);
    sprites.set(key, s);
    return s;
  }

  /** How `el` draws text, or ok: false when its text is hidden, clipped away or not ours to draw. */
  function styleFor(el: Element, root: Element): Style {
    const known = styleOf.get(el);
    if (known) return known;
    const cs = win.getComputedStyle(el);
    const up = el === root || !el.parentElement ? null : styleFor(el.parentElement, root);
    let ok = up ? up.ok : true;
    if (SKIP_TAGS.has(el.tagName) || el.closest('svg')) ok = false;
    if (cs.visibility === 'hidden' || cs.display === 'none') ok = false;
    if (cs.clipPath !== 'none' || (cs.clip && cs.clip !== 'auto')) ok = false;
    if (cs.overflow !== 'visible' && (el as HTMLElement).offsetWidth <= 2) ok = false;
    const fill = cs.getPropertyValue('-webkit-text-fill-color');
    const color = resolveColor(cs.color);
    if (!color || color.a <= 0) ok = false;
    if (fill && resolveColor(fill)?.a === 0) ok = false;
    const opacity = (up ? up.opacity : 1) * (parseFloat(cs.opacity) || 0);
    if (opacity <= 0) ok = false;
    const font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    const tt = cs.textTransform;
    const { asc, desc } = fontMetrics(font);
    const s: Style = { ok, font, color: color ?? ASH, opacity, upper: tt === 'uppercase' || tt === 'capitalize', lower: tt === 'lowercase', asc, desc };
    styleOf.set(el, s);
    return s;
  }

  /** The frame (innermost block, else the panel) a node's letters move with. */
  function frameFor(el: Element, root: HTMLElement): Frame {
    const known = frameOf.get(el);
    if (known) return known;
    let f: Frame;
    if (el === root) {
      const pos = win.getComputedStyle(root).position;
      f = { el, style: win.getComputedStyle(el), parent: null, fixed: pos === 'fixed' || pos === 'sticky', blocks: 0, ox: 0, oy: 0, world: IDENTITY };
      frames.push(f);
    } else {
      const parent = frameFor(el.parentElement ?? root, root);
      const cs = win.getComputedStyle(el);
      const transformable = el.classList.contains('cylon-scatter-block') && cs.display !== 'inline' && cs.display !== 'contents';
      if (!transformable) {
        frameOf.set(el, parent);
        return parent;
      }
      f = { el, style: cs, parent, fixed: parent.fixed, blocks: parent.blocks + 1, ox: 0, oy: 0, world: IDENTITY };
      frames.push(f);
    }
    frameOf.set(el, f);
    return f;
  }

  /** Where every frame's box sits untransformed, from where it shows now (parents first, as `frames` is ordered). */
  function measureFrames(): void {
    const sx = win.scrollX;
    const sy = win.scrollY;
    for (const f of frames) {
      const r = f.el.getBoundingClientRect();
      const up = f.parent ? f.parent.world : IDENTITY;
      const m = matrixOf(f.style.transform);
      const c = apply(invert(up), r.left + r.width / 2 + (f.fixed ? 0 : sx), r.top + r.height / 2 + (f.fixed ? 0 : sy));
      f.ox = c.x - m.e;
      f.oy = c.y - m.f;
      f.world = multiply(up, aboutOrigin(m, f.ox, f.oy));
    }
  }

  /** Each frame's transform as the stylesheet has it this frame. */
  function readFrames(): void {
    for (const f of frames) {
      const own = aboutOrigin(matrixOf(f.style.transform), f.ox, f.oy);
      f.world = f.parent ? multiply(f.parent.world, own) : own;
    }
  }

  const range = (): Range => doc.createRange();

  /** One letter's untransformed box (centre and size) from its range's rect now. */
  function place(g: { text: Text; start: number; end: number; frame: Frame; style: Style; ch: string }, rg: Range):
    { lx: number; ly: number; w: number; h: number } | null {
    rg.setStart(g.text, g.start);
    rg.setEnd(g.text, g.end);
    const r = rg.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return null;
    const off = g.frame.fixed ? { x: 0, y: 0 } : { x: win.scrollX, y: win.scrollY };
    const c = apply(invert(g.frame.world), r.left + r.width / 2 + off.x, r.top + r.height / 2 + off.y);
    if (nearIdentity(g.frame.world)) return { lx: c.x, ly: c.y, w: r.width, h: r.height };
    const t = scratch();
    t.font = g.style.font;
    return { lx: c.x, ly: c.y, w: t.measureText(g.ch).width, h: g.style.asc + g.style.desc };
  }

  /** Turns the pending text near the viewport into letters, nearest first, up to the cap. */
  /** Where a frame is headed once blown: its own vector (world.css: the panel also shrinks to 0.96) on top of its parents'. */
  function targetWorld(f: Frame, memo: Map<Frame, Affine>): Affine {
    const known = memo.get(f);
    if (known) return known;
    const el = f.el as HTMLElement;
    const num = (name: string): number => parseFloat(el.style?.getPropertyValue(name) ?? '') || 0;
    const tr = translateRotate(num('--sx'), num('--sy'), num('--sr'));
    const k = f.parent ? 1 : 0.96;
    const own = aboutOrigin({ a: tr.a * k, b: tr.b * k, c: tr.c * k, d: tr.d * k, e: tr.e, f: tr.f }, f.ox, f.oy);
    const w = f.parent ? multiply(targetWorld(f.parent, memo), own) : own;
    memo.set(f, w);
    return w;
  }

  /**
   * Turns the pending text that shows, or will once blown, in or near the
   * viewport into letters, nearest first, up to the cap. A letter flies up to
   * about 0.7 of the viewport from its place, so "near" is that far out.
   */
  function extend(): void {
    if (!pending.length || glyphs.length >= max) return;
    readFrames();
    const vw = win.innerWidth || 1;
    const vh = win.innerHeight || 1;
    const sx = win.scrollX;
    const sy = win.scrollY;
    const mx = vw * 0.75;
    const my = vh * 0.75;
    const rg = range();
    const memo = new Map<Frame, Affine>();
    const near: Array<{ p: Pending; dist: number }> = [];
    const keep: Pending[] = [];
    for (const p of pending) {
      if (!p.text.isConnected) continue;
      rg.selectNodeContents(p.text);
      const r = rg.getBoundingClientRect();
      if (r.width <= 0 && r.height <= 0) continue;
      const nowNear = r.bottom > -my && r.top < vh + my && r.right > -mx && r.left < vw + mx;
      let soonNear = false;
      if (!nowNear) {
        // The node's box where it is headed: undo where its frame is now, apply where the frame is going.
        const ox = p.frame.fixed ? 0 : sx;
        const oy = p.frame.fixed ? 0 : sy;
        const to = multiply(targetWorld(p.frame, memo), invert(p.frame.world));
        let l = Infinity, t = Infinity, rr = -Infinity, b = -Infinity;
        for (const [x, y] of [[r.left, r.top], [r.right, r.top], [r.left, r.bottom], [r.right, r.bottom]] as const) {
          const q = apply(to, x + ox, y + oy);
          l = Math.min(l, q.x - ox); rr = Math.max(rr, q.x - ox);
          t = Math.min(t, q.y - oy); b = Math.max(b, q.y - oy);
        }
        soonNear = b > -my && t < vh + my && rr > -mx && l < vw + mx;
      }
      if (!nowNear && !soonNear) { keep.push(p); continue; }
      near.push({ p, dist: Math.abs(r.top + r.height / 2 - vh / 2) });
    }
    near.sort((a, b) => a.dist - b.dist);
    const made: Glyph[] = [];
    const done: Text[] = [];
    const on = blown;
    for (const { p } of near) {
      if (glyphs.length + made.length >= max) { keep.push(p); continue; }
      const parent = p.text.parentElement;
      if (!parent) continue;
      const style = styleFor(parent, rootOf(p.frame));
      if (!style.ok) continue;
      const value = p.text.nodeValue ?? '';
      let i = 0;
      for (const raw of value) {
        const start = i;
        i += raw.length;
        if (/^[\s­​-‍⁠﻿]$/.test(raw)) continue;
        const ch = style.upper ? raw.toUpperCase() : style.lower ? raw.toLowerCase() : raw;
        const base = { text: p.text, start, end: i, ch, frame: p.frame, style };
        const box = place(base, rg);
        if (!box) continue;
        const v = vectorFn();
        made.push({
          ...base, ...box, v,
          rest: sprite(base, 'rest'), blown: sprite(base, 'blown'),
          x: still(on ? v.sx : 0), y: still(on ? v.sy : 0), r: still(on ? v.sr : 0), k: still(on ? 1 : 0),
        });
      }
      done.push(p.text);
    }
    // Every read above, then every write: wrapping the text would otherwise force a layout per node.
    done.forEach(hide);
    pending = keep;
    glyphs = glyphs.concat(made);
    schedule();
  }

  const rootOf = (f: Frame): HTMLElement => {
    let r = f;
    while (r.parent) r = r.parent;
    return r.el as HTMLElement;
  };

  function hide(text: Text): void {
    const parent = text.parentElement;
    if (!parent) return;
    const span = doc.createElement('span');
    span.className = 'cylon-glyph-src';
    text.replaceWith(span);
    span.appendChild(text);
    wrappers.push(span);
    parent.classList.add('cylon-glyph-parent');
    parents.add(parent);
  }

  function sizeCanvas(): void {
    if (!canvas) return;
    dpr = Math.min(3, win.devicePixelRatio || 1);
    canvas.width = Math.round((win.innerWidth || 1) * dpr);
    canvas.height = Math.round((win.innerHeight || 1) * dpr);
  }

  function retargetAll(ms: number, lookMs: number, ease: (t: number) => number): void {
    const t = now();
    for (const g of glyphs) {
      g.x = retarget(g.x, blown ? g.v.sx : 0, t, ms, ease);
      g.y = retarget(g.y, blown ? g.v.sy : 0, t, ms, ease);
      g.r = retarget(g.r, blown ? g.v.sr : 0, t, ms, ease);
      g.k = retarget(g.k, blown ? 1 : 0, t, lookMs, EASE);
    }
  }

  function moveTimes(): { ms: number; lookMs: number; ease: (t: number) => number } {
    if (blowing()) {
      const ms = blowMs();
      return { ms, lookMs: ms, ease: EASE_BLOW };
    }
    return { ms: KICK_MS, lookMs: LOOK_MS, ease: EASE_KICK };
  }

  function onBodyClass(): void {
    const b = isBlown();
    if (b === blown) return;
    blown = b;
    const { ms, lookMs, ease } = moveTimes();
    retargetAll(ms, lookMs, ease);
    poke(Math.max(ms, lookMs) + 200);
  }

  function draw(t: number): boolean {
    if (!canvas || !ctx) return false;
    const vw = win.innerWidth || 1;
    const vh = win.innerHeight || 1;
    const sx = win.scrollX;
    const sy = win.scrollY;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let busy = false;
    for (const g of glyphs) {
      if (moving(g.x, t) || moving(g.y, t) || moving(g.r, t) || moving(g.k, t)) busy = true;
      const m = multiply(g.frame.world, translateRotate(g.lx + tweenAt(g.x, t), g.ly + tweenAt(g.y, t), tweenAt(g.r, t)));
      const ex = g.frame.fixed ? m.e : m.e - sx;
      const ey = g.frame.fixed ? m.f : m.f - sy;
      if (ex < -80 || ey < -80 || ex > vw + 80 || ey > vh + 80) continue;
      const k = tweenAt(g.k, t);
      const alpha = g.style.opacity * (1 + (Math.pow(BLOCK_OPACITY, g.frame.blocks) - 1) * k);
      ctx.setTransform(dpr * m.a, dpr * m.b, dpr * m.c, dpr * m.d, dpr * ex, dpr * ey);
      const dx = -g.w / 2 - PAD;
      const dy = -g.h / 2 - PAD;
      if (k < 1) {
        const s = g.rest;
        ctx.globalAlpha = alpha * (1 - k);
        ctx.drawImage(pages[s.page]!, s.sx, s.sy, s.sw, s.sh, dx, dy, s.sw / dpr, s.sh / dpr);
      }
      if (k > 0) {
        const s = g.blown;
        ctx.globalAlpha = alpha * k;
        ctx.drawImage(pages[s.page]!, s.sx, s.sy, s.sw, s.sh, dx, dy, s.sw / dpr, s.sh / dpr);
      }
    }
    ctx.globalAlpha = 1;
    return busy;
  }

  function tick(t: number): void {
    raf = 0;
    if (!canvas) return;
    const domMoving = t < domUntil;
    if (domMoving) readFrames();
    const busy = draw(t);
    if (busy || domMoving) schedule();
  }

  function schedule(): void {
    if (!raf && canvas) raf = win.requestAnimationFrame(tick);
  }

  function poke(ms: number): void {
    domUntil = Math.max(domUntil, now() + ms);
    schedule();
    // The blocks and panels have new places to go: text headed into view becomes letters.
    if (pending.length) laterExtend();
  }

  function laterExtend(): void {
    if (extendTimer) clearTimeout(extendTimer);
    extendTimer = setTimeout(() => { extendTimer = null; extend(); }, 150);
  }

  function onScroll(): void {
    schedule();
    laterExtend();
  }

  function onResize(): void {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resizeTimer = null;
      sizeCanvas();
      measureFrames();
      const rg = range();
      for (const g of glyphs) {
        const box = place(g, rg);
        if (box) Object.assign(g, box);
      }
      extend();
      schedule();
    }, 200);
  }

  return {
    scatter(roots, vector) {
      if (canvas) return;
      vectorFn = vector;
      blown = isBlown();
      for (const root of roots) {
        const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
          acceptNode(node) {
            if (!node.nodeValue || !/\S/.test(node.nodeValue)) return NodeFilter.FILTER_REJECT;
            const p = node.parentElement;
            if (!p || p.closest('.cylon-glyph-src, .cylon-scatter-char')) return NodeFilter.FILTER_REJECT;
            return NodeFilter.FILTER_ACCEPT;
          },
        });
        while (walker.nextNode()) {
          const text = walker.currentNode as Text;
          pending.push({ text, frame: frameFor(text.parentElement!, root) });
        }
      }
      measureFrames();
      canvas = doc.createElement('canvas');
      canvas.className = 'cylon-glyph-layer';
      canvas.setAttribute('aria-hidden', 'true');
      ctx = canvas.getContext('2d');
      sizeCanvas();
      extend();
      body.appendChild(canvas);
      observer = new MutationObserver(onBodyClass);
      observer.observe(body, { attributes: true, attributeFilter: ['class'] });
      win.addEventListener('scroll', onScroll, { passive: true });
      win.addEventListener('resize', onResize);
      schedule();
    },

    restore() {
      if (raf) win.cancelAnimationFrame(raf);
      raf = 0;
      observer?.disconnect();
      observer = null;
      win.removeEventListener('scroll', onScroll);
      win.removeEventListener('resize', onResize);
      if (extendTimer) clearTimeout(extendTimer);
      if (resizeTimer) clearTimeout(resizeTimer);
      extendTimer = null;
      resizeTimer = null;
      for (const span of wrappers) {
        const text = span.firstChild;
        if (text) span.replaceWith(text); else span.remove();
      }
      wrappers.length = 0;
      parents.forEach((p) => p.classList.remove('cylon-glyph-parent'));
      parents.clear();
      canvas?.remove();
      canvas = null;
      ctx = null;
      glyphs = [];
      pending = [];
      frames = [];
      frameOf.clear();
      styleOf.clear();
      pages.length = 0;
      sprites.clear();
      shelfX = 0;
      shelfY = 0;
      shelfH = 0;
      blown = false;
      domUntil = 0;
    },

    reshuffle(vector) {
      vectorFn = vector;
      for (const g of glyphs) g.v = vector();
      const { ms, lookMs, ease } = moveTimes();
      blown = isBlown();
      retargetAll(ms, lookMs, ease);
      poke(Math.max(ms, lookMs) + 200);
    },

    kick(fn) {
      if (!glyphs.length) return;
      const t = now();
      const sx = win.scrollX;
      const sy = win.scrollY;
      const { ms, ease } = moveTimes();
      for (const g of glyphs) {
        const c = apply(g.frame.world, g.lx + tweenAt(g.x, t), g.ly + tweenAt(g.y, t));
        const v = fn(g.frame.fixed ? c.x + sx : c.x, g.frame.fixed ? c.y + sy : c.y, g.v);
        if (!v) continue;
        g.v = v;
        if (!blown) continue;
        g.x = retarget(g.x, v.sx, t, ms, ease);
        g.y = retarget(g.y, v.sy, t, ms, ease);
        g.r = retarget(g.r, v.sr, t, ms, ease);
      }
      schedule();
    },

    poke,

    count: () => glyphs.length,
  };
}
