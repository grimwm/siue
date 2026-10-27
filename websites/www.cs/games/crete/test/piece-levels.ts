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
  /** The Minotaur walks into a snare with no button and stays there; one heart, so only the snare lets Theseus by. */
  'minotaur-trap': level('Minotaur trap', [
    '########',
    '#P.....#',
    '#.####.#',
    '#..&.M.#',
    '#E######',
    '########',
  ], 'hearts: 1'),
  /** The block goes through the teleport into the water beyond, the only bridge to the exit. */
  'block-teleport': level('Block teleport', [
    '#######',
    '#PO@###',
    '###@~E#',
    '#######',
  ]),
  /** The thief takes the first flippers and leaves the key that opens the way to the second. */
  'thief-keys': level('Thief and keys', [
    '########',
    '#Pf~r$R#',
    '######f#',
    '###E~~.#',
    '########',
  ]),
  /** The machine's block slides off the ice into the water; the next stops on the dirt it made, and a third has
   *  no room while that one stands in front of the machine. */
  'clone-blocked': level('Clone blocked', [
    '#######',
    '#P.+..#',
    '#..####',
    '#C=~~E#',
    '#######',
  ], 'machines: block-right'),
  /** Two balls on one track: the one behind moves first, finds the other in its way and stays. */
  'hazard-order': level('Hazard order', [
    '########',
    '#P.....#',
    '###.####',
    '#oo....#',
    '###.####',
    '###E####',
    '########',
  ], 'facing: right right'),
  /** The ball comes up its shaft as the Minotaur comes up his: the ball's catch ends the turn before his steps,
   *  which would have caught Theseus too. Every win is caught at least once. */
  'hazard-first': level('Hazard first', [
    '#######',
    '#P...E#',
    '#.#.#.#',
    '#.#o#.#',
    '#.#####',
    '#M#####',
    '#######',
  ], 'facing: up'),
  /** A block pushed onto the red button clones nothing onto the cell Theseus steps into; his own step on the
   *  button clones the second block that two cells of water need. */
  'clone-keep': level('Clone keep', [
    '######',
    '#....#',
    '#PO+.#',
    '##C..#',
    '###~##',
    '###~##',
    '###E##',
    '######',
  ], 'machines: block-up'),
};
