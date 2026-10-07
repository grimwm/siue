/**
 * Shows a panel matching the "nav-" id. All other panels with a "nav-" id prefix
 * are hidden.
 */
function showNavDiv(divId) {
    const divs = document.querySelectorAll("[id^='nav-']");
    divs.forEach(div => { div.classList.remove("is-active"); });
    const target = document.getElementById(`nav-${divId}`);
    if (target) {
        target.classList.add("is-active");
    }
}

/**
 * Toggles between dark and light theme, persisting the choice in localStorage.
 */
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-bs-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    html.setAttribute('data-bs-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    updateThemeIcon(newTheme);
}

/**
 * Initializes the theme from localStorage or defaults to dark.
 */
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    const html = document.documentElement;
    html.setAttribute('data-bs-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

/**
 * Updates the theme icon based on the current theme.
 */
function updateThemeIcon(theme) {
    const icon = document.getElementById('theme-icon');
    if (!icon) return;

    if (theme === 'dark') {
        icon.className = 'bi bi-sun';
    } else {
        icon.className = 'bi bi-moon';
    }
}

/**
 * Mouse-tracking scanner eye + ambush drones on document "ground".
 * Touch devices use a draggable reticle as the aim / dodge point.
 * Disabled for reduced-motion preferences.
 */
function initializeCylonEffects() {
    const eye = document.getElementById('cylon-eye');
    const glare = document.getElementById('cylon-glare');
    const field = document.getElementById('cylon-battlefield');
    const nukeEl = document.getElementById('cylon-nuke');
    const nukeMissileEl = document.getElementById('cylon-nuke-missile');
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
    if (reduceMotion) return;

    let draggingReticle = false;
    let reticlePointerId = null;

    const SETTINGS_KEY = 'cylon-settings';
    const SCORES_API = 'scores.php';
    const defaults = {
        gameEnabled: false,
        soundEnabled: true,
        musicEnabled: true,
        soundVolume: 85,
        musicVolume: 40,
        eyeEnabled: true,
        nukesEnabled: true
    };
    let settings = loadSettings();
    // Game stays off until the player explicitly enables it
    settings.gameEnabled = false;
    settings.soundVolume = Math.max(0, Math.min(100, Number(settings.soundVolume) || defaults.soundVolume));
    settings.musicVolume = Math.max(0, Math.min(100, Number(settings.musicVolume) || defaults.musicVolume));

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
    let gameOver = false;
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
    let abilityCdTimer = null;
    let eyeDisorientedUntil = 0;
    let grenadeReadyAt = 0;
    let grenadeArmed = false;
    let nukeInFlight = false;
    let herdTimer = null;
    let cachedHighScores = [];

    const IDLE_MS = 2000;
    const BOT_SIZE = { w: 44, h: 56 };
    const LINK_PAD = 28;
    const MAX_BOTS = 4;
    const MAX_WAVE = 3;
    const HIT_RADIUS = 52;
    const HITS_PER_NUKE = 10;
    const MAX_HITS = 30;
    const NUKE_DIRECT_HIT_RADIUS = 120;
    const NUKE_SPEED = 520; // px/sec toward cursor
    const NUKE_ARRIVE_RADIUS = 28;
    const NUKE_MAX_FLIGHT_MS = 2800;
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
        const nukes = settingsRoot.querySelector('[data-setting="nukesEnabled"]');
        if (sound) sound.checked = settings.soundEnabled;
        if (music) music.checked = settings.musicEnabled;
        if (soundVol) soundVol.value = String(settings.soundVolume);
        if (musicVol) musicVol.value = String(settings.musicVolume);
        if (eyeToggle) eyeToggle.checked = settings.eyeEnabled;
        if (nukes) nukes.checked = settings.nukesEnabled;
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

    function formatHighScoreRows(list) {
        if (!list.length) {
            return '<li class="cylon-hs-empty">No scores yet</li>';
        }
        return list.map((entry, i) => {
            const when = entry.at ? new Date(entry.at) : null;
            const date = when && !Number.isNaN(when.getTime())
                ? when.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                : '';
            const initials = (entry.initials || 'AAA').toString().slice(0, 3).toUpperCase();
            return `<li><span>#${i + 1} <strong>${initials}</strong> ${date}</span><span class="cylon-hs-score">${entry.score} KOs</span></li>`;
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
                    hits: pendingScore ? pendingScore.hits : hitCount,
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

    function volumeToGain(pct) {
        const t = Math.max(0, Math.min(100, Number(pct) || 0)) / 100;
        // Gentle curve so mid slider values aren't too loud
        return t * t;
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
            sfxBus.gain.value = settings.soundEnabled ? volumeToGain(settings.soundVolume) : 0;
        }
        if (musicBus) {
            const on = settings.musicEnabled && isGameLive() && musicPlaying;
            const target = on ? volumeToGain(settings.musicVolume) : 0;
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

    function isGameLive() {
        return settings.gameEnabled && !gameOver && !paused;
    }

    function startMusic() {
        if (musicPlaying || !settings.musicEnabled || settings.musicVolume <= 0 || !isGameLive()) return;
        const ctx = ensureAudioContext();
        if (!ctx || !musicBus) return;

        const begin = () => {
            if (musicPlaying || !settings.musicEnabled || !isGameLive()) return;

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
        const want = isGameLive() && settings.musicEnabled && settings.musicVolume > 0;
        if (want) {
            if (!musicPlaying) startMusic();
            else applyBusVolumes();
        } else {
            stopMusic(true);
        }
    }

    function applyPauseTimeSkew(elapsed) {
        if (elapsed <= 0) return;
        if (grenadeReadyAt > pauseStartedAt) grenadeReadyAt += elapsed;
        if (raptorReadyAt > pauseStartedAt) raptorReadyAt += elapsed;
        if (eyeDisorientedUntil > pauseStartedAt) eyeDisorientedUntil += elapsed;

        activeHoles.forEach((h) => {
            if (h.phase === 'hold' && h.holdDue > pauseStartedAt) {
                clearTimeout(h.holdTimer);
                h.holdDue += elapsed;
                h.holdTimer = setTimeout(() => beginHoleFade(h), Math.max(0, h.holdDue - Date.now()));
            } else if (h.phase === 'fade' && h.fadeDue > pauseStartedAt) {
                clearTimeout(h.fadeTimer);
                h.fadeDue += elapsed;
                h.fadeTimer = setTimeout(() => removeHoleEntry(h), Math.max(0, h.fadeDue - Date.now()));
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

    function playProjectileSound() {
        playTone({ freq: 980, freqEnd: 240, type: 'sawtooth', duration: 0.14, gain: 0.07 });
        playTone({ freq: 1400, freqEnd: 400, type: 'square', duration: 0.08, gain: 0.035, delay: 0.01 });
    }

    function playKoSound() {
        playTone({ freq: 180, freqEnd: 55, type: 'triangle', duration: 0.22, gain: 0.09 });
        playNoiseBurst({ duration: 0.2, gain: 0.07 });
        playTone({ freq: 720, freqEnd: 120, type: 'square', duration: 0.1, gain: 0.04, delay: 0.02 });
    }

    function playNukeSound() {
        playNoiseBurst({ duration: 0.9, gain: 0.14 });
        playTone({ freq: 90, freqEnd: 28, type: 'sawtooth', duration: 1.1, gain: 0.12 });
        playTone({ freq: 220, freqEnd: 40, type: 'triangle', duration: 0.7, gain: 0.06, delay: 0.05 });
        playTone({ freq: 60, freqEnd: 20, type: 'sine', duration: 1.6, gain: 0.1, delay: 0.08 });
    }

    function playHitSound() {
        playTone({ freq: 160, freqEnd: 70, type: 'sawtooth', duration: 0.1, gain: 0.05 });
        playNoiseBurst({ duration: 0.08, gain: 0.04 });
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
        // Ground impacts
        playTone({ freq: 90, freqEnd: 35, type: 'sine', duration: 0.35, gain: 0.1, delay: 0.7 });
        playTone({ freq: 70, freqEnd: 28, type: 'triangle', duration: 0.4, gain: 0.08, delay: 0.95 });
        playNoiseBurst({ duration: 0.45, gain: 0.1, delay: 0.72, filterFreq: 400, filterType: 'lowpass' });
        playNoiseBurst({ duration: 0.5, gain: 0.09, delay: 1.0, filterFreq: 350, filterType: 'lowpass' });
    }

    function playGrenadeArmSound() {
        playTone({ freq: 640, freqEnd: 420, type: 'square', duration: 0.09, gain: 0.05 });
        playTone({ freq: 880, freqEnd: 660, type: 'triangle', duration: 0.07, gain: 0.035, delay: 0.04 });
        playNoiseBurst({ duration: 0.06, gain: 0.03, filterFreq: 2200 });
    }

    function playGrenadeSound() {
        // Throw whoosh
        playTone({ freq: 420, freqEnd: 140, type: 'sawtooth', duration: 0.14, gain: 0.05 });
        playNoiseBurst({ duration: 0.12, gain: 0.05, filterFreq: 1800, filterType: 'highpass' });
        // Detonation
        playTone({ freq: 95, freqEnd: 32, type: 'sine', duration: 0.45, gain: 0.14, delay: 0.08 });
        playTone({ freq: 160, freqEnd: 45, type: 'sawtooth', duration: 0.35, gain: 0.1, delay: 0.09 });
        playTone({ freq: 60, freqEnd: 22, type: 'triangle', duration: 0.55, gain: 0.09, delay: 0.1 });
        playNoiseBurst({ duration: 0.4, gain: 0.16, delay: 0.08, filterFreq: 500, filterType: 'lowpass' });
        playNoiseBurst({ duration: 0.28, gain: 0.1, delay: 0.1, filterFreq: 1400 });
        playNoiseBurst({ duration: 0.5, gain: 0.07, delay: 0.18, filterFreq: 220, filterType: 'lowpass' });
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
        if (isGameLive() && settings.eyeEnabled && !isEyeDisoriented()) {
            setEyeTracking(true);
            clearTimeout(idleTimer);
            idleTimer = setTimeout(() => setEyeTracking(false), IDLE_MS);
        }
    }

    function syncReticleVisibility() {
        if (!reticleEl) return;
        const show = isGameLive() && coarsePointer;
        reticleEl.hidden = !show;
        reticleEl.setAttribute('aria-hidden', show ? 'false' : 'true');
        if (show) paintReticle();
    }

    function resetReticleToCenter() {
        setAim(window.innerWidth / 2, window.innerHeight * 0.42);
    }

    function onPointerMove(e) {
        if (settings.soundEnabled) ensureAudio();
        // Reticle finger is handled in bindReticle (per pointerId)
        if (reticlePointerId != null && e.pointerId === reticlePointerId) return;
        // Other touch fingers must not move aim (so a tap/attack finger is free)
        if (coarsePointer && e.pointerType === 'touch') return;
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

    function updateHitsUi() {
        if (hitsEl) hitsEl.textContent = String(hitCount);
    }

    function registerHit(count = 1, { fromNuke = false } = {}) {
        if (gameOver || !isGameLive()) return;
        hitCount += count;
        updateHitsUi();
        playHitSound();

        if (fromNuke) {
            endGame('nuke');
            return;
        }

        // Nukes are triggered by projectile hits only — avoid nuke→hit→nuke loops.
        // Disoriented eye (post-Raptor) cannot launch.
        if (
            !isEyeDisoriented()
            && settings.nukesEnabled
            && hitCount > 0
            && hitCount % HITS_PER_NUKE === 0
            && hitCount < MAX_HITS
        ) {
            launchNuke();
        }

        if (hitCount >= MAX_HITS) {
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

        const duration = Math.min(0.55, 0.18 + dist / 1800);
        const anim = bolt.animate(
            [
                { left: `${fromX}px`, top: `${fromY}px`, opacity: 1, width: '14px' },
                { left: `${toX}px`, top: `${toY}px`, opacity: 0.85, width: '22px' }
            ],
            { duration: duration * 1000, easing: 'linear', fill: 'forwards' }
        );
        anim.onfinish = () => {
            bolt.remove();
            const impact = document.createElement('div');
            impact.className = 'cylon-impact';
            impact.style.left = `${toX}px`;
            impact.style.top = `${toY}px`;
            impact.setAttribute('aria-hidden', 'true');
            field.appendChild(impact);
            setTimeout(() => impact.remove(), 300);

            syncMousePageFromClient();
            const miss = Math.hypot(mouse.pageX - toX, mouse.pageY - toY);
            if (miss <= HIT_RADIUS) {
                registerHit();
            }
        };
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
        entry.fadeTimer = setTimeout(() => removeHoleEntry(entry), entry.fadeMs);
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
        entry.holdTimer = setTimeout(() => beginHoleFade(entry), hold);
        activeHoles.push(entry);
    }

    function clearAllHoles() {
        [...activeHoles].forEach(removeHoleEntry);
        activeHoles = [];
        field?.querySelectorAll('.cylon-hole').forEach((el) => el.remove());
    }

    function clearAllBots() {
        field.querySelectorAll('.cylon-bot').forEach((bot) => {
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
        setTimeout(() => blast.remove(), 480);

        field.querySelectorAll('.cylon-bot').forEach((bot) => {
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
                hit.style.left = `${12 + Math.random() * 76}%`;
                hit.style.top = `${40 + Math.random() * 50}%`;
                raptorImpactsEl.appendChild(hit);
                setTimeout(() => hit.remove(), 560);
            }, i * 55);
        }
    }

    function wipeAllBotsWithScore() {
        const bots = [...field.querySelectorAll('.cylon-bot')];
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

        raptorInbound = true;
        raptorReadyAt = Date.now() + RAPTOR_COOLDOWN_MS;
        updateAbilityButtons();
        if (settings.soundEnabled) ensureAudio();
        playRaptorSound();
        disorientEye(EYE_DISORIENT_MS);

        raptorEl.classList.add('is-inbound');
        setTimeout(() => {
            spawnRaptorImpacts();
            wipeAllBotsWithScore();
        }, RAPTOR_STRIKE_AT_MS);

        setTimeout(() => {
            raptorEl.classList.remove('is-inbound');
            if (raptorImpactsEl) raptorImpactsEl.innerHTML = '';
            raptorInbound = false;
            updateAbilityButtons();
        }, 1900);

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
        field.querySelectorAll('.cylon-bot').forEach((bot) => {
            if (bot.dataset.ko === '1' || !bot.isConnected) return;
            const x = parseFloat(bot.style.left) || 0;
            const y = parseFloat(bot.style.top) || 0;
            if (!isInVisiblePlayfield(x, y)) moveBot(bot);
        });
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

    function spawnBot() {
        if (!isGameLive() || activeBots >= MAX_BOTS) return false;
        resizeBattlefield();
        const spot = findSafeSpot();
        if (!spot) return false;

        const from = marchOrigin(spot);
        const bot = document.createElement('button');
        bot.type = 'button';
        bot.className = 'cylon-bot is-marching';
        bot.title = 'Attack drone';
        bot.setAttribute('aria-label', 'Attack hostile drone');
        bot.style.left = `${from.x}px`;
        bot.style.top = `${from.y}px`;
        bot.innerHTML = '<span class="cylon-bot-body"></span><span class="cylon-bot-legs" aria-hidden="true"><span></span><span></span></span>';

        // pointerdown so a second finger can KO while the first drags the pip
        bot.addEventListener('pointerdown', (e) => {
            if (!isGameLive()) return;
            if (reticlePointerId != null && e.pointerId === reticlePointerId) return;
            if (e.pointerType === 'mouse' && e.button != null && e.button !== 0) return;
            e.preventDefault();
            e.stopPropagation();
            if (settings.soundEnabled) ensureAudio();
            knockOutBot(bot);
        });

        // Buttons swallow wheel events — forward scrolls so the page stays usable
        bot.addEventListener('wheel', (e) => {
            window.scrollBy({ top: e.deltaY, left: e.deltaX, behavior: 'auto' });
        }, { passive: true });

        field.appendChild(bot);
        activeBots += 1;

        requestAnimationFrame(() => {
            bot.style.left = `${spot.x}px`;
            bot.style.top = `${spot.y}px`;
        });

        setTimeout(() => {
            if (bot.dataset.ko === '1' || !bot.isConnected) return;
            bot.classList.remove('is-marching');
            if (!ensureClearOfLinks(bot)) {
                clearBotTimers(bot);
                bot.remove();
                activeBots = Math.max(0, activeBots - 1);
                return;
            }
            startCombat(bot);
        }, 950);

        return true;
    }

    function launchWave() {
        if (!isGameLive()) return;
        const room = MAX_BOTS - activeBots;
        if (room <= 0) return;
        const isWave = Math.random() < 0.55;
        const count = isWave
            ? Math.min(MAX_WAVE, room, 2 + Math.floor(Math.random() * 2))
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

    function detonateNukeAt(clientX, clientY) {
        if (!nukeEl) return;
        if (settings.soundEnabled) ensureAudio();
        playNukeSound();

        const vw = window.innerWidth || 1;
        const vh = window.innerHeight || 1;
        nukeEl.style.setProperty('--nuke-x', `${(clientX / vw) * 100}%`);
        nukeEl.style.setProperty('--nuke-y', `${(clientY / vh) * 100}%`);
        nukeEl.classList.add('is-detonating');
        document.body.classList.add('is-nuke-shake');

        // Direct hit ends the run
        const dist = Math.hypot(mouse.clientX - clientX, mouse.clientY - clientY);
        if (dist <= NUKE_DIRECT_HIT_RADIUS) {
            registerHit(Math.max(1, MAX_HITS - hitCount), { fromNuke: true });
        }

        setTimeout(() => document.body.classList.remove('is-nuke-shake'), 600);
        setTimeout(() => nukeEl.classList.remove('is-detonating'), 2500);
    }

    function launchNuke() {
        if (!isGameLive() || !settings.nukesEnabled || isEyeDisoriented() || nukeInFlight) return;
        if (!nukeMissileEl) {
            detonateNukeAt(mouse.clientX, mouse.clientY);
            return;
        }

        nukeInFlight = true;
        const origin = eyeClientCenter();
        let x = origin.x;
        let y = origin.y;
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

            const tx = mouse.clientX;
            const ty = mouse.clientY;
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

    function hideGameOver() {
        if (gameOverEl) gameOverEl.hidden = true;
        if (gameOverEntryEl) gameOverEntryEl.hidden = false;
        if (gameOverBoardEl) gameOverBoardEl.hidden = true;
        pendingScore = null;
    }

    function showGameOver(reason) {
        if (!gameOverEl) return;
        const reasons = {
            hits: 'You took too much fire. The eye cooked you.',
            nuke: 'A nuke landed on you. Frak.',
            quit: 'Run ended. Record your score?'
        };
        if (gameOverReasonEl) {
            gameOverReasonEl.textContent = reasons[reason] || 'Run complete.';
        }
        if (gameOverKosEl) gameOverKosEl.textContent = String(koScore);
        if (gameOverHitsEl) gameOverHitsEl.textContent = String(hitCount);
        if (gameOverEntryEl) gameOverEntryEl.hidden = koScore < 1;
        if (gameOverBoardEl) {
            gameOverBoardEl.hidden = koScore >= 1;
            if (koScore < 1) fetchHighScores();
        }
        gameOverEl.hidden = false;
        if (koScore >= 1 && initialLetters[0]) {
            resetInitials();
        }
    }

    function endGame(reason) {
        if (gameOver) return;
        gameOver = true;
        pendingScore = { score: koScore, hits: hitCount, reason };
        settings.gameEnabled = false;
        saveSettings();
        clearAllBots();
        clearTimeout(idleTimer);
        setEyeTracking(false);
        cancelGrenadeArm();
        nukeInFlight = false;
        if (nukeMissileEl) nukeMissileEl.classList.remove('is-flying');
        draggingReticle = false;
        reticlePointerId = null;
        document.body.classList.remove('cylon-touch-play');
        updateAbilityButtons();
        syncGameToggleUi();
        syncReticleVisibility();
        syncMusic();
        showGameOver(reason);
    }

    function resetRunStats() {
        koScore = 0;
        hitCount = 0;
        gameOver = false;
        pendingScore = null;
        if (scoreEl) scoreEl.textContent = '0';
        updateHitsUi();
    }

    function revealHighScoreBoard() {
        if (gameOverEntryEl) gameOverEntryEl.hidden = true;
        if (gameOverBoardEl) gameOverBoardEl.hidden = false;
        fetchHighScores();
    }

    function setGameEnabled(on) {
        const wasOn = settings.gameEnabled;
        if (!on && wasOn && !gameOver) {
            // Voluntary stop — still offer initials if they scored
            if (koScore > 0) {
                endGame('quit');
                return;
            }
        }
        settings.gameEnabled = on;
        saveSettings();
        if (!on) {
            clearAllBots();
            clearTimeout(idleTimer);
            setEyeTracking(false);
            cancelGrenadeArm();
            draggingReticle = false;
            reticlePointerId = null;
            paused = false;
            pauseStartedAt = 0;
            document.body.classList.remove('cylon-touch-play');
            if (!gameOver) hideGameOver();
            if (helpEl && !helpEl.hidden) {
                helpEl.hidden = true;
            }
        } else {
            hideGameOver();
            resetRunStats();
            if (coarsePointer) {
                resetReticleToCenter();
                document.body.classList.add('cylon-touch-play');
            }
        }
        updateAbilityButtons();
        syncGameToggleUi();
        syncReticleVisibility();
        syncMusic();
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
                setGameEnabled(true);
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

    bindSettings();
    bindGameToggle();
    bindAbilityControls();
    bindGameOverUi();
    bindReticle();
    bindNavMenu();
    bindHelp();
    resizeBattlefield();
    updateHitsUi();
    syncReticleVisibility();
    renderHighScores();
    fetchHighScores();
    window.addEventListener('resize', resizeBattlefield);

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointerdown', unlockAudioFromGesture, { passive: true });
    window.addEventListener('keydown', unlockAudioFromGesture, { passive: true });
    requestAnimationFrame(updateEye);
    scheduleAmbush(true);
}
