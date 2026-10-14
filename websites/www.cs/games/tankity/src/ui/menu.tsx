/* The settings menu: the seed box and Play this seed, the unit, text-size and
 * Difficulty pickers, the sound, music, fullscreen and screen-flash toggles, the scores, and
 * Leave room in a room. The game owns the state (the unit, the text size,
 * what is muted, whether a room is running) and hands in a finished view of it;
 * this draws it and reports clicks. The section element (#menu-overlay) stays
 * in index.html and the game shows and hides it. The seed box is the one thing
 * the page keeps: the game reads and sets its text.
 * Copyright (C) 2026 William Grim
 * SPDX-License-Identifier: GPL-3.0-or-later */
import { render } from 'preact';
import { useLayoutEffect, useRef } from 'preact/hooks';
import { KeyHints, Key, OverlayHead, ScrollKeys, blurThen, useScrollKeep } from './chrome.tsx';
import type { KeyHintFn } from './chrome.tsx';
import { TurnTime } from './turn-time.tsx';
import { AlertsButton } from './games.tsx';
import type { AlertsState } from './games.tsx';

export interface MenuProps {
  keyHint: KeyHintFn;
  /** The × button: the game closes the menu. */
  onClose: () => void;
  /** The Play this seed button. */
  onPlaySeed: () => void;
  /** Enter in the seed box. */
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
  /** How well the drones aim: the choices, the saved one. */
  difficulties: { key: string; name: string }[];
  difficulty: string;
  onPickDifficulty: (key: string) => void;
  /** Toggle states (pressed means on). */
  sound: boolean;
  music: boolean;
  fullscreen: boolean;
  /** Screen flashes: the full-screen flash and the large bright blast layers. */
  flashes: boolean;
  onFlashes: () => void;
  onSound: () => void;
  onMusic: () => void;
  onFullscreen: () => void;
  onScores: () => void;
  /** This room match's scoreboard (shown only in a room). */
  onStandings: () => void;
  /** Show the Leave room button (inside a room). */
  inRoom: boolean;
  /** In a room: its turn time, and whether this player (the host) may change it. */
  turn?: { secs: number; host: boolean } | null;
  onTurn?: (secs: number) => void;
  /** In a room: the Turn alerts button. */
  alerts?: { state: AlertsState; onClick: () => void } | null;
  onLeave: () => void;
  /** Quit: end the match and leave the game. */
  onQuit: () => void;
  /** The phone-only row (the deck has no room for them there): Next song, Radio and Help. */
  onNextSong: () => void;
  onRadio: () => void;
  onHelp: () => void;
  radioOpen: boolean;
  helpOpen: boolean;
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
      <OverlayHead titleId="menu-h" title="Settings" closeId="menu-close" onClose={p.onClose}
        navId="nav-menu" scrollOnly nav={<ScrollKeys line />} />
      <form id="seed-form" class="menu-grid" action="#" ref={form} onSubmit={ev => { ev.preventDefault(); p.onSubmit(); }}>
        <div class="seed-row">
          <label for="seed-input">Seed</label>
          <input id="seed-input" name="seed" type="text" inputMode="text" autocomplete="off" spellcheck={false}
            placeholder="e.g. bam-bam-01" />
          <button type="button" id="new-game" class="btn-primary" onClick={blurThen(p.onPlaySeed)}>Play this seed{' '}<Key at="global:new" bare /></button>
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
        <div class="unit-row" role="group" aria-labelledby="difficulty-label">
          <span class="unit-label" id="difficulty-label">Difficulty</span>
          <div class="unit-picker" id="difficulty-picker">
            {p.difficulties.map(d => (
              <button type="button" class="unit-choice" key={d.key} data-difficulty={d.key} aria-pressed={p.difficulty === d.key}
                title={`${d.name} drones`} onClick={blurThen(() => p.onPickDifficulty(d.key))}>
                <span>{d.name}</span>
              </button>
            ))}
          </div>
        </div>
        <p class="hint" id="difficulty-hint">How well the drones aim. A change starts with your next match; in a room, the host's setting counts.</p>
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
            <button type="button" id="btn-flashes" class="unit-choice tile-toggle" aria-pressed={p.flashes}
              title="Toggle the screen flash and the brightest parts of big blasts" onClick={blurThen(p.onFlashes)}>
              <svg class="tile-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
                <circle cx="12" cy="12" r="3.5" fill="currentColor" />
                <path class="off-only" d="M4 3l16 18" />
              </svg>
              <span>Screen flashes</span>
            </button>
          </div>
        </div>
        <div class="unit-row phone-extras" role="group" aria-labelledby="extras-label">
          <span class="unit-label" id="extras-label">More</span>
          <div class="unit-picker">
            <button type="button" id="menu-track" class="m-track" onClick={blurThen(p.onNextSong)}>Next song</button>
            <button type="button" id="menu-radio" class="m-radio" aria-expanded={p.radioOpen} onClick={blurThen(p.onRadio)}>Radio</button>
            <button type="button" id="menu-help" class="m-help" aria-expanded={p.helpOpen} onClick={blurThen(p.onHelp)}>Help</button>
          </div>
        </div>
        {p.inRoom && p.turn && (
          <div class="unit-row" id="menu-turn-row">
            <TurnTime id="menu-turn" secs={p.turn.secs} disabled={!p.turn.host} onChange={secs => p.onTurn?.(secs)} />
          </div>
        )}
        {p.inRoom && p.alerts && <AlertsButton id="menu-alerts" state={p.alerts.state} onClick={p.alerts.onClick} />}
        <button type="button" id="scores-open" title="High scores, and file your run" onClick={blurThen(p.onScores)}>
          Scores <Key at="global:report" bare />
        </button>
        <button type="button" id="menu-standings" title="This match's scoreboard" hidden={!p.inRoom}
          onClick={blurThen(p.onStandings)}>Standings</button>
        <button type="button" id="menu-leave" class="btn-leave" title="Leave this game room and go back to the title card"
          hidden={!p.inRoom} onClick={blurThen(p.onLeave)}>Leave room</button>
        <button type="button" id="menu-quit" class="btn-leave"
          title={p.inRoom ? 'Close the game; your room seat waits (Leave room gives it up)' : 'End this match and leave the game'}
          onClick={blurThen(p.onQuit)}>Quit</button>
      </form>
    </KeyHints.Provider>
  );
}

/** Draws (or redraws) the menu into its section. */
export function renderMenu(container: Element, props: MenuProps): void {
  render(<Menu {...props} />, container);
}
