/* Entry: wires the game, the board, audio and music, the UI, the level editor and share links, opens the title card (or, with
 * ?seed=, Chapter 1's card over it; with #edit, the editor; with a share link, its card), and exposes
 * window.__creteTest for the browser specs. */
import atlasJson from '../fx/sprites/tiles.json' with { type: 'json' };
import iconsJson from '../fx/sprites/modern-icons.json' with { type: 'json' };
import type { IconSheet } from './icons-models.ts';
import { createAudio } from './audio.ts';
import { createAudioCore } from '../../_kit/audio/core.ts';
import { createMusic } from './music.ts';
import { mediaDeck, pickSource } from './music-decks.ts';
import type { AudioSource } from './music-decks.ts';
import { createBoard } from './board.ts';
import { createSheetBoard } from './sheet-board.ts';
import { IDLE_MS, NO_CUES, createFoundClock, createGlassClock, cueKey, cuesMoving, fakeFaces, hazeCue } from './wall-cues.ts';
import type { CueDraw, CuesShown } from './wall-cues.ts';
import { extent, project, unproject } from './sheet.ts';
import type { Frame } from './sheet.ts';
import { loadModern } from './modern-loader.ts';
import type { ModernBoard } from './modern/board3d.ts';
import { DEFAULT_YAW } from './modern/camera.ts';
import { createMoveMap } from './modern/screen-move.ts';
import { drawList } from './board-plan.ts';
import { bubbles } from './item-bubble.ts';
import { createOpenings, portalAt } from './openings.ts';
import type { Atlas } from './board-plan.ts';
import { createGame, frameOf } from './game.ts';
import { initial } from './puzzle/state.ts';
import type { State } from './puzzle/state.ts';
import { parse } from './puzzle/level.ts';
import type { Level } from './puzzle/level.ts';
import { solve } from './puzzle/solver.ts';
import { startSearch, solverBusy, watchSolver } from './solver-client.ts';
import type { Report } from './solver-host.ts';
import { TRIALS, trialLevel } from './puzzle/trials.ts';
import { CAMPAIGN_LEVELS, CHAPTERS, LEVEL_IDS, chapterOf, levelById } from './campaign/chapters.ts';
import type { OutsideLevel } from './campaign/chapters.ts';
import { createOutside } from './outside.ts';
import type { Action } from './puzzle/step.ts';
import { createFoundPages } from './pages.ts';
import { createMet } from './met.ts';
import { createProgress } from './progress.ts';
import { createUi } from './ui.ts';
import { watchPlay } from './track.ts';
import { createEditor } from './editor/editor.ts';
import { fromLevel } from './editor/model.ts';
import { createRater } from './share/rating.ts';
import { createVisit, fragmentKind } from './share/visit.ts';
import { createSettings } from './settings.ts';
import type { Look, PadSide, WallMode } from './settings.ts';
import { fullscreenNote } from './notes.ts';
import { mountTitleInstall } from './install-slot.ts';
import { browserStorage, browserTimers } from '../../_kit/ports.browser.ts';
import { exitApp, toggleFullscreen as toggleKitFullscreen, browserAppEnv, holdEscape, topKeyLock } from '../../_kit/app.ts';
import { followPage } from '../../_kit/page-life.ts';
import { followFocus } from '../../_kit/audio-focus.ts';
import { createEndlessSaved, gradePref, partStore } from './endless/saved.ts';
import { GRADES } from './puzzle/rating.ts';
import type { Grade } from './puzzle/rating.ts';
import { createEndlessClient, workersFor, workersNow } from './endless/client.ts';
import type { WorkerLike as EndlessWorker } from './endless/client.ts';
import { createEndlessMode } from './endless/mode.ts';
import { createSharedBank } from './endless/shared.ts';
import { createVerifier, mayCheck } from './endless/verifier.ts';
import { tierOf } from './endless/tier.ts';
import { newSeed } from './endless/random.ts';
import { createDemo, memoryStorage } from './demo.ts';
import type { WakeLock } from './demo.ts';

declare global {
  interface Window {
    __creteTest?: Record<string, unknown>;
  }
}

// The music files' content hashes, injected by the build (build.json versions), so a new render is fetched.
declare const TITLE_WEBM_V: string;
declare const ENDLESS_WORKER_V: string; // the Endless worker bundle's content hash, injected by the build
declare const TITLE_M4A_V: string;

const atlas = atlasJson as Atlas;
const clock = { now: (): number => performance.now() };
const core = createAudioCore();
const audio = createAudio(core);
/* The title theme, as Opus in WebM or, for Safari, AAC. They stream on demand: the service
   worker neither precaches them nor keeps them, so offline play goes on without music. */
const OPUS = 'audio/webm; codecs="opus"';
const AAC = 'audio/mp4; codecs="mp4a.40.2"';
const TITLE_FILES: AudioSource[] = [{ url: `audio/music/title.webm?v=${TITLE_WEBM_V}`, type: OPUS }, { url: `audio/music/title.m4a?v=${TITLE_M4A_V}`, type: AAC }];
/** Whether this browser can stream either encoding at all. */
const canStream = typeof Audio === 'function' && pickSource(TITLE_FILES, t => new Audio().canPlayType(t)) !== null;
const music = createMusic({
  deck: () => {
    const el = new Audio();
    return mediaDeck(core, pickSource(TITLE_FILES, t => el.canPlayType(t))?.url ?? '', el);
  },
  timers: browserTimers,
});
/** Music plays when the browser can stream it and both switches are on. */
const followMusicSwitches = (): void => music.setEnabled(canStream && audio.musicHeard());
const settings = createSettings(browserStorage());
const appEnv = browserAppEnv();
const image = new Image();
const board = createSheetBoard(document.getElementById('stage') as HTMLCanvasElement, atlas, image);
/* Which board shows. The classic board's loop and the modern board's frames each run only while their board does. */
let modern: ModernBoard | null = null;
let modernOn = false;
let modernLoading = false;
/** The modern board cannot draw in this browser (no WebGL, or its context was lost). */
let modernFailed = false;
let modernFailure = '';
/** The toast has said so, once this visit. */
let modernWarned = false;
/** The game's level opening the modern board last built. */
let modernOpens = -1;
/** The classic board's view, for the modern board to take up once it has built the level it shows: only that
 *  opening's, so a level opened in between still opens north up. */
let pendingView: { yaw: number; pitch: number; opens: number } | null = null;
let modernRaf = 0;
let classicRaf = 0;
let tilesLoaded = false;
let editorUp = false;
/** Endless's background levels follow the page once it has started (src/main.ts's start). */
let endlessReady = false;
const progress = createProgress(browserStorage());
const pages = createFoundPages(browserStorage());
const met = createMet(browserStorage());
/* The campaign's levels, then the level from outside it (a try from the editor, or a browser spec's). */
const outside = createOutside(CAMPAIGN_LEVELS, {
  open: i => game.open(i),
  settle: () => game.settle(),
  closeLayers: () => ui.closeLayers(),
  showEditor: () => ui.showEditor(),
  bestWon: (text, moves) => editor.tryWon(text, moves),
  endlessWon: (moves, assisted) => endless.won(moves, assisted),
});
/* Demo (src/demo.ts): Endless at Medium with every piece, played by itself. Its runs are kept in memory and its
   workers are its own, so the player's saved runs and the parts their searches keep are never touched. */
const ALL_PIECES = CHAPTERS.filter(c => c.released).length;
const demoClient = createEndlessClient(() => new Worker(new URL(`endless-worker.js?v=${ENDLESS_WORKER_V}`, import.meta.url)) as unknown as EndlessWorker,
  () => (demo.active() && pageShown ? workersFor(navigator.hardwareConcurrency, endlessBattery) : 0));
const demo = createDemo({
  timers: browserTimers,
  get game() { return game; },
  mode: () => {
    const store = memoryStorage();
    return createEndlessMode({
      saved: grade => createEndlessSaved(store, grade),
      grade: () => 'medium',
      setGrade: () => {},
      client: demoClient,
      tier: () => ALL_PIECES,
      newSeed: () => newSeed(Math.random),
      play: (level, about, line) => {
        if (!demo.active()) return;
        outside.play(level, { ...about, demo: true }, line);
        demo.opened();
      },
      changed: () => demo.update(),
      budget: () => endlessBudget,
    });
  },
  tier: ALL_PIECES,
  newSeed: () => newSeed(Math.random),
  shown: () => pageShown,
  changed: () => ui.setDemo(demo.view()),
  cancel: () => demoClient.cancel(),
  wakeLock: () => {
    const lock = (navigator as Navigator & { wakeLock?: { request(type: 'screen'): Promise<WakeLock> } }).wakeLock;
    return lock ? lock.request('screen') : Promise.reject(new Error('no wake lock'));
  },
});
const levels = outside.levels;
/* The Map button's face: the level round Theseus in the other look, repainted only once a move has landed. */
const THUMB_COLS = 7, THUMB_ROWS = 5, THUMB_CELL = 24;
const THUMB_W = THUMB_COLS * THUMB_CELL, THUMB_H = THUMB_ROWS * THUMB_CELL;
const thumb = document.createElement('canvas');
thumb.className = 'map-thumb';
thumb.width = THUMB_W;
thumb.height = THUMB_H;
const ui = createUi({ atlas, icons: iconsJson as IconSheet, thumb, board, progress, pages, met, levels, sfx: audio.sfx, cards: stack => { behindEditor(stack.includes('editor')); followEndless(); } });
/* Endless: the saved run, the worker that makes its levels, and the mode that opens them. Its levels come from the
   worker's own bundle (dist/endless-worker.js), never the solver's worker, so the editor's Check never waits on it. */
/* Each grade keeps its own run and best; the card shows the grade chosen last. */
const endlessSaves = Object.fromEntries(GRADES.map(g => [g, createEndlessSaved(browserStorage(), g)])) as Record<Grade, ReturnType<typeof createEndlessSaved>>;
const endlessGrade = gradePref(browserStorage());
const endlessWorker = () => new Worker(new URL(`endless-worker.js?v=${ENDLESS_WORKER_V}`, import.meta.url)) as unknown as EndlessWorker;
const endlessClient = createEndlessClient(endlessWorker, () => endlessWorkers(), partStore(browserStorage(), ENDLESS_WORKER_V));
/* The shared bank: every level the search makes goes up to it, and a run started with New Run takes levels from it
   when they fit (src/endless/shared.ts). Its levels are checked by other devices in the background (the verifier).
   Do Not Track or Global Privacy Control turns the sending off (the uploads and the checks); shared levels still
   come in. */
const sendsNothing = (() => {
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  return nav.doNotTrack === '1' || (window as unknown as { doNotTrack?: string }).doNotTrack === '1' || nav.globalPrivacyControl === true;
})();
const sharedBank = createSharedBank({
  fetch: (url, init) => fetch(url, init),
  storage: browserStorage(),
  now: () => Date.now(),
  random: () => crypto.getRandomValues(new Uint32Array(1))[0]! / 2 ** 32,
  url: new URL('endless-bank.php', window.location.href).toString(),
  quiet: sendsNothing,
});
const verifier = createVerifier({
  spawn: endlessWorker,
  claim: v => sharedBank.claim(v),
  send: (ticket, found) => sharedBank.verdict(ticket, found),
  now: () => Date.now(),
  setTimeout: (f, ms) => window.setTimeout(f, ms),
  clearTimeout: id => window.clearTimeout(id as number),
});
const endless = createEndlessMode({
  saved: grade => endlessSaves[grade],
  grade: () => endlessGrade.get(),
  setGrade: grade => endlessGrade.set(grade),
  client: endlessClient,
  tier: () => tierOf(CHAPTERS, id => progress.get(id).cleared),
  newSeed: () => newSeed(Math.random),
  play: (level, about, line) => outside.play(level, about, line),
  changed: () => { ui.refresh(); followEndless(); },
  budget: () => endlessBudget,
  shared: { take: req => sharedBank.take(req) },
  made: (req, part, made) => { sharedBank.keep(req.grade, made); sharedBank.upload(req, part, made); },
});
/* Endless's levels are made in the background too, outside a run: with one worker, once the page has been quiet
   for ENDLESS_WARM_MS, while it shows and the solver's worker is idle, and not on a low battery that is draining.
   In a run (its level open, or Next Level waiting) its workers take their full share. */
const ENDLESS_WARM_MS = 5000;
let endlessWarm = false;
let pageShown = typeof document === 'undefined' || document.visibilityState !== 'hidden';
/** The player is in an Endless run: its level is on the game screen (with its cards), or Next Level waits. */
function inEndlessRun(): boolean {
  if (demo.active()) return false;
  if (endless.view().finding) return true;
  const top = ui.top();
  if (top === 'title' || top === 'endless' || top === 'editor' || top === 'shared' || top === 'levels') return false;
  return game.trial >= 0 && levels.outside?.(game.trial)?.kind === 'endless';
}
function endlessWorkers(): number {
  // Demo has workers of its own: the player's Endless waits for it to end.
  if (demo.active()) return 0;
  return workersNow({ run: inEndlessRun(), warm: endlessWarm, shown: pageShown, solving: solverBusy(), battery: endlessBattery },
    workersFor(navigator.hardwareConcurrency, endlessBattery));
}
/** The page's standing changed: the workers follow it, and outside a run the background levels go on. */
function followEndless(): void {
  if (!endlessReady) return;
  endlessClient.resize();
  const free = !inEndlessRun() && endlessWorkers() > 0;
  if (free) endless.ahead();
  // Checking others' levels takes turns with the page's own levels: only once Endless has nothing of its own to make,
  // and never while Demo plays.
  verifier.allow(!demo.active() && mayCheck({
    run: inEndlessRun(), warm: endlessWarm, shown: pageShown, solving: solverBusy(), battery: endlessBattery,
    endlessIdle: endless.idle(), on: settings.helpCheck.get() === 'on', sendsNothing, specBudget: endlessBudget !== undefined,
  }));
  if (!demo.active() && (endlessWarm || ui.top() === 'endless')) void sharedBank.refill(endlessGrade.get(), tierOf(CHAPTERS, id => progress.get(id).cleared));
}
watchSolver(() => followEndless());
/** The Endless search's budget a browser spec set through the test hook; the generator's own otherwise. */
let endlessBudget: number | undefined;
/** The battery, where the browser tells it: a low one that is not charging searches with one worker. */
let endlessBattery: { level: number; charging: boolean } | null = null;
type BatteryLike = { level: number; charging: boolean; addEventListener(type: string, f: () => void): void };
void (navigator as Navigator & { getBattery?: () => Promise<BatteryLike> }).getBattery?.().then(b => {
  const read = () => { endlessBattery = { level: b.level, charging: b.charging }; followEndless(); };
  read();
  b.addEventListener('levelchange', read);
  b.addEventListener('chargingchange', read);
}, () => {});
/** The link that opens the saved run's seed, with its pieces and its grade. */
function endlessLink(): string | null {
  const grade = endlessGrade.get();
  const run = endlessSaves[grade].run();
  return run ? `${window.location.origin}${window.location.pathname}?seed=${run.seed}&tier=${run.tier}&difficulty=${grade}` : null;
}
async function copyLink(link: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(link);
    ui.say('The seed link is copied.', 'info');
  } catch {
    ui.say(`Copy this link: ${link}`, 'info');
  }
}

/* The solver's one worker runs one search at a time: a shared level's rating takes turns with the editor's Check,
   which comes first. */
const rater = createRater(text => startSearch(text, 'measure'), () => ui.refresh(), text => startSearch(text, 'rate'));
/* The level editor, a layer over the game frame. Try it plays the draft on the game screen. */
const editor = createEditor({
  root: document.getElementById('editor-root') as HTMLElement,
  atlas,
  image,
  tryIt: (level, text, line) => tryLevel(level, text, line),
  start: rater.check,
  changed: () => {},
  leave: () => ui.leaveEditor(),
  // The editor opens in the game's look, and its Classic and Modern buttons set it, as the Map button does.
  look: {
    get: () => settings.look.get(),
    set: look => {
      settings.look.set(look);
      ui.setLook(look, settings.walls.get());
      showLook(look);
    },
  },
  modern: { load: loadModern, icons: iconsJson as IconSheet, walls: () => settings.walls.get() },
  say: message => ui.say(message, 'info'),
});
/* A share link in the address: its card, Play as a shared level, Edit a copy in the editor (the address then says
   #edit, as for any visit to the editor). */
const visit = createVisit({
  rater,
  play: (level, about, line) => outside.play(level, about, line),
  edit: draft => {
    game.settle();
    ui.showEditor(draft);
    history.replaceState(history.state, '', `${window.location.pathname}${window.location.search}${EDIT_HASH}`);
  },
  show: () => {
    game.settle();
    ui.showShared();
  },
  refuse: message => {
    game.settle();
    ui.refuseLink(message);
  },
});

/** Opens the editor's draft on the game screen as a try. `line` is the last Check's line when that check was of this
 *  exact text, for Ariadne's thread to follow. */
function tryLevel(level: Level, text: string, line: readonly Action[] | null): void {
  outside.tryLevel(level, text, line);
}

/* `#edit` in the address opens the editor, when the page opens and whenever the fragment changes to it (as Back to
   the editor does, so a try in play settles first); the fragment changing away from it (the browser's Back) leaves
   the editor for the title card. A try leaves the address as it is, as part of the editor's visit; the browser's
   Back during one changes nothing on the screen: the try plays on, with Back to the editor in its menu. A fragment
   `L<digits>…` is a share link: its card opens, or the title card says why it cannot. The link stays in the address
   while its level is played, so a reload opens its card again; the browser's Back from its card to no fragment
   shows the title card. Any other fragment is not the game's and changes nothing. */
const EDIT_HASH = '#edit';
function followHash(): void {
  const hash = window.location.hash;
  const kind = fragmentKind(hash);
  if (kind === 'link') {
    void visit.open(hash.slice(1));
    return;
  }
  if (kind === 'other') return;
  // The address moved on from any link: one still decoding shows no card.
  visit.forget();
  if (kind === 'edit') outside.backToEditor();
  else if (ui.top() === 'shared') ui.leaveShared();
  else ui.leaveEditor();
}
/* The editor's visit ending (the editor left for the title card, a campaign level opened, Quit) takes `#edit` off
   the address without a new history entry, so a reload does not open the editor. */
function leftEditor(): void {
  if (window.location.hash === EDIT_HASH) history.replaceState(history.state, '', window.location.pathname + window.location.search);
}

/* The reduced-motion preference, followed live. */
const motion = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null;
let reduced = motion?.matches ?? false;
motion?.addEventListener('change', e => { reduced = e.matches; });

/* The statistics' level starts and wins (src/track.ts). */
const seePlay = watchPlay();
const game = createGame({
  sfx: audio.sfx,
  say: ui.say,
  progress,
  pages,
  levels,
  timers: browserTimers,
  clock,
  reducedMotion: () => reduced,
  isFirst: id => ui.isFirst(id),
  changed: () => {
    ui.render(game);
    showModern();
    seePlay(game, levels.scratch?.(game.trial) ?? false);
    demo.update();
    wantThumb();
    // A turn, an undo, a restart or a new level ends Theseus's standing still.
    if (game.run !== cueRun) {
      cueRun = game.run;
      stillSince = performance.now();
    }
    wantCues();
  },
});
const frame = (): HTMLElement => document.getElementById('frame') ?? document.documentElement;

function toggleMute(): void {
  const muted = audio.toggleMute();
  ui.setMuted(muted);
  settings.sound.set(muted ? 'off' : 'on');
  followMusicSwitches();
  ui.say(muted ? 'Sound off.' : 'Sound on.', 'info');
}

/* The Music switch: the music bus alone. Sound off still silences it. */
function toggleMusic(): void {
  const on = settings.music.get() !== 'on';
  settings.music.set(on ? 'on' : 'off');
  audio.setMusic(on);
  ui.setMusic(on);
  followMusicSwitches();
  ui.say(on ? 'Music on.' : 'Music off.', 'info');
}

/* The Music in the background switch: whether a hidden page keeps the music going. */
function toggleBackground(): void {
  const on = settings.musicHidden.get() !== 'on';
  settings.musicHidden.set(on ? 'on' : 'off');
  music.setBackground(on);
  ui.setBackground(on);
  ui.say(on ? 'Music goes on in the background.' : 'Music stops in the background.', 'info');
}


/* The Look switch: stored, and the board it names shown. */
function applyLook(look: Look): void {
  settings.look.set(look);
  ui.setLook(look, settings.walls.get());
  ui.say(look === 'classic' ? 'Classic look.' : modernFailed ? modernFailure : 'Modern look.', 'info');
  showLook(look);
}

function applyPad(side: PadSide): void {
  settings.pad.set(side);
  ui.setPad(side);
  ui.say(side === 'right' ? 'Arrows on the right.' : 'Arrows on the left.', 'info');
}

function toggleMinimap(): void {
  const on = settings.minimap.get() !== 'on';
  settings.minimap.set(on ? 'on' : 'off');
  ui.setMinimap(on);
  modern?.minimap(on);
  ui.say(on ? 'Mini Map on.' : 'Mini Map off.', 'info');
}

function toggleHelpCheck(): void {
  const on = settings.helpCheck.get() !== 'on';
  settings.helpCheck.set(on ? 'on' : 'off');
  ui.setHelpCheck(on);
  ui.say(on ? 'Checking Endless levels on.' : 'Checking Endless levels off.', 'info');
  followEndless();
}

/* Show View Tips (the menu, the ? key): the modern board's tips by the compass again; the classic board has none. */
function showViewTips(): void {
  if (modernOn && modern) modern.showTips();
  else ui.say('View tips are for the modern board.', 'info');
}

function applyWalls(walls: WallMode): void {
  settings.walls.set(walls);
  ui.setLook(settings.look.get(), walls);
  modern?.walls(walls);
  ui.say(`Walls: ${walls}.`, 'info');
}

/* A gesture wakes the speakers and starts music the browser held back until one. */
function wake(): void {
  audio.ensure();
  music.kick();
}

function toggleFullscreen(): void {
  void toggleKitFullscreen(appEnv, frame()).then(outcome => {
    const note = fullscreenNote(outcome);
    if (note) ui.say(note, 'info');
  });
}

/* The one writer of the fullscreen setting, and the Esc lock: in full screen the browser takes Esc to leave it.
   No key of the game is Esc (Q is back), but a player may press it from habit; where Keyboard Lock exists,
   a tap then does nothing and only holding Esc leaves (_kit/app.ts holdEscape). */
function onFullscreenChange(): void {
  const on = !!appEnv.fullscreenElement();
  ui.setFullscreen(on);
  settings.fullscreen.set(on ? 'on' : 'off');
  void holdEscape(on, topKeyLock(window), msg => console.warn(msg));
}
document.addEventListener('fullscreenchange', onFullscreenChange);
document.addEventListener('webkitfullscreenchange', onFullscreenChange);

/* New Game on the title card opens Chapter 1's opening card: a new game starts at Chapter 1, Level 1 whatever this
   browser has cleared, and only Continue (`at`, the first level not cleared), a level picked from the list or a
   link starts elsewhere. A click is the gesture that lets a remembered full screen return. */
function play(at?: number): void {
  if (settings.fullscreen.get() === 'on' && !appEnv.fullscreenElement()) toggleFullscreen();
  if (at === undefined) ui.showChapter(1, false);
  else ui.showChapter(chapterOf(at).chapter.n, false, at);
}

/* Demo, from the title card (its button or key): the cards close, a remembered full screen returns, and Endless
   plays by itself. Any key or tap ends it for the title card (below). */
function startDemo(): void {
  if (demo.active()) return;
  if (settings.fullscreen.get() === 'on' && !appEnv.fullscreenElement()) toggleFullscreen();
  ui.closeLayers();
  game.settle();
  demo.start();
  followEndless();
}

function leaveDemo(): void {
  if (!demo.active()) return;
  demo.stop();
  game.settle();
  ui.showTitle(false);
  followEndless();
}

/* While Demo plays, a key or a tap ends it and does nothing more: the press never reaches the game, the board's
   camera or the title card that comes back, and a key held from then repeats nothing. Escape ends it too; it never
   leaves full screen (the browser's own Escape aside, where there is no Keyboard Lock). A browser chord, a function
   key, a modifier alone and Tab are the browser's and pass. The wheel does nothing while Demo plays. */
const PASS_KEYS = /^(F\d{1,2}|Shift|Control|Alt|AltGraph|Meta|OS|Fn|CapsLock|NumLock|ScrollLock|Tab|ContextMenu|Audio\w*|Media\w*)$/;
/** The key that ended Demo, held: its repeats are swallowed until it is let go. */
let demoKey: string | null = null;
/** The pointers of the gesture that ended Demo: every press in it, its releases and its clicks are swallowed, and
 *  clicks a moment after its last release too. */
const demoPointers = new Set<number>();
let demoClicksUntil = 0;
const swallow = (ev: Event): void => { ev.preventDefault(); ev.stopImmediatePropagation(); };
window.addEventListener('keydown', ev => {
  if (demoKey !== null && ev.code === demoKey && ev.repeat) { swallow(ev); return; }
  // A repeat is a key held from before Demo began (the key that started it): it ends nothing.
  if (demo.active() && ev.repeat) { swallow(ev); return; }
  if (!demo.active() || ev.ctrlKey || ev.metaKey || ev.altKey || PASS_KEYS.test(ev.key)) return;
  swallow(ev);
  demoKey = ev.code;
  leaveDemo();
}, { capture: true });
window.addEventListener('keyup', ev => { if (ev.code === demoKey) demoKey = null; }, { capture: true });
window.addEventListener('pointerdown', ev => {
  if (!demo.active() && demoPointers.size === 0) return;
  swallow(ev);
  demoPointers.add(ev.pointerId);
  leaveDemo();
}, { capture: true });
for (const type of ['pointerup', 'pointercancel']) {
  window.addEventListener(type, ev => {
    const e = ev as PointerEvent;
    if (!demoPointers.delete(e.pointerId)) return;
    swallow(e);
    if (demoPointers.size === 0) demoClicksUntil = performance.now() + 500;
  }, { capture: true });
}
for (const type of ['click', 'contextmenu', 'dblclick']) {
  window.addEventListener(type, ev => { if (demo.active() || demoPointers.size > 0 || performance.now() < demoClicksUntil) swallow(ev); }, { capture: true });
}
window.addEventListener('wheel', ev => { if (demo.active()) swallow(ev); }, { capture: true, passive: false });

/* Quit (the menu's): the cards close and the editor's visit ends; an installed app closes where it may, and
   otherwise (always in a browser tab) the title card shows. */
async function quit(): Promise<void> {
  ui.closeLayers();
  game.stop();
  leftEditor();
  const outcome = await exitApp(appEnv);
  if (outcome !== 'closed') ui.showTitle(outcome === 'title-with-hint');
}

/* The Map button's face (src/ui/strip.tsx), in the look the button swaps to. In Modern it is a crop of THUMB_COLS ×
   THUMB_ROWS squares round Theseus (and the Minotaur too when he is near enough), drawn north up with board.ts,
   repainted only after a move lands (never per frame). In Classic it is the Modern look's picture from the new-game
   card, so Classic never loads the 3D board for it. */
const modernLook = new Image();
modernLook.src = 'fx/looks/modern.jpg';

/** Paints the Modern look's picture over `out`, cropped to fill it; false until it has loaded. */
function paintModernLook(out: HTMLCanvasElement): boolean {
  if (!modernLook.complete || !modernLook.naturalWidth) return false;
  const g = out.getContext('2d')!;
  const iw = modernLook.naturalWidth, ih = modernLook.naturalHeight;
  const k = Math.max(out.width / iw, out.height / ih);
  const sw = out.width / k, sh = out.height / k;
  g.drawImage(modernLook, (iw - sw) / 2, (ih - sh) / 2, sw, sh, 0, 0, out.width, out.height);
  return true;
}
const thumbSheet = document.createElement('canvas');
const thumbBoard = createBoard(thumbSheet, atlas, image);
let thumbKey = '';
/** The board state the face last showed. */
let thumbState: unknown = null;
let thumbTimer: ReturnType<typeof setTimeout> | 0 = 0;

/** Paints the face once the turn in hand has landed. */
function wantThumb(): void {
  if (thumbTimer) return;
  thumbTimer = setTimeout(() => {
    thumbTimer = 0;
    // Not while a turn animates or the thread plays out: the face waits for the board to rest.
    if ((game.anim && !game.anim.paused) || game.playing) {
      wantThumb();
      return;
    }
    paintThumb();
  }, 120);
}

/** The first square of a run of `n` of `size` that keeps `at` near its middle. */
const cropStart = (at: number, n: number, size: number): number => Math.max(0, Math.min(size - n, Math.round(at - (n - 1) / 2)));
/** The crop's middle along one axis: Theseus, or halfway to the Minotaur when both fit in `n` squares. */
const cropMid = (hero: number, foe: number | null, n: number): number => (foe !== null && Math.abs(foe - hero) < n ? (hero + foe) / 2 : hero);

/** How long the face's last repaint took, in ms, for tests. */
let thumbMs = 0;
function paintThumb(): void {
  const t0 = performance.now();
  const run = game.run;
  if (!run) return;
  const s = run.now;
  const classicFace = settings.look.get() === 'modern' && !modernFailed;
  // The look and the board state itself: a turn that changes the board without moving Theseus repaints too.
  const key = `${classicFace} ${game.opens}`;
  if (key === thumbKey && s === thumbState) return;
  const nc = s.level.cols, nr = s.level.rows;
  const mc = cropMid(s.player.c, s.minotaur?.c ?? null, THUMB_COLS), mr = cropMid(s.player.r, s.minotaur?.r ?? null, THUMB_ROWS);
  const c0 = cropStart(mc, THUMB_COLS, nc), r0 = cropStart(mr, THUMB_ROWS, nr);
  if (classicFace) {
    if (!paintClassic(thumb, s, c0, r0, THUMB_COLS, THUMB_ROWS, THUMB_CELL)) return;
  } else if (modernFailed) {
    // Without a modern board the face stays dark under its badge.
    const g = thumb.getContext('2d')!;
    g.fillStyle = '#0d0b0a';
    g.fillRect(0, 0, THUMB_W, THUMB_H);
  } else if (!paintModernLook(thumb)) {
    modernLook.addEventListener('load', wantThumb, { once: true });
    return;
  }
  // The badge takes the corner farthest from Theseus and the Minotaur (game.css), so it hides neither.
  const figs = [s.player, ...(s.minotaur ? [s.minotaur] : [])].map(p => [p.c - c0 + 0.5, p.r - r0 + 0.5] as const);
  const corners = [['top-left', 0, 0], ['top-right', THUMB_COLS, 0], ['bottom-left', 0, THUMB_ROWS], ['bottom-right', THUMB_COLS, THUMB_ROWS]] as const;
  const clear = (x: number, y: number) => Math.min(...figs.map(([fx, fy]) => Math.hypot(fx - x, fy - y)));
  // Where keys show (a fine pointer), the key tab holds the top-right corner.
  const tabbed = typeof matchMedia === 'function' && matchMedia('(pointer: fine)').matches;
  const open = corners.filter(k => !(tabbed && k[0] === 'top-right'));
  thumb.dataset.corner = [...open].sort((a, b) => clear(b[1], b[2]) - clear(a[1], a[2]))[0]![0];
  thumbKey = key;
  thumbState = s;
  thumbMs = performance.now() - t0;
}

/** Paints the classic look's `cols` × `rows` squares of `s` from square (r0, c0) onto `out`, `cell` pixels each, on
 *  dark; a level narrower or shorter than the crop sits in its middle. False until the tiles have loaded. */
function paintClassic(out: HTMLCanvasElement, s: State, c0: number, r0: number, cols: number, rows: number, cell: number): boolean {
  if (!tilesLoaded) return false;
  const g = out.getContext('2d')!;
  g.fillStyle = '#0d0b0a';
  g.fillRect(0, 0, out.width, out.height);
  const nc = s.level.cols, nr = s.level.rows;
  const figures = { player: s.player, minotaur: s.minotaur, hazards: s.hazards.map(h => ({ kind: h.kind, at: h.at })) };
  const dpr = window.devicePixelRatio || 1;
  thumbBoard.size(nc, nr, cell / dpr);
  thumbBoard.paint(drawList(s, figures, atlas, 0));
  const sheetCell = thumbSheet.width / nc, top = thumbSheet.height - nr * sheetCell;
  const ox = Math.max(0, (cols - nc) / 2) * cell, oy = Math.max(0, (rows - nr) / 2) * cell;
  const w = Math.min(cols, nc), h = Math.min(rows, nr);
  g.drawImage(thumbSheet, c0 * sheetCell, top + r0 * sheetCell, w * sheetCell, h * sheetCell, ox, oy, w * cell, h * cell);
  return true;
}

/** The open level in `look` as a PNG data URL, `cols` × `rows` squares of `cell` pixels round Theseus (and the
 *  Minotaur when near), framed as the Map button frames it: the new-game card's pictures (tests/e2e/screenshots.ts)
 *  take both looks this way, so they show the same squares. Null when that look cannot draw now. */
function lookPicture(look: Look, cols: number, rows: number, cell: number): string | null {
  const s = game.run?.now;
  if (!s) return null;
  const out = document.createElement('canvas');
  out.width = cols * cell;
  out.height = rows * cell;
  const mc = cropMid(s.player.c, s.minotaur?.c ?? null, cols), mr = cropMid(s.player.r, s.minotaur?.r ?? null, rows);
  const c0 = cropStart(mc, cols, s.level.cols), r0 = cropStart(mr, rows, s.level.rows);
  if (look === 'classic') return paintClassic(out, s, c0, r0, cols, rows, cell) ? out.toDataURL('image/png') : null;
  if (!modern || !modernOn) return null;
  return modern.snapshot(out, r0 + (rows - 1) / 2, c0 + (cols - 1) / 2, cols, rows) ? out.toDataURL('image/png') : null;
}

/* The classic board repaints every frame while it shows: the sprites animate, a turn's figures move between
   cells (holding still while a story page the figure reached is read), and the gate and the doors slide and sink. */
const classicOpenings = createOpenings();
/** How lit the exit's portal was at the classic board's last paint, 0 dormant to 1 lit, for the browser specs. */
let classicPortal = 0;
function loop(now: number): void {
  classicRaf = 0;
  if (modernOn) return;
  const f = frameOf(game, game.animMs());
  if (f) {
    const t0 = performance.now();
    const moving = classicOpenings.at(f.state, f.figures, now, reduced, f.done);
    classicPortal = portalAt(f.state, moving);
    board.bubbles(bubbles(f.state, f.figures));
    board.cues(cuesNow(performance.now()));
    board.paint(drawList(f.state, f.figures, atlas, now, moving), game.thread ?? undefined, reduced ? undefined : now / 1000);
    paintMs.push(performance.now() - t0);
    if (paintMs.length > PAINT_KEEP) paintMs.shift();
    if (game.anim && f.done) game.finishAnim();
  }
  classicRaf = requestAnimationFrame(loop);
}

/* The classic board's last paints' cost in ms, for the browser specs' frame measures. */
const PAINT_KEEP = 600;
const paintMs: number[] = [];

/* The classic loop runs once the tiles have loaded, while the modern board does not show. */
function runClassic(): void {
  if (tilesLoaded && !modernOn && !classicRaf) classicRaf = requestAnimationFrame(loop);
}

/* The modern board draws only when told: a change to the game shows the frame now, and while a turn animates a
   frame follows each display frame until it ends, when the turn is finished. An animation paused at a story page
   shows its held frame and waits: the page closing resumes it, and that change starts the frames again. */
function modernFrame(): void {
  modernRaf = 0;
  if (!modern || !modernOn) return;
  const f = frameOf(game, game.animMs());
  if (!f) return;
  if (game.opens !== modernOpens) {
    modernOpens = game.opens;
    modern.level(f.state);
    modernCues = '';
    wantCues();
    // A rebuilt board opens at its own view; the classic board's, when the player came from it, goes on.
    if (pendingView?.opens === game.opens) modern.setView(pendingView.yaw, pendingView.pitch);
    pendingView = null;
  }
  modern.show(f, game.thread);
  // The cues follow the frame: the glass beside Theseus comes and goes as his figure arrives, and a wall he bumps
  // shimmers as the turn plays.
  if (game.anim) wantCues();
  if (game.anim && f.done) game.finishAnim();
  else if (game.anim && !game.anim.paused && !modernRaf) modernRaf = requestAnimationFrame(modernFrame);
}

/* The hidden walls' cues (src/wall-cues.ts), the same in both looks: a found invisible wall shimmers into view and
   stays marked while the state shows it, an unshown one beside Theseus gives a sliver of glass on its face toward
   him, and a fake wall beside him hazes once he has stood still a while. The classic loop asks for them every frame;
   the modern board is told when they change, and while they move. */
const foundClock = createFoundClock();
const glassClock = createGlassClock();
/** When Theseus last stood still from: the try's last change. */
let stillSince = performance.now();
let cueRun: unknown = null;
let cueRaf = 0;
let cueTimer: ReturnType<typeof setTimeout> | 0 = 0;
/** What the modern board was last told, as a key. */
let modernCues = '';

function cuesNow(now: number): CueDraw {
  const run = game.run;
  if (!run) return NO_CUES;
  const s = frameOf(game, game.animMs())?.state ?? run.now;
  const cols = s.level.cols;
  const found = foundClock.update(s, game.opens, now, reduced).map(({ i, shimmer }) => ({ at: { r: Math.floor(i / cols), c: i % cols }, shimmer }));
  // The glass follows the state the board shows, so it comes as his figure arrives beside it and goes as he leaves.
  const glass = glassClock.update(s, now, reduced, s.outcome === 'playing' && !editorUp);
  const busy = !!game.anim || game.playing || ui.layersOpen() || editorUp;
  const idle = now - stillSince;
  return { found, glass, haze: hazeCue(s, idle, reduced, busy), t: idle / 1000, still: reduced };
}

function tickCues(): void {
  cueRaf = 0;
  if (cueTimer) clearTimeout(cueTimer);
  cueTimer = 0;
  if (!modernOn || !modern) return;
  const now = performance.now();
  const c = cuesNow(now);
  const k = cueKey(c);
  if (k !== modernCues) {
    modernCues = k;
    modern.cues(c);
  }
  if (cuesMoving(c)) cueRaf = requestAnimationFrame(tickCues);
  else if (!c.haze && game.run && fakeFaces(game.run.now).length) {
    // A fake wall is beside him: look again once he may have stood still long enough (or a card has closed).
    cueTimer = setTimeout(wantCues, Math.max(250, IDLE_MS - (now - stillSince)));
  }
}

function wantCues(): void {
  if (modernOn && !cueRaf) cueRaf = requestAnimationFrame(tickCues);
}

function showModern(): void {
  if (modernOn && !modernRaf) modernRaf = requestAnimationFrame(modernFrame);
}

/* Shows the modern board or the classic one. The modern board is loaded the first time it is asked for, and the
   classic one shows while it loads, and for good when this browser cannot draw it. */
function showLook(look: Look): void {
  if (look === 'modern' && !modernFailed) {
    if (modern) setModernOn(true);
    else void createModern();
  } else setModernOn(false);
}

function setModernOn(on: boolean): void {
  if (on === modernOn) return;
  modernOn = on;
  thumbKey = '';
  wantThumb();
  const holder = document.getElementById('board');
  holder?.classList.toggle('look-modern', on);
  // The movement pad sits outside the board; its middle shows Theseus in the look that shows.
  document.getElementById('frame')?.classList.toggle('look-modern', on);
  // One view for both looks: the heading and tilt go across with the switch.
  if (on) pendingView = { ...ui.classicView(), opens: game.opens };
  else if (modern) ui.setClassicView(modern.yaw(), modern.pitch());
  ui.setModernBoard(on);
  if (on) {
    // What happened while it was hidden shows as it is now: the board rebuilds, so nothing splashes late.
    modernOpens = -1;
    if (classicRaf) cancelAnimationFrame(classicRaf);
    classicRaf = 0;
    modern?.resize();
    modern?.setActive(!editorUp);
    showModern();
    modernCues = '';
    wantCues();
  } else {
    if (modernRaf) cancelAnimationFrame(modernRaf);
    modernRaf = 0;
    modern?.setActive(false);
    runClassic();
  }
}

/* The editor has its own board: the modern one draws nothing while the editor covers it. */
function behindEditor(up: boolean): void {
  if (up === editorUp) return;
  editorUp = up;
  if (!up) modernOpens = -1;
  if (modernOn) {
    modern?.setActive(!up);
    if (!up) showModern();
  }
}

async function createModern(): Promise<void> {
  if (modernLoading) return;
  modernLoading = true;
  const lib = await loadModern();
  const canvas = document.getElementById('stage3d') as HTMLCanvasElement;
  try {
    modern = lib
      ? lib.createModernBoard({
        canvas,
        overlay: document.querySelector('#modern .modern-overlay') as HTMLElement,
        atlas,
        image,
        icons: iconsJson as IconSheet,
        blocked: () => ui.cardsOpen(),
        // Demo covers the board as a card does: the view tips keep away.
        covered: () => ui.layersOpen() || demo.active(),
        gesture: () => ui.closeStart(),
        reducedMotion: () => reduced,
      })
      : null;
  } catch (e) {
    console.error('Crete: the modern board could not start', e);
    modern = null;
  }
  modernLoading = false;
  if (!modern) {
    noModern(NO_WEBGL);
    return;
  }
  modern.walls(settings.walls.get());
  modern.minimap(settings.minimap.get() === 'on');
  modern.setActive(false);
  canvas.addEventListener('webglcontextlost', e => {
    // Kept so the browser may give it back; until it does, the classic board shows.
    e.preventDefault();
    noModern(LOST_WEBGL);
  });
  canvas.addEventListener('webglcontextrestored', () => {
    modernFailed = false;
    modernOpens = -1;
    showLook(settings.look.get());
  });
  if (typeof ResizeObserver === 'function') new ResizeObserver(() => { if (modernOn) modern?.resize(); }).observe(canvas);
  showLook(settings.look.get());
  thumbKey = '';
  wantThumb();
}

const NO_WEBGL = 'The modern look needs WebGL, which this browser does not have; showing Classic.';
const LOST_WEBGL = 'The modern look stopped working in this browser; showing Classic.';

/* The modern board cannot draw here: the classic one shows, the stored choice stays, and the toast says why once. */
function noModern(why: string): void {
  modernFailed = true;
  modernFailure = why;
  setModernOn(false);
  if (!modernWarned && settings.look.get() === 'modern') {
    modernWarned = true;
    ui.say(why, 'info');
  }
}

function start(): void {
  ui.bindControls({
    game, toggleMute, toggleMusic, toggleBackground, setLook: applyLook, setWalls: applyWalls, setPad: applyPad, toggleMinimap, toggleHelpCheck, showViewTips, toggleFullscreen, wake, quit: () => { void quit(); }, play, editor, leftEditor,
    backToEditor: outside.backToEditor, shared: visit,
    endless: { mode: endless, link: endlessLink, copy: link => { void copyLink(link); } },
    demo: { start: startDemo },
  });
  const background = settings.musicHidden.get() === 'on';
  music.setBackground(background);
  ui.setBackground(background);
  if (settings.sound.get() === 'off') {
    audio.toggleMute();
    ui.setMuted(true);
  }
  if (settings.music.get() === 'off') {
    audio.setMusic(false);
    ui.setMusic(false);
  }
  ui.setLook(settings.look.get(), settings.walls.get());
  ui.setPad(settings.pad.get());
  ui.setMinimap(settings.minimap.get() === 'on');
  ui.setHelpCheck(settings.helpCheck.get() === 'on');
  const moveMap = createMoveMap();
  ui.setMoveDir(dir => moveMap(dir, modernOn && modern ? modern.yaw() : ui.classicView().yaw));
  showLook(settings.look.get());
  followMusicSwitches();
  // A `?seed=` link (with `&tier=`, the pieces, and `&difficulty=`, the grade, Medium when it names none; or the old
  // chase's, with any value) opens the Endless card on that seed.
  let linked: { seed: string; tier: number | null; grade: string | null } | null = null;
  try {
    const q = new URL(window.location.href).searchParams;
    const seed = q.get('seed');
    if (seed !== null) linked = { seed: seed || 'crete', tier: q.has('tier') ? Number(q.get('tier')) : null, grade: q.get('difficulty') };
  } catch (_) {
    /* ignore */
  }
  ui.showTitle(false);
  if (linked) {
    endless.link(linked.seed, linked.tier, linked.grade);
    ui.showEndless();
  }
  followHash();
  window.addEventListener('hashchange', followHash);
  endlessReady = true;
  followEndless();
  mountTitleInstall(window, document.getElementById('title-install'));
  image.onload = () => {
    tilesLoaded = true;
    wantThumb();
    runClassic();
  };
  image.onerror = () => {
    const msg = 'The board pictures did not load. Check your connection and reload the page.';
    console.error(`Crete: ${image.src} failed to load`);
    const note = document.createElement('div');
    note.id = 'atlas-error';
    note.className = 'toast show bad';
    note.setAttribute('role', 'alert');
    note.textContent = msg;
    frame().appendChild(note);
  };
  image.src = 'fx/sprites/tiles.png';
}
// Demo's searches and play hold while the tab is hidden, and go on once it shows.
// A hidden tab runs no play-out and, unless Music in the background is on, holds the music; showing it again leaves the play-out stopped and the music going on.
followPage({ doc: document, win: window }, {
  hide: () => {
    game.stop();
    music.hold();
    pageShown = false;
    followEndless();
    demoClient.resize();
    demo.update();
  },
  show: () => {
    music.release();
    pageShown = true;
    followEndless();
    demoClient.resize();
    demo.update();
  },
});
// In a frame on another page (a blog's embed, the site's play page), clicking out of the frame fades the sound out
// and clicking back in brings back what was playing, whatever Music in the background says.
followFocus({ doc: document, win: window, timers: browserTimers }, {
  away: () => { core.setAway(true); music.away(true); },
  back: () => { core.setAway(false); music.away(false); },
});
// Endless's background levels start once the page has loaded and been quiet a few seconds.
function warmEndless(): void {
  window.setTimeout(() => {
    const go = () => { endlessWarm = true; followEndless(); };
    if (typeof requestIdleCallback === 'function') requestIdleCallback(go, { timeout: ENDLESS_WARM_MS });
    else go();
  }, ENDLESS_WARM_MS);
}
if (document.readyState === 'complete') warmEndless();
else window.addEventListener('load', warmEndless, { once: true });
// The page going away cancels a shared level's rating; a page brought back from the browser's cache rates it again.
window.addEventListener('pagehide', () => visit.leave());
window.addEventListener('pageshow', e => { if (e.persisted) visit.back(); });
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
else start();

/** A solve in the solver's worker: its answer and every progress report on the way. */
function solveInWorker(levelText: string): Promise<{ result: unknown; progress: Report[] }> {
  const job = startSearch(levelText, 'solve');
  const progress: Report[] = [];
  job.progress(p => progress.push(p));
  return job.result.then(result => ({ result, progress }));
}

/** Opens `level` from outside the campaign: a try (named by its title, or "Your level") unless `opts.outside` says
 *  otherwise, with `opts.line` as its proven line when there is one. */
function playLevel(level: Level, opts: { outside?: OutsideLevel; line?: readonly Action[] } = {}): void {
  outside.play(level, opts.outside ?? { kind: 'try', name: level.title || 'Your level', best: null }, opts.line ?? null);
}

/* Test hook for automated checks: drives the real game logic, no copy. Its editor is the Editor, plus `load(text)`,
   which opens the editor on that level text. */
const editorHook = {
  open: editor.open, close: editor.close, key: editor.key, bestFor: editor.bestFor,
  get draft() { return editor.draft; },
  get modern() { return editor.modern; },
  get classic() { return editor.classic; },
  load(text: string): void {
    ui.showEditor(fromLevel(parse(text)));
  },
};
/* The classic board, as far as the browser specs read it, in CSS px in the page: its view, where a square's centre
   shows, the square (fractional) under a point, the board's box with the figures' headroom, and its paints' cost. */
function classicSheet(): { f: Frame; cell: number; left: number; top: number } | null {
  const f = ui.classicFrame();
  const view = document.getElementById('stage-view');
  if (!f || !view) return null;
  const b = view.getBoundingClientRect();
  return { f, cell: Number(document.getElementById('stage')?.dataset.cell), left: b.left, top: b.top };
}
const classicHook = {
  view: () => ui.classicView(),
  at(c: number, r: number): { x: number; y: number } | null {
    const s = classicSheet();
    if (!s) return null;
    const p = project(s.f, (c + 0.5) * s.cell, (r + 0.5) * s.cell);
    return { x: s.left + p.x, y: s.top + p.y };
  },
  under(x: number, y: number): { c: number; r: number } | null {
    const s = classicSheet();
    const g = s && unproject(s.f, x - s.left, y - s.top);
    return s && g ? { c: g.x / s.cell, r: g.y / s.cell } : null;
  },
  box(): { left: number; top: number; right: number; bottom: number } | null {
    const s = classicSheet();
    const level = game.run?.now.level;
    if (!s || !level) return null;
    const e = extent(s.f, level.cols, level.rows, s.cell, atlas.rise / atlas.cell);
    return { left: s.left + e.left, top: s.top + e.top, right: s.left + e.right, bottom: s.top + e.bottom };
  },
  paintMs: () => paintMs.slice(),
  portal: () => classicPortal,
  bubbles: () => board.shownBubbles(),
};
/* The hidden walls' cues as the look showing last drew them (src/wall-cues.ts). */
const cuesHook = (): CuesShown | null => (modernOn ? modern?.shownCues() ?? null : board.shownCues());
/* The modern board, as far as the browser specs read it. */
const modernHook = {
  frames: () => modern?.frames() ?? 0,
  opening: () => modern?.opening() ?? { bars: [], portal: 0, doors: [], hoof: 0 },
  yaw: () => modern?.yaw() ?? DEFAULT_YAW,
  zoom: () => modern?.zoom() ?? 0,
  pitch: () => modern?.pitch() ?? 0,
  setView: (yaw: number, pitch: number) => modern?.setView(yaw, pitch),
  following: () => modern?.following() ?? true,
  floating: () => modern?.floating() ?? [],
  routeNext: () => modern?.routeNext() ?? null,
  splashing: () => modern?.splashing() ?? [],
  /** Where cell (c, r)'s centre shows on the page, in CSS px, as the classic hook's `at`; null before the board loads. */
  at(c: number, r: number): { x: number; y: number } | null {
    const canvas = document.getElementById('stage3d');
    if (!modern || !canvas) return null;
    const b = canvas.getBoundingClientRect();
    const [x, y] = modern.cellAt(c, r);
    return { x: b.left + x, y: b.top + y };
  },
  markers: () => modern?.markers() ?? [],
  bubbles: () => modern?.bubbles() ?? [],
  quality: () => modern?.quality() ?? 3,
  fps: () => modern?.fps() ?? null,
  thumbMs: () => thumbMs,
  picture: lookPicture,
  /** Theseus's modern face as a PNG data URL, `size` pixels square; null before the modern board loads. */
  portrait(size: number): string | null {
    if (!modern) return null;
    const out = document.createElement('canvas');
    out.width = out.height = size;
    modern.portrait(out);
    return out.toDataURL('image/png');
  },
  get active() { return modernOn && !editorUp; },
};
/* Demo, for the browser specs: started and ended as its button and a key do, its words, and a faster pace. */
const demoHook = { start: startDemo, stop: leaveDemo, active: () => demo.active(), view: () => demo.view(), setPace: demo.setPace };
window.__creteTest = { demo: demoHook, endless: { mode: endless, get saved() { return endlessSaves[endlessGrade.get()]; }, saves: endlessSaves, setBudget: (n: number) => { endlessBudget = n; }, workers: endlessWorkers, warm: () => { endlessWarm = true; followEndless(); }, shared: sharedBank }, game, TRIALS, solve, initial, trialLevel, levelById, LEVEL_IDS, CHAPTERS, solveInWorker, playLevel, parse, editor: editorHook, modern: modernHook, classic: classicHook, cues: cuesHook };
