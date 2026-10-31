/* Operation Tankity: the field shop.
 *
 * The shop's view and what it says: what a pack costs and how many the chest
 * covers, the two stat lines under each row, the Ready line in a room, the
 * line after a purchase, and the props the shop overlay (src/ui/shop.tsx) is
 * drawn from. What a solo purchase does is solo.ts's soloBuy; a room buys
 * through the server (the `netBuy` dep), so both share the same rows. The
 * game's state, the arsenal tables and the page arrive as deps. */
import { burnTicks } from './fire.ts';
import type { FlowEvent } from './flow.ts';
import type { GameState, GameTank, Tables } from './game-types.ts';
import type { Board } from './standings.ts';
import type { RoomClient } from './net.ts';
import { armorLabel, maxArmor, plateNote, repairNote } from './armor.ts';
import { buyPacks, isOneShot, soloBuy } from './solo.ts';
import { TUNE, clamp } from './sim.ts';
import type { ShopRow, Weapon } from './sim.ts';
import type { sfx as SfxApi } from './audio.ts';
import type { KeyHintFn } from './ui/chrome.tsx';
import { renderShop as drawShop } from './ui/shop.tsx';
import type { ShopEntry, ShopFreeRow } from './ui/shop.tsx';
import { shopNote } from './turn-time.ts';

/** What the shop needs from the page and the rest of the game. */
export interface ShopDeps {
  G: GameState;
  $(id: string): HTMLElement | null;
  tables: Tables;
  net: Pick<RoomClient, 'on' | 'seats' | 'readyNow' | 'shopClockLeft' | 'closeClockLeft'>;
  sfx: Pick<typeof SfxApi, 'play'>;
  me(): GameTank;
  /** A touch screen: no key chips. Asked each draw, since a physical key turns the chips on. */
  touch(): boolean;
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
  /** Fetch these guns' effect sheets ahead of their first shot. */
  preloadFx(keys: readonly string[]): void;
}

/** G.shopSel on the free Shell row, which sits above the shelf's first row. */
export const SHELL_ROW = -1;

/** A gun's first shop line: its damage and what carries it (a blast, which
 *  doubles on a direct hit; a beam's line; a plasma ring), then its note. */
export function ammoSub(w: Pick<Weapon, 'dmg' | 'radius' | 'effect'> & Partial<Pick<Weapon, 'volume' | 'digLen' | 'warheads' | 'subDmg' | 'burn' | 'tick' | 'flame'>>
  & { note?: string }): string {
  const note = w.note ? `, ${w.note.charAt(0).toLowerCase() + w.note.slice(1).replace(/\.$/, '')}` : '';
  const hurt = w.dmg > 0 ? `${w.dmg} damage` : 'No damage';
  if (w.effect === 'dirt') return `${hurt}${w.dmg > 0 ? `, blast ${w.radius}, then` : ','} a mound of dirt ${w.radius} round${note}.`;
  if (w.effect === 'pour') return `${hurt}, ${w.volume || 0} px² of liquid dirt${note}.`;
  if (w.effect === 'dig') {
    return (w.warheads || 0) > 0 ? `${w.warheads} warheads of ${w.subDmg} damage along a ${w.digLen} burrow${note}.` : `${hurt}, burrows ${w.digLen} on${note}.`;
  }
  if (w.effect === 'riot') return `${hurt}, clears the earth ${w.radius} along the barrel${note}.`;
  if (w.effect === 'slump') return `${hurt}, slopes slump within ${w.radius}${note}.`;
  if (w.effect === 'beam') return `${hurt} to every unit on its line${note}.`;
  if (w.effect === 'plasma') return `${w.dmg > 0 ? 'Up to ' + hurt : hurt}, ring ${w.radius} at full power${note}.`;
  if (w.effect === 'tracer') return `${hurt}${note}.`;
  if (w.effect === 'napalm') {
    const ticks = burnTicks(w.burn || 0, w.tick || 0.5);
    return `${w.dmg} damage a tick, ${ticks} ticks, to all in a burning pool of ${w.volume || 0} px²${note}.`;
  }
  return `${hurt}, blast ${w.radius}${note}.${w.dmg > 0 ? ' Direct hits count double.' : ''}`;
}
export function createShop(deps: ShopDeps) {
  const {
    G, $, tables, net, sfx, me, touch, keyHint, say, advance, render, renderHUD, refreshNavHints,
    drawShellIcon, drawGearIcon, openPreview, nextRound, openLeaveVeil, netBuy, board, preloadFx,
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
    // The round starts: whatever is in the rack gets its effects ready.
    const rack = G.ammo || {};
    preloadFx(['shell', ...Object.keys(rack).filter(k => (rack[k] || 0) > 0)]);
  }
  /* The shop is a Preact component (src/ui/shop.tsx) drawn into #shop-veil. This
     builds what it shows from the game's state and wires its clicks back; the
     component keeps no state of its own. In a room the start button is the Ready
     toggle: pressed reads "Ready ✓", and a line under it counts who is ready and
     the time left before the shop closes on its own (the room's shop clock),
     or before the room itself closes when that comes first. */
  function shopReadyView(): { next: { label: string; keyAt?: string; pressed?: boolean }; readyLine: string | null; sig: string } {
    const keyAt = touch() ? undefined : 'shop:next';
    if (!net.on) {
      const label = `Start Round ${G.round + 1}`;
      return { next: { label, keyAt }, readyLine: null, sig: label + '|' + (keyAt ?? '') };
    }
    const mine = net.readyNow();
    const voters = net.seats.filter(s => s.human && s.lives > 0);
    const ready = voters.filter(s => s.ready).length;
    const clock = shopNote(net.shopClockLeft(), net.closeClockLeft());
    const label = mine ? 'Ready ✓' : 'Ready';
    const status = `${ready}/${voters.length} ready${clock}`;
    const marks = voters.map(s => `${String(s.name).toUpperCase()}${s.ready ? ' ✓' : ''}`).join('  ');
    return { next: { label, keyAt, pressed: mine }, readyLine: `${status} · ${marks}`, sig: label + '|' + status + '|' + marks + '|' + (keyAt ?? '') };
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
      const unit = packPrice(it);
      // A repair buys only the packs the hull needs and a one-shot trick one, so each prices by those.
      const packs = buyPacks(G, it, qty);
      const total = unit * packs;
      const parts = shopName(it, unit);
      entries.push({
        kind: 'item',
        index: idx,
        name: parts.name,
        vals: `${parts.vals}${packs > 1 ? ` ×${packs} = $${total}` : ''}`,
        sub: shopSub(it),
        sub2: shopSub2(it),
        icon: it.kind === 'ammo' ? { kind: 'ammo', w: it.w! } : { kind: 'gear', g: it.g! },
        selected: idx === G.shopSel,
        disabled: G.cash < total || packs === 0,
        qty: packs,
        weapon: it.kind === 'ammo' ? it.w : undefined,
      });
    });
    drawShop(veil, {
      keyHint,
      title: G.round === 0 ? 'Pre-Match Shop' : 'Field Shop',
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
    const price = packPrice(it);
    if (isOneShot(it)) return G.cash >= price ? 1 : 0;
    return Math.max(0, Math.min(9, Math.floor(G.cash / price)));
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
      return ammoSub(tables.weapons[it.w!]!);
    }
    const g = tables.gear[it.g!];
    return (g && g.note) || it.label!;
  }
  function shopSub2(it: ShopRow): string {
    if (it.kind === 'ammo') {
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
      case 'parachute': {
        const n = G.chutes || 0;
        return n > 0 ? `${n} ${n === 1 ? 'parachute' : 'parachutes'} packed.` : 'No parachute packed.';
      }
      default:
        return it.label;
    }
  }
  function buyItem(it: ShopRow, qty?: number): void {
    qty = clamp(Math.floor(qty || 1), 1, 9);
    const fetchFx = (): void => { if (it.kind === 'ammo' && it.w) preloadFx([it.w]); };
    if (net.on) {
      // A room says the local line first (the server would answer 409), and
      // asks for what the server will sell so the log line is true.
      const packs = buyPacks(G, it, qty);
      if (packs === 0) { say('Armor is full already.', 'info'); return; }
      netBuy(it, packs);
      fetchFx();
      return;
    }
    const lives = G.lives;
    const r = soloBuy(G, it, qty);
    if (!r.ok) {
      if (r.why === 'full') say('Armor is full already.', 'info');
      else say(`That costs $${r.total}, and the chest holds $${G.cash}.`, 'info');
      return;
    }
    sfx.play('cash');
    fetchFx();
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
      case 'parachute':
        say(`Bought ${lots}${it.label}: ${G.chutes} packed.`, 'good');
        break;
      default:
        say(`Bought ${lots}${it.label}.`, 'good');
    }
  }
  /* The keys walk every row: the free Shell (SHELL_ROW) above the priced
  // rows and ones the chest cannot cover, so Preview always
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
