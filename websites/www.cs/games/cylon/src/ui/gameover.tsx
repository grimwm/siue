// Cylon Defense: the game-over panel. src/gameover.ts holds the state and
// hands in a finished view of it; this draws it and reports the player's
// choices. Ids and classes are the ones css/gameover.css and the specs use.
import { render } from 'preact';
import { Dialog } from '../../../_kit/ui/dialog.tsx';
import { Button } from '../../../_kit/ui/button.tsx';
import { HsList } from './board.tsx';
import type { HsRow } from '../scores.ts';

export type Board = 'week' | 'alltime';

export interface GameOverProps {
  open: boolean;
  reason: string;
  kos: number;
  hp: number;
  /** 'entry' while the run can still file initials; 'board' after. */
  mode: 'entry' | 'board';
  initials: readonly string[];
  active: number;
  error: string;
  submitting: boolean;
  board: Board;
  rows: readonly HsRow[];
  allTimeRank: number | null;
  resetText: string;
  /** The run was quit: the dismiss button closes the panel instead of starting a run. */
  quit: boolean;
  onSpin(idx: number, dir: 1 | -1): void;
  onPick(idx: number): void;
  onSubmit(): void;
  onSkip(): void;
  onTab(board: Board, focus: boolean): void;
  onDismiss(): void;
}

const TABS: { board: Board; id: string; label: string }[] = [
  { board: 'week', id: 'cylon-tab-week', label: 'This week' },
  { board: 'alltime', id: 'cylon-tab-alltime', label: 'All time' },
];

function Initials(p: GameOverProps) {
  const onKey = (idx: number) => (e: KeyboardEvent): void => {
    if (e.key === 'ArrowUp') p.onSpin(idx, 1);
    else if (e.key === 'ArrowDown') p.onSpin(idx, -1);
    else if (e.key === 'ArrowLeft') p.onPick(idx - 1);
    else if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Spacebar') { if (idx < 2) p.onPick(idx + 1); }
    else if (e.key === 'Enter') p.onSubmit();
    else return;
    e.preventDefault();
  };
  return (
    <div class="cylon-initials" id="cylon-initials" role="group" aria-label="Arcade initials">
      {[0, 1, 2].map(i => (
        <div class="cylon-initial-slot" key={i}
          onWheel={e => { e.preventDefault(); p.onSpin(i, e.deltaY < 0 ? 1 : -1); }}>
          <button type="button" class="cylon-initial-spin" data-initial={i} data-dir="1"
            aria-label={`Scroll initial ${i + 1} up`} onClick={() => p.onSpin(i, 1)}>▲</button>
          <button type="button" class={i === p.active ? 'cylon-initial is-active' : 'cylon-initial'} id={`cylon-initial-${i}`}
            data-initial={i} aria-label={`Initial ${i + 1}, use up and down to change`}
            onClick={() => p.onPick(i)} onKeyDown={onKey(i)}>{p.initials[i]}</button>
          <button type="button" class="cylon-initial-spin" data-initial={i} data-dir="-1"
            aria-label={`Scroll initial ${i + 1} down`} onClick={() => p.onSpin(i, -1)}>▼</button>
        </div>
      ))}
    </div>
  );
}

function Tabs(p: GameOverProps) {
  return (
    <div class="cylon-hs-tabs" role="tablist" aria-label="High score board">
      {TABS.map((t, i) => (
        <button type="button" class="cylon-hs-tab" role="tab" id={t.id} key={t.id} data-board={t.board}
          aria-selected={p.board === t.board ? 'true' : 'false'} tabIndex={p.board === t.board ? 0 : -1}
          aria-controls="cylon-gameover-panel" onClick={() => p.onTab(t.board, false)}
          onKeyDown={e => {
            const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
            const edge = e.key === 'Home' ? 0 : e.key === 'End' ? TABS.length - 1 : -1;
            const to = step ? (i + step + TABS.length) % TABS.length : edge;
            if (to < 0) return;
            e.preventDefault();
            p.onTab(TABS[to]!.board, true);
          }}>{t.label}</button>
      ))}
    </div>
  );
}

export function GameOverPanel(p: GameOverProps) {
  const tab = p.board === 'alltime' ? 'cylon-tab-alltime' : 'cylon-tab-week';
  return (
    <Dialog open={p.open} id="cylon-gameover" veilClass="cylon-gameover" panelClass="cylon-gameover-panel"
      kicker="Cylon defense" kickerClass="cylon-gameover-kicker" titleId="cylon-gameover-title"
      titleClass="cylon-gameover-title" title="Game Over" focusId={p.mode === 'entry' ? 'cylon-initial-0' : 'cylon-play-again'}>
      <p class="cylon-gameover-reason" id="cylon-gameover-reason">{p.reason}</p>
      <p class="cylon-gameover-stats">
        <span><em id="cylon-gameover-kos">{p.kos}</em> KOs</span>
        <span><em id="cylon-gameover-hits">{p.hp}</em> HP</span>
      </p>
      <div class="cylon-gameover-entry" id="cylon-gameover-entry" hidden={p.mode !== 'entry'}>
        <p class="cylon-gameover-entry-label">Enter your initials</p>
        <Initials {...p} />
        <p class="cylon-gameover-entry-hint">↑↓ change letter · ←→ next · Enter submit</p>
        <p class="cylon-gameover-entry-error" id="cylon-initials-error" role="alert" hidden={!p.error}>{p.error}</p>
        <div class="cylon-gameover-actions">
          <Button class="cylon-gameover-btn" id="cylon-score-submit" disabled={p.submitting} onClick={p.onSubmit}>Submit Score</Button>
          <Button class="cylon-gameover-btn is-ghost" id="cylon-score-skip" onClick={p.onSkip}>Skip</Button>
        </div>
      </div>
      <div class="cylon-gameover-board" id="cylon-gameover-board" hidden={p.mode !== 'board'}>
        <p class="cylon-gameover-entry-label">High scores</p>
        <p class="cylon-gameover-alltime" id="cylon-gameover-alltime" role="status" hidden={p.allTimeRank === null}>
          {p.allTimeRank === null ? '' : `New all-time #${p.allTimeRank}!`}
        </p>
        <Tabs {...p} />
        <div role="tabpanel" id="cylon-gameover-panel" aria-labelledby={tab} tabIndex={0}>
          <HsList id="cylon-gameover-scores" rows={p.rows} />
        </div>
        <p class="cylon-gameover-entry-hint" id="cylon-gameover-reset">{p.resetText}</p>
        <Button class="cylon-gameover-btn" id="cylon-play-again" onClick={p.onDismiss}>{p.quit ? 'Close' : 'Play Again'}</Button>
      </div>
    </Dialog>
  );
}

export function renderGameOver(root: Element, props: GameOverProps): void {
  render(<GameOverPanel {...props} />, root);
}
