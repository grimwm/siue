import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
/* The radio log: the battle's one-line news, newest at the bottom. The game
 * owns the lines (it trims them at its cap) and hands in the whole list; this
 * draws it and keeps the newest line in view. The section element
 * (#log-overlay) stays in index.html and the game shows and hides it.
 * Copyright (C) 2026 William Grim
 * SPDX-License-Identifier: GPL-3.0-or-later */
import { render } from 'preact';
import { useLayoutEffect, useRef } from 'preact/hooks';
import { KeyHints, OverlayHead, ScrollKeys, useScrollKeep } from './chrome.js?v=ca57235e2d';
export function Log(p) {
    const list = useRef(null);
    const newest = p.lines.length ? p.lines[p.lines.length - 1].id : 0;
    // A new line scrolls the panel to the bottom. Any other redraw (the keys
    // changing) leaves a reader who scrolled up where they were.
    useLayoutEffect(() => {
        const overlay = list.current?.parentElement;
        if (overlay)
            overlay.scrollTop = overlay.scrollHeight;
    }, [newest]);
    useScrollKeep(() => list.current?.parentElement, newest);
    return (_jsxs(KeyHints.Provider, { value: p.keyHint, children: [_jsx(OverlayHead, { titleId: "log-h", title: "Radio log", closeId: "log-close", onClose: p.onClose, navId: "nav-log", scrollOnly: true, nav: _jsx(ScrollKeys, { line: true }) }), _jsx("ol", { id: "log", class: "log log-transparent", "aria-live": "polite", ref: list, children: p.lines.map(l => _jsx("li", { class: l.tone, children: l.text }, l.id)) })] }));
}
/** Draws (or redraws) the log into its section. */
export function renderLog(container, props) {
    render(_jsx(Log, { ...props }), container);
}
