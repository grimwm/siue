/* Entry: wires engine, audio and UI, starts a run, and exposes window.__mazeTest
 * for the browser specs. */
import {
  createGame, bfsDist, bfsPath, key, ROWS, COLS, MAX_HP, TOTAL_PAGES, ITEMS,
} from './engine.ts';
import { createAudio } from './audio.ts';
import { createUi } from './ui.ts';
import { browserTimers } from '../../_kit/ports.browser.ts';
import { exitApp, browserAppEnv } from '../../_kit/app.ts';
import { followPage } from '../../_kit/page-life.ts';

declare global {
  interface Window {
    __mazeTest?: Record<string, unknown>;
  }
}

const audio = createAudio();
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

function toggleMute(): void {
  const muted = audio.toggleMute();
  ui.setMuteLabel(muted);
  ui.say(muted ? 'Sound off.' : 'Sound on.', 'info');
}

function restart(seedStr: string): void {
  ui.hideEnd();
  ui.hideTitle();
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

/* Quit: the run ends; an installed app closes where it may, and otherwise
   (always in a browser tab) the title card shows. */
async function quit(): Promise<void> {
  game.quit();
  ui.hideEnd();
  const outcome = await exitApp(browserAppEnv());
  // A new run started inside the close wait: the card would cover it.
  if (outcome !== 'closed' && game.G.over) ui.showTitle(outcome === 'title-with-hint');
}

function start(): void {
  ui.bindControls({ game, restart, toggleMute, wake: audio.ensure, quit: () => { void quit(); } });
  let seed = '';
  try {
    seed = new URL(window.location.href).searchParams.get('seed') || '';
  } catch (_) {
    /* ignore */
  }
  restart(seed);
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
