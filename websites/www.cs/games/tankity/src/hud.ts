/* Operation Tankity: the status bar's values and the Weapon button's face.
 *
 * What the status bar (src/ui/hud.tsx) shows: the aim numbers, the AMMO,
 * ARMOR, lives and WIND pills and the match badge, solo or room; and what the
 * deck's Weapon button (src/ui/gun-label.tsx) says about the loaded gun. Each
 * redraws only when its text changed, since the loop asks every frame. */
import type { GameState, GameTank, MatchState, Tables } from './game-types.ts';
import { powerText } from './field.ts';
import { maxArmor } from './armor.ts';
import type { RoomClient } from './net.ts';
import { renderHud as drawHud } from './ui/hud.tsx';
import type { HudProps } from './ui/hud.tsx';
import { renderGunLabel as drawGun } from './ui/gun-label.tsx';
import type { GunLabelProps } from './ui/gun-label.tsx';
import { weaponLine, weaponLineSpoken } from './weapon-label.ts';
import type { KeyHintFn } from './ui/chrome.tsx';

/** The slice of the game's state the status bar reads (main.ts's G). */
export type HudState = Pick<GameState, 'tanks' | 'turn' | 'phase' | 'over' | 'ammo' | 'selected' | 'lives' | 'cash' | 'round'
  | 'score' | 'nextOneUp' | 'wind' | 'shield' | 'bunker' | 'jammer' | 'laststand' | 'plate' | 'armor' | 'w'>;

/** The bar's values: HudProps without what the page supplies each draw. */
export type HudValues = Omit<HudProps, 'menuOpen' | 'menuKey' | 'onMenu'>;
type GunValues = Omit<GunLabelProps, 'drawIcon' | 'arsenalRev'>;

/** What the status bar needs from the page and the rest of the game. */
export interface HudDeps {
  G: HudState;
  $(id: string): HTMLElement | null;
  tables: Tables;
  net: Pick<RoomClient, 'on' | 'code' | 'seat'>;
  MATCH: Pick<MatchState, 'myTurn'>;
  me(): GameTank;
  cur(): GameTank;
  myTank(): GameTank | null;
  seatName(seat: number): string;
  drawShellIcon(cv: HTMLCanvasElement, wkey: string): void;
  keyHint: KeyHintFn;
  /** A touch screen: the Menu button shows no key chip. */
  touch: boolean;
  menuOpen(): boolean;
  onMenu(): void;
}

export function createHud(deps: HudDeps) {
  const { G, $, tables, net, MATCH, me, cur, myTank, seatName, drawShellIcon, keyHint, touch, menuOpen, onMenu } = deps;

  const HUD: HudValues = {
    turn: '-', angle: '-', power: '-', fuel: '-', ammo: '-', armor: { shown: '-', max: null, sr: '' }, lives: null,
    wind: '-', badge: null, online: false, runStats: '',
  };
  const GUN: GunValues = { gun: null, name: '-', sr: '', line: '', spoken: '' };

  /* Fitted tricks ride the rack line for readers. In room matches netOnSnapshot
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
  /* The loaded gun: the Weapon button names it with its damage and blast
     size, the AMMO pill counts it, and readers also hear the rest of the rack. */
  function renderLoadout(): void {
    const count = (w: string) => (w === 'shell' ? '∞' : '×' + (G.ammo![w] || 0));
    const rack = tables.order.filter(w => w !== G.selected && ((G.ammo![w] || 0) > 0 || w === 'shell'))
      .map(w => `${tables.weapons[w]!.name} ${count(w)}`).concat(trickChips());
    const w = tables.weapons[G.selected]!;
    HUD.ammo = count(G.selected);
    GUN.gun = G.selected;
    GUN.name = w.name;
    GUN.sr = ` ${count(G.selected)}${rack.length ? ` · also ${rack.join(' · ')}` : ''}`;
    GUN.line = weaponLine(w);
    GUN.spoken = weaponLineSpoken(w);
  }
  let hudShown = '';
  let gunShown = '';
  function paintHud(): void {
    const slot = $('deck-gun');
    const gunSig = JSON.stringify(GUN) + '|' + tables.rev;
    if (slot && gunSig !== gunShown) {
      gunShown = gunSig;
      drawGun(slot, { ...GUN, drawIcon: drawShellIcon, arsenalRev: tables.rev });
    }
    const bar = $('hud-bar');
    if (!bar) return;
    const open = menuOpen();
    const menuKey = touch ? '' : keyHint('global', 'escape');
    const sig = JSON.stringify(HUD) + '|' + open + '|' + menuKey;
    if (sig === hudShown) return;
    hudShown = sig;
    drawHud(bar, { ...HUD, menuOpen: open, menuKey, onMenu });
  }
  /* A rival's armor in words, the way the player's own reads. */
  function foe(x: GameTank): string {
    const name = net.on ? seatName(x.seat!) : x.id;
    return `${name} ${Math.max(0, Math.round(x.hp))} of ${x.maxHp}`;
  }
  function renderStanding(mine: GameTank | null, others: string): void {
    // In the shop the next round's armor is what counts; on the field, the tank's.
    const shop = G.phase === 'shop';
    HUD.armor = {
      shown: shop ? `${G.armor}` : mine ? `${Math.max(0, Math.round(mine.hp))}` : '-',
      max: shop ? maxArmor(G.plate || 0) : mine ? mine.maxHp : null,
      sr: others,
    };
    HUD.lives = G.lives;
    HUD.badge = net.on
      ? { kind: 'room', code: net.code, seat: `P${net.seat + 1}`, round: G.round }
      : { kind: 'solo', cash: G.cash, round: G.round, score: G.score, nextOneUp: G.nextOneUp };
  }
  function windText(): string {
    if (G.wind === 0) return '· 0';
    return (G.wind > 0 ? '→ ' : '← ') + Math.abs(G.wind);
  }
  function renderHUD(): void {
    if (net.on) { renderNetHUD(); return; }
    if (!G.tanks.length) {
      // The pre-match shop opens before any tank is mustered; the standing
      // (armor, lives, badge) still has to follow what is bought there.
      if (G.phase === 'shop') { HUD.turn = 'shop. Spend it!'; renderStanding(null, ''); paintHud(); }
      return;
    }
    const t = cur() || me();
    HUD.turn =
      G.phase === 'shop' ? 'shop. Spend it!' :
      G.over ? 'match over' :
      G.phase === 'banner' ? 'get ready...' :
      t.isPlayer ? (G.phase === 'aim' ? 'YOU. Aim!' : 'you fired…') : `${t.id} aiming…`;
    HUD.angle = `${Math.round(me().angle)}°`;
    HUD.power = powerText(me().power, G.w);
    HUD.wind = windText();
    renderLoadout();
    renderStanding(me(), G.tanks.filter(x => !x.isPlayer).map(foe).join(', '));
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
    HUD.power = mine ? powerText(mine.power, G.w) : '-';
    HUD.wind = windText();
    renderLoadout();
    renderStanding(mine, G.tanks.filter(x => !x.isPlayer).map(foe).join(', '));
    HUD.fuel = mine ? `${Math.round(mine.fuel)}` : '-';
    paintHud();
  }

  return { HUD, paintHud, windText, renderHUD };
}
