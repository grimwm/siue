/* The turn-time slider: the host's seven stops (Lightning 1 min to 1 week) on
 * a native range input, so Tab reaches it and the arrow keys move it like any
 * other control; its label shows beside it and to screen readers. Anyone who
 * may not change it (a guest) sees the label alone. No key is bound here.
 * Copyright (C) 2026 William Grim
 * SPDX-License-Identifier: GPL-3.0-or-later */
import { render } from 'preact';
import { TURN_STOPS, turnAt, turnIndex, turnLabel } from '../turn-time.ts';

export interface TurnTimeProps {
  /** The range input's id; the label alone takes `${id}-label`. */
  id: string;
  /** The turn time in seconds, one of the stops. */
  secs: number;
  /** Only the label: the player may not change it. */
  disabled?: boolean;
  onChange: (secs: number) => void;
}

export function TurnTime(p: TurnTimeProps) {
  const label = turnLabel(p.secs);
  if (p.disabled) return <p class="hint turn-label" id={`${p.id}-label`}>Turn Time: {label}</p>;
  return (
    <div class="turn-row">
      <label for={p.id}>Turn Time</label>
      <input type="range" id={p.id} class="turn-range" min={0} max={TURN_STOPS.length - 1} step={1} value={turnIndex(p.secs)}
        aria-valuetext={label}
        onInput={ev => p.onChange(turnAt(Number((ev.currentTarget as HTMLInputElement).value)))} />
      <output for={p.id} class="turn-out">{label}</output>
    </div>
  );
}

/** Draws the slider alone (the tests). */
export function renderTurnTime(container: Element, props: TurnTimeProps): void {
  render(<TurnTime {...props} />, container);
}
