/* The end-of-match veil: the result (kicker, title, text, score line), the
 * callsign form that files a solo run, the room rematch button, and the button
 * that starts over. The game owns the match and hands in finished text; this
 * draws it and reports the buttons. The veil (#end-veil) stays in index.html
 * and the game shows and hides it. What the player typed in the callsign box
 * lives in the input, which a redraw leaves alone.
 * Copyright (C) 2026 William Grim
 * SPDX-License-Identifier: GPL-3.0-or-later */
import { render } from 'preact';
import { useLayoutEffect, useRef } from 'preact/hooks';
import { Key, KeyHints, OverlayHead, ScrollKeys, blurThen, useScrollKeep } from './chrome.js';
import type { KeyHintFn } from './chrome.js';

export interface EndVeilProps {
  keyHint: KeyHintFn;
  kicker: string;
  title: string;
  text: string;
  /** The score line under the text. */
  score: string;
  /** Hide the callsign form (room standings are not high-score runs). */
  formHidden: boolean;
  /** The run was filed: the form's button reads "Filed" and is disabled. */
  filed: boolean;
  /** The callsign to prefill when the box is empty. */
  callsign: string;
  /** The rematch button's label; null hides the button (solo matches). */
  rematch: string | null;
  /** The start-over button reads "Back to rooms" instead of "Play again (N)". */
  backToRooms: boolean;
  /** The callsign form was sent; `name` is the box as typed. */
  onFile: (name: string) => void;
  onRematch: () => void;
  onAgain: () => void;
}

export function EndVeil(p: EndVeilProps) {
  const card = useRef<HTMLDivElement>(null);
  const name = useRef<HTMLInputElement>(null);
  // The veil scrolls on a short screen; a redraw keeps its place.
  useScrollKeep(() => card.current?.parentElement);
  useLayoutEffect(() => {
    const el = name.current;
    if (el && !el.value) el.value = p.callsign;
  });
  return (
    <KeyHints.Provider value={p.keyHint}>
      <div class="card" role="dialog" aria-modal="true" aria-labelledby="end-title" ref={card}>
        <OverlayHead kicker={p.kicker} kickerId="end-kicker" titleId="end-title" title={p.title}
          navId="nav-end" scrollOnly nav={<ScrollKeys line />} />
        <p id="end-text">{p.text}</p>
        <p id="end-score" class="runstats">{p.score}</p>
        <button type="button" id="rematch" hidden={p.rematch === null} onClick={blurThen(p.onRematch)}>{p.rematch ?? ''}</button>
        <form id="end-score-form" class="seedbox" action="#" hidden={p.formHidden}
          onSubmit={ev => { ev.preventDefault(); p.onFile(name.current?.value ?? ''); }}>
          <label for="end-name">Callsign</label>
          <input id="end-name" name="name" type="text" autocomplete="off" spellcheck={false} maxLength={24}
            placeholder="e.g. tankity" ref={name} />
          <button type="submit" disabled={p.filed}>{p.filed ? 'Filed' : 'File score'}</button>
        </form>
        <button type="button" id="again" class="btn-primary" onClick={blurThen(p.onAgain)}>
          {p.backToRooms ? 'Back to rooms' : <>Play again <Key at="global:new" bare /></>}
        </button>
      </div>
    </KeyHints.Provider>
  );
}

/** Draws (or redraws) the end veil into its element. */
export function renderEndVeil(container: Element, props: EndVeilProps): void {
  render(<EndVeil {...props} />, container);
}
