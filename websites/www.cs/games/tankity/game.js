/* Operation Tankity: Scorched Earth.
 * Turn-based artillery across destructible hills. You and the drone battery
 * trade shells: angle, power, wind, craters. Last one rolling wins the round.
 * Controls: hold Left/Right = angle · hold Up/Down = power · A/D = drive ·
 * Ctrl/Space = fire · Q = weapon · N = next round / new match · M = music.
 */
(() => {
'use strict';

/* ---------- seeded RNG (mulberry32 + string hash) ---------- */
function hashSeed(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function gauss(rng) {
  return (rng() + rng() + rng() - 1.5) * 2;
}

/* ---------- board + physics tuning ---------- */
const W = 720, H = 460;
const GRAV = 95;
const FLAT_GRAV = 90; // flat bolts arc a little, so short shots and demos still land
const TUNE = {
  lives: 3, maxLives: 5, oneUpEvery: 3000,
  playerArmor: 100, droneArmor: 60,
  fuel: 80, driveSpeed: 42,
  thinkTime: 0.9, settleTime: 1.1,
  roundWinScore: 750, roundWinCash: 500, killBonus: 300,
};
/* Tuning is read-only: one frozen table means a balance number cannot drift
// halfway through a match. PHP arrays already copy on write, so the server
// side gets the same guarantee for free. */
Object.freeze(TUNE);

/* ---------- cheap-but-awesome audio: all synthesized, zero assets ---------- */
let AC = null;
let soundMuted = false;
let musicMuted = false;
let musicOn = false;
let lastMusicTick = 0;
let musicTimer = 0;
let nextNoteT = 0;
let stepIdx = 0;

function ctx() {
  if (soundMuted) return null;
  return audioCtx();
}
function audioCtx() {
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    if (AC.state === 'suspended') void AC.resume();
    return AC;
  } catch (_) { return null; }
}
function envGain(ac, t, vol, dur) {
  const g = ac.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  g.connect(ac.destination);
  return g;
}
function blip(freq, dur, type, vol, slideTo, when, cx) {
  const ac = cx || ctx();
  if (!ac) return;
  try {
    const t = ac.currentTime + (when || 0);
    const o = ac.createOscillator();
    o.type = type || 'square';
    o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t + dur);
    o.connect(envGain(ac, t, vol || 0.05, dur));
    o.start(t);
    o.stop(t + dur + 0.02);
  } catch (_) { /* silent */ }
}
let noiseBuf = null;
function noise(dur, vol, filterFreq, slideTo, when, cx) {
  const ac = cx || ctx();
  if (!ac) return;
  try {
    if (!noiseBuf) {
      noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    const t = ac.currentTime + (when || 0);
    const src = ac.createBufferSource();
    src.buffer = noiseBuf;
    src.loop = true;
    const f = ac.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.setValueAtTime(filterFreq || 1200, t);
    if (slideTo) f.frequency.exponentialRampToValueAtTime(Math.max(40, slideTo), t + dur);
    src.connect(f);
    f.connect(envGain(ac, t, vol || 0.08, dur));
    src.start(t);
    src.stop(t + dur + 0.02);
  } catch (_) { /* silent */ }
}
/* SFX bank: every battlefield event gets a voice. */
const SFX = {
  move() { blip(190, 0.03, 'square', 0.012); },
  click() { blip(700, 0.04, 'square', 0.03); },
  launch() { noise(0.3, 0.1, 900, 4200); blip(120, 0.28, 'sine', 0.09, 320); },
  boom() { noise(0.6, 0.16, 4000, 60); blip(110, 0.55, 'sine', 0.12, 28); },
  clank() { blip(880, 0.09, 'sawtooth', 0.04, 220); blip(440, 0.12, 'sawtooth', 0.04, 110, 0.08); },
  thud() { noise(0.12, 0.08, 900, 200); },
  warn() { blip(1150, 0.09, 'square', 0.05); blip(1150, 0.09, 'square', 0.05, null, 0.13); },
  cash() { [880, 1174, 1568].forEach((f, i) => blip(f, 0.08, 'triangle', 0.05, null, i * 0.06)); },
  bark() { blip(300, 0.06, 'square', 0.03, 420); blip(420, 0.06, 'square', 0.025, null, 0.07); },
  win() { [523, 659, 784, 1046, 1318].forEach((f, i) => blip(f, 0.14, 'triangle', 0.06, null, i * 0.11)); },
  lose() { [330, 262, 208, 156].forEach((f, i) => blip(f, 0.22, 'sawtooth', 0.05, null, i * 0.18)); },
  fanfare() {
    [262, 330, 392, 523, 659, 784].forEach((f, i) => blip(f, 0.12, 'triangle', 0.06, null, i * 0.09));
    noise(0.4, 0.08, 600, 3000, 0.5);
    blip(131, 0.4, 'sine', 0.08, 65, 0.55);
  },
};

/* Punchy procedural war-grooves: four songs of 32 steps (two bars each),
 * four-on-the-floor kick with click, layered snare, driving saw bass, crash
 * every two bars. 142 BPM, zero assets. The round picks the song, so the
 * soundtrack turns over instead of looping one riff all match. */
const SONGS = [
  { name: 'Rollout',
    bass: [55, 0, 55, 55, 0, 65.41, 0, 55, 0, 49, 0, 49, 0, 58.27, 0, 73.42,
           43.65, 0, 43.65, 43.65, 0, 52, 0, 43.65, 49, 0, 49, 49, 0, 58.27, 0, 73.42],
    lead: [440, 0, 0, 523.25, 0, 0, 587.33, 0, 0, 523.25, 0, 440, 0, 392, 587.33, 0,
           349.23, 0, 0, 392, 0, 0, 440, 0, 0, 523.25, 0, 587.33, 0, 659.25, 587.33, 0] },
  { name: 'High Ground',
    bass: [73.42, 0, 73.42, 73.42, 0, 87.31, 0, 73.42, 65.41, 0, 65.41, 65.41, 0, 77.78, 0, 65.41,
           55, 0, 55, 55, 0, 65.41, 0, 55, 49, 0, 49, 49, 0, 58.27, 49, 55],
    lead: [587.33, 0, 523.25, 0, 0, 440, 0, 0, 523.25, 0, 0, 440, 0, 392, 0, 0,
           440, 0, 0, 523.25, 0, 587.33, 0, 0, 659.25, 0, 587.33, 0, 523.25, 0, 440, 0] },
  { name: 'Crater Blues',
    bass: [82.41, 0, 0, 82.41, 0, 0, 98, 0, 0, 82.41, 0, 0, 110, 0, 98, 0,
           82.41, 0, 0, 82.41, 0, 0, 123.47, 0, 0, 110, 0, 98, 0, 82.41, 0, 0],
    lead: [329.63, 0, 0, 0, 392, 0, 0, 0, 440, 0, 493.88, 0, 0, 0, 440, 0,
           392, 0, 0, 0, 329.63, 0, 0, 0, 293.66, 0, 329.63, 0, 392, 0, 0, 0] },
  { name: 'Last Tank',
    bass: [49, 0, 0, 0, 49, 0, 0, 0, 46.25, 0, 0, 0, 46.25, 0, 0, 0,
           43.65, 0, 0, 0, 43.65, 0, 0, 0, 55, 0, 55, 0, 65.41, 0, 73.42, 0],
    lead: [293.66, 0, 0, 0, 0, 0, 349.23, 0, 0, 0, 0, 0, 392, 0, 0, 0,
           440, 0, 0, 0, 0, 0, 523.25, 0, 0, 0, 587.33, 0, 659.25, 0, 0, 0] },
];
let songIdx = 0;
function musicStep() {
  const ac = audioCtx();
  if (!ac || musicMuted || !musicOn) return;
  // Before any gesture the context is suspended with a frozen clock: idle
  // here instead of scheduling onto it, or the first real gesture resumes
  // into silence. The watchdog below restarts a wedged scheduler.
  if (typeof ac.state === 'string' && ac.state !== 'running') return;
  lastMusicTick = Date.now();
  try {
    const stepDur = 60 / 142 / 2;
    // A hidden tab throttles timers, so nextNoteT falls far behind the clock.
    // Without this resync the loop below would schedule minutes of backlog
    // notes in a single tick and freeze the page on refocus. Clamp the other
    // way too: a clock ahead of the note cursor plays silence until it
    // catches up, which reads as music that never starts.
    if (nextNoteT < ac.currentTime - 0.25 || nextNoteT > ac.currentTime + 0.5) {
      nextNoteT = ac.currentTime + 0.05;
    }
    let guard = 0;
    while (nextNoteT < ac.currentTime + 0.18 && guard++ < 64) {
      const song = SONGS[songIdx % SONGS.length];
      const i = stepIdx % 32;
      const at = Math.max(0, nextNoteT - ac.currentTime);
      if (i % 4 === 0) {
        // Kick: sub drop plus a click transient so it cuts through.
        const t = ac.currentTime + at;
        const o = ac.createOscillator();
        o.type = 'sine';
        o.frequency.setValueAtTime(160, t);
        o.frequency.exponentialRampToValueAtTime(38, t + 0.13);
        o.connect(envGain(ac, t, 0.24, 0.15));
        o.start(t); o.stop(t + 0.17);
        blip(1100, 0.02, 'square', 0.05, null, at, ac);
      }
      if (i === 0 && (stepIdx >> 4) % 2 === 0) noise(0.5, 0.03, 9000, 4000, at, ac); // crash
      if (i === 4 || i === 12) {
        // Snare: noise crack plus a 190 Hz body.
        noise(0.1, 0.08, 6000, 1800, at, ac);
        blip(190, 0.09, 'triangle', 0.09, 120, at, ac);
      } else if (i % 2 === 1) noise(0.04, 0.035, 9000, 7000, at, ac); // hats
      if (song.bass[i]) blip(song.bass[i], 0.22, 'sawtooth', 0.075, null, at, ac);
      if (song.lead[i] && (stepIdx >> 4) % 2 === 1) {
        blip(song.lead[i], 0.16, 'square', 0.022, null, at, ac);
        blip(song.lead[i], 0.12, 'square', 0.012, null, at + stepDur * 3, ac);
      }
      nextNoteT += stepDur;
      stepIdx++;
    }
  } catch (_) { /* silent */ }
}
function startMusic() {
  if (musicMuted) return;
  const ac = audioCtx();
  if (!ac || musicOn) return;
  musicOn = true;
  stepIdx = 0;
  nextNoteT = ac.currentTime + 0.06;
  if (!musicTimer) musicTimer = setInterval(musicStep, 60);
}
function stopMusic() {
  musicOn = false;
  if (musicTimer) { clearInterval(musicTimer); musicTimer = 0; }
}

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
/* The arsenal lives in weapons.json, not here: ballistics, prices, packs,
// unlock rounds, AI access, blurbs, and paint jobs all come from that file
// so adding a shell never touches this code. Until it arrives (or when it
// cannot, e.g. file:// play), this baked fallback keeps the war rolling. */
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
let WEAPONS = {};
let WORDER = [];
let SHOP = [];
let GEAR = {};
function buildArsenal(data) {
  const w = {}, order = [], shop = [], gear = {};
  for (const a of (data && data.ammo) || []) {
    if (!a || !a.key || !a.name) continue;
    w[a.key] = Object.assign({ effect: 'shot', speed: 1.0, pack: 0, price: 0, minRound: 1 }, a);
    order.push(a.key);
    if ((a.pack || 0) > 0) {
      // Round-1 goods sell everywhere including the pre-match shelf
      // (G.round is 0 there); later unlocks need the round to arrive.
      const openFrom = (a.minRound || 1) <= 1 ? 0 : a.minRound;
      shop.push({ kind: 'ammo', w: a.key, n: a.pack, label: `${a.name} ×${a.pack}`, cat: a.cat || 'Shells', minRound: openFrom, price: a.price || 0 });
    }
  }
  for (const g of (data && data.gear) || []) {
    if (!g || !g.key || !g.name) continue;
    gear[g.key] = g;
    const openFrom = (g.minRound || 1) <= 1 ? 0 : g.minRound;
    shop.push({ kind: 'gear', g: g.key, n: g.n || 0, label: g.name, cat: g.cat || 'Tricks', minRound: openFrom, price: g.price || 0, effect: g.effect });
  }
  if (!order.length) return false;
  // The arsenal is read-only after the build: every shell, row, and paint
  // job freezes, so a stray write fails loudly instead of bending ballistics
  // mid-match. Hot per-frame state (shells, particles, tanks) stays mutable
  // where freezing would cost real time.
  for (const k of Object.keys(w)) {
    if (w[k].gfx) Object.freeze(w[k].gfx);
    if (w[k].gfx && w[k].gfx.blast) Object.freeze(w[k].gfx.blast);
    Object.freeze(w[k]);
  }
  for (const row of shop) Object.freeze(row);
  for (const k of Object.keys(gear)) Object.freeze(gear[k]);
  Object.freeze(order);
  Object.freeze(shop);
  WEAPONS = w; WORDER = order; SHOP = shop; GEAR = gear;
  G.shopSel = clamp(G.shopSel || 0, 0, SHOP.length - 1);
  return true;
}
async function loadArsenal() {
  try {
    const res = await fetch('weapons.json', { headers: { Accept: 'application/json' } });
    const data = await res.json();
    if (data && Array.isArray(data.ammo) && data.ammo.length) {
      if (buildArsenal(data)) {
        say(`Arsenal loaded: ${WORDER.length} shells, ${Object.keys(GEAR).length} tricks.`, 'info');
        if (G.phase === 'shop') renderShop();
        renderHUD();
      }
    }
  } catch (_) { /* the fallback arsenal above keeps the war rolling */ }
}

/* ---------- state ---------- */
const G = {
  seed: '', rng: null, body: 'tank',
  terrain: null, clouds: [],
  tanks: [], turn: 0, phase: 'aim', // aim | think | fly | settle | shop | over
  thinkT: 0, settleT: 0,
  shells: [], parts: [], beams: [], booms: [],
  wind: 0, round: 1, firstTurn: 0,
  lives: TUNE.lives, score: 0, cash: 0, nextOneUp: TUNE.oneUpEvery,
  roundsWon: 0, ammo: null, selected: 'shell',
  favs: ['shell', 'buck', 'mortar', 'rail'], shopSel: 0, shopQty: 1,
  fuelBank: 0, repairBank: 0,
  plate: 0, shield: false, jammer: 0, bunker: 0, laststand: false,
  time: 0, shake: 0,
  dlgQ: [], dlgT: 0, lastTalk: -99, banterT: 30, bannerT: 0, bannerDone: null,
  cam: { z: 1, cx: 360, cy: 230 },
  over: false, won: false,
};
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
/* Tables start from the baked fallback (G exists from here on); the file
// arsenal replaces them the moment it arrives. */
buildArsenal(FALLBACK_ARSENAL);
const me = () => G.tanks[0];
const alive = () => G.tanks.filter(t => t.hp > 0);
const foesAlive = () => G.tanks.filter(t => !t.isPlayer && t.hp > 0);

function surfY(x) {
  const xi = clamp(Math.round(x), 0, W - 1);
  return G.terrain[xi];
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

/* Rolling hills from seeded sines. */
function genTerrain() {
  G.terrain = new Array(W);
  const a = [20 + G.rng() * 30, 10 + G.rng() * 22, 5 + G.rng() * 12];
  const p = [G.rng() * 6.28, G.rng() * 6.28, G.rng() * 6.28];
  const f = [1 / 260 + G.rng() / 500, 1 / 120 + G.rng() / 260, 1 / 47 + G.rng() / 120];
  for (let x = 0; x < W; x++) {
    const y = 330
      + a[0] * Math.sin(x * f[0] + p[0])
      + a[1] * Math.sin(x * f[1] + p[1])
      + a[2] * Math.sin(x * f[2] + p[2]);
    G.terrain[x] = clamp(y, 190, 415);
  }
  G.clouds = [];
  for (let i = 0; i < 5; i++) {
    G.clouds.push({ x: G.rng() * W, y: 30 + G.rng() * 90, s: 0.6 + G.rng() * 0.9, v: 3 + G.rng() * 5 });
  }
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
  G.favs = ['shell', 'buck', 'mortar', 'rail'].filter(k => k in WEAPONS);
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
  G.beams = [];
  G.booms = [];
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
  startBanner('Round 1. The battery holds these hills.', openShop);
  say(`Match ${G.seed}: $600 stake in your pocket. Buy guns first. The battery holds these hills.`, 'info');
  talk('tank', 'tankity tank! Shopping, then shooting!', true);
}
// A fanfare plus a name card, then the game continues. Nothing starts without you.
function startSolo(seedStr) {
  closePreview();
  ctx();
  startMusic();
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
  G.beams = [];
  G.booms = [];
  // The soundtrack turns over with the rounds: song follows the round.
  songIdx = (G.round - 1) % SONGS.length;
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
/* Which way a tank faces: +1 right, -1 left. Angles count from that side. */
function facing(t) {
  return t.dirS || (t.isPlayer ? 1 : -1);
}
/* Units keep at least this far apart, centre to centre, so hulls and rotors
   never overlap; fresh rounds spread them wider still. */
const UNIT_GAP = 44;
const SPAWN_GAP = 110;
function spotTaken(t, x) {
  return G.tanks.some(o => o !== t && o.hp > 0 && Math.abs(o.x - x) < UNIT_GAP);
}
/* n spawn points across the hills, at least SPAWN_GAP apart, in random
   order: nobody owns a side. Falls back to even spacing if sampling fails. */
function spawnSpots(n, rng) {
  const lo = 30, hi = W - 30;
  for (let tries = 0; tries < 200; tries++) {
    const xs = [];
    for (let i = 0; i < n; i++) xs.push(Math.round(lo + rng() * (hi - lo)));
    xs.sort((a, b) => a - b);
    if (xs.every((x, i) => i === 0 || x - xs[i - 1] >= SPAWN_GAP)) {
      for (let i = xs.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [xs[i], xs[j]] = [xs[j], xs[i]];
      }
      return xs;
    }
  }
  return Array.from({ length: n }, (_, i) => Math.round(lo + (i + 0.5) * (hi - lo) / n));
}
function muzzle(t) {
  const rad = t.angle * Math.PI / 180;
  const s = facing(t);
  return { x: t.x + Math.cos(rad) * 20 * s, y: t.y - 14 - Math.sin(rad) * 20 };
}
function shotSpeed(power, flat, mult) {
  const m = mult || 1;
  return (flat ? 140 + power * 3.2 : 40 + power * 2.4) * m;
}
function fireWeapon(t, wkey) {
  const w = WEAPONS[wkey];
  const store = t.isPlayer ? G.ammo : t.ammo;
  if ((store[wkey] || 0) <= 0) {
    if (t.isPlayer) { say(`No ${w.name} left! ${TOUCH ? 'Tap Weapons' : keyHint('global', 'cycle')} to swap guns.`, 'info'); SFX.click(); }
    return false;
  }
  if (wkey !== 'shell') store[wkey] -= 1;
  const m = muzzle(t);
  const rad = t.angle * Math.PI / 180;
  const s = facing(t);
  const shots = w.pellets || 1;
  for (let i = 0; i < shots; i++) {
    const off = shots === 1 ? 0 : (i - (shots - 1) / 2) * (w.spread || 0);
    const a = rad + off;
    const spd = shotSpeed(t.power, w.flat, w.speed);
    G.shells.push({
      x: m.x, y: m.y,
      vx: Math.cos(a) * spd * s, vy: -Math.sin(a) * spd,
      wkey, owner: t, life: 12,
      trail: 0, age: 0, pierced: false, split: false,
    });
  }
  if (wkey === 'rail') {
    G.beams.push({ x1: m.x, y1: m.y, x2: m.x + Math.cos(rad) * 300 * s, y2: m.y - Math.sin(rad) * 300, life: 0.3 });
  }
  SFX.launch();
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
  if (NET.on) { netFire(); return; }
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
/* One ballistic step. Shared by the real shells, the AI predictor, the aim
 * guide, and the firing-range preview, so the demo flies exactly like war. */
function stepBallistic(st, dt, wind, grav) {
  st.vx += wind * 2.2 * dt;
  st.vy += grav * dt;
  st.x += st.vx * dt;
  st.y += st.vy * dt;
}
/* Predict where a shot lands (used by the AI and the aim guide). */
function simShot(x, y, angle, power, wkey, dirS) {
  const w = WEAPONS[wkey];
  const rad = angle * Math.PI / 180;
  const st = {
    x, y,
    vx: Math.cos(rad) * shotSpeed(power, w.flat, w.speed) * dirS,
    vy: -Math.sin(rad) * shotSpeed(power, w.flat, w.speed),
  };
  const dt = 1 / 60;
  const grav = w.flat ? FLAT_GRAV : GRAV;
  for (let i = 0; i < 720; i++) {
    stepBallistic(st, dt, G.wind, grav);
    if (st.x < 0 || st.x >= W) return { x: st.x, y: st.y, oob: true };
    if (st.y >= H + 40) return { x: st.x, y: st.y, oob: true };
    if (i >= 6 && st.y >= G.terrain[clamp(Math.round(st.x), 0, W - 1)]) return { x: st.x, y: st.y, oob: false };
  }
  return { x: st.x, y: st.y, oob: true };
}
/* Seekers bend toward the nearest live rival before the ballistic step. */
function steerShell(s, w, dt) {
  let best = null, bd = Infinity;
  for (const t of G.tanks) {
    if (t.hp <= 0 || t === s.owner) continue;
    const d = Math.hypot(t.x - s.x, (t.y - 12) - s.y);
    if (d < bd) { bd = d; best = t; }
  }
  if (!best) return;
  const dx = best.x - s.x, dy = (best.y - 12) - s.y;
  const d = Math.max(1, Math.hypot(dx, dy));
  const push = (w.steer || 70) * dt;
  s.vx += (dx / d) * push;
  s.vy += (dy / d) * push;
}
/* Cluster shells split on fuse into a deterministic fan: fixed offsets, no
// random numbers, so the room server replays the exact same bloom. */
function splitShell(s, w) {
  const n = Math.max(2, w.split || 4);
  const fan = w.fan || 0.22;
  const sp = Math.hypot(s.vx, s.vy) * 0.85;
  const base = Math.atan2(s.vy, s.vx);
  for (let i = 0; i < n; i++) {
    const a = base + (i - (n - 1) / 2) * fan;
    G.shells.push({
      x: s.x, y: s.y,
      vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
      wkey: s.wkey, owner: s.owner, life: 12,
      trail: 0, age: 0, pierced: false, split: true,
      dw: w.subDmg || w.dmg, dr: w.subRadius || w.radius,
    });
  }
}
function stepShells(dt) {
  for (const s of G.shells) {
    const w = WEAPONS[s.wkey];
    s.age = (s.age || 0) + dt;
    if (w.effect === 'seeker') steerShell(s, w, dt);
    stepBallistic(s, dt, G.wind, w.flat ? FLAT_GRAV : GRAV);
    s.life -= dt;
    s.trail -= dt;
    if (s.trail <= 0) {
      s.trail = 0.03;
      G.parts.push({ x: s.x, y: s.y, vx: 0, vy: 0, life: 0.25, color: (w.gfx && w.gfx.trail) || '#ffd75e', dot: true });
    }
    if (s.life <= 0 || s.x < -20 || s.x > W + 20 || s.y > H + 40) {
      s.dead = true;
      continue;
    }
    // Cluster blooms on fuse, wherever it happens to be.
    if (w.effect === 'cluster' && !s.split && s.age >= (w.fuse || 0.9)) {
      s.split = true;
      splitShell(s, w);
      s.dead = true;
      continue;
    }
    // Direct hit on a living tank?
    // A lance that already went through a tank cannot hit that tank again.
    let direct = null;
    for (const t of G.tanks) {
      if (t.hp <= 0 || t === s.pierced) continue;
      if (Math.hypot(s.x - t.x, s.y - (t.y - 12)) < 13) { direct = t; break; }
    }
    // Flak bursts next to anything it passes, but never its own gunner: the
    // muzzle starts inside the burst radius.
    if (!direct && w.effect === 'proximity') {
      let bd = w.prox || 34;
      for (const t of G.tanks) {
        if (t.hp <= 0 || t === s.owner) continue;
        const d = Math.hypot(s.x - t.x, s.y - (t.y - 12));
        if (d < bd) { bd = d; direct = t; }
      }
    }
    if (direct) {
      // A lance punches through its first victim and keeps flying.
      if (w.effect === 'pierce' && !s.pierced) {
        s.pierced = direct;
        explode(s.x, s.y, s.wkey, s.owner, direct, s.dw ? { dmg: s.dw, radius: s.dr } : null);
        continue;
      }
      explode(s.x, s.y, s.wkey, s.owner, direct, s.dw ? { dmg: s.dw, radius: s.dr } : null);
      s.dead = true;
      continue;
    }
    if (s.age >= 0.1 && s.y >= surfY(s.x)) {
      explode(s.x, s.y, s.wkey, s.owner, null, s.dw ? { dmg: s.dw, radius: s.dr } : null);
      s.dead = true;
    }
  }
  G.shells = G.shells.filter(s => !s.dead);
  // No clearing here: every pellet of a volley resolves on its own, so a
  // buckshot spread scores up to three independent hits. The turn advances
  // once the last pellet lands (or fizzles).
  // (Sparks decay in decayFx, which runs every frame: leaving them here
  // froze the last volley's leftovers over the next turn.)
}
function explode(x, y, wkey, owner, direct, ov) {
  const w = WEAPONS[wkey];
  const dmg0 = (ov && ov.dmg) || w.dmg;
  const r = (ov && ov.radius) || w.radius;
  const gfx = (ov && ov.gfx) || w.gfx || {};
  // Carve the crater.
  const x0 = Math.max(0, Math.floor(x - r)), x1 = Math.min(W - 1, Math.ceil(x + r));
  for (let ix = x0; ix <= x1; ix++) {
    const dx = ix - x;
    const cut = Math.sqrt(Math.max(0, r * r - dx * dx)) * 0.75;
    G.terrain[ix] = Math.min(H - 4, Math.max(G.terrain[ix], y + cut));
  }
  SFX.boom();
  G.shake = Math.max(G.shake || 0, gfx.shake || 0.5);
  G.booms.push({ x, y, r, wkey, t: 0, life: wkey === 'nuke' ? 0.8 : 0.5 });
  burst(x, y, (gfx.blast && gfx.blast[0]) || '#ffb13c', 24, 7);
  burst(x, y, '#5a4630', 14, 4);
  if (wkey === 'nuke') {
    burst(x, y, '#ff6b6b', 30, 9);
    G.shake = 0.9;
  }
  // Damage by distance; direct hits pay double.
  for (const t of G.tanks) {
    if (t.hp <= 0) continue;
    const d = Math.hypot(t.x - x, (t.y - 12) - y);
    if (d > r + 14) continue;
    // A shield absorbs one hit whole, then it is gone.
    if (t.isPlayer && G.shield) {
      G.shield = false;
      burst(t.x, t.y - 12, '#ffffff', 16, 5);
      say('Shield absorbs the hit!', 'good');
      renderHUD();
      continue;
    }
    let dmg = Math.round(dmg0 * Math.max(0.3, 1 - d / (r + 14)));
    if (direct === t) dmg *= 2;
    // A bunker halves everything that gets through.
    if (t.isPlayer && (G.bunker || 0) > 0) dmg = Math.max(1, Math.round(dmg / 2));
    t.hp = Math.max(0, t.hp - dmg);
    // EMP fries fuel as well as armor.
    if (w.effect === 'emp') t.fuel = Math.max(0, (t.fuel || 0) - (w.drain || 0));
    if (owner.isPlayer && !t.isPlayer) {
      G.score += dmg * 2;
      G.cash += dmg * 2;
    }
    if (t.hp <= 0) killTank(t, owner);
    else if (t.isPlayer) {
      say(`Direct hit on YOU for ${dmg}! (${t.hp} armor left)`, 'bad');
      exchange('tank', pick(TANK_OWS), owner.id, pick(FOE_HIT[owner.id] || FOE_MISS));
    } else if (owner.isPlayer) {
      say(`Direct hit on ${t.id} for ${dmg}! (${t.hp} armor left)`, 'good');
      talk('tank', pick(TANK_HIT), true);
    } else if (direct) {
      say(`${owner.id} hits ${t.id} for ${dmg}.`, 'info');
    }
  }
  G.settleT = TUNE.settleTime;
  G.phase = 'settle';
}
function killTank(t, owner) {
  SFX.boom();
  burst(t.x, t.y - 12, '#ff5a5a', 26, 7);
  // Last stand: the wreck itself detonates, once, then the trick is spent.
  if (t.isPlayer && G.laststand) {
    G.laststand = false;
    say('Last stand! The wreck detonates!', 'good');
    const ls = GEAR.laststand || {};
    explode(t.x, t.y - 12, 'shell', t, null, { dmg: ls.dmg || 50, radius: ls.radius || 44 });
    renderHUD();
  }
  if (t.isPlayer) {
    say('Your tank is scrap metal!', 'bad');
    talk('tank', 'I will be back... after repairs.', true);
  } else {
    G.score += TUNE.killBonus;
    G.cash += TUNE.killBonus;
    const by = owner.isPlayer ? 'You' : owner.id;
    say(`${by} wreck${owner.isPlayer ? '' : 's'} ${t.id}! (+${TUNE.killBonus})`, 'good');
    exchange(t.id, FOE_DYING[t.id] || '...', 'tank', pick(TANK_HIT));
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
const FALL_GRAVITY = 700;
function fallTanks(dt) {
  for (const t of G.tanks) {
    if (t.hp <= 0) continue;
    const gy = surfY(t.x);
    if (t.y < gy - 0.5) {
      t.vy = (t.vy || 0) + FALL_GRAVITY * dt;
      t.y = Math.min(gy, t.y + t.vy * dt);
      if (t.y >= gy) {
        t.vy = 0;
        if (t.isPlayer) SFX.thud();
      }
    } else {
      t.y = gy;
      t.vy = 0;
    }
  }
}
function anyTankFalling() {
  return G.tanks.some(t => t.hp > 0 && t.y < surfY(t.x) - 0.5);
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
    SFX.win();
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
  stopMusic();
  hideShop();
  refreshNavHints();
  if (won) SFX.win(); else SFX.lose();
  say(text, won ? 'good' : 'bad');
  const veil = $('end-veil');
  if (veil) {
    $('end-kicker').textContent = won ? 'Match over' : 'Match lost';
    $('end-title').textContent = won ? 'Hills claimed!' : 'Tank down';
    $('end-text').textContent = text;
    $('end-score').textContent = `Score ${G.score} · ${G.roundsWon} rounds won · ${G.round} rounds played · seed ${G.seed}`;
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
  SFX.fanfare();
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
let shopSelShown = -1; // the row renderShop last brought into view
function renderShop() {
  const title = $('shop-title');
  if (title) title.textContent = G.round === 0 ? 'Pre-match shop' : 'Field shop';
  const next = $('shop-next');
  if (next) next.textContent = `Start round ${G.round + 1}${keyCap('shop', 'next')}`;
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
  SHOP.forEach((it, idx) => {
    if (it.cat !== lastCat) {
      lastCat = it.cat;
      const h = document.createElement('li');
      h.className = 'shop-cat';
      h.textContent = it.cat;
      list.appendChild(h);
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
    name.textContent = `${idx + 1}. ${shopName(it, unit)}${qty > 1 ? ` ×${qty} packs = $${total}` : ''}`;
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
function shopName(it, price) {
  if (it.kind === 'ammo') {
    const own = (G.ammo[it.w] || 0) > 0 ? ` (you own ${G.ammo[it.w]})` : '';
    return `${it.label} ($${price})${own}`;
  }
  return `${it.label} ($${price})`;
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
/* One direct loader for digits and favorites; Q keeps cycling through it. */
function selectWeapon(w) {
  if (G.over || G.phase === 'shop' || demoBlock()) return false;
  if (NET.on) return netPick(w);
  if (!(w === 'shell' || (G.ammo[w] || 0) > 0)) {
    say(`No ${WEAPONS[w].name} left in the rack.`, 'info');
    return false;
  }
  G.selected = w;
  SFX.click();
  say(`Loaded: ${WEAPONS[w].name}.`, 'info');
  renderHUD();
  return true;
}
function buyItem(it, qty) {
  qty = clamp(Math.floor(qty || 1), 1, 9);
  if (NET.on) { netBuy(it, qty); return; }
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
  SFX.cash();
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
  if (NET.on) { netNext(); return; }
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
    shells: [], parts: [], booms: [], volleys: 0, foeHp: PV_FOE_HP,
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
  SFX.click();
}
function closePreview() {
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
}
function previewBoom(pv, x, y, ov) {
  const w = WEAPONS[pv.wkey];
  const dmg0 = (ov && ov.dmg) || w.dmg;
  const r = (ov && ov.radius) || w.radius;
  pv.booms.push({ x, y, r, t: 0, life: 0.5 });
  const x0 = Math.max(0, Math.floor(x - r)), x1 = Math.min(PV_W - 1, Math.ceil(x + r));
  for (let ix = x0; ix <= x1; ix++) {
    const dx = ix - x;
    pv.terr[ix] = Math.min(PV_H - 4, Math.max(pv.terr[ix], y + Math.sqrt(Math.max(0, r * r - dx * dx)) * 0.75));
  }
  for (let i = 0; i < 14; i++) {
    const a = Math.random() * Math.PI * 2, s = 30 + Math.random() * 60;
    pv.parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 20, life: 0.5 });
  }
  // Same falloff the war uses, scored against the demo target.
  const fy = pv.terr[pv.tx] - 12;
  const d = Math.hypot(pv.tx - x, fy - y);
  if (d <= r + 14) {
    let dmg = Math.round(dmg0 * Math.max(0.3, 1 - d / (r + 14)));
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
  for (const q of pv.parts) {
    q.life -= dt;
    q.x += q.vx * dt;
    q.y += q.vy * dt;
  }
  pv.parts = pv.parts.filter(q => q.life > 0);
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
      if (w.effect === 'cluster' && !s.split && s.age >= (w.fuse || 0.9)) {
        s.split = true;
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
  const rack = { shell: Infinity };
  for (const k of WORDER) {
    if (k === 'shell') continue;
    const a = WEAPONS[k];
    rack[k] = (a && a.ai && G.round >= (a.aiRound || 99)) ? 2 : 0;
  }
  return rack;
}
function aiChoose(t) {
  // Drones feud with each other too: usually the nearest rival, sometimes
  // whoever else is still rolling. Nobody is safe, nobody is perfect.
  const rivals = G.tanks
    .filter(c => c !== t && c.hp > 0)
    .sort((a, b) => Math.abs(a.x - t.x) - Math.abs(b.x - t.x));
  let target = rivals[0] || t;
  if (rivals.length > 1 && G.rng() >= 0.6) {
    target = rivals[1 + Math.floor(G.rng() * (rivals.length - 1))];
  }
  const dirS = facing(t);
  const m = muzzle(t);
  let best = null;
  const keys = ['shell'];
  const rack = t.ammo || {};
  for (const k of WORDER) {
    if (k === 'shell' || keys.includes(k)) continue;
    if ((rack[k] || 0) > 0) keys.push(k);
  }
  for (const wkey of keys) {
    for (let a = 25; a <= 155; a += 6) {
      for (let p = 20; p <= 100; p += 6) {
        const land = simShot(m.x, m.y, a, p, wkey, dirS);
        const err = land.oob ? 400 + Math.abs(land.x - target.x) * 0.2 : Math.abs(land.x - target.x);
        if (!best || err < best.err) best = { err, a, p, wkey };
      }
    }
  }
  // Deliberately shaky hands: dangerous up close, forgiving at range.
  // A jammer doubles the wobble of anything aimed at our tank.
  const skill = Math.min(1, 0.35 + G.round * 0.12);
  let wob = Math.max(0.25, 1.2 - skill);
  if (target.isPlayer && (G.jammer || 0) > 0) wob *= 2;
  const angle = clamp(Math.round(best.a + gauss(G.rng) * 9 * wob), 10, 170);
  const power = clamp(Math.round(best.p + gauss(G.rng) * 12 * wob), 10, 100);
  // Drones shuffle for a better firing spot instead of camping one rut.
  if (G.rng() < 0.35) {
    const dx = (G.rng() < 0.5 ? -1 : 1) * (8 + G.rng() * 27);
    const nx = clamp(t.x + dx, 12, W - 12);
    if (!spotTaken(t, nx)) {
      t.x = nx;
      t.y = surfY(t.x);
    }
  }
  return { wkey: best.wkey, angle, power };
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
  c.globalAlpha = 0.55 * (1 - p);
  c.fillStyle = '#ffb13c';
  c.beginPath();
  c.arc(bm.x, bm.y, rr, 0, Math.PI * 2);
  c.fill();
  c.globalAlpha = 0.9 * (1 - p);
  c.strokeStyle = '#fff3c4';
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
function isGroundUnit(t) {
  return t.isPlayer || !!t.human;
}
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
  const mine = NET.on ? myTank() : (G.tanks || []).find(t => t.isPlayer);
  if (mine) mine.body = key;
  if (NET.code) roomPost('body', { body: key }).then(d => { if (NET.on) netApply(d.room); }).catch(() => {});
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
  SFX.click();
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
/* The loaded weapon and the favorites: each shell beside its name. Text
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
  const favs = $('hud-favs');
  if (favs) setChips(favs, G.favs.map((w, i) => ({ w, text: `${i + 1}`, sr: ` ${WEAPONS[w].name}`, title: `${i + 1}: ${WEAPONS[w].name}` })));
}
/* Whose turn the battlefield shows: the shooter of a replaying volley, else
   the tank whose turn it is. Nobody between rounds or after the match. */
function turnTank() {
  if (G.over || G.phase === 'shop' || G.phase === 'banner') return null;
  if (NET.on && NET.volley && NET.volley.shooter) return NET.volley.shooter;
  const t = G.tanks[G.turn];
  return t && t.hp > 0 ? t : null;
}
/* A pulsing glow under the unit and a bobbing chevron over its name. */
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
  // Blocky stars ride along, fixed by index so they never twinkle or crawl.
  c.fillStyle = '#00000b';
  c.fillRect(-W - 10, -2 * H - 10, 3 * W + 20, 3 * H + 20);
  c.fillStyle = '#ffffff';
  for (let si = 0; si < 70; si++) {
    const sx = ((si * 173 + 41) % (3 * W + 20)) - W - 10;
    const sy = ((si * 311 + 17) % (2 * H)) - 2 * H - 10 + H;
    if ((si % 3) !== 0) c.fillRect(sx, sy, 2, 2);
  }
  // Dirt base under the extended sky, so the ground reads as one continuous
  // hillside even past the world edge.
  c.fillStyle = '#2e1a08';
  c.fillRect(-W - 10, H - 2, 3 * W + 20, 2 * H + 12);
  // Pale moon + dark drifting clouds.
  c.fillStyle = '#e8e8e8';
  c.beginPath();
  c.arc(600, 90, 26, 0, Math.PI * 2);
  c.fill();
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
  // Shells in flight.
  for (const s of G.shells) {
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
  if (NET.volley && NET.volley.ft >= 0) {
    const ft = NET.volley.ft;
    for (const sh of NET.volley.shots) {
      if (sh.landed) continue;
      const [hx, hy, idx] = netShellAt(sh, ft);
      const gfx = ((WEAPONS[sh.e.w] || {}).gfx) || {};
      c.strokeStyle = gfx.trail || '#ffd75e';
      c.globalAlpha = 0.5;
      c.lineWidth = 1.5;
      c.beginPath();
      const from = Math.max(0, idx - 8);
      c.moveTo(sh.pts[from] ? sh.pts[from][0] : hx, sh.pts[from] ? sh.pts[from][1] : hy);
      for (let i = from + 1; i <= idx; i++) c.lineTo(sh.pts[i][0], sh.pts[i][1]);
      c.lineTo(hx, hy);
      c.stroke();
      c.globalAlpha = 1;
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
  // Blast discs: each explosion draws exactly the circle its weapon destroys.
  for (const bm of G.booms) drawBoom(c, bm);
  if (G.preview) drawPreview();
  // Rail muzzle streaks.
  for (const b of G.beams) {
    c.globalAlpha = Math.max(0, b.life * 3);
    c.strokeStyle = '#9fd8ff';
    c.lineWidth = 4;
    c.beginPath();
    c.moveTo(b.x1, b.y1);
    c.lineTo(b.x2, b.y2);
    c.stroke();
    c.globalAlpha = 1;
  }
  // Particles.
  for (const q of G.parts) {
    c.globalAlpha = Math.max(0, Math.min(1, q.life * 1.8));
    c.fillStyle = q.color;
    if (q.dot) {
      c.beginPath();
      c.arc(q.x, q.y, 1.6, 0, Math.PI * 2);
      c.fill();
    } else {
      c.fillRect(q.x - 2, q.y - 2, 4, 4);
    }
  }
  c.globalAlpha = 1;
  c.restore();
  drawWindGauge(c, cv, time);
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
/* Fitted tricks ride the HUD beside the shells. In room matches netApply
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
  for (const s of pv.shells) {
    c.fillStyle = ((WEAPONS[pv.wkey] || {}).gfx || {}).shell || '#ffe27a';
    c.beginPath();
    c.arc(s.x, s.y, 3, 0, Math.PI * 2);
    c.fill();
  }
  c.fillStyle = '#ffb13c';
  for (const q of pv.parts) c.fillRect(q.x - 1.5, q.y - 1.5, 3, 3);
  for (const bm of pv.booms) drawBoom(c, bm);
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
  if (NET.on) { renderNetHUD(); return; }
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
/* Battlefield cosmetics decay on wall-clock frames, never on volleys: beams,
 * blast discs, shake, and sparks all finish even after the last shell lands,
// so nothing freezes over the next turn. */
function decayFx(dt) {
  if (G.shake > 0) G.shake = Math.max(0, G.shake - dt);
  for (const b of G.beams) b.life -= dt;
  G.beams = G.beams.filter(b => b.life > 0);
  for (const bm of G.booms) bm.t += dt;
  G.booms = G.booms.filter(bm => bm.t < bm.life);
  for (const q of G.parts) {
    q.life -= dt;
    if (!q.dot) { q.x += q.vx * dt; q.y += q.vy * dt; q.vy += GRAV * 0.6 * dt; }
  }
  G.parts = G.parts.filter(q => q.life > 0);
}
function frame(ts) {
  requestAnimationFrame(frame);
  // Watchdog: if the music claims to play but no note has been laid down for
  // a while (wedged clock, throttled timer), re-pin the note cursor to the
  // live clock. This never tears the timer down: clearing and recreating the
  // interval every frame would starve the scheduler so no step ever fires.
  if (musicOn && !musicMuted && Date.now() - lastMusicTick > 1500) {
    const ac = audioCtx();
    if (ac && ac.state === 'running') {
      nextNoteT = ac.currentTime + 0.05;
      lastMusicTick = Date.now();
    }
  }
  const dt = Math.min(0.05, (ts - lastT) / 1000 || 0.016);
  lastT = ts;
  // The firing range runs on its own, even over the pre-match shop.
  if (G.preview) stepPreview(dt);
  // Name cards tick on sim time so a throttled background tab can never
  // strand the game between rounds; on return the card simply finishes.
  tickBanner(dt);
  // Room matches render the server snapshot; the server runs the war.
  if (NET.on) {
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
  while (!NET.on && G.score >= G.nextOneUp) {
    G.nextOneUp += TUNE.oneUpEvery;
    if (G.lives < TUNE.maxLives) {
      G.lives += 1;
      SFX.win();
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
const NET = {
  on: false, code: '', seat: -1, token: '', csrf: '', since: 0,
  seats: [], myTurn: false, aimDirty: false, driveAcc: 0, driveT: 0,
  queue: [], volley: null, pendingRoom: null, synced: false, busy: false, lastPhase: '', pollId: 0,
  initials: '', maps: [], map: null, mapName: 'Random hills', lastRound: -1,
};
const KNOWN_FOES = ['reaper', 'wraith', 'spotter'];
const FOE_PAINT = { reaper: '#ff0000', wraith: '#00ffff', spotter: '#ff00ff' };
const SEAT_PAINT = ['#ffff00', '#00ff00', '#00ffff', '#ff00ff'];
let lobbyTimer = 0;
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
// Server lines are already human; these few technical ones get translated so
// a game never quotes transport at the player.
function prettyRoomError(err) {
  const m = String((err && err.message) || err || '');
  if (/too fast/.test(m)) return 'Easy on the trigger. Give it a beat and try again.';
  if (/bad seat token|bad csrf token|bad origin/.test(m)) return 'Room session went stale. Leave the room and come back in.';
  return m || 'The room server did not answer properly. Solo hills still work.';
}
/* One fetcher for every room call, so transport trouble always arrives in
// human words: unreachable, a page where game data should be (PHP not
// running), or a stumble. Server JSON errors pass through untouched. */
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
function roomDown(err) {
  const e = new Error(err);
  e.roomDown = true;
  setNetDot(false);
  return e;
}
async function roomFetchJson(url, opts) {
  let res;
  try {
    res = await fetch(url, opts);
  } catch (err) {
    throw roomDown('Could not reach the room server. Solo hills still work.');
  }
  const data = await res.json().catch(() => null);
  if (!data) {
    throw roomDown(res.ok
      ? 'The room server answered with a page instead of game data, so the PHP service is probably not running there. Solo hills still work.'
      : 'The room server stumbled. Solo hills still work.');
  }
  return { res, data };
}
async function roomPost(action, payload) {
  const { res, data } = await roomFetchJson('rooms.php?action=' + encodeURIComponent(action), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': NET.csrf || '' },
    body: JSON.stringify(Object.assign({ code: NET.code, token: NET.token, csrf: NET.csrf }, payload || {})),
  });
  if (!res.ok || !data.ok) throw new Error(data.error || 'The room server stumbled. Solo hills still work.');
  setNetDot(true);
  return data;
}
async function roomGetState() {
  const q = 'action=state&code=' + encodeURIComponent(NET.code) +
    '&token=' + encodeURIComponent(NET.token) + '&since=' + NET.since;
  const { res, data } = await roomFetchJson('rooms.php?' + q, { headers: { Accept: 'application/json' } });
  if (!res.ok || !data.ok) throw new Error(data.error || 'The room server stumbled. Solo hills still work.');
  setNetDot(true);
  return data.room;
}
function myTank() {
  for (const t of G.tanks) if (t.isPlayer) return t;
  return null;
}
function seatName(seat) {
  const s = NET.seats[seat];
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
  try {
    const { data } = await roomFetchJson('rooms.php?action=maps', { headers: { Accept: 'application/json' } });
    if (data.ok && Array.isArray(data.maps)) NET.maps = data.maps;
    if (data.ok) setNetDot(true);
  } catch (err) { /* hills picker stays on random */ }
  const sel = $('lobby-map');
  if (!sel) return;
  const cur = sel.value;
  if (cur === '' || NET.maps.some(m => m.id === cur)) sel.value = cur;
  else sel.value = NET.map || '';
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
  const tiles = [{ id: '', name: 'Random hills' }, ...NET.maps].map(m => {
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
  if (!NET.code || NET.seat !== 0 || NET.on) return;
  const seq = ++mapPickSeq;
  try {
    for (let tries = 0; ; tries++) {
      try {
        const d = await roomPost('map', { map: mapSel.value || '' });
        if (seq !== mapPickSeq) return;
        NET.map = d.room.map;
        NET.mapName = d.room.mapName || 'Random hills';
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
  try {
    const { data } = await roomFetchJson('rooms.php?action=ping', { headers: { Accept: 'application/json' } });
    setNetDot(true);
    if (data.ok && data.rooms && el) {
      el.textContent = `${data.rooms.used} / ${data.rooms.max} rooms occupied`;
    }
    return !!(data.ok && data.rooms);
  } catch (err) {
    if (el) el.textContent = '';
    return false;
  }
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
  if (NET.code && !NET.on) {
    netRenderRoster(null);
    netLobbyWatch();
  } else if (!NET.code) {
    const box = $('lobby-room');
    if (box) box.hidden = true;
  }
}
async function hostRoom(initials, mapId) {
  lobbySay('Raising the flag…');
  NET.code = ''; NET.token = ''; NET.csrf = ''; NET.seat = -1; NET.since = 0;
  NET.seats = [];
  NET.initials = initials;
  NET.map = null;
  NET.mapName = 'Random hills';
  try {
    const data = await roomPost('create', { initials, map: mapId || '', body: G.body });
    NET.code = data.code; NET.seat = data.seat; NET.token = data.token; NET.csrf = data.csrf;
    say(`Room ${NET.code} hosted. Read the code to your friends.`, 'info');
    await netRefreshRoster();
    loadOccupancy();
    netLobbyWatch();
  } catch (err) { lobbySay(prettyRoomError(err)); }
}
async function joinRoom(code, initials) {
  lobbySay('Knocking…');
  NET.code = String(code || '').trim().toUpperCase();
  NET.token = ''; NET.csrf = ''; NET.seat = -1; NET.since = 0;
  NET.seats = [];
  NET.initials = initials;
  try {
    const data = await roomPost('join', { code: NET.code, initials, body: G.body });
    NET.code = data.code; NET.seat = data.seat; NET.token = data.token; NET.csrf = data.csrf;
    say(`Joined room ${NET.code} as ${initials}.`, 'info');
    await netRefreshRoster();
    netLobbyWatch();
  } catch (err) { lobbySay(prettyRoomError(err)); }
}
async function netRefreshRoster() {
  let room = null;
  try {
    room = await roomGetState();
    NET.seats = room.seats || [];
  } catch (err) { /* roster fills in on the next tick */ }
  netRenderRoster(room);
}
function netLobbyWatch() {
  if (lobbyTimer) clearInterval(lobbyTimer);
  lobbyTimer = setInterval(async () => {
    if (!NET.code || NET.on) { clearInterval(lobbyTimer); lobbyTimer = 0; return; }
    const veil = $('lobby-veil');
    if (!veil || veil.hidden) { clearInterval(lobbyTimer); lobbyTimer = 0; return; }
    try {
      const room = await roomGetState();
      NET.seats = room.seats || [];
      netRenderRoster(room);
      if (room.phase && room.phase !== 'lobby') startNetMatch(room);
    } catch (err) { /* the host may have wandered off; keep listening */ }
  }, 2000);
}
/* The invite link carries the room code so a friend lands in the lobby with
// the code already filled in. */
function joinLink() {
  if (typeof location === 'undefined' || !NET.code) return '';
  const base = (location.origin || '') + (location.pathname || '');
  return base + '?code=' + encodeURIComponent(NET.code);
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
    SFX.click();
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
  const box = $('lobby-room');
  if (box) box.hidden = false;
  if ($('lobby-code')) $('lobby-code').textContent = NET.code || '····';
  const link = $('join-link');
  if (link) link.value = joinLink();
  const hills = $('lobby-hills');
  if (hills) {
    if (room && room.map !== undefined) {
      NET.map = room.map;
      NET.mapName = room.mapName || 'Random hills';
    }
    hills.textContent = 'Hills: ' + (NET.mapName || 'Random hills');
  }
  const grid = $('lobby-seats');
  if (grid && grid.replaceChildren) {
    const seats = (room && room.seats) || NET.seats || [];
    const host = NET.seat === 0;
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
      if (human) cap.textContent = (i === NET.seat ? 'You' : 'Player') + (i === 0 ? ' · host' : '');
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
    seatsHint.textContent = NET.seat === 0
      ? 'Tap a seat nobody holds to switch it between AI and Open. Open seats field no tank.'
      : 'The host decides which empty seats are AI and which stay open.';
  }
  const start = $('lobby-start');
  if (start) start.style.display = NET.seat === 0 ? '' : 'none';
  lobbySay(NET.seat === 0 ? 'You host. Start when your crew is in.' : 'Hang tight. The host starts the match.');
  refreshNavHints();
}
/* The host flips a seat nobody holds between the drone battery and open. */
async function netSeatMode(seat, mode) {
  if (NET.seat !== 0 || NET.on) return;
  try {
    const d = await roomPost('seatmode', { seat, mode, since: NET.since });
    NET.seats = d.room.seats || [];
    netRenderRoster(d.room);
  } catch (err) { lobbySay(prettyRoomError(err)); }
}
async function startRoom() {
  if (NET.seat !== 0) return;
  lobbySay('Rolling out…');
  try {
    const data = await roomPost('start', {});
    startNetMatch(data.room);
  } catch (err) { lobbySay(prettyRoomError(err)); }
}
function startNetMatch(room) {
  endTutorial(false);
  G.demo = false;
  NET.on = true;
  NET.since = 0;
  NET.lastPhase = '';
  NET.lastRound = -1;
  NET.queue = []; NET.volley = null; NET.pendingRoom = null; NET.synced = false;
  NET.aimDirty = false;
  G.over = false;
  const sf = $('score-form');
  if (sf) sf.style.display = 'none';
  if (lobbyTimer) { clearInterval(lobbyTimer); lobbyTimer = 0; }
  const veil = $('lobby-veil');
  if (veil) veil.hidden = true;
  netApply(room);
  say(`Room ${NET.code}: you are ${seatName(NET.seat)}. The battery flies the AI seats.`, 'info');
  if (NET.pollId) clearInterval(NET.pollId);
  NET.pollId = setInterval(netRefresh, 1600);
  syncLeaveButtons();
}
/* Leaving a running match: Leave room buttons (menu, shop) only show inside a
   room, and ask first in the page, never with a browser dialog. */
function syncLeaveButtons() {
  for (const id of ['menu-leave', 'shop-leave']) {
    const b = $(id);
    if (b) b.hidden = !NET.on;
  }
}
function openLeaveVeil() {
  if (!NET.on) return;
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
  if (NET.on) netLeave();
}
/* Tell the server this seat is gone, so an emptied room frees its slot at
   once instead of after the idle window. Best effort; sendBeacon survives a
   closing tab. */
function netSendLeave() {
  if (!NET.code || !NET.token) return;
  const body = JSON.stringify({ code: NET.code, token: NET.token, csrf: NET.csrf });
  const url = 'rooms.php?action=leave';
  try {
    if (navigator.sendBeacon && navigator.sendBeacon(url, body)) return;
  } catch (_) { /* fall through to fetch */ }
  try {
    fetch(url, { method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' }, body });
  } catch (_) { /* the idle sweep closes it anyway */ }
}
function netLeave(quiet) {
  netSendLeave();
  if (NET.pollId) { clearInterval(NET.pollId); NET.pollId = 0; }
  if (lobbyTimer) { clearInterval(lobbyTimer); lobbyTimer = 0; }
  const wasOn = NET.on;
  const rematch = $('rematch');
  if (rematch) rematch.hidden = true;
  NET.on = false; NET.code = ''; NET.seat = -1; NET.token = ''; NET.csrf = ''; NET.since = 0;
  NET.seats = []; NET.queue = []; NET.volley = null; NET.pendingRoom = null; NET.synced = false; NET.myTurn = false; NET.lastPhase = ''; NET.lastTurn = -1; NET.lastRound = -1;
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
  const initials = NET.initials;
  const map = NET.map;
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
async function netRefresh() {
  if (!NET.on) return;
  try {
    netApply(await roomGetState());
  } catch (err) { /* the next poll retries; the hills wait */ }
}
async function netAct(kind, extra) {
  if (NET.busy) return;
  NET.busy = true;
  try {
    netApply((await roomPost('act', Object.assign({ kind }, extra || {}))).room);
  } catch (err) {
    say(prettyRoomError(err), 'bad');
    SFX.warn();
  }
  NET.busy = false;
}
function netFire() {
  if (!NET.myTurn) { say('Hold on, not your turn yet.', 'info'); return; }
  closePreview();
  const t = myTank();
  const ang = t ? Math.round(t.angle * 10) / 10 : 60;
  const pow = t ? Math.round(t.power * 10) / 10 : 55;
  talk('tank', pick(TANK_FIRE));
  netAct('fire', { angle: ang, power: pow });
}
function netSendAim() {
  NET.aimDirty = false;
  const t = myTank();
  if (!t || t.hp <= 0) return;
  roomPost('act', {
    kind: 'aim',
    angle: Math.round(t.angle * 10) / 10,
    power: Math.round(t.power * 10) / 10,
  }).then(d => netApply(d.room)).catch(() => {});
}
function netSendDrive(dx) {
  roomPost('act', { kind: 'drive', dx: Math.round(dx * 10) / 10 })
    .then(d => netApply(d.room)).catch(() => {});
}
function netPick(w) {
  if (!NET.myTurn) { say('Hold on, not your turn yet.', 'info'); return false; }
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
  SFX.click();
  say(`Loaded: ${WEAPONS[w].name}.`, 'info');
  renderHUD();
  roomPost('act', { kind: 'weapon', weapon: w }).then(d => netApply(d.room)).catch(() => {});
  return true;
}
function netCycle() {
  if (!NET.myTurn) { say('Hold on, not your turn yet.', 'info'); return; }
  const i = WORDER.indexOf(G.selected);
  for (let k = 1; k <= WORDER.length; k++) {
    const w = WORDER[(i + k) % WORDER.length];
    if (netPick(w)) return;
  }
}
function netBuy(it, qty) {
  const key = it.kind === 'ammo' ? it.w : (it.g || it.kind);
  qty = clamp(Math.floor(qty || 1), 1, 9);
  SFX.click();
  roomPost('buy', { item: key, qty })
    .then(d => {
      SFX.cash();
      say(`Bought ${qty > 1 ? qty + ' × ' : ''}${it.label}.`, 'good');
      G.shopQty = 1;
      netApply(d.room);
    })
    .catch(err => { say(prettyRoomError(err), 'bad'); SFX.warn(); });
}
function netNext() {
  roomPost('next', {})
    .then(d => netApply(d.room))
    .catch(err => {
      // Anyone may roll out; if someone else already did, just catch up.
      if (/not at the shop/.test(String(err && err.message))) { netRefresh(); return; }
      say(prettyRoomError(err), 'bad');
    });
}
/* A room update either lands now or waits behind the replay: the server
   settles a whole turn at once, and clients play it back (aim, flight,
   blasts, damage) before the new state takes over. */
function netApply(room) {
  if (!room || !NET.code) return;
  const fresh = (room.events || []).filter(e => (e.seq || 0) > NET.since);
  for (const e of fresh) NET.since = Math.max(NET.since, e.seq || 0);
  if (!NET.synced) {
    // First sync: earlier events are history. Log them, replay nothing.
    NET.synced = true;
    netAdopt(room);
    for (const e of fresh) if (e.t !== 'shot' && e.t !== 'burst') netEvent(e);
    return;
  }
  NET.queue.push(...fresh);
  if (NET.queue.length || NET.volley) {
    NET.pendingRoom = room;
    NET.myTurn = false;
    G.phase = 'think';
    return;
  }
  netAdopt(room);
}
function netAdopt(room) {
  NET.seats = room.seats || [];
  if (room.map !== undefined) {
    NET.map = room.map;
    NET.mapName = room.mapName || 'Random hills';
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
  const aiming = sameRound && room.phase === 'play' && room.turn === NET.seat;
  G.tanks = (room.tanks || []).map(t => {
    const mine = t.seat === NET.seat;
    const was = before.get(t.seat);
    const seat = NET.seats[t.seat];
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
      // Keep the drawn aim where it was so the new one glides in.
      showA: was && !mine ? shownAngle(was) : undefined,
      showP: was && !mine ? shownPower(was) : undefined,
    };
  });
  G.turn = Math.max(0, G.tanks.findIndex(t => t.seat === room.turn));
  const mine = myTank();
  NET.myTurn = room.phase === 'play' && !!mine && mine.hp > 0 && room.turn === NET.seat;
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
  if (rs) rs.textContent = `Room ${NET.code} · you are ${seatName(NET.seat)} · round ${G.round}`;
  if (room.phase === 'play') {
    G.over = false;
    G.phase = NET.myTurn ? 'aim' : 'think';
    hideShop();
    if ($('end-veil')) $('end-veil').hidden = true;
    if ($('lobby-veil')) $('lobby-veil').hidden = true;
    if (NET.lastPhase !== 'play' || room.round !== NET.lastRound) {
      // A started match takes the whole frame, same as solo: shut the menu
      // the host came through so nobody has to ESC it away mid-battle.
      if (NET.lastPhase !== 'play') closeOverlays();
      songIdx = (room.round - 1) % SONGS.length;
      startBanner(`Round ${room.round}. ${room.mapName || 'Random hills'}.`);
      say(`Round ${G.round}. Wind ${windText()}. ${NET.myTurn ? 'Your move. Aim!' : seatName(room.turn) + ' moves first.'}`, 'info');
      if (NET.myTurn) talk('tank', 'tankity tank! My hill now!', true);
    } else if (NET.myTurn && NET.lastTurn !== NET.seat) {
      say('Your move. Aim!', 'info');
    }
  } else if (room.phase === 'shop') {
    G.phase = 'shop';
    // Polls repeat the shop phase; only arriving in it shuts open panels.
    if (NET.lastPhase !== 'shop') { closePreview(); closeOverlays(); }
    renderShop();
    const veil = $('shop-veil');
    if (veil) veil.hidden = false;
    refreshNavHints();
    if (NET.lastPhase === 'play') talk('tank', 'Shopping! Then back to bam bam.', true);
  } else if (room.phase === 'over') {
    G.over = true;
    hideShop();
    netShowStandings(room);
  }
  NET.lastPhase = room.phase;
  NET.lastTurn = room.turn;
  NET.lastRound = room.round;
  render();
  renderHUD();
}
function netEvent(e) {
  if (!e || !e.t) return;
  if (e.t === 'shot' || e.t === 'burst') return; // flown by the replay
  if (e.t === 'fizzle') { say(`${seatName(e.by)} sends one into the sunset.`, 'info'); return; }
  if (e.t === 'fire') {
    if (e.seat === NET.seat) say(`You fire ${WEAPONS[G.selected] ? WEAPONS[G.selected].name : 'a shell'}.`, 'info');
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
    const victim = e.seat === NET.seat;
    const killer = e.by === NET.seat;
    if (e.direct || victim || killer) {
      say(victim
        ? `${seatName(e.by)} hits YOU for ${e.dmg}.`
        : `${seatName(e.by)} hits ${seatName(e.seat)} for ${e.dmg}${e.direct ? ' (direct!)' : ''}.`,
        victim ? 'bad' : 'info');
    }
    if (victim) {
      SFX.clank();
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
    const victim = e.seat === NET.seat;
    SFX.boom();
    say(victim
      ? (e.by === NET.seat ? 'You got yourself?! The hills are cruel.' : `${seatName(e.by)} wrecks YOU.`)
      : `${seatName(e.by)} wrecks ${seatName(e.seat)}.`,
      victim ? 'bad' : 'info');
    const vt = G.tanks.find(x => x.seat === e.seat);
    const vid = foeTalkId(vt);
    if (vid && FOE_DYING[vid]) talk(vid, FOE_DYING[vid], true);
    if (!victim && e.by === NET.seat) talk('tank', pick(TANK_HIT));
    return;
  }
  if (e.t === 'shield') {
    say(e.seat === NET.seat ? 'Your shield absorbs the hit!' : `${seatName(e.seat)}'s shield absorbs the hit!`, 'good');
    return;
  }
  if (e.t === 'laststand') {
    SFX.boom();
    say(e.seat === NET.seat ? 'Your wreck goes down glowing!' : `${seatName(e.seat)} goes down glowing!`, 'info');
    return;
  }
  if (e.t === 'oneup') {
    if (e.seat === NET.seat) {
      SFX.win();
      say(`1-UP! Extra life! (${e.lives} lives)`, 'good');
      talk('tank', 'Another life! I am basically immortal!', true);
    } else say(`${seatName(e.seat)} earns a 1-up.`, 'info');
    return;
  }
  if (e.t === 'roundwin') {
    SFX.win();
    say(`Round ${e.round} cleared. Winnings paid. Spend them.`, 'good');
    return;
  }
  if (e.t === 'eliminated') {
    if (e.seat === NET.seat) {
      SFX.lose();
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
const VOLLEY_OPENERS = new Set(['fire', 'aifire', 'auto']);
const PATH_HZ = 12; // rooms.php records a path point every 5 sim steps at 60/s
function netParsePath(str) {
  return String(str || '').split(' ').filter(Boolean).map(p => p.split(',').map(Number));
}
function netStartVolley() {
  const opener = NET.queue.shift();
  const events = [];
  while (NET.queue.length && !VOLLEY_OPENERS.has(NET.queue[0].t)) events.push(NET.queue.shift());
  const shooter = G.tanks.find(t => t.seat === opener.seat);
  const a1 = opener.a ?? (shooter ? shooter.angle : 62);
  const p1 = opener.pw ?? (shooter ? shooter.power : 55);
  const x1 = opener.x ?? (shooter ? shooter.x : 0);
  const swing = shooter ? Math.max(Math.abs(a1 - shooter.angle), Math.abs(p1 - shooter.power), Math.abs(x1 - shooter.x)) : 0;
  NET.volley = {
    opener, events, shooter, tau: 0,
    a0: shooter ? shooter.angle : a1, p0: shooter ? shooter.power : p1, x0: shooter ? shooter.x : x1, a1, p1, x1,
    aimDur: swing < 1 ? 0.15 : clamp(0.45 + swing / 110, 0.5, 1.4),
    shots: [], end: Math.max(0, ...events.map(e => e.t1 ?? e.at ?? 0)) + 0.6,
  };
  netEvent(opener);
}
function netCarve(x, y, r) {
  const x0 = Math.max(0, Math.floor(x - r)), x1 = Math.min(W - 1, Math.ceil(x + r));
  for (let ix = x0; ix <= x1; ix++) {
    const dx = ix - x;
    const cut = Math.sqrt(Math.max(0, r * r - dx * dx)) * 0.75;
    G.terrain[ix] = Math.min(H - 4, Math.max(G.terrain[ix], y + cut));
  }
}
function netBlast(x, y, r, wkey) {
  SFX.boom();
  G.shake = Math.min(1, G.shake + (wkey === 'nuke' ? 0.9 : r > 40 ? 0.5 : 0.3));
  burst(x, y, wkey === 'nuke' ? '#ff6b6b' : '#ffd75e');
  G.booms.push({ x, y, r, t: 0, life: wkey === 'nuke' ? 0.8 : 0.5 });
  netCarve(x, y, r);
}
function netStepVolley(dt) {
  const v = NET.volley;
  v.tau += dt;
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
      v.shots.push({ e, pts: netParsePath(e.p), landed: false });
      SFX.launch();
    } else if (e.t === 'burst') {
      netBlast(e.x, e.y, e.r, e.w);
    } else {
      if (e.t === 'hit') {
        const t = G.tanks.find(x => x.seat === e.seat);
        if (t) t.hp = Math.max(0, t.hp - e.dmg);
      } else if (e.t === 'kill') {
        const t = G.tanks.find(x => x.seat === e.seat);
        if (t) t.hp = 0;
      }
      netEvent(e);
    }
  }
  for (const s of v.shots) {
    if (!s.landed && ft >= s.e.t1) {
      s.landed = true;
      if (s.e.r > 0) netBlast(s.e.x1, s.e.y1, s.e.r, s.e.w);
    }
  }
  if (ft >= v.end && v.events.every(e => e.done || e.at === undefined) && v.shots.every(s => s.landed)) {
    for (const e of v.events) if (!e.done) netEvent(e);
    NET.volley = null;
  }
}
/* Drive the replay; once nothing is left to play, the waiting room state
   takes over. */
function netReplay(dt) {
  if (NET.volley) netStepVolley(dt);
  while (!NET.volley && NET.queue.length) {
    if (VOLLEY_OPENERS.has(NET.queue[0].t)) netStartVolley();
    else netEvent(NET.queue.shift());
  }
  if (!NET.volley && !NET.queue.length && NET.pendingRoom) {
    const room = NET.pendingRoom;
    NET.pendingRoom = null;
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
    if (!G.dlgQ.length && G.dlgT <= 0 && NET.myTurn) {
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
  if (t && t.hp > 0 && NET.myTurn) {
    const swing = (keysDown.barrelLeft ? 1 : 0) - (keysDown.barrelRight ? 1 : 0);
    if (swing) { t.angle = clamp(t.angle + swing * facing(t) * 42 * dt, 10, 170); NET.aimDirty = true; }
    if (keysDown.powerUp) { t.power = clamp(t.power + 45 * dt, 10, 100); NET.aimDirty = true; }
    if (keysDown.powerDown) { t.power = clamp(t.power - 45 * dt, 10, 100); NET.aimDirty = true; }
    if (!keysDown.barrelLeft && !keysDown.barrelRight && !keysDown.powerUp && !keysDown.powerDown && NET.aimDirty) netSendAim();
    if ((keysDown.driveLeft || keysDown.driveRight) && t.fuel > 0) {
      const dir = (keysDown.driveRight ? 1 : 0) - (keysDown.driveLeft ? 1 : 0);
      NET.driveAcc += dir * TUNE.driveSpeed * dt;
      NET.driveT += dt;
      if (NET.driveT >= 0.22 && Math.abs(NET.driveAcc) >= 4) {
        const dx = clamp(NET.driveAcc, -80, 80);
        NET.driveAcc = 0;
        NET.driveT = 0;
        netSendDrive(dx);
      }
    } else {
      NET.driveAcc = 0;
      NET.driveT = 0;
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
      NET.myTurn ? 'YOU. Aim!' : `${seatName(turnTank.seat)} aiming...`;
  }
  if ($('hud-angle')) $('hud-angle').textContent = mine ? `${Math.round(mine.angle)}°` : '-';
  if ($('hud-power')) $('hud-power').textContent = mine ? `${Math.round(mine.power)}` : '-';
  if ($('hud-wind')) $('hud-wind').textContent = windText();
  renderLoadout();
  renderStanding(mine, G.tanks.filter(x => !x.isPlayer).map(x => `${seatName(x.seat)}:${Math.max(0, Math.round(x.hp))}`).join(' '));
  if ($('hud-fuel')) $('hud-fuel').textContent = mine ? `${Math.round(mine.fuel)}` : '-';
}
function netShowStandings(room) {
  if (NET.pollId) { clearInterval(NET.pollId); NET.pollId = 0; }
  const rows = ((room && room.seats) || []).map((s, i) => ({
    name: s.human ? s.initials : (s.name + ' (AI)'),
    score: s.score || 0,
    mine: i === NET.seat,
  }));
  rows.sort((a, b) => b.score - a.score);
  const champ = rows[0];
  const kicker = $('end-kicker');
  if (kicker) kicker.textContent = `Room ${NET.code} · final standings`;
  const title = $('end-title');
  if (title) title.textContent = champ && champ.mine ? 'Top gun! The hills are yours.' : (champ ? `${champ.name} holds the hills.` : 'Match over.');
  const text = $('end-text');
  if (text) text.textContent = `The battery never quits, and neither do you. Room ${NET.code} ended on round ${room.round || '?'}.`;
  const score = $('end-score');
  if (score) {
    score.textContent = rows.map(r => `${r.name} ${r.score}${r.mine ? ' (you)' : ''}`).join(' · ') +
      (room.you ? ` · you banked $${room.you.cash || 0}` : '');
  }
  const again = $('again');
  if (again) again.textContent = 'Back to rooms';
  const rematch = $('rematch');
  if (rematch) {
    rematch.hidden = false;
    rematch.textContent = NET.map
      ? `Rematch on ${NET.mapName || 'these hills'}`
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
async function fileReport(name) {
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
/* Every binding lives in keys.json; this frozen copy keeps the exact same
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
    cycle: ['q'], guns: ['g'], tutorial: ['u'], fav: ['1', '2', '3', '4'],
    battlePreview: ['v'], fullscreen: ['f'],
    fire: ['ControlLeft', 'ControlRight', 'Control', 'Space', ' '],
    escape: ['Escape'],
  }),
  scroll: Object.freeze({
    lineDown: ['j'], lineUp: ['k'],
    pageDown: ['PageDown', 'Ctrl+F'], pageUp: ['PageUp', 'Ctrl+B'],
    halfDown: ['Ctrl+D'], halfUp: ['Ctrl+U'],
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
async function loadKeys() {
  try {
    const r = await fetch('keys.json');
    if (!r.ok) return;
    const def = await r.json();
    if (!def || !def.aim || !def.shop || !def.global || !def.scroll) return;
    KEYS = def;
    KEYMAP = buildKeymap(def);
    renderKeyHints();
    renderTutorialText();
  } catch (err) { /* the frozen fallback above stays in charge */ }
}
/* One token in, one printable cap out: arrows show as glyphs, codes shed
// their Key/Digit prefix, lone letters go uppercase, chords join with +. */
function keycap(token) {
  const glyph = { ArrowUp: '▲', ArrowDown: '▼', ArrowLeft: '◀', ArrowRight: '▶', Up: '▲', Down: '▼', Left: '◀', Right: '▶' };
  if (glyph[token]) return glyph[token];
  if (token === ' ') return 'Space';
  if (/^Ctrl\+/.test(token)) return 'Ctrl+' + keycap(token.slice(5));
  if (/^(ControlLeft|ControlRight|Control)$/.test(token)) return 'Ctrl';
  if (token === 'Escape') return 'ESC';
  if (token === 'Enter') return 'Enter';
  if (token === 'PageUp') return 'PgUp';
  if (token === 'PageDown') return 'PgDn';
  if (token === 'Shift') return 'Shift';
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
/* Fill every [data-keyhint] span at boot and again if keys.json loads late,
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
  if (e.ctrlKey) {
    const c = (e.code && m['Ctrl+' + e.code]) || (e.key && (m['Ctrl+' + e.key] || m['Ctrl+' + e.key.toLowerCase()]));
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
  ctx();
  SFX.click();
  openLobby();
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
      SFX.click();
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
    // The shop answers to its own keys from keys.json; everything else falls
    // through to the usual keys below. Qty keys pick how many packs ride on
    // every buy, capped at what the chest can cover for that row.
    if (G.phase === 'shop' && !G.over && !e.repeat) {
      const sa = lookupKey('shop', e);
      if (sa === 'selUp' || sa === 'selDown') {
        e.preventDefault();
        G.shopSel = clamp(G.shopSel + (sa === 'selUp' ? -1 : 1), 0, SHOP.length - 1);
        SFX.click();
        renderShop();
        return;
      }
      if (sa === 'qtyUp' || sa === 'qtyDown') {
        e.preventDefault();
        const it = SHOP[G.shopSel];
        if (sa === 'qtyUp') {
          const max = Math.max(1, maxPacks(it));
          if (G.shopQty < max) { G.shopQty++; SFX.click(); }
          else SFX.thud();
        } else if (G.shopQty > 1) {
          G.shopQty--;
          SFX.click();
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
        else if (!closeOverlays()) nextRound();
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
      ctx(); startMusic();
      return;
    }
    // Fire stays a special tap with its own repeat guard, but its keys come
    // from the same file as everything else.
    if (lookupKey('global', e) === 'fire') {
      e.preventDefault();
      if (!e.repeat) { ctx(); startMusic(); playerFire(); }
      return;
    }
    if (e.repeat) return;
    const k = e.key || '';
    const ga = lookupKey('global', e);
    switch (ga) {
    case 'music': toggleMusic(); return;
    case 'sound': toggleSound(); return;
    case 'log': toggleOverlay('log-overlay', 'btn-log'); return;
    case 'help': toggleOverlay('help-overlay', 'btn-help'); return;
    case 'report': toggleOverlay('report-overlay', 'btn-report'); return;
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
    // Digits pick a favorite shell; hold Shift to pin the loaded one there.
    case 'fav':
      if (G.phase === 'aim') {
        const i = +k - 1;
        if (e.shiftKey) {
          G.favs[i] = G.selected;
          SFX.click();
          say(`Slot ${k} now holds ${WEAPONS[G.selected].name}.`, 'info');
          renderHUD();
        } else {
          selectWeapon(G.favs[i]);
        }
      }
      return;
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
  SFX.click();
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
  SFX.click();
  renderGuns();
}
function cycleWeapon() {
  if (G.over || G.phase === 'shop') return;
  if (NET.on) { netCycle(); return; }
  if (demoBlock()) return;
  const i = WORDER.indexOf(G.selected);
  for (let k = 1; k <= WORDER.length; k++) {
    const w = WORDER[(i + k) % WORDER.length];
    if (w === 'shell' || (G.ammo[w] || 0) > 0) {
      G.selected = w;
      SFX.click();
      say(`Loaded: ${WEAPONS[w].name}.`, 'info');
      renderHUD();
      return;
    }
  }
}
function holdButton(id, act) {
  const btn = $(id);
  if (!btn) return;
  const on = ev => { ev.preventDefault(); keysDown[act] = true; ctx(); startMusic(); };
  const off = () => { delete keysDown[act]; };
  btn.addEventListener('pointerdown', on);
  btn.addEventListener('pointerup', off);
  btn.addEventListener('pointerleave', off);
  btn.addEventListener('click', ev => ev.currentTarget.blur());
}
function init() {
  if (TOUCH) document.documentElement.classList.add('touch');
  bindKeys();
  loadArsenal();
  loadKeys();
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
    const on = ev => { ev.preventDefault(); keysDown[act] = true; ctx(); startMusic(); };
    const off = () => { delete keysDown[act]; };
    btn.addEventListener('pointerdown', on);
    btn.addEventListener('pointerup', off);
    btn.addEventListener('pointerleave', off);
    btn.addEventListener('click', ev => ev.currentTarget.blur());
  });
  const cannon = $('btn-cannon');
  if (cannon) cannon.addEventListener('click', ev => { ev.currentTarget.blur(); ctx(); startMusic(); playerFire(); });
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
    if (NET.on) { netLeave(); return; }
    SFX.click();
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
    ctx(); SFX.click();
    freshMatchFromSeedBox();
  });
  const soundBtn = $('btn-sound');
  if (soundBtn) soundBtn.addEventListener('click', ev => { ev.currentTarget.blur(); toggleSound(); });
  const musicBtn = $('btn-music');
  if (musicBtn) musicBtn.addEventListener('click', ev => { ev.currentTarget.blur(); toggleMusic(); });
  for (const [btnId, ovId] of [['btn-log', 'log-overlay'], ['btn-help', 'help-overlay'], ['btn-report', 'report-overlay']]) {
    const b = $(btnId);
    if (b) b.addEventListener('click', ev => { ev.currentTarget.blur(); toggleOverlay(ovId, btnId); });
  }
  const menuBtn = $('btn-menu');
  if (menuBtn) menuBtn.addEventListener('click', ev => { ev.currentTarget.blur(); toggleOverlay('menu-overlay', 'btn-menu'); });
  for (const [closeId, ovId, btnId] of [['log-close', 'log-overlay', 'btn-log'], ['help-close', 'help-overlay', 'btn-help'], ['report-close', 'report-overlay', 'btn-report'], ['menu-close', 'menu-overlay', 'btn-menu']]) {
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
    if (NET.on) { netLeave(); openLobby(); } else freshMatchFromSeedBox();
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
  if (tutOpen) tutOpen.addEventListener('click', ev => { ev.currentTarget.blur(); SFX.click(); tutorialOpen(); });
  const tutSkip = $('tutorial-skip');
  if (tutSkip) tutSkip.addEventListener('click', ev => { ev.currentTarget.blur(); skipTutorial(); });
  const hostForm = $('host-form');
  if (hostForm) hostForm.addEventListener('submit', e => {
    e.preventDefault();
    const v = netValidInitials($('host-initials') ? $('host-initials').value : '');
    if (!v) { lobbySay('Initials need exactly 3 letters, and keep them clean.'); return; }
    const mapSel = $('lobby-map');
    ctx(); SFX.click();
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
    ctx(); SFX.click();
    joinRoom(code, v);
  });
  const lobbyStart = $('lobby-start');
  if (lobbyStart) lobbyStart.addEventListener('click', ev => { ev.currentTarget.blur(); SFX.click(); startRoom(); });
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
    SFX.click();
    netRematch();
  });
  const shopNext = $('shop-next');
  if (shopNext) shopNext.addEventListener('click', ev => { ev.currentTarget.blur(); nextRound(); });
  const pvClose = $('preview-close');
  if (pvClose) pvClose.addEventListener('click', ev => { ev.currentTarget.blur(); closePreview(); });
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
  const kickAudio = () => { ctx(); if (!musicMuted && !musicOn) startMusic(); };
  window.addEventListener('pointerdown', kickAudio, true);
  window.addEventListener('keydown', kickAudio, true);
  window.addEventListener('pagehide', netSendLeave);
  window.addEventListener('resize', refreshNavHints);
  window.addEventListener('resize', placeLogBelowMenu);
  placeLogBelowMenu();
  requestAnimationFrame(frame);
}
/* The log hangs just under the menu strip, whose height changes with the
   frame width, so it never covers the battle buttons. */
function placeLogBelowMenu() {
  G.windTop = windGaugeTop();
  const bar = $('menubar');
  const log = $('log-overlay');
  if (!bar || !log || !bar.offsetHeight) return;
  log.style.top = `${bar.offsetTop + bar.offsetHeight + 6}px`;
}
function toggleSound() {
  soundMuted = !soundMuted;
  const btn = $('btn-sound');
  if (btn) btn.setAttribute('aria-pressed', String(!soundMuted));
  if (!soundMuted) ctx();
}
function toggleMusic() {
  musicMuted = !musicMuted;
  const btn = $('btn-music');
  if (btn) btn.setAttribute('aria-pressed', String(!musicMuted));
  if (musicMuted) stopMusic();
  else startMusic();
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
      ['report-overlay', 'btn-report'], ['menu-overlay', 'btn-menu']]) {
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
  if (TUT || NET.on) return;
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
  SFX.click();
  say(TOUCH ? 'Tutorial skipped. Replay it from the menu any time.' : `Tutorial skipped. Press ${keyHint('global', 'tutorial')} any time to replay it.`, 'info');
  endTutorial(true);
}
function tickTutorial() {
  if (!TUT || G.demo || G.over || !G.tanks.length) return;
  if (TUT.step < TUT_STEPS.length && TUT_STEPS[TUT.step].done(me())) {
    TUT.step++;
    SFX.click();
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
})();





