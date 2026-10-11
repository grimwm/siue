/* Operation Tankity: the shapes game.js shares with its typed modules.
 *
 * Types only, so this file compiles to nothing and has no js/ output. game.js
 * is plain JavaScript and keeps the game's state in one object (G) and the
 * arsenal in a few tables; each typed module declares the slice it reads and
 * writes by picking from these, so none of them takes the whole game. */
import type { Arsenal } from './sim.js';

/** The arsenal tables as game.js holds them now. They are replaced when
 * game.json arrives, so a module reads them through this view each time
 * instead of keeping a copy. */
export interface Tables {
  /** The sim's own view of the arsenal; null until a build succeeds. */
  readonly arsenal: Arsenal | null;
  readonly weapons: Arsenal['weapons'];
  readonly order: Arsenal['order'];
  readonly shop: Arsenal['shop'];
  readonly gear: Arsenal['gear'];
  /** Counts arsenal rebuilds; icons repaint when it changes. */
  readonly rev: number;
}
