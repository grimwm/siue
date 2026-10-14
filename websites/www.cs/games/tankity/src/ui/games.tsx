/* Your games: every room this browser holds a seat in (but the one on
 * screen), where each stands, and Open to go back to it; and the Turn alerts
 * button, which asks for browser notifications from its own click. Shown on
 * the title card and in the rooms lobby. The game owns the rows and what the
 * buttons do; this draws them and reports.
 * Copyright (C) 2026 William Grim
 * SPDX-License-Identifier: GPL-3.0-or-later */
import { render } from 'preact';
import { blurThen } from './chrome.tsx';
import { clockText } from '../turn-time.ts';
import type { LiveRow } from '../games.ts';

/** The Turn alerts button: on, off, blocked (the browser said no) or hidden. */
export type AlertsState = 'on' | 'off' | 'blocked' | 'unsupported';

export interface GamesView {
  rows: LiveRow[];
  alerts: AlertsState;
  /** Seconds since the rows arrived: their clocks count down from then. */
  age: number;
  onOpen: (code: string) => void;
  onAlerts: () => void;
}
export interface YourGamesProps extends GamesView {
  /** The list's id; the alerts button takes `${id}-alerts`. */
  id: string;
}

/** Where a room stands, for its row; `age` is how long ago the row arrived. */
export function gameStatus(r: LiveRow, age: number): string {
  if (r.phase === 'lobby') return 'Waiting in the lobby';
  if (r.phase === 'over') return 'Match over';
  if (r.phase === 'shop') return 'Shop open';
  if (!r.yourTurn) return r.turnName ? `${r.turnName}'s turn` : 'Waiting on another tank';
  const closeLeft = typeof r.closesIn === 'number' ? r.closesIn - age : null;
  const turnLeft = r.turnLeft === null ? null : r.turnLeft - age;
  if (turnLeft !== null && closeLeft !== null && closeLeft < turnLeft) {
    return `Your turn · room closes in ${clockText(closeLeft)} unless someone plays`;
  }
  return turnLeft === null ? 'Your turn' : `Your turn, ${clockText(turnLeft)} left`;
}

export function gameLine(r: LiveRow, age: number): string {
  const who = r.players.join(', ');
  const round = r.phase === 'lobby' ? '' : ` · Round ${r.round}`;
  return `${r.code} · ${who}${round} · ${gameStatus(r, age)}`;
}

const ALERTS_TEXT: Record<Exclude<AlertsState, 'unsupported'>, string> = {
  on: 'Turn alerts: on', off: 'Turn alerts: off', blocked: 'Turn alerts: blocked in this browser',
};
export function AlertsButton({ id, state, onClick }: { id: string; state: AlertsState; onClick: () => void }) {
  if (state === 'unsupported') return null;
  return (
    <button type="button" id={id} class="alerts-btn" aria-pressed={state === 'on'}
      title="A browser notification when it is your turn in a room while this game is open in a tab"
      onClick={blurThen(onClick)}>{ALERTS_TEXT[state]}</button>
  );
}

export function YourGames(p: YourGamesProps) {
  return (
    <section class="your-games" id={p.id} aria-labelledby={`${p.id}-h`}>
      <h3 id={`${p.id}-h`}>Your games</h3>
      <ul class="games-list">
        {p.rows.map(r => (
          <li key={r.code} class={r.yourTurn ? 'game-row your-turn' : 'game-row'}>
            <span class="game-text">{gameLine(r, p.age)}</span>
            <button type="button" class="game-open" title={`Open room ${r.code}`} aria-label={`Open room ${r.code}`} onClick={blurThen(() => p.onOpen(r.code))}>Open</button>
          </li>
        ))}
      </ul>
      <AlertsButton id={`${p.id}-alerts`} state={p.alerts} onClick={p.onAlerts} />
    </section>
  );
}

/** Draws the list alone (the tests). */
export function renderYourGames(container: Element, props: YourGamesProps): void {
  render(<YourGames {...props} />, container);
}
