import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
/* The game rooms lobby: the intro, the host and join forms with the hills
 * picker, and once in a room the code, invite link, seat grid and Start. The
 * game owns the state (the room, the status line, the picked hills) and hands
 * in a finished view of it; this draws it and reports what the player did. The
 * veil element (#lobby-veil) stays in index.html and the game shows and hides it.
 * The initials and room-code boxes are the one thing the page keeps: what the
 * player typed lives in the input, and is handed over on submit.
 * Copyright (C) 2026 William Grim
 * SPDX-License-Identifier: GPL-3.0-or-later */
import { render } from 'preact';
import { useLayoutEffect, useRef } from 'preact/hooks';
import { KeyHints, OverlayHead, ScrollKeys, blurThen, useScrollKeep } from './chrome.js?v=9889c2cdd5';
function MapTile({ map, pressed, draw, rev, onPick }) {
    const canvas = useRef(null);
    useLayoutEffect(() => { if (canvas.current)
        draw(canvas.current, map.id ? map.profile ?? null : null); }, [map.id, rev]);
    return (_jsxs("button", { type: "button", class: "unit-choice map-choice", "aria-pressed": pressed, "data-map": map.id, title: map.name, onClick: blurThen(() => onPick(map.id)), children: [_jsx("canvas", { class: "map-icon", "aria-hidden": "true", ref: canvas }), _jsx("span", { children: map.name })] }));
}
function SeatTile({ seat, index, mySeat, isHost, onMode }) {
    const human = seat.human;
    const open = !human && seat.mode === 'open';
    // The host flips a drone or open seat; every other tile is for looking.
    const flips = isHost && !human;
    const big = human ? String(seat.name || '').toUpperCase() : (open ? 'Open' : 'AI');
    let cap;
    if (human)
        cap = (index === mySeat ? 'You' : 'Player') + (index === 0 ? ' · host' : '');
    else if (flips)
        cap = open ? 'Tap for AI' : 'Tap for Open';
    else
        cap = open ? 'Nobody' : 'Drone';
    return (_jsxs("button", { type: "button", class: `unit-choice seat-tile${open ? ' seat-open' : ''}${flips ? '' : ' seat-fixed'}`, "data-seat": String(index), "data-mode": human ? 'human' : (open ? 'open' : 'ai'), "aria-disabled": flips ? undefined : 'true', title: human ? `Seat ${index + 1}` : (open ? 'Open seat: no tank' : 'Drone battery seat'), onClick: flips ? blurThen(() => onMode(index, open ? 'ai' : 'open')) : undefined, children: [_jsx("span", { class: "seat-name", children: big }), _jsx("span", { class: "seat-cap", children: cap })] }));
}
export function Lobby(p) {
    const card = useRef(null);
    const hostInitials = useRef(null);
    const joinCode = useRef(null);
    const joinInitials = useRef(null);
    // An invite link fills the code once; the player may then retype it.
    useLayoutEffect(() => { if (p.prefillCode && joinCode.current)
        joinCode.current.value = p.prefillCode; }, [p.prefillCode]);
    // The veil scrolls; keep it where the player left it across redraws.
    useScrollKeep(() => card.current?.parentElement);
    return (_jsx(KeyHints.Provider, { value: p.keyHint, children: _jsxs("div", { class: "card", role: "dialog", "aria-modal": "true", "aria-labelledby": "lobby-title", ref: card, children: [_jsx(OverlayHead, { kicker: "Squad up, no chatter", titleId: "lobby-title", title: "Game rooms", closeId: "lobby-close", onClose: p.onClose, navId: "nav-lobby", scrollOnly: true, nav: _jsx(ScrollKeys, { line: true }) }), _jsx("p", { class: "hint", id: "lobby-intro", hidden: p.inRoom, children: "Host a room and read the 4-letter code to your friends, or join theirs. Everyone picks 3-letter initials (kept clean, lowercase is fine). There is no chat, only artillery. Empty seats go to the drone battery, and a quiet crew fires on its own after a while so no room ever stalls. The host may also pick named hills, like Canyon 3, so the crew can replay a favorite without ever seeing its seed." }), _jsxs("p", { class: "hint", children: [_jsx("span", { id: "net-dot", class: `dot ${p.online ? 'on' : 'off'}`, title: p.online ? 'room server: connected' : 'room server: not connected' }), ' ', _jsx("span", { id: "lobby-count", "aria-live": "polite", children: p.count })] }), _jsxs("div", { class: "lobby-rows", id: "lobby-rows", hidden: p.inRoom, children: [_jsxs("form", { id: "host-form", class: "lobby-form", action: "#", onSubmit: ev => { ev.preventDefault(); p.onHost(hostInitials.current?.value ?? ''); }, children: [_jsx("span", { class: "map-label", id: "lobby-map-label", children: "Hills" }), _jsx("input", { type: "hidden", id: "lobby-map", name: "map", value: p.mapId }), _jsx("div", { class: "unit-picker map-picker", id: "lobby-map-picker", role: "group", "aria-labelledby": "lobby-map-label", children: p.maps.map(m => (_jsx(MapTile, { map: m, pressed: p.mapId === m.id, draw: p.drawMapIcon, rev: p.mapsRev, onPick: p.onPickMap }, m.id))) }), _jsx("label", { for: "host-initials", children: "Your initials" }), _jsx("input", { id: "host-initials", name: "initials", type: "text", autocomplete: "off", spellcheck: false, maxLength: 3, minLength: 3, placeholder: "ABC", ref: hostInitials }), _jsx("button", { type: "submit", id: "host-go", class: "btn-primary", children: "Host a room" })] }), _jsxs("form", { id: "join-form", class: "lobby-form", action: "#", onSubmit: ev => { ev.preventDefault(); p.onJoin(joinCode.current?.value ?? '', joinInitials.current?.value ?? ''); }, children: [_jsx("label", { for: "join-code", children: "Room code" }), _jsx("input", { id: "join-code", name: "code", type: "text", autocomplete: "off", spellcheck: false, maxLength: 4, minLength: 4, placeholder: "7K2Q", ref: joinCode }), _jsx("label", { for: "join-initials", children: "Your initials" }), _jsx("input", { id: "join-initials", name: "initials", type: "text", autocomplete: "off", spellcheck: false, maxLength: 3, minLength: 3, placeholder: "ZED", ref: joinInitials }), _jsx("button", { type: "submit", id: "join-go", class: "btn-primary", children: "Join room" })] })] }), _jsx("p", { id: "lobby-status", class: "hint", "aria-live": "polite", children: p.status }), _jsxs("div", { id: "lobby-room", hidden: !p.inRoom, children: [_jsx("p", { class: "room-code", id: "lobby-code", children: p.code || '····' }), _jsx("p", { class: "hint", children: "Read this code to your friends, or send them the invite link. First seat hosts and starts the match." }), _jsxs("p", { class: "invite-row", children: [_jsx("input", { id: "join-link", type: "text", readOnly: true, "aria-label": "Invite link", value: p.link }), _jsxs("button", { type: "button", id: "copy-link", title: "Copy invite link", onClick: blurThen(p.onCopy), children: [_jsxs("svg", { class: "lucide lucide-copy", xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true", children: [_jsx("rect", { width: "14", height: "14", x: "8", y: "8", rx: "2", ry: "2" }), _jsx("path", { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" })] }), _jsx("span", { children: "Copy invite" })] })] }), _jsx("p", { class: "hint", id: "lobby-hills", children: p.hills }), _jsxs("div", { class: "unit-row", role: "group", "aria-labelledby": "seats-label", children: [_jsx("span", { class: "unit-label", id: "seats-label", children: "Seats" }), _jsx("div", { class: "unit-picker seat-grid", id: "lobby-seats", children: p.seats.map((s, i) => (_jsx(SeatTile, { seat: s, index: i, mySeat: p.mySeat, isHost: p.isHost, onMode: p.onSeatMode }, i))) })] }), _jsx("p", { class: "hint", id: "seats-hint", children: p.seatsHint }), _jsxs("div", { class: "acts", children: [_jsx("button", { type: "button", id: "lobby-start", class: "btn-primary", style: p.isHost ? undefined : { display: 'none' }, onClick: blurThen(p.onStart), children: "Start match" }), _jsx("button", { type: "button", id: "lobby-leave", onClick: blurThen(p.onLeave), children: "Leave room" })] })] })] }) }));
}
/** Draws (or redraws) the lobby into its veil. */
export function renderLobby(container, props) {
    render(_jsx(Lobby, { ...props }), container);
}
