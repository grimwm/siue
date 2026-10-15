/* Operation Tankity: the solo match.
 *
 * Playing a solo match on the page: announcing whose turn it is, firing and what a blast
 * does to each unit, a drone's shot, the words and banners for the end of a round and of the
 * match, the name cards between rounds, and the end veil's props. The pure
 * parts are elsewhere (the sim moves shells and decides hits, the AI chooses
 * an aim, solo.ts deals, settles and orders the turns, flow.ts names the phase
 * moves); this decides what happens next and
 * says it. A room match is run by the server, so nothing here runs in one
 * except the pieces a room shares (the banner, the cosmetics, the end veil).
 * The game's state, the page and the rest of the game arrive as deps. */
import { maxArmor } from './armor.ts';
import type { sfx as SfxApi, music as MusicApi } from './audio.ts';
import type { DifficultySetting } from './difficulty.ts';
import { FOE_DYING, FOE_FIRE, FOE_HIT, FOE_MISS, TANK_FIRE, TANK_HIT, TANK_MISS, TANK_OWS, pick } from './chatter.ts';
import type { FxSys } from './fx/types.ts';
import { MAX_STEPS, SOLO_STEP, runFixed, transition, warSpeed } from './flow.ts';
import type { FlowEvent } from './flow.ts';
import type { GameState, GameTank, Tables } from './game-types.ts';
import type { FieldWidth } from './field.ts';
import type { RoomClient } from './net.ts';
import {
  gauss, H, GRAV, TUNE, clamp, fireWeapon as simFireWeapon, stepShells as simStepShells, fallTanks as simFallTanks,
  anyTankFalling as simAnyTankFalling, armChutes, dueFalls, gfxLinger, settleVolley, unitHitBox, volleyOn,
} from './sim.ts';
import type { Blast, Difficulty, FallEvent, FallShow, Fire, Shell, StepEvent } from './sim.ts';
import { playDigStep, playEarthOp } from './earth-fx.ts';
import type { EarthFxDeps } from './earth-fx.ts';
import { playBurn } from './fire-fx.ts';
import type { FireFxDeps } from './fire-fx.ts';
import { snapTanks, soloAim, soloDeal, soloMuster, soloNextTurn, soloOneUps, soloSettle } from './solo.ts';
import { endCardBack, localLine, soloBoard } from './standings.ts';
import type { LocalRow, Saved } from './local-board.ts';
import type { Board } from './standings.ts';
import { renderEndVeil as drawEndVeil, focusEndVeil } from './ui/endveil.tsx';
import type { EndVeilProps } from './ui/endveil.tsx';
import type { KeyHintFn } from './ui/chrome.tsx';

/** What the end card says and which buttons it offers (src/ui/endveil.tsx). */
export interface EndState {
  kicker: string;
  title: string;
  text: string;
  score: string;
  board: Board | null;
  filed: string | null;
  buttons: EndVeilProps['buttons'];
}

/** What the solo match needs from the page and the rest of the game. */
export interface MatchDeps {
  /** Where a solo match's field width is dealt; only a deal reads the viewport. */
  field: Pick<FieldWidth, 'deal'>;
  G: GameState;
  $(id: string): HTMLElement | null;
  TOUCH: boolean;
  tables: Tables;
  net: Pick<RoomClient, 'on'>;
  sfx: Pick<typeof SfxApi, 'play'>;
  music: Pick<typeof MusicApi, 'leaveTheme' | 'start' | 'stop' | 'playTheme' | 'forRound'>;
  /** The Menu's Difficulty; a match reads it once, when it is dealt. */
  difficulty: Pick<DifficultySetting, 'get'>;
  unlock(): void;
  alive(): GameTank[];
  foesAlive(): GameTank[];
  me(): GameTank;
  cur(): GameTank;
  surfY(x: number): number;
  talk(id: string, text: string, force?: boolean): void;
  exchange(aId: string, aText: string, bId: string, bText: string): void;
  say(text: string, tone?: string): void;
  keyHint: KeyHintFn;
  windText(): string;
  render(): void;
  renderHUD(): void;
  refreshNavHints(): void;
  fxMuzzle(sys: FxSys | null, wkey: string, x: number, y: number, ang: number): void;
  fxImpact(sys: FxSys | null, key: string, x: number, y: number, r: number): number | undefined;
  fxSpecial(sys: FxSys | null, key: string, name: string, x: number, y: number, ang: number, len?: number): void;
  fxTrail(sys: FxSys | null, s: Shell, dt: number, x?: number, y?: number, vx?: number, vy?: number, wkey?: string): void;
  closeGuns(): boolean;
  closePreview(): void;
  hideShop(): void;
  openShop(): void;
  endTutorial(seen: boolean): void;
  maybeStartTutorial(): void;
  tutorialFired(): void;
  /** Back to the title card over a fresh demo. */
  backToTitle(): void;
  netFire(): void;
  netLeave(quiet?: boolean): void;
  netNext(want?: boolean): void;
  /** Play again: the room goes back to its lobby with its seats. */
  netAgain(): void;
  /** The player's initials, which a finished solo match is saved under. */
  initials(): string;
  /** Keeps a finished match on this browser's board. */
  saveLocal(level: Difficulty, row: LocalRow): Saved;
}

export function createMatch(deps: MatchDeps) {
  const {
    field, G, $, TOUCH, tables, net, sfx, music, difficulty, unlock, alive, foesAlive, me, cur, surfY, talk, exchange, say, keyHint, windText,
    render, renderHUD, refreshNavHints, fxMuzzle, fxImpact, fxSpecial, fxTrail, closeGuns, closePreview, hideShop, openShop,
    endTutorial, maybeStartTutorial, tutorialFired, backToTitle, netFire, netLeave,
    netNext, netAgain, initials, saveLocal,
  } = deps;

  let fallsDue: FallShow[] = []; // solo landings waiting to be seen to touch down
  let marked = false; // this volley's tracer left its mark
  function resetMatch(seedStr?: string, level?: Difficulty): void {
    fallsDue = []; // a fall still playing out in the last match never speaks in this one
    G.marks.clear();
    G.earth.clear();
    G.fire.clear();
    G.fires = [];
    const seed = (seedStr || '').trim() || ('scorched-' + Math.floor(Math.random() * 9000 + 1000));
    // The Menu's Difficulty, read once per match: a change waits for the next one.
    // A room the host started alone plays at the room's instead, for that match only.
    // The width comes from the screen at the deal and holds until the next one (spec 6.6).
    soloDeal(G, tables.arsenal!, seed, level ?? difficulty.get(), field.deal());
    G.shopSel = 0;
    G.shopQty = 1;
    G.rounds = [];
    G.roundStart = { score: 0, cash: G.cash };
    G.over = false;
    const endVeil = $('end-veil');
    if (endVeil) endVeil.hidden = true; // a new match never sits on the last one's result
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
    G.cam = { z: 1, cx: G.w / 2, cy: H / 2 };
    if ($('round-banner')) $('round-banner')!.hidden = true;
    G.parts = [];
    G.booms = [];
    if (G.fx) G.fx.clear();
    closePreview();
    hideShop();
  }
  /* The solo phase moves live in src/flow.ts: ask it for the next phase. A move
     its table rejects leaves the phase where it was and says so on the console. */
  function advance(event: FlowEvent): void {
    const next = transition(G.phase, event);
    if (next === null) console.warn(`tankity flow: ${event} is not legal in ${G.phase}`);
    else G.phase = next;
  }
  // Attract mode: the crew drives every tank until a human takes over.
  function startDemo(): void {
    resetMatch('scorched-demo');
    G.demo = true;
    G.round = 1;
    advance('demo');
    newRound(`Demo mode. Press Play${TOUCH ? '' : ` (or ${keyHint('global', 'new')})`} to start.`);
    render();
    renderHUD();
  }
  function newMatch(seedStr?: string, level?: Difficulty): void {
    resetMatch(seedStr, level);
    // No round yet: spend the starting stake in the shop first.
    advance('matchStart');
    refreshNavHints(); // the rotate hint shows from the first name card
    music.leaveTheme(); // a new match leaves the demo's theme at once
    startBanner('Round 1. The battery holds these hills.', openShop);
    say(`Match ${G.seed}: $600 stake in your pocket. Buy guns first. The battery holds these hills.`, 'info');
    talk('tank', 'tankity tank! Shopping, then shooting!', true);
  }
  // A fanfare plus a name card, then the game continues. Nothing starts without you.
  function startSolo(seedStr?: string, level?: Difficulty): void {
    closePreview();
    unlock();
    music.start();
    newMatch(seedStr, level);
  }
  function newRound(bannerText?: string, event?: FlowEvent): void {
    fallsDue = [];
    G.marks.clear();
    G.earth.clear();
    G.fire.clear();
    G.fires = [];
    soloMuster(G, tables.arsenal!);
    G.roundStart = { score: G.score, cash: G.cash };
    G.parts = [];
    G.booms = [];
    if (G.fx) G.fx.clear();
    // The soundtrack turns over with the rounds: song follows the round, and
    // the demo always plays the theme.
    if (G.demo) music.playTheme(); else music.forRound(G.round);
    if (event) advance(event);
    closePreview();
    hideShop();
    if ($('end-veil')) $('end-veil')!.hidden = true;
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
      } else {
        advance('foeUp');
        G.thinkT = TUNE.thinkTime;
        const who = opener.isPlayer ? 'Tankity tank' : opener.id;
        say(`Round ${G.round}. Wind ${windText()}. ${who} moves first.`, 'info');
      }
    });
  }
  /* How the earth guns play on the battlefield (earth-fx.ts). */
  const earthFx: EarthFxDeps = {
    fxImpact: (key, x, y, r) => fxImpact(G.fx, key, x, y, r),
    fxSpecial: (key, name, x, y, ang, len) => fxSpecial(G.fx, key, name, x, y, ang, len),
    sound: name => sfx.play(name),
    shake: k => { G.shake = Math.max(G.shake || 0, k); },
    get show() { return G.earth; },
    say: text => say(text, 'info'),
  };
  /* How a napalm pool plays on the battlefield (fire-fx.ts). */
  const fireFx: FireFxDeps = {
    fxImpact: (key, x, y, r) => fxImpact(G.fx, key, x, y, r),
    fxSpecial: (key, name, x, y, ang, len) => fxSpecial(G.fx, key, name, x, y, ang, len),
    sound: name => sfx.play(name),
    get show() { return G.fire; },
  };
  function fireWeapon(t: GameTank, wkey: string): boolean {
    const w = tables.weapons[wkey]!;
    const launch = simFireWeapon(G, tables.arsenal!, t, wkey);
    if (!launch) {
      if (t.isPlayer) { say(`No ${w.name} left! ${TOUCH ? 'Tap Weapons' : `Press ${keyHint('global', 'guns')}`} to swap guns.`, 'info'); sfx.play('click'); }
      return false;
    }
    if (launch.spent) say(`Out of ${w.name}. Back to the Shell.`, 'info');
    // A gunner's tracer line lasts until its next shot.
    G.marks.fired(G.tanks.indexOf(t));
    marked = false;
    // Muzzle effects (the rail's beam among them) fire once per volley, along the barrel.
    fxMuzzle(G.fx, wkey, launch.x, launch.y, launch.ang);
    sfx.play('launch');
    advance('fire');
    if (launch.now.length) playNow(launch.now);
    return true;
  }
  /* A gun with no flight (a beam, a plasma ring) did everything the moment
     it fired: play it, and the turn goes straight to the settle. */
  function playNow(now: readonly StepEvent[]): void {
    for (const e of now) {
      if (e.kind === 'beam') {
        const s = e.shot, ang = Math.atan2(s.y1 - s.y0, s.x1 - s.x0);
        fxSpecial(G.fx, e.wkey, 'beam', s.x0, s.y0, ang, Math.hypot(s.x1 - s.x0, s.y1 - s.y0));
        fxImpact(G.fx, e.wkey, s.x1, s.y1, s.hits.r);
        // Through each unit it struck, at its body (a drone's is up in the air).
        for (const h of s.hits.events) fxSpecial(G.fx, e.wkey, 'pierce', h.tank.x, (h.tank.drawY ?? h.tank.y) + unitHitBox(h.tank).cy - h.tank.y, ang);
        if (s.hits.events.length) sfx.play('boom');
        G.shake = Math.max(G.shake || 0, s.hits.shake * 0.5);
        showHits(s.hits);
      } else if (e.kind === 'ring') {
        const s = e.shot;
        sfx.play('boom');
        const kick = fxImpact(G.fx, e.wkey, s.x, s.y, s.r);
        G.shake = Math.max(G.shake || 0, kick !== undefined ? kick : s.hits.shake);
        showHits(s.hits);
      } else if (e.kind === 'earth') playEarthOp(e.op, G.terrain, e.before, e.x0, e.x1, earthFx, (tables.weapons[e.op.w]?.dmg || 0) > 0);
    }
    G.settleT = TUNE.settleTime;
    advance('shellsLanded');
    settleVolleyFalls();
  }
  function demoBlock(): boolean {
    if (!G.demo) return false;
    if (!G.demoHint) {
      G.demoHint = true;
      say(`Demo mode. Press Play${TOUCH ? '' : ` (or ${keyHint('global', 'new')})`} to take the controls.`, 'info');
    }
    return true;
  }
  function playerFire(): void {
    closeGuns();
    if (net.on) { netFire(); return; }
    if (demoBlock()) return;
    if (G.phase !== 'aim' || !cur().isPlayer || G.over) return;
    closePreview();
    const wkey = G.selected;
    if (fireWeapon(me(), wkey)) {
      tutorialFired();
      talk('tank', pick(TANK_FIRE));
      say(`You fire ${tables.weapons[wkey]!.name}.`, 'info');
    }
    render();
  }
  /* One frame of flight: the sim moves the shells and says what happened, and
     this plays it. */
  function stepShells(dt: number): void {
    for (const e of simStepShells(G, tables.arsenal!, dt)) {
      if (e.kind === 'trail') {
        fxTrail(G.fx, e.shell, dt, e.x, e.y, e.vx, e.vy, e.shell.wkey);
        const mark = tables.weapons[e.shell.wkey]?.gfx?.mark;
        if (mark === 'line' || mark === 'smoke') G.marks.trail(e.shell, G.tanks.indexOf(e.shell.owner as GameTank), e.shell.wkey, mark, e.x, e.y);
      } else if (e.kind === 'mark') {
        G.marks.land(e.shell, e.x, e.y);
        fxImpact(G.fx, e.shell.wkey, e.x, e.y, MARK_R);
        marked = true;
      } else if (e.kind === 'beam' || e.kind === 'ring') playNow([e]);
      else if (e.kind === 'split') fxSpecial(G.fx, e.wkey, 'split', e.x, e.y, e.ang);
      else if (e.kind === 'hop') fxSpecial(G.fx, e.wkey, 'hop', e.x, e.y, e.ang);
      else if (e.kind === 'scatter') fxSpecial(G.fx, e.wkey, 'scatter', e.x, e.y, e.ang);
      else if (e.kind === 'dig') {
        playDigStep(e.wkey, e.x, e.y, e.ang, e.r, e.step, tables.weapons[e.wkey]?.warheads || 0, earthFx);
        if (e.step === 0) {
          G.settleT = TUNE.settleTime;
          advance('shellsLanded');
        }
      } else if (e.kind === 'earth') {
        playEarthOp(e.op, G.terrain, e.before, e.x0, e.x1, earthFx, (tables.weapons[e.op.w]?.dmg || 0) > 0);
        G.settleT = TUNE.settleTime;
        advance('shellsLanded');
      } else if (e.kind === 'fire') {
        lightFire(e.fire);
        G.settleT = TUNE.settleTime;
        advance('shellsLanded');
      } else if (e.kind === 'burn') {
        showBurn(e.hits);
      } else {
        showBlast(e.blast);
        G.settleT = TUNE.settleTime;
        advance('shellsLanded');
      }
    }
    // A parachute opens with the first frame of its unit's fall.
    if (!net.on && tables.arsenal) armChutes(G, tables.arsenal);
    if (!volleyOn(G)) settleVolleyFalls();
  }
  /* A napalm shell's pool lights where it burst: its splash, the embers and
     smoke over it for as long as it burns (the gun's `burn` special), and its
     flames on screen (fire-show.ts). One that spilled away lights nothing. */
  function lightFire(f: Fire): void {
    playBurn(f.wkey, { x: f.col, ground: surfY(f.col), ...f.pool }, f.ticks * f.every / 60, fireFx);
    if (f.pool.x0 > f.pool.x1) say(`The ${tables.weapons[f.wkey]?.name || 'napalm'} runs off and burns out.`, 'info');
  }
  /* A burning pool's tick: one line for the units it burned, then a shield
     that ate the tick and a wreck as any hit's. */
  function showBurn(b: Blast): void {
    const burnt: string[] = [];
    let me = false;
    for (const e of b.events) {
      if (e.kind !== 'wound') continue;
      burnt.push(`${e.tank.isPlayer ? 'YOU' : e.tank.id} ${e.dmg}`);
      if (e.tank.isPlayer) me = true;
    }
    if (burnt.length) say(`The flames burn ${burnt.join(', ')}.`, me ? 'bad' : b.owner.isPlayer ? 'good' : 'info');
    if (me) renderHUD();
    showHits({ ...b, events: b.events.filter(e => e.kind !== 'wound') });
  }
  /* A blast as the sim reports it: the boom, then what it did to each unit in
     the order it happened. */
  function showBlast(b: Blast): void {
    sfx.play('boom');
    const kick = fxImpact(G.fx, b.fx, b.x, b.y, b.r);
    G.shake = Math.max(G.shake || 0, kick !== undefined ? kick : b.shake);
    G.booms.push({ x: b.x, y: b.y, r: b.r, wkey: b.wkey, t: 0, life: gfxLinger(tables.weapons[b.wkey]?.gfx) });
    showHits(b);
  }
  /* What a blast (or a beam, or a plasma ring) did to each unit, in the order it happened. */
  function showHits(b: Blast): void {
    const owner = b.owner;
    for (const e of b.events) {
      const t = e.tank;
      if (e.kind === 'shield') {
        burst(t.x, t.y - 12, '#ffffff', 16, 5);
        say('Shield absorbs the hit!', 'good');
        renderHUD();
      } else if (e.kind === 'arc') {
        fxSpecial(G.fx, b.wkey, 'arc', t.x, t.y - 12, 0);
      } else if (e.kind === 'wound') {
        if (t.isPlayer) {
          say(`Direct hit on YOU for ${e.dmg}! (${e.hp} armor left)`, 'bad');
          exchange('tank', pick(TANK_OWS), owner.id, pick(FOE_HIT[owner.id] || FOE_MISS));
        } else if (owner.isPlayer) {
          say(`Direct hit on ${t.id} for ${e.dmg}! (${e.hp} armor left)`, 'good');
          talk('tank', pick(TANK_HIT), true);
        } else if (e.direct) {
          say(`${owner.id} hits ${t.id} for ${e.dmg}.`, 'info');
        }
      } else {
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
        } else {
          const by = owner.isPlayer ? 'You' : owner.id;
          say(`${by} wreck${owner.isPlayer ? '' : 's'} ${t.id}! (+${TUNE.killBonus})`, 'good');
          exchange(t.id, FOE_DYING[t.id] || '...', 'tank', pick(TANK_HIT));
        }
      }
    }
  }
  /* ---------- turn advance, rounds, shop ---------- */
  /* Says whose turn it is, after soloSettle or soloNextTurn picked it. */
  function announceTurn(): void {
    if (G.over) return;
    const t = cur();
    if (t.isPlayer && !G.demo) {
      advance('playerUp');
      say('Your turn. Aim!', 'info');
    } else {
      advance('foeUp');
      G.thinkT = TUNE.thinkTime;
      say(`${t.isPlayer ? 'Tankity tank' : t.id} is aiming…`, 'info');
      if (Math.random() < 0.4) talk(t.id, pick(FOE_FIRE[t.id] || FOE_MISS));
    }
    render();
    renderHUD();
  }
  /* The falls' picture, every frame: a unit whose ground goes is seen to fall
     at once, and on to where its volley's settle (or a room's server) put it.
     Nothing here decides armor. A settled landing's words, sparks and wreck
     show when its unit is seen to touch down. */
  function fallTanks(dt: number): void {
    if (net.on) fallsDue = []; // a room's falls speak through its own events (room.ts)
    if (simFallTanks(G, dt).some(t => t.isPlayer)) sfx.play('thud');
    if (!fallsDue.length) return;
    const d = dueFalls(G, fallsDue);
    fallsDue = d.pending;
    for (const show of d.due) for (const e of show.events) showFall(e);
    if (d.due.length) renderHUD();
  }
  /* A solo volley's last shell is down: its falls settle once, by the room
     server's rules (sim.ts settleVolley), and then play out. */
  function settleVolleyFalls(): void {
    if (net.on || !tables.arsenal) return;
    fallsDue = fallsDue.concat(settleVolley(G, tables.arsenal));
    fallTanks(0);
  }
  /* A landing as the sim reports it: the words, and a wreck's sparks. */
  function showFall(e: FallEvent): void {
    const t = e.tank;
    if (e.kind === 'wreck') {
      sfx.play('boom');
      burst(t.x, t.y - 12, '#ff5a5a', 26, 7);
      if (e.lastStand) {
        say('Last stand! The wreck detonates!', 'good');
        showBlast(e.lastStand);
      }
      if (t.isPlayer) say('The fall wrecks your tank!', 'bad');
      else if (e.by && e.by.isPlayer) {
        say(`${t.id} falls to pieces in your crater! (+${TUNE.killBonus})`, 'good');
        exchange(t.id, FOE_DYING[t.id] || '...', 'tank', pick(TANK_HIT));
      } else say(`${t.id} falls to pieces.`, 'info');
      return;
    }
    if (e.chute) {
      say(t.isPlayer ? 'Your parachute opens. You float down unhurt.' : `${t.id}'s parachute opens.`, t.isPlayer ? 'good' : 'info');
      return;
    }
    if (t.isPlayer) {
      sfx.play('clank');
      say(e.under ? `A falling unit lands on YOU for ${e.dmg}! (${e.hp} armor left)`
        : `The fall costs you ${e.dmg}! (${e.hp} armor left)`, 'bad');
    } else if (e.by && e.by.isPlayer) {
      say(`${t.id} falls into your crater for ${e.dmg}! (${e.hp} armor left)`, 'good');
    } else {
      say(`${t.id} falls for ${e.dmg}.`, 'info');
    }
  }
  function anyTankFalling(): boolean {
    return simAnyTankFalling(G);
  }
  /* One line of the solo scoreboard: what the round just ended paid. */
  function recordRound(won: boolean): void {
    G.rounds.push({
      round: G.round, won,
      points: G.score - G.roundStart.score,
      kills: me().kills || 0,
      cash: G.cash - G.roundStart.cash,
      lives: G.lives,
    });
  }
  /* The shop's scoreboard in a solo match: the rounds so far. */
  function soloShopBoard(): Board | null {
    return G.rounds.length ? soloBoard(G.rounds, 'shop') : null;
  }
  /* Solo 1-ups (a life per 3000 points, +500 past five lives), with their words.
     The frame calls it, and settle() before and after it settles a round. */
  function checkOneUps(): void {
    if (net.on || G.demo) return;
    for (const up of soloOneUps(G)) {
      if (up.kind === 'life') {
        sfx.play('win');
        say(`1-UP! Extra life! (${up.lives}/${TUNE.maxLives} lives)`, 'good');
        talk('tank', 'Another life! I am basically immortal!', true);
      } else say('Max lives already, so take +500 points instead!', 'good');
    }
  }
  function settle(): void {
    if (G.demo) {
      if (me().hp <= 0) {
        G.armor = maxArmor(G.plate); // a fresh tank next round, plates kept
        say('Demo tank wrecked. Rolling a fresh one.', 'info');
        newRound('Back in! Same hills, fresh tank.', 'tankLost');
        return;
      }
      if (!foesAlive().length) {
        G.armor = me().hp;
        G.round += 1;
        newRound(undefined, 'roundWon');
        return;
      }
      snapTanks(G);
      G.wind = clamp(Math.round(G.wind + gauss(G.rng) * 2), -12, 12);
      soloNextTurn(G);
      announceTurn();
      return;
    }
    // A threshold crossed by the last volley counts before the settle.
    checkOneUps();
    const end = soloSettle(G);
    if (end.kind === 'next') { announceTurn(); return; }
    if (end.kind !== 'matchLost') checkOneUps();
    if (end.kind === 'roundWon') {
      recordRound(true);
      sfx.play('win');
      say(`Round ${G.round} won! +${end.bonus} pts, +$${end.prize}. The battery rebuilds meaner, so spend it wisely.`, 'good');
      exchange('tank', 'tankity tank! Hill claimed!', pick(['reaper', 'wraith', 'spotter']),
        pick(['Lucky shot, treads...', 'The hill was... too hilly...', 'Recharge... revenge...']));
      advance('roundWon');
      startBanner(`Round ${G.round} claimed! Spend the winnings.`, openShop);
      return;
    }
    recordRound(false);
    if (end.kind === 'matchLost') {
      endMatch(false, 'The tank is scrap across these hills. The battery keeps the high ground.');
      return;
    }
    say(`Round ${G.round} goes to the battery. ${G.lives} ${G.lives === 1 ? 'life' : 'lives'} left. Restock and roll again.`, 'bad');
    talk('tank', 'I will be back... after shopping!', true);
    advance('tankLost');
    startBanner(`Round ${G.round} lost. Restock and roll again.`, openShop);
  }
  /* The end veil is a Preact component (src/ui/endveil.tsx); the game keeps what
     it says and which buttons it offers. */
  const END: EndState = { kicker: '', title: '', text: '', score: '', board: null, filed: null, buttons: 'solo' };
  function renderEndVeil(): void {
    const veil = $('end-veil');
    if (!veil) return;
    drawEndVeil(veil, {
      keyHint, ...END,
      onAgain: () => { sfx.play('click'); if (net.on) netAgain(); else backToTitle(); },
      onLeave: () => { sfx.play('click'); netLeave(); },
      onWatch: () => { veil.hidden = true; refreshNavHints(); },
    });
  }
  /* Q while the end card shows; true when it handled the key. */
  function endVeilBack(): boolean {
    const veil = $('end-veil');
    if (!veil || veil.hidden) return false;
    const act = endCardBack(END.buttons);
    if (act === 'watch') { veil.hidden = true; refreshNavHints(); }
    return act !== 'pass';
  }
  function endMatch(won: boolean, text: string): void {
    if (G.demo) { startDemo(); return; }
    if (G.over) return;
    endTutorial(true);
    G.over = true;
    G.won = won;
    advance(won ? 'matchWon' : 'matchLost');
    music.stop();
    hideShop();
    refreshNavHints();
    if (won) sfx.play('win'); else sfx.play('lose');
    say(text, won ? 'good' : 'bad');
    // A finished match is saved on this browser's board: no form, no button, no server.
    const at = new Date().toISOString();
    const saved = saveLocal(G.difficulty, {
      initials: initials(), score: G.score, rounds: G.roundsWon, seed: G.seed, at, kind: 'solo', ref: `solo:${G.seed}:${at}`,
    });
    END.filed = localLine(saved, G.score, G.difficulty);
    const veil = $('end-veil');
    if (veil) {
      END.kicker = won ? 'Match over' : 'Match lost';
      END.title = won ? 'Hills claimed!' : 'Tank down';
      END.text = text;
      END.score = `Score ${G.score} · ${G.roundsWon} rounds won · ${G.round} rounds played · seed ${G.seed}`;
      END.board = G.rounds.length ? { ...soloBoard(G.rounds, 'over'), caption: '', title: '' } : null;
      END.buttons = 'solo';
      renderEndVeil();
      veil.hidden = false;
      refreshNavHints();
      focusEndVeil(veil);
    }
    renderHUD();
  }
  /** The radius a tracer's landing effect is sized to: it has no blast of its own. */
  const MARK_R = 10;
  const BANNER_MS = 1500;
  // Banner timing rides the game clock, never wall time: hidden tabs throttle
  // setTimeout, which used to strand the game on its name card after refocus.
  function startBanner(text: string, done?: (() => void) | null): void {
    const t = $('round-banner-text');
    if (t) t.textContent = text;
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
  function tickBanner(dt: number): void {
    if (G.bannerT <= 0) return;
    G.bannerT -= dt;
    if (G.bannerT > 0) return;
    G.bannerT = 0;
    const b = $('round-banner');
    if (b) b.hidden = true;
    const done = G.bannerDone;
    G.bannerDone = null;
    if (done) done();
  }
  function nextRound(): void {
    if (net.on) { netNext(); return; }
    if (G.phase !== 'shop') return;
    G.round += 1;
    newRound(undefined, 'shopDone');
  }
  /* ---------- drone AI: real ballistic solutions, plus round-scaled error ---------- */
  /* The shooter swings its barrel and power to the plan in plain sight before
     firing, so everyone can watch the shot line up. Longer swings take a bit
     longer, eased at both ends. */
  function aiPlanAim(t: GameTank): void {
    const plan = soloAim(G, tables.arsenal!, t);
    if (plan.tactic) say(`${t.id.toUpperCase()} switches to ${plan.tactic} tactics.`, 'info');
    const swing = Math.max(Math.abs(plan.angle - t.angle), Math.abs(plan.power - t.power));
    t.aim = {
      plan, a0: t.angle, p0: t.power, k: 0,
      dur: clamp(0.45 + swing / 110, 0.5, 1.4),
    };
  }
  /* Advance a planned swing; true once the barrel has sat on the plan for a
     beat, so the final aim reads before the shot leaves. */
  function aiStepAim(t: GameTank, dt: number): boolean {
    const aim = t.aim!;
    const hold = 0.2;
    aim.k = Math.min(aim.dur + hold, aim.k + dt);
    const u = Math.min(1, aim.k / aim.dur);
    const e = u * u * (3 - 2 * u);
    t.angle = aim.a0 + (aim.plan.angle - aim.a0) * e;
    t.power = aim.p0 + (aim.plan.power - aim.p0) * e;
    return aim.k >= aim.dur + hold;
  }
  function aiFire(t: GameTank): void {
    const { wkey, angle, power } = t.aim!.plan;
    t.aim = null;
    t.angle = angle;
    t.power = power;
    talk(t.id, pick(FOE_FIRE[t.id] || FOE_MISS));
    say(`${t.id} fires ${tables.weapons[wkey]!.name}.`, 'info');
    fireWeapon(t, wkey);
    render();
  }
  /* ---------- rendering: bright dusk hillside, no borrowed sprites ---------- */
  /* One blast-disc painter for the war, the room tracers, and the demos. */
  function burst(x: number, y: number, color: string, n: number, spd: number): void {
    for (let i = 0; i < (n || 10); i++) {
      const a = Math.random() * Math.PI * 2;
      const s = (spd || 4) * (0.4 + Math.random());
      G.parts.push({ x, y, vx: Math.cos(a) * s * 10, vy: Math.sin(a) * s * 10 - 30, life: 0.5 + Math.random() * 0.5, color: color || '#ffd75e' });
    }
  }
  /* Battlefield cosmetics decay on wall-clock frames, never on volleys: effects,
   * blast discs, shake, and sparks all finish even after the last shell lands,
  // so nothing freezes over the next turn. */
  function decayFx(dt: number): void {
    if (G.shake > 0) G.shake = Math.max(0, G.shake - dt);
    if (G.fx) { G.fx.wind = G.wind; G.fx.step(dt); }
    G.earth.step(dt);
    G.fire.step(dt);
    G.marks.step(dt);
    for (const bm of G.booms) bm.t += dt;
    G.booms = G.booms.filter(bm => bm.t < bm.life);
    for (const q of G.parts) {
      q.life -= dt;
      q.x += q.vx * dt; q.y += q.vy * dt; q.vy += GRAV * 0.6 * dt;
    }
    G.parts = G.parts.filter(q => q.life > 0);
  }
  /* One step of the war between turns: a drone aims and fires, shells fly, the
     dust settles. */
  function stepWar(dt: number): void {
    if (G.phase === 'think') {
      const t = cur();
      if (!t.aim) aiPlanAim(t);
      G.thinkT -= dt;
      if (aiStepAim(t, dt) && G.thinkT <= 0) aiFire(t);
    } else if (G.phase === 'fly' || G.phase === 'settle') {
      // A volley resolves pellet by pellet: explosions flip us to settle, but
      // stepping continues until every shell has landed or fizzled.
      if (volleyOn(G)) stepShells(dt);
      if (G.phase === 'fly' && !volleyOn(G)) {
        if (marked) say('The tracer marks its path.', 'info');
        else {
          say('Shot fizzles out over the hills.', 'info');
          talk('tank', pick(TANK_MISS));
        }
        G.settleT = 0.6;
        advance('shellsLanded');
      } else if (G.phase === 'settle' && !volleyOn(G)) {
        G.settleT -= dt;
        // The turn waits for every tank to finish falling into its crater, and the earth to settle on screen.
        if (G.settleT <= 0 && !anyTankFalling() && !G.earth.busy()) settle();
      }
    }
  }

  /* One frame of the solo war: `gdt` seconds of game time (the frame's wall
     time times the game speed, src/speed.ts) in fixed SOLO_STEP steps, each
     dropping the tanks and then moving the war on, so the war plays the same
     at any frame rate and any speed; with the player's tank wrecked the
     drones play on at triple that. `speed` raises the steps one frame may
     run to match. Answers the remainder to carry to the next frame. */
  function warFrame(acc: number, gdt: number, speed: number): number {
    return runFixed(acc, gdt * warSpeed(me().hp > 0, G.demo), SOLO_STEP, h => {
      fallTanks(h);
      stepWar(h);
      return !G.over && (G.phase === 'think' || G.phase === 'fly' || G.phase === 'settle');
    }, MAX_STEPS * speed);
  }

  return {
    advance, startDemo, startSolo, demoBlock, playerFire, fallTanks, END, renderEndVeil, startBanner, tickBanner, nextRound,
    stepWar, warFrame, decayFx, soloShopBoard, endVeilBack, checkOneUps,
    /** Solo landings still waiting to be seen (tests read it). */
    fallsPending: () => fallsDue.length,
  };
}
