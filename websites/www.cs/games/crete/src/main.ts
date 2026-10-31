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
import { loadModern } from './modern-loader.ts';
import type { ModernBoard } from './modern/board3d.ts';
import { DEFAULT_YAW } from './modern/camera.ts';
import { screenToGrid } from './modern/screen-move.ts';
import { drawList } from './board-plan.ts';
import type { Atlas } from './board-plan.ts';
import { createGame, frameOf } from './game.ts';
import { initial } from './puzzle/state.ts';
import type { State } from './puzzle/state.ts';
import { parse } from './puzzle/level.ts';
import type { Level } from './puzzle/level.ts';
import { solve } from './puzzle/solver.ts';
import { startSearch } from './solver-client.ts';
import type { Report } from './solver-host.ts';
import { TRIALS, trialLevel } from './puzzle/trials.ts';
import { CAMPAIGN_LEVELS, CHAPTERS, LEVEL_IDS, chapterOf } from './campaign/chapters.ts';
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

declare global {
  interface Window {
    __creteTest?: Record<string, unknown>;
  }
}

// The music files' content hashes, injected by the build (build.json versions), so a new render is fetched.
declare const TITLE_WEBM_V: string;
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
const board = createBoard(document.getElementById('stage') as HTMLCanvasElement, atlas, image);
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
let modernRaf = 0;
let classicRaf = 0;
let tilesLoaded = false;
let editorUp = false;
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
});
const levels = outside.levels;
/* The Map button's face: the level round Theseus in the other look, repainted only once a move has landed. */
const THUMB_COLS = 7, THUMB_ROWS = 5, THUMB_CELL = 24;
const THUMB_W = THUMB_COLS * THUMB_CELL, THUMB_H = THUMB_ROWS * THUMB_CELL;
const thumb = document.createElement('canvas');
thumb.className = 'map-thumb';
thumb.width = THUMB_W;
thumb.height = THUMB_H;
const ui = createUi({ atlas, icons: iconsJson as IconSheet, thumb, board, progress, pages, met, levels, sfx: audio.sfx, cards: stack => behindEditor(stack.includes('editor')) });
/* The solver's one worker runs one search at a time: a shared level's rating takes turns with the editor's Check,
   which comes first. */
const rater = createRater(text => startSearch(text, 'measure'), () => ui.refresh());
/* The level editor, a layer over the game frame. Try it plays the draft on the game screen. */
const editor = createEditor({
  root: document.getElementById('editor-root') as HTMLElement,
  atlas,
  image,
  tryIt: (level, text, line) => tryLevel(level, text, line),
  start: rater.check,
  changed: () => {},
  leave: () => ui.leaveEditor(),
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
    lastChange = performance.now();
    ui.render(game);
    showModern();
    seePlay(game, levels.scratch?.(game.trial) ?? false);
    wantThumb();
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

/* Quit (the menu's): the cards close and the editor's visit ends; an installed app closes where it may, and
   otherwise (always in a browser tab) the title card shows. */
async function quit(): Promise<void> {
  ui.closeLayers();
  game.stop();
  leftEditor();
  const outcome = await exitApp(appEnv);
  if (outcome !== 'closed') ui.showTitle(outcome === 'title-with-hint');
}

/* The Map button's face (src/ui/strip.tsx): a crop of THUMB_COLS × THUMB_ROWS squares round Theseus (and the
   Minotaur too when he is near enough), in the look the button swaps to. The classic face is drawn with board.ts; the
   modern face is a snapshot from the modern board, taken only after a move lands (never per frame), which loads the
   modern board in Classic too. */
const thumbSheet = document.createElement('canvas');
const thumbBoard = createBoard(thumbSheet, atlas, image);
let thumbKey = '';
/** The board state the face last showed. */
let thumbState: unknown = null;
/** When the game last changed; the modern board loads for the face only after REST_MS without a change. */
let lastChange = 0;
const REST_MS = 2500;
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
  const g = thumb.getContext('2d')!;
  const figures = { player: s.player, minotaur: s.minotaur, hazards: s.hazards.map(h => ({ kind: h.kind, at: h.at })) };
  const nc = s.level.cols, nr = s.level.rows;
  const mc = cropMid(s.player.c, s.minotaur?.c ?? null, THUMB_COLS), mr = cropMid(s.player.r, s.minotaur?.r ?? null, THUMB_ROWS);
  const c0 = cropStart(mc, THUMB_COLS, nc), r0 = cropStart(mr, THUMB_ROWS, nr);
  if (classicFace) {
    if (!paintClassic(thumb, s, c0, r0, THUMB_COLS, THUMB_ROWS, THUMB_CELL)) return;
  } else {
    // Without a modern board the face stays dark under its badge.
    if (modernFailed) {
      thumbKey = key;
      thumbState = s;
      return;
    }
    if (!modern) {
      // The modern board loads for the face only once play has rested a while, so loading it never slows play.
      if (performance.now() - lastChange < REST_MS || game.playing) {
        setTimeout(wantThumb, REST_MS);
        return;
      }
      void createModern();
      return;
    }
    if (game.opens !== thumbOpens) {
      thumbOpens = game.opens;
      if (!modernOn) modern.level(s);
    }
    if (!modernOn) modern.show({ state: s, figures }, game.thread);
    g.fillStyle = '#0d0b0a';
    g.fillRect(0, 0, THUMB_W, THUMB_H);
    if (!modern.snapshot(thumb, r0 + (THUMB_ROWS - 1) / 2, c0 + (THUMB_COLS - 1) / 2, THUMB_COLS, THUMB_ROWS)) return;
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
let thumbOpens = -1;

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

/* The classic board repaints every frame while it shows: the sprites animate, and a turn's figures move between
   cells (holding still while a story page the figure reached is read). */
function loop(now: number): void {
  classicRaf = 0;
  if (modernOn) return;
  const f = frameOf(game, game.animMs());
  if (f) {
    board.paint(drawList(f.state, f.figures, atlas, now), game.thread ?? undefined);
    if (game.anim && f.done) game.finishAnim();
  }
  classicRaf = requestAnimationFrame(loop);
}

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
  }
  modern.show(f, game.thread);
  if (game.anim && f.done) game.finishAnim();
  else if (game.anim && !game.anim.paused && !modernRaf) modernRaf = requestAnimationFrame(modernFrame);
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
  ui.setModernBoard(on);
  if (on) {
    // What happened while it was hidden shows as it is now: the board rebuilds, so nothing splashes late.
    modernOpens = -1;
    if (classicRaf) cancelAnimationFrame(classicRaf);
    classicRaf = 0;
    modern?.resize();
    modern?.setActive(!editorUp);
    showModern();
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
        blocked: () => ui.cardsOpen(),
        gesture: () => ui.closeStart(),
        swipe: dir => ui.swipe(dir),
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
    game, toggleMute, toggleMusic, toggleBackground, setLook: applyLook, setWalls: applyWalls, setPad: applyPad, toggleMinimap, toggleFullscreen, wake, quit: () => { void quit(); }, play, editor, leftEditor,
    backToEditor: outside.backToEditor, shared: visit,
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
  ui.setMoveDir(dir => screenToGrid(dir, modernOn && modern ? modern.yaw() : DEFAULT_YAW));
  showLook(settings.look.get());
  followMusicSwitches();
  let direct = false;
  try {
    direct = new URL(window.location.href).searchParams.has('seed');
  } catch (_) {
    /* ignore */
  }
  ui.showTitle(false);
  if (direct) {
    ui.showChapter(1, false);
  }
  followHash();
  window.addEventListener('hashchange', followHash);
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
// A hidden tab runs no play-out and, unless Music in the background is on, holds the music; showing it again leaves the play-out stopped and the music going on.
followPage({ doc: document, win: window }, {
  hide: () => {
    game.stop();
    music.hold();
  },
  show: music.release,
});
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
  load(text: string): void {
    ui.showEditor(fromLevel(parse(text)));
  },
};
/* The modern board, as far as the browser specs read it. */
const modernHook = {
  frames: () => modern?.frames() ?? 0,
  yaw: () => modern?.yaw() ?? DEFAULT_YAW,
  zoom: () => modern?.zoom() ?? 0,
  pitch: () => modern?.pitch() ?? 0,
  following: () => modern?.following() ?? true,
  floating: () => modern?.floating() ?? [],
  splashing: () => modern?.splashing() ?? [],
  markers: () => modern?.markers() ?? [],
  quality: () => modern?.quality() ?? 3,
  fps: () => modern?.fps() ?? null,
  thumbMs: () => thumbMs,
  picture: lookPicture,
  get active() { return modernOn && !editorUp; },
};
window.__creteTest = { game, TRIALS, solve, initial, trialLevel, LEVEL_IDS, CHAPTERS, solveInWorker, playLevel, parse, editor: editorHook, modern: modernHook };
