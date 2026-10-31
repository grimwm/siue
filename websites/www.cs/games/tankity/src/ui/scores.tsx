/* The scores overlay: a switcher between the difficulties and two lists for
 * the one on screen, best first: the online board of room matches two or more
 * humans played, with this player's runs marked, and this browser's own board
 * (solo matches and one-human rooms), the run just saved marked. The game
 * loads the lists and hands in finished lines; this draws them. The section element (#report-overlay) stays in index.html.
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
  /** The online board: one line per run, best first, `mine` when it is this player's; an empty
   *  list says nobody has filed; null is a list not loaded yet and shows nothing. */
  rows: { text: string; mine: boolean }[] | null;
  /** Where the online list came from, or empty. */
  note: string;
  /** This browser's board for the level, best first, `mine` on the run just saved; null when storage is blocked. */
  local: { text: string; mine: boolean }[] | null;
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
      <h3 id="scores-online-h" class="scores-h">Online · Room Matches with 2+ Players</h3>
      <ol id="scores" class="scores" aria-labelledby="scores-online-h">
        {p.rows !== null && (p.rows.length === 0
          ? <li>No after-action reports filed yet. Be the first legend.</li>
          : p.rows.map((r, i) => <li key={i} class={r.mine ? 'mine' : undefined}>{r.text}{r.mine && <span class="sr-only"> (yours)</span>}</li>))}
      </ol>
      <p id="scores-note" class="hint">{p.note}</p>
      <h3 id="scores-local-h" class="scores-h">This Browser</h3>
      <ol id="scores-local" class="scores" aria-labelledby="scores-local-h">
        {p.local === null
          ? <li>This browser can't keep scores (storage is blocked).</li>
          : p.local.length === 0
            ? <li>No runs saved in this browser on {DIFFICULTY_NAMES[p.level]} yet.</li>
            : p.local.map((r, i) => <li key={i} class={r.mine ? 'mine' : undefined}>{r.text}{r.mine && <span class="sr-only"> (just saved)</span>}</li>)}
      </ol>
    </KeyHints.Provider>
  );
}

/** Draws (or redraws) the scores into their section. */
export function renderScores(container: Element, props: ScoresProps): void {
  render(<Scores {...props} />, container);
}
