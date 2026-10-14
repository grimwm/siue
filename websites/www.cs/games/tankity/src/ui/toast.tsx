/* The turn toasts: "Your turn in 7K2Q · vs ZED" with Go (to that room) and a
 * dismiss button, stacked in #toast-root (index.html, aria-live polite). The
 * game owns the list, closes each after a while, and says what Go does. No
 * key is bound to them.
 * Copyright (C) 2026 William Grim
 * SPDX-License-Identifier: GPL-3.0-or-later */
import { render } from 'preact';
import { blurThen } from './chrome.tsx';

export interface Toast {
  id: number;
  text: string;
  onGo: () => void;
  onClose: () => void;
}

export function Toasts({ toasts }: { toasts: Toast[] }) {
  return (
    <>
      {toasts.map(t => (
        <div key={t.id} class="toast" role="status">
          <span class="toast-text">{t.text}</span>
          <button type="button" class="toast-go btn-primary" onClick={blurThen(t.onGo)}>Go</button>
          <button type="button" class="toast-x" aria-label="Dismiss" title="Dismiss" onClick={blurThen(t.onClose)}>×</button>
        </div>
      ))}
    </>
  );
}

/** Draws (or redraws) the stack into #toast-root. */
export function renderToasts(container: Element, toasts: Toast[]): void {
  render(<Toasts toasts={toasts} />, container);
}
