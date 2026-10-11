/* Operation Tankity: the coach.
 *
 * Coached opening moves, skippable forever. The tutorial arms on a fresh New
 * Game and starts at the first live battle (after the pre-match shop).
 * Skipping or finishing remembers the choice in localStorage; the menu
 * replays it any time. The coach overlay (src/ui/tutorial.tsx) draws what
 * this says; the rest of the game asks it three questions (is it on, arm it,
 * note a shot) through the object createTutorial returns. */
import type { GameState, GameTank } from './game-types.js';
import type { RoomClient } from './net.js';
import type { sfx as SfxApi } from './audio.js';
import type { KeyHintFn } from './ui/chrome.js';
import { renderTutorial as drawTutorial } from './ui/tutorial.js';

/** The slice of the game's state the coach reads (game.js's G). */
export type TutorialState = Pick<GameState, 'demo' | 'over' | 'tanks' | 'phase' | 'selected'>;

/** Where the player is in the lesson. */
interface Coach { step: number; x0: number; sel0: string; fired: boolean }

/** One move of the lesson: its text (key tokens in braces) and how to tell it is done. */
interface TutorialStep { text: string; done(t: GameTank): boolean | null }

/** What the coach needs from the page and the rest of the game. */
export interface TutorialDeps {
  G: TutorialState;
  $(id: string): HTMLElement | null;
  TOUCH: boolean;
  net: Pick<RoomClient, 'on'>;
  sfx: Pick<typeof SfxApi, 'play'>;
  me(): GameTank;
  keyHint: KeyHintFn;
  keyCap(ctx: string, action: string): string;
  say(text: string, tone?: string): void;
  refreshNavHints(): void;
  closeOverlays(): boolean;
  freshMatchFromSeedBox(opts?: { tut?: boolean }): void;
}

export function createTutorial(deps: TutorialDeps) {
  const { G, $, TOUCH, net, sfx, me, keyHint, keyCap, say, refreshNavHints, closeOverlays, freshMatchFromSeedBox } = deps;

  /* What a touch player taps instead, for prose that names a key. */
  const TOUCH_NAMES: Record<string, string> = {
    'aim:barrelLeft': '◀', 'aim:barrelRight': '▶', 'aim:powerUp': '▲', 'aim:powerDown': '▼',
    'aim:driveLeft': 'Drive ◀', 'aim:driveRight': 'Drive ▶',
    'global:cycle': 'Weapons', 'global:fire': 'Fire',
  };
  /* ---------- tutorial: coached opening moves, skippable forever ---------- */
  // The tutorial arms on a fresh New Game and starts at the first live
  // battle (after the pre-match shop). Skipping or finishing remembers the
  // choice in localStorage; the menu replays it any time.
  let TUT: Coach | null = null;
  let TUT_ARMED = false;
  /* Step texts name keys as {context:action} tokens so a reconfigured layout
  // rewrites the lesson by itself. */
  const TUT_STEPS: TutorialStep[] = [
    { text: 'Hold {aim:barrelLeft} or {aim:barrelRight} to swing the barrel. Watch the muzzle stub move.', done: (t: GameTank) => t.angle !== 62 },
    { text: 'Hold {aim:powerUp} or {aim:powerDown} to change power. More power means longer legs.', done: (t: GameTank) => t.power !== 55 },
    { text: 'Tap {aim:driveLeft} or {aim:driveRight} to drive while fuel lasts. Hills are cover.', done: (t: GameTank) => TUT && Math.abs(t.x - TUT.x0) > 2 },
    { text: 'Press {global:cycle} to cycle shells. The HUD shows what is loaded.', done: () => TUT && G.selected !== TUT.sel0 },
    { text: 'Press {global:fire} to fire. Then read the wind and adjust.', done: () => TUT && TUT.fired },
  ];
  function fmtKeys(text: string): string {
    return String(text).replace(/\{([a-z]+):([a-zA-Z]+)\}/g, (_, ctx: string, a: string) => (TOUCH && TOUCH_NAMES[ctx + ':' + a]) || keyHint(ctx, a));
  }
  function tutorialSeen(): boolean {
    try {
      return window.localStorage.getItem('tankity-tutorial') === 'done';
    } catch (_) {
      return true; // without storage there is nowhere to remember, so never nag
    }
  }
  function markTutorialSeen(): void {
    try {
      window.localStorage.setItem('tankity-tutorial', 'done');
    } catch (_) { /* private mode etc. */ }
  }
  /* The coach is a Preact component (src/ui/tutorial.tsx); the game says which
     move the player is on and what to call the keys. */
  function renderTutorial(): void {
    const section = $('tutorial-overlay');
    if (!section) return;
    drawTutorial(section, {
      keyHint,
      text: TUT ? `Move ${TUT.step + 1} of ${TUT_STEPS.length}: ${fmtKeys(TUT_STEPS[TUT.step]!.text)}` : '',
      progress: TUT ? 'Follow along in the hills behind this card.' : '',
      skip: `Skip tutorial${keyCap('global', 'escape')}`,
      onSkip: skipTutorial,
    });
    refreshNavHints();
  }
  function startTutorial(): void {
    if (G.demo || !G.tanks.length) return;
    TUT_ARMED = false;
    TUT = { step: 0, x0: me().x, sel0: G.selected, fired: false };
    const ov = $('tutorial-overlay');
    if (ov) ov.hidden = false;
    renderTutorial();
  }
  function maybeStartTutorial(): void {
    if (TUT_ARMED && !TUT && !G.demo && G.tanks.length) startTutorial();
  }
  /* U or the menu button: coach the live battle, or deal a fresh match with
  // the coach armed for its first battle. Never interrupts a room match. */
  function tutorialOpen(): void {
    if (TUT || net.on) return;
    closeOverlays();
    if (!G.demo && G.tanks.length && (G.phase === 'aim' || G.phase === 'think' || G.phase === 'fly' || G.phase === 'settle')) {
      startTutorial();
    } else {
      freshMatchFromSeedBox({ tut: true });
    }
  }
  function endTutorial(seen: boolean): void {
    if (seen) markTutorialSeen();
    TUT = null;
    TUT_ARMED = false;
    const ov = $('tutorial-overlay');
    if (ov) ov.hidden = true;
  }
  function skipTutorial(): void {
    sfx.play('click');
    say(TOUCH ? 'Tutorial skipped. Replay it from the menu any time.' : `Tutorial skipped. Press ${keyHint('global', 'tutorial')} any time to replay it.`, 'info');
    endTutorial(true);
  }
  function tickTutorial(): void {
    if (!TUT || G.demo || G.over || !G.tanks.length) return;
    if (TUT.step < TUT_STEPS.length && TUT_STEPS[TUT.step]!.done(me())) {
      TUT.step++;
      sfx.play('click');
      if (TUT.step >= TUT_STEPS.length) {
        say('Tutorial complete. The hills are yours.', 'good');
        endTutorial(true);
        return;
      }
      renderTutorial();
    }
  }

  /* What the rest of the game may ask of the coach. */
  const isActive = (): boolean => !!TUT;
  const arm = (): void => { TUT_ARMED = true; };
  const noteFired = (): void => { if (TUT) TUT.fired = true; };

  return { renderTutorial, maybeStartTutorial, tutorialOpen, endTutorial, skipTutorial, tickTutorial, isActive, arm, noteFired };
}
