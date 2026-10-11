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
 * The game's parts are TypeScript in src/, compiled to js/ (see README.md,
 * "Source layout and build"). The pure ones: rules (difficulty, caps, hull tint,
 * volume curve), playfield (where drones may stand), state (the due-at moments
 * and the run's score and hull as data with pure transitions), abilities (the
 * grenade and the raptor), scores (the scores.php client). The ones that work on
 * the page's elements, each a factory handed what it needs: audio (the buses,
 * effects and music bed), field (terrain holes and glyph debris), intro (the
 * opening strike), landscape (the backdrop and the letter kicks), eye (the
 * scanner eye and its glare), reticle (the aim), units (drones, missiles and the
 * mid-run nuke), gameover (the game-over panel and the board) and chrome (the
 * settings and the nav). This file measures the page, owns the run's state and
 * timers, and wires them together.
 */
import * as rules from './js/rules.js?v=7889c1e71d';
import * as playfield from './js/playfield.js?v=848b755745';
import { createAudio } from './js/audio.js?v=19ef6956c2';
import { createAbilities, cooldownSeconds } from './js/abilities.js?v=e1407fd932';
import { createHoles, createDebris, HOLE_PRESETS } from './js/field.js?v=308463842f';
import { createIntro } from './js/intro.js?v=59b2ae7b2a';
import { createLandscape } from './js/landscape.js?v=9747fb9a2b';
import { createEye } from './js/eye.js?v=156f60570d';
import { createReticle } from './js/reticle.js?v=3896896eb0';
import { createUnits } from './js/units.js?v=a4b4545e56';
import { createGameOver } from './js/gameover.js?v=c6461fd842';
import { createChrome } from './js/chrome.js?v=9114f7a639';
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
    if (!eye || !field) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
    const BOT_HARD_CAP = coarsePointer ? 10 : 30;
    if (reduceMotion) return;

    const scores = createScoresClient(options.scoresApi || CYLON_SCORES_URL, {
        fetch: (url, init) => fetch(url, init),
    });
    /**
     * What the modules share and replace as the game runs (src/types.ts). `run` is
     * the run's score and hull and `schedule` the moments the game is waiting for
     * (src/state.ts); each state transition returns a new one, which replaces it here.
     */
    const game = {
        run: state.createRun(),
        schedule: state.createSchedule(),
        paused: false,
        pauseStartedAt: 0,
        nukeInFlight: false,
        reticlePointerId: null,
        draggingReticle: false,
        idleTimer: null,
    };
    const mouse = {
        clientX: window.innerWidth / 2,
        clientY: window.innerHeight / 3,
        pageX: window.innerWidth / 2,
        pageY: window.innerHeight / 3,
        t: 0
    };
    let healTimer = null;
    let abilityCdTimer = null;
    let lastAim = { clientX: 0, clientY: 0, t: 0 };
    let missileTimer = null;
    let nukeTimer = null;
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
    const EYE_DISORIENT_MS = 30000;
    const GRENADE_RADIUS = HOLE_PRESETS.medium.radius; // ~50% larger than prior 110px
    const NAV_FADE_MS = Math.round(2850 * 0.45); // match --cylon-desolate-fade * 0.45

    /** The game-over panel and the high scores (src/gameover.ts). */
    const { renderHighScores, fetchHighScores, hideGameOver, showGameOver, bindGameOverUi } = createGameOver({
        game,
        state,
        scores,
        formatHighScoreRows,
        weeklyResetText,
        currentHp,
        setGameEnabled,
        resetRunStats,
        highScoresEl,
        gameOverEl,
        gameOverReasonEl,
        gameOverKosEl,
        gameOverHitsEl,
        gameOverEntryEl,
        gameOverBoardEl,
        gameOverScoresEl,
        scoreSubmitBtn,
        initialsErrorEl,
        playAgainBtn,
        initialLetters,
        initialsRoot,
    });
    /** The settings and the nav chrome (src/chrome.ts). */
    const { settings, saveSettings, syncGameToggleUi, syncNavChrome, bindSettings, bindGameToggle, bindNavMenu } = createChrome({
        settingsRoot,
        gameToggleBtn,
        gameToggleLabel,
        cicEnterBtn,
        navBurger,
        navMenu,
        navGame,
        siteBrand,
        BRAND_CIVIL,
        BRAND_COMBAT,
        NAV_FADE_MS,
        reduceMotion,
        renderHighScores,
        fetchHighScores,
        setGameEnabled,
        setEyeTracking: (on) => setEyeTracking(on),
        settingChanged: (key) => audio.settingChanged(key),
    });

    function scrollX() {
        return window.scrollX || window.pageXOffset || 0;
    }

    function scrollY() {
        return window.scrollY || window.pageYOffset || 0;
    }

    function resizeBattlefield() {
        // Battlefield uses CSS inset:0 against body — clear any old inline sizing
        // that previously tracked scrollHeight and caused dual/growing scrollbars.
        field.style.width = '';
        field.style.height = '';
    }

    /** Combat session chrome / music — stays true through game-over until Game Off. */
    function sessionActive() {
        return settings.gameEnabled && !game.paused;
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
        paused: () => game.paused,
        startRun: () => scores.startRun(),
        launched: () => {
            audio.prime();
            audio.sfx('introLaunch');
        },
        setNukeInFlight: (inFlight) => { game.nukeInFlight = inFlight; },
        detonate: (x, y) => detonateNukeAt(x, y, { dealDamage: false, shake: false }),
        beginCombat: beginCombatAfterIntro,
    });

    /** Actively fighting — false during intro cinematic and game-over overlays. */
    function isGameLive() {
        return sessionActive() && !game.run.gameOver && !intro.playing();
    }

    /** The terrain holes (src/field.ts). */
    const holes = createHoles({
        field,
        isLive: isGameLive,
        paused: () => game.paused,
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
        readyAt: (which) => (which === 'grenade' ? game.schedule.grenadeReadyAt : game.schedule.raptorReadyAt),
        setReadyAt: (which, at) => {
            if (which === 'grenade') game.schedule.grenadeReadyAt = at;
            else game.schedule.raptorReadyAt = at;
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

    /** The landscape writers and the letter kicks (src/landscape.ts). */
    const { rearrangeLandscape, rearrangeLandscapePage, disruptGlyphs, clearLandscapeVars, randRange } = createLandscape({
        reduceMotion,
        scrollX,
        scrollY,
    });
    /** The scanner eye and its glare (src/eye.ts). */
    const { isEyeDisoriented, setEyeTracking, disorientEye, clearEyeDisorient, eyeClientCenter, updateEye } = createEye({
        eye,
        glare,
        game,
        settings,
        mouse,
        state,
        isGameLive,
        EYE_DISORIENT_MS,
    });
    /** The aim and the reticle (src/reticle.ts). */
    const { syncMousePageFromClient, paintReticle, syncReticleVisibility, resetReticleToCenter, onPointerMove, bindReticle } = createReticle({
        reticleEl,
        mouse,
        lastAim,
        game,
        settings,
        coarsePointer,
        IDLE_MS,
        isGameLive,
        isEyeDisoriented,
        setEyeTracking,
        audio,
        abilities,
        scrollX,
        scrollY,
    });
    /** The drones, the missiles and the mid-run nuke (src/units.ts). */
    const {
        allBots, knockOutBot, clearAllBots, wipeAllBotsWithScore, herdBotsIntoView, scheduleAmbush, bindPlayerMissShots,
        canLaunchMissile, launchSmallMissile, clearActiveMissiles, launchNuke, detonateNukeAt,
    } = createUnits({
        game,
        settings,
        mouse,
        lastAim,
        state,
        rules,
        playfield,
        field,
        ambushUnder,
        missileEl,
        nukeEl,
        nukeMissileEl,
        scoreEl,
        audio,
        intro,
        abilities,
        holes,
        debris,
        punchHole,
        HOLE_PRESETS,
        isGameLive,
        isEyeDisoriented,
        eyeClientCenter,
        syncMousePageFromClient,
        rearrangeLandscape,
        rearrangeLandscapePage,
        disruptGlyphs,
        randRange,
        registerHit,
        resizeBattlefield,
        scrollX,
        scrollY,
        BOT_HARD_CAP,
        BOT_SIZE,
        LINK_PAD,
        HIT_RADIUS,
        BOLT_HIT_RADIUS,
        NUKE_DIRECT_HIT_RADIUS,
        NUKE_SPEED,
        NUKE_ARRIVE_RADIUS,
        NUKE_MAX_FLIGHT_MS,
        MISSILE_SPEED,
        MISSILE_ARRIVE,
        MISSILE_MAX_FLIGHT_MS,
        MISSILE_BLAST_RADIUS,
        SMALL_WEAPON_SCALE,
        MISSILE_WEAPON_SCALE,
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

    function lerp(a, b, t) {
        return rules.lerp(a, b, t);
    }

    function difficultyFactor() {
        return rules.difficultyFactor(game.run.koScore, game.run.runStartedAt, Date.now());
    }

    function nextMissileDelayMs() {
        return rules.nextMissileDelayMs(game.run.koScore, Math.random);
    }

    function nextNukeDelayMs() {
        return rules.nextNukeDelayMs(difficultyFactor(), Math.random);
    }

    function clearInboundSchedulers() {
        clearTimeout(missileTimer);
        clearTimeout(nukeTimer);
        missileTimer = null;
        nukeTimer = null;
        game.schedule.missileDueAt = 0;
        game.schedule.nukeDueAt = 0;
        clearActiveMissiles();
    }

    function scheduleMissiles(first = false) {
        clearTimeout(missileTimer);
        if (!isGameLive()) return;
        const wait = first ? 4000 + Math.random() * 3000 : nextMissileDelayMs();
        game.schedule.missileDueAt = Date.now() + wait;
        missileTimer = setTimeout(() => {
            missileTimer = null;
            if (!isGameLive() || game.paused) return;
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
        game.schedule.nukeDueAt = Date.now() + wait;
        nukeTimer = setTimeout(() => {
            nukeTimer = null;
            if (!isGameLive() || game.paused) return;
            if (!isEyeDisoriented() && !game.nukeInFlight) {
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
        const before = game.schedule;
        game.schedule = state.skewForPause(before, game.pauseStartedAt, elapsed);

        if (game.schedule.missileDueAt !== before.missileDueAt) {
            clearTimeout(missileTimer);
            missileTimer = setTimeout(() => {
                missileTimer = null;
                if (!isGameLive() || game.paused) return;
                if (!isEyeDisoriented() && (canLaunchMissile(false) || canLaunchMissile(true))) {
                    launchSmallMissile();
                }
                scheduleMissiles(false);
            }, state.msUntil(game.schedule.missileDueAt, Date.now()));
        }
        if (game.schedule.nukeDueAt !== before.nukeDueAt) {
            clearTimeout(nukeTimer);
            nukeTimer = setTimeout(() => {
                nukeTimer = null;
                if (!isGameLive() || game.paused) return;
                if (!isEyeDisoriented() && !game.nukeInFlight) launchNuke();
                scheduleNukes(false);
            }, state.msUntil(game.schedule.nukeDueAt, Date.now()));
        }
        if (game.schedule.healDueAt !== before.healDueAt) {
            clearTimeout(healTimer);
            healTimer = setTimeout(() => {
                healTimer = null;
                tryHeal();
            }, state.msUntil(game.schedule.healDueAt, Date.now()));
        }

        holes.resume(game.pauseStartedAt, elapsed);
    }

    function clearHealTimer() {
        clearTimeout(healTimer);
        healTimer = null;
        game.schedule.healDueAt = 0;
    }

    function tryHeal() {
        healTimer = null;
        game.schedule.healDueAt = 0;
        if (!isGameLive() || game.run.hitCount <= 0) return;
        game.run = state.healOne(game.run);
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
        if (!settings.gameEnabled || game.run.gameOver || game.paused || game.run.hitCount <= 0) return;
        game.schedule.healDueAt = Date.now() + HEAL_IDLE_MS;
        healTimer = setTimeout(() => {
            healTimer = null;
            tryHeal();
        }, HEAL_IDLE_MS);
    }

    function onScroll() {
        syncMousePageFromClient();
        // After the user scrolls, pull stragglers back into the visible playfield
        clearTimeout(herdTimer);
        herdTimer = setTimeout(herdBotsIntoView, 180);
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
        if (!game.paused) {
            game.paused = true;
            game.pauseStartedAt = Date.now();
            clearTimeout(game.idleTimer);
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
        if (game.paused) {
            const elapsed = Date.now() - game.pauseStartedAt;
            applyPauseTimeSkew(elapsed);
            game.paused = false;
            game.pauseStartedAt = 0;
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


    function currentHp() {
        return rules.currentHp(game.run.hitCount);
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
        if (game.run.gameOver || !isGameLive()) return;
        const hit = state.takeHits(game.run, count, MAX_HITS, fromNuke);
        game.run = hit.run;
        updateHitsUi();
        audio.sfx('hit');
        scheduleHeal();

        if (hit.ends) {
            clearHealTimer();
            endGame(hit.ends);
        }
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
        updateCooldownButton(raptorBtn, raptorCdEl, game.schedule.raptorReadyAt, !abilities.raptorInbound());
    }

    function updateGrenadeButton() {
        // Stay clickable while armed so a second press cancels
        updateCooldownButton(grenadeBtn, grenadeCdEl, abilities.grenadeArmed() ? 0 : game.schedule.grenadeReadyAt, true);
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

    function beginCombatAfterIntro() {
        if (!settings.gameEnabled || game.run.gameOver) return;
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
        game.run = state.beginRun(game.run, Date.now());
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

    function endGame(reason) {
        if (game.run.gameOver) return;
        game.run = state.endRun(game.run, reason);
        // Losses keep the session On (music, combat chrome, scatter). Quit turns it off.
        const keepSession = reason === 'hits' || reason === 'nuke';
        clearAllBots();
        clearInboundSchedulers();
        clearHealTimer();
        clearTimeout(game.idleTimer);
        setEyeTracking(false);
        intro.cancel();
        game.draggingReticle = false;
        game.reticlePointerId = null;
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
        game.run = state.resetScore(game.run);
        clearHealTimer();
        if (scoreEl) scoreEl.textContent = '0';
        updateHitsUi();
    }

    function setGameEnabled(on) {
        const wasOn = settings.gameEnabled;
        if (!on && wasOn && !game.run.gameOver) {
            // Voluntary stop — offer initials only if the run can make the board
            if (game.run.koScore > 0) {
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
            game.run = state.stopClock(game.run);
            clearTimeout(game.idleTimer);
            setEyeTracking(false);
            game.draggingReticle = false;
            game.reticlePointerId = null;
            game.paused = false;
            game.pauseStartedAt = 0;
            document.body.classList.remove('cylon-touch-play');
            hideGameOver();
            game.run = state.clearPendingScore(state.clearGameOver(game.run));
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

    function isTypingTarget(el) {
        const tag = (el && el.tagName) || '';
        return tag === 'INPUT' || tag === 'TEXTAREA' || (el && el.isContentEditable);
    }

    function bindAbilityControls() {
        const bindAbilityTap = (btn, action) => {
            if (!btn) return;
            // pointerup so a second finger can fire abilities while the first drags the pip
            btn.addEventListener('pointerup', (e) => {
                if (game.reticlePointerId != null && e.pointerId === game.reticlePointerId) return;
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

    window.cylonStartGame = () => {
        if (settings.gameEnabled || game.run.gameOver) return;
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
