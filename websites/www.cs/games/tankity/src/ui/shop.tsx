/* The field shop: category headings, the free Shell row and a row per item with
 * its Preview and Buy buttons, then the start button (the Ready toggle in a
 * room). The game owns the state (cash, selection, pack count, who is ready) and
 * hands in a finished view of it; this draws it and reports clicks. The veil
 * element (#shop-veil) stays in index.html and the game shows and hides it.
 * Copyright (C) 2026 William Grim
 * SPDX-License-Identifier: GPL-3.0-or-later */
import { render } from 'preact';
import { useLayoutEffect, useRef } from 'preact/hooks';
import { KeyHints, Key, OverlayHead, ScrollKeys } from './chrome.js';
import type { KeyHintFn } from './chrome.js';

/** What a row's icon shows: a weapon's shell or a piece of gear, by key. */
export type ShopIcon = { kind: 'ammo'; w: string } | { kind: 'gear'; g: string };

/** The first row of a category carries its heading. */
export interface ShopHeading { kind: 'cat'; name: string }

interface ShopRowText {
  /** The goods, then (in the numbers' own colour) pack size, price and holdings. */
  name: string;
  vals: string;
  /** The two stat lines under the name. */
  sub: string;
  sub2: string;
  icon: ShopIcon;
}

/** The Shell: always loaded, so it has no number and no Buy button. */
export interface ShopFreeRow extends ShopRowText { kind: 'free'; weapon: string }

export interface ShopItemRow extends ShopRowText {
  kind: 'item';
  /** Position in the whole shelf; passed back to onBuy. */
  index: number;
  selected: boolean;
  locked: boolean;
  /** The Buy button is off: locked, or the chest cannot cover `qty` packs. */
  disabled: boolean;
  /** Packs a click buys; the button reads "Buy ×qty" above one. */
  qty: number;
  /** A shell row has a Preview button for this weapon; gear has none. */
  weapon?: string;
}

export type ShopEntry = ShopHeading | ShopFreeRow | ShopItemRow;

export interface ShopProps {
  keyHint: KeyHintFn;
  /** "Pre-match shop" or "Field shop". */
  title: string;
  /** The war-chest line. */
  cash: string;
  entries: ShopEntry[];
  /** The start button's whole label, key cap included ("Start round 2 (N)",
   *  or "Ready ✓ (N)" in a room). `pressed` is set only in a room, where the
   *  button toggles and reads aria-pressed. */
  next: { label: string; pressed?: boolean };
  /** The room's "n/m ready" line under the list; null outside a room. */
  readyLine: string | null;
  /** Show the Leave room button (inside a room). */
  inRoom: boolean;
  /** Paints a row's icon into its canvas. */
  drawIcon: (canvas: HTMLCanvasElement, icon: ShopIcon) => void;
  /** Changes whenever the arsenal the icons are painted from does; icons repaint then, not on every redraw. */
  arsenalRev: number;
  onBuy: (index: number) => void;
  onPreview: (weapon: string) => void;
  onNext: () => void;
  onLeave: () => void;
}

/** A row's icon, painted when it mounts and again when the arsenal changes
 *  (the game's data can load after the first draw). */
function Icon({ icon, draw, rev }: { icon: ShopIcon; draw: ShopProps['drawIcon']; rev: number }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const which = icon.kind === 'ammo' ? `ammo:${icon.w}` : `gear:${icon.g}`;
  useLayoutEffect(() => { if (canvas.current) draw(canvas.current, icon); }, [which, rev]);
  return <canvas class="shop-icon" aria-hidden="true" ref={canvas} />;
}

function Name({ name, vals }: { name: string; vals: string }) {
  return <div class="shop-name">{`${name} `}<span class="shop-vals">{vals}</span></div>;
}

function Body({ row, draw, rev }: { row: ShopRowText; draw: ShopProps['drawIcon']; rev: number }) {
  return (
    <>
      <Icon icon={row.icon} draw={draw} rev={rev} />
      <div class="shop-item">
        <Name name={row.name} vals={row.vals} />
        <div class="shop-sub">{row.sub}</div>
        <div class="shop-sub">{row.sub2}</div>
      </div>
    </>
  );
}

export function Shop(p: ShopProps) {
  const list = useRef<HTMLUListElement>(null);
  const shownSel = useRef(-1);
  const sel = p.entries.find((e): e is ShopItemRow => e.kind === 'item' && e.selected)?.index ?? -1;
  // Riding the selection with the keys keeps the highlighted row in view.
  // Redraws that leave it alone (buys, pack counts, room polls) keep the scroll.
  useLayoutEffect(() => {
    if (shownSel.current === sel) return;
    shownSel.current = sel;
    list.current?.querySelector('.sel')?.scrollIntoView({ block: 'nearest' });
  });
  const blurThen = (fn: () => void) => (ev: Event) => { (ev.currentTarget as HTMLElement).blur(); fn(); };
  return (
    <KeyHints.Provider value={p.keyHint}>
      <div class="card" role="dialog" aria-modal="true" aria-labelledby="shop-title">
        <OverlayHead kicker="Between rounds" titleId="shop-title" title={p.title} navId="nav-shop" nav={<>
          <span><Key at="shop:selUp" /><Key at="shop:selDown" /> or <Key at="scroll:lineDown" /><Key at="scroll:lineUp" /> move</span>
          <span><Key at="shop:qtyDown" /><Key at="shop:qtyUp" /> packs</span>
          <span><Key at="shop:buy" /> buy · <Key at="shop:preview" /> preview</span>
          <ScrollKeys />
        </>} />
        <p id="shop-cash" class="runstats">{p.cash}</p>
        <ul id="shop-list" class="scores" ref={list}>
          {p.entries.map(e => {
            if (e.kind === 'cat') return <li class="shop-cat" key={`cat:${e.name}`}>{e.name}</li>;
            if (e.kind === 'free') {
              return (
                <li class="shop-free" key="free">
                  <Body row={e} draw={p.drawIcon} rev={p.arsenalRev} />
                  <span class="acts">
                    <button type="button" onClick={blurThen(() => p.onPreview(e.weapon))}>Preview</button>
                  </span>
                </li>
              );
            }
            return (
              <li class={e.selected ? 'sel' : undefined} key={`item:${e.index}`}>
                <Body row={{ ...e, name: `${e.index + 1}. ${e.name}` }} draw={p.drawIcon} rev={p.arsenalRev} />
                <span class="acts">
                  {e.weapon !== undefined && (
                    <button type="button" onClick={blurThen(() => p.onPreview(e.weapon!))}>
                      Preview <Key at="shop:preview" bare />
                    </button>
                  )}
                  <button type="button" disabled={e.disabled} onClick={() => p.onBuy(e.index)}>
                    {e.locked ? 'Locked' : <>{e.qty > 1 ? `Buy ×${e.qty} ` : 'Buy '}<Key at="shop:buy" bare /></>}
                  </button>
                </span>
              </li>
            );
          })}
        </ul>
        <p id="shop-ready" class="runstats" hidden={p.readyLine === null}>{p.readyLine}</p>
        <button type="button" id="shop-next" class="btn-primary" aria-pressed={p.next.pressed}
          onClick={blurThen(p.onNext)}>{p.next.label}</button>
        <button type="button" id="shop-leave" class="btn-leave" title="Leave this game room and go back to the solo hills"
          hidden={!p.inRoom} onClick={blurThen(p.onLeave)}>Leave room</button>
      </div>
    </KeyHints.Provider>
  );
}

/** Draws (or redraws) the shop into its veil. */
export function renderShop(container: Element, props: ShopProps): void {
  render(<Shop {...props} />, container);
}
