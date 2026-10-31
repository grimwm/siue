/* The Island of Crete: the Dictionary's entries, one row for everything a player can pick up or meet, and what the
 * board shows of them now. Every entry has its picture (a Classic sprite, which reads in both looks), its name, a
 * line of lore and what it does; a tool also has its key. Every terrain, object and hazard of the rules maps to an
 * entry here or is plain (floor and wall), so a new piece cannot reach the board without one. DOM-free. */
import { TOOLS } from './puzzle/tiles.ts';
import type { HazardKind, KeyColor, ObjectKind, Terrain, Tool } from './puzzle/tiles.ts';
import type { State } from './puzzle/state.ts';

export type EntryKind = 'item' | 'hazard';

export interface Entry {
  readonly id: string;
  /** An item is picked up; a hazard is met on the board (the moving hazards, the Minotaur and the special tiles). */
  readonly kind: EntryKind;
  readonly name: string;
  readonly lore: string;
  /** What it does and how to use it, in full. */
  readonly effect: string;
  /** What it does, in a few words: the banner on a later pickup and the backpack. */
  readonly short: string;
  /** The key that uses it (a tool's). */
  readonly key?: string;
  /** Its picture: a sprite of the Classic atlas. */
  readonly sprite: string;
}

const tool = (t: Tool) => ({ name: TOOLS[t].name, key: TOOLS[t].key });

const key = (color: KeyColor, lore: string): Entry => color === 'green'
  ? { id: 'key-green', kind: 'item', name: 'Green key', sprite: 'key-green', lore,
      effect: 'Walk into a green door while you hold it and the door opens. The green key is never used up: it opens every green door.',
      short: 'Opens every green door' }
  : { id: `key-${color}`, kind: 'item', name: `${color[0]!.toUpperCase()}${color.slice(1)} key`, sprite: `key-${color}`, lore,
      effect: `Walk into a ${color} door while you hold it and the door opens. The key stays in the lock: each one opens one ${color} door.`,
      short: `Opens one ${color} door` };

const gear = (id: 'flippers' | 'fire-boots' | 'skates' | 'suction', name: string, lore: string, does: string, short: string): Entry =>
  ({ id, kind: 'item', name, sprite: id, lore, effect: `${does} You keep them for the level unless a thief takes them.`, short });

/** Every entry, items first, in the order the Dictionary lists them. */
export const ENTRIES: readonly Entry[] = [
  { id: 'relic', kind: 'item', name: 'Relic', sprite: 'relic',
    lore: 'The tribute of Athens: cups and masks of gold, left in the dark for the beast to guard.',
    effect: 'Walk onto it to take it. Take every relic in the level and the gate opens.',
    short: 'Take them all to open the gate' },
  key('red', 'Daedalus cut a key for every door he hung, and a red one turns in a single lock.'),
  key('blue', 'Blue as the sea that brought you here. Once it turns in a lock, it never comes out.'),
  key('yellow', 'Bright as the Cretan sun on bronze, and like the red and the blue, spent in its lock.'),
  key('green', 'Daedalus kept one key for himself, green as olive leaves, and it never stuck in a lock.'),
  gear('flippers', 'Flippers', 'A gift of the Naiads, the nymphs of springs and rivers, who never let a swimmer drown.',
    'While you wear them you can swim through water.', 'Swim through water'),
  gear('fire-boots', 'Fire boots', 'Hephaestus forged them at his anvil, and his own fire will not bite through them.',
    'While you wear them you can walk through fire.', 'Walk through fire'),
  gear('skates', 'Skates', 'Bronze blades for the glass floors: Daedalus skated where everyone else fell.',
    'While you wear them, ice no longer sends you sliding: you walk on it as on floor.', 'Walk on ice without sliding'),
  gear('suction', 'Suction boots', 'Soled with octopus skin from the harbour at Knossos, they grip any stone.',
    'While you wear them, force floors no longer carry you: you walk across them where you like.', 'Force floors do not carry you'),
  { id: 'mirror', kind: 'item', ...tool('mirror'), sprite: 'mirror',
    lore: 'Polished bronze that once showed the Gorgon her own face. Whoever meets its gaze turns to stone.',
    effect: `Hold it up and the Minotaur turns to stone: he does not move that turn or the 3 turns after, and while he is stone he blocks the way like a wall. Each mirror works once. Press ${TOOLS.mirror.key} to use it.`,
    short: 'Turns the Minotaur to stone for 3 turns' },
  { id: 'cake', kind: 'item', ...tool('cake'), sprite: 'cake',
    lore: 'The honey cake the Sibyl threw to Cerberus, the hound at the gates of the dead. It mends a hero just as well.',
    effect: `Eat it to win back one heart. It never gives you more hearts than the level began with, so it keeps while you are whole. Press ${TOOLS.cake.key} to eat it.`,
    short: 'Gives back one heart' },
  { id: 'cow', kind: 'item', ...tool('cow'), sprite: 'cow',
    lore: 'Daedalus built a wooden cow for Queen Pasiphaë, and so the Minotaur was born. He still cannot resist one.',
    effect: `Set it down where you stand. While it stands the Minotaur goes for the cow, not you, and once he reaches it the cow is gone. One cow stands at a time. Press ${TOOLS.cow.key} to set it down.`,
    short: 'Draws the Minotaur away from you' },
  { id: 'page', kind: 'item', name: 'Story page', sprite: 'page',
    lore: 'Leaves of the story, dropped in the dark by those who walked the Labyrinth before you.',
    effect: 'Walk onto it to take it and read it. Win the level after taking it and the page is yours to keep in the Lore book.',
    short: 'Win the level to keep it' },

  { id: 'minotaur', kind: 'hazard', name: 'The Minotaur', sprite: 'minotaur',
    lore: 'Asterion, son of Queen Pasiphaë and the white bull of Poseidon: half bull, all appetite.',
    effect: 'He takes two steps for each of your turns. Each step closes the gap across if that square is open to him, else the gap up or down; with neither open he stands. If he reaches you, you lose a heart and wake on your last safe zone, or where you began.',
    short: 'Two steps to your one' },
  { id: 'ball', kind: 'hazard', name: 'Bronze ball', sprite: 'ball',
    lore: 'A ball of solid bronze, set rolling by one of Daedalus\'s engines, that never comes to rest.',
    effect: 'Each turn, after your move, it rolls one square straight on; when blocked it turns back. If it rolls into you, or you walk into it, you lose a heart. It cannot enter a safe zone or gravel.',
    short: 'Rolls straight, turns back' },
  { id: 'glider', kind: 'hazard', name: 'Harpy', sprite: 'glider',
    lore: 'A storm wind with a woman\'s face and a vulture\'s claws, sent by the gods to snatch and harry.',
    effect: 'Each turn, after your move, it flies one square straight on; when blocked it turns left, else right, else back. It flies over water. If it flies into you, or you walk into it, you lose a heart. It cannot enter a safe zone or gravel.',
    short: 'Turns left when blocked; crosses water' },
  { id: 'fireball', kind: 'hazard', name: "Talos's fire", sprite: 'fireball',
    lore: 'Talos, the bronze giant who walks the shores of Crete, hurls fire at anything that comes near.',
    effect: 'Each turn, after your move, it runs one square straight on; when blocked it turns right, else left, else back. It runs through fire. If it runs into you, or you walk into it, you lose a heart. It cannot enter a safe zone or gravel.',
    short: 'Turns right when blocked; crosses fire' },
  { id: 'exit', kind: 'hazard', name: 'The exit', sprite: 'exit',
    lore: 'Daylight, the harbour, and the ship home to Athens.',
    effect: 'Step onto it once every relic is taken and you have won the level.',
    short: 'The way out' },
  { id: 'gate', kind: 'hazard', name: 'The gate of Minos', sprite: 'gate-closed',
    lore: 'Minos barred the way out with bronze, and only the tribute of Athens lifts it.',
    effect: 'Shut until you have taken every relic in the level; then it stands open for you. The Minotaur, hazards and blocks never pass it.',
    short: 'Opens when every relic is taken' },
  { id: 'water', kind: 'hazard', name: 'Water', sprite: 'water',
    lore: 'Black water from the springs under the island, cold enough to stop a heart.',
    effect: 'You need flippers to swim it. The Minotaur cannot enter it, and of the hazards only the Harpy flies over it. Push a block into it and the block sinks and fills it, so anyone can walk there.',
    short: 'Needs flippers' },
  { id: 'fire', kind: 'hazard', name: 'Fire', sprite: 'fire',
    lore: 'Flames from the forge of Hephaestus, which burns beneath the island.',
    effect: 'You need fire boots to walk through it. The Minotaur and blocks cannot enter it, and of the hazards only Talos\'s fire runs through it.',
    short: 'Needs fire boots' },
  { id: 'ice', kind: 'hazard', name: 'Ice', sprite: 'ice',
    lore: 'Daedalus polished these floors to glass, and nothing keeps its footing on them.',
    effect: 'Whoever steps onto it slides on the same way until they leave the ice or are stopped: you (unless you wear skates), the Minotaur, blocks and hazards.',
    short: 'Slides you on; skates hold' },
  { id: 'force', kind: 'hazard', name: 'Force floor', sprite: 'force-right',
    lore: 'Currents Daedalus set running through the stones, strong as the tide in a strait.',
    effect: 'It carries whoever stands on it the way its arrows point: you (unless you wear suction boots), the Minotaur, blocks and hazards.',
    short: 'Carries you; suction boots hold' },
  { id: 'dirt', kind: 'hazard', name: 'Filled water', sprite: 'dirt',
    lore: 'Where a block sank, the pool is silt and stone now.',
    effect: 'Solid ground: anyone may walk on it, and blocks may be pushed across it.',
    short: 'Solid ground' },
  { id: 'safe', kind: 'hazard', name: 'Safe zone', sprite: 'safe',
    lore: 'Marks cut by the tributes before you, where the beast would not follow.',
    effect: 'The Minotaur and hazards cannot enter it, and blocks cannot be pushed onto it. When you are caught you wake on the last safe zone you stood on, or where you began.',
    short: 'Keeps the Minotaur out' },
  { id: 'door', kind: 'hazard', name: 'Door', sprite: 'door-red',
    lore: 'Daedalus hung doors of every colour, each with a lock of its own.',
    effect: 'Walk into it holding a key of its colour and it opens for good. Red, blue and yellow keys are spent in the lock; a green key opens every green door. A shut door stops the Minotaur, hazards and blocks.',
    short: 'Opens to a key of its colour' },
  { id: 'block', kind: 'hazard', name: 'Stone block', sprite: 'block',
    lore: 'A block from the old quarry, too heavy for anyone but a hero to shift.',
    effect: 'Walk into it to push it one square, when the square beyond is free. Pushed into water it sinks and fills it; onto a bomb, both are gone; on ice or a force floor it slides on. It presses the buttons it stops on. The Minotaur and hazards cannot pass it.',
    short: 'Push it' },
  { id: 'button', kind: 'hazard', name: 'Toggle button', sprite: 'button',
    lore: 'A bronze plate in the floor that turns Daedalus\'s walls about.',
    effect: 'Each time you, a block or a hazard arrives on it, every toggle wall in the level opens or closes.',
    short: 'Flips the toggle walls' },
  { id: 'toggle', kind: 'hazard', name: 'Toggle wall', sprite: 'toggle-closed',
    lore: 'Walls on hidden hinges, that change places when the plate is trodden.',
    effect: 'The toggle button opens or closes it. Open, it is floor to you, the Minotaur and hazards, though a block cannot be pushed onto it; shut, it is a wall.',
    short: 'Opens and shuts at the toggle button' },
  { id: 'trap', kind: 'hazard', name: "Daedalus's snare", sprite: 'trap',
    lore: 'A bronze jaw hidden in the floor, from the workshop of the man who built the Labyrinth.',
    effect: 'Whoever stands on it is held there (you, a block, a hazard or the Minotaur) until something holds down a brown button that works it. Held, you cannot move or push, but you can wait and use tools; a held block cannot be pushed.',
    short: 'Holds whoever stands on it' },
  { id: 'button-brown', kind: 'hazard', name: 'Brown button', sprite: 'button-brown',
    lore: 'A plate that springs Daedalus\'s snare when enough weight rests on it.',
    effect: 'While you, a block or a hazard stands on it, the snare it works lets go. It works the next snare along, counting left to right and top to bottom. The Minotaur and the cow never hold it down.',
    short: 'Opens its snare while held down' },
  { id: 'button-red', kind: 'hazard', name: 'Red button', sprite: 'button-red',
    lore: 'A plate that wakes one of Daedalus\'s clone machines.',
    effect: 'Each time you, a block or a hazard arrives on it, the clone machine it works makes its copy, if the square in front of the machine is free. It works the next machine along, counting left to right and top to bottom.',
    short: 'Makes its clone machine copy' },
  { id: 'clone', kind: 'hazard', name: 'Clone machine', sprite: 'clone-down',
    lore: 'Daedalus\'s workshop never rests: give it a pattern and it turns out another.',
    effect: 'A wall to everyone. Each time its red button is pressed it makes a block or a hazard in the square in front of it, facing its way, if that square is free.',
    short: 'Copies a block or hazard' },
  { id: 'popup', kind: 'hazard', name: 'Pop-up wall', sprite: 'popup',
    lore: 'Stones on springs that rise behind a passing hero, so there is no going back.',
    effect: 'Floor you may cross once: when you leave it, it rises as a wall. Nothing else may enter it.',
    short: 'Rises behind you' },
  { id: 'gravel', kind: 'hazard', name: 'Gravel', sprite: 'gravel',
    lore: 'Loose stones that shift and clatter underfoot. The beast hates the sound.',
    effect: 'You can walk across it; blocks, the Minotaur and hazards cannot.',
    short: 'Only you can cross it' },
  { id: 'fake-wall', kind: 'hazard', name: 'Fake wall', sprite: 'wall',
    lore: 'Plaster painted to look like stone: Daedalus\'s joke on anyone who trusts their eyes.',
    effect: 'It looks like a wall and is one to everyone, until you walk into it: then it crumbles to floor. Walking into it costs a turn.',
    short: 'Crumbles when you walk into it' },
  { id: 'invisible-wall', kind: 'hazard', name: 'Invisible wall', sprite: 'wall',
    lore: 'Glass so clear it cannot be seen, set across the passages to baffle the lost.',
    effect: 'It looks like floor and is a wall. Walk into it and it shows itself; that costs a turn. Sliding into it, or pushing a block at it, does not show it.',
    short: 'A wall that looks like floor' },
  { id: 'teleport', kind: 'hazard', name: 'Teleport', sprite: 'teleport',
    lore: 'A doorway of Hermes, the messenger, who goes from place to place without crossing the space between.',
    effect: 'Step into it, or push a block in, and out it comes at the next teleport along (counting left to right and top to bottom, then round again), one square on the same way. A blocked way out is passed over for the next. The Minotaur and hazards cannot enter it, and a teleport alone in its level is a wall.',
    short: 'Out at the next teleport' },
  { id: 'thief', kind: 'hazard', name: 'Thief', sprite: 'thief',
    lore: 'A light-fingered servant of Hermes, god of thieves, who haunts the halls.',
    effect: 'Step on it and it takes all your gear: flippers, fire boots, skates and suction boots. Your keys and tools stay with you.',
    short: 'Takes all your gear' },
  { id: 'bomb', kind: 'hazard', name: 'Bomb', sprite: 'bomb',
    lore: 'A jar of naphtha and pitch from the forge, that bursts at a touch.',
    effect: 'Step on it and it bursts: you lose a heart and wake on your last safe zone (or where you began), and the bomb is gone. A block or a hazard that arrives on it is destroyed with it. The Minotaur never steps on it.',
    short: 'Costs a heart; destroys blocks and hazards' },
];

export const ENTRY: Readonly<Record<string, Entry>> = Object.fromEntries(ENTRIES.map(e => [e.id, e]));

/** Terrain that needs no entry: everyone knows a floor and a wall. */
export const PLAIN: readonly Terrain[] = ['floor', 'wall'];

/** The entry each terrain shows, or null for plain terrain. */
export const TERRAIN_ENTRY: Readonly<Record<Terrain, string | null>> = {
  floor: null, wall: null, exit: 'exit', gate: 'gate', water: 'water', fire: 'fire', ice: 'ice',
  'force-up': 'force', 'force-down': 'force', 'force-left': 'force', 'force-right': 'force',
  dirt: 'dirt', safe: 'safe', button: 'button', 'toggle-open': 'toggle', 'toggle-closed': 'toggle',
  'door-red': 'door', 'door-blue': 'door', 'door-yellow': 'door', 'door-green': 'door',
  trap: 'trap', 'button-brown': 'button-brown', 'button-red': 'button-red', popup: 'popup', gravel: 'gravel',
  'fake-wall': 'fake-wall', 'invisible-wall': 'invisible-wall', teleport: 'teleport', thief: 'thief', bomb: 'bomb', clone: 'clone',
};

/** The entry each object shows: what the player picks up, and the block. */
export const OBJECT_ENTRY: Readonly<Record<ObjectKind, string>> = {
  relic: 'relic', 'key-red': 'key-red', 'key-blue': 'key-blue', 'key-yellow': 'key-yellow', 'key-green': 'key-green',
  flippers: 'flippers', 'fire-boots': 'fire-boots', skates: 'skates', suction: 'suction',
  mirror: 'mirror', cake: 'cake', cow: 'cow', page: 'page', block: 'block',
};

export const HAZARD_ENTRY: Readonly<Record<HazardKind, string>> = { ball: 'ball', glider: 'glider', fireball: 'fireball' };

/** Hidden pieces: they look like something else, so they are met when they are found, never on sight. */
const HIDDEN: ReadonlySet<Terrain> = new Set<Terrain>(['fake-wall', 'invisible-wall']);

/** The hazard entries the board shows now, in the Dictionary's order: the special tiles in sight, the blocks, the
 *  moving hazards and the Minotaur. A fake or invisible wall counts once it is found, not while it hides. */
export function inSight(s: State): string[] {
  const ids = new Set<string>();
  const start = s.level.terrain;
  s.terrain.forEach((t, i) => {
    const was = start[i]!;
    if (HIDDEN.has(was) && t !== was) ids.add(TERRAIN_ENTRY[was]!);
    const id = HIDDEN.has(t) ? null : TERRAIN_ENTRY[t];
    if (id) ids.add(id);
  });
  if (s.objects.includes('block')) ids.add('block');
  for (const h of s.hazards) ids.add(HAZARD_ENTRY[h.kind]);
  if (s.minotaur) ids.add('minotaur');
  return ENTRIES.filter(e => e.kind === 'hazard' && ids.has(e.id)).map(e => e.id);
}

export interface Held { readonly entry: Entry; readonly count: number }

/** What the player holds now in this try, with counts, in the Dictionary's order: the relics and story pages
 *  taken, the keys, the gear worn and the tools. Empty with no try. */
export function backpack(s: State | null): Held[] {
  if (!s) return [];
  const pages = s.level.pageIds.filter((_, i) => (s.pages >> i) & 1).length;
  const relics = s.level.objects.filter((o, i) => o === 'relic' && s.objects[i] !== 'relic').length;
  const count: Record<string, number> = {
    relic: relics, page: pages,
    'key-red': s.keys.red, 'key-blue': s.keys.blue, 'key-yellow': s.keys.yellow, 'key-green': s.keys.green,
    mirror: s.tools.mirror, cake: s.tools.cake, cow: s.tools.cow,
  };
  for (const g of s.gear) count[g] = 1;
  return ENTRIES.filter(e => e.kind === 'item' && (count[e.id] ?? 0) > 0).map(e => ({ entry: e, count: count[e.id]! }));
}
