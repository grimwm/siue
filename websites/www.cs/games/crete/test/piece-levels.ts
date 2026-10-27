// websites/www.cs/games/crete/test/piece-levels.ts
// Small levels built around the trap and trick pieces, one per piece plus the interactions the spec names, for the
// packing, pruning and same-answers tests. Each is at most 8 × 8, so the breadth-first reference finishes quickly.
// Not a test file.
import { parse } from '../src/puzzle/level.ts';
import type { Level } from '../src/puzzle/level.ts';

const level = (title: string, rows: readonly string[], header = ''): Level =>
  parse(`title: ${title}\nintro: t\n${header ? `${header}\n` : ''}\n${rows.join('\n')}\n`);

export const PIECE_LEVELS: Record<string, Level> = {
  trap: level('Snare', [
    '#######',
    '#P.O.-#',
    '#.&...#',
    '#..*..#',
    '#...M.#',
    '###E###',
  ]),
  popup: level('Pop-up', [
    '######',
    '#P;*.#',
    '#.#;.#',
    '#..;E#',
    '######',
  ]),
  gravel: level('Gravel', [
    '#######',
    '#P.O:M#',
    '#...:.#',
    '#...::#',
    '#E...*#',
    '#######',
  ]),
  'fake-wall': level('Fake wall', [
    '#####',
    '#PW*#',
    '#.#.#',
    '#M.E#',
    '#####',
  ]),
  'invisible-wall': level('Invisible wall', [
    '#######',
    '#P.I.*#',
    '#.I...#',
    '#...I.#',
    '#....E#',
    '#######',
  ]),
  teleport: level('Teleport', [
    '#######',
    '#P.O@.#',
    '#.....#',
    '#.@..*#',
    '#....M#',
    '###E###',
  ]),
  thief: level('Thief', [
    '######',
    '#Pf$.#',
    '#.~~~#',
    '#..*E#',
    '######',
  ]),
  bomb: level('Bomb', [
    '######',
    '#PO!*#',
    '#..!.#',
    '#.!..#',
    '#E...#',
    '######',
  ]),
  'clone-block': level('Clone block', [
    '######',
    '#P.+.#',
    '#....#',
    '#C.~*#',
    '#..E.#',
    '######',
  ], 'machines: block-right'),
  ball: level('Bronze ball', [
    '######',
    '#P...#',
    '#.o..#',
    '#....#',
    '#.*.E#',
    '######',
  ], 'facing: right'),
  glider: level('Harpy', [
    '######',
    '#P...#',
    '#.w~.#',
    '#..*E#',
    '######',
  ], 'facing: down'),
  fireball: level('Talos', [
    '######',
    '#P.F.#',
    '#.e..#',
    '#.h*E#',
    '######',
  ], 'facing: right'),
  'clone-ball': level('Clone ball', [
    '#######',
    '#P.+..#',
    '#.....#',
    '#C....#',
    '#...*E#',
    '#######',
  ], 'machines: ball-right'),
  /** Theseus and a ball press red buttons in one turn: two clones, in that order. */
  'two-clones': level('Two clones', [
    '#######',
    '#P+.C.#',
    '#.o+..#',
    '#C....#',
    '#....E#',
    '#######',
  ], 'facing: right\nmachines: ball-down ball-up'),
  /** A ball can stand on the start, so a catch throws Theseus onto it and sends it home. */
  'throw-back': level('Throw-back', [
    '######',
    '#....#',
    '#P.o.#',
    '#....#',
    '#*..E#',
    '######',
  ], 'facing: left'),
  /** A ball presses the brown button and walks into the snare it releases. */
  'hazard-snare': level('Hazard snare', [
    '#######',
    '#P....#',
    '#.o-&.#',
    '#.....#',
    '#*...E#',
    '#######',
  ], 'facing: right'),
  /** A ball presses the toggle button. */
  'hazard-toggle': level('Hazard toggle', [
    '######',
    '#P.o_#',
    '#.tT.#',
    '#*..E#',
    '######',
  ], 'facing: right'),
  /** A ball runs into a bomb: both are gone. */
  'hazard-bomb': level('Hazard bomb', [
    '######',
    '#P...#',
    '#.o.!#',
    '#....#',
    '#*..E#',
    '######',
  ], 'facing: right'),
  /** A cloned ball runs into a bomb, so the hazards pack per cell. */
  'hazard-bomb-clone': level('Hazard bomb clone', [
    '#######',
    '#P.+..#',
    '#.....#',
    '#C..!.#',
    '#...*E#',
    '#######',
  ], 'machines: ball-right'),
  /** A ball walks over the door Theseus opens. The machine, with no button, only makes the hazards pack per cell. */
  'hazard-door': level('Hazard door', [
    '#######',
    '#PrR..#',
    '#C#.#.#',
    '###o#.#',
    '#E*...#',
    '#######',
  ], 'facing: up\nmachines: ball-right'),
};
