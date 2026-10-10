/* The scores overlay: the callsign box that files the run, then the high-score
 * list and where it came from. The game owns the list (it loads it from the
 * score server, or this browser) and hands in finished lines; this draws them
 * and reports the callsign when the form is sent. The section element
 * (#report-overlay) stays in index.html and the game shows and hides it. The
 * callsign box is the one thing the page keeps: what the player typed lives in
 * the input.
 * Copyright (C) 2026 William Grim
 * SPDX-License-Identifier: GPL-3.0-or-later */
import { render } from 'preact';
import { useRef } from 'preact/hooks';
import { KeyHints, OverlayHead, ScrollKeys, useScrollKeep } from './chrome.js';
import type { KeyHintFn } from './chrome.js';

export interface ScoresProps {
  keyHint: KeyHintFn;
  onClose: () => void;
  /** One line per report, best first; an empty list says nobody has filed;
   *  null is a list not loaded yet and shows nothing. */
  rows: string[] | null;
  /** "Showing reports from ...", or empty. */
  note: string;
  /** Hide the callsign form (a room match is not a high-score run). */
  formHidden: boolean;
  /** The form was sent; `name` is the box as typed. */
  onFile: (name: string) => void;
}

export function Scores(p: ScoresProps) {
  const form = useRef<HTMLFormElement>(null);
  const name = useRef<HTMLInputElement>(null);
  // The section scrolls on a short screen; a reload of the list keeps its place.
  useScrollKeep(() => form.current?.parentElement);
  return (
    <KeyHints.Provider value={p.keyHint}>
      <OverlayHead titleId="score-h" title="Scores" closeId="report-close" onClose={p.onClose}
        navId="nav-report" scrollOnly nav={<ScrollKeys line />} />
      <form id="score-form" class="seedbox" action="#" ref={form} style={p.formHidden ? { display: 'none' } : undefined}
        onSubmit={ev => { ev.preventDefault(); p.onFile(name.current?.value ?? ''); }}>
        <label for="name-input">Callsign</label>
        <input id="name-input" name="name" type="text" autocomplete="off" spellcheck={false} maxLength={24}
          placeholder="e.g. tankity" ref={name} />
        <button type="submit" id="save-score">File report</button>
      </form>
      <ol id="scores" class="scores">
        {p.rows !== null && (p.rows.length === 0
          ? <li>No after-action reports filed yet. Be the first legend.</li>
          : p.rows.map((r, i) => <li key={i}>{r}</li>))}
      </ol>
      <p id="scores-note" class="hint">{p.note}</p>
    </KeyHints.Provider>
  );
}

/** Draws (or redraws) the scores into their section. */
export function renderScores(container: Element, props: ScoresProps): void {
  render(<Scores {...props} />, container);
}
