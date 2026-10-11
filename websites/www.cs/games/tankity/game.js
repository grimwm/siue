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
import { renderShop as drawShop } from './js/ui/shop.js?v=650582befc';
import { renderLobby as drawLobby } from './js/ui/lobby.js?v=162ac098fa';
import { renderMenu as drawMenu } from './js/ui/menu.js?v=6ebee3dc2d';
import { renderGuns as drawGuns } from './js/ui/guns.js?v=71c87cf72b';
import { renderScores as drawScores } from './js/ui/scores.js?v=f0bf536feb';
import { renderLog as drawLog } from './js/ui/log.js?v=7bec951a92';
import { renderTutorial as drawTutorial } from './js/ui/tutorial.js?v=d501cd8bcc';
import { renderHud as drawHud } from './js/ui/hud.js?v=a5deccd438';
import { renderEndVeil as drawEndVeil } from './js/ui/endveil.js?v=6a7f00fd3c';
import { renderLeave as drawLeave } from './js/ui/leave.js?v=2c5012f581';
import { drawShellIcon as paintShellIcon, drawGearIcon as paintGearIcon, drawMapIcon, drawUnitIcon } from './js/ui/icons.js?v=b8eec86a1f';

/* ---------- audio: lives in src/audio.ts ---------- */
music.onTrackStart(t => say(`Now playing: ${t.title || t.file}${t.credit ? ` (${t.credit})` : ''}.`, 'info'));

/* ---------- dialogue: subtitled trash-talk, kid-friendly ---------- */
const SPEAKERS = {
  tank: { name: 'TANK', color: '#ffff00' },
  reaper: { name: 'REAPER', color: '#ff0000' },
  wraith: { name: 'WRAITH', color: '#00ffff' },
  spotter: { name: 'SPOTTER', color: '#ff00ff' },
};
const TANK_FIRE = ['bam bam!', 'tankity tank! Eat dirt!', 'Fire in the hole!'];
const TANK_HIT = ['Bullseye! Did you see that?', 'Ha! Right in the rotors!'];
const TANK_MISS = ['The wind! Blame the wind!', 'Ranging shot. Next one counts.'];
const TANK_OWS = ['Ow! My fender!', 'Hey! I just waxed that!'];
const FOE_FIRE = {
  reaper: ['Eat my lance, bumper-brain!', 'Hold still, tin can!'],
  wraith: ['From above, with love!', 'Phased and loaded!'],
  spotter: ['Solution locked. Goodbye!', 'I did the math. You lose.'],
};
const FOE_HIT = {
  reaper: ['Ha! Bumper soup!', 'Direct hit, baby!'],
  wraith: ['Gotcha between the hills!', 'Bullseye from the blue!'],
  spotter: ['Predicted! Predictable!', 'Told you I solved it!'],
};
const FOE_MISS = ['Grr! Recalibrating...', 'Must be the wind. Definitely the wind.'];
const FOE_DYING = {
  reaper: 'Tell my... targeting computer...',
  wraith: 'Fading... to periwinkle...',
  spotter: 'My calculations... were perfect...',
};
const TANK_IDLE = ['tankity tank! Still shiny!', 'Reading the wind like a novel.', 'Anyone else smell victory? Bit dusty.'];
const FOE_IDLE = [
  ['reaper', 'You aim like a shopping cart!'],
  ['wraith', 'Boo! The hills themselves fear me!'],
  ['spotter', 'I have simulated this duel. You lose 87% of them.'],
];
function talk(id, text, force) {
  if (!SPEAKERS[id]) return;
  if (!force && G.time - (G.lastTalk || -99) < 3) return;
  if (G.dlgQ.length >= 3 && !force) return;
  if (force && G.dlgQ.length >= 3) G.dlgQ.shift();
  G.dlgQ.push({ id, text });
  G.lastTalk = G.time;
}
function exchange(aId, aText, bId, bText) {
  talk(aId, aText, true);
  talk(bId, bText, true);
}
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function drawPortrait(cv, id) {
  if (!cv) return;
  const c = cv.getContext('2d');
  if (!c) return;
  c.clearRect(0, 0, 36, 36);
  c.fillStyle = '#00000b';
  c.fillRect(0, 0, 36, 36);
  if (id === 'tank') {
    c.fillStyle = '#101208';
    c.fillRect(4, 24, 28, 7);
    c.fillStyle = '#d7a800';
    c.beginPath();
    c.roundRect(6, 14, 20, 12, 4);
    c.fill();
    c.fillStyle = '#ffff00';
    c.beginPath();
    c.arc(15, 18, 6, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = '#1a1a00';
    c.fillRect(19, 16.5, 12, 4);
  } else {
    const col = (SPEAKERS[id] && SPEAKERS[id].color) || '#fff';
    c.strokeStyle = '#2b2e36';
    c.lineWidth = 3;
    for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      c.beginPath();
      c.moveTo(18, 18);
      c.lineTo(18 + sx * 10, 18 + sy * 10);
      c.stroke();
      c.fillStyle = 'rgba(225,232,245,0.5)';
      c.beginPath();
      c.ellipse(18 + sx * 10, 18 + sy * 10, 5, 1.6, 0, 0, Math.PI * 2);
      c.fill();
    }
    c.fillStyle = '#24242e';
    c.beginPath();
    c.roundRect(11, 12, 14, 12, 5);
    c.fill();
    c.strokeStyle = col;
    c.lineWidth = 2;
    c.beginPath();
    c.roundRect(11, 12, 14, 12, 5);
    c.stroke();
    c.fillStyle = '#ffffff';
    c.beginPath();
    c.arc(18, 18, 3, 0, Math.PI * 2);
    c.fill();
  }
}
function showDialogue(line) {
  const box = document.getElementById('dialogue');
  if (!box) return;
  drawPortrait(document.getElementById('portrait'), line.id);
  const nm = document.getElementById('dlg-name');
  if (nm) {
    nm.textContent = SPEAKERS[line.id].name;
    nm.style.color = SPEAKERS[line.id].color;
  }
  const tx = document.getElementById('dlg-line');
  if (tx) tx.textContent = line.text;
  placeLogBelowMenu(); // the status bar may have grown
  box.hidden = false;
}
function pumpDialogue(dt) {
  if (G.dlgT > 0) {
    G.dlgT -= dt;
    if (G.dlgT <= 0) {
      const box = document.getElementById('dialogue');
      if (box) box.hidden = true;
    }
    return;
  }
  if (G.dlgQ.length) {
    showDialogue(G.dlgQ.shift());
    G.dlgT = 2.8;
  }
}
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

/* ---------- effects ---------- */
/* Every weapon's looks (muzzle flash, flight trail, blast, specials) live in
// game.yaml's effects section (served as game.json), keyed by weapon key, and
// run on the particle engine in fx.js (shared with the dev-only
// fx-editor.html). game.yaml and README.md describe the fields. Blast radii
// stay in the arsenal: effects scale to the radius the sim hands them and
// never decide it. Until game.json arrives (or when it cannot, e.g. file://
// play) this baked Shell keeps the war lit, and any weapon it does not
// describe gets a plain effect derived from its paint job (gfx). */
const FX = window.TankityFX || null;
const FX_BUDGET = 700; // live particles on the battlefield, hard cap
const FALLBACK_FX = {
  shell: {
    body: { halo: 9, alpha: 0.45 },
    muzzle: { emitters: [
      { count: 1, size: [7, 7], sizeEnd: 0.4, life: [0.09, 0.09], alpha: [1, 0.6, 0], colors: ['#ffffff', '#ffe27a'], glow: true },
      { shape: 'streak', count: 7, aim: 'forward', spread: 35, speed: [90, 200], length: 7, life: [0.1, 0.22], gravity: 200, drag: 1.2, colors: ['#fff3c4', '#ffb13c'], glow: true },
    ] },
    trail: { emitters: [
      { rate: 46, life: [0.22, 0.4], speed: [0, 14], size: [1.4, 2.2], sizeEnd: 0.3, colors: ['#fff3c4', '#ffd75e', '#ff9f43'], glow: true },
    ] },
    impact: { emitters: [
      { count: 1, unit: 'r', size: [0.9, 0.9], sizeEnd: 0.5, life: [0.25, 0.25], alpha: [1, 0.7, 0], colors: ['#ffffff', '#ffb13c'], glow: true },
      { shape: 'ring', count: 1, unit: 'r', size: [0.25, 0.25], sizeEnd: 4, ease: 'out', life: [0.4, 0.4], width: 3, alpha: [0.8, 0.4, 0], colors: ['#e8d4a0', '#a0703a'] },
      { count: 16, speed: [70, 190], angle: 90, spread: 150, gravity: 340, drag: 0.4, size: [1.3, 2.6], life: [0.5, 1], round: false, alpha: [1, 1, 0], colors: ['#b8854a', '#7a4a1e', '#3a2610'] },
      { shape: 'streak', count: 10, speed: [120, 260], length: 9, life: [0.2, 0.5], gravity: 200, drag: 1.2, colors: ['#fff3c4', '#ffb13c'], glow: true },
    ] },
  },
};
let FX_DEFS = FX ? FX.dress(FALLBACK_FX) : {};
const FX_DERIVED = {};
/* A weapon's effect set: its entry, else one derived from its paint job. */
function fxSet(key) {
  const d = FX_DEFS[key];
  if (d) return d;
  return FX_DERIVED[key] || (FX_DERIVED[key] = FX.derive(((WEAPONS[key] || {}).gfx)));
}
/* Install game.json's effects section: each entry that passes validation wins; a
   bad one is reported and left to the derived effect. */
function installEffects(data) {
  if (!FX || !data || typeof data !== 'object') return 0;
  const next = {};
  for (const key of Object.keys(data)) {
    if (key[0] === '_') continue;
    FX.dress({ [key]: data[key] });
    const bad = FX.validate({ [key]: data[key] }, [key]);
    if (bad.length) { if (window.console) console.warn('game.json effects: ' + bad[0]); continue; }
    next[key] = data[key];
  }
  if (!next.shell) return 0;
  FX_DEFS = next;
  return Object.keys(next).length;
}
if (FX) {
  // Reduced motion: fewer, shorter particles and no screen flash (shake is
  // already off in the renderer).
  const mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  if (mq) {
    FX.reduced = !!mq.matches;
    if (mq.addEventListener) mq.addEventListener('change', e => { FX.reduced = e.matches; });
  }
  FX.loadSprites('fx/sprites/');
}
function fxMuzzle(sys, wkey, x, y, ang) {
  if (!sys) return;
  const kick = FX.play.muzzle(sys, fxSet(wkey), x, y, ang);
  if (kick !== undefined && sys === G.fx) G.shake = Math.max(G.shake || 0, kick);
}
/* Returns the effect's own screen shake, if it sets one. */
function fxImpact(sys, key, x, y, r) {
  return sys ? FX.play.impact(sys, fxSet(key), x, y, r) : undefined;
}
function fxSpecial(sys, key, name, x, y, ang) {
  if (sys) FX.play.special(sys, fxSet(key), name, x, y, ang);
}
/* A shell in flight (any object with x, y, vx, vy, wkey, or pass them
   explicitly for a replayed one): drip its trail along the path it flew. */
function fxTrail(sys, s, dt, x, y, vx, vy, wkey) {
  if (!sys) return;
  if (x === undefined) { x = s.x; y = s.y; vx = s.vx; vy = s.vy; wkey = s.wkey; }
  FX.play.trail(sys, fxSet(wkey), s, dt, x, y, vx, vy);
}


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
G.fx = FX ? FX.createSystem({ max: FX_BUDGET }) : null;
const me = () => G.tanks[0];
const alive = () => G.tanks.filter(t => t.hp > 0);
const foesAlive = () => G.tanks.filter(t => !t.isPlayer && t.hp > 0);

function surfY(x) {
  return simSurfY(G.terrain, x);
}
/* The camera only ever pulls back, slowly, to keep every live tank framed. */
function updateCamera(dt) {
  let tz = 1, tx = W / 2, ty = H / 2;
  const live = G.tanks.filter(t => t.hp > 0);
  if (live.length) {
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    for (const t of live) {
      x0 = Math.min(x0, t.x); x1 = Math.max(x1, t.x);
      y0 = Math.min(y0, t.y - 56); y1 = Math.max(y1, t.y);
    }
    const pad = 70;
    const spanX = Math.max(1, (x1 - x0) + pad * 2);
    const spanY = Math.max(1, (y1 - y0) + pad * 2);
    tz = clamp(Math.min(W / spanX, H / spanY, 1), 0.45, 1);
    tx = (x0 + x1) / 2;
    ty = (y0 + y1) / 2;
  }
  const k = Math.min(1, dt * 1.5);
  G.cam.z += (tz - G.cam.z) * k;
  G.cam.cx += (tx - G.cam.cx) * k;
  G.cam.cy += (ty - G.cam.cy) * k;
  // Pin the ground to the viewport floor: the visible bottom edge never drops
  // below the world base, so no void opens up under the terrain. Tanks live
  // on the ground, so they stay framed while the sky takes the slack above.
  const halfView = (H / 2) / Math.max(0.2, G.cam.z);
  G.cam.cy = Math.min(G.cam.cy, H + 8 - halfView);
}

/* Rolling hills from seeded sines, and the clouds over them. */
function genTerrain() {
  const g = simGenTerrain(G.rng);
  G.terrain = g.terrain;
  G.clouds = g.clouds;
}

const FOE_DEFS = [
  { id: 'reaper', color: '#ff0000' },
  { id: 'wraith', color: '#00ffff' },
  { id: 'spotter', color: '#ff00ff' },
];
function resetMatch(seedStr) {
  const seed = (seedStr || '').trim() || ('scorched-' + Math.floor(Math.random() * 9000 + 1000));
  G.seed = seed;
  G.rng = mulberry32(hashSeed(seed));
  G.lives = TUNE.lives;
  G.score = 0;
  G.cash = 600;
  G.nextOneUp = TUNE.oneUpEvery;
  G.roundsWon = 0;
  G.round = 0;
  G.tactics = {}; // each drone's strategy, kept from round to round
  G.firstTurn = 0;
  G.ammo = { shell: Infinity, buck: 1 };
  for (const k of WORDER) if (!(k in G.ammo)) G.ammo[k] = 0;
  G.selected = 'shell';
  G.shopSel = 0;
  G.shopQty = 1;
  G.fuelBank = 0;
  G.repairBank = 0;
  G.plate = 0;
  G.shield = false;
  G.jammer = 0;
  G.bunker = 0;
  G.laststand = false;
  G.over = false;
  const endVeil = $('end-veil');
  if (endVeil) endVeil.hidden = true; // a new match never sits on the last one's result
  G.won = false;
  G.demo = false;
  G.demoHint = false;
  G.time = 0;
  G.dlgQ = [];
  G.dlgT = 0;
  G.lastTalk = -99;
  G.banterT = 24;
  G.bannerT = 0;
  G.bannerDone = null;
  G.cam = { z: 1, cx: W / 2, cy: H / 2 };
  if ($('round-banner')) $('round-banner').hidden = true;
  genTerrain();
  G.tanks = [];
  G.shells = [];
  G.parts = [];
  G.booms = [];
  if (G.fx) G.fx.clear();
  closePreview();
  hideShop();
}
/* The solo phase moves live in src/flow.ts: ask it for the next phase. A move
   its table rejects leaves the phase where it was and says so on the console. */
function advance(event) {
  const next = transition(G.phase, event);
  if (next === null) console.warn(`tankity flow: ${event} is not legal in ${G.phase}`);
  else G.phase = next;
}
// Attract mode: the crew drives every tank until a human takes over.
function startDemo() {
  resetMatch('scorched-demo');
  G.demo = true;
  G.round = 1;
  advance('demo');
  newRound(`Demo mode. Press New Game${TOUCH ? '' : ` (or ${keyHint('global', 'new')})`} to play.`);
  render();
  renderHUD();
}
function newMatch(seedStr) {
  resetMatch(seedStr);
  // No round yet: spend the starting stake in the shop first.
  advance('matchStart');
  music.leaveTheme(); // a new match leaves the demo's theme at once
  startBanner('Round 1. The battery holds these hills.', openShop);
  say(`Match ${G.seed}: $600 stake in your pocket. Buy guns first. The battery holds these hills.`, 'info');
  talk('tank', 'tankity tank! Shopping, then shooting!', true);
}
// A fanfare plus a name card, then the game continues. Nothing starts without you.
function startSolo(seedStr) {
  closePreview();
  unlock();
  music.start();
  newMatch(seedStr);
}
function newRound(bannerText, event) {
  genTerrain();
  G.watchTurns = 0; // drone-only turns since the player fell (see WATCH_TURNS)
  G.wind = Math.round((G.rng() * 2 - 1) * 8);
  // Spread four combatants across the hills; every round, anyone may land
  // anywhere, never on top of each other.
  const order = spawnSpots(1 + FOE_DEFS.length, G.rng);
  // Shop fuel and repairs ride in banks: the round rebuilds every tank from
  // scratch, so anything bought spends only if it waits here for muster.
  const musterMax = TUNE.playerArmor + 25 * (G.plate || 0);
  const musterHp = musterMax + (G.repairBank || 0);
  const musterFuel = TUNE.fuel + (G.fuelBank || 0);
  G.repairBank = 0;
  G.fuelBank = 0;
  G.tanks = [{
    id: 'tank', isPlayer: true, color: '#ffff00', body: G.body,
    x: order[0], y: 0, angle: 62, power: 55,
    hp: musterHp, maxHp: musterHp, fuel: musterFuel,
  }];
  FOE_DEFS.forEach((f, i) => {
    // Endless escalation: thicker armor and a deeper magazine every round.
    const armor = TUNE.droneArmor + 6 * (G.round - 1);
    G.tanks.push({
      id: f.id, isPlayer: false, color: f.color,
      x: order[i + 1], y: 0, angle: 62, power: 55,
      hp: armor, maxHp: armor, fuel: 0,
      ammo: droneRack(),
      s: (G.tactics = G.tactics || {})[f.id] || (G.tactics[f.id] = pickTactic(G.rng)),
    });
  });
  for (const t of G.tanks) {
    t.y = surfY(t.x);
    t.dirS = t.x < W / 2 ? 1 : -1; // face the middle of the field
  }
  G.turn = G.firstTurn % G.tanks.length;
  G.firstTurn++;
  G.shells = [];
  G.parts = [];
  G.booms = [];
  if (G.fx) G.fx.clear();
  // The soundtrack turns over with the rounds: song follows the round, and
  // the demo always plays the theme.
  if (G.demo) music.playTheme(); else music.forRound(G.round);
  if (event) advance(event);
  closePreview();
  hideShop();
  if ($('end-veil')) $('end-veil').hidden = true;
  const opener = cur();
  const card = typeof bannerText === 'string' && bannerText
    ? bannerText
    : `Round ${G.round}. The battery rebuilds meaner.`;
  startBanner(card, () => {
    // Open on the scheduled tank: advancing here would skip seat 0 every round.
    if (opener.isPlayer && !G.demo) {
      advance('playerUp');
      say(`Round ${G.round}. Wind ${windText()}. Your move. Aim!`, 'info');
      maybeStartTutorial();
    } else {
      advance('foeUp');
      G.thinkT = TUNE.thinkTime;
      const who = opener.isPlayer ? 'Tankity tank' : opener.id;
      say(`Round ${G.round}. Wind ${windText()}. ${who} moves first.`, 'info');
    }
  });
}
/* ---------- turns, firing, ballistics ---------- */
function cur() {
  return G.tanks[G.turn];
}
/* Aim as drawn. Solo drones animate their real angle and power; in rooms the
   server only reports where a rival ended up, so the drawing glides there
   (showA/showP, eased in netEaseAim) instead of jumping. */
function shownAngle(t) {
  return t.showA === undefined ? t.angle : t.showA;
}
function shownPower(t) {
  return t.showP === undefined ? t.power : t.showP;
}
/* Aim-arm length in world units: 14 at power 10 up to 50 at power 100. */
function aimArmLength(power) {
  return 10 + clamp(power, 10, 100) * 0.4;
}
function spotTaken(t, x) {
  return simSpotTaken(G.tanks, t, x);
}
function fireWeapon(t, wkey) {
  const w = WEAPONS[wkey];
  const launch = simFireWeapon(G, ARSENAL, t, wkey);
  if (!launch) {
    if (t.isPlayer) { say(`No ${w.name} left! ${TOUCH ? 'Tap Weapons' : keyHint('global', 'cycle')} to swap guns.`, 'info'); sfx.play('click'); }
    return false;
  }
  if (launch.spent) say(`Out of ${w.name}. Back to the Shell.`, 'info');
  // Muzzle effects (the rail's beam among them) fire once per volley, along the barrel.
  fxMuzzle(G.fx, wkey, launch.x, launch.y, launch.ang);
  sfx.play('launch');
  advance('fire');
  return true;
}
function demoBlock() {
  if (!G.demo) return false;
  if (!G.demoHint) {
    G.demoHint = true;
    say(`Demo mode. Press New Game${TOUCH ? '' : ` (or ${keyHint('global', 'new')})`} to take the controls.`, 'info');
  }
  return true;
}
function playerFire() {
  closeGuns();
  if (net.on) { netFire(); return; }
  if (demoBlock()) return;
  if (G.phase !== 'aim' || !cur().isPlayer || G.over) return;
  closePreview();
  if (fireWeapon(me(), G.selected)) {
    if (TUT) TUT.fired = true;
    talk('tank', pick(TANK_FIRE));
    say(`You fire ${WEAPONS[G.selected].name}.`, 'info');
  }
  render();
}
/* One frame of flight: the sim moves the shells and says what happened, and
   this plays it. */
function stepShells(dt) {
  for (const e of simStepShells(G, ARSENAL, dt)) {
    if (e.kind === 'trail') fxTrail(G.fx, e.shell, dt, e.x, e.y, e.vx, e.vy, e.shell.wkey);
    else if (e.kind === 'split') fxSpecial(G.fx, e.wkey, 'split', e.x, e.y, e.ang);
    else if (e.kind === 'pierce') fxSpecial(G.fx, e.wkey, 'pierce', e.x, e.y, e.ang);
    else {
      showBlast(e.blast);
      G.settleT = TUNE.settleTime;
      advance('shellsLanded');
    }
  }
}
/* A blast as the sim reports it: the boom, then what it did to each unit in
   the order it happened. */
function showBlast(b) {
  const owner = b.owner;
  sfx.play('boom');
  const kick = fxImpact(G.fx, b.fx, b.x, b.y, b.r);
  G.shake = Math.max(G.shake || 0, kick !== undefined ? kick : b.shake);
  G.booms.push({ x: b.x, y: b.y, r: b.r, wkey: b.wkey, t: 0, life: b.wkey === 'nuke' ? 0.8 : 0.5 });
  for (const e of b.events) {
    const t = e.tank;
    if (e.kind === 'shield') {
      burst(t.x, t.y - 12, '#ffffff', 16, 5);
      say('Shield absorbs the hit!', 'good');
      renderHUD();
    } else if (e.kind === 'arc') {
      fxSpecial(G.fx, b.wkey, 'arc', t.x, t.y - 12, 0);
    } else if (e.kind === 'wound') {
      if (t.isPlayer) {
        say(`Direct hit on YOU for ${e.dmg}! (${e.hp} armor left)`, 'bad');
        exchange('tank', pick(TANK_OWS), owner.id, pick(FOE_HIT[owner.id] || FOE_MISS));
      } else if (owner.isPlayer) {
        say(`Direct hit on ${t.id} for ${e.dmg}! (${e.hp} armor left)`, 'good');
        talk('tank', pick(TANK_HIT), true);
      } else if (e.direct) {
        say(`${owner.id} hits ${t.id} for ${e.dmg}.`, 'info');
      }
    } else {
      sfx.play('boom');
      burst(t.x, t.y - 12, '#ff5a5a', 26, 7);
      if (e.lastStand) {
        say('Last stand! The wreck detonates!', 'good');
        showBlast(e.lastStand);
        renderHUD();
      }
      if (t.isPlayer) {
        say('Your tank is scrap metal!', 'bad');
        talk('tank', 'I will be back... after repairs.', true);
      } else {
        const by = owner.isPlayer ? 'You' : owner.id;
        say(`${by} wreck${owner.isPlayer ? '' : 's'} ${t.id}! (+${TUNE.killBonus})`, 'good');
        exchange(t.id, FOE_DYING[t.id] || '...', 'tank', pick(TANK_HIT));
      }
    }
  }
}
/* ---------- turn advance, rounds, shop ---------- */
function nextTurn() {
  if (G.over) return;
  const n = G.tanks.length;
  for (let k = 1; k <= n; k++) {
    const t = G.tanks[(G.turn + k) % n];
    if (t.hp > 0) {
      G.turn = (G.turn + k) % n;
      break;
    }
  }
  const t = cur();
  if (t.isPlayer && !G.demo) {
    advance('playerUp');
    say('Your turn. Aim!', 'info');
  } else {
    advance('foeUp');
    G.thinkT = TUNE.thinkTime;
    say(`${t.isPlayer ? 'Tankity tank' : t.id} is aiming…`, 'info');
    if (Math.random() < 0.4) talk(t.id, pick(FOE_FIRE[t.id] || FOE_MISS));
  }
  render();
  renderHUD();
}
/* Tanks left hanging over a crater fall under gravity every frame until they
   land; ground that rose (a new round, fresh hills) takes them straight up. */
function fallTanks(dt) {
  if (simFallTanks(G, dt).some(t => t.isPlayer)) sfx.play('thud');
}
function anyTankFalling() {
  return simAnyTankFalling(G);
}
function settle() {
  if (G.demo) {
    if (me().hp <= 0) {
      say('Demo tank wrecked. Rolling a fresh one.', 'info');
      newRound('Back in! Same hills, fresh tank.', 'tankLost');
      return;
    }
    if (!foesAlive().length) {
      G.round += 1;
      newRound(undefined, 'roundWon');
      return;
    }
  } else if (alive().length > 1 && !(me().hp <= 0 && ++G.watchTurns >= WATCH_TURNS)) {
    // A round ends only with one unit left standing: with the player's tank
    // wrecked, the drones fight on while the player watches (for at most
    // WATCH_TURNS turns, so a stalemate cannot run forever).
  } else if (me().hp <= 0) {
    // The last unit is a drone (or the last two fell together): the round
    // goes to the battery, the player loses a life, and the shop opens.
    G.lives -= 1;
    if (G.lives <= 0) {
      G.lives = 0;
      endMatch(false, 'The tank is scrap across these hills. The battery keeps the high ground.');
    } else {
      say(`Round ${G.round} goes to the battery. ${G.lives} ${G.lives === 1 ? 'life' : 'lives'} left. Restock and roll again.`, 'bad');
      talk('tank', 'I will be back... after shopping!', true);
      advance('tankLost');
      startBanner(`Round ${G.round} lost. Restock and roll again.`, openShop);
    }
    return;
  } else {
    G.roundsWon += 1;
    const bonus = TUNE.roundWinScore + G.round * 150;
    const prize = TUNE.roundWinCash + G.round * 100;
    G.score += bonus;
    G.cash += prize;
    sfx.play('win');
    say(`Round ${G.round} won! +${bonus} pts, +$${prize}. The battery rebuilds meaner, so spend it wisely.`, 'good');
    exchange('tank', 'tankity tank! Hill claimed!', pick(['reaper', 'wraith', 'spotter']),
      pick(['Lucky shot, treads...', 'The hill was... too hilly...', 'Recharge... revenge...']));
    // Trick timers tick down on claimed rounds, not on wrecked restarts.
    if (G.jammer > 0) G.jammer--;
    if (G.bunker > 0) G.bunker--;
    advance('roundWon');
    startBanner(`Round ${G.round} claimed! Spend the winnings.`, openShop);
    return;
  }
  // Wind shifts a little after every shot.
  G.wind = clamp(Math.round(G.wind + gauss(G.rng) * 2), -12, 12);
  nextTurn();
}
/* The end veil is a Preact component (src/ui/endveil.tsx); the game keeps what
   it says and which buttons it offers. */
const END = { kicker: '', title: '', text: '', score: '', formHidden: false, filed: false, rematch: null, backToRooms: false };
function renderEndVeil() {
  const veil = $('end-veil');
  if (!veil) return;
  drawEndVeil(veil, {
    keyHint,
    kicker: END.kicker,
    title: END.title,
    text: END.text,
    score: END.score,
    formHidden: END.formHidden,
    filed: END.filed,
    callsign: savedCallsign(),
    rematch: END.rematch,
    backToRooms: END.backToRooms,
    onFile: raw => {
      const name = raw.trim();
      if (!name) { say('Give your callsign first, hero.', 'info'); return; }
      fileReport(name);
      END.filed = true;
      renderEndVeil();
    },
    onRematch: () => { sfx.play('click'); netRematch(); },
    onAgain: () => { if (net.on) { netLeave(); openLobby(); } else freshMatchFromSeedBox(); },
  });
}
function endMatch(won, text) {
  if (G.demo) { startDemo(); return; }
  if (G.over) return;
  endTutorial(true);
  G.over = true;
  G.won = won;
  advance(won ? 'matchWon' : 'matchLost');
  music.stop();
  hideShop();
  refreshNavHints();
  if (won) sfx.play('win'); else sfx.play('lose');
  say(text, won ? 'good' : 'bad');
  const veil = $('end-veil');
  if (veil) {
    END.kicker = won ? 'Match over' : 'Match lost';
    END.title = won ? 'Hills claimed!' : 'Tank down';
    END.text = text;
    END.score = `Score ${G.score} · ${G.roundsWon} rounds won · ${G.round} rounds played · seed ${G.seed}`;
    // File the run right here, with the last callsign ready.
    END.formHidden = false;
    END.filed = false;
    renderEndVeil();
    veil.hidden = false;
    refreshNavHints();
  }
  renderHUD();
}
const BANNER_MS = 1500;
// Banner timing rides the game clock, never wall time: hidden tabs throttle
// setTimeout, which used to strand the game on its name card after refocus.
function startBanner(text, done) {
  const t = $('round-banner-text');
  if (t) t.textContent = text;
  const b = $('round-banner');
  if (b) {
    b.hidden = true;
    void b.offsetWidth;
    b.hidden = false;
  }
  sfx.play('fanfare');
  G.bannerT = BANNER_MS / 1000;
  G.bannerDone = done || null;
}
function tickBanner(dt) {
  if (G.bannerT <= 0) return;
  G.bannerT -= dt;
  if (G.bannerT > 0) return;
  G.bannerT = 0;
  const b = $('round-banner');
  if (b) b.hidden = true;
  const done = G.bannerDone;
  G.bannerDone = null;
  if (done) done();
}
function openShop() {
  advance('shopOpen');
  G.shopQty = 1;
  renderShop();
  const veil = $('shop-veil');
  if (veil) veil.hidden = false;
  refreshNavHints(); // only a shown list has a height to measure
  render();
  renderHUD();
}
function hideShop() {
  const veil = $('shop-veil');
  if (veil) veil.hidden = true;
}
/* The shop is a Preact component (src/ui/shop.tsx) drawn into #shop-veil. This
   builds what it shows from the game's state and wires its clicks back; the
   component keeps no state of its own. In a room the start button is the Ready
   toggle: pressed reads "Ready ✓", and a line under it counts who is ready and
   the time left before the shop closes on its own (rooms.php ROOM_SHOP_SECS). */
function shopReadyView() {
  if (!net.on) {
    const label = `Start round ${G.round + 1}${keyCap('shop', 'next')}`;
    return { next: { label }, readyLine: null, sig: label };
  }
  const mine = net.readyNow();
  const voters = net.seats.filter(s => s.human && s.lives > 0);
  const ready = voters.filter(s => s.ready).length;
  const left = net.shopClockLeft();
  const clock = left === null ? '' : ` · shop closes in ${Math.floor(Math.ceil(left) / 60)}:${String(Math.ceil(left) % 60).padStart(2, '0')}`;
  const label = `${mine ? 'Ready ✓' : 'Ready'}${keyCap('shop', 'next')}`;
  const status = `${ready}/${voters.length} ready${clock}`;
  const marks = voters.map(s => `${String(s.name).toUpperCase()}${s.ready ? ' ✓' : ''}`).join('  ');
  return { next: { label, pressed: mine }, readyLine: `${status} · ${marks}`, sig: label + '|' + status + '|' + marks };
}
/* The start button and ready line as last drawn. The clocks call this every
   frame, so the shop redraws only when what it would show has changed. */
let shopReadyShown = '';
function renderShopReady() {
  if (G.phase === 'shop' && shopReadyView().sig !== shopReadyShown) renderShop();
}
function renderShop() {
  const veil = $('shop-veil');
  if (!veil || !G.ammo) return; // no match has dealt a hand yet
  G.shopSel = clamp(G.shopSel || 0, 0, SHOP.length - 1);
  G.shopQty = clamp(G.shopQty || 1, 1, 9);
  const ready = shopReadyView();
  shopReadyShown = ready.sig;
  const qty = G.shopQty;
  const entries = [];
  let lastCat = '';
  let shellRowShown = false;
  SHOP.forEach((it, idx) => {
    if (it.cat !== lastCat) {
      lastCat = it.cat;
      entries.push({ kind: 'cat', name: it.cat });
      // The Shell never needs buying, but it is part of the arsenal: it
      // heads the shells with no number and no Buy button.
      if (it.kind === 'ammo' && !shellRowShown) {
        shellRowShown = true;
        entries.push(shellShopRow());
      }
    }
    const locked = (it.minRound || 0) > G.round;
    const unit = packPrice(it);
    const total = unit * qty;
    const parts = shopName(it, unit);
    entries.push({
      kind: 'item',
      index: idx,
      name: parts.name,
      vals: `${parts.vals}${qty > 1 ? ` ×${qty} = $${total}` : ''}`,
      sub: shopSub(it),
      sub2: shopSub2(it, locked),
      icon: it.kind === 'ammo' ? { kind: 'ammo', w: it.w } : { kind: 'gear', g: it.g },
      selected: idx === G.shopSel,
      locked,
      disabled: locked || G.cash < total,
      qty,
      weapon: it.kind === 'ammo' ? it.w : undefined,
    });
  });
  drawShop(veil, {
    keyHint,
    title: G.round === 0 ? 'Pre-match shop' : 'Field shop',
    cash: G.round === 0
      ? `War chest: $${G.cash} · spend your stake before the first hill`
      : `War chest: $${G.cash} · armor ${me().hp}/${TUNE.playerArmor} · round ${G.round} cleared`,
    entries,
    next: ready.next,
    readyLine: ready.readyLine,
    inRoom: net.on,
    drawIcon: (canvas, icon) => (icon.kind === 'ammo' ? drawShellIcon(canvas, icon.w) : drawGearIcon(canvas, icon.g)),
    arsenalRev: ARSENAL_REV,
    onBuy: idx => buyItem(SHOP[idx], G.shopQty),
    onPreview: openPreview,
    onNext: nextRound,
    onLeave: openLeaveVeil,
  });
  refreshNavHints();
}
/* The help is a Preact component too (src/ui/help.tsx), drawn into the section
   in the page; it redraws when the key table changes. */
function renderHelpOverlay() {
  const section = $('help-overlay');
  if (section) renderHelp(section, { keyHint, onClose: () => toggleOverlay('help-overlay', 'btn-help') });
}
/* Every row names the goods on one line and the numbers below it. */
/* One pack price shared by the menu, the till, and the affordable count. */
function packPrice(it) {
  return it.price || 0;
}
/* Packs of this row the chest can cover right now, capped at 9. */
function maxPacks(it) {
  return Math.max(0, Math.min(9, Math.floor(G.cash / packPrice(it))));
}
/* A row's name, then its numbers (pack size, price, what you own, the bulk
   total) in their own colour. */
function shopName(it, price) {
  if (it.kind === 'ammo') {
    const own = (G.ammo[it.w] || 0) > 0 ? ` (you own ${G.ammo[it.w]})` : '';
    return { name: WEAPONS[it.w].name, vals: `×${it.n} ($${price})${own}` };
  }
  return { name: it.label, vals: `($${price})` };
}
function shellShopRow() {
  return {
    kind: 'free',
    weapon: 'shell',
    name: WEAPONS.shell.name,
    vals: '∞ (free)',
    sub: shopSub({ kind: 'ammo', w: 'shell' }),
    sub2: 'Always loaded, never runs out.',
    icon: { kind: 'ammo', w: 'shell' },
  };
}
/* First stat line: what it does. Second stat line: the deal. Locked rows
// keep their numbers so the NUKE shows its damage before round 4. */
function shopSub(it) {
  if (it.kind === 'ammo') {
    const w = WEAPONS[it.w];
    const note = w.note ? `, ${w.note.charAt(0).toLowerCase() + w.note.slice(1).replace(/\.$/, '')}` : '';
    return `${w.dmg} damage, blast ${w.radius}${note}. Direct hits count double.`;
  }
  const g = GEAR[it.g];
  return (g && g.note) || it.label;
}
function shopSub2(it, locked) {
  if (it.kind === 'ammo') {
    if (locked) return `Unlocks in round ${it.minRound}.`;
    return `Pack of ${it.n}. You own ${G.ammo[it.w] || 0}.`;
  }
  const maxArmor = TUNE.playerArmor + 25 * (G.plate || 0);
  switch (it.effect) {
    case 'repair': {
      const cur = G.tanks.length ? me().hp : TUNE.playerArmor;
      const banked = G.repairBank ? `, plus ${G.repairBank} banked for next round` : '';
      return `Your armor is at ${cur} of ${maxArmor}${banked}.`;
    }
    case 'fuel': {
      const fuel = G.tanks.length ? Math.round(me().fuel) : TUNE.fuel;
      const banked = G.fuelBank ? `, plus ${G.fuelBank} banked for next round` : '';
      return `Your tank holds ${fuel} fuel${banked}.`;
    }
    case 'plate':
      return `Max armor ${maxArmor}${G.plate ? ` (${G.plate} fitted)` : ''}, ready next round.`;
    case 'shield':
      return G.shield ? 'Shield is up for the next hit.' : 'No shield fitted.';
    case 'extralife':
      return `${G.lives} ${G.lives === 1 ? 'life' : 'lives'} banked (max ${TUNE.maxLives}).`;
    case 'jammer':
      return G.jammer > 0 ? `Jamming for ${G.jammer} more ${G.jammer === 1 ? 'round' : 'rounds'}.` : 'Drones aim straight at you.';
    case 'bunker':
      return G.bunker > 0 ? `Dug in for ${G.bunker} more ${G.bunker === 1 ? 'round' : 'rounds'}.` : 'No bunker dug.';
    case 'laststand':
      return G.laststand ? 'Wreck is rigged to blow.' : 'Wreck is just a wreck.';
    default:
      return it.label;
  }
}
/* One direct loader for the weapon picker; Q keeps cycling through it. */
function selectWeapon(w) {
  if (G.over || G.phase === 'shop' || demoBlock()) return false;
  if (net.on) return netPick(w);
  if (!(w === 'shell' || (G.ammo[w] || 0) > 0)) {
    say(`No ${WEAPONS[w].name} left in the rack.`, 'info');
    return false;
  }
  G.selected = w;
  sfx.play('click');
  say(`Loaded: ${WEAPONS[w].name}.`, 'info');
  renderHUD();
  return true;
}
function buyItem(it, qty) {
  qty = clamp(Math.floor(qty || 1), 1, 9);
  if (net.on) { netBuy(it, qty); return; }
  const total = packPrice(it) * qty;
  if ((it.minRound || 0) > G.round) {
    say(`That unlocks in round ${it.minRound}.`, 'info');
    return;
  }
  if (G.cash < total) {
    say(`That costs $${total}, and the chest holds $${G.cash}.`, 'info');
    return;
  }
  G.cash -= total;
  sfx.play('cash');
  const lots = qty > 1 ? `${qty} × ` : '';
  if (it.kind === 'ammo') {
    G.ammo[it.w] = (G.ammo[it.w] || 0) + it.n * qty;
    say(`Bought ${lots}${it.label}.`, 'good');
  } else {
    applyGear(it, qty, lots);
  }
  // After a buy the pack count only ever drops, down to what the chest
  // can still cover for the highlighted row.
  G.shopQty = Math.max(1, Math.min(G.shopQty, maxPacks(SHOP[G.shopSel])));
  renderShop();
  renderHUD();
}
/* One-shot and banked gear, shared by every shelf row that is not ammo. */
function applyGear(it, qty, lots) {
  const n = (it.n || 0) * qty;
  switch (it.effect) {
    case 'repair':
      G.repairBank += n;
      say(`Bought ${lots}${it.label}, banked for next round.`, 'good');
      break;
    case 'fuel':
      G.fuelBank += n;
      say(`Bought ${lots}${it.label}, banked for next round.`, 'good');
      break;
    case 'plate':
      G.plate += qty;
      say(`Bought ${lots}${it.label}, plated for next round.`, 'good');
      break;
    case 'shield':
      G.shield = true;
      say(`Bought ${it.label}. Next hit bounces off.`, 'good');
      break;
    case 'extralife':
      if (G.lives < TUNE.maxLives) {
        G.lives += 1;
        say(`Bought ${it.label}! (${G.lives}/${TUNE.maxLives} lives)`, 'good');
      } else {
        G.score += 500;
        say('Max lives already, so take +500 points instead!', 'good');
      }
      break;
    case 'jammer':
      G.jammer = Math.max(G.jammer, n);
      say(`Bought ${it.label}. Drones aim shaky for ${G.jammer} rounds.`, 'good');
      break;
    case 'bunker':
      G.bunker = Math.max(G.bunker, n);
      say(`Bought ${it.label}. Dug in for ${G.bunker} rounds.`, 'good');
      break;
    case 'laststand':
      G.laststand = true;
      say(`Bought ${it.label}. Go down glowing.`, 'good');
      break;
    default:
      say(`Bought ${lots}${it.label}.`, 'good');
  }
}
function nextRound() {
  if (net.on) { netNext(); return; }
  if (G.phase !== 'shop') return;
  G.round += 1;
  newRound(undefined, 'shopDone');
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
/* ---------- drone AI: real ballistic solutions, plus round-scaled error ---------- */
/* Drone magazine from the data file: shells the battery may load by round. */
function droneRack() {
  return simDroneRack(ARSENAL, G.round);
}
function aiChoose(t) {
  return simAiChoose(G, ARSENAL, t);
}
/* The shooter swings its barrel and power to the plan in plain sight before
   firing, so everyone can watch the shot line up. Longer swings take a bit
   longer, eased at both ends. */
function aiPlanAim(t) {
  const plan = aiChoose(t);
  if (plan.tactic) {
    G.tactics[t.id] = plan.tactic;
    say(`${t.id.toUpperCase()} switches to ${plan.tactic} tactics.`, 'info');
  }
  const swing = Math.max(Math.abs(plan.angle - t.angle), Math.abs(plan.power - t.power));
  t.aim = {
    plan, a0: t.angle, p0: t.power, k: 0,
    dur: clamp(0.45 + swing / 110, 0.5, 1.4),
  };
}
/* Advance a planned swing; true once the barrel has sat on the plan for a
   beat, so the final aim reads before the shot leaves. */
function aiStepAim(t, dt) {
  const aim = t.aim;
  const hold = 0.2;
  aim.k = Math.min(aim.dur + hold, aim.k + dt);
  const u = Math.min(1, aim.k / aim.dur);
  const e = u * u * (3 - 2 * u);
  t.angle = aim.a0 + (aim.plan.angle - aim.a0) * e;
  t.power = aim.p0 + (aim.plan.power - aim.p0) * e;
  return aim.k >= aim.dur + hold;
}
function aiFire(t) {
  const { wkey, angle, power } = t.aim.plan;
  t.aim = null;
  t.angle = angle;
  t.power = power;
  talk(t.id, pick(FOE_FIRE[t.id] || FOE_MISS));
  say(`${t.id} fires ${WEAPONS[wkey].name}.`, 'info');
  fireWeapon(t, wkey);
  render();
}
/* ---------- rendering: bright dusk hillside, no borrowed sprites ---------- */
/* One blast-disc painter for the war, the room tracers, and the demos. */
function burst(x, y, color, n, spd) {
  for (let i = 0; i < (n || 10); i++) {
    const a = Math.random() * Math.PI * 2;
    const s = (spd || 4) * (0.4 + Math.random());
    G.parts.push({ x, y, vx: Math.cos(a) * s * 10, vy: Math.sin(a) * s * 10 - 30, life: 0.5 + Math.random() * 0.5, color: color || '#ffd75e' });
  }
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

/* The loaded weapon: the shell beside its name. A dozen shells no longer fit on
   one line, so only the loaded gun shows; the rest of the rack is read out for
   screen readers and lives in the weapon picker. */
function renderLoadout() {
  const count = w => (w === 'shell' ? '∞' : '×' + (G.ammo[w] || 0));
  const rack = WORDER.filter(w => w !== G.selected && ((G.ammo[w] || 0) > 0 || w === 'shell'))
    .map(w => `${WEAPONS[w].name} ${count(w)}`).concat(trickChips());
  HUD.weapon = {
    key: G.selected,
    text: `${WEAPONS[G.selected].name} ${count(G.selected)}`,
    sr: rack.length ? ` · also ${rack.join(' · ')}` : '',
  };
}
/* Whose turn the battlefield shows: the shooter of a replaying volley, else
   the tank whose turn it is. Nobody between rounds or after the match. */
function turnTank() {
  if (G.over || G.phase === 'shop' || G.phase === 'banner') return null;
  const shooter = net.on ? replay.shooter() : null;
  if (shooter) return shooter;
  const t = G.tanks[G.turn];
  return t && t.hp > 0 ? t : null;
}
/* ---------- the battlefield: painted by src/render.ts ---------- */
/* A ground unit has moved when its x changed since the last frame (walker legs
   shuffle, buggy wheels spin). That memory is game state, so it is stepped
   here, before the frame is built, and the renderer only reads `moving`. */
function trackMotion() {
  for (const t of G.tanks) {
    if (t.hp <= 0 || !isGroundUnit(t)) continue;
    t.moving = Math.abs(t.x - (t.lastX ?? t.x)) > 0.01;
    t.lastX = t.x;
  }
}
/* The snapshot of everything the canvas shows this frame. render.ts reads it
   and paints; it never writes back. The rules live here: whose turn marker
   shows, whether the aim arm is up, when the clock counts down on the canvas. */
function battleView() {
  const t = cur();
  const aiming = (G.phase === 'aim' || G.phase === 'think') && t && t.hp > 0 && !G.over;
  const left = net.turnClockLeft();
  const pv = G.preview;
  return {
    time: G.time, shake: G.shake, cam: G.cam,
    skyKey: net.on ? 'room:' + net.code : String(G.seed || ''),
    terrain: G.terrain, clouds: G.clouds, tanks: G.tanks,
    turnUnit: turnTank(), online: net.on,
    aim: aiming ? { unit: t, length: aimArmLength(shownPower(t)) } : null,
    booms: G.booms, fx: G.fx, shells: G.shells, replay: replay.flying(), sparks: G.parts,
    wind: G.wind, windGauge: G.tanks.length > 0 && G.phase !== 'shop', windTop: G.windTop,
    textScale: textScale(),
    turnClock: left !== null && left <= CLOCK_SHOW_S && left > 0 ? { left, myTurn: MATCH.myTurn } : null,
    preview: pv && pv.cv ? {
      canvas: pv.cv, width: PV_W, height: PV_H, terr: pv.terr, sx: pv.sx, tx: pv.tx,
      angle: pv.angle, foeHp: pv.foeHp, foeHpMax: PV_FOE_HP, wkey: pv.wkey, wind: pv.wind,
      booms: pv.booms, shells: pv.shells, fx: pv.fx, result: pv.result, resultT: pv.resultT,
    } : null,
  };
}
let renderer = null;
function render() {
  const cv = document.getElementById('stage');
  if (!cv || !G.terrain) return;
  if (!renderer) {
    renderer = createRenderer(cv, {
      fx: FX,
      size: { w: W, h: H },
      sim: { facing, isGroundUnit, muzzle, surfY: simSurfY, hashSeed, mulberry32, gauss },
      shownAngle,
      look: wkey => (WEAPONS[wkey] || {}).gfx || {},
      fxBody: wkey => fxSet(wkey).body,
      reducedMotion: () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      random: () => Math.random(),
    });
  }
  trackMotion();
  renderer.frame(battleView());
}
/* The wind gauge sits just under the menu strip, so its top is measured from
   the page (placeLogBelowMenu) and handed to the renderer in world units. */
function windGaugeTop() {
  const bar = $('menubar'), stage = $('stage');
  if (!bar || !stage || !stage.clientHeight || !bar.getBoundingClientRect) return 10;
  const below = bar.getBoundingClientRect().bottom - stage.getBoundingClientRect().top;
  return Math.max(6, below / stage.clientHeight * H + 6);
}
/* ---------- DOM: log, HUD ---------- */
const $ = id => document.getElementById(id);
/* The radio log is a Preact component (src/ui/log.tsx); the game keeps the
   lines, trims them at the cap and redraws. */
const LOG_CAP = 80;
let logLines = [];
let logSeq = 0;
function say(text, tone) {
  if (!$('log-overlay')) return;
  logLines = [...logLines, { id: ++logSeq, text, tone }].slice(-LOG_CAP);
  renderLogOverlay();
  refreshNavHints();
}
function renderLogOverlay() {
  const section = $('log-overlay');
  if (section) drawLog(section, { keyHint, onClose: () => toggleOverlay('log-overlay', 'btn-log'), lines: logLines });
}
/* Fitted tricks ride the HUD beside the shells. In room matches netOnSnapshot
// keeps these G fields mirrored from the server snapshot. */
function trickChips() {
  const chips = [];
  if (G.shield) chips.push('shield');
  if ((G.bunker || 0) > 0) chips.push(`bunker(${G.bunker})`);
  if ((G.jammer || 0) > 0) chips.push(`jammer(${G.jammer})`);
  if (G.laststand) chips.push('last stand');
  if ((G.plate || 0) > 0) chips.push(`plate(+${25 * G.plate})`);
  return chips;
}
/* The status bar is a Preact component (src/ui/hud.tsx). The game keeps the
   text it shows in HUD, and redraws only when that changed: the loop asks every
   frame. Armor carries what the bar leaves to the battlefield (the rivals'
   armor rides over their units) as screen-reader text. */
const HUD = {
  turn: '-', angle: '-', power: '-', fuel: '-', wind: '-', weapon: null,
  armor: { shown: '-', sr: '' }, lives: { text: '-', title: '' }, score: { text: '-', title: '' },
  online: false, runStats: '',
};
let hudShown = '';
function paintHud() {
  const bar = $('hud-bar');
  if (!bar) return;
  const sig = JSON.stringify(HUD) + '|' + ARSENAL_REV;
  if (sig === hudShown) return;
  hudShown = sig;
  drawHud(bar, { ...HUD, drawIcon: drawShellIcon, arsenalRev: ARSENAL_REV, onWeapon: openGuns });
}
function renderStanding(mine, others) {
  HUD.armor = {
    shown: mine ? `${Math.max(0, Math.round(mine.hp))}` : '-',
    sr: `${mine ? `you ${Math.max(0, Math.round(mine.hp))} · ` : ''}${others}`,
  };
  HUD.lives = { text: '♥'.repeat(Math.max(0, G.lives)), title: `${G.lives} lives` };
  HUD.score = { text: `$${G.cash} · round ${G.round} · ${G.score} pts`, title: `Next 1-up at ${G.nextOneUp} points` };
}
function windText() {
  if (G.wind === 0) return '· 0';
  return (G.wind > 0 ? '→ ' : '← ') + Math.abs(G.wind);
}
function renderHUD() {
  if (net.on) { renderNetHUD(); return; }
  if (!G.tanks.length) return;
  const t = cur() || me();
  HUD.turn =
    G.phase === 'shop' ? 'shop. Spend it!' :
    G.over ? 'match over' :
    G.phase === 'banner' ? 'get ready...' :
    t.isPlayer ? (G.phase === 'aim' ? 'YOU. Aim!' : 'you fired…') : `${t.id} aiming…`;
  HUD.angle = `${Math.round(me().angle)}°`;
  HUD.power = `${Math.round(me().power)}`;
  HUD.wind = windText();
  renderLoadout();
  renderStanding(me(), G.tanks.filter(x => !x.isPlayer).map(x => `${x.id}:${Math.max(0, x.hp)}`).join(' '));
  HUD.fuel = `${Math.round(me().fuel)}`;
  paintHud();
}

/* ---------- main loop ---------- */
let lastT = 0;
/* Battlefield cosmetics decay on wall-clock frames, never on volleys: effects,
 * blast discs, shake, and sparks all finish even after the last shell lands,
// so nothing freezes over the next turn. */
function decayFx(dt) {
  if (G.shake > 0) G.shake = Math.max(0, G.shake - dt);
  if (G.fx) { G.fx.wind = G.wind; G.fx.step(dt); }
  for (const bm of G.booms) bm.t += dt;
  G.booms = G.booms.filter(bm => bm.t < bm.life);
  for (const q of G.parts) {
    q.life -= dt;
    q.x += q.vx * dt; q.y += q.vy * dt; q.vy += GRAV * 0.6 * dt;
  }
  G.parts = G.parts.filter(q => q.life > 0);
}
/* One step of the war between turns: a drone aims and fires, shells fly, the
   dust settles. */
function stepWar(dt) {
  if (G.phase === 'think') {
    const t = cur();
    if (!t.aim) aiPlanAim(t);
    G.thinkT -= dt;
    if (aiStepAim(t, dt) && G.thinkT <= 0) aiFire(t);
  } else if (G.phase === 'fly' || G.phase === 'settle') {
    // A volley resolves pellet by pellet: explosions flip us to settle, but
    // stepping continues until every shell has landed or fizzled.
    if (G.shells.length) stepShells(dt);
    if (G.phase === 'fly' && !G.shells.length) {
      say('Shot fizzles out over the hills.', 'info');
      talk('tank', pick(TANK_MISS));
      G.settleT = 0.6;
      advance('shellsLanded');
    } else if (G.phase === 'settle' && !G.shells.length) {
      G.settleT -= dt;
      // The turn waits for every tank to finish falling into its crater.
      if (G.settleT <= 0 && !anyTankFalling()) settle();
    }
  }
}
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
  onReachable: setNetDot,
  onSnapshot: netOnSnapshot,
  onReadyChange: renderShopReady,
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
const KNOWN_FOES = ['reaper', 'wraith', 'spotter'];
const FOE_PAINT = { reaper: '#ff0000', wraith: '#00ffff', spotter: '#ff00ff' };
const SEAT_PAINT = ['#ffff00', '#00ff00', '#00ffff', '#ff00ff'];
function netValidInitials(raw) {
  const s = String(raw || '').trim();
  if (!/^[A-Za-z]{3}$/.test(s)) return null;
  if (BLOCKED_INITIALS.indexOf(s.toUpperCase()) >= 0) return null;
  return s;
}
/* The lobby is a Preact component (src/ui/lobby.tsx). This is everything it
   shows that the game decides: the status line, the occupancy count, the
   server dot, the picked hills, an invite's code, and the room as last drawn
   (code, link, hills, seats). The initials and code boxes stay the page's own. */
const LOBBY = {
  status: '', count: '', online: false, inRoom: false, mapId: '', mapsRev: 0, prefill: '',
  code: '', link: '', hills: 'Hills: Random hills', seats: [], mySeat: 0, isHost: false, seatsHint: '',
};
function lobbySay(text) {
  LOBBY.status = text;
  renderLobby();
}
function renderLobby() {
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
function setNetDot(on) {
  LOBBY.online = on;
  renderLobby();
  HUD.online = on;
  paintHud();
}
function myTank() {
  for (const t of G.tanks) if (t.isPlayer) return t;
  return null;
}
function seatName(seat) {
  const s = net.seats[seat];
  if (!s || !s.name) return 'seat ' + (seat + 1);
  return s.name;
}
// Only the familiar battery drones get speaking lines. Human rivals show up
// in the radio log instead, so a weird name can never break a portrait.
function foeTalkId(t) {
  if (!t || t.isPlayer) return null;
  return KNOWN_FOES.indexOf(t.id) >= 0 ? t.id : null;
}
async function loadMaps() {
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
async function mapChosen() {
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
        if (tries >= 3 || seq !== mapPickSeq || !/too fast/.test(String(err && err.message))) throw err;
        await new Promise(r => setTimeout(r, 200));
      }
    }
  } catch (err) {
    lobbySay(String((err && err.message) || err));
  }
}
async function loadOccupancy() {
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
async function openLobby() {
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
function showLobbyRoom(inRoom) {
  LOBBY.inRoom = inRoom;
  renderLobby();
}
async function hostRoom(initials, mapId) {
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
async function joinRoom(code, initials) {
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
async function netRefreshRoster() {
  let room = null;
  try {
    room = await net.getState();
    net.seats = room.seats || [];
  } catch (err) { /* roster fills in on the next tick */ }
  netRenderRoster(room);
}
/* The newest lobby event already told, per room: the match starts its event
   cursor there, so its first sync never repeats who rolled in or left. */
const lobbyTold = { code: '', seq: 0 };
function netLobbyWatch() {
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
function joinLink() {
  if (typeof location === 'undefined' || !net.code) return '';
  let here = location;
  try {
    if (window.top && window.top !== window && window.top.location.origin === location.origin) here = window.top.location;
  } catch (_) { /* a frame on another host: keep our own address */ }
  return inviteUrl(net.code, here);
}
async function copyInvite() {
  const url = joinLink();
  if (!url) return;
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(url);
    } else {
      const link = $('join-link');
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
function maybeApplyInviteCode() {
  if (typeof location === 'undefined' || !location.search) return;
  const m = /[?&]code=([A-Za-z0-9]{4})/.exec(location.search);
  if (!m) return;
  LOBBY.prefill = m[1].toUpperCase();
  renderLobby();
  openLobby();
}
function netRenderRoster(room) {
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
async function netSeatMode(seat, mode) {
  if (net.seat !== 0 || net.on) return;
  try {
    const d = await net.post('seatmode', { seat, mode, since: net.since });
    net.seats = d.room.seats || [];
    netRenderRoster(d.room);
  } catch (err) { lobbySay(prettyRoomError(err)); }
}
async function startRoom() {
  if (net.seat !== 0) return;
  lobbySay('Rolling out…');
  try {
    const data = await net.post('start', {});
    startNetMatch(data.room);
  } catch (err) { lobbySay(prettyRoomError(err)); }
}
function startNetMatch(room) {
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
function syncLeaveButtons() {
  renderMenu();
  renderShop();
}
/* The question is a Preact component (src/ui/leave.tsx); the game says what it
   asks and what each answer does. */
function renderLeaveVeil() {
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
function openLeaveVeil() {
  if (!net.on) return;
  const veil = $('leave-veil');
  if (!veil) return;
  renderLeaveVeil();
  veil.hidden = false;
  const stay = $('leave-stay');
  if (stay && stay.focus) stay.focus();
}
function closeLeaveVeil() {
  const veil = $('leave-veil');
  if (!veil || veil.hidden) return false;
  veil.hidden = true;
  return true;
}
function confirmLeave() {
  closeLeaveVeil();
  if (net.on) netLeave();
}
function netLeave(quiet) {
  const wasOn = net.on;
  net.leave(); // tells the server, stops both polls, clears the session
  END.rematch = null;
  END.backToRooms = false;
  renderEndVeil();
  replay.clear(); MATCH.pendingRoom = null; MATCH.myTurn = false; MATCH.lastPhase = ''; MATCH.lastTurn = -1; MATCH.lastRound = -1;
  SCORES.formHidden = false;
  renderScoresOverlay();
  hideShop();
  if ($('end-veil')) $('end-veil').hidden = true;
  if ($('lobby-veil')) $('lobby-veil').hidden = true;
  closeLeaveVeil();
  closeOverlays();
  syncLeaveButtons();
  if (wasOn && !quiet) {
    say('Back to the solo hills. The battery takes your seat in the room.', 'info');
    freshMatchFromSeedBox();
  }
}
async function netRematch() {
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
function netFire() {
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
function netSendAim() {
  MATCH.aimDirty = false;
  const t = myTank();
  if (!t || t.hp <= 0) return;
  net.sendQuiet({
    kind: 'aim',
    angle: Math.round(t.angle * 10) / 10,
    power: Math.round(t.power * 10) / 10,
  });
}
function netSendDrive(dx) {
  net.sendQuiet({ kind: 'drive', dx: Math.round(dx * 10) / 10 });
}
/* Loading a gun is fine on anyone's turn: it only sets what fires next. */
function netPick(w) {
  if (w !== 'shell' && (G.ammo[w] || 0) <= 0) {
    say(`No ${WEAPONS[w].name} left in the rack.`, 'info');
    return false;
  }
  const needRound = (WEAPONS[w] && WEAPONS[w].minRound) || 0;
  if (G.round < needRound) {
    say(`That unlocks in round ${needRound}.`, 'info');
    return false;
  }
  G.selected = w;
  sfx.play('click');
  say(`Loaded: ${WEAPONS[w].name}.`, 'info');
  renderHUD();
  net.sendQuiet({ kind: 'weapon', weapon: w });
  return true;
}
function netCycle() {
  const i = WORDER.indexOf(G.selected);
  for (let k = 1; k <= WORDER.length; k++) {
    const w = WORDER[(i + k) % WORDER.length];
    if (netPick(w)) return;
  }
}
function netBuy(it, qty) {
  const key = it.kind === 'ammo' ? it.w : (it.g || it.kind);
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
function netNext(want) {
  sfx.play('click');
  net.setReady(want);
}
/* A room update either lands now or waits behind the replay: the server
   settles a whole turn at once, and clients play it back (aim, flight,
   blasts, damage) before the new state takes over. The client has already
   counted `fresh` (the events past its cursor) as seen. */
function netOnSnapshot(room, fresh, first) {
  if (first) {
    // First sync: earlier events are history. Log them, replay nothing.
    // (A resync lands here too: events were lost, so nothing waiting is real.)
    replay.clear(); MATCH.pendingRoom = null;
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
function netAdopt(room) {
  net.seats = room.seats || [];
  if (room.map !== undefined) {
    net.map = room.map;
    net.mapName = room.mapName || 'Random hills';
  }
  if (Array.isArray(room.terrain) && room.terrain.length === W) {
    G.terrain = room.terrain.map(Number);
  }
  if (!G.clouds.length) {
    for (let i = 0; i < 5; i++) {
      G.clouds.push({ x: Math.random() * W, y: 30 + Math.random() * 90, s: 0.6 + Math.random() * 0.9, v: 3 + Math.random() * 5 });
    }
  }
  G.wind = room.wind || 0;
  const sameRound = G.round === (room.round || 1);
  G.round = room.round || 1;
  const before = new Map(G.tanks.map(t => [t.seat, t]));
  // While we aim, the server only learns our angle and power when a key is
  // let go: keep the local aim through polls so the barrel never snaps back.
  const aiming = sameRound && room.phase === 'play' && room.turn === net.seat;
  G.tanks = (room.tanks || []).map(t => {
    const mine = t.seat === net.seat;
    const was = before.get(t.seat);
    const seat = net.seats[t.seat];
    const ai = !seat || !seat.human;
    const id = mine ? 'tank' : String(t.name || '?').toLowerCase();
    return {
      id, seat: t.seat, isPlayer: mine,
      color: mine ? '#ffff00' : (ai ? (FOE_PAINT[id] || '#c9c9c9') : SEAT_PAINT[t.seat % SEAT_PAINT.length]),
      // The server drops tanks straight onto the ground; keep the drawn
      // height from the last poll so fallTanks() shows the fall.
      x: t.x, y: was && Math.abs(was.x - t.x) < 1 ? Math.min(was.y, t.y) : t.y, vy: was ? was.vy || 0 : 0,
      angle: mine && was && aiming ? was.angle : t.angle,
      power: mine && was && aiming ? was.power : t.power,
      hp: t.hp, maxHp: t.maxHp || 100, fuel: 0, dirS: t.dirS || 1,
      name: t.name,
      human: !ai,
      body: t.body || 'tank',
      menu: !!t.menu,
      bot: !!(seat && seat.bot),
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
  if (!G.ammo) G.ammo = { shell: Infinity, buck: 0, mortar: 0, rail: 0, nuke: 0 };
  if (room.you) {
    const a = {};
    for (const w of WORDER) {
      const have = room.you.ammo ? room.you.ammo[w] : 0;
      a[w] = have === -1 ? Infinity : (have || 0);
    }
    G.ammo = a;
    if (WORDER.indexOf(room.you.weapon) >= 0) G.selected = room.you.weapon;
    G.cash = room.you.cash || 0;
    G.score = room.you.score || 0;
    G.lives = room.you.lives || 0;
    G.shield = !!room.you.shield;
    G.jammer = room.you.jammer || 0;
    G.bunker = room.you.bunker || 0;
    G.laststand = !!room.you.laststand;
    G.plate = room.you.plate || 0;
    G.nextOneUp = room.you.nextUp || 3000;
    if (mine) mine.fuel = room.you.fuel || 0;
  }
  HUD.runStats = `Room ${net.code} · you are ${seatName(net.seat)} · round ${G.round}`;
  if (room.phase !== 'shop') net.dropReadyWish();
  if (room.phase === 'play') {
    G.over = false;
    G.phase = MATCH.myTurn ? 'aim' : 'think';
    hideShop();
    if ($('end-veil')) $('end-veil').hidden = true;
    if ($('lobby-veil')) $('lobby-veil').hidden = true;
    if (MATCH.lastPhase !== 'play' || room.round !== MATCH.lastRound) {
      // A started match takes the whole frame, same as solo: shut the menu
      // the host came through so nobody has to ESC it away mid-battle.
      if (MATCH.lastPhase !== 'play') closeOverlays();
      music.forRound(room.round);
      startBanner(`Round ${room.round}. ${room.mapName || 'Random hills'}.`);
      say(`Round ${G.round}. Wind ${windText()}. ${MATCH.myTurn ? 'Your move. Aim!' : seatName(room.turn) + ' moves first.'}`, 'info');
      if (MATCH.myTurn) talk('tank', 'tankity tank! My hill now!', true);
    } else if (MATCH.myTurn && MATCH.lastTurn !== net.seat) {
      say('Your move. Aim!', 'info');
    }
  } else if (room.phase === 'shop') {
    G.phase = 'shop';
    // Polls repeat the shop phase; only arriving in it shuts open panels.
    if (MATCH.lastPhase !== 'shop') { closePreview(); closeOverlays(); }
    renderShop();
    const veil = $('shop-veil');
    if (veil) veil.hidden = false;
    refreshNavHints();
    if (MATCH.lastPhase === 'play') talk('tank', 'Shopping! Then back to bam bam.', true);
  } else if (room.phase === 'over') {
    G.over = true;
    hideShop();
    netShowStandings(room);
  }
  MATCH.lastPhase = room.phase;
  MATCH.lastTurn = room.turn;
  MATCH.lastRound = room.round;
  render();
  renderHUD();
}
function netEvent(e) {
  if (!e || !e.t) return;
  if (e.t === 'shot' || e.t === 'burst') return; // flown by the replay
  if (e.t === 'fizzle') { say(`${seatName(e.by)} sends one into the sunset.`, 'info'); return; }
  if (e.t === 'fire') {
    if (e.seat === net.seat) say(`You fire ${WEAPONS[G.selected] ? WEAPONS[G.selected].name : 'a shell'}.`, 'info');
    else say(`${seatName(e.seat)} fires ${WEAPONS[e.w] ? WEAPONS[e.w].name : 'a shell'}.`, 'info');
    return;
  }
  if (e.t === 'aifire') {
    const t = G.tanks.find(x => x.seat === e.seat);
    const id = foeTalkId(t);
    if (id) talk(id, pick(FOE_FIRE[id]));
    say(`${seatName(e.seat)} fires ${WEAPONS[e.w] ? WEAPONS[e.w].name : 'a shell'}.`, 'info');
    return;
  }
  if (e.t === 'hit') {
    const victim = e.seat === net.seat;
    const killer = e.by === net.seat;
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
      if (kid) talk(kid, pick(FOE_HIT[kid]));
    } else if (killer) {
      const vt = G.tanks.find(x => x.seat === e.seat);
      if (foeTalkId(vt)) talk('tank', pick(TANK_HIT));
    }
    return;
  }
  if (e.t === 'kill') {
    const victim = e.seat === net.seat;
    sfx.play('boom');
    say(victim
      ? (e.by === net.seat ? 'You got yourself?! The hills are cruel.' : `${seatName(e.by)} wrecks YOU.`)
      : `${seatName(e.by)} wrecks ${seatName(e.seat)}.`,
      victim ? 'bad' : 'info');
    const vt = G.tanks.find(x => x.seat === e.seat);
    const vid = foeTalkId(vt);
    if (vid && FOE_DYING[vid]) talk(vid, FOE_DYING[vid], true);
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
    if (e.seat === net.seat) {
      sfx.play('win');
      say(`You take round ${e.round}. Winnings paid. Spend them.`, 'good');
    } else say(`${seatName(e.seat)} takes round ${e.round}.`, 'info');
    return;
  }
  if (e.t === 'roundlost') {
    sfx.play('lose');
    say(`Round ${e.round} goes to the battery. Every wrecked player loses a life; restock and roll again.`, 'bad');
    return;
  }
  if (e.t === 'eliminated') {
    if (e.seat === net.seat) {
      sfx.play('lose');
      say('The battery got you for good this time. Filing your report.', 'bad');
    } else say(`${seatName(e.seat)} is out of lives.`, 'info');
    return;
  }
  if (e.t === 'join') { say(`${e.name || seatName(e.seat)} rolled into the room.`, 'info'); return; }
  if (e.t === 'left') { say(`${e.name || seatName(e.seat)} left; the battery takes that seat.`, 'info'); return; }
  if (e.t === 'round') {
    say(`Round ${e.round}. Fresh barrels, same battery. Wind ${windText()}.`, 'info');
    talk('tank', 'Back in! These hills are mine!', true);
    return;
  }
  if (e.t === 'tactic') { say(`${seatName(e.seat).toUpperCase()} switches to ${e.s} tactics.`, 'info'); return; }
  if (e.t === 'auto') { say(`${seatName(e.seat)} sat quiet, so the crew fired for them.`, 'info'); return; }
}
/* ---------- room replay ---------- */
function netBlast(x, y, r, wkey) {
  sfx.play('boom');
  const kick = fxImpact(G.fx, wkey, x, y, r);
  G.shake = Math.min(1, G.shake + (kick !== undefined ? kick : wkey === 'nuke' ? 0.9 : r > 40 ? 0.5 : 0.3));
  G.booms.push({ x, y, r, wkey, t: 0, life: wkey === 'nuke' ? 0.8 : 0.5 });
  carveCrater(G.terrain, x, y, r, H - 4);
}
/* Your turn while the tab is out of sight: the tab title says so, a soft
   ping plays (unless Sound is off), and a notification pops up when the
   player allowed them. Inside a page on this host that frames the game (a
   site's page around it), that page's title is the tab's, so it changes too.
   Everything resets the moment the tab is seen again. */
let alertTitles = null;
function titleDocs() {
  const docs = [document];
  try { if (window.top !== window && window.top.document) docs.push(window.top.document); } catch (_) { /* another host */ }
  return docs;
}
function askNotifications() {
  try {
    if (typeof Notification === 'function' && Notification.permission === 'default') Notification.requestPermission();
  } catch (_) { /* unsupported */ }
}
function turnAlert() {
  if (!document.hidden) return;
  if (!alertTitles) {
    alertTitles = titleDocs().map(d => [d, d.title]);
    for (const [d, t] of alertTitles) d.title = `\u25cf Your turn \u00b7 ${t}`;
  }
  sfx.turnPing();
  try {
    if (typeof Notification === 'function' && Notification.permission === 'granted') {
      const n = new Notification('Your turn in Operation Tankity', { body: `Room ${net.code}: the hills are waiting.`, tag: 'tankity-turn' });
      n.onclick = () => { try { window.top.focus(); } catch (_) { window.focus(); } n.close(); };
    }
  } catch (_) { /* notifications unavailable */ }
}
function clearTurnAlert() {
  if (!alertTitles) return;
  for (const [d, t] of alertTitles) d.title = t;
  alertTitles = null;
}
/* The room's turn clock (rooms.php ROOM_TURN_SECS): when a human's turn runs
   out the crew fires a random gun from their rack. Its owner hears an alert
   with 30 seconds left; everyone sees the last 10 counted down. */
function tickTurnClock() {
  if (G.phase === 'shop') renderShopReady();
  if (!net.clockWarnDue()) return;
  if (!MATCH.myTurn) return;
  say(`${Math.ceil(net.turnClockLeft())} seconds left. Fire, or the crew picks a gun and fires for you.`, 'bad');
  sfx.clockWarn();
}
/* Tell the room when this player is in a menu (game menu, help, scores, the
   weapon picker), so the others see why the battle waits on them. The radio
   log is a glance, not a menu. */
function menuOpen() {
  return ['menu-overlay', 'help-overlay', 'report-overlay', 'gun-overlay', 'leave-veil'].some(id => { const el = $(id); return el && !el.hidden; });
}
function netSyncMenu() {
  net.setMenu(menuOpen());
}
/* A hidden tab plays nothing (browsers stop its frames), so its replay queue
   piles up. Coming back, or whenever more than one volley is waiting, skip
   all but the newest volley: their log lines still post, and the room state
   that follows carries the craters and armor. If it is already our turn,
   skip them all and hand over the controls at once. */
function netCatchUp() {
  const skipped = replay.catchUp(MATCH.pendingRoom, net.seat);
  if (!skipped) return;
  G.shells = [];
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
function netReplay(dt) {
  replay.step(dt);
  if (replay.idle() && MATCH.pendingRoom) {
    const room = MATCH.pendingRoom;
    MATCH.pendingRoom = null;
    netAdopt(room);
  }
}
function netEaseAim(dt) {
  const k = 1 - Math.exp(-dt * 5);
  for (const t of G.tanks) {
    if (t.isPlayer) continue;
    t.showA = t.showA === undefined ? t.angle : t.showA + (t.angle - t.showA) * k;
    t.showP = t.showP === undefined ? t.power : t.showP + (t.power - t.showP) * k;
  }
}
function netFrame(dt) {
  netSyncMenu();
  tickTurnClock();
  G.time += dt;
  netEaseAim(dt);
  updateCamera(dt);
  decayFx(dt);
  fallTanks(dt);
  for (const cl of G.clouds) {
    cl.x += cl.v * dt;
    if (cl.x - 40 > W) cl.x = -40;
  }
  netReplay(dt);
  pumpDialogue(dt);
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
    const arm = stepArm(input.held, dt, t, facing(t));
    t.angle = arm.angle;
    t.power = arm.power;
    if (arm.adjusting) MATCH.aimDirty = true;
    if (arm.idle && MATCH.aimDirty) netSendAim();
    if ((input.held.has('driveLeft') || input.held.has('driveRight')) && t.fuel > 0) {
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
  }
}
function renderNetHUD() {
  if (!G.tanks.length) return;
  const mine = myTank();
  const turnTank = G.tanks[G.turn] || G.tanks[0];
  HUD.turn =
    G.phase === 'shop' ? 'shop. Spend it!' :
    G.over ? 'match over' :
    !mine || mine.hp <= 0 ? 'wrecked. Watching ' + seatName(turnTank.seat) + '...' :
    MATCH.myTurn ? 'YOU. Aim!' : `${seatName(turnTank.seat)} aiming...`;
  HUD.angle = mine ? `${Math.round(mine.angle)}°` : '-';
  HUD.power = mine ? `${Math.round(mine.power)}` : '-';
  HUD.wind = windText();
  renderLoadout();
  renderStanding(mine, G.tanks.filter(x => !x.isPlayer).map(x => `${seatName(x.seat)}:${Math.max(0, Math.round(x.hp))}`).join(' '));
  HUD.fuel = mine ? `${Math.round(mine.fuel)}` : '-';
  paintHud();
}
function netShowStandings(room) {
  net.stopPolling();
  const rows = ((room && room.seats) || []).map((s, i) => ({
    name: s.human ? s.initials : (s.name + ' (AI)'),
    score: s.score || 0,
    mine: i === net.seat,
  }));
  rows.sort((a, b) => b.score - a.score);
  const champ = rows[0];
  END.kicker = `Room ${net.code} · final standings`;
  END.title = champ && champ.mine ? 'Top gun! The hills are yours.' : (champ ? `${champ.name} holds the hills.` : 'Match over.');
  END.text = `The battery never quits, and neither do you. Room ${net.code} ended on round ${room.round || '?'}.`;
  END.score = rows.map(r => `${r.name} ${r.score}${r.mine ? ' (you)' : ''}`).join(' · ') +
    (room.you ? ` · you banked $${room.you.cash || 0}` : '');
  END.backToRooms = true;
  END.formHidden = true; // room standings are not high-score runs
  END.rematch = net.map
    ? `Rematch on ${net.mapName || 'these hills'}`
    : 'Rematch on random hills';
  renderEndVeil();
  const veil = $('end-veil');
  if (veil) veil.hidden = false;
  refreshNavHints();
}

/* ---------- scores: file-backed API with localStorage fallback ---------- */
function localScores() {
  try {
    return JSON.parse(window.localStorage.getItem('tankity-local') || '[]');
  } catch (_) { return []; }
}
function saveLocal(entry) {
  try {
    const arr = localScores();
    arr.push(entry);
    arr.sort((a, b) => b.score - a.score);
    window.localStorage.setItem('tankity-local', JSON.stringify(arr.slice(0, 10)));
  } catch (_) { /* private mode etc. */ }
}
/* The scores overlay is a Preact component (src/ui/scores.tsx); the game loads
   the list and hands in finished lines. */
const SCORES = { rows: null, note: '', formHidden: false };
function renderScoresOverlay() {
  const section = $('report-overlay');
  if (!section) return;
  drawScores(section, {
    keyHint,
    onClose: () => toggleOverlay('report-overlay', 'scores-open'),
    rows: SCORES.rows,
    note: SCORES.note,
    formHidden: SCORES.formHidden,
    onFile: raw => {
      const name = raw.trim();
      if (!name) { say('Give your callsign first, hero.', 'info'); return; }
      fileReport(name);
    },
  });
}
async function loadScores() {
  let rows = [];
  let src = 'file store';
  try {
    const res = await fetch('scores.php', { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error('http ' + res.status);
    const data = await res.json();
    rows = data.scores || [];
  } catch (_) {
    rows = localScores().map(s => ({ name: s.name, best: s.score, banked: s.banked, won: s.won }));
    src = 'this browser only (server store unreachable)';
  }
  SCORES.rows = rows.slice(0, 10).map(r => `${r.name}: ${r.best} pts (${r.banked} rounds won${r.won ? ', champion' : ''})`);
  SCORES.note = `Showing reports from ${src}.`;
  renderScoresOverlay();
}
/* The last callsign filed, so the next report is one tap. */
function savedCallsign() {
  try { return window.localStorage.getItem('tankity-callsign') || ''; } catch (_) { return ''; }
}
async function fileReport(name) {
  try { window.localStorage.setItem('tankity-callsign', name); } catch (_) { /* fine */ }
  const entry = { name, score: G.score, banked: G.roundsWon, won: G.won, seed: G.seed };
  try {
    const res = await fetch('scores.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    });
    if (!res.ok) throw new Error('http ' + res.status);
    say(`Report filed for ${name}. The base salutes you.`, 'good');
  } catch (_) {
    saveLocal(entry);
    say(`Server store unreachable, so the report stays in ${name}'s browser instead.`, 'info');
  }
  loadScores();
}

/* ---------- input + init ---------- */
/* Keys and touch live in src/input.ts: it holds the key table (game.yaml's keys
// section, served as game.json, with a frozen fallback), turns a key press or a
// held pad button into a named command, and runs the held-key arm movement.
// This file says what each command does (bindKeys below). */

/* Phones and tablets: a touch screen with no mouse or trackpad. They get no
// keyboard at all, so key bindings stay off and no label names a key. */
const TOUCH = touchOnly(typeof window.matchMedia === 'function' ? q => window.matchMedia(q) : undefined);
const input = createInput({ touch: TOUCH });
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
/* What a touch player taps instead, for prose that names a key. */
const TOUCH_NAMES = {
  'aim:barrelLeft': '◀', 'aim:barrelRight': '▶', 'aim:powerUp': '▲', 'aim:powerDown': '▼',
  'aim:driveLeft': 'Drive ◀', 'aim:driveRight': 'Drive ▶',
  'global:cycle': 'Weapons', 'global:fire': 'Fire',
};
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
  endTutorial(!!TUT);
  if (opts && opts.tut) TUT_ARMED = true;
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
function shopSelect(dir) {
  G.shopSel = clamp(G.shopSel + dir, 0, SHOP.length - 1);
  sfx.play('click');
  renderShop();
  return true;
}
/* Qty keys pick how many packs ride on every buy, capped at what the chest
// can cover for that row. */
function shopQtyUp() {
  const max = Math.max(1, maxPacks(SHOP[G.shopSel]));
  if (G.shopQty < max) { G.shopQty++; sfx.play('click'); }
  else sfx.play('thud');
  renderShop();
  return true;
}
function shopQtyDown() {
  if (G.shopQty > 1) {
    G.shopQty--;
    sfx.play('click');
  }
  renderShop();
  return true;
}
/* The gun picker's fixed keys (arrows, Enter or Space, digits) only mean
// something while it is open; otherwise the key falls through. */
function gunGrid(dir) {
  if (!gunsOpen()) return undefined;
  moveGunCursor(dir);
  return true;
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
      if (!p.repeat) pickGun(rackGuns()[gunCursor]);
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
      if (TUT) { skipTutorial(); return; }
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
/* The weapon picker: every gun on the rack as a tile, for when Q would take
   a dozen presses. Arrows or J/K move the cursor, Enter or a digit loads. */
const GUN_COLS = 4;
let gunCursor = 0;
function rackGuns() {
  return WORDER.filter(w => w === 'shell' || (G.ammo[w] || 0) > 0);
}
function gunsOpen() {
  const ov = $('gun-overlay');
  return !!ov && !ov.hidden;
}
function openGuns() {
  if (G.over || G.phase === 'shop' || demoBlock()) return;
  const ov = $('gun-overlay');
  if (!ov) return;
  gunCursor = Math.max(0, rackGuns().indexOf(G.selected));
  renderGuns();
  ov.hidden = false;
  const btn = $('btn-weapon');
  if (btn) btn.setAttribute('aria-expanded', 'true');
  refreshNavHints();
  sfx.play('click');
}
function closeGuns() {
  const ov = $('gun-overlay');
  if (!ov || ov.hidden) return false;
  ov.hidden = true;
  const btn = $('btn-weapon');
  if (btn) btn.setAttribute('aria-expanded', 'false');
  return true;
}
/* The weapon picker is a Preact component (src/ui/guns.tsx): the rack as tiles,
   with the cursor the keys move. */
function renderGuns() {
  const section = $('gun-overlay');
  if (!section || !G.ammo) return;
  const guns = rackGuns();
  gunCursor = clamp(gunCursor, 0, guns.length - 1);
  drawGuns(section, {
    keyHint,
    onClose: () => { closeGuns(); },
    tiles: guns.map(w => ({
      key: w,
      name: WEAPONS[w].name,
      title: WEAPONS[w].note || WEAPONS[w].name,
      count: w === 'shell' ? '∞' : `×${G.ammo[w] || 0}`,
      loaded: w === G.selected,
    })),
    cursor: gunCursor,
    drawIcon: drawShellIcon,
    arsenalRev: ARSENAL_REV,
    onPick: pickGun,
  });
}
function pickGun(w) {
  if (selectWeapon(w) !== false) closeGuns();
}
function moveGunCursor(d) {
  gunCursor = clamp(gunCursor + d, 0, rackGuns().length - 1);
  sfx.play('click');
  renderGuns();
}
function cycleWeapon() {
  if (G.over || G.phase === 'shop') return;
  if (net.on) { netCycle(); return; }
  if (demoBlock()) return;
  const i = WORDER.indexOf(G.selected);
  for (let k = 1; k <= WORDER.length; k++) {
    const w = WORDER[(i + k) % WORDER.length];
    if (w === 'shell' || (G.ammo[w] || 0) > 0) {
      G.selected = w;
      sfx.play('click');
      say(`Loaded: ${WEAPONS[w].name}.`, 'info');
      renderHUD();
      return;
    }
  }
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
/* ---------- tutorial: coached opening moves, skippable forever ---------- */
// The tutorial arms on a fresh New Game and starts at the first live
// battle (after the pre-match shop). Skipping or finishing remembers the
// choice in localStorage; the menu replays it any time.
let TUT = null;
let TUT_ARMED = false;
/* Step texts name keys as {context:action} tokens so a reconfigured layout
// rewrites the lesson by itself. */
const TUT_STEPS = [
  { text: 'Hold {aim:barrelLeft} or {aim:barrelRight} to swing the barrel. Watch the muzzle stub move.', done: t => t.angle !== 62 },
  { text: 'Hold {aim:powerUp} or {aim:powerDown} to change power. More power means longer legs.', done: t => t.power !== 55 },
  { text: 'Tap {aim:driveLeft} or {aim:driveRight} to drive while fuel lasts. Hills are cover.', done: t => TUT && Math.abs(t.x - TUT.x0) > 2 },
  { text: 'Press {global:cycle} to cycle shells. The HUD shows what is loaded.', done: () => TUT && G.selected !== TUT.sel0 },
  { text: 'Press {global:fire} to fire. Then read the wind and adjust.', done: () => TUT && TUT.fired },
];
function fmtKeys(text) {
  return String(text).replace(/\{([a-z]+):([a-zA-Z]+)\}/g, (_, ctx, a) => (TOUCH && TOUCH_NAMES[ctx + ':' + a]) || keyHint(ctx, a));
}
function tutorialSeen() {
  try {
    return window.localStorage.getItem('tankity-tutorial') === 'done';
  } catch (_) {
    return true; // without storage there is nowhere to remember, so never nag
  }
}
function markTutorialSeen() {
  try {
    window.localStorage.setItem('tankity-tutorial', 'done');
  } catch (_) { /* private mode etc. */ }
}
/* The coach is a Preact component (src/ui/tutorial.tsx); the game says which
   move the player is on and what to call the keys. */
function renderTutorial() {
  const section = $('tutorial-overlay');
  if (!section) return;
  drawTutorial(section, {
    keyHint,
    text: TUT ? `Move ${TUT.step + 1} of ${TUT_STEPS.length}: ${fmtKeys(TUT_STEPS[TUT.step].text)}` : '',
    progress: TUT ? 'Follow along in the hills behind this card.' : '',
    skip: `Skip tutorial${keyCap('global', 'escape')}`,
    onSkip: skipTutorial,
  });
  refreshNavHints();
}
function startTutorial() {
  if (G.demo || !G.tanks.length) return;
  TUT_ARMED = false;
  TUT = { step: 0, x0: me().x, sel0: G.selected, fired: false };
  const ov = $('tutorial-overlay');
  if (ov) ov.hidden = false;
  renderTutorial();
}
function maybeStartTutorial() {
  if (TUT_ARMED && !TUT && !G.demo && G.tanks.length) startTutorial();
}
/* U or the menu button: coach the live battle, or deal a fresh match with
// the coach armed for its first battle. Never interrupts a room match. */
function tutorialOpen() {
  if (TUT || net.on) return;
  closeOverlays();
  if (!G.demo && G.tanks.length && (G.phase === 'aim' || G.phase === 'think' || G.phase === 'fly' || G.phase === 'settle')) {
    startTutorial();
  } else {
    freshMatchFromSeedBox({ tut: true });
  }
}
function endTutorial(seen) {
  if (seen) markTutorialSeen();
  TUT = null;
  TUT_ARMED = false;
  const ov = $('tutorial-overlay');
  if (ov) ov.hidden = true;
}
function skipTutorial() {
  sfx.play('click');
  say(TOUCH ? 'Tutorial skipped. Replay it from the menu any time.' : `Tutorial skipped. Press ${keyHint('global', 'tutorial')} any time to replay it.`, 'info');
  endTutorial(true);
}
function tickTutorial() {
  if (!TUT || G.demo || G.over || !G.tanks.length) return;
  if (TUT.step < TUT_STEPS.length && TUT_STEPS[TUT.step].done(me())) {
    TUT.step++;
    sfx.play('click');
    if (TUT.step >= TUT_STEPS.length) {
      say('Tutorial complete. The hills are yours.', 'good');
      endTutorial(true);
      return;
    }
    renderTutorial();
  }
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
