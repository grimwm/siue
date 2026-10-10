/* The game menu: the seed box and New Game, the unit and text-size pickers, the
 * sound, music and fullscreen toggles, and the buttons that open the rooms, the
 * tutorial and the scores. The game owns the state (the unit, the text size,
 * what is muted, whether a room is running) and hands in a finished view of it;
 * this draws it and reports clicks. The section element (#menu-overlay) stays
 * in index.html and the game shows and hides it. The seed box is the one thing
 * the page keeps: the game reads and sets its text.
 * Copyright (C) 2026 William Grim
 * SPDX-License-Identifier: GPL-3.0-or-later */
import { render } from 'preact';
import { useLayoutEffect, useRef } from 'preact/hooks';
import { KeyHints, Key, OverlayHead, ScrollKeys, blurThen, useScrollKeep } from './chrome.js';
import type { KeyHintFn } from './chrome.js';

export interface MenuProps {
  keyHint: KeyHintFn;
  /** The × button: the game closes the menu. */
  onClose: () => void;
  /** The New Game button, and Enter in the seed box. */
  onNewGame: () => void;
  onSubmit: () => void;
  /** The unit pickers: bodies with their key, the chosen one, a painter for the thumbnails. */
  units: { key: string; name: string }[];
  unit: string;
  drawUnit: (canvas: HTMLCanvasElement, unit: string) => void;
  onPickUnit: (key: string) => void;
  /** Text sizes: `scale` sizes the sample "Aa" next to each name. */
  sizes: { key: string; name: string; scale: number }[];
  size: string;
  onPickSize: (key: string) => void;
  /** Toggle states (pressed means on). */
  sound: boolean;
  music: boolean;
  fullscreen: boolean;
  onSound: () => void;
  onMusic: () => void;
  onFullscreen: () => void;
  onRandom: () => void;
  onRooms: () => void;
  onTutorial: () => void;
  onScores: () => void;
  /** Show the Leave room button (inside a room). */
  inRoom: boolean;
  onLeave: () => void;
}

function UnitTile({ unit, picked, draw, onPick }: {
  unit: { key: string; name: string }; picked: boolean; draw: MenuProps['drawUnit']; onPick: (key: string) => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => { if (canvas.current) draw(canvas.current, unit.key); }, [unit.key]);
  return (
    <button type="button" class="unit-choice" aria-pressed={picked} title={unit.name} onClick={blurThen(() => onPick(unit.key))}>
      <canvas width={48} height={34} ref={canvas} />
      <span>{unit.name}</span>
    </button>
  );
}

export function Menu(p: MenuProps) {
  const form = useRef<HTMLFormElement>(null);
  // The section scrolls on a short screen; keep it where the player left it.
  useScrollKeep(() => form.current?.parentElement);
  return (
    <KeyHints.Provider value={p.keyHint}>
      <OverlayHead titleId="menu-h" title="Game menu" closeId="menu-close" onClose={p.onClose}
        navId="nav-menu" scrollOnly nav={<ScrollKeys line />} />
      <form id="seed-form" class="menu-grid" action="#" ref={form} onSubmit={ev => { ev.preventDefault(); p.onSubmit(); }}>
        <div class="seed-row">
          <label for="seed-input">Seed</label>
          <input id="seed-input" name="seed" type="text" inputMode="text" autocomplete="off" spellcheck={false}
            placeholder="e.g. bam-bam-01" />
          <button type="button" id="new-game" class="btn-primary" onClick={blurThen(p.onNewGame)}>New Game{' '}<Key at="global:new" bare /></button>
        </div>
        <div class="unit-row" id="unit-row" role="group" aria-labelledby="unit-label">
          <span class="unit-label" id="unit-label">Unit</span>
          <div class="unit-picker" id="unit-picker">
            {p.units.map(u => <UnitTile key={u.key} unit={u} picked={p.unit === u.key} draw={p.drawUnit} onPick={p.onPickUnit} />)}
          </div>
        </div>
        <div class="unit-row" role="group" aria-labelledby="text-label">
          <span class="unit-label" id="text-label">Text</span>
          <div class="unit-picker" id="text-picker">
            {p.sizes.map(t => (
              <button type="button" class="text-choice" key={t.key} aria-pressed={p.size === t.key} title={`${t.name} text`}
                onClick={blurThen(() => p.onPickSize(t.key))}>
                <span class="text-glyph" style={{ fontSize: `${0.75 + (t.scale - 0.9) * 2.5}rem` }}>Aa</span>
                <span>{t.name}</span>
              </button>
            ))}
          </div>
        </div>
        <div class="unit-row" role="group" aria-labelledby="options-label">
          <span class="unit-label" id="options-label">Options</span>
          <div class="unit-picker" id="toggle-picker">
            <button type="button" id="btn-sound" class="unit-choice tile-toggle" aria-pressed={p.sound} title="Toggle sound effects"
              onClick={blurThen(p.onSound)}>
              <svg class="tile-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" stroke="none" />
                <path class="on-only" d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11" />
                <path class="off-only" d="M16.5 9.5l5 5M21.5 9.5l-5 5" />
              </svg>
              <span>Sound <Key at="global:sound" bare /></span>
            </button>
            <button type="button" id="btn-music" class="unit-choice tile-toggle" aria-pressed={p.music} title="Toggle music"
              onClick={blurThen(p.onMusic)}>
              <svg class="tile-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9 18V6l10-2v12" />
                <circle cx="6.5" cy="18" r="2.5" fill="currentColor" />
                <circle cx="16.5" cy="16" r="2.5" fill="currentColor" />
                <path class="off-only" d="M4 3l16 18" />
              </svg>
              <span>Music <Key at="global:music" bare /></span>
            </button>
            <button type="button" id="fullscreen" class="unit-choice tile-toggle" aria-pressed={p.fullscreen} title="Toggle fullscreen"
              onClick={blurThen(p.onFullscreen)}>
              <svg class="tile-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path class="off-only" d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" />
                <path class="on-only" d="M9 4v5H4M20 9h-5V4M15 20v-5h5M4 15h5v5" />
              </svg>
              <span>Fullscreen <Key at="global:fullscreen" bare /></span>
            </button>
          </div>
        </div>
        <button type="button" id="random-run" title="Ignore the seed box and start on a fresh random seed" onClick={blurThen(p.onRandom)}>
          Random seed <Key at="global:random" bare />
        </button>
        <button type="button" id="rooms-open" title="Host or join a multiplayer game room" onClick={blurThen(p.onRooms)}>
          Rooms <Key at="global:rooms" bare />
        </button>
        <button type="button" id="tutorial-open" title="Replay the opening-moves tutorial" onClick={blurThen(p.onTutorial)}>
          Tutorial <Key at="global:tutorial" bare />
        </button>
        <button type="button" id="scores-open" title="High scores, and file your run" onClick={blurThen(p.onScores)}>
          Scores <Key at="global:report" bare />
        </button>
        <button type="button" id="menu-leave" class="btn-leave" title="Leave this game room and go back to the solo hills"
          hidden={!p.inRoom} onClick={blurThen(p.onLeave)}>Leave room</button>
      </form>
    </KeyHints.Provider>
  );
}

/** Draws (or redraws) the menu into its section. */
export function renderMenu(container: Element, props: MenuProps): void {
  render(<Menu {...props} />, container);
}
