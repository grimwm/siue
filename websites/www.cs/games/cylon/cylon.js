/**
 * Cylon Defense — game logic.
 * Loaded after main.js (site shell: nav, theme, applyCombatTheme).
 * Phase 3: overlays live in games/cylon/mount.html → #game-root.
 */

// Host blocks .html under games/ — serve mount from home-dir root (see cylon-mount.html symlink)
const CYLON_MOUNT_URL = 'cylon-mount.html?v=20261006ck';

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

async function initializeCylonEffects() {
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
    const BOT_CAP_START = 4;
    const BOT_CAP_PER_KOS = 5;
    const BOT_HARD_CAP = coarsePointer ? 10 : 30;
    if (reduceMotion) return;

    let draggingReticle = false;
    let reticlePointerId = null;

    const SETTINGS_KEY = 'cylon-settings';
    const SCORES_API = 'scores.php';
    const HIGH_SCORE_LIMIT = 10; // keep in sync with scores.php MAX_SCORES
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
    let koScore = 0;
    let hitCount = 0;
    /** Lifetime damage this run (heals do not undo it). */
    let hitsTaken = 0;
    let healTimer = null;
    let healDueAt = 0;
    let gameOver = false;
    /** Why the overlay is up: hits | nuke | quit */
    let gameOverEndReason = null;
    let paused = false;
    let pauseStartedAt = 0;
    let pendingScore = null;
    let audioCtx = null;
    let sfxBus = null;
    let musicBus = null;
    let musicMaster = null;
    let musicNodes = [];
    let musicTimer = null;
    let musicPlaying = false;
    let ambushTimer = null;
    let raptorReadyAt = 0;
    let raptorInbound = false;
    /** @type {ReturnType<typeof setTimeout>[]} */
    let raptorStrikeTimers = [];
    let abilityCdTimer = null;
    let eyeDisorientedUntil = 0;
    let grenadeReadyAt = 0;
    let grenadeArmed = false;
    let nukeInFlight = false;
    let introPlaying = false;
    let introGen = 0;
    let runStartedAt = 0;
    let lastAim = { clientX: 0, clientY: 0, t: 0 };
    let missileTimer = null;
    let nukeTimer = null;
    /** @type {{ el: HTMLElement, tracker: boolean, alive: boolean }[]} */
    let activeMissiles = [];
    let missileDueAt = 0;
    let nukeDueAt = 0;
    let herdTimer = null;
    let cachedHighScores = [];

    const IDLE_MS = 2000;
    const BOT_SIZE = { w: 44, h: 56 };
    const LINK_PAD = 28;
    const HIT_RADIUS = 52;
    const BOLT_HIT_RADIUS = 44;
    const MAX_HITS = 30;
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
    const MISSILE_TRACKER_CHANCE_BASE = 0.14;
    const MISSILE_TRACKER_CAP_MAX = 3;
    const MISSILE_GROUND_CAP_MAX = 5;
    let trackerPairTimer = null;
    /** @type {ReturnType<typeof setTimeout>[]} */
    let groundVolleyTimers = [];
    const RAPTOR_COOLDOWN_MS = 60000;
    const RAPTOR_STRIKE_AT_MS = 700;
    const EYE_DISORIENT_MS = 30000;
    const GRENADE_COOLDOWN_MS = 10000;
    const GRENADE_RADIUS = 165; // ~50% larger than prior 110px
    const MAX_HOLES = 24;
    const HOLE_PRESETS = {
        small: { radius: 56, holdMs: 800, fadeMs: 1000 },
        medium: { radius: GRENADE_RADIUS, holdMs: 2500, fadeMs: 2000 },
        // radius filled at punch time from viewport
        large: { radius: 0, holdMs: 4000, fadeMs: 3000 }
    };
    let activeHoles = [];

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

    function formatHighScoreRows(list) {
        if (!list.length) {
            return '<li class="cylon-hs-empty">No scores yet</li>';
        }
        return list.map((entry, i) => {
            const when = entry.at ? new Date(entry.at) : null;
            const date = when && !Number.isNaN(when.getTime())
                ? when.toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                })
                : '';
            const initials = (entry.initials || 'AAA').toString().slice(0, 3).toUpperCase();
            const dateHtml = date
                ? `<span class="cylon-hs-date">${date}</span>`
                : '<span class="cylon-hs-date"></span>';
            return `<li><span class="cylon-hs-rank">#${i + 1}</span><strong class="cylon-hs-initials">${initials}</strong>${dateHtml}<span class="cylon-hs-score">${entry.score} KOs</span></li>`;
        }).join('');
    }

    function renderHighScores(list = cachedHighScores) {
        if (highScoresEl) highScoresEl.innerHTML = formatHighScoreRows(list);
        if (gameOverScoresEl) gameOverScoresEl.innerHTML = formatHighScoreRows(list);
    }

    async function fetchHighScores() {
        try {
            const res = await fetch(SCORES_API, { cache: 'no-store' });
            if (!res.ok) throw new Error('bad status');
            const data = await res.json();
            cachedHighScores = Array.isArray(data.scores) ? data.scores : [];
            renderHighScores();
        } catch {
            renderHighScores(cachedHighScores);
        }
    }

    /** True when score earns a board slot: open seats, or strictly above the lowest shown. */
    function scoreQualifiesForBoard(score, list = cachedHighScores) {
        if (score < 1) return false;
        if (!list || list.length < HIGH_SCORE_LIMIT) return true;
        let lowest = Infinity;
        for (const entry of list) {
            const s = Number(entry.score) || 0;
            if (s < lowest) lowest = s;
        }
        return score > lowest;
    }

    function readInitialLetter(el) {
        const ch = ((el && el.textContent) || 'A').toUpperCase().replace(/[^A-Z]/g, '');
        return ch.charAt(0) || 'A';
    }

    function readInitials() {
        return initialLetters.map(readInitialLetter).join('').slice(0, 3).padEnd(3, 'A');
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
        setActiveInitial(idx);
    }

    function resetInitials() {
        initialLetters.forEach((el) => {
            if (el) el.textContent = 'A';
        });
        setActiveInitial(0);
    }

    async function submitHighScore(score, initials) {
        if (!score || score < 1) return;
        try {
            const res = await fetch(SCORES_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    score,
                    hits: pendingScore ? pendingScore.hits : hitsTaken,
                    initials: initials || 'AAA'
                }),
                cache: 'no-store'
            });
            if (!res.ok) throw new Error('bad status');
            const data = await res.json();
            cachedHighScores = Array.isArray(data.scores) ? data.scores : cachedHighScores;
            renderHighScores();
        } catch {
            renderHighScores(cachedHighScores);
        }
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

    function volumeToGain(pct, bus = 'sfx') {
        const t = Math.max(0, Math.min(100, Number(pct) || 0)) / 100;
        if (bus === 'music') {
            // UI 50% ≈ former max * 1.25; slider stays at 50 by default
            return Math.min(2.5, (t / 0.5) * 1.25);
        }
        // SFX: UI 50 ≈ former default at 85 (0.85²); 100 still reaches full gain
        const internalPct = t <= 0.5
            ? (t / 0.5) * 85
            : 85 + ((t - 0.5) / 0.5) * 15;
        const u = internalPct / 100;
        return u * u;
    }

    function ensureAudioContext() {
        if (!audioCtx) {
            const Ctx = window.AudioContext || window.webkitAudioContext;
            if (!Ctx) return null;
            audioCtx = new Ctx();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume().catch(() => {});
        }
        if (!sfxBus) {
            sfxBus = audioCtx.createGain();
            sfxBus.connect(audioCtx.destination);
        }
        if (!musicBus) {
            musicBus = audioCtx.createGain();
            musicBus.connect(audioCtx.destination);
        }
        applyBusVolumes();
        return audioCtx;
    }

    function applyBusVolumes() {
        if (sfxBus) {
            sfxBus.gain.value = settings.soundEnabled ? volumeToGain(settings.soundVolume, 'sfx') : 0;
        }
        if (musicBus) {
            // Keep the bed going through game-over overlays (session still On)
            const on = settings.musicEnabled && sessionActive() && musicPlaying;
            const target = on ? volumeToGain(settings.musicVolume, 'music') : 0;
            if (audioCtx) {
                const now = audioCtx.currentTime;
                // Hard set — avoid delayed automation that can mute a just-started bed
                musicBus.gain.cancelScheduledValues(now);
                musicBus.gain.setValueAtTime(target, now);
            } else {
                musicBus.gain.value = target;
            }
        }
    }

    function ensureAudio() {
        if (!settings.soundEnabled || settings.soundVolume <= 0) return null;
        return ensureAudioContext();
    }

    /** Prime/resume audio on the first real user gesture so later SFX/music aren't delayed. */
    function unlockAudioFromGesture() {
        if (!settings.soundEnabled && !settings.musicEnabled) return;
        const ctx = ensureAudioContext();
        if (!ctx || unlockAudioFromGesture._primed) return;

        const prime = () => {
            if (unlockAudioFromGesture._primed || ctx.state !== 'running') return;
            const g = ctx.createGain();
            g.gain.value = 0.0001;
            const osc = ctx.createOscillator();
            osc.connect(g);
            g.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.01);
            unlockAudioFromGesture._primed = true;
            syncMusic();
        };

        if (ctx.state === 'running') {
            prime();
        } else {
            ctx.resume().then(prime).catch(() => {});
        }
    }

    function stopMusic(fade = true) {
        if (musicTimer) {
            clearInterval(musicTimer);
            musicTimer = null;
        }
        const ctx = audioCtx;
        const master = musicMaster;
        const nodes = musicNodes;
        musicPlaying = false;
        musicMaster = null;
        musicNodes = [];
        applyBusVolumes();
        if (!ctx || !master) return;
        const now = ctx.currentTime;
        const teardown = () => {
            nodes.forEach((node) => {
                try {
                    if (typeof node.stop === 'function') node.stop();
                } catch { /* already stopped */ }
                try { node.disconnect(); } catch { /* ignore */ }
            });
            try { master.disconnect(); } catch { /* ignore */ }
        };
        try {
            if (fade) {
                master.gain.cancelScheduledValues(now);
                master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), now);
                master.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
                setTimeout(teardown, 950);
            } else {
                master.gain.value = 0;
                teardown();
            }
        } catch {
            teardown();
        }
    }

    function pulseTaiko(ctx, master, when, gain = 0.09) {
        const osc = ctx.createOscillator();
        const thump = ctx.createOscillator();
        const g = ctx.createGain();
        const tg = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(200, when);
        filter.frequency.exponentialRampToValueAtTime(55, when + 0.45);
        osc.type = 'sine';
        thump.type = 'triangle';
        osc.frequency.setValueAtTime(85, when);
        osc.frequency.exponentialRampToValueAtTime(32, when + 0.5);
        thump.frequency.setValueAtTime(52, when);
        thump.frequency.exponentialRampToValueAtTime(24, when + 0.4);
        g.gain.setValueAtTime(0.0001, when);
        g.gain.exponentialRampToValueAtTime(gain, when + 0.015);
        g.gain.exponentialRampToValueAtTime(0.0001, when + 0.85);
        tg.gain.setValueAtTime(0.0001, when);
        tg.gain.exponentialRampToValueAtTime(gain * 0.75, when + 0.02);
        tg.gain.exponentialRampToValueAtTime(0.0001, when + 0.55);
        osc.connect(filter);
        filter.connect(g);
        g.connect(master);
        thump.connect(tg);
        tg.connect(master);
        osc.start(when);
        thump.start(when);
        osc.stop(when + 0.9);
        thump.stop(when + 0.6);
    }

    function pulseRitualHit(ctx, master, when, gain = 0.035) {
        const len = Math.floor(ctx.sampleRate * 0.18);
        const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 1.4);
        const src = ctx.createBufferSource();
        const g = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 380;
        filter.Q.value = 0.7;
        src.buffer = buffer;
        g.gain.setValueAtTime(gain, when);
        g.gain.exponentialRampToValueAtTime(0.0001, when + 0.18);
        src.connect(filter);
        filter.connect(g);
        g.connect(master);
        src.start(when);
        src.stop(when + 0.2);
    }

    function playDarkHorn(ctx, master, when, freq, dur = 3.2, gain = 0.04) {
        const osc = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const osc3 = ctx.createOscillator();
        const g = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(480, when);
        filter.frequency.linearRampToValueAtTime(280, when + dur);
        osc.type = 'sawtooth';
        osc2.type = 'triangle';
        osc3.type = 'sine';
        osc.frequency.setValueAtTime(freq, when);
        osc2.frequency.setValueAtTime(freq * 1.498, when); // fifth
        osc3.frequency.setValueAtTime(freq * 0.5, when);
        const attack = Math.min(1.1, dur * 0.35);
        g.gain.setValueAtTime(0.0001, when);
        g.gain.linearRampToValueAtTime(gain, when + attack);
        g.gain.linearRampToValueAtTime(gain * 0.7, when + dur * 0.7);
        g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
        osc.connect(filter);
        osc2.connect(filter);
        osc3.connect(filter);
        filter.connect(g);
        g.connect(master);
        osc.start(when);
        osc2.start(when);
        osc3.start(when);
        osc.stop(when + dur + 0.05);
        osc2.stop(when + dur + 0.05);
        osc3.stop(when + dur + 0.05);
    }

    function playTensionStrand(ctx, master, when, freq, dur = 4, gain = 0.012) {
        const osc = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'triangle';
        osc2.type = 'sine';
        // Slight beating dissonance
        osc.frequency.setValueAtTime(freq, when);
        osc2.frequency.setValueAtTime(freq * 1.02, when);
        g.gain.setValueAtTime(0.0001, when);
        g.gain.linearRampToValueAtTime(gain, when + 1.5);
        g.gain.linearRampToValueAtTime(gain * 0.5, when + dur * 0.8);
        g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
        osc.connect(g);
        osc2.connect(g);
        g.connect(master);
        osc.start(when);
        osc2.start(when);
        osc.stop(when + dur + 0.05);
        osc2.stop(when + dur + 0.05);
    }

    /** Combat session chrome / music — stays true through game-over until Game Off. */
    function sessionActive() {
        return settings.gameEnabled && !paused;
    }

    /** Actively fighting — false during intro cinematic and game-over overlays. */
    function isGameLive() {
        return sessionActive() && !gameOver && !introPlaying;
    }

    function startMusic() {
        if (musicPlaying || !settings.musicEnabled || settings.musicVolume <= 0 || !sessionActive()) return;
        const ctx = ensureAudioContext();
        if (!ctx || !musicBus) return;

        const begin = () => {
            if (musicPlaying || !settings.musicEnabled || !sessionActive()) return;

            if (musicTimer) {
                clearInterval(musicTimer);
                musicTimer = null;
            }
            if (musicMaster) {
                const oldMaster = musicMaster;
                const oldNodes = musicNodes;
                musicMaster = null;
                musicNodes = [];
                oldNodes.forEach((node) => {
                    try {
                        if (typeof node.stop === 'function') node.stop();
                    } catch { /* ignore */ }
                    try { node.disconnect(); } catch { /* ignore */ }
                });
                try { oldMaster.disconnect(); } catch { /* ignore */ }
            }

            const master = ctx.createGain();
            master.gain.value = 0.0001;
            master.connect(musicBus);

            // Dark, forboding bed — original synthesis in the spirit of slow McCreary
            // dread cues (not a recreation of any copyrighted track).
            const droneA = ctx.createOscillator();
            const droneB = ctx.createOscillator();
            const droneC = ctx.createOscillator();
            const droneGain = ctx.createGain();
            const droneFilter = ctx.createBiquadFilter();
            droneA.type = 'sawtooth';
            droneB.type = 'sine';
            droneC.type = 'triangle';
            droneA.frequency.value = 36.71; // D1
            droneB.frequency.value = 55.0; // A1
            droneC.frequency.value = 38.89; // Eb1 — grinding against D
            droneFilter.type = 'lowpass';
            droneFilter.frequency.value = 160;
            droneFilter.Q.value = 0.6;
            droneGain.gain.value = 0.07;
            droneA.connect(droneFilter);
            droneB.connect(droneFilter);
            droneC.connect(droneFilter);
            droneFilter.connect(droneGain);
            droneGain.connect(master);

            const pad = ctx.createOscillator();
            const pad2 = ctx.createOscillator();
            const padGain = ctx.createGain();
            const padFilter = ctx.createBiquadFilter();
            pad.type = 'sawtooth';
            pad2.type = 'triangle';
            pad.frequency.value = 73.42; // D2
            pad2.frequency.value = 87.31; // F2
            padFilter.type = 'lowpass';
            padFilter.frequency.value = 320;
            padGain.gain.value = 0.028;
            pad.connect(padFilter);
            pad2.connect(padFilter);
            padFilter.connect(padGain);
            padGain.connect(master);

            const lfo = ctx.createOscillator();
            const lfoGain = ctx.createGain();
            lfo.type = 'sine';
            lfo.frequency.value = 0.04;
            lfoGain.gain.value = 30;
            lfo.connect(lfoGain);
            lfoGain.connect(droneFilter.frequency);

            const now = ctx.currentTime;
            droneA.start(now);
            droneB.start(now);
            droneC.start(now);
            pad.start(now);
            pad2.start(now);
            lfo.start(now);

            // Slow chord breath under the bed
            pad.frequency.setValueAtTime(73.42, now);
            pad2.frequency.setValueAtTime(87.31, now);
            pad.frequency.setValueAtTime(73.42, now + 8);
            pad2.frequency.linearRampToValueAtTime(92.5, now + 16); // F# tension
            pad.frequency.linearRampToValueAtTime(65.41, now + 24); // C
            pad2.frequency.linearRampToValueAtTime(98.0, now + 24); // G
            pad.frequency.linearRampToValueAtTime(73.42, now + 32);
            pad2.frequency.linearRampToValueAtTime(87.31, now + 32);

            master.gain.setValueAtTime(0.0001, now);
            master.gain.exponentialRampToValueAtTime(1, now + 1.2);

            musicMaster = master;
            musicNodes = [
                droneA, droneB, droneC, pad, pad2, lfo,
                droneGain, padGain, droneFilter, padFilter, lfoGain
            ];
            musicPlaying = true;
            applyBusVolumes();

            // Slow ritual pulse — doom, not chip-tune
            const bpm = 50;
            const beat = 60 / bpm;
            const hornNotes = [73.42, 69.3, 65.41, 87.31, 73.42, 55.0, 82.41, 73.42];
            const strands = [293.66, 311.13, 277.18, 349.23];
            let bar = 0;

            const scheduleWindow = () => {
                if (!musicPlaying || !audioCtx || !musicMaster) return;
                const t = audioCtx.currentTime + 0.05;
                // One 4-beat bar per call — sparse on purpose
                const when0 = t;
                const when2 = t + beat * 2;

                pulseTaiko(audioCtx, musicMaster, when0, bar % 2 === 0 ? 0.11 : 0.08);
                if (bar % 2 === 1) {
                    pulseTaiko(audioCtx, musicMaster, when2, 0.06);
                } else {
                    pulseRitualHit(audioCtx, musicMaster, when2, 0.03);
                }

                // Long dark horn every bar — changes pitch so it moves
                playDarkHorn(
                    audioCtx,
                    musicMaster,
                    when0 + beat * 0.15,
                    hornNotes[bar % hornNotes.length],
                    beat * 3.4,
                    0.038
                );

                // High tension strand every other bar
                if (bar % 2 === 0) {
                    playTensionStrand(
                        audioCtx,
                        musicMaster,
                        when0 + beat * 0.5,
                        strands[(bar / 2) % strands.length],
                        beat * 3.6,
                        0.014
                    );
                }

                // Heavier double-hit as intensity marker
                if (bar % 4 === 3) {
                    pulseTaiko(audioCtx, musicMaster, when0 + beat * 0.75, 0.07);
                    pulseRitualHit(audioCtx, musicMaster, when0 + beat * 1.1, 0.04);
                }

                bar += 1;
            };

            scheduleWindow();
            musicTimer = setInterval(scheduleWindow, 4 * beat * 1000 - 40);
        };

        if (ctx.state === 'suspended') {
            ctx.resume().then(begin).catch(() => {});
        } else {
            begin();
        }
    }

    function syncMusic() {
        const want = sessionActive() && settings.musicEnabled && settings.musicVolume > 0;
        if (want) {
            if (!musicPlaying) startMusic();
            else applyBusVolumes();
        } else {
            stopMusic(true);
        }
    }

    function assignBlastVector(el, vw, vh, { xSpread = 1.15, ySpread = 1.2, rotMax = 180 } = {}) {
        const dx = (Math.random() - 0.5) * vw * xSpread;
        const dy = (Math.random() - 0.5) * vh * ySpread;
        const rot = (Math.random() - 0.5) * rotMax;
        el.style.setProperty('--sx', `${dx.toFixed(1)}px`);
        el.style.setProperty('--sy', `${dy.toFixed(1)}px`);
        el.style.setProperty('--sr', `${rot.toFixed(1)}deg`);
    }

    /** Record layout home while glyphs-blown is off (must be in-DOM). */
    function stampGlyphOrigins(root) {
        root.querySelectorAll('.cylon-scatter-char, .cylon-scatter-block, .cylon-scatter-panel').forEach((el) => {
            const r = el.getBoundingClientRect();
            el.dataset.ox = String(r.left + r.width / 2 + scrollX());
            el.dataset.oy = String(r.top + r.height / 2 + scrollY());
        });
        // Panel root itself may be the scatter-panel
        if (root.classList.contains('cylon-scatter-panel')) {
            const r = root.getBoundingClientRect();
            root.dataset.ox = String(r.left + r.width / 2 + scrollX());
            root.dataset.oy = String(r.top + r.height / 2 + scrollY());
        }
    }

    function scatterPageGlyphs() {
        if (document.body.dataset.cylonScattered === '1') return;
        if (reduceMotion) return;
        const vw = window.innerWidth || 800;
        const vh = window.innerHeight || 600;
        const roots = document.querySelectorAll('.page-panel');
        roots.forEach((root) => {
            // Panel shell itself is debris — not just the letters inside
            root.classList.add('cylon-scatter-panel');
            assignBlastVector(root, vw, vh, { xSpread: 0.55, ySpread: 0.7, rotMax: 28 });

            root.querySelectorAll(
                'h1, h2, h3, .page-lead, .contact-block, .interest-list, .course-list, .project-list, .project-list > li, aside, .games-hub-card, .games-home-callout'
            ).forEach((block) => {
                block.classList.add('cylon-scatter-block');
                assignBlastVector(block, vw, vh, { xSpread: 1.15, ySpread: 1.25, rotMax: 150 });
            });

            const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
                acceptNode(node) {
                    if (!node.nodeValue || !/\S/.test(node.nodeValue)) return NodeFilter.FILTER_REJECT;
                    if (node.parentElement?.closest('.cylon-scatter-char')) return NodeFilter.FILTER_REJECT;
                    return NodeFilter.FILTER_ACCEPT;
                }
            });
            const texts = [];
            while (walker.nextNode()) texts.push(walker.currentNode);
            texts.forEach((textNode) => {
                const frag = document.createDocumentFragment();
                for (const ch of textNode.nodeValue) {
                    if (ch === ' ' || ch === '\n' || ch === '\t') {
                        frag.appendChild(document.createTextNode(ch));
                        continue;
                    }
                    const span = document.createElement('span');
                    span.className = 'cylon-scatter-char';
                    span.textContent = ch;
                    // Spread across the full viewport — planetary nuke debris field
                    assignBlastVector(span, vw, vh, { xSpread: 1.35, ySpread: 1.4, rotMax: 220 });
                    frag.appendChild(span);
                }
                textNode.parentNode.replaceChild(frag, textNode);
            });
            // Give list markers their own blast vectors (CSS reads --mx/--my/--mr)
            root.querySelectorAll('.interest-list li, .course-list li').forEach((li) => {
                const dx = (Math.random() - 0.5) * vw * 0.35;
                const dy = (Math.random() - 0.5) * vh * 0.4;
                const rot = (Math.random() - 0.5) * 120;
                li.style.setProperty('--mx', `${dx.toFixed(1)}px`);
                li.style.setProperty('--my', `${dy.toFixed(1)}px`);
                li.style.setProperty('--mr', `${rot.toFixed(1)}deg`);
            });
            // After chars are in the tree, stamp page-home for weapon AoE tests
            stampGlyphOrigins(root);
        });
        document.body.dataset.cylonScattered = '1';
    }

    function restorePageGlyphs() {
        if (document.body.dataset.cylonScattered !== '1') return;
        document.querySelectorAll('.cylon-scatter-char').forEach((span) => {
            span.replaceWith(document.createTextNode(span.textContent || ''));
        });
        document.querySelectorAll('.interest-list li, .course-list li').forEach((li) => {
            li.style.removeProperty('--mx');
            li.style.removeProperty('--my');
            li.style.removeProperty('--mr');
        });
        document.querySelectorAll('.cylon-scatter-panel, .cylon-scatter-block').forEach((el) => {
            el.classList.remove('cylon-scatter-panel', 'cylon-scatter-block');
            el.style.removeProperty('--sx');
            el.style.removeProperty('--sy');
            el.style.removeProperty('--sr');
        });
        document.body.dataset.cylonScattered = '0';
    }

    /** Scatter + blow glyphs (after intro blast, or immediately when not deferred). */
    function blowWorldEnded() {
        scatterPageGlyphs();
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
        applyCombatTheme(on);
        syncNavChrome();
        if (on) {
            if (!deferScatter) blowWorldEnded();
        } else {
            document.body.classList.remove('cylon-glyphs-blown');
            document.body.classList.remove('cylon-glyphs-blowing');
            document.body.classList.remove('cylon-world-ended');
            clearLandscapeVars();
            // Let letters ease home, then unwrap (match --cylon-desolate-fade)
            setTimeout(() => {
                if (!settings.gameEnabled) restorePageGlyphs();
            }, 2900);
        }
    }

    function allBots() {
        const under = ambushUnder ? [...ambushUnder.querySelectorAll('.cylon-bot')] : [];
        const top = field ? [...field.querySelectorAll('.cylon-bot')] : [];
        return under.concat(top);
    }

    function lerp(a, b, t) {
        return a + (b - a) * Math.min(1, Math.max(0, t));
    }

    /** Same rung as bot capacity: every BOT_CAP_PER_KOS kills is a new level. */
    function killLevel() {
        return Math.floor(koScore / BOT_CAP_PER_KOS);
    }

    function difficultyFactor() {
        if (!runStartedAt) return 0;
        const elapsedMin = (Date.now() - runStartedAt) / 60000;
        const timePart = Math.min(1, elapsedMin / 3.5);
        // Prefer the 5-KO ladder; time is a light backstop if KOs stall
        const levelPart = Math.min(1, killLevel() / 10);
        return Math.min(1, levelPart * 0.75 + timePart * 0.25);
    }

    function nextMissileDelayMs() {
        // Gentle cadence climb with kill level — not a spike every rung
        const t = Math.min(1, killLevel() / 10);
        const lo = lerp(8500, 3400, t);
        const span = lerp(2800, 1600, t);
        return Math.max(2400, lo - span / 2 + Math.random() * span);
    }

    function nextNukeDelayMs() {
        const d = difficultyFactor();
        const lo = lerp(32500, 24000, d);
        const span = lerp(15000, 12000, d);
        return lo - span / 2 + Math.random() * span;
    }

    function groundMissileCap() {
        // L0–1: 1 · L2–3: 2 · L4–5: 3 · L6–7: 4 · L8+: 5
        return Math.min(MISSILE_GROUND_CAP_MAX, 1 + Math.floor(killLevel() / 2));
    }

    function trackerMissileCap() {
        // Start at 1 (not 2). L0–2: 1 · L3–6: 2 · L7+: 3
        const lvl = killLevel();
        if (lvl < 3) return 1;
        if (lvl < 7) return 2;
        return Math.min(MISSILE_TRACKER_CAP_MAX, 3);
    }

    function trackerMissileChance() {
        return Math.min(0.34, MISSILE_TRACKER_CHANCE_BASE + killLevel() * 0.02);
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
        missileDueAt = 0;
        nukeDueAt = 0;
        clearActiveMissiles();
    }

    function playSmallMissileSound(tracker) {
        playTone({
            freq: tracker ? 520 : 380,
            freqEnd: tracker ? 160 : 110,
            type: 'sawtooth',
            duration: 0.22,
            gain: tracker ? 0.07 : 0.055
        });
        playNoiseBurst({
            duration: 0.14,
            gain: 0.04,
            filterFreq: tracker ? 2200 : 1400,
            filterType: 'highpass'
        });
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
        playExplosion({ size: 'small', delay: 0 });
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
        if (settings.soundEnabled) ensureAudio();
        playSmallMissileSound(tracker);

        const tick = (now) => {
            if (!missile.alive) return;
            if (paused || !settings.gameEnabled || gameOver) {
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
        missileDueAt = Date.now() + wait;
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
        nukeDueAt = Date.now() + wait;
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
        if (grenadeReadyAt > pauseStartedAt) grenadeReadyAt += elapsed;
        if (raptorReadyAt > pauseStartedAt) raptorReadyAt += elapsed;
        if (eyeDisorientedUntil > pauseStartedAt) eyeDisorientedUntil += elapsed;

        if (missileDueAt > pauseStartedAt) {
            clearTimeout(missileTimer);
            missileDueAt += elapsed;
            missileTimer = setTimeout(() => {
                missileTimer = null;
                if (!isGameLive() || paused) return;
                if (!isEyeDisoriented() && (canLaunchMissile(false) || canLaunchMissile(true))) {
                    launchSmallMissile();
                }
                scheduleMissiles(false);
            }, Math.max(0, missileDueAt - Date.now()));
        }
        if (nukeDueAt > pauseStartedAt) {
            clearTimeout(nukeTimer);
            nukeDueAt += elapsed;
            nukeTimer = setTimeout(() => {
                nukeTimer = null;
                if (!isGameLive() || paused) return;
                if (!isEyeDisoriented() && !nukeInFlight) launchNuke();
                scheduleNukes(false);
            }, Math.max(0, nukeDueAt - Date.now()));
        }
        if (healDueAt > pauseStartedAt) {
            clearTimeout(healTimer);
            healDueAt += elapsed;
            healTimer = setTimeout(() => {
                healTimer = null;
                tryHeal();
            }, Math.max(0, healDueAt - Date.now()));
        }

        activeHoles.forEach((h) => {
            if (h.phase === 'hold' && h.holdDue > pauseStartedAt) {
                clearTimeout(h.holdTimer);
                h.holdDue += elapsed;
                h.holdTimer = setTimeout(() => {
                    if (paused) {
                        h.holdTimer = null;
                        return;
                    }
                    beginHoleFade(h);
                }, Math.max(0, h.holdDue - Date.now()));
            } else if (h.phase === 'fade' && h.fadeDue > pauseStartedAt) {
                clearTimeout(h.fadeTimer);
                h.fadeDue += elapsed;
                h.fadeTimer = setTimeout(() => {
                    if (paused) {
                        h.fadeTimer = null;
                        return;
                    }
                    removeHoleEntry(h);
                }, Math.max(0, h.fadeDue - Date.now()));
            }
        });
    }

    function playTone({ freq = 440, freqEnd = null, type = 'square', duration = 0.12, gain = 0.08, delay = 0 }) {
        const ctx = ensureAudio();
        if (!ctx) return;
        const t0 = ctx.currentTime + delay;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, t0);
        if (freqEnd != null) {
            osc.frequency.exponentialRampToValueAtTime(Math.max(freqEnd, 1), t0 + duration);
        }
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(gain, t0 + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
        osc.connect(g);
        g.connect(sfxBus || ctx.destination);
        osc.start(t0);
        osc.stop(t0 + duration + 0.02);
    }

    function playNoiseBurst({ duration = 0.18, gain = 0.06, delay = 0, filterFreq = 900, filterType = 'bandpass' } = {}) {
        const ctx = ensureAudio();
        if (!ctx) return;
        const t0 = ctx.currentTime + delay;
        const len = Math.floor(ctx.sampleRate * duration);
        const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < len; i++) {
            data[i] = (Math.random() * 2 - 1) * (1 - i / len);
        }
        const src = ctx.createBufferSource();
        const g = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        filter.type = filterType;
        filter.frequency.value = filterFreq;
        src.buffer = buffer;
        g.gain.setValueAtTime(gain, t0);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
        src.connect(filter);
        filter.connect(g);
        g.connect(sfxBus || ctx.destination);
        src.start(t0);
        src.stop(t0 + duration + 0.02);
    }

    function playExplosion({ size = 'medium', delay = 0 } = {}) {
        const ctx = ensureAudio();
        if (!ctx) return;
        const profiles = {
            small: {
                thumpGain: 0.11,
                thumpDur: 0.28,
                crackGain: 0.08,
                crackDur: 0.12,
                debrisGain: 0.06,
                debrisDur: 0.22,
                rumbleGain: 0.05,
                rumbleDur: 0.35,
                thumpFreq: 70,
                crackFreq: 420
            },
            medium: {
                thumpGain: 0.16,
                thumpDur: 0.45,
                crackGain: 0.12,
                crackDur: 0.16,
                debrisGain: 0.1,
                debrisDur: 0.4,
                rumbleGain: 0.09,
                rumbleDur: 0.65,
                thumpFreq: 55,
                crackFreq: 380
            },
            large: {
                thumpGain: 0.2,
                thumpDur: 0.85,
                crackGain: 0.14,
                crackDur: 0.28,
                debrisGain: 0.12,
                debrisDur: 0.7,
                rumbleGain: 0.14,
                rumbleDur: 1.4,
                thumpFreq: 42,
                crackFreq: 300
            }
        };
        const p = profiles[size] || profiles.medium;
        // 1) Sub thump
        playTone({
            freq: p.thumpFreq,
            freqEnd: Math.max(18, p.thumpFreq * 0.35),
            type: 'sine',
            duration: p.thumpDur,
            gain: p.thumpGain,
            delay
        });
        playTone({
            freq: p.thumpFreq * 1.4,
            freqEnd: 24,
            type: 'triangle',
            duration: p.thumpDur * 0.85,
            gain: p.thumpGain * 0.55,
            delay: delay + 0.02
        });
        // 2) Sharp crack
        playNoiseBurst({
            duration: p.crackDur,
            gain: p.crackGain,
            delay: delay + 0.03,
            filterFreq: p.crackFreq,
            filterType: 'bandpass'
        });
        playTone({
            freq: 900,
            freqEnd: 120,
            type: 'square',
            duration: p.crackDur * 0.7,
            gain: p.crackGain * 0.45,
            delay: delay + 0.03
        });
        // 3) Debris / hiss
        playNoiseBurst({
            duration: p.debrisDur,
            gain: p.debrisGain,
            delay: delay + 0.06,
            filterFreq: 1800,
            filterType: 'highpass'
        });
        playNoiseBurst({
            duration: p.debrisDur * 0.8,
            gain: p.debrisGain * 0.7,
            delay: delay + 0.08,
            filterFreq: 700,
            filterType: 'bandpass'
        });
        // 4) Rumble tail
        playTone({
            freq: 48,
            freqEnd: 20,
            type: 'sine',
            duration: p.rumbleDur,
            gain: p.rumbleGain,
            delay: delay + 0.1
        });
        playNoiseBurst({
            duration: p.rumbleDur * 0.9,
            gain: p.rumbleGain * 0.65,
            delay: delay + 0.12,
            filterFreq: 180,
            filterType: 'lowpass'
        });
    }

    function playProjectileSound() {
        playTone({ freq: 980, freqEnd: 240, type: 'sawtooth', duration: 0.14, gain: 0.07 });
        playTone({ freq: 1400, freqEnd: 400, type: 'square', duration: 0.08, gain: 0.035, delay: 0.01 });
    }

    function playKoSound() {
        playExplosion({ size: 'small' });
    }

    function playNukeSound() {
        playExplosion({ size: 'large' });
    }

    function playHitSound() {
        playTone({ freq: 160, freqEnd: 70, type: 'sawtooth', duration: 0.1, gain: 0.05 });
        playNoiseBurst({ duration: 0.08, gain: 0.04 });
    }

    function playHealSound() {
        playTone({ freq: 280, freqEnd: 540, type: 'sine', duration: 0.18, gain: 0.05 });
        playTone({ freq: 420, freqEnd: 660, type: 'triangle', duration: 0.14, gain: 0.03, delay: 0.04 });
    }

    function clearHealTimer() {
        clearTimeout(healTimer);
        healTimer = null;
        healDueAt = 0;
    }

    function tryHeal() {
        healTimer = null;
        healDueAt = 0;
        if (!isGameLive() || hitCount <= 0) return;
        hitCount -= 1;
        updateHitsUi();
        if (settings.soundEnabled) ensureAudio();
        playHealSound();
        if (hitsEl) {
            hitsEl.classList.add('is-heal');
            setTimeout(() => hitsEl.classList.remove('is-heal'), 320);
        }
        scheduleHeal();
    }

    function scheduleHeal() {
        clearHealTimer();
        if (!settings.gameEnabled || gameOver || paused || hitCount <= 0) return;
        healDueAt = Date.now() + HEAL_IDLE_MS;
        healTimer = setTimeout(() => {
            healTimer = null;
            tryHeal();
        }, HEAL_IDLE_MS);
    }

    function playRaptorSound() {
        // Incoming flyby
        playTone({ freq: 220, freqEnd: 70, type: 'sawtooth', duration: 0.7, gain: 0.09 });
        playTone({ freq: 140, freqEnd: 55, type: 'triangle', duration: 0.85, gain: 0.07, delay: 0.04 });
        playNoiseBurst({ duration: 0.55, gain: 0.08, filterFreq: 700, filterType: 'lowpass' });
        playNoiseBurst({ duration: 0.4, gain: 0.05, delay: 0.15, filterFreq: 2400, filterType: 'highpass' });
        // Cannon strafe
        [0.45, 0.58, 0.7, 0.82, 0.94, 1.06].forEach((d, i) => {
            playTone({
                freq: 980 - i * 40,
                freqEnd: 180,
                type: 'square',
                duration: 0.07,
                gain: 0.055,
                delay: d
            });
            playNoiseBurst({ duration: 0.08, gain: 0.045, delay: d, filterFreq: 1600 });
        });
        // Ground impacts — layered explosions
        playExplosion({ size: 'medium', delay: 0.72 });
        playExplosion({ size: 'medium', delay: 1.0 });
    }

    function playGrenadeArmSound() {
        playTone({ freq: 640, freqEnd: 420, type: 'square', duration: 0.09, gain: 0.05 });
        playTone({ freq: 880, freqEnd: 660, type: 'triangle', duration: 0.07, gain: 0.035, delay: 0.04 });
        playNoiseBurst({ duration: 0.06, gain: 0.03, filterFreq: 2200 });
    }

    function playGrenadeSound() {
        // Throw whoosh (keep)
        playTone({ freq: 420, freqEnd: 140, type: 'sawtooth', duration: 0.14, gain: 0.05 });
        playNoiseBurst({ duration: 0.12, gain: 0.05, filterFreq: 1800, filterType: 'highpass' });
        // Detonation
        playExplosion({ size: 'medium', delay: 0.08 });
    }

    function readEyePercent() {
        const parent = eye.parentElement;
        if (!parent) return 50;
        const er = eye.getBoundingClientRect();
        const pr = parent.getBoundingClientRect();
        if (pr.width < 1) return 50;
        return ((er.left + er.width / 2 - pr.left) / pr.width) * 100;
    }

    function isEyeDisoriented() {
        return Date.now() < eyeDisorientedUntil;
    }

    function setEyeTracking(on) {
        // Idle sweep only when the game is off (or eye tracking disabled / disoriented)
        if (!isGameLive() || !settings.eyeEnabled || isEyeDisoriented()) on = false;
        if (on && !tracking) {
            eyeX = readEyePercent();
        }
        tracking = on;
        eye.classList.toggle('is-tracking', on && !isEyeDisoriented());
        if (glare) glare.classList.toggle('is-active', on && !isEyeDisoriented());
        if (!on && !isEyeDisoriented()) {
            eye.style.left = '';
            if (glare) {
                glare.style.opacity = '';
                glare.style.height = '';
            }
        }
    }

    function disorientEye(ms = EYE_DISORIENT_MS) {
        eyeDisorientedUntil = Date.now() + ms;
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
            const target = Math.min(95, Math.max(5, (mouse.clientX / window.innerWidth) * 100));
            eyeX += (target - eyeX) * 0.28;
            eye.style.left = `${eyeX}%`;
            if (glare) {
                glare.style.opacity = '';
                glare.style.left = `${(eyeX / 100) * window.innerWidth}px`;
                const h = Math.min(window.innerHeight * 0.32, 14 * 16, Math.max(48, mouse.clientY * 0.55));
                glare.style.height = `${h}px`;
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
        if (settings.soundEnabled) ensureAudio();
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
            if (grenadeArmed) return; // window capture handler throws instead
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
            activeHoles.forEach((h) => {
                clearTimeout(h.holdTimer);
                clearTimeout(h.fadeTimer);
                h.holdTimer = null;
                h.fadeTimer = null;
            });
            clearTimeout(missileTimer);
            clearTimeout(nukeTimer);
            clearTimeout(healTimer);
            missileTimer = null;
            nukeTimer = null;
            healTimer = null;
            setEyeTracking(false);
            syncMusic();
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
            syncMusic();
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

    function rectsOverlap(a, b) {
        return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
    }

    function inflate(rect, pad) {
        return {
            left: rect.left - pad,
            top: rect.top - pad,
            right: rect.right + pad,
            bottom: rect.bottom + pad
        };
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

    function botPageRect(x, y) {
        return {
            left: x,
            top: y,
            right: x + BOT_SIZE.w,
            bottom: y + BOT_SIZE.h
        };
    }

    /** Page-coord box bots should live in so they stay tappable on screen. */
    function visiblePlayfieldBounds() {
        const sx = scrollX();
        const sy = scrollY();
        const vw = document.documentElement.clientWidth || window.innerWidth || 1;
        const vh = window.innerHeight || 1;
        const nav = document.querySelector('.site-nav');
        const navBottom = nav ? nav.getBoundingClientRect().bottom : 70;
        const topPad = Math.max(72, navBottom + 10);
        const margin = 10;
        const left = sx + margin;
        const top = sy + topPad;
        const right = sx + vw - BOT_SIZE.w - margin;
        const bottom = sy + vh - BOT_SIZE.h - margin - 6;
        return {
            left,
            top,
            right: Math.max(left, right),
            bottom: Math.max(top, bottom)
        };
    }

    function clampToVisiblePlayfield(x, y) {
        const b = visiblePlayfieldBounds();
        return {
            x: Math.min(Math.max(b.left, x), b.right),
            y: Math.min(Math.max(b.top, y), b.bottom)
        };
    }

    function isInVisiblePlayfield(x, y) {
        const b = visiblePlayfieldBounds();
        return x >= b.left - 2 && x <= b.right + 2 && y >= b.top - 2 && y <= b.bottom + 2;
    }

    function isSafePageSpot(x, y, forbidden) {
        const rect = botPageRect(x, y);
        const { w, h } = docSize();
        if (x < 4 || y < 70 || x + BOT_SIZE.w > w - 4 || y + BOT_SIZE.h > h - 4) return false;
        return !forbidden.some((r) => rectsOverlap(rect, r));
    }

    function randomVisibleSpot(forbidden) {
        const b = visiblePlayfieldBounds();
        const spanX = Math.max(1, b.right - b.left);
        const spanY = Math.max(1, b.bottom - b.top);
        for (let i = 0; i < 36; i++) {
            const x = b.left + Math.random() * spanX;
            const y = b.top + Math.random() * spanY;
            if (isSafePageSpot(x, y, forbidden)) return { x, y, edge: 'return' };
        }
        // Last resort: clamped center of the playfield
        const fallback = clampToVisiblePlayfield((b.left + b.right) / 2, (b.top + b.bottom) / 2);
        if (isSafePageSpot(fallback.x, fallback.y, forbidden)) {
            return { ...fallback, edge: 'return' };
        }
        return null;
    }

    function candidateSpots() {
        const b = visiblePlayfieldBounds();
        const margin = 12;
        const spots = [];
        const edges = ['left', 'right', 'bottom'];
        const spanY = Math.max(40, b.bottom - b.top);
        const spanX = Math.max(40, b.right - b.left);

        // Stay inside the visible playfield (tappable), not past the screen edge
        edges.forEach((edge) => {
            for (let i = 0; i < 10; i++) {
                let x;
                let y;
                if (edge === 'left') {
                    x = b.left;
                    y = b.top + Math.random() * spanY;
                } else if (edge === 'right') {
                    x = b.right;
                    y = b.top + Math.random() * spanY;
                } else {
                    x = b.left + Math.random() * spanX;
                    y = b.bottom - Math.random() * Math.min(36, spanY * 0.25);
                }
                const clamped = clampToVisiblePlayfield(x, y);
                spots.push({ ...clamped, edge });
            }
        });

        for (let i = spots.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [spots[i], spots[j]] = [spots[j], spots[i]];
        }
        return spots;
    }

    function findSafeSpot(nearBot) {
        const forbidden = getForbiddenRects();
        if (nearBot) {
            const cx = parseFloat(nearBot.style.left) || 0;
            const cy = parseFloat(nearBot.style.top) || 0;
            // Off-screen after a scroll (or bad patrol): march back into view
            if (!isInVisiblePlayfield(cx, cy)) {
                const back = randomVisibleSpot(forbidden);
                if (back) return back;
            } else {
                for (let i = 0; i < 28; i++) {
                    let x = cx + (Math.random() - 0.5) * 200;
                    let y = cy + (Math.random() - 0.5) * 140;
                    ({ x, y } = clampToVisiblePlayfield(x, y));
                    if (isSafePageSpot(x, y, forbidden)) {
                        return { x, y, edge: 'patrol' };
                    }
                }
            }
        }
        for (const spot of candidateSpots()) {
            if (isSafePageSpot(spot.x, spot.y, forbidden)) return spot;
        }
        return randomVisibleSpot(forbidden);
    }

    function currentHp() {
        return Math.max(0, MAX_HITS - hitCount);
    }

    /**
     * Smooth HP tint: green at full → yellow at half → red at empty.
     * t = hp / MAX ∈ [0,1]. Piecewise RGB lerp on either side of 0.5:
     *   t ≥ 0.5: mix(yellow, green, (t-0.5)/0.5)
     *   t <  0.5: mix(red,    yellow, t/0.5)
     */
    function hpTint(hp) {
        const mix = (a, b, u) => Math.round(a + (b - a) * u);
        const mixRgb = (c0, c1, u) => ({
            r: mix(c0.r, c1.r, u),
            g: mix(c0.g, c1.g, u),
            b: mix(c0.b, c1.b, u),
        });
        const green = { r: 125, g: 255, b: 154 };
        const yellow = { r: 255, g: 210, b: 74 };
        const red = { r: 255, g: 72, b: 72 };
        const t = Math.max(0, Math.min(1, hp / MAX_HITS));
        const c = t >= 0.5
            ? mixRgb(yellow, green, (t - 0.5) / 0.5)
            : mixRgb(red, yellow, t / 0.5);
        return {
            color: `rgb(${c.r}, ${c.g}, ${c.b})`,
            glow: `rgba(${c.r}, ${c.g}, ${c.b}, 0.55)`,
        };
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
        if (gameOver || !isGameLive()) return;
        const n = Math.max(0, Number(count) || 0);
        hitCount += n;
        hitsTaken += n;
        updateHitsUi();
        playHitSound();
        scheduleHeal();

        if (fromNuke) {
            clearHealTimer();
            endGame('nuke');
            return;
        }

        if (hitCount >= MAX_HITS) {
            clearHealTimer();
            endGame('hits');
        }
    }

    function fireBolt(fromX, fromY, toX, toY) {
        playProjectileSound();
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
            if (!settings.gameEnabled || gameOver) {
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
            ensureAudio();
            playProjectileSound();
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
            if (grenadeArmed) return;
            if (introPlaying) return;
            if (e.button != null && e.button !== 0) return;
            if (reticlePointerId != null && e.pointerId === reticlePointerId) return;
            if (isPlayerShotUiTarget(e.target)) return;
            e.preventDefault();
            spawnShotImpact(e.pageX, e.pageY);
        });
    }

    function bumpScore() {
        koScore += 1;
        if (!scoreEl) return;
        scoreEl.textContent = String(koScore);
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
        playKoSound();
        const kx = (parseFloat(bot.style.left) || 0) + BOT_SIZE.w / 2;
        const ky = (parseFloat(bot.style.top) || 0) + BOT_SIZE.h / 2;
        spawnShotImpact(kx, ky, { sound: false });
        bumpScore();
        activeBots = Math.max(0, activeBots - 1);
        setTimeout(() => bot.remove(), 560);
    }

    function largeHoleRadius() {
        return Math.min(window.innerWidth || 400, window.innerHeight || 400) * 0.42;
    }

    function removeHoleEntry(entry) {
        if (!entry) return;
        clearTimeout(entry.holdTimer);
        clearTimeout(entry.fadeTimer);
        entry.el.remove();
        activeHoles = activeHoles.filter((h) => h !== entry);
    }

    function beginHoleFade(entry) {
        if (!entry || !entry.el.isConnected) {
            removeHoleEntry(entry);
            return;
        }
        entry.phase = 'fade';
        entry.el.style.setProperty('--hole-fade-ms', `${entry.fadeMs}ms`);
        entry.el.classList.add('is-fading');
        entry.fadeDue = Date.now() + entry.fadeMs;
        entry.fadeTimer = setTimeout(() => {
            if (paused) {
                entry.fadeTimer = null;
                return;
            }
            removeHoleEntry(entry);
        }, entry.fadeMs);
    }

    function forceFadeOldestHole() {
        const oldest = activeHoles[0];
        if (!oldest) return;
        if (oldest.phase === 'hold') {
            clearTimeout(oldest.holdTimer);
            beginHoleFade(oldest);
        } else {
            removeHoleEntry(oldest);
        }
    }

    function punchHole(pageX, pageY, { radius, holdMs, fadeMs } = {}) {
        if (!field || !isGameLive()) return;
        const r = radius > 0 ? radius : largeHoleRadius();
        const hold = holdMs > 0 ? holdMs : HOLE_PRESETS.small.holdMs;
        const fade = fadeMs > 0 ? fadeMs : HOLE_PRESETS.small.fadeMs;

        while (activeHoles.length >= MAX_HOLES) {
            forceFadeOldestHole();
            if (activeHoles.length >= MAX_HOLES) removeHoleEntry(activeHoles[0]);
        }

        const el = document.createElement('div');
        el.className = 'cylon-hole';
        el.setAttribute('aria-hidden', 'true');
        el.style.left = `${pageX}px`;
        el.style.top = `${pageY}px`;
        el.style.width = `${r * 2}px`;
        el.style.height = `${r * 2}px`;
        const rim = document.createElement('div');
        rim.className = 'cylon-hole-glitch';
        el.appendChild(rim);
        field.appendChild(el);

        const entry = {
            el,
            holdTimer: null,
            fadeTimer: null,
            holdDue: Date.now() + hold,
            fadeDue: 0,
            fadeMs: fade,
            phase: 'hold'
        };
        entry.holdTimer = setTimeout(() => {
            if (paused) {
                entry.holdTimer = null;
                return;
            }
            beginHoleFade(entry);
        }, hold);
        activeHoles.push(entry);
    }

    function clearAllHoles() {
        [...activeHoles].forEach(removeHoleEntry);
        activeHoles = [];
        field?.querySelectorAll('.cylon-hole').forEach((el) => el.remove());
    }

    function clearAllBots() {
        allBots().forEach((bot) => {
            clearBotTimers(bot);
            bot.remove();
        });
        field.querySelectorAll('.cylon-bolt, .cylon-impact').forEach((el) => el.remove());
        clearAllHoles();
        activeBots = 0;
    }

    function updateCooldownButton(btn, cdEl, readyAt, extraReady = true) {
        if (!btn) return;
        const remaining = Math.max(0, readyAt - Date.now());
        const cooling = remaining > 0;
        const ready = !cooling && extraReady && isGameLive();
        btn.disabled = !ready;
        btn.classList.toggle('is-cooling', cooling);
        if (cdEl) {
            if (cooling) {
                // Whole seconds only: 10…1 (grenade) / 60…1 (raptor)
                const secs = Math.max(1, Math.ceil(remaining / 1000));
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
        updateCooldownButton(raptorBtn, raptorCdEl, raptorReadyAt, !raptorInbound);
    }

    function updateGrenadeButton() {
        // Stay clickable while armed so a second press cancels
        updateCooldownButton(grenadeBtn, grenadeCdEl, grenadeArmed ? 0 : grenadeReadyAt, true);
        if (!grenadeBtn) return;
        grenadeBtn.classList.toggle('is-armed', grenadeArmed);
        const label = grenadeBtn.querySelector('.cylon-raptor-btn-label');
        if (label) {
            label.textContent = grenadeArmed ? 'Armed' : 'Grenade';
        }
        document.body.classList.toggle('cylon-grenade-armed', grenadeArmed);
    }

    function updateAbilityButtons() {
        updateRaptorButton();
        updateGrenadeButton();
    }

    function clearRaptorStrike() {
        raptorStrikeTimers.forEach((t) => clearTimeout(t));
        raptorStrikeTimers = [];
        raptorInbound = false;
        if (raptorEl) raptorEl.classList.remove('is-inbound');
        if (raptorImpactsEl) raptorImpactsEl.innerHTML = '';
    }

    function clearEyeDisorient() {
        eyeDisorientedUntil = 0;
        if (eye) eye.classList.remove('is-disoriented');
        if (glare) {
            glare.classList.remove('is-disoriented');
            if (!tracking) glare.classList.remove('is-active');
        }
    }

    /** Cooldowns / armed state do not carry across runs. */
    function resetAbilityCooldowns() {
        grenadeReadyAt = 0;
        raptorReadyAt = 0;
        grenadeArmed = false;
        document.body.classList.remove('cylon-grenade-armed');
        clearRaptorStrike();
        clearEyeDisorient();
        updateAbilityButtons();
    }

    function cancelGrenadeArm() {
        if (!grenadeArmed) return;
        grenadeArmed = false;
        updateGrenadeButton();
    }

    function readyGrenade() {
        if (!isGameLive()) return false;
        if (Date.now() < grenadeReadyAt) return false;
        if (grenadeArmed) {
            cancelGrenadeArm();
            return false;
        }
        grenadeArmed = true;
        if (settings.soundEnabled) ensureAudio();
        playGrenadeArmSound();
        updateGrenadeButton();
        return true;
    }

    function throwGrenadeAt(pageX, pageY) {
        if (!isGameLive()) return false;
        if (!grenadeArmed) return false;
        if (Date.now() < grenadeReadyAt) {
            cancelGrenadeArm();
            return false;
        }

        grenadeArmed = false;
        grenadeReadyAt = Date.now() + GRENADE_COOLDOWN_MS;
        updateGrenadeButton();
        if (settings.soundEnabled) ensureAudio();
        playGrenadeSound();

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
        rearrangeLandscapePage(x, y, 0.48);
        setTimeout(() => blast.remove(), 480);

        allBots().forEach((bot) => {
            if (bot.dataset.ko === '1') return;
            const bx = (parseFloat(bot.style.left) || 0) + BOT_SIZE.w / 2;
            const by = (parseFloat(bot.style.top) || 0) + BOT_SIZE.h / 2;
            if (Math.hypot(bx - x, by - y) <= GRENADE_RADIUS) {
                knockOutBot(bot);
            }
        });
        return true;
    }

    function spawnRaptorImpacts() {
        if (!raptorImpactsEl) return;
        raptorImpactsEl.innerHTML = '';
        const count = 10;
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
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
                rearrangeLandscapePage(pageX, pageY, 0.22);
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

    function callRaptor() {
        if (!isGameLive() || raptorInbound) return false;
        if (Date.now() < raptorReadyAt) return false;
        if (!raptorEl) return false;

        clearRaptorStrike();
        raptorInbound = true;
        raptorReadyAt = Date.now() + RAPTOR_COOLDOWN_MS;
        updateAbilityButtons();
        if (settings.soundEnabled) ensureAudio();
        playRaptorSound();
        disorientEye(EYE_DISORIENT_MS);

        raptorEl.classList.add('is-inbound');
        raptorStrikeTimers.push(setTimeout(() => {
            if (!raptorInbound || !isGameLive()) return;
            rearrangeLandscape(window.innerWidth * 0.5, window.innerHeight * 0.62, 0.58);
            spawnRaptorImpacts();
            wipeAllBotsWithScore();
        }, RAPTOR_STRIKE_AT_MS));

        raptorStrikeTimers.push(setTimeout(() => {
            raptorEl.classList.remove('is-inbound');
            if (raptorImpactsEl) raptorImpactsEl.innerHTML = '';
            raptorInbound = false;
            raptorStrikeTimers = [];
            updateAbilityButtons();
        }, 1900));

        return true;
    }

    function marchOrigin(spot) {
        const b = visiblePlayfieldBounds();
        // Enter from just outside the visible playfield, then march onto it
        if (spot.edge === 'left') return { x: b.left - BOT_SIZE.w + 6, y: spot.y };
        if (spot.edge === 'right') return { x: b.right + BOT_SIZE.w - 6, y: spot.y };
        return { x: spot.x, y: b.bottom + BOT_SIZE.h - 6 };
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
        return Math.min(BOT_HARD_CAP, BOT_CAP_START + Math.floor(koScore / BOT_CAP_PER_KOS));
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
            if (settings.soundEnabled) ensureAudio();
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
        const isWave = Math.random() < 0.55;
        const maxBatch = Math.min(room, Math.max(2, Math.min(4, Math.floor(botCap() / 3))));
        const count = isWave
            ? Math.min(room, 2 + Math.floor(Math.random() * Math.max(1, maxBatch - 1)))
            : 1;
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

    /** Blast radius (page px) — AoE only, scaled by weapon power. */
    function disruptRadiusForScale(scale) {
        const s = Math.max(0.05, Math.min(1.6, scale));
        // shot≈0.22 → ~210px · missile≈0.32 → ~240px · grenade≈0.48 → ~290px · nuke≈1.4 → ~580px
        return 140 + s * 320;
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
     * Global crack/ash rewrite only for large weapons (Raptor pulse / nuke).
     * Everything else is a local AoE on individual letters + blast hotspot.
     */
    function rearrangeLandscape(clientX, clientY, scale = 1) {
        if (!document.body.classList.contains('cylon-world-ended') && scale < 0.9) {
            if (scale < 0.99) return;
        }
        const s = Math.max(0.05, Math.min(1, scale));
        const pageX = clientX + scrollX();
        const pageY = clientY + scrollY();

        // Smaller weapons: local letter AoE + hotspot — never rewrite the whole backdrop
        if (s < 0.55) {
            aimBlastHotspot(clientX, clientY, s);
            disruptGlyphs(pageX, pageY, s);
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

        disruptGlyphs(pageX, pageY, s);
    }

    /**
     * Kick letters whose page-home (pre-scatter layout) sits inside the weapon AoE.
     * Individual chars only for smaller blasts — never parent blocks (those drag the whole section).
     */
    function disruptGlyphs(pageX, pageY, scale = 1) {
        if (document.body.dataset.cylonScattered !== '1' || reduceMotion) return;
        const s = Math.max(0.05, Math.min(1.6, scale));
        const radius = disruptRadiusForScale(s);
        const localOnly = s < 0.7;
        const selector = localOnly
            ? '.cylon-scatter-char'
            : '.cylon-scatter-char, .cylon-scatter-block, .cylon-scatter-panel';
        const nodes = [...document.querySelectorAll(selector)];
        const chance = Math.min(1, 0.75 + s * 0.25);
        const jitter = 70 * s;
        const pushMax = 55 + 240 * s;
        nodes.forEach((el) => {
            if (el.classList.contains('cylon-scatter-panel') && s < 0.9) return;
            const ox = parseFloat(el.dataset.ox);
            const oy = parseFloat(el.dataset.oy);
            let cx;
            let cy;
            if (Number.isFinite(ox) && Number.isFinite(oy)) {
                cx = ox;
                cy = oy;
            } else {
                const rect = el.getBoundingClientRect();
                cx = rect.left + rect.width / 2 + scrollX();
                cy = rect.top + rect.height / 2 + scrollY();
            }
            const awayX = cx - pageX;
            const awayY = cy - pageY;
            const awayDist = Math.hypot(awayX, awayY) || 1;
            if (awayDist > radius) return;
            if (Math.random() > chance) return;
            const sx = parseFloat(el.style.getPropertyValue('--sx')) || 0;
            const sy = parseFloat(el.style.getPropertyValue('--sy')) || 0;
            const sr = parseFloat(el.style.getPropertyValue('--sr')) || 0;
            const falloff = Math.max(0, 1 - awayDist / radius);
            const push = randRange(pushMax * 0.55, pushMax) * falloff;
            el.style.setProperty('--sx', `${(sx + (awayX / awayDist) * push + randRange(-jitter, jitter) * falloff).toFixed(1)}px`);
            el.style.setProperty('--sy', `${(sy + (awayY / awayDist) * push + randRange(-jitter, jitter) * falloff).toFixed(1)}px`);
            el.style.setProperty('--sr', `${(sr + randRange(-40, 40) * s * falloff).toFixed(1)}deg`);
        });
    }

    function rearrangeLandscapePage(pageX, pageY, scale = 1) {
        rearrangeLandscape(pageX - scrollX(), pageY - scrollY(), scale);
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
        if (settings.soundEnabled) ensureAudio();
        playNukeSound();

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
            radius: largeHoleRadius(),
            holdMs: HOLE_PRESETS.large.holdMs,
            fadeMs: HOLE_PRESETS.large.fadeMs
        });

        // Secondary terrain scars around the epicenter
        const scarCount = 3 + Math.floor(Math.random() * 3);
        for (let i = 0; i < scarCount; i++) {
            const ang = Math.random() * Math.PI * 2;
            const dist = randRange(largeHoleRadius() * 0.35, largeHoleRadius() * 0.85);
            const sx = pageX + Math.cos(ang) * dist;
            const sy = pageY + Math.sin(ang) * dist;
            punchHole(sx, sy, {
                radius: randRange(48, 110),
                holdMs: HOLE_PRESETS.medium.holdMs,
                fadeMs: HOLE_PRESETS.medium.fadeMs
            });
        }

        rearrangeLandscape(clientX, clientY, 1);
        // Extra letter shockwave — stronger than the landscape nudge alone
        disruptGlyphs(pageX, pageY, 1.45);
        // Catch glyphs that finish wrapping a beat after the intro scatter
        setTimeout(() => disruptGlyphs(pageX, pageY, 1.2), 220);
        setTimeout(() => disruptGlyphs(pageX, pageY, 0.85), 520);

        if (dealDamage) {
            // Direct hit ends the run — count the nuke as 1 hit of real damage (no pad-to-30)
            const dist = Math.hypot(mouse.clientX - clientX, mouse.clientY - clientY);
            if (dist <= NUKE_DIRECT_HIT_RADIUS) {
                registerHit(1, { fromNuke: true });
            }
        }

        setTimeout(() => nukeEl.classList.remove('is-detonating'), 2500);
    }

    function resetIntroTitle() {
        document.body.classList.remove('cylon-intro-hero');
        if (!introTitleEl) return;
        introTitleEl.hidden = true;
        introTitleEl.setAttribute('aria-hidden', 'true');
        introTitleEl.classList.remove('is-hero', 'is-settling', 'is-exit');
        introTitleEl.style.cssText = '';
    }

    function pinIntroTitleCenter() {
        if (!introTitleEl) return { x: 0, y: 0 };
        const x = (window.innerWidth || 1) * 0.5;
        const y = (window.innerHeight || 1) * 0.48;
        // Pixel pin — % left/top jumps when the scrollbar or nav chrome reflows
        introTitleEl.style.left = `${x}px`;
        introTitleEl.style.top = `${y}px`;
        introTitleEl.style.right = 'auto';
        introTitleEl.style.bottom = 'auto';
        introTitleEl.style.transform = 'translate(-50%, -50%)';
        introTitleEl.style.transformOrigin = 'center center';
        return { x, y };
    }

    function showIntroTitle() {
        if (!introTitleEl) return;
        introTitleEl.textContent = BRAND_COMBAT;
        introTitleEl.hidden = false;
        introTitleEl.setAttribute('aria-hidden', 'false');
        introTitleEl.classList.remove('is-exit', 'is-settling', 'is-hero');
        introTitleEl.style.cssText = '';
        pinIntroTitleCenter();
        document.body.classList.add('cylon-intro-hero');
        // Opacity-only fade in; keep transform pinned so nothing pops
        void introTitleEl.offsetWidth;
        introTitleEl.classList.add('is-hero');
    }

    function isIntroMobileChrome() {
        return window.matchMedia('(max-width: 819px)').matches;
    }

    /** After the hold: glide from viewport center into the nav brand (desktop) or fade (mobile). */
    function settleIntroTitle(gen) {
        if (gen !== introGen || !introTitleEl || introTitleEl.hidden) return;

        if (reduceMotion || isIntroMobileChrome() || !siteBrand) {
            introTitleEl.classList.add('is-exit');
            const ms = reduceMotion ? 0 : 450;
            setTimeout(() => {
                if (gen !== introGen) return;
                resetIntroTitle();
            }, ms);
            return;
        }

        // Re-pin after nav chrome / scatter may have shifted layout, then measure once
        const pinned = pinIntroTitleCenter();
        void introTitleEl.offsetWidth;
        const heroRect = introTitleEl.getBoundingClientRect();
        const brandRect = siteBrand.getBoundingClientRect();
        const heroCenterX = heroRect.left + heroRect.width / 2;
        const heroCenterY = heroRect.top + heroRect.height / 2;
        const targetX = brandRect.left + brandRect.width / 2;
        const targetY = brandRect.top + brandRect.height / 2;
        const dx = targetX - heroCenterX;
        const dy = targetY - heroCenterY;
        const scale = brandRect.width / Math.max(heroRect.width, 1);

        introTitleEl.classList.remove('is-hero');
        introTitleEl.classList.add('is-settling');
        introTitleEl.style.left = `${pinned.x}px`;
        introTitleEl.style.top = `${pinned.y}px`;
        introTitleEl.style.transform = 'translate(-50%, -50%) scale(1)';

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                if (gen !== introGen) return;
                introTitleEl.style.transform =
                    `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(${scale})`;
                introTitleEl.style.textShadow = 'none';
            });
        });

        let settled = false;
        const finishSettle = (e) => {
            if (e && e.propertyName && e.propertyName !== 'transform') return;
            if (settled || gen !== introGen) return;
            settled = true;
            introTitleEl.removeEventListener('transitionend', finishSettle);
            resetIntroTitle();
        };
        introTitleEl.addEventListener('transitionend', finishSettle);
        setTimeout(() => finishSettle(), INTRO_TITLE_SETTLE_MS + 120);
    }

    function cancelIntroNuke() {
        introGen += 1;
        introPlaying = false;
        nukeInFlight = false;
        if (nukeMissileEl) nukeMissileEl.classList.remove('is-flying');
        resetIntroTitle();
    }

    function beginCombatAfterIntro() {
        if (!settings.gameEnabled || gameOver) return;
        introPlaying = false;
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
        runStartedAt = Date.now();
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

    /** Opening strike: nuke flies to screen center, then the page blows apart and combat starts. */
    function playIntroNuke() {
        const gen = ++introGen;
        introPlaying = true;
        nukeInFlight = false;
        resetIntroTitle();

        const targetX = (window.innerWidth || 1) / 2;
        const targetY = (window.innerHeight || 1) * 0.48;

        const finish = (x, y) => {
            if (gen !== introGen || !settings.gameEnabled) return;
            nukeInFlight = false;
            if (nukeMissileEl) nukeMissileEl.classList.remove('is-flying');
            detonateNukeAt(x, y, { dealDamage: false, shake: false });
            showIntroTitle();
            // Start scatter after the white flash peaks so the drift is visible
            const scatterDelay = reduceMotion ? 0 : 520;
            setTimeout(() => {
                if (gen !== introGen || !settings.gameEnabled) return;
                beginCombatAfterIntro();
            }, scatterDelay);
            // Hold at center through nav chrome fade, then ride into the brand slot
            const settleDelay = reduceMotion
                ? 0
                : Math.max(900, scatterDelay + NAV_FADE_MS + 80);
            setTimeout(() => {
                if (gen !== introGen || !settings.gameEnabled) return;
                settleIntroTitle(gen);
            }, settleDelay);
        };

        if (reduceMotion || !nukeMissileEl) {
            finish(targetX, targetY);
            return;
        }

        nukeInFlight = true;
        // Enter from above the viewport toward center
        let x = targetX + (Math.random() - 0.5) * Math.min(120, (window.innerWidth || 400) * 0.15);
        let y = -72;
        const started = performance.now();
        let last = started;
        const INTRO_SPEED = NUKE_SPEED * 0.85;

        nukeMissileEl.style.left = `${x}px`;
        nukeMissileEl.style.top = `${y}px`;
        nukeMissileEl.classList.add('is-flying');
        if (settings.soundEnabled) ensureAudio();
        playTone({ freq: 160, freqEnd: 70, type: 'sawtooth', duration: 0.28, gain: 0.06 });

        const tick = (now) => {
            if (gen !== introGen) return;
            if (!settings.gameEnabled) {
                cancelIntroNuke();
                return;
            }
            if (paused) {
                started += now - last;
                last = now;
                requestAnimationFrame(tick);
                return;
            }

            const dt = Math.min(0.05, (now - last) / 1000);
            last = now;
            const dx = targetX - x;
            const dy = targetY - y;
            const dist = Math.hypot(dx, dy) || 1;
            const step = INTRO_SPEED * dt;
            x += (dx / dist) * Math.min(step, dist);
            y += (dy / dist) * Math.min(step, dist);

            nukeMissileEl.style.left = `${x}px`;
            nukeMissileEl.style.top = `${y}px`;
            nukeMissileEl.style.setProperty('--nuke-heading', `${Math.atan2(dy, dx) * (180 / Math.PI)}deg`);

            if (dist <= NUKE_ARRIVE_RADIUS || now - started >= NUKE_MAX_FLIGHT_MS) {
                finish(x, y);
                return;
            }
            requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
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
        const started = performance.now();
        let last = started;

        nukeMissileEl.style.left = `${x}px`;
        nukeMissileEl.style.top = `${y}px`;
        nukeMissileEl.classList.add('is-flying');
        if (settings.soundEnabled) ensureAudio();
        playTone({ freq: 180, freqEnd: 90, type: 'sawtooth', duration: 0.2, gain: 0.05 });

        const tick = (now) => {
            if (paused || !settings.gameEnabled || gameOver) {
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
        const quit = gameOverEndReason === 'quit';
        playAgainBtn.textContent = quit ? 'Close' : 'Play Again';
        playAgainBtn.setAttribute(
            'aria-label',
            quit ? 'Close and return to the site' : 'Start a new run'
        );
    }

    function dismissGameOverPanel() {
        if (gameOverEndReason === 'quit') {
            hideGameOver();
            gameOver = false;
            resetRunStats();
            return;
        }
        setGameEnabled(true);
    }

    function hideGameOver() {
        if (gameOverEl) gameOverEl.hidden = true;
        if (gameOverEntryEl) gameOverEntryEl.hidden = false;
        if (gameOverBoardEl) gameOverBoardEl.hidden = true;
        pendingScore = null;
        gameOverEndReason = null;
    }

    async function showGameOver(reason) {
        if (!gameOverEl) return;
        gameOverEndReason = reason;
        await fetchHighScores();
        const qualifies = scoreQualifiesForBoard(koScore);
        if (!qualifies) pendingScore = null;

        const reasons = {
            hits: 'You took too much fire. The eye cooked you.',
            nuke: 'A nuke landed on you. Frak.',
            quit: qualifies ? 'Run ended. Record your score?' : 'Run ended.'
        };
        if (gameOverReasonEl) {
            gameOverReasonEl.textContent = reasons[reason] || 'Run complete.';
        }
        if (gameOverKosEl) gameOverKosEl.textContent = String(koScore);
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
        if (gameOver) return;
        gameOver = true;
        pendingScore = { score: koScore, hits: hitsTaken, reason };
        // Losses keep the session On (music, combat chrome, scatter). Quit turns it off.
        const keepSession = reason === 'hits' || reason === 'nuke';
        clearAllBots();
        clearInboundSchedulers();
        clearHealTimer();
        runStartedAt = 0;
        clearTimeout(idleTimer);
        setEyeTracking(false);
        cancelIntroNuke();
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
        syncMusic();
        if (!keepSession) {
            syncWorldEndedLook();
        }
        showGameOver(reason);
    }

    function resetRunStats() {
        koScore = 0;
        hitCount = 0;
        hitsTaken = 0;
        gameOver = false;
        pendingScore = null;
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
        if (!on && wasOn && !gameOver) {
            // Voluntary stop — offer initials only if the run can make the board
            if (koScore > 0) {
                endGame('quit');
                return;
            }
        }
        settings.gameEnabled = on;
        saveSettings();
        if (!on) {
            cancelIntroNuke();
            clearAllBots();
            clearInboundSchedulers();
            clearHealTimer();
            runStartedAt = 0;
            clearTimeout(idleTimer);
            setEyeTracking(false);
            draggingReticle = false;
            reticlePointerId = null;
            paused = false;
            pauseStartedAt = 0;
            document.body.classList.remove('cylon-touch-play');
            hideGameOver();
            gameOver = false;
            pendingScore = null;
            if (helpEl && !helpEl.hidden) {
                helpEl.hidden = true;
            }
            resetAbilityCooldowns();
            syncGameToggleUi();
            syncReticleVisibility();
            syncMusic();
            syncWorldEndedLook();
        } else {
            cancelIntroNuke();
            clearAllBots();
            clearInboundSchedulers();
            hideGameOver();
            resetRunStats();
            resetAbilityCooldowns();
            syncGameToggleUi();
            syncReticleVisibility();
            syncMusic();
            // Combat chrome on; page stays intact until the intro nuke hits
            syncWorldEndedLook({ deferScatter: true });
            playIntroNuke();
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
                const score = pendingScore ? pendingScore.score : koScore;
                scoreSubmitBtn.disabled = true;
                await submitHighScore(score, initials);
                pendingScore = null;
                scoreSubmitBtn.disabled = false;
                revealHighScoreBoard();
            });
        }

        const scoreSkipBtn = document.getElementById('cylon-score-skip');
        if (scoreSkipBtn) {
            scoreSkipBtn.addEventListener('click', () => {
                pendingScore = null;
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
        bindAbilityTap(raptorBtn, () => { callRaptor(); });
        bindAbilityTap(grenadeBtn, () => { readyGrenade(); });
        window.addEventListener('keydown', (e) => {
            if (isTypingTarget(e.target)) return;
            // Don't steal browser shortcuts (Ctrl/Cmd+R refresh, etc.)
            if (e.ctrlKey || e.metaKey || e.altKey) return;
            if (e.key === 'Escape') {
                cancelGrenadeArm();
                return;
            }
            if (e.key === 'r' || e.key === 'R') {
                e.preventDefault();
                callRaptor();
            } else if (e.key === 'g' || e.key === 'G') {
                e.preventDefault();
                readyGrenade();
            }
        });
        // Next click after arming throws at the click point
        window.addEventListener('pointerdown', (e) => {
            if (!grenadeArmed) return;
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
            throwGrenadeAt(e.pageX, e.pageY);
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
            if (key === 'musicEnabled' || key === 'musicVolume') {
                syncMusic();
            }
            if (key === 'soundEnabled' || key === 'soundVolume') {
                ensureAudioContext();
                applyBusVolumes();
            }
            if (key === 'soundEnabled' && !settings.soundEnabled && !settings.musicEnabled && audioCtx) {
                audioCtx.suspend().catch(() => {});
            }
            if ((key === 'soundEnabled' || key === 'musicEnabled') && (settings.soundEnabled || settings.musicEnabled)) {
                ensureAudioContext();
            }
        };

        settingsRoot.querySelectorAll('[data-setting]').forEach((input) => {
            input.addEventListener('change', () => applySettingInput(input));
            if (input.type === 'range') {
                input.addEventListener('input', () => applySettingInput(input));
            }
        });
    }

    window.cylonStartGame = () => {
        if (settings.gameEnabled || gameOver) return;
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
    window.addEventListener('pointerdown', unlockAudioFromGesture, { passive: true });
    window.addEventListener('keydown', unlockAudioFromGesture, { passive: true });
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
