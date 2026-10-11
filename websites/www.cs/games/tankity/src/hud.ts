/* Operation Tankity: the status bar's values.
 *
 * What the status bar (src/ui/hud.tsx) shows: whose turn it is, the angle,
 * power and fuel, the loaded gun and the rest of the rack, armor, lives and
 * score, for a solo match and for a room. The text is kept here, and the bar
 * is redrawn only when it changed, since the loop asks every frame. The
 * game's state, the arsenal tables and the room client arrive as deps. */
import type { GameState, GameTank, MatchState, Tables } from './game-types.js';
import type { RoomClient } from './net.js';
import { renderHud as drawHud } from './ui/hud.js';
import type { HudProps } from './ui/hud.js';

/** The slice of the game's state the status bar reads (game.js's G). */
export type HudState = Pick<GameState, 'tanks' | 'turn' | 'phase' | 'over' | 'ammo' | 'selected' | 'lives' | 'cash' | 'round'
  | 'score' | 'nextOneUp' | 'wind' | 'shield' | 'bunker' | 'jammer' | 'laststand' | 'plate'>;

/** The text the bar shows: HudProps without the parts the game supplies each draw. */
export type HudValues = Omit<HudProps, 'drawIcon' | 'arsenalRev' | 'onWeapon'>;

/** What the status bar needs from the page and the rest of the game. */
export interface HudDeps {
  G: HudState;
  $(id: string): HTMLElement | null;
  tables: Tables;
  net: Pick<RoomClient, 'on'>;
  MATCH: Pick<MatchState, 'myTurn'>;
  me(): GameTank;
  cur(): GameTank;
  myTank(): GameTank | null;
  seatName(seat: number): string;
  drawShellIcon(cv: HTMLCanvasElement, wkey: string): void;
  openGuns(): void;
}

export function createHud(deps: HudDeps) {
  const { G, $, tables, net, MATCH, me, cur, myTank, seatName, drawShellIcon, openGuns } = deps;

  /* The loaded weapon: the shell beside its name. A dozen shells no longer fit on
     one line, so only the loaded gun shows; the rest of the rack is read out for
     screen readers and lives in the weapon picker. */
  function renderLoadout(): void {
    const count = (w: string) => (w === 'shell' ? '∞' : '×' + (G.ammo![w] || 0));
    const rack = tables.order.filter(w => w !== G.selected && ((G.ammo![w] || 0) > 0 || w === 'shell'))
      .map(w => `${tables.weapons[w]!.name} ${count(w)}`).concat(trickChips());
    HUD.weapon = {
      key: G.selected,
      text: `${tables.weapons[G.selected]!.name} ${count(G.selected)}`,
      sr: rack.length ? ` · also ${rack.join(' · ')}` : '',
    };
  }
  /* Fitted tricks ride the HUD beside the shells. In room matches netOnSnapshot
  // keeps these G fields mirrored from the server snapshot. */
  function trickChips(): string[] {
    const chips: string[] = [];
    if (G.shield) chips.push('shield');
    if ((G.bunker || 0) > 0) chips.push(`bunker(${G.bunker})`);
    if ((G.jammer || 0) > 0) chips.push(`jammer(${G.jammer})`);
    if (G.laststand) chips.push('last stand');
    if ((G.plate || 0) > 0) chips.push(`plate(+${25 * G.plate})`);
    return chips;
  }
  /* The status bar is a Preact component (src/ui/hud.tsx). The game keeps the
     text it shows in HUD, and redraws only when that changed: the loop asks every
     frame. Armor carries what the bar leaves to the battlefield (the rivals'
     armor rides over their units) as screen-reader text. */
  const HUD: HudValues = {
    turn: '-', angle: '-', power: '-', fuel: '-', wind: '-', weapon: null,
    armor: { shown: '-', sr: '' }, lives: { text: '-', title: '' }, score: { text: '-', title: '' },
    online: false, runStats: '',
  };
  let hudShown = '';
  function paintHud(): void {
    const bar = $('hud-bar');
    if (!bar) return;
    const sig = JSON.stringify(HUD) + '|' + tables.rev;
    if (sig === hudShown) return;
    hudShown = sig;
    drawHud(bar, { ...HUD, drawIcon: drawShellIcon, arsenalRev: tables.rev, onWeapon: openGuns });
  }
  function renderStanding(mine: GameTank | null, others: string): void {
    HUD.armor = {
      shown: mine ? `${Math.max(0, Math.round(mine.hp))}` : '-',
      sr: `${mine ? `you ${Math.max(0, Math.round(mine.hp))} · ` : ''}${others}`,
    };
    HUD.lives = { text: '♥'.repeat(Math.max(0, G.lives)), title: `${G.lives} lives` };
    HUD.score = { text: `$${G.cash} · round ${G.round} · ${G.score} pts`, title: `Next 1-up at ${G.nextOneUp} points` };
  }
  function windText(): string {
    if (G.wind === 0) return '· 0';
    return (G.wind > 0 ? '→ ' : '← ') + Math.abs(G.wind);
  }
  function renderHUD(): void {
    if (net.on) { renderNetHUD(); return; }
    if (!G.tanks.length) return;
    const t = cur() || me();
    HUD.turn =
      G.phase === 'shop' ? 'shop. Spend it!' :
      G.over ? 'match over' :
      G.phase === 'banner' ? 'get ready...' :
      t.isPlayer ? (G.phase === 'aim' ? 'YOU. Aim!' : 'you fired…') : `${t.id} aiming…`;
    HUD.angle = `${Math.round(me().angle)}°`;
    HUD.power = `${Math.round(me().power)}`;
    HUD.wind = windText();
    renderLoadout();
    renderStanding(me(), G.tanks.filter(x => !x.isPlayer).map(x => `${x.id}:${Math.max(0, x.hp)}`).join(' '));
    HUD.fuel = `${Math.round(me().fuel)}`;
    paintHud();
  }
  function renderNetHUD(): void {
    if (!G.tanks.length) return;
    const mine = myTank();
    const turnTank = G.tanks[G.turn] || G.tanks[0]!;
    HUD.turn =
      G.phase === 'shop' ? 'shop. Spend it!' :
      G.over ? 'match over' :
      !mine || mine.hp <= 0 ? 'wrecked. Watching ' + seatName(turnTank.seat!) + '...' :
      MATCH.myTurn ? 'YOU. Aim!' : `${seatName(turnTank.seat!)} aiming...`;
    HUD.angle = mine ? `${Math.round(mine.angle)}°` : '-';
    HUD.power = mine ? `${Math.round(mine.power)}` : '-';
    HUD.wind = windText();
    renderLoadout();
    renderStanding(mine, G.tanks.filter(x => !x.isPlayer).map(x => `${seatName(x.seat!)}:${Math.max(0, Math.round(x.hp))}`).join(' '));
    HUD.fuel = mine ? `${Math.round(mine.fuel)}` : '-';
    paintHud();
  }

  return { HUD, paintHud, windText, renderHUD };
}
