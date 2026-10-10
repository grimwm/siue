/* The radio log: the battle's one-line news, newest at the bottom. The game
 * owns the lines (it trims them at its cap) and hands in the whole list; this
 * draws it and keeps the newest line in view. The section element
 * (#log-overlay) stays in index.html and the game shows and hides it.
 * Copyright (C) 2026 William Grim
 * SPDX-License-Identifier: GPL-3.0-or-later */
import { render } from 'preact';
import { useLayoutEffect, useRef } from 'preact/hooks';
import { KeyHints, OverlayHead, ScrollKeys, useScrollKeep } from './chrome.js';
import type { KeyHintFn } from './chrome.js';

export interface LogLine {
  /** Never reused, so a line keeps its row as older ones are trimmed. */
  id: number;
  text: string;
  /** Colours the line: good, bad or info. */
  tone?: string;
}

export interface LogProps {
  keyHint: KeyHintFn;
  onClose: () => void;
  lines: LogLine[];
}

export function Log(p: LogProps) {
  const list = useRef<HTMLOListElement>(null);
  const newest = p.lines.length ? p.lines[p.lines.length - 1]!.id : 0;
  // A new line scrolls the panel to the bottom. Any other redraw (the keys
  // changing) leaves a reader who scrolled up where they were.
  useLayoutEffect(() => {
    const overlay = list.current?.parentElement;
    if (overlay) overlay.scrollTop = overlay.scrollHeight;
  }, [newest]);
  useScrollKeep(() => list.current?.parentElement, newest);
  return (
    <KeyHints.Provider value={p.keyHint}>
      <OverlayHead titleId="log-h" title="Radio log" closeId="log-close" onClose={p.onClose}
        navId="nav-log" scrollOnly nav={<ScrollKeys line />} />
      <ol id="log" class="log log-transparent" aria-live="polite" ref={list}>
        {p.lines.map(l => <li key={l.id} class={l.tone}>{l.text}</li>)}
      </ol>
    </KeyHints.Provider>
  );
}

/** Draws (or redraws) the log into its section. */
export function renderLog(container: Element, props: LogProps): void {
  render(<Log {...props} />, container);
}
