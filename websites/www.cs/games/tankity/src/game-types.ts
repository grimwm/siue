/* Operation Tankity: the shapes game.js shares with its typed modules.
 *
 * Types only, so this file compiles to nothing and has no js/ output. game.js
 * is plain JavaScript and keeps the game's state in one object (G) and the
 * arsenal in a few tables; each typed module declares the slice it reads and
 * writes by picking from these, so none of them takes the whole game. */
import type { DialogueLine } from './chatter.js';
import type { FxSys } from './effects.js';
import type { Phase } from './flow.js';
import type { PreviewState } from './preview.js';
import type { RoomSnapshot } from './protocol.js';
import type { Boom, DrawTank, Spark } from './render.js';
import type { AimChoice } from './ai.js';
import type { Arsenal, Cloud, World } from './sim.js';

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

/** A drone swinging its barrel to the plan it chose, in plain sight, before it fires. */
export interface AimSwing {
  plan: AimChoice;
  a0: number; // angle and power it started from
  p0: number;
  k: number; // seconds into the swing
  dur: number;
}

/** A unit on the field as game.js keeps it: the sim's tank plus what the page adds. */
export interface GameTank extends DrawTank {
  seat?: number; // a room seat (rooms only)
  showP?: number; // the eased power a rival's arm glides to
  lastX?: number; // x at the last frame, to tell when a unit moved
  aim?: AimSwing | null;
}

/** A spark with its drift, as the battlefield keeps them. */
export interface Particle extends Spark { vx: number; vy: number }

/** The game's state (game.js's G): solo and room matches, the shop, the
 * dialogue queue, the banner, the camera. It is the sim's World plus the
 * page's own bookkeeping. */
export interface GameState extends World {
  seed: string;
  body: string; // the unit look the player chose
  clouds: Cloud[];
  tanks: GameTank[];
  turn: number;
  phase: Phase;
  thinkT: number;
  settleT: number;
  parts: Particle[];
  booms: Boom[];
  fx: FxSys | null;
  firstTurn: number;
  lives: number;
  nextOneUp: number;
  roundsWon: number;
  shopSel: number;
  shopQty: number;
  fuelBank: number;
  repairBank: number;
  plate: number;
  time: number;
  shake: number;
  dlgQ: DialogueLine[];
  dlgT: number;
  lastTalk: number;
  banterT: number;
  bannerT: number;
  bannerDone: (() => void) | null;
  cam: { z: number; cx: number; cy: number };
  over: boolean;
  won: boolean;
  tactics: Record<string, string>; // each drone's strategy, kept from round to round
  demo: boolean;
  demoHint: boolean;
  watchTurns: number; // drone-only turns since the player fell
  preview: (PreviewState<HTMLElement | null> & { fx: FxSys | null }) | null;
  windTop: number | undefined; // the wind gauge's top in world units, under the menu strip
}

/** What the page keeps of a room match: whose turn it reads as, the aim and
 * drive it has not sent, the room snapshot waiting for the replay to drain,
 * and the last snapshot it drew. */
export interface MatchState {
  myTurn: boolean;
  aimDirty: boolean;
  driveAcc: number;
  driveT: number;
  pendingRoom: RoomSnapshot | null;
  lastPhase: string;
  lastTurn: number | null;
  lastRound: number;
  initials: string;
}
