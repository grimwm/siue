import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "preact/jsx-runtime";
/* The weapon picker: every gun on the rack as a tile, four across. The game
 * owns the rack, the loaded gun and the cursor and hands in a finished view of
 * them; this draws it and reports a pick. The section element (#gun-overlay)
 * stays in index.html and the game shows and hides it.
 * Copyright (C) 2026 William Grim
 * SPDX-License-Identifier: GPL-3.0-or-later */
import { render } from 'preact';
import { useLayoutEffect, useRef } from 'preact/hooks';
import { KeyHints, Key, OverlayHead, blurThen, useScrollKeep } from './chrome.js?v=ca57235e2d';
function Tile({ tile, index, cursor, draw, rev, onPick }) {
    const canvas = useRef(null);
    useLayoutEffect(() => { if (canvas.current)
        draw(canvas.current, tile.key); }, [tile.key, rev]);
    return (_jsxs("button", { type: "button", class: `unit-choice gun-choice${cursor ? ' cursor' : ''}`, "aria-pressed": tile.loaded, title: tile.title, onClick: blurThen(() => onPick(tile.key)), children: [_jsx("canvas", { "aria-hidden": "true", ref: canvas }), _jsx("span", { children: `${index < 9 ? `${index + 1}. ` : ''}${tile.name}` }), _jsx("span", { class: "gun-count", children: tile.count })] }));
}
export function Guns(p) {
    const grid = useRef(null);
    // The cursor stays in view as the keys move it. Redraws that leave it alone
    // (a gun loaded, the rack changing) keep the scroll where the player left it.
    useLayoutEffect(() => { grid.current?.querySelector('.cursor')?.scrollIntoView({ block: 'nearest' }); }, [p.cursor]);
    useScrollKeep(() => grid.current?.parentElement, p.cursor);
    return (_jsxs(KeyHints.Provider, { value: p.keyHint, children: [_jsx(OverlayHead, { titleId: "gun-h", title: "Weapons", closeId: "gun-close", onClose: p.onClose, navId: "nav-gun", nav: _jsxs(_Fragment, { children: [_jsxs("span", { children: [_jsx(Key, { at: "aim:barrelLeft" }), _jsx(Key, { at: "aim:barrelRight" }), _jsx(Key, { at: "shop:selUp" }), _jsx(Key, { at: "shop:selDown" }), " or ", _jsx(Key, { at: "scroll:lineDown" }), _jsx(Key, { at: "scroll:lineUp" }), " move"] }), _jsxs("span", { children: [_jsx(Key, { at: "shop:buy:1" }), " loads"] }), _jsx("span", { children: "1-9 load that tile" })] }) }), _jsx("div", { id: "gun-grid", class: "gun-grid", role: "group", "aria-label": "Weapons you own", ref: grid, children: p.tiles.map((t, i) => (_jsx(Tile, { tile: t, index: i, cursor: i === p.cursor, draw: p.drawIcon, rev: p.arsenalRev, onPick: p.onPick }, t.key))) })] }));
}
/** Draws (or redraws) the weapon picker into its section. */
export function renderGuns(container, props) {
    render(_jsx(Guns, { ...props }), container);
}
