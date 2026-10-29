/* The Island of Crete, modern look: the terrain models by name, and which one each cell shows. A cell shows the
 * model named like the sprite Classic draws there (src/board-plan.ts drawList): a clone machine by its facing,
 * the gate open once the last relic is taken, a fake wall as wall and an invisible wall as floor. Each model
 * stands on a ground surface; walls are built from their outer faces, not per cell. DOM-free. */
import { DIRS, TERRAIN } from '../puzzle/tiles.ts';
import type { State } from '../puzzle/state.ts';

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
