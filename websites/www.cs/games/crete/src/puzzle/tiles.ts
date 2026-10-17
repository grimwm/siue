/* The Island of Crete: the puzzle's pieces as data. Each terrain and object, the
 * character the level text uses for it, who may enter it, and the sprites the
 * board draws. DOM-free. */
export interface Cell { readonly r: number; readonly c: number }

export type Dir = 'up' | 'down' | 'left' | 'right';
export const DIRS: readonly Dir[] = ['up', 'down', 'left', 'right'];
export const DELTA: Record<Dir, readonly [number, number]> = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] };

export type KeyColor = 'red' | 'blue' | 'yellow' | 'green';
export const KEY_COLORS: readonly KeyColor[] = ['red', 'blue', 'yellow', 'green'];

export type Gear = 'flippers' | 'fire-boots' | 'skates' | 'suction';
export const GEAR: readonly Gear[] = ['flippers', 'fire-boots', 'skates', 'suction'];

export type Tool = 'mirror' | 'cake' | 'cow';
export const TOOLS: Record<Tool, { name: string; key: string; desc: string }> = {
  mirror: { name: "Medusa's mirror", key: 'Z', desc: 'Turns the Minotaur to stone for 3 turns; stone blocks everyone.' },
  cake: { name: 'Honey cake', key: 'X', desc: 'Gives back one heart.' },
  cow: { name: "Daedalus's cow", key: 'C', desc: 'Set down where you stand; the Minotaur goes for it first.' },
};

export type Terrain =
  | 'floor' | 'wall' | 'exit' | 'gate' | 'water' | 'fire' | 'ice'
  | 'force-up' | 'force-down' | 'force-left' | 'force-right'
  | 'dirt' | 'safe' | 'button' | 'toggle-open' | 'toggle-closed'
  | 'door-red' | 'door-blue' | 'door-yellow' | 'door-green';

export interface TerrainDef {
  char: string;
  /** The sprites it can show: the gate's first is closed, its second open. */
  sprites: readonly string[];
  /** The Minotaur may stand on it. */
  minotaur: boolean;
  /** A pushed block may enter it. */
  block: boolean;
  /** Gear the player needs to enter it. */
  needs?: Gear;
  /** It slides whoever enters, unless the player wears this gear. */
  slides?: Gear;
  /** It carries whoever enters this way, unless the player wears suction boots. */
  carries?: Dir;
  /** A door: the key colour that opens it. */
  door?: KeyColor;
}

const t = (char: string, minotaur: boolean, block: boolean, more: Partial<TerrainDef> = {}, sprites?: string[]) =>
  ({ char, minotaur, block, ...more, sprites: sprites ?? [] });

export const TERRAIN: Record<Terrain, TerrainDef> = {
  floor: t('.', true, true, {}, ['floor']),
  wall: t('#', false, false, {}, ['wall']),
  exit: t('E', false, false, {}, ['exit']),
  gate: t('|', false, false, {}, ['gate-closed', 'gate-open']),
  water: t('~', false, true, { needs: 'flippers' }, ['water']),
  fire: t('F', false, false, { needs: 'fire-boots' }, ['fire']),
  ice: t('=', true, true, { slides: 'skates' }, ['ice']),
  'force-up': t('^', true, true, { carries: 'up' }, ['force-up']),
  'force-down': t('v', true, true, { carries: 'down' }, ['force-down']),
  'force-left': t('<', true, true, { carries: 'left' }, ['force-left']),
  'force-right': t('>', true, true, { carries: 'right' }, ['force-right']),
  dirt: t('%', true, true, {}, ['dirt']),
  safe: t('S', false, false, {}, ['safe']),
  button: t('_', true, true, {}, ['button']),
  'toggle-open': t('t', true, false, {}, ['toggle-open']),
  'toggle-closed': t('T', false, false, {}, ['toggle-closed']),
  'door-red': t('R', false, false, { door: 'red' }, ['door-red']),
  'door-blue': t('B', false, false, { door: 'blue' }, ['door-blue']),
  'door-yellow': t('Y', false, false, { door: 'yellow' }, ['door-yellow']),
  'door-green': t('G', false, false, { door: 'green' }, ['door-green']),
};

export type ObjectKind = 'relic' | `key-${KeyColor}` | Gear | Tool | 'page' | 'block';

export const OBJECTS: Record<ObjectKind, { char: string; sprite: string; name: string }> = {
  relic: { char: '*', sprite: 'relic', name: 'relic' },
  'key-red': { char: 'r', sprite: 'key-red', name: 'red key' },
  'key-blue': { char: 'b', sprite: 'key-blue', name: 'blue key' },
  'key-yellow': { char: 'y', sprite: 'key-yellow', name: 'yellow key' },
  'key-green': { char: 'g', sprite: 'key-green', name: 'green key' },
  flippers: { char: 'f', sprite: 'flippers', name: 'flippers' },
  'fire-boots': { char: 'h', sprite: 'fire-boots', name: 'fire boots' },
  skates: { char: 'k', sprite: 'skates', name: 'skates' },
  suction: { char: 'u', sprite: 'suction', name: 'suction boots' },
  mirror: { char: 'z', sprite: 'mirror', name: TOOLS.mirror.name },
  cake: { char: 'x', sprite: 'cake', name: TOOLS.cake.name },
  cow: { char: 'c', sprite: 'cow', name: TOOLS.cow.name },
  page: { char: 'p', sprite: 'page', name: 'story page' },
  block: { char: 'O', sprite: 'block', name: 'block' },
};

/** The figures: drawn over the grid, never part of it. */
export const FIGURE_SPRITES = ['theseus', 'minotaur', 'minotaur-stone', 'cow-standing'] as const;

/** Every sprite the board can ask the atlas for. */
export const SPRITE_NAMES: readonly string[] = [
  ...new Set([
    ...Object.values(TERRAIN).flatMap(d => d.sprites),
    ...Object.values(OBJECTS).map(o => o.sprite),
    ...FIGURE_SPRITES,
  ]),
];
