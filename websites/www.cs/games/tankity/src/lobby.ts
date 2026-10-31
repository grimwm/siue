/* Operation Tankity: getting into and out of a room.
 *
 * The lobby overlay (src/ui/lobby.tsx) and what stands behind it: checking
 * the initials, the room server's dot and occupancy, the hills picker, hosting
 * and joining, the roster while the room waits, the invite link, starting the
 * match, the question before leaving one, and leaving it. Every seat taken is
 * remembered in this browser (seats.ts): the room link, or Your games, resumes
 * it; Step out keeps it; only Leave gives it up. A running match is room.ts. The game's state, the room client and the rest arrive as deps. */
import { track } from './track.ts';
import type { sfx as SfxApi } from './audio.ts';
import type { GameState, MatchState } from './game-types.ts';
import { DIFFICULTY_NAMES } from './difficulty.ts';
import type { DifficultySetting } from './difficulty.ts';
import { readInitials, saveInitials } from './initials.ts';
import type { Pref } from '../../_kit/prefs.ts';
import type { HudValues } from './hud.ts';
import type { EndState } from './match.ts';
import { cleanCode, goneLine, inviteUrl, isGoneError, isRoomCode, prettyRoomError } from './net.ts';
import { PowCancelled } from './pow.ts';
import type { RoomClient } from './net.ts';
import type { RoomEvent, RoomSnapshot } from './protocol.ts';
import type { Difficulty } from './sim.ts';
import type { Speed } from './speed.ts';
import type { Replay } from './replay.ts';
import type { SeatStore } from './seats.ts';
import { TURN_DEFAULT, TURN_SETTLE_MS, settleAfter } from './turn-time.ts';
import type { KeyHintFn } from './ui/chrome.tsx';
import { drawMapIcon } from './ui/icons.ts';
import { renderLeave as drawLeave } from './ui/leave.tsx';
import { renderLobby as drawLobby } from './ui/lobby.tsx';
import type { GamesView } from './ui/games.tsx';
import type { LobbySeat } from './ui/lobby.tsx';
import { isWallsSetting } from './walls.ts';
import type { WallsSetting } from './walls.ts';

/** What the lobby shows that the game decides (see LOBBY). */
export interface LobbyView {
  status: string;
  count: string;
  online: boolean;
  inRoom: boolean;
  mapId: string;
  mapsRev: number;
  prefill: string;
  code: string;
  link: string;
  hills: string;
  drones: string;
  seats: LobbySeat[];
  mySeat: number;
  isHost: boolean;
  seatsHint: string;
  /** In a room: who starts the match ("You host…", "Hang tight…"), apart from the status line. */
  roomHint: string;
  /** Bumped to put the saved initials back in the boxes; the line saying why typed ones cannot be used. */
  initialsRev: number;
  initialsProblem: string;
  /** The turn time: the host form's pick out of a room, the room's in one. */
  turnSecs: number;
  /** The room's Walls pick. */
  walls: WallsSetting;
  /** Setting up a room or a seat (solving the room puzzle): Host and Join wait, Cancel stops it. */
  working: boolean;
}

/** The slice of the game's state getting into a room touches (main.ts's G). */
export type LobbyState = Pick<GameState, 'body' | 'demo' | 'over'>;

/** What the lobby needs from the page and the rest of the game. */
export interface LobbyDeps {
  G: LobbyState;
  $(id: string): HTMLElement | null;
  net: RoomClient;
  MATCH: MatchState;
  HUD: Pick<HudValues, 'online'>;
  END: EndState;
  replay: Replay;
  sfx: Pick<typeof SfxApi, 'play'>;
  /** The Menu's Difficulty: a hosted room takes it for good. */
  difficulty: Pick<DifficultySetting, 'get'>;
  unlock(): void;
  /** Full screen on a touch device, asked inside the tap that hosts or joins (optional: tests omit it). */
  playFullscreen?(): void;
  say(text: string, tone?: string): void;
  keyHint: KeyHintFn;
  /** The seats this browser holds. */
  seats: SeatStore;
  /** Your games and the Turn alerts button, as the lobby shows them. */
  games(): GamesView;
  /** The player stepped out of a room (on their own turn, or not). */
  steppedOut(code: string, myTurn: boolean): void;
  netEvent(e: RoomEvent): void;
  seatName(seat: number): string;
  closeLobbyVeil(): boolean;
  closeOverlays(): boolean;
  closePreview(): void;
  endTutorial(seen: boolean): void;
  /** Hide the title card: a room match is starting. */
  closeTitle(): void;
  /** Back to the title card over a fresh demo. */
  backToTitle(): void;
  /** The player's saved initials (main.ts's savedInitials), shared with the title card; rooms host and join with them. */
  initials: Pref<string>;
  /** A set typed here was saved: the title card redraws to show it. */
  initialsSaved(): void;
  hideShop(): void;
  /** Play a match here, like solo, at a room's Difficulty and speed: the host
   * started a room nobody else had joined. */
  startLocal(local: { difficulty: Difficulty; speed: Speed; walls: WallsSetting }): void;
  paintHud(): void;
  refreshNavHints(): void;
  renderMenu(): void;
  renderShop(): void;
}

export function createLobby(deps: LobbyDeps) {
  const {
    G, $, net, MATCH, HUD, END, replay, sfx, difficulty, unlock, playFullscreen, say, keyHint, seats, games, steppedOut, netEvent, seatName, closeLobbyVeil,
    closeOverlays, closePreview, endTutorial, closeTitle, backToTitle, initials, initialsSaved, hideShop, startLocal, paintHud, refreshNavHints,
    renderMenu, renderShop,
  } = deps;

  /* ---------- game rooms: server-hosted multiplayer ---------- */
  /* The lobby is a Preact component (src/ui/lobby.tsx). This is everything it
     shows that the game decides: the status line, the occupancy count, the
     server dot, the picked hills, an invite's code, and the room as last drawn
     (code, link, hills, seats), and the initials line. The code and initials
     boxes stay the page's own. */
  const LOBBY: LobbyView = {
    status: '', count: '', online: false, inRoom: false, mapId: '', mapsRev: 0, prefill: '',
    code: '', link: '', hills: 'Hills: Random hills', drones: '', seats: [], mySeat: 0, isHost: false, seatsHint: '', roomHint: '',
    initialsRev: 0, initialsProblem: '', turnSecs: TURN_DEFAULT, walls: 'none', working: false,
  };
  /* The host or join under way, for Cancel: its signal, and the button that began it. */
  let setup: { aborted: boolean; from: string } | null = null;
  /* Runs a host or a join with the room puzzle: one at a time, the status line
     saying so, Cancel able to stop it. */
  async function settingUp(line: string, from: string, go: (signal: { aborted: boolean }) => Promise<void>): Promise<void> {
    if (setup) return;
    const signal = { aborted: false, from };
    setup = signal;
    LOBBY.working = true;
    lobbySay(line);
    try {
      await go(signal);
    } catch (err) {
      if (!(err instanceof PowCancelled) && setup === signal) lobbySay(prettyRoomError(err));
    } finally {
      if (setup === signal) {
        setup = null;
        LOBBY.working = false;
        renderLobby();
      }
    }
  }
  /* Cancel: the solve stops, nothing is sent (a seat taken in the meantime is
     given up), and the player is back on the button they pressed. */
  function cancelSetup(): void {
    if (!setup) return;
    setup.aborted = true;
    const from = setup.from;
    setup = null;
    LOBBY.working = false;
    lobbySay('Stopped. Nothing was set up.');
    $(from)?.focus?.();
  }
  function lobbySay(text: string): void {
    LOBBY.status = text;
    renderLobby();
  }
  /* Host and Join use what the initials boxes hold. Boxes not all filled, or
     a set the blocked list refuses, stop them with a line by the boxes, and
     the player lands in the box to fix; the saved set is never used instead. */
  function lobbyInitials(letters: string): string | null {
    const read = readInitials(letters);
    if ('problem' in read) {
      LOBBY.initialsProblem = read.problem;
      renderLobby();
      $(`lobby-initial-${read.box + 1}`)?.focus?.();
      return null;
    }
    if (read.initials !== initials.get()) chooseInitials(read.initials);
    LOBBY.initialsProblem = '';
    return read.initials;
  }
  /* A full set typed in the boxes: saved for the title card too, or the line says why not. */
  function chooseInitials(word: string): void {
    LOBBY.initialsProblem = saveInitials(initials, word);
    if (!LOBBY.initialsProblem) initialsSaved();
  }
  function renderLobby(): void {
    const veil = $('lobby-veil');
    if (!veil) return;
    drawLobby(veil, {
      keyHint,
      onClose: () => { closeLobbyVeil(); },
      online: LOBBY.online,
      count: LOBBY.count,
      status: LOBBY.status,
      inRoom: LOBBY.inRoom,
      maps: [{ id: '', name: 'Random Hills' }, ...net.maps],
      mapId: LOBBY.mapId,
      drawMapIcon,
      mapsRev: LOBBY.mapsRev,
      prefillCode: LOBBY.prefill,
      onPickMap: id => { LOBBY.mapId = id; mapChosen(); },
      initials: initials.get(),
      initialsRev: LOBBY.initialsRev,
      initialsProblem: LOBBY.initialsProblem,
      onInitials: word => { chooseInitials(word); renderLobby(); },
      onHost: letters => {
        if (setup) return;
        const who = lobbyInitials(letters);
        if (who === null) return;
        playFullscreen?.();
        unlock(); sfx.play('click');
        void hostRoom(who, LOBBY.mapId);
      },
      onJoin: (rawCode, letters) => {
        if (setup) return;
        const who = lobbyInitials(letters);
        if (who === null) return;
        const code = cleanCode(rawCode);
        if (!isRoomCode(code)) { lobbySay('Room codes are 6 letters or digits. Read it back and retry.'); return; }
        playFullscreen?.();
        unlock(); sfx.play('click');
        void joinRoom(code, who);
      },
      working: LOBBY.working,
      onCancel: cancelSetup,
      code: LOBBY.code,
      link: LOBBY.link,
      hills: LOBBY.hills,
      drones: LOBBY.drones,
      seats: LOBBY.seats,
      mySeat: LOBBY.mySeat,
      isHost: LOBBY.isHost,
      seatsHint: LOBBY.seatsHint,
      roomHint: LOBBY.roomHint,
      onSeatMode: netSeatMode,
      turnSecs: LOBBY.turnSecs,
      onTurnForm: secs => { LOBBY.turnSecs = secs; renderLobby(); },
      onTurnRoom: secs => { void netTurnTime(secs); },
      walls: LOBBY.walls,
      onWallsRoom: w => { void netWalls(w); },
      games: games(),
      onCopy: copyInvite,
      onStart: () => { sfx.play('click'); startRoom(); },
      // Reached through Play again, the match behind the lobby is over: leaving goes to the title card, not back to its frozen field.
      onLeave: () => { const ended = !net.on && G.over; netLeave(); if (ended) backToTitle(); else openLobby(); },
    });
    refreshNavHints();
  }
  /* The dot in the lobby and the HUD mirrors the last known reachability. */
  function setNetDot(on: boolean): void {
    LOBBY.online = on;
    renderLobby();
    HUD.online = on;
    paintHud();
  }
  async function loadMaps(): Promise<void> {
    await net.loadMaps(); // an unreachable server leaves the picker on random hills
    const cur = LOBBY.mapId;
    if (cur !== '' && !net.maps.some(m => m.id === cur)) LOBBY.mapId = net.map || '';
    LOBBY.mapsRev++;
    renderLobby();
  }
  /* A pick (tile or value change): redraw the pressed tile, and a hosting
     seat in an unstarted room tells the server. The server spaces a seat's
     acts 150 ms apart, so a quick second tap waits and tries again; only the
     latest pick is ever applied. */
  let mapPickSeq = 0;
  async function mapChosen(): Promise<void> {
    renderLobby();
    if (!net.code || !net.isHost || net.on) return;
    const seq = ++mapPickSeq;
    try {
      for (let tries = 0; ; tries++) {
        try {
          const d = await net.post('map', { map: LOBBY.mapId || '' });
          if (seq !== mapPickSeq) return;
          net.map = d.room.map;
          net.mapName = d.room.mapName || 'Random hills';
          netRenderRoster(d.room);
          return;
        } catch (err) {
          if (tries >= 3 || seq !== mapPickSeq || !/too fast/.test(String(err && (err as Error).message))) throw err;
          await new Promise(r => setTimeout(r, 200));
        }
      }
    } catch (err) {
      lobbySay(String((err && (err as Error).message) || err));
    }
  }
  async function loadOccupancy(): Promise<boolean> {
    const data = await net.ping();
    if (!data) {
      LOBBY.count = '';
      renderLobby();
      return false;
    }
    if (data.ok && data.rooms) {
      const lobbies = 'lobbies' in data && data.lobbies ? ` · ${data.lobbies.used} lobbies open` : '';
      LOBBY.count = `${data.rooms.used} matches running${lobbies}`;
    }
    renderLobby();
    return !!(data.ok && data.rooms);
  }
  async function openLobby(): Promise<void> {
    closePreview();
    // Out of a room the boxes start from the saved set, whatever was left typed in them.
    if (!net.code) { LOBBY.initialsRev++; LOBBY.initialsProblem = ''; }
    lobbySay('');
    loadMaps();
    const alive = await loadOccupancy();
    if (!alive) lobbySay('The room server is not answering right now. Solo hills still work.');
    const veil = $('lobby-veil');
    if (veil) veil.hidden = false;
    refreshNavHints();
    if (net.code && !net.on) {
      netRenderRoster(null);
      netLobbyWatch();
    } else if (!net.code) {
      showLobbyRoom(false);
    }
  }
  /* In a room the lobby shows only the room (code, seats, start); the intro
     and the host and join forms come back once you are out of it. */
  function showLobbyRoom(inRoom: boolean): void {
    LOBBY.inRoom = inRoom;
    renderLobby();
  }
  /* The seat just taken, remembered so closing the tab never gives it up. */
  function rememberSeat(initials: string): void {
    seats.remember({ code: net.code, seat: net.seat, token: net.token, csrf: net.csrf, initials });
  }
  /* Hosting and joining first solve the room puzzle (about a second), which
     the status line says while it runs. */
  function hostRoom(initials: string, mapId?: string | null): Promise<void> {
    return settingUp('Setting up the room…', 'host-go', async signal => {
      MATCH.initials = initials;
      await net.host(initials, mapId || '', G.body, difficulty.get(), LOBBY.turnSecs, signal);
      rememberSeat(initials);
      track('room_host');
      lobbySay('');
      say(`Room ${net.code} hosted. Read the code to your friends.`, 'info');
      await netRefreshRoster();
      loadOccupancy();
      netLobbyWatch();
    });
  }
  function joinRoom(code: string, initials: string): Promise<void> {
    return settingUp('Setting up your seat…', 'join-go', async signal => {
      MATCH.initials = initials;
      await net.join(code, initials, G.body, signal);
      rememberSeat(initials);
      lobbySay('');
      say(`Joined room ${net.code} as ${initials}.`, 'info');
      await netRefreshRoster();
      netLobbyWatch();
    });
  }
  async function netRefreshRoster(): Promise<void> {
    let room: RoomSnapshot | null = null;
    try {
      room = await net.getState();
      net.seats = room.seats || [];
      net.hostSeat = room.hostSeat;
    } catch (err) { /* roster fills in on the next tick */ }
    netRenderRoster(room);
  }
  /* The newest lobby event already told, per room: the match starts its event
     cursor there, so its first sync never repeats who rolled in or left. */
  const lobbyTold = { code: '', seq: 0 };
  function netLobbyWatch(): void {
    if (lobbyTold.code !== net.code) { lobbyTold.code = net.code; lobbyTold.seq = 0; }
    // It runs while this tab holds the lobby seat, shown or not: its polls are
    // the heartbeat that keeps a waiting lobby open (a lobby closed with Q
    // stays listed in Your games, and stays alive).
    net.watchLobby(
      () => true,
      room => {
        net.seats = room.seats || [];
        net.hostSeat = room.hostSeat;
        // Arrivals (not our own), departures and the host's Walls pick (to the others), each told once.
        for (const e of room.events || []) {
          if ((e.seq || 0) <= lobbyTold.seq || (e.t !== 'join' && e.t !== 'left' && e.t !== 'walls')) continue;
          lobbyTold.seq = e.seq || 0;
          if (e.t === 'left' || e.seat !== net.seat) netEvent(e);
        }
        netRenderRoster(room);
        if (room.phase && room.phase !== 'lobby') {
          const veil = $('lobby-veil');
          // Shown: the match starts here. Closed: the player is elsewhere (the title
          // card, a solo match); the room waits in Your games and its turn toasts.
          if (veil && !veil.hidden) {
            track('match_start', 'room');
            startNetMatch(room);
          } else net.stopLobbyWatch();
        }
      },
    );
  }
  /* The invite link carries the room code so a friend lands in the lobby with
  // the code already filled in. */
  /* The invite points at the page the player is on: when a page on this same
     host frames the game (a site's own page around it), that page, so a
     friend arrives with its navigation too; otherwise the game page itself. */
  function joinLink(): string {
    if (typeof location === 'undefined' || !net.code) return '';
    let here: Location = location;
    try {
      if (window.top && window.top !== window && window.top.location.origin === location.origin) here = window.top.location;
    } catch (_) { /* a frame on another host: keep our own address */ }
    return inviteUrl(net.code, here);
  }
  async function copyInvite(): Promise<void> {
    const url = joinLink();
    if (!url) return;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const link = $('join-link') as HTMLInputElement | null;
        if (link && link.select) {
          link.select();
          document.execCommand('copy');
        } else {
          throw new Error('no clipboard');
        }
      }
      lobbySay('Invite link copied. Send it to your friends.');
      sfx.play('click');
    } catch (_) {
      lobbySay('Copy is blocked here. The invite link is in the box above; copy it by hand.');
    }
  }
  /* ?code=XXXX: a seat this browser holds there is resumed; otherwise a
     friend arriving on the invite lands with the code already filled in. */
  function maybeApplyInviteCode(): void {
    if (typeof location === 'undefined' || !location.search) return;
    const m = /[?&]code=([A-Za-z0-9]{6}|[A-Za-z0-9]{4})(?![A-Za-z0-9])/.exec(location.search);
    if (!m) return;
    const code = m[1]!.toUpperCase();
    if (seats.get(code)) { void resumeRoom(code); return; }
    LOBBY.prefill = code;
    renderLobby();
    openLobby();
  }
  /* Back into a room this browser holds a seat in: its lobby opens on the
     roster, or its running match starts with the room's past as history (no
     replay). A room the server no longer has, or a seat it no longer knows,
     is forgotten. False when nothing was resumed. */
  async function resumeRoom(code: string): Promise<boolean> {
    const s = seats.get(code);
    if (!s) return false;
    if (net.code === code && net.on) {
      closeTitle(); // already this room's match
      return true;
    }
    // This room's lobby, kept while closed: read it afresh (it may have started).
    if (net.code === code) net.detach();
    if (net.code) netStepOut(true);
    net.resume(s);
    MATCH.initials = s.initials;
    let room: RoomSnapshot;
    try {
      room = await net.getState();
    } catch (err) {
      net.detach();
      const why = isGoneError(err);
      if (why) {
        seats.forget(code);
        await openLobby();
        lobbySay(goneLine(code));
      } else {
        await openLobby();
        lobbySay(prettyRoomError(err));
      }
      return false;
    }
    if (!room.you) {
      // The room is there but holds no seat for this token: given to a drone.
      net.detach();
      seats.forget(code);
      await openLobby();
      lobbySay(`Your seat in room ${code} is gone.`);
      return false;
    }
    net.seat = room.you.seat;
    if (room.csrf) net.csrf = room.csrf;
    net.seats = room.seats || [];
    net.hostSeat = room.hostSeat;
    rememberSeat(s.initials);
    if (room.phase === 'lobby') {
      // Who rolled in before this visit is history: the watch tells only what comes next.
      lobbyTold.code = code;
      lobbyTold.seq = (room.events || []).reduce((m, e) => Math.max(m, e.seq || 0), 0);
      await openLobby();
      netRenderRoster(room);
      return true;
    }
    lobbyTold.code = code; lobbyTold.seq = 0;
    startNetMatch(room);
    return true;
  }
  function netRenderRoster(room: RoomSnapshot | null): void {
    LOBBY.inRoom = true;
    LOBBY.code = net.code || '';
    LOBBY.link = joinLink();
    if (room && room.map !== undefined) {
      net.map = room.map;
      net.mapName = room.mapName || 'Random hills';
    }
    LOBBY.hills = 'Hills: ' + (net.mapName || 'Random hills');
    // The host's own pick in flight is not undone by a poll that left before it.
    if (room && typeof room.turnSecs === 'number' && !turnPending) LOBBY.turnSecs = room.turnSecs;
    if (room && !wallsPending) LOBBY.walls = isWallsSetting(room.walls) ? room.walls : 'none';
    if (room && room.difficulty) LOBBY.drones = `Drones: ${DIFFICULTY_NAMES[room.difficulty] || 'Normal'} (the host's Difficulty)`;
    LOBBY.seats = ((room && room.seats) || net.seats || []).map(s => ({ human: !!s.human, name: String(s.name || ''), mode: s.mode }));
    if (room) net.hostSeat = room.hostSeat;
    LOBBY.mySeat = net.seat;
    LOBBY.isHost = net.isHost;
    LOBBY.seatsHint = net.isHost
      ? 'Tap a seat nobody holds to switch it between AI and Open. Open seats field no tank.'
      : 'The host decides which empty seats are AI and which stay open.';
    // The status line is left alone: a refusal there stays until the player acts again.
    // The host alone: Start plays the match here, like solo (the server keeps no match for one player).
    const alone = LOBBY.seats.filter(s => s.human).length < 2;
    LOBBY.roomHint = !net.isHost ? 'Hang tight. The host starts the match.'
      : alone ? 'With only you seated, Start plays here on your device.' : 'You host. Start when your crew is in.';
    renderLobby();
  }
  /* The host sets the turn time, in the lobby or mid-match; it counts from
     the next turn. The slider shows the pick at once, and the pick is sent
     once it has stood TURN_SETTLE_MS (a drag is one change, one log line for
     everyone). Only the newest answer is applied, and a refusal puts the
     room's setting back. */
  let turnSeq = 0;
  let turnPending = false;
  /* The room's turn time as the server last confirmed it, while a pick waits. */
  let turnHeld: number | null = null;
  const sendTurnTime = settleAfter<number>(TURN_SETTLE_MS, secs => { void postTurnTime(secs); }, {
    setTimeout: (fn, ms) => setTimeout(fn, ms), clearTimeout: id => clearTimeout(id as number),
  });
  function netTurnTime(secs: number): void {
    if (!net.code || !net.isHost) return;
    if (!net.on) LOBBY.status = ''; // a new act: an earlier refusal has had its say
    if (turnHeld === null) turnHeld = net.turnSecs;
    LOBBY.turnSecs = secs;
    net.turnSecs = secs;
    turnPending = true; // a poll that left before the pick is sent must not undo it on the slider
    renderLobby();
    renderMenu();
    sendTurnTime(secs);
  }
  async function postTurnTime(secs: number): Promise<void> {
    const seq = ++turnSeq;
    const was = turnHeld ?? net.turnSecs;
    turnHeld = null;
    try {
      const d = await net.post('turntime', { secs });
      if (seq !== turnSeq) return;
      if (net.on) net.apply(d.room);
      else netRenderRoster(d.room);
    } catch (err) {
      if (seq !== turnSeq) return;
      // Refused (a full share of long rooms, say): the slider goes back to what the room keeps.
      LOBBY.turnSecs = was;
      net.turnSecs = was;
      renderLobby();
      if (net.on) say(prettyRoomError(err), 'bad');
      else lobbySay(prettyRoomError(err));
    } finally {
      if (seq === turnSeq && turnHeld === null) turnPending = false;
      renderMenu();
    }
  }
  /* The host picks the walls, in the lobby or between rounds (the server
     refuses one while a round is played); a pick applies from the next round.
     The lobby and the menu show it at once; only the newest answer is
     applied, and a refusal puts the room's pick back. */
  let wallsSeq = 0;
  let wallsPending = false;
  async function netWalls(w: WallsSetting): Promise<void> {
    if (!net.code || !net.isHost) return;
    if (!net.on) LOBBY.status = ''; // a new act: an earlier refusal has had its say
    const seq = ++wallsSeq, was = net.walls;
    LOBBY.walls = w;
    net.walls = w;
    wallsPending = true;
    renderLobby();
    renderMenu();
    try {
      const d = await net.post('walls', { walls: w });
      if (seq !== wallsSeq) return;
      if (net.on) net.apply(d.room);
      else netRenderRoster(d.room);
    } catch (err) {
      if (seq !== wallsSeq) return;
      LOBBY.walls = was;
      net.walls = was;
      if (net.on) say(prettyRoomError(err), 'bad');
      else lobbySay(prettyRoomError(err));
    } finally {
      if (seq === wallsSeq) {
        wallsPending = false;
        renderLobby();
        renderMenu();
      }
    }
  }
  /* The host flips a seat nobody holds between the drone battery and open. */
  async function netSeatMode(seat: number, mode: 'ai' | 'open'): Promise<void> {
    if (!net.isHost || net.on) return;
    LOBBY.status = ''; // a new act: an earlier refusal has had its say
    try {
      const d = await net.post('seatmode', { seat, mode, since: net.since });
      net.seats = d.room.seats || [];
      net.hostSeat = d.room.hostSeat;
      netRenderRoster(d.room);
    } catch (err) { lobbySay(prettyRoomError(err)); }
  }
  /* The room this client sat in is gone (the server swept it) or its seat was
     given up elsewhere: the seat is forgotten here too, and the player lands
     in the lobby with a line saying so, to host or join again. */
  let netMatch = false; // a net match is running on this page (set by startNetMatch, cleared by dropRoom)
  function netGone(code: string, gone: 'closed' | 'seat'): void {
    /* The server answers a token that holds no seat as it answers a room that
       is not there; a seat this browser's store no longer holds was given up
       (Leave in another tab, which shares the store). */
    const why = gone === 'closed' && !seats.get(code) ? 'seat' : gone;
    seats.forget(code);
    /* A running match's tanks must not fall to the solo engine behind the veil:
       end it the way leaving does. */
    const wasMatch = netMatch;
    dropRoom();
    LOBBY.inRoom = false;
    if (wasMatch) backToTitle();
    void openLobby().then(() => {
      lobbySay(why === 'seat' ? `Your seat in room ${code} was given up.` : goneLine(code));
    });
  }
  async function startRoom(): Promise<void> {
    if (!net.isHost) return;
    lobbySay('Rolling out…');
    try {
      const started = await net.start();
      if ('local' in started) playHere(started.local);
      else {
        track('match_start', 'room');
        startNetMatch(started.room);
      }
    } catch (err) { lobbySay(prettyRoomError(err)); }
  }
  /* Nobody joined: the server closed the lobby, so the seat is forgotten (it
     is not in Your games) and the match plays on this device as solo, at the
     room's Difficulty, speed and Walls. The turn-time slider keeps its pick. */
  function playHere(local: { difficulty: Difficulty; speed: Speed; walls: WallsSetting }): void {
    const code = net.code;
    net.detach();
    seats.forget(code);
    dropRoom();
    LOBBY.inRoom = false;
    lobbySay('');
    startLocal(local);
    say('Nobody else joined, so this match plays here on your device.', 'info');
  }
  function startNetMatch(room: RoomSnapshot): void {
    endTutorial(false);
    closeTitle();
    G.demo = false;
    netMatch = true;
    // On, the event cursor past what the lobby already told, the lobby poll off and the match poll on.
    net.beginMatch(lobbyTold.code === net.code ? lobbyTold.seq : 0);
    MATCH.lastPhase = '';
    MATCH.lastRound = -1;
    MATCH.out = false; MATCH.outShown = false; MATCH.roundTo = '';
    replay.clear(); MATCH.pendingRoom = null;
    MATCH.aimDirty = false;
    G.over = false;
    const veil = $('lobby-veil');
    if (veil) veil.hidden = true;
    net.apply(room);
    say(`Room ${net.code}: you are ${seatName(net.seat)}. The battery flies the AI seats.`, 'info');
    syncLeaveButtons();
  }
  /* Leaving a running match: Leave room buttons (menu, shop) only show inside a
     room, and ask first in the page, never with a browser dialog. */
  function syncLeaveButtons(): void {
    renderMenu();
    renderShop();
  }
  /* The question is a Preact component (src/ui/leave.tsx); the game says what it
     asks and what each answer does. */
  function renderLeaveVeil(): void {
    const veil = $('leave-veil');
    if (!veil) return;
    drawLeave(veil, {
      keyHint,
      title: 'Leave this room?',
      text: 'Step Out keeps your seat: a drone fires for you when your turn runs out, and Your Games brings you back. '
        + 'Leave gives the seat to the drone battery for good.',
      onStay: closeLeaveVeil,
      onStepOut: () => { closeLeaveVeil(); netStepOut(); },
      onLeave: confirmLeave,
    });
  }
  function openLeaveVeil(): void {
    if (!net.on) return;
    const veil = $('leave-veil');
    if (!veil) return;
    renderLeaveVeil();
    veil.hidden = false;
    const stay = $('leave-stay');
    if (stay && stay.focus) stay.focus();
  }
  function closeLeaveVeil(): boolean {
    const veil = $('leave-veil');
    if (!veil || veil.hidden) return false;
    veil.hidden = true;
    return true;
  }
  function confirmLeave(): void {
    closeLeaveVeil();
    if (net.on) netLeave();
  }
  /* Play again (same room): the room goes back to its lobby for everyone. The
     reply's seats and host draw the lobby at once (the room may have a new
     host), not the match's last ones until the lobby's first poll. */
  async function netAgain(): Promise<void> {
    try {
      const d = await net.post('again', {});
      if (d.room) { net.seats = d.room.seats || []; net.hostSeat = d.room.hostSeat; }
      netBackToLobby();
    } catch (err) { say(prettyRoomError(err), 'bad'); }
  }
  /* The room is in its lobby again: the match poll stops, the lobby shows the
     seats, and the host's Start begins the next match. */
  function netBackToLobby(): void {
    net.toLobby();
    netMatch = false;
    MATCH.out = false; MATCH.outShown = false; MATCH.lastPhase = 'lobby'; MATCH.roundTo = '';
    replay.clear(); MATCH.pendingRoom = null; MATCH.myTurn = false;
    // G.over stays up under the lobby: the last match's tanks must not run the solo turn loop; startNetMatch clears it.
    if ($('end-veil')) $('end-veil')!.hidden = true;
    hideShop();
    void openLobby();
  }
  /* Gives the seat up: the server hears it and this browser forgets it. */
  function netLeave(quiet?: boolean): void {
    const wasOn = net.on;
    const code = net.code;
    net.leave(); // tells the server, stops both polls, clears the session
    seats.forget(code);
    dropRoom();
    if (wasOn && !quiet) {
      say('Back from the room. The battery takes your seat there.', 'info');
      backToTitle();
    }
  }
  /* Steps out: the seat waits in the room (a drone fires for it when its
     turn runs out) and stays in Your games; nobody is told. */
  function netStepOut(quiet?: boolean): void {
    const code = net.code;
    if (code) steppedOut(code, MATCH.myTurn);
    net.detach();
    dropRoom();
    if (!quiet && code) {
      say(`Stepped out of room ${code}. Your seat waits; Your Games brings you back.`, 'info');
      backToTitle();
    }
  }
  /* What leaving and stepping out both clear on this page. */
  function dropRoom(): void {
    netMatch = false;
    replay.clear(); MATCH.pendingRoom = null; MATCH.myTurn = false; MATCH.lastPhase = ''; MATCH.lastTurn = -1; MATCH.lastRound = -1;
    MATCH.out = false; MATCH.outShown = false; MATCH.lastRoom = null;
    END.buttons = 'solo'; END.board = null; END.filed = null;
    hideShop();
    if ($('end-veil')) $('end-veil')!.hidden = true;
    if ($('lobby-veil')) $('lobby-veil')!.hidden = true;
    closeLeaveVeil();
    closeOverlays();
    syncLeaveButtons();
  }
  return {
    renderLobby, setNetDot, loadOccupancy, openLobby, maybeApplyInviteCode, renderLeaveVeil, openLeaveVeil, closeLeaveVeil,
    netLeave, netStepOut, resumeRoom, netAgain, netBackToLobby, netTurnTime, netGone, netWalls,
  };
}
