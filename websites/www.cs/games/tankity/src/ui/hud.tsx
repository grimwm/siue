/* The status bar on top of the frame: Menu, angle, power and fuel, the AMMO,
 * ARMOR, lives and WIND pills, and the match badge ($ | ROUND | PTS solo,
 * ROOM | YOU | ROUND in a room). The game hands in finished values; this draws
 * them and reports a tap on Menu. Labels shorten at narrow widths in game.css;
 * screen readers always hear the full words.
 * Copyright (C) 2026 William Grim
 * SPDX-License-Identifier: GPL-3.0-or-later */
import { render } from 'preact';
import { KeyChip } from '../../../_kit/ui/key-chip.tsx';

export type Badge =
  | { kind: 'solo'; cash: number; round: number; score: number; nextOneUp: number }
  | { kind: 'room'; code: string; seat: string; round: number };

export interface HudProps {
  /** Whose turn it is, as a sentence ("YOU. Aim!"), for screen readers. */
  turn: string;
  angle: string;
  power: string;
  fuel: string;
  /** The loaded gun's count: "∞" or "×2". */
  ammo: string;
  /** Armor: what shows, its maximum (base plus 25 per hull plate; null before
   *  a tank exists), and the rivals' armor in words for screen readers. */
  armor: { shown: string; max: number | null; sr: string };
  /** Lives left; null before a match is dealt. */
  lives: number | null;
  /** "→ 7", "← 3" or "· 0". */
  wind: string;
  badge: Badge | null;
  /** The room server answers. */
  online: boolean;
  /** The room line (hidden on the page, kept for the stats strip), or empty. */
  runStats: string;
  /** The menu is open (the Menu button's aria-expanded). */
  menuOpen: boolean;
  /** The Menu chip's text from the key table ("Q"); empty shows none. */
  menuKey: string;
  onMenu: () => void;
}

const num = (n: number) => n.toLocaleString('en-US');

/** A label that shortens at narrow widths; readers always get the full word. */
function Label({ full, short }: { full: string; short?: string }) {
  if (!short) return <span class="k">{full}</span>;
  return <span class="k"><span class="full">{full}</span><span class="short" aria-hidden="true">{short}</span></span>;
}

function Stat({ id, full, short, value }: { id: string; full: string; short: string; value: string }) {
  return <span class="stat"><Label full={full} short={short} /> <span class="v" id={id}>{value}</span></span>;
}

function MatchBadge({ badge, online }: { badge: Badge | null; online: boolean }) {
  if (!badge) return <span class="seg" id="hud-score">-</span>;
  if (badge.kind === 'room') {
    return (
      <span class="seg" id="hud-score">
        <span>
          <span class="k">ROOM</span> <span class="v">{badge.code}</span>
          <span id="hud-dot" class={`dot ${online ? 'on' : 'off'}`} title={online ? 'room server: connected' : 'room server: not connected'} />
        </span>
        <span><span class="k">YOU</span> <span class="v">{badge.seat}</span></span>
        <span><Label full="ROUND" short="RND" /> <span class="v">{badge.round}</span></span>
      </span>
    );
  }
  return (
    <span class="seg" id="hud-score" title={`Next 1-up at ${num(badge.nextOneUp)} points`}>
      <span class="cash"><span class="v">${num(badge.cash)}</span></span>
      <span><Label full="ROUND" short="RND" /> <span class="v">{badge.round}</span></span>
      <span><span class="v">{num(badge.score)}</span> <span class="k">PTS</span></span>
    </span>
  );
}

export function Hud(p: HudProps) {
  return (
    <>
      <div class="hud" role="group" aria-label="Battle status">
        <span class="sr-only" id="hud-turn" aria-live="polite">{p.turn}</span>
        <div class="hud-row r1">
          <button type="button" id="btn-menu" class="menu-btn" aria-haspopup="dialog" aria-expanded={p.menuOpen}
            onClick={ev => { (ev.currentTarget as HTMLElement).blur(); p.onMenu(); }}>
            <svg class="menu-icon" viewBox="0 0 26 26" aria-hidden="true"><path d="M4 7h18M4 13h18M4 19h18" stroke="currentColor" stroke-width="3" stroke-linecap="round" /></svg>
            <span class="mword">Menu</span>
            {p.menuKey && <KeyChip label={p.menuKey} class="key" at="global:back" decorative />}
          </button>
          <Stat id="hud-angle" full="ANGLE" short="ANG" value={p.angle} />
          <Stat id="hud-power" full="POWER" short="PWR" value={p.power} />
          <Stat id="hud-fuel" full="FUEL" short="FUEL" value={p.fuel} />
        </div>
        <div class="hud-row r2">
          <span class="pill ammo"><span class="k">AMMO</span> <span class="v" id="hud-ammo">{p.ammo}</span></span>
          <span class="pill armor" role="img" title={p.armor.max === null ? undefined : `${p.armor.shown} of ${p.armor.max}`}
            aria-label={`Armor ${p.armor.shown}${p.armor.max === null ? '' : ` of ${p.armor.max}`}${p.armor.sr ? `, ${p.armor.sr}` : ''}`}>
            <Label full="ARMOR" short="ARM" />{' '}
            <span class="v" id="hud-armor">{p.armor.shown}</span>
          </span>
          {p.lives === null
            ? <span class="pill lives" id="hud-lives">-</span>
            : <span class="pill lives" id="hud-lives" role="img" aria-label={`${p.lives} lives`} title={`${p.lives} lives`}><span class="hearts">♥</span> <span class="v">{p.lives}</span></span>}
          <span class="pill wind"><span class="k">WIND</span> <span class="v" id="hud-wind">{p.wind}</span></span>
        </div>
        <div class="hud-row r3"><MatchBadge badge={p.badge} online={p.online} /></div>
        <span class="sr-only" id="hud-server">{p.online ? 'online' : 'offline'}</span>
      </div>
      <p id="run-stats" class="runstats">{p.runStats}</p>
    </>
  );
}

/** Draws (or redraws) the status bar into its element. */
export function renderHud(container: Element, props: HudProps): void {
  render(<Hud {...props} />, container);
}
