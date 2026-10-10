/**
 * Cylon Defense — game logic.
 * Copyright (C) 2026 William Grim
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * A native ES module: the page imports initializeCylonEffects and calls it
 * once. The game knows nothing of the page's own scripts; what it has to say
 * to the page goes through the options it is given (see initializeCylonEffects)
 * and what it needs from the page's markup is listed in README.md ("Host
 * contract"). Its overlays live in mount.html and are injected into #game-root.
 *
 * The parts that need no page of their own are TypeScript in src/, compiled to
 * js/ (see README.md, "Source layout and build"): rules (difficulty, caps, hull
 * tint, volume curve), playfield (where drones may stand), state (the due-at
 * moments and the run's score and hull as data with pure transitions), audio
 * (the buses, effects and music bed), scores (the scores.php client) and intro
 * (the opening strike, on the elements it is handed).
 */
import * as rules from './js/rules.js?v=7889c1e71d';
import * as playfield from './js/playfield.js?v=848b755745';
import { createAudio } from './js/audio.js?v=19ef6956c2';
import { createAbilities, cooldownSeconds } from './js/abilities.js?v=e1407fd932';
import { createHoles, createDebris, HOLE_PRESETS } from './js/field.js?v=308463842f';
import { createIntro } from './js/intro.js?v=59b2ae7b2a';
import * as state from './js/state.js?v=d0424f3f0e';
import { createScoresClient, formatHighScoreRows, weeklyResetText } from './js/scores.js?v=ce7eccc399';

// Everything the game fetches is found next to this file, wherever it is served from.
const CYLON_MOUNT_URL = new URL('mount.html?v=0f24d0d722', import.meta.url).href;
const CYLON_SCORES_URL = new URL('scores.php', import.meta.url).href;

async function mountCylonDom() {
    const root = document.getElementById('game-root');
    if (!root) return false;
    if (root.dataset.mounted === '1' && document.getElementById('cylon-eye')) return true;
    try {
        const res = await fetch(CYLON_MOUNT_URL, { cache: 'no-store' });
        if (!res.ok) throw new Error(`mount ${res.status}`);
        root.innerHTML = await res.text();
        root.dataset.mounted = '1';
        root.dataset.game = 'cylon';
        return true;
    } catch (err) {
        console.error('Cylon mount failed', err);
        return false;
    }
}

/**
 * Mounts the game into #game-root and starts the home-page eye.
 *
 * @param {object} [options]
 * @param {(combat: boolean) => void} [options.onTheme] Called whenever combat
 *   starts (true) or ends (false), so the page can force its dark theme while
 *   the game is live and restore the visitor's choice after. The game changes
 *   no theme itself.
 * @param {string} [options.scoresApi] The score server's URL, when it is not
 *   scores.php next to this file.
 */
export async function initializeCylonEffects(options = {}) {
    const onTheme = typeof options.onTheme === 'function' ? options.onTheme : () => {};
    await mountCylonDom();

    const eye = document.getElementById('cylon-eye');
    const glare = document.getElementById('cylon-glare');
    const field = document.getElementById('cylon-battlefield');
    const ambushUnder = document.getElementById('cylon-ambush-under');
    const nukeEl = document.getElementById('cylon-nuke');
    const nukeMissileEl = document.getElementById('cylon-nuke-missile');
    const missileEl = document.getElementById('cylon-small-missile');
    const scoreEl = document.getElementById('cylon-score-value');
    const hitsEl = document.getElementById('cylon-hits-value');
    const settingsRoot = document.getElementById('cylon-settings');
    const raptorEl = document.getElementById('cylon-raptor');
    const raptorImpactsEl = document.getElementById('cylon-raptor-impacts');
    const raptorBtn = document.getElementById('cylon-raptor-btn');
    const raptorCdEl = document.getElementById('cylon-raptor-cd');
    const grenadeBtn = document.getElementById('cylon-grenade-btn');
    const grenadeCdEl = document.getElementById('cylon-grenade-cd');
    const gameToggleBtn = document.getElementById('cylon-game-toggle');
    const gameToggleLabel = document.getElementById('cylon-game-toggle-label');
    const cicEnterBtn = document.getElementById('cic-enter-btn');
    const highScoresEl = document.getElementById('cylon-high-scores');
    const gameOverEl = document.getElementById('cylon-gameover');
    const gameOverReasonEl = document.getElementById('cylon-gameover-reason');
    const gameOverKosEl = document.getElementById('cylon-gameover-kos');
    const gameOverHitsEl = document.getElementById('cylon-gameover-hits');
    const gameOverEntryEl = document.getElementById('cylon-gameover-entry');
    const gameOverBoardEl = document.getElementById('cylon-gameover-board');
    const gameOverScoresEl = document.getElementById('cylon-gameover-scores');
    const scoreSubmitBtn = document.getElementById('cylon-score-submit');
    const initialsErrorEl = document.getElementById('cylon-initials-error');
    const playAgainBtn = document.getElementById('cylon-play-again');
    const reticleEl = document.getElementById('cylon-reticle');
    const navBurger = document.getElementById('site-nav-burger');
    const navMenu = document.getElementById('site-nav-menu');
    const navPower = document.getElementById('site-nav-power');
    const navGame = document.getElementById('site-nav-game');
    const siteBrand = document.getElementById('site-brand');
    const introTitleEl = document.getElementById('cylon-intro-title');
    const BRAND_CIVIL = 'William Grim';
    const BRAND_COMBAT = 'The CIC';
    const INTRO_TITLE_SETTLE_MS = 880;
    const helpBtn = document.getElementById('cylon-help-btn');
    const helpEl = document.getElementById('cylon-help');
    const helpPlatformEl = document.getElementById('cylon-help-platform');
    const helpDesktopEl = document.getElementById('cylon-help-desktop');
    const helpMobileEl = document.getElementById('cylon-help-mobile');
    const helpCloseBtn = document.getElementById('cylon-help-close');
    const initialLetters = [0, 1, 2].map((i) => document.getElementById(`cylon-initial-${i}`));
    const initialsRoot = document.getElementById('cylon-initials');
    let activeInitialIdx = 0;
    if (!eye || !field) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
    const BOT_HARD_CAP = coarsePointer ? 10 : 30;
    if (reduceMotion) return;

    let draggingReticle = false;
    let reticlePointerId = null;

    const SETTINGS_KEY = 'cylon-settings';
    const scores = createScoresClient(options.scoresApi || CYLON_SCORES_URL, {
        fetch: (url, init) => fetch(url, init),
    });
    const defaults = {
        gameEnabled: false,
        soundEnabled: true,
        musicEnabled: true,
        // UI midpoints; gain curves map 50% to the intended default loudness
        soundVolume: 50,
        musicVolume: 50,
        eyeEnabled: true
    };
    let settings = loadSettings();
    // Game stays off until the player explicitly enables it
    settings.gameEnabled = false;
    settings.soundVolume = Math.max(0, Math.min(100, Number(settings.soundVolume) || defaults.soundVolume));
    settings.musicVolume = Math.max(0, Math.min(100, Number(settings.musicVolume) || defaults.musicVolume));
    // Migrate old defaults to the new midpoint UI values
    let migrated = false;
    if (settings.soundVolume === 85) {
        settings.soundVolume = 50;
        migrated = true;
    }
    if (settings.musicVolume === 40) {
        settings.musicVolume = 50;
        migrated = true;
    }
    if (migrated) {
        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        } catch {
            /* ignore quota / private mode */
        }
    }

    const mouse = {
        clientX: window.innerWidth / 2,
        clientY: window.innerHeight / 3,
        pageX: window.innerWidth / 2,
        pageY: window.innerHeight / 3,
        t: 0
    };
    let eyeX = 50;
    let tracking = false;
    let idleTimer = null;
    let activeBots = 0;
    /** The run's score and hull (src/state.ts); replaced by each transition. */
    let run = state.createRun();
    /** The moments the game is waiting for (src/state.ts); the timer handles stay below. */
    let schedule = state.createSchedule();
    let healTimer = null;
    let paused = false;
    let pauseStartedAt = 0;
    let ambushTimer = null;
    let abilityCdTimer = null;
    let nukeInFlight = false;
    let lastAim = { clientX: 0, clientY: 0, t: 0 };
    let missileTimer = null;
    let nukeTimer = null;
    /** @type {{ el: HTMLElement, tracker: boolean, alive: boolean }[]} */
    let activeMissiles = [];
    let herdTimer = null;

    const IDLE_MS = 2000;
    const BOT_SIZE = { w: 44, h: 56 };
    const LINK_PAD = 28;
    const HIT_RADIUS = 52;
    const BOLT_HIT_RADIUS = 44;
    const { MAX_HITS } = rules;
    const HEAL_IDLE_MS = 10000;
    const NUKE_DIRECT_HIT_RADIUS = 64;
    const NUKE_SPEED = 520; // px/sec toward cursor
    const NUKE_ARRIVE_RADIUS = 28;
    const NUKE_MAX_FLIGHT_MS = 2800;
    const MISSILE_SPEED = 640;
    const MISSILE_ARRIVE = 22;
    const MISSILE_MAX_FLIGHT_MS = 2200;
    const MISSILE_BLAST_RADIUS = 72;
    /** Local letter/terrain chew for player shots, robot bolts, and inbound missiles. */
    const SMALL_WEAPON_SCALE = 0.22;
    const MISSILE_WEAPON_SCALE = 0.32;
    const GRENADE_WEAPON_SCALE = 0.62;
    const RAPTOR_IMPACT_SCALE = 0.5;
    const RAPTOR_STRIKE_SCALE = 0.72;
    let trackerPairTimer = null;
    /** @type {ReturnType<typeof setTimeout>[]} */
    let groundVolleyTimers = [];
    const EYE_DISORIENT_MS = 30000;
    const GRENADE_RADIUS = HOLE_PRESETS.medium.radius; // ~50% larger than prior 110px
    function loadSettings() {
        try {
            const raw = localStorage.getItem(SETTINGS_KEY);
            if (!raw) return { ...defaults };
            return { ...defaults, ...JSON.parse(raw) };
        } catch {
            return { ...defaults };
        }
    }

    function saveSettings() {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        syncSettingsUi();
        syncGameToggleUi();
    }

    function syncSettingsUi() {
        if (!settingsRoot) return;
        const sound = settingsRoot.querySelector('[data-setting="soundEnabled"]');
        const music = settingsRoot.querySelector('[data-setting="musicEnabled"]');
        const soundVol = settingsRoot.querySelector('[data-setting="soundVolume"]');
        const musicVol = settingsRoot.querySelector('[data-setting="musicVolume"]');
        const eyeToggle = settingsRoot.querySelector('[data-setting="eyeEnabled"]');
        if (sound) sound.checked = settings.soundEnabled;
        if (music) music.checked = settings.musicEnabled;
        if (soundVol) soundVol.value = String(settings.soundVolume);
        if (musicVol) musicVol.value = String(settings.musicVolume);
        if (eyeToggle) eyeToggle.checked = settings.eyeEnabled;
        renderHighScores();
    }

    function syncGameToggleUi() {
        if (!gameToggleBtn) return;
        gameToggleBtn.classList.toggle('is-on', settings.gameEnabled);
        gameToggleBtn.setAttribute('aria-pressed', settings.gameEnabled ? 'true' : 'false');
        if (gameToggleLabel) {
            gameToggleLabel.textContent = settings.gameEnabled ? 'Game On' : 'Game Off';
        }
    }

    let navChromeFadeGen = 0;
    let navChromeFadeTimer = null;
    const NAV_FADE_MS = Math.round(2850 * 0.45); // match --cylon-desolate-fade * 0.45

    /** Apply civil vs combat nav structure (no animation). */
    function applyNavChrome(on) {
        document.body.classList.toggle('cylon-nav-combat', on);
        if (siteBrand) {
            siteBrand.textContent = on ? BRAND_COMBAT : BRAND_CIVIL;
        }
        if (navGame) {
            navGame.hidden = !on;
        }
        if (settingsRoot) {
            settingsRoot.hidden = !on;
        }
        if (cicEnterBtn) {
            cicEnterBtn.hidden = on;
        }
        // Game toggle stays in #site-nav-power — never reparented (avoids fade/size jumps)
        if (!on) {
            const panel = document.getElementById('cylon-settings-panel');
            const toggleBtn = document.getElementById('cylon-settings-toggle');
            if (panel && !panel.hidden) {
                panel.hidden = true;
                if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
            }
        }
    }

    /** Fade out → swap chrome → fade in (same family as page scatter fade). */
    function syncNavChrome() {
        const on = !!settings.gameEnabled;
        const navInner = document.querySelector('.site-nav-inner');
        const already = document.body.classList.contains('cylon-nav-combat');

        if (reduceMotion || !navInner || already === on) {
            clearTimeout(navChromeFadeTimer);
            navChromeFadeTimer = null;
            navInner?.classList.remove('is-nav-fading');
            applyNavChrome(on);
            return;
        }

        const gen = ++navChromeFadeGen;
        clearTimeout(navChromeFadeTimer);
        navInner.classList.add('is-nav-fading');
        navChromeFadeTimer = setTimeout(() => {
            if (gen !== navChromeFadeGen) return;
            applyNavChrome(on);
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    if (gen !== navChromeFadeGen) return;
                    navInner.classList.remove('is-nav-fading');
                    navChromeFadeTimer = null;
                });
            });
        }, NAV_FADE_MS);
    }

    function renderHighScores(list = scores.board()) {
        if (highScoresEl) highScoresEl.innerHTML = formatHighScoreRows(list);
        if (gameOverScoresEl) gameOverScoresEl.innerHTML = formatHighScoreRows(list);
    }

    function showScoreConfig(config) {
        const blurb = weeklyResetText(config);
        ['cylon-weekly-reset', 'cylon-gameover-reset'].forEach((id) => {
            const node = document.getElementById(id);
            if (node) node.textContent = blurb;
        });
    }

    async function fetchHighScores() {
        const config = await scores.load();
        if (config) showScoreConfig(config);
        renderHighScores();
    }

    /** True when score earns a board slot: open seats, or strictly above the lowest shown. */
    function scoreQualifiesForBoard(score) {
        return scores.qualifies(score);
    }

    function readInitialLetter(el) {
        const ch = ((el && el.textContent) || 'A').toUpperCase().replace(/[^A-Z]/g, '');
        return ch.charAt(0) || 'A';
    }

    function readInitials() {
        return initialLetters.map(readInitialLetter).join('').slice(0, 3).padEnd(3, 'A');
    }

    function isBlockedInitials(initials) {
        return scores.isBlocked(initials);
    }

    function setInitialsError(message) {
        if (!initialsErrorEl) return;
        if (message) {
            initialsErrorEl.textContent = message;
            initialsErrorEl.hidden = false;
        } else {
            initialsErrorEl.textContent = '';
            initialsErrorEl.hidden = true;
        }
    }

    function setActiveInitial(idx) {
        activeInitialIdx = Math.max(0, Math.min(2, idx));
        initialLetters.forEach((el, i) => {
            if (!el) return;
            el.classList.toggle('is-active', i === activeInitialIdx);
        });
        initialLetters[activeInitialIdx]?.focus();
    }

    function scrollInitial(idx, dir) {
        const el = initialLetters[idx];
        if (!el) return;
        const code = readInitialLetter(el).charCodeAt(0) - 65;
        const next = ((code + dir) % 26 + 26) % 26;
        el.textContent = String.fromCharCode(65 + next);
        setInitialsError('');
        setActiveInitial(idx);
    }

    function resetInitials() {
        initialLetters.forEach((el) => {
            if (el) el.textContent = 'A';
        });
        setInitialsError('');
        setActiveInitial(0);
    }

    async function submitHighScore(score, initials) {
        const result = await scores.submit(score, initials, run.pendingScore ? run.pendingScore.hits : run.hitsTaken);
        if (result.saved) {
            setInitialsError('');
        } else if (result.problem === 'invalid-initials') {
            setInitialsError("Those initials aren't valid — choose another.");
        } else if (result.problem === 'save-failed') {
            setInitialsError('Could not save that score. Refresh and play again.');
        }
        renderHighScores();
        return result.saved;
    }

    function scrollX() {
        return window.scrollX || window.pageXOffset || 0;
    }

    function scrollY() {
        return window.scrollY || window.pageYOffset || 0;
    }

    function docSize() {
        const el = document.documentElement;
        // Width: viewport only. Height: in-flow body content (not absolute battlefield).
        return {
            w: el.clientWidth,
            h: Math.max(document.body.offsetHeight, el.clientHeight)
        };
    }

    function resizeBattlefield() {
        // Battlefield uses CSS inset:0 against body — clear any old inline sizing
        // that previously tracked scrollHeight and caused dual/growing scrollbars.
        field.style.width = '';
        field.style.height = '';
    }

    /** Combat session chrome / music — stays true through game-over until Game Off. */
    function sessionActive() {
        return settings.gameEnabled && !paused;
    }

    const audio = createAudio({
        settings: () => settings,
        sessionActive,
        volumeToGain: rules.volumeToGain,
    });

    /** The opening strike (src/intro.ts); the game's part in it comes in as callbacks. */
    const intro = createIntro({
        titleEl: introTitleEl,
        nukeEl: nukeMissileEl,
        brandEl: siteBrand,
        body: document.body,
        title: BRAND_COMBAT,
        reduceMotion,
        navFadeMs: NAV_FADE_MS,
        settleMs: INTRO_TITLE_SETTLE_MS,
        speed: NUKE_SPEED * 0.85,
        arriveRadius: NUKE_ARRIVE_RADIUS,
        maxFlightMs: NUKE_MAX_FLIGHT_MS,
        random: Math.random,
        enabled: () => settings.gameEnabled,
        paused: () => paused,
        startRun: () => scores.startRun(),
        launched: () => {
            audio.prime();
            audio.sfx('introLaunch');
        },
        setNukeInFlight: (inFlight) => { nukeInFlight = inFlight; },
        detonate: (x, y) => detonateNukeAt(x, y, { dealDamage: false, shake: false }),
        beginCombat: beginCombatAfterIntro,
    });

    /** Actively fighting — false during intro cinematic and game-over overlays. */
    function isGameLive() {
        return sessionActive() && !run.gameOver && !intro.playing();
    }

    /** The terrain holes (src/field.ts). */
    const holes = createHoles({
        field,
        isLive: isGameLive,
        paused: () => paused,
        viewport: () => ({ width: window.innerWidth, height: window.innerHeight }),
        create: (tag) => document.createElement(tag),
        now: () => Date.now(),
        setTimer: (fn, ms) => setTimeout(fn, ms),
        clearTimer: (h) => clearTimeout(h),
    });
    /** The page's glyph debris (src/field.ts). */
    const debris = createDebris({
        doc: document,
        viewport: () => ({ width: window.innerWidth, height: window.innerHeight }),
        random: Math.random,
        reduceMotion,
        setTimer: (fn, ms) => setTimeout(fn, ms),
        clearTimer: (h) => clearTimeout(h),
    });
    const punchHole = holes.punch;
    /** The grenade and the raptor (src/abilities.ts); the cooldowns live in `schedule`. */
    const abilities = createAbilities({
        now: () => Date.now(),
        setTimer: (fn, ms) => setTimeout(fn, ms),
        clearTimer: (h) => clearTimeout(h),
        isLive: isGameLive,
        readyAt: (which) => (which === 'grenade' ? schedule.grenadeReadyAt : schedule.raptorReadyAt),
        setReadyAt: (which, at) => {
            if (which === 'grenade') schedule.grenadeReadyAt = at;
            else schedule.raptorReadyAt = at;
        },
        sfx: (name) => {
            audio.prime();
            audio.sfx(name);
        },
        changed: updateAbilityButtons,
        grenadeBlast: detonateGrenadeAt,
        raptorAvailable: () => !!raptorEl,
        raptorLaunch: () => {
            disorientEye(EYE_DISORIENT_MS);
            raptorEl.classList.add('is-inbound');
        },
        raptorStrike: strikeRaptorBand,
        raptorClear: clearRaptorVisuals,
    });

    /** Scatter + blow glyphs (after intro blast, or immediately when not deferred). */
    function blowWorldEnded() {
        debris.scatter();
        document.body.classList.add('cylon-world-ended');
        document.body.classList.remove('cylon-glyphs-blown');
        // Long transition only for the opening scatter; combat kicks use a snappy curve
        document.body.classList.add('cylon-glyphs-blowing');
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                if (settings.gameEnabled) {
                    document.body.classList.add('cylon-glyphs-blown');
                }
                setTimeout(() => {
                    document.body.classList.remove('cylon-glyphs-blowing');
                }, 3000);
            });
        });
    }

    function syncWorldEndedLook(opts = {}) {
        const on = settings.gameEnabled;
        const deferScatter = !!opts.deferScatter;
        document.body.classList.toggle('cylon-game-live', on);
        onTheme(on);
        syncNavChrome();
        if (on) {
            if (!deferScatter) blowWorldEnded();
        } else {
            document.body.classList.remove('cylon-glyphs-blown');
            document.body.classList.remove('cylon-glyphs-blowing');
            document.body.classList.remove('cylon-world-ended');
            debris.cancelReshuffleSettle();
            clearLandscapeVars();
            // Let letters ease home, then unwrap (match --cylon-desolate-fade)
            setTimeout(() => {
                if (!settings.gameEnabled) debris.restore();
            }, 2900);
        }
    }

    function allBots() {
        const under = ambushUnder ? [...ambushUnder.querySelectorAll('.cylon-bot')] : [];
        const top = field ? [...field.querySelectorAll('.cylon-bot')] : [];
        return under.concat(top);
    }

    function lerp(a, b, t) {
        return rules.lerp(a, b, t);
    }

    function killLevel() {
        return rules.killLevel(run.koScore);
    }

    function difficultyFactor() {
        return rules.difficultyFactor(run.koScore, run.runStartedAt, Date.now());
    }

    function nextMissileDelayMs() {
        return rules.nextMissileDelayMs(run.koScore, Math.random);
    }

    function nextNukeDelayMs() {
        return rules.nextNukeDelayMs(difficultyFactor(), Math.random);
    }

    function groundMissileCap() {
        return rules.groundMissileCap(run.koScore);
    }

    function trackerMissileCap() {
        return rules.trackerMissileCap(run.koScore);
    }

    function trackerMissileChance() {
        return rules.trackerMissileChance(run.koScore);
    }

    function countActiveMissiles(trackerOnly = null) {
        return activeMissiles.filter((m) => {
            if (!m.alive) return false;
            if (trackerOnly == null) return true;
            return m.tracker === trackerOnly;
        }).length;
    }

    function canLaunchMissile(asTracker) {
        if (asTracker) return countActiveMissiles(true) < trackerMissileCap();
        return countActiveMissiles(false) < groundMissileCap();
    }

    function clearGroundVolleyTimers() {
        groundVolleyTimers.forEach((id) => clearTimeout(id));
        groundVolleyTimers = [];
    }

    function clearActiveMissiles() {
        clearTimeout(trackerPairTimer);
        trackerPairTimer = null;
        clearGroundVolleyTimers();
        activeMissiles.forEach((m) => {
            m.alive = false;
            m.el.remove();
        });
        activeMissiles = [];
        if (missileEl) missileEl.classList.remove('is-flying', 'is-tracker');
    }

    function clearInboundSchedulers() {
        clearTimeout(missileTimer);
        clearTimeout(nukeTimer);
        clearTimeout(trackerPairTimer);
        clearGroundVolleyTimers();
        missileTimer = null;
        nukeTimer = null;
        trackerPairTimer = null;
        schedule.missileDueAt = 0;
        schedule.nukeDueAt = 0;
        clearActiveMissiles();
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
        const candidates = [];
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

        let bestX = candidates[0];
        let bestScore = -Infinity;
        for (const cx of candidates) {
            let score;
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

    function detonateSmallMissileAt(missile, clientX, clientY) {
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

    function launchSmallMissile({ forceTracker = false, forceGround = false, fromPair = false } = {}) {
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

        const tick = (now) => {
            if (!missile.alive) return;
            if (paused || !settings.gameEnabled || run.gameOver) {
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
            clearTimeout(trackerPairTimer);
            trackerPairTimer = setTimeout(() => {
                trackerPairTimer = null;
                if (!isGameLive() || paused || isEyeDisoriented()) return;
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
                        if (!isGameLive() || paused || isEyeDisoriented()) return;
                        launchSmallMissile({ forceGround: true, fromPair: true });
                    }, delay);
                    groundVolleyTimers.push(id);
                }
            }
        }
        return true;
    }

    function scheduleMissiles(first = false) {
        clearTimeout(missileTimer);
        if (!isGameLive()) return;
        const wait = first ? 4000 + Math.random() * 3000 : nextMissileDelayMs();
        schedule.missileDueAt = Date.now() + wait;
        missileTimer = setTimeout(() => {
            missileTimer = null;
            if (!isGameLive() || paused) return;
            if (!isEyeDisoriented() && (canLaunchMissile(false) || canLaunchMissile(true))) {
                launchSmallMissile();
            }
            scheduleMissiles(false);
        }, wait);
    }

    function scheduleNukes(first = false) {
        clearTimeout(nukeTimer);
        if (!isGameLive()) return;
        const wait = first ? 12000 + Math.random() * 8000 : nextNukeDelayMs();
        schedule.nukeDueAt = Date.now() + wait;
        nukeTimer = setTimeout(() => {
            nukeTimer = null;
            if (!isGameLive() || paused) return;
            if (!isEyeDisoriented() && !nukeInFlight) {
                launchNuke();
            }
            scheduleNukes(false);
        }, wait);
    }

    function startInboundSchedulers() {
        clearInboundSchedulers();
        scheduleMissiles(true);
        scheduleNukes(true);
    }

    function applyPauseTimeSkew(elapsed) {
        if (elapsed <= 0) return;
        const before = schedule;
        schedule = state.skewForPause(before, pauseStartedAt, elapsed);

        if (schedule.missileDueAt !== before.missileDueAt) {
            clearTimeout(missileTimer);
            missileTimer = setTimeout(() => {
                missileTimer = null;
                if (!isGameLive() || paused) return;
                if (!isEyeDisoriented() && (canLaunchMissile(false) || canLaunchMissile(true))) {
                    launchSmallMissile();
                }
                scheduleMissiles(false);
            }, state.msUntil(schedule.missileDueAt, Date.now()));
        }
        if (schedule.nukeDueAt !== before.nukeDueAt) {
            clearTimeout(nukeTimer);
            nukeTimer = setTimeout(() => {
                nukeTimer = null;
                if (!isGameLive() || paused) return;
                if (!isEyeDisoriented() && !nukeInFlight) launchNuke();
                scheduleNukes(false);
            }, state.msUntil(schedule.nukeDueAt, Date.now()));
        }
        if (schedule.healDueAt !== before.healDueAt) {
            clearTimeout(healTimer);
            healTimer = setTimeout(() => {
                healTimer = null;
                tryHeal();
            }, state.msUntil(schedule.healDueAt, Date.now()));
        }

        holes.resume(pauseStartedAt, elapsed);
    }

    function clearHealTimer() {
        clearTimeout(healTimer);
        healTimer = null;
        schedule.healDueAt = 0;
    }

    function tryHeal() {
        healTimer = null;
        schedule.healDueAt = 0;
        if (!isGameLive() || run.hitCount <= 0) return;
        run = state.healOne(run);
        updateHitsUi();
        audio.prime();
        audio.sfx('heal');
        if (hitsEl) {
            hitsEl.classList.add('is-heal');
            setTimeout(() => hitsEl.classList.remove('is-heal'), 320);
        }
        scheduleHeal();
    }

    function scheduleHeal() {
        clearHealTimer();
        if (!settings.gameEnabled || run.gameOver || paused || run.hitCount <= 0) return;
        schedule.healDueAt = Date.now() + HEAL_IDLE_MS;
        healTimer = setTimeout(() => {
            healTimer = null;
            tryHeal();
        }, HEAL_IDLE_MS);
    }

    function readEyePercent() {
        const parent = eye.parentElement;
        if (!parent) return 50;
        const er = eye.getBoundingClientRect();
        const pr = parent.getBoundingClientRect();
        if (pr.width < 1) return 50;
        return ((er.left + er.width / 2 - pr.left) / pr.width) * 100;
    }

    // One full left-right-left sweep while the eye tracks the cursor.
    const EYE_SWEEP_S = 5.2;
    let sweepPhase = 0;
    let sweepLast = 0;

    function isEyeDisoriented() {
        return state.pending(schedule.eyeDisorientedUntil, Date.now());
    }

    function setEyeTracking(on) {
        // Idle sweep only when the game is off (or eye tracking disabled / disoriented)
        if (!isGameLive() || !settings.eyeEnabled || isEyeDisoriented()) on = false;
        if (on && !tracking) {
            // Pick the tracking sweep up where the idle sweep left the eye.
            eyeX = readEyePercent();
            sweepPhase = Math.asin(Math.max(-1, Math.min(1, (eyeX - 50) / 45)));
            sweepLast = performance.now();
        }
        tracking = on;
        eye.classList.toggle('is-tracking', on && !isEyeDisoriented());
        if (glare) glare.classList.toggle('is-active', on && !isEyeDisoriented());
        if (!on && !isEyeDisoriented()) {
            eye.style.left = '';
            if (glare) {
                glare.style.opacity = '';
                glare.style.height = '';
                glare.style.top = '';
                glare.style.transform = '';
            }
        }
    }

    function disorientEye(ms = EYE_DISORIENT_MS) {
        schedule.eyeDisorientedUntil = Date.now() + ms;
        tracking = false;
        eye.classList.remove('is-tracking');
        eye.classList.add('is-disoriented');
        eyeX = readEyePercent();
        if (glare) {
            glare.classList.add('is-active');
            glare.classList.add('is-disoriented');
        }
    }

    function clearEyeDisorientIfDue() {
        if (eye.classList.contains('is-disoriented') && !isEyeDisoriented()) {
            eye.classList.remove('is-disoriented');
            if (glare) glare.classList.remove('is-disoriented');
            if (!tracking) {
                eye.style.left = '';
                if (glare) glare.classList.remove('is-active');
            }
        }
    }

    function updateEye() {
        clearEyeDisorientIfDue();

        if (isEyeDisoriented()) {
            // Erratic sweep — still moving, but not tracking the player
            const t = performance.now() / 1000;
            const dance = 50
                + Math.sin(t * 6.8) * 30
                + Math.sin(t * 15.4) * 14
                + Math.sin(t * 2.7) * 10
                + Math.sin(t * 31) * 4;
            const target = Math.min(95, Math.max(5, dance));
            eyeX += (target - eyeX) * 0.22;
            eye.style.left = `${eyeX}%`;
            if (glare) {
                glare.classList.add('is-active');
                glare.style.left = `${(eyeX / 100) * window.innerWidth}px`;
                const flicker = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(t * 22));
                glare.style.height = `${Math.min(window.innerHeight * 0.28, 11 * 16) * flicker}px`;
                glare.style.opacity = String(0.35 + 0.55 * flicker);
            }
        } else if (tracking && settings.eyeEnabled) {
            // The eye keeps sweeping while it watches you; the glare is a beam
            // from the eye down to the cursor, re-aimed every frame.
            const now = performance.now();
            sweepPhase += Math.min(0.05, (now - sweepLast) / 1000) * (Math.PI * 2 / EYE_SWEEP_S);
            sweepLast = now;
            eyeX = 50 + 45 * Math.sin(sweepPhase);
            eye.style.left = `${eyeX}%`;
            if (glare) {
                const from = eyeClientCenter();
                const top = from.y + eye.getBoundingClientRect().height * 0.2;
                const dx = mouse.clientX - from.x;
                const dy = Math.max(1, mouse.clientY - top);
                glare.style.opacity = '';
                glare.style.left = `${from.x}px`;
                glare.style.top = `${top}px`;
                // A glare, not a laser: it points at the cursor but fades out
                // short of it. It carries at most 85% of the way (140 px plus a
                // quarter of the distance), and dims overall as you get farther.
                const dist = Math.hypot(dx, dy);
                const reach = Math.min(dist * 0.85, 140 + dist * 0.25);
                glare.style.height = `${dist}px`;
                glare.style.setProperty('--glare-reach', `${(reach / Math.max(1, dist)) * 100}%`);
                glare.style.opacity = String(Math.max(0.3, Math.min(1, 1 - dist / (Math.hypot(window.innerWidth, window.innerHeight) * 1.2))));
                glare.style.transform = `translateX(-50%) rotate(${-Math.atan2(dx, dy)}rad)`;
            }
        }
        requestAnimationFrame(updateEye);
    }

    function syncMousePageFromClient() {
        // Scroll does not fire pointermove; keep document aim coords fresh.
        mouse.pageX = mouse.clientX + scrollX();
        mouse.pageY = mouse.clientY + scrollY();
    }

    function paintReticle() {
        if (!reticleEl || reticleEl.hidden) return;
        reticleEl.style.transform = `translate(${mouse.clientX}px, ${mouse.clientY}px)`;
    }

    function setAim(clientX, clientY) {
        const vw = window.innerWidth || 1;
        const vh = window.innerHeight || 1;
        mouse.clientX = Math.min(vw - 8, Math.max(8, clientX));
        mouse.clientY = Math.min(vh - 8, Math.max(8, clientY));
        syncMousePageFromClient();
        mouse.t = performance.now();
        paintReticle();
        lastAim.clientX = mouse.clientX;
        lastAim.clientY = mouse.clientY;
        lastAim.t = performance.now();
        if (isGameLive() && settings.eyeEnabled && !isEyeDisoriented()) {
            setEyeTracking(true);
            clearTimeout(idleTimer);
            idleTimer = setTimeout(() => setEyeTracking(false), IDLE_MS);
        }
    }

    function syncReticleVisibility() {
        if (!reticleEl) return;
        const show = isGameLive();
        reticleEl.hidden = !show;
        reticleEl.setAttribute('aria-hidden', show ? 'false' : 'true');
        // Desktop: follow the mouse without stealing clicks; mobile keeps drag
        reticleEl.classList.toggle('is-mouse-follow', show && !coarsePointer);
        if (show) paintReticle();
    }

    function resetReticleToCenter() {
        setAim(window.innerWidth / 2, window.innerHeight * 0.42);
    }

    function isUiAimBlocker(el) {
        if (!el || !el.closest) return false;
        return !!el.closest('.site-nav, .cylon-help, .cylon-gameover, .cylon-settings-panel');
    }

    function onPointerMove(e) {
        audio.prime();
        // Reticle finger is handled in bindReticle (per pointerId)
        if (reticlePointerId != null && e.pointerId === reticlePointerId) return;
        // Other touch fingers must not move aim (so a tap/attack finger is free)
        if (coarsePointer && e.pointerType === 'touch') return;
        // Don't drag aim (and seeking nukes) up into the nav when clicking Raptor / gear
        if (isUiAimBlocker(e.target)) return;
        setAim(e.clientX, e.clientY);
    }

    function onScroll() {
        syncMousePageFromClient();
        // After the user scrolls, pull stragglers back into the visible playfield
        clearTimeout(herdTimer);
        herdTimer = setTimeout(herdBotsIntoView, 180);
    }

    function endReticleDrag(e) {
        if (reticlePointerId == null || (e && e.pointerId !== reticlePointerId)) return;
        draggingReticle = false;
        reticlePointerId = null;
        reticleEl?.classList.remove('is-dragging');
    }

    function bindReticle() {
        if (!reticleEl || !coarsePointer) return;

        // No setPointerCapture — capturing the dodge finger blocks other fingers
        // from hitting Grenade / Raptor / bots on many mobile browsers.
        reticleEl.addEventListener('pointerdown', (e) => {
            if (!isGameLive()) return;
            if (e.button != null && e.button !== 0) return;
            if (reticlePointerId != null) return; // already steering with another finger
            if (abilities.grenadeArmed()) return; // window capture handler throws instead
            e.preventDefault();
            draggingReticle = true;
            reticlePointerId = e.pointerId;
            reticleEl.classList.add('is-dragging');
            setAim(e.clientX, e.clientY);
        });

        const onReticleMove = (e) => {
            if (reticlePointerId == null || e.pointerId !== reticlePointerId) return;
            e.preventDefault();
            setAim(e.clientX, e.clientY);
        };
        window.addEventListener('pointermove', onReticleMove, { passive: false });
        window.addEventListener('pointerup', endReticleDrag, true);
        window.addEventListener('pointercancel', endReticleDrag, true);

    }

    /** Page scroll is pointless once glyphs are scattered — lock it for the whole session. */
    function bindPlayScrollLock() {
        const scrollExempt = (target) => !!(target && target.closest
            && target.closest('.cylon-help-panel, .cylon-gameover, .cylon-settings-panel'));

        document.addEventListener('wheel', (e) => {
            if (!document.body.classList.contains('cylon-game-live')) return;
            if (scrollExempt(e.target)) return;
            e.preventDefault();
        }, { passive: false });

        // iOS pans on touchmove unless non-passive + prevented.
        document.addEventListener('touchmove', (e) => {
            if (!document.body.classList.contains('cylon-game-live')) return;
            const t = e.target;
            if (t && t.closest && t.closest('.site-nav, .cylon-help, .cylon-gameover, .cylon-settings-panel')) {
                return;
            }
            e.preventDefault();
        }, { passive: false });
    }

    function bindNavMenu() {
        if (!navBurger || !navMenu) return;
        const closeMenu = () => {
            navMenu.classList.remove('is-open');
            navBurger.setAttribute('aria-expanded', 'false');
        };
        navBurger.addEventListener('click', (e) => {
            e.stopPropagation();
            const open = !navMenu.classList.contains('is-open');
            navMenu.classList.toggle('is-open', open);
            navBurger.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
        navMenu.querySelectorAll('a.site-link').forEach((link) => {
            link.addEventListener('click', () => closeMenu());
        });
        document.addEventListener('click', (e) => {
            if (!navMenu.classList.contains('is-open')) return;
            if (navMenu.contains(e.target) || navBurger.contains(e.target)) return;
            closeMenu();
        });
        window.addEventListener('resize', () => {
            if (window.matchMedia('(min-width: 820px)').matches) closeMenu();
        });
    }

    function syncHelpContent() {
        const mobile = coarsePointer;
        if (helpPlatformEl) {
            helpPlatformEl.textContent = mobile ? 'Touch controls' : 'Desktop controls';
        }
        if (helpDesktopEl) helpDesktopEl.hidden = mobile;
        if (helpMobileEl) helpMobileEl.hidden = !mobile;
    }

    function openHelp() {
        if (!helpEl) return;
        if (!paused) {
            paused = true;
            pauseStartedAt = Date.now();
            clearTimeout(idleTimer);
            holes.pause();
            clearTimeout(missileTimer);
            clearTimeout(nukeTimer);
            clearTimeout(healTimer);
            missileTimer = null;
            nukeTimer = null;
            healTimer = null;
            setEyeTracking(false);
            audio.syncMusic();
            updateAbilityButtons();
        }
        syncHelpContent();
        helpEl.hidden = false;
        helpCloseBtn?.focus();
    }

    function closeHelp() {
        if (!helpEl) return;
        helpEl.hidden = true;
        if (paused) {
            const elapsed = Date.now() - pauseStartedAt;
            applyPauseTimeSkew(elapsed);
            paused = false;
            pauseStartedAt = 0;
            audio.syncMusic();
            updateAbilityButtons();
            syncReticleVisibility();
        }
        helpBtn?.focus();
    }

    function bindHelp() {
        if (helpBtn) {
            helpBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                openHelp();
            });
        }
        if (helpCloseBtn) {
            helpCloseBtn.addEventListener('click', (e) => {
                e.preventDefault();
                closeHelp();
            });
        }
        if (helpEl) {
            helpEl.addEventListener('click', (e) => {
                if (e.target === helpEl) closeHelp();
            });
        }
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && helpEl && !helpEl.hidden) {
                e.preventDefault();
                closeHelp();
            }
        });
    }

    function inflate(rect, pad) {
        return playfield.inflate(rect, pad);
    }

    function toPageRect(domRect) {
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
        const rects = [];
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

    function clampToVisiblePlayfield(x, y) {
        return playfield.clampToBounds(visiblePlayfieldBounds(), x, y);
    }

    function isInVisiblePlayfield(x, y) {
        return playfield.isInBounds(visiblePlayfieldBounds(), x, y);
    }

    function isSafePageSpot(x, y, forbidden) {
        return playfield.isSafeSpot(x, y, forbidden, docSize(), BOT_SIZE);
    }


    function findSafeSpot(nearBot) {
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

    function currentHp() {
        return rules.currentHp(run.hitCount);
    }

    function hpTint(hp) {
        return rules.hpTint(hp);
    }

    function updateHitsUi() {
        if (!hitsEl) return;
        const hp = currentHp();
        hitsEl.textContent = String(hp);
        hitsEl.classList.remove('is-hp-good', 'is-hp-mid', 'is-hp-low');
        const tint = hpTint(hp);
        hitsEl.style.color = tint.color;
        hitsEl.style.textShadow = `0 0 8px ${tint.glow}`;
    }

    function registerHit(count = 1, { fromNuke = false } = {}) {
        if (run.gameOver || !isGameLive()) return;
        const hit = state.takeHits(run, count, MAX_HITS, fromNuke);
        run = hit.run;
        updateHitsUi();
        audio.sfx('hit');
        scheduleHeal();

        if (hit.ends) {
            clearHealTimer();
            endGame(hit.ends);
        }
    }

    function fireBolt(fromX, fromY, toX, toY) {
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

        const finishBolt = (x, y, { struck = false } = {}) => {
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
        const tick = (now) => {
            if (settled) return;
            if (!settings.gameEnabled || run.gameOver) {
                try { anim.cancel(); } catch (_) { /* ignore */ }
                finishBolt(toX, toY, { struck: false });
                return;
            }
            if (paused) {
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
    function spawnShotImpact(pageX, pageY, { sound = true } = {}) {
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

    function isPlayerShotUiTarget(el) {
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
            if (reticlePointerId != null && e.pointerId === reticlePointerId) return;
            if (isPlayerShotUiTarget(e.target)) return;
            e.preventDefault();
            spawnShotImpact(e.pageX, e.pageY);
        });
    }

    function bumpScore() {
        run = state.recordKill(run);
        if (!scoreEl) return;
        scoreEl.textContent = String(run.koScore);
        scoreEl.classList.remove('is-bump');
        void scoreEl.offsetWidth;
        scoreEl.classList.add('is-bump');
        setTimeout(() => scoreEl.classList.remove('is-bump'), 180);
    }

    function clearBotTimers(bot) {
        if (bot._shootInterval) clearInterval(bot._shootInterval);
        if (bot._patrolInterval) clearInterval(bot._patrolInterval);
        bot._shootInterval = null;
        bot._patrolInterval = null;
    }

    function knockOutBot(bot) {
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

    function updateCooldownButton(btn, cdEl, readyAt, extraReady = true) {
        if (!btn) return;
        const secs = cooldownSeconds(readyAt, Date.now());
        const cooling = secs > 0;
        const ready = !cooling && extraReady && isGameLive();
        btn.disabled = !ready;
        btn.classList.toggle('is-cooling', cooling);
        if (cdEl) {
            if (cooling) {
                // Whole seconds only: 10…1 (grenade) / 60…1 (raptor)
                cdEl.hidden = false;
                cdEl.textContent = String(secs);
                cdEl.setAttribute('aria-label', `${secs} seconds remaining`);
            } else {
                cdEl.hidden = true;
                cdEl.textContent = '';
                cdEl.removeAttribute('aria-label');
            }
        }
    }

    function updateRaptorButton() {
        updateCooldownButton(raptorBtn, raptorCdEl, schedule.raptorReadyAt, !abilities.raptorInbound());
    }

    function updateGrenadeButton() {
        // Stay clickable while armed so a second press cancels
        updateCooldownButton(grenadeBtn, grenadeCdEl, abilities.grenadeArmed() ? 0 : schedule.grenadeReadyAt, true);
        if (!grenadeBtn) return;
        grenadeBtn.classList.toggle('is-armed', abilities.grenadeArmed());
        const label = grenadeBtn.querySelector('.cylon-raptor-btn-label');
        if (label) {
            label.textContent = abilities.grenadeArmed() ? 'Armed' : 'Grenade';
        }
        document.body.classList.toggle('cylon-grenade-armed', abilities.grenadeArmed());
    }

    function updateAbilityButtons() {
        updateRaptorButton();
        updateGrenadeButton();
    }

    function clearRaptorVisuals() {
        if (raptorEl) raptorEl.classList.remove('is-inbound');
        if (raptorImpactsEl) raptorImpactsEl.innerHTML = '';
    }

    function clearEyeDisorient() {
        schedule.eyeDisorientedUntil = 0;
        if (eye) eye.classList.remove('is-disoriented');
        if (glare) {
            glare.classList.remove('is-disoriented');
            if (!tracking) glare.classList.remove('is-active');
        }
    }

    /** Cooldowns / armed state do not carry across runs. */
    function resetAbilityCooldowns() {
        abilities.reset();
        document.body.classList.remove('cylon-grenade-armed');
        clearEyeDisorient();
        updateAbilityButtons();
    }

    /** The grenade lands: blast, scorches, letters and knock-outs (the arming and cooldown are in abilities). */
    function detonateGrenadeAt(pageX, pageY) {
        const x = pageX;
        const y = pageY;
        const blast = document.createElement('div');
        blast.className = 'cylon-grenade-blast';
        blast.style.left = `${x}px`;
        blast.style.top = `${y}px`;
        blast.setAttribute('aria-hidden', 'true');
        field.appendChild(blast);
        punchHole(x, y, HOLE_PRESETS.medium);
        // Light satellite scorches — grenade-scale terrain chew
        for (let i = 0; i < 2; i++) {
            const ang = Math.random() * Math.PI * 2;
            const dist = randRange(GRENADE_RADIUS * 0.35, GRENADE_RADIUS * 0.85);
            punchHole(x + Math.cos(ang) * dist, y + Math.sin(ang) * dist, {
                radius: randRange(36, 64),
                holdMs: HOLE_PRESETS.small.holdMs,
                fadeMs: HOLE_PRESETS.small.fadeMs
            });
        }
        // Letter AoE sized to the grenade blast (not the weak shot-scale radius)
        rearrangeLandscapePage(x, y, GRENADE_WEAPON_SCALE, {
            radius: GRENADE_RADIUS * 1.2
        });
        setTimeout(() => blast.remove(), 480);

        allBots().forEach((bot) => {
            if (bot.dataset.ko === '1') return;
            const bx = (parseFloat(bot.style.left) || 0) + BOT_SIZE.w / 2;
            const by = (parseFloat(bot.style.top) || 0) + BOT_SIZE.h / 2;
            if (Math.hypot(bx - x, by - y) <= GRENADE_RADIUS) {
                knockOutBot(bot);
            }
        });
    }

    function spawnRaptorImpacts() {
        if (!raptorImpactsEl) return;
        raptorImpactsEl.innerHTML = '';
        const count = 10;
        const impactRadius = 110;
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                if (!isGameLive()) return;
                const hit = document.createElement('span');
                hit.className = 'cylon-raptor-impact';
                const leftPct = 12 + Math.random() * 76;
                const topPct = 40 + Math.random() * 50;
                hit.style.left = `${leftPct}%`;
                hit.style.top = `${topPct}%`;
                raptorImpactsEl.appendChild(hit);
                const pageX = window.scrollX + (leftPct / 100) * window.innerWidth;
                const pageY = window.scrollY + (topPct / 100) * window.innerHeight;
                punchHole(pageX, pageY, HOLE_PRESETS.medium);
                rearrangeLandscapePage(pageX, pageY, RAPTOR_IMPACT_SCALE, {
                    radius: impactRadius
                });
                setTimeout(() => hit.remove(), 560);
            }, i * 55);
        }
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

    /** The raptor's strike band hits (the call, timing and cooldown are in abilities). */
    function strikeRaptorBand() {
        // Local sweep across the strike band — not a single global landscape rewrite
        const vw = window.innerWidth || 1;
        const vh = window.innerHeight || 1;
        const bandY = vh * 0.62;
        const strikeRadius = Math.min(220, vw * 0.28);
        for (let i = 0; i < 5; i++) {
            const cx = vw * (0.18 + i * 0.16);
            rearrangeLandscape(cx, bandY, RAPTOR_STRIKE_SCALE, { radius: strikeRadius });
        }
        spawnRaptorImpacts();
        wipeAllBotsWithScore();
    }

    function marchOrigin(spot) {
        // Enter from just outside the visible playfield, then march onto it
        return playfield.marchOrigin(visiblePlayfieldBounds(), spot, BOT_SIZE);
    }

    function ensureClearOfLinks(bot) {
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

    function moveBot(bot) {
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
            const node = pool[Math.floor(Math.random() * pool.length)];
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

    function startCombat(bot) {
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
        return rules.botCap(run.koScore, BOT_HARD_CAP);
    }

    function attachBotControls(bot) {
        // pointerdown so a second finger can KO while the first drags the pip
        bot.addEventListener('pointerdown', (e) => {
            if (!isGameLive()) return;
            if (bot.classList.contains('is-hiding')) return;
            if (reticlePointerId != null && e.pointerId === reticlePointerId) return;
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

    function finishBotArrival(bot) {
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
            ambushUnder.appendChild(bot);
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

    function scheduleAmbush(first = false) {
        clearTimeout(ambushTimer);
        const wait = first
            ? 2500 + Math.random() * 2500
            : 3500 + Math.random() * 4500;
        ambushTimer = setTimeout(() => {
            if (isGameLive()) launchWave();
            scheduleAmbush(false);
        }, wait);
    }

    function eyeClientCenter() {
        const er = eye.getBoundingClientRect();
        return {
            x: er.left + er.width / 2,
            y: er.top + er.height / 2
        };
    }

    function randRange(min, max) {
        return min + Math.random() * (max - min);
    }

    function readBodyNum(name, fallback) {
        const raw = document.body.style.getPropertyValue(name)
            || getComputedStyle(document.body).getPropertyValue(name);
        const n = parseFloat(raw);
        return Number.isFinite(n) ? n : fallback;
    }

    function blendToward(current, target, scale) {
        return current + (target - current) * scale;
    }

    /** Blast radius (page px) around the visible impact — scaled by weapon power. */
    function disruptRadiusForScale(scale) {
        const s = Math.max(0.05, Math.min(1.6, scale));
        // shot≈0.22 → ~130px · missile≈0.32 → ~150px · grenade≈0.48 → ~180px · nuke≈1.4 → ~350px
        return 90 + s * 180;
    }

    /** Aim the crack/ash hotspot at the impact without rewriting the whole scar field. */
    function aimBlastHotspot(clientX, clientY, scale) {
        const body = document.body;
        const vw = window.innerWidth || 1;
        const vh = window.innerHeight || 1;
        const s = Math.max(0.05, Math.min(1, scale));
        const blastX = Math.max(8, Math.min(92, (clientX / vw) * 100));
        const blastY = Math.max(10, Math.min(90, (clientY / vh) * 100));
        const blend = Math.min(1, 0.55 + s * 0.6);
        body.style.setProperty('--blast-x', `${blendToward(readBodyNum('--blast-x', 50), blastX, blend).toFixed(1)}%`);
        body.style.setProperty('--blast-y', `${blendToward(readBodyNum('--blast-y', 48), blastY, blend).toFixed(1)}%`);
        body.style.setProperty('--land-morph-ms', `${Math.round(280 + s * 420)}ms`);
    }

    /**
     * Reshuffle fracture / ash overlays and nudge nearby debris.
     * Global crack/ash rewrite only for full nukes (scale ≈ 1).
     * Grenade / Raptor / shots stay local letter AoE + blast hotspot.
     * @param {{ radius?: number }} [opts] optional on-screen letter kick radius override
     */
    function rearrangeLandscape(clientX, clientY, scale = 1, opts = {}) {
        if (!document.body.classList.contains('cylon-world-ended') && scale < 0.9) {
            if (scale < 0.99) return;
        }
        const s = Math.max(0.05, Math.min(1, scale));
        const pageX = clientX + scrollX();
        const pageY = clientY + scrollY();
        const radiusOpt = Number.isFinite(opts.radius) ? opts.radius : null;

        // Non-nuke weapons: local letter AoE + hotspot — never rewrite the whole backdrop
        if (s < 0.9) {
            aimBlastHotspot(clientX, clientY, s);
            disruptGlyphs(pageX, pageY, s, radiusOpt);
            return;
        }

        const body = document.body;
        const vw = window.innerWidth || 1;
        const vh = window.innerHeight || 1;
        const blastX = Math.max(8, Math.min(92, (clientX / vw) * 100));
        const blastY = Math.max(10, Math.min(90, (clientY / vh) * 100));

        body.style.setProperty('--blast-x', `${blendToward(readBodyNum('--blast-x', 50), blastX, Math.min(1, s * 1.15)).toFixed(1)}%`);
        body.style.setProperty('--blast-y', `${blendToward(readBodyNum('--blast-y', 48), blastY, Math.min(1, s * 1.15)).toFixed(1)}%`);
        body.style.setProperty('--crack-a', `${blendToward(readBodyNum('--crack-a', 118), randRange(70, 160), s).toFixed(1)}deg`);
        body.style.setProperty('--crack-b', `${blendToward(readBodyNum('--crack-b', 28), randRange(8, 70), s).toFixed(1)}deg`);
        body.style.setProperty('--crack-c', `${blendToward(readBodyNum('--crack-c', 155), randRange(120, 200), s).toFixed(1)}deg`);
        body.style.setProperty('--crack-grain', `${blendToward(readBodyNum('--crack-grain', -18), randRange(-40, 12), s).toFixed(1)}deg`);
        body.style.setProperty('--scar-1', `${blendToward(readBodyNum('--scar-1', 42), randRange(28, 48), s).toFixed(1)}%`);
        body.style.setProperty('--scar-2', `${blendToward(readBodyNum('--scar-2', 61), randRange(52, 72), s).toFixed(1)}%`);
        body.style.setProperty('--scar-3', `${blendToward(readBodyNum('--scar-3', 33), randRange(22, 42), s).toFixed(1)}%`);
        body.style.setProperty('--scar-4', `${blendToward(readBodyNum('--scar-4', 72), randRange(58, 82), s).toFixed(1)}%`);
        body.style.setProperty('--scar-5', `${blendToward(readBodyNum('--scar-5', 18), randRange(12, 30), s).toFixed(1)}%`);
        body.style.setProperty('--scar-6', `${blendToward(readBodyNum('--scar-6', 78), randRange(68, 88), s).toFixed(1)}%`);
        body.style.setProperty('--ash-1-x', `${blendToward(readBodyNum('--ash-1-x', 18), randRange(8, 40), s).toFixed(1)}%`);
        body.style.setProperty('--ash-1-y', `${blendToward(readBodyNum('--ash-1-y', 22), randRange(10, 40), s).toFixed(1)}%`);
        body.style.setProperty('--ash-2-x', `${blendToward(readBodyNum('--ash-2-x', 82), randRange(58, 92), s).toFixed(1)}%`);
        body.style.setProperty('--ash-2-y', `${blendToward(readBodyNum('--ash-2-y', 70), randRange(45, 85), s).toFixed(1)}%`);
        body.style.setProperty('--ash-3-x', `${blendToward(readBodyNum('--ash-3-x', 50), randRange(30, 70), s).toFixed(1)}%`);
        body.style.setProperty('--ash-3-y', `${blendToward(readBodyNum('--ash-3-y', 100), randRange(75, 105), s).toFixed(1)}%`);

        const shiftX = blendToward(readBodyNum('--land-shift-x', 0), randRange(-28, 28), s);
        const shiftY = blendToward(readBodyNum('--land-shift-y', 0), randRange(-22, 22), s);
        const landScale = blendToward(readBodyNum('--land-scale', 1), randRange(1.02, 1.1), s);
        const landRot = blendToward(readBodyNum('--land-rot', 0), randRange(-2.8, 2.8), s);
        body.style.setProperty('--land-shift-x', `${shiftX.toFixed(1)}px`);
        body.style.setProperty('--land-shift-y', `${shiftY.toFixed(1)}px`);
        body.style.setProperty('--ash-drift-x', `${(-shiftX * 0.35).toFixed(1)}px`);
        body.style.setProperty('--ash-drift-y', `${(-shiftY * 0.35).toFixed(1)}px`);
        body.style.setProperty('--land-rot', `${landRot.toFixed(2)}deg`);
        body.style.setProperty('--land-scale', `${landScale.toFixed(3)}`);
        body.style.setProperty('--ash-scale', `${(1 + (landScale - 1) * 0.4).toFixed(3)}`);
        body.style.setProperty('--land-morph-ms', `${Math.round(420 + s * 930)}ms`);

        disruptGlyphs(pageX, pageY, s, radiusOpt);
    }

    /**
     * Kick debris that is visually next to the blast (getBoundingClientRect).
     * Non-nuke weapons only touch individual letters — never parent blocks.
     * @param {number|null} radiusOverride explicit on-screen px radius (grenade/raptor blasts)
     */
    function disruptGlyphs(pageX, pageY, scale = 1, radiusOverride = null) {
        if (document.body.dataset.cylonScattered !== '1' || reduceMotion) return;
        const s = Math.max(0.05, Math.min(1.6, scale));
        const radius = Number.isFinite(radiusOverride) && radiusOverride > 0
            ? radiusOverride
            : disruptRadiusForScale(s);
        // Only full nuke-scale blasts may nudge blocks/panels
        const localOnly = s < 0.95;
        const selector = localOnly
            ? '.cylon-scatter-char'
            : '.cylon-scatter-char, .cylon-scatter-block, .cylon-scatter-panel';
        const nodes = [...document.querySelectorAll(selector)];
        const chance = Math.min(1, 0.7 + s * 0.3);
        const jitter = 55 * s;
        const pushMax = 48 + 200 * s;
        nodes.forEach((el) => {
            if (el.classList.contains('cylon-scatter-panel') && s < 1.1) return;
            const rect = el.getBoundingClientRect();
            // On-screen position after scatter transforms — “physically next to the blast”
            const cx = rect.left + rect.width / 2 + scrollX();
            const cy = rect.top + rect.height / 2 + scrollY();
            const awayX = cx - pageX;
            const awayY = cy - pageY;
            const awayDist = Math.hypot(awayX, awayY) || 1;
            if (awayDist > radius) return;
            if (Math.random() > chance) return;
            const sx = parseFloat(el.style.getPropertyValue('--sx')) || 0;
            const sy = parseFloat(el.style.getPropertyValue('--sy')) || 0;
            const sr = parseFloat(el.style.getPropertyValue('--sr')) || 0;
            const falloff = Math.max(0, 1 - awayDist / radius);
            const push = randRange(pushMax * 0.5, pushMax) * falloff;
            el.style.setProperty('--sx', `${(sx + (awayX / awayDist) * push + randRange(-jitter, jitter) * falloff).toFixed(1)}px`);
            el.style.setProperty('--sy', `${(sy + (awayY / awayDist) * push + randRange(-jitter, jitter) * falloff).toFixed(1)}px`);
            el.style.setProperty('--sr', `${(sr + randRange(-32, 32) * s * falloff).toFixed(1)}deg`);
        });
    }

    function rearrangeLandscapePage(pageX, pageY, scale = 1, opts = {}) {
        rearrangeLandscape(pageX - scrollX(), pageY - scrollY(), scale, opts);
    }

    function clearLandscapeVars() {
        [
            '--blast-x', '--blast-y', '--crack-a', '--crack-b', '--crack-c', '--crack-grain',
            '--scar-1', '--scar-2', '--scar-3', '--scar-4', '--scar-5', '--scar-6',
            '--ash-1-x', '--ash-1-y', '--ash-2-x', '--ash-2-y', '--ash-3-x', '--ash-3-y',
            '--land-shift-x', '--land-shift-y', '--ash-drift-x', '--ash-drift-y',
            '--land-rot', '--land-scale', '--ash-scale', '--land-morph-ms'
        ].forEach((k) => document.body.style.removeProperty(k));
    }

    function detonateNukeAt(clientX, clientY, { dealDamage = true, shake = true } = {}) {
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

    function beginCombatAfterIntro() {
        if (!settings.gameEnabled || run.gameOver) return;
        blowWorldEnded();
        // Intro detonate runs before glyphs exist — pulse letters once scatter is stamped
        const cx = (window.innerWidth || 1) / 2;
        const cy = (window.innerHeight || 1) * 0.48;
        const pageX = cx + scrollX();
        const pageY = cy + scrollY();
        requestAnimationFrame(() => {
            disruptGlyphs(pageX, pageY, 1.35);
            setTimeout(() => disruptGlyphs(pageX, pageY, 1.1), 280);
        });
        run = state.beginRun(run, Date.now());
        startInboundSchedulers();
        if (coarsePointer) {
            resetReticleToCenter();
            document.body.classList.add('cylon-touch-play');
        } else {
            paintReticle();
        }
        syncReticleVisibility();
        updateAbilityButtons();
    }

    function launchNuke() {
        if (!isGameLive() || isEyeDisoriented() || nukeInFlight) return;
        if (!nukeMissileEl) {
            detonateNukeAt(mouse.clientX, mouse.clientY);
            return;
        }

        nukeInFlight = true;
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

        const tick = (now) => {
            if (paused || !settings.gameEnabled || run.gameOver) {
                // Freeze flight clock while help overlay (or end state) holds the run
                started += now - last;
                last = now;
                if (!nukeInFlight) return;
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
                nukeInFlight = false;
                detonateNukeAt(x, y);
                return;
            }
            requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }

    function syncGameOverDismissButton() {
        if (!playAgainBtn) return;
        const quit = run.endReason === 'quit';
        playAgainBtn.textContent = quit ? 'Close' : 'Play Again';
        playAgainBtn.setAttribute(
            'aria-label',
            quit ? 'Close and return to the site' : 'Start a new run'
        );
    }

    function dismissGameOverPanel() {
        if (run.endReason === 'quit') {
            hideGameOver();
            run = state.clearGameOver(run);
            resetRunStats();
            return;
        }
        setGameEnabled(true);
    }

    function hideGameOver() {
        if (gameOverEl) gameOverEl.hidden = true;
        if (gameOverEntryEl) gameOverEntryEl.hidden = false;
        if (gameOverBoardEl) gameOverBoardEl.hidden = true;
        run = state.setEndReason(state.clearPendingScore(run), null);
    }

    async function showGameOver(reason) {
        if (!gameOverEl) return;
        run = state.setEndReason(run, reason);
        await fetchHighScores();
        const qualifies = scoreQualifiesForBoard(run.koScore);
        if (!qualifies) run = state.clearPendingScore(run);

        const reasons = {
            hits: 'You took too much fire. The eye cooked you.',
            nuke: 'A nuke landed on you. Frak.',
            quit: qualifies ? 'Run ended. Record your score?' : 'Run ended.'
        };
        if (gameOverReasonEl) {
            gameOverReasonEl.textContent = reasons[reason] || 'Run complete.';
        }
        if (gameOverKosEl) gameOverKosEl.textContent = String(run.koScore);
        if (gameOverHitsEl) gameOverHitsEl.textContent = String(currentHp());
        if (gameOverEntryEl) gameOverEntryEl.hidden = !qualifies;
        if (gameOverBoardEl) gameOverBoardEl.hidden = qualifies;
        syncGameOverDismissButton();
        gameOverEl.hidden = false;
        if (qualifies && initialLetters[0]) {
            resetInitials();
        }
    }

    function endGame(reason) {
        if (run.gameOver) return;
        run = state.endRun(run, reason);
        // Losses keep the session On (music, combat chrome, scatter). Quit turns it off.
        const keepSession = reason === 'hits' || reason === 'nuke';
        clearAllBots();
        clearInboundSchedulers();
        clearHealTimer();
        clearTimeout(idleTimer);
        setEyeTracking(false);
        intro.cancel();
        draggingReticle = false;
        reticlePointerId = null;
        resetAbilityCooldowns();
        if (!keepSession) {
            settings.gameEnabled = false;
            saveSettings();
            document.body.classList.remove('cylon-touch-play');
        }
        syncGameToggleUi();
        syncReticleVisibility();
        audio.syncMusic();
        if (!keepSession) {
            syncWorldEndedLook();
        }
        showGameOver(reason);
    }

    function resetRunStats() {
        run = state.resetScore(run);
        clearHealTimer();
        if (scoreEl) scoreEl.textContent = '0';
        updateHitsUi();
    }

    function revealHighScoreBoard() {
        if (gameOverEntryEl) gameOverEntryEl.hidden = true;
        if (gameOverBoardEl) gameOverBoardEl.hidden = false;
        syncGameOverDismissButton();
        fetchHighScores();
    }

    function setGameEnabled(on) {
        const wasOn = settings.gameEnabled;
        if (!on && wasOn && !run.gameOver) {
            // Voluntary stop — offer initials only if the run can make the board
            if (run.koScore > 0) {
                endGame('quit');
                return;
            }
        }
        settings.gameEnabled = on;
        saveSettings();
        if (!on) {
            intro.cancel();
            clearAllBots();
            clearInboundSchedulers();
            clearHealTimer();
            run = state.stopClock(run);
            clearTimeout(idleTimer);
            setEyeTracking(false);
            draggingReticle = false;
            reticlePointerId = null;
            paused = false;
            pauseStartedAt = 0;
            document.body.classList.remove('cylon-touch-play');
            hideGameOver();
            run = state.clearPendingScore(state.clearGameOver(run));
            if (helpEl && !helpEl.hidden) {
                helpEl.hidden = true;
            }
            resetAbilityCooldowns();
            syncGameToggleUi();
            syncReticleVisibility();
            audio.syncMusic();
            syncWorldEndedLook();
        } else {
            intro.cancel();
            clearAllBots();
            clearInboundSchedulers();
            hideGameOver();
            resetRunStats();
            resetAbilityCooldowns();
            syncGameToggleUi();
            syncReticleVisibility();
            audio.syncMusic();
            // Combat chrome on; page stays intact until the intro nuke hits
            syncWorldEndedLook({ deferScatter: true });
            intro.play();
        }
    }

    function bindGameOverUi() {
        if (initialsRoot) {
            initialsRoot.addEventListener('click', (e) => {
                const spin = e.target.closest('.cylon-initial-spin');
                if (spin) {
                    e.preventDefault();
                    const idx = Number(spin.dataset.initial);
                    const dir = Number(spin.dataset.dir) || 1;
                    scrollInitial(idx, dir);
                    return;
                }
                const letter = e.target.closest('.cylon-initial');
                if (letter) {
                    setActiveInitial(Number(letter.dataset.initial) || 0);
                }
            });

            initialsRoot.addEventListener('wheel', (e) => {
                if (gameOverEntryEl?.hidden) return;
                const slot = e.target.closest('.cylon-initial-slot');
                if (!slot) return;
                e.preventDefault();
                const letter = slot.querySelector('.cylon-initial');
                const idx = letter ? Number(letter.dataset.initial) : activeInitialIdx;
                scrollInitial(idx, e.deltaY < 0 ? 1 : -1);
            }, { passive: false });
        }

        initialLetters.forEach((el, idx) => {
            if (!el) return;
            el.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    scrollInitial(idx, 1);
                } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    scrollInitial(idx, -1);
                } else if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    setActiveInitial(idx - 1);
                } else if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Spacebar') {
                    e.preventDefault();
                    if (idx < 2) setActiveInitial(idx + 1);
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    scoreSubmitBtn?.click();
                }
            });
        });

        if (scoreSubmitBtn) {
            scoreSubmitBtn.addEventListener('click', async () => {
                const initials = readInitials();
                const score = run.pendingScore ? run.pendingScore.score : run.koScore;
                scoreSubmitBtn.disabled = true;
                const ok = await submitHighScore(score, initials);
                scoreSubmitBtn.disabled = false;
                if (!ok) return;
                run = state.clearPendingScore(run);
                revealHighScoreBoard();
            });
        }

        const scoreSkipBtn = document.getElementById('cylon-score-skip');
        if (scoreSkipBtn) {
            scoreSkipBtn.addEventListener('click', () => {
                run = state.clearPendingScore(run);
                revealHighScoreBoard();
            });
        }

        if (playAgainBtn) {
            playAgainBtn.addEventListener('click', () => {
                dismissGameOverPanel();
            });
        }
    }

    function isTypingTarget(el) {
        const tag = (el && el.tagName) || '';
        return tag === 'INPUT' || tag === 'TEXTAREA' || (el && el.isContentEditable);
    }

    function bindAbilityControls() {
        const bindAbilityTap = (btn, action) => {
            if (!btn) return;
            // pointerup so a second finger can fire abilities while the first drags the pip
            btn.addEventListener('pointerup', (e) => {
                if (reticlePointerId != null && e.pointerId === reticlePointerId) return;
                if (e.pointerType === 'mouse' && e.button != null && e.button !== 0) return;
                e.preventDefault();
                e.stopPropagation();
                action();
            });
            // Keep click for keyboard / accessibility activation
            btn.addEventListener('click', (e) => {
                if (e.detail === 0) {
                    e.preventDefault();
                    action();
                } else {
                    e.preventDefault();
                }
            });
        };
        bindAbilityTap(raptorBtn, () => { abilities.callRaptor(); });
        bindAbilityTap(grenadeBtn, () => { abilities.readyGrenade(); });
        window.addEventListener('keydown', (e) => {
            if (isTypingTarget(e.target)) return;
            // Don't steal browser shortcuts (Ctrl/Cmd+R refresh, etc.)
            if (e.ctrlKey || e.metaKey || e.altKey) return;
            if (e.key === 'Escape') {
                abilities.cancelGrenadeArm();
                return;
            }
            if (e.key === 'r' || e.key === 'R') {
                e.preventDefault();
                abilities.callRaptor();
            } else if (e.key === 'g' || e.key === 'G') {
                e.preventDefault();
                abilities.readyGrenade();
            }
        });
        // Next click after arming throws at the click point
        window.addEventListener('pointerdown', (e) => {
            if (!abilities.grenadeArmed()) return;
            if (e.button != null && e.button !== 0) return;
            const t = e.target;
            if (t && (t.closest('#cylon-grenade-btn')
                || t.closest('#cylon-raptor-btn')
                || t.closest('#cylon-game-toggle')
                || t.closest('#cylon-settings')
                || t.closest('#theme-toggle')
                || t.closest('#site-nav-burger')
                || t.closest('#site-nav-menu a')
                || t.closest('#cylon-help-btn')
                || t.closest('#cylon-help')
                || t.closest('.site-brand')
                || t.closest('#cylon-gameover'))) {
                return;
            }
            e.preventDefault();
            abilities.throwGrenadeAt(e.pageX, e.pageY);
        }, true);
        clearInterval(abilityCdTimer);
        abilityCdTimer = setInterval(updateAbilityButtons, 250);
        updateAbilityButtons();
    }

    function bindGameToggle() {
        if (!gameToggleBtn) return;
        syncGameToggleUi();
        gameToggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            setGameEnabled(!settings.gameEnabled);
        });
    }

    function bindSettings() {
        if (!settingsRoot) return;
        syncSettingsUi();

        const toggleBtn = document.getElementById('cylon-settings-toggle');
        const panel = document.getElementById('cylon-settings-panel');
        if (toggleBtn && panel) {
            toggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const open = panel.hasAttribute('hidden');
                if (open) {
                    fetchHighScores();
                    panel.removeAttribute('hidden');
                } else {
                    panel.setAttribute('hidden', '');
                }
                toggleBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
            });
            document.addEventListener('click', (e) => {
                if (!settingsRoot.contains(e.target)) {
                    panel.setAttribute('hidden', '');
                    toggleBtn.setAttribute('aria-expanded', 'false');
                }
            });
        }

        const applySettingInput = (input) => {
            const key = input.getAttribute('data-setting');
            if (!key) return;
            if (input.type === 'checkbox') {
                settings[key] = input.checked;
            } else if (input.type === 'range') {
                settings[key] = Math.max(0, Math.min(100, Number(input.value) || 0));
            } else {
                settings[key] = Boolean(input.value);
            }
            saveSettings();
            if (key === 'eyeEnabled' && !settings.eyeEnabled) {
                setEyeTracking(false);
            }
            audio.settingChanged(key);
        };

        settingsRoot.querySelectorAll('[data-setting]').forEach((input) => {
            input.addEventListener('change', () => applySettingInput(input));
            if (input.type === 'range') {
                input.addEventListener('input', () => applySettingInput(input));
            }
        });
    }

    window.cylonStartGame = () => {
        if (settings.gameEnabled || run.gameOver) return;
        setGameEnabled(true);
        window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    };

    bindSettings();
    bindGameToggle();
    bindAbilityControls();
    bindGameOverUi();
    bindPlayerMissShots();
    bindReticle();
    bindPlayScrollLock();
    bindNavMenu();
    bindHelp();
    resizeBattlefield();
    updateHitsUi();
    syncNavChrome();
    syncReticleVisibility();
    renderHighScores();
    fetchHighScores();
    window.addEventListener('resize', resizeBattlefield);

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointerdown', audio.unlock, { passive: true });
    window.addEventListener('keydown', audio.unlock, { passive: true });
    // Kill double-click / drag text selection over page content during a run
    document.addEventListener('selectstart', (e) => {
        if (document.body.classList.contains('cylon-game-live')) e.preventDefault();
    });
    document.addEventListener('dragstart', (e) => {
        if (document.body.classList.contains('cylon-game-live')) e.preventDefault();
    });
    requestAnimationFrame(updateEye);
    scheduleAmbush(true);
}
