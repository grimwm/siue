import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "preact/jsx-runtime";
/* The pieces every overlay shares: a key hint that reads the live key table,
 * and the title bar (title, optional close button, key footer). Components get
 * everything from props and context; none of them reaches into the game's
 * state or the page.
 * Copyright (C) 2026 William Grim
 * SPDX-License-Identifier: GPL-3.0-or-later */
import { createContext } from 'preact';
import { useContext } from 'preact/hooks';
/** A root component provides the page's key table to every Key below it. */
export const KeyHints = createContext(() => '');
/** A live key label. `at` is "context:action" or "context:action:n". A bare
 *  one is the "(B)" cap on a button (class `key`, which touch screens hide
 *  centrally); otherwise it is the plain key name inside a sentence, or a cap
 *  with its own classes (`cls`, as on the close button's ESC). */
export function Key({ at, bare, cls }) {
    const hint = useContext(KeyHints);
    const [ctx = '', action = '', idx] = at.split(':');
    const cap = hint(ctx, action, Number(idx ?? 0));
    return (_jsx("span", { class: bare ? 'key' : cls, "data-keyhint": at, children: cap ? (bare ? `(${cap})` : cap) : '' }));
}
/** Title bar: title left, key hints centre, × right, on the grid in game.css. */
export function OverlayHead(p) {
    return (_jsxs("header", { class: "ov-head", children: [_jsxs("div", { class: "ov-title", children: [p.kicker !== undefined && _jsx("p", { class: "kicker", children: p.kicker }), _jsx("h2", { id: p.titleId, children: p.title })] }), p.onClose && (_jsxs("button", { type: "button", class: "ov-x", id: p.closeId, "aria-label": "Close", title: "Close (ESC)", onClick: ev => { ev.currentTarget.blur(); p.onClose?.(); }, children: [_jsx(Key, { at: "global:escape", cls: "key esc-cap" }), _jsx("span", { class: "x-glyph", "aria-hidden": "true", children: "\u00D7" })] })), _jsx("div", { class: "nav-hint ov-keys", id: p.navId, "data-scroll-only": p.scrollOnly ? '' : undefined, children: p.nav })] }));
}
/** The scroll keys that end a key footer: page and half page, and with
 *  `line` the line keys too. */
export function ScrollKeys({ line }) {
    return (_jsxs(_Fragment, { children: [line && _jsxs("span", { class: "scroll-keys", children: [_jsx(Key, { at: "scroll:lineDown" }), "/", _jsx(Key, { at: "scroll:lineUp" }), " line"] }), _jsxs("span", { class: "scroll-keys", children: [_jsx(Key, { at: "scroll:pageUp" }), "/", _jsx(Key, { at: "scroll:pageDown" }), " page"] }), _jsxs("span", { class: "scroll-keys", children: [_jsx(Key, { at: "scroll:halfUp" }), "/", _jsx(Key, { at: "scroll:halfDown" }), " half page"] })] }));
}
