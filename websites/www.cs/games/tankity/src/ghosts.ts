/* Operation Tankity: the draw-only flight past the field's edge.
 *
 * The sim (and the room server) retire a shell 20 units past the field; with
 * scenery on screen that is plain view, so the renderer keeps drawing the
 * shell on its ballistic way until it is off the picture. A ghost has no
 * collision, no blast and no effect on the game: it is never read back. */

import { stepBallistic } from './sim.ts';
import type { Air } from './sim.ts';

export interface Flier { x: number; y: number; vx: number; vy: number; wkey: string }

/** A shell this far from where the last frame saw it is another shell. */
const SAME_SHELL = 60;
/** A ghost is dropped past this many field widths either side, below this depth, or this old. */
const REACH_W = 2, FLOOR_Y = 700, MAX_AGE = 12;

interface Ghost extends Flier { age: number }

export interface Ghosts {
  /** One frame: what the sim and the replay show now. Returns the ghosts to draw. */
  /** `air`: the air each gun flies through (sim.ts airOf), so a ghost flies on as the war would have flown it. */
  frame(shells: readonly Flier[], fieldW: number, dt: number, air: (wkey: string) => Air): readonly Flier[];
  clear(): void;
}

export function createGhosts(): Ghosts {
  let seen: Flier[] = [];
  let ghosts: Ghost[] = [];
  const near = (a: Flier, b: Flier): boolean => a.wkey === b.wkey && Math.hypot(a.x - b.x, a.y - b.y) < SAME_SHELL;
  return {
    frame(shells, fieldW, dt, air) {
      for (const g of ghosts) {
        if (dt > 0) stepBallistic(g, dt, air(g.wkey));
        g.age += dt;
      }
      ghosts = ghosts.filter(g => g.age < MAX_AGE && g.y < FLOOR_Y && g.x > -REACH_W * fieldW && g.x < (1 + REACH_W) * fieldW);
      // A shell seen outside the field last frame and gone now left play there: it flies on.
      for (const p of seen) {
        if ((p.x >= 0 && p.x <= fieldW) || shells.some(s => near(s, p))) continue;
        ghosts.push({ ...p, age: 0 });
      }
      // The replay's last point has no velocity: keep the last one that had.
      seen = shells.map(s => {
        const before = seen.find(p => near(s, p));
        const still = s.vx === 0 && s.vy === 0 && before;
        return { ...s, vx: still ? before.vx : s.vx, vy: still ? before.vy : s.vy };
      });
      return ghosts;
    },
    clear() { seen = []; ghosts = []; },
  };
}
