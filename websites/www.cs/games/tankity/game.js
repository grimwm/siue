/* Operation Tankity: Scorched Earth.
 * Turn-based artillery across destructible hills. You and the drone battery
 * trade shells: angle, power, wind, craters. Last one rolling wins the round.
 * Controls: hold Left/Right = angle · hold Up/Down = power · A/D = drive ·
 * Ctrl/Space = fire · Q = weapon · N = next round / new match · M = music.
 */
/* The pure game math (RNG, terrain, flight, hits, blasts, drone aim) lives in
 * src/sim.ts, the sound in src/audio.ts, the room client in src/net.ts and the
 * canvas drawing in src/render.ts, the keys and touch pads in src/input.ts, the room volley replay in
 * src/replay.ts, the firing-range simulation in src/preview.ts and the solo phase moves in src/flow.ts, each compiled to js/ and imported here.
 * The overlays that are mostly markup are Preact components in src/ui/ (the help and the shop so far):
 * they take state and callbacks as props and keep none of their own. Each
 * import's ?v= is the module's content hash, written by tools/install-files.php,
 * so a browser never pairs a cached module with a newer game.js. Everything
 * below is the rest: the game loop, particles,
 * the HUD, rooms and the shop's state. */
import {
  hashSeed, mulberry32, gauss, W, H, GRAV, FLAT_GRAV, TUNE, clamp,
  buildArsenal as simBuildArsenal, droneRack as simDroneRack, genTerrain as simGenTerrain,
  surfY as simSurfY, carveCrater, facing, isGroundUnit, spawnSpots, spotTaken as simSpotTaken,
  muzzle, shotSpeed, stepBallistic, blastDamage,
  fireWeapon as simFireWeapon, stepShells as simStepShells, fallTanks as simFallTanks,
  anyTankFalling as simAnyTankFalling,
} from './js/sim.js?v=b64eb535e1';
import { aiChoose as simAiChoose, pickTactic } from './js/ai.js?v=b9925728d7';
import {
  initAudio, sfx, music, unlock, noteGesture, isSoundMuted, setSoundMuted, isMusicMuted, setMusicMuted,
} from './js/audio.js?v=ce8cdf6a6e';
import {
  RoomClient, prettyRoomError, inviteUrl, shouldCatchUp, CLOCK_SHOW_S,
} from './js/net.js?v=35baab622b';
import { transition, runWar, warSpeed, WATCH_TURNS } from './js/flow.js?v=fb268dfd34';
import { PV_W, PV_H, PV_FOE_HP, createPreview, stepPreview } from './js/preview.js?v=8e81275ae7';
import { createReplay } from './js/replay.js?v=3f9ccfd889';
import { createRenderer, drawChassis } from './js/render.js?v=5cf54c957b';
import { createInput, touchOnly, stepArm } from './js/input.js?v=9287dbfb97';
import { renderHelp } from './js/ui/help.js?v=7366b18437';
import { renderMenu as drawMenu } from './js/ui/menu.js?v=6ebee3dc2d';
import {
  createChatter, pick, TANK_FIRE, TANK_HIT, TANK_MISS, TANK_OWS, FOE_FIRE, FOE_HIT, FOE_MISS, FOE_DYING, TANK_IDLE, FOE_IDLE,
} from './js/chatter.js?v=48b9223047';
import { createEffects, FX, FX_BUDGET } from './js/effects.js?v=1be294b3bc';
import { createShop } from './js/shop.js?v=da716ab023';
import { createHud } from './js/hud.js?v=a4c4a2d226';
import { createView } from './js/view.js?v=b74c254da9';
import { createTutorial } from './js/tutorial.js?v=aa28ddad64';
import { createGuns } from './js/guns.js?v=a709bb7875';
import { createScores } from './js/scores.js?v=8402272957';
import { createMatch } from './js/match.js?v=57b9189a68';
import { createRoom } from './js/room.js?v=a3374f3b19';
import { createLobby } from './js/lobby.js?v=5aaa83b235';
import { drawShellIcon as paintShellIcon, drawGearIcon as paintGearIcon, drawUnitIcon } from './js/ui/icons.js?v=b8eec86a1f';

const $ = id => document.getElementById(id);

/* Keys and touch live in src/input.ts: it holds the key table (game.yaml's keys
// section, served as game.json, with a frozen fallback), turns a key press or a
// held pad button into a named command, and runs the held-key arm movement.
// This file says what each command does (bindKeys below). */

/* Phones and tablets: a touch screen with no mouse or trackpad. They get no
// keyboard at all, so key bindings stay off and no label names a key. */
const TOUCH = touchOnly(typeof window.matchMedia === 'function' ? q => window.matchMedia(q) : undefined);
const input = createInput({ touch: TOUCH });

/* ---------- audio: lives in src/audio.ts ---------- */
music.onTrackStart(t => say(`Now playing: ${t.title || t.file}${t.credit ? ` (${t.credit})` : ''}.`, 'info'));

/* ---------- weapons ---------- */
/* The arsenal lives in game.yaml (served as game.json), not here: ballistics,
// prices, packs, unlock rounds, AI access, blurbs, and paint jobs all come
// from that file so adding a shell never touches this code. Until it arrives
// (or when it cannot, e.g. file:// play), this baked fallback, shaped like
// game.json's arsenal section, keeps the war rolling. */
const FALLBACK_ARSENAL = {
  ammo: [
    { key: 'shell', name: 'Shell', cat: 'Shells', dmg: 34, radius: 26, price: 0, pack: 0, minRound: 1, ai: true, aiRound: 1, effect: 'shot', speed: 1.0, note: 'Free, straight, honest.', gfx: { shell: '#ffe27a', trail: '#ffd75e', blast: ['#ffb13c', '#fff3c4'], painter: 'disc', shake: 0.3 } },
    { key: 'buck', name: 'Buckshot', cat: 'Shells', dmg: 17, radius: 20, price: 80, pack: 2, minRound: 1, ai: true, aiRound: 2, effect: 'pellets', pellets: 3, spread: 0.10, speed: 1.0, note: 'Three pellets, forgiving aim.', gfx: { shell: '#ffd166', trail: '#ffb13c', blast: ['#ffb13c', '#fff3c4'], painter: 'disc', shake: 0.3 } },
    { key: 'mortar', name: 'Mortar', cat: 'Shells', dmg: 56, radius: 42, price: 200, pack: 2, minRound: 1, ai: true, aiRound: 3, effect: 'shot', speed: 1.0, note: 'Big crater, slow shell.', gfx: { shell: '#ff9f43', trail: '#ff7b39', blast: ['#ff7b39', '#ffe27a'], painter: 'disc', shake: 0.5 } },
    { key: 'rail', name: 'Rail', cat: 'Shells', dmg: 56, radius: 15, price: 140, pack: 2, minRound: 1, ai: true, aiRound: 5, effect: 'shot', flat: true, speed: 1.0, note: 'Flies fast and nearly flat.', gfx: { shell: '#9fd8ff', trail: '#9fd8ff', blast: ['#9fd8ff', '#ffffff'], painter: 'beam', shake: 0.3 } },
    { key: 'nuke', name: 'NUKE', cat: 'Shells', dmg: 95, radius: 70, price: 500, pack: 1, minRound: 4, ai: false, aiRound: 99, effect: 'shot', speed: 1.0, note: 'Levels whole hillsides.', gfx: { shell: '#ff6b6b', trail: '#ff6b6b', blast: ['#ff6b6b', '#fff3c4'], painter: 'disc', shake: 0.9 } },
  ],
  gear: [
    { key: 'repair', name: 'Repair +40 armor', cat: 'Hull and fuel', price: 120, n: 40, effect: 'repair', note: 'Restores 40 armor, banked for next round.' },
    { key: 'fuel', name: 'Fuel +60', cat: 'Hull and fuel', price: 60, n: 60, effect: 'fuel', note: 'Adds 60 driving fuel.' },
  ],
};
let ARSENAL = null; // the same tables, as the sim takes them
let WEAPONS = {};
let WORDER = [];
let SHOP = [];
let GEAR = {};
let ARSENAL_REV = 0; // counts arsenal rebuilds; the shop repaints its icons when it changes
/* The icons draw what they are handed (src/ui/icons.ts); these look the weapon or trick up by key. */
const drawShellIcon = (cv, wkey) => paintShellIcon(cv, WEAPONS[wkey]);
const drawGearIcon = (cv, gkey) => paintGearIcon(cv, GEAR[gkey]);
function buildArsenal(data) {
  const a = simBuildArsenal(data);
  if (!a) return false;
  ARSENAL_REV++;
  ARSENAL = a; WEAPONS = a.weapons; WORDER = a.order; SHOP = a.shop; GEAR = a.gear;
  G.shopSel = clamp(G.shopSel || 0, 0, SHOP.length - 1);
  return true;
}
function applyArsenal(data) {
  if (data && Array.isArray(data.ammo) && data.ammo.length && buildArsenal(data)) {
    say(`Arsenal loaded: ${WORDER.length} shells, ${Object.keys(GEAR).length} tricks.`, 'info');
    if (G.phase === 'shop') renderShop();
    renderHUD();
  }
}
/* One file feeds the client: arsenal, keys, audio and effects all come from
   game.json (written from game.yaml). Any part that is missing or fails
   leaves that part's baked fallback in charge. */
async function loadGameConfig() {
  try {
    const res = await fetch('game.json', { headers: { Accept: 'application/json' } });
    if (!res.ok) return;
    const data = await res.json();
    if (!data) return;
    installEffects(data.effects);
    applyArsenal(data.arsenal);
    applyKeys(data.keys);
    initAudio(data.audio);
  } catch (_) { /* the baked fallbacks keep the war rolling */ }
}

 // live particles on the battlefield, hard cap


/* ---------- state ---------- */
const G = {
  seed: '', rng: null, body: 'tank',
  terrain: null, clouds: [],
  tanks: [], turn: 0, phase: 'aim', // banner | shop | aim | think | fly | settle | over (src/flow.ts)
  thinkT: 0, settleT: 0,
  shells: [], parts: [], booms: [], fx: null,
  wind: 0, round: 1, firstTurn: 0,
  lives: TUNE.lives, score: 0, cash: 0, nextOneUp: TUNE.oneUpEvery,
  roundsWon: 0, ammo: null, selected: 'shell',
  shopSel: 0, shopQty: 1,
  fuelBank: 0, repairBank: 0,
  plate: 0, shield: false, jammer: 0, bunker: 0, laststand: false,
  time: 0, shake: 0,
  dlgQ: [], dlgT: 0, lastTalk: -99, banterT: 30, bannerT: 0, bannerDone: null,
  cam: { z: 1, cx: 360, cy: 230 },
  over: false, won: false,
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
const { fxSet, installEffects, fxMuzzle, fxImpact, fxSpecial, fxTrail } = createEffects({ G, tables });
G.fx = FX ? FX.createSystem({ max: FX_BUDGET }) : null;
/* What the crew says (src/chatter.ts): the trash-talk queue and the radio log. */
const { talk, exchange, pumpDialogue, say, renderLogOverlay } = createChatter({
  G, $, keyHint, toggleOverlay, refreshNavHints, placeLogBelowMenu,
});
const me = () => G.tanks[0];
const alive = () => G.tanks.filter(t => t.hp > 0);
const foesAlive = () => G.tanks.filter(t => !t.isPlayer && t.hp > 0);

function surfY(x) {
  return simSurfY(G.terrain, x);
}


/* ---------- turns, firing, ballistics ---------- */
function cur() {
  return G.tanks[G.turn];
}
function spotTaken(t, x) {
  return simSpotTaken(G.tanks, t, x);
}
/* The help is a Preact component too (src/ui/help.tsx), drawn into the section
   in the page; it redraws when the key table changes. */
function renderHelpOverlay() {
  const section = $('help-overlay');
  if (section) renderHelp(section, { keyHint, onClose: () => toggleOverlay('help-overlay', 'btn-help') });
}

/* ---------- firing range: a live mini demo sharing the real ballistics ---------- */
/* The demo itself is src/preview.ts; this is its environment, and the opening
 * and closing of its veil. */
const previewEnv = {
  weapon: key => WEAPONS[key],
  muzzle: (sys, wkey, x, y, ang) => fxMuzzle(sys, wkey, x, y, ang),
  impact: (sys, wkey, x, y, r) => { fxImpact(sys, wkey, x, y, r); },
  special: (sys, wkey, name, x, y, ang) => fxSpecial(sys, wkey, name, x, y, ang),
  trail: (sys, shell, dt) => fxTrail(sys, shell, dt),
  showResult: text => {
    const pr = $('preview-result');
    if (pr) pr.textContent = text;
  },
};
function openPreview(wkey) {
  const w = WEAPONS[wkey];
  if (!w) return;
  G.preview = createPreview(wkey, previewEnv, FX ? FX.createSystem({ max: 260 }) : null,
    document.getElementById('preview-stage'));
  const pr = $('preview-result');
  if (pr) pr.textContent = '';
  const title = $('preview-title');
  const dmg = (w.effect === 'pellets' && w.pellets) ? `${w.dmg}×${w.pellets}` : `${w.dmg}`;
  if (title) title.textContent = w.name;
  const stats = $('preview-stats');
  if (stats) stats.textContent = `${dmg} damage · blast ${w.radius} · direct hits count double`;
  const veil = $('preview-veil');
  if (veil) veil.hidden = false;
  refreshNavHints();
  sfx.play('click');
}
function closePreview() {
  if (G.preview && G.preview.fx) G.preview.fx.clear();
  G.preview = null;
  const veil = $('preview-veil');
  if (veil) veil.hidden = true;
}
function togglePreview() {
  if (G.preview) closePreview();
  else openPreview(G.selected);
}
/* Ground units: every human (you, and the people in a room) picks a body.
   Bodies are looks only; all share the turret pivot at (0, -12), so aim,
   muzzle and shots are identical whichever one you drive. */
const UNIT_BODIES = [
  { key: 'tank', name: 'Tank' },
  { key: 'hover', name: 'Hover' },
  { key: 'walker', name: 'Walker' },
  { key: 'buggy', name: 'Buggy' },
];
/* The unit picker in the Game menu: one button per body, each with a small
   drawing of it. The choice is remembered and, in a room, shared. */
function loadBody() {
  try {
    const b = window.localStorage.getItem('tankity-body');
    if (UNIT_BODIES.some(u => u.key === b)) return b;
  } catch (_) { /* storage off: default body */ }
  return 'tank';
}
function chooseBody(key) {
  if (!UNIT_BODIES.some(u => u.key === key)) return;
  G.body = key;
  try { window.localStorage.setItem('tankity-body', key); } catch (_) { /* fine */ }
  const mine = net.on ? myTank() : (G.tanks || []).find(t => t.isPlayer);
  if (mine) mine.body = key;
  net.sendBody(key);
  renderMenu();
}
/* Text size: a menu setting kept in this browser. It scales every panel
   (they size in rem) and the name tags over the units. */
const TEXT_SIZES = [
  { key: 's', name: 'Small', scale: 0.9 },
  { key: 'm', name: 'Normal', scale: 1 },
  { key: 'l', name: 'Large', scale: 1.15 },
  { key: 'xl', name: 'Huge', scale: 1.3 },
];
let TEXT_SIZE = 'm';
function textScale() {
  return (TEXT_SIZES.find(t => t.key === TEXT_SIZE) || TEXT_SIZES[1]).scale;
}
function loadTextSize() {
  let key = 'm';
  try { key = window.localStorage.getItem('tankity-text') || 'm'; } catch (_) { /* no storage: default */ }
  applyTextSize(TEXT_SIZES.some(t => t.key === key) ? key : 'm');
}
function applyTextSize(key) {
  TEXT_SIZE = key;
  if (document.documentElement && document.documentElement.style) {
    document.documentElement.style.fontSize = `${textScale() * 100}%`;
  }
  renderMenu();
  placeLogBelowMenu();
}
function chooseTextSize(key) {
  if (!TEXT_SIZES.some(t => t.key === key)) return;
  try { window.localStorage.setItem('tankity-text', key); } catch (_) { /* fine */ }
  applyTextSize(key);
  sfx.play('click');
}
/* The game menu is a Preact component (src/ui/menu.tsx): it gets what it shows
   (the unit, the text size, what is muted, whether a room runs) and reports
   clicks. The seed box stays the page's own. */
function renderMenu() {
  const section = $('menu-overlay');
  if (!section) return;
  drawMenu(section, {
    keyHint,
    onClose: () => toggleOverlay('menu-overlay', 'btn-menu'),
    onNewGame: () => { unlock(); sfx.play('click'); freshMatchFromSeedBox(); },
    onSubmit: () => {
      if (net.on) { netLeave(); return; }
      sfx.play('click');
      freshMatchFromSeedBox();
    },
    units: UNIT_BODIES,
    unit: G.body,
    drawUnit: drawUnitIcon,
    onPickUnit: chooseBody,
    sizes: TEXT_SIZES,
    size: TEXT_SIZE,
    onPickSize: chooseTextSize,
    sound: !isSoundMuted(),
    music: !isMusicMuted(),
    fullscreen: !!document.fullscreenElement,
    onSound: toggleSound,
    onMusic: toggleMusic,
    onFullscreen: toggleFullscreen,
    onRandom: randomRun,
    onRooms: openRooms,
    onTutorial: () => { sfx.play('click'); tutorialOpen(); },
    onScores: () => toggleOverlay('report-overlay', 'scores-open'),
    inRoom: net.on,
    onLeave: openLeaveVeil,
  });
}


/* ---------- main loop ---------- */
let lastT = 0;
function frame(ts) {
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
    for (const cl of G.clouds) {
      cl.x += cl.v * dt;
      if (cl.x - 40 > W) cl.x = -40;
    }
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
  fallTanks(dt);
  tickTutorial();
  for (const cl of G.clouds) {
    cl.x += cl.v * dt;
    if (cl.x - 40 > W) cl.x = -40;
  }
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
  while (!net.on && G.score >= G.nextOneUp) {
    G.nextOneUp += TUNE.oneUpEvery;
    if (G.lives < TUNE.maxLives) {
      G.lives += 1;
      sfx.play('win');
      say(`1-UP! Extra life! (${G.lives}/${TUNE.maxLives} lives)`, 'good');
      talk('tank', 'Another life! I am basically immortal!', true);
    } else {
      G.score += 500;
      say('Max lives already, so take +500 points instead!', 'good');
    }
  }
  if (G.phase === 'aim' && cur().isPlayer && !G.demo) {
    const t = me();
    const arm = stepArm(input.held, dt, t, facing(t));
    t.angle = arm.angle;
    t.power = arm.power;
    if ((input.held.has('driveLeft') || input.held.has('driveRight')) && t.fuel > 0) {
      const dx = input.held.axis('driveLeft', 'driveRight');
      const step = dx * TUNE.driveSpeed * dt;
      if (Math.abs(step) > 0 && Math.abs(t.fuel) >= Math.abs(step)) {
        const nx = clamp(t.x + step, 12, W - 12);
        if (!spotTaken(t, nx)) {
          t.fuel -= Math.abs(step);
          t.x = nx;
          t.y = surfY(t.x);
        }
      }
    }
  } else if (G.phase === 'think' || G.phase === 'fly' || G.phase === 'settle') {
    // With the player's tank wrecked the drones play on at triple speed.
    runWar(dt, warSpeed(me().hp > 0, G.demo), (d, i) => {
      if (i > 0) fallTanks(d);
      stepWar(d);
      return !G.over && (G.phase === 'think' || G.phase === 'fly' || G.phase === 'settle');
    });
  }
  updateCamera(dt);
  render();
  renderHUD();
}

/* The room client (js/net.js, from src/net.ts) owns the session, the
   transport, polling, the senders and the clocks, and reaches this page only
   through the handlers below: it reports the snapshot and the events it has
   not seen (netOnSnapshot), whether the server answers (the dots), and a
   Ready change or a failed send. fetch, timers and the clock are handed in. */
function browserRoomEnv() {
  return {
    fetch: (url, init) => fetch(url, init),
    setTimeout: (fn, ms) => setTimeout(fn, ms),
    setInterval: (fn, ms) => setInterval(fn, ms),
    clearInterval: id => clearInterval(id),
    now: () => performance.now(),
    beacon: (url, body) => typeof navigator !== 'undefined' && !!navigator.sendBeacon && navigator.sendBeacon(url, body),
  };
}
const net = new RoomClient(browserRoomEnv(), {
  onReachable: on => setNetDot(on),
  onSnapshot: (room, fresh, first) => netOnSnapshot(room, fresh, first),
  onReadyChange: () => renderShopReady(),
  onError: err => say(prettyRoomError(err), 'bad'),
});
/* What the page keeps of a room match: whose turn it reads as, the aim and
   drive it has not sent, the room snapshot waiting for the replay to drain,
   and the last snapshot it drew. The replay queue and the volley on screen
   live in `replay` (src/replay.ts), declared below. */
const MATCH = {
  myTurn: false, aimDirty: false, driveAcc: 0, driveT: 0,
  pendingRoom: null,
  lastPhase: '', lastTurn: -1, lastRound: -1, initials: '',
};
const replay = createReplay({
  tank: seat => G.tanks.find(t => t.seat === seat),
  effect: wkey => (WEAPONS[wkey] || {}).effect,
  event: e => netEvent(e),
  launch: () => sfx.play('launch'),
  blast: (x, y, r, wkey) => netBlast(x, y, r, wkey),
  muzzle: (wkey, x, y, ang) => fxMuzzle(G.fx, wkey, x, y, ang),
  special: (wkey, name, x, y, ang) => fxSpecial(G.fx, wkey, name, x, y, ang),
  trail: (shot, dt, x, y, vx, vy, wkey) => fxTrail(G.fx, shot, dt, x, y, vx, vy, wkey),
});
/* The status bar's values (src/hud.ts). */
const { HUD, paintHud, windText, renderHUD } = createHud({
  G, $, tables, net, MATCH, me, cur, myTank, seatName, drawShellIcon, openGuns: () => openGuns(),
});
/* The camera and the frame the canvas paints (src/view.ts). */
const { updateCamera, shownAngle, shownPower, render, windGaugeTop } = createView({
  G, $, tables, net, MATCH, replay, FX, fxSet, cur, textScale,
});
/* The high scores (src/scores.ts). */
const { SCORES, renderScoresOverlay, loadScores, savedCallsign, fileReport } = createScores({
  G, $, keyHint, say, toggleOverlay,
});
/* The coach (src/tutorial.ts). */
const {
  renderTutorial, maybeStartTutorial, tutorialOpen, endTutorial, skipTutorial, tickTutorial,
  isActive: tutorialActive, arm: armTutorial, noteFired: tutorialFired,
} = createTutorial({
  G, $, TOUCH, net, sfx, me, keyHint, keyCap, say, refreshNavHints, closeOverlays, freshMatchFromSeedBox,
});
/* The solo match (src/match.ts): dealing, turns, blasts, the drone's shot, the end veil. A dependency
   on a module wired further down is passed as an arrow, so it resolves when it is called. */
const {
  advance, startDemo, startSolo, newRound, demoBlock, playerFire, nextTurn, fallTanks, anyTankFalling, settle, END,
  renderEndVeil, endMatch, startBanner, tickBanner, nextRound, stepWar, decayFx,
} = createMatch({
  G, $, TOUCH, tables, net, sfx, music, unlock, alive, foesAlive, me, cur, surfY, talk, exchange, say, keyHint, windText,
  render, renderHUD, refreshNavHints, fxMuzzle, fxImpact, fxSpecial, fxTrail, closePreview, endTutorial, maybeStartTutorial,
  tutorialFired, fileReport, savedCallsign, freshMatchFromSeedBox,
  closeGuns: () => closeGuns(), hideShop: () => hideShop(), openShop: () => openShop(),
  netFire: () => netFire(), netLeave: quiet => netLeave(quiet), netNext: want => netNext(want),
  netRematch: () => netRematch(), openLobby: () => openLobby(),
});
/* The field shop (src/shop.ts): prices, rows, buying, the Ready line. */
const {
  openShop, hideShop, renderShop, renderShopReady, buyItem, maxPacks, shopSelect, shopQtyUp, shopQtyDown,
} = createShop({
  G, $, tables, net, sfx, me, keyCap, keyHint, say, advance, render, renderHUD, refreshNavHints,
  drawShellIcon, drawGearIcon, openPreview, nextRound, openLeaveVeil: () => openLeaveVeil(), netBuy: (it, qty) => netBuy(it, qty),
});
/* The weapon picker (src/guns.ts). */
const {
  GUN_COLS, selectWeapon, rackGuns, gunsOpen, openGuns, closeGuns, renderGuns, pickGun, moveGunCursor, cycleWeapon, gunGrid,
  cursorAt: gunCursorAt,
} = createGuns({
  G, $, tables, net, sfx, keyHint, say, refreshNavHints, renderHUD, drawShellIcon, demoBlock,
  netPick: w => netPick(w), netCycle: () => netCycle(),
});
/* A running room match on this client (src/room.ts): moves sent, snapshots adopted, events told, the turn alert. */
const {
  netFire, netSendAim, netPick, netCycle, netBuy, netNext, netOnSnapshot, netEvent, netBlast, askNotifications,
  turnAlert, clearTurnAlert, netCatchUp, netFrame, netShowStandings,
} = createRoom({
  G, $, tables, net, MATCH, HUD, END, replay, input, sfx, music, myTank, seatName, talk, say, closeOverlays, closePreview,
  decayFx, fallTanks, fxImpact, hideShop, pumpDialogue, refreshNavHints, render, renderEndVeil, renderHUD, renderShop,
  renderShopReady, shownAngle, shownPower, startBanner, updateCamera, windText,
});
/* Getting into and out of a room (src/lobby.ts): the lobby, hosting, joining, the invite, leaving, the rematch. */
const {
  LOBBY, renderLobby, setNetDot, loadOccupancy, openLobby, maybeApplyInviteCode, renderLeaveVeil, openLeaveVeil, closeLeaveVeil,
  netLeave, netRematch,
} = createLobby({
  G, $, net, MATCH, HUD, END, SCORES, replay, sfx, unlock, say, keyHint, askNotifications, netEvent, seatName, closeLobbyVeil,
  closeOverlays, closePreview, endTutorial, freshMatchFromSeedBox, hideShop, paintHud, refreshNavHints, renderEndVeil, renderMenu,
  renderScoresOverlay, renderShop,
});
function myTank() {
  for (const t of G.tanks) if (t.isPlayer) return t;
  return null;
}
function seatName(seat) {
  const s = net.seats[seat];
  if (!s || !s.name) return 'seat ' + (seat + 1);
  return s.name;
}


/* ---------- input + init ---------- */
function applyKeys(def) {
  if (!input.setKeys(def)) return;
  renderKeyHints();
  renderHelpOverlay();
  renderShop();
  renderMenu();
  renderLobby();
  renderGuns();
  renderScoresOverlay();
  renderLogOverlay();
  renderTutorial();
  renderEndVeil();
  renderLeaveVeil();
}
/* " (KEY)" for a button label; nothing on touch screens. */
function keyCap(ctx, action) {
  return TOUCH ? '' : ` (${keyHint(ctx, action)})`;
}
/* The shown key for an action: the first token its context lists, or the
// nth with data-keyhint="context:action:n" where prose names two keys. */
function keyHint(ctx, action, idx) {
  return input.hint(ctx, action, idx);
}
/* Fill every [data-keyhint] span in the page at boot and again if game.json
// loads late, so labels can never drift from behavior. The Preact overlays
// (marked data-ui) fill their own from the same keyHint. */
function renderKeyHints() {
  document.querySelectorAll('[data-keyhint]').forEach(el => {
    if (el.closest && el.closest('[data-ui]')) return;
    const parts = (el.getAttribute('data-keyhint') || '').split(':');
    const cap = parts.length >= 2 ? keyHint(parts[0], parts[1], +(parts[2] || 0)) : '';
    const bare = el.className === 'key';
    el.textContent = cap ? (bare ? `(${cap})` : cap) : '';
  });
}
function freshMatchFromSeedBox(opts) {
  // A new match takes the whole frame: shut any panels so the menu never
  // sits over the briefing and the shop never opens underneath it.
  closeOverlays();
  // Leaving a coached battle counts as having seen it; asking for the
  // tutorial (U or the menu) always deals this match with the coach on.
  endTutorial(tutorialActive());
  if (opts && opts.tut) armTutorial();
  const seedInput = $('seed-input');
  startSolo(seedInput ? seedInput.value : '');
  render(); renderHUD();
}
function randomRun() {
  const seedBox = $('seed-input');
  if (seedBox) seedBox.value = 'scorched-' + Math.floor(Math.random() * 90000 + 10000);
  freshMatchFromSeedBox();
}
function openRooms() {
  unlock();
  sfx.play('click');
  openLobby();
}
/* Toolbar tips: resting the pointer (or keyboard focus) on an icon button
   for a moment shows its name, what it does and its key in a styled card.
   Touch screens have no hover, and their buttons keep spoken names. */
const TIP_DELAY_MS = 700;
function bindToolTips() {
  const tip = $('tool-tip');
  if (!tip || !document.querySelectorAll) return;
  let timer = 0;
  const hide = () => { clearTimeout(timer); timer = 0; tip.hidden = true; };
  const show = btn => {
    const name = tip.querySelector('.tool-tip-name');
    const desc = tip.querySelector('.tool-tip-desc');
    const key = btn.querySelector('.key');
    if (name) name.textContent = btn.getAttribute('data-tip') || '';
    if (desc) desc.textContent = (btn.getAttribute('data-tip-desc') || '') + (key && !TOUCH ? ` ${key.textContent}` : '');
    tip.style.setProperty('--tool', btn.style.getPropertyValue('--tool') || '#ffc93c');
    tip.hidden = false;
    const r = btn.getBoundingClientRect(), t = tip.getBoundingClientRect();
    const left = Math.max(6, Math.min(window.innerWidth - t.width - 6, r.left + r.width / 2 - t.width / 2));
    tip.style.left = `${left}px`;
    tip.style.top = `${r.bottom + 8}px`;
  };
  document.querySelectorAll('.guide-actions .tool').forEach(btn => {
    const arm = () => { clearTimeout(timer); timer = setTimeout(() => show(btn), TIP_DELAY_MS); };
    btn.addEventListener('mouseenter', arm);
    btn.addEventListener('mouseleave', hide);
    btn.addEventListener('focus', () => { if (!btn.matches || btn.matches(':focus-visible')) arm(); });
    btn.addEventListener('blur', hide);
    btn.addEventListener('pointerdown', hide);
  });
}
/* Another panel (menu, help, report, log) open above the shop takes the keys. */
function shopCovered() {
  return ['menu-overlay', 'help-overlay', 'report-overlay', 'log-overlay', 'gun-overlay'].some(id => { const el = $(id); return el && !el.hidden; });
}
/* A line key (j/k): in the shop it walks the rows, like the arrows; in the gun
// picker it moves the cursor; with any other panel open it scrolls that panel.
// Paging keys only ever scroll. */
function lineKey(dir) {
  if (G.phase === 'shop' && !G.over && !G.preview && !shopCovered()) return shopSelect(dir);
  if (gunsOpen()) { moveGunCursor(dir); return true; }
  return scrollOverlay(dir, 0);
}
/* Input maps keys and touches to named commands (the action names of
// game.json's keys section); this says what each does in the current context.
// A handler that returns true used the key; one that returns nothing declines,
// and the key falls through to the next candidate. The order they are offered
// in (panel scrolling, the gun grid, the shop, ESC, the held aim keys, fire,
// then the plain global keys) is src/input.ts's. */
function bindKeys() {
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
      if (!p.repeat) pickGun(rackGuns()[gunCursorAt()]);
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
    buy: () => { buyItem(SHOP[G.shopSel], G.shopQty); return true; },
    preview: () => {
      const it = SHOP[G.shopSel];
      if (it && it.kind === 'ammo') { openPreview(it.w); return true; }
      return 'quiet'; // V does nothing else in the shop
    },
    // ESC in the shop shuts the firing range first, then any open panel
    // (the menu can sit above the shop), and only rolls out to the round
    // when nothing is left to shut. N is the plain way out.
    close: () => {
      if (G.preview) closePreview();
      else if (closeLeaveVeil()) { /* the question closed */ }
      else if (!closeOverlays()) { if (net.on) netNext(true); else nextRound(); } // ESC readies, never unreadies
      return true;
    },
    escape: () => {
      if (G.preview) { closePreview(); return; }
      if (closeLeaveVeil()) return;
      if (tutorialActive()) { skipTutorial(); return; }
      if (closeLobbyVeil()) return;
      closeOverlays();
    },
    fire: () => { unlock(); music.start(); playerFire(); },
    music: () => { toggleMusic(); },
    nextTrack: () => { unlock(); music.next(); },
    sound: () => { toggleSound(); },
    log: () => { toggleOverlay('log-overlay', 'btn-log'); },
    help: () => { toggleOverlay('help-overlay', 'btn-help'); },
    report: () => { toggleOverlay('report-overlay', 'scores-open'); },
    // C opens the menu; ESC does the closing.
    menu: () => {
      const mv = $('menu-overlay');
      if (mv && mv.hidden) toggleOverlay('menu-overlay', 'btn-menu');
    },
    // Random hills and the rooms lobby stay out of the shop so a buying
    // spree never misfires into a new match.
    random: () => { if (G.phase !== 'shop') randomRun(); },
    rooms: () => { if (G.phase !== 'shop') openRooms(); },
    new: () => {
      if (G.phase === 'shop') nextRound();
      else freshMatchFromSeedBox();
    },
    cycle: () => { cycleWeapon(); if (gunsOpen()) renderGuns(); },
    guns: () => { if (gunsOpen()) closeGuns(); else openGuns(); },
    tutorial: () => { tutorialOpen(); },
    battlePreview: () => { togglePreview(); },
    fullscreen: () => { toggleFullscreen(); },
  }, {
    shopLive: p => G.phase === 'shop' && !G.over && !p.repeat,
    // The leave question holds every key but ESC (which answers "stay").
    modalOpen: () => { const ask = $('leave-veil'); return !!ask && !ask.hidden; },
    modalEscape: () => { closeLeaveVeil(); },
    onHold: () => { unlock(); music.start(); },
  });
  input.bind(window);
}
function init() {
  if (TOUCH) document.documentElement.classList.add('touch');
  renderHelpOverlay();
  bindKeys();
  bindToolTips();
  loadGameConfig();
  G.body = loadBody();
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
  renderShop();
  loadScores();
  // Light the connection dot from the start, not only when the lobby opens.
  loadOccupancy();
  maybeApplyInviteCode();

  document.querySelectorAll('[data-aim]').forEach(btn => {
    const act = { up: 'powerUp', down: 'powerDown', left: 'barrelLeft', right: 'barrelRight' }[btn.getAttribute('data-aim')];
    input.bindHold(btn, act);
  });
  const cannon = $('btn-cannon');
  if (cannon) cannon.addEventListener('click', ev => { ev.currentTarget.blur(); unlock(); music.start(); playerFire(); });
  const track = $('btn-track');
  if (track) track.addEventListener('click', ev => { ev.currentTarget.blur(); unlock(); music.next(); });
  const weapon = $('btn-weapon');
  if (weapon) weapon.addEventListener('click', ev => { ev.currentTarget.blur(); if (gunsOpen()) closeGuns(); else openGuns(); });
  for (const [id, act] of [['btn-drive-l', 'driveLeft'], ['btn-drive-r', 'driveRight']]) {
    const btn = $(id);
    if (btn) input.bindHold(btn, act);
  }
  for (const [btnId, ovId] of [['btn-log', 'log-overlay'], ['btn-help', 'help-overlay']]) {
    const b = $(btnId);
    if (b) b.addEventListener('click', ev => { ev.currentTarget.blur(); toggleOverlay(ovId, btnId); });
  }
  const menuBtn = $('btn-menu');
  if (menuBtn) menuBtn.addEventListener('click', ev => { ev.currentTarget.blur(); toggleOverlay('menu-overlay', 'btn-menu'); });
  if (document.addEventListener) document.addEventListener('fullscreenchange', syncFullscreenLabel);
  if (document.addEventListener) document.addEventListener('fullscreenchange', lockEscapeInFullscreen);
  const pvClose = $('preview-close');
  if (pvClose) pvClose.addEventListener('click', ev => { ev.currentTarget.blur(); closePreview(); });
  // Any touch or keypress unlocks the speakers and (re)starts a non-muted
  // song, so music never sits claiming to play while silent after a refresh.
  // This fires before the game keys, and starting twice is a harmless no-op.
  const kickAudio = ev => {
    // A first tap that turns the music off must not fetch a track.
    const hit = ev.type === 'keydown' ? input.lookup('global', ev)
      : (ev.target && ev.target.closest && ev.target.closest('#btn-music') ? 'music' : '');
    noteGesture(hit === 'music');
  };
  window.addEventListener('pointerdown', kickAudio, true);
  window.addEventListener('keydown', kickAudio, true);
  window.addEventListener('pagehide', () => net.sendLeave());
  window.addEventListener('resize', refreshNavHints);
  window.addEventListener('resize', placeLogBelowMenu);
  placeLogBelowMenu();
  requestAnimationFrame(frame);
}
/* The log hangs just under the menu strip, whose height changes with the
   frame width, so it never covers the battle buttons. */
function placeLogBelowMenu() {
  G.windTop = windGaugeTop();
  // The speech bubble rides just above the status bar, never over it.
  const hud = document.querySelector && document.querySelector('.hudbar');
  const dlg = $('dialogue');
  const holder = dlg && dlg.parentElement;
  if (hud && dlg && holder && holder.offsetHeight && hud.offsetHeight) {
    dlg.style.bottom = `${holder.offsetHeight - hud.offsetTop + 6}px`;
  }
  const bar = $('menubar');
  const log = $('log-overlay');
  if (!bar || !log || !bar.offsetHeight) return;
  log.style.top = `${bar.offsetTop + bar.offsetHeight + 6}px`;
}
function toggleSound() {
  setSoundMuted(!isSoundMuted());
  renderMenu();
}
function toggleMusic() {
  setMusicMuted(!isMusicMuted());
  renderMenu();
}
/* Keyboard scrolling for panels: the topmost open veil or overlay takes
line, page, and half-page keys. Mouse wheels and touch keep working as
before; these keys are the no-mouse way to reach what does not fit. */
const SCROLL_LINE = 40;
function overlayScrollTarget() {
  // The shop list scrolls inside its card, so it takes the keys directly.
  const shopVeil = $('shop-veil');
  if (shopVeil && !shopVeil.hidden) return $('shop-list');
  for (const id of ['lobby-veil', 'preview-veil', 'end-veil',
      'gun-overlay', 'help-overlay', 'report-overlay', 'menu-overlay', 'log-overlay']) {
    const el = $(id);
    if (el && !el.hidden) return el;
  }
  return null;
}
function scrollOverlay(lines, pages) {
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
const NAV_HINTS = [
  // The shop scrolls its list, not its veil.
  ['shop-list', 'nav-shop'], ['lobby-veil', 'nav-lobby'],
  ['preview-veil', 'nav-preview'], ['end-veil', 'nav-end'],
  ['help-overlay', 'nav-help'], ['report-overlay', 'nav-report'],
  ['menu-overlay', 'nav-menu'], ['log-overlay', 'nav-log'],
  ['tutorial-overlay', 'nav-tutorial'], ['gun-overlay', 'nav-gun'],
];
function refreshNavHints() {
  for (const [panelId, hintId] of NAV_HINTS) {
    const panel = $(panelId), hint = $(hintId);
    if (!panel || !hint) continue;
    const fits = (panel.scrollHeight || 0) <= (panel.clientHeight || 0) + 1;
    hint.setAttribute('aria-disabled', String(fits));
  }
}
/* ESC shuts whatever is overlaid: the firing range first, then the lobby,
then every open panel. The shop keeps its own ESC (next round). */
function closeLobbyVeil() {
  const veil = $('lobby-veil');
  if (!veil || veil.hidden) return false;
  veil.hidden = true;
  refreshNavHints();
  return true;
}
function closeOverlays() {
  let shut = closeGuns();
  for (const [ovId, btnId] of [['log-overlay', 'btn-log'], ['help-overlay', 'btn-help'],
      ['report-overlay', 'scores-open'], ['menu-overlay', 'btn-menu']]) {
    const ov = $(ovId);
    if (ov && !ov.hidden) { toggleOverlay(ovId, btnId); shut = true; }
  }
  return shut;
}
/* In-frame panels overlay the battle and never pause it. */
/* The panels a component draws: redrawn on open and close, so each knows it
   was closed and forgets its scroll (the browser reopens it at the top). */
const OVERLAY_PAINT = {
  'menu-overlay': () => renderMenu(),
  'log-overlay': () => renderLogOverlay(),
  'report-overlay': () => renderScoresOverlay(),
  'help-overlay': () => renderHelpOverlay(),
};
function toggleOverlay(id, btnId) {
  const ov = $(id);
  if (!ov) return;
  ov.hidden = !ov.hidden;
  if (OVERLAY_PAINT[id]) OVERLAY_PAINT[id]();
  const btn = btnId && $(btnId);
  if (btn) btn.setAttribute('aria-expanded', String(!ov.hidden));
  refreshNavHints();
}
function toggleFullscreen() {
  try {
    // The frame carries the canvas plus its HUD and pads, so the whole
    // battle goes fullscreen together.
    const el = $('frame') || document.documentElement;
    if (!el || !el.requestFullscreen || !document.exitFullscreen) {
      say('Fullscreen is not supported in this browser.', 'info');
      return;
    }
    if (document.fullscreenElement) void document.exitFullscreen();
    else void el.requestFullscreen();
  } catch (_) {
    say('Fullscreen is not available right now.', 'info');
  }
}
/* In fullscreen the browser takes ESC to leave fullscreen, so the game never
   sees it. Where Keyboard Lock exists (Chromium), claim ESC for the game:
   a tap closes menus as usual and holding ESC still leaves fullscreen. */
function lockEscapeInFullscreen() {
  const kb = navigator.keyboard;
  if (!kb || !kb.lock) return;
  if (document.fullscreenElement) kb.lock(['Escape']).catch(() => {});
  else kb.unlock();
}
function syncFullscreenLabel() {
  renderMenu();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
