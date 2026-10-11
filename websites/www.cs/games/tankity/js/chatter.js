import { renderLog as drawLog } from './ui/log.js?v=7bec951a92';
/* ---------- dialogue: subtitled trash-talk, kid-friendly ---------- */
export const SPEAKERS = {
    tank: { name: 'TANK', color: '#ffff00' },
    reaper: { name: 'REAPER', color: '#ff0000' },
    wraith: { name: 'WRAITH', color: '#00ffff' },
    spotter: { name: 'SPOTTER', color: '#ff00ff' },
};
export const TANK_FIRE = ['bam bam!', 'tankity tank! Eat dirt!', 'Fire in the hole!'];
export const TANK_HIT = ['Bullseye! Did you see that?', 'Ha! Right in the rotors!'];
export const TANK_MISS = ['The wind! Blame the wind!', 'Ranging shot. Next one counts.'];
export const TANK_OWS = ['Ow! My fender!', 'Hey! I just waxed that!'];
export const FOE_FIRE = {
    reaper: ['Eat my lance, bumper-brain!', 'Hold still, tin can!'],
    wraith: ['From above, with love!', 'Phased and loaded!'],
    spotter: ['Solution locked. Goodbye!', 'I did the math. You lose.'],
};
export const FOE_HIT = {
    reaper: ['Ha! Bumper soup!', 'Direct hit, baby!'],
    wraith: ['Gotcha between the hills!', 'Bullseye from the blue!'],
    spotter: ['Predicted! Predictable!', 'Told you I solved it!'],
};
export const FOE_MISS = ['Grr! Recalibrating...', 'Must be the wind. Definitely the wind.'];
export const FOE_DYING = {
    reaper: 'Tell my... targeting computer...',
    wraith: 'Fading... to periwinkle...',
    spotter: 'My calculations... were perfect...',
};
export const TANK_IDLE = ['tankity tank! Still shiny!', 'Reading the wind like a novel.', 'Anyone else smell victory? Bit dusty.'];
export const FOE_IDLE = [
    ['reaper', 'You aim like a shopping cart!'],
    ['wraith', 'Boo! The hills themselves fear me!'],
    ['spotter', 'I have simulated this duel. You lose 87% of them.'],
];
export function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
export function drawPortrait(cv, id) {
    if (!cv)
        return;
    const c = cv.getContext('2d');
    if (!c)
        return;
    c.clearRect(0, 0, 36, 36);
    c.fillStyle = '#00000b';
    c.fillRect(0, 0, 36, 36);
    if (id === 'tank') {
        c.fillStyle = '#101208';
        c.fillRect(4, 24, 28, 7);
        c.fillStyle = '#d7a800';
        c.beginPath();
        c.roundRect(6, 14, 20, 12, 4);
        c.fill();
        c.fillStyle = '#ffff00';
        c.beginPath();
        c.arc(15, 18, 6, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = '#1a1a00';
        c.fillRect(19, 16.5, 12, 4);
    }
    else {
        const col = (SPEAKERS[id] && SPEAKERS[id].color) || '#fff';
        c.strokeStyle = '#2b2e36';
        c.lineWidth = 3;
        for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
            c.beginPath();
            c.moveTo(18, 18);
            c.lineTo(18 + sx * 10, 18 + sy * 10);
            c.stroke();
            c.fillStyle = 'rgba(225,232,245,0.5)';
            c.beginPath();
            c.ellipse(18 + sx * 10, 18 + sy * 10, 5, 1.6, 0, 0, Math.PI * 2);
            c.fill();
        }
        c.fillStyle = '#24242e';
        c.beginPath();
        c.roundRect(11, 12, 14, 12, 5);
        c.fill();
        c.strokeStyle = col;
        c.lineWidth = 2;
        c.beginPath();
        c.roundRect(11, 12, 14, 12, 5);
        c.stroke();
        c.fillStyle = '#ffffff';
        c.beginPath();
        c.arc(18, 18, 3, 0, Math.PI * 2);
        c.fill();
    }
}
export function createChatter(deps) {
    const { G, $, keyHint, toggleOverlay, refreshNavHints, placeLogBelowMenu } = deps;
    function talk(id, text, force) {
        if (!SPEAKERS[id])
            return;
        if (!force && G.time - (G.lastTalk || -99) < 3)
            return;
        if (G.dlgQ.length >= 3 && !force)
            return;
        if (force && G.dlgQ.length >= 3)
            G.dlgQ.shift();
        G.dlgQ.push({ id, text });
        G.lastTalk = G.time;
    }
    function exchange(aId, aText, bId, bText) {
        talk(aId, aText, true);
        talk(bId, bText, true);
    }
    function showDialogue(line) {
        const box = document.getElementById('dialogue');
        if (!box)
            return;
        drawPortrait(document.getElementById('portrait'), line.id);
        const nm = document.getElementById('dlg-name');
        if (nm) {
            nm.textContent = SPEAKERS[line.id].name;
            nm.style.color = SPEAKERS[line.id].color;
        }
        const tx = document.getElementById('dlg-line');
        if (tx)
            tx.textContent = line.text;
        placeLogBelowMenu(); // the status bar may have grown
        box.hidden = false;
    }
    function pumpDialogue(dt) {
        if (G.dlgT > 0) {
            G.dlgT -= dt;
            if (G.dlgT <= 0) {
                const box = document.getElementById('dialogue');
                if (box)
                    box.hidden = true;
            }
            return;
        }
        if (G.dlgQ.length) {
            showDialogue(G.dlgQ.shift());
            G.dlgT = 2.8;
        }
    }
    /* The radio log is a Preact component (src/ui/log.tsx); the game keeps the
       lines, trims them at the cap and redraws. */
    const LOG_CAP = 80;
    let logLines = [];
    let logSeq = 0;
    function say(text, tone) {
        if (!$('log-overlay'))
            return;
        logLines = [...logLines, { id: ++logSeq, text, tone }].slice(-LOG_CAP);
        renderLogOverlay();
        refreshNavHints();
    }
    function renderLogOverlay() {
        const section = $('log-overlay');
        if (section)
            drawLog(section, { keyHint, onClose: () => toggleOverlay('log-overlay', 'btn-log'), lines: logLines });
    }
    return { talk, exchange, pumpDialogue, say, renderLogOverlay };
}
