/* This match's scoreboard: a room's players by score, or a solo run's rounds.
 * The shop shows it after every round; the end card and the you're-out card
 * show it too. The game hands in finished rows; this lays them out.
 * Copyright (C) 2026 William Grim
 * SPDX-License-Identifier: GPL-3.0-or-later */
import { fmt } from '../standings.ts';
import type { Board } from '../standings.ts';

type RoomBoard = Extract<Board, { kind: 'room' }>;
type SoloBoard = Extract<Board, { kind: 'solo' }>;

function RoomTable({ board }: { board: RoomBoard }) {
  return (
    <table class="board-table">
      <thead><tr><th>#</th><th>Player</th><th class="n">Score</th><th class="n">Rounds</th><th class="n">Kills</th><th class="n">{board.lastHead}</th></tr></thead>
      <tbody>
        {board.rows.map(r => (
          <tr key={r.name} class={[r.you ? 'me' : '', r.out ? 'out' : ''].filter(Boolean).join(' ') || undefined}>
            <td>{r.place}</td>
            <td><span class="pl">{r.name}</span>{r.crown && <span class="crown" aria-label="winner"> ♛</span>}{r.you && <span class="you">YOU</span>}</td>
            <td class="n">{fmt(r.score)}{r.gain && <span class="delta">{r.gain}</span>}</td>
            <td class="n">{r.won}</td>
            <td class="n">{r.kills}</td>
            <td class="n last">{r.last}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function SoloTable({ board }: { board: SoloBoard }) {
  return (
    <table class="board-table">
      <thead><tr><th>Round</th><th class="n">Points</th><th class="n">Kills</th><th class="n">Cash</th><th class="n">Lives</th></tr></thead>
      <tbody>
        {board.rows.map(r => (
          <tr key={r.round} class={r.won ? undefined : 'out'}>
            <td>{r.round}</td><td class="n">{fmt(r.points)}</td><td class="n">{r.kills}</td>
            <td class="n">{`+$${fmt(r.cash)}`}</td><td class="n">{`♥ ${r.lives}`}</td>
          </tr>
        ))}
      </tbody>
      <tfoot><tr><td>Total</td><td class="n">{fmt(board.total.points)}</td><td class="n">{board.total.kills}</td><td /><td /></tr></tfoot>
    </table>
  );
}

export function Standings({ board }: { board: Board }) {
  return (
    <section class="board" aria-label="Standings" tabindex={-1}>
      {board.caption && <div class="kicker">{board.caption}</div>}
      {board.title && <h3 class="board-title">{board.title}</h3>}
      {board.kind === 'room' ? <RoomTable board={board} /> : <SoloTable board={board} />}
    </section>
  );
}
