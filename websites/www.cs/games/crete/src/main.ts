/* Entry: wires engine, audio and UI, starts a run, and exposes window.__mazeTest
 * for the browser specs. */
import {
  createGame, bfsDist, bfsPath, key, ROWS, COLS, MAX_HP, TOTAL_PAGES, ITEMS,
} from './engine.ts';
import { createAudio } from './audio.ts';
import { createUi } from './ui.ts';
import { createSettings } from './settings.ts';
import { fullscreenNote } from './notes.ts';
import { mountTitleInstall } from './install-slot.ts';
import { browserStorage, browserTimers } from '../../_kit/ports.browser.ts';
import { exitApp, toggleFullscreen as toggleKitFullscreen, browserAppEnv, holdEscape, topKeyLock } from '../../_kit/app.ts';
import { followPage } from '../../_kit/page-life.ts';

declare global {
  interface Window {
    __mazeTest?: Record<string, unknown>;
  }
}

const audio = createAudio();
const settings = createSettings(browserStorage());
const appEnv = browserAppEnv();
const ui = createUi({
  ROWS, COLS, MAX_HP, TOTAL_PAGES, ITEMS, key,
  heart: () => audio.sfx('heart'),
});
const game = createGame({
  say: ui.say,
  sfx: audio.sfx,
  render: () => ui.render(game),
  showEnd: won => ui.showEnd(game, won),
  timers: browserTimers,
});
const G = game.G;
const frame = (): HTMLElement => document.getElementById('frame') ?? document.documentElement;

/* The maze behind the title card: the first Play starts it, so a link with ?seed= replays its maze;
   every later Play is a random seed. */
let openSeed = '';

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

function restart(seedStr: string): void {
  ui.closeLayers();
  game.stopAuto();
  game.clearHint();
  game.newRun(seedStr);
  ui.clearLog();
  ui.say(`Seed ${G.seed}. Theseus boots the maze. The exit 🚪 glows in the dark.`, 'info');
  ui.say(`Shortest escape is ${G.optimal} moves. It will find you on the way: plan for the meeting.`, 'info');
  ui.say('Two 🛡️ safe zones wait on the escape route. The 👹 already moves twice to your once.', 'info');
  ui.showSeed(G.seed);
  ui.render(game);
}

/* Play on the title card. A click is the gesture that lets a remembered full screen return. */
function play(): void {
  if (settings.fullscreen.get() === 'on' && !appEnv.fullscreenElement()) toggleFullscreen();
  const seed = openSeed;
  openSeed = '';
  restart(seed);
}

/* Quit (the menu's): the run ends; an installed app closes where it may, and otherwise
   (always in a browser tab) the title card shows. */
async function quit(): Promise<void> {
  ui.closeLayers();
  game.quit();
  const outcome = await exitApp(appEnv);
  // A new run started inside the close wait: the card would cover it.
  if (outcome !== 'closed' && game.G.over) ui.showTitle(outcome === 'title-with-hint');
}

function start(): void {
  ui.bindControls({
    game, restart, toggleMute, toggleFullscreen, wake: audio.ensure, quit: () => { void quit(); }, play,
  });
  let seed = '';
  try {
    seed = new URL(window.location.href).searchParams.get('seed') || '';
  } catch (_) {
    /* ignore */
  }
  if (settings.sound.get() === 'off') {
    audio.toggleMute();
    ui.setMuted(true);
  }
  restart(seed);
  openSeed = G.seed;
  ui.showTitle(false);
  mountTitleInstall(window, document.getElementById('title-install'));
}
// A hidden tab runs no play-through step and no hint fade; showing it again picks them up.
followPage({ doc: document, win: window }, { hide: game.pause, show: game.resume });
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
else start();

/* Test hook for automated checks: drives the real game logic, no copy. */
window.__mazeTest = {
  G,
  newRun: game.newRun,
  tryMove: game.tryMove,
  useItem: game.useItem,
  bash: game.bash,
  hint: game.hint,
  toggleAnswer: game.toggleAnswer,
  toggleAuto: game.toggleAuto,
  stopAuto: game.stopAuto,
  autoStep: game.autoStep,
  goalPath: game.goalPath,
  toggleMute,
  foeStep: game.foeStep,
  creaturePhase: game.creaturePhase,
  bfsDist,
  bfsPath,
  key,
  ROWS,
  COLS,
};
