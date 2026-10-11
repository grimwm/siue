import { FOE_DYING, FOE_FIRE, FOE_HIT, FOE_IDLE, TANK_FIRE, TANK_HIT, TANK_IDLE, TANK_OWS, pick, } from './chatter.js?v=48b9223047';
import { stepArm } from './input.js?v=9287dbfb97';
import { prettyRoomError, shouldCatchUp } from './net.js?v=35baab622b';
import { H, TUNE, W, carveCrater, clamp, facing } from './sim.js?v=b64eb535e1';
export function createRoom(deps) {
    const { G, $, tables, net, MATCH, HUD, END, replay, input, sfx, music, myTank, seatName, talk, say, closeOverlays, closePreview, decayFx, fallTanks, fxImpact, hideShop, pumpDialogue, refreshNavHints, render, renderEndVeil, renderHUD, renderShop, renderShopReady, shownAngle, shownPower, startBanner, updateCamera, windText, } = deps;
    const KNOWN_FOES = ['reaper', 'wraith', 'spotter'];
    const FOE_PAINT = { reaper: '#ff0000', wraith: '#00ffff', spotter: '#ff00ff' };
    const SEAT_PAINT = ['#ffff00', '#00ff00', '#00ffff', '#ff00ff'];
    // Only the familiar battery drones get speaking lines. Human rivals show up
    // in the radio log instead, so a weird name can never break a portrait.
    function foeTalkId(t) {
        if (!t || t.isPlayer)
            return null;
        return KNOWN_FOES.indexOf(t.id) >= 0 ? t.id : null;
    }
    function netFire() {
        if (!MATCH.myTurn) {
            say('Hold on, not your turn yet.', 'info');
            return;
        }
        closePreview();
        const t = myTank();
        const ang = t ? Math.round(t.angle * 10) / 10 : 60;
        const pow = t ? Math.round(t.power * 10) / 10 : 55;
        talk('tank', pick(TANK_FIRE));
        net.act({ kind: 'fire', angle: ang, power: pow }).catch(err => {
            say(prettyRoomError(err), 'bad');
            sfx.play('warn');
        });
    }
    function netSendAim() {
        MATCH.aimDirty = false;
        const t = myTank();
        if (!t || t.hp <= 0)
            return;
        net.sendQuiet({
            kind: 'aim',
            angle: Math.round(t.angle * 10) / 10,
            power: Math.round(t.power * 10) / 10,
        });
    }
    function netSendDrive(dx) {
        net.sendQuiet({ kind: 'drive', dx: Math.round(dx * 10) / 10 });
    }
    /* Loading a gun is fine on anyone's turn: it only sets what fires next. */
    function netPick(w) {
        if (w !== 'shell' && (G.ammo[w] || 0) <= 0) {
            say(`No ${tables.weapons[w].name} left in the rack.`, 'info');
            return false;
        }
        const needRound = (tables.weapons[w] && tables.weapons[w].minRound) || 0;
        if (G.round < needRound) {
            say(`That unlocks in round ${needRound}.`, 'info');
            return false;
        }
        G.selected = w;
        sfx.play('click');
        say(`Loaded: ${tables.weapons[w].name}.`, 'info');
        renderHUD();
        net.sendQuiet({ kind: 'weapon', weapon: w });
        return true;
    }
    function netCycle() {
        const i = tables.order.indexOf(G.selected);
        for (let k = 1; k <= tables.order.length; k++) {
            const w = tables.order[(i + k) % tables.order.length];
            if (netPick(w))
                return;
        }
    }
    function netBuy(it, qty) {
        const key = it.kind === 'ammo' ? it.w : (it.g || it.kind);
        qty = clamp(Math.floor(qty || 1), 1, 9);
        sfx.play('click');
        net.buy(key, qty)
            .then(d => {
            sfx.play('cash');
            say(`Bought ${qty > 1 ? qty + ' × ' : ''}${it.label}.`, 'good');
            G.shopQty = 1;
            net.apply(d.room);
        })
            .catch(err => { say(prettyRoomError(err), 'bad'); sfx.play('warn'); });
    }
    /* The shop button toggles Ready (net.setReady: the wire carries the wanted
       state and the requests go one at a time). */
    function netNext(want) {
        sfx.play('click');
        net.setReady(want);
    }
    /* A room update either lands now or waits behind the replay: the server
       settles a whole turn at once, and clients play it back (aim, flight,
       blasts, damage) before the new state takes over. The client has already
       counted `fresh` (the events past its cursor) as seen. */
    function netOnSnapshot(room, fresh, first) {
        if (first) {
            // First sync: earlier events are history. Log them, replay nothing.
            // (A resync lands here too: events were lost, so nothing waiting is real.)
            replay.clear();
            MATCH.pendingRoom = null;
            netAdopt(room);
            for (const e of fresh)
                if (e.t !== 'shot' && e.t !== 'burst')
                    netEvent(e);
            return;
        }
        replay.push(fresh);
        if (shouldCatchUp(document.hidden))
            netCatchUp();
        if (!replay.idle()) {
            MATCH.pendingRoom = room;
            MATCH.myTurn = false;
            G.phase = 'think';
            return;
        }
        netAdopt(room);
    }
    function netAdopt(room) {
        net.seats = room.seats || [];
        if (room.map !== undefined) {
            net.map = room.map;
            net.mapName = room.mapName || 'Random hills';
        }
        if (Array.isArray(room.terrain) && room.terrain.length === W) {
            G.terrain = room.terrain.map(Number);
        }
        if (!G.clouds.length) {
            for (let i = 0; i < 5; i++) {
                G.clouds.push({ x: Math.random() * W, y: 30 + Math.random() * 90, s: 0.6 + Math.random() * 0.9, v: 3 + Math.random() * 5 });
            }
        }
        G.wind = room.wind || 0;
        const sameRound = G.round === (room.round || 1);
        G.round = room.round || 1;
        const before = new Map(G.tanks.map(t => [t.seat, t]));
        // While we aim, the server only learns our angle and power when a key is
        // let go: keep the local aim through polls so the barrel never snaps back.
        const aiming = sameRound && room.phase === 'play' && room.turn === net.seat;
        G.tanks = (room.tanks || []).map(t => {
            const mine = t.seat === net.seat;
            const was = before.get(t.seat);
            const seat = net.seats[t.seat];
            const ai = !seat || !seat.human;
            const id = mine ? 'tank' : String(t.name || '?').toLowerCase();
            return {
                id, seat: t.seat, isPlayer: mine,
                color: mine ? '#ffff00' : (ai ? (FOE_PAINT[id] || '#c9c9c9') : SEAT_PAINT[t.seat % SEAT_PAINT.length]),
                // The server drops tanks straight onto the ground; keep the drawn
                // height from the last poll so fallTanks() shows the fall.
                x: t.x, y: was && Math.abs(was.x - t.x) < 1 ? Math.min(was.y, t.y) : t.y, vy: was ? was.vy || 0 : 0,
                angle: mine && was && aiming ? was.angle : t.angle,
                power: mine && was && aiming ? was.power : t.power,
                hp: t.hp, maxHp: t.maxHp || 100, fuel: 0, dirS: t.dirS || 1,
                name: t.name,
                human: !ai,
                body: t.body || 'tank',
                menu: !!t.menu,
                bot: !!(seat && seat.bot),
                // Keep the drawn aim where it was so the new one glides in.
                showA: was && !mine ? shownAngle(was) : undefined,
                showP: was && !mine ? shownPower(was) : undefined,
            };
        });
        G.turn = Math.max(0, G.tanks.findIndex(t => t.seat === room.turn));
        const mine = myTank();
        // The turn and shop clocks: seconds left as of this snapshot, counted down
        // locally by the client; a turn clock that jumps up is a new turn, which
        // re-arms the 30-second alert.
        net.armClocks(room);
        const wasMyTurn = MATCH.myTurn;
        MATCH.myTurn = room.phase === 'play' && !!mine && mine.hp > 0 && room.turn === net.seat;
        if (MATCH.myTurn && !wasMyTurn)
            turnAlert();
        if (!G.ammo)
            G.ammo = { shell: Infinity, buck: 0, mortar: 0, rail: 0, nuke: 0 };
        if (room.you) {
            const a = {};
            for (const w of tables.order) {
                const have = room.you.ammo ? room.you.ammo[w] : 0;
                a[w] = have === -1 ? Infinity : (have || 0);
            }
            G.ammo = a;
            if (tables.order.indexOf(room.you.weapon) >= 0)
                G.selected = room.you.weapon;
            G.cash = room.you.cash || 0;
            G.score = room.you.score || 0;
            G.lives = room.you.lives || 0;
            G.shield = !!room.you.shield;
            G.jammer = room.you.jammer || 0;
            G.bunker = room.you.bunker || 0;
            G.laststand = !!room.you.laststand;
            G.plate = room.you.plate || 0;
            G.nextOneUp = room.you.nextUp || 3000;
            if (mine)
                mine.fuel = room.you.fuel || 0;
        }
        HUD.runStats = `Room ${net.code} · you are ${seatName(net.seat)} · round ${G.round}`;
        if (room.phase !== 'shop')
            net.dropReadyWish();
        if (room.phase === 'play') {
            G.over = false;
            G.phase = MATCH.myTurn ? 'aim' : 'think';
            hideShop();
            if ($('end-veil'))
                $('end-veil').hidden = true;
            if ($('lobby-veil'))
                $('lobby-veil').hidden = true;
            if (MATCH.lastPhase !== 'play' || room.round !== MATCH.lastRound) {
                // A started match takes the whole frame, same as solo: shut the menu
                // the host came through so nobody has to ESC it away mid-battle.
                if (MATCH.lastPhase !== 'play')
                    closeOverlays();
                music.forRound(room.round);
                startBanner(`Round ${room.round}. ${room.mapName || 'Random hills'}.`);
                say(`Round ${G.round}. Wind ${windText()}. ${MATCH.myTurn ? 'Your move. Aim!' : seatName(room.turn) + ' moves first.'}`, 'info');
                if (MATCH.myTurn)
                    talk('tank', 'tankity tank! My hill now!', true);
            }
            else if (MATCH.myTurn && MATCH.lastTurn !== net.seat) {
                say('Your move. Aim!', 'info');
            }
        }
        else if (room.phase === 'shop') {
            G.phase = 'shop';
            // Polls repeat the shop phase; only arriving in it shuts open panels.
            if (MATCH.lastPhase !== 'shop') {
                closePreview();
                closeOverlays();
            }
            renderShop();
            const veil = $('shop-veil');
            if (veil)
                veil.hidden = false;
            refreshNavHints();
            if (MATCH.lastPhase === 'play')
                talk('tank', 'Shopping! Then back to bam bam.', true);
        }
        else if (room.phase === 'over') {
            G.over = true;
            hideShop();
            netShowStandings(room);
        }
        MATCH.lastPhase = room.phase;
        MATCH.lastTurn = room.turn;
        MATCH.lastRound = room.round;
        render();
        renderHUD();
    }
    function netEvent(e) {
        if (!e || !e.t)
            return;
        if (e.t === 'shot' || e.t === 'burst')
            return; // flown by the replay
        if (e.t === 'fizzle') {
            say(`${seatName(e.by)} sends one into the sunset.`, 'info');
            return;
        }
        if (e.t === 'fire') {
            if (e.seat === net.seat)
                say(`You fire ${tables.weapons[G.selected] ? tables.weapons[G.selected].name : 'a shell'}.`, 'info');
            else
                say(`${seatName(e.seat)} fires ${tables.weapons[e.w] ? tables.weapons[e.w].name : 'a shell'}.`, 'info');
            return;
        }
        if (e.t === 'aifire') {
            const t = G.tanks.find(x => x.seat === e.seat);
            const id = foeTalkId(t);
            if (id)
                talk(id, pick(FOE_FIRE[id]));
            say(`${seatName(e.seat)} fires ${tables.weapons[e.w] ? tables.weapons[e.w].name : 'a shell'}.`, 'info');
            return;
        }
        if (e.t === 'hit') {
            const victim = e.seat === net.seat;
            const killer = e.by === net.seat;
            if (e.direct || victim || killer) {
                say(victim
                    ? `${seatName(e.by)} hits YOU for ${e.dmg}.`
                    : `${seatName(e.by)} hits ${seatName(e.seat)} for ${e.dmg}${e.direct ? ' (direct!)' : ''}.`, victim ? 'bad' : 'info');
            }
            if (victim) {
                sfx.play('clank');
                talk('tank', pick(TANK_OWS));
                const kt = G.tanks.find(x => x.seat === e.by);
                const kid = foeTalkId(kt);
                if (kid)
                    talk(kid, pick(FOE_HIT[kid]));
            }
            else if (killer) {
                const vt = G.tanks.find(x => x.seat === e.seat);
                if (foeTalkId(vt))
                    talk('tank', pick(TANK_HIT));
            }
            return;
        }
        if (e.t === 'kill') {
            const victim = e.seat === net.seat;
            sfx.play('boom');
            say(victim
                ? (e.by === net.seat ? 'You got yourself?! The hills are cruel.' : `${seatName(e.by)} wrecks YOU.`)
                : `${seatName(e.by)} wrecks ${seatName(e.seat)}.`, victim ? 'bad' : 'info');
            const vt = G.tanks.find(x => x.seat === e.seat);
            const vid = foeTalkId(vt);
            if (vid && FOE_DYING[vid])
                talk(vid, FOE_DYING[vid], true);
            if (!victim && e.by === net.seat)
                talk('tank', pick(TANK_HIT));
            return;
        }
        if (e.t === 'shield') {
            say(e.seat === net.seat ? 'Your shield absorbs the hit!' : `${seatName(e.seat)}'s shield absorbs the hit!`, 'good');
            return;
        }
        if (e.t === 'laststand') {
            sfx.play('boom');
            say(e.seat === net.seat ? 'Your wreck goes down glowing!' : `${seatName(e.seat)} goes down glowing!`, 'info');
            return;
        }
        if (e.t === 'oneup') {
            if (e.seat === net.seat) {
                sfx.play('win');
                say(`1-UP! Extra life! (${e.lives} lives)`, 'good');
                talk('tank', 'Another life! I am basically immortal!', true);
            }
            else
                say(`${seatName(e.seat)} earns a 1-up.`, 'info');
            return;
        }
        if (e.t === 'roundwin') {
            if (e.seat === net.seat) {
                sfx.play('win');
                say(`You take round ${e.round}. Winnings paid. Spend them.`, 'good');
            }
            else
                say(`${seatName(e.seat)} takes round ${e.round}.`, 'info');
            return;
        }
        if (e.t === 'roundlost') {
            sfx.play('lose');
            say(`Round ${e.round} goes to the battery. Every wrecked player loses a life; restock and roll again.`, 'bad');
            return;
        }
        if (e.t === 'eliminated') {
            if (e.seat === net.seat) {
                sfx.play('lose');
                say('The battery got you for good this time. Filing your report.', 'bad');
            }
            else
                say(`${seatName(e.seat)} is out of lives.`, 'info');
            return;
        }
        if (e.t === 'join') {
            say(`${e.name || seatName(e.seat)} rolled into the room.`, 'info');
            return;
        }
        if (e.t === 'left') {
            say(`${e.name || seatName(e.seat)} left; the battery takes that seat.`, 'info');
            return;
        }
        if (e.t === 'round') {
            say(`Round ${e.round}. Fresh barrels, same battery. Wind ${windText()}.`, 'info');
            talk('tank', 'Back in! These hills are mine!', true);
            return;
        }
        if (e.t === 'tactic') {
            say(`${seatName(e.seat).toUpperCase()} switches to ${e.s} tactics.`, 'info');
            return;
        }
        if (e.t === 'auto') {
            say(`${seatName(e.seat)} sat quiet, so the crew fired for them.`, 'info');
            return;
        }
    }
    /* ---------- room replay ---------- */
    function netBlast(x, y, r, wkey) {
        sfx.play('boom');
        const kick = fxImpact(G.fx, wkey, x, y, r);
        G.shake = Math.min(1, G.shake + (kick !== undefined ? kick : wkey === 'nuke' ? 0.9 : r > 40 ? 0.5 : 0.3));
        G.booms.push({ x, y, r, wkey, t: 0, life: wkey === 'nuke' ? 0.8 : 0.5 });
        carveCrater(G.terrain, x, y, r, H - 4);
    }
    /* Your turn while the tab is out of sight: the tab title says so, a soft
       ping plays (unless Sound is off), and a notification pops up when the
       player allowed them. Inside a page on this host that frames the game (a
       site's page around it), that page's title is the tab's, so it changes too.
       Everything resets the moment the tab is seen again. */
    let alertTitles = null;
    function titleDocs() {
        const docs = [document];
        try {
            if (window.top !== window && window.top.document)
                docs.push(window.top.document);
        }
        catch (_) { /* another host */ }
        return docs;
    }
    function askNotifications() {
        try {
            if (typeof Notification === 'function' && Notification.permission === 'default')
                Notification.requestPermission();
        }
        catch (_) { /* unsupported */ }
    }
    function turnAlert() {
        if (!document.hidden)
            return;
        if (!alertTitles) {
            alertTitles = titleDocs().map(d => [d, d.title]);
            for (const [d, t] of alertTitles)
                d.title = `\u25cf Your turn \u00b7 ${t}`;
        }
        sfx.turnPing();
        try {
            if (typeof Notification === 'function' && Notification.permission === 'granted') {
                const n = new Notification('Your turn in Operation Tankity', { body: `Room ${net.code}: the hills are waiting.`, tag: 'tankity-turn' });
                n.onclick = () => { try {
                    window.top.focus();
                }
                catch (_) {
                    window.focus();
                } n.close(); };
            }
        }
        catch (_) { /* notifications unavailable */ }
    }
    function clearTurnAlert() {
        if (!alertTitles)
            return;
        for (const [d, t] of alertTitles)
            d.title = t;
        alertTitles = null;
    }
    /* The room's turn clock (rooms.php ROOM_TURN_SECS): when a human's turn runs
       out the crew fires a random gun from their rack. Its owner hears an alert
       with 30 seconds left; everyone sees the last 10 counted down. */
    function tickTurnClock() {
        if (G.phase === 'shop')
            renderShopReady();
        if (!net.clockWarnDue())
            return;
        if (!MATCH.myTurn)
            return;
        say(`${Math.ceil(net.turnClockLeft())} seconds left. Fire, or the crew picks a gun and fires for you.`, 'bad');
        sfx.clockWarn();
    }
    /* Tell the room when this player is in a menu (game menu, help, scores, the
       weapon picker), so the others see why the battle waits on them. The radio
       log is a glance, not a menu. */
    function menuOpen() {
        return ['menu-overlay', 'help-overlay', 'report-overlay', 'gun-overlay', 'leave-veil'].some(id => { const el = $(id); return el && !el.hidden; });
    }
    function netSyncMenu() {
        net.setMenu(menuOpen());
    }
    /* A hidden tab plays nothing (browsers stop its frames), so its replay queue
       piles up. Coming back, or whenever more than one volley is waiting, skip
       all but the newest volley: their log lines still post, and the room state
       that follows carries the craters and armor. If it is already our turn,
       skip them all and hand over the controls at once. */
    function netCatchUp() {
        const skipped = replay.catchUp(MATCH.pendingRoom, net.seat);
        if (!skipped)
            return;
        G.shells = [];
        for (const e of skipped)
            netEvent(e);
    }
    if (typeof document.addEventListener === 'function') {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden)
                return;
            clearTurnAlert();
            if (net.on) {
                netCatchUp();
                net.resync();
            }
        });
    }
    /* Drive the replay; once nothing is left to play, the waiting room state
       takes over. */
    function netReplay(dt) {
        replay.step(dt);
        if (replay.idle() && MATCH.pendingRoom) {
            const room = MATCH.pendingRoom;
            MATCH.pendingRoom = null;
            netAdopt(room);
        }
    }
    function netEaseAim(dt) {
        const k = 1 - Math.exp(-dt * 5);
        for (const t of G.tanks) {
            if (t.isPlayer)
                continue;
            t.showA = t.showA === undefined ? t.angle : t.showA + (t.angle - t.showA) * k;
            t.showP = t.showP === undefined ? t.power : t.showP + (t.power - t.showP) * k;
        }
    }
    function netFrame(dt) {
        netSyncMenu();
        tickTurnClock();
        G.time += dt;
        netEaseAim(dt);
        updateCamera(dt);
        decayFx(dt);
        fallTanks(dt);
        for (const cl of G.clouds) {
            cl.x += cl.v * dt;
            if (cl.x - 40 > W)
                cl.x = -40;
        }
        netReplay(dt);
        pumpDialogue(dt);
        G.banterT -= dt;
        if (G.banterT <= 0) {
            G.banterT = 30 + Math.random() * 14;
            if (!G.dlgQ.length && G.dlgT <= 0 && MATCH.myTurn) {
                if (Math.random() < 0.5)
                    talk('tank', pick(TANK_IDLE));
                else {
                    const live = G.tanks.filter(t => !t.isPlayer && t.hp > 0 && foeTalkId(t));
                    if (live.length) {
                        const jab = pick(FOE_IDLE.filter(x => live.some(d => d.id === x[0])));
                        if (jab)
                            talk(jab[0], jab[1]);
                    }
                    else
                        talk('tank', pick(TANK_IDLE));
                }
            }
        }
        const t = myTank();
        if (t && t.hp > 0 && MATCH.myTurn) {
            const arm = stepArm(input.held, dt, t, facing(t));
            t.angle = arm.angle;
            t.power = arm.power;
            if (arm.adjusting)
                MATCH.aimDirty = true;
            if (arm.idle && MATCH.aimDirty)
                netSendAim();
            if ((input.held.has('driveLeft') || input.held.has('driveRight')) && t.fuel > 0) {
                const dir = input.held.axis('driveLeft', 'driveRight');
                MATCH.driveAcc += dir * TUNE.driveSpeed * dt;
                MATCH.driveT += dt;
                if (MATCH.driveT >= 0.22 && Math.abs(MATCH.driveAcc) >= 4) {
                    const dx = clamp(MATCH.driveAcc, -80, 80);
                    MATCH.driveAcc = 0;
                    MATCH.driveT = 0;
                    netSendDrive(dx);
                }
            }
            else {
                MATCH.driveAcc = 0;
                MATCH.driveT = 0;
            }
        }
    }
    function netShowStandings(room) {
        net.stopPolling();
        const rows = ((room && room.seats) || []).map((s, i) => ({
            name: s.human ? s.initials : (s.name + ' (AI)'),
            score: s.score || 0,
            mine: i === net.seat,
        }));
        rows.sort((a, b) => b.score - a.score);
        const champ = rows[0];
        END.kicker = `Room ${net.code} · final standings`;
        END.title = champ && champ.mine ? 'Top gun! The hills are yours.' : (champ ? `${champ.name} holds the hills.` : 'Match over.');
        END.text = `The battery never quits, and neither do you. Room ${net.code} ended on round ${room.round || '?'}.`;
        END.score = rows.map(r => `${r.name} ${r.score}${r.mine ? ' (you)' : ''}`).join(' · ') +
            (room.you ? ` · you banked $${room.you.cash || 0}` : '');
        END.backToRooms = true;
        END.formHidden = true; // room standings are not high-score runs
        END.rematch = net.map
            ? `Rematch on ${net.mapName || 'these hills'}`
            : 'Rematch on random hills';
        renderEndVeil();
        const veil = $('end-veil');
        if (veil)
            veil.hidden = false;
        refreshNavHints();
    }
    return {
        netFire, netSendAim, netPick, netCycle, netBuy, netNext, netOnSnapshot, netEvent, netBlast, askNotifications,
        turnAlert, clearTurnAlert, netCatchUp, netFrame, netShowStandings,
    };
}
