/* Operation Tankity: the weapon picker.
 *
 * Every gun on the rack as a tile, for when Q would take a dozen presses; the
 * keys that move its cursor and load a gun, and the plain cycle through the
 * rack. The picker overlay (src/ui/guns.tsx) draws what this says. In a room
 * a pick goes to the server (the `netPick` and `netCycle` deps). The game's
 * state, the arsenal tables and the page arrive as deps. */
import type { GameState, Tables } from './game-types.js';
import type { RoomClient } from './net.js';
import { clamp } from './sim.js';
import type { sfx as SfxApi } from './audio.js';
import type { KeyHintFn } from './ui/chrome.js';
import { renderGuns as drawGuns } from './ui/guns.js';

/** The slice of the game's state the picker reads and writes (game.js's G). */
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
  netCycle(): void;
}

export function createGuns(deps: GunsDeps) {
  const { G, $, tables, net, sfx, keyHint, say, refreshNavHints, renderHUD, drawShellIcon, demoBlock, netPick, netCycle } = deps;

  /* One direct loader for the weapon picker; Q keeps cycling through it. */
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
  /* The weapon picker: every gun on the rack as a tile, for when Q would take
     a dozen presses. Arrows or J/K move the cursor, Enter or a digit loads. */
  const GUN_COLS = 4;
  let gunCursor = 0;
  function rackGuns(): string[] {
    return tables.order.filter(w => w === 'shell' || (G.ammo![w] || 0) > 0);
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
      })),
      cursor: gunCursor,
      drawIcon: drawShellIcon,
      arsenalRev: tables.rev,
      onPick: pickGun,
    });
  }
  function pickGun(w: string): void {
    if (selectWeapon(w) !== false) closeGuns();
  }
  function moveGunCursor(d: number): void {
    gunCursor = clamp(gunCursor + d, 0, rackGuns().length - 1);
    sfx.play('click');
    renderGuns();
  }
  function cycleWeapon(): void {
    if (G.over || G.phase === 'shop') return;
    if (net.on) { netCycle(); return; }
    if (demoBlock()) return;
    const i = tables.order.indexOf(G.selected);
    for (let k = 1; k <= tables.order.length; k++) {
      const w = tables.order[(i + k) % tables.order.length]!;
      if (w === 'shell' || (G.ammo![w] || 0) > 0) {
        G.selected = w;
        sfx.play('click');
        say(`Loaded: ${tables.weapons[w]!.name}.`, 'info');
        renderHUD();
        return;
      }
    }
  }

  /* The cursor, for the keys that act on the tile it is on. */
  const cursorAt = (): number => gunCursor;

  return {
    GUN_COLS, rackGuns, gunsOpen, openGuns, closeGuns, renderGuns, pickGun, moveGunCursor, cycleWeapon, gunGrid, cursorAt,
  };
}
