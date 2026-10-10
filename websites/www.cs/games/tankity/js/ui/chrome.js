import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "preact/jsx-runtime";
/* The pieces every overlay shares: a key hint that reads the live key table,
 * and the title bar (title, optional close button, key footer). Components get
 * everything from props and context; none of them reaches into the game's
 * state or the page.
 * Copyright (C) 2026 William Grim
 * SPDX-License-Identifier: GPL-3.0-or-later */
import { createContext } from 'preact';
import { useContext, useLayoutEffect, useRef } from 'preact/hooks';
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
    return (_jsxs("header", { class: "ov-head", children: [_jsxs("div", { class: "ov-title", children: [p.kicker !== undefined && _jsx("p", { class: "kicker", id: p.kickerId, children: p.kicker }), _jsx("h2", { id: p.titleId, children: p.title })] }), p.onClose && (_jsxs("button", { type: "button", class: "ov-x", id: p.closeId, "aria-label": "Close", title: "Close (ESC)", onClick: ev => { ev.currentTarget.blur(); p.onClose?.(); }, children: [_jsx(Key, { at: "global:escape", cls: "key esc-cap" }), _jsx("span", { class: "x-glyph", "aria-hidden": "true", children: "\u00D7" })] })), _jsx("div", { class: "nav-hint ov-keys", id: p.navId, "data-scroll-only": p.scrollOnly ? '' : undefined, children: p.nav })] }));
}
/** The scroll keys that end a key footer: page and half page, and with
 *  `line` the line keys too. */
export function ScrollKeys({ line }) {
    return (_jsxs(_Fragment, { children: [line && _jsxs("span", { class: "scroll-keys", children: [_jsx(Key, { at: "scroll:lineDown" }), "/", _jsx(Key, { at: "scroll:lineUp" }), " line"] }), _jsxs("span", { class: "scroll-keys", children: [_jsx(Key, { at: "scroll:pageUp" }), "/", _jsx(Key, { at: "scroll:pageDown" }), " page"] }), _jsxs("span", { class: "scroll-keys", children: [_jsx(Key, { at: "scroll:halfUp" }), "/", _jsx(Key, { at: "scroll:halfDown" }), " half page"] })] }));
}
/** A click handler that drops the button's focus first (so a key press never
 *  re-triggers it), then calls `fn`. */
export function blurThen(fn) {
    return (ev) => { ev.currentTarget.blur(); fn(); };
}
/** Keeps a scrolled panel where the player left it. Preact updates rows in
 *  place, and where a row can change height the browser's scroll anchoring may
 *  nudge the panel (it does on Linux fonts). So the hook remembers the scroll
 *  and puts it back after every redraw, except one where `moved` changed (a
 *  selection or cursor the component scrolled into view itself): that scroll
 *  stands and becomes the new one to keep. `target` names the scrolling
 *  element, which may sit outside the component (the veil or overlay it fills). */
export function useScrollKeep(target, moved = 0) {
    const scrolled = useRef(0);
    const seen = useRef(moved);
    const drawn = useRef(false);
    useLayoutEffect(() => {
        const el = target();
        if (!el)
            return undefined;
        const onScroll = () => { scrolled.current = el.scrollTop; };
        el.addEventListener('scroll', onScroll);
        return () => el.removeEventListener('scroll', onScroll);
    }, []);
    useLayoutEffect(() => {
        const el = target();
        if (!el)
            return;
        // A closed panel has no scroll, and the browser starts it at the top when
        // it reopens: there is nothing to keep.
        if (el.hidden) {
            seen.current = moved;
            scrolled.current = 0;
        }
        else if (!drawn.current || seen.current !== moved) {
            seen.current = moved;
            scrolled.current = el.scrollTop;
        }
        else if (el.scrollTop !== scrolled.current) {
            el.scrollTop = scrolled.current;
        }
        drawn.current = true;
    });
}
