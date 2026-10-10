/* Operation Tankity: Scorched Earth.
 * Turn-based artillery across destructible hills. You and the drone battery
 * trade shells: angle, power, wind, craters. Last one rolling wins the round.
 * Controls: hold Left/Right = angle · hold Up/Down = power · A/D = drive ·
 * Ctrl/Space = fire · Q = weapon · N = next round / new match · M = music.
 */
/* The pure game math (RNG, terrain, flight, hits, blasts, drone aim) lives in
 * src/sim.ts, compiled to js/sim.js and imported here; the ?v= matches this
 * script's in index.html so a browser never pairs the two from different
 * releases. Everything below is the part that shows it: sound, particles, the
 * HUD, rooms and the shop. */
import {
  hashSeed, mulberry32, gauss, W, H, GRAV, FLAT_GRAV, TUNE, clamp,
  buildArsenal as simBuildArsenal, droneRack as simDroneRack, genTerrain as simGenTerrain,
  surfY as simSurfY, carveCrater, facing, isGroundUnit, spawnSpots, spotTaken as simSpotTaken,
  muzzle, shotSpeed, stepBallistic, blastDamage,
  fireWeapon as simFireWeapon, stepShells as simStepShells, fallTanks as simFallTanks,
  anyTankFalling as simAnyTankFalling, aiChoose as simAiChoose,
} from './js/sim.js?v=20261010zd';
import {
  initAudio, sfx, music, unlock, noteGesture, isSoundMuted, setSoundMuted, isMusicMuted, setMusicMuted,
} from './js/audio.js?v=20261010zd';
import {
  RoomClient, prettyRoomError, inviteUrl, shouldCatchUp, planCatchUp, VOLLEY_OPENERS, CLOCK_SHOW_S,
} from './js/net.js?v=20261010zd';

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
function buildArsenal(data) {
  const a = simBuildArsenal(data);
  if (!a) return false;
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
  // already off in render()).
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
function drawShellBody(c, wkey, x, y, vx, vy, time) {
  if (!FX) return;
  const g = (WEAPONS[wkey] || {}).gfx || {};
  FX.drawBody(c, x, y, vx, vy, fxSet(wkey).body, g.shell || '#ffe27a', time);
}


/* ---------- state ---------- */
const G = {
  seed: '', rng: null, body: 'tank',
  terrain: null, clouds: [],
  tanks: [], turn: 0, phase: 'aim', // aim | think | fly | settle | shop | over
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
// Attract mode: the crew drives every tank until a human takes over.
function startDemo() {
  resetMatch('scorched-demo');
  G.demo = true;
  G.round = 1;
  newRound(`Demo mode. Press New Game${TOUCH ? '' : ` (or ${keyHint('global', 'new')})`} to play.`);
  render();
  renderHUD();
}
function newMatch(seedStr) {
  resetMatch(seedStr);
  // No round yet: spend the starting stake in the shop first.
  G.phase = 'banner';
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
function newRound(bannerText) {
  genTerrain();
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
  G.phase = 'banner';
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
      G.phase = 'aim';
      say(`Round ${G.round}. Wind ${windText()}. Your move. Aim!`, 'info');
      maybeStartTutorial();
    } else {
      G.phase = 'think';
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
  G.phase = 'fly';
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
      G.phase = 'settle';
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
    G.phase = 'aim';
    say('Your turn. Aim!', 'info');
  } else {
    G.phase = 'think';
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
  if (me().hp <= 0) {
    if (G.demo) {
      say('Demo tank wrecked. Rolling a fresh one.', 'info');
      newRound('Back in! Same hills, fresh tank.');
      return;
    }
    G.lives -= 1;
    if (G.lives <= 0) {
      G.lives = 0;
      endMatch(false, 'The tank is scrap across these hills. The battery keeps the high ground.');
    } else {
      say(`Tank wrecked! ${G.lives} ${G.lives === 1 ? 'life' : 'lives'} left. Same round, fresh hills.`, 'bad');
      talk('tank', 'I will be back... right now!', true);
      newRound('Back in! Same hills, fresh tank.');
    }
    return;
  }
  if (!foesAlive().length) {
    if (G.demo) {
      G.round += 1;
      newRound();
      return;
    }
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
    G.phase = 'banner';
    startBanner(`Round ${G.round} claimed! Spend the winnings.`, openShop);
    return;
  }
  // Wind shifts a little after every shot.
  G.wind = clamp(Math.round(G.wind + gauss(G.rng) * 2), -12, 12);
  nextTurn();
}
function endMatch(won, text) {
  if (G.demo) { startDemo(); return; }
  if (G.over) return;
  endTutorial(true);
  G.over = true;
  G.won = won;
  G.phase = 'over';
  music.stop();
  hideShop();
  refreshNavHints();
  if (won) sfx.play('win'); else sfx.play('lose');
  say(text, won ? 'good' : 'bad');
  const veil = $('end-veil');
  if (veil) {
    $('end-kicker').textContent = won ? 'Match over' : 'Match lost';
    $('end-title').textContent = won ? 'Hills claimed!' : 'Tank down';
    $('end-text').textContent = text;
    $('end-score').textContent = `Score ${G.score} · ${G.roundsWon} rounds won · ${G.round} rounds played · seed ${G.seed}`;
    // File the run right here, with the last callsign ready.
    const ef = $('end-score-form');
    if (ef) ef.hidden = false;
    const en = $('end-name');
    if (en && !en.value) en.value = savedCallsign();
    const eb = ef && ef.querySelector && ef.querySelector('button');
    if (eb) { eb.disabled = false; eb.textContent = 'File score'; }
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
  G.phase = 'shop';
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
/* The shop's start button. In a room it is the Ready toggle: pressed reads
   "Ready ✓", and a line under it counts who is ready and the time left before
   the shop closes on its own (rooms.php ROOM_SHOP_SECS). */
let shopReadyShown = '';
function renderShopReady() {
  const next = $('shop-next');
  const line = $('shop-ready');
  if (!net.on) {
    if (next) {
      next.textContent = `Start round ${G.round + 1}${keyCap('shop', 'next')}`;
      next.removeAttribute('aria-pressed');
    }
    if (line) line.hidden = true;
    shopReadyShown = '';
    return;
  }
  const mine = net.readyNow();
  const voters = net.seats.filter(s => s.human && s.lives > 0);
  const ready = voters.filter(s => s.ready).length;
  const left = net.shopClockLeft();
  const clock = left === null ? '' : ` · shop closes in ${Math.floor(Math.ceil(left) / 60)}:${String(Math.ceil(left) % 60).padStart(2, '0')}`;
  const text = `${mine ? 'Ready ✓' : 'Ready'}${keyCap('shop', 'next')}`;
  const status = `${ready}/${voters.length} ready${clock}`;
  const marks = voters.map(s => `${String(s.name).toUpperCase()}${s.ready ? ' ✓' : ''}`).join('  ');
  const shown = text + '|' + status + '|' + marks;
  if (shown === shopReadyShown) return;
  shopReadyShown = shown;
  if (next) {
    next.textContent = text;
    next.setAttribute('aria-pressed', mine ? 'true' : 'false');
  }
  if (line) {
    line.hidden = false;
    line.textContent = `${status} · ${marks}`;
  }
}
let shopSelShown = -1; // the row renderShop last brought into view
function renderShop() {
  const title = $('shop-title');
  if (title) title.textContent = G.round === 0 ? 'Pre-match shop' : 'Field shop';
  renderShopReady();
  const cash = $('shop-cash');
  if (cash) {
    cash.textContent = G.round === 0
      ? `War chest: $${G.cash} · spend your stake before the first hill`
      : `War chest: $${G.cash} · armor ${me().hp}/${TUNE.playerArmor} · round ${G.round} cleared`;
  }
  const list = $('shop-list');
  if (!list) return;
  // Redraws (buys, pack counts, room polls) keep the list where it was.
  const keepTop = list.scrollTop;
  const selMoved = shopSelShown !== G.shopSel;
  list.innerHTML = '';
  G.shopSel = clamp(G.shopSel || 0, 0, SHOP.length - 1);
  G.shopQty = clamp(G.shopQty || 1, 1, 9);
  let lastCat = '';
  let shellRowShown = false;
  SHOP.forEach((it, idx) => {
    if (it.cat !== lastCat) {
      lastCat = it.cat;
      const h = document.createElement('li');
      h.className = 'shop-cat';
      h.textContent = it.cat;
      list.appendChild(h);
      // The Shell never needs buying, but it is part of the arsenal: it
      // heads the shells with no number and no Buy button.
      if (it.kind === 'ammo' && !shellRowShown) {
        shellRowShown = true;
        list.appendChild(shellShopRow());
      }
    }
    const locked = (it.minRound || 0) > G.round;
    const unit = packPrice(it);
    const qty = G.shopQty;
    const total = unit * qty;
    const li = document.createElement('li');
    if (idx === G.shopSel) li.className = 'sel';
    const item = document.createElement('div');
    item.className = 'shop-item';
    const name = document.createElement('div');
    name.className = 'shop-name';
    const parts = shopName(it, unit);
    setShopName(name, `${idx + 1}. ${parts.name}`, `${parts.vals}${qty > 1 ? ` ×${qty} = $${total}` : ''}`);
    const sub = document.createElement('div');
    sub.className = 'shop-sub';
    sub.textContent = shopSub(it);
    const sub2 = document.createElement('div');
    sub2.className = 'shop-sub';
    sub2.textContent = shopSub2(it, locked);
    item.appendChild(name);
    item.appendChild(sub);
    item.appendChild(sub2);
    const acts = document.createElement('span');
    acts.className = 'acts';
    if (it.kind === 'ammo') {
      const pv = document.createElement('button');
      pv.type = 'button';
      pv.append(document.createTextNode('Preview '), keySpan('shop', 'preview'));
      pv.addEventListener('click', ev => { ev.currentTarget.blur(); openPreview(it.w); });
      acts.appendChild(pv);
    }
    const btn = document.createElement('button');
    btn.type = 'button';
    if (locked) {
      btn.textContent = 'Locked';
    } else {
      btn.append(document.createTextNode(qty > 1 ? `Buy ×${qty} ` : 'Buy '), keySpan('shop', 'buy'));
    }
    btn.disabled = locked || G.cash < total;
    btn.addEventListener('click', () => buyItem(it, G.shopQty));
    acts.appendChild(btn);
    const icon = document.createElement('canvas');
    icon.className = 'shop-icon';
    icon.setAttribute('aria-hidden', 'true');
    if (it.kind === 'ammo') drawShellIcon(icon, it.w);
    else drawGearIcon(icon, it.g);
    li.appendChild(icon);
    li.appendChild(item);
    li.appendChild(acts);
    list.appendChild(li);
  });
  list.scrollTop = keepTop;
  // Riding the selection with the keys keeps the highlighted row in view.
  shopSelShown = G.shopSel;
  const sel = selMoved && list.querySelector('.sel');
  if (sel && sel.scrollIntoView) sel.scrollIntoView({ block: 'nearest' });
  renderKeyHints();
  refreshNavHints();
}
/* A live (KEY) cap for buttons built in script, matching the boot pass over
// [data-keyhint] spans for buttons written in markup. */
function keySpan(ctx, action) {
  const s = document.createElement('span');
  s.className = 'key';
  s.setAttribute('data-keyhint', ctx + ':' + action);
  s.textContent = `(${keyHint(ctx, action)})`;
  return s;
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
function setShopName(el, name, vals) {
  if (!el.replaceChildren) { el.textContent = `${name} ${vals}`; return; }
  const v = document.createElement('span');
  v.className = 'shop-vals';
  v.textContent = vals;
  el.replaceChildren(document.createTextNode(`${name} `), v);
}
function shellShopRow() {
  const li = document.createElement('li');
  li.className = 'shop-free';
  const icon = document.createElement('canvas');
  icon.className = 'shop-icon';
  icon.setAttribute('aria-hidden', 'true');
  drawShellIcon(icon, 'shell');
  const item = document.createElement('div');
  item.className = 'shop-item';
  const name = document.createElement('div');
  name.className = 'shop-name';
  setShopName(name, WEAPONS.shell.name, '∞ (free)');
  const sub = document.createElement('div');
  sub.className = 'shop-sub';
  sub.textContent = shopSub({ kind: 'ammo', w: 'shell' });
  const sub2 = document.createElement('div');
  sub2.className = 'shop-sub';
  sub2.textContent = 'Always loaded, never runs out.';
  item.append(name, sub, sub2);
  const acts = document.createElement('span');
  acts.className = 'acts';
  const pv = document.createElement('button');
  pv.type = 'button';
  pv.textContent = 'Preview';
  pv.addEventListener('click', ev => { ev.currentTarget.blur(); openPreview('shell'); });
  acts.appendChild(pv);
  li.append(icon, item, acts);
  return li;
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
  newRound();
}

/* ---------- firing range: a live mini demo sharing the real ballistics ---------- */
const PV_W = 360, PV_H = 200, PV_WIND = 3, PV_FOE_HP = 60;
function makePreviewTerrain() {
  const terr = new Array(PV_W);
  for (let x = 0; x < PV_W; x++) {
    terr[x] = 150 + 14 * Math.sin(x / 63 + 1) + 7 * Math.sin(x / 29);
  }
  return terr;
}
function openPreview(wkey) {
  const w = WEAPONS[wkey];
  if (!w) return;
  G.preview = {
    wkey, terr: makePreviewTerrain(),
    sx: 44, tx: 296, wind: PV_WIND,
    angle: 60, power: 50, phase: 'aim', t: 0.6,
    shells: [], booms: [], volleys: 0, foeHp: PV_FOE_HP,
    fx: FX ? FX.createSystem({ max: 260 }) : null,
    result: '', resultT: 0, volleyDmg: 0, volleyHits: 0,
    cv: document.getElementById('preview-stage'),
  };
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
/* Aim the demo at the target with the same integrator the war uses. A coarse
 * sweep plus a fine pass lands every demo on the target: demos never miss. */
function solvePreview(pv) {
  const w = WEAPONS[pv.wkey];
  let best = null;
  const consider = (a, p) => {
    const ca = clamp(a, 5, 85), cp = clamp(p, 10, 100);
    const err = Math.abs(previewShot(pv, ca, cp) - pv.tx);
    if (!best || err < best.err) best = { err, a: ca, p: cp };
  };
  if (w.flat) {
    // Rail speed answers to power, so sweep both: short soft lobs thread
    // hills that full-power bolts sail over.
    for (let a = 5; a <= 85; a += 2) {
      for (const p of [20, 35, 50, 65, 80]) consider(a, p);
    }
    for (let a = best.a - 3; a <= best.a + 3; a += 0.5) {
      for (let p = best.p - 6; p <= best.p + 6; p += 1.5) consider(a, p);
    }
  } else {
    for (let p = 20; p <= 100; p += 2) consider(60, p);
    for (let a = 50; a <= 70; a += 2) consider(a, best.p);
    for (let a = best.a - 3; a <= best.a + 3; a += 0.5) consider(a, best.p);
    for (let p = best.p - 2; p <= best.p + 2; p += 0.25) consider(best.a, p);
  }
  pv.angle = best.a;
  pv.power = best.p;
}
function previewShot(pv, angle, power) {
  const w = WEAPONS[pv.wkey];
  const rad = angle * Math.PI / 180;
  const st = {
    x: pv.sx, y: pv.terr[pv.sx] - 12,
    vx: Math.cos(rad) * shotSpeed(power, w.flat, w.speed),
    vy: -Math.sin(rad) * shotSpeed(power, w.flat, w.speed),
  };
  const grav = w.flat ? FLAT_GRAV : GRAV;
  for (let i = 0; i < 720; i++) {
    stepBallistic(st, 1 / 60, pv.wind, grav);
    if (st.x < 0 || st.x >= PV_W || st.y >= PV_H) return st.x;
    if (i >= 6 && st.y >= pv.terr[clamp(Math.round(st.x), 0, PV_W - 1)]) return st.x;
  }
  return st.x;
}
function previewFire(pv) {
  const w = WEAPONS[pv.wkey];
  const rad = pv.angle * Math.PI / 180;
  const shots = w.pellets || 1;
  for (let i = 0; i < shots; i++) {
    const off = shots === 1 ? 0 : (i - (shots - 1) / 2) * (w.spread || 0);
    const a = rad + off;
    const spd = shotSpeed(pv.power, w.flat, w.speed);
    pv.shells.push({ x: pv.sx, y: pv.terr[pv.sx] - 12, vx: Math.cos(a) * spd, vy: -Math.sin(a) * spd, wkey: pv.wkey, age: 0, pierced: false, split: false });
  }
  pv.volleyDmg = 0;
  pv.volleyHits = 0;
  fxMuzzle(pv.fx, pv.wkey, pv.sx, pv.terr[pv.sx] - 12, Math.atan2(-Math.sin(rad), Math.cos(rad)));
}
function previewBoom(pv, x, y, ov) {
  const w = WEAPONS[pv.wkey];
  const dmg0 = (ov && ov.dmg) || w.dmg;
  const r = (ov && ov.radius) || w.radius;
  pv.booms.push({ x, y, r, wkey: pv.wkey, t: 0, life: 0.5 });
  carveCrater(pv.terr, x, y, r, PV_H - 4);
  fxImpact(pv.fx, pv.wkey, x, y, r);
  // Same falloff the war uses, scored against the demo target.
  const fy = pv.terr[pv.tx] - 12;
  const d = Math.hypot(pv.tx - x, fy - y);
  if (d <= r + 14) {
    let dmg = blastDamage(dmg0, d, r);
    const direct = d < 14;
    if (direct) dmg *= 2;
    pv.foeHp = Math.max(0, pv.foeHp - dmg);
    pv.volleyDmg += dmg;
    pv.volleyHits += 1;
  }
}
function stepPreview(dt) {
  const pv = G.preview;
  if (!pv) return;
  if (pv.fx) { pv.fx.wind = pv.wind; pv.fx.step(dt); }
  for (const bm of pv.booms) bm.t += dt;
  pv.booms = pv.booms.filter(bm => bm.t < bm.life);
  if (pv.resultT > 0) pv.resultT -= dt;
  if (pv.phase === 'aim') {
    pv.t -= dt;
    if (pv.t <= 0) {
      solvePreview(pv);
      previewFire(pv);
      pv.phase = 'fly';
    }
  } else if (pv.phase === 'fly') {
    const w = WEAPONS[pv.wkey];
    const grav = w.flat ? FLAT_GRAV : GRAV;
    const fy = pv.terr[pv.tx] - 12;
    for (const s of pv.shells) {
      s.age = (s.age || 0) + dt;
      if (w.effect === 'seeker') {
        const dx = pv.tx - s.x, dy = fy - s.y;
        const d = Math.max(1, Math.hypot(dx, dy));
        const push = (w.steer || 70) * dt;
        s.vx += (dx / d) * push;
        s.vy += (dy / d) * push;
      }
      stepBallistic(s, dt, pv.wind, grav);
      if (s.dead) continue;
      fxTrail(pv.fx, s, dt);
      if (w.effect === 'cluster' && !s.split && s.age >= (w.fuse || 0.9)) {
        s.split = true;
        fxSpecial(pv.fx, pv.wkey, 'split', s.x, s.y, Math.atan2(s.vy, s.vx));
        const n = Math.max(2, w.split || 4), fan = w.fan || 0.22;
        const sp = Math.hypot(s.vx, s.vy) * 0.85, base = Math.atan2(s.vy, s.vx);
        for (let i = 0; i < n; i++) {
          const a = base + (i - (n - 1) / 2) * fan;
          pv.shells.push({ x: s.x, y: s.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, wkey: pv.wkey, age: 0, pierced: false, split: true, dw: w.subDmg || w.dmg, dr: w.subRadius || w.radius });
        }
        s.dead = true;
        continue;
      }
      const touch = !s.pierced && Math.hypot(s.x - pv.tx, s.y - fy) < 10;
      const near = w.effect === 'proximity' && Math.hypot(s.x - pv.tx, s.y - fy) < (w.prox || 34);
      if (touch || near) {
        if (w.effect === 'pierce' && !s.pierced && touch) {
          s.pierced = true;
          fxSpecial(pv.fx, pv.wkey, 'pierce', s.x, s.y, Math.atan2(s.vy, s.vx));
          previewBoom(pv, s.x, s.y, s.dw ? { dmg: s.dw, radius: s.dr } : null);
          continue;
        }
        s.dead = true;
        previewBoom(pv, s.x, s.y, s.dw ? { dmg: s.dw, radius: s.dr } : null);
        continue;
      }
      s.dead = s.x < 0 || s.x >= PV_W || s.y >= PV_H ||
        (s.age >= 0.1 && s.y >= pv.terr[clamp(Math.round(s.x), 0, PV_W - 1)]);
      if (s.dead) previewBoom(pv, s.x, s.y, s.dw ? { dmg: s.dw, radius: s.dr } : null);
    }
    pv.shells = pv.shells.filter(s => !s.dead);
    if (!pv.shells.length) {
      pv.phase = 'show';
      pv.t = 1.6;
      pv.result = pv.volleyHits > 1
        ? `${pv.volleyHits} hits · ${pv.volleyDmg} total damage`
        : pv.volleyHits === 1
          ? (pv.volleyDmg >= WEAPONS[pv.wkey].dmg ? `Direct hit! ${pv.volleyDmg} damage (×2 bonus)` : `Splash: ${pv.volleyDmg} damage`)
          : 'Clean miss. Blame the wind.';
      pv.resultT = 1.6;
      const pr = $('preview-result');
      if (pr) pr.textContent = pv.result;
    }
  } else if (pv.phase === 'show') {
    pv.t -= dt;
    if (pv.t <= 0) {
      pv.volleys += 1;
      if (pv.foeHp <= 0 || pv.volleys % 4 === 3) {
        pv.terr = makePreviewTerrain();
        pv.foeHp = PV_FOE_HP;
      }
      pv.phase = 'aim';
      pv.t = 0.5;
    }
  }
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
function drawBoom(c, bm) {
  const p = Math.min(1, bm.t / bm.life);
  const rr = Math.max(0.1, bm.r * (1 - Math.pow(1 - p, 3)));
  const blast = ((WEAPONS[bm.wkey] || {}).gfx || {}).blast || [];
  c.globalAlpha = 0.4 * (1 - p);
  c.fillStyle = blast[0] || '#ffb13c';
  c.beginPath();
  c.arc(bm.x, bm.y, rr, 0, Math.PI * 2);
  c.fill();
  c.globalAlpha = 0.9 * (1 - p);
  c.strokeStyle = blast[1] || '#fff3c4';
  c.lineWidth = 2;
  c.beginPath();
  c.arc(bm.x, bm.y, rr, 0, Math.PI * 2);
  c.stroke();
  c.globalAlpha = 0.8 * (1 - p);
  c.fillStyle = '#fff';
  c.beginPath();
  c.arc(bm.x, bm.y, Math.max(0.1, rr * 0.35), 0, Math.PI * 2);
  c.fill();
  c.globalAlpha = 1;
}
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
function shade(hex, k) {
  const n = parseInt(hex.slice(1), 16);
  const ch = v => Math.max(0, Math.min(255, Math.round(v * k)));
  return `rgb(${ch(n >> 16)},${ch((n >> 8) & 255)},${ch(n & 255)})`;
}
function drawChassis(c, body, hull, time, moving) {
  c.strokeStyle = '#000000';
  c.lineWidth = 1.5;
  if (body === 'hover') {
    // Air skirt with a flickering cushion under a low wedge hull.
    c.fillStyle = Math.floor(time * 12) % 2 ? 'rgba(111,195,255,0.55)' : 'rgba(111,195,255,0.3)';
    c.beginPath();
    c.ellipse(0, 1, 19, 3.5, 0, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = '#1b1d26';
    c.beginPath();
    c.roundRect(-18, -4, 36, 5, 2.5);
    c.fill();
    c.fillStyle = hull;
    c.beginPath();
    c.moveTo(-16, -4);
    c.lineTo(16, -4);
    c.lineTo(11, -14);
    c.lineTo(-11, -14);
    c.closePath();
    c.fill();
    c.stroke();
    return;
  }
  if (body === 'walker') {
    // Two jointed legs that shuffle while the walker drives.
    const step = moving ? Math.sin(time * 14) * 3 : 0;
    c.strokeStyle = '#101208';
    c.lineWidth = 3;
    for (const [hx, ph] of [[-7, 1], [7, -1]]) {
      c.beginPath();
      c.moveTo(hx, -8);
      c.lineTo(hx + 4 + step * ph, -3);
      c.lineTo(hx + step * ph, 2);
      c.stroke();
      c.fillStyle = '#101208';
      c.fillRect(hx - 3 + step * ph, 1, 7, 2.5);
    }
    c.strokeStyle = '#000000';
    c.lineWidth = 1.5;
    c.fillStyle = hull;
    c.beginPath();
    c.roundRect(-12, -17, 24, 11, 4);
    c.fill();
    c.stroke();
    return;
  }
  if (body === 'buggy') {
    // Two big spoked wheels under an open frame.
    const spin = moving ? time * 10 : 0;
    for (const wx of [-11, 11]) {
      c.fillStyle = '#101208';
      c.beginPath();
      c.arc(wx, -1, 6, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = '#5a5f48';
      c.lineWidth = 1.2;
      for (let k = 0; k < 3; k++) {
        const a = spin + k * Math.PI / 3;
        c.beginPath();
        c.moveTo(wx - Math.cos(a) * 5, -1 - Math.sin(a) * 5);
        c.lineTo(wx + Math.cos(a) * 5, -1 + Math.sin(a) * 5);
        c.stroke();
      }
    }
    c.strokeStyle = '#000000';
    c.lineWidth = 1.5;
    c.fillStyle = hull;
    c.beginPath();
    c.moveTo(-17, -6);
    c.lineTo(17, -6);
    c.lineTo(13, -13);
    c.lineTo(-9, -13);
    c.closePath();
    c.fill();
    c.stroke();
    return;
  }
  // Tank: treads with road wheels, flat black, under a rounded hull.
  c.fillStyle = '#101208';
  c.beginPath();
  c.roundRect(-18, -3, 36, 7, 3.5);
  c.fill();
  for (let i = -12; i <= 12; i += 8) {
    c.fillStyle = '#3a3f2a';
    c.beginPath();
    c.arc(i, 0.5, 2.8, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = '#000000';
    c.beginPath();
    c.arc(i, 0.5, 1.2, 0, Math.PI * 2);
    c.fill();
  }
  c.fillStyle = hull;
  c.beginPath();
  c.roundRect(-15, -15, 30, 13, 5);
  c.fill();
  c.stroke();
  c.fillStyle = shade(hull.startsWith('#') ? hull : '#d7a800', 0.64);
  c.beginPath();
  c.ellipse(-6, -9, 6, 3, 0.4, 0, Math.PI * 2);
  c.fill();
}
function drawGroundUnit(c, t, time) {
  const hull = t.isPlayer ? '#d7a800' : shade(t.color || '#c9c9c9', 0.85);
  const moving = Math.abs((t.x - (t.lastX ?? t.x))) > 0.01;
  t.lastX = t.x;
  c.save();
  c.translate(t.x, t.y);
  c.fillStyle = 'rgba(0,0,0,0.3)';
  c.beginPath();
  c.ellipse(0, 3, 20, 5, 0, 0, Math.PI * 2);
  c.fill();
  drawChassis(c, t.body || 'tank', hull, time, moving);
  // Turret on the shared pivot, barrel to the shown angle on the facing side.
  const rad = shownAngle(t) * Math.PI / 180;
  const s = facing(t);
  const bx = Math.cos(rad) * 26 * s, by = -Math.sin(rad) * 26;
  c.strokeStyle = '#1a1a00';
  c.lineWidth = 5;
  c.beginPath();
  c.moveTo(0, -12);
  c.lineTo(bx, -12 + by);
  c.stroke();
  c.fillStyle = hull;
  c.beginPath();
  c.arc(0, -12, 8, 0, Math.PI * 2);
  c.fill();
  c.strokeStyle = '#000000';
  c.lineWidth = 1.5;
  c.stroke();
  // Antenna with blinking tip, on the side away from the barrel.
  c.beginPath();
  c.moveTo(-8 * s, -16);
  c.lineTo(-12 * s, -26);
  c.stroke();
  c.fillStyle = Math.floor(time * 3) % 2 === 0 ? '#ff5a5a' : '#7a2020';
  c.beginPath();
  c.arc(-12 * s, -26, 1.8, 0, Math.PI * 2);
  c.fill();
  c.restore();
}
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
  renderUnitPicker();
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
  renderTextPicker();
  placeLogBelowMenu();
}
function chooseTextSize(key) {
  if (!TEXT_SIZES.some(t => t.key === key)) return;
  try { window.localStorage.setItem('tankity-text', key); } catch (_) { /* fine */ }
  applyTextSize(key);
  sfx.play('click');
}
function renderTextPicker() {
  const box = $('text-picker');
  if (!box || !box.replaceChildren) return;
  box.replaceChildren(...TEXT_SIZES.map(t => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'text-choice';
    b.setAttribute('aria-pressed', String(TEXT_SIZE === t.key));
    b.title = `${t.name} text`;
    const glyph = document.createElement('span');
    glyph.className = 'text-glyph';
    glyph.style.fontSize = `${0.75 + (t.scale - 0.9) * 2.5}rem`;
    glyph.textContent = 'Aa';
    const label = document.createElement('span');
    label.textContent = t.name;
    b.append(glyph, label);
    b.addEventListener('click', ev => { ev.currentTarget.blur(); chooseTextSize(t.key); });
    return b;
  }));
}
function renderUnitPicker() {
  const box = $('unit-picker');
  if (!box || !box.replaceChildren) return;
  const buttons = UNIT_BODIES.map(u => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'unit-choice';
    b.setAttribute('aria-pressed', String(G.body === u.key));
    b.title = u.name;
    const cv = document.createElement('canvas');
    cv.width = 48;
    cv.height = 34;
    const c = cv.getContext && cv.getContext('2d');
    if (c && c.translate) {
      c.translate(24, 28);
      drawChassis(c, u.key, '#d7a800', 0, false);
      c.fillStyle = '#d7a800';
      c.beginPath();
      c.arc(0, -12, 7, 0, Math.PI * 2);
      c.fill();
    }
    const label = document.createElement('span');
    label.textContent = u.name;
    b.append(cv, label);
    b.addEventListener('click', ev => { ev.currentTarget.blur(); chooseBody(u.key); });
    return b;
  });
  box.replaceChildren(...buttons);
}

/* Picture buttons: every shell and trick has a small canvas icon, shared by
   the shop rows and the HUD. Icons draw on a fixed 40x26 grid at twice the
   pixels so they stay crisp when CSS sizes them. */
const ICON_W = 40, ICON_H = 26;
function iconCtx(cv) {
  if (!cv) return null;
  cv.width = ICON_W * 2;
  cv.height = ICON_H * 2;
  const c = cv.getContext && cv.getContext('2d');
  if (!c || !c.scale) return null;
  c.scale(2, 2);
  return c;
}
/* The shell as it flies: a trail in its trail color behind a body in its
   shell color, in front of a faint blast ring sized by its radius. Beam
   shells fly flat as a bright streak; spark shells throw spokes. */
function drawShellIcon(cv, wkey) {
  const w = WEAPONS[wkey];
  const c = w && w.gfx && iconCtx(cv);
  if (!c) return;
  const g = w.gfx;
  const flat = g.painter === 'beam';
  const cx = 26, cy = 13;
  const br = 5 + Math.min(1, (w.radius || 0) / 70) * 8;
  const halo = c.createRadialGradient(cx, cy, 0, cx, cy, br);
  halo.addColorStop(0, g.blast[1]);
  halo.addColorStop(1, g.blast[0]);
  c.save();
  c.globalAlpha = 0.34;
  c.fillStyle = halo;
  c.beginPath();
  c.arc(cx, cy, br, 0, Math.PI * 2);
  c.fill();
  c.globalAlpha = 0.6;
  c.strokeStyle = g.blast[0];
  c.lineWidth = 1;
  c.stroke();
  c.restore();
  // The trail fades in toward the shell.
  const fade = c.createLinearGradient(2, 0, cx, 0);
  fade.addColorStop(0, 'rgba(0,0,0,0)');
  fade.addColorStop(1, g.trail);
  c.strokeStyle = fade;
  c.lineCap = 'round';
  c.lineWidth = flat ? 1.8 : 2.4;
  c.beginPath();
  if (flat) {
    c.moveTo(2, cy);
    c.lineTo(cx - 2, cy);
  } else {
    c.moveTo(3, 23);
    c.quadraticCurveTo(14, 1, cx - 2, cy - 2);
  }
  c.stroke();
  c.fillStyle = g.shell;
  c.strokeStyle = g.shell;
  if (flat) {
    c.save();
    c.shadowColor = g.shell;
    c.shadowBlur = 5;
    c.lineWidth = 2.6;
    c.beginPath();
    c.moveTo(cx - 8, cy);
    c.lineTo(cx + 2, cy);
    c.stroke();
    c.restore();
  } else if (w.effect === 'pellets') {
    for (const [dx, dy] of [[-3, -3], [2, -1], [-1, 3]]) {
      c.beginPath();
      c.arc(cx + dx, cy + dy, 2, 0, Math.PI * 2);
      c.fill();
    }
  } else if (w.effect === 'cluster') {
    c.beginPath();
    c.arc(cx, cy, 2.8, 0, Math.PI * 2);
    c.fill();
    for (const [dx, dy] of [[-5, -3], [4, 4]]) {
      c.beginPath();
      c.arc(cx + dx, cy + dy, 1.6, 0, Math.PI * 2);
      c.fill();
    }
  } else {
    if (g.painter === 'spark') {
      c.lineWidth = 1.2;
      for (let i = 0; i < 6; i++) {
        const a = i * Math.PI / 3 + 0.3;
        c.beginPath();
        c.moveTo(cx + Math.cos(a) * 3.5, cy + Math.sin(a) * 3.5);
        c.lineTo(cx + Math.cos(a) * 6.5, cy + Math.sin(a) * 6.5);
        c.stroke();
      }
    }
    c.beginPath();
    c.arc(cx, cy, 3.8, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = 'rgba(255,255,255,0.7)';
    c.beginPath();
    c.arc(cx - 1, cy - 1, 1, 0, Math.PI * 2);
    c.fill();
  }
}
/* A trick or supply as a simple picture of what it does. */
function drawGearIcon(cv, gkey) {
  const g = GEAR[gkey];
  const c = g && iconCtx(cv);
  if (!c) return;
  const cx = ICON_W / 2, cy = ICON_H / 2;
  c.lineCap = 'round';
  c.lineJoin = 'round';
  switch (g.effect) {
    case 'repair': // a green cross
      c.fillStyle = '#7ddf64';
      c.fillRect(cx - 3, cy - 10, 6, 20);
      c.fillRect(cx - 10, cy - 3, 20, 6);
      break;
    case 'fuel': // a jerry can with a drop on it
      c.fillStyle = '#ff9f43';
      c.fillRect(cx - 7, cy - 6, 14, 17);
      c.fillRect(cx - 7, cy - 10, 6, 4);
      c.fillStyle = '#7a4a1e';
      c.fillRect(cx + 1, cy - 9, 4, 3);
      c.fillStyle = '#fff3c4';
      c.beginPath();
      c.moveTo(cx, cy - 2);
      c.quadraticCurveTo(cx + 5, cy + 4, cx, cy + 8);
      c.quadraticCurveTo(cx - 5, cy + 4, cx, cy - 2);
      c.fill();
      break;
    case 'plate': { // layered armor with rivets
      c.fillStyle = '#7d8590';
      c.fillRect(cx - 12, cy - 8, 24, 16);
      c.fillStyle = '#aab2bd';
      c.fillRect(cx - 12, cy - 8, 24, 5);
      c.fillStyle = '#3a4226';
      for (const [dx, dy] of [[-9, -5], [9, -5], [-9, 5], [9, 5]]) {
        c.beginPath();
        c.arc(cx + dx, cy + dy, 1.2, 0, Math.PI * 2);
        c.fill();
      }
      c.fillStyle = '#ffc93c';
      c.fillRect(cx - 1.5, cy - 3, 3, 9);
      c.fillRect(cx - 4.5, cy, 9, 3);
      break;
    }
    case 'shield': // a heater shield
      c.fillStyle = '#6fc3ff';
      c.beginPath();
      c.moveTo(cx - 9, cy - 10);
      c.lineTo(cx + 9, cy - 10);
      c.lineTo(cx + 9, cy + 1);
      c.quadraticCurveTo(cx + 8, cy + 8, cx, cy + 12);
      c.quadraticCurveTo(cx - 8, cy + 8, cx - 9, cy + 1);
      c.closePath();
      c.fill();
      c.fillStyle = 'rgba(255,255,255,0.45)';
      c.fillRect(cx - 9, cy - 10, 9, 20);
      break;
    case 'extralife': // a heart
      c.fillStyle = '#ff5964';
      c.beginPath();
      c.moveTo(cx, cy + 10);
      c.bezierCurveTo(cx - 16, cy - 1, cx - 8, cy - 14, cx, cy - 5);
      c.bezierCurveTo(cx + 8, cy - 14, cx + 16, cy - 1, cx, cy + 10);
      c.fill();
      break;
    case 'jammer': // a dot sending out waves
      c.strokeStyle = '#c77dff';
      c.lineWidth = 2;
      for (const r of [5, 9, 13]) {
        c.beginPath();
        c.arc(cx - 8, cy + 6, r, -1.35, -0.2);
        c.stroke();
      }
      c.fillStyle = '#c77dff';
      c.beginPath();
      c.arc(cx - 8, cy + 6, 2.2, 0, Math.PI * 2);
      c.fill();
      break;
    case 'bunker': // a dug-in mound with a slit
      c.fillStyle = '#7a4a1e';
      c.beginPath();
      c.moveTo(cx - 15, cy + 10);
      c.quadraticCurveTo(cx, cy - 20, cx + 15, cy + 10);
      c.closePath();
      c.fill();
      c.fillStyle = '#1a1a00';
      c.fillRect(cx - 5, cy - 1, 10, 3);
      c.strokeStyle = '#00aa00';
      c.lineWidth = 1.5;
      c.beginPath();
      c.moveTo(cx - 15, cy + 10);
      c.quadraticCurveTo(cx, cy - 20, cx + 15, cy + 10);
      c.stroke();
      break;
    case 'laststand': { // a starburst
      c.fillStyle = '#ff7b39';
      c.beginPath();
      for (let i = 0; i < 16; i++) {
        const r = i % 2 ? 6 : 12;
        const a = i * Math.PI / 8;
        c.lineTo(cx + Math.cos(a) * r * 1.2, cy + Math.sin(a) * r);
      }
      c.closePath();
      c.fill();
      c.fillStyle = '#ffe27a';
      c.beginPath();
      c.arc(cx, cy, 4, 0, Math.PI * 2);
      c.fill();
      break;
    }
    default: // an unknown trick still gets a crate
      c.fillStyle = '#a8b08a';
      c.fillRect(cx - 8, cy - 8, 16, 16);
  }
}
/* The loaded weapon: the shell beside its name. Text
   stays in every chip (screen readers, and the stub DOM which has no
   replaceChildren), icons are decoration. Redraws only when the text moves. */
function setChips(el, chips) {
  const sig = chips.map(ch => ch.text + (ch.sr || '')).join(' · ');
  if (el._chipSig === sig) return;
  el._chipSig = sig;
  if (!el.replaceChildren) { el.textContent = sig; return; }
  const nodes = [];
  chips.forEach((ch, i) => {
    if (i) nodes.push(document.createTextNode(' · '));
    const span = document.createElement('span');
    span.className = 'chip';
    if (ch.w) {
      const cv = document.createElement('canvas');
      cv.className = 'chip-icon';
      cv.setAttribute('aria-hidden', 'true');
      drawShellIcon(cv, ch.w);
      span.appendChild(cv);
    }
    span.appendChild(document.createTextNode(ch.text));
    if (ch.sr) {
      const sr = document.createElement('span');
      sr.className = 'sr-only';
      sr.textContent = ch.sr;
      span.appendChild(sr);
    }
    if (ch.title) span.title = ch.title;
    nodes.push(span);
  });
  el.replaceChildren(...nodes);
}
function renderLoadout() {
  const weapon = $('hud-weapon');
  if (weapon) {
    // A dozen shells no longer fit on one line: show what is loaded plus
    // anything stocked, then the fitted tricks.
    // Only the loaded gun shows; the rest of the rack is read out for
    // screen readers and lives in the weapon picker.
    const count = w => (w === 'shell' ? '∞' : '×' + (G.ammo[w] || 0));
    const rack = WORDER.filter(w => w !== G.selected && ((G.ammo[w] || 0) > 0 || w === 'shell'))
      .map(w => `${WEAPONS[w].name} ${count(w)}`).concat(trickChips());
    setChips(weapon, [{
      w: G.selected,
      text: `${WEAPONS[G.selected].name} ${count(G.selected)}`,
      sr: rack.length ? ` · also ${rack.join(' · ')}` : '',
    }]);
  }
}
/* Whose turn the battlefield shows: the shooter of a replaying volley, else
   the tank whose turn it is. Nobody between rounds or after the match. */
function turnTank() {
  if (G.over || G.phase === 'shop' || G.phase === 'banner') return null;
  if (net.on && MATCH.volley && MATCH.volley.shooter) return MATCH.volley.shooter;
  const t = G.tanks[G.turn];
  return t && t.hp > 0 ? t : null;
}
/* A pulsing glow under the unit and a bobbing chevron over its name. */
/* A small "in a menu" card beside a player whose turn it is, so the others
   know why the battle is waiting. */
function drawMenuBadge(c, t, time, ground) {
  const x = t.x + 24, y = t.y - (ground ? 40 : 58) - 2 * Math.abs(Math.sin(time * 3));
  c.save();
  c.globalAlpha = 0.95;
  c.fillStyle = 'rgba(4, 4, 32, 0.92)';
  c.strokeStyle = '#ffff55';
  c.lineWidth = 1.2;
  c.beginPath();
  if (c.roundRect) c.roundRect(x, y - 10, 20, 15, 4); else c.rect(x, y - 10, 20, 15);
  c.fill();
  c.stroke();
  c.fillStyle = '#ffff55';
  for (let i = 0; i < 3; i++) c.fillRect(x + 5, y - 6 + i * 3.5, 10, 1.6);
  c.beginPath(); // the card's little tail toward the unit
  c.moveTo(x + 2, y + 5); c.lineTo(x - 3, y + 9); c.lineTo(x + 7, y + 5);
  c.fill();
  c.restore();
}
function drawTurnMarker(c, t, time, ground) {
  const color = t.isPlayer ? '#ffff55' : (t.color || '#ffffff');
  const pulse = 0.5 + 0.5 * Math.sin(time * 5);
  const cy = ground ? t.y + 2 : t.y - 30 + droneHover(t, time) + 6;
  c.save();
  c.globalAlpha = 0.25 + 0.35 * pulse;
  c.fillStyle = color;
  c.beginPath();
  c.ellipse(t.x, cy, 24 + 4 * pulse, 6 + pulse, 0, 0, Math.PI * 2);
  c.fill();
  c.globalAlpha = 0.9;
  c.strokeStyle = color;
  c.lineWidth = 1.5;
  c.stroke();
  const top = t.y - (ground ? 34 : 52) - 16 - 3 * Math.abs(Math.sin(time * 4));
  c.globalAlpha = 1;
  c.fillStyle = color;
  c.beginPath();
  c.moveTo(t.x - 6, top - 6);
  c.lineTo(t.x + 6, top - 6);
  c.lineTo(t.x, top);
  c.closePath();
  c.fill();
  c.strokeStyle = '#000000';
  c.lineWidth = 1;
  c.stroke();
  c.restore();
}
function droneHover(t, time) {
  return Math.sin(time * 2.2 + t.x) * 3;
}
/* Tip of a drone's slung barrel, from a body centre at (x, y). */
function droneBarrelTip(t, x, y) {
  const rad = shownAngle(t) * Math.PI / 180;
  const s = facing(t);
  return { x: x + Math.cos(rad) * 22 * s, y: y + 4 - Math.sin(rad) * 22, rad, s };
}
/* Wraith: a domed disc with chasing rim lights. Drawn about the drone's
   body centre, which the caller has translated to. */
function drawSaucer(c, t, time) {
  c.fillStyle = '#2b2e36';
  c.beginPath();
  c.ellipse(0, 1, 15, 4.5, 0, 0, Math.PI * 2);
  c.fill();
  c.strokeStyle = t.color;
  c.lineWidth = 1.5;
  c.stroke();
  c.fillStyle = 'rgba(160,240,255,0.55)';
  c.beginPath();
  c.ellipse(0, -2, 7, 5, 0, Math.PI, 0);
  c.fill();
  for (let k = 0; k < 6; k++) {
    const a = time * 3 + k * Math.PI / 3;
    if (Math.sin(a) < 0) continue; // only the near side of the rim shows
    c.fillStyle = k % 2 ? t.color : '#ffffff';
    c.beginPath();
    c.arc(Math.cos(a) * 13, 1 + Math.sin(a) * 2.5, 1.2, 0, Math.PI * 2);
    c.fill();
  }
}
function drawGunDrone(c, t, time) {
  const hover = droneHover(t, time);
  const y = t.y - 30 + hover;
  c.save();
  c.translate(t.x, y);
  c.fillStyle = 'rgba(0,0,0,0.25)';
  c.beginPath();
  c.ellipse(0, 34 - hover, 14, 4, 0, 0, Math.PI * 2);
  c.fill();
  // Aiming barrel slung below, tracking its own angle.
  const tip = droneBarrelTip(t, 0, 0);
  c.strokeStyle = '#0a0a0c';
  c.lineWidth = 4;
  c.beginPath();
  c.moveTo(0, 4);
  c.lineTo(tip.x, tip.y);
  c.stroke();
  // Each battery drone has its own frame: Wraith a saucer, Spotter a
  // tri-rotor with a big eye, everyone else the classic quad.
  if (t.id === 'wraith') {
    drawSaucer(c, t, time);
    c.restore();
    return;
  }
  const arms = t.id === 'spotter' ? [[0, -1.25], [-1.1, 0.8], [1.1, 0.8]] : [[-1, -1], [1, -1], [-1, 1], [1, 1]];
  let i = 0;
  for (const [sx, sy] of arms) {
    c.strokeStyle = '#2b2e36';
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(0, 0);
    c.lineTo(sx * 11, sy * 8);
    c.stroke();
    c.save();
    c.translate(sx * 11, sy * 8);
    c.rotate(time * 26 + i * 1.7);
    c.fillStyle = 'rgba(225,232,245,0.4)';
    c.beginPath();
    c.ellipse(0, 0, 8, 2, 0, 0, Math.PI * 2);
    c.fill();
    c.restore();
    i++;
  }
  // Armoured body with ID colour + camera eye.
  c.fillStyle = '#24242e';
  c.beginPath();
  c.roundRect(-8, -6, 16, 12, 5);
  c.fill();
  c.strokeStyle = t.color;
  c.lineWidth = 2;
  c.beginPath();
  c.roundRect(-8, -6, 16, 12, 5);
  c.stroke();
  c.fillStyle = '#ffffff';
  c.beginPath();
  c.arc(0, 0, t.id === 'spotter' ? 4 : 2.6, 0, Math.PI * 2);
  c.fill();
  if (t.id === 'spotter') {
    c.fillStyle = t.color;
    c.beginPath();
    c.arc(Math.cos(time * 1.3) * 1.5, 0, 1.8, 0, Math.PI * 2);
    c.fill();
  }
  // Blinking strobe.
  if (Math.floor(time * 2 + t.x) % 2 === 0) {
    c.fillStyle = '#ffffff';
    c.beginPath();
    c.arc(0, -8, 1.6, 0, Math.PI * 2);
    c.fill();
  }
  c.restore();
}
function render() {
  const cv = document.getElementById('stage');
  if (!cv) return;
  const c = cv.getContext('2d');
  if (!c) return;
  const time = G.time;
  c.save();
  // The backing store outgrew the 720x460 world for a bigger, crisper
  // viewport; every world unit below rides this scale, sim untouched.
  c.scale((cv.width || W) / W || 1, (cv.height || H) / H || 1);
  if (G.shake > 0 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    c.translate((Math.random() - 0.5) * 8 * G.shake, (Math.random() - 0.5) * 8 * G.shake);
  }
  // Night sky, painted well past the world edge so a pulled-back camera never
  // reveals unpainted void at the sides or in the extra headroom above.
  c.fillStyle = '#00000b';
  c.fillRect(-W - 10, -2 * H - 10, 3 * W + 20, 3 * H + 20);
  drawSky(c, time);
  // Dirt base under the extended sky, so the ground reads as one continuous
  // hillside even past the world edge.
  c.fillStyle = '#2e1a08';
  c.fillRect(-W - 10, H - 2, 3 * W + 20, 2 * H + 12);
  // Moon (a rendered sphere, phase chosen per match) + dark drifting clouds.
  drawMoon(c);
  // Slow camera: everything below rides the zoom so every tank stays seen.
  c.translate(W / 2, H / 2);
  c.scale(G.cam.z, G.cam.z);
  c.translate(-G.cam.cx, -G.cam.cy);
  c.fillStyle = '#23233f';
  for (const cl of G.clouds) {
    c.beginPath();
    c.ellipse(cl.x, cl.y, 30 * cl.s, 10 * cl.s, 0, 0, Math.PI * 2);
    c.ellipse(cl.x + 22 * cl.s, cl.y + 3, 20 * cl.s, 8 * cl.s, 0, 0, Math.PI * 2);
    c.fill();
  }
  // Far dunes.
  c.fillStyle = '#3a2408';
  c.beginPath();
  c.moveTo(-10, H);
  for (let x = -10; x <= W + 10; x += 24) {
    c.lineTo(x, 396 - 18 * Math.sin(x / 190 + 2));
  }
  c.lineTo(W + 10, H);
  c.fill();
  // Terrain with a flat green rim.
  c.fillStyle = '#7a4a1e';
  c.beginPath();
  c.moveTo(-10, H + 10);
  for (let x = -10; x <= W + 10; x += 4) {
    c.lineTo(x, x < 0 || x >= W ? H : G.terrain[x]);
  }
  c.lineTo(W + 10, H + 10);
  c.fill();
  c.strokeStyle = '#00aa00';
  c.lineWidth = 3;
  c.beginPath();
  for (let x = 0; x < W; x += 4) {
    const y = G.terrain[x];
    if (x === 0) c.moveTo(x, y);
    else c.lineTo(x, y);
  }
  c.stroke();
  // Combatants (dead ones leave a smoking wreck marker).
  for (const t of G.tanks) {
    if (t.hp <= 0) {
      c.fillStyle = 'rgba(20,20,20,0.8)';
      c.beginPath();
      c.roundRect(t.x - 12, surfY(t.x) - 8, 24, 8, 3);
      c.fill();
      c.fillStyle = 'rgba(120,120,120,0.5)';
      c.fillRect(t.x - 3, surfY(t.x) - 26, 6, 18);
      continue;
    }
    const ground = isGroundUnit(t);
    if (t === turnTank()) drawTurnMarker(c, t, time, ground);
    if (net.on && t.menu && !t.isPlayer && t === turnTank()) drawMenuBadge(c, t, time, ground);
    if (ground) drawGroundUnit(c, t, time);
    else drawGunDrone(c, t, time);
    // Health bar + name.
    const w = 40;
    const barY = t.y - (ground ? 34 : 52);
    c.fillStyle = 'rgba(0,0,0,0.55)';
    c.fillRect(t.x - w / 2, barY, w, 6);
    c.fillStyle = t.isPlayer ? '#00ff00' : t.color;
    c.fillRect(t.x - w / 2 + 1, barY + 1, (w - 2) * Math.min(1, t.hp / t.maxHp), 4);
    c.fillStyle = '#fff';
    c.font = `bold ${Math.round(9 * textScale())}px sans-serif`;
    c.textAlign = 'center';
    c.fillText(t.isPlayer ? 'TANK' : (ground ? String(t.name || t.id).toUpperCase() : t.id.toUpperCase()), t.x, barY - 4);
    c.textAlign = 'left';
  }
  // Aim arm: a stub out of the shooter's barrel showing launch direction,
  // longer with more power. Drones show theirs too, so everyone can watch
  // a shot line up. No dots, no landing marker: reading the hills, the
  // wind, and the shell's legs is the game.
  if ((G.phase === 'aim' || G.phase === 'think') && cur() && cur().hp > 0 && !G.over) {
    const t = cur();
    const len = aimArmLength(shownPower(t));
    let x0, y0, rad, ds;
    if (isGroundUnit(t)) {
      const m = muzzle(t);
      x0 = m.x; y0 = m.y;
      rad = shownAngle(t) * Math.PI / 180;
      ds = facing(t);
    } else {
      const tip = droneBarrelTip(t, t.x, t.y - 30 + droneHover(t, time));
      x0 = tip.x; y0 = tip.y; rad = tip.rad; ds = tip.s;
    }
    c.strokeStyle = t.isPlayer ? 'rgba(255,255,255,0.7)' : t.color;
    c.globalAlpha = t.isPlayer ? 1 : 0.75;
    c.lineWidth = t.isPlayer ? 3 : 2;
    c.beginPath();
    c.moveTo(x0, y0);
    c.lineTo(x0 + Math.cos(rad) * len * ds, y0 - Math.sin(rad) * len);
    c.stroke();
    c.globalAlpha = 1;
  }
  // Blast discs: each explosion draws exactly the circle its weapon destroys,
  // under the effects (trails, muzzle and blast particles), shells on top.
  for (const bm of G.booms) drawBoom(c, bm);
  if (G.fx) G.fx.draw(c);
  // Shells in flight.
  for (const s of G.shells) {
    drawShellBody(c, s.wkey, s.x, s.y, s.vx, s.vy, time);
    c.fillStyle = ((WEAPONS[s.wkey] || {}).gfx || {}).shell || '#ffe27a';
    c.beginPath();
    c.arc(s.x, s.y, s.wkey === 'nuke' ? 7 : s.wkey === 'mortar' ? 4.5 : 3.5, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = '#fff';
    c.beginPath();
    c.arc(s.x, s.y, 1.5, 0, Math.PI * 2);
    c.fill();
  }
  // Room replay: shells fly the paths the server simulated, trail and all.
  if (MATCH.volley && MATCH.volley.ft >= 0) {
    const ft = MATCH.volley.ft;
    for (const sh of MATCH.volley.shots) {
      if (sh.landed) continue;
      const [hx, hy, idx] = netShellAt(sh, ft);
      const gfx = ((WEAPONS[sh.e.w] || {}).gfx) || {};
      const hv = netShellVel(sh, idx);
      drawShellBody(c, sh.e.w, hx, hy, hv[0], hv[1], time);
      c.fillStyle = gfx.shell || '#ffe27a';
      c.beginPath();
      c.arc(hx, hy, sh.e.w === 'nuke' ? 7 : sh.e.w === 'mortar' ? 4.5 : 3.5, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = '#fff';
      c.beginPath();
      c.arc(hx, hy, 1.5, 0, Math.PI * 2);
      c.fill();
    }
  }
  c.globalAlpha = 1;
  drawWindStreaks(c, time);
  if (G.preview) drawPreview();
  // Particles.
  for (const q of G.parts) {
    c.globalAlpha = Math.max(0, Math.min(1, q.life * 1.8));
    c.fillStyle = q.color;
    c.fillRect(q.x - 2, q.y - 2, 4, 4);
  }
  c.globalAlpha = 1;
  c.restore();
  if (G.fx) G.fx.drawFlash(c, cv.width || W, cv.height || H);
  drawWindGauge(c, cv, time);
  drawTurnClock(c, cv);
}
/* ---------- the night sky ---------- */
/* Every match has its own sky, drawn from the match key (the solo seed, or
   the room code) through a generator of its own, so it never touches the
   sim's random numbers and every client of a room sees the same stars. Square
   pixel stars in sizes, brightnesses and a few tints; a faint milky band and
   a few clusters; a quiet twinkle on some (none under reduced motion); and a
   moon phase from the rendered sheet (fx/sprites/moon.png). */
const SKY_X0 = -20, SKY_W = W + 40, SKY_Y0 = -20, SKY_H = 420; // the sky rides the screen, not the camera
const SKY_TINTS = ['#ffe2b0', '#b8d0ff'];
const SKY_PHASES = [0, 0, 1, 6, 2, 5, 3, 4]; // frames of moon.png, full and gibbous favoured
let SKY = null;
function buildSky(key) {
  const r = mulberry32(hashSeed('sky:' + key));
  const stars = [];
  const add = (x, y, bright) => {
    const pick = r();
    const size = pick < 0.72 ? 1.2 : pick < 0.93 ? 2 : 3;
    const tint = r() < 0.22 ? SKY_TINTS[Math.floor(r() * 2)] : '#ffffff';
    stars.push({ x: Math.round(x), y: Math.round(y), s: size, a: Math.min(1, bright * (size > 2 ? 1.2 : 1)), c: tint, tw: r() < 0.3 ? 0.6 + r() * 2.2 : 0, ph: r() * 6.28 });
  };
  for (let i = 0; i < 130; i++) add(SKY_X0 + r() * SKY_W, SKY_Y0 + r() * SKY_H, 0.3 + r() * 0.7);
  // The milky band: a slanted strip of faint dust, with its glow drawn behind it.
  const ang = -0.5 + r() * 1.0, cx = SKY_X0 + SKY_W * (0.3 + r() * 0.4), cy = SKY_Y0 + SKY_H * (0.25 + r() * 0.35);
  for (let i = 0; i < 130; i++) {
    const along = (r() - 0.5) * 1.3 * W, across = gauss(r) * 30;
    add(cx + Math.cos(ang) * along - Math.sin(ang) * across, cy + Math.sin(ang) * along + Math.cos(ang) * across, 0.18 + r() * 0.4);
  }
  for (let k = 0; k < 3; k++) {
    const kx = SKY_X0 + r() * SKY_W, ky = SKY_Y0 + r() * SKY_H;
    for (let i = 0; i < 9; i++) add(kx + gauss(r) * 16, ky + gauss(r) * 12, 0.35 + r() * 0.6);
  }
  return { key, stars, band: { x: cx, y: cy, ang }, phase: SKY_PHASES[Math.floor(r() * SKY_PHASES.length)] };
}
function skyKey() { return net.on ? 'room:' + net.code : String(G.seed || ''); }
function drawSky(c, time) {
  const key = skyKey();
  if (!SKY || SKY.key !== key) SKY = buildSky(key);
  const calm = FX && FX.reduced;
  // The band's glow: three broad, faint ellipses along its slant.
  c.fillStyle = '#7f86d8';
  for (let i = 0; i < 3; i++) {
    c.globalAlpha = 0.03;
    c.beginPath();
    c.ellipse(SKY.band.x, SKY.band.y, 520 - i * 120, 52 - i * 12, SKY.band.ang, 0, Math.PI * 2);
    c.fill();
  }
  for (const st of SKY.stars) {
    let a = st.a;
    if (st.tw && !calm) a *= 0.72 + 0.28 * Math.sin(time * st.tw + st.ph);
    c.globalAlpha = a;
    c.fillStyle = st.c;
    c.fillRect(st.x, st.y, st.s, st.s);
    if (st.s > 2.5) { // the brightest ones get a cross glint
      c.fillRect(st.x - 2, st.y + 1, st.s + 4, 1);
      c.fillRect(st.x + 1, st.y - 2, 1, st.s + 4);
    }
  }
  c.globalAlpha = 1;
}
function drawMoon(c) {
  const mx = 600, my = 90, mr = 32;
  const sh = FX && FX.sheets.moon;
  if (!sh || !sh.ready || !SKY) {
    c.fillStyle = '#e8e8e8';
    c.beginPath();
    c.arc(mx, my, 26, 0, Math.PI * 2);
    c.fill();
    return;
  }
  FX.glow(c, mx, my, mr * 3.2, '#a8b8ff', 0.26);
  const f = SKY.phase % sh.frames;
  c.drawImage(sh.img, (f % sh.cols) * sh.fw, ((f / sh.cols) | 0) * sh.fh, sh.fw, sh.fh, mx - mr, my - mr, mr * 2, mr * 2);
}
/* Wind lives on the battlefield, not in the status bar: faint streaks
   drift across the sky at the wind's speed, and a gauge just under the menu
   strip points the way it blows, longer the stronger it is. */
const WIND_MAX = 12;
function drawWindStreaks(c, time) {
  if (!G.wind) return;
  const speed = G.wind * 9;
  c.save();
  c.strokeStyle = '#cfe3ff';
  c.lineWidth = 1;
  for (let i = 0; i < 16; i++) {
    const span = W + 160;
    const x = ((((i * 97) + time * speed) % span) + span) % span - 80;
    const y = 40 + ((i * 53) % 190);
    const len = 10 + Math.abs(G.wind) * 2.2;
    c.globalAlpha = 0.06 + 0.05 * ((i % 3) / 2);
    c.beginPath();
    c.moveTo(x, y);
    c.lineTo(x - Math.sign(G.wind) * len, y);
    c.stroke();
  }
  c.restore();
}
function windGaugeTop() {
  const bar = $('menubar'), stage = $('stage');
  if (!bar || !stage || !stage.clientHeight || !bar.getBoundingClientRect) return 10;
  const below = bar.getBoundingClientRect().bottom - stage.getBoundingClientRect().top;
  return Math.max(6, below / stage.clientHeight * H + 6);
}
function drawWindGauge(c, cv, time) {
  if (!G.tanks.length || G.phase === 'shop') return;
  c.save();
  c.scale((cv.width || W) / W || 1, (cv.height || H) / H || 1);
  const s = textScale();
  const w = 128 * s, h = 22 * s, x = W / 2 - w / 2, y = G.windTop || 10;
  c.globalAlpha = 0.85;
  c.fillStyle = 'rgba(4, 4, 32, 0.8)';
  c.strokeStyle = 'rgba(85, 85, 255, 0.55)';
  c.lineWidth = 1;
  c.beginPath();
  if (c.roundRect) c.roundRect(x, y, w, h, h / 2); else c.rect(x, y, w, h);
  c.fill();
  c.stroke();
  c.globalAlpha = 1;
  c.font = `bold ${Math.round(9 * s)}px sans-serif`;
  c.textBaseline = 'middle';
  c.fillStyle = '#aaaaaa';
  c.fillText('WIND', x + 9 * s, y + h / 2);
  const mid = x + w / 2 + 6 * s, cy = y + h / 2;
  const dir = Math.sign(G.wind);
  if (!dir) {
    c.fillStyle = '#ffffff';
    c.textAlign = 'center';
    c.fillText('calm', mid + 8 * s, cy);
  } else {
    // Arrow length tracks strength; chevrons crawl along it with the wind.
    const len = (14 + 34 * Math.min(1, Math.abs(G.wind) / WIND_MAX)) * s;
    const x0 = mid - dir * len / 2, x1 = mid + dir * len / 2;
    c.strokeStyle = '#ffff55';
    c.fillStyle = '#ffff55';
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(x0, cy);
    c.lineTo(x1, cy);
    c.stroke();
    c.beginPath();
    c.moveTo(x1 + dir * 5 * s, cy);
    c.lineTo(x1 - dir * 2 * s, cy - 5 * s);
    c.lineTo(x1 - dir * 2 * s, cy + 5 * s);
    c.closePath();
    c.fill();
    const step = 9 * s;
    const phase = ((time * Math.abs(G.wind) * 3) % step) * dir;
    c.globalAlpha = 0.55;
    for (let k = -1; k * step < len; k++) {
      const px = x0 + dir * k * step + phase;
      if ((px - x0) * dir < 0 || (x1 - px) * dir < 3 * s) continue;
      c.beginPath();
      c.moveTo(px - dir * 2.5 * s, cy - 3 * s);
      c.lineTo(px + dir * 0.5 * s, cy);
      c.lineTo(px - dir * 2.5 * s, cy + 3 * s);
      c.stroke();
    }
    c.globalAlpha = 1;
    c.fillStyle = '#ffffff';
    c.textAlign = 'right';
    c.fillText(String(Math.abs(G.wind)), x + w - 9 * s, cy);
  }
  c.textAlign = 'left';
  c.textBaseline = 'alphabetic';
  c.restore();
}
/* ---------- DOM: log, HUD ---------- */
const $ = id => document.getElementById(id);
function say(text, tone) {
  const log = $('log');
  if (!log) return;
  const li = document.createElement('li');
  if (tone) li.className = tone;
  li.textContent = text;
  log.appendChild(li);
  while (log.children.length > 80) log.removeChild(log.firstChild);
  log.scrollTop = log.scrollHeight;
  // The overlay is what scrolls in the frame; keep the newest line in view.
  const overlay = $('log-overlay');
  if (overlay) overlay.scrollTop = overlay.scrollHeight;
  refreshNavHints();
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
/* What the bar shows, plus what it leaves to the battlefield (rivals'
   armor rides over their units) as screen-reader text. */
function setStat(el, shown, sr) {
  if (!el) return;
  if (!el.replaceChildren) { el.textContent = sr ? `${shown} ${sr}` : shown; return; }
  const sig = shown + '|' + (sr || '');
  if (el._statSig === sig) return;
  el._statSig = sig;
  const nodes = [document.createTextNode(shown)];
  if (sr) {
    const s = document.createElement('span');
    s.className = 'sr-only';
    s.textContent = ` ${sr}`;
    nodes.push(s);
  }
  el.replaceChildren(...nodes);
}
function renderStanding(mine, others) {
  setStat($('hud-armor'), mine ? `${Math.max(0, Math.round(mine.hp))}` : '-',
    `${mine ? `you ${Math.max(0, Math.round(mine.hp))} · ` : ''}${others}`);
  const lives = $('hud-lives');
  if (lives) {
    lives.textContent = '♥'.repeat(Math.max(0, G.lives));
    lives.title = `${G.lives} lives`;
    lives.setAttribute('aria-label', `${G.lives} lives`);
  }
  const score = $('hud-score');
  if (score) {
    score.textContent = `$${G.cash} · round ${G.round} · ${G.score} pts`;
    score.title = `Next 1-up at ${G.nextOneUp} points`;
  }
}
function windText() {
  if (G.wind === 0) return '· 0';
  return (G.wind > 0 ? '→ ' : '← ') + Math.abs(G.wind);
}
function drawPreview() {
  const pv = G.preview;
  if (!pv || !pv.cv) return;
  const c = pv.cv.getContext('2d');
  if (!c) return;
  c.fillStyle = '#00000b';
  c.fillRect(0, 0, PV_W, PV_H);
  c.fillStyle = '#e8e8e8';
  c.beginPath();
  c.arc(320, 30, 10, 0, Math.PI * 2);
  c.fill();
  // Mini terrain with a flat green rim.
  c.fillStyle = '#7a4a1e';
  c.beginPath();
  c.moveTo(0, PV_H);
  for (let x = 0; x < PV_W; x += 4) c.lineTo(x, pv.terr[x]);
  c.lineTo(PV_W, PV_H);
  c.fill();
  c.strokeStyle = '#00aa00';
  c.lineWidth = 2;
  c.beginPath();
  for (let x = 0; x < PV_W; x += 4) {
    if (x === 0) c.moveTo(x, pv.terr[x]);
    else c.lineTo(x, pv.terr[x]);
  }
  c.stroke();
  // Demo shooter + barrel at the solved angle.
  const sy = pv.terr[pv.sx];
  c.fillStyle = '#d7a800';
  c.fillRect(pv.sx - 10, sy - 8, 20, 8);
  const rad = pv.angle * Math.PI / 180;
  c.strokeStyle = '#1a1a00';
  c.lineWidth = 3;
  c.beginPath();
  c.moveTo(pv.sx, sy - 10);
  c.lineTo(pv.sx + Math.cos(rad) * 16, sy - 10 - Math.sin(rad) * 16);
  c.stroke();
  // Demo target with hp bar.
  const ty = pv.terr[pv.tx];
  c.fillStyle = '#24242e';
  c.beginPath();
  c.arc(pv.tx, ty - 12, 7, 0, Math.PI * 2);
  c.fill();
  c.strokeStyle = '#ff0000';
  c.lineWidth = 2;
  c.beginPath();
  c.arc(pv.tx, ty - 12, 7, 0, Math.PI * 2);
  c.stroke();
  c.fillStyle = '#ffffff';
  c.beginPath();
  c.arc(pv.tx, ty - 12, 2.5, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = 'rgba(0,0,0,0.55)';
  c.fillRect(pv.tx - 15, ty - 28, 30, 4);
  c.fillStyle = '#00aa00';
  c.fillRect(pv.tx - 14, ty - 27, 28 * (pv.foeHp / PV_FOE_HP), 2);
  // Shells + debris.
  for (const bm of pv.booms) drawBoom(c, bm);
  if (pv.fx) pv.fx.draw(c);
  for (const s of pv.shells) {
    drawShellBody(c, pv.wkey, s.x, s.y, s.vx, s.vy, G.time);
    c.fillStyle = ((WEAPONS[pv.wkey] || {}).gfx || {}).shell || '#ffe27a';
    c.beginPath();
    c.arc(s.x, s.y, 3, 0, Math.PI * 2);
    c.fill();
  }
  if (pv.fx) pv.fx.drawFlash(c, PV_W, PV_H);
  // Wind readout + last-shot verdict.
  c.fillStyle = '#fff';
  c.font = 'bold 10px sans-serif';
  c.fillText(`wind → ${pv.wind}`, PV_W - 62, 14);
  if (pv.resultT > 0) {
    c.font = 'bold 12px sans-serif';
    c.fillStyle = 'rgba(8,10,6,0.85)';
    c.fillRect(30, PV_H - 26, PV_W - 60, 18);
    c.fillStyle = '#ffff00';
    c.fillText(pv.result, 38, PV_H - 13);
  }
}
function renderHUD() {
  if (net.on) { renderNetHUD(); return; }
  if (!G.tanks.length) return;
  const t = cur() || me();
  if ($('hud-turn')) {
    $('hud-turn').textContent =
      G.phase === 'shop' ? 'shop. Spend it!' :
      G.over ? 'match over' :
      G.phase === 'banner' ? 'get ready...' :
      t.isPlayer ? (G.phase === 'aim' ? 'YOU. Aim!' : 'you fired…') : `${t.id} aiming…`;
  }
  if ($('hud-angle')) $('hud-angle').textContent = `${Math.round(me().angle)}°`;
  if ($('hud-power')) $('hud-power').textContent = `${Math.round(me().power)}`;
  if ($('hud-wind')) $('hud-wind').textContent = windText();
  renderLoadout();
  renderStanding(me(), G.tanks.filter(x => !x.isPlayer).map(x => `${x.id}:${Math.max(0, x.hp)}`).join(' '));
  if ($('hud-fuel')) $('hud-fuel').textContent = `${Math.round(me().fuel)}`;
}

/* ---------- main loop ---------- */
const keysDown = {};
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
function frame(ts) {
  requestAnimationFrame(frame);
  // The music watchdog re-pins a wedged scheduler to the live clock; it never
  // tears the timer down (see audio.ts).
  music.watchdog();
  const dt = Math.min(0.05, (ts - lastT) / 1000 || 0.016);
  lastT = ts;
  // The firing range runs on its own, even over the pre-match shop.
  if (G.preview) stepPreview(dt);
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
    const swing = (keysDown.barrelLeft ? 1 : 0) - (keysDown.barrelRight ? 1 : 0);
    if (swing) t.angle = clamp(t.angle + swing * facing(t) * 42 * dt, 10, 170);
    if (keysDown.powerUp) t.power = clamp(t.power + 45 * dt, 10, 100);
    if (keysDown.powerDown) t.power = clamp(t.power - 45 * dt, 10, 100);
    if ((keysDown.driveLeft || keysDown.driveRight) && t.fuel > 0) {
      const dx = (keysDown.driveRight ? 1 : 0) - (keysDown.driveLeft ? 1 : 0);
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
  } else if (G.phase === 'think') {
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
      G.phase = 'settle';
    } else if (G.phase === 'settle' && !G.shells.length) {
      G.settleT -= dt;
      // The turn waits for every tank to finish falling into its crater.
      if (G.settleT <= 0 && !anyTankFalling()) settle();
    }
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
   drive it has not sent, the replay queue (events waiting to be played back)
   and the volley on screen, and the last snapshot it drew. */
const MATCH = {
  myTurn: false, aimDirty: false, driveAcc: 0, driveT: 0,
  queue: [], volley: null, pendingRoom: null, fastNext: false,
  lastPhase: '', lastTurn: -1, lastRound: -1, initials: '',
};
const KNOWN_FOES = ['reaper', 'wraith', 'spotter'];
const FOE_PAINT = { reaper: '#ff0000', wraith: '#00ffff', spotter: '#ff00ff' };
const SEAT_PAINT = ['#ffff00', '#00ff00', '#00ffff', '#ff00ff'];
function netValidInitials(raw) {
  const s = String(raw || '').trim();
  if (!/^[A-Za-z]{3}$/.test(s)) return null;
  if (BLOCKED_INITIALS.indexOf(s.toUpperCase()) >= 0) return null;
  return s;
}
function lobbySay(text) {
  const el = $('lobby-status');
  if (el) el.textContent = text;
}
/* The dot in the lobby and the HUD mirrors the last known reachability. */
function setNetDot(on) {
  for (const id of ['net-dot', 'hud-dot']) {
    const el = $(id);
    if (!el) continue;
    el.className = 'dot ' + (on ? 'on' : 'off');
    el.title = on ? 'room server: connected' : 'room server: not connected';
  }
  const word = $('hud-server');
  if (word) word.textContent = on ? 'online' : 'offline';
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
  const sel = $('lobby-map');
  if (!sel) return;
  const cur = sel.value;
  if (cur === '' || net.maps.some(m => m.id === cur)) sel.value = cur;
  else sel.value = net.map || '';
  renderMapPicker();
}
/* The host's hills: a Random tile plus one per named map, each a silhouette
   of that map's terrain from the server. #lobby-map is the hidden value. */
function drawMapIcon(cv, profile) {
  const c = iconCtx(cv);
  if (!c) return;
  c.fillStyle = '#00000b';
  c.fillRect(0, 0, ICON_W, ICON_H);
  const pts = Array.isArray(profile) && profile.length > 1 ? profile.map(Number) : null;
  // The generator keeps most hills in a narrow band, so each silhouette is
  // stretched to fill its tile.
  const lo = pts ? Math.min(...pts) : 0, hi = pts ? Math.max(...pts) : 1;
  const span = Math.max(0.12, hi - lo);
  const yAt = i => pts
    ? ICON_H - 5 - ((pts[i] - lo) / span) * (ICON_H - 12) - 2
    : 15 + 4 * Math.sin(i * 0.5) + 3 * Math.sin(i * 1.7);
  const n = pts ? pts.length : 24;
  c.fillStyle = '#7a4a1e';
  c.beginPath();
  c.moveTo(0, ICON_H);
  for (let i = 0; i < n; i++) c.lineTo(i * ICON_W / (n - 1), yAt(i));
  c.lineTo(ICON_W, ICON_H);
  c.closePath();
  c.fill();
  c.strokeStyle = '#00aa00';
  c.lineWidth = 1.5;
  c.lineJoin = 'round';
  c.beginPath();
  for (let i = 0; i < n; i++) {
    if (i === 0) c.moveTo(0, yAt(0));
    else c.lineTo(i * ICON_W / (n - 1), yAt(i));
  }
  c.stroke();
  if (!pts) {
    c.fillStyle = '#ffc93c';
    c.font = '800 14px sans-serif';
    c.textAlign = 'center';
    c.fillText('?', ICON_W / 2, 12);
  }
}
function renderMapPicker() {
  const box = $('lobby-map-picker');
  const sel = $('lobby-map');
  if (!box || !sel || !box.replaceChildren) return;
  const tiles = [{ id: '', name: 'Random hills' }, ...net.maps].map(m => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'unit-choice map-choice';
    b.setAttribute('aria-pressed', String((sel.value || '') === m.id));
    b.setAttribute('data-map', m.id);
    b.title = m.name;
    const cv = document.createElement('canvas');
    cv.className = 'map-icon';
    cv.setAttribute('aria-hidden', 'true');
    drawMapIcon(cv, m.id ? m.profile : null);
    const label = document.createElement('span');
    label.textContent = m.name;
    b.append(cv, label);
    b.addEventListener('click', ev => {
      ev.currentTarget.blur();
      sel.value = m.id;
      mapChosen();
    });
    return b;
  });
  box.replaceChildren(...tiles);
}
/* A pick (tile or value change): redraw the pressed tile, and a hosting
   seat in an unstarted room tells the server. The server spaces a seat's
   acts 150 ms apart, so a quick second tap waits and tries again; only the
   latest pick is ever applied. */
let mapPickSeq = 0;
async function mapChosen() {
  const mapSel = $('lobby-map');
  if (!mapSel) return;
  renderMapPicker();
  if (!net.code || net.seat !== 0 || net.on) return;
  const seq = ++mapPickSeq;
  try {
    for (let tries = 0; ; tries++) {
      try {
        const d = await net.post('map', { map: mapSel.value || '' });
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
  const el = $('lobby-count');
  const data = await net.ping();
  if (!data) {
    if (el) el.textContent = '';
    return false;
  }
  if (data.ok && data.rooms && el) {
    el.textContent = `${data.rooms.used} / ${data.rooms.max} rooms occupied`;
  }
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
  const box = $('lobby-room');
  if (box) box.hidden = !inRoom;
  for (const id of ['lobby-rows', 'lobby-intro']) {
    const el = $(id);
    if (el) el.hidden = inRoom;
  }
  refreshNavHints();
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
function netLobbyWatch() {
  net.watchLobby(
    () => { const veil = $('lobby-veil'); return !!veil && !veil.hidden; },
    room => {
      net.seats = room.seats || [];
      // Arrivals (not our own) and departures, past the cursor so the match
      // never replays them.
      const fresh = (room.events || []).filter(e => (e.seq || 0) > net.since);
      for (const e of fresh) net.since = Math.max(net.since, e.seq || 0);
      for (const e of fresh) {
        if ((e.t === 'join' && e.seat !== net.seat) || e.t === 'left') netEvent(e);
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
  const box = $('join-code');
  if (box) box.value = m[1].toUpperCase();
  openLobby();
}
function netRenderRoster(room) {
  showLobbyRoom(true);
  if ($('lobby-code')) $('lobby-code').textContent = net.code || '····';
  const link = $('join-link');
  if (link) link.value = joinLink();
  const hills = $('lobby-hills');
  if (hills) {
    if (room && room.map !== undefined) {
      net.map = room.map;
      net.mapName = room.mapName || 'Random hills';
    }
    hills.textContent = 'Hills: ' + (net.mapName || 'Random hills');
  }
  const grid = $('lobby-seats');
  if (grid && grid.replaceChildren) {
    const seats = (room && room.seats) || net.seats || [];
    const host = net.seat === 0;
    const tiles = seats.map((s, i) => {
      const human = !!s.human;
      const open = !human && s.mode === 'open';
      // The host flips a drone or open seat; every other tile is for looking.
      const flips = host && !human;
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'unit-choice seat-tile' + (open ? ' seat-open' : '') + (flips ? '' : ' seat-fixed');
      b.setAttribute('data-seat', String(i));
      b.setAttribute('data-mode', human ? 'human' : (open ? 'open' : 'ai'));
      if (!flips) b.setAttribute('aria-disabled', 'true');
      const big = document.createElement('span');
      big.className = 'seat-name';
      big.textContent = human ? String(s.name || '').toUpperCase() : (open ? 'Open' : 'AI');
      const cap = document.createElement('span');
      cap.className = 'seat-cap';
      if (human) cap.textContent = (i === net.seat ? 'You' : 'Player') + (i === 0 ? ' · host' : '');
      else if (flips) cap.textContent = open ? 'Tap for AI' : 'Tap for Open';
      else cap.textContent = open ? 'Nobody' : 'Drone';
      b.append(big, cap);
      b.title = human ? 'Seat ' + (i + 1) : (open ? 'Open seat: no tank' : 'Drone battery seat');
      if (flips) {
        b.addEventListener('click', ev => {
          ev.currentTarget.blur();
          netSeatMode(i, open ? 'ai' : 'open');
        });
      }
      return b;
    });
    grid.replaceChildren(...tiles);
  }
  const seatsHint = $('seats-hint');
  if (seatsHint) {
    seatsHint.textContent = net.seat === 0
      ? 'Tap a seat nobody holds to switch it between AI and Open. Open seats field no tank.'
      : 'The host decides which empty seats are AI and which stay open.';
  }
  const start = $('lobby-start');
  if (start) start.style.display = net.seat === 0 ? '' : 'none';
  lobbySay(net.seat === 0 ? 'You host. Start when your crew is in.' : 'Hang tight. The host starts the match.');
  refreshNavHints();
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
  net.beginMatch(); // on, a fresh event cursor, the lobby poll off and the match poll on
  MATCH.lastPhase = '';
  MATCH.lastRound = -1;
  MATCH.queue = []; MATCH.volley = null; MATCH.pendingRoom = null;
  MATCH.aimDirty = false;
  G.over = false;
  const sf = $('score-form');
  if (sf) sf.style.display = 'none';
  const veil = $('lobby-veil');
  if (veil) veil.hidden = true;
  net.apply(room);
  say(`Room ${net.code}: you are ${seatName(net.seat)}. The battery flies the AI seats.`, 'info');
  syncLeaveButtons();
}
/* Leaving a running match: Leave room buttons (menu, shop) only show inside a
   room, and ask first in the page, never with a browser dialog. */
function syncLeaveButtons() {
  for (const id of ['menu-leave', 'shop-leave']) {
    const b = $(id);
    if (b) b.hidden = !net.on;
  }
}
function openLeaveVeil() {
  if (!net.on) return;
  const veil = $('leave-veil');
  if (!veil) return;
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
  const rematch = $('rematch');
  if (rematch) rematch.hidden = true;
  MATCH.queue = []; MATCH.volley = null; MATCH.pendingRoom = null; MATCH.myTurn = false; MATCH.lastPhase = ''; MATCH.lastTurn = -1; MATCH.lastRound = -1;
  const againBtn = $('again');
  if (againBtn) againBtn.textContent = 'Play again (N)';
  const sf = $('score-form');
  if (sf) sf.style.display = '';
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
  const sel = $('lobby-map');
  if (sel && map) { sel.value = map; renderMapPicker(); }
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
    netAdopt(room);
    for (const e of fresh) if (e.t !== 'shot' && e.t !== 'burst') netEvent(e);
    return;
  }
  MATCH.queue.push(...fresh);
  if (shouldCatchUp(document.hidden, MATCH.queue)) netCatchUp();
  if (MATCH.queue.length || MATCH.volley) {
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
  const rs = $('run-stats');
  if (rs) rs.textContent = `Room ${net.code} · you are ${seatName(net.seat)} · round ${G.round}`;
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
    sfx.play('win');
    say(`Round ${e.round} cleared. Winnings paid. Spend them.`, 'good');
    return;
  }
  if (e.t === 'eliminated') {
    if (e.seat === net.seat) {
      sfx.play('lose');
      say('The battery got you for good this time. Filing your report.', 'bad');
    } else say(`${seatName(e.seat)} is out of lives.`, 'info');
    return;
  }
  if (e.t === 'join') { say(`${seatName(e.seat)} rolled into the room.`, 'info'); return; }
  if (e.t === 'left') { say(`${seatName(e.seat)} left; the battery takes that seat.`, 'info'); return; }
  if (e.t === 'round') {
    say(`Round ${e.round}. Fresh barrels, same battery. Wind ${windText()}.`, 'info');
    talk('tank', 'Back in! These hills are mine!', true);
    return;
  }
  if (e.t === 'auto') { say(`${seatName(e.seat)} sat quiet, so the crew fired for them.`, 'info'); return; }
}
/* ---------- room replay ---------- */
const PATH_HZ = 12; // rooms.php records a path point every 5 sim steps at 60/s
function netParsePath(str) {
  return String(str || '').split(' ').filter(Boolean).map(p => p.split(',').map(Number));
}
function netStartVolley() {
  const fast = !!MATCH.fastNext;
  MATCH.fastNext = false;
  const opener = MATCH.queue.shift();
  const events = [];
  while (MATCH.queue.length && !VOLLEY_OPENERS.has(MATCH.queue[0].t)) events.push(MATCH.queue.shift());
  const shooter = G.tanks.find(t => t.seat === opener.seat);
  const a1 = opener.a ?? (shooter ? shooter.angle : 62);
  const p1 = opener.pw ?? (shooter ? shooter.power : 55);
  const x1 = opener.x ?? (shooter ? shooter.x : 0);
  const swing = shooter ? Math.max(Math.abs(a1 - shooter.angle), Math.abs(p1 - shooter.power), Math.abs(x1 - shooter.x)) : 0;
  MATCH.volley = {
    fast,
    opener, events, shooter, tau: 0,
    a0: shooter ? shooter.angle : a1, p0: shooter ? shooter.power : p1, x0: shooter ? shooter.x : x1, a1, p1, x1,
    aimDur: swing < 1 ? 0.15 : clamp(0.45 + swing / 110, 0.5, 1.4),
    shots: [], end: Math.max(0, ...events.map(e => e.t1 ?? e.at ?? 0)) + 0.6,
  };
  netEvent(opener);
}
function netBlast(x, y, r, wkey) {
  sfx.play('boom');
  const kick = fxImpact(G.fx, wkey, x, y, r);
  G.shake = Math.min(1, G.shake + (kick !== undefined ? kick : wkey === 'nuke' ? 0.9 : r > 40 ? 0.5 : 0.3));
  G.booms.push({ x, y, r, wkey, t: 0, life: wkey === 'nuke' ? 0.8 : 0.5 });
  carveCrater(G.terrain, x, y, r, H - 4);
}
/* A replayed shell's velocity at path index i (points are 1/PATH_HZ s apart). */
function netShellVel(s, i) {
  const pts = s.pts, a = pts[Math.min(i, pts.length - 1)], b = pts[Math.min(i + 1, pts.length - 1)];
  if (!a || !b) return [0, 0];
  return [(b[0] - a[0]) * PATH_HZ, (b[1] - a[1]) * PATH_HZ];
}
function netStepVolley(dt) {
  const v = MATCH.volley;
  // A volley kept back from a catch-up plays at triple speed.
  v.tau += dt * (v.fast ? 3 : 1);
  const sh = v.shooter;
  if (sh) {
    const u = Math.min(1, v.tau / v.aimDur);
    const e = u * u * (3 - 2 * u);
    sh.angle = v.a0 + (v.a1 - v.a0) * e;
    sh.power = v.p0 + (v.p1 - v.p0) * e;
    sh.x = v.x0 + (v.x1 - v.x0) * e;
    sh.showA = sh.angle;
    sh.showP = sh.power;
  }
  const ft = v.tau - v.aimDur;
  v.ft = ft;
  if (ft < 0) return;
  for (const e of v.events) {
    if (e.done || e.at === undefined || ft < e.at) continue;
    e.done = true;
    if (e.t === 'shot') {
      const sh = { e, pts: netParsePath(e.p), landed: false, fx: null };
      v.shots.push(sh);
      sfx.play('launch');
      // Bomblets leave the bloom point; every other shot leaves the barrel.
      if (e.t0 < 0.01 && sh.pts.length > 1) {
        const hv = netShellVel(sh, 0);
        fxMuzzle(G.fx, e.w, sh.pts[0][0], sh.pts[0][1], Math.atan2(hv[1], hv[0]));
      }
    } else if (e.t === 'burst') {
      netBlast(e.x, e.y, e.r, e.w);
      // A burst from a lance is the bolt passing through a tank.
      const pass = (WEAPONS[e.w] || {}).effect === 'pierce' && v.shots.find(sh => sh.e.w === e.w);
      if (pass) {
        const hv = netShellVel(pass, netShellAt(pass, ft)[2]);
        fxSpecial(G.fx, e.w, 'pierce', e.x, e.y, Math.atan2(hv[1], hv[0]));
      }
    } else {
      if (e.t === 'hit') {
        const t = G.tanks.find(x => x.seat === e.seat);
        if (t) t.hp = Math.max(0, t.hp - e.dmg);
        // Over a fried tank, the EMP's arcs.
        const emp = t && v.shots.find(sh => (WEAPONS[sh.e.w] || {}).effect === 'emp');
        if (emp) fxSpecial(G.fx, emp.e.w, 'arc', t.x, t.y - 12, 0);
      } else if (e.t === 'kill') {
        const t = G.tanks.find(x => x.seat === e.seat);
        if (t) t.hp = 0;
      }
      netEvent(e);
    }
  }
  for (const s of v.shots) {
    if (s.landed) continue;
    if (ft < s.e.t1) {
      // In flight: the trail drips along the path the server flew.
      const at = netShellAt(s, ft), hv = netShellVel(s, at[2]);
      fxTrail(G.fx, s, dt, at[0], at[1], hv[0], hv[1], s.e.w);
      continue;
    }
    s.landed = true;
    if (s.e.r > 0) netBlast(s.e.x1, s.e.y1, s.e.r, s.e.w);
    else if (s.e.split) {
      const hv = netShellVel(s, s.pts.length - 2);
      fxSpecial(G.fx, s.e.w, 'split', s.e.x1, s.e.y1, Math.atan2(hv[1], hv[0]));
    }
  }
  if (ft >= v.end && v.events.every(e => e.done || e.at === undefined) && v.shots.every(s => s.landed)) {
    for (const e of v.events) if (!e.done) netEvent(e);
    MATCH.volley = null;
  }
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
function drawTurnClock(c, cv) {
  const left = net.turnClockLeft();
  if (left === null || left > CLOCK_SHOW_S || left <= 0) return;
  const n = Math.ceil(left);
  const frac = left - Math.floor(left); // pulses once a second
  c.save();
  c.scale((cv.width || W) / W || 1, (cv.height || H) / H || 1);
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.globalAlpha = 0.25 + 0.6 * frac;
  c.fillStyle = n <= 3 ? '#ff5a5a' : '#ffff55';
  c.font = `bold ${Math.round(72 * textScale())}px sans-serif`;
  c.fillText(String(n), W / 2, H * 0.42);
  c.globalAlpha = 0.9;
  c.font = `bold ${Math.round(12 * textScale())}px sans-serif`;
  c.fillStyle = '#ffffff';
  c.fillText(MATCH.myTurn ? 'Fire now, or the crew fires for you' : 'The crew fires if the clock runs out', W / 2, H * 0.42 + 46 * textScale());
  c.restore();
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
  const plan = planCatchUp(MATCH.queue, !!MATCH.volley, MATCH.pendingRoom, net.seat);
  if (!plan) return;
  MATCH.volley = null;
  G.shells = [];
  for (const e of MATCH.queue.slice(0, plan.cut)) netEvent(e);
  MATCH.queue = MATCH.queue.slice(plan.cut);
  MATCH.fastNext = plan.fastNext;
}
if (typeof document.addEventListener === 'function') {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) return;
    clearTurnAlert();
    if (net.on) netCatchUp();
  });
}
/* Drive the replay; once nothing is left to play, the waiting room state
   takes over. */
function netReplay(dt) {
  if (MATCH.volley) netStepVolley(dt);
  while (!MATCH.volley && MATCH.queue.length) {
    if (VOLLEY_OPENERS.has(MATCH.queue[0].t)) netStartVolley();
    else netEvent(MATCH.queue.shift());
  }
  if (!MATCH.volley && !MATCH.queue.length && MATCH.pendingRoom) {
    const room = MATCH.pendingRoom;
    MATCH.pendingRoom = null;
    netAdopt(room);
  }
}
/* Where a replayed shell is at flight time ft: path points are 1/12 s apart. */
function netShellAt(s, ft) {
  const k = (ft - s.e.t0) * PATH_HZ;
  const pts = s.pts;
  if (!pts.length) return [s.e.x1, s.e.y1, 0];
  const i = Math.max(0, Math.min(pts.length - 1, Math.floor(k)));
  const j = Math.min(pts.length - 1, i + 1);
  const f = Math.max(0, Math.min(1, k - i));
  return [pts[i][0] + (pts[j][0] - pts[i][0]) * f, pts[i][1] + (pts[j][1] - pts[i][1]) * f, i];
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
    const swing = (keysDown.barrelLeft ? 1 : 0) - (keysDown.barrelRight ? 1 : 0);
    if (swing) { t.angle = clamp(t.angle + swing * facing(t) * 42 * dt, 10, 170); MATCH.aimDirty = true; }
    if (keysDown.powerUp) { t.power = clamp(t.power + 45 * dt, 10, 100); MATCH.aimDirty = true; }
    if (keysDown.powerDown) { t.power = clamp(t.power - 45 * dt, 10, 100); MATCH.aimDirty = true; }
    if (!keysDown.barrelLeft && !keysDown.barrelRight && !keysDown.powerUp && !keysDown.powerDown && MATCH.aimDirty) netSendAim();
    if ((keysDown.driveLeft || keysDown.driveRight) && t.fuel > 0) {
      const dir = (keysDown.driveRight ? 1 : 0) - (keysDown.driveLeft ? 1 : 0);
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
  if ($('hud-turn')) {
    $('hud-turn').textContent =
      G.phase === 'shop' ? 'shop. Spend it!' :
      G.over ? 'match over' :
      !mine || mine.hp <= 0 ? 'wrecked. Watching ' + seatName(turnTank.seat) + '...' :
      MATCH.myTurn ? 'YOU. Aim!' : `${seatName(turnTank.seat)} aiming...`;
  }
  if ($('hud-angle')) $('hud-angle').textContent = mine ? `${Math.round(mine.angle)}°` : '-';
  if ($('hud-power')) $('hud-power').textContent = mine ? `${Math.round(mine.power)}` : '-';
  if ($('hud-wind')) $('hud-wind').textContent = windText();
  renderLoadout();
  renderStanding(mine, G.tanks.filter(x => !x.isPlayer).map(x => `${seatName(x.seat)}:${Math.max(0, Math.round(x.hp))}`).join(' '));
  if ($('hud-fuel')) $('hud-fuel').textContent = mine ? `${Math.round(mine.fuel)}` : '-';
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
  const kicker = $('end-kicker');
  if (kicker) kicker.textContent = `Room ${net.code} · final standings`;
  const title = $('end-title');
  if (title) title.textContent = champ && champ.mine ? 'Top gun! The hills are yours.' : (champ ? `${champ.name} holds the hills.` : 'Match over.');
  const text = $('end-text');
  if (text) text.textContent = `The battery never quits, and neither do you. Room ${net.code} ended on round ${room.round || '?'}.`;
  const score = $('end-score');
  if (score) {
    score.textContent = rows.map(r => `${r.name} ${r.score}${r.mine ? ' (you)' : ''}`).join(' · ') +
      (room.you ? ` · you banked $${room.you.cash || 0}` : '');
  }
  const again = $('again');
  if (again) again.textContent = 'Back to rooms';
  const ef = $('end-score-form'); // room standings are not high-score runs
  if (ef) ef.hidden = true;
  const rematch = $('rematch');
  if (rematch) {
    rematch.hidden = false;
    rematch.textContent = net.map
      ? `Rematch on ${net.mapName || 'these hills'}`
      : 'Rematch on random hills';
  }
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
async function loadScores() {
  const list = $('scores');
  const note = $('scores-note');
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
  if (list) {
    list.innerHTML = '';
    if (!rows.length) {
      const li = document.createElement('li');
      li.textContent = 'No after-action reports filed yet. Be the first legend.';
      list.appendChild(li);
    }
    for (const r of rows.slice(0, 10)) {
      const li = document.createElement('li');
      li.textContent = `${r.name}: ${r.best} pts (${r.banked} rounds won${r.won ? ', champion' : ''})`;
      list.appendChild(li);
    }
  }
  if (note) note.textContent = `Showing reports from ${src}.`;
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
/* Every binding lives in game.yaml's keys section (served as game.json);
// this frozen copy, shaped like game.json's keys section, keeps the exact same
// defaults working when the file cannot load. Actions are named by effect,
// and each lists its accepted tokens in label order (first one shows). */
const FALLBACK_KEYS = Object.freeze({
  aim: Object.freeze({
    barrelLeft: ['ArrowLeft', 'Left'],
    barrelRight: ['ArrowRight', 'Right'],
    powerUp: ['ArrowUp', 'KeyW', 'Up', 'w'],
    powerDown: ['ArrowDown', 'KeyS', 'Down', 's'],
    driveLeft: ['KeyA', 'a'],
    driveRight: ['KeyD', 'd'],
  }),
  shop: Object.freeze({
    selUp: ['ArrowUp', 'Up'],
    selDown: ['ArrowDown', 'Down'],
    qtyUp: ['ArrowRight', 'Right'],
    qtyDown: ['ArrowLeft', 'Left'],
    buyRow: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
    buy: ['b', 'Enter'],
    preview: ['v', 'p'],
    close: ['Escape'],
    next: ['n'],
  }),
  global: Object.freeze({
    music: ['m'], sound: ['e'], log: ['l'], help: ['h'],
    report: ['r'], menu: ['c'], random: ['t'], rooms: ['o'], new: ['n'],
    cycle: ['q'], guns: ['g'], nextTrack: ['BracketRight', ']'], tutorial: ['u'],
    battlePreview: ['v'], fullscreen: ['f'],
    fire: ['ControlLeft', 'ControlRight', 'Control', 'Space', ' '],
    escape: ['Escape'],
  }),
  scroll: Object.freeze({
    lineDown: ['j'], lineUp: ['k'],
    pageDown: ['PageDown'], pageUp: ['PageUp'], halfDown: ['Shift+KeyJ'], halfUp: ['Shift+KeyK'],
  }),
});
let KEYS = FALLBACK_KEYS;
let KEYMAP = buildKeymap(FALLBACK_KEYS);
function buildKeymap(def) {
  const rev = {};
  for (const ctx of Object.keys(def)) {
    rev[ctx] = {};
    for (const [action, tokens] of Object.entries(def[ctx])) {
      for (const t of tokens) rev[ctx][t] = action;
    }
  }
  return rev;
}
function applyKeys(def) {
  if (!def || !def.aim || !def.shop || !def.global || !def.scroll) return;
  KEYS = def;
  KEYMAP = buildKeymap(def);
  renderKeyHints();
  renderTutorialText();
}
/* One token in, one printable cap out: arrows show as glyphs, codes shed
// their Key/Digit prefix, lone letters go uppercase, chords join with +. */
function keycap(token) {
  const glyph = { ArrowUp: '▲', ArrowDown: '▼', ArrowLeft: '◀', ArrowRight: '▶', Up: '▲', Down: '▼', Left: '◀', Right: '▶' };
  if (glyph[token]) return glyph[token];
  if (token === ' ') return 'Space';
  if (/^Ctrl\+/.test(token)) return 'Ctrl+' + keycap(token.slice(5));
  if (/^Shift\+/.test(token)) return 'Shift+' + keycap(token.slice(6));
  if (/^(ControlLeft|ControlRight|Control)$/.test(token)) return 'Ctrl';
  if (token === 'Escape') return 'ESC';
  if (token === 'Enter') return 'Enter';
  if (token === 'PageUp') return 'PgUp';
  if (token === 'PageDown') return 'PgDn';
  if (token === 'Shift') return 'Shift';
  if (token === 'BracketRight') return ']';
  if (token === 'BracketLeft') return '[';
  const code = /^(Key|Digit)(.+)$/.exec(token);
  if (code) return code[2].toUpperCase();
  return String(token).toUpperCase();
}
/* Phones and tablets: a touch screen with no mouse or trackpad. They get no
// keyboard at all, so key bindings stay off and no label names a key. */
const TOUCH = typeof window.matchMedia === 'function' &&
  window.matchMedia('(pointer: coarse)').matches && !window.matchMedia('(any-pointer: fine)').matches;
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
  const tokens = (KEYS[ctx] && KEYS[ctx][action]) || [];
  const t = tokens[idx || 0];
  return t === undefined ? '' : keycap(t);
}
/* Fill every [data-keyhint] span at boot and again if game.json loads late,
// so labels can never drift from behavior. */
function renderKeyHints() {
  document.querySelectorAll('[data-keyhint]').forEach(el => {
    const parts = (el.getAttribute('data-keyhint') || '').split(':');
    const cap = parts.length >= 2 ? keyHint(parts[0], parts[1], +(parts[2] || 0)) : '';
    const bare = el.className === 'key';
    el.textContent = cap ? (bare ? `(${cap})` : cap) : '';
  });
}
function lookupKey(ctx, e) {
  const m = KEYMAP[ctx];
  if (!m) return null;
  // Modifier tokens (Ctrl+X, Shift+X) win while that modifier is held.
  for (const [held, mod] of [[e.ctrlKey, 'Ctrl+'], [e.shiftKey, 'Shift+']]) {
    if (!held) continue;
    const c = (e.code && m[mod + e.code]) || (e.key && (m[mod + e.key] || m[mod + e.key.toLowerCase()]));
    if (c) return c;
  }
  if (e.code && m[e.code]) return m[e.code];
  if (e.key && (m[e.key] || m[e.key.toLowerCase()])) return m[e.key] || m[e.key.toLowerCase()];
  return null;
}
function freshMatchFromSeedBox(opts) {
  // A new match takes the whole frame: shut any panels so the menu never
  // sits over the briefing and the shop never opens underneath it.
  closeOverlays();
  endTutorial(true);
  if (opts && opts.tut && !tutorialSeen()) TUT_ARMED = true;
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
function bindKeys() {
  if (TOUCH) return;
  window.addEventListener('keydown', e => {
    // Typing in a box is typing, not playing: initials and seeds keep every key.
    const tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    // The leave question holds every key but ESC (which answers "stay").
    const leaveAsk = $('leave-veil');
    if (leaveAsk && !leaveAsk.hidden) {
      if (lookupKey('global', e) === 'escape') { e.preventDefault(); closeLeaveVeil(); }
      return;
    }
    // Overlay scrolling runs before every other binding so an open panel keeps
    // its keys even where letters already work (shop buys, driving). With no
    // panel open the keys fall through untouched. Arrows are never scroll keys:
    // they keep their aim and shop jobs.
    const sc = lookupKey('scroll', e);
    // In the shop the line keys walk the rows, like the arrows; paging
    // still scrolls.
    if ((sc === 'lineDown' || sc === 'lineUp') && G.phase === 'shop' && !G.over && !G.preview && !shopCovered()) {
      e.preventDefault();
      G.shopSel = clamp(G.shopSel + (sc === 'lineUp' ? -1 : 1), 0, SHOP.length - 1);
      sfx.play('click');
      renderShop();
      return;
    }
    if (gunsOpen()) {
      const move = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -GUN_COLS, ArrowDown: GUN_COLS }[e.key] ||
        (sc === 'lineDown' ? 1 : sc === 'lineUp' ? -1 : 0);
      if (move) { e.preventDefault(); moveGunCursor(move); return; }
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (!e.repeat) pickGun(rackGuns()[gunCursor]); return; }
      if (/^[1-9]$/.test(e.key)) { e.preventDefault(); const w = rackGuns()[+e.key - 1]; if (w) pickGun(w); return; }
    }
    if (sc) {
      const args = { lineDown: [1, 0], lineUp: [-1, 0], pageDown: [0, 1], pageUp: [0, -1], halfDown: [0, 0.5], halfUp: [0, -0.5] }[sc];
      if (args && scrollOverlay(args[0], args[1])) { e.preventDefault(); return; }
    }
    // The shop answers to its own keys from game.json; everything else falls
    // through to the usual keys below. Qty keys pick how many packs ride on
    // every buy, capped at what the chest can cover for that row.
    if (G.phase === 'shop' && !G.over && !e.repeat) {
      const sa = lookupKey('shop', e);
      if (sa === 'selUp' || sa === 'selDown') {
        e.preventDefault();
        G.shopSel = clamp(G.shopSel + (sa === 'selUp' ? -1 : 1), 0, SHOP.length - 1);
        sfx.play('click');
        renderShop();
        return;
      }
      if (sa === 'qtyUp' || sa === 'qtyDown') {
        e.preventDefault();
        const it = SHOP[G.shopSel];
        if (sa === 'qtyUp') {
          const max = Math.max(1, maxPacks(it));
          if (G.shopQty < max) { G.shopQty++; sfx.play('click'); }
          else sfx.play('thud');
        } else if (G.shopQty > 1) {
          G.shopQty--;
          sfx.play('click');
        }
        renderShop();
        return;
      }
      // Digits buy rows 1-9 outright; longer shelves still answer to arrows.
      if (sa === 'buyRow') {
        const row = e.key >= '1' && e.key <= '9' && +e.key <= SHOP.length ? SHOP[+e.key - 1] : null;
        if (row) { e.preventDefault(); buyItem(row, G.shopQty); return; }
      }
      if (sa === 'buy') {
        e.preventDefault();
        buyItem(SHOP[G.shopSel], G.shopQty);
        return;
      }
      if (sa === 'preview') {
        const it = SHOP[G.shopSel];
        if (it && it.kind === 'ammo') { e.preventDefault(); openPreview(it.w); }
        return;
      }
      // ESC in the shop shuts the firing range first, then any open panel
      // (the menu can sit above the shop), and only rolls out to the round
      // when nothing is left to shut. N is the plain way out.
      if (sa === 'close') {
        e.preventDefault();
        if (G.preview) closePreview();
        else if (closeLeaveVeil()) { /* the question closed */ }
        else if (!closeOverlays()) { if (net.on) netNext(true); else nextRound(); } // ESC readies, never unreadies
        return;
      }
    }
    if (lookupKey('global', e) === 'escape') {
      e.preventDefault();
      if (G.preview) { closePreview(); return; }
      if (closeLeaveVeil()) return;
      if (TUT) { skipTutorial(); return; }
      if (closeLobbyVeil()) return;
      closeOverlays();
      return;
    }
    const act = lookupKey('aim', e);
    if (act) {
      keysDown[act] = true;
      e.preventDefault();
      unlock(); music.start();
      return;
    }
    // Fire stays a special tap with its own repeat guard, but its keys come
    // from the same file as everything else.
    if (lookupKey('global', e) === 'fire') {
      e.preventDefault();
      if (!e.repeat) { unlock(); music.start(); playerFire(); }
      return;
    }
    if (e.repeat) return;
    const k = e.key || '';
    const ga = lookupKey('global', e);
    switch (ga) {
    case 'music': toggleMusic(); return;
    case 'nextTrack': unlock(); music.next(); return;
    case 'sound': toggleSound(); return;
    case 'log': toggleOverlay('log-overlay', 'btn-log'); return;
    case 'help': toggleOverlay('help-overlay', 'btn-help'); return;
    case 'report': toggleOverlay('report-overlay', 'scores-open'); return;
    case 'menu': {
      // C opens the menu; ESC does the closing.
      const mv = $('menu-overlay');
      if (mv && mv.hidden) toggleOverlay('menu-overlay', 'btn-menu');
      return;
    }
    // Random hills and the rooms lobby stay out of the shop so a buying
    // spree never misfires into a new match.
    case 'random': if (G.phase !== 'shop') randomRun(); return;
    case 'rooms': if (G.phase !== 'shop') openRooms(); return;
    case 'new':
      if (G.phase === 'shop') nextRound();
      else freshMatchFromSeedBox();
      return;
    case 'cycle': cycleWeapon(); if (gunsOpen()) renderGuns(); return;
    case 'guns': if (gunsOpen()) closeGuns(); else openGuns(); return;
    case 'tutorial': tutorialOpen(); return;
    case 'battlePreview': togglePreview(); return;
    case 'fullscreen': toggleFullscreen(); return;
    default: return;
    }
  });
  window.addEventListener('keyup', e => {
    const tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    const act = lookupKey('aim', e);
    if (act) delete keysDown[act];
  });
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
function renderGuns() {
  const grid = $('gun-grid');
  if (!grid || !grid.replaceChildren) return;
  const guns = rackGuns();
  gunCursor = clamp(gunCursor, 0, guns.length - 1);
  grid.replaceChildren(...guns.map((w, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'unit-choice gun-choice' + (i === gunCursor ? ' cursor' : '');
    b.setAttribute('aria-pressed', String(w === G.selected));
    b.title = WEAPONS[w].note || WEAPONS[w].name;
    const cv = document.createElement('canvas');
    cv.setAttribute('aria-hidden', 'true');
    drawShellIcon(cv, w);
    const name = document.createElement('span');
    name.textContent = `${i < 9 ? `${i + 1}. ` : ''}${WEAPONS[w].name}`;
    const count = document.createElement('span');
    count.className = 'gun-count';
    count.textContent = w === 'shell' ? '∞' : `×${G.ammo[w] || 0}`;
    b.append(cv, name, count);
    b.addEventListener('click', ev => { ev.currentTarget.blur(); pickGun(w); });
    return b;
  }));
  const cur = grid.querySelector('.cursor');
  if (cur && cur.scrollIntoView) cur.scrollIntoView({ block: 'nearest' });
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
function holdButton(id, act) {
  const btn = $(id);
  if (!btn) return;
  const on = ev => { ev.preventDefault(); keysDown[act] = true; unlock(); music.start(); };
  const off = () => { delete keysDown[act]; };
  btn.addEventListener('pointerdown', on);
  btn.addEventListener('pointerup', off);
  btn.addEventListener('pointerleave', off);
  btn.addEventListener('click', ev => ev.currentTarget.blur());
}
function init() {
  if (TOUCH) document.documentElement.classList.add('touch');
  bindKeys();
  bindToolTips();
  loadGameConfig();
  G.body = loadBody();
  renderUnitPicker();
  loadTextSize();
  renderKeyHints();
  startDemo();
  loadScores();
  // Light the connection dot from the start, not only when the lobby opens.
  loadOccupancy();
  maybeApplyInviteCode();

  document.querySelectorAll('[data-aim]').forEach(btn => {
    const act = { up: 'powerUp', down: 'powerDown', left: 'barrelLeft', right: 'barrelRight' }[btn.getAttribute('data-aim')];
    const on = ev => { ev.preventDefault(); keysDown[act] = true; unlock(); music.start(); };
    const off = () => { delete keysDown[act]; };
    btn.addEventListener('pointerdown', on);
    btn.addEventListener('pointerup', off);
    btn.addEventListener('pointerleave', off);
    btn.addEventListener('click', ev => ev.currentTarget.blur());
  });
  const cannon = $('btn-cannon');
  if (cannon) cannon.addEventListener('click', ev => { ev.currentTarget.blur(); unlock(); music.start(); playerFire(); });
  const track = $('btn-track');
  if (track) track.addEventListener('click', ev => { ev.currentTarget.blur(); unlock(); music.next(); });
  const weapon = $('btn-weapon');
  if (weapon) weapon.addEventListener('click', ev => { ev.currentTarget.blur(); if (gunsOpen()) closeGuns(); else openGuns(); });
  const gunClose = $('gun-close');
  if (gunClose) gunClose.addEventListener('click', ev => { ev.currentTarget.blur(); closeGuns(); });
  const hudGun = $('hud-weapon');
  if (hudGun) {
    hudGun.addEventListener('click', () => openGuns());
    hudGun.title = 'Pick a weapon';
  }
  holdButton('btn-drive-l', 'driveLeft');
  holdButton('btn-drive-r', 'driveRight');
  const form = $('seed-form');
  if (form) form.addEventListener('submit', e => {
    e.preventDefault();
    if (net.on) { netLeave(); return; }
    sfx.play('click');
    freshMatchFromSeedBox();
  });
  const rnd = $('random-run');
  if (rnd) rnd.addEventListener('click', ev => {
    ev.currentTarget.blur();
    randomRun();
  });
  const newGame = $('new-game');
  if (newGame) newGame.addEventListener('click', ev => {
    ev.currentTarget.blur();
    unlock(); sfx.play('click');
    freshMatchFromSeedBox();
  });
  const soundBtn = $('btn-sound');
  if (soundBtn) soundBtn.addEventListener('click', ev => { ev.currentTarget.blur(); toggleSound(); });
  const musicBtn = $('btn-music');
  if (musicBtn) musicBtn.addEventListener('click', ev => { ev.currentTarget.blur(); toggleMusic(); });
  for (const [btnId, ovId] of [['btn-log', 'log-overlay'], ['btn-help', 'help-overlay'], ['scores-open', 'report-overlay']]) {
    const b = $(btnId);
    if (b) b.addEventListener('click', ev => { ev.currentTarget.blur(); toggleOverlay(ovId, btnId); });
  }
  const menuBtn = $('btn-menu');
  if (menuBtn) menuBtn.addEventListener('click', ev => { ev.currentTarget.blur(); toggleOverlay('menu-overlay', 'btn-menu'); });
  for (const [closeId, ovId, btnId] of [['log-close', 'log-overlay', 'btn-log'], ['help-close', 'help-overlay', 'btn-help'], ['report-close', 'report-overlay', 'scores-open'], ['menu-close', 'menu-overlay', 'btn-menu']]) {
    const c = $(closeId);
    if (c) c.addEventListener('click', ev => { ev.currentTarget.blur(); toggleOverlay(ovId, btnId); });
  }
  const fsBtn = $('fullscreen');
  if (fsBtn) fsBtn.addEventListener('click', ev => { ev.currentTarget.blur(); toggleFullscreen(); });
  if (document.addEventListener) document.addEventListener('fullscreenchange', syncFullscreenLabel);
  if (document.addEventListener) document.addEventListener('fullscreenchange', lockEscapeInFullscreen);
  const again = $('again');
  if (again) again.addEventListener('click', ev => {
    ev.currentTarget.blur();
    if (net.on) { netLeave(); openLobby(); } else freshMatchFromSeedBox();
  });
  for (const id of ['menu-leave', 'shop-leave']) {
    const b = $(id);
    if (b) b.addEventListener('click', ev => { ev.currentTarget.blur(); openLeaveVeil(); });
  }
  const leaveGo = $('leave-go');
  if (leaveGo) leaveGo.addEventListener('click', ev => { ev.currentTarget.blur(); confirmLeave(); });
  const leaveStay = $('leave-stay');
  if (leaveStay) leaveStay.addEventListener('click', ev => { ev.currentTarget.blur(); closeLeaveVeil(); });
  const roomsOpen = $('rooms-open');
  if (roomsOpen) roomsOpen.addEventListener('click', ev => { ev.currentTarget.blur(); openRooms(); });
  const tutOpen = $('tutorial-open');
  if (tutOpen) tutOpen.addEventListener('click', ev => { ev.currentTarget.blur(); sfx.play('click'); tutorialOpen(); });
  const tutSkip = $('tutorial-skip');
  if (tutSkip) tutSkip.addEventListener('click', ev => { ev.currentTarget.blur(); skipTutorial(); });
  const hostForm = $('host-form');
  if (hostForm) hostForm.addEventListener('submit', e => {
    e.preventDefault();
    const v = netValidInitials($('host-initials') ? $('host-initials').value : '');
    if (!v) { lobbySay('Initials need exactly 3 letters, and keep them clean.'); return; }
    const mapSel = $('lobby-map');
    unlock(); sfx.play('click');
    hostRoom(v, mapSel ? mapSel.value : '');
  });
  const mapSel = $('lobby-map');
  if (mapSel) mapSel.addEventListener('change', mapChosen);
  const joinForm = $('join-form');
  if (joinForm) joinForm.addEventListener('submit', e => {
    e.preventDefault();
    const code = $('join-code') ? $('join-code').value.trim().toUpperCase() : '';
    const v = netValidInitials($('join-initials') ? $('join-initials').value : '');
    if (!/^[A-Z0-9]{4}$/.test(code)) { lobbySay('Room codes are 4 letters or digits. Read it back and retry.'); return; }
    if (!v) { lobbySay('Initials need exactly 3 letters, and keep them clean.'); return; }
    unlock(); sfx.play('click');
    joinRoom(code, v);
  });
  const lobbyStart = $('lobby-start');
  if (lobbyStart) lobbyStart.addEventListener('click', ev => { ev.currentTarget.blur(); sfx.play('click'); startRoom(); });
  const lobbyLeave = $('lobby-leave');
  if (lobbyLeave) lobbyLeave.addEventListener('click', ev => { ev.currentTarget.blur(); netLeave(); openLobby(); });
  const lobbyClose = $('lobby-close');
  if (lobbyClose) lobbyClose.addEventListener('click', ev => {
    ev.currentTarget.blur();
    if ($('lobby-veil')) $('lobby-veil').hidden = true;
  });
  const copyBtn = $('copy-link');
  if (copyBtn) copyBtn.addEventListener('click', ev => { ev.currentTarget.blur(); copyInvite(); });
  const rematchBtn = $('rematch');
  if (rematchBtn) rematchBtn.addEventListener('click', ev => {
    ev.currentTarget.blur();
    sfx.play('click');
    netRematch();
  });
  const shopNext = $('shop-next');
  if (shopNext) shopNext.addEventListener('click', ev => { ev.currentTarget.blur(); nextRound(); });
  const pvClose = $('preview-close');
  if (pvClose) pvClose.addEventListener('click', ev => { ev.currentTarget.blur(); closePreview(); });
  const eform = $('end-score-form');
  if (eform) eform.addEventListener('submit', e => {
    e.preventDefault();
    const nm = $('end-name');
    const name = nm && nm.value ? nm.value.trim() : '';
    if (!name) { say('Give your callsign first, hero.', 'info'); return; }
    fileReport(name);
    const btn = eform.querySelector && eform.querySelector('button');
    if (btn) { btn.disabled = true; btn.textContent = 'Filed'; }
  });
  const sform = $('score-form');
  if (sform) sform.addEventListener('submit', e => {
    e.preventDefault();
    const nm = $('name-input');
    const name = nm && nm.value ? nm.value.trim() : '';
    if (!name) { say('Give your callsign first, hero.', 'info'); return; }
    fileReport(name);
  });
  window.addEventListener('blur', () => {
    // Turn-based play never needs a blur pause (that only stranded players on
    // a seemingly frozen screen). Just drop held keys so the barrel stops.
    for (const k of Object.keys(keysDown)) delete keysDown[k];
  });
  // Any touch or keypress unlocks the speakers and (re)starts a non-muted
  // song, so music never sits claiming to play while silent after a refresh.
  // This fires before the game keys, and starting twice is a harmless no-op.
  const kickAudio = ev => {
    // A first tap that turns the music off must not fetch a track.
    const hit = ev.type === 'keydown' ? lookupKey('global', ev)
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
  const btn = $('btn-sound');
  if (btn) btn.setAttribute('aria-pressed', String(!isSoundMuted()));
}
function toggleMusic() {
  setMusicMuted(!isMusicMuted());
  const btn = $('btn-music');
  if (btn) btn.setAttribute('aria-pressed', String(!isMusicMuted()));
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
function renderTutorialText() {
  if (TUT) renderTutorial();
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
function renderTutorial() {
  const tx = $('tutorial-text'), pr = $('tutorial-progress'), sk = $('tutorial-skip');
  if (!TUT) return;
  if (tx) tx.textContent = `Move ${TUT.step + 1} of ${TUT_STEPS.length}: ${fmtKeys(TUT_STEPS[TUT.step].text)}`;
  if (pr) pr.textContent = 'Follow along in the hills behind this card.';
  if (sk) sk.textContent = `Skip tutorial${keyCap('global', 'escape')}`;
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
function toggleOverlay(id, btnId) {
  const ov = $(id);
  if (!ov) return;
  ov.hidden = !ov.hidden;
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
  const btn = $('fullscreen');
  if (btn) btn.setAttribute('aria-pressed', String(!!document.fullscreenElement));
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
