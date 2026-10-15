/* Operation Tankity: the shapes main.ts shares with its typed modules.
 *
 * Types only, so this file bundles to nothing. main.ts keeps the game's state
 * in one object (G) and the arsenal in a few tables; each typed module
 * declares the slice it reads and writes by picking from these, so none of
 * them takes the whole game. */
import type { DialogueLine } from './chatter.ts';
import type { FxSys } from './fx/types.ts';
import type { Phase } from './flow.ts';
import type { Marks } from './marks.ts';
import type { EarthShow } from './earth-show.ts';
import type { FireShow } from './fire-show.ts';
import type { PreviewState } from './preview.ts';
import type { RoomSnapshot } from './protocol.ts';
import type { Boom, DrawTank, Spark } from './render.ts';
import type { AimChoice } from './ai.ts';
import type { SoloRound } from './standings.ts';
import type { Arsenal, Cloud, Difficulty, Hills, World } from './sim.ts';
import type { WallHit, WallsSetting } from './walls.ts';

/** The arsenal tables as main.ts holds them now. They are replaced when
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

/** A unit on the field as main.ts keeps it: the sim's tank plus what the page adds. */
export interface GameTank extends DrawTank {
  seat?: number; // a room seat (rooms only)
  showP?: number; // the eased power a rival's arm glides to
  lastX?: number; // x at the last frame, to tell when a unit moved
  aim?: AimSwing | null;
}

/** A spark with its drift, as the battlefield keeps them. */
export interface Particle extends Spark { vx: number; vy: number }

/** The game's state (main.ts's G): solo and room matches, the shop, the
 * dialogue queue, the banner, the camera. It is the sim's World plus the
 * page's own bookkeeping. */
export interface GameState extends World {
  seed: string;
  /** How well the drones aim this match; set at each solo deal; a room match leaves it alone. */
  difficulty: Difficulty;
  /** A match the room's host started alone plays the room's Walls (null: the Menu's, read each round). */
  wallsFixed: WallsSetting | null;
  body: string; // the unit look the player chose
  clouds: Cloud[];
  /** This match's field width: dealt at the start of a solo match (field.ts), ROOM_W in a room; fixed for the match. */
  w: number;
  /** The round's hills, for the scenery past the field's edges; null until a room sends them. */
  hills: Hills | null;
  tanks: GameTank[];
  turn: number;
  phase: Phase;
  thinkT: number;
  settleT: number;
  parts: Particle[];
  booms: Boom[];
  fx: FxSys | null;
  /** Tracer marks this round (src/marks.ts). */
  marks: Marks;
  /** Where shells met the walls lately, flashing (src/walls.ts). */
  wallHits: WallHit[];
  /** The ground's picture while earth settles (src/earth-show.ts). */
  earth: EarthShow;
  /** Napalm pools burning on screen (src/fire-show.ts). */
  fire: FireShow;
  firstTurn: number;
  lives: number;
  nextOneUp: number;
  rounds: SoloRound[]; // this solo match's finished rounds, for its scoreboard
  roundStart: { score: number; cash: number }; // score and cash when this round began
  roundsWon: number;
  shopSel: number;
  shopQty: number;
  fuelBank: number;
  armor: number; // the armor the next round musters with (src/armor.ts)
  plate: number;
  chutes: number; // the player's parachutes
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
  roundTo: string; // who took the last round: a seat's name, "the battery", or '' when not heard (a reload in the shop)
  out: boolean; // this seat lost its last life this match
  outShown: boolean; // the you're-out card has been shown
  lastRoom: RoomSnapshot | null; // the last snapshot adopted, for the scoreboards
}
