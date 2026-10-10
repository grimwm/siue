/* The leave-room question: asked in the page (never with a browser dialog)
 * before the player walks out of a running room match. The game says what to
 * ask and what each answer does; ESC, handled by the game, means stay. The
 * veil (#leave-veil) stays in index.html and the game shows and hides it.
 * Copyright (C) 2026 William Grim
 * SPDX-License-Identifier: GPL-3.0-or-later */
import { render } from 'preact';
import { Key, KeyHints, blurThen } from './chrome.js';
import type { KeyHintFn } from './chrome.js';

export interface LeaveProps {
  keyHint: KeyHintFn;
  title: string;
  /** The consequence, in one or two sentences. */
  text: string;
  onStay: () => void;
  onLeave: () => void;
}

export function Leave(p: LeaveProps) {
  return (
    <KeyHints.Provider value={p.keyHint}>
      <div class="card" role="alertdialog" aria-modal="true" aria-labelledby="leave-title" aria-describedby="leave-text">
        <header class="ov-head">
          <div class="ov-title"><p class="kicker">Heads up</p><h2 id="leave-title">{p.title}</h2></div>
        </header>
        <p id="leave-text">{p.text}</p>
        <div class="acts">
          <button type="button" id="leave-stay" class="btn-primary" onClick={blurThen(p.onStay)}>
            Stay in the match <Key at="global:escape" cls="key esc-cap" />
          </button>
          <button type="button" id="leave-go" class="btn-leave" onClick={blurThen(p.onLeave)}>Leave room</button>
        </div>
      </div>
    </KeyHints.Provider>
  );
}

/** Draws (or redraws) the question into its veil. */
export function renderLeave(container: Element, props: LeaveProps): void {
  render(<Leave {...props} />, container);
}
