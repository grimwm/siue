/* Operation Tankity: the tutorial's lesson, as data, and where its bubble goes.
 *
 * Each step points at a real control (CSS selectors, tried in order: the first
 * with a match on screen wins), says one short thing about it, and knows how
 * to tell the player did it (a test of the game now against the game when the
 * step began). Keys are named in a step's `keys` line only, as
 * {context:action} tokens the overlay fills from the live key table, and only
 * a keyboard player sees that line. No step names a weapon: the shop steps
 * point at whatever gun row the shelf holds.
 *
 * placeBubble is the speech bubble's geometry: beside the target, inside the
 * screen, never over the target's centre. Pure; it never touches the page. */

/** What the coach reads from the game, once per frame. */
export interface CoachSnap {
  phase: string;
  angle: number;
  power: number;
  x: number;
  /** The loaded gun's key. */
  selected: string;
  /** Shots the player has fired since the coach began. */
  fired: number;
  cash: number;
  /** The firing range is open. */
  preview: boolean;
  shopSel: number;
  shopQty: number;
}

/** When a step can be done: in the shop, on the player's aim, or any time in the war. */
export type CoachWhen = 'shop' | 'aim' | 'battle';

export interface CoachStep {
  id: string;
  /** Selectors for what the step is about, tried in order. A selector may match
   *  several elements: the spotlight covers them all. */
  target: readonly string[];
  /** What to do, in plain words that hold on every device. */
  text: string;
  /** The keys for it, as {context:action} tokens; keyboard devices only. */
  keys?: string;
  when: CoachWhen;
  /** Done by doing: `now` against `start`, the game when the step began. A
   *  step whose test never passes waits for Next. */
  done(now: CoachSnap, start: CoachSnap): boolean;
}

const GUN_ROW = '#shop-list li[data-kind="gun"]';

export const COACH_STEPS: readonly CoachStep[] = [
  {
    id: 'shop-row', when: 'shop', target: [GUN_ROW],
    text: 'Each row is a gun: what it does, and what it costs.',
    keys: '{shop:selUp} {shop:selDown} move between rows.',
    done: (now, start) => now.shopSel !== start.shopSel,
  },
  {
    id: 'shop-pack', when: 'shop', target: [`${GUN_ROW} .shop-vals`],
    text: 'A pack: how many shells one Buy brings, and the price.',
    keys: '{shop:qtyDown} {shop:qtyUp} buy several packs at once.',
    done: (now, start) => now.shopQty !== start.shopQty,
  },
  {
    id: 'shop-buy', when: 'shop', target: [`${GUN_ROW} [data-act="buy"]:not([disabled])`, '#shop-list [data-act="buy"]:not([disabled])'],
    text: 'Buy a pack. It comes out of your war chest.',
    keys: '{shop:buy} buys the highlighted row.',
    done: (now, start) => now.cash < start.cash,
  },
  {
    id: 'shop-preview', when: 'shop', target: [`${GUN_ROW} [data-act="preview"]`, '#shop-list [data-act="preview"]'],
    text: 'Preview fires a gun on a test hill before you pay.',
    keys: '{shop:preview} previews the highlighted row.',
    done: now => now.preview,
  },
  {
    id: 'shop-start', when: 'shop', target: ['#shop-next'],
    text: 'Ready? Start the round.',
    keys: '{shop:next} starts it.',
    done: now => now.phase !== 'shop',
  },
  {
    id: 'barrel', when: 'aim', target: ['[data-aim="left"], [data-aim="right"]'],
    text: 'Hold ◀ or ▶ to swing the barrel.',
    keys: 'Keys: {aim:barrelLeft} {aim:barrelRight}',
    done: (now, start) => now.angle !== start.angle,
  },
  {
    id: 'power', when: 'aim', target: ['[data-aim="up"], [data-aim="down"]'],
    text: 'Hold ▲ or ▼ to set the power. More power flies farther.',
    keys: 'Keys: {aim:powerUp} {aim:powerDown}',
    done: (now, start) => now.power !== start.power,
  },
  {
    id: 'drive', when: 'aim', target: ['#btn-drive-l, #btn-drive-r'],
    text: 'Drive while your fuel lasts. Hills are cover.',
    keys: 'Keys: {aim:driveLeft} {aim:driveRight}',
    done: (now, start) => Math.abs(now.x - start.x) > 2,
  },
  {
    id: 'weapon', when: 'aim', target: ['#gun-overlay:not([hidden]) #gun-grid', '#btn-weapon'],
    text: 'Open Weapons and load another shell.',
    keys: 'Key: {global:guns}',
    done: (now, start) => now.selected !== start.selected,
  },
  {
    id: 'fire', when: 'aim', target: ['#btn-cannon'],
    text: 'FIRE!',
    keys: 'Key: {global:fire}',
    done: (now, start) => now.fired > start.fired,
  },
  {
    id: 'wind', when: 'battle', target: ['.pill.wind'],
    text: 'Wind bends every shot. Read it here, then aim again.',
    done: (now, start) => now.phase === 'aim' && start.phase !== 'aim',
  },
];

const WAR = new Set(['aim', 'think', 'fly', 'settle']);

/** The step can be shown and done in this phase. */
export function stepFits(step: CoachStep, phase: string): boolean {
  if (step.when === 'shop') return phase === 'shop';
  if (step.when === 'aim') return phase === 'aim';
  return WAR.has(phase);
}

/** Where a lesson starts: in the shop at its first step, in a battle at the first battle step. */
export function firstStep(steps: readonly CoachStep[], phase: string): number {
  if (phase === 'shop') return 0;
  const i = steps.findIndex(s => s.when !== 'shop');
  return i < 0 ? steps.length : i;
}

/** The step after this frame: the next one when this one is done; past the
 *  shop's steps once the battle is under way (the player started the round
 *  early); otherwise this one. Returns steps.length when the lesson is over. */
export function advance(steps: readonly CoachStep[], i: number, now: CoachSnap, start: CoachSnap): number {
  const step = steps[i];
  if (!step) return steps.length;
  if (step.when === 'shop' && now.phase !== 'shop' && (WAR.has(now.phase) || now.phase === 'banner')) {
    return firstStep(steps, 'aim');
  }
  if (stepFits(step, now.phase) && step.done(now, start)) return i + 1;
  return i;
}

/** "3 of 11". */
export function stepCount(steps: readonly CoachStep[], i: number): string {
  return `${i + 1} of ${steps.length}`;
}

/** The {context:action} tokens a keys line names, in order. */
export function keyTokens(line: string): string[] {
  return [...line.matchAll(/\{([a-z]+:[a-zA-Z]+(?::\d+)?)\}/g)].map(m => m[1]!);
}

/* ---------- the bubble's geometry ---------- */

export interface Rect { left: number; top: number; width: number; height: number }
export interface Size { w: number; h: number }
/** Which side of the target the bubble sits on; 'none' is the fallback when no
 *  side has room (the bubble then takes the screen edge farther from the
 *  target's centre, without an arrow). */
export type Side = 'below' | 'above' | 'right' | 'left' | 'none';
export interface Placement {
  x: number;
  y: number;
  side: Side;
  /** Where the arrow meets the bubble's edge: px from its left (below, above) or top (left, right). */
  arrow: number;
}

/** Gap between bubble and target (room for the arrow), and the screen margin. */
export const BUBBLE_GAP = 12;
export const SCREEN_MARGIN = 8;
const ARROW_INSET = 14;

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/** Places a bubble of size `bubble` next to `target` inside a `view`-sized screen. */
export function placeBubble(target: Rect, bubble: Size, view: Size, gap = BUBBLE_GAP, margin = SCREEN_MARGIN): Placement {
  const t = { l: target.left, t: target.top, r: target.left + target.width, b: target.top + target.height };
  const cx = t.l + target.width / 2;
  const cy = t.t + target.height / 2;
  const room: Record<Exclude<Side, 'none'>, number> = {
    below: view.h - margin - (t.b + gap),
    above: t.t - gap - margin,
    right: view.w - margin - (t.r + gap),
    left: t.l - gap - margin,
  };
  const vertical = room.below >= room.above ? ['below', 'above'] as const : ['above', 'below'] as const;
  const horizontal = room.right >= room.left ? ['right', 'left'] as const : ['left', 'right'] as const;
  const widthFits = bubble.w <= view.w - 2 * margin;
  const heightFits = bubble.h <= view.h - 2 * margin;
  for (const side of [...vertical, ...horizontal]) {
    const isVertical = side === 'below' || side === 'above';
    if (isVertical ? !(widthFits && room[side] >= bubble.h) : !(heightFits && room[side] >= bubble.w)) continue;
    if (isVertical) {
      const x = clamp(cx - bubble.w / 2, margin, view.w - margin - bubble.w);
      const y = side === 'below' ? t.b + gap : t.t - gap - bubble.h;
      return { x, y, side, arrow: clamp(cx - x, ARROW_INSET, bubble.w - ARROW_INSET) };
    }
    const y = clamp(cy - bubble.h / 2, margin, view.h - margin - bubble.h);
    const x = side === 'right' ? t.r + gap : t.l - gap - bubble.w;
    return { x, y, side, arrow: clamp(cy - y, ARROW_INSET, bubble.h - ARROW_INSET) };
  }
  // No side has room (a target as big as the screen): the edge away from its centre.
  const x = clamp(cx - bubble.w / 2, margin, Math.max(margin, view.w - margin - bubble.w));
  const y = cy > view.h / 2 ? margin : Math.max(margin, view.h - margin - bubble.h);
  return { x, y, side: 'none', arrow: 0 };
}

/** The spotlight: the target grown by `pad`, kept on screen. */
export function spotlight(target: Rect, view: Size, pad = 6): Rect {
  const left = Math.max(0, target.left - pad);
  const top = Math.max(0, target.top - pad);
  const right = Math.min(view.w, target.left + target.width + pad);
  const bottom = Math.min(view.h, target.top + target.height + pad);
  return { left, top, width: Math.max(0, right - left), height: Math.max(0, bottom - top) };
}

/** The smallest rect holding every one of `rects`, or null for none. */
export function union(rects: readonly Rect[]): Rect | null {
  if (!rects.length) return null;
  const left = Math.min(...rects.map(r => r.left));
  const top = Math.min(...rects.map(r => r.top));
  const right = Math.max(...rects.map(r => r.left + r.width));
  const bottom = Math.max(...rects.map(r => r.top + r.height));
  return { left, top, width: right - left, height: bottom - top };
}
