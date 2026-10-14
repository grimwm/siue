/* Operation Tankity: the room wire protocol.
 *
 * The shapes rooms.php sends and accepts, written from its `room_snapshot`,
 * from every `$events[] = ['t' => ...]` / `room_emit` site and from the action
 * handlers in its router. Types only: nothing here exists at run time, so
 * this file bundles to nothing. Keeping the client's
 * idea of the protocol honest is src/protocol-fixtures.check.ts, which
 * assigns the server's real replies (protocol/*.json) to these types. */

import type { Difficulty } from './sim.ts';

/* ---------- replies ---------- */

/** Every failure: a status other than 200 and a short human-readable line.
 * Note there is no `ok` key; the client tests `!data.ok`. */
export interface ErrorReply { ok?: undefined; error: string }

/** What create and join answer: the seat and the two secrets for it. */
export interface SeatReply { ok: true; code: string; seat: number; token: string; csrf: string }

/** Everything that changes a room answers with the room as the asker sees it. */
export interface RoomReply { ok: true; room: RoomSnapshot }

/** leave answers with just this. */
export interface OkReply { ok: true }

/** One of a browser's seats, as action=mine reports it. `gone` covers no such
 * room, an expired room and a token that holds no seat there: the browser
 * forgets all three. */
export type MineRow =
  | { code: string; gone: true }
  | {
    code: string; gone: false; seat: number; phase: 'lobby' | 'play' | 'shop' | 'over';
    round: number; turnSecs: number;
    /** The seat whose turn it is (play only). */
    turn: number | null;
    yourTurn: boolean;
    /** Identifies this turn ("round:turn:shots"); null unless yourTurn. One toast per key. */
    turnKey: string | null;
    turnLeft: number | null; shopLeft: number | null;
    /** Every human's initials, this seat's included, in seat order. */
    players: string[];
    hostSeat: number;
  };

/** action=mine answers one row per seat asked, in the order asked. */
export interface MineReply { ok: true; rooms: MineRow[] }

/** action=maps: the hills picker's catalog. `profile` is round one's terrain
 * sampled to 0..1 (0 the lowest ground the generator allows). */
export interface MapsReply { ok: true; maps: MapInfo[] }
export interface MapInfo { id: string; name: string; profile: number[] }

/** action=ping: health plus occupancy for the lobby shelf. */
export interface PingReply { ok: true; game: string; rooms: { used: number; max: number } }

/* ---------- the room snapshot ---------- */

export type RoomPhase = 'lobby' | 'play' | 'shop' | 'over';

/** A seat's state: `human` seats are players, `ai` is the drone battery,
 * `open` fields no unit. `ready` is the shop's Ready flag (false elsewhere). */
export type SeatMode = 'human' | 'ai' | 'open';
export interface RoomSeat {
  seat: number;
  human: boolean;
  /** Initials for a human, the drone's name otherwise. */
  name: string;
  mode: SeatMode;
  /** A player left mid-match and a bot drives their unit now. */
  bot: boolean;
  lives: number;
  score: number;
  /** This match: rounds won, units wrecked, and the score gained in the last finished round. */
  roundsWon: number;
  kills: number;
  gain: number;
  /** The round the last life went; null while alive, and for a player who left. */
  out: number | null;
  ready: boolean;
}

export interface RoomTank {
  seat: number;
  kind: 'human' | 'ai';
  name: string;
  x: number;
  y: number;
  angle: number;
  power: number;
  hp: number;
  maxHp: number;
  /** Facing: 1 right, -1 left. */
  dirS: number;
  /** The look a human chose (tank, hover, walker, buggy); null for a drone. */
  body: string | null;
  /** In a menu right now. */
  menu: boolean;
}

/** The asker's private block: present only for a seated human. `ammo` maps
 * a weapon key to rounds, -1 for the endless Shell. */
export interface RoomYou {
  seat: number;
  ammo: Record<string, number>;
  cash: number;
  score: number;
  lives: number;
  fuel: number;
  weapon: string;
  nextUp: number;
  shield: boolean;
  jammer: number;
  bunker: number;
  laststand: boolean;
  plate: number;
  /** The armor the next round musters with (what the last one ended with). */
  armor: number;
  maxArmor: number;
  /** This seat's match score was filed on the online board (false: not yet, the filing failed, or it is kept locally); filedRank
   * is its place when filed (null: outside the board). */
  filed: boolean;
  filedRank: number | null;
  /** The server tried to file this seat's score and could not. */
  filedFailed: boolean;
  /** The match had fewer than two humans: nothing went online, and this browser keeps the score on its own board. */
  filedLocal: boolean;
}

export interface RoomSnapshot {
  code: string;
  phase: RoomPhase;
  /** The picked hills' id; null for random hills. */
  map: string | null;
  mapName: string;
  /** How well the drones aim: the host's setting at create. */
  difficulty: Difficulty;
  /** The seat that starts the match: seat 0 until it leaves, then the lowest-numbered human. */
  hostSeat: number;
  round: number;
  /** Humans seated when the match started; two or more makes it last-human-standing. */
  startHumans: number;
  /** This match's id, new at every start (null before the first): with the code, it names one match. */
  matchId: string | null;
  /** The seat that won the match; null until then, and when nobody did. */
  winner: number | null;
  /** The winner's match bonus (0 until there is a winner); the matchwin event carries it too. */
  winBonus: number;
  wind: number;
  /** The seat whose turn it is; null outside play. */
  turn: number | null;
  /** The room's turn time in seconds, one of the host's stops. */
  turnSecs: number;
  /** Seconds before a drone fires for the human on turn; null otherwise. */
  turnLeft: number | null;
  /** Seconds before the shop closes; null outside the shop. */
  shopLeft: number | null;
  /** The hills as heights, or absent in a delta snapshot: the asker sent
   * `have=<terrainRev>` and holds the current revision already. Sent whenever
   * the asker holds nothing, another revision, or asked for `full`. */
  terrain?: number[];
  /** The hills' revision; it rises whenever the ground changes (a crater, a
   * new round). Always present, so a client can tell whether what it holds is
   * current. */
  terrainRev: number;
  /** The round's nine hill numbers (sim.ts hillsWire), for the scenery past the field. */
  hills?: number[] | null;
  /** Present (true) when the asker's `since` is older than the oldest event
   * the room still keeps, or newer than the room's own count: events were
   * lost, so a replay cannot be built. The snapshot is then full. */
  resync?: true;
  tanks: RoomTank[];
  seats: RoomSeat[];
  /** Events newer than the `since` the asker sent, oldest first. */
  events: RoomEvent[];
  you?: RoomYou;
  csrf?: string;
}

/* ---------- events ---------- */

/** Fields of every event a room records. `at` is seconds after its volley
 * fired, on the events a volley makes; `seq` is the room's running number. */
interface EventBase { seq: number; at?: number }

export interface RoundEvent extends EventBase { t: 'round'; round: number; wind: number }
/** A human is the last unit standing: `seat` is theirs, and only they are paid. */
export interface RoundWinEvent extends EventBase { t: 'roundwin'; round: number; seat: number }
/** The last unit standing is a drone, or nobody is: no winnings. Either way every
 * wrecked human lost a life, and the shop opens before the next round. */
export interface RoundLostEvent extends EventBase { t: 'roundlost'; round: number }
export interface MatchOverEvent extends EventBase { t: 'matchover' }
/** The last human standing in a room that started with two or more: `bonus` is twice the round bonus. */
export interface MatchWinEvent extends EventBase { t: 'matchwin'; seat: number; bonus: number }
export interface EliminatedEvent extends EventBase { t: 'eliminated'; seat: number }
export interface OneUpEvent extends EventBase { t: 'oneup'; seat: number; lives: number }
/** Someone took a seat in the lobby. */
/** Arrivals and departures carry the player's name: by the next poll a
 * departed seat already shows the drone that took it over. */
export interface JoinEvent extends EventBase { t: 'join'; seat: number; name: string }
export interface LeftEvent extends EventBase { t: 'left'; seat: number; name: string }
/** Someone pressed Play again: the room is back in its lobby. */
export interface AgainEvent extends EventBase { t: 'again'; seat: number }
/** The host changed the turn time (seconds); it applies from the next turn. */
export interface TurnTimeEvent extends EventBase { t: 'turntime'; seat: number; secs: number }

/** What opens a volley: a human fires, the drone fires, or a drone fires for
 * a human who ran the turn clock out. `x`, `a` and `pw` are where the barrel
 * stood at the shot, for the replay to ease to. */
interface VolleyOpener<T extends string> extends EventBase {
  t: T; seat: number; w: string; x: number; a: number; pw: number;
  /** Fired with no human left standing: the drones fight on while the players
   * watch, and the replay plays the volley at triple speed. */
  watch?: boolean;
}
export type FireEvent = VolleyOpener<'fire'>;
export type AiFireEvent = VolleyOpener<'aifire'>;
export type AutoEvent = VolleyOpener<'auto'>;

/** One shell's flight: launch and landing time within the volley, blast
 * radius (0 for a fizzle), and the path as "x,y x,y ..." points 1/12 s apart.
 * `split` marks the bloom of a cluster shell. */
export interface ShotEvent extends EventBase {
  t: 'shot'; by: number; w: string;
  x0: number; y0: number; x1: number; y1: number;
  t0: number; t1: number; r: number; p: string; split?: boolean;
}
/** A blast mid-flight (a lance passing through a unit). */
export interface BurstEvent extends EventBase { t: 'burst'; x: number; y: number; r: number; w: string }
export interface HitEvent extends EventBase { t: 'hit'; seat: number; dmg: number; by: number; direct: boolean }
export interface KillEvent extends EventBase { t: 'kill'; seat: number; by: number }
export interface ShieldEvent extends EventBase { t: 'shield'; seat: number; by: number }
export interface LastStandEvent extends EventBase { t: 'laststand'; seat: number }
export interface FizzleEvent extends EventBase { t: 'fizzle'; by: number; w: string }
/** A drone that could not hurt anyone for a while switched strategy (hunter, bully, sniper, avenger, glory or lobber). */
export interface TacticEvent extends EventBase { t: 'tactic'; seat: number; s: string }

/** The events a snapshot carries, discriminated by `t`. */
export type RoomEvent =
  | RoundEvent | RoundWinEvent | RoundLostEvent | MatchOverEvent | MatchWinEvent | EliminatedEvent | OneUpEvent | JoinEvent | LeftEvent | AgainEvent | TurnTimeEvent
  | FireEvent | AiFireEvent | AutoEvent
  | ShotEvent | BurstEvent | HitEvent | KillEvent | ShieldEvent | LastStandEvent | FizzleEvent | TacticEvent;

export type RoomEventType = RoomEvent['t'];
/** The events that open a volley. */
export type VolleyOpenerEvent = FireEvent | AiFireEvent | AutoEvent;

/* ---------- requests ---------- */

/** What an act sends. `fire` carries its own aim so a fast trigger pull never
 * fires stale barrels. */
export type ActBody =
  | { kind: 'aim'; angle: number; power: number }
  | { kind: 'drive'; dx: number }
  | { kind: 'weapon'; weapon: string }
  | { kind: 'fire'; angle?: number; power?: number }
  | { kind: 'menu'; open: boolean };

/** The ground unit a human drives; looks only. */
export type BodyKind = 'tank' | 'hover' | 'walker' | 'buggy';

/** The JSON body each POST action takes, beyond the `code`, `token` and
 * `csrf` that the client adds to every one. On every action that answers with
 * a room the client also adds `since` (trims the reply's events), `have` (the
 * terrainRev it holds, which lets the reply leave the hills out) and, to ask
 * for the whole world, `full: true`; action=state takes the same three as
 * query parameters. */
export interface PostBodies {
  create: { initials: string; map: string; body: string; difficulty: Difficulty; turn?: number };
  join: { code: string; initials: string; body: string };
  start: Record<string, never>;
  act: ActBody;
  buy: { item: string; qty: number };
  ready: { ready: boolean };
  again: Record<string, never>;
  body: { body: string };
  map: { map: string };
  seatmode: { seat: number; mode: 'ai' | 'open'; since?: number };
  /** Host only, any phase; `secs` is one of the host's stops. */
  turntime: { secs: number };
  /** The seats this browser holds (at most 12), asked about together; the
   * reply is not a room, so no delta fields ride along. */
  mine: { seats: { code: string; token: string }[] };
  leave: Record<string, never>;
}

/** What each POST action answers on success. */
export interface PostReplies {
  create: SeatReply;
  join: SeatReply;
  start: RoomReply;
  act: RoomReply;
  buy: RoomReply;
  ready: RoomReply;
  again: RoomReply;
  body: RoomReply;
  map: RoomReply;
  seatmode: RoomReply;
  turntime: RoomReply;
  mine: MineReply;
  leave: OkReply;
}

export type PostAction = keyof PostBodies;
