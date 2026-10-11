/* Operation Tankity: getting into and out of a room.
 *
 * The lobby overlay (src/ui/lobby.tsx) and what stands behind it: checking
 * the initials, the room server's dot and occupancy, the hills picker, hosting
 * and joining, the roster while the room waits, the invite link, starting the
 * match, the question before leaving one, leaving it, and a rematch on the
 * same hills. A running match is room.ts. The game's state, the room client
 * and the rest of the game arrive as deps. */
import type { sfx as SfxApi } from './audio.js';
import type { GameState, MatchState } from './game-types.js';
import type { HudValues } from './hud.js';
import type { EndState } from './match.js';
import { inviteUrl, prettyRoomError } from './net.js';
import type { RoomClient } from './net.js';
import type { RoomEvent, RoomSnapshot } from './protocol.js';
import type { Replay } from './replay.js';
import type { ScoresState } from './scores.js';
import type { KeyHintFn } from './ui/chrome.js';
import { drawMapIcon } from './ui/icons.js';
import { renderLeave as drawLeave } from './ui/leave.js';
import { renderLobby as drawLobby } from './ui/lobby.js';
import type { LobbySeat } from './ui/lobby.js';

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
  seats: LobbySeat[];
  mySeat: number;
  isHost: boolean;
  seatsHint: string;
}

/** The slice of the game's state getting into a room touches (game.js's G). */
export type LobbyState = Pick<GameState, 'body' | 'demo' | 'over'>;

/** What the lobby needs from the page and the rest of the game. */
export interface LobbyDeps {
  G: LobbyState;
  $(id: string): HTMLElement | null;
  net: RoomClient;
  MATCH: MatchState;
  HUD: Pick<HudValues, 'online'>;
  END: EndState;
  SCORES: { formHidden: boolean };
  replay: Replay;
  sfx: Pick<typeof SfxApi, 'play'>;
  unlock(): void;
  say(text: string, tone?: string): void;
  keyHint: KeyHintFn;
  askNotifications(): void;
  netEvent(e: RoomEvent): void;
  seatName(seat: number): string;
  closeLobbyVeil(): boolean;
  closeOverlays(): boolean;
  closePreview(): void;
  endTutorial(seen: boolean): void;
  freshMatchFromSeedBox(opts?: { tut?: boolean }): void;
  hideShop(): void;
  paintHud(): void;
  refreshNavHints(): void;
  renderEndVeil(): void;
  renderMenu(): void;
  renderScoresOverlay(): void;
  renderShop(): void;
}

export function createLobby(deps: LobbyDeps) {
  const {
    G, $, net, MATCH, HUD, END, SCORES, replay, sfx, unlock, say, keyHint, askNotifications, netEvent, seatName, closeLobbyVeil,
    closeOverlays, closePreview, endTutorial, freshMatchFromSeedBox, hideShop, paintHud, refreshNavHints, renderEndVeil, renderMenu,
    renderScoresOverlay, renderShop,
  } = deps;

  /* ---------- game rooms: server-hosted multiplayer ---------- */
  // The clean-initials rule mirrors rooms.php (which borrows it from the cylon
  // game): an exact-3 uppercase block list, compared uppercase, while any letter
  // case may play.
  const BLOCKED_INITIALS = [
    'ASS',
    'FUK', 'FUC', 'FCK', 'FUX', 'FUQ',
    'SHT', 'SHI',
    'DIK', 'DIC', 'DCK',
    'COK', 'COC', 'COQ',
    'CUM', 'JIZ',
    'CNT', 'PUS', 'VAG', 'CLT',
    'SEX', 'XXX', 'TIT',
    'FAG', 'FGT',
    'NIG', 'NGR',
    'WTF', 'FFS',
    'POO', 'PEE',
    'KKK',
  ];
  function netValidInitials(raw: unknown): string | null {
    const s = String(raw || '').trim();
    if (!/^[A-Za-z]{3}$/.test(s)) return null;
    if (BLOCKED_INITIALS.indexOf(s.toUpperCase()) >= 0) return null;
    return s;
  }
  /* The lobby is a Preact component (src/ui/lobby.tsx). This is everything it
     shows that the game decides: the status line, the occupancy count, the
     server dot, the picked hills, an invite's code, and the room as last drawn
     (code, link, hills, seats). The initials and code boxes stay the page's own. */
  const LOBBY: LobbyView = {
    status: '', count: '', online: false, inRoom: false, mapId: '', mapsRev: 0, prefill: '',
    code: '', link: '', hills: 'Hills: Random hills', seats: [], mySeat: 0, isHost: false, seatsHint: '',
  };
  function lobbySay(text: string): void {
    LOBBY.status = text;
    renderLobby();
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
      maps: [{ id: '', name: 'Random hills' }, ...net.maps],
      mapId: LOBBY.mapId,
      drawMapIcon,
      mapsRev: LOBBY.mapsRev,
      prefillCode: LOBBY.prefill,
      onPickMap: id => { LOBBY.mapId = id; mapChosen(); },
      onHost: raw => {
        const v = netValidInitials(raw);
        if (!v) { lobbySay('Initials need exactly 3 letters, and keep them clean.'); return; }
        unlock(); sfx.play('click');
        hostRoom(v, LOBBY.mapId);
      },
      onJoin: (rawCode, raw) => {
        const code = rawCode.trim().toUpperCase();
        const v = netValidInitials(raw);
        if (!/^[A-Z0-9]{4}$/.test(code)) { lobbySay('Room codes are 4 letters or digits. Read it back and retry.'); return; }
        if (!v) { lobbySay('Initials need exactly 3 letters, and keep them clean.'); return; }
        unlock(); sfx.play('click');
        joinRoom(code, v);
      },
      code: LOBBY.code,
      link: LOBBY.link,
      hills: LOBBY.hills,
      seats: LOBBY.seats,
      mySeat: LOBBY.mySeat,
      isHost: LOBBY.isHost,
      seatsHint: LOBBY.seatsHint,
      onSeatMode: netSeatMode,
      onCopy: copyInvite,
      onStart: () => { sfx.play('click'); startRoom(); },
      onLeave: () => { netLeave(); openLobby(); },
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
    if (!net.code || net.seat !== 0 || net.on) return;
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
    if (data.ok && data.rooms) LOBBY.count = `${data.rooms.used} / ${data.rooms.max} rooms occupied`;
    renderLobby();
    return !!(data.ok && data.rooms);
  }
  async function openLobby(): Promise<void> {
    closePreview();
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
  async function hostRoom(initials: string, mapId?: string | null): Promise<void> {
    askNotifications(); // for the turn alert while this tab is hidden
    lobbySay('Raising the flag…');
    MATCH.initials = initials;
    try {
      await net.host(initials, mapId || '', G.body);
      say(`Room ${net.code} hosted. Read the code to your friends.`, 'info');
      await netRefreshRoster();
      loadOccupancy();
      netLobbyWatch();
    } catch (err) { lobbySay(prettyRoomError(err)); }
  }
  async function joinRoom(code: string, initials: string): Promise<void> {
    askNotifications(); // for the turn alert while this tab is hidden
    lobbySay('Knocking…');
    MATCH.initials = initials;
    try {
      await net.join(code, initials, G.body);
      say(`Joined room ${net.code} as ${initials}.`, 'info');
      await netRefreshRoster();
      netLobbyWatch();
    } catch (err) { lobbySay(prettyRoomError(err)); }
  }
  async function netRefreshRoster(): Promise<void> {
    let room: RoomSnapshot | null = null;
    try {
      room = await net.getState();
      net.seats = room.seats || [];
    } catch (err) { /* roster fills in on the next tick */ }
    netRenderRoster(room);
  }
  /* The newest lobby event already told, per room: the match starts its event
     cursor there, so its first sync never repeats who rolled in or left. */
  const lobbyTold = { code: '', seq: 0 };
  function netLobbyWatch(): void {
    if (lobbyTold.code !== net.code) { lobbyTold.code = net.code; lobbyTold.seq = 0; }
    net.watchLobby(
      () => { const veil = $('lobby-veil'); return !!veil && !veil.hidden; },
      room => {
        net.seats = room.seats || [];
        // Arrivals (not our own) and departures, each told once.
        for (const e of room.events || []) {
          if ((e.seq || 0) <= lobbyTold.seq || (e.t !== 'join' && e.t !== 'left')) continue;
          lobbyTold.seq = e.seq || 0;
          if (e.t === 'left' || e.seat !== net.seat) netEvent(e);
        }
        netRenderRoster(room);
        if (room.phase && room.phase !== 'lobby') startNetMatch(room);
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
  /* A friend arriving on ?code=XXXX lands with the code already filled in. */
  function maybeApplyInviteCode(): void {
    if (typeof location === 'undefined' || !location.search) return;
    const m = /[?&]code=([A-Za-z0-9]{4})/.exec(location.search);
    if (!m) return;
    LOBBY.prefill = m[1]!.toUpperCase();
    renderLobby();
    openLobby();
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
    LOBBY.seats = ((room && room.seats) || net.seats || []).map(s => ({ human: !!s.human, name: String(s.name || ''), mode: s.mode }));
    LOBBY.mySeat = net.seat;
    LOBBY.isHost = net.seat === 0;
    LOBBY.seatsHint = net.seat === 0
      ? 'Tap a seat nobody holds to switch it between AI and Open. Open seats field no tank.'
      : 'The host decides which empty seats are AI and which stay open.';
    lobbySay(net.seat === 0 ? 'You host. Start when your crew is in.' : 'Hang tight. The host starts the match.');
  }
  /* The host flips a seat nobody holds between the drone battery and open. */
  async function netSeatMode(seat: number, mode: 'ai' | 'open'): Promise<void> {
    if (net.seat !== 0 || net.on) return;
    try {
      const d = await net.post('seatmode', { seat, mode, since: net.since });
      net.seats = d.room.seats || [];
      netRenderRoster(d.room);
    } catch (err) { lobbySay(prettyRoomError(err)); }
  }
  async function startRoom(): Promise<void> {
    if (net.seat !== 0) return;
    lobbySay('Rolling out…');
    try {
      const data = await net.post('start', {});
      startNetMatch(data.room);
    } catch (err) { lobbySay(prettyRoomError(err)); }
  }
  function startNetMatch(room: RoomSnapshot): void {
    endTutorial(false);
    G.demo = false;
    // On, the event cursor past what the lobby already told, the lobby poll off and the match poll on.
    net.beginMatch(lobbyTold.code === net.code ? lobbyTold.seq : 0);
    MATCH.lastPhase = '';
    MATCH.lastRound = -1;
    replay.clear(); MATCH.pendingRoom = null;
    MATCH.aimDirty = false;
    G.over = false;
    SCORES.formHidden = true;
    renderScoresOverlay();
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
      text: 'The drone battery takes your seat and the match goes on without you. You head back to the solo hills.',
      onStay: closeLeaveVeil,
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
  function netLeave(quiet?: boolean): void {
    const wasOn = net.on;
    net.leave(); // tells the server, stops both polls, clears the session
    END.rematch = null;
    END.backToRooms = false;
    renderEndVeil();
    replay.clear(); MATCH.pendingRoom = null; MATCH.myTurn = false; MATCH.lastPhase = ''; MATCH.lastTurn = -1; MATCH.lastRound = -1;
    SCORES.formHidden = false;
    renderScoresOverlay();
    hideShop();
    if ($('end-veil')) $('end-veil')!.hidden = true;
    if ($('lobby-veil')) $('lobby-veil')!.hidden = true;
    closeLeaveVeil();
    closeOverlays();
    syncLeaveButtons();
    if (wasOn && !quiet) {
      say('Back to the solo hills. The battery takes your seat in the room.', 'info');
      freshMatchFromSeedBox();
    }
  }
  async function netRematch(): Promise<void> {
    // Same hills again, decided entirely server side: the map id reselects the
    // hidden seed, and no seed string ever crosses the wire.
    const initials = MATCH.initials;
    const map = net.map;
    if (!netValidInitials(initials)) {
      say('No callsign kept for the rematch. Rejoin from the lobby.', 'bad');
      openLobby();
      return;
    }
    netLeave(true);
    openLobby();
    await hostRoom(initials, map || '');
    if (map) { LOBBY.mapId = map; renderLobby(); }
  }

  return {
    renderLobby, setNetDot, loadOccupancy, openLobby, maybeApplyInviteCode, renderLeaveVeil, openLeaveVeil, closeLeaveVeil,
    netLeave, netRematch,
  };
}
