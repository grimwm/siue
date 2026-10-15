/* Operation Tankity: the room client.
 *
 * Everything between the page and rooms.php that is not drawing: the
 * transport (one fetcher for every call, the 429 retry), the session (code,
 * seat, token, the event cursor), polling, the act/buy/ready/leave senders,
 * the list of a browser's rooms (`mine`), the turn and shop clocks, and the decisions about a replay queue that has
 * piled up (a hidden tab). What it learns reaches the page through the
 * RoomHandlers it is built with (a snapshot with the events it has not seen,
 * a reachability flip, a Ready change, an error to show); it never touches
 * the document.
 *
 * A session is adopted three ways: hosting, joining, or resuming a seat the
 * browser stored (seats.ts). `detach` drops it without telling anyone (the
 * seat waits in the room); only `leave` gives it up.
 *
 * It does not reach for the browser either: fetch, timers, the clock and the
 * leave beacon come in as a RoomEnv, so this module compiles in the DOM-free
 * program, and test/net.test.ts drives it with a fake server and fake timers.
 * main.ts builds the real RoomEnv from the page's globals. The wire types are
 * in protocol.ts. */
import type {
  ActBody, ChallengeReply, ErrorReply, MapInfo, MapsReply, MineRow, PingReply, PostAction, PostBodies, PostReplies, Proto,
  RoomEvent, RoomReply, RoomSeat, RoomSnapshot, SeatReply, VolleyOpenerEvent,
} from './protocol.ts';
import { PowCancelled, solvePow } from './pow.ts';
import type { PowSignal, Subtle } from './pow.ts';
import type { Difficulty } from './sim.ts';
import type { StoredSeat } from './seats.ts';
import { parseSpeed } from './speed.ts';
import type { Speed } from './speed.ts';
import { isWallsSetting, parseWalls } from './walls.ts';
import type { Walls, WallsSetting } from './walls.ts';

/** The room protocol this bundle speaks. Create, join and start send it; a
 * server that has moved past it answers 426 with a line asking for a reload. */
export const PROTO: Proto = 2;

/** What a Start begins: the room's match on the server, or, with the host
 * the only human, a match this browser plays itself, like solo. */
export type Started = { room: RoomSnapshot } | { local: { difficulty: Difficulty; speed: Speed; walls: WallsSetting } };

/* ---------- what the client needs from its host ---------- */

/** The part of a fetch response the client reads. */
export interface FetchResponse { ok: boolean; status: number; json(): Promise<unknown> }
export interface FetchInit {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  keepalive?: boolean;
}

export interface RoomEnv {
  fetch(url: string, init?: FetchInit): Promise<FetchResponse>;
  setTimeout(fn: () => void, ms: number): unknown;
  setInterval(fn: () => void, ms: number): unknown;
  clearInterval(id: unknown): void;
  /** Milliseconds on a monotonic clock (performance.now). */
  now(): number;
  /** navigator.sendBeacon: true when the browser took the request. */
  beacon(url: string, body: string): boolean;
  /** WebCrypto (crypto.subtle), for the room puzzle; null outside a secure context. */
  subtle(): Subtle | null;
}

/** What the page supplies to hear about the room. */
export interface RoomHandlers {
  /** Every call tells whether the server could be reached (the dots). */
  onReachable(up: boolean): void;
  /** A snapshot arrived on the match path (a poll or an act's reply).
   * `fresh` is the events newer than the cursor, already counted as seen;
   * `first` is the first snapshot of a match, whose events are history. */
  onSnapshot(room: RoomSnapshot, fresh: RoomEvent[], first: boolean): void;
  /** The wanted Ready state changed, or its sender finished. */
  onReadyChange(): void;
  /** A background send failed and the player should hear it. */
  onError(err: unknown): void;
  /** The room this client sat in is gone ('closed': the server has no such
   * room; 'space': closed to make space for another match) or holds no seat
   * for it any more ('seat': given up, in another tab say). The polls have stopped and the session is cleared. */
  onGone?(code: string, why: 'closed' | 'seat' | 'space'): void;
}

/* ---------- timing ---------- */

/** Match polling, lobby polling, and the retry for the server's 150 ms act
 * spacing: a quick second click waits a beat and goes again. */
export const MATCH_POLL_MS = 1600;
export const LOBBY_POLL_MS = 2000;
export const RETRY_429_MS = 180;
export const RETRY_429_TRIES = 3;
/** Hosting and joining each spend one of the address's hourly allowance on the
 * server, which a whole campus NAT shares: their 429 is that allowance spent
 * and is never retried, and a busy 503 is retried once. */
const CHARGED_ACTIONS: ReadonlySet<string> = new Set(['create', 'join']);
const CHARGED_RETRIES_503 = 1;

/** The turn clock (the room's turnSecs): its owner is alerted with 30
 * seconds left and everyone sees the last 10 counted down. */
export const CLOCK_WARN_S = 30;
export const CLOCK_SHOW_S = 10;

const STUMBLED = 'The room server stumbled. Solo hills still work.';
const INSECURE = 'Rooms need a secure (https) page. Solo hills still work.';
/** A refused puzzle worth one fresh one: run out of time, signed for another
 * address (a phone that switched networks), or already used (a create the
 * busy retry sent twice). One that was never finished is a bug, not bad luck. */
const PUZZLE_AGAIN: ReadonlySet<string> = new Set(['puzzle-expired', 'puzzle-bad', 'puzzle-wrong', 'puzzle-spent']);

/* ---------- words and links ---------- */

/** Server lines are already human; these few technical ones get translated so
 * a game never quotes transport at the player. */
/** A room's final standings, best score first. A seat's `name` is a human's
    initials or the drone's name; drones are tagged (AI). */
export function standingsRows(
  seats: readonly RoomSeat[], mySeat: number | null,
): { name: string; score: number; mine: boolean }[] {
  return seats
    .map(s => ({ name: s.human ? s.name : s.name + ' (AI)', score: s.score || 0, mine: s.seat === mySeat }))
    .sort((a, b) => b.score - a.score);
}

/** The server says the room is gone: 'space' when it was closed to make space
 * for another match (the 404 told this seat why), 'closed' when it was swept,
 * closed or never there; null for any other error. */
export function isGoneError(err: unknown): 'closed' | 'space' | null {
  if (!/no such room/.test(String((err && (err as { message?: unknown }).message) || err || ''))) return null;
  return (err as { closed?: unknown }).closed === 'space' ? 'space' : 'closed';
}

/** A room code as typed or read back: uppercase, without spaces or hyphens
 * (server/settings.php room_code_clean). */
export function cleanCode(raw: string): string {
  return String(raw || '').replace(/[\s-]+/g, '').toUpperCase();
}

/** A room code the server takes: six letters or digits, or four for a room
 * made before codes grew. */
export function isRoomCode(code: string): boolean {
  return /^[A-Z0-9]{4}$|^[A-Z0-9]{6}$/.test(code);
}

/** What the player hears when a room they sat in is gone. */
export function goneLine(code: string, why: 'closed' | 'space'): string {
  return why === 'space' ? `Room ${code} was closed to make space.` : `Room ${code} has closed.`;
}

/** The error a failed reply throws: the server's line, why a room is gone
 * when it says, and which puzzle check refused when one did. */
function replyError(data: Record<string, unknown>): Error {
  const e: Error & { closed?: 'space'; puzzle?: string } = new Error(String(data.error || STUMBLED));
  if (data.closed === 'space') e.closed = 'space';
  if (typeof data.puzzle === 'string') e.puzzle = data.puzzle;
  return e;
}

export function prettyRoomError(err: unknown): string {
  const m = String((err && (err as { message?: unknown }).message) || err || '');
  if (/too fast/.test(m)) return 'Easy on the trigger. Give it a beat and try again.';
  if (/bad seat token|bad csrf token|bad origin/.test(m)) return 'Room session went stale. Leave the room and come back in.';
  return m || 'The room server did not answer properly. Solo hills still work.';
}

/** The invite link: the page the player is on (the caller picks it, the top
 * page when one on this host frames the game) with the room code attached. */
export function inviteUrl(code: string, page: { origin?: string; pathname?: string }): string {
  if (!code) return '';
  return (page.origin || '') + (page.pathname || '') + '?code=' + encodeURIComponent(code);
}

/* ---------- the replay queue ---------- */

/** The events that open a volley. */
export const VOLLEY_OPENERS: ReadonlySet<string> = new Set(['fire', 'aifire', 'auto']);
export function isVolleyOpener(e: { t: string }): e is VolleyOpenerEvent {
  return VOLLEY_OPENERS.has(e.t);
}

/** A hidden tab plays nothing (browsers stop its frames), so its replay queue
 * piles up: catch up while it is hidden (and when it comes back, from the
 * visibility handler). A visible tab plays every volley in order: one reply
 * routinely carries several (a human's shot and every drone's answer), and
 * each is a move someone made that the players must see. */
export function shouldCatchUp(hidden: boolean): boolean {
  return hidden;
}

/** What a catch-up does to the queue: log and drop the first `cut` events,
 * play what is left at triple speed when `fastNext`. */
export interface CatchUp { cut: number; fastNext: boolean }

/** Skip all but the newest waiting volley (their log lines still post, and
 * the room state that follows carries the craters and armor). If the waiting
 * snapshot says it is already this seat's turn, skip them all and hand over
 * the controls at once. Null when there is nothing to skip. `volleyPlaying`
 * counts the volley on screen as one that waits. */
export function planCatchUp(
  queue: readonly { t: string }[], volleyPlaying: boolean, waiting: RoomSnapshot | null, seat: number,
): CatchUp | null {
  const openers: number[] = [];
  queue.forEach((e, i) => { if (isVolleyOpener(e)) openers.push(i); });
  const myTurnNext = !!(waiting && waiting.phase === 'play' && waiting.turn === seat);
  const keep = myTurnNext ? 0 : 1;
  if (openers.length + (volleyPlaying ? 1 : 0) <= keep) return null;
  const last = openers[openers.length - 1];
  const cut = keep && last !== undefined ? last : queue.length;
  return { cut, fastNext: keep > 0 && queue.length - cut > 0 };
}

/** The POST actions whose reply is a room, which therefore take the delta
 * fields (since, have, full). */
const ROOM_ANSWERS: ReadonlySet<string> = new Set(['start', 'act', 'buy', 'ready', 'again', 'body', 'map', 'seatmode', 'turntime', 'speed', 'walls']);

/* ---------- the client ---------- */

type Reply = { ok?: unknown; error?: unknown } & Record<string, unknown>;

export class RoomClient {
  /** The session: filled by host, join or resume, cleared by leave or detach. */
  code = '';
  seat = -1;
  token = '';
  csrf = '';
  /** The seq of the newest event seen. */
  since = 0;
  /** The hills last received and their revision. Snapshots arrive without the
   * hills when this is current (the delta protocol: the client sends
   * `have=<terrainRev>`), and `apply` hands the page the complete room either
   * way. Null while it holds none (the first sync of a match is always full). */
  terrain: number[] | null = null;
  terrainRev = 0;
  /** In a running match (polling, acting) rather than the lobby. */
  on = false;
  /** The first snapshot of the match has been taken. */
  synced = false;
  /** Bumped whenever a match begins or ends for this client: a match poll that
   *  answers after it (an 'over' room once Play again took it to the lobby) is
   *  stale and dropped. */
  private matchEpoch = 0;
  seats: RoomSeat[] = [];
  /** The seat that starts the match, as the last snapshot said. */
  hostSeat = 0;
  get isHost(): boolean { return this.seat === this.hostSeat; }
  /** The hills: the picked map's id (null for random), its name, the catalog. */
  map: string | null = null;
  mapName = 'Random hills';
  maps: MapInfo[] = [];
  /** The room's turn time in seconds, as the last snapshot said. */
  turnSecs = 120;
  /** The room's game speed, as the last snapshot said (a server from before
   * the setting sends none: 1×). */
  speed: Speed = 1;
  /** The room's Walls: the host's pick and the wall this round plays, as the last snapshot said
   * (a server from before the setting sends neither: None). */
  walls: WallsSetting = 'none';
  wallsNow: Walls = 'none';
  /** The room's phase, as the last snapshot said: the host picks the walls only outside a round. */
  phase = '';

  /** The Ready state the player last asked for while a request is out. */
  private readyWant: boolean | null = null;
  private readySending = false;
  private busy = false;
  /** The next request asks for the whole world (`full=1`): set after trouble
   * reaching the server and when a hidden tab comes back, cleared by the
   * first answer that gets through. */
  private needFull = false;
  /** A full refetch ordered by an unusable delta is in flight. */
  private refetching = false;
  private menuSent = false;
  private pollId: unknown = 0;
  private lobbyId: unknown = 0;
  private turnLeft: number | null = null;
  private turnLeftAt = 0;
  private shopLeft: number | null = null;
  private shopLeftAt = 0;
  private clockWarned = false;
  private closeLeft: number | null = null;
  private closeLeftAt = 0;

  private readonly env: RoomEnv;
  private readonly handlers: RoomHandlers;

  constructor(env: RoomEnv, handlers: RoomHandlers) {
    this.env = env;
    this.handlers = handlers;
  }

  /* ---- transport ---- */

  /** One fetcher for every room call, so transport trouble always arrives in
   * human words: unreachable, a page where game data should be (PHP not
   * running), or a stumble. Server JSON errors pass through untouched. */
  private async fetchJson(url: string, init?: FetchInit): Promise<{ res: FetchResponse; data: Reply }> {
    let res: FetchResponse;
    try {
      res = await this.env.fetch(url, init);
    } catch (err) {
      throw this.down('Could not reach the room server. Solo hills still work.');
    }
    const data = (await res.json().catch(() => null)) as Reply | null;
    if (!data) {
      throw this.down(res.ok
        ? 'The room server answered with a page instead of game data, so the PHP service is probably not running there. Solo hills still work.'
        : STUMBLED);
    }
    return { res, data };
  }

  private down(message: string): Error {
    const e: Error & { roomDown?: boolean } = new Error(message);
    e.roomDown = true;
    this.needFull = true;
    this.handlers.onReachable(false);
    return e;
  }

  /** POST one action, typed by protocol.ts. The seat's code, token and csrf
   * ride on every call. The server spaces one seat's acts 150 ms apart, so a
   * 429 waits a beat and goes again, up to three times (never for create or
   * join, which spend the hourly allowance: a 503 once, a 429 not at all).
   * Throws the server's line on an error reply. */
  async post<A extends PostAction>(action: A, payload: PostBodies[A]): Promise<PostReplies[A]> {
    const asksRoom = ROOM_ANSWERS.has(action);
    const send = () => this.fetchJson('rooms.php?action=' + encodeURIComponent(action), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': this.csrf || '' },
      body: JSON.stringify(Object.assign(
        { code: this.code, token: this.token, csrf: this.csrf }, asksRoom ? this.holdings() : {}, payload || {},
      )),
    });
    let { res, data } = await send();
    // 503 is a room busy past the server's lock wait: worth the same retry.
    const charged = CHARGED_ACTIONS.has(action);
    const retries = (status: number): number => charged
      ? (status === 503 ? CHARGED_RETRIES_503 : 0)
      : (status === 429 || status === 503 ? RETRY_429_TRIES : 0);
    for (let tries = 0; tries < retries(res.status); tries++) {
      await new Promise<void>(r => this.env.setTimeout(r, RETRY_429_MS));
      ({ res, data } = await send());
    }
    if (!res.ok || !data.ok) throw replyError(data);
    this.handlers.onReachable(true);
    if (asksRoom) this.needFull = false;
    return data as unknown as PostReplies[A];
  }

  /** What this client tells the server it already holds, so the reply can be
   * a delta: the event cursor, the hills' revision (only while it holds
   * hills), and `full` when it wants the whole world. */
  private holdings(): { since: number; have?: number; full?: true } {
    const h: { since: number; have?: number; full?: true } = { since: this.since };
    if (this.terrain && !this.needFull) h.have = this.terrainRev;
    if (this.needFull) h.full = true;
    return h;
  }

  /** The next request fetches everything and the room is fetched now (a
   * hidden tab that came back: whatever it missed is not worth trusting a
   * delta for). */
  resync(): void {
    this.needFull = true;
    void this.refresh();
  }

  /** The room as this seat sees it (events newer than the cursor). */
  async getState(): Promise<RoomSnapshot> {
    const h = this.holdings();
    const q = 'action=state&code=' + encodeURIComponent(this.code) +
      '&token=' + encodeURIComponent(this.token) + '&since=' + h.since +
      (h.have !== undefined ? '&have=' + h.have : '') + (h.full ? '&full=1' : '');
    const { res, data } = await this.fetchJson('rooms.php?' + q, { headers: { Accept: 'application/json' } });
    if (!res.ok || !data.ok) throw replyError(data);
    this.handlers.onReachable(true);
    this.needFull = false;
    const room = (data as unknown as RoomReply).room;
    this.noteRoom(room);
    return room;
  }

  /** Every seat this browser holds, one row each in the order asked: whose
   * turn it is there, the clocks, the players, or `gone`. Tokens travel in the
   * body. Throws the server's line on an error reply. */
  async mine(seats: { code: string; token: string }[]): Promise<MineRow[]> {
    // Its own path, not fetchJson: the watcher's trouble must not touch the
    // room on screen (the server dot, a forced full refetch).
    const res = await this.env.fetch('rooms.php?action=mine', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ seats }),
    });
    const data = (await res.json().catch(() => null)) as Reply | null;
    if (!data || !res.ok || !data.ok) throw new Error(String((data && data.error) || STUMBLED));
    return (data as unknown as PostReplies['mine']).rooms;
  }

  /** What every snapshot says about time: the turn time, the game speed, and how long until
   * the room closes if nobody acts (`closesIn`, seconds from the reply,
   * counted down from when it arrived, so the client's own clock never
   * matters; absent means no sooner close is known). */
  private noteRoom(room: Partial<Pick<RoomSnapshot, 'turnSecs' | 'closesIn' | 'speed' | 'walls' | 'wallsNow' | 'phase'>> | null | undefined): void {
    if (!room) return;
    if (typeof room.turnSecs === 'number') this.turnSecs = room.turnSecs;
    this.speed = parseSpeed(room.speed);
    this.walls = isWallsSetting(room.walls) ? room.walls : 'none';
    this.wallsNow = parseWalls(room.wallsNow);
    if (typeof room.phase === 'string') this.phase = room.phase;
    if (typeof room.closesIn === 'number' && Number.isFinite(room.closesIn)) {
      this.closeLeft = room.closesIn;
      this.closeLeftAt = this.env.now();
    } else {
      this.closeLeft = null;
    }
  }

  /** Fills `maps` for the hills picker; an unreachable server leaves it as is. */
  async loadMaps(): Promise<void> {
    try {
      const { data } = await this.fetchJson('rooms.php?action=maps', { headers: { Accept: 'application/json' } });
      const reply = data as unknown as MapsReply | ErrorReply;
      if (reply.ok && Array.isArray(reply.maps)) this.maps = reply.maps;
      if (reply.ok) this.handlers.onReachable(true);
    } catch (_) { /* the picker stays on random hills */ }
  }

  /** The lobby shelf's health check; null when the server is unreachable. */
  async ping(): Promise<PingReply | ErrorReply | null> {
    try {
      const { data } = await this.fetchJson('rooms.php?action=ping', { headers: { Accept: 'application/json' } });
      this.handlers.onReachable(true);
      return data as unknown as PingReply | ErrorReply;
    } catch (_) { return null; }
  }

  /* ---- joining and leaving ---- */

  /** A puzzle for a create or a join (server/pow.php). */
  private async challenge(purpose: 'create' | 'join'): Promise<ChallengeReply> {
    const { res, data } = await this.fetchJson('rooms.php?action=challenge&for=' + purpose, { headers: { Accept: 'application/json' } });
    if (!res.ok || !data.ok) throw replyError(data);
    return data as unknown as ChallengeReply;
  }

  /** Create or join with the room puzzle solved: ask for one, solve it, send
   * it. A puzzle refused as stale, rebound or spent is asked for and solved
   * once more, silently; anything else is the server's line. `signal`
   * cancels: while solving nothing is sent, and a seat taken after it was
   * cancelled is given up again. */
  private async admitted<A extends 'create' | 'join'>(
    action: A, payload: Omit<PostBodies[A], 'pow'>, signal?: PowSignal,
  ): Promise<SeatReply> {
    const subtle = this.env.subtle();
    if (!subtle) throw new Error(INSECURE);
    for (let tries = 0; ; tries++) {
      const ch = await this.challenge(action);
      const n = await solvePow(ch, subtle, signal ? { signal } : {});
      let data: SeatReply;
      try {
        data = await this.post(action, { ...payload, pow: { c: ch.challenge, n } } as PostBodies[A]) as SeatReply;
      } catch (err) {
        const puzzle = (err as { puzzle?: unknown }).puzzle;
        if (tries === 0 && typeof puzzle === 'string' && PUZZLE_AGAIN.has(puzzle)) continue;
        throw err;
      }
      if (signal?.aborted) {
        // Cancelled while the request was out: the seat it took is given up,
        // without touching whatever session this client holds by now.
        this.sendLeaveFor(data.code, data.token, data.csrf);
        throw new PowCancelled();
      }
      return data;
    }
  }

  /** Hosts a room: forgets any earlier session, creates, takes the seat. */
  async host(initials: string, map: string, body: string, difficulty: Difficulty, turn?: number, signal?: PowSignal): Promise<void> {
    this.forget();
    this.map = null;
    this.mapName = 'Random hills';
    const data = await this.admitted('create', turn === undefined
      ? { proto: PROTO, initials, map, body, difficulty }
      : { proto: PROTO, initials, map, body, difficulty, turn }, signal);
    this.code = data.code; this.seat = data.seat; this.token = data.token; this.csrf = data.csrf;
  }

  /** Joins a room by its code, typed in any case, with spaces or hyphens. */
  async join(code: string, initials: string, body: string, signal?: PowSignal): Promise<void> {
    this.forget();
    const data = await this.admitted('join', { proto: PROTO, code: cleanCode(code), initials, body }, signal);
    this.code = data.code; this.seat = data.seat; this.token = data.token; this.csrf = data.csrf;
  }

  /** The host starts the room. With company it is a server match (the room);
   * with the host alone the server has closed the lobby and the match is
   * this browser's to play (local). */
  async start(): Promise<Started> {
    const data = await this.post('start', { proto: PROTO });
    if ('local' in data) {
      const walls = data.local.walls;
      return { local: { difficulty: data.local.difficulty, speed: parseSpeed(data.local.speed), walls: isWallsSetting(walls) ? walls : 'none' } };
    }
    return { room: data.room };
  }

  /** Adopts a seat this browser stored: the next poll asks as that seat. */
  resume(s: Pick<StoredSeat, 'code' | 'seat' | 'token' | 'csrf'>): void {
    this.forget();
    this.code = s.code; this.seat = s.seat; this.token = s.token; this.csrf = s.csrf;
  }

  private forget(): void {
    this.code = ''; this.token = ''; this.csrf = ''; this.seat = -1; this.since = 0;
    this.seats = []; this.hostSeat = 0; this.turnSecs = 120; this.speed = 1; this.closeLeft = null;
    this.walls = 'none'; this.wallsNow = 'none'; this.phase = '';
    this.dropTerrain();
  }

  private dropTerrain(): void {
    this.terrain = null; this.terrainRev = 0; this.needFull = false;
  }

  /** Tells the server this seat is given up (the explicit Leave), so an
   * emptied room frees its slot at once instead of after its idle limit. Best
   * effort: sendBeacon, else a keepalive fetch. Closing the tab sends nothing. */
  sendLeave(): void {
    this.sendLeaveFor(this.code, this.token, this.csrf);
  }

  private sendLeaveFor(code: string, token: string, csrf: string): void {
    if (!code || !token) return;
    const body = JSON.stringify({ code, token, csrf });
    const url = 'rooms.php?action=leave';
    try {
      if (this.env.beacon(url, body)) return;
    } catch (_) { /* fall through to fetch */ }
    try {
      void Promise.resolve(this.env.fetch(url, {
        method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' }, body,
      })).catch(() => { /* the idle sweep closes it anyway */ });
    } catch (_) { /* the idle sweep closes it anyway */ }
  }

  /** Leaves: tells the server, then detaches. */
  leave(): void {
    this.sendLeave();
    this.detach();
  }

  /** Stops both polls and clears the session, telling nobody: the seat stays
   * this player's in the room (Step out, or switching to another room). */
  detach(): void {
    this.stopPolling();
    this.stopLobbyWatch();
    this.on = false; this.code = ''; this.seat = -1; this.token = ''; this.csrf = ''; this.since = 0; this.closeLeft = null;
    this.seats = []; this.synced = false; this.matchEpoch++;
    this.dropTerrain();
  }

  /* ---- polling ---- */

  /** A match begins: the cursor and the sync start over, and the match poll
   * runs until stopPolling. */
  beginMatch(since = 0): void {
    this.on = true;
    this.matchEpoch++;
    this.since = since;
    this.synced = false;
    this.dropTerrain();
    this.stopLobbyWatch();
    this.stopPolling();
    this.pollId = this.env.setInterval(() => { void this.refresh(); }, MATCH_POLL_MS);
  }

  /** The room went back to its lobby (Play again): the match poll stops and the
   * session stays, so the lobby can watch the room. */
  toLobby(): void {
    this.stopPolling();
    this.on = false;
    this.synced = false;
    this.matchEpoch++;
  }

  stopPolling(): void {
    if (this.pollId) { this.env.clearInterval(this.pollId); this.pollId = 0; }
  }

  /** One match poll: fetch the room and apply it, unless the match it asked
   * about ended for this client meanwhile. A failed poll is retried by the
   * next one. */
  async refresh(): Promise<void> {
    if (!this.on) return;
    const epoch = this.matchEpoch;
    try {
      const room = await this.getState();
      if (!this.on || epoch !== this.matchEpoch) return;
      if (this.seatLost(room)) { this.gone('seat'); return; }
      this.apply(room);
    } catch (err) {
      const why = isGoneError(err);
      if (this.on && epoch === this.matchEpoch && why) this.gone(why);
      /* otherwise the next poll retries; the hills wait */
    }
  }

  /** The room answered, but this seat is no longer a player's: given up
   * (Leave in another tab) and taken by a bot. */
  private seatLost(room: RoomSnapshot): boolean {
    const mine = (room.seats || []).find(s => s.seat === this.seat);
    return !room.you && !!mine && !mine.human;
  }

  private gone(why: 'closed' | 'seat' | 'space'): void {
    const code = this.code;
    this.detach();
    this.handlers.onGone?.(code, why);
  }

  /** Watches a lobby: every 2 s fetches the room for `onRoom`, until the
   * match starts, the session ends, or `visible` says the lobby is closed.
   * An error in a tick (the host wandered off) just waits for the next. */
  watchLobby(visible: () => boolean, onRoom: (room: RoomSnapshot) => void): void {
    this.stopLobbyWatch();
    this.lobbyId = this.env.setInterval(() => {
      if (!this.code || this.on || !visible()) { this.stopLobbyWatch(); return; }
      void (async () => {
        try {
          const room = await this.getState();
          if (this.seatLost(room)) { this.gone('seat'); return; }
          onRoom(room);
        } catch (err) {
          const why = isGoneError(err);
          if (why && this.code) this.gone(why);
          /* otherwise keep listening */
        }
      })();
    }, LOBBY_POLL_MS);
  }

  stopLobbyWatch(): void {
    if (this.lobbyId) { this.env.clearInterval(this.lobbyId); this.lobbyId = 0; }
  }

  /** Settles the hills of a snapshot: a snapshot that carries them replaces
   * what is held (unless it is an older revision than the one held, a reply
   * that lost a race); one that omits them gets the held hills put back, so
   * the page always sees a complete room. False when the snapshot omits hills
   * this client does not hold at that revision: it cannot be used, and the
   * whole world is fetched instead (once: a server that still omits the hills
   * when asked for `full` is not looped on). */
  private settleTerrain(room: RoomSnapshot): boolean {
    const rev = typeof room.terrainRev === 'number' ? room.terrainRev : null;
    if (Array.isArray(room.terrain)) {
      if (!room.terrain.length) { this.dropTerrain(); return true; }
      if (this.terrain && rev !== null && rev < this.terrainRev) {
        room.terrain = this.terrain;
      } else {
        this.terrain = room.terrain;
        this.terrainRev = rev === null ? 0 : rev;
      }
      return true;
    }
    if (rev === null) return true; // a server with no delta protocol: nothing to settle
    if (this.terrain && rev <= this.terrainRev) {
      room.terrain = this.terrain;
      return true;
    }
    if (this.refetching) return true; // already asked for the whole world; take what came
    this.needFull = true;
    return false;
  }

  /** Counts a snapshot's events past the cursor and hands both to the page.
   * Ignored with no session. A snapshot flagged `resync` lost events the
   * client never saw: it is taken as a first sync (the log catches up, no
   * replay is built). */
  apply(room: RoomSnapshot | null | undefined): void {
    if (!room || !this.code) return;
    if (!this.settleTerrain(room)) {
      this.refetching = true;
      void this.refresh().finally(() => { this.refetching = false; });
      return;
    }
    this.noteRoom(room);
    const fresh = (room.events || []).filter(e => (e.seq || 0) > this.since);
    for (const e of fresh) this.since = Math.max(this.since, e.seq || 0);
    const first = !this.synced || room.resync === true;
    this.synced = true;
    this.handlers.onSnapshot(room, fresh, first);
  }

  /* ---- acts ---- */

  /** A reply belongs to the match it was sent in: one that lands after the room went back to its lobby,
   * or into the next match, is dropped, so an old 'over' room cannot reopen its end card. */
  private applyIfCurrent(epoch: number, room: RoomSnapshot | null | undefined): void {
    if (this.on && epoch === this.matchEpoch) this.apply(room);
  }

  /** An act that waits for its answer, one at a time (firing). The reply is
   * applied; a failure rejects, and a second call while one is out is
   * dropped. */
  async act(body: ActBody): Promise<void> {
    if (this.busy) return;
    this.busy = true;
    try {
      const epoch = this.matchEpoch;
      this.applyIfCurrent(epoch, (await this.post('act', body)).room);
    } finally {
      this.busy = false;
    }
  }

  /** An act that does not wait (aim, drive, weapon): the reply is applied,
   * a failure is dropped. */
  sendQuiet(body: ActBody): void {
    const epoch = this.matchEpoch;
    this.post('act', body).then(d => this.applyIfCurrent(epoch, d.room)).catch(() => {});
  }

  /** Tells the room this player is in a menu (or out of it), once per change,
   * so the others see why the battle waits on them. */
  setMenu(open: boolean): void {
    if (open === this.menuSent || !this.code) return;
    this.menuSent = open;
    const epoch = this.matchEpoch;
    this.post('act', { kind: 'menu', open }).then(d => this.applyIfCurrent(epoch, d.room)).catch(() => { this.menuSent = !open; });
  }

  /** The unit look changes any time; in a match the answer is applied. */
  sendBody(body: string): void {
    if (!this.code) return;
    this.post('body', { body }).then(d => { if (this.on) this.apply(d.room); }).catch(() => {});
  }

  /** Buys from the shop. The reply is returned, not applied: the page shows
   * its confirmation first and then applies it. */
  buy(item: string, qty: number): Promise<RoomReply> {
    return this.post('buy', { item, qty });
  }

  /* ---- Ready ---- */

  /** Whether this seat counts as ready: what the player last asked for while
   * a request is out, otherwise what the room says. */
  readyNow(): boolean {
    if (this.readyWant !== null) return this.readyWant;
    const me = this.seats[this.seat];
    return !!(me && me.ready);
  }

  /** The shop button toggles Ready. The wire carries the wanted state, not a
   * flip, and requests go one at a time in the order of the clicks, so a
   * duplicate or a slow reply can never invert it. If the last player has
   * readied by the time an unready lands, the server has already started the
   * round and answers with that, quietly. */
  setReady(want?: boolean): void {
    this.readyWant = typeof want === 'boolean' ? want : !this.readyNow();
    this.handlers.onReadyChange();
    void this.sendReady();
  }

  private async sendReady(): Promise<void> {
    if (this.readySending) return;
    this.readySending = true;
    try {
      while (this.readyWant !== null) {
        const want = this.readyWant;
        const d = await this.post('ready', { ready: want });
        if (this.readyWant === want) this.readyWant = null;
        this.apply(d.room);
      }
    } catch (err) {
      this.readyWant = null;
      this.handlers.onError(err);
      void this.refresh();
    }
    this.readySending = false;
    this.handlers.onReadyChange();
  }

  /** Outside the shop nobody is waiting on a wish. */
  dropReadyWish(): void { this.readyWant = null; }

  /* ---- clocks ---- */

  /** Arms the clocks from a snapshot: seconds left as of now, counted down
   * locally. A turn clock that jumps up is a new turn, which re-arms the
   * 30-second alert. */
  armClocks(room: Pick<RoomSnapshot, 'turnLeft' | 'shopLeft'>): void {
    const prevLeft = this.turnClockLeft();
    this.turnLeft = typeof room.turnLeft === 'number' ? room.turnLeft : null;
    this.turnLeftAt = this.env.now();
    if (this.turnLeft === null || prevLeft === null || this.turnLeft > prevLeft + 5) this.clockWarned = false;
    this.shopLeft = typeof room.shopLeft === 'number' ? room.shopLeft : null;
    this.shopLeftAt = this.env.now();
  }

  turnClockLeft(): number | null {
    if (!this.on || typeof this.turnLeft !== 'number') return null;
    return Math.max(0, this.turnLeft - (this.env.now() - this.turnLeftAt) / 1000);
  }

  shopClockLeft(): number | null {
    if (!this.on || typeof this.shopLeft !== 'number') return null;
    return Math.max(0, this.shopLeft - (this.env.now() - this.shopLeftAt) / 1000);
  }

  /** Seconds before the room closes with nobody acting, counted down
   * locally from the last snapshot's `closesIn`; null when it did not say. */
  closeClockLeft(): number | null {
    if (typeof this.closeLeft !== 'number') return null;
    return Math.max(0, this.closeLeft - (this.env.now() - this.closeLeftAt) / 1000);
  }

  /** True once per turn, when the clock first reads 30 seconds or less. */
  clockWarnDue(): boolean {
    const left = this.turnClockLeft();
    if (left === null || this.clockWarned || left > CLOCK_WARN_S || left <= 0) return false;
    this.clockWarned = true;
    return true;
  }
}
