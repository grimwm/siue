/* The Walls picker: None, Concrete, Rubber, Spring, Wraparound and Random as
 * pressed buttons, like the Difficulty picker. Anyone who may not change it
 * (a room's guest, the host while a round is played) sees the label alone.
 * The menu (solo's own setting, or the room's) and the room lobby draw it.
 * No key is bound here.
 * Copyright (C) 2026 William Grim
 * SPDX-License-Identifier: GPL-3.0-or-later */
import { render } from 'preact';
import { blurThen } from './chrome.tsx';
import { WALL_NAMES, WALL_SETTINGS } from '../walls.ts';
import type { WallsSetting } from '../walls.ts';

/** What each pick does, for its tooltip. */
const WALL_TIPS: Readonly<Record<WallsSetting, string>> = {
  none: 'No walls: shells fly off the sides',
  concrete: 'Concrete: a shell bursts against the wall',
  rubber: 'Rubber: a shell bounces back, slower',
  spring: 'Spring: a shell bounces back, faster',
  wrap: 'Wraparound: a shell leaves one side and comes in at the other',
  random: 'Random: one of the four walls each round',
};

export interface WallsPickerProps {
  /** The picker's id; the label alone takes `${id}-label`. */
  id: string;
  pick: WallsSetting;
  /** Only the label: the player may not change it now. */
  disabled?: boolean;
  /** Said after the label when disabled ("the host picks"), or empty. */
  why?: string;
  onPick: (w: WallsSetting) => void;
}

export function WallsPicker(p: WallsPickerProps) {
  if (p.disabled) {
    return <p class="hint walls-label" id={`${p.id}-label`}>Walls: {WALL_NAMES[p.pick]}{p.why ? ` (${p.why})` : ''}</p>;
  }
  return (
    <div class="unit-row" role="group" aria-labelledby={`${p.id}-heading`}>
      <span class="unit-label" id={`${p.id}-heading`}>Walls</span>
      <div class="unit-picker walls-picker" id={p.id}>
        {WALL_SETTINGS.map(w => (
          <button type="button" class="unit-choice" key={w} data-walls={w} aria-pressed={p.pick === w} title={WALL_TIPS[w]}
            onClick={blurThen(() => p.onPick(w))}>
            <span>{WALL_NAMES[w]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/** Draws the picker alone (the tests). */
export function renderWallsPicker(container: Element, props: WallsPickerProps): void {
  render(<WallsPicker {...props} />, container);
}
