/* The Island of Crete: a text-based chase.
 * You move once per turn; the creature moves twice. Reach the exit alive.
 * Controls: arrows/WASD = move · Space = bash · Z/X/C = use item · H = hint ·
 * V = show the route · T = play-through · M = sound · N = new run.
 */
/* The game is three typed modules, compiled from src/ to js/ and imported here:
 * js/engine.js (the maze and the rules, no page in it), js/audio.js (the synth)
 * and js/ui.js (the board, HUD, log and input). Each import's ?v= is the
 * module's content hash, written by tools/install-files.php, so a browser never
 * pairs a cached module with a newer game.js. This file only wires them
 * together, starts a run, and exposes the test hook. */
import {
  createGame, bfsDist, bfsPath, key, ROWS, COLS, MAX_HP, TOTAL_PAGES, ITEMS,
} from './js/engine.js?v=7480931246';
import { createAudio } from './js/audio.js?v=f3f8ff55b1';
import { createUi } from './js/ui.js?v=9421923c2a';

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
  timers: {
    setTimeout: (fn, ms) => window.setTimeout(fn, ms),
    clearTimeout: id => window.clearTimeout(id),
    setInterval: (fn, ms) => window.setInterval(fn, ms),
    clearInterval: id => window.clearInterval(id),
  },
});
const G = game.G;

function toggleMute() {
  const muted = audio.toggleMute();
  ui.setMuteLabel(muted);
  ui.say(muted ? 'Sound off.' : 'Sound on.', 'info');
}

function restart(seedStr) {
  ui.hideEnd();
  game.stopAuto();
  game.clearHint();
  game.newRun(seedStr);
  ui.clearLog();
  ui.say(`Seed ${G.seed}. Theseus boots the maze. The exit 🚪 glows in the dark.`, 'info');
  ui.say(`Shortest escape is ${G.optimal} moves. You can afford ${G.budget} wrong turns — then it has you.`, 'info');
  ui.say('Two 🛡️ safe zones wait on the escape route. The 👹 already moves twice to your once.', 'info');
  ui.showSeed(G.seed);
  ui.render(game);
}

function start() {
  ui.bindControls({ game, restart, toggleMute, wake: audio.ensure });
  let seed = '';
  try {
    seed = new URL(window.location.href).searchParams.get('seed') || '';
  } catch (_) {
    /* ignore */
  }
  restart(seed);
}
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
