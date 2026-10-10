import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
/* The tutorial coach: the current move, the progress line and the Skip button.
 * The game owns the lesson (which step the player is on, the step's text with
 * the live key names filled in) and hands in the finished lines; this draws them
 * and reports Skip. The section element (#tutorial-overlay) stays in index.html
 * and the game shows and hides it.
 * Copyright (C) 2026 William Grim
 * SPDX-License-Identifier: GPL-3.0-or-later */
import { render } from 'preact';
import { KeyHints, Key, blurThen } from './chrome.js?v=9889c2cdd5';
export function Tutorial(p) {
    return (_jsxs(KeyHints.Provider, { value: p.keyHint, children: [_jsx("h2", { id: "tutorial-h", children: "Tutorial" }), _jsx("p", { id: "tutorial-text", children: p.text }), _jsx("p", { class: "hint", id: "tutorial-progress", children: p.progress }), _jsx("button", { type: "button", id: "tutorial-skip", onClick: blurThen(p.onSkip), children: p.skip }), _jsxs("p", { class: "nav-hint", id: "nav-tutorial", children: [_jsx(Key, { at: "global:tutorial" }), " replays anytime; skipping once skips it for good"] })] }));
}
/** Draws (or redraws) the tutorial coach into its section. */
export function renderTutorial(container, props) {
    render(_jsx(Tutorial, { ...props }), container);
}
