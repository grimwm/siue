/* Cylon Defense: the game-over panel and the high scores.
 *
 * When a run ends the panel opens: why it ended, the run's KOs and hull, and,
 * if the score earns a place on the board, three spinning initials to file it
 * (scores.ts talks to scores.php); otherwise the board, with This week and All
 * time tabs. This module holds the panel's state and draws it with
 * ui/gameover.tsx; the run's record, and starting or closing a run, stay the
 * game's. Browser-only: DOM program. */
import type { EndReason } from './state.ts';
import type { Game, StateApi } from './types.ts';
import type { ScoreConfig, ScoresClient } from './scores.ts';
import { highScoreRows } from './scores.ts';
import { renderGameOver } from './ui/gameover.tsx';
import type { Board } from './ui/gameover.tsx';
import { renderHsRows } from './ui/board.tsx';

export interface GameOverDeps {
  game: Game;
  state: StateApi;
  scores: ScoresClient;
  weeklyResetText: (config: ScoreConfig) => string;
  /** The hull points left (rules.currentHp of the record's hits). */
  currentHp: () => number;
  /** Play Again starts a new run. */
  setGameEnabled: (on: boolean) => void;
  /** Zeroes the score and the hull display. */
  resetRunStats: () => void;
  /** mount.html's #cylon-gameover-root, where the panel is drawn. */
  root: HTMLElement | null;
  /** The settings panel's weekly list. */
  highScoresEl: HTMLElement | null;
}

export interface GameOver {
  /** Redraws both boards from the scores client. */
  renderHighScores(): void;
  /** Fetches the board and the config, then redraws. */
  fetchHighScores(): Promise<void>;
  hideGameOver(): void;
  /** Opens the panel for a run that ended for `reason`. */
  showGameOver(reason: EndReason): Promise<void>;
  /** The weekly reset sentence, from the server's config once it has loaded. */
  resetText(): string;
}

const REASONS: Record<EndReason, (qualifies: boolean) => string> = {
  hits: () => 'You took too much fire. The eye cooked you.',
  nuke: () => 'A nuke landed on you. Frak.',
  quit: qualifies => (qualifies ? 'Run ended. Record your score?' : 'Run ended.'),
};

export function createGameOver(d: GameOverDeps): GameOver {
  const { game, state, scores } = d;
  let open = false;
  let reason = '';
  let kos = 0;
  let hp = 0;
  let mode: 'entry' | 'board' = 'entry';
  let initials = ['A', 'A', 'A'];
  let active = 0;
  let error = '';
  let submitting = false;
  let board: Board = 'week';
  let allTimeRank: number | null = null;
  let resetBlurb = 'Play often — scores reset every Sunday at midnight Central.';

  function draw(): void {
    if (!d.root) return;
    renderGameOver(d.root, {
      open, reason, kos, hp, mode, initials, active, error, submitting, board, allTimeRank,
      rows: highScoreRows(board === 'alltime' ? scores.alltime() : scores.board()),
      resetText: resetBlurb,
      quit: game.run.endReason === 'quit',
      onSpin: spin, onPick: pick, onSubmit: () => { void submit(); }, onSkip: skip, onTab: selectBoard, onDismiss: dismiss,
    });
  }

  const focus = (id: string): void => { document.getElementById(id)?.focus(); };

  function renderHighScores(): void {
    if (d.highScoresEl) renderHsRows(d.highScoresEl, highScoreRows(scores.board()));
    draw();
  }

  async function fetchHighScores(): Promise<void> {
    const config = await scores.load();
    if (config) {
      resetBlurb = d.weeklyResetText(config);
      const weekly = document.getElementById('cylon-weekly-reset');
      if (weekly) weekly.textContent = resetBlurb;
    }
    renderHighScores();
  }

  function selectBoard(next: Board, withFocus: boolean): void {
    board = next;
    draw();
    if (withFocus) focus(next === 'alltime' ? 'cylon-tab-alltime' : 'cylon-tab-week');
  }

  function pick(idx: number): void {
    active = Math.max(0, Math.min(2, idx));
    draw();
    focus(`cylon-initial-${active}`);
  }

  function spin(idx: number, dir: 1 | -1): void {
    const code = (initials[idx] ?? 'A').charCodeAt(0) - 65;
    const next = String.fromCharCode(65 + ((((code + dir) % 26) + 26) % 26));
    initials = initials.map((c, i) => (i === idx ? next : c));
    error = '';
    pick(idx);
  }

  function showBoard(): void {
    mode = 'board';
    draw();
    // The entry controls just left the page, taking focus with them.
    focus('cylon-play-again');
    void fetchHighScores();
  }

  async function submit(): Promise<void> {
    if (submitting) return;
    const score = game.run.pendingScore ? game.run.pendingScore.score : game.run.koScore;
    const hits = game.run.pendingScore ? game.run.pendingScore.hits : game.run.hitsTaken;
    submitting = true;
    allTimeRank = null;
    draw();
    const result = await scores.submit(score, initials.join(''), hits);
    submitting = false;
    if (result.saved) {
      error = '';
      allTimeRank = result.allTimeRank;
      game.run = state.clearPendingScore(game.run);
      showBoard();
      return;
    }
    if (result.problem === 'invalid-initials') error = "Those initials aren't valid — choose another.";
    else if (result.problem === 'save-failed') error = 'Could not save that score. Refresh and play again.';
    renderHighScores();
  }

  function skip(): void {
    game.run = state.clearPendingScore(game.run);
    showBoard();
  }

  function hideGameOver(): void {
    open = false;
    mode = 'entry';
    allTimeRank = null;
    board = 'week';
    game.run = state.setEndReason(state.clearPendingScore(game.run), null);
    draw();
  }

  function dismiss(): void {
    if (game.run.endReason === 'quit') {
      hideGameOver();
      game.run = state.clearGameOver(game.run);
      d.resetRunStats();
      return;
    }
    d.setGameEnabled(true);
  }

  async function showGameOver(why: EndReason): Promise<void> {
    if (!d.root) return;
    game.run = state.setEndReason(game.run, why);
    await fetchHighScores();
    const qualifies = scores.qualifies(game.run.koScore);
    if (!qualifies) game.run = state.clearPendingScore(game.run);
    reason = REASONS[why](qualifies);
    kos = game.run.koScore;
    hp = d.currentHp();
    mode = qualifies ? 'entry' : 'board';
    initials = ['A', 'A', 'A'];
    active = 0;
    error = '';
    open = true;
    draw();
  }

  return { renderHighScores, fetchHighScores, hideGameOver, showGameOver, resetText: () => resetBlurb };
}
