/* Operation Tankity: the coach.
 *
 * The tutorial as coach marks: a spotlight on the real control and a small
 * bubble beside it, one step at a time, the game visible and playable around
 * them. The lesson is data (src/coach.ts): the pre-match shop's steps (a gun
 * row, a pack, Buy, Preview, Start), then the battle's (barrel, power, drive,
 * a gun, FIRE, the wind). The player finishes a step by doing it; Next moves
 * on anyway, and Skip (or Q, once no panel is open) ends the lesson. Asking for
 * the tutorial (the title card's button, U) deals a fresh match with the coach
 * armed, and it starts in that match's shop; asked mid-battle, it starts at the
 * battle's steps. Skipping or finishing remembers the lesson as seen
 * (`tankity-tutorial`). The marks are src/ui/tutorial.tsx; the rest of the
 * game asks the coach three things (is it on, arm it, note a shot) through the
 * object createTutorial returns. */
import { browserStorage } from '../../_kit/ports.browser.ts';
import { pref, text } from '../../_kit/prefs.ts';
import { COACH_STEPS, advance, firstStep, stepCount, stepFits } from './coach.ts';
import type { CoachSnap } from './coach.ts';
import type { GameState, GameTank } from './game-types.ts';
import type { RoomClient } from './net.ts';
import type { sfx as SfxApi } from './audio.ts';
import type { KeyHintFn } from './ui/chrome.tsx';
import { renderTutorial as drawTutorial } from './ui/tutorial.tsx';

/** The slice of the game's state the coach reads (main.ts's G). */
export type TutorialState = Pick<GameState, 'demo' | 'over' | 'tanks' | 'phase' | 'selected' | 'cash' | 'preview' | 'shopSel' | 'shopQty'>;

/** Where the player is in the lesson, and the game as the step began. */
interface Coach { step: number; start: CoachSnap }

/** What the coach needs from the page and the rest of the game. */
export interface TutorialDeps {
  G: TutorialState;
  $(id: string): HTMLElement | null;
  /** A touch screen with no keyboard seen yet: no key names anywhere. */
  touch(): boolean;
  net: Pick<RoomClient, 'on'>;
  sfx: Pick<typeof SfxApi, 'play'>;
  me(): GameTank;
  keyHint: KeyHintFn;
  say(text: string, tone?: string): void;
  closeOverlays(): boolean;
  freshMatchFromSeedBox(opts?: { tut?: boolean }): void;
}

const WAR = ['aim', 'think', 'fly', 'settle'];

export function createTutorial(deps: TutorialDeps) {
  const { G, $, touch, net, sfx, me, keyHint, say, closeOverlays, freshMatchFromSeedBox } = deps;
  const STEPS = COACH_STEPS;
  let TUT: Coach | null = null;
  let TUT_ARMED = false;
  let fired = 0;
  let waiting = false;

  const storage = browserStorage();
  const seen = pref('tankity-tutorial', '', text, storage);

  /* A match on screen: its shop (dealt before any tank is), or its battle. */
  const inMatch = (): boolean => !G.demo && !G.over && (G.phase === 'shop' || G.tanks.length > 0);
  function snap(): CoachSnap {
    const t = G.tanks.length ? me() : null;
    return {
      phase: G.phase, angle: t ? t.angle : 0, power: t ? t.power : 0, x: t ? t.x : 0, selected: G.selected, fired,
      cash: G.cash, preview: !!G.preview, shopSel: G.shopSel, shopQty: G.shopQty,
    };
  }
  /* The marks are a Preact component (src/ui/tutorial.tsx); the game says
     which step is on and what to call the keys. */
  function renderTutorial(): void {
    const section = $('tutorial-overlay');
    if (!section) return;
    const step = TUT ? STEPS[TUT.step] : undefined;
    const keyboard = !touch();
    waiting = !!step && !stepFits(step, G.phase);
    drawTutorial(section, {
      waiting,
      keyHint,
      step: TUT && step ? {
        id: step.id, count: stepCount(STEPS, TUT.step), text: step.text, keys: keyboard && step.keys ? step.keys : null,
        target: step.target, last: TUT.step === STEPS.length - 1,
      } : null,
      skipKey: keyboard ? 'global:back' : undefined,
      onNext: nextStep,
      onSkip: skipTutorial,
    });
  }
  function goTo(step: number): void {
    if (!TUT) return;
    if (step >= STEPS.length) {
      say('Tutorial complete. The hills are yours.', 'good');
      endTutorial(true);
      return;
    }
    TUT.step = step;
    TUT.start = snap();
    renderTutorial();
  }
  function startTutorial(): void {
    if (!inMatch() || net.on) return;
    TUT_ARMED = false;
    fired = 0;
    TUT = { step: firstStep(STEPS, G.phase), start: snap() };
    const ov = $('tutorial-overlay');
    if (ov) ov.hidden = false;
    renderTutorial();
  }
  /* The armed coach starts with the match: in its pre-match shop, or (should
     the shop be gone) on the first aim. */
  function maybeStartTutorial(): void {
    if (TUT_ARMED && !TUT && inMatch()) startTutorial();
  }
  /* U or the title card's button: coach the battle or shop on screen, or deal
     a fresh match with the coach armed. Never in a room match. */
  function tutorialOpen(): void {
    if (TUT || net.on) return;
    closeOverlays();
    if (inMatch() && (G.phase === 'shop' || WAR.includes(G.phase))) {
      startTutorial();
    } else {
      freshMatchFromSeedBox({ tut: true });
    }
  }
  function endTutorial(wasSeen: boolean): void {
    if (wasSeen) seen.set('done');
    TUT = null;
    TUT_ARMED = false;
    const ov = $('tutorial-overlay');
    if (ov) ov.hidden = true;
    renderTutorial();
  }
  function skipTutorial(): void {
    sfx.play('click');
    say(touch() ? 'Tutorial skipped. Replay it from the title card any time.' : `Tutorial skipped. Press ${keyHint('global', 'tutorial')} any time to replay it.`, 'info');
    endTutorial(true);
  }
  /* Next: on to the following step, done or not. */
  function nextStep(): void {
    if (!TUT) return;
    sfx.play('click');
    goTo(TUT.step + 1);
  }
  /* Every frame: start an armed coach, and move on when the player did the step. */
  function tickTutorial(): void {
    if (TUT_ARMED && !TUT) maybeStartTutorial();
    if (!TUT || !inMatch()) return;
    const now = advance(STEPS, TUT.step, snap(), TUT.start);
    if (now !== TUT.step) {
      sfx.play('click');
      goTo(now);
    } else if (waiting === stepFits(STEPS[TUT.step]!, G.phase)) {
      renderTutorial(); // the step became doable, or stopped being
    }
  }

  /* What the rest of the game may ask of the coach. */
  const isActive = (): boolean => !!TUT;
  const arm = (): void => { TUT_ARMED = true; };
  const noteFired = (): void => { if (TUT) fired++; };

  return { renderTutorial, maybeStartTutorial, tutorialOpen, endTutorial, skipTutorial, tickTutorial, isActive, arm, noteFired };
}
