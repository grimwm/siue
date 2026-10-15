/* The effects engine's public shape: what window.TankityFX offers the game
 * (effects.ts, render.ts, view.ts) and the dev-only editor. */
import type { FxApi, FxSystem } from '../render.ts';
import type { PreviewFx } from '../preview.ts';
import type { Weapon } from '../sim.ts';
import type { TrailCarrier, TrailState } from './trail.ts';

export type { TrailCarrier, TrailState };

export type Range = [number, number];
export type Shape = 'dot' | 'streak' | 'ring' | 'spark' | 'smoke' | 'sprite' | 'bolt' | 'beam';
export type Aim = 'fixed' | 'forward' | 'back' | 'normal';
export type Ease = 'linear' | 'out' | 'in';
export type Anim = 'once' | 'loop' | 'random';

/* One emitter with every field set. An authored emitter holds only what
   differs; the rest rides its prototype (see adopt in engine.ts). */
export interface Emitter {
  shape: Shape;
  count: number; rate: number;
  delay: number; duration: number;
  life: Range; speed: Range;
  aim: Aim; angle: number; spread: number;
  offset: number; edge: boolean;
  gravity: number; drag: number; wind: number;
  size: Range; sizeEnd: number; ease: Ease;
  alpha: number[]; colors: string[];
  glow: boolean; round: boolean;
  length: number; width: number;
  unit: 'px' | 'r';
  sheet: string; fps: number; scale: number;
  anchor: 'center' | 'bottom';
  rotJitter: number; spin: Range;
  tint: string;
  align: boolean; anim: Anim; ground: boolean;
}

export interface ScreenFx {
  shake?: number;
  flash?: { color?: string; alpha: number; dur?: number };
}

/** One emitter-set of a weapon (muzzle, trail, impact or a named special). */
export interface FxEffect { emitters: Emitter[]; screen?: ScreenFx }

/** The shell itself, from the weapon's `body` entry: its glow, and the
    rendered shell when `sprite` names a sheet (`size` px across, `fps`,
    `spin` degrees a second, or `roll` the ball's radius in px). */
export interface FxBody {
  halo?: number; alpha?: number; pulse?: number; stretch?: number;
  sprite?: string; size?: number; fps?: number; spin?: number; roll?: number;
}

/** A weapon's effect set as the engine plays it. */
export interface FxSet {
  body?: FxBody;
  muzzle?: FxEffect;
  trail?: FxEffect;
  impact?: FxEffect;
  special?: Record<string, FxEffect>;
}

/** An effect as authored: emitters hold only the fields that differ from DEFAULTS. */
export interface FxEffectData { emitters?: Partial<Emitter>[]; screen?: ScreenFx }
export interface FxSetData {
  body?: FxBody;
  muzzle?: FxEffectData;
  trail?: FxEffectData;
  impact?: FxEffectData;
  special?: Record<string, FxEffectData>;
}

/** A live particle system: what the battlefield draws and the loop steps. */
export interface FxSys extends FxSystem, PreviewFx {
  readonly max: number;
  reduced: boolean | null;
  readonly stats: { spawned: number; recycled: number; peak: number };
  readonly flash: { a: number; dur: number; t: number; color: string };
  readonly live: number;
  /** `len` above 0 plays the effect along a line `len` px long from (x, y) at heading `ang` (a beam): every particle starts somewhere along it, and a beam-shaped one spans it. */
  emit(ef: FxEffect | undefined, x: number, y: number, ang: number | undefined, r: number | undefined, ground?: boolean, len?: number): number | undefined;
  newTrail(ef: FxEffect): TrailState;
  trail(ef: FxEffect | undefined, tr: TrailState, x: number, y: number, ang: number, dt: number, r: number): void;
}

export interface SpriteSheetData {
  name: string;
  file: string;
  first: number; // the sheet's first frame within its file
  img: HTMLImageElement;
  fw: number;
  fh: number;
  cols: number;
  frames: number;
  fps: number;
  ready: boolean;
  tints: Record<string, CanvasImageSource>;
}

/** What window.TankityFX offers. FxApi is the draw half render.ts calls. */
export interface FxEngine extends FxApi {
  version: number;
  DEFAULTS: Emitter;
  SHAPES: readonly Shape[];
  SLOTS: readonly ('muzzle' | 'trail' | 'impact')[];
  SPECIALS: readonly string[];
  EASES: readonly Ease[];
  AIMS: readonly Aim[];
  ANIMS: readonly Anim[];
  SCHEMA: Readonly<Record<'shape' | 'aim' | 'ease' | 'unit' | 'anchor' | 'anim', readonly string[]>>;
  sheets: Record<string, SpriteSheetData>;
  BODY_DEFAULTS: Readonly<Required<Pick<FxBody, 'halo' | 'alpha' | 'pulse' | 'stretch'>>>;
  createSystem(opts: { max: number }): FxSys;
  loadSprites(base: string, done?: (any: boolean) => void): Promise<boolean>;
  /** Players' Screen flashes setting: false drops the screen flash and the large bright layers. */
  flashes: boolean;
  /** A large bright layer, which Screen flashes off drops; played at scale k (the radius for `unit: r`, else 1), also any layer reaching 36 px or more in radius. */
  isBright(em: Emitter, k?: number): boolean;
  sheetsOf(set: FxSet | undefined): string[];
  preload(names: string[]): void;
  adopt(em: Partial<Emitter>): Emitter;
  dress(defs: Record<string, FxSetData>): Record<string, FxSet>;
  dressEffect(ef: FxEffectData): FxEffect;
  newEmitter(shape?: Shape): Emitter;
  cloneEmitter(em: Emitter): Emitter;
  validate(defs: Record<string, FxSetData> | null | undefined, keys: string[]): string[];
  derive(gfx: Weapon['gfx'] | undefined): FxSet;
  toYaml(defs: Record<string, FxSet>): string;
  parseColor(s: string): [number, number, number];
  lutFor(colors: string[]): string[];
  play: {
    muzzle(sys: FxSys, set: FxSet, x: number, y: number, ang: number): number | undefined;
    impact(sys: FxSys, set: FxSet, x: number, y: number, r: number, ground?: boolean): number | undefined;
    /** `len`: a line special (the `beam`), played along `len` px from (x, y) at heading `ang`. */
    special(sys: FxSys, set: FxSet, name: string, x: number, y: number, ang: number, len?: number): void;
    trail(sys: FxSys, set: FxSet, s: TrailCarrier, dt: number, x: number, y: number, vx: number, vy: number): void;
  };
}

declare global {
  interface Window { TankityFX?: FxEngine; fxEditor?: unknown }
}
