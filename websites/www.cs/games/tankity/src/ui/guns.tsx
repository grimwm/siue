/* The weapon picker: every gun on the rack as a tile, four across. The game
 * owns the rack, the loaded gun and the cursor and hands in a finished view of
 * them; this draws it and reports a pick. The section element (#gun-overlay)
 * stays in index.html and the game shows and hides it.
 * Copyright (C) 2026 William Grim
 * SPDX-License-Identifier: GPL-3.0-or-later */
import { render } from 'preact';
import { useLayoutEffect, useRef } from 'preact/hooks';
import { KeyHints, Key, OverlayHead, blurThen, useScrollKeep } from './chrome.js';
import type { KeyHintFn } from './chrome.js';

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
}

export interface GunsProps {
  keyHint: KeyHintFn;
  onClose: () => void;
  tiles: GunTile[];
  /** The tile the keys are on. */
  cursor: number;
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
      title={tile.title} onClick={blurThen(() => onPick(tile.key))}>
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
      <OverlayHead titleId="gun-h" title="Weapons" closeId="gun-close" onClose={p.onClose} navId="nav-gun" nav={<>
        <span><Key at="aim:barrelLeft" /><Key at="aim:barrelRight" /><Key at="shop:selUp" /><Key at="shop:selDown" /> or <Key at="scroll:lineDown" /><Key at="scroll:lineUp" /> move</span>
        <span><Key at="shop:buy:1" /> loads</span>
        <span>1-9 load that tile</span>
      </>} />
      <div id="gun-grid" class="gun-grid" role="group" aria-label="Weapons you own" ref={grid}>
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
