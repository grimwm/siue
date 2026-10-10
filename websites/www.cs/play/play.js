"use strict";
// The site's wrapper around a game (see play.css), compiled from
// src/play/play.ts by tools/ts-build.mjs. The game runs in the
// frame untouched; this only hands it the address's query and hash (room
// invites ride on ?code=) and gives it the keyboard.
(function () {
    const frame = document.getElementById('play-frame');
    if (!frame)
        return;
    if (location.search || location.hash) {
        const url = new URL(frame.getAttribute('src') ?? '', location.href);
        url.search = location.search;
        url.hash = location.hash;
        frame.src = url.href;
    }
    const focusGame = () => {
        try {
            frame.contentWindow.focus();
        }
        catch (_) {
            frame.focus();
        }
    };
    frame.addEventListener('load', focusGame);
    focusGame();
})();
