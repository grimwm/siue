/* Entry: wires the game, the board, audio, the UI, the level editor and share links, opens the title card (or, with
 * ?seed=, Chapter 1's card over it; with #edit, the editor; with a share link, its card), and exposes
 * window.__creteTest for the browser specs. */
import atlasJson from '../fx/sprites/tiles.json' with { type: 'json' };
import { createAudio } from './audio.ts';
import { createBoard } from './board.ts';
import { drawList } from './board-plan.ts';
import type { Atlas } from './board-plan.ts';
import { createGame, frameOf } from './game.ts';
import { initial } from './puzzle/state.ts';
import { parse } from './puzzle/level.ts';
import type { Level } from './puzzle/level.ts';
import { solve } from './puzzle/solver.ts';
import { startSearch } from './solver-client.ts';
import type { Report } from './solver-host.ts';
import { TRIALS, trialLevel } from './puzzle/trials.ts';
import { CAMPAIGN_LEVELS, CHAPTERS, LEVEL_IDS } from './campaign/chapters.ts';
import type { OutsideLevel } from './campaign/chapters.ts';
import { createOutside } from './outside.ts';
import type { Action } from './puzzle/step.ts';
import { createFoundPages } from './pages.ts';
import { createProgress } from './progress.ts';
import { createUi } from './ui.ts';
import { createEditor } from './editor/editor.ts';
import { fromLevel } from './editor/model.ts';
import { createRater } from './share/rating.ts';
import { createVisit, fragmentKind } from './share/visit.ts';
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
/* The campaign's levels, then the level from outside it (a try from the editor, or a browser spec's). */
const outside = createOutside(CAMPAIGN_LEVELS, {
  open: i => game.open(i),
  settle: () => game.settle(),
  closeLayers: () => ui.closeLayers(),
  showEditor: () => ui.showEditor(),
  bestWon: (text, moves) => editor.tryWon(text, moves),
});
const levels = outside.levels;
const ui = createUi({ atlas, board, progress, pages, levels, sfx: audio.sfx });
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
  show: () => ui.showShared(),
  refuse: message => ui.refuseLink(message),
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
  else if (ui.top() === 'shared') ui.showTitle(false);
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

const game = createGame({
  sfx: audio.sfx,
  say: ui.say,
  progress,
  pages,
  levels,
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

/* Quit (the menu's): the cards close and the editor's visit ends; an installed app closes where it may, and
   otherwise (always in a browser tab) the title card shows. */
async function quit(): Promise<void> {
  ui.closeLayers();
  game.stop();
  leftEditor();
  const outcome = await exitApp(appEnv);
  if (outcome !== 'closed') ui.showTitle(outcome === 'title-with-hint');
}

/* The board repaints every frame: the sprites animate, and a turn's figures move between cells (holding still
   while a story page the figure reached is read). */
function loop(now: number): void {
  const f = frameOf(game, game.animMs());
  if (f) {
    board.paint(drawList(f.state, f.figures, atlas, now), game.thread ?? undefined);
    if (game.anim && f.done) game.finishAnim();
  }
  requestAnimationFrame(loop);
}

function start(): void {
  ui.bindControls({
    game, toggleMute, toggleFullscreen, wake: audio.ensure, quit: () => { void quit(); }, play, editor, leftEditor,
    backToEditor: outside.backToEditor, shared: visit,
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
  followHash();
  window.addEventListener('hashchange', followHash);
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
    ui.showEditor();
    editor.open(fromLevel(parse(text)));
  },
};
window.__creteTest = { game, TRIALS, solve, initial, trialLevel, LEVEL_IDS, CHAPTERS, solveInWorker, playLevel, parse, editor: editorHook };
