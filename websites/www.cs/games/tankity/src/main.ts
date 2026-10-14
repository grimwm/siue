/* Operation Tankity: Scorched Earth.
 * Turn-based artillery across destructible hills. You and the drone battery
 * trade shells: angle, power, wind, craters. Last one rolling wins the round.
 * Controls: hold ←/→ = angle · hold ↑/↓ = power · Shift+←/→ = drive ·
 * Space or Ctrl = fire · G = weapons · Q = menu · N = next round / new match.
 */
/* The page's entry module: it builds the game's state, wires the typed modules
 * together and runs the main loop. Everything else is in a module,
 * bundled into dist/main.js:
 *   sim.ts       the game math (RNG, terrain, flight, hits, blasts)
 *   ai.ts        the drone AI
 *   flow.ts      the solo phase moves
 *   net.ts       the room client
 *   replay.ts    the room volley replay
 *   preview.ts   the firing-range simulation
 *   input.ts     the keys and touch pads
 *   audio.ts     the sound
 *   render.ts    the canvas drawing
 *   effects.ts   weapon looks on the particle engine
 *   chatter.ts   the crew's talk and the radio log
 *   match.ts     the solo match: rounds, turns, blasts, the drone's shot
 *   room.ts      a running room match on this client
 *   lobby.ts     getting into and out of a room
 *   seats.ts     the room seats this browser holds
 *   games.ts     Your games: those rooms, watched for your turn
 *   notify.ts    opt-in turn alerts as browser notifications
 *   turn-time.ts a room's turn time and its clocks
 *   shop.ts      the field shop
 *   guns.ts      the weapon picker
 *   hud.ts       the status bar's values
 *   view.ts      the camera and the frame the canvas paints
 *   tutorial.ts  the coach
 *   scores.ts    the high scores
 *   menu.ts      the game menu's settings
 * The overlays are Preact components in src/ui/: they take state and callbacks
 * as props and keep none of their own. Each typed module is a factory
 * (createShop, createMatch, ...) that takes the pieces of the game it needs as
 * a deps object, so none of them reaches for a global; the wiring is below.
 * What stays here is the state, the main loop, the keys and the page's own
 * plumbing (overlays, the firing range, the arsenal's loading). */
import { BURIED_LINE, ROOM_W, TUNE, aimLimits, buried, clamp, buildArsenal as simBuildArsenal, surfY as simSurfY, facing, spotTaken as simSpotTaken } from './sim.ts';
import {
  initAudio, sfx, music, unlock, noteGesture, isSoundMuted, setSoundMuted, isMusicMuted, setMusicMuted,
} from './audio.ts';
import type { AudioConfig } from './audio.ts';
import { RoomClient, prettyRoomError } from './net.ts';
import { SOLO_STEP, WAR_REST, runFixed, warSpeed } from './flow.ts';
import type { HoldCommand } from './input.ts';
import { createPreview, stepPreview } from './preview.ts';
import { createReplay } from './replay.ts';
import { createMarks } from './marks.ts';
import { createEarthShow } from './earth-show.ts';
import { createFireShow } from './fire-show.ts';
import { createFieldWidth } from './field.ts';
import { createInput, touchOnly, stepArm } from './input.ts';
import { renderHelp } from './ui/help.tsx';
import { drawShellIcon as paintShellIcon, drawGearIcon as paintGearIcon } from './ui/icons.ts';
import { createChatter, pick, TANK_IDLE, FOE_IDLE } from './chatter.ts';
import { createEffects, FX, FX_BUDGET } from './effects.ts';
import { SHELL_ROW, ammoSub, createShop } from './shop.ts';
import { createHud } from './hud.ts';
import { createView } from './view.ts';
import { createTutorial } from './tutorial.ts';
import { createGuns } from './guns.ts';
import { createScores } from './scores.ts';
import { createMatch } from './match.ts';
import { createRoom } from './room.ts';
import { createLobby } from './lobby.ts';
import { createMenu } from './menu.ts';
import { createTitle } from './title.ts';
import { difficultySetting } from './difficulty.ts';
import { initialsPref } from './initials.ts';
import { createSeatStore } from './seats.ts';
import { createGamesWatch, roomOnScreen } from './games.ts';
import { createToastQueue } from './toasts.ts';
import { createOnScreen, ON_SCREEN_BEAT_MS } from './on-screen.ts';
import type { ChannelLike } from './on-screen.ts';
import type { LiveRow } from './games.ts';
import { alertsPref, askNotify, notifyPermission, showTurnNotification } from './notify.ts';
import { renderToasts } from './ui/toast.tsx';
import type { AlertsState, GamesView } from './ui/games.tsx';
import { browserStorage, browserTimers } from '../../_kit/ports.browser.ts';
import { createTrackToast, trackToastText } from './track-toast.ts';
import { exitApp, enterFullscreen, browserAppEnv, EXIT_HINT, holdEscape, topKeyLock } from '../../_kit/app.ts';
import { pref, text } from '../../_kit/prefs.ts';
import { ROTATE_HINT_KEY, rotateHintShows } from './rotate-hint.ts';
import { renderRotateHint } from './ui/rotate-hint.tsx';
import type { Arsenal, Weapon, Gear } from './sim.ts';
import type { GameState, GameTank, MatchState } from './game-types.ts';
import type { PreviewEnv } from './preview.ts';
import type { RoomEnv } from './net.ts';
import type { FxSetData, FxSys } from './fx/types.ts';

function $<T extends HTMLElement = HTMLElement>(id: string): T | null {
  return document.getElementById(id) as T | null;
}

/* Keys and touch live in src/input.ts: it holds the key table (game.yaml's keys
// section, served as game.json, with a frozen fallback), turns a key press or a
// held pad button into a named command, and runs the held-key arm movement.
// This file says what each command does (bindKeys below). */

/* Phones and tablets: a touch screen with no mouse or trackpad. They get no
// keyboard at all, so key bindings stay off and no label names a key. */
const TOUCH = touchOnly(typeof window.matchMedia === 'function' ? q => window.matchMedia(q) : undefined);
const input = createInput({ touch: TOUCH });

/* ---------- audio: lives in src/audio.ts ---------- */
const trackToastHost = $('track-toast');
const trackToast = trackToastHost ? createTrackToast(trackToastHost, browserTimers) : null;
music.onTrackStart((t, cause) => {
  say(`Now playing: ${t.title || t.file}${t.credit ? ` (${t.credit})` : ''}.`, 'info');
  if (cause === 'next' && trackToast) trackToast.show(trackToastText(t));
});

/* ---------- weapons ---------- */
/* The arsenal lives in game.yaml (served as game.json), not here: ballistics,
// prices, packs, unlock rounds, AI access, blurbs, and paint jobs all come
// from that file so adding a shell never touches this code. Until it arrives
// (or when it cannot, e.g. file:// play), this baked fallback, shaped like
// game.json's arsenal section, keeps the war rolling. */
/* game.json's arsenal section. */
interface ArsenalData { ammo?: Weapon[]; gear?: Gear[] }
/* game.json as the page reads it; each part may be missing. */
interface GameConfig { effects?: Record<string, FxSetData>; arsenal?: ArsenalData; keys?: unknown; audio?: AudioConfig }
const FALLBACK_ARSENAL: ArsenalData = {
  ammo: [
    { key: 'shell', name: 'Shell', cat: 'Shells', dmg: 34, radius: 26, price: 0, pack: 0, minRound: 1, ai: true, aiRound: 1, effect: 'shot', speed: 1.0, note: 'Free, straight, honest.', gfx: { shell: '#ffe27a', trail: '#ffd75e', blast: ['#ffb13c', '#fff3c4'], painter: 'disc', shake: 0.3 } },
    { key: 'buck', name: 'Buckshot', cat: 'Shells', dmg: 17, radius: 20, price: 80, pack: 2, minRound: 1, ai: true, aiRound: 2, effect: 'pellets', pellets: 3, spread: 0.10, speed: 1.0, note: 'Three pellets, forgiving aim.', gfx: { shell: '#ffd166', trail: '#ffb13c', blast: ['#ffb13c', '#fff3c4'], painter: 'disc', shake: 0.3 } },
    { key: 'mortar', name: 'Mortar', cat: 'Shells', dmg: 56, radius: 42, price: 200, pack: 2, minRound: 1, ai: true, aiRound: 3, effect: 'shot', speed: 1.0, note: 'Big crater, slow shell.', gfx: { shell: '#ff9f43', trail: '#ff7b39', blast: ['#ff7b39', '#ffe27a'], painter: 'disc', shake: 0.5 } },
    { key: 'rail', name: 'Rail', cat: 'Shells', dmg: 56, radius: 15, price: 140, pack: 2, minRound: 1, ai: true, aiRound: 5, effect: 'shot', flat: true, speed: 1.0, note: 'Flies fast and nearly flat.', gfx: { shell: '#9fd8ff', trail: '#9fd8ff', blast: ['#9fd8ff', '#ffffff'], painter: 'beam', shake: 0.3 } },
    { key: 'nuke', name: 'NUKE', cat: 'Shells', dmg: 95, radius: 70, price: 500, pack: 1, minRound: 4, ai: false, aiRound: 99, effect: 'shot', speed: 1.0, note: 'Levels whole hillsides.', gfx: { shell: '#ff6b6b', trail: '#ff6b6b', blast: ['#ff6b6b', '#fff3c4'], painter: 'disc', shake: 0.9 } },
  ],
  gear: [
    { key: 'repair', name: 'Repair +40 armor', cat: 'Hull and fuel', price: 120, n: 40, effect: 'repair', note: 'Restores up to 40 armor, never past max.' },
    { key: 'fuel', name: 'Fuel +60', cat: 'Hull and fuel', price: 60, n: 60, effect: 'fuel', note: 'Adds 60 driving fuel.' },
  ],
};
let ARSENAL: Arsenal | null = null; // the same tables, as the sim takes them
let WEAPONS: Arsenal['weapons'] = {};
let WORDER: Arsenal['order'] = [];
let SHOP: Arsenal['shop'] = [];
let GEAR: Arsenal['gear'] = {};
let ARSENAL_REV = 0; // counts arsenal rebuilds; the shop repaints its icons when it changes
/* The icons draw what they are handed (src/ui/icons.ts); these look the weapon or trick up by key. */
const drawShellIcon = (cv: HTMLCanvasElement, wkey: string): void => paintShellIcon(cv, WEAPONS[wkey]);
const drawGearIcon = (cv: HTMLCanvasElement, gkey: string): void => paintGearIcon(cv, GEAR[gkey]);
function buildArsenal(data: ArsenalData | null | undefined): boolean {
  const a = simBuildArsenal(data);
  if (!a) return false;
  ARSENAL_REV++;
  ARSENAL = a; WEAPONS = a.weapons; WORDER = a.order; SHOP = a.shop; GEAR = a.gear;
  G.shopSel = clamp(G.shopSel || 0, SHELL_ROW, SHOP.length - 1);
  return true;
}
function applyArsenal(data: ArsenalData | null | undefined): void {
  if (data && Array.isArray(data.ammo) && data.ammo.length && buildArsenal(data)) {
    say(`Arsenal loaded: ${WORDER.length} shells, ${Object.keys(GEAR).length} tricks.`, 'info');
    if (G.phase === 'shop') renderShop();
    renderHUD();
  }
}
/* One file feeds the client: arsenal, keys, audio and effects all come from
   game.json (written from game.yaml). Any part that is missing or fails
   leaves that part's baked fallback in charge. */
async function loadGameConfig(): Promise<void> {
  try {
    const res = await fetch('game.json', { headers: { Accept: 'application/json' } });
    if (!res.ok) return;
    const data: GameConfig | null = await res.json();
    if (!data) return;
    installEffects(data.effects);
    applyArsenal(data.arsenal);
    applyKeys(data.keys);
    initAudio(data.audio);
  } catch (_) { /* the baked fallbacks keep the war rolling */ }
}

/* ---------- state ---------- */
/* Typed non-null for the modules, but null until the first match is dealt
   (startDemo in init); every reader that can run earlier checks first (view.ts
   skips painting, the frame loop waits on G.terrain). */
const NOT_DEALT = null!;
const G: GameState = {
  seed: '', difficulty: 'normal', rng: NOT_DEALT, body: 'tank',
  terrain: NOT_DEALT, clouds: [],
  tanks: [], turn: 0, phase: 'aim', // banner | shop | aim | think | fly | settle | over (src/flow.ts)
  thinkT: 0, settleT: 0,
  shells: [], parts: [], booms: [], fx: null, marks: createMarks(), earth: createEarthShow(), fire: createFireShow(),
  wind: 0, round: 1, firstTurn: 0,
  lives: TUNE.lives, score: 0, cash: 0, nextOneUp: TUNE.oneUpEvery,
  rounds: [], roundStart: { score: 0, cash: 0 },
  roundsWon: 0, ammo: null, selected: 'shell',
  shopSel: 0, shopQty: 1,
  fuelBank: 0, armor: TUNE.playerArmor,
  plate: 0, shield: false, jammer: 0, bunker: 0, laststand: false, chutes: 0,
  time: 0, shake: 0,
  dlgQ: [], dlgT: 0, lastTalk: -99, banterT: 30, bannerT: 0, bannerDone: null,
  w: ROOM_W, hills: null, cam: { z: 1, cx: ROOM_W / 2, cy: 230 },
  over: false, won: false,
  tactics: {}, demo: false, demoHint: false, watchTurns: 0, preview: null,
};
/* Tables start from the baked fallback (G exists from here on); the file
// arsenal replaces them the moment it arrives. */
buildArsenal(FALLBACK_ARSENAL);
/* The arsenal tables as the typed modules read them (src/game-types.ts). They are replaced when
   game.json arrives, so each property reads the live variable. */
const tables = {
  get arsenal() { return ARSENAL; },
  get weapons() { return WEAPONS; },
  get order() { return WORDER; },
  get shop() { return SHOP; },
  get gear() { return GEAR; },
  get rev() { return ARSENAL_REV; },
};
/* Weapon looks (src/effects.ts): muzzle flashes, trails, blasts. */
const { fxSet, installEffects, fxMuzzle, fxImpact, fxSpecial, fxTrail, fxPreload } = createEffects({ G, tables });
G.fx = FX ? FX.createSystem({ max: FX_BUDGET }) : null;
/* What the crew says (src/chatter.ts): the trash-talk queue and the radio log. */
const { talk, exchange, pumpDialogue, say, renderLogOverlay } = createChatter({
  G, $, keyHint, toggleOverlay, refreshNavHints, placeLogBelowStatus,
});
const me = () => G.tanks[0]!;
const alive = () => G.tanks.filter(t => t.hp > 0);
const foesAlive = () => G.tanks.filter(t => !t.isPlayer && t.hp > 0);

function surfY(x: number): number {
  return simSurfY(G.terrain, x);
}

/* ---------- reading the state ---------- */
function cur(): GameTank {
  return G.tanks[G.turn]!;
}
function spotTaken(t: GameTank, x: number): boolean {
  return simSpotTaken(G.tanks, t, x);
}
/* The help is a Preact component too (src/ui/help.tsx), drawn into the section
   in the page; it redraws when the key table changes. */
function renderHelpOverlay(): void {
  const section = $('help-overlay');
  if (section) renderHelp(section, { keyHint, onClose: () => toggleOverlay('help-overlay', 'btn-help') });
}

/* ---------- firing range: a live mini demo sharing the real ballistics ---------- */
/* The demo itself is src/preview.ts; this is its environment, and the opening
 * and closing of its veil. */
const previewEnv: PreviewEnv<FxSys> = {
  weapon: key => WEAPONS[key],
  muzzle: (sys, wkey, x, y, ang) => fxMuzzle(sys, wkey, x, y, ang),
  impact: (sys, wkey, x, y, r) => { fxImpact(sys, wkey, x, y, r); },
  special: (sys, wkey, name, x, y, ang, len) => fxSpecial(sys, wkey, name, x, y, ang, len),
  trail: (sys, shell, dt) => fxTrail(sys, shell, dt),
  showResult: text => {
    const pr = $('preview-result');
    if (pr) pr.textContent = text;
  },
};
function openPreview(wkey: string): void {
  const w = WEAPONS[wkey];
  if (!w) return;
  G.preview = createPreview(wkey, previewEnv, FX ? FX.createSystem({ max: 260 }) : null,
    document.getElementById('preview-stage'));
  const pr = $('preview-result');
  if (pr) pr.textContent = '';
  const title = $('preview-title');
  if (title) title.textContent = w.name;
  // What the gun does, as its shop row says it (a blast doubles on a direct hit; a beam, a ring, a tracer and the earth guns say what they do instead).
  const stats = $('preview-stats');
  if (stats) stats.textContent = w.effect === 'pellets' && w.pellets
    ? `${w.dmg}×${w.pellets} damage, blast ${w.radius}. Direct hits count double.` : ammoSub({ ...w, note: undefined });
  const veil = $('preview-veil');
  if (veil) veil.hidden = false;
  refreshNavHints();
  sfx.play('click');
}
function closePreview(): void {
  if (G.preview && G.preview.fx) G.preview.fx.clear();
  G.preview = null;
  const veil = $('preview-veil');
  if (veil) veil.hidden = true;
}
function togglePreview(): void {
  if (G.preview) closePreview();
  else openPreview(G.selected);
}


/* ---------- main loop ---------- */
let lastT = 0;
let warAcc = WAR_REST;
/* A buried tank's drive was refused while the drive key is still held: it is said once. */
let driveRefused = false;
function frame(ts: number): void {
  requestAnimationFrame(frame);
  // The music watchdog re-pins a wedged scheduler to the live clock; it never
  // tears the timer down (see audio.ts).
  music.watchdog();
  const dt = Math.min(0.05, (ts - lastT) / 1000 || 0.016);
  lastT = ts;
  // The firing range runs on its own, even over the pre-match shop.
  if (G.preview) stepPreview(G.preview, dt, previewEnv);
  // Name cards tick on sim time so a throttled background tab can never
  // strand the game between rounds; on return the card simply finishes.
  tickBanner(dt);
  // Room matches render the server snapshot; the server runs the war.
  if (net.on) {
    netFrame(dt);
    if (G.terrain) { render(); renderHUD(); }
    return;
  }
  // Name cards: the hills drift, nothing plays.
  if (G.phase === 'banner') {
    G.time += dt;
    driftClouds(dt);
    pumpDialogue(dt);
    updateCamera(dt);
    render();
    renderHUD();
    return;
  }
  if (!G.tanks.length) { render(); renderHUD(); return; }
  if (G.over) { pumpDialogue(dt); render(); renderHUD(); return; }
  G.time += dt;
  decayFx(dt);
  // In the war, tanks fall inside its fixed steps (below), shells or no
  // shells; anywhere else they fall by the frame.
  const war = G.phase === 'think' || G.phase === 'fly' || G.phase === 'settle';
  if (!war) fallTanks(dt);
  tickTutorial();
  driftClouds(dt);
  pumpDialogue(dt);
  G.banterT -= dt;
  if (G.banterT <= 0) {
    G.banterT = 30 + Math.random() * 14;
    if (!G.dlgQ.length && G.dlgT <= 0 && G.phase === 'aim') {
      if (Math.random() < 0.5) talk('tank', pick(TANK_IDLE));
      else {
        const live = foesAlive();
        if (live.length) {
          const jab = pick(FOE_IDLE.filter(x => live.some(d => d.id === x[0])));
          talk(jab[0], jab[1]);
        } else talk('tank', pick(TANK_IDLE));
      }
    }
  }
  checkOneUps();
  if (G.phase === 'aim' && cur().isPlayer && !G.demo) {
    const t = me();
    const arm = stepArm(input.held, dt, t, facing(t), G.w, aimLimits(tables.weapons[G.selected]));
    t.angle = arm.angle;
    t.power = arm.power;
    const driving = input.held.has('driveLeft') || input.held.has('driveRight');
    // A buried tank cannot drive: it says so once per press.
    if (driving && buried(t, G.terrain)) {
      if (!driveRefused) say(BURIED_LINE, 'bad');
      driveRefused = true;
    } else if (driving && t.fuel > 0) {
      const dx = input.held.axis('driveLeft', 'driveRight');
      const step = dx * TUNE.driveSpeed * dt;
      if (Math.abs(step) > 0 && Math.abs(t.fuel) >= Math.abs(step)) {
        const nx = clamp(t.x + step, 12, G.w - 12);
        if (!spotTaken(t, nx)) {
          t.fuel -= Math.abs(step);
          t.x = nx;
          t.y = surfY(t.x);
        }
      }
    }
    if (!driving) driveRefused = false;
  } else if (war) {
    // Fixed SOLO_STEP steps whatever the frame rate, each dropping the tanks
    // and then moving the war on, so the war plays the same at any frame rate;
    // with the player's tank wrecked the drones play on at triple speed.
    warAcc = runFixed(warAcc, dt * warSpeed(me().hp > 0, G.demo), SOLO_STEP, h => {
      fallTanks(h);
      stepWar(h);
      return !G.over && (G.phase === 'think' || G.phase === 'fly' || G.phase === 'settle');
    });
  } else {
    warAcc = WAR_REST;
  }
  updateCamera(dt);
  render();
  renderHUD();
}

/* The room client (src/net.ts) owns the session, the
   transport, polling, the senders and the clocks, and reaches this page only
   through the handlers below: it reports the snapshot and the events it has
   not seen (netOnSnapshot), whether the server answers (the dots), and a
   Ready change or a failed send. fetch, timers and the clock are handed in. */
function browserRoomEnv(): RoomEnv {
  return {
    fetch: (url, init) => fetch(url, init),
    setTimeout: (fn, ms) => setTimeout(fn, ms),
    setInterval: (fn, ms) => setInterval(fn, ms),
    clearInterval: id => clearInterval(id as number),
    now: () => performance.now(),
    beacon: (url, body) => typeof navigator !== 'undefined' && !!navigator.sendBeacon && navigator.sendBeacon(url, body),
  };
}
const net = new RoomClient(browserRoomEnv(), {
  onReachable: on => setNetDot(on),
  onSnapshot: (room, fresh, first) => netOnSnapshot(room, fresh, first),
  onReadyChange: () => renderShopReady(),
  onError: err => say(prettyRoomError(err), 'bad'),
  onGone: (code, why) => netGone(code, why),
});
/* What the page keeps of a room match: whose turn it reads as, the aim and
   drive it has not sent, the room snapshot waiting for the replay to drain,
   and the last snapshot it drew. The replay queue and the volley on screen
   live in `replay` (src/replay.ts), declared below. */
const MATCH: MatchState = {
  myTurn: false, aimDirty: false, driveAcc: 0, driveT: 0,
  pendingRoom: null,
  lastPhase: '', lastTurn: -1, lastRound: -1, initials: '',
  roundTo: '', out: false, outShown: false, lastRoom: null,
};
const replay = createReplay({
  tank: seat => G.tanks.find(t => t.seat === seat),
  effect: wkey => (WEAPONS[wkey] || {}).effect,
  event: e => netEvent(e),
  launch: () => sfx.play('launch'),
  blast: (x, y, r, wkey) => netBlast(x, y, r, wkey),
  muzzle: (wkey, x, y, ang) => fxMuzzle(G.fx, wkey, x, y, ang),
  special: (wkey, name, x, y, ang) => fxSpecial(G.fx, wkey, name, x, y, ang),
  trail: (shot, dt, x, y, vx, vy, wkey) => { fxTrail(G.fx, shot, dt, x, y, vx, vy, wkey); netTrailMark(shot, x, y); },
  beam: e => netBeam(e),
  ring: e => netRing(e),
  earth: e => netEarth(e),
  burn: e => netBurn(e),
  mark: shot => netMark(shot),
});
/* ---------- the typed modules, wired in dependency order ---------- */
/* The status bar's values (src/hud.ts). */
const { HUD, paintHud, windText, renderHUD } = createHud({
  G, $, tables, net, MATCH, me, cur, myTank, seatName, drawShellIcon, keyHint, touch: TOUCH,
  menuOpen: () => { const mv = $('menu-overlay'); return !!mv && !mv.hidden; },
  onMenu: () => toggleOverlay('menu-overlay', 'btn-menu'),
});
/* The camera and the frame the canvas paints (src/view.ts). */
const { updateCamera, driftClouds, shownAngle, shownPower, render } = createView({
  G, tables, net, MATCH, replay, FX, fxSet, cur, textScale: () => textScale(),
});
/* The high scores (src/scores.ts): the online board and this browser's, on this browser's storage
   (null where reading it throws); another tab's save redraws an open overlay. */
const { renderScoresOverlay, openScores, saveLocal } = createScores({
  $, keyHint, toggleOverlay, initials: () => getInitials(), difficulty: () => difficulty.get(), storage: browserStorage(),
  onStorage: fn => window.addEventListener('storage', e => fn(e.key)),
});
/* The coach (src/tutorial.ts). */
const {
  renderTutorial, maybeStartTutorial, tutorialOpen, endTutorial, skipTutorial, tickTutorial,
  isActive: tutorialActive, arm: armTutorial, noteFired: tutorialFired,
} = createTutorial({
  G, $, TOUCH, net, sfx, me, keyHint, say, refreshNavHints, closeOverlays, freshMatchFromSeedBox,
});
/* The Difficulty setting: the Menu picks it, a new solo match and a hosted room read it. */
const difficulty = difficultySetting(browserStorage());
/* The player's initials (src/initials.ts): one set per browser, edited on the
   title card and in the rooms lobby; the rooms host and join with it, and
   filed scores carry it. */
const savedInitials = initialsPref(browserStorage(), Math.random);
const getInitials = (): string => savedInitials.get();
/* The room seats this browser holds (src/seats.ts): closing the tab keeps
   them; the room link and Your games resume them. */
const seats = createSeatStore(browserStorage(), () => Date.now());
/* The solo match (src/match.ts): dealing, turns, blasts, the drone's shot, the end veil. A dependency
   on a module wired further down is passed as an arrow, so it resolves when it is called. */
/* Matches are dealt at the width the landscape box gives (spec 6.6). */
const field = createFieldWidth(() => ({ w: window.innerWidth, h: window.innerHeight }));
const {
  advance, startDemo, startSolo, demoBlock, playerFire, fallTanks, END, renderEndVeil, startBanner, tickBanner, nextRound,
  stepWar, decayFx, soloShopBoard, endVeilBack, checkOneUps,
} = createMatch({
  field, G, $, TOUCH, tables, net, sfx, music, difficulty, unlock, alive, foesAlive, me, cur, surfY, talk, exchange, say, keyHint, windText,
  render, renderHUD, refreshNavHints, fxMuzzle, fxImpact, fxSpecial, fxTrail, closePreview, endTutorial, maybeStartTutorial,
  tutorialFired, backToTitle: () => backToTitle(),
  closeGuns: () => closeGuns(), hideShop: () => hideShop(), openShop: () => openShop(),
  netFire: () => netFire(), netLeave: quiet => netLeave(quiet), netNext: want => netNext(want),
  netAgain: () => netAgain(), initials: getInitials, saveLocal,
});
/* The field shop (src/shop.ts): prices, rows, buying, the Ready line. */
const {
  openShop, hideShop, renderShop, renderShopReady, buyItem, buySelected, previewSelected, shopSelect, shopQtyUp, shopQtyDown,
} = createShop({
  G, $, tables, net, sfx, me, touch: TOUCH, keyHint, say, advance, render, renderHUD, refreshNavHints,
  drawShellIcon, drawGearIcon, openPreview, nextRound, openLeaveVeil: () => openLeaveVeil(), netBuy: (it, qty) => netBuy(it, qty),
  board: () => (net.on ? roomShopBoard() : soloShopBoard()),
  preloadFx: keys => fxPreload(keys),
});
/* The weapon picker (src/guns.ts). */
const {
  GUN_COLS, rackGuns, gunsOpen, openGuns, closeGuns, renderGuns, pickGun, moveGunCursor, gunGrid,
  cursorAt: gunCursorAt, toggleStock: toggleGunStock,
} = createGuns({
  G, $, tables, net, sfx, keyHint, say, refreshNavHints, renderHUD, drawShellIcon, demoBlock,
  netPick: w => netPick(w),
});
/* A running room match on this client (src/room.ts): moves sent, snapshots adopted, events told, the turn alert. */
const {
  netFire, netPick, netBuy, netNext, netOnSnapshot, netEvent, netBlast, netBeam, netRing, netEarth, netBurn, netMark, netTrailMark, netFrame,
  roomShopBoard, openStandings,
} = createRoom({
  G, $, tables, net, MATCH, HUD, END, replay, input, sfx, music, myTank, seatName, talk, say, closeOverlays, closePreview,
  backToLobby: () => netBackToLobby(),
  decayFx, fallTanks, fxImpact, fxSpecial, hideShop, pumpDialogue, refreshNavHints, render, renderEndVeil, renderHUD, renderShop,
  renderShopReady, shownAngle, shownPower, startBanner, updateCamera, driftClouds, windText, saveLocal, renderMenu: () => renderMenu(),
  alertsOn: () => alertsState() === 'on',
});
/* Getting into and out of a room (src/lobby.ts): the lobby, hosting, joining, the invite, leaving. */
const {
  renderLobby, setNetDot, loadOccupancy, openLobby, maybeApplyInviteCode, renderLeaveVeil, openLeaveVeil, closeLeaveVeil,
  netLeave, netStepOut, resumeRoom, netAgain, netBackToLobby, netTurnTime, netGone,
} = createLobby({
  G, $, net, MATCH, HUD, END, replay, sfx, difficulty, unlock, say, keyHint, seats, games: () => gamesView(),
  steppedOut: (code, myTurn) => { if (myTurn) watch.quietNext(code); }, netEvent, seatName, closeLobbyVeil,
  closeOverlays, closePreview, endTutorial, hideShop, initials: savedInitials, initialsSaved: () => renderTitle(), paintHud, refreshNavHints,
  renderMenu: () => renderMenu(),
  closeTitle: () => closeTitle(), backToTitle: () => backToTitle(),
  renderShop,
});
/* The game menu's settings (src/menu.ts). */
const { loadBody, loadTextSize, loadFlashes, textScale, renderMenu } = createMenu({
  G, $, net, sfx, difficulty, unlock, isSoundMuted, isMusicMuted, keyHint, myTank, openLeaveVeil, placeLogBelowStatus,
  nextSong: () => { unlock(); music.next(); },
  openStandings: () => openStandings(), turnTime: secs => netTurnTime(secs), alerts: () => ({ state: alertsState(), onClick: toggleAlerts }), freshMatchFromSeedBox, toggleFullscreen, toggleMusic, toggleOverlay, toggleSound,
  quit: () => { void quitGame(); },
  setFlashes: on => { if (FX) FX.flashes = on; },
});
/* The title card over the demo (src/title.ts). */
const { titleOpen, openTitle, closeTitle, showHint: showTitleHint, renderTitle } = createTitle({
  $, keyHint, initials: savedInitials,
  play: () => { unlock(); sfx.play('click'); randomRun(); },
  friends: () => openRooms(),
  tutorial: () => { sfx.play('click'); tutorialOpen(); },
  settings: () => { const mv = $('menu-overlay'); if (mv && mv.hidden) toggleOverlay('menu-overlay', 'btn-menu'); },
  settingsOpen: () => { const mv = $('menu-overlay'); return !!mv && !mv.hidden; },
  games: () => gamesView(),
});
/* After a match or a room: the demo again, under the card, and Your games
   asked at once (a room just stepped out of joins the list). */
function backToTitle(): void {
  closeOverlays();
  startDemo();
  openTitle();
  void watch.pollNow();
}

/* ---------- Your games, turn toasts and turn alerts ---------- */
/* Turn alerts (src/notify.ts): off until the player turns them on with the
   button, which asks the browser from its own click. */
const alerts = alertsPref(browserStorage());
function alertsState(): AlertsState {
  const p = notifyPermission();
  if (p === 'unsupported') return 'unsupported';
  if (p === 'denied') return 'blocked';
  return alerts.get() === 'on' && p === 'granted' ? 'on' : 'off';
}
function toggleAlerts(): void {
  if (alertsState() === 'on') { alerts.set('off'); renderGames(); return; }
  void askNotify().then(p => {
    if (p === 'granted') {
      alerts.set('on');
      say('Turn alerts on: a notification says when it is your turn in a room, while the game is open in a tab.', 'info');
    } else if (p === 'denied') {
      say('This browser blocks notifications for the game. The toasts and the tab title still say when it is your turn.', 'info');
    }
    renderGames();
  });
}
/* The rooms this browser sits in, but the one on screen, as the watcher last
   heard them (src/games.ts). */
let gamesRows: LiveRow[] = [];
let gamesAt = 0;
function gamesView(): GamesView {
  const age = gamesRows.length ? (performance.now() - gamesAt) / 1000 : 0;
  return { rows: gamesRows, alerts: alertsState(), age, onOpen: openGame, onAlerts: toggleAlerts };
}
function renderGames(): void {
  renderTitle();
  renderLobby();
}
/* Open a room from Your games, a toast or a notification: out of the room on
   screen (its seat kept), into that one. */
function openGame(code: string): void {
  unlock();
  closeLeaveVeil();
  if (!seats.get(code)) {
    // Given up in another tab, or found gone since the list was drawn: the room on screen stays.
    say('That seat is no longer held here.', 'info');
    void watch.pollNow();
    return;
  }
  if (net.code !== code) {
    if (net.code) netStepOut(true);
    closeOverlays();
  }
  void resumeRoom(code).then(() => { void watch.pollNow(); });
}
/* The turn toasts (src/toasts.ts, drawn by src/ui/toast.tsx): one per room,
   the newest few, each counting down only once the page is seen. */
const toasts = createToastQueue({
  setTimeout: (fn, ms) => setTimeout(fn, ms),
  clearTimeout: id => clearTimeout(id as number),
  hidden: () => !!document.hidden,
  onChange: () => renderToastStack(),
});
function renderToastStack(): void {
  const root = $('toast-root');
  if (!root) return;
  renderToasts(root, toasts.list().map(t => ({
    id: t.id, text: t.text,
    onGo: () => { toasts.close(t.id); openGame(t.code); },
    onClose: () => toasts.close(t.id),
  })));
}
/* Which room each tab shows (src/on-screen.ts): this tab reports its own,
   and the watcher never toasts a room another tab is showing. */
const onScreen = createOnScreen({
  tab: Math.random().toString(36).slice(2),
  now: () => Date.now(),
  channel: (() => {
    try { return typeof BroadcastChannel === 'function' ? new BroadcastChannel('tankity') as unknown as ChannelLike : null; } catch (_) { return null; }
  })(),
  storage: browserStorage(),
  listen: fn => window.addEventListener('storage', e => fn(e.key)),
});
function screenRoom(): string {
  return roomOnScreen(net, !($('lobby-veil')?.hidden ?? true));
}
function reportScreen(): void {
  onScreen.set(document.hidden ? '' : screenRoom());
}
let rowsSig = '';
const watch = createGamesWatch({
  store: seats,
  mine: list => net.mine(list),
  setInterval: (fn, ms) => setInterval(fn, ms),
  clearInterval: id => clearInterval(id as number),
  viewing: screenRoom,
  elsewhere: code => onScreen.elsewhere(code),
  onRows: rows => {
    gamesRows = rows;
    gamesAt = performance.now();
    // Redraw only when the list changed: the title card and lobby are not redrawn every poll for nothing.
    const sig = JSON.stringify(rows);
    if (sig !== rowsSig) { rowsSig = sig; renderGames(); }
  },
  onTurn: row => {
    // `players` lists humans only, so a seat number is not an index into it: drop this seat's own initials.
    const me = seats.get(row.code)?.initials ?? '';
    const others = row.players.filter(p => p !== me);
    toasts.push(row.code, `Your turn in ${row.code} · vs ${others.join(', ') || 'the drones'}`);
    if (document.hidden) showTurnNotification({ code: row.code, others }, alertsState() === 'on', () => openGame(row.code));
  },
});
/* A seat given up (Leave) or found gone drops out of the list at once. */
seats.subscribe(() => {
  gamesRows = gamesRows.filter(r => seats.get(r.code));
  rowsSig = JSON.stringify(gamesRows);
  renderGames();
});
function myTank(): GameTank | null {
  for (const t of G.tanks) if (t.isPlayer) return t;
  return null;
}
function seatName(seat: number): string {
  const s = net.seats[seat];
  if (!s || !s.name) return 'seat ' + (seat + 1);
  return s.name;
}


/* ---------- input + init ---------- */
function applyKeys(def: unknown): void {
  if (!input.setKeys(def)) return;
  renderKeyHints();
  paintHud();
  renderHelpOverlay();
  renderShop();
  renderMenu();
  renderTitle();
  renderLobby();
  renderGuns();
  renderScoresOverlay();
  renderLogOverlay();
  renderTutorial();
  renderEndVeil();
  renderLeaveVeil();
}
/* The shown key for an action: the first token its context lists, or the
// nth with data-keyhint="context:action:n" where prose names two keys. */
function keyHint(ctx: string, action: string, idx?: number): string {
  return input.hint(ctx, action, idx);
}
/* Fill every [data-keyhint] span in the page at boot and again if game.json
// loads late, so labels can never drift from behavior. The Preact overlays
// (marked data-ui) fill their own from the same keyHint. */
function renderKeyHints(): void {
  document.querySelectorAll('[data-keyhint]').forEach(el => {
    if (el.closest && el.closest('[data-ui]')) return;
    const [kctx, kact, kidx] = (el.getAttribute('data-keyhint') || '').split(':');
    el.textContent = kctx !== undefined && kact !== undefined ? keyHint(kctx, kact, +(kidx || 0)) : '';
  });
}
function freshMatchFromSeedBox(opts?: { tut?: boolean }): void {
  // A new match takes the whole frame: shut any panels so the menu never
  // sits over the briefing and the shop never opens underneath it.
  closeOverlays();
  closeTitle();
  // Leaving a coached battle counts as having seen it; asking for the
  // tutorial (U or the menu) always deals this match with the coach on.
  endTutorial(tutorialActive());
  if (opts && opts.tut) armTutorial();
  const seedInput = $<HTMLInputElement>('seed-input');
  startSolo(seedInput ? seedInput.value : '');
  render(); renderHUD();
}
function randomRun(): void {
  const seedBox = $<HTMLInputElement>('seed-input');
  if (seedBox) seedBox.value = 'scorched-' + Math.floor(Math.random() * 90000 + 10000);
  freshMatchFromSeedBox();
}
function openRooms(): void {
  unlock();
  sfx.play('click');
  openLobby();
}
/* Another panel (menu, help, report, log) open above the shop takes the keys. */
function shopCovered(): boolean {
  return ['menu-overlay', 'help-overlay', 'report-overlay', 'log-overlay', 'gun-overlay'].some(id => { const el = $(id); return el && !el.hidden; });
}
/* A line key (j/k): in the shop it walks the rows, like the arrows; in the gun
// picker it moves the cursor; with any other panel open it scrolls that panel.
// Paging keys only ever scroll. */
function lineKey(dir: number): boolean {
  if (G.phase === 'shop' && !G.over && !G.preview && !shopCovered()) return shopSelect(dir);
  if (gunsOpen()) { moveGunCursor(dir); return true; }
  return scrollOverlay(dir, 0);
}
/* Input maps keys and touches to named commands (the action names of
// game.json's keys section); this says what each does in the current context.
// A handler that returns true used the key; one that returns nothing declines,
// and the key falls through to the next candidate. The order they are offered
// in (panel scrolling, the gun grid, the shop, Q, the held aim keys, fire,
// then the plain global keys) is src/input.ts's. */
/* Every card and overlay that takes the keyboard from the battlefield. */
const OVERLAYS = '#log-overlay, #help-overlay, #report-overlay, #menu-overlay, #gun-overlay, #tutorial-overlay, #end-veil, #shop-veil, #lobby-veil, #preview-veil';
function bindKeys(): void {
  input.register({
    lineDown: () => lineKey(1),
    lineUp: () => lineKey(-1),
    pageDown: () => scrollOverlay(0, 1),
    pageUp: () => scrollOverlay(0, -1),
    halfDown: () => scrollOverlay(0, 0.5),
    halfUp: () => scrollOverlay(0, -0.5),
    gridLeft: () => gunGrid(-1),
    gridRight: () => gunGrid(1),
    gridUp: () => gunGrid(-GUN_COLS),
    gridDown: () => gunGrid(GUN_COLS),
    confirm: p => {
      if (!gunsOpen()) return undefined;
      if (!p.repeat) pickGun(rackGuns()[gunCursorAt()]!);
      return true;
    },
    digit: p => {
      if (!gunsOpen()) return undefined;
      const w = rackGuns()[+p.key - 1];
      if (w) pickGun(w);
      return true;
    },
    // The shop's own keys (live only in the shop, see shopLive below).
    selUp: () => shopSelect(-1),
    selDown: () => shopSelect(1),
    qtyUp: shopQtyUp,
    qtyDown: shopQtyDown,
    // Digits buy rows 1-9 outright; longer shelves still answer to arrows.
    buyRow: p => {
      const row = p.key >= '1' && p.key <= '9' && +p.key <= SHOP.length ? SHOP[+p.key - 1] : null;
      if (!row) return undefined;
      buyItem(row, G.shopQty);
      return true;
    },
    buy: () => { buySelected(); return true; },
    preview: () => (previewSelected() ? true : 'quiet'), // V does nothing else in the shop
    // Q in the shop shuts the firing range first, then any open panel (the
    // menu can sit above the shop) or the Standings card, and with nothing
    // open it opens the menu.
    // It never starts the round: that is N or the Start button.
    close: () => {
      if (G.preview) closePreview();
      else if (closeLeaveVeil()) { /* the question closed */ }
      else if (closeOverlays() || endVeilBack()) { /* a panel or the Standings card closed */ }
      else toggleOverlay('menu-overlay', 'btn-menu');
      return true;
    },
    // Q toggles the menu: it shuts the topmost thing that is open. Panels
    // come before the tutorial because the coach sends the player into one
    // (the gun picker); with none open Q skips a running tutorial, and
    // otherwise opens the menu. Esc does nothing: Safari and Firefox always
    // leave full screen on it, so the game never asks for it.
    back: () => {
      if (G.preview) { closePreview(); return; }
      if (closeLeaveVeil()) return;
      if (closeLobbyVeil()) return;
      if (closeOverlays()) return;
      if (endVeilBack()) return;
      if (tutorialActive()) { skipTutorial(); return; }
      toggleOverlay('menu-overlay', 'btn-menu');
    },
    fire: () => { unlock(); music.start(); playerFire(); },
    music: () => { toggleMusic(); },
    nextTrack: () => { unlock(); music.next(); },
    sound: () => { toggleSound(); },
    log: () => { toggleOverlay('log-overlay', 'btn-log'); },
    help: () => { toggleOverlay('help-overlay', 'btn-help'); },
    report: () => { toggleOverlay('report-overlay', 'scores-open'); },
    // Random hills and the rooms lobby stay out of the shop so a buying
    // spree never misfires into a new match.
    random: () => { if (G.phase !== 'shop') randomRun(); },
    rooms: () => { if (G.phase !== 'shop') openRooms(); },
    new: () => {
      if (G.phase === 'shop') nextRound();
      else freshMatchFromSeedBox();
    },
    guns: () => { if (gunsOpen()) closeGuns(); else openGuns(); },
    gunStock: () => { if (gunsOpen()) toggleGunStock(); },
    tutorial: () => { tutorialOpen(); },
    battlePreview: () => { togglePreview(); },
    fullscreen: () => { toggleFullscreen(); },
  }, {
    shopLive: p => G.phase === 'shop' && !G.over && !p.repeat,
    // The leave question holds every key but Q (which answers "stay").
    modalOpen: () => { const ask = $('leave-veil'); return !!ask && !ask.hidden; },
    modalBack: () => { closeLeaveVeil(); },
    cardOpen: () => titleOpen(),
    overlayOpen: target => {
      if (!(target instanceof Element)) return false;
      const holder = target.closest<HTMLElement>(OVERLAYS);
      return !!holder && !holder.hidden;
    },
    onHold: () => { unlock(); music.start(); },
  });
  input.bind(window);
}
const AIM_COMMANDS: Record<string, HoldCommand> = { up: 'powerUp', down: 'powerDown', left: 'barrelLeft', right: 'barrelRight' };
/* A pad button that was clicked should not keep keyboard focus, or Space would press it again. */
function blurTarget(ev: Event): void {
  (ev.currentTarget as HTMLElement).blur();
}
function init(): void {
  if (TOUCH) document.documentElement.classList.add('touch');
  renderHelpOverlay();
  bindKeys();
  loadGameConfig();
  G.body = loadBody();
  loadFlashes();
  paintHud();
  renderLogOverlay();
  renderScoresOverlay();
  renderTutorial();
  renderEndVeil();
  renderLeaveVeil();
  renderLobby();
  loadTextSize(); // draws the menu
  renderKeyHints();
  startDemo();
  openTitle();
  renderShop();
  // Light the connection dot from the start, not only when the lobby opens.
  loadOccupancy();
  maybeApplyInviteCode();
  // Your games: asked now and every GAMES_POLL_MS, and again whenever the tab comes back.
  watch.start();
  if (document.addEventListener) {
    document.addEventListener('visibilitychange', () => {
      reportScreen();
      if (!document.hidden) { toasts.shown(); void watch.pollNow(); }
    });
  }
  // The room this tab shows, told to the other tabs now and on a beat (they forget a quiet tab).
  setInterval(reportScreen, ON_SCREEN_BEAT_MS);
  window.addEventListener('pagehide', () => onScreen.set(''));

  document.querySelectorAll<HTMLElement>('[data-aim]').forEach(btn => {
    const act = AIM_COMMANDS[btn.getAttribute('data-aim') ?? ''];
    if (act) input.bindHold(btn, act);
  });
  const cannon = $('btn-cannon');
  if (cannon) cannon.addEventListener('click', ev => { blurTarget(ev); unlock(); music.start(); playerFire(); });
  const track = $('btn-track');
  if (track) track.addEventListener('click', ev => { blurTarget(ev); unlock(); music.next(); });
  const weapon = $('btn-weapon');
  if (weapon) weapon.addEventListener('click', ev => { blurTarget(ev); if (gunsOpen()) closeGuns(); else openGuns(); });
  for (const [id, act] of [['btn-drive-l', 'driveLeft'], ['btn-drive-r', 'driveRight']] as const) {
    const btn = $(id);
    if (btn) input.bindHold(btn, act);
  }
  for (const [btnId, ovId] of [['btn-log', 'log-overlay'], ['btn-help', 'help-overlay']] as const) {
    const b = $(btnId);
    if (b) b.addEventListener('click', ev => { blurTarget(ev); toggleOverlay(ovId, btnId); });
  }
  if (document.addEventListener) document.addEventListener('fullscreenchange', syncFullscreenLabel);
  if (document.addEventListener) document.addEventListener('fullscreenchange', lockEscapeInFullscreen);
  const pvClose = $('preview-close');
  if (pvClose) pvClose.addEventListener('click', ev => { blurTarget(ev); closePreview(); });
  // Any touch or keypress unlocks the speakers and (re)starts a non-muted
  // song, so music never sits claiming to play while silent after a refresh.
  // This fires before the game keys, and starting twice is a harmless no-op.
  const kickAudio = (ev: Event): void => {
    // A first tap that turns the music off must not fetch a track.
    const target = ev.target as Element | null;
    const hit = ev.type === 'keydown' ? input.lookup('global', ev as KeyboardEvent)
      : (target && target.closest && target.closest('#btn-music') ? 'music' : '');
    noteGesture(hit === 'music');
  };
  window.addEventListener('pointerdown', kickAudio, true);
  window.addEventListener('keydown', kickAudio, true);
  window.addEventListener('resize', refreshNavHints);
  window.addEventListener('resize', placeLogBelowStatus);
  placeLogBelowStatus();
  requestAnimationFrame(frame);
}
/* The radio log hangs just under the status bar, whose height changes with
   the frame width. */
function placeLogBelowStatus(): void {
  const bar = $('hud-bar');
  const log = $('log-overlay');
  if (!bar || !log || !bar.offsetHeight) return;
  log.style.top = `${bar.offsetTop + bar.offsetHeight + 6}px`;
}
function toggleSound(): void {
  setSoundMuted(!isSoundMuted());
  renderMenu();
}
function toggleMusic(): void {
  setMusicMuted(!isMusicMuted());
  renderMenu();
}
/* Keyboard scrolling for panels: the topmost open veil or overlay takes
line, page, and half-page keys. Mouse wheels and touch keep working as
before; these keys are the no-mouse way to reach what does not fit. */
const SCROLL_LINE = 40;
function overlayScrollTarget(): HTMLElement | null {
  // The shop list scrolls inside its card, so it takes the keys directly.
  const shopVeil = $('shop-veil');
  if (shopVeil && !shopVeil.hidden) return $('shop-list');
  for (const id of ['lobby-veil', 'preview-veil', 'end-veil',
      'gun-overlay', 'help-overlay', 'report-overlay', 'menu-overlay', 'log-overlay']) {
    const el = $(id);
    // The end card scrolls its scoreboard, not the veil.
    if (el && !el.hidden) return id === 'end-veil' ? ($('end-board') ?? el) : el;
  }
  return null;
}
function scrollOverlay(lines: number, pages: number): boolean {
  const el = overlayScrollTarget();
  if (!el) return false;
  refreshNavHints();
  const page = el.clientHeight ? el.clientHeight * 0.85 : 200;
  el.scrollTop += lines * SCROLL_LINE + pages * page;
  // A script's scrollTop change fires its scroll event only on the next frame.
  // The panels that keep their scroll across redraws listen for that event, so
  // tell them now, or a redraw right after the key would put the old place back.
  if (el.dispatchEvent) el.dispatchEvent(new Event('scroll'));
  return true;
}
/* Every scrollable panel carries a visible key footer. It reads disabled
while everything fits, and lights up the moment content overflows. */
const NAV_HINTS: [string, string][] = [
  // The shop scrolls its list, not its veil.
  ['shop-list', 'nav-shop'], ['lobby-veil', 'nav-lobby'],
  ['preview-veil', 'nav-preview'], ['end-board', 'nav-end'],
  ['help-overlay', 'nav-help'], ['report-overlay', 'nav-report'],
  ['menu-overlay', 'nav-menu'], ['log-overlay', 'nav-log'],
  ['tutorial-overlay', 'nav-tutorial'], ['gun-overlay', 'nav-gun'],
];
/* The rotate hint: portrait, a real match, until the player closes it once. */
const rotateHint = pref(ROTATE_HINT_KEY, '', text, browserStorage());
const portraitQuery = window.matchMedia('(orientation: portrait)');
function refreshRotateHint(): void {
  const root = document.getElementById('rotate-hint-root');
  if (!root) return;
  const show = rotateHintShows({ portrait: portraitQuery.matches, dismissed: rotateHint.get() === 'dismissed', playing: !G.demo && !G.over && (G.tanks.length > 0 || G.phase === 'banner' || G.phase === 'shop') });
  renderRotateHint(root, show, () => { rotateHint.set('dismissed'); refreshRotateHint(); });
}
portraitQuery.addEventListener?.('change', refreshRotateHint);
function refreshNavHints(): void {
  for (const [panelId, hintId] of NAV_HINTS) {
    const panel = $(panelId), hint = $(hintId);
    if (!panel || !hint) continue;
    const fits = (panel.scrollHeight || 0) <= (panel.clientHeight || 0) + 1;
    hint.setAttribute('aria-disabled', String(fits));
  }
  refreshRotateHint();
}
/* Q shuts whatever is overlaid: the firing range first, then the lobby,
then every open panel. */
function closeLobbyVeil(): boolean {
  const veil = $('lobby-veil');
  if (!veil || veil.hidden) return false;
  veil.hidden = true;
  refreshNavHints();
  // A room's lobby closed while seated: the seat waits, and Your games lists the room.
  if (net.code && !net.on) { reportScreen(); void watch.pollNow(); }
  return true;
}
function closeOverlays(): boolean {
  let shut = closeGuns();
  for (const [ovId, btnId] of [['log-overlay', 'btn-log'], ['help-overlay', 'btn-help'],
      ['report-overlay', 'scores-open'], ['menu-overlay', 'btn-menu']] as const) {
    const ov = $(ovId);
    if (ov && !ov.hidden) { toggleOverlay(ovId, btnId); shut = true; }
  }
  return shut;
}
/* In-frame panels overlay the battle and never pause it. */
/* The panels a component draws: redrawn on open and close, so each knows it
   was closed and forgets its scroll (the browser reopens it at the top). */
const OVERLAY_PAINT: Record<string, () => void> = {
  'menu-overlay': () => renderMenu(),
  'log-overlay': () => renderLogOverlay(),
  'report-overlay': () => { if ($('report-overlay')!.hidden) renderScoresOverlay(); else openScores(); },
  'help-overlay': () => renderHelpOverlay(),
};
function toggleOverlay(id: string, btnId?: string): void {
  const ov = $(id);
  if (!ov) return;
  ov.hidden = !ov.hidden;
  if (OVERLAY_PAINT[id]) OVERLAY_PAINT[id]();
  const btn = btnId && $(btnId);
  if (btn) btn.setAttribute('aria-expanded', String(!ov.hidden));
  if (id === 'menu-overlay') menuFocus(!ov.hidden);
  paintHud();
  refreshNavHints();
}
/* Focus goes into the menu when it opens, and back to what opens it when it
   closes: the card's Settings while the card is up, else the Menu button. */
function menuFocus(open: boolean): void {
  renderTitle();
  const to = open ? $('menu-close') : titleOpen() ? $('title-settings') : $('btn-menu');
  if (to && to.focus) to.focus();
}
/* Menu → Quit: the match ends and the page returns to the title card over the
   demo; an installed app then closes where it may. A room is stepped out of,
   like closing the tab: the seat waits there. */
async function quitGame(): Promise<void> {
  const room = net.on ? net.code : '';
  if (room) netStepOut(true);
  endTutorial(tutorialActive());
  backToTitle();
  say(room ? `You stepped out of room ${room}; your seat waits. Leave room gives it up.` : 'You left the match.', 'info');
  const outcome = await exitApp(browserAppEnv());
  // The card may be gone already: a match started inside the close wait.
  if (outcome === 'title-with-hint') showTitleHint(`${EXIT_HINT}.`);
}
function toggleFullscreen(): void {
  // The frame carries the canvas plus its HUD and pads, so the whole battle goes fullscreen together.
  const el = $('frame') || document.documentElement;
  if (typeof el.requestFullscreen !== 'function' || typeof document.exitFullscreen !== 'function') {
    say('Fullscreen is not supported in this browser.', 'info');
    return;
  }
  if (document.fullscreenElement) {
    void document.exitFullscreen();
    return;
  }
  void enterFullscreen(browserAppEnv(), el).then(ok => {
    if (!ok) say('Fullscreen is not available right now.', 'info');
  });
}
/* In fullscreen the browser takes Esc to leave fullscreen. The game never
   asks for Esc (Q is its back key), but a player may press it from habit.
   Where Keyboard Lock exists (Chromium), hold Esc so a tap does nothing and
   only holding it leaves fullscreen. The lock is the top-level page's,
   because the /play/ pages run the game in a frame and Chromium refuses a
   frame's lock. Safari and Firefox have no Keyboard Lock: there Esc always
   leaves fullscreen, by the browser, which is why nothing asks for it.
   Guarded by test/fullscreen.test.ts and tests/e2e/tankity-fullscreen-esc.spec.mjs. */
function lockEscapeInFullscreen(): void {
  void holdEscape(!!document.fullscreenElement, topKeyLock(window), msg => console.warn(msg));
}
function syncFullscreenLabel(): void {
  renderMenu();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
