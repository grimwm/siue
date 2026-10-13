/* Operation Tankity: the field shop.
 *
 * The shop's rules and its view: what a pack costs and how many the chest
 * covers, the two stat lines under each row, the Ready line in a room, what a
 * purchase does to the player's stock and gear, and the props the shop
 * overlay (src/ui/shop.tsx) is drawn from. A room buys through the server
 * (the `netBuy` dep), so a solo purchase and a room purchase share the same
 * rows. The game's state, the arsenal tables and the page arrive as deps. */
import type { FlowEvent } from './flow.ts';
import type { GameState, GameTank, Tables } from './game-types.ts';
import type { Board } from './standings.ts';
import type { RoomClient } from './net.ts';
import { armorLabel, maxArmor, plateNote, repairNote, repairPacksWanted } from './armor.ts';
import { soloBuy } from './solo.ts';
import { TUNE, clamp } from './sim.ts';
import type { ShopRow } from './sim.ts';
import type { sfx as SfxApi } from './audio.ts';
import type { KeyHintFn } from './ui/chrome.tsx';
import { renderShop as drawShop } from './ui/shop.tsx';
import type { ShopEntry, ShopFreeRow } from './ui/shop.tsx';

/** The shop reads and writes the whole game state; soloBuy needs the referee's slice of it. */
export type ShopState = GameState;

/** What the shop needs from the page and the rest of the game. */
export interface ShopDeps {
  G: ShopState;
  $(id: string): HTMLElement | null;
  tables: Tables;
  net: Pick<RoomClient, 'on' | 'seats' | 'readyNow' | 'shopClockLeft'>;
  sfx: Pick<typeof SfxApi, 'play'>;
  me(): GameTank;
  /** A touch screen: no key chips. */
  touch: boolean;
  keyHint: KeyHintFn;
  say(text: string, tone?: string): void;
  advance(event: FlowEvent): void;
  render(): void;
  renderHUD(): void;
  refreshNavHints(): void;
  drawShellIcon(cv: HTMLCanvasElement, wkey: string): void;
  drawGearIcon(cv: HTMLCanvasElement, gkey: string): void;
  openPreview(wkey: string): void;
  nextRound(): void;
  openLeaveVeil(): void;
  netBuy(it: ShopRow, qty: number): void;
  board(): Board | null;
}

/** G.shopSel on the free Shell row, which sits above the shelf's first row. */
export const SHELL_ROW = -1;

export function createShop(deps: ShopDeps) {
  const {
    G, $, tables, net, sfx, me, touch, keyHint, say, advance, render, renderHUD, refreshNavHints,
    drawShellIcon, drawGearIcon, openPreview, nextRound, openLeaveVeil, netBuy, board,
  } = deps;

  function openShop(): void {
    advance('shopOpen');
    G.shopQty = 1;
    showShop();
    render();
    renderHUD();
  }
  /* Show the veil, then draw: only a shown list is laid out, so only then can
     the highlighted row be scrolled into view (and the nav hints measured). */
  function showShop(): void {
    const veil = $('shop-veil');
    if (veil) veil.hidden = false;
    renderShop();
  }
  function hideShop(): void {
    const veil = $('shop-veil');
    if (veil) veil.hidden = true;
  }
  /* The shop is a Preact component (src/ui/shop.tsx) drawn into #shop-veil. This
     builds what it shows from the game's state and wires its clicks back; the
     component keeps no state of its own. In a room the start button is the Ready
     toggle: pressed reads "Ready ✓", and a line under it counts who is ready and
     the time left before the shop closes on its own (rooms.php ROOM_SHOP_SECS). */
  function shopReadyView(): { next: { label: string; keyAt?: string; pressed?: boolean }; readyLine: string | null; sig: string } {
    const keyAt = touch ? undefined : 'shop:next';
    if (!net.on) {
      const label = `Start round ${G.round + 1}`;
      return { next: { label, keyAt }, readyLine: null, sig: label };
    }
    const mine = net.readyNow();
    const voters = net.seats.filter(s => s.human && s.lives > 0);
    const ready = voters.filter(s => s.ready).length;
    const left = net.shopClockLeft();
    const clock = left === null ? '' : ` · shop closes in ${Math.floor(Math.ceil(left) / 60)}:${String(Math.ceil(left) % 60).padStart(2, '0')}`;
    const label = mine ? 'Ready ✓' : 'Ready';
    const status = `${ready}/${voters.length} ready${clock}`;
    const marks = voters.map(s => `${String(s.name).toUpperCase()}${s.ready ? ' ✓' : ''}`).join('  ');
    return { next: { label, keyAt, pressed: mine }, readyLine: `${status} · ${marks}`, sig: label + '|' + status + '|' + marks };
  }
  /* The start button and ready line as last drawn. The clocks call this every
     frame, so the shop redraws only when what it would show has changed. */
  let shopReadyShown = '';
  function renderShopReady(): void {
    if (G.phase === 'shop' && shopReadyView().sig !== shopReadyShown) renderShop();
  }
  function renderShop(): void {
    const veil = $('shop-veil');
    if (!veil || !G.ammo) return; // no match has dealt a hand yet
    G.shopSel = clamp(G.shopSel || 0, SHELL_ROW, tables.shop.length - 1);
    G.shopQty = clamp(G.shopQty || 1, 1, 9);
    const ready = shopReadyView();
    shopReadyShown = ready.sig;
    const qty = G.shopQty;
    const entries: ShopEntry[] = [];
    let lastCat = '';
    let shellRowShown = false;
    tables.shop.forEach((it, idx) => {
      if (it.cat !== lastCat) {
        lastCat = it.cat;
        entries.push({ kind: 'cat', name: it.cat });
        // The Shell never needs buying, but it is part of the arsenal: it
        // heads the shells with no number and no Buy button.
        if (it.kind === 'ammo' && !shellRowShown) {
          shellRowShown = true;
          entries.push(shellShopRow(G.shopSel === SHELL_ROW));
        }
      }
      const locked = (it.minRound || 0) > G.round;
      const unit = packPrice(it);
      // A repair buys only the packs the hull needs, so it prices by those.
      const packs = it.effect === 'repair' ? Math.min(qty, repairPacksWanted(G.armor, G.plate, it.n)) : qty;
      const total = unit * packs;
      const parts = shopName(it, unit);
      entries.push({
        kind: 'item',
        index: idx,
        name: parts.name,
        vals: `${parts.vals}${packs > 1 ? ` ×${packs} = $${total}` : ''}`,
        sub: shopSub(it),
        sub2: shopSub2(it, locked),
        icon: it.kind === 'ammo' ? { kind: 'ammo', w: it.w! } : { kind: 'gear', g: it.g! },
        selected: idx === G.shopSel,
        locked,
        disabled: locked || G.cash < total || (it.effect === 'repair' && packs === 0),
        qty: packs,
        weapon: it.kind === 'ammo' ? it.w : undefined,
      });
    });
    drawShop(veil, {
      keyHint,
      title: G.round === 0 ? 'Pre-match shop' : 'Field shop',
      cash: G.round === 0
        ? `War chest: $${G.cash} · spend your stake before the first hill`
        : `War chest: $${G.cash} · armor ${G.armor}/${maxArmor(G.plate)} · round ${G.round} cleared`,
      entries,
      board: G.phase === 'shop' ? board() : null,
      next: ready.next,
      readyLine: ready.readyLine,
      inRoom: net.on,
      drawIcon: (canvas, icon) => (icon.kind === 'ammo' ? drawShellIcon(canvas, icon.w) : drawGearIcon(canvas, icon.g)),
      arsenalRev: tables.rev,
      onBuy: idx => buyItem(tables.shop[idx]!, G.shopQty),
      onPreview: openPreview,
      onNext: nextRound,
      onLeave: openLeaveVeil,
    });
    refreshNavHints();
  }
  /* Buy or preview what the keys have highlighted. The Shell row has nothing
     to buy, so B there only says so. */
  function buySelected(): void {
    const row = tables.shop[G.shopSel];
    if (row) buyItem(row, G.shopQty);
    else say(`The ${tables.weapons.shell!.name} is free and always loaded.`, 'info');
  }
  function previewSelected(): boolean {
    const row = tables.shop[G.shopSel];
    const w = row ? (row.kind === 'ammo' ? row.w : undefined) : 'shell';
    if (!w) return false;
    openPreview(w);
    return true;
  }
  /* Every row names the goods on one line and the numbers below it. */
  /* One pack price shared by the menu, the till, and the affordable count. */
  function packPrice(it: ShopRow): number {
    return it.price || 0;
  }
  /* Packs of this row the chest can cover right now, capped at 9. */
  function maxPacks(it: ShopRow): number {
    return Math.max(0, Math.min(9, Math.floor(G.cash / packPrice(it))));
  }
  /* A row's name, then its numbers (pack size, price, what you own, the bulk
     total) in their own colour. */
  function shopName(it: ShopRow, price: number): { name: string; vals: string } {
    if (it.kind === 'ammo') {
      const own = (G.ammo![it.w!] || 0) > 0 ? ` (you own ${G.ammo![it.w!]})` : '';
      return { name: tables.weapons[it.w!]!.name, vals: `×${it.n} ($${price})${own}` };
    }
    return { name: it.label, vals: `($${price})` };
  }
  function shellShopRow(selected: boolean): ShopFreeRow {
    return {
      kind: 'free',
      weapon: 'shell',
      selected,
      name: tables.weapons.shell!.name,
      vals: '∞ (free)',
      sub: shopSub({ kind: 'ammo', w: 'shell' }),
      sub2: 'Always loaded, never runs out.',
      icon: { kind: 'ammo', w: 'shell' },
    };
  }
  /* First stat line: what it does. Second stat line: the deal. Locked rows
  // keep their numbers so the NUKE shows its damage before round 4. */
  function shopSub(it: Pick<ShopRow, 'kind' | 'w' | 'g'> & Partial<Pick<ShopRow, 'label'>>): string {
    if (it.kind === 'ammo') {
      const w = tables.weapons[it.w!]!;
      const note = w.note ? `, ${w.note.charAt(0).toLowerCase() + w.note.slice(1).replace(/\.$/, '')}` : '';
      return `${w.dmg} damage, blast ${w.radius}${note}. Direct hits count double.`;
    }
    const g = tables.gear[it.g!];
    return (g && g.note) || it.label!;
  }
  function shopSub2(it: ShopRow, locked: boolean): string {
    if (it.kind === 'ammo') {
      if (locked) return `Unlocks in round ${it.minRound}.`;
      return `Pack of ${it.n}. You own ${G.ammo![it.w!] || 0}.`;
    }
    switch (it.effect) {
      case 'repair':
        return repairNote(G.armor, G.plate, it.n, G.shopQty || 1);
      case 'fuel': {
        const fuel = G.tanks.length ? Math.round(me().fuel) : TUNE.fuel;
        const banked = G.fuelBank ? `, plus ${G.fuelBank} banked for next round` : '';
        return `Your tank holds ${fuel} fuel${banked}.`;
      }
      case 'plate':
        return plateNote(G.plate);
      case 'shield':
        return G.shield ? 'Shield is up for the next hit.' : 'No shield fitted.';
      case 'extralife':
        return `${G.lives} ${G.lives === 1 ? 'life' : 'lives'} banked (max ${TUNE.maxLives}).`;
      case 'jammer':
        return G.jammer > 0 ? `Jamming for ${G.jammer} more ${G.jammer === 1 ? 'round' : 'rounds'}.` : 'Drones aim straight at you.';
      case 'bunker':
        return G.bunker > 0 ? `Dug in for ${G.bunker} more ${G.bunker === 1 ? 'round' : 'rounds'}.` : 'No bunker dug.';
      case 'laststand':
        return G.laststand ? 'Wreck is rigged to blow.' : 'Wreck is just a wreck.';
      default:
        return it.label;
    }
  }
  function buyItem(it: ShopRow, qty?: number): void {
    qty = clamp(Math.floor(qty || 1), 1, 9);
    if (net.on) {
      // A room says the local line first; the server would answer 409.
      if (it.effect === 'repair' && repairPacksWanted(G.armor, G.plate, it.n) === 0) { say('Armor is full already.', 'info'); return; }
      netBuy(it, qty);
      return;
    }
    const lives = G.lives;
    const r = soloBuy(G, it, qty);
    if (!r.ok) {
      if (r.why === 'locked') say(`That unlocks in round ${it.minRound}.`, 'info');
      else if (r.why === 'full') say('Armor is full already.', 'info');
      else say(`That costs $${r.total}, and the chest holds $${G.cash}.`, 'info');
      return;
    }
    sfx.play('cash');
    const lots = r.qty > 1 ? `${r.qty} × ` : '';
    if (it.kind === 'ammo') say(`Bought ${lots}${it.label}.`, 'good');
    else boughtLine(it, lots, lives);
    // After a buy the pack count only ever drops, down to what the chest
    // can still cover for the highlighted row; the free Shell row has none.
    const row = tables.shop[G.shopSel];
    G.shopQty = row ? Math.max(1, Math.min(G.shopQty, maxPacks(row))) : 1;
    renderShop();
    renderHUD();
  }
  /* What a trick purchase says, from the state soloBuy left. */
  function boughtLine(it: ShopRow, lots: string, livesBefore: number): void {
    switch (it.effect) {
      case 'repair':
      case 'plate':
        say(`Bought ${lots}${it.label}: armor ${armorLabel(G.armor, G.plate)}.`, 'good');
        break;
      case 'fuel':
        say(`Bought ${lots}${it.label}, banked for next round.`, 'good');
        break;
      case 'shield':
        say(`Bought ${it.label}. Next hit bounces off.`, 'good');
        break;
      case 'extralife':
        say(G.lives > livesBefore ? `Bought ${it.label}! (${G.lives}/${TUNE.maxLives} lives)` : 'Max lives already, so take +500 points instead!', 'good');
        break;
      case 'jammer':
        say(`Bought ${it.label}. Drones aim shaky for ${G.jammer} rounds.`, 'good');
        break;
      case 'bunker':
        say(`Bought ${it.label}. Dug in for ${G.bunker} rounds.`, 'good');
        break;
      case 'laststand':
        say(`Bought ${it.label}. Go down glowing.`, 'good');
        break;
      default:
        say(`Bought ${lots}${it.label}.`, 'good');
    }
  }
  /* The keys walk every row: the free Shell (SHELL_ROW) above the priced
  // rows, locked rows and ones the chest cannot cover, so Preview always
  // has a row to act on. Only Buy turns down what cannot be bought. */
  function shopSelect(dir: number): boolean {
    G.shopSel = clamp(G.shopSel + dir, SHELL_ROW, tables.shop.length - 1);
    sfx.play('click');
    renderShop();
    return true;
  }
  /* Qty keys pick how many packs ride on every buy, capped at what the chest
  // can cover for that row. */
  function shopQtyUp(): boolean {
    const row = tables.shop[G.shopSel];
    const max = row ? Math.max(1, maxPacks(row)) : 1;
    if (G.shopQty < max) { G.shopQty++; sfx.play('click'); }
    else sfx.play('thud');
    renderShop();
    return true;
  }
  function shopQtyDown(): boolean {
    if (G.shopQty > 1) {
      G.shopQty--;
      sfx.play('click');
    }
    renderShop();
    return true;
  }

  return { openShop, hideShop, renderShop, renderShopReady, buyItem, buySelected, previewSelected, shopSelect, shopQtyUp, shopQtyDown };
}
