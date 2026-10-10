/* The status bar over the battlefield: turn, angle, power, fuel, the loaded gun,
 * armor, lives, score, the room-server dot and (for a screen reader) the wind
 * and the run line. The game owns every number and hands in finished text; this
 * draws it, and reports a tap on the gun. The element (.hudbar) stays in
 * index.html. The game redraws only when a value changed, since it asks every
 * frame.
 * Copyright (C) 2026 William Grim
 * SPDX-License-Identifier: GPL-3.0-or-later */
import { render } from 'preact';
import { useLayoutEffect, useRef } from 'preact/hooks';

export interface HudProps {
  /** Whose turn it is, as a sentence ("YOU. Aim!"). */
  turn: string;
  angle: string;
  power: string;
  fuel: string;
  /** For a screen reader; the wind gauge is on the battlefield. */
  wind: string;
  /** The loaded gun: its shell's key (for the icon), "Buckshot ×2", and the rest of the rack for a screen reader. */
  weapon: { key: string; text: string; sr: string } | null;
  /** Armor: what shows, and what a screen reader adds (the rivals' armor). */
  armor: { shown: string; sr: string };
  /** Hearts, and their "3 lives" label. */
  lives: { text: string; title: string };
  /** "$600 · round 1 · 0 pts", and when the next 1-up comes. */
  score: { text: string; title: string };
  /** The room server answers. */
  online: boolean;
  /** The room line (hidden on the page, kept for the stats strip), or empty. */
  runStats: string;
  /** Paints the loaded gun's shell. */
  drawIcon: (canvas: HTMLCanvasElement, weapon: string) => void;
  /** Changes whenever the arsenal the icon is painted from does. */
  arsenalRev: number;
  /** A tap on the loaded gun: the game opens the weapon picker. */
  onWeapon: () => void;
}

function Chip({ weapon, draw, rev }: { weapon: NonNullable<HudProps['weapon']>; draw: HudProps['drawIcon']; rev: number }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => { if (canvas.current) draw(canvas.current, weapon.key); }, [weapon.key, rev]);
  return (
    <span class="chip">
      <canvas class="chip-icon" aria-hidden="true" ref={canvas} />
      {weapon.text}
      {weapon.sr && <span class="sr-only">{weapon.sr}</span>}
    </span>
  );
}

export function Hud(p: HudProps) {
  return (
    <>
      <dl class="hud">
        <div class="sr-only"><dt>Turn</dt><dd id="hud-turn" aria-live="polite">{p.turn}</dd></div>
        <div><dt>Angle</dt><dd id="hud-angle">{p.angle}</dd></div>
        <div><dt>Power</dt><dd id="hud-power">{p.power}</dd></div>
        <div><dt>Fuel</dt><dd id="hud-fuel">{p.fuel}</dd></div>
        <div class="hud-gun">
          <dt class="sr-only">Weapon</dt>
          <dd id="hud-weapon" title="Pick a weapon" onClick={p.onWeapon}>
            {p.weapon ? <Chip weapon={p.weapon} draw={p.drawIcon} rev={p.arsenalRev} /> : '-'}
          </dd>
        </div>
        <div>
          <dt>Armor</dt>
          <dd id="hud-armor">{p.armor.shown}{p.armor.sr && <span class="sr-only">{` ${p.armor.sr}`}</span>}</dd>
        </div>
        <div class="hud-lives"><dt class="sr-only">Lives</dt><dd id="hud-lives" title={p.lives.title || undefined} aria-label={p.lives.title || undefined}>{p.lives.text}</dd></div>
        <div class="hud-score"><dt class="sr-only">Score</dt><dd id="hud-score" title={p.score.title || undefined}>{p.score.text}</dd></div>
        <div class="sr-only"><dt>Wind</dt><dd id="hud-wind">{p.wind}</dd></div>
        <div class="hud-net">
          <dt class="sr-only">Server</dt>
          <dd>
            <span id="hud-dot" class={`dot ${p.online ? 'on' : 'off'}`} title={p.online ? 'room server: connected' : 'room server: not connected'} />
            <span id="hud-server" class="sr-only">{p.online ? 'online' : 'offline'}</span>
          </dd>
        </div>
      </dl>
      <p id="run-stats" class="runstats">{p.runStats}</p>
    </>
  );
}

/** Draws (or redraws) the status bar into its element. */
export function renderHud(container: Element, props: HudProps): void {
  render(<Hud {...props} />, container);
}
