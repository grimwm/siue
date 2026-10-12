// Cylon Defense: a high-score board's rows. Initials come from the server, so
// they are drawn as text, never as markup. The game-over and settings panels
// both use it.
import { render } from 'preact';
import type { HsRow } from '../scores.ts';

export function HsRows({ rows }: { rows: readonly HsRow[] }) {
  if (!rows.length) return <li class="cylon-hs-empty">No scores yet</li>;
  return (
    <>
      {rows.map(r => (
        <li key={r.rank}>
          <span class="cylon-hs-rank">#{r.rank}</span>
          <strong class="cylon-hs-initials">{r.initials}</strong>
          <span class="cylon-hs-date">{r.date}</span>
          <span class="cylon-hs-score">{r.score} KOs</span>
        </li>
      ))}
    </>
  );
}

export function HsList({ id, rows }: { id: string; rows: readonly HsRow[] }) {
  return <ol class="cylon-high-scores" id={id}><HsRows rows={rows} /></ol>;
}

/** Draws rows into a list element the page already has. */
export function renderHsRows(list: Element, rows: readonly HsRow[]): void {
  render(<HsRows rows={rows} />, list);
}
