import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "preact/jsx-runtime";
/* The field shop: category headings, the free Shell row and a row per item with
 * its Preview and Buy buttons, then the start button (the Ready toggle in a
 * room). The game owns the state (cash, selection, pack count, who is ready) and
 * hands in a finished view of it; this draws it and reports clicks. The veil
 * element (#shop-veil) stays in index.html and the game shows and hides it.
 * Copyright (C) 2026 William Grim
 * SPDX-License-Identifier: GPL-3.0-or-later */
import { render } from 'preact';
import { useLayoutEffect, useRef } from 'preact/hooks';
import { KeyHints, Key, OverlayHead, ScrollKeys } from './chrome.js?v=ca57235e2d';
/** A row's icon, painted when it mounts and again when the arsenal changes
 *  (the game's data can load after the first draw). */
function Icon({ icon, draw, rev }) {
    const canvas = useRef(null);
    const which = icon.kind === 'ammo' ? `ammo:${icon.w}` : `gear:${icon.g}`;
    useLayoutEffect(() => { if (canvas.current)
        draw(canvas.current, icon); }, [which, rev]);
    return _jsx("canvas", { class: "shop-icon", "aria-hidden": "true", ref: canvas });
}
function Name({ name, vals }) {
    return _jsxs("div", { class: "shop-name", children: [`${name} `, _jsx("span", { class: "shop-vals", children: vals })] });
}
function Body({ row, draw, rev }) {
    return (_jsxs(_Fragment, { children: [_jsx(Icon, { icon: row.icon, draw: draw, rev: rev }), _jsxs("div", { class: "shop-item", children: [_jsx(Name, { name: row.name, vals: row.vals }), _jsx("div", { class: "shop-sub", children: row.sub }), _jsx("div", { class: "shop-sub", children: row.sub2 })] })] }));
}
export function Shop(p) {
    const list = useRef(null);
    const shownSel = useRef(-1);
    const scrolled = useRef(0); // where the player left the list
    const sel = p.entries.find((e) => e.kind === 'item' && e.selected)?.index ?? -1;
    // Riding the selection with the keys keeps the highlighted row in view.
    // Redraws that leave it alone (buys, pack counts, room polls) keep the
    // scroll exactly: a row that rewraps would otherwise let the browser's
    // scroll anchoring nudge the list.
    useLayoutEffect(() => {
        const el = list.current;
        if (!el)
            return;
        if (shownSel.current === sel) {
            if (el.scrollTop !== scrolled.current)
                el.scrollTop = scrolled.current;
            return;
        }
        shownSel.current = sel;
        el.querySelector('.sel')?.scrollIntoView({ block: 'nearest' });
        scrolled.current = el.scrollTop;
    });
    const blurThen = (fn) => (ev) => { ev.currentTarget.blur(); fn(); };
    return (_jsx(KeyHints.Provider, { value: p.keyHint, children: _jsxs("div", { class: "card", role: "dialog", "aria-modal": "true", "aria-labelledby": "shop-title", children: [_jsx(OverlayHead, { kicker: "Between rounds", titleId: "shop-title", title: p.title, navId: "nav-shop", nav: _jsxs(_Fragment, { children: [_jsxs("span", { children: [_jsx(Key, { at: "shop:selUp" }), _jsx(Key, { at: "shop:selDown" }), " or ", _jsx(Key, { at: "scroll:lineDown" }), _jsx(Key, { at: "scroll:lineUp" }), " move"] }), _jsxs("span", { children: [_jsx(Key, { at: "shop:qtyDown" }), _jsx(Key, { at: "shop:qtyUp" }), " packs"] }), _jsxs("span", { children: [_jsx(Key, { at: "shop:buy" }), " buy \u00B7 ", _jsx(Key, { at: "shop:preview" }), " preview"] }), _jsx(ScrollKeys, {})] }) }), _jsx("p", { id: "shop-cash", class: "runstats", children: p.cash }), _jsx("ul", { id: "shop-list", class: "scores", ref: list, onScroll: (ev) => { scrolled.current = ev.currentTarget.scrollTop; }, children: p.entries.map(e => {
                        if (e.kind === 'cat')
                            return _jsx("li", { class: "shop-cat", children: e.name }, `cat:${e.name}`);
                        if (e.kind === 'free') {
                            return (_jsxs("li", { class: "shop-free", children: [_jsx(Body, { row: e, draw: p.drawIcon, rev: p.arsenalRev }), _jsx("span", { class: "acts", children: _jsx("button", { type: "button", onClick: blurThen(() => p.onPreview(e.weapon)), children: "Preview" }) })] }, "free"));
                        }
                        return (_jsxs("li", { class: e.selected ? 'sel' : undefined, children: [_jsx(Body, { row: { ...e, name: `${e.index + 1}. ${e.name}` }, draw: p.drawIcon, rev: p.arsenalRev }), _jsxs("span", { class: "acts", children: [e.weapon !== undefined && (_jsxs("button", { type: "button", onClick: blurThen(() => p.onPreview(e.weapon)), children: ["Preview ", _jsx(Key, { at: "shop:preview", bare: true })] })), _jsx("button", { type: "button", disabled: e.disabled, onClick: () => p.onBuy(e.index), children: e.locked ? 'Locked' : _jsxs(_Fragment, { children: [e.qty > 1 ? `Buy ×${e.qty} ` : 'Buy ', _jsx(Key, { at: "shop:buy", bare: true })] }) })] })] }, `item:${e.index}`));
                    }) }), _jsx("p", { id: "shop-ready", class: "runstats", hidden: p.readyLine === null, children: p.readyLine }), _jsx("button", { type: "button", id: "shop-next", class: "btn-primary", "aria-pressed": p.next.pressed, onClick: blurThen(p.onNext), children: p.next.label }), _jsx("button", { type: "button", id: "shop-leave", class: "btn-leave", title: "Leave this game room and go back to the solo hills", hidden: !p.inRoom, onClick: blurThen(p.onLeave), children: "Leave room" })] }) }));
}
/** Draws (or redraws) the shop into its veil. */
export function renderShop(container, props) {
    render(_jsx(Shop, { ...props }), container);
}
