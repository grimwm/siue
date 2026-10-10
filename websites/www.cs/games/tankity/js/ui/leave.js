import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
/* The leave-room question: asked in the page (never with a browser dialog)
 * before the player walks out of a running room match. The game says what to
 * ask and what each answer does; ESC, handled by the game, means stay. The
 * veil (#leave-veil) stays in index.html and the game shows and hides it.
 * Copyright (C) 2026 William Grim
 * SPDX-License-Identifier: GPL-3.0-or-later */
import { render } from 'preact';
import { Key, KeyHints, blurThen } from './chrome.js?v=ca57235e2d';
export function Leave(p) {
    return (_jsx(KeyHints.Provider, { value: p.keyHint, children: _jsxs("div", { class: "card", role: "alertdialog", "aria-modal": "true", "aria-labelledby": "leave-title", "aria-describedby": "leave-text", children: [_jsx("header", { class: "ov-head", children: _jsxs("div", { class: "ov-title", children: [_jsx("p", { class: "kicker", children: "Heads up" }), _jsx("h2", { id: "leave-title", children: p.title })] }) }), _jsx("p", { id: "leave-text", children: p.text }), _jsxs("div", { class: "acts", children: [_jsxs("button", { type: "button", id: "leave-stay", class: "btn-primary", onClick: blurThen(p.onStay), children: ["Stay in the match ", _jsx(Key, { at: "global:escape", cls: "key esc-cap" })] }), _jsx("button", { type: "button", id: "leave-go", class: "btn-leave", onClick: blurThen(p.onLeave), children: "Leave room" })] })] }) }));
}
/** Draws (or redraws) the question into its veil. */
export function renderLeave(container, props) {
    render(_jsx(Leave, { ...props }), container);
}
