/* The scores overlay: one difficulty's all-time board, best first, with this
 * player's runs marked, a switcher to the other difficulties, and where the list
 * came from. The game loads the list and hands in finished lines; this draws
 * them. The section element (#report-overlay) stays in index.html.
 * Copyright (C) 2026 William Grim
 * SPDX-License-Identifier: GPL-3.0-or-later */
import { render } from 'preact';
import { DIFFICULTIES } from '../ai.ts';
import { DIFFICULTY_NAMES } from '../difficulty.ts';
import type { Difficulty } from '../sim.ts';
import { KeyHints, OverlayHead, ScrollKeys, useScrollKeep } from './chrome.tsx';
import type { KeyHintFn } from './chrome.tsx';

export interface ScoresProps {
  keyHint: KeyHintFn;
  onClose: () => void;
  /** The board on screen. */
  level: Difficulty;
  /** The player picked another board. */
  onLevel: (level: Difficulty) => void;
  /** One line per run, best first, `mine` when it is this player's; an empty
   *  list says nobody has filed; null is a list not loaded yet and shows nothing. */
  rows: { text: string; mine: boolean }[] | null;
  /** Where the list came from, or empty. */
  note: string;
}

export function Scores(p: ScoresProps) {
  // The section scrolls on a short screen; a reload of the list keeps its place.
  useScrollKeep(() => document.getElementById('scores')?.parentElement);
  return (
    <KeyHints.Provider value={p.keyHint}>
      <OverlayHead titleId="score-h" title="Scores" closeId="report-close" onClose={p.onClose}
        navId="nav-report" scrollOnly nav={<ScrollKeys line />} />
      <div class="scores-levels" role="group" aria-label="Board">
        {DIFFICULTIES.map(lv => (
          <button key={lv} id={`scores-level-${lv}`} type="button" aria-pressed={p.level === lv ? 'true' : 'false'}
            onClick={() => { if (p.level !== lv) p.onLevel(lv); }}>{DIFFICULTY_NAMES[lv]}</button>
        ))}
      </div>
      <ol id="scores" class="scores">
        {p.rows !== null && (p.rows.length === 0
          ? <li>No after-action reports filed yet. Be the first legend.</li>
          : p.rows.map((r, i) => <li key={i} class={r.mine ? 'mine' : undefined}>{r.text}{r.mine && <span class="sr-only"> (yours)</span>}</li>))}
      </ol>
      <p id="scores-note" class="hint">{p.note}</p>
    </KeyHints.Provider>
  );
}

/** Draws (or redraws) the scores into their section. */
export function renderScores(container: Element, props: ScoresProps): void {
  render(<Scores {...props} />, container);
}
