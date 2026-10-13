/* The weapon picker: every gun as a tile, four across, the ones with none in
 * stock greyed out; a toggle shows all guns or only those in stock. The game
 * owns the rack, the loaded gun, the cursor and the toggle and hands in a
 * finished view of them; this draws it and reports a pick or a toggle. The section element (#gun-overlay)
 * stays in index.html and the game shows and hides it.
 * Copyright (C) 2026 William Grim
 * SPDX-License-Identifier: GPL-3.0-or-later */
import { render } from 'preact';
import { useLayoutEffect, useRef } from 'preact/hooks';
import { KeyHints, Key, OverlayHead, blurThen, useScrollKeep } from './chrome.tsx';
import type { KeyHintFn } from './chrome.tsx';

export interface GunTile {
  /** The weapon's key; passed back to onPick and to drawIcon. */
  key: string;
  name: string;
  /** The tooltip: the weapon's note. */
  title: string;
  /** "∞" or "×3". */
  count: string;
  /** This is the gun now loaded. */
  loaded: boolean;
  /** None in stock: greyed out and aria-disabled, but still focusable so its
   *  note can be read; a pick only tells the player. */
  empty: boolean;
}

export interface GunsProps {
  keyHint: KeyHintFn;
  onClose: () => void;
  tiles: GunTile[];
  /** The tile the keys are on. */
  cursor: number;
  /** The toggle: only the guns in stock (else every gun). */
  inStockOnly: boolean;
  onToggleStock: () => void;
  /** Paints a tile's shell. */
  drawIcon: (canvas: HTMLCanvasElement, weapon: string) => void;
  /** Changes whenever the arsenal the icons are painted from does. */
  arsenalRev: number;
  onPick: (weapon: string) => void;
}

function Tile({ tile, index, cursor, draw, rev, onPick }: {
  tile: GunTile; index: number; cursor: boolean; draw: GunsProps['drawIcon']; rev: number; onPick: (weapon: string) => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => { if (canvas.current) draw(canvas.current, tile.key); }, [tile.key, rev]);
  return (
    <button type="button" class={`unit-choice gun-choice${cursor ? ' cursor' : ''}`} aria-pressed={tile.loaded}
      aria-disabled={tile.empty ? 'true' : undefined} title={tile.empty ? `${tile.title} None in stock.` : tile.title}
      onClick={blurThen(() => onPick(tile.key))}>
      <canvas aria-hidden="true" ref={canvas} />
      <span>{`${index < 9 ? `${index + 1}. ` : ''}${tile.name}`}</span>
      <span class="gun-count">{tile.count}</span>
    </button>
  );
}

export function Guns(p: GunsProps) {
  const grid = useRef<HTMLDivElement>(null);
  // The cursor stays in view as the keys move it. Redraws that leave it alone
  // (a gun loaded, the rack changing) keep the scroll where the player left it.
  useLayoutEffect(() => { grid.current?.querySelector('.cursor')?.scrollIntoView({ block: 'nearest' }); }, [p.cursor]);
  useScrollKeep(() => grid.current?.parentElement, p.cursor);
  return (
    <KeyHints.Provider value={p.keyHint}>
      <OverlayHead titleId="gun-h" title="Weapons" closeId="gun-close" onClose={p.onClose} tools={
        <button type="button" id="gun-stock" class="gun-stock" title="Show every gun, or only the ones in stock"
          onClick={blurThen(p.onToggleStock)}>
          {p.inStockOnly ? 'Show: In stock' : 'Show: All'} <Key at="global:gunStock" bare />
        </button>
      } navId="nav-gun" nav={<>
        <span><Key at="aim:barrelLeft" /><Key at="aim:barrelRight" /><Key at="shop:selUp" /><Key at="shop:selDown" /> or <Key at="scroll:lineDown" /><Key at="scroll:lineUp" /> move</span>
        <span><Key at="shop:buy:1" /> loads</span>
        <span>1-9 load that tile</span>
      </>} />
      <div id="gun-grid" class="gun-grid" role="group" aria-label={p.inStockOnly ? 'Weapons in stock' : 'All weapons'} ref={grid}>
        {p.tiles.map((t, i) => (
          <Tile key={t.key} tile={t} index={i} cursor={i === p.cursor} draw={p.drawIcon} rev={p.arsenalRev} onPick={p.onPick} />
        ))}
      </div>
    </KeyHints.Provider>
  );
}

/** Draws (or redraws) the weapon picker into its section. */
export function renderGuns(container: Element, props: GunsProps): void {
  render(<Guns {...props} />, container);
}
