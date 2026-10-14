/* Operation Tankity: the weapon picker.
 *
 * Every gun in the arsenal as a tile (greyed out where none are in stock), or
 * with the toggle only the ones in stock, and the keys that move its cursor
 * and load a gun. The picker overlay (src/ui/guns.tsx) draws what this says. In a room
 * a pick goes to the server (the `netPick` dep). The game's state, the
 * arsenal tables and the page arrive as deps. */
import type { GameState, Tables } from './game-types.ts';
import type { RoomClient } from './net.ts';
import { clamp } from './sim.ts';
import { pref, text } from '../../_kit/prefs.ts';
import { browserStorage } from '../../_kit/ports.browser.ts';
import type { sfx as SfxApi } from './audio.ts';
import type { KeyHintFn } from './ui/chrome.tsx';
import { renderGuns as drawGuns } from './ui/guns.tsx';

/** The slice of the game's state the picker reads and writes (main.ts's G). */
export type GunsState = Pick<GameState, 'ammo' | 'selected' | 'over' | 'phase'>;

/** What the picker needs from the page and the rest of the game. */
export interface GunsDeps {
  G: GunsState;
  $(id: string): HTMLElement | null;
  tables: Tables;
  net: Pick<RoomClient, 'on'>;
  sfx: Pick<typeof SfxApi, 'play'>;
  keyHint: KeyHintFn;
  say(text: string, tone?: string): void;
  refreshNavHints(): void;
  renderHUD(): void;
  drawShellIcon(cv: HTMLCanvasElement, wkey: string): void;
  demoBlock(): boolean;
  netPick(w: string): boolean;
}

export function createGuns(deps: GunsDeps) {
  const { G, $, tables, net, sfx, keyHint, say, refreshNavHints, renderHUD, drawShellIcon, demoBlock, netPick } = deps;

  /* The weapon picker's one loader. */
  function selectWeapon(w: string): boolean {
    if (G.over || G.phase === 'shop' || demoBlock()) return false;
    if (net.on) return netPick(w);
    if (!(w === 'shell' || (G.ammo![w] || 0) > 0)) {
      say(`No ${tables.weapons[w]!.name} left in the rack.`, 'info');
      return false;
    }
    G.selected = w;
    sfx.play('click');
    say(`Loaded: ${tables.weapons[w]!.name}.`, 'info');
    renderHUD();
    return true;
  }
  /* The gun picker's fixed keys (arrows, Enter or Space, digits) only mean
  // something while it is open; otherwise the key falls through. */
  function gunGrid(dir: number): true | undefined {
    if (!gunsOpen()) return undefined;
    moveGunCursor(dir);
    return true;
  }
  /* The weapon picker: every gun as a tile. Arrows or J/K move the cursor
     over all of them, empty ones included (their note stays readable); Enter
     or a digit loads, and an empty one only says so. */
  const GUN_COLS = 4;
  let gunCursor = 0;
  /* All guns, or only those in stock: a toggle in the picker, kept in this browser. */
  const showPref = pref('tankity-guns-show', 'all', text, browserStorage());
  const inStockOnly = (): boolean => showPref.get() === 'stock';
  function inStock(w: string): boolean {
    return w === 'shell' || (G.ammo![w] || 0) > 0;
  }
  function rackGuns(): string[] {
    // Each category together, as in the shop; the rack keeps game.yaml order.
    const shelf = tables.arsenal ? tables.arsenal.shelf : tables.order;
    return inStockOnly() ? shelf.filter(inStock) : shelf.slice();
  }
  function toggleStock(): void {
    const at = rackGuns()[gunCursor];
    showPref.set(inStockOnly() ? 'all' : 'stock');
    // The cursor stays on its gun when that gun is still shown, else on the loaded one.
    const guns = rackGuns();
    gunCursor = Math.max(0, guns.indexOf(at && guns.includes(at) ? at : G.selected));
    sfx.play('click');
    renderGuns();
    refreshNavHints();
  }
  function gunsOpen(): boolean {
    const ov = $('gun-overlay');
    return !!ov && !ov.hidden;
  }
  function openGuns(): void {
    if (G.over || G.phase === 'shop' || demoBlock()) return;
    const ov = $('gun-overlay');
    if (!ov) return;
    gunCursor = Math.max(0, rackGuns().indexOf(G.selected));
    renderGuns();
    ov.hidden = false;
    const btn = $('btn-weapon');
    if (btn) btn.setAttribute('aria-expanded', 'true');
    refreshNavHints();
    sfx.play('click');
  }
  function closeGuns(): boolean {
    const ov = $('gun-overlay');
    if (!ov || ov.hidden) return false;
    ov.hidden = true;
    const btn = $('btn-weapon');
    if (btn) btn.setAttribute('aria-expanded', 'false');
    return true;
  }
  /* The weapon picker is a Preact component (src/ui/guns.tsx): the rack as tiles,
     with the cursor the keys move. */
  function renderGuns(): void {
    const section = $('gun-overlay');
    if (!section || !G.ammo) return;
    const guns = rackGuns();
    gunCursor = clamp(gunCursor, 0, guns.length - 1);
    drawGuns(section, {
      keyHint,
      onClose: () => { closeGuns(); },
      tiles: guns.map(w => ({
        key: w,
        name: tables.weapons[w]!.name,
        title: tables.weapons[w]!.note || tables.weapons[w]!.name,
        count: w === 'shell' ? '∞' : `×${G.ammo![w] || 0}`,
        loaded: w === G.selected,
        empty: !inStock(w),
      })),
      cursor: gunCursor,
      inStockOnly: inStockOnly(),
      onToggleStock: toggleStock,
      drawIcon: drawShellIcon,
      arsenalRev: tables.rev,
      onPick: pickGun,
    });
  }
  function pickGun(w: string): void {
    if (!inStock(w)) {
      sfx.play('thud');
      say(`None in stock: ${tables.weapons[w]!.name}. Buy some in the shop.`, 'info');
      return;
    }
    if (selectWeapon(w) !== false) closeGuns();
  }
  function moveGunCursor(d: number): void {
    gunCursor = clamp(gunCursor + d, 0, rackGuns().length - 1);
    sfx.play('click');
    renderGuns();
  }

  /* The cursor, for the keys that act on the tile it is on. */
  const cursorAt = (): number => gunCursor;

  return {
    GUN_COLS, rackGuns, gunsOpen, openGuns, closeGuns, renderGuns, pickGun, moveGunCursor, gunGrid, cursorAt, toggleStock,
  };
}
