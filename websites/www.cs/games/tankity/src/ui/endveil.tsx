/* The end card: the result, this match's scoreboard, where the run was filed,
 * and what to do next: Continue (back to the title card) in solo; Play again
 * (same room) or Leave room when a room match is over; Watch the finish or
 * Leave room when you are out; Back to the battle when the scoreboard was
 * opened from the menu. The veil (#end-veil) stays in index.html and the game
 * shows and hides it.
 * Copyright (C) 2026 William Grim
 * SPDX-License-Identifier: GPL-3.0-or-later */
import { render } from 'preact';
import { useRef } from 'preact/hooks';
import { KeyHints, OverlayHead, ScrollKeys, blurThen, useScrollKeep } from './chrome.tsx';
import type { KeyHintFn } from './chrome.tsx';
import { Standings } from './standings.tsx';
import type { Board } from '../standings.ts';

export interface EndVeilProps {
  keyHint: KeyHintFn;
  kicker: string;
  title: string;
  text: string;
  /** The score line under the scoreboard. */
  score: string;
  board: Board | null;
  /** "Filed · #12 all-time", "Filing…", or null when nothing was filed. */
  filed: string | null;
  buttons: 'solo' | 'over' | 'out' | 'peek';
  onAgain: () => void;
  onLeave: () => void;
  onWatch: () => void;
}

export function EndVeil(p: EndVeilProps) {
  const card = useRef<HTMLDivElement>(null);
  // The scoreboard scrolls on a short screen; a redraw keeps its place.
  useScrollKeep(() => card.current?.querySelector<HTMLElement>('.end-board'));
  const watch = p.buttons === 'out' || p.buttons === 'peek';
  return (
    <KeyHints.Provider value={p.keyHint}>
      <div class="card" role="dialog" aria-modal="true" aria-labelledby="end-title" ref={card}>
        <OverlayHead kicker={p.kicker} kickerId="end-kicker" titleId="end-title" title={p.title}
          navId="nav-end" scrollOnly nav={<ScrollKeys line />} />
        <p id="end-text" hidden={!p.text}>{p.text}</p>
        {p.board && <div id="end-board" class="end-board"><Standings board={p.board} /></div>}
        <div class="end-foot">
          <p id="end-score" class="runstats">{p.score}</p>
          <p id="end-filed" class="hint" hidden={!p.filed}>{p.filed ?? ''}</p>
          <div class="end-acts">
            {watch
              ? <button type="button" id="end-watch" class="btn-primary" onClick={blurThen(p.onWatch)}>
                  {p.buttons === 'out' ? 'Watch the finish' : 'Back to the battle'}
                </button>
              : <button type="button" id="again" class="btn-primary" onClick={blurThen(p.onAgain)}>
                  {p.buttons === 'over' ? 'Play again (same room)' : 'Continue'}
                </button>}
            {p.buttons !== 'solo' && (
              <button type="button" id="end-leave" class="btn-leave" onClick={blurThen(p.onLeave)}>Leave room</button>
            )}
          </div>
        </div>
      </div>
    </KeyHints.Provider>
  );
}

/** Draws (or redraws) the end veil into its element. */
export function renderEndVeil(container: Element, props: EndVeilProps): void {
  render(<EndVeil {...props} />, container);
}

/** Puts keyboard focus on the card's primary button; the game calls it when the veil opens, not on a redraw. */
export function focusEndVeil(container: Element): void {
  const primary = container.querySelector?.('.btn-primary') as HTMLElement | null;
  primary?.focus?.();
}
