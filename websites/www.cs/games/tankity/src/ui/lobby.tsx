/* The game rooms lobby: the intro, the host and join forms with the hills
 * picker, and once in a room the code, invite link, seat grid and Start. The
 * game owns the state (the room, the status line, the picked hills) and hands
 * in a finished view of it; this draws it and reports what the player did. The
 * veil element (#lobby-veil) stays in index.html and the game shows and hides it.
 * The room-code box and the initials boxes (src/ui/initials-picker.tsx, the
 * title card's too) keep what the player typed in the inputs; Host and Join
 * hand it over on submit.
 * Copyright (C) 2026 William Grim
 * SPDX-License-Identifier: GPL-3.0-or-later */
import { render } from 'preact';
import { useLayoutEffect, useRef } from 'preact/hooks';
import { KeyHints, OverlayHead, ScrollKeys, blurThen, useScrollKeep } from './chrome.tsx';
import { InitialsPicker, typedLetters } from './initials-picker.tsx';
import { TurnTime } from './turn-time.tsx';
import { WallsPicker } from './walls.tsx';
import type { WallsSetting } from '../walls.ts';
import { AlertsButton, YourGames } from './games.tsx';
import type { GamesView } from './games.tsx';
import type { KeyHintFn } from './chrome.tsx';

/** One hills tile. The Random tile has the empty id and no profile. */
export interface LobbyMap {
  id: string;
  name: string;
  /** 48 heights, 0..1; absent for the Random tile. */
  profile?: number[];
}

/** One chair as the lobby grid shows it. */
export interface LobbySeat {
  human: boolean;
  /** The player's initials, for a human. */
  name: string;
  /** A non-human seat: the drone battery or no tank at all. */
  mode: 'ai' | 'open' | string;
}

export interface LobbyProps {
  keyHint: KeyHintFn;
  onClose: () => void;
  /** The room server answers: the dot beside the occupancy line. */
  online: boolean;
  /** "n / m matches running · k lobbies open", or empty. */
  count: string;
  /** The status line under the forms. */
  status: string;
  /** In a room the lobby shows only the room; out of one, the intro and forms. */
  inRoom: boolean;
  /** The hills tiles (Random first) and the one picked. */
  maps: LobbyMap[];
  mapId: string;
  /** Paints a tile's silhouette; a null profile is the Random tile. */
  drawMapIcon: (canvas: HTMLCanvasElement, profile: number[] | null) => void;
  /** Changes whenever the maps do, so tiles repaint then and not on every redraw. */
  mapsRev: number;
  /** An invite link's code, put in the Room code box when it arrives. */
  prefillCode: string;
  onPickMap: (id: string) => void;
  /** The player's saved initials, the same set the title card edits. */
  initials: string;
  /** A change puts the saved set back in the initials boxes (the lobby reopening). */
  initialsRev: number;
  /** Why the typed initials cannot be used, or empty. */
  initialsProblem: string;
  /** All three initials boxes hold a letter: the set, uppercase. The game checks it. */
  onInitials: (word: string) => void;
  /** Host and Join hand over what the initials boxes hold, a space for an empty box. */
  onHost: (letters: string) => void;
  onJoin: (code: string, letters: string) => void;
  /** The room, once in one. */
  code: string;
  link: string;
  /** "Hills: Canyon 3". */
  hills: string;
  /** "Drones: Hard (the host's Difficulty)"; empty hides the line. */
  drones: string;
  seats: LobbySeat[];
  /** This player's seat number. */
  mySeat: number;
  /** Only the host starts the match and flips the empty seats. */
  isHost: boolean;
  seatsHint: string;
  /** In a room: who starts the match. */
  roomHint?: string;
  onSeatMode: (seat: number, mode: 'ai' | 'open') => void;
  /** The turn time: the host form's pick, or the room's. */
  turnSecs: number;
  /** The host form's slider moved (before hosting). */
  onTurnForm: (secs: number) => void;
  /** The host moved the room's slider. */
  onTurnRoom: (secs: number) => void;
  /** The room's Walls pick; the host picks. */
  walls: WallsSetting;
  onWallsRoom: (w: WallsSetting) => void;
  /** The rooms this browser sits in (out of a room) and the Turn alerts button (in one). */
  games?: GamesView;
  onCopy: () => void;
  onStart: () => void;
  onLeave: () => void;
}

function MapTile({ map, pressed, draw, rev, onPick }: {
  map: LobbyMap; pressed: boolean; draw: LobbyProps['drawMapIcon']; rev: number; onPick: (id: string) => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => { if (canvas.current) draw(canvas.current, map.id ? map.profile ?? null : null); }, [map.id, rev]);
  return (
    <button type="button" class="unit-choice map-choice" aria-pressed={pressed} data-map={map.id} title={map.name}
      onClick={blurThen(() => onPick(map.id))}>
      <canvas class="map-icon" aria-hidden="true" ref={canvas} />
      <span>{map.name}</span>
    </button>
  );
}

function SeatTile({ seat, index, mySeat, isHost, onMode }: {
  seat: LobbySeat; index: number; mySeat: number; isHost: boolean; onMode: LobbyProps['onSeatMode'];
}) {
  const human = seat.human;
  const open = !human && seat.mode === 'open';
  // The host flips a drone or open seat; every other tile is for looking.
  const flips = isHost && !human;
  const big = human ? String(seat.name || '').toUpperCase() : (open ? 'Open' : 'AI');
  let cap: string;
  if (human) cap = (index === mySeat ? 'You' : 'Player') + (index === 0 ? ' · host' : '');
  else if (flips) cap = open ? 'Tap for AI' : 'Tap for Open';
  else cap = open ? 'Nobody' : 'Drone';
  return (
    <button type="button" class={`unit-choice seat-tile${open ? ' seat-open' : ''}${flips ? '' : ' seat-fixed'}`}
      data-seat={String(index)} data-mode={human ? 'human' : (open ? 'open' : 'ai')}
      aria-disabled={flips ? undefined : 'true'}
      title={human ? `Seat ${index + 1}` : (open ? 'Open seat: no tank' : 'Drone battery seat')}
      onClick={flips ? blurThen(() => onMode(index, open ? 'ai' : 'open')) : undefined}>
      <span class="seat-name">{big}</span>
      <span class="seat-cap">{cap}</span>
    </button>
  );
}

export function Lobby(p: LobbyProps) {
  const card = useRef<HTMLDivElement>(null);
  const joinCode = useRef<HTMLInputElement>(null);
  const initialsField = useRef<HTMLFieldSetElement>(null);
  // An invite link fills the code once; the player may then retype it.
  useLayoutEffect(() => { if (p.prefillCode && joinCode.current) joinCode.current.value = p.prefillCode; }, [p.prefillCode]);
  // The veil scrolls; keep it where the player left it across redraws.
  useScrollKeep(() => card.current?.parentElement);
  return (
    <KeyHints.Provider value={p.keyHint}>
      <div class="card" role="dialog" aria-modal="true" aria-labelledby="lobby-title" ref={card}>
        <OverlayHead kicker="Squad up, no chatter" titleId="lobby-title" title="Game rooms" closeId="lobby-close"
          onClose={p.onClose} navId="nav-lobby" scrollOnly nav={<ScrollKeys line />} />
        <p class="hint" id="lobby-intro" hidden={p.inRoom}>
          Host a room and read the 4-letter code to your friends, or join theirs.
          Everyone plays under their own three initials, set here or on the title card. There is no chat,
          only artillery. Empty seats go to the drone battery. The host sets how long a turn lasts, from
          one minute to a week; when a turn runs out, a drone fires for that player, and closing the tab
          keeps your seat. The host may also pick named hills, like Canyon 3, so the crew can replay a
          favorite without ever seeing its seed.
        </p>
        <p class="hint">
          <span id="net-dot" class={`dot ${p.online ? 'on' : 'off'}`}
            title={p.online ? 'room server: connected' : 'room server: not connected'} />{' '}
          <span id="lobby-count" aria-live="polite">{p.count}</span>
        </p>
        <div class="lobby-initials" id="lobby-initials" hidden={p.inRoom}>
          <InitialsPicker idPrefix="lobby" initials={p.initials} rev={p.initialsRev} onInitials={p.onInitials} fieldRef={initialsField}
            problem={p.initialsProblem} noteId="lobby-initials-note" />
          <p class="hint" id="lobby-initials-note" role="status">{p.initialsProblem}</p>
        </div>
        <div class="lobby-rows" id="lobby-rows" hidden={p.inRoom}>
          <form id="host-form" class="lobby-form" action="#" onSubmit={ev => { ev.preventDefault(); p.onHost(typedLetters(initialsField.current)); }}>
            <span class="map-label" id="lobby-map-label">Hills</span>
            <input type="hidden" id="lobby-map" name="map" value={p.mapId} />
            <div class="unit-picker map-picker" id="lobby-map-picker" role="group" aria-labelledby="lobby-map-label">
              {p.maps.map(m => (
                <MapTile key={m.id} map={m} pressed={p.mapId === m.id} draw={p.drawMapIcon} rev={p.mapsRev} onPick={p.onPickMap} />
              ))}
            </div>
            <TurnTime id="lobby-turn" secs={p.turnSecs} onChange={p.onTurnForm} />
            <button type="submit" id="host-go" class="btn-primary">Host a room</button>
          </form>
          <form id="join-form" class="lobby-form" action="#"
            onSubmit={ev => { ev.preventDefault(); p.onJoin(joinCode.current?.value ?? '', typedLetters(initialsField.current)); }}>
            <label for="join-code">Room code</label>
            <input id="join-code" name="code" type="text" autocomplete="off" spellcheck={false}
              maxLength={4} minLength={4} placeholder="7K2Q" ref={joinCode} />
            <button type="submit" id="join-go" class="btn-primary">Join room</button>
          </form>
        </div>
        <p id="lobby-status" class="hint" aria-live="polite">{p.status}</p>
        {!p.inRoom && p.games && p.games.rows.length > 0 && <YourGames id="lobby-games" {...p.games} />}
        <div id="lobby-room" hidden={!p.inRoom}>
          <p class="room-code" id="lobby-code">{p.code || '····'}</p>
          <p class="hint">Read this code to your friends, or send them the invite link. First seat hosts and starts the match.</p>
          <p class="invite-row">
            <input id="join-link" type="text" readOnly aria-label="Invite link" value={p.link} />
            <button type="button" id="copy-link" title="Copy invite link" onClick={blurThen(p.onCopy)}>
              <svg class="lucide lucide-copy" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
              </svg>
              <span>Copy invite</span>
            </button>
          </p>
          <p class="hint" id="lobby-hills">{p.hills}</p>
          <p class="hint" id="lobby-drones" hidden={!p.drones}>{p.drones}</p>
          <TurnTime id="room-turn" secs={p.turnSecs} disabled={!p.isHost} onChange={p.onTurnRoom} />
          <WallsPicker id="room-walls" pick={p.walls} disabled={!p.isHost} why="the host picks" onPick={p.onWallsRoom} />
          <p class="hint" id="turn-hint">
            A change counts from the next turn. With nobody taking a turn, a room stays open one turn time for
            each player, and at least 10 minutes. When every match slot is taken, a room nobody has played in for
            an hour (or twice its turn time, if less) may be closed to make space for a new match.
          </p>
          <div class="unit-row" role="group" aria-labelledby="seats-label">
            <span class="unit-label" id="seats-label">Seats</span>
            <div class="unit-picker seat-grid" id="lobby-seats">
              {p.seats.map((s, i) => (
                <SeatTile key={i} seat={s} index={i} mySeat={p.mySeat} isHost={p.isHost} onMode={p.onSeatMode} />
              ))}
            </div>
          </div>
          <p class="hint" id="seats-hint">{p.seatsHint}</p>
          <p class="hint" id="room-hint">{p.roomHint ?? ''}</p>
          {p.games && <AlertsButton id="room-alerts" state={p.games.alerts} onClick={p.games.onAlerts} />}
          <div class="acts">
            <button type="button" id="lobby-start" class="btn-primary" style={p.isHost ? undefined : { display: 'none' }}
              onClick={blurThen(p.onStart)}>Start match</button>
            <button type="button" id="lobby-leave" onClick={blurThen(p.onLeave)}>Leave room</button>
          </div>
        </div>
      </div>
    </KeyHints.Provider>
  );
}

/** Draws (or redraws) the lobby into its veil. */
export function renderLobby(container: Element, props: LobbyProps): void {
  render(<Lobby {...props} />, container);
}
