/* Operation Tankity: a running room match, on this client.
 *
 * The server plays the war; this is the page's half of it. It sends the
 * player's moves (fire, aim, drive, load a gun, buy, Ready), adopts the room
 * snapshot the client library (net.ts) hands over once the replay of the
 * volley before it has played, turns the events into log lines, talk and
 * sounds, steps a room frame, tells the player their turn came while the tab
 * was hidden, and shows the final standings. Joining and leaving a room is
 * lobby.ts. The game's state, the room client and the rest of the game arrive
 * as deps. */
import type { sfx as SfxApi, music as MusicApi } from './audio.ts';
import {
  FOE_DYING, FOE_FIRE, FOE_HIT, FOE_IDLE, TANK_FIRE, TANK_HIT, TANK_IDLE, TANK_OWS, pick,
} from './chatter.ts';
import type { FxSys } from './fx/types.ts';
import type { GameState, GameTank, MatchState, Tables } from './game-types.ts';
import type { HudValues } from './hud.ts';
import { stepArm } from './input.ts';
import type { Input } from './input.ts';
import { prettyRoomError, shouldCatchUp } from './net.ts';
import type { RoomClient } from './net.ts';
import { matchOutcome, roomBoard, roomFiledLine, roomLocalSaver } from './standings.ts';
import type { LocalRow, Saved } from './local-board.ts';
import { focusEndVeil } from './ui/endveil.tsx';
import type { Board, RoomCard } from './standings.ts';
import type { BeamEvent, BurnEvent, DigEvent, EarthEvent, RingEvent, RoomEvent, RoomSnapshot } from './protocol.ts';
import { DIG_STEP, applyEarth, digCarve } from './earth.ts';
import { playDigStep, playEarthOp } from './earth-fx.ts';
import type { EarthFxDeps } from './earth-fx.ts';
import { burnLine, burnSeconds, playBurn } from './fire-fx.ts';
import type { FireFxDeps } from './fire-fx.ts';
import type { Replay, ReplayShot } from './replay.ts';
import { BURIED_LINE, H, ROOM_W, TUNE, aimLimits, beamCarve, buried, carveCrater, clamp, facing, fallSeen, genTerrain, gfxLinger, hashSeed, hillsFrom, mulberry32 } from './sim.ts';
import type { Difficulty, ShopRow } from './sim.ts';
import type { EndState } from './match.ts';
import { turnLabel } from './turn-time.ts';
import { parseSpeed, speedLabel } from './speed.ts';
import { WALL_NAMES, isWallsSetting, parseWalls, wallsLine } from './walls.ts';
import { showTurnNotification } from './notify.ts';

/** What a room match needs from the page and the rest of the game. */
export interface RoomDeps {
  G: GameState;
  $(id: string): HTMLElement | null;
  tables: Tables;
  net: RoomClient;
  MATCH: MatchState;
  HUD: Pick<HudValues, 'runStats'>;
  END: EndState;
  replay: Replay;
  input: Pick<Input, 'held'>;
  sfx: typeof SfxApi;
  music: Pick<typeof MusicApi, 'forRound'>;
  myTank(): GameTank | null;
  seatName(seat: number): string;
  talk(id: string, text: string, force?: boolean): void;
  say(text: string, tone?: string): void;
  closeOverlays(): boolean;
  closePreview(): void;
  decayFx(dt: number): void;
  fallTanks(dt: number): void;
  fxImpact(sys: FxSys | null, key: string, x: number, y: number, r: number): number | undefined;
  fxSpecial(sys: FxSys | null, key: string, name: string, x: number, y: number, ang: number, len?: number): void;
  backToLobby(): void;
  hideShop(): void;
  pumpDialogue(dt: number): void;
  refreshNavHints(): void;
  render(): void;
  renderEndVeil(): void;
  renderHUD(): void;
  renderShop(): void;
  /** The menu shows the room's turn time. */
  renderMenu(): void;
  /** Turn alerts are on in this browser (src/notify.ts). */
  alertsOn(): boolean;
  /** The FF button shows the room's game speed. */
  renderSpeed(): void;
  renderShopReady(): void;
  shownAngle(t: GameTank): number;
  shownPower(t: GameTank): number;
  startBanner(text: string, done?: (() => void) | null): void;
  updateCamera(dt: number): void;
  /** The clouds drift with the wind, wrapping out of the floor view's sight. */
  driftClouds(dt: number): void;
  windText(): string;
  /** Keeps a room match only one human played on this browser's board. */
  saveLocal(level: Difficulty, row: LocalRow): Saved;
}

export function createRoom(deps: RoomDeps) {
  const {
    G, $, tables, net, MATCH, HUD, END, replay, input, sfx, music, myTank, seatName, talk, say, closeOverlays, closePreview,
    backToLobby, decayFx, fallTanks, fxImpact, fxSpecial, hideShop, pumpDialogue, refreshNavHints, render, renderEndVeil, renderHUD, renderShop,
    renderShopReady, renderMenu, alertsOn, renderSpeed, shownAngle, shownPower, startBanner, updateCamera, driftClouds, windText, saveLocal,
  } = deps;
  /* A match only one human played goes on this browser's board, never the server's, once per match. */
  const keeper = roomLocalSaver(saveLocal, () => new Date().toISOString());
  /* A buried tank's drive was refused while the drive key is still held: it is said once. */
  let driveRefused = false;

  const KNOWN_FOES = ['reaper', 'wraith', 'spotter'];
  const FOE_PAINT: Record<string, string> = { reaper: '#ff0000', wraith: '#00ffff', spotter: '#ff00ff' };
  const SEAT_PAINT = ['#ffff00', '#00ff00', '#00ffff', '#ff00ff'];
  // Only the familiar battery drones get speaking lines. Human rivals show up
  // in the radio log instead, so a weird name can never break a portrait.
  function foeTalkId(t: GameTank | null | undefined): string | null {
    if (!t || t.isPlayer) return null;
    return KNOWN_FOES.indexOf(t.id) >= 0 ? t.id : null;
  }
  function netFire(): void {
    if (!MATCH.myTurn) { say('Hold on, not your turn yet.', 'info'); return; }
    closePreview();
    const t = myTank();
    const ang = t ? Math.round(t.angle * 10) / 10 : 60;
    const pow = t ? Math.round(t.power * 10) / 10 : 55;
    talk('tank', pick(TANK_FIRE));
    net.act({ kind: 'fire', angle: ang, power: pow }).catch(err => {
      say(prettyRoomError(err), 'bad');
      sfx.play('warn');
    });
  }
  function netSendAim(): void {
    MATCH.aimDirty = false;
    const t = myTank();
    if (!t || t.hp <= 0) return;
    net.sendQuiet({
      kind: 'aim',
      angle: Math.round(t.angle * 10) / 10,
      power: Math.round(t.power * 10) / 10,
    });
  }
  function netSendDrive(dx: number): void {
    net.sendQuiet({ kind: 'drive', dx: Math.round(dx * 10) / 10 });
  }
  /* Loading a gun is fine on anyone's turn: it only sets what fires next. */
  function netPick(w: string): boolean {
    if (w !== 'shell' && (G.ammo![w] || 0) <= 0) {
      say(`No ${tables.weapons[w]!.name} left in the rack.`, 'info');
      return false;
    }
    G.selected = w;
    sfx.play('click');
    say(`Loaded: ${tables.weapons[w]!.name}.`, 'info');
    renderHUD();
    net.sendQuiet({ kind: 'weapon', weapon: w });
    return true;
  }
  function netBuy(it: ShopRow, qty?: number): void {
    const key = it.kind === 'ammo' ? it.w! : (it.g || it.kind);
    qty = clamp(Math.floor(qty || 1), 1, 9);
    sfx.play('click');
    net.buy(key, qty)
      .then(d => {
        sfx.play('cash');
        say(`Bought ${qty > 1 ? qty + ' × ' : ''}${it.label}.`, 'good');
        G.shopQty = 1;
        net.apply(d.room);
      })
      .catch(err => { say(prettyRoomError(err), 'bad'); sfx.play('warn'); });
  }
  /* The shop button toggles Ready (net.setReady: the wire carries the wanted
     state and the requests go one at a time). */
  function netNext(want?: boolean): void {
    sfx.play('click');
    net.setReady(want);
  }
  /* A room update either lands now or waits behind the replay: the server
     settles a whole turn at once, and clients play it back (aim, flight,
     blasts, damage) before the new state takes over. The client has already
     counted `fresh` (the events past its cursor) as seen. */
  function netOnSnapshot(room: RoomSnapshot, fresh: RoomEvent[], first: boolean): void {
    if (first) {
      // First sync: earlier events are history. Log them, replay nothing.
      // (A resync lands here too: events were lost, so nothing waiting is real.)
      replay.clear(); MATCH.pendingRoom = null;
      digs = []; // a trench from a discarded replay would keep cutting the adopted ground
      G.fire.clear(); // so would the flames of its pools
      netAdopt(room);
      for (const e of fresh) if (e.t !== 'shot' && e.t !== 'burst') netEvent(e);
      return;
    }
    replay.push(fresh);
    if (shouldCatchUp(document.hidden)) netCatchUp();
    if (!replay.idle()) {
      MATCH.pendingRoom = room;
      MATCH.myTurn = false;
      G.phase = 'think';
      return;
    }
    netAdopt(room);
  }
  function netAdopt(room: RoomSnapshot): void {
    net.seats = room.seats || [];
    MATCH.lastRoom = room;
    net.hostSeat = room.hostSeat;
    if (room.map !== undefined) {
      net.map = room.map;
      net.mapName = room.mapName || 'Random hills';
    }
    G.w = ROOM_W; // every room plays a 720 field
    if (Array.isArray(room.terrain) && room.terrain.length === ROOM_W) {
      G.terrain = room.terrain.map(Number);
    } else if (G.terrain.length !== ROOM_W) {
      // The lobby has no ground yet and the demo's was dealt at its own width: a stand-in at the
      // room's width keeps the canvas, the camera and the scenery from drawing a field of the wrong size.
      const stand = genTerrain(mulberry32(hashSeed('room:' + room.code)), ROOM_W);
      G.terrain = stand.terrain;
      G.hills = stand.hills;
    }
    const hills = hillsFrom(room.hills);
    if (hills) G.hills = hills;
    if (!G.clouds.length) {
      for (let i = 0; i < 5; i++) {
        G.clouds.push({ x: Math.random() * ROOM_W, y: 30 + Math.random() * 90, s: 0.6 + Math.random() * 0.9, v: 3 + Math.random() * 5 });
      }
    }
    G.wind = room.wind || 0;
    // The round's walls: the browser's own flights (the aim guide, the camera) fly what the server flies.
    G.walls = parseWalls(room.wallsNow);
    const sameRound = G.round === (room.round || 1);
    // Held fall words belong to this room's round: a new round, or another room, drops them.
    if (!sameRound || heldCode !== net.code) { fallsHeld = []; heldCode = net.code; }
    G.round = room.round || 1;
    const before = new Map(G.tanks.map(t => [t.seat, t] as [number | undefined, GameTank]));
    // While we aim, the server only learns our angle and power when a key is
    // let go: keep the local aim through polls so the barrel never snaps back.
    const aiming = sameRound && room.phase === 'play' && room.turn === net.seat;
    G.tanks = (room.tanks || []).map(t => {
      const mine = t.seat === net.seat;
      const was = before.get(t.seat);
      const seat = net.seats[t.seat];
      const ai = !seat || !seat.human;
      const id = mine ? 'tank' : String(t.name || '?').toLowerCase();
      // The server sets units straight down where they rest; keep drawing one
      // where it was so fallTanks() shows the fall, under a parachute already
      // open (or armed by the replay, or by the snapshot) if it has one.
      const same = !!was && Math.abs(was.x - t.x) < 1;
      const drawnAt = same ? was!.drawY ?? was!.y : t.y;
      const above = drawnAt < t.y - 0.5;
      return {
        id, seat: t.seat, isPlayer: mine,
        color: mine ? '#ffff00' : (ai ? (FOE_PAINT[id] || '#c9c9c9') : SEAT_PAINT[t.seat % SEAT_PAINT.length]!),
        x: t.x, y: t.y, drawY: above ? drawnAt : undefined, vy: same && above ? was!.vy || 0 : 0,
        angle: mine && was && aiming ? was.angle : t.angle,
        power: mine && was && aiming ? was.power : t.power,
        hp: t.hp, maxHp: t.maxHp || 100, fuel: 0, dirS: t.dirS || 1,
        name: t.name,
        human: !ai,
        body: t.body || 'tank',
        menu: !!t.menu,
        bot: !!(seat && seat.bot),
        chuteArmed: same && above && (!!t.chute || !!was!.chuteArmed || !!was!.chuteOpen),
        chuteOpen: same && above && !!was!.chuteOpen,
        shownHp: same && fallsHeld.some(h => 'seat' in h && h.seat === t.seat) ? was!.shownHp : undefined,
        // Keep the drawn aim where it was so the new one glides in.
        showA: was && !mine ? shownAngle(was) : undefined,
        showP: was && !mine ? shownPower(was) : undefined,
      };
    });
    G.turn = Math.max(0, G.tanks.findIndex(t => t.seat === room.turn));
    const mine = myTank();
    // The turn and shop clocks: seconds left as of this snapshot, counted down
    // locally by the client; a turn clock that jumps up is a new turn, which
    // re-arms the 30-second alert.
    net.armClocks(room);
    const wasMyTurn = MATCH.myTurn;
    MATCH.myTurn = room.phase === 'play' && !!mine && mine.hp > 0 && room.turn === net.seat;
    if (MATCH.myTurn && !wasMyTurn) turnAlert();
    if (!G.ammo) G.ammo = { shell: Infinity };
    if (room.you) {
      const a: Record<string, number> = {};
      for (const w of tables.order) {
        const have = room.you.ammo ? room.you.ammo[w] : 0;
        a[w] = have === -1 ? Infinity : (have || 0);
      }
      G.ammo = a;
      if (tables.order.indexOf(room.you.weapon) >= 0) G.selected = room.you.weapon;
      G.cash = room.you.cash || 0;
      G.score = room.you.score || 0;
      G.lives = room.you.lives || 0;
      G.shield = !!room.you.shield;
      G.jammer = room.you.jammer || 0;
      G.bunker = room.you.bunker || 0;
      G.laststand = !!room.you.laststand;
      G.chutes = room.you.chutes || 0;
      G.plate = room.you.plate || 0;
      G.armor = room.you.armor ?? G.armor;
      G.nextOneUp = room.you.nextUp || 3000;
      if (mine) mine.fuel = room.you.fuel || 0;
    }
    keeper.keep(room, net.seat);
    HUD.runStats = `Room ${net.code} · you are ${seatName(net.seat)} · round ${G.round}`;
    if (room.phase !== 'shop') net.dropReadyWish();
    if (room.phase === 'play') {
      // A next match started before this client saw the room go back to its lobby.
      if (MATCH.lastPhase === 'over') { MATCH.out = false; MATCH.outShown = false; }
      // The snapshot says so too: a reload after going out missed the event.
      if (room.you && room.you.lives === 0) MATCH.out = true;
      G.over = false;
      G.phase = MATCH.myTurn ? 'aim' : 'think';
      hideShop();
      // The you're-out and Standings cards stay up until their own button; any other card is last match's.
      if ($('end-veil') && END.buttons !== 'out' && END.buttons !== 'peek') $('end-veil')!.hidden = true;
      if ($('lobby-veil')) $('lobby-veil')!.hidden = true;
      if (MATCH.lastPhase !== 'play' || room.round !== MATCH.lastRound) {
        // A started match takes the whole frame, same as solo: shut the menu
        // the host came through so nobody has to close it with Q mid-battle.
        if (MATCH.lastPhase !== 'play') closeOverlays();
        music.forRound(room.round);
        startBanner(`Round ${room.round}. ${room.mapName || 'Random hills'}.`);
        say(`Round ${G.round}. Wind ${windText()}. ${MATCH.myTurn ? 'Your move. Aim!' : seatName(room.turn!) + ' moves first.'}`, 'info');
        if (MATCH.myTurn) talk('tank', 'tankity tank! My hill now!', true);
      } else if (MATCH.myTurn && MATCH.lastTurn !== net.seat) {
        say('Your move. Aim!', 'info');
      }
      // Out of lives while others fight on: the you're-out card, once.
      if (MATCH.out && !MATCH.outShown && !matchOutcome(room.seats, room.startHumans).over) {
        MATCH.outShown = true;
        roomCard(room, 'out');
      }
    } else if (room.phase === 'shop') {
      G.phase = 'shop';
      if (room.you && room.you.lives === 0) MATCH.out = true;
      // Polls repeat the shop phase; only arriving in it shuts open panels.
      if (MATCH.lastPhase !== 'shop') { closePreview(); closeOverlays(); }
      // Shown first, then drawn: only a laid-out list can bring the
      // highlighted row into view.
      const veil = $('shop-veil');
      if (veil) veil.hidden = false;
      renderShop();
      if (MATCH.lastPhase === 'play') talk('tank', 'Shopping! Then back to bam bam.', true);
    } else if (room.phase === 'over') {
      G.over = true;
      hideShop();
      netShowStandings(room);
    } else if (room.phase === 'lobby') {
      // Someone pressed Play again: the room is back in its lobby.
      if (MATCH.lastPhase && MATCH.lastPhase !== 'lobby') backToLobby();
      return;
    }
    // An open Standings or you're-out card follows the match, not the poll it opened on.
    const endVeil = $('end-veil');
    if (room.phase !== 'over' && endVeil && !endVeil.hidden && (END.buttons === 'peek' || END.buttons === 'out')) roomCard(room, END.buttons);
    MATCH.lastPhase = room.phase;
    MATCH.lastTurn = room.turn;
    MATCH.lastRound = room.round;
    render();
    renderHUD();
  }
  let fellLast: number | null = null; // the seat the last event saw fall: its wreck reads as a fall, not a kill
  /* A fall's words (and its wreck) wait until its unit is seen to land, as a
     solo match's do; its armor bar holds until then. */
  let fallsHeld: RoomEvent[] = [];
  let heldCode: string | null = null;
  function netEvent(e: RoomEvent): void {
    if (!e || !e.t) return;
    if (e.t === 'fall' || (e.t === 'kill' && fallsHeld.some(h => 'seat' in h && h.seat === e.seat))) {
      const t = G.tanks.find(x => x.seat === e.seat);
      if (t && (!fallSeen(G, t) || fallsHeld.some(h => 'seat' in h && h.seat === e.seat))) {
        if (t.shownHp === undefined) t.shownHp = e.t === 'fall' ? t.hp + e.dmg : t.hp;
        fallsHeld.push(e);
        return;
      }
    }
    sayNetEvent(e);
  }
  /* Says the held falls whose units have now been seen to land, in order. */
  function releaseFalls(): void {
    if (!fallsHeld.length) return;
    if (heldCode !== net.code) { fallsHeld = []; return; }
    const keep: RoomEvent[] = [];
    for (const e of fallsHeld) {
      const t = 'seat' in e ? G.tanks.find(x => x.seat === e.seat) : undefined;
      if (!t) continue; // its unit is gone (a new round): nothing to say
      if (!fallSeen(G, t)) { keep.push(e); continue; }
      if (t) t.shownHp = undefined;
      sayNetEvent(e);
    }
    fallsHeld = keep;
  }
  function sayNetEvent(e: RoomEvent): void {
    if (e.t !== 'fall' && e.t !== 'kill') fellLast = null;
    if (e.t === 'shot' || e.t === 'burst' || e.t === 'beam' || e.t === 'ring' || e.t === 'burn' || e.t === 'dirt' || e.t === 'pour' || e.t === 'dig' || e.t === 'riot' || e.t === 'slump') return; // flown by the replay
    if (e.t === 'fizzle') { say(`${seatName(e.by)} sends one into the sunset.`, 'info'); return; }
    // A gunner's tracer line lasts until its next shot.
    if (e.t === 'fire' || e.t === 'aifire' || e.t === 'auto') {
      G.marks.fired(e.seat);
      burning = null;
    }
    if (e.t === 'fire') {
      if (e.seat === net.seat) say(`You fire ${tables.weapons[G.selected] ? tables.weapons[G.selected]!.name : 'a shell'}.`, 'info');
      else say(`${seatName(e.seat)} fires ${tables.weapons[e.w] ? tables.weapons[e.w]!.name : 'a shell'}.`, 'info');
      return;
    }
    if (e.t === 'aifire') {
      const t = G.tanks.find(x => x.seat === e.seat);
      const id = foeTalkId(t);
      if (id) talk(id, pick(FOE_FIRE[id]!));
      say(`${seatName(e.seat)} fires ${tables.weapons[e.w] ? tables.weapons[e.w]!.name : 'a shell'}.`, 'info');
      return;
    }
    if (e.t === 'hit') {
      const victim = e.seat === net.seat;
      const killer = e.by === net.seat;
      if (burning !== null && burning === e.by && !e.direct) {
        // A tick of the pool the gunner lit this volley.
        say(victim ? `The flames burn YOU for ${e.dmg}.` : `The flames burn ${seatName(e.seat)} for ${e.dmg}.`, victim ? 'bad' : killer ? 'good' : 'info');
        if (victim) renderHUD();
        return;
      }
      if (e.direct || victim || killer) {
        say(victim
          ? `${seatName(e.by)} hits YOU for ${e.dmg}.`
          : `${seatName(e.by)} hits ${seatName(e.seat)} for ${e.dmg}${e.direct ? ' (direct!)' : ''}.`,
          victim ? 'bad' : 'info');
      }
      if (victim) {
        sfx.play('clank');
        talk('tank', pick(TANK_OWS));
        const kt = G.tanks.find(x => x.seat === e.by);
        const kid = foeTalkId(kt);
        if (kid) talk(kid, pick(FOE_HIT[kid]!));
      } else if (killer) {
        const vt = G.tanks.find(x => x.seat === e.seat);
        if (foeTalkId(vt)) talk('tank', pick(TANK_HIT));
      }
      return;
    }
    if (e.t === 'fall') {
      fellLast = e.seat;
      const victim = e.seat === net.seat;
      const digger = e.by !== e.seat ? e.by : null;
      if (e.chute) {
        say(victim ? 'Your parachute opens. You float down unhurt.' : `${seatName(e.seat)}'s parachute opens.`, victim ? 'good' : 'info');
      } else if (victim) {
        sfx.play('clank');
        say(e.under
          ? `${digger === null ? 'A falling unit' : `${seatName(digger)}'s dig drops a unit that`} lands on YOU for ${e.dmg}.`
          : `${digger === null ? 'You lose your footing' : `${seatName(digger)} digs out your footing`}: the fall costs ${e.dmg}.`, 'bad');
      } else if (digger === net.seat) {
        say(`${seatName(e.seat)} falls into your crater for ${e.dmg}.`, 'good');
      } else {
        say(`${seatName(e.seat)} falls for ${e.dmg}.`, 'info');
      }
      return;
    }
    if (e.t === 'kill') {
      const victim = e.seat === net.seat;
      sfx.play('boom');
      say(victim
        ? (e.by === net.seat ? 'You got yourself?! The hills are cruel.' : `${seatName(e.by)} wrecks YOU.`)
        : e.by === e.seat && fellLast === e.seat ? `${seatName(e.seat)} fell to their doom.`
          : `${seatName(e.by)} wrecks ${seatName(e.seat)}.`,
        victim ? 'bad' : 'info');
      const vt = G.tanks.find(x => x.seat === e.seat);
      const vid = foeTalkId(vt);
      if (vid && FOE_DYING[vid]) talk(vid, FOE_DYING[vid]!, true);
      if (!victim && e.by === net.seat) talk('tank', pick(TANK_HIT));
      return;
    }
    if (e.t === 'shield') {
      say(e.seat === net.seat ? 'Your shield absorbs the hit!' : `${seatName(e.seat)}'s shield absorbs the hit!`, 'good');
      return;
    }
    if (e.t === 'laststand') {
      sfx.play('boom');
      say(e.seat === net.seat ? 'Your wreck goes down glowing!' : `${seatName(e.seat)} goes down glowing!`, 'info');
      return;
    }
    if (e.t === 'oneup') {
      if (e.seat === net.seat) {
        sfx.play('win');
        say(`1-UP! Extra life! (${e.lives} lives)`, 'good');
        talk('tank', 'Another life! I am basically immortal!', true);
      } else say(`${seatName(e.seat)} earns a 1-up.`, 'info');
      return;
    }
    if (e.t === 'roundwin') {
      MATCH.roundTo = seatName(e.seat);
      if (e.seat === net.seat) {
        sfx.play('win');
        say(`You take round ${e.round}. Winnings paid. Spend them.`, 'good');
      } else say(`${seatName(e.seat)} takes round ${e.round}.`, 'info');
      return;
    }
    if (e.t === 'matchwin') {
      if (e.seat === net.seat) { sfx.play('win'); say(`Last tank standing! +${e.bonus} winner's bonus.`, 'good'); }
      else say(`${seatName(e.seat)} is the last tank standing.`, 'info');
      return;
    }
    if (e.t === 'again') { say(`${seatName(e.seat)} wants another round in this room.`, 'info'); return; }
    if (e.t === 'roundlost') {
      MATCH.roundTo = 'the battery';
      sfx.play('lose');
      say(`Round ${e.round} goes to the battery. Every wrecked player loses a life; restock and roll again.`, 'bad');
      return;
    }
    if (e.t === 'eliminated') {
      if (e.seat === net.seat) {
        MATCH.out = true;
        sfx.play('lose');
        say('The battery got you for good this time.', 'bad');
      } else say(`${seatName(e.seat)} is out of lives.`, 'info');
      return;
    }
    if (e.t === 'join') { say(`${e.name || seatName(e.seat)} rolled into the room.`, 'info'); return; }
    if (e.t === 'left') { say(`${e.name || seatName(e.seat)} left; the battery takes that seat.`, 'info'); return; }
    if (e.t === 'round') {
      G.marks.clear();
      G.earth.clear();
      G.fire.clear();
      digs = [];
      // The snapshot that carried this event names the new round's walls before the replay adopts it.
      const sides = wallsLine(net.wallsNow);
      say(`Round ${e.round}. Fresh barrels, same battery. Wind ${windText()}.${sides ? ` ${sides}.` : ''}`, 'info');
      talk('tank', 'Back in! These hills are mine!', true);
      return;
    }
    if (e.t === 'tactic') { say(`${seatName(e.seat).toUpperCase()} switches to ${e.s} tactics.`, 'info'); return; }
    if (e.t === 'auto') { say(`${seatName(e.seat)} was away, so a drone fired for them.`, 'info'); return; }
    if (e.t === 'turntime') {
      say(`${seatName(e.seat)} set the turn time to ${turnLabel(e.secs)}, from the next turn.`, 'info');
      renderMenu();
      return;
    }
    if (e.t === 'walls') {
      say(`${seatName(e.seat)} set the walls to ${WALL_NAMES[isWallsSetting(e.walls) ? e.walls : 'none']}, from the next round.`, 'info');
      renderMenu();
      return;
    }
    if (e.t === 'speed') {
      say(`${seatName(e.seat)} set the game speed to ${speedLabel(parseSpeed(e.speed))}.`, 'info');
      renderSpeed();
      return;
    }
  }
  /* ---------- room replay ---------- */
  function netBlast(x: number, y: number, r: number, wkey: string): void {
    blastShow(x, y, r, wkey);
    carveCrater(G.terrain, x, y, r, H - 4);
  }
  /* How a blast looks and sounds in a room: the boom, its impact, a shake by its size, the blast disc. */
  function blastShow(x: number, y: number, r: number, wkey: string): void {
    sfx.play('boom');
    const kick = fxImpact(G.fx, wkey, x, y, r);
    // Rooms shake by blast size when the effect sets no shake.
    G.shake = Math.min(1, G.shake + (kick !== undefined ? kick : r >= 70 ? 0.9 : r > 40 ? 0.5 : 0.3));
    G.booms.push({ x, y, r, wkey, t: 0, life: gfxLinger(tables.weapons[wkey]?.gfx) });
  }
  /* A beam the replay reached: drawn along its line and its channel carved
     with the server's own numbers (sim.ts beamCarve), so the hills match. */
  function netBeam(e: BeamEvent): void {
    const r = tables.weapons[e.w]?.radius ?? 0;
    const len = Math.hypot(e.x1 - e.x0, e.y1 - e.y0), ang = Math.atan2(e.y1 - e.y0, e.x1 - e.x0);
    fxSpecial(G.fx, e.w, 'beam', e.x0, e.y0, ang, len);
    const kick = fxImpact(G.fx, e.w, e.x1, e.y1, r);
    G.shake = Math.min(1, G.shake + (kick !== undefined ? kick : 0.15));
    if (r > 0) beamCarve(G.terrain, e.x0, e.y0, e.x1, e.y1, r);
  }
  /* How the earth guns play in a room (earth-fx.ts), as in the solo war. */
  const earthFx: EarthFxDeps = {
    fxImpact: (key, x, y, r) => fxImpact(G.fx, key, x, y, r),
    fxSpecial: (key, name, x, y, ang, len) => fxSpecial(G.fx, key, name, x, y, ang, len),
    sound: name => sfx.play(name),
    shake: k => { G.shake = Math.min(1, G.shake + k); },
    get show() { return G.earth; },
    say: text => say(text, 'info'),
  };
  /* Trenches being cut on screen: each dig event's burrow, a step every 1/60 s from when the replay reached it. */
  let digs: { e: DigEvent; t: number; done: number }[] = [];
  /* An earth gun the replay reached: the client's ground moves exactly as the
     server's did (earth.ts applyEarth, the event's own unrounded numbers), and
     plays as the solo war plays it. A dig cuts its trench step by step
     (netDigs); its warheads come as burst events. */
  function netEarth(e: EarthEvent): void {
    if (e.t === 'dig') {
      playDigStep(e.w, e.x, e.y, Math.atan2(e.uy, e.ux), e.r, 0, tables.weapons[e.w]?.warheads || 0, earthFx);
      digs.push({ e, t: 0, done: 0 });
      return;
    }
    // A dirt gun whose burst does damage (Dirt Charge) bursts as a blast first, with no crater: the boom, its impact and the blast disc.
    const hurt = e.t === 'dirt' && (tables.weapons[e.w]?.dmg || 0) > 0;
    if (hurt) blastShow(e.x, e.y, e.r, e.w);
    const before = G.terrain.slice();
    const span = applyEarth(G.terrain, e);
    playEarthOp(e, G.terrain, before, span.x0, span.x1, earthFx, hurt);
  }
  /* Each trench in progress cuts the steps its time has come to (digCarve
     from its start: carving a step again changes nothing), its dust at the head. */
  function netDigs(dt: number): void {
    for (const d of digs) {
      d.t += dt;
      const upTo = Math.min(d.e.n, Math.floor(d.t * 60));
      if (upTo <= d.done) continue;
      digCarve(G.terrain, d.e.x, d.e.y, d.e.ux, d.e.uy, upTo, d.e.r);
      let x = d.e.x, y = d.e.y;
      for (let i = 1; i <= upTo; i++) {
        x += d.e.ux * DIG_STEP;
        y += d.e.uy * DIG_STEP;
        if (i > d.done) playDigStep(d.e.w, x, y, Math.atan2(d.e.uy, d.e.ux), d.e.r, i, 1, earthFx);
      }
      d.done = upTo;
    }
    digs = digs.filter(d => d.done < d.e.n);
  }
  /* How a napalm pool plays in a room (fire-fx.ts), as in the solo war. */
  const fireFx: FireFxDeps = {
    fxImpact: (key, x, y, r) => fxImpact(G.fx, key, x, y, r),
    fxSpecial: (key, name, x, y, ang, len) => fxSpecial(G.fx, key, name, x, y, ang, len),
    sound: name => sfx.play(name),
    get show() { return G.fire; },
  };
  /* The gunner whose pool burns this volley: its ticks' hits read as burns. */
  let burning: number | null = null;
  /* A napalm pool the replay reached: lit with the server's own numbers, its
     flames standing until its last tick (t1). Nothing in the ground changes. */
  function netBurn(e: BurnEvent): void {
    burning = e.by;
    const col = Math.max(0, Math.min(G.terrain.length - 1, Math.round(e.x)));
    playBurn(e.w, { x: e.x, ground: G.terrain[col] ?? H, level: e.level, x0: e.x0, x1: e.x1, flame: e.flame }, burnSeconds(e, replay.speed()), fireFx);
    const line = burnLine(e, tables.weapons[e.w]?.name || 'napalm', seatName(e.by));
    if (line) say(line, 'info');
  }
  /* A plasma ring around its gunner: no crater. */
  function netRing(e: RingEvent): void {
    sfx.play('boom');
    const kick = fxImpact(G.fx, e.w, e.x, e.y, e.r);
    G.shake = Math.min(1, G.shake + (kick !== undefined ? kick : 0.4));
  }
  /* A tracer in flight (src/marks.ts): its path grows its mark. */
  function netTrailMark(shot: ReplayShot, x: number, y: number): void {
    const mark = tables.weapons[shot.e.w]?.gfx?.mark;
    if (mark === 'line' || mark === 'smoke') G.marks.trail(shot, shot.e.by, shot.e.w, mark, x, y);
  }
  /* A tracer came down: its mark ends where it landed. */
  function netMark(shot: ReplayShot): void {
    netTrailMark(shot, shot.e.x1, shot.e.y1);
    G.marks.land(shot, shot.e.x1, shot.e.y1);
    fxImpact(G.fx, shot.e.w, shot.e.x1, shot.e.y1, MARK_R);
  }
  /** The radius a tracer's landing effect is sized to: it has no blast of its own. */
  const MARK_R = 10;
  /* Your turn while the tab is out of sight: the tab title says so, a soft
     ping plays (unless Sound is off), and a notification pops up when the
     player turned Turn alerts on and the browser allows them. Inside a page on this host that frames the game (a
     site's page around it), that page's title is the tab's, so it changes too.
     Everything resets the moment the tab is seen again. */
  let alertTitles: [Document, string][] | null = null;
  function titleDocs(): Document[] {
    const docs = [document];
    try { if (window.top !== window && window.top!.document) docs.push(window.top!.document); } catch (_) { /* another host */ }
    return docs;
  }
  function turnAlert(): void {
    if (!document.hidden) return;
    if (!alertTitles) {
      alertTitles = titleDocs().map(d => [d, d.title] as [Document, string]);
      for (const [d, t] of alertTitles) d.title = `\u25cf Your turn \u00b7 ${t}`;
    }
    sfx.turnPing();
    const others = net.seats.filter(s => s.human && s.seat !== net.seat).map(s => String(s.name || '').toUpperCase());
    showTurnNotification({ code: net.code, others }, alertsOn(), () => {});
  }
  function clearTurnAlert(): void {
    if (!alertTitles) return;
    for (const [d, t] of alertTitles) d.title = t;
    alertTitles = null;
  }
  /* The room's turn clock (the room's turnSecs): when a human's turn runs out
     a drone fires for them from their rack. Its owner hears an alert with 30
     seconds left; everyone sees the last 10 counted down. */
  function tickTurnClock(): void {
    if (G.phase === 'shop') renderShopReady();
    if (!net.clockWarnDue()) return;
    if (!MATCH.myTurn) return;
    say(`${Math.ceil(net.turnClockLeft()!)} seconds left. Fire, or a drone fires for you.`, 'bad');
    sfx.clockWarn();
  }
  /* Tell the room when this player is in a menu (game menu, help, scores, the
     weapon picker), so the others see why the battle waits on them. The radio
     log is a glance, not a menu. */
  function menuOpen(): boolean {
    return ['menu-overlay', 'help-overlay', 'report-overlay', 'gun-overlay', 'leave-veil'].some(id => { const el = $(id); return el && !el.hidden; });
  }
  function netSyncMenu(): void {
    net.setMenu(menuOpen());
  }
  /* A hidden tab plays nothing (browsers stop its frames), so its replay queue
     piles up. Coming back, or whenever more than one volley is waiting, skip
     all but the newest volley: their log lines still post, and the room state
     that follows carries the craters and armor. If it is already our turn,
     skip them all and hand over the controls at once. */
  function netCatchUp(): void {
    const skipped = replay.catchUp(MATCH.pendingRoom, net.seat);
    if (!skipped) return;
    G.shells = [];
    digs = []; // the skipped volley's trenches: the room state that follows carries its ground
    G.fire.clear();
    for (const e of skipped) netEvent(e);
  }
  if (typeof document.addEventListener === 'function') {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) return;
      clearTurnAlert();
      if (net.on) { netCatchUp(); net.resync(); }
    });
  }
  /* Drive the replay; once nothing is left to play, the waiting room state
     takes over. */
  function netReplay(dt: number): void {
    // A trench is cut at the replay's own pace, so a caught-up volley's warheads never burst ahead of it.
    netDigs(dt * replay.speed());
    replay.step(dt);
    if (replay.idle() && MATCH.pendingRoom) {
      const room = MATCH.pendingRoom;
      MATCH.pendingRoom = null;
      netAdopt(room);
    }
  }
  function netEaseAim(dt: number): void {
    const k = 1 - Math.exp(-dt * 5);
    for (const t of G.tanks) {
      if (t.isPlayer) continue;
      t.showA = t.showA === undefined ? t.angle : t.showA + (t.angle - t.showA) * k;
      t.showP = t.showP === undefined ? t.power : t.showP + (t.power - t.showP) * k;
    }
  }
  /* One frame of a room: `dt` wall seconds, `gdt` the same at the room's
     game speed. The replay, its effects, the falls and the chatter play on
     gdt (a caught-up volley faster still); the player's own aim and drive,
     the clocks, the camera and the clouds keep wall time. */
  function netFrame(dt: number, gdt: number = dt): void {
    netSyncMenu();
    tickTurnClock();
    G.time += dt;
    netEaseAim(dt);
    updateCamera(dt);
    decayFx(gdt);
    fallTanks(gdt);
    releaseFalls();
    driftClouds(dt);
    netReplay(gdt);
    pumpDialogue(gdt);
    G.banterT -= dt;
    if (G.banterT <= 0) {
      G.banterT = 30 + Math.random() * 14;
      if (!G.dlgQ.length && G.dlgT <= 0 && MATCH.myTurn) {
        if (Math.random() < 0.5) talk('tank', pick(TANK_IDLE));
        else {
          const live = G.tanks.filter(t => !t.isPlayer && t.hp > 0 && foeTalkId(t));
          if (live.length) {
            const jab = pick(FOE_IDLE.filter(x => live.some(d => d.id === x[0])));
            if (jab) talk(jab[0], jab[1]);
          } else talk('tank', pick(TANK_IDLE));
        }
      }
    }
    const t = myTank();
    if (t && t.hp > 0 && MATCH.myTurn) {
      const arm = stepArm(input.held, dt, t, facing(t), G.w, aimLimits(tables.weapons[G.selected]));
      t.angle = arm.angle;
      t.power = arm.power;
      if (arm.adjusting || arm.clamped) MATCH.aimDirty = true;
      if (arm.idle && MATCH.aimDirty) netSendAim();
      const driving = input.held.has('driveLeft') || input.held.has('driveRight');
      // A buried tank cannot drive (the server refuses it too): it says so once per press.
      if (driving && buried(t, G.terrain)) {
        if (!driveRefused) say(BURIED_LINE, 'bad');
        driveRefused = true;
        MATCH.driveAcc = 0;
        MATCH.driveT = 0;
      } else if (driving && t.fuel > 0) {
        const dir = input.held.axis('driveLeft', 'driveRight');
        MATCH.driveAcc += dir * TUNE.driveSpeed * dt;
        MATCH.driveT += dt;
        if (MATCH.driveT >= 0.22 && Math.abs(MATCH.driveAcc) >= 4) {
          const dx = clamp(MATCH.driveAcc, -80, 80);
          MATCH.driveAcc = 0;
          MATCH.driveT = 0;
          netSendDrive(dx);
        }
      } else {
        MATCH.driveAcc = 0;
        MATCH.driveT = 0;
      }
      if (!driving) driveRefused = false;
    }
  }
  /* The scoreboard card for a room: match over, you're out, or a look from the menu. */
  function roomCard(room: RoomSnapshot, card: Exclude<RoomCard, 'shop'>): void {
    const board = roomBoard(room, net.seat, card, MATCH.roundTo);
    END.kicker = board.caption;
    END.title = board.title;
    END.text = '';
    END.score = room.you ? `You banked $${room.you.cash || 0} · ${room.you.score || 0} pts` : '';
    END.board = { ...board, caption: '', title: '' };
    END.filed = roomFiledLine(room.you, room.difficulty, keeper.keep(room, net.seat));
    END.buttons = card;
    renderEndVeil();
    const veil = $('end-veil');
    if (veil) {
      const opening = veil.hidden;
      veil.hidden = false;
      refreshNavHints();
      if (opening) focusEndVeil(veil);
    }
  }
  /* Menu → Standings while a room match runs. */
  function openStandings(): void {
    if (!net.on || !MATCH.lastRoom) return;
    roomCard(MATCH.lastRoom, MATCH.out ? 'out' : 'peek');
  }
  function netShowStandings(room: RoomSnapshot): void {
    // The poll keeps running: a Play again from anyone brings this room back to its lobby.
    roomCard(room, 'over');
  }

  /* The shop's scoreboard in a room: everyone's match after the round just ended. */
  function roomShopBoard(): Board | null {
    return MATCH.lastRoom && MATCH.lastRoom.round > 0 ? roomBoard(MATCH.lastRoom, net.seat, 'shop', MATCH.roundTo) : null;
  }

  return {
    netFire, netPick, netBuy, netNext, netOnSnapshot, netEvent, netBlast, netBeam, netRing, netEarth, netBurn, netMark, netTrailMark, netFrame,
    roomShopBoard, openStandings,
  };
}
