/* The tutorial coach: the current move, the progress line and the Skip button.
 * The game owns the lesson (which step the player is on, the step's text with
 * the live key names filled in) and hands in the finished lines; this draws them
 * and reports Skip. The section element (#tutorial-overlay) stays in index.html
 * and the game shows and hides it.
 * Copyright (C) 2026 William Grim
 * SPDX-License-Identifier: GPL-3.0-or-later */
import { render } from 'preact';
import { KeyHints, Key, blurThen } from './chrome.js';
import type { KeyHintFn } from './chrome.js';

export interface TutorialProps {
  keyHint: KeyHintFn;
  /** "Move 2 of 5: ...", or empty while no lesson runs. */
  text: string;
  progress: string;
  /** The Skip button's whole label, ESC key included ("Skip tutorial (ESC)"; no key on touch). */
  skip: string;
  onSkip: () => void;
}

export function Tutorial(p: TutorialProps) {
  return (
    <KeyHints.Provider value={p.keyHint}>
      <h2 id="tutorial-h">Tutorial</h2>
      <p id="tutorial-text">{p.text}</p>
      <p class="hint" id="tutorial-progress">{p.progress}</p>
      <button type="button" id="tutorial-skip" onClick={blurThen(p.onSkip)}>{p.skip}</button>
      <p class="nav-hint" id="nav-tutorial"><Key at="global:tutorial" /> replays anytime; skipping once skips it for good</p>
    </KeyHints.Provider>
  );
}

/** Draws (or redraws) the tutorial coach into its section. */
export function renderTutorial(container: Element, props: TutorialProps): void {
  render(<Tutorial {...props} />, container);
}
