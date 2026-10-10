import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "preact/jsx-runtime";
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
import { Key, KeyHints, OverlayHead, ScrollKeys, blurThen, useScrollKeep } from './chrome.js?v=ca57235e2d';
export function EndVeil(p) {
    const card = useRef(null);
    const name = useRef(null);
    // The veil scrolls on a short screen; a redraw keeps its place.
    useScrollKeep(() => card.current?.parentElement);
    useLayoutEffect(() => {
        const el = name.current;
        if (el && !el.value)
            el.value = p.callsign;
    });
    return (_jsx(KeyHints.Provider, { value: p.keyHint, children: _jsxs("div", { class: "card", role: "dialog", "aria-modal": "true", "aria-labelledby": "end-title", ref: card, children: [_jsx(OverlayHead, { kicker: p.kicker, kickerId: "end-kicker", titleId: "end-title", title: p.title, navId: "nav-end", scrollOnly: true, nav: _jsx(ScrollKeys, { line: true }) }), _jsx("p", { id: "end-text", children: p.text }), _jsx("p", { id: "end-score", class: "runstats", children: p.score }), _jsx("button", { type: "button", id: "rematch", hidden: p.rematch === null, onClick: blurThen(p.onRematch), children: p.rematch ?? '' }), _jsxs("form", { id: "end-score-form", class: "seedbox", action: "#", hidden: p.formHidden, onSubmit: ev => { ev.preventDefault(); p.onFile(name.current?.value ?? ''); }, children: [_jsx("label", { for: "end-name", children: "Callsign" }), _jsx("input", { id: "end-name", name: "name", type: "text", autocomplete: "off", spellcheck: false, maxLength: 24, placeholder: "e.g. tankity", ref: name }), _jsx("button", { type: "submit", disabled: p.filed, children: p.filed ? 'Filed' : 'File score' })] }), _jsx("button", { type: "button", id: "again", class: "btn-primary", onClick: blurThen(p.onAgain), children: p.backToRooms ? 'Back to rooms' : _jsxs(_Fragment, { children: ["Play again ", _jsx(Key, { at: "global:new", bare: true })] }) })] }) }));
}
/** Draws (or redraws) the end veil into its element. */
export function renderEndVeil(container, props) {
    render(_jsx(EndVeil, { ...props }), container);
}
