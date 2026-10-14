/* Operation Tankity: the high scores.
 *
 * One all-time board per difficulty from scores.php, this player's rows marked,
 * opening on the player's own difficulty with a switcher to the others. The
 * page arrives as deps. */
import { DIFFICULTY_NAMES } from './difficulty.ts';
import type { Difficulty } from './sim.ts';
import { fmt } from './standings.ts';
import type { KeyHintFn } from './ui/chrome.tsx';
import { renderScores as drawScores } from './ui/scores.tsx';

/** A board row as scores.php sends it. */
interface BoardRow { name: string; best: number; banked: number; place: number }

export interface ScoresDeps {
  $(id: string): HTMLElement | null;
  keyHint: KeyHintFn;
  toggleOverlay(id: string, btnId?: string): void;
  initials(): string;
  /** The Menu's Difficulty: the board Scores opens on. */
  difficulty(): Difficulty;
}

export function createScores(deps: ScoresDeps) {
  const { $, keyHint, toggleOverlay, initials, difficulty } = deps;

  const SCORES: { level: Difficulty; rows: { text: string; mine: boolean }[] | null; note: string } = { level: 'normal', rows: null, note: '' };
  function renderScoresOverlay(): void {
    const section = $('report-overlay');
    if (!section) return;
    drawScores(section, {
      keyHint, onClose: () => toggleOverlay('report-overlay', 'scores-open'),
      level: SCORES.level, onLevel: lv => { void loadScores(lv); }, rows: SCORES.rows, note: SCORES.note,
    });
  }
  /* Loads one board. Only the latest load may draw: a slower reply for a board
     the player has since left would otherwise show another difficulty's rows
     under the pressed button. */
  let loads = 0;
  let shown: Difficulty | null = null; // the board SCORES.rows holds
  async function loadScores(level: Difficulty = difficulty()): Promise<void> {
    const me = initials().toUpperCase();
    const mine = ++loads;
    SCORES.level = level;
    try {
      const res = await fetch(`scores.php?difficulty=${level}`, { headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error('http ' + res.status);
      const data = (await res.json()) as { scores?: BoardRow[] };
      if (mine !== loads) return;
      SCORES.rows = (data.scores || []).map(r => ({
        text: `#${r.place} ${r.name} · ${fmt(r.best)} pts · ${r.banked} rounds won`, mine: !!me && r.name.toUpperCase() === me,
      }));
      SCORES.note = `The all-time board on ${DIFFICULTY_NAMES[level]}. Your runs are marked.`;
      shown = level;
    } catch (_) {
      if (mine !== loads) return;
      SCORES.rows = [];
      SCORES.note = 'The score server is out of reach right now.';
      shown = level;
    }
    renderScoresOverlay();
  }
  /* The overlay opens on the player's current difficulty and reads the board afresh: the
     Difficulty may have changed, and a room match files on the server unseen. */
  function openScores(): void {
    SCORES.level = difficulty();
    // The last board read stays up while the fresh one loads, when it is this board's.
    if (shown !== SCORES.level) SCORES.rows = null;
    SCORES.note = 'Loading…';
    renderScoresOverlay();
    void loadScores();
  }

  return { SCORES, renderScoresOverlay, openScores, loadScores };
}
