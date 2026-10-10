import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
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
import { KeyHints, OverlayHead, ScrollKeys, useScrollKeep } from './chrome.js?v=ca57235e2d';
export function Scores(p) {
    const form = useRef(null);
    const name = useRef(null);
    // The section scrolls on a short screen; a reload of the list keeps its place.
    useScrollKeep(() => form.current?.parentElement);
    return (_jsxs(KeyHints.Provider, { value: p.keyHint, children: [_jsx(OverlayHead, { titleId: "score-h", title: "Scores", closeId: "report-close", onClose: p.onClose, navId: "nav-report", scrollOnly: true, nav: _jsx(ScrollKeys, { line: true }) }), _jsxs("form", { id: "score-form", class: "seedbox", action: "#", ref: form, style: p.formHidden ? { display: 'none' } : undefined, onSubmit: ev => { ev.preventDefault(); p.onFile(name.current?.value ?? ''); }, children: [_jsx("label", { for: "name-input", children: "Callsign" }), _jsx("input", { id: "name-input", name: "name", type: "text", autocomplete: "off", spellcheck: false, maxLength: 24, placeholder: "e.g. tankity", ref: name }), _jsx("button", { type: "submit", id: "save-score", children: "File report" })] }), _jsx("ol", { id: "scores", class: "scores", children: p.rows !== null && (p.rows.length === 0
                    ? _jsx("li", { children: "No after-action reports filed yet. Be the first legend." })
                    : p.rows.map((r, i) => _jsx("li", { children: r }, i))) }), _jsx("p", { id: "scores-note", class: "hint", children: p.note })] }));
}
/** Draws (or redraws) the scores into their section. */
export function renderScores(container, props) {
    render(_jsx(Scores, { ...props }), container);
}
