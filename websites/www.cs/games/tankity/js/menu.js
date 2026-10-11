import { drawUnitIcon } from './ui/icons.js?v=b8eec86a1f';
import { renderMenu as drawMenu } from './ui/menu.js?v=6ebee3dc2d';
export function createMenu(deps) {
    const { G, $, net, sfx, unlock, isSoundMuted, isMusicMuted, keyHint, myTank, netLeave, openLeaveVeil, openRooms, placeLogBelowMenu, randomRun, freshMatchFromSeedBox, toggleFullscreen, toggleMusic, toggleOverlay, toggleSound, tutorialOpen, } = deps;
    /* Ground units: every human (you, and the people in a room) picks a body.
       Bodies are looks only; all share the turret pivot at (0, -12), so aim,
       muzzle and shots are identical whichever one you drive. */
    const UNIT_BODIES = [
        { key: 'tank', name: 'Tank' },
        { key: 'hover', name: 'Hover' },
        { key: 'walker', name: 'Walker' },
        { key: 'buggy', name: 'Buggy' },
    ];
    /* The unit picker in the Game menu: one button per body, each with a small
       drawing of it. The choice is remembered and, in a room, shared. */
    function loadBody() {
        try {
            const b = window.localStorage.getItem('tankity-body');
            if (UNIT_BODIES.some(u => u.key === b))
                return b;
        }
        catch (_) { /* storage off: default body */ }
        return 'tank';
    }
    function chooseBody(key) {
        if (!UNIT_BODIES.some(u => u.key === key))
            return;
        G.body = key;
        try {
            window.localStorage.setItem('tankity-body', key);
        }
        catch (_) { /* fine */ }
        const mine = net.on ? myTank() : (G.tanks || []).find(t => t.isPlayer);
        if (mine)
            mine.body = key;
        net.sendBody(key);
        renderMenu();
    }
    /* Text size: a menu setting kept in this browser. It scales every panel
       (they size in rem) and the name tags over the units. */
    const TEXT_SIZES = [
        { key: 's', name: 'Small', scale: 0.9 },
        { key: 'm', name: 'Normal', scale: 1 },
        { key: 'l', name: 'Large', scale: 1.15 },
        { key: 'xl', name: 'Huge', scale: 1.3 },
    ];
    let TEXT_SIZE = 'm';
    function textScale() {
        return (TEXT_SIZES.find(t => t.key === TEXT_SIZE) || TEXT_SIZES[1]).scale;
    }
    function loadTextSize() {
        let key = 'm';
        try {
            key = window.localStorage.getItem('tankity-text') || 'm';
        }
        catch (_) { /* no storage: default */ }
        applyTextSize(TEXT_SIZES.some(t => t.key === key) ? key : 'm');
    }
    function applyTextSize(key) {
        TEXT_SIZE = key;
        if (document.documentElement && document.documentElement.style) {
            document.documentElement.style.fontSize = `${textScale() * 100}%`;
        }
        renderMenu();
        placeLogBelowMenu();
    }
    function chooseTextSize(key) {
        if (!TEXT_SIZES.some(t => t.key === key))
            return;
        try {
            window.localStorage.setItem('tankity-text', key);
        }
        catch (_) { /* fine */ }
        applyTextSize(key);
        sfx.play('click');
    }
    /* The game menu is a Preact component (src/ui/menu.tsx): it gets what it shows
       (the unit, the text size, what is muted, whether a room runs) and reports
       clicks. The seed box stays the page's own. */
    function renderMenu() {
        const section = $('menu-overlay');
        if (!section)
            return;
        drawMenu(section, {
            keyHint,
            onClose: () => toggleOverlay('menu-overlay', 'btn-menu'),
            onNewGame: () => { unlock(); sfx.play('click'); freshMatchFromSeedBox(); },
            onSubmit: () => {
                if (net.on) {
                    netLeave();
                    return;
                }
                sfx.play('click');
                freshMatchFromSeedBox();
            },
            units: UNIT_BODIES,
            unit: G.body,
            drawUnit: drawUnitIcon,
            onPickUnit: chooseBody,
            sizes: TEXT_SIZES,
            size: TEXT_SIZE,
            onPickSize: chooseTextSize,
            sound: !isSoundMuted(),
            music: !isMusicMuted(),
            fullscreen: !!document.fullscreenElement,
            onSound: toggleSound,
            onMusic: toggleMusic,
            onFullscreen: toggleFullscreen,
            onRandom: randomRun,
            onRooms: openRooms,
            onTutorial: () => { sfx.play('click'); tutorialOpen(); },
            onScores: () => toggleOverlay('report-overlay', 'scores-open'),
            inRoom: net.on,
            onLeave: openLeaveVeil,
        });
    }
    return { loadBody, loadTextSize, textScale, renderMenu };
}
