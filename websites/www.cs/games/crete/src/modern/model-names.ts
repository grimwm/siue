/* The Island of Crete, modern look: the models by name, and which one each cell and figure shows. A cell shows
 * the model named like the sprite Classic draws there (src/board-plan.ts drawList): a clone machine by its facing,
 * the gate open once the last relic is taken, a fake wall as wall and an invisible wall as floor. Each model
 * stands on a ground surface; walls are built from their outer faces, not per cell. The pieces and figures stand
 * where drawList puts their sprites (`placed`). DOM-free. */
import { DIRS, HAZARDS, OBJECTS, TERRAIN } from '../puzzle/tiles.ts';
import type { Dir } from '../puzzle/tiles.ts';
import type { State } from '../puzzle/state.ts';
import type { Figures } from '../board-plan.ts';

export const TERRAIN_MODEL_NAMES = [
  'floor', 'wall', 'exit', 'gate-closed', 'gate-open', 'water', 'fire', 'ice',
  'force-up', 'force-down', 'force-left', 'force-right', 'dirt', 'safe', 'button', 'toggle-open', 'toggle-closed',
  'door-red', 'door-blue', 'door-yellow', 'door-green', 'trap', 'button-brown', 'button-red', 'popup', 'gravel',
  'teleport', 'thief', 'bomb', 'clone-up', 'clone-down', 'clone-left', 'clone-right',
] as const;
export type TerrainModel = (typeof TERRAIN_MODEL_NAMES)[number];

/** The ground under a cell's model: a flagstone, a surface of its own, or none (a wall, the exit's stair). */
export type Surface = 'flag' | 'ember' | 'ice' | 'force' | 'dirt' | 'gravel' | 'water' | 'none';

export const SURFACES: Record<TerrainModel, Surface> = {
  floor: 'flag', wall: 'none', exit: 'none', 'gate-closed': 'flag', 'gate-open': 'flag', water: 'water', fire: 'ember',
  ice: 'ice', 'force-up': 'force', 'force-down': 'force', 'force-left': 'force', 'force-right': 'force', dirt: 'dirt',
  safe: 'flag', button: 'flag', 'toggle-open': 'flag', 'toggle-closed': 'flag', 'door-red': 'flag', 'door-blue': 'flag',
  'door-yellow': 'flag', 'door-green': 'flag', trap: 'flag', 'button-brown': 'flag', 'button-red': 'flag', popup: 'flag',
  gravel: 'gravel', teleport: 'flag', thief: 'flag', bomb: 'flag', 'clone-up': 'flag', 'clone-down': 'flag',
  'clone-left': 'flag', 'clone-right': 'flag',
};

/** The model cell `i` (row * cols + col) shows. */
export function terrainModel(s: Pick<State, 'level' | 'terrain' | 'relicsLeft'>, i: number): TerrainModel {
  const t = s.terrain[i]!;
  const sprites = TERRAIN[t].sprites;
  if (t === 'clone') {
    const r = Math.floor(i / s.level.cols), c = i % s.level.cols;
    const m = s.level.machines.find(x => x.at.r === r && x.at.c === c);
    return sprites[DIRS.indexOf(m?.dir ?? 'up')] as TerrainModel;
  }
  return (t === 'gate' && s.relicsLeft === 0 ? sprites[1] : sprites[0]) as TerrainModel;
}

/** The objects, the hazards and the cow Theseus set down: things that stand on a cell. */
export const PIECE_MODEL_NAMES = [
  'relic', 'key-red', 'key-blue', 'key-yellow', 'key-green', 'flippers', 'fire-boots', 'skates', 'suction',
  'mirror', 'cake', 'cow', 'page', 'block', 'cow-standing', 'ball', 'glider', 'fireball',
] as const;
export type PieceModel = (typeof PIECE_MODEL_NAMES)[number];

export const FIGURE_MODEL_NAMES = ['theseus', 'minotaur', 'minotaur-stone'] as const;
export type FigureModel = (typeof FIGURE_MODEL_NAMES)[number];

/** A piece or figure where it stands. `id` names it from one frame to the next; one without an id (a hazard, a
 *  sliding block) is known by its model and where it was. `dir` is the way it faces until it steps. */
export interface Placed {
  model: PieceModel | FigureModel;
  r: number;
  c: number;
  id: string | null;
  dir?: Dir;
}

/** The pieces and figures on the board, by drawList's rules: each object (less a block on its way somewhere), each
 *  clone machine's template on the machine, the moving blocks and hazards from the figures, the cow, the Minotaur
 *  (stone while the mirror holds him) and Theseus. */
export function placed(s: State, fig: Figures): Placed[] {
  const out: Placed[] = [];
  const nc = s.level.cols;
  s.objects.forEach((o, i) => {
    if (!o) return;
    const r = Math.floor(i / nc), c = i % nc;
    if (o === 'block' && fig.blocks?.some(b => b.origin.r === r && b.origin.c === c)) return;
    out.push({ model: OBJECTS[o].sprite as PieceModel, r, c, id: `o${i}` });
  });
  for (const m of s.level.machines) {
    const model = (m.template === 'block' ? OBJECTS.block.sprite : HAZARDS[m.template].sprite) as PieceModel;
    out.push({ model, r: m.at.r, c: m.at.c, id: `machine${m.at.r * nc + m.at.c}`, dir: m.dir });
  }
  for (const b of fig.blocks ?? []) out.push({ model: 'block', r: b.at.r, c: b.at.c, id: null });
  for (const h of fig.hazards) {
    const standing = s.hazards.find(x => x.kind === h.kind && x.at.r === h.at.r && x.at.c === h.at.c);
    out.push({ model: HAZARDS[h.kind].sprite as PieceModel, r: h.at.r, c: h.at.c, id: null, dir: standing?.dir });
  }
  if (s.cow) out.push({ model: 'cow-standing', r: s.cow.r, c: s.cow.c, id: 'cow' });
  if (fig.minotaur) out.push({ model: s.stone > 0 ? 'minotaur-stone' : 'minotaur', r: fig.minotaur.r, c: fig.minotaur.c, id: 'minotaur' });
  out.push({ model: 'theseus', r: fig.player.r, c: fig.player.c, id: 'theseus' });
  return out;
}
