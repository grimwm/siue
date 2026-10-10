/* Operation Tankity: the room wire protocol.
 *
 * The shapes rooms.php sends and accepts, written from its `room_snapshot`,
 * from every `$events[] = ['t' => ...]` / `room_emit` site and from the action
 * handlers in its router. Types only: nothing here exists at run time, so
 * this file compiles to nothing and has no js/ output. Keeping the client's
 * idea of the protocol honest is src/protocol-fixtures.check.ts, which
 * assigns the server's real replies (protocol/*.json) to these types. */

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

/** action=maps: the hills picker's catalog. `profile` is round one's terrain
 * sampled to 0..1 (0 the lowest ground the generator allows). */
export interface MapsReply { ok: true; maps: MapInfo[] }
export interface MapInfo { id: string; name: string; profile: number[] }

/** action=ping: health plus occupancy for the lobby shelf. */
export interface PingReply { ok: true; game: string; rooms: { used: number; max: number; store: string } }

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
  lives: number;
  score: number;
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
}

export interface RoomSnapshot {
  code: string;
  phase: RoomPhase;
  /** The picked hills' id; null for random hills. */
  map: string | null;
  mapName: string;
  round: number;
  wind: number;
  /** The seat whose turn it is; null outside play. */
  turn: number | null;
  /** Seconds before the crew fires for the human on turn; null otherwise. */
  turnLeft: number | null;
  /** Seconds before the shop closes; null outside the shop. */
  shopLeft: number | null;
  terrain: number[];
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
export interface RoundWinEvent extends EventBase { t: 'roundwin'; round: number }
export interface MatchOverEvent extends EventBase { t: 'matchover' }
export interface EliminatedEvent extends EventBase { t: 'eliminated'; seat: number }
export interface OneUpEvent extends EventBase { t: 'oneup'; seat: number; lives: number }
/** Someone took a seat in the lobby. */
/** Arrivals and departures carry the player's name: by the next poll a
 * departed seat already shows the drone that took it over. */
export interface JoinEvent extends EventBase { t: 'join'; seat: number; name: string }
export interface LeftEvent extends EventBase { t: 'left'; seat: number; name: string }

/** What opens a volley: a human fires, the drone fires, or the crew fires for
 * a human who ran the turn clock out. `x`, `a` and `pw` are where the barrel
 * stood at the shot, for the replay to ease to. */
interface VolleyOpener<T extends string> extends EventBase {
  t: T; seat: number; w: string; x: number; a: number; pw: number;
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

/** The events a snapshot carries, discriminated by `t`. */
export type RoomEvent =
  | RoundEvent | RoundWinEvent | MatchOverEvent | EliminatedEvent | OneUpEvent | JoinEvent | LeftEvent
  | FireEvent | AiFireEvent | AutoEvent
  | ShotEvent | BurstEvent | HitEvent | KillEvent | ShieldEvent | LastStandEvent | FizzleEvent;

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
 * `csrf` that the client adds to every one. `since` (optional on every
 * action that answers with a room) trims the reply's events. */
export interface PostBodies {
  create: { initials: string; map: string; body: string };
  join: { code: string; initials: string; body: string };
  start: Record<string, never>;
  act: ActBody;
  buy: { item: string; qty: number };
  ready: { ready: boolean };
  body: { body: string };
  map: { map: string };
  seatmode: { seat: number; mode: 'ai' | 'open'; since?: number };
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
  body: RoomReply;
  map: RoomReply;
  seatmode: RoomReply;
  leave: OkReply;
}

export type PostAction = keyof PostBodies;
