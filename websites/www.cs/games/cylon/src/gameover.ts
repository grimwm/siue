/* Cylon Defense: the game-over panel and the high scores.
 *
 * When a run ends the panel opens: why it ended, the run's KOs and hull, and,
 * if the score earns a place on the weekly board, three spinning initials to
 * record it (the score client in scores.ts does the talking to scores.php);
 * otherwise the board itself. The same board is drawn in the settings panel.
 * This module owns the panel, the initials entry and the board's markup in both
 * places; the run's record, and starting or closing a run, stay the game's.
 *
 * It touches only the elements it is handed. Browser-only: it compiles in the
 * DOM program. */
import type { EndReason } from './state.js';
import type { Game, StateApi } from './types.js';
import type { ScoreConfig, ScoreEntry, ScoresClient } from './scores.js';

export interface GameOverDeps {
  game: Game;
  state: StateApi;
  scores: ScoresClient;
  /** scores.formatHighScoreRows and scores.weeklyResetText. */
  formatHighScoreRows: (list: readonly ScoreEntry[]) => string;
  weeklyResetText: (config: ScoreConfig) => string;
  /** The hull points left (rules.currentHp of the record's hits). */
  currentHp: () => number;
  /** Play Again starts a new run; Close (after a quit) leaves the game off. */
  setGameEnabled: (on: boolean) => void;
  /** Zeroes the score and the hull display. */
  resetRunStats: () => void;
  highScoresEl: HTMLElement | null;
  gameOverEl: HTMLElement | null;
  gameOverReasonEl: HTMLElement | null;
  gameOverKosEl: HTMLElement | null;
  gameOverHitsEl: HTMLElement | null;
  gameOverEntryEl: HTMLElement | null;
  gameOverBoardEl: HTMLElement | null;
  gameOverScoresEl: HTMLElement | null;
  scoreSubmitBtn: HTMLButtonElement | null;
  initialsErrorEl: HTMLElement | null;
  playAgainBtn: HTMLButtonElement | null;
  /** The three initials, in order; an entry is null when mount.html lacks it. */
  initialLetters: (HTMLElement | null)[];
  initialsRoot: HTMLElement | null;
}

export interface GameOver {
  /** Draws the board in the settings panel and on the game-over panel. */
  renderHighScores(list?: readonly ScoreEntry[]): void;
  /** Fetches the board and the config, then redraws. */
  fetchHighScores(): Promise<void>;
  hideGameOver(): void;
  /** Opens the panel for a run that ended for `reason`. */
  showGameOver(reason: EndReason): Promise<void>;
  bindGameOverUi(): void;
}

export function createGameOver(d: GameOverDeps): GameOver {
  const { game, state, scores, formatHighScoreRows, weeklyResetText, currentHp, setGameEnabled, resetRunStats,
    highScoresEl, gameOverEl, gameOverReasonEl, gameOverKosEl, gameOverHitsEl, gameOverEntryEl, gameOverBoardEl,
    gameOverScoresEl, scoreSubmitBtn, initialsErrorEl, playAgainBtn, initialLetters, initialsRoot } = d;

  let activeInitialIdx = 0;

  function renderHighScores(list: readonly ScoreEntry[] = scores.board()): void {
    if (highScoresEl) highScoresEl.innerHTML = formatHighScoreRows(list);
    if (gameOverScoresEl) gameOverScoresEl.innerHTML = formatHighScoreRows(list);
  }

  function showScoreConfig(config: ScoreConfig): void {
    const blurb = weeklyResetText(config);
    ['cylon-weekly-reset', 'cylon-gameover-reset'].forEach((id) => {
      const node = document.getElementById(id);
      if (node) node.textContent = blurb;
    });
  }

  async function fetchHighScores(): Promise<void> {
    const config = await scores.load();
    if (config) showScoreConfig(config);
    renderHighScores();
  }

  /** True when score earns a board slot: open seats, or strictly above the lowest shown. */
  function scoreQualifiesForBoard(score: number): boolean {
    return scores.qualifies(score);
  }

  function readInitialLetter(el: HTMLElement | null): string {
    const ch = ((el && el.textContent) || 'A').toUpperCase().replace(/[^A-Z]/g, '');
    return ch.charAt(0) || 'A';
  }

  function readInitials(): string {
    return initialLetters.map(readInitialLetter).join('').slice(0, 3).padEnd(3, 'A');
  }

  function isBlockedInitials(initials: string): boolean {
    return scores.isBlocked(initials);
  }

  function setInitialsError(message: string): void {
    if (!initialsErrorEl) return;
    if (message) {
      initialsErrorEl.textContent = message;
      initialsErrorEl.hidden = false;
    } else {
      initialsErrorEl.textContent = '';
      initialsErrorEl.hidden = true;
    }
  }

  function setActiveInitial(idx: number): void {
    activeInitialIdx = Math.max(0, Math.min(2, idx));
    initialLetters.forEach((el, i) => {
      if (!el) return;
      el.classList.toggle('is-active', i === activeInitialIdx);
    });
    initialLetters[activeInitialIdx]?.focus();
  }

  function scrollInitial(idx: number, dir: number): void {
    const el = initialLetters[idx];
    if (!el) return;
    const code = readInitialLetter(el).charCodeAt(0) - 65;
    const next = ((code + dir) % 26 + 26) % 26;
    el.textContent = String.fromCharCode(65 + next);
    setInitialsError('');
    setActiveInitial(idx);
  }

  function resetInitials() {
    initialLetters.forEach((el) => {
      if (el) el.textContent = 'A';
    });
    setInitialsError('');
    setActiveInitial(0);
  }

  async function submitHighScore(score: number, initials: string): Promise<boolean> {
    const result = await scores.submit(score, initials, game.run.pendingScore ? game.run.pendingScore.hits : game.run.hitsTaken);
    if (result.saved) {
      setInitialsError('');
    } else if (result.problem === 'invalid-initials') {
      setInitialsError("Those initials aren't valid — choose another.");
    } else if (result.problem === 'save-failed') {
      setInitialsError('Could not save that score. Refresh and play again.');
    }
    renderHighScores();
    return result.saved;
  }

  function syncGameOverDismissButton() {
    if (!playAgainBtn) return;
    const quit = game.run.endReason === 'quit';
    playAgainBtn.textContent = quit ? 'Close' : 'Play Again';
    playAgainBtn.setAttribute(
      'aria-label',
      quit ? 'Close and return to the site' : 'Start a new run'
    );
  }

  function dismissGameOverPanel() {
    if (game.run.endReason === 'quit') {
      hideGameOver();
      game.run = state.clearGameOver(game.run);
      resetRunStats();
      return;
    }
    setGameEnabled(true);
  }

  function hideGameOver() {
    if (gameOverEl) gameOverEl.hidden = true;
    if (gameOverEntryEl) gameOverEntryEl.hidden = false;
    if (gameOverBoardEl) gameOverBoardEl.hidden = true;
    game.run = state.setEndReason(state.clearPendingScore(game.run), null);
  }

  async function showGameOver(reason: EndReason): Promise<void> {
    if (!gameOverEl) return;
    game.run = state.setEndReason(game.run, reason);
    await fetchHighScores();
    const qualifies = scoreQualifiesForBoard(game.run.koScore);
    if (!qualifies) game.run = state.clearPendingScore(game.run);

    const reasons = {
      hits: 'You took too much fire. The eye cooked you.',
      nuke: 'A nuke landed on you. Frak.',
      quit: qualifies ? 'Run ended. Record your score?' : 'Run ended.'
    };
    if (gameOverReasonEl) {
      gameOverReasonEl.textContent = reasons[reason] || 'Run complete.';
    }
    if (gameOverKosEl) gameOverKosEl.textContent = String(game.run.koScore);
    if (gameOverHitsEl) gameOverHitsEl.textContent = String(currentHp());
    if (gameOverEntryEl) gameOverEntryEl.hidden = !qualifies;
    if (gameOverBoardEl) gameOverBoardEl.hidden = qualifies;
    syncGameOverDismissButton();
    gameOverEl.hidden = false;
    if (qualifies && initialLetters[0]) {
      resetInitials();
    }
  }

  function revealHighScoreBoard() {
    if (gameOverEntryEl) gameOverEntryEl.hidden = true;
    if (gameOverBoardEl) gameOverBoardEl.hidden = false;
    syncGameOverDismissButton();
    fetchHighScores();
  }

  function bindGameOverUi() {
    if (initialsRoot) {
      initialsRoot.addEventListener('click', (e) => {
        const spin = (e.target as Element).closest<HTMLElement>('.cylon-initial-spin');
        if (spin) {
          e.preventDefault();
          const idx = Number(spin.dataset.initial);
          const dir = Number(spin.dataset.dir) || 1;
          scrollInitial(idx, dir);
          return;
        }
        const letter = (e.target as Element).closest<HTMLElement>('.cylon-initial');
        if (letter) {
          setActiveInitial(Number(letter.dataset.initial) || 0);
        }
      });

      initialsRoot.addEventListener('wheel', (e) => {
        if (gameOverEntryEl?.hidden) return;
        const slot = (e.target as Element).closest('.cylon-initial-slot');
        if (!slot) return;
        e.preventDefault();
        const letter = slot.querySelector<HTMLElement>('.cylon-initial');
        const idx = letter ? Number(letter.dataset.initial) : activeInitialIdx;
        scrollInitial(idx, e.deltaY < 0 ? 1 : -1);
      }, { passive: false });
    }

    initialLetters.forEach((el, idx) => {
      if (!el) return;
      el.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          scrollInitial(idx, 1);
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          scrollInitial(idx, -1);
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          setActiveInitial(idx - 1);
        } else if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Spacebar') {
          e.preventDefault();
          if (idx < 2) setActiveInitial(idx + 1);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          scoreSubmitBtn?.click();
        }
      });
    });

    if (scoreSubmitBtn) {
      scoreSubmitBtn.addEventListener('click', async () => {
        const initials = readInitials();
        const score = game.run.pendingScore ? game.run.pendingScore.score : game.run.koScore;
        scoreSubmitBtn.disabled = true;
        const ok = await submitHighScore(score, initials);
        scoreSubmitBtn.disabled = false;
        if (!ok) return;
        game.run = state.clearPendingScore(game.run);
        revealHighScoreBoard();
      });
    }

    const scoreSkipBtn = document.getElementById('cylon-score-skip');
    if (scoreSkipBtn) {
      scoreSkipBtn.addEventListener('click', () => {
        game.run = state.clearPendingScore(game.run);
        revealHighScoreBoard();
      });
    }

    if (playAgainBtn) {
      playAgainBtn.addEventListener('click', () => {
        dismissGameOverPanel();
      });
    }
  }

  return { renderHighScores, fetchHighScores, hideGameOver, showGameOver, bindGameOverUi };
}
