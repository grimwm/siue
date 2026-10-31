/* The Island of Crete: which Modern model draws each Dictionary entry's icon. The icons are rendered once, ahead of
 * time, by the icons test page (src/icons-page.ts, tools/modern-icons.mjs) into fx/sprites/modern-icons.{webp,json};
 * the page shows them in the Modern look. A piece or a figure stands on a flagstone; a tile is its own model on its
 * own ground. DOM-free. */
import type { FigureModel, PieceModel, TerrainModel } from './modern/model-names.ts';

export type IconModel =
  | { kind: 'piece'; model: PieceModel | FigureModel }
  | { kind: 'tile'; model: TerrainModel }
  | { kind: 'wall' };

const piece = (model: PieceModel | FigureModel): IconModel => ({ kind: 'piece', model });
const tile = (model: TerrainModel): IconModel => ({ kind: 'tile', model });

export const ICON_MODELS: Readonly<Record<string, IconModel>> = {
  relic: piece('relic'), 'key-red': piece('key-red'), 'key-blue': piece('key-blue'), 'key-yellow': piece('key-yellow'),
  'key-green': piece('key-green'), flippers: piece('flippers'), 'fire-boots': piece('fire-boots'), skates: piece('skates'),
  suction: piece('suction'), mirror: piece('mirror'), cake: piece('cake'), cow: piece('cow'), page: piece('page'),
  minotaur: piece('minotaur'), ball: piece('ball'), glider: piece('glider'), fireball: piece('fireball'), block: piece('block'),
  exit: tile('exit'), gate: tile('gate-closed'), water: tile('water'), fire: tile('fire'), ice: tile('ice'),
  force: tile('force-right'), dirt: tile('dirt'), safe: tile('safe'), door: tile('door-red'), button: tile('button'),
  toggle: tile('toggle-closed'), trap: tile('trap'), 'button-brown': tile('button-brown'), 'button-red': tile('button-red'),
  clone: tile('clone-down'), popup: tile('popup'), gravel: tile('gravel'), teleport: tile('teleport'), thief: tile('thief'),
  bomb: tile('bomb'), 'fake-wall': { kind: 'wall' }, 'invisible-wall': { kind: 'wall' },
};

/** The rendered icons: each is `cell` square at (x, y) in the sheet. */
export interface IconSheet { cell: number; width: number; height: number; icons: Record<string, { x: number; y: number }> }
