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
  mirror: { name: "Medusa's mirror", key: 'Z', desc: 'Turns the Minotaur to stone for the turn you raise it and the 3 turns after; stone blocks everyone.' },
  cake: { name: 'Honey cake', key: 'X', desc: 'Adds one heart, with no limit; extra hearts last until the level ends.' },
  cow: { name: "Daedalus's cow", key: 'C', desc: 'Set down where you stand; the Minotaur goes for it first.' },
};

export type Terrain =
  | 'floor' | 'wall' | 'exit' | 'gate' | 'water' | 'fire' | 'ice'
  | 'force-up' | 'force-down' | 'force-left' | 'force-right'
  | 'dirt' | 'safe' | 'button' | 'toggle-open' | 'toggle-closed'
  | 'door-red' | 'door-blue' | 'door-yellow' | 'door-green'
  | 'trap' | 'button-brown' | 'button-red' | 'popup' | 'gravel'
  | 'fake-wall' | 'invisible-wall' | 'teleport' | 'thief' | 'bomb' | 'clone';

export interface TerrainDef {
  char: string;
  /** The sprites it can show: the gate's first is closed, its second open; a door's first is shut, its second the sill
   *  it leaves once open; the clone machine's, one per facing in DIRS order. */
  sprites: readonly string[];
  /** The Minotaur may stand on it. */
  minotaur: boolean;
  /** A pushed block may enter it. */
  block: boolean;
  /** A hazard may stand on it. */
  hazard: boolean;
  /** Gear the player needs to enter it. */
  needs?: Gear;
  /** It slides whoever enters, unless the player wears this gear. */
  slides?: Gear;
  /** It carries whoever enters this way, unless the player wears suction boots. */
  carries?: Dir;
  /** A door: the key colour that opens it. */
  door?: KeyColor;
}

const t = (char: string, minotaur: boolean, block: boolean, more: Partial<TerrainDef> = {}, sprites?: string[], hazard = minotaur) =>
  ({ char, minotaur, block, hazard, ...more, sprites: sprites ?? [] });

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
  'door-red': t('R', false, false, { door: 'red' }, ['door-red', 'door-red-sill']),
  'door-blue': t('B', false, false, { door: 'blue' }, ['door-blue', 'door-blue-sill']),
  'door-yellow': t('Y', false, false, { door: 'yellow' }, ['door-yellow', 'door-yellow-sill']),
  'door-green': t('G', false, false, { door: 'green' }, ['door-green', 'door-green-sill']),
  trap: t('&', true, true, {}, ['trap']),
  'button-brown': t('-', true, true, {}, ['button-brown']),
  'button-red': t('+', true, true, {}, ['button-red']),
  popup: t(';', false, false, {}, ['popup']),
  gravel: t(':', false, false, {}, ['gravel']),
  'fake-wall': t('W', false, false, {}, ['wall']),
  'invisible-wall': t('I', false, false, {}, ['floor']),
  teleport: t('@', false, false, {}, ['teleport']),
  thief: t('$', true, true, {}, ['thief']),
  bomb: t('!', false, true, {}, ['bomb'], true),
  clone: t('C', false, false, {}, DIRS.map(d => `clone-${d}`)),
};

/** A moving hazard: it stands on floor and turns by its own rule when it cannot go ahead. */
export type HazardKind = 'ball' | 'glider' | 'fireball';
export interface Hazard {
  readonly kind: HazardKind; readonly at: Cell; readonly dir: Dir;
  /** Its index among the level's homes: the level's hazard cells in reading order, then each hazard-template machine. */
  readonly home: number;
}

export const HAZARDS: Record<HazardKind, {
  char: string; name: string; sprite: string;
  /** What it tries, in order, when blocked ahead. */
  turns: readonly ('ahead' | 'left' | 'right' | 'back')[];
  /** The terrain it may cross though it is not floor. */
  crosses?: Terrain;
}> = {
  ball: { char: 'o', name: 'Bronze ball', sprite: 'ball', turns: ['back'] },
  glider: { char: 'w', name: 'Harpy', sprite: 'glider', turns: ['left', 'right', 'back'], crosses: 'water' },
  fireball: { char: 'e', name: "Talos's fire", sprite: 'fireball', turns: ['right', 'left', 'back'], crosses: 'fire' },
};

/** What a clone machine makes: a block or one of the hazards. */
export type Template = 'block' | HazardKind;

/** The pieces' names in the game and the help text; plain unless a myth gave one. */
export const PIECE_NAMES: Partial<Record<Terrain, string>> = {
  trap: "Daedalus's snare", 'button-brown': 'Brown button', 'button-red': 'Red button', popup: 'Pop-up wall',
  gravel: 'Gravel', 'fake-wall': 'Fake wall', 'invisible-wall': 'Invisible wall', teleport: 'Teleport',
  thief: 'Thief', bomb: 'Bomb', clone: 'Clone machine',
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

/** Classic's own forms of the gate and door sprites, which no cell shows at rest the right way round: each with the
 *  way through running up and down (`-v`; the plain ones run left and right), and the gate's bars sliding across,
 *  one frame a step of the way (src/openings.ts). */
export const TURNED_SPRITES = [
  'gate-closed-v', 'gate-open-v', 'gate-slide', 'gate-slide-v',
  'door-red-sill-v', 'door-blue-sill-v', 'door-yellow-sill-v', 'door-green-sill-v',
] as const;

/** Every sprite the board can ask the atlas for. */
export const SPRITE_NAMES: readonly string[] = [
  ...new Set([
    ...Object.values(TERRAIN).flatMap(d => d.sprites),
    ...TURNED_SPRITES,
    ...Object.values(OBJECTS).map(o => o.sprite),
    ...FIGURE_SPRITES,
    ...Object.values(HAZARDS).map(h => h.sprite),
  ]),
];
