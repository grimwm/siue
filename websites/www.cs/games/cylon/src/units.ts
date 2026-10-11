/* Cylon Defense: the drones, the missiles and the mid-run nuke.
 *
 * The things that fight the player, from spawn to removal: a drone appears
 * (from beyond the playfield, or from behind the page's text), marches onto a
 * clear spot, shoots bolts at the cursor on a timer, and is knocked out by a
 * click, a grenade or the Raptor; a missile leaves the top of the viewport and
 * flies to a fixed lock or seeks the cursor; the nuke flies from the eye to the
 * cursor and detonates. Each lifecycle keeps its own timers and animation
 * frames, and each hit calls back into the hull and the kill count.
 *
 * What the game's other parts own comes in as arguments: the live record, the
 * settings and the cursor, the sound, the terrain holes, the landscape writers
 * and the hull (registerHit). When the next missile or nuke launches is the
 * run clock's business (cylon.js); this module launches one when asked.
 * Browser-only: it compiles in the DOM program. */
import type { AimPoint, Bot, Game, Missile, Mouse, PlayfieldApi, RulesApi, Settings, StateApi, Timer } from './types.js';
import type { Abilities } from './abilities.js';
import type { CylonAudio } from './audio.js';
import type { Debris, Holes, HolePreset } from './field.js';
import type { Intro } from './intro.js';
import type { LandscapeOptions } from './landscape.js';
import type { Rect, Size, Spot } from './playfield.js';

export interface UnitsDeps {
  game: Game;
  settings: Settings;
  mouse: Mouse;
  lastAim: AimPoint;
  state: StateApi;
  rules: RulesApi;
  playfield: PlayfieldApi;
  /** The battlefield the drones, bolts and blasts are appended to. */
  field: HTMLElement;
  /** Behind the page's text: the drones that hide there before they rise. */
  ambushUnder: HTMLElement | null;
  /** The missile in mount.html, which the launcher keeps clear. */
  missileEl: HTMLElement | null;
  nukeEl: HTMLElement | null;
  nukeMissileEl: HTMLElement | null;
  scoreEl: HTMLElement | null;
  audio: CylonAudio;
  intro: Intro;
  abilities: Abilities;
  holes: Holes;
  debris: Debris;
  punchHole: Holes['punch'];
  HOLE_PRESETS: { small: HolePreset; medium: HolePreset; large: HolePreset };
  isGameLive: () => boolean;
  isEyeDisoriented: () => boolean;
  eyeClientCenter: () => { x: number; y: number };
  syncMousePageFromClient: () => void;
  rearrangeLandscape: (clientX: number, clientY: number, scale?: number, opts?: LandscapeOptions) => void;
  rearrangeLandscapePage: (pageX: number, pageY: number, scale?: number, opts?: LandscapeOptions) => void;
  disruptGlyphs: (pageX: number, pageY: number, scale?: number, radiusOverride?: number | null) => void;
  randRange: (min: number, max: number) => number;
  /** A drone or missile hit the player: `count` hull points. */
  registerHit: (count?: number, opts?: { fromNuke?: boolean }) => void;
  resizeBattlefield: () => void;
  scrollX: () => number;
  scrollY: () => number;
  /** How many drones may be up at once on this device. */
  BOT_HARD_CAP: number;
  BOT_SIZE: Size;
  LINK_PAD: number;
  HIT_RADIUS: number;
  BOLT_HIT_RADIUS: number;
  NUKE_DIRECT_HIT_RADIUS: number;
  /** The nuke's speed in px per second, the distance that counts as arrived, and the longest flight. */
  NUKE_SPEED: number;
  NUKE_ARRIVE_RADIUS: number;
  NUKE_MAX_FLIGHT_MS: number;
  MISSILE_SPEED: number;
  MISSILE_ARRIVE: number;
  MISSILE_MAX_FLIGHT_MS: number;
  MISSILE_BLAST_RADIUS: number;
  /** How much of the landscape a robot bolt, or an inbound missile, chews. */
  SMALL_WEAPON_SCALE: number;
  MISSILE_WEAPON_SCALE: number;
}

export interface Units {
  /** Every drone, hidden or up. */
  allBots(): Bot[];
  knockOutBot(bot: Bot): void;
  /** Removes every drone, bolt, impact and hole, and zeroes the count. */
  clearAllBots(): void;
  /** The Raptor's strike: every drone is knocked out in turn, and the bolts in the air vanish. */
  wipeAllBotsWithScore(): void;
  /** Pulls drones that stand outside the visible playfield back into it. */
  herdBotsIntoView(): void;
  /** Arms the wave timer, which launches waves of drones until the game stops. */
  scheduleAmbush(first?: boolean): void;
  /** A click on empty space sparks an impact. */
  bindPlayerMissShots(): void;
  /** Whether another missile of that kind may be in the air (a tracker, or a ground missile). */
  canLaunchMissile(asTracker: boolean): boolean;
  launchSmallMissile(opts?: { forceTracker?: boolean; forceGround?: boolean; fromPair?: boolean }): boolean;
  /** Removes every missile in the air, and the timers that would launch more. */
  clearActiveMissiles(): void;
  /** Launches the mid-run nuke from the eye. */
  launchNuke(): void;
  /** The nuke's blast, at a viewport position (also the intro's). */
  detonateNukeAt(clientX: number, clientY: number, opts?: { dealDamage?: boolean; shake?: boolean }): void;
}

export function createUnits(d: UnitsDeps): Units {
  const { game, settings, mouse, lastAim, state, rules, playfield, field, ambushUnder, missileEl, nukeEl, nukeMissileEl,
    scoreEl, audio, intro, abilities, holes, debris, punchHole, HOLE_PRESETS, isGameLive, isEyeDisoriented,
    eyeClientCenter, syncMousePageFromClient, rearrangeLandscape, rearrangeLandscapePage, disruptGlyphs, randRange,
    registerHit, resizeBattlefield, scrollX, scrollY, BOT_HARD_CAP, BOT_SIZE, LINK_PAD, HIT_RADIUS, BOLT_HIT_RADIUS,
    NUKE_DIRECT_HIT_RADIUS, NUKE_SPEED, NUKE_ARRIVE_RADIUS, NUKE_MAX_FLIGHT_MS, MISSILE_SPEED, MISSILE_ARRIVE,
    MISSILE_MAX_FLIGHT_MS, MISSILE_BLAST_RADIUS, SMALL_WEAPON_SCALE, MISSILE_WEAPON_SCALE } = d;

  let activeBots = 0;
  let ambushTimer: Timer | null = null;
  let activeMissiles: Missile[] = [];
  let trackerPairTimer: Timer | null = null;
  let groundVolleyTimers: Timer[] = [];

  function docSize() {
    const el = document.documentElement;
    // Width: viewport only. Height: in-flow body content (not absolute battlefield).
    return {
      w: el.clientWidth,
      h: Math.max(document.body.offsetHeight, el.clientHeight)
    };
  }

  function allBots(): Bot[] {
    const under = ambushUnder ? [...ambushUnder.querySelectorAll<Bot>('.cylon-bot')] : [];
    const top = field ? [...field.querySelectorAll<Bot>('.cylon-bot')] : [];
    return under.concat(top);
  }

  function killLevel() {
    return rules.killLevel(game.run.koScore);
  }

  function groundMissileCap() {
    return rules.groundMissileCap(game.run.koScore);
  }

  function trackerMissileCap() {
    return rules.trackerMissileCap(game.run.koScore);
  }

  function trackerMissileChance() {
    return rules.trackerMissileChance(game.run.koScore);
  }

  function countActiveMissiles(trackerOnly: boolean | null = null): number {
    return activeMissiles.filter((m) => {
      if (!m.alive) return false;
      if (trackerOnly == null) return true;
      return m.tracker === trackerOnly;
    }).length;
  }

  function canLaunchMissile(asTracker: boolean): boolean {
    if (asTracker) return countActiveMissiles(true) < trackerMissileCap();
    return countActiveMissiles(false) < groundMissileCap();
  }

  function clearGroundVolleyTimers() {
    groundVolleyTimers.forEach((id) => clearTimeout(id));
    groundVolleyTimers = [];
  }

  function clearActiveMissiles() {
    clearTimeout(trackerPairTimer!);
    trackerPairTimer = null;
    clearGroundVolleyTimers();
    activeMissiles.forEach((m) => {
      m.alive = false;
      m.el.remove();
    });
    activeMissiles = [];
    if (missileEl) missileEl.classList.remove('is-flying', 'is-tracker');
  }

  /** Top-of-viewport launch X, biased away from other live missiles. */
  function pickMissileLaunchOrigin() {
    const vw = window.innerWidth || 800;
    const margin = Math.max(24, Math.min(56, vw * 0.04));
    const usable = Math.max(80, vw - margin * 2);
    const topY = 8 + Math.random() * 22;
    const alive = activeMissiles.filter((m) => m.alive);
    const avoidXs = alive.map((m) => {
      const live = parseFloat(m.el.style.left);
      return Number.isFinite(live) ? live : (m.originX || vw / 2);
    });

    // Dense lane samples across the top so volleys can fan out
    const lanes = 12;
    const candidates: number[] = [];
    for (let i = 0; i < lanes; i++) {
      candidates.push(margin + ((i + 0.5) / lanes) * usable);
    }
    candidates.push(margin + Math.random() * usable);
    candidates.push(margin + Math.random() * usable);
    candidates.push(margin + Math.random() * usable);

    // Solo launches: sometimes still drop near the eye for flavor
    if (!avoidXs.length && Math.random() < 0.28) {
      const eye = eyeClientCenter();
      return {
        x: Math.min(vw - margin, Math.max(margin, eye.x + (Math.random() - 0.5) * 64)),
        y: Math.min(topY + 18, Math.max(6, eye.y - 36))
      };
    }

    let bestX = candidates[0]!;
    let bestScore = -Infinity;
    for (const cx of candidates) {
      let score: number;
      if (!avoidXs.length) {
        // Prefer edges a bit so the first shot isn't always center
        const edgeBias = Math.abs(cx - vw / 2) / (vw / 2);
        score = edgeBias * 40 + Math.random() * 80;
      } else {
        // Maximize clearance from every live missile (origins + current X)
        let minDist = Infinity;
        for (const ox of avoidXs) {
          minDist = Math.min(minDist, Math.abs(cx - ox));
        }
        // Extra weight when several are already up — force spread
        score = minDist * (1 + avoidXs.length * 0.35) + Math.random() * 36;
      }
      if (score > bestScore) {
        bestScore = score;
        bestX = cx;
      }
    }

    return { x: bestX, y: topY };
  }

  function detonateSmallMissileAt(missile: Missile | null, clientX: number, clientY: number): void {
    if (missile) {
      missile.alive = false;
      missile.el.remove();
      activeMissiles = activeMissiles.filter((m) => m !== missile && m.alive);
    }
    const pageX = clientX + window.scrollX;
    const pageY = clientY + window.scrollY;
    audio.sfx('ko');
    const blast = document.createElement('div');
    blast.className = 'cylon-missile-blast';
    blast.style.left = `${pageX}px`;
    blast.style.top = `${pageY}px`;
    blast.setAttribute('aria-hidden', 'true');
    field.appendChild(blast);
    setTimeout(() => blast.remove(), 420);
    punchHole(pageX, pageY, HOLE_PRESETS.small);
    // Local letter AoE sized to the missile blast — not a global rearrange
    rearrangeLandscapePage(pageX, pageY, MISSILE_WEAPON_SCALE);
    syncMousePageFromClient();
    const miss = Math.hypot(mouse.clientX - clientX, mouse.clientY - clientY);
    if (miss <= MISSILE_BLAST_RADIUS) {
      registerHit(2);
    }
  }

  function launchSmallMissile(
    { forceTracker = false, forceGround = false, fromPair = false }: { forceTracker?: boolean; forceGround?: boolean; fromPair?: boolean } = {},
  ): boolean {
    if (!isGameLive() || isEyeDisoriented()) return false;

    // Trackers may fly alongside ground missiles; cap rises on the 5-KO ladder
    let tracker = false;
    if (forceGround) {
      if (!canLaunchMissile(false)) return false;
    } else if (forceTracker) {
      tracker = canLaunchMissile(true);
      if (!tracker) return false;
    } else {
      tracker = Math.random() < trackerMissileChance() && canLaunchMissile(true);
      if (!tracker && !canLaunchMissile(false)) return false;
    }

    const aimFresh = performance.now() - lastAim.t < 4000;
    let lockX = aimFresh ? lastAim.clientX : mouse.clientX;
    let lockY = aimFresh ? lastAim.clientY : mouse.clientY;

    const el = document.createElement('div');
    el.className = 'cylon-small-missile is-flying' + (tracker ? ' is-tracker' : '');
    el.setAttribute('aria-hidden', 'true');
    document.body.appendChild(el);

    const origin = pickMissileLaunchOrigin();
    let x = origin.x;
    let y = origin.y;
    const missile = { el, tracker, alive: true, originX: x };
    activeMissiles.push(missile);

    let started = performance.now();
    let last = started;

    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    audio.prime();
    audio.sfx(tracker ? 'trackerMissile' : 'missile');

    const tick = (now: number): void => {
      if (!missile.alive) return;
      if (game.paused || !settings.gameEnabled || game.run.gameOver) {
        started += now - last;
        last = now;
        requestAnimationFrame(tick);
        return;
      }
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const tx = tracker ? mouse.clientX : lockX;
      const ty = tracker ? mouse.clientY : lockY;
      const dx = tx - x;
      const dy = ty - y;
      const dist = Math.hypot(dx, dy) || 1;
      const step = MISSILE_SPEED * dt;
      x += (dx / dist) * Math.min(step, dist);
      y += (dy / dist) * Math.min(step, dist);
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      el.style.transform = `rotate(${Math.atan2(dy, dx) * (180 / Math.PI)}deg)`;
      if (dist <= MISSILE_ARRIVE || now - started >= MISSILE_MAX_FLIGHT_MS) {
        detonateSmallMissileAt(missile, x, y);
        return;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    // Pair a second tracker only once the 5-KO ladder allows 2+ seekers
    if (tracker && !fromPair && trackerMissileCap() >= 2 && canLaunchMissile(true) && Math.random() < 0.45) {
      clearTimeout(trackerPairTimer!);
      trackerPairTimer = setTimeout(() => {
        trackerPairTimer = null;
        if (!isGameLive() || game.paused || isEyeDisoriented()) return;
        launchSmallMissile({ forceTracker: true, fromPair: true });
      }, 280 + Math.random() * 320);
    }

    // Static volleys from other top lanes — extras unlock every couple of kill levels
    if (!tracker && !fromPair && !forceGround) {
      const lvl = killLevel();
      const room = groundMissileCap() - countActiveMissiles(false);
      const maxExtra = Math.min(room, lvl < 2 ? 0 : lvl < 5 ? 1 : 2);
      if (maxExtra > 0 && Math.random() < 0.35 + Math.min(0.4, lvl * 0.04)) {
        const extras = 1 + (maxExtra > 1 && Math.random() < 0.3 + Math.min(0.35, lvl * 0.03) ? 1 : 0);
        for (let i = 0; i < Math.min(extras, maxExtra); i++) {
          const delay = 90 + i * (140 + Math.random() * 160);
          const id = setTimeout(() => {
            groundVolleyTimers = groundVolleyTimers.filter((t) => t !== id);
            if (!isGameLive() || game.paused || isEyeDisoriented()) return;
            launchSmallMissile({ forceGround: true, fromPair: true });
          }, delay);
          groundVolleyTimers.push(id);
        }
      }
    }
    return true;
  }

  function inflate(rect: Rect, pad: number): Rect {
    return playfield.inflate(rect, pad);
  }

  function toPageRect(domRect: DOMRect): Rect {
    return {
      left: domRect.left + scrollX(),
      top: domRect.top + scrollY(),
      right: domRect.right + scrollX(),
      bottom: domRect.bottom + scrollY()
    };
  }

  function getForbiddenRects() {
    const nodes = document.querySelectorAll(
      'a, button, input, select, textarea, label, summary, [role="link"], [role="button"]'
    );
    const rects: Rect[] = [];
    nodes.forEach((node) => {
      if (node.closest('.cylon-battlefield')
        || node.classList.contains('cylon-bot')
        || node.closest('#cylon-reticle')) return;
      if (node.closest('.cylon-settings')) return;
      const r = node.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return;
      rects.push(inflate(toPageRect(r), LINK_PAD));
    });
    return rects;
  }

  /** Page-coord box bots should live in so they stay tappable on screen. */
  function visiblePlayfieldBounds() {
    const nav = document.querySelector('.site-nav');
    return playfield.visibleBounds({
      scrollX: scrollX(),
      scrollY: scrollY(),
      width: document.documentElement.clientWidth || window.innerWidth || 1,
      height: window.innerHeight || 1,
      navBottom: nav ? nav.getBoundingClientRect().bottom : 70,
    }, BOT_SIZE);
  }

  function clampToVisiblePlayfield(x: number, y: number) {
    return playfield.clampToBounds(visiblePlayfieldBounds(), x, y);
  }

  function isInVisiblePlayfield(x: number, y: number): boolean {
    return playfield.isInBounds(visiblePlayfieldBounds(), x, y);
  }

  function isSafePageSpot(x: number, y: number, forbidden: readonly Rect[]): boolean {
    return playfield.isSafeSpot(x, y, forbidden, docSize(), BOT_SIZE);
  }

  function findSafeSpot(nearBot?: HTMLElement) {
    const near = nearBot
      ? { x: parseFloat(nearBot.style.left) || 0, y: parseFloat(nearBot.style.top) || 0 }
      : null;
    return playfield.findSafeSpot({
      bounds: visiblePlayfieldBounds(),
      forbidden: getForbiddenRects(),
      doc: docSize(),
      bot: BOT_SIZE,
    }, near, Math.random);
  }

  function fireBolt(fromX: number, fromY: number, toX: number, toY: number): void {
    audio.sfx('projectile');
    const bolt = document.createElement('div');
    bolt.className = 'cylon-bolt';
    bolt.setAttribute('aria-hidden', 'true');
    const dx = toX - fromX;
    const dy = toY - fromY;
    const dist = Math.hypot(dx, dy) || 1;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    bolt.style.left = `${fromX}px`;
    bolt.style.top = `${fromY}px`;
    bolt.style.width = `${Math.min(dist, 28)}px`;
    bolt.style.transform = `rotate(${angle}deg)`;
    field.appendChild(bolt);

    const durationMs = Math.min(0.55, 0.18 + dist / 1800) * 1000;
    let started = performance.now();
    let lastTick = started;
    let settled = false;

    const finishBolt = (x: number, y: number, { struck = false }: { struck?: boolean } = {}): void => {
      if (settled) return;
      settled = true;
      bolt.remove();
      spawnShotImpact(x, y, { sound: false });
      if (struck) registerHit();
    };

    const anim = bolt.animate(
      [
        { left: `${fromX}px`, top: `${fromY}px`, opacity: 1, width: '14px' },
        { left: `${toX}px`, top: `${toY}px`, opacity: 0.85, width: '22px' }
      ],
      { duration: durationMs, easing: 'linear', fill: 'forwards' }
    );

    // Hit if the player crosses the bolt's path while it flies — not only at impact
    const tick = (now: number): void => {
      if (settled) return;
      if (!settings.gameEnabled || game.run.gameOver) {
        try { anim.cancel(); } catch (_) { /* ignore */ }
        finishBolt(toX, toY, { struck: false });
        return;
      }
      if (game.paused) {
        started += now - lastTick;
        lastTick = now;
        try { anim.pause(); } catch (_) { /* ignore */ }
        requestAnimationFrame(tick);
        return;
      }
      try { if (anim.playState === 'paused') anim.play(); } catch (_) { /* ignore */ }
      lastTick = now;
      const t = Math.min(1, (now - started) / durationMs);
      const x = fromX + (toX - fromX) * t;
      const y = fromY + (toY - fromY) * t;
      syncMousePageFromClient();
      if (Math.hypot(mouse.pageX - x, mouse.pageY - y) <= BOLT_HIT_RADIUS) {
        try { anim.cancel(); } catch (_) { /* ignore */ }
        finishBolt(x, y, { struck: true });
        return;
      }
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    anim.onfinish = () => {
      if (settled) return;
      syncMousePageFromClient();
      const struck = Math.hypot(mouse.pageX - toX, mouse.pageY - toY) <= HIT_RADIUS;
      finishBolt(toX, toY, { struck });
    };
  }

  /** Impact flash + scorched hole — used for player hits, misses, and inbound bolts. */
  function spawnShotImpact(pageX: number, pageY: number, { sound = true }: { sound?: boolean } = {}): void {
    if (!field) return;
    if (sound && settings.soundEnabled) {
      audio.prime();
      audio.sfx('projectile');
    }
    const impact = document.createElement('div');
    impact.className = 'cylon-impact';
    impact.style.left = `${pageX}px`;
    impact.style.top = `${pageY}px`;
    impact.setAttribute('aria-hidden', 'true');
    field.appendChild(impact);
    punchHole(pageX, pageY, HOLE_PRESETS.small);
    rearrangeLandscapePage(pageX, pageY, SMALL_WEAPON_SCALE);
    setTimeout(() => impact.remove(), 300);
  }

  function isPlayerShotUiTarget(el: Element | null): boolean {
    if (!el || !el.closest) return true;
    return !!(el.closest('.site-nav')
      || el.closest('.cylon-help')
      || el.closest('.cylon-gameover')
      || el.closest('.cylon-settings-panel')
      || el.closest('.cylon-bot')
      || el.closest('#cylon-reticle')
      || el.closest('#cic-enter-btn'));
  }

  /** Empty-space shots still spark so misses read as fire, not a dead click. */
  function bindPlayerMissShots() {
    window.addEventListener('pointerdown', (e) => {
      if (!isGameLive()) return;
      if (abilities.grenadeArmed()) return;
      if (intro.playing()) return;
      if (e.button != null && e.button !== 0) return;
      if (game.reticlePointerId != null && e.pointerId === game.reticlePointerId) return;
      if (isPlayerShotUiTarget(e.target as Element | null)) return;
      e.preventDefault();
      spawnShotImpact(e.pageX, e.pageY);
    });
  }

  function bumpScore() {
    game.run = state.recordKill(game.run);
    if (!scoreEl) return;
    scoreEl.textContent = String(game.run.koScore);
    scoreEl.classList.remove('is-bump');
    void scoreEl.offsetWidth;
    scoreEl.classList.add('is-bump');
    setTimeout(() => scoreEl.classList.remove('is-bump'), 180);
  }

  function clearBotTimers(bot: Bot): void {
    if (bot._shootInterval) clearInterval(bot._shootInterval);
    if (bot._patrolInterval) clearInterval(bot._patrolInterval);
    bot._shootInterval = null;
    bot._patrolInterval = null;
  }

  function knockOutBot(bot: Bot): void {
    if (bot.dataset.ko === '1') return;
    bot.dataset.ko = '1';
    bot.classList.add('is-ko');
    clearBotTimers(bot);
    audio.sfx('ko');
    const kx = (parseFloat(bot.style.left) || 0) + BOT_SIZE.w / 2;
    const ky = (parseFloat(bot.style.top) || 0) + BOT_SIZE.h / 2;
    spawnShotImpact(kx, ky, { sound: false });
    bumpScore();
    activeBots = Math.max(0, activeBots - 1);
    setTimeout(() => bot.remove(), 560);
  }

  function clearAllBots() {
    allBots().forEach((bot) => {
      clearBotTimers(bot);
      bot.remove();
    });
    field.querySelectorAll('.cylon-bolt, .cylon-impact').forEach((el) => el.remove());
    holes.clearAll();
    activeBots = 0;
  }

  function wipeAllBotsWithScore() {
    const bots = allBots();
    bots.forEach((bot, i) => {
      setTimeout(() => {
        if (bot.isConnected && bot.dataset.ko !== '1') knockOutBot(bot);
      }, i * 70);
    });
    field.querySelectorAll('.cylon-bolt').forEach((el) => el.remove());
  }

  function marchOrigin(spot: Spot) {
    // Enter from just outside the visible playfield, then march onto it
    return playfield.marchOrigin(visiblePlayfieldBounds(), spot, BOT_SIZE);
  }

  function ensureClearOfLinks(bot: Bot): boolean {
    const forbidden = getForbiddenRects();
    let x = parseFloat(bot.style.left) || 0;
    let y = parseFloat(bot.style.top) || 0;
    if (!isInVisiblePlayfield(x, y) || !isSafePageSpot(x, y, forbidden)) {
      const safer = findSafeSpot(bot);
      if (!safer) return false;
      bot.style.left = `${safer.x}px`;
      bot.style.top = `${safer.y}px`;
      return true;
    }
    return true;
  }

  function moveBot(bot: Bot): void {
    if (!isGameLive() || bot.dataset.ko === '1' || !bot.isConnected || bot.classList.contains('is-marching')) return;
    const spot = findSafeSpot(bot);
    if (!spot) return;
    const dest = clampToVisiblePlayfield(spot.x, spot.y);
    bot.classList.add('is-marching');
    bot.style.left = `${dest.x}px`;
    bot.style.top = `${dest.y}px`;
    setTimeout(() => {
      if (!bot.isConnected || bot.dataset.ko === '1') return;
      bot.classList.remove('is-marching');
      ensureClearOfLinks(bot);
    }, 920);
  }

  function herdBotsIntoView() {
    if (!isGameLive()) return;
    allBots().forEach((bot) => {
      if (bot.dataset.ko === '1' || !bot.isConnected) return;
      if (bot.classList.contains('is-hiding')) return;
      const x = parseFloat(bot.style.left) || 0;
      const y = parseFloat(bot.style.top) || 0;
      if (!isInVisiblePlayfield(x, y)) moveBot(bot);
    });
  }

  function findTextAmbushSpot() {
    const panel = document.querySelector('#nav-main.is-active, #nav-contact.is-active')
      || document.getElementById('nav-main');
    if (!panel) return null;
    const nodes = [...panel.querySelectorAll('h1, h2, h3, p, li')];
    if (!nodes.length) return null;
    // Prefer nodes currently in the viewport
    const visible = nodes.filter((n) => {
      const r = n.getBoundingClientRect();
      return r.width > 8 && r.height > 8
        && r.bottom > 60 && r.top < (window.innerHeight || 1) - 20
        && r.right > 0 && r.left < (window.innerWidth || 1);
    });
    const pool = visible.length ? visible : nodes;
    for (let attempt = 0; attempt < 12; attempt++) {
      const node = pool[Math.floor(Math.random() * pool.length)]!;
      const r = node.getBoundingClientRect();
      if (r.width < 8 || r.height < 8) continue;
      const page = toPageRect(r);
      // Tuck under the glyph box (slightly inset so it reads as “behind” letters)
      let x = page.left + Math.random() * Math.max(8, page.right - page.left - BOT_SIZE.w);
      let y = page.top + Math.random() * Math.max(4, Math.min(page.bottom - page.top, BOT_SIZE.h) * 0.65);
      ({ x, y } = clampToVisiblePlayfield(x, y));
      return { x, y, edge: 'ambush' };
    }
    return null;
  }

  function startCombat(bot: Bot): void {
    const shootOnce = () => {
      if (!isGameLive() || bot.dataset.ko === '1' || !bot.isConnected) return;
      if (bot.classList.contains('is-marching')) return;
      if (!ensureClearOfLinks(bot)) {
        clearBotTimers(bot);
        bot.remove();
        activeBots = Math.max(0, activeBots - 1);
        return;
      }
      const x = parseFloat(bot.style.left) || 0;
      const y = parseFloat(bot.style.top) || 0;
      syncMousePageFromClient();
      fireBolt(x + BOT_SIZE.w / 2, y + BOT_SIZE.h * 0.35, mouse.pageX, mouse.pageY);
    };

    setTimeout(shootOnce, 200 + Math.random() * 400);
    bot._shootInterval = setInterval(shootOnce, 1500 + Math.random() * 1100);
    bot._patrolInterval = setInterval(() => moveBot(bot), 2200 + Math.random() * 1800);
  }

  function botCap() {
    return rules.botCap(game.run.koScore, BOT_HARD_CAP);
  }

  function attachBotControls(bot: Bot): void {
    // pointerdown so a second finger can KO while the first drags the pip
    bot.addEventListener('pointerdown', (e) => {
      if (!isGameLive()) return;
      if (bot.classList.contains('is-hiding')) return;
      if (game.reticlePointerId != null && e.pointerId === game.reticlePointerId) return;
      if (e.pointerType === 'mouse' && e.button != null && e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      audio.prime();
      knockOutBot(bot);
    });

    // Outside a run, bots (if any) shouldn't trap the wheel
    bot.addEventListener('wheel', (e) => {
      if (document.body.classList.contains('cylon-game-live')) return;
      window.scrollBy({ top: e.deltaY, left: e.deltaX, behavior: 'auto' });
    }, { passive: true });
  }

  function finishBotArrival(bot: Bot): void {
    if (bot.dataset.ko === '1' || !bot.isConnected) return;
    bot.classList.remove('is-marching', 'is-hiding', 'is-emerging');
    if (!ensureClearOfLinks(bot)) {
      clearBotTimers(bot);
      bot.remove();
      activeBots = Math.max(0, activeBots - 1);
      return;
    }
    startCombat(bot);
  }

  function spawnBot() {
    if (!isGameLive() || activeBots >= botCap()) return false;
    resizeBattlefield();

    const ambush = Math.random() < 0.4 && ambushUnder;
    const ambushSpot = ambush ? findTextAmbushSpot() : null;

    const bot = document.createElement('button');
    bot.type = 'button';
    bot.title = 'Attack drone';
    bot.setAttribute('aria-label', 'Attack hostile drone');
    bot.innerHTML = '<span class="cylon-bot-body"></span><span class="cylon-bot-legs" aria-hidden="true"><span></span><span></span></span>';
    attachBotControls(bot);

    if (ambushSpot) {
      bot.className = 'cylon-bot is-hiding';
      bot.style.left = `${ambushSpot.x}px`;
      bot.style.top = `${ambushSpot.y}px`;
      ambushUnder!.appendChild(bot);
      activeBots += 1;

      // Linger behind the letters, then rise onto the battlefield
      setTimeout(() => {
        if (bot.dataset.ko === '1' || !bot.isConnected || !isGameLive()) {
          if (bot.isConnected) {
            clearBotTimers(bot);
            bot.remove();
            activeBots = Math.max(0, activeBots - 1);
          }
          return;
        }
        field.appendChild(bot);
        bot.classList.remove('is-hiding');
        bot.classList.add('is-emerging');
        setTimeout(() => finishBotArrival(bot), 560);
      }, 700 + Math.random() * 900);
      return true;
    }

    const spot = findSafeSpot();
    if (!spot) return false;

    const from = marchOrigin(spot);
    bot.className = 'cylon-bot is-marching';
    bot.style.left = `${from.x}px`;
    bot.style.top = `${from.y}px`;
    field.appendChild(bot);
    activeBots += 1;

    requestAnimationFrame(() => {
      bot.style.left = `${spot.x}px`;
      bot.style.top = `${spot.y}px`;
    });

    setTimeout(() => finishBotArrival(bot), 950);
    return true;
  }

  function launchWave() {
    if (!isGameLive()) return;
    const room = botCap() - activeBots;
    if (room <= 0) return;
    const { isWave, count } = rules.planWave(room, botCap(), Math.random);
    for (let i = 0; i < count; i++) {
      setTimeout(() => spawnBot(), i * (isWave ? 380 : 0));
    }
  }

  function scheduleAmbush(first = false): void {
    clearTimeout(ambushTimer!);
    const wait = first
      ? 2500 + Math.random() * 2500
      : 3500 + Math.random() * 4500;
    ambushTimer = setTimeout(() => {
      if (isGameLive()) launchWave();
      scheduleAmbush(false);
    }, wait);
  }

  function detonateNukeAt(
    clientX: number,
    clientY: number,
    { dealDamage = true, shake = true }: { dealDamage?: boolean; shake?: boolean } = {},
  ): void {
    if (!nukeEl) return;
    audio.prime();
    audio.sfx('nuke');

    const vw = window.innerWidth || 1;
    const vh = window.innerHeight || 1;
    nukeEl.style.setProperty('--nuke-x', `${(clientX / vw) * 100}%`);
    nukeEl.style.setProperty('--nuke-y', `${(clientY / vh) * 100}%`);
    nukeEl.classList.add('is-detonating');
    // Body transform shake pulls position:fixed children with it — skip for intro title card
    if (shake) {
      document.body.classList.add('is-nuke-shake');
      setTimeout(() => document.body.classList.remove('is-nuke-shake'), 600);
    }
    const pageX = clientX + window.scrollX;
    const pageY = clientY + window.scrollY;
    punchHole(pageX, pageY, {
      radius: holes.largeRadius(),
      holdMs: HOLE_PRESETS.large.holdMs,
      fadeMs: HOLE_PRESETS.large.fadeMs
    });

    // Secondary terrain scars around the epicenter
    const scarCount = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < scarCount; i++) {
      const ang = Math.random() * Math.PI * 2;
      const dist = randRange(holes.largeRadius() * 0.35, holes.largeRadius() * 0.85);
      const sx = pageX + Math.cos(ang) * dist;
      const sy = pageY + Math.sin(ang) * dist;
      punchHole(sx, sy, {
        radius: randRange(48, 110),
        holdMs: HOLE_PRESETS.medium.holdMs,
        fadeMs: HOLE_PRESETS.medium.fadeMs
      });
    }

    rearrangeLandscape(clientX, clientY, 1);
    // Mid-run nukes fully reshuffle debris; intro scatter happens a beat later
    if (debris.scattered()) {
      debris.reshuffle();
    } else {
      disruptGlyphs(pageX, pageY, 1.45);
      setTimeout(() => disruptGlyphs(pageX, pageY, 1.2), 220);
      setTimeout(() => disruptGlyphs(pageX, pageY, 0.85), 520);
    }

    if (dealDamage) {
      // Direct hit ends the run — count the nuke as 1 hit of real damage (no pad-to-30)
      const dist = Math.hypot(mouse.clientX - clientX, mouse.clientY - clientY);
      if (dist <= NUKE_DIRECT_HIT_RADIUS) {
        registerHit(1, { fromNuke: true });
      }
    }

    setTimeout(() => nukeEl.classList.remove('is-detonating'), 2500);
  }

  function launchNuke() {
    if (!isGameLive() || isEyeDisoriented() || game.nukeInFlight) return;
    if (!nukeMissileEl) {
      detonateNukeAt(mouse.clientX, mouse.clientY);
      return;
    }

    game.nukeInFlight = true;
    const origin = eyeClientCenter();
    let x = origin.x;
    let y = origin.y;
    // Seek the cursor until the eye is blinded (Raptor); then fly to the last lock
    let lockX = mouse.clientX;
    let lockY = mouse.clientY;
    let seeking = !isEyeDisoriented();
    let started = performance.now();
    let last = started;

    nukeMissileEl.style.left = `${x}px`;
    nukeMissileEl.style.top = `${y}px`;
    nukeMissileEl.classList.add('is-flying');
    audio.prime();
    audio.sfx('nukeLaunch');

    const tick = (now: number): void => {
      if (game.paused || !settings.gameEnabled || game.run.gameOver) {
        // Freeze flight clock while help overlay (or end state) holds the run
        started += now - last;
        last = now;
        if (!game.nukeInFlight) return;
        requestAnimationFrame(tick);
        return;
      }

      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      if (isEyeDisoriented()) {
        if (seeking) {
          // Guidance cut — keep the aim point from the moment the eye lost you
          seeking = false;
        }
      } else {
        seeking = true;
        lockX = mouse.clientX;
        lockY = mouse.clientY;
      }

      const tx = lockX;
      const ty = lockY;
      const dx = tx - x;
      const dy = ty - y;
      const dist = Math.hypot(dx, dy) || 1;
      const step = NUKE_SPEED * dt;
      x += (dx / dist) * Math.min(step, dist);
      y += (dy / dist) * Math.min(step, dist);

      nukeMissileEl.style.left = `${x}px`;
      nukeMissileEl.style.top = `${y}px`;
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      nukeMissileEl.style.setProperty('--nuke-heading', `${angle}deg`);

      const arrived = dist <= NUKE_ARRIVE_RADIUS;
      const timedOut = now - started >= NUKE_MAX_FLIGHT_MS;
      if (arrived || timedOut) {
        nukeMissileEl.classList.remove('is-flying');
        game.nukeInFlight = false;
        detonateNukeAt(x, y);
        return;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  return { allBots, knockOutBot, clearAllBots, wipeAllBotsWithScore, herdBotsIntoView, scheduleAmbush, bindPlayerMissShots,
    canLaunchMissile, launchSmallMissile, clearActiveMissiles, launchNuke, detonateNukeAt };
}
