/* Operation Tankity: how an earth gun looks and sounds when it moves the
 * ground, shared by the solo war (match.ts), the room replay (room.ts) and the
 * firing range (preview.ts): the impact and specials it plays, the shake, the
 * sound, and the ground's picture settling (earth-show.ts). The ground itself
 * has already moved (earth.ts applyEarth); `before` is how it was. */
import type { EarthOp } from './earth.ts';
import type { EarthShow } from './earth-show.ts';

export interface EarthFxDeps {
  fxImpact(key: string, x: number, y: number, r: number): number | undefined;
  fxSpecial(key: string, name: string, x: number, y: number, ang: number, len?: number): void;
  sound(name: 'boom' | 'thud'): void;
  shake(k: number): void;
  show: EarthShow | null;
}

/** The smallest a pour's splash is sized, px. */
export const POUR_SPLASH_MIN = 12;

/* Plays op, which moved `terrain` from `before` over columns x0..x1. */
export function playEarthOp(op: EarthOp, terrain: readonly number[], before: readonly number[], x0: number, x1: number, d: EarthFxDeps): void {
  const at = (x: number): number => terrain[Math.max(0, Math.min(terrain.length - 1, Math.round(x)))]!;
  if (op.t === 'dirt') {
    d.sound('thud');
    const kick = d.fxImpact(op.w, op.x, op.y, op.r);
    d.shake(kick !== undefined ? kick : Math.min(0.6, op.r / 100));
    d.show && d.show.begin(before, x0, x1, 'dirt', Math.round(op.x));
  } else if (op.t === 'pour') {
    d.sound('thud');
    const level = at(op.x);
    d.fxImpact(op.w, op.x, before[Math.round(op.x)] ?? level, Math.max(POUR_SPLASH_MIN, (x1 - x0) / 2));
    if (x1 >= x0) d.fxSpecial(op.w, 'pour', x0, level, 0, x1 - x0);
    d.show && d.show.begin(before, x0, x1, 'pour', op.x);
  } else if (op.t === 'slump') {
    d.sound('boom');
    const kick = d.fxImpact(op.w, op.x, at(op.x), op.r);
    d.shake(kick !== undefined ? kick : 0.5);
    d.show && d.show.begin(before, x0, x1, 'slump', Math.round(op.x));
  } else if (op.t === 'riot') {
    d.sound('boom');
    const kick = d.fxImpact(op.w, op.x, op.y, op.r);
    d.fxSpecial(op.w, 'dig', op.x, op.y, op.a, op.r);
    d.shake(kick !== undefined ? kick : 0.35);
  }
}
/** Every this many steps a burrow plays its dig special at its head. */
export const DIG_FX_EVERY = 3;
/* A digger touching down (step 0: its impact, sized by the trench, when it
   has no warheads to burst) or cutting step `step` of its trench at (x, y). */
export function playDigStep(wkey: string, x: number, y: number, ang: number, r: number, step: number, warheads: number, d: EarthFxDeps): void {
  if (step === 0) {
    d.sound('thud');
    if (!warheads) d.fxImpact(wkey, x, y, r);
  }
  if (step % DIG_FX_EVERY === 0) d.fxSpecial(wkey, 'dig', x, y, ang);
}
