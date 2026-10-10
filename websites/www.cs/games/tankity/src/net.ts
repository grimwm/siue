/* Operation Tankity: the room client.
 *
 * Everything between the page and rooms.php that is not drawing: the
 * transport (one fetcher for every call, the 429 retry), the session (code,
 * seat, token, the event cursor), polling, the act/buy/ready/leave senders,
 * the turn and shop clocks, and the decisions about a replay queue that has
 * piled up (a hidden tab). What it learns reaches the page through the
 * RoomHandlers it is built with (a snapshot with the events it has not seen,
 * a reachability flip, a Ready change, an error to show); it never touches
 * the document.
 *
 * It does not reach for the browser either: fetch, timers, the clock and the
 * leave beacon come in as a RoomEnv, so this module compiles in the DOM-free
 * program, and net-test.js drives it with a fake server and fake timers.
 * game.js builds the real RoomEnv from the page's globals. The wire types are
 * in protocol.ts. */
import type {
  ActBody, ErrorReply, MapInfo, MapsReply, PingReply, PostAction, PostBodies, PostReplies,
  RoomEvent, RoomReply, RoomSeat, RoomSnapshot, VolleyOpenerEvent,
} from './protocol.js';

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
}

/* ---------- timing ---------- */

/** Match polling, lobby polling, and the retry for the server's 150 ms act
 * spacing: a quick second click waits a beat and goes again. */
export const MATCH_POLL_MS = 1600;
export const LOBBY_POLL_MS = 2000;
export const RETRY_429_MS = 180;
export const RETRY_429_TRIES = 3;

/** The turn clock (rooms.php ROOM_TURN_SECS): its owner is alerted with 30
 * seconds left and everyone sees the last 10 counted down. */
export const CLOCK_WARN_S = 30;
export const CLOCK_SHOW_S = 10;

const STUMBLED = 'The room server stumbled. Solo hills still work.';

/* ---------- words and links ---------- */

/** Server lines are already human; these few technical ones get translated so
 * a game never quotes transport at the player. */
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
 * piles up. Catch up when the tab is hidden or more than one volley waits. */
export function shouldCatchUp(hidden: boolean, queue: readonly { t: string }[]): boolean {
  return hidden || queue.filter(isVolleyOpener).length > 1;
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

/* ---------- the client ---------- */

type Reply = { ok?: unknown; error?: unknown } & Record<string, unknown>;

export class RoomClient {
  /** The session: filled by host/join, cleared by leave. */
  code = '';
  seat = -1;
  token = '';
  csrf = '';
  /** The seq of the newest event seen. */
  since = 0;
  /** In a running match (polling, acting) rather than the lobby. */
  on = false;
  /** The first snapshot of the match has been taken. */
  synced = false;
  seats: RoomSeat[] = [];
  /** The hills: the picked map's id (null for random), its name, the catalog. */
  map: string | null = null;
  mapName = 'Random hills';
  maps: MapInfo[] = [];

  /** The Ready state the player last asked for while a request is out. */
  private readyWant: boolean | null = null;
  private readySending = false;
  private busy = false;
  private menuSent = false;
  private pollId: unknown = 0;
  private lobbyId: unknown = 0;
  private turnLeft: number | null = null;
  private turnLeftAt = 0;
  private shopLeft: number | null = null;
  private shopLeftAt = 0;
  private clockWarned = false;

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
    this.handlers.onReachable(false);
    return e;
  }

  /** POST one action, typed by protocol.ts. The seat's code, token and csrf
   * ride on every call. The server spaces one seat's acts 150 ms apart, so a
   * 429 waits a beat and goes again, up to three times. Throws the server's
   * line on an error reply. */
  async post<A extends PostAction>(action: A, payload: PostBodies[A]): Promise<PostReplies[A]> {
    const send = () => this.fetchJson('rooms.php?action=' + encodeURIComponent(action), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': this.csrf || '' },
      body: JSON.stringify(Object.assign({ code: this.code, token: this.token, csrf: this.csrf }, payload || {})),
    });
    let { res, data } = await send();
    for (let tries = 0; res.status === 429 && tries < RETRY_429_TRIES; tries++) {
      await new Promise<void>(r => this.env.setTimeout(r, RETRY_429_MS));
      ({ res, data } = await send());
    }
    if (!res.ok || !data.ok) throw new Error(String(data.error || STUMBLED));
    this.handlers.onReachable(true);
    return data as unknown as PostReplies[A];
  }

  /** The room as this seat sees it (events newer than the cursor). */
  async getState(): Promise<RoomSnapshot> {
    const q = 'action=state&code=' + encodeURIComponent(this.code) +
      '&token=' + encodeURIComponent(this.token) + '&since=' + this.since;
    const { res, data } = await this.fetchJson('rooms.php?' + q, { headers: { Accept: 'application/json' } });
    if (!res.ok || !data.ok) throw new Error(String(data.error || STUMBLED));
    this.handlers.onReachable(true);
    return (data as unknown as RoomReply).room;
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

  /** Hosts a room: forgets any earlier session, creates, takes the seat. */
  async host(initials: string, map: string, body: string): Promise<void> {
    this.forget();
    this.map = null;
    this.mapName = 'Random hills';
    const data = await this.post('create', { initials, map, body });
    this.code = data.code; this.seat = data.seat; this.token = data.token; this.csrf = data.csrf;
  }

  /** Joins a room by its code. */
  async join(code: string, initials: string, body: string): Promise<void> {
    this.forget();
    this.code = String(code || '').trim().toUpperCase();
    const data = await this.post('join', { code: this.code, initials, body });
    this.code = data.code; this.seat = data.seat; this.token = data.token; this.csrf = data.csrf;
  }

  private forget(): void {
    this.code = ''; this.token = ''; this.csrf = ''; this.seat = -1; this.since = 0;
    this.seats = [];
  }

  /** Tells the server this seat is gone, so an emptied room frees its slot at
   * once instead of after the idle window. Best effort; sendBeacon survives a
   * closing tab. */
  sendLeave(): void {
    if (!this.code || !this.token) return;
    const body = JSON.stringify({ code: this.code, token: this.token, csrf: this.csrf });
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

  /** Leaves: tells the server, stops both polls, and clears the session. */
  leave(): void {
    this.sendLeave();
    this.stopPolling();
    this.stopLobbyWatch();
    this.on = false; this.code = ''; this.seat = -1; this.token = ''; this.csrf = ''; this.since = 0;
    this.seats = []; this.synced = false;
  }

  /* ---- polling ---- */

  /** A match begins: the cursor and the sync start over, and the match poll
   * runs until stopPolling. */
  beginMatch(since = 0): void {
    this.on = true;
    this.since = since;
    this.synced = false;
    this.stopLobbyWatch();
    this.stopPolling();
    this.pollId = this.env.setInterval(() => { void this.refresh(); }, MATCH_POLL_MS);
  }

  stopPolling(): void {
    if (this.pollId) { this.env.clearInterval(this.pollId); this.pollId = 0; }
  }

  /** One match poll: fetch the room and apply it. A failed poll is retried by
   * the next one. */
  async refresh(): Promise<void> {
    if (!this.on) return;
    try {
      this.apply(await this.getState());
    } catch (_) { /* the next poll retries; the hills wait */ }
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
          onRoom(await this.getState());
        } catch (_) { /* keep listening */ }
      })();
    }, LOBBY_POLL_MS);
  }

  stopLobbyWatch(): void {
    if (this.lobbyId) { this.env.clearInterval(this.lobbyId); this.lobbyId = 0; }
  }

  /** Counts a snapshot's events past the cursor and hands both to the page.
   * Ignored with no session. */
  apply(room: RoomSnapshot | null | undefined): void {
    if (!room || !this.code) return;
    const fresh = (room.events || []).filter(e => (e.seq || 0) > this.since);
    for (const e of fresh) this.since = Math.max(this.since, e.seq || 0);
    const first = !this.synced;
    this.synced = true;
    this.handlers.onSnapshot(room, fresh, first);
  }

  /* ---- acts ---- */

  /** An act that waits for its answer, one at a time (firing). The reply is
   * applied; a failure rejects, and a second call while one is out is
   * dropped. */
  async act(body: ActBody): Promise<void> {
    if (this.busy) return;
    this.busy = true;
    try {
      this.apply((await this.post('act', body)).room);
    } finally {
      this.busy = false;
    }
  }

  /** An act that does not wait (aim, drive, weapon): the reply is applied,
   * a failure is dropped. */
  sendQuiet(body: ActBody): void {
    this.post('act', body).then(d => this.apply(d.room)).catch(() => {});
  }

  /** Tells the room this player is in a menu (or out of it), once per change,
   * so the others see why the battle waits on them. */
  setMenu(open: boolean): void {
    if (open === this.menuSent || !this.code) return;
    this.menuSent = open;
    this.post('act', { kind: 'menu', open }).then(d => this.apply(d.room)).catch(() => { this.menuSent = !open; });
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

  /** True once per turn, when the clock first reads 30 seconds or less. */
  clockWarnDue(): boolean {
    const left = this.turnClockLeft();
    if (left === null || this.clockWarned || left > CLOCK_WARN_S || left <= 0) return false;
    this.clockWarned = true;
    return true;
  }
}
