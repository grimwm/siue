import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "preact/jsx-runtime";
/* The status bar over the battlefield: turn, angle, power, fuel, the loaded gun,
 * armor, lives, score, the room-server dot and (for a screen reader) the wind
 * and the run line. The game owns every number and hands in finished text; this
 * draws it, and reports a tap on the gun. The element (.hudbar) stays in
 * index.html. The game redraws only when a value changed, since it asks every
 * frame.
 * Copyright (C) 2026 William Grim
 * SPDX-License-Identifier: GPL-3.0-or-later */
import { render } from 'preact';
import { useLayoutEffect, useRef } from 'preact/hooks';
function Chip({ weapon, draw, rev }) {
    const canvas = useRef(null);
    useLayoutEffect(() => { if (canvas.current)
        draw(canvas.current, weapon.key); }, [weapon.key, rev]);
    return (_jsxs("span", { class: "chip", children: [_jsx("canvas", { class: "chip-icon", "aria-hidden": "true", ref: canvas }), weapon.text, weapon.sr && _jsx("span", { class: "sr-only", children: weapon.sr })] }));
}
export function Hud(p) {
    return (_jsxs(_Fragment, { children: [_jsxs("dl", { class: "hud", children: [_jsxs("div", { class: "sr-only", children: [_jsx("dt", { children: "Turn" }), _jsx("dd", { id: "hud-turn", "aria-live": "polite", children: p.turn })] }), _jsxs("div", { children: [_jsx("dt", { children: "Angle" }), _jsx("dd", { id: "hud-angle", children: p.angle })] }), _jsxs("div", { children: [_jsx("dt", { children: "Power" }), _jsx("dd", { id: "hud-power", children: p.power })] }), _jsxs("div", { children: [_jsx("dt", { children: "Fuel" }), _jsx("dd", { id: "hud-fuel", children: p.fuel })] }), _jsxs("div", { class: "hud-gun", children: [_jsx("dt", { class: "sr-only", children: "Weapon" }), _jsx("dd", { id: "hud-weapon", title: "Pick a weapon", onClick: p.onWeapon, children: p.weapon ? _jsx(Chip, { weapon: p.weapon, draw: p.drawIcon, rev: p.arsenalRev }) : '-' })] }), _jsxs("div", { children: [_jsx("dt", { children: "Armor" }), _jsxs("dd", { id: "hud-armor", children: [p.armor.shown, p.armor.sr && _jsx("span", { class: "sr-only", children: ` ${p.armor.sr}` })] })] }), _jsxs("div", { class: "hud-lives", children: [_jsx("dt", { class: "sr-only", children: "Lives" }), _jsx("dd", { id: "hud-lives", title: p.lives.title || undefined, "aria-label": p.lives.title || undefined, children: p.lives.text })] }), _jsxs("div", { class: "hud-score", children: [_jsx("dt", { class: "sr-only", children: "Score" }), _jsx("dd", { id: "hud-score", title: p.score.title || undefined, children: p.score.text })] }), _jsxs("div", { class: "sr-only", children: [_jsx("dt", { children: "Wind" }), _jsx("dd", { id: "hud-wind", children: p.wind })] }), _jsxs("div", { class: "hud-net", children: [_jsx("dt", { class: "sr-only", children: "Server" }), _jsxs("dd", { children: [_jsx("span", { id: "hud-dot", class: `dot ${p.online ? 'on' : 'off'}`, title: p.online ? 'room server: connected' : 'room server: not connected' }), _jsx("span", { id: "hud-server", class: "sr-only", children: p.online ? 'online' : 'offline' })] })] })] }), _jsx("p", { id: "run-stats", class: "runstats", children: p.runStats })] }));
}
/** Draws (or redraws) the status bar into its element. */
export function renderHud(container, props) {
    render(_jsx(Hud, { ...props }), container);
}
