/* Entry: wires the game, the board, audio and the UI, opens the title card (or, with ?seed=, Chapter 1's card over it),
 * and exposes window.__creteTest for the browser specs. */
import atlasJson from '../fx/sprites/tiles.json' with { type: 'json' };
import { createAudio } from './audio.ts';
import { createBoard } from './board.ts';
import { drawList } from './board-plan.ts';
import type { Atlas } from './board-plan.ts';
import { createGame, frameOf } from './game.ts';
import { initial } from './puzzle/state.ts';
import { solve } from './puzzle/solver.ts';
import { TRIALS, trialLevel } from './puzzle/trials.ts';
import { CAMPAIGN_LEVELS, CHAPTERS, LEVEL_IDS } from './campaign/chapters.ts';
import { createFoundPages } from './pages.ts';
import { createProgress } from './progress.ts';
import { createUi } from './ui.ts';
import { createSettings } from './settings.ts';
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

const atlas = atlasJson as Atlas;
const clock = { now: (): number => performance.now() };
const audio = createAudio();
const settings = createSettings(browserStorage());
const appEnv = browserAppEnv();
const image = new Image();
const board = createBoard(document.getElementById('stage') as HTMLCanvasElement, atlas, image);
const progress = createProgress(browserStorage());
const pages = createFoundPages(browserStorage());
const ui = createUi({ atlas, board, progress, pages, sfx: audio.sfx });

/* The reduced-motion preference, followed live. */
const motion = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null;
let reduced = motion?.matches ?? false;
motion?.addEventListener('change', e => { reduced = e.matches; });

const game = createGame({
  sfx: audio.sfx,
  say: ui.say,
  progress,
  pages,
  levels: CAMPAIGN_LEVELS,
  timers: browserTimers,
  clock,
  reducedMotion: () => reduced,
  changed: () => ui.render(game),
});
const frame = (): HTMLElement => document.getElementById('frame') ?? document.documentElement;

function toggleMute(): void {
  const muted = audio.toggleMute();
  ui.setMuted(muted);
  settings.sound.set(muted ? 'off' : 'on');
  ui.say(muted ? 'Sound off.' : 'Sound on.', 'info');
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

/* Play on the title card opens Chapter 1's card. A click is the gesture that lets a remembered full screen return. */
function play(): void {
  if (settings.fullscreen.get() === 'on' && !appEnv.fullscreenElement()) toggleFullscreen();
  ui.showChapter(1, false);
}

/* Quit (the menu's): the cards close; an installed app closes where it may, and otherwise
   (always in a browser tab) the title card shows. */
async function quit(): Promise<void> {
  ui.closeLayers();
  game.stop();
  const outcome = await exitApp(appEnv);
  if (outcome !== 'closed') ui.showTitle(outcome === 'title-with-hint');
}

/* The board repaints every frame: the sprites animate, and a turn's figures move between cells. */
function loop(now: number): void {
  const f = frameOf(game, game.anim ? clock.now() - game.anim.started : 0);
  if (f) {
    board.paint(drawList(f.state, f.figures, atlas, now), game.thread ?? undefined);
    if (game.anim && f.done) game.finishAnim();
  }
  requestAnimationFrame(loop);
}

function start(): void {
  ui.bindControls({
    game, toggleMute, toggleFullscreen, wake: audio.ensure, quit: () => { void quit(); }, play,
  });
  if (settings.sound.get() === 'off') {
    audio.toggleMute();
    ui.setMuted(true);
  }
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
  mountTitleInstall(window, document.getElementById('title-install'));
  image.onload = () => { requestAnimationFrame(loop); };
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
// A hidden tab runs no play-out; showing it again leaves it stopped.
followPage({ doc: document, win: window }, { hide: game.stop, show: () => {} });
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
else start();

/* Test hook for automated checks: drives the real game logic, no copy. */
window.__creteTest = { game, TRIALS, solve, initial, trialLevel, LEVEL_IDS, CHAPTERS };
