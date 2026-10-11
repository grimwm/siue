/* Operation Tankity: the solo match.
 *
 * Dealing a match and its rounds, whose turn it is, firing and what a blast
 * does to each unit, a drone's aim and shot, the end of a round and of the
 * match, the name cards between rounds, and the end veil's props. The pure
 * parts are elsewhere (the sim moves shells and decides hits, the AI chooses
 * an aim, flow.ts names the phase moves); this decides what happens next and
 * says it. A room match is run by the server, so nothing here runs in one
 * except the pieces a room shares (the banner, the cosmetics, the end veil).
 * The game's state, the page and the rest of the game arrive as deps. */
import { aiChoose as simAiChoose, pickTactic } from './ai.js?v=b9925728d7';
import { FOE_DYING, FOE_FIRE, FOE_HIT, FOE_MISS, TANK_FIRE, TANK_HIT, TANK_MISS, TANK_OWS, pick } from './chatter.js?v=48b9223047';
import { transition, WATCH_TURNS } from './flow.js?v=fb268dfd34';
import { hashSeed, mulberry32, gauss, W, H, GRAV, TUNE, clamp, droneRack as simDroneRack, genTerrain as simGenTerrain, spawnSpots, fireWeapon as simFireWeapon, stepShells as simStepShells, fallTanks as simFallTanks, anyTankFalling as simAnyTankFalling, } from './sim.js?v=b64eb535e1';
import { renderEndVeil as drawEndVeil } from './ui/endveil.js?v=6a7f00fd3c';
export function createMatch(deps) {
    const { G, $, TOUCH, tables, net, sfx, music, unlock, alive, foesAlive, me, cur, surfY, talk, exchange, say, keyHint, windText, render, renderHUD, refreshNavHints, fxMuzzle, fxImpact, fxSpecial, fxTrail, closeGuns, closePreview, hideShop, openShop, endTutorial, maybeStartTutorial, tutorialFired, fileReport, savedCallsign, freshMatchFromSeedBox, netFire, netLeave, netNext, netRematch, openLobby, } = deps;
    /* Rolling hills from seeded sines, and the clouds over them. */
    function genTerrain() {
        const g = simGenTerrain(G.rng);
        G.terrain = g.terrain;
        G.clouds = g.clouds;
    }
    const FOE_DEFS = [
        { id: 'reaper', color: '#ff0000' },
        { id: 'wraith', color: '#00ffff' },
        { id: 'spotter', color: '#ff00ff' },
    ];
    function resetMatch(seedStr) {
        const seed = (seedStr || '').trim() || ('scorched-' + Math.floor(Math.random() * 9000 + 1000));
        G.seed = seed;
        G.rng = mulberry32(hashSeed(seed));
        G.lives = TUNE.lives;
        G.score = 0;
        G.cash = 600;
        G.nextOneUp = TUNE.oneUpEvery;
        G.roundsWon = 0;
        G.round = 0;
        G.tactics = {}; // each drone's strategy, kept from round to round
        G.firstTurn = 0;
        G.ammo = { shell: Infinity, buck: 1 };
        for (const k of tables.order)
            if (!(k in G.ammo))
                G.ammo[k] = 0;
        G.selected = 'shell';
        G.shopSel = 0;
        G.shopQty = 1;
        G.fuelBank = 0;
        G.repairBank = 0;
        G.plate = 0;
        G.shield = false;
        G.jammer = 0;
        G.bunker = 0;
        G.laststand = false;
        G.over = false;
        const endVeil = $('end-veil');
        if (endVeil)
            endVeil.hidden = true; // a new match never sits on the last one's result
        G.won = false;
        G.demo = false;
        G.demoHint = false;
        G.time = 0;
        G.dlgQ = [];
        G.dlgT = 0;
        G.lastTalk = -99;
        G.banterT = 24;
        G.bannerT = 0;
        G.bannerDone = null;
        G.cam = { z: 1, cx: W / 2, cy: H / 2 };
        if ($('round-banner'))
            $('round-banner').hidden = true;
        genTerrain();
        G.tanks = [];
        G.shells = [];
        G.parts = [];
        G.booms = [];
        if (G.fx)
            G.fx.clear();
        closePreview();
        hideShop();
    }
    /* The solo phase moves live in src/flow.ts: ask it for the next phase. A move
       its table rejects leaves the phase where it was and says so on the console. */
    function advance(event) {
        const next = transition(G.phase, event);
        if (next === null)
            console.warn(`tankity flow: ${event} is not legal in ${G.phase}`);
        else
            G.phase = next;
    }
    // Attract mode: the crew drives every tank until a human takes over.
    function startDemo() {
        resetMatch('scorched-demo');
        G.demo = true;
        G.round = 1;
        advance('demo');
        newRound(`Demo mode. Press New Game${TOUCH ? '' : ` (or ${keyHint('global', 'new')})`} to play.`);
        render();
        renderHUD();
    }
    function newMatch(seedStr) {
        resetMatch(seedStr);
        // No round yet: spend the starting stake in the shop first.
        advance('matchStart');
        music.leaveTheme(); // a new match leaves the demo's theme at once
        startBanner('Round 1. The battery holds these hills.', openShop);
        say(`Match ${G.seed}: $600 stake in your pocket. Buy guns first. The battery holds these hills.`, 'info');
        talk('tank', 'tankity tank! Shopping, then shooting!', true);
    }
    // A fanfare plus a name card, then the game continues. Nothing starts without you.
    function startSolo(seedStr) {
        closePreview();
        unlock();
        music.start();
        newMatch(seedStr);
    }
    function newRound(bannerText, event) {
        genTerrain();
        G.watchTurns = 0; // drone-only turns since the player fell (see WATCH_TURNS)
        G.wind = Math.round((G.rng() * 2 - 1) * 8);
        // Spread four combatants across the hills; every round, anyone may land
        // anywhere, never on top of each other.
        const order = spawnSpots(1 + FOE_DEFS.length, G.rng);
        // Shop fuel and repairs ride in banks: the round rebuilds every tank from
        // scratch, so anything bought spends only if it waits here for muster.
        const musterMax = TUNE.playerArmor + 25 * (G.plate || 0);
        const musterHp = musterMax + (G.repairBank || 0);
        const musterFuel = TUNE.fuel + (G.fuelBank || 0);
        G.repairBank = 0;
        G.fuelBank = 0;
        G.tanks = [{
                id: 'tank', isPlayer: true, color: '#ffff00', body: G.body,
                x: order[0], y: 0, angle: 62, power: 55,
                hp: musterHp, maxHp: musterHp, fuel: musterFuel,
            }];
        FOE_DEFS.forEach((f, i) => {
            // Endless escalation: thicker armor and a deeper magazine every round.
            const armor = TUNE.droneArmor + 6 * (G.round - 1);
            G.tanks.push({
                id: f.id, isPlayer: false, color: f.color,
                x: order[i + 1], y: 0, angle: 62, power: 55,
                hp: armor, maxHp: armor, fuel: 0,
                ammo: droneRack(),
                s: (G.tactics = G.tactics || {})[f.id] || (G.tactics[f.id] = pickTactic(G.rng)),
            });
        });
        for (const t of G.tanks) {
            t.y = surfY(t.x);
            t.dirS = t.x < W / 2 ? 1 : -1; // face the middle of the field
        }
        G.turn = G.firstTurn % G.tanks.length;
        G.firstTurn++;
        G.shells = [];
        G.parts = [];
        G.booms = [];
        if (G.fx)
            G.fx.clear();
        // The soundtrack turns over with the rounds: song follows the round, and
        // the demo always plays the theme.
        if (G.demo)
            music.playTheme();
        else
            music.forRound(G.round);
        if (event)
            advance(event);
        closePreview();
        hideShop();
        if ($('end-veil'))
            $('end-veil').hidden = true;
        const opener = cur();
        const card = typeof bannerText === 'string' && bannerText
            ? bannerText
            : `Round ${G.round}. The battery rebuilds meaner.`;
        startBanner(card, () => {
            // Open on the scheduled tank: advancing here would skip seat 0 every round.
            if (opener.isPlayer && !G.demo) {
                advance('playerUp');
                say(`Round ${G.round}. Wind ${windText()}. Your move. Aim!`, 'info');
                maybeStartTutorial();
            }
            else {
                advance('foeUp');
                G.thinkT = TUNE.thinkTime;
                const who = opener.isPlayer ? 'Tankity tank' : opener.id;
                say(`Round ${G.round}. Wind ${windText()}. ${who} moves first.`, 'info');
            }
        });
    }
    function fireWeapon(t, wkey) {
        const w = tables.weapons[wkey];
        const launch = simFireWeapon(G, tables.arsenal, t, wkey);
        if (!launch) {
            if (t.isPlayer) {
                say(`No ${w.name} left! ${TOUCH ? 'Tap Weapons' : keyHint('global', 'cycle')} to swap guns.`, 'info');
                sfx.play('click');
            }
            return false;
        }
        if (launch.spent)
            say(`Out of ${w.name}. Back to the Shell.`, 'info');
        // Muzzle effects (the rail's beam among them) fire once per volley, along the barrel.
        fxMuzzle(G.fx, wkey, launch.x, launch.y, launch.ang);
        sfx.play('launch');
        advance('fire');
        return true;
    }
    function demoBlock() {
        if (!G.demo)
            return false;
        if (!G.demoHint) {
            G.demoHint = true;
            say(`Demo mode. Press New Game${TOUCH ? '' : ` (or ${keyHint('global', 'new')})`} to take the controls.`, 'info');
        }
        return true;
    }
    function playerFire() {
        closeGuns();
        if (net.on) {
            netFire();
            return;
        }
        if (demoBlock())
            return;
        if (G.phase !== 'aim' || !cur().isPlayer || G.over)
            return;
        closePreview();
        if (fireWeapon(me(), G.selected)) {
            tutorialFired();
            talk('tank', pick(TANK_FIRE));
            say(`You fire ${tables.weapons[G.selected].name}.`, 'info');
        }
        render();
    }
    /* One frame of flight: the sim moves the shells and says what happened, and
       this plays it. */
    function stepShells(dt) {
        for (const e of simStepShells(G, tables.arsenal, dt)) {
            if (e.kind === 'trail')
                fxTrail(G.fx, e.shell, dt, e.x, e.y, e.vx, e.vy, e.shell.wkey);
            else if (e.kind === 'split')
                fxSpecial(G.fx, e.wkey, 'split', e.x, e.y, e.ang);
            else if (e.kind === 'pierce')
                fxSpecial(G.fx, e.wkey, 'pierce', e.x, e.y, e.ang);
            else {
                showBlast(e.blast);
                G.settleT = TUNE.settleTime;
                advance('shellsLanded');
            }
        }
    }
    /* A blast as the sim reports it: the boom, then what it did to each unit in
       the order it happened. */
    function showBlast(b) {
        const owner = b.owner;
        sfx.play('boom');
        const kick = fxImpact(G.fx, b.fx, b.x, b.y, b.r);
        G.shake = Math.max(G.shake || 0, kick !== undefined ? kick : b.shake);
        G.booms.push({ x: b.x, y: b.y, r: b.r, wkey: b.wkey, t: 0, life: b.wkey === 'nuke' ? 0.8 : 0.5 });
        for (const e of b.events) {
            const t = e.tank;
            if (e.kind === 'shield') {
                burst(t.x, t.y - 12, '#ffffff', 16, 5);
                say('Shield absorbs the hit!', 'good');
                renderHUD();
            }
            else if (e.kind === 'arc') {
                fxSpecial(G.fx, b.wkey, 'arc', t.x, t.y - 12, 0);
            }
            else if (e.kind === 'wound') {
                if (t.isPlayer) {
                    say(`Direct hit on YOU for ${e.dmg}! (${e.hp} armor left)`, 'bad');
                    exchange('tank', pick(TANK_OWS), owner.id, pick(FOE_HIT[owner.id] || FOE_MISS));
                }
                else if (owner.isPlayer) {
                    say(`Direct hit on ${t.id} for ${e.dmg}! (${e.hp} armor left)`, 'good');
                    talk('tank', pick(TANK_HIT), true);
                }
                else if (e.direct) {
                    say(`${owner.id} hits ${t.id} for ${e.dmg}.`, 'info');
                }
            }
            else {
                sfx.play('boom');
                burst(t.x, t.y - 12, '#ff5a5a', 26, 7);
                if (e.lastStand) {
                    say('Last stand! The wreck detonates!', 'good');
                    showBlast(e.lastStand);
                    renderHUD();
                }
                if (t.isPlayer) {
                    say('Your tank is scrap metal!', 'bad');
                    talk('tank', 'I will be back... after repairs.', true);
                }
                else {
                    const by = owner.isPlayer ? 'You' : owner.id;
                    say(`${by} wreck${owner.isPlayer ? '' : 's'} ${t.id}! (+${TUNE.killBonus})`, 'good');
                    exchange(t.id, FOE_DYING[t.id] || '...', 'tank', pick(TANK_HIT));
                }
            }
        }
    }
    /* ---------- turn advance, rounds, shop ---------- */
    function nextTurn() {
        if (G.over)
            return;
        const n = G.tanks.length;
        for (let k = 1; k <= n; k++) {
            const t = G.tanks[(G.turn + k) % n];
            if (t.hp > 0) {
                G.turn = (G.turn + k) % n;
                break;
            }
        }
        const t = cur();
        if (t.isPlayer && !G.demo) {
            advance('playerUp');
            say('Your turn. Aim!', 'info');
        }
        else {
            advance('foeUp');
            G.thinkT = TUNE.thinkTime;
            say(`${t.isPlayer ? 'Tankity tank' : t.id} is aiming…`, 'info');
            if (Math.random() < 0.4)
                talk(t.id, pick(FOE_FIRE[t.id] || FOE_MISS));
        }
        render();
        renderHUD();
    }
    /* Tanks left hanging over a crater fall under gravity every frame until they
       land; ground that rose (a new round, fresh hills) takes them straight up. */
    function fallTanks(dt) {
        if (simFallTanks(G, dt).some(t => t.isPlayer))
            sfx.play('thud');
    }
    function anyTankFalling() {
        return simAnyTankFalling(G);
    }
    function settle() {
        if (G.demo) {
            if (me().hp <= 0) {
                say('Demo tank wrecked. Rolling a fresh one.', 'info');
                newRound('Back in! Same hills, fresh tank.', 'tankLost');
                return;
            }
            if (!foesAlive().length) {
                G.round += 1;
                newRound(undefined, 'roundWon');
                return;
            }
        }
        else if (alive().length > 1 && !(me().hp <= 0 && ++G.watchTurns >= WATCH_TURNS)) {
            // A round ends only with one unit left standing: with the player's tank
            // wrecked, the drones fight on while the player watches (for at most
            // WATCH_TURNS turns, so a stalemate cannot run forever).
        }
        else if (me().hp <= 0) {
            // The last unit is a drone (or the last two fell together): the round
            // goes to the battery, the player loses a life, and the shop opens.
            G.lives -= 1;
            if (G.lives <= 0) {
                G.lives = 0;
                endMatch(false, 'The tank is scrap across these hills. The battery keeps the high ground.');
            }
            else {
                say(`Round ${G.round} goes to the battery. ${G.lives} ${G.lives === 1 ? 'life' : 'lives'} left. Restock and roll again.`, 'bad');
                talk('tank', 'I will be back... after shopping!', true);
                advance('tankLost');
                startBanner(`Round ${G.round} lost. Restock and roll again.`, openShop);
            }
            return;
        }
        else {
            G.roundsWon += 1;
            const bonus = TUNE.roundWinScore + G.round * 150;
            const prize = TUNE.roundWinCash + G.round * 100;
            G.score += bonus;
            G.cash += prize;
            sfx.play('win');
            say(`Round ${G.round} won! +${bonus} pts, +$${prize}. The battery rebuilds meaner, so spend it wisely.`, 'good');
            exchange('tank', 'tankity tank! Hill claimed!', pick(['reaper', 'wraith', 'spotter']), pick(['Lucky shot, treads...', 'The hill was... too hilly...', 'Recharge... revenge...']));
            // Trick timers tick down on claimed rounds, not on wrecked restarts.
            if (G.jammer > 0)
                G.jammer--;
            if (G.bunker > 0)
                G.bunker--;
            advance('roundWon');
            startBanner(`Round ${G.round} claimed! Spend the winnings.`, openShop);
            return;
        }
        // Wind shifts a little after every shot.
        G.wind = clamp(Math.round(G.wind + gauss(G.rng) * 2), -12, 12);
        nextTurn();
    }
    /* The end veil is a Preact component (src/ui/endveil.tsx); the game keeps what
       it says and which buttons it offers. */
    const END = { kicker: '', title: '', text: '', score: '', formHidden: false, filed: false, rematch: null, backToRooms: false };
    function renderEndVeil() {
        const veil = $('end-veil');
        if (!veil)
            return;
        drawEndVeil(veil, {
            keyHint,
            kicker: END.kicker,
            title: END.title,
            text: END.text,
            score: END.score,
            formHidden: END.formHidden,
            filed: END.filed,
            callsign: savedCallsign(),
            rematch: END.rematch,
            backToRooms: END.backToRooms,
            onFile: raw => {
                const name = raw.trim();
                if (!name) {
                    say('Give your callsign first, hero.', 'info');
                    return;
                }
                fileReport(name);
                END.filed = true;
                renderEndVeil();
            },
            onRematch: () => { sfx.play('click'); netRematch(); },
            onAgain: () => { if (net.on) {
                netLeave();
                openLobby();
            }
            else
                freshMatchFromSeedBox(); },
        });
    }
    function endMatch(won, text) {
        if (G.demo) {
            startDemo();
            return;
        }
        if (G.over)
            return;
        endTutorial(true);
        G.over = true;
        G.won = won;
        advance(won ? 'matchWon' : 'matchLost');
        music.stop();
        hideShop();
        refreshNavHints();
        if (won)
            sfx.play('win');
        else
            sfx.play('lose');
        say(text, won ? 'good' : 'bad');
        const veil = $('end-veil');
        if (veil) {
            END.kicker = won ? 'Match over' : 'Match lost';
            END.title = won ? 'Hills claimed!' : 'Tank down';
            END.text = text;
            END.score = `Score ${G.score} · ${G.roundsWon} rounds won · ${G.round} rounds played · seed ${G.seed}`;
            // File the run right here, with the last callsign ready.
            END.formHidden = false;
            END.filed = false;
            renderEndVeil();
            veil.hidden = false;
            refreshNavHints();
        }
        renderHUD();
    }
    const BANNER_MS = 1500;
    // Banner timing rides the game clock, never wall time: hidden tabs throttle
    // setTimeout, which used to strand the game on its name card after refocus.
    function startBanner(text, done) {
        const t = $('round-banner-text');
        if (t)
            t.textContent = text;
        const b = $('round-banner');
        if (b) {
            b.hidden = true;
            void b.offsetWidth;
            b.hidden = false;
        }
        sfx.play('fanfare');
        G.bannerT = BANNER_MS / 1000;
        G.bannerDone = done || null;
    }
    function tickBanner(dt) {
        if (G.bannerT <= 0)
            return;
        G.bannerT -= dt;
        if (G.bannerT > 0)
            return;
        G.bannerT = 0;
        const b = $('round-banner');
        if (b)
            b.hidden = true;
        const done = G.bannerDone;
        G.bannerDone = null;
        if (done)
            done();
    }
    function nextRound() {
        if (net.on) {
            netNext();
            return;
        }
        if (G.phase !== 'shop')
            return;
        G.round += 1;
        newRound(undefined, 'shopDone');
    }
    /* ---------- drone AI: real ballistic solutions, plus round-scaled error ---------- */
    /* Drone magazine from the data file: shells the battery may load by round. */
    function droneRack() {
        return simDroneRack(tables.arsenal, G.round);
    }
    function aiChoose(t) {
        return simAiChoose(G, tables.arsenal, t);
    }
    /* The shooter swings its barrel and power to the plan in plain sight before
       firing, so everyone can watch the shot line up. Longer swings take a bit
       longer, eased at both ends. */
    function aiPlanAim(t) {
        const plan = aiChoose(t);
        if (plan.tactic) {
            G.tactics[t.id] = plan.tactic;
            say(`${t.id.toUpperCase()} switches to ${plan.tactic} tactics.`, 'info');
        }
        const swing = Math.max(Math.abs(plan.angle - t.angle), Math.abs(plan.power - t.power));
        t.aim = {
            plan, a0: t.angle, p0: t.power, k: 0,
            dur: clamp(0.45 + swing / 110, 0.5, 1.4),
        };
    }
    /* Advance a planned swing; true once the barrel has sat on the plan for a
       beat, so the final aim reads before the shot leaves. */
    function aiStepAim(t, dt) {
        const aim = t.aim;
        const hold = 0.2;
        aim.k = Math.min(aim.dur + hold, aim.k + dt);
        const u = Math.min(1, aim.k / aim.dur);
        const e = u * u * (3 - 2 * u);
        t.angle = aim.a0 + (aim.plan.angle - aim.a0) * e;
        t.power = aim.p0 + (aim.plan.power - aim.p0) * e;
        return aim.k >= aim.dur + hold;
    }
    function aiFire(t) {
        const { wkey, angle, power } = t.aim.plan;
        t.aim = null;
        t.angle = angle;
        t.power = power;
        talk(t.id, pick(FOE_FIRE[t.id] || FOE_MISS));
        say(`${t.id} fires ${tables.weapons[wkey].name}.`, 'info');
        fireWeapon(t, wkey);
        render();
    }
    /* ---------- rendering: bright dusk hillside, no borrowed sprites ---------- */
    /* One blast-disc painter for the war, the room tracers, and the demos. */
    function burst(x, y, color, n, spd) {
        for (let i = 0; i < (n || 10); i++) {
            const a = Math.random() * Math.PI * 2;
            const s = (spd || 4) * (0.4 + Math.random());
            G.parts.push({ x, y, vx: Math.cos(a) * s * 10, vy: Math.sin(a) * s * 10 - 30, life: 0.5 + Math.random() * 0.5, color: color || '#ffd75e' });
        }
    }
    /* Battlefield cosmetics decay on wall-clock frames, never on volleys: effects,
     * blast discs, shake, and sparks all finish even after the last shell lands,
    // so nothing freezes over the next turn. */
    function decayFx(dt) {
        if (G.shake > 0)
            G.shake = Math.max(0, G.shake - dt);
        if (G.fx) {
            G.fx.wind = G.wind;
            G.fx.step(dt);
        }
        for (const bm of G.booms)
            bm.t += dt;
        G.booms = G.booms.filter(bm => bm.t < bm.life);
        for (const q of G.parts) {
            q.life -= dt;
            q.x += q.vx * dt;
            q.y += q.vy * dt;
            q.vy += GRAV * 0.6 * dt;
        }
        G.parts = G.parts.filter(q => q.life > 0);
    }
    /* One step of the war between turns: a drone aims and fires, shells fly, the
       dust settles. */
    function stepWar(dt) {
        if (G.phase === 'think') {
            const t = cur();
            if (!t.aim)
                aiPlanAim(t);
            G.thinkT -= dt;
            if (aiStepAim(t, dt) && G.thinkT <= 0)
                aiFire(t);
        }
        else if (G.phase === 'fly' || G.phase === 'settle') {
            // A volley resolves pellet by pellet: explosions flip us to settle, but
            // stepping continues until every shell has landed or fizzled.
            if (G.shells.length)
                stepShells(dt);
            if (G.phase === 'fly' && !G.shells.length) {
                say('Shot fizzles out over the hills.', 'info');
                talk('tank', pick(TANK_MISS));
                G.settleT = 0.6;
                advance('shellsLanded');
            }
            else if (G.phase === 'settle' && !G.shells.length) {
                G.settleT -= dt;
                // The turn waits for every tank to finish falling into its crater.
                if (G.settleT <= 0 && !anyTankFalling())
                    settle();
            }
        }
    }
    return {
        advance, startDemo, startSolo, demoBlock, playerFire, fallTanks, END, renderEndVeil, startBanner, tickBanner, nextRound,
        stepWar, decayFx,
    };
}
